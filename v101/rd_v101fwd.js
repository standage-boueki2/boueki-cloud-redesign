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
      /* 22.01.1（v3 N6）：21.97 の「容積の食い違い：B/L なら ¥… 安い」の金額が他社の見積（期限切れ）から計算したものと書く */
      const vt = tr.querySelector(".v97fvtag");
      if (vt && (L.kind === "others" || L.kind === "part") && !vt.querySelector(".v101fvtagx")) {
        const s = document.createElement("small"); s.className = "v101fvtagx"; s.setAttribute("data-noi18n", "");
        s.textContent = L.kind === "others" ? M(L.O.stale ? "（他社の見積・期限切れから計算）" : "（他社の見積から計算）", L.O.stale ? " (from another forwarder's expired quote)" : " (from another forwarder's quote)") : M("（他社の見積を含む）", " (includes other forwarders' quotes)");
        vt.appendChild(s);
      }
      /* 日数：他社だけの依頼は、他社の見積の日数と書く */
      const dd = tr.querySelector(":scope > td.v99fdtd");
      if (dd) put(dd, ":scope > .v101fothd", L.kind === "others" ? `<small class="v101fothd" data-noi18n>${E(M("（他社の見積の日数）", "(other forwarder's quote)", "（其他公司报价的天数）", "(cotización de otra)"))}</small>` : "");
      /* 22.01.3（x3 X3）：貴社の見積が依頼と違う仕出港のレートの写しなら、「回答の金額を直す」（その区間を直しても、この依頼には使われない）でなく、依頼の仕出港のレートを登録へ */
      const ab0 = tr.querySelector("[data-v90fansopen]");
      if (ab0 && L.O && L.ownStale && L.O.ownSt && L.O.ownSt.pol && r.pol) { const t = M(`${r.pol}発のレートを登録して回答`, `Register a rate from ${r.pol}`); if (ab0.textContent !== t) ab0.textContent = t; }
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
    const ti = M(`他社だけが見積を出した依頼 ${C.others}件（貴社のレートが無い区間${C.othersStale ? `。うち ${C.othersStale}件は他社の見積も期限切れなどで、荷主の画面では取り下げ` : ""}）。「AI回答済み」${C.own}件＋「貴社は未回答」${C.others}件＋「レーン未登録」${C.open}件＝受信 ${C.all}件`, `Requests quoted only by other forwarders: ${C.others}`);
    if (b.title !== ti) b.title = ti;
    /* 22.01.1（v3 N1）：画面を描き直したとき（ほかの画面から戻った・同期で描き直した）に、チップの印と表の行がずれないようにする。
       押したままなら、ほかのチップの印を外し、表をもう一度しぼる（行がずれているときだけ）。押していなければ印を外す */
    if (CH.on) {
      bar.querySelectorAll("[data-uxf].on").forEach((x) => x.classList.remove("on"));
      try {
        const card = b.closest(".c"); const t = card && card.querySelector("table tbody");
        if (t) {
          const ids = new Set(C.ids.others);
          const bad = [...t.rows].some((tr) => { const id = tr.dataset.v99rid || (/RQ-[A-Za-z0-9]+/.exec(tr.textContent || "") || [""])[0]; const shown = !tr.hidden && !tr.classList.contains("v100pgoff"); return id && shown && !ids.has(id); });
          if (bad && Date.now() - (CH.syncAt || 0) > 800) { CH.syncAt = Date.now(); if (typeof uxApplyFilter === "function") uxApplyFilter(card); else chipFilter(card); cnt("chipSync"); }
        }
      } catch (e) { err("chipsync", e); }
    }
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
    const html = `<p class="v101fnote" data-noi18n role="note"><b>${E(M("見積の状況の見方", "How quote status is shown", "报价状况的看法", "Cómo leer el estado"))}</b>${E(M(`：「回答済み」「AI回答済み」は、貴社のレートで AI物流マンが見積を出した依頼です${C ? `（${C.own}件）` : ""}。他社だけが見積を出した依頼は「未回答（貴社のレートなし）」と出し${C ? `（${C.others}件）` : ""}、その金額は「他社の見積」と書きます（貴社の見積ではありません）。${(() => { const SM = C && C.ownStale && typeof v101fOwnSummary === "function" ? v101fOwnSummary() : null; return SM ? `貴社の見積でも、期限切れ・依頼と違う仕出港のレートの写しで組んだものは、荷主の画面ではそのまま出ないので、状況に「取り下げ（貴社の見積は…）」か「組み直し待ち」と出します（貴社の見積 ${SM.total}件のうち、取り下げ ${SM.pol + SM.renew}件・組み直し待ち ${SM.wait}件${SM.other ? `・他社に決定／仮押さえ中など ${SM.other}件はその言葉のまま` : ""}）。組み直されるのは、荷主がその依頼を画面で開いたときです（開かれるまで、ここの見積は古い写しのまま）。${SM.orph ? `持ち主の荷主アカウントが無い見本の依頼 ${SM.orph}件は、荷主の画面に出ないため組み直されず、「古い写しのまま（見本の依頼）」と出します。` : ""}` : ""; })()}`, `: “Answered” = AI Logistics quoted with your rates${C ? ` (${C.own})` : ""}. Requests quoted only by other forwarders show “Not answered (no rate of yours)”${C ? ` (${C.others})` : ""} and their amounts as “other forwarders”.`))}<br><b>${E(M("答え方", "How to answer", "回复方式", "Cómo responder"))}</b>${E(M("：見積は貴社のレート表（区間のレート）から自動で出ます。行の「レートを登録して回答」「回答の金額を直す」は、区間のレートの登録・直しです（同じ区間のほかの依頼にも使われます）。この依頼だけの金額（スポット見積）を出す欄は、いまの版にはありません。", ": Quotes come from your lane rates. “Register a rate” / “Edit the amount” register or edit the lane rate (used for other requests on the lane too). A one-off price for one request (spot quote) is not available in this version."))}</p>`;
    const ref = card.querySelector(":scope > .v100flogout") || card.querySelector(":scope > .v100ftrnote") || h3;
    put(card, ":scope > .v101fnote", html, "afterend", ref);
  }

  /* ═══ 明細の窓（#dw）═══════════════════════════════════════════════════ */
  /* 22.01.1（v3 N8）：貴社の見積が無い依頼の、窓の上の段（手順・タイル「確認状況」・AIの判断と確認ポイント） */
  function paintNoOwnTop(dw, O) {
    try {
      const top = dw.querySelector(".k-qhd"); if (!top) return;
      /* 手順：2・3 を、貴社の見積が無いときの次の一手に */
      const st = [...top.querySelectorAll(".k-steps .k-step")];
      if (st.length >= 3) {
        const b2 = st[1].querySelector("b"), b3 = st[2].querySelector("b");
        if (b2) setText(b2, M("貴社のレートを登録（貴社の見積はまだ）", "Register your lane rate (no quote yet)", "登记贵司费率（尚无报价）", "Registre su tarifa (aún sin cotización)"));
        if (b3) setText(b3, M("登録の後、貴社の見積が荷主に届く（自動）", "Then your quote reaches the shipper (auto)", "登记后贵司报价自动送达货主", "Luego su cotización llega al cargador"));
      }
      /* タイル「確認状況」 */
      const tile = [...top.querySelectorAll(".k-tile")].find((t) => ((t.querySelector(".k-tl") || {}).textContent || "").trim() === "確認状況" || t.dataset.v101chk === "1");
      const notes = [...dw.querySelectorAll(".k-card")].find((c) => /AIの判断と確認ポイント/.test(((c.querySelector("h2") || {}).textContent || "")));
      if (tile && tile.dataset.v101n == null) { const m = /要確認\s*(\d+)/.exec((tile.querySelector(".k-tn") || {}).textContent || ""); tile.dataset.v101n = m ? m[1] : "0"; }
      const nNote = tile ? +tile.dataset.v101n || 0 : 0;
      if (tile) {
        tile.dataset.v101chk = "1";
        /* 22.01.2（w3 W9）：色の札（gr・rd・or など）を全部外して、同じ灰色の「対象なし」に（赤は警告に見える） */
        [...tile.classList].forEach((c) => { if (c !== "k-tile" && c !== "v101fnochk") tile.classList.remove(c); });
        if (!tile.classList.contains("v101fnochk")) tile.classList.add("v101fnochk");
        const tn = tile.querySelector(".k-tn"), ts = tile.querySelector(".k-ts");
        if (tn) { const f = [...tn.childNodes].find((n) => n.nodeType === 3); const t = M("対象なし", "None to check", "无需确认", "Nada que revisar"); if (f) { if (f.data !== t) f.data = t; } else tn.insertBefore(document.createTextNode(t), tn.firstChild); if (tn.title !== t) tn.title = t; }
        /* 22.01.2（w3 W8）：「下の注意 6件」と書くと、下の「AIの判断」に見える数（4件）と合わないことがある → 数は書かない */
        if (ts) setText(ts, O.kind === "others" ? (nNote ? M("貴社の見積なし（下の注意は他社の見積について）", "No quote of yours (notes below are about other forwarders)") : M("貴社の見積がありません", "You have no quote")) : M("どの会社も見積なし", "No quote from anyone"));
        const ti = tile.querySelector(".k-ti");
        if (ti && !ti.dataset.v101) { ti.dataset.v101 = "1"; ti.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path></svg>'; }
      }
      /* AIの判断と確認ポイント */
      if (notes) {
        const em = notes.querySelector(".k-empty");
        const t = O.kind === "others"
          ? (nNote ? M("貴社の見積はありません。下の注意は、他社の見積（届いた見積）についてです。", "You have no quote. The notes below are about other forwarders' quotes.") : M("貴社の見積がないため、確かめる点はありません（他社の見積は下の明細）。", "You have no quote, so there is nothing to check (other forwarders' quotes are in the details below)."))
          : M("どの会社の見積もないため、確かめる点はありません。この区間のレートを登録すると、見積が出ます。", "No quote from anyone; register a lane rate to quote.");
        if (em && /確認が要る点はありません|確かめる点はありません/.test(em.textContent || "")) { if (!em.dataset.v101 || em.textContent !== t) { em.dataset.v101 = "1"; em.textContent = t; } }
        else put(notes, ":scope > .v101fchkn", `<p class="v101fchkn" data-noi18n role="note">${E(t)}</p>`, "afterend", notes.querySelector(".k-h"));
      }
    } catch (e) { err("noowntop", e); }
  }
  /* 22.01.1（v3 N4）：B/L と荷主の共有の照らし合わせ（容積・総重量・箱数・数量）の一覧 */
  function blCmpHtml(r, cs, short) {
    const X = typeof v101fBlCmp === "function" ? v101fBlCmp(r, cs) : null;
    if (!X || !X.any) return { html: "", X };
    if (!X.shared) {
      const bl = X.items.filter((x) => x.bl != null && x.k !== "容積").map((x) => `${x.k} ${x.blTxt}`).join("・");
      return { html: bl ? `<p class="v101fblcmp v101fblcmp1" data-noi18n>${E(M(`総重量・箱数・数量：荷主はこの依頼で入れていません（B/L：${bl}）。`, `Weight / cartons / quantity: not entered by the shipper (B/L: ${bl}).`))}</p>` : "", X };
    }
    const li = X.items.map((x) => `<li><b>${E(x.k)}</b>${E(M(`：荷主の共有 ${x.reqTxt} ／ B/L ${x.blTxt}`, `: shipper ${x.reqTxt} / B/L ${x.blTxt}`))} <span class="${x.same === true ? "ok" : x.same === false ? "ng" : "na"}">${E(x.same === true ? M("＝ 同じ", "= same") : x.same === false ? M(`≠ 違う${x.ratio && x.ratio > 1.5 ? `（荷主の共有は B/L の約${(Math.round(x.ratio * 10) / 10).toLocaleString("ja-JP")}倍）` : ""}`, "≠ differs") : M("比べられません", "cannot compare"))}</span></li>`).join("");
    const how = X.diff.length ? `<small>${E(M("どちらが正しいかは荷主に確かめてください（B/L が正しい → 荷主に数量を直してもらう〔依頼ページ「荷主に出荷情報を頼む」〕／荷主の値が正しい → 「B/L・出荷の情報を入れる」で B/L を直す）。", "Check with the shipper which is right."))}</small>` : "";
    return { html: `<div class="v101fblcmp" data-noi18n role="note"><b>${E(M(short ? "B/L と荷主の共有（容積だけでなく、総重量・箱数・数量も）" : "B/L と荷主の共有の照らし合わせ", "B/L vs. what the shipper shared"))}</b><ul>${li}</ul>${how}</div>`, X };
  }
  /* 22.01.2（w3 W2）：貴社の見積が全部、荷主の画面で取り下げになる依頼の上の段（手順・タイル「確認状況」・概算見積） */
  function paintOwnStaleTop(dw, r, O) {
    try {
      const top = dw.querySelector(".k-qhd"); if (!top) return;
      const st = [...top.querySelectorAll(".k-steps .k-step")];
      if (st.length >= 3) {
        const b2 = st[1].querySelector("b"), b3 = st[2].querySelector("b");
        /* 22.01.3（x3 X1）：手順2は、その依頼の本当の一手（依頼の仕出港のレートを登録／いまのレートで組み直し待ち／この区間を入れ直す） */
        const cat = O.ownSt.cat;
        /* 22.01.4（決め V1-4）：組み直されるのは荷主がその依頼を画面で開いたとき。持ち主のいない見本の依頼は組み直されない */
        const orph = typeof v101fOrphan === "function" && v101fOrphan(r) === 1;
        if (b2) setText(b2, orph ? M("見本の依頼のため組み直されない（荷主の画面に出ない）", "Sample request: not rebuilt (never shown to a shipper)") : cat === "pol" ? M(`${r.pol || "依頼の仕出港"}発のレートを登録する`, "Register a rate from the request's port") : cat === "wait" ? M("荷主がこの依頼を画面で開いたときに組み直し（それまで古い写しのまま）", "Rebuilt when the shipper opens this request (old copy until then)") : M("この区間のレートを入れ直す", "Renew this lane's rate"));
        if (b3) setText(b3, orph ? M("ここの見積は古い写しのまま", "This old copy stays") : M("荷主がこの依頼を開いたときに、組み直した見積が届く", "The rebuilt quote reaches the shipper when they open this request"));
        if (st[1].classList.contains("done")) { st[1].classList.remove("done"); st[1].classList.add("on"); const sn = st[1].querySelector(".k-sn"); if (sn && !sn.dataset.v101) { sn.dataset.v101 = "1"; sn.textContent = "2"; } }
        if (st[2].classList.contains("done")) { st[2].classList.remove("done"); const sn = st[2].querySelector(".k-sn"); if (sn && !sn.dataset.v101) { sn.dataset.v101 = "1"; sn.textContent = "3"; } }
      }
      const tile = [...top.querySelectorAll(".k-tile")].find((t) => ((t.querySelector(".k-tl") || {}).textContent || "").trim() === "確認状況" || t.dataset.v101chk === "2");
      if (tile) {
        tile.dataset.v101chk = "2";
        const tn = tile.querySelector(".k-tn"), ts = tile.querySelector(".k-ts");
        const orphT = typeof v101fOrphan === "function" && v101fOrphan(r) === 1;
        const t = orphT ? M("古い写しのまま", "Old copy stays", "保持旧副本", "Copia antigua") : O.ownSt.cat === "wait" ? M("組み直し待ち", "To be rebuilt", "等待重新报价", "Pendiente") : M("取り下げ", "Withdrawn", "已撤回", "Retirada");
        if ((O.ownSt.cat === "wait" || orphT) && tile.classList.contains("rd")) { tile.classList.remove("rd"); tile.classList.add("or"); }
        if (tn) { const f = [...tn.childNodes].find((n) => n.nodeType === 3); if (f) { if (f.data !== t) f.data = t; } else tn.insertBefore(document.createTextNode(t), tn.firstChild); if (tn.title !== t) tn.title = t; }
        if (ts) setText(ts, orphT ? M(`見本の依頼（荷主の画面に出ない）・古いレートの写し（期限 ${O.ownSt.valid || "—"}）`, "Sample request (not shown to shippers); old rate copy") : O.ownSt.cat === "wait" ? M(`古いレートの写し（期限 ${O.ownSt.valid}）・レート表は ${(O.ownSt.now || {}).valid || "—"} まで更新済み`, "Old rate copy; the rate table is up to date") : O.ownSt.cat === "pol" ? M(`荷主の画面では取り下げ（${r.pol || "依頼の仕出港"}発の貴社のレートが無い）`, "Withdrawn (no rate from the request's port)") : M(`荷主の画面では取り下げ（期限切れ ${O.ownSt.valid}）`, "Withdrawn (expired)"));
      }
      const est = [...top.querySelectorAll(".k-tile")].find((t) => /^貴社の概算見積/.test(((t.querySelector(".k-tl") || {}).textContent || "").trim()));
      const es = est && est.querySelector(".k-ts");
      const orphE = typeof v101fOrphan === "function" && v101fOrphan(r) === 1;
      if (es) setText(es, orphE ? M("古いレートの写しの金額（見本の依頼のため、このまま）", "Old copy amount (sample request: stays as is)") : O.ownSt.cat === "wait" ? M("古いレートの写しの金額（組み直されるのは、荷主がこの依頼を画面で開いたとき）", "Old copy amount (rebuilt only when the shipper opens this request)") : M("古いレートの写しの金額（荷主の画面には出ません）", "Old copy amount (not shown to the shipper)"));
    } catch (e) { err("ownstaletop", e); }
  }
  /* 22.01.2（w3 W2・W4）：下の「国ごとの見積」のカード：荷主の画面で取り下げになる国（期限切れ・仕出港違い）は「提案中」「✓ 荷主に届いています」と出さない */
  function paintLegCards(dw, r) {
    try {
      dw.querySelectorAll(".fwdleg").forEach((cd) => {
        const b = cd.querySelector(".rw b"); const cty = b ? (b.textContent || "").trim() : "";
        const l = (r.legs || []).find((x) => x && x.cty === cty);
        if (!l || !l.ok || typeof v101fLegStale !== "function") return;
        const S = v101fLegStale(r, l);
        if (!S.stale) return;
        /* 22.01.3（x3 X1）：貴社の見積の国で、レート表の同じ区間が更新済み（組み直し待ち）なら「取り下げ」と書かない */
        const ow = typeof v101fOwnOffer === "function" ? v101fOwnOffer(l) : null;
        const OI = ow && typeof v101fOwnLegInfo === "function" ? v101fOwnLegInfo(r, l, ow) : null;
        /* 選択中が他社の国でも、仕出港が依頼どおりで、レート表の同じ区間にいまの有効なレートがあれば「組み直し待ち」（荷主の画面ではいまのレートで組み直す） */
        const N0 = !S.pol && typeof v101fLaneNow === "function" ? v101fLaneNow(r, l) : null;
        if (OI && OI.cat === "wait" && ((l.sel || l.co) === me()) || N0) {
          const NN = (OI && OI.cat === "wait" && OI.now) ? OI.now : N0;
          const orphC = typeof v101fOrphan === "function" && v101fOrphan(r) === 1;
          cd.querySelectorAll("span.p").forEach((sp) => { if (/^提案中$/.test((sp.textContent || "").trim())) { sp.textContent = orphC ? M("古い写しのまま（見本の依頼）", "Old copy stays (sample request)") : M("組み直し待ち（古いレートの写し）", "To be rebuilt (old copy)"); sp.classList.remove("lo"); sp.classList.add("mid", "v101flegx"); sp.setAttribute("data-noi18n", ""); } });
          cd.querySelectorAll("p.v79fwdway").forEach((pw) => { const t = M(`荷主の画面では、この写しのままでは出ず、いまのレート（${NN.pol} → ${NN.pod}・${NN.valid} まで）で組み直されます。${typeof v101fLaterTxt === "function" ? v101fLaterTxt(r) : ""}`, "Rebuilt with your current rate on the shipper's screen, only when the shipper opens this request."); if (pw.textContent !== t) { pw.textContent = t; pw.classList.remove("ok"); pw.classList.add("v101fwaystale"); } });
          return;
        }
        const why = S.exp && S.pol ? M("期限切れ・仕出港違い", "expired, other port") : S.exp ? M("期限切れ", "expired") : M("仕出港違い", "other port");
        cd.querySelectorAll("span.p").forEach((sp) => { if (/^提案中$/.test((sp.textContent || "").trim())) { sp.textContent = M(`取り下げ（${why}）`, `Withdrawn (${why})`); sp.classList.remove("lo"); sp.classList.add("mid", "v101flegx"); sp.setAttribute("data-noi18n", ""); } });
        const tw = document.createTreeWalker(cd, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const n = tw.currentNode; if (/^選択中：$/.test((n.data || "").trim())) { n.data = n.data.replace("選択中：", M("選択中（荷主の画面では取り下げ）：", "Selected (withdrawn on the shipper's screen): ")); break; } }
        cd.querySelectorAll("p.v79fwdway").forEach((pw) => {
          const t = M(`荷主の画面では、この見積は取り下げになります（${why}のレート。${r.pol || "依頼の仕出港"}発の有効なレートで組み直し・無ければレーン未登録）。${typeof v101fLaterTxt === "function" ? v101fLaterTxt(r) : ""}`, `Withdrawn on the shipper's screen (${why}).`);
          if (pw.textContent !== t) { pw.textContent = t; pw.classList.remove("ok"); pw.classList.add("v101fwaystale"); }
        });
      });
    } catch (e) { err("legcards", e); }
  }
  /* 22.01.3（x3 X7）：「AIの判断と確認ポイント」は土台が 4件までしか出さない → 出ていない国の注意があれば、その国と数を書く */
  function paintChkMore(dw, r) {
    try {
      const card = [...dw.querySelectorAll(".k-card")].find((c) => /AIの判断と確認ポイント/.test(((c.querySelector("h2") || {}).textContent || "")));
      const ul = card && card.querySelector(".k-ck");
      if (!card || typeof v82fLegNotes !== "function") return;
      const vis = ul ? [...ul.querySelectorAll(":scope > li")].map((li) => (li.textContent || "").trim()) : [];
      const legs = (r.legs || []).filter((l) => l && l.ok);
      const per = legs.map((l) => { let n = 0; try { n = (v82fLegNotes(r, l) || []).length; } catch (e) { n = 0; } return { cty: l.cty, n, shown: vis.filter((t) => t.indexOf(l.cty + "：") === 0).length }; });
      const total = per.reduce((a, x) => a + x.n, 0);
      const hid = per.filter((x) => x.n > x.shown);
      const more = legs.length > 1 && vis.length && total > vis.length && hid.length ? M(`ほか ${total - vis.length}件（${hid.map((x) => `${x.cty} ${x.n - x.shown}件`).join("・")}）は、下の「国ごとの見積」の各国のカードに出ています。`, `${total - vis.length} more (${hid.map((x) => x.cty).join(", ")}) are in the per-country cards below.`) : "";
      put(card, ":scope > .v101fchkmore", more ? `<p class="v101fchkmore" data-noi18n role="note">${E(more)}</p>` : "");
    } catch (e) { err("chkmore", e); }
  }
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
      /* 22.01.1（v3 N2・N6）：いま出ていない状況名（「回答済み（荷主が検討中）」）を指さない。他社の見積が期限切れ（荷主の画面では取り下げ）なら、そう書く */
      const mid = O.stale
        ? M(`下の「届いた見積」（${sel}）は他社の見積で、${typeof v101fStaleWhy === "function" ? v101fStaleWhy(O, r) : "期限切れ"}です。荷主の画面では、この見積は取り下げになり「レーン未登録」と出ています（荷主が検討している見積はありません）。`, `The quotes below (${sel}) are other forwarders' quotes and have expired; on the shipper's screen they are withdrawn (“no lane”), so the shipper is not reviewing any quote.`)
        : M(`下の「届いた見積」（${sel}）は他社の見積です（状況の「他社 ${O.cos.length}社が回答済み・荷主が検討中」は、この見積のことです）。`, `The quotes below (${sel}) are other forwarders' quotes.`);
      html = `<div class="v101fownd" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：まだありません`, `Your answer (${me()}): none yet`, `贵司（${me()}）的回复：尚无`, `Su respuesta (${me()}): ninguna`))}</b>${E(M(`この依頼の区間（${lane}）の貴社のレートがないため、AI物流マンは貴社の見積を出していません。`, `You have no rate for this lane (${lane}), so no quote of yours was made. `) + mid + M("この区間のレートを登録すると、貴社の見積が出ます（区間のレートで答えます。この依頼だけの金額＝スポット見積は、いまの版では出せません）。", " Register a lane rate to quote (spot quotes for one request are not available)."))}</div>`;
    } else if (O.kind === "part") {
      html = `<div class="v101fownd" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：${O.ownN}/${O.okN}か国`, `Your answer: ${O.ownN}/${O.okN} countries`))}</b>${E(M(`ほかの ${O.okN - O.ownN}か国（${O.othersSel.map((x) => x.cty).join("・")}）は、貴社のレートがなく、他社だけが見積を出しています。`, `The other ${O.okN - O.ownN} were quoted only by other forwarders.`))}</div>`;
    } else if (O.kind === "own") {
      const T = O.own.map((x) => `${(x.l && x.l.cty) || ""} ${Y(x.o.quote.total)}`).join("／");
      /* 22.01.2（w3 W2）：貴社の見積が荷主の画面で取り下げになるときは、そう書く（「荷主が検討中」「荷主に届いています」と書かない） */
      if (O.ownStale && L.ownStale) {
        /* 22.01.3（x3 X1・X2）：日付は貴社の見積のレートの写しの期限・次の一手はその依頼の本当の一手 */
        /* 22.01.4（V1-4）：組み直しの言い方は L.sub（v101fLaterTxt）に入れた。ここでは重ねて書かない。デモ用のアカウントでは足したレートが保存されないことを添える */
        const demo = typeof v101fDemoTxt === "function" ? v101fDemoTxt() : "";
        const act = O.ownSt.cat === "wait" && !L.orph ? M("（貴社がすることはありません。金額を直すときは、レート表の同じ区間を直します）", " (Nothing to do; edit the lane rate to change the amount.)")
          : (demo && O.ownSt.cat !== "wait" ? M(`（${demo}）`, ` (${demo})`) : "");
        html = `<div class="v101fownd" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：${T}`, `Your answer: ${T}`))}</b>${E(L.sub + act + "。")}</div>`;
      }
      else html = `<div class="v101fownd own" data-noi18n role="note"><b>${E(M(`貴社（${me()}）の回答：${T}`, `Your answer: ${T}`))}</b>${E(M("貴社のレートから AI物流マンが出した見積です。", "Quoted by AI Logistics from your rates."))}</div>`;
    }
    const anchor = det.querySelector(":scope > .v100ftrd") || det.querySelector("h3");
    put(det, ":scope > .v101fownd", html, "afterend", anchor);
    /* 窓の見出しの状況・「他の見積」の状況 */
    if (dw) {
      const h = dw.querySelector("h3");
      if (h && L.txt !== L.base) [...h.querySelectorAll("span")].forEach((s) => { if ((s.textContent || "").trim() === L.base) setText(s, L.txt); if ((s.textContent || "").trim() === L.txt && !s.classList.contains("v101fstw")) s.classList.add("v101fstw"); });
      /* 22.01.1（v3 N8）：貴社の見積が無い依頼（他社だけ・どの会社も無し）の上の段：タイル「確認状況」・手順・「AIの判断と確認ポイント」を実態どおりに
         （緑の ✓・「提出前に確認」・「AI見積の内容を確認 → 荷主に届く」と出さない。タイルの文字は切れない短さに） */
      if (O.kind === "others" || O.kind === "open") paintNoOwnTop(dw, O);
      else if ((O.kind === "own" || O.kind === "part") && O.ownStale && L.ownStale) paintOwnStaleTop(dw, r, O);
      paintLegCards(dw, r);
      paintChkMore(dw, r);
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
      /* 22.01.1（v3 N4）：容積だけでなく、総重量・箱数・数量も B/L と比べる */
      const cs0 = c && typeof v101fCsOfCase === "function" ? v101fCsOfCase(c) : null;
      const CM = cs0 && VV && VV.bl != null ? blCmpHtml(r, cs0, false) : { html: "", X: null };
      const h4 = bl.previousElementSibling && bl.previousElementSibling.tagName === "H4" ? bl.previousElementSibling : null;
      if (CM.X && CM.X.any && h4) setText(h4, M("B/L と荷主の共有（容積・総重量・箱数・数量）", "B/L vs. shipper (volume, weight, cartons, quantity)", "B/L 与货主共享（体积・毛重・箱数・数量）", "B/L y datos del cargador"));
      if (CM.X && CM.X.diff.length && /^食い違いなし/.test((bl.textContent || "").trim())) {
        const names = CM.X.diff.map((d) => d.k).join("・");
        const t = M(`容積は同じ（荷主の共有 ${CB(r.cbm)} m³ ／ B/L ${CB(VV.bl)} m³）。${names}が B/L と違います（下の照らし合わせ）`, `Volume matches; ${names} differ from the B/L (see below)`);
        setText(bl, t); bl.classList.add("warn"); bl.dataset.v101 = "1"; cnt("blcmp");
      }
      /* 22.01.1（v3 N6・N5）：「今の見積 ¥…」が他社の見積（期限切れ）であること・B/L の仕向地の区間だけで計算していること */
      if (bl.classList.contains("warn") && (O.kind === "others" || O.kind === "part")) {
        const tw4 = document.createTreeWalker(bl, NodeFilter.SHOW_TEXT);
        const cos = [...new Set(O.othersSel.map((s) => s.co).filter(Boolean))].join("・");
        const lab = O.kind === "others" ? M(`（他社 ${cos} の見積${O.stale ? "・" + (typeof v101fStaleWhy === "function" ? v101fStaleWhy(O, r) : "期限切れ") + "・荷主の画面では取り下げ" : ""}）`, ` (another forwarder's quote${O.stale ? ", expired" : ""})`) : M("（他社の見積を含む）", " (includes other forwarders)");
        while (tw4.nextNode()) { const n = tw4.currentNode; if (/今の見積 ¥[\d,]+/.test(n.data) && n.data.indexOf(lab) < 0 && !/今の見積 ¥[\d,]+（他社/.test(n.data)) { n.data = n.data.replace(/(今の見積 ¥[\d,]+)/, "$1" + lab); break; } }
      }
      let scopeNote = "";
      try {
        const SC = c && cs0 && typeof v101fVolScope === "function" ? v101fVolScope(c, cs0) : null;
        const dropHere = SC && SC.restricted ? SC.drop.filter((q) => q.rid === r.id) : [];
        if (dropHere.length) scopeNote = M(`B/L の容積での計算は、B/L の仕向地（${SC.dest}）の区間だけです。この依頼の ${dropHere.map((q) => q.cty).join("・")} の区間は、この B/L の出荷ではないため入れていません（見積は今のまま）。`, `The B/L recalculation covers only the B/L destination (${SC.dest}); ${dropHere.map((q) => q.cty).join(", ")} are not part of this B/L shipment.`);
      } catch (e) { err("scopenote", e); }
      put(det, ":scope .v101fblcmp", CM.html, "afterend", bl);
      let x = "";
      if (VV && VV.bl != null) {
        const others = VV.reqs.filter((q) => q.id !== r.id);
        const grp = {};
        others.forEach((q) => { const k = q.cbm + "|" + q.kind; (grp[k] = grp[k] || { cbm: q.cbm, kind: q.kind, same: q.same, ids: [], trial: false }).ids.push(q.id); if (q.trial) grp[k].trial = true; });
        const li = Object.values(grp).map((g) => `<li>${E(`${g.ids.join("・")}：${g.cbm != null ? CB(g.cbm) + " m³" : "—"}（${g.kind === "default" ? M("標準値・荷主は容積を入れていない依頼") : g.kind === "shared" ? M("荷主の共有") : M("出どころ不明")}${g.trial ? M("・体験用の依頼") : ""}）→ ${g.same ? M("B/L と同じ") : M("B/L と違う")}`)}</li>`).join("");
        x = `<div class="v101fblx" data-noi18n role="note"><b>${E(M("容積の出どころ", "Where the volumes come from", "体积的来源", "Origen de los volúmenes"))}</b>${E(M(`：B/L ${VV.blNo || ""}（案件の「B/L・出荷の情報」に入力：「${VV.blRaw}」）＝ ${CB(VV.bl)} m³。この依頼 ${r.id}：${typeof v101fVolLabel === "function" ? v101fVolLabel(r) : CB(r.cbm) + " m³"}。`, `: B/L ${VV.blNo || ""} (entered as “${VV.blRaw}”) = ${CB(VV.bl)} m³. This request: ${CB(r.cbm)} m³.`))}${scopeNote ? `<br>${E(scopeNote)}` : ""}${li ? `<br>${E(M("同じ案件（同じ B/L）のほかの依頼（容積）：", "Other requests in the same case (volume): "))}<ul>${li}</ul>` : ""}${others.some((q) => !q.same) ? `<button type="button" class="btn g" data-v101go="fcase" data-noi18n>${E(M("案件・出荷管理で容積の出どころを見る", "See volumes in Cases"))}</button>` : ""}</div>`;
      }
      put(det, ":scope .v101fblx", x, "afterend", det.querySelector(":scope .v101fblcmp") || bl);
    }
    /* 荷主の書類（PI・インボイスなど）の下書きが見えない理由（期待以上） */
    const dl = det.querySelector(".v99fdl2");
    if (dl) put(det, ":scope > .v101fdocs", `<p class="v101fdocs" data-noi18n role="note">${E(M(`荷主が作った PI・インボイスなどの書類の下書きは、荷主の画面の中の下書きのため、物流会社の画面には届きません。物流会社が受け取れるのは、見積依頼に付いた貨物の情報と船積書類の種類（${(r.docs || []).length ? "この依頼：" + r.docs.join("・") : "この依頼には付いていません"}）と、「荷主に出荷情報を頼む（依頼ページ）」で荷主が答えた品名・数量・総重量・出荷できる日などです（確かめて承認すると案件の欄に入ります）。`, `The shipper's PI / invoice drafts stay on the shipper's screen and are not sent to forwarders. You receive the cargo info and document types attached to the request, and what the shipper answers on a request page.`))}</p>`, "afterend", dl);
  }

  /* ═══ 案件・出荷管理（No.625・626・期待以上）═══════════════════════════════ */
  /* 22.01.1（v3 N5）：21.90 の「見積の前提」を、全部の区間で（依頼ごとに1行）。どの会社の見積か・期限切れか・B/L の仕向地の区間（＊）か */
  function rebuildBasis(sec, c, VV, cid) {
    const bx = sec.querySelector(".v90fbasis"); if (!bx || typeof v101fVolScope !== "function") return;
    const cs = (typeof v33One === "function" ? v33One("cs", cid) : null) || {};
    const SC = v101fVolScope(c, cs);
    const keepK = new Set(SC.keep.map((x) => x.rid + "|" + x.cty));
    const me0 = me();
    const lines = []; let nLeg = 0;
    (c.reqs || []).filter(Boolean).forEach((r) => {
      const legs = (r.legs || []).filter((l) => l && l.ok);
      const parts = [], who = new Set(); let st = 0, ex = 0, valid = "";
      legs.forEach((l) => {
        const o = (l.offers || []).find((x) => x && x.co === me0) || (l.offers || []).find((x) => x && x.co === (l.sel || l.co));
        const q = (o && o.quote) || l.quote || {};
        if (!q.total) return;
        who.add(o && o.co === me0 ? "" : ((o && o.co) || l.sel || l.co || "—"));
        const S0 = typeof v101fLegStale === "function" ? v101fLegStale(r, l) : { stale: false };
        if (S0.stale) st++; if (S0.exp) ex++; if (S0.valid && S0.valid > valid) valid = S0.valid;
        parts.push(`${l.cty} ${Y(q.total)}${SC.restricted && keepK.has(r.id + "|" + l.cty) ? "＊" : ""}`);
      });
      if (!parts.length) return;
      let trial = false; try { trial = typeof v100fIsTempId === "function" && v100fIsTempId(r.id); } catch (e) { trial = false; }
      if (!trial) nLeg += parts.length;
      const S = typeof v101fVolSrc === "function" ? v101fVolSrc(r) : { kind: "" };
      const vol = `${CB(r.cbm)}m³ ${r.mode || "LCL"}${S.kind === "default" ? M("・標準値") : S.kind === "shared" ? M("・荷主の共有") : ""}`;
      const whoT = [...who].map((x) => (x ? M(`他社 ${x} の見積`, `${x}'s quote`) : M("貴社の見積", "your quote"))).join("・");
      const stT = st && st === parts.length ? M(`・${ex === st ? `有効期限 ${valid} で期限切れ` : "期限切れ・依頼と違う仕出港"}（荷主の画面では取り下げ）`, " (expired; withdrawn on the shipper's screen)") : st ? M(`・うち ${st}区間は期限切れなど`, ` (${st} expired)`) : "";
      lines.push(`${r.id}（${vol}）：${parts.join("／")} — ${whoT}${stT}${trial ? M("（体験用の依頼・3日で消えます。この案件の前提には入れていません）", " (trial request; not used for this case)") : ""}`);
    });
    if (!lines.length) return;
    const b = bx.querySelector(":scope > b");
    const legend = SC.restricted ? M(`＊＝B/L の仕向地（${SC.dest}）の区間。上の差額と「B/L の容積で反映する」は、この ${SC.keep.length}区間だけです（ここに並べた ${nLeg}区間のうち。体験用の依頼は除く）。`, `＊ = lanes to the B/L destination (${SC.dest}); only these ${SC.keep.length} are recalculated.`) : M(`ここに並べた区間：${nLeg}（体験用の依頼は除く）。`, `${nLeg} lanes listed.`);
    const how = M("どちらが正しいかは、この画面では決めません。荷主に確かめてください：① B/L の値が正しい → 荷主に数量を直してもらい（依頼ページ「荷主に出荷情報を頼む」）、数量が変わる国は再見積 ② 荷主の値が正しい → 「B/L・出荷の情報を入れる」で B/L の値を直す。", "This screen does not decide which is correct. Check with the shipper.");
    const html = (b ? b.outerHTML : "") + "<br>" + lines.map(E).join("<br>") + `<br><span class="v101fbasisl">${E(legend)}</span><br>` + E(how);
    const sig = hash(html);
    if (bx.dataset.v101 === sig) return;
    bx.innerHTML = html; bx.dataset.v101 = sig;
    cnt("basis");
  }
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
        /* 22.01.1（v3 N2）：差額の元の金額が期限切れの他社の見積（荷主の画面では取り下げ）なら、そう書く */
        const stl = A.map((a) => { const rq = reqs().find((x) => x.id === a.rid); const lg = rq && (rq.legs || []).find((l) => l && l.cty === a.cty); return rq && lg && typeof v101fLegStale === "function" ? v101fLegStale(rq, lg) : null; }).filter(Boolean);
        const allStale = stl.length === A.length && stl.length > 0 && stl.every((s) => s.stale);
        const vmax = stl.map((s) => s.valid).filter(Boolean).sort().pop() || "";
        const note = A.length && cos.length && cos.every((co) => co !== me()) ? M(`下の金額は他社（${cos.join("・")}）の見積です${allStale ? `。有効期限が切れていて（${vmax}）、荷主の画面では取り下げ（レーン未登録）になっています（荷主はこの見積を検討していません）` : ""}。貴社（${me()}）の見積は、この案件の依頼にはありません（貴社のレートがない区間です）。`, `The amounts below are other forwarders' quotes (${cos.join(", ")})${allStale ? ", expired and withdrawn on the shipper's screen" : ""}; you have no quote in this case.`) : "";
        const head = bar.querySelector(".v97fvolbar-h");
        if (head) put(head, ":scope > .v101fvolbarx", note ? `<small class="v101fvolbarx" data-noi18n>${E(note)}</small>` : "");
        /* 「今の見積 ¥…」に（他社・期限切れ）を */
        const amt = bar.querySelector(".v97fvolbar-amt");
        if (amt && note) {
          const lab = allStale ? M("（他社の見積・期限切れ）", " (other forwarder, expired)") : M("（他社の見積）", " (other forwarder)");
          const tw5 = document.createTreeWalker(amt, NodeFilter.SHOW_TEXT);
          while (tw5.nextNode()) { const n = tw5.currentNode; if (/今の見積 ¥[\d,]+/.test(n.data) && !/今の見積 ¥[\d,]+（他社/.test(n.data)) { n.data = n.data.replace(/(今の見積 ¥[\d,]+)/, "$1" + lab); break; } }
        }
        /* 22.01.1（v3 N5）：反映の対象は B/L の仕向地の区間だけ（logic の v97fVolAuto の包み）。ボタンの数え方（「11か国」→ 依頼の数・国）と、外した区間 */
        try {
          const SC = typeof v101fVolScope === "function" ? v101fVolScope(c, (typeof v33One === "function" ? v33One("cs", cid) : null) || {}) : null;
          const ab = bar.querySelector('[data-v97vol="apply"]');
          if (ab && A.length) {
            const nReq = new Set(A.map((a) => a.rid)).size, ctys = [...new Set(A.map((a) => a.cty))];
            const t = M(`B/L の容積で反映する（${nReq}件の依頼・${ctys.join("・")}${A.length !== nReq ? `・${A.length}区間` : ""}）`, `Apply the B/L volume (${nReq} request(s), ${ctys.join(", ")})`);
            setText(ab, t);
          }
          const sn = SC && SC.restricted ? M(`B/L ${VV.blNo || ""} の仕向地は${SC.dest}です。差額と反映は、${SC.dest}の区間（${new Set(SC.keep.map((x) => x.rid)).size}件の依頼）だけです。${[...new Set(SC.drop.map((x) => x.cty))].join("・")}の ${SC.drop.length}区間は、この B/L の出荷ではないため入れていません（その見積は今のまま）。`, `B/L destination: ${SC.dest}. Only ${SC.dest} lanes are recalculated; ${SC.drop.length} other lanes are not part of this B/L shipment.`) : "";
          const act = bar.querySelector(".v97fvolbar-act");
          put(bar, ":scope > .v101fvolscope", sn ? `<p class="v101fvolscope" data-noi18n role="note">${E(sn)}</p>` : "", "beforebegin", act);
        } catch (e) { err("volscope", e); }
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
      /* 22.01.1（v3 N5）：21.90 の「見積の前提」は 8行で切れていた（RQ-F61KZH の4区間が抜け、差額の 11行と合わない）→ 全部の区間を依頼ごとに1行で。
         どの会社の見積か・期限切れか・B/L の仕向地の区間か（差額と反映の対象）も書く */
      try { rebuildBasis(sec, c, VV, cid); } catch (e) { err("basis", e); }
      /* 容積の出どころの箱 */
      const grp = {};
      const cs1 = (typeof v33One === "function" ? v33One("cs", cid) : null) || {};
      VV.reqs.forEach((q) => {
        /* 22.01.1（v3 N4）：荷主が共有した依頼は、総重量・箱数・数量も B/L と比べる（同じ組にまとめない） */
        const rq = reqs().find((x) => x.id === q.id);
        const X = rq && q.kind === "shared" && typeof v101fBlCmp === "function" ? v101fBlCmp(rq, cs1) : null;
        const dk = X && X.diff.length ? X.diff.map((d) => `${d.k} ${d.reqTxt}（B/L ${d.blTxt}）`).join("・") : "";
        const k = q.cbm + "|" + q.kind + "|" + (q.trial ? 1 : 0) + "|" + dk;
        (grp[k] = grp[k] || { cbm: q.cbm, kind: q.kind, same: q.same, trial: q.trial, ids: [], dk }).ids.push(q.id);
      });
      const li = Object.values(grp).map((g) => `<li>${E(`${g.ids.join("・")}：${g.cbm != null ? CB(g.cbm) + " m³" : "—"}（${g.kind === "default" ? M("標準値・荷主は容積を入れていない") : g.kind === "shared" ? M("荷主の共有（依頼の貨物の欄）") : M("出どころ不明")}${g.trial ? M("・体験用の依頼・3日で消えます") : ""}）`)} <span class="${g.same ? "ok" : "ng"}">${E(g.same ? (g.dk ? M("容積は B/L と同じ") : M("＝ B/L と同じ")) : M("≠ B/L と違う"))}</span>${g.dk ? `<br><span class="ng">${E(M(`≠ 容積のほかは B/L と違います：${g.dk}`, `Other values differ from the B/L: ${g.dk}`))}</span>` : ""}</li>`).join("");
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
    /* 22.01.4（決め V1-1）：A＝直近30日（タイルの数・箱の見出し）／Aall＝受信箱の全部（「要確認」・箱の項目） */
    const A = W.A, Aall = W.Aall || W.A;
    if (!t1.classList.contains("v101fhide99")) t1.classList.add("v101fhide99");
    const box = t1.querySelector("b") ? t1.querySelector("b").parentElement : t1;
    /* 22.01.1（v3 S6）：タイルに 13行の文が詰まっていた → 1行を短く・体験用を除いた数は下の箱の「数え方」へ（タイルでは隠す） */
    /* 22.01.2（w3 W1）：0% のときは、理由（貴社の見積が全部 期限切れ・仕出港違いで荷主の画面では取り下げ）と次の一手（入れ直す）を1行で */
    const zero = A.recv > 0 && A.clean === 0 && A.auto > 0 && A.warn === A.auto;
    /* 22.01.3（x3 X1）：理由と次の一手を事実どおりに（期限切れのレートの入れ直しではなく、古いレートの写し・依頼と違う仕出港。一手は依頼の仕出港のレートの登録） */
    const SM0 = zero && typeof v101fOwnSummary === "function" ? v101fOwnSummary() : null;
    const why = zero ? M(`0% の理由：貴社の見積 ${A.auto}件が全部、古いレートの写し・依頼と違う仕出港で組まれている（荷主の画面ではそのまま出ない）→ ${SM0 && SM0.pol ? "依頼の仕出港のレートを登録" : "組み直されるのは荷主が依頼を開いたとき"}`, `0% because all ${A.auto} of your quotes use expired / other-port rates (withdrawn for the shipper).`) : A.recv ? M(`他社だけが答えた ${A.others}件は数えません（理由は下の箱）`, `${A.others} answered only by others not counted (see below)`) : "";
    put(box, ":scope > .v101fwhy", why ? `<span class="rd-ts v101fwhy" data-noi18n>${E(why)}</span>` : "");
    /* 直近30日の数え方と、全期間の数（小さく） */
    const AL = A.all || { recv: Aall.recv, clean: Aall.clean, rate: Aall.rate };
    const allT = M(`全期間 ${AL.clean} / ${AL.recv}件${AL.rate == null ? "" : `（${AL.rate}%）`}`, `All time: ${AL.clean} / ${AL.recv}${AL.rate == null ? "" : ` (${AL.rate}%)`}`);
    const t30 = A.recv ? M(`直近30日 ${A.recv}件で集計・${allT}`, `Last 30 days: ${A.recv} requests · ${allT}`)
      : M(`直近30日の依頼はまだありません・${allT}`, `No requests in the last 30 days · ${allT}`);
    put(box, ":scope > .v101f30", `<small class="rd-ts v101f30" data-noi18n>${E(t30)}</small>`);
    /* 直近30日の依頼が 0件：率は出さない（「—」）。前の層の行（全期間の数のまま残る）は隠す */
    const tn = t1.querySelector(".rd-tn");
    if (!A.recv) {
      if (tn && (tn.textContent || "").trim() !== "—") { tn.textContent = "—"; tn.dataset.v101f30 = "1"; }
      box.querySelectorAll(":scope > .rd-ts:not(.v101f30):not(.v101fwhy)").forEach((x) => { if (!x.classList.contains("v101fhid")) { x.classList.add("v101fhid"); x.dataset.v101f30h = "1"; } });
    } else {
      box.querySelectorAll(':scope > [data-v101f30h="1"]').forEach((x) => { x.classList.remove("v101fhid"); delete x.dataset.v101f30h; });
      if (tn && tn.dataset.v101f30 === "1" && (tn.textContent || "").trim() === "—") { tn.innerHTML = `${A.rate}<small>%</small>`; delete tn.dataset.v101f30; }
    }
    /* タイルの説明（title）は 21.95 の層が書くので書き合わない。期間（M/D〜M/D）は下の箱の「数え方」に書く */
    box.querySelectorAll(":scope > .v100ftrs").forEach((x) => { if (W.trial && !x.classList.contains("v101fhid")) x.classList.add("v101fhid"); });
    /* 22.01.2：0% のときは、21.95 の「AI回答 N件のうち 出す前に確かめる N件」と上の1行が同じことを言うので、タイルでは上の1行だけにする（文字は書き換えない＝書き合わない） */
    box.querySelectorAll(":scope > .v95auto2").forEach((x) => { if (x.classList.contains("v101fhid") !== zero) x.classList.toggle("v101fhid", zero); });
    /* 22.01.1（v3 N11）：タイル「要確認」の「理由：レートが無い区間 N件」は、どの会社のレートも無い区間の数（下の箱の「貴社のレートが無い区間」とは別の数）と分かる言い方に */
    paintNlWhy(w, Aall);
    paintTodo(w, W, A);
    /* 次の一手の箱 */
    paintNextBox(w, t1, W, A);
  }
  /* 22.01.2（w3 W7）：ホームと受信箱の「受信箱の状況」の両方で同じ言い方に */
  function paintNlWhy(w, A) {
    try {
      /* 21.99 の「理由：レートが無い区間 N件」（v99fwhyn）は 21.99 が同じ文字に書き戻すので、書き換えずに隠し、この層の1行を横に置く（書き合いをしない） */
      w.querySelectorAll('[data-v92ov="rv"] .v99fwhyn, [data-v70fgo="rv"] .v99fwhyn').forEach((n) => {
        const m = /レートが無い区間 (\d+)件/.exec(n.textContent || "");
        if (!m) return;
        if (!n.classList.contains("v101fhid")) n.classList.add("v101fhid");
        const t = M(`理由：どの会社のレートも無い区間 ${m[1]}件`, `Reason: no company has a rate (${m[1]})`);
        let x = n.nextElementSibling && n.nextElementSibling.classList.contains("v101fnlwhy") ? n.nextElementSibling : null;
        if (!x) { x = document.createElement(n.tagName === "SMALL" ? "small" : "span"); x.className = n.className.split(/\s+/).filter((c) => c && c !== "v99fwhyn" && c !== "v101fhid").concat("v101fnlwhy").join(" "); x.setAttribute("data-noi18n", ""); n.after(x); }
        if (x.textContent !== t) x.textContent = t;
        const tile = n.closest('[data-v92ov="rv"], [data-v70fgo="rv"]');
        const ti = M(`見積を出せなかった依頼（どの会社のレートも無い区間）。貴社のレートだけが無い依頼（他社だけが答えた ${A.others}件）は、見積受信箱の「貴社は未回答」で数えます`, "");
        if (tile && ti && tile.title !== ti) tile.title = ti;
      });
    } catch (e) { err("n11", e); }
  }
  /* 22.01.2（w3 W1）：「今日やること」のいちばん上に「期限切れのレートを入れ直す」（AI自動回答率を上げるのにいちばん効く。押すと期限切れの行だけを出す） */
  function paintTodo(w, W, A) {
    try {
      const h = [...w.querySelectorAll(".rd-card h2")].find((x) => /^今日やること/.test((x.textContent || "").trim()));
      const card = h && h.closest(".rd-card"); const list = card && card.querySelector(".rd-todo");
      if (!list) return;
      /* 22.01.3（x3 X1）：1行目は事実どおりの「いちばん効く一手」。期限切れのレート（いまは COURIER）がいまの見積に使われていないなら、入れ直しを1行目にしない */
      const SM = typeof v101fOwnSummary === "function" ? v101fOwnSummary() : null;
      const EU = typeof v101fExpRatesUse === "function" ? v101fExpRatesUse() : { used: 0, exp: [] };
      const zero = A.recv > 0 && A.clean === 0 && A.auto > 0;
      const ico = '<span class="rd-tdi"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"></path><circle cx="12" cy="11" r="2.2"></circle></svg></span>';
      let html = "";
      if (SM && SM.pol > 0 && SM.portList.length) {
        const P0 = SM.portList[0].pol;
        html = `<div class="rd-td v101ftodo" data-noi18n>${ico}<div><b>${E(M("依頼の仕出港のレートを登録する", "Register rates from the requests' ports", "登记委托起运港的费率", "Registrar tarifas del puerto de origen"))}</b><small>${E(M(`貴社の見積 ${SM.pol}件は、依頼と違う仕出港（${(SM.lanePolList || []).join("・") || "—"}）発のレートの写しで組まれていて、依頼の仕出港（${SM.portList.slice(0, 4).map((x) => `${x.pol} ${x.n}件`).join("・")}${SM.portList.length > 4 ? " ほか" : ""}）発の貴社のレートがありません${zero ? "（AI自動回答率 0% のいちばんの理由）" : ""}。登録すると、これから届くその港発の依頼に使われます。いまの見積が組み直されるのは、荷主がその依頼を画面で開いたとき${SM.orphBy && SM.orphBy.pol ? `（うち ${SM.orphBy.pol}件は持ち主の荷主アカウントが無い見本の依頼で、組み直されません）` : "（開かれるまで古い写しのまま）"}${typeof v101fDemoTxt === "function" && v101fDemoTxt() ? "。" + v101fDemoTxt() : ""}`, `${SM.pol} of your quotes were built from another port's rate and you have no rate from the requests' ports. Register them (current quotes are rebuilt only when the shipper opens each request).`))}</small></div><span class="rd-cnt">${E(M(`${SM.pol} 件`, `${SM.pol}`))}</span><button type="button" class="rd-btn" data-v101go="pol" data-pol="${E(P0)}" data-noi18n>${E(M(`${P0}発を登録`, `Register from ${P0}`))} →</button></div>`;
      } else if (EU.used > 0 && W.expRates > 0) {
        html = `<div class="rd-td v101ftodo" data-noi18n>${ico}<div><b>${E(M("期限切れのレートを入れ直す", "Renew expired rates", "重新登记已过期的费率", "Renovar tarifas vencidas"))}</b><small>${E(M(`期限切れのレートで組んだ貴社の見積が ${EU.used}区間あります。入れ直しても、いまの見積が組み直されるのは、荷主がその依頼を画面で開いたときです（開かれるまで古い写しのまま）${typeof v101fDemoTxt === "function" && v101fDemoTxt() ? "。" + v101fDemoTxt() : ""}`, `${EU.used} lanes of your quotes use expired rates. Renew them.`))}</small></div><span class="rd-cnt">${E(M(`${W.expRates} 本`, `${W.expRates}`))}</span><button type="button" class="rd-btn" data-v101go="exp" data-noi18n>${E(M("入れ直す", "Renew"))} →</button></div>`;
      }
      const cur = list.querySelector(":scope > .v101ftodo");
      if (!html) { if (cur) cur.remove(); }
      else if (!cur || cur.dataset.sig !== hash(html)) { if (cur) cur.remove(); const tmp = document.createElement("div"); tmp.innerHTML = html; const nu = tmp.firstElementChild; nu.dataset.sig = hash(html); list.insertBefore(nu, list.firstChild); cnt("todo"); }
      /* 見出し「下の N つのうち、対応が要るのは M つ」を行の数に合わせる（21.92 は1回だけ書く） */
      const chs = card.querySelector(".rd-ch .rd-chs");
      if (chs) {
        const rows = [...list.querySelectorAll(":scope > .rd-td")];
        const need = rows.filter((r) => { const c = r.querySelector(".rd-cnt"); return c && !c.classList.contains("z"); }).length;
        const t = need ? M(`下の${rows.length}つのうち、対応が要るのは ${need}つ です（右の数字は依頼・案件の件数・レートの本数）。`, `${need} of the ${rows.length} items below need action.`) : M(`いま対応が要るものはありません（下の${rows.length}つは、いつでも開けます）。`, "Nothing needs action now.");
        if (/^下の\d+つのうち|^いま対応が要るもの/.test((chs.textContent || "").trim()) && chs.textContent !== t) chs.textContent = t;
      }
    } catch (e) { err("todo", e); }
  }
  function paintNextBox(w, t1, W, A) {
    /* 次の一手の箱（タイルの外。タイルはボタンなので中にボタンを入れない） */
    const grid = t1.parentElement;
    if (!grid || !grid.parentElement) return;
    const items = [];
    /* 22.01.3（x3 X1・X5）：事実どおりに分ける（①依頼の仕出港のレートが無い ②古いレートの写し〔レート表は更新済み〕③期限切れのレートはいまの見積に使われていない） */
    const SM = typeof v101fOwnSummary === "function" ? v101fOwnSummary() : null;
    const EU = typeof v101fExpRatesUse === "function" ? v101fExpRatesUse() : { used: 0, exp: [], modes: {} };
    /* 22.01.4（決め V1-1）：見出し・数え方は直近30日（A）。項目は受信箱の全部（Aa）。V1-4：組み直しの言い方 */
    const Aa = W.Aall || A;
    const later = M("いまの見積が組み直されるのは、荷主がその依頼を画面で開いたときです（開かれるまで、ここの見積は古い写しのまま）", "Current quotes are rebuilt only when the shipper opens each request.");
    const demo = typeof v101fDemoTxt === "function" ? v101fDemoTxt() : "";
    if (SM && SM.pol && SM.portList.length) items.push(`<li>${E(M(`依頼の仕出港発の貴社のレートが無い見積が ${SM.pol}件あります（依頼の仕出港：${SM.portList.slice(0, 5).map((p) => `${p.pol} ${p.n}件`).join("・")}${SM.portList.length > 5 ? " ほか" : ""}）。依頼と違う仕出港発のレートの写しで組まれていて、荷主の画面では取り下げになります。依頼の仕出港発のレートを登録すると、これから届くその港発の依頼に使われます。${later}${SM.orphBy && SM.orphBy.pol ? `このうち ${SM.orphBy.pol}件は、持ち主の荷主アカウントが無い見本の依頼で、荷主の画面に出ないため組み直されません。` : ""}${demo ? demo + "。" : ""}`, `${SM.pol} quotes have no rate of yours from the request's port. Register rates from those ports. ${later}`))}<br><button type="button" class="btn g" data-v101go="pol" data-pol="${E(SM.portList[0].pol)}" data-noi18n>${E(M(`${SM.portList[0].pol}発のレートを登録する（手入力の欄へ）`, `Register a rate from ${SM.portList[0].pol}`))}</button></li>`);
    /* 22.01.3 追記（まとめ役の確認）：取り下げにならない仕出港違い（他社に決定・仮押さえ中・FOB など）だけのときも、仕出港のレートを登録する入口を残す（取り下げの項目があるときは出さない＝本番の表示は今のまま） */
    else if (Aa.port && W.ports && W.ports.length) items.push(`<li>${E(M(`依頼と違う仕出港のレートで組んだ見積が ${Aa.port}件あります（依頼の仕出港：${W.ports.slice(0, 4).map((p) => `${p.pol} ${p.n}件`).join("・")}${W.ports.length > 4 ? " ほか" : ""}）。依頼の仕出港発のレートを登録すると、これから届くその港発の依頼に使われます。${later}${demo ? demo + "。" : ""}`, `${Aa.port} quotes use a rate from another origin port. Register rates from the request ports. ${later}`))}<br><button type="button" class="btn g" data-v101go="pol" data-pol="${E(W.ports[0].pol)}" data-noi18n>${E(M(`${W.ports[0].pol}発のレートを登録する（手入力の欄へ）`, `Register a rate from ${W.ports[0].pol}`))}</button></li>`);
    if (SM && SM.total) items.push(`<li>${E(M(`貴社の見積 ${SM.total}件は、レートの写し${SM.validList.length ? `（期限 ${SM.validList.join("・")}）` : ""}で組まれたままです${SM.tableValid ? `（レート表の同じ区間は ${SM.tableValid} まで有効に更新済み）` : ""}。荷主の画面は、期限切れ・依頼と違う仕出港の見積をそのまま出さず、いまのレートで組み直します（無ければ取り下げ）。${later}内訳：取り下げ ${SM.pol + SM.renew}件・組み直し待ち ${SM.wait}件${SM.other ? `・他社に決定／仮押さえ中など ${SM.other}件` : ""}${SM.orph ? `（取り下げ・組み直し待ちのうち ${SM.orph}件は、持ち主の荷主アカウントが無い見本の依頼で、荷主の画面に出ないため組み直されず、古い写しのまま）` : ""}。`, `${SM.total} of your quotes still use rate copies (valid ${SM.validList.join(", ")}). ${later}`))}</li>`);
    if (W.expRates) items.push(`<li>${E(M(`期限切れのレート ${W.expRates}本（${Object.keys(EU.modes || {}).join("・") || "—"}・${[...new Set((EU.exp || []).map((x) => x.valid).filter(Boolean))].sort().slice(0, 2).join("・")}など）は、${EU.used ? `いまの見積の ${EU.used}区間に使われています。入れ直しても、${later.replace(/^いまの見積が/, "その見積が")}` : "いまの見積には使われていません（入れ直しても、いまの見積は変わりません。その形態の依頼が来たときのための入れ直しです）"}。`, `${W.expRates} expired rates ${EU.used ? "are used in current quotes" : "are not used in any current quote"}.`))}<br><button type="button" class="btn g" data-v101go="exp" data-noi18n>${E(M(`期限切れのレート ${W.expRates}本を見る（入れ直し・削除）`, `See ${W.expRates} expired rates`))}</button></li>`);
    if (Aa.others + Aa.open) items.push(`<li>${E(M(`貴社のレートが無い区間の依頼が ${Aa.others + Aa.open}件あります（どの会社のレートも無い ${Aa.open}件＝上のタイル「要確認」${Aa.open}件・他社だけが答えた ${Aa.others}件${Aa.othersStale ? `〔うち ${Aa.othersStale}件は他社の見積も期限切れなどで、荷主の画面では取り下げ〕` : ""}。区間：${W.lanes.slice(0, 3).map((x) => x.lane).join("／")}${W.lanes.length > 3 ? " ほか" : ""}）。`, `${Aa.others + Aa.open} requests are on lanes without your rate (${Aa.others} quoted only by others, ${Aa.open} by nobody).`))}<br><button type="button" class="btn g" data-v101go="others" data-noi18n>${E(M(`貴社が未回答の依頼を見る（${Aa.others}件）`, `See requests you have not answered (${Aa.others})`))}</button></li>`);
    const AL = A.all || { recv: Aa.recv, clean: Aa.clean, rate: Aa.rate };
    const span30 = `${typeof v101fMD === "function" ? v101fMD(A.from) : (A.from || "")}〜${typeof v101fMD === "function" ? v101fMD(A.to) : (A.to || "")}`;
    const html = `<section class="v101fnext" data-noi18n role="region" aria-label="${E(M("自動回答が少ない理由と次の一手", "Why few auto-answers and what to do"))}"><h3>${E(A.recv ? M(`AI自動回答率 ${A.rate}%（直近30日・そのまま出せる ${A.clean} / ${A.recv}件）が低い理由と、次にできること`, `AI auto-answer rate ${A.rate}% (last 30 days, ${A.clean}/${A.recv}): why, and what to do next`) : M(`AI自動回答率：直近30日の依頼はまだありません。受信箱の依頼について、次にできること`, `AI auto-answer rate: no requests in the last 30 days. What to do with the requests in your inbox`))}</h3><ol>${items.join("")}</ol><p>${E(M(`数え方：${A.recv ? `直近30日（${span30}）に受けた依頼 ${A.recv}件のうち、貴社のレートで AI が見積を出した ${A.auto}件から、期限切れ・仕出港違いのレートを含む ${A.warn}件を除いた ${A.clean}件が「そのまま出せる」です（他社だけが答えた依頼は、貴社の回答に数えません）。` : `直近30日（${span30}）に受けた依頼はまだありません（率は出しません）。`}全期間（受信箱の全部 ${AL.recv}件）では そのまま出せる ${AL.clean}件${AL.rate == null ? "" : `（${AL.rate}%）`}。上の項目の数は、受信箱の全部で数えています。${W.trial ? `体験用の依頼を除くと（全期間） そのまま出せる ${W.trial.cleanBase} / ${W.trial.base}件＝${W.trial.rateBase}%。` : ""}`, `Counted over the last 30 days (${span30}): ${A.recv} requests, ${A.clean} ready as is. All time: ${AL.clean} / ${AL.recv}.`))}</p></section>`;
    put(grid.parentElement, ":scope > .v101fnext", items.length ? html : "", "afterend", grid);
    fixAiCounts(w, Aa);
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
      if (V.expOnly && ev.target && ev.target.closest && ev.target.closest("[data-v89ftog], [data-v99whyf], [data-v100dup]")) { V.expOnly = false; setTimeout(() => { const w2 = well(); if (w2) paintExpOnly(w2, false); }, 50); }
      /* 22.01.2（w3 W6）：区間の下の「入れ直す」「削除」→ その行の 21.89 の「入れ直す」・土台の「削除」（確かめの窓もそのまま）を押す */
      const px = ev.target && ev.target.closest && ev.target.closest("[data-v101re], [data-v101del]");
      if (px && fwdOn()) {
        ev.preventDefault();
        const tr = px.closest("tr");
        const tgt = tr && (px.hasAttribute("data-v101re") ? tr.querySelector(`[data-v89fre="${px.getAttribute("data-v101re")}"]`) : tr.querySelector(`[data-frdel="${px.getAttribute("data-v101del")}"]`));
        if (tgt) tgt.click();
        cnt(px.hasAttribute("data-v101re") ? "expRe" : "expDel");
        return;
      }
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v101go]");
      if (!b || !fwdOn()) return;
      ev.preventDefault();
      const k = b.getAttribute("data-v101go");
      const go = (key) => { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } try { RDX.goKey(key); } catch (e) { err("go", e); } };
      if (k === "exp") {
        /* 22.01.1（v3 N9）：行き先で期限切れの行が表の28行目以降に混ざって見えなかった → 期限切れの行だけを出し、最初の行へ（「すべての行に戻す」で戻る） */
        go("frates");
        setTimeout(() => { try { if (window.v89fShowExpired) window.v89fShowExpired(true); V.expOnly = true; const w2 = well(); if (w2) paintExpOnly(w2, true); } catch (e) { err("exp", e); } }, 300);
      } else if (k === "expall") { V.expOnly = false; const w2 = well(); if (w2) paintExpOnly(w2, false); }
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
  /* 22.01.1（v3 N10）：タイル「参加物流会社 3社」（この画面のレート表の会社）と「相見積の比較（6社）」（その依頼に見積を出した会社）・荷主の窓の「物流会社 6社」が食い違って見えた
     → タイルを「レート表の会社」と書き、受信した依頼に見積を出した会社の数（体験の世界の見本の会社を含む）を並べる */
  function paintCos(w) {
    const t = [...w.querySelectorAll(".g4 > .c")].find((c) => /^(参加物流会社|レート表の会社)$/.test(((c.querySelector("p.lbl") || {}).textContent || "").trim()));
    if (!t) return;
    const lb = t.querySelector("p.lbl"), kd = t.querySelector(".kd");
    let rc = []; try { rc = typeof fwdCos === "function" ? fwdCos() : []; } catch (e) { rc = []; }
    const all = new Set(); const per = [];
    reqs().forEach((r) => { const s = new Set(); (r.legs || []).forEach((l) => (l && l.offers || []).forEach((o) => { if (o && o.co) { s.add(o.co); all.add(o.co); } })); if (s.size) per.push({ id: r.id, n: s.size }); });
    setText(lb, M("レート表の会社", "Companies in this rate table", "本费率表中的公司", "Empresas en esta tabla"));
    if (kd) setText(kd, M(`この画面のレート表に入っている会社（貴社＋見本 ${Math.max(0, rc.length - 1)}社）`, `Companies whose rates are in this screen (you + ${Math.max(0, rc.length - 1)} samples)`));
    const mx = per.slice().sort((a, b) => b.n - a.n)[0];
    put(t, ":scope > .v101fcos", all.size ? `<div class="v101fcos" data-noi18n>${E(M(`受信した依頼に見積を出した会社は ${all.size}社です（体験の世界の見本の物流会社を含む）。「相見積の比較（◯社）」は、その依頼に見積を出した会社の数です${mx ? `（いちばん多いのは ${mx.id} の ${mx.n}社）` : ""}。荷主の画面の「物流会社 ◯社」は、荷主の側から見た参加物流会社の数です。`, `${all.size} companies quoted the requests you received (including sample companies). “Comparison (N)” counts the companies that quoted that request.`))}</div>` : "");
    const h = [...w.querySelectorAll(".c > h3")].find((x) => (x.textContent || "").trim() === "参加物流会社");
    if (h) put(h.parentElement, ":scope > .v101fcosn", `<p class="v101fcosn" data-noi18n>${E(M(`この画面のレート表の会社（${rc.length}社）です。受信した依頼には、ほかにも体験の世界の見本の物流会社が見積を出しています（全部で ${all.size}社）。`, `Companies in this rate table (${rc.length}). Other sample companies also quoted (${all.size} in all).`))}</p>`, "afterend", h);
  }
  function paintAgg(w) {
    try { paintCos(w); } catch (e) { err("cos", e); }
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

  /* 22.01.1（v3 N9）：期限切れの行だけを出す（ホームの「期限切れのレート N本を入れ直す」から） */
  function rateTbl(w) {
    try { if (typeof v89fRateTable === "function") return v89fRateTable(w); } catch (e) { /* 下で */ }
    return [...w.querySelectorAll("table")].find((t) => t.querySelector("[data-frdel]")) || null;
  }
  function paintExpOnly(w, scroll) {
    const t = rateTbl(w); if (!t) return;
    const on = !!V.expOnly;
    if (t.classList.contains("v101fexponly") !== on) t.classList.toggle("v101fexponly", on);
    const rows = [...t.querySelectorAll("tbody tr.v89fexp")];
    const tw = t.closest(".tw") || t;
    /* 22.01.2：期限切れの行の形態（COURIER は手入力の形態に無いので、21.89 の「入れ直す」はレート表の取り込みの欄へ移る） */
    let cour = 0; try { rows.forEach((tr) => { const d = tr.querySelector("[data-frdel]"); const r0 = d && (FWDB.rates || [])[+d.getAttribute("data-frdel")]; if (r0 && String(r0.mode || "").toUpperCase() === "COURIER") cour++; }); } catch (e) { cour = 0; }
    const courNote = cour ? M(`（うち COURIER ${cour}本は、手入力の形態に無いため、「入れ直す」を押すとレート表の取り込み〔Excel〕の欄へ移ります。新しいレート表を取り込むと、同じ会社・区間・形態の行が置き換わります）`, ` (${cour} COURIER rate(s): “Renew” takes you to the rate-sheet upload.)`) : "";
    put(tw.parentElement, ":scope > .v101fexpbar", on && rows.length ? `<div class="v101fexpbar" data-noi18n role="status"><b>${E(M(`期限切れのレートだけを表示しています（${rows.length}本）`, `Showing expired rates only (${rows.length})`, `仅显示已过期的费率（${rows.length}条）`, `Solo tarifas vencidas (${rows.length})`))}</b><span>${E(M("各行の区間の下の「入れ直す」で新しい運賃・有効期限に置き換えるか、「削除」で外せます（見積・推奨には使われていません）", "Use “Renew” / “Delete” under each lane (they are not used in quotes)") + courNote + M("。この表示のあいだは、上のほかの絞り込みは使っていません。", ". Other filters above are not applied while this is on."))}</span><button type="button" class="btn g" data-v101go="expall" data-noi18n>${E(M("期限切れだけの表示をやめる", "Stop showing expired only", "取消仅显示已过期", "Dejar de mostrar solo vencidas"))}</button></div>` : "", "beforebegin", tw);
    /* 22.01.2（w3 W5）：期限切れだけのあいだは、ほかの絞り込みの「すべての行」（21.99 の青・22.00 の茶）を押された印にしない（読み上げも）。やめると元に戻す */
    w.querySelectorAll('[data-v99whyf=""], [data-v100dup="off"]').forEach((bt) => {
      if (on) { if (bt.getAttribute("aria-pressed") === "true") { bt.dataset.v101ap = "1"; bt.setAttribute("aria-pressed", "false"); } if (!bt.classList.contains("v101fapoff")) bt.classList.add("v101fapoff"); }
      else { if (bt.dataset.v101ap === "1") { bt.setAttribute("aria-pressed", "true"); delete bt.dataset.v101ap; } if (bt.classList.contains("v101fapoff")) bt.classList.remove("v101fapoff"); }
    });
    /* 22.01.2（w3 W6）：「入れ直す」「削除」は表の右端（横に動かさないと見えない）→ 期限切れだけのあいだは、区間の下に同じ働きのボタンを置く */
    rows.forEach((tr) => {
      const cell = tr.cells[1]; if (!cell) return;
      const re = tr.querySelector("[data-v89fre]"), del = tr.querySelector("[data-frdel]");
      const cur = cell.querySelector(":scope > .v101fexpact");
      if (!on || !re) { if (cur) cur.remove(); return; }
      if (cur) return;
      const d = document.createElement("span"); d.className = "v101fexpact"; d.setAttribute("data-noi18n", "");
      const r1 = del && (FWDB.rates || [])[+del.getAttribute("data-frdel")];
      d.innerHTML = `<span class="v101fexpv">${E(M(`有効期限 ${(r1 && r1.valid) || "—"}（期限切れ）`, `Valid until ${(r1 && r1.valid) || "—"} (expired)`))}</span><button type="button" class="btn g" data-v101re="${E(re.getAttribute("data-v89fre"))}">${E(M("入れ直す", "Renew"))}</button>${del && !del.disabled ? `<button type="button" class="btn g" data-v101del="${E(del.getAttribute("data-frdel"))}">${E(M("削除", "Delete"))}</button>` : ""}`;
      cell.appendChild(d);
    });
    if (!on) w.querySelectorAll(".v101fexpact").forEach((x) => x.remove());
    /* 22.01.3（x3 X6）：表の上の件数（土台の絞り込みの数）も、期限切れだけのあいだは「16/63件」に。やめると元の数に戻す */
    try {
      const card = t.closest(".c") || t.parentElement; const n = card && card.querySelector("[data-uxn]");
      if (n) {
        const all = [...t.querySelectorAll("tbody tr")].filter((tr) => tr.querySelector("[data-frdel]")).length;
        if (on) { const want = `${rows.length}/${all}${M("件", "")}`; if (n.dataset.v101cnt == null) n.dataset.v101cnt = n.textContent; if (n.textContent !== want) n.textContent = want; }
        else if (n.dataset.v101cnt != null) { n.textContent = n.dataset.v101cnt; delete n.dataset.v101cnt; }
      }
    } catch (e) { err("expcnt", e); }
    if (on && scroll && rows[0]) { try { const bar = tw.parentElement.querySelector(":scope > .v101fexpbar"); (bar || rows[0]).scrollIntoView({ block: "start" }); } catch (e) { /* 無視 */ } }
  }
  /* ═══ No.628 物流レート管理：手入力の欄の前に「区間のレート」で答えること ═══════════════ */
  function paintRates(w) {
    try { paintExpOnly(w, false); } catch (e) { err("exponly", e); }
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

  /* ═══ 22.01.1（v3 N7）「レートを登録して回答」の窓：見出し・本文・区間の言葉を、窓にあるボタンと同じに ═══════════════ */
  function fixAnsSheet(id) {
    try {
      const sh = document.getElementById("v33sheet");
      const r = reqs().find((x) => x.id === id);
      if (!sh || !r) return;
      const cards = [...sh.querySelectorAll(".v90fansc")]; if (!cards.length) return;
      /* 22.01.3（x3 X3）：貴社の見積が依頼と違う仕出港のレートの写し（横浜港→香港 など）の国は、その区間を直してもこの依頼には使われない → 依頼の仕出港発のこの区間を登録へ */
      let nPol = 0, polLane = "";
      cards.forEach((cd, i) => {
        const l = (r.legs || [])[i]; const ow = l && typeof v101fOwnOffer === "function" ? v101fOwnOffer(l) : null;
        const OI = ow && typeof v101fOwnLegInfo === "function" ? v101fOwnLegInfo(r, l, ow) : null;
        if (!OI || !OI.pol || !r.pol) return;
        nPol++;
        const pod = ((/→\s*(.+)$/.exec(String((ow.quote || {}).lane || "")) || [])[1] || l.pod || l.cty || "").trim();
        polLane = `${OI.lanePol} → ${pod}`;
        const bt = cd.querySelector("[data-v90fans]"); if (bt) { bt.dataset.v101pol = r.pol; setText(bt, M(`${r.pol}発のこの区間を登録`, `Register this lane from ${r.pol}`)); }
        put(cd, ":scope > .v101fanspol", `<p class="v101fanspol" data-noi18n role="note">${E(M(`この見積は ${OI.lanePol}発のレートの写し（期限 ${OI.valid}）で組まれています（依頼は${r.pol}発）。${OI.lanePol} → ${pod}の金額を直しても、この依頼の見積には使われません。「${r.pol}発のこの区間を登録」を押すと、手入力の欄に ${r.pol} → ${pod}・${String(r.mode || "LCL").toUpperCase()} が入ります。`, `This quote uses a ${OI.lanePol} rate copy; editing it does not affect this request (from ${r.pol}).`))}</p>`, "afterend", cd.querySelector(".v90fansk"));
      });
      if (nPol && nPol === cards.length) {
        const H0 = [...sh.querySelectorAll("h3, h2, .v33sh-t, b")].find((x) => /回答の金額を直す|見積回答（金額を直す）|レートを登録して回答（|回答の金額を直す・レートを登録（|発のレートを登録して回答/.test(x.textContent || ""));
        const title = M(`${r.pol}発のレートを登録して回答（区間のレート）：${id}`, `Register a rate from ${r.pol}: ${id}`);
        if (H0) { const f = H0.firstChild && H0.firstChild.nodeType === 3 ? H0.firstChild : null; if (f) { if (f.nodeValue !== title) f.nodeValue = title; } else if (!H0.children.length) setText(H0, title); }
        const p0 = sh.querySelector("p.nn");
        if (p0) setText(p0, M(`この依頼は${r.pol}発です。貴社の見積は依頼と違う仕出港のレートの写しで組まれているため、${polLane}の区間を直しても、この依頼の見積は組み直されません。下の「${r.pol}発のこの区間を登録」で、依頼の仕出港発のレートを登録してください（区間のレートなので、同じ区間のほかの依頼にも使われます）。「追加」を押すまで何も変わりません。登録しても、${(typeof v101fLaterTxt === "function" ? v101fLaterTxt(r) : "").replace(/^組み直されるのは/, "この依頼の見積が組み直されるのは")}${typeof v101fDemoTxt === "function" && v101fDemoTxt() ? "。" + v101fDemoTxt() : ""}。`, `This request is from ${r.pol}; register a rate from ${r.pol}. Editing ${polLane} does not affect it.`));
        cnt("anspol");
        return;
      }
      let nEdit = 0, nReg = 0;
      cards.forEach((cd) => {
        const bt = cd.querySelector("[data-v90fans]"); if (!bt) return;
        if (/この区間のレートを登録|Register this lane/.test(bt.textContent || "")) nReg++; else nEdit++;
        /* 区間の言葉：「貴社のレートでの見積なし（レーン未登録）」の「レーン未登録」は、チップの「レーン未登録」（どの会社も無い）と別の意味だった */
        const k = cd.querySelector(".v90fansk");
        const cty = ((cd.querySelector(".v90fansh b") || {}).textContent || "").trim();
        const l = (r.legs || []).find((x) => x && x.cty === cty);
        if (k && /貴社のレートでの見積なし（レーン未登録）|No quote with your rate/.test(k.textContent || "")) {
          const ST = l && l.ok && typeof v101fLegStale === "function" ? v101fLegStale(r, l) : null;
          const t = l && l.ok ? M(`貴社のレートなし（この区間は他社の見積だけ${ST && ST.stale ? "・その見積も期限切れなどで荷主の画面では取り下げ" : ""}）`, "No rate of yours (only other forwarders quoted this lane)") : M("貴社のレートなし（どの会社のレートも無い区間）", "No rate of yours (no company has a rate for this lane)");
          setText(k, t);
        }
      });
      /* 22.01.4（V1-4）：組み直されるのは荷主がこの依頼を画面で開いたとき（見本の依頼は組み直されない・デモ用のアカウントは保存されない） */
      const rr0 = (typeof FWDB !== "undefined" && FWDB && (FWDB.reqs || []).find((x) => x && x.id === id)) || null;
      const lt0 = typeof v101fLaterTxt === "function" ? v101fLaterTxt(rr0) : "";
      const orph0 = typeof v101fOrphan === "function" && rr0 && v101fOrphan(rr0) === 1;
      const way = /荷主が次に画面を開いたときに|荷主がこの依頼を画面で開いたとき/.test(sh.textContent || "") ? M(`${orph0 ? lt0 : lt0.replace(/^組み直されるのは/, "この依頼の見積が組み直されるのは")}。${typeof v101fDemoTxt === "function" && v101fDemoTxt() ? v101fDemoTxt() + "。" : ""}`, "this request is rebuilt only when the shipper opens it.") : M("関係する依頼だけを同じ決まりで計算し直します。", "only the related requests are recalculated.");
      const H = [...sh.querySelectorAll("h3, h2, .v33sh-t, b")].find((x) => /回答の金額を直す（区間のレートを直します）|見積回答（金額を直す）|レートを登録して回答（|回答の金額を直す・レートを登録（/.test(x.textContent || ""));
      let title = "", body = "";
      if (!nEdit && nReg) {
        title = M(`レートを登録して回答（区間のレートを登録します）：${id}`, `Register a rate to answer (lane rate): ${id}`);
        body = M(`ここで登録するのは「区間のレート」（仕出港 → 仕向け・形態ごとの運賃）です。この依頼だけの金額（スポットの見積）は出せません。「この区間のレートを登録」を押すと、物流レート管理の手入力の欄に、この区間（仕出港・仕向け・形態）が入ります。運賃・日数・有効期限を入れて「追加」を押すと、${way}同じ区間のほかの依頼の見積にも使われます。「追加」を押すまで何も変わりません。`, `You register a lane rate here (no one-off price for one request). Press “Register this lane” to prefill the manual form; after you press Add, ${way}`);
      } else if (nEdit && nReg) {
        title = M(`回答の金額を直す・レートを登録（区間のレート）：${id}`, `Edit price / register rate (lane rate): ${id}`);
        body = M(`ここで直す・登録するのは「区間のレート」です。この依頼だけの金額（スポットの見積）は出せません。貴社のレートがある区間は「この区間の金額を直す」で今の値が、無い区間は「この区間のレートを登録」でその区間が、物流レート管理の手入力の欄に入ります。「追加」を押すと、${way}同じ区間のほかの依頼にも使われます。「追加」を押すまで何も変わりません。`, `Edit or register lane rates. After you press Add, ${way}`);
      }
      if (title && H) {
        const f = H.firstChild && H.firstChild.nodeType === 3 ? H.firstChild : null;
        if (f) { if (f.nodeValue !== title) f.nodeValue = title; } else if (!H.children.length) setText(H, title);
      }
      const p = sh.querySelector("p.nn");
      if (body && p) setText(p, body);
      /* 22.01.4（V1-4）：前の層の文「荷主が次に画面を開いたときに（、）この依頼の見積が組み直されて届きます」も同じ言い方に */
      try {
        const tw = document.createTreeWalker(sh, NodeFilter.SHOW_TEXT);
        const nn = []; while (tw.nextNode()) nn.push(tw.currentNode);
        nn.forEach((n) => {
          const x = n.data || "";
          if (!/荷主が次に画面を開いたときに、?この依頼の見積が組み直されて届きます/.test(x)) return;
          const y = x.replace(/荷主が次に画面を開いたときに、?この依頼の見積が組み直されて届きます。?/g, M("この依頼の見積が組み直されるのは、荷主がこの依頼を画面で開いたときです（開かれるまで、ここの見積は前のまま）。", "this request is rebuilt only when the shipper opens it. "));
          if (y !== x) n.data = y;
        });
      } catch (e2) { err("anssheet2", e2); }
      cnt("anssheet");
    } catch (e) { err("anssheet", e); }
  }
  if (typeof v90fAnsOpen === "function" && !window.__v101fAns) {
    window.__v101fAns = 1;
    const __ao101 = v90fAnsOpen;
    v90fAnsOpen = function (id) { const o = __ao101.apply(this, arguments); try { if (fwdOn()) { fixAnsSheet(id); setTimeout(() => fixAnsSheet(id), 60); } } catch (e) { err("ansopen", e); } return o; }; // eslint-disable-line no-global-assign
  }

  /* ═══ 22.01.1（v3 N3）荷主の「物流会社に見積を依頼（相見積）」の確かめの窓：送る中身（容積・箱数・総重量）と同じ値を出す ═══════════════
     22.00 の窓（rd_v100flow.js の planOf）は opts.cbm が無いと「2m³（容積の目安）」と出していたが、送る中身は 21.56 の v56shipPack（商品の寸法・重量と数量から計算）。
     ・この層は一番外で fwdRequest を包み、窓が出たら「何を：」の行を v101fShipPlan（同じ決め方）の値に書き換える（送る中身そのものは変えない）
     ・21.60 の条件の欄（容積・重量など）から依頼したときは、確かめの窓で 2秒を過ぎると条件が読まれなくなっていた（21.60・21.802 は押してから2秒以内だけ読む）
       → 呼ばれた時点で同じ読み方で opts に入れておく（窓に出す値と送る値が同じになる） */
  function fixAskBox(plan, tries) {
    try {
      const box = document.getElementById("v100fAsk");
      if (!box) { if (tries > 0) setTimeout(() => fixAskBox(plan, tries - 1), 60); return; }
      const li = [...box.querySelectorAll(".v100f-askl li")].find((x) => /^(何を：|What: )/.test((x.textContent || "").trim()));
      if (!li || li.dataset.v101) return;
      const b = li.querySelector("b");
      const tn = b ? b.nextSibling : null;
      if (!tn || tn.nodeType !== 3) return;
      let s = String(tn.data);
      const vol = plan.src === "pack" ? M(`${CB(plan.cbm)} m³・${plan.cartons}カートン・総重量 ${(+plan.gw || 0).toLocaleString("ja-JP")} kg（商品の寸法・重量と数量から計算。この値で送ります）`, `${CB(plan.cbm)} m³, ${plan.cartons} cartons, ${plan.gw} kg (calculated from the product size/weight and quantity; sent as is)`)
        : plan.src === "cond" ? M(`${CB(plan.cbm)} m³（入れた条件の値。この値で送ります）`, `${CB(plan.cbm)} m³ (from the conditions you entered)`)
          : plan.src === "opts" ? M(`${CB(plan.cbm)} m³（この値で送ります）`, `${CB(plan.cbm)} m³`)
            : M(`標準 ${CB(plan.cbm)} m³（商品の寸法・重量が足りないため。物流会社には標準 ${CB(plan.cbm)} m³ として届きます）`, `standard ${CB(plan.cbm)} m³ (size/weight missing)`);
      const re = /[・,]\s*[\d.]+\s*m³\s*(（容積の目安）|\(est\. volume\))\s*$/;
      if (re.test(s)) s = s.replace(re, M("・", ", ") + vol);
      else s = s + M("・", ", ") + vol;
      if (plan.pol) s = s.replace(/（([^（）]+)）(?=[・,]\s*(LCL|FCL|AIR|COURIER))/, (m, p) => (p === plan.pol ? m : `（${plan.pol}）`));
      /* 22.01.2（w3 W10）：「FOB 神戸港（神戸港）」のように、条件に港が入っているときは（港）を重ねない */
      s = s.replace(/([^・,]*?)（([^（）]+)）(?=[・,]\s*(LCL|FCL|AIR|COURIER))/, (m, term, port) => (term.indexOf(port) >= 0 ? term : m));
      tn.data = s;
      li.dataset.v101 = "1";
      V.askFix = { at: Date.now(), plan, txt: li.textContent };
      cnt("askfix");
    } catch (e) { err("askfix", e); }
  }
  if (typeof fwdRequest === "function" && !window.__v101fReq) {
    window.__v101fReq = 1;
    const __rq101 = fwdRequest;
    fwdRequest = function (opts) { // eslint-disable-line no-global-assign
      let o2 = opts;
      try {
        if (!fwdOn() && typeof D !== "undefined" && D && D.ship) {
          o2 = Object.assign({}, opts || {});
          if (typeof V60 !== "undefined" && V60 && V60.go && Date.now() - V60.go < 2000 && typeof v60CondRead === "function") {
            const c = v60CondRead() || {};
            let n = 0; Object.keys(c).forEach((k) => { if (o2[k] == null || o2[k] === "") { o2[k] = c[k]; n++; } });
            if (n && c.cbm) Object.defineProperty(o2, "__v101cond", { value: 1, enumerable: false });
          }
          const plan = typeof v101fShipPlan === "function" ? v101fShipPlan(o2) : null;
          if (plan) { V.shipPlan = plan; setTimeout(() => fixAskBox(plan, 30), 0); }
        }
      } catch (e) { err("fwdreq", e); o2 = opts; }
      return __rq101.call(this, o2);
    };
  }

  /* ═══ 22.01.2（w3 W3）「B/L の容積で反映する」の確かめの窓：帯・明細と同じ事実に（2 m³ は標準値・荷主の画面では取り下げで金額は出ていない） ═══ */
  function fixApplySheet(csid) {
    try {
      const sh = document.getElementById("v33sheet"); if (!sh || !/B\/L の容積で見積を反映しますか/.test(sh.textContent || "")) return;
      const C = typeof v33Cases === "function" ? (v33Cases() || []) : [];
      const c = C.find((k) => typeof v33CsId === "function" && v33CsId(k.key) === csid); if (!c) return;
      const cs = (typeof v33One === "function" ? v33One("cs", csid) : null) || {};
      const A = typeof v97fVolAuto === "function" ? (v97fVolAuto(c, cs) || []) : [];
      if (!A.length) return;
      const RQ = A.map((a) => reqs().find((x) => x.id === a.rid)).filter(Boolean);
      const allDef = RQ.length && RQ.every((r) => typeof v101fVolSrc === "function" && v101fVolSrc(r).kind === "default");
      const st = A.map((a) => { const rq = reqs().find((x) => x.id === a.rid); const lg = rq && (rq.legs || []).find((l) => l && l.cty === a.cty); return rq && lg && typeof v101fLegStale === "function" ? v101fLegStale(rq, lg) : null; });
      const allStale = st.length && st.every((x) => x && x.stale);
      const vmax = st.map((x) => x && x.valid).filter(Boolean).sort().pop() || "";
      const cos = [...new Set(A.map((a) => a.co).filter(Boolean))];
      const SC = typeof v101fVolScope === "function" ? v101fVolScope(c, cs) : null;
      const tw = document.createTreeWalker(sh, NodeFilter.SHOW_TEXT); let n1 = 0;
      while (tw.nextNode()) {
        const n = tw.currentNode; const d = String(n.data || "");
        const m = /^荷主の共有 ([\d.]+) m³ の見積を、B\/L の ([\d.]+) m³ で計算し直した金額にします。$/.exec(d.trim());
        if (m && allDef) { n.data = M(`見積に使った標準 ${m[1]} m³（荷主が容積を入れていない依頼の既定値。荷主が共有した値ではありません）の見積を、B/L の ${m[2]} m³ で計算し直した金額にします${SC && SC.restricted ? `（B/L の仕向地 ${SC.dest}の区間だけ）` : ""}。`, `Quotes calculated with the standard ${m[1]} m³ (not shared by the shipper) become the amounts for the B/L ${m[2]} m³.`); n1++; continue; }
        if (allStale && /荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額のままです。/.test(d)) { n.data = d.replace("荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額のままです。", M(`もとの見積は${cos.length && cos.every((x) => x !== me()) ? `他社（${cos.join("・")}）の` : ""}有効期限が切れた見積（${vmax}）で、荷主の画面では取り下げ（レーン未登録）になっているため、荷主の画面に金額は出ていません（反映しても荷主には届きません）。`, "The original quotes have expired and are withdrawn on the shipper's screen (no amount is shown there).")); n1++; }
      }
      if (n1) cnt("applysheet");
    } catch (e) { err("applysheet", e); }
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest('[data-v97vol="apply"]');
      if (!b || !fwdOn()) return;
      const cs = b.getAttribute("data-cs") || "";
      [0, 60, 250].forEach((ms) => setTimeout(() => fixApplySheet(cs), ms));
    } catch (e) { err("applyclick", e); }
  });

  /* ═══ 描き直しのたびに ═══════════════════════════════════════════════ */
  let busy = false;
  function paint() {
    if (busy) return;
    busy = true;
    try {
      if (!fwdOn()) return;
      const w = well(); if (!w) return;
      const pg = page(), k = rdKey();
      /* 22.01.1（v3 N1）：受信箱を離れたら、チップ「貴社は未回答」の押した状態を外す（戻ったときは「すべて」で始まる＝表とチップの印が同じ） */
      /* RDX の画面のキーで見る（ホームなど刷新版の画面では、古い fwdCur が "finbox" のまま残ることがある） */
      const at = (key) => (k ? k === key : pg === key);
      if (!at("finbox") && CH.on) { CH.on = false; cnt("chipReset"); }
      if (!at("frates") && V.expOnly) V.expOnly = false;
      if (k === "fhome") { try { paintHome(w); } catch (e) { err("home", e); } }
      else if (k === "finbox" || pg === "finbox") {
        try { paintInboxRows(w); } catch (e) { err("rows", e); }
        try { paintChip(w); } catch (e) { err("chip", e); }
        try { paintInboxNote(w); } catch (e) { err("inote", e); }
        try { paintNlWhy(w, typeof v101fAutoRate === "function" ? v101fAutoRate() : { others: 0 }); } catch (e) { err("nlwhy", e); }
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
