/* 22.00 flow：刷新版の見せ方。中身は logic_v2200flow.js（window.V100FLOW）
   No.590 現在地バーの STEP03・「表で確かめる（国名）」の「済み」・規制の画面の国ごとの進み
     ・バー（rd_v94jny.js）は閉じた関数の stepsNow() の答えを RD._jny に入れてから描く。RD._jny に入れる時に、STEP03 を
       V100FLOW.step3()（国ごとの確かめの記録から数える）に差し替え、「いまここ」「抜け」「次の一手」を同じ手順で数え直す（同じ物を描くので
       バーの輪・%・項目の一覧・7ステップ中 N 完了〔v99 ship〕・見出しの %〔v99 ship〕が全部同じ数になる）。STEP04 の「営業資料を作った」も
       v100deckState（失敗・途中は作ったに数えない）にそろえる。何度通っても同じ結果（データから毎回数え直す）。
     ・「表で確かめる（国名）」は、その国を押した記録があるときだけ「済み」（前は、はじめの設定が1度済むとどの国でも「・済み」）。
       押すと、その国の記録を付ける（はじめの設定の受け口はそのまま通る）。
     ・規制の画面の「STEP 03 の進み（国ごと）」の箱：いまの国の項目（済み／未確認）と、押して済ませるボタン・取り消すボタン、
       ほかの確定した国の残り（押すとその国へ移る）。
   No.599 準備点（バイヤーの画面）：資料・規制の状態を、点と言葉の両方で出す（途中・下書き・失敗を分ける）
   インラインの onclick・style は使わない（CSP）。外から来た文字はエスケープする。 */
(function () {
  "use strict";
  const RD = window.RDX;
  const V = window.V100FLOW;
  if (!RD || !V || window.__v100flowRd) return;
  window.__v100flowRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = V.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { V.e("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const setT = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const setH = (el, h) => { if (el && el.__v100h !== h) { el.__v100h = h; el.innerHTML = h; } }; // 前に書いた文字と比べる（innerHTML は書き方が変わるため、比べると毎回書き直しになる）
  const toast = (s) => { try { const t = RD.G ? RD.G("toast") : (typeof window.toast === "function" ? window.toast : null); if (typeof t === "function") t(s); } catch (e) { /* 無視 */ } };
  const repaint = () => { try { if (RD.jnyPaint) RD.jnyPaint(true); } catch (e) { /* 無視 */ } };

  /* ══════ 現在地バー：RD._jny に入る時に STEP03・STEP04 を実態にそろえる ══════ */
  function fixR(R) {
    if (!R || !Array.isArray(R.S) || R.S.length !== 7) return R;
    const s3 = V.step3();
    const o3 = R.S[2];
    Object.keys(o3).forEach((k) => { if (!(k in s3) && !/^v99/.test(k)) delete o3[k]; });
    Object.assign(o3, s3);
    // STEP04：「営業資料を作った」は資料の実際の状態で（失敗・途中は作ったに数えない）
    try {
      const s4 = R.S[3]; const ds = window.v100deckState ? window.v100deckState(ten()) : null;
      if (s4 && ds && Array.isArray(s4.it)) {
        const x = s4.it.find((y) => y && /^営業資料を作/.test(String(y.t || "")) || (y && y.v100mk));
        if (x) {
          x.v100mk = 1;
          const made = ds.state === "draft" || ds.state === "final";
          x.ok = made;
          x.t = made ? (ds.state === "final" ? "営業資料を作った（納品レベル・" + ds.slides + "枚）" : "営業資料を作った（下書き・要修正" + (ds.slides ? "・" + ds.slides + "枚" : "") + "）")
            : ds.state === "failed" ? "営業資料の作成に失敗しました（もう一度作る）"
              : ds.state === "partial" ? "営業資料は途中まで（" + (ds.slides ? ds.slides + "枚・" : "") + "続きを作る）"
                : "営業資料を作る（相手の言語で）";
          s4.n = s4.it.filter((y) => y.ok).length; s4.m = s4.it.length; s4.pct = s4.m ? Math.round((s4.n / s4.m) * 100) : 0;
          s4.core = made;
        }
      }
    } catch (e) { err("s4", e); }
    // いまここ・抜け・次の一手（rd_v94jny の手順と同じ）
    const S = R.S;
    let now = 0; S.forEach((s, i) => { if (s.core) now = i; });
    if (S[now].core && S[now].pct >= 100 && now < S.length - 1) now++;
    S.forEach((s, i) => { s.now = i === now; s.gap = i < now && s.pct < 100; s.left = s.it.filter((x) => !x.ok).length; });
    R.now = now;
    R.all = Math.round(S.reduce((a, s) => a + s.pct, 0) / S.length);
    R.gaps = S.filter((s) => s.gap);
    R.nextStep = R.gaps[0] || (S[now].pct < 100 ? S[now] : S.slice(now + 1).find((s) => s.pct < 100)) || null;
    R.nextItem = R.nextStep ? R.nextStep.it.find((x) => !x.ok) : null;
    R.v100 = 1;
    return R;
  }
  V.fixR = fixR;
  /* 「いまここ」の札：文字を span に包む（スマホの狭い幅では、文字は読み上げ・画面の文字に残したまま見た目を船の印だけにする。CSS は rd_v100flow.css）
     アプリの最小の文字の大きさ（12px）の決まりで、4文字の札（約50px）が 375〜390px の STEP の幅（43〜45px）に入らないため */
  function wrapHere() {
    try {
      document.querySelectorAll("#rdjny .k-jny-here").forEach((h) => {
        if (h.querySelector(".v100f-herel")) return;
        Array.from(h.childNodes).forEach((n) => { if (n.nodeType === 3 && n.nodeValue.trim()) { const sp = document.createElement("span"); sp.className = "v100f-herel"; sp.textContent = n.nodeValue; n.replaceWith(sp); } });
        if (!h.getAttribute("title")) h.setAttribute("title", M("いまここ", "You are here", "当前位置", "Está aquí"));
      });
    } catch (e) { err("here", e); }
  }
  V.wrapHere = wrapHere;
  try {
    const d0 = Object.getOwnPropertyDescriptor(RD, "_jny");
    let cur = d0 && "value" in d0 ? d0.value : undefined;
    if (!d0 || d0.configurable) {
      Object.defineProperty(RD, "_jny", {
        configurable: true, enumerable: true,
        get() { return d0 && d0.get ? d0.get.call(RD) : cur; },
        set(v) { try { fixR(v); } catch (e) { err("fixR", e); } if (d0 && d0.set) d0.set.call(RD, v); else cur = v; try { queueMicrotask(wrapHere); } catch (e) { setTimeout(wrapHere, 0); } },
      });
      if (cur) try { fixR(cur); } catch (e) { /* 無視 */ }
    }
  } catch (e) { err("defJny", e); }
  if (typeof RD.jnyNow === "function" && !RD.jnyNow.__v100) {
    const j0 = RD.jnyNow;
    RD.jnyNow = function () { const R = j0.apply(this, arguments); try { fixR(R); } catch (e) { err("jnyNow", e); } return R; };
    RD.jnyNow.__v100 = 1;
  }

  /* ══════ 規制の画面 ══════ */
  const regScreen = () => { try { return !RD.locked() && !RD.isFwd() && curKey() === "ops:reg"; } catch (e) { return false; } };
  const ctySel = () => $$("select#rC").find(vis) || document.getElementById("rC");
  const ctyVal = () => { const s = ctySel(); return s ? String(s.value || "") : ""; };
  const chosen = () => { try { return V.chosenOf(ten()).chosen; } catch (e) { return []; } };
  const OKBTN = ".k-v95-regok, .k-r8b-regok";
  // 「表で確かめる（国名）」：押した記録のある国だけ「済み」
  function fixOkBtn() {
    $$(OKBTN).forEach((b) => {
      const c = ctyVal(); if (!c) return;
      const R = V.rec(c);
      const t = R.tbl ? M("✓ 表で確かめた（" + c + "）・済み " + R.tbl, "✓ Table reviewed (" + c + ") — done " + R.tbl, "✓ 已确认法规表（" + c + "）・完成 " + R.tbl, "✓ Tabla revisada (" + c + ") — hecho " + R.tbl)
        : M("表で確かめる（" + c + "）・まだ確かめていません", "Review the table (" + c + ") — not reviewed yet", "查看法规表（" + c + "）・尚未确认", "Revisar la tabla (" + c + ") — aún sin revisar");
      setT(b, t);
      b.classList.toggle("is-done", !!R.tbl);
      b.classList.add("v100f-ok");
      const tip = R.tbl ? M(c + "の規制の表は " + R.tbl + " に確かめました。押すと表へ移ります（取り消しは下の「STEP 03 の進み」から）", "Reviewed on " + R.tbl + ". Press to jump to the table.")
        : M("押すと、" + c + "の「販売・出荷の前に必要な手続き」の表へ移り、" + c + "の表を確かめた記録を付けます（国ごと）", "Jumps to the table and records that you reviewed " + c + "’s table (per country)");
      if (b.title !== tip) b.title = tip;
      if (!b.__v100mo) { b.__v100mo = new MutationObserver(() => { if (!b.__v100busy) { b.__v100busy = 1; try { fixOkBtn(); } finally { b.__v100busy = 0; } } }); b.__v100mo.observe(b, { childList: true, characterData: true, subtree: true }); }
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest(OKBTN);
    if (!b) return;
    try {
      const c = ctyVal();
      if (c && chosen().indexOf(c) >= 0 && !V.rec(c).tbl) { V.setRec(c, "tbl", true); setTimeout(() => { paintReg(); repaint(); }, 120); }
    } catch (x) { err("okclick", x); }
  }, true);

  /* STEP 03 の進み（国ごと）の箱 */
  function itemRow(c, x) {
    const st = x.ok ? M("済み", "Done", "已完成", "Hecho") + (x.at ? " " + x.at : "") : x.k === "cond" ? M("該当するか未確認", "Not checked", "未确认", "Sin revisar") : x.k === "self" ? M(/未調査/.test(x.lb) ? "未調査" : "要確認", /未調査/.test(x.lb) ? "Not researched" : "Unconfirmed", /未調査/.test(x.lb) ? "未调查" : "待确认", /未調査/.test(x.lb) ? "Sin investigar" : "Por confirmar") : x.k === "ban" ? M("販売不可", "Cannot sell", "不可销售", "No vendible") : M("未確認", "Not checked", "未确认", "Sin revisar");
    let btn = "";
    const a = (act, lbl, extra) => `<button type="button" class="btn g v100f-b" data-v100f="${act}" data-c="${E(c)}"${extra || ""}>${E(lbl)}</button>`;
    if (x.k === "tbl") btn = x.ok ? a("untbl", M("確かめを取り消す", "Undo", "撤销确认", "Deshacer")) : a("tbl", M("表で確かめる（" + c + "）", "Review the table (" + c + ")", "查看法规表（" + c + "）", "Revisar la tabla (" + c + ")"));
    else if (x.k === "req") btn = a(x.ok ? "unreq" : "req", x.ok ? M("未対応に戻す", "Mark as not done", "恢复为未处理", "Marcar pendiente") : M("対応済みにする", "Mark as done", "标记为已处理", "Marcar hecho"), ` data-nm="${E(x.nm)}"`);
    else if (x.k === "x") btn = a(x.ok ? "unx" : "x", x.ok ? M("未対応に戻す", "Mark as not done", "恢复为未处理", "Marcar pendiente") : (x.lv === "conditional" || x.key === "sanc" ? M("確かめました（当たらない・用意する）", "Checked (not applicable / prepared)", "已确认（不适用・已准备）", "Verificado") : M("対応済みにする", "Mark as done", "标记为已处理", "Marcar hecho")), ` data-key="${E(x.key)}"`);
    else if (x.k === "xc") btn = a(x.ok ? "unxc" : "xc", x.ok ? M("取り消す", "Undo", "撤销", "Deshacer") : M("該非判定をしました（該非判定書あり）", "Classified (classification sheet ready)", "已完成判定（有判定书）", "Clasificado"));
    else if (x.k === "self") btn = (x.ok ? a("unself", M("取り消す", "Undo", "撤销", "Deshacer")) : a("self", M("確かめました（輸入者・専門家・公的な出どころ・AI 詳細調査で）", "Checked (with the importer, an expert, an official source or the AI research)", "已确认（向进口商・专家・官方来源・AI详细调查确认）", "Verificado (con el importador, un experto, fuente oficial o IA)"))) + a("ai", M("🤖 AIで最新規制を詳細調査", "🤖 AI research", "🤖 用AI详细调查", "🤖 Investigar con IA"));
    else if (x.k === "ban") btn = "";
    else if (x.k === "cond") { const ar = (v) => E(JSON.stringify([c, x.nm, v])); btn = `<button type="button" class="btn g v100f-b" data-act="v92ops.cond" data-args="${ar("y")}">${E(M("該当する", "Applies", "适用", "Aplica"))}</button><button type="button" class="btn g v100f-b" data-act="v92ops.cond" data-args="${ar("n")}">${E(M("対象外", "Not applicable", "不适用", "No aplica"))}</button>`; }
    return `<li class="${x.ok ? "ok" : "ng"} v100f-${x.k}"><span class="v100f-mk" aria-hidden="true">${x.ok ? "✓" : x.k === "ban" ? "⛔" : "□"}</span><span class="v100f-tx"><span class="v100f-lb">${E(x.lb)}</span> <span class="v100f-st">${E(st)}</span></span><span class="v100f-bs">${btn}</span></li>`;
  }
  function paintReg() {
    try {
      const old = document.getElementById("v100fReg");
      if (!regScreen()) { if (old) old.remove(); return; }
      const sec = document.getElementById("sec-0"); const rc = ctySel();
      if (!sec || !rc) { if (old) old.remove(); return; }
      const c = ctyVal();
      const S3 = V.step3();
      const ch = S3.chosen || [];
      let h;
      const head = (txt) => `<p class="v100f-rh"><b>${E(M("STEP 03 規制を確かめる", "STEP 03 Check the regulations", "STEP 03 确认法规", "PASO 03 Verificar normas"))}</b><span class="v100f-all">${E(txt)}</span></p>`;
      const allTxt = M(`全体 ${S3.n}/${S3.m}項目・${S3.pct}%（${ch.length}か国）`, `Overall ${S3.n}/${S3.m} items · ${S3.pct}% (${ch.length} countries)`, `整体 ${S3.n}/${S3.m} 项・${S3.pct}%（${ch.length} 个国家）`, `Total ${S3.n}/${S3.m} · ${S3.pct}% (${ch.length} países)`);
      if (!ch.length) h = head(M("販売先国がまだ確定していません（STEP 02）。確定した国ごとに、ここで確かめます", "No target countries confirmed yet (STEP 02).", "尚未确定销售国（STEP 02）。", "Aún no hay países confirmados (PASO 02)."));
      else if (ch.indexOf(c) < 0) h = head(allTxt) + `<p class="v100f-note">${E(M(c + "は販売先国に確定していないため、STEP 03 には数えません。", c + " is not a confirmed target country, so it does not count for STEP 03.", c + "不是已确定的销售国，不计入 STEP 03。", c + " no es un país confirmado; no cuenta para el PASO 03."))}</p>`;
      else {
        const s = S3.per[c] || V.ctyState(c);
        const doneC = s.n >= s.m && !s.ban;
        const xc = (S3.it || []).find((y) => y.k === "xc");
        h = head(allTxt) + (xc ? `<p class="v100f-ch"><b>${E(M("この商品（どの国にも）", "This product (any country)", "本商品（任何国家）", "Este producto (cualquier país)"))}</b></p><ul class="v100f-ul">${itemRow("_all", xc)}</ul>` : "") + `<p class="v100f-ch"><b>${E(c)}</b>：${E(M(`済んだ項目 ${s.n}/${s.m}`, `${s.n} of ${s.m} items done`, `已完成 ${s.n}/${s.m} 项`, `${s.n} de ${s.m} hechos`))}${doneC ? `<span class="v100f-cok">${E(M("この国は済み", "This country is done", "该国已完成", "País completado"))}</span>` : `<span class="v100f-cng">${E(M("この国はまだ済みではありません（下の □ が残り）", "Not done yet (□ items below remain)", "尚未完成（下方 □ 为剩余项）", "Aún no completado (quedan los □)"))}</span>`}</p>` +
          `<ul class="v100f-ul">${s.it.map((x) => itemRow(c, x)).join("")}</ul>`;
      }
      const others = ch.filter((x) => x !== c);
      if (others.length) h += `<p class="v100f-oth"><span>${E(M("確定したほかの国（押すとその国へ）：", "Other confirmed countries (press to switch):", "其他已确定的国家（点击切换）：", "Otros países confirmados (pulse para cambiar):"))}</span>` +
        others.map((o) => { const s = S3.per[o] || V.ctyState(o); const ok = s.n >= s.m && !s.ban; return `<button type="button" class="btn g v100f-go${ok ? " ok" : ""}" data-v100f="go" data-c="${E(o)}">${E(o)} ${s.n}/${s.m}${E(ok ? M("・済み", " · done", "・已完成", " · hecho") : M("・残り " + (s.m - s.n), " · " + (s.m - s.n) + " left", "・剩余 " + (s.m - s.n), " · faltan " + (s.m - s.n)))}</button>`; }).join("") + "</p>";
      h += `<p class="v100f-how">${E(M("「済み」は、確定した国ごとに ①表を確かめる ②表の必須の手続き ③書類の判断の表の必須（SDS など） ④未調査・要確認の確かめ が全部そろったときだけ付きます。上の現在地バーの STEP 03 と同じ数です。", "“Done” appears only when, for each confirmed country, (1) the table is reviewed, (2) the table’s required procedures, (3) required documents from the decision table (e.g. SDS) and (4) not-researched / unconfirmed points are all done. Same count as STEP 03 in the bar above.", "仅当每个已确定国家的 ①法规表 ②必需手续 ③文件判断表的必需项（SDS 等）④未调查・待确认项 全部完成时，才显示“完成”。与上方 STEP 03 的数相同。", "«Hecho» solo aparece cuando, por país, se completan (1) la tabla, (2) los trámites, (3) los documentos obligatorios (p. ej. SDS) y (4) los puntos sin investigar. Igual que el PASO 03 de la barra."))}</p>`;
      let box = old;
      if (!box) { box = document.createElement("div"); box.id = "v100fReg"; box.className = "v100f-reg"; box.setAttribute("data-noi18n", "1"); box.setAttribute("role", "region"); box.setAttribute("aria-label", M("STEP 03 規制を確かめる（国ごとの進み）", "STEP 03 progress by country", "STEP 03 各国进度", "Progreso del PASO 03 por país")); }
      const anchor = $(OKBTN, sec) || $(".k-r7b-reghint", sec) || rc.closest(".rw, .g2, p, div") || rc;
      if (anchor && anchor.parentNode && box.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", box);
      setH(box, h);
    } catch (e) { err("paintReg", e); }
  }
  V.paintReg = paintReg;
  function pickC(c) { const s = ctySel(); if (!s) return; const o = Array.from(s.options).find((x) => x.value === c || (x.textContent || "").trim() === c); if (o && s.value !== o.value) { s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); } }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest('#v100fReg [data-act="v92ops.cond"]'); if (b) setTimeout(() => { paintReg(); repaint(); }, 400); }, false);
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v100f]");
    if (!b) return;
    e.preventDefault();
    const act = b.getAttribute("data-v100f"), c = b.getAttribute("data-c") || "";
    try {
      if (act === "go") { pickC(c); setTimeout(() => { paintReg(); const x = document.getElementById("v100fReg"); if (x) try { x.scrollIntoView({ block: "center" }); } catch (y) { /* 無視 */ } }, 400); return; }
      if (act === "tbl") { const ob = $(OKBTN); if (ob && vis(ob)) { ob.click(); } else V.setRec(c, "tbl", true); toast(M(c + "の規制の表を確かめた記録を付けました（取り消せます）", "Recorded that you reviewed " + c + "’s table (you can undo)")); }
      else if (act === "untbl") { V.setRec(c, "tbl", false); toast(M(c + "の表の確かめを取り消しました", "Undone")); }
      else if (act === "self") { V.setRec(c, "self", true); toast(M(c + "：確かめた記録を付けました（取り消せます）", c + ": recorded as checked (you can undo)")); }
      else if (act === "unself") { V.setRec(c, "self", false); toast(M(c + "：確かめた記録を取り消しました", "Undone")); }
      else if (act === "x") { V.setRec(c, "x", true, b.getAttribute("data-key")); toast(M("対応済みにしました（取り消せます）", "Marked as done (you can undo)")); }
      else if (act === "unx") { V.setRec(c, "x", false, b.getAttribute("data-key")); toast(M("未対応に戻しました", "Marked as not done")); }
      else if (act === "xc") { V.setRec("_all", "xc", true); toast(M("該非判定をした記録を付けました（取り消せます）", "Recorded (you can undo)")); }
      else if (act === "unxc") { V.setRec("_all", "xc", false); toast(M("該非判定の記録を取り消しました", "Undone")); }
      else if (act === "req" || act === "unreq") { const nm = b.getAttribute("data-nm"); if (typeof v54rToggle === "function") v54rToggle(c, nm); else { const S = ten() && (ten().regReq = ten().regReq || {}); S[c] = S[c] || {}; if (act === "req") S[c][nm] = new Date().toLocaleString("ja-JP"); else delete S[c][nm]; } } // eslint-disable-line no-undef
      else if (act === "ai") { if (typeof regAIRun === "function") regAIRun(c); return; } // eslint-disable-line no-undef
    } catch (x) { err("act " + act, x); }
    setTimeout(() => { paintReg(); repaint(); }, 150);
  }, false);

  /* ══════ No.599 準備点の言葉（途中・下書き・失敗・未確認を分ける） ══════ */
  if (typeof v71obReadyHtml === "function") { // eslint-disable-line no-undef
    const __h = v71obReadyHtml; // eslint-disable-line no-undef
    v71obReadyHtml = function (run) { // eslint-disable-line no-global-assign
      let h = __h.apply(this, arguments);
      try {
        const R = typeof v71obReady === "function" && run && run.cty ? v71obReady(run.cty) : null; // eslint-disable-line no-undef
        if (!R || !R.v100) return h;
        const dl = { final: M("外国語営業資料（納品レベル）", "Sales deck (delivery level)"), draft: M("外国語営業資料（下書き・要修正）", "Sales deck (draft, needs fixes)"), partial: M("外国語営業資料（途中まで）", "Sales deck (partial)"), failed: M("外国語営業資料（作成に失敗）", "Sales deck (creation failed)"), none: M("外国語営業資料（まだ）", "Sales deck (not yet)") }[R.v100.deck];
        const rl = { done: M("規制調査（国の確かめ済み）", "Regulations (checked)"), part: M("規制調査（途中）", "Regulations (in progress)"), none: M("規制調査（未確認）", "Regulations (not checked)"), nores: M("規制調査（未確認）", "Regulations (not checked)") }[R.v100.reg];
        const dk = R.v100.deck === "final" || R.v100.deck === "draft", rg = R.v100.reg === "done";
        const span = (ok, part, txt, pts, max) => `<span class="v71rd${ok ? " ok" : ""}${part ? " v100f-part" : ""}">${ok ? "✓" : part ? "△" : "✕"} ${E(txt)} <small>${pts}/${max}${E(M("点", " pt"))}</small></span>`;
        h = String(h).replace(/<span class="v71rd[^"]*">[^<]*(規制調査|Regulation|法规|Regula)[^<]*<\/span>/, span(rg, R.v100.reg === "part", rl, R.v100.regPts, 8))
          .replace(/<span class="v71rd[^"]*">[^<]*(外国語営業資料|sales deck|Sales deck|营业资料|material)[^<]*<\/span>/i, span(dk && R.v100.deck === "final", R.v100.deck === "draft" || R.v100.deck === "partial", dl, R.v100.deckPts, 7));
      } catch (e) { err("readyHtml", e); }
      return h;
    };
  }

  /* ══════ いつ描くか ══════ */
  function apply() { try { if (regScreen()) { fixOkBtn(); paintReg(); } else { const o = document.getElementById("v100fReg"); if (o) o.remove(); } } catch (e) { err("apply", e); } }
  V.applyFlow = apply;
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); apply(); return r; };
  let t1 = 0;
  document.addEventListener("click", () => { clearTimeout(t1); t1 = setTimeout(apply, 500); }, false);
  document.addEventListener("change", (e) => { if (e.target && e.target.id === "rC") setTimeout(apply, 300); }, true);
  setInterval(() => { if (!document.hidden && regScreen()) { const o = document.getElementById("v100fReg"); if (!o) apply(); else fixOkBtn(); } }, 2000);
})();

/* ══════ No.534 保存の知らせ：受注内容の編集（PI の元）を保存したら、画面に残る1行も出す ══════
   原因：保存の知らせ（toast）は 2.2 秒で消え、読み上げ（role）も無い。UAT のエージェントが読む前に消えていた（直す前も知らせ自体は出ている）。
   直し：知らせの仕組み（位置・時間）はそのまま。#tst に role="status"（読み上げで届く）を付け、受注内容の編集・ステップのメモの保存のあとは、
         書類の画面・出荷の画面の上に「✓ 保存しました（時刻）：何を」の1行を残す（商品・案件が変わるか、30分たつか、次の保存まで）。
   No.551 見積の要約：AI見積の窓の「届いた見積」の箱に「見積の要約」の見出しと読み上げの名前（region）
   開示事項 物流会社への見積依頼（相見積）：送る前に、何を・どこへ・何社に送るかを見せて「依頼を送る／やめる」。体験用のアカウントは「体験用の依頼（3日で消えます）」
   No.602 PI の有効期限の決め方の1行と、ワンクリックでそろえるボタン・価格の有効期限より後の日付の知らせ */
(function () {
  "use strict";
  const RD = window.RDX, V = window.V100FLOW;
  if (!RD || !V || window.__v100flowRd2) return;
  window.__v100flowRd2 = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = V.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { V.e("rd2 " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const hm = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const toast = (s) => { try { if (typeof window.toast === "function") window.toast(s); } catch (e) { /* 無視 */ } };

  /* ── No.534 ── */
  function tstRole() { const t = document.getElementById("tst"); if (t && t.getAttribute("role") !== "status") { t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); } }
  const SAVED = { msg: "", uid: "", no: "", at: 0 };
  document.addEventListener("click", (e) => {
    const g = e.target && e.target.closest && e.target.closest("#seGo");
    if (!g) return;
    try {
      const S = dd() && dd().ship;
      const val = (id) => { const x = document.getElementById(id); return x ? String(x.value || "").trim() : ""; };
      const before = S ? { qty: String(S.qty || ""), unitPrice: String(S.unitPrice || ""), total: String(S.total || ""), term: String(S.term || ""), pay: String(S.pay || ""), buyer: String(S.buyer || "") } : {};
      const isOrder = !!document.getElementById("seQ");
      const after = isOrder ? { qty: val("seQ"), unitPrice: val("seU"), total: val("seT"), term: val("seI"), pay: val("seP"), buyer: val("seB") } : {};
      const LB = { buyer: M("お相手", "Buyer"), qty: M("数量", "Quantity"), unitPrice: M("単価", "Unit price"), total: M("合計", "Total"), term: M("取引条件", "Trade term"), pay: M("支払", "Payment") };
      const diffs = isOrder ? Object.keys(LB).filter((k) => after[k] && after[k] !== before[k]).map((k) => LB[k] + " " + (before[k] || "—") + " → " + after[k]) : [];
      SAVED.msg = isOrder
        ? M("✓ 受注内容を保存しました（" + hm() + "）" + (diffs.length ? "：" + diffs.join("／") : "（変更なし・メモを更新）") + "。見積書（PI）・請求書・梱包明細・AI商社マンの回答に入ります。",
          "✓ Order details saved (" + hm() + ")" + (diffs.length ? ": " + diffs.join(" / ") : " (no change; note updated)") + ". Reflected in the PI, invoice, packing list and AI answers.",
          "✓ 已保存订单内容（" + hm() + "）" + (diffs.length ? "：" + diffs.join("／") : "") + "。将反映到 PI・发票・装箱单和 AI 回答。",
          "✓ Pedido guardado (" + hm() + ")" + (diffs.length ? ": " + diffs.join(" / ") : "") + ". Se refleja en la PI, factura, lista de empaque y respuestas.")
        : M("✓ このステップの指示・メモを保存しました（" + hm() + "）。AI商社マンに引き継ぎます。", "✓ Step note saved (" + hm() + ").", "✓ 已保存此步骤的说明（" + hm() + "）。", "✓ Nota guardada (" + hm() + ").");
      SAVED.uid = String((ten() || {}).uid || ""); SAVED.no = String((S && S.no) || ""); SAVED.at = Date.now();
      setTimeout(paintSaved, 700); setTimeout(paintSaved, 1800);
    } catch (x) { err("seGo", x); }
  }, true);
  function paintSaved() {
    try {
      tstRole();
      const w = document.getElementById("well"); if (!w) return;
      const old = document.getElementById("v100fSaved");
      const S = dd() && dd().ship;
      const k = curKey();
      const okHere = SAVED.msg && SAVED.uid === String((ten() || {}).uid || "") && SAVED.no === String((S && S.no) || "") && /^(ops|ship|dash:case|deal)/.test(k) && Date.now() - SAVED.at < 30 * 60000;
      if (!okHere) { if (old) old.remove(); return; }
      let p = old;
      if (!p) { p = document.createElement("p"); p.id = "v100fSaved"; p.className = "v100f-saved"; p.setAttribute("role", "status"); p.setAttribute("aria-live", "polite"); p.setAttribute("data-noi18n", "1"); }
      const host = $("#dO", w) || $('[data-v92docs="edit"]', w) || $(".c", w) || w.firstElementChild;
      const anchor = host && host.id === "dO" ? host : (host && host.closest ? (host.closest(".c") || host) : host);
      if (anchor && anchor.parentNode && p.nextElementSibling !== anchor) anchor.parentNode.insertBefore(p, anchor);
      if (p.textContent !== SAVED.msg) p.textContent = SAVED.msg;
    } catch (e) { err("saved", e); }
  }
  V.paintSaved = paintSaved;

  /* ── No.551 ── */
  function fixQsum() {
    try {
      const pn = document.getElementById("pn"); if (!pn) return;
      $$(".k-card", pn).forEach((c) => {
        const h = $("h2, h3", c); if (!h) return;
        const t = (h.textContent || "").trim();
        if (!/^(届いた見積|見積の要約|Quotes received|Quote summary|已收到的报价|报价摘要|Cotizaciones recibidas|Resumen de cotizaciones)/.test(t) || !$(".v99s-qsum", c)) return;
        const nt = M("見積の要約（届いた見積）", "Quote summary (quotes received)", "报价摘要（已收到的报价）", "Resumen de cotizaciones (recibidas)");
        if (t !== nt) h.textContent = nt;
        if (!h.id) h.id = "v100fQsumH";
        c.setAttribute("role", "region"); c.setAttribute("aria-labelledby", h.id);
        // 22.00.1（v1 N12）：AI 交渉の記録は「提案できます（¥…）」なのに、要約は「まだ届いていません」（いまのレートでは届いた見積が無い）→ 食い違いの理由を同じ箱に書く
        try {
          const id = ((pn.textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
          const rq = id && typeof FWDB !== "undefined" ? (FWDB.reqs || []).find((x) => x && x.id === id) : null; // eslint-disable-line no-undef
          const sum = c.querySelector(".v99s-qsum");
          const none = sum && /まだ届いていません|not received yet|还没有收到|aún no/i.test(sum.textContent || "");
          const msgTxt = rq && Array.isArray(rq.msgs) ? rq.msgs.map((m) => String((m && (m.t || m.txt || m.html)) || "")).join(" ") : "";
          const said = /提案でき|ご提案|¥\s?[\d,]{3,}|￥\s?[\d,]{3,}/.test(msgTxt);
          let nt = c.querySelector(".v100f-qnote");
          if (rq && none && said) {
            if (!nt) { nt = document.createElement("p"); nt.className = "v100f-qnote"; nt.setAttribute("role", "note"); nt.setAttribute("data-noi18n", "1"); sum.appendChild(nt); }
            const t = M(`下の「AI 交渉の記録」は、この依頼を作ったとき（${rq.d || ""}・${rq.pol || ""}発）のやりとりで、そのときは提案がありました。いまは${rq.status ? "「" + rq.status + "」で、" : ""}有効なレート（見積）が無いため、届いた見積には数えていません。見積を取り直すときは、国ごとの「🔁 再見積を依頼」から（送る前に確かめます）。`,
              `The AI negotiation log below is from when this request was made (${rq.d || ""}, from ${rq.pol || ""}) and included offers then. There is no valid rate now${rq.status ? " (" + rq.status + ")" : ""}, so it is not counted as a received quote. Use “Request a new quote” to get a new one (you will be asked before sending).`);
            if (nt.textContent !== t) nt.textContent = t;
          } else if (nt) nt.remove();
        } catch (e) { err("qnote", e); }
      });
    } catch (e) { err("qsum", e); }
  }
  V.fixQsum = fixQsum;
  let qt = 0;
  const qObs = () => { const dw = document.getElementById("dw"); if (!dw || dw._v100f) return; dw._v100f = 1; new MutationObserver(() => { clearTimeout(qt); qt = setTimeout(fixQsum, 450); }).observe(dw, { childList: true, subtree: true, characterData: true }); };
  qObs(); setTimeout(qObs, 1500); setTimeout(qObs, 5000);

  /* ── 開示事項：相見積の依頼の前の確かめ ── */
  const trial = () => { try { const S = typeof SES !== "undefined" ? SES : null; return !!(S && (S.t === "trial" || S.demo || /TRIAL|DEMO/i.test(String(S.code || "")))); } catch (e) { return false; } }; // eslint-disable-line no-undef
  function planOf(opts) {
    const d = dd() || {}, t = ten() || {}, S = d.ship || {};
    let only = !!opts.only;
    try { if (!opts.cty && !only && typeof v56shipOn === "function" && v56shipOn() && S) only = true; } catch (e) { /* そのまま */ } // eslint-disable-line no-undef
    const nm = (c) => { try { return typeof cnorm === "function" ? cnorm(c) : c; } catch (e) { return c; } }; // eslint-disable-line no-undef
    const ctys = opts.cty ? [nm(opts.cty)] : [...new Set([S.country].concat(only ? [] : (t.targets || [])).flatMap((c) => String(c || "").split(/[・･、,\/／\s]+/)).filter(Boolean).map(nm))].slice(0, 5);
    let cos = 0; try { cos = typeof fwdCos === "function" ? fwdCos().length : 0; } catch (e) { cos = 0; } // eslint-disable-line no-undef
    return { item: d.item || t.item || "—", qty: S.qty || "", term: opts.term || S.term || d.term || "FOB", pol: S.pol || d.pol || "", mode: opts.mode || "LCL", cbm: opts.cbm || 2, ctys, cos, to: opts.co || "", requote: !!opts.requote };
  }
  function askBox(P) {
    return new Promise((res) => {
      try {
        const old = document.getElementById("v100fAsk"); if (old) old.remove();
        const box = document.createElement("div");
        box.id = "v100fAsk"; box.className = "v100f-ask"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "v100fAskH"); box.setAttribute("data-noi18n", "1");
        const li = (a, b) => `<li><b>${E(a)}</b>${E(b)}</li>`;
        box.innerHTML = `<div class="v100f-askin"><h3 id="v100fAskH">${E(M("物流会社に見積の依頼を送りますか？", "Send a quote request to forwarders?", "要向物流公司发送报价请求吗？", "¿Enviar la solicitud de cotización a los transitarios?"))}</h3>
          <p>${E(M("送ると、物流会社の見積受信箱に届き、AI物流マンとの見積の交渉が始まります。送った依頼は、この画面からは取り消せません。", "Once sent, it reaches the forwarders’ quote inboxes and the AI negotiation starts. It cannot be withdrawn from this screen.", "发送后会送达物流公司的报价收件箱，并开始与 AI 物流专员的报价谈判。发送后无法在此画面撤回。", "Al enviarla, llega a las bandejas de los transitarios y empieza la negociación con IA. No se puede retirar desde esta pantalla."))}</p>
          <ul class="v100f-askl">${li(M("何を：", "What: "), P.item + (P.qty ? "・" + P.qty : "") + "・" + P.term + (P.pol ? "（" + P.pol + "）" : "") + "・" + P.mode + "・" + P.cbm + "m³" + M("（容積の目安）", " (est. volume)"))}
            ${li(M("どこへ：", "To: "), P.ctys.join("・") || M("（国が未確定）", "(no country)"))}
            ${li(M("何社に：", "How many: "), P.to ? M(P.to + "（指名）", P.to + " (named)") : P.cos ? M("貿易クラウドに参加している物流会社 " + P.cos + "社の見積受信箱", P.cos + " participating forwarders") : M("貿易クラウドに参加している物流会社", "participating forwarders"))}
            ${P.requote ? li(M("種類：", "Type: "), M("再見積の依頼", "Request for a new quote")) : ""}
            ${P.resend ? li(M("種類：", "Type: "), M("送り直し（" + P.resend + " をそのまま送ります。新しい依頼は作りません）", "Resend of " + P.resend + " (no new request)")) : ""}</ul>
          ${trial() ? `<p class="v100f-asktr">${E(M("体験用の依頼です（体験用のアカウントの依頼は 3日で消えます）。体験用の物流会社の受信箱に届きます。", "This is a trial request (trial requests are deleted after 3 days). It goes to the trial forwarders’ inboxes.", "这是体验用的请求（体验账户的请求3天后删除）。", "Es una solicitud de prueba (se borra a los 3 días)."))}</p>` : ""}
          <div class="v100f-askb"><button type="button" class="btn" data-v100ask="yes">${E(M("依頼を送る", "Send request", "发送请求", "Enviar"))}</button><button type="button" class="btn g" data-v100ask="no">${E(M("やめる", "Cancel", "取消", "Cancelar"))}</button></div></div>`;
        document.body.appendChild(box);
        const done = (v) => { try { box.remove(); } catch (e) { /* 無視 */ } res(v); };
        box.addEventListener("click", (e) => { const b = e.target.closest("[data-v100ask]"); if (b) done(b.getAttribute("data-v100ask") === "yes"); else if (e.target === box) done(false); });
        box.addEventListener("keydown", (e) => { if (e.key === "Escape") done(false); });
        setTimeout(() => { try { const n = box.querySelector('[data-v100ask="no"]'); if (n) n.focus(); } catch (e) { /* 無視 */ } }, 30);
      } catch (e) { err("askBox", e); res(false); }
    });
  }
  V.fwdAsk = askBox; V.fwdPlan = planOf;
  if (typeof fwdRequest === "function" && !window.__v100fq) { // eslint-disable-line no-undef
    window.__v100fq = 1;
    const __fq = fwdRequest; // eslint-disable-line no-undef
    let inFlight = 0;
    fwdRequest = async function (opts) { // eslint-disable-line no-global-assign
      try {
        const fwdSide = (() => { try { return !!RD.isFwd(); } catch (e) { return false; } })();
        const d = dd();
        if (!fwdSide && !inFlight && d && d.ship) {
          const P = planOf(Object.assign({}, opts || {}));
          const ok = await askBox(P);
          if (!ok) { toast(M("見積の依頼は送っていません", "The quote request was not sent", "未发送报价请求", "No se envió la solicitud")); V.fwdLast = { asked: 1, sent: 0, P }; return; }
          V.fwdLast = { asked: 1, sent: 1, P };
        }
      } catch (e) { err("fwdAsk", e); }
      inFlight++;
      try { return await __fq.apply(this, arguments); } finally { inFlight--; }
    };
  }

  /* ── No.602 PI の有効期限の決め方 ── */
  if (typeof v92docValidNote === "function") { // eslint-disable-line no-undef
    const __vn = v92docValidNote; // eslint-disable-line no-undef
    v92docValidNote = function (S) { // eslint-disable-line no-global-assign
      try {
        const X = S && S.v92valid;
        if (!X || X.why === "exp" || !X.until) return __vn.apply(this, arguments);
        const b = (how, t) => `<button type="button" class="btn g v100f-pib" data-v100pi="${how}">${E(t)}</button>`;
        const codeTxt = X.code ? M("取引条件 " + X.code, "trade term " + X.code) : M("取引条件", "the trade term");
        let h = "", btn = "";
        if (X.why === "price-def" || X.why === "price-set") {
          h = M(`有効期限は <b>${E(X.until)}</b> までです（商品の価格の有効期限にそろえています${X.why === "price-def" ? "。" + E(codeTxt) + " は運賃を含まないため、既定で価格の有効期限を使います" : "（あなたが選びました）"}）。見積書の日付 ${E(X.date)} から30日なら ${E(X.d30)} です。`,
            `Valid until <b>${E(X.until)}</b> (aligned with the product’s price validity${X.why === "price-def" ? "; " + E(codeTxt) + " excludes freight" : " — your choice"}). 30 days from ${E(X.date)} would be ${E(X.d30)}.`);
          btn = b("d30", M("30日（" + X.d30 + " まで）にする", "Use 30 days (until " + X.d30 + ")"));
        } else if (X.why === "price") {
          h = M(`有効期限は <b>${E(X.until)}</b> までです（商品の価格の有効期限。見積書の日付 ${E(X.date)} から30日〔${E(X.d30)}〕より早いため、価格の有効期限が効きます）。`, `Valid until <b>${E(X.until)}</b> (price validity, earlier than 30 days from ${E(X.date)}).`);
        } else {
          const why = X.pu ? (X.freight ? M(E(codeTxt) + " は運賃を含み、運賃が変わるため30日にしています（運賃の見積の有効期限も確かめてください）", E(codeTxt) + " includes freight, which can change, so 30 days is used")
            : M("あなたが30日を選びました", "you chose 30 days")) : M("商品の価格の有効期限が未設定のため30日にしています", "price validity is not set, so 30 days is used");
          h = M(`有効期限は <b>${E(X.until)}</b> までです（見積書の日付 ${E(X.date)} から30日・${why}）。`, `Valid until <b>${E(X.until)}</b> (30 days from ${E(X.date)}; ${why}).`) + (X.pu ? M(`商品の価格の有効期限は ${E(X.pu)} です。`, ` Price validity: ${E(X.pu)}.`) : "");
          if (X.pu && X.pu > X.until) btn = b("price", M("価格の有効期限（" + X.pu + " まで）にそろえる", "Align with price validity (until " + X.pu + ")"));
          else if (!X.pu) btn = b("setpu", M("価格の有効期限を設定する", "Set price validity"));
        }
        if (X.pu && X.until > X.pu) h += ` <span class="v92doc-warn">${E(M("⚠ 有効期限が商品の価格の有効期限より後です。価格が変わるおそれがあります（要確認）。", "⚠ This is later than the price validity; prices may change (please check)."))}</span>`;
        return `<span data-v100pinote="1">${h}</span> ${btn}`;
      } catch (e) { err("validNote", e); return __vn.apply(this, arguments); }
    };
  }
  // 手で入れた Validity（受注内容の編集の追加の欄など）が価格の有効期限より後なら知らせる
  function piManualWarn() {
    try {
      const o = document.getElementById("dO"); if (!o) return;
      const S = dd() && dd().ship; const X = S && S.v92valid;
      let w = document.getElementById("v100fPiw");
      if (!S || !S.docRows || !Array.isArray(S.docRows.ex)) { if (w) w.remove(); return; }
      const row = S.docRows.ex.find((x) => x && x[0] === "Validity");
      const v = row ? String(row[1] || "") : "";
      const auto = !v.trim() || (X && v.trim() === String(X.en || "").trim()) || /^30 days \(until|^\[To be confirmed\]/.test(v.trim());
      const m = v.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      const ymd = m ? m[1] + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[3]).padStart(2, "0") : "";
      const pu = X && X.pu;
      if (auto || !ymd || !pu || ymd <= pu) { if (w) w.remove(); return; }
      if (!w) { w = document.createElement("p"); w.id = "v100fPiw"; w.className = "v100f-piw"; w.setAttribute("role", "alert"); w.setAttribute("data-noi18n", "1"); o.insertAdjacentElement("afterend", w); }
      const t = M(`⚠ 見積書の有効期限（${ymd}）が、商品の価格の有効期限（${pu}）より後です。価格が変わるおそれがあります。価格の有効期限を延ばすか、見積書の有効期限を ${pu} までにしてください。`, `⚠ The PI validity (${ymd}) is later than the price validity (${pu}).`);
      if (w.textContent !== t) w.textContent = t;
    } catch (e) { err("piw", e); }
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v100pi]");
    if (!b) return;
    e.preventDefault();
    try {
      const how = b.getAttribute("data-v100pi");
      const S = dd() && dd().ship;
      if (how === "setpu") { try { if (typeof v83pxEdit === "function") v83pxEdit(); else if (typeof go === "function") go("item"); } catch (x) { /* 無視 */ } return; } // eslint-disable-line no-undef
      V.piSet(S, how);
      try { if (S && typeof v92docValid === "function") { const X = v92docValid(S, ten()); S.v92valid = X; const r = S.docRows && S.docRows.ex && S.docRows.ex.find((x) => x && x[0] === "Validity"); if (r) r[1] = X.en; toast(M("見積書の有効期限を " + X.until + " までにしました", "PI validity set to " + X.until)); } } catch (x) { err("piset", x); } // eslint-disable-line no-undef
      try { if (typeof render === "function") render(); } catch (x) { /* 無視 */ } // eslint-disable-line no-undef
    } catch (x) { err("piclick", x); }
  }, false);

  function apply() { try { tstRole(); paintSaved(); fixQsum(); piManualWarn(); } catch (e) { err("apply2", e); } }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); apply(); return r; };
  setTimeout(apply, 1200);
})();

/* ══════ 楽観的な表示の総点検で見つけて直した所（規制） ══════
   ① 「規制を調べる」の画面の上のタブ（出荷までの流れ）：規制の表が1つでもあると「✓ 規制を調べる」（この段階は着手済みです）と出ていた（21.?? の vOps の包み）。
      → STEP03 が 100% のときだけ ✓。まだのときは番号「1」と「確かめ n/m 項目」。
   ② 商品情報（取り込み結果）の「調査済みの仕向国 N か国・関税率と必要書類を紐付け済み」：表のひな形があるだけの国を「調査済み」と数えていた。
      → 「規制を確かめた国 n か国」（国ごとの確かめが全部済んだ国）と「規制の表がある国 N か国（ひな形・概算）」に分けて書く。 */
(function () {
  "use strict";
  const RD = window.RDX, V = window.V100FLOW;
  if (!RD || !V || window.__v100flowRd3) return;
  window.__v100flowRd3 = 1;
  const M = V.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { V.e("rd3 " + k, e); } catch (x) { /* 記録だけ */ } };
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  if (typeof vOps === "function") { // eslint-disable-line no-undef
    const __vo = vOps; // eslint-disable-line no-undef
    vOps = function () { // eslint-disable-line no-global-assign
      let h = __vo.apply(this, arguments);
      try {
        const s3 = V.step3();
        const re = /(data-onclick="opsTab='reg';render\(\)"[^>]*><i) class="ok" title="[^"]*">✓(<\/i>)/;
        if (re.test(String(h))) {
          h = String(h).replace(re, (m0, a, b) => s3.pct >= 100
            ? `${a} class="ok" title="${E(M("確定した国の規制の確かめが全部済みました", "All regulation checks for the confirmed countries are done"))}">✓${b}`
            : `${a} title="${E(M(`規制の確かめ ${s3.n}/${s3.m}項目（まだ済みではありません）`, `Regulation checks ${s3.n}/${s3.m} (not done yet)`))}">1${b}`);
        }
      } catch (e) { err("vOps", e); }
      return h;
    };
  }
  function fixItem() {
    try {
      const w = document.getElementById("well"); if (!w) return;
      Array.from(w.querySelectorAll("p.lbl")).forEach((p) => {
        const t = (p.textContent || "").trim();
        if (!/^(調査済みの仕向国|Researched destinations|已调查的目的国|Destinos investigados|規制を確かめた国|Regulations checked)/.test(t)) return;
        const box = p.parentElement; if (!box) return;
        const d = dd() || {};
        const all = Object.keys(d.regs || {});
        const ch = V.chosenOf().chosen;
        const done = ch.filter((c) => V.ctyLevel(c).lv === "done");
        const nt = M("規制を確かめた国", "Regulations checked", "已确认法规的国家", "Normas verificadas");
        if (t !== nt) p.textContent = nt;
        const kv = box.querySelector(".kv"); if (kv) { const tx = Array.from(kv.childNodes).find((n) => n.nodeType === 3); const v = String(done.length); if (tx) { if (tx.nodeValue !== v) tx.nodeValue = v; } }
        const kd = box.querySelector(".kd");
        const nd = M(`規制の表がある国 ${all.length}か国（ひな形・概算）。確定した ${ch.length}か国のうち、確かめが全部済んだ国 ${done.length}か国${done.length ? "（" + done.join("・") + "）" : ""}。国ごとの確かめは「規制を調べる」で`,
          `${all.length} with a rough template table; ${done.length} of ${ch.length} confirmed countries fully checked`);
        if (kd && kd.textContent !== nd) { kd.textContent = nd; kd.setAttribute("data-noi18n", "1"); }
        box.setAttribute("data-v100regs", String(done.length));
      });
    } catch (e) { err("item", e); }
  }
  V.fixItem = fixItem;
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); fixItem(); return r; };
  setTimeout(fixItem, 1500);
})();

/* ══════ 22.00.1：N6 適合宣言の名前（規制の画面）・N11 PI の読み上げ・N12 進出希望国「指定なし」・N15 送り直しの知らせ ══════ */
(function () {
  "use strict";
  const RD = window.RDX, V = window.V100FLOW;
  if (!RD || !V || window.__v100flowRd4) return;
  window.__v100flowRd4 = 1;
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = V.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { V.e("rd4 " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  /* N6：規制の画面の「この商品と送り先で確かめる点」の適合宣言の名前を、送り先の国の制度名に */
  function fixConf() {
    try {
      const o = document.getElementById("rO"); if (!o) return;
      const sel = document.getElementById("rC"); const c = sel ? String(sel.value || "") : "";
      if (!c) return;
      const cc = typeof v85docCC === "function" ? v85docCC(c) : ""; // eslint-disable-line no-undef
      const d = dd() || {};
      const nm = V.confName(cc, d.hs || (ten() || {}).hs || "");
      { const tw = document.createTreeWalker(o, NodeFilter.SHOW_TEXT); let n; const hit = []; while ((n = tw.nextNode())) { if (n.nodeValue && n.nodeValue.indexOf(V.CONF_GENERIC) >= 0) hit.push(n); } hit.forEach((n) => { n.nodeValue = n.nodeValue.split(V.CONF_GENERIC).join(nm.ja); }); }
      $$("[data-v92pts] li > b, [data-v92pts] b", o).forEach((b) => {
        const t = (b.textContent || "").trim();
        if (t !== V.CONF_GENERIC && !(b.dataset.v100conf && t !== nm.ja)) return;
        if (t === nm.ja) return;
        b.textContent = nm.ja; b.dataset.v100conf = "1";
        if (nm.src && !b.parentElement.querySelector(".v100f-csrc")) b.insertAdjacentHTML("afterend", `<small class="v100f-csrc" data-noi18n="1">${E(M("出どころ：", "Source: ") + nm.src)}</small>`);
      });
    } catch (e) { err("conf", e); }
  }
  /* N11：「PI」「CI」「PL」の用語の印（abbr）は aria-label が文字の代わりに読まれ、読み上げのつなぎで「見積書（）」と抜けていた → 読み上げの名前は文字のまま、説明は title に */
  function fixAbbr() {
    try {
      $$("abbr.k-term[aria-label]").forEach((a) => {
        const k = String(a.dataset.kterm || a.textContent || "").trim();
        if (!/^(PI|CI|PL|S\/I|B\/L|AWB)$/.test(k)) return;
        const lab = a.getAttribute("aria-label"); a.removeAttribute("aria-label"); if (!a.title) a.title = lab;
      });
      const sv = document.getElementById("v100fSaved");
      if (sv && !sv.querySelector("[lang=en]") && /（PI）/.test(sv.textContent || "")) { const t = sv.textContent; sv.innerHTML = E(t).replace("（PI）", '（<span lang="en">PI</span>）'); }
    } catch (e) { err("abbr", e); }
  }
  /* N12：進出希望国「指定なし」の商品は、商品情報の「進出希望国 未登録」を「指定なし（AI に任せる）」に */
  function fixNone() {
    try {
      const t = ten(); if (!t || !(V.targetsNone && V.targetsNone(t))) return;
      const w = document.getElementById("well"); if (!w) return;
      const lbl = M("指定なし（AI に任せる・「販売先国の選定」で国を選びます）", "No preference (the AI suggests countries in “Choose target markets”)", "未指定（交给 AI・在“选择销售国家”中选择）", "Sin preferencia (la IA propone países)");
      // 「AIが使える状態か：一部・足りない情報：進出希望国」→ 指定なしと分かる言葉に（規制判定は国を確定すると使える）
      $$("span, b, small", w).forEach((el) => {
        if (el.dataset.v100none || el.children.length) return;
        if ((el.textContent || "").trim() !== "進出希望国") return;
        const pt = (el.parentElement && el.parentElement.textContent) || "";
        if (!/足りない情報/.test(pt)) return;
        el.textContent = M("販売先国（進出希望国は「指定なし」＝AI に任せる。「販売先国の選定」で国を確定すると規制判定が使えます）", "Target countries (no preference given; confirm countries in “Choose target markets” to enable regulation checks)", "销售国家（进出希望国为“未指定”。在“选择销售国家”中确定后可使用法规判定）", "Países de destino (sin preferencia; confírmelos para activar la revisión de normas)");
        el.dataset.v100none = "1";
      });
      $$("*", w).forEach((el) => {
        if (el.children.length > 3 || el.dataset.v100none) return;
        const t0 = (el.textContent || "").replace(/\s+/g, "");
        if (!/^進出希望国(必須)?$/.test(t0)) return;
        let v = el.nextElementSibling; if (!v && el.parentElement) v = el.parentElement.nextElementSibling;
        if (v && !v.dataset.v100none && /^(未登録|未入力|—|-|－|)$/.test((v.textContent || "").trim())) { v.textContent = lbl; v.dataset.v100none = "1"; }
      });
      $$("tr, li, .kv, div", w).forEach((el) => {
        if (el.children.length > 8) return;
        const tx = (el.textContent || "").replace(/\s+/g, "");
        if (!/^進出希望国/.test(tx) || !/未登録|未入力/.test(tx) || tx.length > 40) return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
        while ((n = walker.nextNode())) { if (/未登録|未入力/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/必須・未登録|未登録|未入力/, lbl); el.dataset.v100none = "1"; break; } }
      });
    } catch (e) { err("none", e); }
  }
  /* N15：「もう一度開くと送り直します」→ 開いただけでは送らない（コードと本番で確かめた）。「送り直す」を押して確かめてから送る */
  function fixDeliv() {
    try {
      const n = document.querySelector("#pn .v69fdeliv"); if (!n || n.dataset.v100) return;
      if (!/送れませんでした/.test(n.textContent || "")) return;
      n.dataset.v100 = "1";
      const why = ((n.textContent || "").match(/（([^）]*)）/) || [])[1] || "";
      n.innerHTML = "📬 " + E(M("この依頼は、まだ体験用の物流会社の画面に届いていません（通信：" + why + "）。この画面を開いただけでは送りません。", "This request has not reached the trial forwarder yet (" + why + "). Opening this window does not send it.", "此请求尚未送达体验用物流公司（" + why + "）。仅打开此画面不会发送。", "La solicitud aún no llegó al transitario de prueba (" + why + "). Abrir esta ventana no la envía.")) +
        ` <button type="button" class="btn g v100f-b" data-v100resend="1">${E(M("送り直す（作った依頼をそのまま送る）", "Resend (send the same request)", "重新发送（发送同一请求）", "Reenviar (la misma solicitud)"))}</button>`;
    } catch (e) { err("deliv", e); }
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v100resend]");
    if (!b) return;
    e.preventDefault();
    try {
      const id = ((document.getElementById("pn") || {}).textContent || "").match(/RQ-[A-Z0-9]+/);
      const rq = id && typeof FWDB !== "undefined" ? (FWDB.reqs || []).find((x) => x && x.id === id[0]) : null; // eslint-disable-line no-undef
      let cos = 0; try { cos = typeof fwdCos === "function" ? fwdCos().length : 0; } catch (x) { cos = 0; } // eslint-disable-line no-undef
      const P = { item: (rq && rq.item) || (dd() || {}).item || "", qty: "", term: (rq && rq.term) || "", pol: (rq && rq.pol) || "", mode: (rq && rq.mode) || "", cbm: (rq && rq.cbm) || "", ctys: String((rq && rq.cty) || "").split("・").filter(Boolean), cos, to: (rq && rq.toCo) || "", requote: false, resend: id ? id[0] : "" };
      const ok = typeof V.fwdAsk === "function" ? await V.fwdAsk(P) : false;
      if (!ok) { try { window.toast(M("送り直していません", "Not resent")); } catch (x) { /* 無視 */ } return; }
      if (typeof window.v59DemoPush === "function") { await window.v59DemoPush(); try { window.toast(M("送り直しました（新しい依頼は作っていません）", "Resent (no new request was created)")); } catch (x) { /* 無視 */ } }
    } catch (x) { err("resend", x); }
  }, false);
  function apply() { try { if (curKey() === "ops:reg") fixConf(); fixAbbr(); fixNone(); fixDeliv(); } catch (e) { err("apply4", e); } }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); apply(); return r; };
  let tm = 0;
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(apply, 300); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  setTimeout(apply, 1200);
})();

/* ══════ 22.00.1（v1 N5）販売先国の分析の候補が3か国だけのとき：理由と「候補を広げて分析し直す」を出す ══════
   「🔄 再分析」（土台の ctyRun(false)）は、いまの候補（確定した国・進出希望国だけのことがある）で分析し直す。「AI商社マンにおまかせ」（ctyRun(true)）は
   候補を自動で選び直す（通関統計の相手国・拠点・統計の国を足して 10か国まで）。手元では、読み込み直した後の「おまかせ」は 10か国だった（再現できず）。
   → 分析の候補が3か国以下のときは、画面に「候補が N か国だけで分析しました（…）」と、10か国に広げて分析し直すボタンを出す */
(function () {
  "use strict";
  const RD = window.RDX, V = window.V100FLOW;
  if (!RD || !V || window.__v100flowN5) return;
  window.__v100flowN5 = 1;
  const M = V.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  function paint() {
    try {
      const old = document.getElementById("v100fFew");
      if (curKey() !== "cty" || typeof ctyStore !== "function") { if (old) old.remove(); return; } // eslint-disable-line no-undef
      const s = ctyStore(); // eslint-disable-line no-undef
      const rec = Array.isArray(s.rec) ? s.rec : [];
      if (!rec.length || rec.length > 3 || window.__ctyBusy) { if (old) old.remove(); return; }
      const names = rec.map((x) => x && x.c).filter(Boolean);
      const host = document.getElementById("sec-2") || document.querySelector("#well .k-card") || document.getElementById("well");
      if (!host) return;
      let el = old;
      if (!el) { el = document.createElement("div"); el.id = "v100fFew"; el.className = "v100f-few"; el.setAttribute("role", "note"); el.setAttribute("data-noi18n", "1"); host.insertAdjacentElement("afterbegin", el); }
      const h = `<b>${E(M("候補が " + names.length + "か国だけで分析しました（" + names.join("・") + "）", "Analysed with only " + names.length + " candidate countries (" + names.join(", ") + ")"))}</b> <span>${E(M("「🔄 再分析」は、いまの候補（確定した国・進出希望国）だけで分析し直します。ほかの国と比べるときは、候補を広げて分析し直してください（通関統計の相手国などを足して10か国まで）。", "“Re-analyse” only uses the current candidates. To compare with other countries, widen the candidates (up to 10 countries)."))}</span> <button type="button" class="btn g v100f-b" data-v100few="1">${E(M("候補を広げて分析し直す（10か国まで）", "Widen candidates and re-analyse (up to 10)"))}</button>`;
      if (el.__h !== h) { el.__h = h; el.innerHTML = h; }
    } catch (e) { try { V.e("few", e); } catch (x) { /* 記録だけ */ } }
  }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("[data-v100few]"); if (!b) return; e.preventDefault(); try { if (typeof ctyRun === "function") ctyRun(true); } catch (x) { /* 無視 */ } setTimeout(paint, 1500); }, false); // eslint-disable-line no-undef
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); paint(); return r; };
  setInterval(() => { if (!document.hidden && curKey() === "cty") paint(); }, 2500);
})();
