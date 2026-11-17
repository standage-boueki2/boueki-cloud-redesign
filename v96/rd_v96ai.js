/* ═══ 21.96 分野 ai の見せ方（刷新版）：AI のカウンタ（回数とトークン使用量を分ける）・上限の帯の「止まった理由」・
   受信箱と「案件」の札の範囲（表示中の会社／すべての会社） ═══
   中身（数と決め方）は logic_v2196ai.js（V96AI）。21.95 の rd_v95ai.js の描き方を控えてから包む。
   onclick= と style= は書かない（棒は <progress>・押す所は addEventListener）。 */
(function () {
  if (typeof V96AI === "undefined") return;
  const E = (s) => v96aiE(s);
  const M = (ja, en, zh, es) => v96aiM(ja, en, zh, es);
  const F = (n) => (+n || 0).toLocaleString("en-US");
  const TK = (n) => v96aiTok(n);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const trial = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "trial"; } catch (e) { return false; } };   // eslint-disable-line no-undef
  const fwd = () => { try { return !!(window.RDX && window.RDX.isFwd && window.RDX.isFwd()); } catch (e) { return false; } };

  /* ══════════ No.506：カウンタ ══════════ */
  const ENGINE = () => M("いまは内蔵エンジン（登録データと決まったルール）で答えます。毎日 0時（日本時間）にもどります。", "The built-in engine (your registered data and fixed rules) answers for now. It resets at midnight (JST).", "目前由内置引擎（登记数据和固定规则）回答。每天 0 点（日本时间）恢复。", "Por ahora responde el motor integrado (sus datos registrados y reglas fijas). Se restablece a medianoche (JST).");
  /* 上限・上限に近いときの1行（どちらの上限かを書く） */
  function alertLine(G) {
    const c = G.cnt, t = G.tok;
    const tokTxt = t && t.cap > 0 ? `${TK(t.used)}／${TK(t.cap)}` : "";
    switch (G.lim) {
      case "cnt": return { st: "hit", h: M(`今日の回数の上限（${F(c && c.cap)}回）に達しました`, `Today's count limit (${F(c && c.cap)}) has been reached`, `已达到今天的次数上限（${F(c && c.cap)} 次）`, `Se alcanzó el límite de usos de hoy (${F(c && c.cap)})`),
        b: (t && t.pct != null ? M(`止まったのは回数の上限です（トークン使用量は ${t.pct}%）。`, `It stopped at the count limit (token usage is ${t.pct}%). `, `停止原因是次数上限（令牌用量为 ${t.pct}%）。`, `Se detuvo por el límite de usos (uso de tokens: ${t.pct}%). `) : "") + ENGINE() };
      case "tok": return { st: "hit", h: M(`今日のトークン使用量の上限${tokTxt ? `（${TK(t.cap)}）` : ""}に達しました`, `Today's token usage limit${tokTxt ? ` (${TK(t.cap)})` : ""} has been reached`, `已达到今天的令牌用量上限${tokTxt ? `（${TK(t.cap)}）` : ""}`, `Se alcanzó el límite de tokens de hoy${tokTxt ? ` (${TK(t.cap)})` : ""}`),
        b: (c && c.left != null ? M(`回数はまだ残っています（残り ${F(c.left)}回）が、トークン使用量（AI に送った文字と答えの量）の上限が先に届きました。長い資料の読み取りや長い答えが続くと、こうなります。`, `You still have uses left (${F(c.left)}), but the token limit (amount of text sent to and returned by the AI) was reached first. Long documents or long answers can cause this. `, `次数还有剩余（剩余 ${F(c.left)} 次），但令牌用量（发给 AI 的文字和回答的量）先达到了上限。连续读取长资料或长回答时会出现这种情况。`, `Aún le quedan usos (${F(c.left)}), pero antes se alcanzó el límite de tokens (texto enviado a la IA y respuestas). Ocurre con documentos o respuestas largos. `) : M("トークン使用量（AI に送った文字と答えの量）の上限です。", "This is the token usage limit (text sent to and returned by the AI). ", "这是令牌用量（发给 AI 的文字和回答的量）的上限。", "Es el límite de tokens (texto enviado a la IA y respuestas). ")) + ENGINE() };
      case "all": return { st: "hit", h: M("STANDAGE の AI 全体の1日の上限に達しました", "The daily limit for STANDAGE's AI as a whole has been reached", "已达到 STANDAGE AI 整体的每日上限", "Se alcanzó el límite diario de la IA de STANDAGE en conjunto"),
        b: M("ほかのお客様の利用と合わせた上限で、このアカウントの回数・トークン使用量の上限とは別です。", "It is shared with other customers and is separate from this account's count and token limits. ", "这是与其他客户合计的上限，与本账户的次数和令牌用量上限不同。", "Es compartido con otros clientes y distinto de los límites de usos y tokens de esta cuenta. ") + ENGINE() };
      case "rate": return { st: "wait", h: M("短い時間に続けて使ったため、AI を少し休ませています（1分あたりの上限）", "The AI is pausing because it was used many times in a short time (per-minute limit)", "短时间内连续使用，AI 暂时休息（每分钟上限）", "La IA hace una pausa por muchos usos seguidos (límite por minuto)"),
        b: M("1日の回数・トークン使用量の上限ではありません。1〜2分おいてから、もう一度お試しください。", "This is not the daily count or token limit. Please try again in 1–2 minutes.", "这不是每日次数或令牌用量上限。请过 1～2 分钟再试。", "No es el límite diario de usos ni de tokens. Inténtelo de nuevo en 1–2 minutos.") };
      case "prov": return { st: "wait", h: M("AI の会社の側が混み合っています（HTTP 429）", "The AI provider is busy (HTTP 429)", "AI 服务商繁忙（HTTP 429）", "El proveedor de IA está saturado (HTTP 429)"),
        b: M("このアカウントの回数・トークン使用量の上限ではありません。数分おいてから、もう一度お試しください。", "This is not this account's count or token limit. Please try again in a few minutes.", "这不是本账户的次数或令牌用量上限。请过几分钟再试。", "No es el límite de usos ni de tokens de esta cuenta. Inténtelo de nuevo en unos minutos.") };
      default: break;
    }
    if (G.near === "tok" && t && t.cap > 0) return { st: "near", h: M(`トークン使用量が1日の上限に近づいています（${t.pct}%・あと ${TK(Math.max(0, t.cap - t.used))}）`, `Token usage is close to the daily limit (${t.pct}%, ${TK(Math.max(0, t.cap - t.used))} left)`, `令牌用量接近每日上限（${t.pct}%・剩余 ${TK(Math.max(0, t.cap - t.used))}）`, `El uso de tokens se acerca al límite diario (${t.pct}%, quedan ${TK(Math.max(0, t.cap - t.used))})`),
      b: M("上限に届くと、回数が残っていても、その日は内蔵エンジンで答えます。", "When it is reached, the built-in engine answers for the rest of the day even if uses remain.", "达到上限后，即使次数还有剩余，当天也由内置引擎回答。", "Al alcanzarlo, responde el motor integrado el resto del día aunque queden usos.") };
    if (G.near === "cnt" && c && c.cap > 0) return { st: "near", h: M(`回数が1日の上限に近づいています（残り ${F(c.left)}回）`, `Uses are close to the daily limit (${F(c.left)} left)`, `次数接近每日上限（剩余 ${F(c.left)} 次）`, `Los usos se acercan al límite diario (quedan ${F(c.left)})`),
      b: M("上限に届くと、その日は内蔵エンジンで答えます。", "When it is reached, the built-in engine answers for the rest of the day.", "达到上限后，当天由内置引擎回答。", "Al alcanzarlo, responde el motor integrado el resto del día.") };
    return null;
  }
  function meterRow(k, st, label, val, sub, pct) {
    const bar = pct != null ? `<progress class="v96ai-pg" max="100" value="${Math.max(0, Math.min(100, +pct || 0))}" aria-hidden="true"></progress>` : "";
    return `<span class="v96ai-m" data-v96m="${E(k)}" data-st="${E(st)}"><span class="v96ai-ml">${E(label)}</span><span class="v96ai-mv">${val}${sub ? `<small>${E(sub)}</small>` : ""}</span>${bar}</span>`;
  }
  function metersHtml(G) {
    if (!G.srv) return `<span class="v88mute v96ai-none">${E(M("上限：この接続では回数・トークンの上限はありません（月の上限は設けていません）", "No count or token limit on this connection (there is no monthly limit)", "上限：此连接没有次数和令牌上限（不设月度上限）", "Sin límite de usos ni de tokens en esta conexión (no hay límite mensual)"))}</span>`;
    const c = G.cnt, t = G.tok, rows = [];
    const cst = G.lim === "cnt" ? "hit" : G.near === "cnt" ? "near" : "ok";
    if (c && c.cap > 0) rows.push(meterRow("cnt", cst, M("今日の回数", "Uses today", "今天的次数", "Usos de hoy"), `<b>${E(F(c.used))}</b>${E(M(`／${F(c.cap)}回`, ` / ${F(c.cap)}`, `／${F(c.cap)} 次`, ` / ${F(c.cap)}`))}`, M(`（残り ${F(c.left)}回）`, ` (${F(c.left)} left)`, `（剩余 ${F(c.left)} 次）`, ` (quedan ${F(c.left)})`), c.pct));
    else rows.push(meterRow("cnt", "ok", M("今日の回数", "Uses today", "今天的次数", "Usos de hoy"), `<b>${E(F(c ? c.used : 0))}</b>${E(M("回", ""))}`, M("（このアカウントの1日の回数の上限は決まっていません）", " (no daily count limit for this account)", "（本账户未设每日次数上限）", " (sin límite diario de usos)"), null));
    const tst = G.lim === "tok" ? "hit" : G.near === "tok" ? "near" : "ok";
    const tl = M("今日のトークン使用量", "Tokens today", "今天的令牌用量", "Tokens de hoy");
    if (t && t.cap > 0) {
      const io = t.tin != null && t.tout != null ? M(`・入力 ${TK(t.tin)}・出力 ${TK(t.tout)}`, `, in ${TK(t.tin)} · out ${TK(t.tout)}`, `・输入 ${TK(t.tin)}・输出 ${TK(t.tout)}`, `, entrada ${TK(t.tin)} · salida ${TK(t.tout)}`) : "";
      rows.push(meterRow("tok", tst, tl, `<b>${E(TK(t.used))}</b>${E(M(`／${TK(t.cap)}`, ` / ${TK(t.cap)}`, `／${TK(t.cap)}`, ` / ${TK(t.cap)}`))}`, M(`（${t.pct}%${io}）`, ` (${t.pct}%${io})`, `（${t.pct}%${io}）`, ` (${t.pct}%${io})`), t.pct));
    } else if (G.lim === "tok") {
      rows.push(meterRow("tok", "hit", tl, `<b>${E(M("上限に達しました", "Limit reached", "已达上限", "Límite alcanzado"))}</b>`, M("（数は同期サーバーが返していません）", " (the server did not return the numbers)", "（同步服务器未返回数字）", " (el servidor no devolvió las cifras)"), null));
    } else {
      rows.push(meterRow("tok", "na", tl, `<b>—</b>`, M("（同期サーバーがまだ数を返していません。上限に届いたときは、ここに出ます）", " (the server does not return this number yet; it shows here when the limit is reached)", "（同步服务器尚未返回数字；达到上限时会在这里显示）", " (el servidor aún no devuelve esta cifra; aparecerá aquí al alcanzar el límite)"), null));
    }
    return `<span class="v96ai-ms" role="group" aria-label="${E(M("今日の AI の利用（同期サーバーが数えた数）", "AI use today (counted by the sync server)", "今天的 AI 使用（同步服务器统计）", "Uso de IA hoy (contado por el servidor)"))}">${rows.join("")}</span>`;
  }
  function howHtml() {
    const li = [
      M("「今日の回数」：同期サーバーが数える AI の処理の回数です。質問のほか、画面の訳・資料づくり・HSコードの判定など、AI を使う操作を1回ずつ数えます（1つの質問で数回になることもあります）。", "“Uses today”: AI operations counted by the sync server — questions plus screen translations, document drafting, HS code checks and other AI operations, one each (a question can use several).", "“今天的次数”：同步服务器统计的 AI 处理次数。除提问外，画面翻译、制作资料、HS 编码判定等使用 AI 的操作各计 1 次（一个问题可能计多次）。", "«Usos de hoy»: operaciones de IA que cuenta el servidor (preguntas, traducciones, documentos, códigos HS, etc.; una pregunta puede usar varias)."),
      M("「今日のトークン使用量」：AI に送った文字（資料・質問）と、AI の答えの量の合計です（トークンは AI が文字の量を数える単位）。長い資料の読み取りや長い答えが続くと、回数が残っていても、こちらが先に上限に届きます。", "“Tokens today”: the total amount of text sent to the AI (documents, questions) plus the AI's answers (a token is the unit the AI uses to measure text). With long documents or answers, this limit can be reached first even if uses remain.", "“今天的令牌用量”：发给 AI 的文字（资料、问题）与 AI 回答的量的合计（令牌是 AI 计算文字量的单位）。连续读取长资料或长回答时，即使次数还有剩余，也可能先达到此上限。", "«Tokens de hoy»: total de texto enviado a la IA (documentos, preguntas) y de sus respuestas (el token es la unidad con que la IA mide el texto). Con textos largos, este límite puede llegar antes aunque queden usos."),
      M("どちらか一方が上限に届くと、その日は内蔵エンジンで答えます。どちらの上限かは、ここと画面の上の帯に出ます。毎日 0時（日本時間）にもどります。共通のアカウントでは、使う人全員の合計です。", "If either one reaches its limit, the built-in engine answers for the rest of the day. Which limit it was is shown here and in the banner at the top. Both reset at midnight (JST). On a shared account they are everyone's total.", "任一项达到上限后，当天由内置引擎回答。是哪一项上限会显示在这里和页面上方的横幅中。每天 0 点（日本时间）恢复。共用账户为所有使用者的合计。", "Si cualquiera de los dos llega al límite, responde el motor integrado el resto del día. Aquí y en el aviso superior se indica cuál fue. Se restablecen a medianoche (JST). En una cuenta compartida es el total de todos."),
      M("「今月の質問」「これまでの合計」は、この端末（ブラウザ）で数えた AI商社マンへの質問の数です（画面の訳などは数えません）。ログインし直すと 0 から数え直すことがあります。「今日の回数」「今日のトークン使用量」は同期サーバーが数えるので、ログインし直しても、別の端末でも同じ数です。", "“Questions this month” and “in total” are questions to the AI counted on this device (browser); translations etc. are not counted, and they may start again from 0 after you sign in again. “Uses today” and “Tokens today” are counted by the sync server, so they stay the same after signing in again or on another device.", "“本月提问”和“累计”是在本设备（浏览器）上统计的向 AI 提问的次数（不含画面翻译等），重新登录后可能从 0 重新计数。“今天的次数”和“今天的令牌用量”由同步服务器统计，重新登录或换设备也相同。", "«Preguntas este mes» y «en total» se cuentan en este dispositivo (navegador), sin traducciones; pueden volver a 0 al iniciar sesión de nuevo. «Usos de hoy» y «Tokens de hoy» los cuenta el servidor y se mantienen al volver a entrar o en otro dispositivo.")
    ];
    return `<details class="v95ai-how v96ai-how" data-v96how="1"><summary>${E(M("回数とトークン使用量の数え方（「今月の質問」とのちがい）", "How uses and tokens are counted (vs “questions this month”)", "次数与令牌用量的计算方法（与“本月提问”的区别）", "Cómo se cuentan usos y tokens (frente a «preguntas este mes»)"))}</summary><ul>${li.map((x) => `<li>${E(x)}</li>`).join("")}</ul></details>`;
  }
  function qHtml() {
    const Q = v90goalQ(), G = v96aiMeter();
    const d = (ts) => { const x = new Date(ts); return (x.getMonth() + 1) + "/" + x.getDate(); };
    const A = alertLine(G);
    const st95 = A ? (A.st === "near" ? "ok" : A.st) : (G.srv ? "ok" : "none");
    const head = M(`AI商社マンへの質問：今月 `, `Questions to the AI: `, `向 AI 的提问：本月 `, `Preguntas a la IA: `) ;
    const qn = `<b>${E(M(`${Q.n}回`, `${Q.n}`, `${Q.n} 次`, `${Q.n}`))}</b>`;
    const tail = M(`${Q.since ? `（${d(Q.since)} から）` : ""}・これまでの合計 ${Q.total}回`, ` this month${Q.since ? ` (since ${d(Q.since)})` : ""} · ${Q.total} in total`, `${Q.since ? `（自 ${d(Q.since)}）` : ""}・累计 ${Q.total} 次`, ` este mes${Q.since ? ` (desde ${d(Q.since)})` : ""} · ${Q.total} en total`);
    const dev = M("（この端末で数えた数）", " (counted on this device)", "（本设备统计）", " (contado en este dispositivo)");
    const al = A ? `<span class="v96ai-al" data-st="${E(A.st)}" role="${A.st === "near" ? "note" : "alert"}"><b>${E(A.h)}</b>${E(M("。", ". ", "。", ". "))}${E(A.b)}</span>` : "";
    const foot = G.srv ? `<span class="v88mute v96ai-foot">${E(M("回数とトークン使用量は、同期サーバーが数えています（2分ごとに合わせ直します）。どちらか一方が上限に届くと、その日は内蔵エンジンで答えます。", "Uses and tokens are counted by the sync server (re-aligned every 2 minutes). If either reaches its limit, the built-in engine answers for the rest of the day.", "次数和令牌用量由同步服务器统计（每 2 分钟重新对齐）。任一项达到上限后，当天由内置引擎回答。", "Usos y tokens los cuenta el servidor (se ajustan cada 2 minutos). Si cualquiera llega al límite, responde el motor integrado el resto del día."))}</span>` : "";
    return `<div class="v90g-q v95ai-q v96ai-q" data-v90q="1" data-v95lim="${E(st95)}" data-v96k="${E(G.lim || (G.near ? "near-" + G.near : ""))}" data-noi18n="1" role="note"><span class="v90g-qi" aria-hidden="true">💬</span><span class="v95ai-qb v96ai-qb"><span class="v96ai-head">${E(head)}${qn}${E(tail)}<small class="v96ai-dev">${E(dev)}</small></span>${al}${metersHtml(G)}${foot}${howHtml()}</span></div>`;
  }
  if (typeof v90goalQHtml === "function") {
    const __gh96 = v90goalQHtml;
    v90goalQHtml = function () {
      try { return qHtml(); } catch (e) { v96aiErr("qh", e); return __gh96.apply(this, arguments); }
    };
  }
  /* 上限の帯（v92ai）：「止まった理由」を、どちらの上限かと数で書く（21.95 の1行を置きかえる） */
  function barWhy(G) {
    const c = G.cnt, t = G.tok;
    switch (G.lim) {
      case "tok": return M(`止まった理由：今日のトークン使用量の上限${t && t.cap > 0 ? `（${TK(t.used)}／${TK(t.cap)}）` : ""}。${c && c.left != null ? `回数は残り ${F(c.left)}回ですが、先にトークンの上限に届きました。` : ""}`, `Why it stopped: today's token limit${t && t.cap > 0 ? ` (${TK(t.used)} / ${TK(t.cap)})` : ""}.${c && c.left != null ? ` ${F(c.left)} uses were still left, but the token limit was reached first.` : ""}`);
      case "cnt": return M(`止まった理由：今日の回数の上限（${F(c && c.used)}／${F(c && c.cap)}回）。${t && t.pct != null ? `トークン使用量は ${t.pct}% です。` : ""}`, `Why it stopped: today's count limit (${F(c && c.used)} / ${F(c && c.cap)}).${t && t.pct != null ? ` Token usage is ${t.pct}%.` : ""}`);
      case "all": return M("止まった理由：STANDAGE の AI 全体の1日の上限（このアカウントの回数・トークン使用量の上限ではありません）。", "Why it stopped: the daily limit for STANDAGE's AI as a whole (not this account's count or token limit).");
      case "rate": return M("止まった理由：1分あたりの上限（1日の回数・トークン使用量の上限ではありません）。", "Why it stopped: the per-minute limit (not the daily count or token limit).");
      case "prov": return M("止まった理由：AI の会社の側の混雑（HTTP 429）。このアカウントの上限ではありません。", "Why it stopped: the AI provider is busy (HTTP 429), not this account's limit.");
      default: return "";
    }
  }
  if (typeof v92aiBarHtml === "function") {
    const __bh96 = v92aiBarHtml;
    v92aiBarHtml = function () {
      let h = __bh96.apply(this, arguments);
      try {
        const t = barWhy(v96aiMeter());
        if (!t) return h;
        const p = `<p class="v95ai-barn v96ai-barn" data-v95bar="1" data-v96bar="1">${E(t)}</p>`;
        if (/<p class="v95ai-barn"[^>]*>[\s\S]*?<\/p>/.test(h)) h = h.replace(/<p class="v95ai-barn"[^>]*>[\s\S]*?<\/p>/, p);
        else h = h.replace(/(<div class="v92ai-bb"><p>[\s\S]*?<\/p>)/, `$1${p}`);
      } catch (e) { v96aiErr("bh", e); }
      return h;
    };
  }
  /* 刷新前の画面の「🔢 AI の利用」の行（刷新版では隠れている）：トークン使用量も足す */
  if (typeof v82shpCapHtml === "function") {
    const __ch96 = v82shpCapHtml;
    v82shpCapHtml = function () {
      let h = __ch96.apply(this, arguments);
      try {
        const G = v96aiMeter(), t = G.tok;
        if (!t || !(t.cap > 0) || !/data-v82cap="(cap|lim)"/.test(h)) return h;
        const add = M(`・今日のトークン使用量 ${TK(t.used)}／${TK(t.cap)}（${t.pct}%）`, `; tokens today ${TK(t.used)} / ${TK(t.cap)} (${t.pct}%)`, `・今天的令牌用量 ${TK(t.used)}／${TK(t.cap)}（${t.pct}%）`, `; tokens de hoy ${TK(t.used)} / ${TK(t.cap)} (${t.pct}%)`);
        h = h.replace(/(残り [\d,]+回|剩余 [\d,]+ 次|quedan [\d,]+|[\d,]+ left)/, `$1${E(add)}`);
      } catch (e) { v96aiErr("ch", e); }
      return h;
    };
  }

  /* ══════════ No.499：受信箱の範囲の切り替えと、札の数 ══════════ */
  const RD = window.RDX;
  function ixBar(w) {
    if (!w || fwd() || !trial()) return;
    const S = v96aiScopeInfo();
    let bar = $(".k-v96ix", w);
    if (!S.on) { if (bar) bar.remove(); return; }
    const nCo = v96aiIxCount("co"), nAll = v96aiIxCount("all");
    const multiCo = S.nCo > 1;
    const sc = multiCo ? S.sc : "co";
    const t = sc === "co"
      ? M(`表示中の「${S.co0}」の知らせ ${nCo}件で数えています（バイヤーからの返信は、この会社の商品 ${S.nProd}件の分）。確認待ち・依頼ページなど会社によらない知らせも含みます。`, `Counting ${nCo} items for “${S.co0}” (buyer replies from its ${S.nProd} products), plus items not tied to a company.`) + (multiCo ? M(`ほかの会社の分は「すべての会社」で見られます（案件一覧と同じ切り替えです）。`, ` Use “All companies” to include other companies (same switch as the case list).`) : "")
      : M(`このアカウントのすべての会社の知らせ ${nAll}件で数えています（表示中の「${S.co0}」：${nCo}件）。案件一覧と同じ切り替えです。`, `Counting all ${nAll} items in this account (“${S.co0}”: ${nCo}). Same switch as the case list.`);
    const btns = multiCo ? `<div class="k-v95scb" role="group" aria-label="${E(M("受信箱の範囲", "Inbox scope"))}">
        <button type="button" class="k-v95scx ${sc === "co" ? "on" : ""}" aria-pressed="${sc === "co"}" data-v96ix="co"><span>${E(M("表示中の会社", "This company"))}</span><b>${E(nCo)}</b></button>
        <button type="button" class="k-v95scx ${sc === "all" ? "on" : ""}" aria-pressed="${sc === "all"}" data-v96ix="all"><span>${E(M("すべての会社", "All companies"))}</span><b>${E(nAll)}</b></button></div>` : "";
    const html = `${btns}<p class="k-v95scn">${E(t)}</p>`;
    if (!bar) { bar = document.createElement("div"); bar.className = "k-v95sc k-v96ix"; bar.setAttribute("data-noi18n", ""); bar.setAttribute("role", "note"); }
    const hero = $("[data-rdhero]", w);
    if (!bar.parentNode) { if (hero) hero.after(bar); else w.prepend(bar); }
    if (bar.dataset.h !== html) {
      bar.innerHTML = html; bar.dataset.h = html;
      $$("[data-v96ix]", bar).forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = b.dataset.v96ix; if (v === v96aiScope()) return;
        v96aiSetScope(v);
        const y = window.scrollY;
        try { if (RD && RD.goKey) RD.goKey("inbox"); else if (typeof go === "function") go("inbox"); } catch (x) { v96aiErr("ixgo", x); }   // eslint-disable-line no-undef
        try { window.scrollTo(0, y); } catch (x) { /* 無視 */ }
      }));
    }
  }
  if (RD && RD.page) {
    const p0 = RD.page.inbox;
    RD.page.inbox = (w, k) => { if (p0) p0(w, k); try { ixBar(w); } catch (e) { v96aiErr("ixbar", e); } };
  }
  /* 左のメニュー：「案件」の札（要対応）を案件一覧と同じ範囲で。前の層の札（v92goal・v90ana が書き合う）には触らず、
     別の札（.k-v96bdg）を出して前の札を CSS で隠す＝見張りどうしが書き合わない。受信箱の札には範囲の説明（title） */
  let busy = 0;
  function sideFix() {
    if (busy) return;
    busy = 1;
    try {
      const sd = document.getElementById("rdside"); if (!sd) return;
      const b = $('.rd-main[data-rdk="dash:home"]', sd);
      const S = (trial() && !fwd()) ? v96aiScopeInfo() : { on: false };
      const n = S.on ? v96aiTodoCount(S.sc) : null;
      if (b) {
        let mine = $(".k-v96bdg", b);
        if (n == null) {
          if (mine) mine.remove();
          if (b.hasAttribute("data-v96b")) b.removeAttribute("data-v96b");
        } else {
          if (b.getAttribute("data-v96b") !== "1") b.setAttribute("data-v96b", "1");
          if (!mine) { mine = document.createElement("span"); mine.className = "k-v96bdg"; b.appendChild(mine); }
          const txt = String(n), hid = !n;
          if (mine.textContent !== txt) mine.textContent = txt;
          if (mine.hidden !== hid) mine.hidden = hid;
          const tt = S.sc === "all"
            ? M(`要対応 ${n}件（すべての会社の案件。相手の返信に、まだ返していない案件）`, `${n} need action (all companies; cases where the other side replied and you have not answered)`)
            : M(`要対応 ${n}件（表示中の「${S.co0}」の案件。相手の返信に、まだ返していない案件。ほかの会社の分は案件一覧の「すべての会社」で）`, `${n} need action (cases of “${S.co0}” where the other side replied and you have not answered)`);
          if (mine.title !== tt) { mine.title = tt; mine.setAttribute("aria-label", tt); }
        }
      }
      /* 受信箱（すべての機能の中）と、たたんだ「すべての機能」の札 */
      const ib = $('[data-rdk="inbox"] .rd-bdg', sd);
      if (ib) {
        const tt = !S.on ? M("受信箱の知らせ（いま表示している商品の分と、会社によらない知らせ）", "Inbox items (this product and items not tied to a company)")
          : S.sc === "all" ? M("受信箱の知らせ（すべての会社の分）", "Inbox items (all companies)") : M(`受信箱の知らせ（表示中の「${S.co0}」の分と、会社によらない知らせ）`, `Inbox items (“${S.co0}” and items not tied to a company)`);
        if (ib.title !== tt) ib.title = tt;
      }
    } catch (e) { v96aiErr("side", e); } finally { busy = 0; }
  }
  let tm = 0;
  const later = () => { if (tm) return; tm = setTimeout(() => { tm = 0; sideFix(); }, 30); };
  const watch = () => { const sd = document.getElementById("rdside"); if (!sd) { setTimeout(watch, 500); return; }
    try { new MutationObserver(() => { if (!busy) later(); }).observe(sd, { childList: true, subtree: true, characterData: true }); } catch (e) { v96aiErr("mo", e); } later(); };
  watch();
  if (typeof render === "function") {
    const __rn96 = render;
    render = function () { const r = __rn96.apply(this, arguments); try { later(); } catch (e) { /* 無視 */ } return r; };   // eslint-disable-line no-global-assign
  }
  /* 案件一覧の範囲の切り替え（rd_v95misc の data-v95sc）を押したら、受信箱の札も数え直す */
  document.addEventListener("click", (e) => { try { if (e.target && e.target.closest && e.target.closest("[data-v95sc]")) setTimeout(() => { try { if (typeof v33InboxBadge === "function") v33InboxBadge(); } catch (x) { /* 無視 */ } later(); }, 300); } catch (x) { /* 無視 */ } }, true);
})();
