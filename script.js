/* ── CANVAS PARTICULES ── */
const cv=document.getElementById('bg-canvas'),ctx=cv.getContext('2d');
let W,H,pts=[];
function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
rsz();addEventListener('resize',rsz);
function P(){this.reset=function(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.a=Math.random()*.5+.1;this.sz=Math.random()*1.5+.5;this.c=Math.random()>.5?'#00c8ff':'#00ffcc';};this.reset();}
for(var i=0;i<90;i++){var p=new P();pts.push(p);}
(function anim(){ctx.clearRect(0,0,W,H);pts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W||p.y<0||p.y>H)p.reset();ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=p.c;ctx.globalAlpha=p.a;ctx.fill();ctx.globalAlpha=1;});for(var i=0;i<pts.length;i++){for(var j=i+1;j<pts.length;j++){var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<90){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle='#00c8ff';ctx.globalAlpha=(1-d/90)*.09;ctx.lineWidth=.5;ctx.stroke();ctx.globalAlpha=1;}}}requestAnimationFrame(anim);})();

/* ── ORBITAL : positionnement dynamique en cercle parfait ── */
function positionOrbNodes(){
  var wrap=document.getElementById('orbWrap');
  var size=wrap.offsetWidth;
  if(!size)return;
  var cx=size/2, cy=size/2;
  // Rayons : 43% et 82% du rayon total
  var r1=size*0.215, r2=size*0.41;
  // Taille des noeuds : proportionnelle au conteneur
  var n1=Math.max(50,size*0.163), n2=Math.max(58,size*0.188);

  // Mettre à jour les rings
  var rng1=document.getElementById('orbRing1');
  var rng2=document.getElementById('orbRing2');
  rng1.style.width=rng1.style.height=(r1*2)+'px';
  rng2.style.width=rng2.style.height=(r2*2)+'px';

  // Positionner chaque noeud
  document.querySelectorAll('#orbWrap .orb-node').forEach(function(node){
    var ring=parseInt(node.dataset.ring);
    var idx=parseInt(node.dataset.idx);
    var total=parseInt(node.dataset.total);
    var r=ring===1?r1:r2;
    var nSize=ring===1?n1:n2;
    // -PI/2 pour commencer en haut
    var angle=(idx/total)*Math.PI*2-Math.PI/2;
    node.style.left=(cx+r*Math.cos(angle))+'px';
    node.style.top=(cy+r*Math.sin(angle))+'px';
    var inner=node.querySelector('.orb-node-in');
    inner.style.width=inner.style.height=nSize+'px';
    var ni=node.querySelector('.ni');
    var nl=node.querySelector('.nl');
    if(ni)ni.style.fontSize=(nSize*0.30)+'px';
    if(nl)nl.style.fontSize=Math.max(7,nSize*0.13)+'px';
  });
}
window.addEventListener('load',positionOrbNodes);
window.addEventListener('resize',positionOrbNodes);
setTimeout(positionOrbNodes,50);
setTimeout(positionOrbNodes,300);

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