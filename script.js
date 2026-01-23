let lang = "ar";
const display = document.getElementById("display");
const canvas  = document.getElementById("canvas");
const ctx     = canvas.getContext("2d");

/* نصوص متعدد اللغات */
const texts = {
  ar: { error:"خطأ", solved:"حل المعادلة:", prompt:"x =", eq:"y = " },
  en: { error:"Error", solved:"Equation solved:", prompt:"x =", eq:"y = " }
};

/* إدخال / مسح */
function add(v){ if(display.innerText==="0") display.innerText=""; display.innerText+=v; }
function clr(){ display.innerText="0"; }

/* تحويل التعبير لدوال JavaScript */
function parse(expr,x=null){
  let e = expr
    .replace(/sin\(/g,"Math.sin(")
    .replace(/cos\(/g,"Math.cos(")
    .replace(/tan\(/g,"Math.tan(")
    .replace(/sqrt\(/g,"Math.sqrt(")
    .replace(/log\(/g,"Math.log10(");
  while(e.includes("^")){
    e = e.replace(/(\([^()]+\)|-?\d+(\.\d+)?|x)\^(\([^()]+\)|-?\d+(\.\d+)?|x)/,
      "Math.pow($1,$3)");
  }
  if(x!==null) e = e.replace(/x/g, `(${x})`);
  return e;
}

/* الحساب */
function calc(){
  try{ display.innerText = eval(parse(display.innerText)); }
  catch{ display.innerText = texts[lang].error; }
}

/* الرسم البياني التفاعلي - نسخة محسّنة */
let offsetX = 0, zoom = 20;

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "#00c6ff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let first=true;
  for(let x=-10; x<=10; x+=0.05){ // قللت عدد النقاط لتسريع الأداء
    let y;
    try{
      y = eval(parse(display.innerText,x));
      if(isNaN(y) || !isFinite(y)) continue; // تجاهل القيم غير صحيحة
    } catch { continue; }

    let px = (x*zoom + canvas.width/2 + offsetX);
    let py = canvas.height/2 - y*zoom;

    if(first){ ctx.moveTo(px,py); first=false; }
    else ctx.lineTo(px,py);
  }
  ctx.stroke();

  // رسم المحاور
  ctx.strokeStyle="#fff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0,canvas.height/2); ctx.lineTo(canvas.width,canvas.height/2);
  ctx.moveTo(canvas.width/2+offsetX,0); ctx.lineTo(canvas.width/2+offsetX,canvas.height);
  ctx.stroke();
}

/* حل المعادلات خطية وتربيعية */
function solveEquation(){
  try{
    let eq = display.innerText.replace(/\s/g,'');
    if(eq.includes("^2")){
      let match = eq.match(/([+-]?\d*\.?\d*)\*?x\^2([+-]\d*\.?\d*)\*?x?([+-]\d*\.?\d*)?=/);
      if(match){
        let a = parseFloat(match[1])||1;
        let b = parseFloat(match[2])||0;
        let c = parseFloat(match[3])||0;
        let D = b*b-4*a*c;
        if(D<0){ alert(texts[lang].error); return; }
        let sol1 = (-b+Math.sqrt(D))/(2*a);
        let sol2 = (-b-Math.sqrt(D))/(2*a);
        alert(`${texts[lang].solved} x = ${sol1}, ${sol2}`);
        return;
      }
    }else{
      let match = eq.match(/([+-]?\d*\.?\d*)\*?x([+-]\d*\.?\d*)?=/);
      if(match){
        let a = parseFloat(match[1])||1;
        let b = parseFloat(match[2])||0;
        let sol = -b/a;
        alert(`${texts[lang].solved} x = ${sol}`);
        return;
      }
    }
    alert(texts[lang].error);
  }catch{alert(texts[lang].error);}
}

/* حفظ الرسم كصورة PNG */
function saveGraph() {
  canvas.toBlob(function(blob) {
    if(blob){
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'graph.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("فشل حفظ الصورة!");
    }
  }, 'image/png');
}

/* لوحة المفاتيح */
document.addEventListener("keydown", e=>{
  if("0123456789+-*/().^x".includes(e.key)) add(e.key);
  if(e.key==="Enter") calc();
  if(e.key==="Backspace") display.innerText = display.innerText.slice(0,-1)||"0";
});

/* الوضع الليلي */
document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light");

/* تبديل اللغة */
document.getElementById("langBtn").onclick = () => lang = lang==="ar"?"en":"ar";

/* تحريك الرسم بالماوس */
let isDragging=false, startX=0;
canvas.addEventListener("mousedown",e=>{isDragging=true; startX=e.offsetX;});
canvas.addEventListener("mouseup",()=>{isDragging=false;});
canvas.addEventListener("mousemove",e=>{
  if(isDragging){ offsetX += e.offsetX-startX; startX=e.offsetX; draw(); }
});

/* عجلة الماوس لتكبير/تصغير الرسم */
canvas.addEventListener("wheel",e=>{
  e.preventDefault();
  zoom += e.deltaY* -0.01;
  if(zoom<5) zoom=5;
  draw();
});

/* دالة تجربة سريعة */
function testGraph(expr){
  display.innerText = expr;
  draw();
  saveGraph();
}
