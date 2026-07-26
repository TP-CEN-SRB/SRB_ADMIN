// ESP32-S3 bin power-supply scheduler
//
// Keeps the original DS3231 RTC wiring/logic from the test sketch, but
// replaces the hardcoded 10-second on/off toggle with a real weekly power
// schedule that's set from the admin dashboard (Bins -> Power Schedule) and
// pushed to every bin controller over MQTT. All bins share one schedule.
//
// Libraries required (install via Arduino Library Manager):
//   - "RTClib" by Adafruit
//   - "PubSubClient" by Nick O'Leary
//   - "ArduinoJson" by Benoit Blanchon (v7)
// "WiFi" and "Preferences" ship with the ESP32 Arduino core, no install needed.
//
// ============================= CONFIGURE ME =================================
// Fill these in with your actual network/broker details before flashing.
// WIFI_* and MQTT_* must match what's already used by the rest of the
// smart-bin system (same broker as NEXT_PUBLIC_BROKER_URL in the admin
// app's .env). Every device that runs this sketch subscribes to the same
// schedule topic and applies the same system-wide schedule - there's no
// per-bin identity to configure.
// IMPORTANT: ESP32 (including the S3) only has a 2.4GHz WiFi radio - it
// cannot join a 5GHz SSID. If your network name ends in "(5G)" or similar,
// use the 2.4GHz network's name here instead, or it will never connect.
#define WIFI_SSID       "SINGTEL-XWX9"
#define WIFI_PASSWORD   "85bfhnudun"
// Bare hostname only - no "wss://", no port, no "/mqtt" path. That's the
// browser/WebSocket form the admin app's NEXT_PUBLIC_BROKER_URL uses;
// PubSubClient here speaks raw MQTT over TLS instead, so strip it down to
// just the host, e.g. "21be7b7891f540b79302d07822b51558.s1.eu.hivemq.cloud".
#define MQTT_BROKER     "21be7b7891f540b79302d07822b51558.s1.eu.hivemq.cloud"
// 8883 = TLS (default below, via WiFiClientSecure), 1883 = plaintext.
// If your broker is plaintext, also change `WiFiClientSecure wifiClient` to
// `WiFiClient wifiClient` further down and drop the `wifiClient.setInsecure()`
// call in setup() - the two client classes aren't interchangeable.
#define MQTT_PORT       8883
#define MQTT_USERNAME   "binuser"
#define MQTT_PASSWORD   "!2E4s678"
// ==============================================================================

#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "RTClib.h"

RTC_DS3231 rtc;

// Custom I2C pins and the output GPIO driving the SMPS
const int I2C_SDA = 8;
const int I2C_SCL = 9;
const int outputPin = 4;

// Fixed, system-wide schedule topic (retained) - every bin controller
// subscribes to the same one. See updatePowerSchedule() in the admin app's
// src/app/action/bin.ts.
const char* scheduleTopic = "srb/schedule";

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);
Preferences preferences;

// --- Power schedule state -----------------------------------------------
// start/end are minutes since midnight (0-1439). A window where
// start > end wraps past midnight (e.g. start=1320 end=360 = "22:00-06:00").
// days[i] is true if weekday i (0=Sunday..6=Saturday, matching both
// RTClib's DateTime::dayOfTheWeek() and JS Date.getDay() on the admin side)
// is an active day for this schedule.
struct PowerSchedule {
  bool enabled = false;
  int startMinute = 0;
  int endMinute = 1439;
  bool days[7] = { true, true, true, true, true, true, true };
};

PowerSchedule schedule;
bool outputState = true; // tracked so we only Serial.print/log on change

// --- Persistence (survives reboot/power loss before MQTT reconnects) ----
void saveScheduleToFlash() {
  preferences.begin("bin-sched", false);
  preferences.putBool("enabled", schedule.enabled);
  preferences.putInt("start", schedule.startMinute);
  preferences.putInt("end", schedule.endMinute);
  uint8_t daysMask = 0;
  for (int i = 0; i < 7; i++) {
    if (schedule.days[i]) daysMask |= (1 << i);
  }
  preferences.putUChar("days", daysMask);
  preferences.end();
}

void loadScheduleFromFlash() {
  preferences.begin("bin-sched", true);
  schedule.enabled = preferences.getBool("enabled", false);
  schedule.startMinute = preferences.getInt("start", 0);
  schedule.endMinute = preferences.getInt("end", 1439);
  uint8_t daysMask = preferences.getUChar("days", 0b01111111);
  for (int i = 0; i < 7; i++) {
    schedule.days[i] = (daysMask & (1 << i)) != 0;
  }
  preferences.end();
}

// --- MQTT ------------------------------------------------------------------
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  if (String(topic) != scheduleTopic) return;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.print("Failed to parse schedule JSON: ");
    Serial.println(err.c_str());
    return;
  }

  schedule.enabled = doc["enabled"] | false;
  schedule.startMinute = doc["startMinute"] | 0;
  schedule.endMinute = doc["endMinute"] | 1439;

  if (doc["days"].is<JsonArray>()) {
    for (int i = 0; i < 7; i++) schedule.days[i] = false;
    for (JsonVariant v : doc["days"].as<JsonArray>()) {
      int d = v.as<int>();
      if (d >= 0 && d <= 6) schedule.days[d] = true;
    }
  }

  saveScheduleToFlash();

  Serial.println("Schedule updated:");
  Serial.printf("  enabled=%d start=%d end=%d days=", schedule.enabled, schedule.startMinute, schedule.endMinute);
  for (int i = 0; i < 7; i++) Serial.print(schedule.days[i] ? "1" : "0");
  Serial.println();
}

// Non-blocking WiFi connect. Calling WiFi.begin() again while a previous
// attempt is still in progress makes the ESP-IDF driver log
// "sta is connecting, cannot set config" and doesn't actually restart
// anything - so this tracks attempt state itself and only calls begin()
// once per attempt, giving each one up to WIFI_ATTEMPT_TIMEOUT_MS to
// resolve (success or fail) before allowing a fresh one.
const unsigned long WIFI_ATTEMPT_TIMEOUT_MS = 15000;
bool wifiAttemptInProgress = false;
unsigned long wifiAttemptStarted = 0;

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiAttemptInProgress = false;
    return;
  }

  if (wifiAttemptInProgress) {
    if (millis() - wifiAttemptStarted < WIFI_ATTEMPT_TIMEOUT_MS) {
      return; // still waiting on the attempt already in flight
    }
    // Timed out - explicitly tear down before trying again, otherwise the
    // driver can be left in a state where a fresh begin() is rejected.
    Serial.println("WiFi attempt timed out, resetting...");
    WiFi.disconnect(true);
    wifiAttemptInProgress = false;
  }

  Serial.println("Starting WiFi connection...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  wifiAttemptInProgress = true;
  wifiAttemptStarted = millis();
}

void connectMqtt() {
  if (mqttClient.connected()) return;
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.print("Connecting to MQTT...");
  // Client ID must be unique per physical device on the broker (two clients
  // with the same ID will keep kicking each other off), so it's derived from
  // this chip's own MAC address rather than hardcoded.
  String clientId = String("bin-power-") + WiFi.macAddress();

  if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.println(" connected");
    mqttClient.subscribe(scheduleTopic, 0);
    Serial.print("Subscribed to ");
    Serial.println(scheduleTopic);
  } else {
    Serial.print(" failed, rc=");
    Serial.println(mqttClient.state());
  }
}

// --- Schedule evaluation -----------------------------------------------
bool isPowerOnNow(const DateTime& now) {
  if (!schedule.enabled) return true; // no schedule set - fail safe to "always on"

  int nowMinutes = now.hour() * 60 + now.minute();
  int today = now.dayOfTheWeek(); // 0=Sunday..6=Saturday

  if (schedule.startMinute <= schedule.endMinute) {
    // Same-day window, e.g. 08:00-18:00
    bool inWindow = nowMinutes >= schedule.startMinute && nowMinutes <= schedule.endMinute;
    return schedule.days[today] && inWindow;
  }

  // Overnight window, e.g. 22:00-06:00
  if (nowMinutes >= schedule.startMinute) {
    // Tonight's window has started - active if today is scheduled
    return schedule.days[today];
  }
  if (nowMinutes <= schedule.endMinute) {
    // Still in the tail of last night's window - active if *yesterday* was scheduled
    int yesterday = (today + 6) % 7;
    return schedule.days[yesterday];
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  pinMode(outputPin, OUTPUT);
  digitalWrite(outputPin, HIGH); // safe default until we've evaluated the real schedule

  loadScheduleFromFlash();

  // Initialize I2C with the custom SDA and SCL pins
  Wire.begin(I2C_SDA, I2C_SCL);

  // Initialize the RTC using the custom Wire interface
  if (!rtc.begin(&Wire)) {
    Serial.println("Couldn't find RTC! Check your wiring.");
    while (1) { delay(10); } // Halt if RTC is not found
  }

  // If the RTC lost power (e.g., missing coin cell battery), set the time
  if (rtc.lostPower()) {
    Serial.println("RTC lost power, setting the time...");
    // Sets the RTC to the date & time this sketch was compiled. This is only
    // a fallback - once WiFi comes up you may want to sync via NTP instead
    // for real accuracy, but the coin cell should normally keep this from
    // ever being needed after the first flash.
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  wifiClient.setInsecure(); // skip TLS cert validation - fine for a broker you control; remove if you pin a CA cert
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
  mqttClient.setBufferSize(512);

  connectWifi();
  connectMqtt();
}

unsigned long lastReconnectAttempt = 0;
unsigned long lastScheduleCheck = 0;

void loop() {
  // Keep WiFi/MQTT alive without blocking the schedule check every loop.
  if (millis() - lastReconnectAttempt > 5000) {
    lastReconnectAttempt = millis();
    connectWifi();
    connectMqtt();
  }
  mqttClient.loop();

  // Evaluate the schedule once a second - no need for anything faster.
  if (millis() - lastScheduleCheck > 1000) {
    lastScheduleCheck = millis();

    DateTime now = rtc.now();
    bool shouldBeOn = isPowerOnNow(now);

    if (shouldBeOn != outputState) {
      outputState = shouldBeOn;
      digitalWrite(outputPin, outputState ? HIGH : LOW);
      Serial.printf("[%02d:%02d:%02d] Power %s\n", now.hour(), now.minute(), now.second(), outputState ? "ON" : "OFF");
    }
  }
}
