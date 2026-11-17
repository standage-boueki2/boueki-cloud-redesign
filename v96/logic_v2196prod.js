/* ═══ v21.96 prod（2026-11-17 第9回相当 UAT・21.95.1）商品の登録・取り込み・商品情報
   No.513（中）強みの入力が未完了でも「すべて入っています」と出る
     原因：補完パネル（刷新版 v92item の fillOpen）は、項目が入っているかを「値が1つでもあるか」（hasV）で数える。
           強みは 21.95（No.490）で「3件以上で入力済み」にしたが、パネルの数え方は変えていなかった。
           強みが0件 → パネルの「＋ 強みを追加」で1件足す → 窓を閉じるとパネルを開き直す（21.95 No.485）→ 強みが「入っている」扱いになり、
           ほかに足りない項目が無いと「登録の項目は、すべて入っています」と出ていた（実際は 全体 20/21・必須 8/9）。強みの追加の窓も「追加しました」だけ。
     直し：数え方を商品情報の画面と同じ v92prodFill（必須 a/b・全体 c/d。強みは3件以上・HSコードは推定のままなら未確定）にそろえる。
           ① 強みの追加・保存・削除・AIの反映のトースト：「強みを追加しました（2/3件）。あと1件で「入力済み」になります。登録の項目：全体 20/21・必須 8/9」
           ② パネルを開き直すとき、残りが強みだけなら「すべて入っています」と言わず、強みの行だけのパネルを出す（21.95 の強みの行が入る）
           ③ 「すべて入っています」「全項目が揃いました」「すべて揃っています」「すべて資料から読み取れました」系の文（トースト・AIヒアリングの文・
              商品の要約 buildSummary・よくある質問 buildAiq・「足りない情報は？」ansMissing）は、v92prodFill がそろっていないとき
              （強みが1〜2件・HSコードが推定のまま）は、まだ入っていない項目と a/b・c/d に置き換える。ヒアリングで強みを答えたときの「充足度 +Npt」も件数に。
              表の保存・パネルの保存・カテゴリーの変更・英文社名の登録のトーストには、いまの a/b・c/d を添える（日本語の画面）
   No.511（中）英文社名の「案」がローマ字（読み方）のまま（ペットスマイル株式会社 → Pettosumairu Co., Ltd.）
     原因：21.95（logic_v2195info.js の v95infoCoEnDraftOf）が、辞書に無いカタカナを読み方のローマ字に変えて案にしていた。
     直し：v95infoCoEnDraftOf を置き換える。カタカナ語を英語の元の語に戻す辞書（社名によく使う語）で語に分け、全部の語が辞書で決まるときだけ案を出す
           （ペット→Pet・スマイル→Smile → Pet Smile Co., Ltd.。株式会社→Co., Ltd.・有限会社→Ltd.・合同会社→LLC）。
           漢字・ひらがなを含む社名や、辞書で割り切れない社名は案を出さない（未登録であることと、入れ方の案内だけ。見せ方は rd_v96prod.js）。
           英語の営業資料の「訳した名前・要確認」（dk3 の M.roman）は別の仕組みなので変えない。
   No.514（中）化粧品の全成分表（INCI）が取り込みで入らず、手で入れても INCI が備考の欄に出る
     原因：① 取り込みは「表（3列以上）」か「全成分：水、…」の1行しか成分表にしない。見出し（全成分・成分・Ingredients）の下に並べた成分は読まれず、
              AI の読み取りでは和名の並びが「強み」に入っていた。
           ② INCI の表示（v68pInciView）は1列目＝和名、ほかの列は配合率・区分・備考とだけ見て、INCI 名の列を見ない。変換は内蔵の対応表だけで、
              ツバキ種子油などが対応表に無い → 「和名（INCI 未変換）」と出て、表に書いた INCI 名は備考の欄に出ていた。
     直し：① 成分表を専用の読み取り対象にする（tenantFromTextGrids・buildTenant・取り込みの最後・AIの結果の取り込み mergeTen）。
              「全成分」「成分」「Ingredients」「INCI」の見出し以下の並び（1行に「、」区切り・1行に1つ・箇条書き）を成分表（表示名称（和名）｜INCI名）にし、
              強みの欄からは外す（強みに入っていた成分名の並びも成分表へ移す）。和名の並びと英語の並びが同じ数なら組にする。
           ② INCI の表示は、表の INCI 名の列（見出しに INCI・英名・English、または英字だけの値）を INCI 名として出し、備考から外す。和名の欄が英字なら、それを INCI 名に。
           ③ 和名→INCI の対応表に、化粧品でよく使う成分（ツバキ種子油＝CAMELLIA JAPONICA SEED OIL など）を足す。
   No.516（中）ZIP が非対応形式として扱われず、解凍・登録される（ドキュメントにも入る）
     原因：商品登録の取り込み（#fin・ドロップ・URL・ヒアリング中の📎・取り込んだ情報）は Zip を展開して読む仕様、ドキュメントは形式を見ていなかった。
     直し：商品登録の取り込みとドキュメントのアップロードで、対応形式を決めて、それ以外（Zip・7z・rar・tar・gz などのアーカイブ、exe などの実行形式ほか）は
           「対応していない形式です」と対応形式の一覧を出して受け付けない。ファイル選択・ドラッグ＆ドロップ・貼り付け・URL の取り込みのすべての入口で同じ判定。
           判定は拡張子と MIME。xlsx・xlsm・docx・pptx（中身は Zip）は拡張子で対応形式なので受け付ける（MIME が zip でも）。
           読めなかったファイルから商品を作らない 21.95（No.484）の動作はそのまま（案内の文から「Zip の中も読みます」を外す）。
   R-1（No.453・条件つき解消）価格表の編集の窓の有効期限の日付欄に、キーボードで日付を打てない
     原因：欄はブラウザの日付の部品（type=date）。打ち方がブラウザ・言語で違い（年・月・日の枠ごと）、「2027/03/31」や「2027-03-31」を打つ・貼ることができない。
     直し：この窓の欄を文字の欄にして、YYYY-MM-DD・YYYY/MM/DD・YYYYMMDD（全角も可）を受ける。カレンダーのボタンと「1か月後・3か月後…」のボタンも付ける。
           保存の確かめ（21.83 の tblSave の包み：形・今日より前）はそのまま使う。 */
var V96P = window.V96P = { v: "21.96", err: [], sw: null, lastStat: 0, n: { strToast: 0, panel: 0, claim: 0, coen: 0, ingr: 0, xclean: 0, inci: 0, ng: 0, date: 0 } };
function v96pErr(k, e) { try { V96P.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96P.err.length > 40) V96P.err.shift(); } catch (x) { } }
function v96pLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v96pM(ja, en, zh, es) { const l = v96pLang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; }
function v96pE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v96pNF(s) { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { } return x; }
function v96pToast(m) { try { if (typeof toast === "function") toast(m); } catch (e) { } }
function v96pTen() { try { return (typeof TEN !== "undefined" && TEN && (TEN.src === "upload" || TEN.src === "sample2")) ? TEN : null; } catch (e) { return null; } }

/* ══════════ No.513 充足の数え方をそろえる ══════════ */
function v96pK(t) {
  try {
    if (t === undefined) t = v96pTen();
    if (!t || typeof v92prodFill !== "function") return null;
    const K = v92prodFill(t);
    return (K && typeof K.c === "number" && typeof K.a === "number") ? K : null;
  } catch (e) { v96pErr("k", e); return null; }
}
function v96pSTRN() { try { return (window.V95INFO && +window.V95INFO.STRN) || 3; } catch (e) { return 3; } }
function v96pStrN(t) { try { if (typeof v95infoStrN === "function") return v95infoStrN(t && t.strengths); return (Array.isArray(t && t.strengths) ? t.strengths : []).filter((s) => String((Array.isArray(s) ? s[0] : s) || "").trim()).length; } catch (e) { return 0; } }
function v96pTr(s) { try { const l = v96pLang(); if (l !== "ja" && typeof I18N !== "undefined" && I18N && I18N.dict && I18N.dict[l] && I18N.dict[l][s]) return String(I18N.dict[l][s]); } catch (e) { } return s; }
function v96pNm(k, t) { let n = k; try { if (typeof v92prodNm === "function") n = v92prodNm(k, t) || k; else { const x = (NEED || []).find((y) => y && y.k === k); n = x ? x.n : k; } } catch (e) { } return v96pTr(n); }
// まだ「入力済み」になっていない項目の名前（強みは件数、HSコードは推定のまま）
function v96pMissNames(K, t) {
  if (!K || !t) return [];
  const N = v96pSTRN(), n = v96pStrN(t);
  return (K.missKeys || []).map((k) => {
    const nm = v96pNm(k, t);
    if (k === "strengths" && n > 0 && n < N) return nm + v96pM(`（${n}/${N}件）`, ` (${n}/${N})`, `（${n}/${N}项）`, ` (${n}/${N})`);
    if (k === "hs" && K.hsGuess) return nm + v96pM("（推定のまま・未確定）", " (estimated, not confirmed)", "（推定・未确定）", " (estimado)");
    return nm;
  });
}
function v96pStat(K) {
  if (!K) return "";
  if (K.full) return v96pM(`登録の項目はすべてそろっています（全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}）`, `All registration items are filled in (${K.c}/${K.d}; required ${K.a}/${K.b})`, `登记项目已全部齐备（全部 ${K.c}/${K.d}・必填 ${K.a}/${K.b}）`, `Todos los campos están completos (${K.c}/${K.d}; obligatorios ${K.a}/${K.b})`);
  return v96pM(`登録の項目：全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}`, `Registration items: ${K.c}/${K.d} (required ${K.a}/${K.b})`, `登记项目：全部 ${K.c}/${K.d}・必填 ${K.a}/${K.b}`, `Campos: ${K.c}/${K.d} (obligatorios ${K.a}/${K.b})`);
}
function v96pNotFull(K, t) {
  const L = v96pMissNames(K, t);
  const j = v96pLang() === "ja" ? "、" : ", ";
  return v96pM(`まだ「入力済み」になっていない項目があります：${L.join(j)}（全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}）`, `Some items are not complete yet: ${L.join(j)} (${K.c}/${K.d}; required ${K.a}/${K.b})`, `还有未完成的项目：${L.join(j)}（全部 ${K.c}/${K.d}・必填 ${K.a}/${K.b}）`, `Aún faltan campos: ${L.join(j)} (${K.c}/${K.d}; obligatorios ${K.a}/${K.b})`);
}
// 強みのトースト（kind: add | edit | del | ai）
function v96pStrMsg(kind, t, x) {
  const n = v96pStrN(t), N = v96pSTRN(), K = v96pK(t);
  const cnt = n < N ? `${n}/${N}` : `${n}`;
  let head;
  if (kind === "add") head = v96pM(`強みを追加しました（${cnt}件）`, `Strength added (${cnt})`, `已添加优势（${cnt}项）`, `Punto fuerte añadido (${cnt})`);
  else if (kind === "edit") head = v96pM(`強みを保存しました（${cnt}件）`, `Strength saved (${cnt})`, `已保存优势（${cnt}项）`, `Punto fuerte guardado (${cnt})`);
  else if (kind === "del") head = v96pM(`強みを削除しました${x ? "：" + x : ""}（いま ${cnt}件）`, `Strength deleted${x ? ": " + x : ""} (now ${cnt})`, `已删除优势${x ? "：" + x : ""}（现在 ${cnt}项）`, `Punto fuerte eliminado${x ? ": " + x : ""} (ahora ${cnt})`);
  else head = (x ? String(x) : v96pM("強みを反映しました", "Strengths applied", "已反映优势", "Puntos fuertes aplicados")) + v96pM(`（いま ${cnt}件）`, ` (now ${cnt})`, `（现在 ${cnt}项）`, ` (ahora ${cnt})`);
  const mid = n <= 0 ? v96pM("強みは未登録です", "No strengths registered yet", "尚未登记优势", "Aún no hay puntos fuertes")
    : n < N ? v96pM(`あと${N - n}件で「入力済み」になります`, `${N - n} more to count as filled`, `再添加${N - n}项即视为已填写`, `Faltan ${N - n} para completarlo`)
      : v96pM("強みは「入力済み」です", "Strengths count as filled", "优势已视为已填写", "Puntos fuertes completos");
  const sep = v96pLang() === "ja" ? "。" : ". ";
  return [head, mid, v96pStat(K)].filter(Boolean).join(sep);
}
function v96pStrToast(kind, x) {
  const t = v96pTen(); if (!t) return;
  V96P.n.strToast++;
  V96P.lastStat = Date.now();
  v96pToast(v96pStrMsg(kind, t, x));
}
// 「すべて入っています」系（トースト）
const V96P_CLAIM_T = /^(登録の項目は、すべて入っています|すべての項目が揃っています。?|必要な情報はすべて揃(?:いました|っています)。?|これで全項目が揃いました。?)$/;
// 保存のトースト（いまの a/b・c/d を添える。日本語の画面だけ）
const V96P_SAVE_T = [/^登録しました：/, /を保存しました（営業資料・書類・AI回答に反映）$/, /^商材カテゴリーを「[^」]+」にしました/, /^英文社名を「[^」]+」で登録しました/];
function v96pToastFix(m) {
  try {
    const s = String(m == null ? "" : m);
    if (!s) return m;
    const t = v96pTen();
    if (!t) return m;
    if (V96P_CLAIM_T.test(s)) {
      const K = v96pK(t);
      if (K && !K.full) { V96P.n.claim++; V96P.lastStat = Date.now(); return v96pNotFull(K, t); }
      if (K && K.full && /^登録の項目は、すべて入っています$/.test(s)) return v96pStat(K);
      return m;
    }
    if (v96pLang() === "ja" && V96P_SAVE_T.some((re) => re.test(s)) && s.indexOf("登録の項目") < 0) {
      const K = v96pK(t);
      if (K) { V96P.lastStat = Date.now(); return s + "／" + v96pStat(K); }
    }
  } catch (e) { v96pErr("tfix", e); }
  return m;
}
if (typeof toast === "function") {
  const __to96 = toast;
  toast = function (m) {
    try {
      const S = V96P.sw;
      if (S && S.re && S.re.test(String(m == null ? "" : m))) { S.hit++; S.msg = String(m); return undefined; }
    } catch (e) { }
    const a = [].slice.call(arguments);
    a[0] = v96pToastFix(m);
    return __to96.apply(this, a);
  };
}
// 強みの窓（追加・編集）の「追加する／保存する」
if (typeof openStrEdit === "function") {
  const __ose96 = openStrEdit;
  openStrEdit = function (i) {
    const r = __ose96.apply(this, arguments);
    try {
      const b = document.getElementById("stGo");
      if (b && v96pTen() && typeof b.onclick === "function" && !b.onclick._v96) {
        const o = b.onclick, edit = +i >= 0;
        const h = function (e) {
          V96P.sw = { re: /^(追加しました|保存しました)$/, hit: 0 };
          try { return o.call(this, e); } finally { const hit = V96P.sw ? V96P.sw.hit : 0; V96P.sw = null; if (hit) v96pStrToast(edit ? "edit" : "add"); }
        };
        h._v96 = 1;
        b.onclick = h;
      }
    } catch (e) { v96pErr("strEdit", e); }
    return r;
  };
}
if (typeof strDel === "function") {
  const __sd96 = strDel;
  strDel = function () {
    if (!v96pTen()) return __sd96.apply(this, arguments);
    V96P.sw = { re: /^削除しました：/, hit: 0 };
    try { return __sd96.apply(this, arguments); } finally { const S = V96P.sw || {}; V96P.sw = null; if (S.hit) v96pStrToast("del", String(S.msg || "").replace(/^削除しました：/, "")); }
  };
}
if (typeof strApplyAI === "function") {
  const __sa96 = strApplyAI;
  strApplyAI = function () {
    if (!v96pTen()) return __sa96.apply(this, arguments);
    V96P.sw = { re: /^(強みを\d+件で置き換えました|強みに\d+件を追加しました)$/, hit: 0 };
    try { return __sa96.apply(this, arguments); } finally {
      const S = V96P.sw || {}; V96P.sw = null;
      if (S.hit) { const m = String(S.msg || "").match(/(\d+)/); const k = m ? m[1] : ""; const rep = /置き換え/.test(String(S.msg || "")); v96pStrToast("ai", rep ? v96pM(`強みを${k}件で置き換えました`, `Replaced strengths with ${k}`, `已用${k}项替换优势`, `Reemplazados por ${k}`) : v96pM(`強みに${k}件を追加しました`, `Added ${k} strength(s)`, `已添加${k}项优势`, `Añadidos ${k}`)); }
    }
  };
}
// 補完パネル：開き直したときに残りが強みだけ（1〜2件）なら、強みの行だけのパネルを出す（「すべて入っています」と言わない）
function v96pPanelStr(t, K) {
  try {
    if (typeof openDW !== "function" || typeof v95infoStrShort !== "function" || !v95infoStrShort(t)) return false;
    const E = v96pE, M = v96pM;
    openDW(`<div class="dwhead" data-noi18n="1"><h3>✎ ${E(M("足りない項目を入れる", "Fill in missing items", "填写缺少的项目", "Completar campos que faltan"))} <span class="p or">0${E(M("件", "", "项", ""))}</span></h3></div>
  <div class="dwbody v92if v96p-pn" data-noi18n="1">
    <p class="nn">${E(M(`登録の項目（全体 ${K.d}件）のうち、まだ「入力済み」になっていないものです（いま 全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}）。`, `Registration items that are not complete yet (now ${K.c}/${K.d}; required ${K.a}/${K.b}).`, `尚未完成的登记项目（目前 全部 ${K.c}/${K.d}・必填 ${K.a}/${K.b}）。`, `Campos que aún no están completos (ahora ${K.c}/${K.d}; obligatorios ${K.a}/${K.b}).`))}</p>
    <div class="rw v96p-pnb"><span class="v96p-sp"></span><button class="btn g" type="button" id="v92ifCancel">${E(M("閉じる", "Close", "关闭", "Cerrar"))}</button></div>
  </div>`);
    try { const pn = document.getElementById("pn"); if (pn) pn.classList.add("dwr"); if (typeof dwChrome === "function") dwChrome(); } catch (e) { }
    const c = document.getElementById("v92ifCancel");
    if (c) c.addEventListener("click", () => { try { if (typeof closeDW === "function") closeDW(); } catch (e) { } });
    V96P.n.panel++;
    return true;
  } catch (e) { v96pErr("panel", e); return false; }
}
(function () {
  try {
    const o = window.v92itemFillOpen;
    if (typeof o !== "function" || o._v96) return;
    const f = function (only) {
      try {
        const t = v96pTen(), K = v96pK(t);
        const raw = (window.V95INFO && typeof window.V95INFO.miss0 === "function") ? window.V95INFO.miss0(t) : null;
        if (t && K && Array.isArray(raw)) {
          let L = raw;
          if (Array.isArray(only) && only.length) { const L2 = raw.filter((x) => x && only.indexOf(x.k) >= 0); if (L2.length) L = L2; }
          if (!L.length) {
            if (!K.full) { if (v96pPanelStr(t, K)) return undefined; v96pToast(v96pNotFull(K, t)); return undefined; }
            if (V96P.lastStat && Date.now() - V96P.lastStat < 1500) return undefined; // 直前のトーストで「そろっています」を出した
          }
        }
      } catch (e) { v96pErr("fillopen", e); }
      return o.apply(this, arguments);
    };
    f._v96 = 1;
    window.v92itemFillOpen = f;
  } catch (e) { v96pErr("fillopenw", e); }
})();
// AI ヒアリングの文：「全項目が揃いました」「すべての項目が揃っています」「必要な情報はすべて揃いました」
if (typeof fillSay === "function") {
  const __fs96 = fillSay;
  fillSay = function (who, html) {
    const a = [].slice.call(arguments);
    try {
      // ヒアリングで強みを答えたとき：3件に届かないうちは「充足度 +Npt」と言わず、件数と a/b・c/d を出す
      if (who === "ai" && typeof html === "string" && /^<b>[^<]+<\/b>を登録しました。充足度 <b>\d+%<\/b>（\+\d+pt）/.test(html) && typeof FILL !== "undefined" && FILL && FILL.cur && FILL.cur.k === "strengths") {
        const t = v96pTen(), N = v96pSTRN();
        const n = t ? v96pStrN(t) : 0;
        if (t && n > 0 && n < N) {
          const K = v96pK(t);
          a[1] = html.replace(/^(<b>[^<]+<\/b>)を登録しました。充足度 <b>\d+%<\/b>（\+\d+pt）/, (m0, b) => `${b}${v96pE(v96pM(`を登録しました（いま ${n}/${N}件・あと${N - n}件で「入力済み」）。${v96pStat(K)}`, ` registered (${n}/${N}; ${N - n} more to count as filled). ${v96pStat(K)}`, `已登记（${n}/${N}项，再${N - n}项即视为已填写）。${v96pStat(K)}`, ` registrado (${n}/${N}; faltan ${N - n}). ${v96pStat(K)}`))}`);
          V96P.n.claim++;
          return __fs96.apply(this, a);
        }
      }
      if (who === "ai" && typeof html === "string" && /全項目が揃いました|すべての項目が揃っています|必要な情報はすべて揃|必要な項目は、すべて資料から読み取れました/.test(html)) {
        const t = v96pTen(), K = v96pK(t);
        if (t && K && !K.full) {
          const msg = "<b>" + v96pE(v96pNotFull(K, t)) + "</b>";
          let h = html;
          if (/<b>これで全項目が揃いました。充足度 100%。<\/b>/.test(h)) h = msg + "<br>" + v96pE(v96pM("質問できる項目はここまでです。商品情報の画面で確かめて入れてください。", "That is all the AI can ask now. Please check and fill them in on the product info screen.", "可提问的项目到此为止。请在商品信息页面确认并填写。", "Eso es todo lo que la IA puede preguntar. Revíselos en la pantalla del producto."));
          else h = h.replace(/<b>(?:すべての項目が揃っています。|必要な情報はすべて揃いました。|必要な情報はすべて揃っています。|必要な項目は、すべて資料から読み取れました。)<\/b>/, msg);
          if (h !== html) { a[1] = h; V96P.n.claim++; }
        }
      }
    } catch (e) { v96pErr("fillsay", e); }
    return __fs96.apply(this, a);
  };
}

// 商品の要約・AI のよくある質問・「足りない情報は？」の答え：「必要な情報はすべて揃っています」「すべて揃っています（充足度 100%）」
function v96pClaimFix(h, t) {
  try {
    if (typeof h !== "string" || !/すべて揃っています|すべて登録済み/.test(h)) return h;
    t = t || v96pTen(); if (!t || t !== v96pTen()) return h;
    const K = v96pK(t); if (!K || K.full) return h;
    const msg = v96pE(v96pNotFull(K, t));
    const h2 = h.replace(/<b>必要な情報はすべて揃っています。<\/b>(貿易クラウドはフルパワーで動きます。)?/, "<b>" + msg + "</b>")
      .replace(/^必要な情報はすべて揃っています。/, msg + "。")
      .replace(/<b>すべて揃っています（充足度 100%）。<\/b>/, "<b>" + msg + "</b>")
      .replace(/根拠：必要項目 (\d+)件すべて登録済み/, `根拠：登録の項目 全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}`)
      .replace(/^根拠：必要項目 (\d+)件$/, `根拠：登録の項目 全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}`);
    if (h2 !== h) V96P.n.claim++;
    return h2;
  } catch (e) { v96pErr("claimfix", e); return h; }
}
if (typeof buildSummary === "function") {
  const __bs96 = buildSummary;
  buildSummary = function (t) { const r = __bs96.apply(this, arguments); return v96pClaimFix(r, t); };
}
if (typeof buildAiq === "function") {
  const __bq96 = buildAiq;
  buildAiq = function (t) {
    const r = __bq96.apply(this, arguments);
    try { if (Array.isArray(r)) r.forEach((x) => { if (x && typeof x === "object") { if (typeof x.a === "string") x.a = v96pClaimFix(x.a, t); if (typeof x.c === "string") x.c = v96pClaimFix(x.c, t); } }); } catch (e) { v96pErr("aiq", e); }
    return r;
  };
}
if (typeof ansMissing === "function") {
  const __am96 = ansMissing;
  ansMissing = function () {
    const r = __am96.apply(this, arguments);
    try { if (r && typeof r === "object") { if (typeof r.a === "string") r.a = v96pClaimFix(r.a); if (typeof r.c === "string") r.c = v96pClaimFix(r.c); } } catch (e) { v96pErr("ansmiss", e); }
    return r;
  };
}

/* ══════════ No.511 英文社名の案（辞書で英語の語に戻す） ══════════ */
const V96P_KD = (function () {
  const src = "ペット=Pet|ペッツ=Pets|スマイル=Smile|スマイルズ=Smiles|トレーディング=Trading|トレード=Trade|コーポレーション=Corporation|カンパニー=Company|ホールディングス=Holdings|グループ=Group|" +
    "インターナショナル=International|インター=Inter|ナショナル=National|グローバル=Global|ジャパン=Japan|ニッポン=Nippon|ワールド=World|アジア=Asia|パシフィック=Pacific|オリエンタル=Oriental|ユニバーサル=Universal|ジェネラル=General|" +
    "エンタープライズ=Enterprise|サービス=Service|サービシズ=Services|システム=System|システムズ=Systems|ソリューション=Solution|ソリューションズ=Solutions|テクノロジー=Technology|テクノロジーズ=Technologies|テック=Tech|テクノ=Techno|" +
    "ラボ=Lab|ラボラトリー=Laboratory|ラボラトリーズ=Laboratories|リサーチ=Research|サイエンス=Science|デザイン=Design|クリエイト=Create|クリエイティブ=Creative|クリエーション=Creation|" +
    "プロダクト=Product|プロダクツ=Products|プロダクション=Production|マニュファクチャリング=Manufacturing|インダストリー=Industry|インダストリーズ=Industries|エンジニアリング=Engineering|" +
    "マテリアル=Material|マテリアルズ=Materials|ケミカル=Chemical|ケミカルズ=Chemicals|ファーマ=Pharma|ファーマシー=Pharmacy|ファーマシューティカル=Pharmaceutical|ファーマシューティカルズ=Pharmaceuticals|" +
    "メディカル=Medical|メディカルズ=Medicals|ヘルス=Health|ヘルスケア=Healthcare|ケア=Care|ウェルネス=Wellness|ビューティー=Beauty|ビューティ=Beauty|コスメ=Cosme|コスメティック=Cosmetic|コスメティクス=Cosmetics|" +
    "スキン=Skin|スキンケア=Skincare|ヘア=Hair|ヘアケア=Haircare|ボディ=Body|ボディー=Body|ネイチャー=Nature|ナチュラル=Natural|オーガニック=Organic|ボタニカル=Botanical|エコ=Eco|バイオ=Bio|" +
    "グリーン=Green|ブルー=Blue|レッド=Red|ホワイト=White|ブラック=Black|ゴールド=Gold|ゴールデン=Golden|シルバー=Silver|ピンク=Pink|オレンジ=Orange|イエロー=Yellow|パープル=Purple|" +
    "スター=Star|スターズ=Stars|サン=Sun|サンライズ=Sunrise|サンシャイン=Sunshine|ムーン=Moon|スカイ=Sky|オーシャン=Ocean|マリン=Marine|アクア=Aqua|ウォーター=Water|レインボー=Rainbow|" +
    "ファーム=Farm|ファームズ=Farms|フード=Food|フーズ=Foods|ベーカリー=Bakery|カフェ=Cafe|キッチン=Kitchen|ダイニング=Dining|レストラン=Restaurant|ワイン=Wine|ワインズ=Wines|ビール=Beer|ブルワリー=Brewery|" +
    "ティー=Tea|コーヒー=Coffee|スイーツ=Sweets|フルーツ=Fruits|フルーツ=Fruits|ベジタブル=Vegetable|ミート=Meat|フィッシュ=Fish|シーフード=Seafood|ライス=Rice|ハム=Ham|ミルク=Milk|デイリー=Dairy|" +
    "ハニー=Honey|クリーム=Cream|ソープ=Soap|オイル=Oil|ハーブ=Herb|ハーブス=Herbs|アロマ=Aroma|エッセンス=Essence|サプリメント=Supplement|ビタミン=Vitamin|ニュートリション=Nutrition|" +
    "ドッグ=Dog|ドッグス=Dogs|キャット=Cat|キャッツ=Cats|アニマル=Animal|アニマルズ=Animals|ハッピー=Happy|ハート=Heart|ハーツ=Hearts|ラブ=Love|ライフ=Life|ライフスタイル=Lifestyle|リビング=Living|" +
    "ホーム=Home|ハウス=House|ファミリー=Family|ベビー=Baby|キッズ=Kids|チャイルド=Child|スポーツ=Sports|アウトドア=Outdoor|フィットネス=Fitness|ファッション=Fashion|アパレル=Apparel|テキスタイル=Textile|" +
    "スタイル=Style|クラフト=Craft|クラフツ=Crafts|アート=Art|アーツ=Arts|ワーク=Work|ワークス=Works|ファクトリー=Factory|ショップ=Shop|ストア=Store|マート=Mart|マーケット=Market|マーケティング=Marketing|" +
    "コマース=Commerce|ネット=Net|ネットワーク=Network|ネットワークス=Networks|ウェブ=Web|デジタル=Digital|データ=Data|ソフト=Soft|ソフトウェア=Software|エレクトロニクス=Electronics|エレクトリック=Electric|" +
    "エナジー=Energy|エネルギー=Energy|パワー=Power|ソーラー=Solar|モーター=Motor|モーターズ=Motors|オート=Auto|オートモーティブ=Automotive|カー=Car|カーズ=Cars|パーツ=Parts|ツール=Tool|ツールズ=Tools|" +
    "マシン=Machine|マシナリー=Machinery|メタル=Metal|スチール=Steel|プラスチック=Plastic|パッケージ=Package|パッケージング=Packaging|ロジスティクス=Logistics|エクスプレス=Express|トランスポート=Transport|" +
    "トラベル=Travel|エージェンシー=Agency|パートナー=Partner|パートナーズ=Partners|アソシエイツ=Associates|コンサルティング=Consulting|マネジメント=Management|キャピタル=Capital|ファイナンス=Finance|" +
    "プランニング=Planning|クオリティ=Quality|クオリティー=Quality|プレミアム=Premium|ロイヤル=Royal|クラウン=Crown|プライム=Prime|ファースト=First|ネクスト=Next|ニュー=New|フューチャー=Future|" +
    "ドリーム=Dream|ドリームズ=Dreams|ビジョン=Vision|ホープ=Hope|ピース=Peace|ユニオン=Union|ユナイテッド=United|アライアンス=Alliance|リンク=Link|リンクス=Links|ブリッジ=Bridge|ゲート=Gate|ポート=Port|" +
    "ベース=Base|センター=Center|ハブ=Hub|プラス=Plus|ワン=One|トップ=Top|ベスト=Best|エース=Ace|ビッグ=Big|スマート=Smart|クリーン=Clean|フレッシュ=Fresh|ピュア=Pure|シンプル=Simple|ベーシック=Basic|" +
    "クラシック=Classic|モダン=Modern|アーバン=Urban|シティ=City|シティー=City|カントリー=Country|マウンテン=Mountain|フォレスト=Forest|ツリー=Tree|リーフ=Leaf|フラワー=Flower|フラワーズ=Flowers|ガーデン=Garden|" +
    "ローズ=Rose|ビー=Bee|ドクター=Doctor|メディア=Media|コミュニケーション=Communication|コミュニケーションズ=Communications|エンターテインメント=Entertainment|ミュージック=Music|ゲーム=Game|ゲームス=Games|" +
    "トイ=Toy|トイズ=Toys|ホビー=Hobby|ブック=Book|ブックス=Books|プレス=Press|パブリッシング=Publishing|エデュケーション=Education|アカデミー=Academy|スクール=School|クリニック=Clinic|" +
    "グッズ=Goods|ジュエリー=Jewelry|ジュエル=Jewel|エンジェル=Angel|プリンセス=Princess|クイーン=Queen|キング=King|ネオ=Neo|アメリカ=America|ヨーロッパ=Europe|チャイナ=China|コリア=Korea|" +
    "ベトナム=Vietnam|インド=India|トーキョー=Tokyo|ブラザーズ=Brothers|シスターズ=Sisters|フレンズ=Friends|フレンド=Friend|ハンド=Hand|ハンズ=Hands|メイド=Made|リミテッド=Limited|" +
    "アンド=&|インク=Inc.|ラボズ=Labs|ラボス=Labs|ソリッド=Solid|シード=Seed|シーズ=Seeds|ルーツ=Roots|ウッド=Wood|ストーン=Stone|ファイン=Fine|ライン=Line|ウェイ=Way|ロード=Road|ステーション=Station|" +
    "コネクト=Connect|クラウド=Cloud|アイランド=Island|ビレッジ=Village|タウン=Town|ランド=Land|ワイズ=Wise|ジャパニーズ=Japanese|ウィズ=With|フォー=For|オブ=of|ザ=The";
  const o = {};
  src.split("|").forEach((p) => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i)] = p.slice(i + 1); });
  return o;
})();
const V96P_KMAX = Object.keys(V96P_KD).reduce((a, k) => Math.max(a, k.length), 0);
// 法人の種類（英語の付け方）。ここに無い種類（一般社団法人など）は案を出さない
const V96P_FORM = [[/^(株式会社|（株）|\(株\)|㈱)\s*|\s*(株式会社|（株）|\(株\)|㈱)$/, "Co., Ltd."], [/^(有限会社|（有）|\(有\)|㈲)\s*|\s*(有限会社|（有）|\(有\)|㈲)$/, "Ltd."],
  [/^合同会社\s*|\s*合同会社$/, "LLC"], [/^合資会社\s*|\s*合資会社$/, "Limited Partnership"], [/^合名会社\s*|\s*合名会社$/, "General Partnership"]];
const V96P_NOFORM = /法人|組合|協会|財団|社団|機構|学校|大学|病院|医院/;
// カタカナの並びを辞書の語に分ける（語の数が最も少ない分け方）。分けられなければ null
function v96pSegKana(s) {
  const n = s.length;
  if (!n) return [];
  const best = new Array(n + 1).fill(null);
  best[0] = [];
  for (let i = 0; i < n; i++) {
    if (!best[i]) continue;
    for (let L = Math.min(V96P_KMAX, n - i); L >= 2; L--) {
      const en = V96P_KD[s.slice(i, i + L)];
      if (en == null) continue;
      const cand = best[i].concat([en]);
      if (!best[i + L] || cand.length < best[i + L].length) best[i + L] = cand;
    }
  }
  return best[n];
}
/* 会社名（日本語）から英文社名の案。辞書で全部の語が決まるときだけ {name, partial:false, src:"dict"}。それ以外は null（案を出さない） */
function v96pCoEnDraftOf(co) {
  try {
    let s = v96pNF(co).replace(/[\s　]+/g, " ").trim();
    if (!s) return null;
    if (/[ぁ-ゖ一-龠々〆]/.test(s.replace(/株式会社|有限会社|合同会社|合資会社|合名会社|（株）|\(株\)|（有）|\(有\)/g, ""))) { V96P.lastCoEn = { co, why: "kanji" }; return null; }
    if (!/[ァ-ヶ]/.test(s)) { V96P.lastCoEn = { co, why: "nokana" }; return null; }
    s = s.replace(/[（(][^（）()]*[A-Za-z][^（）()]*[）)]/g, "").trim();
    let form = "";
    for (const [re, en] of V96P_FORM) { if (re.test(s)) { form = en; s = s.replace(re, "").trim(); break; } }
    if (!s || V96P_NOFORM.test(s)) { V96P.lastCoEn = { co, why: "form" }; return null; }
    if (/[ぁ-ゖ一-龠々〆]/.test(s)) { V96P.lastCoEn = { co, why: "kanji" }; return null; }
    const words = [];
    const toks = s.split(/([ ・･=＝&＋+\-‐－／/]+)/).filter((x) => x !== "");
    for (const tk of toks) {
      if (/^[ ・･=＝＋+\-‐－／/]+$/.test(tk)) continue;
      if (/^[&]+$/.test(tk)) { words.push("&"); continue; }
      let i = 0;
      while (i < tk.length) {
        const c = tk[i];
        if (/[ァ-ヶー]/.test(c)) {
          let j = i; while (j < tk.length && /[ァ-ヶー]/.test(tk[j])) j++;
          const seg = v96pSegKana(tk.slice(i, j));
          if (!seg) { V96P.lastCoEn = { co, why: "dict", part: tk.slice(i, j) }; return null; }
          seg.forEach((w) => words.push(w));
          i = j; continue;
        }
        if (/[A-Za-z0-9]/.test(c)) { let j = i; while (j < tk.length && /[A-Za-z0-9.'’]/.test(tk[j])) j++; words.push(tk.slice(i, j)); i = j; continue; }
        V96P.lastCoEn = { co, why: "char", part: c }; return null;
      }
    }
    if (!words.length || words.every((w) => w === "&")) return null;
    // 先頭の The・of・& の並びを整える
    const W = words.filter((w, i) => !(w === "&" && (i === 0 || i === words.length - 1)));
    if (W[0] === "of") return null;
    let name = W.join(" ").replace(/\s+&\s+/g, " & ");
    const last = W[W.length - 1];
    const selfForm = /^(Corporation|Company|Inc\.|Limited|LLC)$/.test(last);
    if (form && !selfForm) name += form === "Co., Ltd." ? " Co., Ltd." : " " + form;
    V96P.n.coen++;
    V96P.lastCoEn = { co, name };
    return { name, partial: false, src: "dict", words: W };
  } catch (e) { v96pErr("coen", e); return null; }
}
try {
  if (typeof v95infoCoEnDraftOf === "function") { v95infoCoEnDraftOf = v96pCoEnDraftOf; V96P.coenSwap = 1; }
} catch (e) { v96pErr("coenswap", e); }
const V96P_COEN_WHY = "会社名のカタカナを、辞書で英語の語に戻した案です。正式な英文表記（登記・名刺・Webサイト）と同じか確かめてください";
function v96pCoEnWhyL(partial) {
  return v96pM(V96P_COEN_WHY + "。押すまで書類には入りません", "A suggestion made by mapping the katakana in your company name back to English words with a dictionary. Check it against your official English name (registration, business card, website). Not added to documents until you press the button", "将公司名中的片假名按词典还原为英文单词生成的建议。请与正式英文名称（登记、名片、网站）核对。按下按钮之前不会写入单证", "Sugerencia creada devolviendo al inglés, con un diccionario, el katakana del nombre de la empresa. Compruébela con su nombre oficial en inglés. No se añade a los documentos hasta que pulse el botón");
}
if (typeof v95infoCoEnWhyL === "function") {
  const __wl96 = v95infoCoEnWhyL;
  v95infoCoEnWhyL = function (S) { try { if (S && S.src === "ja" && !S.partial && V96P.coenSwap) return v96pCoEnWhyL(); } catch (e) { } return __wl96.apply(this, arguments); };
}
if (typeof v95infoCoEnWhy === "function") {
  const __wh96 = v95infoCoEnWhy;
  v95infoCoEnWhy = function (d) { try { if (!(d && d.partial) && V96P.coenSwap) return "（" + V96P_COEN_WHY + "）"; } catch (e) { } return __wh96.apply(this, arguments); };
}
if (typeof v92docCoEnFrom === "function") {
  const __cf96 = v92docCoEnFrom;
  v92docCoEnFrom = function (c) { try { if (c && c.src === "ja" && V96P.coenSwap) return V96P_COEN_WHY; } catch (e) { } return __cf96.apply(this, arguments); };
}
if (typeof v54docSellerEdit === "function") {
  const __se96 = v54docSellerEdit;
  v54docSellerEdit = function () {
    const r = __se96.apply(this, arguments);
    try { const n = document.querySelector("#pn .v54sugnote span, #pn .v54sugnote"); if (n && /読み方・英語の綴り/.test(n.textContent || "")) n.textContent = "会社名のカタカナを辞書で英語の語に戻した案を入れています。正式な英文表記と同じか確かめて、違っていれば直してから保存してください。"; } catch (e) { v96pErr("seller", e); }
    return r;
  };
}
// 英文社名が未登録で、案も出せないとき（画面の案内に使う。見せ方は rd_v96prod.js）
function v96pCoEnNone(t) {
  try {
    t = t || v96pTen();
    if (!t || String(t.coEn || "").trim()) return null;
    if (typeof v95infoCoEnSug === "function" && v95infoCoEnSug(t)) return null;
    const why = (V96P.lastCoEn && V96P.lastCoEn.co === t.co) ? V96P.lastCoEn.why : "";
    return { co: String(t.co || ""), why };
  } catch (e) { return null; }
}

/* ══════════ No.514 全成分表（INCI） ══════════ */
// 和名 → INCI 名（化粧品でよく使う成分。表示名称と INCI 名が1対1のもの）
const V96P_INCI_ADD = { "ツバキ種子油": "CAMELLIA JAPONICA SEED OIL", "ツバキ油": "CAMELLIA JAPONICA SEED OIL", "ホホバ種子油": "SIMMONDSIA CHINENSIS (JOJOBA) SEED OIL", "ホホバ油": "SIMMONDSIA CHINENSIS (JOJOBA) SEED OIL",
  "アルガニアスピノサ核油": "ARGANIA SPINOSA KERNEL OIL", "オリーブ果実油": "OLEA EUROPAEA (OLIVE) FRUIT OIL", "オリーブ油": "OLEA EUROPAEA (OLIVE) FRUIT OIL", "シア脂": "BUTYROSPERMUM PARKII (SHEA) BUTTER",
  "マカデミア種子油": "MACADAMIA TERNIFOLIA SEED OIL", "コメヌカ油": "ORYZA SATIVA (RICE) BRAN OIL", "アボカド油": "PERSEA GRATISSIMA (AVOCADO) OIL", "ヒマワリ種子油": "HELIANTHUS ANNUUS (SUNFLOWER) SEED OIL",
  "アーモンド油": "PRUNUS AMYGDALUS DULCIS (SWEET ALMOND) OIL", "アンズ核油": "PRUNUS ARMENIACA (APRICOT) KERNEL OIL", "ブドウ種子油": "VITIS VINIFERA (GRAPE) SEED OIL", "ゴマ油": "SESAMUM INDICUM (SESAME) SEED OIL",
  "ヤシ油": "COCOS NUCIFERA (COCONUT) OIL", "パーム油": "ELAEIS GUINEENSIS (PALM) OIL", "ヒマシ油": "RICINUS COMMUNIS (CASTOR) SEED OIL", "メドウフォーム油": "LIMNANTHES ALBA (MEADOWFOAM) SEED OIL",
  "ラベンダー油": "LAVANDULA ANGUSTIFOLIA (LAVENDER) OIL", "ユズ果実エキス": "CITRUS JUNOS FRUIT EXTRACT", "チャ葉エキス": "CAMELLIA SINENSIS LEAF EXTRACT", "アロエベラ葉エキス": "ALOE BARBADENSIS LEAF EXTRACT",
  "ドクダミエキス": "HOUTTUYNIA CORDATA EXTRACT", "ハトムギ種子エキス": "COIX LACRYMA-JOBI MA-YUEN SEED EXTRACT", "ローズマリー葉エキス": "ROSMARINUS OFFICINALIS (ROSEMARY) LEAF EXTRACT",
  "ダマスクバラ花水": "ROSA DAMASCENA FLOWER WATER", "ツボクサエキス": "CENTELLA ASIATICA EXTRACT", "ユキノシタエキス": "SAXIFRAGA SARMENTOSA EXTRACT", "オウゴン根エキス": "SCUTELLARIA BAICALENSIS ROOT EXTRACT",
  "ダイズ種子エキス": "GLYCINE SOJA (SOYBEAN) SEED EXTRACT", "ローヤルゼリーエキス": "ROYAL JELLY EXTRACT", "プロポリスエキス": "PROPOLIS EXTRACT", "ハチミツ": "HONEY",
  "加水分解コラーゲン": "HYDROLYZED COLLAGEN", "水溶性コラーゲン": "SOLUBLE COLLAGEN", "加水分解ヒアルロン酸": "HYDROLYZED HYALURONIC ACID", "アセチルヒアルロン酸Na": "SODIUM ACETYLATED HYALURONATE",
  "ヒアルロン酸": "HYALURONIC ACID", "加水分解シルク": "HYDROLYZED SILK", "加水分解エラスチン": "HYDROLYZED ELASTIN", "セラミドNG": "CERAMIDE NG", "セラミドAG": "CERAMIDE AG", "セラミドNS": "CERAMIDE NS",
  "コレステロール": "CHOLESTEROL", "フィトステロールズ": "PHYTOSTEROLS", "トレハロース": "TREHALOSE", "ソルビトール": "SORBITOL", "キシリトール": "XYLITOL", "ジグリセリン": "DIGLYCERIN",
  "PG": "PROPYLENE GLYCOL", "プロピレングリコール": "PROPYLENE GLYCOL", "メチルグルセス-10": "METHYL GLUCETH-10", "ポリソルベート20": "POLYSORBATE 20", "ポリソルベート60": "POLYSORBATE 60", "ポリソルベート80": "POLYSORBATE 80",
  "トリ(カプリル酸/カプリン酸)グリセリル": "CAPRYLIC/CAPRIC TRIGLYCERIDE", "エチルヘキサン酸セチル": "CETYL ETHYLHEXANOATE", "ミリスチン酸イソプロピル": "ISOPROPYL MYRISTATE", "パルミチン酸エチルヘキシル": "ETHYLHEXYL PALMITATE",
  "ステアリン酸グリセリル": "GLYCERYL STEARATE", "ステアリルアルコール": "STEARYL ALCOHOL", "ベヘニルアルコール": "BEHENYL ALCOHOL", "シクロメチコン": "CYCLOMETHICONE", "水添レシチン": "HYDROGENATED LECITHIN", "レシチン": "LECITHIN",
  "アルギニン": "ARGININE", "乳酸": "LACTIC ACID", "乳酸Na": "SODIUM LACTATE", "酢酸トコフェロール": "TOCOPHERYL ACETATE", "アスコルビルグルコシド": "ASCORBYL GLUCOSIDE", "リン酸アスコルビルMg": "MAGNESIUM ASCORBYL PHOSPHATE",
  "テトラヘキシルデカン酸アスコルビル": "ASCORBYL TETRAISOPALMITATE", "アルブチン": "ARBUTIN", "トラネキサム酸": "TRANEXAMIC ACID", "ユビキノン": "UBIQUINONE", "アデノシン": "ADENOSINE",
  "パルミトイルペンタペプチド-4": "PALMITOYL PENTAPEPTIDE-4", "アセチルヘキサペプチド-8": "ACETYL HEXAPEPTIDE-8", "メントール": "MENTHOL", "香料": "FRAGRANCE", "酸化鉄": "IRON OXIDES", "マイカ": "MICA", "タルク": "TALC",
  "シリカ": "SILICA", "窒化ホウ素": "BORON NITRIDE", "カオリン": "KAOLIN", "ベントナイト": "BENTONITE", "ソルビン酸K": "POTASSIUM SORBATE", "安息香酸Na": "SODIUM BENZOATE", "デヒドロ酢酸Na": "SODIUM DEHYDROACETATE",
  "ヒドロキシアセトフェノン": "HYDROXYACETOPHENONE", "オクチルドデカノール": "OCTYLDODECANOL", "ポリクオタニウム-10": "POLYQUATERNIUM-10", "ポリクオタニウム-51": "POLYQUATERNIUM-51", "ヒドロキシエチルセルロース": "HYDROXYETHYLCELLULOSE",
  "セルロースガム": "CELLULOSE GUM", "寒天": "AGAR", "メトキシケイヒ酸エチルヘキシル": "ETHYLHEXYL METHOXYCINNAMATE", "t-ブチルメトキシジベンゾイルメタン": "BUTYL METHOXYDIBENZOYLMETHANE", "ラノリン": "LANOLIN",
  "ミツロウ": "BEESWAX", "パラフィン": "PARAFFIN", "マイクロクリスタリンワックス": "MICROCRYSTALLINE WAX", "水添ポリイソブテン": "HYDROGENATED POLYISOBUTENE", "イソドデカン": "ISODODECANE", "BHT": "BHT",
  "ペンテト酸5Na": "PENTASODIUM PENTETATE", "エチドロン酸": "ETIDRONIC ACID", "ポリアクリル酸Na": "SODIUM POLYACRYLATE", "セリン": "SERINE", "グリシン": "GLYCINE", "アラニン": "ALANINE", "プロリン": "PROLINE",
  "PCA-Na": "SODIUM PCA", "ミリスチン酸": "MYRISTIC ACID", "ラウリン酸": "LAURIC ACID", "パルミチン酸": "PALMITIC ACID", "尿素": "UREA", "塩化Na": "SODIUM CHLORIDE", "炭酸水素Na": "SODIUM BICARBONATE",
  "ラウリル硫酸Na": "SODIUM LAURYL SULFATE", "ラウレス硫酸Na": "SODIUM LAURETH SULFATE", "コカミドプロピルベタイン": "COCAMIDOPROPYL BETAINE", "ココイルグルタミン酸Na": "SODIUM COCOYL GLUTAMATE",
  "ビフィズス菌培養溶解質": "BIFIDA FERMENT LYSATE", "ガラクトミセス培養液": "GALACTOMYCES FERMENT FILTRATE", "グルコシルヘスペリジン": "GLUCOSYL HESPERIDIN", "1,3-BG": "BUTYLENE GLYCOL" };
try {
  if (typeof V68P_INCI !== "undefined" && typeof V68P_INCI_K !== "undefined" && typeof v68pInciKey === "function") {
    Object.keys(V96P_INCI_ADD).forEach((ja) => { const k = v68pInciKey(ja); if (!V68P_INCI_K[k]) { V68P_INCI_K[k] = V96P_INCI_ADD[ja]; if (!(ja in V68P_INCI)) V68P_INCI[ja] = V96P_INCI_ADD[ja]; } });
  }
} catch (e) { v96pErr("incidict", e); }
const V96P_INCIH = /INCI|英名|英語|英文|English|表示名称.*英/i;
const V96P_NOTEH = /備考|メモ|注記|注意|note|remark|用途|目的|機能|function|purpose|由来|origin|産地|規格|区分|種別|配合率|配合量|濃度|%|％/i;
// 英字だけの INCI 名らしい値（Water・CAMELLIA JAPONICA SEED OIL・1,2-HEXANEDIOL・CI 77891 など）
function v96pInciLike(s) {
  s = v96pNF(s).trim();
  if (!s || s.length > 120 || /[ぁ-ゖァ-ヶ一-龠々]/.test(s)) return false;
  if (!/[A-Za-z]{3,}/.test(s) || !/^[A-Za-z0-9(]/.test(s)) return false;
  if (!/^[A-Za-z0-9 ,.'’()\/\-+&:]+$/.test(s)) return false;
  if (/^(n\/?a|none|yes|no|ok|tbd|tbc|unknown|same|active|other|others|mg|ml|ppm)$/i.test(s)) return false;
  if (/^\d+(\.\d+)?\s*(%|mg|ml|g|ppm)$/i.test(s)) return false;
  return true;
}
// 成分表の INCI 名：表の INCI 名の列（見出し・英字の値）を使い、備考から外す
if (typeof v68pInciView === "function") {
  const __iv96 = v68pInciView;
  v68pInciView = function (t) {
    const V = __iv96.apply(this, arguments);
    try {
      if (!Array.isArray(V) || !V.length || !t) return V;
      const V_ = (typeof v68pV === "function") ? v68pV : ((s) => String(s == null ? "" : s).replace(/[\s　]+/g, " ").trim());
      const N_ = (typeof v68pN === "function") ? v68pN : v96pNF;
      const cols = (t.compCols || []).map((c) => String(c == null ? "" : c));
      const iP = cols.findIndex((c) => /配合率|配合量|濃度|%|％|percent/i.test(c)), iA = cols.findIndex((c) => /区分|有効成分|種別|active/i.test(c));
      const iI = cols.findIndex((c, i) => i > 0 && i !== iP && i !== iA && V96P_INCIH.test(c));
      const man = ((t.v68attrs || {}).inci) || {};
      let k = 0;
      (t.compRows || []).forEach((r0) => {
        const r = Array.isArray(r0) ? r0 : [r0];
        if (!V_(r[0])) return;
        const x = V[k++];
        if (!x) return;
        let ci = -1, val = "";
        if (iI > 0 && V_(r[iI])) { ci = iI; val = V_(r[iI]); }
        else {
          for (let i = 1; i < r.length; i++) {
            if (i === iP || i === iA || (cols[i] && V96P_NOTEH.test(cols[i]))) continue;
            const s = V_(r[i]); if (s && v96pInciLike(s)) { ci = i; val = s; break; }
          }
        }
        if (!val && v96pInciLike(x.ja)) { ci = 0; val = x.ja; }
        if (!val) return;
        if (!(man[x.ja] && man[x.ja].inci)) { x.inci = N_(val).toUpperCase(); x.from = ci === 0 ? "表（INCI名）" : "表"; V96P.n.inci++; }
        if (ci > 0) x.note = r.filter((v, i) => i > 0 && i !== iP && i !== iA && i !== ci && String(v == null ? "" : v).trim()).map((v) => N_(v)).join("／");
      });
    } catch (e) { v96pErr("inciview", e); }
    return V;
  };
}
if (typeof v68pInciTable === "function") {
  const __it96 = v68pInciTable;
  v68pInciTable = function (t) {
    let h = __it96.apply(this, arguments);
    try {
      if (!h || typeof v68pInciView !== "function") return h;
      const V = v68pInciView(t) || [];
      const nT = V.filter((x) => x && /^表/.test(String(x.from || ""))).length;
      if (nT) h = String(h).replace(/(<p class="nn"[^>]*data-v68incinote[^>]*>)/, `$1${v96pE(v96pM(`表に INCI 名が書いてある ${nT}成分は、その名前を INCI 名の欄に出しています。`, `${nT} ingredient(s) use the INCI name written in your table. `, `表中已写有INCI名的 ${nT} 种成分，直接使用该名称。`, `${nT} ingrediente(s) usan el nombre INCI escrito en su tabla. `))}`);
    } catch (e) { v96pErr("incitbl", e); }
    return h;
  };
}
// 成分の並びの見出し（全成分・成分・Ingredients・INCI）
const V96P_IHEAD = /^[\s　]*[【\[［■□●○◆◇▼▽◎★☆#＃*＊]*[\s　]*(全成分(?:表示)?(?:名称)?|全成分表|成分(?:表示)?(?:名)?|配合成分|Ingredients?|INCI(?:\s*(?:名|names?))?|Full\s+ingredients?(?:\s+list)?)[\s　]*(?:[（(][^）)]{0,24}[）)])?[\s　]*[】\]］]?[\s　]*(?:[：:]\s*(.*))?$/i;
const V96P_ISTOP = /^[\s　]*(?:商品|製品|品名|品番|内容量|容量|使用|使い方|ご使用|注意|保管|保存|価格|単価|MOQ|最小|JAN|HS|原産|産地|製造|販売|発売|会社|URL|特長|特徴|強み|効果|効能|区分|カテゴリ|商材|リードタイム|賞味|使用期限|認証|規格|寸法|重量|入数|取引|支払|仕出|英文|Product|Price|Usage|How to|Directions|Caution|Warning)[^：:]{0,14}[：:]/i;
const V96P_IMARK = /^[\s　]*[【\[［■□●◆◇▼▽◎★☆#＃]/;
function v96pItemOf(raw) {
  let s = v96pNF(raw).replace(/^[\s　]*(?:[・•●○◦\-–—*＊※]|\d{1,3}[.)）]|[①-⑳])[\s　]*/, "").replace(/[。．.]+$/, "").trim();
  if (!s || s.length > 90 || /。|です|ます|でした/.test(s) || /[ぁ-ゖ]/.test(s)) return null;
  let ja = s, inci = "", pct = "";
  const pm = s.match(/[\s　]*[（(]?\s*(\d+(?:\.\d+)?)\s*(?:%|％|wt%)\s*[）)]?\s*$/i);
  if (pm && pm.index > 0) { pct = pm[1] + "%"; ja = s.slice(0, pm.index).trim(); }
  const pp = ja.match(/^(.+?)[\s　]*[（(]([^（）()]+)[）)]$/);
  if (pp && v96pInciLike(pp[2]) && /[ぁ-ゖァ-ヶ一-龠々]/.test(pp[1])) { ja = pp[1].trim(); inci = pp[2].trim(); }
  const kv = ja.split(/\s*[：:\t｜|]\s*|\s{2,}/).map((x) => x.trim()).filter(Boolean);
  if (kv.length >= 2) {
    const li = kv.findIndex((x, i) => i > 0 && v96pInciLike(x));
    if (li > 0) { inci = inci || kv[li]; ja = kv[0]; const p2 = kv.find((x, i) => i > 0 && /^\d+(?:\.\d+)?\s*(%|％)$/.test(x)); if (p2 && !pct) pct = p2.replace(/％/, "%").replace(/\s+/g, ""); }
    else return null;
  }
  ja = ja.trim();
  if (!ja || ja.length > 70) return null;
  return { ja, inci, pct };
}
function v96pSplitItems(line) {
  let s = v96pNF(line).replace(/(\d),(\d)/g, "$1\u0001$2");
  let parts = s.split(/[、,，;；]/);
  if (parts.length < 2 && /[^・]・[^・]/.test(s) && !/^[\s　]*・/.test(s)) parts = s.split("・");
  return parts.map((x) => x.replace(/\u0001/g, ",").trim()).filter(Boolean);
}
/* 文から成分の並びを読む。返り値 [{ja, inci, pct}]（2つ以上のときだけ） */
function v96pIngrList(text, t) {
  try {
    const lines = String(text || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/\s*\|\s*/g, "：").replace(/\t+/g, "："));
    const food = !!t && (t.catKey === "food" || t.catKey === "liquor" || /食品|酒類/.test(String(t.cat || "")));
    const lists = [];
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(V96P_IHEAD);
      if (!m) continue;
      const head = m[1];
      if (/栄養/.test(lines[i])) continue;
      const strong = /全成分|Ingredient|INCI|配合成分/i.test(head);
      if (!strong && (food || !(v96pIsCosme(t) || /医療|衛生/.test(String((t && t.cat) || "")) || !String((t && t.cat) || "").trim()))) continue;
      const latin = /Ingredient|INCI/i.test(head);
      const items = [];
      const take = (raw) => { v96pSplitItems(raw).forEach((p) => { const it = v96pItemOf(p); if (it) items.push(it); }); };
      const inl = String(m[2] || "").replace(/^[：:\s]+/, "").trim();
      if (inl) take(inl);
      else {
        let j = i + 1;
        for (; j < lines.length && items.length < 150; j++) {
          const L = lines[j];
          if (!L.trim()) { if (items.length) break; continue; }
          if (V96P_IHEAD.test(L) || V96P_IMARK.test(L) || V96P_ISTOP.test(L)) break;
          if (L.length > 200) break;
          const n0 = items.length;
          take(L);
          if (items.length === n0 && items.length) break;
        }
        i = j - 1;
      }
      if (items.length >= 2) lists.push({ latin, items });
    }
    if (!lists.length) return [];
    const ja = lists.find((x) => !x.latin) || null, en = lists.find((x) => x.latin) || null;
    if (ja && en && ja.items.length === en.items.length) return ja.items.map((x, i) => ({ ja: x.ja, inci: x.inci || (v96pInciLike(en.items[i].ja) ? en.items[i].ja : ""), pct: x.pct || en.items[i].pct }));
    const L = (ja || en).items;
    return L.map((x) => ({ ja: x.ja, inci: x.inci || (v96pInciLike(x.ja) ? x.ja : ""), pct: x.pct }));
  } catch (e) { v96pErr("ingrlist", e); return []; }
}
function v96pKey(s) { return v96pNF(s).replace(/[\s　・*＊※]/g, "").replace(/[（(][^（）()]*[）)]$/, "").toUpperCase(); }
// 強みの見出しが成分名（またはその並び）のときに外す。返り値：外した成分の名前
function v96pStrClean(t, names) {
  const S = Array.isArray(t && t.strengths) ? t.strengths : null;
  if (!S || !S.length) return [];
  const N = new Set((names || []).map(v96pKey).filter(Boolean));
  const out = [], keep = [];
  S.forEach((s) => {
    const h = String((Array.isArray(s) ? s[0] : s) || "").trim();
    const m = h.match(V96P_IHEAD);
    if (m && m[2] && /[、,，]/.test(m[2])) { v96pSplitItems(m[2]).forEach((p) => { const it = v96pItemOf(p); if (it) out.push(it); }); return; }
    if (N.size && N.has(v96pKey(h))) { const it = v96pItemOf(h); if (it) out.push(it); return; }
    keep.push(s);
  });
  if (keep.length !== S.length) t.strengths = keep;
  return out;
}
// 強みに入った「成分名だけ」の並び（AI の読み取りなど）。3つ以上・対応表に2つ以上あるときだけ成分とみなす
function v96pBareIngr(S) {
  const dict = (s) => { try { return typeof v68pInciDict === "function" ? !!v68pInciDict(s) : false; } catch (e) { return false; } };
  const suf = /(油|脂|エキス|酸|酸Na|酸K|Na|K|グリコール|アルコール|ロウ|ガム|花水|液|末|エステル|オール|ール|ン|ド|セリン|シド|ペプチド-\d+)$/;
  const L = (S || []).map((s) => String((Array.isArray(s) ? s[0] : s) || "").trim());
  const ok = L.map((h) => !!h && h.length <= 40 && !/[ぁ-ゖ]/.test(h) && !/[\s　、。！!？?]/.test(h) && (dict(h) || suf.test(v96pNF(h))) && !/配合|使用|フリー|無添加|特許|認証|取得|製法|技術/.test(h));
  const n = ok.filter(Boolean).length, nd = L.filter((h, i) => ok[i] && dict(h)).length;
  return (n >= 3 && nd >= 2) ? ok : null;
}
function v96pCatOk(t, x) {
  const c = String((x && x.cat) || (t && t.cat) || ""), k = String((t && t.catKey) || "");
  return !(/食品|酒類|中古車|自動車|工業部品/.test(c) || k === "food" || k === "liquor" || k === "car" || k === "parts");
}
function v96pIsCosme(t, x) { const c = String((x && x.cat) || (t && t.cat) || ""); return /化粧品/.test(c) || (t && t.catKey === "cosme"); }
function v96pSetComp(t, items, why) {
  const hasPct = items.some((x) => x.pct), inc = v96pIsCosme(t) || items.some((x) => x.inci);
  t.compCols = (inc ? ["表示名称（和名）", "INCI名"] : ["成分"]).concat(hasPct ? ["配合率"] : []);
  t.compRows = items.map((x) => (inc ? [x.ja, x.inci || ""] : [x.ja]).concat(hasPct ? [x.pct || ""] : []));
  const ti = String(t.compTitle || "");
  if (!ti || /^(成分表・材質表|成分表|成分・スペック表|成分・材質表|全成分表（INCI）)$/.test(ti)) t.compTitle = v96pIsCosme(t) || items.some((x) => x.inci) ? "全成分表（INCI）" : (ti || "成分表");
  t.v96ingr = { n: items.length, from: why, at: Date.now() };
  V96P.n.ingr++;
}
// 取り込んだ商品（または AI の結果 x）に成分表を入れ、強みから成分を外す
function v96pIngrApply(t, text, why) {
  try {
    if (!t || typeof t !== "object" || !v96pCatOk(t)) return false;
    const has = Array.isArray(t.compRows) && t.compRows.length > 0;
    const L = text ? v96pIngrList(text, t) : [];
    const names = L.map((x) => x.ja).concat(has ? t.compRows.map((r) => String((Array.isArray(r) ? r[0] : r) || "")) : []);
    const moved = v96pStrClean(t, names);
    // 1列だけの並び（「全成分：…」の1行を「,」で切っただけの表など）は、見出しから読んだ並び（和名・INCI名の組）に置き換える
    const weak = has && !t.v96ingr && t.compRows.every((r) => { const a = Array.isArray(r) ? r : [r]; return a.slice(1).every((v) => !String(v == null ? "" : v).trim()); });
    if ((!has || weak) && L.length >= 2) { v96pSetComp(t, L, why); return true; }
    if (!has && moved.length >= 2) { v96pSetComp(t, moved, why + "（強みの欄から）"); return true; }
    if (!has && Array.isArray(t.strengths)) {
      const ok = v96pBareIngr(t.strengths);
      if (ok) { const items = t.strengths.filter((s, i) => ok[i]).map((s) => v96pItemOf(String(Array.isArray(s) ? s[0] : s))).filter(Boolean); t.strengths = t.strengths.filter((s, i) => !ok[i]); if (items.length >= 2) { v96pSetComp(t, items, why + "（強みの欄の成分名）"); return true; } }
    }
    return moved.length > 0;
  } catch (e) { v96pErr("ingrapply", e); return false; }
}
function v96pGridLines(grids) { const out = []; (grids || []).forEach((g) => (g || []).forEach((r) => { const c = (r || []).map((x) => String(x == null ? "" : x).trim()).filter(Boolean); if (c.length) out.push(c.join("：")); else out.push(""); })); return out.join("\n"); }
if (typeof tenantFromTextGrids === "function") {
  const __tg96 = tenantFromTextGrids;
  tenantFromTextGrids = function (text, grids) {
    const t = __tg96.apply(this, arguments);
    try { if (t && typeof t === "object" && typeof t.then !== "function") v96pIngrApply(t, String(text || "") + "\n\n" + v96pGridLines(grids), "資料の「全成分」の見出し"); } catch (e) { v96pErr("tg", e); }
    return t;
  };
}
if (typeof buildTenant === "function") {
  const __bt96 = buildTenant;
  buildTenant = async function (file) {
    const t = await __bt96.apply(this, arguments);
    try {
      if (t && file && !(Array.isArray(t.compRows) && t.compRows.length) && v96pCatOk(t)) {
        const nm = String(file.name || "");
        let txt = "";
        if (/\.txt$/i.test(nm)) txt = typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text();
        else if (/\.csv$/i.test(nm) && typeof parseCSV === "function") { const sh = parseCSV(typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text()); txt = v96pGridLines((sh || []).map((s) => s.grid)); }
        else if (/\.(xlsx|xlsm)$/i.test(nm) && typeof readWorkbook === "function") { const sh = await readWorkbook(file); txt = v96pGridLines((sh || []).map((s) => s.grid)); }
        v96pIngrApply(t, txt, "資料の「全成分」の見出し");
      } else if (t) v96pIngrApply(t, "", "資料");
    } catch (e) { v96pErr("bt", e); }
    return t;
  };
}
// AI の読み取りの結果などを商品へ入れる前：強みに入った成分の並びを成分表へ
if (typeof mergeTen === "function") {
  const __mt96 = mergeTen;
  mergeTen = function (t, x) {
    try {
      if (t && x && typeof x === "object" && Array.isArray(x.strengths) && x.strengths.length && v96pCatOk(t, x)) {
        const tmp = { strengths: x.strengths.slice(), cat: x.cat || t.cat, catKey: t.catKey, compRows: (Array.isArray(x.compRows) && x.compRows.length) ? x.compRows : (t.compRows || []), compTitle: x.compTitle || t.compTitle };
        const before = tmp.strengths.length;
        const ch = v96pIngrApply(tmp, "", "AIの読み取り");
        if (ch || tmp.strengths.length !== before) {
          x.strengths = tmp.strengths;
          if (tmp.v96ingr && !(Array.isArray(x.compRows) && x.compRows.length) && !(Array.isArray(t.compRows) && t.compRows.length)) { x.compCols = tmp.compCols; x.compRows = tmp.compRows; if (!x.compTitle) x.compTitle = tmp.compTitle; }
          V96P.n.xclean++;
        }
      }
    } catch (e) { v96pErr("merge", e); }
    return __mt96.apply(this, arguments);
  };
}

/* ══════════ No.516 対応していない形式（Zip などのアーカイブ・実行形式）を受け付けない ══════════ */
const V96P_PROD_EXT = ["xlsx", "xlsm", "csv", "txt", "docx", "pptx", "pdf", "png", "jpg", "jpeg"];
const V96P_DOCS_EXT = ["pdf", "xlsx", "xlsm", "xls", "csv", "tsv", "docx", "doc", "pptx", "ppt", "txt", "md", "rtf", "odt", "ods", "odp", "png", "jpg", "jpeg", "gif", "webp", "heic", "heif", "bmp", "tif", "tiff", "eml", "msg"];
const V96P_OOXML = /^(xlsx|xlsm|docx|pptx|odt|ods|odp)$/;
const V96P_ARC_EXT = /^(zip|7z|rar|tar|gz|tgz|bz2|tbz2?|xz|txz|lzh|lha|cab|arj|z|zst|zipx|sit|sitx|iso|dmg|img|jar|war|apk|ipa|deb|rpm|pkg|xpi|crx)$/;
const V96P_EXE_EXT = /^(exe|msi|msp|bat|cmd|com|scr|pif|vbs|vbe|js|jse|wsf|wsh|ps1|psm1|sh|bash|zsh|csh|command|app|dll|sys|bin|run|elf|out|lnk|reg|hta|cpl|inf|jnlp|appimage)$/;
const V96P_ARC_MIME = /^(application\/(zip|x-zip|x-zip-compressed|x-7z-compressed|x-rar|x-rar-compressed|vnd\.rar|x-tar|gzip|x-gzip|x-gtar|x-bzip2?|x-xz|zstd|x-lzh-compressed|x-lzh|vnd\.ms-cab-compressed|x-iso9660-image|x-apple-diskimage|java-archive|x-java-archive|vnd\.android\.package-archive|x-compress|x-compressed)|multipart\/x-zip)$/i;
const V96P_EXE_MIME = /^application\/(x-msdownload|x-msdos-program|x-ms-installer|x-msi|x-ms-dos-executable|vnd\.microsoft\.portable-executable|x-executable|x-mach-binary|x-elf|x-sh|x-shellscript|x-bat|x-csh|hta|x-ms-shortcut)$/i;
function v96pExt(n) { const m = String(n || "").toLowerCase().match(/\.([a-z0-9]{1,10})$/); return m ? m[1] : ""; }
/* 判定：{ ok, ext, kind（"arc"＝圧縮ファイル・"exe"＝実行形式・"old"＝古い Office 形式・"other"）} */
function v96pFileOk(f, scope) {
  const name = String((f && f.name) || ""), ext = v96pExt(name), mime = String((f && f.type) || "").toLowerCase();
  const allow = scope === "docs" ? V96P_DOCS_EXT : V96P_PROD_EXT;
  if (V96P_ARC_EXT.test(ext)) return { ok: false, ext, kind: "arc" };
  if (V96P_EXE_EXT.test(ext)) return { ok: false, ext, kind: "exe" };
  if (ext && allow.indexOf(ext) >= 0) {
    if (!V96P_OOXML.test(ext) && (V96P_ARC_MIME.test(mime) || V96P_EXE_MIME.test(mime))) return { ok: false, ext, kind: V96P_EXE_MIME.test(mime) ? "exe" : "arc" };
    return { ok: true, ext };
  }
  if (!ext) {
    if (V96P_ARC_MIME.test(mime)) return { ok: false, ext, kind: "arc" };
    if (V96P_EXE_MIME.test(mime)) return { ok: false, ext, kind: "exe" };
    const mx = { "image/png": "png", "image/jpeg": "jpg", "application/pdf": "pdf", "text/plain": "txt", "text/csv": "csv" }[mime];
    if (mx && allow.indexOf(mx) >= 0) return { ok: true, ext: mx };
  }
  if (/^(xls|doc|ppt)$/.test(ext)) return { ok: false, ext, kind: "old" };
  return { ok: false, ext, kind: "other" };
}
function v96pFmtList(scope) {
  return scope === "docs"
    ? v96pM("PDF・Excel（.xlsx・.xlsm・.xls・.csv）・Word（.docx・.doc）・PowerPoint（.pptx・.ppt）・テキスト（.txt・.md）・画像（.png・.jpg・.gif・.webp・.heic など）・メール（.eml・.msg）", "PDF, Excel (.xlsx, .xlsm, .xls, .csv), Word (.docx, .doc), PowerPoint (.pptx, .ppt), text (.txt, .md), images (.png, .jpg, .gif, .webp, .heic, etc.), email (.eml, .msg)", "PDF・Excel（.xlsx・.xlsm・.xls・.csv）・Word（.docx・.doc）・PowerPoint（.pptx・.ppt）・文本（.txt・.md）・图片（.png・.jpg・.gif・.webp・.heic 等）・邮件（.eml・.msg）", "PDF, Excel (.xlsx, .xlsm, .xls, .csv), Word (.docx, .doc), PowerPoint (.pptx, .ppt), texto (.txt, .md), imágenes (.png, .jpg, .gif, .webp, .heic, etc.), correo (.eml, .msg)")
    : v96pM("Excel（.xlsx・.xlsm）・CSV（.csv）・テキスト（.txt）・Word（.docx）・PowerPoint（.pptx）・PDF（.pdf）・画像（.png・.jpg）", "Excel (.xlsx, .xlsm), CSV (.csv), text (.txt), Word (.docx), PowerPoint (.pptx), PDF (.pdf), images (.png, .jpg)", "Excel（.xlsx・.xlsm）・CSV（.csv）・文本（.txt）・Word（.docx）・PowerPoint（.pptx）・PDF（.pdf）・图片（.png・.jpg）", "Excel (.xlsx, .xlsm), CSV (.csv), texto (.txt), Word (.docx), PowerPoint (.pptx), PDF (.pdf), imágenes (.png, .jpg)");
}
function v96pNgWhy(r) {
  if (r.kind === "arc") return v96pM("圧縮ファイル（Zip・7z・rar・tar・gz など）は受け付けません。Zip を開いて（展開して）、中のファイルをそのまま選んでください（複数をまとめて選べます）", "Compressed files (Zip, 7z, rar, tar, gz, etc.) are not accepted. Unzip it and choose the files inside (you can choose several at once)", "不接受压缩文件（Zip・7z・rar・tar・gz 等）。请解压后直接选择其中的文件（可一次选择多个）", "No se aceptan archivos comprimidos (Zip, 7z, rar, tar, gz, etc.). Descomprímalo y elija los archivos (puede elegir varios)");
  if (r.kind === "exe") return v96pM("プログラム（実行ファイル）は受け付けません", "Programs (executable files) are not accepted", "不接受程序（可执行文件）", "No se aceptan programas (ejecutables)");
  if (r.kind === "old") { const nm = r.ext === "xls" ? "Excel ブック（.xlsx）" : r.ext === "doc" ? "Word 文書（.docx）" : "PowerPoint プレゼンテーション（.pptx）"; return v96pM(`古い形式（.${r.ext}）は読み取れません。元のアプリで「名前を付けて保存」→「${nm}」で保存し直してから選んでください`, `The old format (.${r.ext}) cannot be read. Save it again as .${r.ext}x and choose it`, `无法读取旧格式（.${r.ext}）。请另存为 .${r.ext}x 后再选择`, `El formato antiguo (.${r.ext}) no se puede leer. Guárdelo como .${r.ext}x`); }
  return v96pM("この形式は読み取れません", "This format cannot be read", "无法读取此格式", "Este formato no se puede leer");
}
function v96pNgText(ng, scope) {
  const names = ng.map((f) => String(f.name || "")).slice(0, 3).join(v96pLang() === "ja" ? "・" : ", ") + (ng.length > 3 ? v96pM(` ほか${ng.length - 3}件`, ` and ${ng.length - 3} more`, ` 等`, ` y ${ng.length - 3} más`) : "");
  return { names, head: v96pM(`対応していない形式です：${names}`, `Unsupported format: ${names}`, `不支持的格式：${names}`, `Formato no admitido: ${names}`), why: v96pNgWhy(v96pFileOk(ng[0], scope)), list: v96pM("対応している形式：", "Supported formats: ", "支持的格式：", "Formatos admitidos: ") + v96pFmtList(scope) };
}
// 商品登録の取り込み：画面（#prg）に理由を出す
function v96pNgProd(ng, okN) {
  const el = document.getElementById("prg");
  const T = v96pNgText(ng, "prod");
  if (!el || okN) return false;
  const E = v96pE, M = v96pM;
  el.hidden = false;
  el.innerHTML = `<div class="c v96p-ng" role="alert" data-noi18n="1">
    <b class="v96p-ngh">${E(T.head)}</b>
    <p class="v96p-ngp">${E(M("このファイルは受け付けていません（中身の読み取りも、商品の登録もしていません）。", "This file was not accepted (nothing was read and no product was created). ", "未接收此文件（未读取内容，也未登记商品）。", "Este archivo no se aceptó (no se leyó nada ni se creó un producto). "))}${E(T.why)}${E(M("。", ".", "。", "."))}</p>
    <p class="v96p-ngp">${E(T.list)}</p>
    <div class="v96p-ngb"><button type="button" class="btn" data-v96pick="1">${E(M("別の資料を選ぶ", "Choose other files", "选择其他资料", "Elegir otros archivos"))}</button></div>
  </div>`;
  const pk = document.getElementById("pick"); if (pk) pk.hidden = false;
  const b = el.querySelector("[data-v96pick]");
  if (b) b.addEventListener("click", () => { el.hidden = true; el.innerHTML = ""; const f = document.getElementById("fin"); if (f) f.click(); });
  try { setTimeout(() => { try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) { } }, 60); } catch (e) { }
  return true;
}
// ドキュメント：ドロップ枠の下に理由を出す
function v96pNgDocs(ng) {
  try {
    const dz = document.getElementById("d30drop"); if (!dz) return;
    const T = v96pNgText(ng, "docs");
    let p = document.getElementById("v96pDocsNg");
    if (!p) { p = document.createElement("div"); p.id = "v96pDocsNg"; p.className = "v96p-ng v96p-ngd"; p.setAttribute("role", "alert"); p.setAttribute("data-noi18n", "1"); dz.insertAdjacentElement("afterend", p); }
    p.innerHTML = `<b class="v96p-ngh">${v96pE(T.head)}</b><p class="v96p-ngp">${v96pE(v96pM("アップロードしていません。", "Not uploaded. ", "未上传。", "No se subió. "))}${v96pE(T.why)}${v96pE(v96pM("。", ".", "。", "."))}</p><p class="v96p-ngp">${v96pE(T.list)}</p>`;
  } catch (e) { v96pErr("ngdocs", e); }
}
function v96pNgShow(ng, scope, el, okN) {
  if (!ng || !ng.length) return;
  V96P.n.ng++;
  V96P.lastNg = { at: Date.now(), names: ng.map((f) => f.name), scope };
  const T = v96pNgText(ng, scope);
  try { if (typeof logU === "function") logU("upload", "対応していない形式のため受け付けなかった:" + T.names); } catch (e) { }
  const id = el && el.id;
  let onScr = false;
  const sayFill = () => { try { if (typeof FILL !== "undefined" && FILL && FILL.on && typeof fillSay === "function") { fillSay("ai", "<b>" + v96pE(T.head) + "</b><br>" + v96pE(T.why) + v96pE(v96pM("。", ".", "。", ".")) + "<br>" + v96pE(T.list)); if (typeof render === "function") render(); return true; } } catch (e) { } return false; };
  if (scope === "docs") { v96pNgDocs(ng); onScr = !!document.getElementById("v96pDocsNg"); }
  else if (id === "fatt2" || (el && el.closest && el.closest("#fanswrap")) || V96P._fill) onScr = sayFill();
  else if (id === "srcf" || (el && el.closest && el.closest("#srcdz"))) {
    const st = document.getElementById("srcst");
    if (st) { st.innerHTML = `<div class="v96p-ng" role="alert" data-noi18n="1"><b class="v96p-ngh">${v96pE(T.head)}</b><p class="v96p-ngp">${v96pE(T.why)}</p><p class="v96p-ngp">${v96pE(T.list)}</p></div>`; onScr = true; }
  } else if (v96pNgProd(ng, okN)) onScr = true;
  else if (!okN) onScr = sayFill(); // 取り込みの枠が出ていない（ヒアリング中など）：ヒアリングの欄に出す
  if (onScr && !okN) { v96pToast(T.head + v96pM("（受け付けていません）", " (not accepted)", "（未接收）", " (no aceptado)")); return; }
  v96pToast(okN ? v96pM(`対応していない形式のため外しました：${T.names}（ほかの ${okN}件は読み取ります）`, `Skipped unsupported file(s): ${T.names} (reading the other ${okN})`, `已排除不支持的格式：${T.names}（其余 ${okN} 个照常读取）`, `Se omitieron archivos no admitidos: ${T.names} (se leen los otros ${okN})`) : T.head + v96pM("。", ". ", "。", ". ") + T.list);
}
const V96P_GATE_IN = { fin: "prod", fatt2: "prod", srcf: "prod", d30up: "docs" };
function v96pInScope(el) { if (!el || el.tagName !== "INPUT" || String(el.type).toLowerCase() !== "file") return ""; return V96P_GATE_IN[el.id] || (el.hasAttribute && el.hasAttribute("data-d30req") ? "docs" : ""); }
const V96P_ACC = { prod: "." + V96P_PROD_EXT.join(",."), docs: "." + V96P_DOCS_EXT.join(",.") };
function v96pAccept(el) {
  try {
    const L = el ? [el] : Object.keys(V96P_GATE_IN).map((id) => document.getElementById(id)).filter(Boolean);
    L.forEach((i) => { const sc = v96pInScope(i); if (sc && i.getAttribute("accept") !== V96P_ACC[sc]) i.setAttribute("accept", V96P_ACC[sc]); });
  } catch (e) { v96pErr("accept", e); }
}
// ファイル選択（いちばん先＝window の capture で受け取り、対応していないものを外す）
window.addEventListener("change", (e) => {
  try {
    const el = e.target, sc = v96pInScope(el);
    if (!sc || !el.files || !el.files.length) return;
    const fs = Array.from(el.files);
    const ng = fs.filter((f) => !v96pFileOk(f, sc).ok);
    if (!ng.length) return;
    const ok = fs.filter((f) => v96pFileOk(f, sc).ok);
    v96pNgShow(ng, sc, el, ok.length);
    if (!ok.length) { e.stopImmediatePropagation(); try { el.value = ""; } catch (x) { } return; }
    try { const dt = new DataTransfer(); ok.forEach((f) => dt.items.add(f)); el.files = dt.files; } catch (x) { e.stopImmediatePropagation(); try { el.value = ""; } catch (y) { } }
  } catch (x) { v96pErr("change", x); }
}, true);
// 選ぶ窓を開く前に accept を対応形式にする
window.addEventListener("click", (e) => { try { const el = e.target; if (v96pInScope(el)) v96pAccept(el); } catch (x) { } }, true);
// ドラッグ＆ドロップ
function v96pDropScope(tg) {
  if (!tg || !tg.closest) return null;
  let d = tg.closest("#d30drop"); if (d) return { k: "docs", el: d, how: "docs" };
  d = tg.closest("#drop, #rddrop"); if (d) return { k: "prod", el: d, how: "fin" };
  d = tg.closest("#srcdz"); if (d) return { k: "prod", el: d, how: "srcf" };
  d = tg.closest("#fanswrap"); if (d) return { k: "prod", el: d, how: "fill" };
  try {
    if (typeof FILL !== "undefined" && FILL && FILL.on && typeof cur !== "undefined" && cur === "up") {
      const c = tg.closest(".c"); if (c && c.querySelector("#fanswrap")) return { k: "prod", el: c, how: "fill" };
    }
  } catch (e) { }
  return null;
}
function v96pSetFiles(inp, files) { const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); inp.files = dt.files; inp.dispatchEvent(new Event("change", { bubbles: true })); }
window.addEventListener("drop", (e) => {
  try {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const sc = v96pDropScope(e.target);
    if (!sc) return;
    const fs = Array.from(dt.files);
    const ng = fs.filter((f) => !v96pFileOk(f, sc.k).ok);
    if (!ng.length) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const ok = fs.filter((f) => v96pFileOk(f, sc.k).ok);
    try { sc.el.classList.remove("over", "v95p-over"); sc.el.style.removeProperty("outline"); sc.el.style.removeProperty("border-color"); sc.el.style.removeProperty("background"); } catch (x) { }
    V96P._fill = sc.how === "fill";
    try { v96pNgShow(ng, sc.k, sc.el, ok.length); } finally { V96P._fill = false; }
    if (!ok.length) return;
    if (sc.how === "docs") { const R = window.RDX; if (R && typeof R.v95pUpload === "function") R.v95pUpload(ok); else if (window.V95P && typeof window.V95P.docsUpload === "function") window.V95P.docsUpload(ok); return; }
    if (sc.how === "fin") { const f = document.getElementById("fin"); if (f) v96pSetFiles(f, ok); return; }
    if (sc.how === "srcf") { const f = document.getElementById("srcf"); if (f) v96pSetFiles(f, ok); return; }
    if (sc.how === "fill" && typeof fillAttach === "function") fillAttach(ok[0]);
  } catch (x) { v96pErr("drop", x); }
}, true);
// 貼り付け（attSend：欄の accept で外す前に、同じ言い方で知らせる）
if (typeof attSend === "function") {
  const __at96 = attSend;
  attSend = function (inp, files) {
    try {
      const sc = v96pInScope(inp);
      if (sc && Array.isArray(files) && files.length) {
        const ng = files.filter((f) => !v96pFileOk(f, sc).ok);
        if (ng.length) {
          const ok = files.filter((f) => v96pFileOk(f, sc).ok);
          v96pNgShow(ng, sc, inp, ok.length);
          if (!ok.length) return undefined;
          return __at96.call(this, inp, ok);
        }
      }
    } catch (e) { v96pErr("attsend", e); }
    return __at96.apply(this, arguments);
  };
}
// URL から取り込んだファイル（Zip など）・ほかの入口から来たファイル：読み取りの前で止める
if (typeof fileToTenant === "function") {
  const __ft96 = fileToTenant;
  fileToTenant = async function (file) {
    try {
      const r = v96pFileOk(file, "prod");
      if (file && file.name && !r.ok && (r.kind === "arc" || r.kind === "exe")) { V96P.block = { name: String(file.name), at: Date.now() }; const er = new Error(v96pM("対応していない形式です", "Unsupported format")); er.needai = 0; er.v96ng = 1; throw er; }
    } catch (e) { if (e && e.v96ng) throw e; v96pErr("ft", e); }
    return __ft96.apply(this, arguments);
  };
}
if (typeof runParseReal === "function") {
  const __rp96 = runParseReal;
  runParseReal = function (t, info, file) {
    try {
      const B = V96P.block;
      const nm = String((file && file.name) || (t && t.file) || "");
      const r = file && file.name ? v96pFileOk(file, "prod") : null;
      if (t && t.src === "upload" && ((B && Date.now() - B.at < 120000 && B.name === nm) || (r && !r.ok && (r.kind === "arc" || r.kind === "exe")))) {
        V96P.block = null;
        v96pNgShow([file || { name: nm, type: "" }], "prod", null, 0);
        return undefined;
      }
      // No.514 取り込みの最後：読み取った文（取り込んだ情報）から成分表
      if (t && typeof t === "object" && t.src === "upload") {
        const txt = [String(t.srcCorpus || "")].concat((t.sources || []).map((s) => String((s && s.txt) || ""))).join("\n\n");
        v96pIngrApply(t, txt, "資料の「全成分」の見出し");
      }
    } catch (e) { v96pErr("rp", e); }
    return __rp96.apply(this, arguments);
  };
}
if (typeof fillAttach === "function") {
  const __fa96 = fillAttach;
  fillAttach = function (f) {
    try {
      const r = v96pFileOk(f, "prod");
      if (f && f.name && !r.ok) {
        V96P._fill = true;
        try { if (typeof fillSay === "function") fillSay("u", "📎 " + v96pE(f.name)); v96pNgShow([f], "prod", null, 0); } finally { V96P._fill = false; }
        return undefined;
      }
    } catch (e) { v96pErr("fillatt", e); }
    return __fa96.apply(this, arguments);
  };
}
// 何件かまとめて選んだとき（v54upldTakeMany）・フォルダの中（entriesCorpus）：アーカイブは読まずに「対象外」へ
if (typeof v54upldTakeMany === "function") {
  const __tm96 = v54upldTakeMany;
  v54upldTakeMany = function (files) {
    try {
      const fs = Array.from(files || []).filter((f) => f && f.name);
      const ng = fs.filter((f) => !v96pFileOk(f, "prod").ok);
      if (ng.length) { const ok = fs.filter((f) => v96pFileOk(f, "prod").ok); if (!(V96P.lastNg && Date.now() - V96P.lastNg.at < 1500)) v96pNgShow(ng, "prod", null, ok.length); if (!ok.length) return Promise.resolve(); return __tm96.call(this, ok); }
    } catch (e) { v96pErr("many", e); }
    return __tm96.apply(this, arguments);
  };
}
if (typeof entriesCorpus === "function") {
  const __ec96 = entriesCorpus;
  entriesCorpus = function (entries) {
    const a = [].slice.call(arguments);
    try {
      if (Array.isArray(entries)) a[0] = entries.map((en) => { try { if (en && !en.skip) { const base = String(en.name || "").split("/").pop(); const r = v96pFileOk({ name: base, type: "" }, "prod"); if (!r.ok && (r.kind === "arc" || r.kind === "exe")) return { name: en.name, skip: v96pM("対応していない形式です（Zip などの圧縮ファイル・実行ファイルは受け付けません）", "unsupported format (compressed or executable files are not accepted)") }; } } catch (x) { } return en; });
    } catch (e) { v96pErr("ec", e); }
    return __ec96.apply(this, a);
  };
}
// ドキュメント（どの入口から来ても）
if (typeof d30AddFile === "function") {
  const __af96 = d30AddFile;
  d30AddFile = async function (f, opt) {
    try {
      const r = v96pFileOk(f, "docs");
      if (f && f.name && !r.ok) { v96pNgShow([f], "docs", null, 0); const er = new Error(v96pM("対応していない形式です", "Unsupported format")); er.v96ng = 1; throw er; }
    } catch (e) { if (e && e.v96ng) throw e; v96pErr("d30", e); }
    return __af96.apply(this, arguments);
  };
}
if (typeof v95pDocsUpload === "function") {
  const __du96 = v95pDocsUpload;
  v95pDocsUpload = function (files, scope) {
    try { const fs = Array.from(files || []).filter((f) => f && f.name); const ng = fs.filter((f) => !v96pFileOk(f, "docs").ok); if (ng.length) { const ok = fs.filter((f) => v96pFileOk(f, "docs").ok); v96pNgShow(ng, "docs", null, ok.length); if (!ok.length) return Promise.resolve(0); return __du96.call(this, ok, scope); } } catch (e) { v96pErr("du", e); }
    return __du96.apply(this, arguments);
  };
  try { if (window.V95P) window.V95P.docsUpload = v95pDocsUpload; } catch (e) { }
}
// URL からの取り込みの案内（21.48）：「Zip にまとめて」「その Zip をアップロード」を、受け付ける形に言い直す
if (typeof cloudFetch === "function") {
  const __cl96 = cloudFetch;
  cloudFetch = async function () {
    try { return await __cl96.apply(this, arguments); } catch (e) {
      try {
        const m = String((e && e.message) || "");
        const V = (typeof V48_MSG !== "undefined" && V48_MSG) ? V48_MSG : {};
        let m2 = "";
        if (V.file && m === V.file) m2 = v96pM("このGoogleドライブのファイルは、URLからは読み取れませんでした（共有リンクは外部の読み取りサービスに渡さない設定です）。確実な方法：ファイルをダウンロードしてアップロードしてください（複数あるなら、まとめて選べます）。Googleドキュメント／スプレッドシート／スライドのURLは、そのまま読めます", "This Google Drive file could not be read from its URL (shared links are never passed to outside reading services). The reliable way: download the file and upload it here (you can choose several files at once). Google Docs / Sheets / Slides URLs can be read as they are.");
        else if (V.folder && m === V.folder) m2 = v96pM("Googleドライブのフォルダは、URLからは中身を一覧できませんでした（共有リンクは外部の読み取りサービスに渡さない設定です）。フォルダを右クリック→「ダウンロード」→ ダウンロードされた Zip を開いて（展開して）、中のファイルをまとめて選んでアップロードしてください（Zip のままは受け付けません）", "The contents of a Google Drive folder cannot be listed from its URL (shared links are never passed to outside reading services). Right-click the folder → “Download” → unzip the downloaded file and upload the files inside (a Zip itself is not accepted).");
        else if (/Zipにまとめて/.test(m)) m2 = m.replace("②複数あるならZipにまとめて", "②複数あるなら、まとめて選んでアップロード").replace(/（複数あるならZipにまとめて）/, "（複数あるなら、まとめて選べます）");
        if (m2) { const e2 = new Error(m2); e2.v48 = e && e.v48; throw e2; }
      } catch (x) { if (x && x !== e && x.message) throw x; }
      throw e;
    }
  };
}
// 21.95 の「読み取れなかった（0項目）」の案内：「Zip の中にあれば読みます」を外す
if (typeof v95pEmptyHtml === "function") {
  const __eh96 = v95pEmptyHtml;
  v95pEmptyHtml = function () {
    let h = __eh96.apply(this, arguments);
    try { h = String(h).replace("（Zip の中にあれば読みます）", "").replace(" (also inside a Zip)", "").replace("（Zip 内也可）", "").replace(" (también dentro de un Zip)", ""); } catch (e) { }
    return h;
  };
}
if (typeof render === "function") {
  const __rn96 = render;
  render = function () { const r = __rn96.apply(this, arguments); try { v96pAccept(); } catch (e) { } return r; };
}
try { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => v96pAccept()); else v96pAccept(); } catch (e) { }

/* ══════════ R-1（No.453）価格表の編集の窓：有効期限の日付を打てる欄に ══════════ */
function v96pYmd(s) {
  const x = v96pNF(s).trim().replace(/\s+/g, "");
  if (!x) return "";
  let m = /^(\d{4})[-\/.年](\d{1,2})[-\/.月](\d{1,2})日?$/.exec(x) || /^(\d{4})(\d{2})(\d{2})$/.exec(x);
  if (!m) return "";
  const y = +m[1], mo = +m[2], d = +m[3];
  if (y < 1900 || y > 2099 || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCMonth() !== mo - 1) return "";
  return y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}
function v96pShowYmd(ymd) { return v96pLang() === "ja" ? ymd.replace(/-/g, "/") : ymd; }
function v96pToday() { try { if (typeof v83pxToday === "function") return v83pxToday(); } catch (e) { } return new Date().toISOString().slice(0, 10); }
function v96pDateFix() {
  try {
    const el = document.querySelector("#pn #v83pxTeD, #v83pxTeD");
    if (!el || el.getAttribute("data-v96d") || String(el.type).toLowerCase() !== "date") return false;
    const E = v96pE, M = v96pM;
    const v0 = String(el.value || "");
    el.setAttribute("data-v96d", "1");
    try { el.type = "text"; } catch (e) { return false; }
    el.value = v0 ? v96pShowYmd(v0) : "";
    el.removeAttribute("max"); el.removeAttribute("min");
    el.setAttribute("inputmode", "numeric"); el.setAttribute("autocomplete", "off"); el.setAttribute("maxlength", "12"); el.setAttribute("spellcheck", "false");
    el.setAttribute("placeholder", M("例：2027/03/31", "e.g. 2027-03-31", "例：2027/03/31", "p. ej. 2027-03-31"));
    el.setAttribute("aria-describedby", "v96pTeDh v96pTeDs");
    el.classList.add("v96p-date");
    const wrap = document.createElement("span"); wrap.className = "v96p-dw";
    el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
    const cal = document.createElement("input"); cal.type = "date"; cal.className = "v96p-calin"; cal.tabIndex = -1; cal.setAttribute("aria-hidden", "true"); cal.setAttribute("max", "2099-12-31");
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "btn g v96p-calb"; btn.textContent = "📅"; btn.title = M("カレンダーから選ぶ", "Pick from a calendar", "从日历中选择", "Elegir en el calendario"); btn.setAttribute("aria-label", btn.title);
    wrap.appendChild(btn); wrap.appendChild(cal);
    const st = document.createElement("span"); st.id = "v96pTeDs"; st.className = "v96p-dst"; st.setAttribute("role", "status"); st.setAttribute("data-noi18n", "1");
    const hint = document.createElement("span"); hint.id = "v96pTeDh"; hint.className = "v96p-dh"; hint.setAttribute("data-noi18n", "1");
    hint.textContent = M("キーボードで「2027/03/31」「2027-03-31」「20270331」のように、年（4桁）・月・日の順に打てます。", "Type the date as 2027-03-31, 2027/03/31 or 20270331 (year, month, day).", "可用键盘按年（4位）・月・日的顺序输入，如“2027/03/31”“2027-03-31”“20270331”。", "Escriba la fecha como 2027-03-31, 2027/03/31 o 20270331 (año, mes, día).");
    wrap.insertAdjacentElement("afterend", st);
    st.insertAdjacentElement("afterend", hint);
    let qd = [];
    try { if (typeof v92prodQuick === "function") qd = v92prodQuick() || []; } catch (e) { qd = []; }
    if (qd.length) {
      const q = document.createElement("span"); q.className = "v96p-qd"; q.setAttribute("data-noi18n", "1");
      const QL = { "1か月後": "In 1 month", "3か月後": "In 3 months", "6か月後": "In 6 months", "1年後": "In 1 year", "年度末": "End of fiscal year" };
      q.innerHTML = `<span class="v96p-qdl">${E(M("すぐ決める：", "Quick: ", "快速设定：", "Rápido: "))}</span>` + qd.map((x) => `<button type="button" class="btn g v96p-qdb" data-v96pqd="${E(x.d)}">${E(v96pLang() === "ja" ? x.l : (QL[x.l] || x.l))}（${E(v96pShowYmd(x.d))}）</button>`).join("");
      hint.insertAdjacentElement("afterend", q);
      q.addEventListener("click", (e) => { const b = e.target && e.target.closest ? e.target.closest("[data-v96pqd]") : null; if (!b) return; el.value = v96pShowYmd(b.getAttribute("data-v96pqd")); upd(true); });
    }
    const today = v96pToday();
    const upd = (norm) => {
      const raw = String(el.value || "").trim();
      el.classList.remove("v96p-bad");
      if (!raw) { st.textContent = ""; return; }
      const d = v96pYmd(raw);
      if (!d) { if (norm) { el.classList.add("v96p-bad"); st.textContent = M("日付の形が正しくありません。年（4桁）・月・日の順に「2027/03/31」のように打ってください", "The date is not valid. Type year (4 digits), month and day, e.g. 2027-03-31", "日期格式不正确。请按年（4位）・月・日输入，如“2027/03/31”", "La fecha no es válida. Escriba año (4 cifras), mes y día, p. ej. 2027-03-31"); } else st.textContent = ""; return; }
      if (norm) el.value = v96pShowYmd(d);
      const days = Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 864e5);
      const ymdJ = d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (m0, y, mo, dd) => `${y}年${+mo}月${+dd}日`);
      if (days < 0) { el.classList.add("v96p-bad"); st.textContent = M(`${ymdJ}は今日より前です（保存できません）`, `${d} is before today (cannot be saved)`, `${d} 早于今天（无法保存）`, `${d} es anterior a hoy (no se puede guardar)`); }
      else st.textContent = M(`→ ${ymdJ}までの価格（あと${days}日）`, `→ Price valid until ${d} (${days} days left)`, `→ ${d} 之前的价格（还有${days}天）`, `→ Precio válido hasta ${d} (quedan ${days} días)`);
    };
    el.addEventListener("input", () => upd(false));
    el.addEventListener("blur", () => upd(true));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); upd(true); } });
    btn.addEventListener("click", () => {
      try { const d = v96pYmd(el.value); cal.value = d || ""; cal.min = today; if (typeof cal.showPicker === "function") { cal.showPicker(); return; } } catch (e) { }
      try { el.focus(); } catch (e) { }
    });
    cal.addEventListener("change", () => { if (cal.value) { el.value = v96pShowYmd(cal.value); upd(true); try { el.focus(); } catch (e) { } } });
    upd(false);
    V96P.n.date++;
    return true;
  } catch (e) { v96pErr("date", e); return false; }
}
if (typeof openDW === "function") {
  const __od96 = openDW;
  openDW = function () { const r = __od96.apply(this, arguments); try { setTimeout(v96pDateFix, 0); } catch (e) { } return r; };
}
if (typeof openTableEdit === "function") {
  const __ot96 = openTableEdit;
  openTableEdit = function (kind) { const r = __ot96.apply(this, arguments); try { if (kind === "price") v96pDateFix(); } catch (e) { } return r; };
}
// 保存の前：打った形（20270331・全角など）を、21.83 の確かめ（v83pxYmd）が読める形に直す
if (typeof tblSave === "function") {
  const __ts96 = tblSave;
  tblSave = function () {
    try { const el = document.getElementById("v83pxTeD"); if (el && el.getAttribute("data-v96d")) { const d = v96pYmd(el.value); if (d) el.value = d; } } catch (e) { v96pErr("tsave", e); }
    return __ts96.apply(this, arguments);
  };
}

window.V96P = V96P;
Object.assign(V96P, { K: v96pK, stat: v96pStat, notFull: v96pNotFull, strMsg: v96pStrMsg, coEnDraftOf: v96pCoEnDraftOf, coEnNone: v96pCoEnNone, segKana: v96pSegKana, ingrList: v96pIngrList, ingrApply: v96pIngrApply, inciLike: v96pInciLike, fileOk: v96pFileOk, fmtList: v96pFmtList, accept: v96pAccept, ymd: v96pYmd, dateFix: v96pDateFix, M: v96pM, E: v96pE });
