/* ═══ v21.95 misc（2026-11-17 改修一覧の週次レビュー・第6回 UAT）機能の中身の層
   担当の行：No.475 変更履歴／No.492 目標と道筋の1社あたりの推定／No.497 AI自動回答率（数え方）／No.498 レーン別集計の国名と運賃の点検（数え方）
             No.499 会社の切り替えと AI商社マンからの提案／No.504 取引に進んだ割合が高い国の説明／No.505 見本の会社を上限に数えない
   今のアプリの関数は控えてから包むだけ（中身は書き換えない）。見せ方（刷新版の部品）は rd_v95misc.js。 */
var V95MISC = { err: [] };
function v95miscErr(k, e) { try { V95MISC.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95MISC.err.length > 30) V95MISC.err.shift(); } catch (x) { } }
function v95miscLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v95miscM(ja, en) { return v95miscLang() === "ja" ? ja : (en || ja); }
function v95miscE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v95miscYen(n) { return "¥" + Math.round(+n || 0).toLocaleString("ja-JP"); }

/* ══════════════════════════════════════════════════════════════════════
   No.475 変更履歴（新機能と改善）に 21.93・21.94・21.95 を載せる
   ★ 21.95 の中身は、まとめ役がこの配列（V2195_NEWS_ITEMS）に差し込む。いまは misc で直した行の題目で仮に埋めている。
   書き方：利用者向けのやさしい言葉・社内の人名や改修一覧の番号は書かない。
   ══════════════════════════════════════════════════════════════════════ */
var V2195_NEWS_TITLE = "使ってみた声からの直し（商品の登録・規制・営業資料・AI の利用量・画面の幅 など）";
var V2195_NEWS_ITEMS = [
  "商品の登録：取り込んだ仕様書の PDF や商品写真も「ドキュメント」に入り、消したり公開範囲を変えたりできます。取り込んだ写真は商品の画像にも使います",
  "商品の登録：中身を1つも読み取れなかったファイル（ZIP など）からは商品を作らず、理由と「別の資料を選ぶ／AI の質問に答えて登録する」を出します",
  "商品の登録：ブレーキパッドなどの部品を中古車と取り違えないよう、カテゴリーに「自動車部品」を足しました。前に中古車と判定された部品には「自動車部品に直す」を出します",
  "ドキュメント：アップロードのときに公開範囲を選べるようにし、取り込んだ資料の行でも一覧から変えられます",
  "商品情報：「足りないのは n 項目」の数と並ぶ項目をそろえました。補完パネルの入力は、パネルの中で価格表などを開いても消えません",
  "商品情報：認証・規格に「なし」と答えたら「なし」と出します。手で入れた項目を「資料から取り込んだ」と書かないようにしました。強みの件数の基準を商品情報と営業資料でそろえました",
  "英文社名：未入力でも、同じ会社のほかの商品の登録や会社名から「案」を出し、押すと入ります（確かめるまで書類には入れません）",
  "規制を調べる：自社の商品の HS が見本の品目と違うときは、別の品目の関税率を出さず「要確認」と理由を出します",
  "規制を調べる：航空で出す商品は、運賃や SDS などの条件を航空の前提で出し、規制と書類の画面で同じ答えにしました。「表で確かめる」はどの商品でも出ます",
  "規制を調べる：シンガポール向けペットフードの管轄（AVS）の説明の食い違いを直しました。ひな形が無い商材でも「調べ方と次の一歩」を出します",
  "外国語 営業資料：「作成が終わりました」は保存が終わってから出します。訳せなかった項目は「訳だけやり直す」で直せます。建値の行に登録した港を出します",
  "外国語 営業資料：完成品の化粧品を原料の型で作らないようにしました。商材に合った例文を出し、文字入りで使えない写真には直し方を案内します",
  "AI の利用量：上限に達したらカウンタも「上限」と出し、今月の質問と今日の回数の数え方の違いを説明します",
  "AI商社マンに相談：「50枚入り」のような商品名の数を注文の数と読み違えないようにし、正しい金額に「価格表と合いません」と出さないようにしました",
  "ログイン：アクセスコードや名前が違うときの知らせを「アクセスコードかご担当者名が違います」にそろえ、管理者の確認コードの期限を画面に出します",
  "目標と道筋：1社あたりの取引額の推定の数え方をどの商品でもそろえ、「取引に進んだ割合が高い国」が販売先国の選定とは別の参考であることを書きました",
  "物流会社：AI自動回答率を内訳と同じ数え方にし、レーン別の集計の国名をそろえ、外れた運賃に「要確認」を出します",
  "会社を切り替えたら、案件一覧のタブや件数も表示中の会社で数えます。見本の会社は登録できる会社の上限（10社）に数えません",
  "画面の幅が 900px 前後（ノートPC やタブレットの横向き）のときに、ページが横にすべるのを直しました",
  "変更履歴：21.93・21.94・21.95 で変わったことを載せました"
];
var V95MISC_NEWS = [
  ["2026-11", "v21.93", "営業資料の照合・国別詳細レポートの直し", [
    "外国語 営業資料：「1897 year」のような書き方を、年数ではなく設立の年と読みます。照合で外した文言と、表紙・会社情報の設立年が食い違って見えるときは、最終チェックで理由を説明します",
    "国別詳細レポート：同じ税額などの金額の桁がそろうよう、通貨の付いた金額は小数2桁にそろえます（画面・PowerPoint とも）",
    "国別詳細レポート：参入ロードマップの見出しに「進め方：いつ・何をするか」を添えました"]],
  ["2026-11", "v21.94", "読み込みの速さ・AI の Web検索・使い勝手の直し・貿易ジャーニーの現在地", [
    "読み込みを速く：操作できるまでの時間を短くし、読み込みの途中で画面がずれるのを減らしました。仕上がるまでは「読み込み中…」と出します",
    "AI の Web検索：規制の詳しい調べなど Web検索が要る依頼で「Web検索は利用できない」と出ていたのを直しました。検索に対応した AI に回し、結果の下に「Web検索あり・出典 N件」か、使えない理由（AI 未接続・管理画面で許可していない など）を出します",
    "8つの商材カテゴリーで、いろいろな立場の使い手が試した結果の直し：受注と金額・見積の数え方、案件の「次の行動」（見積提示・受注のあと）、書類、英語・中国語・スペイン語の画面の残り など",
    "AI商社マンの成長レベルの円グラフ：輪の大きさ・数字のはみ出し・一人前（90%）の印の見え方を直しました",
    "新しいデザインの画面：荷主のどの画面でも一番上に「貿易ジャーニーの現在地」（はじめてガイドと同じ輸出の7つのステップ）を出します。商品ごとの進み具合（%）・いまここ・抜けているステップが分かり、押すと足りない所へ移ります"]],
  ["2026-11", "v21.95", V2195_NEWS_TITLE, V2195_NEWS_ITEMS]
];
function v95miscVerN(v) { const m = String(v || "").match(/(\d+)\.(\d+)(?:\.(\d+))?/); return m ? (+m[1]) * 1e6 + (+m[2]) * 1e3 + (+(m[3] || 0)) : 0; }
function v95miscNews() {
  try {
    if (typeof S30_NEWS === "undefined" || !Array.isArray(S30_NEWS)) return;
    V95MISC_NEWS.forEach((e) => {
      let x = S30_NEWS.find((r) => r && r[1] === e[1]);
      if (!x) { x = [e[0], e[1], e[2], []]; S30_NEWS.unshift(x); }
      if (!Array.isArray(x[3])) x[3] = [];
      e[3].forEach((s) => { if (x[3].indexOf(s) < 0) x[3].push(s); });
    });
    // 新しい順にそろえる（版の番号が大きいほど上。同じ番号どうしは今の並びのまま）
    const idx = new Map(S30_NEWS.map((x, i) => [x, i]));
    S30_NEWS.sort((a, b) => (v95miscVerN(b && b[1]) - v95miscVerN(a && a[1])) || (idx.get(a) - idx.get(b)));
  } catch (e) { v95miscErr("news", e); }
}
v95miscNews();
/* 「新機能と改善」は前の版（21.90）からいちばん上の1件だけを見せ、ほかはたたむ → 21.93 より新しい版はたたまずに見せる */
function v95miscHelpNews() {
  try {
    const pn = document.getElementById("pn"); if (!pn) return;
    const det = pn.querySelector("details.v90news"); if (!det) return;
    const old = det.querySelector("details.v90newsold"); if (!old) return;
    const keep = v95miscVerN("v21.93");
    const items = [...old.children].filter((x) => x.tagName === "DIV");
    let moved = 0;
    items.forEach((x) => { const t = (x.querySelector(".nn") || {}).textContent || ""; const m = t.match(/v(\d+\.\d+(?:\.\d+)?)/); if (m && v95miscVerN(m[1]) >= keep) { old.before(x); moved++; } });
    if (moved || !det.dataset.v95) {
      det.dataset.v95 = "1";
      const n = [...old.children].filter((x) => x.tagName === "DIV").length;
      const sm = old.querySelector(":scope > summary");
      if (sm) sm.textContent = v95miscM(`それより前の版（${n}件）を開く`, `Earlier versions (${n})`);
      if (!n) old.hidden = true;
    }
  } catch (e) { v95miscErr("help", e); }
}
if (typeof ux17Help === "function") {
  const __hp95 = ux17Help;
  ux17Help = function () { const r = __hp95.apply(this, arguments); try { v95miscHelpNews(); setTimeout(v95miscHelpNews, 0); setTimeout(v95miscHelpNews, 80); } catch (e) { v95miscErr("help0", e); } return r; };
}
/* ヘルプのボタンは読み込みのときに関数をつかんでいるので（上の包みを通らない）、ヘルプの中身ができたのを見張って直す */
(function () {
  let tm = 0;
  const kick = () => { clearTimeout(tm); tm = setTimeout(() => { const d = document.querySelector("#pn details.v90news"); if (d && !d.dataset.v95) v95miscHelpNews(); }, 30); };
  try { document.addEventListener("click", (e) => { if (e.target && e.target.closest && e.target.closest("#helpb")) { kick(); setTimeout(kick, 300); } }, true); } catch (e) { }
  try {
    const watch = () => { const pn = document.getElementById("pn"); if (!pn) return false; new MutationObserver(() => { const d = pn.querySelector("details.v90news"); if (d && !d.dataset.v95) kick(); }).observe(pn, { childList: true, subtree: true }); return true; };
    if (!watch()) document.addEventListener("DOMContentLoaded", watch);
  } catch (e) { v95miscErr("helpmo", e); }
})();

/* ══════════════════════════════════════════════════════════════════════
   No.492 1社あたりの年間取引額の推定：価格帯の選び方をそろえる
   前：v88PerBuyer は「価格表の1行目の単価 × MOQ × 年4回」、21.92 の包み（v92goal）は「上の帯の入口 × 上の帯の単価 × 年4回」を
       作り、大きい方を使っていた。MOQ が上の帯の入口と同じ商品（木製パズル：〜99セット $12.00／100セット〜 $10.50・MOQ 100）は
       「下の帯の単価 $12.00 × MOQ」の方が大きく、そちらが使われた（ほかの商品は上の帯の入口）。MOQ の数量に下の帯の単価を当てるのも誤り。
   直し：数量帯が2つ以上読めるときは、どの商品も「数量＝上の帯の入口（MOQ の方が多ければ MOQ）× その数量が入る帯の単価 × 年4回」。
         MOQ だけの注文の行も、MOQ が入る帯の単価で出す。お客様の入力・数量帯が読めない商品は今まで通り。
   ══════════════════════════════════════════════════════════════════════ */
function v95miscBand(T, q) { let b = null; T.forEach((t) => { if (t.lo <= q && (t.hi == null || q <= t.hi)) b = t; }); return b || T[T.length - 1]; }
function v95miscPer(p) {
  if (!p || p.src === "input" || typeof v92goalTiers !== "function") return p;
  const dd = (typeof D !== "undefined" && D) || {};
  const T = v92goalTiers(dd.priceRows);
  if (!Array.isArray(T) || T.length < 2) return p;
  const top = T[T.length - 1];
  const entry = top.lo > 1 ? top.lo : null;
  if (!entry || !(top.u > 0)) return p;
  const mq0 = String(dd.moq || "").replace(/,/g, "").match(/(\d{1,7})/);
  const moq = mq0 ? +mq0[1] : 0;
  const qty = Math.max(entry, moq || 0);
  const bq = v95miscBand(T, qty);
  const cl = (v) => Math.max(1e5, Math.min(1e9, Math.round(v)));
  const v = cl(bq.u * qty * 4);
  const out = { v, src: "est", unit: Math.round(bq.u), moq: qty, v92tier: { v, qty, unit: Math.round(bq.u), un: top.un || bq.un || "" }, v95rule: "top", v95was: { v: p.v, unit: p.unit, moq: p.moq } };
  if (moq && moq !== qty) { const bm = v95miscBand(T, moq); out.v92moq = { v: cl(bm.u * moq * 4), unit: Math.round(bm.u), moq }; }
  return out;
}
if (typeof v88PerBuyer === "function") {
  const __pb95 = v88PerBuyer;
  v88PerBuyer = function (G) { const p = __pb95.apply(this, arguments); try { return v95miscPer(p) || p; } catch (e) { v95miscErr("per", e); return p; } };
}

/* ══════════════════════════════════════════════════════════════════════
   No.497 物流会社のホームの「AI自動回答率」：表示と内訳を同じ数え方に
   前：率＝AI が金額を出した依頼 ÷ 受信（期限切れ・仕出港違いのレートで答えたものも含む）。内訳は「有効 0件／要確認 30件」で食い違った。
   直し：率＝そのまま荷主に出せる回答（有効なレート・依頼の仕出港どおり＝v90fAutoSplit の clean）÷ 受信。見せ方は rd_v95misc.js。
   ══════════════════════════════════════════════════════════════════════ */
function v95miscAutoRate() {
  const out = { recv: 0, auto: 0, clean: 0, warn: 0, rate: null, rateAll: null };
  try {
    out.recv = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).filter(Boolean).length;
    const A = (typeof v90fAutoSplit === "function") ? v90fAutoSplit() : null;
    if (A) { out.auto = A.auto; out.clean = A.clean; out.warn = A.warn; }
    if (out.recv) { out.rate = Math.round((out.clean / out.recv) * 100); out.rateAll = Math.round((out.auto / out.recv) * 100); }
  } catch (e) { v95miscErr("auto", e); }
  return out;
}
window.v95miscAutoRate = v95miscAutoRate;

/* ══════════════════════════════════════════════════════════════════════
   No.498 レーン別集計：国名の表記ゆれをそろえる・運賃の点検（データは直さず、画面で「要確認」＝21.90 の決めと同じ方向）
   ══════════════════════════════════════════════════════════════════════ */
function v95miscCtyStd(s) {
  const raw = String(s == null ? "" : s).trim();
  if (!raw) return { std: "", raw, detail: "" };
  const nz = (x) => { try { return typeof ctyNorm === "function" ? ctyNorm(x) : String(x).replace(/[（(].*?[)）]/g, ""); } catch (e) { return x; } };
  let std = nz(raw), detail = "";
  const pm = raw.match(/[（(]([^)）]*)[)）]/); if (pm) detail = pm[1];
  if (/[、,，・\/]/.test(raw)) { const parts = raw.split(/[、,，・\/]/).map((x) => x.trim()).filter(Boolean); const head = nz(parts[0]); if (head && head !== parts[0] || /^(アメリカ|韓国|中国|台湾|香港|イギリス|UAE|タイ|ベトナム|シンガポール|フランス|ドイツ|イタリア|オーストラリア|カナダ|マレーシア|インドネシア|フィリピン|インド)$/.test(head)) { std = head; detail = parts.slice(1).join("・"); } }
  return { std: std || raw, raw, detail, changed: (std || raw) !== raw };
}
window.v95miscCtyStd = v95miscCtyStd;
function v95miscMed(a) { const s = a.slice().sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; }
function v95miscLaneFlags() {
  const out = {};
  try {
    if (typeof FWDB === "undefined" || !FWDB || typeof fwdRateValid !== "function") return out;
    const jpy = (r) => (typeof fwdRateJpy === "function" ? fwdRateJpy(r) : (+r.price || 0));
    const M = (s) => String(s || "").toUpperCase();
    const V = (FWDB.rates || []).filter((r) => r && fwdRateValid(r) && jpy(r) > 0);
    const grp = {};
    V.forEach((r) => { const g = M(r.mode) + "|" + String(r.unit || ""); (grp[g] = grp[g] || []).push(jpy(r)); });
    const med = {}; Object.keys(grp).forEach((g) => { if (grp[g].length >= 4) med[g] = v95miscMed(grp[g]); });
    // 同じ額が多くの国に並ぶ（宅配便・小包など国ごとに出す運賃）
    const same = {};
    V.forEach((r) => { const g = M(r.mode) + "|" + String(r.unit || "") + "|" + jpy(r); const c = v95miscCtyStd(r.pod).std; (same[g] = same[g] || new Set()).add(c); });
    V.forEach((r) => {
      const k = r.pod + "|" + M(r.mode); const g = M(r.mode) + "|" + String(r.unit || ""); const p = jpy(r);
      const f = out[k] = out[k] || { k, pod: r.pod, mode: M(r.mode), unit: r.unit || "", flags: [] };
      const m = med[g];
      if (m && (p >= m * 5 || p <= m / 5)) {
        const x = p / m;
        if (!f.flags.some((y) => y.t === "out")) f.flags.push({ t: "out", p, med: m, x: x >= 1 ? Math.round(x) : +(x).toFixed(2), n: grp[g].length });
      }
      const sg = same[g + "|" + p];
      if (sg && sg.size >= 3 && !f.flags.some((y) => y.t === "same")) f.flags.push({ t: "same", p, cs: [...sg].slice(0, 8), n: sg.size });
    });
    Object.keys(out).forEach((k) => { if (!out[k].flags.length) delete out[k]; });
  } catch (e) { v95miscErr("lane", e); }
  return out;
}
window.v95miscLaneFlags = v95miscLaneFlags;

/* ══════════════════════════════════════════════════════════════════════
   No.499（の AI 提案の分）会社を切り替えても AI商社マンからの提案が前の会社の商材の数字のまま
   前：提案（v88MakeProp）は作ったときの商材（例：酒類 15案件）を文に入れて残す。会社を切り替えても同じ文が出た。
   直し：提案を出すとき（v88PropHtml）、商材で決まる文（似た商材・記録の中央値・取引まで進んだ割合・止まっている目安）を、
         いま表示中の商品の STANDAGE の記録で作り直す。作ったときの会社を控え（v95co）、違う会社のときは一言そえる。
   ══════════════════════════════════════════════════════════════════════ */
function v95miscCoNow() { try { return typeof v88CoRaw === "function" ? v88CoRaw() : String((typeof TEN !== "undefined" && TEN && TEN.co) || ""); } catch (e) { return ""; } }
if (typeof v88MakeProp === "function") {
  const __mp95 = v88MakeProp;
  v88MakeProp = function () { const p = __mp95.apply(this, arguments); try { if (p && typeof p === "object") { p.v95co = v95miscCoNow(); try { p.v95cat = v88T(v88Bench().nm); } catch (x) { } } } catch (e) { v95miscErr("mkprop", e); } return p; };
}
function v95miscPropLines(p) {
  const B = v88Bench(); const cat = v88T(B.nm);
  const bd = Math.round(B.beforeDeal || 15);
  return (p.lines || []).map((s) => {
    s = String(s);
    let m;
    if ((m = s.match(/^似た商材（(.+?)）の STANDAGE の記録 (\d+)案件から、道筋の目安を出します$/)) || /^I'll use STANDAGE records from \d+ similar projects/.test(s))
      return v88M(`似た商材（${cat}）の STANDAGE の記録 ${B.projects}案件から、道筋の目安を出します`, `I'll use STANDAGE records from ${B.projects} similar projects (${cat})`);
    if ((m = s.match(/^STANDAGE の記録では、(.+?)は契約から初めての商談まで中央値 ([\d.]+)か月、最初の取引までに会うバイヤーは中央値 (\d+)社でした$/)))
      return `STANDAGE の記録では、${cat}は契約から初めての商談まで中央値 ${B.firstMeet}か月、最初の取引までに会うバイヤーは中央値 ${bd}社でした`;
    if ((m = s.match(/^STANDAGE の記録では、会ってから6か月以上たったバイヤーのうち取引まで進んだのは ([\d.]+)%（(.+?)）。(.*)$/)))
      return `STANDAGE の記録では、会ってから6か月以上たったバイヤーのうち取引まで進んだのは ${B.dealRate}%（${cat}）。${m[3]}`;
    if ((m = s.match(/^目安は (\d+)日（(.+?)の STANDAGE の記録から）。(.*)$/))) {
      let sd = m[1]; try { sd = v88StallDays(p.stage, B); } catch (e) { }
      return `目安は ${sd}日（${cat}の STANDAGE の記録から）。${m[3]}`;
    }
    return s;
  });
}
if (typeof v88PropHtml === "function") {
  const __ph95 = v88PropHtml;
  v88PropHtml = function (p, compact) {
    let q = p;
    try {
      if (p && typeof p === "object" && Array.isArray(p.lines)) {
        q = Object.assign({}, p, { lines: v95miscPropLines(p) });
        if (p.kind === "kb" && typeof p.title === "string") { try { q.title = p.title.replace(/^今週、(.+?)・/, "今週、" + v88T(v88Bench().nm) + "・"); } catch (x) { } }
      }
    } catch (e) { v95miscErr("prop", e); q = p; }
    let h = __ph95.call(this, q, compact);
    try {
      const co = v95miscCoNow();
      if (p && p.v95co && co && p.v95co !== co) {
        const note = `<p class="v88mute v95propco" data-v95propco="1">${v95miscE(v95miscM(`この提案は「${p.v95co}」を表示していたときに出したものです。商材の数字は、いま表示中の「${co}」の商品で出し直しています`, `This suggestion was made while “${p.v95co}” was shown; category figures are recalculated for “${co}”.`))}</p>`;
        h = String(h).replace(/(<h3 class="v88prop-t">)/, note + "$1");
      }
    } catch (e) { v95miscErr("propco", e); }
    return h;
  };
}

/* ══════════════════════════════════════════════════════════════════════
   No.504 根拠の「取引に進んだ割合が高い国（同じ商材・5案件以上）」と、販売先国の選定の関係を書く
   前：STANDAGE の記録（ほかのお客様の案件の集計）の国の順位だけが並び、選んだ販売先国と食い違って見えた。
   直し：国名を同じ書き方にそろえ、選んだ国に ✓。「参考の国で、販売先国はこの商品の規制・市場・競合で選ぶので一致しないことがある」と、
         選んだ国がこの記録の何位か（無ければ「5案件に満たない」）を1行で。
   ══════════════════════════════════════════════════════════════════════ */
function v95miscChosen() {
  try {
    const t = (typeof TEN !== "undefined" && TEN) ? TEN : null; const S = (t && t.ctySel) || {};
    const L = (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean);
    return [...new Set(L.map((c) => v95miscCtyStd(c).std))];
  } catch (e) { return []; }
}
window.v95miscChosen = v95miscChosen;
function v95miscBasisLi(pl) {
  const B = (pl && pl.B) || {};
  const L = (B.countries || []).map((c, i) => ({ cn: v95miscCtyStd(c.cn).std, pct: c.deal_pct, rank: i + 1 }));
  const ch = v95miscChosen();
  const top = L.slice(0, 6).map((c) => (ch.indexOf(c.cn) >= 0 ? "✓ " : "") + v95miscE(c.cn) + " " + c.pct + "%").join("・");
  const where = ch.map((c) => { const f = L.find((x) => x.cn === c); return f ? v95miscM(`${c}（この記録では ${f.rank}位・${f.pct}%）`, `${c} (#${f.rank}, ${f.pct}%)`) : v95miscM(`${c}（この商材で5案件に満たないため、この順位に入っていません）`, `${c} (fewer than 5 projects, not ranked)`); });
  const note = v95miscM(
    `STANDAGE がこれまでに支援した同じ商材の案件の記録（社名は使っていない）から見た、参考の国の順位です。販売先国は、この商品の規制・市場・競合で選ぶ（「販売先国の選定」）ので、この順位とは一致しないことがあります。` +
      (ch.length ? `選んだ販売先国：${where.join("・")}` : `販売先国はまだ選んでいません（「販売先国の選定」で選ぶと、ここで照らし合わせます）`),
    `Reference ranking from STANDAGE's past projects in the same category. Target markets are chosen from this product's regulations, market and competition, so they can differ. ` +
      (ch.length ? `Your markets: ${where.join(", ")}` : `No target markets chosen yet.`));
  return `<li data-v95basis="1"><b>${v88M("取引に進んだ割合が高い国（同じ商材・5案件以上）", "Countries where deals progressed (5+ projects)")}</b>：${top}<br><small class="v88mute v95basis">${v95miscE(note)}</small></li>`;
}
if (typeof v88Basis === "function") {
  const __bs95 = v88Basis;
  v88Basis = function (pl) {
    const h = __bs95.apply(this, arguments);
    try {
      if (!pl || !pl.B || !(pl.B.countries || []).length) return h;
      const re = /<li><b>(?:取引に進んだ割合が高い国（同じ商材・5案件以上）|Countries where deals progressed \(5\+ projects\))<\/b>：[^<]*<\/li>/;
      if (re.test(h)) return String(h).replace(re, v95miscBasisLi(pl));
    } catch (e) { v95miscErr("basis", e); }
    return h;
  };
}

/* ══════════════════════════════════════════════════════════════════════
   No.505 見本の会社を会社の上限（10社）に数えない
   前：登録の数え方（tenCanAdd・v5326p140RoomCo）は 21.68 で「見本を除く」に直っていたが、
       「新しい会社の商品を登録する」の窓の警告（21.53.26 の v1811Open の包み）は見本を含む会社の数（tenCos().length）で出していた。
       見本 5社＋自社 5社＝10社で「登録できる会社は上限（10社）です。新しい会社の商品は登録できません」と出て、
       すぐ下に「見本の会社（業種サンプル）は上限の数に入りません」と出る＝矛盾（実際は登録できる）。
       商品情報を登録の画面の「登録した会社 N/10社」も見本を含めて数えていた。
       また、自社が10社のとき、業種サンプルを開く（adoptSample2）も上限で止まった。
   直し：① 窓の警告は、見本を除いた会社の数が上限のときだけ出す。② 「登録した会社」は見本を除いて数え、見本の数をそえる。
         ③ 業種サンプルは自社の上限で止めない（見本どうしの数の上限は今のまま）。
   同期サーバー：会社の数の判定は無い（手元の模擬 sync_mock.py・legacy/gas/sync_gas.js とも。あるのはスナップショットの大きさ 1.5MB の上限だけ）＝アプリだけで直る。
   ══════════════════════════════════════════════════════════════════════ */
function v95miscSmpT(t) { try { if (typeof v68hSmp === "function") return !!v68hSmp(t); } catch (e) { } return !!(t && (t.src === "sample2" || t.src === "sample")); }
function v95miscCoCount() {
  let own = 0, smp = 0;
  try {
    const T = (typeof TENS !== "undefined" && TENS) ? TENS : [];
    (typeof tenCos === "function" ? tenCos() : []).forEach((c) => { if (c.idxs.length && c.idxs.every((i) => v95miscSmpT(T[i]))) smp++; else own++; });
  } catch (e) { v95miscErr("cnt", e); }
  return { own, smp, max: (typeof CO_MAX !== "undefined" ? CO_MAX : 10) };
}
window.v95miscCoCount = v95miscCoCount;
if (typeof v1811Open === "function") {
  const __vo95 = v1811Open;
  v1811Open = function (step) {
    const r = __vo95.apply(this, arguments);
    try {
      if (step === "newco") {
        const N = v95miscCoCount();
        const el = document.getElementById("v5326p140full");
        if (el && N.own < N.max) el.remove();
        const two = document.querySelector("#v1811ov .v1811c .v1811two");
        if (two && N.own < N.max && N.smp && !document.getElementById("v95conote")) {
          two.insertAdjacentHTML("beforebegin", `<p class="nn" id="v95conote" data-v95conote="1" style="margin-top:10px">${v95miscE(v95miscM(`登録した会社 ${N.own}/${N.max}社（ほかに見本の会社 ${N.smp}社・上限に数えません）。あと ${N.max - N.own}社 登録できます`, `Registered companies ${N.own}/${N.max} (plus ${N.smp} sample companies, not counted). ${N.max - N.own} more can be added`))}</p>`);
        }
      }
    } catch (e) { v95miscErr("newco", e); }
    return r;
  };
}
function v95miscRegChip() {
  try {
    const box = document.getElementById("regprod"); if (!box) return;
    const sp = [...box.querySelectorAll("span.p")].find((x) => /^登録した会社 \d+\/\d+社$/.test((x.textContent || "").trim()) || x.dataset.v95co);
    if (!sp) return;
    const N = v95miscCoCount();
    const t = `登録した会社 ${N.own}/${N.max}社`;
    if (sp.textContent !== t) sp.textContent = t;
    sp.dataset.v95co = "1";
    sp.title = "見本の会社（業種サンプル）は上限に数えません";
    let s2 = box.querySelector("[data-v95cosmp]");
    if (N.smp && v95miscLang() === "ja") {
      const tt = `見本の会社 ${N.smp}社は数えません`;
      if (!s2) { s2 = document.createElement("span"); s2.className = "p lo"; s2.setAttribute("data-v95cosmp", "1"); s2.setAttribute("data-noi18n", "1"); sp.after(s2); }
      if (s2.textContent !== tt) s2.textContent = tt;
    } else if (s2) s2.remove();
  } catch (e) { v95miscErr("chip", e); }
}
if (typeof render === "function") {
  const __rn95 = render;
  render = function () { const r = __rn95.apply(this, arguments); try { v95miscRegChip(); } catch (e) { } return r; };
}
if (typeof adoptSample2 === "function") {
  const __as95 = adoptSample2;
  adoptSample2 = function (k) {
    let undo = null;
    try {
      const x = (typeof SAMPLES2 !== "undefined") ? SAMPLES2[k] : null;
      const T = (typeof TENS !== "undefined") ? TENS : [];
      if (x && !T.some((t) => t && t.src === "sample2" && t.co === x.co && t.item === x.item) && typeof v5326p140RoomCo === "function") {
        const N = v95miscCoCount();
        const exists = (typeof tenCos === "function") && tenCos().some((c) => c.co === String(x.co || "").trim());
        if (!exists && N.own >= N.max && N.smp < N.max) {
          const real = v5326p140RoomCo;
          v5326p140RoomCo = function (co) { return String(co || "").trim() === String(x.co || "").trim() ? { ok: true, co, newCo: true } : real.apply(this, arguments); };
          undo = () => { v5326p140RoomCo = real; };
        }
      }
    } catch (e) { v95miscErr("smp", e); }
    try { return __as95.apply(this, arguments); } finally { if (undo) undo(); }
  };
}
