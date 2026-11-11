/* 貿易クラウドAI商社マン デザイン刷新 第3弾（最終・手元だけ・2026-11-11）
   デザイナーの最後の案（8画面）に合わせた部品：
   ・全画面：見出しの上のパンくず（貿易クラウド AI商社マン ／ 荷主向け・物流会社向け・管理者コンソール）・左上の利用モードの札・管理者のメニューに「ヘルプ」
   ・荷主：外国語営業資料の「完成した営業資料」（保存した資料があるとき）と4つの手順
   ・物流会社：AI見積の窓（依頼番号・ルート・概算・確認状況・内訳・確認ポイント）／AI物流マンに相談／依頼ページ／メンバー
   ・ヘルプの窓：荷主・物流会社・管理者で中身を分ける／管理者AIの窓
   数字はアプリが持っている本物だけ。今の部品はそのまま動かす */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._p3 || !RD.card) return;
  RD._p3 = 1;
  const { I, esc, $, $$, G, flag, IMG, card, tiles, steps, put, flash } = RD;
  const act = (fn) => RD.act(fn);
  const goKey = (k) => RD.goKey(k);
  const role = () => { const S = G("SES") || {}; return S.t === "admin" ? "adm" : S.role === "fwd" ? "fwd" : "ship"; };
  const ROLE_NM = { ship: "荷主向け", fwd: "物流会社向け", adm: "管理者コンソール" };
  const yen = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");

  /* ───── 見出しのパンくず・利用モードの札・管理者のヘルプ ───── */
  function crumb() {
    $$(".rd-hero .rd-ht").forEach((h) => {
      if ($(".k-bc", h)) return;
      const c = document.createElement("div");
      c.className = "k-bc";
      c.textContent = `貿易クラウド AI商社マン ／ ${ROLE_NM[role()]}`;
      h.prepend(c);
    });
    $$(".rd-hero .rd-crumb").forEach((x) => x.remove());
  }
  function modeChip() {
    const side = $(".side");
    if (!side) return;
    if ($("#rdside .k-modechip", side)) { $$(".k-modechip", side).forEach((x) => { if (!x.closest("#rdside")) x.remove(); }); return; } // 荷主・物流会社は左のメニューの中に出している
    let m = $(".k-modechip", side);
    if (!m) { m = document.createElement("div"); m.className = "k-modechip"; }
    const anchor = $("#rdside .rd-logo", side) || $(":scope > .logo", side);
    if (anchor && anchor.nextElementSibling !== m) anchor.after(m); else if (!anchor && !m.parentElement) side.prepend(m);
    const r = role();
    m.innerHTML = `${I(r === "adm" ? "gear" : "bldg", 18)}<span>${ROLE_NM[r]}</span>`;
    $$("#rdside .rd-mode").forEach((x) => { x.style.display = "none"; });
    if (r === "adm") {
      const nav = document.getElementById("nav");
      if (nav && !$(".k-admhelp", nav)) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "nb k-admhelp"; b.dataset.rdorig = "1";
        b.innerHTML = `${I("help", 16)}<span>ヘルプ</span>`;
        b.addEventListener("click", () => RD.openHelp());
        nav.appendChild(b);
      }
    }
  }

  /* ───── 荷主：外国語営業資料（完成した営業資料・4つの手順） ───── */
  const deck0 = RD.page.deck;
  RD.page.deck = (w, k) => {
    if (deck0) deck0(w, k);
    const d14 = $("#dk14", w);
    const tabsO = d14 ? $$("[data-dk14tab]", d14) : [];
    const saved = tabsO.map((b) => ({ b, lang: b.dataset.dk14tab, nm: (b.textContent || "").replace(/\d+\s*\/\s*\d+/, "").trim(), n: +(((b.textContent || "").match(/(\d+)\s*\/\s*\d+/) || [])[1] || 0) })).filter((x) => x.n > 0);
    const t = G("TEN") || {};
    const okBox = $(".rd-p2 .k-ring", w);
    const pct = okBox ? +((okBox.getAttribute("style") || "").match(/--p:(\d+)/) || [0, 0])[1] : 0;
    const allReq = !!$(".rd-p2 h2", w) && /準備が整っています/.test($(".rd-p2", w).textContent || "");
    // 手順の帯を4つに
    const sb = $(".rd-p2 .k-steps", w);
    if (sb) {
      const st = [
        { t: "情報を確認", s: `完成度 ${pct}%`, ic: "list", st: allReq ? "done" : "on", go: () => flash($(".rd-p2 .k-items", w)) },
        { t: "AIが資料を生成", s: "言語と相手の国を選ぶ", ic: "spark", st: saved.length ? "done" : allReq ? "on" : "", go: () => flash(RD.secBy(w, /営業資料を作る/) || $("#sec-3", w)) },
        { t: "完成版をチェック", s: saved.length ? `保存 ${saved.reduce((a, b) => a + b.n, 0)}件` : "作ったあと", ic: "eye", st: saved.length ? "on" : "", go: () => flash($("#k-deckdone", w) || d14) },
        { t: "バイヤーに提案", s: "AIバイヤー開拓へ", ic: "send", go: () => goKey("db") },
      ];
      sb.outerHTML = steps(st);
    }
    // 完成した営業資料（保存した資料があるとき）／作る前の表紙の見本
    const ph = (t.assets && t.assets.ph && t.assets.ph[0]) || null;
    const logo = t.assets && t.assets.logo;
    const str = (Array.isArray(t.strengths) ? t.strengths : []).slice(0, 3).map((x) => (Array.isArray(x) ? x[0] : x)).filter(Boolean);
    const cover = `<div class="k-cover"><div class="k-cvh"><b>${esc(t.coEn || t.co || "")}</b><span>JAPAN</span></div>
      <div class="k-cvb"><div style="min-width:0"><small>${esc(String(t.catKey || "").replace(/_/g, " ").toUpperCase() || "MADE IN JAPAN")}</small><h3>${esc(t.itemEn || t.item || "")}</h3>${str.length ? `<ul>${str.map((s) => `<li>✓ ${esc(s)}</li>`).join("")}</ul>` : ""}</div>${ph ? `<img src="${RD.img64(ph)}" alt="">` : logo ? `<img src="${RD.img64(logo)}" alt="" style="object-fit:contain;background:#fff">` : ""}</div>
      <div class="k-cvf"><span>${esc([t.ctn, t.moq ? "MOQ " + t.moq : ""].filter(Boolean).join(" · "))}</span><span>Made in Japan</span></div></div>`;
    const checks = [
      ["英語の商品名と紹介文", !!t.itemEn],
      ["商品の強み（3件以上）", str.length >= 3],
      ["商品の写真", !!ph],
      ["問い合わせ先", !!(t.deckMeta && (t.deckMeta.mail || t.deckMeta.person))],
    ];
    const html = card({ id: "k-deckdone", ic: "slides", t: saved.length ? "完成した営業資料" : "営業資料の表紙（見本）", s: saved.length ? "保存した資料から" : "まだ作っていません。登録データから表紙の見本を出しています", r: `<span class="k-tag ${saved.length ? "or" : "gy"}">${saved.length ? "AI生成・要確認" : "見本"}</span>`, st: "margin-bottom:18px", b: `<div class="k-grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);margin:0">
      <div style="min-width:0">${saved.length ? `<div class="k-chips" style="margin-bottom:12px">${saved.map((x, i) => `<button type="button" class="k-btn ${i ? "white" : ""} k-mini" ${act(() => { x.b.click(); setTimeout(() => flash(d14), 60); })}>${I("globe", 15)}${esc(x.nm)}（${x.n}）</button>`).join("")}</div>` : ""}${cover}
        <div class="k-chips" style="margin-top:12px">${saved.length ? `<button type="button" class="k-btn white k-mini" ${act(() => { saved[0].b.click(); setTimeout(() => { const o = $$(".dk14-l button", d14).find((b) => /開く/.test(b.textContent || "")); if (o) o.click(); else flash(d14); }, 120); })}>${I("eye", 15)}開く（見本・PowerPoint・PDF）</button>` : ""}<button type="button" class="k-btn white k-mini" ${act(() => flash($("#sec-1", w)))}>${I("box", 15)}画像を変更</button><button type="button" class="k-btn white k-mini" ${act(() => { const b = document.getElementById("dk3wiz"); if (b) b.click(); })}>${I("edit", 15)}文章を整える</button></div></div>
      <div style="min-width:0">${saved.length ? `<div class="k-okbox">${I("check", 22, 3)}<div><b>営業資料が完成しました！</b><small>バイヤーに送る前に内容を確認しましょう。</small></div></div>` : `<div class="k-okbox gy">${I("slides", 22)}<div><b>まだ営業資料を作っていません</b><small>下の「営業資料を作る」で言語と相手の国を選ぶと、ここに完成版が出ます。</small></div></div>`}
        <h4 style="margin:14px 0 8px;font-size:16px;font-weight:900">AIが確認するポイント</h4>
        <ul class="k-ck">${checks.map((c) => `<li><span class="${c[1] ? "ok" : "ng"}">${I(c[1] ? "check" : "alert", 16, 2.6)}</span><span>${esc(c[0])}</span></li>`).join("")}<li><span class="ng">${I("alert", 16)}</span><span style="color:#C25600">価格・MOQ は送る前に最終確認</span></li></ul>
        <div class="k-card warm" style="margin-top:14px;padding:14px 16px;box-shadow:none"><span class="k-tag orf" style="margin-bottom:6px">次にやること</span><b style="display:block;font-size:15px">この資料を使ってバイヤーへ提案</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:2px 0 10px">相手に合わせた営業メールを AI が下書きします（送る前に必ず確認・承認）。</small><button type="button" class="k-btn wide" ${act(() => goKey("db"))}>${I("arr", 18, 2.4)}バイヤーへの提案に進む</button></div></div></div>` });
    const host = $(".rd-p2", w);
    if (host) host.insertAdjacentHTML("afterend", `<div class="rd-x">${html}</div>`);
  };

  /* ───── 物流会社：AI物流マンに相談（fai） ───── */
  RD.page.fai = (w) => {
    const F = G("FWDB") || {}; const me = (F.profile && F.profile.co) || "";
    const R = Array.isArray(F.rates) ? F.rates : [], Q = Array.isArray(F.reqs) ? F.reqs : [];
    const cos = new Set(R.map((r) => r && r.co).filter(Boolean)).size;
    const last = Q.slice().sort((a, b) => ((b.d || "") > (a.d || "") ? 1 : -1))[0];
    const fc = document.getElementById("fwdchat");
    const chat = (fc && fc.closest(".c")) || $("#sec-0", w);
    if (!chat) return;
    const qs = $$(".qb .q[data-fq]", chat);
    const ask = (q) => { const ta = document.getElementById("fwdq"), go = document.getElementById("fwdqgo"); if (ta && go) { ta.value = q; go.click(); } };
    const aside = document.createElement("div");
    aside.className = "rd-x k-aside";
    aside.innerHTML = `${card({ ic: "db", t: "今、AIが参照している条件", b: `<dl class="k-dl"><dt>会社</dt><dd>${esc(me)}</dd><dt>レート表</dt><dd>${R.length} レーン${cos ? `（${cos}社）` : ""}</dd><dt>見積依頼</dt><dd>${Q.length} 件</dd>${last ? `<dt>最新の依頼</dt><dd>${esc(last.id)}・${esc(last.pol || "")} → ${esc(last.cty || last.pod || "")}</dd><dt>貨物</dt><dd>${esc(last.item || "")}${last.cbm ? `・${esc(last.cbm)}m³ ${esc(last.mode || "")}` : ""}</dd><dt>条件</dt><dd>${esc(last.term || "—")}</dd>` : ""}</dl><button type="button" class="k-btn white wide k-mini" style="margin-top:12px" ${act(() => goKey("frates"))}>${I("edit", 15)}レートを登録・更新する</button>` })}
      ${qs.length ? card({ ic: "help", t: "よくある質問", b: `<div class="k-rows">${qs.slice(0, 5).map((b) => `<button type="button" class="k-row" ${act(() => ask(b.dataset.fq))}><span class="k-rt"><b>${esc(b.dataset.fq)}</b></span>${I("arr", 16)}</button>`).join("")}</div>` }) : ""}
      ${card({ ic: "flag", t: "次のステップ", cls: "warm", b: `<b style="display:block;font-size:15px">この相談から見積を進めます</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:2px 0 10px">担当者が確認してから荷主へ送ります。</small><button type="button" class="k-btn wide" ${act(() => goKey("finbox"))}>${I("arr", 18, 2.4)}見積受信箱を開く</button>` })}`;
    const grid = document.createElement("div");
    grid.className = "k-grid k-faigrid";
    grid.style.gridTemplateColumns = "minmax(0,1.7fr) minmax(0,1fr)";
    chat.before(grid); grid.appendChild(chat); grid.appendChild(aside);
    chat.style.marginBottom = "0";
  };

  /* ───── 物流会社：依頼ページ（frq） ───── */
  RD.page.frq = (w) => {
    const box = $(".v33rq", w);
    const t = box ? box.textContent || "" : "";
    const n = (re) => { const m = t.replace(/\s+/g, "").match(re); return m ? +m[1] : 0; };
    const draft = n(/未提出(\d+)/), mid = n(/途中保存(\d+)/), done = n(/提出済み(\d+)/), exp = n(/期限切れ(\d+)/);
    const total = draft + mid + done + exp;
    const nb = $("#v33rqnew", w), poll = $("#v33rqpoll", w);
    const first = done ? ["回答を確認しましょう", `提出済みの回答が ${done}件あります。内容を見て見積に反映します。`, () => poll && poll.click(), "回答を確かめる"] : exp ? ["期限切れの依頼をフォロー", `期限を過ぎた依頼が ${exp}件あります。リンクを送り直しましょう。`, () => flash(box), "依頼の一覧へ"] : ["まず依頼を作りましょう", "荷主に確かめたいこと（貨物・梱包・出荷日など）を選んでリンクを送ります。", () => nb && nb.click(), "新しい依頼を作る"];
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps([{ t: "荷主への依頼を作成", ic: "edit", st: total ? "done" : "on", go: () => nb && nb.click() }, { t: "リンクを送る", ic: "link", st: total ? "done" : "" }, { t: "回答を受け取る", ic: "inbox", st: done ? "done" : total ? "on" : "", go: () => poll && poll.click() }, { t: "内容を確認する", ic: "check", st: done ? "on" : "" }])}</section>
      ${card({ ic: "chart", t: "依頼の状況", st: "margin-bottom:16px", b: tiles([{ ic: "edit", l: "未提出", n: draft, u: "件", s: "まだ荷主が開いていない" }, { ic: "clock", l: "途中保存", n: mid, u: "件", s: "荷主が入力中", cls: "or" }, { ic: "check", l: "提出済み（新しい回答）", n: done, u: "件", s: "内容の確認が必要", cls: done ? "hot" : "gr" }, { ic: "alert", l: "期限切れ", n: exp, u: "件", s: "フォローの対象", cls: exp ? "rd" : "" }]) })}
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        ${card({ ic: "spark", t: "AIが整理した優先アクション", cls: "warm", b: `<b style="display:block;font-size:16px">${esc(first[0])}</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:4px 0 12px">${esc(first[1])}</small><button type="button" class="k-btn" ${act(first[2])}>${I("arr", 18, 2.4)}${esc(first[3])}</button>` })}
        ${card({ ic: "help", t: "依頼ページとは？", b: `<div class="k-tiles" style="--n:3">${[["list", "必要事項を選ぶ"], ["link", "リンクを送る"], ["check", "回答を確認"]].map((x) => `<div class="k-tile v" style="align-items:center;text-align:center;padding:12px"><span class="k-ti" style="width:40px;height:40px">${I(x[0], 20)}</span><span class="k-tl">${esc(x[1])}</span></div>`).join("")}</div><p class="rd-note" style="font-size:13px">荷主に出荷情報・商品仕様などを依頼し、ログイン不要のリンクで答えてもらう機能です。回答は受信箱と案件にまとまります。</p>` })}
      </div>`);
  };

  /* ───── メンバー（荷主・物流会社）：誰が何をできる？ ───── */
  const who = () => card({ ic: "users", t: "誰が何をできる？", st: "margin-bottom:18px", b: `<div class="k-tiles" style="--n:3">${[["管理者", "招待・担当・役割・停止・削除。全部の案件とレートの管理"], ["メンバー", "見る・投稿する・担当の仕事（割り当てられた見積・案件に対応）"], ["代表", "アカウント発行時の担当者。外せません"]].map((x) => `<div class="k-tile v" style="padding:14px 16px"><span class="k-tl">${esc(x[0])}</span><span class="k-ts" style="font-size:13px;color:var(--k-ink2)">${esc(x[1])}</span></div>`).join("")}</div>` });
  const team0 = RD.page.team;
  RD.page.team = (w, k) => { if (team0) team0(w, k); const p = $(".rd-p2", w); if (p) p.insertAdjacentHTML("beforeend", who()); };
  RD.page.fteam = (w, k) => { if (team0) team0(w, k); const p = $(".rd-p2", w); if (p) p.insertAdjacentHTML("beforeend", who()); };

  /* ───── 窓：物流会社の AI見積（openFwdQuote） ───── */
  function decoQuote(pn) {
    if ($(".k-qhd", pn)) return;
    const h = $(".dwhead h3", pn);
    const id = h && ((h.textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
    const F = G("FWDB") || {}; const me = (F.profile && F.profile.co) || "";
    const r = id && (F.reqs || []).find((x) => x && x.id === id);
    if (!r) return;
    const legs = (r.legs || []).map((lg) => { const own = (lg.offers || []).find((o) => o && o.co === me); const q = (own && own.quote) || null; return { lg, q, own: !!own, sel: lg.co || lg.sel || "" }; });
    const ownN = legs.filter((x) => x.q).length;
    const sum = legs.reduce((a, x) => a + (x.q ? +x.q.total || 0 : 0), 0);
    const warns = $$(".dwbody p, .dwbody div", pn).filter((p) => /^⚠/.test((p.textContent || "").trim()) && !p.querySelector("p")).map((p) => (p.textContent || "").trim().replace(/^⚠\s*/, ""));
    const sent = /荷主に届いています/.test(pn.textContent || "");
    const hd = document.createElement("div");
    hd.className = "rd-x k-qhd";
    hd.innerHTML = `<div class="k-steps" style="margin-bottom:14px">${[["依頼の確認", "done"], ["AI見積を確認", sent ? "done" : "on"], ["荷主へ提出", sent ? "done" : ""]].map((s, i) => `${i ? `<span class="k-arr">${I("chevR", 18, 2.4)}</span>` : ""}<div class="k-step ${s[1]}" style="cursor:default"><span class="k-sn">${s[1] === "done" ? I("check", 14, 3) : i + 1}</span><b>${s[0]}</b></div>`).join("")}</div>
      ${tiles([{ ic: "doc", l: "見積依頼番号", n: id, s: r.co || "" }, { ic: "ship", l: "輸送ルート", n: `${r.pol || ""} → ${r.cty || r.pod || ""}`, s: `${r.mode || ""}${r.cbm ? "・" + r.cbm + "m³" : ""}` }, { ic: "coins", l: `貴社の概算見積（${ownN}/${legs.length}か国）`, n: ownN ? yen(sum) : "—", s: ownN ? "諸掛込み・税等別" : "貴社のレートでの見積なし", cls: "or" }, { ic: "alert", l: "確認状況", n: warns.length ? `要確認 ${warns.length}件` : "問題なし", s: sent ? "荷主に届いています" : "提出前に確認", cls: warns.length ? "rd" : "gr" }])}
      <div class="k-grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);margin:16px 0 0">
        ${card({ ic: "list", t: "見積の内訳（貴社のレート）", b: ownN ? `<div style="overflow-x:auto"><table class="rd-tbl"><thead><tr><th>国</th><th>区間</th><th style="text-align:right">海上運賃</th><th style="text-align:right">THC等</th><th style="text-align:right">書類費</th><th style="text-align:right">合計</th><th>有効期限</th></tr></thead><tbody>${legs.filter((x) => x.q).map((x) => `<tr><td>${flag(x.lg.cty, 16)} ${esc(x.lg.cty || "")}</td><td>${esc(x.q.lane || "")}</td><td style="text-align:right">${yen(x.q.freight)}</td><td style="text-align:right">${yen(x.q.thc)}</td><td style="text-align:right">${yen(x.q.doc)}</td><td style="text-align:right"><b>${yen(x.q.total)}</b></td><td>${esc(x.q.valid || "")}</td></tr>`).join("")}</tbody></table></div><p class="rd-note">金額・納期を直すときは「レート管理」で更新します（荷主の画面にも反映）。</p>` : `<div class="k-empty">貴社のレートでの見積はありません</div>` })}
        ${card({ ic: "spark", t: "AIの判断と確認ポイント", cls: warns.length ? "warm" : "", b: warns.length ? `<ul class="k-ck">${warns.slice(0, 4).map((x) => `<li><span class="ng">${I("alert", 16)}</span><span>${esc(x.slice(0, 90))}${x.length > 90 ? "…" : ""}</span></li>`).join("")}</ul>` : `<div class="k-empty">${I("check", 18, 3)} 確認が要る点はありません</div>` + "" }) }
      </div>`;
    const body = $(".dwbody", pn) || pn;
    body.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
  }

  /* ───── 窓：管理者AI ───── */
  function decoAdmAi(pn) {
    if ($(".k-aahd", pn)) return;
    const kv = (re) => { const b = $$("#admkpi > .kpi").find((x) => re.test(x.textContent || "")); const v = b && $(".kv", b); return v ? (v.textContent || "").trim() : "—"; };
    const today = $$("#v84admToday .v84td-c b").map((b) => +((b.textContent || "").match(/\d+/) || [0])[0]).reduce((a, b) => a + b, 0);
    const hd = document.createElement("div");
    hd.className = "rd-x k-aahd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 管理者コンソール</div><h1 style="font-size:26px">管理者AIに相談</h1><p>アカウント・AI利用コスト・同期の状況など、運用に必要なことを AI に聞けます。</p></div></div>
      ${card({ ic: "chart", t: "今の管理状況", st: "margin-bottom:12px", b: tiles([{ ic: "users", l: "発行済み", n: kv(/発行済み/).replace(/件$/, ""), u: "件" }, { ic: "alert", l: "今日の作業（要確認）", n: today, u: "件", cls: today ? "or" : "" }, { ic: "refresh", l: "同期の状態", n: kv(/同期/), cls: "gr" }], 3) })}
      <p class="rd-note" style="margin:0 0 10px">${I("shield", 14)} 管理者の権限の範囲で答えます。アカウントの操作や設定の変更は、管理画面で確かめてから行ってください。</p>`;
    const body = $(".dwbody", pn) || pn;
    body.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
  }

  /* ───── 窓：ヘルプ（物流会社・管理者は中身を分ける） ───── */
  const navTo = (re) => { const b = $$("#nav .nb").find((x) => re.test(x.textContent || "")); if (b) { try { closeDW(); } catch (e) { /* 無視 */ } b.click(); } }; // eslint-disable-line no-undef
  const closeGo = (k) => { try { closeDW(); } catch (e) { /* 無視 */ } goKey(k); }; // eslint-disable-line no-undef
  function helpHd(pn) {
    const r = role();
    if (r === "ship") return false;
    if ($(".k-helphd2", pn)) return true;
    $$(".k-helphd", pn).forEach((x) => x.remove());
    const hd = document.createElement("div");
    hd.className = "rd-x k-helphd k-helphd2";
    const search = () => { try { closeDW(); } catch (e) { /* 無視 */ } const s = document.getElementById("uxsearch"); if (s) s.click(); }; // eslint-disable-line no-undef
    const contact = () => { const h = $$("h3, h4, b, p", pn).find((x) => /お問い合わせ/.test(x.textContent || "") && !x.closest(".rd-x")); flash(h && (h.closest(".c") || h)); };
    if (r === "fwd") {
      hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 物流会社向け</div><h1 style="font-size:26px">物流会社向け・使い方ガイド</h1><p>初めての方も、見積・レート・依頼ページを迷わず使えるように案内します。</p></div></div>
        ${card({ ic: "flag", t: "初めての方は、まずこの3ステップから", st: "margin-bottom:12px", b: steps([{ t: "見積依頼を受け取る", s: "荷主から届いた依頼を確認", ic: "mail", go: () => closeGo("finbox") }, { t: "自社レートを登録する", s: "AI が見積案を作れるように", ic: "db", go: () => closeGo("frates") }, { t: "AI見積を確認して送る", s: "内容を見て、承認・提出", ic: "send", go: () => closeGo("finbox") }]) })}
        <div class="k-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-bottom:12px">
          ${card({ ic: "search", t: "ヘルプを探す", b: `<button type="button" class="k-row" ${act(search)}>${I("search", 18)}<span class="k-rt"><b>画面・操作を検索する</b><small>Ctrl＋K または ／</small></span></button><div class="k-rows" style="margin-top:10px">${[["レート表の登録（Excel・CSV から取り込み）", "frates"], ["依頼ページ（荷主への質問と回答の管理）", "frq"], ["相見積と AI の推奨の見方", "fagg"]].map((x) => `<button type="button" class="k-row" ${act(() => closeGo(x[1]))}><span class="k-rt"><b>${esc(x[0])}</b></span>${I("arr", 16)}</button>`).join("")}</div>` })}
          <div>${card({ ic: "chat", t: "AI物流マンに質問する", st: "margin-bottom:12px", b: `<small style="display:block;color:var(--k-ink2);font-weight:600;margin-bottom:10px">操作も物流の知識も AI に聞けます。</small><button type="button" class="k-btn wide" ${act(() => closeGo("fai"))}>${I("chat", 18)}AI物流マンに相談</button>` })}
          ${card({ ic: "help", t: "お困りのときは", b: `<button type="button" class="k-btn white wide" ${act(contact)}>${I("mail", 18)}お問い合わせを送る</button><a class="k-btn white wide" style="margin-top:8px;text-decoration:none" href="guide/" target="_blank" rel="noopener">${I("book", 18)}はじめてガイド（別のタブ）</a>` })}</div>
        </div>`;
    } else {
      hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 管理者コンソール</div><h1 style="font-size:26px">管理者サポートセンター</h1><p>トライアルの発行・利用状況・AI設定や同期の困りごとを、すぐに解決できます。</p></div></div>
        ${card({ ic: "flag", t: "管理者が最初にやること", st: "margin-bottom:12px", b: steps([{ t: "トライアルを発行", s: "会社名と担当者を入れて発行", ic: "users", go: () => navTo(/新しいアカウントを発行/) }, { t: "利用状況を確認", s: "ログイン・質問・アップロード", ic: "chart", go: () => navTo(/数字（概要）|利用の推移/) }, { t: "AIと連携を確認", s: "接続テストと同期の状態", ic: "link", go: () => navTo(/AIエンジン設定/) }]) })}
        <div class="k-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-bottom:12px">
          ${card({ ic: "alert", t: "よくある困りごと", b: `<div class="k-rows">${[["招待したお客様がログインできない", /メンバー管理/], ["同期サーバーにつながらない", /クラウド同期/], ["AI の回答が返らない・遅い", /AIエンジン設定/], ["トライアルの期間を変えたい", /アカウント一覧/]].map((x) => `<button type="button" class="k-row" ${act(() => navTo(x[1]))}><span class="k-rt"><b>${esc(x[0])}</b></span>${I("arr", 16)}</button>`).join("")}</div>` })}
          ${card({ ic: "zap", t: "すぐできる操作", b: `<div class="k-rows">${[["users", "トライアルアカウントを発行", /新しいアカウントを発行/], ["chart", "利用状況（数字）", /数字（概要）/], ["refresh", "同期・端末を確かめる", /クラウド同期/], ["chat", "管理者AIに相談", /管理者AI/]].map((x) => `<button type="button" class="k-row" ${act(() => navTo(x[2]))}>${I(x[0], 18)}<span class="k-rt"><b>${esc(x[1])}</b></span>${I("chevR", 16, 2.4)}</button>`).join("")}</div>` })}
        </div>`;
    }
    pn.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    return true;
  }
  const mo = new MutationObserver(() => {
    const pn = document.getElementById("pn"), dw = document.getElementById("dw");
    if (!pn || !dw || dw.dataset.open !== "true") return;
    const t = pn.textContent || "";
    if (/ヘルプ・使い方/.test(t)) helpHd(pn);
    else if (/AI見積 RQ-/.test(t)) decoQuote(pn);
    else if (/管理者AIに質問/.test(t) && role() === "adm") decoAdmAi(pn);
  });
  const startMo = () => { const dw = document.getElementById("dw"); if (dw) mo.observe(dw, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-open"] }); else setTimeout(startMo, 400); };
  startMo();

  /* ───── 仕上げに足す ───── */
  const after0 = RD.after;
  RD.after = function () { const r = after0.apply(this, arguments); try { crumb(); modeChip(); } catch (e) { console.error("[rd3]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) { crumb(); modeChip(); } } catch (e) { /* 無視 */ } }, 800);
  try { RD.after(true); } catch (e) { /* まだ */ }
})();
