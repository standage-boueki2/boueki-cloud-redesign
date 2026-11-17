/* ═══ 21.96 分野 adm（2026-11-17 第9回相当 UAT・21.95.1）管理者コンソール＝機能の中身の層
   土台（index.html）・刷新版（rd/）・21.95（v95/）は書き換えず、前の関数を控えてから包む。見せ方は rd_v96adm.css。
   同期サーバー（GAS）のコードは変えない。サーバーが要るものは「サーバーが X を返せば読む」形で書く。
   ・No.524（同期が終わるまで古い数）：21.80.1 は「数字（概要）」のタイルだけを「読み込み中…」にしていた。刷新版の上の段
     （重要なお知らせ・アカウントの状況・利用内訳）と「今日の作業」の件数は、この端末の控え（古い台帳）のまま出ていた。
     → 同期サーバーから最新の台帳を読み終えるまで（v801fAdmSt＝wait）は、件数・利用の数を出さず「同期中…（N秒）」と出す。
       読めなかった・遅れているとき（err／late／off）は、数のすぐ上に「この端末に控えた ○時点の数（最新ではありません）」と書く。
       読み終えたら刷新版の上の段を組み直す。アカウント一覧の上にも「いまの一覧は控えの N件」と出す。
   ・No.525（期限切れなのに台帳では有効）：台帳（admin_get）の期限と、同期サーバーのアカウントの記録（air_get の accts）の期限が食い違う
     アカウントがある（AI 接続の表は air_get の期限で「期限切れ・OFF」）。→ 期限は「台帳」と「同期サーバーの記録」の早い方で判定し、
     アカウント一覧の状態・絞り込み（data-st）・アカウントの状況・数字（概要）の「うち有効」・今日の作業の「期限切れ・台帳では有効のまま」・
     契約満了が近いアカウントを同じ基準にそろえる。食い違いは行と AI 接続の表に書き、直し方（台帳をサーバーへ送る）を出す。台帳の値は書き換えない。
   ・No.526（Ver1.0 の週次取込が届かない）：警告の横に、再実行の方法（コマンド・どの PC・約何分）・担当（サーバーの設定 v1owner が無ければ
     「STANDAGE の管理者」）・次の自動実行を出し、管理者 PC に頼らない道（今ある「Ver1.0 集計JSONを取り込む」・DIGITRAD_TOKEN があれば
     「今すぐ全社データを更新」）に結びつける。取込が遅れているときは、刷新版の「重要なお知らせ」にも出す（Ver1.0 の欄は「あまり使わない項目」の中のため）。
   ・No.527（AI 質問の数え方）：利用内訳の「AIへの質問」は Web 検索を引いた数だった → 「AI への質問（Web 検索なし／つき）」と書き、合計＝概要の数を明記。
     API コスト分析には、今日の「この PC で記録した外部 AI の回数」と「サーバー経由の回数」の違いと差を、数から計算してその場で出す
     （内蔵エンジンの答えはどちらにも入らないことも書く。差を「内蔵の答え」とは言わない＝コードで確かめた数え方の範囲が違うため）。
   ・No.528（商社デスク・CS 横断が取得ボタンまでダッシュ）：管理コンソールを開いたら（台帳の同期のあと）1回だけ自動で取得し、取得中は「取得中…」。
     件数を「今日の作業」と各欄の見出しに出す。CS 横断の結果は、管理コンソールを描き直しても消えないよう控える。
   ・No.529（メール未登録・パスワード未作成）：「ログインの切り替え」の欄に、まだの人の一覧（まだの理由・次にやること・メールを登録／案内文をコピー／
     招待状）を出す。本人の側は、ログイン後のバー（メール未登録→登録してパスワードを作る）と、ログイン画面の「初めての方」が既にある。
   ・7.3（AI 利用量の突合）：AI 接続（サーバー経由）の欄に、お客様の画面の「利用量 %」がトークン基準（今日のトークン ÷ 1日のトークンの上限）
     であることと分母を書く。air_get の accts に tokUsed・tokCap があれば行ごとに %、hist に tin・tout があれば今月のトークンの累計を出す。 */
var V96ADM = window.V96ADM = { v: "21.96", err: [], n: { deco: 0, exp: 0, auto: 0, ib: 0, pw: 0, v1: 0, tok: 0, cnt: 0, rebuild: 0 },
  lastSt: null, waitT0: 0, auto: { ses: null, started: 0, t0: 0, done: 0 }, ib: { busy: 0, rows: null, html: "", at: 0, sum: null, N: 0 } };
function v96admErr(k, e) { try { V96ADM.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96ADM.err.length > 30) V96ADM.err.shift(); } catch (x) { /* 無視 */ } }
function v96admLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^ja/.test(v) ? "ja" : "en"; } catch (e) { return "ja"; } }
function v96admM(ja, en) { return v96admLang() === "ja" ? ja : (en || ja); }
function v96admE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v96admF(n) { try { return Math.round(+n || 0).toLocaleString("ja-JP"); } catch (e) { return String(n); } }
function v96admMd(t) { const d = new Date(+t || 0); return (d.getMonth() + 1) + "/" + d.getDate(); }
function v96admYmd(t) { const d = new Date(+t || 0); return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(); }
function v96admHm(t) { const d = new Date(+t || 0); return v96admMd(t) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function v96admWd(t) { const d = new Date(+t || 0); return v96admLang() === "ja" ? v96admMd(t) + "（" + "日月火水木金土"[d.getDay()] + "）" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] + " " + v96admMd(t); }
function v96admDayKey(t) { const d = new Date(+t || 0); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function v96admIs() { try { return typeof SES !== "undefined" && !!SES && SES.t === "admin" && typeof cur !== "undefined" && cur === "adm"; } catch (e) { return false; } }
function v96admMaster() { try { return v96admIs() && !(typeof v57Co === "function" && v57Co()); } catch (e) { return false; } }
function v96admSyncOn() { try { return typeof syncOn === "function" && !!syncOn(); } catch (e) { return false; } }
function v96admAccts() { try { return (typeof ADB !== "undefined" && ADB && Array.isArray(ADB.accounts)) ? ADB.accounts.filter((a) => a && a.code) : []; } catch (e) { return []; } }
function v96admFind(code) { try { return typeof findAcct === "function" ? findAcct(code) : null; } catch (e) { return null; } }
function v96admAir() { try { return (typeof V63A !== "undefined" && V63A && V63A.adm && V63A.adm.ok !== false) ? V63A.adm : null; } catch (e) { return null; } }
function v96admRD() { try { return window.RDX || null; } catch (e) { return null; } }
/* 上の段が伸び縮みしても、見ている所がずれないように（下の方を見ているときだけ。見えている一番上の欄を目印にする） */
function v96admAnchor() {
  try {
    const w = document.getElementById("well");
    if (!w || window.scrollY < 40) return null;
    const el = [...w.querySelectorAll(".c[id]")].find((e) => { if (!e.offsetParent) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom > 70; });
    return el ? { id: el.id, top: el.getBoundingClientRect().top } : null;
  } catch (e) { return null; }
}
function v96admKeep(A) {
  try {
    if (!A) return;
    const el = document.getElementById(A.id);
    if (!el) return;
    const d = el.getBoundingClientRect().top - A.top;
    if (Math.abs(d) > 2) window.scrollBy(0, d);
  } catch (e) { v96admErr("keep", e); }
}
/* 取得の結果が欄に入るとき（id の中身が入れ替わるとき）に、見ている所を保つ。描く前（MutationObserver の中）で直すので、跳ねて見えない */
function v96admGuard(id) {
  let anc = v96admAnchor(), mo = null;
  const onScroll = () => { anc = v96admAnchor(); };
  try {
    window.addEventListener("scroll", onScroll, { passive: true });
    const out = document.getElementById(id);
    if (out && typeof MutationObserver === "function") { mo = new MutationObserver(() => { v96admKeep(anc); anc = v96admAnchor(); }); mo.observe(out, { childList: true }); }
  } catch (e) { v96admErr("guard", e); }
  return () => { try { window.removeEventListener("scroll", onScroll); if (mo) mo.disconnect(); } catch (e) { /* 無視 */ } };
}
function v96admIcon(n, s, w) { try { const RD = v96admRD(); return RD && typeof RD.I === "function" ? RD.I(n, s || 18, w) : ""; } catch (e) { return ""; } }

/* ══════════ No.524 同期の状態（21.80.1 の判定をそのまま使う） ══════════
   "wait"＝同期サーバーから最新の台帳を読んでいる途中／"stale"＝読めなかった・遅れている・同期なし（控えの数を出す）／""＝最新 */
function v96admSt() {
  try {
    if (!v96admIs()) return "";
    if (typeof v801fAdmSt === "function") { const s = v801fAdmSt(); V96ADM.raw = s; return s === "wait" ? "wait" : (s ? "stale" : ""); }
  } catch (e) { v96admErr("st", e); }
  return "";
}
function v96admAtTxt() { try { return typeof v801fAtTxt === "function" ? String(v801fAtTxt() || "").trim() : ""; } catch (e) { return ""; } }
function v96admWaitSec() { const t0 = (typeof V801F !== "undefined" && V801F && V801F.adm && V801F.adm.t0) || V96ADM.waitT0 || Date.now(); return Math.max(0, Math.round((Date.now() - t0) / 1000)); }
function v96admSyncTxt(st) {
  if (st === "wait") return v96admM("☁ 同期中…（" + v96admWaitSec() + "秒）同期サーバーから最新の台帳と利用の数を読み込んでいます。読み終わるまで、件数と利用の数は出しません。",
    "☁ Syncing… (" + v96admWaitSec() + " s) Loading the latest ledger and usage from the sync server. Counts are shown once loading finishes.");
  const at = v96admAtTxt(), off = V96ADM.raw === "off";
  return v96admM("⚠ 下の数は、この端末に控えた" + (at ? " " + at + "の" : "") + "数です（" + (off ? "同期サーバーにつながっていない" : "同期サーバーから最新の台帳を読み込めていない") + "ため、最新ではありません）。",
    "⚠ The numbers below are those saved on this device" + (at ? " (" + at + ")" : "") + " — not the latest, because " + (off ? "the sync server is not connected." : "the latest ledger has not been loaded from the sync server yet."));
}

/* 刷新版の上の段（rd_adm.js の RD.page.adm が作る）の3枚 */
function v96admRdBox(w) {
  try {
    const cards = [...(w || document).querySelectorAll(".rd-x section.k-card")];
    const by = (re) => cards.find((c) => re.test(((c.querySelector(".k-h h2") || {}).textContent) || ""));
    const st = by(/アカウントの状況|Account status/), use = by(/利用内訳|Usage breakdown/), note = by(/重要なお知らせ|Important notices/);
    const box = (st || use || note) ? (st || use || note).closest(".rd-x") : null;
    return { box, st, use, note };
  } catch (e) { v96admErr("rdbox", e); return { box: null }; }
}
function v96admRdDeco(w) {
  try {
    if (!v96admIs()) return;
    w = w || document.getElementById("well");
    if (!w) return;
    const R = v96admRdBox(w);
    if (!R.box) return;
    V96ADM.n.deco++;
    const st = v96admSt();
    // 一番上の同期の状態
    let top = R.box.querySelector(":scope > .v96adm-sync");
    if (st) {
      if (!top) { top = document.createElement("p"); top.className = "v96adm-sync"; top.setAttribute("role", "status"); top.setAttribute("data-noi18n", ""); top.innerHTML = '<span class="v96adm-synct"></span>'; R.box.prepend(top); }
      top.classList.toggle("wait", st === "wait"); top.classList.toggle("stale", st !== "wait");
      const sp = top.querySelector(".v96adm-synct"), t = v96admSyncTxt(st);
      if (sp && sp.textContent !== t) sp.textContent = t;
      let rb = top.querySelector("[data-v801fre]");
      if (st === "stale" && V96ADM.raw !== "off") { if (!rb) { rb = document.createElement("button"); rb.type = "button"; rb.className = "btn g v96adm-b"; rb.setAttribute("data-v801fre", ""); rb.textContent = v96admM("今すぐ読み直す", "Reload now"); top.appendChild(rb); } }
      else if (rb) rb.remove();
    } else if (top) top.remove();
    R.box.classList.toggle("v96adm-wait", st === "wait");
    [R.st, R.use, R.note].forEach((c) => {
      if (!c) return;
      c.setAttribute("data-v96m", "1");
      let ld = c.querySelector(":scope > .v96adm-ldbox");
      if (st === "wait") {
        if (!ld) { ld = document.createElement("div"); ld.className = "v96adm-ldbox"; ld.setAttribute("data-noi18n", ""); c.appendChild(ld); }
        const t = c === R.note ? v96admM("同期が終わってから、対応が必要な項目を出します（同期中…）", "Items that need action are shown once syncing finishes (syncing…)")
          : c === R.st ? v96admM("台帳の件数は、同期が終わってから出します（同期中…）", "Ledger counts are shown once syncing finishes (syncing…)")
            : v96admM("利用の数は、同期が終わってから出します（同期中…）", "Usage is shown once syncing finishes (syncing…)");
        if (ld.textContent !== t) ld.textContent = t;
      } else if (ld) ld.remove();
      let sl = c.querySelector(":scope > .v96adm-stale");
      if (st === "stale") {
        if (!sl) { sl = document.createElement("p"); sl.className = "v96adm-stale"; sl.setAttribute("data-noi18n", ""); const h = c.querySelector(".k-h"); if (h) h.after(sl); else c.prepend(sl); }
        const at = v96admAtTxt();
        const t = c === R.note ? v96admM("台帳とメールの件数は、この端末に控えた" + (at ? " " + at + "の" : "") + "数です（最新ではありません）", "Ledger and email counts are saved on this device" + (at ? " (" + at + ")" : "") + " — not the latest")
          : v96admM("この端末に控えた" + (at ? " " + at + "の" : "") + "数です（最新ではありません）", "Saved on this device" + (at ? " (" + at + ")" : "") + " — not the latest");
        if (sl.textContent !== t) sl.textContent = t;
      } else if (sl) sl.remove();
    });
    if (st !== "wait") {
      v96admStatusCard(R.st);
      v96admUseCard(R.use);
      v96admNoteCard(R.note);
    }
  } catch (e) { v96admErr("rdDeco", e); }
}
/* 刷新版の上の段を組み直す（同期が終わったとき・取込の結果が出たとき） */
function v96admRebuild(why) {
  try {
    const RD = v96admRD();
    if (!RD || typeof RD.after !== "function" || !v96admIs()) return;
    // 組み直しで上の段の高さが変わっても、見ている所がずれないように（上の段より下を見ているときは、その分だけ送る）
    const y = window.scrollY, A = v96admAnchor();
    V96ADM.n.rebuild++;
    RD.after(true);
    v96admRdDeco();
    try { if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y); } catch (e) { /* 無視 */ }
    v96admKeep(A);
  } catch (e) { v96admErr("rebuild:" + why, e); }
}
/* アカウント一覧の上の「控えの N件」 */
function v96admAccNote() {
  try {
    const acc = document.getElementById("accounts");
    if (!acc) return;
    const st = v96admIs() ? v96admSt() : "";
    let n = document.getElementById("v96admAccSt");
    if (!st) { if (n) n.remove(); return; }
    if (!n) { n = document.createElement("p"); n.id = "v96admAccSt"; n.className = "v96adm-sync"; n.setAttribute("role", "status"); n.setAttribute("data-noi18n", ""); const h = acc.querySelector(".rw"); if (h) h.after(n); else acc.prepend(n); }
    const rows = acc.querySelectorAll("tbody tr[data-st]").length;
    const t = st === "wait"
      ? v96admM("☁ 同期中…いま並んでいるのは、この端末に控えた " + rows + "件です。同期サーバーから最新の台帳を読み終えたら、入れ替えます（利用の回数の列は「…」）。",
        "☁ Syncing… The " + rows + " rows below are the copy saved on this device. They are replaced once the latest ledger is loaded from the sync server.")
      : v96admSyncTxt(st);
    n.classList.toggle("wait", st === "wait"); n.classList.toggle("stale", st !== "wait");
    if (n.textContent !== t) n.textContent = t;
  } catch (e) { v96admErr("accNote", e); }
}

/* ══════════ No.525 期限＝台帳と同期サーバーの記録の早い方 ══════════ */
function v96admSrvExp(code) {
  try { const R = v96admAir(); const x = R && (R.accts || []).find((y) => y && y.code === code); return x && +x.expires > 0 ? +x.expires : 0; } catch (e) { return 0; }
}
function v96admEff(a) {
  const led = a && +a.expires > 0 ? +a.expires : 0, srv = a ? v96admSrvExp(a.code) : 0;
  const exp = led && srv ? Math.min(led, srv) : (led || srv);
  return { led, srv, exp, mism: !!(led && srv && Math.abs(led - srv) > 60000), bySrv: !!(srv && (!led || srv < led - 60000)) };
}
function v96admIsExp(a) { if (!a || a.st !== "active") return false; const e = v96admEff(a); return !e.exp || e.exp < Date.now(); }
function v96admIsLive(a) { return !!a && a.st === "active" && !v96admIsExp(a); }
function v96admSrvNote(e) {
  return v96admM("同期サーバーの記録では " + v96admYmd(e.srv) + " に終了（台帳の期限 " + v96admYmd(e.led) + " と食い違い）",
    "The sync server's record ended on " + v96admYmd(e.srv) + " (ledger says " + v96admYmd(e.led) + ")");
}
function v96admExpPatch() {
  let ch = 0;
  try {
    if (!v96admIs()) return 0;
    const now = Date.now();
    const acc = document.getElementById("accounts");
    if (acc) acc.querySelectorAll("tbody tr[data-st]").forEach((tr) => {
      const b = tr.querySelector("[data-tgl],[data-det]");
      const code = b && (b.getAttribute("data-tgl") || b.getAttribute("data-det"));
      const a = code ? v96admFind(code) : null;
      if (!a) return;
      const e = v96admEff(a);
      if (a.st === "active" && e.bySrv && e.srv < now && tr.dataset.st === "active") {
        tr.dataset.st = "expired"; tr.setAttribute("data-v96exp", "1"); ch++;
        const td = [...tr.children].slice(0, 6).find((x) => { const p = x.querySelector(".p.hi"); return p && /^(有効|Active)$/.test((p.textContent || "").trim()); });
        if (td) {
          const p = td.querySelector(".p.hi");
          p.className = "p mid"; p.textContent = v96admM("期限切れ", "Expired");
        }
      }
      if (e.mism && e.bySrv) {
        const td = [...tr.children].find((x) => x.__v70 != null || (x.classList.contains("n") && /\d{1,2}\/\d{1,2}/.test(x.textContent || "")));
        if (td && !td.querySelector(".v96adm-srvexp")) {
          const left = [...td.querySelectorAll("span")].find((x) => /残り|left|今日まで|today/i.test(x.textContent || ""));
          if (left) left.textContent = v96admM("（台帳の期限）", "(ledger expiry)");
          const s = document.createElement("small"); s.className = "v96adm-srvexp"; s.setAttribute("data-noi18n", "");
          s.textContent = v96admM("同期サーバーの記録：" + v96admYmd(e.srv) + " で終了", "Sync server record: ended " + v96admYmd(e.srv));
          td.appendChild(s); tr.title = v96admSrvNote(e);
          const st = tr.querySelector(".p.mid"); if (st) st.title = v96admSrvNote(e) + v96admM("。早い方の期限で「期限切れ」と出しています。", ". The earlier date is used.");
        }
      }
    });
    const s30 = document.getElementById("s30exp");
    if (s30) s30.querySelectorAll("tbody tr").forEach((tr) => {
      const c = tr.querySelector("td.acode"); const a = c ? v96admFind((c.textContent || "").trim()) : null;
      if (!a) return;
      const e = v96admEff(a);
      if (!(a.st === "active" && e.bySrv && e.srv < now)) return;
      const p = [...tr.querySelectorAll(".p.hi")].find((x) => /^(有効|Active)$/.test((x.textContent || "").trim()));
      if (p) { p.className = "p mid"; p.textContent = v96admM("期限切れ", "Expired"); ch++; }
      const last = tr.lastElementChild;
      if (last && !last.querySelector(".v96adm-srvexp")) {
        const s = document.createElement("small"); s.className = "v96adm-srvexp"; s.setAttribute("data-noi18n", "");
        s.textContent = v96admM("同期サーバーの記録で終了（台帳の期限は " + v96admYmd(e.led) + "）", "Ended on the sync server's record (ledger: " + v96admYmd(e.led) + ")"); last.appendChild(s);
        const num = tr.querySelector("td.num");
        if (num) {
          const d0 = new Date(now), d1 = new Date(e.srv), days = Math.round((new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()) - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / 864e5);
          num.innerHTML = `<span class="p no" data-noi18n title="${v96admE(v96admSrvNote(e))}">${v96admE(v96admM(days + "日前に終了", "ended " + days + " day(s) ago"))}</span>`;
        }
        const exp = tr.children[3];
        if (exp && /\d{4}\/\d{1,2}\/\d{1,2}/.test(exp.textContent || "")) exp.innerHTML = `${v96admE(v96admYmd(e.srv))}<br><small class="v96adm-srvexp" data-noi18n>${v96admE(v96admM("同期サーバーの記録", "sync server record"))}</small>`;
      }
    });
    v96admKpiLive();
    if (ch) V96ADM.n.exp += ch;
  } catch (e) { v96admErr("expPatch", e); }
  return ch;
}
/* 数字（概要）の「うち有効 N件」を同じ基準で */
function v96admKpiLive() {
  try {
    const k = document.getElementById("admkpi");
    if (!k) return;
    const t = [...k.querySelectorAll(".kpi")].find((x) => x.getAttribute("data-jump") === "accounts" && /発行済み|Issued/.test(((x.querySelector(".lbl") || {}).textContent) || ""));
    const kd = t && t.querySelector(".kd:not(.v801ld)");
    if (!kd) return;
    const A = v96admAccts(), n = A.filter(v96admIsLive).length;
    const tx = kd.textContent || "";
    let nx = tx.replace(/うち有効 \d+件/, "うち有効 " + n + "件");
    if (nx === tx) nx = tx.replace(/(\d+)(\s*active)/i, n + "$2");
    if (nx !== tx) kd.textContent = nx;
    t.title = v96admM("有効＝無効にしていない、期限が過ぎていないアカウント（期限は、台帳と同期サーバーの記録の早い方で判定）", "Active = not disabled and not expired (the earlier of the ledger's and the sync server's expiry is used)");
  } catch (e) { v96admErr("kpiLive", e); }
}
/* アカウントの状況（刷新版）の件数を、行の状態から数え直す（air_get が後から届いたとき） */
function v96admStatusCard(card) {
  try {
    if (!card) return;
    const rows = [...document.querySelectorAll("#accounts tbody tr[data-st]")];
    if (!rows.length) return;
    const cnt = (f) => rows.filter(f).length;
    const v = [cnt((r) => r.dataset.st === "active"), cnt((r) => r.dataset.st === "expired"), cnt((r) => r.dataset.st === "disabled"), cnt((r) => r.dataset.role === "fwd")];
    const li = [...card.querySelectorAll("ul.k-ck > li")];
    li.forEach((x, i) => { const b = x.querySelector(":scope > b"); if (!b || v[i] == null) return; const sm = b.querySelector("small"); const cur = parseInt((b.firstChild && b.firstChild.nodeValue) || "", 10); if (cur !== v[i] && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.nodeValue = v[i] + " "; else if (!sm && cur !== v[i]) b.textContent = String(v[i]); });
    const ex = rows.filter((r) => r.getAttribute("data-v96exp")).length;
    let n = card.querySelector(".v96adm-expnote");
    if (ex) {
      if (!n) { n = document.createElement("p"); n.className = "v96adm-expnote"; n.setAttribute("data-noi18n", ""); const ul = card.querySelector("ul.k-ck"); if (ul) ul.after(n); else card.appendChild(n); }
      const t = v96admM("期限切れのうち " + ex + "件は、台帳の期限より前に同期サーバーの記録で終わっています（早い方で数えています）。", ex + " of the expired accounts ended earlier on the sync server's record than in the ledger (the earlier date is used).");
      if (n.textContent !== t) n.textContent = t;
    } else if (n) n.remove();
  } catch (e) { v96admErr("statusCard", e); }
}

/* ══════════ No.527 利用内訳：AI への質問の数え方を書く ══════════ */
function v96admUseCard(card) {
  try {
    if (!card) return;
    const trs = [...card.querySelectorAll("table.rd-tbl tbody tr")];
    if (!trs.length) return;
    const num = (tr) => { const b = tr && tr.querySelector("td:last-child b"); return b ? +String(b.textContent || "").replace(/[^\d]/g, "") || 0 : 0; };
    const lab = (tr) => tr && tr.querySelector("td:first-child b");
    const ai = trs.find((t) => /^(AIへの質問|AI への質問（Web 検索なし）|AI questions)/.test(((lab(t) || {}).textContent) || ""));
    const web = trs.find((t) => /^(Web検索|AI への質問（Web 検索つき）|Web search)/.test(((lab(t) || {}).textContent) || ""));
    if (ai) lab(ai).textContent = v96admM("AI への質問（Web 検索なし）", "AI questions (no web search)");
    if (web) lab(web).textContent = v96admM("AI への質問（Web 検索つき）", "AI questions (with web search)");
    const a = num(ai), w = num(web);
    let p = card.querySelector(".v96adm-sum");
    if (!p) { p = document.createElement("p"); p.className = "v96adm-sum"; p.setAttribute("data-noi18n", ""); card.appendChild(p); }
    const h = v96admM(`AI への質問の合計 <b>${v96admF(a + w)}回</b>（Web 検索なし ${v96admF(a)}回＋Web 検索つき ${v96admF(w)}回）。「数字（概要）」の「AI への質問」と同じ数で、内蔵エンジンの答えも含む全アカウントの累計です。真ん中の「合計」は、ログイン・解析・質問の回数と件数をまとめた数です。`,
      `AI questions in total: <b>${v96admF(a + w)}</b> (${v96admF(a)} without web search + ${v96admF(w)} with web search) — the same as “AI questions” in Numbers (overview); all-time total of all accounts, including built-in engine answers. The “total” in the middle adds up logins, analyses and questions.`);
    if (p.innerHTML !== h) p.innerHTML = h;
  } catch (e) { v96admErr("useCard", e); }
}
/* 数字（概要）の AI のタイルに数え方を書く */
function v96admKpiDef() {
  try {
    const t = document.querySelector('#admkpi .kpi[data-jump="admaislot"]');
    if (!t) return;
    const A = v96admAccts(), q = A.reduce((s, a) => s + (+((a.usage || {}).aiQ) || 0), 0), w = A.reduce((s, a) => s + (+((a.usage || {}).webQ) || 0), 0);
    const kd = t.querySelector(".kd:not(.v801ld)");
    if (!kd) return;
    let d = kd.querySelector(".v96adm-def");
    if (!d) { d = document.createElement("span"); d.className = "v96adm-def"; d.setAttribute("data-noi18n", ""); kd.appendChild(d); }
    const tx = v96admM(`＝Web 検索なし ${v96admF(Math.max(0, q - w))}回＋つき ${v96admF(w)}回`, ` = ${v96admF(Math.max(0, q - w))} without + ${v96admF(w)} with web search`);
    if (d.textContent !== tx) d.textContent = tx;
    t.title = v96admM("AI への質問＝全アカウントの質問の累計（期間なし）。Web 検索つきの質問も、内蔵エンジンが答えた質問も含みます。利用内訳では「Web 検索なし」と「Web 検索つき」に分けて出しています。API コスト分析の回数は、外部の AI を呼んだ回数なので一致しません。",
      "AI questions = all-time total of questions of all accounts, including those with web search and those answered by the built-in engine. The usage breakdown splits them into without / with web search. API cost analysis counts external AI calls, so it differs.");
  } catch (e) { v96admErr("kpiDef", e); }
}
/* API コスト分析：今日の回数の見方（この PC の記録とサーバー経由の違いと差） */
function v96admCntHtml() {
  try {
    let evs = [];
    try { if (typeof CDB === "undefined" || !CDB) { if (typeof costLoad === "function") costLoad(); } } catch (e) { /* 無視 */ }
    const dk = (t) => (typeof costDayKey === "function" ? costDayKey(t) : v96admDayKey(t));
    const today = dk(Date.now());
    try { evs = ((typeof CDB !== "undefined" && CDB && CDB.ev) || []).filter((e) => e && dk(e[0]) === today); } catch (e) { evs = []; }
    const n = evs.length, adm = evs.filter((e) => /^admin/.test(String(e[1] || ""))).length, cust = n - adm;
    const R = v96admAir(), sameDay = !!(R && R.today && (R.today.d == null || R.today.d === v96admDayKey(Date.now())));
    const srv = sameDay ? +R.today.all || 0 : null;
    const L = [];
    L.push(v96admM(`<b>API コスト分析の今日 ${v96admF(n)}回</b>＝この PC のブラウザで外部の AI の答えを受け取り、費用を記録した回数です（管理者の操作・画面の訳 ${v96admF(adm)}回＋このブラウザでお客様のアカウントとして使った ${v96admF(cust)}回）。`,
      `<b>API cost analysis, today: ${v96admF(n)}</b> = answers from external AI received in this PC's browser with the cost recorded (${v96admF(adm)} by the admin incl. screen translation + ${v96admF(cust)} used as customer accounts in this browser).`));
    if (srv == null) {
      if (R && R.today && R.today.d) { const x = String(R.today.d).split("-"); L.push(v96admM("サーバー経由の今日の回数：同期サーバーの記録は、まだ前の日（" + (+x[1]) + "/" + (+x[2]) + "）の分です。今日の分が届いたら、ここで比べます。", "Today's count via the server: the sync server's record is still for " + (+x[1]) + "/" + (+x[2]) + "; it is compared here once today's arrives.")); }
      else L.push(v96admM("サーバー経由の今日の回数：読み込み中…（「AI 接続（サーバー経由）」の数）", "Today's count via the server: loading…"));
    } else {
      L.push(v96admM(`<b>サーバー経由の AI の今日 ${v96admF(srv)}回</b>＝全アカウントのお客様の PC が、同期サーバーを通して STANDAGE の AI に頼んだ回数です（AI に頼む前に数えるので、答えが返らなかった分も入ります）。`,
        `<b>AI via the server, today: ${v96admF(srv)}</b> = requests from all customer PCs to STANDAGE AI through the sync server (counted before asking the AI, so requests without an answer are included).`));
      const diff = srv - n, other = Math.max(0, srv - cust);
      L.push(v96admM(`差 <b>${v96admF(Math.abs(diff))}回</b>（${v96admF(srv)}−${v96admF(n)}）は、数える範囲が違うためで、1つの回数ではありません。管理者の ${v96admF(adm)}回はサーバーを通らず（この PC のキーで直接）、ほかの PC の分は API コスト分析に入りません。サーバー経由 ${v96admF(srv)}回のうち、このブラウザに記録が無い <b>${v96admF(other)}回以上</b>（${v96admF(srv)}−${v96admF(cust)}）は、ほかの PC から頼んだ分か、答えが返らなかった分です。`,
        `The difference of <b>${v96admF(Math.abs(diff))}</b> (${v96admF(srv)}−${v96admF(n)}) comes from counting different things; it is not one count. The admin's ${v96admF(adm)} do not go through the server (this PC's own keys), and other PCs are not in the cost analysis. At least <b>${v96admF(other)}</b> (${v96admF(srv)}−${v96admF(cust)}) of the ${v96admF(srv)} server requests were made from other PCs or got no answer.`));
    }
    L.push(v96admM("内蔵エンジンの答え（外部の AI の費用 ¥0）は、どちらの回数にも入りません。「数字（概要）」の「AI への質問」（累計）には入ります。",
      "Answers from the built-in engine (no external AI cost) are in neither count; they are included in “AI questions” (all-time) in Numbers (overview)."));
    return `<p class="lbl">${v96admE(v96admM("今日の AI の回数（2つの数の違い）", "Today's AI counts (why there are two)"))}</p><ul>${L.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  } catch (e) { v96admErr("cntHtml", e); return ""; }
}
function v96admCntPaint() {
  try {
    const b = document.getElementById("v96admCnt");
    if (!b) return;
    const h = v96admCntHtml();
    if (b.innerHTML !== h) b.innerHTML = h;
  } catch (e) { v96admErr("cntPaint", e); }
}

/* ══════════ No.526 Ver1.0 の週次取込 ══════════ */
function v96admV1Info() {
  try {
    const st = (typeof POOLADM !== "undefined" && POOLADM && POOLADM.st) || null;
    const v = st && st.v1;
    if (!v || !(v.v >= 2) || !v.at) return null;
    const now = Date.now();
    let exp;
    if (typeof v90admV1Expect === "function") exp = v90admV1Expect(now);
    else { const d = new Date(now); d.setHours(6, 30, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); if (d.getTime() > now) d.setDate(d.getDate() - 7); exp = d.getTime(); }
    const late = v.at < exp - 3600e3, next = exp + 7 * 864e5;
    const runs = (st.v1runs || []).filter(Boolean);
    const last = runs.length ? runs[runs.length - 1] : null;
    const ownSrv = String(st.v1owner || v.owner || v.by || "").trim();
    const host = String((last && (last.host || last.pc)) || v.host || "").trim();
    return { st, v, late, exp, next, owner: ownSrv, host, token: !!st.v1token, trigger: !!st.trigger };
  } catch (e) { v96admErr("v1info", e); return null; }
}
function v96admV1Html(I) {
  const M = v96admM, E = v96admE;
  const own = I.owner ? E(I.owner) + E(M("（同期サーバーの設定）", " (sync server setting)")) : E(M("STANDAGE の管理者（担当の設定がまだ無いため）", "STANDAGE administrator (no owner is set yet)"));
  const cmd = "python v1_learn.py --push";
  const alt2 = I.token
    ? `<button type="button" class="btn g v96adm-b" data-v96adm="v1run">${E(M("▶ 同期サーバーに今すぐ取り込ませる", "▶ Have the sync server import now"))}</button> ${E(M("（「今すぐ全社データを更新」と同じ。管理者 PC は要りません）", "(same as “Update company-wide data now”; no admin PC needed)"))}`
    : E(M("いまは使えません：同期サーバーが自分で Ver1.0 を読みに行く設定（スクリプト プロパティ DIGITRAD_TOKEN）がありません。設定すると、毎週月曜 6:00 の同期サーバーのジョブで取り込むので、管理者 PC が止まっていても届きます（設定は STANDAGE の管理者がサーバー側で行います）。",
      "Not available now: the sync server has no setting to read Ver1.0 by itself (script property DIGITRAD_TOKEN). With it, the server's Monday 6:00 job imports Ver1.0 even when the admin PC is off (set on the server side by the STANDAGE administrator)."));
  return `<div class="v96adm-v1fix" id="v96admV1" role="note" data-noi18n>
    <b class="v96adm-v1h">${E(M("届いていないときの直し方", "How to fix a missing import"))}</b>
    <dl>
      <dt>${E(M("再実行の方法", "Re-run"))}</dt>
      <dd>${E(M("管理者 PC（タスク スケジューラ「貿易クラウド2.0_全社版AI_Ver1学習」を入れた Windows の PC）で PowerShell を開き、v1_learn.py のあるフォルダで次を実行します（約30分）。", "On the admin PC (the Windows PC with the Task Scheduler job “貿易クラウド2.0_全社版AI_Ver1学習”), open PowerShell in the v1_learn.py folder and run (about 30 min):"))}
        <span class="v96adm-cmd"><code>${E(cmd)}</code><button type="button" class="btn g v96adm-b" data-v96adm="copy" data-v="${E(cmd)}">${E(M("コピー", "Copy"))}</button></span>
        <small>${E(M("Digitrad の認証が切れているときは、先に digitrad-openapi-cli auth --user-email （メールアドレス）で認証し直します。終わると、この欄の「最後に届いた取込」が新しくなります。", "If the Digitrad sign-in has expired, first run digitrad-openapi-cli auth --user-email (your email). When it finishes, “last import” here is updated."))}</small></dd>
      <dt>${E(M("担当", "Owner"))}</dt><dd>${own}${I.host ? E(M("・前回の取込の PC：", " · PC of the last import: ") + I.host) : ""}</dd>
      <dt>${E(M("次の自動実行", "Next automatic run"))}</dt><dd>${E(v96admWd(I.next) + " 6:30" + M("（毎週月曜・管理者 PC が起動しているとき）", " (every Monday, when the admin PC is on)"))}</dd>
      <dt>${E(M("管理者 PC を待たずに", "Without the admin PC"))}</dt>
      <dd><span class="v96adm-alt">① <button type="button" class="btn g v96adm-b" data-v96adm="v1up">${E(M("📥 集計ファイル（v1_learn_last.json）を取り込む", "📥 Import the aggregate file (v1_learn_last.json)"))}</button> ${E(M("v1_learn.py を動かした PC にできるファイルを、どの PC のブラウザからでもここで取り込めます。", "The file made where v1_learn.py ran can be imported here from any PC's browser."))}</span>
        <span class="v96adm-alt">② ${alt2}</span></dd>
    </dl></div>`;
}
function v96admV1Note(I) {
  return v96admM(`最後に届いた取込は ${v96admHm(I.v.at)}（基準日 ${I.v.asof || "-"}）。次の自動実行は ${v96admWd(I.next)} 6:30（毎週月曜・管理者 PC の週次ジョブ）。担当：${I.owner || "STANDAGE の管理者"}。`,
    `Last import ${v96admHm(I.v.at)} (as of ${I.v.asof || "-"}). Next automatic run ${v96admWd(I.next)} 6:30 (every Monday, admin PC weekly job). Owner: ${I.owner || "STANDAGE administrator"}.`);
}
function v96admNoteCard(card) {
  try {
    if (!card) return;
    card.querySelectorAll(".v96adm-row").forEach((x) => x.remove());
    const I = v96admV1Info();
    if (!I || !I.late || !v96admMaster()) return;
    let rows = card.querySelector(".k-rows");
    if (!rows) {
      const em = card.querySelector(".k-empty"); if (em) em.remove();
      rows = document.createElement("div"); rows.className = "k-rows"; card.appendChild(rows);
    }
    const b = document.createElement("button");
    b.type = "button"; b.className = "k-row v96adm-row"; b.setAttribute("data-v96adm", "v1go"); b.setAttribute("data-noi18n", "");
    b.innerHTML = `<span class="k-tag am">${v96admE(v96admM("確認", "Check"))}</span><span class="k-rt"><b>${v96admE(v96admM("Ver1.0 の週次の取込が届いていません（" + v96admWd(I.exp) + "分）", "Ver1.0 weekly import missing (" + v96admWd(I.exp) + ")"))}</b><small>${v96admE(v96admM("知識は " + v96admHm(I.v.at) + " の取込のまま。押すと、再実行の方法・担当・代わりの取り込み方へ移ります。", "Knowledge is still from " + v96admHm(I.v.at) + ". Opens how to re-run, the owner and other ways to import."))}</small></span>${v96admIcon("chevR", 18, 2.4)}`;
    rows.appendChild(b);
  } catch (e) { v96admErr("noteCard", e); }
}

/* ══════════ No.528 商社デスク・CS 横断を開いたら1回取得 ══════════ */
function v96admIbSum() {
  const I = V96ADM.ib;
  if (!I.rows) return null;
  const s = { unans: 0, pend: 0, od: 0, none: 0, err: 0, n: I.N || I.rows.length };
  I.rows.forEach((r) => { s.unans += r.unans ? 1 : 0; s.pend += +r.pend || 0; s.od += +r.od || 0; });
  return s;
}
function v96admIbHead() {
  try {
    const box = document.getElementById("adminbox");
    if (!box) return;
    let p = document.getElementById("v96admIbSum");
    const I = V96ADM.ib;
    let t = "";
    if (I.busy) {
      const P = (typeof V90ADM !== "undefined" && V90ADM && V90ADM.ib) || null;
      t = v96admM("取得中…" + (P ? "（" + Math.min(P.i, P.N) + "／" + P.N + "社）" : ""), "Fetching…" + (P ? " (" + Math.min(P.i, P.N) + "/" + P.N + ")" : ""));
    } else if (I.sum) {
      const s = I.sum;
      t = v96admM(`未返信 ${s.unans}社・承認待ち ${s.pend}件・期限切れのタスク ${s.od}件（荷主 ${s.n}社・${v96admHm(I.at)} 取得）`, `Unanswered ${s.unans} · awaiting approval ${s.pend} · overdue tasks ${s.od} (${s.n} shippers · fetched ${v96admHm(I.at)})`);
    } else if (I.err) t = v96admM("取得できませんでした（" + I.err + "）。「最新の状態を取得」でもう一度試せます。", "Could not fetch (" + I.err + "). Try “Get the latest status” again.");
    if (!t) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement("p"); p.id = "v96admIbSum"; p.className = "v96adm-ibsum"; p.setAttribute("role", "status"); p.setAttribute("data-noi18n", ""); const rw = box.querySelector(".rw"); if (rw) rw.after(p); else box.prepend(p); }
    p.classList.toggle("busy", !!I.busy); p.classList.toggle("hot", !!(I.sum && (I.sum.unans || I.sum.pend || I.sum.od)));
    if (p.textContent !== t) p.textContent = t;
  } catch (e) { v96admErr("ibHead", e); }
}
function v96admDeskHead() {
  try {
    const box = document.getElementById("v75adm");
    if (!box || typeof V75TC === "undefined" || !V75TC || !V75TC.adm) return;
    const A = V75TC.adm;
    let p = document.getElementById("v96admDeskSum"), t = "";
    if (A.busy) t = v96admM("取得中…", "Fetching…");
    else if (A.at && !A.err) { const L = A.list || []; const op = L.filter((x) => x && x.st === "open").length; t = v96admM(`担当待ち ${op}件・全部で ${L.length}件（${v96admHm(A.at)} 取得）`, `Awaiting an owner ${op} · ${L.length} in total (fetched ${v96admHm(A.at)})`); }
    if (!t) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement("p"); p.id = "v96admDeskSum"; p.className = "v96adm-ibsum"; p.setAttribute("role", "status"); p.setAttribute("data-noi18n", ""); const rw = box.querySelector(".rw"); if (rw) rw.after(p); else box.prepend(p); }
    p.classList.toggle("busy", !!A.busy); p.classList.toggle("hot", !A.busy && (A.list || []).some((x) => x && x.st === "open"));
    if (p.textContent !== t) p.textContent = t;
  } catch (e) { v96admErr("deskHead", e); }
}
/* 描き直しで消えた CS 横断の結果を戻す（承認者の保存のボタンもつなぎ直す） */
function v96admIbRestore() {
  try {
    const I = V96ADM.ib, out = document.getElementById("adminboxOut");
    if (!out || I.busy || !I.html || out.querySelector("table")) return;
    if ((I.ses || null) !== v96admSes()) return;
    out.innerHTML = I.html;
    out.querySelectorAll("[data-aprvs]").forEach((b) => b.addEventListener("click", async () => {
      const code = b.getAttribute("data-aprvs"), a = v96admFind(code), inp = [...out.querySelectorAll("[data-aprv]")].find((x) => x.getAttribute("data-aprv") === code);
      if (!a || !inp) return;
      a.approver = String(inp.value || "").trim();
      try { if (typeof asave === "function") asave(); } catch (e) { /* 無視 */ }
      let ok = false;
      try { const r = typeof syncAdminPush === "function" ? await syncAdminPush() : null; ok = !!(r && r.ok); } catch (e) { ok = false; }
      try { if (typeof toast === "function") toast(ok ? "承認者を保存しました（台帳をサーバーへ送信）" : "保存しましたがサーバーへ送れませんでした"); } catch (e) { /* 無視 */ }
    }));
  } catch (e) { v96admErr("ibRestore", e); }
}
function v96admSes() { try { return (typeof SES !== "undefined" && SES && (SES.at || SES.apw)) || null; } catch (e) { return null; } }
async function v96admAutoRun() {
  const A = V96ADM.auto;
  V96ADM.n.auto++;
  try {
    if (typeof v75tcAdmLoad === "function" && document.getElementById("v75admGo") && typeof V75TC !== "undefined" && V75TC && V75TC.adm && !V75TC.adm.busy && !V75TC.adm.at) {
      const p = v75tcAdmLoad();
      try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
      v96admDeskHead();
      await p;
    }
  } catch (e) { v96admErr("autoDesk", e); }
  v96admDeskHead();
  try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
  try {
    const go = document.getElementById("adminboxGo");
    if (typeof admInboxLoad === "function" && go && !go.disabled && !V96ADM.ib.busy && !V96ADM.ib.sum) await admInboxLoad();
  } catch (e) { v96admErr("autoIb", e); V96ADM.ib.err = String((e && e.message) || e).slice(0, 60); }
  A.done = Date.now();
  v96admIbHead();
  try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
  v96admRebuild("auto");
}
function v96admAutoTick() {
  try {
    if (!v96admMaster() || !v96admSyncOn()) return;
    const A = V96ADM.auto, ses = v96admSes();
    if (A.ses !== ses) { A.ses = ses; A.started = 0; A.t0 = Date.now(); A.done = 0; V96ADM.ib = { busy: 0, rows: null, html: "", at: 0, sum: null, N: 0 }; }
    if (A.started) return;
    if (v96admSt() === "wait" && Date.now() - A.t0 < 30000) return;   // 台帳の同期を先に（数が出てから）
    if (!document.getElementById("v75admGo") && !document.getElementById("adminboxGo")) return;
    A.started = Date.now();
    v96admAutoRun();
  } catch (e) { v96admErr("autoTick", e); }
}

/* ══════════ No.529 パスワード・メールがまだの人の一覧 ══════════ */
function v96admPwRows() {
  const out = [];
  try {
    const D = (typeof V65A !== "undefined" && V65A && V65A.adm) || null;
    if (!D || !D.pw) return out;
    const has = D.pw.has || {};
    (D.accounts || []).forEach((x) => {
      if (!x || x.otpEx === 1 || x.st !== "active") return;
      const H = new Set(has[x.kid] || []);
      const la = v96admFind(x.code);
      const rep = String(x.who || "").replace(/様$/, "").trim();
      const mems = (la && Array.isArray(la.members) ? la.members : x.members) || [];
      if (rep && rep !== "—" && rep !== "-" && !mems.some((m) => m && m.name === rep && m.del !== 1)) {
        if (!H.has("@rep")) {
          const wm = String(((typeof V61 !== "undefined" && V61 && V61.wm && V61.wm[x.code] != null) ? V61.wm[x.code] : x.wm) || "").trim();
          out.push({ code: x.code, co: x.co || (la && la.co) || "", name: rep, target: "@rep", rep: 1, mail: wm, inv: 0 });
        }
      }
      mems.forEach((m) => {
        if (!m || !m.name || m.del === 1 || m.del === true || m.st === "disabled") return;
        if (H.has(m.name)) return;
        out.push({ code: x.code, co: x.co || (la && la.co) || "", name: m.name, target: m.name, rep: 0, mail: String(m.mail || "").trim(), inv: m.st === "invited" ? 1 : 0 });
      });
    });
  } catch (e) { v96admErr("pwRows", e); }
  return out;
}
function v96admPwUntil() { try { const D = V65A.adm; return +(D && D.pw && D.pw.until) || 0; } catch (e) { return 0; } }
function v96admLoginUrl() { try { if (typeof tmUrl === "function") { const u = tmUrl(); if (u) return u; } } catch (e) { /* 無視 */ } return location.origin + location.pathname; }
function v96admGuide(r) {
  const u = v96admPwUntil(), until = u ? v96admMd(u) : "";
  return `${r.co} ${r.name} 様\n\n「貿易クラウドAI商社マン」のログインは、メールアドレスとパスワードに切り替わります。次の手順でパスワードを作ってください${until ? "（" + until + " まで）" : ""}。\n\n1. ログインページを開く：${v96admLoginUrl()}\n2. 「お客様ログイン」の「初めての方・パスワードを忘れた方」を押す\n3. メールアドレス（${r.mail}）を入れて、確認コードを送る\n4. メールで届いた確認コード（6桁）と、新しいパスワードを入れる\n\n次からは、メールアドレスとパスワードでログインします。${until ? "\n" + until + " を過ぎると、アクセスコードと氏名ではログインできなくなります。" : ""}`;
}
function v96admPwHtml() {
  const L = v96admPwRows();
  if (!L.length) return "";
  const M = v96admM, E = v96admE, u = v96admPwUntil(), ud = u ? v96admMd(u) : "";
  const subj = M("【貿易クラウドAI商社マン】パスワードの作成のお願い", "[Trade Cloud AI] Please create your password");
  const row = (r) => {
    const ky = E(r.code + "|" + r.target);
    const mailto = r.mail ? `mailto:${encodeURIComponent(r.mail)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(v96admGuide(r))}` : "";
    const acts = (!r.mail ? `<button type="button" class="btn v96adm-b" data-v96adm="pwmail" data-k="${ky}">${E(M("メールを登録", "Register email"))}</button>`
      : `<button type="button" class="btn g v96adm-b" data-v96adm="pwcopy" data-k="${ky}">${E(M("案内文をコピー", "Copy guide"))}</button><a class="btn g v96adm-b" href="${E(mailto)}">${E(M("✉ メールソフトで送る", "✉ Send by email app"))}</a><button type="button" class="btn g v96adm-b" data-v96adm="pwmail" data-k="${ky}">${E(M("メールを変更", "Change email"))}</button>`)
      + (!r.rep ? `<button type="button" class="btn g v96adm-b" data-v96adm="pwinv" data-k="${ky}">${E(M("招待状", "Invitation"))}</button>` : "");
    return `<tr><td><span class="acode">${E(r.code)}</span><br><small>${E(String(r.co).slice(0, 22))}</small></td><td><b>${E(r.name)}</b><br><small>${E(r.rep ? M("代表", "Representative") : M("メンバー", "Member"))}${r.inv ? E(M("・招待中（まだ参加していない）", " · invited (not joined)")) : ""}${r.mail ? "・" + E(r.mail) : ""}</small></td><td><div class="v96adm-acts">${acts}</div></td></tr>`;
  };
  const grp = (list, head, next) => list.length ? `<div class="v96adm-pwg"><p class="v96adm-pwh"><span class="p ${list[0].mail ? "mid" : "no"}">${E(head)}</span> <b>${list.length}${E(M("名", ""))}</b></p><p class="v96adm-note">${E(next)}</p>
    <div class="tw v96adm-tw"><table><thead><tr><th>${E(M("アカウント", "Account"))}</th><th>${E(M("名前", "Name"))}</th><th>${E(M("操作", "Actions"))}</th></tr></thead><tbody>${list.map(row).join("")}</tbody></table></div></div>` : "";
  const noMail = L.filter((r) => !r.mail), noPw = L.filter((r) => r.mail);
  return `<details class="v96adm-pwl" id="v96admPwl" data-noi18n><summary>${E(M(`まだの ${L.length}名と、次にやること（うちメール未登録 ${noMail.length}名）`, `${L.length} people not done yet and what to do next (${noMail.length} without email)`))}</summary>
    ${grp(noMail, M("メールアドレスが未登録", "No email registered"), M(`次にやること：ご本人にメールアドレスを聞いて、「メールを登録」で登録します。登録したら、ご本人がログイン画面の「初めての方・パスワードを忘れた方」でパスワードを作ります${ud ? "（" + ud + " を過ぎると、アクセスコードと氏名ではログインできなくなります）" : ""}。`, `Next: ask for their email and register it with “Register email”; then they create a password via “First time / forgot password” on the sign-in screen${ud ? " (after " + ud + ", access code + name sign-in stops)" : ""}.`))}
    ${grp(noPw, M("パスワード未作成（メールは登録済み）", "No password yet (email registered)"), M("次にやること：「案内文をコピー」か「メールソフトで送る」で、作り方をご本人に送ります。ご本人は、ログイン画面の「初めての方・パスワードを忘れた方」で、登録したメールに届く確認コードからパスワードを作ります。", "Next: send them the steps (“Copy guide” or “Send by email app”); they create a password via “First time / forgot password” with a code sent to the registered email."))}
    <p class="v96adm-note">${E(M(`ご本人の画面：メールが未登録のままログインすると、画面の下に「メールアドレスを登録して、パスワードを作る」の案内が出ます${ud ? "（" + ud + " まで）" : ""}。メールが登録済みの方は、ログイン画面の「初めての方・パスワードを忘れた方」から作ります。`, `On their screen: signing in without an email shows “Register your email and create a password”${ud ? " (until " + ud + ")" : ""}. People with an email use “First time / forgot password” on the sign-in screen.`))}</p></details>`;
}
function v96admPwPaint() {
  try {
    if (!v96admIs()) return;
    const c = document.getElementById("v65a-admcard");
    if (!c) return;
    const h = v96admPwHtml();
    let d = document.getElementById("v96admPwl");
    if (!h) { if (d) d.remove(); return; }
    if (d && d.__h === h) return;
    const open = d ? d.open : null;
    const tmp = document.createElement("div"); tmp.innerHTML = h;
    const nd = tmp.firstElementChild; nd.__h = h;
    if (open != null) nd.open = open;
    if (d) d.replaceWith(nd); else c.appendChild(nd);
    V96ADM.n.pw++;
    // メンバー管理の「メール未登録」の行から、この一覧へ
    const cnt = document.querySelector("#admmem .v61cnt");
    if (cnt && !cnt.querySelector("[data-v96adm='pwgo']")) { const b = document.createElement("button"); b.type = "button"; b.className = "btn g v96adm-b"; b.setAttribute("data-v96adm", "pwgo"); b.setAttribute("data-noi18n", ""); b.textContent = v96admM("まだの人と次にやること →", "Who is not done and what to do →"); cnt.appendChild(b); }
  } catch (e) { v96admErr("pwPaint", e); }
}

/* ══════════ 7.3 AI 接続：利用量 % はトークン基準・分母／今月の累計 ══════════ */
function v96admTokMonth(R) {
  const now = new Date(), m0 = v96admDayKey(new Date(now.getFullYear(), now.getMonth(), 1).getTime()), td = v96admDayKey(Date.now());
  const hist = (R.hist || []).filter((h) => h && h.d);
  const inM = hist.filter((h) => h.d >= m0 && h.d < td);
  const T = R.today || {};
  const all = inM.reduce((s, h) => s + (+h.all || 0), 0) + (+T.all || 0);
  const tokOk = inM.every((h) => h.tin != null || h.tout != null);
  const tin = inM.reduce((s, h) => s + (+h.tin || 0), 0) + (+T.tin || 0), tout = inM.reduce((s, h) => s + (+h.tout || 0), 0) + (+T.tout || 0);
  const first = hist.length ? hist.map((h) => h.d).sort()[0] : "";
  return { m0, td, all, days: inM.length, tokOk, tin, tout, first, partial: !!(first && first > m0) };
}
function v96admTokHtml(R) {
  const M = v96admM, E = v96admE, F = v96admF;
  const A = (R.accts || []).filter((a) => a && a.kid);
  const withTok = A.filter((a) => +a.tokCap > 0);
  const ex = withTok.find((a) => +a.tokUsed > 0) || null;
  const exTxt = ex ? `${F(ex.tokUsed)} ÷ ${F(ex.tokCap)}＝${(Math.round(+ex.tokUsed / +ex.tokCap * 1000) / 10).toFixed(1)}%（${ex.code}）` : M("例：2,381,725 ÷ 4,000,000＝59.5%", "e.g. 2,381,725 ÷ 4,000,000 = 59.5%");
  const L = [];
  L.push(M(`<b>利用量（%）の見方</b>：お客様の画面の「利用量 ○%」は、回数ではなく<b>トークン</b>（AI に送った文字と答えの量）で数えます。<b>そのアカウントの今日のトークン ÷ 1日のトークンの上限</b>（${E(exTxt)}）。上限の既定は、普通のアカウント 4,000,000・デモ用 1,000,000 トークン（同期サーバーの決まり）で、毎日 0時（日本時間）にもどります。下の表の「今日／上限」は回数で、利用量 % とは別の数です。`,
    `<b>How “usage %” is counted</b>: the “usage ○%” on customers' screens is based on <b>tokens</b> (text sent to and returned by the AI), not on the number of requests: <b>the account's tokens today ÷ the daily token limit</b> (${E(exTxt)}). Default limits: 4,000,000 tokens for normal accounts and 1,000,000 for demo accounts (sync server rule), reset at midnight JST. “Today / limit” in the table below is a request count, separate from usage %.`));
  if (!withTok.length) L.push(M("アカウントごとのトークン（利用量 %）は、同期サーバーがこの一覧に入れていないため、ここには出せません（同期サーバーが accts に tokUsed・tokCap を入れれば、表の「今日／上限」の下に出します）。お客様の画面では、そのアカウントの数で出しています。",
    "Per-account tokens (usage %) are not in this list from the sync server, so they cannot be shown here (shown under “Today / limit” once the server adds tokUsed/tokCap to accts). Customers' screens use their own account's numbers."));
  const Mo = v96admTokMonth(R);
  const md = (k) => { const x = String(k || "").split("-"); return x.length === 3 ? (+x[1]) + "/" + (+x[2]) : k; };
  const per = M(`今月（${md(Mo.m0)}〜今日）`, `This month (${md(Mo.m0)}–today)`);
  const basis = M(`同期サーバーの日ごとの記録 ${Mo.days}日分＋今日${Mo.partial ? "。" + md(Mo.first) + " より前の日の記録はサーバーに残っていません" : ""}`, `${Mo.days} daily records on the sync server + today${Mo.partial ? "; days before " + md(Mo.first) + " are not kept on the server" : ""}`);
  if (Mo.tokOk) L.push(M(`<b>${E(per)}の累計</b>：AI への依頼 ${F(Mo.all)}回・トークン 入力 ${F(Mo.tin)}・出力 ${F(Mo.tout)}（計 ${F(Mo.tin + Mo.tout)}）（${E(basis)}）。`, `<b>${E(per)} total</b>: ${F(Mo.all)} requests · tokens in ${F(Mo.tin)} · out ${F(Mo.tout)} (total ${F(Mo.tin + Mo.tout)}) (${E(basis)}).`));
  else L.push(M(`<b>${E(per)}の累計</b>：AI への依頼 ${F(Mo.all)}回（${E(basis)}）。トークンの月の累計は、同期サーバーが日ごとのトークン（hist の tin・tout）を返していないため出せません（今日の分だけ：入力 ${F((R.today || {}).tin)}・出力 ${F((R.today || {}).tout)}）。返すようになれば、ここに出します。`,
    `<b>${E(per)} total</b>: ${F(Mo.all)} requests (${E(basis)}). The monthly token total cannot be shown because the sync server does not return daily tokens (tin/tout in hist) — today only: in ${F((R.today || {}).tin)} · out ${F((R.today || {}).tout)}. It will be shown here once returned.`));
  return `<div class="v96adm-tok" id="v96admTok" data-noi18n>${L.map((x) => `<p>${x}</p>`).join("")}</div>`;
}
function v96admExpMismHtml(R) {
  try {
    const M = v96admM, E = v96admE;
    const L = v96admAccts().map((a) => ({ a, e: v96admEff(a) })).filter((x) => x.a.st === "active" && x.e.mism);
    if (!L.length) return "";
    return `<p class="v96adm-expnote" id="v96admExpMism" data-noi18n>${E(M("期限が台帳と同期サーバーの記録で食い違うアカウント：", "Accounts whose expiry differs between the ledger and the sync server: "))}${L.map((x) => `<b>${E(x.a.code)}</b>${E(M("（台帳 ", " (ledger ") + v96admYmd(x.e.led) + M("・サーバー ", " · server ") + v96admYmd(x.e.srv) + M("）", ")"))}`).join(E(M("、", "; ")))}${E(M("。アカウント一覧では、早い方の期限で「期限切れ」と出しています。台帳の期限が正しい（延長した）ときは、「同期・端末を確かめる」の「台帳をサーバーへ送る」でそろえます。", ". The account list uses the earlier date. If the ledger date is right (extended), align them with “Send the ledger to the server” in Sync & devices."))}</p>`;
  } catch (e) { v96admErr("mism", e); return ""; }
}

/* ══════════ 包む ══════════ */
if (typeof renderAdmin === "function") {
  const __ra96adm = renderAdmin;
  renderAdmin = function () {
    if (!V96ADM.waitT0 && v96admIs()) V96ADM.waitT0 = Date.now();
    const r = __ra96adm.apply(this, arguments);
    try {
      if (v96admIs()) {
        v96admExpPatch(); v96admKpiDef(); v96admAccNote(); v96admIbRestore(); v96admIbHead(); v96admDeskHead();
        setTimeout(() => { try { v96admExpPatch(); v96admPwPaint(); v96admRdDeco(); } catch (e) { v96admErr("ra96:t", e); } }, 300);
      }
    } catch (e) { v96admErr("renderAdmin", e); }
    return r;
  };
}
/* 刷新版の上の段 */
(function () {
  try {
    const RD = v96admRD();
    if (!RD || !RD.page) return;
    const p0 = RD.page.adm;
    if (typeof p0 !== "function") return;
    RD.page.adm = function (w) { const r = p0.apply(this, arguments); try { v96admRdDeco(w); } catch (e) { v96admErr("page.adm", e); } return r; };
  } catch (e) { v96admErr("rdwrap", e); }
})();
/* 今日の作業の件数（同期中は出さない・期限は早い方・取得中・CS 横断） */
if (typeof v84AdmTodayHtml === "function") {
  const __td96adm = v84AdmTodayHtml;
  v84AdmTodayHtml = function () {
    let h = __td96adm.apply(this, arguments);
    try {
      if (!v96admIs()) return h;
      const st = v96admSt();
      const A = v96admAccts(), now = Date.now(), D7 = 7 * 864e5;
      const live = A.filter((a) => a.st === "active");
      const soon = live.filter((a) => { const e = v96admEff(a); return e.exp >= now && e.exp - now <= D7; }).length;
      const over = live.filter((a) => { const e = v96admEff(a); return !!e.exp && e.exp < now; }).length;
      const put = (re, v) => { h = h.replace(re, (m0, a) => a + v + "</b>"); };
      put(/(期限が7日以内（件）<\/span> <b class="n" data-v84n="exp">)\d+<\/b>/, st === "wait" ? "…" : String(soon));
      put(/(期限切れ・台帳では有効のまま（件）<\/span> <b class="n" data-v84n="exp">)\d+<\/b>/, st === "wait" ? "…" : String(over));
      if (st === "wait") h = h.replace('<b class="v84td-h">今日の作業</b>', '<b class="v84td-h">今日の作業</b><span class="v96adm-tdw">' + v96admE(v96admM("同期中…（件数は同期のあと）", "Syncing… (counts after sync)")) + "</span>");
      const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || null;
      if (D && D.busy) h = h.replace(/<b>—<\/b> <span>（一覧を取得）<\/span>/, "<b>…</b> <span>" + v96admE(v96admM("（取得中…）", "(fetching…)")) + "</span>");
      if (v96admMaster() && document.getElementById("adminbox")) {
        const I = V96ADM.ib;
        if (I.busy) { const P = (typeof V90ADM !== "undefined" && V90ADM && V90ADM.ib) || null; h += `<button type="button" class="v84td-c" data-act="sub.admGo" data-arg="inbox"><span>${v96admE(v96admM("CS横断・未返信（件）", "CS inbox · unanswered"))}</span> <b>…</b> <span>${v96admE(v96admM("（取得中…" + (P ? Math.min(P.i, P.N) + "／" + P.N + "社" : "") + "）", "(fetching…)"))}</span></button>`; }
        else if (I.sum) h += `<button type="button" class="v84td-c" data-act="sub.admGo" data-arg="inbox" title="${v96admE(v96admM("承認待ち " + I.sum.pend + "件・期限切れのタスク " + I.sum.od + "件", "Awaiting approval " + I.sum.pend + " · overdue tasks " + I.sum.od))}"><span>${v96admE(v96admM("CS横断・未返信（件）", "CS inbox · unanswered"))}</span> <b class="n">${I.sum.unans}</b></button>`;
        else if (!V96ADM.ib.err) h += `<button type="button" class="v84td-c" data-act="sub.admGo" data-arg="inbox"><span>${v96admE(v96admM("CS横断・未返信（件）", "CS inbox · unanswered"))}</span> <b>—</b> <span>${v96admE(V96ADM.auto.started ? v96admM("（取得の順番待ち…）", "(waiting to fetch…)") : v96admM("（同期のあと自動で取得）", "(fetched after sync)"))}</span></button>`;
      }
    } catch (e) { v96admErr("today", e); }
    return h;
  };
}
/* 21.80.1 がタイルの数を入れ直したあと */
if (typeof v801fKpiFill === "function") {
  const __kf96adm = v801fKpiFill;
  v801fKpiFill = function () { const r = __kf96adm.apply(this, arguments); try { v96admKpiLive(); v96admKpiDef(); } catch (e) { v96admErr("kpiFill", e); } return r; };
}
/* CS 横断：行を控えて件数を出す・結果を控える */
if (typeof admInboxAgg === "function") {
  const __ag96adm = admInboxAgg;
  admInboxAgg = function (r) { const x = __ag96adm.apply(this, arguments); try { if (V96ADM.ib.busy && V96ADM.ib.rows) V96ADM.ib.rows.push(r); } catch (e) { v96admErr("agg", e); } return x; };
}
if (typeof admInboxLoad === "function") {
  const __ib96adm = admInboxLoad;
  admInboxLoad = async function () {
    const I = V96ADM.ib;
    I.busy = 1; I.rows = []; I.err = ""; I.N = v96admAccts().filter((a) => a.role !== "fwd").length;
    const tk = setInterval(() => { try { v96admIbHead(); } catch (e) { /* 無視 */ } }, 700);
    const unguard = v96admGuard("adminboxOut");
    v96admIbHead();
    try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
    try {
      const r = await __ib96adm.apply(this, arguments);
      try { const out = document.getElementById("adminboxOut"); if (out && out.querySelector("table")) { I.html = out.innerHTML; I.at = Date.now(); I.ses = v96admSes(); I.sum = v96admIbSum(); V96ADM.n.ib++; } } catch (e) { v96admErr("ibKeep", e); }
      return r;
    } catch (e) { I.err = String((e && e.message) || e).slice(0, 60); throw e; } finally {
      clearInterval(tk); unguard(); I.busy = 0; v96admIbHead();
      try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
    }
  };
}
if (typeof v75tcAdmLoad === "function") {
  const __tc96adm = v75tcAdmLoad;
  v75tcAdmLoad = async function () {
    setTimeout(v96admDeskHead, 0);
    const unguard = v96admGuard("v75admOut");
    try { return await __tc96adm.apply(this, arguments); } finally { unguard(); try { v96admDeskHead(); if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ } }
  };
}
/* 利用状況の CSV（アカウント一覧の書き出しも同じ）：状態の列を画面と同じ基準に（台帳の値・データの削除の判定は変えない） */
if (typeof v33Csv === "function") {
  const __csv96adm = v33Csv;
  v33Csv = function (rows, name) {
    try {
      if (/^admin_usage_/.test(String(name || "")) && Array.isArray(rows)) {
        const now = Date.now();
        rows = rows.map((r, i) => {
          if (!i || !Array.isArray(r) || r[2] !== "有効") return r;
          const a = v96admFind(r[0]); const e = a ? v96admEff(a) : null;
          if (!a || a.st !== "active" || !e || !e.bySrv || !(e.srv < now)) return r;
          const x = r.slice(); x[2] = "期限切れ（同期サーバーの記録で " + v96admYmd(e.srv) + " に終了・台帳の期限 " + (e.led ? v96admYmd(e.led) : "なし") + "）"; return x;
        });
      }
    } catch (e) { v96admErr("csv", e); }
    return __csv96adm.call(this, rows, name);
  };
}
/* Ver1.0 の欄 */
if (typeof v1AdmHtml === "function") {
  const __v1a96adm = v1AdmHtml;
  v1AdmHtml = function () {
    let h = __v1a96adm.apply(this, arguments);
    try {
      if (v96admLang() === "ja") h = String(h).replace("（約10〜15分）", "（約30分）");
      const I = v96admV1Info();
      if (!I) return h;
      V96ADM.n.v1++;
      const add = I.late ? v96admV1Html(I) : `<p class="v96adm-note" id="v96admV1" data-noi18n>${v96admE(v96admV1Note(I))}</p>`;
      if (I.late) h = h.replace(/<span class="p hi" style="flex:none">稼働中<\/span>/, `<span class="p mid" style="flex:none" data-noi18n>${v96admE(v96admM("⚠ " + v96admWd(I.exp) + "分が未達", "⚠ " + v96admWd(I.exp) + " missing"))}</span>`);
      if (/id="v90v1why"[\s\S]*?<\/p>/.test(h)) h = h.replace(/(<p class="v90v1why[^"]*" id="v90v1why"[^>]*>[\s\S]*?<\/p>)/, "$1" + add);
      else h = h.replace(/(<div class="rw" style="gap:14px;flex-wrap:wrap;margin-top:8px;font-size:11\.5px">)/, add + "$1");
    } catch (e) { v96admErr("v1html", e); }
    return h;
  };
}
/* API コスト分析 */
if (typeof costCardHtml === "function") {
  const __cc96adm = costCardHtml;
  costCardHtml = function () {
    let h = __cc96adm.apply(this, arguments);
    try {
      if (typeof h !== "string" || !v96admIs()) return h;
      const box = `<div class="v96adm-cnt" id="v96admCnt" data-noi18n>${v96admCntHtml()}</div>`;
      const k = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))';
      const i = h.indexOf(k);
      h = i > 0 ? h.slice(0, i) + box + h.slice(i) : h.replace(/<\/div>\s*$/, box + "</div>");
      V96ADM.n.cnt++;
    } catch (e) { v96admErr("cost", e); }
    return h;
  };
}
/* AI 接続（サーバー経由） */
if (typeof v63aCardHtml === "function") {
  const __ah96adm = v63aCardHtml;
  v63aCardHtml = function () {
    let h = __ah96adm.apply(this, arguments);
    try {
      const R = v96admAir();
      if (typeof h !== "string" || !R) return h;
      const F = v96admF;
      h = h.replace(/今日：(\d+) 回（入力 (\d+)・出力 (\d+) トークン）/, (m0, a, i, o) => v96admE(v96admM(`今日：${F(a)} 回（トークン 入力 ${F(i)}・出力 ${F(o)}・計 ${F(+i + +o)}）`, `Today: ${F(a)} requests (tokens in ${F(i)} · out ${F(o)} · total ${F(+i + +o)})`)));
      (R.accts || []).forEach((a) => {
        if (!a || !a.kid || !(+a.tokCap > 0)) return;
        const pct = (Math.round((+a.tokUsed || 0) / +a.tokCap * 1000) / 10).toFixed(1);
        const s = `<br><small class="v96adm-tokrow" data-noi18n>${v96admE(v96admM(`利用量 ${pct}%（${F(a.tokUsed)} ÷ ${F(a.tokCap)} トークン）`, `usage ${pct}% (${F(a.tokUsed)} ÷ ${F(a.tokCap)} tokens)`))}</small>`;
        const kid = String(a.kid).replace(/[^0-9a-zA-Z]/g, "");
        h = h.replace(new RegExp(`(<tr data-v63a="${kid}">[\\s\\S]*?<td style="white-space:nowrap">[\\s\\S]*?)(</td>)`), (m0, x, y) => x + s + y);
      });
      const note = v96admTokHtml(R) + v96admExpMismHtml(R);
      const k = '<div class="tw" style="max-height:none;margin-top:8px">';
      const i = h.lastIndexOf(k);
      h = i > 0 ? h.slice(0, i) + note + h.slice(i) : h.replace(/<\/div>\s*$/, note + "</div>");
      V96ADM.n.tok++;
    } catch (e) { v96admErr("v63a", e); }
    return h;
  };
}
/* air_get が届いたら（期限・今日の回数） */
if (typeof syncCall === "function") {
  const __sc96adm = syncCall;
  syncCall = function (op) {
    const p = __sc96adm.apply(this, arguments);
    try {
      if (op === "air_get" && p && typeof p.then === "function") p.then(() => { setTimeout(() => { try { if (!v96admIs()) return; const n = v96admExpPatch(); v96admCntPaint(); v96admRdDeco(); if (n) { try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ } } } catch (e) { v96admErr("air", e); } }, 60); }, () => { });
    } catch (e) { v96admErr("sc", e); }
    return p;
  };
}
/* パスワードの欄 */
if (typeof v65authAdmCard === "function") {
  const __pc96adm = v65authAdmCard;
  v65authAdmCard = function () { const r = __pc96adm.apply(this, arguments); try { v96admPwPaint(); } catch (e) { v96admErr("pwcard", e); } return r; };
}
if (typeof tmAdmBind === "function") {
  const __tb96adm = tmAdmBind;
  tmAdmBind = function () { const r = __tb96adm.apply(this, arguments); try { setTimeout(v96admPwPaint, 0); } catch (e) { v96admErr("tmbind", e); } return r; };
}

/* ══════════ ボタン（委譲） ══════════ */
document.addEventListener("click", (ev) => {
  try {
    const b = ev.target && ev.target.closest && ev.target.closest("[data-v96adm]");
    if (!b) return;
    const k = b.getAttribute("data-v96adm");
    if (k === "copy") { ev.preventDefault(); try { if (typeof copyTxt === "function") copyTxt(b.getAttribute("data-v") || ""); } catch (e) { v96admErr("copy", e); } return; }
    if (k === "v1go") {
      ev.preventDefault();
      try {
        if (typeof v84AdmGo === "function") v84AdmGo("v1");
        setTimeout(() => { try { const el = document.getElementById("v96admV1") || document.getElementById("admpoolv1"); if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("v96adm-flash"); setTimeout(() => el.classList.remove("v96adm-flash"), 2400); } } catch (e) { /* 無視 */ } }, 350);
      } catch (e) { v96admErr("v1go", e); }
      return;
    }
    if (k === "v1up") { ev.preventDefault(); const f = document.getElementById("poolv1"); if (f) f.click(); else { try { if (typeof toast === "function") toast(v96admM("「AI商社マンのモード」の欄が見つかりませんでした。AI のタブを開いてから、もう一度押してください。", "Open the AI tab and try again.")); } catch (e) { /* 無視 */ } } return; }
    if (k === "v1run") { ev.preventDefault(); const r = document.getElementById("poolrun"); if (r && !r.disabled) { r.click(); try { r.scrollIntoView({ block: "center" }); } catch (e) { /* 無視 */ } } return; }
    if (k === "pwgo") { ev.preventDefault(); const d = document.getElementById("v96admPwl"); if (d) { d.open = true; d.scrollIntoView({ block: "start" }); } return; }
    if (k === "pwmail" || k === "pwcopy" || k === "pwinv") {
      ev.preventDefault();
      const ky = b.getAttribute("data-k") || "";
      const r = v96admPwRows().find((x) => x.code + "|" + x.target === ky);
      if (!r) return;
      if (k === "pwcopy") { try { if (typeof copyTxt === "function") copyTxt(v96admGuide(r)); } catch (e) { v96admErr("pwcopy", e); } return; }
      if (k === "pwmail") { try { if (typeof v61AdmSetMail === "function") v61AdmSetMail(r.code, r.target, r.name, r.mail || ""); } catch (e) { v96admErr("pwmail", e); } return; }
      if (k === "pwinv") {
        try {
          const a = v96admFind(r.code), m = a && (a.members || []).find((x) => x && x.name === r.name);
          if (!a || !m || typeof tmInvitePanel !== "function" || typeof openDW !== "function") return;
          openDW(`<div class="tm-form"><h3>✉ ${v96admE(v96admM("招待状", "Invitation"))}</h3>${tmInvitePanel(a, m)}<div class="rw v96adm-dwrow"><button class="btn g" type="button" data-onclick="closeDW()">${v96admE(v96admM("閉じる", "Close"))}</button></div></div>`);
          if (typeof dwChrome === "function") dwChrome();
          if (typeof tmBindInvitePanel === "function") tmBindInvitePanel(a, m);
        } catch (e) { v96admErr("pwinv", e); }
      }
    }
  } catch (e) { v96admErr("click", e); }
}, true);

/* ══════════ 見張り（1秒ごと・管理コンソールのときだけ） ══════════ */
setInterval(() => {
  try {
    if (!v96admIs()) { V96ADM.lastSt = null; return; }
    const st = v96admSt();
    if (st === "wait" && !V96ADM.waitT0) V96ADM.waitT0 = Date.now();
    if (st !== V96ADM.lastSt) {
      const was = V96ADM.lastSt;
      V96ADM.lastSt = st;
      v96admAccNote();
      try { if (typeof v84AdmApply === "function") v84AdmApply(); } catch (e) { /* 無視 */ }
      if (was === "wait" && st !== "wait") {
        V96ADM.waitT0 = 0;
        setTimeout(() => { try { v96admExpPatch(); const R = v96admRdBox(document.getElementById("well")); if (R.box && R.box.classList.contains("v96adm-wait")) v96admRebuild("synced"); else v96admRdDeco(); } catch (e) { v96admErr("synced", e); } }, 400);
      } else v96admRdDeco();
    } else if (st) {
      // 秒の表示だけ進める
      const t = v96admSyncTxt(st);
      document.querySelectorAll(".rd-x > .v96adm-sync .v96adm-synct").forEach((n) => { if (n.textContent !== t) n.textContent = t; });
      if (st === "wait") v96admAccNote();
    }
    if (v96admExpPatch()) v96admRdDeco();
    const I1 = v96admV1Info(), sig = I1 && I1.late ? I1.v.at : 0;
    if (sig !== V96ADM.v1Sig) { V96ADM.v1Sig = sig; v96admRdDeco(); }
    v96admAutoTick();
    if (V96ADM.ib.busy) v96admIbHead();
  } catch (e) { v96admErr("tick", e); }
}, 1000);
