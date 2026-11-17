/* 貿易クラウドAI商社マン デザイン刷新：21.95 prod（商品登録・取り込み・ドキュメント）の見せ方
   中身（判定・データ）は logic_v2195prod.js（V95P）。ここは刷新版の画面に部品を足すだけ。onclick= と style= は書かない（addEventListener と class）
   No.500 ドキュメントの画面：アップロード・ドロップの前に「公開範囲を選んでアップロード」の窓
          名前だけの行（商品資料の取り込み）：公開範囲の欄（選べる）と 🗑。ほかの名前だけの行：「共有」の札を押すと、元の画面の設定に従うことを説明
   No.483 商品情報の画面：中古車と判定されたままの自動車部品に「自動車部品に直す」の帯 */
(function () {
  "use strict";
  const RD = window.RDX;
  const P = window.V95P;
  if (!RD || !P || RD._v95prod) return;
  RD._v95prod = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const E = P.E, M = P.M;
  const SC = () => (typeof D30_SCOPE !== "undefined" && D30_SCOPE) ? D30_SCOPE : { all: ["共有"], in: ["社内のみ"], me: ["自分だけ"] }; // eslint-disable-line no-undef
  const scNm = (k) => { const v = SC()[k]; return v ? String(v[0]) : k; };
  const scTip = (k) => { try { return typeof v56docsScopeTip === "function" ? v56docsScopeTip(k) : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };

  /* ───── No.500 アップロードの前に公開範囲を選ぶ ───── */
  let dlgOpen = false;
  function closeDlg() { const d = $("#v95pdlg"); if (d) d.remove(); dlgOpen = false; }
  function openDlg(files) {
    closeDlg();
    files = Array.from(files || []).filter((f) => f && f.name);
    if (!files.length) return;
    dlgOpen = true;
    const def = P.SCOPE_DEF;
    const certs = files.filter((f) => P.scopeFor && P.scopeFor(f) === "in" && def !== "in");
    const el = document.createElement("div");
    el.id = "v95pdlg"; el.className = "v95p-dlg"; el.setAttribute("data-noi18n", "1");
    el.innerHTML = `<div class="v95p-dbox" role="dialog" aria-modal="true" aria-labelledby="v95pdh">
      <h3 id="v95pdh">${E(M("公開範囲を選んでアップロード", "Choose visibility, then upload", "选择公开范围后上传", "Elija la visibilidad y suba"))}</h3>
      <p class="v95p-dn">${E(M(`${files.length}件：`, `${files.length} file(s): `, `${files.length} 个：`, `${files.length} archivo(s): `))}${E(files.slice(0, 4).map((f) => f.name).join("・"))}${files.length > 4 ? E(M(` ほか${files.length - 4}件`, ` and ${files.length - 4} more`, ` 等`, ` y ${files.length - 4} más`)) : ""}</p>
      <fieldset class="v95p-fs"><legend>${E(M("だれの一覧に出しますか", "Who should see it in the list?", "在谁的列表中显示？", "¿Quién lo verá en la lista?"))}</legend>
        ${["in", "all", "me"].map((k) => `<label class="v95p-opt"><input type="radio" name="v95psc" value="${k}"${k === def ? " checked" : ""}><span><b>${E(scNm(k))}${k === def ? `<em class="v95p-def">${E(M("はじめの選択", "default", "默认", "predeterminado"))}</em>` : ""}</b><small>${E(scTip(k))}</small></span></label>`).join("")}
      </fieldset>
      <p class="v95p-dn">${E(M("名刺・証明書は「共有」を選んでも「社内のみ」で入ります。あとから一覧の「公開範囲」でいつでも変えられます。", "Business cards and certificates are saved as Internal only even if you choose Shared. You can change it later in the list.", "名片和证书即使选择“共享”也会按“仅限公司内部”保存。之后可在列表中更改。", "Las tarjetas y certificados se guardan como Solo interno aunque elija Compartido. Puede cambiarlo luego en la lista."))}${certs.length ? E(M(`（この中の ${certs.length}件）`, ` (${certs.length} here)`, `（其中 ${certs.length} 个）`, ` (${certs.length} aquí)`)) : ""}</p>
      <div class="v95p-db"><button type="button" class="k-btn" data-v95pgo="1">${E(M("アップロードする", "Upload", "上传", "Subir"))}</button><button type="button" class="k-btn ghost" data-v95pno="1">${E(M("やめる", "Cancel", "取消", "Cancelar"))}</button></div>
    </div>`;
    document.body.appendChild(el);
    const box = $(".v95p-dbox", el);
    el.addEventListener("click", async (e) => {
      if (e.target === el || e.target.closest("[data-v95pno]")) { closeDlg(); return; }
      const go = e.target.closest("[data-v95pgo]");
      if (!go) return;
      const r = $("input[name=v95psc]:checked", el);
      const sc = r ? r.value : P.SCOPE_DEF;
      go.disabled = true;
      closeDlg();
      try { await P.docsUpload(files, sc); } catch (x) { console.error("[rd v95prod] up", x); }
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDlg(); });
    setTimeout(() => { try { const c = $("input[name=v95psc]:checked", el); (c || box).focus(); } catch (x) { /* 無視 */ } }, 30);
  }
  RD.v95pUpload = openDlg;
  // ドキュメントの画面の「アップロード」（#d30up）とドロップ枠（#d30drop）：今のアプリの取り込みより先に受け取り、窓を出す
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!t || t.id !== "d30up" || !t.files || !t.files.length) return;
    const fs = Array.from(t.files);
    e.stopPropagation(); e.stopImmediatePropagation();
    try { t.value = ""; } catch (x) { /* 無視 */ }
    openDlg(fs);
  }, true);
  document.addEventListener("drop", (e) => {
    const z = e.target && e.target.closest ? e.target.closest("#d30drop") : null;
    if (!z || !e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    z.classList.remove("v95p-over");
    try { z.style.removeProperty("border-color"); z.style.removeProperty("background"); } catch (x) { /* 無視 */ }
    openDlg(Array.from(e.dataTransfer.files));
  }, true);

  /* ───── No.479・500 ドキュメントの一覧の名前だけの行 ───── */
  const WHERE = { msg: ["やりとりの添付", "Messages"], legal: ["契約書関連", "Contracts"], deck: ["外国語 営業資料", "Sales decks"], po: ["書類をつくる（発注書）", "Create documents"], demo: ["見本", "Sample"] };
  function docsDom() {
    if (curKey() !== "docs") return;
    const W = $("#d30wrap");
    if (!W) return;
    const ths = $$("thead th", W).map((x) => (x.textContent || "").trim());
    const ci = ths.findIndex((x) => /公開範囲|Visibility|公开范围|Visibilidad/.test(x));
    const li = ths.length - 1;
    $$("tbody tr[data-d30]", W).forEach((tr) => {
      const id = tr.getAttribute("data-d30") || "";
      if (!/^lg:/.test(id) || tr.dataset.v95p) return;
      const kind = id.split(":")[1] || "";
      const td = ci >= 0 ? tr.children[ci] : null;
      if (kind === "srcs") {
        const x = P.lgSrc(id);
        if (!x) return; // 元の資料が見つからないときは印を付けず、次に描くときにもう一度見る
        tr.dataset.v95p = "1";
        const cur = x.s.v95sc || "all";
        if (td) td.innerHTML = `<select class="sel v95p-lsc" data-v95plsc="${E(id)}" aria-label="${E(M("公開範囲", "Visibility", "公开范围", "Visibilidad"))}" title="${E(scTip(cur))}">${["all", "in", "me"].map((k) => `<option value="${k}"${k === cur ? " selected" : ""} title="${E(scTip(k))}">${E(scNm(k))}</option>`).join("")}</select>${cur === "me" ? ' <span class="p or">🔒</span>' : ""}`;
        const ac = tr.children[li];
        if (ac && !$("[data-v95pldel]", ac)) ac.insertAdjacentHTML("beforeend", ` <button type="button" class="btn g v95p-ldel" data-v95pldel="${E(id)}" title="${E(M("取り込んだ情報から削除（ゴミ箱へ・30日以内なら戻せます）", "Delete from imported sources (to Trash; restorable for 30 days)", "从已导入的信息中删除（移入回收站，30天内可恢复）", "Eliminar de fuentes importadas (a la Papelera; 30 días)"))}" aria-label="${E(M("削除", "Delete", "删除", "Eliminar"))}">🗑</button>`);
        return;
      }
      tr.dataset.v95p = "1";
      if (!td) return;
      const w = WHERE[kind] || ["元の画面", "the original screen"];
      const msg = M(`この行は「${w[0]}」の記録です（本体は${w[0]}にあります）。公開範囲は、元の画面の設定に従います。ここでは変えられません。`, `This row is a record from ${w[1]}. Its visibility follows the original screen and cannot be changed here.`, `此行是“${w[0]}”的记录。公开范围遵循原页面的设置，此处无法更改。`, `Esta fila es un registro de ${w[1]}. La visibilidad sigue la pantalla original y no se cambia aquí.`);
      td.innerHTML = `<button type="button" class="v95p-lchip" data-v95plchip="${E(msg)}" title="${E(msg)}">${E(scNm("all"))}<span class="v95p-i" aria-hidden="true">?</span></button>`;
    });
  }
  document.addEventListener("change", (e) => {
    const s = e.target && e.target.closest ? e.target.closest("[data-v95plsc]") : null;
    if (!s) return;
    P.lgScope(s.getAttribute("data-v95plsc"), s.value);
  });
  document.addEventListener("click", (e) => {
    const d = e.target && e.target.closest ? e.target.closest("[data-v95pldel]") : null;
    if (d) { e.preventDefault(); P.lgDel(d.getAttribute("data-v95pldel")); return; }
    const c = e.target && e.target.closest ? e.target.closest("[data-v95plchip]") : null;
    if (c) {
      e.preventDefault();
      const tr = c.closest("tr");
      const old = tr && tr.nextElementSibling && tr.nextElementSibling.classList.contains("v95p-lnote") ? tr.nextElementSibling : null;
      if (old) { old.remove(); return; }
      if (tr) { const n = document.createElement("tr"); n.className = "v95p-lnote"; n.innerHTML = `<td colspan="${tr.children.length}"><span role="note">${E(c.getAttribute("data-v95plchip"))}</span></td>`; tr.after(n); }
      try { if (typeof toast === "function") toast(c.getAttribute("data-v95plchip")); } catch (x) { /* 無視 */ } // eslint-disable-line no-undef
    }
  });

  /* ───── No.483 商品情報：中古車と判定されたままの自動車部品 ───── */
  function carBand() {
    const k = curKey();
    const w = $("#well");
    if (!w) return;
    const old = $("#v95pcar", w);
    let T = null; try { T = typeof TEN !== "undefined" ? TEN : null; } catch (e) { T = null; } // eslint-disable-line no-undef
    const S = (k === "item" || k === "ops:reg") && T ? P.carSuspect(T) : null;
    if (!S) { if (old) old.remove(); return; }
    if (old && old.dataset.k === k) return;
    if (old) old.remove();
    const el = document.createElement("section");
    el.id = "v95pcar"; el.className = "k-card v95p-car rd-x"; el.dataset.k = k; el.setAttribute("role", "alert"); el.setAttribute("data-noi18n", "1");
    el.innerHTML = `<b class="v95p-ch">${E(M("この商品は「自動車部品」ではありませんか？", "Is this product an auto part?", "此商品是否为“汽车零部件”？", "¿Este producto es una autoparte?"))}</b>
      <p>${E(M(`品名に「${S.kw}」とあります。いまの商材カテゴリーは「中古車」のため、車両情報表（型式・走行距離・車台番号）や、輸出抹消仮登録証明書・第三者検査・UN3166 など中古車の規制・書類が出ています。`, `The name contains “${S.kw}”. The category is now “Used cars”, so used-car items (vehicle table, export deregistration certificate, third-party inspection, UN3166) are shown.`, `品名中有“${S.kw}”。当前类别为“二手车”，因此显示了二手车的规定和单据。`, `El nombre contiene «${S.kw}». La categoría es «Autos usados», por eso aparecen requisitos de vehículos usados.`))}</p>
      <p>${E(M("「自動車部品」にすると、規制・必要な書類・業種ごとの項目は部品（工業部品と同じ決まり）として出します。入っている値は消えません。", "Switching to “Auto parts” shows regulations, documents and fields for parts (same rules as industrial parts). Entered values are kept.", "改为“汽车零部件”后，法规、单据和行业项目将按零部件显示。已填写的内容不会删除。", "Con «Autopartes» se muestran normas y documentos de piezas. Los datos se conservan."))}</p>
      <div class="v95p-cb"><button type="button" class="k-btn" data-v95pcar="fix">${E(M("自動車部品に直す", "Change to Auto parts", "改为汽车零部件", "Cambiar a Autopartes"))}</button><button type="button" class="k-btn ghost" data-v95pcar="pick">${E(M("カテゴリーを選び直す", "Choose category", "重新选择类别", "Elegir categoría"))}</button><button type="button" class="k-btn ghost" data-v95pcar="keep">${E(M("中古車のままにする", "Keep Used cars", "保持二手车", "Mantener Autos usados"))}</button></div>`;
    const hero = $("[data-rdhero]", w);
    if (hero) hero.after(el); else w.prepend(el);
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest ? e.target.closest("[data-v95pcar]") : null;
    if (!b) return;
    const a = b.getAttribute("data-v95pcar");
    let T = null; try { T = typeof TEN !== "undefined" ? TEN : null; } catch (x) { T = null; } // eslint-disable-line no-undef
    if (a === "fix") P.carFix(T);
    else if (a === "keep") P.carKeep(T);
    else if (a === "pick") { try { if (typeof window.v92itemCatOpen === "function") window.v92itemCatOpen(); } catch (x) { console.error("[rd v95prod] cat", x); } }
    const el = $("#v95pcar"); if (el && a !== "pick") el.remove();
  });

  /* ───── いつ描くか ───── */
  function paint() { try { docsDom(); } catch (e) { console.error("[rd v95prod] docs", e); } try { carBand(); } catch (e) { console.error("[rd v95prod] car", e); } }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { paint(); } catch (e) { /* 無視 */ } return r; };
  // 今のアプリが表だけを描き直すこと（d30Rerender）があるので、#well の追加を見て印を付け直す
  let raf = 0;
  const mo = new MutationObserver(() => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; paint(); }); });
  function watch() { const w = $("#well"); if (w && !w._v95p) { w._v95p = 1; mo.observe(w, { childList: true, subtree: true }); } }
  setInterval(() => { if (document.hidden) return; watch(); paint(); }, 1500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { watch(); paint(); }); else { watch(); paint(); }
})();
