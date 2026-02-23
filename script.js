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
/* ── LIVE NEWS FEED ── */
var NEWS_FEEDS = [
  {
    url:'https://news.google.com/rss/search?q=IA+cybersécurité+XDR+détection&hl=fr&gl=FR&ceid=FR:fr',
    label:'IA & Cyberdéfense'
  },
  {
    url:'https://news.google.com/rss/search?q=malware+polymorphe+intelligence+artificielle&hl=fr&gl=FR&ceid=FR:fr',
    label:'Malware IA'
  },
  {
    url:'https://news.google.com/rss/search?q=ANSSI+cybersécurité+2025+2026&hl=fr&gl=FR&ceid=FR:fr',
    label:'ANSSI'
  },
  {
    url:'https://news.google.com/rss/search?q=phishing+IA+agentique+cybersécurité&hl=fr&gl=FR&ceid=FR:fr',
    label:'Phishing IA'
  }
];

var RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

function fmtDate(d){
  try{
    var dt=new Date(d);
    if(isNaN(dt))return '';
    return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});
  }catch(e){return '';}
}

function loadNewsFeeds(){
  var grid=document.getElementById('news-grid');
  if(!grid)return;
  grid.innerHTML='<div class="news-loading"><div class="news-spinner"></div><span>Chargement des dernières actualités…</span></div>';

  var allItems=[];
  var pending=NEWS_FEEDS.length;

  NEWS_FEEDS.forEach(function(feed){
    var apiUrl=RSS2JSON+encodeURIComponent(feed.url)+'&count=3';
    fetch(apiUrl,{signal:AbortSignal.timeout(10000)})
      .then(function(r){return r.json();})
      .then(function(data){
        if(data.status==='ok' && data.items){
          data.items.slice(0,3).forEach(function(item){
            if(item.title && item.link){
              allItems.push({
                title:item.title.replace(/<[^>]+>/g,''),
                link:item.link,
                date:item.pubDate||'',
                label:feed.label
              });
            }
          });
        }
      })
      .catch(function(){})
      .finally(function(){
        pending--;
        if(pending===0) renderNews(allItems);
      });
  });

  setTimeout(function(){if(pending>0){pending=0;renderNews(allItems);}},12000);
}

function renderNews(items){
  var grid=document.getElementById('news-grid');
  if(!grid)return;
  if(!items.length){
    grid.innerHTML='<div class="news-error">⚠️ Flux temporairement indisponible.<br>'
      +'<a href="https://news.google.com/search?q=IA+cybersécurité&hl=fr" target="_blank" style="color:var(--cyan)">Voir les actualités sur Google News →</a></div>';
    return;
  }
  var seen={};
  items=items.filter(function(it){
    var k=it.title.slice(0,50);
    if(seen[k])return false;
    seen[k]=1;return true;
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

document.addEventListener('DOMContentLoaded',loadNewsFeeds);
