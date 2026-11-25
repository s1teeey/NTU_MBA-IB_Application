/* Header, theme switch and footer shared by every page. */
/* 投稿・提問表單（Google 表單）。留空時，網站上的投稿區塊和頁尾連結都不會顯示。 */
const FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdNOxn6wqQEmNaLYmEl9rO97Q0kYJ0R5NuswYG7o_WKHHpoiw/viewform";
(function(){
  const here=(location.pathname.split("/").pop()||"index.html");
  const root=document.documentElement;
  try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")root.dataset.theme=t}catch(e){}
  // 師資名冊：商研、國企同一個選單項目，連到上次看的那一所
  const PROF=["ba.html","ib.html"];
  let only="";try{only=localStorage.getItem("only")||""}catch(e){}
  if(only)root.dataset.only=only;
  let lastDept="ba.html";
  try{if(PROF.includes(here))localStorage.setItem("dept",here);const d=localStorage.getItem("dept");if(PROF.includes(d))lastDept=d}catch(e){}
  if(only)lastDept=only+".html";
  const PAGES=[
    ["sharing.html","簡章細則"],
    ["推甄準備",[["docs.html","書審"],["interview.html","口試"]]],
    ["歷年考古",[["reviews.html","歷年心得文"],[lastDept,"歷年面試官",PROF]]],
    ["my.html","個人心得"],
    ["faq.html","FAQ"],
  ];
  const CARET='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const menuHTML=PAGES.map(([h,t],i)=>{
    if(!Array.isArray(t))return '<a href="'+h+'"'+(h===here?' aria-current="page"':"")+'>'+t+'</a>';
    const cur=t.some(([u,,also])=>u===here||(also&&also.includes(here)));
    return '<button type="button" class="dd-btn" data-i="'+i+'" aria-haspopup="true" aria-expanded="false"'+(cur?' aria-current="page"':"")+'>'+h+'</button>';
  }).join("");
  let theme="";try{theme=localStorage.getItem("theme")||""}catch(e){}

  // 顯示設定：外觀（淺色/深色/跟隨系統）＋系所（All/商研/國企）
  const ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
  const opts=(k,cur,list)=>'<div class="opts" data-k="'+k+'">'+list.map(([v,t,hl])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(cur===v)+'"><span class="'+hl+'">'+t+'</span></button>').join("")+'</div>';
  const bar=document.createElement("header");bar.className="topbar";
  bar.innerHTML='<div class="wrap"><a class="brand" href="./"><span>推甄分享</span>｜台大商研、台大國企</a>'+
    '<nav class="menu" aria-label="主選單">'+menuHTML+'</nav>'+
    '<div class="search" role="search"><input type="search" placeholder="搜尋" aria-label="搜尋全站" autocomplete="off"><div class="sresults" hidden></div></div>'+
    '<div class="prefs"><button class="prefs-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="顯示設定" title="顯示設定">'+ICON+'</button>'+
    '<div class="prefs-pop">'+
      '<p class="grp">外觀</p>'+opts("theme",theme,[["","跟隨系統","hl-all"],["light","淺色","hl-all"],["dark","深色","hl-all"]])+
      '<p class="grp">系所</p>'+opts("only",only,[["","All","hl-all"],["ba","商研","hl-ba"],["ib","國企","hl-ib"]])+
    '</div></div></div>';
  document.body.prepend(bar);
  // 下拉選單：桌機滑過展開，手機點一下展開
  const dd=document.createElement("div");dd.className="dd";dd.hidden=true;bar.appendChild(dd);
  let ddBtn=null,ddTimer=0;
  const ddClose=()=>{if(ddBtn)ddBtn.setAttribute("aria-expanded","false");ddBtn=null;dd.hidden=true};
  const ddOpen=b=>{
    clearTimeout(ddTimer);if(ddBtn===b)return;ddClose();ddBtn=b;b.setAttribute("aria-expanded","true");
    dd.innerHTML=PAGES[b.dataset.i][1].map(([u,t,also])=>'<a href="'+u+'"'+(u===here||(also&&also.includes(here))?' aria-current="page"':"")+'>'+t+'</a>').join("");
    dd.hidden=false;
    const r=b.getBoundingClientRect(),br=bar.getBoundingClientRect();
    dd.style.top=(r.bottom-br.top)+"px";
    dd.style.left=Math.max(8,Math.min(r.left-br.left-18,br.width-dd.offsetWidth-8))+"px";
  };
  const fine=matchMedia("(hover:hover)").matches;
  bar.querySelectorAll(".dd-btn").forEach(b=>{
    b.addEventListener("click",e=>{e.stopPropagation();(ddBtn===b&&!fine)?ddClose():ddOpen(b)});
    if(fine){b.addEventListener("mouseenter",()=>ddOpen(b));b.addEventListener("mouseleave",()=>{ddTimer=setTimeout(ddClose,180)})}
  });
  if(fine){dd.addEventListener("mouseenter",()=>clearTimeout(ddTimer));dd.addEventListener("mouseleave",()=>{ddTimer=setTimeout(ddClose,180)})}
  document.addEventListener("click",e=>{if(!dd.contains(e.target))ddClose()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")ddClose()});
  bar.querySelector(".menu").addEventListener("scroll",ddClose,{passive:true});
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
  const sc=document.createElement("script");sc.src="assets/search.js?v=1795578158";document.body.appendChild(sc);
})();

/* Side outline: one dash per heading on the page; hover lists them, click jumps. */
function buildRail(){
  const SEL="main h2, main .card h3.name, main .own h3, main .src-year > .yr, main .src-past h3";
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rail=document.querySelector(".rail");
  if(!rail){rail=document.createElement("nav");rail.className="rail";rail.setAttribute("aria-label","本頁段落");document.body.appendChild(rail)}
  let items=[];
  const label=e=>{
    const c=e.cloneNode(true);c.querySelectorAll(".today,small").forEach(x=>x.remove());
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
    const hc=h.cloneNode(true);hc.querySelectorAll("small").forEach(x=>x.remove());
    const t=hc.textContent.replace(no,"").replace(/\s+/g," ").trim();
    a.innerHTML='<span class="n">'+no+'</span><span class="t"></span>';a.querySelector(".t").textContent=t;
    a.onclick=e=>{e.preventDefault();sec.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
    const g=document.createElement("div");g.className="grp";g.appendChild(a);
    const subs=[...sec.querySelectorAll("h3")].filter(x=>!x.closest("aside,details,.rec"));
    if(subs.length>1){const sb=document.createElement("div");sb.className="sub";
      subs.forEach(x=>{const c=x.cloneNode(true);c.querySelectorAll("small,.who").forEach(y=>y.remove());
        const s=document.createElement("a");s.href="#";s.textContent=c.textContent.replace(/\s+/g," ").trim();s.title=s.textContent;
        s.onclick=e=>{e.preventDefault();scrollTo({top:x.getBoundingClientRect().top+scrollY-90,behavior:reduce?"auto":"smooth"})};sb.appendChild(s)});
      g.appendChild(sb)}
    nav.appendChild(g);return [sec,a];
  });
  document.body.appendChild(nav);
  const mark=()=>{
    let k=0;links.forEach(([sec],i)=>{if(sec.getBoundingClientRect().top<160)k=i});
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)k=links.length-1;
    links.forEach(([,a],i)=>a.classList.toggle("on",i===k));
    links.forEach(([sec,a])=>{a.hidden=sec.offsetParent===null});
  };
  addEventListener("scroll",mark,{passive:true});addEventListener("resize",mark);mark();
  addEventListener("content",()=>links.forEach(([sec,a],i)=>{const h=heads[i],no=h.querySelector(".no").textContent.trim();const hc=h.cloneNode(true);hc.querySelectorAll("small").forEach(x=>x.remove());a.querySelector(".t").textContent=hc.textContent.replace(no,"").replace(/\s+/g," ").trim()}));
}

/* 可勾選清單：<ol|ul data-check="key">。預設項目＝清單內容（後台改這份）；
   訪客的勾選、新增、刪除只存在自己的瀏覽器。後台編輯區裡不啟用。 */
(function(){
  if(window.frameElement&&window.frameElement.id==="ed")return;
  document.querySelectorAll("[data-check]").forEach(list=>{
    const key="check:"+list.dataset.check;
    const defs=[...list.children].map(li=>{const c=li.cloneNode(true);const sm=c.querySelector("small");const n=sm?sm.innerHTML:"";if(sm)sm.remove();return {h:c.innerHTML.trim(),n}});
    const sig=JSON.stringify(defs);
    const fresh=()=>({sig,custom:false,items:defs.map(d=>({h:d.h,n:d.n,done:false}))});
    let st=null;try{st=JSON.parse(localStorage.getItem(key)||"null")}catch(e){}
    if(!st||(st.sig!==sig&&!st.custom))st=fresh();
    const save=()=>{try{localStorage.setItem(key,JSON.stringify(st))}catch(e){}};
    const esc=t=>t.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const app=document.createElement("div");app.className="ck-app";list.before(app);list.hidden=true;
    const draw=()=>{
      const n=st.items.filter(x=>x.done).length;
      app.innerHTML='<ul class="ck">'+st.items.map((x,i)=>'<li data-i="'+i+'"'+(x.done?' class="done"':'')+'><span class="box">'+(x.done?"✓":"")+'</span><span class="tx">'+x.h+(x.n?'<small>'+x.n+'</small>':'')+'</span><button class="rm" type="button" title="刪除" data-rm="'+i+'">✕</button></li>').join("")+'</ul>'+
        '<form class="ck-add"><input placeholder="新增項目" aria-label="新增項目"><button type="submit">新增</button></form>'+
        '<div class="ck-foot"><span>完成 '+n+' / '+st.items.length+'</span><button class="ck-reset" type="button">回到預設</button></div>';
    };
    app.addEventListener("click",e=>{
      if(e.target.closest("a"))return;
      const rm=e.target.closest("[data-rm]");if(rm){st.items.splice(+rm.dataset.rm,1);st.custom=true;save();draw();return}
      if(e.target.closest(".ck-reset")){if(!confirm("清除勾選和自己加的項目，回到預設清單？"))return;st=fresh();save();draw();return}
      const li=e.target.closest("li[data-i]");if(li){const x=st.items[+li.dataset.i];x.done=!x.done;save();draw()}
    });
    app.addEventListener("submit",e=>{e.preventDefault();const inp=app.querySelector(".ck-add input");const t=inp.value.trim();if(!t)return;st.items.push({h:esc(t),n:"",done:false});st.custom=true;save();draw();app.querySelector(".ck-add input").focus()});
    draw();
  });
})();


/* 點內文圖片放大看原圖；點任一處或按 Esc 關閉。後台編輯區不啟用。 */
(function(){
  if(window.frameElement&&window.frameElement.id==="ed")return;
  let box=null;
  const close=()=>{if(box){box.hidden=true;document.body.style.overflow=""}};
  document.addEventListener("click",e=>{
    const img=e.target.closest(".prose figure.shot img");if(!img||e.target.closest("a"))return;
    if(!box){box=document.createElement("div");box.className="lbox";box.setAttribute("role","dialog");box.setAttribute("aria-label","原圖");box.appendChild(document.createElement("img"));box.onclick=close;document.body.appendChild(box)}
    const b=box.querySelector("img");b.src=img.currentSrc||img.src;b.alt=img.alt||"";box.hidden=false;document.body.style.overflow="hidden";
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
})();

/* 書審頁：「置中」開關（同歷年心得文的好讀版開關），記在訪客自己的瀏覽器；
   每排圖片的寬度＝上方最近一條小標分隔線的寬度（並排的等比例縮放）。後台編輯區不啟用。 */
(function(){
  if(!document.body.classList.contains("article"))return;
  let v="l";try{v=localStorage.getItem("lay")||"l"}catch(e){}
  const set=x=>{v=x;document.documentElement.dataset.lay=x;fit()};
  const rows=[...document.querySelectorAll(".prose>figure.shot.wide,.prose>.shots.pair")];
  const fit=()=>rows.forEach(r=>{let h=r.previousElementSibling;while(h&&h.tagName!=="H3")h=h.previousElementSibling;
    r.style.removeProperty("--rw");if(h)r.style.setProperty("--rw",Math.round(h.getBoundingClientRect().width)+"px")});
  if(window.frameElement&&window.frameElement.id==="ed")return;
  document.documentElement.dataset.lay=v;
  const h=document.querySelector(".page-head");
  if(h){const sw=document.createElement("button");sw.type="button";sw.className="sw-t";sw.setAttribute("role","switch");
    sw.innerHTML='<span class="knob"></span>置中';sw.setAttribute("aria-checked",String(v==="c"));
    sw.onclick=()=>{set(v==="c"?"l":"c");sw.setAttribute("aria-checked",String(v==="c"));try{localStorage.setItem("lay",v)}catch(e){}};
    h.appendChild(sw)}
  fit();addEventListener("resize",fit);addEventListener("load",fit);
})();
