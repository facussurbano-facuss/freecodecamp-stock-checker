const singleStockForm = document.getElementById('single-stock-form');
const multiStockForm = document.getElementById('multi-stock-form');
const statusNode = document.getElementById('status');
const resultNode = document.getElementById('json-result');

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

function setResult(payload) {
  resultNode.textContent = JSON.stringify(payload, null, 2);
}

function createQuery(stocks, like) {
  const params = new URLSearchParams();

  stocks.forEach((stock) => {
    params.append('stock', stock.trim().toUpperCase());
  });

  if (like) {
    params.append('like', 'true');
  }

  return `/api/stock-prices?${params.toString()}`;
}

async function handleSubmit(stocks, like) {
  statusNode.textContent = 'Consultando precios...';

  try {
    const payload = await fetchJson(createQuery(stocks, like));
    setResult(payload);
    statusNode.textContent = 'Consulta completada.';
  } catch (error) {
    statusNode.textContent = error.message;
    setResult({ error: error.message });
  }
}

singleStockForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSubmit(
    [singleStockForm.elements.stock.value],
    singleStockForm.elements.like.checked
  );
});

multiStockForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSubmit(
    [
      multiStockForm.elements[0].value,
      multiStockForm.elements[1].value
    ],
    multiStockForm.elements.like.checked
  );
});
