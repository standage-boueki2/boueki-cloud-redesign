/* ═══ 21.97.2 分野 misc（2026-11-18 シートの No.534 の詳細で分かったもの）＝外国語営業資料の画面を開いたときの「自動生成」の札 ═══
   ・No.534（英語資料の自動生成ウィジェットが画面を開くと毎回自動開始し、90秒後に消えて保存 0件）
     原因：外国語営業資料の画面を開くと、まだ確かめていない商品写真を AI に1枚ずつ見せる確認（dkImgAudit）が自動で走る。
     その AI の依頼文に「英語営業資料」という言葉があるため、右下の「AI商社マンが考え中…」の札の見出しを決める aiThinkLabel が
     「営業資料を作成しています」と出していた。実際には資料は作っていない（写真の確認だけ）ので、終わると札が消え、保存される資料は無い。
     また、確認が途中で1枚失敗すると残りを確かめずに終わり、次に画面を開くたびに同じ確認がまた自動で始まっていた。
     直し：①写真の確認の札は「営業資料に使う商品写真を確かめています（資料はまだ作りません）」と出す。
           ②終わったら「商品写真の確認が終わりました：使える N枚・確かめが要る M枚。資料は『AIが資料を生成』で作ります」と知らせる。
           ③確かめた結果を写真ごと（中身の指紋）に覚え、同じ写真は次から AI に聞き直さない。
           ④失敗したときは、30分は画面を開くたびに自動では始めず、「写真をもう一度確かめる」で始められる（失敗を知らせる）。
   土台・前の層は書き換えず、関数を控えてから包む。 */
var V97M = window.V97M = { v: "21.97.2", err: [], n: { lab: 0, run: 0, skip: 0, cached: 0, saved: 0, fail: 0 }, failAt: 0, force: 0 };
var V97M_PHQ = /「商品写真」として使えるか判定してください|あわせて jp（画像に重ねた日本語の/;
var V97M_CK = "bc20_v97_phq";
function v97mErr(k, e) { try { V97M.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97M.err.length > 30) V97M.err.shift(); } catch (x) { /* 無視 */ } }
function v97mLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v97mM(ja, en, zh, es) { const l = v97mLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }

/* ① 札の見出し */
if (typeof aiThinkLabel === "function") {
  const __lab97m = aiThinkLabel;
  aiThinkLabel = function (q) {
    try {
      if (typeof q === "string" && V97M_PHQ.test(q)) { V97M.n.lab++; return "営業資料に使う商品写真を確かめています（資料はまだ作りません）"; }
    } catch (e) { v97mErr("lab", e); }
    return __lab97m.apply(this, arguments);
  };
}
/* 札の文は I18N の表で訳す（英・中・西） */
try {
  if (typeof I18N_ROWS2 !== "undefined" && Array.isArray(I18N_ROWS2)) {
    I18N_ROWS2.push(["営業資料に使う商品写真を確かめています（資料はまだ作りません）", "Checking the product photos for the sales deck (no deck is being made yet)", "正在确认营销资料用的商品照片（尚未制作资料）", "Comprobando las fotos del producto para el material (aún no se crea el material)"]);
  }
} catch (e) { v97mErr("i18n", e); }

/* ③ 写真ごとの確認の結果を覚える（中身の指紋＝長さ＋間引いた文字の FNV-1a） */
function v97mFp(b64) {
  try {
    const s = String(b64 || ""); if (!s) return "";
    let h = 0x811c9dc5; const step = Math.max(1, Math.floor(s.length / 4096));
    for (let i = 0; i < s.length; i += step) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return s.length.toString(36) + "." + h.toString(36);
  } catch (e) { return ""; }
}
function v97mCache() { try { return JSON.parse(localStorage.getItem(V97M_CK) || "{}") || {}; } catch (e) { return {}; } }
function v97mCacheSave(c) {
  try {
    const ks = Object.keys(c); if (ks.length > 300) ks.sort((a, b) => (c[a].t || 0) - (c[b].t || 0)).slice(0, ks.length - 300).forEach(k => delete c[k]);
    localStorage.setItem(V97M_CK, JSON.stringify(c));
  } catch (e) { v97mErr("csave", e); }
}
function v97mPhotos() { try { const A = typeof dkAssets === "function" ? dkAssets() : null; return ((A && A.ph) || []).filter(o => o && o.b64); } catch (e) { return []; } }
function v97mApplyCache() {
  let n = 0;
  try {
    const C = v97mCache();
    v97mPhotos().forEach(o => { if (o._dq) return; const f = v97mFp(o.b64), x = f && C[f]; if (x && x.dq) { o._dq = Object.assign({}, x.dq); n++; } });
    if (n) { V97M.n.cached += n; try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ } }
  } catch (e) { v97mErr("apply", e); }
  return n;
}
function v97mStoreCache() {
  try {
    const C = v97mCache(); let n = 0;
    v97mPhotos().forEach(o => { if (!o._dq) return; const f = v97mFp(o.b64); if (!f) return; C[f] = { dq: o._dq, t: Date.now() }; n++; });
    if (n) { v97mCacheSave(C); V97M.n.saved += n; }
  } catch (e) { v97mErr("store", e); }
}
function v97mToast(s) { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } }

/* ②④ 確認の前後 */
if (typeof dkImgAudit === "function") {
  const __au97m = dkImgAudit;
  dkImgAudit = async function () {
    try {
      v97mApplyCache();
      const todo = v97mPhotos().filter(o => !o._dq);
      if (!todo.length) return __au97m.apply(this, arguments);
      try { if (typeof __dkAudit !== "undefined" && __dkAudit) return; } catch (e) { /* 無視 */ }   /* 確認中に重ねて呼ばれた（数えない） */
      if (!V97M.force && V97M.failAt && Date.now() - V97M.failAt < 30 * 60000) { V97M.n.skip++; return; }
      V97M.force = 0;
      const ready = (typeof ppReady === "function" && ppReady());
      const r = await __au97m.apply(this, arguments);
      if (!ready) return r;
      const left = v97mPhotos().filter(o => !o._dq).length, done = todo.length - left;
      v97mStoreCache();
      V97M.n.run++;
      const P = v97mPhotos(), good = P.filter(o => typeof dkPhGood === "function" ? dkPhGood(o) : false).length, need = P.length - good;
      if (left > 0) {
        V97M.failAt = Date.now(); V97M.n.fail++;
        v97mToast(v97mM(`商品写真の確認：${done}枚は確かめましたが、${left}枚は AI の応答が無く確かめられませんでした。この画面の上の「写真をもう一度確かめる」で確かめ直せます（資料はまだ作っていません）`,
          `Photo check: ${done} checked, ${left} could not be checked (no AI response). Use “Check the photos again” at the top of this screen (no deck has been made yet).`));
      } else if (done > 0) {
        V97M.failAt = 0;
        v97mToast(v97mM(`商品写真の確認が終わりました：使える ${good}枚・確かめが要る ${need}枚。営業資料は「AIが資料を生成」で言語を選んで作ります`,
          `Photo check finished: ${good} usable, ${need} need a decision. Make the sales deck from “AI generates the deck” by choosing a language.`));
      }
      try { if (typeof render === "function") render(); } catch (e) { /* 無視 */ }
      return r;
    } catch (e) { v97mErr("audit", e); return __au97m.apply(this, arguments); }
  };
}
/* 「写真をもう一度確かめる」：失敗したあとの待ちを外して1回だけ確かめる */
window.v97mPhRecheck = function () { V97M.force = 1; V97M.failAt = 0; try { return dkImgAudit(); } catch (e) { v97mErr("recheck", e); } };
document.addEventListener("click", (ev) => {
  try {
    const b = ev.target && ev.target.closest && ev.target.closest("[data-v97mphre]");
    if (!b) return;
    ev.preventDefault(); window.v97mPhRecheck();
  } catch (e) { v97mErr("click", e); }
}, true);
/* 失敗したあとは、外国語営業資料の画面の上に「写真をもう一度確かめる」を出す */
if (typeof vDeck === "function") {
  const __vd97m = vDeck;
  vDeck = function () {
    let h = __vd97m.apply(this, arguments);
    try {
      if (!V97M.failAt || Date.now() - V97M.failAt > 30 * 60000) return h;
      const left = v97mPhotos().filter(o => !o._dq).length;
      if (!left) return h;
      const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const box = `<div class="v97m-ph" role="status" data-noi18n><span>${E(v97mM(`商品写真 ${left}枚は、AI の応答が無く確かめられていません（自動では30分は確かめ直しません）。`, `${left} product photo(s) could not be checked (no AI response; not retried automatically for 30 minutes).`))}</span> <button type="button" class="btn g" data-v97mphre="1">${E(v97mM("写真をもう一度確かめる", "Check the photos again"))}</button></div>`;
      h = box + String(h);
    } catch (e) { v97mErr("vdeck", e); }
    return h;
  };
}
