/* 後台：在瀏覽器裡改頁面，按「發布」直接存進 GitHub repo。
   只改每頁 <main> 裡的內容；檔案其他部分（head、程式）原封不動。 */
(function(){
const OWNER="s1teeey";
const SITES={
  "NTU_MBA-IB_Application":{name:"推甄分享｜台大商研、台大國企",pages:[
    ["index.html","首頁"],["sharing.html","簡章細則"],["docs.html","書審"],["interview.html","口試"],
    ["reviews.html","歷年心得文"],["my.html","個人心得"],["faq.html","FAQ"]],
    lists:[["assets/sources.js","心得文清單"]]},
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
  if(r.status===409||r.status===422){throw new Error("發布失敗：這頁在別處被改過了。草稿還在，請重新整理後再發布。")}
  if(r.status===401||r.status===403||r.status===404)throw new Error("發布失敗：這組 token 沒有寫入權限。\n請到 GitHub 把 token 的 Contents 權限改成「Read and write」，並確認有勾這個 repo。\n草稿還在，不會不見。");
  if(!r.ok)throw new Error("發布失敗（"+r.status+"）。草稿還在，請稍後再試。");
  return (await r.json()).content.sha;
}

/* ---------- UI helpers ---------- */
function toast(t,ms=2600){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),ms)}
function setState(){
  const d=cur&&cur.dirty;$("#state").textContent=!cur?"":!d?"已發布":"草稿";$("#state").title=!cur?"":!d?"網站上是最新版本":"修改已自動存成草稿";$("#state").classList.toggle("dirty",!!d);
  $("#b-publish").disabled=!d;$("#b-preview").hidden=!!(cur&&cur.kind==="list");
  $("#b-discard").hidden=!d;
  $("#b-restore").hidden=!!d||!cur||!(trash()[cur.path]||[]).length;
  document.querySelectorAll("#pages a").forEach(a=>{const dot=a.querySelector(".dot");const dr=drafts()[a.dataset.p];if(dr&&!dot)a.insertAdjacentHTML("beforeend",'<span class="dot" title="有草稿"></span>');if(!dr&&dot)dot.remove()});
}
const drafts=()=>{try{return JSON.parse(localStorage.getItem("adm-drafts:"+REPO)||"{}")}catch(e){return {}}};
const trash=()=>{try{return JSON.parse(localStorage.getItem("adm-trash:"+REPO)||"{}")}catch(e){return {}}};
function toTrash(p,dr){if(!dr)return;const t=trash();t[p]=[dr,...(t[p]||[])].slice(0,10);try{localStorage.setItem("adm-trash:"+REPO,JSON.stringify(t))}catch(e){}}
function saveDraft(p,html,sha){const d=drafts();if(html===null)delete d[p];else d[p]={html,sha,at:Date.now()};try{localStorage.setItem("adm-drafts:"+REPO,JSON.stringify(d))}catch(e){}}

/* ---------- login ---------- */
/* 真的測一次寫入權限：建立一個沒有被引用的小 blob（不會改到網站，GitHub 之後會自動清掉） */
async function login(){
  const r=await gh("https://api.github.com/repos/"+OWNER+"/"+REPO+"/git/blobs",{method:"POST",body:JSON.stringify({content:"ok",encoding:"utf-8"})});
  return r.status===201;
}
$("#login-form").onsubmit=async e=>{
  e.preventDefault();token=$("#token").value.trim();$("#login-msg").textContent="檢查中…";
  if(await login()){try{localStorage.setItem("adm-token",token)}catch(e){}start()}
  else $("#login-msg").textContent="這組 token 不能寫入 "+REPO+"。請在 GitHub 勾選這個 repo，並把 Contents 設成 Read and write。";
};
$("#logout").onclick=()=>{if(!confirm("登出後要重新貼 token，確定？"))return;try{localStorage.removeItem("adm-token")}catch(e){}location.reload()};

/* ---------- editor ---------- */
let quiet=false;let cur=null;
/* 自己的復原紀錄：打字、螢光筆、移動區塊都能 ↶ */
const hist={list:[],i:-1,main:null,busy:false,
  snap(){return this.main.innerHTML.replace(/ ?adm-hover/g,"")},
  reset(main){this.main=main;this.list=[this.snap()];this.i=0},
  push(){if(!this.main||this.busy)return;const v=this.snap();if(v===this.list[this.i])return;this.list=this.list.slice(0,this.i+1);this.list.push(v);if(this.list.length>200)this.list.shift();this.i=this.list.length-1},
  go(k){if(!this.main)return;this.push();const j=this.i+k;if(j<0||j>=this.list.length)return;this.i=j;this.busy=true;this.main.innerHTML=this.list[j];setTimeout(()=>{this.busy=false},0)}
}; // {path, text, sha, dirty, previewed}
const ifr=$("#ed");
const idoc=()=>ifr.contentDocument;
const EDIT_CSS=`
html{scroll-padding-top:40px}
main{outline:none;padding-top:8px}
main [data-nokey]{opacity:.55}
.check-app{display:none!important}
ul.check{display:block!important}
#src{cursor:pointer;position:relative;outline:1px dashed transparent;outline-offset:6px}
#src:hover{outline-color:#8F5CF0}
#src:hover::before{content:"點一下編輯心得文清單";position:absolute;right:0;top:-30px;background:#8F5CF0;color:#fff;font:600 12px/1 system-ui;padding:6px 10px;border-radius:5px;z-index:5}
.adm-hover{outline:1px dashed #8F5CF0;outline-offset:4px}
.adm-ctl{position:absolute;z-index:99;display:flex;gap:2px;background:#fff;border:1px solid #E6E5EB;border-radius:6px;padding:2px;font:600 12px/1 system-ui;box-shadow:0 4px 14px rgba(18,19,34,.08)}
.adm-ctl button{border:0;background:none;padding:5px 7px;border-radius:4px;cursor:pointer;color:#121322;font:inherit}
.adm-ctl button:hover{background:#F1ECFD}
.adm-ctl .lbl{padding:5px 6px;color:#9496A3}
.adm-rs{position:absolute;z-index:98;width:8px;cursor:ew-resize;border-radius:4px;background:repeating-linear-gradient(#8F5CF0 0 2px,transparent 2px 5px);opacity:.35}
.adm-rs:hover{opacity:1}
.adm-link{position:absolute;z-index:100;display:flex;gap:4px;align-items:center;background:#fff;border:1px solid #E6E5EB;border-radius:8px;padding:6px;box-shadow:0 6px 20px rgba(18,19,34,.12);font:600 13px/1 system-ui}
.adm-link[hidden]{display:none}
.adm-link input{width:300px;font:13px system-ui;padding:6px 8px;border:1px solid #E6E5EB;border-radius:5px;color:#121322;background:#fff;outline:none}
.adm-link input:focus{border-color:#8F5CF0}
.adm-link button{border:0;background:none;padding:6px 8px;border-radius:5px;cursor:pointer;color:#121322;font:inherit;white-space:nowrap}
.adm-link button:hover{background:#F1ECFD}
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
function flushDraft(){try{if(cur&&cur.kind==="list"){if(cur.dirty)saveDraft(cur.path,JSON.stringify(readRows()),cur.sha);return}if(cur&&cur.dirty&&idoc()&&idoc().querySelector("main"))saveDraft(cur.path,serialize(false).inner,cur.sha)}catch(e){}}
async function openPage(path){
  flushDraft();
  if((SITE.lists||[]).some(([p])=>p===path))return openList(path);
  document.querySelector(".adm-main").classList.remove("list-mode");
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
    inner=dr.html;cur.dirty=true;
    toast(dr.sha!==f.sha?"已載入草稿。提醒：網站上這頁之後有被改過，發布會蓋掉那些修改。":"已載入未發布的草稿",4000);
  }else if(dr)saveDraft(path,null);
  try{history.replaceState(null,"","#"+path)}catch(e){}
  ifr.srcdoc=editorDoc(f.text,inner);
  ifr.onload=()=>{setupEditor();setState()};
}
function setupEditor(){
  const d=idoc(),main=d.querySelector("main");
  delete d.documentElement.dataset.only;d.querySelectorAll(".only-note").forEach(n=>n.remove());
  cleanMarks(main);
  main.contentEditable="true";
  d.execCommand("styleWithCSS",false,false);
  d.execCommand("defaultParagraphSeparator",false,"p");
  main.querySelectorAll("[data-nokey]").forEach(el=>el.contentEditable="false");
  d.addEventListener("click",e=>{
    const a=e.target.closest("a");if(!a)return;e.preventDefault();
    if(main.contains(a)&&!a.closest("[data-nokey]"))linkPop(a);
  });
  hist.reset(main);
  const changed=()=>{if(!cur||quiet)return;clearTimeout(changed.h);changed.h=setTimeout(()=>hist.push(),350);cur.dirty=true;cur.previewed=false;clearTimeout(changed.t);changed.t=setTimeout(()=>saveDraft(cur.path,serialize(false).inner,cur.sha),400);setState()};
  const real=r=>{
    if(isCtl(r.target))return false;
    if(r.type==="attributes"&&r.attributeName==="style"&&r.target.matches("span.c"))return false;
    if(r.type==="attributes"&&r.attributeName==="class"){const k=v=>(v||"").replace(/\badm-hover\b/g,"").trim();return k(r.oldValue)!==k(r.target.getAttribute("class"))}
    return true;
  };
  new MutationObserver(m=>{if(m.some(real))changed()}).observe(main,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:["class","href","src","style"]});
  main.addEventListener("paste",e=>{e.preventDefault();const t=(e.clipboardData||window.clipboardData).getData("text/plain");d.execCommand("insertText",false,t)});
  d.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==="s"){e.preventDefault();doPreview()}
    if((e.metaKey||e.ctrlKey)&&(e.key==="z"||e.key==="Z")){e.preventDefault();hist.go(e.shiftKey?1:-1)}
    if((e.metaKey||e.ctrlKey)&&e.key==="y"){e.preventDefault();hist.go(1)}
  });
  // 圖片預留位置：點一下換成圖片
  main.addEventListener("click",e=>{if(e.target.closest("#src")&&(SITE.lists||[]).length){e.preventDefault();openPage(SITE.lists[0][0]);return}});
  main.addEventListener("click",e=>{const ph=e.target.closest("figure.shot .ph");if(ph){pickImage(img=>{ph.replaceWith(img)})}});
  setupBlocks(d,main);
}
const isCtl=n=>!!(n&&(n.nodeType===1?n:n.parentElement)?.closest?.(".adm-ctl,.adm-rs,.adm-link"));

/* 區塊工具：滑過段落或區塊時顯示 ↑ ↓ ✕ */
function setupBlocks(d,main){
  const ctl=d.createElement("div");ctl.className="adm-ctl";ctl.contentEditable="false";ctl.hidden=true;d.body.appendChild(ctl);
  const rs=d.createElement("div");rs.className="adm-rs";rs.contentEditable="false";rs.hidden=true;rs.title="拖曳調整寬度｜雙擊恢復預設";d.body.appendChild(rs);
  let target=null,hide=0,dragging=false;
  const placeRs=()=>{if(!target){rs.hidden=true;return}const r=target.getBoundingClientRect(),w=d.defaultView;rs.hidden=false;rs.style.top=(r.top+w.scrollY)+"px";rs.style.height=r.height+"px";rs.style.left=(r.right+w.scrollX-5)+"px"};
  rs.addEventListener("mousedown",e=>{
    if(!target)return;e.preventDefault();dragging=true;clearTimeout(hide);const el=target,left=el.getBoundingClientRect().left;
    const max=(el.parentElement.closest("section,main")||el.parentElement).getBoundingClientRect().right-left;
    const isSec=el.tagName==="SECTION";
    const mv=ev=>{let w=Math.round((ev.clientX-left)/10)*10;w=Math.max(240,w);const v=w>=max-10?"none":w+"px";
      if(isSec)el.style.setProperty("--pw",v);else el.style.maxWidth=v; // 區塊：裡面的段落一起變寬
      placeRs();place(el,true)};
    const up=()=>{dragging=false;d.removeEventListener("mousemove",mv);d.removeEventListener("mouseup",up)};
    d.addEventListener("mousemove",mv);d.addEventListener("mouseup",up);
  });
  rs.addEventListener("dblclick",()=>{if(target){target.style.removeProperty("max-width");target.style.removeProperty("--pw");if(!target.getAttribute("style"))target.removeAttribute("style");placeRs()}});
  rs.addEventListener("mouseenter",()=>clearTimeout(hide));
  rs.addEventListener("mouseleave",()=>{if(!dragging)hide=setTimeout(()=>place(null),400)});
  const blockOf=el=>{
    while(el&&el!==main){
      const p=el.parentElement;
      if(p&&(p.matches("section,.prose,.stack,.faq-group,details>.a,aside,.cols,.cols>.col")||p===main))return el;
      el=p;
    }return null;
  };
  const place=(el,keep)=>{
    if(dragging&&!keep)return;
    if(target)target.classList.remove("adm-hover");
    target=el;if(!el){ctl.hidden=true;rs.hidden=true;return}
    el.classList.add("adm-hover");
    const isSec=el.tagName==="SECTION";
    ctl.innerHTML='<span class="lbl">'+(isSec?"區塊":"段落")+'</span><button data-a="up" title="上移">↑</button><button data-a="down" title="下移">↓</button>'+(isSec?'<button data-a="add" title="在下面新增區塊">＋</button>':'<button data-a="dup" title="複製">⧉</button><button data-a="side" title="標題：連同內容和下一個標題並排｜清單：項目橫排｜段落：和下一段並排（再按一次取消）">並排</button>')+'<button data-a="del" title="刪除">✕</button>';
    const r=el.getBoundingClientRect();
    ctl.hidden=false;
    ctl.style.top=(r.top+d.defaultView.scrollY-30)+"px";
    ctl.style.left=Math.max(4,r.right+d.defaultView.scrollX-ctl.offsetWidth)+"px";
    placeRs();
  };
  main.addEventListener("mouseover",e=>{
    clearTimeout(hide);
    const sec=e.target.closest("section");const b=blockOf(e.target);
    let pick=(e.altKey&&sec)?sec:(b&&b.matches(".sec-head")?sec:b);
    // 滑鼠還在目前框框附近（例如移向把手、工具）時，不換成外層的區塊
    if(target&&pick&&pick!==target&&pick.contains(target)){
      const r=target.getBoundingClientRect(),m=18;
      if(e.clientX>=r.left-m&&e.clientX<=r.right+m&&e.clientY>=r.top-36&&e.clientY<=r.bottom+m)pick=target;
    }
    if(pick&&pick!==target)place(pick);
  });
  main.addEventListener("mouseleave",()=>{if(!dragging)hide=setTimeout(()=>place(null),400)});
  ctl.addEventListener("mouseenter",()=>clearTimeout(hide));
  ctl.addEventListener("mouseleave",()=>{hide=setTimeout(()=>place(null),400)});
  ctl.addEventListener("mousedown",e=>e.preventDefault());
  ctl.addEventListener("click",e=>{
    const a=e.target.closest("button")?.dataset.a;if(!a||!target)return;const el=target;
    if(a==="up"&&el.previousElementSibling&&!el.previousElementSibling.matches(".sec-head"))el.previousElementSibling.before(el);
    if(a==="down"&&el.nextElementSibling)el.nextElementSibling.after(el);
    if(a==="dup"){const c=el.cloneNode(true);c.classList.remove("adm-hover");el.after(c)}
    if(a==="add")el.after(newSection(d));
    if(a==="side"){
      const cc=el.closest(".cols"),isH=/^H[2-4]$/.test(el.tagName);
      const grp=h=>{const L=+h.tagName[1],g=[h];let n=h.nextElementSibling;while(n&&!(/^H[2-4]$/.test(n.tagName)&&+n.tagName[1]<=L)){g.push(n);n=n.nextElementSibling}return g};
      if(el.matches("ol,ul")&&!(cc&&el.parentElement===cc)){el.classList.toggle("row");if(!el.getAttribute("class"))el.removeAttribute("class")}
      else if(el.matches(".cols")||cc){const c=el.matches(".cols")?el:cc,out=[];[...c.children].forEach(k=>k.matches(".col")?out.push(...k.children):out.push(k));c.replaceWith(...out)}
      else if(isH){const g1=grp(el),nx=g1[g1.length-1].nextElementSibling;
        if(!nx||nx.tagName!==el.tagName){toast("下面沒有同層標題可並排");return}
        const g2=grp(nx),w=d.createElement("div");w.className="cols";el.before(w);
        [g1,g2].forEach(g=>{const c=d.createElement("div");c.className="col";c.append(...g);w.append(c)})}
      else{const nx=el.nextElementSibling;if(!nx){toast("下面沒有可以並排的段落");return}
        const w=d.createElement("div");w.className="cols";el.before(w);w.append(el,nx)}
      hist.push();renumber(main);return;
    }
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
  main.querySelectorAll(".adm-ctl,.adm-rs,.adm-link,.only-note").forEach(n=>n.remove());
  // 網頁執行時才加上的標記、瀏覽器外掛加的 class，不要存進檔案
  main.querySelectorAll("[data-done]").forEach(n=>n.removeAttribute("data-done"));
  main.querySelectorAll(".custom-cursor-on-hover").forEach(n=>{n.classList.remove("custom-cursor-on-hover");if(!n.getAttribute("class"))n.removeAttribute("class")});
  main.querySelectorAll(".ck-app").forEach(n=>n.remove());main.querySelectorAll("[data-check][hidden]").forEach(n=>n.removeAttribute("hidden"));
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
  main.querySelectorAll("strike").forEach(n=>{const s=main.ownerDocument.createElement("s");s.append(...n.childNodes);n.replaceWith(s)});
  cleanMarks(main);
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
  if(b.dataset.cmd==="undo"){hist.go(-1);return}
  if(b.dataset.cmd==="redo"){hist.go(1);return}
  if(b.dataset.cmd){hist.push();d.execCommand(b.dataset.cmd,false,null);hist.push();return}
  if(b.dataset.block){hist.push();d.execCommand("formatBlock",false,b.dataset.block);hist.push();return}
  if("mark" in b.dataset){hist.push();highlight(d,b.dataset.mark);return}
});
/* 螢光筆：mark（紫）、mark.r／.g／.k，網站原本的 span.hl-ba（紅）、span.hl-ib（綠）也算 */
const HL="mark,span.hl-ba,span.hl-ib";
const BLOCK="p,h1,h2,h3,h4,h5,h6,ul,ol,li,table,thead,tbody,tr,td,th,div,section,figure,blockquote,dl,dt,dd,details,summary,aside,nav,header";
const hlColor=el=>el.matches("span.hl-ba")?"r":el.matches("span.hl-ib")?"g":(el.getAttribute("class")||"").trim();
const unwrap=el=>el.replaceWith(...el.childNodes);
function setColor(el,cls){
  if(el.tagName==="MARK"){cls?el.className=cls:el.removeAttribute("class");return}
  const m=el.ownerDocument.createElement("mark");if(cls)m.className=cls;m.append(...el.childNodes);el.replaceWith(m);
}
/* 修掉壞掉的螢光筆：包住段落、表格的就拆掉，空的就刪掉 */
function cleanMarks(root){
  root.querySelectorAll(HL).forEach(m=>{if(m.querySelector(BLOCK))unwrap(m)});
  root.querySelectorAll(HL).forEach(m=>{if(!m.textContent.trim()&&!m.querySelector("img"))m.remove()});
  // 跑版留下的空標題、空段落
  root.querySelectorAll("h1,h2,h3,h4,p").forEach(e=>{
    if(!e.textContent.trim()&&!e.id&&!e.hasAttribute("data-nokey")&&!e.querySelector("img,table,iframe,input,[data-nokey],[id],.ph"))e.remove();
  });
}
function highlight(d,cls){
  const sel=d.getSelection();if(!sel.rangeCount)return;const r=sel.getRangeAt(0);
  const main=d.querySelector("main");if(!main.contains(r.commonAncestorContainer))return;
  const elOf=n=>n.nodeType===1?n:n.parentElement;
  if(r.collapsed){ // 游標停在螢光筆裡：同色＝取消，不同色＝換色
    const anc=elOf(r.startContainer).closest(HL);if(!anc)return;
    hlColor(anc)===cls?unwrap(anc):setColor(anc,cls);hist.push();return;
  }
  // 範圍內的文字節點（只處理文字，不會包住段落或表格）
  const w=d.createTreeWalker(r.commonAncestorContainer.nodeType===3?r.commonAncestorContainer.parentNode:r.commonAncestorContainer,NodeFilter.SHOW_TEXT);
  const texts=[];let n;while((n=w.nextNode())){if(r.intersectsNode(n)&&n.data.trim()&&!isCtl(n))texts.push(n)}
  if(!texts.length)return;
  const ancs=texts.map(t=>elOf(t).closest(HL));
  if(ancs.every(a=>a&&hlColor(a)===cls)){new Set(ancs).forEach(unwrap);hist.push();return} // 全部已是同色：取消
  const done=new Set();
  texts.forEach((t,k)=>{
    const a=ancs[k];
    if(a){if(!done.has(a)){done.add(a);if(hlColor(a)!==cls)setColor(a,cls)}return}
    let s0=t===r.startContainer?r.startOffset:0,e0=t===r.endContainer?r.endOffset:t.length;
    if(e0<=s0)return;
    if(e0<t.length)t.splitText(e0);
    const mid=s0>0?t.splitText(s0):t;
    const m=d.createElement("mark");if(cls)m.className=cls;mid.replaceWith(m);m.appendChild(mid);
  });
  sel.removeAllRanges();hist.push();
}
/* 小字：選字後按一下包成 <small>；游標在小字裡再按一下就取消 */
$("#b-small").onclick=()=>{
  if(!cur)return;const d=idoc(),sel=d.getSelection();if(!sel.rangeCount)return;const r=sel.getRangeAt(0);
  const elOf=n=>n.nodeType===1?n:n.parentElement;
  const sm=elOf(r.startContainer).closest("main small");
  hist.push();
  if(sm){sm.replaceWith(...sm.childNodes);hist.push();return}
  if(r.collapsed){
    // 沒選字：在游標後面插入一段小字
    const s=d.createElement("small");s.textContent="補充說明";r.insertNode(s);
    const nr=d.createRange();nr.selectNodeContents(s);sel.removeAllRanges();sel.addRange(nr);hist.push();return;
  }
  const s=d.createElement("small");s.appendChild(r.extractContents());
  s.querySelectorAll("small").forEach(x=>x.replaceWith(...x.childNodes));
  if(s.querySelector("p,h1,h2,h3,h4,table,ul,ol,div,section")){toast("小字只能用在同一行的文字上");hist.go(-1);return}
  r.insertNode(s);sel.removeAllRanges();hist.push();
};
/* 連結小框：點連結＝修改／移除；選字後按「連結」＝新增 */
function linkPop(a){
  const d=idoc();let pop=d.querySelector(".adm-link");
  if(!pop){pop=d.createElement("div");pop.className="adm-link";pop.contentEditable="false";
    pop.innerHTML='<input type="url" placeholder="https://"><button data-a="ok">套用</button><button data-a="open">開啟</button><button data-a="rm">移除</button>';
    d.body.appendChild(pop);
    pop.addEventListener("mousedown",e=>{if(e.target.tagName!=="INPUT")e.preventDefault()});
  }
  const inp=pop.querySelector("input");inp.value=a.getAttribute("href")||"";
  const r=a.getBoundingClientRect(),w=d.defaultView;
  pop.style.top=(r.bottom+w.scrollY+6)+"px";pop.style.left=Math.max(8,r.left+w.scrollX)+"px";pop.hidden=false;
  const close=()=>{pop.hidden=true;d.removeEventListener("mousedown",outside,true);if(a.isConnected&&!a.getAttribute("href"))a.replaceWith(...a.childNodes)};
  const outside=e=>{if(!pop.contains(e.target))close()};
  setTimeout(()=>d.addEventListener("mousedown",outside,true),0);
  const apply=()=>{const v=inp.value.trim();hist.push();
    if(!v){a.replaceWith(...a.childNodes)}else{a.setAttribute("href",v);if(/^https?:/.test(v)&&!v.startsWith(BASE)){a.target="_blank";a.rel="noopener"}else{a.removeAttribute("target");a.removeAttribute("rel")}}
    hist.push();close()};
  pop.onclick=e=>{const k=e.target.dataset.a;if(!k)return;
    if(k==="ok")apply();
    if(k==="rm"){hist.push();a.replaceWith(...a.childNodes);hist.push();close()}
    if(k==="open"&&inp.value.trim())window.open(new URL(inp.value.trim(),BASE).href,"_blank");};
  inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();apply()}if(e.key==="Escape")close()};
  setTimeout(()=>{inp.focus();inp.select()},0);
}
$("#b-link").onclick=()=>{
  if(!cur)return;const d=idoc(),sel=d.getSelection();if(!sel.rangeCount)return;
  const n=sel.anchorNode,el=n&&(n.nodeType===1?n:n.parentElement);
  const a=el&&el.closest("main a");if(a){linkPop(a);return}
  if(sel.isCollapsed){toast("先選取要加連結的文字");return}
  hist.push();d.execCommand("createLink",false,"#adm-new");
  const na=d.querySelector('main a[href="#adm-new"]');if(na){na.setAttribute("href","");linkPop(na)}
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
  const bar='<div style="position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:9999;background:#C8264A;color:#fff;font:700 14px/1 system-ui;padding:10px 16px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.2)">預覽｜尚未發布</div>';
  const html=fullHTML(serialize(false).inner).replace(/<head>/i,'<head><base href="'+BASE+'"><title>預覽｜尚未發布</title>').replace(/<\/body>/i,bar+"</body>");
  const w=window.open(URL.createObjectURL(new Blob([html],{type:"text/html"})),"adm-preview");
  if(!w){toast("瀏覽器擋住了預覽視窗，請允許彈出視窗。");return}
  cur.previewed=true;setState();
}
$("#b-preview").onclick=doPreview;
$("#b-discard").onclick=()=>{
  if(!cur||!cur.dirty)return;
  if(!confirm("放棄這頁的修改，回到網站上的版本？\n（之後可以按「找回」復原）"))return;
  toTrash(cur.path,drafts()[cur.path]||{html:serialize(false).inner,sha:cur.sha,at:Date.now()});
  saveDraft(cur.path,null);cur.dirty=false;const p=cur.path;cur=null;openPage(p);
};
$("#b-restore").onclick=()=>{
  if(!cur)return;const list=trash()[cur.path]||[];if(!list.length)return;
  const dr=list[0];const t=trash();t[cur.path]=list.slice(1);try{localStorage.setItem("adm-trash:"+REPO,JSON.stringify(t))}catch(e){}
  saveDraft(cur.path,dr.html,dr.sha);const p=cur.path;cur=null;openPage(p);
  toast("已找回 "+new Date(dr.at).toLocaleString()+" 的草稿");
};
$("#b-publish").onclick=async()=>{
  if(!cur||!cur.dirty)return;
  if(!confirm("確定要發布「"+($("#pages a[aria-current]")?.textContent||cur.path)+"」？"))return;
  if(cur.kind==="list")return publishList();
  const btn=$("#b-publish");btn.disabled=true;$("#state").textContent="發布中…";
  try{
    const {inner,uploads}=serialize(true);
    for(const u of uploads){await putFile(u.path,u.data.split(",")[1],"Add image",null)}
    const text=fullHTML(inner);
    cur.sha=await putFile(cur.path,b64enc(text),"Update "+cur.path,cur.sha);
    cur.text=text;cur.dirty=false;cur.previewed=false;saveDraft(cur.path,null);
    // 編輯區的圖片改用正式路徑
    quiet=true;idoc().querySelectorAll("main img[data-up]").forEach(img=>{img.setAttribute("src",img.dataset.up);img.removeAttribute("data-up")});
    setTimeout(()=>{quiet=false},100);
    setState();toast("已發布，大約 1 分鐘後網站會更新。",4000);
  }catch(e){btn.disabled=false;setState();alert(e.message)}
};
addEventListener("pagehide",flushDraft);addEventListener("beforeunload",flushDraft);

/* ---------- 心得文清單（assets/sources.js 的 SOURCES） ---------- */
const SITES_OPT={dcard:"Dcard",ptt:"PTT",medium:"Medium",notion:"Notion",own:"本站"};
let DCV="";
function parseList(text){
  const a=text.indexOf("const SOURCES=[");const b=text.indexOf("\n];",a);
  if(a<0||b<0)throw new Error("清單格式讀不到");
  const m=text.match(/const DC="([^"]*)"/);DCV=m?m[1]:"";
  return {rows:new Function("DC","return ["+text.slice(a+15,b)+"]")(DCV),a,b};
}
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
function rowHTML(r){
  const d=r.d||[];
  return '<tr><td><input class="y" type="number" value="'+esc(r.y)+'"></td>'+
    '<td class="dpt"><label><input type="checkbox" data-d="ba"'+(d.includes("ba")?" checked":"")+'>商研</label><label><input type="checkbox" data-d="ib"'+(d.includes("ib")?" checked":"")+'>國企</label></td>'+
    '<td><select>'+Object.entries(SITES_OPT).map(([k,v])=>'<option value="'+k+'"'+(r.site===k?" selected":"")+'>'+v+'</option>').join("")+'</select></td>'+
    '<td class="pin"><input type="checkbox" class="p" title="預設收藏"'+(r.pin?" checked":"")+'></td>'+
    '<td><input class="t" value="'+esc(r.t)+'" placeholder="原標題"></td>'+
    '<td><input class="s" value="'+esc(r.s)+'" placeholder="115 推甄分享｜台大商研、台大國企"></td>'+
    '<td><input class="u" value="'+esc(r.u)+'" placeholder="https://"></td>'+
    '<td><input class="n" value="'+esc(r.note)+'" placeholder="備註（選填）"></td>'+
    '<td class="ops"><button data-a="up" title="上移">↑</button><button data-a="down" title="下移">↓</button><button data-a="del" title="刪除">✕</button></td></tr>';
}
function readRows(){
  return [...document.querySelectorAll("#lst tbody tr")].map(tr=>{
    const o={y:+tr.querySelector(".y").value||0,d:[...tr.querySelectorAll("[data-d]:checked")].map(x=>x.dataset.d),site:tr.querySelector("select").value,t:tr.querySelector(".t").value.trim(),u:tr.querySelector(".u").value.trim()};
    const sv=tr.querySelector(".s").value.trim();if(sv)o.s=sv;
    const n=tr.querySelector(".n").value.trim();if(n)o.note=n;if(tr.querySelector(".p").checked)o.pin=1;return o;
  }).filter(o=>o.t||o.u);
}
function listText(rows){
  const q=v=>JSON.stringify(v);
  const lit=o=>"  {y:"+o.y+",d:"+q(o.d)+",site:"+q(o.site)+",t:"+q(o.t)+(o.s?",s:"+q(o.s):"")+",u:"+(DCV&&o.u.startsWith(DCV)?"DC+"+q(o.u.slice(DCV.length)):q(o.u))+(o.note?",note:"+q(o.note):"")+(o.pin?",pin:1":"")+"}";
  let out="",prev=null;rows.forEach((o,i)=>{if(prev!==null&&o.y!==prev)out+="\n";out+=lit(o)+(i<rows.length-1?",\n":"\n");prev=o.y});
  const P=parseList(cur.text);return cur.text.slice(0,P.a+15)+"\n"+out+cur.text.slice(P.b+1);
}
async function openList(path){
  document.querySelectorAll("#pages a").forEach(a=>a.toggleAttribute("aria-current",a.dataset.p===path));
  document.querySelector(".adm-main").classList.add("list-mode");$("#state").textContent="載入中…";
  let f;try{f=await getFile(path)}catch(e){toast(e.message);return}
  cur={path,text:f.text,sha:f.sha,dirty:false,kind:"list"};
  let rows;try{rows=parseList(f.text).rows}catch(e){toast(e.message);return}
  const dr=drafts()[path];
  if(dr){try{rows=JSON.parse(dr.html);cur.dirty=true;toast("已載入未發布的草稿")}catch(e){}}
  try{history.replaceState(null,"","#"+path)}catch(e){}
  $("#lst").innerHTML='<div class="lst-head"><h2>心得文清單</h2><p>面試準備頁「歷年心得文」和搜尋會用到。每列一篇。</p><button id="lst-add" type="button">＋新增一篇</button></div>'+
    '<div class="lst-scroll"><table><thead><tr><th>學年度</th><th>系所</th><th>來源</th><th title="預設收藏">★</th><th>原標題</th><th>統一標題</th><th>網址</th><th>備註</th><th></th></tr></thead><tbody>'+rows.map(rowHTML).join("")+'</tbody></table></div>';
  const tb=$("#lst tbody");
  const dirty=()=>{cur.dirty=true;clearTimeout(dirty.t);dirty.t=setTimeout(()=>saveDraft(path,JSON.stringify(readRows()),cur.sha),300);setState()};
  $("#lst").oninput=dirty;
  $("#lst").onchange=e=>{if(e.target.matches(".p")&&e.target.checked&&$("#lst").querySelectorAll(".p:checked").length>5){e.target.checked=false;toast("預設收藏最多 5 則");return}dirty()};
  $("#lst-add").onclick=()=>{const y=(readRows()[0]||{}).y||"";tb.insertAdjacentHTML("afterbegin",rowHTML({y,d:["ba","ib"],site:"dcard",t:"",u:""}));tb.querySelector("tr .t").focus();dirty()};
  tb.onclick=e=>{const a=e.target.closest("button")?.dataset.a;if(!a)return;const tr=e.target.closest("tr");
    if(a==="up"&&tr.previousElementSibling)tr.previousElementSibling.before(tr);
    if(a==="down"&&tr.nextElementSibling)tr.nextElementSibling.after(tr);
    if(a==="del"){if(!confirm("刪除「"+(tr.querySelector(".t").value||"這一篇")+"」？"))return;tr.remove()}
    dirty()};
  setState();
}
async function publishList(){
  const btn=$("#b-publish");btn.disabled=true;$("#state").textContent="發布中…";
  try{
    const text=listText(readRows());
    new Function("DC","return ["+text.slice(text.indexOf("const SOURCES=[")+15,text.indexOf("\n];"))+"]")(DCV); // 確認格式沒壞
    cur.sha=await putFile(cur.path,b64enc(text),"Update reading list",cur.sha);
    cur.text=text;cur.dirty=false;saveDraft(cur.path,null);setState();toast("已發布，大約 1 分鐘後網站會更新。",4000);
  }catch(e){btn.disabled=false;setState();alert(e.message)}
}

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
  $(".adm-site").textContent=SITE.name.split("｜")[0];$(".adm-site").title=SITE.name;$("#live").href=BASE;
  $("#pages").innerHTML=SITE.pages.map(([p,t])=>'<a href="#'+p+'" data-p="'+p+'">'+t+'</a>').join("")+
    (SITE.lists||[]).map(([p,t])=>'<a href="#'+p+'" data-p="'+p+'">'+t+'</a>').join("");
  $("#pages").onclick=e=>{const a=e.target.closest("a");if(!a)return;e.preventDefault();openPage(a.dataset.p)};
  const want=decodeURIComponent(location.hash.slice(1));
  openPage([...SITE.pages,...(SITE.lists||[])].some(([p])=>p===want)?want:SITE.pages[0][0]);
}
(async()=>{
  if(token&&await login().catch(()=>false))start();
  else{$("#login").hidden=false;if(token)$("#login-msg").textContent="這組 token 失效或沒有寫入權限（Contents 要 Read and write），請修正後重新貼上。"}
})();
})();
