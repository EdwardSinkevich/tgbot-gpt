import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import express from 'express';

const app = express();

app.listen(3000, () => {});

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session());

bot.command('new', async (cxt) => {
  cxt.session = INITIAL_SESSION;
  await cxt.reply('waiting for your message...');
});

bot.command('start', async (cxt) => {
  cxt.session = INITIAL_SESSION;
  await cxt.reply('waiting for your message');
});

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code('please wait...'));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);

    ctx.session.messages.push({ role: openai.roles.USER, content: text });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });

    await ctx.reply(response.content);
  } catch (e) {
    console.log('Error while voice message', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code('please wait...'));

    ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });

    await ctx.reply(response.content);
  } catch (e) {
    console.log('Error while voice message', e.message);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
