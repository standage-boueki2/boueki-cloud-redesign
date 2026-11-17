/* ═══ v21.96 deck（2026-11-17 第9回相当 UAT・21.95.1）外国語営業資料と商品写真
   No.509（高）商品写真が「日本語文字入り」で除外され、使える写真が0枚のまま（A〜G の7カテゴリーすべて）
     判定のしかた：ファイル名でも OCR でもなく、AI の画像判定。写真を入れたとき（dkImgAudit）と公式サイト・Web から採るとき（dkVerifyImg）に
           画像を AI に見せ、返事の jp（日本語の文字が目立つ）を写真の _dq.jp に控える。
     誤検出の原因：dkImgAudit の問いは「NG＝画像に重ねた日本語の説明文・価格…（パッケージに印刷された商品名・成分は実物なので OK）」と書きながら、
           答えの形は「"jp":日本語文字が目立つならtrue」。日本の商品はパッケージに日本語があるので、ほぼ全部 jp:true（あわせて ok:false）になる。
     落としている所：dkPhGood（_dq.jp なら false）→ dk3Media で good:false → dk3PickPhotos が good:false の写真を外す（表紙・商品・ギャラリーのどこにも入らない）。
           同じ dkPhGood で dk3Gate の「納品品質の写真（3枚以上）」も 0枚になり、納品版の生成が止まる（下書きは写真なし）。
     直し：① 判定の見直し：この2つの問いに「jp は、撮ったあとに重ねた文字（説明文・価格・キャンペーン）が画像の 15% 以上を占めるときだけ。
             パッケージ・ラベル・看板の文字は数えない」を足し、文字の場所（jpWhere）と広さ（jpArea）も答えさせる。重ねた文字でなければ jp を外す
             （jp だけが理由の ok:false も戻す）。前に判定した写真は「AI にもう一度確かめてもらう」でやり直せる。
           ② 除外ではなく、写真ごとに「このまま使う／文字の所を切り取る・隠す／差し替える／使わない」を選べるようにする（選んだ結果は写真に控える。
             写真を替えると選び直し）。「このまま使う」を選んだ写真は dkPhGood が通す＝資料（画面のプレビュー・PPTX・PDF）に入る。
           ③ 使える写真が 3枚に足りず、選んでいない文字入りの写真があるときは、資料を作る前に選ぶ画面を出す（0枚のまま進めない）。
           ④ 判定は1か所（v96dkPhSt）で決め、写真の欄・納品レベルチェック・作成の段・最終チェックで同じものを使う。英語などの資料に文字入りの写真を
             入れたときは、最終チェックに「相手が日本語を読めないことがあります（使うと決めた写真）」と何枚目かを出す（止めない。使うかは利用者が決める）。
   No.512（高）英語の営業資料の関税（タイ 0%）が、規制の画面（タイ＝要確認）と食い違う
     原因：資料の「市場別の輸入要件」は dk3DataSrc → regsFor（カテゴリーのひな形の税率）から作る。21.95 の「自社の HS がひな形の品目と違えば要確認」
           （V95REG の regsFor の包み）は「いま表示している商品（TEN）」で判定するため、資料の作成中（8〜15分）にほかの商品に移ったとき・
           ほかの商品を表示したまま作った資料では、ひな形の値（タイ 0%・米国 12.5% など）がそのまま資料に入っていた（再現：味噌の資料を作る間に
           日用品の商品を表示すると、タイ 0%）。規制の画面は、その商品の D.regs を V95REG で直した値（要確認）を出す。
     直し：資料の関税は、規制の画面と同じ作り方（その商品の tenantToD → V95REG.fixOne。表示中の商品なら画面の D.regs そのもの）で、資料の商品に
           ついて国ごとに決める（v96dkDutyJ）。「要確認」の国は資料でも To be confirmed などと出す（言語ごとの言葉に直す）。
           資料を組み立てたあと、市場別の輸入要件の表と、文章の中の「関税◯%・無税」を、規制の画面の判定と照らし合わせる。表の食い違いは直して
           最終チェックに出し、文章が「要確認」の国の関税を言い切っていれば重大な問題として止める。保存した資料を開いたときも同じ照合をする。
   No.522（低）英語の営業資料の生成時間（8〜15分）とキューの表示が分かりにくい
     原因：右下の表示は、AI への1回ごとの問い合わせ（「考え中…（3件を処理中）・通常10〜30秒」）と資料全体の表示が入れ替わり、全体のどこまで
           進んだのか・あとどれくらいかが分からない。
     直し：資料の作成中は右下を資料全体の表示にそろえる（全7段のうち何段目・いま何をしているか・照合なら何回のうち何回・できあがりの枚数の見込み・
           経過と残りの目安〔この端末の実績から〕・同時に頼んでいる AI の数・ほかの画面に移っても続くこと）。資料の画面の進み具合にも同じ要約を出す。
           終わったとき、資料の画面にいなければ「資料を開く」を付けて長めに出す（タブを離れていれば題名にも出す）。表示は rd_v96deck.js。
   書き方：前の層の関数は控えてから包む。登録の値は書き換えない（写真への「使う／使わない」の控えと、利用者が選んだ加工だけを足す）。失敗したら前の動きのまま。 */
var V96DK = window.V96DK = { v: "21.96", err: [], n: {}, jpInfo: {}, regC: {}, pass: 0, gen: null, mk: null };
function v96dkErr(k, e) { try { V96DK.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96DK.err.length > 40) V96DK.err.shift(); } catch (x) { } }
function v96dkN(k) { try { V96DK.n[k] = (V96DK.n[k] || 0) + 1; } catch (e) { } }
function v96dkLang() { try { const l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : l === "ja" ? "ja" : "en"; } catch (e) { return "ja"; } }
function v96dkM(ja, en, zh, es) { const l = v96dkLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v96dkE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v96dkS(v) { try { if (typeof dk3S === "function") return dk3S(v); } catch (e) { } return String(v == null ? "" : v).trim(); }
function v96dkTen() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
function v96dkDeckT() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || v96dkTen(); } catch (e) { return v96dkTen(); } }
function v96dkSave() { try { if (typeof saveTen === "function") saveTen(); } catch (e) { v96dkErr("save", e); } }
function v96dkRender() { try { if (typeof render === "function") render(); } catch (e) { v96dkErr("render", e); } }
function v96dkToast(s) { try { if (typeof toast === "function") toast(s); } catch (e) { } }
function v96dkPat(rows) { try { if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) rows.slice().reverse().forEach(p => I18N.pat.unshift(p)); } catch (e) { v96dkErr("pat", e); } }
function v96dkDict(rows) {
  try { if (typeof I18N === "undefined" || !I18N || !I18N.dict) return;
    rows.forEach(r => { ["en", "zh", "es"].forEach((l, i) => { if (r[i + 1] && I18N.dict[l] && !I18N.dict[l][r[0]]) I18N.dict[l][r[0]] = r[i + 1]; }); }); } catch (e) { v96dkErr("dict", e); }
}

/* ══════════ No.509 商品写真：日本語の文字 ══════════ */
/* 写真の中身の目印（写真を替えたら選び直しにするため）。長さ＋飛び飛びの文字のハッシュ */
function v96dkFp(b64) {
  const s = String(b64 || ""); const n = s.length; if (!n) return "";
  let h = 5381; const st = Math.max(1, Math.floor(n / 4096));
  for (let i = 0; i < n; i += st) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  h = ((h << 5) + h + s.charCodeAt(n - 1)) | 0;
  return n.toString(36) + "." + (h >>> 0).toString(36);
}
const V96DK_FPC = new WeakMap();
function v96dkFpOf(o) {
  if (!o || !o.b64) return "";
  try { const c = V96DK_FPC.get(o); if (c && c.b === o.b64) return c.f; const f = v96dkFp(o.b64); V96DK_FPC.set(o, { b: o.b64, f }); return f; } catch (e) { return v96dkFp(o.b64); }
}
/* 利用者の選択（use＝文字入りのまま使う／no＝使わない）。写真の中身が変わっていたら無効 */
function v96dkDec(o) { const d = o && o.v96jp; if (!d || !d.d) return ""; return d.fp === v96dkFpOf(o) ? d.d : ""; }
function v96dkSetDec(o, d, how) {
  if (!o) return;
  if (!d) { delete o.v96jp; return; }
  o.v96jp = { d, fp: v96dkFpOf(o), at: (typeof TODAYS !== "undefined" && TODAYS) || new Date().toISOString().slice(0, 10), how: how || "" };
}
function v96dkJpFlag(o) { return !!(o && o.b64 && o._dq && o._dq.jp); }
function v96dkNoJp(o) { return Object.assign({}, o, { _dq: Object.assign({}, o._dq, { jp: false, ok: true }) }); }
const __pg96 = (typeof dkPhGood === "function") ? dkPhGood : null;
V96DK.pg0 = __pg96;
function v96dkGood0(o) { try { return __pg96 ? !!__pg96(o) : false; } catch (e) { return false; } }
if (__pg96) {
  dkPhGood = function (o) {
    try { if (v96dkJpFlag(o) && v96dkDec(o) === "use") return __pg96.call(this, v96dkNoJp(o)); } catch (e) { v96dkErr("pg", e); }
    return __pg96.apply(this, arguments);
  };
}
/* 写真1枚の状態（写真の欄・納品レベルチェック・作成の段・最終チェックで同じものを使う）
   good＝使える／jpUse＝文字入りのまま使う（選んだ）／jpAsk＝文字入り・まだ選んでいない／jpNo＝使わない（選んだ）／bad＝ほかの理由で使えない／other＝ラインアップ */
function v96dkPhSt(o) {
  if (!o || !o.b64) return "";
  if (o.other) return "other";
  if (v96dkJpFlag(o)) {
    const d = v96dkDec(o);
    if (d === "no") return "jpNo";
    const ok = v96dkGood0(v96dkNoJp(o)); // 文字のほかに理由（ぼやけ・小さい・形）があれば、選んでも使えない
    if (!ok) return "bad";
    return d === "use" ? "jpUse" : "jpAsk";
  }
  return v96dkGood0(o) ? "good" : "bad";
}
V96DK.phSt = v96dkPhSt;
function v96dkPhList(T) {
  const A = (T && T.assets) || {}; const out = [];
  (A.ph || []).forEach((o, i) => { const st = v96dkPhSt(o); if (st) out.push({ i, o, st }); });
  return out;
}
function v96dkPhSum(T) {
  const L = v96dkPhList(T);
  const by = k => L.filter(x => x.st === k);
  return { L, good: L.filter(x => x.st === "good" || x.st === "jpUse").length, ask: by("jpAsk"), use: by("jpUse"), no: by("jpNo"), need: 3,
    edited: L.filter(x => x.o && x.o.v96edit) };
}
V96DK.phSum = v96dkPhSum;
function v96dkPhNm(i) { return v96dkM("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto del producto " + (i + 1)); }
function v96dkPhNmJa(i) { return "商品写真" + (i + 1); }

/* ① 判定の見直し：AI への問い（写真の検査・サイトの画像の検査）に、日本語の文字の決め方を足す */
const V96DK_JPQ = /添付画像を、海外バイヤー向け英語営業資料の「商品写真」として使えるか判定してください|あわせて jp（画像に重ねた日本語の/;
const V96DK_JPRULE = "\n\n【jp（日本語の文字）の決め方・厳守】jp は「撮影のあとで画像に重ねた日本語の文字（説明文・キャッチコピー・価格・キャンペーン・吹き出し・透かし）」が、" +
  "画像の面積の 15% 以上を占めるときだけ true にしてください。商品・パッケージ・ラベル・瓶・箱に印刷された文字（商品名・成分・ブランド名）、店の看板や背景の文字、小さな文字は false です（実物の写真として使えます）。" +
  "jp だけを理由に ok を false にしないでください（ok は、ぼやけ・商品と無関係・別のブランドなどで決めます）。" +
  "あわせて JSON に次の2つを足してください：\"jpWhere\":\"overlay|package|background|none\"（日本語の文字がどこにあるか。重ねた文字＝overlay、商品やパッケージに印刷＝package、看板・背景＝background、無い＝none）、" +
  "\"jpArea\":数字（日本語の文字が占める面積のおおよその％・0〜100）";
function v96dkJpPost(r, fp) {
  if (!r || typeof r.txt !== "string") return r;
  const m = r.txt.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!m) return r;
  let j; try { j = JSON.parse(m[0]); } catch (e) { return r; }
  if (!j || typeof j !== "object") return r;
  const where = String(j.jpWhere || "").toLowerCase().trim(), area = Number(j.jpArea);
  const raw = !!j.jp;
  let jp = raw;
  if (raw && where && where !== "overlay") jp = false;
  if (raw && where === "overlay" && isFinite(area) && area < 15) jp = false;
  if (raw && !jp) {
    j.jp = false;
    const why = String(j.reason || "");
    if (j.ok === false && !j.low && String(j.kind || "") !== "ng" && /日本語|文字|テキスト|表記|キャッチ|価格|text|japanese/i.test(why)) j.ok = true;
    v96dkN("jpCleared");
  }
  try { V96DK.jpInfo[fp] = { raw, jp: !!j.jp, where, area: isFinite(area) ? Math.round(area) : null, at: Date.now() }; } catch (e) { }
  return Object.assign({}, r, { txt: JSON.stringify(j) });
}
if (typeof llmAsk === "function") {
  const __la96 = llmAsk;
  llmAsk = function (q, maxTok, opts) {
    let hit = false;
    try { hit = typeof q === "string" && !!(opts && opts.att && opts.att.b64) && V96DK_JPQ.test(q) && q.indexOf("【jp（日本語の文字）の決め方") < 0; } catch (e) { hit = false; }
    if (!hit) return __la96.apply(this, arguments);
    let fp = ""; try { fp = v96dkFp(opts.att.b64); } catch (e) { }
    v96dkN("jpAsk");
    const p = __la96.call(this, q + V96DK_JPRULE, Math.max(+maxTok || 0, 380), opts);
    return Promise.resolve(p).then(r => { try { return v96dkJpPost(r, fp); } catch (e) { v96dkErr("jppost", e); return r; } });
  };
}

/* ② 写真ごとの選択・加工（加工の画面は rd_v96deck.js の v96dkEdOpen） */
function v96dkPh(T, i) { try { return ((T && T.assets && T.assets.ph) || [])[i] || null; } catch (e) { return null; } }
function v96dkAfter(msg) {
  v96dkSave();
  v96dkRender();
  try { if (typeof window.v96dkAskRefresh === "function") window.v96dkAskRefresh(); } catch (e) { }
  if (msg) v96dkToast(msg);
}
function v96dkUse(T, i, d) {
  const o = v96dkPh(T, i); if (!o || !o.b64) return;
  v96dkSetDec(o, d, "");
  try { if (typeof logU === "function") logU("deck", "営業資料の写真：" + v96dkPhNmJa(i) + (d === "use" ? "を文字入りのまま使う" : d === "no" ? "を使わない" : "の選択を戻す")); } catch (e) { }
  v96dkAfter(d === "use" ? v96dkM(v96dkPhNmJa(i) + "を、文字入りのまま資料に使います", v96dkPhNm(i) + " will be used in the deck as it is (with the text)", v96dkPhNm(i) + "将保留文字用于资料", "La " + v96dkPhNm(i) + " se usará tal cual (con el texto)")
    : d === "no" ? v96dkM(v96dkPhNmJa(i) + "は、資料に使いません", v96dkPhNm(i) + " will not be used in the deck", v96dkPhNm(i) + "不用于资料", "La " + v96dkPhNm(i) + " no se usará") : "");
}
function v96dkUseAll(T) {
  const S = v96dkPhSum(T); if (!S.ask.length) return;
  S.ask.forEach(x => v96dkSetDec(x.o, "use", "all"));
  try { if (typeof logU === "function") logU("deck", "営業資料の写真：文字入りの写真 " + S.ask.length + "枚をそのまま使う"); } catch (e) { }
  v96dkAfter(v96dkM("文字入りの写真 " + S.ask.length + "枚を、そのまま資料に使います", S.ask.length + " photo(s) with text will be used as they are", "将保留文字使用 " + S.ask.length + " 张照片", "Se usarán " + S.ask.length + " foto(s) con texto tal cual"));
}
function v96dkReplace(i) {
  const inp = document.querySelector('input[type="file"][data-dkup="ph' + i + '"]');
  if (inp) { try { inp.click(); return; } catch (e) { } }
  v96dkToast(v96dkM("上の「ロゴ・商品写真」の欄の「変更」から入れ替えてください", "Replace it with “Change” in the “Logo & photos” box above", "请在上方“标志・商品照片”栏中点击“更改”替换", "Sustitúyala con «Cambiar» en el cuadro «Logo y fotos» de arriba"));
}
async function v96dkRecheck(T) {
  try {
    if (!(typeof ppReady === "function" && ppReady()) || typeof dkImgAudit !== "function") { v96dkToast(v96dkM("AI エンジンにつながっていないため、確かめ直せません", "The AI engine is not connected, so it cannot check again", "未连接AI引擎，无法重新检查", "El motor de IA no está conectado; no se puede comprobar de nuevo")); return; }
    const L = v96dkPhList(T).filter(x => x.st === "jpAsk" || x.st === "jpNo");
    if (!L.length) return;
    L.forEach(x => { try { x.o.v96re = { at: Date.now(), dq: x.o._dq }; delete x.o._dq; } catch (e) { } });
    v96dkToast(v96dkM("AI が " + L.length + "枚をもう一度確かめています（パッケージに印刷された文字は数えません）", "The AI is checking " + L.length + " photo(s) again (text printed on the package does not count)", "AI 正在重新检查 " + L.length + " 张照片（包装上印刷的文字不计）", "La IA está comprobando de nuevo " + L.length + " foto(s) (no cuenta el texto impreso en el envase)"));
    v96dkRender();
    await dkImgAudit();
    L.forEach(x => { try { if (!x.o._dq && x.o.v96re && x.o.v96re.dq) x.o._dq = x.o.v96re.dq; delete x.o.v96re; } catch (e) { } }); // 応答が無かった写真は前の判定に戻す
    const S = v96dkPhSum(T);
    v96dkAfter(v96dkM("確かめ直しました：使える写真 " + S.good + "枚・文字入りで選んでいない写真 " + S.ask.length + "枚", "Checked again: " + S.good + " usable photo(s), " + S.ask.length + " with text still to choose", "已重新检查：可用照片 " + S.good + " 张・含文字待选择 " + S.ask.length + " 张", "Comprobado: " + S.good + " foto(s) utilizables, " + S.ask.length + " con texto por decidir"));
  } catch (e) { v96dkErr("recheck", e); }
}
V96DK.use = v96dkUse; V96DK.useAll = v96dkUseAll; V96DK.recheck = v96dkRecheck;

/* 加工（切り取る・隠す）を写真に入れる。o.hid（高解像度の控え）があれば、そちらにも同じ加工をする。元は IndexedDB に控えて「加工の前に戻す」 */
function v96dkImgEl(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error("画像を読み込めませんでした")); im.src = src; }); }
function v96dkApplyOps(im, ops) {
  let cv = document.createElement("canvas"); cv.width = im.naturalWidth || im.width; cv.height = im.naturalHeight || im.height;
  let g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(im, 0, 0);
  (ops || []).forEach(op => {
    const W = cv.width, H = cv.height;
    const x = Math.max(0, Math.round(op.x * W)), y = Math.max(0, Math.round(op.y * H));
    const w = Math.max(1, Math.min(W - x, Math.round(op.w * W))), h = Math.max(1, Math.min(H - y, Math.round(op.h * H)));
    if (op.t === "crop") {
      const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
      c2.getContext("2d").drawImage(cv, x, y, w, h, 0, 0, w, h);
      cv = c2; g = cv.getContext("2d");
    } else if (op.t === "blur") {
      const k = Math.max(6, Math.round(Math.max(w, h) / 14));
      const sw = Math.max(1, Math.round(w / k)), sh = Math.max(1, Math.round(h / k));
      const t = document.createElement("canvas"); t.width = sw; t.height = sh;
      const tg = t.getContext("2d"); tg.imageSmoothingEnabled = true; tg.drawImage(cv, x, y, w, h, 0, 0, sw, sh);
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, sw, sh, x, y, w, h); g.restore();
    } else if (op.t === "fill") {
      /* まわりの色：選んだ枠の外側のふち（幅 4%）の平均の色で塗る */
      const b = Math.max(2, Math.round(Math.min(W, H) * 0.04));
      const x0 = Math.max(0, x - b), y0 = Math.max(0, y - b), x1 = Math.min(W, x + w + b), y1 = Math.min(H, y + h + b);
      let rr = 0, gg = 0, bb = 0, n = 0;
      try {
        const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data, ww = x1 - x0;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
          if (xx >= x && xx < x + w && yy >= y && yy < y + h) continue;
          const p = ((yy - y0) * ww + (xx - x0)) * 4; rr += d[p]; gg += d[p + 1]; bb += d[p + 2]; n++;
        }
      } catch (e) { }
      g.fillStyle = n ? "rgb(" + Math.round(rr / n) + "," + Math.round(gg / n) + "," + Math.round(bb / n) + ")" : "#ffffff";
      g.fillRect(x, y, w, h);
    }
  });
  return cv;
}
function v96dkCanvasOut(cv, max, q) {
  const s = Math.min(1, max / Math.max(cv.width, cv.height));
  let c = cv;
  if (s < 1) { c = document.createElement("canvas"); c.width = Math.max(1, Math.round(cv.width * s)); c.height = Math.max(1, Math.round(cv.height * s)); const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(cv, 0, 0, c.width, c.height); }
  const u = c.toDataURL("image/jpeg", q || 0.85);
  return { b64: u.split(",")[1], mime: "image/jpeg", w: c.width, h: c.height };
}
async function v96dkSrcOf(o) {
  if (o && o.hid && typeof dk3HiGet === "function") { try { const hi = await dk3HiGet(o.hid); if (hi && hi.b64) return hi; } catch (e) { } }
  return { b64: o.b64, mime: o.mime || "image/jpeg", w: o.w, h: o.h };
}
/* 加工した結果（ops は 0〜1 の割合の座標）を写真に入れる */
async function v96dkSaveEdit(T, i, ops) {
  const o = v96dkPh(T, i);
  if (!o || !o.b64 || !Array.isArray(ops) || !ops.length) return false;
  const src = await v96dkSrcOf(o);
  const im = await v96dkImgEl("data:" + (src.mime || "image/jpeg") + ";base64," + src.b64);
  const cv = v96dkApplyOps(im, ops);
  const thumbMax = Math.max(900, o.w || 0, o.h || 0);
  const th = v96dkCanvasOut(cv, thumbMax, 0.84);
  let hiId = "", hi = null;
  if (o.hid && typeof dk3HiPut === "function") {
    hi = v96dkCanvasOut(cv, 2000, 0.88);
    hiId = "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (!(await dk3HiPut(hiId, hi))) { hiId = ""; hi = null; }
  }
  /* 元に戻すための控え（はじめの加工の前だけ）。画像そのものは IndexedDB に置く（ブラウザの保存容量を使い切らないため） */
  if (!o.v96orig) {
    let oid = o.hid || "";
    if (!oid && typeof dk3HiPut === "function") { const id = "o" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); if (await dk3HiPut(id, { b64: o.b64, mime: o.mime, w: o.w, h: o.h })) oid = id; }
    const keep = {}; ["mime", "w", "h", "hid", "hw", "hh", "_dq", "v96jp", "enh", "_orig", "_role"].forEach(k => { if (o[k] !== undefined) keep[k] = o[k]; });
    o.v96orig = { id: oid, keep, at: Date.now() };
  }
  Object.assign(o, { b64: th.b64, mime: th.mime, w: th.w, h: th.h });
  if (hiId && hi) { o.hid = hiId; o.hw = hi.w; o.hh = hi.h; } else { delete o.hid; delete o.hw; delete o.hh; }
  delete o._orig; delete o.enh; // 「画質補正」の元に戻すは、加工の前の写真には戻せないため外す（加工の前に戻すで戻る）
  o.v96edit = { ops: ops.map(x => x.t), n: ((o.v96edit && o.v96edit.n) || 0) + 1, at: (typeof TODAYS !== "undefined" && TODAYS) || "" };
  const ai = typeof ppReady === "function" && ppReady() && typeof dkImgAudit === "function";
  if (ai) delete o._dq; // 加工した写真は AI がもう一度確かめる
  else if (o._dq) o._dq = Object.assign({}, o._dq, { jp: false, ok: true, reason: "利用者が文字の所を加工" });
  v96dkSetDec(o, "use", "edit"); // 加工して使うと決めた（AI がもう一度「文字あり」と言っても使う）
  try { if (typeof logU === "function") logU("deck", "営業資料の写真：" + v96dkPhNmJa(i) + "を加工（" + o.v96edit.ops.join("・") + "）"); } catch (e) { }
  v96dkAfter(v96dkM(v96dkPhNmJa(i) + "を加工しました。資料に使います" + (ai ? "（AI がもう一度確かめます）" : ""), v96dkPhNm(i) + " was edited and will be used in the deck" + (ai ? " (the AI checks it again)" : ""), v96dkPhNm(i) + "已编辑，将用于资料", "La " + v96dkPhNm(i) + " se editó y se usará"));
  if (ai) { try { await dkImgAudit(); } catch (e) { } }
  return true;
}
async function v96dkUndoEdit(T, i) {
  const o = v96dkPh(T, i); if (!o || !o.v96orig) return false;
  const O = o.v96orig;
  let img = null;
  if (O.id && typeof dk3HiGet === "function") { try { img = await dk3HiGet(O.id); } catch (e) { img = null; } }
  if (!img || !img.b64) { v96dkToast(v96dkM("この端末には加工の前の写真が残っていないため、戻せません。写真を入れ直してください", "The photo before editing is not kept on this device, so it cannot be restored. Please upload the photo again", "本设备未保留编辑前的照片，无法恢复。请重新上传", "Este equipo no guarda la foto anterior a la edición; súbala de nuevo")); return false; }
  const K = O.keep || {};
  let th = { b64: img.b64, mime: img.mime || "image/jpeg", w: img.w, h: img.h };
  if (O.id === K.hid && K.w && K.h && Math.max(img.w || 0, img.h || 0) > Math.max(K.w, K.h)) {
    try { const im = await v96dkImgEl("data:" + th.mime + ";base64," + th.b64); th = v96dkCanvasOut(v96dkApplyOps(im, []), Math.max(K.w, K.h), 0.84); } catch (e) { }
  }
  ["hid", "hw", "hh", "_dq", "v96jp", "enh", "_orig", "_role", "v96edit"].forEach(k => { delete o[k]; });
  Object.keys(K).forEach(k => { o[k] = K[k]; });
  Object.assign(o, { b64: th.b64, mime: th.mime, w: K.w || th.w, h: K.h || th.h });
  delete o.v96orig; delete o.v96edit;
  if (o.v96jp) o.v96jp.fp = v96dkFpOf(o); // 加工の前の選択をそのまま戻す
  v96dkAfter(v96dkM(v96dkPhNmJa(i) + "を加工の前に戻しました", v96dkPhNm(i) + " was restored to before editing", v96dkPhNm(i) + "已恢复到编辑前", "La " + v96dkPhNm(i) + " volvió a como estaba"));
  return true;
}
V96DK.saveEdit = v96dkSaveEdit; V96DK.undoEdit = v96dkUndoEdit; V96DK.srcOf = v96dkSrcOf; V96DK.applyOps = v96dkApplyOps; V96DK.imgEl = v96dkImgEl;

/* 写真の欄の下の「日本語の文字が写っている写真」の箱（写真を選ぶ画面）と、作る前に出す選ぶ画面で同じものを使う */
function v96dkWhy(o) {
  try {
    const I = V96DK.jpInfo[v96dkFpOf(o)];
    const r = String((o && o._dq && o._dq.reason) || "").slice(0, 40);
    let s = v96dkM("AI の判定：画像の中の日本語の文字が目立つ", "AI check: Japanese text stands out in the image", "AI 判定：图片中的日文文字显眼", "Revisión de IA: destaca texto en japonés");
    if (I && I.where === "overlay") s += v96dkM("（あとから重ねた文字" + (I.area != null ? "・約" + I.area + "%" : "") + "）", " (text added on top" + (I.area != null ? ", about " + I.area + "%" : "") + ")", "（后期叠加的文字）", " (texto superpuesto)");
    else if (r && !/日本語/.test(r)) s += "（" + r + "）";
    return s;
  } catch (e) { return ""; }
}
function v96dkRowHtml(x, lang) {
  const o = x.o, i = x.i, st = x.st;
  const nm = v96dkPhNm(i);
  const ed = !!o.v96edit;
  const stTx = st === "jpAsk" ? v96dkM("まだ選んでいません（このままでは資料に入りません）", "Not chosen yet (it is not in the deck until you choose)", "尚未选择（选择前不会放入资料）", "Sin decidir (no entra en la presentación hasta que elija)")
    : st === "jpUse" ? (ed ? v96dkM("✓ 文字の所を加工して使います（資料に入ります）", "✓ Edited and used (it goes into the deck)", "✓ 已编辑并使用（放入资料）", "✓ Editada y en uso (entra en la presentación)") : v96dkM("✓ 文字入りのまま使います（資料に入ります）", "✓ Used as it is, with the text (it goes into the deck)", "✓ 保留文字使用（放入资料）", "✓ Se usa tal cual, con texto (entra en la presentación)"))
    : st === "jpNo" ? v96dkM("使いません（資料に入りません）", "Not used (it is not in the deck)", "不使用（不放入资料）", "No se usa (no entra en la presentación)")
    : st === "good" ? (ed ? v96dkM("✓ 加工して使います（資料に入ります）", "✓ Edited and used (it goes into the deck)", "✓ 已编辑并使用（放入资料）", "✓ Editada y en uso") : v96dkM("✓ 使えます", "✓ Usable", "✓ 可用", "✓ Utilizable"))
    : v96dkM("ほかの理由でも使えません（下の直し方）", "Not usable for another reason too (see how to fix below)", "还有其他原因无法使用（见下方方法）", "Tampoco se puede usar por otro motivo (ver abajo)");
  const B = (act, lb, cls) => `<button type="button" class="btn ${cls || "g"} v96dk-b" data-v96dkjp="${act}" data-v96dki="${i}">${v96dkE(lb)}</button>`;
  const bUse = B("use", v96dkM("✓ このまま使う", "✓ Use as it is", "✓ 直接使用", "✓ Usar tal cual"), st === "jpAsk" ? "" : "g");
  const bEd = B("edit", v96dkM("✂ 文字の所を切り取る・隠す", "✂ Crop or hide the text", "✂ 裁剪或遮住文字", "✂ Recortar u ocultar el texto"));
  const bRep = B("rep", v96dkM("⇄ 差し替える", "⇄ Replace", "⇄ 替换", "⇄ Sustituir"));
  const bNo = B("no", v96dkM("使わない", "Don't use", "不使用", "No usar"));
  const bBack = B("clear", v96dkM("選び直す", "Choose again", "重新选择", "Elegir de nuevo"));
  const bUndo = o.v96orig ? B("undo", v96dkM("↩ 加工の前に戻す", "↩ Undo the edit", "↩ 撤销编辑", "↩ Deshacer la edición")) : "";
  const btns = st === "jpAsk" ? bUse + bEd + bRep + bNo
    : st === "jpUse" ? bEd + bRep + (ed ? "" : bNo) + bUndo + (ed ? "" : bBack)
    : st === "jpNo" ? B("use", v96dkM("✓ やっぱり使う", "✓ Use it after all", "✓ 还是使用", "✓ Usarla")) + bEd + bRep
    : bEd + bRep + bUndo;
  const img = `<img class="v96dk-jpimg" src="data:${v96dkE(o.mime || "image/jpeg")};base64,${o.b64}" alt="${v96dkE(nm)}" loading="lazy">`;
  return `<li class="v96dk-jprow" data-v96dkst="${st}">${img}<div class="v96dk-jptx"><b>${v96dkE(nm)}</b><span class="v96dk-jpwhy">${v96dkE(v96dkJpFlag(o) || st === "jpUse" ? v96dkWhy(o) : (ed ? v96dkM("文字の所を加工しました", "The text area was edited", "已编辑文字部分", "Se editó la zona del texto") : ""))}</span><span class="v96dk-jpst v96dk-st-${st}">${v96dkE(stTx)}</span></div><div class="v96dk-jpbtns">${btns}</div></li>`;
}
function v96dkPanelHtml(T, mode) {
  try {
    if (!T) return "";
    const S = v96dkPhSum(T);
    const rows = S.L.filter(x => x.st === "jpAsk" || x.st === "jpUse" || x.st === "jpNo" || (x.o && (x.o.v96edit || (v96dkJpFlag(x.o) && x.st === "bad"))));
    if (!rows.length) return "";
    const jpN = rows.length;
    const ai = typeof ppReady === "function" && ppReady() && typeof dkImgAudit === "function";
    const head = mode === "ask" ? v96dkM("📷 写真を選んでから営業資料を作ります", "📷 Choose the photos before making the deck", "📷 选择照片后再制作资料", "📷 Elija las fotos antes de crear la presentación")
      : v96dkM("📷 日本語の文字が写っている写真：" + jpN + "枚", "📷 Photos with Japanese text: " + jpN, "📷 含日文文字的照片：" + jpN + " 张", "📷 Fotos con texto en japonés: " + jpN);
    const lead = v96dkM("AI が「画像の中の日本語の文字が目立つ」と判定した写真です。英語などの資料に入れると、相手が日本語を読めないことがあります。<b>使うかどうかは写真ごとに選べます</b>（「このまま使う」「文字の所を切り取る・隠す」を選ぶと資料に入ります）。",
      "The AI found Japanese text standing out in these photos. In an English (or other language) deck, the buyer may not be able to read it. <b>You can choose for each photo</b> (“Use as it is” or “Crop or hide the text” puts it in the deck).",
      "AI 判定这些照片中的日文文字显眼。放入英文等资料时，对方可能看不懂日文。<b>可以逐张选择是否使用</b>（选择“直接使用”或“裁剪或遮住文字”即放入资料）。",
      "La IA detectó texto en japonés destacado en estas fotos. En una presentación en inglés u otro idioma, el comprador puede no entenderlo. <b>Puede decidir foto por foto</b> («Usar tal cual» o «Recortar u ocultar el texto» la incluye).");
    const cnt = v96dkM("いま資料に使える写真：<b>" + S.good + "枚</b>（必要 " + S.need + "枚以上）", "Photos usable in the deck now: <b>" + S.good + "</b> (" + S.need + " or more needed)", "目前可用于资料的照片：<b>" + S.good + " 张</b>（需要 " + S.need + " 张以上）", "Fotos utilizables ahora: <b>" + S.good + "</b> (se necesitan " + S.need + " o más)");
    const askN = S.ask.length;
    const bulk = (askN ? `<button type="button" class="btn v96dk-b" data-v96dkjp="all">${v96dkE(v96dkM("まだ選んでいない " + askN + "枚を、文字入りのまま使う", "Use the " + askN + " photo(s) not chosen yet as they are", "将未选择的 " + askN + " 张保留文字使用", "Usar tal cual las " + askN + " foto(s) sin decidir"))}</button>` : "") +
      (ai && (askN || S.no.length) ? `<button type="button" class="btn g v96dk-b" data-v96dkjp="re">${v96dkE(v96dkM("AI にもう一度確かめてもらう（パッケージの文字は数えません）", "Ask the AI to check again (text printed on the package does not count)", "让 AI 重新检查（包装上的文字不计）", "Pedir a la IA que compruebe de nuevo (no cuenta el texto del envase)"))}</button>` : "");
    const go = mode === "ask" ? `<div class="v96dk-askgo"><button type="button" class="btn v96dk-b" data-v96dkjp="go">${v96dkE(v96dkM("この写真で営業資料を作る", "Make the deck with these photos", "用这些照片制作资料", "Crear la presentación con estas fotos"))}</button><button type="button" class="btn g v96dk-b" data-v96dkjp="close">${v96dkE(v96dkM("閉じる", "Close", "关闭", "Cerrar"))}</button></div>` +
      `<p class="nn v96dk-asknote">${v96dkE(v96dkM("文字入りの写真を選ばずに作ると、資料に入る写真が足りず、納品版ではなく下書き（写真の枠が空き）になります。", "If you make the deck without choosing, there are not enough photos, so it becomes a draft (with empty photo frames) instead of the final version.", "如不选择就制作，照片不足，会成为草稿（照片框为空）而不是正式版。", "Si la crea sin elegir, faltan fotos y será un borrador (con marcos vacíos) en lugar de la versión final."))}<button type="button" class="v96dk-lnk" data-v96dkjp="gonp">${v96dkE(v96dkM("選ばずに作る", "Make it without choosing", "不选择直接制作", "Crear sin elegir"))}</button></p>` : "";
    return `<div class="c v96dk-jp${mode === "ask" ? " v96dk-ask" : ""}" data-v96dkjpbox="1" data-noi18n="1" role="region" aria-label="${v96dkE(head)}"><h3>${v96dkE(head)}</h3><p class="v96dk-lead">${lead}</p><p class="v96dk-cnt">${cnt}</p>` +
      `${bulk ? `<div class="v96dk-bulk">${bulk}</div>` : ""}<ul class="v96dk-jpl">${rows.map(x => v96dkRowHtml(x)).join("")}</ul>${go}</div>`;
  } catch (e) { v96dkErr("panel", e); return ""; }
}
V96DK.panelHtml = v96dkPanelHtml;
/* 写真の欄の各写真の下の短い表示を、選んだ結果にそろえる */
function v96dkSlotFix(h, T) {
  try {
    const A = (T && T.assets) || {};
    return String(h).replace(/(<p class="lbl" style="margin-bottom:5px">商品写真(\d+)<\/p>)([\s\S]*?)(data-dkup="ph\d+")/g, (m, a, n, mid, z) => {
      const o = (A.ph || [])[+n - 1]; const st = v96dkPhSt(o);
      if (st === "jpUse") mid = mid.replace(/✓ 納品品質(・✨補正済)?/, (o.v96edit ? "✓ 加工して使う" : "✓ 使う（日本語の文字あり）"));
      else if (st === "jpAsk") mid = mid.replace("⚠ 日本語文字入り<br>表紙・品質判定から除外", "⚠ 日本語の文字あり<br>使うか下で選べます");
      else if (st === "jpNo") mid = mid.replace("⚠ 日本語文字入り<br>表紙・品質判定から除外", "使わない（選んだ）");
      else if (st === "good" && o && o.v96edit) mid = mid.replace(/✓ 納品品質(・✨補正済)?/, "✓ 加工して使う");
      return a + mid + z;
    });
  } catch (e) { v96dkErr("slot", e); return h; }
}
if (typeof deckAssetCard === "function") {
  const __ac96 = deckAssetCard;
  deckAssetCard = function () {
    let h = __ac96.apply(this, arguments);
    try {
      const T = v96dkTen();
      h = v96dkSlotFix(h, T);
      const p = v96dkPanelHtml(T, "");
      if (p) h = String(h) + p;
    } catch (e) { v96dkErr("asset", e); }
    return h;
  };
}
/* 21.95 の「使えない写真の直し方」から日本語の文字の分を外す（その分は上の箱で選ぶ）。文字のほかにも理由がある写真は、その理由で残す */
if (typeof v95dkPhotoBad === "function") {
  const __pb96 = v95dkPhotoBad;
  v95dkPhotoBad = function (T) {
    const P = __pb96.apply(this, arguments);
    try {
      const A = (T && T.assets) || {};
      const all = [];
      (P.all || []).forEach(x => {
        if (!x || x.k !== "jp") { if (x) all.push(x); return; }
        const o = (A.ph || [])[x.i];
        if (v96dkPhSt(o) !== "bad") return;
        let q = { big: true, ratioOk: true }; try { if (typeof dkImgLocalQ === "function") q = dkImgLocalQ(o) || q; } catch (e) { }
        const k = o && o._dq && o._dq.low ? "low" : !q.big ? "small" : !q.ratioOk ? "ratio" : "ng";
        all.push({ i: x.i, k, reason: x.reason });
      });
      return { all, jp: [], good: P.good };
    } catch (e) { v96dkErr("pbad", e); return P; }
  };
}
if (typeof v56deckPhWhy === "function") {
  const __pw96 = v56deckPhWhy;
  v56deckPhWhy = function (o) {
    try { const st = v96dkPhSt(o); if (st === "jpAsk") return "画像の中に日本語の文字がある（使うかどうかは「ロゴ・写真」の下で選べます）"; if (st === "jpNo") return "使わないと選んだ写真"; } catch (e) { }
    return __pw96.apply(this, arguments);
  };
}
/* 使うと決めた写真は、AI が「図表・文字中心」と分けていても外さない（利用者が使うと決めたため） */
if (typeof dk3Role === "function") {
  const __ro96 = dk3Role;
  dk3Role = function (o) {
    const r = __ro96.apply(this, arguments);
    try { if (r === "infographic" && o && v96dkDec(o) === "use") return "product"; } catch (e) { }
    return r;
  };
}
/* 納品レベルチェックの写真の項目：選べば数に入ることを添える（日本語の画面だけ。ほかの言語は前の訳のまま） */
if (typeof dk3Gate === "function") {
  const __gt96 = dk3Gate;
  dk3Gate = function () {
    const G = __gt96.apply(this, arguments);
    try {
      const p = (G || []).find(c => c && c.k === "photo");
      const T = v96dkTen();
      if (p && T && v96dkLang() === "ja") {
        const S = v96dkPhSum(T);
        if (!p.ok && S.ask.length) p.how = String(p.how || "") + "。日本語の文字が写っている写真が " + S.ask.length + "枚あります：「このまま使う」か「文字の所を切り取る・隠す」を選ぶと数に入ります（「ロゴ・写真」の欄の下）";
        else if (S.use.length) p.how = String(p.how || "") + "（うち文字入りのまま使う写真 " + S.use.length + "枚）";
      }
    } catch (e) { v96dkErr("gate", e); }
    return G;
  };
}
if (typeof dk3SetStep === "function") {
  const __ss96 = dk3SetStep;
  dk3SetStep = function (k, st, d) {
    const r = __ss96.apply(this, arguments);
    try {
      if (k === "mat" && st === "ok" && v96dkLang() === "ja" && typeof DK3G !== "undefined" && DK3G) {
        const S = v96dkPhSum(v96dkDeckT());
        const s = (DK3G.steps || []).find(x => x && x.k === "mat");
        if (s && (S.use.length || S.ask.length) && String(s.d || "").indexOf("日本語の文字") < 0) {
          s.d = String(s.d || "") + "（日本語の文字が写っている写真：" + [S.use.length ? "使う " + S.use.length + "枚" : "", S.ask.length ? "選んでいない " + S.ask.length + "枚は入れません" : ""].filter(Boolean).join("・") + "）";
          if (typeof dk3Paint === "function") dk3Paint();
        }
      }
    } catch (e) { v96dkErr("step", e); }
    return r;
  };
}

/* ══════════ No.512 資料の関税＝規制の画面の判定 ══════════ */
function v96dkCat(T) { try { return T.catKey || (typeof catKeyOf === "function" ? catKeyOf(T.cat) : "") || ""; } catch (e) { return ""; } }
function v96dkIsScreenD(T) {
  try {
    if (!T || typeof TEN === "undefined" || TEN !== T || typeof D === "undefined" || !D || !D.regs) return false;
    if (typeof PID !== "undefined" && PID !== "custom") return false;
    if (T.src === "sample") return false;
    return String(D.item || "") === String(T.item || "（商品名 未登録）");
  } catch (e) { return false; }
}
/* 規制の画面と同じ作り方で、その商品の国ごとの規制（関税）を作る。表示中の商品なら画面の D.regs そのもの */
function v96dkScreenRegs(T) {
  if (!T) return { regs: {}, from: "" };
  try {
    if (v96dkIsScreenD(T)) {
      try { if (typeof V95REG !== "undefined" && V95REG && typeof V95REG.fixD === "function") V95REG.fixD(); } catch (e) { }
      return { regs: D.regs, from: "screen" };
    }
    const key = [typeof dk3PKey === "function" ? dk3PKey(T) : T.item, T.hs, v96dkCat(T), T.cat, (T.targets || []).join(","), T.src, T.hsGuess ? 1 : 0].join("|");
    const C = V96DK.regC[key];
    if (C && Date.now() - C.at < 4000) return C.v;
    const make = () => { const d = tenantToD(T); return d; };
    const d = (typeof v70docWith === "function") ? v70docWith(T, make) : make();
    const regs = (d && d.regs) || {};
    const cat = (d && d.catKey) || v96dkCat(T);
    try { if (typeof V95REG !== "undefined" && V95REG && typeof V95REG.fixOne === "function") Object.keys(regs).forEach(c => { try { V95REG.fixOne(c, regs[c], T, cat); } catch (e) { } }); } catch (e) { }
    const v = { regs, from: "tenantToD" };
    V96DK.regC = {}; V96DK.regC[key] = { at: Date.now(), v };
    return v;
  } catch (e) { v96dkErr("sregs", e); return { regs: {}, from: "err" }; }
}
const V96DK_TBC = /要確認|未確認|確認中|要調査|不明|to be confirmed|\btbc\b|\btbd\b|confirm/i;
/* 国ごとの関税の判定（規制の画面と同じ値）。tbc＝要確認 */
function v96dkDutyJ(T, c) {
  try {
    const S = v96dkScreenRegs(T);
    const r = S.regs && S.regs[c];
    if (!r) return { tbc: true, v: "", from: S.from, why: "nodata" };
    const v = v96dkS(r.duty);
    if (T && T.hsGuess) return { tbc: true, v, from: S.from, why: "hsGuess" };
    if (!v || v === "—" || v === "-" || V96DK_TBC.test(v)) return { tbc: true, v, from: S.from, why: "screen" };
    return { tbc: false, v, from: S.from };
  } catch (e) { v96dkErr("dutyJ", e); return { tbc: true, v: "", why: "err" }; }
}
V96DK.dutyJ = v96dkDutyJ; V96DK.screenRegs = v96dkScreenRegs;
function v96dkNums(s) { return (String(s || "").normalize ? String(s || "").normalize("NFKC") : String(s || "")).replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || []; }
function v96dkSameNum(a, b) { const x = v96dkNums(a).map(Number).sort((p, q) => p - q).join(","), y = v96dkNums(b).map(Number).sort((p, q) => p - q).join(","); return x === y; }
/* 資料の元データ（日本語）の市場の関税を、規制の画面の判定にそろえる */
function v96dkAlignSrc(src, T) {
  try {
    if (!src || !Array.isArray(src.markets) || !T) return src;
    const log = [];
    src.markets.forEach(m => {
      if (!m || !m.c) return;
      const J = v96dkDutyJ(T, m.c);
      const want = J.tbc ? "要確認" : J.v;
      if (String(m.duty || "") !== want) { log.push({ c: m.c, from: String(m.duty || ""), to: want }); m.duty = want; }
    });
    if (log.length) { V96DK.mk = { at: Date.now(), item: T.item, log }; v96dkN("alignSrc"); }
  } catch (e) { v96dkErr("align", e); }
  return src;
}
if (typeof dk3DataSrc === "function") {
  const __ds96 = dk3DataSrc;
  dk3DataSrc = function (T) {
    const T1 = T || v96dkDeckT();
    let r;
    /* 表示中の商品が資料の商品と違っても（作成中にほかの商品に移ったときなど）、資料の商品で判定する */
    if (T1 && typeof v70docWith === "function") r = v70docWith(T1, () => __ds96.call(this, T1));
    else r = __ds96.apply(this, arguments);
    return v96dkAlignSrc(r, T1);
  };
}
/* 組み立てに使う市場の表：元の国名を控え、要確認の国は要確認にする（訳が数字を変えたときも言い切らない） */
if (typeof dk3Model === "function") {
  const __md96 = dk3Model;
  dk3Model = function (lang, plan, data, ph, deck, src, T) {
    const M = __md96.apply(this, arguments);
    try {
      const T1 = T || v96dkDeckT();
      const s0 = src || (typeof dk3DataSrc === "function" ? dk3DataSrc(T1) : null);
      const it = (M && M.markets && M.markets.items) || [];
      it.forEach((x, i) => {
        const c0 = s0 && s0.markets && s0.markets[i] && s0.markets[i].c;
        if (!x || !c0) return;
        x.c0 = c0;
        const J = v96dkDutyJ(T1, c0);
        if (J.tbc) { if (!V96DK_TBC.test(String(x.duty || ""))) x.v96was = String(x.duty || ""); x.duty = "要確認"; }
        else if (!v96dkSameNum(x.duty, J.v) && !V96DK_TBC.test(String(x.duty || ""))) { x.v96was = String(x.duty || ""); x.duty = "要確認"; }
      });
    } catch (e) { v96dkErr("model", e); }
    return M;
  };
}
/* 「要確認」の言葉：英語は To be confirmed などにそろえる（前は Confirmed on request） */
const V96DK_ASK = { en: "To be confirmed", zhCN: "待确认", zhTW: "待確認", zh: "待确认", es: "Por confirmar", ko: "확인 필요", th: "รอยืนยัน", vi: "Cần xác nhận", id: "Perlu dikonfirmasi", ms: "Perlu disahkan", fr: "À confirmer", de: "Noch zu bestätigen", ja: "要確認", pt: "A confirmar", it: "Da confermare" };
function v96dkAskLabels() { try { if (typeof DK3_L === "undefined" || !DK3_L) return; Object.keys(DK3_L).forEach(k => { if (DK3_L[k] && V96DK_ASK[k]) DK3_L[k].dutyAsk = V96DK_ASK[k]; }); } catch (e) { v96dkErr("asklb", e); } }
v96dkAskLabels();
function v96dkElTxt(e) { try { return (e.ps || []).map(p => (p.r || []).map(r => String(r && r.t != null ? r.t : "")).join("")).join(" "); } catch (x) { return ""; } }
function v96dkSetTxt(e, t, deck) {
  try {
    const p0 = (e.ps && e.ps[0]) || { r: [{}] }; const r0 = (p0.r && p0.r[0]) || {};
    const mut = (deck && deck.pal && deck.pal.mut) || r0.c;
    e.ps = [Object.assign({}, p0, { r: [Object.assign({}, r0, { t, sz: Math.min(11, r0.sz || 11), b: 0, c: mut })] })];
    delete e.mh; delete e.over;
    if (typeof dk3TextHeight === "function" && typeof dk3Fit === "function" && typeof DK3_SAFE !== "undefined") {
      const h = dk3TextHeight(e, deck.lang, deck, e.w * DK3_SAFE);
      if (h > e.h + 3) dk3Fit(e, deck.lang, deck, 0.66); else e.mh = h;
    }
  } catch (x) { v96dkErr("settxt", x); }
}
/* 生成後の照合：市場別の輸入要件の表と、文章の中の関税の言い切りを、規制の画面の判定と照らし合わせる */
const V96DK_DUTYW = /\bimport\s+dut(?:y|ies)\b|\bdut(?:y|ies)\b|\btariffs?\b|関税|关税|關稅|arancel(?:es)?|droits?\s+de\s+douane|droits?\s+d['’]importation|\bzoll|관세|อากร|thuế|bea\s+masuk|\bduti\b/i;
const V96DK_DUTYC = /\d+(?:\.\d+)?\s*%|duty[- ]free|tariff[- ]free|zero[- ](?:tariff|duty)|free\s+of\s+(?:duty|tariff)|no\s+(?:import\s+)?(?:duty|tariff)|免税|零关税|零關稅|無関税|関税なし|関税ゼロ|sin\s+aranceles|libre\s+de\s+aranceles|exento\s+de\s+aranceles|exon[ée]r[ée]|zollfrei|무관세|ปลอดอากร|miễn thuế|bebas\s+bea/i;
function v96dkCtyNames(c, lang) {
  const out = [c];
  try { if (typeof dk3CtyName === "function") out.push(dk3CtyName(lang, c)); } catch (e) { }
  try { if (typeof ctyL === "function") ["en", "zhCN", "es"].forEach(l => { try { out.push(ctyL(l, c)); } catch (e) { } }); } catch (e) { }
  return [...new Set(out.map(x => String(x || "").trim()).filter(x => x.length >= 2))];
}
function v96dkHasName(t, n) {
  try {
    const esc = String(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (/^[A-Za-z]/.test(n)) return new RegExp("(^|[^A-Za-z])" + esc + "(?![A-Za-z])").test(t);
    if (/^[ァ-ヶー]+$/.test(n)) return new RegExp(esc + "(?![ァ-ヶー])").test(t);
    return t.indexOf(n) >= 0;
  } catch (e) { return false; }
}
function v96dkMkCheck(deck, T, fix) {
  const out = { fixed: [], txt: [], gen: [], n: 0, ok: [] };
  try {
    if (!deck || !Array.isArray(deck.slides) || !T) return out;
    const lang = deck.lang || "en";
    const L = k => (typeof dk3Lb === "function" ? dk3Lb(lang, k) : k);
    const ask = L("dutyAsk");
    const items = (deck.M && deck.M.markets && deck.M.markets.items) || [];
    const tg = (T.targets || []).slice();
    const c0Of = (x) => x.c0 || tg.find(c => v96dkCtyNames(c, lang).indexOf(String(x.c || "").trim()) >= 0) || "";
    /* ① 市場別の輸入要件の表 */
    deck.slides.forEach((S, si) => {
      if (!S || S.key !== "markets" || !Array.isArray(S.els)) return;
      const tx = S.els.filter(e => e && e.k === "text");
      items.forEach(x => {
        const c0 = c0Of(x); if (!c0) return;
        const J = v96dkDutyJ(T, c0);
        const k = tx.findIndex(e => v96dkElTxt(e).trim() === String(x.c || "").trim());
        if (k < 0 || !tx[k + 1]) return;
        const cell = tx[k + 1], cur = v96dkElTxt(cell).trim();
        out.n++;
        const curTbc = cur === ask || V96DK_TBC.test(cur) || /confirm|確認|待定|por confirmar|à confirmer|bestätig|확인|ยืนยัน|xác nhận|dikonfirmasi|disahkan/i.test(cur);
        let bad = false;
        if (J.tbc && !curTbc) bad = true;
        else if (!J.tbc && !curTbc && !v96dkSameNum(cur, J.v)) bad = true;
        if (bad) {
          out.fixed.push({ si: si + 1, c: c0, from: cur, to: J.tbc ? "要確認" : J.v, ask });
          if (fix) { v96dkSetTxt(cell, ask, deck); x.duty = "要確認"; }
        } else out.ok.push(c0);
      });
    });
    /* ② 文章の中の関税の言い切り（表のページ以外） */
    const tbcC = tg.filter(c => v96dkDutyJ(T, c).tbc);
    deck.slides.forEach((S, si) => {
      if (!S || S.key === "markets" || !Array.isArray(S.els)) return;
      S.els.forEach(e => {
        if (!e || e.k !== "text" || e.name === "foot" || e.name === "pno" || e.name === "draft") return;
        const t = v96dkElTxt(e);
        if (!V96DK_DUTYW.test(t) || !V96DK_DUTYC.test(t)) return;
        const hit = tbcC.filter(c => v96dkCtyNames(c, lang).some(n => v96dkHasName(t, n)));
        if (hit.length) out.txt.push({ si: si + 1, cs: hit, t: t.slice(0, 80) });
        else out.gen.push({ si: si + 1, t: t.slice(0, 80) });
      });
    });
  } catch (e) { v96dkErr("mkck", e); }
  return out;
}
V96DK.mkCheck = v96dkMkCheck;
function v96dkMkReport(r, R, opened) {
  try {
    if (!r) return;
    r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
    if (R.fixed.length) r.warn.push({ k: "v96duty", t: (opened ? "この保存した資料の" : "") + "「市場別の輸入要件」（" + [...new Set(R.fixed.map(x => x.si))].join("・") + "枚目）の関税を、規制の画面の判定にそろえました：" + R.fixed.map(x => x.c + " " + (x.from || "（空）") + " → " + (x.to === "要確認" ? "要確認（" + x.ask + "）" : x.to)).join("／") });
    else if (R.n) r.ok.push("関税：規制の画面の判定と一致（" + R.n + "か国）");
    if (R.txt.length) {
      r.crit.push({ k: "v96dutytxt", t: R.txt.map(x => x.si + "枚目").join("・") + "の文が、" + [...new Set(R.txt.flatMap(x => x.cs))].join("・") + "の関税を言い切っています（規制の画面では要確認）：「" + R.txt[0].t + "」。この文を外すか、「もう一度作る」で作り直してから渡してください" });
      r.pass = false;
      r.score = Math.max(0, Math.min(+r.score || 0, 100 - r.crit.length * 18));
    }
    if (R.gen.length) r.warn.push({ k: "v96dutygen", t: R.gen.map(x => x.si + "枚目").join("・") + "に関税の数字・無税の文があります：「" + R.gen[0].t + "」。規制の画面の判定（国ごと）と合っているか確かめてください" });
  } catch (e) { v96dkErr("mkrep", e); }
}

/* ══════════ 最終チェック（写真と関税） ══════════ */
function v96dkPhUse(deck, T) {
  const out = { use: [], ask: [], no: [] };
  try {
    const prods = typeof dk3Prods === "function" ? dk3Prods(T) : [T];
    const where = {};
    (deck.slides || []).forEach((S, si) => (S.els || []).forEach(e => {
      if (!e || e.k !== "img" || e.m === "logo") return;
      const m = String(e.m).replace(/c$/, "").match(/^p(\d+):(\d+)$/); if (!m) return;
      const k = m[1] + ":" + m[2]; (where[k] = where[k] || new Set()).add(si + 1);
    }));
    prods.forEach((t, pi) => ((t && t.assets && t.assets.ph) || []).forEach((o, i) => {
      const st = v96dkPhSt(o);
      const w = where[pi + ":" + i];
      const nm = (prods.length > 1 && pi ? "「" + v96dkS(t.item).slice(0, 16) + "」の" : "") + v96dkPhNmJa(i);
      if (st === "jpUse" && w) out.use.push({ nm, sl: [...w], ed: !!o.v96edit });
      else if (st === "jpAsk") out.ask.push({ nm });
      else if (st === "jpNo") out.no.push({ nm });
    }));
  } catch (e) { v96dkErr("phuse", e); }
  return out;
}
if (typeof dk3Check === "function") {
  const __ck96 = dk3Check;
  dk3Check = function (deck, ctx) {
    const r = __ck96.apply(this, arguments);
    try {
      const T = v96dkDeckT();
      /* 写真：生成前（写真の欄）と同じ判定（v96dkPhSt）で出す */
      const P = v96dkPhUse(deck, T);
      const raw = P.use.filter(x => !x.ed);
      if (raw.length && deck.lang !== "ja") r.warn.push({ k: "v96jp", t: "日本語の文字が写っている写真（" + raw.map(x => x.nm).join("・") + "）を、文字入りのまま使っています（" + [...new Set(raw.flatMap(x => x.sl))].sort((a, b) => a - b).join("・") + "枚目）。相手が日本語を読めないことがあります（使うと決めた写真です。替えるときは「ロゴ・写真」で）" });
      if (P.use.length) r.ok.push("日本語の文字が写っている写真：使うと決めた " + P.use.length + "枚を入れました");
      if (P.ask.length) r.warn.push({ k: "v96jpask", t: "日本語の文字が写っている写真 " + P.ask.length + "枚（" + P.ask.map(x => x.nm).join("・") + "）は、使うかどうかが選ばれていないため入れていません。「ロゴ・写真」の欄の下で選べます" });
      if (P.no.length) r.ok.push("使わないと選んだ写真 " + P.no.length + "枚は入れていません");
      /* 関税：規制の画面の判定と照らし合わせる（表の食い違いは直す） */
      const R = v96dkMkCheck(deck, T, true);
      v96dkMkReport(r, R, false);
      V96DK.lastCk = { at: Date.now(), ph: P, mk: R };
    } catch (e) { v96dkErr("ck", e); }
    return r;
  };
}
/* 保存した資料を開いたときも、関税を規制の画面の判定と照らし合わせる（前の版で作った資料も直す） */
if (typeof dk14Open === "function") {
  const __op96 = dk14Open;
  dk14Open = async function (id) {
    const r = await __op96.apply(this, arguments);
    try {
      if (typeof DK3G === "undefined" || !DK3G || !DK3G.deck || DK3G.run || (typeof DK14 !== "undefined" && DK14 && DK14.open !== id)) return r;
      const deck = DK3G.deck;
      const k0 = deck.prodKeys && deck.prodKeys[0];
      const T = (typeof TENS !== "undefined" && Array.isArray(TENS) && typeof dk3PKey === "function" && k0) ? (TENS.find(t => t && dk3PKey(t) === k0) || null) : null;
      if (!T) return r;
      const R = v96dkMkCheck(deck, T, true);
      if (R.fixed.length || R.txt.length) {
        const ck = DK3G.check || (DK3G.check = { pass: false, score: 0, crit: [], warn: [], ok: [] });
        v96dkMkReport(ck, R, true);
        if (typeof dk3Paint === "function") dk3Paint();
        if (typeof render === "function" && typeof cur !== "undefined" && cur === "deck") render();
      }
    } catch (e) { v96dkErr("open", e); }
    return r;
  };
}

/* ══════════ 作る前に写真を選ぶ（No.509）と、進み具合の記録（No.522） ══════════ */
function v96dkNeedAsk(T) {
  try { const S = v96dkPhSum(T); return S.ask.length > 0 && S.good < S.need; } catch (e) { return false; }
}
function v96dkAskOpen(lang, force) {
  try {
    const T = v96dkTen(); if (!T) return false;
    V96DK.ask = { lang, force: !!force, at: Date.now() };
    const h = v96dkPanelHtml(T, "ask");
    if (!h || typeof openDW !== "function") return false;
    openDW(h);
    try { if (typeof dwChrome === "function") dwChrome(); } catch (e) { }
    setTimeout(() => { try { const b = document.querySelector('#pn [data-v96dkjp="use"],#pn [data-v96dkjp="all"]'); if (b) b.focus(); } catch (e) { } }, 60);
    v96dkN("askOpen");
    return true;
  } catch (e) { v96dkErr("askopen", e); return false; }
}
window.v96dkAskRefresh = function () {
  try {
    const box = document.querySelector("#pn .v96dk-ask");
    if (!box || !V96DK.ask) return;
    const h = v96dkPanelHtml(v96dkTen(), "ask");
    if (!h) { if (typeof closeDW === "function") closeDW(); return; }
    const wrap = document.createElement("div"); wrap.innerHTML = h;
    const nb = wrap.firstElementChild; if (nb) box.replaceWith(nb);
  } catch (e) { v96dkErr("askref", e); }
};
function v96dkGo(np) {
  const A = V96DK.ask || {}; V96DK.ask = null;
  try { if (typeof closeDW === "function") closeDW(); } catch (e) { }
  V96DK.pass = 1;
  if (np) v96dkN("goNoChoice");
  try { dk3Generate(A.lang || (typeof DK3G !== "undefined" && DK3G.lang) || "en", A.force); } catch (e) { v96dkErr("go", e); V96DK.pass = 0; }
}
if (typeof dk3Generate === "function") {
  const __g96 = dk3Generate;
  dk3Generate = async function (lang, force) {
    const pass = V96DK.pass; V96DK.pass = 0;
    try {
      if (!pass && !(typeof DK3G !== "undefined" && DK3G && DK3G.run) && v96dkNeedAsk(v96dkTen())) {
        if (v96dkAskOpen(lang, force)) return;
      }
    } catch (e) { v96dkErr("gen0", e); }
    if (typeof DK3G !== "undefined" && DK3G && DK3G.run) return __g96.apply(this, arguments);
    const G = { lang, t0: Date.now(), T: v96dkTen(), fin: 0 };
    V96DK.gen = G;
    try { return await __g96.apply(this, arguments); }
    finally {
      G.fin = 1; G.end = Date.now();
      try {
        G.ran = !!(typeof DK3G !== "undefined" && DK3G && (DK3G.at || 0) >= G.t0); G.n = (G.ran && DK3G.deck && DK3G.deck.slides) ? DK3G.deck.slides.length : 0; G.err = (G.ran && DK3G.err) || "";
        /* 作成中にほかの商品に移ったとき、できた資料は v70doc の控え（aside）に入る */
        const a = (typeof v70docS !== "undefined" && v70docS && v70docS.aside) || null;
        if (G.ran && a && a.deck && (a.at || 0) >= G.t0) { G.aside = 1; G.n = (a.deck.slides || []).length; G.item = String(a.name || (a.T && a.T.item) || ""); }
      } catch (e) { }
      V96DK.last = G; if (V96DK.gen === G) V96DK.gen = null;
      try { if (typeof window.v96dkGenDone === "function") window.v96dkGenDone(G); } catch (e) { v96dkErr("done", e); }
    }
  };
}
document.addEventListener("click", e => {
  try {
    const b = e.target && e.target.closest && e.target.closest("[data-v96dkjp]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const act = b.getAttribute("data-v96dkjp"), i = +b.getAttribute("data-v96dki");
    const T = v96dkTen();
    if (!T) return;
    if (act === "use") v96dkUse(T, i, "use");
    else if (act === "no") v96dkUse(T, i, "no");
    else if (act === "clear") v96dkUse(T, i, "");
    else if (act === "all") v96dkUseAll(T);
    else if (act === "rep") v96dkReplace(i);
    else if (act === "re") v96dkRecheck(T);
    else if (act === "undo") v96dkUndoEdit(T, i);
    else if (act === "edit") { if (typeof window.v96dkEdOpen === "function") window.v96dkEdOpen(T, i); else v96dkToast("加工の画面を開けませんでした"); }
    else if (act === "go") v96dkGo(false);
    else if (act === "gonp") v96dkGo(true);
    else if (act === "close") { V96DK.ask = null; if (typeof closeDW === "function") closeDW(); }
  } catch (x) { v96dkErr("click", x); }
}, true);

/* ══════════ 英語などの画面の訳（最終チェック・写真の欄の短い表示） ══════════ */
v96dkPat([
  { re: /^日本語の文字が写っている写真（(.+)）を、文字入りのまま使っています（(.+)枚目）。相手が日本語を読めないことがあります（使うと決めた写真です。替えるときは「ロゴ・写真」で）$/,
    en: (m) => "Photos with Japanese text (" + m[1].replace(/商品写真(\d+)/g, "photo $1").replace(/・/g, ", ") + ") are used as they are (slide " + m[2].replace(/・/g, ", ") + "). The buyer may not be able to read Japanese (you chose to use them; replace them in “Logo & photos”)",
    zh: (m) => "含日文文字的照片（" + m[1].replace(/商品写真/g, "商品照片") + "）保留文字使用（第 " + m[2] + " 页）。对方可能看不懂日文（这是您选择使用的照片，可在“标志・照片”中替换）",
    es: (m) => "Las fotos con texto en japonés (" + m[1].replace(/商品写真(\d+)/g, "foto $1").replace(/・/g, ", ") + ") se usan tal cual (diapositiva " + m[2].replace(/・/g, ", ") + "). Puede que el comprador no lea japonés (usted decidió usarlas; cámbielas en «Logo y fotos»)" },
  { re: /^日本語の文字が写っている写真 (\d+)枚（(.+)）は、使うかどうかが選ばれていないため入れていません。「ロゴ・写真」の欄の下で選べます$/,
    en: (m) => m[1] + " photo(s) with Japanese text (" + m[2].replace(/商品写真(\d+)/g, "photo $1").replace(/・/g, ", ") + ") were not used because you have not chosen whether to use them. Choose under “Logo & photos”",
    zh: (m) => "含日文文字的照片 " + m[1] + " 张（" + m[2].replace(/商品写真/g, "商品照片") + "）因尚未选择是否使用而未放入。可在“标志・照片”栏下方选择",
    es: (m) => m[1] + " foto(s) con texto en japonés (" + m[2].replace(/商品写真(\d+)/g, "foto $1").replace(/・/g, ", ") + ") no se usaron porque no ha decidido si usarlas. Elija bajo «Logo y fotos»" },
  { re: /^日本語の文字が写っている写真：使うと決めた (\d+)枚を入れました$/, en: "Photos with Japanese text: the $1 you chose to use are included", zh: "含日文文字的照片：已放入您选择使用的 $1 张", es: "Fotos con texto en japonés: se incluyeron las $1 que decidió usar" },
  { re: /^使わないと選んだ写真 (\d+)枚は入れていません$/, en: "The $1 photo(s) you chose not to use are not included", zh: "未放入您选择不使用的 $1 张照片", es: "No se incluyeron las $1 foto(s) que decidió no usar" },
  { re: /^関税：規制の画面の判定と一致（(\d+)か国）$/, en: "Duties: match the regulations screen ($1 countries)", zh: "关税：与法规页面的判定一致（$1 个国家）", es: "Aranceles: coinciden con la pantalla de normativa ($1 países)" },
  { re: /^(この保存した資料の)?「市場別の輸入要件」（(.+)枚目）の関税を、規制の画面の判定にそろえました：(.+)$/,
    en: (m) => (m[1] ? "In this saved deck, the " : "The ") + "duties in “Import requirements by market” (slide " + m[2] + ") were aligned with the regulations screen: " + m[3].replace(/要確認（([^）]*)）/g, "$1").replace(/要確認/g, "to be confirmed").replace(/（空）/g, "(blank)"),
    zh: (m) => (m[1] ? "已将此保存资料中" : "已将") + "“各市场进口要求”（第 " + m[2] + " 页）的关税统一为法规页面的判定：" + m[3].replace(/要確認（([^）]*)）/g, "$1").replace(/要確認/g, "待确认"),
    es: (m) => (m[1] ? "En esta presentación guardada, los " : "Los ") + "aranceles de «Requisitos de importación por mercado» (diapositiva " + m[2] + ") se alinearon con la pantalla de normativa: " + m[3].replace(/要確認（([^）]*)）/g, "$1").replace(/要確認/g, "por confirmar") },
  { re: /^(.+)の文が、(.+)の関税を言い切っています（規制の画面では要確認）：「([\s\S]*)」。この文を外すか、「もう一度作る」で作り直してから渡してください$/,
    en: (m) => "The text on " + m[1].replace(/枚目/g, "").replace(/・/g, ", ") + " states the duty for " + m[2] + " as fact (to be confirmed on the regulations screen): “" + m[3] + "”. Remove this text or recreate the deck before sending it",
    zh: (m) => m[1] + "的文字断定了" + m[2] + "的关税（法规页面为待确认）：“" + m[3] + "”。请删除此文字或重新制作后再交付",
    es: (m) => "El texto de " + m[1] + " afirma el arancel de " + m[2] + " (por confirmar en la pantalla de normativa): «" + m[3] + "». Quite el texto o vuelva a crear la presentación antes de enviarla" },
  { re: /^(.+)に関税の数字・無税の文があります：「([\s\S]*)」。規制の画面の判定（国ごと）と合っているか確かめてください$/,
    en: (m) => "There is text with a duty rate or duty-free claim on " + m[1] + ": “" + m[2] + "”. Check that it matches the regulations screen for each country",
    zh: (m) => m[1] + "有关税数字或免税的文字：“" + m[2] + "”。请确认是否与法规页面（各国）的判定一致",
    es: (m) => "Hay un texto con arancel o exención en " + m[1] + ": «" + m[2] + "». Compruebe que coincide con la pantalla de normativa de cada país" }
]);
v96dkDict([
  ["✓ 使う（日本語の文字あり）", "✓ Used (with Japanese text)", "✓ 使用（含日文文字）", "✓ En uso (con texto en japonés)"],
  ["✓ 加工して使う", "✓ Edited and used", "✓ 编辑后使用", "✓ Editada y en uso"],
  ["使わない（選んだ）", "Not used (your choice)", "不使用（已选择）", "No se usa (su elección)"],
  ["使うか下で選べます", "choose below whether to use it", "可在下方选择是否使用", "elija abajo si la usa"],
  ["⚠ 日本語の文字あり", "⚠ Japanese text", "⚠ 含日文文字", "⚠ Texto en japonés"]
]);
