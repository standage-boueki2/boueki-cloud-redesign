/* 21.96 cty：刷新版の層（見せ方）。中身（採点・判定・再試行）は logic_v2196cty.js（window.V96CTY）
   No.517 販売先国の選定：おすすめのカード（各国）と、② 分析結果の表の下に「点数の内訳（効いた入力）」を出す。
          「この推奨の決め方」の欄の「内蔵の採点は、商品の特性を見ていません」「差はバイヤー数と拠点だけ」は、新しい採点では事実と違うので書き直す
          （前の版で分析した結果＝内訳の無い結果には、そのまま残し、「この商品で採点し直す」を出す）。
   No.515・No.508 規制の AI 詳細調査：Web 検索で確かめられなかった結果は、結果の先頭に「一般知識による下書き・裏取りはできていない」と理由・自動の再試行の結果・
          「Web 検索つきでもう一度調べる」を出す。「確認できませんでした」の項目ごとに、確かめ先（公式の頁）と輸入者への質問（英語・コピー）を出す。
          規制の画面の「🧭 調べ方と次の一歩」の 4（AI の詳細調査）に、前回の調査が Web 検索で確かめられたかを書く。
   インラインの onclick・style は使わない（CSP）。外から来た文字（AI の文・国名）はエスケープする。 */
(function () {
  'use strict';
  const RD = window.RDX;
  const V = () => window.V96CTY || null;
  if (window.__v96ctyRd) return;
  window.__v96ctyRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en) => { const v = V(); return v ? v.M(ja, en) : ja; };
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf('rd ' + k, e); } catch (x) { /* 記録だけ */ } };
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : (typeof cur !== 'undefined' ? cur : ''); } catch (e) { return ''; } }; // eslint-disable-line no-undef
  const locked = () => { try { return RD && RD.locked ? !!RD.locked() : document.body.classList.contains('locked'); } catch (e) { return false; } };
  const store = () => { try { return typeof ctyStore === 'function' ? ctyStore() : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const toast0 = (m) => { try { if (typeof toast === 'function') toast(m); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef

  /* ───── No.517 点数の内訳 ───── */
  function sig(r) { try { return [r.c, r.sc && r.sc.total, r.sc && r.sc.reg, r.sc && r.sc.mkt, V().lang()].join('|'); } catch (e) { return ''; } }
  function bdDetails(r, cls) {
    const h = V().bdHtml(r, { compact: 1 });
    if (!h) return '';
    const v = r.v96 || {}, sc = r.sc || {};
    const mv = (k) => (v.from && v.from[k] != null && sc[k] != null && v.from[k] !== sc[k]) ? V().axNm(k) + ' ' + v.from[k] + '→' + sc[k] : '';
    const ch = ['reg', 'mkt'].map(mv).filter(Boolean).join(M('・', ', '));
    return '<details class="v96cty-bd ' + (cls || '') + '" data-v96c="' + E(r.c) + '" data-v96sig="' + E(sig(r)) + '" data-noi18n="1"><summary>' +
      E(M('点数の内訳（効いた入力）', 'Score breakdown (inputs used)')) + (ch ? '<small>' + E(ch) + '</small>' : '') + '</summary>' + h + '</details>';
  }
  function cards(rec) {
    $$('button[data-rdcty]').forEach((b) => {
      try {
        const c = b.getAttribute('data-rdcty');
        const card = b.closest('.k-card');
        // おすすめのカード（.k-tiles の中の1枚）だけ。「総合点は高くても…」の行の小さいボタンには付けない
        if (!c || !card || !card.parentElement || !card.parentElement.classList.contains('k-tiles')) return;
        const r = rec.find((x) => x && x.c === c);
        let d = $(':scope > details.v96cty-bd', card);
        if (!r || !r.v96) { if (d) d.remove(); return; }
        if (d && d.getAttribute('data-v96sig') === sig(r)) return;
        const open = !!(d && d.open);
        if (d) d.remove();
        b.insertAdjacentHTML('beforebegin', bdDetails(r, 'v96cty-card'));
        d = $(':scope > details.v96cty-bd', card);
        if (d && open) d.open = true;
      } catch (e) { warn('card', e); }
    });
  }
  function allBox(s) {
    try {
      const sec = document.getElementById('sec-2');
      const tw = sec && $('.tw', sec);
      let box = $('.v96cty-all');
      if (!tw) { if (box) box.remove(); return; }
      const rec = (s && Array.isArray(s.rec)) ? s.rec : [];
      const has = rec.some((r) => r && r.v96);
      const key = rec.map(sig).join(';') + '|' + (has ? 1 : 0);
      if (box && box.getAttribute('data-v96sig') === key && box.previousElementSibling === tw) return;
      const opened = box ? $$('details[open]', box).map((d) => d.getAttribute('data-v96c')) : [];
      if (box) box.remove();
      let h;
      if (has) {
        const v0 = (rec.find((r) => r && r.v96) || {}).v96;
        h = '<div class="v96cty-all" data-noi18n="1" data-v96sig="' + E(key) + '"><b class="v96cty-h">' + E(M('国ごとの点数の内訳（どの入力が効いたか）', 'Score breakdown by country (which inputs were used)')) + '</b>' +
          '<p class="v96cty-lead">' + E(M('この商品で使った入力：', 'Inputs from this product: ') + V().inpTxt(v0 && v0.inp)) + '</p>' +
          '<p class="v96cty-lead">' + E(V().diffLine(rec)) + '</p>' +
          rec.map((r) => {
            if (!r || !r.v96) return '';
            const sc = r.sc || {};
            const ax = ['mkt', 'reg', 'comp', 'base'].map((k) => V().axNm(k) + ' ' + (sc[k] == null ? M('未評価', 'n/a') : sc[k])).join(M('・', ' · '));
            return '<details class="v96cty-bd v96cty-row" data-v96c="' + E(r.c) + '"><summary><b>' + E(V().ctyNm(r.c)) + '</b><span>' + E(M('総合 ', 'Total ') + sc.total + M('点', '')) + '</span><small>' + E(ax) + '</small></summary>' + V().bdHtml(r, { noIn: 1 }) + '</details>';
          }).join('') + '</div>';
      } else {
        h = '<div class="v96cty-all v96cty-old" data-noi18n="1" data-v96sig="' + E(key) + '"><b class="v96cty-h">' + E(M('点数の内訳', 'Score breakdown')) + '</b><p class="v96cty-lead">' +
          E(M('この分析は前の版の採点です（商品の HS・単価・保存条件と、書類の判断の表をまだ点に入れていません）。採点し直すと、国ごとの「点数の内訳（効いた入力）」が出ます。', 'This analysis used the previous scoring (without this product’s HS, unit price, storage and the document decision table). Re-score to see the breakdown for each country.')) +
          '</p><button type="button" class="btn g" data-v96rescore="1">' + E(M('🔄 この商品で採点し直す', '🔄 Re-score for this product')) + '</button></div>';
      }
      tw.insertAdjacentHTML('afterend', h);
      box = $('.v96cty-all');
      opened.forEach((c) => { const d = box && $$('details[data-v96c]', box).find((x) => x.getAttribute('data-v96c') === c); if (d) d.open = true; });
    } catch (e) { warn('all', e); }
  }
  // 「この推奨の決め方」の欄：新しい採点では事実と違う2つの文を書き直す
  const OLD_MAIN = [
    ['内蔵の採点は、商品の特性（用途・価格帯・強み）を見ていません。', '内蔵の採点は、商品の HS・カテゴリー・単価・保存条件と、書類の判断の表（この商品とこの国で要る手続き）を点に入れています（用途・強みなどの文章は見ていません）。'],
    ["The built-in scoring does not look at your product's characteristics (use, price range, strengths). ", "The built-in scoring includes this product's HS, category, unit price, storage and the document decision table (procedures needed for this product and country); it does not read descriptions such as use or strengths. "],
    ["The built-in scoring does not look at your product's characteristics. ", "The built-in scoring includes this product's HS, category, unit price, storage and the document decision table; it does not read descriptions such as use or strengths. "]
  ];
  const OLD_FLAT = /通関統計と規制のひな形のデータが無いため、国ごとの点数の差は|no customs statistics and no regulation template, so the differences between countries come only/;
  function ruleText(s) {
    try {
      const rec = (s && Array.isArray(s.rec)) ? s.rec : [];
      if (!rec.some((r) => r && r.v96)) return;
      $$('.k-v92rule, #v92ctyrule').forEach((box) => {
        const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
        const hits = [];
        while (tw.nextNode()) hits.push(tw.currentNode);
        hits.forEach((n) => { let v = n.nodeValue || ''; OLD_MAIN.forEach(([a, b]) => { if (v.indexOf(a) >= 0) v = v.split(a).join(M(b, b)); }); if (v !== n.nodeValue) n.nodeValue = v; });
        $$('p, li', box).forEach((el) => {
          if (el.getAttribute('data-v96') || !OLD_FLAT.test(el.textContent || '')) return;
          el.setAttribute('data-v96', '1');
          el.textContent = M('この商品は、通関統計と規制のひな形のデータがありません。国ごとの差は、この商品の HS・単価・保存条件から付けた点（書類の判断の表で当たる手続き・HS から分かる関税・運賃と日数）と、STANDAGE が商談したバイヤーの数・拠点の開設の状況で付いています（下の「国ごとの点数の内訳」で確かめられます）。',
            'This product has no customs statistics or regulation template. Country differences come from points based on its HS, unit price and storage (procedures in the document decision table, duty known from the HS, freight and days), plus STANDAGE buyer counts and base status (see the score breakdown below).');
        });
      });
    } catch (e) { warn('rule', e); }
  }
  function decoCty() {
    try {
      if (locked() || curKey() !== 'cty' || !V()) return;
      const s = store();
      if (!s || !Array.isArray(s.rec) || !s.rec.length) return;
      cards(s.rec);
      allBox(s);
      ruleText(s);
    } catch (e) { warn('cty', e); }
  }

  /* ───── No.515・No.508 規制の AI 詳細調査の結果 ───── */
  const regSt = (c) => { try { return typeof regStore === 'function' ? regStore()[c] : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const regTxt = (c) => { try { return typeof regKbTxt === 'function' ? String(regKbTxt(c) || '') : ''; } catch (e) { return ''; } }; // eslint-disable-line no-undef
  const PN = (p) => { try { return (PROV[p] && PROV[p].short) || p; } catch (e) { return p; } }; // eslint-disable-line no-undef
  function genWhy(st) {
    const x = (st && st.r10w) || {};
    const R = window.__v2192r10w;
    let why = '';
    try { why = R && typeof R.reasonShort === 'function' ? R.reasonShort(x) : ''; } catch (e) { why = ''; }
    if (x.web && !x.n) why = M('Web 検索に対応した AI（' + PN(x.prov) + '）に頼みましたが、検索の結果（出典）が返ってきませんでした', 'The web-capable AI (' + PN(x.prov) + ') returned no search results (sources)');
    if (!why) why = M('Web 検索の結果（出典）がありません', 'No web search results (sources)');
    return why;
  }
  function rtLine(st) {
    const t = st && st.v96rt;
    if (!t) return '';
    const s2 = t.second || {};
    return t.ok ? M('1回目は Web 検索で確かめられなかったため、自動でもう一度調べました（2回目：Web 検索あり・出典 ' + (s2.n || 0) + '件）。', 'The first attempt could not be checked by web search, so it retried automatically (2nd attempt: web search used, ' + (s2.n || 0) + ' source(s)).')
      : M('自動で1回、Web 検索つきで調べ直しましたが、' + (s2.why === 'fallback' ? '同じく検索に対応した AI がエラーになりました' : s2.why === 'error' ? 'エラーになりました' : s2.web && !s2.n ? '出典が返りませんでした' : 'Web 検索で確かめられませんでした') + '。少し時間をおいてから、もう一度調べてください。',
        'It retried once automatically with web search, but ' + (s2.why === 'fallback' ? 'the web-capable AI failed again' : s2.why === 'error' ? 'it failed' : 'no sources came back') + '. Please try again a little later.');
  }
  function srcLis(c, k) {
    return V().srcOf(c, k).filter((l) => /^https:\/\//.test(l.u)).map((l) => '<li><a href="' + E(l.u) + '" target="_blank" rel="noopener noreferrer">' + E(l.t) + ' ↗</a></li>').join('');
  }
  function unkHtml(c, secs, gen) {
    const L = secs.filter((x) => x.unk || x.miss || gen);
    if (!L.length) return '';
    const it = (x, i) => {
      const st = x.miss ? M('見出しがありません（答えが無い）', 'heading missing (no answer)') : x.unk ? M('確認できませんでした', 'could not be confirmed') : M('答えはあるが出典なし（目安）', 'answered without sources (estimate)');
      const q = V().askOf(c, x.k);
      return '<li class="' + (x.unk || x.miss ? 'unk' : 'est') + '"><details' + (i === 0 ? ' open' : '') + '><summary><b>' + E(x.mk + ' ' + V().secNm(x.k)) + '</b><span class="v96reg-st">' + E(st) + '</span></summary>' +
        '<div class="v96reg-how"><small>' + E(M('確かめ先：', 'Where to check: ')) + '</small><ul>' + srcLis(c, x.k) + '</ul>' +
        '<small>' + E(M('輸入者への質問（英語）：', 'Question to the importer (English): ')) + '</small><p class="v96reg-q">' + E(q) + '</p>' +
        '<button type="button" class="btn g v96reg-cp" data-v96q="' + E(x.k) + '" data-v96qc="' + E(c) + '">' + E(M('📋 この質問をコピー', '📋 Copy this question')) + '</button></div></details></li>';
    };
    const nU = L.filter((x) => x.unk || x.miss).length;
    return '<div class="v96reg-unk"><b>' + E(gen ? M('項目ごとの確かめ方（' + (nU ? '確認できなかった ' + nU + '件を先に' : 'どの項目も出典なし') + '）', 'How to check each item (' + (nU ? nU + ' not confirmed, first' : 'no item has sources') + ')')
      : M('確認できなかった ' + nU + '件と、確かめ方', nU + ' item(s) not confirmed, and how to check them')) + '</b><ol>' +
      L.sort((a, b) => (b.unk || b.miss ? 1 : 0) - (a.unk || a.miss ? 1 : 0)).map(it).join('') + '</ol>' +
      '<button type="button" class="btn g" data-v96qall="' + E(c) + '" data-v96ks="' + E(L.map((x) => x.k).join(',')) + '">' + E(M('📋 質問をまとめてコピー（英語）', '📋 Copy all questions (English)')) + '</button></div>';
  }
  function paintReg(c) {
    try {
      if (!V()) return;
      const o = document.getElementById('regaiO');
      if (!o || $('.spin', o) || $('.v96reg-busy', o)) return;
      const st = regSt(c);
      if (!st || !st.h) return;
      const x = st.r10w || null;
      const gen = !!x && !(x.web && x.n > 0);
      const secs = V().secs(regTxt(c));
      const unkN = secs.filter((s) => s.unk).length;
      const key = [c, st.ts || '', gen ? 1 : 0, unkN, st.v96rt ? st.v96rt.at : 0, V().lang()].join('|');
      const old = $('.v96reg-top', o);
      if (old && old.getAttribute('data-v96sig') === key && o.firstElementChild === old) return;
      if (old) old.remove();
      let h = '';
      if (gen) {
        h = '<div class="v96reg-top v96reg-gen" role="alert" data-noi18n="1" data-v96sig="' + E(key) + '"><b class="v96reg-t">' + E(M('⚠ この結果は、AI の一般的な知識による下書きです（Web 検索で裏取りできていません）', '⚠ This result is a draft from the AI’s general knowledge (not verified by web search)')) + '</b>' +
          '<p>' + E(M('理由：', 'Why: ') + genWhy(st) + M('。', '.')) + '</p>' +
          (rtLine(st) ? '<p>' + E(rtLine(st)) + '</p>' : '') +
          '<p>' + E(M('出典が無いため、下の関税率・登録の要否・書類は「確かめる前の目安」です。そのまま見積・出荷の判断に使わず、下の確かめ先と輸入者への質問で確かめてください。', 'Without sources, the duty rates, registrations and documents below are estimates to be checked. Do not use them as-is for quotes or shipping; check them with the sources and importer questions below.')) + '</p>' +
          '<div class="v96reg-act"><button type="button" class="btn" data-v96rerun="' + E(c) + '">' + E(M('🔄 Web 検索つきでもう一度調べる', '🔄 Research again with web search')) + '</button></div>' +
          unkHtml(c, secs, true) + '</div>';
        V().n.gen++;
      } else {
        const ok = st.v96rt && st.v96rt.ok ? '<p class="v96reg-okl">' + E('ℹ ' + rtLine(st)) + '</p>' : '';
        const uk = unkN ? unkHtml(c, secs, false) : '';
        if (ok || uk) h = '<div class="v96reg-top v96reg-ok" data-noi18n="1" data-v96sig="' + E(key) + '">' + ok + uk + '</div>';
      }
      if (h) o.insertAdjacentHTML('afterbegin', h);
      // 21.94 の「今回は Web検索をしていません」の帯は、同じことを先頭の欄で言うので重ねない
      $$('#regbody .v54ask-wb.r10w-why:not(.v54ask-wb-s)').forEach((b) => b.classList.toggle('v96-dup', gen));
    } catch (e) { warn('reg', e); }
  }
  if (V()) V().paintReg = paintReg;
  // 規制の画面の「🧭 調べ方と次の一歩」の 4 に、前回の AI 詳細調査の状態を書く
  function step4() {
    try {
      if (curKey() !== 'ops:reg') return;
      const box = document.getElementById('rO');
      const nx = box && $('.v95reg-next', box);
      if (!nx) return;
      const rc = document.getElementById('rC');
      const c = rc ? String(rc.value || '') : '';
      const li = $$('ol.v95reg-ol > li', nx)[3];
      if (!li || !c) return;
      const st = regSt(c);
      const x = st && st.r10w;
      let t = '';
      if (st && st.h && x) t = (x.web && x.n > 0) ? M('前回の AI 詳細調査（' + (st.ts || '') + '）：Web 検索あり・出典 ' + x.n + '件', 'Last AI research (' + (st.ts || '') + '): web search used, ' + x.n + ' source(s)')
        : M('前回の AI 詳細調査（' + (st.ts || '') + '）は、Web 検索で裏取りできていません（一般知識の下書き）。もう一度調べるか、結果の「確かめ方」で確かめてください。', 'The last AI research (' + (st.ts || '') + ') was not verified by web search (general-knowledge draft). Run it again or follow “How to check” in the result.');
      let sm = $('.v96reg-s4', li);
      if (!t) { if (sm) sm.remove(); return; }
      if (!sm) { sm = document.createElement('small'); sm.className = 'v96reg-s4'; sm.setAttribute('data-noi18n', '1'); const btns = $('.v95reg-btns', li); if (btns) li.insertBefore(sm, btns); else li.appendChild(sm); }
      if (sm.textContent !== t) sm.textContent = t;
      sm.classList.toggle('gen', !(x.web && x.n > 0));
    } catch (e) { warn('s4', e); }
  }

  /* ───── クリック（委譲） ───── */
  async function copyText(s) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(s); return true; } } catch (e) { /* 次の手 */ }
    try { const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.className = 'v96-ta'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return !!ok; } catch (e) { return false; }
  }
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target : null;
    if (!t || !V()) return;
    const rr = t.closest('[data-v96rerun]');
    if (rr) {
      e.preventDefault();
      const c = rr.getAttribute('data-v96rerun');
      try { if (typeof regAIRun === 'function') regAIRun(c); } catch (x) { warn('rerun', x); } // eslint-disable-line no-undef
      return;
    }
    const gt = t.closest('[data-v96goto]');
    if (gt) {
      e.preventDefault();
      const c = gt.getAttribute('data-v96goto');
      const d = $$('.v96cty-all details[data-v96c]').find((x) => x.getAttribute('data-v96c') === c);
      if (d) { d.open = true; try { d.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) { d.scrollIntoView(); } }
      return;
    }
    const rs = t.closest('[data-v96rescore]');
    if (rs) {
      e.preventDefault();
      rs.disabled = true;
      try { if (typeof ctyRun === 'function') Promise.resolve(ctyRun(false)).catch((x) => warn('rescore', x)); } catch (x) { warn('rescore', x); } // eslint-disable-line no-undef
      return;
    }
    const q1 = t.closest('[data-v96q]');
    const qa = t.closest('[data-v96qall]');
    if (q1 || qa) {
      e.preventDefault();
      let txt = '';
      if (q1) txt = V().askOf(q1.getAttribute('data-v96qc'), q1.getAttribute('data-v96q'));
      else {
        const c = qa.getAttribute('data-v96qall');
        const ks = String(qa.getAttribute('data-v96ks') || '').split(',').filter(Boolean);
        txt = 'Dear importer,\n\nWe are preparing to export to you. Could you please confirm the following?\n\n' + ks.map((k, i) => (i + 1) + ') ' + V().askOf(c, k)).join('\n') + '\n\nThank you very much.';
      }
      window.__v96lastCopy = txt;
      copyText(txt).then((ok) => toast0(ok ? M('輸入者への質問をコピーしました', 'Copied the question to the importer') : M('コピーできませんでした。文面を選んでコピーしてください', 'Could not copy. Select the text and copy it')));
    }
  }, false);

  /* ───── 描き直しに追いつく ───── */
  function deco() {
    decoCty();
    step4();
    try { const c = window.V54ASK && V54ASK.c; if (c && document.getElementById('regaiO')) paintReg(c); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
  }
  if (RD && typeof RD.after === 'function') {
    const a0 = RD.after;
    RD.after = function () { const r = a0.apply(this, arguments); try { deco(); } catch (e) { warn('after', e); } return r; };
  }
  try {
    let tm = 0;
    new MutationObserver(() => { if (locked()) return; clearTimeout(tm); tm = setTimeout(deco, 150); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
  setTimeout(deco, 0);
})();
