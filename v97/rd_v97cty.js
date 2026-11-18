/* 21.97 cty：刷新版の層（見せ方）。中身は logic_v2197cty.js（window.V97CTY）
   No.517 販売先国：おすすめのカードの下（無ければ ② 分析結果の上）に「前回の分析からの変化」（推奨・点数・何が変わったか・誰が決めたか）。
   No.536 販売先国：AI の総評・国ごとの理由・リスク（要約）と、国の事実（詳細）の関税を照らし合わせた結果（食い違いがあれば ⚠）。
   No.515・No.508 規制の AI 詳細調査：Web 検索で確かめられなかったとき（下書き・失敗のどちらも）に、
          ① 何回・どのエンジンで・なぜ確かめられなかったか、何度やっても同じ失敗か ② アプリの内蔵データで分かっていること（出どころ・確かめた日）
          ③「⏰ 10分後にもう一度調べる」を出す（21.96 の先頭の欄に足す）。
   インラインの onclick・style は使わない（CSP）。外から来た文字（AI の文・国名）はエスケープする。 */
(function () {
  'use strict';
  const RD = window.RDX;
  const V = () => window.V97CTY || null;
  if (window.__v97ctyRd) return;
  window.__v97ctyRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => { const v = V(); return v ? v.M(ja, en, zh, es) : ja; };
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const warn = (k, e) => { try { const v = V(); if (v && v.errf) v.errf('rd ' + k, e); } catch (x) { /* 記録だけ */ } };
  const curKey = () => { try { return RD && RD.curKey ? RD.curKey() : (typeof cur !== 'undefined' ? cur : ''); } catch (e) { return ''; } }; // eslint-disable-line no-undef
  const locked = () => { try { return RD && RD.locked ? !!RD.locked() : document.body.classList.contains('locked'); } catch (e) { return false; } };
  const store = () => { try { return typeof ctyStore === 'function' ? ctyStore() : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const nmC = (c) => { try { return window.V96CTY && V96CTY.ctyNm ? V96CTY.ctyNm(c) : c; } catch (e) { return c; } }; // eslint-disable-line no-undef

  /* ───── No.517 前回の分析からの変化 ───── */
  function diffHtml(s) {
    const h = Array.isArray(s.v97h) ? s.v97h : [];
    if (h.length < 2) return '';
    const D = V().diff(h[h.length - 2], h[h.length - 1]);
    const a = D.a || {}, b = D.b || {};
    const when = M('前回の分析（' + (a.t || '') + '）からの変化', 'Changes since the last analysis (' + (a.t || '') + ')', '与上次分析（' + (a.t || '') + '）相比的变化', 'Cambios desde el último análisis (' + (a.t || '') + ')');
    let body = '';
    if (D.same) {
      body = '<p class="v97cty-same">' + E(M('推奨の3か国（' + (b.top || []).map(nmC).join('・') + '）も、各国の点数も、前回と同じです。', 'The 3 recommended countries (' + (b.top || []).map(nmC).join(', ') + ') and all scores are the same as last time.')) + '</p>';
    } else {
      const top = D.topChanged
        ? '<p class="v97cty-top chg"><b>' + E(M('推奨が変わりました：', 'Recommendation changed: ')) + '</b>' + E((a.top || []).map(nmC).join(M('・', ', ')) + ' → ' + (b.top || []).map(nmC).join(M('・', ', '))) + '</p>'
        : '<p class="v97cty-top"><b>' + E(M('推奨は前回と同じ：', 'Same recommendation: ')) + '</b>' + E((b.top || []).map(nmC).join(M('・', ', '))) + '</p>';
      const lines = D.lines.map((x) => '<li class="v97cty-l-' + E(x.k) + '">' + E(x.t) + '</li>').join('');
      const rows = D.per.map((r) => {
        const mv = (r.from == null ? '—' : r.from) + ' → ' + (r.to == null ? '—' : r.to) + M('点', ' pts');
        const tag = r.inA !== r.inB ? (r.inB ? M('推奨に入った', 'now recommended') : M('推奨から外れた', 'no longer recommended')) : (r.inB ? M('推奨のまま', 'still recommended') : '');
        return '<li><details><summary><b>' + E(nmC(r.c)) + '</b><span class="v97cty-mv">' + E(mv) + '</span>' + (tag ? '<small>' + E(tag) + '</small>' : '') + '</summary><ul>' +
          r.why.slice(0, 12).map((w) => '<li>' + E(w) + '</li>').join('') + '</ul></details></li>';
      }).join('');
      body = top + (lines ? '<ul class="v97cty-why">' + lines + '</ul>' : '') + (rows ? '<p class="v97cty-sub">' + E(M('国ごとの点の動きと理由（押すと開きます）', 'Score changes and reasons by country (click to open)')) + '</p><ul class="v97cty-per">' + rows + '</ul>' : '');
    }
    return '<details class="v97cty-diff" data-noi18n="1"' + (D.same ? '' : ' open') + '><summary>' + E(when) + (D.same ? '<small>' + E(M('変化なし', 'no change')) + '</small>' : '<small class="chg">' + E(D.topChanged ? M('推奨が変わりました', 'recommendation changed') : M('点数が変わりました', 'scores changed')) + '</small>') + '</summary>' + body +
      '<p class="v97cty-note">' + E(M('同じ商品の分析の記録（直近4回）と比べています。点数の決め方は「国ごとの点数の内訳」、AI の判断の理由は AI商社マンの総評をご覧ください。', 'Compared with the record of analyses of this product (last 4). See the score breakdown for how scores are made, and the AI summary for the AI\'s reasons.')) + '</p></details>';
  }
  function auditHtml(s) {
    const L = V().audit(s);
    if (L.length) {
      return '<div class="v97cty-audit bad" role="alert" data-noi18n="1"><b>' + E(M('⚠ 要約と詳細の関税が食い違っています', '⚠ The summary and the details disagree on duty')) + '</b><ul>' +
        L.slice(0, 6).map((x) => '<li>' + E(nmC(x.c) + M('：要約「', ': summary “') + x.s + M('」／詳細（アプリの判定）：関税 ', '” / details (app): duty ') + x.app) + '</li>').join('') + '</ul><p>' +
        E(M('詳細（規制の表・HS からの判定）のほうが、出どころのある値です。要約の文は「🔄 再分析」で作り直せます。', 'The details (regulation table / judgement from the HS) have a source. Re-run the analysis to regenerate the summary.')) + '</p></div>';
    }
    if (s.ai && s.ai.summary) return '<p class="v97cty-audit ok" data-noi18n="1">' + E(M('✓ 要約（AI商社マンの総評・国ごとの理由とリスク）と詳細の関税を照らし合わせました：食い違いはありません。', '✓ Checked the duty in the summary (AI summary, reasons, risks) against the details: no differences.')) + '</p>';
    return '';
  }
  function decoCty() {
    try {
      if (locked() || curKey() !== 'cty' || !V()) return;
      const s = store();
      if (!s || !Array.isArray(s.rec) || !s.rec.length) { $$('.v97cty-wrap').forEach((x) => x.remove()); return; }
      const h = Array.isArray(s.v97h) ? s.v97h : [];
      const key = [h.length ? h[h.length - 1].at : 0, h.length, s.at || '', V().lang(), s.ai ? (s.ai.summary || '').length : 0, (s.rec || []).map((r) => r.c + (r.facts && r.facts.duty)).join(',')].join('|');
      // おすすめのカード（刷新版の上の枠）→ 無ければ ② 分析結果の見出しの下
      const tiles = $('.k-card .k-tiles');
      const sec2 = document.getElementById('sec-2');
      const host = tiles ? tiles.parentElement : sec2;
      if (!host) return;
      let w = $('.v97cty-wrap');
      if (w && w.getAttribute('data-v97sig') === key && host.contains(w)) return;
      const open = w ? $$('details[open]', w).map((d) => d.className + '|' + ($('summary b', d) || {}).textContent) : null;
      if (w) w.remove();
      const html = diffHtml(s) + auditHtml(s);
      if (!html) return;
      w = document.createElement('div');
      w.className = 'v97cty-wrap';
      w.setAttribute('data-v97sig', key);
      w.setAttribute('data-noi18n', '1');
      w.innerHTML = html;
      if (tiles) tiles.insertAdjacentElement('afterend', w);
      else { const h3 = $('h3', sec2); if (h3 && h3.parentElement) h3.parentElement.insertAdjacentElement('afterend', w); else sec2.insertAdjacentElement('afterbegin', w); }
      if (open) $$('details', w).forEach((d) => { const k = d.className + '|' + ($('summary b', d) || {}).textContent; d.open = open.indexOf(k) >= 0 || (d.classList.contains('v97cty-diff') && d.open); });
    } catch (e) { warn('cty', e); }
  }

  /* ───── No.515・No.508 規制の AI 詳細調査：確かめられなかったとき ───── */
  const regSt = (c) => { try { return typeof regStore === 'function' ? regStore()[c] : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const curC = () => { try { const a = window.V54ASK && V54ASK.c; if (a) return a; } catch (e) { /* 次へ */ } const rc = document.getElementById('rC'); return rc ? String(rc.value || '') : ''; }; // eslint-disable-line no-undef
  function rtOf(c, st) {
    try { if (st && st.v96rt && st.v96rt.v97) return st.v96rt; } catch (e) { /* 次へ */ }
    try { const x = V().rt && V().rt[c]; if (x && (!st || !st.v96rt || x.at >= (st.v96rt.at || 0))) return x; } catch (e) { /* 無い */ }
    return null;
  }
  function attHtml(t) {
    if (!t || !Array.isArray(t.att) || !t.att.length) return '';
    const PN = V().PN;
    const li = t.att.map((a) => {
      const k = a.web && a.n > 0 ? 'ok' : a.k;
      const why = a.web && a.n > 0 ? M('Web 検索あり・出典 ' + a.n + '件', 'web search used, ' + a.n + ' source(s)') : (V().kTxt(a.k) || V().kTxt('error'));
      const st = (a.fails || []).map((f) => (f.st === 'x' ? M('通信', 'network') : 'HTTP ' + f.st)).filter(Boolean).slice(0, 2).join(M('・', ', '));
      return '<li class="' + (k === 'ok' ? 'ok' : a.perm ? 'pm' : 'tr') + '"><b>' + E(M(a.i + '回目', 'Attempt ' + a.i)) + '</b> ' + E((a.prov ? PN(a.prov) + M('：', ': ') : '') + why + (st ? '（' + st + '）' : '') + (a.fb && a.fb !== a.prov ? M('→ ' + PN(a.fb) + '（Web 検索なし）に切り替わり', ' → switched to ' + PN(a.fb) + ' (no web search)') : '') + M('・' + Math.max(1, Math.round((a.ms || 0) / 1000)) + '秒', ', ' + Math.max(1, Math.round((a.ms || 0) / 1000)) + 's')) + '</li>';
    }).join('');
    const last = t.att[t.att.length - 1];
    const next = t.ok ? '' : (t.perm || (last && last.perm))
      ? M('何度調べても同じ結果になる失敗です（設定・上限）。管理者に「AI 接続と Web 検索の設定」を確かめてもらってください。それまでは、下の内蔵データと確かめ先・輸入者への質問で確かめてください。', 'This failure will repeat on every retry (settings/limits). Ask the admin to check the AI connection and web search settings. Until then, use the built-in data, sources and importer questions below.')
      : M('一時的な失敗です。少し時間をおくと通ることが多いので、「⏰ 10分後にもう一度調べる」か「🔄 Web 検索つきでもう一度調べる」を押してください。', 'This is a temporary failure; it often works after a while. Press “⏰ Research again in 10 minutes” or “🔄 Research again with web search”.');
    return '<div class="v97reg-att" data-noi18n="1"><b>' + E(t.ok ? M('自動で調べ直して、Web 検索で確かめられました', 'Retried automatically and confirmed with web search') : M('自動で ' + t.att.length + '回 調べましたが、Web 検索で確かめられませんでした', 'Tried ' + t.att.length + ' time(s) automatically, but could not confirm with web search')) + '</b><ol>' + li + '</ol>' + (next ? '<p>' + E(next) + '</p>' : '') + '</div>';
  }
  function knownHtml(c) {
    const K = V().known(c);
    const items = [];
    const link = (u, t) => (u && /^https:\/\//.test(u) ? ' <a href="' + E(u) + '" target="_blank" rel="noopener noreferrer">' + E(t || M('出どころ', 'source')) + ' ↗</a>' : (t ? '（' + E(t) + '）' : ''));
    if (K.duty) items.push('<li><b>' + E(M('関税', 'Duty')) + '</b>：' + E(K.duty.t) + link(K.duty.u, K.duty.s) + '</li>');
    const LV = { req: M('必須', 'required'), con: M('条件つき', 'conditional'), ban: M('輸入を止める決まり', 'import ban') };
    if (K.procs.length) items.push('<li><b>' + E(M('この商品とこの国で要る手続き（書類の判断の表・' + K.asOf + ' 確認）', 'Procedures for this product and country (document decision table, checked ' + K.asOf + ')')) + '</b><ul>' +
      K.procs.slice(0, 8).map((p) => '<li><span class="v97reg-lv ' + E(p.lv) + '">' + E(LV[p.lv] || '') + '</span> ' + E(p.n) + link(p.u, p.s ? String(p.s).slice(0, 50) : '') + '</li>').join('') + '</ul>' + (K.prov ? '<small>' + E(M('HS を推定して当てはめています（要確認）', 'Applied with an estimated HS (to be confirmed)')) + '</small>' : '') + '</li>');
    else if (K.asOf && !K.nohs) items.push('<li>' + E(M('書類の判断の表（' + K.asOf + ' 確認）では、この商品とこの国だけに要る手続きは見つかりません（無いと確かめたものではありません）', 'The document decision table (checked ' + K.asOf + ') lists no procedure specific to this product and country (not a confirmation that none exist)')) + '</li>');
    if (K.nohs) items.push('<li>' + E(M('HS コードが未登録のため、書類の判断の表を当てていません', 'No HS code, so the document decision table was not applied')) + '</li>');
    if (K.tpl) items.push('<li><b>' + E(M('規制のひな形', 'Regulation template')) + '</b>：' + E(M('必要書類 ', 'documents: ') + K.tpl.docs.join(M('・', ', ')) + (K.tpl.lead ? M('／通関 ', ' / clearance ') + K.tpl.lead : '')) + '</li>');
    if (!items.length) return '';
    return '<div class="v97reg-known" data-noi18n="1"><b>' + E(M('アプリの内蔵データで分かっていること（Web 検索なしでも出どころのある事実）', 'What the app\'s built-in data already shows (facts with sources, no web search needed)')) + '</b><ul>' + items.join('') + '</ul>' +
      '<p>' + E(M('この下の AI の文は、Web 検索で裏取りできていない下書きです。上の事実と食い違うときは、上を優先してください。', 'The AI text below is an unverified draft. Where it differs from the facts above, the facts above take precedence.')) + '</p></div>';
  }
  function laterBtn(c) {
    const L = V().later[String(c)];
    if (L) {
      const d = new Date(L.at);
      return '<button type="button" class="btn g v97reg-later on" data-v97laterOff="' + E(c) + '">' + E(M('⏰ ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ' にもう一度調べます（取り消す）', '⏰ Will research again at ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ' (cancel)')) + '</button>';
    }
    return '<button type="button" class="btn g v97reg-later" data-v97later="' + E(c) + '">' + E(M('⏰ 10分後にもう一度調べる（この画面を開いている間）', '⏰ Research again in 10 minutes (while this screen is open)')) + '</button>';
  }
  function paintReg() {
    try {
      if (!V()) return;
      const o = document.getElementById('regaiO');
      if (!o || $('.spin', o)) return;
      const c = curC();
      if (!c) return;
      const st = regSt(c);
      const t = rtOf(c, st);
      const gen = $('.v96reg-top.v96reg-gen', o);
      const failed = !gen && !(st && st.h) && /調査に失敗しました|failed/i.test(o.textContent || '');
      const okRt = !gen && t && t.ok && t.att && t.att.length > 1 ? $('.v96reg-top.v96reg-ok', o) : null;
      const key = [c, t ? t.at : 0, gen ? 1 : 0, failed ? 1 : 0, V().lang(), V().later[c] ? V().later[c].at : 0].join('|');
      const old = $('.v97reg-add', o);
      if (old && old.getAttribute('data-v97sig') === key) return;
      $$('.v97reg-add', o).forEach((x) => x.remove());
      if (!gen && !failed && !okRt) return;
      const box = document.createElement('div');
      box.className = 'v97reg-add';
      box.setAttribute('data-v97sig', key);
      box.setAttribute('data-noi18n', '1');
      if (okRt) {
        box.innerHTML = attHtml(t);
        okRt.insertAdjacentElement('afterbegin', box);
        $$('p.v96reg-okl', okRt).forEach((p) => p.classList.add('v97-dup'));
        return;
      }
      box.innerHTML = attHtml(t) + knownHtml(c) + '<div class="v97reg-act">' + laterBtn(c) +
        (failed ? '<button type="button" class="btn" data-v96rerun="' + E(c) + '">' + E(M('🔄 Web 検索つきでもう一度調べる', '🔄 Research again with web search')) + '</button>' : '') + '</div>';
      if (gen) {
        // 21.96 の「自動で1回…」の行は、回数と理由を出す上の欄と重なるので隠す
        if (t) $$('p', gen).forEach((p) => { if (/自動で1回|自動でもう一度調べました|retried once|retry/i.test(p.textContent || '')) p.classList.add('v97-dup'); });
        const act = $('.v96reg-act', gen);
        if (act) act.insertAdjacentElement('beforebegin', box); else gen.appendChild(box);
      } else o.insertAdjacentElement('afterbegin', box);
    } catch (e) { warn('reg', e); }
  }

  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target : null;
    if (!t || !V()) return;
    const a = t.closest('[data-v97later]');
    if (a) { e.preventDefault(); V().laterSet(a.getAttribute('data-v97later'), 10); setTimeout(paintReg, 0); return; }
    const b = t.closest('[data-v97lateroff]');
    if (b) { e.preventDefault(); V().laterOff(b.getAttribute('data-v97lateroff')); setTimeout(paintReg, 0); }
  }, false);

  function deco() { decoCty(); paintReg(); }
  if (RD && typeof RD.after === 'function') {
    const a0 = RD.after;
    RD.after = function () { const r = a0.apply(this, arguments); try { deco(); } catch (e) { warn('after', e); } return r; };
  }
  try {
    let tm = 0;
    new MutationObserver(() => { if (locked()) return; clearTimeout(tm); tm = setTimeout(deco, 160); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
  setTimeout(deco, 0);
})();
