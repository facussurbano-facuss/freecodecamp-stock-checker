'use strict';

const crypto = require('crypto');

const likesByStock = new Map();

function anonymizeIp(ipAddress) {
  return crypto.createHash('sha256').update(String(ipAddress || '')).digest('hex');
}

function normalizeStock(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function ensureEntry(stock) {
  const normalizedStock = normalizeStock(stock);

  if (!likesByStock.has(normalizedStock)) {
    likesByStock.set(normalizedStock, new Set());
  }

  return likesByStock.get(normalizedStock);
}

function addLike(stock, ipAddress) {
  const entry = ensureEntry(stock);
  entry.add(anonymizeIp(ipAddress));
}

function getLikes(stock) {
  return ensureEntry(stock).size;
}

function resetStore() {
  likesByStock.clear();
}

module.exports = {
  addLike,
  getLikes,
  resetStore
};
