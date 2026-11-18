/* ═══ 21.97 分野 ai の見せ方（刷新版）：ログイン画面の「確かめる順番・続けてまちがえた回数・待ち時間」・「（自己申告）」の札・
   AI のカウンタ（今日の回数とトークンを式で・今月の回数は今日より少なくならない） ═══
   中身（数と決め方）は logic_v2197ai.js（V97AI）。21.96 の rd_v96ai.js の描き方を控えてから包む。
   onclick= と style= は書かない（押す所は addEventListener・棒は <progress>）。 */
(function () {
  if (typeof V97AI === "undefined") return;
  const E = (s) => v97aiE(s);
  const M = (ja, en, zh, es) => v97aiM(ja, en, zh, es);
  const F = (n) => (+n || 0).toLocaleString("en-US");
  const TK = (n) => (typeof v96aiTok === "function" ? v96aiTok(n) : F(n));
  const P1 = (x) => (x == null ? "—" : (Math.round(x * 10) / 10).toString());
  const err = (k, e) => { try { V97AI.err.push("rd " + k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };

  /* ══════════ ログイン画面：確かめる順番・回数・待ち時間 ══════════ */
  const mmss = (s) => { s = Math.max(0, s | 0); const m = Math.floor(s / 60), r = s % 60; return m ? `${m}:${String(r).padStart(2, "0")}` : M(`${r}秒`, `${r} s`, `${r} 秒`, `${r} s`); };
  const waitTxt = (sec) => sec >= 60 ? M(`${sec / 60}分`, `${sec / 60} min`, `${sec / 60} 分钟`, `${sec / 60} min`) : M(`${sec}秒`, `${sec} seconds`, `${sec} 秒`, `${sec} segundos`);
  let tmr = 0, lastKey = "";
  function place(el) {
    const go = document.getElementById("lg-go");
    if (!go || !go.parentNode) return false;
    const mir = document.getElementById("v92e-lgerr");
    const after = mir && mir.parentNode === go.parentNode ? mir : go;
    if (el.previousElementSibling !== after) after.insertAdjacentElement("afterend", el);
    return true;
  }
  function setGo(lock) {
    const go = document.getElementById("lg-go");
    if (!go) return;
    if (lock) {
      if (!go.disabled) go.disabled = true;
      if (go.getAttribute("aria-disabled") !== "true") go.setAttribute("aria-disabled", "true");
      if (go.dataset.v97lock !== "1") go.dataset.v97lock = "1";
    } else if (go.dataset.v97lock === "1") {
      go.disabled = false; go.removeAttribute("aria-disabled"); delete go.dataset.v97lock;
    }
  }
  function paint() {
    try {
      const code = document.getElementById("lg-code");
      let el = document.getElementById("v97lgHelp");
      if (!code) { if (el) el.remove(); if (tmr) { clearInterval(tmr); tmr = 0; } return; }
      const L = window.v97aiLgf ? window.v97aiLgf() : { n: 0, left: 0 };
      const st = window.v97aiState ? window.v97aiState() : {};
      const t = (document.getElementById("lg-err") || {}).textContent || "";
      const k = window.v97aiKind ? window.v97aiKind(String(t).trim()) : "";
      const showErr = k === "fail";
      const lock = L.left > 0;
      setGo(lock);
      if (lock && !tmr) tmr = setInterval(paint, 1000);
      if (!lock && tmr) { clearInterval(tmr); tmr = 0; }
      if (!lock && !(showErr && L.n > 0) && !(L.n > 0 && st && st.att)) {
        if (el) el.remove();
        lastKey = "";
        return;
      }
      const rows = [];
      if (lock) {
        rows.push(`<p class="v97ai-lgl" role="alert"><b>${E(M(`続けて ${L.n}回まちがえたため、あと ${mmss(L.left)} お待ちください。`, `${L.n} wrong attempts in a row. Please wait ${mmss(L.left)}.`, `已连续输错 ${L.n} 次，请等待 ${mmss(L.left)}。`, `${L.n} intentos erróneos seguidos. Espere ${mmss(L.left)}.`))}</b>${E(M("存在しないコードでの試行が続くと、同期サーバーの記録から STANDAGE に知らせます。この待ち時間は、ページを開き直しても続きます。", " If attempts with codes that do not exist continue, STANDAGE is notified from the sync server's records. The wait continues even if you reload the page.", "如果持续使用不存在的代码尝试，会根据同步服务器的记录通知 STANDAGE。重新打开页面也会继续等待。", " Si continúan los intentos con códigos inexistentes, se avisa a STANDAGE desde los registros del servidor. La espera continúa aunque recargue la página."))}</p>`);
      }
      if (showErr || lock) {
        const fmt = st && st.fmtBad;
        const steps = [
          fmt ? M("① コードの形：いま入っているコードは、英数字をハイフン（-）で区切った形（例：BC-XXXX-XXXX-XXXX・体験用は TRIAL-2026 のような形）になっていません。", "① Code format: the code you entered is not letters/digits separated by hyphens (e.g. BC-XXXX-XXXX-XXXX; trial codes look like TRIAL-2026).", "① 代码格式：输入的代码不是用连字符（-）分隔的英文数字（例：BC-XXXX-XXXX-XXXX；体验用如 TRIAL-2026）。", "① Formato: el código no son letras/dígitos separados por guiones (ej. BC-XXXX-XXXX-XXXX; los de prueba son como TRIAL-2026).")
            : M("① コード：ハイフンの位置と、まぎらわしい文字（0 と O、1 と I）", "① Code: hyphen positions and look-alike characters (0/O, 1/I)", "① 代码：连字符的位置和易混淆的字符（0 与 O、1 与 I）", "① Código: posición de los guiones y caracteres parecidos (0/O, 1/I)"),
          M("② ご担当者名：招待状・申し込みのときの氏名（体験用のコードでも、登録されたお名前があれば照らし合わせます）", "② Name: the name on your invitation or application (trial codes are also checked against registered names, if any)", "② 负责人姓名：邀请函或申请时的姓名（体验用代码如有登记姓名也会核对）", "② Nombre: el de la invitación o solicitud (los códigos de prueba también se cotejan si hay nombres registrados)")
        ];
        rows.push(`<p class="v97ai-lgs"><b>${E(M("確かめる順番", "Check in this order", "请按顺序确认", "Revise en este orden"))}</b></p><ul class="v97ai-lgsl">${steps.map((s) => `<li>${E(s)}</li>`).join("")}</ul>`);
        rows.push(`<p class="v97ai-lgn">${E(M("セキュリティのため、コードとお名前のどちらが違うかはお知らせしていません（体験用の共通のコードで、お名前だけが違うときは、そのことをお知らせします）。", "For security, we do not say whether the code or the name is wrong (for the shared trial codes, we do tell you when only the name is wrong).", "出于安全考虑，不告知是代码还是姓名有误（体验用共用代码仅姓名有误时会告知）。", "Por seguridad, no indicamos si el error está en el código o en el nombre (en los códigos de prueba compartidos sí avisamos si solo falla el nombre)."))}</p>`);
        if (!lock && L.n > 0) {
          const to = L.toWait, nx = window.v97aiWaitOf ? window.v97aiWaitOf(L.n + to) : 30;
          rows.push(`<p class="v97ai-lgc">${E(to > 0
            ? M(`続けて ${L.n}回まちがえています。あと ${to}回まちがえると、${waitTxt(nx)}お待ちいただきます。`, `${L.n} wrong attempt(s) in a row. After ${to} more, you will need to wait ${waitTxt(nx)}.`, `已连续输错 ${L.n} 次。再输错 ${to} 次，需要等待 ${waitTxt(nx)}。`, `${L.n} intento(s) erróneo(s) seguidos. Tras ${to} más, deberá esperar ${waitTxt(nx)}.`)
            : M(`続けて ${L.n}回まちがえています。次にまちがえると、${waitTxt(L.next)}お待ちいただきます。`, `${L.n} wrong attempts in a row. The next wrong attempt means a ${waitTxt(L.next)} wait.`, `已连续输错 ${L.n} 次。下次输错需要等待 ${waitTxt(L.next)}。`, `${L.n} intentos erróneos seguidos. El próximo error implica esperar ${waitTxt(L.next)}.`))}</p>`);
        }
      }
      if (!rows.length) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement("div"); el.id = "v97lgHelp"; el.className = "v97ai-lgh"; el.setAttribute("data-noi18n", "1"); el.setAttribute("aria-live", "polite"); }
      el.dataset.st = lock ? "lock" : "fail";
      const html = rows.join("");
      if (html !== lastKey || !el.parentNode) { el.innerHTML = html; lastKey = html; }
      place(el);
    } catch (e) { err("lgpaint", e); }
  }
  window.rdV97aiLgPaint = paint;
  /* ログイン画面は言語の切り替え・タブで描き直される → 付け直す（ログイン画面があるときだけ・軽い確かめ） */
  let pt = 0;
  const later = () => { if (pt) return; pt = setTimeout(() => { pt = 0; if (document.getElementById("lg-code")) paint(); }, 150); };
  try {
    new MutationObserver((recs) => {
      if (!document.body || !document.body.classList.contains("locked")) return;
      for (const r of recs) { const t = r.target; if (t && t.id === "v97lgHelp") return; if (t && t.closest && t.closest("#v97lgHelp")) return; }
      later();
    }).observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) { err("mo", e); }
  setTimeout(paint, 0);
  setTimeout(paint, 1500);

  /* ══════════ No.501 (b)：アカウントの札・やりとりの投稿者に「（自己申告）」 ══════════ */
  if (typeof v2110UsrText === "function") {
    const __ut97 = v2110UsrText;
    v2110UsrText = function () {   // eslint-disable-line no-global-assign
      const r = __ut97.apply(this, arguments);
      try { if (Array.isArray(r) && r[0] && window.v97aiIsSelf && window.v97aiIsSelf() && r[0] === String(SES.who).trim()) return [window.v97aiSelfName(r[0]), r[1]]; } catch (e) { err("usr", e); }   // eslint-disable-line no-undef
      return r;
    };
    try { if (typeof v2110Usr === "function") setTimeout(v2110Usr, 0); } catch (e) { err("usr0", e); }
  }
  /* やりとりの一覧（#mlist の [data-mi]）：記録に whoSelf:1 のある投稿の、投稿者名（<b> の文字＝m.who）の後ろに札。
     一覧は mRows のあとに別の層が書き足す（スレッドの題名の <b> など）ので、描いたあとに2回見る */
  function badgeRows() {
    try {
      const box = document.getElementById("mlist");
      if (!box) return;
      const L = (typeof D !== "undefined" && D && Array.isArray(D.msgs)) ? D.msgs : [];   // eslint-disable-line no-undef
      box.querySelectorAll("[data-mi]").forEach((row) => {
        const m = L[+row.getAttribute("data-mi")];
        if (!m || m.whoSelf !== 1 || row.querySelector(".v97ai-self")) return;
        const w = String(m.who || "").trim();
        const b = Array.from(row.querySelectorAll("b")).find((x) => String(x.textContent || "").trim() === w);
        if (!b) return;
        const s = document.createElement("span");
        s.className = "v97ai-self";
        s.textContent = M("自己申告", "self-reported", "自行申报", "autodeclarado");
        s.title = M("確かめられていないお名前（体験用のコードで、登録されたお名前と一致しないまま入ったログイン）", "Unverified name (signed in with a trial code without matching a registered name)", "未核实的姓名（使用体验用代码，未与登记姓名一致即登录）", "Nombre no verificado (acceso con código de prueba sin coincidir con un nombre registrado)");
        b.insertAdjacentElement("afterend", s);
      });
    } catch (e) { err("badge", e); }
  }
  const badgeSoon = () => { setTimeout(badgeRows, 0); setTimeout(badgeRows, 400); };
  if (typeof mRows === "function") {
    const __mr97 = mRows;
    mRows = function () {   // eslint-disable-line no-global-assign
      const r = __mr97.apply(this, arguments);
      try { badgeSoon(); } catch (e) { err("mrows", e); }
      return r;
    };
  }
  if (typeof render === "function") {
    const __rn97 = render;
    render = function () {   // eslint-disable-line no-global-assign
      const r = __rn97.apply(this, arguments);
      try { if (typeof cur !== "undefined" && cur === "msg") badgeSoon(); } catch (e) { /* 無視 */ }   // eslint-disable-line no-undef
      return r;
    };
  }

  /* ══════════ R-7（No.506）：AI のカウンタ ══════════ */
  function row(k, st, label, val, sub, pct) {
    const bar = pct != null ? `<progress class="v96ai-pg" max="100" value="${Math.max(0, Math.min(100, +pct || 0))}" aria-hidden="true"></progress>` : "";
    return `<span class="v96ai-m v97ai-m" data-v96m="${E(k)}" data-st="${E(st)}"><span class="v96ai-ml">${E(label)}</span><span class="v96ai-mv">${val}${sub ? `<small>${E(sub)}</small>` : ""}</span>${bar}</span>`;
  }
  const pick = (h, re) => { const m = re.exec(String(h || "")); return m ? m[0] : ""; };
  const attr = (h, a) => { const m = new RegExp(`${a}="([^"]*)"`).exec(String(h || "")); return m ? m[1] : ""; };
  function qHtml(h96) {
    const C = window.v97aiCounts();
    const d = (s) => { if (!s) return ""; const p = String(s).split("-"); return (+p[1]) + "/" + (+p[2]); };
    const al = pick(h96, /<span class="v96ai-al"[^>]*>[\s\S]*?<\/span>/);
    const how = pick(h96, /<details class="v95ai-how v96ai-how"[\s\S]*?<\/details>/);
    const lim95 = attr(h96, "data-v95lim") || (C.srv ? "ok" : "none"), k96 = attr(h96, "data-v96k");
    const parts = [];
    if (C.srv) {
      parts.push(`<span class="v96ai-head v97ai-head"><b>${E(M("今日の AI の利用", "AI use today", "今天的 AI 使用", "Uso de IA hoy"))}</b><small class="v96ai-dev">${E(M("（同期サーバーが数えた数・毎日 0時〔日本時間〕にもどります）", " (counted by the sync server; resets at midnight JST)", "（同步服务器统计・每天 0 点〔日本时间〕恢复）", " (contado por el servidor; se reinicia a medianoche JST)"))}</small></span>`);
      if (al) parts.push(al);
      const rs = [];
      const c = C.cnt, t = C.tok;
      const cst = C.lim === "cnt" ? "hit" : C.near === "cnt" ? "near" : "ok", tst = C.lim === "tok" ? "hit" : C.near === "tok" ? "near" : "ok";
      if (c && c.cap > 0) rs.push(row("cnt", cst, M("今日の回数", "Uses today", "今天的次数", "Usos de hoy"), `<b>${E(F(c.used))}</b>${E(M(`／${F(c.cap)}回`, ` / ${F(c.cap)}`, `／${F(c.cap)} 次`, ` / ${F(c.cap)}`))}`,
        M(`（${F(c.used)}÷${F(c.cap)}＝${P1(c.pct1)}%・残り ${F(c.left)}回）`, ` (${F(c.used)} ÷ ${F(c.cap)} = ${P1(c.pct1)}%, ${F(c.left)} left)`, `（${F(c.used)}÷${F(c.cap)}＝${P1(c.pct1)}%・剩余 ${F(c.left)} 次）`, ` (${F(c.used)} ÷ ${F(c.cap)} = ${P1(c.pct1)}%, quedan ${F(c.left)})`), c.pct1));
      else rs.push(row("cnt", "ok", M("今日の回数", "Uses today", "今天的次数", "Usos de hoy"), `<b>${E(F(c ? c.used : 0))}</b>${E(M("回", ""))}`, M("（このアカウントの1日の回数の上限は決まっていません）", " (no daily count limit for this account)", "（本账户未设每日次数上限）", " (sin límite diario de usos)"), null));
      const tl = M("今日のトークン使用量", "Tokens today", "今天的令牌用量", "Tokens de hoy");
      if (t && t.cap > 0) {
        const io = t.tin != null && t.tout != null ? M(`・入力 ${TK(t.tin)}・出力 ${TK(t.tout)}`, `, in ${TK(t.tin)} · out ${TK(t.tout)}`, `・输入 ${TK(t.tin)}・输出 ${TK(t.tout)}`, `, entrada ${TK(t.tin)} · salida ${TK(t.tout)}`) : "";
        rs.push(row("tok", tst, tl, `<b>${E(TK(t.used))}</b>${E(M(`／${TK(t.cap)}`, ` / ${TK(t.cap)}`, `／${TK(t.cap)}`, ` / ${TK(t.cap)}`))}`, M(`（${TK(t.used)}÷${TK(t.cap)}＝${P1(t.pct1)}%${io}）`, ` (${TK(t.used)} ÷ ${TK(t.cap)} = ${P1(t.pct1)}%${io})`, `（${TK(t.used)}÷${TK(t.cap)}＝${P1(t.pct1)}%${io}）`, ` (${TK(t.used)} ÷ ${TK(t.cap)} = ${P1(t.pct1)}%${io})`), t.pct1));
      } else rs.push(row("tok", C.lim === "tok" ? "hit" : "na", tl, `<b>${E(C.lim === "tok" ? M("上限に達しました", "Limit reached", "已达上限", "Límite alcanzado") : "—")}</b>`, M("（同期サーバーがまだ数を返していません）", " (the server does not return this number yet)", "（同步服务器尚未返回数字）", " (el servidor aún no devuelve esta cifra)"), null));
      parts.push(`<span class="v96ai-ms" role="group" aria-label="${E(M("今日の AI の利用（同期サーバーが数えた数）", "AI use today (counted by the sync server)", "今天的 AI 使用（同步服务器统计）", "Uso de IA hoy (contado por el servidor)"))}">${rs.join("")}</span>`);
      /* どちらの上限に先に届きそうか */
      if (!C.lim && C.first && c && t && c.cap > 0 && t.cap > 0) {
        const s = C.first === "same" ? M(`回数（${P1(c.pct1)}%）とトークン使用量（${P1(t.pct1)}%）は同じくらいです。`, `Uses (${P1(c.pct1)}%) and tokens (${P1(t.pct1)}%) are about the same.`, `次数（${P1(c.pct1)}%）与令牌用量（${P1(t.pct1)}%）差不多。`, `Usos (${P1(c.pct1)}%) y tokens (${P1(t.pct1)}%) van parejos.`)
          : C.first === "tok" ? M(`先に上限に届きそうなのは「トークン使用量」です（${P1(t.pct1)}% ＞ 回数 ${P1(c.pct1)}%）。`, `Tokens are likely to hit the limit first (${P1(t.pct1)}% > uses ${P1(c.pct1)}%).`, `可能先达到上限的是“令牌用量”（${P1(t.pct1)}% ＞ 次数 ${P1(c.pct1)}%）。`, `Es probable que los tokens lleguen antes al límite (${P1(t.pct1)}% > usos ${P1(c.pct1)}%).`)
            : M(`先に上限に届きそうなのは「回数」です（${P1(c.pct1)}% ＞ トークン使用量 ${P1(t.pct1)}%）。`, `Uses are likely to hit the limit first (${P1(c.pct1)}% > tokens ${P1(t.pct1)}%).`, `可能先达到上限的是“次数”（${P1(c.pct1)}% ＞ 令牌用量 ${P1(t.pct1)}%）。`, `Es probable que los usos lleguen antes al límite (${P1(c.pct1)}% > tokens ${P1(t.pct1)}%).`);
        parts.push(`<span class="v97ai-first" data-v97first="${E(C.first)}">${E(s)}${E(M("2つは別の上限の割合です（回数＝AI の処理の数、トークン＝AI に送った文字と答えの量）。長い資料の読み取りが多いと、トークンの割合が先に上がります。どちらか一方が上限に届くと、その日は内蔵エンジンで答えます。", " They are percentages of two different limits (uses = number of AI operations; tokens = amount of text sent and returned). Reading long documents raises the token percentage faster. If either reaches its limit, the built-in engine answers for the rest of the day.", "两者是不同上限的比例（次数＝AI 处理的次数，令牌＝发给 AI 的文字与回答的量）。读取长资料较多时，令牌比例会先上升。任一项达到上限后，当天由内置引擎回答。", " Son porcentajes de dos límites distintos (usos = operaciones de IA; tokens = texto enviado y devuelto). Leer documentos largos sube antes el porcentaje de tokens. Si cualquiera llega al límite, responde el motor integrado el resto del día."))}</span>`);
      }
      /* 今月（今日を含む・今日より少なくならない） */
      if (C.mon) {
        const mo = C.mon;
        parts.push(`<span class="v97ai-mon" data-v97mon="${E(mo.c)}"><b>${E(M(`今月の回数：${F(mo.c)}回`, `Uses this month: ${F(mo.c)}`, `本月次数：${F(mo.c)} 次`, `Usos este mes: ${F(mo.c)}`))}</b>${t && t.cap > 0 ? E(M(`・トークン ${TK(mo.t)}`, ` · tokens ${TK(mo.t)}`, `・令牌 ${TK(mo.t)}`, ` · tokens ${TK(mo.t)}`)) : ""}<small>${mo.srv ? E(M(`（同期サーバーが数えた今月の数。今日の ${F(c ? c.used : 0)}回を含みます）`, ` (counted by the sync server for this month, including today's ${F(c ? c.used : 0)})`, `（同步服务器统计的本月数字，含今天的 ${F(c ? c.used : 0)} 次）`, ` (contado por el servidor este mes, incluidas las ${F(c ? c.used : 0)} de hoy)`)) : E(M(`（同期サーバーの日ごとの数を、この端末で記録した ${mo.days}日分〔${d(mo.since)} から〕足した数。今日の ${F(c ? c.used : 0)}回を含みます。ほかの端末だけで使った日は入りません）`, ` (the sync server's daily numbers for the ${mo.days} day(s) recorded on this device since ${d(mo.since)}, including today's ${F(c ? c.used : 0)}; days used only on other devices are not included)`, `（同步服务器每天的数字，按本设备记录的 ${mo.days} 天〔自 ${d(mo.since)}〕相加，含今天的 ${F(c ? c.used : 0)} 次；仅在其他设备使用的日子不计入）`, ` (cifras diarias del servidor de los ${mo.days} día(s) registrados en este dispositivo desde ${d(mo.since)}, incluidas las ${F(c ? c.used : 0)} de hoy; no incluye días usados solo en otros dispositivos)`))}</small></span>`);
      }
    } else {
      parts.push(`<span class="v88mute v96ai-none">${E(M("上限：この接続では回数・トークンの上限はありません（月の上限は設けていません）", "No count or token limit on this connection (there is no monthly limit)", "上限：此连接没有次数和令牌上限（不设月度上限）", "Sin límite de usos ni de tokens en esta conexión (no hay límite mensual)"))}</span>`);
      if (al) parts.push(al);
    }
    /* この端末で数えた AI商社マンへの質問（別の数として） */
    if (C.q) {
      const q = C.q;
      const sd = q.since ? (() => { const x = new Date(q.since); return (x.getMonth() + 1) + "/" + x.getDate(); })() : "";
      const lead = C.srv && q.sub ? M("うち、この端末から AI商社マンへの質問", "Of these, questions to the AI from this device", "其中，本设备向 AI 的提问", "De ellos, preguntas a la IA desde este dispositivo")
        : C.srv ? M("この端末から AI商社マンへの質問（内蔵エンジンの答えを含む）", "Questions to the AI from this device (including built-in engine answers)", "本设备向 AI 的提问（含内置引擎的回答）", "Preguntas a la IA desde este dispositivo (incluye respuestas del motor integrado)")
          : M("この端末から AI商社マンへの質問", "Questions to the AI from this device", "本设备向 AI 的提问", "Preguntas a la IA desde este dispositivo");
      parts.push(`<span class="v97ai-dq" data-v97q="${E(q.n)}">${E(lead)}${E(M("：", ": ", "：", ": "))}<b>${E(M(`今月 ${q.n}回`, `${q.n} this month`, `本月 ${q.n} 次`, `${q.n} este mes`))}</b>${E(M(`${sd ? `（${sd} から）` : ""}・これまでの合計 ${q.total}回`, `${sd ? ` (since ${sd})` : ""} · ${q.total} in total`, `${sd ? `（自 ${sd}）` : ""}・累计 ${q.total} 次`, `${sd ? ` (desde ${sd})` : ""} · ${q.total} en total`))}<small class="v96ai-dev">${E(M("（この端末で数えた数・画面の訳や資料づくりは数えません）", " (counted on this device; translations and document drafting are not counted)", "（本设备统计・不含画面翻译和制作资料）", " (contado en este dispositivo; no incluye traducciones ni documentos)"))}</small></span>`);
    }
    if (how) parts.push(how);
    return `<div class="v90g-q v95ai-q v96ai-q v97ai-q" data-v90q="1" data-v95lim="${E(lim95)}" data-v96k="${E(k96)}" data-noi18n="1" role="note"><span class="v90g-qi" aria-hidden="true">💬</span><span class="v95ai-qb v96ai-qb">${parts.join("")}</span></div>`;
  }
  if (typeof v90goalQHtml === "function" && typeof window.v97aiCounts === "function") {
    const __gh97 = v90goalQHtml;
    v90goalQHtml = function () {   // eslint-disable-line no-global-assign
      const h = __gh97.apply(this, arguments);
      try { return qHtml(h); } catch (e) { err("qh", e); return h; }
    };
  }
})();
