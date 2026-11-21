/* ═══ v22.01 fwd（2026-11-22 第14回 UAT）物流会社の画面の見せ方の層（logic_v2201fwd.js・rd_v101fwd.css のあとに読む）
   No.625 受信箱の行・明細・案件の欄・ホームで、状況と金額を「貴社の回答状況」で出す（他社だけが答えた依頼は「未回答（貴社のレートなし）」・他社の金額は「他社の見積」）。
          チップ「貴社は未回答 N」を足す（AI回答済み＋貴社は未回答＋レーン未登録＝受信の件数）。
   No.626 容積の出どころ：明細の B/L の容積（1.113 → 1.11）・案件の「容積の食い違い」の「荷主の共有 2 m³」を「標準 2 m³（荷主が容積を入れていない依頼）」に・
          案件に「容積の出どころ」（B/L・依頼ごと・B/L と同じか）を出し、明細から同じ案件のほかの依頼の容積も見えるように。
   No.627 相見積・AI推奨のレーン別の集計：同じ国・同じ港の書き方の違いを1行に（ほかの書き方・区分・期限切れは同じ行の中に書く）。行ごとに目安の前提（仕出港・標準 2m³）と、
          その国あての依頼の前提（仕出港・容積）。COURIER の所要の列は、推奨の文と同じ「約3〜5日（目安）」を先に・登録の 10日 は「登録の値」として下に。
   No.628 受信箱の上・レート管理の手入力の欄に「区間のレートで答える（この依頼だけの金額＝スポット見積は出せない）」。依頼から欄に入れたときは、その区間の依頼の数。
   期待以上：ホームに「自動回答が少ない理由と次の一手」（期限切れのレートの入れ直し・仕出港のレートの登録・貴社が未回答の依頼）。
          荷主の PI・書類の下書きが物流会社に見えない理由（共有前の下書き）と、受け取れるもの（依頼の貨物・船積書類の種類・依頼ページの回答）を案件と明細に1行。
   インラインの onclick・style は書かない（イベントは document への委譲）。書き換えは中身が変わったときだけ（同じ中身なら触らない）。 */
(function () {
  "use strict";
  if (window.__v101fwdRd) return;
  window.__v101fwdRd = 1;
  const V = window.V101FWD || (window.V101FWD = { v: "22.01", err: null, errs: [], n: {} });
  const err = (k, e) => { try { const m = "rd." + k + ": " + String((e && e.message) || e).slice(0, 180); V.err = m; (V.errs = V.errs || []).push(m); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } };
  const cnt = (k) => { try { V.n[k] = (V.n[k] || 0) + 1; } catch (e) { /* 無視 */ } };
  const M = (ja, en, zh, es) => (typeof v101fM === "function" ? v101fM(ja, en, zh, es) : ja);
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const Y = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  const CB = (x) => (typeof v101fCbmTxt === "function" ? v101fCbmTxt(x) : String(x));
  const fwdOn = () => { try { return typeof v101fOn === "function" ? v101fOn() : (typeof FWDON !== "undefined" && !!FWDON); } catch (e) { return false; } };
  const page = () => { try { return (typeof fwdCur !== "undefined" && fwdCur) || ""; } catch (e) { return ""; } };
  const rdKey = () => { try { return window.RDX && RDX.curKey ? RDX.curKey() : page(); } catch (e) { return page(); } };
  const well = () => document.getElementById("well");
  const reqs = () => { try { return ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).filter(Boolean); } catch (e) { return []; } };
  const me = () => (typeof v101fMe === "function" ? v101fMe() : "");
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; };
  /* 置く・置き換える（同じ中身なら触らない）。where/ref が無ければ親の最後 */
  function put(parent, sel, html, where, ref) {
    if (!parent) return null;
    let el = parent.querySelector(sel);
    if (!html) { if (el) el.remove(); return null; }
    const sig = hash(html);
    if (el && el.dataset.sig === sig) return el;
    const tmp = document.createElement("div"); tmp.innerHTML = html.trim();
    const nu = tmp.firstElementChild; if (!nu) return null;
    nu.dataset.sig = sig;
    if (el) el.replaceWith(nu);
    else if (ref && ref.parentNode) ref.insertAdjacentElement(where || "afterend", nu);
    else if (where === "afterbegin") parent.insertBefore(nu, parent.firstChild);
    else parent.appendChild(nu);
    return nu;
  }
  const setText = (el, t) => { if (el && el.textContent !== t) { el.textContent = t; return true; } return false; };

  /* ═══ No.625 見積受信箱 ═══════════════════════════════════════════════ */
  function inboxTable(w) {
    return [...w.querySelectorAll("table")].find((t) => { const th = t.querySelector("thead th"); return th && /受信日|Received|收到|Recibid/.test(th.textContent || ""); }) || null;
  }
  const cellOf = (tr, lb, idx) => [...tr.cells].find((td) => td.getAttribute("data-lb") === lb) || tr.cells[idx] || null;
  function paintInboxRows(w) {
    const t = inboxTable(w); if (!t || !t.tBodies[0]) return;
    const R = reqs();
    [...t.tBodies[0].rows].forEach((tr) => {
      const id = tr.dataset.v99rid || (/RQ-[A-Za-z0-9]+/.exec(tr.textContent || "") || [""])[0];
      const r = id && R.find((x) => x.id === id); if (!r) return;
      const L = v101fStLabel(r);
      /* 状況 */
      const st = cellOf(tr, "状況", 6);
      const sp = st && st.querySelector("span.p");
      if (sp) {
        if (L.txt !== L.base) {
          if (setText(sp, L.txt)) { sp.classList.remove("on"); sp.classList.add("mid"); sp.dataset.v101st = L.kind; }
          put(st, ":scope > .v101fsts", `<small class="v101fsts" data-noi18n>${E(L.sub)}</small>`, "afterend", sp);
        } else { const o = st.querySelector(":scope > .v101fsts"); if (o) o.remove(); }
      }
      /* 見積合計：貴社の金額を先に、他社の金額は「他社」と書く */
      const am = cellOf(tr, "見積合計", 5);
      const P = v101fCellParts(r);
      if (am && P.own) {
        const html = `<span class="v101famt${P.kind === "others" ? " none" : ""}" data-noi18n${P.other ? ` title="${E(P.other)}"` : ""}><b>${E(P.own)}</b>${P.otherShort ? `<small>${E(P.otherShort)}</small>` : ""}</span>`;
        const cur = am.querySelector(":scope > .v101famt");
        if (!cur || cur.dataset.sig !== hash(html)) {
          const f = am.firstChild;
          if (f && f.nodeType === 3 && /¥|〜|か国|—/.test(f.data || "")) f.remove();
          if (cur) cur.remove();
          const tmp = document.createElement("div"); tmp.innerHTML = html; const nu = tmp.firstElementChild; nu.dataset.sig = hash(html);
          am.insertBefore(nu, am.firstChild);
          cnt("amt");
        } else { const f = cur.nextSibling; if (f && f.nodeType === 3 && /¥|〜|か国/.test(f.data || "")) f.remove(); }
      }
      /* 日数：他社だけの依頼は、他社の見積の日数と書く */
      const dd = tr.querySelector(":scope > td.v99fdtd");
      if (dd) put(dd, ":scope > .v101fothd", L.kind === "others" ? `<small class="v101fothd" data-noi18n>${E(M("（他社の見積の日数）", "(other forwarder's quote)", "（其他公司报价的天数）", "(cotización de otra)"))}</small>` : "");
      /* 「レートを登録して回答」「回答の金額を直す」：区間のレートで答える（スポット見積は無い）を説明に */
      const ab = tr.querySelector("[data-v90fansopen]");
      if (ab && ab.dataset.v101 !== ab.textContent) {
        ab.dataset.v101 = ab.textContent;
        const add = M("（区間のレートで答えます。この依頼だけの金額＝スポット見積は、いまの版では出せません）", " (You answer with a lane rate; a one-off price for this request alone is not available in this version.)");
        if (String(ab.title || "").indexOf(add) < 0) ab.title = String(ab.title || "") + add;
      }
    });
  }
  /* チップ「貴社は未回答 N」 */
  const CH = { on: false };
  function paintChip(w) {
    const bar = w.querySelector(".uxfb .acfilt");
    if (!bar || typeof v101fCounts !== "function") return;
    const C = v101fCounts();
    let b = bar.querySelector('[data-v101chip="others"]');
    if (!C.others) { if (b) b.remove(); CH.on = false; return; }
    if (!b) {
      b = document.createElement("button");
      b.type = "button"; b.className = "q v101fchip"; b.dataset.v101chip = "others"; b.setAttribute("data-noi18n", "");
      const after = [...bar.querySelectorAll("[data-uxf]")].find((x) => /^AI回答済み/.test((x.textContent || "").trim()));
      if (after) after.after(b); else bar.appendChild(b);
    }
    setText(b, M(`貴社は未回答 ${C.others}`, `Not answered by you ${C.others}`, `贵司未回复 ${C.others}`, `Sin respuesta suya ${C.others}`));
    const ti = M(`他社だけが見積を出した依頼 ${C.others}件（貴社のレートが無い区間）。「AI回答済み」${C.own}件＋「貴社は未回答」${C.others}件＋「レーン未登録」${C.open}件＝受信 ${C.all}件`, `Requests quoted only by other forwarders: ${C.others}`);
    if (b.title !== ti) b.title = ti;
    b.classList.toggle("on", CH.on);
    b.setAttribute("aria-pressed", CH.on ? "true" : "false");
  }
  function chipFilter(card) {
    try {
      if (!CH.on || !card) return false;
      const C = v101fCounts(), ids = new Set(C.ids.others);
      const q = String((card.querySelector("[data-uxq]") || {}).value || "").trim().toLowerCase();
      const f = (typeof V33FW !== "undefined" && V33FW) ? String(V33FW.f || "") : "";
      const tb = card.querySelector("table tbody"); if (!tb) return false;
      let n = 0;
      [...tb.rows].forEach((tr) => {
        const id = tr.dataset.v99rid || (/RQ-[A-Za-z0-9]+/.exec(tr.textContent || "") || [""])[0];
        const s = tr.dataset.v33st || "none", need = tr.dataset.v33rv === "1";
        const tab = !f || (f === "rv" ? (need && s !== "done") : s === f);
        const ok = ids.has(id) && (!q || (tr.textContent || "").toLowerCase().includes(q)) && tab;
        if (tr.hidden !== !ok) tr.hidden = !ok;
        if (ok) n++;
      });
      const c = card.querySelector("[data-uxn]"); const t = `${n}/${tb.rows.length}${M("件", "")}`;
      if (c && c.textContent !== t) c.textContent = t;
      return true;
    } catch (e) { err("chipf", e); return false; }
  }
  document.addEventListener("click", (ev) => {
    try {
      const t = ev.target && ev.target.closest && ev.target.closest('[data-v101chip="others"], .uxfb .acfilt [data-uxf]');
      if (!t || !fwdOn()) return;
      if (t.hasAttribute("data-v101chip")) {
        ev.preventDefault();
        CH.on = !CH.on;
        const bar = t.parentElement;
        if (CH.on) bar.querySelectorAll("[data-uxf].on").forEach((x) => x.classList.remove("on"));
        else { const all = [...bar.querySelectorAll("[data-uxf]")].find((x) => /^(すべて|All|全部|Todo)/.test((x.textContent || "").trim())); if (all) all.classList.add("on"); }
        t.classList.toggle("on", CH.on); t.setAttribute("aria-pressed", CH.on ? "true" : "false");
        const card = t.closest(".c");
        if (typeof uxApplyFilter === "function") uxApplyFilter(card); else chipFilter(card);
        cnt("chip");
      } else if (CH.on) { CH.on = false; const b = document.querySelector('[data-v101chip="others"]'); if (b) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); } }
    } catch (e) { err("chipclick", e); }
  }, true);
  if (typeof uxApplyFilter === "function") {
    const __af101 = uxApplyFilter;
    uxApplyFilter = function (card) { const o = __af101.apply(this, arguments); try { if (CH.on && fwdOn() && page() === "finbox" && card && card.querySelector && card.querySelector("table[data-v33fw], [data-v99rid]")) chipFilter(card); } catch (e) { err("af", e); } return o; }; // eslint-disable-line no-global-assign
  }
  /* 受信箱の上：見積の状況の見方（貴社の回答で数える）と、答え方（区間のレート・スポット見積は無い） */
  function paintInboxNote(w) {
    const t = inboxTable(w); if (!t) return;
    const card = t.closest(".c") || t.parentElement;
    const h3 = card && card.querySelector("h3"); if (!h3) return;
    const C = typeof v101fCounts === "function" ? v101fCounts() : null;
    const html = `<p class="v101fnote" data-noi18n role="note"><b>${E(M("見積の状況の見方", "How quote status is shown", "报价状况的看法", "Cómo leer el estado"))}</b>${E(M(`：「回答済み」「AI回答済み」は、貴社のレートで AI物流マンが見積を出した依頼です${C ? `（${C.own}件）` : ""}。他社だけが見積を出した依頼は「未回答（貴社のレートなし）」と出し${C ? `（${C.others}件）` : ""}、その金額は「他社の見積」と書きます（貴社の見積ではありません）。`, `: “Answered” = AI Logistics quoted with your rates${C ? ` (${C.own})` : ""}. Requests quoted only by other forwarders show “Not answered (no rate of yours)”${C ? ` (${C.others})` : ""} and their amounts as “other forwarders”.`))}<br><b>${E(M("答え方", "How to answer", "回复方式", "Cómo responder"))}</b>${E(M("：見積は貴社のレート表（区間のレート）から自動で出ます。行の「レートを登録して回答」「回答の金額を直す」は、区間のレートの登録・直しです（同じ区間のほかの依頼にも使われます）。この依頼だけの金額（スポット見積）を出す欄は、いまの版にはありません。", ": Quotes come from your lane rates. “Register a rate” / “Edit the amount” register or edit the lane rate (used for other requests on the lane too). A one-off price for one request (spot quote) is not available in this version."))}</p>`;
    const ref = card.querySelector(":scope > .v100flogout") || card.querySelector(":scope > .v100ftrnote") || h3;
    put(card, ":scope > .v101fnote", html, "afterend", ref);
  }

  /* ═══ 明細の窓（#dw）═══════════════════════════════════════════════════ */
  function paintDetail() {
    if (!fwdOn()) return;
    const det = document.querySelector("#dw .v99fdet, .dwbody .v99fdet");
    const dw = document.getElementById("dw");
    if (!det) return;
    const id = det.getAttribute("data-v99rid");
    const r = reqs().find((x) => x.id === id); if (!r) return;
    const L = v101fStLabel(r), O = L.O;
    /* 貴社の回答状況の1行（いちばん上） */
    let html = "";
    if (O.kind === "others") {
      const sel = O.othersSel.map((x) => `${x.cty}：${x.co}${x.total != null ? " " + Y(x.total) : ""}`).join("／");
      const lane = (r.legs || []).filter((l) => l && l.ok).map((l) => `${r.pol || "—"} → ${l.cty || l.pod}・${r.mode || "LCL"}`).join("／");
      html = `<div class="v101fownd" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：まだありません`, `Your answer (${me()}): none yet`, `贵司（${me()}）的回复：尚无`, `Su respuesta (${me()}): ninguna`))}</b>${E(M(`この依頼の区間（${lane}）の貴社のレートがないため、AI物流マンは貴社の見積を出していません。下の「届いた見積」（${sel}）は他社の見積で、状況の「回答済み（荷主が検討中）」も他社の見積のことです。この区間のレートを登録すると、貴社の見積が出ます（区間のレートで答えます。この依頼だけの金額＝スポット見積は、いまの版では出せません）。`, `You have no rate for this lane (${lane}), so no quote of yours was made. The quotes below (${sel}) are from other forwarders. Register a lane rate to quote (spot quotes for one request are not available).`))}</div>`;
    } else if (O.kind === "part") {
      html = `<div class="v101fownd" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：${O.ownN}/${O.okN}か国`, `Your answer: ${O.ownN}/${O.okN} countries`))}</b>${E(M(`ほかの ${O.okN - O.ownN}か国（${O.othersSel.map((x) => x.cty).join("・")}）は、貴社のレートがなく、他社だけが見積を出しています。`, `The other ${O.okN - O.ownN} were quoted only by other forwarders.`))}</div>`;
    } else if (O.kind === "own") {
      const T = O.own.map((x) => `${(x.l && x.l.cty) || ""} ${Y(x.o.quote.total)}`).join("／");
      html = `<div class="v101fownd own" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：${T}`, `Your answer: ${T}`))}</b>${E(M("貴社のレートから AI物流マンが出した見積です。", "Quoted by AI Logistics from your rates."))}</div>`;
    }
    const anchor = det.querySelector(":scope > .v100ftrd") || det.querySelector("h3");
    put(det, ":scope > .v101fownd", html, "afterend", anchor);
    /* 窓の見出しの状況・「他の見積」の状況 */
    if (dw) {
      const h = dw.querySelector("h3");
      if (h && L.txt !== L.base) [...h.querySelectorAll("span")].forEach((s) => { if ((s.textContent || "").trim() === L.base) setText(s, L.txt); if ((s.textContent || "").trim() === L.txt && !s.classList.contains("v101fstw")) s.classList.add("v101fstw"); });
      /* 「確認状況 問題なし」：貴社の見積が無いときは、確かめる見積が無いと書く（問題がないのではない） */
      if (O.kind === "others") {
        const tw3 = document.createTreeWalker(dw, NodeFilter.SHOW_TEXT); let lab = null;
        while (tw3.nextNode()) { const n = tw3.currentNode; const t = (n.data || "").trim(); if (t === "確認状況") lab = n; else if (lab && t === "問題なし") { n.data = M("貴社の見積なし（確かめる見積がありません）", "No quote of yours to check"); break; } else if (lab && t && t.length > 30) break; }
      }
      dw.querySelectorAll("option").forEach((op) => {
        const m = /(RQ-[A-Za-z0-9]+)/.exec(op.textContent || ""); if (!m) return;
        const x = reqs().find((y) => y.id === m[1]); if (!x) return;
        const LX = v101fStLabel(x); if (LX.txt === LX.base) return;
        const t = String(op.textContent).replace(LX.base, LX.txt); setText(op, t);
      });
      /* 体験用の「他の見積」がボタン・文字のときも */
      const tw = document.createTreeWalker(dw, NodeFilter.SHOW_TEXT); const ns = [];
      while (tw.nextNode()) { const n = tw.currentNode; if (/RQ-[A-Za-z0-9]+[　\s]+回答済み（荷主が検討中）/.test(n.data || "")) ns.push(n); }
      ns.forEach((n) => { const m = /(RQ-[A-Za-z0-9]+)/.exec(n.data); const x = m && reqs().find((y) => y.id === m[1]); if (!x) return; const LX = v101fStLabel(x); if (LX.txt !== LX.base) n.data = n.data.replace(LX.base, LX.txt); });
    }
    /* B/L の容積：同じ案件のほかの依頼の容積と出どころ（No.626） */
    const bl = det.querySelector(".v99fbl");
    if (bl) {
      const c = typeof v101fCaseOfReq === "function" ? v101fCaseOfReq(r.id) : null;
      const VV = c ? v101fCaseVol(c) : null;
      const self = typeof v101fVolSrc === "function" ? v101fVolSrc(r) : null;
      /* この依頼の容積が標準 2 m³ のときは「荷主の共有」と書かない */
      if (self && self.kind === "default") {
        const tw2 = document.createTreeWalker(bl, NodeFilter.SHOW_TEXT);
        while (tw2.nextNode()) { const n = tw2.currentNode; const re = new RegExp(`荷主の共有 ${String(self.cbm).replace(/\./g, "\\.")} m³`); if (re.test(n.data)) n.data = n.data.replace(re, M(`見積に使った標準 ${CB(self.cbm)} m³（荷主は容積を入れていません）`, `standard ${self.cbm} m³ used (no volume from the shipper)`)); }
      }
      let x = "";
      if (VV && VV.bl != null) {
        const others = VV.reqs.filter((q) => q.id !== r.id);
        const grp = {};
        others.forEach((q) => { const k = q.cbm + "|" + q.kind; (grp[k] = grp[k] || { cbm: q.cbm, kind: q.kind, same: q.same, ids: [], trial: false }).ids.push(q.id); if (q.trial) grp[k].trial = true; });
        const li = Object.values(grp).map((g) => `<li>${E(`${g.ids.join("・")}：${g.cbm != null ? CB(g.cbm) + " m³" : "—"}（${g.kind === "default" ? M("標準値・荷主は容積を入れていない依頼") : g.kind === "shared" ? M("荷主の共有") : M("出どころ不明")}${g.trial ? M("・体験用の依頼") : ""}）→ ${g.same ? M("B/L と同じ") : M("B/L と違う")}`)}</li>`).join("");
        x = `<div class="v101fblx" data-noi18n role="note"><b>${E(M("容積の出どころ", "Where the volumes come from", "体积的来源", "Origen de los volúmenes"))}</b>${E(M(`：B/L ${VV.blNo || ""}（案件の「B/L・出荷の情報」に入力：「${VV.blRaw}」）＝ ${CB(VV.bl)} m³。この依頼 ${r.id}：${typeof v101fVolLabel === "function" ? v101fVolLabel(r) : CB(r.cbm) + " m³"}。`, `: B/L ${VV.blNo || ""} (entered as “${VV.blRaw}”) = ${CB(VV.bl)} m³. This request: ${CB(r.cbm)} m³.`))}${li ? `<br>${E(M("同じ案件（同じ B/L）のほかの依頼：", "Other requests in the same case: "))}<ul>${li}</ul>` : ""}${others.some((q) => !q.same) ? `<button type="button" class="btn g" data-v101go="fcase" data-noi18n>${E(M("案件・出荷管理で容積の出どころを見る", "See volumes in Cases"))}</button>` : ""}</div>`;
      }
      put(det, ":scope .v101fblx", x, "afterend", bl);
    }
    /* 荷主の書類（PI・インボイスなど）の下書きが見えない理由（期待以上） */
    const dl = det.querySelector(".v99fdl2");
    if (dl) put(det, ":scope > .v101fdocs", `<p class="v101fdocs" data-noi18n role="note">${E(M(`荷主が作った PI・インボイスなどの書類の下書きは、荷主の画面の中の下書きのため、物流会社の画面には届きません。物流会社が受け取れるのは、見積依頼に付いた貨物の情報と船積書類の種類（${(r.docs || []).length ? "この依頼：" + r.docs.join("・") : "この依頼には付いていません"}）と、「荷主に出荷情報を頼む（依頼ページ）」で荷主が答えた品名・数量・総重量・出荷できる日などです（確かめて承認すると案件の欄に入ります）。`, `The shipper's PI / invoice drafts stay on the shipper's screen and are not sent to forwarders. You receive the cargo info and document types attached to the request, and what the shipper answers on a request page.`))}</p>`, "afterend", dl);
  }

  /* ═══ 案件・出荷管理（No.625・626・期待以上）═══════════════════════════════ */
  function paintCases(w) {
    const secs = [...w.querySelectorAll("section.v33case")]; if (!secs.length) return;
    const C = typeof v33Cases === "function" ? (v33Cases() || []) : [];
    /* 書類の下書きが見えない理由（一覧の上に1回） */
    const first = secs[0];
    put(first.parentElement, ":scope > .v101fcasedocs", `<p class="v101fcasedocs" data-noi18n role="note">${E(M("荷主が作った PI・インボイスなどの書類の下書きは、荷主の画面の中の下書きのため、ここには出ません（共有の前の下書きです）。案件の欄に入るのは、荷主の見積依頼の貨物の情報と、「荷主に出荷情報を頼む（依頼ページ）」で荷主が答えた品名・数量・総重量・出荷できる日など（確かめて承認したもの）と、貴社が入れた B/L・出荷の情報です。", "Shipper PI / invoice drafts are not shown here (they are drafts on the shipper's side). Cases show the request cargo info, the shipper's answers on request pages (after approval) and the B/L info you enter."))}</p>`, "beforebegin", first);
    secs.forEach((sec) => {
      const ed = sec.querySelector("[data-csed]"); const cid = ed && ed.getAttribute("data-csed");
      const c = cid ? C.find((k) => typeof v33CsId === "function" && v33CsId(k.key) === cid) : null;
      /* 依頼の行：状況・金額 */
      sec.querySelectorAll("li.v33li").forEach((li) => {
        const b = li.querySelector(".v33li-m b"); const id = b && (b.textContent || "").trim();
        const r = id && reqs().find((x) => x.id === id); if (!r) return;
        const L = v101fStLabel(r);
        const lv = [...li.querySelectorAll(".v33lv")].find((x) => /^(荷主：|Shipper: )/.test((x.textContent || "").trim()) || x.dataset.v101 === "1");
        if (lv) {
          const t = M("荷主：", "Shipper: ") + L.txt;
          if (L.txt !== L.base) { if (setText(lv, t)) { lv.dataset.v101 = "1"; lv.classList.remove("v33lv-good"); lv.classList.add("v33lv-warn"); } if (lv.title !== L.sub) lv.title = L.sub; }
        }
        const am = [...li.children].find((x) => x.tagName === "SPAN" && !x.className && /¥|か国|—/.test(x.textContent || ""));
        if (am) {
          const P = v101fCellParts(r);
          if (P.own) setText(am, P.own + (P.otherShort ? M(`・${P.otherShort}`, ` · ${P.otherShort}`) : ""));
        }
      });
      if (!c) return;
      const VV = v101fCaseVol(c);
      if (VV.bl == null) { put(sec, ":scope > .v101fvolsrc", ""); return; }
      /* 21.97 の「容積の食い違い」の帯：「荷主の共有 2 m³」→ 標準値と分かる言い方・金額がどの会社の見積か */
      const bar = sec.querySelector(".v97fvolbar");
      if (bar) {
        const hs = bar.querySelector(".v97fvolbar-h > span");
        const m = hs && /荷主の共有 ([\d.]+) m³ ／ B\/L ([\d.]+) m³/.exec(hs.textContent || "");
        if (m) {
          const x = +m[1];
          const from = VV.reqs.filter((q) => q.cbm != null && Math.abs(q.cbm - x) < 1e-9 && !q.trial);
          if (from.length && from.every((q) => q.kind === "default")) setText(hs, M(`見積に使った容積 ${m[1]} m³（${from.map((q) => q.id).join("・")}：荷主が容積を入れていない依頼の標準値）／ B/L ${m[2]} m³（${VV.blNo}）`, `Volume used for quotes ${m[1]} m³ (standard; no volume from the shipper) / B/L ${m[2]} m³`));
        }
        let A = [];
        try { A = typeof v97fVolAuto === "function" ? (v97fVolAuto(c, (typeof v33One === "function" ? v33One("cs", cid) : null) || {}) || []) : []; } catch (e) { A = []; }
        const cos = [...new Set(A.map((a) => a.co).filter(Boolean))];
        const note = A.length && cos.length && cos.every((co) => co !== me()) ? M(`下の金額は他社（${cos.join("・")}）の見積です。貴社（${me()}）の見積は、この案件の依頼にはありません（貴社のレートがない区間です）。`, `The amounts below are other forwarders' quotes (${cos.join(", ")}); you have no quote in this case.`) : "";
        const head = bar.querySelector(".v97fvolbar-h");
        if (head) put(head, ":scope > .v101fvolbarx", note ? `<small class="v101fvolbarx" data-noi18n>${E(note)}</small>` : "");
      }
      /* 21.69 の食い違いの1行：標準 2 m³（荷主が入れていない容積）を「荷主から共有された貨物情報」と書かない */
      sec.querySelectorAll(".v69fdiff").forEach((p) => {
        if (!/見積に使った標準/.test(p.textContent || "")) return;
        const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const n = tw.currentNode; if (/荷主から共有された貨物情報と違います/.test(n.data)) n.data = n.data.replace("荷主から共有された貨物情報と違います", M("B/L の値と、見積に使った値が違います", "The B/L differs from the values used for the quotes")); if (/B\/L の値と荷主の情報のどちらが正しいか確かめてください/.test(n.data)) n.data = n.data.replace("B/L の値と荷主の情報のどちらが正しいか確かめてください", M("荷主に実際の容積を確かめてください（荷主は容積を入れていません）", "Ask the shipper for the actual volume")); }
      });
      /* 21.90 の「見積の前提」：容積 2m³ が標準値であることを書く */
      sec.querySelectorAll(".v90fbasis > b").forEach((b) => {
        const m = /容積 ([\d.]+)m³/.exec(b.textContent || ""); if (!m) return;
        const x = +m[1];
        const from = VV.reqs.filter((q) => q.cbm != null && Math.abs(q.cbm - x) < 1e-9 && !q.trial);
        if (from.length && from.every((q) => q.kind === "default") && (b.textContent || "").indexOf("標準値") < 0) {
          const add = M(`（${m[1]}m³ は、荷主が容積を入れていない依頼の標準値です。荷主が共有した値ではありません）`, ` (${m[1]} m³ is the standard value; the shipper did not enter a volume)`);
          const sp = b.querySelector(".v101fbasisx");
          if (!sp) { const s = document.createElement("span"); s.className = "v101fbasisx"; s.setAttribute("data-noi18n", ""); s.textContent = add; b.appendChild(s); }
        }
      });
      /* 容積の出どころの箱 */
      const grp = {};
      VV.reqs.forEach((q) => { const k = q.cbm + "|" + q.kind + "|" + (q.trial ? 1 : 0); (grp[k] = grp[k] || { cbm: q.cbm, kind: q.kind, same: q.same, trial: q.trial, ids: [] }).ids.push(q.id); });
      const li = Object.values(grp).map((g) => `<li>${E(`${g.ids.join("・")}：${g.cbm != null ? CB(g.cbm) + " m³" : "—"}（${g.kind === "default" ? M("標準値・荷主は容積を入れていない") : g.kind === "shared" ? M("荷主の共有（依頼の貨物の欄）") : M("出どころ不明")}${g.trial ? M("・体験用の依頼・3日で消えます") : ""}）`)} <span class="${g.same ? "ok" : "ng"}">${E(g.same ? M("＝ B/L と同じ") : M("≠ B/L と違う"))}</span></li>`).join("");
      const html = `<div class="v101fvolsrc" data-noi18n role="note"><b>${E(M("容積の出どころ（この案件）", "Where the volumes come from (this case)", "体积的来源（本案件）", "Origen de los volúmenes (este caso)"))}</b><ul><li>${E(M(`B/L ${VV.blNo || ""}：${CB(VV.bl)} m³（貴社が「B/L・出荷の情報を入れる」で入力：「${VV.blRaw}」）`, `B/L ${VV.blNo || ""}: ${CB(VV.bl)} m³ (entered as “${VV.blRaw}”)`))}</li>${li}</ul><small>${E(M("見積受信箱の明細・この案件の帯・見積の前提は、どれも上の値と出どころで出しています（小数は小数第2位まで。B/L の「1.11m3」は 1.11 m³ と読みます）。相見積・AI推奨の「レーン別の集計」は、どの依頼とも別の標準 2m³ の目安です。", "Inbox details, this case and the quote basis all use these values. The lane summary in Comparison uses a standard 2 m³."))}</small></div>`;
      const ref = sec.querySelector(":scope > .v90fbasis") || sec.querySelector(":scope > .v69fdiff") || sec.querySelector(":scope > dl.v33dl") || sec.querySelector(".v97fvolbar");
      put(sec, ":scope > .v101fvolsrc", html, "afterend", ref);
    });
  }

  /* ═══ ホーム：AI自動回答率（貴社のレートで数える）と、少ない理由・次の一手 ═══════════════ */
  function paintHome(w) {
    const t1 = w.querySelector('[data-rdtile="1"]');
    const lab = (t) => ((t && t.querySelector("b")) || {}).textContent || "";
    if (!t1 || !/AI自動回答率|AI auto-answer/.test(lab(t1))) return;
    const W = typeof v101fAutoWhy === "function" ? v101fAutoWhy() : null; if (!W) return;
    const A = W.A;
    if (!t1.classList.contains("v101fhide99")) t1.classList.add("v101fhide99");
    const box = t1.querySelector("b") ? t1.querySelector("b").parentElement : t1;
    const why = M(`貴社のレートで答えた依頼で数えています（他社だけが答えた ${A.others}件は入りません）。理由と次の一手は下の箱に。`, `Counted on your own quotes (${A.others} quoted only by others are not counted). See the box below.`);
    put(box, ":scope > .v101fwhy", `<span class="rd-ts v101fwhy" data-noi18n>${E(why)}</span>`);
    /* 次の一手の箱（タイルの外。タイルはボタンなので中にボタンを入れない） */
    const grid = t1.parentElement;
    if (!grid || !grid.parentElement) return;
    const items = [];
    if (A.exp) items.push(`<li>${E(M(`期限切れの貴社のレートで組んだ見積が ${A.exp}件あります（期限切れのレート ${W.expRates}本）。新しい運賃・有効期限で入れ直すと、荷主が次に画面を開いたときに組み直されます。`, `${A.exp} quotes use expired rates (${W.expRates} expired rates). Renew them.`))}<br><button type="button" class="btn g" data-v101go="exp" data-noi18n>${E(M(`期限切れのレート ${W.expRates}本を入れ直す（物流レート管理）`, `Renew ${W.expRates} expired rates`))}</button></li>`);
    if (A.port && W.ports.length) items.push(`<li>${E(M(`依頼と違う仕出港のレートで組んだ見積が ${A.port}件あります（依頼の仕出港：${W.ports.slice(0, 4).map((p) => `${p.pol} ${p.n}件`).join("・")}）。依頼の仕出港発のレートを登録すると、その港発の見積になります。`, `${A.port} quotes use a rate from another origin port (${W.ports.slice(0, 4).map((p) => p.pol + " " + p.n).join(", ")}). Register rates from those ports.`))}<br><button type="button" class="btn g" data-v101go="pol" data-pol="${E(W.ports[0].pol)}" data-noi18n>${E(M(`${W.ports[0].pol}発のレートを登録する（手入力の欄へ）`, `Register a rate from ${W.ports[0].pol}`))}</button></li>`);
    if (A.others + A.open) items.push(`<li>${E(M(`貴社のレートが無い区間の依頼が ${A.others + A.open}件あります（他社だけが答えた ${A.others}件・どの会社も答えられなかった ${A.open}件。区間：${W.lanes.slice(0, 3).map((x) => x.lane).join("／")}${W.lanes.length > 3 ? " ほか" : ""}）。`, `${A.others + A.open} requests are on lanes without your rate (${A.others} quoted only by others, ${A.open} by nobody).`))}<br><button type="button" class="btn g" data-v101go="others" data-noi18n>${E(M(`貴社が未回答の依頼を見る（${A.others}件）`, `See requests you have not answered (${A.others})`))}</button></li>`);
    const html = `<section class="v101fnext" data-noi18n role="region" aria-label="${E(M("自動回答が少ない理由と次の一手", "Why few auto-answers and what to do"))}"><h3>${E(M(`AI自動回答率 ${A.rate}%（そのまま出せる ${A.clean} / ${A.recv}件）が低い理由と、次にできること`, `AI auto-answer rate ${A.rate}% (${A.clean}/${A.recv}): why, and what to do next`))}</h3><ol>${items.join("")}</ol><p>${E(M(`数え方：受信 ${A.recv}件のうち、貴社のレートで AI が見積を出した ${A.auto}件から、期限切れ・仕出港違いのレートを含む ${A.warn}件を除いた ${A.clean}件が「そのまま出せる」です（他社だけが答えた依頼は、貴社の回答に数えません）。${W.trial ? `体験用の依頼を除くと そのまま出せる ${W.trial.cleanBase} / ${W.trial.base}件＝${W.trial.rateBase}%。` : ""}`, `Counted: of ${A.recv} requests, ${A.auto} quoted with your rates, minus ${A.warn} with expired/other-port rates = ${A.clean} ready as is.`))}</p></section>`;
    put(grid.parentElement, ":scope > .v101fnext", items.length ? html : "", "afterend", grid);
    fixAiCounts(w, A);
    /* 今日やること「AIが回答できない見積依頼を確認」：どの会社も答えられなかった依頼の数。他社だけが答えた依頼は別に数える、と書き足す */
    try {
      const C2 = typeof v101fCounts === "function" ? v101fCounts() : null;
      if (C2 && C2.others) {
        const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const n = tw.currentNode; if (String(n.data || "").trim() === "レーン未登録・情報不足の依頼です") { n.data = M(`どの会社も見積を出せなかった依頼です（他社だけが答えた ${C2.others}件は、見積受信箱の「貴社は未回答」）`, `Requests nobody could quote (${C2.others} quoted only by others: see “Not answered by you”)`); break; } }
      }
    } catch (e) { err("today", e); }
  }
  /* ホームの「見積から出荷までの流れ」・受信箱の「数字の内訳」の「AI回答 N件」「AI自動回答 N件」（どの会社の見積でも数えていた）→ 貴社のレートで答えた依頼 */
  function fixAiCounts(w, A) {
    try {
      const any = reqs().filter((r) => r.quote || (r.legs || []).some((l) => l && l.ok)).length;
      if (any === A.auto) return;
      const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT); const L = [];
      while (tw.nextNode()) { const n = tw.currentNode; if (String(n.data || "").trim() === "AI回答 " + any + "件") L.push(n); }
      L.forEach((n) => { n.data = M(`AI回答 ${A.auto}件（貴社のレート）`, `AI answers ${A.auto} (your rates)`); n.parentNode && n.parentNode.setAttribute && n.parentNode.setAttribute("title", M(`貴社のレートで AI が見積を出した依頼 ${A.auto}件（他社だけが答えた ${A.others}件は数えません）`, "")); });
      [...w.querySelectorAll(".c")].forEach((c) => {
        const lb = c.querySelector(":scope > p.lbl"); const kv = c.querySelector(":scope > .kv");
        if (!lb || !kv || !/^AI自動回答$/.test((lb.textContent || "").trim())) return;
        const tn = kv.firstChild;
        if (tn && tn.nodeType === 3 && String(tn.data).trim() === String(any)) { tn.data = String(A.auto); const kd = c.querySelector(":scope > .kd"); if (kd && kd.textContent.indexOf("貴社") < 0) kd.textContent = M(`貴社のレートで答えた依頼（他社だけが答えた ${A.others}件は数えません）`, "Answered with your rates"); }
      });
    } catch (e) { err("aicounts", e); }
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v101go]");
      if (!b || !fwdOn()) return;
      ev.preventDefault();
      const k = b.getAttribute("data-v101go");
      const go = (key) => { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } try { RDX.goKey(key); } catch (e) { err("go", e); } };
      if (k === "exp") { go("frates"); setTimeout(() => { try { if (window.v89fShowExpired) window.v89fShowExpired(true); } catch (e) { err("exp", e); } }, 300); }
      else if (k === "pol") {
        go("frates");
        const pol = b.getAttribute("data-pol") || "";
        setTimeout(() => { try { const p = document.getElementById("frPol"); if (p) { p.value = pol; p.dispatchEvent(new Event("input", { bubbles: true })); p.scrollIntoView({ block: "center" }); const d = document.getElementById("frPod"); (d || p).focus(); } V.prefill = { pol, at: Date.now(), fromHome: 1 }; paint(); } catch (e) { err("pol", e); } }, 400);
      } else if (k === "others") {
        go("finbox");
        setTimeout(() => { try { const c = document.querySelector('[data-v101chip="others"]'); if (c && !CH.on) c.click(); const t = c && c.closest(".c"); if (t) t.scrollIntoView({ block: "start" }); } catch (e) { err("others", e); } }, 600);
      } else if (k === "fcase") go("fcase");
      cnt("go:" + k);
    } catch (e) { err("goclick", e); }
  });

  /* ═══ No.627 相見積・AI推奨：同じ国・同じ港は1行 ═══════════════════════════ */
  function aggCard(w) {
    const h = [...w.querySelectorAll("h3")].find((x) => /^(レーン別の集計とAI物流マンの推奨|Lane summary & AI pick)/.test((x.textContent || "").trim()));
    return h ? (h.closest(".c") || h.parentElement) : null;
  }
  function paintAgg(w) {
    const card = aggCard(w); if (!card || typeof v101fLaneKey !== "function") return;
    const tb = card.querySelector("table tbody"); if (!tb) return;
    const G = v101fLaneGroups();
    const rows = [...tb.rows].filter((tr) => tr.cells.length >= 4);
    const byKey = {};
    rows.forEach((tr) => {
      const td = tr.cells[0];
      const pod = tr.dataset.v95pod || ((td.querySelector("b") || {}).textContent || "").trim();
      const md = ((td.querySelector(".p") || {}).textContent || "").trim().toUpperCase();
      const K = v101fLaneKey(pod, md);
      tr.dataset.v101k = K.key;
      const n = +(((tr.cells[1].querySelector("b") || tr.cells[1]).textContent || "").match(/\d+/) || [0])[0];
      (byKey[K.key] = byKey[K.key] || []).push({ tr, pod, md, K, n });
    });
    let merged = 0; const names = [];
    Object.keys(byKey).forEach((k) => {
      const L = byKey[k];
      const g = G[k];
      let main = L[0];
      if (L.length > 1) {
        main = L.slice().sort((a, b) => (a.K.zone ? 1 : 0) - (b.K.zone ? 1 : 0) || b.n - a.n)[0];
        merged += L.length - 1;
        names.push(`${g && g.port ? g.port + "（" + g.cty + "）" : (g ? g.cty : main.K.cty)} ${main.md} ${L.length}${M("行", " rows")}`);
      }
      L.forEach((x) => { const off = L.length > 1 && x !== main; if (x.tr.classList.contains("v101faggoff") !== off) x.tr.classList.toggle("v101faggoff", off); if (off) x.tr.setAttribute("aria-hidden", "true"); else if (x.tr.getAttribute("aria-hidden") === "true") x.tr.removeAttribute("aria-hidden"); });
      /* 同じ行の中に：ほかの書き方・区分・期限切れ／目安の前提（仕出港・標準 2m³）／その国・港あての依頼の前提 */
      const lines = [];
      if (g) {
        const others = g.list.filter((p) => p.pod !== main.pod);
        others.forEach((p) => {
          const rv = p.rows.filter((x) => x.ok), re = p.rows.filter((x) => !x.ok);
          const dsc = rv.length ? M(`有効 ${rv.length}本：${rv.slice(0, 2).map((x) => `${x.co} ${x.cur}${(+x.price || 0).toLocaleString("ja-JP")}${x.unit}`).join("・")}`) : M(`期限切れ ${re.length}本（${re.slice(0, 2).map((x) => `${x.cur}${(+x.price || 0).toLocaleString("ja-JP")}${x.unit}・${x.valid}`).join("・")}）・見積と推奨には使われません`);
          lines.push(p.zone ? M(`区分（${p.zone}）「${p.pod}」：${dsc}`, `Zone (${p.zone}) “${p.pod}”: ${dsc}`) : M(`同じ${g.port ? "港" : "国"}の別の書き方「${p.pod}」：${dsc}`, `Same ${g.port ? "port" : "country"} written as “${p.pod}”: ${dsc}`));
        });
        if (others.length) {
          const mainN = main.n;
          if (g.nValid !== mainN || (g.min != null && others.some((p) => p.valid && !p.zone))) lines.push(M(`書き方をまとめて数えると：有効なレート ${g.nValid}社${g.min != null ? `・${Y(g.min)}〜${Y(g.max)}` : ""}（会社ごとに安い方の1本。区分の行は混ぜません）`, `Counted together: ${g.nValid} companies`));
        }
      }
      const isSea = /^(LCL|FCL)/.test(main.md);
      if (g && isSea) {
        const pols = g.pols.filter((x) => x && x !== "—");
        const R = typeof v101fReqsFor === "function" ? v101fReqsFor(g.cty, g.port, main.md) : [];
        const rq = R.slice(0, 2).map((x) => `${x.id}（${x.pol}発・${x.cbm != null ? CB(x.cbm) + " m³" : "—"}${x.kind === "default" ? M("・標準値") : ""}${x.own ? "" : M("・貴社の見積なし")}）`).join("・");
        lines.push(M(`目安の前提：仕出 ${pols.join("・") || "—"}・${/^LCL/.test(main.md) ? "標準 2m³" : "コンテナ1本"}・希望納期なし。依頼ごとの見積は、依頼の仕出港・容積で計算します${rq ? `（この${g.port ? "港" : "国"}あての依頼：${rq}${R.length > 2 ? ` ほか ${R.length - 2}件` : ""}）` : ""}。`, `Basis: from ${pols.join(", ") || "—"}, standard ${/^LCL/.test(main.md) ? "2 m³" : "1 container"}. Each request is calculated with its own port and volume.`));
      }
      const td0 = main.tr.cells[0];
      put(td0, ":scope > .v101faggm", lines.length ? `<div class="v101faggm" data-noi18n>${lines.map((x) => `<span>${E(x)}</span>`).join("")}</div>` : "");
      /* COURIER の所要：推奨の文と同じ目安を先に（登録の 10日 は「登録の値」） */
      const ttd = main.tr.cells[3];
      const est = ttd && ttd.querySelector("small.v97ttest");
      if (est) {
        const mm = /見積では\s*(.+?)（目安）/.exec(est.textContent || "");
        if (mm) {
          if (!ttd.classList.contains("v101ftd")) ttd.classList.add("v101ftd");
          const tn = [...ttd.childNodes].find((n) => n.nodeType === 3 && /^\s*\d+日\s*$/.test(n.data || ""));
          const reg = tn ? tn.data.trim() : (((ttd.querySelector(".v101ftt0") || {}).dataset || {}).v || "");
          if (tn) tn.remove();
          put(ttd, ":scope > .v101ftt", `<b class="v101ftt" data-noi18n>${E(M(`約${mm[1]}（目安）`, `about ${mm[1]} (estimate)`))}</b>`, "afterbegin");
          if (reg) put(ttd, ":scope > .v101ftt0", `<small class="v101ftt0" data-noi18n data-v="${E(reg)}">${E(M(`登録の値 ${reg}（見積・推奨では使っていません）`, `Registered: ${reg} (not used in quotes)`))}</small>`, "afterend", ttd.querySelector(":scope > .v101ftt"));
        }
      }
    });
    card.classList.toggle("v101faggon", merged > 0);
    const h = card.querySelector("h3");
    put(card, ":scope > .v101faggnote", merged ? `<p class="v101fnote v101faggnote" data-noi18n role="note">${E(M(`同じ国・同じ港の書き方の違い（アメリカ／アメリカ合衆国／アメリカ（西部）、韓国／大韓民国、ロサンゼルス／アメリカ、LA港 など）は1行にまとめています（${names.join("・")}）。ほかの書き方・地域の区分・期限切れは、その行の中に書いています。地域の区分（西部・その他など）は運送会社の料金の区分の場合があるため、最安・推奨の比べ方には混ぜません。登録のデータは書き換えていません（まとめ方の案は「物流レート管理」の上）。`, `Rows for the same country/port written differently are merged (${names.join(", ")}). Other spellings, zones and expired rows are listed inside the row. Data is not changed.`))}</p>` : "", "afterend", h);
    cnt("agg");
  }

  /* ═══ No.628 物流レート管理：手入力の欄の前に「区間のレート」で答えること ═══════════════ */
  function paintRates(w) {
    const lb = [...w.querySelectorAll("p.lbl")].find((x) => /^手入力で1レーン追加|^Add one lane manually/.test((x.textContent || "").trim()));
    if (!lb) return;
    const box = lb.parentElement;
    put(box, ":scope > .v101fspot", `<p class="v101fspot" data-noi18n role="note">${E(M("ここで登録・直すのは「区間のレート」（仕出港 → 仕向港・形態ごとの運賃）です。AI物流マンは、この区間の依頼すべての見積にこのレートを使います。この依頼だけの金額（スポット見積）を出す欄は、いまの版にはありません。「追加」を押すまで、何も変わりません。", "You register or edit a lane rate here (origin → destination, mode). AI Logistics uses it for every request on the lane. A one-off price for one request (spot quote) is not available in this version. Nothing changes until you press Add."))}</p>`, "afterend", lb);
    /* 依頼から欄に入れたとき：どの依頼の区間か・この区間の依頼の数 */
    let pre = "";
    try {
      const P = V.prefill;
      const v = (id) => { const e = document.getElementById(id); return e ? String(e.value || "").trim() : ""; };
      const pol = v("frPol"), pod = v("frPod"), md = v("frMode") || "LCL";
      if (P && Date.now() - P.at < 30 * 60e3 && pol) {
        const ids = pod && typeof v101fLaneReqs === "function" ? v101fLaneReqs(pol, pod, md) : [];
        const r = P.id ? reqs().find((x) => x.id === P.id) : null;
        if (r && pod) pre = M(`依頼 ${r.id} の区間（${pol} → ${pod}・${md}）の値が入っています。「追加」を押すと、この区間のレートとして登録され、同じ区間の依頼 ${ids.length}件（${ids.slice(0, 4).join("・")}${ids.length > 4 ? " ほか" : ""}）の見積に使われます（${r.id} だけの金額にはなりません）。`, `Prefilled from ${r.id} (${pol} → ${pod}, ${md}). Adding it registers a lane rate used for ${ids.length} request(s) on this lane.`);
        else if (P.fromHome) pre = M(`仕出港に「${pol}」を入れました。仕向港・運賃・日数を入れて「追加」を押すと、${pol}発のこの区間の依頼の見積に使われます（区間のレートです）。`, `Origin set to ${pol}. Fill in the rest and press Add to register a lane rate.`);
      }
    } catch (e) { err("prefill", e); }
    const sp = box.querySelector(":scope > .v101fspot");
    put(box, ":scope > .v101fpre", pre ? `<p class="v101fpre" data-noi18n role="status">${E(pre)}</p>` : "", "afterend", sp);
  }
  document.addEventListener("input", (ev) => { try { const t = ev.target; if (t && /^fr(Pol|Pod|Mode)$/.test(t.id || "") && V.prefill) { const w = well(); if (w) paintRates(w); } } catch (e) { err("frin", e); } });
  document.addEventListener("change", (ev) => { try { const t = ev.target; if (t && t.id === "frMode" && V.prefill) { const w = well(); if (w) paintRates(w); } } catch (e) { err("frch", e); } });

  /* ═══ No.626 の続き：見積の窓の「計算に使った容積」（21.97・22.00 の1行）で、標準 2 m³ を「依頼のときに共有した容積」と書かない（荷主・物流会社の両方の窓） ═══ */
  function paintVolUsedSrc() {
    try {
      if (typeof v101fVolSrc !== "function") return;
      ["#dw", "#pn"].forEach((sel) => {
        const box = document.querySelector(sel);
        if (!box || !box.getClientRects().length) return;
        box.querySelectorAll(".v97fvolused").forEach((p) => {
          const m = /RQ-[A-Za-z0-9]+/.exec(p.getAttribute("data-rid") || "") || /RQ-[A-Za-z0-9]+/.exec(((box.querySelector("h3") || {}).textContent || "") + " " + (box.textContent || "").slice(0, 600));
          const r = m && reqs().find((x) => x.id === m[0]);
          if (!r) return;
          const S = v101fVolSrc(r);
          if (S.kind !== "default") return;
          const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
          while (tw.nextNode()) {
            const n = tw.currentNode;
            const re = /依頼のときに共有した容積 ([\d.,]+) m³/;
            if (re.test(n.data)) { n.data = n.data.replace(re, (x, v) => fwdOn() ? M(`標準 ${v} m³（荷主が容積を入れていない依頼の既定値。荷主が共有した値ではありません）`, `the standard ${v} m³ (the shipper did not enter a volume)`) : M(`標準 ${v} m³（数量・容積を入れずに依頼したときの既定値）`, `the standard ${v} m³ (no volume was entered with the request)`)); cnt("volsrc"); }
          }
        });
      });
    } catch (e) { err("volsrc", e); }
  }
  setInterval(paintVolUsedSrc, 1500);

  /* ═══ 描き直しのたびに ═══════════════════════════════════════════════ */
  let busy = false;
  function paint() {
    if (busy) return;
    busy = true;
    try {
      if (!fwdOn()) return;
      const w = well(); if (!w) return;
      const pg = page(), k = rdKey();
      if (k === "fhome") { try { paintHome(w); } catch (e) { err("home", e); } }
      else if (k === "finbox" || pg === "finbox") {
        try { paintInboxRows(w); } catch (e) { err("rows", e); }
        try { paintChip(w); } catch (e) { err("chip", e); }
        try { paintInboxNote(w); } catch (e) { err("inote", e); }
        try { if (typeof v101fAutoRate === "function") fixAiCounts(w, v101fAutoRate()); } catch (e) { err("ibcnt", e); }
      } else if (pg === "fagg") { try { paintAgg(w); } catch (e) { err("agg", e); } }
      else if (pg === "fcase") { try { paintCases(w); } catch (e) { err("case", e); } }
      else if (pg === "frates") { try { paintRates(w); } catch (e) { err("rates", e); } }
      try { paintDetail(); } catch (e) { err("det", e); }
      try { paintVolUsedSrc(); } catch (e) { err("vol", e); }
    } catch (e) { err("paint", e); }
    finally { busy = false; }
  }
  window.v101fRepaint = paint;
  if (typeof fwdRender === "function") {
    const __fr101 = fwdRender;
    fwdRender = function () { const o = __fr101.apply(this, arguments); try { paint(); } catch (e) { err("render", e); } return o; }; // eslint-disable-line no-global-assign
  }
  if (typeof openFwdQuote === "function") {
    const __oq101 = openFwdQuote;
    openFwdQuote = function () { const o = __oq101.apply(this, arguments); [120, 400, 900].forEach((ms) => setTimeout(() => { try { paintDetail(); } catch (e) { err("oq", e); } }, ms)); return o; }; // eslint-disable-line no-global-assign
  }
  try {
    let t = 0;
    const mo = new MutationObserver(() => {
      if (t || busy) return;
      t = setTimeout(() => { t = 0; paint(); try { mo.takeRecords(); } catch (e) { /* 無視 */ } }, 120);
    });
    const hook = () => {
      const w0 = well(); if (w0 && !w0.dataset.v101mo) { w0.dataset.v101mo = "1"; mo.observe(w0, { childList: true, subtree: true }); }
      const d0 = document.getElementById("dw"); if (d0 && !d0.dataset.v101mo) { d0.dataset.v101mo = "1"; mo.observe(d0, { childList: true, subtree: true }); }
    };
    hook();
    setInterval(hook, 1500);
  } catch (e) { err("mo", e); }
  try { if (window.RDX && typeof RDX.after === "function") { const prev = RDX.after; RDX.after = function () { const r = prev.apply(this, arguments); try { paint(); } catch (e) { err("after", e); } return r; }; } } catch (e) { err("afterwrap", e); }
  setTimeout(paint, 0);
})();
