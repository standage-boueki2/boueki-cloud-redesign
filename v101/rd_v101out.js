/* v22.01 out（見せ方の層）：logic_v2201out.js のあとに読む
   No.552 の残り：加工した写真が資料に入っていないときの知らせと「加工した写真で作り直す（文章はそのまま）」ボタン／作り直した後の知らせ
   納品版の不足の案内：完成版に足りない項目の一覧のすぐ横に「足りない N 項目をここで入れる」（1回で入れる画面へ）・下書きを作った後の
     最終チェックの下にも同じ案内とボタン・「情報の入力状況」の「入力する」ボタンに項目の名前（読み上げで、どの項目のボタンか分かる）
   onclick= と style= の属性は書かない（addEventListener と class だけ）。外から来た文字は E でエスケープ */
(function () {
  "use strict";
  const W = window;
  const V = W.V101OUT;
  if (!V || V._rd) return;
  V._rd = 1;
  const err = (k, e) => { try { V.errf("rd." + k, e); } catch (x) { /* 記録だけ */ } };
  const M = V.M, E = V.E;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };

  /* ═══ No.552：資料の画面の知らせ ═══ */
  function editBox() {
    try {
      const g = V.G(), T = V.ten();
      if (!g || !g.deck || g.run || !T || !g.ten || V.pkey(g.ten) !== V.pkey(T) || /^ja/.test(String(g.deck.lang || ""))) return "";
      const P = V.pendingEdits(T, g.deck);
      const at = V.deckAt(g.deck);
      const nm = (i) => M("商品写真" + (i + 1), "Photo " + (i + 1), "商品照片" + (i + 1), "Foto " + (i + 1));
      if (P.length) {
        const names = P.map((x) => nm(x.i) + M("（" + V.hhmm(x.at) + " に加工）", " (edited " + V.hhmm(x.at) + ")", "（" + V.hhmm(x.at) + " 编辑）", " (editada " + V.hhmm(x.at) + ")")).join(M("・", ", ", "、", ", "));
        const lb = M("✂ 加工した写真で作り直す（文章はそのまま）", "✂ Rebuild with the edited photo (same text)", "✂ 用编辑后的照片重新制作（文字不变）", "✂ Rehacer con la foto editada (mismo texto)");
        return `<div class="c v101out-ed" id="v101outEd" role="status" data-noi18n="1"><h3>${E(M("✂ 加工した写真は、まだこの資料に入っていません", "✂ The edited photo is not in this deck yet", "✂ 编辑后的照片还没有放入这份资料", "✂ La foto editada aún no está en esta presentación"))}</h3>` +
          `<p class="v101out-p">${E(M(`${names} は、いま開いている資料（${V.hhmm(at)} に作成）より後に加工しました。この資料と「保存した営業資料」の保存済みの版は、加工の前の写真のままです。資料に入れるには、下のボタンを押してください（文章は書き直さず、前回の文章のまま写真だけ入れ直して組み立て直します。新しい版として保存されます）。`,
            `${names} was edited after this deck was made (${V.hhmm(at)}). This deck and the saved versions in “Saved sales decks” still use the photo before editing. Press the button below to put it in (the text is not rewritten; the deck is rebuilt with the same text and saved as a new version).`,
            `${names} 是在当前资料（${V.hhmm(at)} 制作）之后编辑的。这份资料和“已保存的营业资料”中的版本仍是编辑前的照片。请按下面的按钮放入（不重写文字，只重新放入照片并重新组合，作为新版本保存）。`,
            `${names} se editó después de crear esta presentación (${V.hhmm(at)}). Esta presentación y las versiones guardadas siguen con la foto anterior. Pulse el botón para incluirla (no se reescribe el texto; se guarda como versión nueva).`))}</p>` +
          `<div class="rw v101out-row"><button type="button" class="btn" data-v101out="regen" aria-label="${E(lb)}">${E(lb)}</button></div></div>`;
      }
      const Dn = V.doneEdits(T, g.deck).filter((x) => x.inDeck !== false);
      if (Dn.length && V.regenAt && at >= V.regenAt) {
        return `<div class="c v101out-ed ok" id="v101outEd" role="status" data-noi18n="1"><p class="v101out-p">${E(M(`✓ 加工した写真（${Dn.map((x) => nm(x.i)).join("・")}）を入れて作り直しました（${V.hhmm(at)}）。「保存した営業資料」にもこの時刻の版が入ります。`,
          `✓ Rebuilt with the edited photo (${Dn.map((x) => nm(x.i)).join(", ")}) at ${V.hhmm(at)}. “Saved sales decks” gets this version too.`,
          `✓ 已放入编辑后的照片（${Dn.map((x) => nm(x.i)).join("、")}）重新制作（${V.hhmm(at)}）。“已保存的营业资料”中也会有这个版本。`,
          `✓ Rehecha con la foto editada (${Dn.map((x) => nm(x.i)).join(", ")}) a las ${V.hhmm(at)}.`))}</p></div>`;
      }
    } catch (e) { err("editBox", e); }
    return "";
  }
  V.editBox = editBox;

  /* ═══ 納品版の不足の案内 ═══ */
  const gate = () => { try { return (typeof W.dk3Gate === "function" ? (W.dk3Gate() || []) : []).filter((c) => c && c.req && !c.ok); } catch (e) { return []; } };
  const goLb = (n) => M(`足りない ${n} 項目をここで入れる`, `Fill in the ${n} missing item(s) here`, `在这里填写缺少的 ${n} 项`, `Completar aquí los ${n} datos que faltan`);
  function gateBox() {
    try {
      const g = V.G();
      if (!g || !g.deck || g.run || !g.check || g.check.pass) return "";
      const miss = gate(); if (!miss.length) return "";
      const isDraft = (g.check.crit || []).some((c) => c && /draft/i.test(String(c.k || "")));
      if (!isDraft) return "";
      const lb = goLb(miss.length);
      return `<div class="c v101out-gate" id="v101outGate" role="region" aria-label="${E(M("納品版にするには", "To make the final version", "制作交付版", "Para la versión final"))}" data-noi18n="1"><h3>${E(M(`📝 いまは下書きです。納品版（バイヤーに渡せる版）にするには、あと ${miss.length} 項目`, `📝 This is a draft. ${miss.length} more item(s) for the final version (to give to buyers)`, `📝 目前是草稿。要制作交付版（可交给买家），还差 ${miss.length} 项`, `📝 Es un borrador. Faltan ${miss.length} dato(s) para la versión final`))}</h3>` +
        `<ul class="v101out-gl">${miss.map((c) => `<li><b>${E(c.n)}</b><span class="nn">${E(c.how || "")}</span><button type="button" class="btn g" data-v101out="fix" data-k="${E(c.k)}" aria-label="${E(M(c.n + "を入れる", "Enter: " + c.n, "填写：" + c.n, "Completar: " + c.n))}">${E(M("ここで入れる", "Enter here", "在此填写", "Completar aquí"))}</button></li>`).join("")}</ul>` +
        `<p class="v101out-p">${E(M("会社の情報（会社概要・沿革・理念）・連絡先・写真は、AI が作らずに、あなたが入れた事実だけを使います。入れたら「↻ もう一度作る」で納品版になります。", "Company facts (profile, history, mission), contact and photos are never made up by the AI; only what you enter is used. After entering them, press “↻ Make it again” for the final version.", "公司信息（概况・沿革・理念）、联系方式和照片不会由 AI 编造，只使用您填写的事实。填写后点击“↻ 重新制作”即可生成交付版。", "La IA no inventa los datos de la empresa, el contacto ni las fotos; solo usa lo que usted introduce. Después pulse «↻ Crear de nuevo»."))}</p>` +
        `<div class="rw v101out-row"><button type="button" class="btn" data-v101out="fix" data-k="${E(miss[0].k)}" aria-label="${E(lb)}">${E(lb)}</button></div></div>`;
    } catch (e) { err("gateBox", e); }
    return "";
  }
  V.gateBox = gateBox;

  if (typeof W.vDeck === "function" && !W.vDeck.v101out) {
    const __vd101 = W.vDeck;
    const f = function () {
      let h = __vd101.apply(this, arguments);
      try {
        h = String(h);
        const add = (h.indexOf('id="v101outEd"') < 0 ? editBox() : "") + (h.indexOf('id="v101outGate"') < 0 ? gateBox() : "");
        if (add) {
          const k = h.indexOf('<div class="dk3-dl">');
          h = k >= 0 ? h.slice(0, k) + add + h.slice(k) : h + add;
          cnt("vdeckAdd");
        }
      } catch (e) { err("vdeck", e); }
      return h;
    };
    f.v101out = 1;
    W.vDeck = f;
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v101out]");
      if (!b) return;
      const a = b.getAttribute("data-v101out");
      ev.preventDefault();
      if (a === "regen") {
        if (V.regenPhoto()) { b.disabled = true; b.textContent = M("作り直しています…（文章はそのまま）", "Rebuilding… (same text)", "正在重新制作…（文字不变）", "Rehaciendo… (mismo texto)"); }
      } else if (a === "fix" || a === "fixAll") {
        const k = b.getAttribute("data-k") || ((gate()[0] || {}).k) || "";
        if (typeof W.dk3FixGo === "function") W.dk3FixGo(k);
        else if (typeof W.deckWizard === "function") W.deckWizard({ focus: k });
        cnt("gateGo");
      }
    } catch (e) { err("click", e); }
  }, true);

  /* 完成版の一覧（「完成版（バイヤーに渡せる版）：あと N 項目：…」）のすぐ後に、1回で入れる画面へのボタン／「入力する」に項目の名前 */
  function fixCandoBtn() {
    try {
      document.querySelectorAll(".k-v90cando").forEach((sp) => {
        const ng = sp.querySelector("b.ng"); if (!ng) return;
        const miss = gate();
        const old = sp.parentNode && sp.parentNode.querySelector(".v101out-cgo");
        if (!miss.length) { if (old) old.remove(); return; }
        const lb = goLb(miss.length);
        if (old) { if (old.getAttribute("data-n") !== String(miss.length)) { old.setAttribute("data-n", String(miss.length)); old.setAttribute("data-k", miss[0].k); old.textContent = lb; old.setAttribute("aria-label", lb); } return; }
        const bt = document.createElement("button");
        bt.type = "button"; bt.className = "btn g v101out-cgo"; bt.setAttribute("data-v101out", "fix"); bt.setAttribute("data-k", miss[0].k); bt.setAttribute("data-n", String(miss.length));
        bt.textContent = lb; bt.setAttribute("aria-label", lb);
        sp.insertAdjacentElement("afterend", bt);
        cnt("candoBtn");
      });
    } catch (e) { err("cando", e); }
  }
  function fixFillLabels() {
    try {
      const re = /^(入力する|アップロードする)\s*›?$|^(Enter|Upload)\s*›?$|^(填写|上传)\s*›?$|^(Completar|Subir)\s*›?$/;
      document.querySelectorAll("#well button, #well [role='button']").forEach((b) => {
        if (b.getAttribute("data-v101lb")) return;
        const t = (b.textContent || "").replace(/\s+/g, " ").trim();
        if (!re.test(t)) return;
        let r = b.parentElement, nm = "";
        for (let i = 0; i < 4 && r && !nm; i++) { const x = r.querySelector("b, strong, .k-itn, p.lbl"); if (x && x !== b && !x.contains(b)) nm = (x.textContent || "").replace(/\s+/g, " ").trim(); r = r.parentElement; }
        if (!nm || nm.length > 60) return;
        b.setAttribute("aria-label", nm + M("：", ": ", "：", ": ") + t.replace(/\s*›$/, ""));
        b.setAttribute("data-v101lb", "1");
        cnt("fillLb");
      });
    } catch (e) { err("fillLb", e); }
  }
  V.fixCandoBtn = fixCandoBtn; V.fixFillLabels = fixFillLabels;
  let tm = 0;
  const run = () => { fixCandoBtn(); fixFillLabels(); };
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(run, 80); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { err("mo", e); }
  try { if (W.RDX && typeof W.RDX.after === "function" && !W.RDX.after.v101out) { const prev = W.RDX.after; const f = function () { const r = prev.apply(this, arguments); try { run(); } catch (e) { err("after", e); } return r; }; f.v101out = 1; W.RDX.after = f; } } catch (e) { err("afterwrap", e); }
})();
