const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');

// Telegram botunuzun token'ını buraya ekleyin
const TOKEN = "6905538033:AAGVgLdkIn7zwuU5DUG7Gdia6SiAWpPB7SI";

// CoinCap API endpoint'i
const API_URL = "https://api.coincap.io/v2/assets";

// İzlemek istediğiniz kripto para birimlerinin simgeleri, adları ve logoları
const WATCHLIST = [
    { symbol: 'BTC', name: 'Bitcoin', emoji: '₿' },
    { symbol: 'ETH', name: 'Ethereum', emoji: '♦' },
    { symbol: 'USDT', name: 'Tether', emoji: '💵' },
    { symbol: 'XRP', name: 'Ripple', emoji: '🪙' },
    { symbol: 'TRX', name: 'TRON', emoji: '🪙' }
];

async function get_watchlist_prices() {
    let responseText = '';

    for (const crypto of WATCHLIST) {
        const params = new URLSearchParams({
            'search': crypto.symbol
        });

        try {
            const response = await fetch(API_URL + '?' + params.toString());
            const data = await response.json();
            if (data && data.data && data.data.length > 0) {
                const price = data.data[0].priceUsd;
                responseText += `${crypto.emoji} ${crypto.name} (${crypto.symbol}) fiyatı: $${price}\n\n`;
            } else {
                responseText += `${crypto.emoji} ${crypto.name} (${crypto.symbol}) için fiyat bilgisi bulunamadı.\n\n`;
            }
        } catch (error) {
            console.error('Error:', error);
            responseText += `${crypto.emoji} ${crypto.name} (${crypto.symbol}) için fiyat alınırken hata oluştu.\n\n`;
        }
    }

    return responseText;
}

async function main() {
    const bot = new Telegraf(TOKEN);

    bot.start((ctx) => {
        ctx.reply('Merhaba! Ben kripto fiyat botuyum. /price komutunu kullanarak izlediğiniz kripto para birimlerinin fiyatlarını öğrenebilirsiniz.');
    });

    bot.command('price', async (ctx) => {
        try {
            const watchlistPrices = await get_watchlist_prices();
            ctx.reply(watchlistPrices);
        } catch (error) {
            console.error('Error:', error);
            ctx.reply('Kripto para fiyatlarını alırken bir hata oluştu.');
        }
    });

    try {
        await bot.launch();
        console.log('Bot çalışıyor');
    } catch (error) {
        console.error('Bot başlatılamadı:', error);
    }
}

main();
