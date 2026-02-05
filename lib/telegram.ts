const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

// --------------------
// BASIC TEXT MESSAGE
// --------------------
export async function sendTelegramAlert(message: string) {
  if (!BASE_URL || !CHAT_ID) return;

  try {
    await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: undefined,
      }),
    });
  } catch (err) {
    console.error("Telegram sendMessage failed", err);
  }
}

// --------------------
// PHOTO MESSAGE
// --------------------
export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!BASE_URL || !CHAT_ID) return;

  try {
    await fetch(`${BASE_URL}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption: caption,
        parse_mode: undefined,
      }),
    });
  } catch (err) {
    console.error("Telegram sendPhoto failed", err);
  }
}

// --------------------
// MESSAGE + BUTTONS
// --------------------
export async function sendTelegramWithButtons(
  text: string,
  buttons: any[]
) {
  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: undefined,
        reply_markup: { inline_keyboard: buttons },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Telegram send failed:", data);
    } else {
      console.log("✅ Telegram sent:", data.result.message_id);
    }

    return data;
  } catch (err) {
    console.error("❌ Telegram buttons send crashed", err);
  }
}

export async function sendTelegramPhotoWithButtons(
  photoUrl: string,
  caption: string,
  buttons: any[]
) {
  try {
    const res = await fetch(`${BASE_URL}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption: caption,
        parse_mode: undefined,
        reply_markup: { inline_keyboard: buttons },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Telegram photo error:", data);
    }
  } catch (err) {
    console.error("❌ Telegram photo crashed:", err);
  }
}

// --------------------
// EDIT MESSAGE
// --------------------
export async function editTelegramMessage(
  messageId: number,
  newText: string,
  buttons?: any[]
) {
  try {
    await fetch(`${BASE_URL}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        message_id: messageId,
        text: newText,
        parse_mode: undefined,
        reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
      }),
    });
  } catch (err) {
    console.error("Telegram edit failed", err);
  }
}

export async function editTelegramPhotoCaption(
  messageId: number,
  caption: string,
  buttons?: any[]
) {
  try {
    await fetch(`${BASE_URL}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        message_id: messageId,
        caption: caption,
        parse_mode: undefined,
        reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
      }),
    });
  } catch (err) {
    console.error("Telegram edit caption failed", err);
  }
}


// --------------------
// DELETE MESSAGE
// --------------------
export async function deleteTelegramMessage(messageId: number) {
  try {
    await fetch(`${BASE_URL}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        message_id: messageId,
      }),
    });
  } catch (err) {
    console.error("Telegram delete failed", err);
  }
}

// --------------------
// CALLBACK ACK (VERY IMPORTANT)
// --------------------
export async function answerTelegramCallback(callbackQueryId: string) {
  try {
    await fetch(`${BASE_URL}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
      }),
    });
  } catch (err) {
    console.error("Callback ack failed", err);
  }
}
