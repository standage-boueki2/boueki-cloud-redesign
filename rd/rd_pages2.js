/* 貿易クラウドAI商社マン デザイン刷新 第2弾（手元だけ・2026-11-11）
   デザイナーの追加案に合わせた、荷主の画面ごとの部品。rd.js のあとに読む。
   ・数字はアプリが持っている本物だけ（増減の矢印や架空の件数は出さない）
   ・ボタンは今のアプリのボタン・関数を呼ぶだけ（同じ働き）。今の画面の中身は下にそのまま残す */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._p2) return;
  RD._p2 = 1;
  const { I, esc, $, $$, G, flag, IMG } = RD;
  const goKey = (k) => RD.goKey(k);

  /* ───── 道具 ───── */
  let AN = 0;
  const ACT = new Map();
  const act = (fn) => { const id = "k" + (++AN); ACT.set(id, fn); if (ACT.size > 4000) ACT.delete(ACT.keys().next().value); return `data-kact="${id}"`; };
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-kact]"); if (!b) return; const f = ACT.get(b.dataset.kact); if (f) { e.preventDefault(); e.stopPropagation(); try { f(e, b); } catch (x) { console.error("[rd2]", x); } } });
  RD.act = act;
  const orig = (root, sel) => $$(sel, root).filter((x) => !x.closest(".rd-x"));
  const byText = (root, re, sel) => orig(root, sel || "button, a, summary, [role=button]").find((x) => re.test((x.textContent || "").replace(/\s+/g, "")));
  const flash = (el) => { if (!el) return; el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("k-flash"); setTimeout(() => el.classList.remove("k-flash"), 2200); };
  const clickText = (root, re, sel) => { const b = byText(root, re, sel); if (b) { b.click(); return true; } return false; };
  const today = () => { const d = new Date(), z = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); };
  const dayDiff = (s) => { if (!s) return null; const a = new Date(String(s).slice(0, 10) + "T00:00:00"), b = new Date(today() + "T00:00:00"); return Math.round((a - b) / 864e5); };
  const jpDate = (d) => { const w = "日月火水木金土"; return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w[d.getDay()]}）`; };
  const T = () => G("TEN") || {};
  const H = (o) => `<div class="k-h">${o.ic ? I(o.ic, 24) : ""}<h2${o.sz ? ` style="font-size:${o.sz}px"` : ""}>${esc(o.t)}</h2>${o.s ? `<span class="k-hs">${esc(o.s)}</span>` : ""}${o.r ? `<div class="k-hr">${o.r}</div>` : ""}</div>`;
  const card = (o) => `<section class="k-card ${o.cls || ""}"${o.id ? ` id="${o.id}"` : ""}${o.st ? ` style="${o.st}"` : ""}>${o.t ? H(o) : ""}${o.b || ""}</section>`;
  const tiles = (arr, n) => `<div class="k-tiles" style="--n:${n || arr.length}">${arr.map((t) => { const tag = t.go ? "button" : "div"; return `<${tag} ${t.go ? `type="button" ${act(t.go)}` : ""} class="k-tile ${t.cls || ""}"><span class="k-ti">${I(t.ic, 24)}</span><span style="min-width:0"><span class="k-tl">${esc(t.l)}</span><span class="k-tn">${t.n == null ? "—" : esc(t.n)}<small>${esc(t.u || "")}</small></span>${t.s ? `<span class="k-ts">${esc(t.s)}</span>` : ""}</span>${t.go ? `<span style="margin-left:auto;color:var(--k-bl)">${I("chevR", 18, 2.4)}</span>` : ""}</${tag}>`; }).join("")}</div>`;
  const steps = (arr) => `<div class="k-steps">${arr.map((s, i) => { const tag = s.go ? "button" : "div"; return `${i ? `<span class="k-arr">${I("chevR", 20, 2.4)}</span>` : ""}<${tag} ${s.go ? `type="button" ${act(s.go)}` : 'aria-current="step"'} class="k-step ${s.st || ""}${s.go ? "" : " k-nogo"}"><span class="k-sn">${s.st === "done" ? I("check", 15, 3) : i + 1}</span>${s.ic ? `<span class="k-si">${I(s.ic, 26)}</span>` : ""}<span style="min-width:0"><b>${esc(s.t)}</b>${s.s ? `<small>${esc(s.s)}</small>` : ""}</span></${tag}>`; }).join("")}</div>`;
  const put = (w, html) => { const h = $("[data-rdhero]", w); const box = document.createElement("div"); box.className = "rd-x rd-p2"; box.innerHTML = html; if (h) h.after(box); else w.prepend(box); return box; };
  const fold = (w, nodes, title, ic) => { nodes = nodes.filter(Boolean); if (!nodes.length) return null; const d = document.createElement("details"); d.className = "rd-old"; d.innerHTML = `<summary>${I(ic || "list", 20)}<span>${esc(title)}</span></summary><div class="rd-oldin"></div>`; nodes[0].before(d); const inn = $(".rd-oldin", d); nodes.forEach((n) => inn.appendChild(n)); return d; };
  const img64 = (a) => (a && a.b64 ? `data:${a.mime || "image/jpeg"};base64,${a.b64}` : "");
  const threads = () => { try { return RD.dbThreads(); } catch (e) { return []; } };
  const chosenCty = () => { const S = T().ctySel || {}; const c = (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean); return c; };
  const recCty = () => { const S = T().ctySel || {}; return (Array.isArray(S.rec) ? S.rec : []).filter((x) => x && x.c); };
  const cssOnce = (id, css) => { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); };
  cssOnce("rd2css", `html.rd .k-flash{box-shadow:0 0 0 3px var(--k-or)!important;transition:box-shadow .3s}
    html.rd .rd-p2{margin-bottom:6px}`);
  Object.assign(RD, { card, tiles, steps, put, fold, H, byText, clickText, flash, orig, img64, dayDiff, today, jpDate, chosenCty, recCty });

  /* 輸出のステップ（今どこ？）：登録データから「いまの段」を出す */
  function exportSteps() {
    const t = T(), th = threads();
    const st = (x) => RD.stShort(x.st);
    const S = [
      { t: "商品を登録", s: "輸出する商品を用意", ic: "box", done: !!t.item, k: "item" },
      { t: "市場・規制を調査", s: "売る国と決まりを確かめる", ic: "research", done: chosenCty().length > 0, k: "cty" },
      { t: "バイヤーに提案", s: "相手を探して連絡", ic: "send", done: th.length > 0 || (t.outreach || []).length > 0, k: "db" },
      { t: "見積・交渉", s: "条件をそろえる", ic: "doc", done: th.some((x) => /^(見積提示|契約交渉|取引中)$/.test(st(x))), k: "deal" },
      { t: "出荷・実行", s: "書類と出荷の手配", ic: "ship", done: (t.shipCases || []).length > 0 || (t.poCases || []).length > 0, k: "ops:doc" },
    ];
    const on = S.findIndex((x) => !x.done);
    return S.map((x, i) => ({ t: x.t, s: x.s, st: x.done ? "done" : i === on ? "on" : "", go: () => goKey(x.k) }));
  }
  RD.exportSteps = exportSteps;

  /* ───── AI商社マンに聞く（ai） ───── */
  RD.page.ai = (w) => {
    const t = T();
    let L = null;
    try { L = typeof aiLevel === "function" ? aiLevel() : null; } catch (e) { L = null; } // eslint-disable-line no-undef
    const ph = (t.assets && t.assets.ph && t.assets.ph[0]) || null;
    const cs = chosenCty(), rc = recCty().map((x) => x.c);
    const ctys = (cs.length ? cs : rc.length ? rc : t.targets || []).slice(0, 3);
    const ask = (q) => { q = String(q || "").trim(); if (!q) return; try { askFree(q); } catch (e) { console.error(e); } setTimeout(() => { const c = document.getElementById("chat"); if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150); }; // eslint-disable-line no-undef
    const item = t.item || "この商品", c0 = ctys[0] || "販売先の国";
    const chips = [
      ["shield", "現地の規制・認証を調べる", `${c0}に「${item}」を輸出するときの規制・認証と必要な書類を教えて`],
      ["users", "有望なバイヤーを探す", `「${item}」に合う${c0}のバイヤーの探し方と、最初の連絡の文面を考えて`],
      ["coins", "最適な価格を相談する", `「${item}」の${c0}向けの輸出価格（FOB）の考え方と、見積の出し方を教えて`],
      ["box", "輸出の進め方を相談する", `「${item}」の輸出を始めるとき、次に何をすればよいか順番に教えて`],
    ];
    const can = [
      ["research", "市場・規制を調査", "需要・競合・現地の規制・認証を調べます", "cty"],
      ["users", "バイヤーを提案", "条件に合う輸入バイヤーを探し、候補を出します", "db"],
      ["doc", "見積・交渉を支援", "返信案と見積、条件の整理を手伝います", "msg"],
      ["ship", "出荷・実行をサポート", "必要な書類の判定と下書きを作ります", "ops:doc"],
    ];
    const box = put(w, `
      <div class="k-card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:12px 18px">
        ${I("box", 22)}<b style="font-size:15px">対象の商品・案件</b><span class="k-hs" style="font-size:12.5px;color:var(--k-ink3)">（いまの相談の前提）</span>
        <span style="width:1px;height:28px;background:var(--k-line)"></span>
        ${ph ? `<img src="${img64(ph)}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:10px;border:1px solid var(--k-line)">` : ""}
        <b style="font-size:17px">${esc(t.item || "商品が未登録です")}</b>
        ${t.co ? `<span class="k-tag bl">${esc(t.co)}</span>` : ""}
        ${ctys.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}${cs.length ? "" : '<small style="color:var(--k-ink3);font-weight:700">（候補）</small>'}</span>`).join("")}
        <button type="button" class="k-btn white" style="margin-left:auto;min-height:38px;padding:6px 14px" ${act(() => { const f = document.getElementById("pfind"); if (f) f.click(); else { const s = document.getElementById("psw"); if (s) s.focus(); } })}>${I("refresh", 16)}変更</button>
      </div>
      <section class="k-card warm" style="margin-bottom:18px;display:grid;grid-template-columns:150px 1fr;gap:18px;align-items:center">
        <img src="${IMG}robot.png" alt="" style="width:140px;height:auto;-webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%)">
        <div style="min-width:0">
          <h2 style="margin:0 0 12px;font-size:23px;font-weight:900;line-height:1.45"><span style="color:#E06A06">この商品</span>や<span style="color:#E06A06">輸出の進め方</span>について、AIに何でも聞いてみましょう！</h2>
          <form class="rd-ask" id="k-ask" style="border-color:var(--k-or-line)"><input id="k-askq" placeholder="例）シンガポールでの販売規制を教えて ／ この商品の見込みバイヤーを探して ／ 最適な価格を相談したい" autocomplete="off"><button type="submit" aria-label="質問する" style="width:auto;padding:0 18px;gap:6px;font-weight:800;font-size:15px">${I("send", 18, 2.2)}質問する</button></form>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;align-items:center"><span style="font-size:13px;font-weight:800;color:var(--k-ink2)">よくある質問（例）</span>${chips.map((c) => `<button type="button" class="k-chip" style="cursor:pointer;border-radius:999px" ${act(() => ask(c[2]))}>${I(c[0], 17)}${esc(c[1])}</button>`).join("")}</div>
        </div>
      </section>
      <div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "hand", t: "AIがあなたの代わりにできること", s: "調査からバイヤー提案、見積・交渉の準備まで、輸出の実務をサポートします", b: `<div class="k-tiles" style="--n:4">${can.map((c) => `<button type="button" class="k-step big" ${act(() => goKey(c[3]))}><span class="k-si">${I(c[0], 40, 1.6)}</span><span><b>${esc(c[1])}</b><small>${esc(c[2])}</small></span></button>`).join("")}</div>` })}
        ${L ? card({ ic: "chart", t: "AI商社マンの成長", b: `<div style="display:flex;align-items:center;gap:14px"><img src="${IMG}robot.png" alt="" style="width:70px;height:auto;-webkit-mask-image:radial-gradient(circle,#000 58%,transparent 72%);mask-image:radial-gradient(circle,#000 58%,transparent 72%)"><div style="flex:1;min-width:0"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="k-tag or" style="font-size:15px">Lv.${esc(L.lv)} ${esc(L.stage)}</span><b style="margin-left:auto;font-size:30px;font-weight:900;color:#E06A06">${esc(L.pct)}<small style="font-size:16px">%</small></b></div><div class="k-bar" style="margin:8px 0"><i style="width:${Math.max(0, Math.min(100, +L.pct || 0))}%"></i></div><small style="font-size:12.5px;color:var(--k-ink2);font-weight:600">${L.nextStage ? `次の「${esc(L.nextStage)}」まで あと ${esc(Math.max(0, (L.nextTh || 0) - (L.pct || 0)))}%` : ""}・一人前は 90%</small></div></div>
          <p style="margin:10px 0 8px;font-size:13.5px;color:var(--k-ink2);font-weight:600">やり取りから、商品・市場・バイヤーの理解が深まり、提案の精度が高まります。</p>
          <button type="button" class="k-link" ${act(() => flash($(".grow", w) || $("#sec-0", w)))}>成長の内訳と育て方を見る ${I("arr", 15)}</button>` }) : ""}
      </div>`);
    $("#k-ask", box).addEventListener("submit", (e) => { e.preventDefault(); const q = $("#k-askq", box); if (!q.value.trim()) { q.focus(); q.placeholder = "ここに質問を書いてから押してください（下の「よくある質問」を押しても聞けます）"; q.closest("form").classList.add("k-need"); setTimeout(() => q.closest("form").classList.remove("k-need"), 1600); return; } ask(q.value); q.value = ""; });
  };

  /* ───── 受信箱（inbox） ───── */
  RD.page.inbox = (w) => {
    const th = threads();
    const nego = th.filter((x) => /^(商談中|サンプル出荷|見積提示|契約交渉)$/.test(RD.stShort(x.st)));
    const cn = [...new Set(nego.map((x) => x.cty).filter(Boolean))];
    let todayN = null;
    try { const n = (notifCalc() || []).find((x) => x.cat === "today"); const m = n && String(n.t).match(/(\d+)件/); if (m) todayN = +m[1]; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    const tabs = orig(w, ".v38ix button, .v33ix button, .v33tab").map((b) => ({ b, t: (b.textContent || "").replace(/\s+/g, " ").trim() }));
    const tabN = (re) => { const x = tabs.find((y) => re.test(y.t)); const m = x && x.t.match(/(\d+)/); return m ? +m[1] : null; };
    const appr = tabN(/確認・承認/), mine = tabN(/自分の番/);
    const goTab = (re) => { const x = tabs.find((y) => re.test(y.t)); if (x) { x.b.click(); setTimeout(() => flash($("#sec-1", w) || x.b), 60); } };
    const first = appr ? "確認・承認" : mine ? "自分の番" : "";
    put(w, `<section class="k-card" style="display:grid;grid-template-columns:auto 1fr minmax(260px,330px);gap:22px;align-items:center;margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:12px">${I("cal", 34)}<div><b style="font-size:26px;font-weight:900;display:block">今日のまとめ</b><span style="font-size:13.5px;color:var(--k-ink2);font-weight:700">${esc(jpDate(new Date()))}</span></div></div>
      <ul class="k-ck" style="border-left:1px solid var(--k-line);padding-left:22px">
        <li>${I("list", 18)}<span>今日やること：<span class="k-tag or" style="font-size:14px">${todayN == null ? "—" : todayN + "件"}</span></span></li>
        <li>${I("hand", 18)}<span>商談の進捗：<span class="k-tag bl" style="font-size:14px">${nego.length}社</span> が商談中〜契約交渉${cn.length ? `（${esc(cn.join("・"))}）` : ""}</span></li>
        <li>${I("check", 18)}<span>確認・承認：<span class="k-tag ${appr ? "or" : "gr"}" style="font-size:14px">${appr == null ? "—" : appr + "件"}</span>（AI の案・承認の依頼）</span></li>
      </ul>
      <div style="padding:16px;border-radius:16px;background:linear-gradient(180deg,#FFF5EA,#FFFBF6);border:1px solid #F8D9B4">${first ? `<b style="font-size:15px;line-height:1.5;display:block;margin-bottom:10px">${I("spark", 18)} まずは「${esc(first)}」の ${esc(first === "確認・承認" ? appr : mine)}件から対応しましょう</b><button type="button" class="k-btn wide" ${act(() => goTab(first === "確認・承認" ? /確認・承認/ : /自分の番/))}>${esc(first)}を開く ${I("chevR", 18, 2.4)}</button>` : `<b style="font-size:15px">${I("check", 18)} いま急ぎの対応はありません</b>`}</div>
    </section>`);
  };

  /* ───── 今日やること（today） ───── */
  RD.page.today = (w) => {
    const th = threads();
    const stale = th.filter((x) => x.at && (Date.now() - x.at) / 864e5 >= 30 && RD.stShort(x.st) !== "失注" && RD.stShort(x.st) !== "取引中").slice(0, 3);
    const lost = th.filter((x) => RD.stShort(x.st) === "失注").length;
    const lr = $("#lr83tdw", w);
    put(w, `<section class="k-card" style="margin-bottom:18px;padding:14px 18px"><div class="k-h" style="margin-bottom:10px">${I("flag", 22)}<h2 style="font-size:18px">輸出のステップ</h2><span class="k-hs">（今どこ？）押すと、その画面へ</span></div>${steps(exportSteps())}</section>
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        ${card({ ic: "clock", t: "停滞中の案件", s: "30日以上動きのない相手", r: stale.length ? `<span class="k-tag rd">${stale.length}件</span>` : "", b: stale.length ? `<div class="k-rows">${stale.map((x) => `<div class="k-row">${flag(x.cty, 18)}<span class="k-rt"><b>${esc(x.name)}</b><small>${esc(x.cty || "")}・${esc(RD.stShort(x.st))}</small></span><span class="k-tag rd">動きなし ${Math.floor((Date.now() - x.at) / 864e5)}日</span><button type="button" class="k-btn white k-mini" ${act(() => { try { openDMThread(x.id); } catch (e) { goKey("msg"); } })}>対応する ${I("chevR", 14, 2.4)}</button></div>`).join("")}</div>${lr ? `<button type="button" class="k-link" style="margin-top:10px" ${act(() => flash(lr))}>続けるか・失注にするかを決める ${I("arr", 15)}</button>` : ""}` : `<div class="k-empty">${I("check", 18, 3)} 止まっている相手はいません</div>` })}
        ${card({ ic: "chart", t: "失注の振り返り", s: "学んで次に活かす", b: `${tiles([{ ic: "doc", l: "失注した相手", n: lost, u: "社" }, { ic: "users", l: "やりとり中の相手", n: th.length, u: "社" }], 2)}<button type="button" class="k-btn ghost wide" style="margin-top:12px" ${act(() => lr ? flash(lr) : goKey("deal"))}>${I("doc", 18)}失注の振り返りを始める ${I("chevR", 16, 2.4)}</button>` })}
      </div>`);
  };

  /* ───── 商品情報（item）：商品の顔・データの充足度・節への移動 ───── */
  RD.skip.item = 1;
  const GROUPS = [
    ["基本情報", ["co", "coEn", "item", "itemEn", "cat", "sku", "hs", "origin"], "box"],
    ["価格・取引条件", ["priceRows", "moq", "term", "pay", "lead", "pol"], "coins"],
    ["成分・仕様", ["compRows", "dimRows", "shelf", "store", "ctn", "cert"], "research"],
    ["強み", ["strengths"], "star"],
  ];
  RD.page.item = (w) => {
    const t = T();
    let sc = null;
    try { sc = scoreOf(t); } catch (e) { sc = null; } // eslint-disable-line no-undef
    const filled = (sc && sc.filled) || [], miss = (sc && (sc.missing || [])) || [];
    const has = (k) => filled.some((x) => x.k === k), known = (k) => has(k) || miss.some((x) => x.k === k);
    const pct = sc ? Math.round(sc.pct) : null;
    const ph = (t.assets && t.assets.ph) || [];
    const hdr = (re) => orig(w, "h3, h2").find((h) => re.test(h.textContent || ""));
    const sec = [[/①|商品情報・強み/, "基本情報・強み", "box"], [/②|価格表/, "価格・寸法", "coins"], [/③|成分/, "成分・仕様", "research"], [/④|業種/, "業種ごとの項目", "list"]].map((x) => ({ h: hdr(x[0]), t: x[1], ic: x[2] })).filter((x) => x.h);
    const str0 = Array.isArray(t.strengths) && t.strengths[0] ? (Array.isArray(t.strengths[0]) ? t.strengths[0][0] : t.strengths[0]) : "";
    const missN = miss.length;
    put(w, `<section class="k-card" style="display:grid;grid-template-columns:200px minmax(0,1fr) minmax(280px,360px);gap:22px;align-items:center;margin-bottom:16px">
        <div style="width:200px;height:170px;border-radius:16px;overflow:hidden;background:#F1F5FA;display:flex;align-items:center;justify-content:center">${ph[0] ? `<img src="${img64(ph[0])}" alt="" style="width:100%;height:100%;object-fit:cover">` : I("box", 60, 1.4)}</div>
        <div style="min-width:0"><div class="k-chips" style="margin-bottom:6px">${t.cat ? `<span class="k-tag gr">${esc(t.cat)}</span>` : ""}<span class="k-tag ${pct >= 100 ? "gr" : "or"}">${I("check", 13, 3)}${pct >= 100 ? "登録済み" : "登録中"}</span>${ph.length ? `<span class="k-tag gy">写真 ${ph.length}枚</span>` : ""}</div>
          <h2 style="margin:0;font-size:28px;font-weight:900;line-height:1.3">${esc(t.item || "商品が未登録です")}</h2>
          ${t.itemEn ? `<div style="font-size:15px;font-weight:700;color:var(--k-ink2);margin:2px 0 6px">${esc(t.itemEn)}</div>` : ""}
          ${str0 ? `<p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#2A3B54">${esc(str0)}</p>` : ""}
          <div class="k-chips">${t.origin ? `<span class="k-chip">${I("pin", 16)}${esc(t.origin)}</span>` : ""}${t.co ? `<span class="k-chip">${I("bldg", 16)}${esc(t.co)}</span>` : ""}${t.hs ? `<span class="k-chip">${I("list", 16)}HSコード ${esc(t.hs)}</span>` : ""}${t.sku ? `<span class="k-chip">${I("rate", 16)}品番 ${esc(t.sku)}</span>` : ""}</div></div>
        <div style="border-left:1px solid var(--k-line);padding-left:20px"><div class="k-h" style="margin-bottom:8px">${I("chart", 22)}<h2 style="font-size:18px">データの充足度</h2>${sc ? `<span class="k-tag or" style="margin-left:auto">必須 ${filled.length + missN}件中 ${filled.length}件</span>` : ""}</div>
          <div style="display:flex;gap:14px;align-items:center"><div class="k-ring" style="--p:${pct || 0};--size:118px"><span>${pct == null ? "—" : pct}<small>%</small></span></div>
          <ul class="k-ck" style="flex:1;min-width:0">${GROUPS.map((g) => { const ks = g[1].filter(known); const ng = ks.filter((k) => !has(k)); return ks.length ? `<li><span class="${ng.length ? "ng" : "ok"}">${I(ng.length ? "alert" : "check", 16, 2.6)}</span><span style="flex:1">${esc(g[0])}</span><b style="font-size:13px;color:${ng.length ? "#D25F00" : "var(--k-gr)"}">${ng.length ? `一部未入力（${ng.length}）` : "入力済み"}</b></li>` : ""; }).join("")}</ul></div></div>
      </section>
      ${sec.length ? `<div class="v33tabs" style="margin-bottom:16px">${sec.map((x) => `<button type="button" class="v33tab" ${act(() => flash(x.h.closest(".c") || x.h))}>${I(x.ic, 18)}${esc(x.t)}</button>`).join("")}</div>` : ""}`);
    const end = document.createElement("div");
    end.className = "rd-x";
    end.style.cssText = "text-align:center;margin:22px 0 8px";
    end.innerHTML = `<button type="button" class="k-btn big" ${act(() => goKey("cty"))}>${I("send", 20)}この商品で輸出の次のステップへ（市場・規制の調査）${I("chevR", 18, 2.4)}</button>`;
    w.appendChild(end);
  };

  /* ───── 販売先国の選定（cty）：AIの提案3か国・指標の比較・選んだ国 ───── */
  RD.skip.cty = 1;
  const AX = [["mkt", "市場性"], ["reg", "規制"], ["comp", "競合"], ["base", "拠点"]];
  const lvTxt = (k, v) => { v = +v || 0; if (k === "reg") return v >= 80 ? "通りやすい" : v >= 60 ? "ふつう" : "厳しい"; if (k === "comp") return v >= 80 ? "少ない" : v >= 60 ? "ふつう" : "多い"; return v >= 80 ? "高" : v >= 60 ? "中" : "低"; };
  function radar(rows) {
    const cx = 150, cy = 135, R = 100, n = AX.length, col = ["#F57C0F", "#1F6FD1", "#14995A"];
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, r = (R * Math.max(0, Math.min(100, v))) / 100; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    let g = "";
    [25, 50, 75, 100].forEach((v) => { g += `<polygon points="${AX.map((_, i) => pt(i, v).join(",")).join(" ")}" fill="none" stroke="#E1E9F3" stroke-width="1"/>`; });
    AX.forEach((a, i) => { const [x, y] = pt(i, 100), [lx, ly] = pt(i, 122); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E1E9F3"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#2A3B54">${a[1]}</text>`; });
    rows.forEach((r, j) => { g += `<polygon points="${AX.map((a, i) => pt(i, (r.sc || {})[a[0]] || 0).join(",")).join(" ")}" fill="${col[j]}" fill-opacity=".14" stroke="${col[j]}" stroke-width="2.2"/>`; });
    return `<svg viewBox="0 0 300 270" width="100%" style="max-width:320px;display:block;margin:auto" role="img" aria-label="主要指標の比較">${g}</svg><div class="k-chips" style="justify-content:center;margin-top:4px">${rows.map((r, j) => `<span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800"><i style="width:12px;height:12px;border-radius:3px;background:${col[j]}"></i>${esc(r.c)}</span>`).join("")}</div>`;
  }
  RD.page.cty = (w) => {
    const rec = recCty().slice(0, 3), ch = chosenCty();
    const ai = byText(w, /おまかせ/);
    const boxes = () => orig(w, "input[data-ctypick]");
    const box = (c) => boxes().find((x) => x.dataset.ctypick === c);
    const picked = () => (ch.length ? ch.slice() : boxes().filter((x) => x.checked).map((x) => x.dataset.ctypick));
    const tst = (m) => { try { toast(m); } catch (e) { alert(m); } }; // eslint-disable-line no-undef
    // 選ぶ・外す（最大3か国）。確定済みなら「選び直す」で開いてからチェックをそろえる
    const setPick = (next) => {
      const apply = () => { boxes().forEach((x) => { if (!x.disabled) x.checked = next.indexOf(x.dataset.ctypick) >= 0; }); RD.after(true); };
      if (chosenCty().length) {
        try { ctyUnconfirm(); } catch (e) { const u = byText(w, /選び直す/); if (u) u.click(); } // eslint-disable-line no-undef
        setTimeout(apply, 0);
      } else apply();
    };
    const toggle = (c) => {
      const cur = picked();
      const b = box(c);
      if (b && b.dataset.v83ban) { tst(`「${c}」は開拓しない国です（会社の方針）。選べません`); return; }
      if (cur.indexOf(c) >= 0) { setPick(cur.filter((x) => x !== c)); return; }
      if (cur.length >= 3) {
        tst("販売先国は3か国まで選べます。先に、選択中の国のどれかを外してください（選択中の札の × か、カードの「選択中」を押すと外れます）");
        const sel = $("#k-ctysel", w);
        if (sel) { // トーストを見落としても分かるように、選択中の欄の中にも出す
          let n = $(".k-ctymsg", sel);
          if (!n) { n = document.createElement("p"); n.className = "k-ctymsg"; n.setAttribute("role", "alert"); sel.appendChild(n); }
          n.textContent = `「${c}」を選ぶには、先に選択中の国のどれかを × で外してください（販売先国は3か国まで）`;
          try { sel.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* 古いブラウザ */ }
          flash(sel);
        }
        return;
      }
      setPick(cur.concat([c]));
    };
    const confirmIt = () => {
      if (!picked().length) { tst("国を1〜3か国選んでください"); return; }
      const b = $$("button", w).find((x) => !x.closest(".rd-x") && /ctyConfirm/.test(x.getAttribute("data-onclick") || ""));
      if (b) b.click(); else { try { ctyConfirm(); } catch (e) { console.error(e); } } // eslint-disable-line no-undef
    };
    const st = [{ t: "商品を登録", ic: "box", st: T().item ? "done" : "", go: () => goKey("item") }, { t: "販売先国の選定", ic: "globe", st: ch.length ? "done" : "on" }, { t: "規制確認", ic: "shield", st: ch.length ? "on" : "", go: () => goKey("ops:reg") }, { t: "提案準備", ic: "send", go: () => goKey("deck") }];
    const pk = picked();
    const isSel = (c) => pk.indexOf(c) >= 0;
    const selList = pk;
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps(st)}</section>
      ${rec.length ? `<div class="k-grid" style="grid-template-columns:minmax(0,1.75fr) minmax(0,1fr)">
        ${card({ ic: "spark", t: "AIが有望な販売先国を提案！", r: `<span class="k-tag or">${I("spark", 13)}貴社の商品との相性で自動ランキング</span>`, cls: "warm", b: `<div class="k-tiles" style="--n:${rec.length}">${rec.map((r, i) => { const s = r.sc || {}; const on = isSel(r.c); return `<div class="k-card" style="padding:16px;${i === 0 ? "border:2px solid var(--k-or);" : ""}position:relative">${i === 0 ? '<span class="k-tag orf" style="position:absolute;right:12px;top:-12px">最もおすすめ</span>' : ""}
            <span class="k-tag ${i === 0 ? "orf" : "gy"}" style="font-size:13px">${i + 1}位</span><div style="display:flex;align-items:center;gap:8px;margin-top:8px;min-width:0">${flag(r.c, 24)}<b style="font-size:20px;font-weight:900;line-height:1.3">${esc(r.c)}</b>${ch.indexOf(r.c) >= 0 ? '<span class="k-tag gr">確定</span>' : ""}</div>
            <div style="margin:10px 0 8px;font-size:40px;font-weight:900;color:#E06A06;line-height:1">${esc(Math.round(s.total || 0))}<small style="font-size:16px;color:var(--k-ink3)">/100</small></div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px">${AX.map((a) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:4px;padding:6px 10px;border-radius:10px;background:#F4F8FD;white-space:nowrap" title="${a[1]}：${esc(lvTxt(a[0], s[a[0]]))}"><small style="font-size:12.5px;font-weight:800;color:var(--k-ink2)">${a[1]}</small><b style="font-size:14px;color:${(s[a[0]] || 0) >= 80 ? "var(--k-gr)" : (s[a[0]] || 0) >= 60 ? "var(--k-am)" : "var(--k-rd)"}">${esc(Math.round(s[a[0]] || 0))}</b></div>`).join("")}</div>
            ${r.why ? `<p style="margin:0 0 10px;font-size:12.5px;font-weight:600;color:#2A3B54;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden" title="${esc(r.why)}">${esc(r.why)}</p>` : ""}
            <button type="button" class="k-btn ${on ? "" : "white"} wide" data-rdcty="${esc(r.c)}" title="${on ? "押すと外します" : "押すと選びます（3か国まで）"}" ${act(() => toggle(r.c))}>${I(on ? "check" : "plus", 18, 2.6)}${on ? "選択中（押すと外す）" : "選択する"}</button></div>`; }).join("")}</div>` })}
        ${card({ ic: "chart", t: "主要指標の比較", b: radar(rec) + `<table class="rd-tbl" style="margin-top:10px"><thead><tr><th>国</th><th style="text-align:right">総合スコア</th></tr></thead><tbody>${rec.map((r) => `<tr><td>${flag(r.c, 16)} <b>${esc(r.c)}</b></td><td style="text-align:right"><b style="font-size:22px;color:#E06A06">${esc(Math.round((r.sc || {}).total || 0))}</b></td></tr>`).join("")}</tbody></table>` })}
      </div>
      <section class="k-card" id="k-ctysel" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px">
        <span class="k-ck">${I("check", 22, 3)}</span><b style="font-size:16px">${ch.length ? "確定した販売先国" : "選択中の販売先国"}</b><b style="font-size:30px;color:#E06A06;font-weight:900">${selList.length}</b><b>/ 3 か国</b>
        <div class="k-chips">${selList.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}<button type="button" class="k-chipx" aria-label="${esc(c)}を外す" title="外す" ${act(() => toggle(c))}>${I("x", 14, 2.6)}</button></span>`).join("") || '<span class="k-hs">まだ選んでいません（カードの「選択する」で1〜3か国）</span>'}</div>
        ${ch.length
          ? `<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="k-btn white" ${act(() => setPick(ch.slice()))}>${I("edit", 18)}選び直す</button><button type="button" class="k-btn big" ${act(() => goKey("ops:reg"))}>${I("chevR", 20, 2.6)}確定した国で次へ（規制確認）</button></span>`
          : `<button type="button" class="k-btn big" style="margin-left:auto" ${selList.length ? "" : "disabled"} ${act(confirmIt)}>${I("check", 20, 2.6)}${selList.length ? `この${selList.length}か国で確定する` : "国を選ぶと確定できます"}</button>`}
      </section>` : card({ ic: "spark", t: "AIが有望な販売先国を提案します", cls: "warm", b: `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><p style="margin:0;flex:1;min-width:260px;font-size:15px;font-weight:700;color:#2A3B54;line-height:1.8">まだ分析していません。AI商社マンが、規制・市場・競合・拠点のデータから<b style="color:#E06A06">おすすめの3か国</b>を選びます。</p>${ai ? `<button type="button" class="k-btn big" ${act(() => ai.click())}>${I("spark", 20)}AI商社マンにおまかせ（1クリック）</button>` : ""}</div>` })}`);
  };

  /* ───── 外国語の営業資料（deck）：準備の状況・項目・生成 ───── */
  RD.page.deck = (w) => {
    const s0 = RD.secBy(w, /納品レベルチェック/) || $("#sec-0", w), s3 = RD.secBy(w, /営業資料を作る/) || $("#sec-3", w);
    if (!s0) return;
    // 今の画面の「納品レベルチェック」の項目と数をそのまま使う（数を合わせる）
    const items = $$(".dk3-gi", s0).map((g) => { const b = $("b", g); const n = b ? b.textContent.trim() : ""; return { el: g, n: n.replace(/（推奨）$/, ""), rec: /（推奨）$/.test(n) || g.classList.contains("rec"), ok: g.classList.contains("ok"), how: (($(".nn", g) || {}).textContent || "").trim() }; }).filter((x) => x.n);
    if (!items.length) return;
    const mt = (s0.textContent || "").replace(/\s+/g, "");
    const mReq = mt.match(/必須(\d+)\/(\d+)/), mAll = mt.match(/全体(\d+)\/(\d+)/);
    const reqOk = mReq ? +mReq[1] : items.filter((x) => !x.rec && x.ok).length, reqN = mReq ? +mReq[2] : items.filter((x) => !x.rec).length;
    const okN = mAll ? +mAll[1] : items.filter((x) => x.ok).length, allN = mAll ? +mAll[2] : items.length;
    const req = items.filter((x) => !x.rec), rec = items.filter((x) => x.rec);
    const recOk = rec.filter((x) => x.ok).length;
    const pct = allN ? Math.round((okN / allN) * 100) : 0, allReq = reqOk >= reqN;
    const nx = (($(".v84m-nx b", s0) || {}).textContent || "").trim();
    const aiFill = () => { const b = document.getElementById("dk3wiz"); if (b) b.click(); else flash(s0); };
    const siteFill = () => clickText(w, /公式サイト/) || flash(RD.secBy(w, /ロゴ・商品写真/) || $("#sec-1", w));
    const fix = (x) => { if (x.el.matches("[data-dk3fix]")) x.el.click(); else { const d = $("details.rd-old", w); if (d) d.open = true; flash(x.el); } };
    const it = (x) => `<div class="k-it"><span style="color:${x.ok ? "var(--k-gr)" : x.rec ? "var(--k-bl)" : "#D25F00"}">${I(x.ok ? "check" : x.rec ? "plus" : "alert", 20, 2.6)}</span><span style="min-width:0"><b>${esc(x.n)}</b>${!x.ok && x.how ? `<small>${esc(x.how)}</small>` : ""}</span><span class="k-st ${x.ok ? "ok" : "ng"}">${x.ok ? "入力済み" : "未入力"}</span>${x.ok ? "<span></span>" : `<button type="button" class="k-btn ghost k-mini" ${act(() => fix(x))}>${I("edit", 14)}入力する</button>`}</div>`;
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps([{ t: "情報の充実度をチェック", s: "（この画面の上）", ic: "list", st: "on" }, { t: "不足情報を補う", ic: "edit", st: okN >= allN ? "done" : "", go: aiFill }, { t: "外国語の営業資料を生成", ic: "slides", go: () => flash(s3) }])}</section>
      <div class="k-grid" style="grid-template-columns:minmax(0,1.8fr) minmax(0,1fr)">
        <div style="min-width:0">
          <section class="k-card" style="display:flex;align-items:center;gap:22px;margin-bottom:18px;flex-wrap:wrap">
            <div class="k-ring" style="--p:${pct};--size:150px"><span><small>完成度</small>${pct}<small>%（${okN}/${allN}項目）</small></span></div>
            <div style="flex:1;min-width:240px"><h2 style="margin:0 0 6px;font-size:23px;font-weight:900;color:${allReq ? "var(--k-gr)" : "#D25F00"}">${allReq ? `${I("check", 24, 3)} 資料生成の準備が整っています！` : `あと ${reqN - reqOk} 項目で営業資料を作成できます`}</h2>
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#2A3B54">${allReq ? "必須項目はすべて入力済みです。推奨項目を足すほど、ページが増えて説得力が上がります。" : "下のオレンジ色の「未入力」の項目を入力すると、営業資料を作れるようになります。"}${nx ? `<br><b style="color:#C25600">次は：${esc(nx)}</b>` : ""}</p>
              <div class="k-chips"><span class="k-chip" style="background:#FFF4E8;border-color:var(--k-or-line)">${I("check", 16, 3)}必須項目 <b style="color:#D25F00">${reqOk} / ${reqN}</b></span><span class="k-chip" style="background:#F2F8FF;border-color:var(--k-bl-line)">${I("star", 16)}推奨項目 <b style="color:var(--k-bl)">${recOk} / ${rec.length}</b></span></div></div>
          </section>
          ${card({ ic: "list", t: "情報の入力状況", s: "（資料に掲載する項目・上の数と同じ）", b: `<div class="k-items"><div class="k-ig"><div class="k-igh req">必須<small>資料の基本情報</small></div><div>${req.map(it).join("")}</div></div>${rec.length ? `<div class="k-ig"><div class="k-igh rec">推奨<small>あると、より魅力が伝わる</small></div><div>${rec.map(it).join("")}</div></div>` : ""}</div>` })}
        </div>
        <div style="min-width:0">
          ${card({ ic: "spark", t: "不足している情報をかんたんに補完", b: `<div style="display:grid;gap:10px"><button type="button" class="k-row" ${act(aiFill)}><span style="color:var(--k-or)">${I("spark", 26)}</span><span class="k-rt"><b>AI商社マンと埋める</b><small>不足項目の下書きを AI が作ります</small></span>${I("chevR", 18, 2.4)}</button><button type="button" class="k-row" ${act(siteFill)}><span style="color:var(--k-bl)">${I("link", 26)}</span><span class="k-rt"><b>公式サイトから取り込み</b><small>会社情報・商品写真を Web サイトから</small></span>${I("chevR", 18, 2.4)}</button></div>` })}
          ${card({ ic: "bulb", t: "より良い資料にするためのポイント", b: `<ul class="k-ck"><li class="ok">${I("check", 16, 3)}<span>商品の強みは、できるだけ具体的な数値や実績で書きましょう</span></li><li class="ok">${I("check", 16, 3)}<span>写真は商品の特徴がわかる高品質な画像を3枚以上入れましょう</span></li><li class="ok">${I("check", 16, 3)}<span>認証・規格（ISO・HACCP など）があると、海外のバイヤーに安心感を与えられます</span></li></ul>` })}
          <button type="button" class="k-btn big wide" ${act(() => flash(s3))}>${I("slides", 22)}外国語の営業資料を生成する ${I("arr", 20, 2.4)}</button>
          <p class="rd-note" style="text-align:center">${allReq ? "下の「営業資料を作る」で、言語と相手の国を選んで作ります。" : "必須の項目がそろうと作れます。"}</p>
        </div>
      </div>`);
    fold(w, [s0], "詳しい点検（これまでの「納品レベルチェック」の表示・同じ項目）", "list");
  };

  /* ───── 商談・バイヤー（deal） ───── */
  RD.page.deal = (w) => {
    const th = threads(), c = (re) => th.filter((x) => re.test(RD.stShort(x.st))).length;
    const rec = byText(w, /商談を記録する/);
    const cmpB = byText(w, /以前との違い/);
    if (cmpB) cmpB.style.display = "none"; // 引き算：営業説明用の比較
    put(w, `<section class="k-card" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:16px;padding:14px 20px">
        <div style="display:flex;align-items:center;gap:8px">${I("chart", 24)}<b style="font-size:18px">商談の状況</b><span class="k-hs">（やり取り中の相手）</span></div>
        ${[["hand", "商談中", c(/^(商談中|サンプル出荷)$/), "bl"], ["doc", "提案済み（見積提示）", c(/^見積提示$/), "or"], ["target", "受注見込み（契約交渉）", c(/^契約交渉$/), "pu"], ["check", "取引中", c(/^取引中$/), "gr"]].map((x) => `<span style="width:1px;height:40px;background:var(--k-line)"></span><div style="display:flex;align-items:center;gap:10px"><span style="color:var(--k-${x[3]})">${I(x[0], 28)}</span><div><small style="display:block;font-size:13px;font-weight:800;color:#2A3B54">${esc(x[1])}</small><b style="font-size:28px;font-weight:900">${x[2]}</b><b> 社</b></div></div>`).join("")}
      </section>
      <div class="k-ai"><img src="${IMG}robot.png" alt=""><div><span class="k-tag orf" style="margin-bottom:4px">次のアクション</span><b style="display:block">商談を記録して、商談の進み具合を更新しましょう！</b><span class="k-ais">${I("check", 14, 3)} バイヤーの反応を記録 → ${I("check", 14, 3)} 提案の内容を登録 → ${I("check", 14, 3)} 受注見込みに更新</span></div>${rec ? `<button type="button" class="k-btn big" ${act(() => rec.click())}>${I("plus", 20, 2.6)}商談を記録する</button>` : ""}</div>`);
  };

  /* ───── 規制を調べる（ops:reg）：選択中の輸出先 ───── */
  RD.page["ops:reg"] = (w) => {
    const ch = chosenCty(), tg = T().targets || [];
    const L = ch.length ? ch : tg;
    put(w, `<section class="k-card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:12px 18px">${I("pin", 22)}<b style="font-size:16px">${ch.length ? "選択中の輸出先（仕向け国）" : "進出希望国（まだ販売先国は確定していません）"}</b><div class="k-chips">${L.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}</span>`).join("")}</div><span class="k-hs">計 <b style="font-size:20px;color:#E06A06">${L.length}</b> か国</span><button type="button" class="k-btn white k-mini" style="margin-left:auto" ${act(() => goKey("cty"))}>${I("edit", 14)}輸出先を変更</button></section>`);
  };

  /* ───── やりとり（msg）：まずやること・メールの取り込み・概要 ───── */
  RD.page.msg = (w) => {
    const th = threads();
    const lastW = (x) => (x.last && x.last.w) || "";
    const need = th.filter((x) => lastW(x) === "by" && !/^(失注|取引中)$/.test(RD.stShort(x.st))).length;
    const wait = th.filter((x) => lastW(x) === "me").length;
    const nego = th.filter((x) => /^(商談中|サンプル出荷|見積提示|契約交渉)$/.test(RD.stShort(x.st))).length;
    const quote = th.filter((x) => /^(見積提示|契約交渉)$/.test(RD.stShort(x.st))).length;
    const imp = byText(w, /メールを取り込む/);
    const list = orig(w, ".g2")[0];
    put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "check", t: "まずやること", s: "新しいメッセージを確認し、必要な対応を進めましょう", b: steps([{ t: `返信が要るメッセージを確認（${need}件）`, ic: "mail", st: need ? "on" : "done", go: () => flash(list) }, { t: "返信・共有・社内連携", s: "（対応を進める）", ic: "share", go: () => flash(list) }, { t: "対応を完了にする", s: "（状況を更新）", ic: "check", go: () => flash(list) }]) })}
        ${card({ ic: "mail", t: "メールを取り込む", s: "取引先とのメールを取り込んで整理します", cls: "warm", b: imp ? `<button type="button" class="k-btn wide" ${act(() => imp.click())}>${I("upload", 18)}メールを取り込む</button>` : `<div class="k-empty">この画面では使えません</div>` })}
      </div>
      ${card({ ic: "inbox", t: "受信箱の概要", s: "今の状況がすぐわかります（直接連絡のやりとり）", st: "margin-bottom:18px", b: tiles([{ ic: "alert", l: "要対応（相手から返信）", n: need, u: "件", cls: need ? "hot" : "", go: () => flash(list) }, { ic: "clock", l: "返信待ち", n: wait, u: "件", go: () => flash(list) }, { ic: "chat", l: "商談中〜契約交渉", n: nego, u: "件", cls: "gr", go: () => goKey("deal") }, { ic: "doc", l: "見積・契約の段階", n: quote, u: "件", cls: "or", go: () => goKey("deal") }]) })}`);
  };

  /* ───── ドキュメント（docs） ───── */
  RD.page.docs = (w) => {
    // 今の版の「アップロード」は <label> の中の隠れたファイル選択（#d30up）＝そのファイル選択を開く（11/11 の総点検で、押しても反応しなかった）
    const upIn = $("#d30up", w) || orig(w, "input[type=file]")[0];
    const up = upIn ? { click: () => upIn.click() } : byText(w, /アップロード/, "button, a, label"), ln = byText(w, /リンクを登録/), rq = byText(w, /提出を依頼/);
    const wrap = $("#d30wrap", w);
    const vis = {};
    if (wrap) { const ths = $$("th", wrap).map((x) => (x.textContent || "").trim()); const ci = ths.findIndex((x) => /公開範囲/.test(x)); if (ci >= 0) $$("tbody tr", wrap).forEach((tr) => { const td = tr.children[ci]; const v = td ? (td.textContent || "").replace(/\s+/g, "").trim() : ""; if (v) vis[v] = (vis[v] || 0) + 1; }); }
    const visE = Object.entries(vis);
    put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "check", t: "このページでできること", s: "書類の登録・依頼・共有を、かんたんに行えます", b: steps([{ t: "ファイルをアップロード", s: "PCから書類を登録", ic: "upload", st: "on", go: () => up && up.click() }, { t: "リンクを登録", s: "クラウド等の共有リンク", ic: "link", go: () => ln && ln.click() }, { t: "提出を依頼", s: "社内外に書類を依頼", ic: "send", go: () => rq && rq.click() }, { t: "共有・公開を設定", s: "公開範囲を管理", ic: "users", go: () => flash(wrap) }]) })}
        <section class="k-card warm" style="border-style:dashed;border-width:2px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">${I("upload", 44, 1.6)}<b style="font-size:20px;font-weight:900">ファイルをアップロード</b><span class="k-hs">PDF・Excel・Word・画像など（1件 20MB まで）</span><button type="button" class="k-btn" ${act(() => up && up.click())}>${I("folder", 18)}アップロードする</button></section>
      </div>
      ${visE.length ? card({ ic: "chart", t: "公開範囲の状況", s: `（${visE.reduce((a, b) => a + b[1], 0)}件）`, st: "margin-bottom:18px", b: tiles(visE.slice(0, 4).map(([k, n], i) => ({ ic: /社外|共有/.test(k) ? "share" : /非公開|自分/.test(k) ? "lock" : "users", l: k, n, u: "件", cls: ["gr", "", "or", "pu"][i] }))) }) : ""}`);
  };

  /* ───── 契約書関連（legal）：3つの流れ ───── */
  RD.page.legal = (w) => {
    const c1 = $("#legconsult", w), g2 = orig(w, ".g2")[0];
    const c2 = g2 && g2.children[0], c3 = g2 && g2.children[1];
    put(w, card({ ic: "check", t: "契約書対応の3つの流れ", s: "状況に合わせて、次のいずれかを選んで進めましょう", st: "margin-bottom:18px", b: steps([{ t: "AI法務に相談する", s: "契約の内容・リスク・進め方など、まずは気軽に相談", ic: "chat", st: "on", go: () => flash(c1) }, { t: "ひな型が来ない → AI法務が起草", s: "相手からドラフトがない場合", ic: "edit", go: () => flash(c2 || g2) }, { t: "契約書をチェックに出す", s: "届いた契約書のリスク・修正点を AI が確認", ic: "shield", go: () => flash(c3 || g2) }]) }));
  };

  /* ───── タスク・進行（task）：状況・次にやること ───── */
  RD.page.task = (w) => {
    let all = [];
    try { all = (taskStats() || {}).all || []; } catch (e) { all = []; } // eslint-disable-line no-undef
    if (!all.length) return;
    const td = today();
    const open = all.filter((x) => !/^(完了|中止)$/.test(x.st));
    const over = open.filter((x) => x.e && x.e < td);
    const late = open.filter((x) => x.st === "未着手" && x.s && x.s < td);
    const in7 = open.filter((x) => { const d = RD.dayDiff(x.e); return d != null && d >= 0 && d <= 7; });
    const done = all.filter((x) => x.st === "完了").length, doing = all.filter((x) => x.st === "対応中").length;
    const rate = all.length ? Math.round((done / all.length) * 100) : 0;
    const pri = open.slice().sort((a, b) => (a.e || "9") < (b.e || "9") ? -1 : 1).slice(0, 5);
    const listC = orig(w, ".c").find((c) => /タスク（/.test(c.textContent || ""));
    const ph = orig(w, ".ph")[0];
    const btns = ph ? $$("button", ph).filter((b) => /新規作成|まとめて作成|AIにタスク|定型セット/.test(b.textContent || "")) : [];
    const box = put(w, `${card({ ic: "cal", t: "タスク全体の状況", s: "（すべての案件）", st: "margin-bottom:16px", b: tiles([{ ic: "list", l: "総タスク数", n: all.length, u: "件" }, { ic: "refresh", l: "対応中", n: doing, u: "件" }, { ic: "check", l: "完了", n: done, u: "件", cls: "gr" }, { ic: "alert", l: "期限切れ", n: over.length, u: "件", cls: over.length ? "rd" : "" }, { ic: "clock", l: "期限7日以内", n: in7.length, u: "件", cls: "or" }, { ic: "target", l: "完了率", n: rate, u: "%" }], 6) })}
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">
        ${card({ ic: "chart", t: "タスクの完了状況", b: `<div style="display:flex;justify-content:center"><div class="k-ring" style="--p:${rate};--size:170px"><span><small>タスク完了率</small>${rate}<small>%</small></span></div></div>` })}
        ${card({ ic: "alert", t: "タスクの状況", s: "（件数）", b: '<div class="k-vt">' + tiles([{ ic: "alert", l: "期限切れ（対応必須）", n: over.length, u: "件", s: "すぐに対応が必要です", cls: over.length ? "crit" : "", go: () => flash(listC) }, { ic: "clock", l: "開始が遅れている", n: late.length, u: "件", s: "予定より遅れています", cls: late.length ? "hot" : "", go: () => flash(listC) }, { ic: "cal", l: "7日以内の予定", n: in7.length, u: "件", s: "期限が近づいています", go: () => flash(listC) }], 3) + "</div>" })}
      </div>
      ${btns.length ? `<section class="k-card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding:14px 20px" id="k-tkmk">${I("zap", 24)}<div><b style="font-size:17px;display:block">タスクを作成する</b><span class="k-hs">業務に合わせて、すぐにタスクを登録できます</span></div><div class="k-chips" style="margin-left:auto" id="k-tkbtn"></div></section>` : ""}
      ${card({ ic: "target", t: "次にやること", s: "（期限の近い順・優先タスク）", r: `<button type="button" class="k-link" ${act(() => flash(listC))}>すべてのタスクを見る（${open.length}件）${I("arr", 15)}</button>`, st: "margin-bottom:18px", b: `<div style="overflow-x:auto"><table class="rd-tbl"><thead><tr><th>優先度</th><th>タスク</th><th>関連・根拠</th><th>期限</th><th>担当</th></tr></thead><tbody>${pri.map((x, i) => { const d = RD.dayDiff(x.e); const lab = d == null ? ["予定", "gy"] : d < 0 ? ["期限切れ", "rdf"] : d <= 3 ? ["期限間近", "or"] : ["予定", "bl"]; return `<tr><td><span class="k-tag ${lab[1]}"><b>${i + 1}</b>　${lab[0]}</span></td><td><b>${esc(x.n)}</b></td><td>${esc(x.ref || "")}</td><td style="white-space:nowrap">${esc(x.e || "—")}${d == null ? "" : `<small style="display:block;color:${d < 0 ? "var(--k-rd)" : "var(--k-ink3)"};font-weight:700">${d < 0 ? -d + "日前" : "あと" + d + "日"}</small>`}</td><td>${esc(x.who || "")}</td></tr>`; }).join("")}</tbody></table></div>` })}`);
    const tb = $("#k-tkbtn", box);
    // 今のボタンそのものを、この枠へ移す（働きは同じ）
    if (tb) btns.forEach((b, i) => { b.classList.toggle("g", i > 0); b.dataset.rdorig = "1"; tb.appendChild(b); });
    const g4 = orig(w, ".g4")[0];
    if (g4) fold(w, [g4], "これまでの数字の表示（タスク消化率・残タスク数など）", "chart");
  };

  /* ───── メンバー・権限・セキュリティ（team） ───── */
  RD.page.team = (w) => {
    const main = orig(w, ".c").find((c) => /メンバー一覧/.test(c.textContent || ""));
    const sec = $("#v80sec", w);
    const txt = main ? main.textContent || "" : "";
    const n = (re) => { const m = txt.match(re); return m ? +m[1] : null; };
    const shared = /共通アカウント/.test(txt);
    put(w, `${shared ? `<section class="k-card warm" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:14px 20px">${I("users", 26)}<b style="font-size:16px">現在のアカウント：</b><span class="k-tag orf" style="font-size:14px">トライアル（共通アカウント）</span><span style="width:1px;height:30px;background:var(--k-line)"></span><span style="font-size:13.5px;font-weight:600;color:#2A3B54;flex:1;min-width:260px">複数の方で共有する体験用のアカウントです。メンバーの招待・詳しい権限の設定は、ご契約のアカウントで使えます。</span></section>` : ""}
      ${card({ ic: "users", t: "チームの概要", st: "margin-bottom:18px", b: tiles([{ ic: "users", l: "参加中のメンバー", n: n(/参加中\s*(\d+)/), u: "名" }, { ic: "mail", l: "招待中", n: n(/招待中\s*(\d+)/), u: "名", cls: "or" }, { ic: "lock", l: "停止中", n: n(/停止中\s*(\d+)/), u: "名" }, { ic: "box", l: "登録している商品", n: (G("TENS") || []).length, u: "商品", cls: "gr" }]) })}`);
    if (main && sec && !main.parentElement.classList.contains("k-team2")) {
      const g = document.createElement("div");
      g.className = "k-grid k-team2";
      g.style.gridTemplateColumns = "minmax(0,1.7fr) minmax(0,1fr)";
      main.before(g); g.appendChild(main); g.appendChild(sec);
      main.style.marginBottom = "0"; sec.style.marginBottom = "0";
    }
  };

  /* ───── ゴミ箱（trash） ───── */
  RD.page.trash = (w) => {
    const c = orig(w, ".c")[0];
    const empty = c && /ゴミ箱は空です/.test(c.textContent || "");
    put(w, card({ st: "margin-bottom:18px", b: `<div style="display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:center">
        <img src="${IMG}robot.png" alt="" style="width:180px;height:auto;-webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%)">
        <div><h2 style="margin:0 0 6px;font-size:26px;font-weight:900">${empty ? "ゴミ箱は空です" : "削除した資料や案件を、ここで元に戻せます"}</h2><p style="margin:0 0 14px;font-size:14.5px;font-weight:600;color:#2A3B54">削除した資料・案件などが、一定期間ここに保管されます。誤って削除した場合も、期間内であれば復元できます。</p>
          <div class="k-tiles" style="--n:3">${[["clock", "保管期間", "削除から30日"], ["refresh", "復元できる", "期間内なら元の一覧に戻せます"], ["list", "一括変更の取り消し", "まとめて変えた操作も戻せます"]].map((x) => `<div class="k-tile" style="padding:12px 14px"><span class="k-ti" style="width:40px;height:40px">${I(x[0], 20)}</span><span><span class="k-tl">${esc(x[1])}</span><span class="k-ts">${esc(x[2])}</span></span></div>`).join("")}</div></div></div>` }));
  };

  /* ───── 書類をつくる（ops:doc）・用語集（gloss）は見た目の決まり（rd2.css）でそろえる ───── */

  /* ───── 窓：ヘルプセンター・通知センター ───── */
  const GUIDE = [["s09", "upload", "資料（商品・営業資料）を登録する方法"], ["s28", "chat", "AI への質問のコツ（わからないときの対応）"], ["s13", "globe", "販売先国の選定と規制の調べ方"], ["s15", "slides", "外国語の営業資料をつくる方法"], ["s16", "users", "AIバイヤー開拓の進め方"], ["s21", "doc", "書類・ドキュメントの管理"]];
  function decoHelp(pn) {
    if ($(".k-helphd", pn)) return;
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    const hd = document.createElement("div");
    hd.className = "rd-x k-helphd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:110px;margin-bottom:12px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:96px"><div class="rd-ht"><h1 style="font-size:28px">ヘルプセンター（使い方ガイド）</h1><p>AI商社マンの使い方・困ったときの解決方法が、すぐに見つかります。</p></div></div>
      <div class="k-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px">
        <a class="k-card k-row" href="guide/" target="_blank" rel="noopener" style="text-decoration:none">${I("book", 30)}<span class="k-rt"><b>3分でわかるスタートガイド</b><small>はじめての方へ（別のタブで開きます）</small></span>${I("chevR", 18, 2.4)}</a>
        <button type="button" class="k-card k-row" ${act(() => { try { closeDW(); } catch (e) { /* 無視 */ } const s = document.getElementById("uxsearch"); if (s) s.click(); })}>${I("search", 30)}<span class="k-rt"><b>画面・操作を検索する</b><small>Ctrl＋K または ／</small></span>${I("chevR", 18, 2.4)}</button>
        <button type="button" class="k-card k-row" ${act(() => { const h = $$("h3, h4, b, p", pn).find((x) => /お問い合わせ/.test(x.textContent || "")); flash(h && (h.closest(".c") || h)); })}>${I("mail", 30)}<span class="k-rt"><b>お問い合わせ・サポート</b><small>担当の STANDAGE 営業・CS へ</small></span>${I("chevR", 18, 2.4)}</button>
      </div>
      <section class="k-card" style="margin-bottom:14px">${H({ ic: "star", t: "よく見られているヘルプ", sz: 18 })}<div class="k-rows">${GUIDE.map((g) => `<button type="button" class="k-row v40gb" data-s="${g[0]}" style="box-shadow:none;border-radius:14px!important;justify-content:flex-start">${I(g[1], 20)}<span class="k-rt"><b>${esc(g[2])}</b></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div></section>`;
    pn.prepend(hd);
  }
  function decoNotif(pn) {
    if ($(".k-ntfhd", pn)) return;
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    let L = [];
    try { L = notifCalc() || []; } catch (e) { L = []; } // eslint-disable-line no-undef
    const c = {}; L.forEach((n) => { c[n.cat] = (c[n.cat] || 0) + 1; });
    const NM = { msg: ["chat", "バイヤー・交渉"], today: ["list", "今日のタスク"], task: ["clock", "期限"], ship: ["ship", "出荷"], reg: ["shield", "規制"], doc: ["doc", "書類"] };
    const hd = document.createElement("div");
    hd.className = "rd-x k-ntfhd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:110px;margin-bottom:12px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:96px"><div class="rd-ht"><h1 style="font-size:28px">通知センター</h1><p>今すぐ対応すべきことを、ひと目で確認して進められます。</p></div></div>
      <section class="k-card" style="margin-bottom:14px">${H({ ic: "check", t: "今すぐ対応が必要なこと", sz: 18, r: `<span class="k-tag orf" style="font-size:14px">${L.length}件</span>` })}${tiles(Object.keys(c).map((k, i) => ({ ic: (NM[k] || ["bell"])[0], l: (NM[k] || [0, "そのほか"])[1], n: c[k], u: "件", cls: i === 0 ? "hot" : "" })), Math.min(4, Object.keys(c).length || 1))}</section>`;
    pn.prepend(hd);
  }
  const mo = new MutationObserver(() => {
    const pn = document.getElementById("pn"), dw = document.getElementById("dw");
    if (!pn || !dw || dw.dataset.open !== "true") { if (dw) dw.classList.remove("rd-wide"); return; }
    const t = pn.textContent || "";
    if (/ヘルプ・使い方/.test(t)) decoHelp(pn);
    else if (/通知センター/.test(t) && !/ヘルプ/.test(t.slice(0, 40))) decoNotif(pn);
    else if (!pn.querySelector(".k-qhd, .k-aahd, .k-helphd2")) dw.classList.remove("rd-wide");
  });
  const startMo = () => { const dw = document.getElementById("dw"); if (dw) mo.observe(dw, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-open"] }); else setTimeout(startMo, 400); };
  startMo();
  try { RD.after(true); } catch (e) { /* まだ描かれていない */ }
})();
