/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — MIDRIGAN Cristian — script.js
═══════════════════════════════════════════════════════════════ */

/* ── CANVAS PARTICULES ── */
(function(){
  var cv = document.getElementById('bg-canvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W, H, pts = [];
  function rsz(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
  rsz();
  window.addEventListener('resize', rsz);
  function P(){
    this.reset = function(){
      this.x = Math.random()*W; this.y = Math.random()*H;
      this.vx = (Math.random()-.5)*.3; this.vy = (Math.random()-.5)*.3;
      this.a = Math.random()*.5+.1; this.sz = Math.random()*1.5+.5;
      this.c = Math.random()>.5 ? '#00c8ff' : '#00ffcc';
    };
    this.reset();
  }
  for (var i = 0; i < 90; i++){ var p = new P(); pts.push(p); }
  (function anim(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(function(p){
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>W||p.y<0||p.y>H) p.reset();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
    });
    for (var i = 0; i < pts.length; i++){
      for (var j = i+1; j < pts.length; j++){
        var dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if (d<90){
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle='#00c8ff'; ctx.globalAlpha=(1-d/90)*.09; ctx.lineWidth=.5;
          ctx.stroke(); ctx.globalAlpha=1;
        }
      }
    }
    requestAnimationFrame(anim);
  })();
})();

/* ── ORBITAL ── */
function positionOrbNodes(){
  var wrap = document.getElementById('orbWrap');
  if (!wrap) return;
  var size = wrap.offsetWidth;
  if (!size) return;
  var cx=size/2, cy=size/2, r1=size*.215, r2=size*.41;
  var n1=Math.max(50,size*.163), n2=Math.max(58,size*.188);
  var rng1=document.getElementById('orbRing1'), rng2=document.getElementById('orbRing2');
  if (rng1){ rng1.style.width=rng1.style.height=(r1*2)+'px'; }
  if (rng2){ rng2.style.width=rng2.style.height=(r2*2)+'px'; }
  document.querySelectorAll('#orbWrap .orb-node').forEach(function(node){
    var ring=parseInt(node.dataset.ring), idx=parseInt(node.dataset.idx), total=parseInt(node.dataset.total);
    var r=ring===1?r1:r2, nSize=ring===1?n1:n2;
    var angle=(idx/total)*Math.PI*2-Math.PI/2;
    node.style.left=(cx+r*Math.cos(angle))+'px';
    node.style.top=(cy+r*Math.sin(angle))+'px';
    var inner=node.querySelector('.orb-node-in');
    if (inner){ inner.style.width=inner.style.height=nSize+'px'; }
    var ni=node.querySelector('.ni'), nl=node.querySelector('.nl');
    if (ni) ni.style.fontSize=(nSize*.30)+'px';
    if (nl) nl.style.fontSize=Math.max(7,nSize*.13)+'px';
  });
}
window.addEventListener('load', positionOrbNodes);
window.addEventListener('resize', positionOrbNodes);
setTimeout(positionOrbNodes, 50);
setTimeout(positionOrbNodes, 300);

/* ═══════════════════════════════════════════════════
   FILTRE PARCOURS — formation / entreprise / all
═══════════════════════════════════════════════════ */
function filterP(type, btn) {
  /* Reset tous les boutons */
  document.querySelectorAll('.pf-btn').forEach(function(b){
    b.classList.remove('active');
  });
  /* Activer le bouton cliqué */
  if (btn) btn.classList.add('active');

  /* Afficher / masquer les cartes */
  var cards = document.querySelectorAll('.parc-grid .pc');
  cards.forEach(function(card){
    var t = card.getAttribute('data-type') || '';
    if (type === 'all' || t === type) {
      card.style.display = '';        /* visible */
    } else {
      card.style.display = 'none';   /* masqué */
    }
  });
}

/* ── VEILLE TOGGLE ── */
function toggleV(head){
  var body = head.nextElementSibling;
  var btn  = head.querySelector('.vc-btn');
  if (!body) return;
  if (body.classList.contains('open')){
    body.classList.remove('open');
    if (btn) btn.textContent = 'LIRE ▾';
  } else {
    body.classList.add('open');
    if (btn) btn.textContent = 'FERMER ▴';
  }
}

/* ── FORM ── */
function submitForm(e){
  e.preventDefault();
  var b = e.target.querySelector('.c-sbtn');
  if (!b) return;
  b.textContent = 'Envoyé ✓';
  b.style.borderColor = 'var(--cyan2)';
  b.style.color = 'var(--cyan2)';
  setTimeout(function(){
    b.textContent = 'Envoyer le message';
    b.style.borderColor = ''; b.style.color = '';
  }, 3000);
}

/* ── NAV ACTIVE ── */
(function(){
  var secs = document.querySelectorAll('section[id]');
  var nls  = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function(){
    var sy = window.scrollY;
    secs.forEach(function(s){
      if (sy >= s.offsetTop-80 && sy < s.offsetTop-80+s.offsetHeight){
        nls.forEach(function(a){ a.classList.remove('active'); });
        var a = document.querySelector('.nav-links a[href="#'+s.id+'"]');
        if (a) a.classList.add('active');
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════
   BOUTON ACTUALISER — tente un fetch CERT-FR live
   Les articles statiques sont déjà dans le HTML.
   Le fetch remplace le contenu UNIQUEMENT s'il réussit.
═══════════════════════════════════════════════════ */
function loadNewsFeeds(){
  var btn   = document.querySelector('.news-refresh-btn');
  var grid  = document.getElementById('news-grid');
  var label = document.getElementById('news-status-label');
  if (!grid) return;

  if (btn){ btn.textContent = '⟳ Chargement…'; btn.disabled = true; }

  var settled = false;
  var fallback = setTimeout(function(){
    if (settled) return;
    settled = true;
    if (btn){ btn.textContent = '⟳ Actualiser'; btn.disabled = false; }
    if (label){ label.textContent = '// DERNIÈRES ACTUALITÉS'; label.style.color=''; }
  }, 7000);

  fetch('https://api.rss2json.com/v1/api.json?rss_url=' +
        encodeURIComponent('https://www.cert.ssi.gouv.fr/feed/') + '&count=9')
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (settled) return;
      settled = true; clearTimeout(fallback);
      if (data.status === 'ok' && data.items && data.items.length){
        grid.innerHTML = data.items.slice(0,9).map(function(it){
          var d = '';
          if (it.pubDate){
            try{
              d = new Date(it.pubDate).toLocaleDateString('fr-FR',
                  {day:'numeric',month:'short',year:'numeric'});
            }catch(e){}
          }
          return '<div class="news-card">'
            +'<div class="news-card-src">CERT-FR</div>'
            +'<div class="news-card-title"><a href="'+(it.link||'#')+'" target="_blank" rel="noopener">'
            +(it.title||'').replace(/<[^>]+>/g,'')+'</a></div>'
            +(d?'<div class="news-card-date">📅 '+d+'</div>':'')
            +'<span class="news-card-tag">→ Lire l\'article</span>'
            +'</div>';
        }).join('');
        if (label){ label.textContent='// FLUX LIVE — CERT-FR'; label.style.color='var(--cyan2)'; }
      }
      if (btn){ btn.textContent='⟳ Actualiser'; btn.disabled=false; }
    })
    .catch(function(){
      if (settled) return;
      settled = true; clearTimeout(fallback);
      if (btn){ btn.textContent='⟳ Actualiser'; btn.disabled=false; }
    });
}
