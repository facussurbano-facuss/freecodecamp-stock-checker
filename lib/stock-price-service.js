'use strict';

const https = require('https');

const STOCK_PROXY_HOST = 'stock-price-checker-proxy.freecodecamp.rocks';

function normalizeStock(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function requestJson(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: STOCK_PROXY_HOST,
        path,
        method: 'GET'
      },
      (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Stock proxy responded with status ${res.statusCode}`));
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error('Invalid response from stock proxy'));
          }
        });
      }
    );

    req.on('error', () => {
      reject(new Error('Unable to reach stock price service'));
    });

    req.end();
  });
}

async function fetchStockQuote(stockSymbol) {
  const stock = normalizeStock(stockSymbol);

  if (!stock) {
    throw new Error('Stock symbol is required');
  }

  const payload = await requestJson(`/v1/stock/${encodeURIComponent(stock)}/quote`);

  if (!payload || typeof payload.latestPrice !== 'number' || !payload.symbol) {
    throw new Error('Invalid stock symbol');
  }

  return {
    stock: normalizeStock(payload.symbol),
    price: payload.latestPrice
  };
}

module.exports = {
  fetchStockQuote
};
