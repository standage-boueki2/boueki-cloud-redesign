/* 貿易クラウドAI商社マン デザイン刷新：21.96 prod（商品の登録・取り込み・商品情報）の見せ方
   中身（判定・データ）は logic_v2196prod.js（V96P）。ここは刷新版の画面の文と部品を直すだけ。onclick= と style= は書かない（addEventListener と class）
   No.516 商品登録の取り込みの枠・取り込んだ情報・ドキュメントに、対応している形式と「Zip などの圧縮ファイル・実行ファイルは受け付けません」を出す
          （21.95 までの「ZIP」の札・「Zip も可」「複数ファイルは Zip にまとめて」の文を直す）。ファイル選択の accept も対応形式に
   No.511 商品情報：英文社名が未登録で、辞書で案を作れないとき、未登録であることと入れ方を1行で（「英文社名を入れる」で入れる窓）
   No.513 取り込みの画面の「必要な項目はそろっています」「商品の情報はそろっています」も、商品情報と同じ数え方（v92prodFill）で出す
   いつ：画面を描いたあと（RDX.after）と、#well の追加（MutationObserver）。何度回しても同じ結果 */
(function () {
  "use strict";
  const RD = window.RDX;
  const P = window.V96P;
  if (!RD || !P || RD._v96prod) return;
  RD._v96prod = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const E = P.E, M = P.M;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN && (TEN.src === "upload" || TEN.src === "sample2")) ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fmtNote = (scope) => `<span class="v96p-fmt" data-noi18n="1" data-v96fmt="${scope}"><b>${E(M("対応している形式：", "Supported: ", "支持的格式：", "Admitidos: "))}</b>${E(P.fmtList(scope))}<span class="v96p-fng">${E(M("Zip などの圧縮ファイル・実行ファイルは「対応していない形式」として受け付けません。", "Compressed (Zip, etc.) and executable files are not accepted (unsupported format).", "Zip 等压缩文件和可执行文件属于“不支持的格式”，不予接收。", "No se aceptan archivos comprimidos (Zip, etc.) ni ejecutables (formato no admitido)."))}</span></span>`;

  /* ───── No.516 取り込みの画面（刷新版の枠・今の版の枠） ───── */
  function upPage() {
    const w = $("#well"); if (!w) return;
    // 刷新版の「商品の資料をアップロード」：ZIP の札を外し、形式を並べ直す
    $$(".rd-fmt", w).forEach((f) => {
      if (f.getAttribute("data-v96") === "1") return;
      f.setAttribute("data-v96", "1"); f.setAttribute("data-noi18n", "1");
      f.innerHTML = [["Excel", "Excel"], ["CSV・テキスト", "CSV / text"], ["Word", "Word"], ["PowerPoint", "PowerPoint"], ["PDF", "PDF"], ["画像（PNG・JPG）", "Images (PNG, JPG)"]].map((x) => `<span class="v96p-chip">${E(M(x[0], x[1], x[0], x[1]))}</span>`).join("");
      const card = f.closest(".rd-card");
      const note = card ? $(".rd-note", card) : null;
      if (note && !$(".v96p-fmt", card)) note.insertAdjacentHTML("afterend", `<p class="rd-note">${fmtNote("prod")}</p>`);
    });
    // 今の版の枠（#drop）と、その上の説明
    const dz = $("#drop", w);
    if (dz && !dz.getAttribute("data-v96")) {
      dz.setAttribute("data-v96", "1");
      $$("p", dz).forEach((p) => {
        if (!/Zip/i.test(p.textContent || "")) return;
        p.setAttribute("data-noi18n", "1");
        p.innerHTML = `<b>${E(M("複数のファイルを一度に選べます", "You can choose several files at once", "可一次选择多个文件", "Puede elegir varios archivos a la vez"))}</b>${E(M("（Zip などの圧縮ファイルは受け付けません）。中身を全部読み込み、1つの商品の資料にまとめます", " (compressed files such as Zip are not accepted). Everything is read and merged into one product's documents", "（不接收 Zip 等压缩文件）。会全部读取并合并为一个商品的资料", " (no se aceptan archivos comprimidos como Zip). Se lee todo y se une en los documentos de un producto"))}`;
      });
      const c = dz.closest(".c");
      const nn = c ? $$("p.nn", c).find((p) => /Zip/i.test(p.textContent || "") && p.compareDocumentPosition(dz) & Node.DOCUMENT_POSITION_FOLLOWING) : null;
      if (nn) {
        nn.setAttribute("data-noi18n", "1");
        nn.innerHTML = `${E(M("①商品情報 ②価格表・寸法 ③成分表・素材表 の3種類がそろうと、AIが最も正確に働きます。PDF・画像の高精度読み取りは、管理者がAIエンジンを接続している場合に有効です。", "The AI works best when all three are present: ① product info, ② price list & dimensions, ③ ingredients / materials. High-accuracy reading of PDFs and images requires an AI engine connected by your administrator.", "①商品信息 ②价格表・尺寸 ③成分表・材质表 三类齐全时，AI最为准确。PDF・图片的高精度读取需要管理员接入AI引擎。", "La IA es más precisa con los tres tipos: ① información del producto, ② precios y medidas, ③ ingredientes / materiales. La lectura precisa de PDF e imágenes requiere el motor de IA."))}${fmtNote("prod")}`;
      }
    }
    // ヒアリング中の「📎 資料を追加」の説明（title）
    const fa = $("#fatt2");
    const lb = fa ? fa.closest("label") : null;
    if (lb && /Zip/i.test(lb.getAttribute("title") || "")) lb.setAttribute("title", M("関連資料を追加で読み込ませる（Excel・CSV・テキスト・Word・PowerPoint・PDF・画像。Zip などの圧縮ファイルは受け付けません。この欄へのドラッグ＆ドロップでも可）", "Add related files (Excel, CSV, text, Word, PowerPoint, PDF, images; compressed files such as Zip are not accepted). You can also drop them here.", "追加读取相关资料（Excel・CSV・文本・Word・PowerPoint・PDF・图片；不接收 Zip 等压缩文件）。也可拖放到此处。", "Añadir archivos (Excel, CSV, texto, Word, PowerPoint, PDF, imágenes; no se aceptan Zip ni comprimidos). También puede soltarlos aquí."));
    // 取り込んだ情報（ソース）の画面の説明
    const sf = $("#srcf", w);
    if (sf) {
      const box = sf.closest(".c") || sf.parentElement;
      const nn = box ? $$("p.nn", box).find((p) => /Zip/i.test(p.textContent || "")) : null;
      if (nn && !nn.getAttribute("data-v96")) { nn.setAttribute("data-v96", "1"); nn.setAttribute("data-noi18n", "1"); nn.innerHTML = `${E(M("ここにドラッグ＆ドロップでもOK。", "You can also drag and drop here.", "也可拖放到此处。", "También puede arrastrar y soltar aquí."))}${fmtNote("prod")}`; }
    }
    // URL から追加の注記（21.48）：「フォルダは Zip になります」→ Zip は開いて中のファイルを
    $$(".v48note", w).forEach((n) => {
      if (n.getAttribute("data-v96") || !/Zip/i.test(n.textContent || "")) return;
      n.setAttribute("data-v96", "1"); n.setAttribute("data-noi18n", "1");
      n.textContent = M("Googleドライブのファイル・フォルダは、ダウンロードしてアップロードしてください（フォルダは Zip でダウンロードされるので、開いて（展開して）中のファイルを選んでください。Zip のままは受け付けません）。共有リンクは外部の読み取りサービスに渡しません。", "For Google Drive files and folders, download and upload them (a folder downloads as a Zip: unzip it and choose the files inside; a Zip itself is not accepted). Shared links are never passed to outside reading services.", "Google云端硬盘的文件和文件夹，请下载后上传（文件夹会下载为Zip：请解压后选择其中的文件；不接收Zip本身）。共享链接不会交给外部读取服务。", "Descargue y suba los archivos y carpetas de Google Drive (una carpeta se descarga como Zip: descomprímala y elija los archivos; no se acepta el Zip). Los enlaces compartidos nunca se pasan a servicios externos.");
    });
    // No.513 取り込みの画面の「そろっています」（商品情報と同じ数え方）
    const C = $$(".rd-ckl li.ok", w).filter((li) => /必要な項目はそろっています/.test(li.textContent || "") && !li.getAttribute("data-v96"))
      .concat($$(".rd-empty", w).filter((d) => /商品の情報はそろっています/.test(d.textContent || "") && !d.getAttribute("data-v96")));
    const t = C.length ? ten() : null; const K = t ? P.K(t) : null;
    if (t && K && !K.full) {
      const msg = P.notFull(K, t);
      C.forEach((x) => { x.setAttribute("data-v96", "1"); x.setAttribute("data-noi18n", "1"); if (x.tagName === "LI") x.className = "ng"; x.textContent = msg; });
    }
  }

  /* ───── No.516 ドキュメントの画面 ───── */
  function docsPage() {
    const w = $("#well"); if (!w) return;
    const hs = $$(".k-card .k-hs", w).find((x) => /PDF・Excel・Word・画像など/.test(x.textContent || "") && !x.getAttribute("data-v96"));
    if (hs) { hs.setAttribute("data-v96", "1"); hs.insertAdjacentHTML("afterend", fmtNote("docs")); }
    const dz = $("#d30drop", w);
    if (dz && !dz.getAttribute("data-v96")) { dz.setAttribute("data-v96", "1"); dz.insertAdjacentHTML("beforeend", fmtNote("docs")); }
  }

  /* ───── No.511 商品情報：英文社名の案を出せないとき ───── */
  function itemPage() {
    const w = $("#well"); if (!w) return;
    const t = ten();
    const old = $(".v96p-coen", w);
    const N = t ? P.coEnNone(t) : null;
    const sig = t ? [t.uid || t.item, t.co || "", t.coEn || ""].join("|") : "";
    if (!N || $(".v95coen.v95-item", w)) { if (old) old.remove(); return; }
    if (old && old.getAttribute("data-v96sig") === sig) return;
    if (old) old.remove();
    const host = $(".v95strnote", w) || $(".k-v92imiss", w);
    if (!host) return;
    const why = N.why === "kanji" ? M("会社名に漢字・ひらがながあるため、読み方からの案は出していません（読み方の当て字は正式名と違うことが多いため）。", "Your company name includes kanji or hiragana, so no suggestion is made from its reading.", "公司名中含有汉字或平假名，因此不根据读音生成建议。", "El nombre incluye kanji o hiragana; no se propone un nombre a partir de la lectura.")
      : N.why === "dict" ? M("会社名のカタカナを辞書で英語の語に戻せなかったため、案は出していません（ローマ字の読み方は正式名と違うことが多いため）。", "The katakana in your company name could not be mapped back to English words, so no suggestion is made.", "无法按词典将公司名中的片假名还原为英文，因此未生成建议。", "No se pudo devolver al inglés el katakana del nombre; no se propone nada.")
        : M("会社名から確かな案を作れないため、案は出していません。", "No reliable suggestion can be made from your company name.", "无法根据公司名生成可靠的建议。", "No se puede proponer un nombre fiable.");
    host.insertAdjacentHTML("afterend", `<p class="v96p-coen" data-noi18n="1" data-v96sig="${E(sig)}" role="note"><b>${E(M("英文社名は未登録です。", "English company name: not registered. ", "英文公司名：未登记。", "Nombre en inglés: sin registrar. "))}</b>${E(why)}${E(M("登記・名刺・Webサイトにある英語の正式な表記を入れてください（書類の Seller 欄に入ります）。", "Enter the official English name used in your registration, business cards or website (it goes into the Seller field of documents).", "请填写登记、名片或网站上使用的正式英文名称（将填入单证的 Seller 栏）。", "Introduzca el nombre oficial en inglés (registro, tarjetas, web); va al campo Seller de los documentos."))}<br><button type="button" class="k-btn white k-mini" data-v96coen="1">${E(M("英文社名を入れる", "Enter English company name", "填写英文公司名", "Introducir nombre en inglés"))}</button></p>`);
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest ? e.target.closest("[data-v96coen]") : null;
    if (!b) return;
    e.preventDefault();
    try { if (typeof window.v92itemFillOpen === "function") { window.v92itemFillOpen(["coEn"]); setTimeout(() => { const i = document.getElementById("v92if_coEn"); if (i) i.focus(); }, 80); return; } } catch (x) { console.error("[rd v96prod] coen", x); }
    try { if (typeof v54docSellerEdit === "function") v54docSellerEdit(); } catch (x) { console.error("[rd v96prod] seller", x); } // eslint-disable-line no-undef
  });

  /* ───── いつ描くか ───── */
  function paint() {
    try { P.accept(); } catch (e) { /* 無視 */ }
    const k = curKey();
    try { if (k === "up" || k === "item" || k === "srcs" || $("#drop") || $("#srcf")) upPage(); } catch (e) { console.error("[rd v96prod] up", e); }
    try { if (k === "docs" || $("#d30drop")) docsPage(); } catch (e) { console.error("[rd v96prod] docs", e); }
    try { if (k === "item") itemPage(); } catch (e) { console.error("[rd v96prod] item", e); }
  }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { paint(); } catch (e) { /* 無視 */ } return r; };
  /* ───── No.516 「商品情報を登録 ― 何をしますか？」の窓（#v1811ov）の「資料をアップロードして登録」の説明：
     「Excel・Word・PDF・画像・Zipに対応」→ 受け付ける形式に言い直す（Zip は受け付けない）。英中西の訳（I18N）にも Zip があるので、訳の後でも直す ───── */
  function newcoDlg() {
    const ov = document.getElementById("v1811ov"); if (!ov) return;
    $$('[data-v1811="newco-up"] .d', ov).forEach((d) => {
      if (d.getAttribute("data-v96") === "1" || !/zip/i.test(d.textContent || "")) return;
      d.setAttribute("data-v96", "1"); d.setAttribute("data-noi18n", "1");
      d.textContent = M("Excel・CSV・Word・PowerPoint・PDF・画像に対応（Zip などの圧縮ファイルは受け付けません）。会社名・商品名・価格表などをAIが読み取ります。登録欄に移動します。",
        "Excel, CSV, Word, PowerPoint, PDF and images are supported (Zip and other archives are not accepted). The AI reads the company name, product name, price list and more. You'll be taken to the upload area.",
        "支持Excel・CSV・Word・PowerPoint・PDF・图片（不接受Zip等压缩文件）。AI会读取公司名・产品名・价格表等。将移动到登记区域。",
        "Admite Excel, CSV, Word, PowerPoint, PDF e imágenes (no se aceptan Zip ni otros archivos comprimidos). La IA lee el nombre de la empresa, del producto, la lista de precios y más. Irá a la zona de carga.");
    });
  }
  let raf2 = 0;
  try {
    new MutationObserver(() => { if (raf2 || !document.getElementById("v1811ov")) return; raf2 = requestAnimationFrame(() => { raf2 = 0; try { newcoDlg(); } catch (e) { console.error("[rd v96prod] newco", e); } }); })
      .observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) { console.error("[rd v96prod] newco mo", e); }

  let raf = 0;
  const mo = new MutationObserver(() => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; paint(); }); });
  function watch() { const w = $("#well"); if (w && !w._v96p) { w._v96p = 1; mo.observe(w, { childList: true, subtree: true }); } }
  setInterval(() => { if (document.hidden) return; watch(); }, 2000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { watch(); paint(); }); else { watch(); paint(); }
})();
