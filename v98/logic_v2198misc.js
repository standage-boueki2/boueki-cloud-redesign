/* ═══ 21.98 分野 misc（2026-11-18 第11回相当 UAT・21.97.2）No.530・515・520・526 ═══
   土台・前の層（rd/・v95/・v96/・v97/）は書き換えず、前の関数を控えてから包む。同期サーバー（GAS）は変えない。
   ・No.530（未解消）取り込みの %（商品情報の項目の数÷21）と、貿易の旅程の全体 %（7ステップの平均）が違う
     原因：rd_v94jny の「全体 N%」は7ステップの % の平均（STEP 01＝商品情報の充足はその1つ）。商品情報の画面・登録の画面の輪と札は
           「全体 c/d」（21項目のうち入っている数）。同じ「全体」という言葉で別の数が並び、21/21（100%）の商品で全体 49% と出ても理由が画面に無かった。
     直し：ここ（データ）＝21.96 の札の文「全体 c/d・必須 a/b」の「全体」を「全項目」に（v96pStat・v96pNotFull）。
           画面（rd_v98misc.js）＝旅程の「全体」を「貿易の旅程 全体 N%（7ステップの平均）」にし、7ステップの内訳と、取り込みの % との違いを1行で出す。
           輪の見出しを「商品情報の充足度」にそろえ、「旅程の STEP 01 の数・旅程の全体は N%」を添える。ホームの「AI商社マンの成長」の札の言葉を見せる。
   ・No.515（条件つき）AI の上限（429）が起きること自体を減らす（AI の回数は増やさない。待たせる・順番を変えるだけ）
     原因：AI の呼び出しの経路は、画像・Web 検索・ふだんの依頼のどれも Gemini が1番目（llmRoute）。429 のあとも同じエンジンを選び続け、
           規制の AI 詳細調査の調べ直し（21.97）は「2回目は同じエンジン」を4秒後に頼むので、同じ 429 が続いた。本体の自動の切り替えは、
           Web 検索が要る依頼でも Web 検索のできない ChatGPT を先に試し（Web 検索なしの答え＝失敗扱い）、もう1回分の待ちが増えた。
           自動で走る AI（写真の確認・今日やることの自動の調査・提案・交渉の判定）は、利用者が押した重い依頼の最中でも同時に走っていた。同時の本数の上限も無かった。
     直し：① 429・混雑（529・overload）を返したエンジンは、しばらく（1分→2分→最長5分）後回し（llmActive の並び・llmRoute の選び先・調べ直しの選び先）。
           ② Web 検索が要る依頼は、いま走っている本数が少ない、後回しになっていない Web 検索のできるエンジンを選び、自動の切り替えも Web 検索のできるエンジンを先に。
           ③ 利用者の Web 検索の依頼は、Web 検索のできるエンジンの数（後回しを除く）より多くは同時に走らせない（順番を待つ・最長45秒）。
           ④ 自動で走る AI は、利用者の重い依頼が走っている間と、同期サーバーが「1分あたりの上限」を返した直後は待つ（最長60〜120秒・そのあとは走る）。
   ・No.520（条件つき）COURIER の日数の目安が出ない行
     原因：① 21.97 の国の読み方（v97fCty）が語末の「港」を外すため「香港」が「香」になり、地域の目安の表に当たらなかった。
           ② 21.96 の版で作られた見積（印 ttMaybe だけ）は、会社名の無いレートの写しで判定していたため目安が出なかった。
           ③ 表に無い国・地域（ロシア・モンゴルなど）や、書き方の揺れ（HK・SG・ヨーロッパ・米国本土・LA（アメリカ））は「約10日（既定値かも）」のまま。
     直し：① 香港・マカオは国の名前のまま。かっこの中の国・よくある略号・地域の名前（欧州・東南アジアなど）を、21.97 の地域の表の同じ行に当てる（新しい日数は足さない）。
           ② 印のある前の見積は、同じ会社のレートを探して目安を出す。
           ③ それでも目安が無い COURIER の既定値は、「10日」と書かず「日数は要確認（物流会社に確認）」と出す（見積・比べる表・AI の答え・受信箱・レート管理・AI の文脈）。
   ・No.526（未解消）Ver1.0 の内容学習の基準日：荷主の画面で基準日を出している所（AI商社マンの「参照している情報」・全社版の札・国のページ・
     内蔵の答えの根拠・AI の文脈）に、最後に取り込んだ日・まだ届いていない週・次の予定を1行で出す（週次の取り込み自体は同期サーバー側のため、ここでは直さない）。 */
var V98MISC = window.V98MISC = { v: "21.98", err: null, errs: [], n: { stat: 0, cool: 0, reroute: 0, webFirst: 0, decide: 0, bgWait: 0, bgWaitMs: 0, webWait: 0, webWaitMs: 0, cty: 0, reg: 0, oest: 0, lest: 0, unk: 0, ctx: 0, v1: 0 } };
function v98mErr(k, e) { try { const s = k + ": " + String((e && e.message) || e).slice(0, 160); V98MISC.err = s; V98MISC.errs.push(s); if (V98MISC.errs.length > 40) V98MISC.errs.shift(); } catch (x) { /* 記録だけ */ } }
function v98mLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v98mM(ja, en, zh, es) { const l = v98mLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v98mE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ════════════════════════════════════════════════════════════════════
   No.530 札の文の「全体 c/d」→「全項目 c/d」（旅程の「全体 N%」と同じ言葉で別の数を出さない）
   ════════════════════════════════════════════════════════════════════ */
function v98mAllWord(s) { return typeof s === "string" ? s.replace(/全体 (\d+)\/(\d+)/g, "全項目 $1/$2").replace(/（全体 (\d+)件）/g, "（全 $1件）") : s; }
/* ヒアリングの画面の札（v84Pill「必須 a/b・全体 c/d 項目」）と棒の読み上げ（v84MeterRest）も同じ */
function v98mPillWord(s) { return typeof s === "string" ? s.replace(/<span class="v84m-k">全体<\/span>/g, '<span class="v84m-k">全項目</span>').replace(/aria-label="全体 (\d+) \/ (\d+) 項目"/g, 'aria-label="全項目 $1 / $2 項目"') : s; }
["v96pStat", "v96pNotFull", "v84Pill", "v84MeterRest"].forEach((nm) => {
  try {
    const f = window[nm];
    if (typeof f !== "function" || f.__v98m) return;
    const g = function () { const s = f.apply(this, arguments); try { if (v98mLang() === "ja" && typeof s === "string" && /全体/.test(s)) { V98MISC.n.stat++; return v98mPillWord(v98mAllWord(s)); } } catch (e) { v98mErr(nm, e); } return s; };
    g.__v98m = 1;
    window[nm] = g;
  } catch (e) { v98mErr(nm, e); }
});

/* ════════════════════════════════════════════════════════════════════
   No.515 AI の呼び出しの配分（429 を減らす）
   ════════════════════════════════════════════════════════════════════ */
var V98M_AIH = { "generativelanguage.googleapis.com": "gemini", "api.anthropic.com": "anthropic", "api.openai.com": "openai", "api.perplexity.ai": "perplexity" };
var V98M_AL = V98MISC.al = { cool: {}, infl: {}, recent: {}, webRes: {}, ctxPick: "", user: 0, heavy: 0, webUser: 0, ctxWeb: 0, acctUntil: 0, tdAuto: 0, propAuto: 0, bmAuto: 0, log: [] };
var V98M_COOL0 = 60000, V98M_COOLMAX = 300000;
function v98mAlLog(x) { try { x.t = Date.now(); V98M_AL.log.push(x); if (V98M_AL.log.length > 80) V98M_AL.log.shift(); } catch (e) { /* 記録だけ */ } }
function v98mPN(p) { try { return (PROV[p] && PROV[p].short) || p; } catch (e) { return p; } } // eslint-disable-line no-undef
function v98mCooling(p) { const c = V98M_AL.cool[p]; return !!(c && c.until > Date.now()); }
function v98mCool(p, why) {
  try {
    if (!p) return;
    const c = V98M_AL.cool[p] || (V98M_AL.cool[p] = { n: 0, until: 0 });
    const now = Date.now();
    if (c.until > now && now - (c.at || 0) < 3000) return; // 同じ混雑の続け打ち（同じ瞬間の 429）は1回と数える
    c.n = Math.min(c.n + 1, 4);
    c.at = now; c.why = why || "429";
    c.until = now + Math.min(V98M_COOL0 * Math.pow(2, c.n - 1), V98M_COOLMAX);
    V98MISC.n.cool++;
    v98mAlLog({ k: "cool", p, why: c.why, ms: c.until - now });
  } catch (e) { v98mErr("cool", e); }
}
function v98mOk(p) { try { const c = V98M_AL.cool[p]; if (c && c.n) { c.n = 0; c.until = 0; v98mAlLog({ k: "ok", p }); } } catch (e) { v98mErr("ok", e); } }
function v98mCanWeb(p) { try { return !!(PROV[p] && PROV[p].search); } catch (e) { return false; } } // eslint-disable-line no-undef
function v98mAttOk(p, att) { const pdf = att && att.mime === "application/pdf"; return pdf ? ["gemini", "anthropic", "openai"].indexOf(p) >= 0 : ["gemini", "anthropic", "openai", "perplexity"].indexOf(p) >= 0; }
const v98mWait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ① AI の会社への通信：走っている本数と、429・混雑を見る（いちばん外の fetch） */
(function () {
  try {
    const F = window.fetch;
    if (typeof F !== "function" || F.__v98m) return;
    const hostOf = (u) => { const m = /^https:\/\/([^/?#]+)/i.exec(String(u || "")); return m ? m[1].toLowerCase() : ""; };
    const Wf = async function (input) {
      let p = "";
      try { const u = typeof input === "string" ? input : (input && typeof input.url === "string") ? input.url : ""; p = V98M_AIH[hostOf(u)] || ""; } catch (e) { p = ""; }
      if (!p) return F.apply(this, arguments);
      V98M_AL.infl[p] = (V98M_AL.infl[p] || 0) + 1;
      (V98M_AL.recent[p] = V98M_AL.recent[p] || []).push(Date.now());
      if (V98M_AL.recent[p].length > 60) V98M_AL.recent[p].shift();
      let resp;
      try { resp = await F.apply(this, arguments); } catch (e) { V98M_AL.infl[p] = Math.max(0, (V98M_AL.infl[p] || 1) - 1); throw e; }
      V98M_AL.infl[p] = Math.max(0, (V98M_AL.infl[p] || 1) - 1);
      try {
        const st = resp && resp.status;
        if (st === 429) {
          let type = "", msg = "";
          try { const j = await resp.clone().json(); type = (j && j.error && j.error.type) || ""; msg = (j && j.error && (j.error.message || "")) || ""; } catch (e) { /* 文でない */ }
          if (type === "bc20_air") {
            // 同期サーバーの断り：1分あたりの上限なら、自動の AI を1分待たせる（その日の上限・止まっているときはエンジンの問題ではない）
            const lim = (window.V95AI && V95AI.lim) || null; // eslint-disable-line no-undef
            if ((lim && lim.kind === "rate") || /rate|分あたり|per.?min/i.test(msg)) { V98M_AL.acctUntil = Date.now() + 60000; v98mAlLog({ k: "acct", p }); }
          } else v98mCool(p, "429");
        } else if (st === 529 || (st === 503 && /overload/i.test(String(resp.statusText || "")))) v98mCool(p, "busy");
        else if (resp && resp.ok) v98mOk(p);
      } catch (e) { v98mErr("fetchst", e); }
      return resp;
    };
    Object.keys(F).forEach((k) => { try { Wf[k] = F[k]; } catch (e) { /* 写せない印 */ } });
    Wf.__v98m = 1;
    window.fetch = Wf;
  } catch (e) { v98mErr("fetch", e); }
})();

/* エンジンの込み具合：利用者の Web 検索の依頼が載っている数（webRes）・走っている通信（infl）・30秒以内に送った数（recent）・続けて断られた数 */
function v98mRecent(p) { const L = V98M_AL.recent[p] || []; const now = Date.now(); while (L.length && now - L[0] > 30000) L.shift(); return L.length; }
function v98mScore(p) { const c = V98M_AL.cool[p]; return (V98M_AL.webRes[p] || 0) * 100 + (V98M_AL.infl[p] || 0) * 10 + v98mRecent(p) + (c ? c.n * 5 : 0); }
function v98mByScore(L) { return L.slice().sort((a, b) => v98mScore(a) - v98mScore(b) || L.indexOf(a) - L.indexOf(b)); }
/* ② 有効なエンジンの並び：後回しのエンジンを最後に。Web 検索の依頼の自動の切り替えでは、Web 検索のできるエンジンを先に（空いている順） */
if (typeof llmActive === "function") {
  const __act98m = llmActive;
  V98M_AL.act0 = __act98m;
  llmActive = function () { // eslint-disable-line no-global-assign
    const a = __act98m.apply(this, arguments);
    try {
      if (!Array.isArray(a) || a.length < 2) return a;
      const cool = a.filter(v98mCooling);
      const web = V98M_AL.ctxWeb > 0;
      if (!cool.length && !web) return a;
      const ok = a.filter((p) => cool.indexOf(p) < 0);
      const coolS = cool.slice().sort((x, y) => (V98M_AL.cool[x].until - V98M_AL.cool[y].until));
      const out = web ? v98mByScore(ok.filter(v98mCanWeb)).concat(ok.filter((p) => !v98mCanWeb(p))).concat(coolS) : ok.concat(coolS);
      if (web && out.join() !== a.join()) V98MISC.n.webFirst++;
      return out;
    } catch (e) { v98mErr("act", e); return a; }
  };
}
/* ③ 選び先：後回しのエンジンを避ける。Web 検索の依頼は、いちばん空いている Web 検索のできるエンジンへ。指定（prov）があるときは変えない */
if (typeof llmRoute === "function") {
  const __rt98m = llmRoute;
  llmRoute = function (opts) { // eslint-disable-line no-global-assign
    const r = __rt98m.apply(this, arguments);
    try {
      const o = opts || {};
      if (!r || !r.prov || o.prov || typeof V98M_AL.act0 !== "function") return r;
      const act = V98M_AL.act0() || [];
      if (act.length < 2) { if (V98M_AL.ctxWeb > 0) V98M_AL.ctxPick = r.prov; return r; }
      const cur = r.prov;
      const suit = (p) => act.indexOf(p) >= 0 && (!o.needWeb || v98mCanWeb(p)) && (!o.att || v98mAttOk(p, o.att));
      const cand = act.filter((p) => suit(p) && !v98mCooling(p));
      let alt = "", why = "";
      if (v98mCooling(cur)) { const c2 = v98mByScore(cand.filter((p) => p !== cur)); if (c2.length) { alt = c2[0]; why = "cool"; } }
      else if (o.needWeb && !o.att && cand.length > 1) { const best = v98mByScore(cand)[0]; if (best && best !== cur && v98mScore(best) < v98mScore(cur)) { alt = best; why = "busy"; } }
      if (!alt) { if (V98M_AL.ctxWeb > 0) V98M_AL.ctxPick = cur; return r; }
      const r2 = __rt98m.call(this, Object.assign({}, o, { prov: alt }));
      if (r2 && r2.prov === alt) {
        r2.why = String(r.why || "").replace(/^指定/, "") + v98mM(`・${v98mPN(cur)}が${why === "cool" ? "混み合っているため" : "ほかの依頼で込んでいるため"}${v98mPN(alt)}`, ` · ${v98mPN(alt)} (${v98mPN(cur)} ${why === "cool" ? "is congested" : "is busy with other requests"})`, `・因${v98mPN(cur)}${why === "cool" ? "拥挤" : "正忙"}改用${v98mPN(alt)}`, ` · ${v98mPN(alt)} (${v98mPN(cur)} ${why === "cool" ? "saturado" : "ocupado"})`);
        r2.v98m = { from: cur, why };
        if (V98M_AL.ctxWeb > 0) V98M_AL.ctxPick = alt;
        V98MISC.n.reroute++;
        v98mAlLog({ k: "route", from: cur, to: alt, why, web: o.needWeb ? 1 : 0 });
        return r2;
      }
    } catch (e) { v98mErr("route", e); }
    return r;
  };
}
/* ④ 規制の AI 詳細調査の調べ直し（21.97）が選ぶ「検索に対応したエンジン」：後回しのエンジンを外し、空いている順に。
      全部が後回しのときは、いちばん空いている1つだけにする（21.97 は「2回目は同じエンジン」を4秒後に頼むため、断られた直後のエンジンに続けて頼まない） */
(function () {
  try {
    const S = window.__v2192r10w;
    if (!S || typeof S.decide !== "function" || S.decide.__v98m) return;
    const __d = S.decide;
    const g = function () {
      const d = __d.apply(this, arguments);
      try {
        if (d && Array.isArray(d.sr) && d.sr.length > 1) {
          const nc = d.sr.filter((p) => !v98mCooling(p));
          const sr = nc.length ? v98mByScore(nc) : [v98mByScore(d.sr)[0]];
          if (sr.join() !== d.sr.join()) { d.sr = sr; d.v98mSkip = 1; V98MISC.n.decide++; }
        }
      } catch (e) { v98mErr("decide", e); }
      return d;
    };
    g.__v98m = 1;
    S.decide = g;
  } catch (e) { v98mErr("decide0", e); }
})();
/* ⑤ 自動で走る AI の見分け（自動で呼ばれた間だけ印を立てる） */
function v98mMarkAuto(nm, key, isAuto) {
  try {
    const f = window[nm];
    if (typeof f !== "function" || f.__v98m) return;
    const g = function () {
      const auto = isAuto(arguments);
      if (!auto) return f.apply(this, arguments);
      V98M_AL[key]++;
      let r;
      try { r = f.apply(this, arguments); } catch (e) { V98M_AL[key]--; throw e; }
      if (r && typeof r.then === "function") return r.then((x) => { V98M_AL[key]--; return x; }, (e) => { V98M_AL[key]--; throw e; });
      V98M_AL[key]--;
      return r;
    };
    g.__v98m = 1;
    window[nm] = g;
  } catch (e) { v98mErr("mark:" + nm, e); }
}
v98mMarkAuto("todayGen", "tdAuto", (a) => !a[0]);                 // vToday の自動＝todayGen(false)・手で押す再調査＝todayGen(true)
v98mMarkAuto("v88PropAI", "propAuto", (a) => !!a[1]);             // 自分から出す提案の自動＝v88PropAI(id, true)
v98mMarkAuto("bmJudge", "bmAuto", (a) => !(a[1] && a[1].force));  // 交渉の判定の自動（手で押す「判定する」は force）
var V98M_PHQ = /「商品写真」として使えるか判定してください|あわせて jp（画像に重ねた日本語の/;
function v98mKind(q, o) {
  const s = typeof q === "string" ? q : "";
  if (V98M_PHQ.test(s)) { try { if (typeof DK3G !== "undefined" && DK3G && DK3G.run) return "user"; } catch (e) { /* 無い版 */ } return "bg"; } // eslint-disable-line no-undef
  if (V98M_AL.tdAuto > 0 && /【今日やるべきこと】/.test(s)) return "bg";
  if (V98M_AL.propAuto > 0 && /^AI商社マンとして、いまのお客様に「自分から」出す提案/.test(s)) return "bg";
  if (V98M_AL.bmAuto > 0 && /^あなたはAI商社マン。日本のサプライヤー（自社）と海外バイヤーのやり取りを読み/.test(s)) return "bg";
  if (o && o.task === "translate") return "tr";
  return "user";
}
function v98mIsWeb(o) {
  try {
    if (!o || o.noWeb) return false;
    if (o.forceWeb) return true;
    return !!((typeof WEBON !== "undefined" && WEBON) && (typeof webPerm !== "function" || webPerm())); // eslint-disable-line no-undef
  } catch (e) { return false; }
}
/* Web 検索のできる（後回しでない）エンジンのうち、利用者の Web 検索の依頼が載っていないものがあるか */
function v98mWebFree() {
  try {
    const a = (V98M_AL.act0 ? V98M_AL.act0() : []) || [];
    const w = a.filter((p) => v98mCanWeb(p));
    if (w.length < 2) return V98M_AL.webUser < 1;               // Web 検索のできるエンジンが1つなら、同時に1本
    const nc = w.filter((p) => !v98mCooling(p));
    return (nc.length ? nc : w).some((p) => !(V98M_AL.webRes[p] > 0));
  } catch (e) { return true; }
}
/* ⑥ いちばん外の llmAsk：自動の AI は利用者の重い依頼の間は待つ／利用者の Web 検索の依頼は、空いている Web 検索のエンジンが無いあいだ順番を待つ */
if (typeof llmAsk === "function") {
  const __ask98m = llmAsk;
  llmAsk = async function (q, maxTok, opts) { // eslint-disable-line no-global-assign
    const o = opts || {};
    // 中からの呼び直し（続き・空の答えの頼み直し・調べ直し）は、そのまま（待たせると自分を待つことになる）
    if (o._noFo || o._retry2 || o._v56askcont || o._v96rt || o._v97rt) return __ask98m.apply(this, arguments);
    let kind = "user", web = false, heavy = false;
    try {
      kind = v98mKind(q, o);
      web = v98mIsWeb(o);
      heavy = web || !!o.att || o.task === "heavy" || o.task === "legal" || o.task === "research" || (+maxTok || 0) >= 2400;
    } catch (e) { v98mErr("kind", e); }
    const t0 = Date.now();
    try {
      if (kind === "bg") {
        const max = V98M_AL.tdAuto > 0 && /【今日やるべきこと】/.test(String(q)) ? 120000 : 60000;
        let n = 0;
        while ((V98M_AL.heavy > 0 || Date.now() < V98M_AL.acctUntil) && Date.now() - t0 < max) { n++; await v98mWait(400); }
        if (n) { V98MISC.n.bgWait++; V98MISC.n.bgWaitMs += Date.now() - t0; v98mAlLog({ k: "bgwait", ms: Date.now() - t0, q: String(q).slice(0, 24) }); }
      } else if (kind === "user" && web && !o.prov) {
        let n = 0;
        while (!v98mWebFree() && Date.now() - t0 < 45000) { n++; await v98mWait(300); }
        if (n) { V98MISC.n.webWait++; V98MISC.n.webWaitMs += Date.now() - t0; v98mAlLog({ k: "webwait", ms: Date.now() - t0, q: String(q).slice(0, 24) }); }
      }
    } catch (e) { v98mErr("gate", e); }
    const isUser = kind === "user";
    if (isUser) { V98M_AL.user++; if (heavy) V98M_AL.heavy++; if (web) V98M_AL.webUser++; }
    let pr, pick = "";
    const ctx = web && !o.prov ? 1 : 0;
    V98M_AL.ctxWeb += ctx; V98M_AL.ctxPick = "";
    try { pr = __ask98m.apply(this, arguments); } catch (e) { V98M_AL.ctxWeb -= ctx; if (isUser) { V98M_AL.user--; if (heavy) V98M_AL.heavy--; if (web) V98M_AL.webUser--; } throw e; }
    V98M_AL.ctxWeb -= ctx;
    // この依頼の Web 検索を載せたエンジン（同じ瞬間に選ばれた先。分からなければ、いちばん空いているもの）
    if (isUser && web) {
      try { pick = o.prov || V98M_AL.ctxPick || v98mByScore(((V98M_AL.act0 ? V98M_AL.act0() : []) || []).filter((p) => v98mCanWeb(p) && !v98mCooling(p)))[0] || ""; } catch (e) { pick = ""; }
      if (pick) V98M_AL.webRes[pick] = (V98M_AL.webRes[pick] || 0) + 1;
    }
    const fin = () => {
      if (isUser) { V98M_AL.user = Math.max(0, V98M_AL.user - 1); if (heavy) V98M_AL.heavy = Math.max(0, V98M_AL.heavy - 1); if (web) V98M_AL.webUser = Math.max(0, V98M_AL.webUser - 1); }
      if (pick) V98M_AL.webRes[pick] = Math.max(0, (V98M_AL.webRes[pick] || 1) - 1);
    };
    try {
      const r = await pr;
      fin();
      return r;
    } catch (e) {
      fin();
      // AI の会社を直接見られない呼び出し（模擬など）でも、決まったエンジンの 429 は後回しに
      try { if (o.prov && /HTTP 429|HTTP 529|overload|rate.?limit|too many requests/i.test(String((e && e.message) || e))) v98mCool(o.prov, /529|overload/i.test(String(e && e.message)) ? "busy" : "429"); } catch (x) { /* 記録だけ */ }
      throw e;
    }
  };
}
window.v98mCool = v98mCool; window.v98mCooling = v98mCooling;

/* ════════════════════════════════════════════════════════════════════
   No.520 COURIER の日数の目安が出ない行
   ════════════════════════════════════════════════════════════════════ */
var V98M_CTY_ALIAS = { hk: "香港", hongkong: "香港", hkg: "香港", sg: "シンガポール", sgp: "シンガポール", cn: "中国", prc: "中国", mainlandchina: "中国", kr: "韓国", kor: "韓国", korea: "韓国", southkorea: "韓国", republicofkorea: "韓国",
  tw: "台湾", twn: "台湾", us: "アメリカ", usa: "アメリカ", uswest: "アメリカ", useast: "アメリカ", usawest: "アメリカ", usaeast: "アメリカ", unitedstatesofamerica: "アメリカ", uk: "イギリス", gb: "イギリス", greatbritain: "イギリス",
  uae: "UAE", unitedarabemirates: "UAE", th: "タイ", vn: "ベトナム", my: "マレーシア", ph: "フィリピン", id: "インドネシア", au: "オーストラリア", nz: "ニュージーランド", ca: "カナダ", de: "ドイツ", fr: "フランス",
  "米国本土": "アメリカ", "アメリカ本土": "アメリカ", "アメリカ西海岸": "アメリカ", "アメリカ東海岸": "アメリカ", "米国西海岸": "アメリカ", "米国東海岸": "アメリカ", "米国西部": "アメリカ", "米国東部": "アメリカ", "ハワイ州": "ハワイ", "グアム島": "グアム", "韓国(大韓民国)": "韓国" };
/* 地域の名前（国の代わりに地域で登録したレート）→ 21.97 の地域の表の同じ行（新しい日数は足さない。東アジアは幅の広いほう） */
var V98M_REG_ALIAS = { "欧州": "欧州", "ヨーロッパ": "欧州", "eu": "欧州", "eu圏": "欧州", "europe": "欧州", "西欧": "欧州", "東アジア": "東アジア", "eastasia": "東アジア", "東南アジア": "東南アジア", "southeastasia": "東南アジア", "asean": "東南アジア",
  "南アジア": "南アジア", "southasia": "南アジア", "北米": "北米", "northamerica": "北米", "中南米": "中南米", "南米": "中南米", "latinamerica": "中南米", "中東": "中東", "middleeast": "中東", "オセアニア": "オセアニア", "oceania": "オセアニア", "アフリカ": "アフリカ", "africa": "アフリカ" };
function v98mKey(s) { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.replace(/[\s・.\-_/]/g, "").toLowerCase(); }
var __v98mRegOf0 = typeof v97fRegOf === "function" ? v97fRegOf : null;
var __v98mCty0 = typeof v97fCty === "function" ? v97fCty : null;
if (__v98mRegOf0) {
  v97fRegOf = function (cty) { // eslint-disable-line no-global-assign
    const g = __v98mRegOf0.apply(this, arguments);
    if (g) return g;
    try {
      const k = v98mKey(cty);
      const c = V98M_CTY_ALIAS[k] || V98M_CTY_ALIAS[String(cty || "").trim()];
      if (c) { const g2 = __v98mRegOf0(c); if (g2) { V98MISC.n.reg++; return g2; } }
      const nm = V98M_REG_ALIAS[k] || V98M_REG_ALIAS[String(cty || "").trim()];
      if (nm && typeof V97F_REG !== "undefined") { const L = V97F_REG.filter((x) => x.nm === nm).sort((a, b) => b.hi - a.hi); if (L[0]) { V98MISC.n.reg++; return L[0]; } } // eslint-disable-line no-undef
    } catch (e) { v98mErr("regof", e); }
    return null;
  };
}
if (__v98mCty0) {
  v97fCty = function (pod) { // eslint-disable-line no-global-assign
    try {
      let s = String(pod == null ? "" : pod); try { s = s.normalize("NFKC"); } catch (e) { /* そのまま */ }
      const s0 = s.replace(/[（(][^)）]*[)）]/g, "").trim();
      if (/^(香港|hong\s*kong)/i.test(s0)) { V98MISC.n.cty++; return "香港"; }   // 21.97 は語末の「港」を外して「香」にしていた
      if (/^(澳門|マカオ|macau|macao)/i.test(s0)) return "マカオ";
    } catch (e) { v98mErr("cty", e); }
    const c = __v98mCty0.apply(this, arguments);
    try {
      if (c && __v98mRegOf0 && !__v98mRegOf0(c)) {
        // かっこの中の国（例「LA（アメリカ）」）・略号・地域の名前
        let s = String(pod == null ? "" : pod); try { s = s.normalize("NFKC"); } catch (e) { /* そのまま */ }
        const inner = (/[（(]([^)）]+)[)）]/.exec(s) || [])[1];
        if (inner) { const c2 = __v98mCty0(inner); if (c2 && __v98mRegOf0(c2)) { V98MISC.n.cty++; return c2; } }
        const a = V98M_CTY_ALIAS[v98mKey(c)] || V98M_CTY_ALIAS[v98mKey(s)];
        if (a) { V98MISC.n.cty++; return a; }
      }
    } catch (e) { v98mErr("cty2", e); }
    return c;
  };
}
/* 前に作られた見積（印 ttMaybe・ttDef だけ）：同じ会社のレートを探して目安を出す */
function v98mCopyEst(rate, co, kind, qtt) {
  try {
    if (!rate || typeof v97fTtEst !== "function") return null;
    let full = null;
    try { if (typeof v96fFindRate === "function") full = v96fFindRate(co, rate.pol, rate.pod, rate.mode, rate.tt != null ? rate.tt : qtt); } catch (e) { full = null; }
    const base = Object.assign({}, full || rate);
    if (!base.co && co) base.co = co;
    if (kind === "def" || kind === "maybe") { base.ttDef = 1; delete base.ttOk; }
    const e = v97fTtEst(base);
    if (!e) return null;
    if (qtt != null && +qtt !== +e.was && +qtt !== +e.hi) return null;
    return Object.assign(e, { cur: qtt != null ? +qtt : e.was, kind: kind || e.kind });
  } catch (e) { v98mErr("copyest", e); return null; }
}
if (typeof v97fOfferEst === "function") {
  const __oe98m = v97fOfferEst;
  v97fOfferEst = function (o) { // eslint-disable-line no-global-assign
    const e = __oe98m.apply(this, arguments);
    if (e) return e;
    try {
      if (!o || !o.rate || typeof v97fIsCour !== "function" || !v97fIsCour(o.rate)) return null;
      const k = typeof v96fOfferKind === "function" ? v96fOfferKind(o) : "";
      if (k !== "def" && k !== "maybe") return null;
      const x = v98mCopyEst(o.rate, o.co, k, o.quote ? o.quote.tt : null);
      if (x) V98MISC.n.oest++;
      return x;
    } catch (x) { v98mErr("oest", x); return null; }
  };
  window.v97fOfferEst = v97fOfferEst;
}
if (typeof v97fLegEst === "function") {
  const __le98m = v97fLegEst;
  v97fLegEst = function (l) { // eslint-disable-line no-global-assign
    const e = __le98m.apply(this, arguments);
    if (e) return e;
    try {
      if (!l || !l.ok || !l.quote || typeof v97fIsCour !== "function" || !v97fIsCour({ mode: l.quote.mode })) return null;
      const k = typeof v96fQuoteKind === "function" ? v96fQuoteKind(l) : "";
      if (k !== "def" && k !== "maybe") return null;
      const co = l.sel || l.co, o = (l.offers || []).find((x) => x && x.co === co);
      let x = o ? v97fOfferEst(o) : null;
      if (!x) {
        const ln = String(l.quote.lane || "").split(/\s*→\s*/);
        const rate = o && o.rate ? o.rate : ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []).find((r) => r && v97fIsCour(r) && r.pol === ln[0] && r.pod === ln[1] && (!co || (r.co || "") === co || !r.co)) || (ln.length > 1 ? { pol: ln[0], pod: ln[1], mode: l.quote.mode, tt: l.quote.tt } : null); // eslint-disable-line no-undef
        x = rate ? v98mCopyEst(rate, co, k, l.quote.tt) : null;
      }
      if (x) V98MISC.n.lest++;
      return x;
    } catch (x) { v98mErr("lest", x); return null; }
  };
  window.v97fLegEst = v97fLegEst;
}
/* 目安の無い COURIER の既定値：「約10日（既定値かも）」→「日数は要確認（物流会社に確認）」 */
function v98mUnkTxt(s) {
  if (typeof s !== "string") return s;
  const y = s.replace(/(所要\s*)?約\s*(\d+)\s*日（(既定値かも|既定値)）/g, (m0, a, d, w) => { V98MISC.n.unk++; return v98mM(`日数は要確認（物流会社に確認・登録の${d}日は${w}）`, `transit days to be confirmed (ask the forwarder; the registered ${d} days ${w === "既定値" ? "is the default" : "may be the default"})`, `天数待确认（请向物流公司确认；登记的${d}天${w === "既定値" ? "是默认值" : "可能是默认值"}）`, `días por confirmar (consultar al transitario)`); })
    .replace(/(所要\s*)?約\s*(\d+)\s*日\s*\((may be default|default)\)/g, (m0, a, d, w) => { V98MISC.n.unk++; return `transit days to be confirmed (ask the forwarder; the registered ${d} days ${w === "default" ? "is the default" : "may be the default"})`; });
  return y;
}
function v98mUnkRate(r) { try { return !!(r && typeof v97fIsCour === "function" && v97fIsCour(r) && typeof v97fDefKind === "function" && v97fDefKind(r) && !v97fTtEst(r)); } catch (e) { return false; } }
function v98mUnkLeg(l) {
  try {
    if (!l || !l.ok || !l.quote || typeof v97fIsCour !== "function" || !v97fIsCour({ mode: l.quote.mode })) return false;
    const k = typeof v96fQuoteKind === "function" ? v96fQuoteKind(l) : "";
    return (k === "def" || k === "maybe") && !v97fLegEst(l);
  } catch (e) { return false; }
}
window.v98mUnkTxt = v98mUnkTxt; window.v98mUnkRate = v98mUnkRate; window.v98mUnkLeg = v98mUnkLeg;
if (typeof fwdLegLine === "function") {
  const __ll98m = fwdLegLine;
  fwdLegLine = function (l) { const s = __ll98m.apply(this, arguments); try { if (v98mUnkLeg(l)) return v98mUnkTxt(s); } catch (e) { v98mErr("legline", e); } return s; }; // eslint-disable-line no-global-assign
}
if (typeof fwdScoreOffers === "function") {
  const __so98m = fwdScoreOffers;
  fwdScoreOffers = function () { // eslint-disable-line no-global-assign
    const out = __so98m.apply(this, arguments);
    try {
      (Array.isArray(out) ? out : []).forEach((o) => {
        if (!o || !o.rate || !o.quote || !Array.isArray(o.reasons) || !v97fIsCour(o.rate)) return;
        const k = typeof v96fOfferKind === "function" ? v96fOfferKind(o) : "";
        if ((k === "def" || k === "maybe") && !v97fOfferEst(o)) o.reasons = o.reasons.map(v98mUnkTxt);
      });
    } catch (e) { v98mErr("score", e); }
    return out;
  };
}
if (typeof v90fRateLine === "function") {
  const __rl98m = v90fRateLine;
  v90fRateLine = function (r) { const s = __rl98m.apply(this, arguments); try { if (v98mUnkRate(r)) return v98mUnkTxt(s); } catch (e) { v98mErr("rline", e); } return s; }; // eslint-disable-line no-global-assign
}
if (typeof v73fRateLine === "function") {
  const __vr98m = v73fRateLine;
  v73fRateLine = function (x) { // eslint-disable-line no-global-assign
    const s = __vr98m.apply(this, arguments);
    try {
      if (x && x.r && v98mUnkRate(x.r)) {
        const w = v96fTtKind(x.r) === "def" ? "既定値" : "既定値かも";
        return String(s).replace(new RegExp("所要 約" + (+x.r.tt || 10) + "日(（既定値(かも)?）)?"), v98mM(`日数は要確認（物流会社に確認・登録の${+x.r.tt || 10}日は${w}）`, `transit days to be confirmed (ask the forwarder)`)).replace(/transit approx\. \d+ days( \((may be )?default\))?/, "transit days to be confirmed (ask the forwarder)");
      }
    } catch (e) { v98mErr("v73line", e); }
    return s;
  };
}
if (typeof v46LegTxt === "function") {
  const __lt98m = v46LegTxt;
  v46LegTxt = function (l) { const s = __lt98m.apply(this, arguments); try { if (v98mUnkLeg(l)) return v98mUnkTxt(String(s).replace(/(約\s*\d+\s*日)(?!（既定値)/, (m) => m + "（" + (v96fQuoteKind(l) === "def" ? "既定値" : "既定値かも") + "）")); } catch (e) { v98mErr("lt", e); } return s; }; // eslint-disable-line no-global-assign
}
if (typeof v45Synth === "function") {
  const __sy98m = v45Synth;
  v45Synth = function (r) { // eslint-disable-line no-global-assign
    const out = __sy98m.apply(this, arguments);
    try {
      ((r && r.legs) || []).forEach((l) => {
        if (!v98mUnkLeg(l)) return;
        const w = v96fQuoteKind(l) === "def" ? "既定値" : "既定値かも";
        (out || []).forEach((m) => { if (m && m.f === "物" && String(m.t).indexOf(String(l.cty) + "：") >= 0) m.t = v98mUnkTxt(String(m.t).replace(/(約\s*\d+\s*日)(?!（既定値)/, (x) => x + "（" + w + "）")); });
      });
    } catch (e) { v98mErr("synth", e); }
    return out;
  };
}
if (typeof fwdqAnswerLocal === "function") {
  const __qa98m = fwdqAnswerLocal;
  fwdqAnswerLocal = function (q, r, l) { // eslint-disable-line no-global-assign
    const o = __qa98m.apply(this, arguments);
    try {
      if (o && typeof o.a === "string" && v98mUnkLeg(l)) {
        const P = o.a.split("<br><br>");
        P[0] = v98mUnkTxt(P[0].replace(/(約\s*\d+\s*日)(?!（既定値)/, (x) => x + "（" + (v96fQuoteKind(l) === "def" ? "既定値" : "既定値かも") + "）"));
        o.a = P.join("<br><br>");
      }
    } catch (e) { v98mErr("qa", e); }
    return o;
  };
}
/* AI の文脈（21.96 の「日数が既定値のレーン」）：COURIER は、見積・答えで使う日数（目安）か「要確認」を添える（期限切れのレーンも） */
if (typeof v96fTtCtx === "function") {
  const __tc98m = v96fTtCtx;
  v96fTtCtx = function () { // eslint-disable-line no-global-assign
    const s = __tc98m.apply(this, arguments);
    try {
      if (!s) return s;
      const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []); // eslint-disable-line no-undef
      let ch = 0;
      const y = String(s).split("\n").map((line) => {
        const m = /^・(.+?)→(.+?) (\S+)（/.exec(line);
        if (!m || !/COURIER|クーリエ|国際宅配|EMS|EXPRESS/i.test(m[3])) return line;
        const r = R.find((x) => x && x.pol === m[1] && x.pod === m[2] && v97fIsCour(x));
        if (!r) return line;
        const e = v97fTtEst(r);
        ch++;
        return line + (e ? `→ 答えでは ${v97fRange(e)}日（${e.src === "region" ? "国際宅配便の一般的な目安・" + e.reg + "・営業日・未確認" : e.src === "peer" ? "同じ国の登録の日数" : "備考の日数"}）と言う` : "→ 日数は要確認（物流会社に確認）と言う。10日とは答えない");
      });
      // 一覧に載りきらなかった（ほか N件）レーンも、目安の無い COURIER は名前を出す（「10日」と答えさせない）
      const unk = R.filter((x) => x && v98mUnkRate(x) && y.join("\n").indexOf(x.pol + "→" + x.pod + " ") < 0).map((x) => x.pol + "→" + x.pod);
      if (unk.length) { y.push(`・日数の目安が無い COURIER のレーン（日数は要確認（物流会社に確認）と答え、10日とは答えない）：${[...new Set(unk)].slice(0, 20).join("、")}`); ch++; }
      if (ch) V98MISC.n.ctx++;
      return y.join("\n");
    } catch (e) { v98mErr("ttctx", e); return s; }
  };
}

/* ════════════════════════════════════════════════════════════════════
   No.526 Ver1.0 の学習の基準日：最後に取り込んだ日・まだ届いていない週・次の予定
   ════════════════════════════════════════════════════════════════════ */
var V98M_WEEK = 7 * 864e5;
function v98mV1Info(now) {
  try {
    const V = typeof v1Data === "function" ? v1Data() : null;
    if (!V) return null;
    now = now || Date.now();
    const exp = typeof v90admV1Expect === "function" ? v90admV1Expect(now) : null;
    if (!exp) return null;
    const at = +V.at || 0;
    const late = !at || at < exp - 3600000;
    let first = exp, miss = 0;
    if (late) { while (at && first - V98M_WEEK > at + 3600000) first -= V98M_WEEK; miss = Math.round((exp - first) / V98M_WEEK) + 1; }
    return { asof: String(V.asof || "-"), at, late, miss, first, exp, next: exp + V98M_WEEK };
  } catch (e) { v98mErr("v1info", e); return null; }
}
function v98mMd(t) { const d = new Date(t); return (d.getMonth() + 1) + "/" + d.getDate(); }
function v98mWd(t) { const d = new Date(t); return v98mM("日月火水木金土"[d.getDay()], ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()], "日一二三四五六"[d.getDay()], ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][d.getDay()]); }
function v98mHm(t) { const d = new Date(t); return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); }
function v98mMdw(t) { return v98mLang() === "ja" || v98mLang() === "zh" ? `${v98mMd(t)}（${v98mWd(t)}）` : `${v98mWd(t)} ${v98mMd(t)}`; }
/* short＝表の1行・根拠に添える短い形／ctx＝AI に渡す形（日本語） */
function v98mV1Line(mode) {
  const I = v98mV1Info();
  if (!I) return "";
  V98MISC.n.v1++;
  const wk = I.miss > 1 ? `${v98mMdw(I.first)}〜${v98mMdw(I.exp)} の ${I.miss}週分` : `${v98mMdw(I.exp)}分`;
  const wkEn = I.miss > 1 ? `the ${I.miss} weekly imports from ${v98mMdw(I.first)} to ${v98mMdw(I.exp)}` : `the weekly import for ${v98mMdw(I.exp)}`;
  const lastJ = I.at ? `${v98mMd(I.at)} ${v98mHm(I.at)}` : "—", lastE = I.at ? `${v98mMd(I.at)} ${v98mHm(I.at)}` : "—";
  if (mode === "ctx") {
    return I.late ? `Ver1.0 の学習データは ${lastJ} の取り込みのまま（基準日 ${I.asof}）。${wk}の週次の取り込みがまだ届いていないため、基準日より後の動きは入っていない。Ver1.0 の数字を「最新」「今週」と言わず「${I.asof} 時点」と言う。次の取り込みの予定は ${v98mMdw(I.next)} 6:30。`
      : `Ver1.0 の学習データ：最後の取り込み ${lastJ}（基準日 ${I.asof}）。次の予定 ${v98mMdw(I.next)} 6:30。`;
  }
  if (mode === "short") {
    return I.late ? v98mM(`${wk}の週次の取り込みは未着・次の予定 ${v98mMdw(I.next)} 6:30`, `${wkEn} not received yet; next scheduled ${v98mMdw(I.next)} 6:30`, `${wk}的每周导入尚未送达・下次预定 ${v98mMdw(I.next)} 6:30`, `importación semanal pendiente; próxima ${v98mMdw(I.next)} 6:30`)
      : v98mM(`最後の取り込み ${lastJ}・次の予定 ${v98mMdw(I.next)} 6:30`, `last import ${lastE}; next ${v98mMdw(I.next)} 6:30`, `最近导入 ${lastJ}・下次 ${v98mMdw(I.next)} 6:30`, `última importación ${lastE}; próxima ${v98mMdw(I.next)} 6:30`);
  }
  return I.late ? v98mM(`Ver1.0 の学習は ${lastJ} の取り込みのまま（基準日 ${I.asof}）です。${wk}の週次の取り込みがまだ届いていないため、それより後の動きは入っていません。次の予定：${v98mMdw(I.next)} 6:30`,
    `Ver1.0 learning is still from the import on ${lastE} (as of ${I.asof}). ${wkEn.charAt(0).toUpperCase() + wkEn.slice(1)} ${I.miss > 1 ? "have" : "has"} not arrived yet, so later activity is not included. Next scheduled: ${v98mMdw(I.next)} 6:30`,
    `Ver1.0 的学习仍是 ${lastJ} 导入的数据（基准日 ${I.asof}）。${wk}的每周导入尚未送达，之后的动态未包含在内。下次预定：${v98mMdw(I.next)} 6:30`,
    `El aprendizaje Ver1.0 sigue con la importación del ${lastE} (fecha base ${I.asof}). La importación semanal aún no llegó. Próxima: ${v98mMdw(I.next)} 6:30`)
    : v98mM(`Ver1.0 の学習：最後の取り込み ${lastJ}（基準日 ${I.asof}）・次の予定 ${v98mMdw(I.next)} 6:30`, `Ver1.0 learning: last import ${lastE} (as of ${I.asof}); next scheduled ${v98mMdw(I.next)} 6:30`,
      `Ver1.0 学习：最近导入 ${lastJ}（基准日 ${I.asof}）・下次预定 ${v98mMdw(I.next)} 6:30`, `Aprendizaje Ver1.0: última importación ${lastE} (fecha base ${I.asof}); próxima ${v98mMdw(I.next)} 6:30`);
}
window.v98mV1Info = v98mV1Info; window.v98mV1Line = v98mV1Line;
/* AI商社マンの「参照している情報」の Ver1.0 の行 */
if (typeof poolSeenRows === "function") {
  const __sr98m = poolSeenRows;
  poolSeenRows = function () { // eslint-disable-line no-global-assign
    const r = __sr98m.apply(this, arguments);
    try {
      if (!Array.isArray(r)) return r;
      const s = v98mV1Line("short");
      if (!s) return r;
      return r.map((x) => (Array.isArray(x) && /Ver1\.0/.test(String(x[0])) && /基準日/.test(String(x[1])) && String(x[1]).indexOf(s) < 0) ? [x[0], String(x[1]) + "・" + s].concat(x.slice(2)) : x);
    } catch (e) { v98mErr("seen", e); return r; }
  };
}
/* 全社版の札（説明）・国のページの全社版の1行 */
if (typeof poolBadgeHtml === "function") {
  const __pb98m = poolBadgeHtml;
  poolBadgeHtml = function () { // eslint-disable-line no-global-assign
    let h = __pb98m.apply(this, arguments);
    try { const s = v98mV1Line(); if (s && typeof h === "string" && /title="Ver1\.0/.test(h)) h = h.replace(/title="/, 'title="' + v98mE(s) + "／"); } catch (e) { v98mErr("badge", e); }
    return h;
  };
}
if (typeof v54ctyPoolLine === "function") {
  const __cl98m = v54ctyPoolLine;
  v54ctyPoolLine = function () { // eslint-disable-line no-global-assign
    const h = __cl98m.apply(this, arguments);
    try {
      if (typeof h !== "string" || !/基準日|as of/i.test(h) || !v98mV1Info()) return h;
      const I = v98mV1Info();
      // 届いていないときは、行の頭に（長い行は画面で数行にたたまれるため、末尾だと隠れる）。届いているときは末尾に
      return I.late ? `<span class="v98m-v1 late" data-noi18n>⚠ ${v98mE(v98mV1Line())}。</span> ` + h : h + `<span class="v98m-v1" data-noi18n> ${v98mE(v98mV1Line())}</span>`;
    } catch (e) { v98mErr("ctyline", e); return h; }
  };
}
/* 内蔵の答え（Ver1.0 の集計から答える）の根拠 */
if (typeof v1Ask === "function") {
  const __v1a98m = v1Ask;
  v1Ask = function () { // eslint-disable-line no-global-assign
    const r = __v1a98m.apply(this, arguments);
    try { if (r && typeof r.c === "string" && /基準日/.test(r.c)) { const I = v98mV1Info(); if (I && I.late) r.c += "・" + v98mV1Line("short"); } } catch (e) { v98mErr("v1ask", e); }
    return r;
  };
}
/* AI に渡す Ver1.0 の文脈：基準日より後の週が入っていないことを書き添える（「最新」と言わせない） */
if (typeof v1Text === "function") {
  const __vt98m = v1Text;
  v1Text = function () { // eslint-disable-line no-global-assign
    const r = __vt98m.apply(this, arguments);
    try {
      const s = v98mV1Line("ctx");
      if (!s) return r;
      if (Array.isArray(r)) { const i = r.findIndex((x) => /^Ver1\.0（/.test(String(x))); const out = r.slice(); out.splice(i >= 0 ? i + 1 : 0, 0, s); return out; }
      if (typeof r === "string") return r + "\n" + s;
    } catch (e) { v98mErr("v1text", e); }
    return r;
  };
}
