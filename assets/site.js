/* Header, theme switch and footer shared by every page. */
/* 投稿・提問表單（Google 表單）。留空時，網站上的投稿區塊和頁尾連結都不會顯示。 */
const FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdNOxn6wqQEmNaLYmEl9rO97Q0kYJ0R5NuswYG7o_WKHHpoiw/viewform";
(function(){
  const here=(location.pathname.split("/").pop()||"index.html");
  const root=document.documentElement;
  try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")root.dataset.theme=t}catch(e){}
  // 師資陣容：商研、國企同一個選單項目，連到上次看的那一所
  const PROF=["ba.html","ib.html"];
  let only="";try{only=localStorage.getItem("only")||""}catch(e){}
  if(only)root.dataset.only=only;
  let lastDept="ba.html";
  try{if(PROF.includes(here))localStorage.setItem("dept",here);const d=localStorage.getItem("dept");if(PROF.includes(d))lastDept=d}catch(e){}
  if(only)lastDept=only+".html";
  const PAGES=[
    ["sharing.html","簡章細則"],
    [lastDept,"師資陣容",PROF],
    ["docs.html","書審撰寫"],
    ["interview.html","面試準備"],
    ["faq.html","FAQ"],
  ];
  let theme="";try{theme=localStorage.getItem("theme")||""}catch(e){}

  // 顯示設定：外觀（淺色/深色/跟隨系統）＋系所（All/商研/國企）
  const ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
  const opts=(k,cur,list)=>'<div class="opts" data-k="'+k+'">'+list.map(([v,t,hl])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(cur===v)+'"><span class="'+hl+'">'+t+'</span></button>').join("")+'</div>';
  const bar=document.createElement("header");bar.className="topbar";
  bar.innerHTML='<div class="wrap"><a class="brand" href="./"><span>推甄分享</span>｜台大商研、台大國企</a>'+
    '<nav class="menu" aria-label="主選單">'+PAGES.map(([h,t,also])=>'<a href="'+h+'"'+(h===here||(also&&also.includes(here))?' aria-current="page"':"")+'>'+t+'</a>').join("")+'</nav>'+
    '<div class="search" role="search"><input type="search" placeholder="搜尋" aria-label="搜尋全站" autocomplete="off"><div class="sresults" hidden></div></div>'+
    '<div class="prefs"><button class="prefs-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="顯示設定" title="顯示設定">'+ICON+'</button>'+
    '<div class="prefs-pop">'+
      '<p class="grp">外觀</p>'+opts("theme",theme,[["","跟隨系統","hl-all"],["light","淺色","hl-all"],["dark","深色","hl-all"]])+
      '<p class="grp">系所</p>'+opts("only",only,[["","All","hl-all"],["ba","商研","hl-ba"],["ib","國企","hl-ib"]])+
    '</div></div></div>';
  document.body.prepend(bar);
  const prefs=bar.querySelector(".prefs"),pbtn=bar.querySelector(".prefs-btn");
  pbtn.onclick=()=>{const o=!prefs.classList.contains("open");prefs.classList.toggle("open",o);pbtn.setAttribute("aria-expanded",String(o))};
  document.addEventListener("click",e=>{if(!prefs.contains(e.target)){prefs.classList.remove("open");pbtn.setAttribute("aria-expanded","false")}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){prefs.classList.remove("open");pbtn.setAttribute("aria-expanded","false")}});
  const press=(k,b)=>bar.querySelectorAll('.opts[data-k="'+k+'"] button').forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  bar.querySelectorAll('.opts[data-k="theme"] button').forEach(b=>b.onclick=()=>{
    const v=b.dataset.v;try{v?localStorage.setItem("theme",v):localStorage.removeItem("theme")}catch(e){}
    if(v)root.dataset.theme=v;else delete root.dataset.theme;press("theme",b);
  });
  bar.querySelectorAll('.opts[data-k="only"] button').forEach(b=>b.onclick=()=>{
    const v=b.dataset.v;try{v?localStorage.setItem("only",v):localStorage.removeItem("only")}catch(e){}
    if(v&&PROF.includes(here)&&here!==v+".html"){location.href=v+".html";return}
    if(v)root.dataset.only=v;else delete root.dataset.only;press("only",b);notice();
    const pl=bar.querySelector('.menu a[href="ba.html"],.menu a[href="ib.html"]');if(pl&&v)pl.setAttribute("href",v+".html");
  });
  // 有系所篩選時，在頁首明講，避免內容「不見了」
  function notice(){
    let n=document.querySelector(".only-note");
    const v=root.dataset.only, head=document.querySelector(".page-head");
    if(!v||!head||PROF.includes(here)||!document.querySelector("[data-d]")){if(n)n.remove();return}
    if(!n){n=document.createElement("p");n.className="only-note";head.appendChild(n)}
    n.innerHTML='目前只顯示<span class="hl-'+v+'">'+(v==="ba"?"商研":"國企")+'</span>的內容。<button type="button">顯示兩所</button>';
    n.querySelector("button").onclick=()=>bar.querySelector('.opts[data-k="only"] button[data-v=""]').click();
  }
  notice();
  const cur=bar.querySelector('[aria-current="page"]');if(cur)cur.scrollIntoView({block:"nearest",inline:"center"});

  const foot=document.createElement("footer");foot.className="foot";
  foot.innerHTML='<div class="wrap"><span data-k="site.foot">本網站資訊僅供參考，請以校方公告為準。</span>'+
    (FORM_URL?'<a href="'+FORM_URL+'" target="_blank" rel="noopener">投稿・提問</a>':'')+'</div>';
  document.body.appendChild(foot);
  document.querySelectorAll("[data-form]").forEach(el=>{
    if(!FORM_URL){el.hidden=true;return}
    el.querySelectorAll("a.form-link").forEach(a=>{a.href=FORM_URL;a.target="_blank";a.rel="noopener"});
  });
  buildRail();buildIndex();
  const sc=document.createElement("script");sc.src="assets/search.js?v=20261113200712";document.body.appendChild(sc);
})();

/* Side outline: one dash per heading on the page; hover lists them, click jumps. */
function buildRail(){
  const SEL="main h2, main .card h3.name, main .own h3, main .src-year > .yr, main .src-past h3";
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rail=document.querySelector(".rail");
  if(!rail){rail=document.createElement("nav");rail.className="rail";rail.setAttribute("aria-label","本頁段落");document.body.appendChild(rail)}
  let items=[];
  const label=e=>{
    const c=e.cloneNode(true);c.querySelectorAll(".today").forEach(x=>x.remove());
    const no=c.querySelector(".no");if(no)no.textContent=no.textContent+" ";
    let t=c.textContent.replace(/\s+/g," ").trim();
    if(e.matches(".src-year > .yr"))t+=" 學年度心得";
    return t;
  };
  function draw(){
    items=[...document.querySelectorAll(SEL)].filter(e=>e.offsetParent!==null&&!e.closest("aside"));
    rail.innerHTML="";
    if(items.length<3){rail.hidden=true;return}
    rail.hidden=false;
    const pop=document.createElement("div");pop.className="rail-pop";
    items.forEach((e,i)=>{
      const target=e.closest(".card,.src-year,.own")||e;
      const go=ev=>{ev.preventDefault();target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
      const b=document.createElement("button");b.type="button";b.setAttribute("aria-label",label(e));b.onclick=go;rail.appendChild(b);
      const a=document.createElement("a");a.href="#";a.textContent=label(e);a.onclick=go;
      if(e.matches(".card h3.name, .src-year > .yr"))a.className="sub";
      pop.appendChild(a);
    });
    rail.appendChild(pop);
    mark();
  }
  function mark(){
    if(!items.length)return;
    let k=0;items.forEach((e,i)=>{if(e.getBoundingClientRect().top<140)k=i});
    rail.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i===k));
    rail.querySelectorAll(".rail-pop a").forEach((a,i)=>a.classList.toggle("on",i===k));
  }
  let tm;const later=()=>{clearTimeout(tm);tm=setTimeout(draw,120)};
  const main=document.querySelector("main");
  if(main)new MutationObserver(later).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  addEventListener("scroll",mark,{passive:true});addEventListener("resize",later);
  draw();
}


/* Left index: the numbered sections (01 02 03…) of the page, current one marked. */
function buildIndex(){
  const heads=[...document.querySelectorAll("main h2")].filter(h=>h.querySelector(".no")&&!h.closest("aside"));
  if(heads.length<2)return;
  const nav=document.createElement("nav");nav.className="lidx";nav.setAttribute("aria-label","本頁目錄");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const links=heads.map(h=>{
    const sec=h.closest("section")||h;
    const a=document.createElement("a");a.href=sec.id?"#"+sec.id:"#";
    const no=h.querySelector(".no").textContent.trim();
    const t=h.textContent.replace(no,"").replace(/\s+/g," ").trim();
    a.innerHTML='<span class="n">'+no+'</span><span class="t"></span>';a.querySelector(".t").textContent=t;
    a.onclick=e=>{e.preventDefault();sec.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
    nav.appendChild(a);return [sec,a];
  });
  document.body.appendChild(nav);
  const mark=()=>{
    let k=0;links.forEach(([sec],i)=>{if(sec.getBoundingClientRect().top<160)k=i});
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)k=links.length-1;
    links.forEach(([,a],i)=>a.classList.toggle("on",i===k));
    links.forEach(([sec,a])=>{a.hidden=sec.offsetParent===null});
  };
  addEventListener("scroll",mark,{passive:true});addEventListener("resize",mark);mark();
  addEventListener("content",()=>links.forEach(([sec,a],i)=>{const h=heads[i],no=h.querySelector(".no").textContent.trim();a.querySelector(".t").textContent=h.textContent.replace(no,"").replace(/\s+/g," ").trim()}));
}

/* 網站文字：Google 試算表「修改後」欄有填的才覆蓋（試算表需「知道連結的任何人可檢視」）。
   【文字】＝強調，儲存格內換行＝換行。 */
const CONTENT_SHEET="1Ul8bB5FaA3C92hKFSCFK_GFhJsuo_UyEOcEjkTRWuqQ", CONTENT_TAB="推甄分享";
function fmtText(t){
  const esc=String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  return esc.replace(/【([^】]*)】/g,'<mark>$1</mark>').replace(/\r?\n/g,"<br>");
}
function applyContent(map){
  if(!map)return;
  document.querySelectorAll("[data-k]").forEach(el=>{const v=map[el.dataset.k];if(typeof v==="string"&&v.trim()!=="")el.innerHTML=fmtText(v)});
  window.dispatchEvent(new Event("content"));
}
function parseCSV(t){
  const rows=[];let row=[],f="",q=false;
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===","){row.push(f);f=""}else if(c==="\n"){row.push(f);rows.push(row);row=[];f=""}else if(c!=="\r")f+=c}
  if(f||row.length){row.push(f);rows.push(row)}
  return rows;
}
function loadContent(){
  const KEY="content:"+CONTENT_TAB;let cached=null;
  try{cached=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  if(cached)applyContent(cached);
  const url="https://docs.google.com/spreadsheets/d/"+CONTENT_SHEET+"/gviz/tq?tqx=out:csv&headers=1&sheet="+encodeURIComponent(CONTENT_TAB)+"&tq="+encodeURIComponent("select D,E");
  fetch(url).then(r=>r.ok?r.text():Promise.reject()).then(t=>{
    const map={};parseCSV(t).slice(1).forEach(([v,k])=>{k=(k||"").trim();if(k&&v&&v.trim())map[k]=v});
    try{localStorage.setItem(KEY,JSON.stringify(map))}catch(e){}
    if(JSON.stringify(map)!==JSON.stringify(cached))applyContent(map);
  }).catch(()=>{});
}
loadContent();
