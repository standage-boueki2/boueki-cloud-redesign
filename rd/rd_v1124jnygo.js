/* 2026-11-24 直し：貿易ジャーニーの現在地バーで、ステップを押しても画面が移らないことがある（大森さんの報告：STEP 01「商品を整える」を押しても「商品」の画面へ移らない）
   原因：rd_v94jny.js の押したときの処理は「足りない最初の項目の行き先（go）」へ移り、足りない項目が無い（100%）ときは「最初の項目の行き先」へ移る。
         ところが STEP 01 の項目のうち、できている項目（scoreOf の filled）には行き先が付いていない（足りない項目にだけ { k:"item" } が付く）。
         そのため商品情報の 21 項目がそろう（100%）と、押しても行き先が空になり、項目の一覧が開くだけで画面は移らなかった。
   直し：バーの数（RDX._jny に入る時と RDX.jnyNow）で、行き先の無い項目に、そのステップの画面を行き先として付ける。
         STEP 01＝商品情報（左のメニュー「商品」の中・その商品の「商品情報の充足度」が光る）。ほかのステップも、行き先の無い項目が出たときの備えに同じく付ける。
         いま行き先のある項目はそのまま（足りない項目を押したときの動き・AI の質問を始める動きは今までどおり）。
   作り：rd_v94jny.js と下の層（v100 flow・v101 deal）は書き換えない。下の層が数え直した後の R に足すだけ（何度通っても同じ結果）。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v1124jnygo) return;
  RD._v1124jnygo = 1;
  const err = (k, e) => { try { console.error("[rd] v1124jnygo " + k, e); } catch (x) { /* 記録だけ */ } };

  // ステップの番号 → 行き先（画面のキーは左のメニューと同じ。find は移った先で光らせる場所の文字）
  const DEF = {
    1: { k: "item", find: ["商品情報の充足度", "情報の充足度", "商品情報"] },
    2: { k: "cty", find: ["確定", "おすすめ"] },
    3: { k: "ops:reg", find: ["送り先ごとの決まりごと", "関税率"] },
    4: { k: "deck", find: ["納品レベルチェック", "営業資料"] },
    5: { k: "db", find: ["AIバイヤー開拓"] },
    6: { k: "deal", find: ["見積を出す相手と下書き", "バイヤー一覧"] },
    7: { k: "ops:doc", find: ["AI商社マンの判断", "書類"] },
  };
  function fill(R) {
    if (!R || !Array.isArray(R.S)) return R;
    R.S.forEach((s, i) => {
      if (!s || !Array.isArray(s.it)) return;
      const d = DEF[s.no] || DEF[i + 1];
      if (!d) return;
      s.it.forEach((x) => { if (x && (!x.go || !x.go.k)) x.go = { k: d.k, find: d.find.slice(), v1124: 1 }; });
    });
    return R;
  }
  RD.jnyFillGo = fill;

  // RDX._jny に入る時（バーを描く時・rd_v94jny の paint）。下の層の差し替え（v100 flow・v101 deal）が済んだ後に足す
  try {
    const d0 = Object.getOwnPropertyDescriptor(RD, "_jny");
    let cur = d0 && "value" in d0 ? d0.value : undefined;
    if (!d0 || d0.configurable) {
      Object.defineProperty(RD, "_jny", {
        configurable: true, enumerable: true,
        get() { return d0 && d0.get ? d0.get.call(RD) : cur; },
        set(v) {
          if (d0 && d0.set) d0.set.call(RD, v); else cur = v;
          try { fill(v); } catch (e) { err("fill", e); }
        },
      });
      if (cur) { try { fill(cur); } catch (e) { /* 無視 */ } }
      else { try { fill(RD._jny); } catch (e) { /* 無視 */ } }
    }
  } catch (e) { err("defJny", e); }
  // RDX.jnyNow（ほかの層が数だけを読む時）
  if (typeof RD.jnyNow === "function" && !RD.jnyNow.__v1124) {
    const j0 = RD.jnyNow;
    RD.jnyNow = function () { const R = j0.apply(this, arguments); try { fill(R); } catch (e) { err("jnyNow", e); } return R; };
    RD.jnyNow.__v1124 = 1;
  }
})();
