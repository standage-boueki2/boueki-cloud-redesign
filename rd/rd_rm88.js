/* 貿易クラウドAI商社マン デザイン刷新：21.88「目標と道筋」＋「AI商社マンからの能動的な提案」を刷新版にも（2026-11-12 大森さん）
   今のアプリの層 logic_v2188rm.js（v88Eval・v88PropHtml・v88Get・v88Plan など）を呼ぶだけ。無い版（21.87 まで）では何もしない
   ① 左のメニューの「すべての機能」＞ホームに「目標と道筋」（今日やることの次）。よく使う5つ（三井さんの意見）はそのまま
   ② 案件一覧（ホーム）・タスク・AI商社マンの見出しのすぐ下に、AI商社マンからの提案（1つだけ・出しすぎない決まりはアプリの層のまま）と、
      目標の帯（目標・届く見込み・いまの段階・確からしさ → 目標と道筋へ）。今のアプリの層がたたんだ欄に入れた提案は外す（二重に出さない）
   ③ 目標と道筋の画面：見出しの文。長い説明（data-v88note）は rd_case.js の決まりに合わせて見出しの「？」へ
   ボタンは data-act（BCACT・アプリの層の rm.*）。onclick= と style= は書かない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD) return;
  const has = () => typeof v88Eval === "function" && typeof v88PropHtml === "function" && typeof v88Get === "function"; // eslint-disable-line no-undef
  if (!has()) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  try { if (RD.P && !RD.P.road) RD.P.road = '<path d="M3 20l6-6 4 4 8-8"/><path d="M15 6h6v6"/><circle cx="5" cy="5" r="2"/>'; } catch (e) { /* 無い版 */ }

  /* ① すべての機能のホームに「目標と道筋」 */
  (function nav() {
    const N = RD.NAV_S; if (!Array.isArray(N)) return;
    const g = N.find((x) => x.items && x.items.some((it) => it[0] === "today")) || N[0];
    if (!g || g.items.some((it) => it[0] === "rm")) return;
    const i = g.items.findIndex((it) => it[0] === "today");
    g.items.splice(i >= 0 ? i + 1 : g.items.length, 0, ["rm", "目標と道筋", "road"]);
    try { if (typeof RD.buildSide === "function") RD.buildSide(); } catch (e) { /* 描き直しは次の画面で */ }
  })();

  /* ② 提案カードと目標の帯 */
  const FEAS = { easy: ["今のペースでも届く見込み", "good"], yes: ["標準のペースで届く見込み", "good"], stretch: ["挑戦のペースなら届く見込み", "warn"], no: ["今の道筋では届かない見込み", "crit"] };
  function stripHtml() {
    const R = v88Get(); // eslint-disable-line no-undef
    const G = v88Goal(R); // eslint-disable-line no-undef
    if (!G) return `<div class="k-rm88g"><span class="k-rm88i">🎯</span><span class="k-rm88t"><b>目指す貿易の姿を教えてください</b><span>達成の年数・道筋・費用・期待できる売上を、STANDAGE の記録から出します</span></span><button class="btn" type="button" data-act="rm.form">目標を入れる</button></div>`;
    let pl = null; try { pl = v88Plan(R); } catch (e) { pl = null; } // eslint-disable-line no-undef
    if (!pl) return "";
    const f = FEAS[pl.feas] || null;
    const tgt = pl.T ? `${esc(G.year || "")}年に海外売上 ${esc(v88Man(pl.T.v))}` : "目標の金額が未記入"; // eslint-disable-line no-undef
    return `<div class="k-rm88g"><span class="k-rm88i">🎯</span><span class="k-rm88t"><b>${tgt}</b><span>${f ? `<em class="k-rm88f k-rm88f-${f[1]}">${esc(f[0])}</em>・` : ""}いま「${esc(v88StNm(pl.st.stage))}」・確からしさ ${pl.conf.score}</span></span><button class="btn g" type="button" data-act="rm.open">目標と道筋を見る</button></div>`; // eslint-disable-line no-undef
  }
  function propNow() {
    let p = null; try { p = v88Eval(); } catch (e) { p = null; } // eslint-disable-line no-undef
    try { if (typeof V88 !== "undefined" && V88.noask) { const q = v88Get().props.find((x) => x && x.id === V88.noask); if (q) p = q; } } catch (e) { /* 無い */ } // eslint-disable-line no-undef
    return p;
  }
  function put(w, withStrip) {
    if (!w) return;
    $$(".k-rm88", w).forEach((x) => x.remove());
    $$(".v88prop", w).forEach((x) => { if (!x.closest(".k-rm88")) x.remove(); }); // 今のアプリの層が入れた提案（ホームではたたんだ欄の中）は外す
    const p = propNow();
    let noGoal = false; try { noGoal = !v88Goal(v88Get()); } catch (e) { noGoal = false; } // eslint-disable-line no-undef
    if (withStrip && p && p.kind === "goal" && noGoal) withStrip = false; // 目標を聞く提案が出ているときは帯で同じことを言わない
    const html = `<div class="rd-x k-rm88">${p ? v88PropHtml(p, true) : ""}${withStrip ? stripHtml() : ""}</div>`; // eslint-disable-line no-undef
    if (!p && !withStrip) return;
    const hero = $("[data-rdhero]", w);
    if (hero) hero.insertAdjacentHTML("afterend", html); else w.insertAdjacentHTML("afterbegin", html);
    try { if (p && p.st === "new") { p.st = "seen"; v88Save(); } } catch (e) { /* 無い */ } // eslint-disable-line no-undef
  }
  const chain = (k, fn) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { fn(w, kk); } catch (e) { console.error("[rd] rm88 " + k, e); } }; };
  chain("dash:home", (w) => put(w, true));
  chain("today", (w) => put(w, false));
  chain("ai", (w) => put(w, true));

  /* ③ 目標と道筋の画面 */
  chain("rm", (w) => {
    const h = $("[data-rdhero]", w);
    if (h) {
      const h1 = $(".rd-ht h1", h), p = $(".rd-ht p", h);
      if (h1) h1.textContent = "目標と道筋";
      if (p) p.textContent = "目指す貿易の姿から、達成の年数・道筋・費用の目安・期待できる売上を出し、貿易の進みに合わせて AI商社マンから提案します。根拠は STANDAGE の記録（商談記録の匿名の集計）と、確かめた公的な情報です。";
    }
    $$("[data-v88note]", w).forEach((x) => x.classList.add("nn")); // 長い説明は rd_case.js の決まりで見出しの「？」へ
    const pr = $(":scope > .v88prop", w); if (pr && h && pr.previousElementSibling !== h) h.after(pr);
  });
  // 提案の答え（あとで・今は要らない・タスク）でアプリの層が描き直すとき、刷新版のホームの帯も描き直す
  try {
    if (typeof v88Repaint === "function") { // eslint-disable-line no-undef
      const r0 = v88Repaint; // eslint-disable-line no-undef
      window.v88Repaint = function () { const r = r0.apply(this, arguments); try { const k = RD.curKey && RD.curKey(); if (k === "dash:home" || k === "today" || k === "ai") put($("#well"), k !== "today"); } catch (e) { /* 無視 */ } return r; };
    }
  } catch (e) { /* 無い */ }
})();
