/* ═══ v21.97 deck（2026-11-18 第10回相当 UAT・21.96）外国語営業資料と商品写真
   No.509（条件つき→直し）写真の選択肢：F・G（日本語の文字だけが理由）では「このまま使う／文字の所を切り取る・隠す／差し替える／使わない」が出たが、
           A〜E では写真が外れたまま選べなかった
     原因：21.96 の選択肢は「日本語の文字」が理由の写真（v96dkPhSt＝jpAsk）にしか出なかった。小さい（短い辺 420px 未満）・横長／縦長・ぼやけ・
           AI が「商品写真に向かない」（ok:false）・図や文字が中心（役割 infographic）の写真は v96dkPhSt が "bad" を返し、ボタンは「切り取る・差し替える」だけ。
           「このまま使う」が無く、dkPhGood が false のまま資料（dk3PickPhotos・納品レベルチェック）から外れ続けた。21.95 の「直し方」の箱は日本語の画面だけ。
     直し：外れる理由（日本語の文字・ぼやけ・小さい・形・AI の判定・図表）をすべて同じ扱いにし、どのカテゴリーでも写真ごとに
           「このまま使う／切り取る・隠す／差し替える／使わない」を選べる（v96dkPhSt を包み直し、"bad" を出さない）。「このまま使う」を選んだ写真は
           dkPhGood が通す＝プレビュー・PPTX・PDF に入る。写真の欄の短い表示・納品レベルチェック・作成の段・最終チェックも、理由ごとの言葉にそろえる。
           選んでいない写真は資料に入れず、最終チェックに「使うかどうか選んでいない写真 N枚（理由）」と必ず出す（黙って外さない）。
   No.532（低）英語の資料の 7枚目に「ISO13485 証明書」が日本語のまま
     原因：書類名・認証名（例：規制のひな形の「ISO13485証明書」「滅菌証明書（該当品）」）は dk3DataTr の AI の訳で訳される。訳が数字を変える
           （例：ISO 13485:2016 Certificate）と dk3TrOk が「数字が変わった」として原文（日本語）に戻す。最終チェックは「日本語が残っているページ」とだけ出し、
           どの文かが分からず、直す手立ても無かった。
     直し：① 訳の依頼に「書類名・認証名も訳す・規格の番号に年版を足さない」を足す。② 訳のあと・資料の組み立てのあと・1枚の紹介シート・保存した資料を
           開いたとき、外国語の資料の全部の文字を見て、日本語が残っていれば決まった訳語の表（書類・認証・単位・期間など）で直す（数字は変えない＝dk3TrOk で確かめる）。
           ③ それでも残った文は、最終チェックの重大な問題に「7枚目「ISO13485 証明書」」のようにページと文をそのまま出し、納品版の PPTX・PDF・1枚の紹介シートを止める。
   No.533（中）根拠照合で外した文言と同じ趣旨の表現（C「0.8 mm/s」など）が資料に残る
     原因：照合（dk3Ground・dk3Verify）は1文ずつの判定。外した文と同じ数字・認証・最上級を言う別の文は、AI が別の判定をすると残る。最終チェックの
           「外した文言 N件」と、資料に残った同じ主張が食い違う。
     直し：外した文から「主張の単位」（単位つきの数字・%・範囲・比・ISO などの番号・認証・最上級）を取り出し（全角・空白・単位の書き方をそろえる）、
           資料の文章の全部の文と照らし合わせる。・根拠（登録の情報と資料）に無い主張 → 同じ主張の文をすべて外す。
           ・数字そのものは根拠にあるが、強い表現（業界最高・ultra-low など）で外した → 同じ数字を強い表現で書いた文も外す。
           ・数字は根拠どおりで、ほかの文は普通の書き方 → 残し、外した文の理由に「数字 0.8 mm/s 自体は根拠どおり（ほかのページでは残しています）」と書く。
           外した数は実際に外した文の数（同じ主張で外した文を含む）。資料の表（登録の値）に残る分は最終チェックに出す。
   No.522（低）作成に 4〜11分・ばらつきが大きい
     原因：並べて頼む仕組み（21.80 の v80doc：訳の先取り・写真の役割・照合を3つまで同時）はある。時間が延びるのは、長い返事が上限で途中で切れたとき、
           llmAsk が上限を3倍にして最初から頼み直す（文章・照合・訳のどれでも同じ時間がもう1回かかる）ため。商品の情報が多い C（軸受）の 11分はこれ。
           残りの目安は過去の回の平均で、照合が何回分のうち何回終わったかを使っていない。
     直し：資料の文章・照合・訳の依頼は、はじめから返事の長さに足りる上限で頼む（照合は主張の数から決める）。途中で切れて頼み直した回数を数えて
           最終チェックの記録に残す。照合の段の残りの目安は、終わった回の実際の時間 × 残りの回数（同時に頼める数で割る）で出す。
   書き方：前の層の関数は控えてから包む。登録の値は書き換えない（写真への「使う／使わない」の控えだけ）。失敗したら前の動きのまま。 */
var V97DK = window.V97DK = { v: "21.97", err: [], n: {}, jp: null, prop: null, cut: { plan: 0, verify: 0, trdata: 0, other: 0 }, raise: 0 };
function v97dkErr(k, e) { try { V97DK.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97DK.err.length > 40) V97DK.err.shift(); } catch (x) { } }
function v97dkN(k, d) { try { V97DK.n[k] = (V97DK.n[k] || 0) + (d || 1); } catch (e) { } }
function v97dkLang() { try { if (typeof v96dkLang === "function") return v96dkLang(); } catch (e) { } return "ja"; }
function v97dkM(ja, en, zh, es) { const l = v97dkLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v97dkE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v97dkTen() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
function v97dkDeckT() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || v97dkTen(); } catch (e) { return v97dkTen(); } }
function v97dkPat(rows) { try { if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) rows.slice().reverse().forEach(p => I18N.pat.unshift(p)); } catch (e) { v97dkErr("pat", e); } }
function v97dkDict(rows) {
  try { if (typeof I18N === "undefined" || !I18N || !I18N.dict) return;
    rows.forEach(r => { ["en", "zh", "es"].forEach((l, i) => { if (r[i + 1] && I18N.dict[l] && !I18N.dict[l][r[0]]) I18N.dict[l][r[0]] = r[i + 1]; }); }); } catch (e) { v97dkErr("dict", e); }
}

/* ══════════ No.509 写真：外れる理由すべてに同じ選択肢 ══════════ */
/* 外れる理由（利用者の選択は見ない）。jp＝日本語の文字・low＝ぼやけ・ng＝AI が向かないと判定・small＝小さい・ratio＝形・info＝図や文字が中心 */
function v97dkWhyKeys(o) {
  const out = [];
  try {
    if (!o || !o.b64 || o.other) return out;
    const q = (typeof dkImgLocalQ === "function") ? (dkImgLocalQ(o) || {}) : { big: true, ratioOk: true };
    const dq = o._dq || null;
    if (dq && dq.jp) out.push("jp");
    if (dq && dq.low) out.push("low");
    if (dq && dq.ok === false && !dq.jp && !dq.low) out.push("ng");
    if (q.has !== false && q.big === false) out.push("small");
    if (q.has !== false && q.ratioOk === false) out.push("ratio");
    if (o._role === "infographic") out.push("info");
  } catch (e) { v97dkErr("why", e); }
  return out;
}
V97DK.whyKeys = v97dkWhyKeys;
function v97dkDecOf(o) { try { return (typeof v96dkDec === "function") ? v96dkDec(o) : ""; } catch (e) { return ""; } }
/* 写真1枚の状態：good／jpAsk（理由あり・まだ選んでいない）／jpUse（このまま使う・加工して使う）／jpNo（使わない）／other。"bad" は出さない
   （21.96 の名前のまま＝写真の欄・作る前に選ぶ画面・最終チェックの前の層の処理もそのまま使える。jp は「理由あり」の意味に広げた） */
if (typeof v96dkPhSt === "function") {
  const __st97 = v96dkPhSt;
  V97DK.st0 = __st97;
  v96dkPhSt = function (o) {
    try {
      if (!o || !o.b64) return "";
      if (o.other) return "other";
      const why = v97dkWhyKeys(o);
      if (!why.length) return "good";
      const d = v97dkDecOf(o);
      if (d === "no") return "jpNo";
      if (d === "use") return "jpUse";
      return "jpAsk";
    } catch (e) { v97dkErr("st", e); return __st97.apply(this, arguments); }
  };
  try { if (V96DK) V96DK.phSt = v96dkPhSt; } catch (e) { }
}
/* 「このまま使う」を選んだ写真は、理由が何でも資料に入れる（日本語の文字だけでなく、小さい・形・ぼやけ・AI の判定も） */
if (typeof dkPhGood === "function") {
  const __pg97 = dkPhGood;
  V97DK.pg0 = __pg97;
  dkPhGood = function (o) {
    try { if (o && o.b64 && !o.other && v97dkDecOf(o) === "use" && v97dkWhyKeys(o).length) { v97dkN("pgUse"); return true; } } catch (e) { v97dkErr("pg", e); }
    return __pg97.apply(this, arguments);
  };
}
/* 選んだときの知らせ：日本語の文字のほかの理由の写真では、理由に合う言葉にする（21.96 は「文字入りのまま使います」だけ） */
function v97dkNonJp(o) { const k = v97dkWhyKeys(o); return k.length > 0 && !(k.length === 1 && k[0] === "jp"); }
if (typeof v96dkUse === "function" && typeof v96dkSetDec === "function" && typeof v96dkAfter === "function") {
  const __us97 = v96dkUse;
  v96dkUse = function (T, i, d) {
    try {
      const o = ((T && T.assets && T.assets.ph) || [])[i];
      if (o && o.b64 && v97dkNonJp(o)) {
        v96dkSetDec(o, d, "");
        const ja = "商品写真" + (i + 1), nm = (typeof v96dkPhNm === "function") ? v96dkPhNm(i) : ja;
        try { if (typeof logU === "function") logU("deck", "営業資料の写真：" + ja + (d === "use" ? "をそのまま使う（" + v97dkWhyAllJa(o) + "）" : d === "no" ? "を使わない" : "の選択を戻す")); } catch (e) { }
        v96dkAfter(d === "use" ? v97dkM(ja + "を、このまま資料に使います（" + v97dkWhyAllJa(o) + "）", nm + " will be used in the deck as it is", nm + "将直接用于资料", "La " + nm + " se usará tal cual")
          : d === "no" ? v97dkM(ja + "は、資料に使いません", nm + " will not be used in the deck", nm + "不用于资料", "La " + nm + " no se usará") : "");
        v97dkN("use." + (d || "clear"));
        return;
      }
    } catch (e) { v97dkErr("use", e); }
    return __us97.apply(this, arguments);
  };
}
if (typeof v96dkUseAll === "function" && typeof v96dkPhSum === "function") {
  const __ua97 = v96dkUseAll;
  v96dkUseAll = function (T) {
    try {
      const S = v96dkPhSum(T);
      if (S.ask.length && S.ask.some(x => v97dkNonJp(x.o))) {
        S.ask.forEach(x => v96dkSetDec(x.o, "use", "all"));
        try { if (typeof logU === "function") logU("deck", "営業資料の写真：選んでいない写真 " + S.ask.length + "枚をそのまま使う"); } catch (e) { }
        v96dkAfter(v97dkM("選んでいなかった写真 " + S.ask.length + "枚を、このまま資料に使います", S.ask.length + " photo(s) not chosen yet will be used as they are", "将未选择的 " + S.ask.length + " 张照片直接使用", "Se usarán tal cual " + S.ask.length + " foto(s) sin decidir"));
        return;
      }
    } catch (e) { v97dkErr("useall", e); }
    return __ua97.apply(this, arguments);
  };
}
/* 21.96 の最終チェックの写真の行（日本語の文字の写真の言葉）は、日本語の文字だけが理由の写真に限る（ほかの理由の写真は v97dkPhCheck で出す） */
if (typeof v96dkPhUse === "function") {
  const __pu97 = v96dkPhUse;
  v96dkPhUse = function (deck, T) {
    const st0 = v96dkPhSt;
    try { v96dkPhSt = function (o) { return v97dkNonJp(o) ? "good" : st0.apply(this, arguments); }; return __pu97.apply(this, arguments); }
    catch (e) { v97dkErr("phuse", e); return { use: [], ask: [], no: [] }; }
    finally { v96dkPhSt = st0; }
  };
}
/* 「ISO 13485」のように番号の前に空白がある規格・認証の番号を、数字として数えない（「ISO13485」と同じに）。
   前：英語の文の「ISO 13485」の 13485 が「根拠に無い数字」と判定されて外れ（No.533 の C・E の外した文言）、
   訳でも「ISO13485証明書」→「ISO 13485 Certificate」が「数字が変わった」とされて日本語のまま戻っていた（No.532） */
const V97DK_STDNUM = /\b(ISO|IEC|JIS|EN|ASTM|FSSC|DIN|ANSI|UL|KS|GB|NSF|IATF|OHSAS)\s*[-‐]?\s*([A-Z]\s+)?(\d{2,6})\b/g;
if (typeof dk3NumsIn === "function") {
  const __ni97 = dk3NumsIn;
  dk3NumsIn = function (s, lang) {
    try {
      const t = String(s == null ? "" : s);
      if (/\b(ISO|IEC|JIS|EN|ASTM|FSSC|DIN|ANSI|UL|KS|GB|NSF|IATF|OHSAS)\s*[-‐]?\s*([A-Z]\s+)?\d/.test(t)) {
        const u = t.replace(V97DK_STDNUM, (m, a, b, d) => (a === "EN" && /^(19|20)\d\d$/.test(d)) ? m : a + (b ? b.trim() : "") + d);
        if (u !== t) { v97dkN("stdnum"); return __ni97.call(this, u, lang); }
      }
    } catch (e) { v97dkErr("nums", e); }
    return __ni97.apply(this, arguments);
  };
}
/* 図や文字が中心と判定された写真も、使うと決めたら商品写真として扱う（21.96 は日本語の文字のときだけ） */
if (typeof dk3Role === "function") {
  const __ro97 = dk3Role;
  dk3Role = function (o) {
    const r = __ro97.apply(this, arguments);
    try { if (r === "infographic" && o && v97dkDecOf(o) === "use") return "product"; } catch (e) { }
    return r;
  };
}
/* 理由の言葉 */
function v97dkWhyTx(o, k) {
  try {
    const q = (typeof dkImgLocalQ === "function") ? (dkImgLocalQ(o) || {}) : {};
    const rs = String((o && o._dq && o._dq.reason) || "").slice(0, 40);
    switch (k) {
      case "jp": return v97dkM("画像の中の日本語の文字が目立つ", "Japanese text stands out in the image", "图片中的日文文字显眼", "destaca texto en japonés");
      case "low": return v97dkM("ぼやけている・不鮮明", "blurry or unclear", "模糊不清", "borrosa o poco nítida");
      case "ng": return v97dkM("AI が商品写真に向かないと判定" + (rs ? "（" + rs + "）" : ""), "the AI judged it unsuitable as a product photo" + (rs ? " (" + rs + ")" : ""), "AI 判定不适合作商品照片" + (rs ? "（" + rs + "）" : ""), "la IA la consideró poco adecuada" + (rs ? " (" + rs + ")" : ""));
      case "small": return v97dkM("小さい（短い辺 " + Math.min(q.w || 0, q.h || 0) + "px・420px 以上で鮮明）", "small (shorter side " + Math.min(q.w || 0, q.h || 0) + "px; 420px or more looks sharp)", "尺寸小（短边 " + Math.min(q.w || 0, q.h || 0) + "px，420px 以上才清晰）", "pequeña (lado corto " + Math.min(q.w || 0, q.h || 0) + " px; 420 px o más se ve nítida)");
      case "ratio": return v97dkM("横長・縦長すぎる（バナーの形）", "too wide or too tall (banner shape)", "过宽或过高（横幅形状）", "demasiado ancha o alta (forma de banner)");
      case "info": return v97dkM("図・文字が中心の画像", "mainly a diagram or text", "以图表或文字为主的图片", "sobre todo un diagrama o texto");
    }
  } catch (e) { v97dkErr("whytx", e); }
  return k;
}
function v97dkWhyJa(o, k) {
  const q = (typeof dkImgLocalQ === "function") ? (dkImgLocalQ(o) || {}) : {};
  return ({ jp: "日本語の文字", low: "ぼやけ", ng: "AI の判定", small: "小さい（短い辺 " + Math.min(q.w || 0, q.h || 0) + "px）", ratio: "横長・縦長", info: "図・文字が中心" })[k] || k;
}
function v97dkWhyAll(o) { return v97dkWhyKeys(o).map(k => v97dkWhyTx(o, k)).join(v97dkM("・", ", ", "・", ", ")); }
function v97dkWhyAllJa(o) { return v97dkWhyKeys(o).map(k => v97dkWhyJa(o, k)).join("・"); }
const V97DK_HINT = {
  jp: ["文字の写っていない写真に替えるか、「切り取る・隠す」で文字の所を外せます", "Replace it with a photo without text, or remove the text with “Crop or hide”", "可换成没有文字的照片，或用“裁剪或遮住”去掉文字", "Cámbiela por una foto sin texto o quite el texto con «Recortar u ocultar»"],
  low: ["ピントの合った明るい写真に替えると、資料が鮮明になります", "A sharper, brighter photo makes the deck look better", "换成对焦清晰、明亮的照片，资料会更清晰", "Una foto más nítida y luminosa mejora la presentación"],
  ng: ["商品がはっきり大きく写った写真がおすすめです", "A photo where the product is large and clear is recommended", "建议使用商品清晰且较大的照片", "Se recomienda una foto con el producto grande y claro"],
  small: ["このまま使うと、大きく引き伸ばしたページがぼやけます。元の大きさの写真に替えると鮮明です", "Used as it is, enlarged pages may look blurry. The original-size photo looks sharper", "直接使用时，放大的页面可能模糊。换成原始尺寸的照片更清晰", "Si se usa tal cual, las páginas ampliadas pueden verse borrosas. La foto original se ve más nítida"],
  ratio: ["「切り取る」で商品の所だけにすると、ふつうの形になります", "“Crop” to the product makes it a normal shape", "用“裁剪”只保留商品部分即可变成普通形状", "Con «Recortar» al producto tendrá una forma normal"],
  info: ["図や文字のページの代わりに、商品そのものの写真がおすすめです", "A photo of the product itself is recommended instead of a diagram", "建议用商品本身的照片代替图表", "Se recomienda una foto del propio producto en lugar de un diagrama"]
};
function v97dkHint(o) { const k = v97dkWhyKeys(o)[0]; const a = V97DK_HINT[k]; return a ? v97dkM(a[0], a[1], a[2], a[3]) : ""; }
/* 21.96 の文言（日本語の文字の写真）に合わせて書いていた理由の行を、理由ごとの言葉に */
if (typeof v96dkWhy === "function") {
  const __wy97 = v96dkWhy;
  v96dkWhy = function (o) {
    try { const ks = v97dkWhyKeys(o); if (ks.length && !(ks.length === 1 && ks[0] === "jp")) return v97dkM("外れる理由：", "Why it is left out: ", "未使用的原因：", "Motivo: ") + v97dkWhyAll(o); } catch (e) { v97dkErr("wy", e); }
    return __wy97.apply(this, arguments);
  };
}
/* 写真を選ぶ箱（写真の欄の下・作る前に選ぶ画面）。21.96 の箱を、理由のある写真すべてに広げる */
function v97dkRowHtml(x) {
  const o = x.o, i = x.i, st = x.st;
  const nm = (typeof v96dkPhNm === "function") ? v96dkPhNm(i) : ("#" + (i + 1));
  const ed = !!o.v96edit;
  const ks = v97dkWhyKeys(o);
  const jpOnly = ks.length === 1 && ks[0] === "jp";
  const stTx = st === "jpAsk" ? v97dkM("まだ選んでいません（このままでは資料に入りません）", "Not chosen yet (it is not in the deck until you choose)", "尚未选择（选择前不会放入资料）", "Sin decidir (no entra en la presentación hasta que elija)")
    : st === "jpUse" ? (ed ? v97dkM("✓ 加工して使います（資料に入ります）", "✓ Edited and used (it goes into the deck)", "✓ 已编辑并使用（放入资料）", "✓ Editada y en uso (entra en la presentación)") : v97dkM("✓ このまま使います（資料に入ります）", "✓ Used as it is (it goes into the deck)", "✓ 直接使用（放入资料）", "✓ Se usa tal cual (entra en la presentación)"))
    : st === "jpNo" ? v97dkM("使いません（資料に入りません）", "Not used (it is not in the deck)", "不使用（不放入资料）", "No se usa (no entra en la presentación)")
    : v97dkM("✓ 使えます", "✓ Usable", "✓ 可用", "✓ Utilizable");
  const B = (act, lb, cls) => `<button type="button" class="btn ${cls || "g"} v96dk-b" data-v96dkjp="${act}" data-v96dki="${i}">${v97dkE(lb)}</button>`;
  const bUse = B("use", v97dkM("✓ このまま使う", "✓ Use as it is", "✓ 直接使用", "✓ Usar tal cual"), st === "jpAsk" ? "" : "g");
  const bEd = B("edit", jpOnly ? v97dkM("✂ 文字の所を切り取る・隠す", "✂ Crop or hide the text", "✂ 裁剪或遮住文字", "✂ Recortar u ocultar el texto") : v97dkM("✂ 切り取る・隠す", "✂ Crop or hide", "✂ 裁剪或遮住", "✂ Recortar u ocultar"));
  const bRep = B("rep", v97dkM("⇄ 差し替える", "⇄ Replace", "⇄ 替换", "⇄ Sustituir"));
  const bNo = B("no", v97dkM("使わない", "Don't use", "不使用", "No usar"));
  const bBack = B("clear", v97dkM("選び直す", "Choose again", "重新选择", "Elegir de nuevo"));
  const bUndo = o.v96orig ? B("undo", v97dkM("↩ 加工の前に戻す", "↩ Undo the edit", "↩ 撤销编辑", "↩ Deshacer la edición")) : "";
  const btns = st === "jpAsk" ? bUse + bEd + bRep + bNo
    : st === "jpUse" ? bEd + bRep + (ed ? "" : bNo) + bUndo + (ed ? "" : bBack)
    : st === "jpNo" ? B("use", v97dkM("✓ やっぱり使う", "✓ Use it after all", "✓ 还是使用", "✓ Usarla")) + bEd + bRep
    : bEd + bRep + bUndo;
  const why = ks.length ? (jpOnly && typeof v96dkWhy === "function" ? v96dkWhy(o) : v97dkM("外れる理由：", "Why it is left out: ", "未使用的原因：", "Motivo: ") + v97dkWhyAll(o)) : (ed ? v97dkM("加工しました", "Edited", "已编辑", "Editada") : "");
  const hint = st === "jpAsk" ? v97dkHint(o) : "";
  const img = `<img class="v96dk-jpimg" src="data:${v97dkE(o.mime || "image/jpeg")};base64,${o.b64}" alt="${v97dkE(nm)}" loading="lazy">`;
  return `<li class="v96dk-jprow" data-v96dkst="${st}" data-v97dkwhy="${v97dkE(ks.join(" "))}">${img}<div class="v96dk-jptx"><b>${v97dkE(nm)}</b><span class="v96dk-jpwhy">${v97dkE(why)}</span>` +
    `${hint ? `<span class="v97dk-hint">${v97dkE(hint)}</span>` : ""}<span class="v96dk-jpst v96dk-st-${st}">${v97dkE(stTx)}</span></div><div class="v96dk-jpbtns">${btns}</div></li>`;
}
if (typeof v96dkPanelHtml === "function") {
  const __pn97 = v96dkPanelHtml;
  v96dkPanelHtml = function (T, mode) {
    try {
      if (!T || typeof v96dkPhSum !== "function") return __pn97.apply(this, arguments);
      const S = v96dkPhSum(T);
      const rows = S.L.filter(x => x.st === "jpAsk" || x.st === "jpUse" || x.st === "jpNo" || (x.o && x.o.v96edit));
      if (!rows.length) return "";
      const allJp = rows.every(x => { const k = v97dkWhyKeys(x.o); return !k.length || (k.length === 1 && k[0] === "jp"); });
      if (allJp) return __pn97.apply(this, arguments); /* 日本語の文字だけ：21.96 の箱のまま（同じ見た目・同じ言葉） */
      const ai = typeof ppReady === "function" && ppReady() && typeof dkImgAudit === "function";
      const n = rows.length;
      const head = mode === "ask" ? v97dkM("📷 写真を選んでから営業資料を作ります", "📷 Choose the photos before making the deck", "📷 选择照片后再制作资料", "📷 Elija las fotos antes de crear la presentación")
        : v97dkM("📷 資料に入れるか選べる写真：" + n + "枚", "📷 Photos you can choose to use: " + n, "📷 可选择是否使用的照片：" + n + " 张", "📷 Fotos que puede decidir usar: " + n);
      const lead = v97dkM("日本語の文字・ぼやけ・大きさ・形・AI の判定などの理由で、そのままでは資料に入れない写真です。<b>どの写真も、使うかどうかを選べます</b>（「このまま使う」「切り取る・隠す」を選ぶと資料に入ります。選ばない写真は入れず、最終チェックにお知らせします）。",
        "These photos are left out for a reason (Japanese text, blur, size, shape or the AI check). <b>You can choose for every photo</b> (“Use as it is” or “Crop or hide” puts it in the deck; photos you do not choose are left out and listed in the final check).",
        "这些照片因日文文字、模糊、尺寸、形状或 AI 判定等原因暂未放入资料。<b>每张照片都可以选择是否使用</b>（选择“直接使用”或“裁剪或遮住”即放入资料；未选择的不放入，并在最终检查中提示）。",
        "Estas fotos quedan fuera por un motivo (texto en japonés, desenfoque, tamaño, forma o la revisión de IA). <b>Puede decidir para cada foto</b> («Usar tal cual» o «Recortar u ocultar» la incluye; las que no elija quedan fuera y se indican en la revisión final).");
      const cnt = v97dkM("いま資料に使える写真：<b>" + S.good + "枚</b>（必要 " + S.need + "枚以上）", "Photos usable in the deck now: <b>" + S.good + "</b> (" + S.need + " or more needed)", "目前可用于资料的照片：<b>" + S.good + " 张</b>（需要 " + S.need + " 张以上）", "Fotos utilizables ahora: <b>" + S.good + "</b> (se necesitan " + S.need + " o más)");
      const askN = S.ask.length;
      const bulk = (askN ? `<button type="button" class="btn v96dk-b" data-v96dkjp="all">${v97dkE(v97dkM("まだ選んでいない " + askN + "枚を、このまま使う", "Use the " + askN + " photo(s) not chosen yet as they are", "将未选择的 " + askN + " 张直接使用", "Usar tal cual las " + askN + " foto(s) sin decidir"))}</button>` : "") +
        (ai && S.L.some(x => (x.st === "jpAsk" || x.st === "jpNo") && x.o && x.o._dq && (x.o._dq.jp || x.o._dq.ok === false || x.o._dq.low)) ? `<button type="button" class="btn g v96dk-b" data-v96dkjp="re">${v97dkE(v97dkM("AI にもう一度確かめてもらう", "Ask the AI to check again", "让 AI 重新检查", "Pedir a la IA que compruebe de nuevo"))}</button>` : "");
      const go = mode === "ask" ? `<div class="v96dk-askgo"><button type="button" class="btn v96dk-b" data-v96dkjp="go">${v97dkE(v97dkM("この写真で営業資料を作る", "Make the deck with these photos", "用这些照片制作资料", "Crear la presentación con estas fotos"))}</button><button type="button" class="btn g v96dk-b" data-v96dkjp="close">${v97dkE(v97dkM("閉じる", "Close", "关闭", "Cerrar"))}</button></div>` +
        `<p class="nn v96dk-asknote">${v97dkE(v97dkM("選ばずに作ると、資料に入る写真が足りず、納品版ではなく下書き（写真の枠が空き）になります。", "If you make the deck without choosing, there are not enough photos, so it becomes a draft (with empty photo frames) instead of the final version.", "如不选择就制作，照片不足，会成为草稿（照片框为空）而不是正式版。", "Si la crea sin elegir, faltan fotos y será un borrador (con marcos vacíos) en lugar de la versión final."))}<button type="button" class="v96dk-lnk" data-v96dkjp="gonp">${v97dkE(v97dkM("選ばずに作る", "Make it without choosing", "不选择直接制作", "Crear sin elegir"))}</button></p>` : "";
      v97dkN("panel");
      return `<div class="c v96dk-jp v97dk-ph${mode === "ask" ? " v96dk-ask" : ""}" data-v96dkjpbox="1" data-noi18n="1" role="region" aria-label="${v97dkE(head)}"><h3>${v97dkE(head)}</h3><p class="v96dk-lead">${lead}</p><p class="v96dk-cnt">${cnt}</p>` +
        `${bulk ? `<div class="v96dk-bulk">${bulk}</div>` : ""}<ul class="v96dk-jpl">${rows.map(v97dkRowHtml).join("")}</ul>${go}</div>`;
    } catch (e) { v97dkErr("panel", e); return __pn97.apply(this, arguments); }
  };
  try { if (V96DK) V96DK.panelHtml = v96dkPanelHtml; } catch (e) { }
}
/* 写真の欄の各写真の下の短い表示（理由ごとの言葉・選べること） */
if (typeof v96dkSlotFix === "function") {
  const __sf97 = v96dkSlotFix;
  v96dkSlotFix = function (h, T) {
    let out = __sf97.apply(this, arguments);
    try {
      const A = (T && T.assets) || {};
      out = String(out).replace(/(<p class="lbl" style="margin-bottom:5px">商品写真(\d+)<\/p>)([\s\S]*?)(data-dkup="ph\d+")/g, (m, a, n, mid, z) => {
        const o = (A.ph || [])[+n - 1]; const st = v96dkPhSt(o);
        const ks = v97dkWhyKeys(o);
        if (!ks.length || (ks.length === 1 && ks[0] === "jp")) return m;
        const w = v97dkWhyAllJa(o);
        if (st === "jpUse") mid = mid.replace(/✓ 納品品質(・✨補正済)?/, o.v96edit ? "✓ 加工して使う" : "✓ このまま使う（" + w + "）");
        else if (st === "jpAsk") mid = mid.replace("<br>表紙・品質判定から除外", "<br>使うか下で選べます");
        else if (st === "jpNo") mid = mid.replace("<br>表紙・品質判定から除外", "<br>使わない（選んだ）");
        return a + mid + z;
      });
    } catch (e) { v97dkErr("slot", e); }
    return out;
  };
}
/* 21.95 の「使えない写真の直し方」の箱：上の箱で選べる写真は出さない（同じ写真が2つの箱に出ない） */
if (typeof v95dkPhotoBad === "function") {
  const __pb97 = v95dkPhotoBad;
  v95dkPhotoBad = function (T) {
    const P = __pb97.apply(this, arguments);
    try {
      const A = (T && T.assets) || {};
      const all = (P.all || []).filter(x => { const st = v96dkPhSt((A.ph || [])[x.i]); return !(st === "jpAsk" || st === "jpUse" || st === "jpNo"); });
      return { all, jp: all.filter(x => x.k === "jp"), good: P.good };
    } catch (e) { v97dkErr("pbad", e); return P; }
  };
}
if (typeof v56deckPhWhy === "function") {
  const __pw97 = v56deckPhWhy;
  v56deckPhWhy = function (o) {
    try { const st = v96dkPhSt(o); const ks = v97dkWhyKeys(o); if (st === "jpAsk" && !(ks.length === 1 && ks[0] === "jp")) return v97dkWhyAllJa(o) + "（使うかどうかは「ロゴ・写真」の下で選べます）"; } catch (e) { }
    return __pw97.apply(this, arguments);
  };
}
/* 納品レベルチェックの写真の項目・作成の段の説明：理由ごとの言葉 */
if (typeof dk3Gate === "function") {
  const __gt97 = dk3Gate;
  dk3Gate = function () {
    const G = __gt97.apply(this, arguments);
    try {
      const p = (G || []).find(c => c && c.k === "photo");
      const T = v97dkTen();
      if (p && T && v97dkLang() === "ja" && typeof v96dkPhSum === "function") {
        const S = v96dkPhSum(T);
        const nonJp = S.ask.filter(x => { const k = v97dkWhyKeys(x.o); return !(k.length === 1 && k[0] === "jp"); });
        if (!p.ok && nonJp.length) {
          p.how = String(p.how || "").replace(/。日本語の文字が写っている写真が \d+枚あります：[^（]*（「ロゴ・写真」の欄の下）/, "") +
            "。理由があって外している写真が " + S.ask.length + "枚あります（" + S.ask.map(x => "商品写真" + (x.i + 1) + "：" + v97dkWhyAllJa(x.o)).join("／") + "）：「このまま使う」か「切り取る・隠す」を選ぶと数に入ります（「ロゴ・写真」の欄の下）";
        }
        if (S.use.some(x => v97dkNonJp(x.o))) p.how = String(p.how || "").replace(/（うち文字入りのまま使う写真 (\d+)枚）/, "（うち理由があって外していた写真をそのまま使う $1枚）");
      }
    } catch (e) { v97dkErr("gate", e); }
    return G;
  };
}
if (typeof dk3SetStep === "function") {
  const __ss97 = dk3SetStep;
  dk3SetStep = function (k, st, d) {
    const r = __ss97.apply(this, arguments);
    try {
      if (k === "mat" && st === "ok" && v97dkLang() === "ja" && typeof DK3G !== "undefined" && DK3G) {
        const s = (DK3G.steps || []).find(x => x && x.k === "mat");
        if (s && typeof s.d === "string" && s.d.indexOf("日本語の文字が写っている写真：") >= 0) {
          const S = v96dkPhSum(v97dkDeckT());
          const nonJp = S.L.some(x => (x.st === "jpAsk" || x.st === "jpUse") && !(v97dkWhyKeys(x.o).length === 1 && v97dkWhyKeys(x.o)[0] === "jp"));
          if (nonJp) { s.d = s.d.replace("日本語の文字が写っている写真：", "理由があって外していた写真：").replace("選んでいない ", "選んでいない "); if (typeof dk3Paint === "function") dk3Paint(); }
        }
      }
    } catch (e) { v97dkErr("step", e); }
    return r;
  };
}
/* 最終チェック：理由のある写真を、使った／選んでいない／使わないで出す（日本語の文字だけの写真は 21.96 の言葉のまま） */
function v97dkPhCheck(deck, T, r) {
  try {
    const prods = typeof dk3Prods === "function" ? dk3Prods(T) : [T];
    const where = {};
    (deck.slides || []).forEach((S, si) => (S.els || []).forEach(e => {
      if (!e || e.k !== "img" || e.m === "logo") return;
      const m = String(e.m).replace(/c$/, "").match(/^p(\d+):(\d+)$/); if (!m) return;
      const k = m[1] + ":" + m[2]; (where[k] = where[k] || new Set()).add(si + 1);
    }));
    const use = [], ask = [], no = [];
    prods.forEach((t, pi) => ((t && t.assets && t.assets.ph) || []).forEach((o, i) => {
      const ks = v97dkWhyKeys(o); if (!ks.length || (ks.length === 1 && ks[0] === "jp")) return;
      const st = v96dkPhSt(o);
      const nm = (prods.length > 1 && pi ? "「" + String((t && t.item) || "").slice(0, 16) + "」の" : "") + "商品写真" + (i + 1) + "（" + v97dkWhyAllJa(o) + "）";
      const w = where[pi + ":" + i];
      if (st === "jpUse" && w && !o.v96edit) use.push({ nm, sl: [...w] });
      else if (st === "jpAsk") ask.push({ nm });
      else if (st === "jpNo") no.push({ nm });
    }));
    if (use.length) r.warn.push({ k: "v97phuse", t: "理由があって外していた写真（" + use.map(x => x.nm).join("・") + "）を、選んだとおりそのまま使っています（" + [...new Set(use.flatMap(x => x.sl))].sort((a, b) => a - b).join("・") + "枚目）。替えるときは「ロゴ・写真」で" });
    if (ask.length) r.warn.push({ k: "v97phask", t: "使うかどうかを選んでいない写真 " + ask.length + "枚（" + ask.map(x => x.nm).join("・") + "）は、資料に入れていません。「ロゴ・写真」の欄の下で選べます" });
    if (no.length) r.ok.push("使わないと選んだ写真 " + no.length + "枚（" + no.map(x => x.nm).join("・") + "）は入れていません");
    V97DK.ph = { use: use.length, ask: ask.length, no: no.length };
  } catch (e) { v97dkErr("phck", e); }
}

/* ══════════ No.532 外国語の資料に残った日本語 ══════════ */
/* 決まった訳語の表（長い語から当てる）。値は en／zhCN／zhTW／es／ko（ほかの言語は英語） */
const V97DK_TERMS = [
  ["原産地証明書", "Certificate of Origin", "原产地证明书", "原產地證明書", "Certificado de origen", "원산지 증명서"],
  ["特定原産地証明書", "EPA Certificate of Origin", "EPA原产地证明书", "EPA原產地證明書", "Certificado de origen EPA", "EPA 원산지 증명서"],
  ["衛生証明書", "Health Certificate", "卫生证书", "衛生證書", "Certificado sanitario", "위생 증명서"],
  ["植物検疫証明書", "Phytosanitary Certificate", "植物检疫证书", "植物檢疫證明書", "Certificado fitosanitario", "식물 검역 증명서"],
  ["自由販売証明書", "Certificate of Free Sale", "自由销售证书", "自由銷售證明書", "Certificado de libre venta", "자유판매증명서"],
  ["滅菌証明書", "Sterilization Certificate", "灭菌证书", "滅菌證明書", "Certificado de esterilización", "멸균 증명서"],
  ["検査証明書", "Inspection Certificate", "检验证书", "檢驗證明書", "Certificado de inspección", "검사 증명서"],
  ["分析証明書", "Certificate of Analysis", "分析证书", "分析證明書", "Certificado de análisis", "분석 증명서"],
  ["成分分析表", "Composition Analysis Report", "成分分析表", "成分分析表", "Informe de análisis de composición", "성분 분석표"],
  ["試験成績書", "Test Report", "测试报告", "測試報告", "Informe de ensayo", "시험 성적서"],
  ["検査成績書", "Inspection Report", "检验报告", "檢驗報告", "Informe de inspección", "검사 성적서"],
  ["製品規格書", "Product Specification Sheet", "产品规格书", "產品規格書", "Ficha de especificaciones", "제품 사양서"],
  ["規格書", "Specification Sheet", "规格书", "規格書", "Ficha de especificaciones", "사양서"],
  ["安全データシート", "Safety Data Sheet (SDS)", "安全数据表 (SDS)", "安全資料表 (SDS)", "Hoja de datos de seguridad (SDS)", "안전보건자료 (SDS)"],
  ["適合宣言書", "Declaration of Conformity", "符合性声明", "符合性聲明", "Declaración de conformidad", "적합성 선언서"],
  ["輸出抹消仮登録証明書", "Export Certificate (Temporary Deregistration)", "出口注销临时登记证明", "出口註銷臨時登記證明", "Certificado de baja temporal para exportación", "수출 말소 임시등록 증명서"],
  ["第三者検査証明書", "Third-party Inspection Certificate", "第三方检验证书", "第三方檢驗證明書", "Certificado de inspección de terceros", "제3자 검사 증명서"],
  ["船荷証券", "Bill of Lading (B/L)", "提单 (B/L)", "提單 (B/L)", "Conocimiento de embarque (B/L)", "선하증권 (B/L)"],
  ["パッキングリスト", "Packing List", "装箱单", "裝箱單", "Lista de empaque", "포장명세서"],
  ["インボイス", "Commercial Invoice", "商业发票", "商業發票", "Factura comercial", "상업송장"],
  ["保険証券", "Insurance Policy", "保险单", "保險單", "Póliza de seguro", "보험증권"],
  ["輸出許可書", "Export Permit", "出口许可证", "出口許可證", "Permiso de exportación", "수출허가서"],
  ["取扱説明書", "Instruction Manual", "使用说明书", "使用說明書", "Manual de instrucciones", "취급설명서"],
  ["証明書提出可", "certificate available on request", "可提供证书", "可提供證書", "certificado disponible bajo pedido", "증명서 제출 가능"],
  ["証明書", "Certificate", "证书", "證書", "Certificado", "증명서"],
  ["認証工場", "certified factory", "认证工厂", "認證工廠", "fábrica certificada", "인증 공장"],
  ["認証取得", "certified", "已认证", "已認證", "certificado", "인증 취득"],
  ["取得済み", "obtained", "已取得", "已取得", "obtenido", "취득 완료"],
  ["取得済", "obtained", "已取得", "已取得", "obtenido", "취득 완료"],
  ["認証", "certification", "认证", "認證", "certificación", "인증"],
  ["医療機器登録", "medical device registration", "医疗器械注册", "醫療器材登錄", "registro de dispositivo médico", "의료기기 등록"],
  ["一般医療機器", "general medical device", "一般医疗器械", "一般醫療器材", "dispositivo médico general", "일반 의료기기"],
  ["医療機器", "medical device", "医疗器械", "醫療器材", "dispositivo médico", "의료기기"],
  ["食品施設登録", "Food Facility Registration", "食品设施注册", "食品設施登錄", "registro de instalación alimentaria", "식품시설 등록"],
  ["製品登録", "product registration", "产品注册", "產品登錄", "registro del producto", "제품 등록"],
  ["保健省", "Ministry of Health", "卫生部", "衛生部", "Ministerio de Salud", "보건부"],
  ["届出", "notification", "备案", "備案", "notificación", "신고"],
  ["登録", "registration", "注册", "登錄", "registro", "등록"],
  ["輸入者", "importer", "进口商", "進口商", "importador", "수입자"],
  ["ライセンス", "license", "许可证", "許可證", "licencia", "라이선스"],
  ["ラベル承認", "label approval", "标签审批", "標籤審批", "aprobación de etiqueta", "라벨 승인"],
  ["アラビア語表示", "Arabic labeling", "阿拉伯语标签", "阿拉伯語標示", "etiquetado en árabe", "아랍어 표시"],
  ["繁体字表示", "Traditional Chinese labeling", "繁体字标签", "繁體字標示", "etiquetado en chino tradicional", "번체자 표시"],
  ["現地語表示", "local-language labeling", "当地语言标签", "當地語言標示", "etiquetado en idioma local", "현지어 표시"],
  ["現地語", "local language", "当地语言", "當地語言", "idioma local", "현지어"],
  ["表示", "labeling", "标签", "標示", "etiquetado", "표시"],
  ["該当品", "if applicable", "如适用", "如適用", "si corresponde", "해당 제품"],
  ["該当する場合", "if applicable", "如适用", "如適用", "si corresponde", "해당하는 경우"],
  ["要確認", "to be confirmed", "待确认", "待確認", "por confirmar", "확인 필요"],
  ["国により", "depending on the country", "因国家而异", "依國家而異", "según el país", "국가에 따라"],
  ["自社工場", "own factory", "自有工厂", "自有工廠", "fábrica propia", "자사 공장"],
  ["工場", "factory", "工厂", "工廠", "fábrica", "공장"],
  ["製造から", "from manufacture", "自生产之日起", "自生產之日起", "desde la fabricación", "제조일로부터"],
  ["受注後", "after order", "接单后", "接單後", "tras el pedido", "수주 후"],
  ["有効期限", "shelf life", "有效期", "有效期", "vida útil", "유효기간"],
  ["賞味期限", "best-before period", "保质期", "保存期限", "consumo preferente", "유통기한"],
  ["常温", "ambient temperature", "常温", "常溫", "temperatura ambiente", "상온"],
  ["冷蔵", "chilled", "冷藏", "冷藏", "refrigerado", "냉장"],
  ["冷凍", "frozen", "冷冻", "冷凍", "congelado", "냉동"],
  ["税抜", "excl. tax", "不含税", "未稅", "sin impuestos", "세금 별도"],
  ["税込", "incl. tax", "含税", "含稅", "con impuestos", "세금 포함"],
  ["以上", " or more", "以上", "以上", " o más", " 이상"],
  ["未満", " or less (exclusive)", "未满", "未滿", " menos de", " 미만"],
  ["以下", " or less", "以下", "以下", " o menos", " 이하"],
  ["外装カートン", "outer carton", "外箱", "外箱", "caja exterior", "외장 카톤"],
  ["パレット", "pallet", "托盘", "棧板", "palé", "팔레트"],
  ["カートン", "carton", "纸箱", "紙箱", "caja", "카톤"],
  ["ケース", "cases", "箱", "箱", "cajas", "케이스"],
  ["セット", "sets", "套", "套", "juegos", "세트"],
  ["クラス", "Class ", "类别", "類別", "Clase ", "클래스 "],
  ["証明書類", "certificates", "证书类", "證書類", "certificados", "증명서류"],
  ["提出可", "available on request", "可提供", "可提供", "disponible bajo pedido", "제출 가능"],
  ["相当", " equivalent", "相当", "相當", " equivalente", " 상당"],
  ["滅菌", "sterilization", "灭菌", "滅菌", "esterilización", "멸균"],
  ["単品", "single unit", "单品", "單品", "unidad", "단품"],
  ["個装", "individual pack", "单个包装", "單個包裝", "envase individual", "개별 포장"],
  ["内装", "inner pack", "内包装", "內包裝", "envase interior", "내장"],
  ["外装", "outer", "外包装", "外包裝", "exterior", "외장"],
  ["入数", "quantity per case", "入数", "入數", "unidades por caja", "입수"],
  ["対応可", "available", "可对应", "可對應", "disponible", "대응 가능"],
  ["対応", "supported", "支持", "支援", "disponible", "대응"],
  /* 化粧品の全成分表の見出しと配合目的（統合の確かめで、英語の資料の成分表に「配合率 · 配合目的」「溶剤」が残ったため足した） */
  ["表示名称（和名）", "Labeling name (Japanese)", "标示名称（日文）", "標示名稱（日文）", "Nombre de etiquetado (japonés)", "표시 명칭(일본어)"],
  ["表示名称", "Labeling name", "标示名称", "標示名稱", "Nombre de etiquetado", "표시 명칭"],
  ["配合目的", "Function", "配合目的", "配合目的", "Función", "배합 목적"],
  ["配合率", "Content (%)", "配比", "配比", "Contenido (%)", "배합률"],
  ["配合量", "Amount", "配合量", "配合量", "Cantidad", "배합량"],
  ["保湿剤", "Humectant", "保湿剂", "保濕劑", "Humectante", "보습제"],
  ["保湿", "Moisturizing", "保湿", "保濕", "Hidratante", "보습"],
  ["溶剤", "Solvent", "溶剂", "溶劑", "Disolvente", "용제"],
  ["整肌", "Skin conditioning", "调理肌肤", "調理肌膚", "Acondicionador de la piel", "피부 컨디셔닝"],
  ["エモリエント剤", "Emollient", "润肤剂", "潤膚劑", "Emoliente", "에몰리언트"],
  ["エモリエント", "Emollient", "润肤剂", "潤膚劑", "Emoliente", "에몰리언트"],
  ["防腐剤", "Preservative", "防腐剂", "防腐劑", "Conservante", "방부제"],
  ["防腐", "Preservative", "防腐", "防腐", "Conservante", "방부"],
  ["増粘剤", "Thickener", "增稠剂", "增稠劑", "Espesante", "증점제"],
  ["乳化剤", "Emulsifier", "乳化剂", "乳化劑", "Emulsionante", "유화제"],
  ["界面活性剤", "Surfactant", "表面活性剂", "界面活性劑", "Tensioactivo", "계면활성제"],
  ["酸化防止剤", "Antioxidant", "抗氧化剂", "抗氧化劑", "Antioxidante", "산화 방지제"],
  ["キレート剤", "Chelating agent", "螯合剂", "螯合劑", "Agente quelante", "킬레이트제"],
  ["pH調整剤", "pH adjuster", "pH调节剂", "pH調節劑", "Regulador de pH", "pH 조정제"],
  ["香料", "Fragrance", "香料", "香料", "Fragancia", "향료"],
  ["着色剤", "Colorant", "着色剂", "著色劑", "Colorante", "착색제"],
  ["紫外線吸収剤", "UV absorber", "紫外线吸收剂", "紫外線吸收劑", "Absorbente UV", "자외선 흡수제"],
  ["皮膜形成剤", "Film former", "成膜剂", "成膜劑", "Formador de película", "피막 형성제"],
  ["美容成分", "Active ingredient", "美容成分", "美容成分", "Ingrediente activo", "미용 성분"],
  ["安定剤", "Stabilizer", "稳定剂", "穩定劑", "Estabilizante", "안정제"],
  ["基剤", "Base", "基质", "基質", "Base", "기제"],
  /* 規制のひな形・表の見出しでよく残る語（訳の AI が原文のまま返したときの備え） */
  ["全成分表", "Full ingredient list", "全成分表", "全成分表", "Lista completa de ingredientes", "전성분표"],
  ["英語ラベル", "English label", "英文标签", "英文標籤", "Etiqueta en inglés", "영문 라벨"],
  ["繁体字ラベル", "Traditional Chinese label", "繁体中文标签", "繁體中文標籤", "Etiqueta en chino tradicional", "번체 중국어 라벨"],
  ["簡体字ラベル", "Simplified Chinese label", "简体中文标签", "簡體中文標籤", "Etiqueta en chino simplificado", "간체 중국어 라벨"],
  ["中国語ラベル", "Chinese label", "中文标签", "中文標籤", "Etiqueta en chino", "중국어 라벨"],
  ["化粧品製造販売業許可", "Cosmetics manufacturing & marketing license", "化妆品制造销售业许可", "化妝品製造販售業許可", "Licencia de fabricación y comercialización de cosméticos", "화장품 제조판매업 허가"],
  ["化粧品製品登録", "Cosmetic product registration", "化妆品产品注册", "化妝品產品登錄", "Registro de producto cosmético", "화장품 제품 등록"],
  ["化粧品届出", "Cosmetic notification", "化妆品备案", "化妝品備案", "Notificación de cosméticos", "화장품 신고"],
  ["製品情報ファイル", "Product Information File", "产品信息文件", "產品資訊檔案", "Expediente de información del producto", "제품 정보 파일"],
  ["施設登録", "Facility registration", "设施注册", "設施登錄", "Registro de instalaciones", "시설 등록"],
  ["製品リスティング", "Product listing", "产品列名", "產品列名", "Listado de productos", "제품 리스팅"],
  ["数量帯", "Quantity band", "数量区间", "數量區間", "Tramo de cantidad", "수량 구간"],
  ["寸法・重量", "Dimensions / weight", "尺寸・重量", "尺寸・重量", "Dimensiones / peso", "치수 / 중량"],
  ["梱包・入数", "Packing / quantity per case", "包装・入数", "包裝・入數", "Embalaje / unidades por caja", "포장 / 입수"],
  ["単価", "Unit price", "单价", "單價", "Precio unitario", "단가"],
  ["項目", "Item", "项目", "項目", "Concepto", "항목"],
  ["内容", "Details", "内容", "內容", "Detalle", "내용"],
  ["準拠", "compliant", "准据", "準據", "conforme", "준거"],
  /* 日本の港・空港（建値の「FOB 東京港」など） */
  ["東京港", "Port of Tokyo", "东京港", "東京港", "Puerto de Tokio", "도쿄항"],
  ["横浜港", "Port of Yokohama", "横滨港", "橫濱港", "Puerto de Yokohama", "요코하마항"],
  ["名古屋港", "Port of Nagoya", "名古屋港", "名古屋港", "Puerto de Nagoya", "나고야항"],
  ["大阪港", "Port of Osaka", "大阪港", "大阪港", "Puerto de Osaka", "오사카항"],
  ["神戸港", "Port of Kobe", "神户港", "神戶港", "Puerto de Kobe", "고베항"],
  ["博多港", "Port of Hakata", "博多港", "博多港", "Puerto de Hakata", "하카타항"],
  ["成田空港", "Narita Airport", "成田机场", "成田機場", "Aeropuerto de Narita", "나리타 공항"],
  ["羽田空港", "Haneda Airport", "羽田机场", "羽田機場", "Aeropuerto de Haneda", "하네다 공항"],
  ["関西国際空港", "Kansai International Airport", "关西国际机场", "關西國際機場", "Aeropuerto Internacional de Kansai", "간사이 국제공항"],
  ["関西空港", "Kansai Airport", "关西机场", "關西機場", "Aeropuerto de Kansai", "간사이 공항"],
  ["東京", "Tokyo", "东京", "東京", "Tokio", "도쿄"],
  ["横浜", "Yokohama", "横滨", "橫濱", "Yokohama", "요코하마"],
  ["名古屋", "Nagoya", "名古屋", "名古屋", "Nagoya", "나고야"],
  ["大阪", "Osaka", "大阪", "大阪", "Osaka", "오사카"],
  ["神戸", "Kobe", "神户", "神戶", "Kobe", "고베"]
];
/* 数のあとの単位・期間（数字は変えない） */
const V97DK_UNITS = [
  [/(\d)\s*(?:ヶ|か|カ|箇)月/g, { en: "$1 months", zhCN: "$1个月", zhTW: "$1個月", es: "$1 meses", ko: "$1개월" }],
  [/(\d{4})\s*年\s*(\d{1,2})\s*月/g, { en: "$2/$1", zhCN: "$1年$2月", zhTW: "$1年$2月", es: "$2/$1", ko: "$1년 $2월" }],
  [/(\b1[89]\d\d|\b20\d\d)\s*年/g, { en: "$1", zhCN: "$1年", zhTW: "$1年", es: "$1", ko: "$1년" }],
  [/(\d{1,3})\s*年/g, { en: "$1 years", zhCN: "$1年", zhTW: "$1年", es: "$1 años", ko: "$1년" }],
  [/(\d)\s*日/g, { en: "$1 days", zhCN: "$1天", zhTW: "$1天", es: "$1 días", ko: "$1일" }],
  [/(\d)\s*個/g, { en: "$1 pcs", zhCN: "$1个", zhTW: "$1個", es: "$1 uds.", ko: "$1개" }],
  [/(\d)\s*枚/g, { en: "$1 sheets", zhCN: "$1张", zhTW: "$1張", es: "$1 hojas", ko: "$1매" }],
  [/(\d)\s*巻/g, { en: "$1 rolls", zhCN: "$1卷", zhTW: "$1卷", es: "$1 rollos", ko: "$1롤" }],
  [/(\d)\s*本/g, { en: "$1 bottles", zhCN: "$1瓶", zhTW: "$1瓶", es: "$1 botellas", ko: "$1병" }],
  [/(\d)\s*袋/g, { en: "$1 bags", zhCN: "$1袋", zhTW: "$1袋", es: "$1 bolsas", ko: "$1봉" }],
  [/(\d)\s*箱/g, { en: "$1 boxes", zhCN: "$1箱", zhTW: "$1箱", es: "$1 cajas", ko: "$1상자" }],
  [/(\d)\s*台/g, { en: "$1 units", zhCN: "$1台", zhTW: "$1台", es: "$1 unidades", ko: "$1대" }],
  [/(\d)\s*入り?/g, { en: "$1 per case", zhCN: "$1入", zhTW: "$1入", es: "$1 por caja", ko: "$1입" }]
];
function v97dkTermCol(lang) { return /^zh(TW|HK)/.test(lang) ? 3 : /^zh/.test(lang) ? 2 : /^es/.test(lang) ? 4 : /^ko/.test(lang) ? 5 : 1; }
function v97dkUnitKey(lang) { return /^zh(TW|HK)/.test(lang) ? "zhTW" : /^zh/.test(lang) ? "zhCN" : /^es/.test(lang) ? "es" : /^ko/.test(lang) ? "ko" : "en"; }
/* 外国語の資料に残った日本語か（中国語の資料は、日本の漢字の書類名も） */
const V97DK_ZHJP = /証明書|検査|認証|登録|届出|該当|取得済|規格書|成績書|梱包|入数|外装|滅菌|医療機器/;
function v97dkJpRes(lang, s) {
  s = String(s == null ? "" : s);
  if (!s || !lang || lang === "ja") return false;
  try { if (typeof dk3JPfor === "function" && dk3JPfor(lang, s)) return true; } catch (e) { }
  if (/^zh/.test(lang)) return /[ぁ-ゖァ-ヺ]/.test(s) || V97DK_ZHJP.test(s);
  return /[ぁ-ゖァ-ヺ一-龯々〆]/.test(s);
}
V97DK.jpRes = v97dkJpRes;
/* 決まった訳語で直す。直せない（日本語が残る・数字が変わる）ときは null */
function v97dkTermFix(s, lang) {
  try {
    s = String(s == null ? "" : s);
    if (!v97dkJpRes(lang, s)) return null;
    const col = v97dkTermCol(lang), uk = v97dkUnitKey(lang);
    const sp = !/^(zh|ko)/.test(lang);
    let x = s.normalize ? s.normalize("NFKC") : s;
    V97DK_UNITS.forEach(([re, to]) => { x = x.replace(re, to[uk] || to.en); });
    /* 国・地域の名前（アプリの国名の表） */
    try {
      if (typeof CTY_L !== "undefined" && CTY_L && /[ァ-ヺ一-龯]/.test(x)) {
        const li = (typeof CTY_LI !== "undefined" && CTY_LI) ? (CTY_LI[lang] != null ? CTY_LI[lang] : CTY_LI.en) : null;
        if (li != null) (V97DK.ctyKeys || (V97DK.ctyKeys = Object.keys(CTY_L).filter(k => /[ァ-ヺ一-龯]/.test(k) && k.length >= 2).sort((a, b) => b.length - a.length))).forEach(k => {
          if (x.indexOf(k) < 0) return; const v = (CTY_L[k] || [])[li]; if (!v || /[ぁ-ゖァ-ヺ]/.test(v)) return;
          x = x.split(k).join(sp ? " " + v + " " : v);
        });
      }
    } catch (e) { v97dkErr("cty", e); }
    (V97DK.termsSorted || (V97DK.termsSorted = V97DK_TERMS.slice().sort((a, b) => b[0].length - a[0].length))).forEach(r => {
      const ja = r[0], tr = r[col] || r[1];
      if (x.indexOf(ja) < 0) return;
      x = x.split(ja).join(sp ? " " + tr + " " : tr);
    });
    if (sp) {
      x = x.replace(/（/g, " (").replace(/）/g, ")").replace(/、/g, ", ").replace(/。/g, ". ").replace(/・/g, " / ").replace(/：/g, ": ").replace(/／/g, " / ").replace(/〜/g, "–");
      x = x.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").replace(/\s+([,.:;])/g, "$1").replace(/\s{2,}/g, " ").trim();
      /* ISO13485 → ISO 13485（番号は変えない） */
      x = x.replace(/\b(ISO|JIS|IEC|FSSC)(\d{3,6})\b/g, "$1 $2");
    }
    if (v97dkJpRes(lang, x)) return null;
    try { if (typeof dk3TrOk === "function" && dk3TrOk(s, x, lang)) return null; } catch (e) { return null; }
    return x;
  } catch (e) { v97dkErr("term", e); return null; }
}
V97DK.termFix = v97dkTermFix;
/* 訳したデータ（dk3DataTr の答え）の中の日本語を直す。原文に戻された値（fixed）も、訳語の表で直せれば直す */
function v97dkFixData(res, lang) {
  const log = [];
  try {
    if (!res || !res.d || !lang || lang === "ja") return log;
    const walk = (a, b, path) => {
      if (typeof b === "string") {
        if (!v97dkJpRes(lang, b)) return b;
        const src = typeof a === "string" ? a : b;
        const fx = v97dkTermFix(src, lang) || v97dkTermFix(b, lang);
        if (fx) { log.push({ path, a: b, b: fx }); return fx; }
        return b;
      }
      if (Array.isArray(b)) return b.map((x, i) => walk(Array.isArray(a) ? a[i] : undefined, x, path + "." + i));
      if (b && typeof b === "object") { const o = {}; Object.keys(b).forEach(k => { o[k] = walk(a && typeof a === "object" ? a[k] : undefined, b[k], path + "." + k); }); return o; }
      return b;
    };
    res.d = walk(res.src, res.d, "d");
    if (log.length && Array.isArray(res.fixed)) {
      const P = new Set(log.map(x => x.path));
      res.fixed = res.fixed.filter(f => !P.has(f.path));
    }
    if (log.length) { res.v97terms = log; v97dkN("dataTerms", log.length); }
  } catch (e) { v97dkErr("fixdata", e); }
  return log;
}
if (typeof dk3DataTr === "function") {
  const __dt97 = dk3DataTr;
  dk3DataTr = async function (lang, say, force, T) {
    const r = await __dt97.apply(this, arguments);
    try { if (r && r.d && !r.offline) v97dkFixData(r, lang); } catch (e) { v97dkErr("dt", e); }
    return r;
  };
}
/* 資料の文字（スライドの全部の文字）を見て、残った日本語を直す。直せなかった文は {si, t} で返す */
function v97dkElTxt(e) { try { return (e.ps || []).map(p => (p.r || []).map(r => String(r && r.t != null ? r.t : "")).join("")).join(" "); } catch (x) { return ""; } }
function v97dkRefit(e, deck) {
  try {
    if (typeof dk3TextHeight !== "function" || typeof DK3_SAFE === "undefined") return;
    delete e.mh;
    const h = dk3TextHeight(e, deck.lang, deck, e.w * DK3_SAFE);
    if (h > e.h + 3 && typeof dk3Fit === "function") dk3Fit(e, deck.lang, deck, 0.62); else e.mh = h;
  } catch (x) { v97dkErr("refit", x); }
}
function v97dkScanDeck(deck, fix) {
  const out = { fixed: [], left: [] };
  try {
    if (!deck || !deck.lang || deck.lang === "ja" || !Array.isArray(deck.slides)) return out;
    const lang = deck.lang;
    deck.slides.forEach((S, si) => (S && S.els || []).forEach(e => {
      if (!e || e.k !== "text" || e.v54 || e.name === "draft" || e.name === "v54draft") return;  /* 下書きの印（【未入力：〇〇】など）は社内向けの日本語のまま */
      let ch = false;
      (e.ps || []).forEach(p => (p.r || []).forEach(r => {
        if (!r || r.t == null) return;
        const t = String(r.t);
        if (!v97dkJpRes(lang, t)) return;
        const fx = fix ? v97dkTermFix(t, lang) : null;
        if (fx) { out.fixed.push({ si: si + 1, a: t, b: fx }); r.t = fx; ch = true; }
      }));
      if (ch) v97dkRefit(e, deck);
      const all = v97dkElTxt(e);
      if (v97dkJpRes(lang, all)) {
        const m = all.match(/[^\s]*[ぁ-ゖァ-ヺ一-龯々〆][^\n]{0,24}/);
        out.left.push({ si: si + 1, t: (m ? m[0] : all).trim().slice(0, 40), name: e.name || "" });
      }
    }));
  } catch (e) { v97dkErr("scan", e); }
  return out;
}
V97DK.scanDeck = v97dkScanDeck;
function v97dkJpReport(r, R, deck, opened) {
  try {
    if (!r || !R) return;
    r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
    if (R.fixed.length) r.ok.push((opened ? "この保存した資料の" : "") + "日本語のまま残っていた " + R.fixed.length + "か所を、決まった訳語に直しました（" + R.fixed.slice(0, 3).map(x => x.si + "枚目「" + String(x.a).slice(0, 24) + "」→「" + String(x.b).slice(0, 28) + "」").join("／") + (R.fixed.length > 3 ? " ほか" : "") + "）");
    if (R.left.length) {
      const pages = [...new Set(R.left.map(x => x.si))].sort((a, b) => a - b);
      const t = "外国語の資料に日本語が残っています（" + R.left.slice(0, 6).map(x => x.si + "枚目「" + x.t + "」").join("／") + (R.left.length > 6 ? " ほか " + (R.left.length - 6) + "か所" : "") + "）。この文の元の登録（商品情報・規制の画面の書類名など）を確かめるか、「↻ もう一度作る」を押してください。直るまで、納品版の PPTX・PDF・1枚の紹介シートは出せません";
      const i = r.crit.findIndex(c => c && c.k === "jp");
      const c = { k: "jp", t: (i >= 0 && r.crit[i] && r.crit[i].v5326k ? r.crit[i].t + "／" : "") + t, v97: 1, pages };
      if (i >= 0) r.crit[i] = Object.assign({}, r.crit[i], c); else r.crit.unshift(c);
      r.pass = false;
      r.score = Math.max(0, Math.min(+r.score || 0, 100 - r.crit.length * 18));
    } else {
      /* 直したことで残りが無くなった：前の段の「日本語が残っている」を外す */
      const i = r.crit.findIndex(c => c && c.k === "jp");
      if (i >= 0 && R.fixed.length) { r.crit.splice(i, 1); if (!r.ok.some(x => /^日本語の残り：なし/.test(String(x)))) r.ok.push("日本語の残り：なし"); r.pass = !r.crit.length; if (r.pass) r.score = Math.max(+r.score || 0, 100 - (r.warn || []).length * 5); }
    }
    V97DK.jp = { at: Date.now(), fixed: R.fixed.length, left: R.left.length, pages: [...new Set(R.left.map(x => x.si))] };
  } catch (e) { v97dkErr("jprep", e); }
}
/* 訳の依頼に、書類名・認証名を訳すことと、規格の番号に年版を足さないことを足す */
const V97DK_TRQ = /^次のJSONの値のうち日本語の部分だけを/;
const V97DK_TRRULE = "\n追加のルール：書類名・認証名・登録名も必ず訳す（例：ISO13485証明書＝ISO 13485 Certificate、滅菌証明書（該当品）＝Sterilization Certificate (if applicable)、原産地証明書＝Certificate of Origin）。規格・認証の番号に年版や枝番を足さない（ISO 13485 を ISO 13485:2016 にしない）。訳せない固有名詞はローマ字にする（日本語の文字を残さない）。\n";

/* ══════════ No.533 外した主張と同じ主張の文 ══════════ */
const V97DK_CERT = [
  ["haccp", /HACCP/i], ["gmp", /\bGMP\b|cGMP/i], ["organic", /organic|オーガニック|有機(?!溶剤|EL|物)|有机|orgánic/i], ["halal", /halal|ハラール|ハラル|清真/i],
  ["kosher", /kosher|コーシャ/i], ["fda", /\bFDA\b/i], ["ce", /\bCE\s?(mark|marking|marked|マーク)\b|CEマーク/i], ["patent", /patent|特許|专利|專利|patente/i],
  ["jas", /\bJAS\b/i], ["vegan", /vegan|ヴィーガン|ビーガン/i]
];
const V97DK_STRONG = /\b(ultra|extremely|exceptional(?:ly)?|unparalleled|superior|outstanding|best[- ]in[- ]class|industry[- ]leading|class[- ]leading|lowest|highest|minimal|unmatched|unrivall?ed|top[- ]class|world[- ]class|premium|record|revolutionary|perfect)\b|業界最|業界トップ|最高|最低|最小|圧倒的|極めて|類を見ない|世界最|最先端|行业领先|業界領先|极低|極低|超低|超高|最佳|líder|inigualable|excepcional/i;
const V97DK_FRAME = /拡大|最上級|一般化|比較|誇張|強い|言い過ぎ|唯一|順位|No\.?1|根拠より|断定|言い切|性能|水準|業界|exaggerat|overstat|superlativ/i;
function v97dkNumLab(txt, n) {
  try {
    const t = (typeof dk3NumNorm === "function") ? dk3NumNorm(txt) : String(txt);
    const esc = String(n.raw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = t.match(new RegExp(esc + "\\s?[%‰]?\\s?[A-Za-zμµ°℃/²³]{0,8}(?:/[A-Za-z]{1,4})?"));
    return (m ? m[0] : n.raw).trim();
  } catch (e) { return String(n.raw); }
}
/* 1つの文の主張の単位：num（単位つきの数・%・年数・順位）／id（ISO などの番号）／cert（認証）／sup（最上級の種類） */
function v97dkKeys(txt, lang) {
  const out = [];
  try {
    const t = String(txt || "");
    if (typeof dk3NumsIn === "function") {
      dk3NumsIn(t, lang || "en").forEach(n => {
        if (!n || n.k === "year" || n.k === "n" || n.k === "thing") return;
        const f = +(+n.full).toFixed(4);
        if (!isFinite(f)) return;
        out.push({ key: "num:" + n.k + "|" + f, kind: "num", n, lab: v97dkNumLab(t, n) });
        if (n.rank) out.push({ key: "rank|" + f, kind: "rank", n, lab: "No." + f });
      });
    }
    if (typeof dk3Ids === "function") dk3Ids(t).forEach(id => out.push({ key: "id:" + id, kind: "id", id, lab: String(id).replace(/^([A-Z]+)(\d)/, "$1 $2") }));
    V97DK_CERT.forEach(([k, re]) => { if (re.test(t)) out.push({ key: "cert:" + k, kind: "cert", lab: k.toUpperCase() === "ORGANIC" ? "organic" : k.toUpperCase() }); });
    if (typeof DK3_SUPF !== "undefined" && Array.isArray(DK3_SUPF)) DK3_SUPF.forEach((f, i) => { try { if (f[0].test(t)) out.push({ key: "sup:" + i, kind: "sup", i, lab: (t.match(f[0]) || [""])[0] }); } catch (e) { } });
  } catch (e) { v97dkErr("keys", e); }
  const seen = new Set();
  return out.filter(k => !seen.has(k.key) && seen.add(k.key));
}
V97DK.keys = v97dkKeys;
/* 根拠（登録の情報と資料＝C）にある主張か */
function v97dkSupported(K, C) {
  try {
    const N = C && C.N;
    if (!N) return false;
    if (K.kind === "num" || K.kind === "rank") return typeof dk3NumOk === "function" ? !!dk3NumOk(K.n, N) : false;
    if (K.kind === "id") return !!(N.ids && N.ids.has(K.id));
    if (K.kind === "cert") { const re = (V97DK_CERT.find(c => "cert:" + c[0] === K.key) || [])[1]; return !!(re && re.test(String(C.text || ""))); }
    if (K.kind === "sup") { const f = DK3_SUPF[K.i]; return !!(f && f[1].test(String(N.supTxt || C.text || ""))); }
  } catch (e) { v97dkErr("sup", e); }
  return false;
}
/* 外した理由から、ほかの文に広げる主張の種類を決める（数の上限・別の商品・返事なし・産地・効能は広げない） */
function v97dkWhyClass(why) {
  why = String(why || "");
  if (/2回まで|別の商品|含まれなかった|産地|所在地|医薬品的|同じ主張/.test(why)) return "";
  if (/^根拠に無い数字：/.test(why)) return "num";
  if (/根拠に無い最上級/.test(why)) return "sup";
  return "all";
}
function v97dkProp(r, lang, T) {
  const rep = { add: [], keep: [], keys: 0 };
  try {
    if (!r || !r.plan || !Array.isArray(r.dropped) || !r.dropped.length || typeof dk3Leaves !== "function" || typeof dk3Drop !== "function") return rep;
    const C = r.C || (typeof dk3Corpus === "function" ? dk3Corpus(T) : null);
    if (!C) return rep;
    r.dropped = r.dropped.map(d => Object.assign({}, d));  /* 前回の控え（キャッシュ）の中身は書き換えない */
    const bad = new Map(), weak = new Map();             /* bad＝根拠に無い主張／weak＝数字は根拠どおり・強い表現で外した */
    r.dropped.forEach(d => {
      const cls = v97dkWhyClass(d.why); if (!cls || !d.txt) return;
      let ks = v97dkKeys(d.txt, lang);
      if (cls === "num") { const raws = String(d.why).replace(/^根拠に無い数字：/, "").split(/[・,、]/).map(s => s.trim()).filter(Boolean); ks = ks.filter(k => (k.kind === "num" || k.kind === "rank") && raws.some(x => String(k.n.raw).indexOf(x.replace(/[^\d.]/g, "")) >= 0 || x.indexOf(String(k.n.raw)) >= 0) || (k.kind === "id" && raws.some(x => x.indexOf(String(k.id).replace(/^[A-Z]+/, "")) >= 0))); }
      /* 最上級で外した文：最上級の主張は根拠に無ければ外す。同じ文の数字は根拠どおりなら「強い表現で書いた同じ数字」を外す */
      const frame = cls === "sup" || V97DK_FRAME.test(String(d.why)) || V97DK_STRONG.test(String(d.txt)) || (typeof DK3_SUPF !== "undefined" && DK3_SUPF.some(f => { try { return f[0].test(String(d.txt)); } catch (e) { return false; } }));
      ks.forEach(k => {
        rep.keys++;
        const sup = v97dkSupported(k, C);
        if (!sup && (cls !== "sup" || k.kind === "sup")) { if (!bad.has(k.key)) bad.set(k.key, { k, d }); return; }
        if (!sup) return;
        if (frame && k.kind !== "sup") { if (!weak.has(k.key)) weak.set(k.key, { k, d }); }
        d.v97ok = d.v97ok || []; if (k.kind !== "sup" && d.v97ok.indexOf(k.lab) < 0) d.v97ok.push(k.lab);
      });
    });
    if (!bad.size && !weak.size && !r.dropped.some(d => d.v97ok)) return rep;
    const leaves = dk3Leaves(r.plan).concat(typeof dk3Combos === "function" ? dk3Combos(r.plan) : []);
    const gone = new Set(r.dropped.map(d => d.path));
    leaves.forEach(c => {
      if (!c || !c.txt || gone.has(c.path)) return;
      const ks = v97dkKeys(c.txt, lang);
      let why = "";
      for (const k of ks) {
        if (bad.has(k.key)) { why = "外した文言と同じ主張（" + k.lab + "）・根拠に無い"; break; }
        if (weak.has(k.key) && V97DK_STRONG.test(c.txt)) { why = "外した文言と同じ主張（" + k.lab + "）を強い表現で書いた文"; break; }
      }
      if (why) { rep.add.push({ path: c.path, txt: c.txt, why, v97: 1 }); gone.add(c.path); dk3Drop(r.plan, c.path); }
    });
    if (rep.add.length && typeof dk3Compact === "function") dk3Compact(r.plan);
    /* 外した文の理由に、ほかの文では残した数字を書く（最終チェックの「外した文言」と資料の中身が食い違わないように） */
    r.dropped.forEach(d => {
      if (!d.v97ok || !d.v97ok.length) return;
      const still = leaves.filter(c => c && c.txt && !gone.has(c.path) && d.v97ok.some(l => String(c.txt).indexOf(String(l).split(/\s/)[0]) >= 0));
      if (still.length) { d.why = String(d.why || "") + "・" + d.v97ok.join("・") + " 自体は根拠どおり（強い表現の文は外し、普通の書き方の文は残しています）"; rep.keep.push(d.v97ok.join("・")); }
      delete d.v97ok;
    });
    r.dropped = r.dropped.concat(rep.add);
    r.v97prop = { add: rep.add.length, bad: [...bad.values()].map(x => x.k.lab), weak: [...weak.values()].map(x => x.k.lab) };
    V97DK.prop = Object.assign({ at: Date.now() }, r.v97prop);
    v97dkN("propAdd", rep.add.length);
  } catch (e) { v97dkErr("prop", e); }
  return rep;
}
V97DK.prop0 = v97dkProp;
if (typeof dk3Plan === "function") {
  const __pl97 = dk3Plan;
  dk3Plan = async function (lang, say, force, T) {
    const r = await __pl97.apply(this, arguments);
    try { if (r && r.plan) v97dkProp(r, lang, T || v97dkTen()); } catch (e) { v97dkErr("plan", e); }
    return r;
  };
}
/* 資料に残った「外した主張」（登録の表の値など）を最終チェックに出し、外した数を実際の数にそろえる */
function v97dkPropCheck(deck, ctx, r) {
  try {
    const dr = ((ctx && ctx.dropped) || []).filter(d => d && d.txt);
    if (!dr.length || !deck || !Array.isArray(deck.slides)) return;
    const lang = deck.lang || "en";
    const C = (typeof dk3Corpus === "function") ? (() => { try { return dk3Corpus(v97dkDeckT()); } catch (e) { return null; } })() : null;
    const bad = new Map();
    dr.forEach(d => { const cls = v97dkWhyClass(d.why); if (!cls) return; v97dkKeys(d.txt, lang).forEach(k => { if ((k.kind === "num" || k.kind === "id") && C && !v97dkSupported(k, C) && !bad.has(k.key)) bad.set(k.key, k); }); });
    const hits = [];
    if (bad.size) deck.slides.forEach((S, si) => (S && S.els || []).forEach(e => {
      if (!e || e.k !== "text" || e.name === "foot" || e.name === "pno" || e.name === "draft") return;
      const t = v97dkElTxt(e);
      v97dkKeys(t, lang).forEach(k => { if (bad.has(k.key)) hits.push({ si: si + 1, lab: k.lab }); });
    }));
    if (hits.length) r.warn.push({ k: "v97claim", t: "外した主張と同じもの（" + [...new Set(hits.map(x => x.lab))].join("・") + "）が " + [...new Set(hits.map(x => x.si))].sort((a, b) => a - b).join("・") + "枚目に残っています（登録の表・価格・仕様の値です）。登録の値が正しいか確かめてください" });
    const nAdd = dr.filter(d => d.v97).length;
    const w = (r.warn || []).find(x => x && x.k === "dropn");
    if (w && nAdd) w.t = "根拠が確認できない・輸出先の規制上載せられない文言 " + dr.length + "件を資料から外しました（うち、外した文言と同じ主張の文 " + nAdd + "件・下に一部を表示）";
  } catch (e) { v97dkErr("propck", e); }
}

/* ══════════ No.522 頼み直しを減らす（返事が途中で切れない上限）と、残りの目安 ══════════ */
function v97dkClaimN(q) { try { const a = q.indexOf("=== 主張 ==="), z = q.indexOf("=== 根拠 ==="); if (a < 0 || z < a) return 0; return (q.slice(a, z).match(/\n\d+\. /g) || []).length; } catch (e) { return 0; } }
if (typeof llmAsk === "function") {
  const __la97 = llmAsk;
  llmAsk = function (q, maxTok, opts) {
    try {
      const o = opts || {};
      const sys = String(o.sys || "");
      if (typeof q === "string" && !o._retry2) {
        let kind = "", want = 0;
        if (/ファクトチェッカー/.test(sys)) { kind = "verify"; const n = v97dkClaimN(q); want = n ? Math.min(12000, 700 + n * 170) : 0; }
        else if (/B2B export copywriter/.test(sys)) { kind = "plan"; want = 16000; }
        else if (/professional trade translator/.test(sys) && V97DK_TRQ.test(q)) {
          kind = "trdata"; want = 16000;
          if (q.indexOf("追加のルール：書類名・認証名") < 0) { const i = q.lastIndexOf("\n{"); q = i > 0 ? q.slice(0, i) + V97DK_TRRULE + q.slice(i + 1) : q + V97DK_TRRULE; }
        }
        let pplx = false;
        try { if (kind && typeof llmRoute === "function") { const rt = llmRoute({ att: o.att, needWeb: false, task: o.task, model: o.model, prov: o.prov }); pplx = !!(rt && rt.prov === "perplexity"); } } catch (e) { pplx = false; }
        if (kind) {
          if (want > (+maxTok || 0) && !pplx) { maxTok = want; V97DK.raise++; }
          const p = __la97.call(this, q, maxTok, opts);
          return Promise.resolve(p).then(r => { try { if (r && /長文のため一部省略/.test(String(r.why || ""))) V97DK.cut[kind]++; } catch (e) { } return r; });
        }
      }
      if (o._retry2 && typeof q === "string") { const k = /ファクトチェッカー/.test(sys) ? "verify" : /B2B export copywriter/.test(sys) ? "plan" : /trade translator/.test(sys) ? "trdata" : "other"; V97DK.cut[k] = (V97DK.cut[k] || 0) + 1; }
    } catch (e) { v97dkErr("la", e); }
    return __la97.call(this, q, maxTok, opts);
  };
}
/* 照合の段の残り：終わった回の実際の時間 × 残りの回数 ÷ 同時に頼める数 */
if (typeof v80docLeftMs === "function") {
  const __lm97 = v80docLeftMs;
  v80docLeftMs = function (R) {
    const base = __lm97.apply(this, arguments);
    try {
      if (base == null || !R || !R.ver || !R.ver.b || typeof DK3G === "undefined") return base;
      const s = (DK3G.steps || []).find(x => x && x.k === "check1");
      if (!s || s.st !== "on") return base;
      const V = R.ver, done = V.done ? V.done.size : 0, b = V.b;
      if (!done || done >= b) return base;
      /* いちばん新しく終わった回の時刻（数が増えたときに控える） */
      const mk = V97DK.verMk && V97DK.verMk.V === V ? V97DK.verMk : (V97DK.verMk = { V, done: 0, at: 0 });
      if (done !== mk.done) { mk.done = done; mk.at = Date.now(); }
      const per = Math.max(1, (mk.at - (V.t0 || mk.at)) / done), lim = Math.max(1, V.par ? (V.lim || 1) : 1);
      const leftVer = Math.max(per * 0.1, per * Math.ceil((b - done) / lim) - (Date.now() - mk.at));
      const x = R.st && R.st.check1 ? R.st.check1 : {};
      const w = (typeof v80docWeights === "function") ? v80docWeights(R) : null;
      const mid = R.est ? (R.est.lo + R.est.hi) / 2 : 0;
      const expV = w && mid ? Math.max((w.check1 || 0) * mid - (Date.now() - (x.on || Date.now())), (w.check1 || 0) * mid * 0.15) : 0;
      const adj = base - expV + leftVer;
      V97DK.left = { done, b, per: Math.round(per), leftVer: Math.round(leftVer), base: Math.round(base), adj: Math.round(adj) };
      return Math.max(0, adj);
    } catch (e) { v97dkErr("left", e); return base; }
  };
}

/* ══════════ 最終チェック（写真・日本語の残り・外した主張・頼み直しの記録） ══════════ */
if (typeof dk3Check === "function") {
  const __ck97 = dk3Check;
  dk3Check = function (deck, ctx) {
    let R = null;
    try { if (deck && deck.lang && deck.lang !== "ja") R = v97dkScanDeck(deck, true); } catch (e) { v97dkErr("ck0", e); }
    const r = __ck97.apply(this, arguments);
    try {
      if (!r) return r;
      r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
      const T = v97dkDeckT();
      if (T) v97dkPhCheck(deck, T, r);
      if (R) { const R2 = v97dkScanDeck(deck, false); R2.fixed = R.fixed; v97dkJpReport(r, R2, deck, false); }
      v97dkPropCheck(deck, ctx, r);
      const c = V97DK.cut, nc = (c.plan || 0) + (c.verify || 0) + (c.trdata || 0);
      if (nc) r.ok.push("AI の返事が長く途中で切れたため頼み直した回数：" + nc + "回（文章 " + (c.plan || 0) + "・照合 " + (c.verify || 0) + "・訳 " + (c.trdata || 0) + "）");
      V97DK.lastCk = { at: Date.now(), pass: r.pass, crit: r.crit.map(x => x.k), jp: V97DK.jp, ph: V97DK.ph, prop: V97DK.prop, cut: Object.assign({}, c) };
      V97DK.cut = { plan: 0, verify: 0, trdata: 0, other: 0 };
    } catch (e) { v97dkErr("ck", e); }
    return r;
  };
}
/* 保存した資料を開いたとき：日本語の残りを直し、残れば止める */
if (typeof dk14Open === "function") {
  const __op97 = dk14Open;
  dk14Open = async function (id) {
    const r = await __op97.apply(this, arguments);
    try {
      if (typeof DK3G === "undefined" || !DK3G || !DK3G.deck || DK3G.run) return r;
      const deck = DK3G.deck;
      if (!deck.lang || deck.lang === "ja") return r;
      const R = v97dkScanDeck(deck, true);
      if (R.fixed.length || R.left.length) {
        const ck = DK3G.check || (DK3G.check = { pass: true, score: 100, crit: [], warn: [], ok: [] });
        v97dkJpReport(ck, R, deck, true);
        if (typeof dk3Paint === "function") dk3Paint();
        if (typeof render === "function" && typeof cur !== "undefined" && cur === "deck") render();
      }
    } catch (e) { v97dkErr("open", e); }
    return r;
  };
}
/* 1枚の紹介シート：同じように直し、日本語が残れば出さない */
if (typeof v85dkOneDeck === "function") {
  const __one97 = v85dkOneDeck;
  v85dkOneDeck = async function () {
    const one = await __one97.apply(this, arguments);
    try {
      if (!one || !one.lang || one.lang === "ja") return one;
      const R = v97dkScanDeck(one, true);
      if (R.left.length) {
        const t = "1枚の紹介シートに日本語が残っているため出せません（「" + R.left.slice(0, 3).map(x => x.t).join("」「") + "」）。元の登録を確かめてから、もう一度作ってください";
        if (typeof toast === "function") toast(v97dkLang() === "ja" ? t : v97dkM(t, "The one-page sheet still contains Japanese, so it cannot be exported (“" + R.left.slice(0, 3).map(x => x.t).join("”, “") + "”). Check the original entries and make it again", "单页介绍仍有日文，无法导出（“" + R.left.slice(0, 3).map(x => x.t).join("”“") + "”）。请确认原始登记后重新制作", "La hoja de una página aún contiene japonés y no se puede exportar («" + R.left.slice(0, 3).map(x => x.t).join("», «") + "»). Revise los datos y vuelva a crearla"));
        V97DK.oneLeft = R.left.length;
        return null;
      }
    } catch (e) { v97dkErr("one", e); }
    return one;
  };
}

/* ══════════ 英語などの画面の訳（最終チェック・写真の欄） ══════════ */
const V97DK_WJA = { "日本語の文字": ["Japanese text", "日文文字", "texto en japonés"], "ぼやけ": ["blurry", "模糊", "borrosa"], "AI の判定": ["AI check", "AI 判定", "revisión de IA"], "横長・縦長": ["banner shape", "横幅形状", "forma de banner"], "図・文字が中心": ["mainly diagram/text", "以图表或文字为主", "sobre todo diagrama/texto"] };
function v97dkWTr(s, li) { return String(s).replace(/小さい（短い辺 (\d+)px）/g, (m, a) => [["small (" + a + "px)"], ["尺寸小（" + a + "px）"], ["pequeña (" + a + " px)"]][li][0]).replace(/日本語の文字|ぼやけ|AI の判定|横長・縦長|図・文字が中心/g, m => (V97DK_WJA[m] || [m, m, m])[li]).replace(/商品写真(\d+)/g, ["photo $1", "商品照片$1", "foto $1"][li]).replace(/・/g, [", ", "・", ", "][li]); }
v97dkPat([
  { re: /^理由があって外していた写真（(.+)）を、選んだとおりそのまま使っています（(.+)枚目）。替えるときは「ロゴ・写真」で$/,
    en: (m) => "Photos that were left out for a reason (" + v97dkWTr(m[1], 0) + ") are used as they are, as you chose (slide " + m[2].replace(/・/g, ", ") + "). Replace them in “Logo & photos”",
    zh: (m) => "因故未使用的照片（" + v97dkWTr(m[1], 1) + "）已按您的选择直接使用（第 " + m[2] + " 页）。可在“标志・照片”中替换",
    es: (m) => "Las fotos que quedaban fuera por un motivo (" + v97dkWTr(m[1], 2) + ") se usan tal cual, como eligió (diapositiva " + m[2].replace(/・/g, ", ") + "). Cámbielas en «Logo y fotos»" },
  { re: /^使うかどうかを選んでいない写真 (\d+)枚（(.+)）は、資料に入れていません。「ロゴ・写真」の欄の下で選べます$/,
    en: (m) => m[1] + " photo(s) you have not chosen (" + v97dkWTr(m[2], 0) + ") are not in the deck. Choose under “Logo & photos”",
    zh: (m) => "尚未选择的照片 " + m[1] + " 张（" + v97dkWTr(m[2], 1) + "）未放入资料。可在“标志・照片”栏下方选择",
    es: (m) => m[1] + " foto(s) sin decidir (" + v97dkWTr(m[2], 2) + ") no están en la presentación. Elija bajo «Logo y fotos»" },
  { re: /^使わないと選んだ写真 (\d+)枚（(.+)）は入れていません$/, en: (m) => "The " + m[1] + " photo(s) you chose not to use (" + v97dkWTr(m[2], 0) + ") are not included", zh: (m) => "未放入您选择不使用的 " + m[1] + " 张照片（" + v97dkWTr(m[2], 1) + "）", es: (m) => "No se incluyeron las " + m[1] + " foto(s) que decidió no usar (" + v97dkWTr(m[2], 2) + ")" },
  { re: /^(この保存した資料の)?日本語のまま残っていた (\d+)か所を、決まった訳語に直しました（([\s\S]*)）$/,
    en: (m) => (m[1] ? "In this saved deck, " : "") + m[2] + " place(s) left in Japanese were replaced with the standard terms (" + m[3].replace(/(\d+)枚目/g, "slide $1 ").replace(/ほか/g, "etc.") + ")",
    zh: (m) => (m[1] ? "此保存资料中，" : "") + "已将仍为日文的 " + m[2] + " 处改为规定译词（" + m[3].replace(/(\d+)枚目/g, "第$1页").replace(/ほか/g, "等") + "）",
    es: (m) => (m[1] ? "En esta presentación guardada, " : "") + "se reemplazaron " + m[2] + " texto(s) en japonés por los términos estándar (" + m[3].replace(/(\d+)枚目/g, "diap. $1 ").replace(/ほか/g, "etc.") + ")" },
  { re: /^外国語の資料に日本語が残っています（([\s\S]*)）。この文の元の登録（商品情報・規制の画面の書類名など）を確かめるか、「↻ もう一度作る」を押してください。直るまで、納品版の PPTX・PDF・1枚の紹介シートは出せません$/,
    en: (m) => "Japanese text is left in the foreign-language deck (" + m[1].replace(/(\d+)枚目/g, "slide $1 ").replace(/ほか (\d+)か所/g, "and $1 more") + "). Check the original entries (product info, document names on the regulations screen, etc.) or press “↻ Make it again”. Until it is fixed, the final PPTX, PDF and one-page sheet cannot be exported",
    zh: (m) => "外语资料中仍有日文（" + m[1].replace(/(\d+)枚目/g, "第$1页").replace(/ほか (\d+)か所/g, "等另 $1 处") + "）。请确认原始登记（商品信息、法规页面的文件名等）或点击“↻ 重新制作”。修正前无法导出正式版 PPTX、PDF 和单页介绍",
    es: (m) => "Queda texto en japonés en la presentación (" + m[1].replace(/(\d+)枚目/g, "diap. $1 ").replace(/ほか (\d+)か所/g, "y $1 más") + "). Revise los datos originales o pulse «↻ Crear de nuevo». Hasta corregirlo no se puede exportar el PPTX, PDF ni la hoja de una página" },
  { re: /^外した主張と同じもの（(.+)）が (.+)枚目に残っています（登録の表・価格・仕様の値です）。登録の値が正しいか確かめてください$/,
    en: "The same claims that were removed ($1) remain on slide $2 (values from the registered tables, prices or specs). Check that the registered values are correct",
    zh: "与已删除主张相同的内容（$1）仍在第 $2 页（登记的表格・价格・规格的值）。请确认登记的值是否正确",
    es: "Las mismas afirmaciones eliminadas ($1) siguen en la diapositiva $2 (valores de tablas, precios o especificaciones registrados). Compruebe que sean correctos" },
  { re: /^根拠が確認できない・輸出先の規制上載せられない文言 (\d+)件を資料から外しました（うち、外した文言と同じ主張の文 (\d+)件・下に一部を表示）$/,
    en: "$1 statement(s) that could not be verified or cannot be shown under the destination's rules were removed (including $2 with the same claim as a removed statement; some are listed below)",
    zh: "已删除 $1 条无法核实或受出口国法规限制的文字（其中与已删除文字相同主张的 $2 条・下方显示部分）",
    es: "Se quitaron $1 frase(s) no verificables o no permitidas en el destino (incluidas $2 con la misma afirmación que una frase quitada; algunas abajo)" },
  { re: /^AI の返事が長く途中で切れたため頼み直した回数：(\d+)回（文章 (\d+)・照合 (\d+)・訳 (\d+)）$/,
    en: "AI replies cut off and asked again: $1 (text $2, check $3, translation $4)", zh: "因 AI 回复过长被截断而重新请求：$1 次（文案 $2・核对 $3・翻译 $4）", es: "Respuestas de IA cortadas y repetidas: $1 (texto $2, cotejo $3, traducción $4)" }
]);
v97dkPat([
  { re: /^✓ このまま使う（(.+)）$/, en: (m) => "✓ Used as it is (" + v97dkWTr(m[1], 0) + ")", zh: (m) => "✓ 直接使用（" + v97dkWTr(m[1], 1) + "）", es: (m) => "✓ Se usa tal cual (" + v97dkWTr(m[1], 2) + ")" },
  { re: /^商品写真(\d+)を、このまま資料に使います（(.+)）$/, en: (m) => "Product photo " + m[1] + " will be used in the deck as it is (" + v97dkWTr(m[2], 0) + ")", zh: (m) => "商品照片" + m[1] + "将直接用于资料（" + v97dkWTr(m[2], 1) + "）", es: (m) => "La foto " + m[1] + " se usará tal cual (" + v97dkWTr(m[2], 2) + ")" }
]);
v97dkDict([
  ["使うか下で選べます", "choose below whether to use it", "可在下方选择是否使用", "elija abajo si la usa"],
  ["✓ このまま使う", "✓ Use as it is", "✓ 直接使用", "✓ Usar tal cual"]
]);
