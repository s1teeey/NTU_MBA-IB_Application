/* 推甄心得文清單。y = 學年度（面試在前一年秋天），d = 涵蓋的所：ba 商研 / ib 國企。
   109 學年度（含）以前每所一篇，用簡單列表；110 以後可能多篇，用卡片。 */
const DC="https://www.dcard.tw/f/graduate_school/p/";
const SOURCES=[
  {y:116,d:["ba","ib"],site:"own",t:"116 學年度面試題目",u:"#y116",note:"網站作者的紀錄，只列題目"},

  {y:115,d:["ba","ib"],site:"dcard",t:"115 商管推甄正取分享：台大商研／台大國企",u:DC+"260371156"},
  {y:115,d:["ba","ib"],site:"dcard",t:"商研／企研／國企複試懶人包＋連結",u:DC+"261008223",note:"整理多篇連結"},
  {y:115,d:["ba"],site:"dcard",t:"115 推甄心得（補充）",u:DC+"261160220"},

  {y:114,d:["ba","ib"],site:"dcard",t:"114 台大商研／台大國企／政大企研面試心得",u:DC+"257296058"},
  {y:114,d:["ba","ib"],site:"dcard",t:"114 推甄心得：28% 跨領域非應屆",u:DC+"257352226"},
  {y:114,d:["ba","ib"],site:"dcard",t:"114 商管研究所推甄分享（台大商研、台大國企、政大企研、政大科智）",u:DC+"259855300"},

  {y:113,d:["ba","ib"],site:"dcard",t:"113 推甄正取心得：台大國企／商研等",u:DC+"254109162"},
  {y:113,d:["ba"],site:"medium",t:"研究所推甄｜台大商研、政大企研｜2023",u:"https://medium.com/@kaiwenn/%E7%A0%94%E7%A9%B6%E6%89%80%E6%8E%A8%E7%94%84-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E6%94%BF%E5%A4%A7%E4%BC%81%E7%A0%94-2023-e430d8015f75"},
  {y:113,d:["ba","ib"],site:"medium",t:"2023 推甄心得分享：台大商研、台大國企（面試篇）",u:"https://medium.com/@kitty91041012334/2023%E6%8E%A8%E7%94%84%E5%BF%83%E5%BE%97%E5%88%86%E4%BA%AB-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E9%9D%A2%E8%A9%A6%E7%AF%87-2fdd8bd477e1"},

  {y:112,d:["ba","ib"],site:"dcard",t:"112 年推甄面試分享（台大資管／商研／國企）",u:DC+"240534805"},
  {y:112,d:["ba"],site:"notion",t:"〚理工轉商管〛台大商研推甄經驗分享",u:"https://livia-liang.notion.site/1e49eca82c3e419fb0944e6941ad3b1c",note:"書審寫得很細"},
  {y:112,d:["ba"],site:"dcard",t:"推甄心得（2023 年 1 月）",u:DC+"241103555"},
  {y:112,d:["ba","ib"],site:"medium",t:"【2022 推甄心得】台大商研．台大國企．政大企研．政大科管 書審＆面試",u:"https://medium.com/@huang2321/2022%E6%8E%A8%E7%94%84%E5%BF%83%E5%BE%97-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E6%94%BF%E5%A4%A7%E4%BC%81%E7%A0%94-%E6%94%BF%E5%A4%A7%E7%A7%91%E7%AE%A1-%E6%9B%B8%E5%AF%A9-%E9%9D%A2%E8%A9%A6-978d8a2c38e3"},

  {y:111,d:["ba","ib"],site:"dcard",t:"111 推甄：台大國企、台大商研錄取分享",u:DC+"239956512"},
  {y:111,d:["ib"],site:"dcard",t:"111 推甄心得（補充）",u:DC+"237648879"},
  {y:111,d:["ba","ib"],site:"medium",t:"推甄心得分享｜政大企研、台大商研、台大國企（面試篇）",u:"https://smartfish.medium.com/111-%E6%8E%A8%E7%94%84%E5%BF%83%E5%BE%97%E5%88%86%E4%BA%AB-%E6%94%BF%E5%A4%A7%E4%BC%81%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E9%9D%A2%E8%A9%A6%E7%AF%87-7e3bb9893ac2"},

  {y:110,d:["ba","ib"],site:"dcard",t:"28% 停修四次：台大商研／國企正取心得",u:DC+"234844532",note:"PTT 有同一篇"},
  {y:110,d:["ba","ib"],site:"medium",t:"研究所推甄｜2020 台大商研・台大國企・台大會研",u:"https://successful-vanilla-mole-926.medium.com/%E7%A0%94%E7%A9%B6%E6%89%80%E6%8E%A8%E7%94%84-2020%E5%8F%B0%E5%A4%A7%E5%95%86%E7%A0%94-%E5%8F%B0%E5%A4%A7%E5%9C%8B%E4%BC%81-%E5%8F%B0%E5%A4%A7%E6%9C%83%E7%A0%94-ad4d3c0318b2"},

  {y:109,d:["ba","ib"],site:"ptt",t:"台大商研／台大國企 推甄正取心得",u:"https://www.pttweb.cc/bbs/graduate/M.1574230048.A.082"},
  {y:108,d:["ba"],site:"dcard",t:"推甄台大商研／政大財管／金融",u:"https://www.dcard.tw/f/exam/p/230237132"},
  {y:108,d:["ib"],site:"ptt",t:"台大商研國企會研／政大企研國貿 推甄心得",u:"https://www.ptt.cc/bbs/graduate/M.1543684514.A.1C7.html"},
  {y:107,d:["ba"],site:"ptt",t:"台大商研推甄",u:"https://www.pttweb.cc/bbs/graduate/M.1526109224.A.AE9"},
  {y:107,d:["ib"],site:"ptt",t:"台大國企／政大金融、風管／交大資財 推甄",u:"https://www.pttweb.cc/bbs/graduate/M.1519855933.A.ACB"},
  {y:106,d:["ba"],site:"ptt",t:"臺大商研／臺大財金（風管組）推甄面試",u:"https://www.pttweb.cc/bbs/graduate/M.1481561218.A.5D8"},
  {y:106,d:["ib"],site:"ptt",t:"台大商研／台大國企 推甄心得",u:"https://www.pttweb.cc/bbs/graduate/M.1491033606.A.55C"},
];
const SITE_NAME={dcard:"Dcard",ptt:"PTT",medium:"Medium",notion:"Notion",own:"本站"};
const DEPT_NAME={ba:"商研",ib:"國企"};

/* opts: {dept:"ba"|"ib"|null, ownHref:"#y116", onOwn:fn} */
function renderSources(box,opts){
  opts=opts||{};
  const rows=SOURCES.filter(s=>!opts.dept||s.d.includes(opts.dept));
  const years=[...new Set(rows.map(s=>s.y))].sort((a,b)=>b-a);
  const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  const recent=years.filter(y=>y>=110), old=years.filter(y=>y<110);

  recent.forEach(y=>{
    const g=mk("div","src-year");
    const yr=mk("div","yr",String(y));yr.appendChild(mk("small",null,(y+1910)+" 秋天面試"));g.appendChild(yr);
    const ul=mk("ul","src-items");
    rows.filter(s=>s.y===y).forEach(s=>{
      const li=mk("li");const a=mk("a",null,s.t);
      if(s.site==="own"){a.href=opts.ownHref||s.u;if(opts.onOwn)a.onclick=e=>{e.preventDefault();opts.onOwn()}}
      else{a.href=s.u;a.target="_blank";a.rel="noopener"}
      li.appendChild(a);
      const bits=[SITE_NAME[s.site]];
      if(!opts.dept)bits.push(s.d.map(d=>DEPT_NAME[d]).join("、"));
      if(s.note)bits.push(s.note);
      const m=mk("span","meta");m.appendChild(mk("span","site",bits[0]));
      if(bits.length>1)m.appendChild(document.createTextNode(" · "+bits.slice(1).join(" · ")));
      li.appendChild(m);ul.appendChild(li);
    });
    g.appendChild(ul);box.appendChild(g);
  });

  if(old.length){
    const g=mk("div","src-year");
    const yr=mk("div","yr","109");yr.appendChild(mk("small",null,"以前"));g.appendChild(yr);
    const ul=mk("ul","src-old");
    old.forEach(y=>rows.filter(s=>s.y===y).forEach(s=>{
      const li=mk("li");const a=mk("a");a.href=s.u;a.target="_blank";a.rel="noopener";a.title=s.t;
      a.appendChild(mk("span","y",y+" 學年度"+(opts.dept?"":"・"+s.d.map(d=>DEPT_NAME[d]).join("／"))));
      a.appendChild(mk("span","h",SITE_NAME[s.site]));
      li.appendChild(a);ul.appendChild(li);
    }));
    g.appendChild(ul);box.appendChild(g);
  }
}
