/* 推甄心得文清單。y = 學年度（面試在前一年秋天），d = 涵蓋的所：ba 商研 / ib 國企。
   109 學年度（含）以前每所一篇，用簡單列表；110 以後可能多篇，用卡片。 */
const DC="https://www.dcard.tw/f/graduate_school/p/";
const SOURCES=[
  {y:116,d:["ba","ib"],site:"own",t:"116 台大商研、台大國企推甄口試紀錄",s:"116 口試紀錄｜台大商研、台大國企",u:"my.html#record",pin:1},

  {y:115,d:["ba","ib"],site:"dcard",t:"115 商管推甄正取分享 台大商研/台大國企 📝",s:"115 推甄分享｜台大商研、台大國企",u:DC+"260371156"},
  {y:115,d:["ba"],site:"dcard",t:"115 推甄經驗分享（台大商研/台大國企/政大企研/交大經管/成大國企）",s:"115 推甄分享｜台大商研、台大國企、政大企研、交大經管、成大國企",u:DC+"261160220"},
  {y:115,d:["ba","ib"],site:"dcard",t:"115推甄面試分享【台大商研、台大國企、政大企研、政大國貿、清大科管】",s:"115 推甄分享｜台大商研、台大國企、政大企研、政大國貿、清大科管",u:DC+"260365923"},
  {y:115,d:["ib"],site:"dcard",t:"115學年度推甄心得 – 台大財金/台大國企/台大商研/政大財管/政大金融/中山財管",s:"115 推甄分享｜台大財金、台大國企、台大商研、政大財管、政大金融、中山財管",u:DC+"260675078"},
  {y:115,d:["ba","ib"],site:"dcard",t:"115商管推甄心得 臺大商研/臺大國企/政大國貿/政大企研A組",s:"115 推甄分享｜台大商研、台大國企、政大國貿、政大企研",u:DC+"260351252"},
  {y:115,d:["ib"],site:"dcard",t:"115 推甄心得【台大國企、政大國貿、政大科智、清大科管、清大工工】",s:"115 推甄分享｜台大國企、政大國貿、政大科智、清大科管、清大工工",u:DC+"260493560"},
  {y:115,d:["ba","ib"],site:"dcard",t:"115推甄 台大財金／商研/ 國企、政大財管／國貿｜心得分享",s:"115 推甄分享｜台大財金、台大商研、台大國企、政大財管、政大國貿",u:DC+"262131956"},
  {y:115,d:["ba","ib"],site:"dcard",t:"推甄心得分享（財金/國企/商研/國貿）",s:"115 推甄分享｜台大財金、台大國企、台大商研、政大國貿",u:DC+"262112216"},
  {y:115,d:["ba","ib"],site:"dcard",t:"115 商管研究所心得",s:"115 推甄分享｜台大商研、台大國企",u:DC+"261160249"},

  {y:114,d:["ba","ib"],site:"dcard",t:"114台大商研/台大國企/政大企研面試心得　文長！！",s:"114 推甄分享｜台大商研、台大國企、政大企研",u:DC+"257296058"},
  {y:114,d:["ba","ib"],site:"dcard",t:"【 114 推甄心得】 28% 跨領域非應屆｜台大商研、台大國企、政大企研、政大科智、政大資管",s:"114 推甄分享｜台大商研、台大國企、政大企研、政大科智、政大資管",u:DC+"257352226"},
  {y:114,d:["ba","ib"],site:"dcard",t:"114商管研究所推甄分享（台大商研、台大國企、政大企研、政大科智）",s:"114 推甄分享｜台大商研、台大國企、政大企研、政大科智",u:DC+"259855300"},
  {y:114,d:["ib"],site:"dcard",t:"2024 台政商管推甄分享",s:"114 推甄分享｜台大國企、政大財政",u:DC+"258200826"},
  {y:114,d:["ib"],site:"dcard",t:"114財金/國企所推甄分享（台大財金甲/乙組、台大國企、政大財管、政大金融財工組、清大計財）",s:"114 推甄分享｜台大財金、台大國企、政大財管、政大金融、清大計財",u:DC+"258024367"},
  {y:114,d:["ba"],site:"dcard",t:"【114 推甄錄取心得】台大商研、台大資管、政大資管、清大服科、交大資管",s:"114 推甄分享｜台大商研、台大資管、政大資管、清大服科、交大資管",u:DC+"257825368"},

  {y:113,d:["ba","ib"],site:"dcard",t:"113 推甄正取心得 台大國企/台大商研/政大企研/政大科智/陽交大經管",s:"113 推甄分享｜台大國企、台大商研、政大企研、政大科智、陽交大經管",u:DC+"254109162"},
  {y:113,d:["ba"],site:"medium",t:"研究所推甄｜台大商研、政大企研｜2023",s:"113 推甄分享｜台大商研、政大企研",u:"https://medium.com/@kaiwenn/%E7%A0%94%E7%A9%B6%E6%89%80%E6%8E%A8%E7%94%84-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E6%94%BF%E5%A4%A7%E4%BC%81%E7%A0%94-2023-e430d8015f75"},
  {y:113,d:["ba"],site:"dcard",t:"113推甄面試分享 台大商研/台大財金丙/政大風管",s:"113 推甄分享｜台大商研、台大財金、政大風管",u:DC+"254039958"},
  {y:113,d:["ib"],site:"dcard",t:"113 中字輩商管推甄心得分享（台大國企、政大企研、交大經管、成大國企、成大企研）",s:"113 推甄分享｜台大國企、政大企研、交大經管、成大國企、成大企研",u:DC+"256664272"},
  {y:113,d:["ba","ib"],site:"dcard",t:"2023推甄心得分享|台大商研、台大國企",s:"113 推甄分享｜台大商研、台大國企",u:DC+"254427651"},
  {y:113,d:["ib"],site:"dcard",t:"113推甄心得 台大國企/政大財管/政大金融/政大風管管理組/政大風管精算組/交大經管/交大資財乙",s:"113 推甄分享｜台大國企、政大財管、政大金融、政大風管、交大經管、交大資財",u:DC+"254021707"},
  {y:113,d:["ib"],site:"dcard",t:"113推甄心得（台大國企、政大企研、政大國貿、交大經管、成大國企）",s:"113 推甄分享｜台大國企、政大企研、政大國貿、交大經管、成大國企",u:DC+"254330043"},
  {y:113,d:["ib"],site:"dcard",t:"113文跨商推甄準備心得分享（台大國企、政大企研/國貿、成大企研/國企、交大管科/經管/科管、清大科管）",s:"113 推甄分享｜台大國企、政大企研、政大國貿、成大企研、成大國企、交大管科、交大經管、交大科管、清大科管",u:DC+"254107691"},
  {y:113,d:["ba"],site:"dcard",t:"【2023 推甄心得】台大商研、台大資管、政大資管",s:"113 推甄分享｜台大商研、台大資管、政大資管",u:DC+"254821899"},
  {y:113,d:["ba","ib"],site:"dcard",t:"[113推甄面試題目分享] 台大財金甲/台大國企/台大商研/政大財管/政大財政",s:"113 推甄分享｜台大財金、台大國企、台大商研、政大財管、政大財政",u:DC+"256506191"},
  {y:113,d:["ba","ib"],site:"dcard",t:"【113推徵面試題目分享】 台大財金甲/台大財金乙/台大商研/台大國企",s:"113 推甄分享｜台大財金、台大商研、台大國企",u:DC+"254857207"},

  {y:112,d:["ba","ib"],site:"dcard",t:"112年推甄面試分享（台大資管/台大商研/台大國企）",s:"112 推甄分享｜台大資管、台大商研、台大國企",u:DC+"240534805"},
  {y:112,d:["ba"],site:"dcard",t:"｜理工轉商管｜台大商研推甄經驗分享",s:"112 推甄分享｜台大商研",u:DC+"241103555"},
  {y:112,d:["ba"],site:"medium",t:"【2022推甄心得】台大商研．台大國企．政大企研．政大科管 書審&面試",s:"112 推甄分享｜台大商研、政大企研、政大科管",u:"https://medium.com/@huang2321/2022%E6%8E%A8%E7%94%84%E5%BF%83%E5%BE%97-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E6%94%BF%E5%A4%A7%E4%BC%81%E7%A0%94-%E6%94%BF%E5%A4%A7%E7%A7%91%E7%AE%A1-%E6%9B%B8%E5%AF%A9-%E9%9D%A2%E8%A9%A6-978d8a2c38e3"},
  {y:112,d:["ba","ib"],site:"dcard",t:"112 台大商研所、台大國企所 推甄心得",s:"112 推甄分享｜台大商研、台大國企",u:"https://www.dcard.tw/f/exam/p/253070647"},
  {y:112,d:["ba","ib"],site:"dcard",t:"112 臺大商研所/國企所 推甄心得分享",s:"112 推甄分享｜台大商研、台大國企",u:DC+"259211080"},
  {y:112,d:["ba"],site:"dcard",t:"非相關科系推甄台大商研所",s:"112 推甄分享｜台大商研",u:DC+"240577797"},

  {y:111,d:["ba","ib"],site:"dcard",t:"【心得】 111推甄 台大國企、台大商研錄取分享",s:"111 推甄分享｜台大國企、台大商研",u:DC+"239956512"},
  {y:111,d:["ba","ib"],site:"dcard",t:"111 推甄心得分享：系排30%｜政大企研、台大商研、台大國企",s:"111 推甄分享｜政大企研、台大商研、台大國企",u:DC+"237909796"},

  {y:110,d:["ba","ib"],site:"dcard",t:"28%停修四次 台大商研/國企正取心得",s:"110 推甄分享｜台大商研、台大國企",u:DC+"234844532"},
  {y:110,d:["ba","ib"],site:"medium",t:"研究所推甄｜2020台大商研・台大國企・台大會研",s:"110 推甄分享｜台大商研、台大國企、台大會研",u:"https://successful-vanilla-mole-926.medium.com/%E7%A0%94%E7%A9%B6%E6%89%80%E6%8E%A8%E7%94%84-2020%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E5%8F%B0%E5%A4%A7%E6%9C%83%E7%A0%94-ad4d3c0318b2"},
  {y:110,d:["ba","ib"],site:"dcard",t:"【推甄心得】2020 台大商研｜台大國企｜台大財金｜政大企研 推甄心得",s:"110 推甄分享｜台大商研、台大國企、台大財金、政大企研",u:DC+"237010285"},

  {y:109,d:["ba"],site:"dcard",t:"#心得 系排11%推甄上台大商研/政大企研/政大科智",s:"109 推甄分享｜台大商研、政大企研、政大科智",u:DC+"233524003"},

  {y:108,d:["ba"],site:"dcard",t:"推甄台大商研／政大財管／金融",s:"108 推甄分享｜台大商研、政大財管、政大金融",u:"https://www.dcard.tw/f/exam/p/230237132"},
  {y:108,d:["ib"],site:"ptt",t:"台大商研國企會研／政大企研國貿 推甄心得",s:"108 推甄分享｜台大商研、台大國企、台大會研、政大企研、政大國貿",u:"https://www.ptt.cc/bbs/graduate/M.1543684514.A.1C7.html"},

  {y:107,d:["ba"],site:"ptt",t:"台大商研推甄",s:"107 推甄分享｜台大商研",u:"https://www.pttweb.cc/bbs/graduate/M.1526109224.A.AE9"},
  {y:107,d:["ib"],site:"ptt",t:"台大國企／政大金融、風管／交大資財 推甄",s:"107 推甄分享｜台大國企、政大金融、政大風管、交大資財",u:"https://www.pttweb.cc/bbs/graduate/M.1519855933.A.ACB"},

  {y:106,d:["ba"],site:"ptt",t:"臺大商研／臺大財金（風管組）推甄面試",s:"106 推甄分享｜台大商研、台大財金",u:"https://www.pttweb.cc/bbs/graduate/M.1481561218.A.5D8"},
  {y:106,d:["ib"],site:"ptt",t:"台大商研／台大國企 推甄心得",s:"106 推甄分享｜台大商研、台大國企",u:"https://www.pttweb.cc/bbs/graduate/M.1491033606.A.55C"}
];
const SITE_NAME={dcard:"Dcard",ptt:"PTT",medium:"Medium",notion:"Notion",own:"本站"};
const DEPT_NAME={ba:"商研",ib:"國企"};

/* opts: {dept:"ba"|"ib"|null}
   上方：收藏（訪客自己的，最多 5 則；預設＝清單裡 pin:1 的）。
   110 以後：一個學年度一列，連結在列內排兩欄。109 以前：最下方一張表。
   標題可切換「原標題」／「統一標題」（s 欄，沒填就自動產生）。 */
const FAV_MAX=5;
function renderSources(box,opts){
  opts=opts||{};
  const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  const get=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const all=SOURCES.filter(s=>!opts.dept||s.d.includes(opts.dept));
  const rows=all.filter(s=>s.site!=="own");
  const short=s=>s.s||(s.y+" "+(s.site==="own"?"口試紀錄":"推甄分享")+"｜"+s.d.map(d=>"台大"+DEPT_NAME[d]).join("、"));
  let uni=get("src-short",false);
  let fav=get("src-fav",null);if(!Array.isArray(fav))fav=SOURCES.filter(s=>s.pin).map(s=>s.u);
  fav=fav.filter(u=>SOURCES.some(s=>s.u===u)).slice(0,FAV_MAX);

  const item=s=>{
    const li=mk("li");if(s.d.length===1)li.dataset.d=s.d[0];
    const a=mk("a","t",uni?short(s):s.t);a.dataset.full=s.t;a.dataset.short=short(s);a.title=s.t;a.href=s.u;
    if(s.site!=="own"){a.target="_blank";a.rel="noopener"}
    const star=mk("button","star",fav.includes(s.u)?"★":"☆");star.type="button";star.dataset.u=s.u;
    star.setAttribute("aria-label",fav.includes(s.u)?"移除書籤":"加入書籤");star.setAttribute("aria-pressed",String(fav.includes(s.u)));
    const top=mk("div","ln");top.append(a,star);li.appendChild(top);
    const m=mk("span","meta");m.appendChild(mk("span","site "+(s.site==="own"?"mine":s.site),SITE_NAME[s.site]));
    if(!opts.dept)s.d.forEach(d=>m.appendChild(mk("span","d-"+d,DEPT_NAME[d])));
    if(s.note)m.appendChild(mk("span",null,s.note));
    li.appendChild(m);return li;
  };
  const draw=()=>{
    box.innerHTML="";
    // 右上：標題切換
    const tools=mk("div","src-tools");
    const sw=mk("button","sw-t");sw.type="button";sw.setAttribute("role","switch");sw.setAttribute("aria-checked",String(uni));
    sw.innerHTML='<span class="knob"></span>統一標題';sw.onclick=()=>{uni=!uni;set("src-short",uni);draw()};
    tools.appendChild(sw);box.appendChild(tools);
    // 收藏
    const fb=mk("div","src-year src-fav");
    const fh=mk("div","yr");fh.innerHTML='<svg class="bm" viewBox="0 0 24 24" aria-label="書籤" role="img"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';fb.appendChild(fh);
    const ful=mk("ul","src-items");
    fav.forEach(u=>{const s=SOURCES.find(x=>x.u===u);if(s){const li=item(s);li.querySelector(".meta").remove();ful.appendChild(li)}});
    if(!fav.length)ful.appendChild(mk("li","empty","點文章旁的 ☆ 加入書籤，最多 "+FAV_MAX+" 則。"));
    fb.appendChild(ful);box.appendChild(fb);
    // 各學年度
    const years=[...new Set(rows.map(s=>s.y))].sort((a,b)=>b-a);
    const OPEN_FROM=Math.max(...years); // 最新一年展開，其餘收合
    years.filter(y=>y>=110).forEach(y=>{
      const list=rows.filter(s=>s.y===y);
      const ul=mk("ul","src-items");list.forEach(s=>ul.appendChild(item(s)));
      if(y>=OPEN_FROM){const g=mk("div","src-year");g.appendChild(mk("div","yr",String(y)));g.appendChild(ul);box.appendChild(g);return}
      const g=mk("details","src-year src-fold");const sm=mk("summary");
      sm.appendChild(mk("span","yr",String(y)));sm.appendChild(mk("span","cnt",list.length+" 篇"));
      g.appendChild(sm);g.appendChild(ul);box.appendChild(g);
    });
    const old=years.filter(y=>y<110);
    if(old.length){
      const wrap=mk("details","src-past src-fold");const ps=mk("summary");ps.appendChild(mk("span","yr","109 以前"));ps.appendChild(mk("span","cnt",rows.filter(s=>s.y<110).length+" 篇"));wrap.appendChild(ps);
      const tbl=mk("table");const hr=tbl.createTHead().insertRow();
      ["學年度"].concat(opts.dept?[]:["所"]).concat(["心得文","平台"]).forEach(h=>{const th=mk("th",null,h);th.scope="col";hr.appendChild(th)});
      const tb=tbl.createTBody();
      old.forEach(y=>rows.filter(s=>s.y===y).forEach(s=>{
        const r=tb.insertRow();if(s.d.length===1)r.dataset.d=s.d[0];
        r.insertCell().textContent=y;r.cells[0].className="y";
        if(!opts.dept){const dc=r.insertCell();s.d.forEach((d,i)=>{if(i)dc.appendChild(document.createTextNode("、"));dc.appendChild(mk("span","d-"+d,DEPT_NAME[d]))})}
        const c=r.insertCell();const a=mk("a",null,uni?short(s):s.t);a.title=s.t;a.href=s.u;a.target="_blank";a.rel="noopener";c.appendChild(a);
        const pc=r.insertCell();pc.className="h";pc.appendChild(mk("span","site "+s.site,SITE_NAME[s.site]));
      }));
      wrap.appendChild(tbl);box.appendChild(wrap);
    }
  };
  box.addEventListener("click",e=>{
    const b=e.target.closest("button.star");if(!b)return;const u=b.dataset.u;
    if(fav.includes(u))fav=fav.filter(x=>x!==u);
    else{if(fav.length>=FAV_MAX){b.classList.add("full");b.title="書籤最多 "+FAV_MAX+" 則";setTimeout(()=>b.classList.remove("full"),900);return}fav=[...fav,u]}
    set("src-fav",fav);draw();
  });
  draw();
}
