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
        // 22.01.2（2回目）w2-3：0社のときは「0件（この下に出ています）」と言わない
        const want = !c.shown && c.total === 0 ? M("最新のリスト：まだ作れていません（0社・下の知らせを見てください）", "Latest list: not made yet (0 companies; see the notice below)", "最新名单：尚未生成（0 家・请看下方提示）", "Última lista: aún no creada (0 empresas; vea el aviso abajo)") : M("最新のリスト：" + c.shown + "件（この下に出ています）", "Latest list: " + c.shown + " (shown below)", "最新名单：" + c.shown + " 家（显示在下方）", "Última lista: " + c.shown + " (abajo)");
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
          // 22.01.1 v2-6：確かめている間は「⏳ 確かめています」（「未確認」「確かめられなかった」と言わない）
          const busy = !!(V.busyRun && V.busyRun(run)) && !(L.v79u && L.v79u.st);
          if (why) { const s = document.createElement("span"); s.className = "v101b-why" + (busy ? " busy" : ""); s.setAttribute("data-v101-buyer-why", busy ? "busy" : "1"); s.setAttribute("data-noi18n", "1"); s.textContent = busy ? "⏳ " + why : "⚠ " + M("公式サイト未確認：", "Website not verified: ", "官网未确认：", "Sitio web no verificado: ") + why; nm.appendChild(s); }
        }
        if (L.v101url && /^(cits|search)$/.test(L.v101url.src) && L.url) {
          const s = document.createElement("span"); s.className = "v101b-usrc"; s.setAttribute("data-v101-buyer-usrc", L.v101url.src); s.setAttribute("data-noi18n", "1");
          s.textContent = L.v101url.src === "cits" ? M("URL：AI の Web 検索の出どころから見つけました（社名とドメインが一致）", "URL: found in the AI's web-search sources (company name matches the domain)", "网址：从 AI 网页搜索的出处中找到（公司名与域名一致）", "URL: hallada en las fuentes de la búsqueda web de la IA (el nombre coincide con el dominio)")
            : M("URL：検索で見つけた候補です（社名とドメインが一致）。同じ会社か、送る前に確かめてください", "URL: a candidate found by search (company name matches the domain). Check it is the same company before sending", "网址：通过搜索找到的候选（公司名与域名一致）。发送前请确认是同一家公司", "URL: candidata hallada por búsqueda (el nombre coincide con el dominio). Compruebe que es la misma empresa antes de enviar");
          nm.appendChild(s);
        }
      });
      let out = T.innerHTML;
      // 22.01.2（2回目）w2-3：AI につながらなかった知らせ（22.00 の層）の「0時以降」を、一時的な失敗なら「少し待ってから」に。0社の見出し
      try { if (V.offFix) out = V.offFix(out, run); if (!(run.leads || []).length) out = out.replace(/：0社（([^）]+) 作成）/, (m0, d) => "：" + F(M("0社（{d} に作ろうとしましたが、作れていません）", "0 companies (tried at {d}; not made)"), { d })); } catch (e) { err("offTable", e); }
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
        let note = M("未入力の項目は、文面の署名に【…を入れてください】と目立つ形で残ります（仮の値は入れません）。", "Missing items stay in the signature as 【… please fill in】 (no dummy values are inserted).") + (got.length ? F(M("登録済みの会社情報から入れた項目：{x}", " Filled from your registered company info: {x}"), { x: got.join("・") }) : "");
        // 22.01.2 S3：名前が英字でないときは、署名に入れていないことを知らせる
        try { const s0 = (fn("v79obSig") ? W.v79obSig() : {}) || {}; const nm = String(s0.name || "").trim(); if (nm && V.latinName && !V.latinName(nm)) note += F(M(" 名前「{n}」は英字ではないため、署名には入れず【差出人の名前（英字）を入れてください】と出します。「お名前」にローマ字（例：Taro Yamada）で入れてください。", " The name “{n}” is not in Latin letters, so the signature shows 【Sender name (Latin letters) — please fill in】 instead. Enter your name in Latin letters (e.g. Taro Yamada)."), { n: nm }); } catch (e) { err("sigNoteName", e); }
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
  /* ───── 22.01.1 v2-2：「不明」と答えた事柄を文面で断定しない（知らせ）───── */
  const TOPN = { fit: ["適合（車種・機種・品番）", "fitment (models / part numbers)", "适配（车型・机型・品号）", "compatibilidad (modelos / referencias)"], asbestos: ["アスベスト不使用", "asbestos-free", "无石棉", "sin amianto"], origin: ["原産国", "country of origin", "原产国", "país de origen"], halal: ["ハラール", "halal", "清真", "halal"], organic: ["有機", "organic", "有机", "orgánico"], oem: ["OEM・PB", "OEM / private label", "OEM／贴牌", "OEM / marca blanca"], capacity: ["生産能力", "production capacity", "产能", "capacidad de producción"] };
  function topN(k, lab) { const x = TOPN[k]; return x ? M(x[0], x[1], x[2], x[3]) : String(lab || k).replace(/^tok:/, ""); }
  function msgOf(ta) { try { const o = leadOf(ta.dataset.lead); const m = o && o.l && o.l.ap && o.l.ap.seq ? o.l.ap.seq[+ta.dataset.i || 0] : null; return { m, L: o && o.l }; } catch (e) { return { m: null }; } }
  function unkBox(ta, kind) {
    if (!ta || !ta.parentNode || !V.unkScan) return null;
    let box = ta.parentNode.querySelector(":scope > .v101b-unk");
    const left = V.unkScan(ta.value);
    const mm = kind === "ob" ? msgOf(ta).m : null;
    const fixedAll = (mm && Array.isArray(mm.v101unk) ? mm.v101unk : (ta.__v101unk || []));
    const fixed = fixedAll.map((x) => x.k).filter((k, i, a) => a.indexOf(k) === i && k !== "term");
    const fixedTerm = fixedAll.filter((x) => x.k === "term").map((x) => x.m).filter((m, i, a) => a.indexOf(m) === i);
    // 22.01.2（2回目）w2-1：登録と違う名前（原材料・材質・品番）は、「不明」の断定とは別の文で知らせる
    const leftU = left.filter((x) => x.k !== "term"), leftT = left.filter((x) => x.k === "term");
    if (!left.length && !fixed.length && !fixedTerm.length) { if (box) box.remove(); return null; }
    let t = "", role = "status";
    const termTxt = (m) => F(M("文面に、登録と違う名前があります：「{m}」。原材料・材質・品番は、登録の名前にそろえてください。", "The text uses a name that differs from your registration: “{m}”. Use the registered name for ingredients, materials and part numbers.", "邮件中有与登记不同的名称：“{m}”。原材料・材质・品号请与登记的名称一致。", "El texto usa un nombre distinto del registrado: «{m}». Use el nombre registrado para ingredientes, materiales y referencias."), { m });
    const termFixed = (list) => F(M("原材料・材質・品番の言い方を、登録の名前にそろえました（{x}）。", "Ingredient, material and part-number names were aligned with your registration ({x}).", "已将原材料・材质・品号的说法与登记的名称一致（{x}）。", "Se alinearon los nombres de ingredientes, materiales y referencias con su registro ({x})."), { x: list.slice(0, 3).map((m) => "「" + m + "」").join("・") });
    if (left.length) {
      role = "alert";
      const a = [];
      if (leftU.length) a.push(F(M("文面に、「不明」と答えた事柄の断定があります：{x}（「{m}」）。確かめるまで断定せず、「待確認／to be confirmed」と書いてください（答えが分かったら、商品情報の追加ヒアリングで入れると文面にも使えます）。", "The text states something you answered as “unknown”: {x} (“{m}”). Until it is confirmed, write “to be confirmed” instead (once you know, add it in the product's follow-up questions).", "邮件中有您回答为“不明”的事项的断定：{x}（“{m}”）。确认前请勿断定，请写“待确认”（确认后可在商品信息的追加询问中填写）。", "El texto afirma algo que respondió como «desconocido»: {x} («{m}»). Hasta confirmarlo, escriba «por confirmar»."), { x: leftU.map((x) => topN(x.k, x.lab)).join("・"), m: leftU[0].m }));
      if (leftT.length) a.push(termTxt(String(leftT[0].m).replace(/→.*$/, "")));
      t = a.join(" ");
    } else {
      const a = [];
      if (fixed.length) a.push(F(M("「不明」と答えた事柄（{x}）は、文面で断定せず「待確認／to be confirmed」の形にしました（AI の案から外した言い回しがあります）。答えが分かったら、商品情報の追加ヒアリングで入れると文面にも使えます。", "Items you answered as “unknown” ({x}) are not stated as fact; they are written as “to be confirmed” (some wording from the AI draft was removed). Once you know, add them in the product's follow-up questions.", "您回答为“不明”的事项（{x}）在邮件中不作断定，写为“待确认”（已删除 AI 草稿中的相关措辞）。确认后可在商品信息的追加询问中填写。", "Lo que respondió como «desconocido» ({x}) no se afirma: se escribe «por confirmar» (se quitó parte del texto de la IA)."), { x: fixed.map((k) => topN(k)).join("・") }));
      if (fixedTerm.length) a.push(termFixed(fixedTerm));
      t = a.join(" ");
    }
    if (!box) { box = document.createElement("div"); box.className = "v101b-unk"; box.setAttribute("data-noi18n", "1"); ta.parentNode.insertBefore(box, ta); }
    box.setAttribute("role", role); box.setAttribute("data-v101-buyer-unk", left.length ? "left" : "fixed");
    const head = left.length ? (leftU.length ? M("⚠ 断定に注意", "⚠ Unconfirmed claim", "⚠ 注意断定", "⚠ Afirmación sin confirmar") : M("⚠ 登録と違う名前", "⚠ Name differs from registration", "⚠ 与登记不同的名称", "⚠ Nombre distinto del registro"))
      : (fixed.length ? M("ℹ 断定していません", "ℹ Not stated as fact", "ℹ 未作断定", "ℹ No se afirma") : M("ℹ 登録の名前にそろえました", "ℹ Aligned with registration", "ℹ 已与登记一致", "ℹ Alineado con el registro"));
    if (box.dataset.sig !== t + head) { box.dataset.sig = t + head; box.innerHTML = `<b>${E(head)}</b><span>${E(t)}</span>`; }
    return box;
  }
  V.unkBox = unkBox;
  function sweepPh() {
    quietMailWarn();
    try { if ($("#v71obBody")) editable(); } catch (e) { err("sweepEdit", e); }
    try {
      const a = $("#v71obBody");
      if (a) {
        warnBox(a, V.phOf(a.value), "ob"); unkBox(a, "ob");
        if (!a.dataset.v101b) {
          a.dataset.v101b = "1";
          a.addEventListener("input", () => { warnBox(a, V.phOf(a.value), "ob"); unkBox(a, "ob"); const cb = $("[data-v101-buyer-copyok]"); if (cb) cb.remove(); });
          // 利用者が手を入れた文面は、あとで勝手に書き換えない（知らせだけ）
          a.addEventListener("keydown", () => { try { const x = msgOf(a).m; if (x) x.v101typed = 1; } catch (e) { /* 無視 */ } });
        }
      }
      ["#dmB", "#dmR"].forEach((s) => { const t = $(s); if (t) { warnBox(t, V.phOf(t.value), s.slice(1)); unkBox(t, s.slice(1)); if (!t.dataset.v101b) { t.dataset.v101b = "1"; t.addEventListener("input", () => { warnBox(t, V.phOf(t.value), s.slice(1)); unkBox(t, s.slice(1)); }); if (s === "#dmB") watchAi("#dmB"); } } });
    } catch (e) { err("sweepPh", e); }
  }
  V.sweepPh = sweepPh;
  // AI が DM・返信の案を入れたら、仮の値を登録済みの値か【…】に（利用者が打っている間は触らない）
  const watch = {};
  // AI の案を直す：仮の値（署名・連絡先）と、「不明」と答えた事柄の断定（22.01.1 v2-2）
  function fixAi(t) {
    const v0 = t.value;
    let s1 = V.phOf(v0) ? V.scrub(v0) : v0;
    let hits = [];
    try { if (V.unkFix) { const r = V.unkFix(s1, ""); s1 = r.text; hits = r.hits || []; } } catch (e) { err("fixAiUnk", e); }
    if (s1 === v0) return false;
    t.value = s1;
    if (hits.length) t.__v101unk = (t.__v101unk || []).concat(hits);
    t.dispatchEvent(new Event("input", { bubbles: true }));
    const what = [];
    if (V.phOf(v0) && V.scrub(v0) !== v0) what.push(M("署名・連絡先を登録済みの情報に（無い項目は【】で残しています）", "the signature/contact details with your registered info (missing items left as 【】)"));
    if (hits.length) what.push(M("「不明」と答えた事柄の断定を「待確認」の形に", "claims you answered as “unknown” to “to be confirmed”"));
    toastS(F(M("AI の案を直しました：{x}", "Fixed the AI draft: {x}"), { x: what.join(M("・", "; ")) }));
    return true;
  }
  function watchAi(sel) {
    const t = $(sel); if (!t) return;
    // もう AI の案が入っていて、まだ利用者が手を入れていないときは、すぐ直す
    try {
      if (!t.dataset.v101typed && (V.phOf(t.value) || (V.unkScan && V.unkScan(t.value).length))) fixAi(t);
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
              fixAi(y);
              warnBox(y, V.phOf(y.value), sel.slice(1)); unkBox(y, sel.slice(1));
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

  /* 22.01.2（2回目）w2-5：見出しは「本文（直せます）」なのに、21.85 の層（v84 のカード）が件名・本文を読み取り専用にしていて、
     「直す」を押すまでクリックして打っても入らなかった → 開いたらすぐ直せるようにする（「直す」はそのまま＝本文へ移るボタン）。
     打った文はその場で文面に控え（フォローに切り替えても消えない）、「⚠ 断定に注意」などの確かめもすぐ効く */
  let saveT = 0;
  function editable() {
    ["v71obSubj", "v71obBody"].forEach((id) => {
      const x = document.getElementById(id);
      if (!x) return;
      if (x.hasAttribute("readonly")) { x.removeAttribute("readonly"); x.classList.remove("v84ro"); V.n.editOpen = (V.n.editOpen || 0) + 1; }
      if (!x.dataset.v101save) {
        x.dataset.v101save = "1";
        x.addEventListener("input", () => {
          try {
            const ta = document.getElementById("v71obBody"), su = document.getElementById("v71obSubj");
            const o = ta ? msgOf(ta) : null;
            if (!o || !o.m) return;
            if (ta) o.m.body = ta.value;
            if (su) o.m.subj = su.value;
            o.m.v101typed = 1;
            clearTimeout(saveT); saveT = setTimeout(() => { try { if (fn("v71obSave")) W.v71obSave(); } catch (e) { /* 無視 */ } }, 800);
          } catch (e) { err("editSave", e); }
        });
      }
    });
  }
  V.editable = editable;
  // 文面の窓を開いたら、すぐ知らせを出す（見張りの時機に任せない）
  if (fn("v71obOpen") && !W.v71obOpen.__v101buyerRd) {
    const __op = W.v71obOpen;
    const g = async function () {
      const r = await __op.apply(this, arguments);
      try { editable(); } catch (e) { err("openEdit", e); }
      try { [0, 200, 700, 1500].forEach((ms) => setTimeout(() => { try { editable(); sweepPh(); } catch (e) { /* 無視 */ } }, ms)); } catch (e) { err("openSweep", e); }
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
    // 22.01.2 R4：前に作った規制の表（D.regs）に人の食品の手続きが残っていたら外して描き直す（ペットフードの商品だけ）
    if (/^ops:(reg|doc)$/.test(k) && V.petFixD) { try { if (V.petFixD() > 0 && typeof render === "function") render(); } catch (e) { err("petRender", e); } } // eslint-disable-line no-undef
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
  // 22.01.2（2回目）w2-9：確かめている間の経過の時間（目安と比べられるように）
  setInterval(() => {
    try {
      $$("[data-v101-buyer-elapsed]").forEach((x) => {
        const s = Math.max(0, Math.round((Date.now() - (+x.getAttribute("data-v101-buyer-elapsed") || Date.now())) / 1000));
        const t = F(M("（経過 {m}分{s}秒）", " (elapsed {m}:{s})", "（已用 {m}分{s}秒）", " (transcurrido {m}:{s})"), { m: Math.floor(s / 60), s: String(s % 60).padStart(2, "0") });
        if (x.textContent !== t) x.textContent = t;
      });
    } catch (e) { /* 無視 */ }
  }, 1000);
})();
