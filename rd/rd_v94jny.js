/* 貿易クラウドAI商社マン デザイン刷新：貿易ジャーニーの現在地バー（2026-11-17 大森さん・トライアルのお客様の声）
   お客様の声「自分たちがやっていることが、貿易売上（貿易ジャーニー）のうちのどこにいるのかが分からない」
   → 荷主のすべての画面の一番上に、はじめてガイドの「輸出は7つのステップ」と同じ道のり（日本 → 海外のバイヤー）を出す。
     ・商品ごと（いま表示している商品＝TEN）に、7つのステップの充足度を % で出す（項目の数え方は下の STEPS。どれもアプリのデータから数える＝架空の数字は出さない）
     ・船の位置＝いちばん先まで進んだステップ（いまここ）。それより前で 100% でないステップは「抜け」として印を付ける
     ・ステップを押すと、そのステップのいちばん先に足りない項目を埋める画面へ直接移り、その場所を光らせる。バーの下に、そのステップの残りの項目（押すとその場所へ）を出す
   作り：今のアプリの関数は呼ぶだけ（scoreOf・dk3Gate・v54rStatus・ux32Setup・v85docJudge）。データは書き換えない（v85docJudge が作る空の案件は元に戻す）
   置き場所：.main の中の .stage（#well の入れ物）の直前（#well の描き直しで消えない・.stage は横並びなので中には入れない）。物流会社・管理者・ログイン前は出さない
   onclick= と style= は書かない（イベントは addEventListener・数値は style.setProperty） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v94jny) return;
  RD._v94jny = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const I = (n, sz, sw) => (RD.I ? RD.I(n, sz, sw) : "");
  try { if (RD.P && !RD.P.trans) RD.P.trans = '<path d="M4 5h8M8 3v2M5.5 5c.8 3 2.9 5.4 5.5 6.5M10.5 5c-.9 3.6-3.5 6.6-6.5 8"/><path d="M12 21l4.5-10 4.5 10M13.6 17.5h5.8"/>'; } catch (e) { /* 無い版 */ }
  try { if (RD.P && !RD.P.boat) RD.P.boat = '<path d="M3 15.5 5 20h14l2-4.5z"/><path d="M6 15.5V11h12v4.5"/><path d="M9 11V7h6v4M12 3v4"/>'; } catch (e) { /* 無い版 */ }

  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dat = () => { try { return typeof D !== "undefined" && D ? D : ten(); } catch (e) { return ten(); } }; // eslint-disable-line no-undef
  const fn = (n) => { try { const f = window[n]; return typeof f === "function" ? f : null; } catch (e) { return null; } };
  const isAdmin = () => { const S = RD.G ? RD.G("SES") : null; return !!(S && S.t === "admin"); };
  const show = () => { try { return !RD.locked() && !RD.isFwd() && !isAdmin() && !!ten() && !!$("#well"); } catch (e) { return false; } };

  /* ───── 商談の状況（案件の状況の順番。rd_case.js と同じ） ───── */
  const ST_ORDER = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5, 失注: -1 };
  const stOf = (s) => { try { return RD.stShort ? RD.stShort(s) : String(s || ""); } catch (e) { return String(s || ""); } };
  function threads(T) { return Object.values((T && T.dmThreads) || {}).filter((th) => th && Array.isArray(th.msgs)); }
  function bestThread(T) { // いちばん進んだ相手（同じなら新しい方）
    let best = null, bo = -2, bt = 0;
    threads(T).forEach((th) => { const o = ST_ORDER[stOf(th.status)]; const v = o == null ? 0 : o; const at = +th.statusAt || 0; if (v > bo || (v === bo && at > bt)) { best = th; bo = v; bt = at; } });
    return best;
  }
  function caseKeyOf(th) { try { const T = typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; return T.indexOf(ten()) + "|" + th.id; } catch (e) { return "-1|" + th.id; } } // eslint-disable-line no-undef
  function setupOf(k) { try { const S = fn("ux32Setup") ? window.ux32Setup() : null; const x = Array.isArray(S) ? S.find((s) => s && s[0] === k) : null; return x ? { done: !!x[4], note: String(x[5] || "") } : null; } catch (e) { return null; } }

  /* ───── 7つのステップ（はじめてガイドの「輸出は7つのステップ」と同じ名前・順番） ─────
     items：[{t:項目, ok:できているか, go:{k:画面のキー, find:[光らせる場所の文字], act:押したあとに呼ぶ関数の名前}}] */
  function stepsNow() {
    const T = ten() || {}, Dd = dat() || T;
    const S = [];

    // STEP 01 商品を整える：商品情報の 21 項目（商品情報の画面の「情報の充足度」と同じ scoreOf）
    (function () {
      const it = [];
      let pct = 0, n = 0, m = 0;
      if (!T.item) it.push({ t: "商品の資料を登録する（Excel・PDF・カタログ）", ok: false, go: { k: "up", find: ["ここにファイルを", "商品の資料をアップロード"] } });
      else {
        let sc = null; try { sc = fn("scoreOf") ? window.scoreOf(T) : null; } catch (e) { sc = null; }
        const fl = (sc && sc.filled) || [], ms = (sc && (sc.missing || sc.miss)) || [];
        fl.forEach((x) => it.push({ t: x.n || x.k, ok: true }));
        ms.forEach((x) => it.push({ t: x.n || x.k, ok: false, go: { k: "item", find: ["AIの質問に答える", "情報の充足度"], act: "fillStart" } }));
        n = fl.length; m = fl.length + ms.length;
        pct = sc && typeof sc.pct === "number" ? Math.round(sc.pct) : (m ? Math.round((n / m) * 100) : 0);
      }
      if (!T.item) { n = 0; m = 1; pct = 0; }
      S.push({ no: 1, nm: "商品を整える", sh: "商品", ic: "box", it, n, m, pct, core: !!T.item, unit: "項目", note: "商品情報の21項目（英文の商品名・HSコード・価格表・成分や仕様など）。商品情報の画面の「情報の充足度」と同じ数です" });
    })();

    // STEP 02 売る国を決める：AIの候補の分析 → 1〜3か国を確定（はじめの設定の「販売先の国を決める」と同じ判定）
    const cs = T.ctySel || {};
    const chosen = Array.isArray(cs.chosen) ? cs.chosen.filter(Boolean) : [];
    const su = setupOf("cty");
    const conf = su ? su.done : !!(chosen.length && cs.chosenAt);
    (function () {
      const anal = !!((cs.rec && cs.rec.length) || (cs.cands && cs.cands.length) || (cs.top && cs.top.length));
      const it = [
        { t: "AIが候補の国を分析する（規制・市場・競合）", ok: anal, go: { k: "cty", find: ["AIのおすすめ", "おすすめ", "分析"] } },
        { t: conf ? "販売先国を確定した：" + chosen.join("・") : "販売先国を1〜3か国 確定する", ok: conf, go: { k: "cty", find: ["確定", "選択する", "おすすめ"] } },
      ];
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 2, nm: "売る国を決める", sh: "国", ic: "globe", it, n, m: it.length, pct: Math.round((n / it.length) * 100), core: !!conf, unit: "項目", note: "AIの候補の分析と、販売先国の確定（はじめの設定の「販売先の国を決める」と同じ判定）" });
    })();

    // STEP 03 規制を確かめる：確定した国ごとに「規制・必要な書類の表」＋「販売・出荷の前に必要な手続き（対応済みにする）」（規制を調べるの画面の 未対応 N件／全M件 と同じ v54rStatus）
    (function () {
      const it = [];
      if (!conf || !chosen.length) it.push({ t: "先に販売先国を確定する（STEP 02）", ok: false, go: { k: "cty", find: ["確定", "おすすめ"] } });
      chosen.forEach((c) => {
        const r = Dd && Dd.regs ? Dd.regs[c] : null;
        it.push({ t: c + "：関税・必要な書類・認証の表", ok: !!r, go: { k: "ops:reg", cty: c, find: ["送り先ごとの決まりごと", "関税率"] } });
        if (!r) return;
        let st = null; try { st = fn("v54rStatus") ? window.v54rStatus(c) : null; } catch (e) { st = null; }
        if (!st) return;
        (st.req || []).forEach((d) => { const ok = (st.done || []).indexOf(d) >= 0; it.push({ t: c + "：" + d + "（必要な手続き）", ok, go: { k: "ops:reg", cty: c, find: [String(d), "対応済みにする", "未対応"] } }); });
        if (st.ban && st.ban.ban && st.ban.ban.length) it.push({ t: c + "：配合が禁止されている成分がある（このままでは販売不可）", ok: false, go: { k: "ops:reg", cty: c, find: ["販売不可", "禁止"] } });
      });
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 3, nm: "規制を確かめる", sh: "規制", ic: "shield", it, n, m: it.length, pct: it.length ? Math.round((n / it.length) * 100) : 0, core: !!(conf && chosen.length && chosen.every((c) => Dd && Dd.regs && Dd.regs[c])), unit: "項目", note: "確定した国ごとに、関税・必要な書類の表と、販売・出荷の前に必要な手続き（「対応済みにする」）。規制を調べるの画面の「未対応 N件／全M件」と同じ判定です" });
    })();

    // STEP 04 資料をつくる：営業資料の「納品レベルチェック」21項目（営業資料の画面の完成度と同じ dk3Gate）＋ 営業資料を作った
    (function () {
      const it = [];
      let G = []; try { G = fn("dk3Gate") ? window.dk3Gate() : []; } catch (e) { G = []; }
      // dk3Gate の1行：{grp, gn, k, req（必須か）, n（項目）, ok（できているか）, how（埋め方）}
      (G || []).forEach((g) => { if (!g || typeof g !== "object") return; const nm = Array.isArray(g) ? g[4] : g.n, rq = Array.isArray(g) ? g[3] : g.req, ok = Array.isArray(g) ? g[5] : g.ok; it.push({ t: String(nm || "") + (rq ? "" : "（推奨）"), ok: !!ok, req: !!rq, go: { k: "deck", find: [String(nm || ""), "納品レベルチェック"] } }); });
      const made = Array.isArray(T.deckGen) && T.deckGen.length > 0;
      const langs = made ? Array.from(new Set(T.deckGen.map((x) => x && x.lang).filter(Boolean))) : [];
      it.push({ t: made ? "営業資料を作った（" + langs.length + "言語）" : "営業資料を作る（相手の言語で）", ok: made, go: { k: "deck", find: ["営業資料を作る", "下書き（空欄つき）を作る"] } });
      // 必須の項目を先に（足りない所へ移るときの順番）
      it.sort((a, b) => (a.ok - b.ok) || ((b.req ? 1 : 0) - (a.req ? 1 : 0)));
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 4, nm: "資料をつくる", sh: "資料", ic: "trans", it, n, m: it.length, pct: it.length ? Math.round((n / it.length) * 100) : 0, core: made, unit: "項目", note: "営業資料の納品レベルチェック（必須13・推奨8＝営業資料の画面の「完成度」と同じ）と、営業資料を作ったか" });
    })();

    // STEP 05 相手を探して商談：探す → 連絡する → 返事が来る → 商談を記録する（はじめの設定の「バイヤーに連絡する」「商談を記録する」と同じ判定）
    const TH = threads(T);
    (function () {
      const runs = (T.v71ob && Array.isArray(T.v71ob.runs) && T.v71ob.runs.length) || 0;
      const myb = (Array.isArray(T.myBuyers) && T.myBuyers.length) || 0;
      const sb = setupOf("buyer"), sf = setupOf("fb");
      const sent = sb ? sb.done : ((Array.isArray(T.outreach) && T.outreach.length > 0) || TH.some((th) => th.msgs.some((m) => m && m.w === "me")));
      const reply = TH.some((th) => th.msgs.some((m) => m && m.w === "by"));
      const fb = sf ? sf.done : (Array.isArray(T.fbx) && T.fbx.length > 0);
      const it = [
        { t: runs || myb ? "バイヤー候補を探した（AIバイヤー開拓 " + runs + "回・自社のバイヤー " + myb + "社）" : "バイヤー候補を探す（AIバイヤー開拓）", ok: !!(runs || myb || sent), go: { k: "db", find: ["AIバイヤー開拓", "バイヤーを探す"] } },
        { t: "バイヤーに連絡する（営業メールを送る）", ok: !!sent, go: { k: "db", find: ["送る", "提案", "AIバイヤー開拓"] } },
        { t: "相手から返事が来る", ok: reply, go: { k: "msg", find: ["やりとり"] } },
        { t: "商談を記録する（相手の反応・価格・次の一手）", ok: !!fb, go: { k: "deal", find: ["商談の記録", "記録する", "商談"] } },
      ];
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 5, nm: "相手を探して商談", sh: "商談", ic: "chat", it, n, m: it.length, pct: Math.round((n / it.length) * 100), core: !!sent, unit: "項目", note: "バイヤー候補を探す・連絡する・返事が来る・商談を記録する（はじめの設定の「バイヤーに連絡する」「商談を記録する」と同じ判定）" });
    })();

    // STEP 06 見積・契約：見積・条件を出す → 商流（直接／間接）を決める → 契約書を確かめる → 受注（取引中）
    (function () {
      const best = bestThread(T);
      const ord = (th) => { const o = ST_ORDER[stOf(th && th.status)]; return o == null ? 0 : o; };
      const fbx = Array.isArray(T.fbx) ? T.fbx : [];
      const quote = TH.some((th) => ord(th) >= 3) || fbx.some((f) => f && /見積提示|契約交渉|受注|取引中/.test(String(f.st || "")));
      const tcs = (T.v75tc && T.v75tc.cases) || {};
      const route = Object.keys(tcs).some((k) => tcs[k] && tcs[k].route);
      const docs = (T.legal && Array.isArray(T.legal.docs)) ? T.legal.docs : [];
      const legal = docs.some((d) => d && d.rv);
      const won = TH.some((th) => stOf(th.status) === "取引中") || fbx.some((f) => f && /受注|取引中/.test(String(f.st || "")));
      const toCase = best ? { k: "case", key: caseKeyOf(best), find: ["商流", "見積", "やりとり"] } : { k: "db", find: ["AIバイヤー開拓", "バイヤーを探す"] }; // 相手がまだいないときは、相手を探す画面へ
      const it = [
        { t: "見積・条件（価格・数量・建値）を相手に出す", ok: quote, go: toCase },
        { t: "商流（直接貿易／間接貿易）を決める", ok: route, go: toCase },
        { t: docs.length ? "契約書をAIで確かめる（" + docs.length + "件）" : "契約書（売買契約・NDA など）を確かめる", ok: legal, go: { k: "legal", find: ["契約書"] } },
        { t: "受注する（状況が「取引中」）", ok: won, go: toCase },
      ];
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 6, nm: "見積・契約", sh: "契約", ic: "doc", it, n, m: it.length, pct: Math.round((n / it.length) * 100), core: !!quote, unit: "項目", note: "見積・条件を出す（案件の状況が「見積提示」より先）・商流を決める・契約書を確かめる・受注（「取引中」）" });
    })();

    // STEP 07 書類・出荷・入金：書類をつくるの「必須の書類」のうち「確認済み」の数（出荷・入金は開発中のため数えない）
    (function () {
      const it = [];
      let ship = null; try { ship = fn("v85docShip") ? window.v85docShip() : null; } catch (e) { ship = null; }
      let J = null, draft = 0;
      if (ship && fn("v85docJudge") && fn("v85docStatus")) {
        const t0 = ten();
        const had = !!(t0 && t0.v85docs), key = (() => { try { return window.v85docCaseKey(); } catch (e) { return "_"; } })();
        const hadCase = had && !!(t0.v85docs.cases && t0.v85docs.cases[key]);
        try {
          J = window.v85docJudge();
          const cs2 = fn("v85docCase") ? window.v85docCase() : { skip: {} };
          const rows = Object.keys(J.rows || {}).map((k) => J.rows[k]).filter((r) => r && r.lv === "required" && !(cs2.skip && cs2.skip[r.k]));
          rows.forEach((r) => { const s = window.v85docStatus(r.k) || []; if (s[0] === "draft") draft++; it.push({ t: (r.ja || r.k) + (s[0] === "draft" ? "（下書きあり）" : ""), ok: s[0] === "ok", go: { k: "ops:doc", find: [String(r.ja || ""), "必須"] } }); });
        } catch (e) { J = null; }
        // 判定のために作られた空の入れ物は元に戻す（データを書き換えない）
        try { if (t0) { if (!had) delete t0.v85docs; else if (!hadCase && t0.v85docs.cases) { const c = t0.v85docs.cases[key]; if (c && !Object.keys(c.inp || {}).length && !Object.keys(c.st || {}).length && !Object.keys(c.skip || {}).length) delete t0.v85docs.cases[key]; } } } catch (e) { /* 無視 */ }
      }
      if (!it.length) it.push({ t: ship ? "必要な書類を書き出す（書類をつくる）" : "出荷の案件を決めて、必要な書類を書き出す（書類をつくる）", ok: false, go: { k: "ops:doc", find: ["書類をつくる", "必須"] } });
      const n = it.filter((x) => x.ok).length;
      S.push({ no: 7, nm: "書類・出荷・入金", sh: "出荷", ic: "ship", it, n, m: it.length, pct: it.length ? Math.round((n / it.length) * 100) : 0, core: n > 0, unit: "書類", draft, soon: 1, note: "書類をつくるの「必須の書類」のうち「確認済み」の数。出荷を進める・受注・請求・入金は開発中（Coming Soon）のため、いまは数えません" });
    })();

    // いまここ：ステップごとの「核になる一歩」（1 商品を登録した／2 販売先国を確定した／3 確定した国の規制の表がそろった／4 営業資料を作った／
    //   5 バイヤーに連絡した／6 見積・条件を出した／7 必須の書類を1つ確認済みにした）が済んだ、いちばん先のステップ。そのステップが 100% なら次のステップ。
    //   ％が少しあるだけでは進めない（営業資料の会社の情報などは商品の登録で先に埋まるため、国を決める前に STEP 04 へ飛ばないように）
    //   抜け＝いまここより前で 100% でないステップ
    let now = 0; S.forEach((s, i) => { if (s.core) now = i; });
    if (S[now].core && S[now].pct >= 100 && now < S.length - 1) now++;
    S.forEach((s, i) => { s.now = i === now; s.gap = i < now && s.pct < 100; s.left = s.it.filter((x) => !x.ok).length; });
    const all = Math.round(S.reduce((a, s) => a + s.pct, 0) / S.length);
    const gaps = S.filter((s) => s.gap);
    const nextStep = gaps[0] || (S[now].pct < 100 ? S[now] : S.slice(now + 1).find((s) => s.pct < 100)) || null;
    const nextItem = nextStep ? nextStep.it.find((x) => !x.ok) : null;
    return { S, now, all, gaps, nextStep, nextItem };
  }
  RD.jnyNow = stepsNow;

  /* ───── 足りない所へ移る ───── */
  function vis(el) { return !!el && !!el.getClientRects().length && getComputedStyle(el).visibility !== "hidden"; }
  function findIn(w, needles) {
    const cand = $$("h1,h2,h3,h4,h5,summary,button,label,b,strong,dt,li,td,th,p,span,a", w).filter((el) => !el.closest("#rdjny,[data-rdhero],.rd-hero") && vis(el)); // 見出しの帯（パンくず）は除く
    for (const nd of needles || []) {
      if (!nd) continue;
      // 文字がいちばん短い（＝その言葉そのものに近い）部品
      let best = null, bl = 1e9;
      cand.forEach((el) => { const t = (el.innerText || el.textContent || "").trim(); if (t && t.indexOf(nd) >= 0 && t.length < bl && t.length < nd.length + 120) { best = el; bl = t.length; } });
      if (best) return best;
    }
    return null;
  }
  function flash(el) {
    if (!el) return;
    const box = el.closest(".rd-card, .k-card, .c, section, li, tr, .rd-x") || el;
    try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { el.scrollIntoView(); }
    // 同じ場所を続けて光らせたとき、前の消す予約で新しい光が消えないよう、予約は部品ごとに1つ
    [box, el].forEach((x) => { clearTimeout(x._jnyT); x.classList.remove("k-jnyhit"); void x.offsetWidth; x.classList.add("k-jnyhit"); x._jnyT = setTimeout(() => x.classList.remove("k-jnyhit"), 3200); });
  }
  function pickCty(w, c) { // 規制を調べる：送り先の国を選ぶ（選ぶ部品は今のアプリのまま）
    const sel = $$("select", w).find((s) => Array.from(s.options).some((o) => (o.textContent || "").trim() === c || o.value === c));
    if (sel) { const o = Array.from(sel.options).find((x) => (x.textContent || "").trim() === c || x.value === c); if (sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); } return true; }
    const btn = $$("button,label,[role=tab],[data-c],[data-cty]", w).find((b) => !b.closest("#rdjny") && (b.textContent || "").trim() === c && vis(b));
    if (btn) { if (!/on|active|sel/.test(btn.className) && btn.getAttribute("aria-pressed") !== "true") btn.click(); return true; }
    return false;
  }
  function goItem(g) {
    if (!g) return;
    let picked = false;
    const after = (tries) => {
      const w = $("#well"); if (!w) return;
      // 規制を調べる：送り先の国の選択がまだ描かれていなければ、描かれるまで（約2秒）選び直しを試す
      if (g.cty && !picked && tries < 6) { if (pickCty(w, g.cty)) { picked = true; setTimeout(() => after(tries + 1), 700); return; } setTimeout(() => after(tries + 1), 350); return; }
      const el = findIn(w, g.find);
      if (el) { flash(el); if (g.act && fn(g.act)) { setTimeout(() => { try { window[g.act](); } catch (e) { /* 無視 */ } }, 650); } return; }
      if (tries < 12) setTimeout(() => after(tries + 1), 300);
      else if (g.act && fn(g.act)) { try { window[g.act](); } catch (e) { /* 無視 */ } }
    };
    if (g.k === "case" && RD.openCase) { ST.okKey = "dash:case"; RD.openCase(g.key); setTimeout(() => after(1), 900); return; }
    const k = g.k === "case" ? "deal" : g.k;
    ST.okKey = k;
    if (RD.curKey && RD.curKey() !== k) { RD.goKey(k); setTimeout(() => after(0), 700); } else after(0);
  }

  /* ───── 描く ───── */
  // open＝項目の一覧を開いているステップ／okKey＝一覧を開いたまま見せる画面（バーから移った先）。ほかのメニューで別の画面へ移ったら一覧を閉じる
  // min＝たたんだ（見出しの1段だけ）。この端末に覚える（localStorage rd_jnymin）。はじめは開く
  const ST = { open: -1, help: false, sig: "", okKey: "", min: (() => { try { return localStorage.getItem("rd_jnymin") === "1"; } catch (e) { return false; } })() };
  function prodSel() {
    const ps = document.getElementById("psw");
    if (!ps || !ps.options.length) { const T = ten() || {}; return `<span class="k-jny-pnm" title="${esc(T.item || "")}">${esc(T.item || "（商品が未登録）")}</span>`; }
    const short = (o) => { const v = o.value, t = (o.textContent || "").trim(); if (/^t:\d+$/.test(v)) { try { const x = TENS[+v.slice(2)]; if (x && x.item) return x.item; } catch (e) { /* 無視 */ } return t.split("（")[0]; } const s = t.split("／"); return s.length > 1 ? s.slice(1).join("／") + "（見本）" : t; }; // eslint-disable-line no-undef
    return `<select id="rdjnyProd" class="k-jny-psel" aria-label="商品を切り替える（商品ごとの現在地）">${Array.from(ps.options).map((o) => `<option value="${esc(o.value)}"${o.value === ps.value ? " selected" : ""}>${esc(short(o))}</option>`).join("")}</select>`;
  }
  function stepHtml(s, i) {
    const cls = [s.pct >= 100 ? "done" : "", s.now ? "now" : "", s.gap ? "gap" : "", ST.open === i ? "open" : ""].filter(Boolean).join(" ");
    const tip = `STEP ${String(s.no).padStart(2, "0")} ${s.nm}：${s.pct}%（${s.n}/${s.m}${s.unit}）${s.left ? "・あと" + s.left + s.unit : "・そろっています"}。押すと足りない所へ移ります`;
    return `<li class="k-jny-li"><button type="button" class="k-jny-st ${cls}" data-jnys="${i}" aria-expanded="${ST.open === i}" title="${esc(tip)}">
      ${s.now ? `<span class="k-jny-here">${I("boat", 12, 2.4)}いまここ</span>` : ""}
      <span class="k-jny-ring" data-p="${s.pct}"><span class="k-jny-ic">${s.pct >= 100 && !s.now ? I("check", 20, 3) : I(s.ic, 20, 2)}</span></span>
      <span class="k-jny-no">STEP ${String(s.no).padStart(2, "0")}</span>
      <span class="k-jny-nm"><span class="k-jny-nl">${esc(s.nm)}</span><span class="k-jny-ns">${esc(s.sh)}</span></span>
      <span class="k-jny-pc"><b>${s.pct}</b>%<span class="k-jny-cnt">${s.n}/${s.m}${esc(s.unit)}</span></span>
      ${s.gap ? `<span class="k-jny-gapb">抜け あと${s.left}</span>` : ""}
    </button></li>`;
  }
  function detHtml(R) {
    const s = R.S[ST.open]; if (!s) return "";
    const ng = s.it.filter((x) => !x.ok), ok = s.it.filter((x) => x.ok);
    return `<div class="k-jny-det" role="region" aria-label="STEP ${s.no} の項目">
      <div class="k-jny-dh"><b>STEP ${String(s.no).padStart(2, "0")} ${esc(s.nm)}</b><span class="k-jny-dp">${s.pct}%（${s.n}/${s.m}${esc(s.unit)}）</span>
        <span class="k-jny-dn">${esc(s.note)}</span><button type="button" class="k-jny-x" data-jnyx="1" aria-label="閉じる">${I("x", 16, 2.4)}</button></div>
      ${ng.length ? `<ul class="k-jny-ul">${ng.map((x) => `<li><button type="button" class="k-jny-go" data-jnyi="${s.it.indexOf(x)}"><span class="k-jny-bx" aria-hidden="true"></span><span>${esc(x.t)}</span>${I("arr", 15, 2.4)}</button></li>`).join("")}</ul>` : `<p class="k-jny-ok">${I("check", 16, 3)} このステップの項目は、そろっています</p>`}
      ${ok.length ? `<details class="k-jny-okl"><summary>できている項目（${ok.length}）</summary><ul>${ok.map((x) => `<li>${I("check", 14, 3)}${esc(x.t)}</li>`).join("")}</ul></details>` : ""}
      ${s.soon ? `<p class="k-jny-soon"><span>Coming Soon</span>出荷を進める・受注・請求・入金は開発中です。いまは書類の準備までを数えます</p>` : ""}
    </div>`;
  }
  function html(R) {
    const T = ten() || {};
    const st = R.S[R.now];
    const nx = R.nextStep && R.nextItem ? `<button type="button" class="k-jny-next" data-jnynext="1" title="${esc("STEP " + R.nextStep.no + " " + R.nextStep.nm + "：" + R.nextItem.t)}"><span class="k-jny-nxl">${R.gaps.length ? "抜けを埋める" : "次の一手"}</span><span class="k-jny-nxt">${esc(R.nextItem.t)}</span>${I("arr", 16, 2.4)}</button>` : `<span class="k-jny-fin">${I("check", 16, 3)} いま数えられる項目は、すべてそろっています</span>`;
    return `<div class="k-jny-hd">
        <div class="k-jny-tt"><span class="k-jny-tic" aria-hidden="true">${I("pin", 18, 2.2)}</span><b>貿易ジャーニーの現在地</b></div>
        <div class="k-jny-prod"><span class="k-jny-pl">商品</span>${prodSel()}</div>
        <div class="k-jny-now"><span class="k-jny-nwl">いまここ</span><b>STEP ${String(st.no).padStart(2, "0")} ${esc(st.nm)}</b><span class="k-jny-all">全体 <b>${R.all}</b>%</span>${R.gaps.length ? `<span class="k-jny-gaps">${I("alert", 14, 2.2)}前に抜け ${R.gaps.length}か所</span>` : ""}</div>
        ${nx}
        <span class="k-jny-tools"><button type="button" class="k-jny-q" data-jnyq="1" aria-expanded="${ST.help}" aria-label="貿易ジャーニーの見方" title="見方">?</button><button type="button" class="k-jny-min" data-jnymin="1" aria-expanded="${!ST.min}" title="${ST.min ? "7つのステップを開く" : "たたむ（見出しの1段だけにする）"}">${ST.min ? "ひらく" : "たたむ"}${I("chev", 14, 2.4)}</button></span>
      </div>
      ${ST.help ? `<div class="k-jny-help"><b>見方</b>：はじめてガイドの「輸出は7つのステップ」と同じ道のりです（左が日本、右が海外のバイヤー＝貿易売上）。<b>%</b>＝ステップごとの確かめる項目のうち、できている数の割合（商品ごと。いま表示している商品「${esc(T.item || "")}」の数）。<b>いまここ</b>（船）＝ステップごとの核になる一歩（商品を登録／販売先国を確定／規制の表がそろう／営業資料を作る／バイヤーに連絡／見積・条件を出す／必須の書類を確認済みに）が済んだ、いちばん先のステップ（100% なら次のステップ）。それより前で 100% でないステップには「抜け」の印が付きます。<b>全体</b>＝7つの % の平均。ステップを押すと、足りない項目を埋める画面へ移り、その場所が光ります。数字はアプリに入っているデータから数えています（架空の数字は出しません）。出荷を進める・受注・請求・入金は開発中のため、STEP 07 は書類の準備までを数えます。</div>` : ""}
      ${ST.min ? "" : `<div class="k-jny-route"><span class="k-jny-end k-jny-jp">日本</span><span class="k-jny-end k-jny-ww">海外の<br>バイヤー</span>
        <ol class="k-jny-ol">${R.S.map(stepHtml).join("")}</ol></div>
      ${ST.open >= 0 ? detHtml(R) : ""}`}`;
  }
  // 5段の「輸出のステップ」は画面を描いたあと少し遅れて足されることがあるので、.stage の中の追加を見て印を付ける（見出しの後ろに「？」が付くので前方一致）
  function markDup() {
    if (!document.documentElement.classList.contains("rd-jny")) return;
    $$("#well section.k-card").forEach((s) => { if (s.classList.contains("k-jny-dup")) return; const h = $("h2", s); if (h && /^(輸出のステップ|Export steps)/.test((h.textContent || "").trim())) s.classList.add("k-jny-dup"); });
  }
  let dupRaf = 0;
  const dupMo = new MutationObserver(() => { if (dupRaf) return; dupRaf = requestAnimationFrame(() => { dupRaf = 0; try { markDup(); } catch (e) { /* 無視 */ } }); });
  function watchDup() { const s = $(".stage"); if (s && !s._jnyMo) { s._jnyMo = 1; dupMo.observe(s, { childList: true, subtree: true }); } watchMain(); }
  // スマホの形への切り替えなどで今のアプリが .main の中を組み直すと、バーが外れることがある → すぐ戻す
  const mainMo = new MutationObserver(() => { if (!document.getElementById("rdjny") && show()) { ST.sig = ""; paint(true); } });
  function watchMain() { const m = $(".main"); if (m && !m._jnyMo) { m._jnyMo = 1; mainMo.observe(m, { childList: true }); } }
  function sigOf(R, T) { return [T && T.item, R.S.map((s) => s.pct + ":" + s.n + "/" + s.m + ":" + (s.now ? 1 : 0)).join(","), ST.open, ST.help, ST.min, (document.getElementById("psw") || {}).value || ""].join("|"); }
  function paint(force) {
    try {
      const bar0 = document.getElementById("rdjny");
      if (!show()) { if (bar0) bar0.remove(); document.documentElement.classList.remove("rd-jny"); return; }
      // 置き場所：.main（縦に並ぶ）の中の .stage（#well の入れ物・横に並ぶ）の直前。.stage の中に入れると #well と横に並んでしまう
      const w = $("#well"); if (!w) return;
      const stg = w.closest(".stage") || w;
      if (!stg.parentNode) return;
      let bar = bar0;
      if (!bar || bar.nextElementSibling !== stg) { if (bar) bar.remove(); bar = document.createElement("section"); bar.id = "rdjny"; bar.className = "k-jny rd-xj"; bar.setAttribute("aria-label", "貿易ジャーニーの現在地（商品ごと）"); stg.parentNode.insertBefore(bar, stg); wire(bar); force = true; }
      document.documentElement.classList.add("rd-jny");
      // タスクの画面の「輸出のステップ（今どこ？）」5段（rd_pages2.js exportSteps）は、このバーと数え方が違う現在地が2つ並ぶため出さない。
      //   5段の行き先（商品情報・販売先国・AIバイヤー開拓・商談・書類をつくる）は、どれもこのバーの STEP から行ける
      markDup(); watchDup();
      if (ST.open >= 0 && RD.curKey && ST.okKey && RD.curKey() !== ST.okKey) { ST.open = -1; ST.okKey = ""; }
      const R = stepsNow(); RD._jny = R;
      const sg = sigOf(R, ten());
      if (!force && sg === ST.sig) return;
      ST.sig = sg;
      bar.innerHTML = html(R);
      $$(".k-jny-ring", bar).forEach((r) => r.style.setProperty("--p", r.getAttribute("data-p") || "0"));
      const ol = $(".k-jny-ol", bar); if (ol) ol.style.setProperty("--now", String(R.now));
    } catch (e) { console.error("[rd] v94jny", e); }
  }
  RD.jnyPaint = paint;
  function wire(bar) {
    bar.addEventListener("click", (e) => {
      const st = e.target.closest("[data-jnys]");
      if (st) { const i = +st.dataset.jnys; const R = RD._jny || stepsNow(); const s = R.S[i]; ST.open = i; ST.okKey = RD.curKey ? RD.curKey() : ""; paint(true); const x = s && s.it.find((y) => !y.ok); if (x) goItem(x.go); else if (s) goItem((s.it[0] || {}).go); return; }
      const gi = e.target.closest("[data-jnyi]");
      if (gi) { const R = RD._jny || stepsNow(); const s = R.S[ST.open]; const x = s && s.it[+gi.dataset.jnyi]; if (x) goItem(x.go); return; }
      if (e.target.closest("[data-jnynext]")) { const R = RD._jny || stepsNow(); if (R.nextStep && R.nextItem) { ST.open = R.S.indexOf(R.nextStep); ST.okKey = RD.curKey ? RD.curKey() : ""; paint(true); goItem(R.nextItem.go); } return; }
      if (e.target.closest("[data-jnyx]")) { ST.open = -1; paint(true); return; }
      if (e.target.closest("[data-jnyq]")) { ST.help = !ST.help; paint(true); return; }
      if (e.target.closest("[data-jnymin]")) { ST.min = !ST.min; try { localStorage.setItem("rd_jnymin", ST.min ? "1" : "0"); } catch (x) { /* 無視 */ } paint(true); return; }
    });
    bar.addEventListener("change", (e) => {
      if (e.target.id !== "rdjnyProd") return;
      const ps = document.getElementById("psw"); if (!ps) return;
      ST.open = -1;
      ps.value = e.target.value; ps.dispatchEvent(new Event("change"));
      setTimeout(() => paint(true), 900);
    });
  }

  /* ───── いつ描くか：画面を描いたあと（RD.after）・押したあと・5秒ごと（数が変わったときだけ描き直す） ───── */
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); paint(); return r; };
  let tm = 0;
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("#rdjny")) return; clearTimeout(tm); tm = setTimeout(() => paint(), 800); }, true);
  // 1秒ごとにバーがあるかだけを見て（外れていれば戻す）、5秒ごとに数を数え直す
  let tick = 0;
  setInterval(() => { if (document.hidden) return; tick++; if (!document.getElementById("rdjny")) { if (show()) paint(true); } else if (tick % 5 === 0) paint(); }, 1000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => paint()); else paint();
})();
