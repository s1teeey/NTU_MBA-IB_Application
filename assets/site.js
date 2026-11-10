/* Header, theme switch and footer shared by every page. */
/* 投稿・提問表單（Google 表單）。留空時，網站上的投稿區塊和頁尾連結都不會顯示。 */
const FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdNOxn6wqQEmNaLYmEl9rO97Q0kYJ0R5NuswYG7o_WKHHpoiw/viewform";
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
  foot.innerHTML='<div class="wrap"><span>面試題目為考生事後回憶；招生規定依台大當年簡章。</span>'+
    (FORM_URL?'<a href="'+FORM_URL+'" target="_blank" rel="noopener">投稿・提問</a>':'')+'</div>';
  document.body.appendChild(foot);
  document.querySelectorAll("[data-form]").forEach(el=>{
    if(!FORM_URL){el.hidden=true;return}
    el.querySelectorAll("a.form-link").forEach(a=>{a.href=FORM_URL;a.target="_blank";a.rel="noopener"});
  });
  const sc=document.createElement("script");sc.src="assets/search.js";document.body.appendChild(sc);
})();
