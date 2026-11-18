/* ═══ v21.97 fwd（2026-11-18 第10回相当 UAT・21.96）物流会社（フォワーダー）側と、荷主の見積の画面の直し — 中身の層
   担当の行：
   No.535 COURIER の中央値が画面で違う（レート管理 ¥12,000/個・相見積 ¥1,570/個・多くの行が「中央値の約0.1倍」）
     原因：中央値を4か所が別々の母集団で出していた。
           ・レート管理の「要確認」（v90fRateChecks）＝形態・単位ごと・期限切れのレートも入れる・通貨を換算しない（US$ の数字も円と混ぜる）
           ・相見積・AI推奨のレーン別の集計（v95miscLaneFlags）＝形態・単位ごと・有効なレートだけ・円に換算・4本以上
           ・保存の後の「運賃の桁を確かめてください」（v82fOdd）＝同じ仕向港・形態だけ・1本からでも
           ・手入力の「追加」の確かめ（21.92 の層・index.html の中）＝形態・単位ごと・円だけ・同じ区間は除く・2本から
           期限切れの COURIER（例 ¥12,000/個）が多いと、レート管理だけ中央値が ¥12,000 になり、使っている ¥1,200〜2,000 の行が「約0.1倍」になった。
     直し方：中央値はこの層の1つの関数（v97fMedOf）だけで出す。母集団は
           「同じ輸送の形（mode）・同じ単位（/個・/kg・/m³・/本 … 表記ゆれはそろえる）・有効期限内のレート・すべての仕向地・円に換算（US$ は今日の為替）・
             点検する行も含める・3本以上のときだけ点検」。外れ値の目安は今までどおり 5倍以上／5分の1以下（中央値は外れ値の影響を受けにくいので、外れ値も母集団に入れる）。
           上の4か所をすべてこの関数に替え、画面には「中央値の出し方（母集団：N本・区間・単位・期間）」を出す（見せ方は rd_v97fwd.js）。
   No.520 COURIER の日数が一律10日（「既定値かも」の注記だけで、日数は10日のまま）
     原因：COURIER の料金表は日数の欄が空のことが多く、取り込み・手入力で既定値 10日 が入る（21.96 は印を付けただけ）。見積・AI の答えは10日のまま。
     直し方：既定値（印あり・既定値かも）の COURIER のレートは、次の順で「実際に近い日数」を出す。
           ① そのレートの備考に書いてある日数（例「2〜4営業日」「transit 3 days」）＝登録の値
           ② 同じ仕向地（国）の COURIER の、登録された日数（既定値でない・期限内）＝登録の値（会社名を添える）
           ③ 国際宅配便の一般的な目安（地域ごと：東アジア 2〜3日・東南アジア 2〜4日・北米・欧州・オセアニア 3〜5日 など）＝目安
           見積（quote.ttEst）に持たせ、荷主の見積の画面・相見積の表・推奨・見積受信箱・AI の答えの文では「約10日（既定値）」の代わりに
           「約2〜4日（目安：…）」と書く。データ（レートの日数）は書き換えない。物流会社は「日数を確かめる」で実際の日数にできる（目安を最初から入れておく）。
           推奨の点数は今までどおり（COURIER どうしは同じ目安になるので順位は変わらない）。
   No.519 B/L の容積で計算し直せるが、反映が手動（¥31,322・今の見積 ¥40,400 より ¥9,078 安い）
     直し方：案件を開いたら、B/L と荷主の共有の容積が違う国ごとの見積を、押さなくても B/L の容積で計算しておき（v97fVolAuto）、差を上に大きく出す。
           「B/L の容積で反映する」1回で（確かめの窓のあと）全部の国に反映、知らせに「元に戻す」。反映のあと「荷主に知らせる（依頼ページ）」で、
           どちらの容積で計算したかを荷主に伝えられる（相手へのひとことを入れておく）。
           荷主の見積の画面には「この見積は ○ m³（依頼のときに共有した容積）で計算」を出す。
   今のアプリの関数は控えてから包むだけ（中身は書き換えない）。見せ方は rd_v97fwd.js・rd_v97fwd.css。同期サーバーは変えない。 */
var V97FWD = window.V97FWD = { v: "21.97", err: [], n: {}, med: null, vol: {} };
function v97fErr(k, e) { try { V97FWD.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97FWD.err.length > 40) V97FWD.err.shift(); } catch (x) { /* 記録できないときは何もしない */ } }
function v97fCnt(k) { try { V97FWD.n[k] = (V97FWD.n[k] || 0) + 1; } catch (e) { /* 数えられなくても動きは変えない */ } }
function v97fLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v97fM(ja, en, zh, es) { const l = v97fLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v97fE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v97fY(n) { return "¥" + Math.round(+n || 0).toLocaleString("ja-JP"); }
function v97fUp(s) { return String(s == null ? "" : s).toUpperCase().trim(); }
function v97fNfkc(s) { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.trim(); }
function v97fToday() { try { if (typeof TODAYS !== "undefined" && TODAYS) return String(TODAYS); } catch (e) { /* 下で */ } const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function v97fValid(r) {
  try { if (typeof fwdRateValid === "function") return !!fwdRateValid(r); } catch (e) { v97fErr("valid", e); }
  const v = String((r && r.valid) || "").replace(/\//g, "-");
  return !v || !/^\d{4}-\d{2}-\d{2}$/.test(v) || v >= v97fToday();
}
function v97fJpy(r) { try { if (typeof fwdRateJpy === "function") return +fwdRateJpy(r) || 0; } catch (e) { v97fErr("jpy", e); } return +((r && r.price) || 0); }
function v97fUsd(r) { return /US\$|USD|\$/.test(String((r && r.cur) || "")); }

/* ══════════════════════════════════════════════════════════════════════
   No.535 中央値を1つの関数・1つの母集団で
   ══════════════════════════════════════════════════════════════════════ */
/* 単位の表記ゆれをそろえる（/個・/pc・/pcs・/piece・/件 …） */
function v97fUnit(u) {
  let s = v97fNfkc(u).toLowerCase().replace(/\s+/g, "");
  if (!s) return "";
  if (s[0] !== "/") s = "/" + s;
  if (/^\/(個|ケ|ヶ|pc|pcs|piece|pieces|pkg|package|parcel|小包|箱|box|ctn|carton|カートン)$/.test(s)) return "/個";
  if (/^\/(件|shipment|shp|回|口)$/.test(s)) return "/件";
  if (/^\/(kg|ｋｇ|キロ|kgs)$/.test(s)) return "/kg";
  if (/^\/(m³|m3|cbm|立米|㎥|rt|w\/m)$/.test(s)) return "/m³";
  if (/^\/(本|ctr|container|cntr|teu|feu|van)$/.test(s)) return "/本";
  return s;
}
function v97fGroupKey(r) { return v97fUp(r && r.mode) + "|" + v97fUnit(r && r.unit); }
/* 母集団：同じ mode・同じ単位・有効期限内・運賃 > 0。円に換算（US$ は為替） */
var V97F_MED_MIN = 3, V97F_MED_HI = 5, V97F_MED_LO = 0.2;
function v97fMedian(a) { const b = a.filter((x) => x > 0).sort((x, y) => x - y); if (!b.length) return 0; const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function v97fPop(R) {
  const rates = R || ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
  const C = V97FWD.med;
  /* 同じ描き直しの中（1秒以内・同じ表・同じ本数）は作り直さない（行ごとに呼ばれても1回分） */
  if (C && C.R === rates && C.n === rates.length && Date.now() - C.t < 1000) return C.G;
  let fx = 0; try { fx = (typeof ddpFx === "function") ? +((ddpFx().rates || {}).USD || 0) : 0; } catch (e) { fx = 0; }
  const sig = rates.length + "|" + v97fToday() + "|" + fx + "|" + rates.reduce((h, r) => (h * 31 + Math.round(+((r && r.price) || 0)) + String((r && r.valid) || "").length + (r && r.mode ? r.mode.length : 0)) % 1000000007, 7);
  if (C && C.R === rates && C.sig === sig) { C.t = Date.now(); return C.G; }
  const G = {};
  rates.forEach((r) => {
    if (!r) return;
    const k = v97fGroupKey(r);
    const g = G[k] || (G[k] = { key: k, mode: v97fUp(r.mode), unit: v97fUnit(r.unit), vals: [], rates: [], exp: 0, usd: 0, zero: 0, pods: new Set() });
    if (!(+r.price > 0)) { g.zero++; return; }
    if (!v97fValid(r)) { g.exp++; return; }
    const y = v97fJpy(r);
    if (!(y > 0)) return;
    g.vals.push(y); g.rates.push(r); g.pods.add(String(r.pod || ""));
    if (v97fUsd(r)) g.usd++;
  });
  Object.values(G).forEach((g) => { g.n = g.vals.length; g.med = g.n ? v97fMedian(g.vals) : 0; g.ok = g.n >= V97F_MED_MIN && g.med > 0; g.npod = g.pods.size; });
  V97FWD.med = { R: rates, n: rates.length, t: Date.now(), sig, G };
  return G;
}
/* 倍率の書き方（画面どうしで同じ数字）：10倍以上は整数・1倍以上は小数1桁・1倍未満は有効数字1桁 */
function v97fXNum(x) { x = +x || 0; if (x >= 10) return Math.round(x); if (x >= 1) return Math.round(x * 10) / 10; return +x.toPrecision(1); }
/* 1本のレートの点検。out＝外れている（5倍以上・5分の1以下） */
function v97fMedOf(r, R) {
  try {
    if (!r || !(+r.price > 0)) return null;
    const G = v97fPop(R), g = G[v97fGroupKey(r)];
    if (!g) return null;
    const p = v97fJpy(r), valid = v97fValid(r);
    const x = g.med > 0 ? p / g.med : 0;
    return { g, p, med: g.med, n: g.n, x, xs: v97fXNum(x), valid, ok: g.ok && valid, out: !!(g.ok && valid && x > 0 && (x >= V97F_MED_HI || x <= V97F_MED_LO)) };
  } catch (e) { v97fErr("medof", e); return null; }
}
/* 母集団の説明（短い／長い） */
function v97fBasis(g, long) {
  if (!g) return "";
  const usd = g.usd ? v97fM(`・US$ ${g.usd}本は今日の為替で円に換算`, `; ${g.usd} US$ rates converted at today's rate`) : "";
  const exp = g.exp ? v97fM(`・期限切れ ${g.exp}本は入れていません`, `; ${g.exp} expired rates excluded`) : "";
  if (!long) return v97fM(`母集団：${g.mode}・${g.unit || "単位なし"}・有効期限内 ${g.n}本・仕向地すべて ${g.npod}か所`, `basis: ${g.mode}, ${g.unit || "no unit"}, ${g.n} valid rates, all ${g.npod} destinations`);
  return v97fM(`${g.mode}・${g.unit || "単位なし"}：中央値 ${v97fY(g.med)}${g.unit}（有効期限内のレート ${g.n}本・仕向地すべて ${g.npod}か所${usd}${exp}）`,
    `${g.mode} ${g.unit || ""}: median ${v97fY(g.med)}${g.unit} (${g.n} valid rates, all ${g.npod} destinations${usd}${exp})`);
}
function v97fMedGroups(R) { const G = v97fPop(R); return Object.values(G).filter((g) => g.n > 0 || g.exp > 0).sort((a, b) => String(a.key).localeCompare(String(b.key))); }
function v97fOutTxt(o, r) {
  const t = o.x >= 1 ? v97fM(`約${o.xs}倍`, `about ${o.xs}×`) : v97fM(`約${o.xs}倍（約${Math.round(1 / o.x)}分の1）`, `about ${o.xs}× (1/${Math.round(1 / o.x)})`);
  return v97fM(`運賃が中央値（${v97fY(o.med)}${o.g.unit}｜${v97fBasis(o.g)}）の${t}・要確認`, `Price is ${t} the median (${v97fY(o.med)}${o.g.unit} | ${v97fBasis(o.g)}) · check`);
}
window.v97fValid = v97fValid; window.v97fUnit = v97fUnit; window.v97fPop = v97fPop; window.v97fMedOf = v97fMedOf; window.v97fBasis = v97fBasis; window.v97fMedGroups = v97fMedGroups; window.v97fXNum = v97fXNum; window.v97fOutTxt = v97fOutTxt;

/* ① レート管理の「要確認」（v90f）：中央値の部分だけ替える（日数が一律10日の文は今までどおり） */
if (typeof v90fRateChecks === "function") {
  const __rc97f = v90fRateChecks;
  v90fRateChecks = function () {
    let out = {};
    try { out = __rc97f.apply(this, arguments) || {}; } catch (e) { v97fErr("rc0", e); out = {}; }
    try {
      const R = (FWDB && FWDB.rates) || [];
      const res = {};
      Object.keys(out).forEach((i) => {
        const keep = (out[i] || []).filter((s) => !/中央値|median/i.test(String(s)));
        if (keep.length) res[i] = keep;
      });
      R.forEach((r, i) => {
        const o = v97fMedOf(r, R);
        if (!o || !o.out) return;
        (res[i] = res[i] || []).unshift(v97fOutTxt(o, r));
      });
      v97fCnt("rc");
      return res;
    } catch (e) { v97fErr("rc", e); return out; }
  };
}
/* ② 相見積・AI推奨のレーン別の集計（v95misc）：「外れている」の判断を同じ関数に */
if (typeof v95miscLaneFlags === "function") {
  const __lf97f = v95miscLaneFlags;
  v95miscLaneFlags = function () {
    const out = __lf97f.apply(this, arguments) || {};
    try {
      const R = (FWDB && FWDB.rates) || [];
      Object.keys(out).forEach((k) => { out[k].flags = (out[k].flags || []).filter((f) => f && f.t !== "out"); });
      R.forEach((r) => {
        if (!r || !v97fValid(r)) return;
        const o = v97fMedOf(r, R);
        if (!o || !o.out) return;
        const k = r.pod + "|" + v97fUp(r.mode);
        const f = out[k] || (out[k] = { k, pod: r.pod, mode: v97fUp(r.mode), unit: r.unit || "", flags: [] });
        if (!f.flags.some((y) => y.t === "out")) f.flags.unshift({ t: "out", p: o.p, med: o.med, x: o.xs, n: o.n, v97: 1, basis: v97fBasis(o.g), unit: o.g.unit });
      });
      Object.keys(out).forEach((k) => { if (!out[k].flags.length) delete out[k]; });
      v97fCnt("lane");
    } catch (e) { v97fErr("lane", e); }
    return out;
  };
  try { window.v95miscLaneFlags = v95miscLaneFlags; } catch (e) { v97fErr("lanewin", e); }
}
/* ③ 保存の後の「運賃の桁を確かめてください」（v82f）：同じ関数・同じ母集団に */
if (typeof v82fOdd === "function") {
  v82fOdd = function (r, all) {
    try {
      const o = v97fMedOf(r, all || ((FWDB && FWDB.rates) || []));
      if (!o || !o.out) return null;
      return { r, p: o.p, med: o.med, x: o.x, n: o.n, one: false, v97: o };
    } catch (e) { v97fErr("odd", e); return null; }
  };
}
if (typeof v82fOddTxt === "function") {
  const __ot97f = v82fOddTxt;
  v82fOddTxt = function (o) {
    try {
      if (o && o.v97) { const r = o.r; return `${r.pol}→${r.pod}・${r.mode} ${r.cur || "¥"}${(+r.price || 0).toLocaleString()}${r.unit || ""}（${v97fOutTxt(o.v97, r)}）`; }
    } catch (e) { v97fErr("oddtxt", e); }
    return __ot97f.apply(this, arguments);
  };
}
if (typeof v82fOddSheet === "function") {
  const __os97f = v82fOddSheet;
  v82fOddSheet = function () {
    const o = __os97f.apply(this, arguments);
    try {
      const el = document.querySelector("[data-v82fodd] .v82fodd p");
      if (el && /同じ仕向港・形態のほかのレートと比べて/.test(el.textContent || ""))
        el.textContent = String(el.textContent).replace("同じ仕向港・形態のほかのレートと比べて", "同じ輸送の形・単位の有効期限内のレートの中央値（レート管理の「要確認」と同じ数字）と比べて");
      else if (el && /differ by an order of/.test(el.textContent || "")) el.textContent = "Saved. Compared with the median of valid rates of the same mode and unit (same number as the rate table), these rates may have a wrong digit:";
    } catch (e) { v97fErr("oddsheet", e); }
    return o;
  };
}
/* ④ 手入力の「追加」の確かめ：21.92 の層（index.html の中・document の捕捉）の前に、同じ関数で確かめる。
      21.92 の確かめの文の「中央値」の段落は、この層の答えに置き換える（2回聞かない・違う中央値を出さない） */
var V97F_CF = { hook: 0 };
function v97fAddCheck() {
  const g = (id) => { const el = document.getElementById(id); return el ? v97fNfkc(el.value) : ""; };
  const price = +String(g("frPrice")).replace(/[,\s¥円]/g, "");
  const pol = g("frPol"), pod = g("frPod");
  if (!(price > 0) || !pol || !pod) return null;
  const mode = g("frMode") || "LCL", unit = /FCL/.test(mode) ? "/本" : /AIR/.test(mode) ? "/kg" : "/m³";
  const vIn = g("frValid");
  let co = ""; try { co = (typeof fwdRateCoInput === "function") ? fwdRateCoInput() : (typeof fwdCo === "function" ? fwdCo() : ""); } catch (e) { co = ""; }
  const nr = { co, pol, pod, mode, price, cur: "¥", unit, valid: vIn || "" };
  if (!v97fValid(nr)) return null;   /* 期限切れで登録するレートは見積に使われない＝中央値の点検はしない（期限の確かめは 21.92 のまま） */
  const key = (r) => [r.co || co, r.pol, r.pod, v97fUp(r.mode)].join("|"), k = key(nr);
  const R = ((FWDB && FWDB.rates) || []).filter((r) => r && !(key(r) === k && !r.dfw)).concat([nr]);   /* 同じ区間は置き換わる */
  const o = v97fMedOf(nr, R);
  if (!o || !o.out) return null;
  return v97fM(`運賃 ${v97fY(price)}${unit} は、中央値 ${v97fY(o.med)}${o.g.unit} の約${o.xs}倍です（${v97fBasis(o.g)}・登録すると表の「要確認」と同じ数字です）。\n桁の打ち間違いや単位（m³・本・kg）の違いがないか確かめてください。`,
    `${v97fY(price)}${unit} is about ${o.xs}× the median ${v97fY(o.med)}${o.g.unit} (${v97fBasis(o.g)}). Check digits and units.`);
}
window.addEventListener("click", (ev) => {
  try {
    const t = ev.target;
    if (!t || !t.closest || !t.closest("#frAdd")) return;
    if (typeof FWDON === "undefined" || !FWDON) return;
    const msg = v97fAddCheck();
    V97F_CF.hook = Date.now();
    if (msg) {
      v97fCnt("addAsk");
      if (!window.confirm(msg + "\n\n" + v97fM("このまま登録しますか？", "Register anyway?"))) {
        ev.preventDefault(); ev.stopImmediatePropagation(); V97F_CF.hook = 0;
        const f = document.getElementById("frPrice"); if (f) try { f.focus(); } catch (e) { /* 無視 */ }
        try { if (typeof toast === "function") toast(v97fM("登録していません。値を直して、もう一度「追加」を押してください。", "Not registered. Correct the value and press Add again.")); } catch (e) { /* 無視 */ }
        return;
      }
    }
    setTimeout(() => { V97F_CF.hook = 0; }, 0);
  } catch (e) { v97fErr("addclick", e); }
}, true);
(function () {
  try {
    if (window.__v97fConfirm) return;
    window.__v97fConfirm = 1;
    const oc = window.confirm;
    const RE = /運賃 ¥[\d,]+[^\n]*同じ形態（[^）]*）の登録 \d+本の中央値[\s\S]*?(?=\n\n|$)|¥[\d,]+[^\n]*is about [\d.]+× the median[^\n]*(?:\n[^\n]+)?/;
    window.confirm = function (m) {
      try {
        if (V97F_CF.hook && Date.now() - V97F_CF.hook < 3000 && RE.test(String(m))) {
          const rest = String(m).replace(RE, "").replace(/^\s+|\s+$/g, "").replace(/\n{3,}/g, "\n\n");
          const body = rest.replace(/(このまま登録しますか？|Register anyway\?)\s*$/, "").trim();
          v97fCnt("cfDrop");
          if (!body) return true;   /* 中央値の段落だけ＝この層で聞いた（または外れていない） */
          return oc.call(window, rest);
        }
      } catch (e) { v97fErr("cf", e); }
      return oc.apply(window, arguments);
    };
  } catch (e) { v97fErr("cfwrap", e); }
})();

/* ══════════════════════════════════════════════════════════════════════
   No.520 COURIER の日数：既定値の代わりに、実際に近い日数（登録の値 → 同じ国の登録 → 地域の目安）
   ══════════════════════════════════════════════════════════════════════ */
/* 港・都市 → 国（FWD_POD の逆＋よく出る港） */
var V97F_PORT = { "釜山": "韓国", "仁川": "韓国", "ソウル": "韓国", "基隆": "台湾", "高雄": "台湾", "台北": "台湾", "上海": "中国", "深圳": "中国", "青島": "中国", "天津": "中国", "大連": "中国", "広州": "中国", "寧波": "中国", "北京": "中国",
  "レムチャバン": "タイ", "バンコク": "タイ", "ホーチミン": "ベトナム", "ハイフォン": "ベトナム", "ハノイ": "ベトナム", "ポートケラン": "マレーシア", "クアラルンプール": "マレーシア", "マニラ": "フィリピン", "ジャカルタ": "インドネシア", "スラバヤ": "インドネシア",
  "ジェベルアリ": "UAE", "ドバイ": "UAE", "アブダビ": "UAE", "ロサンゼルス": "アメリカ", "ロングビーチ": "アメリカ", "ニューヨーク": "アメリカ", "シアトル": "アメリカ", "シカゴ": "アメリカ", "ホノルル": "ハワイ",
  "バンクーバー": "カナダ", "トロント": "カナダ", "ハンブルク": "ドイツ", "フランクフルト": "ドイツ", "ロッテルダム": "オランダ", "アムステルダム": "オランダ", "アントワープ": "ベルギー", "フェリクストウ": "イギリス", "ロンドン": "イギリス",
  "ルアーブル": "フランス", "パリ": "フランス", "ミラノ": "イタリア", "ジェノバ": "イタリア", "バルセロナ": "スペイン", "シドニー": "オーストラリア", "メルボルン": "オーストラリア", "オークランド": "ニュージーランド", "ナバシェバ": "インド", "ムンバイ": "インド", "チェンナイ": "インド" };
/* 国際宅配便（DHL・FedEx・UPS・EMS など）の日本発の一般的な目安（営業日）。地域ごと */
var V97F_REG = [
  { re: /^(韓国|大韓民国|台湾|香港|マカオ|Korea|South Korea|Taiwan|Hong Kong|Macau)$/i, lo: 2, hi: 3, nm: "東アジア", en: "East Asia" },
  { re: /^(中国|中華人民共和国|China)$/i, lo: 2, hi: 4, nm: "東アジア", en: "East Asia" },
  { re: /^(シンガポール|タイ|ベトナム|マレーシア|フィリピン|インドネシア|カンボジア|ミャンマー|ラオス|ブルネイ|Singapore|Thailand|Vietnam|Viet Nam|Malaysia|Philippines|Indonesia|Cambodia|Myanmar|Laos|Brunei)$/i, lo: 2, hi: 4, nm: "東南アジア", en: "Southeast Asia" },
  { re: /^(インド|バングラデシュ|スリランカ|パキスタン|ネパール|モルディブ|India|Bangladesh|Sri Lanka|Pakistan|Nepal|Maldives)$/i, lo: 3, hi: 5, nm: "南アジア", en: "South Asia" },
  { re: /^(アメリカ|米国|アメリカ合衆国|カナダ|USA|US|United States|Canada)$/i, lo: 3, hi: 5, nm: "北米", en: "North America" },
  { re: /^(グアム|ハワイ|サイパン|北マリアナ諸島|Guam|Hawaii|Saipan)$/i, lo: 3, hi: 5, nm: "グアム・ハワイ", en: "Guam / Hawaii" },
  { re: /^(イギリス|英国|フランス|ドイツ|イタリア|スペイン|オランダ|ベルギー|スイス|オーストリア|スウェーデン|ノルウェー|デンマーク|フィンランド|アイルランド|ポルトガル|ポーランド|チェコ|ハンガリー|ギリシャ|ルクセンブルク|UK|United Kingdom|France|Germany|Italy|Spain|Netherlands|Belgium|Switzerland|Austria|Sweden|Norway|Denmark|Finland|Ireland|Portugal|Poland|Czech|Hungary|Greece|Luxembourg)$/i, lo: 3, hi: 5, nm: "欧州", en: "Europe" },
  { re: /^(オーストラリア|ニュージーランド|Australia|New Zealand)$/i, lo: 3, hi: 5, nm: "オセアニア", en: "Oceania" },
  { re: /^(UAE|アラブ首長国連邦|サウジアラビア|カタール|クウェート|オマーン|バーレーン|イスラエル|トルコ|ヨルダン|Saudi Arabia|Qatar|Kuwait|Oman|Bahrain|Israel|Turkey|Türkiye|Jordan)$/i, lo: 3, hi: 6, nm: "中東", en: "Middle East" },
  { re: /^(メキシコ|ブラジル|チリ|ペルー|アルゼンチン|コロンビア|Mexico|Brazil|Chile|Peru|Argentina|Colombia)$/i, lo: 4, hi: 7, nm: "中南米", en: "Latin America" },
  { re: /^(南アフリカ|ケニア|ナイジェリア|エジプト|モロッコ|ガーナ|エチオピア|South Africa|Kenya|Nigeria|Egypt|Morocco|Ghana|Ethiopia)$/i, lo: 5, hi: 8, nm: "アフリカ", en: "Africa" }
];
function v97fCty(pod) {
  let s = v97fNfkc(pod);
  if (!s) return "";
  s = s.replace(/[（(][^)）]*[)）]/g, "").replace(/(港|空港|国際空港)$/, "").trim();
  if (V97F_PORT[s]) return V97F_PORT[s];
  try { if (typeof v90fCanon === "function") { const c = v90fCanon(s); if (c && c !== s) return V97F_PORT[c] || c; } } catch (e) { v97fErr("canon", e); }
  try { if (typeof ctyNorm === "function") { const c = ctyNorm(s); if (c) return V97F_PORT[c] || c; } } catch (e) { v97fErr("ctynorm", e); }
  return s;
}
function v97fRegOf(cty) { const c = String(cty || ""); return V97F_REG.find((x) => x.re.test(c)) || null; }
/* 備考の日数（「2〜4営業日」「所要3日」「transit 3-5 days」） */
function v97fNoteDays(note) {
  const s = v97fNfkc(note);
  if (!s) return null;
  let m = s.match(/(\d{1,2})\s*[〜~\-–—－]\s*(\d{1,2})\s*(?:営業)?日/) || s.match(/(\d{1,2})\s*[-–~]\s*(\d{1,2})\s*(?:business\s*)?days?/i);
  if (m && +m[1] > 0 && +m[2] >= +m[1] && +m[2] <= 60) return { lo: +m[1], hi: +m[2] };
  m = s.match(/(?:所要|日数|transit|リードタイム|到着まで)[^\d]{0,6}(\d{1,2})\s*(?:営業)?(?:日|days?)/i) || s.match(/(\d{1,2})\s*営業日/);
  if (m && +m[1] > 0 && +m[1] <= 60) return { lo: +m[1], hi: +m[1] };
  if (/翌日|next\s*day|overnight/i.test(s)) return { lo: 1, hi: 2 };
  return null;
}
function v97fIsCour(r) { return /COURIER|クーリエ|国際宅配|EMS|EXPRESS/i.test(String((r && r.mode) || "")); }
function v97fDefKind(r) { try { if (typeof v96fTtKind === "function") { const k = v96fTtKind(r); return k === "def" || k === "maybe" ? k : ""; } } catch (e) { v97fErr("kind", e); } return (r && r.ttDef === 1) ? "def" : ""; }
/* 既定値の COURIER のレートの「実際に近い日数」。無ければ null */
function v97fTtEst(r) {
  try {
    if (!r || !v97fIsCour(r)) return null;
    const k = v97fDefKind(r);
    if (!k) return null;
    const nd = v97fNoteDays(r.note);
    if (nd) return Object.assign({ src: "note", kind: k, was: +r.tt || 10 }, nd);
    const cty = v97fCty(r.pod);
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
    const peers = R.filter((x) => x && x !== r && v97fIsCour(x) && v97fValid(x) && !v97fDefKind(x) && +x.tt > 0 && v97fCty(x.pod) === cty);
    if (cty && peers.length) {
      const t = peers.map((x) => +x.tt).sort((a, b) => a - b);
      return { lo: t[0], hi: t[t.length - 1], src: "peer", co: [...new Set(peers.map((x) => x.co || ""))].filter(Boolean).slice(0, 2).join("・"), n: peers.length, kind: k, was: +r.tt || 10, cty };
    }
    const g = v97fRegOf(cty);
    if (g) return { lo: g.lo, hi: g.hi, src: "region", reg: v97fLang() === "ja" ? g.nm : g.en, kind: k, was: +r.tt || 10, cty };
    return null;
  } catch (e) { v97fErr("est", e); return null; }
}
function v97fRange(e) { return e.lo === e.hi ? String(e.lo) : e.lo + "〜" + e.hi; }
function v97fEstWord(e) { return e.src === "region" ? v97fM("目安", "estimate", "参考", "estimado") : v97fM("登録の日数", "registered", "已登记", "registrado"); }
function v97fEstWhy(e) {
  if (!e) return "";
  if (e.src === "note") return v97fM(`このレートの備考に書かれた日数です（日数の欄は空欄だったため、表の日数は既定値の ${e.was}日）`, `Days from the rate's note (the days cell was blank, so the table shows the default ${e.was} days)`);
  if (e.src === "peer") return v97fM(`同じ仕向地（${e.cty}）の COURIER の登録された日数です${e.co ? `（${e.co}）` : ""}。このレートの日数の欄は空欄（既定値の ${e.was}日）`, `Registered COURIER days to ${e.cty}${e.co ? ` (${e.co})` : ""}; this rate's days were blank (default ${e.was})`);
  return v97fM(`国際宅配便の日本発の一般的な目安です（${e.reg}・営業日・通関や週末で延びることがあります）。物流会社の登録の日数は空欄（既定値の ${e.was}日）で、まだ確かめていません`,
    `General estimate for international express from Japan (${e.reg}, business days; customs/weekends may add days). The forwarder's days were blank (default ${e.was}), not confirmed`);
}
/* 文の中の「約10日（既定値）」を「約2〜4日（目安：…）」に。d＝情勢見込みの日数（21.73 の「所要 約12日（クーリエ 約10日＋情勢見込み 2日）」） */
function v97fSwapText(t, e, d, word) {
  if (!e) return t;
  d = +d || 0;
  /* 見積の日数（目安の長いほう＝cur）と、レートの日数（既定値＝was）のどちらで書かれていても */
  const W = [...new Set([+(e.cur != null ? e.cur : e.was), +e.was])].filter((x) => x > 0), R = (a, b) => a === b ? String(a) : a + "〜" + b;
  let s = String(t), hit = 0;
  const alt = W.join("|");
  s = s.replace(new RegExp("約\\s*(?:" + alt + ")\\s*日(?:（(?:既定値|既定値かも)）)?(\\s*)＋\\s*情勢見込み\\s*(\\d+)\\s*日", "g"), (m, sp, dd) => { hit++; return `約${R(e.lo, e.hi)}日（${word || v97fEstWord(e)}）＋情勢見込み ${dd}日`; });
  if (d > 0) s = s.replace(new RegExp("約\\s*(?:" + W.map((w) => w + d).join("|") + ")\\s*日(?:（(?:既定値|既定値かも)）)?(?![＋+])", "g"), () => { hit++; return `約${R(e.lo + d, e.hi + d)}日`; });
  else if (!hit) s = s.replace(new RegExp("約\\s*(?:" + alt + ")\\s*日(?:（(?:既定値|既定値かも)）)?(?![＋+])", "g"), () => { hit++; return `約${R(e.lo, e.hi)}日`; });
  return s;
}
function v97fEstTxt(s, e, short, d) {
  if (!e) return s;
  const w = short ? v97fEstWord(e) : (e.src === "region" ? v97fM(`目安：国際宅配便の一般的な日数・${e.reg}。物流会社の登録の日数は未確認`, `estimate for international express, ${e.reg}; not confirmed by the forwarder`)
    : e.src === "peer" ? v97fM(`同じ国の登録の日数${e.co ? "・" + e.co : ""}`, `registered days to the same country`) : v97fM("備考の日数", "days from the note"));
  const src = String(s), cw = +(e.cur != null ? e.cur : e.was), alt = [...new Set([cw, +e.was])].join("|");
  /* 情勢見込みつきの書き方 */
  if (new RegExp("約\\s*(?:" + alt + ")\\s*日(?:（(?:既定値|既定値かも)）)?\\s*＋\\s*情勢見込み").test(src)) return v97fSwapText(src, e, d, w);
  if (+d > 0 && new RegExp("約\\s*(?:" + [...new Set([cw, +e.was])].map((x) => x + +d).join("|") + ")\\s*日").test(src)) return v97fSwapText(src, e, d, w);
  const re = new RegExp("約\\s*(?:" + alt + ")\\s*日(?:（(?:既定値|既定値かも)）)?(?:<span class=\"v96ttb[^\"]*\"[^>]*>[^<]*</span>)?");
  if (re.test(src)) return src.replace(re, `約${v97fRange(e)}日（${w}）`);
  const re2 = new RegExp("(\\D|^)(?:" + alt + ")\\s*日(?:（(?:既定値|既定値かも)）)?");
  return src.replace(re2, `$1${v97fRange(e)}日（${w}）`);
}
window.v97fTtEst = v97fTtEst; window.v97fEstTxt = v97fEstTxt; window.v97fSwapText = v97fSwapText; window.v97fEstWhy = v97fEstWhy; window.v97fEstWord = v97fEstWord; window.v97fRange = v97fRange; window.v97fCty = v97fCty; window.v97fNoteDays = v97fNoteDays;
/* 見積：既定値の COURIER のレートの見積に ttEst を持たせる（tt は 10 のまま＝推奨の点数は変えない） */
/* 見積の日数（tt）は目安の長いほう（推奨の点数・最速の判断・情勢見込みの足し算もこの日数で）。元の既定値は was に残す */
function v97fQEst(q, e) { if (q && e) { q.ttEst = { lo: e.lo, hi: e.hi, src: e.src, reg: e.reg || "", co: e.co || "", was: e.was, cty: e.cty || "", cur: e.hi }; q.tt = e.hi; } return q; }
if (typeof fwdQuoteCalc === "function") {
  const __qc97f = fwdQuoteCalc;
  fwdQuoteCalc = function (rate) {
    const q = __qc97f.apply(this, arguments);
    try { if (q && rate && v97fIsCour(rate)) { const e = v97fTtEst(rate); if (e) { v97fQEst(q, e); v97fCnt("qEst"); } } } catch (e) { v97fErr("qc", e); }
    return q;
  };
}
/* 前に作られた見積（ttEst なし）でも、レートから出す */
function v97fLegEst(l) {
  try {
    if (!l || !l.ok || !l.quote) return null;
    const q = l.quote;
    if (q.ttEst) return Object.assign({}, q.ttEst);
    if (!v97fIsCour({ mode: q.mode })) return null;
    const co = l.sel || l.co, o = (l.offers || []).find((x) => x && x.co === co);
    if (o && o.quote && o.quote.ttEst) return Object.assign({}, o.quote.ttEst);
    let rate = o && o.rate;
    if (!rate) { const ln = String(q.lane || "").split(/\s*→\s*/); rate = ((FWDB && FWDB.rates) || []).find((r) => r && v97fIsCour(r) && r.pol === ln[0] && r.pod === ln[1] && (!co || (r.co || "") === co)) || null; }
    if (!rate) return null;
    const full = ((FWDB && FWDB.rates) || []).find((r) => r && r.pol === rate.pol && r.pod === rate.pod && v97fUp(r.mode) === v97fUp(rate.mode) && (r.co || "") === (rate.co || "")) || rate;
    const e = v97fTtEst(Object.assign({}, full, { ttDef: full.ttDef != null ? full.ttDef : (q.ttDef === 1 ? 1 : undefined) }));
    return e && +e.was === +q.tt ? Object.assign(e, { cur: +q.tt }) : null;
  } catch (x) { v97fErr("legest", x); return null; }
}
function v97fOfferEst(o) {
  try {
    if (!o) return null;
    if (o.quote && o.quote.ttEst) return Object.assign({}, o.quote.ttEst);
    if (o.rate && v97fIsCour(o.rate)) { const e = v97fTtEst(o.rate); return e && (!o.quote || +o.quote.tt === +e.was) ? Object.assign(e, { cur: o.quote ? +o.quote.tt : e.was }) : null; }
  } catch (x) { v97fErr("oest", x); }
  return null;
}
window.v97fLegEst = v97fLegEst; window.v97fOfferEst = v97fOfferEst;
/* 見積の1行（AI物流マンの回答・やりとり・荷主への文）：「約10日（既定値）」→「約2〜4日（目安：…）」 */
if (typeof fwdLegLine === "function") {
  const __ll97f = fwdLegLine;
  fwdLegLine = function (l) {
    const s = __ll97f.apply(this, arguments);
    try { const e = v97fLegEst(l); if (e) { v97fCnt("legline"); return v97fEstTxt(s, e, false, l && l.delay); } } catch (x) { v97fErr("legline", x); }
    return s;
  };
}
if (typeof fwdScoreOffers === "function") {
  const __so97f = fwdScoreOffers;
  fwdScoreOffers = function () {
    const out = __so97f.apply(this, arguments);
    try {
      (Array.isArray(out) ? out : []).forEach((o) => {
        if (!o || !o.quote) return;
        const e = v97fOfferEst(o);
        if (!e) return;
        v97fQEst(o.quote, e);
        const d = (Array.isArray(arguments[4]) ? arguments[4] : []).reduce((a, x) => a + (+(x && x.delay) || 0), 0);
        if (Array.isArray(o.reasons)) o.reasons = o.reasons.map((s) => v97fEstTxt(s, e, true, d));
      });
    } catch (x) { v97fErr("score", x); }
    return out;
  };
}
/* AI物流マン・AI商社マンの文脈：既定値の COURIER のレーンに、使ってよい日数（目安）と言い方を足す */
function v97fTtCtx(maxN) {
  try {
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
    const L = R.filter((r) => r && v97fValid(r)).map((r) => ({ r, e: v97fTtEst(r) })).filter((x) => x.e);
    if (!L.length) return "";
    const n = maxN || 20;
    return `\n## COURIER の日数（登録の日数が空欄＝既定値 10日 のレーン）\n${L.slice(0, n).map((x) => `・${x.r.pol}→${x.r.pod} COURIER：${v97fRange(x.e)}日（${x.e.src === "region" ? "国際宅配便の一般的な目安・" + x.e.reg + "・営業日・未確認" : x.e.src === "peer" ? "同じ国の登録の日数" + (x.e.co ? "・" + x.e.co : "") : "レートの備考の日数"}）`).join("\n")}${L.length > n ? `\nほか ${L.length - n}レーン` : ""}\nこれらのレーンの所要日数・納期を答えるときは、10日とは答えず、上の日数に「目安（物流会社の日数は未確認）」と添えること。確定した日数のように言わないこと。\n`;
  } catch (e) { v97fErr("ttctx", e); return ""; }
}
if (typeof fwdContext === "function") {
  const __cx97f = fwdContext;
  fwdContext = function () { const s = __cx97f.apply(this, arguments); try { return String(s) + v97fTtCtx(20); } catch (e) { v97fErr("cx", e); return s; } };
}
if (typeof shipRateCtx === "function") {
  const __sc97f = shipRateCtx;
  shipRateCtx = function () { const s = __sc97f.apply(this, arguments); try { return s ? String(s) + v97fTtCtx(15) : s; } catch (e) { v97fErr("sc", e); return s; } };
}
if (typeof v90fRateLine === "function") {
  const __rl97f = v90fRateLine;
  v90fRateLine = function (r) { const s = __rl97f.apply(this, arguments); try { const e = v97fTtEst(r); if (e) return v97fEstTxt(s, e, false); } catch (x) { v97fErr("rline", x); } return s; };
}

/* AI物流マン（内蔵の計算）の「〇〇の登録レート」の答えの1行 */
if (typeof v73fRateLine === "function") {
  const __vr97f = v73fRateLine;
  v73fRateLine = function (x) {
    const s = __vr97f.apply(this, arguments);
    try {
      const e = x && x.r ? v97fTtEst(x.r) : null;
      if (e) {
        const w = v97fM(`所要 約${v97fRange(e)}日（${e.src === "region" ? `目安：国際宅配便の一般的な日数・${e.reg}` : e.src === "peer" ? "同じ国の登録の日数" : "備考の日数"}。登録の日数は空欄＝既定値の${e.was}日）`, `transit approx. ${v97fRange(e)} days (${e.src === "region" ? "estimate for international express" : "registered elsewhere"}; the registered days were blank = default ${e.was})`);
        return String(s).replace(new RegExp("所要 約" + e.was + "日|transit approx\\. " + e.was + " days"), w);
      }
    } catch (er) { v97fErr("v73line", er); }
    return s;
  };
}

/* 荷主の AI商社マンの「この見積はどう？」の答え（内蔵）と、AI に渡す見積の文脈 */
function v97fEstNote(e) {
  return v97fM(`※ ${e.cty || ""}向け COURIER の日数 ${v97fRange(e)}日は${e.src === "region" ? `国際宅配便の一般的な目安（${e.reg}・営業日）` : e.src === "peer" ? "同じ国のほかの登録レートの日数" : "レートの備考に書かれた日数"}です。物流会社の登録の日数は空欄（既定値の${e.was}日）で、まだ確かめていません。`,
    `* COURIER transit ${v97fRange(e)} days is ${e.src === "region" ? "a general estimate for international express" : "taken from other registered data"}; the forwarder's registered days were blank (default ${e.was}).`);
}
if (typeof fwdqAnswerLocal === "function") {
  const __qa97f = fwdqAnswerLocal;
  fwdqAnswerLocal = function (q, r, l) {
    const o = __qa97f.apply(this, arguments);
    try {
      const e = l && l.ok ? v97fLegEst(l) : null;
      if (e && o && o.a) {
        /* 見積の行（1段目）と「納期」の段の、この見積の日数だけ替える（内蔵参考レーン表の海上の日数は替えない） */
        const P = String(o.a).split("<br><br>");
        P[0] = v97fSwapText(P[0], e, l.delay, v97fEstWord(e)).replace(new RegExp("約" + v97fRange(e) + "日"), `約${v97fRange(e)}日（${v97fEstWord(e)}）`);
        const cw = +(e.cur != null ? e.cur : e.was);
        for (let i = 1; i < P.length; i++) if (/^<b>納期<\/b>/.test(P[i])) P[i] = P[i].replace(new RegExp("海上 約(?:" + cw + "|" + e.was + ")日"), `COURIER 約${v97fRange(e)}日（${v97fEstWord(e)}）`);
        o.a = P.join("<br><br>") + "<br><br>" + v97fE(v97fEstNote(e));
        v97fCnt("qaEst");
      }
    } catch (x) { v97fErr("qa", x); }
    return o;
  };
}
if (typeof fwdqCtx === "function") {
  const __qx97f = fwdqCtx;
  fwdqCtx = function (r) {
    const s = __qx97f.apply(this, arguments);
    try {
      const L = ((r && r.legs) || []).map((l) => ({ l, e: v97fLegEst(l) })).filter((x) => x.e);
      if (L.length) return String(s) + "\n" + L.map((x) => `・${x.l.cty} の COURIER の日数は ${v97fRange(x.e)}日（${x.e.src === "region" ? "国際宅配便の一般的な目安・" + x.e.reg : x.e.src === "peer" ? "同じ国の登録の日数" : "レートの備考の日数"}）。物流会社の登録の日数は空欄＝既定値の${x.e.was}日なので、10日とは答えず、目安であることを添えること。`).join("\n");
    } catch (x) { v97fErr("qx", x); }
    return s;
  };
}
/* 物流会社の見積受信箱：依頼の1行・やりとりの文 */
if (typeof v46LegTxt === "function") {
  const __lt97f = v46LegTxt;
  v46LegTxt = function (l) {
    const s = __lt97f.apply(this, arguments);
    try { const e = v97fLegEst(l); if (e) return v97fSwapText(s, e, 0).replace(new RegExp("約" + v97fRange(e) + "日"), `約${v97fRange(e)}日（${v97fEstWord(e)}）`); } catch (x) { v97fErr("lt", x); }
    return s;
  };
}
if (typeof v45Synth === "function") {
  const __sy97f = v45Synth;
  v45Synth = function (r) {
    const out = __sy97f.apply(this, arguments);
    try {
      ((r && r.legs) || []).forEach((l) => {
        const e = v97fLegEst(l);
        if (!e) return;
        (out || []).forEach((m) => { if (m && m.f === "物" && String(m.t).indexOf(v97fE(l.cty) + "：") === 0) m.t = v97fSwapText(m.t, e, 0).replace(new RegExp("約" + v97fRange(e) + "日"), `約${v97fRange(e)}日（${v97fEstWord(e)}）`); });
      });
    } catch (x) { v97fErr("synth", x); }
    return out;
  };
}

/* ══════════════════════════════════════════════════════════════════════
   No.519 B/L の容積：押さなくても計算しておき、1回で（確かめてから）全部の国に反映・元に戻す
   ══════════════════════════════════════════════════════════════════════ */
/* 案件の、B/L の容積で計算し直せる国の一覧（まだ反映していないもの）。計算は 21.96 の v96fVolPreview（同じ式） */
function v97fVolAuto(c, cs) {
  const out = [];
  try {
    if (typeof v96fVolLines !== "function" || typeof v96fVolPreview !== "function") return out;
    const L = v96fVolLines(c, cs) || [];
    L.forEach((x) => {
      if (x.ap || x.bl == null || x.from == null || Math.abs(x.bl - x.from) < 0.0001) return;
      let pv = x.pv;
      if (!pv || pv.err || Math.abs(+pv.cbm - x.bl) > 0.0001 || Math.round(+pv.old) !== Math.round(+x.P.q.total)) {
        /* 計算だけする（21.96 の箱の「計算し直す」を押したときの表示は出さない＝反映のボタンを2つ並べない） */
        const key = x.rid + "|" + x.cty, P0 = (window.V96FWD && V96FWD.pv) || {}, had = Object.prototype.hasOwnProperty.call(P0, key) ? P0[key] : undefined;
        pv = v96fVolPreview(x.rid, x.cty);
        try { if (had === undefined) delete V96FWD.pv[key]; else V96FWD.pv[key] = had; } catch (e) { v97fErr("pvkeep", e); }
      }
      if (pv && !pv.err) out.push({ rid: x.rid, cty: x.cty, from: x.from, bl: x.bl, old: +pv.old, neu: +pv.neu, co: pv.co || "" });
    });
  } catch (e) { v97fErr("volauto", e); }
  return out;
}
/* 案件の反映済みの国 */
function v97fVolApplied(c, cs) {
  try { return ((typeof v96fVolLines === "function" ? v96fVolLines(c, cs) : []) || []).filter((x) => x.ap).map((x) => ({ rid: x.rid, cty: x.cty, from: x.ap.from, bl: x.ap.cbm, old: +x.ap.old, neu: +x.ap.neu })); } catch (e) { v97fErr("volap", e); return []; }
}
/* 全部の国に反映（v96fVolApply を国ごとに）。戻すための一覧を返す */
function v97fVolApplyAll(L) {
  const done = [];
  try {
    (L || []).forEach((x) => {
      try { if (typeof v96fVolPreview === "function") v96fVolPreview(x.rid, x.cty); } catch (e) { v97fErr("pv", e); }
      if (typeof v96fVolApply === "function" && v96fVolApply(x.rid, x.cty)) done.push({ rid: x.rid, cty: x.cty });
    });
    if (done.length) v97fCnt("applyAll");
  } catch (e) { v97fErr("applyall", e); }
  return done;
}
function v97fVolUndoAll(L) {
  let n = 0;
  try { (L || []).forEach((x) => { if (typeof v96fVolUndo === "function" && v96fVolUndo(x.rid, x.cty)) n++; }); if (n) v97fCnt("undoAll"); } catch (e) { v97fErr("undoall", e); }
  return n;
}
/* 荷主に知らせる文（依頼ページの「相手へのひとこと」に入れる） */
function v97fVolNote(L) {
  try {
    if (!L || !L.length) return "";
    const x0 = L[0];
    const lines = L.map((x) => `・${x.cty}（${x.rid}）：${v97fY(x.old)} → ${v97fY(x.neu)}`).join("\n");
    return v97fM(`お見積の容積について：ご依頼のときにいただいた容積は ${x0.from} m³ でしたが、B/L の容積は ${x0.bl} m³ でした。B/L の容積で計算し直した金額は次のとおりです。\n${lines}\nどちらの容積が正しいか、ご確認をお願いします（数量が変わる場合は、出荷の画面から数量を直して再見積してください）。`,
      `About the quote volume: you shared ${x0.from} m³, but the B/L says ${x0.bl} m³. Recalculated with the B/L volume:\n${lines}\nPlease confirm which volume is correct.`);
  } catch (e) { v97fErr("volnote", e); return ""; }
}
window.v97fVolAuto = v97fVolAuto; window.v97fVolApplied = v97fVolApplied; window.v97fVolApplyAll = v97fVolApplyAll; window.v97fVolUndoAll = v97fVolUndoAll; window.v97fVolNote = v97fVolNote;
