/* ═══ v21.96 fwd（2026-11-17 第9回相当 UAT）物流会社の画面の見せ方の層（logic_v2196fwd.js・rd_v96fwd.css のあとに読む）
   No.519 案件：国ごとの見積に「荷主共有の n m³ で計算」／「B/L の n m³ で計算し直す」→ 差を見せて「反映する」・「元に戻す」。
          反映した見積は、案件の依頼の行・見積受信箱の行・見積の詳細にも出す。v90f の「見積の前提」の箱は、この箱に置き換える（隠す）。
   No.520 物流レート管理：日数に「既定値」「既定値かも」の札と「日数を確かめる」。v90f の「日数が一律10日（…可能性）」の文を、行ごとの判断に置き換える。
          見積の詳細・相見積の表・推奨・AI の答えのレートの表で、既定値の日数に札を出す。
   No.521 案件の HS の欄：直した見本データには「2208.90 → 2206.00 に直しました」、利用者が入れた値には「2206.00 に直す」。
   6.1   運賃が中央値から大きく外れた行（v90f の警告）に「組み込みの見本の値ではなく、登録されたレート」を添える。
   土台・前の層の関数は控えてから包むだけ。インラインの onclick・style は書かない（イベントは document への委譲）。 */
(function () {
  "use strict";
  if (window.__v96fwdRd) return;
  window.__v96fwdRd = 1;
  const V = window.V96FWD || (window.V96FWD = { v: "21.96", err: [], n: {}, pv: {} });
  const err = (k, e) => { try { V.err.push("rd." + k + ": " + String((e && e.message) || e).slice(0, 160)); if (V.err.length > 40) V.err.shift(); } catch (x) { /* 記録できないときは何もしない */ } };
  const M = (ja, en) => (typeof v96fM === "function" ? v96fM(ja, en) : ja);
  const E = (s) => (typeof v96fE === "function" ? v96fE(s) : String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const Y = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  const CB = (v) => (typeof v96fCbm === "function" ? v96fCbm(v) : String(v));
  const on = () => (typeof v96fOn === "function" ? v96fOn() : false);
  const page = () => { try { return (typeof fwdCur !== "undefined" && fwdCur) || ""; } catch (e) { return ""; } };
  const well = () => document.getElementById("well");
  const day = (t) => { try { const d = new Date(+t); return (d.getMonth() + 1) + "/" + d.getDate(); } catch (e) { return ""; } };
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; };
  const ttBadge = (k) => k ? `<span class="v96ttb ${k}" data-noi18n title="${E(typeof v96fTtWhy === "function" ? v96fTtWhy(k) : "")}">${E(typeof v96fTtWord === "function" ? v96fTtWord(k) : k)}</span>` : "";

  /* ─── No.519 案件の「見積の容積」の箱 ─────────────────────────────── */
  function brk(q) {
    if (!q) return "";
    if (q.courier) return M(`運賃（小包）${Y(q.freight)}（${q.unit || ""}${q.basis ? "・" + q.basis : ""}）`, `Courier ${Y(q.freight)}`);
    if (q.v56shipFob) return M(`THC等諸掛 ${Y(q.thc)} ＋ 書類費 ${Y(q.doc)}（FOB）`, `THC ${Y(q.thc)} + docs ${Y(q.doc)} (FOB)`);
    return M(`${/AIR/i.test(String(q.mode || "")) ? "航空運賃" : "海上運賃"} ${Y(q.freight)}（${q.unit || ""}${q.basis ? "・" + q.basis : ""}）＋ THC等諸掛 ${Y(q.thc)} ＋ 書類費 ${Y(q.doc)}`,
      `Freight ${Y(q.freight)} (${q.unit || ""}${q.basis ? ", " + q.basis : ""}) + THC ${Y(q.thc)} + docs ${Y(q.doc)}`);
  }
  function diffTxt(a, b) {
    const d = Math.round(+b - +a);
    if (!d) return M("金額は変わりません", "no change");
    return d < 0 ? M(`${Y(-d)} 安い`, `${Y(-d)} lower`) : M(`${Y(d)} 高い`, `${Y(d)} higher`);
  }
  function lineHtml(x) {
    const rid = E(x.rid), cty = E(x.cty), da = `data-rid="${rid}" data-cty="${cty}"`;
    const from = x.from != null ? CB(x.from) : "—";
    const me = typeof v96fMe === "function" ? v96fMe() : "";
    const head = `<span class="v96fvol-n"><b>${rid}</b> ${E(x.cty)}${x.P && x.P.co && me && x.P.co !== me ? E(M(`（${x.P.co} の見積）`, ` (${x.P.co}'s quote)`)) : ""}</span>`;
    let h = "";
    if (x.ap) {
      const ap = x.ap;
      h += `<div class="v96fvol-r">${head}<span class="v96fvol-amt">${Y(ap.neu)}</span><span class="v96tag bl">${E(M(`B/L の ${CB(ap.cbm)} m³ で計算（反映済み）`, `Calculated with B/L ${CB(ap.cbm)} m³ (applied)`))}</span>`
        + `<span class="v96fvol-was">${E(M(`元の見積 ${Y(ap.old)}（荷主共有の ${ap.from != null ? CB(ap.from) : from} m³）・${diffTxt(ap.old, ap.neu)}`, `Original ${Y(ap.old)} (shipper ${ap.from != null ? CB(ap.from) : from} m³)`))}</span>`
        + `<button type="button" class="btn g v96fvol-b" data-v96vol="undo" ${da}>${E(M(`元に戻す（荷主共有の ${ap.from != null ? CB(ap.from) : from} m³ に）`, "Undo (back to shipper's volume)"))}</button></div>`;
      h += `<p class="v96fvol-meta">${E(M(`内訳：${brk(ap.q)}`, `Breakdown: ${brk(ap.q)}`))}${ap.at ? E(M(`／${day(ap.at)} ${ap.by || ""} が反映`, ` / applied ${day(ap.at)} ${ap.by || ""}`)) : ""}</p>`;
      if (x.bl != null && Math.abs(x.bl - +ap.cbm) > 0.0001)
        h += `<p class="v96fvol-warn">⚠ ${E(M(`B/L の容積が変わりました（反映したのは ${CB(ap.cbm)} m³・いまの B/L は ${CB(x.bl)} m³）`, `B/L volume changed (${CB(ap.cbm)} → ${CB(x.bl)} m³)`))} <button type="button" class="btn g v96fvol-b" data-v96vol="calc" ${da}>${E(M(`いまの B/L の ${CB(x.bl)} m³ で計算し直す`, `Recalculate with ${CB(x.bl)} m³`))}</button></p>`;
      if (x.P && x.P.q && Math.round(+x.P.q.total) !== Math.round(+ap.old))
        h += `<p class="v96fvol-warn">⚠ ${E(M(`荷主の見積が変わっています（反映したときは ${Y(ap.old)}・いまは ${Y(x.P.q.total)}）。計算し直してください`, `The shipper's quote changed (${Y(ap.old)} → ${Y(x.P.q.total)}); recalculate`))}</p>`;
    } else {
      const can = x.bl != null && x.from != null && Math.abs(x.bl - x.from) > 0.0001;
      h += `<div class="v96fvol-r">${head}<span class="v96fvol-amt">${Y(x.P.q.total)}</span><span class="v96tag sh">${E(M(`荷主共有の ${from} m³ で計算`, `Calculated with shipper's ${from} m³`))}</span>`
        + (can ? `<button type="button" class="btn g v96fvol-b" data-v96vol="calc" ${da}>${E(M(`B/L の ${CB(x.bl)} m³ で計算し直す`, `Recalculate with B/L ${CB(x.bl)} m³`))}</button>` : "")
        + `</div>`;
    }
    const pv = x.pv;
    if (pv && pv.err)
      h += `<p class="v96fvol-warn" role="status">⚠ ${E(pv.err)}</p>`;
    else if (pv) {
      const same = Math.round(pv.neu) === Math.round(pv.old);
      h += `<div class="v96fvol-pv" role="status"><p>${E(M(`B/L の ${CB(pv.cbm)} m³ で計算すると `, `With B/L ${CB(pv.cbm)} m³: `))}<b>${Y(pv.neu)}</b>${E(M(`（今の見積 ${Y(pv.old)} より `, ` (current ${Y(pv.old)}, `))}<b class="${pv.neu < pv.old ? "dn" : pv.neu > pv.old ? "up" : ""}">${E(diffTxt(pv.old, pv.neu))}</b>${E(M("）", ")"))}</p>`
        + `<p class="v96fvol-meta">${E(M(`内訳：${brk(pv.q)}`, `Breakdown: ${brk(pv.q)}`))}</p>`
        + `<p class="v96fvol-meta">${E(same ? M("この見積は容積で金額が変わらない計算です（コンテナの本数・小包の最小重量帯 など）。反映しなくてもかまいません。", "This quote does not change with volume.") : M("見積のときと同じレート（単価・形態）で、容積だけを B/L の値にして計算しています。", "Same rate as the quote; only the volume is changed."))}</p>`
        + `<div class="v96fvol-act"><button type="button" class="btn" data-v96vol="apply" ${da}>${E(M("この金額を見積に反映する", "Apply this amount to the quote"))}</button><button type="button" class="btn g" data-v96vol="cancel" ${da}>${E(M("やめる", "Cancel"))}</button></div></div>`;
    }
    return `<li class="v96fvol-i" ${da}>${h}</li>`;
  }
  function volBox(c, cs, csid) {
    const L = (typeof v96fVolLines === "function") ? v96fVolLines(c, cs) : [];
    if (!L.length) return "";
    const sh = L[0].sh || {}, bl = L[0].bl, from = L[0].from;
    const differs = bl != null && from != null && Math.abs(bl - from) / Math.max(from, 0.0001) > 0.0001;
    if (!differs && !L.some((x) => x.ap)) return "";
    const head = bl != null
      ? M(`荷主の共有は ${from != null ? CB(from) : "—"} m³、B/L は ${CB(bl)} m³ です。国ごとに、見積をどちらの容積で計算するかを選べます。`, `Shipper shared ${from != null ? CB(from) : "—"} m³; the B/L says ${CB(bl)} m³. Choose which volume each quote uses.`)
      : M(`荷主の共有は ${from != null ? CB(from) : "—"} m³ です（B/L に容積が入っていません）。`, `Shipper shared ${from != null ? CB(from) : "—"} m³ (no volume on the B/L).`);
    const how = M("どちらが正しいかは荷主に確かめてください。① B/L の値が正しい →「B/L の … で計算し直す」で見積を直し、荷主にも数量の直しを頼む（「荷主に出荷情報を頼む（依頼ページ）」）② 荷主の値が正しい →「B/L・出荷の情報を入れる」で B/L の値を直す。", "Check with the shipper which is correct. (1) B/L is right: recalculate here and ask the shipper to correct the quantity. (2) Shipper is right: correct the B/L.");
    const eff = M("反映すると、この画面・見積受信箱・見積の詳細の金額が B/L の容積の見積になります（請求の目安）。元の見積は残るので、いつでも元に戻せます。荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額のままです。", "Once applied, this screen, the inbox and the quote details show the B/L-based amount. The original stays and you can undo. The shipper's screen keeps the original until they requote.");
    return `<div class="v96fvol" role="group" aria-label="${E(M("見積の容積", "Quote volume"))}" data-noi18n data-v96cs="${E(csid || "")}"><p class="v96fvol-h"><b>${E(M("見積の容積", "Quote volume"))}</b>${E(M("：", ": "))}${E(head)}${sh.gw ? E(M(`（重量・カートン数は荷主の共有のまま：総重量 約${sh.gw}kg${sh.ctn ? "・" + sh.ctn + "カートン" : ""}）`, ` (weight and cartons stay as shared by the shipper: about ${sh.gw} kg${sh.ctn ? ", " + sh.ctn + " cartons" : ""})`)) : ""}</p>`
      + `<ul class="v96fvol-l">${L.map(lineHtml).join("")}</ul><p class="v96fvol-how">${E(how)}<br>${E(eff)}</p></div>`;
  }
  function paintCases(w) {
    try {
      const C = (typeof v33Cases === "function") ? v33Cases() : [];
      w.querySelectorAll("section.v33case").forEach((sec) => {
        const ed = sec.querySelector("[data-csed]");
        if (!ed) return;
        const csid = ed.dataset.csed, c = C.find((k) => typeof v33CsId === "function" && v33CsId(k.key) === csid);
        if (!c) return;
        const cs = (typeof v33One === "function" ? v33One("cs", csid) : null) || {};
        /* 見積の容積 */
        const html = volBox(c, cs, csid);
        const old = sec.querySelector(".v96fvol");
        if (html) {
          const sig = hash(html);
          if (old) { if (old.dataset.sig !== sig) { old.outerHTML = html; } }
          else {
            const anc = sec.querySelector(".v90fbasis") || sec.querySelector(".v69fdiff") || sec.querySelector(".v33dl");
            if (anc) anc.insertAdjacentHTML("afterend", html); else sec.insertAdjacentHTML("beforeend", html);
          }
          const nb = sec.querySelector(".v96fvol");
          if (nb) nb.dataset.sig = sig;
          const bs = sec.querySelector(".v90fbasis");
          if (bs) bs.classList.add("v96hid");
        } else if (old) old.remove();
        /* 依頼の行の金額 */
        sec.querySelectorAll("li.v33li").forEach((li) => {
          const b = li.querySelector(".v33li-m b"), rid = b && (b.textContent || "").trim();
          if (!rid) return;
          const r = c.reqs.find((x) => x && x.id === rid);
          const tags = ((r && r.legs) || []).map((l) => { const ap = l && typeof v96fVolOf === "function" ? v96fVolOf(rid, l.cty) : null; return ap ? `<span class="v96tag bl v96fvtag" data-noi18n>${E(M(`${(r.legs.length > 1 ? l.cty + "：" : "")}B/L の ${CB(ap.cbm)} m³ で ${Y(ap.neu)}`, `${r.legs.length > 1 ? l.cty + ": " : ""}B/L ${CB(ap.cbm)} m³: ${Y(ap.neu)}`))}</span>` : ""; }).join("");
          if ((li.dataset.v96t || "") === tags) return;
          li.querySelectorAll(".v96fvtag").forEach((x) => x.remove());
          li.dataset.v96t = tags;
          if (tags) { const amt = [...li.children].find((x) => x.tagName === "SPAN" && /¥/.test(x.textContent || "")); (amt || b).insertAdjacentHTML("afterend", tags); }
        });
        /* No.521 HS の欄 */
        paintHs(sec, csid, cs);
      });
    } catch (e) { err("cases", e); }
  }
  /* ─── No.521 HS ─────────────────────────────────────────────── */
  function paintHs(sec, csid, cs) {
    try {
      const dt = sec.querySelector('.v33dl [data-v44k="hs"]') || [...sec.querySelectorAll(".v33dl dt")].find((x) => /HS/.test(x.textContent || ""));
      const dd = dt && dt.nextElementSibling;
      if (!dd) return;
      const fx = cs && cs.v96hs;
      const bad = typeof v96fHsBad === "function" && v96fHsBad(typeof v96fCsItem === "function" ? v96fCsItem(csid, cs) : cs.item, cs.hs);
      const sig = (fx && !fx.undone ? "f" + fx.at : "") + (bad ? "b" : "") + ":" + cs.hs;
      if ((dd.dataset.v96h || "") === sig) return;
      dd.dataset.v96h = sig;
      dd.querySelectorAll(".v96hsfix").forEach((x) => x.remove());
      if (fx && !fx.undone && String(cs.hs) === String(fx.to || "2206.00")) {
        dd.insertAdjacentHTML("beforeend", `<small class="v96hsfix ok" data-noi18n>${E(fx.auto ? M(`見本データの誤り（${fx.from}）を ${fx.to || "2206.00"} に直しました。日本酒（清酒）は 22.06 項です`, `Sample data corrected (${fx.from} → ${fx.to || "2206.00"}): sake is heading 22.06`) : M(`${fx.from} を ${fx.to || "2206.00"} に直しました（${day(fx.at)} ${fx.by || ""}）。日本酒（清酒）は 22.06 項です`, `Corrected ${fx.from} → ${fx.to || "2206.00"}`))} <button type="button" class="btn g v96hs-b" data-v96hs="undo" data-cs="${E(csid)}">${E(M(`元に戻す（${fx.from}）`, `Undo (${fx.from})`))}</button></small>`);
        dd.querySelectorAll(".v90hsq").forEach((x) => { x.hidden = true; });
      } else if (bad) {
        dd.insertAdjacentHTML("beforeend", `<small class="v96hsfix" data-noi18n><button type="button" class="btn g v96hs-b" data-v96hs="fix" data-cs="${E(csid)}">${E(M("2206.00（清酒）に直す", "Change to 2206.00 (sake)"))}</button> ${E(M("荷主の商品情報・インボイスの HS と合わせてから押してください（元に戻せます）", "Check the shipper's HS first (you can undo)"))}</small>`);
      }
    } catch (e) { err("hs", e); }
  }
  /* ─── 見積受信箱の行（No.519 反映済みの金額） ─────────────────── */
  function paintInbox(w) {
    try {
      const R = (typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || [];
      w.querySelectorAll("table tbody tr").forEach((tr) => {
        const m = /RQ-[A-Za-z0-9]+/.exec(tr.textContent || "");
        const r = m && R.find((x) => x && x.id === m[0]);
        if (!r) return;
        const tags = (r.legs || []).map((l) => { const ap = l && typeof v96fVolOf === "function" ? v96fVolOf(r.id, l.cty) : null; return ap ? `<span class="v96tag bl v96fvtag v96blk" data-noi18n title="${E(M(`B/L の容積で計算し直した見積（反映済み）。元の見積 ${Y(ap.old)}（荷主共有の ${ap.from != null ? CB(ap.from) : "—"} m³）`, "Recalculated with the B/L volume (applied)"))}">${E(M(`${r.legs.length > 1 ? l.cty + "：" : ""}B/L ${CB(ap.cbm)}m³ で ${Y(ap.neu)}`, `${r.legs.length > 1 ? l.cty + ": " : ""}B/L ${CB(ap.cbm)}m³: ${Y(ap.neu)}`))}</span>` : ""; }).join("");
        if ((tr.dataset.v96t || "") === tags) return;
        tr.querySelectorAll(".v96fvtag").forEach((x) => x.remove());
        tr.dataset.v96t = tags;
        if (!tags) return;
        const td = [...tr.children].find((x) => /¥\s*[\d,]+/.test(x.textContent || "")) || tr.lastElementChild;
        if (td) td.insertAdjacentHTML("beforeend", tags);
      });
    } catch (e) { err("inbox", e); }
  }
  /* ─── No.520 物流レート管理の表 ─────────────────────────────── */
  const OLD10 = /日数が一律10日（空欄のときの既定値の可能性・要確認）|Transit is a flat 10 days \(likely the default\) · check/;
  function paintRates(w) {
    try {
      const t = [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]"));
      if (!t) return;
      const R = (FWDB && FWDB.rates) || [];
      let nk = 0;
      [...t.querySelectorAll("tbody tr")].forEach((tr) => {
        const del = tr.querySelector("[data-frdel]");
        if (!del) return;
        const i = +del.dataset.frdel, r = R[i];
        if (!r) return;
        const k = typeof v96fTtKind === "function" ? v96fTtKind(r) : "set";
        const td = [...tr.children].find((x) => /^\s*\d+\s*日/.test(x.textContent || "")) || null;
        const want = (k === "def" || k === "maybe") ? k + ":" + i : r.ttOk ? "ok" : "";
        if (k === "def" || k === "maybe") nk++;
        if (td && (td.dataset.v96k || "") !== want) {
          td.querySelectorAll(".v96ttw").forEach((x) => x.remove());
          td.dataset.v96k = want;
          if (k === "def" || k === "maybe")
            td.insertAdjacentHTML("beforeend", `<span class="v96ttw" data-noi18n>${ttBadge(k)}<button type="button" class="btn g v96ttbtn" data-v96tt="${i}">${E(M("日数を確かめる", "Confirm days"))}</button></span>`);
          else if (r.ttOk) td.insertAdjacentHTML("beforeend", `<span class="v96ttw" data-noi18n><span class="v96ttok" title="${E(M("日数を確かめた値です", "Confirmed"))}">${E(M("確認済み", "confirmed"))}</span></span>`);
        }
        /* v90f の「日数が一律10日（…可能性）」の文を、この行の判断に置き換える */
        tr.querySelectorAll(".v90fchkt,.v90fchk").forEach((x) => {
          const isT = x.classList.contains("v90fchkt"), src = isT ? (x.textContent || "") : (x.getAttribute("title") || "");
          if (!OLD10.test(src) && !(isT && /中央値|median/.test(src))) return;
          let s = src;
          if (OLD10.test(s)) s = (k === "def" || k === "maybe") ? s.replace(OLD10, isT ? (typeof v96fTtWhyShort === "function" ? v96fTtWhyShort(k) : "") : (typeof v96fTtWhy === "function" ? v96fTtWhy(k) : "")) : s.replace(OLD10, "").replace(/／\s*$|^\s*⚠\s*／/, "");
          if (isT && /中央値|median/.test(s) && !/登録されたレート/.test(s) && typeof v96fIsSeed === "function" && !v96fIsSeed(r))
            s = s.replace(/(要確認)(?!.*要確認)/, "$1" + M("（組み込みの見本の値ではなく、登録されたレートです）", ""));
          s = s.replace(/⚠\s*$/, "").trim();
          if (isT) { if (!s.replace(/⚠/g, "").trim()) x.remove(); else x.textContent = s; }
          else if (!s.trim()) { const br = x.previousElementSibling; if (br && br.tagName === "BR") br.remove(); x.remove(); }
          else x.setAttribute("title", s);
        });
      });
      const tw = t.closest(".tw") || t;
      let note = w.querySelector(".v96ttnote");
      if (nk && !note) {
        tw.insertAdjacentHTML("beforebegin", `<p class="nn v96ttnote" data-noi18n>${E(M("日数の「既定値」は、取り込みや入力のとき日数が空欄だったため 10日 を入れた行です（実際の日数ではありません）。「既定値かも」は、この直しより前の取り込みで記録が無く判別できない行です（同じ会社の同じ形態の行や、同じ取り込みの行が全部 10日）。「日数を確かめる」で実際の日数を入れると、見積や納期の回答に使う日数が正しくなります。", "\"default\": transit days were blank at import and 10 days were filled in. \"may be default\": imported before this fix with no record. Use \"Confirm days\" to enter the actual days."))}</p>`);
      } else if (!nk && note) note.remove();
    } catch (e) { err("rates", e); }
  }
  function ttSheet(i) {
    try {
      const r = FWDB && FWDB.rates && FWDB.rates[+i];
      if (!r || typeof v33Sheet !== "function") return;
      const k = typeof v96fTtKind === "function" ? v96fTtKind(r) : "";
      const el = v33Sheet({
        title: M(`日数を確かめる：${r.pol} → ${r.pod}（${r.mode}）`, `Confirm transit days: ${r.pol} → ${r.pod} (${r.mode})`),
        html: `<p class="v33p" data-noi18n>${E(typeof v96fTtWhy === "function" ? v96fTtWhy(k) : "")}</p><label class="v96ttl" data-noi18n>${E(M("実際の所要日数（日）", "Actual transit days"))}<input class="v33in" id="v96ttin" type="number" min="1" max="365" step="1" value="${E(r.tt)}" inputmode="numeric"></label><p class="v33p v33mute" data-noi18n>${E(M("入れた日数は「登録された値」になり、見積・納期の回答にそのまま使います。", "The days you enter are used as registered values in quotes and delivery answers."))}</p><p class="v96ttmsg" role="alert" data-noi18n></p>`,
        foot: `<button class="btn g" type="button" data-v96ttx data-noi18n>${E(M("やめる", "Cancel"))}</button><button class="btn g" type="button" data-v96tt10 data-noi18n>${E(M("10日で正しい", "10 days is correct"))}</button><button class="btn" type="button" data-v96ttok data-noi18n>${E(M("この日数にする", "Use these days"))}</button>`
      });
      const done = (d) => {
        if (typeof v96fTtConfirm === "function" && v96fTtConfirm(i, d)) {
          if (typeof v33SheetClose === "function") v33SheetClose();
          try { if (typeof toast === "function") toast(M(`日数を ${d}日（登録された値）にしました`, `Transit set to ${d} days`)); } catch (e) { /* 知らせが出せなくても登録は済んでいる */ }
          rerender();
        } else { const m = el.querySelector(".v96ttmsg"); if (m) m.textContent = M("1〜365 の日数を入れてください", "Enter 1–365 days"); }
      };
      el.querySelector("[data-v96ttx]").addEventListener("click", () => { if (typeof v33SheetClose === "function") v33SheetClose(); });
      el.querySelector("[data-v96tt10]").addEventListener("click", () => done(10));
      el.querySelector("[data-v96ttok]").addEventListener("click", () => done((el.querySelector("#v96ttin") || {}).value));
    } catch (e) { err("ttsheet", e); }
  }
  /* ─── No.520 見積の詳細・相見積の表・推奨・AI の答えのレートの表 ───────── */
  if (typeof fwdCompareHtml === "function") {
    const __cm96r = fwdCompareHtml;
    fwdCompareHtml = function (r, l) {
      const s = __cm96r.apply(this, arguments);
      try {
        const O = (l && l.offers) || [];
        const ks = O.map((o) => (typeof v96fOfferKind === "function" ? v96fOfferKind(o) : ""));
        if (!ks.some(Boolean)) return s;
        const tp = document.createElement("template");
        tp.innerHTML = String(s);
        tp.content.querySelectorAll("tbody tr").forEach((tr) => {
          const b = tr.querySelector("td b"), co = b && (b.textContent || "").trim();
          const i = O.findIndex((o) => o && o.co === co);
          if (i < 0 || !ks[i]) return;
          const td = [...tr.children].find((x) => /約\s*\d+\s*日/.test(x.textContent || ""));
          if (td && !td.querySelector(".v96ttb")) td.insertAdjacentHTML("beforeend", "<br>" + ttBadge(ks[i]));
        });
        return tp.innerHTML;
      } catch (e) { err("cmp", e); return s; }
    };
  }
  if (typeof fwdRecHtml === "function") {
    const __rh96r = fwdRecHtml;
    fwdRecHtml = function (r, l) {
      const s = __rh96r.apply(this, arguments);
      try {
        const o = l && (l.offers || []).find((x) => x && x.co === l.rec);
        const k = o && typeof v96fOfferKind === "function" ? v96fOfferKind(o) : "";
        if (k && !/v96ttb/.test(String(s))) return String(s).replace(/(約\s*\d+\s*日)/, "$1" + ttBadge(k));
      } catch (e) { err("rec", e); }
      return s;
    };
  }
  if (typeof shipRateTbl === "function") {
    const __st96r = shipRateTbl;
    shipRateTbl = function (rows) {
      const s = __st96r.apply(this, arguments);
      try {
        const ks = (rows || []).map((r) => { const k = typeof v96fTtKind === "function" ? v96fTtKind(r) : ""; return k === "def" || k === "maybe" ? k : ""; });
        if (!ks.some(Boolean)) return s;
        const tp = document.createElement("template");
        tp.innerHTML = String(s);
        tp.content.querySelectorAll("tbody tr").forEach((tr, i) => {
          if (!ks[i]) return;
          const td = [...tr.children].find((x) => /約\s*\d+\s*日/.test(x.textContent || ""));
          if (td) td.insertAdjacentHTML("beforeend", " " + ttBadge(ks[i]));
        });
        return tp.innerHTML;
      } catch (e) { err("shiptbl", e); return s; }
    };
  }
  function paintDrawer(id) {
    try {
      const r = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).find((x) => x && x.id === id);
      if (!r || !Array.isArray(r.legs)) return;
      document.querySelectorAll(".dwbody .fwdleg").forEach((card) => {
        const b = card.querySelector("b"), cty = b && (b.textContent || "").trim();
        const l = r.legs.find((x) => x && x.cty === cty);
        if (!l || !l.ok) return;
        const k = typeof v96fQuoteKind === "function" ? v96fQuoteKind(l) : "";
        if (k && !card.querySelector(".v96ttb")) {
          const sp = [...card.querySelectorAll("span")].find((x) => /約\s*\d+\s*日/.test(x.textContent || "") && !x.querySelector("span"));
          if (sp) sp.insertAdjacentHTML("beforeend", " " + ttBadge(k));
        }
        const ap = on() && typeof v96fVolOf === "function" ? v96fVolOf(r.id, l.cty) : null;
        if (ap && !card.querySelector(".v96fvtag")) {
          const tot = card.querySelector(".tot");
          if (tot) tot.insertAdjacentHTML("afterend", `<span class="v96tag bl v96fvtag" data-noi18n title="${E(M(`元の見積 ${Y(ap.old)}（荷主共有の ${ap.from != null ? CB(ap.from) : "—"} m³）`, `Original ${Y(ap.old)}`))}">${E(M(`B/L の ${CB(ap.cbm)} m³ で ${Y(ap.neu)}（反映済み）`, `B/L ${CB(ap.cbm)} m³: ${Y(ap.neu)} (applied)`))}</span>`);
        }
      });
    } catch (e) { err("drawer", e); }
  }
  if (typeof openFwdQuote === "function") {
    const __oq96r = openFwdQuote;
    openFwdQuote = function (id) {
      const o = __oq96r.apply(this, arguments);
      try { paintDrawer(id); setTimeout(() => paintDrawer(id), 60); } catch (e) { err("oq", e); }
      return o;
    };
  }

  /* ─── 描き直しのたびに付ける ─────────────────────────────── */
  function paint() {
    try {
      if (!on()) return;
      const w = well();
      if (!w) return;
      const pg = page();
      if (pg === "fcase") paintCases(w);
      else if (pg === "frates") paintRates(w);
      else if (pg === "finbox") paintInbox(w);
    } catch (e) { err("paint", e); }
  }
  function rerender() { try { const y = window.scrollY; if (typeof fwdRender === "function") fwdRender(); else paint(); window.scrollTo(0, y); } catch (e) { err("rerender", e); } }
  window.v96fRepaint = paint;
  if (typeof fwdRender === "function") {
    const __fr96r = fwdRender;
    fwdRender = function () {
      const o = __fr96r.apply(this, arguments);
      paint();
      return o;
    };
  }
  /* 刷新版の層があとから書き足したときにも付け直す（付け直しは同じ内容なら DOM を変えない＝自分では回り続けない） */
  let mo = null;
  try {
    let t = 0;
    const w0 = well();
    if (w0) {
      mo = new MutationObserver(() => {
        if (t || !on()) return;
        t = setTimeout(() => { t = 0; paint(); try { mo.takeRecords(); } catch (e) { /* 捨てられなくても次の付け直しは同じ内容 */ } }, 80);
      });
      mo.observe(w0, { childList: true, subtree: true });
    }
  } catch (e) { err("mo", e); }
  /* ─── 押したとき（document への委譲） ──────────────────────── */
  document.addEventListener("click", (ev) => {
    try {
      const t = ev.target && ev.target.closest && ev.target.closest("[data-v96vol],[data-v96tt],[data-v96hs]");
      if (!t) return;
      ev.preventDefault();
      if (t.dataset.v96vol) {
        const rid = t.dataset.rid, cty = t.dataset.cty, a = t.dataset.v96vol;
        if (a === "calc") { const pv = v96fVolPreview(rid, cty); if (pv && pv.err) V.pv[rid + "|" + cty] = pv; }
        else if (a === "cancel") v96fVolCancel(rid, cty);
        else if (a === "apply") { if (v96fVolApply(rid, cty) && typeof toast === "function") toast(M("見積を B/L の容積の金額にしました（元に戻せます）", "Applied the B/L-based amount (you can undo)")); }
        else if (a === "undo") { if (v96fVolUndo(rid, cty) && typeof toast === "function") toast(M("見積を荷主共有の容積の金額に戻しました", "Back to the shipper's volume")); }
        paint();
        setTimeout(() => { try { const li = document.querySelector(`.v96fvol-i[data-rid="${CSS.escape(rid)}"][data-cty="${CSS.escape(cty)}"]`); if (li) { li.scrollIntoView({ block: "nearest" }); const f = li.querySelector(a === "calc" ? "[data-v96vol=apply],[data-v96vol=cancel]" : "[data-v96vol]"); if (f) f.focus(); } } catch (e) { /* 移れなくても表示は済んでいる */ } }, 30);
      } else if (t.dataset.v96tt != null) ttSheet(t.dataset.v96tt);
      else if (t.dataset.v96hs) {
        const id = t.dataset.cs;
        const ok = t.dataset.v96hs === "fix" ? v96fHsFix(id) : v96fHsUndo(id);
        if (ok && typeof toast === "function") toast(t.dataset.v96hs === "fix" ? M("HS コードを 2206.00 に直しました（元に戻せます）", "HS changed to 2206.00") : M("HS コードを元に戻しました", "HS restored"));
        rerender();
      }
    } catch (e) { err("click", e); }
  });
  try { if (typeof v30I18n === "function") v30I18n([["既定値", "default", "默认值", "por defecto"], ["既定値かも", "may be default", "可能是默认值", "quizá por defecto"]]); } catch (e) { err("i18n", e); }
})();
