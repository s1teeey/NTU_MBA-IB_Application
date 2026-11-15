# 推甄分享｜台大商研、台大國企

台大商研、國企推甄的簡章、師資、書審、面試和心得文。

https://s1teeey.github.io/NTU_MBA-IB_Application/

## 資料夾地圖

| 位置 | 內容 |
|---|---|
| `index.html` | 首頁 |
| `sharing.html` | 簡章細則 |
| `ba.html` | 商研師資 |
| `ib.html` | 國企師資 |
| `docs.html` | 書審撰寫 |
| `interview.html` | 面試準備 |
| `faq.html` | FAQ |
| `guide.html` | 舊網址，會轉到 `sharing.html` |
| `assets/site.css`、`assets/site.js` | 共用樣式、選單、深淺色、試算表文字 |
| `assets/sources.js` | 心得文清單 |
| `assets/search.js` | 站內搜尋 |
| `img/ba/`、`img/ib/` | 教授照片，來自台大管院師資頁 |
| `content.csv` | 全站文字，匯入試算表用 |

## 改文字

在 Google 試算表「推甄分享」分頁的「修改後」欄填字，重新整理網頁就會更新。

- `【文字】` 會變螢光筆
- 儲存格換行就是網頁換行
- 試算表要開「知道連結的人可以檢視」
- 重新匯入 `content.csv` 會清掉已經填的字
- 師資頁的教授資料不在試算表

## 心得文

在 `assets/sources.js` 加一行：

| 欄位 | 內容 |
|---|---|
| `y` | 學年度（面試在前一年秋天） |
| `d` | `ba` 商研、`ib` 國企 |
| `site` | 來源，例如 `dcard` |
| `t` | 標題 |
| `u` | 連結 |
| `note` | 備註，可不填 |

面試紀錄只放年度、關卡和連結，不轉貼原文。
