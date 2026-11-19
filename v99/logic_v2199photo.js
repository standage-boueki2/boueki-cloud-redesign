/* ═══ v21.99 photo（2026-11-19 第12回相当 UAT・21.98）営業資料の写真・ロゴ
   土台・前の層（rd・v95〜v98）は書き換えず、前の関数を控えてから包む（どの関数も、この層が最後に包む）。
   No.509（未解消・3回目）写真・ロゴの選択肢
     再現（直す前 /L-.html・ヒアリングで登録し📎で 仕様書・商品写真・パッケージの写真・ロゴ を送った商品・外国語 営業資料の画面）：
       ・AI の写真の確認が「確かめている途中」のとき：「確認前の写真」の箱（v98）の見出しのすぐあとにあるのは「確認前の N枚を、このまま使う」だけ。
         写真ごとの「このまま使う／切り取る・隠す／差し替える」は箱の中の list > listitem の奥にあり、アクセシビリティツリー
         （CDP getFullAXTree＝深さの順＝浅いものから並ぶ）では、ページのほかの浅い文（見せ方・営業資料を作る・メニュー・旅程…）の
         「あと」に、どの写真のものか分からない形で出る（StaticText をつないだ文で、箱の見出しのあとは「見せ方（デザイン）」が続く）。
         ＝UAT の「確認前の写真の欄に『このまま使う』のみ。切り取る・隠す／差し替えるは見当たらない」と同じ。
       ・AI の確認が済んで「使える」となった写真：選択肢が1つも無い（変更・削除・画質補正だけ。「使わない」も無い）。
       ・ロゴ：欄は「選ぶ」（ファイルを選ぶ label＝ボタンとして読めない）か「変更・削除」だけ。「使わない」が無い。
         ロゴの名前に手がかりの無い画像（例「ブランド画像.png」）は写真の枠に入り、ロゴは「選ぶ」だけになる。
     原因：選択肢の箱が状態ごとに3つ（v98 の確認前・v97 の外れた写真・確認済みは無し）に分かれ、どれも写真ごとのボタンを
           list > listitem > div の奥に置いていた（深さの順に読むと見出しと離れる）。確認済みの写真とロゴには選択肢自体が無かった。
     直し：写真の欄（deckAssetCard）の下の箱を1つ「写真・ロゴの使い方」にまとめ、ロゴと登録したすべての写真（確認前・確認済み・外れた）を
           同じ形で並べる。箱の中は入れ子にしない（見出し・説明・写真の名前・状態・理由・ボタンをすべて箱の直下に置く）＝深さの順に読んでも
           「商品写真1 → 状態 → 理由 → このまま使う・切り取る・隠す・差し替える・使わない」が続けて読める。ボタンは本物の <button> で、
           名前に写真の名前を付ける（aria-label「商品写真1：このまま使う」）。ロゴは「上げる（差し替える）・選ぶ・使わない」。
           写真の枠のロゴの欄の「選ぶ（label）」もボタン「上げる／差し替える・選ぶ・使わない」にし、写真の欄の「選ぶ／変更」もボタンにする。
           「使わない」は確認済み・確認前の写真でも効く（dkPhGood・dk3Media で外す）。ロゴの「使わない」は表紙にロゴを入れない（dk3Logo）。
   No.552（新規・中）写真が資料に入らない（G 木製パズル・H ささみジャーキー：AI が「商品本体が写っていない」と判定し、英語資料に写真 0枚）
     原因：① AI の写真の確認（dkImgAudit の問い）が、パッケージの写真・商品が小さく写った写真を ok:false にすることがある。
           ② ok:false の写真は、選ぶまで資料に入らない（v97）。作る前の選ぶ画面（v96）は「使える写真が3枚未満」のときだけで、
              写真の確認が終わる前に作り始めると、作っている間に確認が終わって外れ、0枚のまま黙って出来上がる。
           ③ 出来上がったあとは最終チェックの一行だけで、その場で選び直して作り直す手立てが無い。
     直し：① 写真の確認の問いに「パッケージ・小さく写った・使用シーンの写真は ok:true。迷ったら ok:true にして気になる点を reason に」
              「reason は『〜の可能性』で書く」を足す（前の版の基準で外れた写真は、選んでいなければ1回だけ確かめ直す）。
              画面の言葉も「AI の見立て：商品本体が写っていない可能性（パッケージの写真などでは AI が誤ることがあります）」にする。
           ② 作る前：写真が外れている・確認前・0枚のときは「作る前に写真を確かめてください」の画面（写真・ロゴの使い方と同じ形）を出し、
              「このまま使う（判定を上書き）／登録済みの写真から選び直す／差し替える（上げる）／使わない」を選んでから作る。
              確認前の写真は「このまま入れて作る」と決めて作る（作っている間に確認が終わっても外さない）。
           ③ 作った後：資料に入らなかった写真（0枚・足りない）があれば、出来上がった資料の下に理由と同じ選択肢、
              「写真を入れて作り直す」を出す。最終チェックにも「資料に写真が入っていません（理由）」を出す。 */
var V99PHOTO = window.V99PHOTO = { v: "21.99", err: null, errs: [], n: { panel: 0, ask: 0, go: 0, after: 0, act: 0, rejudge: 0, rule: 0, logoNo: 0 } };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const s = k + ": " + String((e && e.message) || e).slice(0, 160); V99PHOTO.err = s; V99PHOTO.errs.push(s); if (V99PHOTO.errs.length > 40) V99PHOTO.errs.shift(); } catch (x) { /* 記録だけ */ } };
  const lang = () => { try { const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (document.getElementById("lang") || {}).value || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }; // eslint-disable-line no-undef
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const toast0 = (s) => { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const save = () => { try { if (typeof saveTen === "function") saveTen(); } catch (e) { err("save", e); } }; // eslint-disable-line no-undef
  const rerender = () => { try { if (typeof render === "function") render(); } catch (e) { err("render", e); } }; // eslint-disable-line no-undef
  const logU0 = (k, s) => { try { if (typeof logU === "function") logU(k, s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const NPH = () => { try { return (typeof DK_NPH !== "undefined" && +DK_NPH) || 10; } catch (e) { return 10; } }; // eslint-disable-line no-undef
  const phNm = (i) => M("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto del producto " + (i + 1));
  const aiOn = () => { try { return typeof ppReady === "function" && !!ppReady(); } catch (e) { return false; } }; // eslint-disable-line no-undef
  const auditRun = () => { try { return typeof __dkAudit !== "undefined" && !!__dkAudit; } catch (e) { return false; } }; // eslint-disable-line no-undef
  V99PHOTO.M = M;

  /* ════════════ 写真1枚の状態 ════════════ */
  const whyKeys = (o) => { try { return typeof v97dkWhyKeys === "function" ? (v97dkWhyKeys(o) || []) : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const decOf = (o) => { try { return typeof v96dkDec === "function" ? (v96dkDec(o) || "") : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  /* pend＝AI の確認がまだ／good＝確認済みで使える／flag＝外れる理由がある（AI の判定・大きさ・形） */
  function stOf(o) {
    if (!o || !o.b64) return "";
    if (o.other) return "other";
    if (whyKeys(o).length) return "flag";
    if (!o._dq) return "pend";
    return "good";
  }
  function inDeck(o) {
    const d = decOf(o);
    if (d === "no") return false;
    if (d === "use") return true;
    const s = stOf(o);
    return s === "good" || s === "pend";
  }
  function listOf(T) {
    const A = (T && T.assets) || {}; const out = [];
    (A.ph || []).forEach((o, i) => { const st = stOf(o); if (st && st !== "other") out.push({ i, o, st, dec: decOf(o), ks: whyKeys(o) }); });
    return out;
  }
  V99PHOTO.listOf = listOf; V99PHOTO.inDeck = inDeck; V99PHOTO.stOf = stOf;

  /* ロゴ：使わない（選んだときのロゴの中身の指紋。ロゴを入れ替えたら戻る） */
  const logoFp = (T) => { const L = T && T.assets && T.assets.logo; return L && L.b64 ? L.b64.length + ":" + L.b64.slice(-48) : ""; };
  function logoOff(T) { try { const x = T && T.assets && T.assets.v99logoNo; return !!(x && x.fp === logoFp(T)); } catch (e) { return false; } }
  V99PHOTO.logoOff = logoOff;

  /* ════════════ 言葉：AI の判定は断定しない ════════════ */
  function soft(r) {
    let s = String(r || "").trim().replace(/[。.]+$/, "");
    if (!s) return "";
    if (/可能性|かもしれ|おそれ|恐れ|疑い|ようです|らしい|possibly|may /i.test(s)) return s;
    return /(ない|ている|てる|る|い|た|だ|ず)$/.test(s) ? s + "可能性" : s + "の可能性";
  }
  V99PHOTO.soft = soft;
  function whyTx(o, ks) {
    const q = (typeof dkImgLocalQ === "function") ? (dkImgLocalQ(o) || {}) : {}; // eslint-disable-line no-undef
    const rs = String((o && o._dq && o._dq.reason) || "").slice(0, 40);
    const P = [];
    (ks || whyKeys(o)).forEach((k) => {
      if (k === "ng") P.push(rs ? M(`AI の見立て：「${soft(rs)}」`, `AI’s view: possibly “${rs}”`, `AI 的看法：可能“${rs}”`, `Opinión de la IA: posiblemente «${rs}»`) : M("AI の見立て：商品写真に向かない可能性", "AI’s view: possibly not suitable as a product photo", "AI 的看法：可能不适合作商品照片", "Opinión de la IA: posiblemente no apta como foto del producto"));
      else if (k === "jp") P.push(M("AI の見立て：画像に重ねた日本語の文字が目立つ可能性", "AI’s view: Japanese text added on top may stand out", "AI 的看法：图片上叠加的日文可能显眼", "Opinión de la IA: puede destacar texto japonés superpuesto"));
      else if (k === "low") P.push(M("AI の見立て：ぼやけている・不鮮明な可能性", "AI’s view: possibly blurry", "AI 的看法：可能模糊", "Opinión de la IA: posiblemente borrosa"));
      else if (k === "info") P.push(M("AI の見立て：図・文字が中心の画像の可能性", "AI’s view: possibly mainly a diagram or text", "AI 的看法：可能以图表或文字为主", "Opinión de la IA: posiblemente sobre todo un diagrama o texto"));
      else if (k === "small") P.push(M(`小さい（短い辺 ${Math.min(q.w || 0, q.h || 0)}px。420px 以上で鮮明）`, `small (shorter side ${Math.min(q.w || 0, q.h || 0)}px; 420px or more looks sharp)`, `尺寸小（短边 ${Math.min(q.w || 0, q.h || 0)}px，420px 以上才清晰）`, `pequeña (lado corto ${Math.min(q.w || 0, q.h || 0)} px; 420 px o más se ve nítida)`));
      else if (k === "ratio") P.push(M("横長・縦長すぎる（バナーの形）", "too wide or too tall (banner shape)", "过宽或过高（横幅形状）", "demasiado ancha o alta (forma de banner)"));
    });
    if (!P.length) return "";
    const aiK = (ks || []).some((k) => /^(ng|jp|low|info)$/.test(k));
    return P.join(M("・", "; ", "；", "; ")) + (aiK ? M("（パッケージの写真や、商品が小さく写った写真では、AI が誤ることがあります）", " (the AI can be wrong, e.g. with package photos or photos where the product is small)", "（包装照片或商品较小的照片，AI 可能判断错误）", " (la IA puede equivocarse, p. ej. con fotos del envase o con el producto pequeño)") : "");
  }
  V99PHOTO.whyTx = whyTx;
  function aiNow() {
    if (!aiOn()) return "off";
    if (auditRun()) return "run";
    try { if (W.V97M && W.V97M.failAt && Date.now() - W.V97M.failAt < 30 * 60000) return "fail"; } catch (e) { /* 無視 */ }
    return "wait";
  }
  function stTx(x, mode) {
    const d = x.dec, ed = !!(x.o && x.o.v96edit);
    if (mode === "after" && d !== "no") {
      if (d === "use") return M("✓ このまま使う（選んだ）：「写真を入れて作り直す」で資料に入ります", "✓ Use as it is (your choice): goes in when you make the deck again", "✓ 直接使用（已选择）：重新制作后放入资料", "✓ Usar tal cual (su elección): entra al crear de nuevo");
      if (inDeck(x.o)) return M("今回の資料には入っていません（ページの数の都合）。作り直すと入ることがあります", "Not in this deck (number of pages). It may go in when you make the deck again", "本次资料未放入（页数原因）。重新制作时可能放入", "No está en esta presentación (número de páginas). Puede entrar al crearla de nuevo");
    }
    if (d === "no") return M("✕ 使わない（選んだ）：資料に入りません", "✕ Not used (your choice): not in the deck", "✕ 不使用（已选择）：不放入资料", "✕ No se usa (su elección): no entra");
    if (d === "use") return ed ? M("✓ 切り取り・隠しをして使う（選んだ）：資料に入ります", "✓ Edited and used (your choice): in the deck", "✓ 编辑后使用（已选择）：放入资料", "✓ Editada y en uso (su elección): entra")
      : M("✓ このまま使う（選んだ）：資料に入ります", "✓ Used as it is (your choice): in the deck", "✓ 直接使用（已选择）：放入资料", "✓ Se usa tal cual (su elección): entra");
    if (x.st === "good") return M("✓ 確認済み：資料に入ります", "✓ Checked: in the deck", "✓ 已检查：放入资料", "✓ Revisada: entra en la presentación");
    if (x.st === "flag") return M("⚠ 外れた写真：いまは資料に入りません（使うかを選べます）", "⚠ Left out: not in the deck now (you can choose)", "⚠ 被排除的照片：目前不放入资料（可选择）", "⚠ Excluida: ahora no entra (puede elegir)");
    const a = aiNow();
    const why = a === "off" ? M("AI につながっていないため中身は未確認", "not checked: the AI is not connected", "未连接 AI，内容未检查", "sin revisar: la IA no está conectada")
      : a === "run" ? M("AI が確かめています", "the AI is checking it", "AI 正在检查", "la IA la está revisando")
        : a === "fail" ? M("AI の応答が無く未確認", "not checked: no AI response", "AI 无响应，未检查", "sin revisar: la IA no respondió")
          : M("AI の確認がまだ", "not checked by the AI yet", "AI 尚未检查", "aún sin revisar por la IA");
    return M(`◷ 確認前（${why}）：このままなら資料に入ります`, `◷ Not checked yet (${why}): goes into the deck as it is`, `◷ 检查前（${why}）：保持不变则放入资料`, `◷ Sin revisar (${why}): entra tal cual`);
  }

  /* ════════════ 箱：写真・ロゴの使い方（入れ子にしない＝深さの順に読んでも続けて読める） ════════════ */
  const B = (act, i, lb, aria, opt) => `<button type="button" class="btn ${opt && opt.main ? "" : "g "}v99ph-b" data-v99ph="${act}"${i != null ? ` data-v99i="${i}"` : ""}${opt && opt.pressed != null ? ` aria-pressed="${opt.pressed ? "true" : "false"}"` : ""} aria-label="${E(aria)}">${E(lb)}</button>`;
  function logoRow(T, mode) {
    const A = (T && T.assets) || {}, has = !!(A.logo && A.logo.b64), off = logoOff(T);
    const nm = M("ロゴ", "Logo", "标志", "Logo");
    const th = has ? `<img class="v99ph-th" src="data:${E(A.logo.mime || "image/png")};base64,${A.logo.b64}" alt="${E(nm)}" loading="lazy">` : `<span class="v99ph-th v99ph-none" aria-hidden="true">🏷</span>`;
    const st = off ? M("✕ 使わない（選んだ）：表紙にロゴを入れません", "✕ Not used (your choice): no logo on the cover", "✕ 不使用（已选择）：封面不放标志", "✕ No se usa (su elección): sin logo en la portada")
      : has ? M("✓ 表紙に入ります", "✓ Goes on the cover", "✓ 用于封面", "✓ Va en la portada")
        : M("まだありません（このままなら表紙はロゴなし。ロゴの画像が写真の欄に入っていれば、その写真の「ロゴに使う」で移せます）", "None yet (the cover will have no logo; if the logo image is among the photos, use “Use as the logo” on it)", "还没有（封面将没有标志；如标志图片在照片中，可用该照片的“用作标志”移过去）", "Aún no hay (la portada quedará sin logo; si la imagen del logo está entre las fotos, use «Usar como logo»)");
    const up = has ? M("差し替える（上げる）", "Replace (upload)", "替换（上传）", "Sustituir (subir)") : M("上げる", "Upload", "上传", "Subir");
    const btns = B("logoUp", null, up, nm + M("：", ": ", "：", ": ") + up) +
      B("logoReg", null, M("選ぶ（登録済みの写真から）", "Choose (from registered photos)", "选择（从已登记的照片）", "Elegir (de las fotos registradas)"), nm + M("：選ぶ（登録済みの写真から）", ": choose from registered photos", "：从已登记的照片中选择", ": elegir de las fotos registradas")) +
      (off ? B("logoUse", null, M("使う（戻す）", "Use it (undo)", "使用（恢复）", "Usarlo (deshacer)"), nm + M("：使う（戻す）", ": use it (undo)", "：使用（恢复）", ": usarlo (deshacer)"), { pressed: false })
        : B("logoNo", null, M("使わない", "Don’t use", "不使用", "No usar"), nm + M("：使わない", ": don’t use", "：不使用", ": no usar"), { pressed: false }));
    return th + `<p class="v99ph-nm">${E(nm)}</p><p class="v99ph-st" data-v99st="${off ? "no" : has ? "good" : "none"}">${E(st)}</p>` + btns + `<span class="v99ph-br" aria-hidden="true"></span>`;
  }
  function photoRow(T, x, mode) {
    const nm = phNm(x.i), o = x.o;
    const th = `<img class="v99ph-th" src="data:${E(o.mime || "image/jpeg")};base64,${o.b64}" alt="${E(nm)}" loading="lazy">`;
    const why = x.ks.length ? whyTx(o, x.ks) : "";
    const ov = x.st === "flag" && x.ks.some((k) => /^(ng|jp|low|info)$/.test(k));
    const cl = M("：", ": ", "：", ": ");
    const lbUse = ov && x.dec !== "use" ? M("このまま使う（判定を上書き）", "Use as it is (override the AI)", "直接使用（覆盖判定）", "Usar tal cual (anular la IA)") : M("このまま使う", "Use as it is", "直接使用", "Usar tal cual");
    const lbEd = M("切り取る・隠す", "Crop or hide", "裁剪或遮住", "Recortar u ocultar");
    const lbRep = M("差し替える（上げる）", "Replace (upload)", "替换（上传）", "Sustituir (subir)");
    const lbNo = M("使わない", "Don’t use", "不使用", "No usar");
    let btns = B("use", x.i, lbUse, nm + cl + lbUse, { pressed: x.dec === "use" }) + B("edit", x.i, lbEd, nm + cl + lbEd) + B("rep", x.i, lbRep, nm + cl + lbRep) + B("no", x.i, lbNo, nm + cl + lbNo, { pressed: x.dec === "no" });
    if (x.st === "flag" || mode === "after" || mode === "ask") { const lb = M("登録済みの写真から選び直す", "Choose again from registered photos", "从已登记的照片中重新选择", "Elegir de nuevo de las fotos registradas"); btns += B("reg", x.i, lb, nm + cl + lb); }
    if (x.dec) { const lb = M("選択を戻す", "Undo the choice", "撤销选择", "Deshacer la elección"); btns += B("clear", x.i, lb, nm + cl + lb); }
    if (o.v96orig) { const lb = M("加工の前に戻す", "Undo the edit", "撤销编辑", "Deshacer la edición"); btns += B("undo", x.i, lb, nm + cl + lb); }
    // ロゴが無いとき：ロゴの名前に手がかりの無い画像（例「ブランド画像.png」）が写真の欄に入っていたら、ロゴへ移せる
    const logoLike = /png|svg|webp/i.test(String(o.mime || "")) || ((o.w || 0) / Math.max(1, o.h || 0)) >= 1.8 || /logo|ロゴ|マーク|ブランド|brand|symbol|シンボル/i.test(String(o.cap || ""));
    if (mode !== "after" && logoLike && !(T.assets && T.assets.logo && T.assets.logo.b64)) { const lb = M("ロゴに使う（写真から移す）", "Use as the logo (move from photos)", "用作标志（从照片移过去）", "Usar como logo (mover de las fotos)"); btns += B("toLogo", x.i, lb, nm + cl + lb); }
    return th + `<p class="v99ph-nm">${E(nm)}</p><p class="v99ph-st" data-v99st="${E(x.dec || x.st)}">${E(stTx(x, mode))}</p>` + (why ? `<p class="v99ph-why">${E(why)}</p>` : "") + btns + `<span class="v99ph-br" aria-hidden="true"></span>`;
  }
  function grpHead(k, n) {
    const t = k === "pend" ? M(`確認前の写真（AI の確認がまだ）：${n}枚`, `Photos not checked yet (AI): ${n}`, `检查前的照片（AI 尚未检查）：${n} 张`, `Fotos sin revisar (IA): ${n}`)
      : k === "good" ? M(`確認済みの写真：${n}枚`, `Checked photos: ${n}`, `已检查的照片：${n} 张`, `Fotos revisadas: ${n}`)
        : M(`外れた写真（AI の見立て・大きさ・形）：${n}枚`, `Left-out photos (AI’s view, size or shape): ${n}`, `被排除的照片（AI 看法・尺寸・形状）：${n} 张`, `Fotos excluidas (opinión de la IA, tamaño o forma): ${n}`);
    return `<p class="v99ph-grp" data-v99grp="${k}">${E(t)}</p>`;
  }
  /* mode：card（写真の欄の下）／ask（作る前）／after（作った後）。after の rows＝資料に入らなかった写真だけ（ほかは数だけ） */
  function panelHtml(T, mode, extra) {
    try {
      if (!T) return "";
      const L = listOf(T);
      const nIn = L.filter((x) => inDeck(x.o)).length;
      const flagU = L.filter((x) => x.st === "flag" && !x.dec), pendU = L.filter((x) => x.st === "pend" && !x.dec);
      const ex = extra || {};
      let head, lead;
      if (mode === "ask") {
        head = M("📷 作る前に、資料に入れる写真を確かめてください", "📷 Before making the deck, check the photos that go in", "📷 制作前请确认放入资料的照片", "📷 Antes de crear la presentación, revise las fotos");
        lead = !L.length ? M("商品写真がまだありません（0枚）。このまま作ると、資料の写真の枠は空きになります。写真を上げるか、登録済みの写真から選べます。", "There are no product photos yet (0). If you make the deck now, the photo frames stay empty. You can upload photos or choose registered ones.", "还没有商品照片（0 张）。现在制作的话，资料的照片框将为空。可以上传照片或从已登记的照片中选择。", "Aún no hay fotos (0). Si crea la presentación ahora, los marcos de foto quedarán vacíos. Puede subir fotos o elegir fotos registradas.")
          : M(`いまのままだと、資料に入る写真は ${nIn}枚です（登録 ${L.length}枚）。` + (flagU.length ? `外れた写真 ${flagU.length}枚は、選ばないと入りません。` : "") + (pendU.length ? `確認前の写真 ${pendU.length}枚は、このまま入れて作ります（作っている間に AI の確認が終わっても外しません）。` : "") + "写真ごとに「このまま使う／切り取る・隠す／差し替える／使わない」を選べます。",
            `As it is, ${nIn} photo(s) go into the deck (${L.length} registered). ` + (flagU.length ? `${flagU.length} left-out photo(s) are not included unless you choose them. ` : "") + (pendU.length ? `${pendU.length} unchecked photo(s) are included as they are (not removed even if the AI check finishes while making). ` : "") + "For each photo you can choose: use as it is, crop or hide, replace, or don’t use.",
            `目前放入资料的照片为 ${nIn} 张（已登记 ${L.length} 张）。` + (flagU.length ? `被排除的 ${flagU.length} 张不选择就不会放入。` : "") + (pendU.length ? `检查前的 ${pendU.length} 张将直接放入（制作中 AI 检查完成也不会移除）。` : "") + "每张照片都可选择“直接使用／裁剪或遮住／替换／不使用”。",
            `Tal como está, entran ${nIn} foto(s) (${L.length} registradas). ` + (flagU.length ? `${flagU.length} foto(s) excluidas no entran si no las elige. ` : "") + (pendU.length ? `${pendU.length} foto(s) sin revisar entran tal cual (no se quitan aunque la revisión termine mientras se crea). ` : "") + "Para cada foto puede elegir: usar tal cual, recortar u ocultar, sustituir o no usar.");
      } else if (mode === "after") {
        head = M(`📷 資料に入った写真：${ex.inDeck || 0}枚（登録 ${L.length}枚）`, `📷 Photos in the deck: ${ex.inDeck || 0} (${L.length} registered)`, `📷 放入资料的照片：${ex.inDeck || 0} 张（已登记 ${L.length} 张）`, `📷 Fotos en la presentación: ${ex.inDeck || 0} (${L.length} registradas)`);
        lead = !L.length ? M("商品写真が登録されていないため、資料の写真の枠は空きです。写真を上げるか登録済みの写真から選んで、「写真を入れて作り直す」を押してください。", "No product photos are registered, so the photo frames are empty. Upload or choose photos, then press “Make the deck again with the photos”.", "没有登记商品照片，资料的照片框为空。请上传或选择照片后点击“放入照片重新制作”。", "No hay fotos registradas, así que los marcos están vacíos. Suba o elija fotos y pulse «Crear de nuevo con las fotos».")
          : M("次の写真は資料に入っていません。理由を見て、「このまま使う（判定を上書き）」「登録済みの写真から選び直す」「差し替える（上げる）」を選び、「写真を入れて作り直す」を押すと入ります。", "These photos are not in the deck. Check the reason, choose “Use as it is (override the AI)”, “Choose again from registered photos” or “Replace (upload)”, then press “Make the deck again with the photos”.", "以下照片未放入资料。请查看原因，选择“直接使用（覆盖判定）”“从已登记的照片中重新选择”或“替换（上传）”，再点击“放入照片重新制作”。", "Estas fotos no están en la presentación. Vea el motivo, elija «Usar tal cual (anular la IA)», «Elegir de nuevo de las fotos registradas» o «Sustituir (subir)» y pulse «Crear de nuevo con las fotos».");
      } else {
        head = M("🗂 写真・ロゴの使い方（写真ごとに選べます）", "🗂 How to use the photos and logo (choose for each)", "🗂 照片・标志的使用方式（可逐张选择）", "🗂 Uso de las fotos y el logo (elija para cada una)");
        lead = M(`資料に入る写真：${nIn}枚（登録 ${L.length}枚・3枚以上がおすすめ）。確認前・確認済み・外れた写真のどれも、写真ごとに「このまま使う／切り取る・隠す／差し替える／使わない」を選べます。ロゴは「上げる（差し替える）・選ぶ・使わない」を選べます。`,
          `Photos in the deck: ${nIn} (${L.length} registered; 3 or more recommended). For every photo (not checked, checked or left out) you can choose: use as it is, crop or hide, replace, or don’t use. For the logo: upload (replace), choose, or don’t use.`,
          `放入资料的照片：${nIn} 张（已登记 ${L.length} 张，建议 3 张以上）。无论检查前、已检查还是被排除的照片，都可逐张选择“直接使用／裁剪或遮住／替换／不使用”。标志可选择“上传（替换）・选择・不使用”。`,
          `Fotos en la presentación: ${nIn} (${L.length} registradas; se recomiendan 3 o más). Para cada foto (sin revisar, revisada o excluida) puede elegir: usar tal cual, recortar u ocultar, sustituir o no usar. Logo: subir (sustituir), elegir o no usar.`);
      }
      let rows = "";
      if (mode !== "after") rows += logoRow(T, mode);
      if (mode === "after") {
        const R = (ex.out || []);
        R.forEach((x) => { rows += photoRow(T, x, mode); });
      } else {
        ["flag", "pend", "good"].forEach((k) => { const G = L.filter((x) => x.st === k); if (!G.length) return; rows += grpHead(k, G.length); G.forEach((x) => { rows += photoRow(T, x, mode); }); });
      }
      let bulk = "";
      const und = L.filter((x) => (x.st === "flag" || x.st === "pend") && !x.dec);
      if (mode !== "after" && und.length) { const lb = M(`外れた写真・確認前の写真 ${und.length}枚を、まとめてこのまま使う`, `Use all ${und.length} left-out / unchecked photo(s) as they are`, `将被排除・检查前的 ${und.length} 张照片全部直接使用`, `Usar tal cual las ${und.length} foto(s) excluidas o sin revisar`); bulk += B("all", null, lb, lb); }
      if (aiOn() && L.some((x) => x.st === "flag" && x.ks.some((k) => /^(ng|jp|low)$/.test(k)) || x.st === "pend") && mode !== "after") { const lb = M("AI にもう一度確かめてもらう", "Ask the AI to check again", "让 AI 重新检查", "Pedir a la IA que revise de nuevo"); bulk += B("re", null, lb, lb); }
      if (!L.length || mode === "after" || mode === "ask") {
        const up = M("写真を上げる（何枚でも）", "Upload photos (any number)", "上传照片（可多张）", "Subir fotos (las que quiera)"), rg = M("登録済みの写真から選ぶ", "Choose from registered photos", "从已登记的照片中选择", "Elegir de las fotos registradas");
        bulk += B("upMany", null, up, up) + B("regAny", null, rg, rg);
      }
      let go = "";
      if (mode === "ask") {
        const nGo = nIn + 0;
        const lb = nGo ? M(`この写真で営業資料を作る（資料に入る写真 ${nGo}枚）`, `Make the deck with these photos (${nGo} in the deck)`, `用这些照片制作资料（放入 ${nGo} 张）`, `Crear la presentación con estas fotos (${nGo})`)
          : M("写真なしで作る（写真の枠は空きになります）", "Make it without photos (the photo frames stay empty)", "不放照片直接制作（照片框为空）", "Crear sin fotos (los marcos quedan vacíos)");
        const cl = M("閉じる（まだ作らない）", "Close (do not make it yet)", "关闭（暂不制作）", "Cerrar (no crear todavía)");
        go = `<span class="v99ph-br" aria-hidden="true"></span>` + B("go", null, lb, lb, { main: 1 }) + B("close", null, cl, cl);
      } else if (mode === "after") {
        const lb = M(`写真を入れて作り直す（${ex.langName || ""}）`, `Make the deck again with the photos (${ex.langName || ""})`, `放入照片重新制作（${ex.langName || ""}）`, `Crear de nuevo con las fotos (${ex.langName || ""})`);
        go = `<span class="v99ph-br" aria-hidden="true"></span>` + B("regen", null, lb, lb, { main: 1 });
      }
      V99PHOTO.n.panel++;
      const label = mode === "ask" ? M("作る前に写真を確かめる", "Check the photos before making", "制作前确认照片", "Revisar las fotos antes de crear") : mode === "after" ? M("資料に入らなかった写真", "Photos not in the deck", "未放入资料的照片", "Fotos que no están en la presentación") : M("写真・ロゴの使い方", "How to use the photos and logo", "照片・标志的使用方式", "Uso de las fotos y el logo");
      return `<div class="${mode === "ask" ? "" : "c "}v99ph v99ph-${mode}" role="region" aria-label="${E(label)}" data-v99phpanel="${mode}" data-noi18n="1">` +
        `<h3 class="v99ph-h">${E(head)}</h3><p class="v99ph-lead">${E(lead)}</p>` + (bulk ? bulk + `<span class="v99ph-br" aria-hidden="true"></span>` : "") + rows + go + `</div>`;
    } catch (e) { err("panel", e); return ""; }
  }
  V99PHOTO.panelHtml = panelHtml;

  /* ════════════ 決めたことを効かせる ════════════ */
  /* 「使わない」を選んだ写真は、確認済み・確認前でも資料に入れない／「このまま使う」は確認前でも入れる */
  if (typeof dkPhGood === "function") {
    const __pg99 = dkPhGood; // eslint-disable-line no-undef
    dkPhGood = function (o) { // eslint-disable-line no-global-assign
      try { if (o && o.b64 && !o.other) { const d = decOf(o); if (d === "no") return false; if (d === "use") return true; } } catch (e) { err("pg", e); }
      return __pg99.apply(this, arguments);
    };
  }
  if (typeof v96dkPhSt === "function") {
    const __st99 = v96dkPhSt; // eslint-disable-line no-undef
    v96dkPhSt = function (o) { // eslint-disable-line no-global-assign
      try { if (o && o.b64 && !o.other && decOf(o) === "no") return "jpNo"; } catch (e) { err("st", e); }
      return __st99.apply(this, arguments);
    };
    try { if (W.V96DK) W.V96DK.phSt = v96dkPhSt; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
  }
  if (typeof dk3Media === "function") {
    const __md99 = dk3Media; // eslint-disable-line no-undef
    dk3Media = async function (deck, T) { // eslint-disable-line no-global-assign
      const P = await __md99.apply(this, arguments);
      try {
        const prods = typeof dk3Prods === "function" ? dk3Prods(T || ten()) : [T || ten()]; // eslint-disable-line no-undef
        const drop = new Set();
        prods.forEach((t, pi) => ((t && t.assets && t.assets.ph) || []).forEach((o, i) => { if (o && o.b64 && decOf(o) === "no") drop.add("p" + pi + ":" + i); }));
        if (drop.size && P) {
          drop.forEach((k) => { if (deck && deck.media && deck.media[k]) deck.media[k].good = false; });
          P.all = (P.all || []).filter((k) => !drop.has(k));
          P.byProd = (P.byProd || []).map((a) => (a || []).filter((k) => !drop.has(k)));
        }
      } catch (e) { err("media", e); }
      return P;
    };
  }
  /* ロゴ「使わない」 */
  if (typeof dk3Logo === "function") {
    const __lg99 = dk3Logo; // eslint-disable-line no-undef
    dk3Logo = function (T) { // eslint-disable-line no-global-assign
      try { const t = T || ten(); if (t && logoOff(t)) return null; } catch (e) { err("logo", e); }
      return __lg99.apply(this, arguments);
    };
  }
  const logoNoTx = () => M("（使わないと選びました）", " (you chose not to use one)", "（已选择不使用）", " (eligió no usarlo)");
  if (typeof dk3Gate === "function") {
    const __gt99 = dk3Gate; // eslint-disable-line no-undef
    dk3Gate = function () { // eslint-disable-line no-global-assign
      const G = __gt99.apply(this, arguments);
      try { const T = ten(); if (T && logoOff(T)) (G || []).forEach((c) => { if (c && c.k === "logo") { c.ok = true; c.n = String(c.n || "").replace(/（使わないと選びました）$/, "") + "（使わないと選びました）"; } }); } catch (e) { err("gate", e); }
      return G;
    };
  }
  if (typeof deckCheck === "function") {
    const __dc99 = deckCheck; // eslint-disable-line no-undef
    deckCheck = function () { // eslint-disable-line no-global-assign
      const G = __dc99.apply(this, arguments);
      try { const T = ten(); if (T && logoOff(T)) (G || []).forEach((c) => { if (c && c.k === "logo") { c.ok = true; c.n = String(c.n || "") + "（使わないと選びました）"; } }); } catch (e) { err("dc", e); }
      return G;
    };
  }

  /* ════════════ No.552 ① AI の写真の確認：パッケージ・小さく写った写真を外しすぎない・断定しない ════════════ */
  const PHQ = /「商品写真」として使えるか判定してください/;
  const RULE = "\n\n【ok の決め方・厳守】ok:false にしてよいのは、①〜③のどれかに、はっきり当てはまるときだけです。" +
    "パッケージ・箱・袋・ラベルが写った写真、商品が小さく写った写真、使用シーン・情景の写真は、この商品（または同じ会社の商品）のものなら ok:true です。" +
    "「商品本体が写っていない」「パッケージだけ」は ok:false の理由にしないでください。迷うときは ok:true にして、気になる点を reason に書いてください。" +
    "reason は断定せず「〜の可能性」の形で書いてください。";
  V99PHOTO.RULE = RULE;
  const V99SEEN = new Set();
  /* どの商品の写真か（前の問いには商品の名前が無く、AI が「登録商品と無関係」と言うことがあった＝本番の再現） */
  function ctxOf(T) {
    try {
      if (!T) return "";
      const c = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, 60);
      const L = [c(T.item) && "商品名：" + c(T.item), c(T.itemEn) && "英語名：" + c(T.itemEn), c(T.cat) && "カテゴリー：" + c(T.cat), c(T.co) && "会社：" + c(T.co)].filter(Boolean);
      return L.length ? "\n\n【この写真の商品（登録の情報）】" + L.join("／") : "";
    } catch (e) { return ""; }
  }
  V99PHOTO.ctxOf = ctxOf;
  if (typeof llmAsk === "function") {
    const __la99 = llmAsk; // eslint-disable-line no-undef
    llmAsk = function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      try {
        if (typeof q === "string" && PHQ.test(q) && opts && opts.att && opts.att.b64 && q.indexOf("【ok の決め方") < 0) {
          V99PHOTO.n.rule++;
          const b64 = opts.att.b64;
          V99SEEN.add(fpB(b64)); // この画面で 21.99 の決め方で聞いた写真（印が付く前に次の確認が始まっても、確かめ直さない）
          return Promise.resolve(__la99.call(this, q + ctxOf(ten()) + RULE, maxTok, opts)).then((r) => { setTimeout(() => markV99(b64), 0); return r; });
        }
      } catch (e) { err("la", e); }
      return __la99.apply(this, arguments);
    };
  }
  /* 前の版の基準で「商品写真に向かない」と外れた写真（選んでいないもの）は、1回だけ確かめ直す。覚えた結果（v97 の指紋の控え）も同じ */
  // 21.99 の決め方で判定した理由は「〜の可能性」で書かれる（決め方で指示）。印（v99）か「可能性」のどちらかがあれば確かめ直さない
  /* 21.99 の決め方で判定した写真に印（v99）を付ける（どの呼び出しで始まった確認でも、答えが入った写真を中身で探す） */
  function fpB(b64) { const s = String(b64 || ""); return s.length + ":" + s.slice(-64); }
  function markV99(b64) {
    try {
      let n = 0;
      ((typeof TENS !== "undefined" && TENS) || []).forEach((t) => ((t && t.assets && t.assets.ph) || []).forEach((o) => { if (o && o.b64 === b64 && o._dq && !o._dq.v99) { o._dq.v99 = 1; n++; } })); // eslint-disable-line no-undef
      if (n) { try { if (typeof v97mStoreCache === "function") v97mStoreCache(); } catch (e) { /* 無視 */ } save(); } // eslint-disable-line no-undef
    } catch (e) { err("mark", e); }
  }
  const oldNg = (dq) => !!(dq && dq.ok === false && !dq.jp && !dq.low && !dq.v99 && !/可能性|かもしれ|おそれ/.test(String(dq.reason || "")));
  if (typeof v97mApplyCache === "function") {
    const __ac99 = v97mApplyCache; // eslint-disable-line no-undef
    v97mApplyCache = function () { // eslint-disable-line no-global-assign
      try {
        const C = typeof v97mCache === "function" ? v97mCache() : null; // eslint-disable-line no-undef
        if (C) { let n = 0; Object.keys(C).forEach((k) => { if (C[k] && oldNg(C[k].dq)) { delete C[k]; n++; } }); if (n && typeof v97mCacheSave === "function") v97mCacheSave(C); } // eslint-disable-line no-undef
      } catch (e) { err("cache", e); }
      return __ac99.apply(this, arguments);
    };
  }
  if (typeof dkImgAudit === "function") {
    const __au99 = dkImgAudit; // eslint-disable-line no-undef
    dkImgAudit = async function () { // eslint-disable-line no-global-assign
      let todo = [], re = [];
      try {
        if (aiOn() && !auditRun()) {
          const A = typeof dkAssets === "function" ? dkAssets() : null; // eslint-disable-line no-undef
          const P = ((A && A.ph) || []).filter((o) => o && o.b64);
          P.forEach((o) => { if (oldNg(o._dq) && !decOf(o) && !o.v99re && !V99SEEN.has(fpB(o.b64))) { o.v99re = { dq: o._dq, at: Date.now() }; delete o._dq; re.push(o); } });
          todo = P.filter((o) => !o._dq);
          if (re.length) V99PHOTO.n.rejudge += re.length;
        }
      } catch (e) { err("au0", e); }
      try { return await __au99.apply(this, arguments); }
      finally {
        try {
          let n = 0;
          todo.forEach((o) => { if (o._dq && !o._dq.v99) { o._dq.v99 = 1; n++; } });
          re.forEach((o) => { if (!o._dq && o.v99re) o._dq = o.v99re.dq; }); // 応答が無かった写真は前の判定に戻す（次は確かめ直さない）
          if (n) { try { if (typeof v97mStoreCache === "function") v97mStoreCache(); } catch (e) { /* 無視 */ } save(); } // eslint-disable-line no-undef
        } catch (e) { err("au1", e); }
      }
    };
  }

  /* ════════════ 選んだときの動き ════════════ */
  function setDec(T, i, d) {
    const o = ((T && T.assets && T.assets.ph) || [])[i];
    if (!o || !o.b64) return false;
    if (typeof v96dkSetDec === "function") v96dkSetDec(o, d, "v99"); // eslint-disable-line no-undef
    else if (d) o.v96jp = { d, fp: "", at: "", how: "v99" }; else delete o.v96jp;
    logU0("deck", "営業資料の写真：商品写真" + (i + 1) + (d === "use" ? "をこのまま使う" : d === "no" ? "を使わない" : "の選択を戻す"));
    return true;
  }
  function after(msg) {
    save();
    rerender();
    refreshDW();
    if (msg) toast0(msg);
  }
  function refreshDW() {
    try {
      const box = document.querySelector('#pn [data-v99phpanel="ask"]');
      if (!box) return;
      const h = panelHtml(ten(), "ask");
      if (!h) return;
      const t = document.createElement("div"); t.innerHTML = h;
      if (t.firstElementChild) box.replaceWith(t.firstElementChild);
    } catch (e) { err("refresh", e); }
  }
  V99PHOTO.refreshDW = refreshDW;
  function clickInput(sel) { const inp = document.querySelector(sel); if (inp) { try { inp.click(); return true; } catch (e) { /* 無視 */ } } return false; }
  function firstEmptyKey(T) { const A = (T && T.assets) || {}; for (let i = 0; i < NPH(); i++) { const o = (A.ph || [])[i]; if (!o || !o.b64) return "ph" + i; } return ""; }
  let upTmp = null;
  function upMany() {
    // v98 の「手元の写真を上げる（何枚でも）」と同じ入口（data-v98pup="ph"）。無ければ空いた枠の「上げる」
    if (clickInput('input[type=file][data-v98pup="ph"]')) return;
    if (!upTmp) {
      upTmp = document.createElement("input"); upTmp.type = "file"; upTmp.hidden = true; upTmp.multiple = true; upTmp.accept = "image/png,image/jpeg,image/webp"; upTmp.setAttribute("data-v98pup", "ph");
      document.body.appendChild(upTmp);
    }
    try { upTmp.click(); } catch (e) { const k = firstEmptyKey(ten()); if (k) clickInput(`input[type=file][data-dkup="${k}"]`); }
  }
  function openReg() { try { if (W.V98PROD && typeof W.V98PROD.openReg === "function") { W.V98PROD.openReg(); return; } } catch (e) { err("reg", e); } toast0(M("登録済みの写真の画面を開けませんでした", "Could not open the registered photos", "无法打开已登记的照片", "No se pudieron abrir las fotos registradas")); }
  async function recheck(T) {
    try {
      if (!aiOn()) { toast0(M("AI エンジンにつながっていないため、確かめ直せません", "The AI engine is not connected, so it cannot check again", "未连接AI引擎，无法重新检查", "El motor de IA no está conectado; no se puede revisar de nuevo")); return; }
      const L = listOf(T).filter((x) => x.st === "flag" && !x.dec && x.o._dq && (x.o._dq.ok === false || x.o._dq.jp || x.o._dq.low));
      L.forEach((x) => { try { x.o.v96re = { at: Date.now(), dq: x.o._dq }; delete x.o._dq; } catch (e) { /* 無視 */ } });
      toast0(M("AI が写真をもう一度確かめています（資料はまだ作りません）", "The AI is checking the photos again (no deck is being made yet)", "AI 正在重新检查照片（尚未制作资料）", "La IA está revisando las fotos de nuevo (aún no se crea la presentación)"));
      try { if (W.V97M) { W.V97M.force = 1; W.V97M.failAt = 0; } } catch (e) { /* 無視 */ }
      rerender();
      await dkImgAudit(); // eslint-disable-line no-undef
      L.forEach((x) => { try { if (!x.o._dq && x.o.v96re && x.o.v96re.dq) x.o._dq = x.o.v96re.dq; delete x.o.v96re; } catch (e) { /* 無視 */ } });
      after("");
    } catch (e) { err("recheck", e); }
  }
  function doAct(act, i, btn) {
    const T = ten();
    if (!T) return;
    V99PHOTO.n.act++;
    const nmJa = "商品写真" + (i + 1);
    if (act === "use") { setDec(T, i, "use"); after(M(`${nmJa}を、このまま資料に使います（AI の見立てが変わっても使います）`, `${phNm(i)} will be used as it is`, `${phNm(i)}将直接用于资料`, `La ${phNm(i)} se usará tal cual`)); return; }
    if (act === "no") { setDec(T, i, "no"); after(M(`${nmJa}は、資料に使いません`, `${phNm(i)} will not be used`, `${phNm(i)}不用于资料`, `La ${phNm(i)} no se usará`)); return; }
    if (act === "clear") { setDec(T, i, ""); after(M(`${nmJa}の選択を戻しました`, `The choice for ${phNm(i)} was undone`, `已撤销${phNm(i)}的选择`, `Se deshizo la elección de la ${phNm(i)}`)); return; }
    if (act === "edit") { if (typeof W.v96dkEdOpen === "function") W.v96dkEdOpen(T, i); else toast0(M("加工の画面を開けませんでした", "Could not open the editor", "无法打开编辑画面", "No se pudo abrir el editor")); return; }
    if (act === "undo") { if (typeof v96dkUndoEdit === "function") v96dkUndoEdit(T, i).then(() => refreshDW()); return; } // eslint-disable-line no-undef
    if (act === "rep") { if (!clickInput(`input[type=file][data-dkup="ph${i}"]`)) toast0(M("写真の欄の「差し替える」から入れ替えてください", "Replace it with “Replace” in the photo slots", "请在照片栏中点击“替换”", "Sustitúyala con «Sustituir» en las fotos")); return; }
    if (act === "reg" || act === "regAny" || act === "logoReg") { openReg(); return; }
    if (act === "upMany") { upMany(); return; }
    if (act === "logoUp") { if (!clickInput('input[type=file][data-dkup="logo"]')) clickInput('input[type=file][data-v98pup="logo"]'); return; }
    if (act === "logoNo") { T.assets = T.assets || { logo: null, ph: [] }; T.assets.v99logoNo = { fp: logoFp(T), at: (typeof TODAYS !== "undefined" && TODAYS) || "" }; V99PHOTO.n.logoNo++; logU0("deck", "営業資料：ロゴを使わない"); after(M("ロゴは使いません（表紙はロゴなしになります）", "The logo will not be used (no logo on the cover)", "不使用标志（封面没有标志）", "No se usará el logo (portada sin logo)")); return; } // eslint-disable-line no-undef
    if (act === "toLogo") {
      const A = T.assets || {}; const o = (A.ph || [])[i];
      if (!o || !o.b64) return;
      if (A.logo && A.logo.b64) { toast0(M("ロゴはもう入っています（ロゴの「差し替える」で替えられます）", "A logo is already set (replace it with “Replace”)", "已有标志（可用“替换”更换）", "Ya hay un logo (cámbielo con «Sustituir»)")); return; }
      A.logo = { b64: o.b64, mime: o.mime || "image/png", w: o.w, h: o.h, src: o.src || "import", cap: o.cap || "" };
      A.ph[i] = null;
      try { delete A.v99logoNo; } catch (e) { /* 無視 */ }
      logU0("deck", "営業資料：商品写真" + (i + 1) + "をロゴに移す");
      after(M(`商品写真${i + 1}をロゴにしました（表紙に入ります）`, `Photo ${i + 1} is now the logo (it goes on the cover)`, `已将照片${i + 1}设为标志（用于封面）`, `La foto ${i + 1} ahora es el logo (va en la portada)`));
      return;
    }
    if (act === "logoUse") { if (T.assets) delete T.assets.v99logoNo; logU0("deck", "営業資料：ロゴを使う（戻す）"); after(M("ロゴを使います", "The logo will be used", "将使用标志", "Se usará el logo")); return; }
    if (act === "all") { const L = listOf(T).filter((x) => (x.st === "flag" || x.st === "pend") && !x.dec); L.forEach((x) => setDec(T, x.i, "use")); after(M(`${L.length}枚を、このまま資料に使います`, `${L.length} photo(s) will be used as they are`, `${L.length} 张照片将直接使用`, `Se usarán tal cual ${L.length} foto(s)`)); return; }
    if (act === "re") { recheck(T); return; }
    if (act === "go") { goGen(); return; }
    if (act === "close") { V99PHOTO.ask = null; try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } return; } // eslint-disable-line no-undef
    if (act === "regen") { regen(); return; }
    if (act === "pick") { const k = btn && btn.getAttribute("data-v99k"); if (k) clickInput(`input[type=file][data-dkup="${k}"]`); return; }
  }
  document.addEventListener("click", (e) => {
    try {
      const b = e.target && e.target.closest && e.target.closest("[data-v99ph]");
      if (!b || b.tagName !== "BUTTON") return;
      e.preventDefault(); e.stopPropagation();
      const act = b.getAttribute("data-v99ph"), i = +(b.getAttribute("data-v99i") || 0);
      doAct(act, i, b);
    } catch (x) { err("click", x); }
  }, true);
  V99PHOTO.doAct = doAct;

  /* ════════════ 写真の欄（deckAssetCard）：ロゴと写真の欄のボタン・下の箱を1つに ════════════ */
  if (typeof deckAssetCard === "function") {
    const __ac99 = deckAssetCard; // eslint-disable-line no-undef
    deckAssetCard = function () { // eslint-disable-line no-global-assign
      // 21.96〜21.97 の箱（v96dkPanelHtml）は出さない（この層の箱にまとめる）
      let pn0 = null;
      try { if (typeof v96dkPanelHtml === "function") { pn0 = v96dkPanelHtml; v96dkPanelHtml = function () { return ""; }; } } catch (e) { pn0 = null; } // eslint-disable-line no-undef, no-global-assign
      let h;
      try { h = __ac99.apply(this, arguments); } finally { try { if (pn0) v96dkPanelHtml = pn0; } catch (e) { /* 無視 */ } } // eslint-disable-line no-global-assign
      try {
        const T = ten(); if (!T) return h;
        h = String(h);
        // 21.98 の「確認前の写真」の箱（最後に足されている）は外す（この層の箱にまとめる）
        const k98 = h.indexOf('<div class="c v98p-pend"');
        if (k98 > 0) h = h.slice(0, k98);
        const A = T.assets || {}, off = logoOff(T);
        // ファイルを選ぶ label（ボタンとして読めない）→ ボタン（名前に欄の名前）＋隠したファイル選択
        h = h.replace(/<label class="btn g" style="padding:3px 8px;font-size:10px;cursor:pointer">(選ぶ|変更)<input type="file" hidden accept="image\/\*" data-dkup="(logo|ph\d+)"><\/label>/g, (m, lb, key) => {
          const isLogo = key === "logo";
          const has = isLogo ? !!(A.logo && A.logo.b64) : !!((A.ph || [])[+key.slice(2)] && A.ph[+key.slice(2)].b64);
          const nm = isLogo ? M("ロゴ", "Logo", "标志", "Logo") : phNm(+key.slice(2));
          const t = has ? M("差し替える", "Replace", "替换", "Sustituir") : M("上げる", "Upload", "上传", "Subir");
          let s = `<button type="button" class="btn g v99ph-sb" data-v99ph="pick" data-v99k="${key}" aria-label="${E(nm + M("：", ": ", "：", ": ") + t)}">${E(t)}</button><input type="file" hidden accept="image/*" data-dkup="${key}">`;
          if (isLogo) {
            s += `<button type="button" class="btn g v99ph-sb" data-v99ph="logoReg" aria-label="${E(nm + M("：選ぶ（登録済みの写真から）", ": choose from registered photos", "：从已登记的照片中选择", ": elegir de las fotos registradas"))}">${E(M("選ぶ", "Choose", "选择", "Elegir"))}</button>` +
              (off ? `<button type="button" class="btn g v99ph-sb" data-v99ph="logoUse" aria-label="${E(nm + M("：使う（戻す）", ": use it (undo)", "：使用（恢复）", ": usarlo (deshacer)"))}">${E(M("使う", "Use", "使用", "Usar"))}</button>`
                : `<button type="button" class="btn g v99ph-sb" data-v99ph="logoNo" aria-label="${E(nm + M("：使わない", ": don’t use", "：不使用", ": no usar"))}">${E(M("使わない", "Don’t use", "不使用", "No usar"))}</button>`);
          }
          return s;
        });
        // ロゴの欄の札（21.98）：使わないと選んだとき
        if (off) h = h.replace(/(<p class="v98p-lgst[^"]*" data-v98plogo="\d">)[^<]*(<\/p>)/, `$1${E(M("使わない（選んだ）", "Not used (your choice)", "不使用（已选择）", "No se usa (su elección)"))}$2`);
        // 写真の欄の短い表示：AI の判定は断定しない・「使わない」を選んだ写真
        h = h.replace(/(<p class="lbl" style="margin-bottom:5px">商品写真(\d+)<\/p>)([\s\S]*?)(data-dkup="ph\d+")/g, (m, a, n, mid, z) => {
          const o = (A.ph || [])[+n - 1];
          if (!o || !o.b64) return m;
          const rs = String((o._dq && o._dq.reason) || "");
          if (rs && whyKeys(o).indexOf("ng") >= 0) mid = mid.replace("⚠ " + E(rs), "⚠ " + E(M("AI の見立て：", "AI: ", "AI：", "IA: ") + soft(rs)));
          if (decOf(o) === "no") mid = mid.replace(/<p style="font-size:8\.5px;color:var\(--good\);margin:3px 0 0">✓ 納品品質(・✨補正済)?<\/p>/, `<p style="font-size:8.5px;color:var(--ink-3);margin:3px 0 0">${E(M("✕ 使わない（選んだ）", "✕ Not used (your choice)", "✕ 不使用（已选择）", "✕ No se usa"))}</p>`);
          return a + mid + z;
        });
        h += panelHtml(T, "card");
      } catch (e) { err("card", e); }
      return h;
    };
  }

  /* ════════════ No.552 ② 作る前 ════════════ */
  function sigOf(T) {
    try { return listOf(T).map((x) => x.o.b64.length + ":" + x.o.b64.slice(-24) + ":" + x.st + ":" + (x.dec || "")).join("|") || "none"; } catch (e) { return ""; }
  }
  function needAsk(T) {
    if (!T) return false;
    const L = listOf(T);
    const nIn = L.filter((x) => inDeck(x.o)).length;
    const flagU = L.filter((x) => x.st === "flag" && !x.dec), pendU = L.filter((x) => x.st === "pend" && !x.dec);
    const need = flagU.length > 0 || (aiOn() && pendU.length > 0) || nIn === 0;
    if (!need) return false;
    if (T.v99phAsk && T.v99phAsk === sigOf(T)) return false; // 同じ写真・同じ状態で、もう「この写真で作る」を選んだ
    return true;
  }
  V99PHOTO.needAsk = needAsk;
  let genInner = null;
  function openAsk(lang0, force) {
    const T = ten();
    const h = panelHtml(T, "ask");
    if (!h || typeof openDW !== "function") return false; // eslint-disable-line no-undef
    V99PHOTO.ask = { lang: lang0, force: !!force, at: Date.now() };
    openDW(`<div class="v99ph-dw" data-noi18n="1">${h}</div>`); // eslint-disable-line no-undef
    try { if (typeof dwChrome === "function") dwChrome(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    V99PHOTO.n.ask++;
    setTimeout(() => { try { const b = document.querySelector('#pn [data-v99ph="go"]'); if (b) b.focus({ preventScroll: true }); const pn = document.getElementById("pn"); if (pn) pn.scrollTop = 0; } catch (e) { /* 無視 */ } }, 60);
    return true;
  }
  function goGen() {
    const A = V99PHOTO.ask || {}; V99PHOTO.ask = null;
    const T = ten();
    try {
      if (T) {
        // 確認前の写真は「このまま入れて作る」と決める（作っている間に確認が終わっても外さない）
        listOf(T).filter((x) => x.st === "pend" && !x.dec).forEach((x) => { const o = x.o; if (typeof v96dkSetDec === "function") v96dkSetDec(o, "use", "v99gen"); }); // eslint-disable-line no-undef
        T.v99phAsk = sigOf(T);
        save();
      }
    } catch (e) { err("go0", e); }
    try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    V99PHOTO.n.go++;
    try { if (W.V96DK) W.V96DK.pass = 1; } catch (e) { /* 無視 */ }
    V99PHOTO.pass = 1;
    try { dk3Generate(A.lang || (typeof DK3G !== "undefined" && DK3G && DK3G.lang) || "en", A.force); } catch (e) { err("go", e); } // eslint-disable-line no-undef
  }
  if (typeof dk3Generate === "function") {
    const __g99 = dk3Generate; // eslint-disable-line no-undef
    genInner = __g99;
    dk3Generate = async function (lg, force) { // eslint-disable-line no-global-assign
      const pass = V99PHOTO.pass; V99PHOTO.pass = 0;
      try {
        const run = typeof DK3G !== "undefined" && DK3G && DK3G.run; // eslint-disable-line no-undef
        if (!pass && !run && needAsk(ten())) {
          if (openAsk(lg, force)) return undefined;
        }
        if (!run) { try { if (W.V96DK) W.V96DK.pass = 1; } catch (e) { /* 無視 */ } } // 21.96 の選ぶ画面は出さない（この層の画面で確かめた）
      } catch (e) { err("gen0", e); }
      return __g99.apply(this, arguments);
    };
  }

  /* ════════════ No.552 ③ 作った後 ════════════ */
  function deckPhotos(deck) {
    const used = new Set();
    try { (deck.slides || []).forEach((S) => (S.els || []).forEach((e) => { if (!e || e.k !== "img" || e.m === "logo") return; const m = String(e.m).replace(/c$/, "").match(/^p0:(\d+)$/); if (m) used.add(+m[1]); })); } catch (e) { err("dph", e); }
    return used;
  }
  V99PHOTO.deckPhotos = deckPhotos;
  function afterInfo() {
    try {
      if (typeof DK3G === "undefined" || !DK3G || !DK3G.deck || DK3G.run) return null; // eslint-disable-line no-undef
      const T = ten(); const D = DK3G.deck; // eslint-disable-line no-undef
      if (!T || (DK3G.ten && DK3G.ten !== T && typeof dk3PKey === "function" && dk3PKey(DK3G.ten) !== dk3PKey(T))) return null; // eslint-disable-line no-undef
      const used = deckPhotos(D);
      const L = listOf(T);
      const all = L.filter((x) => !used.has(x.i));
      const out = used.size === 0 ? all : all.filter((x) => !inDeck(x.o) || x.dec === "use");
      const ln = (typeof DECK_L !== "undefined" && DECK_L[D.lang] && DECK_L[D.lang].name) || D.lang; // eslint-disable-line no-undef
      return { T, D, used, L, out, inDeck: used.size, langName: ln };
    } catch (e) { err("ainfo", e); return null; }
  }
  V99PHOTO.afterInfo = afterInfo;
  function regen() {
    try {
      if (typeof DK3G !== "undefined" && DK3G && DK3G.run) return; // eslint-disable-line no-undef
      const ag = document.getElementById("dk3again");
      if (ag && !ag.disabled) { ag.click(); return; }
      const l = (typeof DK3G !== "undefined" && DK3G && ((DK3G.deck && DK3G.deck.lang) || DK3G.lang)) || "en"; // eslint-disable-line no-undef
      dk3Generate(l, true); // eslint-disable-line no-undef
    } catch (e) { err("regen", e); }
  }
  if (typeof vDeck === "function") {
    const __vd99 = vDeck; // eslint-disable-line no-undef
    vDeck = function () { // eslint-disable-line no-global-assign
      let h = __vd99.apply(this, arguments);
      try {
        const I = afterInfo();
        if (I && (I.out.some((x) => x.dec !== "no") || I.inDeck === 0)) {
          const box = panelHtml(I.T, "after", I);
          const k = String(h).indexOf('<div class="dk3-dl">');
          if (box) { h = String(h); h = k > 0 ? h.slice(0, k) + box + h.slice(k) : h + box; V99PHOTO.n.after++; }
        }
        setTimeout(refreshDW, 0);
      } catch (e) { err("vdeck", e); }
      return h;
    };
  }
  /* 最終チェック：資料に写真が入っていない・足りないときは理由を出す */
  if (typeof dk3Check === "function") {
    const __ck99 = dk3Check; // eslint-disable-line no-undef
    dk3Check = function (deck) { // eslint-disable-line no-global-assign
      const r = __ck99.apply(this, arguments);
      try {
        const T = (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || ten(); // eslint-disable-line no-undef
        if (r && T && deck && deck.slides) {
          const used = deckPhotos(deck);
          const L = listOf(T), out = L.filter((x) => !used.has(x.i) && x.dec !== "no" && (used.size === 0 || !inDeck(x.o)));
          if (used.size === 0 || out.length) {
            const why = out.map((x) => "商品写真" + (x.i + 1) + "（" + (x.st === "flag" ? (whyJa(x.o, x.ks) || "外れた写真") : x.st === "pend" ? "AI の確認がまだ" : "資料のページの数の都合") + "）").join("・");
            const t = used.size === 0
              ? (L.length ? "資料に写真が1枚も入っていません：" + why + "。資料の下の「資料に入らなかった写真」で「このまま使う（判定を上書き）」「登録済みの写真から選び直す」「差し替える（上げる）」を選び、「写真を入れて作り直す」を押すと入ります"
                : "資料に写真が1枚も入っていません：商品写真が登録されていません。写真を上げるか登録済みの写真から選び、「写真を入れて作り直す」を押すと入ります")
              : "資料に入らなかった写真 " + out.length + "枚：" + why + "。資料の下の「資料に入らなかった写真」で選び直せます";
            r.warn = r.warn || [];
            if (!r.warn.some((w) => w && w.k === "v99ph")) r.warn.unshift({ k: "v99ph", t });
          }
        }
      } catch (e) { err("ck", e); }
      return r;
    };
  }
  function whyJa(o, ks) {
    const rs = String((o && o._dq && o._dq.reason) || "").slice(0, 40);
    return (ks || []).map((k) => k === "ng" ? (rs ? "AI の見立て：" + soft(rs) : "AI の見立て：商品写真に向かない可能性") : k === "jp" ? "日本語の文字が目立つ可能性" : k === "low" ? "ぼやけの可能性" : k === "info" ? "図・文字が中心の可能性" : k === "small" ? "小さい" : k === "ratio" ? "横長・縦長" : k).join("・");
  }
  /* 21.97 の理由の言葉（最終チェック・ほかの画面）も断定しない */
  if (typeof v97dkWhyTx === "function") {
    const __wt99 = v97dkWhyTx; // eslint-disable-line no-undef
    v97dkWhyTx = function (o, k) { // eslint-disable-line no-global-assign
      try { if (k === "ng") { const rs = String((o && o._dq && o._dq.reason) || "").slice(0, 40); return rs ? M(`AI の見立て：「${soft(rs)}」`, `AI’s view: possibly “${rs}”`, `AI 的看法：可能“${rs}”`, `Opinión de la IA: posiblemente «${rs}»`) : M("AI の見立て：商品写真に向かない可能性", "AI’s view: possibly not suitable as a product photo", "AI 的看法：可能不适合作商品照片", "Opinión de la IA: posiblemente no apta"); } } catch (e) { err("wt", e); }
      return __wt99.apply(this, arguments);
    };
  }
  if (typeof v97dkWhyJa === "function") {
    const __wj99 = v97dkWhyJa; // eslint-disable-line no-undef
    v97dkWhyJa = function (o, k) { // eslint-disable-line no-global-assign
      try { if (k === "ng") { const rs = String((o && o._dq && o._dq.reason) || "").slice(0, 40); return rs ? "AI の見立て：" + soft(rs) : "AI の見立て"; } } catch (e) { err("wj", e); }
      return __wj99.apply(this, arguments);
    };
  }
  if (typeof v56deckPhWhy === "function") {
    const __pw99 = v56deckPhWhy; // eslint-disable-line no-undef
    v56deckPhWhy = function (o) { // eslint-disable-line no-global-assign
      try { const ks = whyKeys(o); if (ks.indexOf("ng") >= 0 && !decOf(o)) return whyJa(o, ks) + "（使うかどうかは「写真・ロゴの使い方」で選べます）"; } catch (e) { err("pw", e); }
      return __pw99.apply(this, arguments);
    };
  }
  /* 最終チェックの新しい行の英・中・西 */
  try {
    if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) { // eslint-disable-line no-undef
      const ph = (s, l) => String(s).replace(/商品写真(\d+)/g, l === 0 ? "photo $1" : l === 1 ? "商品照片$1" : "foto $1").replace(/AI の見立て：/g, l === 0 ? "AI’s view: " : l === 1 ? "AI 看法：" : "opinión de la IA: ").replace(/AI の確認がまだ/g, l === 0 ? "not checked by the AI yet" : l === 1 ? "AI 尚未检查" : "sin revisar").replace(/資料のページの数の都合/g, l === 0 ? "number of pages" : l === 1 ? "页数原因" : "número de páginas").replace(/・/g, l === 1 ? "・" : ", ");
      [
        { re: /^資料に写真が1枚も入っていません：商品写真が登録されていません。写真を上げるか登録済みの写真から選び、「写真を入れて作り直す」を押すと入ります$/, en: "No photos are in the deck: no product photos are registered. Upload or choose photos, then press “Make the deck again with the photos”", zh: "资料中没有照片：未登记商品照片。请上传或选择照片，再点击“放入照片重新制作”", es: "No hay fotos en la presentación: no hay fotos registradas. Suba o elija fotos y pulse «Crear de nuevo con las fotos»" },
        { re: /^資料に写真が1枚も入っていません：([\s\S]*)。資料の下の「資料に入らなかった写真」で「このまま使う（判定を上書き）」「登録済みの写真から選び直す」「差し替える（上げる）」を選び、「写真を入れて作り直す」を押すと入ります$/,
          en: (m) => "No photos are in the deck: " + ph(m[1], 0) + ". Under “Photos not in the deck”, choose “Use as it is (override the AI)”, “Choose again from registered photos” or “Replace (upload)”, then press “Make the deck again with the photos”",
          zh: (m) => "资料中没有照片：" + ph(m[1], 1) + "。请在资料下方的“未放入资料的照片”中选择“直接使用（覆盖判定）”“从已登记的照片中重新选择”或“替换（上传）”，再点击“放入照片重新制作”",
          es: (m) => "No hay fotos en la presentación: " + ph(m[1], 2) + ". En «Fotos que no están en la presentación», elija «Usar tal cual (anular la IA)», «Elegir de nuevo» o «Sustituir (subir)» y pulse «Crear de nuevo con las fotos»" },
        { re: /^資料に入らなかった写真 (\d+)枚：([\s\S]*)。資料の下の「資料に入らなかった写真」で選び直せます$/,
          en: (m) => m[1] + " photo(s) not in the deck: " + ph(m[2], 0) + ". You can choose again under “Photos not in the deck”",
          zh: (m) => "未放入资料的照片 " + m[1] + " 张：" + ph(m[2], 1) + "。可在“未放入资料的照片”中重新选择",
          es: (m) => m[1] + " foto(s) no están en la presentación: " + ph(m[2], 2) + ". Puede elegir de nuevo en «Fotos que no están en la presentación»" }
      ].reverse().forEach((p) => I18N.pat.unshift(p)); // eslint-disable-line no-undef
    }
  } catch (e) { err("i18n", e); }
})();
