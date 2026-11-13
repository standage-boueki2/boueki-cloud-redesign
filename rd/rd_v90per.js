/* 貿易クラウドAI商社マン 21.90 per：ペルソナ評価 第4回（2026-11-13・v21.89）の横断の課題（刷新版の層・rd_case.js のあとに読む）
   番号の無い共通課題のうち、案件一覧（ホーム）で直すもの。今のアプリの関数・ほかの層の部品は呼ぶだけ（差し替えない）。
   ① 共通課題8：TRIAL-2026 では見本の会社（デモ商材3社・業種サンプル5社）を選べるのに、評価者は「みなと酒造で固定」と思った
      （切り替えは右上の会社名の窓の中だけ）→ 案件一覧の上の札に「業種を変えて試す」。押すと今のアプリの「サンプルで試す」の窓（v84SmpOpen）
      出すのは、見本を表示しているとき・まだ自社の商品が無いときだけ（自社の商品を使っているお客様の画面は今のまま）
   ② 案件一覧は「このアカウントの全部の会社・商品の案件」を並べる。TRIAL-2026 で スドウ金属工業 を表示中でも、みなと酒造 の5件が
      会社名なしで並び、表示中の会社の案件に見えた（数の信頼の問題）→ 表示中と違う会社の行に会社名の札、表の上に1行の説明
   ③ 見本の完成形（食品・化粧品・工業部品）を開くと、案件一覧は「まだ案件はありません」だけ（完成形の商談は「商談の記録」と
      これまでのダッシュボードにあり、案件一覧＝メールのやりとりには無い）→ その2つへのボタンと件数（架空の行は作らない）
   ④ 共通課題5（D：高齢寄り）：文字の大きさ「ゆったり」で、案件一覧の小さな字（12〜13px）を引き上げる（rd_v90per.css） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90per) return;
  RD._v90per = 1;
  const { I, esc, $, $$, G } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const tens = () => { try { return typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const cur = () => G("TEN") || null;
  const pid = () => { try { return typeof PID !== "undefined" ? PID : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const demoP = () => { try { const k = pid(); return k && typeof PRODUCTS !== "undefined" && PRODUCTS && PRODUCTS[k] ? PRODUCTS[k] : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const isSmp = (t) => { const f = fn("v84IsSmpT"); try { return !!(t && f && f(t)); } catch (e) { return false; } };
  const smpN = () => { const f = fn("v84SmpN"); try { return f ? +f() || 0 : 0; } catch (e) { return 0; } };
  const coOf = (t) => (t && (t.co || "")) || "";
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90per " + k, e); } }; };

  /* 見本を表示しているか（業種サンプル・デモ商材）、自社の商品がまだ無いか */
  function showSmp() {
    if (!smpN() || !fn("v84SmpOpen")) return false;
    const S = G("SES") || {};
    if (S.t === "admin" || RD.isFwd()) return false;
    if (demoP() || isSmp(cur())) return true;
    const own = tens().filter((t) => t && !isSmp(t));
    return own.length === 0;
  }
  function catNow() {
    const P = demoP(), t = cur();
    return String((P && (P.cat || "")) || (t && (t.cat || "")) || "").trim();
  }

  /* ── ① 業種を変えて試す ── */
  function smpPill(box) {
    const old = $(".k-v90persmp", box);
    if (!showSmp()) { if (old) old.remove(); return; }
    const cat = catNow(), n = smpN();
    const html = `${I("refresh", 16, 2.2)}業種を変えて試す<span class="k-pn">${cat ? `いま：${esc(cat)}・` : ""}見本 ${n}社</span>`;
    if (old) { if (old.dataset.v !== html) { old.innerHTML = html; old.dataset.v = html; } return; }
    let row = $(".k-pills", box);
    if (!row) {
      const card = $(".k-clcard", box);
      row = document.createElement("div");
      row.className = "k-pills"; row.setAttribute("role", "group"); row.setAttribute("aria-label", "対応待ち");
      if (card) card.before(row); else box.prepend(row);
    }
    const b = document.createElement("button");
    b.type = "button"; b.className = "k-pill k-v90persmp"; b.innerHTML = html; b.dataset.v = html;
    b.title = "見本（架空の会社）を、食品・化粧品・工業部品・日用雑貨・アパレル・医療衛生・中古車・酒類から選んで、同じ画面で試せます。見本は貴社の商品の一覧・数・成長レベルには入りません（右上の会社名の窓の中の「会社・商品の切り替え」と同じです）";
    b.setAttribute("aria-label", "業種を変えて試す（見本の会社を選ぶ）");
    b.addEventListener("click", (e) => { e.stopPropagation(); const f = fn("v84SmpOpen"); if (f) f(); });
    row.appendChild(b);
  }

  /* ── ② 表示中と違う会社の案件に会社名 ── */
  function coTags(box) {
    const T = tens(), t0 = cur(), co0 = coOf(t0);
    const tb = $("#k-clbody", box);
    if (!tb) return;
    const keys = Array.isArray(RD._caseOrder) ? RD._caseOrder : [];
    const rows = $$("tbody tr.k-clrow", tb);
    let other = 0;
    rows.forEach((tr, i) => {
      const k = keys[i] || "";
      const pi = +String(k).split("|")[0];
      const t = pi >= 0 ? T[pi] : null;
      const co = coOf(t);
      const diff = !!(co && co0 && co !== co0);
      const td = $("td.c-who", tr);
      const tag = td && $(".k-v90perco", td);
      if (diff) other++;
      if (!td) return;
      if (diff && !tag) { const s = document.createElement("span"); s.className = "k-v90perco"; s.title = "表示中の会社（" + co0 + "）とは別の会社の案件です"; s.innerHTML = `${I("bldg", 13, 2.2)}${esc(co)}`; ($("small", td) || td.lastChild).after(s); }
      else if (!diff && tag) tag.remove();
      else if (diff && tag && tag.textContent !== co) tag.innerHTML = `${I("bldg", 13, 2.2)}${esc(co)}`;
    });
    const L = typeof RD.allCases === "function" ? RD.allCases() : [];
    const mine = L.filter((c) => coOf(T[c.pi] || (c.pi < 0 ? t0 : null)) === co0).length;
    const others = L.length - mine;
    let note = $(".k-v90perconote", box);
    if (others > 0 && co0) {
      const t = mine ? `この一覧は、このアカウントの全部の会社の案件です（表示中の ${co0}：${mine}件・ほかの会社：${others}件。ほかの会社の行には会社名）`
        : `表示中の ${co0} の案件は、まだありません。下は、このアカウントのほかの会社の案件（${others}件・会社名つき）です`;
      if (!note) { note = document.createElement("p"); note.className = "k-v90perconote"; const card = $(".k-clcard", box); const st = card && $(".k-stchips", card); if (st) st.after(note); else if (card) card.prepend(note); }
      if (note.dataset.t !== t) { note.innerHTML = `${I("bldg", 15, 2.2)}<span>${esc(t)}</span>`; note.dataset.t = t; }
    } else if (note) note.remove();
    return other;
  }

  /* ── ③ 見本の完成形：案件一覧が空のとき、商談の記録とこれまでのダッシュボードへ ── */
  function demoEmpty(box) {
    const P = demoP();
    const em = $(".k-clempty", box);
    const old = $(".k-v90perdemo", box);
    if (!P || !em) { if (old && !em) old.remove(); return; }
    if (old) return;
    const nfb = Array.isArray(P.fb) ? P.fb.length : 0;
    const nb = Array.isArray(P.hotList) ? P.hotList.length : 0;
    const d = document.createElement("div");
    d.className = "k-v90perdemo";
    d.innerHTML = `<p title="案件一覧は、バイヤーとのメールのやりとり（「やりとり」の相手ごとのスレッド）から作ります。見本の完成形（${esc(P.co || "")}）は、2年分の商談を「商談の記録」と、これまでのダッシュボードに入れてあり、メールのやりとりは入っていません">${I("alert", 16, 2.2)}<span>見本（完成形）の商談は「商談の記録」${nfb ? `<b>${nfb}件</b>` : ""}${nb ? `・見込みのバイヤー<b>${nb}社</b>` : ""}にあります（この一覧はメールのやりとりから作るため空です）</span></p>
      <div class="k-v90perdemob"><button type="button" class="k-btn white k-mini" data-v90pergo="deal">${I("doc", 15, 2.2)}商談の記録を見る</button><button type="button" class="k-btn white k-mini" data-v90pergo="old">${I("chart", 15, 2.2)}これまでのダッシュボードを開く</button></div>`;
    $$("[data-v90pergo]", d).forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (b.dataset.v90pergo === "deal") { RD.goKey("deal"); return; }
      const f = document.querySelector("details.rd-old");
      if (f) { f.open = true; try { f.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (x) { f.scrollIntoView(); } }
    }));
    const tx = $("div", em) || em;
    const p = $("p", tx);
    if (p) p.after(d); else tx.appendChild(d);
  }

  function apply(w) {
    const box = $(".k-cl[data-kcl]", w || document);
    if (!box) return;
    smpPill(box);
    coTags(box);
    demoEmpty(box);
    const tb = $("#k-clbody", box);
    if (tb && !tb.dataset.v90per) {
      tb.dataset.v90per = "1";
      try { new MutationObserver(() => { try { coTags(box); demoEmpty(box); } catch (e) { /* 無視 */ } }).observe(tb, { childList: true }); } catch (e) { /* 無視 */ }
    }
  }
  chain("dash:home", (w) => apply(w));
  chain("dash", (w) => apply(w));
  RD.v90perApply = apply;
  RD.v90per = { showSmp, catNow };
})();
