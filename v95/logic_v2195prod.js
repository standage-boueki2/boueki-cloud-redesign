/* ═══ v21.95 prod（2026-11-17 改修一覧の週次レビュー・第6回 UAT）商品登録・取り込み・ドキュメント
   No.478（中）産地の表示を画面間で一致させる（書類をつくる＝「（未登録）」／商品情報＝「日本」）
     原因：書類をつくる（v85docFacts／v85docPremHtml）の「産地」は都道府県（V85PREF）だけを見る欄。登録の産地が「日本」だけだと都道府県が取れず「（未登録）」と出ていた。
           また都道府県は「会社の所在地（city）」を先に見るため、産地に都道府県があっても所在地の県が出ることがあった。
     直し：① 産地（origin）に都道府県があれば、所在地より先にそれを使う（商品情報の産地と同じ県）
           ② 表示は「産地：日本（都道府県は未登録）」のように、商品情報と同じ登録の産地を出し、欄の名前は「産地（都道府県）」にする
   No.479（中）商品登録で取り込んだファイル（仕様書PDF・商品写真）もドキュメント一覧に出す・取り込み由来の行に削除
     原因：取り込み（entriesToTenant）は文字を読めた資料（Excel・テキスト）だけを「取り込んだ情報（t.sources）」に入れ、ドキュメント一覧は
           その名前の記録（d30Legacy の srcs 行・本体なし・削除なし）を出していただけ。PDF（AI 未接続）・画像は文字が無いので一覧に出ない。
     直し：① 商品登録で選んだファイルの本体を、商品が登録されたとき（adoptReal）にドキュメントへ入れる（d30AddFile・アップロード元「商品資料の取り込み」・商品名つき）
           ② 本体を入れた資料の名前だけの行は出さない（二重にしない・ドキュメントで消しても名前だけの行が戻らない）
           ③ 前の版で取り込んだ名前だけの行（本体なし）にも 🗑（取り込んだ情報からゴミ箱へ・30日戻せる）と公開範囲の欄を付ける（見せ方は rd_v95prod.js）
   No.480（中）取り込んだ商品写真を商品の画像に使う
     原因：商品タイル（刷新版 prodView）の画像は t.assets.ph[0]（営業資料の写真の枠）。取り込みは画像を文字の資料として数えるだけで、写真の枠に入れていなかった。
     直し：商品が登録されたとき、取り込んだ画像（Zip の中は除く・3枚まで）を写真の空いている枠へ入れる（imgNorm で 900px の JPEG・同じ写真は入れない）
   No.483（高）自動車部品を「中古車」と誤判定しない（カテゴリーの選択肢に「自動車部品」）
     原因：① detectCat が「車両・車検・年式」などの語を2つ以上数えると car（中古車）にする（ブレーキパッドの紹介文でも当たる）
           ② catLabelOf が「自動車」を含む語（自動車用品・自動車・建機・自動車用ブレーキパッド）を中古車にする
           ③ 選べるカテゴリーに「自動車部品」が無い（大分類「自動車・建機」の説明には「自動車部品」とあるのに、選べるのは中古車・建設機械だけ）
           catKey が car になると、車両情報表（型式・走行距離・車台番号）・輸出抹消仮登録証明書・第三者検査・UN3166 などの中古車の規制・書類が出る
     直し：カテゴリー「自動車部品」を足す（大分類 自動車・建機／内部の区分 catKey は parts＝工業部品と同じ規制・書類・業種の項目）。
           判定（detectCat・catLabelOf・v54hearCatOf・AI の読み取り・HS 8708/6813/4011）で部品の語があれば自動車部品に。中古車の強い語（走行距離・車台番号など）が2つ以上あれば中古車のまま。
           前に中古車と判定された部品の商品には、商品情報で「自動車部品に直す」を出す（勝手には変えない・rd_v95prod.js）
   No.484（高）取り込みで0項目だったファイル（ZIP 等）を商品として登録しない
     原因：取り込みの結果が0項目でも runParseReal → adoptReal が必ず商品を作る（読めない形式は blankTenant で空の商品）
     直し：商品名も商品の項目（会社名を除く）も0のときは商品を作らず、理由と「別の資料を選ぶ」「資料なしで、AIの質問に答えて登録する」を出す
   No.500（高）ドキュメントの公開範囲をアップロード時に選べるように・一覧からも変えられるように
     直し：アップロードの前に公開範囲を選ぶ窓（rd_v95prod.js）。既定は V95P.SCOPE_DEF（安全な形＝「社内のみ」。決めてほしいこと）。
           名前だけの行（取り込み）は公開範囲を選べる（取り込んだ情報に印を残す）。ほかの名前だけの行は「元の画面の設定に従う」と説明する。 */
var V95P = { err: [], tf: new WeakMap(), stash: null, SCOPE_DEF: "in", n: { photo: 0, doc: 0, empty: 0, cat: 0 } };
function v95pErr(k, e) { try { V95P.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95P.err.length > 40) V95P.err.shift(); } catch (x) { } }
function v95pLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v95pM(ja, en, zh, es) { const l = v95pLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v95pE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v95pToast(m) { try { if (typeof toast === "function") toast(m); } catch (e) { } }

/* ══════════ No.483 自動車部品 ══════════ */
const V95P_CAT = "自動車部品";
// 部品の語（これがあれば車両そのものではない）
const V95P_PART = /自動車部品|自動車用品|カー用品|車用品|カーパーツ|自動車パーツ|補修部品|純正部品|社外部品|互換部品|ブレーキ|ディスクローター|キャリパー|ライニング|ワイパー|マフラー|ラジエーター|ラジエター|オイルフィルター|エアフィルター|燃料フィルター|エアエレメント|スパークプラグ|点火プラグ|イグニッションコイル|ショックアブソーバー|サスペンション|クラッチ|ファンベルト|タイミングベルト|オルタネーター|セルモーター|スターターモーター|ガスケット|ハブベアリング|ドライブシャフト|タイロッド|ヘッドライト|テールランプ|バンパー|ドアミラー|フロアマット|シートカバー|タイヤ|アルミホイール|摩擦材|適合車種|auto\s*parts|car\s*parts|automotive\s*parts|spare\s*parts|brake|wiper|spark\s*plug|oil\s*filter|shock\s*absorber/i;
// 中古車（車両そのもの）の強い語。2つ以上あれば車両として扱う
const V95P_USED = /中古車|中古自動車|中古乗用車|中古トラック|走行距離|車台番号|修復歴|車検証|初度登録|オークション評価|輸出抹消|ハンドル位置|排気量|ro-?ro/gi;
// 車の話であることを示す語（工業部品・未分類から自動車部品にするときに品名に要る）／自動車部品の区分そのものの語
const V95P_VEH = /自動車|車用|乗用車|商用車|車両|トラック|カー用|automotive|\bauto\b|\bcar\b|vehicle/i;
const V95P_AUTOW = /自動車部品|自動車用品|カー用品|車用品|カーパーツ|自動車パーツ|auto\s*parts|car\s*parts|automotive\s*parts/i;
const V95P_VEHNM =/中古(?:車|自動車|乗用車|トラック|バス|二輪|バイク)|(?:^|[^部])車両本体/;
function v95pUsedN(s) { const m = String(s || "").match(V95P_USED) || []; return new Set(m.map((x) => x.toLowerCase())).size; }
// 品名（と資料の文）が自動車部品を指すか。nmOnly＝品名だけで判断
function v95pAutoPart(name, text) {
  const nm = String(name || "");
  if (/自転車|bicycle/i.test(nm)) return false;
  if (V95P_VEHNM.test(nm)) return false;
  if (nm && V95P_PART.test(nm)) return v95pUsedN(text || "") < 2;
  const s = String(text || "");
  if (s && V95P_PART.test(s) && v95pUsedN(s) < 2 && !V95P_VEHNM.test(s.slice(0, 400))) return true;
  return false;
}
function v95pTenText(t) {
  try {
    if (!t) return "";
    const a = [t.item, t.itemEn, t.catRaw, t.compTitle];
    (t.strengths || []).forEach((x) => a.push((x || []).join(" ")));
    (t.compRows || []).forEach((x) => a.push((x || []).join(" ")));
    a.push(String(t.srcCorpus || "").slice(0, 8000));
    (t.sources || []).slice(0, 6).forEach((x) => a.push(String((x && x.txt) || "").slice(0, 3000)));
    return a.filter(Boolean).join("\n");
  } catch (e) { return ""; }
}
const V95P_DEFCT = /^(成分表(・材質表)?|成分表・材質表|車両情報表|全成分表（INCI）)$/;
// 商品の区分を自動車部品にする（判定から呼ぶ・利用者が直すときにも呼ぶ）
function v95pSetAuto(t, why) {
  if (!t) return false;
  t.cat = V95P_CAT;
  t.catKey = "parts";
  try { if (!t.compTitle || V95P_DEFCT.test(String(t.compTitle))) t.compTitle = "材質・素材表"; } catch (e) { }
  delete t.v92catAsk;
  if (why) t.v92catWhy = why;
  V95P.n.cat++;
  return true;
}
// 取り込み・AI の読み取りで、自動の判定が中古車（または工業部品・未分類）になった自動車部品を自動車部品に（利用者が選んだ区分は変えない）
function v95pCatNorm(t, text) {
  try {
    if (!t || t.v95catUser) return false;
    const c = String(t.cat || "").trim(), k = String(t.catKey || "");
    if (c === V95P_CAT) return false;
    if (!(c === "中古車" || c === "工業部品" || c === "" || c === "その他" || k === "car")) return false;
    const txt = text ? String(text) + "\n" + v95pTenText(t) : v95pTenText(t);
    // 工業部品・未分類からは、車の話のとき（品名に自動車・車両など、または資料の語で中古車と判定されていた）だけ。工業用のブレーキなどは工業部品のまま
    if (c !== "中古車" && k !== "car" && !t.v95det && !V95P_VEH.test([t.item, t.itemEn, t.catRaw].filter(Boolean).join(" ")) && !V95P_AUTOW.test(String(t.catRaw || ""))) return false;
    if (!v95pAutoPart([t.item, t.itemEn].filter(Boolean).join(" "), (c === "中古車" || k === "car" || t.v95det) ? txt : "")) return false;
    return v95pSetAuto(t, "品名・資料から自動車部品と判断（中古車の語が無い）");
  } catch (e) { v95pErr("catnorm", e); return false; }
}
// 前に中古車と判定されたままの自動車部品（商品情報で「自動車部品に直す」を出す）
function v95pCarSuspect(t) {
  try {
    if (!t || t.v95carOk) return null;
    if (!(String(t.cat || "") === "中古車" || t.catKey === "car")) return null;
    if (t.v92catWhy === "商品情報の画面で選び直し" || t.v95catUser) return null;
    const nm = [t.item, t.itemEn].filter(Boolean).join(" ");
    if (!v95pAutoPart(nm, v95pTenText(t))) return null;
    const m = (nm.match(V95P_PART) || (v95pTenText(t).match(V95P_PART)) || [""])[0];
    return { kw: m, nm: t.item || t.itemEn || "" };
  } catch (e) { return null; }
}
function v95pAfterCat(msg) {
  try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { }
  try { if (typeof saveTen === "function") saveTen(); } catch (e) { }
  try { if (typeof render === "function") render(); } catch (e) { }
  if (msg) v95pToast(msg);
}
function v95pCarFix(t) {
  t = t || (typeof TEN !== "undefined" ? TEN : null);
  if (!t) return false;
  v95pSetAuto(t, "商品情報の画面で自動車部品に直した");
  t.v95catUser = 1;
  try { if (typeof logU === "function") logU("fill", "商材カテゴリーを選び直し:" + V95P_CAT); } catch (e) { }
  v95pAfterCat(v95pM("商材カテゴリーを「自動車部品」にしました（規制・書類・業種の項目は部品として出します）", "Category changed to “Auto parts” (regulations and documents are now for parts)", "已将商品类别改为“汽车零部件”", "Categoría cambiada a «Autopartes»"));
  return true;
}
function v95pCarKeep(t) {
  t = t || (typeof TEN !== "undefined" ? TEN : null);
  if (!t) return;
  t.v95carOk = 1;
  v95pAfterCat("");
}
// 選択肢に「自動車部品」を足す（中古車のすぐ後）
(function () {
  const addAfter = (a, after) => { try { if (!Array.isArray(a) || a.indexOf(V95P_CAT) >= 0) return; const i = a.indexOf(after); a.splice(i >= 0 ? i + 1 : a.length, 0, V95P_CAT); } catch (e) { v95pErr("cats", e); } };
  try { const n = (typeof NEED !== "undefined" && Array.isArray(NEED)) ? NEED.find((x) => x && x.k === "cat") : null; if (n) addAfter(n.chips, "中古車"); } catch (e) { v95pErr("need", e); }
  try { if (typeof V54U_CATS !== "undefined") addAfter(V54U_CATS, "中古車"); } catch (e) { }
  try { if (typeof V54HEAR_CATS !== "undefined") addAfter(V54HEAR_CATS, "中古車"); } catch (e) { }
  try { if (typeof V68IND_CHIPS !== "undefined") addAfter(V68IND_CHIPS, "中古車"); } catch (e) { }
  try { if (typeof V68IND_LIST !== "undefined") { const x = V68IND_LIST.find((y) => y && y.key === "industrial"); if (x) addAfter(x.cats, "中古車"); } } catch (e) { }
  try { const G = window.V92_GROUPS; const g = Array.isArray(G) ? G.find((x) => x && x.k === "auto") : null; if (g) addAfter(g.cats, "中古車"); } catch (e) { }
  try {
    if (typeof V54HEAR_CAT !== "undefined" && Array.isArray(V54HEAR_CAT) && !V54HEAR_CAT.some((x) => x && x[0] === V95P_CAT)) {
      const i = V54HEAR_CAT.findIndex((x) => x && x[0] === "中古車");
      V54HEAR_CAT.splice(i >= 0 ? i : 0, 0, [V95P_CAT, /自動車部品|自動車用品|カー用品|車用品|カーパーツ|自動車パーツ|auto\s*parts|car\s*parts|automotive\s*parts/i]); // 「車用のブレーキ」などの組み合わせは 21.92 の部品の判定（v92part）を自動車部品に読み替える
    }
  } catch (e) { v95pErr("hearcat", e); }
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) {
      const put = (ja, en, zh, es) => { [["en", en], ["zh", zh], ["es", es]].forEach(([l, v]) => { if (I18N.dict[l] && !(ja in I18N.dict[l])) I18N.dict[l][ja] = v; }); };
      put(V95P_CAT, "Auto parts", "汽车零部件", "Autopartes");
    }
  } catch (e) { }
})();
// 判定の関数を包む
if (typeof detectCat === "function") {
  const __dc95 = detectCat;
  detectCat = function (all) {
    const r = __dc95.apply(this, arguments);
    try { if (r === "car") { const s = String(all || ""); if (V95P_PART.test(s) && v95pUsedN(s) < 2) { V95P.lastDet = { at: Date.now() }; return "parts"; } } } catch (e) { v95pErr("detect", e); }
    return r;
  };
}
if (typeof catLabelOf === "function") {
  const __cl95 = catLabelOf;
  catLabelOf = function (v) {
    try {
      const s = String(v || "").trim();
      if (s) {
        if (s === V95P_CAT) return V95P_CAT;
        // 大分類の名前（自動車・建機）だけでは中古車と決めない（細かい種類はヒアリングで伺う）
        if (/^(自動車・建機|自動車建機|建機・自動車)$/.test(s.replace(/\s+/g, ""))) return "";
        if (!V95P_VEHNM.test(s) && !/自転車/.test(s) && (V95P_AUTOW.test(s) || (V95P_VEH.test(s) && V95P_PART.test(s)))) return V95P_CAT;
      }
    } catch (e) { v95pErr("label", e); }
    return __cl95.apply(this, arguments);
  };
}
if (typeof v54hearCatOf === "function") {
  const __hc95 = v54hearCatOf;
  v54hearCatOf = function (name, strict) {
    const r = __hc95.apply(this, arguments);
    try {
      const nm = String(name == null ? "" : name);
      if (r && r.v92part && !/自転車|bicycle/i.test(nm)) return Object.assign({}, r, { cat: V95P_CAT, v95: 1 });
      if (r && r.cat === "中古車" && v95pAutoPart(nm, "")) return Object.assign({}, r, { cat: V95P_CAT, v95: 1 });
      if (r && r.cat === "工業部品" && /自動車|車用|カー|auto|car\b/i.test(nm) && v95pAutoPart(nm, "")) return Object.assign({}, r, { cat: V95P_CAT, v95: 1 });
      if (!r && /自動車部品|自動車用品|カー用品|カーパーツ|自動車パーツ|auto\s*parts|car\s*parts/i.test(nm)) return { cat: V95P_CAT, kw: nm.slice(0, 20), end: nm.length, i: 0, v95: 1 };
    } catch (e) { v95pErr("hear", e); }
    return r;
  };
}
try {
  if (typeof window.v92catByHS === "function") {
    const __bh95 = window.v92catByHS;
    window.v92catByHS = function (hs, txt) {
      try { const d = String(hs == null ? "" : hs).replace(/\D/g, ""); const c4 = +d.slice(0, 4); if (d.length >= 4 && (c4 === 8708 || c4 === 6813 || c4 === 4011)) return V95P_CAT; } catch (e) { }
      return __bh95.apply(this, arguments);
    };
  }
} catch (e) { }
// 区分の名前に「自動車」を含むだけで車両（中古車）の HS 候補（8703 など）・関税の扱いにしない（v56tariff は cat の名前を /自動車/ で見る）
if (typeof v56tariffCarRule === "function") {
  const __cr95 = v56tariffCarRule;
  v56tariffCarRule = function (item, cat) { try { if (String(cat || "").trim() === V95P_CAT) return null; } catch (e) { } return __cr95.apply(this, arguments); };
}
if (typeof v56tariffIsCar === "function") {
  const __ic95 = v56tariffIsCar;
  v56tariffIsCar = function (d) { try { if (d && String(d.cat || "").trim() === V95P_CAT && d.catKey !== "car") return false; } catch (e) { } return __ic95.apply(this, arguments); };
}
["tenantFromTextGrids", "buildTenant"].forEach((nm) => {
  try {
    const f = window[nm];
    if (typeof f !== "function" || f._v95p) return;
    const g = function () {
      V95P.lastDet = null;
      const out = f.apply(this, arguments);
      const det = () => { const d = V95P.lastDet; V95P.lastDet = null; return !!d; };
      const fix = (t) => { try { if (t && typeof t === "object") { if (det()) t.v95det = 1; v95pCatNorm(t, nm === "tenantFromTextGrids" ? String(arguments[0] || "") : null); } } catch (e) { v95pErr(nm, e); } return t; };
      return (out && typeof out.then === "function") ? out.then(fix) : fix(out);
    };
    g._v95p = 1;
    window[nm] = g;
  } catch (e) { v95pErr("wrap " + nm, e); }
});
if (typeof llmXtract === "function") {
  const __lx95 = llmXtract;
  llmXtract = async function () {
    const x = await __lx95.apply(this, arguments);
    try {
      const fixOne = (p) => { if (!p || typeof p !== "object") return; const c = String(p.cat || ""), nm = [p.item, p.itemEn, p.name].filter(Boolean).join(" "); if (!(c === "中古車" || c === "工業部品" || !c)) return; if (c !== "中古車" && !V95P_VEH.test(nm) && !V95P_AUTOW.test(nm)) return; if (v95pAutoPart(nm, "")) p.cat = V95P_CAT; };
      fixOne(x);
      (x && Array.isArray(x._multi) ? x._multi : []).forEach(fixOne);
    } catch (e) { v95pErr("xtract", e); }
    return x;
  };
}

/* ══════════ No.484 0項目の取り込みは商品にしない ══════════ */
function v95pGotN(t) {
  try {
    const L = (typeof v54upldGot === "function") ? v54upldGot(t) : ((typeof NEED !== "undefined") ? NEED.filter((x) => { const v = t[x.k]; return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()); }).filter((x) => !(x.k === "hs" && t.hsGuess)) : []);
    return L.filter((x) => x && x.k !== "co" && x.k !== "coEn").length;
  } catch (e) { return 0; }
}
function v95pPendN(t) { try { const P = t && t._pend; return (P && Array.isArray(P.prods)) ? P.prods.filter((p) => p && (+p.ch > 0 || (p.x && String(p.x.item || "").trim()))).length : 0; } catch (e) { return 0; } }
function v95pEmpty(t) { return !!t && t.src === "upload" && !String(t.item || "").trim() && !String(t.itemEn || "").trim() && v95pGotN(t) === 0 && v95pPendN(t) === 0; }
function v95pEmptyHtml(t, info) {
  const E = v95pE, M = v95pM;
  const nm = String((info && info.name) || (t && t.file) || "");
  const why = [];
  (t.srcSkipped || []).slice(0, 5).forEach((s) => why.push(String(s)));
  const imgs = (t.srcDocs || []).filter((d) => d && /画像/.test(String(d.kind || ""))).map((d) => d.name);
  if (imgs.length) why.push(M(`画像 ${imgs.length}件（${imgs.slice(0, 3).join("・")}）：写真の中の文字を読むには、AIエンジンの接続が必要です`, `${imgs.length} image(s): reading text in photos needs the AI engine`, `图片 ${imgs.length} 件：读取图片中的文字需要连接 AI 引擎`, `${imgs.length} imagen(es): leer texto en fotos requiere el motor de IA`));
  if (t.unparsed && !why.length) why.push(M("この形式からは、表・項目が見つかりませんでした", "No tables or fields were found in this format", "未能从此格式中找到表格或项目", "No se encontraron tablas ni campos en este formato"));
  return `<div class="c v95p-empty" role="alert" data-noi18n="1">
    <b class="v95p-eh">${E(M(`「${nm}」からは、商品の情報を読み取れませんでした（0項目）`, `No product information could be read from “${nm}” (0 fields)`, `未能从“${nm}”读取任何商品信息（0 项）`, `No se pudo leer información del producto de «${nm}» (0 campos)`))}</b>
    <p class="v95p-ep">${E(M("商品は登録していません（商品の一覧・メンバー・分析・目標の数には入りません）。", "No product was created (it is not counted in the product list, members, analysis or goals).", "未登记商品（不计入商品列表、成员、分析、目标）。", "No se creó ningún producto (no cuenta en la lista, miembros, análisis ni metas)."))}</p>
    ${why.length ? `<ul class="v95p-ew">${why.map((w) => `<li>${E(w)}</li>`).join("")}</ul>` : ""}
    <p class="v95p-ep">${E(M("読み取れる資料：Excel・CSV・Word・PowerPoint・テキスト（Zip の中にあれば読みます）。PDF・画像の中身は、AIエンジンの接続が必要です。", "Readable: Excel, CSV, Word, PowerPoint, text (also inside a Zip). PDF and images need the AI engine.", "可读取：Excel、CSV、Word、PowerPoint、文本（Zip 内也可）。PDF 和图片需要 AI 引擎。", "Se leen: Excel, CSV, Word, PowerPoint y texto (también dentro de un Zip). PDF e imágenes requieren el motor de IA."))}</p>
    <div class="v95p-eb"><button type="button" class="btn" data-v95pempty="pick">${E(M("別の資料を選ぶ", "Choose other files", "选择其他资料", "Elegir otros archivos"))}</button><button type="button" class="btn g" data-v95pempty="go">${E(M("資料なしで、AIの質問に答えて登録する", "Register by answering the AI's questions (no file)", "不用资料，回答 AI 的问题来登记", "Registrar respondiendo a la IA (sin archivo)"))}</button></div>
  </div>`;
}
function v95pShowEmpty(orig, self, args) {
  const t = args[0], info = args[1] || {};
  const el = document.getElementById("prg");
  if (!el) return orig.apply(self, args);
  V95P.n.empty++;
  V95P.lastEmpty = { at: Date.now(), name: String(info.name || t.file || "") };
  el.hidden = false;
  el.innerHTML = v95pEmptyHtml(t, info);
  const pk = document.getElementById("pick"); if (pk) pk.hidden = false;
  try { setTimeout(() => { try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) { el.scrollIntoView(); } }, 60); } catch (e) { }
  el.querySelectorAll("[data-v95pempty]").forEach((b) => b.addEventListener("click", () => {
    if (b.getAttribute("data-v95pempty") === "pick") { const f = document.getElementById("fin"); el.hidden = true; el.innerHTML = ""; if (f) f.click(); return; }
    t.v95force = 1;
    el.innerHTML = "";
    try { orig.apply(self, args); } catch (e) { v95pErr("force", e); }
  }));
  try { if (typeof logU === "function") logU("upload", "0項目のため商品にしなかった:" + String(info.name || "")); } catch (e) { }
  return undefined;
}

/* ══════════ No.479・480 取り込んだファイルの本体をドキュメント・商品写真へ ══════════ */
function v95pStash(files, how) { try { files = Array.from(files || []).filter((f) => f && f.name); if (files.length) V95P.stash = { files, at: Date.now(), how }; } catch (e) { } }
document.addEventListener("change", (e) => { try { const t = e.target; if (t && t.id === "fin" && t.files && t.files.length) v95pStash(t.files, "fin"); } catch (x) { } }, true);
document.addEventListener("drop", (e) => { try { const z = e.target && e.target.closest ? e.target.closest("#drop") : null; if (z && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) v95pStash(e.dataTransfer.files, "drop"); } catch (x) { } }, true);
if (typeof v54upldTakeMany === "function") {
  const __tm95 = v54upldTakeMany;
  v54upldTakeMany = function (files) { v95pStash(files, "many"); return __tm95.apply(this, arguments); };
}
function v95pTakeStash(t, info) {
  const S = V95P.stash;
  if (!S || Date.now() - S.at > 180000) return null;
  const nm = String((info && info.name) || "") + " " + String((t && t.file) || "");
  if (!S.files.some((f) => nm.indexOf(f.name) >= 0)) return null;
  V95P.stash = null;
  return S.files;
}
if (typeof runParseReal === "function") {
  const __rp95 = runParseReal;
  runParseReal = function (t, info) {
    try {
      if (t && typeof t === "object") {
        if (!V95P.tf.has(t)) { const fs = v95pTakeStash(t, info); if (fs) V95P.tf.set(t, fs); }
        try { v95pCatNorm(t, null); } catch (e) { }
        if (!t.v95force && v95pEmpty(t)) return v95pShowEmpty(__rp95, this, arguments);
      }
    } catch (e) { v95pErr("rp", e); }
    return __rp95.apply(this, arguments);
  };
}
const V95P_IMG = /\.(png|jpe?g|webp)$/i;
function v95pReadUrl(f) { return new Promise((ok, ng) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => ng(r.error || new Error("read")); r.readAsDataURL(f); }); }
function v95pNorm(src) { return new Promise((ok, ng) => { if (typeof imgNorm !== "function") { ng(new Error("imgNorm")); return; } imgNorm(src, ok, ng); }); }
async function v95pPhotos(t, files) {
  const imgs = files.filter((f) => V95P_IMG.test(f.name) && f.size < 15e6).slice(0, 3);
  if (!imgs.length) return 0;
  t.assets = t.assets || { logo: null, ph: [] };
  const A = t.assets; A.ph = A.ph || [];
  const N = (typeof DK_NPH !== "undefined" && +DK_NPH) || 10;
  let n = 0;
  for (const f of imgs) {
    try {
      const a = await v95pNorm(await v95pReadUrl(f));
      if (!a || !a.b64) continue;
      if (A.ph.some((o) => o && o.cap === f.name && o.src === "import")) continue;
      let dup = false; try { dup = typeof dkIsDup === "function" ? await dkIsDup(a.b64, a.mime, -1, A) : false; } catch (e) { dup = false; }
      if (dup) continue;
      let slot = -1; for (let i = 0; i < N; i++) { const o = A.ph[i]; if (!o || !o.b64) { slot = i; break; } }
      if (slot < 0) break;
      A.ph[slot] = { b64: a.b64, mime: a.mime || "image/jpeg", w: a.w, h: a.h, src: "import", cap: f.name };
      n++;
    } catch (e) { v95pErr("photo", e); }
  }
  V95P.n.photo += n;
  return n;
}
function v95pScopeFor(f) {
  try { const ty = typeof d30Guess === "function" ? d30Guess(f.name, f.type) : ""; if (ty === "証明書・認証" || ty === "名刺") return "in"; } catch (e) { }
  return V95P.SCOPE_DEF;
}
async function v95pDocs(t, files) {
  if (typeof d30AddFile !== "function") return 0;
  let n = 0;
  const sig = (typeof v30TenSig === "function") ? v30TenSig(t) : undefined;
  const max = (typeof D30_MAXB !== "undefined" && +D30_MAXB) || 20 * 1024 * 1024;
  for (const f of files.slice(0, 20)) {
    if (!f || f.size > max) continue;
    try {
      const hasTxt = (t.sources || []).some((s) => s && s.name && (s.name === f.name || s.name.indexOf(f.name + "/") === 0));
      const d = await d30AddFile(f, { src: "商品資料の取り込み", item: String(t.item || ""), pid: sig, scope: v95pScopeFor(f), quietScope: 1, noCertAsk: 1,
        refNm: hasTxt ? v95pM("商品登録で取り込んだ資料（読み取った文字は「取り込んだ情報」にあります）", "Imported at product registration (the text read is in “Imported sources”)", "商品登记时导入的资料（读取的文字在“已导入的信息”中）", "Importado al registrar el producto (el texto leído está en «Fuentes importadas»)")
          : v95pM("商品登録で取り込んだ資料", "Imported at product registration", "商品登记时导入的资料", "Importado al registrar el producto") });
      if (d && d.id) {
        n++;
        (t.sources || []).forEach((s) => { if (s && s.name && !s.v95doc && (s.name === f.name || s.name.indexOf(f.name + "/") === 0)) s.v95doc = d.id; });
      }
    } catch (e) { v95pErr("doc", e); }
  }
  V95P.n.doc += n;
  return n;
}
async function v95pAttach(t, files) {
  if (!t || !files || !files.length) return;
  let ph = 0, dc = 0;
  try { ph = await v95pPhotos(t, files); } catch (e) { v95pErr("photos", e); }
  try { dc = await v95pDocs(t, files); } catch (e) { v95pErr("docs", e); }
  try { if (typeof saveTen === "function") saveTen(); } catch (e) { }
  V95P.last = { at: Date.now(), ph, dc, item: t.item || "" };
  if (ph || dc) v95pToast(v95pM(`取り込んだファイル ${dc}件をドキュメントに入れました${ph ? `・写真 ${ph}枚を商品の画像にしました` : ""}`, `Added ${dc} imported file(s) to Documents${ph ? `; ${ph} photo(s) set as the product image` : ""}`, `已将 ${dc} 个导入文件放入文档${ph ? `，${ph} 张照片设为商品图片` : ""}`, `Se añadieron ${dc} archivo(s) a Documentos${ph ? `; ${ph} foto(s) como imagen del producto` : ""}`));
}
if (typeof adoptReal === "function") {
  const __ar95 = adoptReal;
  adoptReal = function (t) {
    const r = __ar95.apply(this, arguments);
    try { const fs = t && V95P.tf.get(t); if (fs) { V95P.tf.delete(t); setTimeout(() => { v95pAttach(t, fs).catch((e) => v95pErr("attach", e)); }, 50); } } catch (e) { v95pErr("adopt", e); }
    return r;
  };
}

/* ══════════ No.479・500 ドキュメント一覧の名前だけの行（取り込み）／公開範囲 ══════════ */
// 名前だけの行（srcs）の元の商品と資料。同じ会社名・商品名の商品が2つ以上あると行の印（lg:srcs:会社|商品:番号）が同じになるため、
// 番号の資料の名前が行の名前と同じ商品を選ぶ（表示中の商品を先に）
function v95pLgPick(r) {
  try {
    if (!r || typeof v30TenSig !== "function") return null;
    const T = ((typeof TENS !== "undefined" && TENS) || []).filter((x) => x && v30TenSig(x) === r.lgt);
    const cur = (typeof TEN !== "undefined") ? TEN : null;
    if (cur && T.indexOf(cur) > 0) { T.splice(T.indexOf(cur), 1); T.unshift(cur); }
    for (const t of T) { const s = (t.sources || [])[r.lgi]; if (s && s.name === r.n) return { t, s }; }
    return null;
  } catch (e) { return null; }
}
function v95pLgSrc(id) {
  try {
    const r = typeof v56docsLgRow === "function" ? v56docsLgRow(id) : null;
    if (!r || r.lgk !== "srcs") return null;
    const x = v95pLgPick(r);
    return x ? { r, t: x.t, s: x.s, i: r.lgi } : null;
  } catch (e) { return null; }
}
if (typeof d30Legacy === "function") {
  const __lg95 = d30Legacy;
  d30Legacy = function () {
    const out = __lg95.apply(this, arguments);
    try {
      if (!Array.isArray(out)) return out;
      const me = typeof d30Me === "function" ? d30Me() : "";
      return out.filter((r) => {
        if (!r || r.lgk !== "srcs") return true;
        const x = v95pLgPick(r);
        const s = x && x.s;
        if (!s) return true;
        if (s.v95doc) return false; // 本体をドキュメントに入れた資料（名前だけの行は出さない）
        if (s.v95sc) { r.scope = s.v95sc; r.v95sc = 1; }
        if (s.v95sc === "me" && s.v95scBy && s.v95scBy !== me) return false;
        return true;
      });
    } catch (e) { v95pErr("legacy", e); return out; }
  };
}
function v95pLgScope(id, sc) {
  const x = v95pLgSrc(id);
  if (!x || !(sc in { all: 1, in: 1, me: 1 })) return false;
  x.s.v95sc = sc;
  if (sc === "me") x.s.v95scBy = (typeof d30Me === "function" ? d30Me() : "") || x.s.v95scBy || "";
  try { if (typeof saveTen === "function") saveTen(); } catch (e) { }
  try { const nm = (typeof D30_SCOPE !== "undefined" && D30_SCOPE[sc]) ? D30_SCOPE[sc][0] : sc; v95pToast(v95pM("公開範囲を「" + nm + "」にしました", "Visibility set to " + nm, "公开范围已设为" + nm, "Visibilidad: " + nm)); } catch (e) { }
  try { if (typeof d30Rerender === "function") d30Rerender(); } catch (e) { }
  return true;
}
function v95pLgDel(id) {
  const x = v95pLgSrc(id);
  if (!x) return false;
  const nm = String(x.s.name || "");
  const ok = window.confirm(v95pM(`「${nm}」を、取り込んだ情報から削除しますか？\n\n・ドキュメントの一覧と、AI商社マンの参照から外れます\n・ゴミ箱に入ります（30日以内なら「ゴミ箱」から元に戻せます）\n・登録済みの商品情報は消えません`, `Delete “${nm}” from imported sources?\n\n- It leaves the document list and the AI's references\n- It goes to the Trash (restorable within 30 days)\n- Registered product information is not deleted`, `要从已导入的信息中删除“${nm}”吗？\n\n・将从文档列表和 AI 的参考中移除\n・移入回收站（30 天内可恢复）\n・已登记的商品信息不会删除`, `¿Eliminar «${nm}» de las fuentes importadas?\n\n- Sale de la lista de documentos y de las referencias de la IA\n- Va a la Papelera (se puede restaurar en 30 días)\n- La información del producto no se borra`));
  if (!ok) return false;
  let js = null; try { js = JSON.parse(JSON.stringify(x.s)); } catch (e) { js = null; }
  const sig = typeof v30TenSig === "function" ? v30TenSig(x.t) : "";
  const i = x.t.sources.indexOf(x.s);
  if (i < 0) return false;
  x.t.sources.splice(i, 1);
  let tid = null;
  try { if (js && typeof v33TrashPut === "function") tid = v33TrashPut("v95src", x.s.id || nm, v95pM("取り込んだ情報：", "Imported source: ", "已导入的信息：", "Fuente importada: ") + nm, { x: js, i, sig, uid: x.t.uid || "" }); } catch (e) { v95pErr("trash", e); }
  try { if (typeof saveTen === "function") saveTen(); } catch (e) { }
  try { if (tid && typeof v33Undo === "function") v33Undo(v95pM(`「${nm}」をゴミ箱に移しました`, `Moved “${nm}” to Trash`, `已将“${nm}”移入回收站`, `«${nm}» se movió a la Papelera`), () => { try { v33TrashRestore(tid); } catch (e) { } }, 10000); } catch (e) { }
  try { if (typeof d30Rerender === "function") d30Rerender(); } catch (e) { }
  return true;
}
try {
  if (typeof V33TR !== "undefined" && V33TR && V33TR.restore) {
    V33TR.restore.v95src = function (e) {
      const d = e && e.data; const x = d && d.x;
      if (!x) return false;
      const T = (typeof TENS !== "undefined" && TENS) || [];
      // 元の商品：控えた uid → 表示中の商品（会社名・商品名が同じ）→ 会社名・商品名が同じ商品 → 表示中の商品
      const cur = (typeof TEN !== "undefined") ? TEN : null;
      const sigOf = (y) => (typeof v30TenSig === "function" ? v30TenSig(y) : "");
      const t = (d.uid && T.find((y) => y && y.uid === d.uid)) || (cur && sigOf(cur) === d.sig ? cur : null) || T.find((y) => y && sigOf(y) === d.sig) || cur;
      if (!t) return false;
      t.sources = t.sources || [];
      if (t.sources.some((y) => y && ((x.id && y.id === x.id) || (!x.id && y.name === x.name)))) return true;
      t.sources.splice(Math.max(0, Math.min(t.sources.length, +d.i || 0)), 0, x);
      try { if (typeof saveTen === "function") saveTen(); } catch (z) { }
      try { if (typeof render === "function") render(); } catch (z) { }
      return true;
    };
    if (V33TR.label && !V33TR.label.v95src) V33TR.label.v95src = "取り込んだ情報";
  }
  if (typeof V33TR_KIND !== "undefined" && V33TR_KIND && !V33TR_KIND.v95src) V33TR_KIND.v95src = "取り込んだ情報";
} catch (e) { v95pErr("tr", e); }
// アップロードの前に選んだ公開範囲で入れる（ドキュメントの画面のアップロード・ドロップ。見せ方は rd_v95prod.js）
async function v95pDocsUpload(files, scope) {
  files = Array.from(files || []).filter((f) => f && f.name);
  if (!files.length || typeof d30AddFile !== "function") return 0;
  const sc = scope in { all: 1, in: 1, me: 1 } ? scope : V95P.SCOPE_DEF;
  let n = 0;
  for (const f of files) { try { const d = await d30AddFile(f, { src: "ドキュメント", scope: sc, quietScope: 1 }); if (d && d.id) n++; } catch (e) { v95pErr("up", e); } }
  try { const nm = (typeof D30_SCOPE !== "undefined" && D30_SCOPE[sc]) ? D30_SCOPE[sc][0] : sc; v95pToast(v95pM(`${n}件を「${nm}」でアップロードしました（公開範囲は一覧で変えられます${sc === "all" ? "" : "。証明書・名刺は「社内のみ」"}）`, `Uploaded ${n} file(s) as ${nm} (you can change it in the list)`, `已按“${nm}”上传 ${n} 个文件（可在列表中更改）`, `Se subieron ${n} archivo(s) como ${nm} (puede cambiarlo en la lista)`)); } catch (e) { }
  return n;
}

/* ══════════ No.478 書類をつくるの「産地」 ══════════ */
const V95P_JP = /^(日本|日本国|国産|日本製|日本産|japan|made in japan)$/i;
if (typeof v85docFacts === "function") {
  const __ff95 = v85docFacts;
  v85docFacts = function () {
    const F = __ff95.apply(this, arguments);
    try {
      const d = (typeof v85docD === "function" ? v85docD() : null) || {}, t = typeof v85docTen === "function" ? v85docTen() : null;
      const org = String((t && t.origin) || d.origin || "").trim();
      const cs = typeof v85docCase === "function" ? v85docCase() : { inp: {} };
      const I = cs.inp || {};
      F.v95org = org;
      if (I.pref != null && I.pref !== "") F.v95pf = "input";
      else {
        const po = typeof v85docPref === "function" ? v85docPref(org) : "";
        if (po) { if (F.pref !== po) V95P.prefFix = { from: F.pref, to: po, at: Date.now() }; F.pref = po; F.prefFrom = "登録の産地"; F.v95pf = "origin"; }
        else if (F.pref) F.v95pf = "city";
        else F.v95pf = "";
      }
    } catch (e) { v95pErr("facts", e); }
    return F;
  };
}
function v95pPrefLine(F) {
  const org = String(F.v95org || "").trim(), pf = String(F.pref || "");
  if (F.v95pf === "input") return (org && !V95P_JP.test(org) && org.indexOf(pf) < 0 ? org + "／" : "") + pf + "（あなたが選んだ都道府県）";
  if (F.v95pf === "origin") return org;
  if (F.v95pf === "city") return (org ? org + "（" : "") + pf + "＝会社の所在地から推定・要確認" + (org ? "）" : "");
  return org ? org + "（都道府県は未登録）" : "未登録";
}
if (typeof v85docPremHtml === "function") {
  const __ph95 = v85docPremHtml;
  v85docPremHtml = function (F) {
    let h = __ph95.apply(this, arguments);
    try {
      if (v95pLang() !== "ja" || typeof h !== "string" || !F) return h;
      const E = v95pE, org = String(F.v95org || "").trim();
      // 欄の名前：産地 → 産地（都道府県）
      h = h.replace('<span>産地</span><select class="sel" data-act-change="doc85.pref">', '<span>産地（都道府県）</span><select class="sel" data-act-change="doc85.pref" data-v95pref="1">');
      // 空の選択肢：登録の産地があれば「日本（都道府県は未登録）」
      if (org) h = h.replace(/(data-act-change="doc85\.pref" data-v95pref="1">)<option value=""( selected)?>（未登録）<\/option>/, (m, a, s) => `${a}<option value=""${s || ""}>${E(org)}（都道府県は未登録）</option>`);
      // 下の行：産地：未登録 → 商品情報と同じ登録の産地
      h = h.replace(/(　産地：)([^<]*)(<\/p>)/, (m, a, b, c) => `${a}<span data-v95org="1">${E(v95pPrefLine(F))}</span>${c}`);
    } catch (e) { v95pErr("prem", e); }
    return h;
  };
}
window.V95P = V95P;
Object.assign(V95P, { autoPart: v95pAutoPart, carSuspect: v95pCarSuspect, carFix: v95pCarFix, carKeep: v95pCarKeep, empty: v95pEmpty, lgSrc: v95pLgSrc, lgScope: v95pLgScope, lgDel: v95pLgDel, docsUpload: v95pDocsUpload, scopeFor: v95pScopeFor, M: v95pM, E: v95pE, CAT: V95P_CAT });
