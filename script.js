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
/* ── LIVE NEWS FEED — multi-proxy GitHub Pages compatible ── */
var NEWS_FEEDS = [
  { url:'https://news.google.com/rss/search?q=IA+cybers%C3%A9curit%C3%A9+XDR+d%C3%A9tection&hl=fr&gl=FR&ceid=FR:fr', label:'IA & Cyberdéfense' },
  { url:'https://news.google.com/rss/search?q=malware+polymorphe+intelligence+artificielle&hl=fr&gl=FR&ceid=FR:fr', label:'Malware IA' },
  { url:'https://news.google.com/rss/search?q=ANSSI+cybers%C3%A9curit%C3%A9+2026&hl=fr&gl=FR&ceid=FR:fr', label:'ANSSI' },
  { url:'https://news.google.com/rss/search?q=phishing+IA+agentique+cybers%C3%A9curit%C3%A9&hl=fr&gl=FR&ceid=FR:fr', label:'Phishing IA' }
];

/* 3 proxies en cascade */
var PROXIES = [
  function(u){return 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(u)+'&count=3';},
  function(u){return 'https://corsproxy.io/?'+encodeURIComponent(u);},
  function(u){return 'https://api.allorigins.win/get?url='+encodeURIComponent(u);}
];

function fmtDate(d){
  try{var dt=new Date(d);if(isNaN(dt))return '';return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});}
  catch(e){return '';}
}

/* Essaie chaque proxy en séquence, résoud avec les items ou [] */
function fetchFeed(feed, proxyIdx){
  if(proxyIdx>=PROXIES.length) return Promise.resolve([]);
  var apiUrl=PROXIES[proxyIdx](feed.url);
  return fetch(apiUrl,{signal:AbortSignal.timeout(8000)})
    .then(function(r){return r.json();})
    .then(function(data){
      var items=[];
      /* Format rss2json */
      if(data.items && data.items.length){
        data.items.slice(0,3).forEach(function(it){
          if(it.title&&it.link) items.push({title:it.title.replace(/<[^>]+>/g,''),link:it.link,date:it.pubDate||'',label:feed.label});
        });
        if(items.length) return items;
      }
      /* Format allorigins / corsproxy — XML brut */
      var raw=data.contents||data;
      if(typeof raw==='string'){
        var parser=new DOMParser();
        var xml=parser.parseFromString(raw,'text/xml');
        xml.querySelectorAll('item').forEach(function(el,i){
          if(i>=3) return;
          var t=el.querySelector('title');
          var l=el.querySelector('link');
          var d=el.querySelector('pubDate');
          if(t&&l){
            var linkText=l.textContent||l.nextSibling&&l.nextSibling.nodeValue||'';
            items.push({title:t.textContent.replace(/<[^>]+>/g,''),link:linkText.trim(),date:d?d.textContent:'',label:feed.label});
          }
        });
        if(items.length) return items;
      }
      return fetchFeed(feed, proxyIdx+1);
    })
    .catch(function(){return fetchFeed(feed, proxyIdx+1);});
}

function loadNewsFeeds(){
  var grid=document.getElementById('news-grid');
  if(!grid) return;
  grid.innerHTML='<div class="news-loading"><div class="news-spinner"></div><span>Chargement des dernières actualités…</span></div>';

  Promise.all(NEWS_FEEDS.map(function(f){return fetchFeed(f,0);}))
    .then(function(results){
      var all=[].concat.apply([],results);
      renderNews(all);
    });
}

function renderNews(items){
  var grid=document.getElementById('news-grid');
  if(!grid) return;
  if(!items.length){
    grid.innerHTML='<div class="news-error">⚠️ Flux temporairement indisponible.'
      +'<br><a href="https://news.google.com/search?q=IA+cybers%C3%A9curit%C3%A9&hl=fr" target="_blank" style="color:var(--cyan)">→ Voir sur Google News</a></div>';
    return;
  }
  var seen={};
  items=items.filter(function(it){
    var k=it.title.slice(0,50);
    if(seen[k])return false;seen[k]=1;return true;
  });
  items.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
  items=items.slice(0,9);
  grid.innerHTML=items.map(function(it){
    return '<div class="news-card">'
      +'<div class="news-card-src">'+it.label+'</div>'
      +'<div class="news-card-title"><a href="'+it.link+'" target="_blank" rel="noopener">'+it.title+'</a></div>'
      +(it.date?'<div class="news-card-date">📅 '+fmtDate(it.date)+'</div>':'')
      +'<span class="news-card-tag">→ Lire l\'article</span>'
      +'</div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadNewsFeeds);
