/* 貿易クラウドAI商社マン デザイン刷新：21.90 fwd（2026-11-13）物流会社の画面の直し。改修一覧〔大森パート〕No.390・395・429・431（11/13 再検証 第4回・ペルソナ評価）
   No.390 相見積・AI推奨（fagg）の箱：rd.js の aggSummary は相見積を AI の点の高い順に並べ直すため、期限切れの見積（RQ-OG1RXF：期限 10/31・91点）が 👑1位・推奨のまま。
     直し：箱を描く間だけ、アプリの層（logic_v2190fwd.js の v90fRank）が期限切れの見積の点を「並びは最後・表示は同じ数」にする（V90F.rdSort）。
       描いた後、期限切れの行の順位を「期限切れ・取り直し（順位の外）」に、貴社の見積が期限切れなら「現在の選定状況」を「順位の外」に、
       全社が期限切れなら「推奨なし」と知らせを出す。対象の依頼を選ぶ欄の「貴社 ◯位」も同じ。点（AIの点）は残す
   No.395 見積受信箱の注意のセル：刷新版で描き直した後も、同じ警告は1回（アプリの層の v90fDedupe）
   No.429 担当の保存の後：刷新版の受信箱の上の数（全体の状況・タブ）を描き直す（アプリの層が描き直した後に呼ぶ RDX.v90fRefresh）
   No.431 左のメニューに「全体の状況」（ホームの「全体の状況」へ移る）・ホームの全体の状況に「期限切れのレート」のタイル（押すと物流レート管理で期限切れの行を開く）
   No.447 ギャップ分析（1位との差）の「価格差 +¥1,400／日数差 −2日／有効期限 −31日」を「1位より ¥1,400 高い（3.7%・不利）」「1位より 2日 早い（有利）」「1位より 31日 短い（不利）」に（元の数は title に）
   fwd-auto・fwd-valid（ペルソナ評価）ホームの「AI自動回答率」に内訳（有効なレート・仕出港どおり／期限切れ・港違いを含む）・レート管理の「登録レーン」に「有効なレートは M本中 N本」
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む */
(function () {
  const RD = window.RDX;
  if (!RD || RD.v90fwd) return;
  RD.v90fwd = { ver: "21.90", err: [], agg: 0, nav: 0, tile: 0 };
  const err = (k, e) => { try { RD.v90fwd.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const FW = () => { try { return typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const fwd = () => { try { return RD.isFwd ? RD.isFwd() : false; } catch (e) { return false; } };
  const dwOpen = () => { const d = document.getElementById("dw"); return !!(d && d.dataset.open === "true"); };
  const view = (l) => { try { return typeof v80fwdLeg === "function" ? v80fwdLeg(l) : l; } catch (e) { return l; } }; // eslint-disable-line no-undef
  const me = () => { try { return typeof fwdCo === "function" ? fwdCo() : ((FW() && FW().profile && FW().profile.co) || ""); } catch (e) { return ""; } }; // eslint-disable-line no-undef
  if (typeof V90F !== "undefined") V90F.rdSort = () => fwd() && key() === "fagg" && !dwOpen(); // eslint-disable-line no-undef

  /* ───── No.390 相見積の箱 ───── */
  function laneOf(optText) {
    const m = /^(RQ-[A-Za-z0-9]+)・(.+?)・貴社/.exec(String(optText || "").trim()); if (!m) return null;
    const D = FW(); const r = D && (D.reqs || []).find((x) => x && x.id === m[1]); if (!r) return null;
    const l = (r.legs || []).find((x) => x && (x.cty === m[2] || x.pod === m[2])); if (!l) return null;
    const v = view(l); return { r, l, v };
  }
  function fixAgg() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    const sel = box.querySelector("#rdaggsel"); if (!sel) return;
    const my = me();
    // 選ぶ欄の「貴社 ◯位」
    [...sel.options].forEach((op) => { if (op.dataset.v90f) return; const x = laneOf(op.textContent); if (!x || !x.v || !x.v.v90exp) return; op.dataset.v90f = "1";
      const O = x.v.offers || []; const mi = O.findIndex((o) => o && o.co === my); const mo = O[mi];
      op.textContent = op.textContent.replace(/貴社 \d+位\/(\d+)社/, (s, n) => mo && mo.v90x ? `貴社 期限切れ（順位の外）/${n}社` : `貴社 ${mi + 1}位/${n}社（期限切れ ${x.v.v90exp}社は順位の外）`); });
    const cur = sel.options[sel.selectedIndex]; const x = cur && laneOf(cur.dataset.v90f ? (cur.textContent.replace(/貴社 .*$/, "貴社")) : cur.textContent);
    if (!x || !x.v || !x.v.v90exp || box.dataset.v90f === cur.value) return;
    box.dataset.v90f = cur.value;
    const O = x.v.offers || [], byCo = (co) => O.find((o) => o && o.co === co);
    // 表：期限切れの行の順位
    box.querySelectorAll("table.rd-tbl tbody tr").forEach((tr) => { const b = tr.querySelector("td:nth-child(2) b"); const o = b && byCo((b.textContent || "").trim()); if (!o || !o.v90x) return;
      const td = tr.children[0]; if (td) td.innerHTML = `<span class="rd-tag rd v90fout" style="white-space:nowrap">期限切れ・取り直し</span><div style="font-size:11px;color:var(--rd-ink3)">順位の外</div>`;
      tr.style.opacity = ".78"; });
    // 現在の選定状況（貴社）
    const mine = byCo(my);
    const big = [...box.querySelectorAll("#rdaggtop div")].find((d) => /^第\s*\d+\s*位/.test((d.textContent || "").trim()) && d.querySelector("span"));
    if (mine && mine.v90x && big) { big.innerHTML = `<span style="font-size:26px;font-weight:900;color:var(--rd-crit)">順位の外</span><div style="font-size:13px;font-weight:700;color:var(--rd-ink2)">貴社の見積は有効期限切れ（取り直しが必要）</div>`; }
    const note = big && big.parentElement && big.parentElement.nextElementSibling;
    if (note && mine && mine.v90x) note.innerHTML = `貴社の見積は有効期限が切れているため、推奨・順位の対象外です。<br>レート管理で新しい期限のレートを登録すると、次の見積から順位に入ります。<br>AIの点（参考）：貴社 ${esc(String(mine.score))}`;
    // 推奨のタグ
    const tag = [...box.querySelectorAll(".rd-tag.or")].find((t) => /^推奨：/.test((t.textContent || "").trim()));
    if (tag && x.v.v90noRec) tag.textContent = "推奨なし（全社の見積が期限切れ）";
    // 知らせ
    if (!box.querySelector(".v90fagnote")) {
      const top = box.querySelector("#rdaggtop");
      const msg = x.v.v90noRec ? `この依頼（${x.r.id}・${x.l.cty}）の相見積は、${O.length}社とも見積の有効期限が切れています。期限切れの見積は AI の推奨・順位の対象外です（AIの点は参考に残しています）。新しい期限のレートで取り直してください。`
        : `期限切れの見積 ${x.v.v90exp}社は、AI の推奨・順位の外にしました（表の下に「期限切れ・取り直し」で残しています）。推奨は有効な見積の中で AI の点が最も高い会社です。`;
      if (top) top.insertAdjacentHTML("beforebegin", `<div class="rd-card v90fagnote" role="note" style="margin-bottom:12px;padding:12px 18px;border-left:5px solid var(--rd-crit);font-weight:700;font-size:14px;line-height:1.6">${esc(msg)}</div>`);
    }
    RD.v90fwd.agg++;
  }


  /* ───── No.447 ギャップ分析の符号を言葉に ───── */
  function fixGap() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    box.querySelectorAll("dl.rd-kv dt").forEach((dt) => {
      const dd = dt.nextElementSibling; if (!dd || dd.dataset.v90f) return; const k = (dt.textContent || "").trim(); const t = (dd.textContent || "").trim();
      let sg = t[0] === "+" ? 1 : (t[0] === "−" || t[0] === "-") ? -1 : 0; let body = t.replace(/^[+−\-±]\s*/, ""); if (/^¥-/.test(body)) { sg = -1; body = "¥" + body.slice(2); } else if (k === "価格差" && sg === 0 && /^¥[1-9]/.test(body)) sg = 1;
      let s = "";
      if (k === "価格差") { const m = /^(¥[\d,]+)（([^）]*)）/.exec(body); const amt = m ? m[1] : body, pc = m ? m[2].replace(/^[+−\-]/, "") : "";
        s = sg > 0 ? `1位より ${amt} 高い（${pc}・不利）` : sg < 0 ? `1位より ${amt} 安い（${pc}・有利）` : "1位と同じ価格"; }
      else if (k === "日数差") s = sg > 0 ? `1位より ${body} 遅い（不利）` : sg < 0 ? `1位より ${body} 早い（有利）` : "1位と同じ日数";
      else if (k === "有効期限") s = sg > 0 ? `1位より ${body} 長い（有利）` : sg < 0 ? `1位より ${body} 短い（不利）` : "1位と同じ";
      else return;
      dd.dataset.v90f = "1"; dd.title = t; dd.textContent = s; dd.style.color = /不利/.test(s) ? "var(--rd-crit)" : /有利/.test(s) ? "var(--rd-good)" : "";
    });
    RD.v90fwd.gap = (RD.v90fwd.gap || 0) + 1;
  }


  /* ───── fwd-auto・fwd-valid：ホームの「AI自動回答率」とレート管理の「登録レーン」に内訳 ───── */
  function autoSub() {
    const t = document.querySelector('#well [data-rdtile="1"]'); if (!t || t.querySelector(".v90fautos") || typeof window.v90fAutoSplit !== "function") return;
    const A = window.v90fAutoSplit(); if (!A.auto) return; const sp = t.querySelector(".rd-tn"); if (!sp) return;
    sp.parentElement.insertAdjacentHTML("beforeend", `<span class="rd-ts v90fautos" style="display:block;color:${A.warn ? "var(--rd-crit)" : "inherit"}">有効なレート・仕出港どおり ${A.clean}件／期限切れ・港違いを含む ${A.warn}件</span>`);
  }
  function validSub() {
    const t = [...document.querySelectorAll("#well [data-rdrates] .rd-tile")].find((x) => /^登録レーン/.test(((x.querySelector("b") || {}).textContent || "").trim())); if (!t || t.querySelector(".v90fvalids") || typeof window.v90fValidCount !== "function") return;
    const V = window.v90fValidCount(); const ts = t.querySelector(".rd-ts");
    const h = `<span class="rd-ts v90fvalids" style="display:block;font-weight:800">有効なレートは ${V.all}本中 ${V.valid}本</span>`;
    if (ts) ts.insertAdjacentHTML("beforebegin", h); else { const tn = t.querySelector(".rd-tn"); if (tn) tn.insertAdjacentHTML("afterend", h); }
  }

  /* ───── No.431 左のメニューの「全体の状況」・ホームのタイル ───── */
  try { if (Array.isArray(RD.MAIN_F) && !RD.MAIN_F.some((it) => it[0] === "@ov")) { const i = RD.MAIN_F.findIndex((it) => it[0] === "fhome"); RD.MAIN_F.splice(i + 1, 0, ["@ov", "全体の状況", "chart"]); } } catch (e) { err("main", e); }
  function goOverview() {
    try { RD.goKey("fhome"); } catch (e) { err("ov", e); }
    let n = 0; const t = setInterval(() => { n++; const h = [...document.querySelectorAll("#well .rd-card h2")].find((x) => /^全体の状況/.test((x.textContent || "").trim())); if (h || n > 20) { clearInterval(t); if (h) { const c = h.closest(".rd-card"); c.scrollIntoView({ block: "start", behavior: "smooth" }); c.style.boxShadow = "0 0 0 3px var(--rd-or)"; setTimeout(() => { c.style.boxShadow = ""; }, 2400); } } }, 100);
  }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest('#rdside [data-rdk="@ov"]'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (document.body.classList.contains("navopen")) document.body.classList.remove("navopen"); goOverview(); RD.v90fwd.nav++; }, true);
  function navMark() { const b = document.querySelector('#rdside [data-rdk="@ov"]'); if (b) { b.setAttribute("aria-current", "false"); b.title = "物流会社の全体の状況（ダッシュボード）：受信・AI回答・要確認・仮押さえ・期限切れのレートの数"; } }
  function homeTile() {
    const w = document.getElementById("well"); if (!w) return; const box = w.querySelector(".rd-tiles"); if (!box || box.querySelector("[data-v90ftile]")) return;
    const h = [...w.querySelectorAll(".rd-card h2")].find((x) => /^全体の状況/.test((x.textContent || "").trim())); if (!h || !h.closest(".rd-card").contains(box)) return;
    const n = typeof window.v90fExpRates === "function" ? window.v90fExpRates() : 0;
    box.insertAdjacentHTML("beforeend", `<button type="button" class="rd-tile ${n ? "rd" : "gr"}" data-v90ftile="1" data-v90fov="1"><span class="rd-ti">${RD.I ? RD.I("alert", 26) : ""}</span><span><b>期限切れのレート</b><span class="rd-tn">${n}<small>本</small></span><span class="rd-ts" style="display:block">見積・推奨に使われません（押すと一覧）</span></span></button>`);
    RD.v90fwd.tile++;
  }

  /* ───── No.429 担当の保存の後 ───── */
  RD.v90fRefresh = function () { try { if (fwd() && key() === "finbox" && typeof RD.after === "function") RD.after(true); } catch (e) { err("refresh", e); } };

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      if (fwd()) {
        const k = key(); const w = document.getElementById("well");
        if (k === "fagg") { fixAgg(); fixGap(); }
        else if (k === "finbox" && w && typeof window.v90fDedupe === "function") window.v90fDedupe(w);
        else if (k === "fhome") { homeTile(); autoSub(); }
        else if (k === "frates") validSub();
        navMark();
      }
    } catch (e) { err("after", e); }
    return r;
  };
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel" && fwd()) { setTimeout(() => { try { fixAgg(); fixGap(); } catch (x) { err("sel", x); } }, 0); } }, false);
  // ホームは見張り（onWell）が後から描くので、少し後にもう一度
  const mo = new MutationObserver(() => { try { if (fwd() && key() === "fhome") { homeTile(); autoSub(); } navMark(); } catch (e) { /* まだ */ } });
  try { const w = document.getElementById("well"); if (w) mo.observe(w, { childList: true }); } catch (e) { err("mo", e); }
})();
