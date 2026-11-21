/* 22.01 fact：刷新版の層（見せ方）。中身は logic_v2201fact.js（window.V101FACT・window.v101origin）
   No.616 営業資料の画面の「営業資料の表紙（見本）」：原産地が未登録（ヒアリングで「わからない」）の商品で、
          見出しの帯の「JAPAN」・区分の札（無いときの「MADE IN JAPAN」）・下の帯の「Made in Japan」が、読み上げで「JAPAN PARTS」「Made in Japan」と
          原産地の断定に読めていた。原産地が未登録なら「JAPAN」を出さず、下の帯は「Origin: to be confirmed」にする（登録すると元に戻る）。
   No.618 同じ見本の強み（✓）のうち、「不明」と答えた事柄に当たるもの（主要メーカー対応 など）に「（要確認）」を付ける（資料には断定で載せない）。
   札は画面を描くたびに作り直されるため、この層は描いた後に直すだけ（何度通っても同じ結果）。インラインの onclick・style は使わない（CSP）。 */
(function () {
  "use strict";
  if (window.__v101factRd) return;
  window.__v101factRd = 1;
  const V = () => window.V101FACT || null;
  const warn = (k, e) => { try { const v = V(); if (v) { v.err = "rd " + k + ": " + String((e && e.message) || e).slice(0, 160); v.errs.push(v.err); } } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const lang = () => { try { return (typeof I18N !== "undefined" && I18N && I18N.lang) || (localStorage.getItem("bc20_lang") || "ja"); } catch (e) { return "ja"; } }; // eslint-disable-line no-undef
  const TBC_JA = { ja: "（要確認）", en: " (to be confirmed)", zh: "（待确认）", es: " (por confirmar)" };
  function fixCover() {
    try {
      const v = V(); const T = ten();
      if (!v || !T || typeof window.v101origin !== "function") return;
      const cov = document.querySelectorAll(".k-cover");
      if (!cov.length) return;
      const O = window.v101origin(T);
      const L = (v.unkTopics(T) || []).filter((x) => !x.origin && x.ja2);
      const l = String(lang()).slice(0, 2);
      cov.forEach((c) => {
        const sp = c.querySelector(".k-cvh span");
        if (sp) {
          if (!O.known && /^JAPAN$/i.test((sp.textContent || "").trim())) { sp.textContent = ""; sp.setAttribute("data-v101org", "JAPAN"); sp.setAttribute("aria-hidden", "true"); v.n.rdHead = (v.n.rdHead || 0) + 1; }
          else if (O.known && sp.getAttribute("data-v101org") && !(sp.textContent || "").trim()) { sp.textContent = sp.getAttribute("data-v101org"); sp.removeAttribute("data-v101org"); sp.removeAttribute("aria-hidden"); }
        }
        const sm = c.querySelector(".k-cvb small");
        if (sm && !O.known && /^MADE IN JAPAN$/i.test((sm.textContent || "").trim())) { sm.textContent = "PRODUCT"; sm.setAttribute("data-v101org", "1"); }
        c.querySelectorAll(".k-cvf span").forEach((s) => {
          const t = (s.textContent || "").trim();
          if (!O.known && /^Made in Japan$/i.test(t)) { s.textContent = "Origin: to be confirmed"; s.setAttribute("data-v101org", t); v.n.rdFoot = (v.n.rdFoot || 0) + 1; }
          else if (O.known && s.getAttribute("data-v101org") && /^Origin: to be confirmed$/.test(t)) { s.textContent = s.getAttribute("data-v101org"); s.removeAttribute("data-v101org"); }
        });
        c.querySelectorAll(".k-cvb li").forEach((li) => {
          const t = (li.textContent || "").trim();
          if (/要確認|to be confirmed|待确认|por confirmar/.test(t)) return;
          const hitO = !O.known && /日本製|国産|国内(?:で)?(?:生産|製造)|made in japan/i.test(t);
          const hit = hitO || L.some((x) => x.ja2.test(t));
          if (hit) { li.textContent = t + (TBC_JA[l] || TBC_JA.ja); li.setAttribute("data-v101tbc", "1"); v.n.rdStr = (v.n.rdStr || 0) + 1; }
        });
      });
    } catch (e) { warn("cover", e); }
  }
  if (V()) V().fixCover = fixCover;
  let tm = 0;
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(fixCover, 70); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { warn("mo", e); }
  try { if (window.RDX && typeof RDX.after === "function") { const prev = RDX.after; RDX.after = function () { const r = prev.apply(this, arguments); try { fixCover(); } catch (e) { warn("after", e); } return r; }; } } catch (e) { warn("afterwrap", e); } // eslint-disable-line no-undef
})();
