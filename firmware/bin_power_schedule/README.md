# Bin power-supply scheduler (ESP32-S3)

Drives GPIO 4 (the SMPS control line) on/off based on a weekly schedule set
from the admin dashboard, using the DS3231 RTC for timekeeping so the
schedule keeps working even if WiFi/MQTT is briefly down. Every device
flashed with this sketch shares the same system-wide schedule - there's no
per-bin configuration needed.

## Flashing

1. Install libraries via Arduino IDE Library Manager: `RTClib` (Adafruit),
   `PubSubClient` (Nick O'Leary), `ArduinoJson` v7 (Benoit Blanchon).
2. Open `bin_power_schedule.ino`, fill in the `CONFIGURE ME` block at the top:
   - `WIFI_SSID` / `WIFI_PASSWORD`
   - `MQTT_BROKER` / `MQTT_PORT` / `MQTT_USERNAME` / `MQTT_PASSWORD` — same
     broker the admin app connects to (`NEXT_PUBLIC_BROKER_URL` etc. in the
     admin app's `.env`).
3. Board: "ESP32S3 Dev Module" (or your specific board variant). Flash as usual.
4. Open Serial Monitor at 115200 baud to watch WiFi/MQTT connection and
   schedule updates.

## How it gets its schedule

The admin dashboard (Bins → Power Schedule button in the header) publishes a
**retained** MQTT message to `srb/schedule` whenever the schedule is saved:

```json
{"enabled": true, "startMinute": 480, "endMinute": 1320, "days": [1,2,3,4,5]}
```

- `startMinute` / `endMinute`: minutes since midnight (0-1439).
- `days`: 0=Sunday .. 6=Saturday.
- Because the message is retained, every device gets the current schedule
  immediately on every reconnect/reboot, without the admin needing to resend
  it. It's also cached in flash (`Preferences`) so the last-known schedule
  survives a power cycle even before WiFi reconnects.
- `enabled: false` (or no schedule ever received) means bins stay powered on
  at all times — the schedule is opt-in, not fail-off.
- Each device's MQTT client ID is derived from its own MAC address
  (`bin-power-<mac>`), so multiple units can connect to the broker at once
  without colliding.

## Notes

- Time ranges that wrap past midnight (e.g. 22:00–06:00) are supported.
- This sketch only handles the power schedule. It doesn't touch the
  existing lid/lift/detection commands (`srb/<material>/<userId>`) — those
  are unrelated and unaffected.
