/* 刷新版：デモ用アカウントの上の帯（#v57demobar）を最小化できるようにする（rd_v101dmin.css と対）
   2026-11-22 大森さん「デモをするときに、この帯が邪魔。最小化できるようにしてください」
   ・帯の右上の「最小化」で、1行の細い帯（「デモ用アカウント（この PC での変更は保存されません）」＋「ひらく」）にたたむ
   ・たたんだかどうかは、この PC で覚える（localStorage rd_dmin。読み込み直し・ログアウトしてもそのまま）
   ・初期状態の編集中（STANDAGE の管理者・オレンジの帯）は、大事な注意なのでたたまない（ボタンも出さない）
   ・帯の文・ボタンは変えない。本体の v57demobar は描き直しで class と中身を入れ替えるので、そのあとにボタンと札を足し直すだけ
   ・ほかの層との取り決め：このファイルは #v57demobar の中の .k-dminbtn・.k-dminlab と、帯の class k-dmin・k-dmok だけを触る */
(function () {
  "use strict";
  if (window.RD_DMIN) return;
  const KEY = "rd_dmin";
  const S = (window.RD_DMIN = { min: false, n: 0 });
  try { S.min = localStorage.getItem(KEY) === "1"; } catch (e) { /* 使えないときは、この画面のあいだだけ覚える */ }
  const save = () => { try { if (S.min) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) { /* 無視 */ } };
  const LANGS = ["ja", "en", "zh", "es"];
  const lang = () => { try { const l = typeof I18N !== "undefined" && I18N && I18N.lang; return LANGS.indexOf(l) > 0 ? l : "ja"; } catch (e) { return "ja"; } };
  const TX = {
    min: ["最小化", "Minimize", "最小化", "Minimizar"],
    minT: ["この帯を1行にたたみます（この PC で覚えます）", "Fold this bar into one line (remembered on this PC)", "将此栏收起为一行（在本电脑上记住）", "Reducir esta barra a una línea (se recuerda en este PC)"],
    open: ["ひらく", "Show", "展开", "Mostrar"],
    openT: ["デモ用アカウントの説明をすべて表示します", "Show the full demo account notice", "显示演示账户的全部说明", "Mostrar el aviso completo de la cuenta de demostración"],
    lab: ["デモ用アカウント", "Demo account", "演示账户", "Cuenta de demostración"],
    sub: ["（この PC での変更は保存されません）", " (changes on this PC are not saved)", "（本电脑上的更改不会保存）", " (los cambios en este PC no se guardan)"]
  };
  const t = (k) => TX[k][LANGS.indexOf(lang())] || TX[k][0];
  const ICON_UP = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 7.5 6 4l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_DN = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function toggle(ev) {
    try { if (ev) { ev.preventDefault(); ev.stopPropagation(); } } catch (e) { /* 無視 */ }
    set(!S.min);
    try { const btn = document.querySelector("#v57demobar > .k-dminbtn"); if (btn) btn.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }
  function set(v) { S.min = !!v; S.n++; save(); paint(); }
  S.set = set;

  function paint() {
    const b = document.getElementById("v57demobar");
    if (!b) return;
    try {
      hookBar(b);
      let btn = b.querySelector(":scope > .k-dminbtn");
      let lab = b.querySelector(":scope > .k-dminlab");
      if (b.classList.contains("edit")) {
        if (btn) btn.remove();
        if (lab) lab.remove();
        if (b.classList.contains("k-dmin")) b.classList.remove("k-dmin");
        if (b.classList.contains("k-dmok")) b.classList.remove("k-dmok");
        return;
      }
      if (!lab) { lab = document.createElement("span"); lab.className = "k-dminlab"; lab.setAttribute("data-noi18n", ""); b.insertBefore(lab, b.firstChild); }
      if (!btn) { btn = document.createElement("button"); btn.type = "button"; btn.className = "k-dminbtn"; btn.setAttribute("data-noi18n", ""); btn.addEventListener("click", toggle); b.appendChild(btn); }
      const sig = lang() + (S.min ? "1" : "0");
      if (btn.dataset.sig !== sig) {
        btn.dataset.sig = sig;
        btn.innerHTML = (S.min ? ICON_DN : ICON_UP) + "<span></span>";
        btn.lastChild.textContent = S.min ? t("open") : t("min");
        btn.title = S.min ? t("openT") : t("minT");
        btn.setAttribute("aria-expanded", S.min ? "false" : "true");
      }
      if (lab.dataset.l !== lang()) {
        lab.dataset.l = lang();
        lab.textContent = "";
        const bb = document.createElement("b"); bb.textContent = t("lab");
        const sm = document.createElement("span"); sm.textContent = t("sub");
        lab.append(bb, sm);
      }
      if (b.classList.contains("k-dmin") !== S.min) b.classList.toggle("k-dmin", S.min);
      if (!b.classList.contains("k-dmok")) b.classList.add("k-dmok");
    } catch (e) { /* 無視（帯はそのまま） */ }
  }
  S.paint = paint;

  /* 本体が帯を描き直す（class を入れ替え・中身を innerHTML で置き換え）と、ボタンと札が消える → 画面に出る前に足し直す */
  const moBar = new MutationObserver(() => { paint(); try { moBar.takeRecords(); } catch (e) { /* 無視 */ } });
  function hookBar(b) {
    if (b.__rdDmin) return;
    b.__rdDmin = 1;
    moBar.observe(b, { childList: true, attributes: true, attributeFilter: ["class"] });
  }
  /* 帯は .main の先頭に入る（ログインのたびに作り直す）→ .main の子の出入りを見張る */
  let mainEl = null;
  const moMain = new MutationObserver(() => { const b = document.getElementById("v57demobar"); if (b && (!b.__rdDmin || !b.querySelector(":scope > .k-dminbtn"))) paint(); });
  function hookMain() {
    const m = document.querySelector(".main");
    if (m && m !== mainEl) { try { moMain.disconnect(); } catch (e) { /* 無視 */ } mainEl = m; moMain.observe(m, { childList: true }); }
  }
  hookMain();
  paint();
  setInterval(() => { try { hookMain(); paint(); } catch (e) { /* 無視 */ } }, 800);
  /* 同じ PC のほかのタブでたたんだ・ひらいたとき */
  window.addEventListener("storage", (e) => { try { if (e.key === KEY) { S.min = e.newValue === "1"; paint(); } } catch (x) { /* 無視 */ } });
})();
