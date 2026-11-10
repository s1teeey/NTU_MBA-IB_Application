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
    ["sharing.html","推甄須知"],
    [lastDept,"師資陣容",PROF],
    ["docs.html","書審撰寫"],
    ["interview.html","面試準備"],
    ["faq.html","FAQ"],
  ];
  const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;

  const bar=document.createElement("header");bar.className="topbar";
  bar.innerHTML='<div class="wrap"><a class="brand" href="./">台大商研、國企<span>推甄分享</span></a>'+
    '<nav class="menu" aria-label="主選單">'+PAGES.map(([h,t,also])=>'<a href="'+h+'"'+(h===here||(also&&also.includes(here))?' aria-current="page"':"")+'>'+t+'</a>').join("")+'</nav>'+
    '<div class="search" role="search"><input type="search" placeholder="搜尋" aria-label="搜尋全站" autocomplete="off"><div class="sresults" hidden></div></div>'+
    '<button class="theme-btn" type="button"></button></div>';
  document.body.prepend(bar);
  const head=document.querySelector(".page-head");
  if(head&&document.querySelector("[data-d]")&&!PROF.includes(here)){
    const f=document.createElement("div");f.className="only";f.setAttribute("role","group");f.setAttribute("aria-label","只看哪一所");
    f.innerHTML='<span>顯示：</span>'+[["","全部"],["ba","商研"],["ib","國企"]].map(([v,t])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(only===v)+'"><span class="'+(v?"hl-"+v:"hl-all")+'">'+t+'</span></button>').join('<i>｜</i>');
    head.appendChild(f);
  }
  document.querySelectorAll(".only button").forEach(b=>b.onclick=()=>{
    const v=b.dataset.v;try{v?localStorage.setItem("only",v):localStorage.removeItem("only")}catch(e){}
    if(v&&PROF.includes(here)&&here!==v+".html"){location.href=v+".html";return}
    if(v)root.dataset.only=v;else delete root.dataset.only;
    document.querySelectorAll(".only button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    const pl=bar.querySelector('.menu a[href="ba.html"],.menu a[href="ib.html"]');if(pl&&v)pl.setAttribute("href",v+".html");
  });
  const btn=bar.querySelector(".theme-btn");
  const paint=()=>{btn.textContent=isDark()?"淺色":"深色"};
  btn.onclick=()=>{const t=isDark()?"light":"dark";root.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}paint()};
  paint();
  const cur=bar.querySelector('[aria-current="page"]');if(cur)cur.scrollIntoView({block:"nearest",inline:"center"});

  const foot=document.createElement("footer");foot.className="foot";
  foot.innerHTML='<div class="wrap"><span>招生規定請依當年度台大簡章為準。</span>'+
    (FORM_URL?'<a href="'+FORM_URL+'" target="_blank" rel="noopener">投稿・提問</a>':'')+'</div>';
  document.body.appendChild(foot);
  document.querySelectorAll("[data-form]").forEach(el=>{
    if(!FORM_URL){el.hidden=true;return}
    el.querySelectorAll("a.form-link").forEach(a=>{a.href=FORM_URL;a.target="_blank";a.rel="noopener"});
  });
  buildRail();
  const sc=document.createElement("script");sc.src="assets/search.js?v=202611102256";document.body.appendChild(sc);
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

