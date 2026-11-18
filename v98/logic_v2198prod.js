/* ═══ v21.98 prod（2026-11-18 第11回相当 UAT・21.97.2）営業資料の写真とロゴ・商品情報の全成分表
   土台・前の層（v95〜v97）は書き換えず、前の関数を控えてから包む。登録の値は、利用者が選んだ・入れたものだけを足す。
   No.509（未解消・後退）写真の「このまま使う」などの選択肢を全カテゴリーにそろえる
     再現（刷新版 21.97.2・/L-.html）：UAT と同じく商品を AI ヒアリングで登録（資料なし）→ 外国語営業資料の画面を開くと、ロゴと商品写真1〜10 の
           11枠がすべて「選ぶ」だけ。何を用意すればよいかも、Web で見つからないときの次の手も出ない（8カテゴリーすべて同じ）。
           ヒアリングの📎で商品写真・ロゴを送っても（fillAttach・fillIngestEntries）、取り込んだ情報の「資料を追加」（srcIngestEntries）で入れても、
           写真は AI の読み取りに回るだけで営業資料の写真の枠に入らない（21.95 の No.480 で枠に入れるのは「商品情報を登録」の画面からの取り込みだけ）。
           写真があっても、AI の写真の確認がまだ・失敗（429・時間切れ）・止まっている（応答なし）・AI 未接続のときは、確かめていない写真が「✓ 納品品質」と出て、
           「このまま使う」も「確認前」の表示も無い（日本語の文字を重ねた写真も同じ表示）。
     原因：① 選択肢（21.96〜21.97 の v96dkPanelHtml）は「写真があって、外れる理由がある」ときだけ出す作り。写真が0枚・ロゴが無い商品（ヒアリングで登録した
              商品は全部これ）では、欄は土台の deckAssetCard の「選ぶ」だけになる。Web で画像を探しても、この商品・ロゴが見つからないと
              「お手元の写真のアップロードを（上の『選ぶ』から）」の1行で終わる。
           ② 取り込みの入口のうち、商品写真の枠に入れるのは v95pPhotos（新しい商品の登録）だけ。ロゴの名前の画像も写真の枠に入っていた。
           ③ 21.97.2 の写真の確認（dkImgAudit：指紋で覚える・失敗したら30分は自動で始めない）は、写真を消したり外したりはしない（試験で確かめた）。
              ただ、確かめていない写真は土台の dkPhGood が「使える」とみなし、欄は「✓ 納品品質」と出していた（確認前と分からない）。
     直し：① 写真かロゴが無い・使える写真が3枚に足りないとき、欄の上に「用意するもの」（商品写真3〜10枚の形式・大きさ・形・文字、ロゴの形式）と
              「Web で見つからないときは」（手元の写真を上げる〈何枚でも〉・ロゴを上げる・登録済みの写真から選ぶ・Web で画像を探す）を出す。
              Web で画像を探して、この商品・ロゴが見つからなかったとき（候補の画面・見つからなかった知らせ）にも同じ次の手を出す。
           ② ヒアリングの📎・取り込んだ情報の「資料を追加」で入れた写真（png・jpg・webp。Zip の中は除く）を、商品写真の空いている枠へ入れる。
              名前にロゴ（logo・ロゴ・マーク）とある画像は、ロゴが無ければロゴの枠へ（「商品情報を登録」の取り込みも同じ）。名刺・証明書・見積などの名前の画像は入れない。
           ③「登録済みの写真から選ぶ」：ドキュメントに入れた画像と、同じ会社のほかの商品の写真・ロゴから選んで、写真かロゴの枠に入れる。
           ④ AI の写真の確認がまだ・失敗・止まっている・未接続の写真は、欄に「◷ 確認前」と出し、写真の下の箱に理由（AI の状態）と
              「このまま使う／切り取る・隠す／差し替える」「確認前の N枚をこのまま使う」「写真をもう一度確かめる」を出す（確認を待たずに使える）。
              確認前に「このまま使う」を選んだ写真は、あとで AI が理由を見つけても資料に入れる（欄は理由つきの「✓ このまま使う」）。
              ロゴの欄にも「✓ 表紙に入ります」か「まだありません」を出す。
   No.546（低）全成分表で和名が欠ける行（D 美容液「—（資料に和名なし）｜Rice Ferment Filtrate (Sake)」）
     原因：21.97 の v68pInciTable の包み（v97/logic_v2197prod.js）が、資料に和名が無い成分の和名の欄を「—（資料に和名なし）」に置き換えるだけで、
           和名を入れる手立ても、内蔵の対応表での候補も無かった（欠けた行に見える）。
     直し：和名の欄は「和名 未登録」を小さく出し、「和名を入れる」で、その場で入れられる（成分表の和名の列に保存）。
           内蔵の対応表（V68P_INCI・V96P_INCI_ADD＝21.68・21.96 で足した表示名称と INCI 名の組）に、INCI 名の括弧の中（一般名）を除くと同じ名前があるときだけ、
           「候補：○○（内蔵の対応表・要確認）」と「この和名を使う」を出す。対応表に無い成分（Rice Ferment Filtrate (Sake) など）は候補を出さない
           （出どころを確かめられない名前は出さない）。外国語の営業資料の成分表は 21.97 のまま INCI 名だけ（和名の欄は出さない）。 */
var V98PROD = window.V98PROD = { v: "21.98", err: null, errs: [], n: { imp: 0, impLogo: 0, guide: 0, pend: 0, reg: 0, regPick: 0, upl: 0, ja: 0, cand: 0, pick: 0 }, au: null, reg: [] };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const s = k + ": " + String((e && e.message) || e).slice(0, 160); V98PROD.err = s; V98PROD.errs.push(s); if (V98PROD.errs.length > 40) V98PROD.errs.shift(); } catch (x) { /* 記録だけ */ } };
  const lang = () => { try { const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (document.getElementById("lang") || {}).value || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const NF = (s) => { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.replace(/[\s　]+/g, " ").trim(); };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const toast0 = (s) => { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const save = () => { try { if (typeof saveTen === "function") saveTen(); } catch (e) { err("save", e); } }; // eslint-disable-line no-undef
  const rerender = () => { try { if (typeof render === "function") render(); } catch (e) { err("render", e); } }; // eslint-disable-line no-undef
  const logU0 = (k, s) => { try { if (typeof logU === "function") logU(k, s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const NPH = () => { try { return (typeof DK_NPH !== "undefined" && +DK_NPH) || 10; } catch (e) { return 10; } }; // eslint-disable-line no-undef
  const phNm = (i) => M("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto del producto " + (i + 1));
  V98PROD.M = M;

  /* ════════════ No.509 ① 取り込んだ画像を写真・ロゴの枠へ ════════════ */
  const IMG_RE = /\.(png|jpe?g|webp)$/i;
  const LOGO_RE = /logo|ロゴ|マーク|emblem|シンボル/i;
  const NOT_PH = /名刺|business[\s_-]?card|meishi|証明|certificate|(^|[^a-z])certs?([^a-z]|$)|scan|スキャン|invoice|請求|見積|quotation|receipt|領収|screenshot|スクリーンショット|スクショ|図面|drawing|価格表|price|成分表|仕様書|規格書|spec/i;
  function imgKind(name) { const n = String(name || "").split("/").pop(); if (!IMG_RE.test(n)) return ""; if (LOGO_RE.test(n)) return "logo"; if (NOT_PH.test(n)) return ""; return "ph"; }
  V98PROD.imgKind = imgKind;
  const mimeOf = (n) => /\.png$/i.test(n) ? "image/png" : /\.webp$/i.test(n) ? "image/webp" : "image/jpeg";
  function u8b64(u8) { let s = ""; const CH = 0x8000; for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH)); return btoa(s); }
  const fileUrl = (f) => new Promise((ok, ng) => { try { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => ng(r.error || new Error("read")); r.readAsDataURL(f); } catch (e) { ng(e); } });
  const normImg = (src) => new Promise((ok, ng) => { try { if (typeof imgNorm !== "function") { ng(new Error("imgNorm")); return; } imgNorm(src, ok, ng); } catch (e) { ng(e); } }); // eslint-disable-line no-undef
  function firstEmpty(A) { const N = NPH(); for (let i = 0; i < N; i++) { const o = (A.ph || [])[i]; if (!o || !o.b64) return i; } return -1; }
  /* items：[{ name, src（data URL） }] */
  async function takeImgs(T, items, how, quiet) {
    if (!T || !items || !items.length) return { ph: [], logo: 0, full: 0 };
    T.assets = T.assets || { logo: null, ph: [] };
    const A = T.assets; A.ph = A.ph || [];
    const out = { ph: [], logo: 0, full: 0 };
    for (const it of items.slice(0, 8)) {
      try {
        const kind = imgKind(it.name);
        if (!kind) continue;
        const cap = String(it.name || "").split("/").pop().slice(0, 80);
        if (kind === "logo") {
          if (A.logo && A.logo.b64) continue;
          const a = await normImg(it.src);
          if (!a || !a.b64) continue;
          A.logo = { b64: a.b64, mime: a.mime || "image/jpeg", w: a.w, h: a.h, src: "import", cap };
          out.logo = 1; V98PROD.n.impLogo++;
          continue;
        }
        if (A.ph.some((o) => o && o.b64 && o.cap === cap && o.src === "import")) continue;
        const a = await normImg(it.src);
        if (!a || !a.b64) continue;
        let dup = false; try { dup = typeof dkIsDup === "function" ? await dkIsDup(a.b64, a.mime, -1, A) : false; } catch (e) { dup = false; } // eslint-disable-line no-undef
        if (dup) continue;
        const slot = firstEmpty(A);
        if (slot < 0) { out.full++; continue; }
        A.ph[slot] = { b64: a.b64, mime: a.mime || "image/jpeg", w: a.w, h: a.h, src: "import", cap, v98how: how };
        out.ph.push(slot); V98PROD.n.imp++;
      } catch (e) { err("take", e); }
    }
    if (out.ph.length || out.logo) {
      save();
      logU0("upload", "営業資料の写真の枠へ（" + how + "）：" + [out.ph.length ? "写真 " + out.ph.length + "枚" : "", out.logo ? "ロゴ" : ""].filter(Boolean).join("・"));
      const msg = M(`📷 送った画像を営業資料の${out.logo ? "ロゴの枠" : ""}${out.logo && out.ph.length ? "と" : ""}${out.ph.length ? "写真の枠（" + out.ph.map((i) => "商品写真" + (i + 1)).join("・") + "）" : ""}に入れました。営業資料の画面の「ロゴ・商品写真」で、使うかどうかを選べます`,
        `📷 The image(s) you sent were placed in the sales deck ${out.logo ? "logo" : ""}${out.logo && out.ph.length ? " and " : ""}${out.ph.length ? "photo slot(s) (" + out.ph.map((i) => "photo " + (i + 1)).join(", ") + ")" : ""}. You can choose whether to use them under “Logo & photos” on the sales deck screen`,
        `📷 已将发送的图片放入营销资料的${out.logo ? "标志栏" : ""}${out.ph.length ? "照片栏（" + out.ph.map((i) => "照片" + (i + 1)).join("・") + "）" : ""}。可在营销资料画面的“标志・商品照片”中选择是否使用`,
        `📷 Las imágenes enviadas se colocaron en ${out.logo ? "el logo" : ""}${out.logo && out.ph.length ? " y " : ""}${out.ph.length ? "las fotos (" + out.ph.map((i) => "foto " + (i + 1)).join(", ") + ")" : ""} de la presentación. Puede elegir si usarlas en «Logo y fotos»`) +
        (out.full ? M(`（写真の枠 ${NPH()}枚がいっぱいのため ${out.full}枚は入れていません）`, ` (${out.full} not added: all ${NPH()} photo slots are full)`, `（照片栏已满，${out.full} 张未放入）`, ` (${out.full} sin añadir: las ${NPH()} fotos están ocupadas)`) : "");
      if (!quiet) {
        try { if (typeof FILL !== "undefined" && FILL && FILL.on && typeof fillSay === "function") fillSay("ai", E(msg)); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        toast0(msg);
        rerender();
      }
    }
    return out;
  }
  V98PROD.takeImgs = takeImgs;
  // ヒアリングの📎（1件）
  if (typeof fillAttach === "function") {
    const __fa98 = fillAttach; // eslint-disable-line no-undef
    fillAttach = function (f) { // eslint-disable-line no-global-assign
      const T0 = ten();
      const r = __fa98.apply(this, arguments);
      try {
        if (f && f.name && imgKind(f.name) && T0) {
          Promise.resolve(r).catch(() => null).then(() => fileUrl(f)).then((src) => takeImgs(T0, [{ name: f.name, src }], "ヒアリング")).catch((e) => err("fa2", e));
        }
      } catch (e) { err("fa", e); }
      return r;
    };
  }
  const isZip = (label, kind) => /zip/i.test(String(kind || "")) || /\.zip$/i.test(String(label || ""));
  const entSrc = (x) => "data:" + mimeOf(x.name) + ";base64," + u8b64(x.u8);
  // ヒアリングの📎（何件か）
  if (typeof fillIngestEntries === "function") {
    const __fi98 = fillIngestEntries; // eslint-disable-line no-undef
    fillIngestEntries = function (entries, label, srcKind) { // eslint-disable-line no-global-assign
      const T0 = ten();
      const r = __fi98.apply(this, arguments);
      try {
        const L = (entries || []).filter((x) => x && x.u8 && imgKind(x.name));
        if (L.length && T0 && !isZip(label, srcKind)) Promise.resolve(r).catch(() => null).then(() => takeImgs(T0, L.map((x) => ({ name: x.name, src: entSrc(x) })), "ヒアリング")).catch((e) => err("fi2", e));
      } catch (e) { err("fi", e); }
      return r;
    };
  }
  // 取り込んだ情報の「資料を追加」
  if (typeof srcIngestEntries === "function") {
    const __si98 = srcIngestEntries; // eslint-disable-line no-undef
    srcIngestEntries = function (entries, label) { // eslint-disable-line no-global-assign
      const T0 = ten();
      const r = __si98.apply(this, arguments);
      try {
        const L = (entries || []).filter((x) => x && x.u8 && imgKind(x.name));
        if (L.length && T0 && !isZip(label)) Promise.resolve(r).catch(() => null).then(() => takeImgs(T0, L.map((x) => ({ name: x.name, src: entSrc(x) })), "資料を追加")).catch((e) => err("si2", e));
      } catch (e) { err("si", e); }
      return r;
    };
  }
  // 「商品情報を登録」の取り込み（21.95 の v95pPhotos）：ロゴの名前の画像はロゴの枠へ・名刺や証明書の名前の画像は写真に入れない
  if (typeof v95pPhotos === "function") {
    const __vp98 = v95pPhotos; // eslint-disable-line no-undef
    v95pPhotos = async function (t, files) { // eslint-disable-line no-global-assign
      let fs = files;
      try {
        fs = Array.from(files || []);
        const lg = fs.find((f) => f && imgKind(f.name) === "logo");
        if (lg && t && !(t.assets && t.assets.logo && t.assets.logo.b64)) await takeImgs(t, [{ name: lg.name, src: await fileUrl(lg) }], "商品情報を登録", true);
        fs = fs.filter((f) => f && (!IMG_RE.test(f.name) || imgKind(f.name) === "ph"));
      } catch (e) { err("vp", e); fs = files; }
      return __vp98.call(this, t, fs);
    };
  }

  /* ════════════ No.509 ② 写真・ロゴの状態 ════════════ */
  const whyKeys = (o) => { try { return typeof v97dkWhyKeys === "function" ? (v97dkWhyKeys(o) || []) : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const decOf = (o) => { try { return typeof v96dkDec === "function" ? v96dkDec(o) : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const isGood = (o) => { try { return typeof dkPhGood === "function" ? !!dkPhGood(o) : false; } catch (e) { return false; } }; // eslint-disable-line no-undef
  const pending = (o) => !!(o && o.b64 && !o.other && !o._dq);
  function stateOf(T) {
    const A = (T && T.assets) || {};
    const L = []; (A.ph || []).forEach((o, i) => { if (o && o.b64) L.push({ i, o }); });
    return { A, L, nPh: L.length, good: L.filter((x) => isGood(x.o)).length, logo: !!(A.logo && A.logo.b64), pend: L.filter((x) => pending(x.o)) };
  }
  V98PROD.stateOf = stateOf;
  function aiState() {
    try {
      if (!(typeof ppReady === "function" && ppReady())) return "off"; // eslint-disable-line no-undef
      if (typeof __dkAudit !== "undefined" && __dkAudit) return "run"; // eslint-disable-line no-undef
      if (W.V97M && W.V97M.failAt && Date.now() - W.V97M.failAt < 30 * 60000) return "fail";
      return "wait";
    } catch (e) { return "wait"; }
  }
  V98PROD.aiState = aiState;
  // 写真の確認の始まり（経過を出すため）
  if (typeof dkImgAudit === "function") {
    const __au98 = dkImgAudit; // eslint-disable-line no-undef
    dkImgAudit = async function () { // eslint-disable-line no-global-assign
      let was = false; try { was = typeof __dkAudit !== "undefined" && !!__dkAudit; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      const p = __au98.apply(this, arguments);
      try { const now = typeof __dkAudit !== "undefined" && !!__dkAudit; if (!was && now) V98PROD.au = { at: Date.now() }; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      try { return await p; } finally { try { if (V98PROD.au && !V98PROD.au.end && !(typeof __dkAudit !== "undefined" && __dkAudit)) V98PROD.au.end = Date.now(); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
    };
  }

  /* 登録済みの写真の数（ドキュメントの画像・同じ会社のほかの商品の写真とロゴ） */
  const coKey = (s) => NF(s).replace(/株式会社|有限会社|合同会社|\(株\)|（株）|co\.?,?\s*ltd\.?|inc\.?|corp\.?/gi, "").replace(/\s/g, "").toLowerCase();
  function regSources(T) {
    const out = [];
    try {
      if (typeof d30All === "function") { // eslint-disable-line no-undef
        (d30All() || []).forEach((d) => { // eslint-disable-line no-undef
          if (!d || !d.id || d.lgk || !IMG_RE.test(String(d.n || ""))) return;
          if (out.filter((x) => x.k === "doc").length >= 24) return;
          out.push({ k: "doc", d, name: String(d.n || ""), from: M("ドキュメント", "Documents", "文档", "Documentos") + (d.item ? "（" + d.item + "）" : "") });
        });
      }
    } catch (e) { err("regdoc", e); }
    try {
      const ck = coKey(T && T.co);
      const own = new Set(); const A0 = (T && T.assets) || {}; if (A0.logo && A0.logo.b64) own.add(A0.logo.b64.length + ":" + A0.logo.b64.slice(-64)); (A0.ph || []).forEach((o) => { if (o && o.b64) own.add(o.b64.length + ":" + o.b64.slice(-64)); });
      ((typeof TENS !== "undefined" && TENS) || []).forEach((t) => { // eslint-disable-line no-undef
        if (!t || t === T || !t.assets || !ck || coKey(t.co) !== ck || t.src === "sample") return;
        const A = t.assets, nm = String(t.item || "").slice(0, 30);
        const fp = (o) => o.b64.length + ":" + o.b64.slice(-64);
        if (A.logo && A.logo.b64 && !own.has(fp(A.logo))) out.push({ k: "ten", o: A.logo, logo: 1, name: M("ロゴ", "Logo", "标志", "Logo"), from: M("同じ会社の商品「" + nm + "」のロゴ", "Logo of “" + nm + "” (same company)", "同公司商品“" + nm + "”的标志", "Logo de «" + nm + "» (misma empresa)") });
        (A.ph || []).forEach((o, i) => { if (o && o.b64 && !o.other && !own.has(fp(o))) out.push({ k: "ten", o, name: String(o.cap || phNm(i)).slice(0, 40), from: M("同じ会社の商品「" + nm + "」の写真", "Photo of “" + nm + "” (same company)", "同公司商品“" + nm + "”的照片", "Foto de «" + nm + "» (misma empresa)") }); });
      });
    } catch (e) { err("regten", e); }
    return out.slice(0, 40);
  }
  V98PROD.regSources = regSources;

  /* 用意するもの・次の手の箱（営業資料の欄・Web の候補の画面・見つからなかった知らせで同じものを使う） */
  function guideHtml(T, where) {
    const S = stateOf(T);
    const nReg = regSources(T).length;
    let head;
    if (where === "web") head = M("この商品の写真・ロゴが Web で見つからないときは", "If the photos or logo of this product are not found on the web", "如果在网上找不到该商品的照片或标志", "Si no se encuentran en la web las fotos o el logo de este producto");
    else if (!S.nPh && !S.logo) head = M("📷 商品写真とロゴがまだありません", "📷 No product photos or logo yet", "📷 还没有商品照片和标志", "📷 Aún no hay fotos del producto ni logo");
    else if (!S.nPh) head = M("📷 商品写真がまだありません", "📷 No product photos yet", "📷 还没有商品照片", "📷 Aún no hay fotos del producto");
    else if (S.good < 3) head = M(`📷 資料に使える写真：${S.good}枚（3枚以上がおすすめ）`, `📷 Photos usable in the deck: ${S.good} (3 or more recommended)`, `📷 可用于资料的照片：${S.good} 张（建议 3 张以上）`, `📷 Fotos utilizables: ${S.good} (se recomiendan 3 o más)`);
    else head = M("🏷 ロゴがまだありません", "🏷 No logo yet", "🏷 还没有标志", "🏷 Aún no hay logo");
    const sub = where === "web" ? "" : M("（資料の表紙・商品のページ・ギャラリーに入ります。写真が無いままでも下書きは作れます＝写真の枠は空き）", " (they go on the cover, product pages and gallery; you can still make a draft without photos — the photo frames stay empty)", "（用于封面、商品页和图库。没有照片也可以做草稿＝照片框为空）", " (van en la portada, las páginas de producto y la galería; sin fotos puede hacer un borrador con marcos vacíos)");
    const need = `<div class="v98p-need"><p class="v98p-nh">${E(M("用意するもの", "What to prepare", "需要准备", "Qué preparar"))}</p><ul>` +
      `<li><b>${E(M("商品写真 3〜10枚", "Product photos: 3–10", "商品照片 3〜10 张", "Fotos del producto: 3–10"))}</b>${E(M("：", ": ", "：", ": "))}${E(M("JPEG・PNG・WebP。短い辺 420px 以上（1000px 以上なら大きなページもきれい）。細長い形（横と縦の比が 2.8倍を超える）は避ける。文字を重ねていない実物の写真（パッケージに印刷された文字は大丈夫）。おすすめ：①商品だけ（白か無地の背景）②パッケージ・荷姿 ③使っている場面",
        "JPEG, PNG or WebP. Shorter side 420px or more (1000px or more stays sharp on large pages). Avoid long thin shapes (over 2.8:1). Real photos without text added on top (text printed on the package is fine). Recommended: ① the product alone on a white or plain background ② the package / packing ③ the product in use",
        "JPEG・PNG・WebP。短边 420px 以上（1000px 以上大页面也清晰）。避免细长形状（长宽比超过 2.8 倍）。没有后期叠加文字的实物照片（包装上印刷的文字没问题）。推荐：①只有商品（白色或纯色背景）②包装・外箱 ③使用场景",
        "JPEG, PNG o WebP. Lado corto de 420px o más (1000px o más se ve nítido en páginas grandes). Evite formas alargadas (más de 2,8:1). Fotos reales sin texto superpuesto (el texto impreso en el envase sirve). Recomendado: ① el producto solo con fondo blanco o liso ② el envase ③ el producto en uso"))}</li>` +
      `<li><b>${E(M("ロゴ 1点", "Logo: 1", "标志 1 个", "Logo: 1"))}</b>${E(M("：", ": ", "：", ": "))}${E(M("PNG（背景が透明）か JPEG。横 600px 以上。会社かブランドの正式なロゴ", "PNG (transparent background) or JPEG, 600px wide or more. The official company or brand logo", "PNG（透明背景）或 JPEG，宽 600px 以上。公司或品牌的正式标志", "PNG (fondo transparente) o JPEG, 600px de ancho o más. El logo oficial de la empresa o marca"))}${S.logo ? E(M("（設定済み）", " (already set)", "（已设置）", " (ya configurado)")) : ""}</li></ul></div>`;
    const acts = `<p class="v98p-nh">${E(where === "web" ? M("次の手", "Next steps", "下一步", "Siguientes pasos") : M("Web で見つからないときは", "If nothing is found on the web", "网上找不到时", "Si no se encuentra nada en la web"))}</p><div class="v98p-acts">` +
      `<label class="btn v98p-b">${E(M("📁 手元の写真を上げる（何枚でも）", "📁 Upload your own photos (any number)", "📁 上传手头的照片（可多张）", "📁 Subir sus fotos (las que quiera)"))}<input type="file" hidden accept="image/png,image/jpeg,image/webp" multiple data-v98pup="ph"></label>` +
      (S.logo ? "" : `<label class="btn g v98p-b">${E(M("🏷 ロゴを上げる", "🏷 Upload the logo", "🏷 上传标志", "🏷 Subir el logo"))}<input type="file" hidden accept="image/png,image/jpeg,image/webp" data-v98pup="logo"></label>`) +
      `<button type="button" class="btn g v98p-b" data-v98preg="1">${E(nReg ? M(`🗂 登録済みの写真から選ぶ（${nReg}枚）`, `🗂 Choose from registered photos (${nReg})`, `🗂 从已登记的照片中选择（${nReg} 张）`, `🗂 Elegir de las fotos registradas (${nReg})`) : M("🗂 登録済みの写真から選ぶ", "🗂 Choose from registered photos", "🗂 从已登记的照片中选择", "🗂 Elegir de las fotos registradas"))}</button>` +
      (where === "card" ? `<button type="button" class="btn g v98p-b" data-v98pweb="1">${E(M("🌐 Web で画像を探す", "🌐 Search the web for images", "🌐 在网上查找图片", "🌐 Buscar imágenes en la web"))}</button>` : "") + `</div>` +
      `<p class="nn v98p-note">${E(M("登録済みの写真＝ドキュメントに入れた画像と、同じ会社のほかの商品の写真・ロゴです。公式サイトがあれば「公式サイトから画像を取得」でも集められます。ヒアリングの📎で送った写真も、ここ（写真の枠）に入ります。",
        "Registered photos = images in Documents and photos/logos of other products of the same company. If you have a website, “Get images from the official website” also works. Photos sent with 📎 in the AI interview also go into these slots.",
        "已登记的照片＝放入文档的图片，以及同公司其他商品的照片和标志。如有官网，也可用“从官网获取图片”。在AI问答中用📎发送的照片也会放入这里（照片栏）。",
        "Fotos registradas = imágenes en Documentos y fotos/logos de otros productos de la misma empresa. Si tiene web oficial, también sirve «Obtener imágenes del sitio oficial». Las fotos enviadas con 📎 en la entrevista también van aquí."))}</p>`;
    V98PROD.n.guide++;
    return `<div class="v98p-guide${where === "web" ? " v98p-web" : ""}" data-v98pguide="${E(where)}" data-noi18n="1" role="region" aria-label="${E(head)}"><p class="v98p-gh"><b>${E(head)}</b>${E(sub)}</p>${where === "web" ? "" : need}${acts}</div>`;
  }
  V98PROD.guideHtml = guideHtml;

  /* 確認前の写真の箱 */
  function pendHtml(T) {
    try {
      const S = stateOf(T);
      const rows = S.pend.filter((x) => !whyKeys(x.o).length);
      if (!rows.length) return "";
      const st = aiState();
      const sec = V98PROD.au && V98PROD.au.at && !V98PROD.au.end ? Math.max(0, Math.round((Date.now() - V98PROD.au.at) / 1000)) : 0;
      const why = st === "off" ? M("AI エンジンにつながっていないため、写真の中身（重ねた日本語の文字・ぼやけ・商品との関係）はまだ確かめていません。大きさと形は問題ありません。",
        "The AI engine is not connected, so the photo content (Japanese text on top, blur, relation to the product) has not been checked. Size and shape are fine.",
        "未连接AI引擎，尚未检查照片内容（叠加的日文文字・模糊・与商品的关系）。尺寸和形状没有问题。",
        "El motor de IA no está conectado: aún no se revisó el contenido (texto japonés superpuesto, desenfoque, relación con el producto). El tamaño y la forma están bien.")
        : st === "fail" ? M("AI の応答が無く、写真の中身をまだ確かめられていません（自動では30分は確かめ直しません）。",
          "There was no AI response, so the photos have not been checked yet (no automatic retry for 30 minutes).",
          "AI 无响应，尚未检查照片（30分钟内不会自动重试）。",
          "No hubo respuesta de la IA; las fotos aún no se revisaron (sin reintento automático durante 30 minutos).")
          : st === "run" ? (sec >= 60 ? M(`AI が写真を確かめていますが、${sec}秒たっても応答がありません。`, `The AI is checking the photos but has not answered for ${sec} s.`, `AI 正在检查照片，但 ${sec} 秒仍无响应。`, `La IA está revisando las fotos, pero no responde desde hace ${sec} s.`)
            : M("AI が写真を確かめています（資料はまだ作りません）。", "The AI is checking the photos (no deck is being made yet).", "AI 正在检查照片（尚未制作资料）。", "La IA está revisando las fotos (aún no se crea el material)."))
            : M("AI の写真の確認がまだです。", "The AI has not checked these photos yet.", "AI 尚未检查这些照片。", "La IA aún no revisó estas fotos.");
      const lead = why + M("<b>確認を待たずに使えます</b>：このままでも資料に入ります。「このまま使う」を選ぶと、あとで AI が理由を見つけても使います（理由は欄に出します）。気になる写真は「切り取る・隠す」「差し替える」で直せます。",
        " <b>You can use them without waiting</b>: they go into the deck as they are. If you choose “Use as it is”, they stay in even if the AI later finds a reason (shown in the slot). Fix any photo with “Crop or hide” or “Replace”.",
        "<b>无需等待即可使用</b>：照片会直接放入资料。选择“直接使用”后，即使之后 AI 发现问题也会使用（原因会显示在栏中）。可用“裁剪或遮住”“替换”修改。",
        " <b>Puede usarlas sin esperar</b>: entran en la presentación tal cual. Si elige «Usar tal cual», se mantienen aunque la IA encuentre después un motivo (se muestra en la casilla). Corrija con «Recortar u ocultar» o «Sustituir».");
      const B = (act, i, lb, cls) => `<button type="button" class="btn ${cls || "g"} v96dk-b" data-v96dkjp="${act}" data-v96dki="${i}">${E(lb)}</button>`;
      const li = rows.map((x) => {
        const o = x.o, i = x.i, d = decOf(o) === "use";
        const stTx = d ? M("✓ このまま使います（確認前に決めました）", "✓ Used as it is (decided before the check)", "✓ 直接使用（检查前已决定）", "✓ Se usa tal cual (decidido antes de la revisión)")
          : M("確認前：このまま資料に入ります", "Not checked yet: it goes into the deck as it is", "检查前：将直接放入资料", "Sin revisar: entra en la presentación tal cual");
        const btns = (d ? "" : B("use", i, M("✓ このまま使う", "✓ Use as it is", "✓ 直接使用", "✓ Usar tal cual"), "")) +
          B("edit", i, M("✂ 切り取る・隠す", "✂ Crop or hide", "✂ 裁剪或遮住", "✂ Recortar u ocultar")) + B("rep", i, M("⇄ 差し替える", "⇄ Replace", "⇄ 替换", "⇄ Sustituir")) +
          (d ? B("clear", i, M("選び直す", "Choose again", "重新选择", "Elegir de nuevo")) : "");
        return `<li class="v96dk-jprow v98p-prow" data-v96dkst="${d ? "jpUse" : "pend"}" data-v98ppend="${i}"><img class="v96dk-jpimg" src="data:${E(o.mime || "image/jpeg")};base64,${o.b64}" alt="${E(phNm(i))}" loading="lazy">` +
          `<div class="v96dk-jptx"><b>${E(phNm(i))}</b><span class="v98p-pchip">${E(M("◷ 確認前（AI の確認がまだ）", "◷ Not checked yet (AI)", "◷ 检查前（AI 尚未检查）", "◷ Sin revisar (IA)"))}</span><span class="v96dk-jpst">${E(stTx)}</span></div><div class="v96dk-jpbtns">${btns}</div></li>`;
      }).join("");
      const und = rows.filter((x) => decOf(x.o) !== "use").length;
      const bulk = (und ? `<button type="button" class="btn v96dk-b" data-v98pall="1">${E(M(`確認前の ${und}枚を、このまま使う`, `Use the ${und} unchecked photo(s) as they are`, `将检查前的 ${und} 张直接使用`, `Usar tal cual las ${und} foto(s) sin revisar`))}</button>` : "") +
        (st === "fail" || st === "wait" ? `<button type="button" class="btn g v96dk-b" data-v97mphre="1">${E(M("写真をもう一度確かめる", "Check the photos again", "重新检查照片", "Revisar las fotos de nuevo"))}</button>` : "");
      V98PROD.n.pend++;
      return `<div class="c v98p-pend" data-v98pbox="pend" data-v98pai="${st}" data-noi18n="1" role="region" aria-label="${E(M("確認前の写真", "Photos not checked yet", "检查前的照片", "Fotos sin revisar"))}"><h3>${E(M(`◷ AI の確認がまだの写真：${rows.length}枚`, `◷ Photos not checked by the AI yet: ${rows.length}`, `◷ AI 尚未检查的照片：${rows.length} 张`, `◷ Fotos aún sin revisar por la IA: ${rows.length}`))}</h3>` +
        `<p class="v96dk-lead">${lead}</p>${bulk ? `<div class="v96dk-bulk">${bulk}</div>` : ""}<ul class="v96dk-jpl">${li}</ul></div>`;
    } catch (e) { err("pend", e); return ""; }
  }
  V98PROD.pendHtml = pendHtml;

  /* 欄の短い表示：確認前の写真・ロゴ */
  if (typeof v96dkSlotFix === "function") {
    const __sf98 = v96dkSlotFix; // eslint-disable-line no-undef
    v96dkSlotFix = function (h, T) { // eslint-disable-line no-global-assign
      let out = __sf98.apply(this, arguments);
      try {
        const A = (T && T.assets) || {};
        out = String(out).replace(/(<p class="lbl" style="margin-bottom:5px">商品写真(\d+)<\/p>)([\s\S]*?)(data-dkup="ph\d+")/g, (m, a, n, mid, z) => {
          const o = (A.ph || [])[+n - 1];
          if (!pending(o)) return m;
          const ks = whyKeys(o), d = decOf(o) === "use";
          const tag = `<span class="v98p-slpend" data-v98pslot="${+n - 1}">${E(d ? M("✓ このまま使う（確認前に決めた）", "✓ Use as it is (decided before check)", "✓ 直接使用（检查前决定）", "✓ Usar tal cual (antes de revisar)") : M("◷ 確認前", "◷ Not checked yet", "◷ 检查前", "◷ Sin revisar"))}</span>`;
          if (!ks.length) mid = mid.replace(/<p style="font-size:8\.5px;color:var\(--good\);margin:3px 0 0">✓ 納品品質(・✨補正済)?<\/p>/, `<p class="v98p-slst" style="font-size:8.5px;margin:3px 0 0;line-height:1.3">${tag}<br>${E(d ? M("資料に入ります", "Goes into the deck", "放入资料", "Entra en la presentación") : M("このまま資料に入ります（下で選べます）", "Goes into the deck as is (choose below)", "将直接放入资料（可在下方选择）", "Entra tal cual (elija abajo)"))}</p>`);
          else mid = mid.replace(/(<p style="font-size:8\.5px;color:var\(--warn\);margin:3px 0 0;line-height:1\.3">)/, `$1${tag}<br>`);
          return a + mid + z;
        });
        // ロゴの欄
        out = out.replace(/(<p class="lbl" style="margin-bottom:5px">ロゴ<\/p>[\s\S]*?)(<div class="rw" style="gap:4px;margin-top:6px;flex-wrap:wrap">)/, (m, a, z) => {
          const has = !!(A.logo && A.logo.b64);
          return a + `<p class="v98p-lgst${has ? "" : " v98p-miss"}" data-v98plogo="${has ? 1 : 0}">${E(has ? M("✓ 表紙に入ります", "✓ Goes on the cover", "✓ 用于封面", "✓ Va en la portada") : M("まだありません", "None yet", "还没有", "Aún no hay"))}</p>` + z;
        });
      } catch (e) { err("slot", e); }
      return out;
    };
  }
  /* 理由のある写真の行（21.97 の箱）にも、確認前なら札を足す */
  if (typeof v97dkRowHtml === "function") {
    const __rh98 = v97dkRowHtml; // eslint-disable-line no-undef
    v97dkRowHtml = function (x) { // eslint-disable-line no-global-assign
      let h = __rh98.apply(this, arguments);
      try { if (x && pending(x.o)) h = String(h).replace(/(<span class="v96dk-jpst)/, `<span class="v98p-pchip">${E(M("◷ 確認前（AI の確認がまだ・大きさと形だけで判定）", "◷ Not checked by the AI yet (judged by size and shape only)", "◷ 检查前（AI 尚未检查・仅按尺寸和形状判断）", "◷ Sin revisar por la IA (solo tamaño y forma)"))}</span>$1`); } catch (e) { err("row", e); }
      return h;
    };
  }
  /* 欄（deckAssetCard）：上に「用意するもの・次の手」、下に確認前の写真の箱 */
  if (typeof deckAssetCard === "function") {
    const __ac98 = deckAssetCard; // eslint-disable-line no-undef
    deckAssetCard = function () { // eslint-disable-line no-global-assign
      let h = __ac98.apply(this, arguments);
      try {
        const T = ten(); if (!T) return h;
        const S = stateOf(T);
        h = String(h);
        if (!S.nPh || !S.logo || S.good < 3) {
          const g = guideHtml(T, "card");
          const k = '<div class="rw" style="margin-top:9px;gap:6px">';
          const at = h.indexOf(k);
          h = at > 0 ? h.slice(0, at) + g + h.slice(at) : g + h;
        }
        const p = pendHtml(T);
        if (p) h += p;
      } catch (e) { err("card", e); }
      return h;
    };
  }
  /* 確認前の写真の「このまま使う」：利用者の選択として控える（あとで AI が理由を見つけても使う） */
  function useOne(T, i, d) {
    const o = ((T && T.assets && T.assets.ph) || [])[i];
    if (!o) return false;
    if (typeof v96dkSetDec === "function") v96dkSetDec(o, d, "pend"); // eslint-disable-line no-undef
    else if (d) o.v96jp = { d, fp: "", at: "", how: "pend" }; else delete o.v96jp;
    logU0("deck", "営業資料の写真：" + "商品写真" + (i + 1) + (d === "use" ? "を確認前にそのまま使う" : "の選択を戻す"));
    return true;
  }
  function after(msg) { try { if (typeof v96dkAfter === "function") { v96dkAfter(msg); return; } } catch (e) { err("after", e); } save(); rerender(); if (msg) toast0(msg); } // eslint-disable-line no-undef
  if (typeof v96dkUse === "function") {
    const __us98 = v96dkUse; // eslint-disable-line no-undef
    v96dkUse = function (T, i, d) { // eslint-disable-line no-global-assign
      try {
        const o = ((T && T.assets && T.assets.ph) || [])[i];
        if (pending(o) && !whyKeys(o).length && (d === "use" || !d)) {
          useOne(T, i, d);
          V98PROD.n.pick++;
          after(d === "use" ? M(`商品写真${i + 1}を、このまま資料に使います（AI の確認の前に決めました。あとで AI が理由を見つけても使います）`, `Product photo ${i + 1} will be used as it is (decided before the AI check; it stays even if the AI finds a reason later)`, `商品照片${i + 1}将直接用于资料（在 AI 检查前决定）`, `La foto ${i + 1} se usará tal cual (decidido antes de la revisión de IA)`) : "");
          return;
        }
      } catch (e) { err("use", e); }
      return __us98.apply(this, arguments);
    };
  }
  function useAllPend(T) {
    const S = stateOf(T);
    const L = S.pend.filter((x) => !whyKeys(x.o).length && decOf(x.o) !== "use");
    if (!L.length) return 0;
    L.forEach((x) => useOne(T, x.i, "use"));
    after(M(`確認前の写真 ${L.length}枚を、このまま資料に使います`, `${L.length} unchecked photo(s) will be used as they are`, `将检查前的 ${L.length} 张照片直接使用`, `Se usarán tal cual ${L.length} foto(s) sin revisar`));
    return L.length;
  }
  V98PROD.useAllPend = useAllPend;

  /* ════════════ No.509 ③ 手元の写真を上げる・登録済みの写真から選ぶ・Web の候補の画面 ════════════ */
  function uploadFiles(kind, files) {
    const T = ten();
    if (!T) { toast0(M("先に商品情報を登録してください", "Please register the product first", "请先登记商品信息", "Registre primero el producto")); return 0; }
    if (typeof dkSetAssetFile !== "function") return 0; // eslint-disable-line no-undef
    const L = Array.from(files || []).filter((f) => f && (/^image\//.test(f.type || "") || IMG_RE.test(f.name || "")));
    if (!L.length) { toast0(M("画像ファイル（PNG・JPEG・WebP）をお選びください", "Please choose image files (PNG, JPEG, WebP)", "请选择图片文件（PNG・JPEG・WebP）", "Elija imágenes (PNG, JPEG, WebP)")); return 0; }
    if (kind === "logo") { dkSetAssetFile("logo", L[0]); V98PROD.n.upl++; return 1; } // eslint-disable-line no-undef
    const A = (typeof dkEnsureAssets === "function" ? dkEnsureAssets() : null) || T.assets || { ph: [] }; // eslint-disable-line no-undef
    const N = NPH(), free = [];
    for (let i = 0; i < N; i++) { const o = (A.ph || [])[i]; if (!o || !o.b64) free.push(i); }
    const use = L.slice(0, free.length);
    use.forEach((f, k) => { try { dkSetAssetFile("ph", f, free[k]); V98PROD.n.upl++; } catch (e) { err("upl", e); } }); // eslint-disable-line no-undef
    if (L.length > use.length) toast0(M(`写真の枠（${N}枚）がいっぱいのため、${L.length - use.length}枚は入れていません。使わない写真を削除してから入れてください`, `${L.length - use.length} not added: all ${N} photo slots are full`, `照片栏（${N} 张）已满，${L.length - use.length} 张未放入`, `${L.length - use.length} sin añadir: las ${N} fotos están ocupadas`));
    return use.length;
  }
  V98PROD.uploadFiles = uploadFiles;
  async function regImg(x) {
    if (x.b64) return x;
    if (x.k === "ten") { x.b64 = x.o.b64; x.mime = x.o.mime || "image/jpeg"; x.w = x.o.w; x.h = x.o.h; return x; }
    if (x.k === "doc" && typeof d30Bytes === "function") { // eslint-disable-line no-undef
      const u8 = await d30Bytes(x.d); // eslint-disable-line no-undef
      if (!u8 || u8.length > 15e6) throw new Error("size");
      const a = await normImg("data:" + (x.d.mime || mimeOf(x.name)) + ";base64," + u8b64(u8));
      x.b64 = a.b64; x.mime = a.mime; x.w = a.w; x.h = a.h; return x;
    }
    throw new Error("no image");
  }
  function regCard(x, i) {
    const img = x.k === "ten" ? `<img src="data:${E(x.o.mime || "image/jpeg")};base64,${x.o.b64}" alt="">` : `<span class="v98p-rgload" data-v98prgi="${i}">${E(M("読み込み中…", "Loading…", "加载中…", "Cargando…"))}</span>`;
    return `<div class="v98p-rgc" data-v98prgc="${i}"><div class="v98p-rgimg">${img}</div><p class="v98p-rgn">${E(String(x.name).slice(0, 44))}</p><p class="v98p-rgf">${E(x.from)}</p>` +
      `<div class="v98p-rgb">${x.logo ? "" : `<button type="button" class="btn g v98p-b" data-v98ppick="${i}" data-v98pas="ph">${E(M("写真に使う", "Use as photo", "用作照片", "Usar como foto"))}</button>`}<button type="button" class="btn g v98p-b" data-v98ppick="${i}" data-v98pas="logo">${E(M("ロゴに使う", "Use as logo", "用作标志", "Usar como logo"))}</button></div><p class="v98p-rgnote"></p></div>`;
  }
  function openReg() {
    const T = ten();
    if (!T) { toast0(M("先に商品情報を登録してください", "Please register the product first", "请先登记商品信息", "Registre primero el producto")); return; }
    const L = regSources(T);
    V98PROD.reg = L; V98PROD.n.reg++;
    const up = `<div class="v98p-acts"><label class="btn v98p-b">${E(M("📁 手元の写真を上げる（何枚でも）", "📁 Upload your own photos (any number)", "📁 上传手头的照片（可多张）", "📁 Subir sus fotos (las que quiera)"))}<input type="file" hidden accept="image/png,image/jpeg,image/webp" multiple data-v98pup="ph"></label>` +
      `<label class="btn g v98p-b">${E(M("🏷 ロゴを上げる", "🏷 Upload the logo", "🏷 上传标志", "🏷 Subir el logo"))}<input type="file" hidden accept="image/png,image/jpeg,image/webp" data-v98pup="logo"></label></div>`;
    const body = L.length ? `<div class="v98p-rg">${L.map(regCard).join("")}</div>`
      : `<p class="v98p-empty">${E(M("登録済みの写真はまだありません（ドキュメントに画像が無く、同じ会社のほかの商品にも写真・ロゴがありません）。手元の写真を上げてください。", "There are no registered photos yet (no images in Documents and no photos/logos in other products of the same company). Please upload your own photos.", "还没有已登记的照片（文档中没有图片，同公司其他商品也没有照片和标志）。请上传手头的照片。", "Aún no hay fotos registradas (no hay imágenes en Documentos ni fotos/logos en otros productos de la misma empresa). Suba sus fotos."))}</p>`;
    if (typeof openDW !== "function") return; // eslint-disable-line no-undef
    openDW(`<div data-noi18n="1" class="v98p-dw"><h3>${E(M("🗂 登録済みの写真から選ぶ", "🗂 Choose from registered photos", "🗂 从已登记的照片中选择", "🗂 Elegir de las fotos registradas"))}</h3>` + // eslint-disable-line no-undef
      `<p class="nn">${E(M(`「${String(T.item || "").slice(0, 30)}」の営業資料の写真・ロゴの枠に入れます。ドキュメントに入れた画像と、同じ会社のほかの商品の写真・ロゴです（ほかの会社の写真は出しません）。入れたあと、AI が写真を確かめます（つながっているとき）。`, `They go into the photo/logo slots of the sales deck for “${String(T.item || "").slice(0, 30)}”. Images in Documents and photos/logos of other products of the same company (other companies’ photos are not shown). The AI checks them afterwards (when connected).`, `将放入“${String(T.item || "").slice(0, 30)}”营销资料的照片・标志栏。这些是文档中的图片和同公司其他商品的照片・标志（不显示其他公司的照片）。放入后 AI 会检查（已连接时）。`, `Se colocan en las fotos/logo de la presentación de «${String(T.item || "").slice(0, 30)}». Imágenes en Documentos y fotos/logos de otros productos de la misma empresa. La IA las revisa después (si está conectada).`))}</p>` +
      body + `<p class="v98p-nh">${E(M("ほかの写真を使うときは", "To use other photos", "使用其他照片时", "Para usar otras fotos"))}</p>` + up +
      `<div class="rw" style="margin-top:12px"><button type="button" class="btn g" data-v98pclose="1">${E(M("閉じる", "Close", "关闭", "Cerrar"))}</button></div></div>`);
    // ドキュメントの画像は本体を読んでから見せる（読めないものは理由を出す）
    L.forEach((x, i) => {
      if (x.k !== "doc") return;
      regImg(x).then(() => {
        const s = document.querySelector(`[data-v98prgi="${i}"]`);
        if (s) s.outerHTML = `<img src="data:${E(x.mime)};base64,${x.b64}" alt="">`;
      }).catch((e) => {
        x.bad = String((e && e.message) || e).slice(0, 60);
        const s = document.querySelector(`[data-v98prgi="${i}"]`);
        if (s) s.textContent = M("この端末では開けません", "Cannot be opened on this device", "此设备无法打开", "No se puede abrir en este equipo");
        const c = document.querySelector(`[data-v98prgc="${i}"]`);
        if (c) c.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      });
    });
  }
  V98PROD.openReg = openReg;
  async function pickReg(i, as, btn) {
    const T = ten(); const x = (V98PROD.reg || [])[i];
    if (!T || !x) return false;
    const note = (m, col) => { try { const c = btn && btn.closest("[data-v98prgc]"); const p = c && c.querySelector(".v98p-rgnote"); if (p) { p.textContent = m; p.style.color = col || ""; } } catch (e) { /* 無視 */ } };
    try {
      if (btn) btn.disabled = true;
      await regImg(x);
      const A = (typeof dkEnsureAssets === "function" ? dkEnsureAssets() : null) || (T.assets = T.assets || { logo: null, ph: [] }); // eslint-disable-line no-undef
      A.ph = A.ph || [];
      const ent = { b64: x.b64, mime: x.mime || "image/jpeg", w: x.w, h: x.h, src: "registered", cap: String(x.name || "").slice(0, 80) };
      let msg;
      if (as === "logo") {
        A.logo = ent;
        msg = M("ロゴに入れました", "Set as the logo", "已设为标志", "Establecido como logo");
      } else {
        let dup = false; try { dup = typeof dkIsDup === "function" ? await dkIsDup(ent.b64, ent.mime, -1, A) : false; } catch (e) { dup = false; } // eslint-disable-line no-undef
        if (dup) { note(M("同じ写真がもう入っています", "The same photo is already there", "相同照片已存在", "La misma foto ya está"), "var(--warn)"); if (btn) btn.disabled = false; return false; }
        const s = firstEmpty(A);
        if (s < 0) { note(M(`写真の枠（${NPH()}枚）がいっぱいです`, `All ${NPH()} photo slots are full`, `照片栏（${NPH()} 张）已满`, `Las ${NPH()} fotos están ocupadas`), "var(--warn)"); if (btn) btn.disabled = false; return false; }
        A.ph[s] = ent;
        msg = M(`商品写真${s + 1}に入れました`, `Placed in product photo ${s + 1}`, `已放入商品照片${s + 1}`, `Colocada en la foto ${s + 1}`);
      }
      V98PROD.n.regPick++;
      save();
      logU0("deck", "営業資料の写真：登録済みの写真から（" + (as === "logo" ? "ロゴ" : "写真") + "）");
      if (btn) btn.textContent = "✓ " + msg;
      note(msg, "var(--good)");
      toast0(msg);
      rerender();
      return true;
    } catch (e) { err("pick", e); note(M("入れられませんでした（この端末では開けない画像です）", "Could not add it (the image cannot be opened on this device)", "无法放入（此设备无法打开该图片）", "No se pudo añadir (no se abre en este equipo)"), "var(--warn)"); if (btn) btn.disabled = false; return false; }
  }
  V98PROD.pickReg = pickReg;
  // Web の候補の画面：この商品・ロゴが見つからなかったとき
  if (typeof openDeckPicker === "function") {
    const __op98 = openDeckPicker; // eslint-disable-line no-undef
    openDeckPicker = function (SECS) { // eslint-disable-line no-global-assign
      const r = __op98.apply(this, arguments);
      try {
        const ex = (SECS && SECS[0] && SECS[0].arr) || [], lg = (SECS && SECS[1] && SECS[1].arr) || [];
        const pn = document.getElementById("pn");
        if (pn && (!ex.length || !lg.length) && !pn.querySelector("[data-v98pguide]")) {
          // 見つからなかった①②のすぐ下（③ 汎用イメージ素材の前）に出す。見当たらなければ最後に
          const l3 = [...pn.querySelectorAll("p.lbl")].find((x) => /^\s*③/.test(x.textContent || ""));
          if (l3) l3.insertAdjacentHTML("beforebegin", guideHtml(ten(), "web")); else pn.insertAdjacentHTML("beforeend", guideHtml(ten(), "web"));
        }
      } catch (e) { err("picker", e); }
      return r;
    };
  }
  if (typeof deckWebImgs === "function") {
    const __wi98 = deckWebImgs; // eslint-disable-line no-undef
    deckWebImgs = async function () { // eslint-disable-line no-global-assign
      const r = await __wi98.apply(this, arguments);
      try {
        const st = document.getElementById("dkimgst");
        if (st && /画像は見つかりませんでした|検索できませんでした/.test(st.textContent || "") && !st.querySelector("[data-v98pguide]")) st.insertAdjacentHTML("beforeend", guideHtml(ten(), "web"));
      } catch (e) { err("web", e); }
      return r;
    };
  }

  /* ════════════ No.546 全成分表の和名が無い成分 ════════════ */
  const ikey = (s) => NF(s).replace(/[\s()（）.\-]/g, "").toUpperCase();
  const lkey = (s) => NF(s).toUpperCase().replace(/\([^)]*\)|（[^）]*）/g, "").replace(/[^A-Z0-9]/g, "");
  let LOOSE = null;
  // 内蔵の対応表（表示名称 → INCI 名）を、INCI 名の括弧の中（一般名）を除いた形で引く。対応表に無い名前は候補を出さない
  // 同じ INCI 名に表示名称が2つある（例：ホホバ種子油・ホホバ油）ときは両方を候補にする（どちらが正式かは利用者が確かめる）
  function candJa(inci) {
    try {
      if (!LOOSE) {
        LOOSE = {};
        const add = (o) => { if (!o) return; Object.keys(o).forEach((ja) => { const k = lkey(o[ja]); if (!k) return; LOOSE[k] = LOOSE[k] || []; if (LOOSE[k].indexOf(ja) < 0) LOOSE[k].push(ja); }); };
        if (typeof V68P_INCI !== "undefined") add(V68P_INCI); // eslint-disable-line no-undef
        if (typeof V96P_INCI_ADD !== "undefined") add(V96P_INCI_ADD); // eslint-disable-line no-undef
      }
      const k = lkey(inci);
      return ((k && k.length >= 4 && LOOSE[k]) || []).slice(0, 3);
    } catch (e) { err("cand", e); return []; }
  }
  V98PROD.candJa = candJa;
  function setJa(inci, ja, by) {
    const T = ten();
    ja = NF(ja);
    if (!T || !ja || !inci) return false;
    const cols = (T.compCols || []).map((c) => String(c == null ? "" : c));
    const iI = cols.findIndex((c, i) => i > 0 && /INCI/i.test(c));
    let n = 0;
    (T.compRows || []).forEach((r) => {
      if (!Array.isArray(r)) return;
      if (ikey(r[0]) !== ikey(inci)) return;
      if (iI > 0 && String(r[iI] || "").trim() && ikey(r[iI]) !== ikey(inci)) return;
      r[0] = ja; if (iI > 0 && !String(r[iI] || "").trim()) r[iI] = inci; n++;
    });
    if (!n) return false;
    T.v97noJa = (T.v97noJa || []).filter((x) => ikey(x) !== ikey(inci));
    T.v98ja = T.v98ja || {}; T.v98ja[inci] = { ja, by: by || "user", at: (typeof TODAYS !== "undefined" && TODAYS) || new Date().toISOString().slice(0, 10) }; // eslint-disable-line no-undef
    delete T.v97compSig;
    V98PROD.n.ja++;
    save();
    try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    logU0("edit", "全成分表の和名：" + inci + " → " + ja + (by === "dict" ? "（対応表の候補）" : ""));
    rerender();
    toast0(M(`「${inci}」の和名を「${ja}」にしました`, `Set the Japanese name of “${inci}” to “${ja}”`, `已将“${inci}”的日文名设为“${ja}”`, `Nombre japonés de «${inci}»: «${ja}»`));
    return true;
  }
  V98PROD.setJa = setJa;
  function noJaHtml(keyEsc) {
    const inci = keyEsc.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const C = candJa(inci);
    if (C.length) V98PROD.n.cand++;
    return `<span class="v98p-noja" data-v97noja="1" data-v98pnoja="${keyEsc}"><span class="v98p-nojat">${E(M("和名 未登録", "Japanese name not registered", "日文名 未登记", "Nombre japonés sin registrar"))}</span>` +
      `<button type="button" class="v98p-jab" data-v98pja="${keyEsc}">${E(M("和名を入れる", "Add the Japanese name", "填写日文名", "Añadir nombre japonés"))}</button>` +
      (C.length ? `<span class="v98p-cand">${E(M("候補（内蔵の対応表・要確認）：", "Candidates (built-in table, to be confirmed): ", "候选（内置对照表・需确认）：", "Candidatos (tabla interna, por confirmar): "))}` +
        C.map((c) => `<button type="button" class="v98p-jab" data-v98pjacand="${keyEsc}" data-v98pjav="${E(c)}" title="${E(M("この和名を使う", "Use this name", "使用此名称", "Usar este nombre"))}">${E(M(`「${c}」を使う`, `Use “${c}”`, `使用“${c}”`, `Usar «${c}»`))}</button>`).join("") + `</span>` : "") + `</span>`;
  }
  if (typeof v68pInciTable === "function") {
    const __it98 = v68pInciTable; // eslint-disable-line no-undef
    v68pInciTable = function (t) { // eslint-disable-line no-global-assign
      let h = __it98.apply(this, arguments);
      try {
        h = String(h).replace(/(<tr data-v68ing="([^"]*)"><td class="k">)<span class="mute" data-v97noja="1">[^<]*<\/span>(<\/td>)/g, (m, a, key, z) => a + noJaHtml(key) + z);
      } catch (e) { err("inci", e); }
      return h;
    };
  }
  function jaForm(btn) {
    const box = btn.closest("[data-v98pnoja]");
    if (!box || box.querySelector("input")) return;
    const inci = box.getAttribute("data-v98pnoja");
    const f = document.createElement("span");
    f.className = "v98p-jaf";
    f.innerHTML = `<input type="text" class="sel" maxlength="60" aria-label="${E(M("和名（表示名称）", "Japanese name (labeling name)", "日文名（标示名称）", "Nombre japonés"))}" placeholder="${E(M("例：コメ発酵液", "e.g. コメ発酵液", "例：コメ発酵液", "p. ej. コメ発酵液"))}">` +
      `<button type="button" class="btn v98p-b" data-v98pjasave="1">${E(M("保存", "Save", "保存", "Guardar"))}</button><button type="button" class="btn g v98p-b" data-v98pjacancel="1">${E(M("やめる", "Cancel", "取消", "Cancelar"))}</button>` +
      `<span class="v98p-jahint">${E(M("日本の化粧品の全成分表示の名前（表示名称）で入れてください", "Enter the Japanese cosmetic labeling name", "请填写日本化妆品全成分标示名称", "Escriba el nombre japonés de etiquetado cosmético"))}</span>`;
    box.appendChild(f);
    const inp = f.querySelector("input");
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); const v = NF(inp.value); if (v) setJa(inci, v, "user"); } else if (e.key === "Escape") { f.remove(); } });
    try { inp.focus(); } catch (e) { /* 無視 */ }
  }

  /* ════════════ 押したとき・選んだとき（インラインの onclick は使えないため、文書で受ける） ════════════ */
  document.addEventListener("change", (ev) => {
    try {
      const t = ev.target;
      if (!t || !t.matches || !t.matches("input[type=file][data-v98pup]")) return;
      ev.stopPropagation();
      const kind = t.getAttribute("data-v98pup");
      const n = uploadFiles(kind, t.files);
      t.value = "";
      if (n && t.closest("#pn")) { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
    } catch (e) { err("chg", e); }
  }, true);
  document.addEventListener("click", (ev) => {
    try {
      const t = ev.target && ev.target.closest ? ev.target : null;
      if (!t) return;
      let b;
      if ((b = t.closest("[data-v98preg]"))) { ev.preventDefault(); ev.stopPropagation(); openReg(); return; }
      if ((b = t.closest("[data-v98pweb]"))) { ev.preventDefault(); ev.stopPropagation(); if (typeof deckWebImgs === "function") deckWebImgs(); return; } // eslint-disable-line no-undef
      if ((b = t.closest("[data-v98pall]"))) { ev.preventDefault(); ev.stopPropagation(); useAllPend(ten()); return; }
      if ((b = t.closest("[data-v98ppick]"))) { ev.preventDefault(); ev.stopPropagation(); pickReg(+b.getAttribute("data-v98ppick"), b.getAttribute("data-v98pas"), b); return; }
      if ((b = t.closest("[data-v98pclose]"))) { ev.preventDefault(); try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } return; } // eslint-disable-line no-undef
      if ((b = t.closest("[data-v98pjacand]"))) { ev.preventDefault(); ev.stopPropagation(); setJa(b.getAttribute("data-v98pjacand"), b.getAttribute("data-v98pjav"), "dict"); return; }
      if ((b = t.closest("[data-v98pja]"))) { ev.preventDefault(); ev.stopPropagation(); jaForm(b); return; }
      if ((b = t.closest("[data-v98pjasave]"))) {
        ev.preventDefault(); ev.stopPropagation();
        const box = b.closest("[data-v98pnoja]"); const inp = box && box.querySelector("input");
        const v = inp ? NF(inp.value) : "";
        if (!v) { toast0(M("和名を入れてください", "Please enter the Japanese name", "请填写日文名", "Escriba el nombre japonés")); return; }
        setJa(box.getAttribute("data-v98pnoja"), v, "user"); return;
      }
      if ((b = t.closest("[data-v98pjacancel]"))) { ev.preventDefault(); ev.stopPropagation(); const f = b.closest(".v98p-jaf"); if (f) f.remove(); return; }
    } catch (e) { err("click", e); }
  }, true);
})();

/* ═══ 追加（21.98 prod・price 担当の見つけた不具合）Excel の帯つき価格表を取り込むと数量帯が落ちる
   再現（/L-.html・「商品情報を登録」に1ファイル）：
     ①「商品情報」（項目｜内容）と「価格表」（数量帯｜FOB単価（US$）・600個以上 4.8／1,000個以上 4.3／3,000個以上 3.9）の2シート → 価格表が空（帯がすべて落ちる）。
        価格表の1行目が「FOB」のときは「FOB 4.8」の1行だけが入る。
     ② 1シートの表に同じ商品名を帯ごとの行で書いた形（商品名｜…｜数量帯｜FOB単価｜MOQ）→「3商品を読み取りました」と帯の数だけ別の商品になる。
   原因：① 土台の表の見つけ方（findTables）は見出しが3つ以上の表だけを表とみなす。2列の価格表（数量帯｜単価）は表にならず、
           行は「項目｜内容」の読み取り（findKV）に回って数量帯の行は捨てられる（「FOB」の行だけが建値の項目として拾われていた）。
         ② 商品一覧の読み取り（productTableToFields）は1行＝1商品。数量帯の列は商品の項目に無く、同じ商品名の行もそのまま別の商品にしていた。
   直し：① 取り込み（buildTenant・複数ファイルの tenantFromTextGrids）のあとに、各シートから「数量の見出し（数量・数量帯・ロット・qty…）と
           単価の見出し（単価・価格・FOB・USD・円…）が並ぶ表」を探し、帯の形（price の層の v98pxShape があればそれで「帯の表」と確かめる）なら
           価格表に入れる（数量帯の欄・単価の欄は資料のまま。第1行が「FOB」のような数量の無い行も資料どおり残し、price の層の照合に任せる）。
           今の価格表が空・帯の表より少ない行のときだけ入れ替える（ほかの価格表は変えない）。建値が空なら単価の見出しの FOB などを建値に。
         ② 商品一覧で、同じ商品名（＋品番・英文名）の行が2つ以上あり、数量帯の列の値がそれぞれ違い単価があるときは、1つの商品にまとめ、
           価格表を「数量帯｜単価」の帯にする（違う商品名の行・数量帯の列が無い表は今まで通り1行＝1商品）。
   記録：商品に v98xls（どのシートの何行を価格表にしたか・まとめた行の数）を持たせる。 */
(function () {
  "use strict";
  const P = window.V98PROD || (window.V98PROD = { err: null, errs: [], n: {} });
  P.n = P.n || {}; P.n.xlsTier = 0; P.n.xlsMerge = 0;
  const err = (k, e) => { try { const s = "xls." + k + ": " + String((e && e.message) || e).slice(0, 160); P.err = s; (P.errs = P.errs || []).push(s); if (P.errs.length > 40) P.errs.shift(); } catch (x) { /* 記録だけ */ } };
  const NF = (s) => { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.replace(/[\s　]+/g, " ").trim(); };
  const nk = (s) => NF(s).toLowerCase().replace(/\s/g, "");
  const QH = /数量|ロット|qty|quantity|発注|注文|個数|本数|枚数|台数|ケース数|lot|tier|volume/i;
  const NOTQ = /^(moq|最小|最低|入数|在庫|stock)/i;
  const PH = /単価|価格|price|卸|fob|cif|exw|cfr|ddp|usd|us\$|ドル|円|金額|cost/i;
  const INCO = /FOB|EXW|CIF|CFR|DDP|DAP|FCA|CPT|CIP/i;
  const isQtyHead = (c) => { const s = NF(c); return !!s && QH.test(s) && !NOTQ.test(s) && !PH.test(s); };
  const isPriceHead = (c) => { const s = NF(c); return !!s && PH.test(s) && !QH.test(s) && !/moq|最小|最低/i.test(s); };
  const hasNum = (s) => /\d/.test(NF(s));
  const tierLike = (s) => { const x = NF(s); return /\d/.test(x) && (/以上|以下|未満|超|から|まで|〜|~|～|-|－|\+|＋|over|above|or more|up/i.test(x) || /^[\d,.]+\s*[^\d\s,.]{0,4}$/.test(x)); };
  function shapeOk(cols, rows) {
    try {
      if (typeof window.v98pxShape === "function") { const S = window.v98pxShape(cols, rows); return !!(S && S.kind === "bands" && (S.bands || []).length >= 1); }
    } catch (e) { err("shape", e); }
    return rows.filter((r) => tierLike(r[0])).length >= 1 && rows.filter((r) => hasNum(r[1])).length >= 2;
  }
  // シートの中の「数量の見出し｜単価の見出し」の表（見出しが2〜6個・商品名の列は無い）
  function findTier(grid, sheet) {
    const out = [];
    const G = (grid || []).map((r) => (r || []).map((x) => NF(x)));
    const RAW = (grid || []).map((r) => (r || []).map((x) => String(x == null ? "" : x).trim()));
    for (let i = 0; i < G.length; i++) {
      const H = G[i]; const ne = H.filter(Boolean);
      if (ne.length < 2 || ne.length > 6) continue;
      const qi = H.findIndex(isQtyHead);
      if (qi < 0) continue;
      const pis = H.map((c, j) => (j !== qi && isPriceHead(c) ? j : -1)).filter((j) => j >= 0);
      if (!pis.length) continue;
      try { if (typeof mapProductCols === "function" && mapProductCols(H).item) continue; } catch (e) { /* 下へ */ } // eslint-disable-line no-undef
      const rows = [];
      for (let j = i + 1; j < G.length; j++) {
        const r = G[j]; const q = r[qi] || "", p = r[pis[0]] || "";
        if (!r.some(Boolean) || (!q && !p)) break;
        if (!hasNum(p)) break;
        const w = RAW[j] || [];
        rows.push([w[qi] || q].concat(pis.map((k) => w[k] || r[k] || "")));
      }
      if (rows.length < 2) continue;
      const cols = [(RAW[i] || [])[qi] || H[qi]].concat(pis.map((k) => (RAW[i] || [])[k] || H[k]));
      if (!shapeOk(cols, rows)) continue;
      out.push({ cols, rows, sheet: sheet || "", at: i });
      i += rows.length;
    }
    return out;
  }
  P.findTier = findTier;
  // 数量帯の欄に建値だけが書かれた行（「FOB」）＝建値の手がかり（帯の数量は資料どおり空のまま）
  function termOfRows(rows) { for (const r of rows || []) { const m = NF(r && r[0]).match(/^(FOB|EXW|CIF|CFR|DDP|DAP|FCA|CPT|CIP)$/i); if (m) return m; } return null; }
  function applyTier(t, sheets, how) {
    if (!t || typeof t !== "object") return false;
    try {
      if (t._pend && t._pend.prods && t._pend.prods.length > 1) return false;
      let best = null;
      (sheets || []).forEach((s) => findTier(s.grid, s.name).forEach((c) => { if (!best || c.rows.length > best.rows.length) best = c; }));
      if (!best) return false;
      const cur = Array.isArray(t.priceRows) ? t.priceRows : [];
      const curCols = (t.priceCols || []).map(NF);
      if (cur.length >= best.rows.length && curCols.some(isQtyHead)) return false;
      if (cur.length && cur.length >= best.rows.length) return false;
      t.priceCols = best.cols.slice();
      t.priceRows = best.rows.map((r) => r.slice());
      const tm = best.cols.slice(1).join(" ").match(INCO) || termOfRows(best.rows);
      if (tm && !NF(t.term)) t.term = tm[0].toUpperCase();
      t.v98xls = Object.assign({}, t.v98xls || {}, { sheet: best.sheet, tier: best.rows.length, how: how || "", was: cur.length, at: (typeof TODAYS !== "undefined" && TODAYS) || new Date().toISOString().slice(0, 10) }); // eslint-disable-line no-undef
      P.n.xlsTier++;
      return true;
    } catch (e) { err("apply", e); return false; }
  }
  P.applyTier = applyTier;
  if (typeof buildTenant === "function") {
    const __bt98 = buildTenant; // eslint-disable-line no-undef
    buildTenant = async function (file) { // eslint-disable-line no-global-assign
      const t = await __bt98.apply(this, arguments);
      try {
        const nm = String((file && file.name) || "");
        if (t && /\.(xlsx|xlsm|csv)$/i.test(nm)) {
          let sheets = null;
          if (/\.(xlsx|xlsm)$/i.test(nm) && typeof readWorkbook === "function") sheets = await readWorkbook(file); // eslint-disable-line no-undef
          else if (/\.csv$/i.test(nm) && typeof parseCSV === "function") sheets = parseCSV(typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text()); // eslint-disable-line no-undef
          if (sheets) applyTier(t, sheets, "Excel");
        }
      } catch (e) { err("bt", e); }
      return t;
    };
  }
  if (typeof tenantFromTextGrids === "function") {
    const __tg98 = tenantFromTextGrids; // eslint-disable-line no-undef
    tenantFromTextGrids = function (text, grids) { // eslint-disable-line no-global-assign
      const t = __tg98.apply(this, arguments);
      try { if (t && Array.isArray(grids) && grids.length) applyTier(t, grids.map((g) => ({ grid: g, name: "" })), "表"); } catch (e) { err("tg", e); }
      return t;
    };
  }
  // ② 同じ商品名の帯ごとの行を1つの商品に
  function mergeTiers(tabs, R) {
    if (!R || !Array.isArray(R.prods) || R.prods.length < 2 || typeof mapProductCols !== "function") return null; // eslint-disable-line no-undef
    let best = null;
    (tabs || []).forEach((tb) => {
      const map = mapProductCols(tb.cols); // eslint-disable-line no-undef
      if (!map.item) return;
      const ii = map.item[0];
      const rows = (tb.rows || []).filter((r) => { const v = NF(r[ii]); return v && nk(v) !== nk(tb.cols[ii]) && !/^(例|サンプル|sample|記入例)/i.test(v); });
      if (!rows.length) return;
      const sc = Object.keys(map).length * 10 + rows.length;
      if (!best || sc > best.sc) best = { tb, map, rows, sc, ii };
    });
    if (!best) return null;
    const cols = best.tb.cols.map(NF), ii = best.ii;
    const qi = cols.findIndex(isQtyHead);
    if (qi < 0) return null;
    const pi = cols.findIndex((c, i) => i !== qi && i !== ii && isPriceHead(c));
    if (pi < 0) return null;
    // 商品と行を名前で突き合わせる（並びが合わなければまとめない）
    const idx = []; let j = 0;
    for (const p of R.prods) {
      while (j < best.rows.length && nk(best.rows[j][ii]) !== nk(p.item || p.name)) j++;
      if (j >= best.rows.length) return null;
      idx.push(j++);
    }
    const g = (r, k) => { const ix = best.map[k]; if (!ix) return ""; for (const i of ix) { const v = NF(r[i]); if (v) return v; } return ""; };
    const key = (k) => { const r = best.rows[idx[k]]; return [nk(r[ii]), nk(g(r, "sku") || g(r, "model")), nk(g(r, "itemEn"))].join("|"); };
    const groups = []; const at = {};
    R.prods.forEach((p, k) => { const kk = key(k); if (at[kk] == null) { at[kk] = groups.length; groups.push([]); } groups[at[kk]].push(k); });
    const out = []; let merged = 0, nT = 0;
    groups.forEach((G) => {
      const rows = G.map((k) => best.rows[idx[k]]);
      const qs = rows.map((r) => nk(r[qi]));
      const ok = G.length >= 2 && new Set(qs).size === G.length && rows.every((r) => hasNum(r[pi])) && rows.some((r) => hasNum(r[qi]));
      const pr = ok ? rows.map((r) => [String(r[qi] == null ? "" : r[qi]).trim(), String(r[pi] == null ? "" : r[pi]).trim()]) : null;
      if (!ok || !shapeOk([cols[qi], cols[pi]], pr)) { G.forEach((k) => out.push(R.prods[k])); return; }
      const p = Object.assign({}, R.prods[G[0]]);
      p.priceCols = [String(best.tb.cols[qi]).trim(), String(best.tb.cols[pi]).trim()];
      p.priceRows = pr;
      const tm = cols[pi].match(INCO) || termOfRows(pr);
      if (tm && !INCO.test(NF(p.term))) p.term = tm[0].toUpperCase();
      p.v98xls = { merged: G.length, tier: G.length, sheet: best.tb.sheet || "", at: (typeof TODAYS !== "undefined" && TODAYS) || new Date().toISOString().slice(0, 10) }; // eslint-disable-line no-undef
      out.push(p); merged += G.length - 1; nT += G.length;
    });
    if (!merged) return null;
    P.n.xlsMerge++;
    const n = out.length;
    const summary = String(R.summary || "").replace(/(\d+)商品を読み取りました/, n + "商品を読み取りました（同じ商品名の数量帯の行 " + nT + "行を、1つの商品の価格表にまとめました）");
    return Object.assign({}, R, { prods: out, summary });
  }
  P.mergeTiers = mergeTiers;
  if (typeof productTableToFields === "function") {
    const __pt98 = productTableToFields; // eslint-disable-line no-undef
    productTableToFields = function (tabs) { // eslint-disable-line no-global-assign
      const R = __pt98.apply(this, arguments);
      try { const M = mergeTiers(tabs, R); if (M) return M; } catch (e) { err("merge", e); }
      return R;
    };
  }
})();
