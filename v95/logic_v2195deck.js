/* ═══ v21.95 deck（2026-11-17 改修一覧の週次レビュー・第6回 UAT）外国語営業資料・AIヒアリングの例文
   No.486（中）「営業資料の作成が終わりました」は、保存が終わってから出す
     原因：完了の表示（v90regToastStop）は「DK3G.run と V80DOC.run の両方が立っているか」だけを見る。DK3G.run は元の dk3Generate の finally で
           資料ができた時点で 0 になり、そのあと外側の層（dk14）が保存（dk14Save＝クラウドへ送る→一覧を読み直す）をする。保存の間に 1 秒ごとの
           描き直し（v90regToastPaint）が走ると「終わりました」が先に出る。作成中に dk3Generate がもう一度呼ばれたときも、内側がすぐ戻って
           一番外（v90 の層）の finally が完了を出していた。
     直し：一番外で dk3Generate を包み、その回の呼び出しが保存と一覧の読み直しまで終わるまで完了を出さない（作成中・保存中の表示にする）。
           終わったら、保存できたかで出し分ける（保存済み／この端末に控えた／作れなかった）。
   No.487（中）訳に失敗した項目：技術の言葉をやめ、「↻ 訳だけやり直す」ボタンを付ける（書いた文章はそのまま・訳だけやり直す＝force なし）
   No.491（中）納品レベルチェックの「建値・仕出港（FOB 横浜など）」を、登録の建値・仕出港から作る
   No.495（中）完成品の化粧品（美容液など）を「化粧品原料・素材」の型にしない（全成分表（INCI）の題だけで原料と決めない）
   No.503（低）文化・教育用品の AIヒアリング・業種ごとの項目の例文を、商品の種類（玩具・楽器・画材・文具・教材・工芸・書道）に合わせる
   No.509（中）「日本語の文字入り」などで写真が使えないとき、理由ごとの直し方と「入れ替える」ボタンを出す
   書き方：今のアプリの関数は前のものを控えてから包む。データ（登録の値）は書き換えない。失敗したら前の動きのまま。 */
var V95DK = { ver: "21.95", err: [], gen: null, last: null, ctxT: null };
function v95dkErr(k, e) { try { V95DK.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95DK.err.length > 30) V95DK.err.shift(); } catch (x) { } }
function v95dkLang() { try { return (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; } catch (e) { return "ja"; } }
function v95dkM(ja, en, zh, es) { const l = v95dkLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v95dkE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v95dkS(v) { try { if (typeof dk3S === "function") return dk3S(v); } catch (e) { } return String(v == null ? "" : v).trim(); }
function v95dkTen() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
function v95dkLN(lang) { try { return (DECK_L[lang] || {}).name || lang; } catch (e) { return lang; } }
function v95dkDict(rows) {
  try { if (typeof I18N === "undefined" || !I18N || !I18N.dict) return;
    rows.forEach(r => { ["en", "zh", "es"].forEach((l, i) => { if (r[i + 1] && I18N.dict[l] && !I18N.dict[l][r[0]]) I18N.dict[l][r[0]] = r[i + 1]; }); }); } catch (e) { v95dkErr("dict", e); }
}

/* ══ No.486 完了の表示は、保存（と一覧の読み直し）が終わってから ══ */
function v95dkToastEl() { try { return (typeof AIT !== "undefined" && AIT && AIT.el) || null; } catch (e) { return null; } }
function v95dkToastSet(att, ats, atm) {
  const d = v95dkToastEl(); if (!d) return;
  const t = d.querySelector(".att"), s = d.querySelector(".ats"), m = d.querySelector(".atm");
  if (t && att != null) { t.textContent = att; t.setAttribute("data-noi18n", "1"); }
  if (s && ats != null) { s.textContent = ats; s.setAttribute("data-noi18n", "1"); }
  if (m && atm != null) { m.textContent = atm; m.setAttribute("data-noi18n", "1"); }
}
/* 作成の回（一番外の呼び出し）がまだ終わっていない間の表示：作成中は前の層のまま、資料ができて保存している間は「保存しています」 */
function v95dkToastHold() {
  try {
    const d = v95dkToastEl();
    if (!d || !d.dataset.v90reg || (AIT.items && AIT.items.length) || AIT.hidden) return;
    if (typeof DK3G !== "undefined" && DK3G && DK3G.run) return; // まだ作成中（2回目の呼び出しなど）：完了は出さない
    clearTimeout(AIT.hideT);
    d.classList.remove("done"); d.classList.add("on");
    d.dataset.v95dk = "save";
    v95dkToastSet(v95dkM("💾 作った営業資料を保存しています", "💾 Saving the sales deck you made", "💾 正在保存制作好的营销资料", "💾 Guardando la presentación creada"),
      v95dkM("保存が終わると「保存した営業資料」に入り、ここに「終わりました」と出ます（閉じても保存は続きます）", "When saving is done it appears in “Saved sales decks” and this notice says it is finished (saving continues even if you close this)", "保存完成后会出现在“已保存的营销资料”中，这里也会显示“已完成”（关闭此提示也会继续保存）", "Al terminar de guardar aparecerá en «Presentaciones guardadas» y este aviso dirá que terminó (se sigue guardando aunque lo cierre)"), "");
  } catch (e) { v95dkErr("hold", e); }
}
if (typeof v90regToastStop === "function") {
  const __ts95 = v90regToastStop;
  V95DK.toastStop0 = __ts95;
  v90regToastStop = function () {
    try { if (V95DK.gen && !V95DK.gen.fin) { v95dkToastHold(); return; } } catch (e) { v95dkErr("tstop", e); }
    return __ts95.apply(this, arguments);
  };
}
function v95dkSavedOf(G) {
  try {
    const id = (typeof DK14 !== "undefined" && DK14) ? DK14.open : "";
    const items = (typeof DK14 !== "undefined" && DK14 && DK14.items) || [];
    const it = id ? items.find(x => x && x.id === id) : null;
    const lang = (it && it.lang) || G.lang;
    const n = items.filter(x => x && x.lang === lang).length;
    const max = (typeof DK14_MAX !== "undefined" && DK14_MAX) || 10;
    return { it, n, max, lang };
  } catch (e) { return { it: null, n: 0, max: 10, lang: G.lang }; }
}
function v95dkDone(G) {
  const d = v95dkToastEl();
  const shown = !!(d && d.dataset.v90reg && !(typeof AIT !== "undefined" && AIT && AIT.hidden));
  const stop0 = V95DK.toastStop0;
  let res = "none";
  try {
    const mine = typeof DK3G !== "undefined" && DK3G && (DK3G.at || 0) >= G.t0;
    const made = mine && DK3G.deck && DK3G.deck !== G.before && !DK3G.err;
    const S = v95dkSavedOf(G);
    res = mine && DK3G.err ? "err" : made && S.it && S.it.pending ? "pend" : made && S.it ? "ok" : made ? "made" : "none";
    G.res = res; G.saved = S; V95DK.last = G;
    if (d) delete d.dataset.v95dk;
    if (typeof stop0 === "function") stop0();
    if (!shown) return;
    if (res === "ok")
      v95dkToastSet(null, v95dkM("「保存した営業資料」の「" + v95dkLN(S.lang) + "」に保存しました（" + S.n + "／" + S.max + "件）。結果は「外国語 営業資料」の画面にあります",
        "Saved to “Saved sales decks” (" + v95dkLN(S.lang) + ": " + S.n + "/" + S.max + "). The result is on the “Foreign-language sales deck” screen",
        "已保存到“已保存的营销资料”（" + v95dkLN(S.lang) + "：" + S.n + "/" + S.max + "）。结果在“外语营销资料”页面",
        "Guardada en «Presentaciones guardadas» (" + v95dkLN(S.lang) + ": " + S.n + "/" + S.max + "). El resultado está en la pantalla «Presentación en otro idioma»"), "");
    else if (res === "pend") {
      v95dkToastSet(v95dkM("⚠ 資料はできましたが、クラウドに保存できませんでした", "⚠ The deck is ready, but it could not be saved to the cloud", "⚠ 资料已完成，但未能保存到云端", "⚠ La presentación está lista, pero no se pudo guardar en la nube"),
        v95dkM("この端末に控えました。次に「保存した営業資料」を開いたときに、自動で送り直します", "A copy is kept on this device and will be sent again automatically the next time you open “Saved sales decks”", "已在本设备保留副本，下次打开“已保存的营销资料”时会自动重新发送", "Se guardó una copia en este equipo y se volverá a enviar al abrir «Presentaciones guardadas»"), "");
      if (d) d.classList.remove("done");
    }
    else if (res === "err") {
      v95dkToastSet(v95dkM("⚠ 営業資料を作れませんでした", "⚠ The sales deck could not be made", "⚠ 未能制作营销资料", "⚠ No se pudo crear la presentación"),
        v95dkM("理由と、やり直し方は「外国語 営業資料」の画面の「営業資料を作る」の下に出ています", "The reason and how to retry are shown under “Create a sales deck” on the “Foreign-language sales deck” screen", "原因和重做方法显示在“外语营销资料”页面的“制作营销资料”下方", "El motivo y cómo reintentarlo aparecen bajo «Crear presentación» en la pantalla «Presentación en otro idioma»"), "");
      if (d) d.classList.remove("done");
    }
    if (d && (res === "ok" || res === "pend" || res === "err")) { clearTimeout(AIT.hideT); AIT.hideT = setTimeout(() => { try { d.classList.remove("on", "done"); AIT.hidden = 0; } catch (e) { } }, res === "ok" ? 4000 : 9000); }
  } catch (e) { v95dkErr("done", e); }
}
if (typeof dk3Generate === "function") {
  const __g95 = dk3Generate;
  dk3Generate = async function (lang, force) {
    /* 作成中の 2 回目の呼び出し：完了の表示には触らない（内側はすぐ戻る） */
    if (V95DK.gen || (typeof DK3G !== "undefined" && DK3G && DK3G.run)) return __g95.apply(this, arguments);
    const G = { lang, t0: Date.now(), before: (typeof DK3G !== "undefined" && DK3G) ? DK3G.deck : null, fin: 0 };
    V95DK.gen = G;
    try { return await __g95.apply(this, arguments); }
    finally {
      G.fin = 1; G.end = Date.now();
      if (V95DK.gen === G) V95DK.gen = null;
      v95dkDone(G);
    }
  };
}

/* ══ No.487 訳に失敗した項目：やさしい言葉と「↻ 訳だけやり直す」 ══ */
const V95DK_TR = {
  STEP0: "価格表・仕様・会社情報などを訳せませんでした（AIの応答が無い・形が不正。くり返し試しました）。日本語のまま載せています",
  STEP: "価格表・仕様・会社情報は、AI の訳が届かなかったため、日本語のまま載せました。下の「↻ 訳だけやり直す」でやり直せます",
  WHY: "価格表・仕様・会社情報などは、AI の訳が届かなかったため、日本語のまま載っています（AI が混み合っているときや、訳す量が多いときに起きます）。",
  FIX1: "下の「↻ 訳だけやり直す」を押すと、書いた文章はそのまま使い、訳だけをやり直します。",
  FIX2: "数分おいてから押すと通りやすくなります。"
};
v95dkDict([
  [V95DK_TR.STEP, "The price table, specifications and company information stayed in Japanese because the AI translation did not come back. Use “↻ Translate again” below to retry", "价格表・规格・公司信息因AI的翻译没有返回而保留为日语。可用下方的“↻ 只重新翻译”重试", "La tabla de precios, las especificaciones y los datos de la empresa quedaron en japonés porque no llegó la traducción de la IA. Use «↻ Traducir de nuevo» abajo para reintentar"],
  [V95DK_TR.WHY, "The price table, specifications, company information, etc. are still in Japanese because the AI translation did not come back (this happens when the AI is busy or there is a lot to translate).", "价格表・规格・公司信息等因AI的翻译没有返回，仍为日语（AI繁忙或翻译量大时会发生）。", "La tabla de precios, las especificaciones, los datos de la empresa, etc. siguen en japonés porque no llegó la traducción de la IA (ocurre cuando la IA está ocupada o hay mucho que traducir)."],
  [V95DK_TR.FIX1, "Press “↻ Translate again” below: the text already written is kept and only the translation is redone.", "点击下方的“↻ 只重新翻译”，已写好的文案保持不变，只重新翻译。", "Pulse «↻ Traducir de nuevo» abajo: se mantiene el texto ya escrito y solo se rehace la traducción."],
  [V95DK_TR.FIX2, "It usually goes through if you wait a few minutes before pressing it.", "隔几分钟再点击会更容易成功。", "Suele funcionar si espera unos minutos antes de pulsarlo."],
  ["↻ 訳だけやり直す", "↻ Translate again", "↻ 只重新翻译", "↻ Traducir de nuevo"],
  ["↻ もう一度作る（文章も書き直します）", "↻ Create again (the text is rewritten too)", "↻ 重新制作（文案也会重写）", "↻ Crear de nuevo (también se reescribe el texto)"]
]);
function v95dkPlanCached(T, lang) {
  try {
    const P = T && T.deck3 && T.deck3.plans && T.deck3.plans[lang];
    if (!P || !P.verified) return false;
    if (typeof dk3Corpus !== "function" || typeof djb2 !== "function" || typeof DK3_PIPE === "undefined") return true;
    const C = dk3Corpus(T);
    return P.key === djb2(C.key + "|" + lang + "|" + dk3Prods(T).length + "|" + DK3_PIPE);
  } catch (e) { return false; }
}
function v95dkTrFailed() {
  try {
    if (typeof DK3G === "undefined" || !DK3G || DK3G.run) return "";
    const u = DK3G.deck && DK3G.deck.v5326k;
    if (u && Array.isArray(u.why) && u.why.indexOf("TRFAIL") >= 0) return DK3G.deck.lang;
    const s = (DK3G.steps || []).find(x => x && x.k === "tr");
    if (s && s.st === "ng" && (s.d === V95DK_TR.STEP || s.d === V95DK_TR.STEP0)) return DK3G.lang || (DK3G.deck && DK3G.deck.lang) || "";
  } catch (e) { }
  return "";
}
function v95dkRetryBtn(lang) {
  const T = (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || v95dkTen();
  const cached = v95dkPlanCached(T, lang);
  const lb = cached ? "↻ 訳だけやり直す" : "↻ もう一度作る（文章も書き直します）";
  const tip = cached ? "照合済みの文章はそのまま使い、価格表・仕様・会社情報などの訳だけをやり直します" : "前回の文章の控えが無いため、文章から作り直します";
  return `<span class="v95dk-retrw"><button type="button" class="btn v95dk-retr" data-v95dkretr="${v95dkE(lang)}" data-v95dkfull="${cached ? "0" : "1"}" title="${v95dkE(tip)}">${v95dkE(lb)}</button></span>`;
}
if (typeof v5326kCheck === "function") {
  const __vc95 = v5326kCheck;
  v5326kCheck = function (deck, ctx, r) {
    const ret = __vc95.apply(this, arguments);
    try {
      const u = deck && deck.v5326k;
      if (u && Array.isArray(u.why) && u.why.indexOf("TRFAIL") >= 0 && u.t && typeof V5326K_WHY !== "undefined") {
        let t = String(u.t).split(V5326K_WHY.TRFAIL).join(V95DK_TR.WHY);
        if (u.fix === "RETRY" && u.why.indexOf("PLAN") < 0 && typeof V5326K_FIX !== "undefined") { t = t.split(V5326K_FIX.RETRY).join(V95DK_TR.FIX1 + V95DK_TR.FIX2); u.fix = "TRRETRY"; }
        u.t = t; u.v95 = 1;
        const c = ((r && r.crit) || []).find(x => x && x.k === "jp" && x.v5326k);
        if (c) c.t = t;
      }
    } catch (e) { v95dkErr("trck", e); }
    return ret;
  };
}
if (typeof dk3SetStep === "function") {
  const __ss95 = dk3SetStep;
  dk3SetStep = function (k, st, d) {
    const r = __ss95.apply(this, arguments);
    try {
      if (k === "tr" && typeof DK3G !== "undefined" && DK3G) {
        const s = (DK3G.steps || []).find(x => x && x.k === "tr");
        if (s && s.d === V95DK_TR.STEP0) { s.d = V95DK_TR.STEP; if (typeof dk3Paint === "function") dk3Paint(); }
      }
      if (k === "mat" && st === "ok" && v95dkLang() === "ja") {
        const P = v95dkPhotoBad(v95dkTen());
        const s = (DK3G.steps || []).find(x => x && x.k === "mat");
        if (s && P.jp.length && String(s.d || "").indexOf("日本語の文字") < 0) { s.d = String(s.d || "") + "（日本語の文字が目立つ写真 " + P.jp.length + "枚は使いません。直し方は「ロゴ・写真」の欄の下に出ています）"; if (typeof dk3Paint === "function") dk3Paint(); }
      }
    } catch (e) { v95dkErr("step", e); }
    return r;
  };
}
if (typeof dk3ProgHtml === "function") {
  const __ph95 = dk3ProgHtml;
  dk3ProgHtml = function () {
    let h = __ph95.apply(this, arguments);
    try {
      const lang = v95dkTrFailed();
      if (lang && typeof h === "string" && h && h.indexOf("data-v95dkretr") < 0) h += `<div class="v95dk-retrbox" role="note">${v95dkRetryBtn(lang)}</div>`;
    } catch (e) { v95dkErr("prog", e); }
    return h;
  };
}
if (typeof vDeck === "function") {
  const __vd95 = vDeck;
  vDeck = function () {
    let h = __vd95.apply(this, arguments);
    try {
      h = String(h);
      const d = typeof DK3G !== "undefined" && DK3G && DK3G.deck, u = d && d.v5326k;
      if (u && Array.isArray(u.why) && u.why.indexOf("TRFAIL") >= 0 && !DK3G.run && h.indexOf("v5326k-ban") >= 0) {
        h = h.replace(/(<div class="v5326k-ban[^"]*" role="alert"><b>[\s\S]*?<\/b><div>[\s\S]*?<\/div>)(<\/div>)/, (m, a, z) => a.indexOf("data-v95dkretr") >= 0 ? m : a + `<div class="v95dk-retrw2">${v95dkRetryBtn(d.lang)}</div>` + z);
      }
    } catch (e) { v95dkErr("vdeck", e); }
    return h;
  };
}
function v95dkRetryTr(lang, full) {
  try {
    if (typeof DK3G === "undefined" || !DK3G) return;
    if (DK3G.run) { if (typeof toast === "function") toast(v95dkM("資料を作っている間は押せません。終わってからお試しください", "You cannot press this while a deck is being made. Try again when it is finished", "制作资料期间无法点击，请完成后再试", "No se puede pulsar mientras se crea la presentación. Inténtelo cuando termine")); return; }
    const T = v95dkTen();
    if (DK3G.ten && T && DK3G.ten !== T && typeof dk3PKey === "function" && dk3PKey(DK3G.ten) !== dk3PKey(T)) { if (typeof toast === "function") toast(v95dkM("表示中の商品が、この資料の商品と違います。資料の商品に切り替えてから押してください", "The product shown is not the product of this deck. Switch to that product first", "当前显示的商品与该资料的商品不同，请先切换到该商品", "El producto mostrado no es el de esta presentación. Cambie a ese producto primero")); return; }
    if (typeof toast === "function") toast(full ? v95dkM("前回の文章の控えが無いため、文章から作り直します", "There is no saved text from last time, so the deck is made again from the text", "没有上次文案的记录，将从文案开始重新制作", "No hay texto guardado de la vez anterior; se crea de nuevo desde el texto")
      : v95dkM("書いた文章はそのまま使い、価格表・仕様・会社情報などの訳だけをやり直します", "The text already written is kept; only the price table, specifications, company information, etc. are translated again", "已写好的文案保持不变，只重新翻译价格表・规格・公司信息等", "Se mantiene el texto ya escrito; solo se traducen de nuevo la tabla de precios, las especificaciones, los datos de la empresa, etc."));
    try { if (DK3G.deck && typeof dk3FreeUrls === "function") dk3FreeUrls(DK3G.deck); } catch (e) { }
    DK3G.deck = null; DK3G.check = null;
    if (typeof logU === "function") try { logU("deck", "営業資料：訳だけやり直す（" + lang + "）"); } catch (e) { }
    dk3Generate(lang);
  } catch (e) { v95dkErr("retry", e); }
}
document.addEventListener("click", e => {
  try {
    const b = e.target && e.target.closest && e.target.closest("[data-v95dkretr]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    v95dkRetryTr(b.getAttribute("data-v95dkretr"), b.getAttribute("data-v95dkfull") === "1");
  } catch (x) { v95dkErr("click", x); }
}, true);

/* ══ No.491 「建値・仕出港」の項目名は、登録の建値・仕出港から ══ */
function v95dkTermName(T) {
  const cut = (s) => { s = v95dkS(s); return s.length > 24 ? s.slice(0, 24) + "…" : s; };
  const term = cut(T && T.term), pol = cut(T && T.pol);
  if (!term && !pol) return "建値・仕出港（例：FOB／横浜港）";
  if (term && pol) {
    const base = pol.replace(/(国際)?(空港|港)$/, "");
    return "建値・仕出港（" + (base && term.indexOf(base) >= 0 ? term : term + "／" + pol) + "）";
  }
  return term ? "建値・仕出港（" + term + "／仕出港は未登録）" : "建値・仕出港（建値は未登録／" + pol + "）";
}
if (typeof dk3Gate === "function") {
  const __gt95 = dk3Gate;
  dk3Gate = function () {
    const G = __gt95.apply(this, arguments);
    try {
      const T = v95dkTen();
      const g = (G || []).find(c => c && c.k === "term");
      if (g && T && /^建値・仕出港（/.test(String(g.n || ""))) g.n = v95dkTermName(T);
      /* No.509 写真の項目：日本語の文字で外した写真があるときは、直し方を添える（日本語の画面だけ。ほかの言語は前の訳のまま） */
      const p = (G || []).find(c => c && c.k === "photo");
      if (p && T && !p.ok && v95dkLang() === "ja") {
        const P = v95dkPhotoBad(T);
        if (P.jp.length && String(p.how || "").indexOf("日本語の文字") < 0)
          p.how = String(p.how || "") + "。日本語の文字が目立つため外した写真が " + P.jp.length + "枚あります：文字の写っていない写真に替えるか、文字の所を切り取ってから入れ直してください（「ロゴ・写真」の欄の下に直し方）";
      }
    } catch (e) { v95dkErr("gate", e); }
    return G;
  };
}
try {
  if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
    const portTr = (s, l) => { s = String(s || ""); try { const D = I18N.dict && I18N.dict[l]; if (D && D[s]) return D[s]; } catch (e) { } return s; };
    const part = (s, l) => String(s).split("／").map(x => x === "仕出港は未登録" ? ({ en: "port not registered", zh: "装运港未登记", es: "puerto sin registrar" })[l]
      : x === "建値は未登録" ? ({ en: "Incoterm not registered", zh: "贸易术语未登记", es: "Incoterm sin registrar" })[l] : portTr(x, l)).join(" / ");
    I18N.pat.unshift({ re: /^建値・仕出港（例：FOB／横浜港）$/, en: "Incoterms and port (e.g. FOB / Yokohama Port)", zh: "贸易术语・装运港（如 FOB／横滨港）", es: "Incoterm y puerto (p. ej. FOB / puerto de Yokohama)" });
    I18N.pat.push({ re: /^建値・仕出港（(.+)）$/, en: (m) => "Incoterms and port (" + part(m[1], "en") + ")", zh: (m) => "贸易术语・装运港（" + part(m[1], "zh") + "）", es: (m) => "Incoterm y puerto (" + part(m[1], "es") + ")" });
  }
} catch (e) { v95dkErr("i18n491", e); }

/* ══ No.495 完成品の化粧品は「化粧品・美容」の型 ══ */
const V95DK_RAW = /化粧品原料|原料メーカー|コスメ原料|エキス原料|原料エキス|原末|バルク|ingredient supplier|raw material|cosmetic ingredient|bulk/i;
const V95DK_FIN = /美容液|化粧水|乳液|クリーム|ローション|ジェル|オールインワン|美容オイル|フェイスオイル|洗顔|クレンジング|シャンプー|コンディショナー|トリートメント|シートマスク|フェイスマスク|フェイスパック|日焼け止め|ファンデーション|口紅|リップ|アイシャドウ|マスカラ|香水|ボディソープ|ハンドクリーム|serum|essence|lotion|toner|cream|emulsion|cleanser|cleansing|shampoo|conditioner|sheet mask|face mask|sunscreen|foundation|lipstick|perfume|body wash/i;
function v95dkCosFin(T) {
  try {
    if (!T) return null;
    const ps = (typeof dk3Prods === "function" ? dk3Prods(T) : [T]) || [T];
    /* 品名・英名・区分・キャッチ（成分表の題「全成分表（INCI）」は入れない＝完成品にも付く） */
    const nm = [T.cat, T.item, T.itemEn, T.tagline].concat(ps.map(t => [t && t.item, t && t.itemEn, t && t.cat].join(" "))).join(" ");
    if (V95DK_RAW.test(nm)) return null;
    const h = String(T.hs || "").replace(/[^\d]/g, ""), c4 = h.length >= 4 ? +h.slice(0, 4) : 0;
    const m = nm.match(V95DK_FIN);
    const hsFin = c4 >= 3303 && c4 <= 3307;
    if (!m && !hsFin) return null;
    return { word: m ? m[0] : "", hs: hsFin ? "HS " + h.slice(0, 4) : "" };
  } catch (e) { return null; }
}
try {
  if (typeof V85DK !== "undefined" && V85DK && typeof V85DK.cat === "function") {
    const __cat95 = V85DK.cat;
    V85DK.cat = function (T) {
      const r = __cat95.apply(this, arguments);
      try {
        if (!r || r.src === "manual" || r.k !== "cosmetic_ingredient" || typeof V85DK_CATS === "undefined" || !V85DK_CATS.cosmetics) return r;
        const t = T || (typeof v85dkTen === "function" ? v85dkTen() : v95dkTen());
        const F = v95dkCosFin(t);
        if (!F) return r;
        const why = String(r.why || "").split("・").filter(x => x && !/INCI|全成分/.test(x));
        if (F.hs && !why.some(x => x.indexOf(F.hs) === 0)) why.unshift(F.hs);
        if (F.word) why.push("品名「" + F.word + "」");
        return { k: "cosmetics", why: why.join("・") + "（完成品の化粧品。全成分表（INCI）は完成品にも付くため、原料の型にはしません）", src: r.src, v95: 1 };
      } catch (e) { v95dkErr("cat", e); }
      return r;
    };
  }
} catch (e) { v95dkErr("cat0", e); }

/* ══ No.503 文化・教育用品の例文を、商品の種類に合わせる ══ */
function v95dkCuSub(t) {
  if (!t) return "";
  const s = [t.item, t.itemEn, t.tagline, t.compTitle].filter(Boolean).join(" ");
  const hs = String(t.hs || "").replace(/[^\d]/g, "");
  if (/書道|習字|毛筆|calligraph/i.test(s)) return "calli";
  if (/玩具|おもちゃ|知育|パズル|積み木|積木|つみき|けん玉|独楽|ぬいぐるみ|人形|ボードゲーム|カードゲーム|\btoys?\b|puzzle|building blocks?|\bdolls?\b|plush|board game/i.test(s) || /^950[345]/.test(hs)) return "toy";
  if (/楽器|三味線|尺八|琴|箏|太鼓|篠笛|ギター|ウクレレ|ピアノ|バイオリン|instrument|shamisen|shakuhachi|koto|taiko|guitar|ukulele|violin/i.test(s) || /^92/.test(hs)) return "instr";
  if (/画材|絵具|絵の具|水彩|油彩|色鉛筆|クレヨン|パステル|岩絵具|スケッチブック|watercolou?r|paint set|crayon|colou?red pencil|pastel|sketchbook/i.test(s) || /^3213/.test(hs)) return "art";
  if (/文具|文房具|ノート|手帳|ボールペン|万年筆|鉛筆|消しゴム|定規|付箋|ふせん|stationery|notebook|ballpoint|fountain pen|pencil|eraser/i.test(s) || /^4820|^960[89]/.test(hs)) return "stat";
  if (/教材|教具|書籍|絵本|ドリル|学習|テキスト|textbook|picture book|workbook|educational|learning/i.test(s) || /^490[13]/.test(hs)) return "edu";
  if (/伝統工芸|工芸|漆|陶器|磁器|和紙|こけし|提灯|織物|染物|craft|lacquer|ceramic|washi/i.test(s)) return "craft";
  if (/筆|墨|硯|半紙|brush|inkstone/i.test(s) || /^9603/.test(hs)) return "calli";
  return "gen";
}
/* 例文（日本語・英語）。HS は見出しが確かなものだけ。工芸・そのほかは番号を書かない */
const V95DK_CU = {
  toy: { itemEn: { ex: ["例：Wooden Shape Puzzle Set (ages 3+)", "e.g. Wooden Shape Puzzle Set (ages 3+)"] },
    hs: { ex: ["例：9503.00（玩具・パズル）。分からなければ「不明」", "e.g. 9503.00 (toys and puzzles). If unsure, type “unknown”"] },
    priceRows: { ex: ["例：〜499個 US$12.00／500個〜 US$10.50", "e.g. up to 499 pcs US$12.00 / 500+ US$10.50"] },
    moq: { ex: ["例：100個", "e.g. 100 pcs"] },
    dimRows: { ex: ["例：単品（箱）250×250×45mm・520g／外装 520×520×300mm・11kg・20個入", "e.g. Unit (box) 250×250×45 mm, 520 g / Carton 520×520×300 mm, 11 kg, 20 pcs"] },
    compRows: { n: ["材質・対象年齢", "Materials / age range"], q: ["部品ごとの材質（木の種類・塗料・布など）と対象年齢を教えてください。<b>子ども向けの玩具は、相手国の安全の決まり（例：アメリカの ASTM F963、EU の CE マーク）に合っているかを聞かれます（国ごとに要確認）。</b>", "Please tell me the material of each part (type of wood, paint, fabric, etc.) and the age range. <b>Buyers of children's toys ask whether they meet the destination's toy safety rules (e.g. ASTM F963 in the US, CE marking in the EU; to be confirmed per country).</b>"] },
    strengths: { ex: ["例：国産の木を使用／角を丸く仕上げ、水性の塗料で塗装／保育園・幼稚園での採用実績あり", "e.g. Made of Japanese wood / Rounded edges, water-based paint / Used in nurseries and kindergartens"] },
    cert: { ex: ["例：ST マーク（日本の玩具の安全基準）／FSC 認証（木）／相手国の安全規格（ASTM F963・CE など）は要確認", "e.g. ST mark (Japanese toy safety standard) / FSC (wood) / Destination safety standards (ASTM F963, CE, etc.) to be confirmed"] },
    F: { cuMaterial: "例：本体＝ブナ材（天然木）、塗料＝水性塗料、袋＝綿の布（検疫・材質の確認に使う）", cuAge: "例：3歳以上・ST マーク（相手国の CE／ASTM は要確認）", cuLang: "例：英語の説明書（遊び方）つき" } },
  instr: { itemEn: { ex: ["例：Shamisen for Beginners (with soft case)", "e.g. Shamisen for Beginners (with soft case)"] },
    hs: { ex: ["例：9202.90（三味線・ギターなどの弦楽器）。分からなければ「不明」", "e.g. 9202.90 (string instruments such as shamisen and guitars). If unsure, type “unknown”"] },
    priceRows: { ex: ["例：〜9本 US$480／10本〜 US$430", "e.g. up to 9 units US$480 / 10+ US$430"] },
    moq: { ex: ["例：5本", "e.g. 5 units"] },
    dimRows: { ex: ["例：単品（ケース入り）1,000×250×120mm・3.2kg／外装 1,050×560×280mm・15kg・4本入", "e.g. Unit (in case) 1,000×250×120 mm, 3.2 kg / Carton 1,050×560×280 mm, 15 kg, 4 units"] },
    compRows: { n: ["素材・仕様表", "Materials / specs"], q: ["部品ごとの素材（木・皮・弦など。天然の素材は種類まで）と、付属品を教えてください。<b>動物の皮・象牙・べっ甲・一部の木材などは、ワシントン条約などで輸出入の許可が要ることがあります（要確認）。</b>", "Please tell me the material of each part (wood, skin, strings, etc.; give the species for natural materials) and the accessories. <b>Animal skin, ivory, tortoiseshell and some woods may need permits under CITES and other rules (to be confirmed).</b>"] },
    strengths: { ex: ["例：職人が一本ずつ仕上げ／初心者向けの英語の教本つき／修理・部品の取り寄せに対応", "e.g. Finished one by one by craftsmen / English beginner's guide included / Repairs and spare parts available"] },
    cert: { ex: ["例：伝統的工芸品の指定（該当時）／素材の証明（ワシントン条約の対象かどうか）", "e.g. Traditional craft designation (if any) / Proof of materials (whether CITES applies)"] },
    F: { cuMaterial: "例：胴＝木、皮＝合成皮革、弦＝ナイロン（天然の皮・木は種類まで。ワシントン条約の確認に使う）", cuAge: "例：対象年齢なし（大人向け）", cuLang: "例：英語の教本・動画つき" } },
  art: { itemEn: { ex: ["例：Japanese Watercolor Paint Set (24 colors)", "e.g. Japanese Watercolor Paint Set (24 colors)"] },
    hs: { ex: ["例：3213.10（絵の具のセット）。分からなければ「不明」", "e.g. 3213.10 (colours in sets). If unsure, type “unknown”"] },
    priceRows: { ex: ["例：〜499セット US$18.00／500セット〜 US$16.00", "e.g. up to 499 sets US$18.00 / 500+ US$16.00"] },
    moq: { ex: ["例：100セット", "e.g. 100 sets"] },
    dimRows: { ex: ["例：単品（箱）220×160×30mm・350g／外装 480×350×330mm・9kg・24セット入", "e.g. Unit (box) 220×160×30 mm, 350 g / Carton 480×350×330 mm, 9 kg, 24 sets"] },
    compRows: { n: ["セット内容・成分表", "Contents / ingredients"], q: ["セットの内容と、絵の具・顔料などの成分を教えてください。<b>子ども向けの画材は、重金属などの安全の試験を聞かれることがあります（要確認）。</b>", "Please tell me what is in the set and the ingredients of the paints and pigments. <b>For children's art supplies, buyers may ask for safety tests such as heavy metals (to be confirmed).</b>"] },
    strengths: { ex: ["例：発色のよい顔料／重ね塗りしやすい／美術教室のまとめ買いに対応", "e.g. Vivid pigments / Easy to layer / Bulk orders for art classes"] },
    cert: { ex: ["例：安全の試験の成績書（重金属など）／子ども向けは相手国の規格（要確認）", "e.g. Safety test report (heavy metals, etc.) / Destination standards for children's items (to be confirmed)"] },
    F: { cuMaterial: "例：絵の具＝顔料・アラビアガム、パレット＝プラスチック（成分・材質の確認に使う）", cuAge: "例：6歳以上（相手国の安全規格は要確認）", cuLang: "例：英語の使い方の説明つき" } },
  stat: { itemEn: { ex: ["例：A5 Dot Grid Notebook (Japanese paper)", "e.g. A5 Dot Grid Notebook (Japanese paper)"] },
    hs: { ex: ["例：4820.10（ノート・手帳）／9608.10（ボールペン）。分からなければ「不明」", "e.g. 4820.10 (notebooks, diaries) / 9608.10 (ballpoint pens). If unsure, type “unknown”"] },
    priceRows: { ex: ["例：〜999冊 US$3.20／1,000冊〜 US$2.80", "e.g. up to 999 pcs US$3.20 / 1,000+ US$2.80"] },
    moq: { ex: ["例：500冊", "e.g. 500 pcs"] },
    dimRows: { ex: ["例：単品 210×148×10mm・150g／外装 450×320×230mm・12kg・80冊入", "e.g. Unit 210×148×10 mm, 150 g / Carton 450×320×230 mm, 12 kg, 80 pcs"] },
    compRows: { n: ["素材・仕様表", "Materials / specs"], q: ["素材（紙・表紙・インクなど）と、サイズ・ページ数などの仕様を教えてください。", "Please tell me the materials (paper, cover, ink, etc.) and specs such as size and number of pages."] },
    strengths: { ex: ["例：にじみにくい国産の紙／180度開く製本／名入れは300冊から", "e.g. Bleed-resistant Japanese paper / Lies flat at 180° / Custom printing from 300 pcs"] },
    cert: { ex: ["例：FSC 認証（紙）／子ども向けは安全規格（要確認）", "e.g. FSC (paper) / Safety standards for children's items (to be confirmed)"] },
    F: { cuMaterial: "例：中紙＝国産の上質紙、表紙＝布クロス（材質の確認に使う）", cuAge: "例：対象年齢なし（子ども向けは安全規格を要確認）", cuLang: "例：英語の説明つき（パッケージ）" } },
  edu: { itemEn: { ex: ["例：Picture Book for Learning Japanese (English edition)", "e.g. Picture Book for Learning Japanese (English edition)"] },
    hs: { ex: ["例：4901.99（本・冊子）／4903.00（子ども向けの絵本）。分からなければ「不明」", "e.g. 4901.99 (books) / 4903.00 (children's picture books). If unsure, type “unknown”"] },
    priceRows: { ex: ["例：〜499冊 US$9.50／500冊〜 US$8.50", "e.g. up to 499 copies US$9.50 / 500+ US$8.50"] },
    moq: { ex: ["例：200冊", "e.g. 200 copies"] },
    dimRows: { ex: ["例：単品 257×182×10mm・320g／外装 400×280×250mm・14kg・40冊入", "e.g. Unit 257×182×10 mm, 320 g / Carton 400×280×250 mm, 14 kg, 40 copies"] },
    compRows: { n: ["内容・仕様表", "Contents / specs"], q: ["内容（対象・ページ数・言語）と、紙・印刷などの仕様を教えてください。", "Please tell me the contents (target readers, pages, languages) and specs such as paper and printing."] },
    strengths: { ex: ["例：日本の学校で使われている内容／英語の訳つき／教室用のまとめ買いに対応", "e.g. Content used in Japanese schools / English translation included / Classroom bulk orders"] },
    cert: { ex: ["例：教材としての採用・推薦（あれば）／FSC 認証（紙）", "e.g. Adoption or endorsement as teaching material (if any) / FSC (paper)"] },
    F: { cuMaterial: "例：本文＝再生紙、表紙＝コート紙（材質の確認に使う）", cuAge: "例：6〜10歳向け", cuLang: "例：日本語と英語の対訳" } },
  craft: { itemEn: { ex: ["例：Handmade Japanese Paper Lantern", "e.g. Handmade Japanese Paper Lantern"] },
    hs: { ex: ["例：6桁の番号（素材と使い方で決まります。分からなければ「不明」）", "e.g. a 6-digit code (it depends on the material and use; if unsure, type “unknown”)"] },
    priceRows: { ex: ["例：〜99個 US$35.00／100個〜 US$31.00", "e.g. up to 99 pcs US$35.00 / 100+ US$31.00"] },
    moq: { ex: ["例：50個", "e.g. 50 pcs"] },
    dimRows: { ex: ["例：単品（箱）300×300×400mm・600g／外装 640×640×420mm・6kg・4個入", "e.g. Unit (box) 300×300×400 mm, 600 g / Carton 640×640×420 mm, 6 kg, 4 pcs"] },
    compRows: { n: ["素材・仕様表", "Materials / specs"], q: ["部品ごとの素材（木・竹・紙・漆など。天然の素材は種類まで）と、作り方を教えてください。<b>天然の木・竹などは、相手国の検疫で確かめられることがあります（要確認）。</b>", "Please tell me the material of each part (wood, bamboo, paper, lacquer, etc.; give the species for natural materials) and how it is made. <b>Natural wood and bamboo may be checked by the destination's quarantine (to be confirmed).</b>"] },
    strengths: { ex: ["例：産地の職人による手作り／一点ずつ風合いが違う／名入れ・別注に対応", "e.g. Handmade by local craftsmen / Each piece is unique / Custom orders available"] },
    cert: { ex: ["例：伝統的工芸品の指定（該当時）／素材の証明", "e.g. Traditional craft designation (if any) / Proof of materials"] },
    F: { cuMaterial: "例：骨＝竹、紙＝和紙、仕上げ＝柿渋（検疫・材質の確認に使う）", cuAge: "例：対象年齢なし（インテリア用）", cuLang: "例：英語の取扱説明つき" } },
  gen: { itemEn: { ex: ["例：英語の商品名（何か・素材・サイズが分かる名前）", "e.g. an English product name that says what it is, the material and the size"] },
    hs: { ex: ["例：6桁の番号（分からなければ「不明」）", "e.g. a 6-digit code (if unsure, type “unknown”)"] },
    priceRows: { ex: ["例：〜99個 US$10.00／100個〜 US$9.00", "e.g. up to 99 pcs US$10.00 / 100+ US$9.00"] },
    moq: { ex: ["例：100個", "e.g. 100 pcs"] },
    dimRows: { ex: ["例：単品（箱）200×150×50mm・300g／外装 420×320×260mm・7kg・20個入", "e.g. Unit (box) 200×150×50 mm, 300 g / Carton 420×320×260 mm, 7 kg, 20 pcs"] },
    compRows: { n: ["内容・素材表", "Contents / materials"], q: ["セットの内容と、部品ごとの素材を教えてください。天然の素材（木・竹・動物の毛など）は種類まで書くと、相手国での確認が速くなります。", "Please tell me what is in the set and the material of each part. Giving the species of natural materials (wood, bamboo, animal hair, etc.) speeds up checks in the destination."] },
    strengths: { ex: ["例：国内で作っている／英語の説明つき／まとめ買いに対応", "e.g. Made in Japan / English instructions included / Bulk orders available"] },
    cert: { ex: ["例：素材の証明・試験の成績書（あれば）／子ども向けは安全規格（要確認）", "e.g. Proof of materials / test reports (if any) / Safety standards for children's items (to be confirmed)"] },
    F: { cuMaterial: "例：本体＝木、袋＝布（天然の素材は種類まで。検疫・材質の確認に使う）", cuAge: "例：対象年齢なし／子ども向けは年齢と安全規格（要確認）", cuLang: "例：英語の説明書つき" } }
};
function v95dkIsCulture(p) {
  try { if (typeof window.v92upKindOf === "function") return window.v92upKindOf(p) === "culture"; } catch (e) { }
  return !!p && String(p.cat || "").trim() === "文化・教育用品";
}
if (typeof v68hearTxOf === "function") {
  const __tx95 = v68hearTxOf;
  v68hearTxOf = function (k, p) {
    const base = __tx95.apply(this, arguments);
    try {
      const t = p === undefined ? v95dkTen() : p;
      if (!t || !v95dkIsCulture(t)) return base;
      const sk = v95dkCuSub(t), X = V95DK_CU[sk] && V95DK_CU[sk][k];
      if (!X) return base;
      const i = v95dkLang() === "ja" ? 0 : 1, o = Object.assign({}, base || {});
      Object.keys(X).forEach(f => { o[f] = X[f][i]; });
      return o;
    } catch (e) { v95dkErr("hear", e); }
    return base;
  };
}
/* 業種ごとの項目（④）の例：表示中の商品の種類で変える（ex を読むときに決める） */
function v95dkCuCtx() { try { return V95DK.ctxT || (typeof v68pTen === "function" && v68pTen()) || v95dkTen(); } catch (e) { return v95dkTen(); } }
try {
  if (typeof V68P_G !== "undefined" && V68P_G && V68P_G.v92culture && Array.isArray(V68P_G.v92culture.f)) {
    V68P_G.v92culture.f.forEach(f => {
      if (!f || f.v95) return;
      let ex0 = f.ex;
      Object.defineProperty(f, "ex", { configurable: true, enumerable: true,
        get() { try { const t = v95dkCuCtx(); const sk = t ? v95dkCuSub(t) : ""; const F = sk && V95DK_CU[sk] && V95DK_CU[sk].F; if (F && F[f.k]) return F[f.k]; } catch (e) { } return ex0; },
        set(v) { ex0 = v; /* ほかの層が書き換えたときは、書道などの基本の例として持つ */ } });
      f.v95 = 1;
    });
  }
} catch (e) { v95dkErr("cuF", e); }
if (typeof v68pFieldRow === "function") {
  const __fr95 = v68pFieldRow;
  v68pFieldRow = function (t) { const s = V95DK.ctxT; V95DK.ctxT = t || s; try { return __fr95.apply(this, arguments); } finally { V95DK.ctxT = s; } };
}
try {
  if (typeof V68ATTR !== "undefined" && V68ATTR && typeof V68ATTR.defs === "function") {
    const __df95 = V68ATTR.defs;
    V68ATTR.defs = function (t) { const s = V95DK.ctxT; V95DK.ctxT = t || s; try { return __df95.apply(this, arguments); } finally { V95DK.ctxT = s; } };
  }
} catch (e) { v95dkErr("defs", e); }

/* ══ No.509 使えない写真：理由ごとの直し方と「入れ替える」 ══ */
function v95dkPhotoBad(T) {
  const out = { all: [], jp: [], good: 0 };
  try {
    const A = (T && T.assets) || {};
    (A.ph || []).forEach((o, i) => {
      if (!o || !o.b64 || o.other) return;
      let good = false; try { good = typeof dkPhGood === "function" && dkPhGood(o); } catch (e) { }
      if (good) { out.good++; return; }
      let q = { big: true, ratioOk: true }; try { if (typeof dkImgLocalQ === "function") q = dkImgLocalQ(o) || q; } catch (e) { }
      const k = o._dq && o._dq.jp ? "jp" : o._dq && o._dq.low ? "low" : o._dq && o._dq.ok === false ? "ng" : !q.big ? "small" : !q.ratioOk ? "ratio" : "";
      if (!k) return; // AI の検査がまだ（直し方は出さない）
      const x = { i, k, reason: String((o._dq && o._dq.reason) || "").slice(0, 40) };
      out.all.push(x); if (k === "jp") out.jp.push(x);
    });
  } catch (e) { v95dkErr("phbad", e); }
  return out;
}
const V95DK_PHFIX = {
  jp: ["画像の中に日本語の文字（商品名・説明・値札など）が目立って写っています", "海外のバイヤー向けの資料では、日本語の文字が目立つ写真は使いません。直し方：① 文字の写っていない写真（商品だけ・使っている場面）に替える　② スマホの写真の「編集」→「切り取り」で文字の所を切り落としてから入れ直す　③ パッケージの文字がどうしても写るときは、少し離れて商品全体を撮る"],
  low: ["写真がぼやけています", "直し方：ピントの合った明るい写真に替えてください（スマホなら、商品をタップしてピントを合わせてから撮る）"],
  ng: ["AI が商品写真に向かないと判定しました", "直し方：商品がはっきり、大きく写った写真に替えてください"],
  small: ["写真が小さすぎます（短い辺が 420px 未満）", "直し方：スマホやカメラで撮った元の大きさの写真を入れてください（Web やメールで小さくなった画像は使えません）"],
  ratio: ["横長・縦長すぎる写真です（バナーの形）", "直し方：商品が真ん中に写った、普通の形（横長 4:3 など）の写真に替えてください"]
};
function v95dkPhGuideHtml(T) {
  const P = v95dkPhotoBad(T);
  if (!P.all.length) return "";
  const by = {};
  P.all.forEach(x => { (by[x.k] = by[x.k] || []).push(x); });
  const need = 3;
  const rows = Object.keys(V95DK_PHFIX).filter(k => by[k]).map(k => {
    const L = by[k];
    const nm = L.map(x => "商品写真" + (x.i + 1)).join("・");
    const why = k === "ng" && L[0].reason ? V95DK_PHFIX.ng[0] + "（" + L[0].reason + "）" : V95DK_PHFIX[k][0];
    const btns = L.map(x => `<button type="button" class="btn g v95dk-phrep" data-v95dkphrep="ph${x.i}">${v95dkE("商品写真" + (x.i + 1) + "を入れ替える")}</button>`).join("");
    const fx = String(V95DK_PHFIX[k][1]).split(/　(?=[②③])/).map(v95dkE).join("<br>");
    return `<li data-v95dkphk="${k}"><b>${v95dkE(nm + "：" + why)}</b><span>${fx}</span><span class="v95dk-phbtns">${btns}</span></li>`;
  }).join("");
  const head = "📷 資料に使えない写真が " + P.all.length + "枚あります（使える写真 " + P.good + "枚／必要 " + need + "枚以上）";
  return `<div class="c v95dk-phg" data-v95dkph="1" role="note" data-noi18n="1"><h3>${v95dkE(head)}</h3><ul class="v95dk-phl">${rows}</ul><p class="nn">${v95dkE("入れ直すと、AI がもう一度確かめます。使える写真が " + need + "枚以上そろうと、「納品品質の写真」を満たします（作り直すと資料に入ります）。")}</p></div>`;
}
if (typeof deckAssetCard === "function") {
  const __ac95 = deckAssetCard;
  deckAssetCard = function () {
    const h = __ac95.apply(this, arguments);
    try { if (v95dkLang() !== "ja") return h; const g = v95dkPhGuideHtml(v95dkTen()); return g ? String(h) + g : h; } catch (e) { v95dkErr("asset", e); }
    return h;
  };
}
document.addEventListener("click", e => {
  try {
    const b = e.target && e.target.closest && e.target.closest("[data-v95dkphrep]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const key = b.getAttribute("data-v95dkphrep");
    const inp = document.querySelector('input[type="file"][data-dkup="' + key + '"]');
    if (inp) inp.click();
    else if (typeof toast === "function") toast("上の「ロゴ・商品写真」の欄の「変更」から入れ替えてください");
  } catch (x) { v95dkErr("phclick", x); }
}, true);
if (typeof dk3Check === "function") {
  const __ck95 = dk3Check;
  dk3Check = function (deck) {
    const r = __ck95.apply(this, arguments);
    try {
      const T = (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || v95dkTen();
      const P = v95dkPhotoBad(T);
      if (r && Array.isArray(r.warn) && P.jp.length && !r.warn.some(w => w && w.k === "v95ph"))
        r.warn.push({ k: "v95ph", t: "商品写真 " + P.jp.length + "枚は、画像の中の日本語の文字が目立つため資料に使いませんでした。文字の写っていない写真に替えるか、文字の所を切り取ってから「ロゴ・写真」で入れ直し、もう一度作ってください" });
    } catch (e) { v95dkErr("ck", e); }
    return r;
  };
}
try {
  if (typeof I18N !== "undefined" && Array.isArray(I18N.pat))
    I18N.pat.unshift({ re: /^商品写真 (\d+)枚は、画像の中の日本語の文字が目立つため資料に使いませんでした。文字の写っていない写真に替えるか、文字の所を切り取ってから「ロゴ・写真」で入れ直し、もう一度作ってください$/,
      en: "$1 product photo(s) were not used because Japanese text stands out in the image. Replace them with photos without text, or crop out the text and upload again in “Logo & photos”, then create the deck again",
      zh: "有 $1 张商品照片因图片中日文文字过于显眼而未使用。请换成没有文字的照片，或裁掉文字部分后在“标志・照片”中重新上传，再重新制作",
      es: "$1 foto(s) del producto no se usaron porque destaca texto en japonés. Cámbielas por fotos sin texto, o recorte el texto y vuelva a subirlas en «Logo y fotos», y cree la presentación de nuevo" });
} catch (e) { v95dkErr("i18n509", e); }
