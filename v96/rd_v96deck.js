/* v21.96 deck（見せ方の層）：logic_v2196deck.js のあとに読む
   No.509 写真の「文字の所を切り取る・隠す」画面（v96dkEdOpen）。枠をなぞって選ぶ（指・マウス）か、上・下・左・右の帯を押して選ぶ（キーボード）
   No.522 営業資料の作成中の右下の表示と、資料の画面の進み具合の要約（全何段のうち何段目・いま何をしているか・照合の回数・できあがりの枚数・
          経過と残りの目安〔この端末の実績から〕・同時に頼んでいる AI の数・ほかの画面に移っても続くこと）。終わったときの知らせ（資料を開く）
   onclick= と style= の属性は書かない（addEventListener と classList・canvas だけ）。外から来た文字は v96dkE でエスケープ */
(function () {
  "use strict";
  const W = window;
  const V = W.V96DK;
  if (!V || V._rd) return;
  V._rd = 1;
  const err = (k, e) => { try { V.err.push("rd." + k + ": " + String((e && e.message) || e).slice(0, 160)); if (V.err.length > 40) V.err.shift(); } catch (x) { } };
  const M = (ja, en, zh, es) => (typeof W.v96dkM === "function" ? W.v96dkM(ja, en, zh, es) : ja);
  const E = (s) => (typeof W.v96dkE === "function" ? W.v96dkE(s) : String(s == null ? "" : s));
  const $ = (s, r) => (r || document).querySelector(s);

  /* ══════════ No.509 切り取る・隠す ══════════ */
  const ED = { el: null, T: null, i: -1, img: null, ops: [], cur: null, sel: null, drag: null, back: null, busy: 0 };
  function edClose() {
    try { if (ED.el) ED.el.remove(); } catch (e) { }
    ED.el = null; ED.img = null; ED.cur = null; ED.ops = []; ED.sel = null; ED.drag = null;
    document.removeEventListener("keydown", edKey, true);
    try { if (ED.back && ED.back.isConnected) ED.back.focus(); } catch (e) { }
  }
  function edKey(e) {
    if (!ED.el) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); edClose(); return; }
    if (e.key === "Tab") { // 窓の中だけを回る
      const f = Array.from(ED.el.querySelectorAll("button:not([disabled]),canvas[tabindex]"));
      if (!f.length) return;
      const a = document.activeElement, i = f.indexOf(a);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    }
  }
  function edCur() { try { ED.cur = V.applyOps(ED.img, ED.ops); } catch (e) { err("cur", e); ED.cur = null; } }
  function edSmall(cv) { const w = cv ? cv.width : 0, h = cv ? cv.height : 0; return Math.min(w, h) < 420 && !(Math.max(w, h) >= 700 && Math.min(w, h) >= 380); }
  function edDraw() {
    const cv = ED.el && $(".v96dk-edcv", ED.el); if (!cv || !ED.cur) return;
    const stage = $(".v96dk-edstage", ED.el);
    const maxW = Math.max(200, Math.min((stage && stage.clientWidth) || 800, 860)), maxH = Math.max(160, Math.round(window.innerHeight * 0.52));
    const s = Math.min(1, maxW / ED.cur.width, maxH / ED.cur.height);
    const w = Math.max(1, Math.round(ED.cur.width * s)), h = Math.max(1, Math.round(ED.cur.height * s));
    if (cv.width !== w) cv.width = w; if (cv.height !== h) cv.height = h;
    const g = cv.getContext("2d");
    g.clearRect(0, 0, w, h); g.drawImage(ED.cur, 0, 0, w, h);
    const R = ED.sel;
    if (R && R.w > 0.005 && R.h > 0.005) {
      g.save(); g.fillStyle = "rgba(10,20,40,.45)";
      g.fillRect(0, 0, w, R.y * h); g.fillRect(0, (R.y + R.h) * h, w, h - (R.y + R.h) * h);
      g.fillRect(0, R.y * h, R.x * w, R.h * h); g.fillRect((R.x + R.w) * w, R.y * h, w - (R.x + R.w) * w, R.h * h);
      g.strokeStyle = "#FF9F1C"; g.lineWidth = 3; g.setLineDash([8, 5]); g.strokeRect(R.x * w + 1.5, R.y * h + 1.5, R.w * w - 3, R.h * h - 3);
      g.restore();
    }
    edState();
  }
  function edState() {
    if (!ED.el) return;
    const has = !!(ED.sel && ED.sel.w > 0.01 && ED.sel.h > 0.01);
    ED.el.querySelectorAll("[data-v96ed-op]").forEach(b => { b.disabled = !has || ED.busy; });
    const u = $('[data-v96ed="undo"]', ED.el), z = $('[data-v96ed="reset"]', ED.el), sv = $('[data-v96ed="save"]', ED.el);
    if (u) u.disabled = !ED.ops.length || !!ED.busy; if (z) z.disabled = !ED.ops.length || !!ED.busy; if (sv) sv.disabled = !ED.ops.length || !!ED.busy;
    const msg = $(".v96dk-edmsg", ED.el);
    if (msg) {
      let t = "";
      if (ED.busy) t = M("保存しています…", "Saving…", "正在保存…", "Guardando…");
      else if (ED.cur && edSmall(ED.cur)) t = M("⚠ このままでは小さすぎて資料に使えません（短い辺 " + Math.min(ED.cur.width, ED.cur.height) + "px・420px 以上が必要）。切り取る枠を広げるか、「1つ戻す」でやり直してください", "⚠ Too small for the deck now (short side " + Math.min(ED.cur.width, ED.cur.height) + " px; 420 px or more needed). Use a larger frame, or press “Undo”", "⚠ 现在太小，无法用于资料（短边 " + Math.min(ED.cur.width, ED.cur.height) + "px，需 420px 以上）", "⚠ Ahora es demasiado pequeña (lado corto " + Math.min(ED.cur.width, ED.cur.height) + " px; se necesitan 420 px)");
      else if (!ED.ops.length) t = has ? M("下のボタンで、選んだ枠を切り取る・ぼかす・塗るのどれかを選んでください", "Choose crop, blur or fill for the selected frame below", "请在下方选择对所选框裁剪、模糊或涂色", "Elija abajo recortar, difuminar o rellenar el marco") : M("写真の上をなぞって（ドラッグして）文字の所を囲むか、「上の帯」などのボタンで選んでください", "Drag over the photo to frame the text, or pick a band such as “Top band”", "请在照片上拖动框住文字，或用“上方横条”等按钮选择", "Arrastre sobre la foto para enmarcar el texto o elija una franja como «Franja superior»");
      else t = M("加工 " + ED.ops.length + "回（" + ED.ops.map(o => o.t === "crop" ? "切り取り" : o.t === "blur" ? "ぼかし" : "塗り").join("・") + "）。よければ「この写真を使う」を押してください", ED.ops.length + " edit(s). If it looks good, press “Use this photo”", "已编辑 " + ED.ops.length + " 次。满意请点击“使用这张照片”", ED.ops.length + " edición(es). Si está bien, pulse «Usar esta foto»");
      msg.textContent = t;
    }
  }
  function edPt(ev) {
    const cv = $(".v96dk-edcv", ED.el); const r = cv.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
    return { x, y };
  }
  function edBind() {
    const cv = $(".v96dk-edcv", ED.el);
    cv.addEventListener("pointerdown", (ev) => { try { ev.preventDefault(); cv.setPointerCapture(ev.pointerId); const p = edPt(ev); ED.drag = p; ED.sel = { x: p.x, y: p.y, w: 0, h: 0 }; edDraw(); } catch (e) { err("pd", e); } });
    cv.addEventListener("pointermove", (ev) => { if (!ED.drag) return; const p = edPt(ev), a = ED.drag; ED.sel = { x: Math.min(a.x, p.x), y: Math.min(a.y, p.y), w: Math.abs(p.x - a.x), h: Math.abs(p.y - a.y) }; edDraw(); });
    const up = () => { ED.drag = null; edState(); };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    ED.el.addEventListener("click", (ev) => {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v96ed],[data-v96ed-op],[data-v96ed-band]");
      if (!b || !ED.el.contains(b)) { if (ev.target === ED.el) edClose(); return; }
      ev.preventDefault(); ev.stopPropagation();
      try {
        const band = b.getAttribute("data-v96ed-band");
        if (band) { const f = 0.25; ED.sel = band === "top" ? { x: 0, y: 0, w: 1, h: f } : band === "bottom" ? { x: 0, y: 1 - f, w: 1, h: f } : band === "left" ? { x: 0, y: 0, w: f, h: 1 } : { x: 1 - f, y: 0, w: f, h: 1 }; edDraw(); return; }
        const op = b.getAttribute("data-v96ed-op");
        if (op && ED.sel && ED.sel.w > 0.01 && ED.sel.h > 0.01) {
          const s = ED.sel;
          ED.ops.push(op === "keep" ? { t: "crop", x: s.x, y: s.y, w: s.w, h: s.h } : op === "cut" ? edCutOp(s) : { t: op, x: s.x, y: s.y, w: s.w, h: s.h });
          if (!ED.ops[ED.ops.length - 1]) ED.ops.pop();
          ED.sel = null; edCur(); edDraw(); return;
        }
        const a = b.getAttribute("data-v96ed");
        if (a === "undo") { ED.ops.pop(); edCur(); edDraw(); }
        else if (a === "reset") { ED.ops = []; edCur(); edDraw(); }
        else if (a === "cancel") edClose();
        else if (a === "save") edSave();
      } catch (e) { err("edclick", e); }
    });
  }
  /* 枠の所を切り落とす：枠が上・下・左・右のどの辺に寄っているかで、残す側を決める（帯で選んだとき向け） */
  function edCutOp(s) {
    const top = s.y, bot = 1 - (s.y + s.h), left = s.x, right = 1 - (s.x + s.w);
    const full = s.w > 0.85, tall = s.h > 0.85;
    if (full && top < 0.05) return { t: "crop", x: 0, y: s.y + s.h, w: 1, h: Math.max(0.05, 1 - (s.y + s.h)) };
    if (full && bot < 0.05) return { t: "crop", x: 0, y: 0, w: 1, h: Math.max(0.05, s.y) };
    if (tall && left < 0.05) return { t: "crop", x: s.x + s.w, y: 0, w: Math.max(0.05, 1 - (s.x + s.w)), h: 1 };
    if (tall && right < 0.05) return { t: "crop", x: 0, y: 0, w: Math.max(0.05, s.x), h: 1 };
    // 真ん中の枠は切り落とせない：いちばん大きく残る側を残す
    const opt = [["top", s.y], ["bottom", bot], ["left", s.x], ["right", right]].sort((a, b) => b[1] - a[1])[0][0];
    return opt === "top" ? { t: "crop", x: 0, y: 0, w: 1, h: s.y } : opt === "bottom" ? { t: "crop", x: 0, y: s.y + s.h, w: 1, h: bot } : opt === "left" ? { t: "crop", x: 0, y: 0, w: s.x, h: 1 } : { t: "crop", x: s.x + s.w, y: 0, w: right, h: 1 };
  }
  async function edSave() {
    if (!ED.ops.length || ED.busy) return;
    ED.busy = 1; edState();
    try {
      const ok = await V.saveEdit(ED.T, ED.i, ED.ops.slice());
      if (ok) { edClose(); return; }
    } catch (e) { err("save", e); if (typeof W.toast === "function") W.toast(M("保存できませんでした：", "Could not save: ", "无法保存：", "No se pudo guardar: ") + String((e && e.message) || e).slice(0, 60)); }
    ED.busy = 0; edState();
  }
  W.v96dkEdOpen = async function (T, i) {
    try {
      edClose();
      const o = ((T && T.assets && T.assets.ph) || [])[i];
      if (!o || !o.b64) return;
      ED.T = T; ED.i = i; ED.ops = []; ED.sel = null; ED.busy = 0; ED.back = document.activeElement;
      const nm = M("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto del producto " + (i + 1));
      const B = (k, v, lb, cls) => `<button type="button" class="btn ${cls || "g"}" ${k}="${v}">${E(lb)}</button>`;
      const d = document.createElement("div");
      d.className = "v96dk-ed";
      d.setAttribute("data-noi18n", "1");
      d.innerHTML = `<div class="v96dk-edbox" role="dialog" aria-modal="true" aria-labelledby="v96dk-edh"><h3 id="v96dk-edh">${E(nm + M("：文字の所を切り取る・隠す", ": crop or hide the text", "：裁剪或遮住文字", ": recortar u ocultar el texto"))}</h3>` +
        `<p class="nn">${E(M("文字の所を、写真の上でなぞって（ドラッグして）囲むか、下の「上の帯」などで選びます。選んだ枠を「切り落とす」「その中だけ残す」「ぼかす」「まわりの色で塗る」のどれかにします。元の写真は残るので、あとで「加工の前に戻す」で戻せます。", "Drag over the photo to frame the text, or pick a band below. Then cut it off, keep only the frame, blur it, or fill it with the surrounding colour. The original is kept, so you can undo the edit later.", "在照片上拖动框住文字，或在下方选择横条。然后选择裁掉、只保留框内、模糊或用周围颜色涂抹。原照片会保留，之后可撤销。", "Arrastre sobre la foto para enmarcar el texto o elija una franja. Luego recórtela, deje solo el marco, difumínela o rellénela con el color de alrededor. La original se conserva."))}</p>` +
        `<div class="v96dk-edbands" role="group" aria-label="${E(M("帯で選ぶ", "Pick a band", "选择横条", "Elegir franja"))}">${B("data-v96ed-band", "top", M("上の帯", "Top band", "上方横条", "Franja superior"))}${B("data-v96ed-band", "bottom", M("下の帯", "Bottom band", "下方横条", "Franja inferior"))}${B("data-v96ed-band", "left", M("左の帯", "Left band", "左侧竖条", "Franja izquierda"))}${B("data-v96ed-band", "right", M("右の帯", "Right band", "右侧竖条", "Franja derecha"))}</div>` +
        `<div class="v96dk-edstage"><canvas class="v96dk-edcv" tabindex="0" aria-label="${E(nm)}"></canvas></div>` +
        `<div class="v96dk-edtools" role="group" aria-label="${E(M("選んだ枠をどうするか", "What to do with the frame", "对所选框的操作", "Qué hacer con el marco"))}">${B("data-v96ed-op", "cut", M("✂ 枠の所を切り落とす", "✂ Cut off the frame", "✂ 裁掉框内", "✂ Cortar el marco"))}${B("data-v96ed-op", "keep", M("⬚ 枠の中だけ残す", "⬚ Keep only the frame", "⬚ 只保留框内", "⬚ Dejar solo el marco"))}${B("data-v96ed-op", "blur", M("▦ ぼかす", "▦ Blur", "▦ 模糊", "▦ Difuminar"))}${B("data-v96ed-op", "fill", M("■ まわりの色で塗る", "■ Fill with the surrounding colour", "■ 用周围颜色涂抹", "■ Rellenar con el color de alrededor"))}${B("data-v96ed", "undo", M("↶ 1つ戻す", "↶ Undo", "↶ 撤销一步", "↶ Deshacer"))}${B("data-v96ed", "reset", M("最初から", "Start over", "重新开始", "Empezar de nuevo"))}</div>` +
        `<p class="v96dk-edmsg" role="status" aria-live="polite"></p>` +
        `<div class="v96dk-edgo">${B("data-v96ed", "save", M("この写真を使う（保存）", "Use this photo (save)", "使用这张照片（保存）", "Usar esta foto (guardar)"), "")}${B("data-v96ed", "cancel", M("やめる", "Cancel", "取消", "Cancelar"))}</div></div>`;
      document.body.appendChild(d);
      ED.el = d;
      document.addEventListener("keydown", edKey, true);
      edBind();
      const msg = $(".v96dk-edmsg", d); if (msg) msg.textContent = M("写真を読み込んでいます…", "Loading the photo…", "正在读取照片…", "Cargando la foto…");
      const src = await V.srcOf(o);
      ED.img = await V.imgEl("data:" + (src.mime || "image/jpeg") + ";base64," + src.b64);
      if (!ED.el) return;
      edCur(); edDraw();
      const f = $('[data-v96ed-band="top"]', d); if (f) f.focus();
    } catch (e) { err("edopen", e); edClose(); if (typeof W.toast === "function") W.toast(M("写真を開けませんでした", "Could not open the photo", "无法打开照片", "No se pudo abrir la foto")); }
  };
  window.addEventListener("resize", () => { try { if (ED.el && ED.cur) edDraw(); } catch (e) { } });

  /* ══════════ No.522 作成中の表示 ══════════ */
  const ui = () => { try { return typeof W.v96dkLang === "function" ? W.v96dkLang() : "ja"; } catch (e) { return "ja"; } };
  const clock = (ms) => (typeof W.v80docClock === "function" ? W.v80docClock(ms) : Math.floor(ms / 60000) + ":" + String(Math.floor(ms / 1000) % 60).padStart(2, "0"));
  const running = () => { try { return typeof DK3G !== "undefined" && !!DK3G.run && typeof V80DOC !== "undefined" && !!V80DOC.run; } catch (e) { return false; } };
  const STEPNM = { mat: ["素材の確認", "checking materials", "确认素材", "revisión de materiales"], story: ["公式サイトの確認", "reading the official website", "确认官网", "lectura del sitio oficial"], write: ["文章を書く", "writing the text", "撰写文案", "redacción del texto"], check1: ["文章と根拠の照合", "checking the text against the evidence", "核对文案与依据", "cotejo con las fuentes"], tr: ["表・条件の訳", "translating tables and terms", "翻译表格・条件", "traducción de tablas"], build: ["スライドの組み立て", "building the slides", "组装幻灯片", "montaje de diapositivas"], final: ["最終チェック", "final check", "最终检查", "revisión final"] };
  const stepNm = (k) => { const a = STEPNM[k]; return a ? M(a[0], a[1], a[2], a[3]) : k; };
  /* 進み具合の中身（右下と資料の画面で同じもの） */
  function prog() {
    if (!running()) return null;
    const R = V80DOC.run, S = (DK3G.steps || []).filter(s => s && s.k);
    const now = Date.now(), el = now - R.t0;
    let cur = null; try { cur = typeof W.v80docCur === "function" ? W.v80docCur() : null; } catch (e) { cur = null; }
    if (!cur) cur = S.find(s => s.st === "on") || null;
    const n = S.length, idx = cur ? S.indexOf(cur) + 1 : S.filter(s => s.st === "ok" || s.st === "ng").length;
    let sub = "";
    try {
      const k = cur && cur.k;
      const Vv = R.ver;
      if (k === "check1" && Vv && Vv.b) sub = M(Vv.b + "回のうち " + Vv.done.size + "回終わり・主張 " + Vv.n + "件", Vv.done.size + " of " + Vv.b + " rounds done, " + Vv.n + " statements", Vv.b + " 轮中已完成 " + Vv.done.size + " 轮・主张 " + Vv.n + " 条", Vv.done.size + " de " + Vv.b + " rondas, " + Vv.n + " afirmaciones");
      else if (k === "write") sub = M("全部のページの文章を、1回の返事でまとめて書いています", "the AI writes the text for all slides in one reply", "AI 一次性撰写全部页面的文案", "la IA escribe el texto de todas las diapositivas de una vez");
      else if (k === "build") sub = R.deckN ? M(R.deckN + "枚", R.deckN + " slides", R.deckN + " 页", R.deckN + " diapositivas") : M("写真を当てはめ、文字を枠に収めています", "placing photos and fitting the text", "正在放入照片并调整文字", "colocando fotos y ajustando el texto");
      else if (k === "story") sub = M("はじめて作るときだけ", "only the first time", "仅首次制作时", "solo la primera vez");
    } catch (e) { }
    let left = null; try { left = typeof W.v80docLeftMs === "function" ? W.v80docLeftMs(R) : null; } catch (e) { left = null; }
    const hi = (R.est && R.est.hi) || 0;
    let pct = left != null ? el / Math.max(1, el + left) : hi ? el / hi : null;
    if (pct != null) pct = Math.max(0.03, Math.min(0.97, pct));
    if (cur && cur.k === "final") pct = Math.max(pct || 0, 0.95);
    const T = R.T || null;
    const N = R.deckN || (R.est && R.est.N) || (T && T.deck3 && T.deck3.last && T.deck3.last.n) || 0;
    const over = !!(hi && el > hi);
    let aiN = 0; try { aiN = (typeof AIT !== "undefined" && AIT && AIT.items) ? AIT.items.length : 0; } catch (e) { }
    let lname = ""; try { lname = ((typeof DECK_L !== "undefined" && DECK_L[R.lang || DK3G.lang]) || {}).name || R.lang || DK3G.lang || ""; } catch (e) { }
    const learned = !!(R.est && (R.est.k === "hist" || R.est.k === "last"));
    return { R, n, idx, cur, sub, el, left, pct, N, built: !!R.deckN, over, aiN, lname, learned };
  }
  function leftTx(P) {
    if (P.left == null) return P.R.est && P.R.est.hi ? M("目安 約" + Math.round(P.R.est.hi / 60000) + "分", "about " + Math.round(P.R.est.hi / 60000) + " min in total", "参考约 " + Math.round(P.R.est.hi / 60000) + " 分钟", "unos " + Math.round(P.R.est.hi / 60000) + " min") : "";
    if (P.over) return M("目安を過ぎています（止まってはいません）", "taking longer than estimated (it has not stopped)", "已超过参考时间（并未停止）", "tarda más de lo previsto (no se ha detenido)");
    if (P.left < 60000) return M("あと1分以内", "under 1 min left", "剩余不到1分钟", "menos de 1 min");
    const m = Math.ceil(P.left / 60000);
    return M("あと約" + m + "分", "about " + m + " min left", "剩余约 " + m + " 分钟", "quedan unos " + m + " min");
  }
  function lines(P, page) {
    const step = M("全" + P.n + "段のうち " + P.idx + "段目", "step " + P.idx + " of " + P.n, "共 " + P.n + " 步中的第 " + P.idx + " 步", "paso " + P.idx + " de " + P.n);
    const now = P.cur ? stepNm(P.cur.k) + (P.sub ? M("（" + P.sub + "）", " (" + P.sub + ")", "（" + P.sub + "）", " (" + P.sub + ")") : "") : "";
    const tl = leftTx(P);
    const el = M("経過 " + clock(P.el), clock(P.el) + " elapsed", "已用 " + clock(P.el), clock(P.el) + " transcurrido");
    const src = P.learned ? M("この端末の実績から", "from recent runs on this device", "根据本设备的实绩", "según ejecuciones recientes") : "";
    const sl = P.N ? (P.built ? M(P.N + "枚", P.N + " slides", P.N + " 页", P.N + " diapositivas") : M("できあがり 約" + P.N + "枚の見込み", "about " + P.N + " slides expected", "预计约 " + P.N + " 页", "unas " + P.N + " diapositivas previstas")) : "";
    const ai = P.aiN > 1 ? M("AI に同時に " + P.aiN + "件頼んでいます（分けて速くしています）", P.aiN + " AI requests running at once (split to go faster)", "同时向 AI 发出 " + P.aiN + " 个请求（分开处理以加快速度）", P.aiN + " solicitudes a la IA a la vez (para ir más rápido)") : P.aiN === 1 ? M("AI の返事を待っています", "waiting for the AI reply", "正在等待 AI 回复", "esperando la respuesta de la IA") : "";
    const away = page ? M("ほかの画面に移っても作成は続きます。終わったら右下の表示でお知らせします（この画面に戻ると結果が見られます）", "You can move to other screens while it runs. The notice at the bottom right tells you when it is done (come back here to see the result)", "制作期间可以切换到其他页面。完成后右下角会通知您（回到此页面即可查看结果）", "Puede ir a otras pantallas mientras tanto. El aviso de abajo a la derecha le dirá cuando termine (vuelva aquí para ver el resultado)")
      : M("ほかの画面に移っても作成は続きます。終わったらここでお知らせします", "You can move to other screens; it keeps going and this notice tells you when it is done", "切换到其他页面也会继续制作，完成后会在这里通知您", "Puede ir a otras pantallas; sigue en marcha y este aviso le dirá cuando termine");
    return { step, now, tl, el, src, sl, ai, away };
  }
  function toastPaint() {
    try {
      const P = prog(); if (!P) return;
      if (typeof AIT === "undefined" || !AIT || AIT.hidden) return;
      const d = (typeof W.aiThinkEl === "function") ? W.aiThinkEl() : AIT.el; if (!d) return;
      clearTimeout(AIT.hideT);
      d.classList.remove("done", "v96dk-fin"); d.classList.add("on", "v96dk-deck", "v68tdet"); d.dataset.v90reg = "1";
      const L = lines(P);
      const t = $(".att", d), s = $(".ats", d), m = $(".atm", d);
      const set = (x, v) => { if (x && x.textContent !== v) x.textContent = v; if (x) x.setAttribute("data-noi18n", "1"); };
      set(t, "🤖 " + M("営業資料を作っています", "Making the sales deck", "正在制作营销资料", "Creando la presentación") + (P.lname ? M("（" + P.lname + "）", " (" + P.lname + ")", "（" + P.lname + "）", " (" + P.lname + ")") : ""));
      set(s, M("いま：", "Now: ", "当前：", "Ahora: ") + L.now + (L.ai ? M("・", " · ", "・", " · ") + L.ai : ""));
      set(m, [L.step + M("・", " · ", "・", " · ") + L.tl + M("（", " (", "（", " (") + L.el + (L.src ? M("・", ", ", "・", ", ") + L.src : "") + M("）", ")", "）", ")"), L.sl, L.away].filter(Boolean).join(M("／", " / ", "／", " / ")));
      const bar = $(".atbar", d), i = bar && $("i", bar);
      if (i && P.pct != null) i.style.width = Math.round(P.pct * 100) + "%";
      if (bar && P.pct != null) {
        bar.setAttribute("role", "progressbar"); bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", "100"); bar.setAttribute("aria-valuenow", String(Math.round(P.pct * 100)));
        bar.setAttribute("aria-valuetext", L.step + "・" + L.tl); bar.title = L.step + "・" + L.tl;
      }
    } catch (e) { err("toast", e); }
  }
  ["aiThinkPaint", "v90regToastPaint"].forEach((fn) => {
    try {
      if (typeof W[fn] !== "function") return;
      const f0 = W[fn];
      W[fn] = function () { const r = f0.apply(this, arguments); try { if (running()) toastPaint(); } catch (e) { } return r; };
      // 宣言された関数の名前（ほかの層が名前で呼ぶ）も包んだものにする
      try { if (fn === "aiThinkPaint") aiThinkPaint = W[fn]; else v90regToastPaint = W[fn]; } catch (e) { }
    } catch (e) { err("wrap." + fn, e); }
  });
  /* 資料の画面の進み具合の上に要約（全何段のうち何段目・棒・残り・ほかの画面に移れること） */
  function sumHtml() {
    const P = prog(); if (!P) return "";
    const L = lines(P, true);
    const pc = P.pct != null ? Math.round(P.pct * 100) : null;
    return `<div class="v96dk-psum" id="v96dk-psum" data-noi18n="1" role="status" aria-live="off"><div class="v96dk-pst"><b>${E(L.step)}</b>${pc != null ? `<span class="v96dk-ppc">${pc}%</span>` : ""}<span class="v96dk-ptl">${E(L.tl)}（${E(L.el)}${L.src ? "・" + E(L.src) : ""}）</span></div>` +
      `<div class="v96dk-pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc != null ? pc : 0}" aria-label="${E(L.step)}"><i class="v96dk-pbi" data-w="${pc != null ? pc : 3}"></i></div>` +
      `<div class="v96dk-pnow">${E(M("いま：", "Now: ", "当前：", "Ahora: ") + L.now)}${L.ai ? `<span class="v96dk-pai">${E(L.ai)}</span>` : ""}${L.sl ? `<span class="v96dk-psl">${E(L.sl)}</span>` : ""}</div>` +
      `<p class="v96dk-paway">${E(L.away)}</p></div>`;
  }
  function barW(root) { try { (root || document).querySelectorAll(".v96dk-pbi[data-w]").forEach(i => { i.style.width = Math.max(3, Math.min(100, +i.getAttribute("data-w") || 0)) + "%"; }); } catch (e) { } }
  if (typeof W.dk3ProgHtml === "function") {
    const ph0 = W.dk3ProgHtml;
    const wrapped = function () {
      let h = ph0.apply(this, arguments);
      try { if (running() && typeof h === "string" && h.indexOf("v96dk-psum") < 0) { h = sumHtml() + h; setTimeout(() => barW(), 0); } } catch (e) { err("prog", e); }
      return h;
    };
    W.dk3ProgHtml = wrapped;
    try { dk3ProgHtml = wrapped; } catch (e) { }
  }
  function tick() {
    try {
      if (!running()) return;
      toastPaint();
      const el = document.getElementById("v96dk-psum");
      if (el) {
        const w = document.createElement("div"); w.innerHTML = sumHtml(); const nb = w.firstElementChild; if (!nb) return;
        [".v96dk-pst", ".v96dk-pnow", ".v96dk-paway"].forEach(sel => { const a = el.querySelector(sel), b = nb.querySelector(sel); if (a && b && a.innerHTML !== b.innerHTML) a.innerHTML = b.innerHTML; });
        const ib = nb.querySelector(".v96dk-pbi"), ia = el.querySelector(".v96dk-pbi"), ba = el.querySelector(".v96dk-pbar"), bb = nb.querySelector(".v96dk-pbar");
        if (ia && ib) { ia.setAttribute("data-w", ib.getAttribute("data-w")); barW(el); }
        if (ba && bb) ba.setAttribute("aria-valuenow", bb.getAttribute("aria-valuenow") || "0");
      }
    } catch (e) { err("tick", e); }
  }
  setInterval(tick, 1000);

  /* 終わったときの知らせ：資料の画面にいない・タブを離れているときは長めに出し、「資料を開く」を付ける */
  let title0 = "";
  function titleBack() { try { if (title0 && !document.hidden) { document.title = title0; title0 = ""; } } catch (e) { } }
  document.addEventListener("visibilitychange", titleBack);
  W.v96dkGenDone = function (G) {
    try {
      const d = (typeof AIT !== "undefined" && AIT && AIT.el) || null;
      if (d) d.classList.remove("v96dk-deck");
      const onDeck = typeof cur !== "undefined" && cur === "deck";
      const okRes = !G.err && G.n > 0;
      if (!G.ran || (!okRes && !G.err)) return;
      const lname = (() => { try { return ((typeof DECK_L !== "undefined" && DECK_L[G.lang]) || {}).name || G.lang; } catch (e) { return G.lang; } })();
      const msg = okRes ? M("営業資料ができました（" + lname + "・" + G.n + "枚）", "The sales deck is ready (" + lname + ", " + G.n + " slides)", "营销资料已完成（" + lname + "・" + G.n + " 页）", "La presentación está lista (" + lname + ", " + G.n + " diapositivas)")
        : M("営業資料を作れませんでした", "The sales deck could not be made", "未能制作营销资料", "No se pudo crear la presentación");
      if (document.hidden) { try { if (!title0) title0 = document.title; document.title = (okRes ? "✅ " : "⚠ ") + msg; } catch (e) { } }
      if (G.aside) { // 作成中にほかの商品に移った：その商品の資料として控えてある（開き方は前の層の案内）
        if (typeof W.toast === "function") W.toast(msg + M("：「" + G.item + "」の資料です。その商品に切り替えると「外国語 営業資料」の画面で見られます", ": the deck for “" + G.item + "”. Switch to that product to see it on the deck screen", "：“" + G.item + "”的资料。切换到该商品即可查看", ": la presentación de «" + G.item + "». Cambie a ese producto para verla"));
        return;
      }
      if (onDeck && !document.hidden) return;
      if (d && d.classList.contains("on") && !(AIT.items && AIT.items.length)) {
        let b = $(".v96dk-open", d);
        if (!b) {
          b = document.createElement("button"); b.type = "button"; b.className = "btn v96dk-open"; b.setAttribute("data-noi18n", "1");
          b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); try { if (typeof W.go === "function") W.go("deck"); } catch (x) { } try { d.classList.remove("on", "done", "v96dk-fin"); AIT.hidden = 0; b.remove(); } catch (x) { } });
          const body = $(".atbody", d); if (body) body.appendChild(b);
        }
        b.textContent = M("資料を開く", "Open the deck", "打开资料", "Abrir la presentación");
        d.classList.add("v96dk-fin");
        clearTimeout(AIT.hideT);
        AIT.hideT = setTimeout(() => { try { d.classList.remove("on", "done", "v96dk-fin"); AIT.hidden = 0; if (b) b.remove(); } catch (e) { } }, 60000);
      } else if (typeof W.toast === "function") W.toast(msg + M("。「外国語 営業資料」の画面で見られます", ". See it on the “Foreign-language sales deck” screen", "。可在“外语营销资料”页面查看", ". Véala en la pantalla «Presentación en otro idioma»"));
    } catch (e) { err("gendone", e); }
  };
  /* 次の作成が始まったら、前回の「資料を開く」は外す */
  setInterval(() => { try { const d = document.getElementById("aiThink"); if (!d) return; if (running() || !d.classList.contains("on")) { const b = d.querySelector(".v96dk-open"); if (b) b.remove(); d.classList.remove("v96dk-fin"); } } catch (e) { } }, 1500);

  /* 刷新版の「情報の入力状況」の写真の行から、上の箱へ飛べるようにする */
  function jump() {
    try {
      const RD = W.RDX; if (!RD || !RD.curKey || RD.curKey() !== "deck") return;
      const box = document.querySelector("[data-v96dkjpbox]");
      document.querySelectorAll(".rd-p2 .k-it").forEach((row) => {
        const b = row.querySelector("b");
        if (!b || !/^納品品質の写真/.test((b.textContent || "").trim())) return;
        const has = row.querySelector(".v96dk-jump");
        if (!box) { if (has) has.remove(); return; }
        if (has) return;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "v96dk-jump"; btn.textContent = M("文字入りの写真を選ぶ", "Choose photos with text", "选择含文字的照片", "Elegir fotos con texto");
        btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const x = document.querySelector("[data-v96dkjpbox]"); if (!x) return; try { x.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (er) { x.scrollIntoView(); } x.classList.remove("k-r5c-pulse"); void x.offsetWidth; x.classList.add("k-r5c-pulse"); setTimeout(() => x.classList.remove("k-r5c-pulse"), 3200); });
        const v95 = row.querySelector(".v95dk-jump"); (v95 || b).after(btn);
      });
    } catch (e) { err("jump", e); }
  }
  try { const RD = W.RDX; if (RD && typeof RD.after === "function") { const a0 = RD.after; RD.after = function () { const r = a0.apply(this, arguments); jump(); return r; }; } } catch (e) { }
  let jt = 0;
  document.addEventListener("click", () => { clearTimeout(jt); jt = setTimeout(jump, 900); }, true);
})();
