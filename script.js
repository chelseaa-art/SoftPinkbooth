const $=id=>document.getElementById(id);
const FILTERS={'Normal':['#fff',0,'source-over'],'Soft Blush':['#ffc2d6',.18,'source-over'],'Peach':['#ffd7c0',.22,'source-over'],'Lilac':['#e3ccff',.18,'source-over'],'Vintage':['#efd6bb',.3,'multiply'],'Dreamy':['#ffe3f0',.4,'soft-light']};
const FRAMES={'Blush':['#fde3ec','#e58aa8'],'Baby':['#fff0f5','#ee9fb9'],'Peach':['#ffe9de','#e8a38a'],'Lilac':['#f1e8ff','#b794e8'],'Mint':['#e3f7ec','#7fc4a2'],'Cream':['#fff9e8','#e0b97a'],'Sky':['#e6f1ff','#8fb8e8'],'Putih':['#ffffff','#ee9fb9']};
const PAL=['🎀','💗','💖','✨','🌸','🌷','🐰','🐱','🍓','🍒','⭐','☁️','🌈','🦋','🧸','💌','🤍','🫧','🐾','👑'];
const S={mode:'Kamera',n:3,timer:3,layout:'Vertikal',fl:'Soft Blush',fr:'Baby'};
const R={shots:[],placed:[],sel:'🎀',size:64};
let stream=null,aborted=false,busy=false,camTry=false,camFail=false;

function chips(id,list,get,set,fmt){
  const el=$(id);el.innerHTML='';
  list.forEach(k=>{
    const b=document.createElement('button');b.className='chip'+(get()===k?' on':'');
    b.textContent=fmt?fmt(k):k;b.onclick=()=>{if(!busy){set(k);render()}};el.appendChild(b);
  });
}
function swatches(id){
  const el=$(id);el.innerHTML='';
  Object.keys(FRAMES).forEach(k=>{
    const b=document.createElement('button');b.className='sw'+(S.fr===k?' on':'');
    b.style.background=FRAMES[k][0];b.title=k;b.onclick=()=>{S.fr=k;render();if(R.shots.length)draw()};el.appendChild(b);
  });
}
function render(){
  const up=S.mode==='Upload';
  chips('modes',['Kamera','Upload'],()=>S.mode,v=>S.mode=v,k=>k==='Kamera'?'📷 Kamera':'🖼️ Upload foto');
  chips('counts',[1,2,3,4,6],()=>S.n,v=>S.n=v,k=>k+' foto');
  chips('timers',[3,5,10],()=>S.timer,v=>S.timer=v,k=>k+' detik');
  chips('layouts',['Vertikal','Grid'],()=>S.layout,v=>{S.layout=v},k=>k==='Vertikal'?'Strip vertikal':'Grid 2 kolom');
  chips('filters',Object.keys(FILTERS),()=>S.fl,v=>S.fl=v);
  chips('rfilters',Object.keys(FILTERS),()=>S.fl,v=>{S.fl=v;setTimeout(draw,0)});
  chips('sizes',[40,64,96],()=>R.size,v=>R.size=v,k=>k===40?'Kecil':k===64?'Sedang':'Besar');
  swatches('frames');swatches('rframes');
  const pal=$('pal');pal.innerHTML='';
  PAL.forEach(e=>{const b=document.createElement('button');b.className='em'+(R.sel===e?' on':'');b.textContent=e;b.onclick=()=>{R.sel=e;render()};pal.appendChild(b)});
  $('timerSec').classList.toggle('hide',up);
  $('v').classList.toggle('hide',up);
  $('go').textContent=up?'🖼️ Pilih foto':'📸 Mulai';
  const ph=$('ph');
  if(up){ph.textContent='Pilih sampai '+S.n+' foto dari galeri.';ph.classList.remove('hide')}
  else if(camFail){ph.textContent='Kamera tidak bisa diakses. Coba mode 🖼️ Upload foto.';ph.classList.remove('hide')}
  else if(!stream){ph.textContent='Menunggu kamera…';ph.classList.remove('hide')}
  else ph.classList.add('hide');
  const [c,a,m]=FILTERS[S.fl];
  const t=$('tint');t.style.background=c;t.style.opacity=a;t.style.mixBlendMode=m==='source-over'?'normal':m;
  if(!up)initCam();
}
async function initCam(){
  if(stream||camTry||camFail)return;camTry=true;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});$('v').srcObject=stream}
  catch(e){camFail=true}
  camTry=false;render();
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const W=440,H=330,P=40,G=18,F=110;
function grab(src,sw,sh,mirror){
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const r=Math.max(W/sw,H/sh),dw=sw*r,dh=sh*r;
  x.save();if(mirror){x.translate(W,0);x.scale(-1,1)}
  x.drawImage(src,(W-dw)/2,(H-dh)/2,dw,dh);x.restore();
  return c;
}
async function capture(){
  const shots=[],v=$('v');
  for(let i=0;i<S.n;i++){
    $('prog').textContent='Foto '+(i+1)+' dari '+S.n;
    for(let t=S.timer;t>0;t--){if(aborted)return null;$('cd').textContent=t;await sleep(1000)}
    if(aborted)return null;
    $('cd').textContent='';
    shots.push(grab(v,v.videoWidth||640,v.videoHeight||480,true));
    const f=$('flash');f.style.transition='none';f.style.opacity=1;await sleep(60);
    f.style.transition='opacity .4s';f.style.opacity=0;await sleep(700);
  }
  return shots;
}
async function fromFiles(files){
  const shots=[];
  for(const f of files.slice(0,S.n)){const im=await createImageBitmap(f);shots.push(grab(im,im.width,im.height,false))}
  return shots;
}

function draw(){
  const [bg,ac]=FRAMES[S.fr],n=R.shots.length;
  const cols=S.layout==='Grid'&&n>1?2:1,rows=Math.ceil(n/cols);
  const c=$('c'),x=c.getContext('2d');
  c.width=P*2+cols*W+(cols-1)*G;c.height=P+rows*H+(rows-1)*G+F;
  x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
  x.fillStyle=ac;x.globalAlpha=.22;x.font='22px serif';x.textAlign='left';x.textBaseline='alphabetic';
  for(let i=0;i<45;i++)x.fillText(i%3?'♡':'✿',(i*97)%c.width,(i*61)%c.height);
  x.globalAlpha=1;
  const [fc,fa,fm]=FILTERS[S.fl];
  R.shots.forEach((s,i)=>{
    const cx=P+(i%cols)*(W+G),cy=P+Math.floor(i/cols)*(H+G);
    x.fillStyle='#fff';x.fillRect(cx-7,cy-7,W+14,H+14);x.drawImage(s,cx,cy);
    x.globalCompositeOperation=fm;x.globalAlpha=fa;x.fillStyle=fc;x.fillRect(cx,cy,W,H);
    x.globalCompositeOperation='source-over';x.globalAlpha=1;
  });
  x.fillStyle=ac;x.textAlign='center';
  x.font='bold 32px "Trebuchet MS",sans-serif';x.fillText('♡ soft pink booth ♡',c.width/2,c.height-62);
  x.font='20px "Trebuchet MS",sans-serif';
  x.fillText(new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),c.width/2,c.height-30);
  x.textBaseline='middle';
  R.placed.forEach(p=>{x.font=p.s+'px serif';x.fillText(p.e,p.x,p.y)});
}
function show(shots){
  R.shots=shots;R.placed=[];
  $('out').classList.add('hide');$('c').classList.remove('hide');
  render();draw();
  $('booth').classList.add('hide');$('res').classList.remove('hide');
}
$('c').onclick=e=>{
  const c=$('c'),r=c.getBoundingClientRect();
  R.placed.push({e:R.sel,s:R.size,x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height});
  draw();
};
$('undo').onclick=()=>{R.placed.pop();draw()};
$('clr').onclick=()=>{R.placed=[];draw()};

async function run(job){
  busy=true;aborted=false;$('err').classList.add('hide');
  $('go').classList.add('hide');$('stop').classList.toggle('hide',S.mode==='Upload');
  try{const shots=await job();if(shots&&shots.length)show(shots)}
  catch(e){$('err').textContent='Gagal memproses foto.';$('err').classList.remove('hide')}
  $('cd').textContent='';$('prog').textContent='';
  busy=false;$('go').classList.remove('hide');$('stop').classList.add('hide');
}
$('go').onclick=()=>{
  if(busy)return;
  if(S.mode==='Upload'){$('file').click();return}
  if(!stream){$('err').textContent='Kamera belum siap. Izinkan akses kamera atau pakai mode Upload.';$('err').classList.remove('hide');return}
  run(capture);
};
$('file').onchange=e=>{const f=[...e.target.files];e.target.value='';if(f.length)run(()=>fromFiles(f))};
$('stop').onclick=()=>{aborted=true};
$('again').onclick=()=>{R.shots=[];R.placed=[];$('res').classList.add('hide');$('booth').classList.remove('hide');$('dlnote').textContent='';render()};
$('dl').onclick=async()=>{
  const note=$('dlnote'),c=$('c');
  const fallback=()=>{$('out').src=c.toDataURL('image/png');$('out').classList.remove('hide');c.classList.add('hide');note.textContent='Tekan lama (HP) atau klik kanan (laptop) pada gambar lalu simpan.'};
  try{
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='soft-pink-booth.png';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    note.textContent='Tersimpan 💗';
  }catch(e){if(e&&e.code==='declined')note.textContent='Download dibatalkan.';else fallback()}
};
render();
