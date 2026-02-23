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
var NEWS_QUERIES = [
  {q:'IA+cybersécurité+XDR+détection',label:'IA & Cyberdéfense'},
  {q:'malware+polymorphe+intelligence+artificielle',label:'Malware IA'},
  {q:'ANSSI+intelligence+artificielle+sécurité',label:'ANSSI'},
  {q:'phishing+IA+agentique+cybersécurité',label:'Phishing IA'}
];

function fmtDate(d){
  try{
    var dt=new Date(d);
    return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});
  }catch(e){return '';}
}

function stripHtml(h){
  var t=document.createElement('div');t.innerHTML=h;return t.textContent||t.innerText||'';
}

function loadNewsFeeds(){
  var grid=document.getElementById('news-grid');
  if(!grid)return;
  grid.innerHTML='<div class="news-loading"><div class="news-spinner"></div><span>Chargement des dernières actualités…</span></div>';

  var allItems=[];
  var pending=NEWS_QUERIES.length;

  NEWS_QUERIES.forEach(function(q){
    var rssUrl='https://news.google.com/rss/search?q='+q.q+'&hl=fr&gl=FR&ceid=FR:fr';
    var proxy='https://api.allorigins.win/get?url='+encodeURIComponent(rssUrl);
    fetch(proxy,{signal:AbortSignal.timeout(8000)})
      .then(function(r){return r.json();})
      .then(function(data){
        var parser=new DOMParser();
        var xml=parser.parseFromString(data.contents,'text/xml');
        var items=xml.querySelectorAll('item');
        items.forEach(function(item,i){
          if(i>=3)return;
          var title=item.querySelector('title')?.textContent||'';
          var link=item.querySelector('link')?.textContent||'';
          var pubDate=item.querySelector('pubDate')?.textContent||'';
          if(title&&link){
            allItems.push({title:stripHtml(title),link:link,date:pubDate,label:q.label});
          }
        });
      })
      .catch(function(){})
      .finally(function(){
        pending--;
        if(pending===0)renderNews(allItems);
      });
  });

  // Fallback si tout échoue après 10s
  setTimeout(function(){
    if(pending>0){pending=0;renderNews(allItems);}
  },10000);
}

function renderNews(items){
  var grid=document.getElementById('news-grid');
  if(!grid)return;
  if(!items.length){
    grid.innerHTML='<div class="news-error">⚠️ Impossible de charger les actualités.<br>Vérifiez votre connexion ou réessayez plus tard.</div>';
    return;
  }
  // Dédoublonner par titre
  var seen={};
  items=items.filter(function(it){
    var k=it.title.slice(0,40);
    if(seen[k])return false;
    seen[k]=1;return true;
  });
  // Trier par date décroissante
  items.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
  // Limiter à 9
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

// Auto-load au chargement de la page
document.addEventListener('DOMContentLoaded',loadNewsFeeds);
