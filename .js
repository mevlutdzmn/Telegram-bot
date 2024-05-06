const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const parseString = require('xml2js').parseString;

// Telegram botunuzun token'ını buraya ekleyin
const TOKEN = "6905538033:AAGVgLdkIn7zwuU5DUG7Gdia6SiAWpPB7SI";

// TCMB XML endpoint'i
const XML_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";

async function getExchangeRates() {
    try {
        const response = await fetch(XML_URL);
        const xmlData = await response.text();
        let jsonData;
        parseString(xmlData, (err, result) => {
            if (err) throw err;
            jsonData = result;
        });

        const currencies = jsonData.Tarih_Date.Currency;
        let formattedData = 'Türkiye Cumhuriyet Merkez Bankası Kurları\n\n';
        currencies.forEach(currency => {
            const code = currency.$.Kod;
            const name = currency.CurrencyName[0];
            const buying = currency.ForexBuying[0];
            const selling = currency.ForexSelling[0];
            formattedData += `(${code}): Alış: ${buying}, Satış: ${selling}\n`;
        });

        return formattedData.trim();
    } catch (error) {
        console.error('Hata:', error);
        throw new Error('Döviz kurları alınamadı');
    }
}

async function main() {
    const bot = new Telegraf(TOKEN);

    bot.on('message', async (ctx) => {
        if (ctx.message.text === '/doviz') {
            try {
                const dövizKurları = await getExchangeRates();
                ctx.reply(dövizKurları);
            } catch (error) {
                console.error('Hata:', error);
                ctx.reply('Döviz kurları alınırken bir hata oluştu.');
            }
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
