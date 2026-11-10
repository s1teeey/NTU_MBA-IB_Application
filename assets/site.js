/* Top bar, theme toggle and footer shared by every page. */
(function(){
  const PAGES=[
    ["guide.html","推甄須知"],
    ["ba.html","商研教授"],
    ["ib.html","國企教授"],
    ["docs.html","書審準備"],
    ["interview.html","面試準備"],
    ["faq.html","FAQ"],
  ];
  const here=(location.pathname.split("/").pop()||"index.html");
  const root=document.documentElement;
  try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")root.dataset.theme=t}catch(e){}

  const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;

  const bar=document.createElement("header");bar.className="topbar";
  bar.innerHTML='<div class="wrap"><a class="brand" href="./"><span class="dot" aria-hidden="true"></span><span class="txt">台大商研・國企推甄</span></a>'+
    '<nav class="menu" aria-label="主選單">'+PAGES.map(([h,t])=>'<a href="'+h+'"'+(h===here?' aria-current="page"':"")+'>'+t+'</a>').join("")+'</nav>'+
    '<button class="theme-btn" type="button"></button></div>';
  document.body.prepend(bar);
  const btn=bar.querySelector(".theme-btn");
  const paint=()=>{btn.innerHTML=isDark()?SUN:MOON;btn.setAttribute("aria-label",isDark()?"切換成淺色":"切換成深色")};
  btn.onclick=()=>{const t=isDark()?"light":"dark";root.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}paint()};
  paint();
  const cur=bar.querySelector('[aria-current="page"]');if(cur)cur.scrollIntoView({block:"nearest",inline:"center"});

  const foot=document.createElement("footer");foot.className="foot";
  foot.innerHTML='<div class="wrap"><span>題目和心得都是考生事後回憶，以各篇原文為準；招生規定以台大簡章為準。</span>'+
    '<span><a href="https://github.com/s1teeey/NTU_MBA-IB_Application">GitHub</a></span></div>';
  document.body.appendChild(foot);
})();
