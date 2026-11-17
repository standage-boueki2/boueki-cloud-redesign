/* 21.95 reg：刷新版の層（規制を調べる）。今の部品は差し替えず、RDX.after と rReg を包む。中身（データ・判定）は logic_v2195reg.js（window.V95REG）
   No.493 「表で確かめる（国名）」を、すべてのカテゴリーで出す
     原因：rd_v92z9br8b（21.94 r8b）の fixReg が「はじめの設定の次の手順が『規制を調べる』のときだけ」ボタンを置いていた（regNeed）。
           商品の登録や販売先国の手順が残っている商品（UAT の H ペットフード）では、規制の画面を開いてもボタンが出ず、手順を済みにできなかった。
     直し：r8b のボタンが無いときは、同じ見た目・同じ受け口（v92r7b.regOp）のボタンをこの層が出す（次の手順に関係なく・荷主の規制の画面ならどの商品でも）。
           押すと、その国の表へ移り、「規制を調べる」の手順が済みになる（もう済みのときは表へ移るだけ）。
   No.494 必須の件数をそろえる：ひな形の表が「必須の手続きは入っていません」と言い、下の注記が「必須 1件」と言う食い違いを、同じ件数を書いた一文にする
   No.482 「この商品と送り先で確かめる点」に、判定に使った輸送（航空・海上など）と、その出どころを書く（書類の画面と同じ輸送）
   No.508 ひな形の無い国・商材では「🧭 調べ方と次の一歩」を出す（判断の表の行・出どころ・輸入者への質問文・AI・STANDAGE への依頼・表で確かめる）
   No.477 関税を「要確認」にしたとき、関税率の枠に理由を1行（別の品目の税率は出していない） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v95reg) return;
  RD._v95reg = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const V = () => window.V95REG || null;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const warn = (k, e) => { try { console.warn('[rd] v95reg ' + k, e); } catch (x) { /* 無視 */ } };
  const regScreen = () => !locked() && !fwd() && curKey() === 'ops:reg';
  const ctyNm = () => { const rc = $$('select#rC').find(vis) || document.getElementById('rC'); if (!rc) return ''; const o = rc.options && rc.options[rc.selectedIndex]; return String((o && o.textContent) || rc.value || '').trim(); };
  const ctyVal = () => { const rc = $$('select#rC').find(vis) || document.getElementById('rC'); return rc ? String(rc.value || '') : ''; };
  function toast(s) { try { const tt = G('toast'); if (typeof tt === 'function') tt(s); } catch (e) { /* 無視 */ } }

  /* ───── No.493 表で確かめる ───── */
  function regStepDone() {
    try { const N = window.v92r6a && v92r6a.now ? v92r6a.now() : null; const s = N && N.S && N.S.steps ? N.S.steps.find((x) => x.id === 'reg') : null; return !!(s && s.done); } catch (e) { return false; }
  }
  const lbl = () => { const c = ctyNm(); return c ? M('表で確かめる（' + c + '）', 'Review the table (' + c + ')', '查看法规表（' + c + '）', 'Revisar la tabla (' + c + ')') : M('表で確かめる', 'Review the table', '查看法规表', 'Revisar la tabla'); };
  function fixBtn() {
    const s = document.getElementById('sec-0');
    let b = $('.k-v95-regok');
    const other = $('.k-r8b-regok');
    if (!regScreen() || !s || !$('#rO', s) || other) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('button');
      b.type = 'button'; b.className = 'btn k-v95-regok'; b.setAttribute('data-noi18n', '1');
      const h = $('.k-r7b-reghint', s);
      const rc = $('#rC', s);
      const host = h || (rc && (rc.closest('.rw, .g2, p, div') || rc.parentElement)) || null;
      if (host && host !== s && s.contains(host)) host.insertAdjacentElement('afterend', b); else s.insertAdjacentElement('afterbegin', b);
    }
    const done = regStepDone();
    b.classList.toggle('is-done', done);
    setTxt(b, '✓ ' + lbl() + (done ? M('・済み', ' — done', '・已完成', ' — hecho') : ''));
    b.title = done ? M('「規制を調べる」の手順は済みです。押すと、この国の「販売・出荷の前に必要な手続き」の表へ移ります', 'The step “Check regulations” is done. Press to jump to this country’s table of required procedures', '“查法规”步骤已完成。点击跳转到该国的所需手续表', 'El paso «Ver regulaciones» está hecho. Pulse para ir a la tabla de trámites de este país')
      : M('押すと、この国の「販売・出荷の前に必要な手続き」の表へ移り、はじめの設定の「規制を調べる」が済みになります', 'Jumps to this country’s table of required procedures and completes the setup step “Check regulations”', '跳转到该国“销售・出货前所需手续”表，并完成初始设置的“查法规”', 'Va a la tabla de trámites de este país y completa el paso «Ver regulaciones»');
  }
  function regTable() {
    const o = document.getElementById('rO');
    if (!o) return null;
    return $$('.v54r-h', o).find(vis) || $$('p.lbl', o).find((x) => vis(x) && /必要な書類|Required documents/.test(x.textContent || '')) || o;
  }
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.k-v95-regok');
    if (!b) return;
    e.preventDefault();
    try {
      if (!regStepDone()) {
        const T = G('TEN');
        const hasCh = !!(T && T.ctySel && Array.isArray(T.ctySel.chosen) && T.ctySel.chosen.length);
        let msg = '';
        if (!hasCh) msg = M('販売先の国がまだ確定していません。「販売先の国を選ぶ」で国を確定すると、この手順を済みにできます（表はこのまま見られます）', 'Your target countries are not confirmed yet. Confirm them in “Choose target markets” to complete this step (you can still review the table).', '尚未确定销售目标国。在“选择销售目标国”中确定后即可完成本步骤（仍可查看法规表）。', 'Aún no ha confirmado los países de venta. Confírmelos en «Elegir los países de venta» para completar este paso (puede revisar la tabla igualmente).');
        else if (window.v92r7b && typeof v92r7b.regOp === 'function' && v92r7b.regOp()) msg = M('規制を確かめました（はじめの設定の「規制を調べる」が済みになりました）', 'Regulations reviewed (setup step done)', '已确认法规（初始设置的该步骤已完成）', 'Regulaciones revisadas (paso completado)');
        if (msg) { RD.v95reg.last = msg; toast(msg); }
        if (!hasCh) { // 同じ画面の「選んだ国を販売先国に確定する」へ案内する（表へは移らない）
          const cb = $$('button').find((x) => vis(x) && /販売先国に確定|Confirm .*target/i.test(x.textContent || ''));
          if (cb) { try { cb.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) { /* 無視 */ } cb.classList.remove('k-r5c-pulse'); void cb.offsetWidth; cb.classList.add('k-r5c-pulse'); setTimeout(() => { try { cb.classList.remove('k-r5c-pulse'); } catch (x) { /* 無視 */ } }, 3400); return; }
        }
      }
    } catch (x) { warn('regok', x); }
    setTimeout(() => { try { RD.after(); } catch (x) { /* 無視 */ } fixBtn(); const t = regTable(); if (t) { try { t.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) { /* 無視 */ } } }, 60);
  }, false);
  document.addEventListener('change', (e) => { try { if (e.target && e.target.id === 'rC') setTimeout(fixBtn, 0); } catch (x) { /* 無視 */ } }, false);

  /* ───── 規制の表の中（rReg が描いた #rO）を整える ───── */
  const P_ = (cls, html) => '<p class="' + cls + '" data-noi18n="1">' + html + '</p>';
  const regsOf = () => { try { const d = (typeof D !== 'undefined' && D) ? D : null; return d && d.regs ? d.regs : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const L2 = (x) => (lang() === 'ja' ? x[0] : x[1]);
  function ownHtml(x, withLink) {
    const R = V() && V().DUTYFREE ? V().DUTYFREE[x.cc] : null;
    if (!R) return '';
    const nm = x.cc === 'SG' ? M('シンガポール', 'Singapore', '新加坡', 'Singapur') : M('香港', 'Hong Kong', '香港', 'Hong Kong');
    const t = M(nm + 'で関税・物品税がかかるのは、' + L2(R.cats) + 'だけです。この商品（HS ' + x.hs + '）は当たらないため、関税なし（' + L2(R.tax) + '）。',
      'In ' + nm + ', duty applies only to ' + L2(R.cats) + '. This product (HS ' + x.hs + ') is not among them, so no customs duty (' + L2(R.tax) + ').',
      nm + '仅对' + L2(R.cats) + '征收关税・消费税。本商品（HS ' + x.hs + '）不属于这些类别，因此无关税（' + L2(R.tax) + '）。',
      'En ' + nm + ' solo pagan arancel: ' + L2(R.cats) + '. Este producto (HS ' + x.hs + ') no está entre ellos: sin arancel (' + L2(R.tax) + ').');
    return esc(t) + (withLink ? ' ' + esc(M('出どころ', 'Source', '出处', 'Fuente')) + '：<a href="' + esc(R.u) + '" target="_blank" rel="noopener noreferrer">' + esc(L2(R.src)) + ' ↗</a>' : '');
  }
  function dutyNote(box, c) {
    try {
      const regs = regsOf(); const r = regs ? regs[c] : null;
      if (!r || box.querySelector('.v95reg-dn')) return;
      const cell = ((box.querySelector('.g3') || {}).children || [])[1];
      if (!cell) return;
      if (r.v95own) { // 決め D3：関税なし（この商品の HS から）
        cell.insertAdjacentHTML('beforeend', P_('v95reg-dn own', ownHtml(r.v95own, true)));
        return;
      }
      const x = r.v95proxy;
      if (!x) return;
      const est = x.noHs && /推定/.test(String(x.hs || '')) ? String(x.hs).replace(/^.*推定\s*/, '') : '';
      const t = x.noHs
        ? M('この商品の HS コードが' + (est ? '未登録です（品名からの推定 HS ' + est + ' は、ひな形の品目と違います）' : '未登録で、品名からも推定できません') + '。カテゴリーのひな形の品目（' + x.nm + '・HS ' + x.tpl + '）の税率は、この商品の税率とは限らないため出していません。商品の情報で HS コードを登録すると判定できます（要確認）。',
          'This product has no HS code registered' + (est ? ' (the HS estimated from its name, ' + est + ', differs from the template item)' : ' and none can be estimated from its name') + '. The template item’s rate (HS ' + x.tpl + ') may not apply, so it is not shown. Register the HS code in the product details to judge it (to be confirmed).',
          '本商品未登记HS编码' + (est ? '（按品名推定的HS ' + est + ' 与模板品目不同）' : '，也无法按品名推定') + '。类别模板品目（HS ' + x.tpl + '）的税率不一定适用，因此不显示。在商品信息中登记HS编码后即可判断（需确认）。',
          'Este producto no tiene código HS registrado' + (est ? ' (el estimado por el nombre, ' + est + ', difiere de la plantilla)' : ' ni se puede estimar por el nombre') + '. El arancel de la plantilla (HS ' + x.tpl + ') puede no aplicar; no se muestra. Registre el código HS para juzgarlo (por confirmar).')
        : M('この商品（HS ' + x.hs + '）の関税率は、アプリにまだ入っていません。カテゴリーのひな形の品目（' + x.nm + '・HS ' + x.tpl + '）の税率は別の品目のため出していません。相手国の関税率表で確かめてください。',
          'The duty rate for this product (HS ' + x.hs + ') is not in the app yet. The rate of the category template item (HS ' + x.tpl + ') is for a different item, so it is not shown. Check the destination’s tariff schedule.',
          '本商品（HS ' + x.hs + '）的关税率尚未收录。类别模板品目（HS ' + x.tpl + '）的税率属于其他品目，因此不显示。请查阅对方国家的关税税率表。',
          'El arancel de este producto (HS ' + x.hs + ') aún no está en la app. El del producto de la plantilla (HS ' + x.tpl + ') es de otro producto, por eso no se muestra. Consulte el arancel del país de destino.');
      cell.insertAdjacentHTML('beforeend', P_('v95reg-dn', esc(t)));
    } catch (e) { warn('duty', e); }
  }
  /* 決め D3：関税なしにした国で、前の層（v92o の dutyNote・v92ct の sweepMis・v92r3b の sweepDuty）が「別の品目の目安」と書き換えた所を戻す。
     前の層は「印があれば二度とやらない」作り（tr に .v92ct-ref・セルに data-v92r3b）なので、印を付けて止める。v92r3b の掃除（__v92r3bSweeps）の後ろでも呼ばれる */
  function ownSweep() {
    try {
      const regs = regsOf();
      if (!regs) return;
      const own = Object.keys(regs).filter((c) => regs[c] && regs[c].v95own);
      if (!own.length) return;
      // ① 規制の画面の関税率の枠
      const box = document.getElementById('rO'); const c = ctyVal();
      if (box && c && own.indexOf(c) >= 0) {
        const cell = ((box.querySelector('.g3') || {}).children || [])[1];
        if (cell) {
          cell.dataset.v92r3b = '1';
          $$('[data-v92r3b-old]', cell).forEach((el) => { el.textContent = regs[c].duty; el.removeAttribute('data-v92r3b-old'); });
          $$('.v92o-dn', cell).forEach((p) => { if (p.parentNode) p.parentNode.removeChild(p); }); // v92o は #rO を描き直すときだけ付け直す（そのときはこの掃除もまた走る）
        }
      }
      // ② 関税の比較表（商品の画面など）
      $$('.v56tariff-bench tr[data-v56tariff-c]').forEach((tr) => {
        const cc = tr.getAttribute('data-v56tariff-c') || '';
        if (own.indexOf(cc) < 0 || tr.dataset.v95own) return;
        const tc = tr.querySelector('.v56tariff-tc'), lc = tr.querySelector('.v56tariff-lc');
        if (!tc) return;
        const refs = $$('.v92ct-ref:not(.v95reg-own)', tc);
        if (refs.length && tc.dataset.v92r3b) { // v92r3b が数字を「要確認」に書き換えた後：元の数字（注記の「目安：N%」）に戻す
          const m = refs.map((p) => (p.textContent || '').match(/[:：]\s*([\d.]+\s*%)/)).find(Boolean);
          if (m) {
            const lab = /要確認|To be confirmed|to be confirmed|需确认|por confirmar|Por confirmar/;
            const w = document.createTreeWalker(tc, NodeFilter.SHOW_TEXT); let n;
            while ((n = w.nextNode())) { if (refs.some((p) => p.contains(n))) continue; if (lab.test(String(n.nodeValue || ''))) { n.nodeValue = String(n.nodeValue).replace(lab, m[1].replace(/\s/g, '')); break; } }
          }
        }
        refs.forEach((p) => p.parentNode && p.parentNode.removeChild(p));
        if (lc) { $$('.v92ct-tag, .v92ct-ref', lc).forEach((y) => y.parentNode && y.parentNode.removeChild(y)); }
        tc.dataset.v92r3b = '1';
        tc.insertAdjacentHTML('beforeend', '<p class="v92ct-ref v95reg-own" data-noi18n="1">' + ownHtml(regs[cc].v95own, false) + '</p>');
        tr.dataset.v95own = '1';
      });
    } catch (e) { warn('own', e); }
  }
  try { (window.__v92r3bSweeps = window.__v92r3bSweeps || []).push(ownSweep); } catch (e) { /* 無視 */ }
  function modeLine(box) {
    try {
      const pts = box.querySelector('[data-v92pts]');
      if (!pts || pts.querySelector('.v95reg-mode') || !V()) return;
      const x = V().mode(); const nm = V().modeNm(x.m);
      const why = x.from === 'doc' ? M('「書類をつくる」で選んだ輸送', 'the transport chosen in “Create documents”', '在“制作文件”中选择的运输方式', 'el transporte elegido en «Crear documentos»')
        : x.from === 'case' ? M('案件の輸送', 'the transport of the shipment', '案件的运输方式', 'el transporte del envío')
          : x.from === 'prod' ? M('登録の' + x.by + '「' + x.v + '」から', 'from the registered ' + (x.by === '積み地' ? 'port of loading' : x.by === '取引条件' ? 'trade terms' : 'transport') + ' “' + x.v + '”', '根据登记的“' + x.v + '”', 'según lo registrado «' + x.v + '»')
            : M('登録に輸送の情報が無いため、海上として判定', 'no transport registered, so judged as sea freight', '未登记运输方式，按海运判断', 'sin transporte registrado; se juzga como marítimo');
      const sub = pts.querySelector('.v92o-sub');
      const html = P_('v95reg-mode', '<b>' + esc(M('輸送の前提', 'Transport assumed', '运输前提', 'Transporte supuesto')) + '</b>：' + esc(nm) + '（' + esc(why) + esc(M('。「書類をつくる」と同じ判定です', '; same as in “Create documents”', '；与“制作文件”相同', '; igual que en «Crear documentos»')) + '）');
      if (sub) sub.insertAdjacentHTML('afterend', html); else pts.insertAdjacentHTML('afterbegin', html);
    } catch (e) { warn('mode', e); }
  }
  function consist(box) {
    try {
      if (!V()) return;
      const req = V().reqOf(box), N = req.length;
      if (!N) return;
      const names = req.slice(0, 3).map((x) => x.nm).join('・') + (N > 3 ? M(' ほか', ' and others', ' 等', ' y otros') : '');
      const none = box.querySelector('.v92o-none');
      if (none && !none.dataset.v95) {
        none.dataset.v95 = '1';
        none.setAttribute('data-noi18n', '');
        if (/未調査/.test(none.textContent || '')) {
          none.insertAdjacentHTML('beforeend', ' <span class="v95reg-cn">' + esc(M('ただし、書類の判断の表では、この商品とこの国に必須が ' + N + '件 当たります（' + names + '）。下の「この商品と送り先で確かめる点」をご覧ください。',
            'However, the document decision table has ' + N + ' required item(s) for this product and country (' + names + '). See “Points to check” below.', '不过，在文件判断表中，本商品与该国有 ' + N + ' 项必需（' + names + '）。请查看下方“需确认的事项”。', 'Sin embargo, la tabla de documentos indica ' + N + ' requisito(s) obligatorio(s) (' + names + '). Vea «Puntos a revisar» abajo.')) + '</span>');
        } else {
          none.innerHTML = '<b>' + esc(M('ひな形の表（概算）には、この国の必須の手続きの名前は入っていません。', 'The template table (rough guide) lists no mandatory procedure for this country.', '模板表（概算）中没有该国的必需手续名称。', 'La tabla de plantilla (aproximada) no incluye trámites obligatorios para este país.')) + '</b>' +
            esc(M('ただし、書類の判断の表では、この商品とこの国に必須が ' + N + '件 当たります（' + names + '）。下の「この商品と送り先で確かめる点」で確かめてください（要確認）。',
              'However, the document decision table has ' + N + ' required item(s) for this product and country (' + names + '). Check them under “Points to check” below.', '不过，在文件判断表中，本商品与该国有 ' + N + ' 项必需（' + names + '）。请在下方“需确认的事项”中确认。', 'Sin embargo, la tabla de documentos indica ' + N + ' requisito(s) obligatorio(s) (' + names + '). Revíselos en «Puntos a revisar» abajo.'));
        }
      }
      const st = box.querySelector('.v54r-st');
      // 「未調査です」の一文に件数を書いたときは、下の枠には重ねて書かない
      if (st && !st.querySelector('.v95reg-cn') && !(none && none.querySelector('.v95reg-cn'))) {
        const t = (st.textContent || '').replace(/\s+/g, '');
        if (t.indexOf('必須' + N + '件') < 0 && t.indexOf('必須が' + N + '件') < 0) {
          const hasTpl = !!box.querySelector('.v54r-docs .v54r-row:not(.v92o-cond)');
          st.insertAdjacentHTML('beforeend', P_('v95reg-cn', esc(hasTpl
            ? M('このほか、書類の判断の表で必須が ' + N + '件 当たります（' + names + '・下の「この商品と送り先で確かめる点」）。', 'In addition, the document decision table has ' + N + ' required item(s) (' + names + '; see “Points to check” below).', '此外，文件判断表中还有 ' + N + ' 项必需（' + names + '，见下方“需确认的事项”）。', 'Además, la tabla de documentos indica ' + N + ' requisito(s) obligatorio(s) (' + names + '; vea «Puntos a revisar» abajo).')
            : M('書類の判断の表で、必須が ' + N + '件 当たります（' + names + '・下の「この商品と送り先で確かめる点」）。', 'The document decision table has ' + N + ' required item(s) (' + names + '; see “Points to check” below).', '文件判断表中有 ' + N + ' 项必需（' + names + '，见下方“需确认的事项”）。', 'La tabla de documentos indica ' + N + ' requisito(s) obligatorio(s) (' + names + '; vea «Puntos a revisar» abajo).'))));
        }
      }
    } catch (e) { warn('consist', e); }
  }
  function steps(box, c) {
    try {
      if (!V() || box.querySelector('.v95reg-next')) return;
      const none = box.querySelector('.v92o-none');
      if (!V().noTpl(c) && !(none && /未調査/.test(none.textContent || ''))) return;
      const rows = V().rowsOf(box).filter((x) => x.lv !== 'ban');
      const must = rows.filter((x) => x.lv === 'required' || x.lv === 'conditional');
      const chk = rows.filter((x) => x.lv === 'check');
      const lvNm = (k) => k === 'required' ? M('必須', 'Required', '必需', 'Obligatorio') : k === 'conditional' ? M('条件つき', 'Conditional', '有条件', 'Condicional') : M('確かめること', 'To check', '需确认', 'Revisar');
      const li1 = must.length
        ? '<li><b>' + esc(M('判断の表の【必須】【条件つき】' + must.length + '件を、輸入者と分担を決めて確かめる', 'Agree with the importer who handles the ' + must.length + ' required / conditional item(s) from the decision table', '与进口商分工确认判断表中的 ' + must.length + ' 项【必需】【有条件】', 'Acuerde con el importador quién gestiona los ' + must.length + ' requisito(s)')) + '</b><ul class="v95reg-items">' +
          must.slice(0, 5).map((x) => '<li><span class="v95reg-lv ' + x.lv + '">' + esc(lvNm(x.lv)) + '</span>' + esc(x.nm) +
            (x.whys || []).slice(0, 2).map((s) => '<small>' + esc(M('当たる時：', 'When: ', '适用时：', 'Cuándo: ') + (s.length > 140 ? s.slice(0, 140) + '…' : s)) + '</small>').join('') +
            (x.who ? '<small>' + esc(M('発行・作る人（表の値）：', 'Issued / prepared by (table): ', '签发・制作方（表中值）：', 'Emite / prepara (tabla): ') + x.who) + '</small>' : '') + '</li>').join('') + '</ul></li>'
        : '<li><b>' + esc(M('書類の判断の表には、この商品とこの国に当たる必須の手続きがまだありません', 'The decision table has no required procedure for this product and country yet', '判断表中尚无本商品与该国的必需手续', 'La tabla aún no tiene trámites obligatorios para este producto y país')) + '</b><small>' + esc(M('「無い」と確かめたものではありません。2〜4 で確かめてください。', 'This has not been confirmed as “none”. Check with steps 2–4.', '这并不代表确认“没有”。请按 2〜4 确认。', 'No está confirmado que no haya. Verifique con los pasos 2–4.')) + '</small></li>';
      const li2 = '<li><b>' + esc(M('輸入者（バイヤー）に、この国で要る登録・認証・表示・通関の書類を聞く', 'Ask the importer which registrations, certifications, labels and clearance documents are needed', '向进口商确认该国所需的注册・认证・标签・清关文件', 'Pregunte al importador qué registros, certificaciones, etiquetas y documentos se necesitan')) + '</b>' +
        (chk.length ? '<small>' + esc(M('確かめること：', 'To check: ', '需确认：', 'Revisar: ') + chk.slice(0, 4).map((x) => x.nm).join('・')) + '</small>' : '') +
        '<span class="v95reg-btns"><button type="button" class="btn g" data-v95copy="1">' + esc(M('📋 輸入者に聞く文面（英語）をコピー', '📋 Copy the question to the importer (English)', '📋 复制给进口商的询问（英文）', '📋 Copiar la consulta al importador (inglés)')) + '</button></span>' +
        '<details class="v95reg-ask"><summary>' + esc(M('文面を見る', 'Show the text', '查看内容', 'Ver el texto')) + '</summary><pre>' + esc(V().askText(c, rows)) + '</pre></details></li>';
      const links = [];
      // 出どころは【必須】【条件つき】の行のもの（無いときだけ「確かめること」の行）。「確かめること」の汎用の行には他国の出どころが付くことがあるため
      (must.length ? must : chk).forEach((x) => (x.links || []).forEach((l) => { if (links.length < 3 && /^https:\/\//.test(l.u) && !links.some((y) => y.u === l.u)) links.push(l); }));
      const li3 = '<li><b>' + esc(M('公的な出どころで確かめる', 'Check official sources', '通过官方来源确认', 'Verifique en fuentes oficiales')) + '</b>' +
        (links.length ? '<ul class="v95reg-items">' + links.map((l) => '<li><a href="' + esc(l.u) + '" target="_blank" rel="noopener noreferrer">' + esc(l.t || l.u) + ' ↗</a></li>').join('') + '</ul>'
          : '<small>' + esc(M('相手国の当局（製品の安全・食品・化粧品などの担当）と税関の公式のサイトで、HS コードと商品の種類から確かめます（要確認）。', 'Use the official websites of the destination’s authorities and customs, by HS code and product type (to be confirmed).', '按HS编码和商品种类，在对方国家主管机关和海关的官网确认（需确认）。', 'Use los sitios oficiales de las autoridades y aduanas del destino, por código HS y tipo de producto (por confirmar).')) + '</small>') + '</li>';
      const li4 = '<li><b>' + esc(M('AI の詳細調査で最新の決まりを調べる・分からないところは STANDAGE に頼む', 'Run the AI research for the latest rules, or ask STANDAGE', '用AI详细调查最新规定，或委托STANDAGE', 'Use la investigación con IA o pida ayuda a STANDAGE')) + '</b><small>' + esc(M('AI の上限に達しているときは、1〜3 を先に進めてください。', 'If the AI limit is reached, go ahead with steps 1–3 first.', '如AI已达上限，请先进行 1〜3。', 'Si se alcanzó el límite de IA, avance primero con los pasos 1–3.')) + '</small>' +
        '<span class="v95reg-btns"><button type="button" class="btn g" data-v95go="ai">' + esc(M('🤖 AIで最新規制を詳細調査', '🤖 AI research on the latest rules', '🤖 用AI详细调查最新法规', '🤖 Investigar con IA')) + '</button><button type="button" class="btn g" data-v95go="ask">' + esc(M('✉ STANDAGE に規制の調査を依頼する', '✉ Ask STANDAGE to research', '✉ 委托STANDAGE调查法规', '✉ Pedir a STANDAGE')) + '</button></span></li>';
      const li5 = '<li><b>' + esc(M('確かめたら、上の「表で確かめる」を押して「規制を調べる」の手順を済みにする', 'When done, press “Review the table” above to complete the step', '确认后，点击上方“查看法规表”完成该步骤', 'Al terminar, pulse «Revisar la tabla» arriba para completar el paso')) + '</b></li>';
      const html = '<div class="v95reg-next" data-noi18n="1" role="note"><b class="v95reg-nh">' + esc(M('🧭 調べ方と次の一歩', '🧭 How to research and what to do next', '🧭 调查方法和下一步', '🧭 Cómo investigar y siguiente paso')) + '</b>' +
        P_('v95reg-ns', esc(M('この国・この商材の規制のひな形は、アプリにまだありません。次の順で進めると、出荷の前に確かめられます（手続きの名前は、出どころのある判断の表のものだけを出しています）。',
          'The app has no regulation template for this product and country yet. Follow these steps to confirm before shipping (only procedures with sources from the decision table are named).', '应用中尚无该国・该商品的法规模板。按以下顺序即可在出货前确认（只列出判断表中有出处的手续）。', 'La app aún no tiene plantilla para este producto y país. Siga estos pasos para confirmar antes del envío (solo se nombran trámites con fuente).'))) +
        '<ol class="v95reg-ol">' + li1 + li2 + li3 + li4 + li5 + '</ol></div>';
      const at = box.querySelector('.v54r-st') || box.querySelector('.v54r-docs');
      if (at) at.insertAdjacentHTML('afterend', html); else box.insertAdjacentHTML('beforeend', html);
    } catch (e) { warn('steps', e); }
  }
  async function copyText(s) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(s); return true; } } catch (e) { /* 次の手 */ }
    try { const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.className = 'v95reg-ta'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return !!ok; } catch (e) { return false; }
  }
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    const cp = t.closest('[data-v95copy]');
    if (cp) {
      e.preventDefault();
      const box = document.getElementById('rO');
      const txt = V() ? V().askText(ctyVal(), V().rowsOf(box)) : '';
      window.__v95lastCopy = txt;
      copyText(txt).then((ok) => toast(ok ? M('輸入者に聞く文面をコピーしました', 'Copied the question to the importer', '已复制给进口商的询问', 'Consulta copiada') : M('コピーできませんでした。「文面を見る」から選んでコピーしてください', 'Could not copy. Open “Show the text” and copy it', '无法复制。请打开“查看内容”手动复制', 'No se pudo copiar. Abra «Ver el texto» y cópielo')));
      return;
    }
    const g = t.closest('[data-v95go]');
    if (g) {
      e.preventDefault();
      const box = document.getElementById('rO');
      const k = g.getAttribute('data-v95go');
      const orig = k === 'ai' ? $$('button[data-onclick]', box).find((b) => /regAI\(/.test(b.getAttribute('data-onclick') || ''))
        : $$('button[data-act="v92ops.ask"]', box)[0];
      if (orig) orig.click();
      else if (k === 'ai' && typeof window.regAI === 'function') window.regAI();
    }
  }, false);

  function deco() {
    try {
      if (!regScreen()) return;
      const box = document.getElementById('rO');
      if (!box) return;
      const c = ctyVal();
      if (!c) return;
      ownSweep();
      dutyNote(box, c);
      consist(box);
      modeLine(box);
      steps(box, c);
    } catch (e) { warn('deco', e); }
    fixBtn();
  }
  /* No.477 商品の画面などの「関税率は 別の品目（茶・HS 0902）の目安・要確認」（v92ct の注記）：数字はもう出していないので、理由の言い方を合わせる */
  function fixRefs() {
    try {
      const regs = regsOf();
      if (!regs) return;
      const cs = Object.keys(regs);
      const px = cs.map((c) => regs[c] && regs[c].v95proxy).find(Boolean);
      const ow = cs.filter((c) => regs[c] && regs[c].v95own);
      const ox = ow.length ? regs[ow[0]].v95own : null;
      const x = px || ox;
      if (!x) return;
      const hs = x.hs, owNm = ow.join('・');
      $$('.kd .v92ct-ref, .v92ct-note[data-v92ct="ctymis"]').forEach((el) => {
        if (el.dataset.v95 || el.classList.contains('v95reg-own') || !/別の品目|代表的な品目|another item|typical item/.test(el.textContent || '')) return;
        el.dataset.v95 = '1';
        el.textContent = el.classList.contains('v92ct-note')
          ? M('⚠ この商品（HS ' + hs + '）は、アプリのひな形の品目（' + x.nm + '・HS ' + x.tpl + '）と違うため、ひな形の税率は出していません' + (owNm ? '（' + owNm + 'は、この商品の HS から関税なしと判定）' : '') + '。国を決める前に「規制を調べる」と相手国の関税率表で確かめてください。',
            '⚠ This product (HS ' + hs + ') differs from the template item (HS ' + x.tpl + '), so the template duty is not shown' + (owNm ? ' (' + owNm + ': no duty, judged from this HS)' : '') + '. Check before choosing countries.', '⚠ 本商品（HS ' + hs + '）与模板品目（HS ' + x.tpl + '）不同，不显示模板税率' + (owNm ? '（' + owNm + '：按本商品HS判定为无关税）' : '') + '。', '⚠ Este producto (HS ' + hs + ') difiere de la plantilla (HS ' + x.tpl + '); no se muestra su arancel' + (owNm ? ' (' + owNm + ': sin arancel según este HS)' : '') + '.')
          : (px ? M('関税率は要確認（この商品 HS ' + hs + ' の税率は、アプリにまだ入っていません）' + (owNm ? '。' + owNm + 'は関税なし（税関の一覧から）' : ''), 'Duty rate to be confirmed (the rate for this product, HS ' + hs + ', is not in the app yet)' + (owNm ? '; ' + owNm + ': no duty (customs list)' : ''), '关税率需确认（本商品 HS ' + hs + ' 的税率尚未收录）' + (owNm ? '；' + owNm + '：无关税' : ''), 'Arancel por confirmar (HS ' + hs + ')' + (owNm ? '; ' + owNm + ': sin arancel' : ''))
            : M('関税率：' + owNm + 'は関税なし（この商品 HS ' + hs + ' と税関の一覧から）', 'Duty: ' + owNm + ' — no duty (from this HS and the customs list)', '关税：' + owNm + ' 无关税', 'Arancel: ' + owNm + ' — sin arancel'));
      });
    } catch (e) { warn('refs', e); }
  }
  RD.v95reg = { deco, fixBtn, fixRefs, ownSweep };
  if (typeof window.rReg === 'function') {
    const __rr = window.rReg;
    window.rReg = function () { const r = __rr.apply(this, arguments); try { setTimeout(deco, 0); } catch (e) { /* 無視 */ } return r; };
  }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { deco(); fixRefs(); } catch (e) { warn('after', e); } return r; };
  // #rO を描き直す道（rReg 以外）や、あとから注記を足す層にも追いつく
  try {
    let tm = 0;
    new MutationObserver(() => { if (locked()) return; clearTimeout(tm); tm = setTimeout(() => { fixRefs(); ownSweep(); if (regScreen()) deco(); }, 120); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
})();
