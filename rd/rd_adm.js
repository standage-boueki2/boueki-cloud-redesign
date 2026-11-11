/* 貿易クラウドAI商社マン デザイン刷新 第2弾：管理コンソール（手元だけ・2026-11-11）
   今の管理コンソールの部品（数字・発行・商社デスク・アカウント一覧・AI・連携）はそのまま動かし、見出し・概要・並べ方を足す。
   数字は管理コンソールが出している本物だけ（日別の記録が無いときは「まだ記録がありません」のまま） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._adm) return;
  RD._adm = 1;
  const { I, esc, $, $$ } = RD;
  const act = (fn) => RD.act(fn);
  const navClick = (re) => { const b = $$("#nav .nb").find((x) => re.test(x.textContent || "")); if (b) { b.click(); return true; } return false; };
  const KPI_IC = [[/発行済み/, "users", ""], [/ログイン/, "out", ""], [/解析/, "upload", "gr"], [/AIへの質問/, "chat", "or"], [/7日以内/, "user", "pu"], [/同期/, "refresh", "gr"]];
  function decoKpi(w) {
    $$("#admkpi > .kpi", w).forEach((b) => {
      if (b.querySelector(".k-ti")) return;
      const l = (($(".lbl", b) || {}).textContent || "");
      const m = KPI_IC.find((x) => x[0].test(l)) || [0, "chart", ""];
      const s = document.createElement("span");
      s.className = "k-ti"; s.innerHTML = I(m[1], 24);
      b.prepend(s);
      if (m[2]) b.classList.add("k-" + m[2]);
    });
  }
  function decoIssue(w) {
    const nc = $("#nc", w);
    if (!nc || $(".k-isst", w)) return;
    const lab = (n, t, sub) => { const d = document.createElement("div"); d.className = "k-isst rd-x"; d.innerHTML = `<span class="k-sn">${n}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ""}`; return d; };
    nc.before(lab(1, "企業・担当者の入力", "会社名・ご担当者名"));
    const role = $("#nrole", w);
    const rw = role && role.closest(".rw");
    if (rw) rw.before(lab(2, "アカウント種別・プラン・期間", "荷主／物流会社／STANDAGE 社員・個社版／全社版・日数"));
    const go = $$("#issue button", w).find((b) => /発行/.test(b.textContent || ""));
    if (go) { const host = go.closest(".rw") || go; host.before(lab(3, "発行", "内容を確かめて、トライアルアカウントを発行します")); }
  }
  function donut(parts) {
    const tot = parts.reduce((a, b) => a + b.n, 0);
    if (!tot) return `<div class="k-empty">まだ利用の記録がありません</div>`;
    let a0 = -Math.PI / 2, g = "";
    const R = 70, r = 46, cx = 90, cy = 90;
    parts.forEach((p) => { const a1 = a0 + (p.n / tot) * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0; const P = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`; if (p.n > 0) g += `<path d="M${P(a0, R)} A${R} ${R} 0 ${big} 1 ${P(a1 - 0.0001, R)} L${P(a1 - 0.0001, r)} A${r} ${r} 0 ${big} 0 ${P(a0, r)}z" fill="${p.c}"/>`; a0 = a1; });
    return `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><svg viewBox="0 0 180 180" width="170" height="170" role="img" aria-label="利用内訳">${g}<text x="90" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#44546B">合計</text><text x="90" y="108" text-anchor="middle" font-size="24" font-weight="900" fill="#13233B">${tot.toLocaleString("ja-JP")}</text></svg>
      <table class="rd-tbl" style="flex:1;min-width:220px"><tbody>${parts.map((p) => `<tr><td><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${p.c};margin-right:8px;vertical-align:-1px"></i><b>${esc(p.l)}</b></td><td style="text-align:right">${Math.round((p.n / tot) * 100)}%</td><td style="text-align:right"><b>${p.n.toLocaleString("ja-JP")}</b> ${esc(p.u)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  const kpiNum = (w, re) => { const b = $$("#admkpi > .kpi", w).find((x) => re.test((($(".lbl", x) || {}).textContent || ""))); const v = b && $(".kv", b); const m = v && (v.textContent || "").replace(/,/g, "").match(/\d+/); return m ? +m[0] : 0; };
  RD.page.adm = (w) => {
    const hero = $("[data-rdhero]", w);
    if (hero) { const h1 = $("h1", hero), p = $("p", hero); if (h1) h1.textContent = "トライアル管理"; if (p) p.textContent = "トライアル環境の利用状況をひと目で確認し、アカウント・AI・連携をまとめて管理できます。"; const ver = $("#v70admver b", w); if (ver && !$(".rd-crumb", hero)) { const c = document.createElement("span"); c.className = "rd-crumb"; c.textContent = "管理者コンソール"; $(".rd-ht", hero).prepend(c); } }
    decoKpi(w);
    decoIssue(w);
    const rows = $$("#accounts tbody tr[data-st]", w);
    const cnt = (f) => rows.filter(f).length;
    const td = $("#v84admToday", w);
    const tdItems = td ? $$(".v84td-c", td).map((b) => ({ b, l: (($("span", b) || {}).textContent || "").trim(), n: (($("b", b) || {}).textContent || "").trim() })) : [];
    const notes = [];
    tdItems.forEach((x) => { if (/^\d+$/.test(x.n) && +x.n > 0) notes.push({ lv: "rd", t: x.l.replace(/（件）/, ""), d: `${x.n}件あります。押すと、その一覧へ移ります。`, go: () => x.b.click() }); });
    const bm = $("#bmAdm", w);
    if (bm && /確かめられませんでした/.test(bm.textContent || "")) notes.push({ lv: "am", t: "バイヤーへのメール中継の状態を確かめられませんでした", d: "通信の問題です。少しして画面を開き直してください。", go: () => RD.flash(bm) });
    const mem = $("#admmem", w);
    const mm = mem && (mem.textContent || "").match(/メール未登録：メンバー\s*(\d+)\s*名・代表\s*(\d+)\s*名/);
    if (mm && (+mm[1] + +mm[2]) > 0) notes.push({ lv: "or", t: "メール未登録の方がいます", d: `メンバー ${mm[1]}名・代表 ${mm[2]}名。メールの無い方は、確認コードなしでログインできる状態です。`, go: () => RD.flash(mem) });
    const syncOk = $("#v214adm .ok", w);
    const ai = kpiNum(w, /AIへの質問/), web = (() => { const b = $$("#admkpi > .kpi", w).find((x) => /AIへの質問/.test(x.textContent || "")); const m = b && (b.textContent || "").match(/Web検索\s*(\d+)/); return m ? +m[1] : 0; })();
    const parts = [{ l: "AIへの質問", n: Math.max(0, ai - web), u: "回", c: "#F57C0F" }, { l: "Web検索", n: web, u: "回", c: "#1F6FD1" }, { l: "商品データの解析", n: kpiNum(w, /解析/), u: "件", c: "#14995A" }, { l: "ログイン", n: kpiNum(w, /ログイン/), u: "回", c: "#6B7B93" }];
    const box = RD.put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,.9fr)">
        ${RD.card({ ic: "alert", t: "重要なお知らせ・対応が必要な項目", b: notes.length ? `<div class="k-rows">${notes.map((n) => `<button type="button" class="k-row" ${act(n.go)}><span class="k-tag ${n.lv === "rd" ? "rdf" : n.lv === "am" ? "am" : "or"}">${n.lv === "rd" ? "要対応" : "確認"}</span><span class="k-rt"><b>${esc(n.t)}</b><small>${esc(n.d)}</small></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div>` : `<div class="k-empty">${I("check", 18, 3)} いま対応が必要な項目はありません</div>` }) + (syncOk ? `` : "")}
        ${RD.card({ ic: "users", t: "アカウントの状況", s: `（${rows.length}件）`, b: `<ul class="k-ck">${[["有効", cnt((r) => r.dataset.st === "active"), "gr"], ["期限切れ", cnt((r) => r.dataset.st === "expired"), "or"], ["無効", cnt((r) => r.dataset.st === "disabled"), "gy"], ["うち物流会社", cnt((r) => r.dataset.role === "fwd"), "bl"]].map((x) => `<li style="justify-content:space-between"><span><span class="k-tag ${x[2]}" style="min-width:10px">●</span> ${x[0]}</span><b style="font-size:18px">${x[1]} <small style="font-size:13px">件</small></b></li>`).join("")}</ul><button type="button" class="k-link" style="margin-top:10px" ${act(() => navClick(/アカウント一覧/) || RD.flash($("#accounts", w)))}>アカウント一覧へ ${I("arr", 15)}</button>` })}
        ${RD.card({ ic: "zap", t: "クイック操作", b: `<div class="k-rows">${[["plus", "アカウントを発行", /新しいアカウントを発行/, "#issue"], ["bldg", "商社デスクの依頼", /商社デスク/, "#v75adm"], ["users", "メンバー管理", /メンバー管理/, "#admmem"], ["refresh", "同期・端末を確かめる", /クラウド同期/, "#syncslot"], ["doc", "操作の記録（CSV）", /操作の記録/, "#v33admlog"]].map((x, i) => `<button type="button" class="k-row" style="${i === 0 ? "border-color:var(--k-or-line);background:#FFF8F0" : ""}" ${act(() => navClick(x[2]) || RD.flash($(x[3], w)))}>${I(x[0], 20)}<span class="k-rt"><b>${esc(x[1])}</b></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div>` })}
      </div>
      ${RD.card({ ic: "chart", t: "利用内訳", s: "（累計・全アカウント。日ごとの推移は「利用とコスト」）", st: "margin-bottom:18px", b: donut(parts) })}`);
    box.dataset.v84tab = "daily";
  };
})();
