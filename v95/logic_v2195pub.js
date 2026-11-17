/* ═══ 21.95 分野 pub（2026-11-17 決め D16＝No.501・大森さん「全部推奨」）＝ログイン画面の1行 ═══
   共通のコード（TRIAL-2026・FWD-2026・BC-MIDORI-24・BC-KAKO-77）とデモ用のコード（同期サーバーの DEMO_CODES）は、
   同期サーバーが名前を確かめない（記録の名前に「（自己申告）」を付ける＝同期サーバー d95）。そのことを、ログイン画面の
   「ご担当者名」の欄の下に1行で出す。
   ・共通のコード：入力した時点で出す（コードは公開しているもの）
   ・デモ用のコード：同期サーバーの lookup・login の答えの selfName:1 を見たら、そのコードでも出す（入力中に lookup は呼ばない＝
     存在しないコードの試行の数え〔loginFail_〕を増やさない）
   ・普通のコード：出さない
   土台と、ほかの層の関数は書き換えない（syncCall は控えてから包む）。 */
var V95PUB = window.V95PUB = { v: "21.95", seen: {}, n: { paint: 0, srv: 0 }, err: [] };
const V95PUB_CODES = { "TRIAL-2026": 1, "FWD-2026": 1, "BC-MIDORI-24": 1, "BC-KAKO-77": 1 };
function v95pubErr(k, e) { try { V95PUB.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95PUB.err.length > 20) V95PUB.err.shift(); } catch (x) { /* 無視 */ } }
function v95pubCode(s) { return String(s == null ? "" : s).replace(/[\s​-‍﻿]+/g, "").toUpperCase(); }
function v95pubText() {
  let l = "ja"; try { l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; } catch (e) { /* 無視 */ }
  return ({
    en: "With a trial code, your name is not verified (it is recorded as “self-reported”).",
    zh: "使用体验用代码时，不核对姓名（记录中会注明“自行申报”）。",
    es: "Con un código de prueba no se verifica el nombre (se registra como «autodeclarado»)."
  })[l] || "体験用のコードでは、お名前は確かめません（記録には「自己申告」と付きます）";
}
function v95pubPaint() {
  try {
    const ci = document.getElementById("lg-code"), ni = document.getElementById("lg-name");
    let el = document.getElementById("v95pubNote");
    if (!ci || !ni) { if (el) el.remove(); return; }
    const c = v95pubCode(ci.value), on = !!c && (!!V95PUB_CODES[c] || !!V95PUB.seen[c]);
    if (!on) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("p"); el.id = "v95pubNote"; el.className = "v95pub-note"; el.setAttribute("data-noi18n", "1"); el.setAttribute("role", "note"); }
    const after = document.getElementById("r9bLgHint") || ni;   /* スマホ幅で出る名前の欄の説明（r9b）があれば、その下 */
    if (el.previousElementSibling !== after) after.insertAdjacentElement("afterend", el);
    const t = v95pubText(); if (el.textContent !== t) el.textContent = t;
    V95PUB.n.paint++;
  } catch (e) { v95pubErr("paint", e); }
}
/* 同期サーバー d95 の lookup・login の答え（selfName:1）を覚える。そのとき欄にあるコードを、名前を確かめないコードとして扱う */
if (typeof syncCall === "function") {
  const __sc95pub = syncCall;
  syncCall = async function (op, body, opt) {
    const r = await __sc95pub.apply(this, arguments);
    try {
      if ((op === "lookup" || op === "login") && r && r.ok && +r.selfName === 1) {
        const ci = document.getElementById("lg-code"), c = ci ? v95pubCode(ci.value) : "";
        if (c) { V95PUB.seen[c] = 1; V95PUB.n.srv++; setTimeout(v95pubPaint, 0); }
      }
    } catch (e) { v95pubErr("sync", e); }
    return r;
  };
}
document.addEventListener("input", (e) => { if (e.target && e.target.id === "lg-code") v95pubPaint(); }, true);
document.addEventListener("change", (e) => { if (e.target && (e.target.id === "lg-code" || e.target.id === "lang")) setTimeout(v95pubPaint, 0); }, true);
try {
  /* ログイン画面は showLogin が描き直す（タブの切り替え・言語）。描き直したら付け直す */
  let t = 0;
  new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; v95pubPaint(); }, 120); }).observe(document.body || document.documentElement, { childList: true, subtree: true });
} catch (e) { v95pubErr("mo", e); }
window.addEventListener("resize", () => setTimeout(v95pubPaint, 50));
setTimeout(v95pubPaint, 0);
