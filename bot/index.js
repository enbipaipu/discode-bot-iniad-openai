import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import OpenAI from "openai";

// dotenv適用(これで.envに記載の環境変数を使用できる)
dotenv.config();

// ここでbase_urlを設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.iniad.org/api/v1", // この行を追加
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  // 開始ログ
  console.log("ready!");
});

client.on("messageCreate", async (message) => {
  // メッセージの送信者がBotの場合 or 特定のチャンネル以外からのメッセージ送信の場合はreturn
  if (message.author.bot || message.channel.id != process.env.CHANNEL_ID)
    return;

  try {
    // 送信されたメッセージをpromptに設定
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: `${message.content}` }],
      model: "gpt-3.5-turbo",
    });

    if (completion.choices[0].message.content === undefined) throw new Error();

    // メッセージが送信されたチャンネルに、gpt-3.5-turboの返信を送信
    await message.channel.send(completion.choices[0].message.content);
  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.TOKEN);
