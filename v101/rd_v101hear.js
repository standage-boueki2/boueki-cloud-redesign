/* 22.01 hear：刷新版での見せ方（中身は logic_v2201hear.js）。2026-11-22 第14回 UAT の直し
   No.610 書類の画面・出荷の画面・商品情報の「寸法・重量を入れる」：何の表か分からない2列の表ではなく、
          単品／外装（カートン）の縦・横・高さ・重さ・入数を単位つきで入れる欄と「まだ分からない」を、その場に出す。
          「まだ分からない」を選んだ商品は、書類の画面に「寸法・重量：未確認」と、要る書類（梱包明細・S/I・運賃の見積）を出す。
   No.610 商品情報：「不明」と答えて登録しなかった欄を「未確認」として出す（何と答えたか・どこで入れるか）。
   No.614 商品情報：材質表から外した規制の注記（RoHS・REACH は記載なし など）を、表の下の注記として出す。 */
(function () {
  "use strict";
  const W = window, V = W.V101HEAR;
  if (!V || W.__v101hearRd) return;
  W.__v101hearRd = 1;
  const M = V.M, E = V.E, err = V.e;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const userT = (t) => !!(t && (t.src === "upload" || t.src === "sample2"));
  const toast = (m) => { try { if (typeof W.toast === "function") W.toast(m); } catch (e) { /* 無視 */ } };
  const rerender = () => { try { if (typeof render === "function") render(); } catch (e) { err("render", e); } }; // eslint-disable-line no-undef

  /* ════════════ 寸法・重量を入れる欄 ════════════ */
  function val(x) { return x == null ? "" : String(Math.round(x * 100) / 100); }
  function formHtml(kind) {
    const t = ten() || {};
    const d = W.v101dims(t);
    const U = d.unit || {}, C = d.carton || {};
    // 今の値（cm・kg で持っているので、表示は mm・kg／g に戻す）
    const mm = (x) => (x == null ? "" : val(x * 10));
    const ug = U.w == null ? "" : (U.w < 1 ? val(U.w * 1000) : val(U.w));
    const ugu = U.w != null && U.w >= 1 ? "kg" : "g";
    const inp = (f, lab, v, w) => `<label class="v101dim-f"><span>${E(lab)}</span><input type="text" inputmode="decimal" autocomplete="off" data-f="${f}" value="${E(v)}" aria-label="${E(lab)}" style="width:${w || 64}px"></label>`;
    const sel = (f, opts, cur, lab) => `<select data-f="${f}" aria-label="${E(lab)}">${opts.map((o) => `<option value="${o}"${o === cur ? " selected" : ""}>${o}</option>`).join("")}</select>`;
    const why = kind === "freight" ? M("運賃の見積を物流会社に頼むには、外装（カートン）の縦・横・高さ・重さ・入数が要ります。", "Freight quotes need the carton length, width, height, weight and units per carton.", "向物流公司请求运费报价，需要外箱的长・宽・高・重量・入数。", "Las cotizaciones de flete necesitan largo, ancho, alto, peso y unidades por caja.")
      : kind === "pl" ? M("梱包明細（PL）・船積依頼書（S/I）には、外装（カートン）の寸法・重さ・入数が要ります。", "The packing list and shipping instructions need the carton size, weight and units per carton.", "装箱单・托运单需要外箱尺寸・重量・入数。", "La lista de empaque y las instrucciones de embarque necesitan medidas, peso y unidades por caja.")
        : M("数字だけで入れてください。分からない欄は空のままで大丈夫です（「不明」とは書かずに空のままに）。", "Enter figures only. Leave unknown boxes empty (do not type “unknown”).", "请只填写数字。不知道的栏留空即可（不要写“不明”）。", "Introduzca solo cifras. Deje vacías las que no sepa (no escriba «no sé»).");
    const unk = t.v101hunk && t.v101hunk.dimRows ? `<p class="v101dim-was">${E(M(`前に「${t.v101hunk.dimRows.v}」と答えた分は、寸法として登録せず「未確認」として控えています。`, `Your earlier answer “${t.v101hunk.dimRows.v}” was not registered as dimensions; it is kept as “not confirmed”.`, `之前回答的“${t.v101hunk.dimRows.v}”未登记为尺寸，记为“未确认”。`, `Su respuesta anterior «${t.v101hunk.dimRows.v}» no se registró como medidas; queda «sin confirmar».`))}</p>` : "";
    return `<div class="v101dim" data-v101dim="${E(kind || "")}" data-noi18n role="group" aria-label="${E(M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas"))}">
  <p class="v101dim-h"><b>${E(M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas y peso"))}</b> <small>${E(why)}</small></p>${unk}
  <fieldset class="v101dim-g"><legend>${E(M("単品（1個・1本・1袋）", "Unit (one piece)", "单品（1个）", "Unidad (1 pieza)"))}</legend>
    <div class="v101dim-row">${inp("ul", M("縦", "Length", "长", "Largo"), mm(U.l))}<i>×</i>${inp("uw", M("横", "Width", "宽", "Ancho"), mm(U.wd))}<i>×</i>${inp("uh", M("高さ", "Height", "高", "Alto"), mm(U.h))}${sel("du", ["mm", "cm"], "mm", M("単品の寸法の単位", "Unit size unit"))}</div>
    <div class="v101dim-row">${inp("ug", M("重さ", "Weight", "重量", "Peso"), ug)}${sel("ugu", ["g", "kg"], ugu, M("単品の重さの単位", "Unit weight unit"))}</div>
  </fieldset>
  <fieldset class="v101dim-g"><legend>${E(M("外装（カートン・段ボール1箱）", "Carton (one shipping box)", "外箱（1箱）", "Caja (1 caja de envío)"))}</legend>
    <div class="v101dim-row">${inp("cl", M("縦", "Length", "长", "Largo"), mm(C.l))}<i>×</i>${inp("cw", M("横", "Width", "宽", "Ancho"), mm(C.wd))}<i>×</i>${inp("ch", M("高さ", "Height", "高", "Alto"), mm(C.h))}${sel("cu", ["mm", "cm"], "mm", M("外装の寸法の単位", "Carton size unit"))}</div>
    <div class="v101dim-row">${inp("cg", M("重さ", "Weight", "重量", "Peso"), val(C.w))}${sel("cgu", ["kg", "g"], "kg", M("外装の重さの単位", "Carton weight unit"))}${inp("cn", M("入数", "Units/carton", "入数", "Unid./caja"), d.perCtn == null ? "" : String(d.perCtn))}</div>
  </fieldset>
  <p class="v101dim-msg" role="status" aria-live="polite"></p>
  <div class="v101dim-btns">
    <button class="btn" type="button" data-v101dim-act="save">${E(M("登録する", "Register", "登记", "Registrar"))}</button>
    <button class="btn g" type="button" data-v101dim-act="later">${E(M("まだ分からない：寸法の要らない書類（見積書・請求書）を先に作る", "Not known yet: make documents that do not need dimensions first", "还不知道：先制作不需要尺寸的单据", "Aún no lo sé: crear primero los documentos sin medidas"))}</button>
    <button class="btn g" type="button" data-v101dim-act="table">${E(M("表で直す", "Edit as a table", "用表格修改", "Editar como tabla"))}</button>
  </div>
  <p class="v101dim-note">${E(M("見積書・PI・請求書は、寸法・重量が無くても作れます。梱包明細（PL）・船積依頼書（S/I）・運賃の見積は、外装の寸法・重さ・入数を入れてから作れます。", "Quotations, PIs and invoices can be made without dimensions/weight. The packing list, shipping instructions and freight quotes need the carton size, weight and units per carton.", "报价单・PI・发票无需尺寸・重量即可制作。装箱单・托运单・运费报价需先填写外箱尺寸・重量・入数。", "Cotizaciones, PI y facturas se pueden crear sin medidas. La lista de empaque, las instrucciones de embarque y el flete necesitan medidas, peso y unidades por caja."))}</p>
</div>`;
  }
  W.v101hearDimForm = formHtml;
  function dialog(kind) {
    try {
      if (typeof openDW !== "function") return false; // eslint-disable-line no-undef
      openDW(`<div class="dwhead"><h3>${E(M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas y peso"))}</h3></div><div class="dwbody" style="overflow:auto;display:block;padding:12px 18px 16px">${formHtml(kind)}</div>`); // eslint-disable-line no-undef
      try { if (typeof dwChrome === "function") dwChrome(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      setTimeout(() => { try { const i = document.querySelector('#pn .v101dim input[data-f="cl"]') || document.querySelector(".v101dim input"); if (i) i.focus(); } catch (e) { /* 無視 */ } }, 60);
      V.n.dlg = (V.n.dlg || 0) + 1;
      return true;
    } catch (e) { err("dialog", e); return false; }
  }
  W.v101hearDimDialog = dialog;
  function readForm(box) {
    const f = {};
    box.querySelectorAll("[data-f]").forEach((el) => { f[el.getAttribute("data-f")] = el.value; });
    return f;
  }
  function inDialog(box) { return !!(box && box.closest && box.closest("#pn")); }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest ? ev.target.closest("[data-v101dim-act]") : null;
      if (!b) return;
      const act = b.getAttribute("data-v101dim-act");
      const box = b.closest(".v101dim") || document.querySelector(".v101dim");
      if (act === "focus") { ev.preventDefault(); ev.stopPropagation(); const i = box ? box.querySelector('input[data-f="cl"]') : document.querySelector('.v101dim input[data-f="cl"]'); if (i) { i.scrollIntoView({ block: "center" }); i.focus(); } else dialog(""); return; }
      if (!box) return;
      ev.preventDefault(); ev.stopPropagation();
      const msg = box.querySelector(".v101dim-msg");
      const say = (s, bad) => { if (msg) { msg.textContent = s; msg.classList.toggle("bad", !!bad); } };
      if (act === "save") {
        const r = V.setDims(readForm(box));
        if (!r.ok) { say(r.msg, true); try { (box.querySelector("input") || {}).focus && (r.bad ? [...box.querySelectorAll("input")].find((x) => x.value && !W.v101num(x.value)) || box.querySelector("input") : box.querySelector("input")).focus(); } catch (e) { /* 無視 */ } return; }
        say(r.msg, false);
        toast(r.msg);
        const kind = box.getAttribute("data-v101dim") || "";
        if (inDialog(box)) { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
        rerender();
        if (kind === "freight") toast(r.dims && r.dims.ok ? M("寸法・重量を登録しました。もう一度「AI見積を依頼」を押すと、物流会社に頼めます", "Registered. Press “Request AI quote” again to ask forwarders.") : r.msg);
        return;
      }
      if (act === "later") {
        V.dimLater(true);
        const m = M("寸法・重量は「未確認」のまま進めます。見積書・PI・請求書は作れます。梱包明細・S/I・運賃の見積は、寸法を入れてから作れます（要確認）。", "Continuing with dimensions/weight “not confirmed”. Quotations, PIs and invoices can be made; the packing list, S/I and freight quotes need the dimensions first.", "尺寸・重量以“未确认”继续。可制作报价单・PI・发票；装箱单・托运单・运费报价需先填写尺寸。", "Se continúa con medidas «sin confirmar». Puede crear cotizaciones, PI y facturas; la lista de empaque, S/I y el flete necesitan las medidas.");
        say(m, false); toast(m);
        if (inDialog(box)) { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
        rerender();
        return;
      }
      if (act === "table") {
        try { if (typeof closeDW === "function" && inDialog(box)) closeDW(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        setTimeout(() => { try { W.openTableEdit("dim", { v101table: 1 }); } catch (e) { err("table", e); } }, 30);
        return;
      }
      if (act === "undo-later") { V.dimLater(false); rerender(); toast(M("「まだ分からない」を取り消しました", "“Not known yet” was undone")); }
    } catch (e) { err("click", e); }
  }, true);
  // 欄の中で Enter を押したら「登録する」
  document.addEventListener("keydown", (ev) => {
    try { if (ev.key === "Enter" && ev.target && ev.target.closest && ev.target.closest(".v101dim") && ev.target.tagName === "INPUT") { ev.preventDefault(); const b = ev.target.closest(".v101dim").querySelector('[data-v101dim-act="save"]'); if (b) b.click(); } } catch (e) { /* 無視 */ }
  }, true);

  // 足りない項目の案内（書類の画面の箱・出荷案件を作る前の窓）：寸法・重量の行の下に、その場で入れる欄を出す
  V.wrap("v68trNeedHtml", (o) => function () {
    let h = o.apply(this, arguments);
    try {
      const t = ten();
      if (h && t && userT(t) && /openTableEdit\('dim'\)/.test(h) && !/class="v101dim"/.test(h)) {
        h = String(h).replace(/data-onclick="try\{openTableEdit\('dim'\)\}catch\(e\)\{\}"/, 'data-v101dim-act="focus"');
        h = h.replace(/<\/ul><\/div>\s*$/, "</ul>" + formHtml("") + "</div>");
        if (!/class="v101dim"/.test(h)) h += formHtml("");
        V.n.needForm = (V.n.needForm || 0) + 1;
      }
    } catch (e) { err("needHtml", e); }
    return h;
  });
  // 商品情報などの「寸法・重量の表を編集」：同じ欄を開く（今までの表は「表で直す」から開ける）
  V.wrap("openTableEdit", (o) => function (kind, opt) {
    try {
      const t = ten();
      if (kind === "dim" && !(opt && opt.v101table) && t && userT(t)) { if (dialog("")) return; }
    } catch (e) { err("ote", e); }
    return o.apply(this, arguments);
  });

  /* ════════════ 書類をつくる：寸法「未確認」の出荷案件 ════════════ */
  function noDimNote() {
    const t = ten();
    const S = dd() && dd().ship;
    if (!t || !userT(t) || !S) return "";
    const d = W.v101dims(t);
    if (d.ok) return "";
    const lack = d.any ? d.missing.join("・") : M("寸法・重量", "dimensions/weight");
    const ttl = d.any ? M("外装（カートン）の寸法・重さ：未確認", "Carton size/weight: not confirmed", "外箱尺寸・重量：未确认", "Medidas/peso de la caja: sin confirmar") : M("寸法・重量：未確認", "Dimensions/weight: not confirmed", "尺寸・重量：未确认", "Medidas y peso: sin confirmar");
    return `<div class="v101dimst" data-v101dimst="1" role="note" data-noi18n><b>${E(ttl)}</b>（${E(M("足りないのは ", "missing: ", "缺少：", "falta: "))}${E(lack)}）<br>
    <span>${E(M("見積書・請求書は作れます。梱包明細（PL）・船積依頼書（S/I）・運賃の見積は「要確認」です。外装の寸法・重さ・入数を入れると作れます。", "Quotations and invoices can be made. The packing list, S/I and freight quotes are “to confirm” until the carton size, weight and units per carton are entered.", "可制作报价单・发票。装箱单・托运单・运费报价为“待确认”，填写外箱尺寸・重量・入数后即可制作。", "Puede crear cotizaciones y facturas. La lista de empaque, S/I y el flete quedan «por confirmar» hasta introducir medidas, peso y unidades por caja."))}</span>
    <button class="btn g" type="button" data-v101dim-open="pl">${E(M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas"))}</button>${t.v101dimLater ? ` <button class="btn g" type="button" data-v101dim-act="undo-later">${E(M("「まだ分からない」を取り消す", "Undo “not known yet”", "取消“还不知道”", "Deshacer «aún no lo sé»"))}</button>` : ""}</div>`;
  }
  document.addEventListener("click", (ev) => {
    try { const b = ev.target && ev.target.closest ? ev.target.closest("[data-v101dim-open]") : null; if (!b) return; ev.preventDefault(); ev.stopPropagation(); dialog(b.getAttribute("data-v101dim-open") || ""); } catch (e) { err("open", e); }
  }, true);
  V.wrap("vOpsDoc", (o) => function () {
    let h = o.apply(this, arguments);
    try {
      const n = noDimNote();
      if (n && typeof h === "string" && !/data-v101dimst/.test(h)) {
        const i = h.indexOf('<div id="dO"');
        h = i >= 0 ? h.slice(0, i) + n + h.slice(i) : n + h;
      }
    } catch (e) { err("opsDoc", e); }
    return h;
  });
  V.wrap("vShipBody", (o) => function () {
    let h = o.apply(this, arguments);
    try { const n = noDimNote(); if (n && typeof h === "string" && !/data-v101dimst/.test(h)) h = n + h; } catch (e) { err("shipBody", e); }
    return h;
  });

  /* ════════════ 商品情報：未確認の欄・材質表の注記 ════════════ */
  const UNK_NM = { dimRows: ["寸法・重量", "Dimensions/weight"], moq: ["最小発注数量（MOQ）", "MOQ"], lead: ["リードタイム", "Lead time"], ctn: ["パレット・コンテナ入数", "Pallet/container load"], priceRows: ["価格表", "Price list"] };
  function itemNote() {
    const t = ten();
    if (!t || !userT(t)) return "";
    let h = "";
    const U = t.v101hunk || {};
    const ks = Object.keys(U).filter((k) => UNK_NM[k] && !(Array.isArray(t[k]) ? t[k].length : String(t[k] || "").trim()));
    if (ks.length) {
      h += `<div class="v101hunk" data-v101hunk="${ks.join(",")}" role="note" data-noi18n><b>${E(M("未確認の項目", "Not confirmed", "未确认的项目", "Sin confirmar"))}</b>：` +
        ks.map((k) => `${E(M(UNK_NM[k][0], UNK_NM[k][1]))}（${E(M(`「${U[k].v}」と回答・値として登録していません`, `answered “${U[k].v}” — not registered as a value`, `回答“${U[k].v}”・未作为数值登记`, `respondió «${U[k].v}» — no registrado como valor`))}）`).join("、") +
        (ks.indexOf("dimRows") >= 0 ? ` <button class="btn g" type="button" data-v101dim-open="">${E(M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas"))}</button>` : "") + `</div>`;
    }
    const R = Array.isArray(t.v101regNote) ? t.v101regNote : [];
    if (R.length) {
      h += `<div class="v101regnote" data-v101regnote="${R.length}" role="note" data-noi18n><b>${E(M("材質・成分の表の注記", "Note on the material table", "材质・成分表的注记", "Nota de la tabla de materiales"))}</b>：${R.map((x) => E(x)).join("／")}<br><small>${E(M("規制への対応の書き込みは、表の行（部位・材料）ではなく注記として控えています。資料に載せる前に確かめてください。", "Regulatory remarks are kept as notes, not as rows (parts/materials) of the table. Please check them before using in materials.", "关于法规对应的记载作为注记保存，而不是表格的行。用于资料前请确认。", "Las observaciones regulatorias se guardan como notas, no como filas de la tabla. Compruébelas antes de usarlas."))}</small></div>`;
    }
    return h;
  }
  W.v101hearItemNote = itemNote;
  function paintItem() {
    try {
      if (!W.RDX || typeof W.RDX.curKey !== "function") return;
      const k = W.RDX.curKey();
      if (k !== "item") return;
      const well = document.getElementById("well") || document.querySelector("main");
      if (!well) return;
      const h = itemNote();
      const old = well.querySelector("[data-v101item]");
      if (!h) { if (old) old.remove(); return; }
      if (old && old.getAttribute("data-h") === String(h.length)) return;
      const box = document.createElement("div");
      box.setAttribute("data-v101item", "1"); box.setAttribute("data-h", String(h.length));
      box.innerHTML = h;
      if (old) old.replaceWith(box);
      else {
        // 材質・成分の表（④ 業種ごとの項目の前の「② 成分・材質」）の近く：見つからなければ先頭のカードの後
        const anchor = well.querySelector("[data-v68notes]") || well.querySelector(".c");
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling); else well.prepend(box);
      }
    } catch (e) { err("paintItem", e); }
  }
  /* ════════════ 22.01.1（612 の残り・v1 N8・v2-8）日本語の画面の並び：項目名の「・」と区切りの「・」が同じで、数より多く見える ════════════
     データの文（英・中・西の訳の層が辞書で「・」つなぎを切り分けて訳す）は変えず、日本語の表示のときだけ、画面の上で区切りを「、」に。
     並んだ項目の名前は、同じ数え方の関数（scoreOf・v90ctyOptMiss・v92prodFill）から取り、文と一致したときだけ直す（推し量りで切らない）。 */
  function textNodes(el) { const a = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) a.push(w.currentNode); return a; }
  function rejoin(node, names, tail) {
    // node の文の中の names.join("・") を names.join("、") に（tail は「 ほか」「 など」）
    const v = String(node.nodeValue || "");
    const a = names.join("・") + (tail || ""), b = names.join("、") + (tail || "");
    if (names.length < 2 || v.indexOf(a) < 0 || a === b) return false;
    node.nodeValue = v.replace(a, b);
    return true;
  }
  // 英・中・西の画面：「Optional items not registered: N — a · b, c」（訳の層が「・」つなぎを辞書で切るときに、2つの項目を1つにまとめることがある）
  //   → 同じ数え方の関数の項目名を1つずつ訳して並べ直す（訳の層が触らないよう data-noi18n の span に置き換える）
  function trName(n) { try { const d = (typeof I18N !== "undefined" && I18N && I18N.dict && I18N.dict[I18N.lang]) || {}; const v = d[n]; return typeof v === "string" && v ? v : n; } catch (e) { return n; } } // eslint-disable-line no-undef
  function fixListsOther() {
    try {
      const l = V.lang(); if (l === "ja") return 0;
      const t = ten(); const well = document.getElementById("well");
      if (!t || !well || !userT(t)) return 0;
      let opt = [];
      try { opt = (typeof W.v90ctyOptMiss === "function" ? W.v90ctyOptMiss(t) : []).map((x) => trName(String(x.n))); } catch (e) { opt = []; }
      let n = 0;
      textNodes(well).forEach((nd) => {
        const v = String(nd.nodeValue || "");
        const m = v.match(/^(\s*)(Optional items not registered: |Elementos opcionales sin registrar: )(\d+) — (.+?)( \((?:adding|al añadir)[\s\S]*)$/) || v.match(/^(\s*)(选填项目未登记 )(\d+) 项：(.+?)(（填写后[\s\S]*)$/);
        if (!m || +m[3] !== opt.length || !opt.length) return;
        const sep = l === "zh" ? "、" : ", ";
        const lst = opt.join(sep);
        if (m[4] === lst) return;
        const sp = document.createElement("span"); sp.setAttribute("data-noi18n", "1"); sp.setAttribute("data-v101list", "1");
        sp.textContent = m[1] + m[2] + m[3] + (l === "zh" ? " 项：" : " — ") + lst + m[5];
        nd.parentNode.insertBefore(sp, nd); nd.parentNode.removeChild(nd);
        n++;
      });
      if (n) V.n.listOther = (V.n.listOther || 0) + n;
      return n;
    } catch (e) { err("listOther", e); return 0; }
  }
  V.fixListsOther = fixListsOther;
  function fixListsJa() {
    try {
      if (V.lang() !== "ja") return fixListsOther();
      const t = ten();
      const well = document.getElementById("well");
      if (!t || !well || !userT(t)) return 0;
      let n = 0;
      // 「足りないのは N項目（a・b・c ほか）」
      let miss = [];
      try { miss = (typeof scoreOf === "function" ? scoreOf(t).missing : []).map((m) => String(m.n)); } catch (e) { miss = []; } // eslint-disable-line no-undef
      well.querySelectorAll("b").forEach((b) => {
        const m = String(b.textContent || "").trim().match(/^足りないのは(\d+)項目$/);
        if (!m || b.childElementCount) return;
        try { if (b.parentElement) plainTerms(b.parentElement); } catch (e) { /* 無視 */ } // 22.01.2 w1-9：読み上げで項目名・用語（リードタイム・関税率）が抜けないよう、要約の中の用語の印を外す
        const N = +m[1];
        const L = miss.slice(0, 4);
        if (!L.length || N !== miss.length || L.length < 2) return;
        // 用語の説明の印（span）で文字が分かれていることがあるので、<b> の後ろの文字をつないで区切りの位置を探す
        const el = b.parentElement; if (!el) return;
        const all = textNodes(el); const i0 = all.findIndex((x) => b.contains(x)); if (i0 < 0) return;
        const after = all.slice(i0 + 1).filter((x) => !b.contains(x));
        let txt = ""; const map = [];
        for (const nd of after) { map.push([nd, txt.length]); txt += String(nd.nodeValue || ""); if (txt.indexOf("）") >= 0) break; }
        const a = txt.indexOf("（"), z = txt.indexOf("）", a + 1);
        if (a < 0 || z < 0) return;
        const inner = txt.slice(a + 1, z), want = L.join("・") + (N > 4 ? " ほか" : "");
        if (inner !== want) return;
        let pos = a + 1;
        L.slice(0, -1).forEach((nm) => {
          pos += nm.length; // 区切りの「・」の位置
          for (let j = map.length - 1; j >= 0; j--) { if (map[j][1] <= pos) { const nd = map[j][0], off = pos - map[j][1], v = String(nd.nodeValue || ""); if (v[off] === "・") nd.nodeValue = v.slice(0, off) + "、" + v.slice(off + 1); break; } }
          pos += 1;
        });
        n++;
      });
      // 「任意の項目で未登録 N件：a・b（入れると…）」「任意 あとN件（a・b など）」
      let opt = [];
      try { opt = (typeof W.v90ctyOptMiss === "function" ? W.v90ctyOptMiss(t) : []).map((x) => String(x.n)); } catch (e) { opt = []; }
      let optM = [], needM = [];
      try {
        const K = typeof W.v92prodFill === "function" ? W.v92prodFill(t) : null;
        optM = K && Array.isArray(K.optMiss) ? K.optMiss.map((x) => String(x.n)) : [];
        // 「商品情報を登録」の「残り N項目（a・b など）」「全体 c/d：あと a・b など」（同じ数え方 v92prodFill の missKeys と名前 v92prodNm）
        needM = K && Array.isArray(K.missKeys) ? K.missKeys.map((k) => (k === "hs" && K.hsGuess ? "HSコード（推定・要確認）" : (typeof W.v92prodNm === "function" ? String(W.v92prodNm(k, t)) : k))) : [];
      } catch (e) { optM = []; needM = []; }
      // 一覧の文の中の用語の印を先に外す（読み上げで抜けないように）
      well.querySelectorAll(".k-v90optl span, li.ng, .rd-empty").forEach((el) => { if (/任意の項目で未登録 \d+件|任意 あと\d+件|残り \d+項目|：あと /.test(el.textContent || "")) plainTerms(el); });
      textNodes(well).forEach((nd) => {
        const v = String(nd.nodeValue || "");
        if (/任意の項目で未登録 \d+件：/.test(v)) { if (rejoin(nd, opt, "")) n++; }
        else if (/任意 あと\d+件（/.test(v)) { if (rejoin(nd, optM.slice(0, 2), optM.length > 2 ? " など" : "")) n++; }
        else if (/残り \d+項目（/.test(v) || /全体 \d+\/\d+：あと /.test(v)) { if (rejoin(nd, needM.slice(0, 2), needM.length > 2 ? " など" : "")) n++; }
      });
      if (n) V.n.listJa = (V.n.listJa || 0) + n;
      return n;
    } catch (e) { err("listJa", e); return 0; }
  }
  V.fixListsJa = fixListsJa;

  /* ════════════ 22.01.2（w1-3）商品情報の出どころ：📎で取り込んだ資料を「手入力（資料なし）」と書かない ════════════ */
  V.wrap("vItem", (o) => function () {
    let h = String(o.apply(this, arguments));
    try {
      const t = ten();
      if (!t || !userT(t) || !/^手入力/.test(String(t.file || "").trim())) return h;
      const files = typeof V.fileNames === "function" ? V.fileNames(t) : [];
      if (!files.length) return h;
      const S = t.v101srcOf || {};
      const lst = files.join(M("、", ", ", "、", ", "));
      const btn = `<button type="button" class="btn g" data-v101srcs="1" style="padding:2px 9px;font-size:11px;margin-left:6px">${E(M("取り込んだ資料の一覧", "Imported files", "已导入的资料", "Archivos importados"))}</button>`;
      const head = `<span class="src" data-v101src="${files.length}" data-noi18n>📄 ${E(M(`取り込んだ資料（${files.length}件）：${lst}（ヒアリングの答えと合わせて登録）`, `Imported files (${files.length}): ${lst} (registered together with your interview answers)`, `已导入的资料（${files.length}件）：${lst}（与问答的回答一起登记）`, `Archivos importados (${files.length}): ${lst} (registrados junto con sus respuestas)`))}${btn}</span>`;
      h = h.replace(/<span class="src">(?:📄|✍) [^<]*?<\/span>/, head);
      // 成分・材質表の下：どの資料から入ったか（分からなければ「資料とヒアリングの答えから」）
      const cf = S.compRows ? M(`${S.compRows} から取り込み`, `Imported from ${S.compRows}`, `从 ${S.compRows} 导入`, `Importado de ${S.compRows}`) : M(`取り込んだ資料（${lst}）とヒアリングの答えから`, `From the imported files (${lst}) and your interview answers`, `来自已导入的资料（${lst}）和问答的回答`, `De los archivos importados (${lst}) y sus respuestas`);
      h = h.replace(/(<p class="nn" style="margin-top:8px")>(?:手入力（資料なし） から取り込み|手入力で登録|Imported from 手入力（資料なし）)(<\/p>)/, (m0, a, b) => `${a} data-v101src="comp" data-noi18n>${E(cf)}${b}`);
      V.n.srcShow = (V.n.srcShow || 0) + 1;
    } catch (e) { err("srcShow", e); }
    return h;
  });
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest ? ev.target.closest("[data-v101srcs]") : null;
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      if (W.RDX && typeof W.RDX.goKey === "function") W.RDX.goKey("srcs"); else if (typeof W.go === "function") W.go("srcs");
    } catch (e) { err("srcsGo", e); }
  }, true);

  /* ════════════ 22.01.2（w1-9）読み上げ：一覧の項目名が用語の印（span.tm・abbr.k-term）の中に入ると、読み上げの文字から抜ける ════════════
     この層が直す一覧（要約の「足りないのは」・任意の項目・残りの項目）だけ、用語の印を外して普通の文字にし、data-noterm で付け直されないようにする */
  function plainTerms(el) {
    try {
      if (!el || !el.querySelectorAll) return 0;
      let n = 0;
      el.querySelectorAll(".tm, .v54term, abbr.k-term").forEach((x) => { if (x.closest(".k-termdemo")) return; x.replaceWith(document.createTextNode(x.textContent || "")); n++; });
      if (!el.hasAttribute("data-noterm")) el.setAttribute("data-noterm", "");
      // 刷新版の用語の印（termScan）は data-noterm を見ないので、その「付けない」一覧（.k-termhint）にも入れる（外す→付け直す→外す…の繰り返しにしない）
      if (!el.classList.contains("k-termhint") && !(el.closest && el.closest(".rd-hero"))) { el.classList.add("k-termhint"); el.setAttribute("data-v101plain", "1"); }
      if (n) { el.normalize(); V.n.plainTerm = (V.n.plainTerm || 0) + n; }
      return n;
    } catch (e) { err("plainTerms", e); return 0; }
  }
  V.plainTerms = plainTerms;

  V.wrap("render", (o) => function () { const r = o.apply(this, arguments); try { setTimeout(paintItem, 0); setTimeout(fixListsJa, 0); setTimeout(fixListsJa, 400); } catch (e) { /* 無視 */ } return r; });
  try { const mo = new MutationObserver(() => { if (!V.__pi) { V.__pi = 1; setTimeout(() => { V.__pi = 0; paintItem(); fixListsJa(); }, 120); } }); const st = () => { const w = document.getElementById("well"); if (w) mo.observe(w, { childList: true, subtree: true }); else setTimeout(st, 500); }; st(); } catch (e) { err("mo", e); }
})();
