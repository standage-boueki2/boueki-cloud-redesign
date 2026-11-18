/* ═══ v21.98 deck（2026-11-18 第11回相当 UAT・21.97.2）外国語営業資料の照合・校正・はみ出し
   No.533（未解消・3回目）外した主張と同じ趣旨の表現が資料に残る（A「Long-aged」「Long aging」／B「Bactericidal rate 99.9% Tested」／C 強み欄の 0.8 mm/s）
     原因：21.97／21.97.2 の「主張の単位」は 数字＋単位・%・番号・認証・最上級・品番・採用実績 だけで、言葉の意味（熟成＝aged/matured、
           除菌＜殺菌・消毒＜滅菌 の強さ）を持っていなかった。A は「180 days」を数字で外したが、同じ「熟成」の主張（Long-aged・Long aging・Matured）は
           数字が無いので照らせず残った。B は「disinfection（消毒）」が登録の「除菌」より強いとして外したが、bactericidal・sterilization・kills 99.9% of germs
           は 21.97 の強い言葉の表に無く残った（登録の「除菌率99.9%」を訳が「Bactericidal rate」と強く訳した転記の欄も同じ）。
           C は登録に 0.8 mm/s があるのに、照らし方の違い（「㎜」のような1文字の単位を数字として読めない など）で「根拠に無い」と「根拠どおり」が食い違い、
           外した理由と最終チェックの注記が合わなかった。
     直し：主張を（種類・対象・値・強さ）の単位で照らす。・種類＝意味のまとまり（熟成／除菌の強さ）を英・中・西・日の同義語で持つ。
           ・値＝数字に加え、three nines＝99.9%・six months＝6 か月 のような言い換えも同じ値にする。「㎜」「㎏」などの1文字の単位は mm・kg として読む。
           ・強さ＝ultra-／industry-leading／extremely など。登録（根拠）に同じ強さの言葉が無ければ強すぎる。
           外した文の主張を根拠と1つの関数で照らし、
             根拠に無い種類（A の熟成）→ 資料の文章のどこにあっても外す（文が複数ならその文だけ・「Long-aged organic miso」の頭の飾りだけなら飾りを外す）
             根拠より強い言い方（B の disinfection・bactericidal、C の Ultra-low）→ 強い言葉だけを外す・登録の強さの言葉に直す（数字は登録どおりなら残す）
             根拠に無い値（言い換えを含む）→ 同じ値の文を外す
           外した文言の一覧の理由は、同じ判定から「根拠に無い主張（熟成）」「数字 0.8 mm/s は登録どおり・言い方（Ultra-low）が強い」の形で書き直す。
           資料に組んだ後（転記の欄＝登録の強み・仕様の表の訳を含む）も同じ判定で全部の文を見て、強すぎる訳は登録の強さの言葉に直す。
           最終チェックの「外した主張と同じものが残っています」も同じ判定を使う（登録にある値は「根拠に無い」としない）。
   No.543（中）英語資料のスペース欠け（A p1「brewed inNagano Prefecture」・D p1「Rice fermentserum」・H p1「Treat dogs with100%」）とラベルの重複（A p6「Ingredients」「Allergen」）
     原因：① 表紙の見出しなどを2行にそろえる dk3Balance が、行を分ける所の「空白」を改行に置き換えていた。画面・PDF・PowerPoint では改行に見えるが、
           文字として読むと（コピー・読み上げ・ページの文字の取り出し）前後の語がくっつく。3例とも 1枚目の見出しで、強調（**語**）の前の空白で行を分けていた。
           ② 登録の値の頭に項目名が入っている（例：項目「原材料名」・値「原材料名：大豆…」）と、表の項目名と値の頭の両方に「Ingredients」が出た。
     直し：① 行を分けても空白を残す（「brewed in ␣↵Nagano」）。保存済みの資料を開いたときも直す。
           ② 2列の表（項目・値）の値の頭が項目名と同じなら、その頭を外してから訳す。
           ③ 安全網：出来上がった全ページの英文（西・仏・独など空白で語を分ける言語）を点検し、改行の前の空白の欠け・前置詞などの後の語や数字のくっつき
             （with100% → with 100%・inNagano → in Nagano）・長い語のくっつき（21.86 の辞書）・同じ欄のラベルの重複（Allergen ＋ Allergens: …）を直す。
             iPhone・McDonald's・pH・mL・kDa・SPF50・登録の品番や社名などの綴りは変えない。
   No.547（中）英語資料で文字がはみ出し、送れない理由になる（H 犬用おやつ p5）
     原因：組み立てで文字を枠に合わせる dk3Fit は 8.5pt より小さくしない。情報の多い商品では最小の大きさでも入らず、そのまま最終チェックで
           「はみ出し」（重大な問題）になった。文を短くする段が無かった。
     直し：最終チェックと同じ物差し（dk3TextHeight・枠の高さ＋3px）で全ページを測り、はみ出す枠は ① 同じ段のカードと同じ大きさまで小さくする
           （8.5pt より小さくしない）② それでも入らなければ、長い段落の後ろの文・句から短くして収める（意味の区切りで切り、文の途中で切らない）。
           短くした全文は、そのページの話す人のメモ（PowerPoint のノート）に残し、最終チェックに「何枚目を要約したか」を出す。
           ほかの層の直し（訳語の直し・年数の直し）の後にもう一度測り、0 件になるまで直す。
   No.522（条件つき）生成時間：訳の先取り・写真の役割・照合の同時の依頼（21.80）と上限の見直し（21.97）はある。
           同じ依頼のくり返しが無いかを数え、照合の返事が足りないときだけの頼み直し以外は増やさない（AI の回数は増やさない）。調べた結果は RESULT.md。
   書き方：前の層の関数は控えてから包む。登録の値は書き換えない（資料の中の文だけを直す）。失敗したら前の動きのまま。 */
var V98DECK = window.V98DECK = { v: "21.98", err: [], n: {}, last: null };
function v98dkErr(k, e) { try { V98DECK.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V98DECK.err.length > 40) V98DECK.err.shift(); } catch (x) { } }
function v98dkN(k, d) { try { const x = d == null ? 1 : +d; if (x) V98DECK.n[k] = (V98DECK.n[k] || 0) + x; } catch (e) { } }
function v98dkLang() { try { if (typeof v97dkLang === "function") return v97dkLang(); } catch (e) { } return "ja"; }
function v98dkM(ja, en, zh, es) { const l = v98dkLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v98dkNF(s) { s = String(s == null ? "" : s); try { return s.normalize("NFKC"); } catch (e) { return s; } }
function v98dkTen() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || ((typeof TEN !== "undefined" && TEN) || null); } catch (e) { return null; } }
const V98DK_LATIN = /^(en|es|fr|de|id|ms|vi|pt|it)$/;
function v98dkElTxt(e) { try { return (e.ps || []).map(p => (p.r || []).map(r => String(r && r.t != null ? r.t : "")).join("")).join(" "); } catch (x) { return ""; } }
function v98dkSkipEl(e) { return !e || e.k !== "text" || !Array.isArray(e.ps) || e.v54 || /^(draft|v54draft|v54note|pno|deco)$/.test(e.name || ""); }

/* ══════════ 共通：数字の読み取り（1文字の単位） ══════════ */
/* 「㎜」「㎏」「㎖」「℃」などの1文字の単位を mm・kg・mL・°C として読む（前：「0.8㎜/s」は単位なしの 0.8 になり、英語の「0.8 mm/s」と別の主張に数えていた） */
if (typeof dk3NumsIn === "function") {
  const __ni98 = dk3NumsIn;
  dk3NumsIn = function (s, lang) {
    try {
      const t = String(s == null ? "" : s);
      if (/[㎀-㏟℃℉]/.test(t)) { v98dkN("cjkUnit"); return __ni98.call(this, t.replace(/[㎀-㏟℃℉]/g, c => { try { return c.normalize("NFKC"); } catch (e) { return c; } }), lang); }
    } catch (e) { v98dkErr("nums", e); }
    return __ni98.apply(this, arguments);
  };
}

/* ══════════ No.533 主張の単位（種類・対象・値・強さ） ══════════ */
/* 種類（意味のまとまり）：re＝資料の文（英・中・西・仏・独）／ev＝根拠（日本語の登録・資料。英語の登録も）／not＝別の意味の使い方 */
const V98DK_CON = [
  { k: "aging", ja: "熟成", re: /\b(?:long[- ]?aged|slow[- ]?aged|barrel[- ]?aged|cask[- ]?aged|wood[- ]?aged|aged|ag(?:e)?ing|matur(?:ed|ing|ation|es)|long[- ]term ferment\w*|long ferment\w*|slow(?:ly)?[- ]ferment\w*|extended ferment\w*)\b|熟成|陈酿|陳釀|陈化|陳化|añejad\w*|madurad\w*|maduración|affinée?s?|vieilli\w*|gereift\w*|Reifung/i,
    not: /anti[- ]?ag(?:e)?ing|ag(?:e)?ing skin|signs of (?:aging|ageing)|ag(?:e)?ing population|\baged\s+(?:\d|care|between|under|over|from|\d+\s*(?:\+|and up|or older))|(?:children|kids|people|adults|pets?|dogs?|cats?)\s+aged/gi,
    ev: /熟成|寝かせ|長期発酵|長期醸造|年もの|年物|陳年|陈酿|\baged\b|matur|añejad|madurad/i },
  { k: "germ", ja: "除菌・殺菌", lv: 1 }
];
/* 除菌の強さ：1＝除菌・抗菌（sanitize・germ removal・antibacterial）／2＝殺菌・消毒（disinfect・bactericidal・kill germs）／3＝滅菌（sterilize） */
const V98DK_GERM = [
  [3, /\bsteril(?:e|i[sz](?:e|es|ed|ing|ation|ations))\b|滅菌|灭菌|esteriliz\w*|stérilis\w*|sterilisier\w*/i],
  [2, /\b(?:disinfect\w*|bactericid\w*|germicid\w*|virucid\w*|biocid\w*)\b|\bkill(?:s|ed|ing)?\b(?:\s+(?:up\s+to\s+)?\d+(?:\.\d+)?\s*%(?:\s+of)?)?\s+(?:(?:all|most|the)\s+)?(?:germs?|bacteria|viruses?|microbes?|pathogens?)\b|\beliminat\w*\b(?:\s+\d+(?:\.\d+)?\s*%(?:\s+of)?)?\s+(?:germs?|bacteria|viruses?)\b|殺菌|杀菌|消毒|殺ウイルス|desinfect\w*|bactericid\w*|désinfect\w*|desinfizier\w*|keimtötend\w*/i],
  [1, /\b(?:saniti[sz]\w*|anti[- ]?bacterial|anti[- ]?microbial|anti[- ]?viral|germ[- ]removal|germ[- ]removing|remov(?:es|e|ed|ing)\b(?:\s+\d+(?:\.\d+)?\s*%(?:\s+of)?)?\s+(?:germs?|bacteria))\b|除菌|抗菌|抗ウイルス|除ウイルス|antibacterian\w*|higieniz\w*|sanitiz\w*|antibactérien\w*|antibakteriell\w*/i]
];
const V98DK_GERM_NEG = /(?:剤)?(?:不使用|なし|無し|フリー|ではない|ではありません|していない|しません|free)/;
function v98dkGermLv(t, ev) {
  t = v98dkNF(t);
  let lv = 0;
  V98DK_GERM.forEach(([l, re]) => {
    if (lv >= l) return;
    const g = new RegExp(re.source, "gi"); let m;
    while ((m = g.exec(t))) {
      if (ev && V98DK_GERM_NEG.test(t.slice(m.index + m[0].length, m.index + m[0].length + 6))) continue;   /* 根拠の「殺菌剤不使用」は殺菌の主張に数えない */
      lv = Math.max(lv, l); break;
    }
  });
  return lv;
}
/* 強い言い方（強さ）。根拠に同じ強さの言葉（超・業界最高 など）が無ければ強すぎる */
const V98DK_INT = /\b(?:ultra|super)[- ]?(?=[a-z])|\b(?:extremely|exceptionally|remarkably|incredibly|unbelievably|outstandingly)\s+(?=[a-z])|\b(?:unparalleled|unmatched|unrivall?ed|unbeatable|unsurpassed|industry[- ]leading|class[- ]leading|best[- ]in[- ]class|world[- ]class|world[- ]leading|top[- ]class|market[- ]leading)\s+(?=[a-z])|\b(?:the\s+)?(?:lowest|highest|best|finest|smallest|largest|strongest|fastest|quietest)\b/i;
const V98DK_INT_EV = /超|極|業界最|業界トップ|業界随一|最高|最低|最小|最大|最も|トップクラス|世界最|世界トップ|圧倒的|類を見ない|随一|ultra|extremely|industry[- ]leading|best[- ]in[- ]class|world[- ]class|lowest|highest|\bbest\b/i;
/* 言葉で書いた数（言い換え）：three nines＝99.9%・six months＝6 か月 など */
const V98DK_WN = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, ninety: 90, hundred: 100 };
function v98dkWordVals(t) {
  const out = [];
  try {
    const s = String(t || "").toLowerCase();
    let m;
    const reN = /\b(two|three|four|five|2|3|4|5)[- ]nines\b/g;
    while ((m = reN.exec(s))) { const n = +(V98DK_WN[m[1]] || m[1]); out.push({ k: "pct", full: +(100 - Math.pow(10, 2 - n)).toFixed(4), raw: m[0] }); }
    if (/\bhalf (?:a|one) year\b|\bsix[- ]month\b|\bhalf[- ]year\b/.test(s)) out.push({ k: "mo", full: 6, raw: "half a year" });
    const reU = /\b(one|a|an|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|ninety|hundred)[- ](days?|weeks?|months?|years?|percent)\b/g;
    while ((m = reU.exec(s))) {
      const v = V98DK_WN[m[1]]; const u = m[2];
      if ((m[1] === "a" || m[1] === "an") && !/^(day|week|month|year)$/.test(u)) continue;
      out.push({ k: /^day/.test(u) ? "day" : /^week/.test(u) ? "wk" : /^month/.test(u) ? "mo" : /^year/.test(u) ? "yr" : "pct", full: v, raw: m[0] });
    }
    if (/\bnine out of ten\b/.test(s)) out.push({ k: "pct", full: 90, raw: "nine out of ten" });
  } catch (e) { v98dkErr("wv", e); }
  return out;
}
/* 1つの文の主張：{ cons:[種類], germ:強さ, ints:[強い言い方], vals:[{k,full,raw,word}] } */
function v98dkUnits(txt, lang) {
  const t = v98dkNF(txt);
  const U = { cons: [], germ: 0, ints: [], vals: [] };
  try {
    V98DK_CON.forEach(c => {
      if (!c.re) return;
      const s = c.not ? t.replace(c.not, " ") : t;
      const m = s.match(c.re);
      if (m) U.cons.push({ k: c.k, w: m[0] });
    });
    U.germ = v98dkGermLv(t, false);
    if (U.germ) U.cons.push({ k: "germ", w: (t.match(V98DK_GERM.find(x => x[0] === U.germ)[1]) || [""])[0] });
    const gi = new RegExp(V98DK_INT.source, "gi"); let m;
    while ((m = gi.exec(t))) { const head = (t.slice(m.index + m[0].length).match(/^[\s-]*([A-Za-z]+)(?:[\s-]+([A-Za-z]+))?/) || []); const wl = (t.slice(m.index).match(/^(?:the\s+)?[A-Za-z]+(?:-[A-Za-z]+)*/) || [m[0]])[0]; U.ints.push({ w: wl.trim(), at: m.index, head: [head[1], head[2]].filter(Boolean).map(x => x.toLowerCase().replace(/s$/, "")) }); if (!m[0]) gi.lastIndex++; }
    if (typeof dk3NumsIn === "function") (dk3NumsIn(t, lang || "en") || []).forEach(n => { if (n && n.k !== "year" && n.k !== "n" && n.k !== "thing" && isFinite(+n.full)) U.vals.push({ k: n.k, full: +(+n.full).toFixed(4), raw: n.raw, n }); });
    v98dkWordVals(t).forEach(x => U.vals.push(Object.assign({ word: 1 }, x)));
  } catch (e) { v98dkErr("units", e); }
  return U;
}
V98DECK.units = v98dkUnits;
/* 根拠（登録の情報と資料）：種類・除菌の強さ・強い言葉・数字 */
function v98dkEv(C) {
  try {
    if (!C) return null;
    if (C.__v98ev) return C.__v98ev;
    const tx = v98dkNF(C.text || "");
    const E = { tx, cons: {}, germ: v98dkGermLv(tx, true), int: V98DK_INT_EV.test(tx), N: C.N || null, nums: null };
    V98DK_CON.forEach(c => { if (c.ev) E.cons[c.k] = c.ev.test(tx); });
    E.cons.germ = E.germ > 0;
    try { E.nums = (typeof dk3NumsIn === "function") ? dk3NumsIn(tx, "ja").filter(n => n && isFinite(+n.full)).map(n => ({ k: n.k, full: +(+n.full).toFixed(4) })) : []; } catch (e) { E.nums = []; }
    try { Object.defineProperty(C, "__v98ev", { value: E, enumerable: false, configurable: true, writable: true }); } catch (e) { }
    return E;
  } catch (e) { v98dkErr("ev", e); return null; }
}
/* 値が根拠にあるか（アプリの判定 → 1文字の単位を直した根拠の数字 → 言い換え：日数⇔月数は同じ長さ） */
function v98dkValOk(v, E) {
  try {
    if (!E) return false;
    if (v.n && E.N && typeof dk3NumOk === "function" && dk3NumOk(v.n, E.N)) return true;
    const same = (a, b) => Math.abs(a - b) <= Math.max(1e-6, Math.abs(b) * 0.001);
    if ((E.nums || []).some(x => x.k === v.k && same(x.full, v.full))) return true;
    if (v.word && E.N && E.N.kv && E.N.kv.has(v.k + "|" + v.full)) return true;
    return false;
  } catch (e) { return false; }
}
/* 外した文1件を、根拠と照らして分類する。bad＝根拠に無い（種類・値）／strong＝根拠より強い言い方（除菌の強さ・強い言葉）／okVals＝根拠どおりの値 */
function v98dkJudge(txt, lang, E) {
  const U = v98dkUnits(txt, lang);
  const J = { U, badCons: [], badVals: [], okVals: [], germOver: 0, germW: "", ints: [] };
  if (!E) return J;
  U.cons.forEach(c => { if (c.k !== "germ" && E.cons[c.k] === false && J.badCons.indexOf(c.k) < 0) J.badCons.push(c.k); });
  if (U.germ) { if (!E.germ) { if (J.badCons.indexOf("germ") < 0) J.badCons.push("germ"); } else if (U.germ > E.germ) { J.germOver = U.germ; J.germW = (U.cons.find(c => c.k === "germ") || {}).w || ""; } }
  U.vals.forEach(v => { (v98dkValOk(v, E) ? J.okVals : J.badVals).push(v); });
  if (!E.int) J.ints = U.ints.slice();
  return J;
}
V98DECK.judge = v98dkJudge;
const V98DK_CONJA = { aging: "熟成", germ: "除菌・殺菌" };
const V98DK_GERMJA = { 1: "除菌", 2: "殺菌・消毒", 3: "滅菌" };
/* 外した文言の理由（同じ判定から）。前の理由（AI の判定など）は最後に括弧で残す */
function v98dkWhy(d, J, E) {
  const parts = [];
  const vlab = (v) => v.raw + (v.n && typeof v97dkNumLab === "function" ? "" : "");
  if (J.badVals.length) parts.push("根拠に無い数字：" + [...new Set(J.badVals.map(v => v.raw))].join("・"));
  J.badCons.forEach(k => parts.push("根拠に無い主張：" + (V98DK_CONJA[k] || k) + "（登録・資料に" + (V98DK_CONJA[k] || k) + "の記載がありません）"));
  if (J.germOver) parts.push("言い方が根拠より強い：「" + J.germW + "」（" + V98DK_GERMJA[J.germOver] + "の意味）／登録は「" + V98DK_GERMJA[E.germ] + "」");
  if (J.ints.length && !J.badVals.length && !J.badCons.length) parts.push("言い方が根拠より強い：「" + J.ints.map(x => x.w).join("・") + "」");
  if (J.okVals.length && !J.badVals.length && (J.germOver || J.ints.length || J.badCons.length)) parts.unshift("数字 " + [...new Set(J.okVals.map(vlab))].join("・") + " は登録どおり");
  if (!parts.length) return "";
  const prev = String(d.why || "").replace(/・[^・（）]*自体は根拠どおり（強い表現の文は外し、普通の書き方の文は残しています）/g, "");
  const keepPrev = prev && !/^根拠に無い数字：/.test(prev) && !/^外した文言と同じ主張/.test(prev) && !/^根拠に無い最上級/.test(prev);
  return parts.join("・") + (keepPrev ? "（" + prev + "）" : "");
}

/* ── 文の直し（英語）：飾りの言葉だけを外す・強い言葉を外す・除菌の強さを登録の強さに ── */
const V98DK_PREP = /^(?:in|for|with|at|by|from|to|of|on|over|under|until|since|through|during|into|onto|and|or|as)\b/i;
function v98dkCap(s, was) { s = String(s).replace(/\s{2,}/g, " ").replace(/^\s+/, ""); if (was && /^[a-z]/.test(s)) s = s[0].toUpperCase() + s.slice(1); return s; }
function v98dkArticle(s) { return String(s).replace(/\b([Aa])n\s+(?=(?:[b-df-hj-np-tv-z]|u[bcdfgjklmnpqrstvwxz][a-z])[a-z])/g, "$1 ").replace(/\b([Aa])\s+(?=[aeio][a-z])/g, "$1n "); }
/* 種類（熟成など）の言葉を、頭の飾り（「Long-aged organic miso」の Long-aged）なら外す。外せなければ null */
function v98dkStripCon(s, k) {
  try {
    if (k !== "aging") return null;
    const star = /^\s*\*\*/.test(s);
    const body = s.replace(/^\s*\*\*/, "");
    /* 頭の飾りは「Long-aged」のような2語の形容詞だけ（「Matured slowly …」のような動詞の文は外す方に回す） */
    const re = /^(?:long|slow|barrel|cask|wood|naturally)[- ](?:aged|matured)(?:\s*,)?\s+/i;
    let m = body.match(re);
    const nx = body.slice(m ? m[0].length : 0);
    if (m && !V98DK_PREP.test(nx) && !/^[A-Za-z]+ly\b/.test(nx) && nx.trim().split(/\s+/).length >= 2) {
      let out = (star ? "**" : "") + v98dkCap(body.slice(m[0].length), true);
      if (!v98dkUnits(out).cons.some(c => c.k === k)) return out;
    }
    /* 文の途中の「long-aged」（名詞の前の飾り） */
    const re2 = /(\b(?:a|an|our|the|this|its|their)\s+|,\s*|^)((?:long|slow|barrel|cask|wood)[- ]aged)\s+(?=[A-Za-z])/i;
    m = s.match(re2);
    if (m && !V98DK_PREP.test(s.slice(m.index + m[0].length))) {
      let out = v98dkArticle(s.slice(0, m.index) + m[1] + s.slice(m.index + m[0].length));
      out = out.replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ");
      if (!v98dkUnits(out).cons.some(c => c.k === k)) return out;
    }
  } catch (e) { v98dkErr("stripcon", e); }
  return null;
}
/* 強い言葉を外す：Ultra-low → low・industry-leading X → X・the lowest X → low X */
function v98dkDeInt(s) {
  try {
    let out = String(s), ch = false;
    const was = /^\s*(?:\*\*)?[A-Z]/.test(out);
    out = out.replace(/\b(ultra|super)[- ]?(low|high|fine|quiet|thin|light|durable|compact|smooth|fast|strong|pure|soft|clear|bright)\b/gi, (m, a, b) => { ch = true; return b; });
    out = out.replace(/\b(?:extremely|exceptionally|remarkably|incredibly|unbelievably|outstandingly)\s+(?=[a-z])/gi, () => { ch = true; return ""; });
    out = out.replace(/\b(?:unparalleled|unmatched|unrivall?ed|unbeatable|unsurpassed|industry[- ]leading|class[- ]leading|best[- ]in[- ]class|world[- ]class|world[- ]leading|top[- ]class|market[- ]leading)\s+(?=[a-z])/gi, () => { ch = true; return ""; });
    out = out.replace(/\b(?:the\s+)?(lowest|highest|smallest|quietest)\b/gi, (m, a) => { ch = true; return ({ lowest: "low", highest: "high", smallest: "small", quietest: "quiet" })[a.toLowerCase()]; });
    if (!ch) return null;
    out = v98dkArticle(out).replace(/\s{2,}/g, " ").trim();
    out = out.replace(/^(\*\*)?([a-z])/, (m, a, b) => (a || "") + (was ? b.toUpperCase() : b));
    if (V98DK_INT.test(out)) return null;
    return out;
  } catch (e) { v98dkErr("deint", e); return null; }
}
/* 除菌の強さを登録の強さ（1＝除菌）に：kills 99.9% of germs → removes 99.9% of germs・Bactericidal rate → Germ removal rate */
function v98dkGermFix(s, evLv) {
  try {
    if (evLv !== 1) return null;
    let out = String(s);
    const was = /^\s*(?:\*\*)?[A-Z]/.test(out);
    out = out.replace(/\b(bactericidal|germicidal|disinfection|disinfecting|disinfectant|sterilization|sterilisation|sterilizing|sterilising|antiseptic)\s+(rate|effect|effects|performance|power|activity|test|tests|testing|efficacy|result|results|ratio)\b/gi, (m, a, b) => "germ removal " + b.toLowerCase());
    out = out.replace(/\bkill(s|ed|ing)?\b(?=(?:\s+(?:up\s+to\s+)?\d+(?:\.\d+)?\s*%(?:\s+of)?)?\s+(?:(?:all|most|the)\s+)?(?:germs?|bacteria|viruses?|microbes?|pathogens?)\b)/gi, (m, a) => "remov" + ({ s: "es", ed: "ed", ing: "ing" }[String(a || "").toLowerCase()] || "e"));
    out = out.replace(/\beliminat(es|e|ed|ing)\b(?=(?:\s+\d+(?:\.\d+)?\s*%(?:\s+of)?)?\s+(?:germs?|bacteria|viruses?)\b)/gi, (m, a) => "remov" + ({ es: "es", e: "e", ed: "ed", ing: "ing" }[a.toLowerCase()] || "e"));
    out = out.replace(/\bdisinfect(s|ed|ing)?\b/gi, (m, a) => "sanitiz" + ({ s: "es", ed: "ed", ing: "ing" }[String(a || "").toLowerCase()] || "e"));
    out = out.replace(/\bsteriliz(e|es|ed|ing)\b|\bsterilis(e|es|ed|ing)\b/gi, (m, a, b) => "sanitiz" + (a || b));
    out = out.replace(/\b(?:bactericidal|germicidal|disinfectant)\b/gi, "sanitizing");
    out = out.replace(/^(\*\*)?([a-z])/, (m, a, b) => (a || "") + (was ? b.toUpperCase() : b));
    if (out === s || v98dkGermLv(out, false) > 1) return null;
    return v98dkArticle(out);
  } catch (e) { v98dkErr("germfix", e); return null; }
}
/* 文の区切り（文が複数ある値は、外す主張のある文だけを外す） */
function v98dkSents(s) {
  const raw = String(s).split(/(?<=[.!?。！？])\s+(?=\S)|(?<=[。！？])/).filter(x => x.trim());
  const out = [];
  raw.forEach(x => { const prev = out[out.length - 1]; if (prev && (/\b(?:Ltd|Co|Inc|Corp|No|approx|e\.g|i\.e|etc|vs|St|Dr|Mr|Ms|Mt|Jr|Sr|Dept|Fig|Vol|U\.S|S\.A)\.$/i.test(prev) || /^[a-z(]/.test(x))) out[out.length - 1] = prev + " " + x; else out.push(x); });
  return out;
}
/* 1つの文（値）を、外した主張の集まり B に照らして直す。戻り値：{ act:"keep"|"fix"|"drop", txt, why } */
function v98dkFixText(s, lang, B, E) {
  const en = lang === "en";
  const J = v98dkJudge(s, lang, E);
  const hitCon = J.badCons.filter(k => B.cons.has(k) || B.all);
  const hitVal = J.badVals.filter(v => B.vals.has(v.k + "|" + v.full));
  const hitGerm = J.germOver && (B.germ || B.all);
  const hitInt = J.ints.filter(x => B.intHeads.size && (x.head.some(h => B.intHeads.has(h)) || J.okVals.some(v => B.okVals.has(v.k + "|" + v.full)) || J.U.cons.some(c => B.intCons.has(c.k))));
  if (!hitCon.length && !hitVal.length && !hitGerm && !hitInt.length) return { act: "keep", txt: s };
  const lab = [].concat(hitCon.map(k => V98DK_CONJA[k] + "：" + ((J.U.cons.find(c => c.k === k) || {}).w || "")), hitVal.map(v => v.raw), hitGerm ? ["「" + J.germW + "」"] : [], hitInt.map(x => "「" + x.w + "」")).join("・");
  /* ① 文が複数：その文だけ外す */
  const ss = v98dkSents(s);
  if (ss.length > 1) {
    const keep = ss.filter(x => v98dkFixText(x, lang, B, E).act === "keep");
    if (keep.length && keep.length < ss.length) return { act: "fix", txt: keep.join(" "), why: "外した主張（" + lab + "）の文だけを外しました" };
  }
  /* ② 英語：飾り・強い言葉・除菌の強さだけを直す */
  if (en) {
    let t = s, ok = true;
    hitCon.forEach(k => { if (!ok) return; const x = v98dkStripCon(t, k); if (x) t = x; else ok = false; });
    if (ok && hitVal.length) ok = false;
    if (ok && hitGerm) { const x = v98dkGermFix(t, E.germ); if (x) t = x; else ok = false; }
    if (ok && hitInt.length) { const x = v98dkDeInt(t); if (x) t = x; else ok = false; }
    if (ok && t !== s && v98dkFixText(t, lang, B, E).act === "keep") return { act: "fix", txt: t, why: (hitCon.length ? "根拠に無い主張（" + lab + "）の言葉だけを外しました" : "強い言い方（" + lab + "）を登録の言い方に直しました") };
  }
  return { act: "drop", txt: s, why: "外した文言と同じ主張（" + lab + "）" + (hitCon.length || hitVal.length ? "・根拠に無い" : "・根拠より強い言い方") };
}
/* 外した文の集まりから、ほかの文に広げる主張 B を作る */
function v98dkBad(dropped, lang, E) {
  const B = { cons: new Set(), vals: new Set(), germ: false, intHeads: new Set(), intCons: new Set(), okVals: new Set(), all: false, J: [] };
  (dropped || []).forEach(d => {
    if (!d || !d.txt || d.v98spread) return;
    if (/2回まで|含まれなかった|別の商品の根拠|産地|所在地|医薬品的/.test(String(d.why || ""))) return;   /* 数の上限・返事なし・別の商品・産地・効能は広げない（前の層と同じ） */
    const J = v98dkJudge(d.txt, lang, E);
    J.badCons.forEach(k => B.cons.add(k));
    J.badVals.forEach(v => { if (v.word || /^根拠に無い数字/.test(String(d.why || "")) || v97likeFrame(d.why)) B.vals.add(v.k + "|" + v.full); });
    if (J.germOver) B.germ = true;
    if (J.ints.length && (v97likeFrame(d.why) || /強|誇張|拡大|最上級/.test(String(d.why || "")))) {
      J.ints.forEach(x => x.head.forEach(h => B.intHeads.add(h)));
      J.okVals.forEach(v => B.okVals.add(v.k + "|" + v.full));
      J.U.cons.forEach(c => B.intCons.add(c.k));
    }
    B.J.push({ d, J });
  });
  return B;
}
function v97likeFrame(why) { try { return typeof V97DK_FRAME !== "undefined" ? V97DK_FRAME.test(String(why || "")) : /拡大|誇張|強い|言い過ぎ/.test(String(why || "")); } catch (e) { return false; } }
function v98dkSetPath(o, path, v) {
  const seg = String(path).split(".");
  for (let i = 0; i < seg.length - 1; i++) { if (o == null) return false; o = o[seg[i]]; }
  if (o == null || typeof o !== "object") return false;
  const k = seg[seg.length - 1];
  if (typeof o[k] !== "string") return false;
  o[k] = v; return true;
}
/* 文章（計画）に広げる：21.97 の照らし（v97dkProp）の前に動き、直せる文は直し、直せない文は外す */
function v98dkSpread(r, lang, T) {
  const rep = { fix: [], drop: [] };
  try {
    if (!r || !r.plan || typeof dk3Leaves !== "function" || typeof dk3Drop !== "function") return rep;
    const C = r.C || (typeof dk3Corpus === "function" ? dk3Corpus(T) : null);
    const E = v98dkEv(C);
    if (!E) return rep;
    r.dropped = (r.dropped || []).map(d => Object.assign({}, d));
    const B = v98dkBad(r.dropped, lang, E);
    /* 根拠に無い種類・強すぎる除菌は、外した文が無くても照らす（同じ判定で「残す・外す」を決める） */
    V98DK_CON.forEach(c => { if (E.cons[c.k] === false && c.re) B.cons.add(c.k); });
    if (E.germ) B.germ = true;
    const gone = new Set(r.dropped.map(d => d.path));
    const alive = (path) => { let o = r.plan; const seg = String(path).split("."); for (let i = 0; i < seg.length - 1; i++) { if (o == null) return false; o = o[seg[i]]; } return o != null; };
    dk3Leaves(r.plan).forEach(c => {
      if (!c || !c.txt || gone.has(c.path) || /\.v$/.test(c.path) || typeof c.txt !== "string" || !alive(c.path)) return;
      const X = v98dkFixText(c.txt, lang, B, E);
      if (X.act === "fix") { if (v98dkSetPath(r.plan, c.path, X.txt)) rep.fix.push({ path: c.path, a: c.txt, b: X.txt, why: X.why }); }
      else if (X.act === "drop") { rep.drop.push({ path: c.path, txt: c.txt, why: X.why, v98: 1, v97: 1, v98spread: 1 }); gone.add(c.path); dk3Drop(r.plan, c.path); }
    });
    if (rep.drop.length && typeof dk3Compact === "function") dk3Compact(r.plan);
    if (rep.drop.length) r.dropped = r.dropped.concat(rep.drop);
    r.v98fix = (r.v98fix || []).concat(rep.fix);
    v98dkN("spreadFix", rep.fix.length); v98dkN("spreadDrop", rep.drop.length);
  } catch (e) { v98dkErr("spread", e); }
  return rep;
}
/* 理由を同じ判定で書き直す（外した文言の一覧と資料の中身を合わせる） */
function v98dkReWhy(r, lang, T) {
  try {
    const C = r.C || (typeof dk3Corpus === "function" ? dk3Corpus(T) : null);
    const E = v98dkEv(C);
    if (!E || !Array.isArray(r.dropped)) return;
    r.dropped = r.dropped.map(d => {
      if (!d || !d.txt || d.v98spread || /2回まで|含まれなかった|別の商品|産地|所在地|医薬品的/.test(String(d.why || ""))) return d;
      const J = v98dkJudge(d.txt, lang, E);
      const w = v98dkWhy(d, J, E);
      if (w && w !== d.why) { v98dkN("reWhy"); return Object.assign({}, d, { why: w, v98why: 1, why0: d.why }); }
      return d;
    });
  } catch (e) { v98dkErr("rewhy", e); }
}
/* 21.97 の照らし（v97dkProp）の前後に入る：前＝広げる・直す／後＝理由をそろえる */
if (typeof v97dkProp === "function") {
  const __pr98 = v97dkProp;
  v97dkProp = function (r, lang, T) {
    try { v98dkSpread(r, lang, T); } catch (e) { v98dkErr("pre", e); }
    const out = __pr98.apply(this, arguments);
    try { v98dkReWhy(r, lang, T); } catch (e) { v98dkErr("post", e); }
    return out;
  };
}
/* 最終チェックの「外した主張と同じものが残っています」：登録にある値は「根拠に無い」としない（同じ判定） */
if (typeof v97dkSupported === "function") {
  const __su98 = v97dkSupported;
  v97dkSupported = function (K, C) {
    try { if (__su98.apply(this, arguments)) return true; if (K && (K.kind === "num" || K.kind === "rank") && K.n) { const E = v98dkEv(C); if (E && v98dkValOk({ k: K.n.k, full: +(+K.n.full).toFixed(4), n: K.n }, E)) { v98dkN("supFix"); return true; } } } catch (e) { v98dkErr("sup", e); }
    return __su98.apply(this, arguments);
  };
}
/* 資料に組んだ後（転記の欄を含む全部の文）：同じ判定で強すぎる言い方を直し、根拠に無い主張が残れば知らせる */
function v98dkDeckClaims(deck, ctx) {
  const out = { fix: [], left: [] };
  try {
    if (!deck || !Array.isArray(deck.slides) || !deck.lang || deck.lang === "ja") return out;
    const C = (ctx && ctx.C) || (typeof dk3Corpus === "function" ? (() => { try { return dk3Corpus(v98dkTen()); } catch (e) { return null; } })() : null);
    const E = v98dkEv(C);
    if (!E) return out;
    const lang = deck.lang;
    const B = v98dkBad((ctx && ctx.dropped) || [], lang, E);
    V98DK_CON.forEach(c => { if (E.cons[c.k] === false && c.re) B.cons.add(c.k); });
    if (E.germ) B.germ = true;
    deck.slides.forEach((S, si) => (S && S.els || []).forEach(e => {
      if (v98dkSkipEl(e) || e.name === "foot") return;
      let ch = false;
      e.ps.forEach(p => {
        const rs = (p.r || []).filter(r => r && typeof r.t === "string" && r.t.trim());
        if (!rs.length) return;
        const full = rs.map(r => r.t).join("");
        const X = v98dkFixText(full, lang, B, E);
        if (X.act === "keep") return;
        if (X.act === "fix" && rs.length === 1) { const lead = (rs[0].t.match(/^\s*/) || [""])[0], tail = (rs[0].t.match(/\s*$/) || [""])[0]; rs[0].t = lead + X.txt.trim() + tail; ch = true; out.fix.push({ si: si + 1, a: full.trim(), b: X.txt.trim() }); return; }
        if (X.act === "fix" && rs.length > 1) {
          /* 強調の色分けがある文：語ごとに直す（数字・語の位置は変えない） */
          let ok = true;
          rs.forEach(r => { const Y = v98dkFixText(r.t, lang, B, E); if (Y.act === "fix") r.t = (r.t.match(/^\s*/) || [""])[0] + Y.txt.trim() + (r.t.match(/\s*$/) || [""])[0]; else if (Y.act === "drop") ok = false; });
          if (ok && v98dkFixText(rs.map(r => r.t).join(""), lang, B, E).act === "keep") { ch = true; out.fix.push({ si: si + 1, a: full.trim(), b: rs.map(r => r.t).join("").trim() }); return; }
        }
        out.left.push({ si: si + 1, t: full.trim().slice(0, 60), why: X.why });
      });
      if (ch) { try { delete e.mh; } catch (x) { } }
    }));
    if (out.fix.length) v98dkN("deckFix", out.fix.length);
  } catch (e) { v98dkErr("deckclaims", e); }
  return out;
}
V98DECK.deckClaims = v98dkDeckClaims;

/* ══════════ No.543 空白の欠け・ラベルの重複 ══════════ */
/* ① 2行にそろえるとき、行を分ける所の空白を残す（前：空白を改行に置き換え、文字として読むと「brewed inNagano」とくっついた） */
if (typeof dk3Balance === "function") {
  const __bal98 = dk3Balance;
  dk3Balance = function (el, lang, deck) {
    let before = null;
    try { if (el && el.ps && el.ps.length === 1 && Array.isArray(el.ps[0].r)) before = el.ps[0].r.map(r => String(r && r.t != null ? r.t : "")); } catch (e) { }
    const out = __bal98.apply(this, arguments);
    try {
      if (before && el && el.ps && el.ps[0] && Array.isArray(el.ps[0].r) && el.ps[0].r.length === before.length) {
        el.ps[0].r.forEach((r, i) => {
          if (!r) return;
          const a = before[i], b = String(r.t != null ? r.t : "");
          if (a === b || a.length !== b.length) return;
          let t = "";
          for (let j = 0; j < b.length; j++) { if (b[j] === "\n" && a[j] === " ") { t += " \n"; v98dkN("balSp"); } else t += b[j]; }
          r.t = t;
        });
      }
    } catch (e) { v98dkErr("bal", e); }
    return out;
  };
}
/* ② 2列の表（項目・値）で、値の頭が項目名と同じ（「原材料名」｜「原材料名：大豆…」）なら頭を外す（訳す前の表で直す） */
function v98dkLabKey(s) { return v98dkNF(s).toLowerCase().replace(/[\s（）()【】\[\]・:：]/g, "").replace(/(名|名称|表示)$/, "").replace(/(ies)$/, "y").replace(/s$/, ""); }
function v98dkStripLab(lab, val) {
  try {
    const v = String(val == null ? "" : val);
    const m = v98dkNF(v).match(/^\s*([^:：\n]{1,30}?)\s*[:：]\s*(\S[\s\S]*)$/);
    if (!m) return null;
    const a = v98dkLabKey(lab), b = v98dkLabKey(m[1]);
    if (!a || !b || a.length < 2 || b.length < 2) return null;
    if (a === b || (a.length >= 2 && b.length >= 2 && (a.indexOf(b) === 0 || b.indexOf(a) === 0) && Math.min(a.length, b.length) >= 2)) return m[2].trim();
  } catch (e) { }
  return null;
}
if (typeof dk3Tbl === "function") {
  const __tb98 = dk3Tbl;
  dk3Tbl = function (cols, rows, max, kind) {
    const r = __tb98.apply(this, arguments);
    try {
      if (r && Array.isArray(r.rows) && kind !== "price") r.rows = r.rows.map(row => {
        if (!Array.isArray(row) || row.length !== 2) return row;
        const x = v98dkStripLab(row[0], row[1]);
        if (x != null && x !== "") { v98dkN("tblLab"); return [row[0], x]; }
        return row;
      });
    } catch (e) { v98dkErr("tbl", e); }
    return r;
  };
}
/* ③ 安全網：出来上がった資料の英文などを点検して直す */
const V98DK_FW = new Set(("in on at of for from by with to into onto over under via per and or the our your their its as than since near across around between through within without about after before during " +
  "made brewed grown based located crafted produced sourced born harvested filled packed tested certified used using contains contain including includes only just also each every all more less up down out off").split(" "));
const V98DK_KEEP = /^(?:iPhone|iPad|iPod|iOS|iMac|eBay|eCommerce|macOS|McDonald|YouTube|PayPal|LinkedIn|JavaScript|TypeScript|PowerPoint|WhatsApp|WeChat|TikTok|OpenAI|LiPo|LiFePO|pH|mL|kDa|mAh|kWh|MHz|GHz|dB|mmHg|μm|kcal)$/;
function v98dkProt(T) { try { if (typeof v86dkProt === "function") return v86dkProt(T); } catch (e) { } return ""; }
function v98dkProofPara(p, lang, ctx, log, si) {
  let ch = false;
  const rs = (p.r || []).filter(r => r && typeof r.t === "string");
  if (!rs.length) return false;
  /* a. 改行の前の空白（保存済みの資料・ほかの層で入った改行） */
  rs.forEach(r => {
    const t2 = r.t.replace(/([\p{L}\p{N}.,;:!?%)\]’”])\n(?=[\p{L}\p{N}(\[‘“$€£¥#])/gu, (m, a) => { log.push({ si, k: "br", from: a + "↵", to: a + " ↵" }); return a + " \n"; });
    if (t2 !== r.t) { r.t = t2; ch = true; }
  });
  /* 語の境目は、色分けの境目（run の境目）をまたぐこともある：全文で見つけて、その位置に空白を入れる */
  const full = rs.map(r => r.t).join("");
  const ins = [];
  let m;
  /* b. 前置詞など＋大文字の語（inNagano）・前置詞など＋数字（with100%） */
  const reA = /(?<![\p{L}\p{N}'’\-_\/@.])([a-z]{2,})(?=([A-Z][a-z]{2,}|\d))/gu;
  while ((m = reA.exec(full))) {
    const w = m[1], nx = m[2];
    const tokEnd = (() => { const z = full.slice(m.index).search(/[\s,.;:!?)(\]\[]|$/); return z < 0 ? full.length : m.index + z; })();
    const tok = full.slice(m.index, tokEnd);
    if (V98DK_KEEP.test(tok.replace(/[’']s$/, "")) || (ctx.prot && ctx.prot.indexOf(tok.toLowerCase()) >= 0)) continue;
    const isFw = V98DK_FW.has(w);
    const inVoc = ctx.V && (ctx.V.has(w) || (typeof v86dkIn === "function" && v86dkIn(w, ctx.V, ctx.W)));
    if (/\d/.test(nx)) { if (!(isFw || (inVoc && w.length >= 3))) continue; }
    else if (!(isFw || (inVoc && w.length >= 3))) continue;
    ins.push({ pos: m.index + w.length, from: tok.slice(0, 30), to: w + " " + tok.slice(w.length, 30) });
  }
  if (ins.length) {
    ins.sort((x, y) => y.pos - x.pos);
    const starts = []; let acc = 0; rs.forEach(r => { starts.push(acc); acc += r.t.length; });
    ins.forEach(x => {
      let k = rs.length - 1; while (k > 0 && starts[k] > x.pos) k--;
      const o = x.pos - starts[k];
      if (o === 0 && k > 0) { rs[k - 1].t = rs[k - 1].t + " "; } else rs[k].t = rs[k].t.slice(0, o) + " " + rs[k].t.slice(o);
      for (let j = k + 1; j < starts.length; j++) starts[j]++;
      log.push({ si, k: "glue", from: x.from, to: x.to }); ch = true;
    });
  }
  /* c. 長い語のくっつき・数字と単位（21.86 の辞書の直しをもう一度：ほかの層の直しの後に入った文も見る） */
  try { if (typeof v86dkParaGlue === "function" && ctx.V) { const g = []; if (v86dkParaGlue(p, lang, ctx.V, ctx.W, ctx.prot, g, si)) { ch = true; g.forEach(x => log.push({ si, k: "glue", from: x.from, to: x.to })); } } } catch (e) { v98dkErr("glue86", e); }
  return ch;
}
function v98dkProof(deck, T) {
  const out = { sp: [], lab: [] };
  try {
    if (!deck || !Array.isArray(deck.slides) || !deck.lang || deck.lang === "ja") return out;
    const lang = String(deck.lang);
    const latin = V98DK_LATIN.test(lang);
    const ctx = { V: null, W: null, prot: "" };
    if (latin) {
      try { ctx.V = typeof v86dkVocab === "function" ? v86dkVocab() : null; } catch (e) { }
      ctx.W = new Set();
      deck.slides.forEach(S => (S.els || []).forEach(e => { if (e && e.k === "text") v98dkElTxt(e).toLowerCase().split(/[^a-z]+/).forEach(w => { if (w.length >= 3 && w.length <= 12) ctx.W.add(w); }); }));
      ctx.prot = v98dkProt(T);
    }
    deck.slides.forEach((S, si) => {
      const els = (S && S.els || []).filter(e => !v98dkSkipEl(e));
      els.forEach(e => {
        let ch = false;
        if (latin) e.ps.forEach(p => { try { if (v98dkProofPara(p, lang, ctx, out.sp, si + 1)) ch = true; } catch (x) { v98dkErr("proofp", x); } });
        /* d. 1つの欄の中のラベルの重複（「Ingredients: Ingredients: …」） */
        e.ps.forEach(p => (p.r || []).forEach(r => {
          if (!r || typeof r.t !== "string") return;
          const t2 = r.t.replace(/^(\s*)([^:：\n]{2,30})\s*[:：]\s*\2\s*[:：]\s*/i, (mm, a, b) => { out.lab.push({ si: si + 1, t: b }); return a + b + ": "; });
          if (t2 !== r.t) { r.t = t2; ch = true; }
        }));
        if (ch) { try { delete e.mh; } catch (x) { } }
      });
      /* e. 同じ段の項目名と値の頭が同じ（項目「Allergen」・値「Allergens: soybeans」） */
      els.forEach(L => {
        const lt = v98dkElTxt(L).trim();
        if (!lt || lt.length > 40 || /[:：]/.test(lt)) return;
        els.forEach(V => {
          if (V === L || !(V.x > L.x) || Math.abs((V.y || 0) - (L.y || 0)) > 8) return;
          const r0 = (V.ps[0] && V.ps[0].r || []).find(r => r && typeof r.t === "string" && r.t.trim());
          if (!r0) return;
          const x = v98dkStripLab(lt, r0.t);
          if (x == null || !x) return;
          r0.t = (r0.t.match(/^\s*/) || [""])[0] + x;
          out.lab.push({ si: si + 1, t: lt }); try { delete V.mh; } catch (z) { }
        });
      });
    });
    if (out.sp.length) v98dkN("proofSp", out.sp.length);
    if (out.lab.length) v98dkN("proofLab", out.lab.length);
  } catch (e) { v98dkErr("proof", e); }
  return out;
}
V98DECK.proof = v98dkProof;

/* ══════════ No.547 はみ出しを 0 件に（小さく → 同じ段にそろえる → 要約。全文はノートに） ══════════ */
const V98DK_NOTE = { en: "Full text (shortened on the slide):", es: "Texto completo (resumido en la diapositiva):", fr: "Texte complet (abrégé sur la diapositive) :", de: "Volltext (auf der Folie gekürzt):", zhCN: "完整内容（幻灯片上已缩短）：", zhTW: "完整內容（投影片上已縮短）：", ko: "전체 내용 (슬라이드에서는 줄였습니다):", ja: "全文（スライドでは短くしています）：" };
function v98dkNoteLab(lang) { return V98DK_NOTE[lang] || V98DK_NOTE[/^zh(TW|HK)/.test(lang) ? "zhTW" : /^zh/.test(lang) ? "zhCN" : ""] || V98DK_NOTE.en; }
function v98dkH(e, deck) { try { return dk3TextHeight(e, deck.lang, deck, e.w * DK3_SAFE); } catch (x) { return 0; } }
function v98dkOver(e, deck) { if (v98dkSkipEl(e) || e.name === "foot") return false; const h = e.mh != null ? e.mh : v98dkH(e, deck); return h > e.h + 3; }
/* 同じ段のカード（同じ幅・高さで横か縦に並ぶ）の文字の大きさ */
function v98dkSibSz(e, S) {
  try {
    const sib = (S.els || []).filter(x => x !== e && x && x.k === "text" && !v98dkSkipEl(x) && Math.abs(x.w - e.w) < 2 && Math.abs(x.h - e.h) < 2 && (Math.abs(x.y - e.y) < 2 || Math.abs(x.x - e.x) < 2) && (x.ps || []).length === (e.ps || []).length);
    if (!sib.length) return null;
    return e.ps.map((p, i) => Math.min(...sib.map(x => +(((x.ps[i] || {}).r || [])[0] || {}).sz || 99)));
  } catch (x) { return null; }
}
/* 段落の文を後ろから短くする（文 → 句の区切り）。短くできなければ false */
function v98dkShorten(p, lang) {
  const rs = (p.r || []).filter(r => r && typeof r.t === "string");
  if (!rs.length) return false;
  const full = rs.map(r => r.t).join("");
  const cjk = /^(zh|ja|ko)/.test(lang);
  const ss = v98dkSents(full);
  let nx = "";
  if (ss.length > 1) nx = ss.slice(0, -1).join(cjk ? "" : " ");
  else {
    const s = full.trim();
    const end = cjk ? "。" : ".";
    /* 切る所は、意味の区切り（, so ・, which ・; など）を先に。並べた語の「A, B and C」の読点では切らない */
    const groups = cjk ? [["，", "；"], ["、"]] : [[", so ", ", which ", ", with ", "; ", " — ", ", and ", ", but ", ", while "], [" so ", " which ", " with ", " and "], [", "]];
    const minAt = Math.min(24, s.length * 0.35);
    let best = -1;
    for (const g of groups) {
      g.forEach(c => {
        let i = s.lastIndexOf(c);
        while (i >= minAt) {
          const rest = s.slice(i + c.length).split(/[.;:!?]/)[0];
          const listComma = c === ", " && /\s(?:and|or)\s/.test(rest) && rest.split(/\s+/).length <= 8;
          if (!listComma) break;
          i = s.lastIndexOf(c, i - 1);
        }
        if (i >= minAt && i > best) best = i;
      });
      if (best >= 0) break;
    }
    if (best < 0) return false;
    nx = s.slice(0, best).replace(/[,;:\s—–-]+$/, "") + end;
    if (nx.split(/\s+/).length < (cjk ? 1 : 4)) return false;
  }
  if (!nx.trim() || nx.trim() === full.trim()) return false;
  /* 1つ目の run の書式で1つにまとめる（説明の段落は1色） */
  rs[0].t = nx.trim();
  for (let i = 1; i < rs.length; i++) rs[i].t = "";
  p.r = p.r.filter((r, i) => i === 0 || (r && r.t));
  return true;
}
V98DECK.shorten = v98dkShorten;
function v98dkFitEl(e, S, deck, rep, si) {
  const lang = deck.lang;
  try {
    delete e.mh;
    let h = v98dkH(e, deck);
    if (h <= e.h + 3) { e.mh = h; return true; }
    const base = e.ps.map(p => p.r.map(r => r.sz || 14));
    /* ① 小さく（8.5pt まで） */
    if (typeof dk3Fit === "function") { dk3Fit(e, lang, deck, 0.5); h = e.mh != null ? e.mh : v98dkH(e, deck); }
    if (h <= e.h + 3) { rep.shrunk.push({ si, t: v98dkElTxt(e).slice(0, 40) }); return true; }
    /* ② 要約：長い段落の後ろから短くする。全文はノートへ */
    const full0 = e.ps.map(p => (p.r || []).map(r => String(r.t || "")).join("")).join("\n");
    const sib = v98dkSibSz(e, S);
    let n = 0;
    while (n++ < 10) {
      const cand = e.ps.map((p, i) => ({ p, i, len: (p.r || []).map(r => String(r.t || "")).join("").length })).filter(x => !(e.ps.length > 1 && x.i === 0 && x.len < 60));
      cand.sort((a, b) => b.len - a.len);
      let cut = false;
      for (const c of cand) { if (v98dkShorten(c.p, lang)) { cut = true; break; } }
      if (!cut) break;
      e.ps.forEach((p, i) => p.r.forEach((r, j) => { r.sz = sib && sib[i] && sib[i] < 99 ? sib[i] : (base[i][j] || r.sz); }));   /* 同じ段のカードと同じ大きさから測る */
      delete e.mh;
      h = v98dkH(e, deck);
      if (h > e.h + 3 && typeof dk3Fit === "function") { dk3Fit(e, lang, deck, 0.5); h = e.mh != null ? e.mh : v98dkH(e, deck); }
      if (h <= e.h + 3) break;
    }
    const now = e.ps.map(p => (p.r || []).map(r => String(r.t || "")).join("")).join("\n");
    if (now !== full0) {
      S.notes = (S.notes ? S.notes + "\n\n" : "") + v98dkNoteLab(lang) + "\n" + full0;
      rep.cut.push({ si, a: full0.replace(/\n/g, " ").slice(0, 60), b: now.replace(/\n/g, " ").slice(0, 60) });
    }
    e.mh = h;
    if (h <= e.h + 3) return true;
    rep.left.push({ si, t: now.replace(/\n/g, " ").slice(0, 40) });
    return false;
  } catch (x) { v98dkErr("fitel", x); return false; }
}
function v98dkFitAll(deck) {
  const rep = { shrunk: [], cut: [], left: [] };
  try {
    if (!deck || !Array.isArray(deck.slides) || typeof dk3TextHeight !== "function" || typeof DK3_SAFE === "undefined") return rep;
    deck.slides.forEach((S, i) => (S && S.els || []).forEach(e => { if (v98dkOver(e, deck)) v98dkFitEl(e, S, deck, rep, i + 1); }));
    if (rep.shrunk.length || rep.cut.length) v98dkN("fit", rep.shrunk.length + rep.cut.length);
  } catch (e) { v98dkErr("fitall", e); }
  return rep;
}
V98DECK.fitAll = v98dkFitAll;
function v98dkCountOver(deck) { const L = []; try { (deck.slides || []).forEach((S, i) => (S.els || []).forEach(e => { if (!v98dkSkipEl(e) && e.name !== "foot") { const h = e.mh != null ? e.mh : v98dkH(e, deck); if (h > e.h + 3) L.push(i + 1); } })); } catch (e) { } return L; }
V98DECK.countOver = v98dkCountOver;

/* PowerPoint のノート（話す人のメモ）：要約したページの全文。ノートのあるページがあるときだけ、ノートの部品を足す */
const V98DK_NM = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="381000" y="685800"/><a:ext cx="6096000" cy="3429000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="12700"><a:solidFill><a:prstClr val="black"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="4343400"/><a:ext cx="5486400" cy="4114800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle/><a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US"/><a:t>Notes</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:notesStyle><a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr></p:notesStyle></p:notesMaster>`;
function v98dkX(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""); }
function v98dkNotesXml(txt, lang) {
  const L = (typeof DK3_LANGF !== "undefined" && DK3_LANGF[lang]) ? DK3_LANGF[lang].lang : "en-US";
  const ps = String(txt).split("\n").map(l => l ? `<a:p><a:r><a:rPr lang="${v98dkX(L)}" dirty="0"/><a:t>${v98dkX(l)}</a:t></a:r></a:p>` : `<a:p><a:endParaRPr lang="${v98dkX(L)}"/></a:p>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="3" sz="quarter"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${ps}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
}
function v98dkAddNotes(files, deck) {
  try {
    const S = deck.slides || [];
    const idx = S.map((s, i) => (s && s.notes ? i : -1)).filter(i => i >= 0);
    if (!idx.length) return files;
    const dec = new TextDecoder(), enc = new TextEncoder();
    const get = (n) => { const f = files.find(x => x[0] === n); return f ? (typeof f[1] === "string" ? f[1] : dec.decode(f[1])) : null; };
    const put = (n, s) => { const f = files.find(x => x[0] === n); const v = (f && typeof f[1] !== "string") ? enc.encode(s) : s; if (f) f[1] = v; else files.push([n, v]); };
    const asStr = files.some(x => x[0] === "[Content_Types].xml" && typeof x[1] === "string");
    const mk = (s) => asStr ? s : enc.encode(s);
    let ct = get("[Content_Types].xml"), pr = get("ppt/presentation.xml"), prr = get("ppt/_rels/presentation.xml.rels"), th = get("ppt/theme/theme1.xml");
    if (!ct || !pr || !prr || !th) return files;
    /* ノートの親（ノートのマスター・そのテーマ） */
    files.push(["ppt/notesMasters/notesMaster1.xml", mk(V98DK_NM)]);
    files.push(["ppt/notesMasters/_rels/notesMaster1.xml.rels", mk(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme2.xml"/></Relationships>`)]);
    files.push(["ppt/theme/theme2.xml", mk(th)]);
    let add = `<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/><Override PartName="/ppt/theme/theme2.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
    idx.forEach(i => {
      const n = i + 1;
      files.push([`ppt/notesSlides/notesSlide${n}.xml`, mk(v98dkNotesXml(S[i].notes, deck.lang))]);
      files.push([`ppt/notesSlides/_rels/notesSlide${n}.xml.rels`, mk(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${n}.xml"/></Relationships>`)]);
      add += `<Override PartName="/ppt/notesSlides/notesSlide${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
      const rn = `ppt/slides/_rels/slide${n}.xml.rels`, rx = get(rn);
      if (rx) put(rn, rx.replace("</Relationships>", `<Relationship Id="rNt1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${n}.xml"/></Relationships>`));
    });
    put("[Content_Types].xml", ct.replace("</Types>", add + "</Types>"));
    put("ppt/_rels/presentation.xml.rels", prr.replace("</Relationships>", `<Relationship Id="rIdNm1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/></Relationships>`));
    if (pr.indexOf("notesMasterIdLst") < 0) put("ppt/presentation.xml", pr.replace("</p:sldMasterIdLst>", `</p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rIdNm1"/></p:notesMasterIdLst>`));
    v98dkN("pptxNotes", idx.length);
  } catch (e) { v98dkErr("notes", e); }
  return files;
}
if (typeof dk3BuildPptx === "function" && typeof zipStore === "function") {
  const __bp98 = dk3BuildPptx;
  dk3BuildPptx = function (deck) {
    if (!deck || !(deck.slides || []).some(s => s && s.notes)) return __bp98.apply(this, arguments);
    const z0 = zipStore;
    try { zipStore = function (files) { return z0.call(this, v98dkAddNotes(files, deck)); }; return __bp98.apply(this, arguments); }
    finally { zipStore = z0; }
  };
}

/* ══════════ 最終チェック：校正・主張・はみ出しを、最後に効く所でまとめて ══════════ */
function v98dkPg(L) { return [...new Set(L.map(x => x.si))].sort((a, b) => a - b).join("・"); }
if (typeof dk3Check === "function") {
  const __ck98 = dk3Check;
  dk3Check = function (deck, ctx) {
    let P = null;
    const t0 = Date.now();
    try {
      if (deck && Array.isArray(deck.slides) && deck.lang) {
        const T = v98dkTen(), fx = deck.lang !== "ja";
        /* 校正・主張は外国語の資料だけ。はみ出しは日本語の資料も同じに直す */
        P = { proof: fx ? v98dkProof(deck, T) : { sp: [], lab: [] }, claims: fx ? v98dkDeckClaims(deck, ctx) : { fix: [], left: [] }, fit: null, fx };
        P.fit = v98dkFitAll(deck);
      }
    } catch (e) { v98dkErr("ck0", e); }
    const t1 = Date.now();
    const r = __ck98.apply(this, arguments);
    const t2 = Date.now();
    try {
      if (!r || !P) return r;
      r.crit = r.crit || []; r.warn = r.warn || []; r.ok = r.ok || [];
      /* ほかの層の直し（訳語・年数など）の後に、同じ物差しでもう一度測る */
      let over = v98dkCountOver(deck);
      if (over.length) { const f2 = v98dkFitAll(deck); ["shrunk", "cut", "left"].forEach(k => { P.fit[k] = P.fit[k].concat(f2[k]); }); over = v98dkCountOver(deck); }
      /* もう一度、空白の欠けを点検（ほかの層の直しで入った文も） */
      if (P.fx) { const p2 = v98dkProof(deck, v98dkTen()); P.proof.sp = P.proof.sp.concat(p2.sp); P.proof.lab = P.proof.lab.concat(p2.lab); }
      const F = P.fit;
      const i = r.crit.findIndex(c => c && c.k === "over");
      if (!over.length) {
        if (i >= 0) { r.crit.splice(i, 1); r.score = Math.min(100, (+r.score || 0) + 18); }
        r.ok = r.ok.filter(x => !/^文字のはみ出し：なし$/.test(String(x)));
        r.ok.push(F.shrunk.length || F.cut.length ? "文字のはみ出し：0件（" + (F.shrunk.length ? F.shrunk.length + "か所は文字を小さくし" + (F.cut.length ? "、" : "") : "") + (F.cut.length ? F.cut.length + "か所は文を短くして" : "") + "枠に収めました" + (F.cut.length ? "。短くした文の全文は、そのページの話す人のメモ（PowerPoint のノート）に残しています：" + v98dkPg(F.cut) + "枚目" : "") + "）" : "文字のはみ出し：なし");
      } else if (i >= 0) r.crit[i] = Object.assign({}, r.crit[i], { t: "文字が枠からはみ出しているページがあります（" + [...new Set(over)].join("・") + "枚目）" });
      if (!r.crit.length) r.pass = true;
      const sp = P.proof.sp, lab = P.proof.lab;
      if (sp.length || lab.length) r.ok.push("英文の校正：" + [sp.length ? "単語の間の空白 " + sp.length + "か所" : "", lab.length ? "ラベルの重複 " + lab.length + "か所" : ""].filter(Boolean).join("・") + "を直しました（" + sp.concat(lab).slice(0, 3).map(x => x.si + "枚目「" + String(x.to || x.t || "").replace(/\n|↵/g, " ").slice(0, 28) + "」").join("／") + "）");
      else if (P.fx && V98DK_LATIN.test(deck.lang)) r.ok.push("英文の校正：単語の間の空白の欠け・ラベルの重複はありません");
      const CL = P.claims, fixP = ((ctx && ctx.v98fix) || (DK3G && DK3G.v98fix) || []);
      const nFix = CL.fix.length + fixP.length;
      if (nFix) r.ok.push("外した主張と同じ趣旨の言い方だけを直して残した文 " + nFix + "件（" + CL.fix.map(x => ({ a: x.a, b: x.b })).concat(fixP).slice(0, 2).map(x => "「" + String(x.a).slice(0, 30) + "」→「" + String(x.b).slice(0, 30) + "」").join("／") + "）");
      if (CL.left.length) r.warn.push({ k: "v98claim", t: "外した主張と同じ趣旨の言葉が " + v98dkPg(CL.left) + "枚目に残っています（" + CL.left.slice(0, 2).map(x => "「" + x.t + "」").join("・") + "）。登録の値の言い方を確かめてください" });
      V98DECK.last = { at: Date.now(), over: over.length, fit: { shrunk: F.shrunk.length, cut: F.cut.length, left: F.left.length }, sp: sp.length, lab: lab.length, claimFix: nFix, claimLeft: CL.left.length, notes: (deck.slides || []).filter(s => s && s.notes).length, ms: { pre: t1 - t0, inner: t2 - t1, post: Date.now() - t2 } };
    } catch (e) { v98dkErr("ck", e); }
    return r;
  };
}
/* 言い方を直した文（計画の段）を、最終チェックに渡す */
if (typeof dk3Plan === "function") {
  const __pl98 = dk3Plan;
  dk3Plan = async function (lang, say, force, T) {
    const r = await __pl98.apply(this, arguments);
    try { if (typeof DK3G !== "undefined" && DK3G) DK3G.v98fix = (r && r.v98fix) ? r.v98fix.map(x => ({ a: x.a, b: x.b })) : []; } catch (e) { v98dkErr("plan", e); }
    return r;
  };
}
/* 保存した資料を開いたとき：改行の前の空白の欠けを直す（文字だけ。配置は変えない） */
if (typeof dk14Open === "function") {
  const __op98 = dk14Open;
  dk14Open = async function (id) {
    const r = await __op98.apply(this, arguments);
    try { if (typeof DK3G !== "undefined" && DK3G && DK3G.deck && !DK3G.run && DK3G.deck.lang && DK3G.deck.lang !== "ja") { const P = v98dkProof(DK3G.deck, v98dkTen()); if (P.sp.length || P.lab.length) v98dkN("openProof"); } } catch (e) { v98dkErr("open", e); }
    return r;
  };
}

/* ══════════ 書く・訳す依頼に、言葉の強さを変えない決まりを足す（元から強い訳・言い換えを出しにくくする） ══════════ */
const V98DK_RULE_PLAN = "\n- 根拠の言葉の強さ・意味を変えない：除菌＝sanitizing／germ removal（disinfection・bactericidal・sterilization・kills germs にしない）、抗菌＝antibacterial、殺菌＝bactericidal、滅菌＝sterilization。熟成・長期熟成（aged・matured・long-aged）は根拠に「熟成」の記載がある時だけ。低振動＝low vibration（ultra-low・industry-leading にしない）。根拠に無い強調（ultra・extremely・the lowest など）を足さない。同じ数字を言葉（three nines・half a year）で言い換えない。\n";
const V98DK_RULE_TR = "\n追加のルール（言葉の強さ）：除菌＝germ removal／sanitizing（bactericidal・disinfection・sterilization にしない）、抗菌＝antibacterial、殺菌＝bactericidal、消毒＝disinfection、滅菌＝sterilization。値の頭に項目名がある（例：「原材料名：大豆」）ときは項目名を繰り返さない。英語の語と語の間には必ず空白を入れる。\n";
if (typeof llmAsk === "function") {
  const __la98 = llmAsk;
  llmAsk = function (q, maxTok, opts) {
    try {
      const o = opts || {};
      const sys = String(o.sys || "");
      if (typeof q === "string" && !o._retry2) {
        if (/B2B export copywriter/.test(sys) && q.indexOf("根拠の言葉の強さ・意味を変えない") < 0) {
          const i = q.indexOf("■JSONの形");
          if (i > 0) { q = q.slice(0, i) + V98DK_RULE_PLAN.slice(1) + q.slice(i); v98dkN("rulePlan"); }
        } else if (/professional trade translator/.test(sys) && /^次のJSONの値のうち日本語の部分だけを/.test(q) && q.indexOf("追加のルール（言葉の強さ）") < 0) {
          const i = q.lastIndexOf("\n{");
          q = i > 0 ? q.slice(0, i) + V98DK_RULE_TR + q.slice(i + 1) : q + V98DK_RULE_TR;
          v98dkN("ruleTr");
        }
      }
    } catch (e) { v98dkErr("la", e); }
    return __la98.call(this, q, maxTok, opts);
  };
}

/* ══════════ No.522 依頼のくり返しの記録（AI の回数は増やさない。数えるだけ） ══════════ */
(function () {
  try {
    if (typeof llmAsk !== "function") return;
    const __la98b = llmAsk;
    llmAsk = function (q, maxTok, opts) {
      try {
        if (typeof DK3G !== "undefined" && DK3G && DK3G.run && typeof q === "string") {
          const R = V98DECK.calls || (V98DECK.calls = { at: 0, seen: {}, n: 0, dup: 0, kinds: {} });
          if (Date.now() - R.at > 20 * 60000 || R.run !== DK3G.at0) { V98DECK.calls = { at: Date.now(), seen: {}, n: 0, dup: 0, kinds: {}, run: DK3G.at0 }; }
          const C = V98DECK.calls;
          const k = (typeof djb2 === "function") ? djb2(String((opts && opts.sys) || "") + "|" + q) : q.length + ":" + q.slice(0, 80);
          const kind = (typeof v80docKind === "function") ? v80docKind(q, opts) : "other";
          C.n++; C.kinds[kind] = (C.kinds[kind] || 0) + 1;
          if (C.seen[k]) C.dup++; C.seen[k] = (C.seen[k] || 0) + 1;
        }
      } catch (e) { }
      return __la98b.apply(this, arguments);
    };
  } catch (e) { v98dkErr("calls", e); }
})();
if (typeof dk3Generate === "function") {
  const __g98 = dk3Generate;
  dk3Generate = async function (lang, force) {
    try { if (typeof DK3G !== "undefined" && DK3G && !DK3G.run) { DK3G.at0 = Date.now(); DK3G.v98fix = []; } } catch (e) { }
    return __g98.apply(this, arguments);
  };
}

/* 外した文言の理由（同じ判定から書いた理由）の英・中・西 */
const V98DK_WTR = {
  "熟成": ["aging", "熟成（陈化）", "maduración"], "除菌・殺菌": ["germ removal / disinfection", "除菌/杀菌", "eliminación de gérmenes / desinfección"],
  "殺菌・消毒": ["disinfection, killing germs", "杀菌/消毒", "desinfección"], "除菌": ["germ removal", "除菌", "eliminación de gérmenes"], "滅菌": ["sterilization", "灭菌", "esterilización"]
};
function v98dkWhyTr(w, l) {
  try {
    w = String(w || "");
    if (!/根拠に無い主張：|は登録どおり|言い方が根拠より強い|外した文言と同じ主張（[\s\S]*）・根拠|の文だけを外しました|の言葉だけを外しました|登録の言い方に直しました/.test(w)) return null;
    const li = l === "zh" ? 1 : l === "es" ? 2 : 0;
    const J = (s) => String(s).replace(/熟成|除菌・殺菌|殺菌・消毒|滅菌|除菌/g, m => (V98DK_WTR[m] || [m, m, m])[li]);
    const T = [
      [/根拠に無い数字：([^・（）]+)/g, ["figure not in the evidence: $1", "依据中没有的数字：$1", "cifra que no está en las fuentes: $1"]],
      [/根拠に無い主張：([^・（）]+)（登録・資料に[^（）]+の記載がありません）/g, ["claim not in the evidence: $1 (not mentioned in your registered data or materials)", "依据中没有的主张：$1（登记信息和资料中均未提及）", "afirmación que no está en las fuentes: $1 (no figura en sus datos ni materiales)"]],
      [/数字 ([^・（）]+?) は登録どおり/g, ["the figure $1 matches your registered data", "数字 $1 与登记一致", "la cifra $1 coincide con sus datos registrados"]],
      [/言い方が根拠より強い：「([^」]+)」（([^（）]+)の意味）／登録は「([^」]+)」/g, ["wording stronger than the evidence: “$1” (means $2; registered as “$3”)", "措辞强于依据：“$1”（意为$2；登记为“$3”）", "expresión más fuerte que las fuentes: «$1» (significa $2; registrado como «$3»)"]],
      [/言い方が根拠より強い：「([^」]+)」/g, ["wording stronger than the evidence: “$1”", "措辞强于依据：“$1”", "expresión más fuerte que las fuentes: «$1»"]],
      [/外した文言と同じ主張（([^（）]+)）・根拠に無い/g, ["same claim as a removed statement ($1), not in the evidence", "与已删除文字相同的主张（$1），依据中没有", "misma afirmación que una frase quitada ($1), no está en las fuentes"]],
      [/外した文言と同じ主張（([^（）]+)）・根拠より強い言い方/g, ["same claim as a removed statement ($1), wording stronger than the evidence", "与已删除文字相同的主张（$1），措辞强于依据", "misma afirmación que una frase quitada ($1), expresión más fuerte que las fuentes"]],
      [/AIの根拠確認：/g, ["AI evidence check: ", "AI 依据确认：", "revisión de fuentes por IA: "]]
    ];
    let s = w;
    T.forEach(([re, t]) => { s = s.replace(re, (...a) => { let x = t[li]; for (let k = 1; k <= 3; k++) x = x.replace("$" + k, J(a[k] == null ? "" : a[k])); return x; }); });
    s = s.replace(/・/g, li === 1 ? "；" : "; ").replace(/（/g, li === 1 ? "（" : " (").replace(/）/g, li === 1 ? "）" : ")");
    if (li !== 1) s = s.replace(/：/g, ": ").replace(/「/g, li === 2 ? "«" : "“").replace(/」/g, li === 2 ? "»" : "”");
    return s;
  } catch (e) { v98dkErr("whytr", e); return null; }
}
if (typeof i13Why === "function") {
  const __iw98 = i13Why;
  i13Why = function (w, l) { try { const x = v98dkWhyTr(w, l); if (x != null) return x; } catch (e) { } return __iw98.apply(this, arguments); };
}

/* ══════════ 画面の訳（最終チェックの新しい行） ══════════ */
(function () {
  const pg = (s, l) => String(s).replace(/(\d+)枚目/g, l === 0 ? "slide $1" : l === 1 ? "第$1页" : "diap. $1");
  const rows = [
    { re: /^文字のはみ出し：0件（([\s\S]*)）$/,
      en: (m) => "Text overflow: none (" + m[1].replace(/(\d+)か所は文字を小さくし、?/, "$1 box(es) set in smaller type, ").replace(/(\d+)か所は文を短くして/, "$1 box(es) shortened ").replace(/枠に収めました/, "to fit").replace(/。短くした文の全文は、そのページの話す人のメモ（PowerPoint のノート）に残しています：/, ". The full text is kept in the speaker notes (PowerPoint notes): ").replace(/(\d+)枚目/g, "slide $1").replace(/・/g, ", ") + ")",
      zh: (m) => "文字溢出：0 处（" + m[1].replace(/(\d+)か所は文字を小さくし、?/, "$1 处缩小字号，").replace(/(\d+)か所は文を短くして/, "$1 处缩短文字后").replace(/枠に収めました/, "放入框内").replace(/。短くした文の全文は、そのページの話す人のメモ（PowerPoint のノート）に残しています：/, "。缩短前的全文保留在该页的演讲者备注（PowerPoint 备注）中：").replace(/(\d+)枚目/g, "第$1页") + "）",
      es: (m) => "Texto desbordado: ninguno (" + m[1].replace(/(\d+)か所は文字を小さくし、?/, "$1 cuadro(s) con letra más pequeña, ").replace(/(\d+)か所は文を短くして/, "$1 cuadro(s) resumidos ").replace(/枠に収めました/, "para que quepan").replace(/。短くした文の全文は、そのページの話す人のメモ（PowerPoint のノート）に残しています：/, ". El texto completo queda en las notas del orador (notas de PowerPoint): ").replace(/(\d+)枚目/g, "diap. $1").replace(/・/g, ", ") + ")" },
    { re: /^英文の校正：([\s\S]*)を直しました（([\s\S]*)）$/,
      en: (m) => "English proofreading: fixed " + m[1].replace(/単語の間の空白 (\d+)か所/, "$1 missing space(s) between words").replace(/ラベルの重複 (\d+)か所/, "$1 duplicated label(s)").replace(/・/g, " and ") + " (" + pg(m[2], 0).replace(/／/g, " / ").replace(/「/g, "“").replace(/」/g, "”") + ")",
      zh: (m) => "英文校对：已修正" + m[1].replace(/単語の間の空白 (\d+)か所/, "单词间缺少的空格 $1 处").replace(/ラベルの重複 (\d+)か所/, "重复的标签 $1 处") + "（" + pg(m[2], 1) + "）",
      es: (m) => "Corrección del texto: se corrigieron " + m[1].replace(/単語の間の空白 (\d+)か所/, "$1 espacio(s) faltante(s) entre palabras").replace(/ラベルの重複 (\d+)か所/, "$1 etiqueta(s) duplicada(s)").replace(/・/g, " y ") + " (" + pg(m[2], 2).replace(/／/g, " / ").replace(/「/g, "«").replace(/」/g, "»") + ")" },
    { re: /^英文の校正：単語の間の空白の欠け・ラベルの重複はありません$/, en: "English proofreading: no missing spaces between words or duplicated labels", zh: "英文校对：没有单词间缺少空格或重复的标签", es: "Corrección del texto: no faltan espacios entre palabras ni hay etiquetas duplicadas" },
    { re: /^外した主張と同じ趣旨の言い方だけを直して残した文 (\d+)件（([\s\S]*)）$/,
      en: (m) => m[1] + " statement(s) kept after removing only the wording that made the same claim as a removed statement (" + m[2].replace(/「/g, "“").replace(/」/g, "”").replace(/／/g, " / ") + ")", zh: "仅修改与已删除主张相同意思的措辞后保留的文字 $1 条（$2）", es: (m) => m[1] + " frase(s) conservadas tras quitar solo la expresión con la misma afirmación que una frase quitada (" + m[2].replace(/「/g, "«").replace(/」/g, "»").replace(/／/g, " / ") + ")" },
    { re: /^外した主張と同じ趣旨の言葉が ([\d・]+)枚目に残っています（([\s\S]*)）。登録の値の言い方を確かめてください$/,
      en: (m) => "Words with the same meaning as a removed claim remain on slide " + m[1].replace(/・/g, ", ") + " (" + m[2] + "). Check the wording of the registered values", zh: "与已删除主张同义的措辞仍在第 $1 页（$2）。请确认登记值的措辞", es: (m) => "Quedan palabras con el mismo sentido que una afirmación quitada en la diapositiva " + m[1].replace(/・/g, ", ") + " (" + m[2] + "). Revise la redacción de los valores registrados" }
  ];
  try { if (typeof v97dkPat === "function") v97dkPat(rows); else if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) rows.slice().reverse().forEach(p => I18N.pat.unshift(p)); } catch (e) { v98dkErr("pat", e); }
})();
