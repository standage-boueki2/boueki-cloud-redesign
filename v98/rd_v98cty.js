/* 21.98 cty：刷新版の層（見せ方）。中身は logic_v2198cty.js（window.V98CTY）
   No.542 販売先国：要約と詳細の関税の照合（21.97 の .v97cty-audit）を、両方の値つきで出し直す。
          食い違い＝国・要約の文・要約の値・詳細（アプリの判定）の値。食い違いなし＝「✓」と、照らし合わせた根拠（押すと開く）。
   No.544 販売先国・規制・商品：ひな形の品目の名前が無いとき「undefined・HS undefined」と出さず「ひな形なし」（中身の直しは V98CTY.fillOwn）。
   No.517 販売先国：「点数と推奨の決め方」（点数は入力から計算＝AI は使わない・推奨の3か国が AI か点の順か・AI が点の順の何位を選んだか・
          同じ商材の直近の分析での AI の推奨の揺れ・同じ入力で前回の推奨を保ったとき）。
          「前回の分析からの変化」が、同じ商材の別の登録の分析と比べたものなら、その旨（どの登録か）を書く。
   インラインの onclick・style は使わない（CSP）。外から来た文字（AI の文・国名・商品名）はエスケープする。 */
(function () {
  'use strict';
  const RD = window.RDX;
  const V = () => window.V98CTY || null;
  if (window.__v98ctyRd) return;
  window.__v98ctyRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => { const v = V(); return v ? v.M(ja, en, zh, es) : ja; };
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf('rd ' + k, e); } catch (x) { /* 記録だけ */ } };
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : (typeof cur !== 'undefined' ? cur : ''); } catch (e) { return ''; } }; // eslint-disable-line no-undef
  const locked = () => { try { return RD && RD.locked ? !!RD.locked() : document.body.classList.contains('locked'); } catch (e) { return false; } };
  const store = () => { try { return typeof ctyStore === 'function' ? ctyStore() : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const nmC = (c) => { try { return window.V96CTY && V96CTY.ctyNm ? V96CTY.ctyNm(c) : c; } catch (e) { return c; } }; // eslint-disable-line no-undef
  const SEP = () => M('・', ', ', '、', ', ');
  const WHERE = (w) => (w === 'summary' ? M('総評', 'summary', '总评', 'resumen') : w === 'why' ? M('理由', 'reason', '理由', 'motivo') : M('リスク', 'risk', '风险', 'riesgo'));
  const ptsT = (v) => (v == null ? M('未評価', 'n/a', '未评价', 'sin evaluar') : v + M('点', ' pts', '分', ' pts'));

  // 開いた・閉じたを覚える（販売先国の画面が描き直されても、利用者が開いた欄は開いたまま）
  const OPEN = {};
  document.addEventListener('toggle', (e) => { try { const d = e.target; if (!d || !d.classList) return; const k = d.classList.contains('v98cty-evd') ? 'ev:' + (d.getAttribute('data-k') || '') : d.classList.contains('v98cty-ai') ? 'ai' : ''; if (k) OPEN[k] = !!d.open; } catch (x) { /* 無視 */ } }, true);
  const keepOpen = (root) => { try { $$('details.v98cty-evd', root).forEach((d) => { const k = 'ev:' + (d.getAttribute('data-k') || ''); if (OPEN[k] != null) d.open = OPEN[k]; }); } catch (e) { /* 無視 */ } };

  /* ───── No.542 照合（両方の値つき） ───── */
  function auditHtml(s) {
    const all = V().auditAll(s);
    const bad = all.filter((x) => x.ok === false);
    const ok = all.filter((x) => x.ok === true);
    const nc = all.filter((x) => x.ok === null);
    const det = (L, mark) => L.slice(0, 24).map((x) => '<li><b>' + E(nmC(x.c)) + '</b>' + E(M('（' + WHERE(x.where) + '）', ' (' + WHERE(x.where) + ')', '（' + WHERE(x.where) + '）', ' (' + WHERE(x.where) + ')')) + '：' +
      E(M('要約 ', 'summary ', '摘要 ', 'resumen ')) + '<b>' + E(x.claimTxt) + '</b> ' + E(mark) + ' ' + E(M('詳細 ', 'details ', '详情 ', 'detalle ')) + '<b>' + E(M('関税 ', 'duty ', '关税 ', 'arancel ') + x.app) + '</b>' +
      '<small>' + E(M('文：', 'Text: ', '原文：', 'Texto: ') + '「' + x.s + '」') + '</small></li>').join('');
    if (bad.length) {
      const cs = []; bad.forEach((x) => { if (cs.indexOf(x.c) < 0) cs.push(x.c); });
      return '<div class="v97cty-audit v98cty-audit bad" role="alert" data-noi18n="1" data-v98="1"><b>' + E(M('⚠ 要約と詳細の関税が食い違っています（' + cs.map(nmC).join(SEP()) + '）', '⚠ The summary and the details disagree on duty (' + cs.map(nmC).join(SEP()) + ')', '⚠ 摘要与详情的关税不一致（' + cs.map(nmC).join(SEP()) + '）', '⚠ El resumen y el detalle no coinciden en el arancel (' + cs.map(nmC).join(SEP()) + ')')) + '</b>' +
        '<ul class="v98cty-ev">' + det(bad.slice(0, 6), '≠') + '</ul>' +
        (bad.length > 6 ? '<details class="v98cty-evd" data-k="more"><summary>' + E(M('ほかの食い違い（' + (bad.length - 6) + 'か所）', 'More differences (' + (bad.length - 6) + ')', '其他不一致（' + (bad.length - 6) + '处）', 'Más diferencias (' + (bad.length - 6) + ')')) + '</summary><ul class="v98cty-ev">' + det(bad.slice(6), '≠') + '</ul></details>' : '') + '<p>' + E(M('詳細（規制の表・HS からの判定）のほうが、出どころのある値です。要約の文は「🔄 再分析」で作り直せます。', 'The details (regulation table / judgement from the HS) have a source. Re-run the analysis to regenerate the summary.', '详情（法规表・按HS判定）是有出处的数值。摘要可通过“🔄 重新分析”重新生成。', 'El detalle (tabla de normas / según el HS) tiene fuente. Repita el análisis para regenerar el resumen.')) + '</p>' +
        (ok.length ? '<details class="v98cty-evd" data-k="okb"><summary>' + E(M('一致した照らし合わせ（' + ok.length + 'か所）', 'Matching checks (' + ok.length + ')', '一致的核对（' + ok.length + '处）', 'Comprobaciones que coinciden (' + ok.length + ')')) + '</summary><ul class="v98cty-ev">' + det(ok, '＝') + '</ul></details>' : '') + '</div>';
    }
    if (!(s.ai && s.ai.summary) && !all.length) return '';
    const head = all.length
      ? M('✓ 要約（AI商社マンの総評・国ごとの理由とリスク）と詳細の関税を照らし合わせました：食い違いはありません（' + ok.length + 'か所が一致' + (nc.length ? '・' + nc.length + 'か所は詳細が要確認のため比べていません' : '') + '）。', '✓ Checked the duty in the summary (AI summary, reasons, risks) against the details: no differences (' + ok.length + ' match' + (nc.length ? '; ' + nc.length + ' not compared because the details are to be confirmed' : '') + ').', '✓ 已核对摘要（总评・各国理由与风险）与详情的关税：没有不一致（' + ok.length + '处一致' + (nc.length ? '・' + nc.length + '处因详情待确认未比较' : '') + '）。', '✓ Se comparó el arancel del resumen con el detalle: sin diferencias (' + ok.length + ' coinciden' + (nc.length ? '; ' + nc.length + ' sin comparar porque el detalle está por confirmar' : '') + ').')
      : M('✓ 要約（AI商社マンの総評・国ごとの理由とリスク）に関税の数や言い方は無かったため、照らし合わせるものはありませんでした。', '✓ The summary (AI summary, reasons, risks) states no duty, so there was nothing to check against the details.', '✓ 摘要（总评・各国理由与风险）中没有关税的数值或说法，因此无需核对。', '✓ El resumen no menciona aranceles, así que no había nada que comparar.');
    return '<div class="v97cty-audit v98cty-audit ok" data-noi18n="1" data-v98="1"><p>' + E(head) + '</p>' +
      (all.length ? '<details class="v98cty-evd" data-k="ok"><summary>' + E(M('照らし合わせた根拠（要約の値と詳細の値）', 'What was compared (summary value and details value)', '核对依据（摘要值与详情值）', 'Qué se comparó (valor del resumen y del detalle)')) + '</summary><ul class="v98cty-ev">' + det(ok, '＝') +
        nc.slice(0, 12).map((x) => '<li class="nc"><b>' + E(nmC(x.c)) + '</b>：' + E(M('要約 ', 'summary ', '摘要 ', 'resumen ') + x.claimTxt + M('／詳細 関税 ', ' / details duty ', '／详情 关税 ', ' / detalle arancel ') + x.app + M('（アプリに税率が無いため比べていません。規制を調べるで確かめてください）', ' (not compared: the app has no rate yet; check in Regulations)', '（应用中尚无税率，未比较。请在“查询法规”中确认）', ' (sin comparar: la app aún no tiene el tipo; compruébelo en Normativa)')) + '</li>').join('') + '</ul></details>' : '') + '</div>';
  }
  function paintAudit(s) {
    const old = $$('.v97cty-audit:not([data-v98])');
    const mine = $('.v98cty-audit');
    if (!old.length && mine) {
      const key = auditKey(s);
      if (mine.getAttribute('data-v98sig') === key) return;
      const h = auditHtml(s);
      if (!h) { mine.remove(); return; }
      mine.insertAdjacentHTML('afterend', h); const n = mine.nextElementSibling; mine.remove(); if (n) { n.setAttribute('data-v98sig', key); keepOpen(n); }
      return;
    }
    old.forEach((el) => {
      const h = auditHtml(s);
      if (!h) { el.remove(); return; }
      el.insertAdjacentHTML('afterend', h);
      const n = el.nextElementSibling;
      el.remove();
      if (n) { n.setAttribute('data-v98sig', auditKey(s)); keepOpen(n); }
    });
  }
  const auditKey = (s) => [V().lang(), s.at || '', s.ai ? (s.ai.summary || '').length : 0, (s.rec || []).map((r) => r && (r.c + (r.facts && r.facts.duty) + String(r.why || '').length + String(r.risk || '').length)).join(',')].join('|');

  /* ───── No.517 前回の分析が、同じ商材の別の登録のとき ───── */
  function paintSrc(s) {
    const d = $('.v97cty-diff');
    if (!d) return;
    const h = Array.isArray(s.v97h) ? s.v97h : [];
    const a = h.length >= 2 ? h[h.length - 2] : null;
    const src = a && a.v98src;
    const old = $('.v98cty-src', d);
    const key = src ? [src.uid, src.at, V().lang()].join('|') : '';
    if (old && old.getAttribute('data-v98sig') === key) return;
    if (old) old.remove();
    if (!src) return;
    const where = src.where === 'trash' ? M('ゴミ箱', 'trash', '回收站', 'papelera') : src.where === 'device' ? M('この端末の記録', 'this device’s record', '本设备的记录', 'registro de este equipo') : M('商品の一覧', 'product list', '商品列表', 'lista de productos');
    const p = document.createElement('p');
    p.className = 'v98cty-src';
    p.setAttribute('data-v98sig', key);
    p.setAttribute('data-noi18n', '1');
    p.textContent = M('比べた分析：同じ商材（カテゴリー・HS が同じで、品名か会社名も同じ）の別の登録「' + src.item + '」' + (src.co ? '（' + src.co + '）' : '') + 'の ' + (src.t || '') + ' の分析（' + where + 'から）。商品を登録し直しても、前回との違いと理由をここに出します。',
      'Compared with: another registration of the same product (same category and HS, and the same name or company) “' + src.item + '”' + (src.co ? ' (' + src.co + ')' : '') + ', analysed ' + (src.t || '') + ' (from the ' + where + '). Even if you register the product again, the changes and reasons are shown here.',
      '比较的分析：同类商品（类别・HS相同，且品名或公司相同）的另一条登记“' + src.item + '”' + (src.co ? '（' + src.co + '）' : '') + '于 ' + (src.t || '') + ' 的分析（来自' + where + '）。即使重新登记商品，也会在此显示与上次的差异和原因。',
      'Comparado con: otro registro del mismo producto (misma categoría y HS, y mismo nombre o empresa) «' + src.item + '»' + (src.co ? ' (' + src.co + ')' : '') + ', análisis del ' + (src.t || '') + ' (de ' + where + ').');
    const sm = $('summary', d);
    if (sm && sm.nextSibling) sm.insertAdjacentElement('afterend', p); else d.appendChild(p);
    // 見出しの「前回の分析」を「同じ商材の前回の分析」に
    if (sm && !sm.getAttribute('data-v98')) {
      const tw = document.createTreeWalker(sm, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) { const n = tw.currentNode; if (/^前回の分析/.test(n.nodeValue || '')) { n.nodeValue = n.nodeValue.replace(/^前回の分析/, '同じ商材の前回の分析（別の登録）'); break; } if (/^Changes since the last analysis/.test(n.nodeValue || '')) { n.nodeValue = n.nodeValue.replace(/^Changes since the last analysis/, 'Changes since the last analysis of the same product (another registration)'); break; } }
      sm.setAttribute('data-v98', '1');
    }
  }

  /* ───── No.517 点数と推奨の決め方（どこが AI の判断か） ───── */
  function aiHtml(s) {
    const A = V().aiPart(s);
    if (!A) return '';
    const L = [];
    L.push('<li><b>' + E(M('点数', 'Scores', '分数', 'Puntuación')) + '</b>：' + E(M('総合点・4つの観点・内訳は、この商品の入力（HS・カテゴリー・単価・保存・進出希望国）と内蔵のデータ（通関統計・規制の表・書類の判断の表・バイヤー数・拠点）から計算します。AI は使っていません。同じ入力なら同じ点です。', 'Total, the four aspects and the breakdown are calculated from this product’s inputs (HS, category, unit price, storage, target countries) and built-in data (customs statistics, regulation table, document decision table, buyers, bases). No AI is used, so the same inputs give the same scores.', '总分、4个维度和明细均根据本商品的输入（HS・类别・单价・保存・目标国）和内置数据（海关统计・法规表・单据判断表・买家数・据点）计算，不使用AI。输入相同则分数相同。', 'El total, los cuatro aspectos y el desglose se calculan con los datos del producto y los datos integrados. No se usa IA: con los mismos datos, la misma puntuación.')) + '</li>');
    const names = (a) => a.map(nmC).join(SEP());
    if (A.by === 'ai') {
      L.push('<li><b>' + E(M('推奨の3か国', '3 recommended countries', '推荐的3个国家', '3 países recomendados')) + '</b>：' + E(names(A.top)) + ' ' + E(A.kept ? M('（前回の推奨を保ちました）', ' (previous recommendation kept)', '（保持上次的推荐）', ' (se mantuvo la anterior)') : M('（AI商社マンの判断' + (A.eng ? '・' + A.eng : '') + '）', ' (AI Trade Agent’s judgement' + (A.eng ? ', ' + A.eng : '') + ')', '（AI商社顾问的判断' + (A.eng ? '・' + A.eng : '') + '）', ' (criterio del agente IA' + (A.eng ? ', ' + A.eng : '') + ')')) + '</li>');
      L.push('<li><b>' + E(M('点の順の上位3か国', 'Top 3 by score', '按分数的前3个国家', 'Los 3 primeros por puntuación')) + '</b>：' + E(A.loc.map((c) => nmC(c) + ' ' + ptsT(A.sc[c])).join(SEP())) +
        (A.tie.length ? ' ' + E(M('（3位は同点：' + names(A.tie) + ' ' + A.t3 + '点。同点の並べ方は「点数と順位の見方」。同点の国のどれを選ぶかで推奨が変わりうるところです）', ' (tie at #3: ' + names(A.tie) + ' ' + A.t3 + ' pts — see “How to read scores and ranks”; the recommendation can change among tied countries)', '（第3位同分：' + names(A.tie) + ' ' + A.t3 + '分。同分国之间的选择可能改变推荐）', ' (empate en el 3º: ' + names(A.tie) + ' ' + A.t3 + ' pts)')) : '') + '</li>');
      if (A.kept) { /* 下の行で書く */ } else if (A.same) L.push('<li>' + E(M('AI の推奨は、点の順の上位3か国と同じです（AI が変えたのは並べ方と説明の文だけです）。', 'The AI’s choice is the same as the top 3 by score (the AI only wrote the order and the explanations).', 'AI的推荐与按分数的前3个国家相同（AI只改变了顺序和说明）。', 'La elección de la IA coincide con los 3 primeros por puntuación.')) + '</li>');
      else {
        const rk = A.picks.map((x) => (x.rk || '—') + M('位', '', '位', 'º')).join(SEP());
        L.push('<li class="v98cty-aidiff">' + E(M('AI は点の順で ' + rk + 'の国を選びました。', 'The AI picked countries ranked ' + rk + ' by score.', 'AI选择了按分数排名第' + rk + '的国家。', 'La IA eligió los países en los puestos ' + rk + ' por puntuación.')) + ' ' +
          E(M('入れた国：' + A.out.map((x) => nmC(x.c) + '（' + x.rk + '位・' + ptsT(x.t) + '）').join(SEP()) + '／外した国：' + A.drop.map((x) => nmC(x.c) + '（' + x.rk + '位・' + ptsT(x.t) + '）').join(SEP()) + '。点の差は ' + A.gap + '点 です。',
            'Added: ' + A.out.map((x) => nmC(x.c) + ' (#' + x.rk + ', ' + ptsT(x.t) + ')').join(', ') + ' / left out: ' + A.drop.map((x) => nmC(x.c) + ' (#' + x.rk + ', ' + ptsT(x.t) + ')').join(', ') + '. Score gap: ' + A.gap + ' pts.',
            '加入：' + A.out.map((x) => nmC(x.c) + '（第' + x.rk + '位・' + ptsT(x.t) + '）').join('、') + '／排除：' + A.drop.map((x) => nmC(x.c) + '（第' + x.rk + '位・' + ptsT(x.t) + '）').join('、') + '。分差 ' + A.gap + ' 分。',
            'Añadidos: ' + A.out.map((x) => nmC(x.c) + ' (' + x.rk + 'º, ' + ptsT(x.t) + ')').join(', ') + ' / fuera: ' + A.drop.map((x) => nmC(x.c) + ' (' + x.rk + 'º, ' + ptsT(x.t) + ')').join(', ') + '. Diferencia: ' + A.gap + ' pts.')) + '</li>');
      }
    } else {
      L.push('<li><b>' + E(M('推奨の3か国', '3 recommended countries', '推荐的3个国家', '3 países recomendados')) + '</b>：' + E(names(A.top)) + ' ' + E(M('（点の順＝AI は使っていません。同じ入力なら同じ推奨です）', ' (by score — no AI used; the same inputs give the same recommendation)', '（按分数＝未使用AI。输入相同则推荐相同）', ' (por puntuación — sin IA; mismos datos, misma recomendación)')) + '</li>');
    }
    if (A.kept) {
      L.push('<li class="v98cty-kept">' + E(M('今回、AI商社マンは「' + names(A.kept.ai) + '」を挙げましたが、入力・候補国・進出希望国・点数が前回と同じため、前回の推奨（' + names(A.kept.prev) + '）を保ちました（同じ入力なら同じ推奨）。', 'This time the AI suggested “' + names(A.kept.ai) + '”, but inputs, candidates, target countries and scores are the same as last time, so the previous recommendation (' + names(A.kept.prev) + ') was kept (same inputs, same recommendation).', '本次AI商社顾问提出了“' + names(A.kept.ai) + '”，但输入・候选国・目标国・分数与上次相同，因此保持上次的推荐（' + names(A.kept.prev) + '）。', 'Esta vez la IA sugirió «' + names(A.kept.ai) + '», pero los datos y las puntuaciones son iguales a la última vez, así que se mantuvo la recomendación anterior (' + names(A.kept.prev) + ').')) +
        (A.kept.ch ? ' ' + E(M('AI の挙げた理由：「' + A.kept.ch + '」', 'Reason given by the AI: “' + A.kept.ch + '”', 'AI给出的理由：“' + A.kept.ch + '”', 'Motivo de la IA: «' + A.kept.ch + '»')) : '') + '</li>');
    }
    if (A.runs >= 2) {
      L.push('<li><b>' + E(M('揺れの幅', 'Variation', '波动范围', 'Variación')) + '</b>：' + E(M('同じ商材の直近 ' + A.runs + '回の分析' + (A.src ? '（別の登録を含む）' : '') + 'で、点数の動きは最大 ' + A.span + '点' + (A.aiRuns ? '、AI の推奨の3か国は ' + A.sets + '通り' + (A.always.length ? '（いつも入った国：' + names(A.always) + '）' : '') : '') + 'です。',
        'Over the last ' + A.runs + ' analyses of the same product' + (A.src ? ' (including another registration)' : '') + ', scores moved by up to ' + A.span + ' pts' + (A.aiRuns ? ' and the AI’s 3 countries had ' + A.sets + ' combination(s)' + (A.always.length ? ' (always included: ' + names(A.always) + ')' : '') : '') + '.',
        '同类商品最近' + A.runs + '次分析' + (A.src ? '（含另一条登记）' : '') + '中，分数最多变动 ' + A.span + ' 分' + (A.aiRuns ? '，AI推荐的3个国家有 ' + A.sets + ' 种组合' + (A.always.length ? '（始终入选：' + names(A.always) + '）' : '') : '') + '。',
        'En los últimos ' + A.runs + ' análisis del mismo producto, la puntuación varió hasta ' + A.span + ' pts' + (A.aiRuns ? ' y los 3 países de la IA tuvieron ' + A.sets + ' combinación(es)' : '') + '.')) + '</li>');
    }
    if (A.by === 'ai') L.push('<li class="v98cty-note">' + E(M('AI の判断は実行ごとに揺れることがあります。点数と点の順は揺れません。入力・点数が前回と同じときは、前回の推奨を保ちます。', 'AI judgements can vary between runs; scores and the score ranking do not. When inputs and scores are unchanged, the previous recommendation is kept.', 'AI的判断每次运行可能不同；分数和排名不会变。输入和分数与上次相同时，保持上次的推荐。', 'El criterio de la IA puede variar; la puntuación no. Si nada cambia, se mantiene la recomendación anterior.')) + '</li>');
    const open = (A.by === 'ai' && !A.same) || !!A.kept;
    return '<details class="v98cty-ai" data-noi18n="1"' + (open ? ' open' : '') + '><summary>' + E(M('点数と推奨の決め方（どこが AI の判断か）', 'How scores and the recommendation are made (what the AI decides)', '分数和推荐的决定方式（哪些由AI判断）', 'Cómo se calculan la puntuación y la recomendación (qué decide la IA)')) +
      '<small>' + E(A.kept ? M('推奨＝前回の推奨を保った（入力・点数が同じ）', 'previous recommendation kept (same inputs and scores)', '推荐＝保持上次（输入・分数相同）', 'se mantuvo la anterior') : A.by === 'ai' ? (A.same ? M('推奨＝AI（点の順と同じ）', 'AI = score order', 'AI＝与分数顺序相同', 'IA = orden por puntuación') : M('推奨＝AI の判断', 'recommended by AI', '推荐＝AI判断', 'recomendado por IA')) : M('推奨＝点の順', 'by score', '推荐＝按分数', 'por puntuación')) + '</small></summary><ul>' + L.join('') + '</ul></details>';
  }
  function paintAi(s) {
    const key = [V().lang(), s.at || '', (s.top || []).join(','), (s.v97h || []).length, s.ai ? 1 : 0, (s.rec || []).map((r) => r && r.c + (r.sc && r.sc.total)).join(',')].join('|');
    let box = $('.v98cty-aiw');
    const tiles = $('.k-card .k-tiles');
    const sec2 = document.getElementById('sec-2');
    const after = $('.v97cty-wrap') || (tiles || null);
    if (box && box.getAttribute('data-v98sig') === key && (!after || after.nextElementSibling === box || !after.parentElement)) return;
    const open = box ? !!$('details[open]', box) : null;
    if (box) box.remove();
    const h = aiHtml(s);
    if (!h) return;
    box = document.createElement('div');
    box.className = 'v98cty-aiw';
    box.setAttribute('data-noi18n', '1');
    box.setAttribute('data-v98sig', key);
    box.innerHTML = h;
    if (after) after.insertAdjacentElement('afterend', box);
    else if (sec2) { const h3 = $('h3', sec2); if (h3 && h3.parentElement) h3.parentElement.insertAdjacentElement('afterend', box); else sec2.insertAdjacentElement('afterbegin', box); }
    else return;
    { const d = $('details', box); if (d) { if (open !== null) d.open = open; else if (OPEN.ai != null) d.open = OPEN.ai; } }
  }
  function decoCty() {
    try {
      if (locked() || curKey() !== 'cty' || !V()) return;
      const s = store();
      if (!s || !Array.isArray(s.rec) || !s.rec.length || window.__ctyBusy) { $$('.v98cty-aiw').forEach((x) => x.remove()); return; }
      paintAudit(s);
      paintSrc(s);
      paintAi(s);
    } catch (e) { warn('cty', e); }
  }

  /* ───── No.544 ひな形の品目の名前が無いとき ───── */
  const UND = /（undefined・HS undefined）|\(undefined, HS undefined\)|（HS undefined）|\(HS undefined\)|〈undefined・HS undefined〉/g;
  function sweepUnd() {
    try {
      if (V() && V().fillD) V().fillD();
      const rep = M('（ひな形なし）', '(no template)', '（无模板）', '(sin plantilla)');
      $$('.v92ct-note, .v92ct-ref, .v95reg-dn, .kd, .v92o-dn').forEach((el) => {
        if (!/undefined/.test(el.textContent || '')) return;
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const n = tw.currentNode; const v = n.nodeValue || ''; if (UND.test(v)) { UND.lastIndex = 0; n.nodeValue = v.replace(UND, rep); } UND.lastIndex = 0; }
      });
    } catch (e) { warn('und', e); }
  }

  function deco() { sweepUnd(); decoCty(); }
  if (RD && typeof RD.after === 'function') {
    const a0 = RD.after;
    RD.after = function () { const r = a0.apply(this, arguments); try { deco(); } catch (e) { warn('after', e); } return r; };
  }
  try {
    let tm = 0;
    new MutationObserver(() => { if (locked()) return; clearTimeout(tm); tm = setTimeout(deco, 200); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
  setTimeout(deco, 0);
})();
