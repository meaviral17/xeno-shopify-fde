// frontend/app.js
const API_BASE = (window._API_BASE = (window.API_BASE_URL || (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) || location.origin));

// DOM
const storeIdInput = document.getElementById('storeId');
const btnSync = document.getElementById('btnSync');
const btnRefresh = document.getElementById('btnRefresh');
const customersEl = document.getElementById('customers');
const productsEl = document.getElementById('products');
const ordersEl = document.getElementById('orders');
const topCustomersEl = document.querySelector('#topCustomers tbody');
const revenueChartEl = document.getElementById('revenueChart');
const rawEl = document.getElementById('raw');

function showRaw(obj) {
  rawEl.textContent = JSON.stringify(obj, null, 2);
}

function setSummary(s) {
  customersEl.textContent = s.customers ?? '—';
  productsEl.textContent = s.products ?? '—';
  ordersEl.textContent = s.orders ?? '—';
}

function renderChart(values=[]) {
  revenueChartEl.innerHTML = '';
  if (!values || values.length === 0) {
    revenueChartEl.textContent = 'No data';
    return;
  }
  const max = Math.max(...values, 1);
  values.forEach(v=>{
    const el = document.createElement('div');
    el.className = 'bar';
    el.style.height = Math.max(6, (v / max) * 100) + '%';
    el.title = `${v}`;
    revenueChartEl.appendChild(el);
  });
}

function renderTopCustomers(list=[]) {
  topCustomersEl.innerHTML = '';
  list.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${c.name || c.email || '—'}</td><td>${Number(c.totalSpent||0).toFixed(2)}</td>`;
    topCustomersEl.appendChild(tr);
  });
}

async function apiGet(path) {
  const url = API_BASE + path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchAll(storeId) {
  const summary = await apiGet(`/analytics/summary?storeId=${storeId}`);
  const revenue = await apiGet(`/analytics/revenue?storeId=${storeId}&limit=12`);
  const top = await apiGet(`/analytics/top-customers?storeId=${storeId}&limit=10`);
  setSummary(summary);
  renderChart(revenue.revenue || []);
  renderTopCustomers(top.customers || []);
  showRaw({ summary, revenue, top });
}

btnSync.addEventListener('click', async () => {
  const sid = Number(storeIdInput.value || 1);
  btnSync.disabled = true;
  btnSync.textContent = 'Syncing…';
  try {
    const res = await apiGet(`/sync/full?tenantId=${sid}`);
    alert(res.message || 'sync done');
    await fetchAll(sid);
  } catch (err) {
    alert('Sync failed: ' + err.message);
    console.error(err);
  } finally {
    btnSync.disabled = false;
    btnSync.textContent = 'Full Sync';
  }
});

btnRefresh.addEventListener('click', async () => {
  const sid = Number(storeIdInput.value || 1);
  btnRefresh.disabled = true;
  try {
    await fetchAll(sid);
  } catch (err) {
    alert('Refresh failed: ' + err.message);
  } finally {
    btnRefresh.disabled = false;
  }
});

// initial small fetch (no storeId => 1)
fetchAll(Number(storeIdInput.value || 1)).catch(e=>{
  console.info('initial fetch failed (ok when backend not reachable):', e.message);
});
