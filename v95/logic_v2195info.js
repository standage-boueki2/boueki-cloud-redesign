/* ═══ v21.95 info（2026-11-17 改修一覧の週次レビュー・第6回 UAT）商品情報・補完パネル・AI要約・英文社名
   No.481（中）「足りないのはX項目」の件数と並べた項目が合わない
     原因：項目名そのものに「・」が入っている（寸法・重量／成分表・材質表／パレット・コンテナ入数／認証・規格…）のに、項目と項目の間も「・」でつないでいる。
     直し：日本語の表示のときだけ、画面の上で、項目の区切りの「・」を「、」に置き換える（項目名は NEED・業種ごとの名前の辞書で切り分ける）。
           データの文は変えない（英中西の訳 tidyMsgs が「・」つなぎを辞書で切り分けて訳しているため）。
   No.485（高）補完パネル（足りない項目を入れる）の未保存の入力が、パネル内の「価格表を編集」などを開くと消える
     原因：パネルの [data-v92ijump] は openTableEdit／openStrEdit を呼ぶだけで、入力中の値を控えない。openDW は同じ #pn を置き換え、tblSave・strSave は closeDW で終わる。
     直し：パネルの入力を商品ごとに控える（メモリだけ）。パネルから開いた編集の窓を閉じたら（保存・キャンセルとも）パネルを開き直し、控えた値を戻して「まだ保存していません」と出す。
           パネルの「保存して反映」「キャンセル」で控えを消す（保存で入らなかった欄の値は残して戻す）。
   No.488（中）AI の要約で、手で入れた項目まで「資料から取り込んだ」と書く
     原因：buildSummary は値の出どころを見ない。21.54 は「手入力（資料なし）」の商品の強みの文だけ直していた。NEED の項目には出どころの記録が無い。
     直し：手で入れる入口（ヒアリング fillAnswer・パネルの保存・strSave・tblSave）の前後で値を比べ、変わった項目に印（TEN.v95hand）。
           要約は、手入力の商品か印のある項目なら「登録されています（あとから入れた分を含みます）」と書く。
   No.489（中）認証・規格に「なし」と入れても「未登録」
     原因：ヒアリングの「答えたくない」の判定 REFUSE_RE に「なし」が入っていて、認証・規格でも後回しにしていた（画面の例は「無ければ『なし』」と案内）。
     直し：今の質問が認証・規格のときだけ、なし・無し・特になし・ありません 等を「なし」として登録して次へ。
   No.490（中）商品の強みの必要件数が画面で違う（商品情報 1件／営業資料 3件以上）＝決めてほしいこと（推奨 A＝3件にそろえる）で作る
     直し：V95INFO.STRN（既定 3）。強みが 1〜2件の商品は、充足度の数え方（scoreOf・v54upldHas・v92prodHas・v92itemMiss・v92itemPct）で「まだ」。
           補完パネルに「＋ 強みを追加」の行を足す。STRN を 1 にすると B（営業資料も1件で可）になる。
   No.496（低）AI 相談の挨拶「全成分表（INCI）1項目」と実際（INCI 名の変換 0件）が合わない
     直し：表の名前に INCI と書いてあり、INCI 名の変換がそろっていないときは「全成分表 N項目（INCI名に変換済み c/V成分）」と書く（挨拶と要約）。
   No.462（中）英文社名の「案」（21.92 の D7＝会社単位で決定済み）
     21.94 で出ない原因：① 案の出どころ v92docCoEnInfo が「英文社名の欄の英語」「会社名の欄の英語」「同じ会社のほかの商品」だけで、会社名が日本語だけだと出どころが無い
                       ② 刷新版の「今日やること」「営業資料」は自前の部品で描くため、21.92 の案（v202RowOf・dk3Gate の文）が画面に出ない。商品情報には案を出す所が無い（②は rd_v95info.js）
     直し：D7＝同じ会社のほかの商品に確かな英文社名があれば、この商品にも入れる（v95coEnFrom に、どの商品の名前かを控える・書類の下に1行）。
           会社名が日本語だけのときは会社名から案を作る（法人の種類→Co., Ltd. など・よくある語→英語・かな→ローマ字）。読めない漢字は［ ］で残し、押すと入力欄に入れて直してもらう。
           確かめて押すまで書類の Seller には入れない（21.54 の決め）。 */
var V95INFO = { err: [], STRN: 3, pd: null, n: { list: 0, sum: 0, inh: 0 } };
function v95infoErr(k, e) { try { V95INFO.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95INFO.err.length > 30) V95INFO.err.shift(); } catch (x) {} }
function v95infoLang() { try { if (typeof I18N !== "undefined" && I18N && I18N.lang) return I18N.lang; } catch (e) {} return "ja"; }
function v95infoJa() { return v95infoLang() === "ja"; }
function v95infoM(ja, en, zh, es) { const l = v95infoLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v95infoE(s) { s = String(s == null ? "" : s); return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v95infoTen() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
function v95infoUser(t) { return !!(t && (t.src === "upload" || t.src === "sample2")); }
function v95infoKey(t) { t = t || v95infoTen(); return t ? String(t.uid || (String(t.co || "") + "|" + String(t.item || ""))) : ""; }

/* ══ No.481 項目の区切り ══ */
function v95infoNames(t) {
  const S = new Set();
  try {
    t = t || v95infoTen();
    (typeof NEED !== "undefined" ? NEED : []).forEach((x) => {
      if (!x) return; S.add(String(x.n));
      try { if (typeof v79pNeedName === "function") { const n = v79pNeedName(x.k, t); if (n) S.add(String(n)); } } catch (e) {}
      try { if (typeof v92prodNm === "function") { const n = v92prodNm(x.k, t); if (n) S.add(String(n)); } } catch (e) {}
    });
  } catch (e) {}
  ["HSコード（推定のまま・未確定）", "HSコード（推定・要確認）", "HSコード（いまは推定・要確認）", "商品の強み（あと1件）", "商品の強み（あと2件）"].forEach((n) => S.add(n));
  return [...S].filter(Boolean).sort((a, b) => b.length - a.length);
}
/* 「A・B・C」を項目名の辞書で切る。返り値＝{cuts:[区切りの「・」の位置], n:項目の数}。切れなければ null */
function v95infoParse(str, K) {
  str = String(str || ""); const cuts = []; let i = 0, n = 0; const L = str.length;
  while (i < L) {
    let hit = ""; for (const k of K) { if (str.startsWith(k, i)) { hit = k; break; } }
    if (!hit) return null;
    i += hit.length; n++;
    if (str.startsWith("必須", i)) i += 2;
    if (i >= L) break;
    if (str[i] === "・") { cuts.push(i); i++; continue; }
    return null;
  }
  return n ? { cuts, n } : null;
}
/* 要素の中の文字（テキストノードをつないだもの）で、start 以降の項目の区切りを「、」に。直したら true */
function v95infoRejoinEl(el, startAfter, endBefore, expectN) {
  try {
    const nodes = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) nodes.push(w.currentNode);
    let all = ""; const map = []; nodes.forEach((nd) => { map.push([nd, all.length]); all += nd.nodeValue; });
    let s0 = 0; if (startAfter) { const j = all.indexOf(startAfter); if (j < 0) return false; s0 = j + startAfter.length; }
    let s1 = all.length; if (endBefore) { const j = all.indexOf(endBefore, s0); if (j >= 0) s1 = j; }
    let seg = all.slice(s0, s1);
    const tail = seg.match(/( ほか(?:\d+件)?| など)$/); if (tail) seg = seg.slice(0, -tail[0].length);
    const P = v95infoParse(seg, v95infoNames());
    if (!P || !P.cuts.length) return false;
    if (expectN && P.n !== expectN && !(tail && P.n < expectN)) return false;
    P.cuts.forEach((c) => { const pos = s0 + c; for (let i = map.length - 1; i >= 0; i--) { if (map[i][1] <= pos) { const nd = map[i][0], off = pos - map[i][1]; const v = nd.nodeValue; if (v[off] === "・") nd.nodeValue = v.slice(0, off) + "、" + v.slice(off + 1); break; } } });
    return true;
  } catch (e) { v95infoErr("rejoin", e); return false; }
}
function v95infoFixLists(root) {
  if (!v95infoJa()) return 0; root = root || document.body; if (!root || !root.querySelectorAll) return 0;
  let n = 0;
  root.querySelectorAll("b").forEach((b) => {
    try {
      if (b.getAttribute("data-v95n")) return;
      const m = String(b.textContent || "").trim().match(/^足りないのは(\d+)項目$/);
      if (!m || b.childElementCount) return;
      const nx = b.nextSibling; if (!nx || nx.nodeType !== 3) return;
      const v = String(nx.nodeValue); const m2 = v.match(/^（([\s\S]+?)( ほか)?）。/); if (!m2) return;
      const P = v95infoParse(m2[1], v95infoNames());
      b.setAttribute("data-v95n", "1");
      if (!P || !P.cuts.length) return;
      if (!(P.n === +m[1] || (m2[2] && P.n < +m[1]))) return;
      let s = m2[1]; P.cuts.slice().reverse().forEach((c) => { s = s.slice(0, c) + "、" + s.slice(c + 1); });
      nx.nodeValue = "（" + s + (m2[2] || "") + "）。" + v.slice(m2[0].length);
      n++;
    } catch (e) { v95infoErr("fix", e); }
  });
  V95INFO.n.list += n; return n;
}
(function () {
  try {
    let tm = 0;
    const run = () => { tm = 0; try { v95infoFixLists(document.body); } catch (e) {} };
    const mo = new MutationObserver(() => { if (!tm && v95infoJa()) tm = setTimeout(run, 60); });
    const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); run(); } catch (e) {} };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  } catch (e) { v95infoErr("mo", e); }
})();

/* ══ No.488 手で入れた項目の印 ══ */
function v95infoSnap(t) { const o = {}; try { (typeof NEED !== "undefined" ? NEED : []).forEach((x) => { try { o[x.k] = JSON.stringify(t[x.k] == null ? "" : t[x.k]); } catch (e) { o[x.k] = ""; } }); } catch (e) {} return o; }
function v95infoMark(t, k, why) { try { if (!t || !k) return; t.v95hand = Object.assign({}, t.v95hand || {}); t.v95hand[k] = why || "hand"; } catch (e) {} }
function v95infoDiffMark(t, b, why) { if (!t || !b) return []; const a = v95infoSnap(t); const ch = Object.keys(b).filter((k) => a[k] !== b[k]); ch.forEach((k) => v95infoMark(t, k, why)); return ch; }
/* 先に印を付けてから元の関数を呼ぶ（元の関数の中の syncTenant で要約が作り直されるため）。値が変わらなかった項目の印は外す */
function v95infoUnmark(t, k) { try { const H = Object.assign({}, t.v95hand || {}); delete H[k]; t.v95hand = H; } catch (e) {} }
function v95infoAround(f, why, keysFn) {
  return function () {
    const t = v95infoTen(); const user = !!(t && v95infoUser(t));
    const b = user ? v95infoSnap(t) : null, was = user ? Object.assign({}, t.v95hand || {}) : {};
    let pre = []; try { if (user && keysFn) pre = keysFn.apply(this, arguments) || []; } catch (e) {}
    pre.forEach((k) => v95infoMark(t, k, why));
    let r;
    try { r = f.apply(this, arguments); } catch (e) { pre.forEach((k) => { if (!was[k]) v95infoUnmark(t, k); }); throw e; }
    const done = () => { try { if (!b) return; const ch = v95infoDiffMark(t, b, why); pre.forEach((k) => { if (ch.indexOf(k) < 0 && !was[k]) v95infoUnmark(t, k); }); } catch (e) {} };
    if (r && typeof r.then === "function") r.then(done, done); else done();
    return r;
  };
}
if (typeof strSave === "function") strSave = v95infoAround(strSave, "hand", () => ["strengths"]);
if (typeof tblSave === "function") tblSave = v95infoAround(tblSave, "hand", () => { try { const K = TBL_KIND[__TBL.kind]; return K && K.r ? [K.r] : []; } catch (e) { return []; } });

/* ══ No.489 認証・規格の「なし」（ヒアリング） ＋ No.488 ヒアリングで入れた項目の印 ══ */
const V95_NONE = /^(?:なし|無し|ナシ|特になし|特に無し|とくになし|ありません|ないです|ない|取得していません|取得なし|未取得|認証なし|該当なし|none|no|n\/a)$/i;
if (typeof fillAnswer === "function") {
  const __fa95 = fillAnswer;
  const __fa95h = v95infoAround(__fa95, "hand", () => { try { return (typeof FILL !== "undefined" && FILL && FILL.cur && FILL.cur.k) ? [FILL.cur.k] : []; } catch (e) { return []; } });
  fillAnswer = function (v) {
    try {
      const cu = (typeof FILL !== "undefined" && FILL) ? FILL.cur : null, t = v95infoTen();
      const vs = String(v == null ? "" : v).trim().replace(/[。．.！!]+$/, "");
      if (cu && cu.k === "cert" && t && V95_NONE.test(vs)) {
        fillSay("u", v95infoE(String(v)));
        t.cert = "なし"; v95infoMark(t, "cert", "hand");
        let pct = ""; try { pct = scoreOf(t).pct; } catch (e) {}
        fillSay("ai", `<b>${v95infoE(cu.n || "認証・規格")}</b>を「なし」で登録しました（取得している認証・規格は無い、と記録しました。取得したら商品情報で書き換えられます）。${pct !== "" ? `充足度 <b>${pct}%</b>` : ""}`);
        try { if (typeof logU === "function") logU("fill", "認証・規格＝なし"); } catch (e) {}
        try { if (typeof saveTen === "function") saveTen(); } catch (e) {}
        try { if (typeof syncTenant === "function") syncTenant(); } catch (e) {}
        fillNext();
        return;
      }
    } catch (e) { v95infoErr("cert", e); }
    return __fa95h.apply(this, arguments);
  };
}

/* ══ No.490 商品の強みの件数（既定 3件にそろえる） ══ */
function v95infoStrN(a) { return (Array.isArray(a) ? a : []).filter((s) => { const x = Array.isArray(s) ? s[0] : s; return x != null && String(x).trim(); }).length; }
function v95infoStrShort(t) { if (!t || !(V95INFO.STRN > 1)) return 0; const n = v95infoStrN(t.strengths); return (n > 0 && n < V95INFO.STRN) ? V95INFO.STRN - n : 0; }
function v95infoStrOwner(v) {
  if (!Array.isArray(v)) return null;
  try { const t = v95infoTen(); if (t && t.strengths === v) return t; } catch (e) {}
  try { if (typeof TENS !== "undefined" && Array.isArray(TENS)) for (const t of TENS) if (t && t.strengths === v) return t; } catch (e) {}
  return null;
}
function v95infoHasWrap(f) { return function (v) { const r = f.apply(this, arguments); try { if (r && V95INFO.STRN > 1 && !V95INFO._raw && Array.isArray(v)) { const t = v95infoStrOwner(v); if (t && v95infoStrShort(t)) return false; } } catch (e) {} return r; }; }
if (typeof v54upldHas === "function") v54upldHas = v95infoHasWrap(v54upldHas);
if (typeof v92prodHas === "function") v92prodHas = v95infoHasWrap(v92prodHas);
/* v54upldGot は「資料から読み取れた項目」（取り込みの結果・prod No.484 の0項目の判定）。強みは1件でも読み取れたものとして数える（3件の基準は充足度だけ） */
if (typeof v54upldGot === "function") {
  const __ug95 = v54upldGot;
  v54upldGot = function () { const o = V95INFO._raw; V95INFO._raw = 1; try { return __ug95.apply(this, arguments); } finally { V95INFO._raw = o; } };
}
if (typeof scoreOf === "function") {
  const __so95 = scoreOf;
  scoreOf = function (t) {
    const s = __so95.apply(this, arguments);
    try {
      const sh = v95infoStrShort(t);
      if (sh && s && Array.isArray(s.filled) && s.filled.some((x) => x && x.k === "strengths")) {
        const x = s.filled.find((y) => y && y.k === "strengths");
        s.filled = s.filled.filter((y) => y !== x);
        const mk = new Set((s.missing || []).map((m) => m && m.k)); mk.add("strengths");
        const old = s.missing || [];
        s.missing = NEED.filter((y) => mk.has(y.k)).map((y) => old.find((m) => m && m.k === y.k) || (y.k === "strengths" ? x : y));
        s.pct = Math.round(s.filled.reduce((a, y) => a + (y.w || 0), 0) / WSUM * 100);
        s.v95strShort = sh;
      }
    } catch (e) { v95infoErr("score", e); }
    return s;
  };
}
function v95infoNeedOk(t, x) { try { return has(t[x.k]) && !(x.k === "hs" && t.hsGuess) && !(x.k === "strengths" && v95infoStrShort(t)); } catch (e) { return false; } }
(function () {
  try {
    if (typeof window.v92itemMiss === "function") {
      const o = window.v92itemMiss; V95INFO.miss0 = o;
      window.v92itemMiss = function (t) {
        const L = o.apply(this, arguments);
        try {
          const x = t || v95infoTen(); const sh = v95infoStrShort(x);
          if (Array.isArray(L) && sh && !L.some((y) => y && y.k === "strengths")) {
            let nm = "商品の強み"; try { if (typeof v92prodNm === "function") nm = v92prodNm("strengths", x) || nm; } catch (e) {}
            const it = { k: "strengths", n: nm, req: true, v95short: sh };
            const i = L.findIndex((y) => y && !y.req); if (i < 0) L.push(it); else L.splice(i, 0, it);
          }
        } catch (e) { v95infoErr("miss", e); }
        return L;
      };
    }
    if (typeof window.v92itemPct === "function") {
      const o = window.v92itemPct;
      window.v92itemPct = function (t) {
        const p = o.apply(this, arguments);
        try { const x = t || v95infoTen(); if (x && v95infoStrShort(x) && typeof NEED !== "undefined") { const sum = NEED.reduce((a, y) => a + y.w, 0); return sum ? Math.round(NEED.filter((y) => v95infoNeedOk(x, y)).reduce((a, y) => a + y.w, 0) / sum * 100) : p; } } catch (e) { v95infoErr("pct", e); }
        return p;
      };
    }
  } catch (e) { v95infoErr("item", e); }
})();
if (typeof dk3Gate === "function") {
  const __dg95 = dk3Gate;
  dk3Gate = function () {
    const G = __dg95.apply(this, arguments);
    try {
      if (Array.isArray(G) && V95INFO.STRN === 1) { const t = v95infoTen(); G.forEach((g) => { if (g && g.k === "str") { g.ok = v95infoStrN(t && t.strengths) >= 1; g.n = "商品の強み（1件以上）"; } }); }
    } catch (e) { v95infoErr("gate", e); }
    return G;
  };
}

/* ══ No.496 INCI の変換の数 ══ */
function v95infoInci(t) { try { if (!t || typeof v68pInciView !== "function") return null; const V = v68pInciView(t) || []; if (!V.length) return null; return { c: V.filter((x) => x && x.inci).length, n: V.length }; } catch (e) { return null; } }
function v95infoInciTitle(title) { return String(title || "").replace(/\s*[（(]\s*INCI(?:名)?\s*[)）]\s*/i, "").trim() || "全成分表"; }
if (typeof pushTo === "function") {
  const __pt95 = pushTo;
  pushTo = function (c, who, html) {
    try {
      if (who === "a" && typeof html === "string" && html.indexOf("さん専用のAIです") >= 0 && /項目／規制調査/.test(html) && typeof D !== "undefined" && D) {
        const ti = String(D.compTitle || ""), I = v95infoInci(v95infoTen());
        if (/INCI/i.test(ti) && I && I.c < I.n) {
          const n = (D.compRows || []).length; const from = (typeof esc === "function" ? esc(ti) : v95infoE(ti)) + " " + n + "項目";
          if (html.indexOf(from) >= 0) html = html.replace(from, v95infoE(v95infoInciTitle(ti)) + " " + n + "項目（INCI名に変換済み " + I.c + "/" + I.n + "成分）");
        }
      }
    } catch (e) { v95infoErr("greet", e); }
    return __pt95.apply(this, [c, who, html].concat([].slice.call(arguments, 3)));
  };
}

/* ══ No.488・496 AI の要約 ══ */
function v95infoSumFix(r, t) {
  r = String(r == null ? "" : r); if (!t) return r;
  const org = (typeof v54upldOrigin === "function") ? v54upldOrigin(t) : "file";
  if (org === "sample") return r;
  const H = t.v95hand || {}, man = org === "manual";
  const more = "（あとから入れた分を含みます）";
  if (t.strengths && t.strengths.length && (man || H.strengths)) {
    r = r.replace(/^資料から<b>強みを(\d+)点<\/b>読み取りました。/, "登録された<b>強みは$1点</b>です。");
    if (!man) r = r.replace(/^登録された<b>強みは(\d+)点<\/b>です。/, "登録された<b>強みは$1点</b>です" + more + "。");
    V95INFO.n.sum++;
  }
  if (t.priceRows && t.priceRows.length && (man || H.priceRows)) { r = r.replace(/価格表は<b>(\d+)行<\/b>を取り込みました。/, "価格表は<b>$1行</b>が登録されています" + (man ? "" : more) + "。"); V95INFO.n.sum++; }
  try {
    const ti = String(t.compTitle || ""), I = v95infoInci(t);
    if (/INCI/i.test(ti) && I && I.c < I.n && t.compRows && t.compRows.length) {
      const from = (typeof esc === "function" ? esc(ti) : v95infoE(ti)) + "は<b>" + t.compRows.length + "項目</b>。";
      if (r.indexOf(from) >= 0) r = r.replace(from, v95infoE(v95infoInciTitle(ti)) + "は<b>" + t.compRows.length + "項目</b>（INCI名に変換済み " + I.c + "/" + I.n + "成分）。");
    }
  } catch (e) { v95infoErr("suminci", e); }
  return r;
}
if (typeof buildSummary === "function") {
  const __bs95 = buildSummary;
  buildSummary = function (t, s) { const r = __bs95.apply(this, arguments); try { return v95infoSumFix(r, t); } catch (e) { v95infoErr("sum", e); return r; } };
}

/* ══ No.485 補完パネルの入力を控える ══ */
function v95infoPanel() { const pn = document.getElementById("pn"); return (pn && pn.querySelector(".v92if")) ? pn : null; }
function v95infoPanelGrab() {
  const pn = v95infoPanel(); if (!pn) return null;
  const vals = {}; pn.querySelectorAll("input[data-v92ik]").forEach((i) => { const v = String(i.value || ""); if (v.trim()) vals[i.getAttribute("data-v92ik")] = v; });
  const cs = pn.querySelector("#v92if_cat");
  const rows = [...pn.querySelectorAll("[data-v92irow]")].filter((r) => !r.getAttribute("data-v95row")).map((r) => r.getAttribute("data-v92irow"));
  return { uid: v95infoKey(), rows, vals, cat: cs ? String(cs.value || "") : "", at: Date.now() };
}
function v95infoPanelKeep(back) { const g = v95infoPanelGrab(); if (!g) return null; const o = V95INFO.pd && V95INFO.pd.uid === g.uid ? V95INFO.pd : null; V95INFO.pd = Object.assign(g, { back: back === undefined ? !!(o && o.back) : back }); return V95INFO.pd; }
function v95infoPanelRestore() {
  const pn = v95infoPanel(), pd = V95INFO.pd; if (!pn || !pd || pd.uid !== v95infoKey()) return 0;
  if (Date.now() - (pd.at || 0) > 6 * 3600e3) { V95INFO.pd = null; return 0; }
  let n = 0;
  pn.querySelectorAll("input[data-v92ik]").forEach((i) => { const k = i.getAttribute("data-v92ik"); if (pd.vals[k] != null && !String(i.value || "").trim()) { i.value = pd.vals[k]; n++; } });
  const cs = pn.querySelector("#v92if_cat"); if (cs && pd.cat && !cs.value) { cs.value = pd.cat; if (cs.value === pd.cat) n++; }
  if (n && !pn.querySelector(".v95pdnote")) {
    const body = pn.querySelector(".v92if"); const p = document.createElement("p");
    p.className = "nn v95pdnote"; p.setAttribute("role", "status"); p.setAttribute("data-noi18n", "1");
    p.textContent = v95infoM(`前に入れた ${n}件を戻しました（まだ保存していません。「保存して反映」で登録します）`, `Restored ${n} value(s) you entered before (not saved yet — press “Save” to register them)`, `已恢复之前填写的 ${n} 项（尚未保存，请点击“保存并反映”）`, `Se restauraron ${n} valor(es) que había introducido (aún sin guardar; pulse «Guardar»)`);
    body.insertBefore(p, body.firstChild);
  }
  return n;
}
function v95infoPanelStr() {
  const pn = v95infoPanel(), t = v95infoTen(); if (!pn || !t) return;
  const sh = v95infoStrShort(t); if (!sh || pn.querySelector('[data-v92irow="strengths"]')) return;
  const n = v95infoStrN(t.strengths);
  const row = document.createElement("div"); row.className = "v92ir"; row.setAttribute("data-v92irow", "strengths"); row.setAttribute("data-v95row", "1");
  row.innerHTML = `<label>${v95infoE(v95infoM("商品の強み", "Product strengths", "商品优势", "Puntos fuertes"))}<span class="v92irq">${v95infoE(v95infoM("必須", "required", "必填", "obligatorio"))}</span></label><div><button class="btn g" type="button" data-v95ijump="str">${v95infoE(v95infoM("＋ 強みを追加", "+ Add a strength", "＋ 添加优势", "+ Añadir"))}</button><div class="v92iu">${v95infoE(v95infoM(`いま ${n}件。営業資料と同じく、${V95INFO.STRN}件以上で「入力済み」になります（あと ${sh}件）。`, `${n} now. As in the sales deck, it counts as filled from ${V95INFO.STRN} (${sh} more).`, `目前 ${n} 项。与销售资料相同，${V95INFO.STRN} 项以上视为已填写（还差 ${sh} 项）。`, `${n} ahora. Como en el material de ventas, cuenta como completo desde ${V95INFO.STRN} (faltan ${sh}).`))}</div></div>`;
  const rws = pn.querySelectorAll(".v92if > .rw"); const last = rws.length ? rws[rws.length - 1] : null;
  if (last) last.parentNode.insertBefore(row, last); else pn.querySelector(".v92if").appendChild(row);
  const hc = pn.querySelector(".dwhead .p.or"); if (hc) { const m = String(hc.textContent || "").match(/^(\d+)(.*)$/); if (m) hc.textContent = (+m[1] + 1) + m[2]; }
}
if (typeof openDW === "function") {
  const __od95 = openDW;
  openDW = function () {
    try { if (v95infoPanel() && document.getElementById("dw") && document.getElementById("dw").dataset.open === "true") v95infoPanelKeep(); } catch (e) {}
    const r = __od95.apply(this, arguments);
    try { if (v95infoPanel()) { v95infoPanelStr(); v95infoPanelRestore(); v95infoCoEnPanel(); } } catch (e) { v95infoErr("od", e); }
    return r;
  };
}
if (typeof closeDW === "function") {
  const __cd95 = closeDW;
  closeDW = function () {
    let was = false;
    try { was = !!v95infoPanel(); if (was && document.getElementById("dw").dataset.open === "true") v95infoPanelKeep(false); } catch (e) {}
    const r = __cd95.apply(this, arguments);
    try {
      const pd = V95INFO.pd;
      if (!was && pd && pd.back && pd.uid === v95infoKey()) {
        pd.back = false;
        setTimeout(() => { try { const f = window.v92itemFillOpen; if (typeof f === "function") f(pd.rows && pd.rows.length ? pd.rows : undefined); } catch (e) { v95infoErr("reopen", e); } }, 120);
      }
    } catch (e) { v95infoErr("cd", e); }
    return r;
  };
}
document.addEventListener("click", (e) => {
  try {
    const tg = e.target; if (!tg || !tg.closest) return;
    if (tg.closest("#pn [data-v92ijump], #pn [data-v95ijump]")) {
      v95infoPanelKeep(true);
      const s = tg.closest("[data-v95ijump]");
      if (s) { e.preventDefault(); if (typeof openStrEdit === "function") openStrEdit(-1); }
      return;
    }
    if (tg.closest("#v92ifSave")) {
      const t = v95infoTen(), b = t ? v95infoSnap(t) : null, was = t ? Object.assign({}, t.v95hand || {}) : {}; const g = v95infoPanelKeep(false);
      const pre = g ? Object.keys(g.vals).concat(g.cat ? ["cat"] : []) : []; if (t && v95infoUser(t)) pre.forEach((k) => v95infoMark(t, k, "hand"));
      setTimeout(() => { try { if (b) { const ch = v95infoDiffMark(t, b, "hand"); pre.forEach((k) => { if (ch.indexOf(k) < 0 && !was[k]) v95infoUnmark(t, k); }); } const pd = V95INFO.pd; if (pd && t) { Object.keys(pd.vals).forEach((k) => { try { if (has(t[k]) && !(k === "hs" && t.hsGuess)) delete pd.vals[k]; } catch (x) {} }); if (!Object.keys(pd.vals).length) V95INFO.pd = null; } } catch (x) {} }, 0);
      return;
    }
    if (tg.closest("#v92ifCancel")) { V95INFO.pd = null; return; }
    if (tg.closest("#pn [data-v95chip]")) { const b = tg.closest("[data-v95chip]"); const i = document.getElementById("v92if_" + b.getAttribute("data-v95chip")); if (i) { i.value = b.getAttribute("data-v") || ""; i.dispatchEvent(new Event("input", { bubbles: true })); i.focus(); } e.preventDefault(); return; }
    /* 「足りない項目を入れる」で、残りが 1〜2件の強みだけのとき（パネルは「すべて入っています」と言うため）は、強みの追加を開く */
    const fb = tg.closest('[data-v92iact="fill"]');
    if (fb && V95INFO.miss0) {
      const t = v95infoTen(); if (!t || !v95infoStrShort(t)) return;
      const only = String(fb.getAttribute("data-keys") || "").split(",").filter(Boolean);
      let L = V95INFO.miss0(t) || []; if (only.length) { const L2 = L.filter((x) => only.indexOf(x.k) >= 0); if (L2.length) L = L2; else if (only.indexOf("strengths") >= 0) L = []; }
      if (!L.length) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (typeof openStrEdit === "function") openStrEdit(-1);
        try { if (typeof toast === "function") toast(v95infoM(`商品の強みは ${V95INFO.STRN}件以上で「入力済み」です（いま ${v95infoStrN(t.strengths)}件）`, `Strengths count as filled from ${V95INFO.STRN} (now ${v95infoStrN(t.strengths)})`)); } catch (x) {}
      }
    }
  } catch (x) { v95infoErr("click", x); }
}, true);

/* ══ No.462 英文社名 ══ */
const V95_KANA = (function () {
  const b = { ア: "a", イ: "i", ウ: "u", エ: "e", オ: "o", カ: "ka", キ: "ki", ク: "ku", ケ: "ke", コ: "ko", サ: "sa", シ: "shi", ス: "su", セ: "se", ソ: "so", タ: "ta", チ: "chi", ツ: "tsu", テ: "te", ト: "to",
    ナ: "na", ニ: "ni", ヌ: "nu", ネ: "ne", ノ: "no", ハ: "ha", ヒ: "hi", フ: "fu", ヘ: "he", ホ: "ho", マ: "ma", ミ: "mi", ム: "mu", メ: "me", モ: "mo", ヤ: "ya", ユ: "yu", ヨ: "yo",
    ラ: "ra", リ: "ri", ル: "ru", レ: "re", ロ: "ro", ワ: "wa", ヰ: "i", ヱ: "e", ヲ: "o", ン: "n", ガ: "ga", ギ: "gi", グ: "gu", ゲ: "ge", ゴ: "go", ザ: "za", ジ: "ji", ズ: "zu", ゼ: "ze", ゾ: "zo",
    ダ: "da", ヂ: "ji", ヅ: "zu", デ: "de", ド: "do", バ: "ba", ビ: "bi", ブ: "bu", ベ: "be", ボ: "bo", パ: "pa", ピ: "pi", プ: "pu", ペ: "pe", ポ: "po", ヴ: "vu",
    ァ: "a", ィ: "i", ゥ: "u", ェ: "e", ォ: "o", ャ: "ya", ュ: "yu", ョ: "yo", ヮ: "wa" };
  const y = { キャ: "kya", キュ: "kyu", キョ: "kyo", シャ: "sha", シュ: "shu", ショ: "sho", チャ: "cha", チュ: "chu", チョ: "cho", ニャ: "nya", ニュ: "nyu", ニョ: "nyo", ヒャ: "hya", ヒュ: "hyu", ヒョ: "hyo",
    ミャ: "mya", ミュ: "myu", ミョ: "myo", リャ: "rya", リュ: "ryu", リョ: "ryo", ギャ: "gya", ギュ: "gyu", ギョ: "gyo", ジャ: "ja", ジュ: "ju", ジョ: "jo", ビャ: "bya", ビュ: "byu", ビョ: "byo", ピャ: "pya", ピュ: "pyu", ピョ: "pyo",
    ファ: "fa", フィ: "fi", フェ: "fe", フォ: "fo", ティ: "ti", ディ: "di", トゥ: "tu", ドゥ: "du", ウィ: "wi", ウェ: "we", ウォ: "wo", ヴァ: "va", ヴィ: "vi", ヴェ: "ve", ヴォ: "vo", シェ: "she", ジェ: "je", チェ: "che", デュ: "dyu", テュ: "tyu" };
  return { b, y };
})();
function v95infoKana(s) {
  s = String(s || "").replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  let out = "", i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (V95_KANA.y[two]) { out += V95_KANA.y[two]; i += 2; continue; }
    const c = s[i];
    if (c === "ッ") { const nx = s.slice(i + 1, i + 3); const r = V95_KANA.y[nx] || V95_KANA.b[s[i + 1]] || ""; out += r ? (r[0] === "c" ? "t" : r[0]) : ""; i++; continue; }
    if (c === "ー") { i++; continue; }
    out += V95_KANA.b[c] != null ? V95_KANA.b[c] : c; i++;
  }
  return out;
}
const V95_FORM = [[/^(株式会社|（株）|\(株\)|㈱)\s*|\s*(株式会社|（株）|\(株\)|㈱)$/, "Co., Ltd."], [/^(有限会社|（有）|\(有\)|㈲)\s*|\s*(有限会社|（有）|\(有\)|㈲)$/, "Co., Ltd."],
  [/^合同会社\s*|\s*合同会社$/, "LLC"], [/^合資会社\s*|\s*合資会社$/, "Limited Partnership"], [/^合名会社\s*|\s*合名会社$/, "General Partnership"]];
const V95_WORD = [["製作所", "Manufacturing"], ["工業所", "Industry"], ["工業", "Industry"], ["産業", "Industries"], ["商事", "Trading"], ["商会", "Trading"], ["商店", "Shoten"], ["物産", "Bussan"], ["貿易", "Trading"],
  ["食品", "Foods"], ["製菓", "Confectionery"], ["製茶", "Tea"], ["製薬", "Pharmaceutical"], ["薬品", "Pharmaceutical"], ["化粧品", "Cosmetics"], ["化学", "Chemical"], ["化成", "Chemical"], ["電機", "Electric"], ["電気", "Electric"],
  ["電子", "Electronics"], ["精機", "Seiki"], ["精工", "Seiko"], ["技研", "Giken"], ["酒造", "Brewery"], ["醸造", "Brewery"], ["農園", "Farm"], ["牧場", "Farm"], ["水産", "Fisheries"], ["建設", "Construction"], ["工務店", "Construction"],
  ["運輸", "Transport"], ["物流", "Logistics"], ["倉庫", "Warehouse"], ["医療", "Medical"], ["衛生", "Hygiene"], ["繊維", "Textile"], ["織物", "Textile"], ["陶器", "Ceramics"], ["窯業", "Ceramics"], ["木工", "Woodworking"],
  ["印刷", "Printing"], ["包装", "Packaging"], ["機械", "Machinery"], ["機工", "Kiko"], ["金属", "Metal"], ["鉄工", "Iron Works"], ["自動車", "Motor"], ["部品", "Parts"], ["製作", "Works"], ["本舗", "Honpo"], ["本店", "Honten"],
  ["日本", "Japan"], ["国際", "International"], ["ホールディングス", "Holdings"], ["グループ", "Group"], ["ジャパン", "Japan"], ["インターナショナル", "International"], ["コーポレーション", "Corporation"]];
/* 会社名（日本語）から英文社名の案を作る。返り値 {name, partial}（partial＝読めない漢字を［ ］で残した） */
function v95infoCoEnDraftOf(co) {
  let s = String(co || "").normalize("NFKC").replace(/[\s　]+/g, " ").trim();
  if (!s || !/[ぁ-んァ-ヶ一-龠々]/.test(s)) return null;
  s = s.replace(/[（(][^（）()]*[A-Za-z][^（）()]*[）)]/g, "").trim();
  let form = "";
  for (const [re, en] of V95_FORM) { if (re.test(s)) { form = en; s = s.replace(re, "").trim(); break; } }
  if (!s) return null;
  const parts = [];
  let i = 0;
  const pushW = (w) => { if (w) parts.push(w); };
  while (i < s.length) {
    let hit = null; for (const [ja, en] of V95_WORD) { if (s.startsWith(ja, i)) { hit = [ja, en]; break; } }
    if (hit) { pushW(hit[1]); i += hit[0].length; continue; }
    const c = s[i];
    if (/[ァ-ヶーぁ-ん]/.test(c)) { let j = i; while (j < s.length && /[ァ-ヶーぁ-ん]/.test(s[j]) && !V95_WORD.some(([ja]) => s.startsWith(ja, j))) j++; const r = v95infoKana(s.slice(i, j)); pushW(r ? r[0].toUpperCase() + r.slice(1) : ""); i = j; continue; }
    if (/[一-龠々]/.test(c)) { let j = i; while (j < s.length && /[一-龠々]/.test(s[j]) && !V95_WORD.some(([ja]) => s.startsWith(ja, j))) j++; pushW("［" + s.slice(i, j) + "］"); i = j; continue; }
    if (/[A-Za-z0-9&]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9&.\-']/.test(s[j])) j++; pushW(s.slice(i, j)); i = j; continue; }
    i++;
  }
  if (!parts.length) return null;
  const name = (parts.join(" ") + (form ? (/^Co\./.test(form) ? " " + form : " " + form) : "")).replace(/\s+/g, " ").trim();
  return { name, partial: /［/.test(name) };
}
function v95infoCoEnDraft(t) { t = t || v95infoTen(); if (!t || String(t.coEn || "").trim()) return null; const d = v95infoCoEnDraftOf(t.co); return d ? Object.assign(d, { src: "ja" }) : null; }
/* D7：同じ会社のほかの商品の確かな英文社名を、この商品にも入れる */
function v95infoCoEnOk(v) { v = String(v == null ? "" : v).trim(); return !!v && /[A-Za-z]{2}/.test(v) && !/[ぁ-んァ-ヶ一-龠々]/.test(v) && !/[（(]案[)）]\s*$/.test(v); }
function v95infoCoEnInherit(t) {
  t = t || v95infoTen(); if (!t || !v95infoUser(t) || typeof dk3Cands !== "function") return false;
  try {
    const own = String(t.coEn || "").trim(), F = t.v95coEnFrom;
    if (own && !(F && own === F.name)) return false;
    const L = (dk3Cands(t) || []).filter((x) => x && x !== t && v95infoCoEnOk(x.coEn) && !(x.v95coEnFrom && String(x.coEn).trim() === x.v95coEnFrom.name));
    if (!L.length) return false;
    const s = L[0], nm = String(s.coEn).trim();
    if (own === nm) return false;
    t.coEn = nm; t.v95coEnFrom = { name: nm, item: String(s.item || ""), at: Date.now() };
    V95INFO.n.inh++;
    try { if (typeof v33AuLog === "function") v33AuLog("v95coen", "英文社名を同じ会社の商品から：" + nm, String(t.item || "")); } catch (e) {}
    return true;
  } catch (e) { v95infoErr("inh", e); return false; }
}
if (typeof syncTenant === "function") {
  const __st95 = syncTenant;
  syncTenant = function () { try { if (v95infoCoEnInherit()) { try { if (typeof saveTen === "function") setTimeout(() => { try { saveTen(); } catch (x) {} }, 0); } catch (x) {} } } catch (e) {} return __st95.apply(this, arguments); };
}
if (typeof switchTen === "function") {
  const __sw95 = switchTen;
  switchTen = function () { const r = __sw95.apply(this, arguments); try { if (v95infoCoEnInherit()) { if (typeof syncTenant === "function") syncTenant(); } } catch (e) {} return r; };
}
if (typeof render === "function") {
  const __rn95 = render;
  render = function () { try { if (!V95INFO._rn && v95infoCoEnInherit()) { V95INFO._rn = 1; try { if (typeof syncTenant === "function") syncTenant(); } finally { V95INFO._rn = 0; } } } catch (e) {} return __rn95.apply(this, arguments); };
}
if (typeof v92docCoEnInfo === "function") {
  const __ci95 = v92docCoEnInfo;
  v92docCoEnInfo = function (t) {
    const r = __ci95.apply(this, arguments);
    try { if (r && !r.ok && !r.cand) { const d = v95infoCoEnDraft(t || v95infoTen()); if (d && !d.partial) r.cand = { name: d.name, src: "ja" }; if (d) r.v95draft = d; } } catch (e) { v95infoErr("ci", e); }
    return r;
  };
}
const V95_COEN_FROM = "会社名（日本語）から作った案。読み方・英語の綴りは確かめてください";
if (typeof v92docCoEnFrom === "function") {
  const __cf95 = v92docCoEnFrom;
  v92docCoEnFrom = function (c) { if (c && c.src === "ja") return V95_COEN_FROM; return __cf95.apply(this, arguments); };
}
function v95infoCoEnWhy(d) { return d && d.partial ? "（会社名から作った形です。［ ］の所は読み方が分からないので、ローマ字に直してから登録してください）" : "（" + V95_COEN_FROM + "）"; }
if (typeof v54docSugHtml === "function") {
  const __sh95 = v54docSugHtml;
  v54docSugHtml = function (sl) {
    let h = String(__sh95.apply(this, arguments) || "");
    try {
      if (sl && !sl.name && sl.sug && sl.sug.src === "v92ja") {
        h = h.replace(/(<b data-noi18n>[^<]*<\/b> <span>)[^<]*(<\/span>)/, "$1" + v95infoE(v95infoCoEnWhy({ partial: false })) + "$2");
      } else if (sl && !sl.name && !sl.sug) {
        const d = v95infoCoEnDraft();
        if (d && d.partial) h += `<br><span>英文社名の案：</span><b data-noi18n>${v95infoE(d.name)}</b> <span>${v95infoE(v95infoCoEnWhy(d))}</span> <button type="button" class="btn g" data-v95act="coenfix" data-v95name="${v95infoE(d.name)}" style="font-size:10.5px;padding:2px 9px">${v95infoE("案を直して登録する")}</button>`;
      }
    } catch (e) { v95infoErr("sh", e); }
    return h;
  };
}
if (typeof v54docSellerEdit === "function") {
  const __se95 = v54docSellerEdit;
  v54docSellerEdit = function () {
    const r = __se95.apply(this, arguments);
    try { const sl = (typeof v54docSeller === "function") ? v54docSeller() : null; if (sl && !sl.name && sl.sug && sl.sug.src === "v92ja") { const n = document.querySelector("#pn .v54sugnote"); if (n) n.textContent = "会社名（日本語）から作った案を入れています。読み方・英語の綴りが正しいか確かめて、違っていれば直してから保存してください。"; } } catch (e) { v95infoErr("se", e); }
    return r;
  };
}
/* 書類の下に「どの商品で登録した名前か」を1行（D7） */
function v95infoCoEnFromNote() {
  try {
    const o = document.getElementById("dO"), t = v95infoTen(); if (!o || !t) return;
    const old = o.querySelector(".v95coenfrom"); const F = t.v95coEnFrom;
    if (!F || String(t.coEn || "").trim() !== F.name) { if (old) old.remove(); return; }
    if (old) return;
    const doc = o.querySelector(".doc"); if (!doc) return;
    doc.insertAdjacentHTML("afterend", `<p class="nn v95coenfrom" role="note" data-noi18n="1">${v95infoE(v95infoM(`英文社名「${F.name}」は、同じ会社の商品「${F.item}」で登録した名前を使っています（会社単位）`, `The English company name “${F.name}” is the one registered for “${F.item}” of the same company (company-wide)`, `英文公司名“${F.name}”使用的是同一公司商品“${F.item}”中登记的名称（按公司统一）`, `El nombre en inglés «${F.name}» es el registrado para «${F.item}» de la misma empresa (para toda la empresa)`))}</p>`);
  } catch (e) { v95infoErr("note", e); }
}
if (typeof rDoc === "function") {
  const __rd95 = rDoc;
  rDoc = function () { const r = __rd95.apply(this, arguments); try { v95infoCoEnFromNote(); } catch (e) {} return r; };
}
/* 補完パネルの英文社名の欄に、案のボタン */
function v95infoCoEnPanel() {
  try {
    const pn = v95infoPanel(); if (!pn) return; const i = pn.querySelector('input[data-v92ik="coEn"]'); if (!i || pn.querySelector('[data-v95chip="coEn"]')) return;
    let I = null; try { I = v92docCoEnInfo(); } catch (e) {}
    const d = (I && I.cand) ? { name: I.cand.name, partial: false, src: I.cand.src } : v95infoCoEnDraft(); if (!d) return;
    const why = d.src && d.src !== "ja" && typeof v92docCoEnFrom === "function" ? "（" + v92docCoEnFrom(I.cand) + "）" : v95infoCoEnWhy(d);
    i.insertAdjacentHTML("afterend", `<div class="v92ich v95coenchip" data-noi18n="1"><button class="btn g" type="button" data-v95chip="coEn" data-v="${v95infoE(d.name)}">${v95infoE(v95infoM("案：", "Suggestion: ", "建议：", "Sugerencia: "))}${v95infoE(d.name)}</button><div class="v92iu">${v95infoE(why)}</div></div>`);
  } catch (e) { v95infoErr("coenp", e); }
}
/* 案を直して登録する（読めない漢字が残る案）：Seller の入力欄に入れて、［ ］の所を選ぶ */
function v95infoCoEnFix(name) {
  name = String(name || "");
  try {
    if (typeof v54docSellerEdit === "function") {
      v54docSellerEdit();
      setTimeout(() => {
        try {
          const co = document.getElementById("v54sCo"); if (!co) return;
          co.value = name; co.focus(); const a = name.indexOf("［"), b = name.indexOf("］"); if (a >= 0 && b > a) co.setSelectionRange(a, b + 1);
          const msg = document.getElementById("v54sMsg"); if (msg) msg.textContent = "［ ］の所を読み（ローマ字）に直してから保存してください。";
        } catch (e) {}
      }, 60);
      return;
    }
  } catch (e) { v95infoErr("fix", e); }
}
document.addEventListener("click", (e) => {
  try {
    const b = e.target && e.target.closest && e.target.closest("[data-v95act]"); if (!b) return;
    const a = b.getAttribute("data-v95act"), nm = b.getAttribute("data-v95name") || "";
    if (a === "coenuse") { e.preventDefault(); if (typeof v92docCoEnUse === "function") v92docCoEnUse(nm); }
    if (a === "coenfix") { e.preventDefault(); v95infoCoEnFix(nm); }
  } catch (x) { v95infoErr("act", x); }
});
/* AI ヒアリング：読めない漢字が残る案は、ボタンにせず文で示す */
function v95infoHearCoEn() {
  try {
    if (typeof FILL === "undefined" || !FILL || !FILL.cur || FILL.cur.k !== "coEn" || FILL.cur._v92 || FILL.cur._v95) return;
    const d = v95infoCoEnDraft(); if (!d || !d.partial) return;
    FILL.cur = Object.assign({}, FILL.cur, { _v95: 1 });
    fillSay("ai", "英文社名の案（会社名から作った形）：<b data-noi18n>" + v95infoE(d.name) + "</b>。［ ］の所は読み方が分からないので、ローマ字にして、全体を入れてください。", { ask: FILL.cur });
    try { if (typeof render === "function") render(); } catch (e) {}
  } catch (e) { v95infoErr("hear", e); }
}
if (typeof fillNext === "function") { const __fn95 = fillNext; fillNext = function () { const r = __fn95.apply(this, arguments); v95infoHearCoEn(); return r; }; }
if (typeof todayFillGo === "function") { const __tf95 = todayFillGo; todayFillGo = function () { const r = __tf95.apply(this, arguments); v95infoHearCoEn(); return r; }; }
/* 画面（今日やること・営業資料・商品情報）で使う：案の中身 */
function v95infoCoEnSug(t) {
  t = t || v95infoTen(); if (!t || String(t.coEn || "").trim()) return null;
  let I = null; try { I = v92docCoEnInfo(t); } catch (e) {}
  if (I && I.ok) return null;
  if (I && I.cand) return { name: I.cand.name, partial: false, src: I.cand.src, why: I.cand.src === "ja" ? V95_COEN_FROM : (typeof v92docCoEnFrom === "function" ? v92docCoEnFrom(I.cand) : "") };
  const d = v95infoCoEnDraft(t); if (d) return { name: d.name, partial: d.partial, src: "ja", why: d.partial ? "会社名から作った形です。［ ］の所は読み方が分からないので、ローマ字に直してから登録してください" : V95_COEN_FROM };
  return null;
}
function v95infoT(s) { try { return typeof v92docT === "function" ? v92docT(s) : s; } catch (e) { return s; } }
function v95infoCoEnWhyL(S) {
  if (S.src === "ja") return S.partial
    ? v95infoM("会社名から作った形です。［ ］の所は読み方が分からないので、ローマ字に直してから登録してください。押すまで書類には入りません", "Made from your Japanese company name. The [ ] part could not be read automatically — replace it with the Latin-letter reading before registering. Not added to documents until you press the button", "根据日文公司名生成。［ ］部分无法自动读取，请改为罗马字后再登记。按下按钮之前不会写入单证", "Creado a partir del nombre en japonés. La parte entre [ ] no se pudo leer automáticamente: cámbiela por la lectura en letras latinas antes de registrar. No se añade a los documentos hasta que pulse el botón")
    : v95infoM("会社名（日本語）から作った案。読み方・英語の綴りは確かめてください。押すまで書類には入りません", "A suggestion made from your Japanese company name. Please check the reading and English spelling. Not added to documents until you press the button", "根据日文公司名生成的建议。请确认读音和英文拼写。按下按钮之前不会写入单证", "Sugerencia creada a partir del nombre en japonés. Compruebe la lectura y la ortografía en inglés. No se añade a los documentos hasta que pulse el botón");
  return v95infoT(S.why || "") + v95infoM("。押すまで書類には入りません", ". Not added to documents until you press the button", "。按下按钮之前不会写入单证", ". No se añade a los documentos hasta que pulse el botón");
}
function v95infoCoEnHtml(t, cls) {
  const S = v95infoCoEnSug(t); if (!S) return "";
  const btn = S.partial ? `<button type="button" class="btn g" data-v95act="coenfix" data-v95name="${v95infoE(S.name)}">${v95infoE(v95infoM("案を直して登録する", "Fix the suggestion and register", "修改建议后登记", "Corregir y registrar"))}</button>` : `<button type="button" class="btn g" data-v95act="coenuse" data-v95name="${v95infoE(S.name)}">${v95infoE(v95infoT("この英文社名で登録する"))}</button>`;
  return `<div class="v95coen ${cls || ""}" data-noi18n="1" data-v95coen="${v95infoE(S.name)}"><span class="v95coen-l">${v95infoE(v95infoM("英文社名の案：", "Suggested English company name: ", "英文公司名建议：", "Nombre en inglés sugerido: "))}</span><b>${v95infoE(S.name)}</b><span class="v95coen-why">（${v95infoE(v95infoCoEnWhyL(S))}）</span>${btn}</div>`;
}

/* 訳（英中西）。日本語の画面では使わない */
function v95infoTitleT(s, d, l) { s = String(s || ""); try { if (d && d[s]) return d[s]; } catch (e) {} if (s === "全成分表") return l === "zh" ? "全成分表" : l === "es" ? "Lista completa de ingredientes" : "Full ingredient list"; return s; }
try {
  if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
    const P = (re, en, zh, es) => ({ re, en, zh, es });
    [
      P(/^が登録されています(（あとから入れた分を含みます）)?。\s*数量帯があるので、「その数量ならいくら」を即答できます。$/, (m) => " registered" + (m[1] ? " (including items added later)" : "") + ". With quantity tiers, the AI can instantly answer “how much for that quantity”.", (m) => "已登记" + (m[1] ? "（含之后添加的部分）" : "") + "。因有数量区间，可立即回答“该数量多少钱”。", (m) => " registradas" + (m[1] ? " (incluye lo añadido después)" : "") + ". Con tramos de cantidad, la IA responde al instante “cuánto por esa cantidad”."),
      P(/^が登録されています(（あとから入れた分を含みます）)?。\s*数量帯があるとさらに精度が上がります。$/, (m) => " registered" + (m[1] ? " (including items added later)" : "") + ". Adding quantity tiers improves accuracy further.", (m) => "已登记" + (m[1] ? "（含之后添加的部分）" : "") + "。加入数量区间后精度会更高。", (m) => " registradas" + (m[1] ? " (incluye lo añadido después)" : "") + ". Añadir tramos de cantidad mejora aún más la precisión."),
      P(/^です（あとから入れた分を含みます）。\s*([\s\S]+?)\s*(ほか)?。\s*AIはここを引用して商談準備の答えを作ります。$/, (m) => " (including ones added later): " + m[1].replace(/「([^」]+)」/g, "“$1”") + (m[2] ? " and more" : "") + ". The AI cites these when preparing answers for meetings.", (m) => "（含之后添加的部分）：" + m[1] + (m[2] ? " 等" : "") + "。AI会引用这些内容来准备商谈答复。", (m) => " (incluye las añadidas después): " + m[1].replace(/「([^」]+)」/g, "“$1”") + (m[2] ? " y más" : "") + ". La IA las cita al preparar las reuniones."),
      P(/^（INCI名に変換済み (\d+)\/(\d+)成分）。\s*各国の規制に通るかどうかの判定に使います。$/, " (INCI names converted: $1/$2 ingredients). Used to judge whether it passes each country's regulations.", "（已转换为INCI名：$1/$2 种成分）。用于判定能否通过各国法规。", " (nombres INCI convertidos: $1/$2 ingredientes). Se usa para juzgar si cumple la normativa de cada país."),
      P(/^商品マスタ（価格(\d+)行・寸法(\d+)行）／(.+?) (\d+)項目（INCI名に変換済み (\d+)\/(\d+)成分）／規制調査 (\d+)か国／商談記録 (\d+)件$/,
        (m, d) => "product master (price " + m[1] + " rows · dimensions " + m[2] + " rows) / " + v95infoTitleT(m[3], d, "en") + " " + m[4] + " items (INCI names converted: " + m[5] + "/" + m[6] + ") / regulatory research " + m[7] + " countries / meeting records " + m[8],
        (m, d) => "产品主数据（价格" + m[1] + "行・尺寸" + m[2] + "行）／" + v95infoTitleT(m[3], d, "zh") + " " + m[4] + "项（已转换为INCI名 " + m[5] + "/" + m[6] + "）／法规调查 " + m[7] + "个国家／商谈记录 " + m[8] + "件",
        (m, d) => "maestro de productos (precio " + m[1] + " filas · dimensiones " + m[2] + " filas) / " + v95infoTitleT(m[3], d, "es") + " " + m[4] + " elementos (INCI convertidos " + m[5] + "/" + m[6] + ") / investigación normativa " + m[7] + " países / registros " + m[8]),
      P(/^全成分表は$/, "Full ingredient list: ", "全成分表：", "Lista completa de ingredientes: "),
    ].reverse().forEach((p) => I18N.pat.unshift(p));
  }
} catch (e) { v95infoErr("i18n", e); }
