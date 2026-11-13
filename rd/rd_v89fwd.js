/* 貿易クラウドAI商社マン デザイン刷新：21.89 fwd（2026-11-13）物流会社の画面の直し。改修一覧〔大森パート〕No.376・377・378（11/12 夜 刷新版の再検証）
   No.376 相見積・AI推奨（fagg）の「対象の依頼（レーン）」の箱が、期限 2026-10-31 を「あと45日」と出した（本番の依頼は 9/16 に見積を組んだもの）。
     原因：刷新版の箱（rd.js の aggSummary）は、依頼に残った数（offers[].vd・推奨の理由 recWhy＝荷主の端末が見積を組んだ日に数えたもの）をそのまま出していた。
       今の版の画面（相見積もり一覧・推奨カード・AI の答え）は 21.80（No.313）で「見ている日」を基準に数え直しているが、刷新版の箱はその直しを通っていなかった。
       アプリの「今日」は物流会社では実際の日付（logic_tenant の isDemoClock＝物流会社は見本の時計 2026-08-04 を使わない）。基準日を固定している所は無い。
     直し：箱を描くあいだだけ、依頼を 21.80 と同じ写し（v80fwdReq＝各社の残り日数・札・推奨の理由を今日を基準に。依頼のデータは書き換えない）にして描く。
       切れたものは「あと-13日」ではなく「期限切れ（13日前に終了）」、今日までは「今日まで」。依頼の切り替え（選ぶ欄）でも同じ。
   No.377 English にした直後、物流会社のホームの「全体の状況」が「—items」「—%」「—lanes」になる（日本語に戻すと直る）。
     原因：刷新版のホーム（rd.js の homeFwd → readFinbox）は、見積受信箱の数のカードを日本語の見出し（「受信した依頼」「AI自動回答」「登録レーン」「仮押さえ」）で探していた。
       English では見出しが辞書で「Requests received」などに訳されたあとに読むため見つからず、数が無い＝「—」。AI の翻訳（AI translating…）のせいではない。
     直し：ホームを描いたあと、見積受信箱と同じ数（fwdInboxHtml の数のカード＝訳す前の日本語の HTML から読む）で、数が違う所だけ入れ直す（日本語では何も変わらない）。
   No.378 物流レート管理：アプリの層（logic_v2189fwd.js）で期限切れの行をたたむ。刷新版の「有効期限切れ」の札を押すと、その行を開く。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む（rd_bar.js などと同じ形） */
(function () {
  const RD = window.RDX;
  if (!RD || RD.v89fwd) return;
  RD.v89fwd = { ver: "21.89", err: [], days: 0, nums: 0 };
  const err = (k, e) => { try { RD.v89fwd.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (s) => { const m = String(s == null ? "" : s).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
  const FW = () => { try { return typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const fwd = () => { try { return RD.isFwd ? RD.isFwd() : false; } catch (e) { return false; } };
  const viewReq = (r) => { try { return typeof v80fwdReq === "function" ? v80fwdReq(r) : r; } catch (e) { return r; } }; // eslint-disable-line no-undef

  /* ───── No.376 相見積の箱：描くあいだだけ今日を基準の写し ───── */
  let saved = null;
  function swapIn() { const D = FW(); if (!D || !Array.isArray(D.reqs) || saved) return; saved = { D, reqs: D.reqs }; try { D.reqs = D.reqs.map(viewReq); } catch (e) { saved = null; err("swap", e); } }
  function swapOut() { if (!saved) return; try { saved.D.reqs = saved.reqs; } catch (e) { err("unswap", e); } saved = null; }
  function fixDays() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    // 表の「あと◯日」
    box.querySelectorAll("table.rd-tbl td div").forEach((d) => {
      const m = /^あと(-?\d+)日$/.exec((d.textContent || "").trim()); if (!m) return; const n = +m[1];
      if (n < 0) { d.textContent = `期限切れ（${-n}日前に終了）`; d.style.color = "var(--rd-crit)"; d.style.fontWeight = "700"; RD.v89fwd.days++; }
      else if (n === 0) { d.textContent = "今日まで"; d.style.color = "var(--rd-crit)"; RD.v89fwd.days++; }
    });
    // 選ばれる工夫の文
    box.querySelectorAll("p").forEach((p) => {
      const t = p.textContent || "";
      if (!/あと-?\d+日|あと—日/.test(t)) return;
      let s = t.replace(/有効期限（あと(-\d+)日）が切れると対象外になるので、早めに更新を。/, (m0, n) => `有効期限は${-n}日前に切れています（見積の対象外）。レート管理で新しいレートに更新を。`)
        .replace(/有効期限（あと0日）が切れると対象外になるので、早めに更新を。/, "有効期限は今日までです。レート管理で早めに更新を。")
        .replace(/（あと(-\d+)日）/g, (m0, n) => `（${-n}日前に期限切れ）`).replace(/（あと0日）/g, "（今日まで）");
      if (s !== t) { p.textContent = s; RD.v89fwd.days++; }
    });
  }

  /* ───── No.377 物流会社のホームの数：見積受信箱と同じ数（訳す前の HTML から） ───── */
  function inboxNums() {
    try {
      if (typeof fwdInboxHtml !== "function") return null; // eslint-disable-line no-undef
      const tp = document.createElement("template"); tp.innerHTML = fwdInboxHtml(); // eslint-disable-line no-undef
      const N = {};
      tp.content.querySelectorAll(".g4 > .c").forEach((c) => { const l = ((c.querySelector(".lbl") || {}).textContent || "").trim(); const kv = c.querySelector(".kv"); if (l && kv) N[l] = { n: num(kv.textContent), u: ((kv.querySelector("small") || {}).textContent || "").trim() }; });
      return N;
    } catch (e) { err("nums", e); return null; }
  }
  function tileNum(t) { const tn = t && t.querySelector(".rd-tn"); if (!tn) return undefined; const x = [...tn.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim()); return x ? num(x.nodeValue) : null; }
  function setTile(t, n, u, s) {
    if (!t || n == null) return false;
    const tn = t.querySelector(".rd-tn"); if (!tn) return false;
    if (tileNum(t) === n) return false;
    tn.innerHTML = `${esc(n)}<small>${esc(u || "")}</small>`;
    if (s) { let ts = t.querySelector(".rd-ts"); if (!ts) { tn.insertAdjacentHTML("afterend", '<span class="rd-ts" style="display:block"></span>'); ts = t.querySelector(".rd-ts"); } ts.textContent = s; }
    return true;
  }
  function fixHome() {
    const w = document.getElementById("well"); if (!w || !w.querySelector(".rd-fhome-top")) return;
    const N = inboxNums(); if (!N) return;
    const recv = N["受信した依頼"], auto = N["AI自動回答"], lane = N["登録レーン"], held = N["仮押さえ"];
    const T = (i) => w.querySelector(`[data-rdtile="${i}"]`);
    let ch = 0;
    if (recv && setTile(T(0), recv.n, "件")) ch++;
    if (recv && recv.n) { const rate = Math.round(((auto ? auto.n : 0) / recv.n) * 100); if (setTile(T(1), rate, "%", auto ? `${auto.n} / ${recv.n}件` : "")) ch++; }
    if (lane && setTile(T(3), lane.n, lane.u || "本")) ch++;
    if (held) { const t2 = T(2); if (t2 && !t2.querySelector(".rd-ts")) { const tn = t2.querySelector(".rd-tn"); if (tn) { tn.insertAdjacentHTML("afterend", `<span class="rd-ts" style="display:block">${esc(`国ごとに数えると ${held.n}件`)}</span>`); ch++; } } }
    // 6ステップの「1. レート登録」「2. 見積対応」の数
    const six = (i) => w.querySelector(`[data-rdsix="${i}"]`);
    const put = (b, s) => { if (!b || !s) return; if (b.querySelector(".rd-sxn")) return; b.insertAdjacentHTML("beforeend", `<span class="rd-sxn">${esc(s)}</span>`); ch++; };
    if (lane) put(six(0), `${lane.n}${lane.u}`);
    if (auto) put(six(1), `AI回答 ${auto.n}件`);
    if (ch) RD.v89fwd.nums += ch;
  }

  /* ───── No.378 レート管理：「有効期限切れ」の札から、たたんだ行を開く ───── */
  function ratesTile() {
    const w = document.getElementById("well"); if (!w) return;
    const t = [...w.querySelectorAll("[data-rdrates] .rd-tile")].find((x) => /有効期限切れ|Expired|已过期|vencid/i.test(((x.querySelector("b") || {}).textContent) || ""));
    if (!t || t.dataset.v89f || typeof window.v89fShowExpired !== "function") return;
    if (!(tileNum(t) > 0)) return;
    t.dataset.v89f = "1"; t.style.cursor = "pointer"; t.setAttribute("role", "button"); t.setAttribute("tabindex", "0"); t.title = "押すと、たたんである期限切れの行を開きます";
    const go = () => { try { window.v89fShowExpired(true); } catch (e) { err("tile", e); } };
    t.addEventListener("click", go); t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  }

  const old = RD.after;
  RD.after = function () {
    const k = key(), on = fwd() && k === "fagg";
    if (on) swapIn();
    let r;
    try { r = old.apply(this, arguments); } finally { if (on) swapOut(); }
    try { if (fwd()) { if (k === "fagg") fixDays(); else if (k === "fhome") fixHome(); else if (k === "frates") ratesTile(); } } catch (e) { err("after", e); }
    return r;
  };
  // 相見積の箱の「対象の依頼」の切り替え（rd.js が選ぶ欄で箱を描き直す）も同じ写しで
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel" && fwd()) swapIn(); }, true);
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel") { swapOut(); try { fixDays(); } catch (x) { err("sel", x); } } }, false);
  // 描いたあとに切り替わった言語でも（English の辞書が見出しを訳したあと）
  setTimeout(() => { try { if (fwd() && key() === "fhome") fixHome(); } catch (e) { /* まだ */ } }, 0);
})();
