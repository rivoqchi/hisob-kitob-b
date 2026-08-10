/**
 * Markaziy env sozlamalari.
 * .env faylidan o‘qiladi; qiymat yo‘q bo‘lsa xavfsiz default.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/hisob-kitob',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '365d',
  /** Telegram Gateway API token (gateway.telegram.org) — Verification Codes. */
  telegramGatewayToken: process.env.TELEGRAM_GATEWAY_TOKEN ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  /** Oilaviy real-time xona nomi (~10 kishi uchun bitta room yetadi). */
  familyRoom: process.env.FAMILY_ROOM ?? 'family',
});
