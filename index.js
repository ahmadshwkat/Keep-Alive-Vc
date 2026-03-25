const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const http = require('http');

// سيرفر صغير عشان Render يرضى يشغله ونربطه بـ Cron-job
http.createServer((req, res) => {
  res.write("Bot is running!");
  res.end();
}).listen(process.env.PORT || 8080);

const client = new Client({ checkUpdate: false });

// سحب البيانات من إعدادات Render (Environment Variables)
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

function connectToVoice() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return console.log("جاري محاولة العثور على السيرفر...");

  const existingConnection = getVoiceConnection(GUILD_ID);
  if (existingConnection) existingConnection.destroy();

  try {
    joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });
    console.log(`[${new Date().toLocaleTimeString()}] تم محاولة الدخول للروم.`);
  } catch (e) {
    console.error("خطأ في الاتصال بالصوت:", e);
  }
}

client.on('ready', () => {
  console.log(`تم تسجيل الدخول كـ: ${client.user.tag}`);
  connectToVoice();
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.member.id === client.user.id) {
    if (oldState.channelId && !newState.channelId) {
      console.log(`[${new Date().toLocaleTimeString()}] تم الطرد.. الانتظار 60 ثانية للعودة.`);
      const connection = getVoiceConnection(GUILD_ID);
      if (connection) connection.destroy();
      setTimeout(() => connectToVoice(), 60000);
    }
  }
});

client.login(TOKEN);
