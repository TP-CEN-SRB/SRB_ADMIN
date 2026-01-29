const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("⚠️ Telegram not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}

// ✅ ADD THIS
export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("⚠️ Telegram not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Telegram photo failed:", err);
  }
}

export async function sendTelegramWithButtons(
  text: string,
  buttons: any[],
) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons,
      },
    }),
  });
}

export async function sendTelegramPhotoWithButtons(
  photoUrl: string,
  caption: string,
  buttons: any[],
) {
  await fetch(`${BASE_URL}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      photo: photoUrl,
      caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons,
      },
    }),
  });
}

export async function editTelegramMessage(
  messageId: number,
  newText: string,
  buttons?: any[]
) {
  await fetch(`${BASE_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_id: messageId,
      text: newText,
      parse_mode: "Markdown",
      reply_markup: buttons
        ? { inline_keyboard: buttons }
        : undefined,
    }),
  });
}

export async function deleteTelegramMessage(messageId: number) {
  await fetch(`${BASE_URL}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_id: messageId,
    }),
  });
}

