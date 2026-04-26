(function () {
  const data = window.DEALS_DATA;
  if (!data) {
    document.getElementById('companies').innerHTML =
      '<p style="color:#f87171">Could not load deals data. Make sure data/deals.js is present.</p>';
    return;
  }

  const sym = data.currencySymbol || 'R';
  const fmt = n => (n == null ? '—' : sym + n.toLocaleString('en-ZA'));

  // ---- Header meta ----
  const updated = new Date(data.lastUpdated + 'T00:00:00');
  const next = new Date(updated.getTime());
  next.setDate(next.getDate() + 3);
  document.getElementById('last-updated').textContent =
    'Updated ' + updated.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  document.getElementById('next-refresh').textContent =
    'Next refresh ~ ' + next.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });

  // ---- Filter chips ----
  const filterBar = document.querySelector('.filters');
  data.companies.forEach(c => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.dataset.filter = c.id;
    b.textContent = c.name;
    filterBar.appendChild(b);
  });
  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.company').forEach(card => {
      card.classList.toggle('hidden', f !== 'all' && card.dataset.id !== f);
    });
  });

  // ---- Company cards ----
  const root = document.getElementById('companies');
  data.companies.forEach(c => {
    root.appendChild(renderCompany(c));
  });

  // ---- Research sources ----
  const rs = document.getElementById('research-sources');
  (data.researchSources || []).forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener">${escape(s.label)}</a>`;
    rs.appendChild(li);
  });

  // ---- Helpers ----
  function renderCompany(c) {
    const card = document.createElement('article');
    card.className = 'company';
    card.dataset.id = c.id;

    const head = document.createElement('header');
    head.className = 'company-head';
    head.innerHTML = `
      <h2><a href="${c.website}" target="_blank" rel="noopener">${escape(c.name)}</a></h2>
      <div class="badges">
        ${c.model ? `<span class="badge model">${escape(c.model)}</span>` : ''}
        ${c.rating ? `<span class="badge rating">${escape(c.rating)}</span>` : ''}
      </div>
      <p class="tagline">${escape(c.tagline || '')}</p>
    `;
    card.appendChild(head);

    if (c.promotions && c.promotions.length) {
      const p = document.createElement('section');
      p.className = 'promos';
      p.innerHTML = `<h3>Active deals & specials</h3>` +
        `<ul>${c.promotions.map(pr =>
          `<li><b>${escape(pr.title)}</b> — <span>${escape(pr.detail)}</span></li>`
        ).join('')}</ul>`;
      card.appendChild(p);
    }

    if (c.highlights && c.highlights.length) {
      const h = document.createElement('section');
      h.className = 'highlights';
      h.innerHTML = `<ul>${c.highlights.map(x => `<li>${escape(x)}</li>`).join('')}</ul>`;
      card.appendChild(h);
    }

    if (c.deals && c.deals.length) {
      const wrap = document.createElement('section');
      wrap.className = 'deals-wrap';
      wrap.appendChild(renderDealsTable(c.deals));
      card.appendChild(wrap);
    }

    if (c.sources && c.sources.length) {
      const s = document.createElement('footer');
      s.className = 'sources';
      s.innerHTML = `<h4>Sources</h4>` +
        c.sources.map(src =>
          `<a href="${src.url}" target="_blank" rel="noopener">${escape(src.label)} ↗</a>`
        ).join('');
      card.appendChild(s);
    }

    return card;
  }

  function renderDealsTable(deals) {
    // Decide which columns are relevant for this company's deals
    const has = key => deals.some(d => d[key] != null && d[key] !== '');
    const cols = [
      { key: 'name',     label: 'Package',  cell: d => `<td class="deal-name">${escape(d.name || '')}</td>` },
      has('monthly')   && { key: 'monthly',   label: 'Monthly',  cell: d => `<td class="price price-monthly">${d.monthly != null ? fmt(d.monthly) + '<span class="dim">/m</span>' : '<span class="dim">—</span>'}</td>` },
      has('setup')     && { key: 'setup',     label: 'Setup',    cell: d => `<td class="price">${d.setup != null ? fmt(d.setup) : '<span class="dim">—</span>'}</td>` },
      has('fromPrice') && { key: 'fromPrice', label: 'Cash',     cell: d => `<td class="price price-cash">${d.fromPrice != null ? 'from ' + fmt(d.fromPrice) : '<span class="dim">—</span>'}</td>` },
      has('panels')    && { key: 'panels',    label: 'Solar',    cell: d => `<td>${escape(d.panels || '—')}</td>` },
      has('inverter')  && { key: 'inverter',  label: 'Inverter', cell: d => `<td>${escape(d.inverter || '—')}</td>` },
      has('battery')   && { key: 'battery',   label: 'Battery',  cell: d => `<td>${escape(d.battery || '—')}</td>` },
      has('backup')    && { key: 'backup',    label: 'Backup',   cell: d => `<td>${escape(d.backup || '—')}</td>` },
      has('bestFor')   && { key: 'bestFor',   label: 'Best for', cell: d => `<td class="dim">${escape(d.bestFor || '')}</td>` }
    ].filter(Boolean);

    const t = document.createElement('table');
    t.className = 'deals';
    t.innerHTML = `
      <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${deals.map(d => `<tr>${cols.map(c => c.cell(d)).join('')}</tr>`).join('')}</tbody>
    `;
    return t;
  }

  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
