/* 22.00 分野「ai」の中身（2026-11-20 第13回 UAT の直し）
   No.598 トークン上限に達したときの劣化（残りの目安・前もって知らせる・失わない・黙って飛ばさない・見本に置き換えない・取り置き）
   No.597 公式サイトの確かめの1日の上限（取り置き・使い回し・状態の見せ方）
   No.515 429・500・時間切れの見せ方（生の番号・英語を出さない・間をあけて自動でやり直す）
   No.595 AI の答えへのキリル・ギリシャ文字の混入
   AI の答えの速さ（上限のときは待たずに止める・相談の進み具合）
   取り決め：window.v100aiBudget()（AI の残り）／英語資料が途中で止まったら資料に v100partial:{reason,stage,at}
   書き方：前の関数を控えてから包む・二重に包んでも同じ結果（__v100ai の印）・例外は V100AI.err に残す */
(function () {
  "use strict";
  const W = window;
  if (W.V100AI && W.V100AI.loaded) return;
  const V = (W.V100AI = { ver: "22.00", loaded: 1, err: null, errs: [], n: { cap: 0, fast: 0, retry: 0, hold: 0, nice: 0, cyr: 0, deckPart: 0, gapLocal: 0, smpBlock: 0, obReuse: 0, obLeft: 0 },
    tok: [], off: 0, est: {}, op: null, log: [], ob: { left: null, day: "" }, dk: {}, consult: null, obReuseIds: {} });
  function err(k, e) { try { V.err = k + ": " + String((e && e.message) || e).slice(0, 200); V.errs.push(V.err); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録だけ */ } }
  function log(o) { try { o.t = Date.now(); V.log.push(o); if (V.log.length > 200) V.log.shift(); } catch (e) { /* 記録だけ */ } }
  V.errf = err;
  function lang() { try { return (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; } catch (e) { return "ja"; } } // eslint-disable-line no-undef
  function M(ja, en, zh, es) { const l = lang(); return l === "en" ? en || ja : l === "zh" ? zh || en || ja : l === "es" ? es || en || ja : ja; }
  function F(s, o) { let t = String(s); Object.keys(o || {}).forEach((k) => { t = t.split("{" + k + "}").join(String(o[k])); }); return t; }
  function E(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
  V.M = M; V.F = F; V.E = E; V.lang = lang;
  function ten() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function save() { try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 保存できないときはそのまま */ } } // eslint-disable-line no-undef
  function toastS(s) { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
  V.ten = ten; V.save = save;
  function wrap(name, mk) {
    try {
      const f = W[name];
      if (typeof f !== "function" || f.__v100ai) return false;
      const g = mk(f);
      g.__v100ai = 1;
      W[name] = g;
      return true;
    } catch (e) { err("wrap " + name, e); return false; }
  }
  V.wrap = wrap;

  /* ═════════ 日付（日本時間）・0時 ═════════ */
  function dayJ(ts) { return new Date((ts || Date.now()) + 9 * 3600e3).toISOString().slice(0, 10); }
  function resetAt(ts) { const d = new Date((ts || Date.now()) + 9 * 3600e3); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - 9 * 3600e3; }
  function fmtN(n) { n = Math.max(0, Math.round(+n || 0)); if (lang() === "ja" || lang() === "zh") { if (n >= 10000) return (Math.round(n / 1000) / 10).toLocaleString() + (lang() === "zh" ? "万" : "万"); return n.toLocaleString(); } if (n >= 1e6) return (Math.round(n / 1e5) / 10) + "M"; if (n >= 1000) return Math.round(n / 1000) + "k"; return String(n); }
  V.dayJ = dayJ; V.resetAt = resetAt; V.fmtN = fmtN;

  /* ═════════ No.598 ① 上限の仕組み：AI の残り（window.v100aiBudget）═════════
     数えるのは同期サーバー（GAS）の ai_relay：アカウントごとの今日の入力＋出力のトークン（tokUsed）と1日の上限（tokCap。共通・デモ用のコードは tokDemo）。
     上限は呼ぶ前に「今日の量 ≧ 上限」で断る（1回の依頼の途中では止めないので、最後の1回で少し超える＝405万／400万）。全体の上限 tokAll（4,000万）・回数の上限も同じ所。
     アプリは air_me（2分ごと・画面に戻ったとき）で tokUsed・tokCap・used・cap を受け取り V63A.last に持つ。その後の分は、答えに付いてくるトークンの数（costLog）を足して見込む。
     上限で断られたときは中継が HTTP 429「今日の AI の利用量の上限に達しました」を返し、V92AI.lim（day）が立つ。 */
  function usageTok(jr) {
    try {
      const u = (jr && (jr.usage || jr.usageMetadata)) || {};
      return (+(u.prompt_tokens || u.input_tokens || u.promptTokenCount || 0) || 0) + (+(u.completion_tokens || u.output_tokens || u.candidatesTokenCount || 0) || 0);
    } catch (e) { return 0; }
  }
  function addTok(n, tag) {
    n = +n || 0;
    if (n <= 0) return;
    V.tok.push({ at: Date.now(), n, tag: tag || "" });
    if (V.tok.length > 400) V.tok.splice(0, V.tok.length - 400);
    try { if (V.op) V.op.tok += n; } catch (e) { /* 無視 */ }
  }
  V.addTok = addTok;
  wrap("costLog", (o) => function (prov, mdl, jr) { try { addTok(usageTok(jr), String(prov || "")); } catch (e) { err("costLog", e); } return o.apply(this, arguments); });
  function lastMe() { try { const l = typeof V63A !== "undefined" && V63A ? V63A.last : null; return l && l.ok ? l : null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function lastMeAt() { try { return (typeof V63A !== "undefined" && V63A && +V63A.at) || 0; } catch (e) { return 0; } } // eslint-disable-line no-undef
  function capHit() {
    try {
      if (typeof v92aiLimNow !== "function") return V.hitAt && dayJ(V.hitAt) === dayJ() ? { at: V.hitAt } : null; // eslint-disable-line no-undef
      const L = v92aiLimNow(); // eslint-disable-line no-undef
      if (L && L.k === "day") return L;
      if (V.hitAt && dayJ(V.hitAt) === dayJ() && !(typeof V92AI !== "undefined" && V92AI.okAt > V.hitAt)) return { at: V.hitAt, k: "day" }; // eslint-disable-line no-undef
    } catch (e) { err("capHit", e); }
    return null;
  }
  V.capHit = capHit;
  W.v100aiBudget = function () {
    const r = { used: 0, cap: 0, left: null, ratio: null, resetAt: resetAt(), known: false, hit: false, src: "none", at: 0, n: null, shared: false };
    try {
      const l = lastMe(), at = lastMeAt();
      const fresh = l && at && dayJ(at) === dayJ();
      if (l && +l.tokCap > 0) {
        r.cap = +l.tokCap;
        r.used = fresh ? +l.tokUsed || 0 : 0;
        r.src = fresh ? "air_me" : "air_me（前日）";
        r.at = at;
        r.known = true;
        V.tok.forEach((x) => { if (x.at > (fresh ? at : resetAt(at) - 1)) r.used += x.n; });
      }
      if (l && +l.cap > 0) r.n = { used: fresh ? +l.used || 0 : 0, cap: +l.cap };
      try { const S = typeof SES !== "undefined" ? SES : null; r.shared = !!(S && /^(TRIAL|FWD|DEMO)-/i.test(String(S.code || ""))); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      const h = capHit();
      if (h) { r.hit = true; r.known = true; r.hitAt = h.at; }
      if (r.cap > 0) { r.left = Math.max(0, r.cap - r.used); r.ratio = Math.min(1, r.used / r.cap); if (r.used >= r.cap) { r.hit = true; r.hitAt = r.hitAt || at; } }
      if (r.hit) { r.left = 0; r.ratio = 1; }
      else if (r.hit) { r.left = 0; r.ratio = 1; }
      if (r.n && r.n.used >= r.n.cap) { r.hit = true; r.left = 0; r.ratio = 1; r.nHit = true; }
    } catch (e) { err("budget", e); }
    return r;
  };
  /* 処理ごとの目安（トークン）：使った量（costLog）で学ぶ。無いうちは決め打ち（多めに見る） */
  const EST0 = { deck: 300000, ob: 90000, reg: 70000, deep: 70000, xq: 15000, chat: 15000 };
  const ESTK = "bc20_v100ai_est";
  try { const s = JSON.parse(localStorage.getItem(ESTK) || "null"); if (s && typeof s === "object") V.est = s; } catch (e) { /* ブラウザの保存が無いときは決め打ち */ }
  function est(k) { const x = V.est[k]; return x && x.n > 0 ? Math.max(Math.round(x.avg * 1.2), 5000) : EST0[k] || 30000; }
  function learn(k, n) {
    try {
      if (!(n > 0)) return;
      const x = V.est[k] || { avg: 0, n: 0 };
      x.avg = x.n ? Math.round(x.avg * 0.7 + n * 0.3) : n; x.n = Math.min(50, x.n + 1);
      V.est[k] = x;
      localStorage.setItem(ESTK, JSON.stringify(V.est));
    } catch (e) { /* 無視 */ }
  }
  V.est0 = EST0; V.estOf = est; V.learn = learn;
  function opStart(k) { const o = { k, t0: Date.now(), tok: 0, prev: V.op }; V.op = o; return o; }
  function opEnd(o) { try { if (!o) return; V.op = o.prev || null; if (o.prev) o.prev.tok += o.tok; if (o.tok > 0) learn(o.k, o.tok); log({ k: "op", op: o.k, tok: o.tok, ms: Date.now() - o.t0 }); } catch (e) { err("opEnd", e); } }
  V.opStart = opStart; V.opEnd = opEnd;
  const OPNM = { deck: ["英語の営業資料", "English sales deck", "英语营销资料", "Presentación en inglés"], ob: ["バイヤーリスト", "Buyer list", "买家名单", "Lista de compradores"],
    reg: ["規制の詳細調査", "Detailed regulation research", "法规详细调查", "Investigación detallada"], deep: ["国の詳細調査", "Country deep-dive", "国家详细调查", "Estudio del país"],
    xq: ["AI の追加ヒアリングと気づき", "AI follow-up questions and notes", "AI追加问答与发现", "Preguntas adicionales y notas de la IA"], chat: ["相談の答え", "Chat answer", "咨询回答", "Respuesta"] };
  function opName(k) { const a = OPNM[k] || [k]; return M(a[0], a[1], a[2], a[3]); }
  V.opName = opName;
  /* 始める前の見積もり：{ok, k, need, left, hit, low, ratio} */
  function pre(k) {
    const B = W.v100aiBudget(), need = est(k);
    const o = { ok: true, k, need, left: B.left, hit: !!B.hit, known: B.known, ratio: B.ratio, B };
    if (B.hit) o.ok = false;
    else if (B.known && B.left != null && B.left < need) { o.ok = false; o.low = true; }
    return o;
  }
  V.pre = pre;
  /* 取り置き：残り 10% を切ったら、気づき・提案などの自動の AI は止めて、利用者の操作に回す */
  V.RESERVE = 0.9;
  function reserveOn() { const B = W.v100aiBudget(); return !!(B.hit || (B.ratio != null && B.ratio >= V.RESERVE)); }
  V.reserveOn = reserveOn;

  /* ═════════ エラーの種類と、利用者に見せる言葉（No.515）═════════ */
  const DAYRE = /利用回数の上限|利用量の上限|今日の\s*AI\s*の利用|1日の上限|per\s*day|PerDay|daily|air_cap|air_all/i;
  const BUSYRE = /\b429\b|quota|exhaust|rate.?limit|too many requests|混み|混雑|overload|\b529\b|\b503\b|依頼が続いて/i;
  function kindOf(m) {
    m = String((m && m.message) || m || "");
    if (/V92AI_OFF|V100AI_OFF/.test(m)) return "off";
    if (/V100AI_HOLD/.test(m)) return "hold";
    if (DAYRE.test(m)) return "day";
    if (BUSYRE.test(m)) return "busy";
    if (/タイムアウト|timeout|timed out|時間内に/i.test(m)) return "time";
    if (/HTTP\s*5\d\d|Internal Server|Bad Gateway|Service Unavailable|一時的な不具合/i.test(m)) return "srv";
    if (/HTTP\s*40[13]|invalid.?api|api key|unauthori[sz]ed|permission/i.test(m)) return "key";
    if (/接続不可|Failed to fetch|NetworkError|つながりませんでした/i.test(m)) return "net";
    if (/空でした|empty/i.test(m)) return "empty";
    return "other";
  }
  V.kindOf = kindOf;
  function niceMsg(k) {
    switch (k) {
      case "day": return M("今日の AI の利用量の上限に達しました（0時〈日本時間〉に戻ります）", "Today's AI usage limit has been reached (resets at midnight JST)", "已达今日AI使用量上限（日本时间0点恢复）", "Se alcanzó el límite diario de IA (se reinicia a medianoche, hora de Japón)");
      case "busy": return M("AI が混み合っていました（短い時間に依頼が重なったため）", "The AI was busy (too many requests at once)", "AI繁忙（短时间内请求过多）", "La IA estaba ocupada (demasiadas solicitudes a la vez)");
      case "time": return M("AI の答えが時間内に返りませんでした（タイムアウト）", "The AI did not answer in time (timeout)", "AI未在时间内回答（超时）", "La IA no respondió a tiempo");
      case "srv": return M("AI の会社の側で一時的な不具合がありました", "A temporary problem on the AI provider's side", "AI服务商一侧出现临时故障", "Problema temporal del proveedor de IA");
      case "key": return M("AI の接続の設定が使えませんでした（管理者に確認を頼んでください）", "The AI connection settings could not be used (ask your administrator)", "AI连接设置不可用（请联系管理员）", "No se pudo usar la configuración de IA (consulte al administrador)");
      case "net": return M("AI につながりませんでした（通信を確かめてください）", "Could not reach the AI (check the network)", "无法连接AI（请检查网络）", "No se pudo conectar con la IA");
      case "hold": return M("AI の残りが少ないため、自動の AI は止めています（利用者の操作のために取り置き）", "Automatic AI is paused to save the remaining AI for your own actions", "AI余量不足，已暂停自动AI（留给用户操作）", "IA automática en pausa para reservar el saldo restante");
      default: return M("AI から答えを受け取れませんでした", "Could not get an answer from the AI", "未能从AI获得回答", "No se obtuvo respuesta de la IA");
    }
  }
  V.niceMsg = niceMsg;
  /* 文字の中の生の番号・英語の言い方を、やさしい言葉に（画面に出す前に。AI の答えの中身は触らない） */
  const RAWRE = /(?:[（(]\s*)?HTTP\s*(\d{3})\s*[:：]?\s*[^）)\n<]{0,120}?(?=[）)]|<|\n|$)(?:\s*[）)])?/g;
  function niceText(s) {
    s = String(s == null ? "" : s);
    if (!/HTTP\s*\d{3}|Too Many Requests|rate.?limit|RESOURCE_EXHAUSTED|quota exceeded|overloaded_error|Internal Server Error|Bad Gateway|Service Unavailable/i.test(s)) return s;
    let t = s.replace(RAWRE, (m0, code) => {
      const k = code === "429" ? (DAYRE.test(m0) ? "day" : "busy") : /^5/.test(code) ? "srv" : /^40[13]$/.test(code) ? "key" : "other";
      V.n.nice++;
      const open = /^[（(]/.test(m0) ? "（" : "", close = /[）)]\s*$/.test(m0) ? "）" : "";
      return open + niceMsg(k) + close;
    });
    t = t.replace(/Too Many Requests|rate.?limit(?:ed)?|RESOURCE_EXHAUSTED|quota exceeded|overloaded_error/gi, () => { V.n.nice++; return niceMsg("busy"); })
      .replace(/Internal Server Error|Bad Gateway|Service Unavailable/gi, () => { V.n.nice++; return niceMsg("srv"); });
    return t;
  }
  V.niceText = niceText;

  /* ═════════ No.595 キリル・ギリシャ文字の混入を直す ═════════ */
  const CYR = /[Ѐ-ӿ]/, GRK = /[Ͱ-Ͽ]/;
  const HOMO = { "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "к": "k", "м": "m", "т": "t", "і": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "ԛ": "q", "ԝ": "w", "ӏ": "l",
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O", "Р": "P", "С": "C", "Т": "T", "Х": "X", "У": "Y", "І": "I", "Ј": "J", "Ѕ": "S",
    "α": "a", "ο": "o", "ν": "v", "ρ": "p", "τ": "t", "ε": "e", "ι": "i", "κ": "k", "υ": "u", "χ": "x", "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X" };
  const PHON = { "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya", "і": "i", "ї": "yi", "є": "ye" };
  /* よく出る業態・商品の言葉（英語 → 日本語の文の中で使う言い方） */
  const DICT = { consumer: "コンシューマー", distributor: "ディストリビューター", distribution: "流通", retailer: "小売", retail: "小売", importer: "輸入", import: "輸入", wholesaler: "卸", wholesale: "卸",
    premium: "プレミアム", organic: "オーガニック", online: "オンライン", store: "ストア", market: "マーケット", supermarket: "スーパーマーケット", pet: "ペット", beauty: "ビューティー", health: "ヘルス",
    food: "食品", specialty: "専門", chain: "チェーン", trading: "商社", industrial: "産業", automotive: "自動車", toy: "玩具", hotel: "ホテル", restaurant: "レストラン", cosmetics: "化粧品", cosmetic: "化粧品",
    drugstore: "ドラッグストア", pharmacy: "薬局", lifestyle: "ライフスタイル", gift: "ギフト", gourmet: "グルメ", natural: "ナチュラル", brand: "ブランド", select: "セレクト", shop: "ショップ", group: "グループ",
    service: "サービス", supply: "サプライ", partner: "パートナー", global: "グローバル", international: "インターナショナル", company: "会社", limited: "", products: "製品", product: "製品", dealer: "販売店", ecommerce: "EC" };
  const DW = Object.keys(DICT);
  function lev(a, b) { const m = a.length, n = b.length; if (Math.abs(m - n) > 3) return 9; const d = []; for (let i = 0; i <= m; i++) { d[i] = [i]; } for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  function dictHit(w) {
    const x = String(w || "").toLowerCase().replace(/[^a-z]/g, "");
    if (x.length < 3) return "";
    if (DICT[x] != null) return x;
    let best = "", bd = 9;
    DW.forEach((k) => { const d = lev(x, k.replace(/[^a-z]/g, "")); if (d < bd) { bd = d; best = k; } });
    return bd <= Math.max(1, Math.floor(best.length / 4)) ? best : "";
  }
  function fixToken(tok, jaCtx) {
    const vis = tok.split("").map((c) => HOMO[c] || c).join("");
    const visOk = !CYR.test(vis) && !GRK.test(vis);
    const ph = tok.split("").map((c) => { const lo = c.toLowerCase(); if (PHON[lo] != null) { const p = PHON[lo]; return c !== lo && p ? p[0].toUpperCase() + p.slice(1) : p; } return HOMO[c] || c; }).join("");
    const hv = visOk ? dictHit(vis) : "", hp = dictHit(ph);
    const pick = (w, orig) => { if (!w) return orig; if (jaCtx && DICT[w]) return DICT[w]; const o = String(orig); return /^[A-Z]/.test(o) ? w[0].toUpperCase() + w.slice(1) : w; };
    if (visOk && (hv || !hp)) return hv && hv.toLowerCase() !== vis.toLowerCase().replace(/[^a-z]/g, "") ? pick(hv, vis) : vis;
    if (hp) return pick(hp, ph);
    return ph.replace(/[Ѐ-ӿͰ-Ͽ]/g, "");
  }
  function cleanScript(s) {
    s = String(s == null ? "" : s);
    if (!CYR.test(s) && !GRK.test(s)) return s;
    try {
      const letters = (s.match(/[A-Za-zЀ-ӿͰ-Ͽ぀-ヿ一-鿿]/g) || []).length || 1;
      const cyr = (s.match(/[Ѐ-ӿ]/g) || []).length;
      if (cyr / letters > 0.3) return s; // ロシア語などの文そのもの（資料の言語）は触らない
      return s.replace(/[A-Za-zЀ-ӿͰ-Ͽ'’\-]+/g, (tok, off) => {
        const hasC = CYR.test(tok), hasG = GRK.test(tok);
        if (!hasC && !hasG) return tok;
        if (!hasC && hasG) {
          // ギリシャ文字は理科の書き方（α-トコフェロール・β-カロテン・μm・Ω）が正しいことが多い：英字の間に挟まった見た目の似た文字だけ直す
          if (!/[A-Za-z][Ͱ-Ͽ]+[A-Za-z]/.test(tok)) return tok;
          const v = tok.replace(/([A-Za-z])([Ͱ-Ͽ]+)(?=[A-Za-z])/g, (m, a, g) => a + g.split("").map((c) => HOMO[c] || c).join(""));
          if (v !== tok) V.n.cyr++;
          return v;
        }
        const around = s.slice(Math.max(0, off - 12), off) + s.slice(off + tok.length, off + tok.length + 12);
        const jaCtx = /[぀-ヿ一-鿿]/.test(around);
        const f = fixToken(tok, jaCtx);
        V.n.cyr++;
        log({ k: "cyr", from: tok.slice(0, 40), to: String(f).slice(0, 40) });
        return f;
      });
    } catch (e) { err("cyr", e); return s; }
  }
  V.cleanScript = cleanScript;

  /* ═════════ AI の入口（いちばん外の llmAsk）═════════ */
  const OFFMSG = "V100AI_OFF：AI を使わずに作っています";
  function isBg(q, o) { try { if (typeof v98mKind === "function") return v98mKind(q, o || {}) === "bg"; } catch (e) { /* 無い版 */ } return false; } // eslint-disable-line no-undef
  function mkErr(k, raw) { const e = new Error(niceMsg(k)); e.v100k = k; e.raw = String(raw || "").slice(0, 300); return e; }
  function waitMs(ms) { return new Promise((r) => setTimeout(r, ms)); }
  V.cfg = { fastMs: 120000, busyWait: 8000, busyTry: 1 };
  if (typeof W.llmAsk === "function" && !W.llmAsk.__v100ai) {
    const __la = W.llmAsk;
    const g = async function (q, maxTok, opts) {
      const o = opts || {};
      if (V.off) { const e = new Error(OFFMSG); e.v100k = "off"; throw e; }
      const inner = !!(o._noFo || o._retry2 || o._v56askcont || o._v96rt || o._v97rt || o._v100rt);
      if (!inner) {
        // 取り置き：残りが少ないときは自動の AI を止める（利用者の操作に回す）
        if (isBg(q, o) && reserveOn()) { V.n.hold++; log({ k: "hold", q: String(q).slice(0, 30) }); throw mkErr("hold", "V100AI_HOLD"); }
        // 上限に達した後は、AI の会社に何度も頼まず（エンジンの数だけ順に断られるのを待たず）すぐ止める。管理者が上限を上げたときのため、2分たったら1回だけ通す
        const h = capHit();
        if (h && !V.probeAt) V.probeAt = +h.at || Date.now();
        if (h && Date.now() - (V.probeAt || 0) > V.cfg.fastMs) V.probeAt = Date.now();
        else if (h) { V.n.fast++; log({ k: "fast", q: String(q).slice(0, 30) }); throw mkErr("day", "HTTP 429：今日の AI の利用量の上限に達しました"); }
      }
      let tries = 0;
      for (;;) {
        try {
          const r = await __la.apply(this, arguments);
          try { if (r && typeof r.txt === "string") r.txt = cleanScript(r.txt); } catch (x) { err("clean", x); }
          return r;
        } catch (e) {
          const raw = String((e && e.message) || e || "");
          const k = e && e.v100k ? e.v100k : kindOf(raw);
          if (k === "day") { V.n.cap++; if (!V.hitAt || dayJ(V.hitAt) !== dayJ() || Date.now() - V.hitAt > 60000) V.hitAt = Date.now(); V.probeAt = Date.now(); }
          // 混み合い（短い時間の上限）：利用者が押した依頼は、間をあけて1回だけ自動でやり直す（進み具合を出す）
          if (k === "busy" && !inner && !isBg(q, o) && tries < V.cfg.busyTry) {
            tries++; V.n.retry++;
            V.wait = { k: "busy", n: tries + 1, at: Date.now(), ms: V.cfg.busyWait };
            log({ k: "retry", q: String(q).slice(0, 30) });
            try { if (typeof W.v100aiWaitPaint === "function") W.v100aiWaitPaint(); } catch (x) { /* 見せ方だけ */ }
            await waitMs(V.cfg.busyWait);
            V.wait = null;
            continue;
          }
          if (e && e.v92off) throw e;
          if (k === "off" || k === "other" && !/HTTP\s*\d{3}|[A-Za-z]{6,}/.test(raw)) throw e;
          const ne = mkErr(k, raw);
          try { Object.keys(e || {}).forEach((x) => { if (!(x in ne)) ne[x] = e[x]; }); } catch (x) { /* 無視 */ }
          throw ne;
        }
      }
    };
    g.__v100ai = 1;
    W.llmAsk = g;
  }
  /* AI を使わずに作る間（基本の下書きを組む）だけ、AI が無いことにする */
  wrap("ppReady", (o) => function () { if (V.off) return false; return o.apply(this, arguments); });

  /* ═════════ No.598 ③ 英語資料：途中で止まっても失わない ═════════ */
  const STG = { mat: 1, story: 2, write: 3, check1: 4, tr: 5, build: 6, final: 7 };
  const STGNM = { mat: ["素材の確認", "Materials"], story: ["会社の歴史と想いの確認", "Company story"], write: ["文章を書く", "Writing"], check1: ["根拠との照合", "Fact check"], tr: ["価格表などの訳", "Data translation"], build: ["スライドの組み立て", "Building slides"], final: ["最終チェック", "Final check"] };
  V.stageName = (k) => { const a = STGNM[k] || [k, k]; return M(a[0], a[1]); };
  V.stageNo = (k) => STG[k] || 0;
  function deckStore(T) { T = T || ten(); if (!T) return null; T.deck3 = T.deck3 || {}; if (!T.deck3.v100partial || typeof T.deck3.v100partial !== "object") T.deck3.v100partial = {}; return T.deck3; }
  V.deckPartial = function (lang, T) { try { const d = (T || ten()) && (T || ten()).deck3; const p = d && d.v100partial; if (!p) return null; if (lang) return p[lang] || null; const k = Object.keys(p).filter((x) => p[x]); return k.length ? p[k[0]] : null; } catch (e) { return null; } };
  wrap("dk3Plan", (o) => async function (lang) {
    const r = await o.apply(this, arguments);
    try { if (r && r.plan) V.dk[lang] = { plan: r.plan, r, at: Date.now(), key: (typeof dk3PKey === "function" && ten()) ? dk3PKey(ten()) : "" }; } catch (e) { err("plan", e); } // eslint-disable-line no-undef
    return r;
  });
  wrap("dk3PlanLocal", (o) => function (lang) {
    try {
      const c = V.off && V.dk[lang];
      if (c && c.plan && (!c.key || typeof dk3PKey !== "function" || !ten() || c.key === dk3PKey(ten())) && Date.now() - c.at < 6 * 3600e3) { V.offUsedPlan = 1; return c.plan; } // eslint-disable-line no-undef
    } catch (e) { err("planLocal", e); }
    return o.apply(this, arguments);
  });
  wrap("dk14Meta", (o) => function (deck) {
    const m = o.apply(this, arguments);
    try { if (V.partCtx && m && typeof m === "object") { m.v100partial = Object.assign({}, V.partCtx); if (deck && typeof deck === "object") deck.v100partial = Object.assign({}, V.partCtx); } } catch (e) { err("meta", e); }
    return m;
  });
  function failStage() {
    try {
      const s = (typeof DK3G !== "undefined" && DK3G && DK3G.steps) || []; // eslint-disable-line no-undef
      const ng = s.find((x) => x.st === "ng") || s.find((x) => x.st === "on") || s.find((x) => x.st === "wait");
      return ng ? ng.k : "";
    } catch (e) { return ""; }
  }
  /* AI を使わずに、登録データから基本の下書きを組んで保存する（書けた段の文章があれば使う） */
  async function deckOffline(lang, ctx) {
    if (V.off) return false;
    const chain = V.dkChain;
    if (typeof chain !== "function") return false;
    V.off = 1; V.offUsedPlan = 0;
    V.partCtx = { reason: ctx.reason, stage: ctx.stage || "start", stageNo: STG[ctx.stage] || 0, at: Date.now(), lang, kept: 0 };
    try {
      try { if (W.V99PHOTO) W.V99PHOTO.pass = 1; if (W.V96DK) W.V96DK.pass = 1; } catch (e) { /* 写真の確認の画面は、もう決めた */ }
      if (typeof DK3G !== "undefined" && DK3G) DK3G.run = 0; // eslint-disable-line no-undef
      await chain.call(W, lang, true);
      V.partCtx.kept = V.offUsedPlan ? 1 : 0;
      const ok = typeof DK3G !== "undefined" && DK3G && DK3G.deck && !DK3G.err; // eslint-disable-line no-undef
      if (ok) {
        const T = (DK3G.ten) || ten(); // eslint-disable-line no-undef
        const st = deckStore(T);
        const pc = Object.assign({}, V.partCtx, { at: Date.now() });
        st.v100partial[lang] = pc;
        if (st.last && typeof st.last === "object") st.last.v100partial = pc;
        try { DK3G.deck.v100partial = pc; DK3G.v100partial = pc; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        try {
          (DK3G.steps || []).forEach((s) => { // eslint-disable-line no-undef
            if (s.k === "write") s.d = V.offUsedPlan ? M("AI が書いた文章（照合の前）を使って下書きにしました。AI の仕上げは未実施です", "Draft uses the AI-written text (before checking); AI finishing not done") : M("AI の仕上げは未実施です。登録データの文章で基本の下書きを作りました（外国語にはなっていません）", "AI finishing not done. A basic draft was built from your registered data (not translated)");
            if (s.k === "check1") { s.st = "ng"; s.d = M("照合は未実施（AI の上限・失敗のため）", "Fact check not done (AI limit or failure)"); }
          });
        } catch (e) { err("steps", e); }
        save();
        V.n.deckPart++;
        log({ k: "deckPartial", lang, stage: pc.stage, reason: pc.reason });
      }
      return ok;
    } catch (e) { err("deckOffline", e); return false; }
    finally { V.off = 0; V.partCtx = null; }
  }
  V.deckOffline = deckOffline;
  function clearPartial(lang) { try { const st = deckStore(); if (st && st.v100partial[lang]) { delete st.v100partial[lang]; if (st.last && st.last.lang === lang) delete st.last.v100partial; save(); } } catch (e) { err("clearPart", e); } }
  V.clearPartial = clearPartial;
  if (typeof W.dk3Generate === "function" && !W.dk3Generate.__v100ai) {
    const __g = W.dk3Generate;
    V.dkChain = __g;
    const g = async function (lang, force) {
      try { if (typeof DK3G !== "undefined" && DK3G && DK3G.run) return __g.apply(this, arguments); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      if (V.off) return __g.apply(this, arguments);
      // 前もって知らせる：残りが足りないかもしれないときは、始める前に選んでもらう
      if (!V.goAnyway) {
        const P = pre("deck");
        if (!P.ok && typeof W.v100aiPreAsk === "function") {
          const ans = await W.v100aiPreAsk("deck", P);
          if (ans === "cancel") return undefined;
          if (ans === "offline") { await deckOffline(lang || "en", { reason: "cap", stage: "start" }); try { if (typeof render === "function") render(); } catch (e) { /* 無視 */ } return undefined; } // eslint-disable-line no-undef
        }
      }
      V.goAnyway = 0;
      const op = opStart("deck");
      const capBefore = V.n.cap, at0 = (typeof DK3G !== "undefined" && DK3G) ? DK3G.at : 0; // eslint-disable-line no-undef
      let r;
      try { r = await __g.apply(this, arguments); }
      finally { opEnd(op); }
      try {
        const D3 = typeof DK3G !== "undefined" ? DK3G : null; // eslint-disable-line no-undef
        const L = (D3 && D3.lang) || lang || "en";
        const ran = D3 && D3.at && D3.at !== at0 && !D3.run;
        if (ran && D3.err) {
          const stage = failStage();
          const reason = V.n.cap > capBefore || capHit() || DAYRE.test(String(D3.err)) ? "cap" : "error";
          D3.v100fail = { reason, stage, at: Date.now(), err: D3.err };
          log({ k: "deckFail", stage, reason });
          await deckOffline(L, { reason, stage });
          try { if (typeof render === "function" && typeof cur !== "undefined" && cur === "deck") render(); else if (typeof dk3Paint === "function") dk3Paint(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        } else if (ran && D3.deck && !D3.err) clearPartial(L);
      } catch (e) { err("deckAfter", e); }
      return r;
    };
    g.__v100ai = 1;
    W.dk3Generate = g;
  }
  /* 「続きから AI で仕上げる」：書けた段の文章があればそれを使って続きから（無ければ最初から）。下書きは残る */
  W.v100aiDeckResume = function (lang) {
    try {
      const P = pre("deck");
      if (P.hit) { toastS(M("今日の AI の上限に達しているため、0時（日本時間）以降に押してください。下書きはそのまま残っています", "Today's AI limit is reached. Please try after midnight JST; your draft is kept.")); return false; }
      V.goAnyway = 1;
      W.dk3Generate(lang || "en", true);
      return true;
    } catch (e) { err("resume", e); return false; }
  };

  /* ═════════ No.598 ④ 追加ヒアリングと AI の気づき：黙って飛ばさない ═════════ */
  const QBANK = {
    pet: [["原材料の主なものと、その原産国を教えてください（肉・魚・穀物など）", "動物由来の原料は輸入の検疫で確かめられます"], ["対象（犬・猫）とライフステージ（子犬・成犬・シニアなど）を教えてください", "表示と売り場の分け方に使います"], ["保存方法と、開封前・開封後の賞味期限を教えてください", "輸送日数と売り場での日持ちに関わります"]],
    food: [["保存方法（常温・冷蔵・冷凍）と、輸送中の温度の条件を教えてください", "輸送の方法と費用に関わります"], ["原材料の主なものの原産国を教えてください", "原産地の表示と規制の確認に使います"], ["アレルギーの原因になる原材料（乳・卵・小麦・大豆など）を教えてください", "輸出先の表示の決まりで必要です"]],
    cosme: [["国によって使えない・量の決まりがある成分（防腐剤・色素・紫外線を防ぐ成分など）は入っていますか？", "輸出先の成分の規制の確認に使います"], ["使用期限（開封前・開封後）を教えてください", "表示と輸送の日数に関わります"], ["効能の表示（医薬品のような言い方）をしていますか？", "化粧品として売れるかの確認に使います"]],
    ind: [["適合している規格・認証（JIS・ISO など）を教えてください", "買い手の仕様の確認に使います"], ["電池・危険物にあたる部品や材料は含まれますか？", "輸送の方法に関わります"], ["材質の安全の書類（SDS・RoHS・REACH の分かる範囲）はありますか？", "輸出先の化学物質の規制の確認に使います"]],
    toy: [["対象年齢と、小さな部品（誤えんのおそれ）の有無を教えてください", "玩具の安全の決まりの確認に使います"], ["塗料・材料の安全の試験の書類はありますか？", "輸出先の玩具の基準の確認に使います"], ["パッケージに入れられる表示の言語・注意書きを教えてください", "表示の決まりの確認に使います"]],
    med: [["医療機器・医薬品にあたる効能の表示をしていますか？", "医療機器の規制にあたるかの確認に使います"], ["滅菌・抗菌などの処理と、その試験の書類はありますか？", "表示してよい言い方の確認に使います"], ["材質と、肌に触れる部分の安全の書類はありますか？", "輸出先の規制の確認に使います"]],
    gen: [["海外で売るときに、いちばん伝えたい強みは何ですか？", "営業資料とバイヤーへの説明に使います"], ["月にどれくらい作れますか（供給量）？", "バイヤーとの取引の量の相談に使います"], ["英語の書類（仕様書・試験の書類・認証）はありますか？", "輸出先の確認と資料に使います"]]
  };
  function catKey(T) {
    const s = String(((T && (T.cat + " " + T.item)) || "")).toLowerCase();
    if (/ペット|犬|猫|pet|dog|cat food/.test(s)) return "pet";
    if (/化粧|美容|スキンケア|コスメ|serum|cosme|美容液/.test(s)) return "cosme";
    if (/玩具|おもちゃ|パズル|toy|puzzle/.test(s)) return "toy";
    if (/医療|マスク|衛生|mask|medical/.test(s)) return "med";
    if (/軸受|ベアリング|工業|部品|自動車|ブレーキ|bearing|brake|auto|industrial/.test(s)) return "ind";
    if (/食|味噌|茶|調味|菓子|酒|food|miso|tea/.test(s)) return "food";
    return "gen";
  }
  function gapLocal(why) {
    const T = ten() || {};
    const asked = ((T.extraQA || []).map((x) => String(x && x.q || ""))).join("\n");
    const out = [];
    try {
      const s = typeof scoreOf === "function" ? scoreOf(T) : null; // eslint-disable-line no-undef
      ((s && s.missing) || []).slice().sort((a, b) => (+b.w || 0) - (+a.w || 0)).forEach((m) => {
        if (out.length >= 3 || !m || !m.q) return;
        const q = String(m.q).replace(/<[^>]*>/g, "").trim();
        if (q && asked.indexOf(q) < 0) out.push({ q, why: String(m.use || "資料と規制の確認に使います").replace(/<[^>]*>/g, "").slice(0, 60) });
      });
    } catch (e) { err("gapMiss", e); }
    (QBANK[catKey(T)] || QBANK.gen).concat(QBANK.gen).forEach((x) => { if (out.length < 3 && asked.indexOf(x[0]) < 0 && !out.some((y) => y.q === x[0])) out.push({ q: x[0], why: x[1] }); });
    V.n.gapLocal++;
    V.gapMode = { why, at: Date.now(), n: out.length };
    try { T.v100xq = { why, at: Date.now(), n: out.length, done: 0 }; } catch (e) { /* 無視 */ }
    log({ k: "gapLocal", why, n: out.length });
    return { insights: Array.isArray(T.aiNotes) ? T.aiNotes.slice() : [], questions: out, v100local: why };
  }
  V.gapLocal = gapLocal;
  function isCap() { try { return !!(capHit() || W.v100aiBudget().hit); } catch (e) { return !!capHit(); } }
  V.isCap = isCap;
  function gapWhy() { if (isCap()) return "cap"; if (reserveOn()) return "reserve"; const P = pre("xq"); if (!P.ok) return P.hit ? "cap" : "reserve"; return ""; }
  if (typeof W.llmGapAnalyze === "function" && !W.llmGapAnalyze.__v100ai) {
    const __ga = W.llmGapAnalyze;
    const g = async function () {
      if (V.gapForce) { V.gapForce = 0; return __ga.apply(this, arguments); }
      const why = gapWhy();
      if (why) return gapLocal(why);
      const op = opStart("xq");
      try {
        const r = await __ga.apply(this, arguments);
        try { const T = ten(); if (T && T.v100xq) { T.v100xq.done = Date.now(); } } catch (x) { /* 無視 */ }
        return r;
      } catch (e) { const k = e && e.v100k ? e.v100k : kindOf(e); return gapLocal(k === "day" ? "cap" : k === "hold" ? "reserve" : "error"); }
      finally { opEnd(op); }
    };
    g.__v100ai = 1;
    W.llmGapAnalyze = g;
  }
  function whyTxt(why) {
    return why === "cap" ? M("今日の AI の上限に達したため", "because today's AI limit was reached")
      : why === "reserve" ? M("AI の残りが少ないため（利用者の操作のために取り置き）", "because little AI is left (saved for your own actions)")
        : M("AI が応答しなかったため", "because the AI did not respond");
  }
  V.whyTxt = whyTxt;
  /* ヒアリングの文：決まった質問で続けるあいだは、「資料を読み直しました」「AI追加ヒアリング」と言わない */
  wrap("fillSay", (o) => function (who, html) {
    try {
      const G = V.gapMode;
      if (G && who === "ai" && typeof html === "string") {
        if (/資料を読み直しました/.test(html)) {
          const n = G.n;
          html = `${E(F(M("AI の追加の分析と気づきは、{w}行っていません（あとで商品情報の画面の「AI の気づきを出す」から実行できます）。", "AI follow-up analysis and notes were not run {w} (you can run them later from “Get AI notes” on the product screen)."), { w: whyTxt(G.why) }))}<br>` +
            (n ? E(F(M("代わりに、資料と規制の確認に要る点を、決まった質問で {n}問だけ伺います。分からなければ「不明」で構いません。", "Instead, {n} fixed questions about points needed for your documents and regulations. “Unknown” is fine."), { n })) : E(M("決まった質問で伺う点もありませんでした。", "No fixed questions are needed.")));
          if (!n) V.gapMode = null;
        }
        html = html.replace(/🤖 AI追加ヒアリング (\d+)\/(\d+)/, (m, a, b) => "📋 " + M("追加の確認（決まった質問）", "Follow-up (fixed questions)") + " " + a + "/" + b)
          .replace(/＋AI追加ヒアリング(\d+)件/, (m, a) => M("＋追加の確認 " + a + "件（決まった質問・AI の気づきは未実施）", "+" + a + " follow-up answers (fixed questions; AI notes not run)"));
      }
    } catch (e) { err("fillSay", e); }
    return o.apply(this, [who, html].concat([].slice.call(arguments, 2)));
  });
  wrap("llmExtraFinish", (o) => function () { const r = o.apply(this, arguments); V.gapMode = null; return r; });
  /* 後で「AI の気づきを出す」 */
  W.v100aiNotesRun = async function () {
    const T = ten();
    if (!T) return false;
    const P = pre("xq");
    if (P.hit) { toastS(M("今日の AI の上限に達しているため、0時（日本時間）以降に押してください", "Today's AI limit is reached. Please try after midnight JST.")); return false; }
    V.notesBusy = 1;
    try { if (typeof W.v100aiPaintAll === "function") W.v100aiPaintAll(); } catch (e) { /* 無視 */ }
    const op = opStart("xq");
    try {
      V.gapForce = 1;
      const r = await W.llmGapAnalyze();
      const ins = (r && r.insights) || [];
      const old = Array.isArray(T.aiNotes) ? T.aiNotes : [];
      T.aiNotes = old.concat(ins.filter((x) => old.indexOf(x) < 0));
      T.v100xq = Object.assign({}, T.v100xq || {}, { done: Date.now(), qs: ((r && r.questions) || []).map((x) => x.q).slice(0, 3) });
      save();
      toastS(F(M("AI の気づきを {n}件出しました", "{n} AI notes added"), { n: ins.length }));
      try { if (typeof render === "function") render(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      return true;
    } catch (e) {
      const k = e && e.v100k ? e.v100k : kindOf(e);
      toastS(F(M("AI の気づきを出せませんでした（{w}）。あとでもう一度押してください", "Could not get AI notes ({w}). Please try again later"), { w: niceMsg(k) }));
      return false;
    } finally { V.gapForce = 0; V.notesBusy = 0; opEnd(op); try { if (typeof W.v100aiPaintAll === "function") W.v100aiPaintAll(); } catch (e) { /* 無視 */ } }
  };

  /* ═════════ No.598 ⑤ バイヤーリスト：見本（架空）に黙って置き換えない ═════════
     洗い出し（base99.html）：AI の失敗・上限で架空のデータに置き換えるのは v71obBuild（how="smp"→v71obSample）だけ。
     ほかの「見本（架空）」は、見本の商品・業種サンプル・体験の世界の物流会社などの「見本だと書いた」表示で、AI の失敗の置き換えではない（下の V100AI.smpAudit）。 */
  V.smpAudit = [
    { at: "v71obBuild（AIバイヤー開拓のリスト）", how: "AI の失敗・上限・未接続で v71obSample の架空の10社に置き換え → この層で止めた（利用者が「見本を見る」を選んだときだけ）" },
    { at: "v41（バイヤーネットワークの一覧）", how: "最初から「一覧はトライアルの見本（架空）です」と書いた見本の表。AI の失敗とは関係ない（変えない）" },
    { at: "rd_v91smp（完成形の見本の商談の相手）", how: "見本の商品を開いたときだけ【見本（架空）】と書いて出す（変えない）" },
    { at: "v90ana・ダッシュボード（見本の会社を含める）", how: "利用者が選べる切り替え。見本の数は見本と書いて出す（変えない）" },
    { at: "物流会社の画面（デモ物流①〜⑤）", how: "体験の世界の見本の物流会社と書いて出す（変えない）" }
  ];
  V.obUserSample = 0;
  wrap("v71obSample", (o) => function () {
    if (V.obUserSample) return o.apply(this, arguments);
    V.n.smpBlock++; V.obFell = 1;
    return [];
  });
  function obReason(err0) { const k = kindOf(err0 || ""); if (isCap() || k === "day") return "cap"; if (k === "hold") return "reserve"; return err0 ? "error" : "off"; }
  /* AI を使わずに出せる本物の候補：前に AI が挙げた同じ国のリスト（ほかの商品のものも）と、自社のバイヤー（登録） */
  function realCands(cty, n) {
    const out = [], seen = {};
    const key = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9぀-ヿ一-鿿]/g, "");
    const T0 = ten();
    let tens = [];
    try { tens = (typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS.filter(Boolean) : []); if (T0 && tens.indexOf(T0) < 0) tens.unshift(T0); else if (T0) { tens = [T0].concat(tens.filter((x) => x !== T0)); } } catch (e) { tens = T0 ? [T0] : []; } // eslint-disable-line no-undef
    tens.forEach((t) => {
      const runs = (t && t.v71ob && Array.isArray(t.v71ob.runs)) ? t.v71ob.runs.slice().reverse() : [];
      runs.forEach((r) => {
        if (!r || r.how !== "ai" || r.cty !== cty) return;
        (r.leads || []).forEach((l) => {
          if (!l || l.smp || l.v79x || out.length >= n) return;
          const k = key(l.name); if (!k || seen[k]) return; seen[k] = 1;
          const c = JSON.parse(JSON.stringify(l));
          c.id = (typeof v71obId === "function") ? v71obId() : "OB-" + Math.random().toString(36).slice(2, 8); // eslint-disable-line no-undef
          delete c.sent; delete c.ap; delete c.st; delete c.v84q; delete c.v84sk; delete c.v79pend;
          c.st = "new";
          c.v100src = { k: "prev", at: r.at, item: (t.item || t.itemEn || ""), same: t === T0 };
          c.basis = F(M("前のリスト（{d}・AI）", "Earlier list ({d}, AI)"), { d: new Date(r.at).getMonth() + 1 + "/" + new Date(r.at).getDate() });
          c.note = M("前のリストの会社です。送る前に公式サイトで確かめてください", "From an earlier list; check the website before contacting");
          out.push(c);
        });
      });
    });
    // 自社のバイヤー（登録）
    try {
      const B = (typeof myBuyers === "function" ? myBuyers() : null) || []; // eslint-disable-line no-undef
      (Array.isArray(B) ? B : []).forEach((b) => {
        if (!b || out.length >= n) return;
        if (b.v71ob && !b.v100keep) return; // AI のリストから入れた相手は、上の「前のリスト」で数える
        const bc = String(b.cty || b.c || b.country || "");
        if (bc && bc !== cty) return;
        const nm = String(b.co || b.name || ""); const k = key(nm); if (!k || seen[k]) return; seen[k] = 1;
        out.push({ id: (typeof v71obId === "function") ? v71obId() : "OB-" + Math.random().toString(36).slice(2, 8), name: nm.slice(0, 90), city: String(b.city || ""), url: String(b.url || b.web || ""), biz: String(b.biz || b.type || ""), fit: 20, kb: 0, why: "", basis: M("自社のバイヤー（登録）", "Your registered buyer"), contact: String(b.contact || b.mail || b.email || ""), size: String(b.size || ""), note: "", st: "new", v100src: { k: "own" } }); // eslint-disable-line no-undef
      });
    } catch (e) { err("ownBuyers", e); }
    return out;
  }
  V.realCands = realCands;
  if (typeof W.v71obBuild === "function" && !W.v71obBuild.__v100ai) {
    const __b = W.v71obBuild;
    const g = async function () {
      if (V.obUserSample) return __b.apply(this, arguments);
      let f = null;
      try { f = typeof v71obReadForm === "function" ? v71obReadForm() : null; } catch (e) { f = null; } // eslint-disable-line no-undef
      if (f && f.cty) {
        const P = pre("ob");
        if (!P.ok && typeof W.v100aiPreAsk === "function") {
          const ans = await W.v100aiPreAsk("ob", P);
          if (ans === "cancel") return undefined;
          if (ans === "offline") { V.obForceOff = 1; V.obOffWhy = P.hit ? "cap" : "reserve"; }
        }
      }
      let before = null;
      try { before = typeof v71obRun === "function" ? v71obRun() : null; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      V.obFell = 0;
      const op = opStart("ob");
      const tst = W.v71obToast;
      W.v71obToast = function (s) { if (/見本（架空）のリストを出しました/.test(String(s))) return; return tst.apply(this, arguments); };
      if (V.obForceOff) V.off = 1;
      let r;
      try { r = await __b.apply(this, arguments); }
      finally { W.v71obToast = tst; opEnd(op); if (V.obForceOff) { V.off = 0; V.obForceOff = 0; } }
      const offWhy = V.obOffWhy; V.obOffWhy = "";
      try {
        const run = typeof v71obRun === "function" ? v71obRun() : null; // eslint-disable-line no-undef
        if (run && run !== before && (V.obFell || run.how === "smp") && !run.v100smp) {
          const reason = offWhy || obReason(run.err);
          const c = realCands(run.cty, (f && f.n) || 10);
          let ready = { pts: 0 };
          try { ready = typeof v71obReady === "function" ? v71obReady(run.cty) : ready; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
          c.forEach((l) => { l.ready = ready.pts || 0; l.pts = (+l.fit || 0) + (+l.kb || 0) + (ready.pts || 0); try { l.rank = typeof v71obRank === "function" ? v71obRank(l.pts) : l.rank; } catch (e) { /* 無視 */ } l.verify = !(l.v79u && l.v79u.st === "ok"); }); // eslint-disable-line no-undef
          try { if (typeof v79obRescore === "function") v79obRescore({ leads: c }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
          run.leads = c;
          run.how = c.length ? "v100own" : "v100none";
          try { const okc = c.filter((l) => l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st)); okc.forEach((l) => { l.v100reuse = { at: +l.v79u.at || Date.now() }; }); if (c.length) { run.v100chk = { done: okc.length, total: c.length, capped: false, reuse: okc.length, at: Date.now() }; if (okc.length) run.v79chk = { at: Date.now(), st: "ok", n: okc.length }; } } catch (e) { err("ownChk", e); }
          run.v100 = { reason, at: Date.now(), err: niceText(String(run.err || "")).slice(0, 160), n: c.length };
          run.err = "";
          run.insight = c.length
            ? F(M("{w}、AI の新しいリストは作れていません。代わりに、前に AI が挙げた {c} の会社（{n}社・出どころを各行に書いています）を出しています。0時（日本時間）以降に「AI で作り直す」で新しいリストを作れます。", "{w}, a new AI list could not be made. Instead, {n} companies previously listed by the AI for {c} are shown (source on each row). Rebuild with AI after midnight JST."), { w: whyTxt(reason === "off" ? "error" : reason), c: run.cty, n: c.length })
            : F(M("{w}、リストは作れていません（見本の架空の会社には置き換えていません）。0時（日本時間）以降に「AI で作り直す」で作れます。", "{w}, the list could not be made (no fictional sample companies were substituted). Rebuild with AI after midnight JST."), { w: whyTxt(reason === "off" ? "error" : reason) });
          if (reason === "off") run.insight = run.insight.replace(whyTxt("error"), M("AI につながっていないため", "Because the AI is not connected"));
          if (typeof v71obSave === "function") v71obSave(); // eslint-disable-line no-undef
          if (typeof v71obPaint === "function") v71obPaint(); // eslint-disable-line no-undef
          toastS(c.length ? F(M("AI の新しいリストは作れませんでした。前のリストの {n}社を出しています", "No new AI list. Showing {n} companies from earlier lists"), { n: c.length }) : M("AI のリストは作れませんでした（0時以降に作り直せます）", "The AI list could not be made (rebuild after midnight)"));
          log({ k: "obFallback", reason, n: c.length });
        }
      } catch (e) { err("obAfter", e); }
      return r;
    };
    g.__v100ai = 1;
    W.v71obBuild = g;
  }
  /* 利用者が「見本（架空）を見る」を選んだときだけ */
  W.v100aiObSample = function () {
    try {
      const f = v71obReadForm(); // eslint-disable-line no-undef
      if (!f || !f.cty) return false;
      V.obUserSample = 1;
      let leads = [];
      try { leads = v71obSample(f, v71obReady(f.cty), null); } finally { V.obUserSample = 0; } // eslint-disable-line no-undef
      leads.forEach((l) => { l.ready = 0; l.pts = l.fit + l.kb; l.rank = v71obRank(l.pts); l.st = "new"; l.verify = true; }); // eslint-disable-line no-undef
      const S = v71obSt(); // eslint-disable-line no-undef
      S.runs.push({ at: Date.now(), cty: f.cty, biz: f.biz, bizNm: "", n: f.n, how: "smp", v100smp: 1, err: "", insight: M("利用者が選んだ見本（架空）のリストです。実在の会社ではありません。送り先には使えません。", "A fictional sample list you chose to view. These are not real companies."), types: [], kb: [], leads, lang: "" });
      S.cur = S.runs.length - 1;
      v71obSave(); v71obPaint(); // eslint-disable-line no-undef
      return true;
    } catch (e) { err("obSample", e); return false; }
  };

  /* ═════════ No.597 公式サイトの確かめ：取り置き・使い回し・続きから ═════════
     上限（同期サーバー ob79Url_）：1アカウント1日 300社・共通／デモ用 60社（TRIAL-2026 は使う人全員で）・全体 3,000社・1分に4回。
     1回の依頼の社数が残りより多いと、全部まとめて断る（途中まで確かめない）。返事の left が残り。 */
  const SITEK = "bc20_v100_site", SITEDAYS = 14;
  function siteCache() { try { const o = JSON.parse(localStorage.getItem(SITEK) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function siteCachePut(o) { try { const ks = Object.keys(o); if (ks.length > 600) ks.sort((a, b) => (o[a].at || 0) - (o[b].at || 0)).slice(0, ks.length - 600).forEach((k) => delete o[k]); localStorage.setItem(SITEK, JSON.stringify(o)); } catch (e) { /* 無視 */ } }
  function domOf(l) { try { if (typeof v79obReg === "function" && typeof v79obHost === "function") return v79obReg(v79obHost(l.url)) || ""; } catch (e) { /* 無視 */ } try { return new URL(l.url).hostname.replace(/^www\./, ""); } catch (e) { return ""; } } // eslint-disable-line no-undef
  function leadOf(id) { try { const o = typeof v71obLead === "function" ? v71obLead(id) : null; return o ? o.l : null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function checkedOk(l) { return !!(l && l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st)); }
  /* 前に確かめた結果（14日以内）を、ほかのリスト・ほかの商品からも探す */
  function prevResult(l) {
    const d = domOf(l); if (!d) return null;
    const lim = Date.now() - SITEDAYS * 864e5;
    let best = null;
    try {
      const tens = (typeof v79obTens === "function") ? v79obTens() : (ten() ? [ten()] : []); // eslint-disable-line no-undef
      tens.forEach((t) => ((t && t.v71ob && t.v71ob.runs) || []).forEach((r) => (r.leads || []).forEach((x) => {
        if (!x || x === l || !checkedOk(x) || +x.v79u.at < lim || domOf(x) !== d) return;
        if (!best || +x.v79u.at > +best.v79u.at) best = { v79u: x.v79u, v79f: x.v79f, v79mails: x.v79mails, v79page: x.v79page, v79form: x.v79form, at: +x.v79u.at };
      })));
    } catch (e) { err("prev", e); }
    const c = siteCache()[d];
    if (c && +c.at >= lim && (!best || +c.at > best.at)) best = c;
    return best;
  }
  function toItem(id, p) { return { id, site: { st: p.v79u.st, code: p.v79u.code, host: p.v79u.host, final: p.v79u.final, why: p.v79u.why }, form: p.v79f ? { st: p.v79f.st, code: p.v79f.code } : null, mails: p.v79mails || [], page: p.v79page || "", hasForm: !!p.v79form, v100at: p.at }; }
  V.obReserve = 3;
  if (typeof W.v79obCall === "function" && !W.v79obCall.__v100ai) {
    const __c = W.v79obCall;
    const g = async function (op, o, opt) {
      if (op !== "ob_url" || !o || !Array.isArray(o.items)) return __c.apply(this, arguments);
      const all = o.items.slice();
      V.obReuseIds = {};
      const reuse = [], ask = [];
      all.forEach((it) => {
        const l = leadOf(it.id);
        if (V.obOnlyMissing && l && checkedOk(l)) return; // 「確かめ直す」は、まだの会社だけ
        const p = l ? prevResult(l) : null;
        if (p) { reuse.push(toItem(it.id, p)); V.obReuseIds[it.id] = p.at; V.n.obReuse++; } else ask.push(it);
      });
      // 取り置き：残りが少ない日は、1つのリストで上位 3社を先に確かめ、残りの数を次のリストに残す
      const day = dayJ(), knownLeft = V.ob.day === day ? V.ob.left : null;
      let send = ask;
      if (knownLeft != null && knownLeft < 30 && ask.length > V.obReserve && !V.obOnlyMissing) send = ask.slice(0, V.obReserve);
      let r = null, capped = false, sent = 0;
      if (send.length) {
        r = await __c.call(this, op, Object.assign({}, o, { items: send }), opt);
        if (r && r.ok === false && r.reason === "cap") {
          const left = +r.left || 0;
          V.ob = { left, day }; V.n.obLeft++;
          capped = true;
          if (left > 0) {
            const k = Math.min(left, Math.max(1, Math.min(V.obReserve, send.length)));
            r = await __c.call(this, op, Object.assign({}, o, { items: send.slice(0, k) }), opt);
            if (r && r.ok) sent = k;
          }
        } else if (r && r.ok) sent = send.length;
        if (r && r.ok && r.left != null) V.ob = { left: +r.left, day };
      }
      if (!send.length && !reuse.length) { V.obLast = { reuse: 0, sent: 0, asked: 0, total: 0, capped: false, left: V.ob.day === day ? V.ob.left : null, at: Date.now() }; return { ok: true, ob: 1, items: [], v100: V.obLast }; }
      if (!reuse.length && !(r && r.ok)) return r || { ok: false, reason: capped ? "cap" : "net" };
      const items = reuse.concat((r && r.ok && Array.isArray(r.items)) ? r.items : []);
      // 新しく確かめた結果は、会社のドメインごとに控える（14日使い回す）
      try {
        const C = siteCache();
        ((r && r.ok && r.items) || []).forEach((x) => { const l = leadOf(x.id); const d = l ? domOf(l) : ""; const s = x.site || {}; if (d && /^(ok|redir|dead)$/.test(String(s.st))) C[d] = { at: Date.now(), v79u: { st: s.st, code: +s.code || 0, host: s.host || "", final: s.final || "", why: s.why || "", at: Date.now() }, v79f: x.form ? { st: x.form.st, code: +x.form.code || 0 } : null, v79mails: x.mails || [], v79page: x.page || "", v79form: !!x.hasForm }; });
        siteCachePut(C);
      } catch (e) { err("siteput", e); }
      const total = all.filter((it) => { const l = leadOf(it.id); return !(V.obOnlyMissing && l && checkedOk(l)); }).length;
      V.obLast = { reuse: reuse.length, sent, asked: send.length, total, capped: capped || send.length < ask.length, left: V.ob.day === day ? V.ob.left : null, at: Date.now() };
      return { ok: true, ob: 1, items, left: r && r.left, v100: V.obLast };
    };
    g.__v100ai = 1;
    W.v79obCall = g;
  }
  if (typeof W.v79obCheck === "function" && !W.v79obCheck.__v100ai) {
    const __k = W.v79obCheck;
    const g = async function (run, quiet) {
      V.obLast = null;
      if (run && run.v79chk && run.v100chk) V.obOnlyMissing = 1;
      let r;
      try { r = await __k.apply(this, arguments); }
      finally { V.obOnlyMissing = 0; }
      try {
        if (run && V.obLast) {
          const L = (run.leads || []).filter((l) => !l.smp);
          const at = Date.now();
          // 使い回した行は、確かめた日のまま（今日確かめたように見せない）
          L.forEach((l) => { const pa = (V.obReuseIds || {})[l.id]; if (pa && l.v79u) { l.v79u.at = pa; l.v100reuse = { at: pa }; } else if (l.v79u && Math.abs(+l.v79u.at - at) < 120000) delete l.v100reuse; });
          // 確かめていない行は「要確認」のまま（確かめ済みのように見せない）
          L.forEach((l) => { if (!checkedOk(l)) l.verify = true; });
          const done = L.filter(checkedOk).length;
          run.v100chk = { done, total: L.length, capped: !!V.obLast.capped && done < L.length, reuse: L.filter((l) => l.v100reuse).length, left: V.obLast.left, at };
          if (run.v79chk && run.v79chk.st !== "ok" && done) run.v79chk = { at, st: "ok", n: done };
          if (typeof v71obSave === "function") v71obSave(); // eslint-disable-line no-undef
          if (typeof v71obPaint === "function") v71obPaint(); // eslint-disable-line no-undef
        } else if (run && run.v79chk && run.v79chk.st !== "ok") {
          const L = (run.leads || []).filter((l) => !l.smp);
          L.forEach((l) => { if (!checkedOk(l)) l.verify = true; });
          run.v100chk = { done: L.filter(checkedOk).length, total: L.length, capped: run.v79chk.why === "cap", at: Date.now() };
        }
      } catch (e) { err("chkAfter", e); }
      return r;
    };
    g.__v100ai = 1;
    W.v79obCheck = g;
  }

  /* ═════════ 相談の答えの進み具合と呼んだ回数（速さ）═════════ */
  /* 22.00.1 N1：STANDAGE の AI（サーバー経由）につながる前に聞かれた質問は、内蔵の答えにせず、つながるのを待ってから AI に聞く（最長 12秒） */
  function airPending() {
    try {
      if (typeof v63aCust !== "function" || !v63aCust()) return false; // eslint-disable-line no-undef
      if (typeof V63A === "undefined" || !V63A || V63A.old) return false; // eslint-disable-line no-undef
      if (typeof ppReady === "function" && ppReady()) return false; // eslint-disable-line no-undef
      const on = typeof v63aIsOn === "function" && v63aIsOn(); // eslint-disable-line no-undef
      if (on) return false;
      return !V63A.last || !!V63A.busy; // eslint-disable-line no-undef
    } catch (e) { return false; }
  }
  V.airPending = airPending;
  V.cfg.airWaitMs = 12000;
  async function airWait() {
    const t0 = Date.now();
    try { toastS(M("AI につないでいます（数秒）。つながったら、AI がお答えします", "Connecting to the AI (a few seconds). The AI will answer once connected.")); } catch (e) { /* 無視 */ }
    try { if (typeof v63aPull === "function") await Promise.race([v63aPull(true), waitMs(V.cfg.airWaitMs)]); } catch (e) { /* つながらなければ内蔵で答える */ } // eslint-disable-line no-undef
    while (Date.now() - t0 < V.cfg.airWaitMs && !(typeof ppReady === "function" && ppReady())) await waitMs(250); // eslint-disable-line no-undef
    const ok = typeof ppReady === "function" && ppReady(); // eslint-disable-line no-undef
    V.airWaited = { ms: Date.now() - t0, ok };
    log({ k: "airWait", ms: Date.now() - t0, ok });
    if (!ok) toastS(M("AI にまだつながっていません。登録データ（内蔵エンジン）からお答えします", "Not connected to the AI yet. Answering from your registered data (built-in engine)."));
    return ok;
  }
  wrap("askFree", (o) => function (q) {
    const self = this, args = arguments;
    const run = () => {
      try {
        let key = "";
        try { key = (W.RDX && typeof RDX.curKey === "function") ? RDX.curKey() : ""; } catch (e) { key = ""; } // eslint-disable-line no-undef
        V.consult = { q: String(q || "").slice(0, 80), t0: Date.now(), calls: 0, retry: 0, step: 1, done: 0, key }; V.lastQ = { q: String(q || ""), at: Date.now(), k: "chat" };
      } catch (e) { /* 無視 */ }
      // N11：質問を送った時から右下の「考え中」を出す（AI への依頼が順番待ちで遅れて始まっても、経過は送った時刻から・いまの画面のこと）
      try {
        const C = V.consult;
        if (String(q || "").trim() && typeof aiThinkStart === "function" && typeof aiThinkEnd === "function") { // eslint-disable-line no-undef
          const pid = aiThinkStart(M("ご質問の答えを準備しています", "Preparing the answer to your question"), ""); // eslint-disable-line no-undef
          C.pid = pid;
          const chatN = () => { try { const c = document.getElementById("chat"); return c ? c.querySelectorAll(".m").length : 0; } catch (e) { return 0; } };
          const n0 = chatN();
          const answered = () => {
            try {
              const c = document.getElementById("chat"); if (!c) return false;
              const ms = c.querySelectorAll(".m"), last = ms.length ? ms[ms.length - 1] : null;
              // 答えの吹き出しに中身が出たとき（考え中の空の吹き出し〈「AI」の印だけ〉では、まだ答えていない）
              const body = String(last && last.innerText || "").replace(/^\s*AI\s*/, "").trim();
              return ms.length >= n0 + 2 && !!last && last.classList.contains("a") && !last.querySelector(".v92ai-wait") && body.length > 8 && !(C.calls > 0 && !C.lastAt);
            } catch (e) { return false; }
          };
          const tk = setInterval(() => {
            try {
              const items = (typeof AIT !== "undefined" && AIT && AIT.items) || []; // eslint-disable-line no-undef
              const other = items.some((x) => x && x.id !== pid && x.at >= C.t0);
              const ans = answered();
              if (ans && !C.done) C.done = Date.now();
              if (other || ans || C.lastAt || C.done || Date.now() - C.t0 > 180000 || V.consult !== C) { clearInterval(tk); if (items.some((x) => x && x.id === pid)) aiThinkEnd(pid, true); } // eslint-disable-line no-undef
            } catch (e) { clearInterval(tk); }
          }, 250);
        }
      } catch (e) { err("consultCard", e); }
      const r = o.apply(self, args);
      try { if (r && typeof r.then === "function") r.then(() => { if (V.consult) V.consult.done = Date.now(); }, () => { if (V.consult) V.consult.done = Date.now(); }); } catch (e) { /* 無視 */ }
      return r;
    };
    if (String(q || "").trim() && airPending()) return airWait().then(run, run);
    return run();
  });
  wrap("fwdAsk", (o) => function (v) { try { V.lastQ = { q: String(v || ""), at: Date.now(), k: "fwd" }; } catch (e) { /* 無視 */ } return o.apply(this, arguments); });
  if (typeof W.llmAsk === "function") {
    const __lc = W.llmAsk;
    if (!__lc.__v100cnt) {
      const g = async function (q, maxTok, opts) {
        const o = opts || {};
        const C = V.consult;
        const mine = C && !C.done && Date.now() - C.t0 < 300000;
        if (mine) { C.calls++; if (o._retry2) C.retry++; if (o._v56askcont) C.cont = (C.cont || 0) + 1; C.step = 3; C.pend = (C.pend || 0) + 1; }
        const fin = () => { try { if (mine) { C.pend = Math.max(0, (C.pend || 1) - 1); if (!C.pend) { C.lastAt = Date.now(); C.ms = C.lastAt - C.t0; } } } catch (e) { /* 記録だけ */ } };
        try { const r = await __lc.apply(this, arguments); fin(); return r; } catch (e) { fin(); throw e; }
      };
      g.__v100ai = 1; g.__v100cnt = 1;
      W.llmAsk = g;
    }
  }

  /* ═════════ 文字の見張り：保存されたバイヤーリストも、出す前に直す ═════════ */
  function cleanLead(l) { if (!l || typeof l !== "object") return; ["name", "city", "biz", "why", "basis", "note", "size"].forEach((k) => { if (typeof l[k] === "string") { const c = cleanScript(l[k]); if (c !== l[k]) l[k] = c; } }); }
  V.cleanLead = cleanLead;
  wrap("v71obPaint", (o) => function () {
    try { const S = typeof v71obSt === "function" ? v71obSt() : null; ((S && S.runs) || []).forEach((r) => { (r.leads || []).forEach(cleanLead); if (typeof r.insight === "string") r.insight = cleanScript(r.insight); }); } catch (e) { err("obClean", e); } // eslint-disable-line no-undef
    return o.apply(this, arguments);
  });
  /* ═════════ 22.00.1 N1：内蔵の答えの振り分け（よくある言葉だけで話題を決めない）═════════
     detectIntent（土台）は言葉の数で話題を決め、同点なら INTENTS の前の話題が勝つ。「理由」「なぜ」「課題」だけで「失注」、
     「相手」「候補」だけで「バイヤー」、「準備」だけで「商談の準備」などに振られ、質問とずれた内蔵の答えが出ていた。
     → 下の話題は、その話題に固有の言葉が1つも無いときは、よくある言葉を外して選び直す（それでも決まらなければ話題なし＝AI か「答えられません」） */
  const INT_STRONG = {
    lost: /失注|断られ|ことわられ|負け|うまくいかな|保留|見送|止まっ|とまっ/,
    buyer: /バイヤー|取引先|顧客|輸入者|輸入商社|ディストリビューター/i,
    prep: /商談|想定問答|打ち合わせ|面談|質問され|聞かれ/,
    help: /何ができ|なにができ|使い方|つかいかた|ヘルプ|help|こんにちは/i,
    task: /タスク|進捗|スケジュール/,
    missing: /充足|完成度|不足|足りな|埋め/,
    strength: /強み|特徴|差別化|アピール|競合|他社|selling/i,
    price: /いくら|価格|単価|値段|プライス|price|見積|金額|costs|何円|ドル/i,
    order: /受注|入金|請求|支払|回収/,
    reg: /規制|認証|届出|許可|通関|関税|税率|輸出できる|輸入できる|法規|ラベル|duties|duty|tariff|customs|regulat|certif|licen[cs]e|permit|registration|label|restriction/i
  };
  const INT_WEAK = {
    lost: ["なぜ", "理由", "課題", "ボトルネック"],
    buyer: ["相手", "候補", "紹介", "新規"],
    prep: ["準備", "何を話"],
    help: ["はじめ", "どんなこと", "教えて欲しい"],
    task: ["遅れ", "期限", "いつまで", "残り"],
    missing: ["何が必要"],
    strength: ["売り"],
    price: ["卸"],
    order: ["売上"],
    reg: ["登録"]
  };
  V.intStrong = INT_STRONG; V.intWeak = INT_WEAK;
  wrap("detectIntent", (o) => function (q) {
    let r = o.apply(this, arguments);
    try {
      let s = String(q == null ? "" : q);
      for (let i = 0; i < 4 && r && INT_STRONG[r] && !INT_STRONG[r].test(s.normalize("NFKC")); i++) {
        const k = r;
        INT_WEAK[k].forEach((w) => { s = s.split(w).join(" "); });
        const r2 = o.call(this, s);
        log({ k: "intent", from: k, to: r2 || "", q: String(q).slice(0, 30) });
        V.n.intent = (V.n.intent || 0) + 1;
        r = r2 === k ? null : r2;
      }
      // 失注・保留の言葉があるのに話題が決まらないときは、失注・保留の答え（「保留になった相手は？」など）
      if (!r && INT_STRONG.lost.test(String(q == null ? "" : q).normalize("NFKC"))) r = "lost";
    } catch (e) { err("intent", e); }
    return r;
  });

  /* ═════════ 22.00.1 N8：AI への指示に見える文の「場所」が、利用者が打った質問なら、そのとおりに ═════════ */
  wrap("v68dInjWhere", (o) => function (hit) {
    try {
      const L = V.lastQ, h = String(hit || "").trim();
      if (L && h && Date.now() - L.at < 5 * 60000 && L.q.indexOf(h.slice(0, 60)) >= 0)
        return L.k === "fwd" ? "あなたが入力した質問（AI物流マン）" : "あなたが入力した質問（AI商社マンに相談）";
    } catch (e) { err("injWhere", e); }
    return o.apply(this, arguments);
  });
  wrap("v68dPlaceTr", (o) => function (s, li) {
    try {
      const t = String(s || "");
      if (t === "あなたが入力した質問（AI商社マンに相談）") return ["the question you typed (chat with the AI Trade Agent)", "您输入的问题（向AI商社专员咨询）", "la pregunta que escribió (consulta al agente IA)"][li] || t;
      if (t === "あなたが入力した質問（AI物流マン）") return ["the question you typed (AI Logistics Agent)", "您输入的问题（AI物流专员）", "la pregunta que escribió (agente logístico IA)"][li] || t;
    } catch (e) { err("placeTr", e); }
    return o.apply(this, arguments);
  });

  /* ═════════ 22.00.1 N11：右下の「考え中」の経過は、利用者が質問を送った時刻から。どの画面で始めたかを覚える ═════════ */
  wrap("aiThinkStart", (o) => function () {
    const id = o.apply(this, arguments);
    try {
      const it = (typeof AIT !== "undefined" && AIT && AIT.items || []).find((x) => x && x.id === id); // eslint-disable-line no-undef
      if (it) {
        let k = "";
        try { k = (W.RDX && typeof RDX.curKey === "function") ? RDX.curKey() : (typeof cur !== "undefined" ? cur : ""); } catch (e) { k = ""; } // eslint-disable-line no-undef
        it.v100key = k;
        const C = V.consult, A = W.V99FWD && W.V99FWD.ask;
        if (C && !C.lastAt && !C.done && Date.now() - C.t0 < 300000) it.v68at = Math.min(+it.v68at || it.at, C.t0);
        else if (A && !A.done && Date.now() - A.t0 < 300000) it.v68at = Math.min(+it.v68at || it.at, A.t0);
      }
    } catch (e) { err("thinkStart", e); }
    return id;
  });
  /* 1つの操作で呼んだ AI の記録（N10：何を何回呼んでいるか） */
  V.calls = [];
  if (typeof W.llmAsk === "function" && !W.llmAsk.__v100log) {
    const __ll = W.llmAsk;
    const g = async function (q, maxTok, opts) {
      const o = opts || {}, t = Date.now();
      const rec = { t, q: String(q || "").slice(0, 40).replace(/\s+/g, " "), sys: String(o.sys || "").slice(0, 30).replace(/\s+/g, " "), task: o.task || "", bg: isBg(q, o) ? 1 : 0, web: o.forceWeb ? 1 : o.noWeb ? 0 : -1, max: +maxTok || 0, inner: (o._retry2 ? "retry2" : o._v56askcont ? "cont" : o._noFo ? "nofo" : "") };
      V.calls.push(rec); if (V.calls.length > 60) V.calls.shift();
      try {
        const r = await __ll.apply(this, arguments); rec.ms = Date.now() - t; rec.ok = 1; rec.n = (r && r.txt || "").length;
        try {
          rec.prov = String((r && r.prov) || ""); rec.why = String((r && r.why) || "").slice(0, 80);
          rec.cits = (r && Array.isArray(r.cits)) ? r.cits.length : 0; rec.ext = (r && Array.isArray(r.extHits)) ? r.extHits.length : 0;
          const P = (typeof PROV !== "undefined" && PROV && PROV[rec.prov]) || null; // eslint-disable-line no-undef
          rec.eng = P ? P.short : rec.prov; rec.search = P ? (P.search ? 1 : 0) : -1;
          if (o.forceWeb) V.lastWeb = Object.assign({}, rec);
        } catch (x) { /* 記録だけ */ }
        return r;
      } catch (e) { rec.ms = Date.now() - t; rec.ok = 0; rec.err = String((e && e.message) || e).slice(0, 60); if (o.forceWeb) V.lastWeb = Object.assign({}, rec); throw e; }
    };
    g.__v100ai = 1; g.__v100log = 1; g.__v100cnt = 1;
    W.llmAsk = g;
  }

  /* ═════════ 22.00.1 v2 N7：答えの下の「価格表から計算すると」は、質問に数量があるときだけ。単位は商品の単位で ═════════
     21.97（v97 cty）は数量を質問から、無ければ AI の答えから拾っていた（直前の PI の 499袋 を答えが書くと、規制の質問にも計算が付く）。単位も「個」決め打ち */
  const QTY_Q = /(\d[\d,，]*(?:\.\d+)?)\s*(個|本|枚|袋|箱|ケース|セット|缶|瓶|kg|pcs?\.?|units?|pieces?)/i;
  function unitOfProduct() {
    try {
      const d = (typeof D !== "undefined" && D) || ten() || {}; // eslint-disable-line no-undef
      const src = [String(d.moq || "")].concat(((d.priceCols || []).concat((d.priceRows || [])[0] || [])).map(String)).join(" ");
      const m = src.normalize("NFKC").match(/\d\s*(個|本|枚|袋|箱|ケース|セット|缶|瓶|kg)/);
      return m ? m[1] : "";
    } catch (e) { return ""; }
  }
  V.unitOfProduct = unitOfProduct;
  wrap("v84cfAnsMark", (o) => function (o2, q) {
    const r = o.apply(this, arguments);
    try {
      if (r && typeof r.a === "string" && r.a.indexOf("v97calc") >= 0) {
        // 利用者が打った質問だけを見る（答えのために足した文脈〈見本の案件・直前の PI など〉の数量は使わない）
        const L = V.lastQ;
        const raw = L && L.k === "chat" && Date.now() - L.at < 5 * 60000 && String(q || "").indexOf(L.q.slice(0, 20)) >= 0 ? L.q : String(q || "").split(/\n\s*【/)[0];
        const qs = String(raw || "").normalize("NFKC");
        const mq = qs.match(QTY_Q);
        const r0 = r === o2 ? Object.assign({}, o2) : r;
        if (!mq) { r0.a = r.a.replace(/<p class="v97calc[^"]*"[^>]*>[\s\S]*?<\/p>/g, ""); V.n.calcDrop = (V.n.calcDrop || 0) + 1; log({ k: "calcDrop", q: qs.slice(0, 30) }); return r0; }
        const u = /^(個|本|枚|袋|箱|ケース|セット|缶|瓶|kg)$/.test(mq[2]) ? mq[2] : unitOfProduct();
        if (u && u !== "個") r0.a = r.a.replace(/(<p class="v97calc[^"]*"[^>]*>[\s\S]*?)／個 × ([\d,]+)個 ＝([\s\S]*?<\/p>)/g, (m0, a, n, b2) => a + "／" + u + " × " + n + u + " ＝" + b2);
        return r0;
      }
    } catch (e) { err("calcFoot", e); }
    return r;
  });

  /* ═════════ 22.00.1 v1：国別戦略の詳細調査で Web の出どころが0件のとき、Web 検索が動いたか・なぜ出どころが無いかを記録に残す ═════════ */
  wrap("ctyDeepAI", (o) => async function () {
    const t0 = Date.now();
    const r = await o.apply(this, arguments);
    try {
      const w = (V.calls || []).filter((x) => x && x.t >= t0 && x.web === 1).pop() || (V.lastWeb && V.lastWeb.t >= t0 ? V.lastWeb : null);
      if (r && typeof r === "object" && w) r.v100web = { at: Date.now(), eng: w.eng || w.prov || "", search: w.search, cits: w.cits || 0, ext: w.ext || 0, why: w.why || "", ms: w.ms || 0, ok: w.ok, err: w.err || "", tries: (V.calls || []).filter((x) => x && x.t >= t0 && x.web === 1).length };
    } catch (e) { err("deepWeb", e); }
    return r;
  });

  /* ═════════ 22.00.1 v1 N16：バイヤーリストの業態を選ばないとき、商品に合わない業態（工業部品に 飲食・ホテル／農協 など）を条件に入れない ═════════
     V71OB_BIZ は業種ごとに足した業態を含めた全部（21.92 の BX）で、業態を選ばないと全部がリストの条件と AI への依頼に入っていた（21.92 の BIZ_DROP は並べ替えだけ） */
  const OB_DROP = { ind: ["horeca", "spec", "chain"], med: ["horeca", "spec"], cosme: ["horeca"], toy: ["horeca"], pet: ["horeca"], gen: [] , food: [] };
  wrap("v71obReadForm", (o) => function () {
    const f = o.apply(this, arguments);
    try {
      if (f && Array.isArray(f.biz) && !f.biz.length && typeof V71OB_BIZ !== "undefined" && Array.isArray(V71OB_BIZ)) { // eslint-disable-line no-undef
        const T = ten() || {};
        const k = catKey(T);
        const s = String((T.cat || "") + " " + (T.item || "")).toLowerCase();
        const drop = (OB_DROP[k] || []).slice();
        if (k === "ind" && !/農|agri|tractor|肥料|園芸/.test(s)) drop.push("agrico");
        if (k !== "ind" && !/農|agri/.test(s)) drop.push("agrico");
        const keys = V71OB_BIZ.map((x) => x[0]).filter((x) => drop.indexOf(x) < 0); // eslint-disable-line no-undef
        if (keys.length && keys.length < V71OB_BIZ.length) { f.biz = keys; f.v100auto = { drop, k }; } // eslint-disable-line no-undef
      }
    } catch (e) { err("obForm", e); }
    return f;
  });

  /* 規制・国の詳細調査の前の見積もり */
  ["regAIRun", "ctyDeepRun"].forEach((nm) => {
    wrap(nm, (o) => async function () {
      const k = nm === "regAIRun" ? "reg" : "deep";
      const P = pre(k);
      if (P.hit && typeof W.v100aiPreAsk === "function") { const a = await W.v100aiPreAsk(k, P); if (a === "cancel") return undefined; }
      else if (!P.ok && typeof W.v100aiPreAsk === "function") { const a = await W.v100aiPreAsk(k, P); if (a === "cancel") return undefined; }
      const op = opStart(k);
      try { return await o.apply(this, arguments); } finally { opEnd(op); }
    });
  });
})();
