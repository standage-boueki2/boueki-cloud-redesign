/* ═══ v21.97 prod（2026-11-18 第10回相当 UAT・21.96）商品の登録・取り込み・商品情報・貿易ジャーニー
   土台・前の層（v95/logic_v2195prod.js・v96/logic_v2196prod.js・rd/rd_v94jny.js ほか）は書き換えず、前の関数を控えてから包む。
   No.514（未解消・最優先）化粧品の全成分表（INCI）：取り込みで INCI が 0項目・手入力の成分が全部大文字・英語の資料で「Water Water／Glycerin Glycerin」
     原因：① 資料の「成分・材質」の1行（例「成分・材質｜水、グリセリン、BG…」）は、本体が行を「、」で切って1列だけの表にし、
              見出しは資料の表の見出し（項目｜内容｜備考）のまま。21.96 の読み取り（v96pIngrList）は見出しが「全成分・成分・Ingredients・INCI」の
              ときだけ和名と INCI 名の組にするため、「成分・材質」では INCI 名の列が作られず、資料の INCI 名は 0項目だった。
              「水（Water）、グリセリン（Glycerin）…」の組や、英語の名前だけの並び（Water, Glycerin…）も1列のまま（INCI 名の列が空）。
              表の先頭に番号の列（No.｜表示名称｜INCI名）があると、番号が和名として扱われていた（和名「1」「2」…）。
           ② 表示（v68pInciView）は INCI 名を必ず大文字にする（手入力の保存 v68pSave も大文字にして保存）。
           ③ 英語の営業資料（dk3Model）は、成分表の1列目（和名を訳した名前＝Water）と残りの列（INCI 名＝Water）をつないで出すため、
              訳した名前と INCI 名が同じ成分は「Water Water」になっていた（表の行は「Water｜Water · …」）。
     直し：① 化粧品の成分表を、取り込みの最後・AI の読み取りの取り込み・商品情報の表示の前に、決まった形
              「表示名称（和名）｜INCI名（｜配合率…）」にそろえる（v97pCompNorm）。番号の列は外す。1列だけの並びは1つずつ読み、
              「和名（INCI名）」「和名：INCI名」の組を分ける。英語の名前だけのときは INCI 名の列に入れ、和名は内蔵の対応表から逆に引く。
              INCI 名の列が空の成分は、内蔵の対応表（21.96 で足した分を含む）で埋め、出どころ（対応表）を覚える（表示の「出どころ」も対応表のまま）。
              → 取り込みのあと、INCI 名の列そのものに値が入る（「INCI名 c/n成分」がデータの数になる）。
           ② 表示の INCI 名は、すべて大文字のときだけ標準の書き方（先頭だけ大文字：Water・Glycerin・Sodium Hyaluronate・Ceramide NP・
              Caprylic/Capric Triglyceride・1,2-Hexanediol・CI 77891）にする。大文字小文字が混じった入力はそのまま。保存の値は変えない。
              和名の欄が英字で INCI 名と同じ（資料に和名が無い）成分は、和名の欄を「—（資料に和名なし）」にして同じ名前を2回出さない。
           ③ 営業資料（PowerPoint・PDF・見本は同じモデル）の成分表：日本語の資料は「和名｜INCI 名」のまま（同じ名前なら INCI 名の欄を空に）。
              外国語の資料は、1列目を INCI 名（標準の書き方）にし、INCI 名の列は外す（訳した名前と INCI 名を並べない）。見出しは「Ingredient (INCI)」。
              資料のデータ（翻訳のキャッシュ）は書き換えず、作るときの写しだけを直す。
   No.531（中）E マスク：商材カテゴリーを「医療・衛生用品」に補完しても、見出しが「業種ごとの項目（医療機器）」のまま・規制の画面に「業種：医療機器　カテゴリ：医療・衛生用品」
     原因：業種（V68IND.of）は医療・衛生用品を「医療機器」の業種（meddev）にまとめ、見出しの名前（V68IND.label）は業種の名前（医療機器）を出していた。
           カテゴリーを変えても業種の名前は同じなので見出しが追随せず、規制の画面は業種とカテゴリーの2つを並べていた。
     直し：見出しの名前（V68IND.label）は、いま表示している商品の業種と同じ業種のときは、その商品の商材カテゴリーの名前を出す
           （医療・衛生用品→「医療・衛生用品」、建設機械→「建設機械」。その他・中古品・未選択は今まで通り）。カテゴリーを変えると見出しもすぐ変わる。
           規制の画面の「業種：X　カテゴリ：Y」は、X と Y が同じときは「カテゴリ：Y」の1つだけにする。手続き・書類の中身（医療機器の手続き）は変えない。
   No.530（中）貿易ジャーニーの STEP 01 の % が、取り込みの結果（情報の充足度）の % と違う（10/21＝48% と 51%、19/21＝90% と 93%）
     原因：ジャーニー（rd_v94jny）は scoreOf の pct（項目の重みの割合）を出し、取り込みの結果・商品情報の輪（v92prodFill）は「そろった項目の数 ÷ 21」。
           同じ「19/21項目」の横に 90% と 93% が出ていた。HS コードが推定のまま・強みが3件に足りないときの数え方も2つで違った。
     直し：scoreOf の pct・そろった項目・足りない項目を、v92prodFill（必須 a/b・全体 c/d、% は c/d を四捨五入）と同じにする（重みの割合は pctW に残す）。
           ジャーニー・取り込みの結果・活動の記録の「充足度 N%」・ダッシュボードが同じ数になる（ジャーニーの札「90% 19/21項目」の % が、横の項目の数の割合そのものになる）。
   R-5（No.477/483・条件つき）F ブレーキパッド（HS 8708.30）の初回の取り込みで中古車と誤判定
     原因：資料の商材カテゴリーが大分類（自動車・建機）のとき、21.92 の大分類の読み替え（v92catRefine）が、品名のキーワード（中古車・建設機械など）と
           HS（87.02〜87.04 は中古車）からしか細かいカテゴリーを決めない。ブレーキパッド・HS 87.08 はどちらにも当たらず、21.96 の判定（carGuard）で
           自動車部品にしたあとに区分を空に戻し、8つの大分類から選び直させていた（そこで「自動車・建機」を選ぶと中古車の扱いになる）。
           AI の読み取りが「中古車」と答えたときも、取り込み（mergeTen）では部品かどうかを見ていなかった。
     直し：① 大分類が「自動車・建機」（または中古車・未選択）で、HS が部品の項（87.08・87.14・68.13・40.11 など）か、品名が部品（ブレーキパッド・
              フィルター・ワイパーなど）で車両そのもの・建設機械の部品でなければ、読み替えの前に「自動車部品」に決める（大分類の選び直しを出さない）。
           ② AI の読み取りの結果が「中古車」「自動車・建機」でも、品名・HS が部品なら「自動車部品」で取り込む。
           ③ AI ヒアリングで答えた品名（ブレーキパッドなど）からも自動車部品を選べるよう、カテゴリーの言葉に部品の名前を足す。
           利用者が商品情報の画面で選んだ区分は変えない（訂正バナー「自動車部品に直す」は前の版で誤判定された商品のために残す）。
   No.534（中）画面を開くと自動で始まる生成の表示が、90秒ほどで消えて何も保存されない
     どの部品か：左のメニュー「タスク（今日やること）」を開くと、その日はじめての表示で AI 商社マンの「今日やること」の調査（Web 検索込み・todayGen）が
           自動で始まり、右下の「AI商社マンが考え中…」の表示が出る。Web 検索の応答が遅い・失敗すると、表示は「応答を得られませんでした」を2秒ほど出して消え、
           提案は保存されず（todayAI 0件）、その日は自動ではもう始まらない（画面にも理由が出ない）。
           ほかに画面を開くと自動で始まる生成は見当たらない（営業資料・規制の詳細調査・見積は押してから始まる）。
     直し：① 自動で始まったときも、手で「いま再調査する」を押したときも、Web 検索込みの調査の待ち時間を 4分に延ばす。
           ② それでも応答が無い・Web 検索が失敗したときは、自動で1回だけ「登録データだけ」で作り直し、必ず保存まで終える
              （提案の上に「Web 検索がつながらなかったため、登録データだけで提案しました」と出す）。
           ③ 画面の中（右下の表示が消えても残る所）に、調べている間は「調べています（経過・ほかの画面に移っても続きます）」、終わったら
              「N件を保存しました（タスク＞今日やること・HH:MM）」、作れなかったときは理由と［もう一度調べる］を出す。 */
var V97P = window.V97P = { v: "21.97", err: [], n: { norm: 0, dict: 0, title: 0, deck: 0, label: 0, banner: 0, score: 0, pin: 0, xcat: 0, tdRetry: 0, tdOk: 0, tdNg: 0 }, td: null };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { V97P.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97P.err.length > 40) V97P.err.shift(); } catch (x) { /* 記録だけ */ } };
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const NF = (s) => { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.replace(/[\s　]+/g, " ").trim(); };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fnOf = (n) => { try { return typeof W[n] === "function" ? W[n] : null; } catch (e) { return null; } };
  const tr = (s) => { try { const l = lang(); if (l !== "ja" && typeof I18N !== "undefined" && I18N && I18N.dict && I18N.dict[l] && I18N.dict[l][s]) return String(I18N.dict[l][s]); } catch (e) { /* そのまま */ } return ""; };
  V97P.M = M;

  /* ════════════ No.514 全成分表（INCI） ════════════ */
  const JP = /[ぁ-ゖァ-ヶ一-龠々ー]/;
  const inciLike = (s) => { if (/^CI\s?\d{5}$/i.test(NF(s))) return true; try { if (typeof v96pInciLike === "function") return v96pInciLike(s); } catch (e) { /* 下へ */ } s = NF(s); return !!s && !JP.test(s) && /[A-Za-z]{3,}/.test(s) && /^[A-Za-z0-9 ,.'’()\/\-+&:]+$/.test(s); };
  const dictOf = (ja) => { try { return typeof v68pInciDict === "function" ? String(v68pInciDict(ja) || "") : ""; } catch (e) { return ""; } };
  const ikey = (s) => NF(s).replace(/[\s()（）.\-]/g, "").toUpperCase();
  // INCI 名 → 和名（内蔵の対応表を逆に引く。はじめに出てきた和名＝いちばん短い名前を優先）
  let REV = null;
  function rev(inci) {
    try {
      if (!REV) {
        REV = {};
        const add = (o) => { if (!o) return; Object.keys(o).forEach((ja) => { const k = ikey(o[ja]); if (k && (!REV[k] || String(ja).length < REV[k].length)) REV[k] = ja; }); };
        if (typeof V68P_INCI !== "undefined") add(V68P_INCI); // eslint-disable-line no-undef
        if (typeof V96P_INCI_ADD !== "undefined") add(V96P_INCI_ADD); // eslint-disable-line no-undef
      }
      return REV[ikey(inci)] || "";
    } catch (e) { err("rev", e); return ""; }
  }
  // INCI 名の標準の書き方（すべて大文字のときだけ。略号・番号は大文字のまま）
  const ACR = new Set(["BHT", "BHA", "PCA", "EDTA", "PEG", "PPG", "CI", "NP", "AP", "EOP", "NG", "AG", "NS", "DNA", "RNA", "UV", "SPF", "MEA", "DEA", "TEA", "AMP", "PVP", "VP", "HDI", "PG", "DPG", "BG", "MIT", "MCI", "SD", "USP", "FD", "II", "III", "IV", "HCL", "TEA", "AMP", "PPG", "SH", "EGF"]);
  function inciCase(s) {
    const x = String(s == null ? "" : s).trim();
    if (!x || /[a-z]/.test(x) || !/[A-Z]{2,}/.test(x)) return x;
    V97P.n.title++;
    return x.replace(/[A-Za-z0-9]+/g, (w) => {
      if (/\d/.test(w)) return w.toUpperCase();
      if (ACR.has(w.toUpperCase())) return w.toUpperCase();
      if (w.length === 1) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
  }
  V97P.inciCase = inciCase;
  const __ic0 = inciCase;
  const isCosme = (t) => { try { if (typeof v96pIsCosme === "function") return !!v96pIsCosme(t); } catch (e) { /* 下へ */ } return !!t && (/化粧品/.test(String(t.cat || "")) || t.catKey === "cosme"); };
  const INCIH = /INCI|英名|英語|英文|English/i;
  const NOTEH = /備考|メモ|注記|注意|note|remark|用途|目的|機能|function|purpose|由来|origin|産地|規格|区分|種別|配合率|配合量|濃度|%|％/i;
  const PCTH = /配合率|配合量|濃度|%|％|percent/i;
  const GENH = /^(項目|内容|備考|成分|成分名|成分・材質|成分・材質表|材質|全成分|全成分表示|表示名称|表示名称（和名）|和名|名称|名前|key|item|value|ingredients?)$/i;
  const NUMH = /^(no\.?|#|番号|順|順番|連番|№|項番|num)$/i;
  // 1つのセルの文から成分を読む（「水（Water）」「水：Water」「Water」「水 70%」）
  function itemOf(raw) {
    let it = null;
    try { if (typeof v96pItemOf === "function") it = v96pItemOf(raw); } catch (e) { it = null; }
    if (!it) {
      let s = NF(raw).replace(/^[\s・•●○◦\-–—*＊※]+/, "").replace(/[。．.]+$/, "").trim();
      if (!s || s.length > 90) return null;
      let pct = "";
      const pm = s.match(/[\s]*[（(]?\s*(\d+(?:\.\d+)?)\s*(?:%|％|wt%)\s*[）)]?\s*$/i);
      if (pm && pm.index > 0) { pct = pm[1] + "%"; s = s.slice(0, pm.index).trim(); }
      const pp = s.match(/^(.+?)\s*[（(]([^（）()]+)[）)]$/);
      if (pp && inciLike(pp[2]) && JP.test(pp[1])) return { ja: pp[1].trim(), inci: pp[2].trim(), pct };
      it = { ja: s, inci: "", pct };
    }
    if (!it.inci) {
      // 「BG（Butylene Glycol）」：略号の和名＋INCI 名
      const pp = NF(it.ja).match(/^(.+?)\s*[（(]([^（）()]+)[）)]$/);
      if (pp && inciLike(pp[2]) && pp[2].length > pp[1].length && (JP.test(pp[1]) || /^[A-Z0-9.\-]{1,6}$/.test(pp[1].trim()))) { it.ja = pp[1].trim(); it.inci = pp[2].trim(); }
    }
    if (!it.inci && inciLike(it.ja)) { const j = rev(it.ja); it.inci = it.ja; it.ja = j || it.ja; if (!j) it.noJa = 1; it.lat = 1; }
    return it;
  }
  function splitCell(s) {
    let x = NF(s).replace(/(\d),(\d)/g, "$1\u0001$2");
    // 括弧の中の「、」「,」では切らない
    let depth = 0, cur = "", out = [];
    for (const ch of x) {
      if (ch === "（" || ch === "(") depth++;
      if (ch === "）" || ch === ")") depth = Math.max(0, depth - 1);
      if (!depth && /[、,，;；]/.test(ch)) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map((p) => p.replace(/\u0001/g, ",").trim()).filter(Boolean);
  }
  const share = (rows, i, f) => { const v = rows.map((r) => NF(r[i])).filter(Boolean); return v.length ? v.filter(f).length / v.length : 0; };
  // 成分表を「表示名称（和名）｜INCI名（｜配合率…）」にそろえる。変えたら true
  function compNorm(t, why) {
    try {
      if (!t || typeof t !== "object" || !isCosme(t)) return false;
      if (!Array.isArray(t.compRows) || !t.compRows.length) return false;
      const sig0 = JSON.stringify([t.compCols || [], t.compRows]);
      if (t.v97compSig === sig0) return false;
      let cols = (Array.isArray(t.compCols) ? t.compCols : []).map((c) => String(c == null ? "" : c));
      let rows = t.compRows.map((r) => (Array.isArray(r) ? r : [r]).map((v) => (v == null ? "" : String(v))));
      const w = Math.max(cols.length, ...rows.map((r) => r.length));
      while (cols.length < w) cols.push("");
      rows = rows.map((r) => { const a = r.slice(); while (a.length < w) a.push(""); return a; });
      // 「表示名称 / INCI名」を1つの欄に書く表（見本の完成形など）はそのまま
      if (cols.some((c) => /INCI/i.test(c) && /表示名称|和名|成分名/.test(c))) { t.v97compSig = sig0; return false; }
      const dictFrom = Object.assign({}, t.v97inciDict || {});
      // 番号の列（No.｜表示名称｜INCI名）
      if (w >= 2 && (NUMH.test(NF(cols[0])) || (rows.length >= 2 && rows.every((r) => /^\d{1,3}$/.test(NF(r[0]))) && rows.some((r) => NF(r[1]))))) { cols = cols.slice(1); rows = rows.map((r) => r.slice(1)); }
      const single = rows.every((r) => r.slice(1).every((v) => !NF(v)));
      let items = null;
      if (single) {
        items = [];
        const src = Array.isArray(t.v97ingSrc) ? t.v97ingSrc.filter(Boolean) : [];
        if (src.length) src.forEach((s) => splitCell(s).forEach((p) => { const it = itemOf(p); if (it && it.ja) items.push(it); }));
        else rows.forEach((r) => { const s = NF(r[0]); if (!s) return; splitCell(s).forEach((p) => { const it = itemOf(p); if (it && it.ja) items.push(it); }); });
        // 和名の並びと英語（INCI 名）の並びが別々に入っている（「全成分：水、…」と「INCI：Water, …」）：同じ数なら順に組にする
        const jpI = items.filter((x) => !x.lat), enI = items.filter((x) => x.lat);
        if (jpI.length && enI.length) {
          if (jpI.length === enI.length) items = jpI.map((x, i) => Object.assign({}, x, { inci: x.inci || enI[i].inci, pct: x.pct || enI[i].pct }));
          else { const seen = new Set(jpI.map((x) => ikey(x.inci || dictOf(x.ja)))); items = jpI.concat(enI.filter((x) => !seen.has(ikey(x.inci)))); }
        }
      } else {
        // 列を決める：和名の列（日本語の値が多い）・INCI 名の列（見出しか、英字の値が多い）・配合率
        let iI = cols.findIndex((c, i) => INCIH.test(c) && !NOTEH.test(c.replace(INCIH, "")));
        if (iI < 0) iI = cols.findIndex((c, i) => !PCTH.test(c) && !NOTEH.test(c) && share(rows, i, inciLike) >= 0.6);
        let iJ = cols.findIndex((c, i) => i !== iI && share(rows, i, (v) => JP.test(v)) >= 0.6 && !NOTEH.test(c));
        if (iJ < 0) iJ = iI === 0 ? -1 : 0;
        const iP = cols.findIndex((c) => PCTH.test(c));
        items = rows.map((r) => {
          const ja0 = iJ >= 0 ? NF(r[iJ]) : "", in0 = iI >= 0 ? NF(r[iI]) : "";
          let it = { ja: ja0, inci: in0 && inciLike(in0) ? in0 : "", pct: iP >= 0 ? NF(r[iP]) : "" };
          if (!it.ja && it.inci) { const j = rev(it.inci); it.ja = j || it.inci; if (!j) it.noJa = 1; }
          if (it.ja && !it.inci) { const x = itemOf(it.ja); if (x) { it.ja = x.ja; it.inci = x.inci; it.pct = it.pct || x.pct; if (x.noJa) it.noJa = 1; } }
          it.rest = r.filter((v, i) => i !== iI && i !== iJ && i !== iP).map((v) => NF(v));
          it.restCols = cols.filter((c, i) => i !== iI && i !== iJ && i !== iP);
          return it;
        }).filter((x) => x.ja || x.inci);
      }
      if (!items || !items.length) { t.v97compSig = sig0; return false; }
      // 成分の表らしいときだけ（容量・使用期限などの仕様の表は変えない）：成分名（対応表・INCI 名・和名（INCI名）の組）が4割以上、
      // または見出し・題に INCI・全成分・表示名称があって成分名が1つ以上
      const hint = /INCI|全成分|表示名称|和名|Ingredient/i.test(cols.join(" ") + " " + String(t.compTitle || "")) && !/材質|素材/.test(String(t.compTitle || ""));
      const hits = items.filter((x) => x.inci || dictOf(x.ja)).length;
      if (!(hits / items.length >= 0.4 || (hint && hits >= 1))) { t.v97compSig = sig0; return false; }
      // INCI 名の列が空の成分は、内蔵の対応表で埋める（出どころを覚える）
      items.forEach((x) => { if (!x.inci) { const d = dictOf(x.ja); if (d) { x.inci = __ic0(d); dictFrom[x.ja] = 1; V97P.n.dict++; } } else if (dictFrom[x.ja] && ikey(x.inci) !== ikey(dictOf(x.ja))) delete dictFrom[x.ja]; });
      // 同じ成分（和名と INCI 名が同じ）を2回入れない
      { const sk = new Set(); items = items.filter((x) => { const k = ikey(x.ja) + "|" + ikey(x.inci); if (sk.has(k)) return false; sk.add(k); return true; }); }
      const hasPct = items.some((x) => x.pct);
      const restCols = (items[0] && items[0].restCols) || [];
      const keepRest = restCols.map((c, i) => items.some((x) => x.rest && x.rest[i])).map((b, i) => b ? i : -1).filter((i) => i >= 0);
      const nc = ["表示名称（和名）", "INCI名"].concat(hasPct ? ["配合率"] : []).concat(keepRest.map((i) => restCols[i] || "備考"));
      const nr = items.map((x) => [x.ja, x.inci || ""].concat(hasPct ? [x.pct || ""] : []).concat(keepRest.map((i) => (x.rest && x.rest[i]) || "")));
      const sig1 = JSON.stringify([nc, nr]);
      t.v97inciDict = dictFrom;
      const noJa = items.filter((x) => x.noJa).map((x) => x.ja);
      if (noJa.length) t.v97noJa = noJa; else delete t.v97noJa;
      if (sig1 !== sig0) {
        t.compCols = nc; t.compRows = nr;
        const ti = String(t.compTitle || "");
        if (!ti || /^(成分表・材質表|成分表|成分・スペック表|成分・材質表|成分・材質)$/.test(ti)) t.compTitle = "全成分表（INCI）";
        t.v97comp = { n: nr.length, inci: nr.filter((r) => r[1]).length, dict: Object.keys(dictFrom).length, from: why || "", at: Date.now() };
        V97P.n.norm++;
      }
      t.v97compSig = JSON.stringify([t.compCols, t.compRows]);
      return sig1 !== sig0;
    } catch (e) { err("norm", e); return false; }
  }
  V97P.compNorm = compNorm;
  // 資料の「成分・材質｜水、グリセリン…」の行の文そのもの（本体が「1,2-ヘキサンジオール」「カプリル酸/カプリン酸」を切ってしまう前の形）
  const ING_LBL = /^(成分・材質|成分・材質表|成分|成分表|成分表示|全成分|全成分表|全成分表示|全成分表示名称|配合成分|INCI|INCI名|INCI名称|Ingredients?|Full ingredients?(?: list)?)$/i;
  function ingSrc(t, text, grids) {
    try {
      if (!t || !isCosme(t)) return;
      const out = [];
      (grids || []).forEach((g) => (g || []).forEach((r) => {
        const c = (r || []).map((x) => NF(x));
        for (let i = 0; i < c.length - 1; i++) if (ING_LBL.test(c[i].replace(/[（(][^）)]*[）)]/g, "").trim()) && /[、,，;；]/.test(c[i + 1]) && c[i + 1].length <= 4000) { out.push(c[i + 1]); break; }
      }));
      String(text || "").split(/\n/).forEach((l) => { const m = NF(l).match(/^(.{1,24}?)\s*[：:｜|\t]\s*(.+)$/); if (m && ING_LBL.test(m[1].replace(/[（(][^）)]*[）)]/g, "").trim()) && /[、,，;；]/.test(m[2]) && out.indexOf(m[2]) < 0) out.push(m[2]); });
      if (out.length) { t.v97ingSrc = out.slice(0, 4); delete t.v97compSig; }
    } catch (e) { err("ingsrc", e); }
  }
  // 取り込みの最後・AI の読み取りの取り込み
  ["tenantFromTextGrids"].forEach((nm) => {
    const f = fnOf(nm); if (!f) return;
    const g = function (text, grids) { const t = f.apply(this, arguments); try { if (t && typeof t === "object" && typeof t.then !== "function") { ingSrc(t, text, grids); compNorm(t, "資料"); } } catch (e) { err(nm, e); } return t; };
    try { W[nm] = g; tenantFromTextGrids = g; } catch (e) { W[nm] = g; } // eslint-disable-line no-global-assign
  });
  if (typeof buildTenant === "function") {
    const __bt97 = buildTenant;
    buildTenant = async function (file) { // eslint-disable-line no-global-assign
      const t = await __bt97.apply(this, arguments);
      try {
        if (t && file && isCosme(t) && !t.v97ingSrc) {
          const nm = String(file.name || "");
          if (/\.(xlsx|xlsm)$/i.test(nm) && typeof readWorkbook === "function") { const sh = await readWorkbook(file); ingSrc(t, "", (sh || []).map((x) => x && x.grid)); }
          else if (/\.csv$/i.test(nm) && typeof parseCSV === "function") { const sh = parseCSV(typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text()); ingSrc(t, "", (sh || []).map((x) => x && x.grid)); }
          else if (/\.txt$/i.test(nm)) ingSrc(t, typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text(), []);
        }
      } catch (e) { err("bt.src", e); }
      try { compNorm(t, "資料"); } catch (e) { err("bt", e); }
      return t;
    };
  }
  if (typeof mergeTen === "function") {
    const __mt97 = mergeTen;
    mergeTen = function (t, x) { // eslint-disable-line no-global-assign
      try { carX(t, x); } catch (e) { err("mergecar", e); }
      const r = __mt97.apply(this, arguments);
      try { if (t && typeof t === "object") compNorm(t, "AIの読み取り"); } catch (e) { err("merge", e); }
      return r;
    };
  }
  // 表示：対応表の出どころ・標準の書き方・和名の無い成分
  if (typeof v68pInciView === "function") {
    const __iv97 = v68pInciView;
    v68pInciView = function (t) { // eslint-disable-line no-global-assign
      try { if (t) compNorm(t, "表示"); } catch (e) { err("viewnorm", e); }
      const V = __iv97.apply(this, arguments);
      try {
        if (!Array.isArray(V) || !t) return V;
        const D0 = t.v97inciDict || {}, NJ = new Set((t.v97noJa || []).map(ikey));
        const man = ((t.v68attrs || {}).inci) || {};
        V.forEach((x) => {
          if (!x) return;
          if (D0[x.ja] && !(man[x.ja] && man[x.ja].inci)) x.from = "対応表";
          if (x.inci) x.inci = inciCase(x.inci);
          if (x.inci && (NJ.has(ikey(x.ja)) || (inciLike(x.ja) && ikey(x.ja) === ikey(x.inci)))) x.v97noJa = 1;
        });
      } catch (e) { err("view", e); }
      return V;
    };
  }
  if (typeof v68pInciTable === "function") {
    const __it97 = v68pInciTable;
    v68pInciTable = function (t) { // eslint-disable-line no-global-assign
      let h = __it97.apply(this, arguments);
      try {
        if (!h || typeof v68pInciView !== "function") return h;
        const V = v68pInciView(t) || [];
        V.filter((x) => x && x.v97noJa).forEach((x) => {
          const a = `<tr data-v68ing="${typeof v68pE === "function" ? v68pE(x.ja) : E(x.ja)}"><td class="k">${typeof v68pE === "function" ? v68pE(x.ja) : E(x.ja)}</td>`;
          h = String(h).split(a).join(`<tr data-v68ing="${typeof v68pE === "function" ? v68pE(x.ja) : E(x.ja)}"><td class="k"><span class="mute" data-v97noja="1">${E(M("—（資料に和名なし）", "— (no Japanese name in your file)", "—（资料中无日文名）", "— (sin nombre japonés en el archivo)"))}</span></td>`);
        });
        const nD = V.filter((x) => x && x.from === "対応表").length;
        if (nD && /data-v68incinote/.test(h)) h = String(h).replace(/(<p class="nn"[^>]*data-v68incinote[^>]*>)/, `$1${E(M(`内蔵の対応表で INCI 名を入れた ${nD}成分は、出どころ「対応表」です（要確認）。`, `${nD} INCI name(s) come from the built-in table (to be confirmed). `, `${nD} 种成分的INCI名来自内置对照表（需确认）。`, `${nD} nombre(s) INCI proceden de la tabla interna (por confirmar). `))}`);
      } catch (e) { err("table", e); }
      return h;
    };
  }
  // 営業資料のモデル：成分表の訳した名前と INCI 名を並べない
  const DK_ING = { en: "Ingredient (INCI)", zh: "成分（INCI）", es: "Ingrediente (INCI)", fr: "Ingrédient (INCI)", de: "Inhaltsstoff (INCI)", ko: "성분 (INCI)", th: "ส่วนผสม (INCI)", vi: "Thành phần (INCI)", id: "Bahan (INCI)", ms: "Ramuan (INCI)", pt: "Ingrediente (INCI)", it: "Ingrediente (INCI)", ar: "المكوّن (INCI)", ru: "Ингредиент (INCI)", tw: "成分（INCI）", "zh-TW": "成分（INCI）" };
  function deckComp(lang0, comp) {
    if (!comp || !Array.isArray(comp.rows) || !comp.rows.length) return comp;
    const cols = (comp.cols || []).map((c) => String(c == null ? "" : c));
    let iI = cols.findIndex((c, i) => i > 0 && /INCI/i.test(c));
    if (iI < 0) { iI = cols.findIndex((c, i) => i > 0 && comp.rows.filter((r) => inciLike(r && r[i])).length >= Math.max(1, Math.ceil(comp.rows.filter((r) => String((r && r[i]) || "").trim()).length * 0.6)) && comp.rows.some((r) => inciLike(r && r[0]) && ikey(r[0]) === ikey(r[i]))); }
    if (iI <= 0) return comp;
    const ja = /^ja/.test(String(lang0 || "ja"));
    let ch = 0;
    const rows = comp.rows.map((r0) => {
      const r = (Array.isArray(r0) ? r0 : [r0]).slice();
      const inc = String(r[iI] == null ? "" : r[iI]).trim();
      if (!inc) return r;
      if (ikey(r[0]) === ikey(inc)) { r[0] = inciCase(inc); r[iI] = ""; ch++; return r; }
      if (!ja) { r[0] = inciCase(inc); r[iI] = ""; ch++; return r; }
      const c = inciCase(inc); if (c !== inc) { r[iI] = c; ch++; }
      return r;
    });
    if (!ch) return comp;
    const out = { cols: cols.slice(), rows };
    if (!ja) out.cols[0] = DK_ING[lang0] || DK_ING[String(lang0 || "").slice(0, 2)] || "Ingredient (INCI)";
    if (rows.every((r) => !String((r && r[iI]) || "").trim())) { out.cols.splice(iI, 1); out.rows = rows.map((r) => r.filter((v, i) => i !== iI)); }
    V97P.n.deck++;
    return Object.assign({}, comp, out);
  }
  V97P.deckComp = deckComp;
  if (typeof dk3Model === "function") {
    const __dm97 = dk3Model;
    dk3Model = function (lang0, plan, data, ph, deck, src, T) { // eslint-disable-line no-global-assign
      let d2 = data;
      try {
        if (data && Array.isArray(data.prods) && data.prods.some((p) => p && p.comp && Array.isArray(p.comp.rows) && p.comp.rows.length)) {
          d2 = Object.assign({}, data, { prods: data.prods.map((p) => (p && p.comp) ? Object.assign({}, p, { comp: deckComp(lang0, p.comp) }) : p) });
        }
      } catch (e) { err("deck", e); d2 = data; }
      const args = Array.prototype.slice.call(arguments); args[2] = d2;
      return __dm97.apply(this, args);
    };
  }
  // 手入力の INCI 名：押した時点の書き方（大文字小文字が混じった入力）を覚え、表示で戻す
  document.addEventListener("click", (e) => {
    try {
      const b = e.target && e.target.closest && e.target.closest("[data-v68save]");
      if (!b) return;
      const t = ten(); if (!t) return;
      const keep = Object.assign({}, t.v97inciCase || {});
      document.querySelectorAll("[data-v68ir]").forEach((tr0) => { const i = tr0.querySelector('[data-v68ic="inci"]'); const v = i ? NF(i.value) : ""; if (v && /[a-z]/.test(v)) keep[ikey(v)] = v; });
      t.v97inciCase = keep;
    } catch (x) { err("savecase", x); }
  }, true);
  inciCase = function (s) { try { const t = ten(); const k = ikey(s); if (t && t.v97inciCase && t.v97inciCase[k]) return t.v97inciCase[k]; } catch (e) { /* 下へ */ } return __ic0(s); };
  V97P.inciCase = inciCase;

  /* ════════════ No.531 見出しを商材カテゴリーに追随させる ════════════ */
  function catLabelFor(k, l) {
    const t = ten(); if (!t) return "";
    const c = String(t.cat || "").trim();
    if (!c || c === "その他" || c === "中古品" || c === "中古車") return "";
    let k0 = ""; try { k0 = (W.V68IND && typeof W.V68IND.of === "function") ? W.V68IND.of(t) : ""; } catch (e) { k0 = ""; }
    if (!k0 || k0 !== k) return "";
    const ll = l || lang();
    if (ll === "ja") return c;
    return tr(c) || "";
  }
  try {
    if (W.V68IND && typeof W.V68IND.label === "function" && !W.V68IND.label._v97) {
      const __lb97 = W.V68IND.label;
      const g = function (key, l) {
        const r = __lb97.apply(this, arguments);
        try { const c = catLabelFor(key, l); if (c && c !== r) { V97P.n.label++; return c; } } catch (e) { err("label", e); }
        return r;
      };
      g._v97 = 1;
      W.V68IND.label = g;
    }
  } catch (e) { err("labelwrap", e); }
  if (typeof v68regBanner === "function") {
    const __rb97 = v68regBanner;
    v68regBanner = function () { // eslint-disable-line no-global-assign
      let h = __rb97.apply(this, arguments);
      try {
        if (typeof h === "string" && h) {
          h = h.replace(/(<p class="nn" data-noi18n>)([^<]*?[：:]\s?)([^<　]+)　([^<]*?[：:]\s?)([^<]+)(<\/p>)/, (m0, a, k1, v1, k2, v2, z) => {
            if (NF(v1) !== NF(v2)) return m0;
            V97P.n.banner++;
            return a + k2 + v2 + z;
          });
        }
      } catch (e) { err("banner", e); }
      return h;
    };
  }

  /* ════════════ No.530 充足度の % をひとつの数え方に ════════════ */
  let inScore = 0;
  if (typeof scoreOf === "function") {
    const __so97 = scoreOf;
    scoreOf = function (t) { // eslint-disable-line no-global-assign
      const s = __so97.apply(this, arguments);
      if (inScore) return s;
      inScore = 1;
      try {
        if (s && t && typeof v92prodFill === "function" && typeof NEED !== "undefined" && Array.isArray(NEED)) { // eslint-disable-line no-undef
          const K = v92prodFill(t);
          if (K && typeof K.c === "number" && K.d > 0 && Array.isArray(K.okKeys)) {
            const old = (s.filled || []).concat(s.missing || []);
            const pick = (k) => old.find((y) => y && y.k === k) || NEED.find((y) => y && y.k === k); // eslint-disable-line no-undef
            const ok = new Set(K.okKeys);
            s.pctW = s.pct;
            s.filled = NEED.filter((y) => ok.has(y.k)).map((y) => pick(y.k)); // eslint-disable-line no-undef
            s.missing = NEED.filter((y) => !ok.has(y.k)).map((y) => pick(y.k)); // eslint-disable-line no-undef
            s.pct = K.pct;
            s.basis = { a: K.a, b: K.b, c: K.c, d: K.d };
            V97P.n.score++;
          }
        }
      } catch (e) { err("score", e); } finally { inScore = 0; }
      return s;
    };
  }

  /* ════════════ R-5 自動車部品を中古車・大分類の選び直しにしない ════════════ */
  const PART_HS = ["8708", "8714", "6813", "4011", "4012", "4013", "8511", "8512", "8409", "8483", "8421", "8507", "9029", "9104"];
  const VEH_HS = ["8701", "8702", "8703", "8704", "8705", "8711"];
  const RE_PART = /ブレーキ|パッド|ライニング|ローター|キャリパー|自動車部品|部品|パーツ|補修用|純正品|社外品|互換品|フィルター|ワイパー|プラグ|ベルト|ショック|アブソーバー|マフラー|ラジエ|オルタネーター|クラッチ|ホイール|タイヤ|ヘッドランプ|テールランプ|バンパー|ミラー|\bparts?\b|\bpads?\b|brake|filter|wiper|spark\s*plug|tyres?|tires?|absorber|radiator|alternator|clutch/i;
  const RE_VEH = /中古(?:車|自動車|乗用車|トラック|バス|二輪|バイク)|車両本体|^(?:乗用車|自動車|トラック|バス)(?:\s|$)|used\s*(?:car|vehicle|truck)/i;
  const RE_MACH = /ショベル|油圧|建機|建設機械|重機|クレーン|フォークリフト|トラクター|コンバイン|ブルドーザー|excavator|bulldozer|forklift|crane|tractor/i;
  const hs4 = (h) => String(h == null ? "" : h).replace(/\D/g, "").slice(0, 4);
  function partLike(p) {
    if (!p) return false;
    const nm = [p.item, p.itemEn, p.name].filter(Boolean).join(" ");
    const h = hs4(p.hs);
    if (/自転車|bicycle/i.test(nm) || RE_MACH.test(nm)) return false;
    if (h && VEH_HS.indexOf(h) >= 0) return false;
    if (h && PART_HS.indexOf(h) >= 0) return true;
    return !!nm && !RE_VEH.test(nm) && RE_PART.test(nm) && (!h || /^(87|40|68)/.test(h));
  }
  V97P.partLike = partLike;
  const userCat = (t) => !!(t && (t.v95catUser || t.v92catWhy === "商品情報の画面で選び直し" || t.v92catWhy === "商品情報の画面で自動車部品に直した"));
  function autoGrp(raw) { try { const g = typeof W.v92catGroupOfRaw === "function" ? W.v92catGroupOfRaw(raw) : null; return !!(g && g.k === "auto"); } catch (e) { return false; } }
  function pin(t, where) {
    try {
      if (!t || typeof t !== "object" || userCat(t)) return false;
      const c0 = String(t.cat || "").trim();
      const grp = autoGrp(t.catRaw);
      if (c0 === "自動車部品" && !grp && !t.v92catAsk) return false;
      if (!(grp || c0 === "中古車" || t.catKey === "car" || ((c0 === "" || c0 === "自動車部品") && t.v92catAsk === "auto"))) return false;
      if (!partLike(t)) return false;
      const h = hs4(t.hs), byHs = h && PART_HS.indexOf(h) >= 0;
      const why = (byHs ? "HS " + String(t.hs).trim() + "（自動車の部品・附属品）" + (RE_PART.test([t.item, t.itemEn].join(" ")) ? "と品名" : "") : "品名") + "から自動車部品と判断（資料の大分類「自動車・建機」・中古車の語は、適合する車の説明として扱いました）";
      if (typeof v95pSetAuto === "function") v95pSetAuto(t, why); else { t.cat = "自動車部品"; t.catKey = "parts"; t.v92catWhy = why; delete t.v92catAsk; }
      if (grp) { t.v97catRaw = t.catRaw; t.catRaw = "自動車部品"; }
      t.v97pin = where || 1;
      V97P.n.pin++;
      return true;
    } catch (e) { err("pin", e); return false; }
  }
  V97P.pin = pin;
  // AI の読み取りの結果（x）の区分：中古車・大分類でも、部品なら自動車部品
  function carX(t, x) {
    if (!t || !x || typeof x !== "object" || userCat(t)) return false;
    const c = String(x.cat || "").trim();
    if (!(c === "中古車" || x.catKey === "car" || autoGrp(c) || autoGrp(x.catRaw))) return false;
    const p = { item: x.item || t.item, itemEn: x.itemEn || t.itemEn, hs: x.hs || t.hs };
    if (!partLike(p)) return false;
    x.cat = "自動車部品"; if ("catKey" in x) x.catKey = "parts";
    if (autoGrp(x.catRaw)) x.catRaw = "自動車部品";
    V97P.n.xcat++;
    return true;
  }
  ["runParseReal", "v54upldApply", "adoptReal"].forEach((nm) => {
    const f = fnOf(nm); if (!f || f._v97p) return;
    const g = function (t) { try { pin(t, nm); } catch (e) { err(nm, e); } const r = f.apply(this, arguments); try { if (nm === "v54upldApply") pin(t, nm + "+"); } catch (e) { err(nm + "+", e); } return r; };
    g._v97p = 1;
    try { if (nm === "runParseReal") runParseReal = g; else if (nm === "v54upldApply") v54upldApply = g; else adoptReal = g; } catch (e) { /* 下へ */ } // eslint-disable-line no-global-assign
    W[nm] = g;
  });
  ["fileToTenant", "entriesToTenant"].forEach((nm) => {
    const f = fnOf(nm); if (!f || f._v97p) return;
    const g = function () {
      const out = f.apply(this, arguments);
      const fix = (t) => { try { pin(t, nm); if (t && t._pend && Array.isArray(t._pend.prods)) t._pend.prods.forEach((p) => { if (p && p.x) pin(p.x, nm); }); } catch (e) { err(nm, e); } return t; };
      return (out && typeof out.then === "function") ? out.then(fix) : fix(out);
    };
    g._v97p = 1;
    W[nm] = g;
  });
  // AI ヒアリングの答え（品名）から自動車部品を選べるように
  try {
    if (typeof V54HEAR_CAT !== "undefined" && Array.isArray(V54HEAR_CAT) && !V54HEAR_CAT.some((x) => x && x[0] === "自動車部品" && x._v97)) { // eslint-disable-line no-undef
      const ent = ["自動車部品", /ブレーキパッド|ブレーキディスク|ブレーキローター|ブレーキシュー|ブレーキライニング|ブレーキキャリパー|ワイパーブレード|スパークプラグ|オイルフィルター|エアクリーナー|ラジエーター|オルタネーター|ショックアブソーバー|ヘッドランプ|テールランプ|brake\s*pads?|brake\s*(?:discs?|rotors?)|wiper\s*blades?|spark\s*plugs?|oil\s*filters?|shock\s*absorbers?/i];
      ent._v97 = 1;
      const i = V54HEAR_CAT.findIndex((x) => x && x[0] === "中古車"); // eslint-disable-line no-undef
      V54HEAR_CAT.splice(i >= 0 ? i : V54HEAR_CAT.length, 0, ent); // eslint-disable-line no-undef
    }
  } catch (e) { err("hear", e); }

  /* ════════════ No.534 「今日やること」の自動の調査を、保存まで終わらせる ════════════ */
  const TD_Q = /【今日やるべきこと】/;
  const TD = V97P.tdS = { run: 0, t0: 0, noWeb: 0, last: null };
  if (typeof llmAsk === "function") {
    const __la97 = llmAsk;
    llmAsk = function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      try {
        if (TD_Q.test(String(q || "")) && opts && /今日やること/.test(String(opts.sys || ""))) {
          const o = Object.assign({}, opts);
          if (TD.noWeb) { delete o.forceWeb; o.noWeb = 1; o.timeout = Math.max(+o.timeout || 0, 120000); }
          else o.timeout = Math.max(+o.timeout || 0, 240000);
          const a = Array.prototype.slice.call(arguments); a[2] = o;
          return __la97.apply(this, a);
        }
      } catch (e) { err("td.ask", e); }
      return __la97.apply(this, arguments);
    };
  }
  const tdKey = () => { try { return (typeof TODAYS !== "undefined" ? TODAYS : "") + "|" + ((typeof D !== "undefined" && D && D.item) || ""); } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const reRender = () => { try { if (typeof cur !== "undefined" && cur === "today" && typeof render === "function") render(); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  if (typeof todayGen === "function") {
    const __tg97 = todayGen;
    todayGen = async function (force) { // eslint-disable-line no-global-assign
      if (window.__tdBusy) return __tg97.apply(this, arguments);
      const key = tdKey();
      TD.run = 1; TD.t0 = Date.now(); TD.noWeb = 0; TD.last = { key, st: "run", at: Date.now() };
      setTimeout(reRender, 0);
      let r = null, e1 = null;
      try { r = await __tg97.apply(this, arguments); } catch (e) { e1 = e; }
      if (!r && !window.__tdBusy && (e1 || !(typeof ppReady === "function" && !ppReady()))) {
        // Web 検索込みで作れなかった：登録データだけで1回作り直す
        V97P.n.tdRetry++;
        TD.noWeb = 1; TD.last = { key, st: "retry", at: Date.now(), why: String((e1 && (e1.message || e1)) || "").slice(0, 80) };
        setTimeout(reRender, 0);
        try { r = await __tg97.call(this, true); } catch (e) { e1 = e; r = null; }
        if (r) { try { r.web = M("Web 検索がつながらなかったため、登録データだけで提案しました（Web の最新動向は入っていません）。", "Web search was unavailable, so these suggestions use your registered data only.", "无法使用网络搜索，因此仅根据已登记的数据提出建议。", "La búsqueda web no estuvo disponible; las sugerencias usan solo sus datos."); r.v97noWeb = 1; if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ } }
      }
      TD.run = 0; TD.noWeb = 0;
      if (r) { V97P.n.tdOk++; TD.last = { key, st: "ok", at: Date.now(), n: (r.items || []).length, hm: r.at || "", noWeb: !!r.v97noWeb }; }
      else { V97P.n.tdNg++; TD.last = { key, st: "ng", at: Date.now(), why: String((e1 && (e1.message || e1)) || M("AI の応答がありませんでした", "No reply from the AI", "AI 未响应", "La IA no respondió")).slice(0, 120) }; }
      setTimeout(reRender, 0);
      if (e1 && !r) throw e1;
      return r;
    };
  }
  function tdNote() {
    const L = TD.last; if (!L || L.key !== tdKey()) return "";
    const sec = Math.max(0, Math.round((Date.now() - (TD.t0 || L.at)) / 1000));
    if (L.st === "run" || L.st === "retry") {
      const a = L.st === "retry" ? M("Web 検索込みの調査が返ってこなかったため、登録データだけで作り直しています", "Web search did not answer, so it is being redone with your registered data only", "网络搜索未返回，正在仅用已登记的数据重新生成", "La búsqueda web no respondió; se rehace solo con sus datos")
        : M("AI商社マンが「今日やること」を調べています（Web 検索込み・最大4分）", "The AI Trade Agent is preparing today's to-dos (with web search, up to 4 min)", "AI商社专员正在调查“今日待办”（含网络搜索・最多4分钟）", "El agente IA prepara las tareas de hoy (con búsqueda web, hasta 4 min)");
      return `<div class="v97td run" data-v97td="run" role="status" data-noi18n="1"><span class="spin"></span><span class="v97td-tx">${E(a)}${E(M("・経過 " + sec + "秒。ほかの画面に移っても続き、終わったらこの一覧に保存します。", " · " + sec + " s. It keeps going on other screens and is saved to this list when done.", "・已用 " + sec + " 秒。切换页面也会继续，完成后保存到此列表。", " · " + sec + " s. Continúa en otras pantallas y se guarda en esta lista al terminar."))}</span></div>`;
    }
    if (L.st === "ok") return `<div class="v97td ok" data-v97td="ok" role="status" data-noi18n="1"><span class="v97td-ic" aria-hidden="true">✅</span><span class="v97td-tx">${E(M("「今日やること」を " + L.n + "件保存しました（タスク＞今日やること・" + (L.hm || "") + "）", "Saved " + L.n + " to-dos (Tasks > Today, " + (L.hm || "") + ")", "已保存 " + L.n + " 条“今日待办”（任务＞今日待办・" + (L.hm || "") + "）", "Se guardaron " + L.n + " tareas (Tareas > Hoy, " + (L.hm || "") + ")"))}${L.noWeb ? E(M("。Web 検索がつながらなかったため、登録データだけの提案です", ". Web search was unavailable: suggestions use registered data only", "。因无法使用网络搜索，仅根据已登记数据", ". Sin búsqueda web: solo datos registrados")) : ""}</span></div>`;
    if (L.st === "ng") return `<div class="v97td ng" data-v97td="ng" role="alert" data-noi18n="1"><span class="v97td-ic" aria-hidden="true">⚠</span><span class="v97td-tx">${E(M("「今日やること」を作れませんでした（何も保存していません）：", "Could not prepare today's to-dos (nothing was saved): ", "未能生成“今日待办”（未保存任何内容）：", "No se pudieron preparar las tareas de hoy (no se guardó nada): ") + L.why)}</span><button type="button" class="btn v97td-go" data-v97tdgo="1">${E(M("もう一度調べる", "Try again", "重新调查", "Reintentar"))}</button></div>`;
    return "";
  }
  if (typeof vToday === "function") {
    const __vt97 = vToday;
    vToday = function () { // eslint-disable-line no-global-assign
      let h = __vt97.apply(this, arguments);
      try {
        const n = tdNote();
        if (n && typeof h === "string") {
          const i = h.indexOf('<div class="c"');
          h = i >= 0 ? h.slice(0, i) + n + h.slice(i) : n + h;
        }
      } catch (e) { err("vtoday", e); }
      return h;
    };
  }
  document.addEventListener("click", (e) => {
    try { if (e.target && e.target.closest && e.target.closest("[data-v97tdgo]")) { e.preventDefault(); if (typeof todayRefresh === "function") todayRefresh(); } } catch (x) { err("tdgo", x); }
  });
  // 調べている間は、経過の秒を画面の中で進める（右下の表示が消えても残る）
  setInterval(() => {
    try {
      if (!TD.run) return;
      const el = document.querySelector('[data-v97td="run"] .v97td-tx'); if (!el) return;
      const w = document.createElement("div"); w.innerHTML = tdNote(); const nb = w.querySelector(".v97td-tx"); if (nb && el.textContent !== nb.textContent) el.textContent = nb.textContent;
    } catch (e) { /* 無視 */ }
  }, 1000);
})();
