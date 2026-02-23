/* ── CANVAS PARTICULES ── */
const cv=document.getElementById('bg-canvas'),ctx=cv.getContext('2d');
let W,H,pts=[];
function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
rsz();addEventListener('resize',rsz);
function P(){this.reset=function(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.a=Math.random()*.5+.1;this.sz=Math.random()*1.5+.5;this.c=Math.random()>.5?'#00c8ff':'#00ffcc';};this.reset();}
for(var i=0;i<90;i++){var p=new P();pts.push(p);}
(function anim(){ctx.clearRect(0,0,W,H);pts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W||p.y<0||p.y>H)p.reset();ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=p.c;ctx.globalAlpha=p.a;ctx.fill();ctx.globalAlpha=1;});for(var i=0;i<pts.length;i++){for(var j=i+1;j<pts.length;j++){var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<90){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle='#00c8ff';ctx.globalAlpha=(1-d/90)*.09;ctx.lineWidth=.5;ctx.stroke();ctx.globalAlpha=1;}}}requestAnimationFrame(anim);})();

/* ── FILTRES PARCOURS ── */
function filterP(t,btn){document.querySelectorAll('.pf-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');document.querySelectorAll('.pc').forEach(function(c){if(t==='all'||c.dataset.type===t)c.classList.remove('hidden');else c.classList.add('hidden');});}

/* ── VEILLE TOGGLE ── */
function toggleV(head){var body=head.nextElementSibling;var btn=head.querySelector('.vc-btn');if(body.classList.contains('open')){body.classList.remove('open');btn.textContent='LIRE ▾';}else{body.classList.add('open');btn.textContent='FERMER ▴';}}

/* ── FORM ── */
function submitForm(e){e.preventDefault();var b=e.target.querySelector('.c-sbtn');b.textContent='Envoyé ✓';b.style.borderColor='var(--cyan2)';b.style.color='var(--cyan2)';setTimeout(function(){b.textContent='Envoyer le message';b.style.borderColor='';b.style.color='';},3000);}

/* ── NAV ACTIVE ── */
var secs=document.querySelectorAll('section[id]');
var nls=document.querySelectorAll('.nav-links a');
addEventListener('scroll',function(){var sy=scrollY;secs.forEach(function(s){if(sy>=s.offsetTop-80&&sy<s.offsetTop-80+s.offsetHeight){nls.forEach(function(a){a.classList.remove('active');});var a=document.querySelector('.nav-links a[href="#'+s.id+'"]');if(a)a.classList.add('active');}});});

/* ── FLUX ACTUALITÉS — statique + tentative live CERT-FR ── */
var STATIC_ARTICLES = [
  {title:"L'IA agentique dans les SOC : vers une réponse aux incidents entièrement automatisée",link:"https://www.cert.ssi.gouv.fr/",date:"2026-02-15",label:"ANSSI / CERT-FR"},
  {title:"XDR et IA native : la détection comportementale remplace les antivirus à signatures",link:"https://www.ssi.gouv.fr/actualite/",date:"2026-02-10",label:"IA & Cyberdéfense"},
  {title:"Malwares polymorphes générés par IA : les solutions classiques dépassées en 2026",link:"https://www.cert.ssi.gouv.fr/alerte/",date:"2026-02-06",label:"Malware IA"},
  {title:"Phishing ultra-ciblé assisté par IA : anatomie d'une attaque indétectable à l'œil nu",link:"https://www.cert.ssi.gouv.fr/cve/",date:"2026-02-03",label:"Phishing IA"},
  {title:"ANSSI : guide de recommandations pour l'intégration de l'IA dans les SI sensibles",link:"https://www.ssi.gouv.fr/guide/",date:"2026-01-28",label:"ANSSI"},
  {title:"Cyber-résilience pilotée par les données : le nouveau rôle de l'administrateur réseau",link:"https://www.ssi.gouv.fr/actualite/",date:"2026-01-20",label:"IA & Cyberdéfense"}
];

function fmtDate(d){
  try{var dt=new Date(d);if(isNaN(dt))return '';return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});}
  catch(e){return '';}
}

function renderNews(items){
  var grid=document.getElementById('news-grid');
  if(!grid)return;
  grid.innerHTML=items.slice(0,9).map(function(it){
    return '<div class="news-card">'
      +'<div class="news-card-src">'+it.label+'</div>'
      +'<div class="news-card-title"><a href="'+it.link+'" target="_blank" rel="noopener">'+it.title+'</a></div>'
      +(it.date?'<div class="news-card-date">📅 '+fmtDate(it.date)+'</div>':'')
      +'<span class="news-card-tag">→ Lire l\'article</span>'
      +'</div>';
  }).join('');
}

function loadNewsFeeds(){
  var grid=document.getElementById('news-grid');
  if(!grid)return;

  /* Affichage immédiat des articles statiques */
  renderNews(STATIC_ARTICLES);

  /* Tentative silencieuse de chargement live via CERT-FR (RSS public) */
  fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent('https://www.cert.ssi.gouv.fr/feed/')+'&count=6',
    {signal:AbortSignal.timeout(6000)})
    .then(function(r){return r.json();})
    .then(function(data){
      if(data.status==='ok'&&data.items&&data.items.length){
        var live=data.items.map(function(it){
          return {
            title:it.title.replace(/<[^>]+>/g,''),
            link:it.link,
            date:it.pubDate||'',
            label:'CERT-FR'
          };
        });
        /* Mélange live + statiques, dédoublonnage */
        var seen={};
        var combined=live.concat(STATIC_ARTICLES).filter(function(it){
          var k=it.title.slice(0,50);
          if(seen[k])return false;seen[k]=1;return true;
        });
        renderNews(combined);
      }
    })
    .catch(function(){/* Echec silencieux, les statiques restent affichés */});
}

document.addEventListener('DOMContentLoaded', loadNewsFeeds);
