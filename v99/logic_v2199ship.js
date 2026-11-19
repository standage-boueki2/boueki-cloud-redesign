/* ═══ 21.99 分野 ship（2026-11-19 第12回相当 UAT・21.98）＝荷主側の進み具合・AI 詳細調査・見積の要約（中身。見せ方は rd_v99ship.js） ═══
   土台・前の層（rd/・v95〜v98）は書き換えず、前の関数を控えてから包む。同期サーバー（GAS）は変えない。
   ・No.550（新規）AI 詳細調査が途中で止まる（A 台湾：2分23秒・95%で止まり、未完了のまま）
     原因：規制の AI 詳細調査（regAIRun → llmAsk・Web 検索つき・1回 150 秒まで）は、21.97 の調べ直し（最大3回＋待ち 4秒・12秒）があるため、
           答えが返らないと最長 7分半ほど「調査しています…（20〜60秒）」の回る印のまま。右下の札の棒（v68tPaint）は「経過÷目安」で 95% で止まり、
           「止まってはいません」と出し続ける。答えが返らないままの依頼には区切りが無く、未完了・どこまで済んだか・やり直しの手段も出なかった。
     直し：調査ごとに「依頼を送った・答え待ち・調べ直し（何回目）」を見張り、一定の時間（既定 90 秒）新しい動きが無ければ「未完了」とし、
           ・調査の窓に「未完了（どこまで済んだか：依頼 n回・答え 0件・出典 0件・経過）」と「続きから調べる／もう一度調べる」を出す。
           ・右下の札は終わらせる（95% のまま回り続けない）。窓を閉じていたら知らせる。
           ・前回までに済んだ調査の結果と出典は消さずに下に残す。「続きから調べる」は、前回の答えで確かめられなかった見出し（①〜⑥）だけを
             調べて、済んだ見出し・出典と合わせる（前回の答えが無ければ最初から）。
           ・エラーで終わったとき（「調査に失敗しました」）も同じ「未完了」と2つのボタンを出す。
           ・どの AI の依頼でも、答えが返らないまま 8分を過ぎた右下の札は「応答なし」で終わらせる（No.534 の残る札の歯止め）。
   ・No.534（条件つき）右下の札（営業資料・写真の確認・AI 調査）の残り：上の歯止めのほか、札の状態を V99SHIP.ait に控えて試験で数える。
   本番では AI を呼ばない試験だけで確かめる（AI の入口は llmAsk・模擬は window.__llmMock）。 */
var V99SHIP = window.V99SHIP = { v: "21.99", err: null, errs: [], n: { run: 0, stall: 0, fail: 0, cont: 0, again: 0, sweep: 0, end: 0 }, cfg: { stallMs: 90000, sweepMs: 480000 }, runs: {}, ait: [] };
function v99sErr(k, e) { try { const s = k + ": " + String((e && e.message) || e).slice(0, 160); V99SHIP.err = s; V99SHIP.errs.push(s); if (V99SHIP.errs.length > 40) V99SHIP.errs.shift(); } catch (x) { /* 記録だけ */ } }
function v99sLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v99sM(ja, en, zh, es) { const l = v99sLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v99sE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function v99sDur(ms) { const s = Math.max(0, Math.round(ms / 1000)); const m = Math.floor(s / 60), r = s % 60; return v99sM(m ? m + "分" + r + "秒" : r + "秒", m ? m + " min " + r + " s" : r + " s", m ? m + "分" + r + "秒" : r + "秒", m ? m + " min " + r + " s" : r + " s"); }

/* ════════════ No.550 規制の AI 詳細調査の見張り ════════════ */
var V99S_REGQ = /^([^\n「」]{1,40}?)向けに日本から「[\s\S]{0,600}?最新の輸入規制を、Web検索で確認して/;
var V99S_HEAD = ["①", "②", "③", "④", "⑤", "⑥"];
var V99S_HEADNM = ["規制当局と根拠制度", "輸入登録・認証（要否・所要期間・費用目安）", "必要書類", "ラベル・表示要件", "関税・税", "直近1年の変更・注意点"];
function v99sRun(c) { return V99SHIP.runs[c] || null; }
function v99sRunsActive() { return Object.keys(V99SHIP.runs).map((k) => V99SHIP.runs[k]).filter((r) => r && (r.st === "run" || r.st === "stall")); }
/* 前回までに済んだ調査（結果の文・出典） */
function v99sPrev(c) {
  const o = { txt: "", cits: [], ts: "", h: "", eng: "" };
  try { const kb = typeof regKbOf === "function" ? regKbOf(c) : null; if (kb) { o.txt = String(kb.txt || ""); o.cits = (kb.cits || []).slice(0, 8); o.ts = String(kb.ts || ""); o.eng = String(kb.eng || ""); } } catch (e) { v99sErr("prev", e); }
  try { const st = typeof regStore === "function" ? regStore()[c] : null; if (st && st.h) { o.h = String(st.h); if (!o.ts) o.ts = String(st.ts || ""); } } catch (e) { v99sErr("prev2", e); }
  return o;
}
/* 答えの文を見出し（①〜⑥）ごとに分ける。確かめられなかった見出し＝無い・「確認できませんでした」だけ */
function v99sSplit(txt) {
  const out = {};
  try {
    const s = String(txt || "");
    const idx = V99S_HEAD.map((h) => { const re = new RegExp("(^|\\n)[#*\\s]*" + h); const m = re.exec(s); return m ? m.index + m[1].length : -1; });
    V99S_HEAD.forEach((h, i) => {
      const a = idx[i]; if (a < 0) return;
      let b = s.length; idx.forEach((x) => { if (x > a && x < b) b = x; });
      out[h] = s.slice(a, b).trim();
    });
  } catch (e) { v99sErr("split", e); }
  return out;
}
function v99sMissing(txt) {
  const S = v99sSplit(txt);
  return V99S_HEAD.filter((h) => { const t = S[h]; if (!t) return true; const body = t.replace(/^[#*\s]*[①-⑥][^\n]*\n?/, ""); return /確認できませんでした/.test(t) && body.replace(/確認できませんでした[。．]?/g, "").replace(/[\s・:：\-*#]/g, "").length < 12; });
}
/* 依頼の文が規制の AI 詳細調査か（調べ直しの中の呼び直しは除く） */
function v99sRegC(q, opts) {
  try { if (typeof q !== "string" || !opts || !opts.forceWeb) return ""; if (opts._v96rt || opts._v97rt || opts._v99in) return ""; const m = V99S_REGQ.exec(q); return m ? m[1] : ""; } catch (e) { return ""; }
}
/* 右下の札（aiThink）：調査の間に出た札を控える（未完了にしたら終わらせる） */
if (typeof aiThinkStart === "function") {
  const __ats99s = aiThinkStart;
  aiThinkStart = function (label) { // eslint-disable-line no-global-assign
    const id = __ats99s.apply(this, arguments);
    try {
      const A = v99sRunsActive().filter((r) => r.st === "run");
      if (A.length && /Web検索|規制|Web search/i.test(String(label || ""))) A[A.length - 1].ids.push(id);
      V99SHIP.ait.push({ id, at: Date.now(), label: String(label || "").slice(0, 80), end: 0 });
      if (V99SHIP.ait.length > 200) V99SHIP.ait.shift();
    } catch (e) { v99sErr("ats", e); }
    return id;
  };
}
if (typeof aiThinkEnd === "function") {
  const __ate99s = aiThinkEnd;
  aiThinkEnd = function (id, ok) { // eslint-disable-line no-global-assign
    try { const x = V99SHIP.ait.find((y) => y.id === id); if (x && !x.end) { x.end = Date.now(); x.ok = ok ? 1 : 0; } } catch (e) { v99sErr("ate", e); }
    return __ate99s.apply(this, arguments);
  };
}
function v99sEndIds(ids, why) {
  let n = 0;
  try {
    const live = (typeof AIT !== "undefined" && AIT && AIT.items) || [];
    (ids || []).forEach((id) => { if (live.some((x) => x && x.id === id)) { try { aiThinkEnd(id, false); n++; } catch (e) { v99sErr("endid", e); } } });
    if (n) { V99SHIP.n.end += n; const d = typeof AIT !== "undefined" && AIT && AIT.el; if (d && why && !(AIT.items || []).length) { const s = d.querySelector(".ats"); if (s) { s.textContent = why; s.setAttribute("data-noi18n", "1"); } } }
  } catch (e) { v99sErr("endids", e); }
  return n;
}
if (typeof llmAsk === "function") {
  const __la99s = llmAsk;
  llmAsk = function (q, maxTok, opts) { // eslint-disable-line no-global-assign
    const c = v99sRegC(q, opts);
    if (!c) return __la99s.apply(this, arguments);
    const tok = Date.now() + "." + Math.random().toString(36).slice(2, 7);
    const R = { c, tok, t0: Date.now(), last: Date.now(), st: "run", ids: [], att: 1, busy: "", res: null, err: "", cont: !!(opts && opts._v99cont), miss: (opts && opts._v99miss) || null };
    V99SHIP.runs[c] = R; V99SHIP.n.run++;
    const n0 = (typeof AIT !== "undefined" && AIT) ? AIT.n : 0;
    // 21.98 の順番待ち（V98MISC.al）に、この依頼が載せた数を控える（止まったら外す＝続き・やり直しが待たされないように）
    const AL = (window.V98MISC && V98MISC.al) || null;
    const s0 = AL ? { user: AL.user, heavy: AL.heavy, webUser: AL.webUser, webRes: Object.assign({}, AL.webRes) } : null;
    let p;
    try { p = Promise.resolve(__la99s.apply(this, arguments)); } catch (e) { R.st = "fail"; R.err = String((e && e.message) || e).slice(0, 160); V99SHIP.n.fail++; throw e; }
    try { const n1 = (typeof AIT !== "undefined" && AIT) ? AIT.n : 0; for (let i = n0 + 1; i <= n1; i++) if (R.ids.indexOf(i) < 0) R.ids.push(i); } catch (e) { v99sErr("ids", e); }
    try { if (AL && s0) { const d = {}; Object.keys(AL.webRes || {}).forEach((k) => { const x = (AL.webRes[k] || 0) - (s0.webRes[k] || 0); if (x > 0) d[k] = x; }); R.al = { user: Math.max(0, AL.user - s0.user), heavy: Math.max(0, AL.heavy - s0.heavy), webUser: Math.max(0, AL.webUser - s0.webUser), webRes: d }; } } catch (e) { v99sErr("al", e); }
    return p.then((r) => {
      if (V99SHIP.runs[c] === R || (V99SHIP.runs[c] && V99SHIP.runs[c].st !== "run")) { R.st = "done"; R.res = { n: (r && r.cits && r.cits.length) || 0, prov: (r && (r.provNm || r.prov)) || "" }; }
      else R.st = "done";
      return r;
    }, (e) => { R.st = "fail"; R.err = String((e && e.message) || e).slice(0, 160); V99SHIP.n.fail++; throw e; });
  };
}
/* 1秒ごと：調べ直しの文（何回目）が変わったら「動きあり」。一定時間動きが無ければ未完了に */
function v99sTick() {
  try {
    const now = Date.now();
    v99sRunsActive().forEach((R) => {
      const o = document.getElementById("regaiO");
      const busyOn = o && (o.querySelector(".v97reg-busy") || o.querySelector(".v96reg-busy"));
      const bt = busyOn ? (busyOn.textContent || "").trim() : "";
      if (bt && bt !== R.busy) { R.busy = bt; R.last = now; const m = bt.match(/（(\d)\s*／\s*3回目/); if (m) R.att = +m[1]; if (R.st === "stall") R.st = "run"; }
      if (R.st === "run" && now - R.last > V99SHIP.cfg.stallMs) {
        R.st = "stall"; R.stallAt = now; V99SHIP.n.stall++;
        const why = v99sM(`${R.c}の規制の AI 詳細調査：${v99sDur(now - R.t0)} 答えが返っていません（未完了）。規制の画面の「続きから調べる」「もう一度調べる」で進められます`,
          `AI regulation research for ${R.c}: no answer after ${v99sDur(now - R.t0)} (incomplete). Use “Continue” or “Research again” on the regulation screen.`,
          `${R.c}的法规AI详细调查：${v99sDur(now - R.t0)} 仍无回复（未完成）。可在法规页面“从中断处继续／重新调查”。`,
          `Investigación de normas de ${R.c}: sin respuesta tras ${v99sDur(now - R.t0)} (incompleta). Use «Continuar» o «Investigar de nuevo».`);
        v99sEndIds(R.ids, why);
        try { const AL = (window.V98MISC && V98MISC.al) || null; if (AL && R.al && !R.alFree) { R.alFree = 1; AL.user = Math.max(0, AL.user - R.al.user); AL.heavy = Math.max(0, AL.heavy - R.al.heavy); AL.webUser = Math.max(0, AL.webUser - R.al.webUser); Object.keys(R.al.webRes).forEach((k) => { AL.webRes[k] = Math.max(0, (AL.webRes[k] || 0) - R.al.webRes[k]); }); } } catch (e) { v99sErr("alfree", e); }
        try { if (typeof window.v99sPaintStall === "function") window.v99sPaintStall(R.c); } catch (e) { v99sErr("paintstall", e); }
      }
    });
    // どの依頼でも、答えが返らないまま長く残った札は「応答なし」で終わらせる（8分）
    const live = (typeof AIT !== "undefined" && AIT && AIT.items) || [];
    const old = live.filter((x) => x && now - (x.at || now) > V99SHIP.cfg.sweepMs).map((x) => x.id);
    if (old.length) { V99SHIP.n.sweep += old.length; v99sEndIds(old, v99sM("AI の答えが長い時間返っていません（未完了）。画面の内容を確かめて、もう一度お試しください", "No AI answer for a long time (incomplete). Please check and try again.", "AI 长时间未回复（未完成）。请确认后重试。", "Sin respuesta de la IA durante mucho tiempo (incompleta). Inténtelo de nuevo.")); }
  } catch (e) { v99sErr("tick", e); }
}
setInterval(v99sTick, 1000);

/* 「続きから調べる」：前回の答えで確かめられなかった見出しだけを調べ、済んだ見出し・出典と合わせる */
async function v99sRegContinue(c) {
  V99SHIP.n.cont++;
  const P = v99sPrev(c);
  const miss = P.txt ? v99sMissing(P.txt) : V99S_HEAD.slice();
  if (!P.txt || miss.length === V99S_HEAD.length) { try { return await regAIRun(c); } catch (e) { v99sErr("cont0", e); return null; } } // eslint-disable-line no-undef
  const done = V99S_HEAD.filter((h) => miss.indexOf(h) < 0);
  const head = (D && D.item) || ""; // eslint-disable-line no-undef
  const q = `${c}向けに日本から「${head}${D && D.itemEn ? "（" + D.itemEn + "）" : ""}・HSコード${(D && D.hs) || "不明"}・カテゴリ${(D && D.cat) || ""}」を輸出する際の最新の輸入規制を、Web検索で確認して日本語で整理してください。
前回の調査の続きです。前回すでに確かめた見出し（${done.join("")}）は書かず、まだ確かめられていない次の見出しだけを、各2〜3行の簡潔さで：
${miss.map((h) => h + V99S_HEADNM[V99S_HEAD.indexOf(h)]).join(" ")}
規則：確認できなかった項目は「確認できませんでした」と正直に書く。推測で断定しない。`; // eslint-disable-line no-undef
  try { if (typeof regAIView === "function") regAIView(c, `<div class="rw" style="gap:8px"><span class="spin"></span>${v99sE(v99sM("続きから調べています（" + miss.join("") + " だけ・済んだ " + done.join("") + " と出典 " + P.cits.length + "件は残します）…", "Continuing (" + miss.join("") + " only; keeping " + done.join("") + " and " + P.cits.length + " source(s))…"))}</div>`, ""); } catch (e) { v99sErr("contview", e); } // eslint-disable-line no-undef
  let r = null;
  try { r = await llmAsk(q, 1800, { forceWeb: 1, timeout: 150000, _v99cont: 1, _v99miss: miss }); } catch (e) {
    try { regAIView(c, `<div style="padding:11px;border:1px solid var(--crit);border-radius:8px;color:var(--crit)">調査に失敗しました：${v99sE(String((e && e.message) || e).slice(0, 110))}</div>`, ""); } catch (x) { v99sErr("conterr", x); } // eslint-disable-line no-undef
    return null;
  }
  try {
    const A = v99sSplit(P.txt), B = v99sSplit(r && r.txt);
    const merged = V99S_HEAD.map((h) => (miss.indexOf(h) >= 0 ? (B[h] || A[h] || h + V99S_HEADNM[V99S_HEAD.indexOf(h)] + "\n確認できませんでした。") : A[h])).filter(Boolean).join("\n\n");
    const cits = Array.from(new Set((P.cits || []).concat((r && r.cits) || []))).slice(0, 8);
    let h = (typeof ppFormat === "function" ? ppFormat(merged) : v99sE(merged).replace(/\n/g, "<br>")); // eslint-disable-line no-undef
    if (cits.length) h += `<div style="margin-top:10px;border:1px solid var(--bl);border-radius:8px;overflow:hidden"><div style="background:var(--bl-soft);padding:5px 10px;font-size:10px;font-weight:700;color:var(--bl)">🌐 出典</div><div style="padding:7px 11px;font-size:10.5px;line-height:1.9;word-break:break-all">${cits.slice(0, 8).map((u, i) => `[${i + 1}] <a href="${v99sE(u)}" target="_blank" rel="noopener" style="color:var(--bl)">${v99sE(String(u).replace(/^https?:\/\//, "").slice(0, 64))}</a>`).join("<br>")}</div></div>`;
    h += `<p class="nn" style="margin-top:8px">${v99sE(v99sM("続きから調べた見出し：" + miss.join("") + "（前回の " + done.join("") + " と出典はそのまま）", "Continued sections: " + miss.join("") + " (previous " + done.join("") + " and sources kept)"))}／使用エンジン：${v99sE((r && r.provNm) || "")}</p>`;
    const ts = typeof regKbNow === "function" ? regKbNow() : new Date().toLocaleString("ja-JP"); // eslint-disable-line no-undef
    regStore()[c] = { h, ts }; // eslint-disable-line no-undef
    const kb = regKbOf(c); kb.txt = merged; kb.ts = ts; kb.cits = cits.slice(0, 5); kb.eng = (r && r.provNm) || kb.eng || ""; // eslint-disable-line no-undef
    try { regKbSave(); } catch (e) { v99sErr("kbsave", e); } // eslint-disable-line no-undef
    regAIView(c, h, ts); // eslint-disable-line no-undef
    return r;
  } catch (e) { v99sErr("contmerge", e); return r; }
}
window.v99sRegContinue = v99sRegContinue;
window.v99sRegAgain = function (c) { V99SHIP.n.again++; try { return regAIRun(c); } catch (e) { v99sErr("again", e); return null; } }; // eslint-disable-line no-undef
V99SHIP.prev = v99sPrev; V99SHIP.missing = v99sMissing; V99SHIP.split = v99sSplit;

/* No.520（荷主側）小包（COURIER）で見積を頼んだときに、COURIER のレートを先に探す
   原因：fwdLegBuild は仕向港（例：韓国→釜山）で先に探すため、その港の LCL のレートが見つかると、国の名前で登録された COURIER のレート
         （仕向地＝韓国）に届かず、荷主が「再見積を依頼」で COURIER を選んでも LCL の見積が返っていた（荷主の画面に COURIER の行が出ない）。
   直し：COURIER の依頼で COURIER の見積にならなかったときだけ、国の名前で探し直す（COURIER のレートがあればそれを使う。無ければ元のまま）。 */
if (typeof fwdLegBuild === "function") {
  const __lb99s = fwdLegBuild;
  fwdLegBuild = function (cty, pod, mode) { // eslint-disable-line no-global-assign
    const r = __lb99s.apply(this, arguments);
    try {
      if (!/COURIER/i.test(String(mode || ""))) return r;
      if (r && r.ok && r.quote && /COURIER/i.test(String(r.quote.mode || ""))) return r;
      if (!cty) return r;
      const a = [].slice.call(arguments); a[1] = cty;
      // 21.56 の絞り込み（仕出港の一致・FOB では小包を外す）は、国内どこでも集荷の小包（仕出地「日本」）に当たらないため、
      // 荷主が自分で COURIER を選んだ依頼に限って外して探す（見つからなければ元の結果）
      let keep, has = false;
      try { has = typeof V56SHIP !== "undefined" && !!V56SHIP; if (has) { keep = V56SHIP.req; V56SHIP.req = null; } } catch (e) { has = false; } // eslint-disable-line no-undef
      let r2 = null;
      try { r2 = __lb99s.apply(this, a); } finally { try { if (has) V56SHIP.req = keep; } catch (e) { /* 戻すだけ */ } } // eslint-disable-line no-undef
      if (r2 && r2.ok && r2.quote && /COURIER/i.test(String(r2.quote.mode || ""))) { V99SHIP.n.cour = (V99SHIP.n.cour || 0) + 1; return r2; }
    } catch (e) { v99sErr("legbuild", e); }
    return r;
  };
}

/* ════════════ No.551・No.520 荷主の見積の状態（窓の札と要約の文をそろえる元） ════════════
   国ごと：届いた（物流会社の見積）・前の版の見積（日数の印だけ）・依頼中（レーン未登録）。どの物流会社の見積でも「届いた」と数える
   （21.92 の窓は、荷主の画面の会社名（FWDB.profile.co＝本番では空）と同じ会社の見積だけを「届いた見積」に数えていた） */
function v99sQuoteState(r) {
  const out = { legs: [], got: 0, pend: 0, old: 0, cour: 0, n: 0 };
  try {
    (r && Array.isArray(r.legs) ? r.legs : []).forEach((l) => {
      if (!l) return;
      const offs = (l.offers || []).filter((o) => o && o.quote);
      const q = l.quote || (offs[0] && offs[0].quote) || null;
      const ok = !!(l.ok && q);
      const co = l.sel || l.co || l.rec || (offs[0] && offs[0].co) || "";
      const mode = String((q && q.mode) || r.mode || "");
      const cour = /COURIER/i.test(mode) || !!(q && q.courier);
      const old = ok && !!(q && (q.ttMaybe || q.ttDef)) && !(q && q.ttEst);
      let days = "";
      if (ok) {
        let est = null, unk = false;
        try { est = typeof v97fLegEst === "function" ? v97fLegEst(l) : null; } catch (e) { est = null; }
        try { unk = typeof v98mUnkLeg === "function" ? !!v98mUnkLeg(l) : false; } catch (e) { unk = false; }
        if (est && est.lo != null) days = v99sM(`約${est.lo}〜${est.hi}日（目安・物流会社の確認前）`, `about ${est.lo}–${est.hi} days (estimate, before the forwarder confirms)`, `约${est.lo}〜${est.hi}天（参考・物流公司确认前）`, `unos ${est.lo}–${est.hi} días (estimación)`);
        else if (unk) days = v99sM("日数は要確認（物流会社に確認）", "days to be confirmed (ask the forwarder)", "天数待确认（请向物流公司确认）", "días por confirmar");
        else if (q && q.tt) days = v99sM(`約${q.tt}日`, `about ${q.tt} days`, `约${q.tt}天`, `unos ${q.tt} días`);
        else days = v99sM("日数は要確認", "days to be confirmed", "天数待确认", "días por confirmar");
      }
      const x = { cty: String(l.cty || ""), ok, old, cour, co: String(co || ""), mode, total: q ? +q.total || 0 : 0, valid: q ? String(q.valid || "") : "", days, n: offs.length, why: ok ? "" : (l.other ? "other" : "lane") };
      out.legs.push(x); out.n++;
      if (ok) out.got++; else out.pend++;
      if (old) out.old++;
      if (ok && cour) out.cour++;
    });
  } catch (e) { v99sErr("qstate", e); }
  return out;
}
window.v99sQuoteState = v99sQuoteState;
