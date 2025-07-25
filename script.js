const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/1lG1Xzzzs4jNKII6deHT_PtY6ltGPp2RAlr7_ak-wRZ4/export?format=csv';
    let allData = [];

    function getTierBadge(t){
      return ['','tier-1-badge','tier-2-badge','tier-3-badge','tier-4-badge','tier-5-badge'][parseInt(t)]||'';
    }

    function getEstadoClass(e){
      return /abierto/i.test(e)?'Abierto':/cerrado/i.test(e)?'Cerrado':/pendiente/i.test(e)?'Pendiente':'Otro';
    }

    function parseImgTags(text){
      if (!text) return '';
      return text.replace(/\[img\](https?:\/\/\S+)/g, (_,url) => `<a href="${url}" target="_blank"><img src="${url}" style="max-width:100px; max-height:100px; margin:4px; vertical-align:middle; border-radius:6px;"></a>`);
    }

    function formatRolesWL(txt){
      if(!txt) return '';
      const safe = txt.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const withImgs = parseImgTags(safe);
      return withImgs.replace(/\n{2,}/g,'<br><br>').replace(/\n/g,'<br>');
    }

    function showModal(i){
      const r = allData[i];
      const floorD = r['Floor Price Pase Directo (MON)']||'—';
      const floorA = r['Floor Price NFT Acumulativo (MON)']||'—';
      const ttD = r['Tooltip Pase Directo']?` <span class="tooltip-icon" title="${r['Tooltip Pase Directo']}">❓</span>`:'';
      const ttA = r['Tooltip NFT Acumulativo']?` <span class="tooltip-icon" title="${r['Tooltip NFT Acumulativo']}">❓</span>`:'';
      modal.style.display='flex';
      document.getElementById('modalDetails').innerHTML=`
        <div class="section" style="text-align:center;">
          ${r['Logo']?`<img src="${r['Logo']}" class="logo" style="width:80px;height:80px;">`:''}
          <h2>${r['Proyecto']}</h2>
          <div class="tag ${getEstadoClass(r['Estado Testnet'])}">${r['Estado Testnet']||'Desconocido'}</div>
          <div><span class="tier-badge ${getTierBadge(r['Tier'])}">${r['Tier']?(r['Tier']==='1'?'🥇':r['Tier']==='2'?'🥈':'🥉')+' Tier '+r['Tier']:'Tier'}</span></div>
        </div>
        <div class="section"><h3>🧠 Roles WL</h3><div class="info-block">${formatRolesWL(r['Roles WL'])}</div></div>
        <div class="section"><h3>✅ Pase WL Directo${ttD}</h3>
          <div class="info-block">${r['Pase WL Directo']||'—'}</div>
          <div class="info-block"><strong>Beneficio:</strong><br>${r['Beneficio WL Directo']||'—'}</div>
          <div class="info-block"><strong>Floor:</strong> ${floorD} MON</div>
          ${r['Link Pase Directo']?`<a href="${r['Link Pase Directo']}" class="buy-button" target="_blank">Comprar Pase</a>`:''}
        </div>
        <div class="section"><h3>📦 NFT Acumulativo${ttA}</h3>
          <div class="info-block">${r['NFT Acumulativo']||'—'}</div>
          <div class="info-block"><strong>Beneficios:</strong><br>${r['Beneficios Acumulativos']||'—'}</div>
          <div class="info-block"><strong>Floor:</strong> ${floorA} MON</div>
          ${r['Link NFT Acumulativo']?`<a href="${r['Link NFT Acumulativo']}" class="buy-button" target="_blank">Comprar NFT</a>`:''}
        </div>
        <div class="section"><h3>📝 Notas</h3><div class="info-block">${r['Notas']||'—'}</div></div>
        ${ (r['Link X']||r['Link Discord']||r['Link Web'])?`<div class="section"><h3>🌐 Enlaces</h3><div class="external-links">
          ${r['Link X']?`<a href="${r['Link X']}" class="x" target="_blank">X</a>`:''}
          ${r['Link Discord']?`<a href="${r['Link Discord']}" class="discord" target="_blank">Discord</a>`:''}
          ${r['Link Web']?`<a href="${r['Link Web']}" class="web" target="_blank">Web</a>`:''}
        </div></div>`:''}
      `;
    }

    function render(data){
      const grid=document.getElementById('cardGrid'); grid.innerHTML='';
      data.forEach((r,i)=>{
        const card=document.createElement('div');
        card.className='card '+getTierBadge(r['Tier']);
        card.onclick=()=>showModal(i);
        card.innerHTML=`
          ${r['Logo']?`<img src="${r['Logo']}" class="logo">`:''}
          <h3>${r['Proyecto']}</h3>
          <div class="tag ${getEstadoClass(r['Estado Testnet'])}">${r['Estado Testnet']||'Desconocido'}</div>
          <span class="tier-badge ${getTierBadge(r['Tier'])}">${r['Tier']?(r['Tier']==='1'?'🥇':r['Tier']==='2'?'🥈':'🥉')+' Tier '+r['Tier']:'Tier'}</span>
        `;
        grid.appendChild(card);
      });
    }

    function applyFilters(){
      const name = document.getElementById('projectFilter').value.toLowerCase();
      const tf = document.getElementById('tierFilter').value;
      const ef = document.getElementById('estadoFilter').value;
      const sortBy = document.getElementById('sortSelect').value;
    
      let filtered = allData.filter(r =>
        r['Proyecto'].toLowerCase().includes(name) &&
        (!tf || r['Tier'] === tf) &&
        (!ef || r['Estado Testnet'] === ef)
      );
    
      if (sortBy === 'tier') {
        filtered.sort((a, b) => (parseInt(a['Tier']) || 0) - (parseInt(b['Tier']) || 0));
      } else if (sortBy === 'nombre') {
        filtered.sort((a, b) => (a['Proyecto'] || '').localeCompare(b['Proyecto'] || ''));
      }
    
      render(filtered);
    }
    document.getElementById('sortSelect').addEventListener('change', applyFilters);


    Papa.parse(SHEET_CSV, {
      download: true,
      header: true,
      complete: function(results) {
        allData = results.data.map(row => {
          const cleaned = {};
          for (const key in row) cleaned[key.trim().replace(/\s+/g, ' ')] = row[key];
          return cleaned;
        }).filter(r => r['Proyecto']);
    
        applyFilters(); // aplicar con orden al inicio
    
        document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-AR');
    
        document.getElementById('faqBtn').onclick = () => {
          const faqEntry = allData.find(r => r['FAQ'] && r['FAQ'].trim() !== '');
          const faqText = faqEntry ? faqEntry['FAQ'] : 'Sin FAQ configurada.';
          document.getElementById('faqContent').innerText = faqText;
          document.getElementById('faqModal').style.display = 'flex';
        };
        document.getElementById('donateBtn').onclick = () => {
          document.getElementById('donateModal').style.display = 'flex';
        };
    
        const tierSet = new Set(), estadoSet = new Set();
        allData.forEach(r => {
          if (r['Tier']) tierSet.add(r['Tier']);
          if (r['Estado Testnet']) estadoSet.add(r['Estado Testnet']);
        });
        tierSet.forEach(t => {
          const o = document.createElement('option');
          o.value = t; o.textContent = t;
          document.getElementById('tierFilter').appendChild(o);
        });
        estadoSet.forEach(e => {
          const o = document.createElement('option');
          o.value = e; o.textContent = e;
          document.getElementById('estadoFilter').appendChild(o);
        });
      }
    });
    

    document.getElementById('projectFilter').addEventListener('input', applyFilters);
    document.getElementById('tierFilter').addEventListener('change', applyFilters);
    document.getElementById('estadoFilter').addEventListener('change', applyFilters);

    window.onclick = e => {
      if (e.target.id === 'modal') document.getElementById('modal').style.display = 'none';
      if (e.target.id === 'faqModal') document.getElementById('faqModal').style.display = 'none';
      if (e.target.id === 'donateModal') document.getElementById('donateModal').style.display = 'none';
    };
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-close');
        document.getElementById(id).style.display = 'none';
      };
    });
    