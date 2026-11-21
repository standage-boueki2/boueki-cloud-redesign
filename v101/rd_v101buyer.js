/* 22.01 buyer：刷新版での見せ方（中身は logic_v2201buyer.js の window.V101BUYER）
   No.622 件数：「最新のリスト：n件」の下と表の見出しの下に、外した社数・AI が挙げなかった数を別に書く。前のリストの選択肢の社数も表の社数に
   No.623 文面ボタン：その会社の文面が無ければ「文面を作る」、あれば「文面を見る」、送ったら「開く」（data-v101-buyer-ap）
   No.597 公式サイトの確かめ：確かめられなかった会社を表の下に並べ、行に理由を出す。URL を検索で見つけた会社は、そのことを書く
   No.624 署名：文面の窓に「署名・本文に未入力・仮の値」の知らせ。コピー・DM・返信の送信の前に止める。AI の返信案・DM 案の仮の値は登録済みの値か【…】に
   No.621 規制の画面の「調べ方と次の一歩」：関係する出どころが無いときは「この国・商材の公的な出どころは、アプリにまだ登録されていません」
   行の選択・商談への橋渡しは deal の担当（触らない）。この層の印は data-v101-buyer-* */
(function () {
  "use strict";
  const W = window;
  const V = W.V101BUYER;
  if (!V || V._rd) return;
  V._rd = 1;
  const M = V.M, F = V.F, E = V.E;
  const err = (k, e) => { try { V.errf("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const RD = W.RDX || null;
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const fn = (n) => { try { return typeof W[n] === "function"; } catch (e) { return false; } };
  function toastS(s) { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
  function leadOf(id) { try { const o = fn("v71obLead") ? W.v71obLead(id) : null; return o || null; } catch (e) { return null; } }
  function runNow() { try { return fn("v71obRun") ? W.v71obRun() : null; } catch (e) { return null; } }

  /* ───── No.622 件数の注記 ───── */
  function cntNote(run) {
    if (!run || !Array.isArray(run.leads)) return "";
    const c = V.obCount(run);
    if (c.smp) return "";
    const L = [];
    if (c.gone) L.push(F(M("ほかに {g}社は、公式サイトにたどり着けず外しました（表の下の「外した会社」で理由を見て、戻せます）", "{g} more were removed because their website could not be reached (see “Removed” below the table; you can put them back)", "另有 {g} 家因官网无法访问而移除（可在表格下方“已移除”查看原因并放回）", "Se quitaron {g} más porque no se pudo acceder a su sitio web (vea «Quitadas» bajo la tabla; puede volver a añadirlas)"), { g: c.gone }));
    if (c.asked && c.total < c.asked && run.how === "ai") {
      const noName = (c.aiN != null && c.aiN > c.total) ? c.aiN - c.total : 0;
      L.push(F(M("頼んだのは {n}社でしたが、AI が挙げたのは {a}社でした", "You asked for {n}, but the AI listed {a}", "请求了 {n} 家，但 AI 只列出了 {a} 家", "Pidió {n}, pero la IA listó {a}"), { n: c.asked, a: c.aiN != null ? c.aiN : c.total }) +
        (noName ? F(M("（社名の無い {k}件は外しました）", " ({k} without a company name were removed)", "（去掉了 {k} 条没有公司名的）", " (se quitaron {k} sin nombre de empresa)"), { k: noName }) : M("（条件に合う会社を、AI がそれ以上挙げませんでした）", " (the AI did not list more companies matching the conditions)", "（AI 没有列出更多符合条件的公司）", " (la IA no listó más empresas que cumplan las condiciones)")));
    }
    if (c.unchk) L.push(F(M("公式サイトを確かめられなかった {u}社は、表の下のほうに並べ、理由を各行に書いています", "{u} not verified on their website are listed lower in the table, with the reason on each row", "无法确认官网的 {u} 家排在表格下方，并在各行写明原因", "Las {u} no verificadas en su sitio web aparecen más abajo, con el motivo en cada fila"), { u: c.unchk }));
    return L.join(M("。", ". ", "。", ". "));
  }
  V.cntNote = cntNote;
  function fixSummary() {
    try {
      const box = $("[data-rddb]");
      if (!box) return;
      const mk = $("#rddbob", box);
      const card = mk && mk.closest(".rd-card");
      const p = card && $$("p", card).find((x) => !x.classList.contains("rd-note") && !x.hasAttribute("data-v101-buyer-cnt"));
      let n = card && $("[data-v101-buyer-cnt]", card);
      const run = runNow();
      // リストを作った後も「まだリストを作っていません」や全部の行の数のままにならないよう、表の社数で（土台の fixDb と同じ文）
      if (p && run && Array.isArray(run.leads)) {
        const c = V.obCount(run);
        const want = M("最新のリスト：" + c.shown + "件（この下に出ています）", "Latest list: " + c.shown + " (shown below)", "最新名单：" + c.shown + " 家（显示在下方）", "Última lista: " + c.shown + " (abajo)");
        if (p.textContent !== want) { p.setAttribute("data-noi18n", "1"); p.textContent = want; p.style.color = ""; }
      }
      const t = cntNote(run);
      if (!t || !p) { if (n) n.remove(); return; }
      if (!n) { n = document.createElement("p"); n.className = "v101b-cnt"; n.setAttribute("data-v101-buyer-cnt", "1"); n.setAttribute("data-noi18n", "1"); p.insertAdjacentElement("afterend", n); }
      if (n.textContent !== t) n.textContent = t;
    } catch (e) { err("summary", e); }
  }
  function fixHist() {
    try {
      const sel = $("#v71obH");
      if (!sel || !fn("v71obSt")) return;
      const S = W.v71obSt();
      $$("option", sel).forEach((o, i) => {
        const r = S.runs[+o.value] || S.runs[i];
        if (!r || !Array.isArray(r.leads)) return;
        const c = V.obCount(r);
        const t = String(o.textContent || "").replace(/（\d+）$|\(\d+\)$/, "（" + c.shown + "）");
        if (t !== o.textContent) o.textContent = t;
      });
    } catch (e) { err("hist", e); }
  }

  /* ───── No.623・597：表（並べ方・ボタン・理由）───── */
  function tpl(h) { const t = document.createElement("template"); t.innerHTML = h; return t; }
  function tableAug(h, run) {
    try {
      const T = tpl(h);
      let unver = 0;
      T.content.querySelectorAll("tr[data-v71row]").forEach((tr) => {
        const L = (run.leads || []).find((x) => x && x.id === tr.dataset.v71row);
        if (!L) return;
        // 623 文面ボタン
        const b = tr.querySelector("button[data-v71ap]");
        if (b) {
          const st = V.apState(L);
          b.setAttribute("data-v101-buyer-ap", st);
          b.setAttribute("data-noi18n", "1");
          if (st === "new") { b.textContent = M("文面を作る", "Write message", "撰写邮件", "Redactar mensaje"); b.title = M("この会社への文面はまだありません。押すと AI が文面を作ります（1〜3分）", "No message for this company yet. Press to have the AI write one (1–3 min)", "尚无给该公司的邮件。按下后由 AI 撰写（1〜3分钟）", "Aún no hay mensaje para esta empresa. Pulse para que la IA lo redacte (1–3 min)"); }
          else if (st === "draft") { b.textContent = M("文面を見る", "View message", "查看邮件内容", "Ver mensaje"); b.title = M("作った文面を開きます（直せます）", "Opens the message already written (you can edit it)", "打开已写好的邮件（可修改）", "Abre el mensaje ya redactado (puede editarlo)"); }
        }
        // 597 確かめられなかった理由・URL の出どころ
        if (L.smp) return;
        const nm = tr.children[2];
        if (!nm) return;
        const g = V.grp(L);
        tr.setAttribute("data-v101-buyer-grp", String(g));
        if (g >= 3) {
          unver++;
          const why = V.whyNot(L, run);
          if (why) { const s = document.createElement("span"); s.className = "v101b-why"; s.setAttribute("data-v101-buyer-why", "1"); s.setAttribute("data-noi18n", "1"); s.textContent = "⚠ " + M("公式サイト未確認：", "Website not verified: ", "官网未确认：", "Sitio web no verificado: ") + why; nm.appendChild(s); }
        }
        if (L.v101url && /^(cits|search)$/.test(L.v101url.src) && L.url) {
          const s = document.createElement("span"); s.className = "v101b-usrc"; s.setAttribute("data-v101-buyer-usrc", L.v101url.src); s.setAttribute("data-noi18n", "1");
          s.textContent = L.v101url.src === "cits" ? M("URL：AI の Web 検索の出どころから見つけました（社名とドメインが一致）", "URL: found in the AI's web-search sources (company name matches the domain)", "网址：从 AI 网页搜索的出处中找到（公司名与域名一致）", "URL: hallada en las fuentes de la búsqueda web de la IA (el nombre coincide con el dominio)")
            : M("URL：検索で見つけた候補です（社名とドメインが一致）。同じ会社か、送る前に確かめてください", "URL: a candidate found by search (company name matches the domain). Check it is the same company before sending", "网址：通过搜索找到的候选（公司名与域名一致）。发送前请确认是同一家公司", "URL: candidata hallada por búsqueda (el nombre coincide con el dominio). Compruebe que es la misma empresa antes de enviar");
          nm.appendChild(s);
        }
      });
      let out = T.innerHTML;
      // 表の見出しの下：件数の注記
      const note = cntNote(run);
      if (note) out = out.replace(/(<div class="v71bar">[\s\S]*?<\/div>)/, `$1<p class="v101b-cnt v101b-cnt2" data-v101-buyer-cnt2="1" data-noi18n="1">${E(note)}</p>`);
      return out;
    } catch (e) { err("tableAug", e); return h; }
  }
  if (fn("v71obTable") && !W.v71obTable.__v101buyer) {
    const __tb = W.v71obTable;
    const g = function (run) {
      if (!run || !Array.isArray(run.leads)) return __tb.apply(this, arguments);
      let r2 = run;
      try {
        // 確かめられた会社を上に（中身の順は logic の orderLeads と同じ・元の run は変えない）
        if (run.how !== "smp") {
          const L = run.leads.map((l, i) => ({ l, i, g: V.grp(l) }));
          L.sort((a, b) => (a.g - b.g) || ((+b.l.pts || 0) - (+a.l.pts || 0)) || (a.i - b.i));
          r2 = Object.assign({}, run, { leads: L.map((x) => x.l) });
        }
      } catch (e) { err("order", e); r2 = run; }
      const h = __tb.call(this, r2);
      return tableAug(String(h || ""), r2);
    };
    g.__v101buyer = 1;
    W.v71obTable = g;
  }

  /* ───── No.624 署名の欄：見本の値は「例：」と分かるように ───── */
  if (fn("v79obSigHtml") && !W.v79obSigHtml.__v101buyer) {
    const __sh = W.v79obSigHtml;
    const g = function () {
      let h = String(__sh.apply(this, arguments) || "");
      try {
        [["Taro Yamada", M("例：Taro Yamada（ローマ字）", "e.g. Taro Yamada")], ["Export Manager", M("例：Export Manager", "e.g. Export Manager")], ["export@your-company.example", M("例：name@貴社のドメイン", "e.g. name@your-domain")], ["+81-3-0000-0000", M("例：+81-3-1234-5678", "e.g. +81-3-1234-5678")], ["1-2-3 …, Tokyo, Japan", M("例：番地・市区町村・国名まで英語で", "e.g. street, city and country in English")]]
          .forEach(([a, b]) => { h = h.split('placeholder="' + E(a) + '"').join('placeholder="' + E(b) + '"'); });
        let R = {}; try { R = V.regInfo(); } catch (e) { R = {}; }
        const got = [R.addr ? M("住所", "address") : "", R.tel ? M("電話", "phone") : "", R.web ? M("Web", "website") : "", R.mail ? M("メール", "email") : ""].filter(Boolean);
        const note = M("未入力の項目は、文面の署名に【…を入れてください】と目立つ形で残ります（仮の値は入れません）。", "Missing items stay in the signature as 【… please fill in】 (no dummy values are inserted).") + (got.length ? F(M("登録済みの会社情報から入れた項目：{x}", " Filled from your registered company info: {x}"), { x: got.join("・") }) : "");
        h = h.replace(/(<pre class="v79pre")/, `<p class="nn v101b-signote" data-v101-buyer-signote="1" data-noi18n>${E(note)}</p>$1`);
      } catch (e) { err("sigHtml", e); }
      return h;
    };
    g.__v101buyer = 1;
    W.v79obSigHtml = g;
  }

  /* ───── No.624 文面の窓の知らせ・送る／コピーの前の関所 ───── */
  function leftItems(txt) {
    const t = String(txt || ""), out = [];
    const has = (k) => (V.MK_ALL || [V.MK]).some((m) => t.indexOf(m[k]) >= 0);
    if (has("name")) out.push(M("差出人の名前", "sender name", "发件人姓名", "nombre del remitente"));
    if (has("mail")) out.push(M("差出人のメール", "sender email", "发件人邮箱", "correo del remitente"));
    if (has("addr")) out.push(M("会社の住所", "company address", "公司地址", "dirección de la empresa"));
    if (has("tel")) out.push(M("電話番号", "phone number", "电话号码", "teléfono"));
    return out;
  }
  function warnBox(ta, ph, kind) {
    if (!ta || !ta.parentNode) return null;
    let box = ta.parentNode.querySelector(":scope > .v101b-phwarn");
    if (!ph) { if (box) box.remove(); return null; }
    const items = leftItems(ta.value);
    const t = items.length ? F(M("署名・本文に、まだ入っていない所があります：{x}。「✍ 署名」に入れると【】の所に入ります。【】が残ったままでは送れません（コピーするときも直してください）。", "Some parts of the signature or text are still empty: {x}. Fill them in “✍ Signature” and they replace the 【】 parts. You cannot send while 【】 remains (fix them before copying too).", "签名或正文中还有未填写的部分：{x}。在“✍ 签名”中填写后会替换【】部分。保留【】时无法发送（复制时也请先修改）。", "Aún faltan partes de la firma o del texto: {x}. Complételas en «✍ Firma» y sustituirán las partes 【】. No se puede enviar con 【】 (corríjalas también antes de copiar)."), { x: items.join("・") })
      : F(M("本文に仮の情報（見本の値・穴埋め）が残っています：「{p}」。登録済みの情報に直してから送ってください（コピーするときも直してください）。", "The text still contains dummy information (sample or placeholder values): “{p}”. Replace it with your real details before sending (and before copying).", "正文中还有临时信息（示例值或占位符）：“{p}”。请改为真实信息后再发送（复制时也请修改）。", "El texto aún contiene información ficticia (valores de ejemplo o marcadores): «{p}». Sustitúyala por sus datos reales antes de enviar (y antes de copiar)."), { p: ph });
    if (!box) { box = document.createElement("div"); box.className = "v101b-phwarn"; box.setAttribute("role", "alert"); box.setAttribute("data-noi18n", "1"); box.setAttribute("data-v101-buyer-ph", kind || "1"); ta.parentNode.insertBefore(box, ta); }
    const sig = t + "|" + (kind || "");
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML = `<b>⚠ ${E(M("送る前に直してください", "Fix before sending", "发送前请修改", "Corrija antes de enviar"))}</b><span>${E(t)}</span>` +
        (kind === "ob" && $("#v79sig") ? `<button type="button" class="btn g" data-v101-buyer-sigopen="1">${E(M("署名を入れる →", "Add signature →", "填写签名 →", "Añadir firma →"))}</button>` : "");
    }
    return box;
  }
  // 土台の見張り（v92ct の mailWarn）が【…】を「日本語のままの所」と重ねて出すのを外す（同じことを2回言わない）
  function quietMailWarn() {
    try {
      const mk = [V.MK.name, V.MK.mail, V.MK.addr, V.MK.tel].map((x) => x.replace(/^【|】$/g, ""));
      $$(".v92ct-mailwarn").forEach((box) => {
        $$("li", box).forEach((li) => {
          const t = li.textContent || "";
          if (!/日本語のままの所|still contains Japanese/.test(t)) return;
          const q = (t.match(/「([^」]+)」|“([^”]+)”/g) || []).map((x) => x.replace(/^[「“]|[」”]$/g, ""));
          if (q.length && q.every((x) => mk.indexOf(x) >= 0)) li.style.display = "none";
        });
        const vis = $$("li", box).filter((x) => x.style.display !== "none");
        box.hidden = !vis.length;
      });
    } catch (e) { err("quietMailWarn", e); }
  }
  function sweepPh() {
    quietMailWarn();
    try {
      const a = $("#v71obBody");
      if (a) { warnBox(a, V.phOf(a.value), "ob"); if (!a.dataset.v101b) { a.dataset.v101b = "1"; a.addEventListener("input", () => { warnBox(a, V.phOf(a.value), "ob"); const cb = $("[data-v101-buyer-copyok]"); if (cb) cb.remove(); }); } }
      ["#dmB", "#dmR"].forEach((s) => { const t = $(s); if (t) { warnBox(t, V.phOf(t.value), s.slice(1)); if (!t.dataset.v101b) { t.dataset.v101b = "1"; t.addEventListener("input", () => warnBox(t, V.phOf(t.value), s.slice(1))); if (s === "#dmB") watchAi("#dmB"); } } });
    } catch (e) { err("sweepPh", e); }
  }
  V.sweepPh = sweepPh;
  // AI が DM・返信の案を入れたら、仮の値を登録済みの値か【…】に（利用者が打っている間は触らない）
  const watch = {};
  function watchAi(sel) {
    const t = $(sel); if (!t) return;
    // もう AI の案が入っていて、まだ利用者が手を入れていないときは、すぐ直す
    try {
      if (!t.dataset.v101typed && V.phOf(t.value)) {
        const s1 = V.scrub(t.value);
        if (s1 !== t.value) { t.value = s1; t.dispatchEvent(new Event("input", { bubbles: true })); toastS(M("AI の案の署名・連絡先を、登録済みの情報に置き換えました（無い項目は【】で残しています）", "Replaced the signature and contact details in the AI draft with your registered info (missing items are left as 【】)")); }
      }
    } catch (e) { err("watchAi0", e); }
    if (!t.dataset.v101tw) { t.dataset.v101tw = "1"; t.addEventListener("keydown", () => { t.dataset.v101typed = "1"; }); }
    const v0 = t.value, t0 = Date.now();
    clearInterval(watch[sel]);
    watch[sel] = setInterval(() => {
      try {
        const x = $(sel);
        if (!x || Date.now() - t0 > 150000 || x.dataset.v101typed) { clearInterval(watch[sel]); return; }
        if (x.value !== v0 && x.value.trim()) {
          clearInterval(watch[sel]);
          setTimeout(() => {
            try {
              const y = $(sel); if (!y) return;
              const s1 = V.scrub(y.value);
              if (s1 !== y.value) { y.value = s1; y.dispatchEvent(new Event("input", { bubbles: true })); toastS(M("AI の案の署名・連絡先を、登録済みの情報に置き換えました（無い項目は【】で残しています）", "Replaced the signature and contact details in the AI draft with your registered info (missing items are left as 【】)")); }
              warnBox(y, V.phOf(y.value), sel.slice(1));
            } catch (e) { err("watchAi2", e); }
          }, 400);
        }
      } catch (e) { err("watchAi", e); clearInterval(watch[sel]); }
    }, 400);
  }
  async function copyText(s) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(s); return true; } } catch (e) { /* 次の手 */ }
    try { const ta = document.createElement("textarea"); ta.value = s; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return !!ok; } catch (e) { return false; }
  }
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    try {
      // AI の案（DM・返信）
      // AI に頼み直したときは、その答えを1回だけ直す（打った文は触らない）
      if (t.closest("#dmGen, #dmAI")) { const x = $("#dmB"); if (x) delete x.dataset.v101typed; watchAi("#dmB"); }
      if (t.closest("#dmRai")) { const x = $("#dmR"); if (x) delete x.dataset.v101typed; watchAi("#dmR"); }
      // 署名を入れる →
      const so = t.closest("[data-v101-buyer-sigopen]");
      if (so) { e.preventDefault(); try { W.closeDW(); } catch (x) { /* 無視 */ } setTimeout(() => { const d = $("#v79sig"); if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "center" }); const i = $("#v79s_name", d); if (i) i.focus(); } }, 120); return; }
      // 【】を残したままコピーする（自分で直す）
      const cok = t.closest("[data-v101-buyer-copyok]");
      if (cok) {
        e.preventDefault();
        const s = ($("#v71obSubj") || {}).value || "", b = ($("#v71obBody") || {}).value || "";
        copyText(s + "\n\n" + b).then((ok) => toastS(ok ? M("コピーしました（【】の所と仮の値は、貼った先で直してから送ってください）", "Copied (fix the 【】 parts and dummy values where you paste before sending)") : M("コピーできませんでした", "Could not copy")));
        cok.remove();
        return;
      }
      // 文面をコピー（AIバイヤー開拓）
      const cp = t.closest("#v71obCopy");
      if (cp) {
        const b = ($("#v71obBody") || {}).value || "", s = ($("#v71obSubj") || {}).value || "";
        const ph = V.phOf(s + "\n" + b);
        if (ph) {
          e.preventDefault(); e.stopImmediatePropagation();
          const box = warnBox($("#v71obBody"), ph, "ob");
          if (box && !$("[data-v101-buyer-copyok]", box)) box.insertAdjacentHTML("beforeend", `<button type="button" class="btn g" data-v101-buyer-copyok="1">${E(M("【】を残したままコピーする（貼った先で自分で直す）", "Copy anyway with 【】 (fix them where you paste)", "保留【】直接复制（粘贴后自行修改）", "Copiar igualmente con 【】 (corríjalos donde pegue)"))}</button>`);
          if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
          toastS(M("署名・本文に【】や仮の値が残っています。直してからコピーしてください", "The signature or text still has 【】 or dummy values. Fix them before copying"));
          return;
        }
      }
      // DM・返信の送信（メールソフトで開く を含む）
      const sd = t.closest("#dmSend, #bmMailto, #dmRgo");
      if (sd) {
        const ta = sd.id === "dmRgo" ? $("#dmR") : $("#dmB");
        const ph = ta ? V.phOf(ta.value) : "";
        if (ph) {
          e.preventDefault(); e.stopImmediatePropagation();
          const box = warnBox(ta, ph, sd.id === "dmRgo" ? "dmR" : "dmB");
          if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
          toastS(F(M("「{p}」が残っています。直してから送ってください（送っていません）", "“{p}” remains. Fix it before sending (not sent)"), { p: ph }));
        }
      }
    } catch (x) { err("click", x); }
  }, true);

  /* ───── No.621 規制の画面：関係する出どころが無いとき ───── */
  function fixRegSteps() {
    try {
      const box = $("#rO");
      if (!box) return;
      $$(".v95reg-next li", box).forEach((li) => {
        if (!/公的な出どころで確かめる|Check official sources|通过官方来源确认|Verifique en fuentes oficiales/.test(li.textContent || "")) return;
        const hasLink = !!li.querySelector("a[href^='https://']");
        let n = li.querySelector("[data-v101-buyer-noreg]");
        if (hasLink) { if (n) n.remove(); return; }
        // 表の「出どころ」に、リンクの無い名前だけが残っているとき（例：シンガポールの CPSO）は、その名前を出す
        const names = $$("[data-v92pts] .v92o-dt", box).map((x) => (x.textContent || "").trim()).filter((t) => /^(出どころ|Source)\s*[:：]/.test(t))
          .map((t) => t.replace(/^(出どころ|Source)\s*[:：]\s*/, "").replace(/\s*　.*$/, "").trim()).filter((t) => t && !/^要確認|^To be confirmed/.test(t));
        const uniq = Array.from(new Set(names)).slice(0, 2);
        const txt = uniq.length ? F(M("この国の出どころの名前はありますが、リンクはアプリにまだ登録されていません：{x}（要確認）。", "A source name exists for this country, but no link is registered in the app yet: {x} (to be confirmed).", "有该国出处的名称，但应用中尚未登记链接：{x}（需确认）。", "Hay un nombre de fuente para este país, pero la app aún no tiene el enlace: {x} (por confirmar)."), { x: uniq.join("／") })
          : M("この国・商材の公的な出どころは、アプリにまだ登録されていません（要確認）。", "No official source is registered in the app yet for this country and product (to be confirmed).", "应用中尚未登记该国家・该商品的官方出处（需确认）。", "La app aún no tiene una fuente oficial registrada para este país y producto (por confirmar).");
        if (n && n.textContent === txt) return;
        if (!n) { n = document.createElement("small"); n.setAttribute("data-noi18n", "1"); n.className = "v101b-noreg"; const b = li.querySelector("b"); if (b) b.insertAdjacentElement("afterend", n); else li.insertAdjacentElement("afterbegin", n); }
        n.setAttribute("data-v101-buyer-noreg", uniq.length ? "name" : "1");
        n.textContent = txt;
      });
    } catch (e) { err("regSteps", e); }
  }

  // 文面の窓を開いたら、すぐ知らせを出す（見張りの時機に任せない）
  if (fn("v71obOpen") && !W.v71obOpen.__v101buyerRd) {
    const __op = W.v71obOpen;
    const g = async function () {
      const r = await __op.apply(this, arguments);
      try { [0, 200, 700, 1500].forEach((ms) => setTimeout(() => { try { sweepPh(); } catch (e) { /* 無視 */ } }, ms)); } catch (e) { err("openSweep", e); }
      return r;
    };
    g.__v101buyerRd = 1; g.__v101buyer = 1;
    W.v71obOpen = g;
  }

  /* ───── つなぐ ───── */
  function apply() {
    const k = curKey();
    if (k === "db" || $("#v71ob")) { fixSummary(); fixHist(); }
    if (k === "ops:reg") fixRegSteps();
    sweepPh();
  }
  V.rdApply = apply;
  if (fn("v71obPaint") && !W.v71obPaint.__v101buyer) {
    const __p = W.v71obPaint;
    const g = function () { const r = __p.apply(this, arguments); try { fixHist(); fixSummary(); } catch (e) { err("paint", e); } return r; };
    g.__v101buyer = 1;
    W.v71obPaint = g;
  }
  if (RD && typeof RD.after === "function" && !RD.after.__v101buyer) {
    const a0 = RD.after;
    RD.after = function () { const r = a0.apply(this, arguments); try { apply(); } catch (e) { err("after", e); } return r; };
    RD.after.__v101buyer = 1;
  }
  let mt = 0;
  try { new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(() => { try { if ($("#v71obBody") || $("#dmB") || $("#dmR")) sweepPh(); if ($("#rO .v95reg-next")) fixRegSteps(); } catch (e) { /* 無視 */ } }, 250); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { err("mo", e); }
  setInterval(() => { try { if (!document.hidden) apply(); } catch (e) { /* 無視 */ } }, 2500);
})();
