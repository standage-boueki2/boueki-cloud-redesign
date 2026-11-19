/* 21.99 cty：刷新版の層（見せ方）。中身は logic_v2199cty.js（window.V99CTY）
   No.517 販売先国：② 分析結果の見出しのすぐ下に「前回の分析との比較」（いつも出す。前回が無いときも、その旨を出す）。
          表の国の行のすぐ下（と、おすすめのカード）に、その国の「前回 → 今回」の点と、どの観点が何点・何の入力／データで動いたか。
          別の商品の分析と同じ点になった国は、同じになった理由。競合が「未評価」のときは、なぜか・どうすれば評価できるか（出どころつき）。
   No.549 販売先国：進出希望国を「希望なし（指定なし）」と答えた商品は、その旨と、候補国の選び方を出す。
   インラインの onclick・style は使わない（CSP）。外から来た文字（国名・商品名）はエスケープする。 */
(function () {
  'use strict';
  const RD = window.RDX;
  const V = () => window.V99CTY || null;
  if (window.__v99ctyRd) return;
  window.__v99ctyRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => { const v = V(); return v ? v.M(ja, en, zh, es) : ja; };
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf('rd ' + k, e); } catch (x) { /* 記録だけ */ } };
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : (typeof cur !== 'undefined' ? cur : ''); } catch (e) { return ''; } }; // eslint-disable-line no-undef
  const locked = () => { try { return RD && RD.locked ? !!RD.locked() : document.body.classList.contains('locked'); } catch (e) { return false; } };
  const store = () => { try { return typeof ctyStore === 'function' ? ctyStore() : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const ten = () => { try { return (typeof TEN !== 'undefined' && TEN) ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const nmC = (c) => { try { return window.V96CTY && V96CTY.ctyNm ? V96CTY.ctyNm(c) : c; } catch (e) { return c; } }; // eslint-disable-line no-undef
  const SEP = () => M('・', ', ', '、', ', ');
  const sgn = (d) => (d == null ? '' : d > 0 ? '+' + d : String(d));
  const pt = (v) => (v == null ? M('未評価', 'n/a', '未评价', 'sin evaluar') : String(v));

  // 国ごとの「前回 → 今回」の1行（短い版：カード用）と、理由の並び（表の行の下用）
  function axTxt(ch) { return ch.ax.map((a) => a.nm + ' ' + pt(a.from) + '→' + pt(a.to) + (a.d != null ? '（' + sgn(a.d) + '）' : '')).join(SEP()); }
  function moveTxt(ch) { return M('前回 ', 'Last ', '上次 ', 'Anterior ') + pt(ch.from) + ' → ' + M('今回 ', 'now ', '本次 ', 'ahora ') + pt(ch.to) + (ch.d ? '（' + sgn(ch.d) + M('点', ' pts', '分', ' pts') + '）' : ''); }
  let TWMANY = {};
  function rowHtml(c, s, twins, cw) {
    const v = V();
    const ch = v.chgOf(c, s);
    const parts = [];
    if (ch && !ch.newC && !ch.goneC) {
      if (ch.d || ch.ax.length) {
        const why = v.causeOf(ch).slice(0, 5);
        parts.push('<p class="v99cty-mv"><b>' + E(M('前回の分析からの変化：', 'Change since last analysis: ', '与上次分析相比：', 'Cambio desde el último análisis: ')) + '</b>' + E(moveTxt(ch)) +
          (ch.ax.length ? '<span class="v99cty-ax">' + E(axTxt(ch)) + '</span>' : '') + '</p>' +
          (why.length ? '<ul class="v99cty-why">' + why.map((w) => '<li>' + E(w) + '</li>').join('') + '</ul>' : ''));
      } else {
        parts.push('<p class="v99cty-mv same">' + E(M('前回の分析と同じ点です（' + pt(ch.to) + '点・市場性・規制・競合・拠点も同じ）', 'Same as the last analysis (' + pt(ch.to) + ' pts; all 4 aspects unchanged)', '与上次分析相同（' + pt(ch.to) + '分・4个观点均未变）', 'Igual que el último análisis (' + pt(ch.to) + ' pts)')) + '</p>');
      }
    } else if (ch && ch.newC) {
      parts.push('<p class="v99cty-mv">' + E(M('前回の分析では候補国に無かった国です（今回 ' + pt(ch.to) + '点）', 'Was not a candidate in the last analysis (now ' + pt(ch.to) + ' pts)', '上次分析中不是候选国（本次 ' + pt(ch.to) + '分）', 'No era candidato en el último análisis (ahora ' + pt(ch.to) + ')')) + '</p>');
    }
    (twins || []).forEach((tw) => {
      const many = TWMANY[tw.item];
      parts.push('<p class="v99cty-tw"><b>' + E(M('同じ点の商品：', 'Same score as: ', '同分的商品：', 'Misma puntuación que: ')) + '</b>' + E(M('「' + tw.item + '」も' + nmC(c) + 'が ' + tw.t + '点です。', '“' + tw.item + '” also scores ' + tw.t + ' for ' + nmC(c) + '.', '“' + tw.item + '”在' + nmC(c) + '也是 ' + tw.t + '分。', '«' + tw.item + '» también tiene ' + tw.t + ' en ' + nmC(c) + '.')) +
        (many ? E(M('同じになった理由は、上の「前回の分析との比較」の欄にまとめています。', ' The reasons are summarised in “Comparison with the last analysis” above.', '相同的原因汇总在上方“与上次分析的比较”栏中。', ' Las razones se resumen arriba.')) : '') + '</p>' +
        (!many && tw.why.length ? '<ul class="v99cty-why">' + tw.why.slice(0, 5).map((w) => '<li>' + E(w) + '</li>').join('') + '</ul>' : ''));
    });
    if (cw && cw.k === 'nocty') parts.push('<p class="v99cty-cw"><b>' + E(M('競合が未評価の理由：', 'Why competition is not rated: ', '竞争未评价的原因：', 'Por qué la competencia no se evalúa: ')) + '</b>' + E(cw.why) + '</p>');
    return parts.join('');
  }
  function sumHtml(s, twAll) {
    const v = V(), t = ten();
    const h = Array.isArray(s.v97h) ? s.v97h : [];
    const L = [];
    const rec = (s.rec || []).filter(Boolean);
    if (h.length >= 2) {
      const a = h[h.length - 2];
      const cat = a && a.v98src && a.v98src.v99cat ? M('・カテゴリーが違う登録', '; registered under a different category', '・类别不同的登记', '; con otra categoría') : '';
      const src = a && a.v98src ? M('（別の登録「' + String(a.v98src.item || '').slice(0, 30) + '」' + cat + 'の分析と比べています）', ' (compared with the analysis of another registration “' + String(a.v98src.item || '').slice(0, 30) + '”' + cat + ')', '（与另一登记“' + String(a.v98src.item || '').slice(0, 30) + '”' + cat + '的分析相比）', ' (comparado con otro registro «' + String(a.v98src.item || '').slice(0, 30) + '»' + cat + ')') : '';
      const moved = rec.map((r) => v.chgOf(r.c, s)).filter((ch) => ch && !ch.newC && !ch.goneC && (ch.d || ch.ax.length));
      const fresh = rec.map((r) => v.chgOf(r.c, s)).filter((ch) => ch && ch.newC);
      L.push('<p>' + E(M('前回の分析（' + String((a && a.t) || '') + '）と比べました', 'Compared with the last analysis (' + String((a && a.t) || '') + ')', '已与上次分析（' + String((a && a.t) || '') + '）比较', 'Comparado con el último análisis (' + String((a && a.t) || '') + ')')) + E(src) + '：' +
        (moved.length ? '<b>' + E(M(moved.length + 'か国の点が変わりました', moved.length + ' countries changed', moved.length + '个国家的分数有变化', 'cambiaron ' + moved.length + ' países')) + '</b>（' + E(moved.slice(0, 6).map((ch) => nmC(ch.c) + ' ' + pt(ch.from) + '→' + pt(ch.to)).join(SEP())) + '）' : '<b>' + E(M('各国の点は前回と同じです', 'all scores are the same', '各国分数与上次相同', 'todas las puntuaciones son iguales')) + '</b>') +
        (fresh.length ? E(M('。前回に無かった国：', '. New candidates: ', '。上次没有的国家：', '. Nuevos: ') + fresh.map((ch) => nmC(ch.c)).join(SEP())) : '') + '</p>');
      const ver = moved.map((ch) => ch.ver).find(Boolean);
      if (ver) L.push('<p class="v99cty-ver">' + E(M('前回の分析はアプリの版 ' + ver.from + '、今回は ' + ver.to + ' です。その間に点の決め方を直した分も動いています：', 'The last analysis was made with app version ' + ver.from + ', this one with ' + ver.to + '. Score rules changed in between: ', '上次分析使用版本 ' + ver.from + '，本次为 ' + ver.to + '。期间调整了评分方法：', 'El análisis anterior usó la versión ' + ver.from + ' y este la ' + ver.to + '. Cambios en el cálculo: ') + ver.notes.join(M('／', '; ', '／', '; '))) + '</p>');
      L.push('<p class="v99cty-hint">' + E(M('国ごとに、どの観点（市場性・規制・競合・拠点）が何点、何の入力・データで動いたかは、下の表の各国の行のすぐ下に出しています。', 'For each country, which aspect moved by how much and why is shown right under its row in the table below.', '各国哪个观点变动了多少、因何变动，显示在下表各国行的正下方。', 'Para cada país, qué aspecto cambió y por qué se muestra debajo de su fila en la tabla.')) + '</p>');
    } else {
      L.push('<p>' + E(M('比べる前回の分析は、まだありません（この商品で初めての分析です）。次に分析すると、ここと、下の表の各国の行のすぐ下に、点の動きと理由が出ます。', 'There is no earlier analysis to compare with yet (first analysis of this product). Next time, score changes and reasons appear here and under each country row.', '还没有可比较的上次分析（该商品的首次分析）。下次分析时，分数变化和原因会显示在这里和下表各国行的正下方。', 'Aún no hay un análisis anterior para comparar. La próxima vez, los cambios aparecerán aquí y bajo cada país.')) + '</p>');
    }
    if (t && t.targetsNone && !(Array.isArray(t.targets) && t.targets.length)) {
      L.push('<p class="v99cty-none">' + E(M('進出希望国：希望なし（指定なし）。候補国は、商品の HS・規制・通関統計・STANDAGE 拠点から選びました（国は「① 候補国」で足せます）。', 'Target countries: no preference (not specified). Candidates were chosen from the HS, regulations, customs statistics and STANDAGE bases (you can add countries in ① Candidates).', '目标国家：无指定（不限）。候选国根据商品的 HS・法规・海关统计・STANDAGE 据点选出（可在“① 候选国”中添加）。', 'Países objetivo: sin preferencia. Los candidatos se eligieron según el HS, la regulación, las estadísticas y las bases de STANDAGE (puede añadir países en ①).')) + '</p>');
    }
    // この商品の HS の国別の数字を 21.99 で足したとき：出どころ
    try {
      if (t && v.ctAdded && v.ctAdded(t.hs)) L.push('<p class="v99cty-ct">' + E(M('この商品の HS（' + String(t.hs || '') + '）の国別の数字（日本からの輸出・相手国別）は、UN Comtrade の公開の数字（日本の計数は財務省貿易統計）を 2026-11-19 に取り込んだものです。競合（日本勢のシェア）と市場性は、ほかの商品と同じ決め方で、この数字から点を付けています。', 'Per-country figures for this HS (' + String(t.hs || '') + ') are UN Comtrade public figures (Japan: Ministry of Finance trade statistics) imported on 2026-11-19. Competition and market are scored from them the same way as other products.', '该商品 HS（' + String(t.hs || '') + '）的国别数字取自 UN Comtrade 公开数字（日本数据来自财务省贸易统计），于 2026-11-19 导入。竞争与市场性按与其他商品相同的方法计分。', 'Las cifras por país de este HS (' + String(t.hs || '') + ') son datos públicos de UN Comtrade importados el 2026-11-19; se puntúan igual que los demás productos.')) + '</p>');
    } catch (e) { warn('ct', e); }
    // 別の商品と同じ点の国が多いとき：まとめて理由を1回
    Object.keys(TWMANY).forEach((item) => {
      const g = TWMANY[item];
      L.push('<div class="v99cty-twbox"><p><b>' + E(M('別の商品「' + item + '」と、' + rec.length + 'か国中 ' + g.n + 'か国で同じ点です（' + g.cs.slice(0, 10).map(nmC).join('・') + '）', 'Same score as “' + item + '” in ' + g.n + ' of ' + rec.length + ' countries', '与另一商品“' + item + '”在 ' + rec.length + ' 个国家中有 ' + g.n + ' 个同分', 'Misma puntuación que «' + item + '» en ' + g.n + ' de ' + rec.length + ' países')) + '</b></p><p>' + E(M('同じになった理由：', 'Why they are the same: ', '相同的原因：', 'Por qué son iguales: ')) + '</p><ul class="v99cty-why">' + g.why.slice(0, 5).map((w) => '<li>' + E(w) + '</li>').join('') + '</ul></div>');
    });
    // 競合の未評価（理由が同じなら1回だけ）
    const na = rec.filter((r) => r.sc && r.sc.comp == null);
    if (na.length) {
      const cw = v.compWhy(na[0].c, na[0]);
      if (cw && cw.k !== 'nocty') {
        L.push('<div class="v99cty-cwbox"><p><b>' + E(M('競合が「未評価」の国が ' + na.length + 'か国あります（' + na.slice(0, 10).map((r) => nmC(r.c)).join('・') + '）', na.length + ' countries have competition “not rated” (' + na.slice(0, 10).map((r) => nmC(r.c)).join(', ') + ')', '有 ' + na.length + ' 个国家的竞争为“未评价”', na.length + ' países con competencia «sin evaluar»')) + '</b></p>' +
          '<p>' + E(M('なぜ：', 'Why: ', '原因：', 'Por qué: ') + cw.why + M('。', '.', '。', '.')) + '</p>' +
          '<p>' + E(M('どうすれば評価できるか：', 'How to get it rated: ', '如何获得评价：', 'Cómo evaluarla: ') + cw.how + M('。', '.', '。', '.')) + '</p>' +
          '<p class="v99cty-src">' + E(M('データの出どころ：', 'Data source: ', '数据来源：', 'Fuente: ') + cw.src) + '</p></div>');
      }
    }
    return '<div class="v99cty-sum" data-noi18n="1" role="region" aria-label="' + E(M('前回の分析との比較', 'Comparison with the last analysis', '与上次分析的比较', 'Comparación con el análisis anterior')) + '"><p class="v99cty-ttl"><b>' + E(M('📊 前回の分析との比較', '📊 Comparison with the last analysis', '📊 与上次分析的比较', '📊 Comparación con el análisis anterior')) + '</b></p>' + L.join('') + '</div>';
  }
  function sigOf(s) {
    const h = Array.isArray(s.v97h) ? s.v97h : [];
    let tw = '';
    try { tw = (typeof TENS !== 'undefined' && Array.isArray(TENS) ? TENS : []).map((t) => (t && t.ctySel && Array.isArray(t.ctySel.v97h) ? t.ctySel.v97h.length + ':' + ((t.ctySel.v97h[t.ctySel.v97h.length - 1] || {}).at || '') : '')).join(','); } catch (e) { tw = ''; } // eslint-disable-line no-undef
    const t = ten();
    return [s.at || '', h.length, h.length ? h[h.length - 1].at : '', V().lang(), (s.rec || []).map((r) => r && r.c + ':' + (r.sc && r.sc.total)).join(','), tw, t && t.targetsNone ? 1 : 0].join('|');
  }
  function decoCty() {
    try {
      if (locked() || curKey() !== 'cty' || !V()) return;
      const s = store();
      const sec2 = document.getElementById('sec-2');
      if (!s || !Array.isArray(s.rec) || !s.rec.length || !sec2) { $$('.v99cty-sum,.v99cty-chg,.v99cty-tchg').forEach((x) => x.remove()); return; }
      const sig = sigOf(s);
      const twCache = {};
      const twins = (c) => { if (!(c in twCache)) twCache[c] = V().twinOf(c); return twCache[c]; };
      // 同じ商品と3か国以上で同じ点なら、理由は比較の欄に1回だけ
      TWMANY = {};
      try {
        const cnt = {};
        s.rec.forEach((r) => { (twins(r.c) || []).forEach((tw) => { const g = cnt[tw.item] = cnt[tw.item] || { n: 0, cs: [], why: tw.why }; if (g.cs.indexOf(r.c) < 0) { g.n++; g.cs.push(r.c); } }); });
        Object.keys(cnt).forEach((k) => { if (cnt[k].n >= 3) TWMANY[k] = cnt[k]; });
      } catch (e) { warn('twmany', e); }
      // ① 前回の分析との比較（② の見出しのすぐ下）
      let box = $('.v99cty-sum', sec2);
      if (!box || box.getAttribute('data-sig') !== sig) {
        if (box) box.remove();
        const head = $('h3', sec2);
        const anchor = head ? (head.closest('.rw') && head.closest('.rw').parentElement === sec2 ? head.closest('.rw') : head) : null;
        const tmp = document.createElement('div');
        tmp.innerHTML = sumHtml(s);
        box = tmp.firstElementChild;
        box.setAttribute('data-sig', sig);
        if (anchor) anchor.insertAdjacentElement('afterend', box); else sec2.insertAdjacentElement('afterbegin', box);
      }
      // ② 表の国の行のすぐ下
      const tb = $('table', sec2);
      if (tb) {
        const cols = Math.max(1, ($$('thead th', tb).length) || 7);
        $$('tbody tr', tb).forEach((tr) => {
          if (tr.classList.contains('v99cty-chg')) return;
          const ip = $('input[data-ctypick]', tr);
          const c = ip ? String(ip.getAttribute('data-ctypick') || '') : '';
          if (!c) return;
          const nx = tr.nextElementSibling;
          const k = sig + '|' + c;
          if (nx && nx.classList.contains('v99cty-chg')) { if (nx.getAttribute('data-k') === k) return; nx.remove(); }
          const r = s.rec.find((x) => x && x.c === c);
          const cw = r && r.sc && r.sc.comp == null ? V().compWhy(c, r) : null;
          const html = rowHtml(c, s, twins(c), cw);
          if (!html) return;
          const row = document.createElement('tr');
          row.className = 'v99cty-chg';
          row.setAttribute('data-k', k);
          row.setAttribute('data-noi18n', '1');
          row.innerHTML = '<td colspan="' + cols + '"><div class="v99cty-in">' + html + '</div></td>';
          tr.insertAdjacentElement('afterend', row);
        });
      }
      // 表は横に動く（スマホ）。行の下の説明は、見えている幅に収める
      fitRows(tb);
      // おすすめのカード（点の数字の下）
      $$('.k-tiles > .k-card').forEach((cd) => {
        const names = $$('b', cd).map((b) => (b.textContent || '').trim());
        const r = s.rec.find((x) => x && names.indexOf(x.c) >= 0) || s.rec.find((x) => x && names.indexOf(nmC(x.c)) >= 0);
        if (!r) return;
        const ch = V().chgOf(r.c, s);
        const k = sig + '|' + r.c;
        const old = $('.v99cty-tchg', cd);
        if (old && old.getAttribute('data-k') === k) return;
        if (old) old.remove();
        if (!ch || ch.newC || ch.goneC) return;
        const d = document.createElement('div');
        d.className = 'v99cty-tchg' + (ch.d ? (ch.d > 0 ? ' up' : ' dn') : ' same');
        d.setAttribute('data-k', k);
        d.setAttribute('data-noi18n', '1');
        d.textContent = ch.d || ch.ax.length ? moveTxt(ch) + (ch.ax.length ? M('：', ': ', '：', ': ') + axTxt(ch) : '') : M('前回の分析と同じ点', 'Same as last analysis', '与上次分析相同', 'Igual que el análisis anterior');
        const rk = $('.k-ctyrank', cd);
        if (rk) rk.insertAdjacentElement('afterend', d); else cd.appendChild(d);
      });
    } catch (e) { warn('cty', e); }
  }

  function fitRows(tb) {
    try {
      tb = tb || $('#sec-2 table');
      if (!tb) return;
      const sc = tb.closest('.tw') || tb.parentElement;
      const wd = Math.min(sc ? sc.clientWidth : window.innerWidth, window.innerWidth);
      const mx = Math.max(220, Math.min(880, wd - 26)) + 'px';
      $$('.v99cty-in', tb).forEach((d) => { if (d.style.maxWidth !== mx) d.style.maxWidth = mx; });
    } catch (e) { warn('fit', e); }
  }
  window.addEventListener('resize', () => { try { if (curKey() === 'cty') fitRows(); } catch (e) { /* 無視 */ } });
  function deco() { decoCty(); }
  if (RD && typeof RD.after === 'function') {
    const a0 = RD.after;
    RD.after = function () { const r = a0.apply(this, arguments); try { deco(); } catch (e) { warn('after', e); } return r; };
  }
  try {
    let tm = 0;
    new MutationObserver(() => { if (locked() || curKey() !== 'cty') return; clearTimeout(tm); tm = setTimeout(deco, 220); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
  setTimeout(deco, 0);
})();
