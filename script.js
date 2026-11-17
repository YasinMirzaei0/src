(function(){
  var c=document.getElementById('stars'),x=c.getContext('2d'),S=[],w,h;
  function size(){w=c.width=innerWidth;h=c.height=innerHeight;S=[];for(var i=0;i<260;i++){var z=Math.random();S.push({x:Math.random()*w,y:Math.random()*h,z:z,r:z*1.4+.2,v:z*.25+.03})}}
  size();addEventListener('resize',size);
  var vel=0,last=0;function tick(){var d=scrollY-last;last=scrollY;vel+=(d-vel)*.12;x.clearRect(0,0,w,h);x.fillStyle='#fff';S.forEach(function(s){s.y-=s.v+vel*s.z*.9;if(s.y<0)s.y+=h;if(s.y>h)s.y-=h;x.globalAlpha=.3+s.z*.7;if(Math.abs(vel)>6){x.fillRect(s.x,s.y,s.r,s.r+Math.abs(vel)*s.z*1.2)}else{x.beginPath();x.arc(s.x,s.y,s.r,0,6.3);x.fill()}});requestAnimationFrame(tick)}
  tick();

  var nav=document.getElementById('nav');
  var bar=document.getElementById('bar'),bgs=[].slice.call(document.querySelectorAll('.bg'));
  function onS(){nav.classList.toggle('solid',scrollY>40);bar.style.transform='scaleX('+(scrollY/((document.documentElement.scrollHeight-innerHeight)||1))+')';bgs.forEach(function(b){var r=b.parentNode.getBoundingClientRect();b.style.transform='translateY('+(-r.top*.25)+'px) scale('+(1+Math.abs(r.top)/innerHeight*.15)+')'})}
  addEventListener('scroll',onS,{passive:true});onS();
  function hideL(){document.getElementById('loader').classList.add('done')}
  addEventListener('load',function(){setTimeout(hideL,900)});setTimeout(hideL,3000);
  (function(){
    var cv=document.getElementById('gl'),gl=cv.getContext('webgl',{antialias:false,alpha:false});
    if(!gl){cv.remove();return}
    var fs=`precision mediump float;uniform vec2 R;uniform vec2 M;uniform float T;uniform float S;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return s;}
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;vec2 p=uv+(M-.5)*.07;float t=T*.035;
      vec2 q=vec2(fbm(p*2.+t),fbm(p*2.+vec2(5.2,1.3)-t));
      float f=fbm(p*2.2+q*1.8+S*.0005);
      vec3 col=vec3(.01,.015,.045);
      col+=mix(vec3(.05,.1,.38),vec3(.55,.15,.65),q.x)*f*f*1.7;
      col+=vec3(0.,.35,.55)*pow(fbm(p*3.-q),3.)*.9;
      vec2 g=gl_FragCoord.xy/R.y*34.;float r=h(floor(g));
      col+=step(.982,r)*(1.-smoothstep(0.,.35,length(fract(g)-.5)))*(.6+.4*sin(T*2.+r*40.));
      vec2 c=vec2(0.,-1.5-S*.0007);float e=length(uv-c)-1.45;
      float out_=step(0.,e);
      col+=out_*vec3(.25,.55,1.)*exp(-max(e,0.)*8.)*.95;
      col+=vec3(.75,.92,1.)*exp(-abs(e)*70.)*1.3;
      float au=exp(-e*6.)*(.5+.5*sin(uv.x*6.+fbm(uv*3.+T*.1)*6.+T*.5));
      col+=out_*vec3(.1,1.,.65)*au*smoothstep(0.,.05,e)*.32;
      vec3 land=mix(vec3(.01,.04,.13),vec3(.03,.14,.34),fbm(uv*6.+vec2(T*.01,0.)));
      land+=vec3(.75,.85,1.)*smoothstep(.55,.85,fbm(uv*5.+vec2(T*.02,3.)))*.45;
      land*=.35+1.1*smoothstep(-.4,0.,e);
      col=mix(col,land,1.-out_);
      col*=1.-.35*dot(uv,uv);
      gl_FragColor=vec4(pow(col,vec3(.92)),1.);
    }`;
    function mk(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o}
    var pr=gl.createProgram();
    gl.attachShader(pr,mk(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
    gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.remove();return}
    gl.useProgram(pr);
    var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var la=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,false,0,0);
    var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uS=gl.getUniformLocation(pr,'S'),uM=gl.getUniformLocation(pr,'M');
    var mx=.5,my=.5,sx=.5,sy=.5;
    addEventListener('pointermove',function(e){mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight},{passive:true});
    function rs(){var k=Math.min(devicePixelRatio||1,1)*.75;cv.width=Math.round(cv.clientWidth*k);cv.height=Math.round(cv.clientHeight*k);gl.viewport(0,0,cv.width,cv.height)}
    rs();addEventListener('resize',rs);
    var calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
    function draw(ts){
      if(scrollY<innerHeight*1.3&&cv.style.display!=='none'){sx+=(mx-sx)*.05;sy+=(my-sy)*.05;
        gl.uniform2f(uR,cv.width,cv.height);gl.uniform2f(uM,sx,sy);gl.uniform1f(uT,calm?8:ts/1000);gl.uniform1f(uS,scrollY);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
      if(!calm)requestAnimationFrame(draw)}
    requestAnimationFrame(draw);
  })();
  var hv=document.getElementById('hv');
  hv.addEventListener('canplay',function(){hv.classList.add('ok');var g=document.getElementById('gl');if(g)g.style.display='none';var p=hv.play();if(p&&p.catch)p.catch(function(){})});
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
  })},{threshold:.4});
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
  var hero=$('#top'),hs=$('#work'),tr=$('.track'),hpf=$('#hpf'),mq=$('.mq'),bw=$('#bw'),secs=$$('section'),dots=$$('#dots a'),mx=0,last=scrollY,vel=0;
  mq.innerHTML+=mq.innerHTML;
  function frame(){
    var y=scrollY;vel+=((y-last)-vel)*.1;last=y;
    hero.style.setProperty('--p',Math.min(1,y/innerHeight).toFixed(3));
    var r=hs.getBoundingClientRect(),q=Math.min(1,Math.max(0,-r.top/(hs.offsetHeight-innerHeight||1))),dist=Math.max(0,tr.scrollWidth-innerWidth);
    tr.style.transform='translate3d('+(-q*dist)+'px,0,0) skewX('+Math.max(-5,Math.min(5,-vel*.06))+'deg)';
    hpf.style.transform='scaleX('+q+')';
    mx-=1.2+vel*.5;var w=mq.scrollWidth/2;if(mx<-w)mx+=w;if(mx>0)mx-=w;mq.style.transform='translate3d('+mx+'px,0,0)';
    bw.style.transform='translate3d('+((bw.getBoundingClientRect().top-innerHeight)*.12)+'px,0,0)';
    var a=0;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<innerHeight*.5)a=i});
    dots.forEach(function(d,i){d.classList.toggle('on',i===a)});
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);

  // card spotlight
  $$('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-b.left)+'px');c.style.setProperty('--my',(e.clientY-b.top)+'px')})});

  // custom cursor + magnetic buttons (mouse only)
  if(fine){
    document.body.classList.add('fine');
    var cu=$('#cur'),cx=-100,cy=-100,tx=-100,ty=-100;
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY});
    document.addEventListener('pointerover',function(e){cu.classList.toggle('h',!!e.target.closest('a,button,.card,input'))});
    (function cl(){cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;cu.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(cl)})();
    $$('.cta,#burger,.contact a').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.3)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''})});
  }
})();