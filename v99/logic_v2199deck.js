/* ═══ v21.99 deck（2026-11-19 第12回相当 UAT・21.98）外国語営業資料：どの読み方でも正しい空白・成分表・利用者の「載せない」指示・根拠の無い「〜フリー」
   No.543（未解消・最重要）英語資料のスペース欠け（A「miso,Japanese organicsoy」「60years」・B「forkitchens」・D「Oilmeets」・F「therepair」・G「woodpuzzle」・C/E/H のコロンの後）
     原因：資料のデータ（run の文字）には空白の欠けが無い。資料の文は色・太さの違う run に分かれ、境目に空白が来る（「Shelf life: 」＋「12 months」）。
           画面の拡大表示・一覧の縮小（shadow DOM）では run ごとに <span> になり、読み上げ用の情報（アクセシビリティツリー）では span ごとに1つの文字の節になる。
           エージェントが節ごとに前後の空白を取ってつなぐと、ちょうど報告の形（強調の語の前後・コロンの後）でくっつく。PowerPoint も run ごとに読むと同じ。
     直し：① 画面（拡大表示・一覧）：段落ごとに全文を1つの文字（読み上げ用・見えない）で出し、色分けの span は読み上げから外して、見た目は CSS の
             ::before（attr）で同じに描く（innerText・アクセシビリティツリー・DOM の文字の節のどれで読んでも、段落の全文が1回だけ・正しい空白で出る）。
           ② PowerPoint：同じ書式の隣り合う run をまとめる（境目を減らす。見た目は変えない）。
           ③ 外国語営業資料の画面に「スライドの文章（全文）」：1段落＝1つの文字で全ページの文を見られる・コピーできる欄。
           ④ 英文の校正を強める：小文字どうし（organicsoy・forkitchens・woodpuzzle・therepair）・大文字の語との境（Oilmeets）・数字と語（60years）・
             句読点の後（miso,Japanese・Life:12）を、辞書と資料の中の語で分けられるときだけ直す（iPhone・pH・mL・型番・メール・URL・10:30 は変えない）。
     A の成分表（Allergen が3回・Allergen の行だけ）：ヒアリング・資料の取り込みで「原材料名：…　アレルゲン：…」を分けると、成分表は
           「アレルゲン｜大豆」「アレルゲンの注意書き｜…」と、原材料を1つずつ項目名だけの行（値なし）にした形になる。21.80 の層（v79）が値の無い行を
           「値が入っていない行」として表から外すため、原材料の行が全部消え、アレルゲンの行だけが残った（同じ項目名の行も重なる）。
           直し：成分表（dk3Tbl）に入る前に、項目名だけの原材料の行を「原材料名｜A、B、C」の1行にまとめ、同じ項目名（アレルゲン・アレルギー物質・特定原材料 など）の行を
           1行にまとめ、1つの欄に入った「原材料名：…　アレルゲン：…」を項目ごとの行に分ける。登録にアレルゲンがあって表に無ければ足す。
   No.533 の C（未解消）利用者が外した数値が資料に残る（0.8 mm/s が表紙の強み欄・表・カードに）
     原因：外す指示を入れる欄が無く（A で UAT が「除外指定の入力欄は未確認」）、21.98 は「Ultra-low → Low にして数値は残す」作りだった。
     直し：外国語営業資料の画面に「資料に載せない言葉・数値（利用者の指示）」の欄（入力・外した文言の一覧の「資料に入れない」）を置き、
           指示した数値・言葉は、AI の文章（計画）・登録の転記（強み・表）・最終の資料の全部の文・ノート・1枚の紹介シートのどこにも残さない。書く依頼にも指示を入れる。
   No.553（新規）根拠の無い「〜フリー・無添加」（H の additive-free）
     直し：21.98 の主張の単位（V98DK_CON）に「無添加・保存料不使用・人工の〜不使用・天然100%・化学物質不使用・ヒューマングレード・低アレルゲン・グルテンフリー・
           グレインフリー・パラベンフリー・アルコールフリー・Non-GMO・無香料・無着色」を足す。登録・資料に根拠が無ければ、文章のどこにあっても外す（言葉だけ外せるときは言葉だけ）。
           外した理由は一覧に「根拠に無い主張：無添加（登録・資料に無添加の記載がありません）」と出す。
   No.518（条件つき）カテゴリーを医療・衛生用品 → 日用雑貨に変えた後も、英語資料に「medical and hygiene category」・見せ方の型が「医療機器・ヘルスケア」
     直し：医療機器ではない（V98REG.md）商品は、HS（6307 など）から「医療機器・ヘルスケア」の型にしない（区分の型にする）。資料の根拠から古い区分の言葉を今の区分に直し、
           資料の英文の「medical and hygiene category」などを今の区分に直す。商品の画面の「AIの気づき」は、医療機器ではない商品で医療の区分を前提にした気づきを分けて出す。
   No.532（条件つき）英語資料に日本語のプレースホルダー（【未入力：〇〇】・「下書き DRAFT（社内確認用）」・下書きの説明のページ）
     直し：外国語の資料の中の下書きの印は資料の言語にする（[Missing: …]・DRAFT – for internal review）。利用者への日本語の案内は画面（最終チェック）に出す。
   No.546（条件つき）化粧品の英語資料の INCI 表に和名の列
     直し：和名（表示名称）が登録されている成分は、英語などの資料の INCI 表に「Japanese label name」の列を足す（化粧品の既定＝入れる。営業資料の画面で切り替え）。
           その列は日本語の残りの点検の対象外にする。
   書き方：前の層の関数は控えてから包む。登録の値は書き換えない（資料の中の文・表だけを直す。利用者の指示は TEN.v99dkNg・TEN.v99dkJaCol に控える）。失敗したら前の動きのまま。 */
var V99DECK = window.V99DECK = { v: "21.99", err: [], n: {}, last: null };
function v99dkErr(k, e) { try { V99DECK.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V99DECK.err.length > 40) V99DECK.err.shift(); } catch (x) { } }
function v99dkN(k, d) { try { const x = d == null ? 1 : +d; if (x) V99DECK.n[k] = (V99DECK.n[k] || 0) + x; } catch (e) { } }
function v99dkLang() { try { if (typeof v98dkLang === "function") return v98dkLang(); } catch (e) { } try { const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v99dkM(ja, en, zh, es) { const l = v99dkLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v99dkE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v99dkNF(s) { s = String(s == null ? "" : s); try { return s.normalize("NFKC"); } catch (e) { return s; } }
function v99dkTen() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || ((typeof TEN !== "undefined" && TEN) || null); } catch (e) { return null; } }
function v99dkCur() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
function v99dkSkipEl(e) { return !e || e.k !== "text" || !Array.isArray(e.ps) || e.v54 || /^(draft|v54draft|v54note|pno|deco)$/.test(e.name || ""); }
const V99DK_LATIN = /^(en|es|fr|de|id|ms|vi|pt|it)$/;

/* ══════════ No.543 ① 画面：段落ごとに全文を1つの文字で（読み上げ・innerText・DOM のどれでも同じ全文） ══════════ */
/* 全文の文字は、その文字の枠いっぱいに透明で重ねる（1px に縮めると「見えない要素」として読み飛ばす読み方があるため。見た目は同じ） */
const V99DK_CSS = ".v99v::before{content:attr(data-v99t)}.v99sr{position:absolute!important;left:0!important;top:0!important;right:0!important;bottom:0!important;overflow:hidden!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;white-space:normal!important;pointer-events:none!important;margin:0!important;padding:0!important;border:0!important;background:none!important;line-height:1.25!important}";
function v99dkSpanTxt(sp) { let s = ""; sp.childNodes.forEach(c => { if (c.nodeType === 3) s += c.nodeValue; else if (c.nodeType === 1 && c.tagName === "BR") s += "\n"; else if (c.nodeType === 1) s += c.textContent; }); return s; }
function v99dkFlat(s) { return String(s == null ? "" : s).replace(/[ \t ]*\n[ \t ]*/g, " ").replace(/[ \t]{2,}/g, " ").trim(); }
function v99dkA11y(root) {
  let n = 0;
  try {
    if (!root || !root.querySelectorAll) return 0;
    if (!root.querySelector("style[data-v99dk]")) { const st = document.createElement("style"); st.setAttribute("data-v99dk", "1"); st.textContent = V99DK_CSS; (root.firstChild ? root.insertBefore(st, root.firstChild) : root.appendChild(st)); }
    root.querySelectorAll("div").forEach(d => {
      if (d.getAttribute("data-v99p") || !/white-space:\s*pre-wrap/.test(d.getAttribute("style") || "")) return;
      const sps = Array.prototype.filter.call(d.children, c => c.tagName === "SPAN" && !c.classList.contains("v99sr"));
      if (!sps.length || sps.length !== d.children.length - d.querySelectorAll(":scope > br").length) return;
      const parts = sps.map(v99dkSpanTxt);
      const full = v99dkFlat(parts.join(""));
      d.setAttribute("data-v99p", "1");
      if (!full) return;
      sps.forEach((sp, i) => { sp.setAttribute("data-v99t", parts[i]); sp.setAttribute("aria-hidden", "true"); sp.classList.add("v99v"); while (sp.firstChild) sp.removeChild(sp.firstChild); });
      const sr = document.createElement("span"); sr.className = "v99sr"; sr.textContent = full; d.appendChild(sr);
      n++;
    });
  } catch (e) { v99dkErr("a11y", e); }
  if (n) v99dkN("a11yPara", n);
  return n;
}
function v99dkWatch(root) {
  try {
    if (!root || root.__v99obs) return;
    v99dkA11y(root);
    const mo = new MutationObserver(() => { try { v99dkA11y(root); } catch (e) { } });
    mo.observe(root, { childList: true, subtree: true });
    root.__v99obs = mo;
  } catch (e) { v99dkErr("watch", e); }
}
if (typeof dk3MountPreview === "function") {
  const __mp99 = dk3MountPreview;
  dk3MountPreview = function (host) {
    const r = __mp99.apply(this, arguments);
    try { if (host && host.shadowRoot) v99dkWatch(host.shadowRoot); } catch (e) { v99dkErr("mp", e); }
    return r;
  };
}
if (typeof dk3Zoom === "function") {
  const __zm99 = dk3Zoom;
  dk3Zoom = function (i) {
    const r = __zm99.apply(this, arguments);
    try { const h = document.getElementById("dk3ovs"); if (h && h.shadowRoot) v99dkWatch(h.shadowRoot); } catch (e) { v99dkErr("zoom", e); }
    return r;
  };
}

/* ══════════ No.543 ② PowerPoint：同じ書式の隣り合う run をまとめる（見た目は同じ・境目を減らす） ══════════ */
function v99dkSameFmt(a, b) {
  try { const ks = new Set(Object.keys(a).concat(Object.keys(b))); ks.delete("t"); for (const k of ks) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false; } return true; } catch (e) { return false; }
}
function v99dkMergeRuns(deck) {
  let n = 0;
  const d = Object.assign({}, deck, { slides: (deck.slides || []).map(S => Object.assign({}, S, { els: (S.els || []).map(e => {
    if (!e || e.k !== "text" || !Array.isArray(e.ps)) return e;
    return Object.assign({}, e, { ps: e.ps.map(p => {
      if (!p || !Array.isArray(p.r) || p.r.length < 2) return p;
      const out = [];
      p.r.forEach(r => { const last = out[out.length - 1]; if (last && r && typeof r.t === "string" && typeof last.t === "string" && v99dkSameFmt(last, r)) { out[out.length - 1] = Object.assign({}, last, { t: last.t + r.t }); n++; } else out.push(r); });
      return out.length === p.r.length ? p : Object.assign({}, p, { r: out });
    }) });
  }) })) });
  if (n) v99dkN("pptxMerge", n);
  return d;
}
V99DECK.mergeRuns = v99dkMergeRuns;
if (typeof dk3BuildPptx === "function") {
  const __bp99 = dk3BuildPptx;
  dk3BuildPptx = function (deck) {
    let d2 = deck;
    try { if (deck && Array.isArray(deck.slides)) d2 = v99dkMergeRuns(deck); } catch (e) { v99dkErr("pptx", e); d2 = deck; }
    const a = Array.prototype.slice.call(arguments); a[0] = d2;
    return __bp99.apply(this, a);
  };
}

/* ══════════ No.543 ③ スライドの文章（全文）：1段落＝1つの文字 ══════════ */
function v99dkParaText(p) { return v99dkFlat((p && p.r ? p.r : []).map(r => (r && r.t != null ? String(r.t) : "")).join("")); }
function v99dkDeckText(deck) {
  const out = [];
  try {
    (deck.slides || []).forEach((S, si) => {
      const els = (S.els || []).filter(e => e && e.k === "text" && Array.isArray(e.ps) && !/^(pno|deco)$/.test(e.name || ""));
      els.sort((a, b) => (Math.round((a.y || 0) / 6) - Math.round((b.y || 0) / 6)) || ((a.x || 0) - (b.x || 0)));
      const ps = [];
      els.forEach(e => e.ps.forEach(p => { let t = v99dkParaText(p); if (t && (p.caps || (p.r || []).some(r => r && r.caps))) t = t.toUpperCase(); if (t) ps.push(t); }));
      out.push({ si: si + 1, ps, notes: S.notes ? String(S.notes) : "" });
    });
  } catch (e) { v99dkErr("dtext", e); }
  return out;
}
V99DECK.deckText = v99dkDeckText;
function v99dkFullHtml(deck) {
  const D = v99dkDeckText(deck);
  const nP = D.reduce((a, s) => a + s.ps.length, 0);
  const lab = (n) => v99dkM(n + "枚目", "Slide " + n, "第" + n + "页", "Diapositiva " + n);
  return `<details class="v99dk-full" id="v99dkfull" data-v99dkfull="1" data-noi18n="1"><summary><b>${v99dkE(v99dkM("📄 スライドの文章（全文）を見る・コピー", "📄 Slide text (full) — view and copy", "📄 查看・复制幻灯片全文", "📄 Texto completo de las diapositivas: ver y copiar"))}</b> <span class="nn">${v99dkE(v99dkM(`${D.length}枚・${nP}段落。1つの段落を1つの文として出します（色分け・太字の区切りで語がくっつきません）`, `${D.length} slides · ${nP} paragraphs. Each paragraph is one plain text (no words run together at colour or bold breaks)`, `${D.length}页・${nP}段。每段为一段纯文本（颜色・粗体的分隔不会使单词粘连）`, `${D.length} diapositivas · ${nP} párrafos. Cada párrafo es un texto plano`))}</span></summary>
<div class="v99dk-fullbar"><button type="button" class="btn g" data-v99dkcopy="1">${v99dkE(v99dkM("全文をコピー", "Copy all text", "复制全文", "Copiar todo el texto"))}</button><span class="nn" data-v99dkcopied="1" role="status"></span></div>
<div class="v99dk-fullbody" lang="${v99dkE((typeof DK3_LANGF !== "undefined" && DK3_LANGF[deck.lang] && DK3_LANGF[deck.lang].lang) || "en")}">${D.map(s => `<section class="v99dk-fsl" data-v99dksl="${s.si}"><h4>${v99dkE(lab(s.si))}</h4>${s.ps.map(t => `<pre class="v99dk-p" style="white-space:pre-wrap;font:inherit;margin:0 0 4px;overflow-wrap:anywhere">${v99dkE(t)}</pre>`).join("")}${s.notes ? `<pre class="v99dk-fnote" style="white-space:pre-wrap;font:inherit;margin:0 0 4px;opacity:.8">${v99dkE(v99dkM("ノート", "Notes", "备注", "Notas") + ": " + v99dkFlat(s.notes))}</pre>` : ""}</section>`).join("")}</div></details>`;
}
function v99dkFullPlain(deck) {
  return v99dkDeckText(deck).map(s => "[" + v99dkM(s.si + "枚目", "Slide " + s.si, "第" + s.si + "页", "Diapositiva " + s.si) + "]\n" + s.ps.join("\n") + (s.notes ? "\n(" + v99dkFlat(s.notes) + ")" : "")).join("\n\n");
}
document.addEventListener("click", e => {
  try {
    const b = e.target && e.target.closest && e.target.closest("[data-v99dkcopy]");
    if (!b) return;
    e.preventDefault();
    const deck = typeof DK3G !== "undefined" && DK3G && DK3G.deck;
    if (!deck) return;
    const txt = v99dkFullPlain(deck);
    const st = b.parentElement && b.parentElement.querySelector("[data-v99dkcopied]");
    const done = (ok) => { if (st) st.textContent = ok ? v99dkM("コピーしました", "Copied", "已复制", "Copiado") : v99dkM("コピーできませんでした。下の文を選んでコピーしてください", "Could not copy. Select the text below and copy it", "无法复制，请选中下方文字复制", "No se pudo copiar. Seleccione el texto de abajo"); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); else done(false); } catch (x) { done(false); }
    v99dkN("copy");
  } catch (x) { v99dkErr("copy", x); }
}, true);

/* ══════════ No.543 ④ 英文の校正を強める（小文字どうし・大文字の語・数字と語・句読点の後） ══════════ */
const V99DK_FW = ["for", "the", "with", "and", "from", "our", "into", "onto", "your", "their", "this", "that", "each", "every", "only"];
/* 辞書に無いが1語の言葉（分けない） */
const V99DK_KNOWN = new Set(("handbag droplet droplets lipstick lipsticks takeaway takeaways bodywash mouthwash income fortune attempt withstand theory therapy handmade homemade lifestyle soybean soybeans skincare haircare bodycare suncare outdoor outdoors indoor indoors output input overall underwater waterproof dustproof airtight lightweight heavyweight stainless foodservice teamwork network framework workshop warehouse farmland homeland mainland grassland woodland highland lowland seaweed sunflower buckwheat wheatgrass wholegrain wholefood overseas worldwide nationwide countrywide bestseller bestselling longtime lifetime anytime anywhere everywhere somewhere nowhere sometimes something anything everything nothing someone anyone everyone become became because before behind beside between beyond inside outside within without upon onto into therefore thereby therein whereas whereby however moreover furthermore nevertheless meanwhile otherwise hereby herein thereafter forthcoming forever foremost forehead forecast foresee forefront formwork fortnight fortify fortress forthright forward forwarder forwarding attachment attendance offshore onshore download upload uptake intake outlook outreach outset upgrade update downtime uptime handheld handcrafted handwoven handpicked handpainted woodwork woodworking woodcraft woodcrafts sawmill papermaking ironware tableware kitchenware cookware glassware stoneware earthenware lacquerware houseware housewares homeware footwear sportswear outerwear underwear knitwear eyewear headwear nightwear swimwear menswear womenswear childrenswear babywear petfood toothbrush toothpaste hairbrush shampoo moisturizer moisturiser sunscreen eyeliner lipstick fingertip fingertips cornerstone milestone milestones keystone landmark trademark benchmark hallmark watermark bookmark therapist therapists theorem thermos thereof").split(" "));
const V99DK_UNIT = /^(?:mm|cm|km|m|kg|mg|g|μg|ug|ml|l|cl|dl|oz|lb|lbs|pcs?|psi|rpm|kcal|cal|kj|kwh|wh|mah|ah|gsm|dpi|ppm|ppb|bar|hz|khz|mhz|ghz|min|mins|sec|secs|hr|hrs|h|kw|w|mw|v|kv|a|ma|nm|um|μm|ft|in|yd|mi|gal|qt|pt|fl|cc|ct|mp|fps|bit|bits|gb|mb|kb|tb|px|em|deg|x|k|s|d|y|st|nd|rd|th|ml|ga|mw|kn|n|pa|kpa|mpa|db|lux|lm|cd|mol|wt|vol|cfu|iu|spf|pa|ph|ah)$/i;
const V99DK_COUNT = /^(?:years?|months?|days?|weeks?|hours?|minutes?|seconds?|bags?|bottles?|boxes?|pieces?|units?|sets?|cartons?|cases?|packs?|countries|markets|stores|shops|customers|clients|times|layers|colou?rs|sizes|flavou?rs|varieties|types|models|items|products|employees|staff|people|tons?|tonnes?|percent|languages|patents|awards|cities|regions|lots|pallets)$/i;
function v99dkVoc() { try { return typeof v86dkVocab === "function" ? v86dkVocab() : null; } catch (e) { return null; } }
/* 辞書（v86 の語彙）は画面の訳の読み込みで中身が変わるため、営業資料によく出る語を足して判定をそろえる */
const V99DK_EXTRA = new Set(("puzzle puzzles toy toys wood wooden kitchen kitchens cafe cafes soy soybean soybeans miso sauce rice organic oil oils meets meet repair repairs jerky treats treat dog dogs cat cats chicken venison serum mask masks brake brakes pad pads bearing bearings spray sprays bottle bottles carton cartons bag bags pack packs years months days weeks hours").split(" "));
function v99dkIn(w, ctx) { try { if (!w) return false; if (V99DK_EXTRA.has(w)) return true; if (ctx.W && ctx.W.has(w)) return true; if (!ctx.V) return false; return typeof v86dkIn === "function" ? v86dkIn(w, ctx.V, ctx.W) : ctx.V.has(w); } catch (e) { return false; } }
function v99dkSplit(tok, ctx) {
  /* 1語に見えない語（辞書に無い）を、辞書の2語に分けられるか。前の語が前置詞などなら優先 */
  const low = tok.toLowerCase();
  if (low.length < 5 || V99DK_KNOWN.has(low) || v99dkIn(low, ctx) || (low.length > 4 && /s$/.test(low) && V99DK_KNOWN.has(low.slice(0, -1)))) return null;
  let best = null;
  for (let i = 1; i <= low.length - 2; i++) {
    const a = low.slice(0, i), b = low.slice(i);
    const fa = V99DK_FW.indexOf(a) >= 0;
    if (fa) { if (!(b.length >= 4 && v99dkIn(b, ctx))) continue; }
    else {
      if (low.length < 8 || a.length < 3 || b.length < 3 || !(V99DK_EXTRA.has(a) || (ctx.V && ctx.V.has(a))) || !(ctx.V && (ctx.V.has(b) || v99dkIn(b, ctx)))) continue;
      /* 21.99.3（11/20 回帰の洗い出し）：21.86 の分け方の歯止め（前に付きやすい語＋後ろに付きやすい語＝air+borne・head+phones・shell+fish など1語の合成語）を同じく効かせる。
         営業資料によく出る語（V99DK_EXTRA）が後ろに来るときは分ける（wood+puzzle のような本当のくっつき） */
      if ((typeof V86DK_PRE !== "undefined" && V86DK_PRE.has(a) && !V99DK_EXTRA.has(b)) || (typeof V86DK_SUF !== "undefined" && V86DK_SUF.test(b))) continue;
    }
    const sc = (fa ? 10 : 0) + Math.min(a.length, b.length);
    if (!best || sc > best.sc) best = { i, sc, fa };
  }
  return best;
}
function v99dkProtected(tok, ctx) {
  if (/[@\/]|:\/\/|^www\.|\.(?:com|net|org|jp|co|io)\b/i.test(tok)) return true;
  if (typeof V98DK_KEEP !== "undefined" && V98DK_KEEP.test(tok.replace(/[’']s$/, ""))) return true;
  if (ctx.prot && ctx.prot.indexOf(tok.toLowerCase()) >= 0) return true;
  if (/[A-Z].*[A-Z]/.test(tok.slice(1)) || /\d/.test(tok) && /[A-Z]/.test(tok)) return true;   /* 型番・略号（KB-6204・SUJ2・ISO・iPhone のような大文字が2つ以上） */
  return false;
}
function v99dkProofPara(p, ctx, log, si) {
  const rs = (p.r || []).filter(r => r && typeof r.t === "string");
  if (!rs.length) return false;
  const full = rs.map(r => r.t).join("");
  const ins = [];
  let m;
  /* a. 句読点の後に空白が無い：「miso,Japanese」「Life:12」「soybeans;rice」（数字どうし 1,000・10:30・URL は変えない） */
  const reP = /([A-Za-z)\]%])([,;:])(?=[A-Za-z(])|([A-Za-z)\]])(:)(?=\d)/g;
  while ((m = reP.exec(full))) {
    const pos = m.index + 1 + 1;
    const left = full.slice(Math.max(0, m.index - 30), m.index + 1).split(/\s/).pop();
    const right = full.slice(pos, pos + 30).split(/\s/)[0];
    const tok = left + full[m.index + 1] + right;
    if (/:\/\//.test(full.slice(m.index, m.index + 5)) || /^(?:https?|mailto|tel|ftp)$/i.test(left) || /@|\/\/|www\./i.test(tok)) continue;
    if (/^\d/.test(right) && full[m.index + 1] === ":" && /\d$/.test(left)) continue;
    ins.push({ pos, from: tok.slice(0, 30), to: tok.slice(0, left.length + 1) + " " + right });
  }
  /* b. 数字と語（60years・12months）。単位（100g・5kg・3D・2nd）は変えない */
  const reN = /(?<![A-Za-z\d.\-_#\/])(\d[\d,.]*)([a-z]{3,})\b/g;
  while ((m = reN.exec(full))) {
    const w = m[2];
    if (V99DK_UNIT.test(w)) continue;
    if (!(V99DK_COUNT.test(w) || (w.length >= 4 && v99dkIn(w, ctx)))) continue;
    ins.push({ pos: m.index + m[1].length, from: m[0], to: m[1] + " " + w });
  }
  /* c. 語のくっつき（organicsoy・forkitchens・woodpuzzle・therepair・Oilmeets） */
  const reW = /(?<![A-Za-z\d'’\-_@.\/])([A-Za-z][a-z]{4,})(?![A-Za-z\d'’\-_@])/g;
  while ((m = reW.exec(full))) {
    const tok = m[1];
    if (v99dkProtected(tok, ctx)) continue;
    const prevCh = full[m.index - 1] || "";
    if (/[\-–]/.test(prevCh)) continue;
    const s = v99dkSplit(tok, ctx);
    if (!s) continue;
    /* 大文字で始まる語は、分けた後ろの語が小文字の語（Oil|meets）のときだけ */
    ins.push({ pos: m.index + s.i, from: tok, to: tok.slice(0, s.i) + " " + tok.slice(s.i) });
  }
  /* d. 1語を誤って分けた形（本番の本物の AI の資料で「are per formed」を見つけた）を1語に戻す（1つの run の中だけ） */
  let joined = false;
  rs.forEach(r => { const t2 = r.t.replace(/\b(per)\s(form(?:s|ed|ing|ance|ances|ant)?|fect(?:ly|ion)?|manent(?:ly)?|mit(?:s|ted)?|sonal(?:ly|ized)?|sonnel|spective|iod(?:s|ic)?)\b/gi, (m0, a, b2) => { log.push({ si, k: "v99join", from: m0, to: a + b2 }); joined = true; return a + b2; }); if (t2 !== r.t) r.t = t2; });
  if (!ins.length) return joined;
  const seen = new Set();
  const uniq = ins.filter(x => { if (seen.has(x.pos)) return false; seen.add(x.pos); return true; }).sort((x, y) => y.pos - x.pos);
  const starts = []; let acc = 0; rs.forEach(r => { starts.push(acc); acc += r.t.length; });
  uniq.forEach(x => {
    let k = rs.length - 1; while (k > 0 && starts[k] > x.pos) k--;
    const o = x.pos - starts[k];
    if (o === 0 && k > 0) rs[k - 1].t = rs[k - 1].t + " "; else rs[k].t = rs[k].t.slice(0, o) + " " + rs[k].t.slice(o);
    for (let j = k + 1; j < starts.length; j++) starts[j]++;
    log.push({ si, k: "v99glue", from: x.from, to: x.to });
  });
  return true;
}
function v99dkProof(deck, T) {
  const out = [];
  try {
    if (!deck || !Array.isArray(deck.slides) || !V99DK_LATIN.test(String(deck.lang || ""))) return out;
    const ctx = { V: v99dkVoc(), W: new Set(), prot: "" };
    deck.slides.forEach(S => (S.els || []).forEach(e => { if (e && e.k === "text" && Array.isArray(e.ps)) e.ps.forEach(p => (p.r || []).forEach(r => { if (r && typeof r.t === "string") r.t.toLowerCase().split(/[^a-z]+/).forEach(w => { if (w.length >= 3 && w.length <= 14) ctx.W.add(w); }); })); }));
    try { ctx.prot = (typeof v86dkProt === "function") ? v86dkProt(T) : ""; } catch (e) { }
    /* 資料の中の語でも、くっついた形（organicsoy）は語に数えない */
    const inV = (x) => V99DK_EXTRA.has(x) || !!(ctx.V && (ctx.V.has(x) || (typeof v86dkIn === "function" && v86dkIn(x, ctx.V, null))));
    [...ctx.W].forEach(w => { if (w.length >= 7 && !inV(w) && !V99DK_KNOWN.has(w)) { for (let i = 3; i <= w.length - 3; i++) { if ((inV(w.slice(0, i)) || V99DK_FW.indexOf(w.slice(0, i)) >= 0) && inV(w.slice(i))) { ctx.W.delete(w); break; } } } });
    deck.slides.forEach((S, si) => (S.els || []).forEach(e => {
      if (v99dkSkipEl(e)) return;
      let ch = false;
      e.ps.forEach(p => { try { if (v99dkProofPara(p, ctx, out, si + 1)) ch = true; } catch (x) { v99dkErr("proofp", x); } });
      if (ch) { try { delete e.mh; } catch (x) { } }
    }));
    if (out.length) v99dkN("proof", out.length);
  } catch (e) { v99dkErr("proof", e); }
  return out;
}
V99DECK.proof = v99dkProof;

/* ══════════ No.543 成分表：原材料の行をまとめる・同じ項目名の行をまとめる・1つの欄の複数の項目を分ける ══════════ */
const V99DK_LABS = /(原材料名?|アレルゲン|アレルギー物質|特定原材料(?:等|など)?(?:\d+品目)?|内容量|賞味期限|消費期限|保存方法|原産国名?|原産地|製造者|販売者|加工者|栄養成分(?:表示)?)\s*[：:]/g;
const V99DK_ATTR = /期限|方法|サイズ|寸法|重量|容量|入数|規格|原産|産地|製造|販売|認証|価格|単価|型番|品番|カラー|色|用途|対象|温度|保存|期間|形状|仕様|JAN|HS|梱包|外装|数量|ロット/;
function v99dkLabKey(s) {
  const t = v99dkNF(s).toLowerCase().replace(/[\s（）()【】\[\]・:：、,]/g, "");
  if (/^(アレルゲン|アレルギー物質|アレルギー|特定原材料(等|など)?(\d+品目)?|allergens?)$/.test(t)) return "allergen";
  if (/^(アレルゲン|アレルギー)の?(注意書き|注意|表示)|コンタミ|同一工場|製造ライン/.test(t)) return "allergennote";
  if (/^(原材料名?|原料|ingredients?)$/.test(t)) return "ingr";
  return t.replace(/(名|名称)$/, "");
}
function v99dkFoodLike(T) { try { const ck = String((T && T.catKey) || ""); const c = String((T && (T.cat + " " + (T.compTitle || ""))) || ""); return /food|liquor|tea|pet/.test(ck) || /食品|飲料|酒|茶|菓子|調味|サプリ|健康食品|ペット|フード|原材料/.test(c); } catch (e) { return false; } }
function v99dkCompFix(cols, rows, T) {
  const rep = { split: 0, merged: 0, dup: 0, al: 0 };
  if (!Array.isArray(rows) || !rows.length) return { rows, rep };
  const n = Math.max(2, Array.isArray(cols) ? cols.length : 0, ...rows.map(r => Array.isArray(r) ? r.length : 1));
  const S = (x) => String(x == null ? "" : x).trim();
  let R = rows.filter(r => Array.isArray(r)).map(r => r.map(S));
  /* 0. 1つの値に仕様の項目が続く形（「軸受鋼 SUJ2/内径:20mm」）を行に分ける（保存済みの商品にも効くよう、表に組む前にも） */
  try { const S0 = v99dkSpecSplitRows(R); if (S0.ch) { R = S0.rows.map(r => Array.isArray(r) ? r.map(S) : r); rep.split += S0.ch; } } catch (e) { v99dkErr("spec0", e); }
  /* 1. 1つの欄の中の複数の項目（「原材料名：…　アレルゲン：大豆」）を行に分ける */
  const out = [];
  R.forEach(r => {
    const v = r[1] || "";
    const hits = []; let m; const re = new RegExp(V99DK_LABS.source, "g");
    while ((m = re.exec(v))) hits.push({ i: m.index, end: m.index + m[0].length, lab: m[1] });
    if (!hits.length || (hits.length === 1 && hits[0].i === 0)) { out.push(r); return; }
    const segs = [];
    if (hits[0].i > 0) segs.push([r[0], v.slice(0, hits[0].i).replace(/[\s　、,／\/]+$/, "")]);
    hits.forEach((h, k) => { const val = v.slice(h.end, k + 1 < hits.length ? hits[k + 1].i : v.length).replace(/^[\s　]+|[\s　、,／\/。]+$/g, ""); if (val) segs.push([h.i === 0 ? r[0] : h.lab, val]); });
    if (segs.length <= 1) { out.push(r); return; }
    segs.forEach(([a, b]) => { const x = r.slice(); x[0] = a; x[1] = b; for (let i = 2; i < x.length; i++) x[i] = ""; out.push(x); });
    rep.split += segs.length - 1;
  });
  R = out;
  /* 2. 項目名だけの行（値なし）が原材料の並び（v54upldSetComp の形）なら、1行にまとめる */
  const empty = (r) => !!r[0] && r.slice(1).every(x => !x);
  const hasAl = R.some(r => /^allergen/.test(v99dkLabKey(r[0])));
  const runs = []; let cur = null;
  R.forEach((r, i) => { const ok = empty(r) && !V99DK_ATTR.test(r[0]) && r[0].length <= 40 && !/^allergen|^ingr$/.test(v99dkLabKey(r[0])); if (ok) { if (!cur) { cur = { a: i, b: i }; runs.push(cur); } else cur.b = i; } else cur = null; });
  const nonEmpty = R.filter(r => !empty(r)).length;
  /* 原材料が1つだけ（H：鶏ささみのみ）でも、表が項目名だけの行しか無い食品なら原材料の行にする */
  const onlyLab = R.filter(r => !empty(r) && !/^allergen/.test(v99dkLabKey(r[0]))).length === 0;
  const big = runs.filter(x => ((x.b - x.a + 1) >= 2 && (hasAl || x.b - x.a + 1 >= 3 || nonEmpty === 0 || R.filter(empty).length === R.length)) || (onlyLab && v99dkFoodLike(T)));
  if (big.length) {
    const lab = v99dkFoodLike(T) ? "原材料名" : (/cosme/.test(String((T && T.catKey) || "")) ? "全成分" : "構成・材質");
    const drop = new Set();
    big.forEach(x => { const items = []; for (let i = x.a; i <= x.b; i++) { items.push(R[i][0]); if (i > x.a) drop.add(i); } const row = new Array(n).fill(""); row[0] = lab; row[1] = items.join("、"); R[x.a] = row; rep.merged += items.length; });
    R = R.filter((r, i) => !drop.has(i));
  }
  /* 3. 同じ項目名の行を1行に（値は重ねない） */
  const pos = {}; const R2 = [];
  R.forEach(r => {
    const k = v99dkLabKey(r[0]);
    if (!k || empty(r)) { R2.push(r); return; }
    if (pos[k] == null) { pos[k] = R2.length; R2.push(r.slice()); return; }
    const t = R2[pos[k]];
    const sep = k === "allergennote" ? "／" : "・";
    const vals = (t[1] ? t[1].split(/[・、,／]/) : []).map(x => x.trim()).filter(Boolean);
    String(r[1] || "").split(k === "allergennote" ? /／/ : /[・、,／]/).map(x => x.trim()).filter(Boolean).forEach(x => { if (vals.indexOf(x) < 0) vals.push(x); });
    t[1] = vals.join(sep);
    for (let i = 2; i < Math.max(t.length, r.length); i++) if (!t[i] && r[i]) t[i] = r[i];
    rep.dup++;
  });
  R = R2;
  /* 3b. アレルゲンの注意書き（同じ工場で…）は、アレルゲンの行があればその行に括弧で添える（「Allergen」の行が2つに見えないように） */
  try {
    const ia = R.findIndex(r => v99dkLabKey(r[0]) === "allergen"), inote = R.findIndex(r => v99dkLabKey(r[0]) === "allergennote");
    if (ia >= 0 && inote >= 0 && R[inote][1]) { R[ia] = R[ia].slice(); R[ia][1] = (R[ia][1] ? R[ia][1] + "（" + R[inote][1].replace(/。$/, "") + "）" : R[inote][1]); R = R.filter((r, i) => i !== inote); rep.dup++; }
  } catch (e) { }
  /* 4. 登録のアレルゲンが表に無ければ足す（食品だけ） */
  try {
    const al = T && Array.isArray(T.allergens) ? T.allergens.map(S).filter(Boolean) : [];
    if (al.length && v99dkFoodLike(T) && !R.some(r => v99dkLabKey(r[0]) === "allergen") && R.some(r => v99dkLabKey(r[0]) === "ingr" || !empty(r))) {
      const row = new Array(n).fill(""); row[0] = "アレルゲン"; row[1] = al.join("・");
      const ii = R.findIndex(r => v99dkLabKey(r[0]) === "ingr");
      R.splice(ii >= 0 ? ii + 1 : R.length, 0, row); rep.al++;
    }
  } catch (e) { }
  return { rows: R.map(r => { const x = r.slice(0, n); while (x.length < n) x.push(""); return x; }), rep };
}
V99DECK.compFix = v99dkCompFix;
function v99dkCompOwner(rows) { try { const L = [].concat((typeof TENS !== "undefined" && Array.isArray(TENS)) ? TENS : [], [v99dkTen(), v99dkCur()]); return L.find(t => t && t.compRows === rows) || null; } catch (e) { return null; } }
if (typeof dk3Tbl === "function") {
  const __tb99 = dk3Tbl;
  dk3Tbl = function (cols, rows, max, kind) {
    try {
      if (kind !== "price" && Array.isArray(rows) && rows.length) {
        const T = v99dkCompOwner(rows);
        if (T) {
          const X = v99dkCompFix(cols, rows, T);
          if (X.rep.split || X.rep.merged || X.rep.dup || X.rep.al) {
            v99dkN("compFix"); V99DECK.lastComp = X.rep;
            const a = Array.prototype.slice.call(arguments); a[1] = X.rows;
            return __tb99.apply(this, a);
          }
        }
      }
    } catch (e) { v99dkErr("tbl", e); }
    return __tb99.apply(this, arguments);
  };
}
/* 「値が入っていない行」の注意：まとめた原材料の行は値ありとして数えない（表には「原材料名｜…」で載る） */
if (typeof v79dashDeckEmpty === "function") {
  const __de99 = v79dashDeckEmpty;
  v79dashDeckEmpty = function (T) {
    const r = __de99.apply(this, arguments);
    try {
      if (!Array.isArray(r) || !r.length) return r;
      const prods = (typeof dk3Prods === "function") ? dk3Prods(T || v99dkCur()) : [T];
      return r.map(x => {
        const t = (prods || []).find(p => p && String(p.item || "") === x.name);
        if (!t) return x;
        const X = v99dkCompFix(t.compCols, t.compRows, t);
        if (!X.rep.merged) return x;
        const still = new Set(X.rows.filter(rr => rr[0] && rr.slice(1).every(v => !v)).map(rr => rr[0]));
        return Object.assign({}, x, { labels: (x.labels || []).filter(l => still.has(l)) });
      }).filter(x => x.labels && x.labels.length);
    } catch (e) { v99dkErr("empty", e); return r; }
  };
}

/* ══════════ No.553 根拠の無い「〜フリー・無添加」の主張（21.98 の主張の単位に種類を足す） ══════════ */
const V99DK_NEG = "(?:不使用|無添加|なし|無し|ゼロ|フリー|を?含ま(?:ない|ず|ず)|使(?:用し|っ)?(?:てい)?(?:ない|ません|わない|わず)|を?使用(?:していない|しておりません|しません))";
const V99DK_FREE = [
  { k: "additive", ja: "無添加", re: /\badditive[- ]free\b|\bno (?:added |artificial )?additives\b|\bfree (?:of|from) (?:any )?additives\b|\bwithout (?:any )?additives\b|\bzero additives\b|无添加|無添加|sin aditivos|sans additifs?|ohne zusatzstoffe/i,
    ev: new RegExp("無添加|添加物[^。\\n]{0,12}" + V99DK_NEG + "|additive[- ]free|no additives|without additives", "i") },
  { k: "preserv", ja: "保存料不使用", re: /\bpreservative[- ]free\b|\bno (?:added |artificial )?preservatives?\b|\bfree (?:of|from) (?:any )?preservatives\b|\bwithout (?:any )?preservatives\b|不含防腐剂|无防腐剂|無防腐劑|sin conservantes|sans conservateurs?|ohne konservierungsstoffe/i,
    ev: new RegExp("保存料[^。\\n]{0,16}" + V99DK_NEG + "|防腐剤[^。\\n]{0,16}" + V99DK_NEG + "|preservative[- ]free|no preservatives|without preservatives", "i") },
  { k: "artificial", ja: "人工・合成の〜不使用", re: /\bno artificial (?:colou?rs?|colou?rings?|flavou?rs?|flavou?rings?|ingredients|additives|preservatives|sweeteners)\b|\bartificial[- ](?:colou?r|flavou?r)s?[- ]free\b|\bfree (?:of|from) artificial\b|\bwithout (?:any )?artificial\b/i,
    ev: new RegExp("(?:人工|合成)[^。\\n]{0,10}" + V99DK_NEG + "|(?:着色料|香料|甘味料)[^。\\n]{0,16}" + V99DK_NEG + "|無着色|無香料|no artificial", "i") },
  { k: "natural", ja: "天然100%", re: /\ball[- ]natural\b|\b100\s?% natural\b|\bnatural ingredients only\b|\bpurely natural\b|\bentirely natural\b|纯天然|全天然|純天然|100\s?% naturales?/i,
    ev: /天然(?:成分)?100|100\s?%\s?天然|天然由来100|自然由来100|すべて天然|全て天然|オール天然|all[- ]natural|100\s?% natural/i },
  { k: "chemical", ja: "化学物質不使用", re: /\bchemical[- ]free\b|\bno (?:harsh |added )?chemicals\b|\bfree (?:of|from) (?:harsh )?chemicals\b|\bwithout (?:any )?chemicals\b|sin químicos|sans produits chimiques/i,
    ev: new RegExp("化学(?:物質|薬品|成分|肥料|農薬|合成)[^。\\n]{0,12}" + V99DK_NEG + "|ケミカルフリー|chemical[- ]free", "i") },
  { k: "humangrade", ja: "ヒューマングレード", re: /\bhuman[- ]grade\b|\bfit for human consumption\b/i,
    ev: /ヒューマングレード|人(?:間)?(?:用|が食べられる|も食べられる)(?:の)?(?:食材|原料|品質)|食品(?:用)?(?:グレード|規格)の原料|human[- ]grade/i },
  { k: "hypoallergenic", ja: "低アレルゲン", re: /\bhypo[- ]?allergenic\b|\ballergy[- ]free\b|\ballergen[- ]free\b|低致敏|hipoalerg[eé]nic\w*|hypoallergénique/i,
    ev: new RegExp("低刺激|低アレルゲン|アレルギーテスト済|アレルゲンフリー|アレルゲン[^。\\n]{0,6}" + V99DK_NEG + "|特定原材料[^。\\n]{0,12}" + V99DK_NEG + "|hypoallergenic|allergen[- ]free", "i") },
  { k: "gluten", ja: "グルテンフリー", re: /\bgluten[- ]free\b|\bno gluten\b|\bwithout gluten\b|无麸质|無麩質|sin gluten|sans gluten|glutenfrei/i,
    ev: new RegExp("グルテン[^。\\n]{0,6}" + V99DK_NEG + "|小麦[^。\\n]{0,8}" + V99DK_NEG + "|gluten[- ]free", "i") },
  { k: "grain", ja: "グレインフリー", re: /\bgrain[- ]free\b|\bno grains?\b|\bwithout grains?\b|无谷物|無穀|sin granos|sans céréales/i,
    ev: new RegExp("グレインフリー|穀物[^。\\n]{0,8}" + V99DK_NEG + "|grain[- ]free", "i") },
  { k: "paraben", ja: "パラベンフリー", re: /\bparaben[- ]free\b|\bno parabens?\b|\bwithout parabens?\b|无羟苯酯|sin parabenos|sans parabènes?/i,
    ev: new RegExp("パラベン[^。\\n]{0,6}" + V99DK_NEG + "|paraben[- ]free", "i") },
  { k: "alcohol", ja: "アルコール不使用", re: /\balcohol[- ]free\b|\bnon[- ]alcoholic\b|\bno alcohol\b|\bwithout alcohol\b|不含酒精|无酒精|sin alcohol|sans alcool/i,
    ev: new RegExp("アルコール[^。\\n]{0,8}" + V99DK_NEG + "|ノンアルコール|alcohol[- ]free", "i") },
  { k: "gmo", ja: "遺伝子組換えでない", re: /\bnon[- ]?GMO\b|\bGMO[- ]free\b|\bno GMOs?\b|非转基因|非基改|sin OGM|sans OGM/i,
    ev: /遺伝子組(?:み)?換え[^。\n]{0,10}(?:でない|ではない|不使用|なし|無し|分別)|non[- ]?GMO|非遺伝子組/i },
  { k: "fragrance", ja: "無香料", re: /\bfragrance[- ]free\b|\bunscented\b|\bno (?:added )?fragrances?\b|\bperfume[- ]free\b|\bwithout (?:any )?fragrances?\b|无香料|無香料|sin fragancia|sans parfum/i,
    ev: new RegExp("無香料|香料[^。\\n]{0,12}" + V99DK_NEG + "|fragrance[- ]free|unscented|no fragrance", "i") },
  { k: "colorant", ja: "無着色", re: /\bcolou?r[- ]free\b|\bno (?:added )?colou?r(?:ant|ing)?s?\b|\bwithout (?:any )?colou?r(?:ant|ing)s?\b|无色素|無色素|sin colorantes|sans colorants?/i,
    ev: new RegExp("無着色|着色料[^。\\n]{0,12}" + V99DK_NEG + "|colou?r[- ]free|no colou?rants", "i") }
];
try {
  if (typeof V98DK_CON !== "undefined" && Array.isArray(V98DK_CON)) {
    V99DK_FREE.forEach(c => { if (!V98DK_CON.some(x => x.k === c.k)) V98DK_CON.push({ k: c.k, ja: c.ja, re: c.re, ev: c.ev, v99free: 1 }); });
    if (typeof V98DK_CONJA !== "undefined") V99DK_FREE.forEach(c => { V98DK_CONJA[c.k] = c.ja; });
  }
} catch (e) { v99dkErr("free0", e); }
/* 言葉だけ外せるとき（「Additive-free, low-fat and high-protein jerky」→「Low-fat and high-protein jerky」）。外せなければ文を外す（21.98 の動き） */
function v99dkStripFree(s, k) {
  const c = V99DK_FREE.find(x => x.k === k);
  if (!c) return null;
  const star = /^\s*\*\*/.test(s);
  let t = s;
  const src = c.re.source;
  const reHead = new RegExp("^(\\s*\\**)\\s*(?:" + src + ")(?:\\s*(?:,|and|&)\\s*|\\s+(?=[a-z]))", "i");
  const reMid = new RegExp("(?:,\\s*|\\s+and\\s+|\\s*&\\s*)(?:" + src + ")(?=\\s*(?:,|and\\b|&|\\s+[a-z]))", "i");
  const reMid2 = new RegExp("(?:" + src + ")\\s*(?:,\\s*|\\s+and\\s+)", "i");
  const reParen = new RegExp("\\s*\\((?:[^()]*?)(?:" + src + ")(?:[^()]*)\\)", "i");
  let ch = false;
  if (reParen.test(t)) { t = t.replace(reParen, ""); ch = true; }
  if (!ch && reHead.test(t)) { t = t.replace(reHead, "$1"); ch = true; t = t.replace(/^(\s*\**)\s*([a-z])/, (m0, a, b) => a + b.toUpperCase()); }
  if (!ch && reMid.test(t)) { t = t.replace(reMid, ""); ch = true; }
  if (!ch && reMid2.test(t) && t.search(reMid2) > 0) { t = t.replace(reMid2, ""); ch = true; }
  if (!ch) return null;
  t = t.replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").replace(/,\s*,/g, ",").trim();
  const words = t.replace(/\*\*/g, "").split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  if (c.re.test(t)) return null;
  if (star && !/^\s*\*\*/.test(t)) t = "**" + t;
  return t;
}
if (typeof v98dkStripCon === "function") {
  const __sc99 = v98dkStripCon;
  v98dkStripCon = function (s, k) {
    try { if (V99DK_FREE.some(x => x.k === k)) { const r = v99dkStripFree(s, k); if (r) v99dkN("freeStrip"); return r; } } catch (e) { v99dkErr("stripfree", e); }
    return __sc99.apply(this, arguments);
  };
}
/* 21.98 の理由の書き方「根拠に無い主張：無添加（登録・資料に無添加の記載がありません）」は V98DK_CONJA で出る */

/* ══════════ No.533 の C 利用者の「資料に載せない」指示（言葉・数値） ══════════ */
function v99dkNgList(T) { T = T || v99dkCur(); try { return (T && Array.isArray(T.v99dkNg)) ? T.v99dkNg.filter(x => x && String(x.t || "").trim()) : []; } catch (e) { return []; } }
function v99dkNgAll() { const T = v99dkTen() || v99dkCur(); const L = v99dkNgList(T); try { const C = v99dkCur(); if (C && C !== T) v99dkNgList(C).forEach(x => { if (!L.some(y => y.t === x.t)) L.push(x); }); } catch (e) { } return L; }
function v99dkNums(s, lang) { try { return (typeof dk3NumsIn === "function" ? dk3NumsIn(v99dkNF(s), lang || "en") : []).filter(n => n && isFinite(+n.full) && n.k !== "year"); } catch (e) { return []; } }
function v99dkConOf(term) { try { const t = v99dkNF(term); return (typeof V98DK_CON !== "undefined" ? V98DK_CON : []).filter(c => c.re && c.ev && (c.ev.test(t) || c.re.test(t))); } catch (e) { return []; } }
/* 1つの指示を照らす形にする：数値（種類・値）／英語などの語句／意味のまとまり（熟成・無添加など） */
function v99dkNgPrep(x) {
  const t = v99dkNF(String(x.t || "")).trim();
  const P = { t, nums: [], words: [], cons: [] };
  if (!t) return P;
  P.nums = v99dkNums(t, /[ぁ-ゖァ-ヺ一-龯]/.test(t) ? "ja" : "en").map(n => ({ k: n.k, full: +(+n.full).toFixed(4) }));
  if (!P.nums.length) {
    if (/[A-Za-z]{2,}/.test(t) && !/[ぁ-ゖァ-ヺ一-龯]/.test(t)) P.words.push(t.toLowerCase());
    P.cons = v99dkConOf(t).map(c => c.k);
    if (!P.words.length && !P.cons.length && /[ぁ-ゖァ-ヺ一-龯]/.test(t)) P.ja = t;
  }
  return P;
}
function v99dkNgHit(txt, Ps, lang) {
  const s = v99dkNF(String(txt || ""));
  if (!s.trim()) return null;
  for (const P of Ps) {
    if (P.nums.length) {
      const ns = v99dkNums(s, lang || (/[ぁ-ゖァ-ヺ一-龯]/.test(s) ? "ja" : "en"));
      if (P.nums.every(a => ns.some(b => (b.k === a.k || a.k === "n") && Math.abs(+b.full - a.full) <= Math.max(1e-6, Math.abs(a.full) * 0.001)))) return P;
      continue;
    }
    if (P.words.length && P.words.some(w => s.toLowerCase().indexOf(w) >= 0)) return P;
    if (P.cons.length) { try { const U = (typeof v98dkUnits === "function") ? v98dkUnits(s, lang || "en") : null; if (U && U.cons.some(c => P.cons.indexOf(c.k) >= 0)) return P; } catch (e) { } }
    if (P.ja && s.indexOf(P.ja) >= 0) return P;
  }
  return null;
}
V99DECK.ngHit = (txt, terms, lang) => v99dkNgHit(txt, (terms || []).map(t => v99dkNgPrep({ t })), lang);
/* 文を直す：括弧の中 → 「of/with 数値…」の句 → 文 の順に、指示に当たる所だけを外す。外せなければ空 */
function v99dkNgCut(s, Ps, lang) {
  const t = String(s == null ? "" : s);
  if (!v99dkNgHit(t, Ps, lang)) return { act: "keep", txt: t };
  const lead = (t.match(/^\s*/) || [""])[0], tail = (t.match(/\s*$/) || [""])[0];
  const nW = (x) => String(x).replace(/\*\*/g, "").trim().split(/\s+/).filter(w => /[A-Za-zぁ-ゖァ-ヺ一-龯]/.test(w)).length;
  /* 1つの文の中：括弧（全角・半角）→ 句（of/with/at/to … 数値 単位 [or less|or more]） */
  const one = (x) => {
    let u = x.replace(/\s*[（(][^（()）]*[）)]/g, (m0) => v99dkNgHit(m0, Ps, lang) ? "" : m0);
    if (!v99dkNgHit(u, Ps, lang)) return u.replace(/\s{2,}/g, " ");
    u = u.replace(/\s*(?:,\s*)?(?:(?<![A-Za-z])(?:of|with|at|to|down to|up to|below|under|as low as|only|just)\s+)?(?:approx\.?\s*|about\s*|~\s*|≤\s*|<\s*)?\d[\d.,]*\s*[^\s,.;:()（）]*(?:\s*(?:or less|or more|or lower|or higher|and below|and above|max(?:imum)?|min(?:imum)?|以下|以上|未満))?/gi, (m0) => v99dkNgHit(m0, Ps, lang) ? "" : m0);
    u = u.replace(/\s{2,}/g, " ").replace(/\s+([,.;:。、])/g, "$1").replace(/[（(]\s*[）)]/g, "");
    return v99dkNgHit(u, Ps, lang) ? null : u;
  };
  const ss = (typeof v98dkSents === "function") ? v98dkSents(t.trim()) : t.trim().split(/(?<=[.!?。])\s+/);
  if (ss.length > 1) {
    const out = [];
    ss.forEach(x => { if (!v99dkNgHit(x, Ps, lang)) { out.push(x); return; } const y = one(x); if (y != null && nW(y) >= 3) out.push(y.trim()); });
    if (out.length) return { act: "fix", txt: lead + out.join(" ").trim() + tail };
    return { act: "drop", txt: "" };
  }
  const y = one(t);
  if (y != null && nW(y) >= (/[ぁ-ゖァ-ヺ一-龯]/.test(y) ? 1 : 2)) return { act: "fix", txt: y };
  return { act: "drop", txt: "" };
}
V99DECK.ngCut = (s, terms, lang) => v99dkNgCut(s, (terms || []).map(t => v99dkNgPrep({ t })), lang);
/* 計画（AI の文章）から外す：項目（stats の1件・カードの1件）ごとに見る */
function v99dkNgPlan(r, lang) {
  const rep = [];
  try {
    const Ps = v99dkNgAll().map(v99dkNgPrep).filter(P => P.t);
    if (!Ps.length || !r || !r.plan) return rep;
    const walk = (o, path) => {
      if (Array.isArray(o)) {
        for (let i = o.length - 1; i >= 0; i--) {
          const x = o[i];
          if (x && typeof x === "object" && !Array.isArray(x)) {
            const all = Object.keys(x).filter(k => typeof x[k] === "string" || typeof x[k] === "number").map(k => String(x[k])).join(" ");
            const isStat = ("v" in x) && (("u" in x) || ("l" in x));
            if (isStat && v99dkNgHit(all, Ps, lang)) { rep.push({ path: path + "." + i, txt: all.trim().slice(0, 120) }); o.splice(i, 1); continue; }
            walk(x, path + "." + i);
          } else if (typeof x === "string") {
            const X = v99dkNgCut(x, Ps, lang);
            if (X.act === "fix") { o[i] = X.txt; rep.push({ path: path + "." + i, txt: x.slice(0, 120), fix: X.txt }); }
            else if (X.act === "drop") { rep.push({ path: path + "." + i, txt: x.slice(0, 120) }); o.splice(i, 1); }
          }
        }
        return;
      }
      if (o && typeof o === "object") Object.keys(o).forEach(k => {
        const v = o[k];
        if (/^(ic|src|ref|key|id|icon|kind|style)$/.test(k)) return;
        if (typeof v === "string") {
          const X = v99dkNgCut(v, Ps, lang);
          if (X.act === "fix") { o[k] = X.txt; rep.push({ path: path + "." + k, txt: v.slice(0, 120), fix: X.txt }); }
          else if (X.act === "drop") { o[k] = ""; rep.push({ path: path + "." + k, txt: v.slice(0, 120) }); }
        } else if (v && typeof v === "object") walk(v, path ? path + "." + k : k);
      });
    };
    walk(r.plan, "");
    /* 中身が空になったカード（題も説明も空）は外す */
    try { (r.plan.products || []).forEach(p => { if (Array.isArray(p.feats)) p.feats = p.feats.filter(f => f && (String(f.t || "").trim() || String(f.d || "").trim())); }); } catch (e) { }
    try { ["quality", "stats"].forEach(k => { const X = r.plan[k]; if (X && Array.isArray(X.items)) X.items = X.items.filter(f => f && Object.keys(f).some(z => z !== "ic" && z !== "src" && String(f[z] == null ? "" : f[z]).trim())); }); } catch (e) { }
    if (rep.length) {
      const why = "利用者の指示で外しました（資料に載せない：" + Ps.map(P => P.t).join("・") + "）";
      r.dropped = (r.dropped || []).concat(rep.filter(x => !x.fix).map(x => ({ path: x.path, txt: x.txt, why, v99ng: 1 })));
      r.v99ngFix = rep.filter(x => x.fix);
      v99dkN("ngPlan", rep.length);
    }
  } catch (e) { v99dkErr("ngplan", e); }
  return rep;
}
/* 登録の転記（強み・表・基本の項目）から外す：資料の元のデータ（訳す前）で */
function v99dkNgData(d, lang) {
  let n = 0;
  try {
    const Ps = v99dkNgAll().map(v99dkNgPrep).filter(P => P.t);
    if (!Ps.length || !d) return d;
    const walk = (o) => {
      if (Array.isArray(o)) {
        for (let i = o.length - 1; i >= 0; i--) {
          const x = o[i];
          if (Array.isArray(x) && x.every(c => c == null || typeof c !== "object")) {           /* 表の1行・強みの1件 */
            const all = x.map(c => String(c == null ? "" : c)).join(" ");
            if (v99dkNgHit(all, Ps, "ja")) {
              const head = String(x[0] == null ? "" : x[0]);
              const X = v99dkNgCut(head, Ps, "ja");
              if (!v99dkNgHit(x.slice(1).join(" "), Ps, "ja") && X.act === "fix") { x[0] = X.txt; n++; }
              else { o.splice(i, 1); n++; }
            }
          } else if (typeof x === "string") { const X = v99dkNgCut(x, Ps, "ja"); if (X.act !== "keep") { if (X.act === "fix") o[i] = X.txt; else o.splice(i, 1); n++; } }
          else if (x && typeof x === "object") walk(x);
        }
        return;
      }
      if (o && typeof o === "object") Object.keys(o).forEach(k => { const v = o[k]; if (typeof v === "string") { const X = v99dkNgCut(v, Ps, "ja"); if (X.act !== "keep") { o[k] = X.act === "fix" ? X.txt : ""; n++; } } else if (v && typeof v === "object") walk(v); });
    };
    walk(d);
    if (n) v99dkN("ngData", n);
  } catch (e) { v99dkErr("ngdata", e); }
  return d;
}
/* 最終の資料（全部の文・ノート）から外す。戻り値＝直した数と、残った数（0 のはず） */
function v99dkNgDeck(deck) {
  const out = { fix: 0, drop: 0, left: [], terms: [] };
  try {
    const Ps = v99dkNgAll().map(v99dkNgPrep).filter(P => P.t);
    out.terms = Ps.map(P => P.t);
    if (!Ps.length || !deck || !Array.isArray(deck.slides)) return out;
    const lang = deck.lang || "en";
    deck.slides.forEach((S, si) => {
      (S.els || []).forEach(e => {
        if (!e || e.k !== "text" || !Array.isArray(e.ps) || e.v54 || /^(draft|v54draft|v54note)$/.test(e.name || "")) return;
        let ch = false;
        e.ps.forEach(p => {
          const rs = (p.r || []).filter(r => r && typeof r.t === "string");
          const full = rs.map(r => r.t).join("");
          if (!v99dkNgHit(full, Ps, lang)) return;
          const X = v99dkNgCut(full, Ps, lang);
          if (X.act === "fix" && rs.length === 1) { rs[0].t = X.txt; out.fix++; ch = true; return; }
          if (X.act === "fix") { let ok = true; rs.forEach(r => { const Y = v99dkNgCut(r.t, Ps, lang); if (Y.act === "fix") r.t = Y.txt; else if (Y.act === "drop") r.t = ""; }); if (!v99dkNgHit(rs.map(r => r.t).join(""), Ps, lang)) { out.fix++; ch = true; return; } ok = false; }
          rs.forEach(r => { r.t = ""; }); out.drop++; ch = true;
        });
        if (ch) { try { delete e.mh; } catch (x) { } }
      });
      if (S.notes) { const X = v99dkNgCut(String(S.notes), Ps, lang); if (X.act !== "keep") { S.notes = X.act === "fix" ? X.txt : ""; out.fix++; } }
    });
    deck.slides.forEach((S, si) => (S.els || []).forEach(e => { if (e && e.k === "text" && Array.isArray(e.ps) && !e.v54) { const t = e.ps.map(p => (p.r || []).map(r => (r && r.t) || "").join("")).join(" "); const P = v99dkNgHit(t, Ps, lang); if (P) out.left.push({ si: si + 1, t: t.slice(0, 50), ng: P.t }); } }));
    if (out.fix || out.drop) v99dkN("ngDeck", out.fix + out.drop);
  } catch (e) { v99dkErr("ngdeck", e); }
  return out;
}
V99DECK.ngDeck = v99dkNgDeck;
if (typeof dk3Plan === "function") {
  const __pl99 = dk3Plan;
  dk3Plan = async function (lang, say, force, T) {
    const r = await __pl99.apply(this, arguments);
    try { if (r && r.plan) { v99dkNgPlan(r, lang); try { if (typeof DK3G !== "undefined" && DK3G) DK3G.v99ngFix = (r.v99ngFix || []).slice(); } catch (e) { } } } catch (e) { v99dkErr("plan", e); }
    return r;
  };
}
if (typeof dk3DataSrc === "function") {
  const __ds99 = dk3DataSrc;
  dk3DataSrc = function (T) {
    const d = __ds99.apply(this, arguments);
    try { if (v99dkNgAll().length && d) return v99dkNgData(JSON.parse(JSON.stringify(d)), "ja"); } catch (e) { v99dkErr("ds", e); }
    return d;
  };
}
if (typeof v85dkOneDeck === "function") {
  const __od99 = v85dkOneDeck;
  v85dkOneDeck = function () {
    const r = __od99.apply(this, arguments);
    const fin = (one) => { try { if (one && Array.isArray(one.slides)) { v99dkNgDeck(one); if (one.lang && one.lang !== "ja") { v99dkFreeDeck(one); v99dkCatDeck(one); } } } catch (e) { v99dkErr("one", e); } return one; };
    return (r && typeof r.then === "function") ? r.then(fin) : fin(r);
  };
}
/* 書く依頼に、利用者の指示を入れる（AI が最初から書かない） */
if (typeof llmAsk === "function") {
  const __la99 = llmAsk;
  llmAsk = function (q, maxTok, opts) {
    try {
      const o = opts || {};
      if (typeof q === "string" && /B2B export copywriter/.test(String(o.sys || "")) && q.indexOf("利用者の指示（資料に載せない）") < 0) {
        const L = v99dkNgAll().map(x => String(x.t)).filter(Boolean);
        const add = (L.length ? "- 利用者の指示（資料に載せない）：次の言葉・数値は、どの欄（見出し・強み・数字のカード・説明・表）にも書かない。言い換え・単位を変えた書き方もしない：" + L.join("／") + "\n" : "") +
          "- 「無添加・〜フリー・不使用・天然100%・ヒューマングレード・低アレルゲン」などの主張（additive-free・preservative-free・no artificial・all-natural・chemical-free・human-grade・hypoallergenic・gluten-free・grain-free など）は、根拠に同じ記載がある時だけ書く。\n";
        const i = q.indexOf("■JSONの形");
        q = i > 0 ? q.slice(0, i) + add + q.slice(i) : q + "\n" + add;
        v99dkN("rulePlan");
      }
    } catch (e) { v99dkErr("la", e); }
    return __la99.apply(this, [q, maxTok, opts]);
  };
}
/* 根拠の無い「〜フリー」：資料に組んだ後（1枚の紹介シートも）にも同じ判定で外す（21.98 の deckClaims は計画で外れた主張の種類だけ見るため） */
function v99dkFreeDeck(deck) {
  const out = { fix: [], drop: [] };
  try {
    if (!deck || !Array.isArray(deck.slides) || !deck.lang || deck.lang === "ja" || typeof v98dkEv !== "function" || typeof dk3Corpus !== "function") return out;
    const E = v98dkEv(dk3Corpus(v99dkTen()));
    if (!E) return out;
    const bad = V99DK_FREE.filter(c => E.cons[c.k] === false);
    if (!bad.length) return out;
    deck.slides.forEach((S, si) => (S.els || []).forEach(e => {
      if (v99dkSkipEl(e) || e.name === "foot") return;
      let ch = false;
      e.ps.forEach(p => {
        const rs = (p.r || []).filter(r => r && typeof r.t === "string" && r.t.trim());
        if (!rs.length) return;
        rs.forEach(r => {
          bad.forEach(c => {
            if (!c.re.test(r.t)) return;
            let t2 = v99dkStripFree(r.t, c.k);
            if (!t2) { const ss = (typeof v98dkSents === "function") ? v98dkSents(r.t) : [r.t]; const keep = ss.filter(x => !c.re.test(x)); t2 = keep.length && keep.length < ss.length ? keep.join(" ") : ""; }
            if (t2) out.fix.push({ si: si + 1, a: r.t.trim().slice(0, 60), b: t2.trim().slice(0, 60), k: c.k }); else out.drop.push({ si: si + 1, a: r.t.trim().slice(0, 60), k: c.k });
            const lead = (r.t.match(/^\s*/) || [""])[0], tail = (r.t.match(/\s*$/) || [""])[0];
            r.t = t2 ? lead + t2.trim() + tail : ""; ch = true;
          });
        });
      });
      if (ch) { try { delete e.mh; } catch (x) { } }
    }));
    if (out.fix.length || out.drop.length) v99dkN("freeDeck", out.fix.length + out.drop.length);
  } catch (e) { v99dkErr("freedeck", e); }
  return out;
}
V99DECK.freeDeck = v99dkFreeDeck;

/* ══════════ No.518 カテゴリーを変えた後：型・根拠・資料の文・AI の気づき ══════════ */
function v99dkMd(T) { try { return (typeof V98REG !== "undefined" && V98REG && typeof V98REG.md === "function") ? V98REG.md(T) : null; } catch (e) { return null; } }
function v99dkNotMed(T) {
  try {
    if (!T) return false;
    const m = v99dkMd(T);
    const cat = String(T.cat || ""), ck = String(T.catKey || "");
    if (m && m.v === "yes") return false;
    if (/医療|衛生/.test(cat) || ck === "medical") return !!(m && m.v === "no");
    return !!cat;
  } catch (e) { return false; }
}
try {
  if (typeof V85DK !== "undefined" && V85DK && typeof V85DK.cat === "function") {
    const __cat99 = V85DK.cat;
    V85DK.cat = function (T) {
      const r = __cat99.apply(this, arguments);
      try {
        if (!r || r.src === "manual" || r.k !== "medical") return r;
        const t = T || v99dkCur();
        if (!v99dkNotMed(t)) return r;
        const ck = String(t.catKey || (typeof catKeyOf === "function" ? catKeyOf(t.cat) : "") || "");
        const byK = { food: "food", cosme: "cosmetics", parts: "industrial", daily: "household", car: "industrial", liquor: "beverage_alcohol", apparel: "apparel" }[ck] || "household";
        if (typeof V85DK_CATS !== "undefined" && !V85DK_CATS[byK]) return r;
        v99dkN("catFix");
        return { k: byK, why: String(r.why || "") + "（医療機器ではないため、医療機器・ヘルスケアの型にはしません。区分「" + String(t.cat || "") + "」の型）", src: r.src === "hs" ? "cat" : r.src, v99: 1 };
      } catch (e) { v99dkErr("cat", e); }
      return r;
    };
  }
} catch (e) { v99dkErr("cat0", e); }
const V99DK_MEDCAT = /医療・衛生用品|医療衛生用品|医療用品|衛生・医療用品|医療機器・ヘルスケア/g;
function v99dkCatScrubTxt(s, T) {
  const cat = String((T && T.cat) || "").trim();
  if (!cat) return s;
  return String(s).replace(V99DK_MEDCAT, (m) => (cat.indexOf(m) >= 0 ? m : cat));
}
if (typeof dk3Corpus === "function") {
  const __co99 = dk3Corpus;
  dk3Corpus = function (T) {
    const C = __co99.apply(this, arguments);
    try {
      const t = T || v99dkCur();
      if (C && t && v99dkNotMed(t) && typeof C.text === "string" && V99DK_MEDCAT.test(C.text)) {
        V99DK_MEDCAT.lastIndex = 0;
        C.text = v99dkCatScrubTxt(C.text, t);
        (C.blocks || []).forEach(b => { if (b && typeof b.txt === "string") b.txt = v99dkCatScrubTxt(b.txt, t); });
        C.key = String(C.key || "") + "|v99cat:" + String(t.cat || "");
        try { delete C.__v98ev; } catch (e) { }
        v99dkN("corpusCat");
      }
      V99DK_MEDCAT.lastIndex = 0;
    } catch (e) { v99dkErr("corpus", e); }
    return C;
  };
}
const V99DK_CATEN = { daily: "household goods", food: "food", cosme: "cosmetics", parts: "industrial parts", car: "automotive parts", apparel: "apparel", liquor: "beverages", other: "consumer goods" };
function v99dkCatDeck(deck) {
  let n = 0;
  try {
    const T = v99dkTen();
    if (!deck || !Array.isArray(deck.slides) || !deck.lang || deck.lang === "ja" || !v99dkNotMed(T)) return 0;
    const ck = String(T.catKey || (typeof catKeyOf === "function" ? catKeyOf(T.cat) : "") || "other");
    const en = V99DK_CATEN[ck] || "consumer goods";
    const re1 = /\b(?:the\s+)?medical\s*(?:and|&|\/)\s*hygiene\s+(?:products?\s+|supplies\s+|goods\s+)?(category|sector|field|segment|class)\b/gi;
    const re2 = /\bmedical\s*(?:and|&|\/)\s*hygiene\s+(products?|supplies|goods|items)\b/gi;
    const re3 = /\b(?:in|under|as)\s+(?:the\s+)?medical(?:\s+(?:device|supplies|products?))?\s+(category|class|classification)\b/gi;
    deck.slides.forEach(S => (S.els || []).forEach(e => {
      if (v99dkSkipEl(e)) return;
      e.ps.forEach(p => (p.r || []).forEach(r => {
        if (!r || typeof r.t !== "string") return;
        const a = r.t;
        let b = a.replace(re1, (m0, k) => "the " + en + " " + k.toLowerCase()).replace(re2, (m0, k) => en.replace(/ goods$/, "") + " " + k).replace(re3, (m0, k) => "in the " + en + " " + k);
        if (deck.lang === "en") b = b.replace(/\bmedical[- ]grade\b/gi, "high-quality");
        if (b !== a) { r.t = b; n++; try { delete e.mh; } catch (x) { } }
      }));
    }));
    if (n) v99dkN("catDeck", n);
  } catch (e) { v99dkErr("catdeck", e); }
  return n;
}
V99DECK.catDeck = v99dkCatDeck;
/* 商品の画面の「AIの気づき」：医療機器ではない商品で、医療の区分を前提にした気づきは、前の区分のときの気づきとして分ける */
if (typeof v68pNotes === "function") {
  const __nt99 = v68pNotes;
  v68pNotes = function (t) {
    const L = __nt99.apply(this, arguments);
    try {
      if (!Array.isArray(L) || !t || !v99dkNotMed(t)) return L;
      const cat = String(t.cat || "");
      const old = /医療・衛生用品|医療機器|医療用品|医療・衛生|薬機法|ISO\s*13485|クラス[IⅠ]{1,3}|medical device/i;
      return L.map(x => {
        if (!x || !old.test(String(x.n || "")) || cat && String(x.n).indexOf(cat) >= 0) return x;
        v99dkN("noteOld");
        return Object.assign({}, x, { n: v99dkM("（前の区分のときの気づき。いまの区分は「" + cat + "」で、医療機器ではありません）", "(Note from the previous category. The current category is \"" + cat + "\" and this is not a medical device) ", "（旧类别时的提示。当前类别为“" + cat + "”，不是医疗器械）", "(Nota de la categoría anterior. La categoría actual es «" + cat + "» y no es un dispositivo médico) ") + String(x.n), done: true, by: x.by || v99dkM("区分の変更", "Category changed", "类别已变更", "Categoría cambiada") });
      });
    } catch (e) { v99dkErr("notes", e); return L; }
  };
}

/* ══════════ No.532 外国語の資料の中の下書きの印を、資料の言語に ══════════ */
const V99DK_DRAFT = {
  en: { band: "DRAFT – for internal review", miss: "Missing", title: "Draft: items not filled in yet", lead: (n) => "This is a draft for internal review. " + n + " required item" + (n === 1 ? " is" : "s are") + " not filled in yet, so they are marked [Missing: …] in this deck.", how: "Add it in the app, then create the deck again.", end: "Fill in these items and create the deck again to get the final version without the watermark (PowerPoint / PDF).", blank: "This page is created automatically once the item above is filled in (left blank in this draft)." },
  zhCN: { band: "草稿 – 内部确认用", miss: "未填写", title: "草稿：尚未填写的项目", lead: (n) => "这是内部确认用的草稿。还有 " + n + " 项必填未填写，资料中以【未填写：…】标出。", how: "请在应用中填写后重新制作。", end: "填写这些项目后重新制作，即可得到无水印的正式版（PowerPoint・PDF）。", blank: "填写上面的项目后，此页将自动生成（草稿中暂为空白）。" },
  zhTW: { band: "草稿 – 內部確認用", miss: "未填寫", title: "草稿：尚未填寫的項目", lead: (n) => "這是內部確認用的草稿。還有 " + n + " 項必填未填寫，資料中以【未填寫：…】標出。", how: "請在應用程式中填寫後重新製作。", end: "填寫這些項目後重新製作，即可得到無浮水印的正式版（PowerPoint・PDF）。", blank: "填寫上面的項目後，此頁將自動產生（草稿中暫為空白）。" },
  es: { band: "BORRADOR – revisión interna", miss: "Falta", title: "Borrador: elementos aún sin completar", lead: (n) => "Este es un borrador para revisión interna. Faltan " + n + " elementos obligatorios; en la presentación se marcan como [Falta: …].", how: "Añádalo en la aplicación y vuelva a crear la presentación.", end: "Complete estos elementos y vuelva a crear la presentación para obtener la versión final sin marca de agua (PowerPoint / PDF).", blank: "Esta página se crea automáticamente cuando se complete el elemento de arriba (en blanco en este borrador)." },
  ko: { band: "초안 – 내부 확인용", miss: "미입력", title: "초안: 아직 입력되지 않은 항목", lead: (n) => "내부 확인용 초안입니다. 필수 항목 " + n + "개가 아직 입력되지 않아 자료에 [미입력: …]으로 표시했습니다.", how: "앱에서 입력한 뒤 다시 만들어 주세요.", end: "이 항목을 입력하고 다시 만들면 워터마크 없는 최종본(PowerPoint・PDF)을 만들 수 있습니다.", blank: "위 항목을 입력하면 이 페이지가 자동으로 만들어집니다(초안에서는 비어 있음)." }
};
const V99DK_MISSN = {
  coEn: ["English company name", "英文公司名", "Nombre de la empresa en inglés"], logo: ["Company / brand logo", "公司・品牌标志", "Logotipo de la empresa o marca"], prof: ["Company profile (founded, location, business)", "公司概况（成立・所在地・业务）", "Perfil de la empresa (fundación, ubicación, actividad)"],
  hist: ["Company history (3+ entries) or founding story", "公司沿革（3条以上）或创业故事", "Historia de la empresa (3+ hitos) o fundación"], mission: ["Philosophy / mission", "理念・使命", "Filosofía / misión"], itemEn: ["English product name", "英文商品名", "Nombre del producto en inglés"],
  photo: ["High-quality photos (3 or more)", "高质量照片（3张以上）", "Fotos de calidad (3 o más)"], str: ["Product strengths (3 or more)", "商品优势（3条以上）", "Puntos fuertes del producto (3 o más)"], spec: ["Ingredients / materials / specifications (table)", "成分・原材料・规格（表）", "Ingredientes / materiales / especificaciones (tabla)"],
  price: ["Price list (unit price and quantity tiers)", "价格表（单价・数量档）", "Lista de precios (precio unitario y tramos)"], moq: ["MOQ (minimum order quantity)", "最小起订量（MOQ）", "Pedido mínimo (MOQ)"], moq2: ["MOQ (minimum order quantity)", "最小起订量（MOQ）", "Pedido mínimo (MOQ)"],
  term: ["Incoterms and port of loading", "贸易术语・装运港", "Incoterm y puerto de carga"], contact: ["Contact person (email, etc.)", "联系人（邮箱等）", "Persona de contacto (correo, etc.)"]
};
function v99dkDL(lang) { return V99DK_DRAFT[lang] || V99DK_DRAFT[/^zh(TW|HK)/.test(lang) ? "zhTW" : /^zh/.test(lang) ? "zhCN" : ""] || V99DK_DRAFT.en; }
function v99dkMissName(c, lang) { const a = V99DK_MISSN[c && c.k] || null; if (!a) return ""; return /^zh/.test(lang) ? a[1] : lang === "es" ? a[2] : a[0]; }
const V99DK_JA = /[ぁ-ゖァ-ヺ一-龯々〆]/;
function v99dkDraftLang(deck) {
  let n = 0;
  try {
    if (!deck || !deck.lang || deck.lang === "ja" || !Array.isArray(deck.slides) || !deck.v54draft) return 0;
    const L = v99dkDL(deck.lang), miss = deck.v54draft.miss || [];
    const byN = (nm) => miss.find(c => c && c.n === nm);
    const nmOf = (nm) => { const c = byN(nm); return (c && v99dkMissName(c, deck.lang)) || (V99DK_JA.test(nm) ? "" : nm); };
    const tr = (t) => {
      let s = String(t);
      if (!V99DK_JA.test(s)) return s;
      s = s.replace(/【未入力：([^】]*)】/g, (m0, a) => { const x = nmOf(a); return "[" + L.miss + (x ? ": " + x : "") + "]"; });
      if (/^下書き DRAFT（社内確認用）$/.test(s.trim())) return L.band;
      if (/^下書き：まだ入力されていない項目$/.test(s.trim())) return L.title;
      let m = s.match(/^この資料は社内確認用の下書きです。必須の (\d+)項目/); if (m) return L.lead(+m[1]);
      m = s.match(/^・(.+)$/); if (m) { const x = nmOf(m[1].trim()); return "• " + (x || ""); }
      if (/^　?—/.test(s)) return "";
      if (/^入力してから「↻ もう一度作る」/.test(s)) return L.end;
      if (/^上の項目を入力すると/.test(s)) return L.blank;
      if (V99DK_JA.test(s)) { const c = miss.find(c0 => c0 && (s === c0.how || s.indexOf(c0.how) >= 0)); return c ? L.how : (V99DK_JA.test(s.replace(/\[[^\]]*\]/g, "")) ? "" : s); }
      return s;
    };
    deck.slides.forEach(S => (S.els || []).forEach(e => {
      if (!e || e.k !== "text" || !Array.isArray(e.ps) || !(e.v54 || /^(v54draft|v54note|draft)$/.test(e.name || ""))) return;
      let ch = false;
      e.ps.forEach(p => (p.r || []).forEach(r => { if (r && typeof r.t === "string" && V99DK_JA.test(r.t)) { const b = tr(r.t); if (b !== r.t) { r.t = b; ch = true; n++; } } }));
      const kept = e.ps.filter(p => (p.r || []).some(r => r && String(r.t || "").trim()));
      if (kept.length) e.ps = kept;
      if (ch) { try { delete e.mh; if (typeof dk3Fit === "function") dk3Fit(e, deck.lang, deck, 0.5); } catch (x) { } }
    }));
    if (n) v99dkN("draftLang", n);
  } catch (e) { v99dkErr("draft", e); }
  return n;
}
V99DECK.draftLang = v99dkDraftLang;
if (typeof v54deckDraftify === "function") {
  const __df99 = v54deckDraftify;
  v54deckDraftify = function (deck, miss) {
    const r = __df99.apply(this, arguments);
    try { v99dkDraftLang(r && r.slides ? r : deck); } catch (e) { v99dkErr("draftify", e); }
    return r;
  };
}
if (typeof dk3Draftify === "function") {
  const __dd99 = dk3Draftify;
  dk3Draftify = function (deck) {
    const d = __dd99.apply(this, arguments);
    try {
      if (d && d.lang && d.lang !== "ja") { const L = v99dkDL(d.lang); (d.slides || []).forEach(S => (S.els || []).forEach(e => { if (e && e.name === "draft" && Array.isArray(e.ps)) e.ps.forEach(p => (p.r || []).forEach(r => { if (r && /DRAFT — 社内確認用|社内確認用/.test(String(r.t || ""))) { r.t = L.band; v99dkN("draftBand"); } })); })); }
    } catch (e) { v99dkErr("draftify2", e); }
    return d;
  };
}
/* 最終チェックの文：外国語の資料では「[Missing: …]（資料の言語）」と示す */
const V99DK_CRIT_RE = /資料の中では【未入力：〇〇】と示しています。/;
try {
  if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
    const nm = (m, d, l) => { try { if (typeof i12Names === "function" && typeof I12_JOIN !== "undefined") return I12_JOIN[l](i12Names(m, d)); } catch (e) { } return m; };
    I18N.pat.unshift({ re: /^下書きです：必須の (\d+)項目（(.+)）が未入力です。資料の中では「\[(.+?): …\]」のように資料の言語で示しています。入力してから「↻ もう一度作る」を押すと、納品版を作れます$/,
      en: (m, d) => "This is a draft: " + m[1] + " required items are not filled in (" + nm(m[2], d, "en") + "). They are marked in the deck in the deck's language, like \"[" + m[3] + ": …]\". Fill them in and press \"↻ Create again\" to make the final deck",
      zh: (m, d) => "这是草稿：必填项还有 " + m[1] + " 项未填（" + nm(m[2], d, "zh") + "）。资料中以资料的语言标出，如“[" + m[3] + ": …]”。填写后点击“↻ 重新制作”即可制作正式版",
      es: (m, d) => "Es un borrador: faltan " + m[1] + " elementos obligatorios (" + nm(m[2], d, "es") + "). En la presentación se marcan en el idioma de la presentación, como «[" + m[3] + ": …]». Complételos y pulse «↻ Crear de nuevo» para crear la versión final" });
  }
} catch (e) { v99dkErr("i18n532", e); }

/* ══════════ No.546 化粧品の INCI 表に「Japanese label name」の列 ══════════ */
const V99DK_JACOL = { en: "Japanese label name", zhCN: "日文标示名称", zhTW: "日文標示名稱", es: "Nombre en la etiqueta japonesa", fr: "Nom sur l'étiquette japonaise", de: "Japanische Etikettenbezeichnung", ko: "일본어 표시 명칭" };
const V99DK_INCIH = { en: "Ingredient (INCI)", zhCN: "成分（INCI）", zhTW: "成分（INCI）", es: "Ingrediente (INCI)", fr: "Ingrédient (INCI)", de: "Inhaltsstoff (INCI)", ko: "성분 (INCI)" };
function v99dkJaColOn(T) { try { if (!T) return false; if (T.v99dkJaCol === 0 || T.v99dkJaCol === false) return false; if (T.v99dkJaCol === 1 || T.v99dkJaCol === true) return true; const k = (typeof V85DK !== "undefined" && V85DK.cat) ? V85DK.cat(T).k : ""; return k === "cosmetics" || k === "cosmetic_ingredient" || /cosme/.test(String(T.catKey || "")); } catch (e) { return false; } }
function v99dkInciRows(t) {
  try {
    if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return null;
    const cols = (t.compCols || []).map(c => String(c == null ? "" : c));
    let iI = cols.findIndex((c, i) => i > 0 && /INCI/i.test(c));
    if (iI < 0) iI = cols.findIndex((c, i) => i > 0 && t.compRows.filter(r => /^[A-Za-z][A-Za-z0-9 ,.()\-\/'&+]{1,}$/.test(String((r && r[i]) || "").trim())).length >= Math.max(1, Math.ceil(t.compRows.length * 0.6)));
    if (iI <= 0) return null;
    const rows = [];
    t.compRows.forEach(r => { if (!Array.isArray(r)) return; const ja = String(r[0] == null ? "" : r[0]).trim(), inc = String(r[iI] == null ? "" : r[iI]).trim(); if (!inc) return; rows.push([inc, V99DK_JA.test(ja) ? ja : ""]); });
    if (!rows.length || !rows.some(r => r[1])) return null;
    return rows;
  } catch (e) { return null; }
}
const V99DK_JAOK = new Set();
if (typeof dk3Model === "function") {
  const __dm99 = dk3Model;
  dk3Model = function (lang0, plan, data, ph, deck, src, T) {
    let d2 = data;
    try {
      const TT = T || v99dkTen();
      if (lang0 && !/^ja/.test(String(lang0)) && data && Array.isArray(data.prods) && v99dkJaColOn(TT)) {
        const prods = (typeof dk3Prods === "function") ? dk3Prods(TT) : [TT];
        let ch = 0;
        const P2 = data.prods.map((p, i) => {
          const t = prods[i];
          const rows = v99dkInciRows(t);
          if (!p || !p.comp || !rows) return p;
          /* 21.99.3（11/20 回帰の洗い出し）：inciCase は 21.97 の層の中にしか無く、外からは V97P.inciCase で呼ぶ（前は常に元のまま＝大文字のままだった） */
          const ic = (typeof V97P !== "undefined" && V97P && typeof V97P.inciCase === "function") ? V97P.inciCase : (typeof inciCase === "function") ? inciCase : (x) => x;
          rows.forEach(r => { if (r[1]) V99DK_JAOK.add(r[1]); });
          ch++;
          return Object.assign({}, p, { comp: { cols: [V99DK_INCIH[lang0] || V99DK_INCIH[String(lang0).slice(0, 2)] || V99DK_INCIH.en, V99DK_JACOL[lang0] || V99DK_JACOL[String(lang0).slice(0, 2)] || V99DK_JACOL.en], rows: rows.map(r => [ic(r[0]), r[1] || "—"]) } });
        });
        if (ch) { d2 = Object.assign({}, data, { prods: P2 }); v99dkN("jaCol"); }
      }
    } catch (e) { v99dkErr("model", e); d2 = data; }
    const a = Array.prototype.slice.call(arguments); a[2] = d2;
    return __dm99.apply(this, a);
  };
}
/* 和名の列は、日本語の残りの点検の対象外（その欄の文字が和名と同じときだけ） */
function v99dkJaCell(e) { try { if (!e || e.k !== "text" || !Array.isArray(e.ps) || !V99DK_JAOK.size) return false; const t = e.ps.map(p => (p.r || []).map(r => (r && r.t) || "").join("")).join("").trim(); return !!t && V99DK_JAOK.has(t); } catch (x) { return false; } }
/* 21.99.3（11/20 回帰の洗い出し）：和名の控え（V99DK_JAOK）は作るときにしか入らず、ページを開き直したあと保存した資料を開くと
   和名の欄が「日本語の残り」と判定されて納品版が止まっていた。点検の前に、今の商品の成分表から和名を入れ直す */
function v99dkJaRefill() {
  try {
    const TT = v99dkTen(); if (!TT) return;
    const prods = (typeof dk3Prods === "function") ? (dk3Prods(TT) || [TT]) : [TT];
    prods.forEach(t => { const rows = v99dkInciRows(t); if (rows) rows.forEach(r => { if (r[1]) V99DK_JAOK.add(r[1]); }); });
  } catch (e) { v99dkErr("jarefill", e); }
}
function v99dkWithJaHidden(deck, fn) {
  v99dkJaRefill();
  /* 点検の間だけ、和名の欄の文字を記号に置き換える（どの層の日本語の点検・訳の直しにも触らせない）。終わったら元に戻す */
  const hid = [];
  try { (deck && deck.slides || []).forEach(S => (S.els || []).forEach(e => { if (v99dkJaCell(e) && !e.v54) { const keep = e.ps.map(p => (p.r || []).map(r => r ? r.t : r)); e.ps.forEach(p => (p.r || []).forEach((r, i) => { if (r && typeof r.t === "string") r.t = i === 0 ? "—" : ""; })); hid.push({ e, keep, mh: e.mh }); } })); } catch (x) { }
  try { return fn(); } finally { hid.forEach(h => { try { h.e.ps.forEach((p, pi) => (p.r || []).forEach((r, i) => { if (r && h.keep[pi]) r.t = h.keep[pi][i]; })); if (h.mh === undefined) delete h.e.mh; else h.e.mh = h.mh; } catch (x) { } }); }
}
if (typeof v97dkScanDeck === "function") {
  const __sd99 = v97dkScanDeck;
  v97dkScanDeck = function (deck, fix) { const a = arguments, self = this; return v99dkWithJaHidden(deck, () => __sd99.apply(self, a)); };
  try { if (typeof V97DK !== "undefined" && V97DK) V97DK.scanDeck = v97dkScanDeck; } catch (e) { }
}
/* 画面：和名の列の切り替え（化粧品の資料） */
document.addEventListener("change", e => {
  try {
    const c = e.target && e.target.closest && e.target.closest("[data-v99dkjacol]");
    if (!c) return;
    const T = v99dkCur(); if (!T) return;
    T.v99dkJaCol = c.checked ? 1 : 0;
    try { if (typeof saveTen === "function") saveTen(); } catch (x) { }
    if (typeof toast === "function") toast(v99dkM("INCI 表の和名の列：" + (c.checked ? "入れる" : "入れない") + "。「↻ もう一度作る」で反映します", "Japanese label name column: " + (c.checked ? "on" : "off") + ". Press \"↻ Create again\" to apply", "INCI 表的日文名称列：" + (c.checked ? "显示" : "不显示") + "。点击“↻ 重新制作”后生效", "Columna de nombre japonés: " + (c.checked ? "sí" : "no") + ". Pulse «↻ Crear de nuevo» para aplicar"));
  } catch (x) { v99dkErr("jacolchg", x); }
}, true);

/* ══════════ No.543 の A：ヒアリング・資料の取り込みで答えたアレルゲンが商品に残らない ══════════
   原因：成分表の答えを分ける v54upldComp（土台＋v92 の包み 2つ）は、「アレルゲン：大豆（本品製造工場では小麦を含む製品を製造しています）」のように
         アレルゲンの後ろに括弧の注意書きが付くと、括弧ごと1つの語として読み、12文字を超えるのでアレルゲンを捨てる（注意書きも捨てる）。
         「アレルゲン：大豆」だけなら残る。→ TEN.allergens も成分表の「アレルゲン」の行も無くなり、英語資料の成分表に Allergen が出なかった。
   直し：前の関数を呼んだ結果でアレルゲンが0件・「なし」でもないのに、元の文にアレルゲンの項目があるときだけ、アレルゲンの値の括弧の注意書き
         （工場・製造ライン・コンタミ・同じ設備・長い括弧）を別の行に出してから、前の関数をもう一度呼ぶ。アレルゲンと注意書きを取れたら、その結果を使う。 */
const V99DK_ALKW = "(?:アレルゲン|アレルギー物質|アレルギー|特定原材料(?:等|など)?(?:\\d+品目)?)";
function v99dkAlSplit(raw) {
  const s = String(raw == null ? "" : raw);
  const re = new RegExp("(" + V99DK_ALKW + "\\s*(?:[（(][^）)]*[）)])?\\s*(?:は|：|:|＝|=)\\s*)([^。\\n]*)", "g");
  return s.replace(re, (m0, head, val) => {
    const notes = [];
    let v = val.replace(/\s*[（(]([^（()）]*)[）)]/g, (m1, inner) => {
      if (/工場|製造|ライン|設備|コンタミ|混入|含む製品|同じ|同一|共用/.test(inner) || inner.length > 12) { notes.push(inner.trim()); return ""; }
      return m1;
    });
    v = v.replace(/[\s　]+$/, "");
    if (!notes.length) return m0;
    return head + v + "\n" + notes.map(n => n.replace(/。?$/, "。")).join("\n");
  });
}
V99DECK.alSplit = v99dkAlSplit;
if (typeof v54upldComp === "function") {
  const __uc99 = v54upldComp;
  v54upldComp = function (raw) {
    const r = __uc99.apply(this, arguments);
    try {
      const s = String(raw == null ? "" : raw);
      /* 前の結果が無い（null）・アレルゲンが欠けた（「大豆、小麦（同じ工場で…）」で小麦が落ちる）ときも、括弧の注意書きを分けてもう一度 */
      if (new RegExp(V99DK_ALKW + "\\s*(?:[（(][^）)]*[）)])?\\s*(?:は|：|:|＝|=)").test(s)) {
        const s2 = v99dkAlSplit(s);
        if (s2 !== s) {
          const a = Array.prototype.slice.call(arguments); a[0] = s2;
          const r2 = __uc99.apply(this, a);
          const nA = (x) => (x && Array.isArray(x.allergens)) ? x.allergens.length : 0, nN = (x) => (x && Array.isArray(x.notes)) ? x.notes.length : 0;
          if (r2 && (nA(r2) > nA(r) || (r2.none && !(r && r.none)) || (nA(r2) >= nA(r) && nN(r2) > nN(r)))) { v99dkN("alSplit"); return r2; }
        }
      }
    } catch (e) { v99dkErr("alsplit", e); }
    return r;
  };
}

/* ヒアリングの「原材料：鶏ささみ（国産）　アレルゲン：鶏肉（…）」は、成分表の1つの行（原材料｜鶏ささみ（国産） アレルゲン:鶏肉（…））に
   アレルゲンごと入り、アレルゲンの欄（TEN.allergens）にも「アレルゲン」の行にもならなかった（H）。
   直し：ヒアリングの答え（fillAnswer）の後に、成分表の値の中の「アレルゲン：…」を別の行に分け、アレルゲンの欄に入れる（前の関数を呼んでから足す）。 */
const V99DK_ALIN = new RegExp("[\\s　、,／/]*" + V99DK_ALKW + "\\s*(?:[（(][^）)]*[）)])?\\s*[：:＝=]\\s*", "");
function v99dkAlInto(t) {
  let ch = 0;
  try {
    if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return 0;
    const rows = t.compRows.map(r => Array.isArray(r) ? r.slice() : r);
    const hasAlRow = () => rows.some(r => Array.isArray(r) && v99dkLabKey(r[0]) === "allergen");
    const hasNote = () => rows.some(r => Array.isArray(r) && v99dkLabKey(r[0]) === "allergennote");
    const n = Math.max(2, ...rows.map(r => Array.isArray(r) ? r.length : 1));
    const add = [];
    rows.forEach(r => {
      if (!Array.isArray(r) || v99dkLabKey(r[0]) === "allergen" || v99dkLabKey(r[0]) === "allergennote") return;
      for (let ci = 1; ci < r.length; ci++) {
        const v = String(r[ci] == null ? "" : r[ci]);
        const m = v.match(V99DK_ALIN);
        if (!m || m.index === 0 && ci === 1 && !String(r[0] || "").trim()) continue;
        const head = v.slice(0, m.index).replace(/[\s　、,／/]+$/, ""), val = v.slice(m.index + m[0].length).trim();
        if (!val) continue;
        const c = (typeof v54upldComp === "function") ? v54upldComp("アレルゲン：" + val) : null;
        if (!c || !((c.allergens && c.allergens.length) || c.none)) continue;
        r[ci] = head;
        if (!hasAlRow() && !add.some(x => v99dkLabKey(x[0]) === "allergen")) { const x = new Array(n).fill(""); x[0] = "アレルゲン"; x[1] = c.allergens.length ? c.allergens.join("・") : "なし"; add.push(x); }
        (c.notes || []).forEach(nt => { if (!hasNote() && !add.some(x => v99dkLabKey(x[0]) === "allergennote")) { const x = new Array(n).fill(""); x[0] = "アレルゲンの注意書き"; x[1] = nt; add.push(x); } });
        if (!(Array.isArray(t.allergens) && t.allergens.length) && !t.allergenNone) { if (c.allergens.length) t.allergens = c.allergens.slice(); else t.allergenNone = 1; }
        ch++;
      }
    });
    if (ch) { t.compRows = add.concat(rows); v99dkN("alInto", ch); }
  } catch (e) { v99dkErr("alinto", e); }
  return ch;
}
V99DECK.alInto = v99dkAlInto;
/* ヒアリングは、資料の取り込みで分けた成分表（アレルゲンの行つき）を、答えの最後に「原材料｜鶏ささみ（国産） アレルゲン:鶏肉（…）」の1行で
   上書きし、アレルゲンの欄も元に戻す（V56UPLD の控えの戻し）。最後に必ず通る保存（saveTen）の前に、成分表の値の中のアレルゲンを分けて入れる。
   前の関数（ほかの層の包みを含む）はそのまま呼ぶ。 */
/* C のヒアリング「材質：軸受鋼 SUJ2／内径：20mm／…」は「材質｜軸受鋼 SUJ2/内径:20mm」の1行（1つの値に2つの項目）で保存され、
   英語資料でも「Bearing steel SUJ2/Inner diameter:20 mm」の1行になった。値の中で区切り（/・／・、・，・改行・全角空白）の後に
   「仕様の項目として知られている項目名：値」が続くときだけ、別の行に分ける（元の行の値はその前の部分だけ。数字・単位は一字も変えない）。
   知られていない語（本体・裏板 など）、時刻 10:30・比 1:2・URL のような値の中の普通の文は分けない。 */
const V99DK_SPECLAB = new Set(("内径 外径 幅 高さ 厚さ 厚み 長さ 奥行 奥行き 直径 全長 全幅 全高 重量 重さ 質量 正味重量 総重量 容量 内容量 容積 入数 材質 素材 材料 原材料 原材料名 成分 主成分 " +
  "サイズ 寸法 外寸 内寸 定格 定格電圧 定格電流 定格出力 定格荷重 動定格荷重 静定格荷重 電圧 電流 周波数 出力 消費電力 回転数 許容回転数 最高回転数 硬度 精度 等級 規格 公差 " +
  "型番 品番 型式 原産国 原産地 製造国 産地 保存方法 保管方法 保存温度 賞味期限 消費期限 使用期限 有効期限 色 カラー 塗装 塗料 表面処理 仕上げ シール シールド 潤滑 潤滑剤 " +
  "対象年齢 耐熱温度 使用温度 耐荷重 粒度 濃度 含有量 アルコール分 精米歩合 摩擦材 適合 適合車種 給与量 内容").split(/\s+/).filter(Boolean));
const V99DK_SPECSEP = /[\/／、，,\n　]/;
function v99dkSpecLab(s) { return v99dkNF(s).replace(/[\s　]+[A-Za-z]$/, "").replace(/[\s　]/g, ""); }
function v99dkSpecSplitRows(rows) {
  let ch = 0;
  if (!Array.isArray(rows) || !rows.length) return { rows, ch };
  const n = Math.max(2, ...rows.map(r => Array.isArray(r) ? r.length : 1));
  const out = [];
  const labOf = (r) => v99dkSpecLab(Array.isArray(r) ? String(r[0] == null ? "" : r[0]) : "");
  rows.forEach(r => {
    if (!Array.isArray(r) || r.length < 2) { out.push(r); return; }
    const v = String(r[1] == null ? "" : r[1]);
    /* 区切り → 項目名 → ：/: → 値。項目名は区切りの直後から「：」までの語（12字まで） */
    const re = /([\/／、，,\n　])[ \t]*([^\/／、，,\n　：:0-9０-９]{1,12}?)[ \t]*[：:][ \t]*(?=\S)/g;
    const hits = []; let m;
    while ((m = re.exec(v))) {
      const lab = v99dkSpecLab(m[2]);
      if (!V99DK_SPECLAB.has(lab)) continue;
      hits.push({ at: m.index, valAt: m.index + m[0].length, lab: m[2].trim() });
    }
    if (!hits.length) { out.push(r); return; }
    const head = v.slice(0, hits[0].at).replace(/[\s　]+$/, "");
    if (!head.trim()) { out.push(r); return; }
    const segs = hits.map((h, i) => ({ lab: h.lab, val: v.slice(h.valAt, i + 1 < hits.length ? hits[i + 1].at : v.length).replace(/^[\s　]+|[\s　]+$/g, "") })).filter(x => x.val);
    if (!segs.length) { out.push(r); return; }
    const keep = r.slice(); keep[1] = head; out.push(keep);
    segs.forEach(sg => {
      const k = v99dkSpecLab(sg.lab);
      const same = rows.concat(out).find(x => Array.isArray(x) && x !== r && labOf(x) === k);
      if (same && String(same[1] || "").replace(/\s/g, "") === sg.val.replace(/\s/g, "")) { ch++; return; }   /* 同じ項目・同じ値の行がもうある */
      if (same) { keep[1] = keep[1] + "/" + sg.lab + ":" + sg.val; return; }                                   /* 同じ項目で値が違う：分けずに元のまま */
      const x = new Array(n).fill(""); x[0] = sg.lab; x[1] = sg.val; out.push(x); ch++;
    });
  });
  return { rows: out, ch };
}
V99DECK.specSplit = (rows) => v99dkSpecSplitRows(rows);
function v99dkSpecInto(t) {
  try {
    if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return 0;
    const X = v99dkSpecSplitRows(t.compRows);
    if (X.ch) { t.compRows = X.rows; v99dkN("specInto", X.ch); }
    return X.ch;
  } catch (e) { v99dkErr("specinto", e); return 0; }
}
if (typeof saveTen === "function") {
  const __st99 = saveTen;
  saveTen = function () {
    try {
      const t = (typeof TEN !== "undefined") ? TEN : null;
      if (t && Array.isArray(t.compRows) && t.compRows.length) {
        const j = JSON.stringify(t.compRows);
        if (/アレルゲン|アレルギー|特定原材料/.test(j)) v99dkAlInto(t);
        if (/[：:]/.test(j)) v99dkSpecInto(t);
      }
    } catch (e) { v99dkErr("save", e); }
    return __st99.apply(this, arguments);
  };
}

/* ══════════ 最終チェック：最後に効く所で（校正・載せない指示・〜フリー・区分の言葉・下書きの印） ══════════ */
if (typeof dk3Check === "function") {
  const __ck99 = dk3Check;
  dk3Check = function (deck, ctx) {
    let pre = null;
    try {
      if (deck && Array.isArray(deck.slides) && deck.lang) {
        const fx = deck.lang !== "ja";
        pre = { ng: v99dkNgDeck(deck), free: fx ? v99dkFreeDeck(deck) : { fix: [], drop: [] }, cat: fx ? v99dkCatDeck(deck) : 0, draft: fx ? v99dkDraftLang(deck) : 0, proof: fx ? v99dkProof(deck, v99dkTen()) : [] };
      }
    } catch (e) { v99dkErr("ck0", e); }
    const a = arguments, self = this;
    const r = v99dkWithJaHidden(deck, () => __ck99.apply(self, a));
    try {
      if (!r || !pre) return r;
      r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
      /* ほかの層の直しの後にもう一度（載せない指示・空白） */
      const ng2 = v99dkNgDeck(deck);
      const p2 = deck.lang !== "ja" ? v99dkProof(deck, v99dkTen()) : [];
      const proof = pre.proof.concat(p2);
      const ngN = pre.ng.fix + pre.ng.drop + ng2.fix + ng2.drop;
      if (pre.ng.terms.length) {
        if (ng2.left.length) r.crit.push({ k: "v99ng", t: "利用者が「資料に載せない」とした言葉・数値（" + [...new Set(ng2.left.map(x => x.ng))].join("・") + "）が " + [...new Set(ng2.left.map(x => x.si))].join("・") + "枚目に残っています" });
        else r.ok.push("資料に載せない（利用者の指示）：" + pre.ng.terms.join("・") + " — 資料のどこにも載せていません" + (ngN || (DK3G && DK3G.v99ngFix && DK3G.v99ngFix.length) ? "（文章から外した・直した所 " + (ngN + ((DK3G && DK3G.v99ngFix) || []).length) + "か所）" : ""));
      }
      if (pre.free.fix.length || pre.free.drop.length) r.ok.push("根拠に無い「〜フリー・無添加」の言い方を外しました：" + pre.free.fix.concat(pre.free.drop).slice(0, 3).map(x => x.si + "枚目「" + x.a.slice(0, 26) + "」").join("／") + "（" + [...new Set(pre.free.fix.concat(pre.free.drop).map(x => (V99DK_FREE.find(c => c.k === x.k) || {}).ja))].join("・") + "の記載が登録・資料にありません）");
      if (pre.cat) r.ok.push("区分の言葉：前の区分（医療・衛生）の言い方を、今の区分「" + String((v99dkTen() || {}).cat || "") + "」に直しました（" + pre.cat + "か所）");
      if (pre.draft) r.ok.push("下書きの印（未入力の項目など）は、資料の言語（" + ((typeof DK3_LNAME !== "undefined" && DK3_LNAME[deck.lang]) || deck.lang) + "）で入れています");
      /* 21.99.3：21.98 の層の「くっつきはありません」の行と食い違わないよう、直した所があるときは消してから足す（11/20 回帰の洗い出し） */
      if (proof.length) r.ok = r.ok.filter(x => !/^英文の校正：単語の間の空白の欠け・ラベルの重複はありません$/.test(String(x)));
      if (proof.length) r.ok.push("英文の校正（語のくっつき・句読点の後の空白）：" + proof.length + "か所を直しました（" + proof.slice(0, 3).map(x => x.si + "枚目「" + x.to + "」").join("／") + "）");
      /* 下書きの文（外国語の資料）：資料の中の印の言い方に合わせる */
      if (deck.lang !== "ja" && deck.v54draft) r.crit = r.crit.map(c => (c && c.k === "v54draft" && V99DK_CRIT_RE.test(String(c.t))) ? Object.assign({}, c, { t: String(c.t).replace(V99DK_CRIT_RE, "資料の中では「[" + v99dkDL(deck.lang).miss + ": …]」のように資料の言語で示しています。") }) : c);
      v99dkJaRefill();
      const jaCells = (deck.slides || []).reduce((a2, S) => a2 + (S.els || []).filter(v99dkJaCell).length, 0);
      if (jaCells) r.ok.push("INCI 表に和名（Japanese label name）の列を入れました（" + jaCells + "成分。日本語の残りの点検の対象外）");
      if (!r.crit.length) r.pass = true;
      V99DECK.last = { at: Date.now(), ng: { terms: pre.ng.terms, n: ngN, left: ng2.left.length }, free: pre.free.fix.length + pre.free.drop.length, cat: pre.cat, draft: pre.draft, proof: proof.length, jaCells };
    } catch (e) { v99dkErr("ck", e); }
    return r;
  };
}
/* 保存した資料を開いたとき：空白・区分の言葉・載せない指示 */
if (typeof dk14Open === "function") {
  const __op99 = dk14Open;
  dk14Open = async function (id) {
    const r = await __op99.apply(this, arguments);
    try { if (typeof DK3G !== "undefined" && DK3G && DK3G.deck && !DK3G.run && DK3G.deck.lang && DK3G.deck.lang !== "ja") { v99dkProof(DK3G.deck, v99dkTen()); v99dkCatDeck(DK3G.deck); v99dkNgDeck(DK3G.deck); v99dkDraftLang(DK3G.deck); } } catch (e) { v99dkErr("open", e); }
    return r;
  };
}

/* ══════════ 画面：載せない指示の欄・スライドの文章（全文）・和名の列 ══════════ */
function v99dkDroppedNow() {
  try { const T = v99dkTen() || v99dkCur(); const lang = (typeof DK3G !== "undefined" && DK3G && (DK3G.lang || (DK3G.deck && DK3G.deck.lang))) || "en"; const E = T && T.deck3 && T.deck3.plans && T.deck3.plans[lang]; return ((E && E.dropped) || []).filter(d => d && d.txt && !d.v99ng); } catch (e) { return []; }
}
function v99dkTermOf(txt) {
  const s = String(txt || "");
  const ns = v99dkNums(s, "en").filter(n => n.k !== "n" && n.k !== "thing");
  if (ns.length) return [...new Set(ns.map(n => { const raw = String(n.raw || "").trim(); const i = s.indexOf(raw); const m = i >= 0 ? s.slice(i).match(/^\d[\d.,]*\s*(?:[A-Za-z%°µμ㎜㎏㎖]+(?:\/[A-Za-z]+)?)?/) : null; return (m ? m[0] : raw).trim(); }).filter(Boolean))];
  const cons = v99dkConOf(s).map(c => c.ja || c.k);
  if (cons.length) return cons;
  return [s.replace(/\*\*/g, "").trim().slice(0, 60)];
}
function v99dkNgHtml() {
  const T = v99dkCur();
  if (!T) return "";
  const L = v99dkNgList(T), D = v99dkDroppedNow().slice(0, 12);
  const has = (t) => L.some(x => v99dkNF(x.t).toLowerCase() === v99dkNF(t).toLowerCase());
  return `<div class="c v99dk-ng" id="v99dkng" data-v99dkng="${L.length}" data-noi18n="1"><h3>🚫 ${v99dkE(v99dkM("資料に載せない言葉・数値（あなたの指示）", "Words and figures to leave out of the deck (your instruction)", "不放入资料的词语・数值（您的指示）", "Palabras y cifras que no deben aparecer (su instrucción)"))}</h3>
<p class="nn">${v99dkE(v99dkM("ここに入れた言葉・数値は、登録の値どおりでも、表紙の強み欄・数字のカード・説明・表・ノート・1枚の紹介シートのどこにも載せません（例：0.8 mm/s・180日・業界最高）。入れたあと「↻ もう一度作る」を押すと、文章から作り直します（いまの資料からはすぐ外します）。", "Anything listed here is left out everywhere — cover strengths, number cards, text, tables, notes and the one-page sheet — even if it matches your registered data (e.g. 0.8 mm/s, 180 days, industry-leading). Press \"↻ Create again\" to rewrite the text (it is removed from the current deck right away).", "此处填写的词语・数值，即使与登记值一致，也不会出现在封面优势栏・数字卡片・说明・表格・备注・单页简介的任何地方（例：0.8 mm/s・180天・业界最高）。填写后点击“↻ 重新制作”会重写文案（当前资料会立即去除）。", "Lo que añada aquí no aparecerá en ninguna parte (portada, tarjetas de cifras, textos, tablas, notas ni la ficha de una página), aunque coincida con sus datos (p. ej. 0.8 mm/s, 180 días). Pulse «↻ Crear de nuevo» para reescribir el texto."))}</p>
<div class="rw v99dk-ngadd"><label for="v99dkngin" class="nn">${v99dkE(v99dkM("載せない言葉・数値", "Word or figure to leave out", "不放入的词语・数值", "Palabra o cifra a excluir"))}</label><input id="v99dkngin" type="text" maxlength="80" placeholder="${v99dkE(v99dkM("例：0.8 mm/s", "e.g. 0.8 mm/s", "例：0.8 mm/s", "p. ej. 0.8 mm/s"))}"><button type="button" class="btn" data-v99dkngadd="1">${v99dkE(v99dkM("載せない", "Leave out", "不放入", "Excluir"))}</button></div>
<div class="v99dk-nglist" role="list">${L.length ? L.map((x, i) => `<span class="v99dk-chip" role="listitem">${v99dkE(x.t)} <button type="button" class="v99dk-x" data-v99dkngdel="${i}" aria-label="${v99dkE(v99dkM("「" + x.t + "」を外す（載せてよい）", "Remove \"" + x.t + "\" (allow it again)", "移除「" + x.t + "」", "Quitar «" + x.t + "»"))}">×</button></span>`).join("") : `<span class="nn">${v99dkE(v99dkM("いまは指示はありません。", "No instructions yet.", "目前没有指示。", "Sin instrucciones por ahora."))}</span>`}</div>
${D.length ? `<details class="v99dk-ngdrop"${D.length ? " open" : ""}><summary>${v99dkE(v99dkM(`AI が根拠を確かめて外した文言（${D.length}件）から選ぶ`, `Pick from the ${D.length} statement(s) the AI removed after checking the evidence`, `从 AI 核对后去除的 ${D.length} 条文案中选择`, `Elegir entre las ${D.length} frases que la IA quitó`))}</summary><ul>${D.map((d, i) => { const terms = v99dkTermOf(d.txt); const done = terms.every(has); return `<li><span class="v99dk-dtx">${v99dkE(String(d.txt).replace(/\*\*/g, "").slice(0, 120))}</span> <span class="nn">${v99dkE(String(d.why || "").slice(0, 80))}</span> ${done ? `<span class="p hi">${v99dkE(v99dkM("載せない指示に入っています", "In your leave-out list", "已在不放入列表中", "En su lista de exclusión"))}</span>` : `<button type="button" class="btn g" data-v99dkngpick="${i}">${v99dkE(v99dkM("資料に入れない（" + terms.join("・") + " も外す）", "Leave out (" + terms.join(", ") + " too)", "不放入（" + terms.join("・") + " 也去除）", "Excluir (" + terms.join(", ") + " también)"))}</button>`}</li>`; }).join("")}</ul></details>` : ""}
</div>`;
}
function v99dkJaColHtml() {
  const T = v99dkCur();
  if (!T) return "";
  let k = "";
  try { k = (typeof V85DK !== "undefined" && V85DK.cat) ? V85DK.cat(T).k : ""; } catch (e) { }
  const prods = (typeof dk3Prods === "function") ? dk3Prods(T) : [T];
  if (!(k === "cosmetics" || k === "cosmetic_ingredient" || /cosme/.test(String(T.catKey || ""))) || !(prods || []).some(v99dkInciRows)) return "";
  const on = v99dkJaColOn(T);
  return `<div class="c v99dk-jacol" data-noi18n="1"><label class="rw" style="gap:8px;align-items:center"><input type="checkbox" data-v99dkjacol="1"${on ? " checked" : ""}> <b>${v99dkE(v99dkM("外国語の資料の INCI 表に、和名（表示名称）の列を入れる", "Add a Japanese label name column to the INCI table in foreign-language decks", "在外语资料的 INCI 表中加入日文标示名称列", "Añadir la columna del nombre japonés a la tabla INCI"))}</b></label><p class="nn">${v99dkE(v99dkM("化粧品の資料では、日本で表示している名称（和名）と INCI 名を並べると、バイヤーが日本のパッケージと照らし合わせられます（既定：入れる）。和名が登録されていない成分は「—」です。", "For cosmetics, listing the Japanese label name next to the INCI name lets buyers match the Japanese package (default: on). Ingredients without a registered Japanese name show \"—\".", "化妆品资料中，日文标示名称与 INCI 名并列，买家可与日本包装对照（默认：显示）。未登记日文名称的成分显示“—”。", "En cosméticos, mostrar el nombre japonés junto al INCI permite cotejar el envase japonés (por defecto: sí)."))}</p></div>`;
}
if (typeof vDeck === "function") {
  const __vd99 = vDeck;
  vDeck = function () {
    let h = __vd99.apply(this, arguments);
    try {
      h = String(h);
      if (typeof TEN === "undefined" || !TEN) return h;
      const ng = h.indexOf("data-v99dkng") < 0 ? v99dkNgHtml() + v99dkJaColHtml() : "";
      if (ng) {
        let i = h.indexOf('<div class="c" id="dk3res1"');
        if (i < 0) { const j = h.indexOf("data-dk3lang"); if (j > 0) i = h.lastIndexOf('<div class="c"', j); }
        h = i > 0 ? h.slice(0, i) + ng + h.slice(i) : h + ng;
      }
      const deck = typeof DK3G !== "undefined" && DK3G && DK3G.deck;
      if (deck && !DK3G.run && h.indexOf("data-v99dkfull") < 0) {
        const pv = '<div id="dk3pv" class="dk3-pvh" data-noi18n="1"></div>';
        const k = h.indexOf(pv);
        const full = v99dkFullHtml(deck);
        h = k >= 0 ? h.slice(0, k + pv.length) + full + h.slice(k + pv.length) : h + full;
      }
    } catch (e) { v99dkErr("vdeck", e); }
    return h;
  };
}
function v99dkNgSave(T, L) {
  T.v99dkNg = L;
  try { if (typeof saveTen === "function") saveTen(); } catch (e) { }
  try { if (typeof logU === "function") logU("deck", "営業資料：載せない言葉・数値＝" + (L.map(x => x.t).join("・") || "なし")); } catch (e) { }
  /* いまの資料からすぐ外す（作り直しは「↻ もう一度作る」） */
  try {
    if (typeof DK3G !== "undefined" && DK3G && DK3G.deck && !DK3G.run) {
      const o = v99dkNgDeck(DK3G.deck);
      if (DK3G.check) { const T2 = DK3G.check; T2.ok = (T2.ok || []).filter(x => !/^資料に載せない（利用者の指示）/.test(String(x))); if (o.terms.length) T2.ok.push("資料に載せない（利用者の指示）：" + o.terms.join("・") + " — いまの資料から外しました（" + (o.fix + o.drop) + "か所）。文章から作り直すときは「↻ もう一度作る」"); }
    }
  } catch (e) { v99dkErr("ngnow", e); }
  try { if (typeof RDX !== "undefined" && RDX && RDX.curKey && RDX.curKey() === "deck") RDX.goKey("deck"); else if (typeof render === "function") render(); } catch (e) { }
}
document.addEventListener("click", e => {
  try {
    const t = e.target;
    if (!t || !t.closest) return;
    const add = t.closest("[data-v99dkngadd]"), del = t.closest("[data-v99dkngdel]"), pick = t.closest("[data-v99dkngpick]");
    if (!add && !del && !pick) return;
    e.preventDefault(); e.stopPropagation();
    const T = v99dkCur(); if (!T) return;
    const L = v99dkNgList(T).slice();
    const push = (s) => { s = String(s || "").trim().slice(0, 80); if (s && !L.some(x => v99dkNF(x.t).toLowerCase() === v99dkNF(s).toLowerCase())) L.push({ t: s, at: new Date().toISOString() }); };
    if (add) { const inp = document.getElementById("v99dkngin"); const v = inp ? inp.value : ""; if (!String(v).trim()) { if (typeof toast === "function") toast(v99dkM("載せない言葉・数値を入れてください", "Enter a word or figure to leave out", "请输入不放入的词语・数值", "Escriba una palabra o cifra")); return; } String(v).split(/[、，]\s*|,\s*(?=\D)|\s+[／\/]\s+|(?<![A-Za-z㎜㎏µμ])／|／(?![A-Za-z])|\n/).map(x => String(x || "").trim()).filter(x => x && !/^[A-Za-z]$/.test(x)).forEach(push); /* 11/20：単位の中の「/」（0.8 mm/s・km/h）では分けない。1文字だけの語は指示にしない */ }
    if (pick) { const d = v99dkDroppedNow()[+pick.getAttribute("data-v99dkngpick")]; if (d) v99dkTermOf(d.txt).forEach(push); }
    if (del) { const i = +del.getAttribute("data-v99dkngdel"); if (i >= 0 && i < L.length) L.splice(i, 1); }
    v99dkNgSave(T, L);
    if (typeof toast === "function") toast(v99dkM("載せない言葉・数値：" + (L.map(x => x.t).join("・") || "なし") + "（いまの資料から外しました。文章から作り直すときは「↻ もう一度作る」）", "Leave-out list: " + (L.map(x => x.t).join(", ") || "none") + " (removed from the current deck; press \"↻ Create again\" to rewrite)", "不放入：" + (L.map(x => x.t).join("・") || "无"), "Exclusiones: " + (L.map(x => x.t).join(", ") || "ninguna")));
    v99dkN("ngUi");
  } catch (x) { v99dkErr("ngclick", x); }
}, true);
document.addEventListener("keydown", e => {
  try { if (e.key === "Enter" && e.target && e.target.id === "v99dkngin") { e.preventDefault(); const b = document.querySelector("[data-v99dkngadd]"); if (b) b.click(); } } catch (x) { }
}, true);
/* 画面の訳（最終チェックの新しい行・英中西） */
try {
  if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
    [
      { re: /^資料に載せない（利用者の指示）：(.+?) — 資料のどこにも載せていません(?:（文章から外した・直した所 (\d+)か所）)?$/, en: (m) => "Left out at your instruction: " + m[1] + " — not shown anywhere in the deck" + (m[2] ? " (" + m[2] + " place(s) removed or rewritten)" : ""), zh: (m) => "按您的指示不放入：" + m[1] + " — 资料中任何地方都没有" + (m[2] ? "（去除・改写 " + m[2] + " 处）" : ""), es: (m) => "Excluido por su instrucción: " + m[1] + " — no aparece en la presentación" + (m[2] ? " (" + m[2] + " lugar(es))" : "") },
      { re: /^利用者が「資料に載せない」とした言葉・数値（(.+)）が (.+)枚目に残っています$/, en: "The words/figures you asked to leave out ($1) remain on slide(s) $2", zh: "您要求不放入的词语・数值（$1）仍在第 $2 页", es: "Las palabras/cifras que pidió excluir ($1) siguen en la(s) diapositiva(s) $2" },
      { re: /^根拠に無い「〜フリー・無添加」の言い方を外しました：(.+)（(.+)の記載が登録・資料にありません）$/, en: "Removed unsupported \"free-from / additive-free\" wording: $1 (no record of $2 in your registration or files)", zh: "已去除无依据的“无添加・不含～”说法：$1（登记・资料中没有$2的记载）", es: "Se quitó la expresión «sin aditivos / libre de» sin respaldo: $1 (no consta $2 en sus datos)" },
      { re: /^区分の言葉：前の区分（医療・衛生）の言い方を、今の区分「(.+)」に直しました（(\d+)か所）$/, en: "Category wording: wording from the previous category (medical & hygiene) was changed to the current category \"$1\" ($2 place(s))", zh: "类别用语：已将旧类别（医疗・卫生）的说法改为当前类别“$1”（$2 处）", es: "Categoría: el texto de la categoría anterior (médica e higiene) se cambió a la actual «$1» ($2 lugar(es))" },
      { re: /^下書きの印（未入力の項目など）は、資料の言語（(.+)）で入れています$/, en: "Draft marks (missing items, etc.) are written in the deck's language ($1)", zh: "草稿标记（未填写的项目等）以资料的语言（$1）标出", es: "Las marcas de borrador (elementos que faltan, etc.) están en el idioma de la presentación ($1)" },
      { re: /^英文の校正（語のくっつき・句読点の後の空白）：(\d+)か所を直しました（(.+)）$/, en: "English proofreading (words run together, missing space after punctuation): fixed $1 place(s) ($2)", zh: "英文校对（单词粘连・标点后缺空格）：已修正 $1 处（$2）", es: "Corrección del inglés (palabras unidas, espacio tras la puntuación): $1 corrección(es) ($2)" },
      { re: /^INCI 表に和名（Japanese label name）の列を入れました（(\d+)成分。日本語の残りの点検の対象外）$/, en: "Added a Japanese label name column to the INCI table ($1 ingredients; excluded from the leftover-Japanese check)", zh: "已在 INCI 表中加入日文名称列（$1 种成分；不计入日文残留检查）", es: "Se añadió la columna del nombre japonés a la tabla INCI ($1 ingredientes)" },
      { re: /^資料に載せない（利用者の指示）：(.+?) — いまの資料から外しました（(\d+)か所）。文章から作り直すときは「↻ もう一度作る」$/, en: "Left out at your instruction: $1 — removed from the current deck ($2 place(s)). Press \"↻ Create again\" to rewrite the text", zh: "按您的指示不放入：$1 — 已从当前资料去除（$2 处）。重写文案请点击“↻ 重新制作”", es: "Excluido por su instrucción: $1 — quitado de la presentación actual ($2). Pulse «↻ Crear de nuevo» para reescribir" }
    ].reverse().forEach(p => I18N.pat.unshift(p));
  }
} catch (e) { v99dkErr("i18n", e); }

/* ══════════ 11/20 まとめ役（本番の実操作で見つけた残り）：ヒアリングの AI の読み取りが答えの一部を落とす ══════════
   本番では、ヒアリングの答えを AI が「この項目に登録する値」に整える段（llmFillTriage）で、C の材質表の答え
   「材質：軸受鋼 SUJ2／内径：20mm／外径：47mm／幅：14mm」から内径・外径・幅を落とし「材質：軸受鋼 SUJ2」だけを返した
   （手元の模擬の AI では起きない経路。利用者が答えた数値が黙って消え、英語資料の仕様の表にも出なかった）。
   成分表・材質表・寸法・強みの問いでは、利用者が打った数値・「項目：値」が AI の値から消えたら、打ったとおりの答えで登録する
   （表への分け方はアプリの読み取り〈v68 の材質表・上の「1つの値に2つの項目」の分け方〉に任せる。AI の回数は増やさない）。 */
if (typeof llmFillTriage === "function") {
  const __ft99 = llmFillTriage;
  llmFillTriage = async function (cu, v) { // eslint-disable-line no-global-assign
    const j = await __ft99.apply(this, arguments);
    try {
      const k = cu && cu.k;
      if (j && j.kind === "answer" && /^(compRows|dimRows|strengths)$/.test(String(k || ""))) {
        const raw = String(v == null ? "" : v).trim();
        const val = String(j.value == null ? "" : j.value);
        const N = (s) => v99dkNF(String(s || ""));
        const nums = (s) => (N(s).match(/\d+(?:\.\d+)?/g) || []);
        const labs = (s) => (N(s).match(/(?:^|[\/／、，,\n　\s])([^\/／、，,\n　\s：:0-9]{1,12})\s*[：:]/g) || []).map(x => x.replace(/^[\/／、，,\n　\s]/, "").replace(/\s*[：:]$/, "").trim()).filter(Boolean);
        const vn = nums(val), vl = labs(val);
        const lostN = nums(raw).filter(n => vn.indexOf(n) < 0);
        const lostL = labs(raw).filter(l => vl.indexOf(l) < 0);
        if (raw && val && (lostN.length || lostL.length)) {
          j.value = raw;
          V99DECK.triageRaw = { k, lostN: lostN.slice(0, 8), lostL: lostL.slice(0, 8), at: Date.now() };
          v99dkN("triageRaw");
        }
      }
    } catch (e) { v99dkErr("triage99", e); }
    return j;
  };
}

/* ══════════ 11/20 まとめ役（本番の実操作で見つけた残り）：原材料のページ（WHAT'S INSIDE）に項目名が並ぶ ══════════
   原材料のページは、成分表の行の「名前」（1列目）をチップ・「KEY INGREDIENT」に出す作り（値が16字を超えると名前だけ）。
   21.99 で成分表の原材料を1行（Ingredients｜organic soybeans…, salt）にまとめたため、本番の A では
   「KEY INGREDIENT：Ingredients」「Ingredients」「Ingredients」「Allergens」と項目名が並んだ
   （21.98 の UAT の「p6 に Allergen が3回」と同じ所）。原材料・アレルゲンのような「項目名の行」は、値の中の1つ1つ（有機大豆・有機米・食塩）を出す。 */
const V99DK_INGLAB = /^(?:ingredients?|ingredient list|raw materials?|composition|contents|原材料名?|成分|全成分|配料表?|配料|成分表|ingredientes|ingrédients|zutaten|성분|원재료명?)$/i;
const V99DK_ALGLAB = /^(?:allergens?|allergen information|allergy information|アレルゲン|アレルギー|特定原材料|过敏原|過敏原|alérgenos?|allergènes|allergene|알레르기)$/i;
function v99dkTopSplit(v) {
  const out = []; let c = "", d = 0;
  for (const ch of String(v || "")) {
    if ("（(［[".includes(ch)) d++; else if ("）)］]".includes(ch)) d = Math.max(0, d - 1);
    if (d === 0 && ",、，;；".includes(ch)) { out.push(c); c = ""; continue; }
    c += ch;
  }
  out.push(c);
  return out.map(x => x.replace(/^\s*(?:and|und|y|et|及び|および)\s+/i, "").trim()).filter(Boolean);
}
function v99dkIngrItems(lab, val) {
  let v = String(val || "").split(/\s+·\s+/)[0];                         /* 「値 · 備考」の備考は外す */
  if (V99DK_ALGLAB.test(lab)) v = v.replace(/\s*[（(][^）)]*[）)]/g, "");  /* アレルゲンの注意書き（工場の…）はチップに入れない */
  let items = v99dkTopSplit(v).map(x => x.replace(/\.$/, "").trim());
  items = items.map(x => (x.length > 30 ? x.replace(/\s*[（(][^）)]*[）)]/g, "").trim() : x)).filter(Boolean);
  items = items.map(x => (/^[a-z]/.test(x) ? x[0].toUpperCase() + x.slice(1) : x));
  return [...new Set(items)].slice(0, 12);
}
function v99dkIngrFix(M, data) {
  let ch = 0;
  try {
    const ing = M && M.ingr; if (!ing) return 0;
    const pd = (data && Array.isArray(data.prods) && data.prods[0]) || {};
    const rows = ((pd.comp && pd.comp.rows) || []).filter(Array.isArray);
    const rowOf = (lab) => rows.find(r => String(r[0] == null ? "" : r[0]).trim().toLowerCase() === String(lab == null ? "" : lab).trim().toLowerCase());
    const expand = (x) => { const s = String(x == null ? "" : x).trim(); if (!(V99DK_INGLAB.test(s) || V99DK_ALGLAB.test(s))) return null; const r = rowOf(s); if (!r) return null; const it = v99dkIngrItems(s, r.slice(1).filter(Boolean).join(" · ")); return it.length ? it : null; };
    /* 区分のチップ */
    (ing.groups || []).forEach(g => {
      if (!g || !Array.isArray(g.items)) return;
      const nx = [];
      g.items.forEach(x => { const e = expand(x); if (e) { e.forEach(y => { if (nx.indexOf(y) < 0) nx.push(y); }); ch++; } else if (nx.indexOf(x) < 0) nx.push(x); });
      g.items = nx;
    });
    /* 同じ名前の区分は1つに */
    const gs = [];
    (ing.groups || []).forEach(g => { if (!g) return; const k = String(g.name || "").trim().toLowerCase(); const o = gs.find(x => String(x.name || "").trim().toLowerCase() === k); if (o) { (g.items || []).forEach(y => { if (o.items.indexOf(y) < 0) o.items.push(y); }); ch++; } else gs.push(g); });
    ing.groups = gs;
    /* KEY INGREDIENT が項目名なら、最初の原材料に */
    if (ing.hero && V99DK_INGLAB.test(String(ing.hero.name || "").trim())) { const e = expand(ing.hero.name); if (e && e[0]) { ing.hero.name = e[0]; ing.hero.v = ""; ing.hero.u = ""; ch++; } }
    if (ch) v99dkN("ingrFix", ch);
  } catch (e) { v99dkErr("ingrfix", e); }
  return ch;
}
V99DECK.ingrFix = v99dkIngrFix;
if (typeof dk3Model === "function") {
  const __dm99i = dk3Model;
  dk3Model = function (lang0, plan, data, ph, deck, src, T) {
    const M = __dm99i.apply(this, arguments);
    try { v99dkIngrFix(M, data); } catch (e) { v99dkErr("model-ingr", e); }
    return M;
  };
}


/* ══════════ 11/20 まとめ役（本番の実操作で見つけた残り）：英文の校正が正しい英単語を2つに分ける ══════════
   本番の A の英語資料で「distinct ion」「Straight forward」を見つけた。くっついた語を分ける校正（21.86 の辞書の分け方と 21.99 で強めた分け方）は、
   画面の英訳から作る語彙に無い英単語を「2つの語がくっついたもの」とみなして分けていた（outstanding → out standing・understand → under stand・
   throughout → through out・performed → per formed など）。アプリの中の英文から集めた英単語（7755語）とよく使う複合語を語彙に足し、本物の英単語は分けない。
   くっついた語（organicsoy・forkitchens・woodpuzzle・therepair）は今まで通り分ける。 */
const V99DK_ENW = new Set("droplet droplets lipstick lipsticks takeaway takeaways bodywash mouthwash abajo abgelaufen abierta abiertas abierto abogado abolished aborda about above abren abres abreviatura abriendo abrieron abrir abrirla abrirlas abrirlo abrirlos abrirse abroad absenden absolute absorb acaba acaban accedemos accept acceptable acceptance acceptances accepted accepting accepts accesible accesibles acceso accesos access accesses accessible accession accessories accessory accident accidente accionables acciones accompany accordance according account accounting accounts accredited accumulate accumulated accumulating accuracy accurate accurately aceite aceites acepta aceptada aceptados aceptan aceptar aceptarlo aceptaron acepte acerca acercan acerque acheteurs achievement achievements acidez acidified acids acknowledging aclara aclaran acode acondicionador acordada acordadas acordado acordados acordarlos acortar acreditados acreditan acreditar acrediten across actas action actionable actions activa activada activadas activado activar activarlo activaron activas active actives actividad actividades activities activity actual actuales actualice actualiza actualizaciones actualizado actualizados actualizan actualizar actualizaron actually actualmente acuerda acuerde acuerdo acuerdos acumulado acumulados acumulan acumular adalah adapt adapta adaptado adaptados adaptan added adding addition additional additions additive additives address addresses adecuada adecuados adelantado adhesives adicional adicionales aditivos adivinar adjuntar adjunte adjunto adjuntos adjust adjusted admin administrador administradores administration administrator administrators admins admita admite admiten admitidos adopt adoptados adoptar adopted adoption aduana aduanas aduanera aduaneras aduanero advance advanced advances advertencia advertising advice advise advisor aerobic aeropuerto aerosol afecta afectado affairs affected affects affordable afinan afinando afinar afirma afirmaciones africa african after afterward afterwards again against agencia agency agendar agent agente agentes agents aggregate aggregated aggregates agiliza agotado agree agreed agreement agreements agregada agregado agregados agregaron agregarse agricultura agricultural agriculture agrupa agrupan agrupar ahead ahora aiming aimob airline airlines airport airports airtight aisladamente aistudio ajusta ajustado ajustar ajustarse ajuste ajustes alaska alcance alcanza alcanzable alcanzado alcanzarlo alcanzaron alcohol alcoholic alemania alergias alert alerta alertas alerts algas alguna algunas algunos alibaba aliexpress align aligned alimenta alimentaria alimentarias alimentario alimenticia alimenticias alimenticios alimento alimentos alinear alinearlos alinearon alinee allergens allergies allgemeine allow allowed allows alloy almacenamiento almacenes almost alone along alongside already alrededor alternativa alternativas alternative alternatives although altura aluminium aluminum always amarilla amarillo amazon ambas ambient ambientales ambiente ambos amended amending amendment amendments amenidades america american amino among amount amounts ampliada ampliadas ampliar ampliarlas ampliarlo amplifier amsterdam analizan analizar analyse analysed analyses analysis analytics analyze analyzed analyzing ancha ancho anchor andrew anexa anexo anexos anfordern anforderungen anfrage anfragenden angaben angebot angebote angebots angeles angepasste anggaran angle angles animal animales animals annex annexes annotated announced announcement anonimizada anonimizados anonymisation anonymised anonymized anonymous anonymously anota anotado anotar anote another answer answered answering answers antemano anterior anteriores anteriormente antes anthropic antibacterial antibiotics anticipada anticipadas anticipado antigua antiguas antiguo antiguos antwort antworten antwortfrist anuales anula anunciados anuncio anyone anything anytime anyway anywhere anzahl aomori aparatos aparece aparecen apareciendo apariciones apart aparte apertura aphis aplica aplicable aplicado aplican aplicar aplicaron aplicarse apliquen aporta apoya apoyo apparatus apparel appeal appear appearance appears appended appliances applicable applicant application applications applied applies apply applying appointed appreciate approach approaches approval approvals approve approved approver approves approving approx aprenda aprende aprenden aprender aprendido aprendidos aprendizaje april aprobaciones aprobada aprobado aprobador aprobados aprobar aprobarla aprobarlo aprobarlos aprobarse aprox aproximada aproximadamente aprueba apruebe aprueben apunte aquatic arabia arabic arancel arancelario aranceles arbeiten archives archivo archivos areas argentina arise armas armonizado aroma around arranca arrange arranged arrangement arrangements arranges arrastra arrastrar arrastrarlos arrastre array arriba arrival arrive arrived arrives arriving arroz article articles artificial artificiales asdfgh asdfghjkl aseguradora asesor asian aside asignaciones asignado asignados asignar asignarse asigne asignen asistente askai asked askfab asking asocian aspecto aspectos aspects aspira assessed assessment assessor asset assign assigned assignee assignments assistant assistants assume assumed assumes assumption assumptions assurance assurez asume asunto asuntos atacar ataques atender atendido atienda atiende atienden atlantic atraen attach attached attachment attachments atteint attempt attempts attention attestation attorney attributes auckland auction auctions audio aumenta aumentar aunque ausland australia australian austria autant autenticado authentic authenticated authentication author authoritative authorities authority authorization authorizes autocompletado autodeclaraciones autofill automated automatic automatically automations automatizaciones automobile automobiles automotive autoparte autor autorice autoridad autoridades autoriza autorizado availability available avance avanza avanzar avanzaron average avisa avisado avisamos avisan avisando avisaremos avise aviso avisos avoid avoided await awaiting award awarded awards awareness ayuda backbone backed background backup bacteria badge bahan bahas bahrain bajan bajas balas balms bamboo bancaria banco bancos banda banded bandeja bands bangkok bankofengland banks banned banner banxico barata barato barcelona barco barra basada basadas basado basados basan basar basculantes baseball based basel baseline bases basic basics basilea basis basketwork basta batch batman batteries battery beantworten bearing bears beauty beber bebidas became because become becomes becoming bedarf bedding before began begin beginning begun behalf behind beijing being bekerja belarus belgium believe belleza belong belonged belongs below beneficiario beneficiary benefit benefits bereits beritahu berlin berserta beserta besides besprechen bestellung bestimmungsort better between beverage beverages beware beyond biasanya bielorrusia bienes biennial biggest biglobe bilateral billing billion bincang binding biocide biodegradable bitte black blades blanca blanco blank blanks blend blended block blocked blockers blocking blocks blogspot blood bloque bloquea bloqueada bloqueadas bloqueado bloquean bloquear bloqueo bluefin blurry bnine board bodies boeki boekicloud bolas bolsas bonded bonjour booking bookings bookmark bookshelf booth borde border bordo boring borne borra borrado borrador borradores borran borrar borrarla borrarlo borre borrosas boston botanical botellas botones bottle bottled bottles bottling bottom boueki bouekicloud bouillon bovine boxes bpjph brackets branch brand brands brazil break breakdown breakfast breaks breakthrough breathable breve brevemente breves brewed brewery briefly bright brighter bring bringing brings brisbane britain british broader broker broths brought brouillon browser browsers brush brussels bruta brute bruto buchung budget buena build building builds built bulbs bulletproof bulto bultos bundle buque buques burden bureau buried burners busan busca buscando buscar business businesses busque buster butiran butsuryu button buttons buyer buyers bytes caballo caben cabra cache cadena cadenas caduca caducadas caducado caducidad cajas cakes calcula calculada calculado calculamos calculan calcular calcularla calculate calculated calculates calculation caldo calendar calendario calendrier calidad caliente california called calligraphy calling calls calor cambia cambiada cambiado cambian cambiar cambiarla cambiarlas cambiarlo cambiaron cambie cambio cambios camera camino campana campo campos canada canadian canadians canal canales canaux cancelar cancellation cancelled cancer candidatas candidate candidates candidato candidatos cando cannot cantidad cantidades canvas capabilities capable capacidad capacity capsules captados capturar capturas capture caracteres carbon cardboard cards careful carefully carga cargado cargador cargadores cargados cargan cargando cargar cargas cargo cargos carne carpeta carpetas carretera carriage carried carrier carry carrying carta carton cartons cases casilla casillas casos catalog catalogs catalogue catch categories category catheters causas cause causes cautions celdas cells cellular cement centavos center centra centrado centrair central centralbank centralizada centrally centre centro cerca cercana cereales cerradas cerrados cerrar cerrarlo cerrarlos certain certifica certificaciones certificada certificado certificados certificat certificate certificates certification certifications certificats certified certifies certify cette chain chains challenged chamber chambers championship champs change changed changer changers changes changing channel channels chapter chapters character characters charge chargeable charged charger charges charlie chars chart charts chassis chats chatting cheaper cheapest check checkboxes checked checking checklist checks chemical chemicals chewed chiba chicago chief children chile chili chill chilled china chinese chino chips chitose chocan choice choices choisissent choking choose chooses choosing chose chosen chronic chubu chusho cibles ciencias cierra cierran cierre cierres ciertos cifra cifrada cifradas cifrado cifrados cifran cifrar cifras cilindrada cinco circuit circuits circular citas cites citizenship citrus ciudad claim claims clamp clara claridad clase clases clash clasifica clasificado clasifican clasificando clasificarse class classes classification classifications classified claude clause clauses clave claves clean cleaned cleaning cleans cleanser cleansers clear clearance cleared clearing clearly clears click client cliente clientes clients clinic clinical clockwise close closed closers closes closest closing clothing cloud cmeta coast coated cobra cobran cobrar cobro cobros coche coches cocinar codes coffee coherencia coherente coherentes coincida coincide coinciden coincidencia coincidente coincidir colis colisage collapsed collect collected collecting collection coloca colocada colocan colocar colocaron colocarse color colores colors colour colourings column columna columnas columns comas combina combinado combinan combinar combinarlas combination combine combined combines combustibilidad combustible comentario comentarios comercial comerciales comercio comes comestibles comfortable coming commande commas commencez comment comments commerce commercial commission commitments committee commodities commodity common commonly commons communication communications community companies company compara comparado comparan comparar compararlas compararlo compararse comparativa comparativas comparativo compare compared compares comparing comparison comparisons comparta comparte comparten compartida compartidas compartido compartidos compartir compatible compatibles competence competencia competent competente competidores competing competition competitive competitivo competitor competitors compilar compiled compiling complejas complejos complementarias complementos completa completada completadas completado completados completan completar completarla completaron completas complete completed completeness completes completing completitud completo completos complex compliance compliant complies comply componente componentes components composer composition compostable compound compounded compounds compra comprador compradora compradores compran comprar compras compraventa comprendidas compressed comprimidos comprobado comprobados comprobando comprobar comprobarlo compromiso compromisos comprueba comprueban compruebe compuestas compuesto compuestos compulsory computed computer comunes comunicado comunidad concat concept concepto concern concesionario concha concretas concrete concreto condiciones condimento condimentos condiments condition conditioners conditions conecta conectada conectado conectados conectando conectar conectarlo conectarse conecte conexiones confectionery conference confianza confidence confident configura configurable configurada configurado configurar configure confirm confirma confirmaciones confirmadas confirmado confirmados confirmamos confirman confirmar confirmarlo confirmarlos confirmarse confirmation confirmations confirme confirmed confirmes confirmez confirming conflict conflicts conformance conforme conformidad conformity confundir congestion congratulations conjunto conjuntos connect connected connecting connection connections connects connexion conoce conocerla conocimiento conocimientos conozca conseguir consejo consejos consent consentimiento conserva conservadas conservadora conservados conservan conservante conservantes conservar conservaron conservation conservative consider considera consideran considerarse considere consignatario consignee consignment consiste consistent consola consolas console const consta constante construction construyen consulados consular consulate consulates consult consulta consultada consultamos consultan consultar consultaron consultarse consultas consultation consultations consulte consumer consumers consumidor consumo consumption contact contacta contactado contactados contactando contactar contacte contacted contacterons contactez contacting contacto contactos contacts contada contado contador contain contained container containers containing contains contar contato contenedor contener contenidas contenido contenidos content contents conteo contesta contested context contexto contiene contienen continuar continue continued continuer continues contorno contra contract contracted contracts contradice contradicen contradict contradictoria contraetiqueta contrapartes contrata contratadas contratado contrato contratos control controla controlan controles controlled controls convenga convenido convenience convenient convenio convention conventional conversa conversaciones conversando conversation conversational conversations conversion convert converted convertida convertidos convertir conveyor conviene convient convierta convierte convierten cooking cookware cooler cooperation cooperative copia copiados copiar copiaron copias copie copied copies copyright corals corea cornell corporate corporation corporativo corporativos correcciones correct correcta correctamente corrected correction corrections correctly correcto correctos corregido corregir corregirlo corregirlos correlation corren correo correos corresponda corresponde correspondencia corresponds corrige corrigen corrigieron corrija corrugado corrugated corta cortan corto cortocircuitos cosas cosecha cosmetic cosmetics costado coste costes costo costos costs coteja cotejado cotejados cotejan cotejando cotejar cotejo cotice cotiza cotizables cotizaciones cotizado cotizados cotizar cotizaron cotton could couldn count counted counterparts countertop counting countries country counts courier couriers court cover coverage covered covers craft crafted crafts craftsmanship craftsmen crane crank crates creada creadas creado creados cream creams crean creando crear crearemos crearla crearlas crearlo crearon crearse create created creates creating creation crece crecer crecimiento credit crema cremas criteria criterio criterion criterios critical cross crustaceans cruzan crypto cuadra cuadro cuadros cuales cualificada cualificado cualquier cualquiera cuando cuanto cuarentena cuatro cubierto cubre cuelgan cuenta cuentan cuentas cuero cuerpo cuestan cuidado cukai cukup cumpla cumplan cumple cumplen cumplimiento cumplir cumulative cuota cupboard currencies currency current currently curso cursor custom customer customers customs cuyas cuyos daily dairy damage damaged damit dangerous daniel danke darse dashboard dashed dashi database dataset datasheets dated datei dateien daten datenblatt dates datos dcterms deadline deadlines dealer dealers dealings deals debajo debemos deben debris december decida decide decided deciden decides decidida decidido deciding decidir decidirlo decir decision decisiones decisions decisive decks declaraciones declaran declaration declarations declare declared declares declaring decline declined decoration decree decreto decrypt decrypted dedicado dedicated deducido deducir deduct deduction dedujo deeper default defaults defective defecto defectos defects defectuosas deferred defina define defined definen definido definidos definir definition definitivamente definitivo degree dejan dejar dejaremos dejarlo dejaron delay delays delegar delegate delete deleted deletes deleting deletion deletions delhi deliver delivered delivers delivery demand demanda demande demander demandeur demandez demasiadas demasiado demoing demos demostraciones demuestra demuestren dengan denim denmark density dentada dentadas dentro deodorising departamento department departure depend depende dependen depender depending depends deploying depositada depositadas depositar deposited depth derecha derecho deregistered deregistration derivan derived desactivada desactivadas desactivado desactivados desactivar desactivarla desactivarlo desactualizados desaparecen desarrollo desbloquear descarga descargada descargan descargar descargue descarta descartados descartan descending descifran desconoce desconocida describa describe described describen describes describirse descripciones description descriptions desde desea deseada deseadas deseado desglose deshacer deshacerlo design designa designado designar designate designated designed designs desired desmaquillantes desmontaje despacha despacho despedida desplaza desplegable desplegar despliegue destaca destacado destacar destaque destinados destinasi destinatario destinatarios destination destinations destino destinos destroyed destruction destruyen desviarse detail detailed detaillierte details detallada detalladas detallado detallados detalle detalles detectados detectan detectar detected detener detenerlo detenida detenido determina determinan determinar determination determined determines determining detiene detienen detuvo developed developing development developments device devices devis devise devolver devolviendo devuelve devuelven dhabi diagrama diagramas diagrams dialog diapositiva diapositivas diarias diario diarios dibujan dibujo diccionario diciembre dictionary dientes diese diesel diferencia diferencias diferido diferir differ differed difference differences different differentiate differentiators differently differs difiere difieren difuminar digest digests digit digitalizan digitrad digits dikonfirmasi diligence diluir diluted dimension dimensiones dimensions dimmed dimos dinero dining diperlukan direcciones direct directa directamente direction directions directiva directive directives directly directo director directorios directos disable disabled disagree disahkan disappear discarded discharge disclosed discontinued discount discuss discussed discussion discussions disease diseases disesuaikan dishes dishwasher dishwasher-safe disinfectants disinfection diskusi dismantling display displayed displaying disponible disponibles disposal disposiciones dispositivo dispositivos dissolving distinct distinction distinctive distinguen distinta distintas distinto distintos distribuciones distribuida distribuidor distribuidores distribute distributed distribution distributions distributor distributors district diverted divida dividido dividing dividir divisas division divisores doble docomo document documentation documento documentos documents doesn doing dokumen dokumente dollars domain domains domestic domina dominate dominio dominios donde doraemon doses dossier dotted douane double doubt download downloaded downloads downstream downtown downward draft drafted drafting drafts dragon drawers drawing drawings drawn dressings dried drifts drill drink drinking drive driven drives droits dropbox dropdown dropped drops drugs drugstore drugstores drunk dubai dudas dukungan dummy duplicadas duplicados duplicated duplicates durability durable durante during dustproof dutiable duties dwfoot dwmob earlier early easier easily eating ebonies economic economy edaegypt edible edificio edita editable editadas editado editados editando editar editarlo editarlos edite edited editen editing edition editor edits education effect effectively effects eficacia egypt eight einen einer einfach einige either ejecuciones ejecuta ejecutar ejemplo ejemplos ejercicio ekspor eksport elabora elaborada elaboradas elaborado elaboraron elabore elapsed electric electrical electronic elegida elegido elegidos elegir elegirla elegirlos elegirse element elemento elementos elements elige eligen eligibility eligible eligieron elija elimina eliminables eliminaciones eliminadas eliminado eliminados eliminan eliminando eliminar elimine ellas ellos elsewhere email emailed emails embaladas embalaje embalajes embargo embargoes embarque embed embedded emergencia emergente emirates emisor emission emissions emita emite emitida emitidas emitido emitidos emitir emitirla emitirlo emitirse emoji emojis empaque emparejar empate empezado empezando empezar empiece empiecen empieza empiezan empleados empresa empresas emptied empty enable enabled enabling encabezado encabezados encaja encajan encajen encantado encarga encargado encargarle enchufable enchufables encima encoding encontrado encontrados encontrar encontrarlo encontraron encrypt encrypted encryption encuentra encuentran encuentre ended ending endorsement endpoint energy enfermedades enfoque enforced enforcement engine engines england english engranaje engranajes enhorabuena enjoy enlace enlaces enlarged enlarging enmarcar enmienda enmiendas enough enregistrement enregistrements enregistrer enrich enriquecer ensanchar ensayadas ensayo ensayos enseguida ensure entender entenderlo entendido enter entered entering entero entfernt entienda entier entire entirely entities entity entonces entorno entornos entra entrada entradas entradilla entran entrar entraremos entre entrega entregada entregan entregar entregue entrenar entrevista entries entrust entry entwurf enumerable envasado envasan envase envases enviada enviadas enviado enviados enviamos enviando enviar enviaremos enviarla enviarlo enviaron enviarse environment environmental environments envoi envoyer envoyons equal equally equals equipment equipo equipos equivalent equivalente equivoca erased erneut erreicht error errores errors erstellen erstellung escena escenario escriba escribe escribieron escribir escribirlo escrita escritas escrito escritos escritura esencial esenciales eslogan espacio espacios especia especial especiales especially especias especie especies especificaciones espera esperaba esperadas esperado esperan esperando esperanza esperar espere esquema essential essentials estaba estaban estable establecido establecimiento establishment estado estados estamos estancados estancamiento estancaron estar estas esterilizables esterilizados estima estimaciones estimada estimado estimados estiman estimar estimate estimated estimates estimations estime estos estrecha estrechas estricta estrictos estructuraron estudie estuvo etapa etapas etiqueta etiquetado etiquetar etiquetarse etiquetas etiquete europa europe european europeo evaluador evaluando evaluar evaluasi evaluate evaluates evaluation evasion event eventos events every everybody everyday everyone everything everywhere evidence evidencia evita evitar evitaremos evite exact exactamente exactly exacto examen example examples excavating excedentes exceed exceeded exceeding exceeds excel excepciones except exception exceptions excepto excerpts exchange exchanged excise exclude excluded excludes excluding excluidos excluir exclusiva exclusive exclusividad exclusivity exclusivo exclusivos excluye excluyen excursions executable executive exempt exempted exemption exemptions exenta exentos exhibits exige exigen exigences exigente exigido exigidos exigir exigirse exist existe existed existent existente existentes existiera existing exists expand expanded expansion expect expectations expectativas expected expects expediente experience experiencia expert expire expired expires expiry explain explained explaining explains explanation explanations explica explicaciones explicar explicit explorador explorer exponer export exporta exportaciones exportador exportadores exportan exportar exportarse exportdokumente exporte exported exporter exporters exporting exports exportteam expos exposure expresables expresadas expresarse expresarte expresiones express extend extended extends exterior exteriores externa external externas externo externos extra extract extracted extracting extraction extracto extractos extracts extrae extraen extraer extraiga extrajo extranjera extranjeras extranjero extranjeros extrayendo extremadamente eyewear ezweb fabric fabrica fabricadas fabricado fabricados fabrican fabricante fabricantes fabrics facebook facial faciales facilitar facilities facility facing factor factory facts factual factura facturado facturas facture fafbfc failed fails failure fairs falla fallidos falls false falsified falta faltaban faltan faltaron falte falten familiar family farmacia farmacias farms fases faster fastest favor favorables favorites favourable feasibility feathers feature features febrero february fecha fechas federal fedlex feedback feeding feeds fellowship feria ferias fermentado fermentation fermented ferroviario fertiliser fertilisers fertilizantes fertilizer fertilizers festlegen fetch fetched fetches fewer fiable fiables fianza fiber fibras fibre ficha fichas fiche fiches fichier fichiers ficticia ficticias ficticio ficticios fictional fictitious field fields figura figuran figure figures fijadas fijado fijados fijan fijar fijarla fijarse fijas fijos filas filed filename files filing filings filipinas filled fillets filling fills filter filtered filtering filters filtra filtrado filtrar filtro filtros final finales finalizados finalize finalized finalizing finance finanzas finding fines finish finished finishes finishing finland fireproof firma firmado firmante firmantes firmar firme firms firmware first fiscal fisheries fishery fishing fitosanitarias fitosanitario fitted fitting fittings fixed fixes fixing flagged flags flammability flammable flammables flash flavor flavored flavoring flavors flavour fledged flete fletes flight float floor flour flours flows flujo flujos flush fname focus focused folded folder folders folgenden folleto follow followed following follows fondo fonts foods foodwares foolproof football footwear force forecast foreign forest forestry forever forget forgive forgiven forgot forgotten forma formal formaldehyde forman formas format formato formatos formats formatted forme former formosa forms formula formulario formularios formulated formulation formulations fortalezas fortune forum forward forwarder forwarders forwarding fotos found founded founder founding foxmail fqpane fracciones fractions fragancias fragen fragrance fragrances frame frames franca france francesa francia francisco franco franja frankfurter frascos frase frases fraud frecuencia frecuentes freely freezer freezes freezing freight french frequency frequent frequently fresco frescos fresh freshly freshness fridge frontera frozen fruit fruta frutas fuente fuentes fuera fuerte fuertes fuerza fugas fukushima fuller fully fumigation funciona funcional funcionales funcionamiento funcionan funcionando funcionar funcione funciones function functional functions fundador fundamental fundamento funded funds funnel furnace furnaces further fusiona fusionan fusionarlos fusionaron gallery gambar gantt garantiza garbled garments gasolina gasto gastos gated gathered gathers gatos gauze gazette gears gefunden geladen geles gemini genaues genera generados general generales generalizarse generally generan generar generarlo generaron generate generated generates generation generativelanguage genere generic genetically gentle geolocation george gerente german germany geschlossen gesendet gestiona gestionan gestionar gestione getting giratorias given gives giving gladder glance glass global globales glosario glossary gmail gname goals gobierno goeic going golden goods google googleapis googlemail googleusercontent governing government gracias grades grado grain grains grande grandes grano grant granted grape grateful gratuita gratuitas great greater greatest greatly green grids groove gross ground grounding group grouped groups growing grown grows growth grupaje gstatic gtype guangzhou guarantee guaranteed guarantees guarda guardada guardadas guardado guardados guardan guardando guardar guardarla guardaron guardarse guarde guess guessed guesses guest guidance guide guidebook guideline guidelines guides guitars gunma haber haberlo haberse habilitada habilitar habitual habituales hablado hablante hablar hablas hablemos hacen hacer hacerla hacerle hacerlo hacerse hacia hacienda hakata halal hallazgos handbook handcrafted handed handheld handle handled handles handling handmade handover hands handy hanmail hanoi hantar happen happened happening happens happy harbor hardware harga harley harmful harmonized harvested hasta having hawaii hazard hazardous hazards header headers heading headings headline headquarters heads health hearing heartfelt heaters heating heavier heavily heavy heavyweight hechas hecho hechos height helaian hello helper helpful helps hereby herein herramienta herself hicieron hidden hidrocarburos hidroquinona higher highest highlights highly higiene hilos himself hiragana historia historial history hockey hojas holder holders holding holds holland honestly honey honored horaria horario horas horizontal horse hospital hospitality hotel hotels hotmail hours house household housekeeping housewares houston hover hovering however https huecos huelga hueso huevos human humidity hunter hurdle hurry husillos husks hybrid hybrids hydraulic hydride hydrocarbon hydrogen hydroquinone hygiene hygienic hygienically hyogo hyphen hyphens ialah ibaraki icloud iconos icons ideal ideally ideas identidad identifican identificar identification identified identify identifying idioma idiomas iframe ignores igual iguales igualmente ihnen ihrem ihren illustration iloveyou image imagen images immediately impedir impersonation impfood impide implica imponible impor import importa importaciones importada importadas importado importador importadora importadores importados importan importance importancia important importante importantes importar importarse importateur importe imported importer importers importes importeur importing importir imports impossible impresa imprescindible impreso imprima imprime imprimible imprimir improper improve improved improvements improves impuesto impuestos impulsados inaccesible inaccesibles inactive inactivity inbound inbox include included includes including incluidas incluido incluidos incluir incluirla inclusive incluso incluya incluye incluyen incluyeron incomplet incomplete inconsistently incorpora incorrect incorrectas incoterm incoterms increase increases incrustada incrustados incumbent incur incurred independiente index india indica indicada indicado indicamos indican indicando indicar indicarse indicated indicating indicative indique indirect individual individually indonesia indoor indoors industria industrial industriales industries industry infant infants inferior infinity inflamabilidad inflamables informar information informations informe informed informes informs infringe infringir ingesta ingestion ingin ingredient ingrediente ingredientes ingredients ingrese ingresos inherit inicia iniciada iniciadas iniciado inicial iniciales inician iniciar iniciarse inicie inicien inicio inicios initial inland inline inmediata inmediatas inmediato inner inocuidad input inputs inquiries inquiry insects insert inserta insertan insertar insertarlos inserted inside insight insignia inspeccionarse inspecciones inspected inspection inspections inspects instagram instalaciones instaladas installed instant instantaneous instante instantly instead instrucciones instructed instruction instructions instructs instruments instruye insulated insurance insurer intake integraciones integrada integradas integrado integrados intended intentos interaction interbank intercambiar intercambio interesadas intereses interest interested interesting interests interior interlineado intermediario intermedias intermediate intermedio interna internacional internacionales internal internally internas international internet interno internos interpretative interruptor interview intoxicating intro introduce introduced introducen introduces introducidas introducido introducidos introducir introducirla introducirlos introduction introductions introdujo introduzca introuvable inusuales invalid invasiva invent inventario inventory inverso invertebrates investiga investigaba investigando investigar investigation investigue investment invitaciones invitad invitadas invitado invitados invitar invitarlos invitation invitations invite invited inviting invoice invoices involved iones ireland islamic israel issuance issue issued issuer issues issuing istanbul italy items itself ivory iwate izquierda izquierdo jadwal jakarta january japan japanese japanpost japonesa japonesas japoneses jaula jeans jetro jeweiligen jewellery joignez joindre joined joining joins joint jordan journey judge judged judgement judgements judges judging judgment judgments juego juegos juguetes juice juicios jumlah jumps juntas junto jusqu justifica justify justo juzga juzgar kadar kakao kanji kansai kasih kastam katakana kecil keepalive keeping keeps keidanren keine kemasan kenia kennzeichnung kenya keperluan keselamatan ketchup keyboard keyword keywords kickoff killer kindergartens kindly kinds kingdom kirim kirimkan kitchenware kleinen knives knowing knowledge known knows kobayashi komposisi konfirmasi kongsi konnte kontaktieren kopieren korea korean kosho kouseikyoku kowloon kuala kualitas kualiti kuantiti kunden kurashiki kuwait kyoto label labeled labeling labelled labelling labels laboratories laboratorio laboratorios laboratory labour lacey lacks lacquer lactic laden landed lanes langs language languages lantern lanzamiento larga large larger largest largo largos lassen lasting lasts latas later lateral latest latin latinas launch lavada lavado lavar lawfully layout lazada leadership leading leads leaflet leakage leakproof leaks learn learned learning learns least leather leave leaves leaving leche leches lectura ledger leerla leerlo leftovers legal legales legalization legally legibles legislation legislativa lejano lejos lembar length lengths lenguaje lentitud lesson letmein letra letras letter letters levantamiento levantaron levas level levels lever leyendo leyes libera liberaciones liberar libere libre libremente libres libro licence licences licencia licencias license licensed licensing licensor licked licores lieferung lieferzeit lifelong lifestyle lifetime lifted lifts ligeramente light lighten lighter lightest lightweight likelihood likely likewise limit limita limite limited limits limpia limpiador limpiadores limpieza linen lines lineup linked linkedin linking links liquefied liquid liquids liquor liquors lisbon lista listado listan listar listas liste listed listing listings listo listos lists lithium litigated litio little llama llamada llamadas llamar llave llega llegada llegadas llegado llegan llegar llegaron llegue lleguen llena llenado lleva llevan llevar lleve lleven loaded loading local locale locales localized locally located location locked logged logging logic login logins logistics logistik logos logotipo logout logros london longer longitud longs longue looked looking looks lookup loose losses lotes lotions lower lowered lowers lowest luego lugar lugares lukewarm lukisan lumps lumpur lunes luxury lwpal macao macau machine machinery machines madam madera maderas madrid maestra maestro magnitude mailbox mailed mails mainly maintain maintained maintenance major maker makers makes making maklumkan malasia malaysia malleable malls manage managed management manager manages mandatory maneja manejo mangos manila manos mantener mantenga mantenidos mantenimiento mantiene mantienen mantuvo manual manually manuals manufacture manufactured manufacturer manufacturers manufacturing manure mapped mapping maquillaje maquinaria marca marcadas marcado marcadores marcados marcan marcando marcar marcaron marcas march marcha marco marcos mardep marfil margen margin margins marina marine marked market marketed marketing marketplace marketplaces markets marking markings marks markt marktes marque marzo mascotas masivo masivos masks master masuk match matcha matched matches matching material materiales materials materias matriculado matricular matricularlos matrix matriz matter matters matthew maturity maximum mayonesa mayonnaise mayor mayores mayorista meaning means meant meanwhile measure measured measurement measurements measures measuring mecanismo mechanically mechanism media mediados median medians mediante medical medicamento medicamentos medicated medicina medicinal medicine medicines medicore medida medidas medido medio medios medir medium meeting meetings meets mejor mejora mejorarlo mejoras mejores melbourne member memberi members membership memeriksa memilih memoria memory memos menciona menciones menerima mengapa mengatur menge mengen menghubungi mengikut menlo menor menores menos mensaje mensajes mensual mensuales mention mentioned mentions mentsuyu menudo menus menyediakan menyemak menyiapkan mercado mercados merchant merci mercurio mercury merge merged merging merupakan mesas meses message messages messaging metal metales metals method methyl metrology mevzuat mexico mezclan mezcle miami michael microbes microbial microbiological microorganismos microorganisms microwavable microwave middle midnight miembro miembros mientras migration mihon milan mileage milestones militar military milks miller million millones minato minerals miniatura minimis minimum minister ministerial ministerio ministro ministry minorista minoristas minta minus minute minutes minuto minutos miran mirando mirar mirrorless misiles misinformation misma mismas mismatch mismo mismos misread misreadings missed misses missiles missing mistake mistakes mitad mixed miyagi mobile model modelo modelos models modernization modes modifica modificaciones modificada modificados modificaron modifications modificativo modified modifier modos molluscs moluscos moment momento monday moneda monedas money monitors monkey monodukuri monospace montant month monthly months moreover morning mostaza mostrada mostrado mostrados mostrando mostrar mostraremos mostrarlo mostrarlos motivo motivos motor motores moulded mouse mouth moved moverla moverse moves movimientos moving msgtr muchas mucho muchos muerde muestra muestran muestras muestre muestren muktamadkan mulai mulakan multiple multiplicadas multiplican multiplied multiply mumbai mundial mundo munich municipal municipality music musical mustard muster musts mutuamente myself myshopify nacional nacionales nadie nagano nakamura named names naming naranjas narcotics narita narrative narrow narrowed narrower narrows naruto national nationwide natural naturales naturaleza naturally nature navegador naver naviera navigational ncclaw nearby nearest nearing nearly necesaria necesarias necesario necesarios necesidad necesita necesitan necesitar necesite necesito necessarily necessary needed needing needs negative negativo negativos negociaciones negociado negociar negocio negocios negotiable negotiate negotiated negotiating negotiation negotiations negra negro neither nennen netherlands network never nevertheless newcomer newcomers newer newest newly newsletter newsroom nicht nichts nickel nifty nigeria nihon niigata ninguna nippon nishiki nivel niveles nobody nocivas nodes noise nombornya nombra nombrarlos nombrarse nombre nombres nomornya nonce nonetheless noninvasive nordic norma normal normalizado normalized normally normalmente normas normativa normativo north norway noscript nosotros notas notebook noted notes nothing notice noticed notices notifica notificaciones notificado notifican notificante notificar notificarlo notificarse notification notifications notified notifies notify notifying notoriedad notre nouns novedades novel november noviembre nowhere nowrap nparks ntable nuclear nucleares nuestra nuestro nuestros nueva nuevas nuevo nuevos number numbered numbering numbers numeran numeric numerically nummer nunca nurseries nutricional nutrientes nutrition nutritious object objetivo objetivos obligatoires obligatoria obligatorias obligatorio obligatorios observaciones obsoleta obsolete obstante obtain obtained obtaining obtains obtener obtenerlo obtenerse obtengan obtengo obtenido obtenla obtiene obtienen obtuvieron occurred ocean october ocultan ocultar ocultas oculto ocultos ocupa ocurre ocurrido ocurriendo ocurrieron oferta ofertas offal offer offering offers office officedocument officer offices official officially offline offset oficial oficiales oficialmente oficina oficinas ofrece often oilseeds older oldest olvidos omakase omissions omiten omitieron onboarding onedrive onepiece ongoing online ontime opcional opcionales opciones openai opened opening opens openverse operaciones operador operando operar operate operating operation operations operativa oportunidades oportuno opted option optional options orador orange orchids orden ordena ordenadas ordenado ordenador ordenados ordenan ordenanza ordenar order ordered orders ordinance ordinario ordinary organic organice organised organisieren organismo organiza organizar organization organize organized organizes organizing orient oriental orientativa orientativo oriente oriented origen origin original originales originals originating origine origins osaka other others otherwise otras otros ourselves outbound outcome outdated outdoor outdoors outer outerwear outlet outlets outliers outline outlook outpace outperform output outputs outreach outside outsource outsourcing outstanding overall overclaiming overcome overdue overflow overflows overlap overlooked overnight overridden overseas oversee oversight overtime overview overwrite owner owners ownership pacific package packages packaging packed packing packliste packs padding pagado pagados pagan pagar pages paint paints paired pairing pairings pairs palabra palabras palier pallet pallets panel panels pantalla pantallas pantalones papel papelera paper papers paperwork paquetes paralelo parallel parameter parar parcel parcels parcial parcialmente parece parecer parent parentheses paris parsed partagez parte partes partial partially participan participantes participating participo particle particular partida partidas partir partly partner partners partnership partnerships parts party pasada pasado pasan pasar pasaran pasos passed passend passende passenger passes passing passive passport password passwords pasta paste pasted pasteurizan pasteurized pasting pasukan patch patentes patents paths pausa pausado pausaron paused pausing paying payment payments pedidas pedido pedidos pedimos pedir pediremos pegada pegado pegar pegarlos pegue pelanggan peligros peligrosa peligrosas peligrosos pembeli pembungkusan pemeriksaan penang penawaran pendaftaran pendiente pendientes pending penghantaran pengimport pengiriman penilaian pensando people pepper peraturan perbincangan percentage percentages perder perdidas perdido perdidos perdieron perdimos perfect perfil perfiles perform performance performed performing peringkat period periodo periods perjudiciales perkiraan perlu permanece permanecen permanent permanente permanentes permanently permiso permisos permission permit permita permite permiten permitida permitidas permitidos permitieron permitir permits permitted perms perplexity persists person persona personal personales personas persuasive persyaratan pertama pertenecen pertenecer perth pesados pesanan pesca pesos pesqueros pesticide pesticides pests peticiones petit petrol petroleum pflichtfelder pharmaceutical pharmaceuticals pharmacy phases philippines philosophy phone phones phong photo photos phrases physical phytosanitary picked picks pickup picture pictures piden piece pieces pierde pierden pieza piezas pigments pilih pilihan pincel pinion pinned pioneros pipeline pitch pitfalls placa place placed placeholder placeholders places placing plagas plaguicidas plain planear planes planetario planetary planificar planned planning plano plans plant planta plantaciones plantas plantilla plantillas plants plastic plastics plate plates platform platos playground plazo plazos please plegadas plegados plena pliegan plomo plugs pneumatic pocos podemos poder podido point pointer points poisons pokemon poland policy policyholder polish polished pollock polvo pondera ponderados poner ponerla ponerse ponga poolsel porcentaje porcentajes porcine porque portada portal portapiezas ports portuaria portuarios portugal posibilidad posible posibles posiciones position positioning positions positive pospuestos possible possibly postal postcards posterior posteriores posts potencial potential pouch pouches poultry pourquoi pouvez powder power powered practice precauciones precautions precedence precio precios precious precisa precisas precisely precision predeterminada predeterminado preenvasados prefectura prefecturas prefecture prefectures prefer preference preferences preferencia preferencial preferenciales preferencias preferente preferential prefiere prefill prefilled pregunta preguntando preguntar preguntaremos preguntarlo preguntas pregunte preis preisliste preisstufe preliminares preliminary premarket premio premios premium prenda prensa preocupantes prepackaged prepaga prepara preparaciones preparada preparadas preparado preparando preparar prepararlo preparation preparations prepare prepared prepares preparing prepays preseleccionar presenciales present presenta presentaciones presentados presentamos presentan presentar presentation presentationml presented presenten preservative preservatives preset presets press pressed pressing pressure prestaciones prestar presupuesto prevails prevalece prevent previa preview previo previous previously previsible prevista previsto previstos price priced prices pricing primaria primarias primary primas prime primer primera primero primeros princess principal principales principalmente principiante principio principle print printable printed printing printout prior prioridad prioridades prioritarias priorities prioritize prioritizes priority priorizar prisa privada privadas private proactive probabilidad probability probable probablemente probables probar problem problema problemas problems procede proceden proceder procedimientos procedure procedures proceed proceeding procesados procesamiento proceso procesos process processed processes processing procurement prods produce produced producer producidos product production producto productor productos products produit produk produkt produktdaten profesional professional profile profiles profit profitable proforma profundiza profundizas program programa programas programs progreso progress progressed progresses progression prohibidas prohibido prohibir prohibited prohibitions prohibits project projects promedio prometedores promise promises promising promotion prompts pronto proof proofreading propagation proper properly properties property propia propias propiedad propiedades propietario propio propios propone proponer proponga proponiendo proposal proposals propose proposes proposing propuesta propuestas prospect prospecta prospectado prospectar prospecting prospective prospectos prospects protect protected protection protective protector protectores protects protegidos proteja proton protonmail prototype prove proveedor proven provide provided provider providers provides providing proviene provienen provincial provinciales proving provision provisional provisionales provisionally provisionalmente provisions proxy proyecto proyectos prueba pruebas pruebe public publica publicaciones publicadas publicado publicados publican publicar publicarlas publication publicidad publicly publique publish published publishes publishing pudieron pudimos pueda puedan puede pueden puedes puedo puerto puertos puestas puesto pulido pulir pulsa pulsar pulsarlo pulse pulses pumps punctuation punteadas punteado punto puntos puntuaciones puntual puntuar purchase purchasing purpose pursuing putting puzzle qatar qualified qualifies qualify quality quantities quantity quarantine quarterly quasi queda quedaban quedan quedar quedaron quede queden quelques quepa queremos question questions quick quicker quickest quickly quien quienes quiera quieran quieras quiere quiet quita quitada quitado quitados quitan quitar quitaron quite quota quotable quotation quotations quote quoted quotes quoting qwerty qwertyui qwertyuiop racks radiactivas radiactividad radiation radio radioactive radioactivity radius raised raises rakuten range ranged ranger ranges rango rangos ranked ranking ranks rapidez rapidly rarely rascador rated rates rather ratio razones reabierto reabren reabrir reabrirla reacciones reach reachable reached reaches reaching reaction reactions reactivar reactivarla reactivarlo reactivate reactivated readability readable readers readily readiness reading readings reads ready reales realidad realistic realiza realizar really realmente reanudarla reason reasonable reasoning reasons rebaja rebuild rebuilt recae recalcula recalculadas recalculan recalcular recalcularlos recalcularon recalculate recalculated recalcule recalled recalls recargable recargan recargar recargo recargos recargue receipt receive received receives receiving recent receta recevoir rechargez rechaza rechazados rechazan rechazar rechazo rechazos rechnung reciba reciban recibe reciben recibida recibidas recibido recibieron recibir recibirla recibirlas reciclaje reciente recientes recipient recipients reciprocal recoge recogida recognised recognize recognized recomendable recomendaciones recomendadas recomendado recomendados recomendamos recomienda recomiendan recomiende recommend recommendation recommendations recommended recommends reconectando reconnecting reconoce reconocieron reconsider recopiladas recopilar record recordatorio recorded recording records recortando recortar recreate recreated recreating recuadro recuento recuentos recuerda recuerde recuperan recuperar recuperarlos recuperarse recurrentes recurring recyclable recycled recycling redacta redactado redactar redactaron redacte redes redesign rediffmail redirects redoing redondeado redondeados redone redrawn reduce reduced reducen reduces reducida reducir reducirse reduction reefer reemplaza reemplazado reemplazar reenviar reescala reescriba reescribe reescribir reescribirlo reexportaciones reference referenced references referencia referencias referido referral referrals referred referrer referring refers refilled refine refined refining reflected reflects refleja reflejado reflejan reflejarlos reforzado reforzar refreshed refrigerado refrigerated refrigerating refrigeration refrigerator refund refunded refusal refuse refuses regalo regarding regardless regards regedit regeneran regenerar regenerate regenerated regime regimes region regional regiones regions register registered registering registers registra registraba registrada registradas registrado registrados registrales registramos registran registrando registrant registrar registrarla registrarlo registrarlos registraron registrarse registrasi registration registrations registre registren registrierung registro registros registry regla reglamento reglas regprod regulaciones regulador regulados regulan regular regulasi regulated regulates regulating regulation regulations regulator regulatoria regulatorias regulatorio regulatory rehace rehacer rehacerla rehaciendo reimposed reinforced reinicia reinician reino reissued reject rejected rejecting rejection relacionadas relate related relation relationship relative relatively relativo relaxed relay relays release released releases relee releer relevant relevantes relevo reliable relief relies rellena rellenado rellenados rellenan rellenando rellenar rellenaron rellenarse rellene relleno reload reloaded reloading reloads remain remaining remains remember remind reminded reminder reminders reminds remitente remitentes remota remote remoto removal removals remove removed removers removes removing remplir remplis rename renaming rendimiento renew renewal renewed renombrar renovado rentables rental renumber renvoyer reopen reopened reopening reopens repair repairs reparaciones repartan reparten repartir reparto repealed repeat repeated repellent repetidas repetidos rephrasing repita repite replace replaced replaces replacing replanificar replay replied replies reply replying report reported reports representante representantes representations representative representatives reproductive reptil reptile repuesto requeridas requeridos requerir requerirse request requested requester requesting requests requiera requiere requieren require required requirement requirements requires requiring requisito requisitos requote reread resalta resbank rescaled research researched researches researching resend resent reserva reservado reservar reservas reserve reserven reset resets residue residues residuos resistant resistencia resize resmigazete resoluciones resolution resolve resolved resolver resolverlo resona respaldadas respaldar respalden respaldo respecto respetan respond responda respondan responde responded respondemos responden responder respondidas respondido respondiendo respondieron responding responsabilidad responsable response responsibilities responsibility responsible respuesta respuestas restablece restablecen restablecer restablecieron restante restantes restart restates restaurable restaurado restaurando restaurant restaurantes restaurants restaurar restaurarla restaurarlo restaurarse resto restorable restore restored restoring restos restricciones restrict restricted restricting restriction restrictions restricts restringe restrinja resuelve result resulta resultado resultados results resuma resume resumed resumen resumido resumidos resumiendo resumir resumirla resumption retail retailer retailers retenida retenido retenidos retirar retoman retort retrasa retrasado retrase retraso retrasos retreaded retried retrievable retrieved retry retrying return returned returning returns retype reunidos reuniones reunirse reusable reuse reused reutiliza reutilizable reveal revela revelan revele revenue reverse reversed revert reverted review reviewed reviewing reviews revisa revisadas revisado revisan revisando revisar revisaremos revisarlas revisarlo revisarlos revisaron revise revised revoke reworded rewrite rewriting rewritten riesgo riesgos rigen right rights rises risks ritmo roadmap roads roadworthiness rodaje rodillos rogamos roles roller romaji romanize rosewoods rostro rotary rotation rough round rounded route routes routine routines rubber rueda ruedas rules ruling runner running rusia russia rutas rutinas saber sabes sabor sacar safely safer safest safety sahaja sahkan saigon sailed sailing sailings saitama sakai sakura salen sales salesperson salida salidas salido salientes salir salmon salon salsa salsas salta saltar salto salud saludable saludables saludos saluran salvado salvo sampel sample samples sanciones sanctions sanitaire sanitaria sanitario sanitarios sanitation sasaran saturada sauce sauces saudi saudita saved saves saving sazonado sazonar scaled scandinavia scenario scene schedule scheduled scheduler schedules scheme schemes scholarship school schools scope score scores scoring scotland scrap scratch scratcher screen screens screenshots screws script scripts scroll scrolls seafood sealed search searchable searched searches season seasonal seasoned seasoning seasonings seattle seawater seaweed sebut secciones second seconds secrets section sections sector secundaria secundario securing security seedlings seeds seems seguidas seguidos seguimiento seguimientos seguir seguiremos segunda segundos seguridad seguro seguros seite selecciona seleccionada seleccionados seleccionan seleccionaron seleccione select selected selecting selection selector selects selesaikan sellado seller selling sells selon semakan semana semanal semanales semanas semestre semiconductor sencillo senden sender senders sending sends sensible sensitive sensors sentences sentido seoul separa separadas separado separate separated separately september septiembre sequential serial serie series serious serlo serta sertifikat serums serve served server servers serves service serviced services servicio servicios servidor sesiones session sesuai setempat setiap setting settings settle settled settlement settling setup several shadow shadows shaft shafts shamisen shanghai shape shapes share shared shareholder shares sharing sharp sharpen sharpening sharper sheep sheet sheets shelf shell shelves shenzhen shift shiga shipment shipments shipped shipper shippers shipping ships shiro shirts shockproof shopee shopify shops short shorten shortened shortens shorter shortlist shortly should showing shown showroom shows shugiin sidewalk sideways siempre siendo signal signals signatories signatory signature signed significa significado signing signs sigue siguen siguiente siguientes siguiera sijil silver silvicultura similar similares simple simplificada simplificado simplified simply simuladas simulated simultaneously since sincroniza sincronizado sincronizar singapore singapur single singularidad sirve sirven sistema sistemas sites sitio sitios situation sizes skipped slack sleepwear slice slide slides slightly slips slots slowly small smaller smallest smarter smartphone smartphones smooth snapshot snoozed soaps sobre sobrescrito soccer sociales sociedad socio socios sodio sodium softbank software sokongan solapan solar solares solas solicita solicitada solicitado solicitados solicitan solicitante solicitar solicitarla solicitarlo solicitarse solicite solicitud solicitudes solid solved sombra someone somete something sometimes somewhere sonar soonest sopas soporte sorted sorting sostenibilidad sostenida sostienen souhaitez sound soups source sourced sources south southeast southern soutien space spaces spacing spain spanish spare speaker special species specific specifically specification specifications specified specifies specify specs speed speeds speichern spelling spending spesifikasi spezifikation spezifikationen spice spices spirits split splits spokesperson sponsorship spoofed sportswear spray spraying sprays spread spreadsheetml sprockets stability stable staff stage stages stainless stakeholder stale stall stalled stand standage standalone standard standardise standards standing stands starch stars start started starten starter starting starts stash state stated statement statements states stating station statistical statistics status stayed stays steady steel steering steps sterile sterilisation sterilization sterilized stick sticker stickers sticks sticky still stock stockage stopped stopping stops storage store stored storefront storehouse stores story straight straightforward strains stranded strategy straw strength strengthen strengthened strengths stretch strict stricter strikes string strings strip stroke strong stronger structured stuck studies studio stuffing style suave subastas subcontract suben subheading subheadings subido subidos subieron subir subirlo subject submission submit submits submitted subpartida subpartidas subrayado substance substances substantially substitute subtarea subtareas subtasks subtle subtree success succession suele suelen sueltas suelte suelto suena suenan sufren sugar sugerencia sugerencias sugerida sugeridas sugerido sugeridos suggest suggested suggestion suggestions suggests sugiere sugieren suitable suits sujetos sulphites sumado suman sumar sumen suministrar suministro summaries summarise summarising summarize summarized summarizes summarizing summary summer sundries sunlight sunscreens sunshine super supera superan superar supere superficies superior superlative superlativos superman superpuesto suplantada suplente supone suponen suposiciones supplement supplementary supplements supplier suppliers supplies supply support supported supporting supports supreme supremo supuesto supuestos surface surfaces surfactants surimi surplus surrounding suspend suspende suspended suspender suspenderlas suspendida suspendidas suspendido suspendidos suspending suspends suspensions sustainable sustainably sustained sustancia sustancias sustentan sustituidas sustituir sustituirlo sustituye sustituyeron suyas suyos suzuki sweden sweet swelling swiss swissdamed switch switched switcher switches switching switzerland sydney synced syncing syncs syringes system systems tabaco tabla tablas table tables tablet tabletop tablets tableware tackle tagline tailandesa tailandia tailored taipei taiwan takahashi taken takes taking talked talking talks talla tampoco tanaka tanto taobao tarda tardando tardar tarea tareas target targets tarif tarifa tarifas tariff tariffs tarjeta tarjetas tasas tasks taste taught taxable taxation taxed taxes tbody teach teaching teams technical technically technique techniques technische technology tecla teclado teeth teknikal teknis telas telecom telecomunicaciones telegraphic telephone televisores telex telling tells temas tempatan temperatura temperature template templates tempoh temporada temporal temporalmente temporarily temporary tendencias tendency tender tendremos tends tener tenga tengan tenor tensioactivos tentative terceros terima termina terminada terminadas terminado terminal terminales terminals terminan terminar terminarlo termine terminen terms terperinci terreno terrestre territories territory testado tested testing tests texas textarea textbook texte textes textil textile textiles texto textos texts thailand thank thanked thanks thead theater theatre their theirs theme themselves theory therapy there thereafter thereby therefor therefore therein thereof thermal these thing things thinking third thoroughly those though thousand thread threading threads three through throughout thumbnail thumburl ticking ticks tidak tidied tiempo tienda tiendas tiene tienen tienes tiers tight tighter tightness tiktok tiles tilting timber timbers timed timeframe timeline times timetable timing tingkat tintes tipos title titular titulares tmall toallitas toasted tobacco tocador tochigi todas today todos together toggle tohoku toilet token tokens tokio tokyo tolerances tomada tomado toman tomar tomaron tomate tomato tomorrow tools toothbrush toothed toothpaste topic topics topped toque toronto tortoiseshell total totales totals touch touches toward towed towels toxicity toyota trabaja trabajar trabaje trabajo traceability traceable traces track tracked tracking traction tractors trade tradecloud trademark trademarks trader tradicional trading tradition traditional traducciones traduce traducen traducido traducidos traduciendo traducir tradujimos tradujo training tramite tramo tramos tranquilidad transacciones transaction transactions transbordo transcripciones transcription transcurren transfer transferencias transfers transformed transit transitario transitarios transition translate translated translating translation translations translator transmettre transmis transmission transmite transmits transparent transport transporta transporte transportista transportistas transports transshipment trash trasladarse traspasan traspasar traspaso trata tratamiento tratan trato tratos travel travels trayecto trayectoria trayectos treat treated treatment treats trend trends trial trials tribunal tributaria tried trimestral trimming tropical trousers truly trust trusted trying tubes tujuan tumbler tumblers tunggu turismos turkey turned turning turno turns tuvieron twice twitter typed typeof types typical typically typing tyres ukraine umbral umumnya unable unassigned unavailable unavoidable unchanged uncheck unchecked unclear unconnected undecided undefined under undercarriage undergo undergoes underline underlying understand understandable understanding understood undertake underway underwear undone unexpected unfavorable unfinished unfit unidad unidades unido unificada unificado unificar unificarlos unificaron unified unifique uniformly unique uniqueness unirse unitario unitarios united units universities unknown unless unloaded unloading unlocked unmatched unmet unnoticed unopened unpaid unreachable unread unreadable unsaved unseasoned unsent unser unserem unseres unset unsuitable unsure unterlagen untick until untranslated untuk unused unusual unverified unviewed unzip upcoming update updated updates upgrade upgrades upload uploaded uploader uploads upstream uptake upunit upward urgent urgente urgentes usaban usability usable usada usadas usado usados usage usamos usando usaremos usarla usarlas usarlo usarlos usaron usarse useful usercontent users using usted ustedes usual usually usuario usuarios utensilios utensils utiliserons utilisez utilisons utilizados vaccines vaciado vaciar vacuum vajilla valid validation validez validity valor valores value values vancouver vaqueros variador variantes variants variar varias varies varieties variety varios vasos veces vegan vegetable vegetables vegetal vehicle vehicles velocidad vence vencen vencer vencida vencidas vencido vencimiento vencimientos vende vendedor venden vender venderse vendidas vendidos vendiendo venta ventana ventas venza verbindung verdad verdict verduras verifica verificadas verificado verificados verifican verificar verificarlo verificaron verificarse verification verified verifies verifique verify verifying verkauft verla verlas verlo verlos versand versatile versatility verse version versiones versions versuchen vertical vertriebskanal verwenden vessel veterinary veuillez viabilidad video videos viendo viene vienna vietnam vietnamese vietnamita viewed viewing vigencia vigente vigentes vigor vinagre vinagres vincula vinculantes vincular vinegar vinegars violates virtud visado visibilidad visibility visible visibles vision visit visita visits vista vistazo visto vistos vitamin vitamins vocabulario vocabulary volante volatile voltage volume volumen volumes volver vorhanden vornehmen vorzustellen votre voyage vuelo vuelva vuelve vuelven wadding waited waiting waits waived waktu walls wanted wants warehouse warehouses warehousing warned warning warnings warns warranties warranty warum washable washed washes washing waste watanabe watch water watercolor watermark waterproof waterway waybill weapons weather weatherproof website websites wechat weekends weekly weeks weight weighted weighting weights weiteren welcome welded welfare wenden werden weserv western whatever whatsapp wheel wheelchair wheels whenever where whereas whereby wherever whether which while white whiteboard whole wholesale wholesaler wholesalers wholesaling whose wichtig widely widen wider width wikimedia wikipedia wildlife window windproof windshield winning wipes wireless withdraw withdrawal withdrawals wither within without withstand wixsite wooden woods woodwork worded wording wordpress wordprocessingml words worked worker workflow workforce working workplace works workshop world worldwide worth would woven wraps wristwatch writable write writes writing written wrong wrote wurde xdocs yahoo yakiniku yamada yandex yardstick yearbook years yellow yenes ymail yokohama yours yourself yourselves youtube zealand zeichnung zeitplan zertifikate zonas zones zusammen zusammenarbeiten zutatenliste zxcvbn zxcvbnm".split(" "));
if (typeof v86dkVocab === "function") {
  const __voc99 = v86dkVocab;
  v86dkVocab = function () { // eslint-disable-line no-global-assign
    const V = __voc99.apply(this, arguments);
    try { if (V && typeof V.add === "function" && !V.__v99enw) { V99DK_ENW.forEach(w => V.add(w)); V.__v99enw = 1; } } catch (e) { v99dkErr("enw", e); }
    return V;
  };
  try { if (typeof V86DK !== "undefined" && V86DK) V86DK.voc = null; } catch (e) { }
}
