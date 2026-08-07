const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8507772040:AAFaSLszhTcCSJ6DKDcsOFCxSKYgLDSqECE'
// Comma-separated chat IDs — one per person who should get alerts.
// Example: TELEGRAM_CHAT_ID=603922771,123456789
const TELEGRAM_CHAT_IDS = String(process.env.TELEGRAM_CHAT_ID || '603922771,8583389596')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

async function sendTelegram(message) {
  if (!TELEGRAM_TOKEN || TELEGRAM_CHAT_IDS.length === 0) return

  await Promise.all(
    TELEGRAM_CHAT_IDS.map(async (chatId) => {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
        })
      } catch (e) {
        console.error(`Telegram error (chat ${chatId}):`, e)
      }
    }),
  )
}

module.exports = { sendTelegram }
