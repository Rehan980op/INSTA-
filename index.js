const InstagramBot = require('./bot/InstagramBot');

process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason);
  if (/MQTT connection failed|not authorized|login_required|unauthorized/i.test(msg)) {
    console.error('Instagram auth/listener error:', msg);
    console.error('Fix: update account.txt with a fresh FULL Instagram cookie, approve any Instagram login alert, then restart the bot.');
    return;
  }
  console.error('Unhandled rejection:', msg);
});

process.on('uncaughtException', (error) => {
  const msg = error?.message || String(error);
  if (/MQTT connection failed|not authorized|login_required|unauthorized/i.test(msg)) {
    console.error('Instagram auth/listener error:', msg);
    console.error('Fix: update account.txt with a fresh FULL Instagram cookie, approve any Instagram login alert, then restart the bot.');
    return;
  }
  console.error('Uncaught exception:', msg);
  process.exit(1);
});

const bot = new InstagramBot();

bot.start().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
