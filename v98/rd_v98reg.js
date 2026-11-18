/* 21.98 reg：刷新版の層（見せ方）。中身は logic_v2198reg.js（window.V98REG）
   No.518 規制を調べる画面の先頭に「医療機器かどうか」（判定・理由・選び直しのボタン）を出す。
          規制の AI 詳細調査の結果（前の調査の控えを含む）で、医療機器ではない商品には、医療機器の手続きの行を隠し、隠したことを書く。
   インラインの onclick・style は使わない（CSP）。外から来た文字（AI の文・本人の答え）はエスケープする。 */
(function () {
  'use strict';
  const RD = window.RDX;
  const V = () => window.V98REG || null;
  if (window.__v98regRd) return;
  window.__v98regRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => { const v = V(); return v ? v.M(ja, en, zh, es) : ja; };
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf('rd ' + k, e); } catch (x) { /* 記録だけ */ } };
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const locked = () => { try { return RD && RD.locked ? !!RD.locked() : document.body.classList.contains('locked'); } catch (e) { return false; } };

  /* ───── 規制を調べる：医療機器かどうか ───── */
  function mdBox() {
    const v = V(); if (!v) return '';
    const p = v.prod();
    if (!v.showMd(p)) return '';
    const m = v.md(p);
    const head = m.v === 'no' ? M('医療機器ではない', 'Not a medical device', '不是医疗器械', 'No es un dispositivo médico')
      : m.v === 'yes' ? M('医療機器', 'Medical device', '医疗器械', 'Dispositivo médico')
        : M('まだ決まっていません（医療機器として表示中）', 'Not decided yet (shown as a medical device)', '尚未确定（按医疗器械显示）', 'Aún sin decidir (se muestra como dispositivo médico)');
    const body = m.v === 'no'
      ? M('医療機器の手続き（ISO 13485・医療機器の製品登録・販売業の許可・医療機器の輸出証明など）は、規制の表・販売先分析・営業資料・書類・AI 相談に出しません。', 'Medical-device procedures (ISO 13485, device registration, dealer licences, medical-device export certificates, etc.) are not shown in the regulation table, market analysis, sales materials, documents or AI chat.', '规制表、目标市场分析、营销资料、文件和AI咨询中都不显示医疗器械的手续（ISO 13485、医疗器械注册、经营许可、医疗器械出口证明等）。', 'Los trámites de dispositivos médicos (ISO 13485, registro, licencias, certificados de exportación, etc.) no se muestran en la tabla de normativa, el análisis de mercados, los materiales de venta, los documentos ni el chat de IA.')
      : m.v === 'yes'
        ? M('医療機器として、相手国でのクラス（リスクの区分）と、登録・許可の手続きを確かめてください。クラスは国ごとに決まります。', 'As a medical device, confirm the class (risk category) and the registration and licensing procedures in each destination. The class is decided country by country.', '作为医疗器械，请确认目的国的分类（风险等级）及注册、许可手续。分类由各国决定。', 'Como dispositivo médico, confirme la clase (categoría de riesgo) y los trámites de registro y licencias en cada destino. La clase la decide cada país.')
        : M('カテゴリー「医療・衛生用品」だけでは決められないため、いまは医療機器として手続きを出しています。医療機器でなければ「医療機器ではない」を押してください（一般のマスク・除菌剤・ウェットティッシュなどは、医療機器にならないことが多いです・国によるため要確認）。', 'The category “Medical & hygiene products” alone cannot decide this, so procedures are shown as for a medical device. If it is not a medical device, press “Not a medical device” (general masks, disinfectants and wet wipes are often not medical devices; depends on the country, to be confirmed).', '仅凭“医疗・卫生用品”类别无法判断，目前按医疗器械显示手续。如不是医疗器械，请点“不是医疗器械”（一般口罩、消毒剂、湿巾等多数不属于医疗器械；因国而异，待确认）。', 'La categoría «productos médicos y de higiene» no basta para decidirlo, así que se muestran los trámites de dispositivo médico. Si no lo es, pulse «No es un dispositivo médico» (mascarillas comunes, desinfectantes y toallitas suelen no serlo; depende del país, por confirmar).');
    const cur = (m.why === 'btn') ? m.v : '';
    const btn = (val, ja, en, zh, es) => '<button type="button" class="btn' + (cur === val ? '' : ' g') + '" data-v98mdset="' + E(val) + '"' + (cur === val ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + E(M(ja, en, zh, es)) + '</button>';
    return '<div class="v98reg-md ' + E(m.v) + '" data-v98md="' + E(m.v + '|' + m.why) + '" data-noi18n="1" role="note">' +
      '<p class="v98reg-mdh"><b>' + E(M('医療機器かどうか', 'Medical device?', '是否为医疗器械', '¿Dispositivo médico?')) + '：' + E(head) + '</b>' +
      '<span class="v98reg-why">' + E(M('決め手：', 'Based on: ', '依据：', 'Según: ')) + E(v.mdWhyTxt(m)) + '</span></p>' +
      '<p class="v98reg-mdb">' + E(body) + '</p>' +
      '<div class="v98reg-btns">' + btn('no', '医療機器ではない', 'Not a medical device', '不是医疗器械', 'No es dispositivo médico') + btn('yes', '医療機器です', 'It is a medical device', '是医疗器械', 'Es dispositivo médico') +
      (m.why === 'btn' ? btn('', '自動の判定に戻す', 'Back to automatic', '恢复自动判断', 'Volver a automático') : '') + '</div></div>';
  }
  function paintReg() {
    try {
      if (curKey() !== 'ops:reg') return;
      const o = document.getElementById('rO');
      if (!o) return;
      const h = mdBox();
      const old = $('.v98reg-md', o);
      if (!h) { if (old) old.remove(); return; }
      const v = V(), m = v.md(v.prod());
      if (old && old.getAttribute('data-v98md') === m.v + '|' + m.why && old.getAttribute('data-v98lang') === v.lang()) return;
      const tmp = document.createElement('div'); tmp.innerHTML = h;
      const box = tmp.firstElementChild;
      box.setAttribute('data-v98lang', v.lang());
      if (old) old.replaceWith(box); else o.insertAdjacentElement('afterbegin', box);
    } catch (e) { warn('reg', e); }
  }

  /* ───── 規制の AI 詳細調査：医療機器ではない商品は、医療機器の手続きの行を隠す ───── */
  function paintAI() {
    try {
      const o = document.getElementById('regaiO');
      if (!o) return;
      const v = V(); if (!v) return;
      const p = v.prod(); const m = v.md(p);
      const sig = m.v + '|' + (o.textContent || '').length;
      if (o.getAttribute('data-v98ai') === sig) return;
      // 前に隠した分を戻す（判定が変わったときのため）
      $$('span[data-v98hid]', o).forEach((s) => { while (s.firstChild) s.parentNode.insertBefore(s.firstChild, s); s.remove(); });
      $$('.v98reg-hide', o).forEach((x) => x.classList.remove('v98reg-hide'));
      $$('.v98reg-ainote', o).forEach((x) => x.remove());
      let n = 0;
      if (m.v === 'no') { // 医療機器ではない商品。隠すのは医療機器の手続きの行だけ（カテゴリーを変える前に調べた控えも）
        // AI の文は改行（<br>）で行が分かれる。行（文字と文字の飾りのまとまり）ごとに見て、医療機器の手続きの行だけを隠す
        const INL = /^(B|STRONG|EM|I|SPAN|A|SMALL|CODE|SUB|SUP|U|MARK)$/;
        const els = [o].concat($$('*', o)).filter((el) => !INL.test(el.tagName) && el.tagName !== 'BR' && !el.closest('.v98reg-ainote'));
        els.forEach((el) => {
          let grp = [];
          const flush = (term) => {
            const g = grp; grp = [];
            if (!g.length) return;
            const t = g.map((x) => x.textContent || '').join('').trim();
            if (!t || v.tags(t).indexOf('md') < 0 || v.allowed(p, t)) return;
            const s = document.createElement('span');
            s.setAttribute('data-v98hid', '1');
            s.className = 'v98reg-hide';
            el.insertBefore(s, g[0]);
            g.forEach((x) => s.appendChild(x));
            if (term && term.tagName === 'BR') term.classList.add('v98reg-hide');
            n++;
          };
          Array.from(el.childNodes).forEach((nd) => {
            if (nd.nodeType === 3 || (nd.nodeType === 1 && INL.test(nd.tagName))) grp.push(nd);
            else if (nd.nodeType === 1) flush(nd);
          });
          flush(null);
        });
      }
      if (n) {
        const note = document.createElement('p');
        note.className = 'v98reg-ainote';
        note.setAttribute('data-noi18n', '1');
        note.textContent = M('この商品は医療機器ではないため、調べた結果のうち医療機器の手続きの行（' + n + '件）を隠しました（調査の控えは残しています。「規制を調べる」の「医療機器かどうか」を変えると出ます）。', 'This product is not a medical device, so ' + n + ' line(s) about medical-device procedures in the research were hidden (the research record is kept; change “Medical device?” in Check regulations to show them).', '本商品不是医疗器械，因此隐藏了调查结果中关于医疗器械手续的 ' + n + ' 行（调查记录仍保留；在“查询法规”中更改“是否为医疗器械”即可显示）。', 'Este producto no es un dispositivo médico, así que se ocultaron ' + n + ' línea(s) sobre trámites de dispositivos médicos (el registro se conserva; cambie «¿Dispositivo médico?» en Consultar normativa para verlas).');
        o.insertAdjacentElement('afterbegin', note);
      }
      o.setAttribute('data-v98ai', m.v + '|' + (o.textContent || '').length);
    } catch (e) { warn('ai', e); }
  }

  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('[data-v98mdset]') : null;
    if (!t || !V()) return;
    e.preventDefault();
    const val = t.getAttribute('data-v98mdset') || '';
    if (!V().setMd(val)) return;
    try { if (typeof rReg === 'function' && document.getElementById('rC')) rReg(); else if (typeof render === 'function') render(); } catch (x) { warn('rerender', x); } // eslint-disable-line no-undef
    try { if (typeof toast === 'function') toast(val === 'no' ? M('「医療機器ではない」にしました。医療機器の手続きを外しました', 'Set to “not a medical device”. Medical-device procedures were removed', '已设为“不是医疗器械”，已去掉医疗器械的手续', 'Marcado como «no es dispositivo médico». Se quitaron los trámites de dispositivos médicos') : val === 'yes' ? M('「医療機器」にしました', 'Set to “medical device”', '已设为“医疗器械”', 'Marcado como «dispositivo médico»') : M('自動の判定に戻しました', 'Back to automatic judgement', '已恢复自动判断', 'Vuelto al juicio automático')); } catch (x) { /* 無視 */ } // eslint-disable-line no-undef
    setTimeout(deco, 0);
  }, false);

  function deco() { if (locked()) return; paintReg(); paintAI(); }
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
