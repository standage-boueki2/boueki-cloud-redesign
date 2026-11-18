/* ═══ 21.97.1 分野 adm（2026-11-18 第10回相当・管理者の再試行〔版21.97／build fc9f4322deee〕で見つかったもの）＝管理コンソール ═══
   土台・前の層（v96/logic_v2196adm.js ほか）は書き換えず、前の関数を控えてから包む。
   ・No.539（AI 接続のページの中で、デモ用のトークンの上限の書き方が食い違う）
     原因：上の「AI の利用量の上限」の行は同期サーバーの設定（air_get の conf.tokAcct・tokDemo・tokAll）から出すが、21.96 で足した
     「利用量（%）の見方」の説明は「普通のアカウント 4,000,000・デモ用 1,000,000 トークン」と書き込みの数だった（11/17 にデモ用を
     400万に上げる前の値）。
     直し：説明の上限も、上の行と同じ conf から出す。conf が届いていないときは数を書かず「上の行と同じ（同期サーバーの設定）」とだけ書く。
   ・No.525 の残り（期限は一致したが、今日の作業の札が「期限切れ・台帳では有効のまま 2件」）
     原因：札の言葉は、台帳の「状態」の欄（有効／停止）が「有効」のまま期限が過ぎたアカウントを数える意味だったが、21.96 で台帳の表も
     「期限切れ」と出すようにしたため、「台帳では有効のまま」が画面の表示と食い違って読める。
     直し：札を「期限切れ（延長か停止を決める）」に変え、押したときの説明（title）に数え方を書く。数え方そのもの（v96 の早い方の期限）は変えない。
   ・No.528 の残り（開いた直後に数は出るが、ログインのときに1回取った数のまま）
     直し：商社デスク・CS 横断の欄が画面に見えていて、最後に取ってから 3分 を過ぎていたら、もう一度取り直す（取得中は前の数を残し「取得中…」）。
     見張りは 5秒ごと・管理コンソールのときだけ・欄が見えているときだけ（画面は書き換えない）。 */
var V97ADM = window.V97ADM = { v: "21.97.1", err: [], n: { tok: 0, chip: 0, reDesk: 0, reIb: 0 } };
var V97ADM_STALE = 180000;
function v97admErr(k, e) { try { V97ADM.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97ADM.err.length > 30) V97ADM.err.shift(); } catch (x) { /* 無視 */ } }
function v97admLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v97admM(ja, en, zh, es) { const l = v97admLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v97admE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function v97admIs() { try { return typeof v96admIs === "function" ? !!v96admIs() : (typeof SES !== "undefined" && !!SES && SES.t === "admin"); } catch (e) { return false; } }

/* ══════════ No.539：説明の上限を、上の行と同じ同期サーバーの設定から ══════════ */
function v97admConf() { try { return (typeof V63A !== "undefined" && V63A && V63A.adm && V63A.adm.conf) || null; } catch (e) { return null; } }
function v97admTokN(v) {
  try { if (typeof v81appTokN === "function") return String(v81appTokN(v)); } catch (e) { /* 下へ */ }
  if (v == null || !(+v > 0)) return v97admM("上限なし", "no limit", "无上限", "sin límite");
  try { return (+v).toLocaleString("en-US"); } catch (e) { return String(v); }
}
function v97admLimTxt() {
  const C = v97admConf();
  if (!C || C.tokAcct == null) {
    return {
      ja: "上限は、上の「AI の利用量の上限」の行と同じ同期サーバーの設定です（設定がまだ届いていないため、ここには数を書いていません）",
      en: "The limits are the sync-server settings shown in the “AI usage limits” line above (not shown here until the settings arrive)"
    };
  }
  const a = v97admTokN(C.tokAcct), d = v97admTokN(C.tokDemo);
  return {
    ja: `上限は、上の「AI の利用量の上限」の行と同じ同期サーバーの設定で、1アカウント ${a}・デモ用 ${d} トークン（個別の上限を入れたアカウントは、表の「今日／上限」の数）`,
    en: `The limits are the sync-server settings in the “AI usage limits” line above: ${a} tokens per account and ${d} for demo accounts (accounts with an individual limit use the number in “Today / limit”)`
  };
}
if (typeof v96admTokHtml === "function") {
  const __tok97adm = v96admTokHtml;
  v96admTokHtml = function () {
    let h = __tok97adm.apply(this, arguments);
    try {
      if (typeof h !== "string") return h;
      const L = v97admLimTxt();
      const h0 = h;
      h = h.replace(/上限の既定は、普通のアカウント [0-9,]+・デモ用 [0-9,]+ トークン（同期サーバーの決まり）/, () => v97admE(L.ja));
      h = h.replace(/Default limits: [0-9,]+ tokens for normal accounts and [0-9,]+ for demo accounts \(sync server rule\)/, () => v97admE(L.en));
      if (h !== h0) V97ADM.n.tok++;
    } catch (e) { v97admErr("tok", e); }
    return h;
  };
}

/* ══════════ No.525 の残り：今日の作業の札の言葉 ══════════ */
if (typeof v84AdmTodayHtml === "function") {
  const __td97adm = v84AdmTodayHtml;
  v84AdmTodayHtml = function () {
    let h = __td97adm.apply(this, arguments);
    try {
      if (typeof h !== "string") return h;
      const lb = v97admM("期限切れ（延長か停止を決める）（件）", "Expired · extend or suspend", "已过期（决定延长或停用）", "Vencidas · ampliar o suspender");
      const tip = v97admM("期限（台帳と同期サーバーの記録の早い方）が過ぎていて、まだ停止していないアカウントの数です。延長するか停止するかを決めてください。台帳の表でも「期限切れ」と出ます。",
        "Accounts whose expiry (the earlier of the ledger and the sync-server record) has passed and that are not suspended yet. Decide whether to extend or suspend them. The ledger table also shows them as “Expired”.",
        "期限（台账与同步服务器记录中较早者）已过且尚未停用的账户数。请决定延长或停用。台账表中也显示为“已过期”。",
        "Cuentas cuyo vencimiento (el anterior entre el registro y el servidor) ya pasó y que aún no están suspendidas. Decida si ampliarlas o suspenderlas. La tabla del registro también las muestra como «Vencida».");
      const h0 = h;
      h = h.replace(/<button type="button" class="v84td-c"([^>]*)><span>期限切れ・台帳では有効のまま（件）<\/span>/, (m0, at) => `<button type="button" class="v84td-c"${at} title="${v97admE(tip)}"><span data-noi18n>${v97admE(lb)}</span>`);
      if (h !== h0) V97ADM.n.chip++;
    } catch (e) { v97admErr("chip", e); }
    return h;
  };
}

/* ══════════ No.528 の残り：見えているときに古ければ取り直す ══════════ */
function v97admSeen(id) {
  try {
    const el = document.getElementById(id);
    if (!el || !el.isConnected || !el.getClientRects().length) return false;   /* display:none（タブで隠れている）は見えていない */
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0;
  } catch (e) { return false; }
}
function v97admMaster() { try { return typeof v96admMaster === "function" ? !!v96admMaster() : v97admIs(); } catch (e) { return false; } }
/* 「開いた」＝欄が見えていなかった状態から見える状態になったとき（見えている間に何度も取り直さない） */
V97ADM.vis = { desk: false, ib: false };
function v97admReTick() {
  try {
    if (!v97admIs() || !v97admMaster()) { V97ADM.vis = { desk: false, ib: false }; return; }
    if (typeof syncOn === "function" && !syncOn()) return;
    const now = Date.now();
    /* 商社デスク */
    const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || null;
    const sd = v97admSeen("v75admOut"), wd = V97ADM.vis.desk;
    V97ADM.vis.desk = sd;
    if (sd && !wd && D && D.at && !D.busy && now - D.at > V97ADM_STALE && typeof v75tcAdmLoad === "function") {
      V97ADM.n.reDesk++;
      Promise.resolve().then(() => v75tcAdmLoad()).catch((e) => v97admErr("reDesk", e));
    }
    /* CS 横断 */
    const I = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.ib) || null;
    const go = document.getElementById("adminboxGo");
    const si = v97admSeen("adminboxOut"), wi = V97ADM.vis.ib;
    V97ADM.vis.ib = si;
    if (si && !wi && I && I.at && !I.busy && now - I.at > V97ADM_STALE && typeof admInboxLoad === "function" && go && !go.disabled) {
      V97ADM.n.reIb++;
      Promise.resolve().then(() => admInboxLoad()).catch((e) => v97admErr("reIb", e));
    }
  } catch (e) { v97admErr("reTick", e); }
}
setInterval(v97admReTick, 5000);
