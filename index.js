const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();


// 请替换以下Token为您的Telegram机器人Token
const token = process.env.TELEGRAM_BOT_TOKEN;

// 创建TelegramBot实例
const bot = new TelegramBot(token, { polling: true });

// URL清理函数
function cleanUrl(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null; // 返回null表示无法处理该URL
    }
}

// 解析短链接函数
async function getFullUrl(shortUrl) {
    if (shortUrl.startsWith('https://b23.tv/')) {
        try {
            const response = await axios.get(shortUrl, {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 303;
                }
            });
            return cleanUrl(response.headers.location); // 清理重定向后的URL
        } catch (error) {
            console.error(error);
            return null;
        }
    } else {
        // 非b23.tv短链接，直接清理
        return cleanUrl(shortUrl);
    }
}

// 监听收到的消息
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // 简单的命令响应
    if (text === '/start') {
        bot.sendMessage(chatId, '欢迎使用链接清理机器人，发送任何链接我将为您清理。');
        return;
    }

    // 检测到URL时的响应
    if (text.startsWith('http') || text.startsWith('www')) {
        const cleanUrl = await getFullUrl(text);
        if (cleanUrl) {
            bot.sendMessage(chatId, `清理后的链接: ${cleanUrl}`);
        } else {
            bot.sendMessage(chatId, '抱歉，无法处理这个链接。');
        }
    }
});

console.log('机器人已启动...');
