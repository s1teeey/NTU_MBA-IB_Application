/* Header, theme switch and footer shared by every page. */
(function(){
  const PAGES=[
    ["sharing.html","推甄須知"],
    ["ba.html","商研教授"],
    ["ib.html","國企教授"],
    ["docs.html","書審準備"],
    ["interview.html","面試準備"],
    ["faq.html","FAQ"],
  ];
  const here=(location.pathname.split("/").pop()||"index.html");
  const root=document.documentElement;
  try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")root.dataset.theme=t}catch(e){}
  const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;

  const bar=document.createElement("header");bar.className="topbar";
  bar.innerHTML='<div class="wrap"><a class="brand" href="./">台大商研、國企<span>推甄分享</span></a>'+
    '<nav class="menu" aria-label="主選單">'+PAGES.map(([h,t])=>'<a href="'+h+'"'+(h===here?' aria-current="page"':"")+'>'+t+'</a>').join("")+'</nav>'+
    '<div class="search" role="search"><input type="search" placeholder="搜尋" aria-label="搜尋全站" autocomplete="off"><div class="sresults" hidden></div></div>'+
    '<button class="theme-btn" type="button"></button></div>';
  document.body.prepend(bar);
  const btn=bar.querySelector(".theme-btn");
  const paint=()=>{btn.textContent=isDark()?"淺色":"深色"};
  btn.onclick=()=>{const t=isDark()?"light":"dark";root.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}paint()};
  paint();
  const cur=bar.querySelector('[aria-current="page"]');if(cur)cur.scrollIntoView({block:"nearest",inline:"center"});

  const foot=document.createElement("footer");foot.className="foot";
  foot.innerHTML='<div class="wrap"><span>面試題目為考生事後回憶；招生規定依台大當年簡章。</span>'+'</div>';
  document.body.appendChild(foot);
  const sc=document.createElement("script");sc.src="assets/search.js";document.body.appendChild(sc);
})();
