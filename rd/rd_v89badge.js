/* 21.89 No.379（2026-11-13 週次レビュー）：「刷新版（社内確認用…）」の札を、画面の下に固定で浮かせず、上の帯（.bar）のすぐ下に細い帯として置く。
   前は position:fixed で左下に浮いていたため、どのスクロール位置でも下の本文（管理者の「契約満了が近いアカウント」の説明・
   「APIコスト分析」の見出しなど）を覆っていた。下に余白を足しても、途中までスクロールしたときの重なりは消えない。
   本文の流れの中に置けば重ならない（上の帯の中に入れると、狭い幅で検索欄を押しつぶし右で切れるので、帯の下にした）。
   「今の版を開く」のリンクも残す。上の帯が無い画面（ログイン）は今まで通り。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v89badge) return;
  RD._v89badge = 1;
  function place() {
    const bd = document.getElementById("rdbadge");
    if (!bd) return;
    const bar = document.querySelector(".bar");
    const barOk = bar && bar.offsetParent !== null && bar.getBoundingClientRect().height > 0;
    if (barOk) {
      if (bar.nextElementSibling !== bd) bar.after(bd);
      bd.classList.add("k-instrip");
    } else if (bd.parentNode !== document.body) {
      document.body.appendChild(bd);
      bd.classList.remove("k-instrip");
    }
  }
  let n = 0;
  const iv = setInterval(() => { n++; try { place(); } catch (e) { /* 無視 */ } if (n > 120) clearInterval(iv); }, 500);
  try { new MutationObserver(() => { try { place(); } catch (e) { /* 無視 */ } }).observe(document.body, { childList: true }); } catch (e) { /* 無視 */ }
  window.addEventListener("resize", () => { try { place(); } catch (e) { /* 無視 */ } });
  RD.v89badgePlace = place;
})();
