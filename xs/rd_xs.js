/* 貿易クラウドAI商社マン デザイン刷新：STANDAGE のサービスの提案（xs の層・2026-11-22 大森さん）
   ① ホーム・今日やること・AIに相談：AI商社マンからの提案カード（1度に1つ・いまの段階に合うもの・理由つき）
   ② 新しい画面「STANDAGE のサービス」（すべての機能のホーム）：いまのおすすめ3つ＋7つのステップごとの全メニュー＋相談の記録
   ③ 関係する画面（規制・国・商品・資料・開拓・商談・案件・書類・出荷・契約書）の見出しの下に、その画面に合うサービスを1行だけ
   作り：中身（メニュー・出す条件・記録・相談）はアプリの層 logic_xs.js（window.XS）。ここは見せ方だけ。
   onclick= と style= は書かない（イベントは addEventListener・CSP）。金額は出さない。 */
(function () {
  "use strict";
  const RD = window.RDX, X = window.XS;
  if (!RD || !X || RD._xs) return;
  RD._xs = 1;
  const { $, $$, esc } = RD;
  const I = (n, sz, sw) => (RD.I ? RD.I(n, sz, sw) : "");
  try { if (RD.P && !RD.P.xsh) RD.P.xsh = '<path d="M7 11l3-3 3 2 4-4"/><path d="M3 12l4-4 3 2"/><path d="M14 16l2 2 4-4M5 14l4 4 2-2"/><path d="M11 18l1 1"/>'; } catch (e) { /* 無い版 */ }
  /* 今のアプリの大域の名前（RD.G は決まった名前しか読まないので、ここで読む） */
  const G = (n) => {
    try {
      switch (n) {
        case "PID": return typeof PID !== "undefined" ? PID : undefined; // eslint-disable-line no-undef
        case "PAGES": return typeof PAGES !== "undefined" ? PAGES : undefined; // eslint-disable-line no-undef
        case "TENS": return typeof TENS !== "undefined" ? TENS : undefined; // eslint-disable-line no-undef
        case "TEN": return typeof TEN !== "undefined" ? TEN : undefined; // eslint-disable-line no-undef
        case "SES": return typeof SES !== "undefined" ? SES : undefined; // eslint-disable-line no-undef
        case "cur": return typeof cur !== "undefined" ? cur : undefined; // eslint-disable-line no-undef
      }
    } catch (e) { /* 無い版 */ }
    return undefined;
  };
  const jny = () => { try { return RD.jnyNow ? RD.jnyNow() : (RD._jny || null); } catch (e) { return RD._jny || null; } }; // 商品を切り替えた直後でも古い控え（RD._jny）を使わない
  const shipper = () => { try { const S = G("SES"); return !RD.locked() && !RD.isFwd() && !(S && S.t === "admin") && !!G("PID"); } catch (e) { return false; } };
  const TAG = { "改訂中": ["改訂中のメニュー", "gy"] };
  const stTag = (m) => (m.on === "stop" ? '<span class="rd-tag gy">運用停止中</span>' : m.on === "soon" ? '<span class="rd-tag bl">準備中</span>' : "") + (m.src && TAG[m.src] ? `<span class="rd-tag ${TAG[m.src][1]}" title="クロスセルメニュー表の改訂中のシートにある項目です">${TAG[m.src][0]}</span>` : "");
  const askTag = (a) => !a ? "" : a.st === "sent" ? '<span class="rd-tag gr">相談済み</span>' : a.st === "trial" ? '<span class="rd-tag gy">相談の記録（体験用）</span>' : a.st === "unsent" ? '<span class="rd-tag rd">未送信</span>' : "";
  const md = (t) => { const d = new Date(t || Date.now()); return (d.getMonth() + 1) + "/" + d.getDate(); };

  /* ───── 画面の登録（今のアプリの PAGES と描き直し・刷新版のメニュー） ───── */
  const PG = { id: "xs", ly: "⑤", nm: "STANDAGE のサービス", grp: "ホーム", nw: 1, ic: '<path d="M7 11l3-3 3 2 4-4"/><path d="M3 12l4-4 3 2"/><path d="M14 16l2 2 4-4M5 14l4 4 2-2"/>' };
  try {
    const P = G("PAGES");
    if (Array.isArray(P) && !P.some((p) => p.id === "xs")) { const i = P.findIndex((p) => p.id === "rm"); const t = P.find((p) => p.id === "today"); P.splice(i >= 0 ? i + 1 : P.length, 0, Object.assign({}, PG, { grp: (t && t.grp) || PG.grp })); }
  } catch (e) { /* 無い版 */ }
  (function nav() {
    const N = RD.NAV_S; if (!Array.isArray(N)) return;
    const g = N.find((x) => x.items && x.items.some((it) => it[0] === "today")) || N[0];
    if (!g || g.items.some((it) => it[0] === "xs")) return;
    let i = g.items.findIndex((it) => it[0] === "rm"); if (i < 0) i = g.items.findIndex((it) => it[0] === "today");
    g.items.splice(i >= 0 ? i + 1 : g.items.length, 0, ["xs", "STANDAGE のサービス", "xsh"]);
    try { if (typeof RD.buildSide === "function") RD.buildSide(); } catch (e) { /* 次の画面で */ }
  })();
  try {
    const r0 = window.render;
    if (typeof r0 === "function" && !r0._xs) {
      const r1 = function () {
        try {
          if (G("cur") === "xs") {
            if (!G("PID")) { try { cur = "up"; } catch (e) { /* 無い版 */ } return r0.apply(this, arguments); } // eslint-disable-line no-undef
            try { document.body.classList.remove("dashv"); } catch (e) { /* 無視 */ }
            const w = document.getElementById("well");
            if (w) w.innerHTML = pageHtml();
            return;
          }
        } catch (e) { console.error("[xs] render", e); }
        return r0.apply(this, arguments);
      };
      r1._xs = 1;
      window.render = r1;
      try { render = r1; } catch (e) { /* 宣言の無い版 */ } // eslint-disable-line no-undef
    }
  } catch (e) { /* 無い版 */ }

  /* ───── 部品 ───── */
  function btns(m, pid, opt) {
    opt = opt || {};
    const b = [];
    if (m.on !== "stop") b.push(`<button type="button" class="rd-btn${opt.quiet ? " ghost k-xsb2" : " k-xsb1"}" data-xs="ask" data-xm="${esc(m.id)}"${pid ? ` data-xp="${esc(pid)}"` : ""}>${m.on === "soon" ? "話を聞く" : "STANDAGE に相談する"}</button>`);
    if (m.self) b.push(`<button type="button" class="rd-btn ghost k-xsb2" data-xs="self" data-xm="${esc(m.id)}"${pid ? ` data-xp="${esc(pid)}"` : ""}>${esc(m.self[1])}</button>`);
    if (opt.more) b.push(`<button type="button" class="k-xslink" data-xs="more" data-xm="${esc(m.id)}">くわしく</button>`);
    if (pid) b.push(`<button type="button" class="k-xslink" data-xs="later" data-xp="${esc(pid)}">あとで</button><button type="button" class="k-xslink" data-xs="no" data-xp="${esc(pid)}">今は要らない</button>`);
    return `<div class="k-xsbtns">${b.join("")}</div>`;
  }
  // 22.01.2 の検証 x1-2：用語の印（点線の言葉）を付けない＝読み上げで「EPA」「関税」などが抜けて文が壊れない（data-noterm＝今のアプリの印・k-termhint＝刷新版の印）
  const NOTERM = 'data-noterm=""';
  function cardHtml(p, compact) {
    const m = X.item(p.m); if (!m) return "";
    // 22.01.2 の検証 x1-1：目標と道筋の「AI商社マンからの提案」と見分けがつくように、名前を「STANDAGE のサービスの提案」に。段階はそのサービスが合う段階（前の段階の抜けなら「抜け」）
    return `<section class="rd-x k-xs k-termhint${compact ? " k-xs--c" : ""}" ${NOTERM} data-xsc="${esc(p.id)}" aria-label="STANDAGE のサービスの提案">
      <div class="k-xsh"><span class="k-xsbadge">${I("bulb", 16)}STANDAGE のサービスの提案</span><span class="k-xsmeta">STEP ${String(p.step).padStart(2, "0")} ${esc(X.step[p.step] || "")}${p.gap ? "（抜け）" : ""}・AI商社マンが選びました・${md(p.at)}</span></div>
      <h3 class="k-xst">${esc(m.nm)}</h3>
      <p class="k-xswhy">${esc(p.why)}</p>
      <p class="k-xsone">${esc(m.one)}<span class="k-xsteam">（${esc(m.team)}）</span></p>
      ${btns(m, p.id, { more: 1 })}
      <div class="k-xsform" data-xsf="${esc(m.id)}" hidden></div>
    </section>`;
  }

  /* ───── ① 提案カード ───── */
  function putCard(w) {
    if (!w || !shipper()) return;
    $$(".k-xs[data-xsc]", w).forEach((x) => x.remove());
    let p = null; try { p = X.now(jny()); } catch (e) { console.error("[xs] now", e); p = null; }
    if (!p) return;
    // 目標と道筋の提案カードが同じ画面にあるときは、短い形（中身の説明の行を省く）で1枚に見えすぎないように
    const html = cardHtml(p, !!$(".k-rm88 .v88prop", w)); if (!html) return;
    const after = $(".k-rm88", w) || $("[data-rdhero]", w);
    if (after) after.insertAdjacentHTML("afterend", html); else w.insertAdjacentHTML("afterbegin", html);
    if (p.st === "new") { p.st = "seen"; X.save(); }
  }

  /* ───── ③ 画面ごとの1行 ───── */
  const CTX = {
    "ops:reg": ["cs_ttb", "rg_fda", "rg_pif", "rg_ce", "rg_survey", "rg_nutri", "rg_sds", "rg_frag", "c_pkg", "tm_search"],
    cty: ["tm_search", "c_logo"], item: ["c_photo", "tm_ip", "c_logo"], up: ["c_photo"],
    deck: ["c_photo", "c_lp", "c_catalog", "c_pkg", "tm_apply"],
    db: ["ex", "c_ads", "lc_red", "lc_shopee", "dg_shopee", "cf", "c_ig", "cs_pr", "dg_amazon", "c_lp"],
    deal: ["fn_trade", "fn_logi", "lg_coo", "fn_pay", "tm_apply"], "dash:case": ["fn_trade", "fn_logi", "lg_coo", "fn_pay"],
    msg: ["fn_trade", "fn_logi"], "ops:doc": ["lg_coo", "rg_sds", "fn_logi"], "ops:ship": ["fn_logi", "lg_coo"], ship: ["fn_logi", "lg_coo"],
    "ops:ord": ["fn_pay", "fn_trade"], legal: ["fn_trade", "fn_pay", "tm_apply"], "dash:rep": ["tm_guard", "c_ig", "cs_pr"],
  };
  function putLine(w, k) {
    if (!w || !shipper()) return;
    $$(".k-xsl", w).forEach((x) => x.remove());
    const ids = CTX[k]; if (!ids) return;
    const R = X.rec(); const t = Date.now();
    if (R.ctxNo && R.ctxNo[k] > t) return;
    let L = []; try { L = X.rank(jny()).list; } catch (e) { L = []; }
    const x = L.filter((y) => ids.indexOf(y.m.id) >= 0 && !y.asked && !(R.no[y.m.id] && R.no[y.m.id].until > t)).sort((a, b) => ids.indexOf(a.m.id) - ids.indexOf(b.m.id) || b.w - a.w)[0];
    if (!x) return;
    const html = `<div class="rd-x k-xsl k-termhint" ${NOTERM} data-xsl="${esc(k)}"><span class="k-xsli">${I("bulb", 18)}</span><span class="k-xslt"><b>STANDAGE に頼めます：${esc(x.m.nm)}</b><span>${esc(x.why)}</span></span>
      <span class="k-xslb"><button type="button" class="rd-btn ghost k-xsb2" data-xs="ask" data-xm="${esc(x.m.id)}">相談する</button><button type="button" class="k-xslink" data-xs="more" data-xm="${esc(x.m.id)}">ほかのサービス</button><button type="button" class="k-xsx" data-xs="ctxno" data-xk="${esc(k)}" aria-label="この画面では14日出さない" title="この画面では14日出さない">${I("x", 16) || "×"}</button></span>
      <div class="k-xsform" data-xsf="${esc(x.m.id)}" hidden></div></div>`;
    const hero = $("[data-rdhero]", w);
    if (hero) hero.insertAdjacentHTML("afterend", html); else w.insertAdjacentHTML("afterbegin", html);
  }

  /* ───── ② STANDAGE のサービスの画面 ───── */
  function pageHtml() {
    const J = jny();
    let rk = { c: { step: 1 }, list: [] }; try { rk = X.rank(J); } catch (e) { console.error("[xs] rank", e); }
    const c = rk.c, step = c.step || 1;
    const R = X.rec(); const t = Date.now();
    const av = X.avail(rk.list, R, t); // ホームのカードと同じ並び（相談済み・今は要らないを除く）
    const top = av.slice(0, 3);
    const recIds = av.slice(0, 6).map((x) => x.m.id);
    const whyOf = (id) => { const x = rk.list.find((y) => y.m.id === id); return x ? x.why : ""; };
    const askOf = (id) => R.asks.find((a) => a && a.m === id) || null;
    const row = (m, rec, quiet) => {
      const a = askOf(m.id);
      return `<li class="k-xsr${rec ? " rec" : ""}${m.on === "stop" ? " off" : ""}" data-xsr="${esc(m.id)}">
        <div class="k-xsrh"><b>${esc(m.nm)}</b>${rec ? '<span class="rd-tag or">おすすめ</span>' : ""}${askTag(a)}${stTag(m)}<span class="k-xsteam">${esc(m.team)}</span></div>
        <p>${esc(m.one)}</p>
        ${rec && whyOf(m.id) ? `<p class="k-xswhy">${esc(whyOf(m.id))}</p>` : ""}
        <details class="k-xsplans"><summary>メニューの中身（${m.plans.length}）</summary><ul>${m.plans.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><p class="rd-note">金額は、内容を伺って担当からお見積りします。</p></details>
        ${m.on === "stop" ? "" : btns(m, "", { quiet })}
        <div class="k-xsform" data-xsf="${esc(m.id)}" hidden></div></li>`;
    };
    const seen = {};
    const steps = [1, 2, 3, 4, 5, 6, 7].map((n) => {
      const L = X.menu.filter((m) => m.st[0] === n && !seen[m.id]);
      L.forEach((m) => { seen[m.id] = 1; });
      const nRec = L.filter((m) => recIds.indexOf(m.id) >= 0).length;
      return `<details class="k-xsstep${n === step ? " now" : ""}"${n === step ? " open" : ""}><summary><span class="k-xsno">STEP ${String(n).padStart(2, "0")}</span><b>${esc(X.step[n])}</b>${n === step ? '<span class="rd-tag or">いまここ</span>' : ""}<span class="k-xscnt">${L.length}件${nRec ? `・おすすめ ${nRec}` : ""}</span></summary>
        <ul class="k-xsl2">${L.map((m) => row(m, recIds.indexOf(m.id) >= 0, 1)).join("") || '<li class="rd-note">この段階で頼めるサービスは、前の段階の一覧にあります。</li>'}</ul></details>`;
    }).join("");
    const asks = X.asks();
    const stNm = { sent: "STANDAGE に届けました", trial: "体験用のアカウントのため届けていません（記録だけ）", unsent: "まだ届いていません", draft: "下書き" };
    return `<section class="rd-x k-xspage k-termhint" ${NOTERM}>
      <div class="rd-card k-xstop"><div class="k-xsh"><span class="k-xsbadge">${I("bulb", 16)}いまのおすすめ</span><span class="k-xsmeta">STEP ${String(step).padStart(2, "0")} ${esc(X.step[step] || "")}・${esc(c.item || "商品が未登録")}${c.ctyNm && c.ctyNm.length ? "・" + esc(c.ctyNm.join("・")) : ""}</span></div>
        ${top.length ? `<ul class="k-xsl2">${top.map((x) => row(x.m, true)).join("")}</ul>` : '<p class="k-xsone">いまの段階でおすすめできるサービスはありません。下の一覧から、いつでも相談できます。</p>'}
        <p class="rd-note">おすすめは、貿易ジャーニーの現在地・商材・販売先国・商談の進み・目標（目的・販路）から AI商社マンが選んでいます。理由はお客様のデータだけから書いています。</p></div>
      <h2 class="k-xsh2">段階ごとの STANDAGE のサービス（全${X.menu.length}件）</h2>
      ${steps}
      <div class="rd-card k-xsasks"><h2 class="k-xsh2">相談の記録</h2>${asks.length ? `<ul class="k-xsal">${asks.map((a) => { const m = X.item(a.m); return `<li><b>${esc(m ? m.nm : a.m)}</b><span class="k-xsmeta">${md(a.upd || a.at)}・${esc(stNm[a.st] || a.st)}${a.sid ? `・受付番号 ${esc(a.sid)}` : ""}</span>${a.note ? `<span class="k-xsmeta">ひとこと：${esc(a.note)}</span>` : ""}${a.st === "unsent" ? `<button type="button" class="k-xslink" data-xs="ask" data-xm="${esc(a.m)}">もう一度送る</button>` : ""}</li>`; }).join("")}</ul>` : '<p class="k-xsone">まだ相談はありません。</p>'}
        <p class="rd-note">メニューは STANDAGE のクロスセルメニュー表（2026年11月時点）から載せています。金額はこの画面には載せず、内容を伺って担当からお見積りします。</p></div>
    </section>`;
  }
  RD.page.xs = (function (p0) {
    return (w, k) => {
      if (p0) p0(w, k);
      const h = $("[data-rdhero]", w);
      if (h) { const h1 = $(".rd-ht h1", h), pp = $(".rd-ht p", h); if (h1) h1.textContent = "STANDAGE のサービス"; if (pp) pp.textContent = "いまの段階に合う STANDAGE のサービス（規制・商標・撮影と発信・販路・展示会・物流・商社・決済）を、AI商社マンが理由つきでおすすめします。気になるものは、その場で担当に相談できます。"; }
      if (RD._xsHit) { const id = RD._xsHit; RD._xsHit = ""; setTimeout(() => hit(id), 120); }
    };
  })(RD.page.xs);
  function hit(id) {
    const el = $(`[data-xsr="${CSS.escape(id)}"]`, $("#well")); if (!el) return;
    const d = el.closest("details"); if (d) d.open = true;
    try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { el.scrollIntoView(); }
    el.classList.remove("k-xshit"); void el.offsetWidth; el.classList.add("k-xshit"); setTimeout(() => el.classList.remove("k-xshit"), 3200);
  }

  /* ───── 相談の窓（カード・行・1行の中に開く） ───── */
  function openForm(btn) {
    const id = btn.dataset.xm, m = X.item(id); if (!m) return;
    const host = btn.closest("[data-xsc],[data-xsr],[data-xsl]") || btn.parentNode;
    const f = $(`[data-xsf="${CSS.escape(id)}"]`, host); if (!f) return;
    if (!f.hidden && f.dataset.st === "form") { f.hidden = true; return; }
    let c = null; try { c = X.ctx(jny()); } catch (e) { c = null; }
    const txt = c ? X.text(m, c, "") : m.nm;
    f.dataset.st = "form"; f.dataset.xp = btn.dataset.xp || "";
    f.innerHTML = `<p class="k-xsft"><b>${m.on === "soon" ? "準備中のサービスです。STANDAGE の担当に、話を聞きたいことを届けます" : "STANDAGE の担当に、次の内容で届けます"}</b></p>
      <pre class="k-xsq">${esc(txt)}</pre>
      <label class="k-xsfl">ひとこと（任意・400字まで）<textarea maxlength="400" rows="3" placeholder="例：来年3月の展示会までに間に合わせたい／まず費用の目安を知りたい"></textarea></label>
      <div class="k-xsbtns"><button type="button" class="rd-btn k-xsb1" data-xs="send" data-xm="${esc(id)}">STANDAGE に送る</button><button type="button" class="k-xslink" data-xs="cancel">やめる</button></div>
      <p class="rd-note">届けるのは上の内容とひとことだけです（商品の資料・商談の中身は送りません）。金額は担当からお見積りします。</p>`;
    f.hidden = false;
    const ta = $("textarea", f); if (ta) try { ta.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }
  async function send(btn) {
    const id = btn.dataset.xm; const f = btn.closest(".k-xsform"); if (!f || X.busy[id]) return;
    const note = ($("textarea", f) || {}).value || "";
    X.busy[id] = 1; btn.disabled = true; btn.textContent = "送っています…";
    let r = null; try { r = await X.consult(id, note, f.dataset.xp || ""); } catch (e) { r = { ok: false, st: "unsent", reason: "net" }; }
    X.busy[id] = 0;
    f.dataset.st = "done";
    const copy = r && r.text ? `<pre class="k-xsq">${esc(r.text)}</pre><div class="k-xsbtns"><button type="button" class="rd-btn ghost k-xsb2" data-xs="copy">文をコピー</button>${r.reason === "net" ? `<button type="button" class="k-xslink" data-xs="ask" data-xm="${esc(id)}">もう一度送る</button>` : ""}</div>` : "";
    if (r && r.st === "sent") f.innerHTML = `<p class="k-xsok">${I("check", 18)}<b>STANDAGE の担当に届けました${r.ask && r.ask.sid ? `（受付番号 ${esc(r.ask.sid)}）` : ""}。</b>担当からご連絡します。</p>`;
    else if (r && r.st === "trial") f.innerHTML = `<p class="k-xsok">${I("check", 18)}<b>相談の記録を残しました。</b>体験用のアカウントのため、STANDAGE には届けていません。ご契約のアカウントでは、ここから担当に届きます。</p>`;
    else if (r && r.reason === "old") f.innerHTML = `<p class="k-xsng"><b>いまは、この画面から STANDAGE に届けられません</b>（同期サーバーの更新待ち）。お手数ですが、下の文をコピーして担当の CS にお伝えください。</p>${copy}`;
    else f.innerHTML = `<p class="k-xsng"><b>送れませんでした</b>（${r && r.reason === "nosync" ? "クラウド同期が無い環境" : "通信の失敗"}）。もう一度お試しいただくか、下の文をコピーして担当にお伝えください。</p>${copy}`;
    refreshSoon();
  }
  function refreshSoon() { // カードは答えたら消える（次の提案は頻度の間をあけて）。一覧の画面は記録を描き直す
    setTimeout(() => {
      try {
        const k = RD.curKey && RD.curKey(); const w = $("#well");
        if (k === "xs" && w) { const open = $$(".k-xsform:not([hidden])", w).length; if (!open) w.innerHTML = pageHtml(); }
      } catch (e) { /* 無視 */ }
    }, 4000);
  }
  function goSelf(m, pid) {
    if (pid) X.answer(pid, "self");
    const k = m.self[0];
    if (k === "case") {
      try {
        const T = G("TEN") || {}; const TS = G("TENS") || [];
        const ORD = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5 };
        const L = Object.values(T.dmThreads || {}).filter((th) => th && Array.isArray(th.msgs));
        const o = (th) => { const s = RD.stShort ? RD.stShort(th.status) : String(th.status || ""); return ORD[s] == null ? 0 : ORD[s]; };
        const b = L.sort((a, c) => o(c) - o(a))[0];
        if (b && RD.openCase) { RD.openCase(TS.indexOf(T) + "|" + b.id); return; }
      } catch (e) { /* 無い版 */ }
      RD.goKey("deal"); return;
    }
    RD.goKey(k);
  }

  /* ───── 押したとき（1か所で受ける） ───── */
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-xs]");
    if (!b || !b.closest("#well")) return;
    const a = b.dataset.xs, m = b.dataset.xm ? X.item(b.dataset.xm) : null, pid = b.dataset.xp || "";
    try {
      if (a === "ask") return openForm(b);
      if (a === "send") return void send(b);
      if (a === "cancel") { const f = b.closest(".k-xsform"); if (f) f.hidden = true; return; }
      if (a === "copy") { const q = b.closest(".k-xsform") && $(".k-xsq", b.closest(".k-xsform")); const s = q ? q.textContent : ""; const done = () => { b.textContent = "コピーしました"; }; try { navigator.clipboard.writeText(s).then(done, () => { selectText(q); }); } catch (x) { selectText(q); } return; }
      if (a === "self" && m) return goSelf(m, pid);
      if (a === "more" && m) { RD._xsHit = m.id; if (RD.curKey && RD.curKey() === "xs") { RD._xsHit = ""; hit(m.id); } else RD.goKey("xs"); return; }
      if (a === "later" || a === "no") {
        X.answer(pid, a);
        const c = b.closest("[data-xsc]");
        if (c) c.outerHTML = `<p class="rd-x k-xsdone">${a === "later" ? "3日後にもう一度お知らせします。" : "この提案は今後しばらく出しません。「STANDAGE のサービス」の画面から、いつでも相談できます。"}</p>`;
        return;
      }
      if (a === "ctxno") { const R = X.rec(); R.ctxNo = R.ctxNo || {}; R.ctxNo[b.dataset.xk] = Date.now() + 14 * 864e5; X.save(); const l = b.closest(".k-xsl"); if (l) l.remove(); return; }
    } catch (x) { console.error("[xs] click", x); }
  });
  function selectText(el) { try { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { /* 無視 */ } }

  /* ───── 画面ごとにつなぐ ───── */
  const chain = (k, fn) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { fn(w, kk); } catch (e) { console.error("[rd] xs " + k, e); } }; };
  ["dash:home", "today", "ai"].forEach((k) => chain(k, (w) => putCard(w)));
  Object.keys(CTX).forEach((k) => chain(k, (w, kk) => putLine(w, kk || k)));
  // 目標と道筋の提案に答えて刷新版のホームの帯が描き直されたとき、カードも描き直す
  try {
    const r0 = window.v88Repaint;
    if (typeof r0 === "function" && !r0._xs) {
      const r1 = function () { const r = r0.apply(this, arguments); try { const k = RD.curKey && RD.curKey(); const w = $("#well"); if ((k === "dash:home" || k === "today" || k === "ai") && w && !$(".k-xs .k-xsform:not([hidden])", w)) putCard(w); } catch (e) { /* 無視 */ } return r; };
      r1._xs = 1; window.v88Repaint = r1;
    }
  } catch (e) { /* 無い版 */ }
})();
