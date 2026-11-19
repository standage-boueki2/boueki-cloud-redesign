/* 21.99 ship：刷新版の層（見せ方）。中身は logic_v2199ship.js（window.V99SHIP）
   No.530（未解消・3回目）取り込みの %（商品情報の充足 c/21）と、旅程の全体 %（7ステップの平均）が同じ画面に並ぶ
     21.98 は言葉を分けただけで、同じ画面に「取り込み 48%」と「旅程 全体 10%」が並んだまま（UAT は数の違いを食い違いと読んだ）。
     → 意味の違う2つの % を同じ画面に並べない：
       ・現在地バーの見出しの % は「いまのステップ」の %（STEP 01 のときは商品情報の充足度＝取り込みの % と同じ数）。
         旅程全体は % で出さず「7ステップ中 N 完了」で出す（7ステップの平均の % は、見出し・内訳・説明・読み上げのどこにも出さない）。
       ・商品情報・商品情報を登録の輪の下の「旅程の全体 N% は7ステップの平均」の1行（21.98）は外し、「上のバーの STEP 01 と同じ数」に。
       ・バーの STEP 04「資料をつくる」の % は、営業資料の画面の「完成度」（納品レベルチェック 21項目）と同じ数にそろえる
         （21.98 までは「営業資料を作った」を足した 22項目で数え、同じ画面に 27% と 29% が並んだ）。「完了」の数は、資料を作ってから数える。
   No.551 荷主が開く「AI見積」の窓：届いた見積があるのに「物流会社の見積はまだ届いていません」と並ぶ
     原因：窓の上の要約（21.92 の decoQuote・fixQuoteDw）は、荷主の画面の会社名（FWDB.profile.co。本番は空）と同じ会社の見積だけを
           「届いた見積」に数え、札（物流会社の見積 n/m か国）はどの会社の見積でも数えていた。
     → 札と要約の文を同じ数（V99SHIP の v99sQuoteState：届いた・前の版の見積・依頼中）から作る。届いた見積は国・物流会社・形態・合計・日数・有効期限の表に。
   No.520（荷主側）小包（COURIER）の行：日数は地域の目安（物流会社の確認前）か「要確認」。COURIER の見積が無い依頼には取り方を1行で。
   No.550 規制の AI 詳細調査の「未完了」の箱（どこまで済んだか・続きから調べる・もう一度調べる・前回の結果と出典は残す）。
   インラインの onclick・style は使わない（CSP）。外から来た文字はエスケープする。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || window.__v99shipRd) return;
  window.__v99shipRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => (typeof v99sM === "function" ? v99sM(ja, en, zh, es) : ja);
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { if (typeof v99sErr === "function") v99sErr("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fwdOn = () => { try { return typeof FWDON !== "undefined" && !!FWDON; } catch (e) { return false; } }; // eslint-disable-line no-undef
  const setH = (el, h) => { if (el && el.innerHTML !== h) el.innerHTML = h; };
  const setT = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };

  /* ───── No.530 現在地バー ───── */
  function gate() { // 営業資料の画面の「完成度」と同じ数（納品レベルチェック）
    try {
      const G = typeof dk3Gate === "function" ? dk3Gate() : null; // eslint-disable-line no-undef
      if (!Array.isArray(G) || !G.length) return null;
      const rows = G.filter((g) => g && typeof g === "object");
      const ok = rows.filter((g) => (Array.isArray(g) ? g[5] : g.ok)).length;
      return { ok, all: rows.length, pct: rows.length ? Math.round((ok / rows.length) * 100) : 0 };
    } catch (e) { return null; }
  }
  function fill() { try { const t = ten(); return t && t.item && typeof v92prodFill === "function" ? v92prodFill(t) : null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function jny() {
    try {
      const R = RD._jny || (RD.jnyNow ? RD.jnyNow() : null);
      if (!R || !Array.isArray(R.S) || R.S.length !== 7) return null;
      R.S.forEach((s) => { if (s.v99orig == null) s.v99orig = s.pct; });
      const s4 = R.S[3];
      if (s4 && !s4.v99adj) { const g = gate(); if (g) { s4.v99adj = 1; s4.v99made = s4.it ? s4.it.some((x) => x && x.ok && /営業資料を作った/.test(String(x.t || ""))) : false; s4.pct = g.pct; s4.n = g.ok; s4.m = g.all; } }
      R.v99done = R.S.filter((s) => (s.v99orig != null ? s.v99orig : s.pct) >= 100).length;
      return R;
    } catch (e) { err("jny", e); return null; }
  }
  const SN = () => [M("商品", "Product", "商品", "Producto"), M("国", "Country", "国家", "País"), M("規制", "Rules", "法规", "Normas"), M("資料", "Deck", "资料", "Material"), M("商談", "Deals", "商谈", "Negocios"), M("契約", "Contract", "合同", "Contrato"), M("出荷", "Shipping", "出货", "Envío")];
  function fixBar() {
    try {
      const bar = document.getElementById("rdjny");
      if (!bar) return;
      const R = jny(); if (!R) return;
      const st0 = R.S[R.now] || R.S[0];
      const NMX = { "商品を整える": ["Prepare the product", "整理商品", "Preparar el producto"], "売る国を決める": ["Choose the countries", "确定销售国家", "Elegir los países"], "規制を確かめる": ["Check the regulations", "确认法规", "Verificar las normas"], "資料をつくる": ["Make the sales deck", "制作资料", "Crear el material"], "相手を探して商談": ["Find buyers and negotiate", "寻找买家并商谈", "Buscar compradores y negociar"], "見積・契約": ["Quote and contract", "报价・合同", "Cotización y contrato"], "書類・出荷・入金": ["Documents, shipping and payment", "单据・出货・收款", "Documentos, envío y cobro"] };
      const st = Object.assign({}, st0, { nm: NMX[st0.nm] ? M(st0.nm, NMX[st0.nm][0], NMX[st0.nm][1], NMX[st0.nm][2]) : st0.nm });
      const no = String(st.no).padStart(2, "0");
      const K = fill();
      // STEP 04 の札（輪・数・説明）
      const s4 = R.S[3], b4 = $('[data-jnys="3"]', bar);
      if (b4 && s4 && s4.v99adj) {
        const ring = $(".k-jny-ring", b4); if (ring) { ring.setAttribute("data-p", String(s4.pct)); ring.style.setProperty("--p", String(s4.pct)); }
        const pc = $(".k-jny-pc", b4); setH(pc, `<b>${s4.pct}</b>%<span class="k-jny-cnt">${s4.n}/${s4.m}${E(M("項目", " items", "项", " ítems"))}</span>`);
        const tip = M(`STEP 04 資料をつくる：${s4.pct}%（${s4.n}/${s4.m}項目＝営業資料の画面の「完成度」と同じ数）${s4.v99made ? "・営業資料を作りました" : "・営業資料はまだ作っていません"}。押すと足りない所へ移ります`, `STEP 04 Deck: ${s4.pct}% (${s4.n}/${s4.m} items = same as “Completeness” on the deck screen)`);
        if (b4.title !== tip) b4.title = tip;
      }
      // 見出し：いまのステップの % と、7ステップ中 N 完了（平均の % は出さない）
      const now = $(".k-jny-now", bar);
      if (now) {
        let a = $(".v99s-all", now);
        if (!a) { a = document.createElement("span"); a.className = "v99s-all"; a.setAttribute("data-noi18n", "1"); const old = $(".k-jny-all", now); if (old) old.after(a); else now.appendChild(a); }
        setH(a, `<span class="v99s-pc">${E(M("このステップ", "This step", "本步骤", "Este paso"))} <b>${st.pct}</b>%</span><span class="v99s-cnt">${E(M(`7ステップ中 ${R.v99done} 完了`, `${R.v99done} of 7 steps done`, `7个步骤中完成 ${R.v99done} 个`, `${R.v99done} de 7 pasos hechos`))}</span>`);
        const t = M(`いま STEP ${no}「${st.nm}」：${st.pct}%（${st.n}/${st.m}${st.unit || "項目"}）。旅程の進みは、7ステップのうち 100% になったステップの数（${R.v99done}）で数えます。`, `Now STEP ${no}: ${st.pct}%. Journey progress = steps completed (${R.v99done} of 7).`);
        if (a.title !== t) a.title = t;
      }
      // 開いているとき：見出しの下の1行（% の平均は出さない）
      const open = !!$(".k-jny-route", bar);
      let p = $(".v99s-jb", bar);
      if (!open) { if (p) p.remove(); }
      else {
        if (!p) { p = document.createElement("p"); p.className = "v99s-jb"; p.setAttribute("data-noi18n", "1"); p.setAttribute("role", "note"); }
        const after = $(".v98m-jb", bar) || $(".k-jny-help", bar) || $(".k-jny-hd", bar);
        if (after && after.nextElementSibling !== p) after.after(p);
        const kTxt = K ? M(`商品情報の充足度（21項目中 ${K.c}項目）`, `product info completeness (${K.c} of 21 items)`, `商品信息完整度（21项中 ${K.c} 项）`, `completitud de la información (${K.c} de 21)`) : M("商品情報の充足度", "product info completeness");
        const s1 = R.S[0];
        setH(p, `<b class="v99s-jbf">${E(M(`旅程の進み：7ステップ中 ${R.v99done} 完了（いま STEP ${no}「${st.nm}」${st.pct}%）`, `Journey: ${R.v99done} of 7 steps done (now STEP ${no} “${st.nm}” ${st.pct}%)`, `旅程进度：7个步骤中完成 ${R.v99done} 个（当前 STEP ${no}「${st.nm}」${st.pct}%）`, `Ruta: ${R.v99done} de 7 pasos hechos (ahora PASO ${no} ${st.pct}%)`))}</b>`
          + `<span class="v99s-jbd">${E(M(`% はステップごとの数です。STEP 01「商品を整える」の ${s1.pct}% は、${kTxt}と同じ数です。STEP 04「資料をつくる」の % は、営業資料の画面の「完成度」と同じ数です。`, `Each % belongs to one step. STEP 01 ${s1.pct}% equals the ${kTxt}. STEP 04 % equals “Completeness” on the deck screen.`, `% 是每个步骤各自的数。STEP 01 的 ${s1.pct}% 与${kTxt}相同。STEP 04 的 % 与营销资料页面的“完成度”相同。`, `Cada % es de un paso. El PASO 01 ${s1.pct}% es igual a la ${kTxt}.`))}</span>`);
      }
      // 見方（？）の「全体＝7つの % の平均」
      const hp = $(".k-jny-help", bar);
      if (hp && !hp.dataset.v99s) {
        hp.dataset.v99s = "1";
        $$("b", hp).forEach((b) => { if ((b.textContent || "").trim() === "全体") { b.textContent = "旅程の進み"; const nx = b.nextSibling; if (nx && nx.nodeType === 3) nx.nodeValue = nx.nodeValue.replace(/^＝7つの % の平均。/, "＝7ステップのうち 100% になったステップの数（「7ステップ中 N 完了」。% の平均は出しません）。見出しの % は、いまのステップの % です。"); } });
      }
      // STEP の説明（開いたとき）
      const dn = $(".k-jny-det .k-jny-dn", bar);
      if (dn) {
        let t = String(dn.textContent || "");
        t = t.replace(/旅程の全体 % は、この STEP 01 を含む7ステップの平均です/, "旅程の進みは「7ステップ中 N 完了」で数えます（% の平均は出しません）");
        t = t.replace(/営業資料の納品レベルチェック（必須13・推奨8＝営業資料の画面の「完成度」と同じ）と、営業資料を作ったか/, "営業資料の画面の「完成度」と同じ数（納品レベルチェック 必須13・推奨8）。「営業資料を作った」は下の項目で見ます（作ると、このステップの完了に数えます）");
        setT(dn, t);
      }
      const dh = $(".k-jny-det .k-jny-dh b", bar), dp = $(".k-jny-det .k-jny-dp", bar);
      if (dh && dp && /^STEP 04/.test(dh.textContent || "") && s4 && s4.v99adj) setT(dp, `${s4.pct}%（${s4.n}/${s4.m}${M("項目", " items")}）`);
    } catch (e) { err("bar", e); }
  }
  /* 商品情報・商品情報を登録の輪の下の1行（21.98 の「旅程の全体 N% は…平均」は出さない） */
  function fixRings() {
    try {
      const w = document.getElementById("well"); if (!w) return;
      const K = fill();
      $$(".v98m-rn", w).forEach((p0) => {
        let p = p0.nextElementSibling && p0.nextElementSibling.classList.contains("v99s-rn") ? p0.nextElementSibling : null;
        if (!p) { p = document.createElement("p"); p.className = "v99s-rn"; p.setAttribute("data-noi18n", "1"); p0.after(p); }
        setT(p, M(`＝貿易の旅程の STEP 01「商品を整える」の %（上の現在地バーの STEP 01 と同じ数${K ? "・21項目中 " + K.c + "項目" : ""}）。`, `= STEP 01 “Prepare the product” of the trade journey (same number as STEP 01 in the bar above${K ? ", " + K.c + " of 21 items" : ""}).`, `＝贸易旅程 STEP 01「整理商品」的 %（与上方进度条的 STEP 01 相同${K ? "・21项中 " + K.c + " 项" : ""}）。`, `= PASO 01 de la ruta comercial (igual que el PASO 01 de la barra${K ? ", " + K.c + " de 21" : ""}).`));
      });
    } catch (e) { err("rings", e); }
  }

  /* ───── No.551・No.520 荷主の「AI見積」の窓 ───── */
  const yen = (n) => "¥" + (Math.round(+n || 0)).toLocaleString();
  function fixQuote() {
    try {
      if (fwdOn()) return;
      const pn = document.getElementById("pn"); const hd = pn && $(".k-qhd", pn);
      if (!hd) return;
      const id = ((pn.textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
      const F = (typeof FWDB !== "undefined" && FWDB) || {}; // eslint-disable-line no-undef
      const r = id && (F.reqs || []).find((x) => x && x.id === id);
      if (!r || typeof v99sQuoteState !== "function") return;
      const S = v99sQuoteState(r);
      const sig = id + "|" + S.legs.map((x) => [x.cty, x.ok ? 1 : 0, x.co, x.total, x.days, x.mode].join(":")).join(",") + "|" + (typeof v99sLang === "function" ? v99sLang() : "ja");
      // 札（物流会社の見積 n/m か国）
      $$(".k-tile", hd).forEach((t) => {
        const l = $(".k-tl", t), s = $(".k-ts", t), nEl = $(".k-tn", t);
        const lt = (l && l.textContent) || "";
        if (!/物流会社の見積|貴社の概算見積|Forwarder quotes/.test(lt)) return;
        t.setAttribute("data-noi18n", "1");
        setT(l, M(`物流会社の見積（${S.got}/${S.n}か国）`, `Forwarder quotes (${S.got}/${S.n} countries)`, `物流公司报价（${S.got}/${S.n}个国家）`, `Cotizaciones (${S.got}/${S.n} países)`));
        if (nEl) { const tx = Array.from(nEl.childNodes).find((n) => n.nodeType === 3); const v = S.got ? M(`${S.got}か国`, `${S.got}`, `${S.got}个国家`, `${S.got}`) : "—"; if (tx) { if (tx.nodeValue !== v) tx.nodeValue = v; } else setT(nEl, v); }
        setT(s, S.got ? (S.pend ? M(`届いています（依頼中 ${S.pend}か国）`, `received (${S.pend} still requested)`, `已收到（仍在请求 ${S.pend} 个）`, `recibidas (${S.pend} pendientes)`) : M("届いています・下の表で比べられます", "received — compare below", "已收到・可在下表比较", "recibidas — compare abajo")) : M("まだ届いていません（依頼中）", "not received yet (requested)", "尚未收到（请求中）", "aún no recibidas (solicitadas)"));
      });
      // 要約の箱（届いた見積）
      const card = $$(".k-card", hd).find((c) => { const h = $("h2, h3", c); return h && /届いた見積|見積の内訳（貴社のレート）|Quotes received/.test(h.textContent || ""); });
      if (!card || card.dataset.v99s === sig) return;
      card.dataset.v99s = sig;
      const h = $("h2, h3", card); setT(h, M("届いた見積", "Quotes received", "已收到的报价", "Cotizaciones recibidas"));
      const head = h.closest(".k-h") || h;
      let n = head.nextSibling; while (n) { const nx = n.nextSibling; n.remove(); n = nx; }
      const body = document.createElement("div"); body.className = "v99s-qsum"; body.setAttribute("data-noi18n", "1"); body.setAttribute("role", "status");
      const got = S.legs.filter((x) => x.ok), pend = S.legs.filter((x) => !x.ok);
      let html = `<p class="v99s-qline"><b>${E(S.got ? M(`${S.n}か国中 ${S.got}か国の見積が届いています`, `${S.got} of ${S.n} countries quoted`, `${S.n}个国家中已收到 ${S.got} 个`, `${S.got} de ${S.n} países con cotización`) : M(`物流会社の見積はまだ届いていません（${S.n}か国を依頼中）`, `No forwarder quote yet (${S.n} requested)`, `尚未收到物流公司的报价（请求中 ${S.n} 个）`, `Aún sin cotización (${S.n} solicitadas)`))}</b></p>`;
      if (got.length) {
        html += `<div class="v99s-qtw"><table class="rd-tbl v99s-qt"><thead><tr><th>${E(M("国", "Country", "国家", "País"))}</th><th>${E(M("物流会社", "Forwarder", "物流公司", "Transitario"))}</th><th>${E(M("形態", "Mode", "方式", "Modo"))}</th><th class="r">${E(M("合計", "Total", "合计", "Total"))}</th><th>${E(M("日数", "Days", "天数", "Días"))}</th><th>${E(M("有効期限", "Valid until", "有效期", "Válida hasta"))}</th></tr></thead><tbody>`
          + got.map((x) => `<tr><td>${E(x.cty)}</td><td>${E(x.co || "—")}${x.n > 1 ? `<small>${E(M(`（${x.n}社回答）`, ` (${x.n} replies)`))}</small>` : ""}</td><td>${E(x.cour ? M("小包（COURIER）", "Courier") : x.mode || "—")}</td><td class="r"><b>${E(yen(x.total))}</b></td><td>${E(x.days)}${x.old ? `<small class="v99s-old">${E(M("前の版の見積（日数は目安）", "quote from the previous version (days are estimates)"))}</small>` : ""}</td><td>${E(x.valid || "—")}</td></tr>`).join("")
          + `</tbody></table></div>`;
      }
      if (pend.length) html += `<p class="v99s-qpend">${E(M(`依頼中（まだ届いていない国）：${pend.map((x) => x.cty).join("・")}。物流会社がその区間のレートを登録すると届きます。`, `Still requested: ${pend.map((x) => x.cty).join(", ")}. Quotes arrive when a forwarder registers a rate for the lane.`, `请求中（尚未收到）：${pend.map((x) => x.cty).join("・")}。物流公司登记该航线费率后即可收到。`, `Pendientes: ${pend.map((x) => x.cty).join(", ")}.`))}</p>`;
      // No.520 小包（COURIER）の行
      const askC = /COURIER/i.test(String(r.mode || "")), notC = got.filter((x) => !x.cour);
      if (askC && notC.length) html += `<p class="v99s-qcour">${E(M(`小包（COURIER）で依頼しましたが、${notC.map((x) => x.cty).join("・")} は使える小包のレート（有効期限内）が無いため、ほかの輸送形態の見積です。`, `You asked for courier, but ${notC.map((x) => x.cty).join(", ")} has no valid courier rate, so another mode was quoted.`, `您申请了小包（COURIER），但 ${notC.map((x) => x.cty).join("・")} 没有有效的小包费率，因此是其他运输方式的报价。`, `Pidió courier, pero ${notC.map((x) => x.cty).join(", ")} no tiene tarifa courier vigente.`))}</p>`;
      html += S.cour ? `<p class="v99s-qcour">${E(M(`小包（COURIER）の見積：${S.cour}か国。日数は国際宅配便の地域の目安（物流会社の確認前）か「要確認」で、既定値の10日は出しません。`, `Courier quotes: ${S.cour}. Days are regional courier estimates (before the forwarder confirms) or “to be confirmed”; the default 10 days is not shown.`, `小包（COURIER）报价：${S.cour} 个。天数为国际快递的地区参考（物流公司确认前）或“待确认”，不显示默认的10天。`, `Cotizaciones courier: ${S.cour}. Los días son estimaciones regionales o «por confirmar».`))}</p>`
        : `<p class="v99s-qcour">${E(M("小包（COURIER）の見積は、国ごとの「🔁 再見積を依頼」で輸送形態を COURIER にすると取れます（日数は地域の目安・物流会社の確認前）。", "For a courier quote, use “🔁 Request a new quote” for a country and choose COURIER (days are regional estimates).", "如需小包（COURIER）报价，请在各国的“🔁 申请重新报价”中选择 COURIER（天数为地区参考）。", "Para una cotización courier, use «🔁 Pedir nueva cotización» y elija COURIER."))}</p>`;
      body.innerHTML = html;
      card.appendChild(body);
    } catch (e) { err("quote", e); }
  }
  let qt = 0;
  const qObs = () => { const dw = document.getElementById("dw"); if (!dw || dw._v99s) return; dw._v99s = 1; new MutationObserver(() => { clearTimeout(qt); qt = setTimeout(() => { fixQuote(); fixReg(); }, 220); }).observe(dw, { childList: true, subtree: true }); };
  qObs(); setTimeout(qObs, 1500);
  if (typeof openFwdQuote === "function") {
    const __oq99s = openFwdQuote;
    openFwdQuote = function () { const o = __oq99s.apply(this, arguments); try { setTimeout(fixQuote, 260); setTimeout(fixQuote, 700); } catch (e) { err("oq", e); } return o; }; // eslint-disable-line no-global-assign
  }

  /* ───── No.550 規制の AI 詳細調査：未完了の箱 ───── */
  function drawerC() { const h = $("#pn .dwhead h3") || $("#pn h3"); const m = h && (h.textContent || "").match(/🤖\s*(.+?)の最新規制 AI詳細調査/); return m ? m[1].trim() : ""; }
  function incHtml(c, kind) {
    const R = typeof v99sRun === "function" ? v99sRun(c) : null;
    const P = typeof v99sPrev === "function" ? v99sPrev(c) : { txt: "", cits: [], ts: "", h: "" };
    const el = R ? Date.now() - R.t0 : 0;
    const miss = P.txt && typeof v99sMissing === "function" ? v99sMissing(P.txt) : [];
    const doneH = P.txt ? ["①", "②", "③", "④", "⑤", "⑥"].filter((h) => miss.indexOf(h) < 0) : [];
    const att = R ? Math.max(1, R.att || 1) : 1;
    const head = kind === "fail" ? M(`未完了：${c}の AI 詳細調査は、エラーで止まりました`, `Incomplete: the AI research for ${c} stopped with an error`, `未完成：${c}的AI详细调查因错误而停止`, `Incompleta: la investigación de ${c} se detuvo por un error`)
      : M(`未完了：${c}の AI 詳細調査は、${typeof v99sDur === "function" ? v99sDur(el) : ""}たっても答えが返っていません`, `Incomplete: no answer for ${c} after ${typeof v99sDur === "function" ? v99sDur(el) : ""}`, `未完成：${c}的AI详细调查 ${typeof v99sDur === "function" ? v99sDur(el) : ""} 仍无回复`, `Incompleta: sin respuesta para ${c}`);
    const li = [
      M(`済んだこと：調査の依頼を送りました（Web 検索つき・${att}回目${R && R.cont ? "・続きから" : ""}）`, `Done: research request sent (with web search, attempt ${att})`, `已完成：已发送调查请求（含网络搜索・第${att}次）`, `Hecho: solicitud enviada (intento ${att})`),
      M(`まだのこと：今回の答え・出典（0件）${kind === "fail" && R && R.err ? "（" + R.err.slice(0, 80) + "）" : ""}`, `Not yet: this run's answer and sources (0)`, `尚未完成：本次的回答・来源（0件）`, `Pendiente: respuesta y fuentes (0)`),
      P.txt ? M(`残しているもの：前回の調査（${P.ts}）の見出し ${doneH.join("") || "なし"}・出典 ${P.cits.length}件${miss.length ? "（確かめられなかった見出し：" + miss.join("") + "）" : ""}`, `Kept: previous research (${P.ts}), sections ${doneH.join("") || "none"}, ${P.cits.length} source(s)`, `保留：上次调查（${P.ts}）的标题 ${doneH.join("") || "无"}・来源 ${P.cits.length} 件`, `Conservado: investigación anterior (${P.ts})`) : M("前回までの調査の結果はありません", "No previous research result", "没有以前的调查结果", "Sin resultados anteriores"),
    ];
    const contTxt = P.txt && miss.length && miss.length < 6 ? M(`続きから調べる（${miss.join("")} だけ）`, `Continue (${miss.join("")} only)`, `从中断处继续（仅 ${miss.join("")}）`, `Continuar (${miss.join("")})`) : M("続きから調べる", "Continue", "从中断处继续", "Continuar");
    const contNote = P.txt && miss.length && miss.length < 6 ? M(`「続きから調べる」は、前回確かめられなかった見出し（${miss.join("")}）だけを調べ、済んだ見出しと出典はそのまま残します。`, `“Continue” researches only ${miss.join("")} and keeps the finished sections and sources.`)
      : P.txt ? M("「続きから調べる」は、前回の答えで確かめられなかった見出しだけを調べ直します（前回の答えはすべて確かめ済みのため、新しい情報があるかを確かめます）。", "“Continue” re-checks only what the previous answer could not confirm.")
        : M("前回の答えが無いため、「続きから調べる」も最初から調べます。「もう一度調べる」は、いつでも最初から調べ直します。", "There is no previous answer, so “Continue” also starts from the beginning.");
    return `<div class="v99s-inc" role="alert" data-noi18n="1" data-v99inc="${E(c)}"><b class="v99s-inch">⚠ ${E(head)}</b><ul>${li.map((x) => `<li>${E(x)}</li>`).join("")}</ul>`
      + `<div class="v99s-incb"><button type="button" class="btn" data-v99cont="${E(c)}">${E(contTxt)}</button><button type="button" class="btn g" data-v99again="${E(c)}">${E(M("もう一度調べる", "Research again", "重新调查", "Investigar de nuevo"))}</button></div>`
      + `<small>${E(contNote)}</small></div>`
      + (P.h ? `<details class="v99s-prev" open data-noi18n="1"><summary>${E(M(`前回の調査（${P.ts}）の結果と出典 ${P.cits.length}件（残しています）`, `Previous research (${P.ts}) and ${P.cits.length} source(s) (kept)`, `上次调查（${P.ts}）的结果与来源 ${P.cits.length} 件（已保留）`, `Investigación anterior (${P.ts})`))}</summary><div class="v99s-prevb">${P.h}</div></details>` : "");
  }
  function paintInc(c, kind) {
    const o = document.getElementById("regaiO");
    if (!o || drawerC() !== c) return false;
    const box = $(".v99s-inc", o);
    if (box && box.getAttribute("data-v99kind") === kind) return true;
    if (kind === "stall") { o.innerHTML = incHtml(c, kind); }
    else { const old = $(".v99s-inc", o); if (old) old.remove(); const pv = $(".v99s-prev", o); if (pv) pv.remove(); o.insertAdjacentHTML("beforeend", incHtml(c, kind)); }
    const b = $(".v99s-inc", o); if (b) b.setAttribute("data-v99kind", kind);
    return true;
  }
  window.v99sPaintStall = function (c) {
    try {
      if (paintInc(c, "stall")) return;
      if (typeof toast === "function") toast(M(`${c}の規制の AI 詳細調査が、答えの返らないまま止まっています（未完了）。「規制を調べる」で${c}の「AI詳細調査」を開くと、続きから調べられます`, `The AI research for ${c} has stalled (incomplete). Open it from the regulation screen to continue.`)); // eslint-disable-line no-undef
    } catch (e) { err("stall", e); }
  };
  function fixReg() {
    try {
      const c = drawerC(); if (!c) return;
      const o = document.getElementById("regaiO"); if (!o) return;
      const R = typeof v99sRun === "function" ? v99sRun(c) : null;
      if (/調査に失敗しました/.test(o.textContent || "") && !$(".v99s-inc", o)) paintInc(c, "fail");
      else if (R && R.st === "stall" && $(".spin", o) && !$(".v99s-inc", o)) paintInc(c, "stall");
      // 未完了の箱は、いちばん上に（前の層が前回の結果の札を上に足しても、今回の状態を先に読めるように）
      // 箱がある間は、前の層が足した「前回の調べ方の札」などを隠す（前回の結果と出典は箱の下の「前回の調査」に残す）
      const box = $(".v99s-inc", o);
      if (box && o.firstElementChild !== box) o.insertBefore(box, o.firstElementChild);
      o.classList.toggle("v99s-incon", !!box);
    } catch (e) { err("reg", e); }
  }
  if (typeof regAIView === "function") {
    const __rv99s = regAIView;
    regAIView = function () { const o = __rv99s.apply(this, arguments); try { setTimeout(fixReg, 0); } catch (e) { err("rv", e); } return o; }; // eslint-disable-line no-global-assign
  }
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    const a = t.closest("[data-v99cont]"), b = t.closest("[data-v99again]");
    if (!a && !b) return;
    e.preventDefault(); e.stopPropagation();
    const c = (a || b).getAttribute(a ? "data-v99cont" : "data-v99again");
    try { if (a && typeof v99sRegContinue === "function") v99sRegContinue(c); else if (b && typeof v99sRegAgain === "function") v99sRegAgain(c); } catch (x) { err("btn", x); }
  }, true);

  /* ───── No.534 右下の札：営業資料の作成の「資料を開く」の知らせ（21.96・60秒）は、営業資料の画面に来たら閉じる
     （資料は目の前にあるのに、同じ画面に「資料を開く」が残り続けないように） ───── */
  let finAt = 0;
  function fixFin() {
    try {
      const d = document.getElementById("aiThink");
      const busy = (typeof AIT !== "undefined" && AIT && AIT.items && AIT.items.length) || (typeof DK3G !== "undefined" && DK3G && DK3G.run); // eslint-disable-line no-undef
      if (!d || !d.classList.contains("v96dk-fin") || busy || !(RD.curKey && RD.curKey() === "deck")) { finAt = 0; return; }
      if (!finAt) { finAt = Date.now(); return; }
      if (Date.now() - finAt < 1500) return;
      finAt = 0;
      d.classList.remove("on", "done", "v96dk-fin");
      const b = d.querySelector(".v96dk-open"); if (b) b.remove();
      try { AIT.hidden = 0; clearTimeout(AIT.hideT); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
      if (window.V99SHIP) V99SHIP.n.fin = (V99SHIP.n.fin || 0) + 1;
    } catch (e) { err("fin", e); }
  }

  /* ───── いつ直すか：描き直し（RD.after）・バーの中の変化・1秒ごと（変わったときだけ書く） ───── */
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { fixBar(); fixRings(); } catch (e) { err("after", e); } return r; };
  let raf = 0;
  const mo = new MutationObserver(() => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; fixBar(); fixRings(); }); });
  let moBar = null, moWell = null;
  setInterval(() => {
    if (document.hidden) return;
    try {
      const bar = document.getElementById("rdjny"), wl = document.getElementById("well");
      if (bar && bar !== moBar) { moBar = bar; mo.observe(bar, { childList: true, subtree: true }); }
      if (wl && wl !== moWell) { moWell = wl; mo.observe(wl, { childList: true, subtree: true }); }
      fixBar(); fixRings(); fixReg(); fixFin();
    } catch (e) { err("tick", e); }
  }, 700);
  window.v99sRdPaint = function () { fixBar(); fixRings(); fixQuote(); fixReg(); };
})();

/* No.534（まとめ役の統合試験で見つけた残り・11/20）：スマホ幅では、保存などの知らせ（#tst）が右下の札（#aiThink）と同じ場所に重なることがあった
   （全部の層を重ねると保存の終わる時刻がずれ、ホームなどほかの画面で「クラウドに保存しました」と「作成が終わりました」の札が重なる）。
   知らせが出ている間、札と重なるときは知らせを札の上へずらす（文言・出す時間は変えない）。 */
(function () {
  try {
    if (typeof toast !== "function") return;
    const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden" && +getComputedStyle(el).opacity > 0.05;
    let tm = 0;
    const place = () => {
      const t = document.getElementById("tst"), a = document.getElementById("aiThink");
      if (!t) return;
      /* 出始め（透明から変わっている途中）も「出ている」とみなす：toast() は style.opacity="1"、消すときは "0" にする */
      if (t.style.opacity === "0" && !(+getComputedStyle(t).opacity > 0.05)) { t.style.removeProperty("bottom"); return; }
      if (!(a && a.classList.contains("on") && vis(a))) { t.style.removeProperty("bottom"); return; }
      const ra = a.getBoundingClientRect(), rt = t.getBoundingClientRect();
      const hit = rt.left < ra.right && ra.left < rt.right && rt.top < ra.bottom && ra.top < rt.bottom;
      if (hit || t.style.getPropertyValue("bottom")) { const v = Math.max(0, Math.round(innerHeight - ra.top + 8)) + "px"; if (t.style.getPropertyValue("bottom") !== v) t.style.setProperty("bottom", v, "important"); }
    };
    /* 札（#aiThink）の大きさ・中身が変わったら、その場でずらし直す（小さい札→終わった知らせの大きい札 など。間をあけない） */
    let moOn = null;
    const mo = new MutationObserver(() => { try { place(); } catch (e) { } });
    const hook = () => { const a = document.getElementById("aiThink"); if (a && a !== moOn) { moOn = a; mo.disconnect(); mo.observe(a, { attributes: true, childList: true, subtree: true, characterData: true }); } };
    hook(); setInterval(hook, 1000);
    try { new ResizeObserver(() => { try { place(); } catch (e) { } }).observe(document.body); } catch (e) { }
    const __to99s = toast;
    toast = function () { // eslint-disable-line no-global-assign
      const r = __to99s.apply(this, arguments);
      try {
        clearInterval(tm); place();
        let n = 0;
        tm = setInterval(() => { try { place(); } catch (e) { } if (++n > 16) { clearInterval(tm); const t = document.getElementById("tst"); if (t && t.style.opacity === "0" && !(+getComputedStyle(t).opacity > 0.05)) t.style.removeProperty("bottom"); } }, 200);
      } catch (e) { try { (window.V99SHIP && V99SHIP.errs || []).push("tst " + String(e).slice(0, 80)); } catch (z) { } }
      return r;
    };
    /* 知らせを直接書き換える経路・札があとから大きくなる場合もあるので、知らせが見えている間は 250ms ごとに確かめる */
    setInterval(() => { try { const t = document.getElementById("tst"); if (t && (t.style.opacity !== "0" || +getComputedStyle(t).opacity > 0.05 || t.style.getPropertyValue("bottom"))) place(); } catch (e) { } }, 150);
  } catch (e) { try { (window.V99SHIP && V99SHIP.errs || []).push("tstwrap " + String(e).slice(0, 80)); } catch (z) { } }
})();
