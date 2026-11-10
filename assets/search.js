/* Site search. The index is built in the browser the first time the box is used,
   by fetching each page, so edits to the pages show up without a separate index file. */
(function(){
  const box=document.querySelector(".search");if(!box)return;
  const input=box.querySelector("input"), panel=box.querySelector(".sresults");
  const TEXT_PAGES=[["sharing.html","推甄須知"],["docs.html","書審撰寫"],["interview.html","面試準備"],["faq.html","FAQ"]];
  const PROF_PAGES=[["ba.html","商研教授"],["ib.html","國企教授"]];
  let index=null, loading=null, active=-1;

  const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const getHTML=u=>fetch(u).then(r=>r.ok?r.text():"").catch(()=>"");

  async function build(){
    const out=[];
    const docs=await Promise.all([...PROF_PAGES,...TEXT_PAGES].map(([u])=>getHTML(u)));
    const parser=new DOMParser();

    // professor pages: run only the data part of the inline script (everything before the DOM helpers)
    PROF_PAGES.forEach(([u,label],i)=>{
      const doc=parser.parseFromString(docs[i],"text/html");
      const code=[...doc.querySelectorAll("script:not([src])")].map(s=>s.textContent).find(t=>t.includes("const PROFS"));
      if(!code)return;
      const data=code.slice(0,code.indexOf("const $="));
      let d;try{d=new Function(data+"\nreturn {PROFS,Q116};")()}catch(e){return}
      d.PROFS.forEach(p=>{
        const text=[p.cat,p.econ?"經濟背景":"",(p.res||[]).join("、"),p.edu||"",p.c||"",
          (p.iv||[]).map(x=>x.y+" 學年度第 "+x.s+" 關 "+x.kind).join("、")].join(" ");
        out.push({g:label,t:p.n+"・"+p.t,x:text,u:u+"#p-"+p.k});
      });
      (d.Q116&&d.Q116.stages||[]).forEach(st=>{
        out.push({g:label,t:"116 第 "+st.s+" 關 "+st.kind+"・"+st.who,x:[st.how,st.topic||"",...st.q].join(" "),u:u+"#y116"});
      });
    });

    // 心得文
    if(typeof SOURCES==="undefined"){
      await new Promise(res=>{const s=document.createElement("script");s.src="assets/sources.js?v=202611102046";s.onload=res;s.onerror=res;document.head.appendChild(s)});
    }
    if(typeof SOURCES!=="undefined")SOURCES.forEach(s=>{
      out.push({g:"心得文",t:s.t,x:[s.t,SITE_NAME[s.site],s.y+" 學年度",s.d.map(k=>DEPT_NAME[k]).join("、"),s.note||""].join(" "),
        u:s.site==="own"?"ba.html#y116":s.u,ext:s.site!=="own",sub:SITE_NAME[s.site]+" · "+s.y});
    });

    // text pages: one entry per block, titled by the nearest heading
    TEXT_PAGES.forEach(([u,label],j)=>{
      const doc=parser.parseFromString(docs[PROF_PAGES.length+j],"text/html");
      const main=doc.querySelector("main");if(!main)return;
      let head=label;
      main.querySelectorAll("h1,h2,h3,summary,p,li,tr").forEach(el=>{
        if(el.tagName!=="LI"&&el.closest("li"))return;
        const t=el.textContent.replace(/\s+/g," ").trim();if(!t)return;
        if(el.tagName==="SUMMARY"||/^H[123]$/.test(el.tagName)){head=t.replace(/^0\d/,"");return}
        const sub=el.tagName==="LI"&&el.querySelector("h3");
        out.push({g:label,t:sub?sub.textContent.trim():head,x:t,u:u,frag:true});
      });
    });
    return out;
  }

  function snippet(text,terms){
    const low=text.toLowerCase();let at=-1;
    for(const w of terms){const i=low.indexOf(w);if(i>=0&&(at<0||i<at))at=i}
    const start=Math.max(0,at-24), end=Math.min(text.length,(at<0?0:at)+70);
    let s=esc((start>0?"…":"")+text.slice(start,end)+(end<text.length?"…":""));
    terms.forEach(w=>{const re=new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");s=s.replace(re,m=>"<mark>"+m+"</mark>")});
    return s;
  }

  function render(q){
    const terms=q.toLowerCase().split(/\s+/).filter(Boolean);
    active=-1;
    if(!terms.length){panel.hidden=true;return}
    const seen=new Set();
    const hits=index.filter(r=>{const h=(r.t+" "+r.x).toLowerCase();return terms.every(w=>h.includes(w))})
      .filter(r=>{const k=r.u+"|"+r.x;if(seen.has(k))return false;seen.add(k);return true}).slice(0,40);
    panel.innerHTML="";
    if(!hits.length){panel.innerHTML='<p class="empty">找不到「'+esc(q)+'」</p>';panel.hidden=false;return}
    let g=null;
    hits.forEach(r=>{
      if(r.g!==g){g=r.g;const h=document.createElement("p");h.className="grp";h.textContent=g;panel.appendChild(h)}
      const a=document.createElement("a");
      a.href=r.frag?r.u+"#:~:text="+encodeURIComponent(terms[0]):r.u;
      if(r.ext){a.target="_blank";a.rel="noopener"}
      a.innerHTML='<span class="t">'+snippet(r.t,terms)+'</span>'+(r.sub?'<span class="s">'+esc(r.sub)+'</span>':r.x!==r.t?'<span class="s">'+snippet(r.x,terms)+'</span>':"");
      a.addEventListener("click",()=>{panel.hidden=true});
      panel.appendChild(a);
    });
    panel.hidden=false;
  }

  async function run(){
    const q=input.value.trim();
    if(!q){panel.hidden=true;return}
    if(!index){
      panel.innerHTML='<p class="empty">建立索引中…</p>';panel.hidden=false;
      index=await (loading||(loading=build()));
    }
    if(input.value.trim()===q)render(q);
  }

  let tm;input.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(run,120)});
  input.addEventListener("focus",()=>{if(!loading)loading=build().then(r=>index=r);if(input.value.trim())run()});
  input.addEventListener("keydown",e=>{
    const items=[...panel.querySelectorAll("a")];
    if(e.key==="Escape"){panel.hidden=true;input.blur();return}
    if(!items.length||panel.hidden)return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      e.preventDefault();active=(active+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;
      items.forEach((a,i)=>a.classList.toggle("on",i===active));items[active].scrollIntoView({block:"nearest"});
    }
    if(e.key==="Enter"){e.preventDefault();(items[active]||items[0]).click()}
  });
  document.addEventListener("click",e=>{if(!box.contains(e.target))panel.hidden=true});
  document.addEventListener("keydown",e=>{
    if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();input.focus()}
  });
})();
