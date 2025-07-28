const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/1lG1Xzzzs4jNKII6deHT_PtY6ltGPp2RAlr7_ak-wRZ4/export?format=csv';

let allData = [];
let filteredData = [];

function getTierBadge(t) {
  return (
    ['', 'tier-1-badge', 'tier-2-badge', 'tier-3-badge', 'tier-4-badge', 'tier-5-badge'][parseInt(t)] || ''
  );
}

function getStatusClass(status) {
  return /open/i.test(status)
    ? 'Abierto'
    : /closed/i.test(status)
    ? 'Cerrado'
    : /pending/i.test(status)
    ? 'Pendiente'
    : 'Otro';
}

function parseImgTags(text) {
  if (!text) return '';
  return text.replace(
    /\[img\](https?:\/\/\S+)/g,
    (_, url) =>
      `<a href="${url}" target="_blank"><img src="${url}" style="max-width:100px; max-height:100px; margin:4px; vertical-align:middle; border-radius:6px;"></a>`
  );
}

function formatWLRoles(txt) {
  if (!txt) return '';
  const safe = txt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const withImages = parseImgTags(safe);
  const withLineBreaks = withImages
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');

  const highlightedRoles = withLineBreaks.replace(
    /@([\w\-]+)/g,
    '<span class="highlight-role">@$1</span>'
  );

  return highlightedRoles;
}


function showModal(i) {
  const r = filteredData[i];
  const floorD = r['Floor Price Direct Pass (MON)'] || '—';
  const floorA = r['Floor Price Cumulative NFT (MON)'] || '—';
  const ttD = r['Tooltip Direct Pass']
    ? ` <span class="tooltip-icon" title="${r['Tooltip Direct Pass']}">❓</span>`
    : '';
  const ttA = r['Tooltip Cumulative NFT']
    ? ` <span class="tooltip-icon" title="${r['Tooltip Cumulative NFT']}">❓</span>`
    : '';

  document.getElementById('modalDetails').innerHTML = `
    <div class="section" style="text-align:center;">
      ${r['Logo'] ? `<img src="${r['Logo']}" class="logo" style="width:80px;height:80px;">` : ''}
      <h2>${r['Project']}</h2>
      <div class="tag ${getStatusClass(r['Testnet Status'])}">
        ${r['Testnet Status'] || 'Unknown'}
      </div>
      <div><span class="tier-badge ${getTierBadge(r['Tier'])}">
        ${
          r['Tier']
            ? (r['Tier'] === '1' ? '🥇' : r['Tier'] === '2' ? '🥈' : '🥉') + ' Tier ' + r['Tier']
            : 'Tier'
        }
      </span></div>
    </div>

    <div class="section">
    <h3><i class="fas fa-brain"></i> WL Roles</h3>
      <div class="info-block">${formatWLRoles(r['WL Roles'])}</div>
    </div>

    <div class="section">
    <h3><i class="fas fa-ticket-alt"></i> Direct WL Pass${ttD}</h3>
      <div class="info-block">
        <strong>Pass:</strong> ${r['Direct WL Pass'] || '—'}
      </div>
      <div class="info-block">
        <strong>Benefit:</strong> ${r['Direct WL Benefit'] || '—'}
      </div>
      <div class="info-block">
        <strong>Floor:</strong> ${floorD} MON
      </div>
      ${r['Direct Pass Link']
        ? `<a href="${r['Direct Pass Link']}" class="buy-button" target="_blank">Buy Pass</a>`
        : ''}
    </div>

    <div class="section">
    <h3><i class="fas fa-cubes"></i> Cumulative NFT${ttA}</h3>
      <div class="info-block">
        <strong>Pass:</strong> ${r['Cumulative NFT'] || '—'}
      </div>
      <div class="info-block">
        <strong>Benefits:</strong> ${r['Cumulative Benefits'] || '—'}
      </div>
      <div class="info-block">
        <strong>Floor:</strong> ${floorA} MON
      </div>
      ${r['Cumulative NFT Link']
        ? `<a href="${r['Cumulative NFT Link']}" class="buy-button" target="_blank">Buy NFT</a>`
        : ''}
    </div>

    <div class="section">
    <h3><i class="fas fa-note-sticky"></i> Notes</h3>
      <div class="info-block">${r['Notes'] || '—'}</div>
    </div>

    ${
      r['X Link'] || r['Discord Link'] || r['Web Link']
        ? `<div class="section">
        <h3><i class="fas fa-link"></i> Links</h3>
        <div class="external-links">
          ${r['X Link'] ? `<a href="${r['X Link']}" target="_blank"><i class="fab fa-x-twitter"></i></a>` : ''}
          ${r['Discord Link'] ? `<a href="${r['Discord Link']}" target="_blank"><i class="fab fa-discord"></i></a>` : ''}
          ${r['Web Link'] ? `<a href="${r['Web Link']}" target="_blank"><i class="fas fa-globe"></i></a>` : ''}
        </div>        
          </div>`
        : ''
    }
  `;

  document.getElementById('modal').style.display = 'flex';
}


function render(data) {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  data.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'card ' + getTierBadge(r['Tier']);
    card.onclick = () => showModal(i);
    card.innerHTML = `
    ${r['Logo'] ? `<img src="${r['Logo']}" class="logo">` : ''}
    <h3>${r['Project']}</h3>
    <div class="tag ${getStatusClass(r['Testnet Status'])}">
      ${r['Testnet Status'] || 'Unknown'}
    </div>
    <span class="tier-badge ${getTierBadge(r['Tier'])}">
      ${r['Tier'] ? (r['Tier'] === '1' ? '🥇' : r['Tier'] === '2' ? '🥈' : '🥉') + ' Tier ' + r['Tier'] : 'Tier'}
    </span>
    <div class="floor-info">
      <div class="floor-item">
        <strong>WL Pass:</strong>
        <span>${r['Floor Price Direct Pass (MON)'] || '—'} MON</span>
      </div>
      <div class="floor-item">
        <strong>Acc. NFT:</strong>
        <span>${r['Floor Price Cumulative NFT (MON)'] || '—'} MON</span>
      </div>
    </div>
    <div class="mainnet-date">
      <strong>Mainnet:</strong> ${r['Mainnet Date'] || 'TBA'}
    </div>
  `;
    grid.appendChild(card);
  });
}

function applyFiltersAndSort() {
  const name = document.getElementById('projectFilter').value.toLowerCase();
  const tf = document.getElementById('tierFilter').value;
  const ef = document.getElementById('estadoFilter').value;
  const sort = document.getElementById('sortOrder').value;

  filteredData = allData.filter(r =>
    r['Project'].toLowerCase().includes(name) &&
    (!tf || r['Tier'] === tf) &&
    (!ef || r['Testnet Status'] === ef)
  );

  if (sort === 'tier') {
    filteredData.sort((a, b) => (parseInt(a['Tier']) || 0) - (parseInt(b['Tier']) || 0));
  } else if (sort === 'nombre') {
    filteredData.sort((a, b) => a['Project'].localeCompare(b['Project']));
  } else if (sort === 'floorD') {
    filteredData.sort((a, b) => {
      const fa = parseFloat(a['Floor Price Direct Pass (MON)']) || Infinity;
      const fb = parseFloat(b['Floor Price Direct Pass (MON)']) || Infinity;
      return fa - fb;
    });
  }

  render(filteredData);
}

Papa.parse(SHEET_CSV, {
  download: true,
  header: true,
  complete: (results) => {
    allData = results.data
      .map((row) => {
        const cleaned = {};
        for (const key in row)
          cleaned[key.trim().replace(/\s+/g, ' ')] = row[key];
        return cleaned;
      })
      .filter((r) => r['Project']);

    applyFiltersAndSort();
    document.getElementById('fecha').textContent = new Date().toLocaleDateString('en-US');

    document.getElementById('faqBtn').onclick = () => {
      const faqEntry = allData.find((r) => r['FAQ'] && r['FAQ'].trim());
      document.getElementById('faqContent').innerText = faqEntry
        ? faqEntry['FAQ']
        : 'No FAQ available.';
      document.getElementById('faqModal').style.display = 'flex';
    };
    document.getElementById('donateBtn').onclick = () => {
      document.getElementById('donateModal').style.display = 'flex';
    };
    document.getElementById('helpBtn').onclick = () => {
      window.open('https://forms.gle/63JmoMoxH517yuv17', '_blank');
    };

    document.getElementById('sortOrder').addEventListener('change', applyFiltersAndSort);

    const tierSet = new Set(), estadoSet = new Set();
    allData.forEach((r) => {
      if (r['Tier']) tierSet.add(r['Tier']);
      if (r['Testnet Status']) estadoSet.add(r['Testnet Status']);
    });
    tierSet.forEach((t) => {
      const o = document.createElement('option');
      o.value = t;
      o.textContent = t;
      document.getElementById('tierFilter').appendChild(o);
    });
    estadoSet.forEach((e) => {
      const o = document.createElement('option');
      o.value = e;
      o.textContent = e;
      document.getElementById('estadoFilter').appendChild(o);
    });

    document.getElementById('projectFilter').addEventListener('input', applyFiltersAndSort);
    document.getElementById('tierFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('estadoFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortOrder').addEventListener('change', applyFiltersAndSort);
  },
});

window.onclick = (e) => {
  if (e.target.id === 'modal') document.getElementById('modal').style.display = 'none';
  if (e.target.id === 'faqModal') document.getElementById('faqModal').style.display = 'none';
  if (e.target.id === 'donateModal') document.getElementById('donateModal').style.display = 'none';
};

// Dark/light theme toggle with localStorage
const themeToggle = document.getElementById('themeToggle');
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
};
const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
const viewToggle = document.getElementById('viewToggle');
let isListView = false;

viewToggle.onclick = () => {
  if (window.innerWidth < 768) return; // prevent toggle on small screens
  isListView = !isListView;
  document.getElementById('cardGrid').classList.toggle('list-view', isListView);
  viewToggle.textContent = isListView ? '🧱' : '📄';
};