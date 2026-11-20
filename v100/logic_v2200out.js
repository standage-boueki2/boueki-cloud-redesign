/* ═══ v22.00 out（2026-11-20 第13回 UAT・21.99.2）英語営業資料の出力の止まり・表示・商品またぎ・写真 ═══
   No.546（条件つき・悪化）D 美容液：INCI 表の和名の列（11/19 大森さんの決めで入れた列）が「英語になっていない」と判定され、納品版が止まった
     原因：21.99 の層は「和名の欄の文字が、資料を作ったときに控えた和名と1字も違わない」ときだけ点検から外していた（控えは画面を開いている間だけ・
           表の幅で改行が入る・保存した資料を開き直すと控えが無い、のどれでも外れず、英語のみの点検〔v5326k・v97〕に拾われた）。
     直し：表の作りで印を付ける。見出しが和名の列（Japanese label name など）の表の、その列の欄に e.v100ja=1 を付け、見出しを
           「Japanese name (reference)」（資料の言語）にする。印の付いた欄だけを、どの日本語の点検（最終チェック・v97 の点検・v5326k の点検・
           開き直したとき）でも外す。ほかの所の日本語は今までどおり見つける（両方向の試験）。
   No.532（条件つき）G 木製パズル：仕様表に「3歳以上」が残り、納品版が止まった
     直し：仕様の値によく出る日本語（対象年齢・寸法と単位・材質・色・原産国・保管方法・期間・入数・あり／なし・保証）を、決まった訳で英語などにする
           （AI に頼らない。v97 の訳語の表の後ろに足す＝AI の訳の直し・資料の点検の両方に効く）。訳せない残りは、資料の画面に
           「日本語が残っている所」として何枚目の何かを出し、その場で訳を入れて直せる（直した訳はこの商品の次の資料にも使う）。
   No.591（中）前の商品の「資料に載せない言葉」（AI が外した文言）が、次の商品の資料の画面に見える
     原因：資料の画面は、表示中の商品と違う商品の資料（DK3G.deck）は消すが、どの商品の資料かの控え（DK3G.ten）を残していた。
           21.95〜21.99 の層の多く（外した文言・訳だけやり直す・写真の確認・最終チェックの写真）は「DK3G.ten があればそれ」を読むため、
           前の商品の状態が次の商品の画面に出た。
     直し：商品を切り替えた・資料の画面を開いたときに、作っている途中でなければ、前の商品の資料の状態（DK3G の ten・deck・check・steps・err・
           直しの控え）をまとめて消す。外した文言の一覧は表示中の商品の分だけにする。
   No.518（条件つき）E マスク：医療機器ではないのに、表紙の見本「MEDICAL」・育て方の物差し「医療機器・医薬品・介護」・必須／任意の項目に医療機器
     直し：医療機器かどうかは 21.98 の 1か所（window.v98regAllowed・V98REG.md）で決める。医療機器ではない商品は、育て方の物差しを
           医療から外し（日用品・雑貨など）、④ 業種ごとの項目の「医療機器のクラス分類」「届出・認証の番号」を外した「衛生用品の項目」にし、
           表紙の見本の区分を今の区分の名前にする（rd_v100out.js）。区分を戻すと元に戻る（両方向）。
   No.533（条件つき）C：区分を変えたのに、④ 業種ごとの項目の小見出しが前の区分（工業部品の項目）のまま
     直し：小見出しの名前（v68pGL）を、いまの商材カテゴリーの名前にする（自動車部品の項目 など。中身の項目は同じ業種のもの）。
   書き方：前の関数は控えてから包む。何度包んでも同じ結果になるように（印・済みの札で二重にかけない）。失敗したら前の動きのまま。 */
var V100OUT = window.V100OUT = { v: "22.00", err: null, errs: [], n: {} };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const m = k + ": " + String((e && e.message) || e).slice(0, 180); V100OUT.err = m; V100OUT.errs.push(m); if (V100OUT.errs.length > 40) V100OUT.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V100OUT.errf = err;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V100OUT.n[k] = (V100OUT.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const lang = () => { try { const el = document.getElementById("lang"); const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V100OUT.M = M; V100OUT.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V100OUT.E = E;
  const NF = (s) => { s = String(s == null ? "" : s); try { return s.normalize("NFKC"); } catch (e) { return s; } };
  const JA = /[ぁ-ゖァ-ヺ一-龯々〆]/;
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const G = () => { try { return (typeof DK3G !== "undefined" && DK3G) ? DK3G : null; } catch (e) { return null; } };
  const pkey = (t) => { try { return typeof dk3PKey === "function" ? dk3PKey(t) : (t && t.uid) || ""; } catch (e) { return ""; } };
  const jpFor = (lg, s) => { try { return typeof dk3JPfor === "function" ? !!dk3JPfor(lg, s) : JA.test(String(s || "")); } catch (e) { return JA.test(String(s || "")); } };
  const elTxt = (e) => { try { return (e.ps || []).map((p) => (p.r || []).map((r) => String(r && r.t != null ? r.t : "")).join("")).join("\n"); } catch (x) { return ""; } };
  const skipEl = (e) => !e || e.k !== "text" || !Array.isArray(e.ps) || e.v54 || /^(draft|v54draft|v54note|pno|deco)$/.test(e.name || "");

  /* ════════════ No.546 和名の参考の列：印を付け、英語のみの点検から外す ════════════ */
  const JAHDR = { en: "Japanese name (reference)", zhCN: "日文名称（参考）", zhTW: "日文名稱（參考）", es: "Nombre japonés (referencia)", fr: "Nom japonais (référence)", de: "Japanischer Name (Referenz)", ko: "일본어 명칭(참고)", pt: "Nome japonês (referência)", it: "Nome giapponese (riferimento)", vi: "Tên tiếng Nhật (tham khảo)", id: "Nama Jepang (referensi)", th: "ชื่อภาษาญี่ปุ่น (อ้างอิง)", ms: "Nama Jepun (rujukan)" };
  const hdrFor = (lg) => JAHDR[lg] || JAHDR[String(lg || "").slice(0, 2)] || JAHDR.en;
  // 和名の列の見出し（21.99 の言い方・この層の言い方のどれでも）
  const HDR_RE = /^(Japanese label name|Japanese name \(reference\)|日文标示名称|日文標示名稱|日文名称（参考）|日文名稱（參考）|Nombre en la etiqueta japonesa|Nombre japonés \(referencia\)|Nom sur l'étiquette japonaise|Nom japonais \(référence\)|Japanische Etikettenbezeichnung|Japanischer Name \(Referenz\)|일본어 표시 명칭|일본어 명칭\(참고\)|Nome japonês \(referência\)|Nome giapponese \(riferimento\)|Tên tiếng Nhật \(tham khảo\)|Nama Jepang \(referensi\)|ชื่อภาษาญี่ปุ่น \(อ้างอิง\)|Nama Jepun \(rujukan\))$/;
  function markDeck(deck) {
    let n = 0;
    try {
      if (!deck || !Array.isArray(deck.slides) || !deck.lang || /^ja/.test(deck.lang)) return 0;
      deck.slides.forEach((S) => {
        const els = (S && S.els) || [];
        els.forEach((h) => {
          if (!h || h.k !== "text" || !Array.isArray(h.ps)) return;
          const t = elTxt(h).replace(/\s+/g, " ").trim();
          if (!h.v100jaHdr && !HDR_RE.test(t)) return;
          // 見出しを「参考」と分かる名前に（1つの run にまとめて書く）
          const want = hdrFor(deck.lang);
          if (t !== want) { try { const p0 = h.ps[0]; const r0 = (p0.r || [])[0]; if (r0) { r0.t = want; p0.r = [r0]; h.ps = [p0]; delete h.mh; } } catch (x) { /* そのまま */ } }
          h.v100jaHdr = 1;
          const hx = +h.x, hy = +h.y, hw = +h.w;
          els.forEach((e) => {
            if (!e || e === h || e.k !== "text" || !Array.isArray(e.ps) || /^(foot|pno|title|draft|v54draft|deco)$/.test(e.name || "")) return;
            if (Math.abs((+e.x) - hx) > 3 || (+e.y) <= hy || Math.abs((+e.w) - hw) > Math.max(24, hw * 0.12)) return;
            if (!e.v100ja) { e.v100ja = 1; n++; }
          });
        });
      });
    } catch (e) { err("mark", e); }
    if (n) cnt("jaMark", n);
    return n;
  }
  V100OUT.markDeck = markDeck;
  const marked = (deck) => { let k = 0; try { (deck.slides || []).forEach((S) => (S.els || []).forEach((e) => { if (e && e.v100ja) k++; })); } catch (x) { /* 0 */ } return k; };
  // 点検の間だけ、印の付いた欄を「—」に置き換える（どの層の点検・訳の直しにも触らせない）。何重にかけても同じ。
  let HIDING = 0;
  function withHidden(deck, fn) {
    if (!deck || !Array.isArray(deck.slides) || HIDING) return fn();
    const hid = [];
    HIDING = 1;
    try {
      markDeck(deck);
      deck.slides.forEach((S) => (S.els || []).forEach((e) => {
        if (!e || !e.v100ja || !Array.isArray(e.ps)) return;
        hid.push({ e, ps: e.ps, mh: e.mh });
        e.ps = [{ r: [Object.assign({}, ((e.ps[0] || {}).r || [])[0] || {}, { t: "—" })] }].map((p, i) => Object.assign({}, e.ps[0] || {}, p));
      }));
    } catch (x) { err("hide", x); }
    try { return fn(); } finally {
      hid.forEach((h) => { try { h.e.ps = h.ps; if (h.mh === undefined) delete h.e.mh; else h.e.mh = h.mh; } catch (x) { /* 戻すだけ */ } });
      HIDING = 0;
    }
  }
  V100OUT.withHidden = withHidden;
  // 全成分表が「水/Water」「コメ発酵液/Rice Ferment Filtrate｜Sake」のように1つの欄に和名と INCI 名が入った形（本物の AI のヒアリングで出た形）でも、
  // 資料の INCI 表を「INCI 名｜和名（参考）」の2列にする（登録の値は変えない。資料の表だけ）
  const JAINCI = /^(.*?[ぁ-ゖァ-ヺ一-龯々].*?)\s*[/／]\s*([A-Za-z][A-Za-z0-9 ,.\-'&+]*(?:\([A-Za-z0-9 ,.\-'&+]+\))?)\s*$/;
  function splitInci(t) {
    try {
      if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return null;
      let hit = 0;
      const rows = t.compRows.map((r) => {
        if (!Array.isArray(r)) return null;
        const c0 = NF(r[0] == null ? "" : r[0]).trim().replace(/^.*?[：:]\s*(?=[^：:]*[/／])/, ""), c1 = NF(r[1] == null ? "" : r[1]).trim();
        const m = c0.match(JAINCI);
        if (!m) {
          // 「BG/Butylene Glycol」（略称/INCI 名）：和名は無し（「—」）
          const m2 = c0.match(/^([A-Za-z0-9.\- ]{1,12})\s*[/／]\s*([A-Za-z][A-Za-z0-9 ,.\-'&+()]{2,})$/);
          if (m2) { hit++; return [m2[2].trim(), ""]; }
          return null;
        }
        hit++;
        let inc = m[2].trim();
        if (c1 && c1 !== inc && /^[A-Za-z][A-Za-z0-9\-]{0,20}$/.test(c1) && !/\(/.test(inc)) inc = inc + " (" + c1 + ")";
        return [inc, m[1].trim()];
      });
      if (hit < Math.max(2, Math.ceil(t.compRows.length * 0.6))) return null;
      return rows.filter(Boolean);
    } catch (e) { err("inci", e); return null; }
  }
  V100OUT.splitInci = splitInci;
  if (typeof v99dkInciRows === "function") {
    const __ir100 = v99dkInciRows;
    v99dkInciRows = function (t) { // eslint-disable-line no-global-assign
      const r = __ir100.apply(this, arguments);
      try {
        const s2 = splitInci(t);
        if (s2 && s2.length && (!r || r.length < s2.length || r.some((x) => x && /[/／]/.test(String(x[1] || ""))))) {
          try { if (typeof V99DK_JAOK !== "undefined") s2.forEach((x) => { if (x[1]) V99DK_JAOK.add(x[1]); }); } catch (e) { /* 控えは無くてよい */ }
          cnt("inciSplit");
          return s2;
        }
      } catch (e) { err("inciRows", e); }
      return r;
    };
  }
  // 和名は「Japanese name (reference)」の列だけに出す。21.99 の作りは全成分表を「INCI 名｜和名」の2列にして資料のどこにでも渡すため、
  // 成分のページ（KEY INGREDIENT・成分の札）では和名を「量」の欄と読んで大きく出したり（「グリセリン」）、札に「Glycerin グリセリン」とつないだりして、
  // そこが「English になっていない」と数えられて納品版が止まっていた（本物の AI の資料・UAT の D の6枚目と同じ形）。参考の列の外の和名は外す。
  function jaMap() {
    const m = new Map();
    try {
      const g = G(); const T = (g && g.run && g.ten) || (g && g.ten) || ten();
      const P = (typeof dk3Prods === "function") ? (dk3Prods(T) || [T]) : [T];
      P.forEach((t) => { try { const rows = typeof v99dkInciRows === "function" ? v99dkInciRows(t) : null; (rows || []).forEach((r) => { if (r && r[1] && JA.test(r[1]) && r[0]) m.set(String(r[1]).trim(), String(r[0]).trim()); }); } catch (e) { /* 次へ */ } });
    } catch (e) { err("jamap", e); }
    return m;
  }
  function stripJaOutside(deck) {
    let n = 0;
    try {
      if (!deck || !Array.isArray(deck.slides) || !deck.lang || /^ja/.test(deck.lang)) return 0;
      // 和名の列を入れる設定（化粧品の既定）のときだけ。参考の列が無い資料（成分のページに全成分が入って表が出ない形）でも、成分のページの和名は外す
      try { const g = G(); const T = (g && g.ten) || ten(); if (typeof v99dkJaColOn === "function" && !v99dkJaColOn(T)) return 0; } catch (e) { /* 次へ */ }
      const M0 = jaMap();
      if (!M0.size) return 0;
      const keys = [...M0.keys()].sort((a, b) => b.length - a.length);
      const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      deck.slides.forEach((S) => (S.els || []).forEach((e) => {
        if (!e || e.k !== "text" || e.v100ja || e.v100jaHdr || !Array.isArray(e.ps)) return;
        let ch = false;
        const others = (S.els || []).filter((x) => x && x !== e && x.k === "text").map(elTxt).join(" | ");
        e.ps.forEach((p) => (p.r || []).forEach((r) => {
          if (!r || typeof r.t !== "string" || !JA.test(r.t)) return;
          let t = r.t;
          // 和名だけの run（成分のページの大きな数字の欄など）：同じページに INCI 名があれば空に（同じ名前を2回並べない）
          const tt = t.trim();
          if (M0.has(tt) && others.indexOf(M0.get(tt)) >= 0) { r.t = ""; ch = true; return; }
          keys.forEach((ja) => {
            if (t.indexOf(ja) < 0) return;
            const inc = M0.get(ja);
            // 「Glycerin グリセリン」「Glycerin（グリセリン）」→「Glycerin」／和名だけ →（INCI 名があれば外す・無ければ INCI 名に）
            t = t.replace(new RegExp("\\s*[（(]\\s*" + esc(ja) + "\\s*[）)]", "g"), "");
            if (inc && t.indexOf(inc) >= 0) t = t.replace(new RegExp("\\s*" + esc(ja), "g"), "");
            else t = t.split(ja).join(inc || "");
          });
          if (t !== r.t) { r.t = t.replace(/\s{2,}/g, " ").replace(/^\s+$/, ""); ch = true; }
        }));
        if (ch) { n++; try { delete e.mh; } catch (x) { /* そのまま */ } }
      }));
    } catch (e) { err("stripja", e); }
    if (n) cnt("jaOutside", n);
    return n;
  }
  V100OUT.stripJaOutside = stripJaOutside;
  if (typeof dk3Model === "function") {
    const __dm100 = dk3Model;
    dk3Model = function () { // eslint-disable-line no-global-assign
      const r = __dm100.apply(this, arguments);
      try { if (r && Array.isArray(r.slides)) { markDeck(r); stripJaOutside(r); } } catch (e) { err("model", e); }
      return r;
    };
  }
  if (typeof v97dkScanDeck === "function") {
    const __sd100 = v97dkScanDeck;
    v97dkScanDeck = function (deck) { const a = arguments, self = this; return withHidden(deck, () => __sd100.apply(self, a)); }; // eslint-disable-line no-global-assign
    try { if (typeof V97DK !== "undefined" && V97DK) V97DK.scanDeck = v97dkScanDeck; } catch (e) { /* 無くてよい */ }
  }
  if (typeof v5326kScan === "function") {
    const __ks100 = v5326kScan;
    v5326kScan = function (deck) { const a = arguments, self = this; return withHidden(deck, () => __ks100.apply(self, a)); }; // eslint-disable-line no-global-assign
  }

  /* ════════════ No.532 仕様の値によく出る日本語を、決まった訳で（AI に頼らない） ════════════ */
  const UNIT = { "袋": ["bag", "bags"], "個": ["pc", "pcs"], "本": ["pc", "pcs"], "箱": ["box", "boxes"], "枚": ["pc", "pcs"], "セット": ["set", "sets"], "ケース": ["case", "cases"], "缶": ["can", "cans"], "瓶": ["bottle", "bottles"], "パック": ["pack", "packs"], "足": ["pair", "pairs"], "組": ["set", "sets"], "台": ["unit", "units"], "点": ["item", "items"], "粒": ["piece", "pieces"], "包": ["sachet", "sachets"], "錠": ["tablet", "tablets"], "ボトル": ["bottle", "bottles"] };
  const UNIT_ES = { "袋": "bolsas", "個": "uds.", "本": "uds.", "箱": "cajas", "枚": "uds.", "セット": "juegos", "ケース": "cajas", "缶": "latas", "瓶": "botellas", "パック": "paquetes", "足": "pares", "組": "juegos", "台": "uds.", "点": "artículos", "粒": "piezas", "包": "sobres", "錠": "comprimidos", "ボトル": "botellas" };
  const UNIT_RE = "(袋|個|本|箱|枚|セット|ケース|缶|瓶|パック|足|組|台|点|粒|包|錠|ボトル)";
  const PER = { en: (u) => u, es: (u) => u };
  const pl = (n, u) => { const a = UNIT[u] || [u, u]; return (+String(n).replace(/,/g, "") === 1 ? a[0] : a[1]); };
  const MON = "(?:か月|ヶ月|ケ月|カ月|ヵ月|箇月|ヵ月間|か月間|ヶ月間)";
  function tUnit(n, k, L) { // k: m（月）・y（年）・d（日）・w（週）
    const one = +String(n).replace(/,/g, "") === 1;
    const T = { en: { m: ["month", "months"], y: ["year", "years"], d: ["day", "days"], w: ["week", "weeks"] }, es: { m: ["mes", "meses"], y: ["año", "años"], d: ["día", "días"], w: ["semana", "semanas"] }, fr: { m: ["mois", "mois"], y: ["an", "ans"], d: ["jour", "jours"], w: ["semaine", "semaines"] }, de: { m: ["Monat", "Monate"], y: ["Jahr", "Jahre"], d: ["Tag", "Tage"], w: ["Woche", "Wochen"] } }[L] || null;
    const a = (T || { m: ["month", "months"], y: ["year", "years"], d: ["day", "days"], w: ["week", "weeks"] })[k];
    return n + " " + (one ? a[0] : a[1]);
  }
  const uk = (s) => /年/.test(s) ? "y" : /日/.test(s) ? "d" : /週/.test(s) ? "w" : "m";
  // 決まった言い方（全体・文の中のどちらでも）
  function pats(L) {
    const P = {
      en: { from: "from the date of manufacture", unopened: " (unopened)", after: "after delivery", order: "after order", open: "after opening", ages: (a) => "ages " + a + "+", agesR: (a, b) => "ages " + a + "–" + b, under: (a) => "under " + a + " years", months: (a) => a + " months and up", perC: (n, u) => n + " " + pl(n, u) + " per carton", perI: (n, u) => n + " " + pl(n, u) + " per inner box", perP: (n, u) => n + " " + pl(n, u) + " per pack", moq: (n, u) => n + "+ " + pl(n, u), qty: (n, u) => n + " " + pl(n, u) },
      es: { from: "desde la fecha de fabricación", unopened: " (sin abrir)", after: "tras la entrega", order: "tras el pedido", open: "tras la apertura", ages: (a) => "a partir de " + a + " años", agesR: (a, b) => "de " + a + " a " + b + " años", under: (a) => "menores de " + a + " años", months: (a) => "a partir de " + a + " meses", perC: (n, u) => n + " " + (UNIT_ES[u] || u) + " por caja", perI: (n, u) => n + " " + (UNIT_ES[u] || u) + " por caja interior", perP: (n, u) => n + " " + (UNIT_ES[u] || u) + " por paquete", moq: (n, u) => n + "+ " + (UNIT_ES[u] || u), qty: (n, u) => n + " " + (UNIT_ES[u] || u) },
      fr: { from: "à compter de la date de fabrication", unopened: " (non ouvert)", after: "après livraison", order: "après commande", open: "après ouverture", ages: (a) => "dès " + a + " ans", agesR: (a, b) => "de " + a + " à " + b + " ans", under: (a) => "moins de " + a + " ans", months: (a) => "dès " + a + " mois", perC: (n, u) => n + " " + pl(n, u) + " par carton", perI: (n, u) => n + " " + pl(n, u) + " par boîte intérieure", perP: (n, u) => n + " " + pl(n, u) + " par paquet", moq: (n, u) => n + "+ " + pl(n, u), qty: (n, u) => n + " " + pl(n, u) },
      de: { from: "ab Herstellungsdatum", unopened: " (ungeöffnet)", after: "nach Lieferung", order: "nach Bestellung", open: "nach dem Öffnen", ages: (a) => "ab " + a + " Jahren", agesR: (a, b) => a + "–" + b + " Jahre", under: (a) => "unter " + a + " Jahren", months: (a) => "ab " + a + " Monaten", perC: (n, u) => n + " " + pl(n, u) + " pro Karton", perI: (n, u) => n + " " + pl(n, u) + " pro Innenkarton", perP: (n, u) => n + " " + pl(n, u) + " pro Packung", moq: (n, u) => n + "+ " + pl(n, u), qty: (n, u) => n + " " + pl(n, u) }
    };
    return P[L] || P.en;
  }
  // 語（長い順に当てる）。英語以外の資料は、決まった言い方（年齢・期間・入数）だけその言語、語は英語（v97 の訳語の表と同じ扱い）
  const WORDS = [
    // 項目名
    ["対象年齢", "Age"], ["適応年齢", "Age"], ["原産国", "Country of origin"], ["原産地", "Origin"], ["製造国", "Country of manufacture"], ["保存方法", "Storage"], ["保管方法", "Storage"], ["賞味期限", "Best before"], ["消費期限", "Use by"], ["使用期限", "Expiry"], ["有効期限", "Expiry"],
    ["内容量", "Net content"], ["入数", "Quantity"], ["寸法", "Dimensions"], ["サイズ", "Size"], ["重量", "Weight"], ["重さ", "Weight"], ["質量", "Mass"], ["容量", "Capacity"], ["材質", "Material"], ["素材", "Material"], ["材料", "Material"], ["本体", "Body"], ["塗料", "Paint"], ["塗装", "Finish"], ["色", "Color"], ["カラー", "Color"],
    ["保証", "Warranty"], ["容器", "Container"], ["内容液", "Liquid"], ["ラベル", "Label"], ["耳ひも", "Ear loops"], ["シールド", "Shield"], ["内外輪", "Inner and outer rings"], ["摩擦材", "Friction material"], ["裏板", "Backing plate"], ["原材料名", "Ingredients"], ["原材料", "Ingredients"], ["滅菌", "Sterilization"], ["分類", "Classification"], ["規格", "Standard"], ["型番", "Model no."], ["品番", "Item no."], ["用途", "Use"], ["個装", "Unit pack"], ["単品", "Unit"], ["外装", "Outer carton"], ["内装", "Inner pack"], ["外箱", "Outer box"], ["梱包", "Packing"], ["パレット", "pallet"], ["ケース", "case"], ["付属品", "Accessories"], ["電源", "Power supply"], ["電圧", "Voltage"], ["定格", "Rating"],
    // 保証・状態
    ["初期不良のみ交換", "Replacement for initial defects only"], ["初期不良のみ", "initial defects only"], ["初期不良", "initial defects"], ["保証なし", "No warranty"], ["交換", "replacement"], ["返品", "return"], ["修理", "repair"],
    // あり・なし
    ["該当なし", "Not applicable"], ["対象外", "Not applicable"], ["非該当", "Not applicable"], ["不要", "Not required"], ["あり", "Yes"], ["有り", "Yes"], ["なし", "None"], ["無し", "None"], ["不使用", "not used"], ["使用", "used"], ["試験済み", "tested"], ["試験済", "tested"], ["済み", "done"], ["適合", "compliant"], ["未開封", "unopened"], ["開封後", "after opening"], ["約", "approx. "], ["以上", " or more"], ["以下", " or less"], ["未満", " or less"],
    // 保管
    ["直射日光・高温多湿を避けて常温で保存", "Store at room temperature away from direct sunlight, high temperature and humidity"], ["直射日光・高温多湿を避けて保存", "Store away from direct sunlight, high temperature and humidity"], ["直射日光・高温多湿を避けて", "away from direct sunlight, high temperature and humidity"], ["直射日光を避けて常温で保存", "Store at room temperature away from direct sunlight"], ["直射日光を避けて", "away from direct sunlight"],
    ["高温多湿を避けて", "away from high temperature and humidity"], ["高温多湿", "high temperature and humidity"], ["直射日光", "direct sunlight"], ["常温で保存", "Store at room temperature"], ["冷蔵で保存", "Keep refrigerated"], ["冷凍で保存", "Keep frozen"], ["常温", "Ambient"], ["冷蔵", "Refrigerated"], ["冷凍", "Frozen"], ["涼しい場所", "a cool place"], ["冷暗所", "a cool, dark place"], ["乾燥した場所", "a dry place"], ["保存", "store"], ["保管", "store"],
    // 材質
    ["ポリプロピレン不織布", "Polypropylene non-woven fabric"], ["不織布", "Non-woven fabric"], ["ポリプロピレン", "Polypropylene"], ["ポリエチレン", "Polyethylene"], ["ポリエステル", "Polyester"], ["ポリウレタン", "Polyurethane"], ["ポリカーボネート", "Polycarbonate"], ["ナイロン", "Nylon"], ["アクリル", "Acrylic"], ["シリコーン", "Silicone"], ["シリコン", "Silicone"], ["ゴム", "Rubber"], ["樹脂", "Resin"], ["プラスチック", "Plastic"],
    ["ステンレス", "Stainless steel"], ["軸受鋼", "Bearing steel"], ["鋼板", "Steel sheet"], ["鋼", "Steel"], ["鉄", "Iron"], ["アルミニウム", "Aluminum"], ["アルミ", "Aluminum"], ["真鍮", "Brass"], ["銅", "Copper"], ["チタン", "Titanium"], ["セラミック系", "Ceramic-based"], ["セラミック", "Ceramic"], ["ノンアスベスト", "Non-asbestos"],
    ["ヒノキ", "Hinoki cypress"], ["檜", "Hinoki cypress"], ["ブナ材", "Beech wood"], ["ブナ", "Beech"], ["スギ", "Japanese cedar"], ["杉", "Japanese cedar"], ["ナラ", "Oak"], ["オーク", "Oak"], ["竹", "Bamboo"], ["天然木", "Natural wood"], ["木製", "Wooden"], ["木材", "Wood"], ["合板", "Plywood"],
    ["綿", "Cotton"], ["コットン", "Cotton"], ["麻", "Linen"], ["絹", "Silk"], ["羊毛", "Wool"], ["ウール", "Wool"], ["革", "Leather"], ["紙", "Paper"], ["段ボール", "Corrugated cardboard"], ["ガラス", "Glass"], ["陶器", "Ceramic"], ["磁器", "Porcelain"],
    ["食品衛生法の試験済み", "tested under the Food Sanitation Act (Japan)"], ["食品衛生法適合", "compliant with the Food Sanitation Act (Japan)"], ["水性塗料", "Water-based paint"], ["植物油塗料", "Plant-oil paint"], ["ウレタン塗装", "Urethane finish"], ["無塗装", "Unpainted"], ["食品衛生法", "the Food Sanitation Act (Japan)"], ["PETボトル", "PET bottle"], ["トリガー式", "trigger type"], ["次亜塩素酸水", "Hypochlorous acid water"], ["食品に触れる部材", "parts that touch food"],
    // 色
    ["合成着色料", "artificial colorants"], ["防腐剤", "preservatives"], ["保存料", "preservatives"], ["着色料", "colorants"], ["香料", "fragrance"], ["添加物", "additives"], ["パラベン", "parabens"], ["アルコール", "alcohol"], ["ナチュラル", "Natural"], ["ホワイト", "White"], ["ブラック", "Black"], ["グレー", "Gray"], ["ネイビー", "Navy"], ["ベージュ", "Beige"], ["ピンク", "Pink"], ["オレンジ", "Orange"], ["生成り", "Off-white"], ["透明", "Clear"], ["白", "White"], ["黒", "Black"], ["赤", "Red"], ["青", "Blue"], ["緑", "Green"], ["黄", "Yellow"], ["茶", "Brown"], ["灰", "Gray"], ["紫", "Purple"], ["銀", "Silver"], ["金", "Gold"],
    // 原産
    ["日本製", "Made in Japan"], ["国産", "Japan"], ["日本", "Japan"], ["中国", "China"], ["韓国", "South Korea"], ["台湾", "Taiwan"], ["ベトナム", "Vietnam"], ["タイ", "Thailand"], ["インドネシア", "Indonesia"], ["アメリカ", "USA"], ["米国", "USA"],
    // 人・対象
    ["お子様", "children"], ["子ども", "children"], ["子供", "children"], ["幼児", "toddlers"], ["向け", ""], ["対象", ""], ["のみ", " only"], ["と", " and "], ["で", " "], ["の", " "], ["は", " "], ["を", " "], ["に", " "]
  ];
  const PREF = { "北海道": "Hokkaido", "青森": "Aomori", "岩手": "Iwate", "宮城": "Miyagi", "秋田": "Akita", "山形": "Yamagata", "福島": "Fukushima", "茨城": "Ibaraki", "栃木": "Tochigi", "群馬": "Gunma", "埼玉": "Saitama", "千葉": "Chiba", "東京": "Tokyo", "神奈川": "Kanagawa", "新潟": "Niigata", "富山": "Toyama", "石川": "Ishikawa", "福井": "Fukui", "山梨": "Yamanashi", "長野": "Nagano", "岐阜": "Gifu", "静岡": "Shizuoka", "愛知": "Aichi", "三重": "Mie", "滋賀": "Shiga", "京都": "Kyoto", "大阪": "Osaka", "兵庫": "Hyogo", "奈良": "Nara", "和歌山": "Wakayama", "鳥取": "Tottori", "島根": "Shimane", "岡山": "Okayama", "広島": "Hiroshima", "山口": "Yamaguchi", "徳島": "Tokushima", "香川": "Kagawa", "愛媛": "Ehime", "高知": "Kochi", "福岡": "Fukuoka", "佐賀": "Saga", "長崎": "Nagasaki", "熊本": "Kumamoto", "大分": "Oita", "宮崎": "Miyazaki", "鹿児島": "Kagoshima", "沖縄": "Okinawa" };
  const WORDS_S = WORDS.slice().sort((a, b) => b[0].length - a[0].length);
  function userFix(s, lg) {
    try {
      const T = (G() && G().run && G().ten) || ten();
      const F = T && T.v100trFix && T.v100trFix[lg];
      if (!F) return null;
      const k = NF(s).trim();
      return F[k] != null ? String(F[k]) : null;
    } catch (e) { return null; }
  }
  function specTr(s0, lg) {
    try {
      const s = String(s0 == null ? "" : s0);
      if (!s.trim() || !lg || /^(ja|zh|ko)/.test(lg) || !JA.test(s)) return null;
      const u = userFix(s, lg);
      if (u != null) return u;
      const L = /^es/.test(lg) ? "es" : /^fr/.test(lg) ? "fr" : /^de/.test(lg) ? "de" : "en";
      const P = pats(L);
      let x = NF(s).replace(/　/g, " ");
      // 期間
      x = x.replace(new RegExp("未開封(?:で|の場合|時)?[、,\\s]*(?:製造(?:日)?(?:から|より|後))\\s*([\\d,]+)\\s*(" + MON + "|年(?:間)?|日(?:間)?|週間)", "g"), (m, n, k) => tUnit(n, uk(k), L) + " " + P.from + P.unopened);
      x = x.replace(new RegExp("製造(?:日)?(?:から|より|後)\\s*([\\d,]+)\\s*(" + MON + "|年(?:間)?|日(?:間)?|週間)", "g"), (m, n, k) => tUnit(n, uk(k), L) + " " + P.from);
      x = x.replace(new RegExp("(?:納品|納入|お届け)(?:日)?(?:から|より|後)\\s*([\\d,]+)\\s*(" + MON + "|年(?:間)?|日(?:間)?|週間)", "g"), (m, n, k) => tUnit(n, uk(k), L) + " " + P.after);
      x = x.replace(new RegExp("(?:受注|注文|発注)(?:日)?(?:から|より|後)\\s*([\\d,]+)\\s*(" + MON + "|年(?:間)?|日(?:間)?|営業日|週間)", "g"), (m, n, k) => (/営業日/.test(k) ? n + (L === "en" ? " business days" : " " + tUnit(n, "d", L).split(" ")[1]) : tUnit(n, uk(k), L)) + " " + P.order);
      x = x.replace(new RegExp("開封後(?:は)?\\s*([\\d,]+)\\s*(" + MON + "|年(?:間)?|日(?:間)?|週間)(?:以内)?", "g"), (m, n, k) => tUnit(n, uk(k), L) + " " + P.open);
      // 年齢
      x = x.replace(/生後\s*(\d+)\s*(?:か月|ヶ月|カ月|ヵ月)\s*(?:以上|から|〜|～)?/g, (m, a) => P.months(a));
      x = x.replace(/(\d+)\s*(?:歳|才)\s*(?:〜|～|-|から)\s*(\d+)\s*(?:歳|才)(?:まで)?/g, (m, a, b) => P.agesR(a, b));
      x = x.replace(/(\d+)\s*(?:歳|才)\s*(?:以上|から|〜|～)(?:\s*(?:の)?\s*(?:お子様|子ども|子供|幼児)?\s*(?:向け|対象)?)?/g, (m, a) => P.ages(a));
      x = x.replace(/(\d+)\s*(?:歳|才)\s*未満/g, (m, a) => P.under(a));
      x = x.replace(/(\d+)\s*(?:歳|才)/g, (m, a) => a + (L === "en" ? " years old" : L === "es" ? " años" : L === "fr" ? " ans" : " Jahre"));
      // 入数・数量
      x = x.replace(new RegExp("(?:外装|外箱|カートン|ケース|段ボール)\\s*(?:1\\s*(?:箱|ケース)\\s*(?:に|あたり)?)?\\s*([\\d,]+)\\s*" + UNIT_RE + "\\s*入り?", "g"), (m, n, u) => P.perC(n, u));
      x = x.replace(new RegExp("(?:内箱|内装)\\s*([\\d,]+)\\s*" + UNIT_RE + "\\s*入り?", "g"), (m, n, u) => P.perI(n, u));
      x = x.replace(new RegExp("([\\d,]+)\\s*" + UNIT_RE + "\\s*入り?(?![\\d])", "g"), (m, n, u, off, all) => /入/.test(m) ? P.perP(n, u) : m);
      x = x.replace(new RegExp("([\\d,]+)\\s*" + UNIT_RE + "\\s*以上", "g"), (m, n, u) => P.moq(n, u));
      x = x.replace(new RegExp("([\\d,]+)\\s*" + UNIT_RE + "(?![ぁ-ゖァ-ヺ一-龯])", "g"), (m, n, u) => P.qty(n, u));
      // 期間（単独）・年
      x = x.replace(new RegExp("([\\d,]+)\\s*(" + MON + ")", "g"), (m, n) => tUnit(n, "m", L));
      x = x.replace(/(\d{4})\s*年\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?/g, (m, y, mo, d) => y + "-" + String(mo).padStart(2, "0") + (d ? "-" + String(d).padStart(2, "0") : ""));
      x = x.replace(/(\d{4})\s*年(?:製)?(?![\d間])/g, (m, y) => y);
      x = x.replace(/([\d,]+)\s*年(?:間)?/g, (m, n) => tUnit(n, "y", L));
      x = x.replace(/([\d,]+)\s*日(?:間)?/g, (m, n) => tUnit(n, "d", L));
      // 県・都・府・道・市
      x = x.replace(/(北海道|青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|東京|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|京都|大阪|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄)(?:県|都|府)?(?:産)?/g, (m, k) => " " + PREF[k] + (/県/.test(m) ? " Prefecture" : "") + (/産$/.test(m) ? " (origin)" : "") + " ");
      // 長い言い方（句読点をまたぐもの）を先に
      WORDS_S.forEach(([ja, en]) => { if (ja.length >= 5 && /[・、／：:,]/.test(ja) && x.indexOf(ja) >= 0) x = x.split(ja).join(" " + en + " "); });
      // 区切りごと：否定（〜なし・〜不使用・〜を含まない・〜ではない）は語の向きを変えずに訳す
      const word = (seg) => { let y = seg; WORDS_S.forEach(([ja, en]) => { if (y.indexOf(ja) >= 0) y = y.split(ja).join(" " + en + " "); }); return y.replace(/\s{2,}/g, " ").trim(); };
      const NEG = [[/^(.+?)(?:は|が)?\s*(?:なし|無し|ない|ありません)$/, (c) => "No " + c], [/^(.+?)(?:は|を)?\s*(?:不使用|使用していません|使っていません|使わない)$/, (c) => "No " + c + " used"], [/^(.+?)(?:は|を)?\s*(?:含まない|含みません|含有しない)$/, (c) => "Does not contain " + c], [/^(.+?)(?:では|じゃ)\s*(?:ない|ありません)$/, (c) => "Not " + c]];
      x = x.split(/([、，,・／\/：:（）()]+)/).map((seg) => {
        if (!JA.test(seg)) return seg;
        const sg = seg.trim();
        if (/^(?:なし|無し)$/.test(sg)) return " " + (L === "es" ? "Ninguno" : L === "fr" ? "Aucun" : L === "de" ? "Keine" : "None") + " ";
        for (const [re, f] of NEG) { const m = sg.match(re); if (m && m[1] && JA.test(m[1])) { const c = word(m[1]); if (c && !JA.test(c)) return " " + f(c.charAt(0).toLowerCase() + c.slice(1)) + " "; } }
        return " " + word(seg) + " ";
      }).join("");
      // 句読点
      x = x.replace(/（/g, " (").replace(/）/g, ")").replace(/、|，/g, ", ").replace(/。/g, ". ").replace(/・/g, ", ").replace(/：/g, ": ").replace(/／/g, " / ").replace(/[〜～]/g, "–").replace(/「|」|『|』/g, "\"");
      x = x.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").replace(/\s+([,.:;)])/g, "$1").replace(/,\s*,/g, ",").replace(/:(?=[A-Za-z(])/g, ": ").replace(/\s{2,}/g, " ").replace(/^[\s,:;/]+|[\s,;/]+$/g, "").trim();
      if (!x || JA.test(x)) return null;
      if (/^[a-z]/.test(x)) x = x.charAt(0).toUpperCase() + x.slice(1);
      cnt("specTr");
      return x;
    } catch (e) { err("specTr", e); return null; }
  }
  V100OUT.specTr = specTr;
  if (typeof v97dkTermFix === "function") {
    const __tf100 = v97dkTermFix;
    v97dkTermFix = function (s, lg) { // eslint-disable-line no-global-assign
      let r = null;
      try { const u = userFix(s, lg); if (u != null && !jpFor(lg, u)) { cnt("userFix"); return u; } } catch (e) { /* 次へ */ }
      try { r = __tf100.apply(this, arguments); } catch (e) { r = null; }
      if (r != null) return r;
      try {
        const x = specTr(s, lg);
        if (x != null && !jpFor(lg, x)) {
          try { if (typeof dk3TrOk === "function" && dk3TrOk(s, x, lg)) return null; } catch (e) { return null; }
          return x;
        }
      } catch (e) { err("termfix", e); }
      return null;
    };
    try { if (typeof V97DK !== "undefined" && V97DK) V97DK.termFix = v97dkTermFix; } catch (e) { /* 無くてよい */ }
  }

  /* 残った日本語の一覧（印の付いた和名の列・下書きの印を除く） */
  function leftJa(deck) {
    const out = [];
    try {
      if (!deck || !deck.lang || /^ja/.test(deck.lang)) return out;
      markDeck(deck);
      const seen = new Map();
      deck.slides.forEach((S, si) => (S.els || []).forEach((e) => {
        if (skipEl(e) || e.v100ja) return;
        (e.ps || []).forEach((p) => (p.r || []).forEach((r) => {
          if (!r || r.t == null) return;
          const t = String(r.t);
          if (!t.trim() || !jpFor(deck.lang, t)) return;
          const k = t.trim();
          if (seen.has(k)) { const o = seen.get(k); if (o.pages.indexOf(si + 1) < 0) o.pages.push(si + 1); o.n++; return; }
          const o = { t: k, pages: [si + 1], kind: S.kind || "", n: 1, sug: specTr(k, deck.lang) };
          seen.set(k, o); out.push(o);
        }));
      }));
    } catch (e) { err("left", e); }
    return out;
  }
  V100OUT.leftJa = leftJa;

  /* ════════════ 最終チェック（いちばん外）：和名の参考の列を点検から外す・残った日本語の数 ════════════ */
  if (typeof dk3Check === "function") {
    const __ck100 = dk3Check;
    dk3Check = function (deck, ctx) { // eslint-disable-line no-global-assign
      const a = arguments, self = this;
      let r;
      try { if (deck && deck.lang && !/^ja/.test(deck.lang)) { markDeck(deck); stripJaOutside(deck); } } catch (e) { err("ck0", e); }
      r = withHidden(deck, () => __ck100.apply(self, a));
      try {
        if (!r || !deck || !deck.lang || /^ja/.test(deck.lang)) return r;
        r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
        const n = marked(deck);
        if (n) {
          r.ok = r.ok.filter((x) => !/^INCI 表に和名（Japanese label name）の列を入れました/.test(String(x)));
          const msg = "INCI 表に和名の参考の列（" + hdrFor(deck.lang) + "）を入れました（" + Math.max(0, n) + "欄。わざと日本語にした列のため、英語のみの点検の対象外）";
          if (r.ok.indexOf(msg) < 0) r.ok.push(msg);
        }
        V100OUT.lastCk = { at: Date.now(), uid: pkey(G() && G().ten), jaRef: n, left: leftJa(deck).length };
      } catch (e) { err("ck", e); }
      return r;
    };
  }
  /* 保存した資料を開いたとき（和名の列の印を付け直す。前の層の点検より先に） */
  if (typeof dk14Open === "function") {
    const __op100 = dk14Open;
    dk14Open = async function () { // eslint-disable-line no-global-assign
      const r = await __op100.apply(this, arguments);
      try {
        const g = G();
        if (g && g.deck && !g.run && g.deck.lang && !/^ja/.test(g.deck.lang)) {
          markDeck(g.deck);
          // 前の版で保存した資料の「日本語が残っている」の止めを点検し直す（和名の参考の列は外す。ほかの日本語が残っていれば、そのまま止める）
          if (g.check && (g.check.crit || []).some((c) => c && c.k === "jp")) {
            reCheckJa(g.deck, g.check, true);
            if (typeof render === "function" && typeof cur !== "undefined" && cur === "deck") render();
          }
        }
      } catch (e) { err("open", e); }
      return r;
    };
  }
  /* 日本語の残りだけを点検し直す（その場で直した後・開き直したとき） */
  function reCheckJa(deck, ck, opened) {
    try {
      if (!deck || !ck) return;
      ck.crit = ck.crit || []; ck.warn = ck.warn || []; ck.ok = ck.ok || [];
      const L = leftJa(deck);
      let sc = null;
      try { sc = typeof v5326kScan === "function" ? v5326kScan(deck) : null; } catch (e) { sc = null; }
      if (!L.length) {
        const had = ck.crit.some((c) => c && c.k === "jp");
        ck.crit = ck.crit.filter((c) => !(c && c.k === "jp"));
        if (deck.v5326k) deck.v5326k = Object.assign({}, deck.v5326k, { pages: [], kinds: [], share: 0, major: false });
        if (had) ck.ok.push(opened ? "日本語の残り：なし（和名の参考の列は対象外）" : "日本語の残り：なし（この画面で訳を入れて直しました）");
        ck.pass = !ck.crit.length;
        if (ck.pass) ck.score = Math.max(+ck.score || 0, 100 - (ck.warn || []).length * 5);
      } else {
        if (deck.v5326k && sc) deck.v5326k = Object.assign({}, deck.v5326k, { pages: sc.pages, kinds: sc.kinds });
        const i = ck.crit.findIndex((c) => c && c.k === "jp");
        const t = "外国語の資料に日本語が残っています（" + L.slice(0, 6).map((x) => x.pages.join("・") + "枚目「" + x.t.slice(0, 30) + "」").join("／") + (L.length > 6 ? " ほか " + (L.length - 6) + "か所" : "") + "）。下の「日本語が残っている所」で、その場で訳を入れて直せます。直るまで、納品版の PPTX・PDF・1枚の紹介シートは出せません";
        const c = { k: "jp", t, v100: 1, pages: [...new Set([].concat(...L.map((x) => x.pages)))] };
        if (i >= 0) ck.crit[i] = c; else ck.crit.unshift(c);
        ck.pass = false;
      }
    } catch (e) { err("recheck", e); }
  }
  V100OUT.reCheckJa = reCheckJa;

  /* ════════════ No.591 前の商品の資料の状態を、次の商品の画面に出さない ════════════ */
  function dropOther(why, target) {
    try {
      const g = G(), T = target || ten();
      if (!g || g.run || !g.ten || !T) return false;
      if (pkey(g.ten) === pkey(T)) return false;
      try { if (g.deck && typeof dk3FreeUrls === "function") dk3FreeUrls(g.deck); } catch (e) { /* 次へ */ }
      g.deck = null; g.check = null; g.steps = []; g.err = ""; g.ten = null; g.cur = 0;
      ["snap", "snapKey", "v98fix", "v99ngFix", "at0"].forEach((k) => { try { if (k in g) g[k] = null; } catch (e) { /* 次へ */ } });
      try { if (typeof V99DECK !== "undefined" && V99DECK) V99DECK.last = null; } catch (e) { /* 次へ */ }
      try { if (typeof V97DK !== "undefined" && V97DK) { V97DK.lastCk = null; V97DK.jp = null; } } catch (e) { /* 次へ */ }
      try { if (typeof V5326K !== "undefined" && V5326K) V5326K.last = null; } catch (e) { /* 次へ */ }
      V100OUT.lastCk = null;
      cnt("drop:" + why);
      return true;
    } catch (e) { err("drop", e); return false; }
  }
  V100OUT.dropOther = dropOther;
  if (typeof switchTen === "function") {
    const __sw100 = switchTen;
    switchTen = function () { // eslint-disable-line no-global-assign
      try { const i = +arguments[0]; if (typeof TENS !== "undefined" && TENS[i]) dropOther("switch", TENS[i]); } catch (e) { err("sw", e); }
      return __sw100.apply(this, arguments);
    };
  }
  if (typeof pushTen === "function") {
    const __pt100 = pushTen;
    pushTen = function () { // eslint-disable-line no-global-assign
      const r = __pt100.apply(this, arguments);
      try { dropOther("push"); } catch (e) { err("push", e); }
      return r;
    };
  }

  /* 資料の画面：前の商品の状態を消してから描く＋日本語が残っている所（その場で直す） */
  function leftHtml(deck) {
    const L = leftJa(deck);
    if (!L.length) return "";
    const lg = deck.lang;
    const nm = (typeof DK3_LNAME !== "undefined" && DK3_LNAME[lg]) || lg;
    return `<div class="c v100out-left" id="v100jleft" data-noi18n="1" role="region" aria-label="${E(M("日本語が残っている所", "Places where Japanese remains", "仍有日文的位置", "Partes que siguen en japonés"))}"><h3>🈂 ${E(M(`日本語が残っている所（${L.length}か所）：その場で ${nm} に直せます`, `Japanese remains in ${L.length} place(s): fix them here in ${nm}`, `仍有 ${L.length} 处日文：可在此直接改为${nm}`, `Queda japonés en ${L.length} lugar(es): corríjalo aquí en ${nm}`))}</h3>
<p class="nn">${E(M("AI が訳さずに残した言葉です。訳を入れて「この訳で直す」を押すと、資料のその言葉をすべて直し、点検し直します（納品版を出せるようになります）。入れた訳は、この商品の次の資料にも使います（商品情報の登録は変わりません）。", "The AI left these words untranslated. Enter a translation and press “Fix with this translation” to replace every occurrence in the deck and re-check it (the final version can then be exported). Your translation is reused for this product's next decks (product information is not changed).", "这些是 AI 未翻译的词。输入译文并点击“用此译文修正”，会替换资料中所有该词并重新检查（即可导出正式版）。输入的译文也会用于此商品今后的资料（不更改商品信息）。", "La IA dejó estas palabras sin traducir. Escriba la traducción y pulse «Corregir con esta traducción» para cambiarla en toda la presentación y volver a revisar. Se reutiliza en las próximas presentaciones de este producto."))}</p>
<ul class="v100out-ll">${L.map((x, i) => `<li><span class="v100out-where">${E(M(x.pages.join("・") + "枚目", "Slide " + x.pages.join(", "), "第 " + x.pages.join("、") + " 页", "Diapositiva " + x.pages.join(", ")))}</span><span class="v100out-ja">「${E(x.t.slice(0, 80))}」</span><label class="v100out-lb" for="v100jin${i}">${E(M(nm + " の訳", "Translation (" + nm + ")", nm + " 译文", "Traducción (" + nm + ")"))}</label><input id="v100jin${i}" type="text" maxlength="160" data-v100jin="${i}" value="${E(x.sug || "")}" placeholder="${E(M("例：Ages 3+", "e.g. Ages 3+", "例：Ages 3+", "p. ej. Ages 3+"))}"><button type="button" class="btn" data-v100jfix="${i}" aria-label="${E(M("「" + x.t.slice(0, 30) + "」をこの訳で直す", "Fix “" + x.t.slice(0, 30) + "” with this translation", "用此译文修正「" + x.t.slice(0, 30) + "」", "Corregir «" + x.t.slice(0, 30) + "» con esta traducción"))}">${E(M("この訳で直す", "Fix with this translation", "用此译文修正", "Corregir con esta traducción"))}</button></li>`).join("")}</ul></div>`;
  }
  if (typeof vDeck === "function") {
    const __vd100 = vDeck;
    vDeck = function () { // eslint-disable-line no-global-assign
      try { dropOther("view"); } catch (e) { err("vd0", e); }
      let h = __vd100.apply(this, arguments);
      try {
        const g = G();
        h = String(h);
        if (g && g.deck && g.check && !g.run && g.deck.lang && !/^ja/.test(g.deck.lang) && h.indexOf('id="v100jleft"') < 0) {
          const add = leftHtml(g.deck);
          if (add) {
            const k = h.indexOf('<div class="dk3-dl">');
            h = k >= 0 ? h.slice(0, k) + add + h.slice(k) : h + add;
          }
        }
      } catch (e) { err("vd", e); }
      return h;
    };
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v100jfix]");
      if (!b) return;
      ev.preventDefault();
      const g = G(); if (!g || !g.deck || g.run) return;
      const deck = g.deck, lg = deck.lang;
      const L = leftJa(deck);
      const i = +b.getAttribute("data-v100jfix");
      const x = L[i]; if (!x) return;
      const inp = document.querySelector('[data-v100jin="' + i + '"]');
      const v = String((inp && inp.value) || "").trim();
      if (!v) { if (typeof toast === "function") toast(M("訳を入れてください", "Enter a translation", "请输入译文", "Escriba una traducción")); return; }
      if (jpFor(lg, v)) { if (typeof toast === "function") toast(M("訳に日本語が入っています。資料の言語で入れてください", "The translation still contains Japanese", "译文中仍有日文", "La traducción aún contiene japonés")); return; }
      let n = 0;
      deck.slides.forEach((S) => (S.els || []).forEach((e) => {
        if (skipEl(e) || e.v100ja) return;
        let ch = false;
        (e.ps || []).forEach((p) => (p.r || []).forEach((r) => { if (r && typeof r.t === "string" && r.t.indexOf(x.t) >= 0) { r.t = r.t.split(x.t).join(v); n++; ch = true; } }));
        if (ch) { try { delete e.mh; if (typeof v97dkRefit === "function") v97dkRefit(e, deck); } catch (z) { /* そのまま */ } }
      }));
      const T = g.ten || ten();
      try { if (T) { T.v100trFix = T.v100trFix || {}; T.v100trFix[lg] = T.v100trFix[lg] || {}; T.v100trFix[lg][x.t] = v; if (typeof saveTen === "function") saveTen(); } } catch (z) { /* 記録だけ */ }
      reCheckJa(deck, g.check, false);
      cnt("inlineFix", n);
      try { if (g.check && g.check.pass && T && typeof dk14Save === "function") dk14Save(deck, g.check, T); } catch (z) { err("save", z); }
      if (typeof toast === "function") toast(M(`「${x.t.slice(0, 20)}」を「${v.slice(0, 30)}」に直しました（${n}か所）`, `Replaced “${x.t.slice(0, 20)}” with “${v.slice(0, 30)}” (${n})`, `已将「${x.t.slice(0, 20)}」改为「${v.slice(0, 30)}」（${n} 处）`, `Se cambió «${x.t.slice(0, 20)}» por «${v.slice(0, 30)}» (${n})`));
      try { if (typeof dk3Paint === "function") dk3Paint(); } catch (z) { /* 次へ */ }
      if (typeof render === "function") render();
    } catch (e) { err("jfix", e); }
  }, true);

  /* 外した文言の一覧は、表示中の商品の分だけ（21.99 の欄が DK3G.ten を読むため・作っている途中は今まで通り） */
  if (typeof v99dkDroppedNow === "function") {
    const __dn100 = v99dkDroppedNow;
    v99dkDroppedNow = function () { // eslint-disable-line no-global-assign
      try {
        const g = G(), T = ten();
        if (g && !g.run && g.ten && T && pkey(g.ten) !== pkey(T)) {
          const keep = g.ten; g.ten = null;
          try { return __dn100.apply(this, arguments); } finally { g.ten = keep; }
        }
      } catch (e) { err("dropped", e); }
      return __dn100.apply(this, arguments);
    };
  }

  /* ════════════ No.518 医療機器ではない商品から、医療機器の扱いを外す ════════════ */
  function nonMed(p) {
    try {
      p = p || ten();
      if (!p) return false;
      if (typeof W.v98regAllowed === "function") {
        const ok = W.v98regAllowed(p, "医療機器の製品登録");
        if (ok !== false) return false;
      } else if (typeof V98REG !== "undefined" && V98REG && typeof V98REG.md === "function") {
        if (V98REG.md(p).v !== "no") return false;
      } else return false;
      // 医薬品（V98REG では医療機器ではない）は、医療の物差しのまま
      try { const md = (typeof V98REG !== "undefined" && V98REG && V98REG.md) ? V98REG.md(p) : null; if (md && md.why === "pharma") return false; } catch (e) { /* 次へ */ }
      if (/医薬品/.test(String(p.cat || ""))) return false;
      return true;
    } catch (e) { err("nonmed", e); return false; }
  }
  V100OUT.nonMed = nonMed;
  if (typeof v73AutoProf === "function") {
    const __ap100 = v73AutoProf;
    v73AutoProf = function (d, t) { // eslint-disable-line no-global-assign
      const r = __ap100.apply(this, arguments);
      try {
        if (r === "med") {
          const p = t || d || null;
          const T = ten();
          const q = (p && T && (p === T || pkey(p) === pkey(T))) ? T : p;
          if (q && nonMed(q)) {
            const nm = [q.item, q.itemEn, q.cat].join(" ");
            cnt("prof");
            return /家電|電子|充電|電池|バッテリー|LED|電動|Bluetooth|USB|electronic|battery/i.test(nm) ? "elec" : "goods";
          }
        }
      } catch (e) { err("prof", e); }
      return r;
    };
  }
  // ④ 業種ごとの項目：医療機器ではない衛生用品は、医療機器のクラス分類・届出の番号を外した「衛生用品の項目」
  try {
    if (typeof V68P_G !== "undefined" && V68P_G && V68P_G.v92med && !V68P_G.v100hyg) {
      V68P_G.v100hyg = { ja: "衛生用品の項目", f: V68P_G.v92med.f.filter((f) => f && f.k !== "mdClass" && f.k !== "mdReg").map((f) => Object.assign({}, f, { g: "v100hyg" })) };
      if (typeof V68P_GL !== "undefined" && V68P_GL) V68P_GL.v100hyg = ["衛生用品の項目（医療機器ではありません）", "Hygiene product details (not a medical device)", "卫生用品项目（非医疗器械）", "Datos del producto de higiene (no es un dispositivo médico)"];
    }
  } catch (e) { err("hygdef", e); }
  if (typeof v68pGroups === "function") {
    const __pg100 = v68pGroups;
    v68pGroups = function (t) { // eslint-disable-line no-global-assign
      const g = __pg100.apply(this, arguments);
      try {
        if (Array.isArray(g) && t && g.indexOf("v92med") >= 0 && V68P_G.v100hyg && nonMed(t)) { const i = g.indexOf("v92med"); g.splice(i, 1, "v100hyg"); cnt("hyg"); }
      } catch (e) { err("groups", e); }
      return g;
    };
  }

  // バイヤーの画面（AIバイヤー開拓）の業態の選択肢：21.92 の層が大分類「医療・衛生」に「医療機器・衛生用品の輸入販売会社」「病院・クリニック（購買部門）」を足す。
  // 医療機器ではない商品では「病院・クリニック（購買部門）」を出さず、輸入販売会社は「衛生用品の輸入販売会社（ディーラー）」にする（AI に渡す業態の名前も同じ）。戻せば元に戻る。
  const BZ_MED = "医療機器・衛生用品の輸入販売会社（ディーラー）", BZ_HYG = "衛生用品の輸入販売会社（ディーラー）";
  function bizNorm() {
    try {
      if (typeof V71OB_BIZ === "undefined" || !Array.isArray(V71OB_BIZ)) return;
      const A = V71OB_BIZ;
      if (!A.__v100) {
        const sp = Array.prototype.splice;
        Object.defineProperty(A, "splice", { configurable: true, writable: true, value: function (i, d) {
          let items = Array.prototype.slice.call(arguments, 2);
          try { if (items.length && nonMed(ten())) items = items.filter((x) => !(Array.isArray(x) && x[0] === "hosp")).map((x) => (Array.isArray(x) && x[0] === "meddist") ? [x[0], BZ_HYG] : x); } catch (e) { /* そのまま */ }
          return sp.apply(this, [i, d].concat(items));
        } });
        Object.defineProperty(A, "__v100", { value: 1 });
      }
      const nm = nonMed(ten());
      for (let i = A.length - 1; i >= 0; i--) {
        const x = A[i]; if (!Array.isArray(x)) continue;
        if (nm && x[0] === "hosp") { Array.prototype.splice.call(A, i, 1); cnt("bizHosp"); }
        else if (x[0] === "meddist") x[1] = nm ? BZ_HYG : BZ_MED;
      }
      try { const f = typeof V71OB !== "undefined" && V71OB && V71OB.f; if (nm && f && Array.isArray(f.biz)) f.biz = f.biz.filter((k) => k !== "hosp"); } catch (e) { /* 無くてよい */ }
    } catch (e) { err("biz", e); }
  }
  V100OUT.bizNorm = bizNorm;
  ["v71obPaint", "v71obHtml", "v71obBuild", "v71obSample"].forEach((nm) => {
    try {
      if (typeof W[nm] !== "function") return;
      const f0 = W[nm];
      W[nm] = function () { bizNorm(); return f0.apply(this, arguments); };
    } catch (e) { err("bizwrap", e); }
  });
  try { if (typeof I18N !== "undefined" && I18N && I18N.dict) [["en", "Hygiene product importers / dealers"], ["zh", "卫生用品进口经销商"], ["es", "Importadores / distribuidores de productos de higiene"]].forEach(([l, v]) => { if (I18N.dict[l] && !I18N.dict[l][BZ_HYG]) I18N.dict[l][BZ_HYG] = v; }); } catch (e) { /* 訳が無いだけ */ }

  /* ════════════ No.533 ④ の小見出しを、いまの商材カテゴリーの名前に ════════════ */
  const GRP_IND = { industrial: "industrial", cosmetics: "cosmetics", apparel: "apparel", food: "food" };
  const IND_JA = { industrial: "工業部品", cosmetics: "化粧品", apparel: "アパレル", food: "食品" };
  function catTr(c, l) {
    try {
      if (l === "ja") return c;
      const d = typeof I18N !== "undefined" && I18N && I18N.dict && I18N.dict[l];
      if (d && d[c]) return String(d[c]);
      const x = (typeof V68IND_LIST !== "undefined" ? V68IND_LIST : []).find((y) => y && y.ja === c);
      if (x && x[l]) return x[l];
    } catch (e) { /* 次へ */ }
    return "";
  }
  if (typeof v68pGL === "function") {
    const __gl100 = v68pGL;
    v68pGL = function (g) { // eslint-disable-line no-global-assign
      const r = __gl100.apply(this, arguments);
      try {
        const ind = GRP_IND[g];
        const t = ten();
        if (!ind || !t) return r;
        const c = String(t.cat || "").trim();
        if (!c || c === "その他" || c === "中古品" || c === IND_JA[ind]) return r;
        let k0 = ""; try { k0 = typeof v68pInd === "function" ? v68pInd(t) : ""; } catch (e) { k0 = ""; }
        if (k0 !== ind) return r;
        const l = lang();
        const nm = catTr(c, l);
        if (l !== "ja" && !nm) return r;
        cnt("glabel");
        return l === "ja" ? c + "の項目" : l === "en" ? nm + " details" : l === "zh" ? nm + "项目" : "Datos: " + nm;
      } catch (e) { err("gl", e); }
      return r;
    };
  }

  /* 英・中・西の画面の言葉（固定の文） */
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) {
      const add = (ja, en, zh, es) => { [["en", en], ["zh", zh || en], ["es", es || en]].forEach(([l, v]) => { if (I18N.dict[l] && v && !I18N.dict[l][ja]) I18N.dict[l][ja] = v; }); };
      add("続きを読む", "Read more", "阅读更多", "Leer más");
      add("衛生用品の項目（医療機器ではありません）", "Hygiene product details (not a medical device)", "卫生用品项目（非医疗器械）", "Datos del producto de higiene (no es un dispositivo médico)");
      add("日本語の残り：なし（この画面で訳を入れて直しました）", "Japanese left: none (fixed on this screen)", "剩余日文：无（已在此画面修正）", "Japonés restante: ninguno (corregido en esta pantalla)");
      add("日本語の残り：なし（和名の参考の列は対象外）", "Japanese left: none (the Japanese-name reference column is excluded)", "剩余日文：无（日文名称参考列不在检查范围内）", "Japonés restante: ninguno (se excluye la columna de referencia en japonés)");
    }
    if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) {
      I18N.pat.unshift({ re: /^INCI 表に和名の参考の列（(.+)）を入れました（(\d+)欄。わざと日本語にした列のため、英語のみの点検の対象外）$/,
        en: (m) => "Added a Japanese-name reference column (" + m[1] + ") to the INCI table (" + m[2] + " cells; intentionally in Japanese, so excluded from the English-only check)",
        zh: (m) => "已在 INCI 表中加入日文名称参考列（" + m[1] + "）（" + m[2] + " 格；为有意保留的日文，不在仅限英文的检查范围内）",
        es: (m) => "Se añadió una columna de referencia con el nombre japonés (" + m[1] + ") a la tabla INCI (" + m[2] + " celdas; en japonés a propósito, fuera de la revisión de solo inglés)" });
      I18N.pat.unshift({ re: /^外国語の資料に日本語が残っています（([\s\S]*)）。下の「日本語が残っている所」で、その場で訳を入れて直せます。直るまで、納品版の PPTX・PDF・1枚の紹介シートは出せません$/,
        en: (m) => "Japanese remains in the foreign-language deck (" + m[1] + "). You can enter translations right here under “Places where Japanese remains”. Until fixed, the final PPTX, PDF and one-page sheet cannot be exported",
        zh: (m) => "外语资料中仍有日文（" + m[1] + "）。可在下方“仍有日文的位置”直接输入译文修正。修正前无法导出正式版 PPTX・PDF・单页介绍",
        es: (m) => "Queda japonés en la presentación (" + m[1] + "). Puede escribir la traducción aquí mismo en «Partes que siguen en japonés». Hasta corregirlo no se pueden exportar el PPTX, el PDF ni la ficha final" });
    }
  } catch (e) { err("i18n", e); }
})();
