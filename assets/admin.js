/* 後台：在瀏覽器裡改頁面，按「發布」直接存進 GitHub repo。
   只改每頁 <main> 裡的內容；檔案其他部分（head、程式）原封不動。 */
(function(){
const OWNER="s1teeey";
const SITES={
  "NTU_MBA-IB_Application":{name:"推甄分享｜台大商研、台大國企",pages:[
    ["index.html","首頁"],["sharing.html","簡章細則"],["docs.html","書審撰寫"],["interview.html","面試準備"],
    ["my-docs.html","個人心得｜書審"],["my-interview.html","個人心得｜面試"],["faq.html","FAQ"]]},
  "NTHU_Transfer":{name:"寒轉分享｜清大經濟",pages:[
    ["index.html","首頁"],["sharing.html","簡章細則"],["story.html","上榜心得"],["resources.html","軍火庫"]]},
};
const REPO=location.pathname.split("/")[1]||"NTU_MBA-IB_Application";
const SITE=SITES[REPO]||SITES["NTU_MBA-IB_Application"];
const BASE=location.origin+"/"+REPO+"/";
const API="https://api.github.com/repos/"+OWNER+"/"+REPO+"/contents/";
const $=s=>document.querySelector(s);
let token="";try{token=localStorage.getItem("adm-token")||""}catch(e){}

/* ---------- GitHub ---------- */
const gh=(path,opt={})=>fetch(path.startsWith("http")?path:API+encodeURI(path),{...opt,headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json",...(opt.headers||{})}});
const b64dec=b=>new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g,"")),c=>c.charCodeAt(0)));
const bytesTo64=u8=>{let s="";for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const b64enc=t=>bytesTo64(new TextEncoder().encode(t));
async function getFile(path){const r=await gh(path+"?ref=main&t="+Date.now());if(!r.ok)throw new Error("讀取失敗 "+r.status);const j=await r.json();return {text:b64dec(j.content),sha:j.sha}}
async function putFile(path,b64,msg,sha){
  const r=await gh(path,{method:"PUT",body:JSON.stringify({message:msg,content:b64,branch:"main",...(sha?{sha}:{})})});
  if(r.status===409||r.status===422){throw new Error("檔案在別處被改過了，請重新整理後再編輯。")}
  if(!r.ok)throw new Error("發布失敗 "+r.status);
  return (await r.json()).content.sha;
}

/* ---------- UI helpers ---------- */
function toast(t,ms=2600){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),ms)}
function setState(){
  const d=cur&&cur.dirty;$("#state").textContent=!cur?"":d?"有未發布的修改":"已是最新";$("#state").classList.toggle("dirty",!!d);
  $("#b-publish").disabled=!(d&&cur.previewed);
  document.querySelectorAll("#pages a").forEach(a=>{const dot=a.querySelector(".dot");const dr=drafts()[a.dataset.p];if(dr&&!dot)a.insertAdjacentHTML("beforeend",'<span class="dot" title="有草稿"></span>');if(!dr&&dot)dot.remove()});
}
const drafts=()=>{try{return JSON.parse(localStorage.getItem("adm-drafts:"+REPO)||"{}")}catch(e){return {}}};
function saveDraft(p,html,sha){const d=drafts();if(html===null)delete d[p];else d[p]={html,sha,at:Date.now()};try{localStorage.setItem("adm-drafts:"+REPO,JSON.stringify(d))}catch(e){}}

/* ---------- login ---------- */
async function login(){
  const r=await gh("https://api.github.com/repos/"+OWNER+"/"+REPO);
  if(!r.ok)return false;const j=await r.json();return !!(j.permissions&&j.permissions.push);
}
$("#login-form").onsubmit=async e=>{
  e.preventDefault();token=$("#token").value.trim();$("#login-msg").textContent="檢查中…";
  if(await login()){try{localStorage.setItem("adm-token",token)}catch(e){}start()}
  else $("#login-msg").textContent="這組 token 不能寫入 "+REPO+"，請確認 repo 和 Contents 權限。";
};
$("#logout").onclick=()=>{if(!confirm("登出後要重新貼 token，確定？"))return;try{localStorage.removeItem("adm-token")}catch(e){}location.reload()};

/* ---------- editor ---------- */
let cur=null; // {path, text, sha, dirty, previewed}
const ifr=$("#ed");
const idoc=()=>ifr.contentDocument;
const EDIT_CSS=`
html{scroll-padding-top:40px}
main{outline:none;padding-top:8px}
main [data-nokey]{opacity:.55}
#src:empty::before{content:"（這一區由程式產生，在後台不能編輯）";color:#9496A3;font-size:14px}
.adm-hover{outline:1px dashed #8F5CF0;outline-offset:4px}
.adm-ctl{position:absolute;z-index:99;display:flex;gap:2px;background:#fff;border:1px solid #E6E5EB;border-radius:6px;padding:2px;font:600 12px/1 system-ui;box-shadow:0 4px 14px rgba(18,19,34,.08)}
.adm-ctl button{border:0;background:none;padding:5px 7px;border-radius:4px;cursor:pointer;color:#121322;font:inherit}
.adm-ctl button:hover{background:#F1ECFD}
.adm-ctl .lbl{padding:5px 6px;color:#9496A3}
figure.shot .ph{cursor:pointer}
figure.shot .ph:hover{border-color:#8F5CF0;color:#8F5CF0}
`;
function splitMain(text){
  const a=text.search(/<main\b[^>]*>/);if(a<0)return null;
  const a2=text.indexOf(">",a)+1,b=text.lastIndexOf("</main>");
  return {before:text.slice(0,a2),inner:text.slice(a2,b),after:text.slice(b)};
}
function editorDoc(text,inner){
  const parts=splitMain(text);
  let html=parts.before+inner+parts.after;
  html=html.replace(/<head>/i,'<head><base href="'+BASE+'">');
  html=html.replace(/<\/head>/i,"<style>"+EDIT_CSS+"</style></head>");
  return html;
}
async function openPage(path){
  if(cur&&cur.dirty&&!confirm("這頁有未發布的修改（已存成草稿）。切換頁面？"))return;
  document.querySelectorAll("#pages a").forEach(a=>a.toggleAttribute("aria-current",a.dataset.p===path));
  $("#state").textContent="載入中…";
  let f;try{f=await getFile(path)}catch(e){toast(e.message);return}
  const parts=splitMain(f.text);
  if(!parts){toast("這頁沒有 <main>，不能編輯。");return}
  cur={path,text:f.text,sha:f.sha,dirty:false,previewed:false};
  { const tmp=new DOMParser().parseFromString("<main>"+parts.inner+"</main>","text/html");
    cur.nokey=[...tmp.querySelectorAll("main [data-nokey]")].map(n=>n.innerHTML);
    cur.today=[...tmp.querySelectorAll("main .today")].map(n=>n.innerHTML); }
  let inner=parts.inner;
  const dr=drafts()[path];
  if(dr&&dr.html!==inner){
    if(confirm("這頁有上次沒發布的草稿（"+new Date(dr.at).toLocaleString()+"）。要接著編輯草稿嗎？\n按「取消」會丟掉草稿。")){
      inner=dr.html;cur.dirty=true;
      if(dr.sha!==f.sha)toast("提醒：草稿之後網站上這頁有被改過，發布會蓋掉那些修改。",5000);
    }else saveDraft(path,null);
  }
  try{history.replaceState(null,"","#"+path)}catch(e){}
  ifr.srcdoc=editorDoc(f.text,inner);
  ifr.onload=()=>{setupEditor();setState()};
}
function setupEditor(){
  const d=idoc(),main=d.querySelector("main");
  delete d.documentElement.dataset.only;d.querySelectorAll(".only-note").forEach(n=>n.remove());
  main.contentEditable="true";
  d.execCommand("styleWithCSS",false,false);
  d.execCommand("defaultParagraphSeparator",false,"p");
  main.querySelectorAll("[data-nokey]").forEach(el=>el.contentEditable="false");
  d.addEventListener("click",e=>{const a=e.target.closest("a");if(a)e.preventDefault()});
  const changed=()=>{if(!cur)return;cur.dirty=true;cur.previewed=false;clearTimeout(changed.t);changed.t=setTimeout(()=>saveDraft(cur.path,serialize(false).inner,cur.sha),400);setState()};
  const real=r=>{
    if(isCtl(r.target))return false;
    if(r.type==="attributes"&&r.attributeName==="class"){const k=v=>(v||"").replace(/\badm-hover\b/g,"").trim();return k(r.oldValue)!==k(r.target.getAttribute("class"))}
    return true;
  };
  new MutationObserver(m=>{if(m.some(real))changed()}).observe(main,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:["class","href","src"]});
  d.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==="s"){e.preventDefault();doPreview()}
  });
  // 圖片預留位置：點一下換成圖片
  main.addEventListener("click",e=>{const ph=e.target.closest("figure.shot .ph");if(ph){pickImage(img=>{ph.replaceWith(img)})}});
  setupBlocks(d,main);
}
const isCtl=n=>!!(n&&(n.nodeType===1?n:n.parentElement)?.closest?.(".adm-ctl"));

/* 區塊工具：滑過段落或區塊時顯示 ↑ ↓ ✕ */
function setupBlocks(d,main){
  const ctl=d.createElement("div");ctl.className="adm-ctl";ctl.contentEditable="false";ctl.hidden=true;d.body.appendChild(ctl);
  let target=null,hide=0;
  const blockOf=el=>{
    while(el&&el!==main){
      const p=el.parentElement;
      if(p&&(p.matches("section,.prose,.stack,.faq-group,details>.a,aside")||p===main))return el;
      el=p;
    }return null;
  };
  const place=el=>{
    if(target)target.classList.remove("adm-hover");
    target=el;if(!el){ctl.hidden=true;return}
    el.classList.add("adm-hover");
    const isSec=el.tagName==="SECTION";
    ctl.innerHTML='<span class="lbl">'+(isSec?"區塊":"段落")+'</span><button data-a="up" title="上移">↑</button><button data-a="down" title="下移">↓</button>'+(isSec?'<button data-a="add" title="在下面新增區塊">＋</button>':'<button data-a="dup" title="複製">⧉</button>')+'<button data-a="del" title="刪除">✕</button>';
    const r=el.getBoundingClientRect();
    ctl.hidden=false;
    ctl.style.top=(r.top+d.defaultView.scrollY-30)+"px";
    ctl.style.left=Math.max(4,r.right+d.defaultView.scrollX-ctl.offsetWidth)+"px";
  };
  main.addEventListener("mouseover",e=>{
    clearTimeout(hide);
    const sec=e.target.closest("section");const b=blockOf(e.target);
    const pick=(e.altKey&&sec)?sec:(b&&b.matches(".sec-head")?sec:b);
    if(pick&&pick!==target)place(pick);
  });
  main.addEventListener("mouseleave",()=>{hide=setTimeout(()=>place(null),400)});
  ctl.addEventListener("mouseenter",()=>clearTimeout(hide));
  ctl.addEventListener("mouseleave",()=>{hide=setTimeout(()=>place(null),400)});
  ctl.addEventListener("mousedown",e=>e.preventDefault());
  ctl.addEventListener("click",e=>{
    const a=e.target.closest("button")?.dataset.a;if(!a||!target)return;const el=target;
    if(a==="up"&&el.previousElementSibling&&!el.previousElementSibling.matches(".sec-head"))el.previousElementSibling.before(el);
    if(a==="down"&&el.nextElementSibling)el.nextElementSibling.after(el);
    if(a==="dup"){const c=el.cloneNode(true);c.classList.remove("adm-hover");el.after(c)}
    if(a==="add")el.after(newSection(d));
    if(a==="del"){if(!confirm("刪除這個"+(el.tagName==="SECTION"?"區塊（整段）":"段落")+"？"))return;place(null);el.remove();renumber(main);return}
    renumber(main);place(el);
  });
  d.defaultView.addEventListener("scroll",()=>{if(target)place(target)},{passive:true});
}
function newSection(d){
  const s=d.createElement("section");
  s.innerHTML='<div class="sec-head"><h2><span class="no">00</span>新的區塊</h2></div><div class="prose"><p>內文</p></div>';
  return s;
}
function renumber(main){
  let i=0;main.querySelectorAll("h2 .no").forEach(n=>{if(n.closest("aside"))return;n.textContent=String(++i).padStart(2,"0")});
}

/* 序列化：清掉編輯用的東西 */
function serialize(forPublish){
  const main=idoc().querySelector("main").cloneNode(true);
  main.querySelectorAll(".adm-ctl,.only-note").forEach(n=>n.remove());
  // 還原網站程式在正文裡做的事：表格對齊包裝、今天日期、程式產生的清單
  main.querySelectorAll("td > span.c, th > span.c").forEach(w=>{const c=w.parentElement;if(w.dataset.k)c.dataset.k=w.dataset.k;w.replaceWith(...w.childNodes)});
  main.querySelectorAll("[data-nokey]").forEach((n,i)=>{if(cur.nokey&&i<cur.nokey.length)n.innerHTML=cur.nokey[i]});
  main.querySelectorAll("[data-form] a.form-link").forEach(a=>{a.setAttribute("href","#");a.removeAttribute("target");a.removeAttribute("rel")});
  main.querySelectorAll(".today").forEach((n,i)=>{if(cur.today&&i<cur.today.length)n.innerHTML=cur.today[i]});
  main.querySelectorAll(".adm-hover").forEach(n=>n.classList.remove("adm-hover"));
  main.querySelectorAll("[class='']").forEach(n=>n.removeAttribute("class"));
  main.querySelectorAll("[contenteditable]").forEach(n=>n.removeAttribute("contenteditable"));
  main.removeAttribute("contenteditable");
  main.querySelectorAll("span[style]:not([class]),font").forEach(n=>n.replaceWith(...n.childNodes));
  main.querySelectorAll("[style]").forEach(n=>{if(!n.closest("figure"))n.removeAttribute("style")});
  main.querySelectorAll("strike").forEach(n=>{const s=main.ownerDocument.createElement("s");s.append(...n.childNodes);n.replaceWith(s)});
  main.querySelectorAll("p:empty,mark:empty,b:empty,i:empty,u:empty,s:empty").forEach(n=>n.remove());
  const uploads=[];
  main.querySelectorAll("img[data-up]").forEach(img=>{
    if(forPublish){uploads.push({path:img.dataset.up,data:img.getAttribute("src")});img.setAttribute("src",img.dataset.up);img.removeAttribute("data-up")}
  });
  return {inner:main.innerHTML,uploads};
}
function fullHTML(inner){const p=splitMain(cur.text);return p.before+inner+p.after}

/* ---------- toolbar ---------- */
const tb=$("#tb");
tb.addEventListener("mousedown",e=>{if(e.target.closest("button"))e.preventDefault()});
tb.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b||!cur)return;const d=idoc();
  if(b.dataset.cmd){d.execCommand(b.dataset.cmd,false,null);return}
  if(b.dataset.block){d.execCommand("formatBlock",false,b.dataset.block);return}
  if("mark" in b.dataset){highlight(d,b.dataset.mark);return}
});
function highlight(d,cls){
  const sel=d.getSelection();if(!sel.rangeCount)return;const r=sel.getRangeAt(0);
  const anc=(r.commonAncestorContainer.nodeType===1?r.commonAncestorContainer:r.commonAncestorContainer.parentElement).closest("mark");
  if(anc){ // 已經畫過：同色就取消，不同色就換色
    if((anc.className||"")===cls){anc.replaceWith(...anc.childNodes)}else{cls?anc.className=cls:anc.removeAttribute("class")}
    return;
  }
  if(r.collapsed)return;
  const m=d.createElement("mark");if(cls)m.className=cls;
  m.appendChild(r.extractContents());
  m.querySelectorAll("mark").forEach(x=>x.replaceWith(...x.childNodes));
  r.insertNode(m);sel.removeAllRanges();const nr=d.createRange();nr.selectNodeContents(m);sel.addRange(nr);
}
$("#b-link").onclick=()=>{
  if(!cur)return;const d=idoc();const sel=d.getSelection();
  const a=sel.anchorNode&&(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement).closest("a");
  const url=prompt(a?"修改連結（留空＝移除連結）":"連結網址",a?a.getAttribute("href"):"https://");
  if(url===null)return;
  if(a&&!url.trim()){a.replaceWith(...a.childNodes);return}
  if(a){a.setAttribute("href",url.trim());return}
  if(sel.isCollapsed){toast("先選取要加連結的文字");return}
  d.execCommand("createLink",false,url.trim());
  d.querySelectorAll('main a[href="'+CSS.escape(url.trim())+'"]').forEach(x=>{if(/^https?:/.test(url)){x.target="_blank";x.rel="noopener"}});
};
$("#b-sec").onclick=()=>{
  if(!cur)return;const d=idoc(),main=d.querySelector("main");
  const sel=d.getSelection();let at=sel.anchorNode&&(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement).closest("main section");
  const s=newSection(d);
  if(at)at.after(s);else{const st=main.querySelector(".stack")||main;st.appendChild(s)}
  renumber(main);s.scrollIntoView({behavior:"smooth",block:"center"});
};

/* 圖片：先在瀏覽器壓縮（長邊 1600px、JPEG），發布時才上傳 */
function pickImage(cb){
  const inp=$("#file");inp.value="";
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;
    const img=new Image();img.onload=()=>{
      const k=Math.min(1,1600/Math.max(img.width,img.height));
      const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const url=c.toDataURL("image/jpeg",.82);
      const el=idoc().createElement("img");el.src=url;el.alt="";el.loading="lazy";
      el.dataset.up="img/u/"+new Date().toISOString().replace(/\D/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,6)+".jpg";
      URL.revokeObjectURL(img.src);cb(el);
    };img.src=URL.createObjectURL(f)};
  inp.click();
}
$("#b-img").onclick=()=>{
  if(!cur)return;const d=idoc();const sel=d.getSelection();
  let at=sel.anchorNode&&(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement);
  at=at&&at.closest("main p, main h3, main h4, main ul, main ol, main figure, main .prose > *");
  pickImage(img=>{
    const fig=d.createElement("figure");fig.className="shot";
    const cap=d.createElement("figcaption");cap.textContent="圖片說明";
    fig.append(img,cap);
    if(at)at.after(fig);else(d.querySelector("main .prose")||d.querySelector("main")).appendChild(fig);
    fig.scrollIntoView({behavior:"smooth",block:"center"});
  });
};

/* ---------- 預覽、發布 ---------- */
function doPreview(){
  if(!cur)return;
  const html=fullHTML(serialize(false).inner).replace(/<head>/i,'<head><base href="'+BASE+'">');
  const w=window.open(URL.createObjectURL(new Blob([html],{type:"text/html"})),"adm-preview");
  if(!w){toast("瀏覽器擋住了預覽視窗，請允許彈出視窗。");return}
  cur.previewed=true;setState();
}
$("#b-preview").onclick=doPreview;
$("#b-publish").onclick=async()=>{
  if(!cur||!cur.dirty)return;
  const btn=$("#b-publish");btn.disabled=true;$("#state").textContent="發布中…";
  try{
    const {inner,uploads}=serialize(true);
    for(const u of uploads){await putFile(u.path,u.data.split(",")[1],"Add image",null)}
    const text=fullHTML(inner);
    cur.sha=await putFile(cur.path,b64enc(text),"Update "+cur.path,cur.sha);
    cur.text=text;cur.dirty=false;cur.previewed=false;saveDraft(cur.path,null);
    // 編輯區的圖片改用正式路徑
    idoc().querySelectorAll("main img[data-up]").forEach(img=>{img.setAttribute("src",img.dataset.up);img.removeAttribute("data-up")});
    setState();toast("已發布，大約 1 分鐘後網站會更新。",4000);
  }catch(e){toast(e.message,5000);btn.disabled=false;setState()}
};
addEventListener("beforeunload",e=>{if(cur&&cur.dirty){e.preventDefault();e.returnValue=""}});

/* ---------- 分頁位置：側邊／頂部 ---------- */
const IC_SIDE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>';
const IC_TOP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>';
function applyLayout(top){
  document.body.classList.toggle("tabs-top",top);
  $("#layout").innerHTML=top?IC_SIDE+"側邊分頁":IC_TOP+"頂部分頁";
  try{localStorage.setItem("adm-layout",top?"top":"side")}catch(e){}
}
$("#layout").onclick=()=>applyLayout(!document.body.classList.contains("tabs-top"));
{let l="side";try{l=localStorage.getItem("adm-layout")||"side"}catch(e){}applyLayout(l==="top")}

/* ---------- start ---------- */
function start(){
  $("#login").hidden=true;$("#app").hidden=false;
  $(".adm-site").textContent=SITE.name;$("#live").href=BASE;
  $("#pages").innerHTML=SITE.pages.map(([p,t])=>'<a href="#'+p+'" data-p="'+p+'">'+t+'</a>').join("");
  $("#pages").onclick=e=>{const a=e.target.closest("a");if(!a)return;e.preventDefault();openPage(a.dataset.p)};
  const want=decodeURIComponent(location.hash.slice(1));
  openPage(SITE.pages.some(([p])=>p===want)?want:SITE.pages[0][0]);
}
(async()=>{
  if(token&&await login().catch(()=>false))start();
  else{$("#login").hidden=false;if(token)$("#login-msg").textContent="token 已失效，請重新貼上。"}
})();
})();
