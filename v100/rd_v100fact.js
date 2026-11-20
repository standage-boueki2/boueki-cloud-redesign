/* 22.00.1 分野 fact（画面）：N1 数字の照合で外した文言を、利用者が「戻す（資料に載せる）」で戻せる道
   21.56 の層は、数字・効能・最上級の照合で外した文言に「（…照合で外したため、戻せません）」と出すだけで、
   入力にある数字（BFE99%・3歳以上）が外されたときに行き止まりだった。
   押すと確かめの窓 →「利用者が資料に載せると判断した文言」として AI に教えた事実（aiMem.taught）と TEN.v100allow に理由・日時を残し、
   根拠に入れて資料を作り直す（数字の照合はこの事実を根拠として読む）。効能・最上級・期限切れの証明書の文言はいままでどおり戻せない。 */
(function () {
  "use strict";
  var V = window.V100FACT = window.V100FACT || {};
  if (V.__rdLoaded) return;
  V.__rdLoaded = 1;
  function err(w, e) { try { V.err = "rd " + w + ": " + String((e && e.message) || e).slice(0, 160); (V.errs = V.errs || []).push(V.err); } catch (x) { /* 無視 */ } }
  function lang() { try { if (typeof v97dkLang === "function") return v97dkLang(); } catch (e) { /* 無視 */ } return "ja"; }
  var TX = {
    btn: { ja: "戻す（資料に載せる）", en: "Restore (put back in the deck)", zh: "恢复（放回资料）", es: "Restaurar (volver a incluir)" },
    ask: { ja: "「$1」を資料に載せて、作り直します。\n\nこの数字は、登録の情報と照らして根拠が見つからなかったため外していました。試験の成績書・資料などで正しいことをご自身で確かめてから載せてください。\n（「利用者が確かめて資料に載せた文言」として、日時と一緒に記録します）\n\n載せますか？",
      en: "Put “$1” back in the deck and rebuild it.\n\nThis figure was removed because no matching evidence was found in the registered information. Please confirm it yourself with test reports or other documents before including it.\n(It will be recorded with the date as “confirmed and restored by the user”.)\n\nInclude it?",
      zh: "将“$1”放回资料并重新生成。\n\n该数字在登记信息中找不到依据，因此已删除。请先用检测报告等资料自行确认无误后再放入。\n（将作为“用户确认后放回的文字”连同日期一起记录）\n\n要放入吗？",
      es: "Volver a incluir «$1» en la presentación y regenerarla.\n\nEsta cifra se eliminó porque no se encontró respaldo en la información registrada. Compruébela usted mismo con informes de ensayo u otros documentos antes de incluirla.\n(Se registrará con la fecha como «confirmado y restaurado por el usuario».)\n\n¿Incluirla?" },
    done: { ja: "「$1」を資料に載せて作り直します（記録しました）", en: "Rebuilding with “$1” included (recorded)", zh: "将放入“$1”并重新生成（已记录）", es: "Regenerando con «$1» incluido (registrado)" }
  };
  function t(k, a) { var L = lang(), x = TX[k]; var s = (x && (x[L] || x.ja)) || ""; return s.replace("$1", String(a || "").slice(0, 60)); }
  function restore(txt, why) {
    try {
      var T = (typeof DK3G !== "undefined" && DK3G && DK3G.ten) || (typeof TEN !== "undefined" ? TEN : null);
      if (!T || (typeof DK3G !== "undefined" && DK3G.run)) return false;
      if (!window.confirm(t("ask", txt))) return false;
      var at = new Date().toISOString();
      T.aiMem = T.aiMem || {};
      T.aiMem.taught = (Array.isArray(T.aiMem.taught) ? T.aiMem.taught : []).concat([{ txt: "資料に載せてよい（利用者が確かめた）：" + txt, at: at, v100: 1 }]);
      T.v100allow = (Array.isArray(T.v100allow) ? T.v100allow : []).concat([{ txt: txt, why: why || "", at: at }]);
      try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ }
      try { if (typeof toast === "function") toast(t("done", txt)); } catch (e) { /* 無視 */ }
      var lg = (typeof DK3G !== "undefined" && DK3G && DK3G.deck && DK3G.deck.lang) || (DK3G && DK3G.lang) || "en";
      try { if (typeof dk3FreeUrls === "function" && DK3G.deck) dk3FreeUrls(DK3G.deck); } catch (e) { /* 無視 */ }
      DK3G.deck = null; DK3G.check = null;
      if (typeof dk3Generate === "function") dk3Generate(lg, true);
      (V.n = V.n || {}).restore = ((V.n || {}).restore || 0) + 1;
      return true;
    } catch (e) { err("restore", e); return false; }
  }
  V.restore = restore;
  function bindRestore() {
    try {
      var G = (typeof DK3G !== "undefined") ? DK3G : null;
      var ck = G && G.check;
      if (!ck || !G.deck || G.run) return;
      var ws = (ck.warn || []).filter(function (w) { return w && w.k === "drop" && /^根拠に無い数字/.test(String(w.v56deckWhy || "")) && w.v56deckTxt; });
      if (!ws.length) return;
      var spans = [].slice.call(document.querySelectorAll(".v56deck-nou"));
      spans.forEach(function (sp) {
        if (sp.getAttribute("data-v100done")) return;
        var host = sp.parentElement; if (!host) return;
        var ht = host.textContent || "";
        var w = ws.filter(function (x) { return ht.indexOf(String(x.v56deckTxt).slice(0, 24)) >= 0; })[0];
        if (!w) return;
        sp.setAttribute("data-v100done", "1");
        sp.style.display = "none";
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn g v100fact-restore";
        b.style.cssText = "margin-left:8px;padding:1px 10px;font-size:12px";
        b.textContent = t("btn");
        b.setAttribute("data-noi18n", "1");
        b.addEventListener("click", function (ev) { ev.preventDefault(); restore(String(w.v56deckTxt), String(w.v56deckWhy || "")); });
        sp.parentNode.insertBefore(b, sp.nextSibling);
      });
    } catch (e) { err("bind", e); }
  }
  V.bindRestore = bindRestore;
  if (typeof deckBind === "function") {
    var oDB = deckBind;
    deckBind = function () { var r = oDB.apply(this, arguments); try { bindRestore(); } catch (e) { err("db", e); } return r; }; // eslint-disable-line no-global-assign
  }
})();
