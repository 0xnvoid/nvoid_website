// Site enhancements: theme toggle + dynamic projects + link safety
(function(){
  // ensure external links safe
  document.querySelectorAll('a[href^="http"]').forEach(a=>{
    a.target = a.target || '_blank';
    a.rel = a.rel || 'noopener';
  });

  // theme: persist in localStorage
  const root = document.documentElement;
  const KEY = 'nvoid_theme';
  const preferred = localStorage.getItem(KEY);
  if (preferred === 'light' || preferred === 'dark') root.setAttribute('data-theme', preferred);
  const toggleBtn = document.getElementById('theme-toggle');
  function toggleTheme(){
    const cur = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    if(next === 'light') root.setAttribute('data-theme','light'); else root.removeAttribute('data-theme');
    localStorage.setItem(KEY, next);
    toggleBtn && (toggleBtn.textContent = 'mode: ' + next);
    // sync embedded X widgets with the new theme
    syncXEmbeds();
  }
  // ensure embedded tweet/follow button reflect theme
  function syncXEmbeds(){
    const isLight = (root.getAttribute('data-theme') === 'light');
    const theme = isLight ? 'light' : 'dark';
    // tweet blockquote
    document.querySelectorAll('blockquote.twitter-tweet').forEach(el=>{
      el.setAttribute('data-theme', theme);
    });
    // follow buttons
    document.querySelectorAll('a.twitter-follow-button').forEach(el=>{
      el.setAttribute('data-show-count','false');
      // widgets.js reads page theme dynamically on load; force re-render
    });
    // re-render widgets if available
    if (window.twttr && twttr.widgets && typeof twttr.widgets.load === 'function'){
      const container = document.querySelector('aside[aria-label="Latest from X"] .body') || document.body;
      twttr.widgets.load(container);
    }
  }
  if (toggleBtn){
    const cur = root.getAttribute('data-theme') === 'light' ? 'light' : (preferred || 'dark');
    toggleBtn.textContent = 'mode: ' + cur;
    toggleBtn.addEventListener('click', toggleTheme);
  }
  // initial sync for X embeds once DOM is ready
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', syncXEmbeds);
  } else {
    syncXEmbeds();
  }

  // hero typewriter: "NULLVOID" for ~3s
  (function(){
    const el = document.getElementById('typewriter');
    const cursor = document.querySelector('.title .cursor');
    if(!el || !cursor) return;
    const text = (el.getAttribute('aria-label') || 'NULLVOID').toUpperCase();
    el.textContent = '';
    let i = 0;
    const start = Date.now();
    const write = () => {
      const elapsed = Date.now() - start;
      if (elapsed > 2000) { // stop after 2s
        el.textContent = text;
        // hide the cursor after finishing
        cursor.style.display = 'none';
        return;
      }
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
      }
      const delay = 80 + Math.random()*90; // humanized
      setTimeout(write, delay);
    };
    write();
  })();

  // defer showing the X embed ~4s with a fetching loader
  (function(){
    const asideBody = document.querySelector('aside[aria-label="Latest from X"] .body');
    if(!asideBody) return;
    const children = Array.from(asideBody.children);
    children.forEach(el=>{ el.style.display='none'; });
    const loader = document.createElement('div');
    loader.className = 'note';
    loader.textContent = 'fetching tweet';
    asideBody.appendChild(loader);
    let dots = 0;
    const dotsTimer = setInterval(()=>{
      dots = (dots+1)%4; loader.textContent = 'fetching tweet' + '.'.repeat(dots);
    }, 300);
    setTimeout(()=>{
      clearInterval(dotsTimer);
      loader.remove();
      children.forEach(el=>{ el.style.display=''; });
      if (window.twttr && twttr.widgets && typeof twttr.widgets.load === 'function'){
        twttr.widgets.load(asideBody);
      }
    }, 4000);
  })();

  // fun-box rotating content (marked area under hero)
  (function(){
    const left = document.getElementById('fun-left');
    const right = document.getElementById('fun-right');
    if(!left || !right) return;
    const items = [
      'tip: press mode to toggle light/dark',
      'seed: never share your mnemonic',
      'zk: proofs > passwords',
      'gas tip: lower during off-peak',
      'rest: /orgs/0xnvoid/repos',
      'http 200 ✓ 404 ✗ 418 ☕',
      'nullvoid • web3 • blockchain • ai',
      'sei • evm • cosmos',
    ];
    let idx = 0;
    function tick(){
      left.textContent = items[idx % items.length];
      right.textContent = new Date().toLocaleTimeString();
      idx++;
    }
    tick();
    setInterval(tick, 2500);
  })();

  // rotate cryptography/blockchain/AI terms in the hero window
  (function(){
    const el = document.getElementById('term-rotator');
    if(!el) return;
    const terms = [
      'zk-SNARKs', 'zk-STARKs', 'Merkle trees', 'BLS signatures', 'ECDSA', 'ed25519',
      'EVM', 'cosmwasm', 'tendermint', 'sequencer', 'L2 rollups', 'MEV',
      'transformers', 'RAG', 'LoRA', 'quantization', 'vector DBs', 'diffusion'
    ];
    let i = 0;
    function spin(){
      el.textContent = terms[i % terms.length];
      i++;
    }
    spin();
    setInterval(spin, 1200);
  })();

  // pixel-art python (snake) animation moving left to right, looping
  (function(){
    const host = document.getElementById('snake-runner');
    if(!host) return;
    const mrm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.createElement('canvas');
    const px = 2; // pixel size
    const hCells = 10, vCells = 4; // small sprite grid
    canvas.width = 220; canvas.height = vCells*px ;
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const snakePattern = [
      // 10x6 bitmap (1=body), simple curved snake
      '0011100000',
      '0111110000',
      '1111111000',
      '0111111100',
    ].map(r=>r.split('').map(n=>+n));
    const bodyColor = '#4a1cf7';
    const eyeColor = '#000000';
    let x = -hCells*px; // start off-canvas
    const y = 2; // top padding
    let last = 0;
    function drawSprite(dx){
      for(let r=0;r<vCells;r++){
        for(let c=0;c<hCells;c++){
          if(!snakePattern[r][c]) continue;
          ctx.fillStyle = bodyColor;
          ctx.fillRect(dx + c*px, y + r*px, px, px);
        }
      }
      // eyes
      ctx.fillStyle = eyeColor;
      ctx.fillRect(dx + (hCells-2)*px, y + 1*px, px, px);
    }
    function loop(ts){
      if(mrm.matches){ return; }
      const dt = ts - last; last = ts;
      x += (dt||16) * 0.06; // speed
      if(x > canvas.width) x = -hCells*px; // loop
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawSprite(Math.floor(x));
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  // dynamic projects from GitHub org
  const grid = document.getElementById('projects-grid');
  if (grid){
    // skeletons while loading
    const skFrag = document.createDocumentFragment();
    for(let i=0;i<6;i++){
      const sk = document.createElement('div');
      sk.className = 'card skeleton';
      sk.innerHTML = '<div class="line" style="width:60%"></div><div class="line" style="width:80%"></div><div class="line" style="width:40%"></div>';
      skFrag.appendChild(sk);
    }
    grid.innerHTML = '';
    grid.appendChild(skFrag);
    (async () => {
      const url = 'https://api.github.com/orgs/0xnvoid/repos?per_page=100&sort=updated';
      try{
        const res = await fetch(url);
        if(!res.ok) throw new Error('GitHub API ' + res.status);
        const repos = await res.json();
        const visible = repos.filter(r => !r.archived && !r.private);
        // sort by stargazers then updated
        visible.sort((a,b)=> (b.stargazers_count-a.stargazers_count) || (new Date(b.updated_at)-new Date(a.updated_at)));
        if(visible.length === 0){
          grid.innerHTML = '<div class="note">No public repos found for 0xnvoid.</div>';
          return;
        }
        const frag = document.createDocumentFragment();
        for(const r of visible){
          const card = document.createElement('div');
          card.className = 'card';
          const docsUrl = `docs/view.html?repo=${encodeURIComponent(r.name)}`;
          const ghUrl = r.html_url;
          card.innerHTML = `
            <div class="note">${r.topics?.slice(0,3).join(' · ') || 'project'}</div>
            <h3 class="title">${r.name}</h3>
            <p class="note">${(r.description||'').replace(/</g,'&lt;')}</p>
            <div class="actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
              <a class="btn" href="${docsUrl}">view docs →</a>
              <a class="btn" href="${ghUrl}" target="_blank" rel="noopener">github ↗</a>
            </div>
          `;
          frag.appendChild(card);
        }
        grid.innerHTML = '';
        grid.appendChild(frag);
        const hint = document.getElementById('projects-hint'); if(hint) hint.style.display='none';
      }catch(err){
        grid.innerHTML = `<div class="note">Failed to load projects (rate limit or offline). You can visit <a href="https://github.com/0xnvoid">GitHub</a>.</div>`;
      }
    })();
  }

  // fun tech bits strip content
  (function(){
    const tracks = document.querySelectorAll('#bits-track, section.bits-strip .bits-track[aria-hidden="true"]');
    if(!tracks.length) return;
    const bits = [
      'tip: press mode to toggle light/dark',
      'rpc: https://sei.rpc',
      'gas ≈ 21k for simple transfer',
      'git: commit early, push often',
      'hash: keccak256(opcode)',
      'http 418 i\'m a teapot',
      'ai × blockchain × web3',
      'testnet first, mainnet later',
      'nonce must increase',
      'yz: zero-knowledge all the things',
      'ctrl+/ toggles comment',
      'security > features',
    ];
    const text = '  ' + bits.join('   •   ') + '  ';
    tracks.forEach((el)=>{ el.textContent = text + text; });
  })();

  // ascii track generator filling full row and looping
  const asciiEl = document.getElementById('ascii-track');
  const chipsEl = document.getElementById('chips');
  if (asciiEl){
    const symbols = "█▓▒░#@%$&*+=-~^!()<>?/|{}[]".split("");
    function makeRow(width){
      let s = '';
      for(let i=0;i<width;i++){
        // denser blocks every 8 chars
        if(i%16<6){ s += symbols[(i*7)%symbols.length]; }
        else if(i%16<10){ s += ' '; }
        else { s += symbols[(i*13+5)%symbols.length]; }
      }
      const text = `  web3 · blockchain · ai  `;
      // insert the tagline every ~80 chars
      let arr = s.split("");
      for(let i=40;i<arr.length;i+=80){
        for(let j=0;j<text.length && i+j<arr.length;j++) arr[i+j] = text[j];
      }
      return arr.join("");
    }
    function refresh(){
      const ch = Math.ceil(window.innerWidth/8)*2; // generous width, twice for seamless loop
      const content = makeRow(ch);
      asciiEl.textContent = content + ' ' + content; // duplicate so CSS loop looks continuous
    }
    window.addEventListener('resize', refresh);
    refresh();
  }

  // remove static chips: no-op now

  // random pop effects around the main ascii loop (blocky shapes like GitHub identicons)
  (function(){
    const container = document.querySelector('.ascii-strip .container');
    if(!container) return;
    const mrm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colors = ['#e6e6fa','#000000','#4a1cf7','#ee82ee','#98fb98'];
    const ascii = "█▓▒░#@%$&*+=-~^!()<>?/|{}[]".split("");
    function ri(min,max){return Math.floor(Math.random()*(max-min+1))+min}
    function makePatternEl(){
      const wrap = document.createElement('span');
      wrap.className = 'pop';
      const cell = ri(9,14); // bigger cells for more pop
      const color = colors[ri(0, colors.length-1)];
      // symmetric pattern (mirror on vertical axis)
      const cols = 3, rows = 3; // user-changed to 3x3
      const grid = [];
      for(let r=0;r<rows;r++){
        const row = [];
        for(let c=0;c<Math.ceil(cols/2);c++) row.push(Math.random()>.6);
        const left = row.slice(0,Math.floor(cols/2));
        const mid = row[Math.floor(cols/2)];
        const right = left.slice().reverse();
        grid.push(left.concat([mid], right));
      }
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('width', cols*cell);
      svg.setAttribute('height', rows*cell);
      svg.setAttribute('viewBox', `0 0 ${cols*cell} ${rows*cell}`);
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          if(!grid[r][c]) continue;
          const rect = document.createElementNS(svgNS,'rect');
          rect.setAttribute('x', c*cell);
          rect.setAttribute('y', r*cell);
          rect.setAttribute('width', cell);
          rect.setAttribute('height', cell);
          rect.setAttribute('rx', ri(0,2));
          rect.setAttribute('ry', ri(0,2));
          rect.setAttribute('fill', color);
          svg.appendChild(rect);
        }
      }
      wrap.appendChild(svg);
      return wrap;
    }
    function spawn(){
      if(mrm.matches) return; // respect reduced motion
      const usePattern = Math.random() < 0.8; // bias towards mosaics
      const el = usePattern ? makePatternEl() : document.createElement('span');
      if(!usePattern){
        el.className = Math.random()<.5 ? 'pop-ascii' : 'pop';
        if(el.className==='pop-ascii'){
          el.textContent = ascii[ri(0, ascii.length-1)];
          el.style.color = colors[ri(0, colors.length-1)];
          el.style.fontSize = (14 + Math.random()*16) + 'px';
        } else {
          const sz = ri(14,28);
          el.style.width = sz + 'px';
          el.style.height = (sz - ri(0,5)) + 'px';
          el.style.background = colors[ri(0, colors.length-1)];
          el.style.borderRadius = [0,3,6,10,12][ri(0,4)] + 'px';
        }
      }
      const w = container.clientWidth;
      const h = container.clientHeight;
      el.style.left = ri(0, Math.max(0, w-20)) + 'px';
      el.style.top = ri(0, Math.max(0, h-20)) + 'px';
      el.style.setProperty('--rot', ri(-25,25)+'deg');
      el.style.setProperty('--dur', (0.9 + Math.random()*1.1).toFixed(2)+'s');
      el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,.25))';
      container.appendChild(el);
      const ttl = 2200; // ms
      setTimeout(()=>{ el.remove(); }, ttl);
    }
    // run at random intervals
    setInterval(spawn, 360);
    // initial burst
    for(let i=0;i<12;i++) setTimeout(spawn, i*70);

    // glitch overlay on hover
    const strip = document.querySelector('.ascii-strip');
    const track = document.querySelector('.ascii-track');
    let overlay = container.querySelector('.glitch-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'glitch-overlay';
      // create a few lines
      for(let i=0;i<3;i++){
        const line = document.createElement('div');
        line.className = 'glitch-line glitch-jitter';
        overlay.appendChild(line);
      }
      container.appendChild(overlay);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,<.>/?';
    function randStr(n){
      let s='';
      for(let i=0;i<n;i++) s += chars[ri(0, chars.length-1)];
      return s;
    }
    let glitchTimer=null;
    function startGlitch(){
      if(!strip) return;
      strip.classList.add('glitching');
      // update overlay text rapidly
      const widthCh = Math.max(40, Math.floor(container.clientWidth/9));
      // slower updates for a calmer glitch
      glitchTimer = setInterval(()=>{
        overlay.querySelectorAll('.glitch-line').forEach((el,idx)=>{
          if(idx===0){
            el.innerHTML = '<span class="glitch-err">ERROR</span> '+ randStr(widthCh-7);
          } else {
            el.textContent = randStr(widthCh + ri(-10,10));
          }
          el.style.transform = `translate(${ri(-2,2)}px,${ri(-1,1)}px)`;
        });
      }, 150);
    }
    function stopGlitch(){
      if(!strip) return;
      strip.classList.remove('glitching');
      if(glitchTimer){ clearInterval(glitchTimer); glitchTimer=null; }
    }
    if(strip && track){
      strip.addEventListener('mouseenter', startGlitch);
      strip.addEventListener('mouseleave', stopGlitch);
      // touch: tap to glitch briefly
      strip.addEventListener('touchstart', (e)=>{ startGlitch(); setTimeout(stopGlitch, 800); }, {passive:true});
    }
  })();
})();
