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
  }
  if (toggleBtn){
    const cur = root.getAttribute('data-theme') === 'light' ? 'light' : (preferred || 'dark');
    toggleBtn.textContent = 'mode: ' + cur;
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // dynamic projects from GitHub org
  const grid = document.getElementById('projects-grid');
  if (grid){
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
          const a = document.createElement('a');
          a.className = 'card';
          a.href = `/docs/view.html?repo=${encodeURIComponent(r.name)}`;
          a.innerHTML = `
            <div class="note">${r.topics?.slice(0,3).join(' · ') || 'project'}</div>
            <h3 class="title">${r.name}</h3>
            <p class="note">${(r.description||'').replace(/</g,'&lt;')}</p>
          `;
          frag.appendChild(a);
        }
        grid.innerHTML = '';
        grid.appendChild(frag);
        const hint = document.getElementById('projects-hint'); if(hint) hint.style.display='none';
      }catch(err){
        grid.innerHTML = `<div class="note">Failed to load projects (rate limit or offline). You can visit <a href="https://github.com/0xnvoid">GitHub</a>.</div>`;
      }
    })();
  }

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

  // color chips requested
  if (chipsEl){
    const colors = ['#e6e6fa','#000000','#4a1cf7','#ee82ee','#98fb98'];
    for(let i=0;i<32;i++){
      const div = document.createElement('span');
      div.className = 'chip';
      div.style.background = colors[i % colors.length];
      const sz = 8 + Math.floor(Math.random()*20);
      div.style.width = sz + 'px';
      div.style.height = (sz - Math.floor(Math.random()*4)) + 'px';
      div.style.borderRadius = [0,3,6,8][Math.floor(Math.random()*4)] + 'px';
      chipsEl.appendChild(div);
    }
  }
})();
