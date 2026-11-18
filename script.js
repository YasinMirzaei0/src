(function(){
  
  var nav=document.getElementById('nav');
  var bar=document.getElementById('bar'),bgs=[].slice.call(document.querySelectorAll('.bg'));
  function onS(){nav.classList.toggle('solid',scrollY>40);bar.style.transform='scaleX('+(scrollY/((document.documentElement.scrollHeight-innerHeight)||1))+')';bgs.forEach(function(b){var r=b.parentNode.getBoundingClientRect();b.style.transform='translateY('+(-r.top*.25)+'px) scale('+(1+Math.abs(r.top)/innerHeight*.15)+')'})}
  addEventListener('scroll',onS,{passive:true});onS();
  function hideL(){document.getElementById('loader').classList.add('done')}
  addEventListener('load',function(){setTimeout(hideL,900)});setTimeout(hideL,3000);
  var hv=document.getElementById('hv');
  hv.addEventListener('canplay',function(){hv.classList.add('ok');var p=hv.play();if(p&&p.catch)p.catch(function(){})});
  var bt=document.getElementById('burger'),mn=document.getElementById('menu');
  function tg(o){var on=o===undefined?!mn.classList.contains('open'):o;mn.classList.toggle('open',on);bt.classList.toggle('x',on);bt.setAttribute('aria-expanded',on);document.body.style.overflow=on?'hidden':''}
  bt.onclick=function(){tg()};[].forEach.call(mn.querySelectorAll('a'),function(a){a.onclick=function(){tg(false)}});
  addEventListener('keydown',function(e){if(e.key==='Escape')tg(false)});

  var secs=[].slice.call(document.querySelectorAll('section')),dots=document.getElementById('dots');
  secs.forEach(function(s){var a=document.createElement('a');a.href='#'+s.id;a.setAttribute('aria-label',s.id);dots.appendChild(a)});
  var da=dots.children;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.querySelectorAll('.rv').forEach(function(el,i){setTimeout(function(){el.classList.add('in')},i*120)});
      var i=secs.indexOf(e.target);[].forEach.call(da,function(d,j){d.classList.toggle('on',i===j)})}else{e.target.querySelectorAll('.rv').forEach(function(el){el.classList.remove('in')})}
  })},{threshold:.1});
  secs.forEach(function(s){io.observe(s)});

  document.getElementById('f').addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('name').value.trim(),p=document.getElementById('phone').value.trim();
    document.getElementById('msg').textContent='Thanks '+n+'! I’ll contact you at '+p+' soon.';
    e.target.reset();
  });
})();

// ---- Pro motion layer: smooth scroll, split text, pinned horizontal work, marquee, cursor ----
(function(){
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches,calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};

  // split headings into masked letters
  $$('.split').forEach(function(el){var k=0,out='';el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
    [].slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType===3){n.textContent.trim().split(/\s+/).forEach(function(w){if(!w)return;out+='<span class="w" aria-hidden="true">'+w.split('').map(function(ch){return '<i class="c" style="--i:'+(k++)+'">'+ch+'</i>'}).join('')+'</span> '})}
      else out+=n.outerHTML});
    el.innerHTML=out});
  var sio=new IntersectionObserver(function(es){es.forEach(function(e){var el=e.target;
    if(e.isIntersecting){setTimeout(function(){el.classList.add('in')},el.closest('#top')?1000:0)}
    else if(e.boundingClientRect.top>0){el.classList.remove('in')}})},{threshold:.3});
  $$('.split').forEach(function(el){sio.observe(el)});

  // smooth (inertial) scrolling
  var cur=scrollY,tar=scrollY,run=false;
  function max(){return document.documentElement.scrollHeight-innerHeight}
  function loop(){cur+=(tar-cur)*.085;if(Math.abs(tar-cur)<.4)cur=tar;scrollTo(0,cur);if(cur!==tar)requestAnimationFrame(loop);else run=false}
  function go(y){tar=Math.max(0,Math.min(max(),y));if(calm){scrollTo(0,tar);return}if(!run){run=true;requestAnimationFrame(loop)}}
  if(!calm){
    addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();go(tar+e.deltaY*(e.deltaMode===1?32:1))},{passive:false});
    addEventListener('scroll',function(){if(!run)cur=tar=scrollY},{passive:true});
  }
  $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();go(t.getBoundingClientRect().top+scrollY)})});

  // per-frame scroll-driven motion
  var hero=$('#top'),hs=$('#work'),tr=$('.track'),hpf=$('#hpf'),bw=$('#bw'),secs=$$('section'),dots=$$('#dots a'),last=scrollY,vel=0;
  function frame(){
    var y=scrollY;vel+=((y-last)-vel)*.1;last=y;
    hero.style.setProperty('--p',Math.min(1,y/innerHeight).toFixed(3));
    document.documentElement.style.setProperty('--dim',Math.min(1,Math.max(0,(y-innerHeight*.35)/(innerHeight*.6))).toFixed(3));
    var r=hs.getBoundingClientRect(),q=Math.min(1,Math.max(0,-r.top/(hs.offsetHeight-innerHeight||1))),dist=Math.max(0,tr.scrollWidth-innerWidth);
    tr.style.transform='translate3d('+(-q*dist)+'px,0,0) skewX('+Math.max(-5,Math.min(5,-vel*.06))+'deg)';
    hpf.style.transform='scaleX('+q+')';
    bw.style.transform='translate3d('+((bw.getBoundingClientRect().top-innerHeight)*.12)+'px,0,0)';
    var a=0;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<innerHeight*.5)a=i});
    dots.forEach(function(d,i){d.classList.toggle('on',i===a)});
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);

  // day / night theme
  var tb=$('#theme');if(tb)tb.addEventListener('click',function(){var t=document.documentElement.getAttribute('data-theme')==='day'?'night':'day';document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('theme',t)}catch(e){}});

  // card spotlight
  $$('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-b.left)+'px');c.style.setProperty('--my',(e.clientY-b.top)+'px')})});

  // custom cursor + magnetic buttons (mouse only)
  if(fine){
    document.body.classList.add('fine');
    var cu=$('#cur'),cx=-100,cy=-100,tx=-100,ty=-100;
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY});
    document.addEventListener('pointerover',function(e){cu.classList.toggle('h',!!e.target.closest('a,button,.card,input'))});
    (function cl(){cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;cu.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(cl)})();
    $$('.cta,#burger,#theme,.contact a').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.3)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''})});
  }
})();