/* ═══ v21.98 cty（2026-11-18 第11回相当 UAT・21.97.2 に対して）販売先国の分析（中身。見せ方は rd_v98cty.js）
   土台・前の層（v95〜v97）は書き換えず、前の関数を控えてから包む。同期サーバーは変えない。
   No.542（中）C 軸受の台湾で、要約「関税 5%」／詳細「関税 5%」なのに「要約と詳細の関税が食い違っています」
     原因：21.97 の照合（V97CTY.audit・logic_v2197cty.js）は、文の中に「関税なし・関税0%・免税・自由港」の語が1つでもあれば「関税なし」と読んでいた。
           ① 打ち消し（「FTA による免税はありません」「免税措置の対象外」）も「関税なし」と読む。
           ② 国ごとの理由・リスクの文は、ほかの国の話（「関税5%は、香港・シンガポール（関税0%）より高い」「シンガポールは関税なしですが、台湾は関税5%」）も
              その国の話として読む。③ アメリカの「通常の関税 0%＋追加関税 12.5%」のような内訳の数を、合計と違うと読む。
           ほかに、全角の数字（５％）・幅（10〜15%）は読めず、本当に違うときに知らせられなかった。小数点（5.0%）の「.」で文を切っていた。
     直し：照合を作り直して V97CTY.audit を置き換える（21.97 の見せ方はそのまま使える形）。
           ・文字をそろえる（全角→半角・〜 の書き方）。文は「。！？改行」と、数字の間でない「. 」で切る。
           ・文の中の国名で区切り、それぞれの国の部分だけを読む（「香港・シンガポール（関税0%）」は2か国の部分。「Xより・Xと比べて」は主語の国の部分）。
           ・「関税」「輸入関税」「追加関税」「duty」の後ろ（税の別の名前＝VAT・GST・営業税・消費税 などの手前まで）から、数（5%・5.0%・5 %）、幅（0〜5%）、
             関税なし（なし・ゼロ・かからない・無税）、要確認を読む。前年比・シェア などの数は読まない。打ち消し（〜ではない・対象外・ありません）は「関税なし」と読まない。
           ・詳細の値は、国の事実の関税（f.duty）に、規制の表の内訳（通常の関税・追加関税）の数も足して比べる。数は 0.05 の差まで同じとみる。幅は重なれば同じ。
           ・1つの部分に数が2つ以上あれば（「5%（ECFA なら0%）」）、どれか1つが合えば食い違いにしない。
           ・照らし合わせた根拠（要約の値・詳細の値・どの文か）を全部残す（V98CTY.auditAll）。見せ方で、警告にも「✓」にも両方の値を出す。
   No.544（中）E マスクの販売先国の画面で、ひな形の品目が「undefined・HS undefined」
     原因：21.97 の関税なしの判定（logic_v2197cty.js の ownSet）は、ひな形に香港・シンガポールの税率が無い商材で「関税なし」の印（v95own）を作るが、
           その印に、ひな形の品目の名前（nm）と HS（tpl）を入れていなかった。21.95 の刷新版の層（rd_v95reg.js の fixRefs）は、ひな形の値を出していない国が
           無いとき、最初の国の印から「アプリのひな形の品目（nm・HS tpl）」を作る。E を「医療・衛生用品」で登録し、進出希望国が「香港・シンガポール・アメリカ」の順
           （香港のひな形は「要確認」・アメリカは代理値なし）だと、香港の印が使われて undefined になる。
     直し：販売先国・規制の表（regsFor・表示中の商品の D.regs）の関税なしの印に、カテゴリーのひな形の品目の名前と HS（21.95 の V95REG.mis）を入れる。
           ひな形の無いカテゴリーでは入れない（見せ方の層が「ひな形なし」と出す）。
   No.545（低）G 木製パズルの販売先国の分析の入力に「賞味期限 1か月」
     原因：ヒアリングの質問は「賞味期限（または保証期間）」の1つの欄で、木製パズルの答え「賞味期限はありません。保証期間は購入後1か月です」が
           商品の shelf にそのまま入る。21.96 の採点（logic_v2196cty.js の shelfMonths）は、カテゴリーを見ずに、この欄の最初の「◯か月」を賞味期限と読む。
           → 入力の欄に「賞味期限 1か月」が出て、海上の日数が長い国の市場性を下げていた（C 軸受の「保証期間 1年」も賞味期限 12か月として減点）。
           ほかの商品の値の取り違えや見本のデータではない（同じ答えで登録し直しても同じ）。保存（冷蔵・冷凍）も、資料の文の語から、カテゴリーを見ずに読んでいた。
     直し：採点の前に、この商品のカテゴリーと HS から、期限の欄の種類を決める（V98CTY.shelfKind）：
           食品・酒類・ペットフード（HS 01〜24 類・カテゴリー 食品・酒類・健康食品）＝賞味期限、化粧品・医薬品・衛生用品（HS 28〜30・33・34・38 類・カテゴリー
           化粧品・医療・衛生用品）と、日用雑貨で「使用期限」と書いてあるもの＝使用期限、それ以外（工業部品・自動車部品・玩具・アパレル など）＝期限の欄なし。
           保証期間・初期不良の文は期限として読まない。期限の欄が無い商材では、冷蔵・冷凍の語も採点に使わない。採点の間だけ商品の値を読み替える（登録の値は変えない）。
           入力の欄は「賞味期限」「使用期限」と書き分け、期限の欄が無い商材では出さない（前の版で採点した分析も、表示のときに外す）。
   No.517（条件つき）同じ商材でも、第10回→第11回で推奨・点数が変わり、理由が見えない（UAT は回ごとに商品を登録し直す＝21.97 の「前回からの変化」が出ない）
     調べ：同じ答えで、同じ商品を2回・別の商品として2回、ほかの画面と見本の商品の分析をはさんで分析した（AI の答えは同じ模擬）。候補国・点数・内訳・推奨は
           A・C・G・H とも全部同じ＝点数（総合・4つの観点・内訳）は入力から一意に決まる（乱数・時刻・候補の並び・ほかの画面の値の影響はない。21.97 で価格の比較も直した）。
           変わるのは ① AI の推奨（AI に接続しているとき、3か国は AI が選ぶ＝実行ごとに揺れる。点数は AI を使わない）と、② 登録し直したときの答えの違い
           （進出希望国・単価・HS・保証期間 など）。②は前の分析が別の商品の記録にあるため、比べる相手が無かった。
     直し：・同じ商材（カテゴリー・HS・品名または会社名が同じ）の別の登録（商品の一覧・ゴミ箱・この端末の記録）から、いちばん新しい分析を見つけ、
             この商品の初めての分析の「前回」にする（21.97 の記録の形）。→「前回の分析からの変化」（入力・候補国・点数の内訳・AI の判断）が、登録し直しても出る。
             AI への依頼にも前回の推奨が渡る。
           ・入力・候補国・進出希望国・全部の国の点数が前回と同じなのに、AI が別の3か国を選んだときは、前回の推奨を保ち、AI の案は「AI の別案」として出す
             （同じ入力なら同じ推奨と点数）。入力か点数が変わったときは、AI の推奨と、変わった理由を出す。
           ・点数のどこが AI か（点数は入力から計算・推奨の3か国は AI の判断か点の順か）、AI が点の順から何位の国を選んだか・点の差、
             同じ商材の直近の分析での AI の推奨の揺れ（何通り・入れ替わった国）を V98CTY.aiPart で出す（見せ方は rd）。 */
var V98CTY = window.V98CTY = { v: "21.98", err: null, errs: [], n: { audit: 0, own: 0, shelf: 0, seed: 0, keep: 0, idx: 0 } };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const m = k + ": " + String((e && e.message) || e).slice(0, 160); V98CTY.err = m; V98CTY.errs.push(m); if (V98CTY.errs.length > 40) V98CTY.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V98CTY.errf = err;
  const V97 = () => W.V97CTY || null;
  const V96 = () => W.V96CTY || null;
  const lang = () => { try { const v = V97(); if (v && typeof v.lang === "function") return v.lang(); } catch (e) { /* 次へ */ } try { const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V98CTY.M = M; V98CTY.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V98CTY.E = E;
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");
  const dd = () => { try { return (typeof D !== "undefined" && D) ? D : null; } catch (e) { return null; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const store = () => { try { return typeof ctyStore === "function" ? ctyStore() : null; } catch (e) { return null; } };
  const ckOf = (p) => { try { let k = String((p && p.catKey) || ""); if (!k || k === "custom") k = typeof catKeyOf === "function" ? String(catKeyOf(p && p.cat) || "") : ""; return k; } catch (e) { return String((p && p.catKey) || ""); } };

  /* ════════════ No.542 要約と詳細の関税の照合 ════════════ */
  const norm = (s) => String(s == null ? "" : s).normalize("NFKC").replace(/[〜～~∼]/g, "〜").replace(/[−–—―]/g, "-").replace(/　/g, " ");
  V98CTY.norm = norm;
  function sents(txt) {
    const t = norm(txt).replace(/(\d)\.(\d)/g, "$1․$2");
    return t.split(/(?<=[。！？!?\n])|(?<=\.)(?=\s|$)/).map((x) => x.replace(/․/g, ".").trim()).filter(Boolean);
  }
  V98CTY.sents = sents;
  const ALIAS = { "アメリカ": ["米国", "アメリカ合衆国", "USA", "United States"], "イギリス": ["英国", "UK", "United Kingdom"], "UAE": ["アラブ首長国連邦", "ドバイ"],
    "韓国": ["Korea"], "台湾": ["Taiwan"], "香港": ["Hong Kong"], "シンガポール": ["Singapore"], "中国": ["China"], "タイ": ["Thailand"], "ベトナム": ["Vietnam", "Viet Nam"],
    "マレーシア": ["Malaysia"], "インドネシア": ["Indonesia"], "フィリピン": ["Philippines"], "インド": ["India"], "オーストラリア": ["豪州", "Australia"], "フランス": ["France"],
    "ドイツ": ["Germany"], "カナダ": ["Canada"], "サウジアラビア": ["サウジ", "Saudi Arabia"] };
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const KANA = "ァ-ヴー";
  const RE_C = {};
  function cRe(c) {
    if (RE_C[c]) return RE_C[c];
    const names = [c].concat(ALIAS[c] || []).filter(Boolean).sort((a, b) => b.length - a.length);
    const parts = names.map((n) => /^[ァ-ヴー]+$/.test(n) ? "(?<![" + KANA + "])" + reEsc(n) + "(?![" + KANA + "])" : /^[A-Za-z ]+$/.test(n) ? "\\b" + reEsc(n) + "\\b" : reEsc(n));
    RE_C[c] = new RegExp(parts.join("|"), "g");
    return RE_C[c];
  }
  function mentions(sn, ctys) {
    const L = [];
    ctys.forEach((c) => { const re = cRe(c); re.lastIndex = 0; let m; while ((m = re.exec(sn))) { L.push({ c, i: m.index, j: m.index + m[0].length }); if (!m[0].length) re.lastIndex++; } });
    L.sort((a, b) => a.i - b.i || (b.j - b.i) - (a.j - a.i));
    const out = [];
    L.forEach((x) => { const last = out[out.length - 1]; if (last && x.i < last.j) return; out.push(x); });
    return out;
  }
  const LISTSEP = /^\s*(?:・|、|,|，|と|や|及び|および|and|&|\/|／|\s)*\s*$/i;
  const CMP = /^\s*(?:と比べ|に比べ|と比較|より|並み|と同じ|と同様|同様|に次いで|のよう|と違い|と異なり|と比較して|than|compared)/i;
  const ADN = /([^、,，\s。]*の)\s*$/;
  // 文を国ごとの部分に分ける（owner0＝その国の理由・リスクの文のとき、その国）
  //   ・「香港・シンガポール（関税0%）」＝並べた国は、後ろの部分を一緒に使う
  //   ・「香港と比べて・香港より」＝その部分は主語の国のもの
  //   ・「関税なしの香港」＝「の」で国につながる句は、その国のもの
  function clauses(sn, ctys, owner0) {
    const ms = mentions(sn, ctys);
    const raw = [{ c: null, txt: sn.slice(0, ms.length ? ms[0].i : sn.length) }];
    ms.forEach((m, k) => raw.push({ c: m.c, txt: sn.slice(m.j, k + 1 < ms.length ? ms[k + 1].i : sn.length) }));
    const segs = [];
    let subj = owner0 ? [owner0] : [], pend = [];
    raw.forEach((r, k) => {
      let txt = r.txt, carry = null;
      const nx = raw[k + 1];
      if (nx) { const mm = txt.match(ADN); if (mm && mm[1] && claimsIn(mm[1]).length) { carry = mm[1]; txt = txt.slice(0, mm.index); } }
      if (r.c == null) segs.push({ owners: subj.slice(), txt, lead: 1 });
      else if (CMP.test(txt)) { segs.push({ owners: subj.slice(), txt, cmp: r.c }); pend = []; }
      else if (!carry && LISTSEP.test(txt)) { segs.push({ owners: [r.c], txt, list: 1 }); pend.push(r.c); } // 並べた国（主語は後ろの国と一緒に決める）
      else { segs.push({ owners: [r.c], txt }); subj = pend.concat([r.c]); pend = []; }
      if (carry) segs.push({ owners: [nx.c], txt: carry, adn: 1 });
    });
    for (let k = segs.length - 2; k >= 0; k--) {
      const s = segs[k], nx = segs[k + 1];
      if (!s.list) continue;
      if (nx.cmp) { segs.splice(k, 1); continue; } // 「香港・シンガポールより」＝比べる相手
      if (!nx.adn && !nx.lead) { nx.owners = s.owners.concat(nx.owners); segs.splice(k, 1); }
    }
    return segs.filter((x) => x.txt && x.txt.trim());
  }
  V98CTY.clauses = clauses;
  const ANCH = /(輸入関税率|輸入関税|追加関税|関税率|関税|import dut(?:y|ies)|dut(?:y|ies) rate|dut(?:y|ies)|tariffs?|关税|aranceles?)/gi;
  const TAXW = /VAT|GST|付加価値税|営業税|消費税|物品税|酒税|貨物税|sales tax|excise|增值税|消费税|impuesto/i;
  const OTHERW = /前年比|成長|伸び|増加|減少|増|減|シェア|割引|マージン|利益|手数料|運賃|為替|上昇|下落|growth|share|margin|discount/i;
  const NEG_AFTER = /^\s*(?:は|が|も)?\s*(?:では(?:な|あり)|でな|じゃな|とは限ら|にはなら|の?対象外|ありません|ない|なし|無し|されない|されません|不可|not)/i;
  const FREE_HEAD = /^(?:なし|無し|ゼロ|かから(?:ない|ず)|かかりません|発生しない|発生しません|免除|撤廃|無税|非課税|free|nil|none|zero)/i;
  const TBC_HEAD = /^(?:要確認|未確認|不明|to be confirmed|tbc|unconfirmed)/i;
  const FREE_SOLO = /無関税|(?<!関税(?:は|が|も)?)無税|免税(?!店)|ゼロ関税|自由港|duty[- ]free|no (?:import )?(?:duty|tariff)|free port|零关税|免关税|sin arancel/gi;
  const PCT = /(\d+(?:\.\d+)?)\s*%/g;
  const RANGE = /(\d+(?:\.\d+)?)\s*%?\s*(?:〜|-|から|to)\s*(\d+(?:\.\d+)?)\s*%/;
  // 部分の文から、関税の言い方を読む
  function claimsIn(t0) {
    const t = norm(t0);
    const out = [];
    ANCH.lastIndex = 0;
    let m;
    while ((m = ANCH.exec(t))) {
      const after = t.slice(m.index + m[0].length);
      let end = Math.min(after.length, 24);
      const stop = after.search(/[。；;]|関税|dut(?:y|ies)|tariff|关税|arancel/i); if (stop >= 0) end = Math.min(end, stop);
      const tx = after.search(TAXW); if (tx >= 0) end = Math.min(end, tx);
      const win = after.slice(0, end);
      const head = win.replace(/^\s*(?:は|が|も|を|：|:|\(|（|of|is|are|rate|率|約|およそ|\s)*/i, "");
      const src = (m[0] + win).trim().slice(0, 40);
      const rg = win.match(RANGE);
      if (rg && !OTHERW.test(win.slice(0, rg.index))) { out.push({ k: "range", a: +rg[1], b: +rg[2], src }); continue; }
      const nums = [];
      PCT.lastIndex = 0;
      let p;
      while ((p = PCT.exec(win))) { if (OTHERW.test(win.slice(0, p.index))) break; nums.push(+p[1]); }
      if (nums.length) { out.push({ k: "rate", v: nums[0], alt: nums.slice(1), src }); continue; }
      const fr = head.match(FREE_HEAD);
      if (fr) { if (NEG_AFTER.test(head.slice(fr[0].length))) continue; out.push({ k: "free", src }); continue; }
      if (TBC_HEAD.test(head)) out.push({ k: "tbc", src });
    }
    // 「関税」の語が無い言い方（無税・免税・自由港 など）。打ち消し（免税はありません・免税措置の対象外）は読まない
    FREE_SOLO.lastIndex = 0;
    while ((m = FREE_SOLO.exec(t))) {
      const rest = t.slice(m.index + m[0].length, m.index + m[0].length + 12).replace(/^(?:措置|枠|制度|の対象|対象|適用)/, "");
      if (NEG_AFTER.test(rest) || /^(?:の)?(?:対象外|適用外)/.test(rest)) continue;
      if (/(?:FTA|EPA|ECFA|協定)[^。]{0,6}$/.test(t.slice(Math.max(0, m.index - 10), m.index)) && /^\s*(?:は|が)?\s*(?:ない|ありません|なし|無し)/.test(t.slice(m.index + m[0].length))) continue;
      out.push({ k: "free", src: t.slice(Math.max(0, m.index - 4), m.index + m[0].length + 4).trim() });
    }
    return out;
  }
  V98CTY.claimsIn = claimsIn;
  // 詳細（アプリの判定）の値：国の事実の関税と、規制の表の内訳（通常の関税・追加関税）の数
  function regOf(c) {
    try { const d = dd(); if (d && d.regs && d.regs[c]) return d.regs[c]; } catch (e) { /* 次へ */ }
    try { return regsFor(typeof ctyCatKey === "function" ? ctyCatKey() : "", [c])[c] || null; } catch (e) { return null; }
  }
  function appOf(r) {
    const f = (r && r.facts) || {};
    const s = norm(f.duty == null ? "" : f.duty);
    const vals = [];
    const take = (x) => { PCT.lastIndex = 0; let m; const t = norm(x); while ((m = PCT.exec(t))) vals.push(+m[1]); };
    take(s);
    let rg = null;
    try { rg = regOf(r.c); } catch (e) { rg = null; }
    if (rg && norm(rg.duty) === s) { take(rg.dutyBase); take(rg.dutyNote); }
    if (f.v97df || /^0(?:\.0+)?\s*%/.test(s) || /関税なし|無税|免税/.test(s)) return { free: 1, main: 0, lo: 0, hi: 0, vals: vals.length ? vals : [0], txt: f.v97df ? "0%" : (f.duty || "0%") };
    const r2 = s.match(RANGE);
    if (r2) return { main: +r2[2], lo: Math.min(+r2[1], +r2[2]), hi: Math.max(+r2[1], +r2[2]), vals, txt: f.duty };
    const m = s.match(/(\d+(?:\.\d+)?)\s*%/);
    if (m) return { main: +m[1], lo: +m[1], hi: +m[1], vals, txt: f.duty };
    return { tbc: 1, vals: [], txt: f.duty == null || f.duty === "" ? "要確認" : String(f.duty) };
  }
  V98CTY.appOf = appOf;
  const near = (a, b) => Math.abs(a - b) <= 0.05;
  // 1つの言い方と詳細の値：true＝同じ・false＝違う・null＝比べられない（詳細が要確認）
  function agree(cl, a) {
    if (cl.k === "tbc") return a.free ? false : a.tbc ? true : null;
    if (a.tbc) return null;
    if (cl.k === "free") return a.lo === 0 || a.main === 0;
    if (cl.k === "rate") { const vs = [cl.v].concat(cl.alt || []); return vs.some((v) => (v >= a.lo - 0.05 && v <= a.hi + 0.05) || near(v, a.main) || a.vals.some((x) => near(x, v))); }
    if (cl.k === "range") { const lo = Math.min(cl.a, cl.b), hi = Math.max(cl.a, cl.b); return !(hi < a.lo - 0.05 || lo > a.hi + 0.05) || a.vals.some((x) => x >= lo - 0.05 && x <= hi + 0.05); }
    return null;
  }
  const fmtN = (v) => (Math.round(v * 100) / 100).toString();
  function clTxt(cl) {
    if (cl.k === "free") return M("関税なし", "no duty", "无关税", "sin arancel");
    if (cl.k === "tbc") return M("関税 要確認", "duty to be confirmed", "关税待确认", "arancel por confirmar");
    if (cl.k === "range") return M("関税 ", "duty ", "关税 ", "arancel ") + fmtN(cl.a) + "〜" + fmtN(cl.b) + "%";
    return M("関税 ", "duty ", "关税 ", "arancel ") + fmtN(cl.v) + "%" + (cl.alt && cl.alt.length ? M("（ほかに ", " (also ", "（另 ", " (también ") + cl.alt.map(fmtN).join("%・") + "%" + M("）", ")", "）", ")") : "");
  }
  V98CTY.clTxt = clTxt;
  // すべての照らし合わせ（根拠つき）。ok＝true（同じ）・false（違う）・null（詳細が要確認で比べられない）
  function auditAll(s) {
    const out = [];
    try {
      if (!s || !Array.isArray(s.rec)) return out;
      const ctys = s.rec.map((r) => r && r.c).filter(Boolean);
      const recOf = (c) => s.rec.find((x) => x && x.c === c);
      const APP = {};
      const appC = (c) => { if (!APP[c]) APP[c] = appOf(recOf(c)); return APP[c]; };
      const check = (where, txt, owner) => {
        sents(txt).forEach((sn) => {
          clauses(sn, ctys, owner).forEach((seg) => {
            if (!seg.owners.length) return;
            const cls = claimsIn(seg.txt);
            if (!cls.length) return;
            seg.owners.forEach((c) => {
              if (!recOf(c)) return;
              const a = appC(c);
              const res = cls.map((cl) => agree(cl, a));
              const ok = res.some((x) => x === true) ? true : res.every((x) => x === null) ? null : false;
              out.push({ c, where, ok, claim: cls.map((cl) => cl.k + (cl.k === "rate" ? ":" + cl.v : cl.k === "range" ? ":" + cl.a + "-" + cl.b : "")).join(","), claimTxt: cls.map(clTxt).filter((x, i, a) => a.indexOf(x) === i).join(M("・", " / ")),
                src: cls.map((cl) => cl.src).join(" … ").slice(0, 80), app: a.txt, appTbc: !!a.tbc, s: sn.slice(0, 140) });
            });
          });
        });
      };
      if (s.ai && s.ai.summary) check("summary", s.ai.summary, null);
      s.rec.forEach((r) => { if (!r) return; check("why", r.why, r.c); check("risk", r.risk, r.c); });
      V98CTY.n.audit++;
    } catch (e) { err("audit", e); }
    return out;
  }
  V98CTY.auditAll = auditAll;
  // 食い違い（警告するもの）だけ。21.97 の見せ方（rd_v97cty.js の auditHtml：x.c・x.s・x.app）にそのまま使える
  V98CTY.audit = (s) => auditAll(s).filter((x) => x.ok === false);
  try { const v = V97(); if (v) { v.audit98 = V98CTY.audit; v.audit97 = v.audit97 || v.audit; v.audit = V98CTY.audit; } } catch (e) { err("auditSet", e); }

  /* ════════════ No.544 関税なしの印に、ひな形の品目の名前と HS ════════════ */
  let CTX = null;
  if (typeof tenantToD === "function") {
    const __td98 = tenantToD;
    tenantToD = function (t) { const prev = CTX; CTX = t || null; try { return __td98.apply(this, arguments); } finally { CTX = prev; } }; // eslint-disable-line no-global-assign
  }
  function fillOwn(regs, t) {
    let n = 0;
    try {
      if (!regs || typeof regs !== "object") return 0;
      const R = W.V95REG;
      let m;
      Object.keys(regs).forEach((c) => {
        const r = regs[c], x = r && r.v95own;
        if (!x || (x.nm && x.tpl) || x.v98) return;
        if (m === undefined) { try { m = R && typeof R.mis === "function" ? R.mis(t || CTX || ten()) : null; } catch (e) { m = null; } }
        if (m && m.tpl && m.nm) { x.tpl = m.tpl; x.nm = m.nm; } else x.noTpl = 1;
        x.v98 = 1;
        n++;
      });
      V98CTY.n.own += n;
    } catch (e) { err("fillOwn", e); }
    return n;
  }
  V98CTY.fillOwn = fillOwn;
  V98CTY.fillD = () => { try { const d = dd(); return d && d.regs ? fillOwn(d.regs, ten()) : 0; } catch (e) { return 0; } };
  if (typeof regsFor === "function") {
    const __rf98 = regsFor;
    regsFor = function () { const out = __rf98.apply(this, arguments); try { fillOwn(out, CTX || ten()); } catch (e) { err("regsFor", e); } return out; }; // eslint-disable-line no-global-assign
  }
  if (typeof switchTen === "function") { const __sw98 = switchTen; switchTen = function () { const r = __sw98.apply(this, arguments); try { V98CTY.fillD(); } catch (e) { err("sw", e); } return r; }; } // eslint-disable-line no-global-assign
  if (typeof rReg === "function") { const __rr98 = rReg; rReg = function () { const r = __rr98.apply(this, arguments); try { V98CTY.fillD(); } catch (e) { err("rReg", e); } return r; }; } // eslint-disable-line no-global-assign

  /* ════════════ No.545 期限の欄の種類（賞味期限・使用期限・なし） ════════════ */
  const WARR = /保証|ギャランティ|初期不良|交換対応|修理対応|warranty|guarantee/i;
  const EXPW = /賞味期限|消費期限|使用期限|使用推奨期限|有効期限|品質保持期限|日持ち|best before|expiry|expiration|use[- ]by|shelf/i;
  const EXP_NEG = /(?:賞味期限|消費期限|使用期限|有効期限|品質保持期限|日持ち)\s*(?:は|が|も)?\s*(?:ありません|ない|なし|無し|該当なし|対象外|設けていません)/;
  const PERISH_CK = ["food", "liquor", "supp", "pet"];
  const USE_CK = ["cosme", "medical"];
  function shelfKind(p) {
    try {
      p = p || dd() || ten();
      if (!p) return { k: "", why: "none" };
      const ck = ckOf(p), hs = digits(p.hs), h2 = hs.length >= 2 ? +hs.slice(0, 2) : 0;
      const raw = norm(p.shelf || "");
      const expTxt = EXPW.test(raw.replace(EXP_NEG, ""));
      let k = "";
      if (h2 >= 1 && h2 <= 24) k = "best"; // 食品・飲料・酒類・ペットフード（HS 01〜24 類）
      else if (!h2 && PERISH_CK.indexOf(ck) >= 0) k = "best";
      else if ([28, 29, 30, 33, 34, 38].indexOf(h2) >= 0) k = "use"; // 化学品・医薬品・化粧品・石けん・除菌剤など
      else if (!h2 && USE_CK.indexOf(ck) >= 0) k = "use";
      else if (PERISH_CK.indexOf(ck) >= 0 && expTxt) k = "best";
      else if ((USE_CK.indexOf(ck) >= 0 || ck === "daily") && expTxt) k = "use"; // 衛生用品・日用雑貨で「使用期限」と書いてあるもの（マスクなど）
      return { k, ck, h2, why: k ? (k === "best" ? "food" : "consumable") : "durable", warr: WARR.test(raw) };
    } catch (e) { err("shelfKind", e); return { k: "", why: "err" }; }
  }
  V98CTY.shelfKind = shelfKind;
  // 期限の欄の文から、保証期間の文と「◯◯はありません」を外す（期限として読む文だけ残す）
  function shelfText(raw, kind) {
    if (!kind) return "";
    const src = norm(raw);
    if (!WARR.test(src) && !EXP_NEG.test(src)) return String(raw == null ? "" : raw);
    const parts = src.replace(/(\d)\.(\d)/g, "$1․$2").split(/(?<=[。.;；\n])|[／/]|、(?=[^、]*(?:保証|初期不良|warranty|guarantee))/).map((x) => x.replace(/․/g, ".").trim()).filter(Boolean);
    const keep = parts.filter((x) => !(WARR.test(x) && !EXPW.test(x.replace(EXP_NEG, ""))) && !EXP_NEG.test(x));
    return keep.join(" ");
  }
  V98CTY.shelfText = shelfText;
  const SHELF_ROW = /賞味期限|消費期限|使用期限|保存期間|shelf/i;
  const STORE_W = /冷凍|frozen|−18|-18\s*℃|冷蔵|チルド|chilled|要冷|10\s*℃以下|refrigerat|常温|ambient|room temperature/i;
  // 採点の間だけ、この商品の期限・保存の値を読み替える（登録の値は変えない）
  function withShelf(fn) {
    const p = dd();
    const K = shelfKind(p || ten());
    if (!p) return fn(K);
    const back = [];
    const set = (o, k, v) => { back.push([o, k, o[k]]); o[k] = v; };
    try {
      const st = shelfText(p.shelf || "", K.k);
      if (String(p.shelf || "") !== st) set(p, "shelf", st);
      if (Array.isArray(p.compRows)) {
        const rows = p.compRows.filter((r) => { const s = Array.isArray(r) ? r.join(" ") : String(r || ""); if (SHELF_ROW.test(s) && (!K.k || (WARR.test(s) && !EXPW.test(s.replace(EXP_NEG, ""))))) return false; if (!K.k && STORE_W.test(s)) return false; return true; });
        if (rows.length !== p.compRows.length) set(p, "compRows", rows);
      }
      if (!K.k) { if (p.store) set(p, "store", ""); if (p.ctn && STORE_W.test(String(p.ctn))) set(p, "ctn", ""); }
      if (back.length) V98CTY.n.shelf++;
    } catch (e) { err("withShelf", e); }
    try { return fn(K); } finally { for (let i = back.length - 1; i >= 0; i--) { const [o, k, v] = back[i]; try { o[k] = v; } catch (e) { /* 無視 */ } } }
  }
  V98CTY.withShelf = withShelf;
  if (typeof ctyScoreAll === "function") {
    const __csa98 = ctyScoreAll;
    ctyScoreAll = function () { // eslint-disable-line no-global-assign
      const args = arguments, self = this;
      return withShelf((K) => {
        const L = __csa98.apply(self, args);
        try { (L || []).forEach((r) => { if (r && r.v96 && r.v96.inp) { r.v96.inp.shelfK = (K && K.k) || ""; if (!(K && K.k)) r.v96.inp.shelf = null; } }); } catch (e) { err("score", e); }
        return L;
      });
    };
  }
  // 入力の欄の書き分け（賞味期限・使用期限）。前の版の分析（shelfK が無い）は、今の商品で決める
  const SHELF_JA = /・?賞味期限 (\d+(?:\.\d+)?)か月/, SHELF_EN = /( · )?Shelf life (\d+(?:\.\d+)?) months/;
  function shelfLabel(txt, inp) {
    try {
      if (typeof txt !== "string" || !inp || inp.shelf == null) return txt;
      const k = inp.shelfK != null ? inp.shelfK : shelfKind().k;
      if (!k) return txt.replace(SHELF_JA, "").replace(SHELF_EN, "").replace(/保存：賞味期限 \d+(?:\.\d+)?か月・/, "保存：").replace(/Storage: shelf life \d+(?:\.\d+)? months, /, "Storage: ");
      if (k === "use") return txt.split("賞味期限").join("使用期限").split("Shelf life").join("Use-by period").split("shelf life").join("use-by period");
      return txt;
    } catch (e) { return txt; }
  }
  V98CTY.shelfLabel = shelfLabel;
  // 21.97 の「前回からの変化」は、記録に点と数だけを残すため、消えた・増えた内訳の行の文（V96CTY.partTxt）が「賞味期限 undefinedか月・海上 約undefined日」になる。
  // 足りない値で文を作れないときは、内訳の種類の名前だけを出す（No.544：undefined を出さない）
  const PNAME = { tpl: ["規制のひな形", "Regulation template"], notpl: ["規制のひな形なし", "No regulation template"], duty0: ["関税 0%", "Duty 0%"], dutyLo: ["関税が低い", "Low duty"], dutyHi: ["関税が高い", "High duty"],
    warn: ["規制の注意", "Regulation warning"], docs: ["必要書類の数", "Number of documents"], kb: ["AI詳細調査の反映", "AI research applied"], dtReq: ["この国で必須の手続き", "Procedures required in this country"],
    dtCon: ["条件つきの手続き", "Conditional procedures"], dtCom: ["どの国にも要る手続き", "Procedures for every country"], dfree: ["HS から関税なし", "No duty (from the HS)"], ban: ["輸入を止める決まり", "Import ban"],
    exp: ["日本からの輸出（通関統計）", "Exports from Japan (customs statistics)"], noPart: ["相手国別の統計なし", "No statistics by partner"], noStat: ["統計なし", "No statistics"], yoy: ["前年比", "Year-on-year"],
    buy: ["商談したバイヤー数", "Buyers met"], frt: ["届けやすさ：単価×運賃", "Delivery: unit price × freight"], shelf: ["保存：期限×海上の日数", "Storage: expiry × days by sea"], cold: ["保存：冷蔵・冷凍×日数", "Storage: chilled/frozen × days"],
    share: ["日本勢のシェア", "Share of Japanese exporters"], grow: ["輸出の伸び", "Export growth"], price: ["価格の比較", "Price comparison"], base: ["STANDAGE拠点", "STANDAGE base"] };
  try {
    const V = V96();
    if (V && typeof V.partTxt === "function" && !V.partTxt._v98) {
      const __pt98 = V.partTxt;
      V.partTxt = function (x) {
        let t = "";
        try { t = __pt98.apply(this, arguments); } catch (e) { t = ""; }
        if (typeof t !== "string" || !t || /undefined|NaN|\[object Object\]|\bnull\b/.test(t)) { const k = x && x.k; const nm = PNAME[k]; return nm ? M(nm[0], nm[1]) : String(k || ""); }
        return t;
      };
      V.partTxt._v98 = 1;
    }
  } catch (e) { err("pt", e); }
  try {
    const V = V96();
    if (V && typeof V.inpTxt === "function" && !V.inpTxt._v98) { const __it = V.inpTxt; V.inpTxt = function (v) { return shelfLabel(__it.apply(this, arguments), v); }; V.inpTxt._v98 = 1; }
    if (V && typeof V.bdHtml === "function" && !V.bdHtml._v98) { const __bd = V.bdHtml; V.bdHtml = function (r) { const h = __bd.apply(this, arguments); return shelfLabel(h, r && r.v96 && r.v96.inp); }; V.bdHtml._v98 = 1; }
  } catch (e) { err("label", e); }

  /* ════════════ No.517 同じ商材の別の登録と比べる・同じ入力なら同じ推奨 ════════════ */
  const nmN = (s) => norm(s).toLowerCase().replace(/[\s・･,，、。．.()（）「」『』【】\-_/／:：]/g, "").replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  function bigr(s) { const o = []; for (let i = 0; i < s.length - 1; i++) o.push(s.slice(i, i + 2)); return o.length ? o : [s]; }
  function nameSim(a, b) { a = nmN(a); b = nmN(b); if (!a || !b) return 0; if (a === b) return 1; if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return 0.9; const A = bigr(a), B = bigr(b).slice(); let hit = 0; A.forEach((x) => { const i = B.indexOf(x); if (i >= 0) { hit++; B.splice(i, 1); } }); return (2 * hit) / (A.length + bigr(b).length); }
  V98CTY.nameSim = nameSim;
  const sigOf = (t) => ({ ck: ckOf(t), hs: digits(t && t.hs).slice(0, 6), nm: String((t && t.item) || ""), co: String((t && t.co) || ""), uid: String((t && t.uid) || "") });
  V98CTY.sigOf = sigOf;
  function sameItem(a, b) {
    if (!a || !b || !a.ck || a.ck !== b.ck) return false;
    if (a.uid && b.uid && a.uid === b.uid) return false;
    const hsOk = a.hs.length >= 4 && b.hs.length >= 4 ? a.hs.slice(0, Math.min(a.hs.length, b.hs.length, 6)) === b.hs.slice(0, Math.min(a.hs.length, b.hs.length, 6)) : null;
    if (hsOk === false) return false;
    const ns = nameSim(a.nm, b.nm);
    if (hsOk) return ns >= 0.5 || (!!a.co && nmN(a.co) === nmN(b.co) && ns >= 0.3);
    return ns >= 0.75;
  }
  V98CTY.sameItem = sameItem;
  const atMs = (sn) => { const v = +(sn && sn.at) || 0; return v; };
  const IDX_KEY = () => { let c = ""; try { c = (typeof SES !== "undefined" && SES && SES.code) || ""; } catch (e) { c = ""; } return "bc20_v98cty_" + String(c).replace(/[^\w-]/g, "").slice(0, 40); };
  function idxRead() { try { const a = JSON.parse(localStorage.getItem(IDX_KEY()) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function idxWrite(t, snap) {
    try {
      if (!t || !snap) return;
      const sg = sigOf(t);
      const L = idxRead().filter((x) => !(x && x.sig && x.sig.uid === sg.uid && x.snap && x.snap.at === snap.at));
      L.push({ sig: sg, item: sg.nm.slice(0, 60), co: sg.co.slice(0, 60), snap });
      localStorage.setItem(IDX_KEY(), JSON.stringify(L.slice(-30)));
      V98CTY.n.idx++;
    } catch (e) { /* この端末に残せないだけ */ }
  }
  // 同じ商材の別の登録の、いちばん新しい分析（商品の一覧 → ゴミ箱 → この端末の記録）
  function findPrev(t) {
    const me = sigOf(t);
    let best = null;
    const consider = (src, h, where) => {
      if (!src || !Array.isArray(h) || !h.length) return;
      const sg = sigOf(src);
      if (!sameItem(me, sg)) return;
      const sn = h[h.length - 1];
      if (!sn || !sn.per) return;
      if (!best || atMs(sn) > atMs(best.snap)) best = { snap: sn, src: { item: sg.nm.slice(0, 60), co: sg.co.slice(0, 60), uid: sg.uid, where, at: atMs(sn), t: String(sn.t || "") } };
    };
    try { (typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []).forEach((x) => { if (x && x !== t && x.ctySel) consider(x, x.ctySel.v97h, "list"); }); } catch (e) { err("prevTens", e); }
    try { if (typeof v33TrashList === "function") v33TrashList().forEach((e) => { const x = e && e.data; const tt = x && (x.ctySel ? x : (x.t && x.t.ctySel ? x.t : (x.ten && x.ten.ctySel ? x.ten : null))); if (tt) consider(tt, tt.ctySel.v97h, "trash"); }); } catch (e) { err("prevTrash", e); }
    try { idxRead().forEach((x) => { if (x && x.sig && x.snap) consider({ catKey: x.sig.ck, hs: x.sig.hs, item: x.sig.nm, co: x.sig.co, uid: x.sig.uid }, [x.snap], "device"); }); } catch (e) { err("prevIdx", e); }
    return best;
  }
  V98CTY.findPrev = findPrev;
  // 入力・候補国・進出希望国・全部の国の点数が同じか
  function sameInputs(a, b) {
    try {
      if (!a || !b) return false;
      const ia = a.inp || {}, ib = b.inp || {};
      const K = ["hs", "cat", "usd", "shelf", "store", "mode"];
      if (K.some((k) => String(ia[k] == null ? "" : ia[k]) !== String(ib[k] == null ? "" : ib[k]))) return false;
      if ((a.cands || []).slice().sort().join("|") !== (b.cands || []).slice().sort().join("|")) return false;
      if ((a.tg || []).join("|") !== (b.tg || []).join("|")) return false;
      const cs = Object.keys(Object.assign({}, a.per || {}, b.per || {}));
      return cs.every((c) => a.per && b.per && a.per[c] && b.per[c] && a.per[c].t === b.per[c].t && a.per[c].rg === b.per[c].rg && a.per[c].mk === b.per[c].mk && a.per[c].cp === b.per[c].cp && a.per[c].bs === b.per[c].bs);
    } catch (e) { return false; }
  }
  V98CTY.sameInputs = sameInputs;
  if (typeof ctyRun === "function") {
    const __cr98 = ctyRun;
    ctyRun = async function () { // eslint-disable-line no-global-assign
      let seeded = null;
      const t = ten();
      try {
        const s = store();
        if (s && t && !W.__ctyBusy && !(Array.isArray(s.v97h) && s.v97h.length)) {
          const P = findPrev(t);
          if (P) { s.v97h = [Object.assign({}, P.snap, { v98src: P.src })]; seeded = P; V98CTY.n.seed++; }
        }
      } catch (e) { err("seed", e); }
      V98CTY.seeding = seeded;
      let out;
      try { out = await __cr98.apply(this, arguments); } finally { V98CTY.seeding = null; }
      try {
        const s = store();
        const h = s && Array.isArray(s.v97h) ? s.v97h : [];
        if (s && h.length && !W.__ctyBusy && s.rec && s.rec.length) {
          const b = h[h.length - 1], a = h.length >= 2 ? h[h.length - 2] : null;
          if (a && b && a.by === "ai" && b.by === "ai" && (a.top || []).length === 3 && (a.top || []).join("|") !== (b.top || []).join("|") && sameInputs(a, b) && !b.v98kept) {
            const aiTop = (b.top || []).slice();
            const keep = (a.top || []).filter((c) => s.rec.some((r) => r && r.c === c));
            if (keep.length === 3) {
              s.top = keep.slice();
              b.top = keep.slice();
              b.v98kept = { ai: aiTop, prev: keep.slice(), ch: b.ch || "" };
              if (s.ai) s.ai.v98kept = b.v98kept;
              V98CTY.n.keep++;
              try { if (typeof ctySave === "function") ctySave(); } catch (e) { /* 次の保存で */ }
            }
          }
          if (b && !b.v98i) { b.v98i = 1; idxWrite(t, b); }
          try { if (typeof render === "function") render(); } catch (e) { /* 次の描き直しで */ }
        }
      } catch (e) { err("run", e); }
      return out;
    };
  }
  // （AI への依頼には、21.97 の層が「前回の推奨・前回からの変化・同じなら保つ」を足す。前回が別の登録の分析でも、同じ商材の前回として渡る）
  // 点数のどこが AI か・AI の推奨の揺れ（見せ方は rd）
  function aiPart(s) {
    try {
      s = s || store();
      if (!s || !Array.isArray(s.rec) || !s.rec.length) return null;
      const rec = s.rec.filter(Boolean);
      const order = rec.slice().sort((x, y) => (x.rank || 99) - (y.rank || 99));
      const rankOf = (c) => { const i = order.findIndex((r) => r.c === c); return i < 0 ? null : i + 1; };
      const scOf = (c) => { const r = rec.find((x) => x.c === c); return r && r.sc ? r.sc.total : null; };
      const loc = order.slice(0, 3).map((r) => r.c);
      const top = (s.top || []).slice(0, 3);
      const by = s.ai ? "ai" : "local";
      const h = Array.isArray(s.v97h) ? s.v97h : [];
      const last = h[h.length - 1] || null;
      const picks = top.map((c) => ({ c, rk: rankOf(c), t: scOf(c) }));
      const out = picks.filter((x) => loc.indexOf(x.c) < 0), drop = loc.filter((c) => top.indexOf(c) < 0).map((c) => ({ c, rk: rankOf(c), t: scOf(c) }));
      const gap = out.length && drop.length ? Math.max(...drop.map((x) => x.t || 0)) - Math.min(...out.map((x) => x.t || 0)) : 0;
      // 同じ商材の直近の分析（この商品の記録・別の登録から引き継いだ前回を含む）での AI の推奨の揺れ
      // AI が挙げた3か国（前回の推奨を保ったときは、AI の案のほう）
      const aiTops = h.filter((x) => x && x.by === "ai" && Array.isArray(x.top) && x.top.length).map((x) => (x.v98kept && Array.isArray(x.v98kept.ai) ? x.v98kept.ai : x.top));
      const aiRuns = aiTops;
      const sets = [];
      aiTops.forEach((x) => { const k = x.slice().sort().join("・"); if (sets.indexOf(k) < 0) sets.push(k); });
      const ever = []; aiTops.forEach((x) => x.forEach((c) => { if (ever.indexOf(c) < 0) ever.push(c); }));
      const always = ever.filter((c) => aiTops.every((x) => x.indexOf(c) >= 0));
      // 3位の境目の同点（同点の国のどれを選ぶかで、推奨が変わりうる）
      const t3 = order[2] && order[2].sc ? order[2].sc.total : null;
      const tie = t3 == null ? [] : order.filter((r) => r.sc && r.sc.total === t3).map((r) => r.c);
      const tot = h.filter((x) => x && x.per).map((x) => Object.keys(x.per).map((c) => x.per[c].t));
      let span = 0;
      if (h.length >= 2) { const cs = Object.keys((last && last.per) || {}); cs.forEach((c) => { const v = h.filter((x) => x && x.per && x.per[c]).map((x) => x.per[c].t); if (v.length >= 2) span = Math.max(span, Math.max(...v) - Math.min(...v)); }); }
      const sc = {}; rec.forEach((r) => { sc[r.c] = r.sc ? r.sc.total : null; });
      return { by, eng: s.ai ? String(s.ai.eng || "") : "", loc, top, picks, out, drop, gap, sc, tie: tie.length >= 2 ? tie : [], t3, same: loc.join("|") === top.join("|"),
        kept: (last && last.v98kept) || (s.ai && s.ai.v98kept) || null, runs: h.length, aiRuns: aiRuns.length, sets: sets.length, ever, always, span, nTot: tot.length,
        src: (h.find((x) => x && x.v98src) || {}).v98src || null };
    } catch (e) { err("aiPart", e); return null; }
  }
  V98CTY.aiPart = aiPart;
  // 21.97 の「前回からの変化」の文：期限の読み方を直したための変化だと分かるように
  try {
    const v = V97();
    if (v && typeof v.diff === "function" && !v.diff._v98) {
      const __df = v.diff;
      v.diff = function (a, b) {
        const D0 = __df.apply(this, arguments);
        try {
          (D0.lines || []).forEach((x) => {
            if (x && x.k === "inp" && /賞味期限（か月）|shelf life \(months\)/.test(x.t)) {
              const ka = a && a.inp && a.inp.shelfK, kb = b && b.inp && b.inp.shelfK;
              if (ka == null && kb != null) x.t += M("（21.98 から、保証期間は賞味期限として読みません。期限の欄が無い商材では使いません）", " (from 21.98, warranty periods are not read as shelf life; not used for goods without an expiry)", "（自21.98起，保修期不再视为保质期；无期限的商品不使用）", " (desde 21.98, la garantía no se lee como vida útil; no se usa en productos sin caducidad)");
            }
          });
        } catch (e) { err("diff", e); }
        return D0;
      };
      v.diff._v98 = 1;
    }
  } catch (e) { err("diffWrap", e); }
})();
