/* 22.00 分野「ai」の見せ方（刷新版）：AI の残りの帯・始める前の見積もり・途中で止まった資料の知らせ・AI の気づきの未実施・
   バイヤーリストの状態（見本に置き換えない・公式サイトの確かめの n/m）・出どころの無い詳細調査・429 などの言葉・相談の進み具合 */
(function () {
  "use strict";
  const W = window, V = W.V100AI;
  if (!V || V.rdLoaded) return;
  V.rdLoaded = 1;
  const M = V.M, F = V.F, E = V.E;
  const err = (k, e) => V.errf("rd " + k, e);
  const ten = V.ten;
  function curKey() { try { return (W.RDX && typeof RDX.curKey === "function" && RDX.curKey()) || (typeof cur !== "undefined" ? cur : ""); } catch (e) { return ""; } } // eslint-disable-line no-undef
  function hm(ms) { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60); return h ? F(M("{h}時間{m}分", "{h}h {m}m"), { h, m: m % 60 }) : F(M("{m}分", "{m} min"), { m }); }
  function pct(r) { return Math.round((r || 0) * 100); }
  function amt(n) { return F(M("約{n}トークン", "about {n} tokens"), { n: V.fmtN(n) }); }
  function d2(ms) { try { const d = new Date(ms); return (d.getMonth() + 1) + "/" + d.getDate() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); } catch (e) { return ""; } }
  function md(ms) { try { const d = new Date(ms); return (d.getMonth() + 1) + "/" + d.getDate(); } catch (e) { return ""; } }

  /* ═════════ 始める前の見積もり（No.598 ②）═════════ */
  W.v100aiPreAsk = function (k, P) {
    return new Promise((res) => {
      try {
        if (typeof openDW !== "function") { res(P.hit ? "cancel" : "go"); return; } // eslint-disable-line no-undef
        const B = P.B || W.v100aiBudget();
        const nm = V.opName(k);
        const head = P.hit ? "⛔ " + M("今日の AI の上限に達しています", "Today's AI limit has been reached") : "⚠ " + M("AI の残りが足りないかもしれません", "You may not have enough AI left today");
        const body = P.hit
          ? F(M("{op}は AI を使います。今日の AI の上限（{cap}）に達しているため、いま AI で作ると途中で止まります。上限は毎日 0時（日本時間）に戻ります（あと {r}）。", "{op} uses AI. Today's limit ({cap}) has been reached, so it would stop partway. The limit resets at midnight JST (in {r})."), { op: nm, cap: B.cap ? V.fmtN(B.cap) : "—", r: hm(B.resetAt - Date.now()) })
          : F(M("{op}には AI を{need}使う見込みです（目安）。今日の残りは{left}（{p}%）です。上限は 0時（日本時間）に戻ります（あと {r}）。", "{op} is expected to use {need} (estimate). You have {left} left today ({p}%). Resets at midnight JST (in {r})."), { op: nm, need: amt(P.need), left: amt(B.left), p: 100 - pct(B.ratio), r: hm(B.resetAt - Date.now()) });
        const shared = B.shared ? `<p class="nn">${E(M("このアカウントの上限は、同じコードを使う人全員で共有しています（ほかの人の使い方で残りが減ります）。", "This account's limit is shared by everyone using the same code."))}</p>` : "";
        const keep = `<p class="nn">${E(M("途中で上限に達したときも、そこまでの成果（下書きなど）は保存し、0時以降に続きから作れます。", "If the limit is reached partway, what was made so far is saved and can be continued after midnight."))}</p>`;
        const bt = [];
        if (!P.hit) bt.push(["go", k === "deck" ? M("AI で作る（止まったら下書きを保存）", "Create with AI (draft saved if it stops)") : k === "ob" ? M("AI でリストを作る", "Build the list with AI") : M("AI で調べる", "Research with AI"), ""]);
        if (k === "deck") bt.push(["offline", M("AI を使わずに基本の下書きを作る（登録データから・外国語にはなりません）", "Make a basic draft without AI (from your data; not translated)"), "g"]);
        if (k === "ob") bt.push(["offline", M("AI を使わずに、前のリストと自社のバイヤーから出す", "Show companies from earlier lists and your buyers (no AI)"), "g"]);
        bt.push(["cancel", M("やめる（0時以降に作る）", "Cancel (do it after midnight)"), "g"]);
        const html = `<div class="v100ai-pre" data-v100pre="${E(k)}" data-noi18n="1" role="dialog" aria-labelledby="v100preh"><h3 id="v100preh">${E(head)}</h3><p>${E(body)}</p>${shared}${keep}<div class="v100ai-btns">${bt.map((b) => `<button type="button" class="btn ${b[2]}" data-v100pre-a="${b[0]}">${E(b[1])}</button>`).join("")}</div></div>`;
        openDW(html); // eslint-disable-line no-undef
        let done = false;
        const fin = (a) => { if (done) return; done = true; clearInterval(tk); try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } res(a); }; // eslint-disable-line no-undef
        const box = document.querySelector('[data-v100pre="' + k + '"]');
        if (box) box.querySelectorAll("[data-v100pre-a]").forEach((b) => b.addEventListener("click", () => fin(b.getAttribute("data-v100pre-a"))));
        const tk = setInterval(() => { if (!document.querySelector('[data-v100pre="' + k + '"]')) { done = true; clearInterval(tk); res("cancel"); } }, 500);
        setTimeout(() => { try { const b = document.querySelector('[data-v100pre-a]'); if (b) b.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }, 60);
      } catch (e) { err("pre", e); res(P.hit ? "cancel" : "go"); }
    });
  };

  /* ═════════ 画面の上の帯：AI の残りの目安と「0時に戻る」（No.598 ②⑥）═════════ */
  function heldItems() {
    const T = ten(), out = [];
    if (!T) return out;
    try { const p = T.deck3 && T.deck3.v100partial; Object.keys(p || {}).forEach((l) => { if (p[l]) out.push(F(M("英語などの営業資料（{l}）：基本の下書きを保存・AI の仕上げは未実施", "Sales deck ({l}): basic draft saved; AI finishing not done"), { l: (typeof DECK_L !== "undefined" && DECK_L[l] && DECK_L[l].name) || l })); }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    try { if (T.v100xq && !T.v100xq.done) out.push(M("AI の気づき・追加の分析：未実施（決まった質問で続けました）", "AI notes / follow-up analysis: not run (fixed questions were used)")); } catch (e) { /* 無視 */ }
    try { const S = T.v71ob; ((S && S.runs) || []).slice(-3).forEach((r) => { if (r && r.v100 && (r.how === "v100none" || r.how === "v100own")) out.push(F(M("バイヤーリスト（{c}）：AI の新しいリストは未作成", "Buyer list ({c}): new AI list not made"), { c: r.cty })); }); } catch (e) { /* 無視 */ }
    return out;
  }
  V.heldItems = heldItems;
  function barHtml(B, lv) {
    const r = hm(B.resetAt - Date.now());
    let h = "";
    if (lv === "hit") {
      const H = heldItems();
      h = `<b>⛔ ${E(M("今日の AI の上限に達しました", "Today's AI limit has been reached"))}</b>${B.cap && B.used >= B.cap ? `<span>${E(F(M("（{u}／{c}トークン）", " ({u} / {c} tokens)"), { u: V.fmtN(B.used), c: V.fmtN(B.cap) }))}</span>` : ""}
        <p>${E(F(M("0時（日本時間）に戻ります（あと {r}）。それまでは、登録データからの答え・基本の下書き・決まった質問で続けられます。途中まで作ったものは消さずに保存しています。", "Resets at midnight JST (in {r}). Until then you can continue with answers from your data, basic drafts and fixed questions. Work in progress is saved."), { r }))}</p>
        ${H.length ? `<p class="v100ai-held">${E(M("0時以降に続きから：", "Continue after midnight: "))}${H.map(E).join(M("／", " / "))}</p>` : ""}`;
    } else if (lv === "low") {
      h = `<b>⚠ ${E(F(M("AI の今日の残りが {p}% を切りました（{l}）", "Less than {p}% of today's AI is left ({l})"), { p: 100 - Math.floor(V.RESERVE * 100), l: amt(B.left) }))}</b>
        <p>${E(F(M("0時（日本時間）に戻ります（あと {r}）。残りは、ボタンで始める操作のために取り置き、気づき・提案などの自動の AI は止めています。英語資料（目安 {d}）などは、始める前に残りと比べてお知らせします。", "Resets at midnight JST (in {r}). The rest is kept for actions you start; automatic AI (notes, suggestions) is paused. Heavy tasks (deck ≈ {d}) are checked before they start."), { r, d: amt(V.estOf("deck")) }))}</p>`;
    } else {
      h = `<b>ℹ ${E(F(M("AI の今日の残りは約 {p}%（{l}）です", "About {p}% of today's AI is left ({l})"), { p: 100 - pct(B.ratio), l: amt(B.left) }))}</b>
        <p>${E(F(M("0時（日本時間）に戻ります（あと {r}）。重い処理（英語資料 目安 {d}・バイヤーリスト 目安 {o}）は、始める前に残りと比べてお知らせします。", "Resets at midnight JST (in {r}). Heavy tasks (deck ≈ {d}, buyer list ≈ {o}) are checked against what is left before they start."), { r, d: amt(V.estOf("deck")), o: amt(V.estOf("ob")) }))}</p>`;
    }
    if (B.shared) h += `<p class="nn">${E(M("この上限は、同じコードを使う人全員で共有しています。", "This limit is shared by everyone using the same code."))}</p>`;
    return `<div class="v100ai-bb">${h}</div><button type="button" class="btn g v100ai-bx" data-v100act="barx">${E(M("閉じる", "Close"))}</button>`;
  }
  V.hideLv = "";
  function paintBar() {
    try {
      const w = document.getElementById("well");
      let b = document.getElementById("v100aiBud");
      if (!w || (typeof SES !== "undefined" && SES && SES.role === "fwd")) { if (b) b.remove(); return; } // eslint-disable-line no-undef
      const B = W.v100aiBudget();
      const lv = B.hit ? "hit" : (B.known && B.ratio != null && B.ratio >= V.RESERVE) ? "low" : (B.known && B.ratio != null && B.ratio >= 0.7) ? "warn" : "";
      document.body.classList.toggle("v100ai-hit", lv === "hit" && V.hideLv !== "hit");
      if (!lv || V.hideLv === lv) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement("div"); b.id = "v100aiBud"; b.setAttribute("role", "status"); b.setAttribute("data-noi18n", "1"); }
      b.className = "v100ai-bar v100ai-" + lv;
      const key = lv + ":" + Math.round((B.ratio || 0) * 100) + ":" + V.lang() + ":" + heldItems().length + ":" + Math.floor((B.resetAt - Date.now()) / 600000);
      if (b.dataset.k !== key) { b.innerHTML = barHtml(B, lv); b.dataset.k = key; }
      if (b.parentNode !== w || w.firstElementChild !== b) w.insertBefore(b, w.firstChild);
    } catch (e) { err("bar", e); }
  }
  V.paintBar = paintBar;

  /* ═════════ 英語資料が途中で止まったときの知らせ（No.598 ③）═════════ */
  function deckBox() {
    try {
      const w = document.getElementById("well");
      const old = document.getElementById("v100aiDeck");
      if (!w || curKey() !== "deck") { if (old) old.remove(); return; }
      const T = ten(); const P = T && T.deck3 && T.deck3.v100partial;
      const ls = Object.keys(P || {}).filter((l) => P[l]);
      if (!ls.length) { if (old) old.remove(); return; }
      const run = typeof DK3G !== "undefined" && DK3G && DK3G.run; // eslint-disable-line no-undef
      const hit = !!W.v100aiBudget().hit;
      const h = ls.map((l) => {
        const p = P[l], nm = (typeof DECK_L !== "undefined" && DECK_L[l] && DECK_L[l].name) || l; // eslint-disable-line no-undef
        const why = p.reason === "cap" ? M("今日の AI の上限", "today's AI limit") : M("AI の失敗", "an AI error");
        const st = p.stage && p.stage !== "start" ? F(M("{n}段目「{s}」で止まりました", "stopped at step {n} ({s})"), { n: V.stageNo(p.stage), s: V.stageName(p.stage) }) : M("AI を使わずに作りました", "made without AI");
        return `<div class="v100ai-dk" data-v100dk="${E(l)}"><p><b>⚠ ${E(F(M("{nm}：AI の仕上げは{w}のため未実施です", "{nm}: AI finishing not done ({w})"), { nm, w: why }))}</b>（${E(st)}・${E(d2(p.at))}）</p>
          <p>${E(p.kept ? M("AI が書いた文章（照合の前）で下書きを保存しました。照合・訳・最終チェックは済んでいません（要修正）。", "A draft was saved with the AI-written text (before fact-checking). Checking, translation and final check are not done (needs fixing).") : M("登録データから組んだ基本の下書きを保存しました（外国語にはなっていません・要修正）。", "A basic draft built from your data was saved (not translated; needs fixing)."))}
          ${E(M("0時（日本時間）以降に「続きから AI で仕上げる」で作り直せます。下書きは残ります。", "After midnight JST, use “Continue with AI” to finish it. The draft is kept."))}</p>
          <button type="button" class="btn" data-v100act="dkresume" data-l="${E(l)}" ${run || hit ? "disabled" : ""}>${E(M("続きから AI で仕上げる", "Continue with AI"))}</button>${hit ? `<span class="nn">${E(M("（いまは上限のため押せません・0時以降）", "(not available until midnight)"))}</span>` : ""}</div>`;
      }).join("");
      let b = old;
      if (!b) { b = document.createElement("div"); b.id = "v100aiDeck"; b.className = "c v100ai-dkc"; b.setAttribute("role", "status"); b.setAttribute("data-noi18n", "1"); }
      if (b.dataset.k !== h) { b.innerHTML = h; b.dataset.k = h; }
      const bar = document.getElementById("v100aiBud");
      const ref = bar && bar.parentNode === w ? bar.nextSibling : w.firstChild;
      if (b.parentNode !== w || (bar ? b.previousElementSibling !== bar : w.firstElementChild !== b)) w.insertBefore(b, ref);
    } catch (e) { err("deckBox", e); }
  }

  /* ═════════ AI の気づき：未実施を出し、後で実行できる（No.598 ④）═════════ */
  function notesBoxHtml(T) {
    const x = T && T.v100xq;
    if (!x || x.done) return "";
    const hit = !!W.v100aiBudget().hit;
    return `<div class="v100ai-nt" data-v100nt="1" data-noi18n="1" role="note"><p><b>🤖 ${E(M("AI の気づき：未実施", "AI notes: not run"))}</b>（${E(V.whyTxt(x.why))}・${E(d2(x.at))}）</p>
      <p class="nn">${E(F(M("商品登録のヒアリングの最後の「AI の追加の分析」は行っていません。代わりに決まった質問 {n}問で続けました。AI の気づき（資料から読み取れる注意点）は、下のボタンで後から出せます。", "The AI follow-up analysis at the end of the interview was not run; {n} fixed questions were used instead. You can get AI notes later with the button below."), { n: x.n || 0 }))}</p>
      <button type="button" class="btn g" data-v100act="notes" ${hit || V.notesBusy ? "disabled" : ""}>${E(V.notesBusy ? M("AI が読み直しています…", "The AI is reading…") : M("AI の気づきを出す", "Get AI notes"))}</button>${hit ? `<span class="nn">${E(M("（0時〈日本時間〉以降に押せます）", "(available after midnight JST)"))}</span>` : ""}</div>`;
  }
  if (typeof W.v68pNoteHtml === "function" && !W.v68pNoteHtml.__v100ai) {
    const __nh = W.v68pNoteHtml;
    const g = function () { let h = __nh.apply(this, arguments); try { const t = ten(); const add = notesBoxHtml(t); if (add) h = String(h || "") + add; } catch (e) { err("noteHtml", e); } return h; };
    g.__v100ai = 1; W.v68pNoteHtml = g;
  }
  function notesDom() {
    try {
      const w = document.getElementById("well");
      if (!w) return;
      const k = curKey();
      const T = ten();
      const want = T && T.v100xq && !T.v100xq.done && /^(item|up|prod|info)$/.test(k);
      const has = w.querySelector("[data-v100nt]");
      if (!want) { if (has && T && T.v100xq && T.v100xq.done) has.remove(); return; }
      if (has) {
        // 上限が戻った・実行中になった などで、ボタンの状態が変わったら描き直す
        const d0 = document.createElement("div"); d0.innerHTML = notesBoxHtml(T); const el0 = d0.firstElementChild;
        if (el0 && el0.innerHTML !== has.innerHTML) has.innerHTML = el0.innerHTML;
        return;
      }
      if (!has) { const d = document.createElement("div"); d.innerHTML = notesBoxHtml(T); const el = d.firstElementChild; if (el) { el.classList.add("c"); const bar = document.getElementById("v100aiBud"); const ref = bar && bar.parentNode === w ? bar.nextSibling : w.firstChild; w.insertBefore(el, ref); } }
    } catch (e) { err("notesDom", e); }
  }

  /* ═════════ バイヤーリスト：状態の見せ方（No.598 ⑤・No.597）═════════ */
  function srcLabel(l) {
    if (l.v100src && l.v100src.k === "prev") return F(M("出どころ：前のリスト（{d} 作成・AI が挙げた会社{i}）", "Source: earlier list ({d}, listed by AI{i})"), { d: md(l.v100src.at), i: l.v100src.same ? "" : M("・別の商品「" + (l.v100src.item || "") + "」のとき", ", for another product") });
    if (l.v100src && l.v100src.k === "own") return M("出どころ：自社のバイヤー（登録）", "Source: your registered buyers");
    return "";
  }
  function chkLine(run) {
    if (!run || run.how === "smp" || run.v100smp) return "";
    const all = (run.leads || []).filter((l) => !l.smp);
    // 22.00.1 v2 N10：見出しの社数（届かない会社を外した表の数）と同じ数で数える。外した会社・URL の無い会社は別に書く
    const L = all.filter((l) => !l.v79x);
    const gone = all.length - L.length;
    if (!L.length && !gone) return "";
    const ok = (l) => !!(l && l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st));
    const c = run.v100chk || { capped: !!(run.v79chk && run.v79chk.why === "cap") };
    if (!run.v79chk && !run.v100chk) return "";
    const done = L.filter(ok).length;
    const noUrl = L.filter((l) => !ok(l) && !String(l.url || "").trim()).length;
    const rest = L.length - done - noUrl;
    const reuse = L.filter((l) => l.v100reuse).length;
    const capped = !!c.capped && rest > 0;
    let t = F(M("公式サイトの確認：{a}/{n}社", "Website check: {a}/{n}"), { a: done, n: L.length });
    if (gone) t += F(M("（ほかに、公式サイトに届かず外した {g}社）", " (plus {g} removed: website unreachable)"), { g: gone });
    if (reuse) t += F(M("（うち {r}社は前に確かめた結果を使いました・確かめた日を各行に書いています）", " ({r} reused from earlier checks; date on each row)"), { r: reuse });
    if (capped) t += "。" + F(M("今日の確かめの上限のため、残り {k}社はまだ確かめていません。0時（日本時間）以降に「確かめ直す」で続きから確かめられます。まだの会社は「要確認」のままです。", " The daily check limit was reached, so {k} companies are not checked yet. Use “Check again” after midnight JST to continue. Unchecked rows stay “to be confirmed”."), { k: rest });
    else if (rest) t += "。" + F(M("{k}社はまだ確かめていません（「要確認」のまま）。", " {k} companies not checked yet (still “to be confirmed”)."), { k: rest });
    if (noUrl) t += (rest || capped ? "" : "。") + F(M("公式サイトの URL が無い {u}社は確かめられません（「要確認」のまま・会社名で調べてください）。", " {u} companies have no website URL and cannot be checked (still “to be confirmed”)."), { u: noUrl });
    return `<div class="v100ai-chk${capped ? " cap" : ""}" data-v100chk="1" role="status" data-noi18n="1"><span>🔎 ${E(t)}</span>${rest ? `<button type="button" class="btn g" data-v79chk="1" data-v100chkbtn="1">${E(F(M("確かめ直す（まだの {k}社）", "Check again ({k} left)"), { k: rest }))}</button>` : ""}</div>`;
  }
  if (typeof W.v79obCheckHtml === "function" && !W.v79obCheckHtml.__v100ai) {
    const __ch = W.v79obCheckHtml;
    const g = function (run) {
      try { if (run && (run.v100chk || (run.v79chk && run.v79chk.st !== "ok"))) { const h = chkLine(run); if (h) return h; } } catch (e) { err("chkHtml", e); }
      return __ch.apply(this, arguments);
    };
    g.__v100ai = 1; W.v79obCheckHtml = g;
  }
  function obBanner(run) {
    if (!run) return "";
    if (run.v100smp) return `<div class="v100ai-smp" role="note" data-noi18n="1"><b>${E(M("架空", "FICTIONAL"))}</b><span>${E(M("これは利用者が選んだ見本（架空）のリストです。実在の会社ではありません。送り先には使えません。", "This is a fictional sample list you chose to view. These are not real companies and cannot be contacted."))}</span></div>`;
    if (!run.v100) return "";
    const x = run.v100;
    const why = x.reason === "cap" ? M("今日の AI の上限に達したため", "Today's AI limit was reached") : x.reason === "reserve" ? M("AI の残りが少ないため（取り置き）", "Little AI left (kept in reserve)") : x.reason === "off" ? M("AI につながっていないため", "The AI is not connected") : M("AI が応答しなかったため", "The AI did not respond");
    const hit = !!W.v100aiBudget().hit;
    return `<div class="v100ai-ob" role="status" data-noi18n="1"><p><b>⚠ ${E(F(M("{w}、AI の新しいリストは作れていません（{d}）", "{w}: a new AI list was not made ({d})"), { w: why, d: d2(x.at) }))}</b></p>
      <p>${E(x.n ? F(M("下は、前に AI が挙げた会社と自社のバイヤーから出した {n}社です（出どころを各行に書いています）。見本の架空の会社には置き換えていません。", "Below are {n} companies from earlier AI lists and your buyers (source on each row). No fictional companies were substituted."), { n: x.n }) : M("前のリスト・自社のバイヤーに、この国の会社はありませんでした。見本の架空の会社には置き換えていません。", "No companies for this country in earlier lists or your buyers. No fictional companies were substituted."))}
      ${E(M("0時（日本時間）以降に「AI で作り直す」で新しいリストを作れます。", "Rebuild with AI after midnight JST."))}</p>
      <div class="v100ai-btns"><button type="button" class="btn" data-v100act="obre" ${hit ? "disabled" : ""}>${E(M("AI で作り直す", "Rebuild with AI"))}</button><button type="button" class="btn g" data-v100act="obsmp">${E(M("見本（架空）のリストを見る", "View a fictional sample list"))}</button></div></div>`;
  }
  if (typeof W.v71obTable === "function" && !W.v71obTable.__v100ai) {
    const __tb = W.v71obTable;
    const g = function (run) {
      let h = String(__tb.apply(this, arguments) || "");
      try {
        (run && run.leads || []).forEach((l) => {
          const lab = [srcLabel(l), l.v100reuse ? F(M("公式サイト：前に確かめた結果（{d}）", "Website: earlier check ({d})"), { d: md(l.v100reuse.at) }) : ""].filter(Boolean);
          if (!lab.length) return;
          const k = `data-v71row="${E(l.id)}"`;
          const i = h.indexOf(k); if (i < 0) return;
          const j = h.indexOf("</b>", i); if (j < 0) return;
          h = h.slice(0, j + 4) + `<span class="v100ai-src" data-noi18n="1">${E(lab.join("／"))}</span>` + h.slice(j + 4);
        });
        h = obBanner(run) + h;
      } catch (e) { err("obTable", e); }
      return h;
    };
    g.__v100ai = 1; W.v71obTable = g;
  }
  if (typeof W.v71obInner === "function" && !W.v71obInner.__v100ai) {
    const __in = W.v71obInner;
    const g = function () {
      let run = null, e0 = "";
      try { run = typeof v71obRun === "function" ? v71obRun() : null; if (run && (run.v100 || run.v100smp) && run.err) { e0 = run.err; run.err = ""; } } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      let h;
      try { h = String(__in.apply(this, arguments) || ""); } finally { if (e0) run.err = e0; }
      try {
        // リストが空（AI の失敗・上限）のときも、状態とボタンを出す（v71obTable は空の表）
        if (run && run.v100 && !(run.leads || []).length && h.indexOf("v100ai-ob") < 0) h = h.replace(/(<div class="v71runhd">[\s\S]*?<\/div>)/, "$1" + obBanner(run));
        if (run && run.how === "v100none") h = h.replace(/AI がつくったリスト/, M("リスト（AI のリストは未作成）", "List (AI list not made)"));
        if (run && run.how === "v100own") h = h.replace(/AI がつくったリスト/, M("前のリストから出した会社（AI の新しいリストは未作成）", "Companies from earlier lists (new AI list not made)"));
        if (run && run.v100smp) h = h.replace(/AI がつくったリスト/, M("見本（架空）のリスト", "Fictional sample list"));
      } catch (e) { err("obInner", e); }
      return h;
    };
    g.__v100ai = 1; W.v71obInner = g;
  }

  /* ═════════ 22.00.1 v2 N7：相談の答えの「いまの段階」で、下書きの資料を「できた」と言わない（資料の状態は flow の v100deckState）═════════ */
  function deckStateOf(t) {
    try { if (typeof W.v100deckState === "function") return W.v100deckState(t); } catch (e) { /* 自分で数える */ }
    try {
      const d3 = t && t.deck3, last = d3 && d3.last;
      const part = d3 && d3.v100partial && Object.keys(d3.v100partial).map((k) => d3.v100partial[k]).filter(Boolean)[0];
      if (part) return { state: "partial" };
      if (last) return { state: last.pass ? "final" : (+last.n ? "draft" : "failed") };
    } catch (e) { /* 無視 */ }
    return { state: "none" };
  }
  V.deckStateOf = deckStateOf;
  if (typeof W.v92aiRoadHtml === "function" && !W.v92aiRoadHtml.__v100ai) {
    const __rh = W.v92aiRoadHtml;
    const g = function () {
      let h = String(__rh.apply(this, arguments) || "");
      try {
        if (/data-v92ai-road="4"/.test(h)) {
          const st = deckStateOf(ten()).state;
          const lab = st === "draft" ? M("外国語の営業資料の下書き（要修正）がある", "Sales deck draft exists (needs fixing)")
            : st === "partial" ? M("外国語の営業資料の基本の下書きがある（AI の仕上げは未実施）", "Basic sales deck draft exists (AI finishing not done)")
              : st === "failed" ? M("外国語の営業資料は作成に失敗（作り直しが必要）", "Sales deck generation failed (needs to be redone)")
                : st === "none" ? M("外国語の営業資料はまだない", "No sales deck yet") : "";
          if (lab) h = h.replace(/<b>(?:外国語の営業資料ができた|Sales deck ready)<\/b>/, "<b>" + E(lab) + "</b>");
        }
      } catch (e) { err("road", e); }
      return h;
    };
    g.__v100ai = 1; W.v92aiRoadHtml = g;
  }

  /* ═════════ No.550 出どころの無い詳細調査（国別戦略）═════════ */
  function srcFacts(c) {
    const out = [];
    try {
      const b = typeof ctyDeepBase === "function" ? ctyDeepBase(c) : null; // eslint-disable-line no-undef
      if (!b) return out;
      if (b.exportUsd > 0) out.push([F(M("日本からの輸出の実績（HS {hs}・{y}）：約 US${v}{s}{yy}", "Exports from Japan (HS {hs}, {y}): about US${v}{s}{yy}"), { hs: b.hs || "—", y: b.statsYear || "—", v: Math.round(b.exportUsd).toLocaleString(), s: b.share ? M("・日本の輸出の中の割合 ", ", share ") + (Math.round(b.share * 1000) / 10) + "%" : "", yy: b.yoy != null && isFinite(b.yoy) ? M("・前年比 ", ", YoY ") + (b.yoy >= 0 ? "+" : "") + Math.round(b.yoy * 100) + "%" : "" }), M("アプリの内蔵の通関統計の集計", "app's built-in customs statistics")]);
      if (b.duty && b.duty !== "要確認") out.push([F(M("関税：{d}", "Duty: {d}"), { d: b.duty }), M("アプリの内蔵の規制・関税のデータ（要確認）", "app's built-in regulation/duty data (to be confirmed)")]);
      if ((b.docs || []).length) out.push([F(M("必要になりやすい書類：{d}", "Documents often needed: {d}"), { d: b.docs.slice(0, 4).map((x) => Array.isArray(x) ? x[0] : String(x)).join("・") }), M("アプリの規制のひな形（要確認）", "app's regulation templates (to be confirmed)")]);
      if (b.authority) out.push([F(M("確かめ先：{a}", "Where to confirm: {a}"), { a: typeof b.authority === "string" ? b.authority : (b.authority.n || b.authority.name || "") }), M("アプリの内蔵の窓口のデータ", "app's built-in authority data")]);
      if (b.regKb) out.push([M("この国の規制の AI 詳細調査の結果があります（規制を調べる の画面）", "There is an AI regulation research result for this country (Regulations screen)"), M("規制の AI 詳細調査（出典つきのときはその出典）", "AI regulation research (with its sources)")]);
    } catch (e) { err("srcFacts", e); }
    return out.filter((x) => x[0] && !/：\s*$/.test(x[0]));
  }
  V.srcFacts = srcFacts;
  /* Web 検索が動いたか・なぜ出どころが無いか（22.00.1 v1） */
  function webWhy(DP) {
    const w = DP && DP.v100web;
    if (!w) return M("Web 検索が動いたかどうかの記録は、この調査には残っていません。「出どころを探し直す」で調べ直すと、理由をここに出します。", "This record does not say whether web search ran. Search again to see the reason here.");
    const eng = w.eng || M("AI", "AI");
    let t;
    if (!w.ok) t = F(M("Web 検索つきの調査が終わりませんでした（{e}）。", "The web search did not finish ({e})."), { e: V.niceText(w.err || "") || M("理由不明", "unknown") });
    else if (w.search === 1) t = F(M("Web 検索のできる AI（{g}）で調べましたが、出どころ（URL）が返ってきませんでした（{n}件）。", "Searched with a web-capable AI ({g}), but no source URLs came back ({n})."), { g: eng, n: w.cits });
    else if (w.search === 0) t = w.ext ? F(M("Web 検索のできない AI（{g}）で答えました。Web の検索結果 {x}件を渡しましたが、答えに出どころ（URL）が付きませんでした。", "Answered by an AI without web search ({g}); {x} web results were provided but the answer had no source URLs."), { g: eng, x: w.ext })
      : F(M("Web 検索のできない AI（{g}）で答え、Web の検索結果も取れませんでした。", "Answered by an AI without web search ({g}), and no web results could be fetched."), { g: eng });
    else t = F(M("Web 検索の結果（出どころの URL）が返ってきませんでした（使った AI：{g}）。", "No web results (source URLs) came back (AI used: {g})."), { g: eng });
    if (/Web検索なし|Web 検索なし/.test(w.why || "")) t += F(M("AI への依頼は Web 検索なしで送られていました（経路：{y}）。", " The request was sent without web search (route: {y})."), { y: w.why });
    if (/自動切替|エラーのため/.test(w.why || "")) t += M("Web 検索のできる AI がエラーだったため、ほかの AI に切り替わっていました。", " The web-capable AI failed, so it switched to another AI.");
    return M("Web 検索について：", "About web search: ") + t + (w.tries > 1 ? F(M("（{n}回試しました）", " ({n} tries)"), { n: w.tries }) : "");
  }
  V.webWhy = webWhy;
  if (typeof W.ctyDeepView === "function" && !W.ctyDeepView.__v100ai) {
    const __dv = W.ctyDeepView;
    const g = function (c) {
      let h = String(__dv.apply(this, arguments) || "");
      try {
        const DP = typeof ctyDeepOf === "function" ? ctyDeepOf(c) : null; // eslint-disable-line no-undef
        const nsrc = DP && DP.d && Array.isArray(DP.d.sources) ? DP.d.sources.length : 0;
        if (DP && !DP.local && (!DP.web || !nsrc)) {
          const S = srcFacts(c);
          const busy = W.__ctyDeepBusy === c;
          const box = `<div class="c v100ai-src0" data-v100src0="1" role="note" data-noi18n="1"><p><b>⚠ ${E(M("出どころが見つかりませんでした（この調査の結論は確かめられていません）", "No sources were found (the conclusions below are not verified)"))}</b></p>
            <p>${E(F(M("この調査（{e}・{a}）では Web 検索の結果が返らず、下の AI の答えは AI の一般の知識による下書きです（信頼度 低）。確かな結論として使わず、下の「アプリの中の出どころで言えること」と確かめ先で確かめてください。", "This research ({e}, {a}) returned no web results; the AI answer below is a draft from general knowledge (low confidence). Do not use it as a firm conclusion; check against the in-app sources below."), { e: DP.eng || "AI", a: DP.at || "" }))}</p>
            <p class="nn" data-v100webwhy="1">${E(webWhy(DP))}</p>
            ${S.length ? `<p class="v100ai-sh">${E(M("アプリの中の出どころで言えること", "What the app's own sources say"))}</p><ul>${S.map((x) => `<li>${E(x[0])}<span class="nn">（${E(M("出どころ：", "Source: ") + x[1])}）</span></li>`).join("")}</ul>` : `<p class="nn">${E(M("アプリの中にも、この国について出どころのあるデータはありませんでした。", "The app has no sourced data for this country either."))}</p>`}
            <button type="button" class="btn" data-v100act="deepre" data-c="${E(c)}" ${busy ? "disabled" : ""}>${E(M("出どころを探し直す（Web 検索つきで調べ直す）", "Search again for sources (with web search)"))}</button></div>`;
          const k = '<div class="c" style="margin-bottom:11px;border-color:var(--or)">';
          const i = h.indexOf(k);
          if (i >= 0) { const j = h.indexOf('<div class="c"', i + k.length); h = j > 0 ? h.slice(0, j) + box + h.slice(j) : h + box; }
          else h = box + h;
          // 中の「Web検索なし・エンジンの知識」の行に「未確認」を足す
          h = h.replace(/(Web検索なし・エンジンの知識・信頼度 低)/, "$1・" + M("出どころなし（未確認）", "no sources (unverified)"));
        }
      } catch (e) { err("deepView", e); }
      return h;
    };
    g.__v100ai = 1; W.ctyDeepView = g;
  }

  /* ═════════ No.515 429 などの言葉（相談の注記・帯・どの画面の文字も）═════════ */
  if (typeof W.v92aiWhy === "function" && !W.v92aiWhy.__v100ai) {
    const __wy = W.v92aiWhy;
    const g = function () {
      const r = __wy.apply(this, arguments);
      try {
        if (r && r.k === "busy") {
          const msg = M("AI が混み合っていました（短い時間に依頼が重なったため）。間をあけて自動でもう一度頼みましたが、まだ混み合っていたため、いまは登録データ（内蔵エンジン）で答えています。1〜2分おいて、もう一度お聞きください。", "The AI was busy (too many requests at once). We waited and asked again automatically, but it was still busy, so this answer comes from your registered data (built-in engine). Please ask again in 1–2 minutes.");
          if (typeof v92aiNote === "function") r.html = v92aiNote("busy", msg, (arguments[1] && arguments[1].q0) || "", 1); // eslint-disable-line no-undef
          r.ci = M("AI が混み合っていたため、登録データ（内蔵エンジン）で回答", "Answered from registered data because the AI was busy");
        }
        if (r && typeof r.html === "string") r.html = V.niceText(r.html);
        if (r && typeof r.ci === "string") r.ci = V.niceText(r.ci);
      } catch (e) { err("why", e); }
      return r;
    };
    g.__v100ai = 1; W.v92aiWhy = g;
  }
  if (typeof W.v92aiBarHtml === "function" && !W.v92aiBarHtml.__v100ai) {
    const __bh = W.v92aiBarHtml;
    const g = function (L) { let h = __bh.apply(this, arguments); try { h = String(h).replace(/短い時間の利用の上限（HTTP 429）に達しました/, M("短い時間に依頼が重なりました", "too many requests at once")).replace(/a short-term usage limit \(HTTP 429\) was reached/, "too many requests arrived at once"); h = V.niceText(h); } catch (e) { err("barHtml", e); } return h; };
    g.__v100ai = 1; W.v92aiBarHtml = g;
  }
  /* 画面に出た文字の中の「HTTP 429」などを、やさしい言葉に（出す前に直せない古い記録・同期サーバーの文言も） */
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE)$/;
  const HINT = /HTTP\s*\d{3}|Too Many Requests|rate.?limit|RESOURCE_EXHAUSTED|quota exceeded|overloaded_error|Internal Server Error|Bad Gateway|Service Unavailable/i;
  function niceNode(root) {
    try {
      if (!root || !root.textContent || !HINT.test(root.textContent)) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = tw.nextNode())) {
        const p = n.parentElement;
        if (!p || SKIP.test(p.tagName) || p.closest("[contenteditable=true],[data-v100raw]")) continue;
        const v = n.nodeValue;
        if (!HINT.test(v)) continue;
        let t = v;
        if (/同期サーバー/.test(t)) t = t.replace(/[（(]HTTP\s*429[）)]/g, M("（混み合っていました。少し待ってからもう一度お試しください）", " (busy; please retry shortly)"));
        t = t.replace(/[（(]上限\s*HTTP\s*429[）)]/g, "").replace(/短い時間の利用の上限[（(]HTTP\s*429[）)]/g, M("短い時間に依頼が重なった状態", "too many requests at once"));
        t = V.niceText(t);
        if (t !== v) n.nodeValue = t;
      }
    } catch (e) { err("niceNode", e); }
  }
  V.niceNode = niceNode;
  let pend = new Set(), tmr = 0;
  function flush() { tmr = 0; const L = Array.from(pend); pend = new Set(); L.forEach((r) => { if (r && r.isConnected) niceNode(r); }); }
  try {
    const mo = new MutationObserver((ms) => {
      ms.forEach((m) => { const t = m.type === "characterData" ? m.target.parentElement : m.target; if (t && t.nodeType === 1) pend.add(t); });
      if (!tmr) tmr = setTimeout(flush, 120);
    });
    const start = () => { try { mo.observe(document.body, { subtree: true, childList: true, characterData: true }); niceNode(document.body); } catch (e) { err("mo", e); } };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  } catch (e) { err("mo0", e); }

  /* ═════════ 相談の答えを待つあいだの進み具合（速さ）═════════ */
  try { if (typeof V92AI !== "undefined" && V92AI && V92AI.soft > 4000) V92AI.soft = 4000; } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
  function stepTxt(el) {
    const C = V.consult || {};
    const t = typeof v92aiClock === "function" ? v92aiClock(el) : Math.round(el / 1000) + "s"; // eslint-disable-line no-undef
    let s3 = F(M("③ AI が答えを作っています（{t}・AI への依頼 {n}回目）", "③ The AI is writing the answer ({t}, request #{n})"), { t, n: Math.max(1, C.calls || 1) });
    if (C.retry) s3 += M("・答えが長く途中で切れたため書き直しています", " · rewriting because the answer was cut off");
    if (C.cont) s3 += F(M("・長い答えの続きを書いています（{n}回目）", " · writing the rest ({n})"), { n: C.cont });
    if (V.wait && V.wait.k === "busy") s3 += F(M("・混み合っていたため {s}秒あけてやり直しています", " · busy, retrying after {s}s"), { s: Math.round(V.wait.ms / 1000) });
    return [M("① ご質問を受け取りました ✓", "① Question received ✓"), M("② 登録データ（商品・国・規制）を読み込みました ✓", "② Your data (product, countries, rules) loaded ✓"), s3].join("　") + "　" + M("混み合っているときは1〜2分かかります。ご質問はこのまま残っています。", "It can take 1–2 minutes when busy. Your question is kept.");
  }
  if (typeof W.v92aiWaitOn === "function" && !W.v92aiWaitOn.__v100ai) {
    const __wo = W.v92aiWaitOn;
    const g = function (ctx, el) {
      const r = __wo.apply(this, arguments);
      try { const w = ctx && ctx.bb && ctx.bb.querySelector(".v92ai-wait .v92ai-wt"); if (w) { const t = stepTxt(el); if (w.textContent !== t) w.textContent = t; w.setAttribute("data-noi18n", "1"); } } catch (e) { err("waitOn", e); }
      return r;
    };
    g.__v100ai = 1; W.v92aiWaitOn = g;
  }
  W.v100aiWaitPaint = function () { try { if (V.wait && V.wait.k === "busy" && typeof toast === "function") toast(F(M("AI が混み合っています。{s}秒あけて自動でもう一度頼んでいます（{n}回目）", "The AI is busy. Asking again automatically in {s}s (try {n})"), { s: Math.round(V.wait.ms / 1000), n: V.wait.n })); } catch (e) { err("waitPaint", e); } }; // eslint-disable-line no-undef

  /* ═════════ ボタン（インラインの onclick は使えない）═════════ */
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v100act]");
      if (!b) return;
      const a = b.getAttribute("data-v100act");
      if (a === "barx") { const B = W.v100aiBudget(); V.hideLv = B.hit ? "hit" : B.ratio >= V.RESERVE ? "low" : "warn"; paintBar(); return; }
      if (a === "dkresume") { ev.preventDefault(); W.v100aiDeckResume(b.getAttribute("data-l") || "en"); return; }
      if (a === "notes") { ev.preventDefault(); W.v100aiNotesRun(); return; }
      if (a === "obre") { ev.preventDefault(); if (typeof v71obBuild === "function") v71obBuild(); return; } // eslint-disable-line no-undef
      if (a === "obsmp") { ev.preventDefault(); W.v100aiObSample(); return; }
      if (a === "deepre") { ev.preventDefault(); const c = b.getAttribute("data-c"); if (c && typeof ctyDeepRun === "function") ctyDeepRun(c, true); return; } // eslint-disable-line no-undef
    } catch (e) { err("click", e); }
  }, true);
  /* 22.00.1 N11：右下の「考え中」が、いまの画面で始めた AI なら「別の画面で処理中」と出さない（rd_uat は最初に出た画面と比べてたたむ） */
  function thinkHere() {
    try {
      const d = document.getElementById("aiThink");
      if (!d) return;
      if (!d.classList.contains("on")) { d.classList.remove("v100ai-here"); return; }
      const items = (typeof AIT !== "undefined" && AIT && AIT.items) || []; // eslint-disable-line no-undef
      const k = curKey();
      const C = V.consult;
      const here = items.some((x) => x && x.v100key && x.v100key === k) || !!(C && C.key && C.key === k && !C.lastAt && !C.done && Date.now() - C.t0 < 300000);
      d.classList.toggle("v100ai-here", here);
      // 経過の秒をこまめに描き直す（重い画面で 1秒ごとの描き直しが遅れても、送った時刻からの秒がずれないように）
      if (typeof v68tPaint === "function" && !d.classList.contains("done")) v68tPaint(); // eslint-disable-line no-undef
    } catch (e) { err("thinkHere", e); }
  }
  setInterval(thinkHere, 300);
  V.thinkHere = thinkHere;
  function paintAll() { paintBar(); deckBox(); notesDom(); }
  W.v100aiPaintAll = paintAll;
  if (typeof W.render === "function" && !W.render.__v100ai) {
    const __r = W.render;
    const g = function () { const r = __r.apply(this, arguments); try { setTimeout(paintAll, 0); } catch (e) { err("render", e); } return r; };
    g.__v100ai = 1; W.render = g;
  }
  setInterval(() => { try { if (!document.hidden) paintAll(); } catch (e) { /* 無視 */ } }, 4000);
  setTimeout(paintAll, 500);
})();
