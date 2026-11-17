/* ═══ 21.95 分野 ai の見せ方（刷新版）：AI 利用量のカウンタ・上限のバナー・管理者の確認コードの期限・安全の決まり ═══
   中身（状態）は logic_v2195ai.js の V95AI。ここは画面の文言と描き直しだけ。 */
(function () {
  if (typeof V95AI === "undefined") return;
  const E = (s) => v95aiE(s);
  const L = () => v95aiLang();
  const M = (ja, en, zh, es) => { const l = L(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  const F = (n) => (+n || 0).toLocaleString("en-US");
  /* air_me の答え（上限の数）と、この画面で足した回数 */
  function srv() { try { const l = (typeof V63A !== "undefined" && V63A) ? V63A.last : null; return (l && l.ok && l.on) ? l : null; } catch (e) { return null; } }

  /* ── カウンタの1行（今日の回数と上限） ── */
  function limLine(cap, used) {
    const Lm = v95aiLimNow();
    const hasCap = cap != null && cap > 0;
    const cnt = hasCap ? M(`今日 ${F(used)}回／1日の回数の上限 ${F(cap)}回`, `${F(used)} today / daily limit ${F(cap)}`) : "";
    const tokPct = (() => { const l = srv(); return l && +l.tokCap > 0 ? Math.min(100, Math.round((+l.tokUsed || 0) / +l.tokCap * 100)) : null; })();
    if (Lm && (Lm.kind === "cap" || Lm.kind === "tok" || Lm.kind === "all")) {
      const why = Lm.kind === "tok"
        ? M("回数の前に、1日の利用量（AI に送る文字と答えの量）の上限に届きました。長い資料の読み取りや長い答えが続くと、回数が残っていても先に届きます。", "The daily usage limit (amount of text sent to and returned by the AI) was reached before the count limit. Long documents or long answers can reach it even while the count still has room.")
        : Lm.kind === "all"
          ? M("STANDAGE の AI 全体の1日の上限（ほかのお客様の利用も合わせた上限）に届きました。", "The daily limit for STANDAGE's AI as a whole (shared with other customers) was reached.")
          : M("1日の回数の上限に届きました。", "The daily count limit was reached.");
      return { st: "hit", k: Lm.kind, html: `<b class="v95ai-hit">${E(M("今日の AI の上限に達しました", "Today's AI limit has been reached"))}</b>${hasCap ? E(M(`（${cnt}・残り 0回）`, ` (${cnt}, 0 left)`)) : ""}${E(M("。", ". "))}${E(why)}${E(M("いまは内蔵エンジン（登録データと決まったルール）で答えます。毎日 0時（日本時間）にもどります。", " The built-in engine (your registered data and fixed rules) answers for now. It resets at midnight (JST)."))}` };
    }
    if (Lm && (Lm.kind === "rate" || Lm.kind === "prov")) {
      const head = Lm.kind === "rate"
        ? M("短い時間に続けて使ったため、AI を少し休ませています", "The AI is pausing because it was used many times in a short time")
        : M("AI の会社の側が混み合っています（HTTP 429）", "The AI provider is busy (HTTP 429)");
      const tail = Lm.kind === "rate" ? M("（1分あたりの上限）。1〜2分おいてから、もう一度お試しください。", " (per-minute limit). Please try again in 1–2 minutes.") : M("。数分おいてから、もう一度お試しください。", ". Please try again in a few minutes.");
      return { st: "wait", k: Lm.kind, html: `<b class="v95ai-hit">${E(head)}</b>${E(tail)}${hasCap ? E(M(`今日 ${F(used)}回／1日の上限 ${F(cap)}回・残り ${F(Math.max(0, cap - used))}回。`, ` ${F(used)} today / daily limit ${F(cap)}, ${F(Math.max(0, cap - used))} left.`)) : ""}` };
    }
    if (hasCap) {
      const left = Math.max(0, cap - used);
      return { st: "ok", k: "", html: E(M(`1日の上限 `, `Daily limit `)) + `<b>${E(M(`${F(cap)}回`, F(cap)))}</b>` + E(M(`（今日 ${F(used)}回・残り `, ` (today ${F(used)}, `)) + `<b>${E(M(`${F(left)}回`, `${F(left)} left`))}</b>` + E(M(`${tokPct != null ? `・利用量 ${tokPct}%` : ""}。STANDAGE の AI〔サーバー経由〕の上限で、毎日 0時〔日本時間〕にもどります）`, `${tokPct != null ? `, usage ${tokPct}%` : ""}; STANDAGE AI via the server; resets at midnight JST)`)) };
    }
    return { st: "none", k: "", html: E(M("上限：この接続では回数の上限はありません（月の上限は設けていません）", "No limit on this connection (there is no monthly limit)")) };
  }
  function howHtml() {
    const li = [
      M("「今月の質問」：AI商社マンに質問した回数です（画面の訳などは数えません）。", "“Questions this month”: how many times you asked the AI (screen translations etc. are not counted)."),
      M("「今日の回数」：同期サーバーが数える AI の処理の回数です。質問のほか、画面の訳・資料づくり・HSコードの判定など、AI を使う操作をすべて1回ずつ数えます（1つの質問で数回になることもあります）。共通のアカウントでは、使う人全員の合計です。", "“Today”: the number of AI operations counted by the sync server — questions plus screen translations, document drafting, HS code checks and every other AI operation, one each (a single question can use several). On a shared account it is everyone's total."),
      M("「今日の回数」は、AI を使うたびにこの画面で足し、2分ごとにサーバーの数に合わせ直します。", "“Today” goes up on this screen each time the AI is used, and is re-aligned with the server's count every 2 minutes."),
      M("回数のほかに、1日の利用量（AI に送る文字と答えの量）の上限もあります。長い資料を読ませると、回数が残っていても先に上限に届くことがあります。届いたときは、ここに「上限に達しました」と出ます。", "Besides the count, there is a daily usage limit (amount of text sent and returned). With long documents it can be reached while the count still has room; this box then shows “limit reached”.")
    ];
    return `<details class="v95ai-how" data-v95how="1"><summary>${E(M("回数の数え方（「今月の質問」と「今日の回数」のちがい）", "How the counts work (“questions this month” vs “today”)"))}</summary><ul>${li.map((x) => `<li>${E(x)}</li>`).join("")}</ul></details>`;
  }
  /* 今月の質問の数（v90goalQ）に、今効いている上限を足す */
  if (typeof v90goalQ === "function") {
    const __gq = v90goalQ;
    v90goalQ = function () {
      const Q = __gq.apply(this, arguments);
      try { if (Q) { const Lm = v95aiLimNow(); Q.v95lim = Lm; if (Lm && /^(cap|tok|all)$/.test(Lm.kind) && Q.cap != null) Q.left = 0; } } catch (e) { v95aiErr("gq", e); }
      return Q;
    };
  }
  if (typeof v90goalQHtml === "function") {
    const __gh = v90goalQHtml;
    v90goalQHtml = function () {
      try {
        const Q = v90goalQ();
        const d = (ts) => { const x = new Date(ts); return (x.getMonth() + 1) + "/" + x.getDate(); };
        const ln = limLine(Q.cap, Q.used);
        const head = M(`AI商社マンへの質問：今月 `, `Questions to the AI: `) ;
        const qn = `<b>${E(M(`${Q.n}回`, `${Q.n}`))}</b>`;
        const tail = M(`${Q.since ? `（${d(Q.since)} から数えています）` : ""}・これまでの合計 ${Q.total}回`, ` this month${Q.since ? ` (counted since ${d(Q.since)})` : ""} · ${Q.total} in total`);
        return `<div class="v90g-q v95ai-q" data-v90q="1" data-v95lim="${E(ln.st)}" data-v95k="${E(ln.k)}" role="note"><span class="v90g-qi" aria-hidden="true">💬</span><span class="v95ai-qb">${E(head)}${qn}${E(tail)}<br><span class="v88mute v95ai-line" data-v95line="1">${ln.html}</span>${howHtml()}</span></div>`;
      } catch (e) { v95aiErr("gh", e); return __gh.apply(this, arguments); }
    };
  }
  /* 刷新前の画面の「🔢 AI の利用」の行（刷新版では隠れているが、同じ内容にそろえる） */
  if (typeof v82shpCapHtml === "function") {
    const __ch = v82shpCapHtml;
    v82shpCapHtml = function () {
      const h = __ch.apply(this, arguments);
      try {
        const Lm = v95aiLimNow(), l = srv();
        if (!Lm || !l) return h;
        const ln = limLine(+l.cap || 0, +l.used || 0);
        const txt = M("🔢 AI の利用（STANDAGE の AI）：", "🔢 AI use (STANDAGE AI): ") + String(ln.html).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        return h.replace(/data-v82cap="[^"]*"/, `data-v82cap="lim"`).replace(/>[^<]*<\/p>$/, `>${E(txt)}</p>`);
      } catch (e) { v95aiErr("ch", e); return h; }
    };
  }
  /* 上限のバナー（v92ai）：カウンタと同じ数を1行そえる */
  if (typeof v92aiBarHtml === "function") {
    const __bh = v92aiBarHtml;
    v92aiBarHtml = function (Lb) {
      let h = __bh.apply(this, arguments);
      try {
        const Lm = v95aiLimNow(), l = srv();
        if (!l || !(+l.cap > 0)) return h;
        const cap = +l.cap, used = +l.used || 0;
        let t = "";
        if (Lm && Lm.kind === "tok") t = M(`AI の利用：今日 ${F(used)}回（1日の回数の上限 ${F(cap)}回）。回数の前に、1日の利用量の上限に届きました。`, `AI use: ${F(used)} today (daily count limit ${F(cap)}). The daily usage limit was reached before the count limit.`);
        else if (Lm && (Lm.kind === "cap" || Lm.kind === "all")) t = M(`AI の利用：今日 ${F(used)}回（1日の回数の上限 ${F(cap)}回）・残り 0回。`, `AI use: ${F(used)} today (daily limit ${F(cap)}), 0 left.`);
        else if (Lm && Lm.kind === "rate") t = M(`AI の利用：今日 ${F(used)}回／1日の上限 ${F(cap)}回（1日の上限ではなく、1分あたりの上限です）。`, `AI use: ${F(used)} today / daily limit ${F(cap)} (this is the per-minute limit, not the daily one).`);
        if (t) h = h.replace(/(<div class="v92ai-bb"><p>[\s\S]*?<\/p>)/, `$1<p class="v95ai-barn" data-v95bar="1">${E(t)}</p>`);
      } catch (e) { v95aiErr("bh", e); }
      return h;
    };
  }
  /* 状態が変わったら描き直す */
  window.v95aiPaint = function () {
    try {
      if (typeof cur !== "undefined" && cur === "ai") {
        if (typeof v90goalQPut === "function") v90goalQPut();
        if (typeof v82shpCapPaint === "function") v82shpCapPaint();
      }
      const b = document.getElementById("v92aiLim");
      if (b) { delete b.dataset.k; if (typeof v92aiBarPut === "function") v92aiBarPut(); }
    } catch (e) { v95aiErr("paint", e); }
  };

  /* ── No.502：管理者の確認コードの期限（欄の下に時刻と残り） ── */
  const hm = (ms) => { const x = new Date(ms); return String(x.getHours()).padStart(2, "0") + ":" + String(x.getMinutes()).padStart(2, "0"); };
  const ms = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  function otpTick() {
    try {
      const o = V95AI.otp;
      let p = document.getElementById("v95aiOtpT");
      const inp = o ? document.getElementById(o.el) : null;
      if (!o || !inp) { if (p) p.remove(); return; }
      const end = o.at + o.ttl * 1000, left = Math.max(0, Math.round((end - Date.now()) / 1000)), dead = o.dead || left <= 0;
      if (!p) { p = document.createElement("p"); p.id = "v95aiOtpT"; p.className = "v95ai-otpt"; p.setAttribute("role", "status"); p.setAttribute("data-noi18n", ""); }
      const anchor = (o.el === "ad-otp" && document.getElementById("ad-otpto")) || inp;
      if (p.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", p);
      const n = Math.round(o.ttl / 60);
      const resend = o.kind === "master" ? M("「確認コードを送り直す」", "“Resend the code”") : M("「コードを送り直す」", "“Resend code”");
      p.dataset.st = dead ? "dead" : "live";
      p.textContent = dead
        ? M(`確認コードの有効期限（${hm(end)}）が過ぎました。${resend}を押して、新しいコードを受け取ってください（パスワードは入れ直さなくてかまいません）。`, `The code expired at ${hm(end)}. Press ${resend} to get a new code (no need to re-enter the password).`)
        : M(`確認コードの有効期限：${hm(end)} まで（あと ${ms(left)}）。サーバーがメールを送った時刻から ${n}分です。メールが遅れて届いたときや期限が切れたときは、${resend}を押してください。`, `Code valid until ${hm(end)} (${ms(left)} left) — ${n} minutes from when the server sent the email. If the email arrives late or the code expires, press ${resend}.`);
    } catch (e) { v95aiErr("otpT", e); }
  }
  setInterval(() => { if (V95AI.otp || document.getElementById("v95aiOtpT")) otpTick(); }, 1000);
  if (typeof v42ShowOtp === "function") {
    const __so = v42ShowOtp;
    v42ShowOtp = function () { const r = __so.apply(this, arguments); setTimeout(otpTick, 0); return r; };
  }

  /* 管理者の入口の「ログインの安全の決まり」：確認コードの期限を、会社の管理者（10分）と STANDAGE の管理者（今の同期サーバーは5分）に分けて書く */
  function admR2() {
    const n = Math.round(v95aiAdmTtl() / 60);
    return {
      ja: `確認コード（6桁）：メールに届くコードを入れます。会社の管理者（メールアドレスとパスワードでのログイン）のコードは10分間、STANDAGE の管理者（管理者 ID でのログイン）のコードは${n}分間有効です（サーバーがメールを送った時刻から数えます）。5回まちがえると使えなくなります（送り直しは1時間に5通まで）。`,
      en: `Verification code (6 digits): enter the code sent by email. For company administrators (email and password) it is valid for 10 minutes; for the STANDAGE administrator (admin ID) it is valid for ${n} minutes, counted from when the server sent the email. It stops working after 5 wrong entries (up to 5 codes per hour).`,
      zh: `验证码（6位）：输入邮件收到的验证码。公司管理员（邮箱和密码登录）的验证码10分钟内有效，STANDAGE 管理员（管理员 ID 登录）的验证码${n}分钟内有效（从服务器发送邮件时起计算）。输错5次即失效（每小时最多重发5封）。`,
      es: `Código de verificación (6 dígitos): introduzca el código recibido por correo. Para administradores de empresa (correo y contraseña) es válido 10 minutos; para el administrador de STANDAGE (ID de administrador), ${n} minutos desde que el servidor envió el correo. Deja de funcionar tras 5 errores (hasta 5 códigos por hora).`
    };
  }
  if (typeof v80admRuleHtml === "function" && typeof V80ADM_T !== "undefined") {
    const __rh = v80admRuleHtml;
    v80admRuleHtml = function (id) {
      let h = __rh.apply(this, arguments);
      try {
        if (id === "v80lgRuleA") {
          const old = v80admE(v80admL(V80ADM_T.r2)), neu = v80admE(v80admL(admR2()));
          h = h.replace(`<li>${old}</li>`, `<li data-v95r2="1">${neu}</li>`);
        }
      } catch (e) { v95aiErr("rule", e); }
      return h;
    };
    try { const r = document.getElementById("v80lgRuleA"); if (r && typeof v80admLgPaint === "function") { r.remove(); v80admLgPaint(); } } catch (e) { v95aiErr("rule0", e); }
  }
})();
