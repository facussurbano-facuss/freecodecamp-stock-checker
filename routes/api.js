'use strict';

const { fetchStockQuote } = require('../lib/stock-price-service');
const likeStore = require('../lib/stock-like-store');

function parseLikeFlag(value) {
  return value === true || value === 'true';
}

function toStockArray(stockQuery) {
  if (Array.isArray(stockQuery)) {
    return stockQuery.filter(Boolean);
  }

  if (stockQuery) {
    return [stockQuery];
  }

  return [];
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const stocks = toStockArray(req.query.stock).slice(0, 2);
    const like = parseLikeFlag(req.query.like);

    if (!stocks.length) {
      return res.status(400).json({ error: 'stock query parameter is required' });
    }

    try {
      const stockData = await Promise.all(
        stocks.map(async (stock) => {
          const quote = await fetchStockQuote(stock);

          if (like) {
            likeStore.addLike(quote.stock, req.ip);
          }

          return {
            stock: quote.stock,
            price: quote.price,
            likes: likeStore.getLikes(quote.stock)
          };
        })
      );

      if (stockData.length === 1) {
        return res.json({ stockData: stockData[0] });
      }

      return res.json({
        stockData: [
          {
            stock: stockData[0].stock,
            price: stockData[0].price,
            rel_likes: stockData[0].likes - stockData[1].likes
          },
          {
            stock: stockData[1].stock,
            price: stockData[1].price,
            rel_likes: stockData[1].likes - stockData[0].likes
          }
        ]
      });
    } catch (error) {
      return res.status(502).json({ error: error.message || 'Unable to fetch stock price' });
    }
  });
};
