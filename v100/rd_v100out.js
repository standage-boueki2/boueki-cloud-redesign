/* 22.00 out：刷新版の層（見せ方）。中身は logic_v2200out.js（window.V100OUT）
   No.518 営業資料の画面の「営業資料の表紙（見本）」の区分の札：医療機器ではない商品（V100OUT.nonMed＝21.98 の v98regAllowed の判定）は、
          商材の区分キー（medical）を大文字にした「MEDICAL」ではなく、今の見せ方の型（V85DK.cat）の名前を出す。医療機器に戻すと元の札に戻る
          （札は画面を描くたびに作り直されるため、この層は描いた後に直すだけ）。
   インラインの onclick・style は使わない（CSP）。 */
(function () {
  "use strict";
  if (window.__v100outRd) return;
  window.__v100outRd = 1;
  const V = () => window.V100OUT || null;
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  function label(T) {
    if (/衛生/.test(String((T && T.cat) || ""))) return "HYGIENE PRODUCTS";
    try {
      if (typeof V85DK !== "undefined" && V85DK && typeof V85DK.cat === "function") { // eslint-disable-line no-undef
        const k = String((V85DK.cat(T) || {}).k || ""); // eslint-disable-line no-undef
        const P = (typeof V85DK_CATS !== "undefined" && V85DK_CATS && V85DK_CATS[k]) || null; // eslint-disable-line no-undef
        if (k && !/med|health|clinic|pharma/i.test(k) && P && P.en && !/medical/i.test(P.en)) return String(P.en).toUpperCase();
      }
    } catch (e) { warn("label", e); }
    return /衛生/.test(String((T && T.cat) || "")) ? "HYGIENE PRODUCTS" : "MADE IN JAPAN";
  }
  function fixCover() {
    try {
      const v = V(); const T = ten();
      if (!v || !T) return;
      document.querySelectorAll(".k-cover .k-cvb small").forEach((sm) => {
        const t = (sm.textContent || "").trim();
        if (!/MEDICAL/i.test(t)) return;
        if (!v.nonMed(T)) return;
        const nt = label(T);
        if (nt && nt !== t) { sm.textContent = nt; sm.setAttribute("data-v100cv", "1"); v.n.cover = (v.n.cover || 0) + 1; }
      });
    } catch (e) { warn("cover", e); }
  }
  /* 英・中・西の画面：写真の AI の見立ての理由（AI が日本語で返した文）が日本語のまま出ていた（「AI’s view: possibly “商品本体が写っていない可能性”」）。
     よく出る理由は訳の表で訳し、表に無い自由な文は元の日本語に「（日本語のまま）」の印を付ける（AI は使わない）。画面に出す文字だけを直す */
  const RS = [
    [/商品(?:本体)?が(?:写って|うつって)(?:い)?ない|商品が見えない|本体が写っていない/, ["the product itself may not be shown", "可能没有拍到商品本身", "puede que no se vea el producto"]],
    [/(?:登録)?商品と(?:は)?無関係|関係のない画像|別の商品/, ["it may be unrelated to the registered product", "可能与登记的商品无关", "puede no tener relación con el producto registrado"]],
    [/商品写真で(?:は)?ない|商品写真に(?:は)?向かない|商品写真として不適/, ["it may not be a product photo", "可能不是商品照片", "puede que no sea una foto de producto"]],
    [/パッケージ(?:だけ|のみ)|外箱(?:だけ|のみ)/, ["it may show only the package", "可能只拍到包装", "puede mostrar solo el envase"]],
    [/(?:実物の)?パッケージ(?:の写真)?/, ["it may be a photo of the actual package", "可能是实物包装的照片", "puede ser una foto del envase real"]],
    [/日本語(?:の)?(?:説明文|文字|テキスト)が(?:目立つ|多い|大きい)|文字が(?:多い|目立つ)/, ["Japanese text may stand out", "日文文字可能较显眼", "puede destacar texto en japonés"]],
    [/ぼやけ|ピンボケ|不鮮明|解像度が低|画質が(?:低|悪)/, ["it may be blurry or low quality", "可能模糊或画质低", "puede estar borrosa o tener baja calidad"]],
    [/図|イラスト|グラフ|表(?:の画像)?$|図面/, ["it may be a diagram or illustration", "可能是图表或插图", "puede ser un diagrama o ilustración"]],
    [/ロゴ(?:だけ|のみ)/, ["it may show only a logo", "可能只有标志", "puede mostrar solo un logotipo"]],
    [/人物(?:が中心|だけ)/, ["it may mainly show people", "可能以人物为主", "puede mostrar sobre todo personas"]],
    [/暗い|明るさ/, ["it may be too dark", "可能太暗", "puede estar demasiado oscura"]],
    [/小さ(?:い|く)/, ["the product may appear small", "商品可能拍得较小", "el producto puede verse pequeño"]]
  ];
  const JA = /[ぁ-ゖァ-ヺ一-龯々]/;
  const MARK = [" (in Japanese)", "（日文原文）", " (en japonés)"];
  function trRs(r, i) { const s = String(r || "").replace(/[。.]+$/, "").replace(/(?:の)?可能性(?:がある|あり)?$/, ""); for (const [re, v] of RS) if (re.test(s)) return v[i]; return null; }
  const PAT = [/AI’s view: possibly “([^”]*)”/g, /AI 的看法：可能“([^”]*)”/g, /Opinión de la IA: posiblemente «([^»]*)»/g];
  const PRE = ["AI’s view: ", "AI 的看法：", "Opinión de la IA: "];
  function fixStr(t, i) {
    let ch = false;
    const isJa = (x) => (i === 1 ? /[ぁ-ゖァ-ヺ]/.test(String(x)) : JA.test(String(x))); // 中文の画面では漢字だけの文は中国語（仮名があれば日本語）
    const out = String(t).replace(PAT[i], (m, r) => {
      if (!isJa(r)) return m;
      ch = true;
      const x = trRs(r, i);
      return x ? PRE[i] + x : (i === 0 ? "AI’s view: “" + r + "”" : i === 1 ? "AI 的看法：“" + r + "”" : "Opinión de la IA: «" + r + "»") + MARK[i];
    });
    // 最終チェックの写真の行（「photo 1（AI’s view: 商品本体が写っていない可能性）」：引用符なし）
    const UQ = [/(AI’s view: )([^（）()“”\n]*[ぁ-ゖァ-ヺ一-龯][^（）()“”\n]*?)(?=[）)]|$)/g, /(AI 看法：|AI 的看法：)([^（）()“”\n]*[ぁ-ゖァ-ヺ一-龯][^（）()“”\n]*?)(?=[）)]|$)/g, /(opinión de la IA: |Opinión de la IA: )([^（）()«»\n]*[ぁ-ゖァ-ヺ一-龯][^（）()«»\n]*?)(?=[）)]|$)/g][i];
    const out2 = (ch ? out : String(t)).replace(UQ, (m, pre, r) => { if (!isJa(r) || /\(in Japanese\)|（日文原文）|\(en japonés\)/.test(r)) return m; ch = true; const x = trRs(r, i); return pre + (x || r + MARK[i]); });
    // 写真の欄の短い表示（「⚠ AI: 商品本体が写っていない可能性」）
    const SL = [/^(\s*⚠?\s*)AI: (.+)$/, /^(\s*⚠?\s*)AI：(.+)$/, /^(\s*⚠?\s*)IA: (.+)$/][i];
    let o2 = out2;
    const m = o2.match(SL);
    if (m && isJa(m[2]) && !/\(in Japanese\)|（日文原文）|\(en japonés\)/.test(m[2])) {
      const x = trRs(m[2], i);
      o2 = m[1] + ["AI: ", "AI：", "IA: "][i] + (x || m[2] + MARK[i]);
      ch = true;
    }
    return ch ? o2 : null;
  }
  function fixAiView() {
    try {
      const v = V(); if (!v) return;
      const l = v.lang(); if (l === "ja") return;
      const i = l === "en" ? 0 : l === "zh" ? 1 : 2;
      ["well", "pn", "dw"].forEach((id) => {
        const root = document.getElementById(id); if (!root) return;
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const hits = [];
        for (let n = tw.nextNode(); n; n = tw.nextNode()) { const t = n.nodeValue; if (t && JA.test(t) && (t.indexOf(PRE[i].slice(0, 6)) >= 0 || /^\s*⚠?\s*(AI: |AI：|IA: )/.test(t))) hits.push(n); }
        hits.forEach((n) => { const x = fixStr(n.nodeValue, i); if (x != null && x !== n.nodeValue) { n.nodeValue = x; v.n.aiView = (v.n.aiView || 0) + 1; } });
        root.querySelectorAll("[aria-label],[title]").forEach((el) => { ["aria-label", "title"].forEach((a) => { const t = el.getAttribute(a); if (t && JA.test(t) && t.indexOf(PRE[i].slice(0, 6)) >= 0) { const x = fixStr(t, i); if (x != null && x !== t) el.setAttribute(a, x); } }); });
      });
    } catch (e) { warn("aiview", e); }
  }
  if (V()) { V().fixAiView = fixAiView; V().trReason = trRs; }
  /* 「資料に載せない言葉」の欄の「AI が根拠を確かめて外した文言」の理由（根拠に無い数字：180 など）が、英・中・西の画面で日本語のまま出ていた。
     21.98 の訳（i13Why：最終チェックの外した文言の訳と同じ）で訳す。訳せない理由は印を付ける */
  function fixDropWhy() {
    try {
      const v = V(); if (!v) return;
      const l = v.lang(); if (l === "ja") return;
      const i = l === "en" ? 0 : l === "zh" ? 1 : 2;
      document.querySelectorAll(".v99dk-ngdrop li .nn").forEach((el) => {
        if (el.dataset.v100why) return;
        const t = (el.textContent || "").trim();
        if (!t || !JA.test(t)) return;
        let x = null;
        try { if (typeof i13Why === "function") x = i13Why(t, l); } catch (e) { x = null; } // eslint-disable-line no-undef
        el.textContent = x && !JA.test(x) ? x : t + MARK[i];
        el.dataset.v100why = "1";
        v.n.dropWhy = (v.n.dropWhy || 0) + 1;
      });
    } catch (e) { warn("dropwhy", e); }
  }
  if (V()) V().fixDropWhy = fixDropWhy;
  /* 22.00.1 N9：営業資料の画面の「完成版（バイヤーに渡せる版）：あと 2 項目：納品品質の写真（3枚以上）」が、数は2なのに項目を1つしか書いていなかった
     （「次は」の1項目だけを入れていた）。足りない必須の項目（dk3Gate の必須で未入力）を全部書く。日本語の画面だけ（ほかの言語は元の訳のまま） */
  function fixCando() {
    try {
      const v = V(); if (!v) return;
      if (typeof v.lang === "function" && v.lang() !== "ja") return;
      const els = document.querySelectorAll(".k-v90cando b.ng"); if (!els.length) return;
      let G = [];
      try { G = (typeof dk3Gate === "function") ? (dk3Gate() || []) : []; } catch (e) { G = []; } // eslint-disable-line no-undef
      const names = G.filter((c) => c && c.req && !c.ok).map((c) => String(c.n || "").trim()).filter(Boolean);
      if (names.length < 2) return;
      els.forEach((b) => {
        const t = (b.textContent || "").trim();
        const m = t.match(/^完成版（バイヤーに渡せる版）：あと (\d+) 項目(?:：(.+))?。入れると作れます$/);
        if (!m || +m[1] !== names.length) return;
        const t2 = "完成版（バイヤーに渡せる版）：あと " + names.length + " 項目：" + names.join("・") + "。入れると作れます";
        if (t2 === t) return;
        b.textContent = t2;
        v.n.cando = (v.n.cando || 0) + 1;
      });
    } catch (e) { warn("cando", e); }
  }
  if (V()) V().fixCando = fixCando;
  let tm = 0;
  try {
    new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { fixCover(); fixAiView(); fixDropWhy(); fixCando(); }, 60); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { warn("mo", e); }
  try { if (window.RDX && typeof RDX.after === "function") { const prev = RDX.after; RDX.after = function () { const r = prev.apply(this, arguments); try { fixCover(); fixAiView(); fixDropWhy(); fixCando(); } catch (e) { warn("after", e); } return r; }; } } catch (e) { warn("afterwrap", e); } // eslint-disable-line no-undef
  if (V()) V().fixCover = fixCover;
})();
