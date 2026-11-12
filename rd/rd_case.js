/* 貿易クラウドAI商社マン デザイン刷新：社内の意見（2026-11-12 三井さん）への改良
   SaaS としてお客様が毎日自分で開いて使う形に。
   ① 文字を減らす：画面は「見出し・数字・ボタン」。説明は見出しの「？」（押す・乗せると出る）へ。長いボタンの文言は短く（全文は乗せると出る）
   ② 流れ：ログイン後の最初の画面＝案件一覧。左のメニューは 案件／商品／タスク／やりとり／AI商社マン の5つ（＋困ったとき・すべての機能）。
      どの画面も見出しの上に「いまどこ」（押せるパンくず）、見出しの右に「次は」
   ③ 貿易クラウド1.0 の案件一覧の使いやすさ：1行＝1案件（相手・国・ステータス・次の行動・最終やりとり）、
      相手の最新メッセージ順・お気に入り・絞り込み。行を押すと案件の詳細（次の行動・やりとり・タスク・書類・商談の記録・相手の情報）を1画面で。
      AI の機能（返信の文案・見積・規制・次の一手）は案件の中から呼ぶ
   導線は2つ（三井さんの返信）：案件管理（案件一覧）と商品管理（商品一覧）
   今のアプリの関数は呼ぶだけ（差し替えない）。数字・状況・次の行動は、アプリが持っているデータから出す（架空の数字は出さない）。
   今の版の機能は1つも消さない：これまでのホーム（ダッシュボード）は案件一覧のいちばん下にたたんで残し、「すべての機能」の「分析・レポート」でも全部見える */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._case) return;
  RD._case = 1;
  const { I, esc, $, $$, G, flag } = RD;
  const act = (fn) => RD.act(fn);
  const goKey = (k) => RD.goKey(k);
  const isAdmin = () => { const S = G("SES"); return !!(S && S.t === "admin"); };
  const isJa = () => { const s = document.getElementById("lang"); return !s || !s.value || /^ja/.test(s.value); };
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無視 */ } } };
  const DAY = 864e5;
  const days = (ms) => (ms ? Math.max(0, Math.floor((Date.now() - ms) / DAY)) : null);
  const md = (ms) => { if (!ms) return ""; const d = new Date(ms); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const when = (ms) => { const n = days(ms); return n == null ? "" : n === 0 ? "今日" : n === 1 ? "昨日" : n < 7 ? n + "日前" : md(ms); };
  const clip = (s, n) => { s = String(s || "").replace(/[*#>`_]/g, "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const tensAll = () => { try { return typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const curTen = () => G("TEN") || null;
  const curPi = () => tensAll().indexOf(curTen());

  /* ───────── 案件（＝相手ごとのやりとり。今のアプリの dmThreads） ───────── */
  const BM = ["コンタクト中（一方的なアプローチ）", "商談中", "サンプル出荷", "見積提示", "契約交渉", "取引中", "失注"];
  const STS = (s) => RD.stShort(s);
  const ST_ORDER = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5, 失注: -1 };
  const msgAt = (m) => +((m && m.at) || 0);
  function nextOf(c) {
    // 次の行動：AI の読み取り（返事ごとの「次にやること」）＞ やりとりの順番（どちらの番か）＞ 経過日数。どれもアプリのデータから
    if (c.ss === "失注") return { t: "失注（振り返りを残す）", kind: "lost", ic: "doc" };
    if (!c.msgs.length) return { t: "最初の連絡を送る", kind: "start", ic: "send" };
    if (c.lastW === "by" || c.unread > 0) {
      const v = c.th.v72;
      const ok = v && c.lastIn && String(v.sig || "").indexOf(String(msgAt(c.lastIn)) + "|") === 0 && Array.isArray(v.next) && v.next[0];
      if (ok) return { t: String(v.next[0]), more: v.next.slice(1).map(String), ai: 1, draft: !!v.draft, kind: "reply", ic: "spark", why: v.summary || "" };
      return { t: "返信する", kind: "reply", ic: "mail" };
    }
    const n = days(c.lastAt) || 0;
    if (n >= 7) return { t: `フォローの連絡（${n}日 返事なし）`, kind: "follow", ic: "clock" };
    return { t: "相手の返事を待つ", kind: "wait", ic: "clock", sub: `${when(c.lastAt)}に送信` };
  }
  function favKey(c) { const S = G("SES") || {}; return [S.code || S.who || "", c.prod || "", c.id].join("|"); }
  const favs = () => ls.get("rd_fav", {});
  const isFav = (c) => !!favs()[favKey(c)];
  function toggleFav(c) { const F = favs(), k = favKey(c); if (F[k]) delete F[k]; else F[k] = 1; ls.set("rd_fav", F); return !!F[k]; }
  function casesOf(t, pi) {
    if (!t) return [];
    const MB = Array.isArray(t.myBuyers) ? t.myBuyers : [];
    const prod = t.sku || t.item || "";
    return Object.values(t.dmThreads || {}).filter((th) => th && Array.isArray(th.msgs) && th.msgs.length).map((th) => {
      const b = MB.find((x) => x && x.id === th.id);
      const msgs = th.msgs.slice().sort((a, c) => msgAt(a) - msgAt(c));
      const last = msgs[msgs.length - 1] || null;
      const ins = msgs.filter((m) => m.w === "by"), mes = msgs.filter((m) => m.w === "me");
      const c = {
        key: pi + "|" + th.id, pi, th, t, id: th.id, b, prod, item: t.item || "",
        name: b && b.co ? b.co : `${th.cty || ""}の${th.biz || "バイヤー"}`, named: !!(b && b.co),
        cty: th.cty || (b && b.cty) || "", biz: (b && b.biz) || th.biz || "", lang: th.lang || "",
        st: th.status || BM[0], why: th.statusWhy || "", msgs, last, lastAt: msgAt(last) || +th.statusAt || 0,
        lastIn: ins[ins.length - 1] || null, lastMe: mes[mes.length - 1] || null, lastW: last ? last.w : "", unread: +th.unread || 0,
      };
      c.ss = STS(c.st);
      c.inAt = msgAt(c.lastIn);
      c.next = nextOf(c);
      c.todo = c.next.kind === "reply";
      return c;
    });
  }
  function allCases() {
    const T = tensAll(), t0 = curTen();
    let L = [];
    if (T.length && T.indexOf(t0) >= 0) T.forEach((t, i) => { L = L.concat(casesOf(t, i)); });
    else L = casesOf(t0, -1); // 見本の商品など、商品の一覧の外を表示しているとき
    return L;
  }
  RD.allCases = allCases;

  /* ───────── 商品の切り替え（今のアプリの「会社・商品の切り替え」#psw と同じ動き） ───────── */
  function switchProd(pi) {
    return new Promise((res) => {
      const T = tensAll();
      if (pi < 0 || T[pi] === curTen()) return res(true);
      const s = document.getElementById("psw");
      if (!s || !Array.from(s.options).some((o) => o.value === "t:" + pi)) return res(false);
      s.value = "t:" + pi;
      s.dispatchEvent(new Event("change"));
      let n = 0;
      const tm = setInterval(() => { n++; if (tensAll()[pi] === curTen() || n > 50) { clearInterval(tm); res(tensAll()[pi] === curTen()); } }, 100);
    });
  }

  /* ───────── ① 説明は「？」へ（押す・乗せると出る） ───────── */
  let tip = null, tipFor = null, tipPin = false;
  function tipClose() { if (tip) tip.remove(); tip = null; if (tipFor) { tipFor.setAttribute("aria-expanded", "false"); tipFor.removeAttribute("aria-describedby"); } tipFor = null; tipPin = false; }
  function tipOpen(b, pin) {
    if (tipFor === b) { if (pin) tipPin = !tipPin ? true : false; if (pin && !tipPin) { tipClose(); } return; }
    tipClose();
    const tx = String(b.dataset.kq || "").trim(); if (!tx) return;
    tip = document.createElement("div");
    tip.id = "k-qtip"; tip.className = "k-qtip"; tip.setAttribute("role", "tooltip");
    tip.innerHTML = tx.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("");
    document.body.appendChild(tip);
    const r = b.getBoundingClientRect(), tw = Math.min(360, window.innerWidth - 24);
    tip.style.maxWidth = tw + "px";
    const th = tip.offsetHeight, ww = tip.offsetWidth;
    let x = Math.min(Math.max(12, r.left + r.width / 2 - ww / 2), window.innerWidth - ww - 12);
    let y = r.bottom + 8; if (y + th > window.innerHeight - 8 && r.top - th - 8 > 8) y = r.top - th - 8;
    tip.style.left = x + "px"; tip.style.top = y + "px";
    tipFor = b; tipPin = !!pin;
    b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-describedby", "k-qtip");
  }
  const qBtn = (text, lab) => `<button type="button" class="k-q" data-kq="${esc(text)}" aria-label="${esc(lab || "説明")}" aria-expanded="false">?</button>`;
  RD.qBtn = qBtn;
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".k-q");
    if (b) { e.preventDefault(); e.stopPropagation(); if (tipFor === b && tipPin) { tipClose(); return; } tipOpen(b, true); return; }
    if (tip && !(e.target.closest && e.target.closest("#k-qtip"))) tipClose();
  }, true);
  document.addEventListener("mouseover", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && !tipPin) tipOpen(b, false); });
  document.addEventListener("mouseout", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && tipFor === b && !tipPin && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("#k-qtip"))) tipClose(); });
  document.addEventListener("focusin", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && !tipPin) tipOpen(b, false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && tip) { tipClose(); } });
  window.addEventListener("scroll", () => { if (tip && !tipPin) tipClose(); }, true);

  // 見出し（ヒーロー）：説明の1行を「？」へ。ヒーローは細く（題・？・次は）
  function slimHero(w) {
    const h = $("[data-rdhero]", w);
    if (!h) return null;
    h.classList.add("k-slim");
    const ht = $(".rd-ht", h), h1 = ht && $("h1", ht);
    if (!h1) return h;
    // 「？」は見出しのすぐ横（見出しの文字には入れない＝読み上げ・見出しの文字は今のまま）
    let q = $(":scope > .k-q", ht);
    const ps = $$(":scope > p:not(.k-termhint)", ht).filter((p) => (p.textContent || "").trim());
    const hint = $(".k-termhint", ht);
    const txt = ps.map((p) => p.textContent.trim()).concat(hint ? ["点線の言葉は、押すと説明が出ます（一覧は用語集）。"] : []).join("\n\n");
    ps.forEach((p) => { p.hidden = true; p.classList.add("k-qhide"); });
    if (hint) hint.classList.add("k-hint2");
    if (txt) {
      if (!q) { h1.insertAdjacentHTML("afterend", qBtn(txt, "この画面の説明")); }
      else { if (q.dataset.kq !== txt) q.dataset.kq = txt; if (q.previousElementSibling !== h1) h1.after(q); }
    }
    return h;
  }
  // カードの見出しの小さな説明（k-hs・rd-chs）を「？」へ
  function foldSubs(w) {
    $$(".k-h > .k-hs, .rd-ch > .rd-chs", w).forEach((s) => {
      if (s.dataset.kq) return;
      const t = (s.textContent || "").replace(/^[（(]|[）)]$/g, "").trim();
      s.dataset.kq = "1";
      if (t.length < 6 || /[0-9０-９]/.test(t) || s.querySelector("button, a, input, select")) return; // 数字の入った説明（件数など）は数字なので残す
      const hd = s.parentElement && $("h2, h3", s.parentElement);
      s.hidden = true; s.classList.add("k-qhide");
      if (hd && !$(".k-q", hd)) hd.insertAdjacentHTML("beforeend", qBtn(t));
      else if (hd) { const q = $(".k-q", hd); q.dataset.kq += "\n\n" + t; }
    });
  }
  // 今のアプリの説明文・注意書き（.nn など）：見出しの「？」へ移す（押せる部品の入った文・警告は、そのまま見せる）
  const NOTE_SEL = "p.nn, .nn > p, div.nn, p.kd, .kd, .info, .v69fst, .v82fbrk, .v84m-note";
  const WARN_RE = /warn|alert|err|crit|danger/i;
  function foldNotes(w) {
    let n = 0;
    $$(NOTE_SEL, w).forEach((p) => {
      if (p.dataset.kqn || p.closest(".rd-x") || p.closest("[data-rdhero]") || p.closest(".k-hold")) return;
      p.dataset.kqn = "1";
      const t = (p.textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 40) return;
      if (p.querySelector("button, a[href], input, select, textarea, label, summary, [data-onclick], [role=button], [data-kact], .p, .k-tag")) return;
      if (/⚠|❗|‼|🚫/.test(t) || WARN_RE.test(p.className) || (p.parentElement && WARN_RE.test(p.parentElement.className))) return;
      if (p.nextElementSibling && p.nextElementSibling.classList.contains("rd-more")) p.nextElementSibling.remove();
      p.style.webkitLineClamp = ""; p.style.display = "";
      const box = p.closest(".c, section, .card, .k-card, details") || p.parentElement;
      const hs = box ? $$("h3, h2, h4, summary", box).filter((x) => !x.closest(".rd-x") && (x.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)) : [];
      let hd = hs[hs.length - 1] || null; // いちばん近い前の見出し
      if (hd && (hd.tagName === "SUMMARY" || hd.closest("button, a, summary, [role=button], [data-onclick]"))) hd = null; // 押せる見出しの中にボタンは置かない
      p.classList.add("k-qhide");
      if (hd) {
        const q = $(".k-q", hd);
        if (q) q.dataset.kq += "\n\n" + t; else hd.insertAdjacentHTML("beforeend", qBtn(t));
      } else {
        p.insertAdjacentHTML("beforebegin", `<span class="k-qline">${qBtn(t, "説明を見る")}<span>説明</span></span>`);
      }
      n++;
    });
    return n;
  }
  // 長いボタンの文言を短く（全文は乗せると出る・押した先は同じ）
  //   「〇〇」で進める → 進める ／ 末尾の（説明）は隠す（数字の入った（）は数字なので残す）
  function shortBtns(w) {
    $$("button, [role=button], a.k-link", w).forEach((b) => {
      if (b.dataset.kfull || b.closest(".k-dd") || b.classList.contains("k-q")) return;
      if (!b.getClientRects().length) return; // たたんだ欄の中など、見えていないボタンは見えたときに（全文を見えている文字で取るため）
      const tn = Array.from(b.childNodes).filter((x) => x.nodeType === 3 && x.nodeValue.trim());
      if (tn.length !== 1 || b.querySelector("span:not(.k-paren):not([aria-hidden]), b, small, strong")) { b.dataset.kfull = ""; return; } // 飾りの絵文字（aria-hidden）はよい
      const cl = b.cloneNode(true); cl.querySelectorAll("[aria-hidden], svg").forEach((x) => x.remove());
      const node = tn[0], s = node.nodeValue, full = (cl.textContent || "").replace(/\s+/g, " ").trim(); // 全文（飾りの絵文字〔aria-hidden〕は入れない＝今の版の見え方とそろえる）
      let m = s.match(/^(\s*🔗?\s*)(「[^」]{2,}」で)(進める|開く|確認する|始める)(\s*)$/);
      if (m) {
        const sp = document.createElement("span"); sp.className = "k-paren"; sp.textContent = m[2];
        node.nodeValue = m[1]; b.insertBefore(sp, node.nextSibling); b.insertBefore(document.createTextNode(m[3] + m[4]), sp.nextSibling);
        b.dataset.kfull = full; if (!b.title) b.title = full; return;
      }
      m = s.match(/^(.{4,}?)(\s*（[^（）0-9０-９]{6,}）)(\s*)$/);
      if (m && full.length > 14) {
        const sp = document.createElement("span"); sp.className = "k-paren"; sp.textContent = m[2];
        node.nodeValue = m[1]; b.insertBefore(sp, node.nextSibling); if (m[3]) b.insertBefore(document.createTextNode(m[3]), sp.nextSibling);
        b.dataset.kfull = full; if (!b.title) b.title = full; return;
      }
      b.dataset.kfull = "";
    });
  }
  RD.shortBtns = shortBtns;
  // ボタン・数のタイルの中の「説明の小さな字」は、乗せると出る（title）へ。数字・状態（準備中など）の字は残す
  const KEEP_RE = /[0-9０-９]|Coming|準備中|開発中|済み|未|件|%|％|円|\$|日前|今日/;
  function descSmall(w) {
    $$("button small, [role=button] small, button .k-ts, .k-tile .k-ts, .rd-tile .rd-ts, .rd-kpi .rd-ks", w).forEach((s) => {
      if (s.dataset.kds || !s.getClientRects().length) return; // 見えていないものは見えたときに
      s.dataset.kds = "1";
      const t = (s.textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 6 || KEEP_RE.test(t) || s.querySelector("button, a, input, select")) return;
      const host = s.closest("button, [role=button], .k-tile, .rd-tile, .rd-kpi");
      if (!host || host.closest(".k-dd, #rdside, .k-cl, .k-cd, .k-pl")) return;
      const full = (host.innerText || host.textContent || "").replace(/\s+/g, " ").trim(); // 隠す前の見えている文字
      s.classList.add("k-qhide");
      if (!host.title) host.title = full;
      if (host.tagName === "BUTTON" && !host.dataset.kfull) host.dataset.kfull = full;
    });
  }

  /* ───────── ② 左のメニュー：5つ（案件／商品／タスク／やりとり／AI商社マン）＋困ったとき＋すべての機能 ───────── */
  const MAIN = [
    ["dash:home", "案件", "brief", "", ["dash:home", "dash:case"]],
    ["dash:prod", "商品", "box", "", ["dash:prod", "item", "up", "srcs"]],
    ["today", "タスク", "list", "", ["today", "task"]],
    ["msg", "やりとり", "msg", "msg", ["msg", "inbox"]],
    ["ai", "AI商社マン", "chat"],
    ["@help", "困ったとき", "help"],
  ];
  if (Array.isArray(RD.MAIN_S)) RD.MAIN_S.splice(0, RD.MAIN_S.length, ...MAIN);
  (function navAll() {
    const N = RD.NAV_S; if (!Array.isArray(N)) return;
    const g0 = N[0]; if (g0 && g0.items && g0.items[0] && g0.items[0][0] === "dash:home") g0.items[0][1] = "案件一覧（ホーム）";
    const asset = N.find((g) => /資産/.test(g.g));
    if (asset && !asset.items.some((x) => x[0] === "dash:prod")) asset.items.unshift(["dash:prod", "商品一覧", "box"]);
  })();
  // 案件の札（要対応の数）を左のメニューの「案件」に出す
  function sideBadge() {
    const b = $('#rdside .rd-main[data-rdk="dash:home"]'); if (!b) return;
    let n = 0; try { n = allCases().filter((c) => c.todo).length; } catch (e) { n = 0; }
    let s = $(".rd-bdg", b);
    if (!n) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement("span"); s.className = "rd-bdg"; b.appendChild(s); }
    if (s.textContent !== String(n)) s.textContent = String(n);
    s.title = "要対応（相手の返信に、まだ返していない案件）";
  }

  /* ───────── いまどこ（押せるパンくず）・次は ───────── */
  const NAME = { "dash:home": "案件", "dash:case": "案件", "dash:prod": "商品", "dash:rep": "分析・レポート", today: "タスク", task: "タスク・進行", msg: "やりとり", inbox: "受信箱", ai: "AI商社マン", item: "商品情報", up: "商品情報を登録", srcs: "取り込んだ情報" };
  const PARENT = { item: "dash:prod", up: "dash:prod", srcs: "dash:prod", task: "today", inbox: "msg", "dash:case": "dash:home" };
  const FLOW = { up: ["item", "商品情報を確かめる"], item: ["cty", "販売先国を選ぶ"], cty: ["ops:reg", "規制を調べる"], "ops:reg": ["deck", "営業資料をつくる"], deck: ["db", "バイヤーを探す"], db: ["dash:home", "案件を進める"], deal: ["dash:home", "案件一覧へ"], "dash:prod": null };
  const FLOW_F = { frates: ["finbox", "見積の依頼に答える"], finbox: ["fcase", "案件を進める"], fagg: ["finbox", "見積受信箱へ"] };
  function navGroupOf(k) {
    const N = RD.isFwd() ? RD.NAV_F : RD.NAV_S;
    for (const g of N || []) { const it = g.items.find((x) => x[0] === k || (k.indexOf(":") < 0 && x[0] === k)); if (it) return { g: g.g, nm: it[1] }; }
    return null;
  }
  function crumbHtml(k) {
    const fwd = RD.isFwd();
    const parts = [];
    const mainK = (fwd ? RD.MAIN_F : RD.MAIN_S) || [];
    const inMain = mainK.find((it) => (it[4] || [it[0]]).indexOf(k) >= 0 || it[0] === k);
    if (k === "dash:case") {
      parts.push(["dash:home", "案件"]);
      const c = RD._case0; parts.push(["", c ? c.name : "案件の詳細"]);
    } else if (inMain && (!PARENT[k] || inMain[0] === k)) {
      parts.push(["", inMain[1]]);
    } else if (PARENT[k]) {
      const pk = PARENT[k], pm = mainK.find((it) => it[0] === pk);
      parts.push([pk, (pm && pm[1]) || NAME[pk] || pk]);
      parts.push(["", (navGroupOf(k) || {}).nm || NAME[k] || k]);
    } else {
      const g = navGroupOf(k);
      parts.push(["@all", "すべての機能"]);
      if (g) { parts.push(["", g.g]); parts.push(["", g.nm]); } else parts.push(["", NAME[k] || k]);
    }
    return parts.map((p, i) => (i ? `<span class="k-bcsep">${I("chevR", 12, 2.6)}</span>` : "") + (p[0] && i < parts.length - 1 ? `<button type="button" class="k-bcb" data-kbc="${esc(p[0])}">${esc(p[1])}</button>` : `<span class="k-bcc"${i === parts.length - 1 ? ' aria-current="page"' : ""}>${esc(p[1])}</span>`)).join("");
  }
  function crumbNext(w, k) {
    const h = $("[data-rdhero]", w); if (!h) return;
    const ht = $(".rd-ht", h); if (!ht) return;
    let bc = $(".k-bc", ht);
    if (!bc) { bc = document.createElement("div"); bc.className = "k-bc"; ht.prepend(bc); }
    const html = crumbHtml(k);
    if (bc.dataset.k !== k + "|" + html.length) { bc.innerHTML = html; bc.dataset.k = k + "|" + html.length; bc.setAttribute("aria-label", "いまの場所"); bc.setAttribute("role", "navigation"); }
    // よく使う5つの画面は、パンくずが題と同じ1語になる＝出さない（左のメニューの色で「いまどこ」がわかる）
    bc.classList.toggle("k-bc1", !$(".k-bcsep", bc));
    const F = RD.isFwd() ? FLOW_F : FLOW;
    const nx = F[k];
    let nb = $(".k-next", h);
    if (nx && !nb) {
      h.insertAdjacentHTML("beforeend", `<button type="button" class="k-next" data-kbc="${esc(nx[0])}" title="次の手順：${esc(nx[1])}"><small>次は</small><b>${esc(nx[1])}</b>${I("arr", 16, 2.4)}</button>`);
    } else if (!nx && nb) nb.remove();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-kbc]");
    if (!b) return;
    e.preventDefault();
    const k = b.dataset.kbc;
    if (k === "@all") { try { localStorage.setItem("rd_navall", "1"); } catch (x) { /* 無視 */ } if (RD.buildSide) RD.buildSide(); const h = $("#rdside .rd-allh"); if (h) { h.focus(); h.scrollIntoView({ block: "nearest" }); } if (window.innerWidth <= 820) document.body.classList.add("navopen"); return; }
    goKey(k);
  });

  /* ───────── 案件一覧（ホーム） ───────── */
  // 並びはこの PC に覚える。絞り込み（タブ・ステータス・探す）は開くたびに「すべて」から（案件が見えなくなったと迷わないように）
  const CL = { f: "all", st: "", sort: (ls.get("rd_cl", {}) || {}).sort || "in", q: "" };
  const saveCL = () => ls.set("rd_cl", { sort: CL.sort });
  const setupKey = (t) => (/営業資料/.test(t) ? "deck" : /バイヤー/.test(t) ? "db" : /商談/.test(t) ? "deal" : /国/.test(t) ? "cty" : /資料|足りない|商品/.test(t) ? "up" : "today");
  const SORTS = [["in", "相手の最新メッセージ順"], ["last", "最終やりとり順"], ["st", "ステータス順"], ["cty", "国順"]];
  function filtered(L) {
    let R = L.slice();
    if (CL.f === "fav") R = R.filter(isFav);
    else if (CL.f === "todo") R = R.filter((c) => c.todo);
    else if (CL.f === "open") R = R.filter((c) => c.ss !== "失注");
    if (CL.st) R = R.filter((c) => c.ss === CL.st);
    const q = CL.q.trim().toLowerCase();
    if (q) R = R.filter((c) => [c.name, c.cty, c.biz, c.id, c.ss, c.item, c.next.t].join(" ").toLowerCase().indexOf(q) >= 0);
    const by = {
      in: (a, b) => (b.inAt || 0) - (a.inAt || 0) || b.lastAt - a.lastAt,
      last: (a, b) => b.lastAt - a.lastAt,
      st: (a, b) => (ST_ORDER[b.ss] ?? 0) - (ST_ORDER[a.ss] ?? 0) || b.lastAt - a.lastAt,
      cty: (a, b) => String(a.cty).localeCompare(String(b.cty), "ja") || b.lastAt - a.lastAt,
    }[CL.sort] || ((a, b) => b.lastAt - a.lastAt);
    // お気に入りは、どの並びでも上に
    return R.sort((a, b) => (isFav(b) ? 1 : 0) - (isFav(a) ? 1 : 0) || by(a, b));
  }
  function foldOld(w, label) {
    if ($("details.k-oldb", w)) return $("details.k-oldb", w);
    const old = document.createElement("details");
    old.className = "rd-old k-oldb";
    old.innerHTML = `<summary>${I("chart", 20)}<span>${esc(label)}</span></summary><div class="rd-oldin"></div>`;
    const inner = $(".rd-oldin", old);
    Array.from(w.children).forEach((c) => { if (!c.matches("[data-rdhero], .rd-x, details.k-oldb")) inner.appendChild(c); });
    w.appendChild(old);
    return old;
  }
  function holdOld(w) {
    // 案件の詳細・商品一覧：今のダッシュボードの部品は、見えない箱に入れておく（アプリの描き直しでそのまま使えるように・同じものは「分析・レポート」で全部見える）
    let h = $(":scope > .k-hold", w);
    if (!h) { h = document.createElement("div"); h.className = "k-hold"; h.hidden = true; w.appendChild(h); }
    Array.from(w.children).forEach((c) => { if (!c.matches("[data-rdhero], .rd-x, .k-hold")) h.appendChild(c); });
  }
  function readWait(w) {
    return $$(".v38wait .v38wt", w).map((b) => ({ k: b.getAttribute("data-v38wf"), n: RD.num((($(".v38wn", b) || {}).textContent) || ""), l: ((($(".v38wl", b) || {}).textContent) || "").trim(), el: b })).filter((x) => x.n > 0);
  }
  function readSetup(w) {
    const L = $$("#ux32setup .ux32steps > li", w).map((li) => ({ t: ((($(".ux32st b", li) || {}).textContent) || "").trim(), done: li.classList.contains("done"), next: li.classList.contains("next") }));
    return { all: L.length, done: L.filter((x) => x.done).length, nx: L.find((x) => x.next) || L.find((x) => !x.done) || null };
  }
  function homeView(w) {
    const old = foldOld(w, "これまでのダッシュボード（数字と分析・はじめの設定）");
    const hz = $("[data-rdhero]", w);
    if (hz && !$(".k-hcta", hz)) hz.insertAdjacentHTML("beforeend", `<button type="button" class="k-btn k-hcta" data-kbc="db">${I("plus", 18, 2.4)}バイヤーを探す</button>`);
    const L = allCases();
    const multi = new Set(L.map((c) => c.pi)).size > 1;
    const wait = readWait(old);
    const setup = readSetup(old);
    const box = document.createElement("div");
    box.className = "rd-x k-cl"; box.setAttribute("data-kcl", "1");
    old.before(box);
    const cnt = (fn) => L.filter(fn).length;
    const tabs = [["all", "すべて", L.length], ["todo", "要対応", cnt((c) => c.todo)], ["fav", "お気に入り", cnt(isFav)], ["open", "進行中", cnt((c) => c.ss !== "失注")]];
    const stc = BM.map((s) => [STS(s), cnt((c) => c.ss === STS(s))]);
    const top = [];
    wait.forEach((x) => top.push(`<button type="button" class="k-pill ${x.k === "appr" ? "or" : ""}" data-kwait="${esc(x.k)}">${I(x.k === "appr" ? "check" : x.k === "reply" ? "mail" : "list", 16)}${esc(x.l)}<b>${x.n}</b></button>`));
    if (setup.all && setup.done < setup.all && setup.nx) top.push(`<button type="button" class="k-pill bl" data-kbc="${setupKey(setup.nx.t)}">${I("flag", 16)}はじめの設定 <b>${setup.done}/${setup.all}</b><span class="k-pn">次：${esc(clip(setup.nx.t, 18))}</span></button>`);
    box.innerHTML = `
      ${top.length ? `<div class="k-pills" role="group" aria-label="対応待ち">${top.join("")}</div>` : ""}
      <section class="k-card k-clcard">
        <div class="k-cltool">
          <div class="k-tabs" role="tablist" aria-label="絞り込み">${tabs.map((t) => `<button type="button" role="tab" class="k-tab ${CL.f === t[0] ? "on" : ""}" aria-selected="${CL.f === t[0]}" data-kclf="${t[0]}">${t[0] === "fav" ? I("star", 15, 2.2) : t[0] === "todo" ? I("alert", 15, 2.2) : ""}${esc(t[1])}<b>${t[2]}</b></button>`).join("")}</div>
          <label class="k-clq">${I("search", 17)}<input type="search" id="k-clq" placeholder="相手・国・ID で探す" value="${esc(CL.q)}" autocomplete="off" aria-label="案件を探す"></label>
          <label class="k-clsort">${I("sliders", 16)}<select id="k-clsort" aria-label="並び">${SORTS.map((s) => `<option value="${s[0]}" ${CL.sort === s[0] ? "selected" : ""}>${esc(s[1])}</option>`).join("")}</select></label>
        </div>
        <div class="k-stchips" role="group" aria-label="ステータス">${stc.map((s) => `<button type="button" class="k-stc st-${esc(s[0])} ${CL.st === s[0] ? "on" : ""}" aria-pressed="${CL.st === s[0]}" data-kclst="${esc(s[0])}" ${s[1] ? "" : "data-zero=1"}>${esc(s[0])}<b>${s[1]}</b></button>`).join("")}</div>
        <div id="k-clbody"></div>
      </section>`;
    const body = $("#k-clbody", box);
    const paint = () => {
      const R = filtered(L);
      RD._caseOrder = R.map((c) => c.key);
      if (!L.length) {
        const S = RD.exportSteps ? RD.exportSteps() : [];
        body.innerHTML = `<div class="k-clempty"><img src="${RD.IMG}robot.png" alt=""><div><b>まだ案件はありません</b><p>バイヤーに連絡すると、相手ごとに案件ができます。</p>
          ${S.length ? `<div class="k-clsteps">${S.slice(0, 3).map((s, i) => `<button type="button" class="k-clstep ${s.st}" ${act(s.go)}><span>${s.st === "done" ? I("check", 14, 3) : i + 1}</span>${esc(s.t)}</button>`).join(`<i>${I("chevR", 14, 2.4)}</i>`)}</div>` : ""}
          <button type="button" class="k-btn" data-kbc="db">${I("users", 18)}バイヤーを探す</button></div></div>`;
        return;
      }
      if (!R.length) { body.innerHTML = `<div class="k-empty">${CL.f === "fav" ? "お気に入りの案件はまだありません（行の ☆ で登録）" : "この条件の案件はありません"}</div>`; return; }
      body.innerHTML = `<table class="k-cltbl"><thead><tr><th class="c-fav"><span class="k-sr">お気に入り</span></th><th>相手</th><th>国</th><th>ステータス</th><th>次の行動</th><th>最終やりとり</th><th class="c-go"></th></tr></thead><tbody>${R.map((c) => {
        const fv = isFav(c), nx = c.next, lm = c.last;
        return `<tr class="k-clrow ${c.todo ? "todo" : ""}" tabindex="0" ${act(() => openCase(c.key))} aria-label="${esc(c.name)}を開く">
          <td class="c-fav"><button type="button" class="k-star ${fv ? "on" : ""}" aria-pressed="${fv}" aria-label="お気に入り" title="お気に入り" ${act((e, b) => { const on = toggleFav(c); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); })}>${I("star", 18, 2)}</button></td>
          <td class="c-who"><b>${c.named ? "" : `<span class="k-lock" title="AIバイヤー開拓の相手（連絡先は仲介のため非開示）">${I("lock", 13, 2.4)}</span>`}${esc(c.name)}</b><small>${esc(clip(c.biz, 26))}${c.named ? "" : ""} · ID ${esc(c.id)}${multi ? ` · ${esc(clip(c.item, 16))}` : ""}</small>${c.unread ? `<span class="k-new">新着 ${c.unread}</span>` : ""}</td>
          <td class="c-cty"><span>${flag(c.cty, 18)}${esc(c.cty || "—")}</span></td>
          <td class="c-st"><span class="k-tag ${RD.stCls(c.st)}">${esc(c.ss)}</span></td>
          <td class="c-nx k-nx-${nx.kind}">${I(nx.ic, 16, 2.2)}<span>${esc(clip(nx.t, 34))}${nx.sub ? `<small>${esc(nx.sub)}</small>` : ""}</span>${nx.ai ? `<em class="k-ai" title="AI商社マンが、相手の最新の返事を読んで出した次の行動">AI</em>` : ""}</td>
          <td class="c-last"><span class="k-who ${lm && lm.w === "by" ? "by" : "me"}">${lm && lm.w === "by" ? "相手" : "貴社"}</span><span class="k-lt"><b>${esc(when(c.lastAt))}</b>${esc(clip(lm && (lm.subj || lm.body), 30))}</span></td>
          <td class="c-go">${I("chevR", 18, 2.4)}</td></tr>`;
      }).join("")}</tbody></table>
      <div class="k-clfoot"><span>${R.length}件</span>${L.length > R.length ? `<span>（全 ${L.length}件のうち）</span>` : ""}<button type="button" class="k-link" data-kbc="db">${I("users", 15)}新しいバイヤーを探す</button><button type="button" class="k-link" data-kbc="deal">${I("brief", 15)}商談の記録</button></div>`;
    };
    paint();
    $$("[data-kclf]", box).forEach((b) => b.addEventListener("click", () => { CL.f = b.dataset.kclf; saveCL(); $$("[data-kclf]", box).forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", String(on)); }); paint(); }));
    $$("[data-kclst]", box).forEach((b) => b.addEventListener("click", () => { CL.st = CL.st === b.dataset.kclst ? "" : b.dataset.kclst; saveCL(); $$("[data-kclst]", box).forEach((x) => { const on = x.dataset.kclst === CL.st; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); }); paint(); }));
    $("#k-clsort", box).addEventListener("change", (e) => { CL.sort = e.target.value; saveCL(); paint(); });
    $("#k-clq", box).addEventListener("input", (e) => { CL.q = e.target.value; paint(); });
    $$("[data-kwait]", box).forEach((b) => b.addEventListener("click", () => { const x = wait.find((y) => y.k === b.dataset.kwait); if (x && x.el) x.el.click(); }));
    body.addEventListener("keydown", (e) => { const r = e.target.closest && e.target.closest("tr.k-clrow"); if (r && (e.key === "Enter" || e.key === " ") && e.target === r) { e.preventDefault(); r.click(); } });
  }
  RD.homeView = homeView;

  /* ───────── 案件の詳細 ───────── */
  function openCase(key) {
    const [pi] = String(key).split("|");
    const go = () => { RD.caseKey = key; goKey("dash:case"); };
    if (+pi >= 0 && tensAll()[+pi] !== curTen()) switchProd(+pi).then(go); else go();
  }
  RD.openCase = openCase;
  function askCase(c, q) {
    q = String(q || "").trim(); if (!q) return;
    const head = `【案件：${c.name}（${c.cty}・${c.ss}・ID ${c.id}）】`;
    goKey("ai");
    let n = 0;
    const tm = setInterval(() => { n++; if (document.getElementById("chat") || n > 30) { clearInterval(tm); try { askFree(head + q); } catch (e) { console.error("[rd case] askFree", e); } setTimeout(() => { const ch = document.getElementById("chat"); if (ch) ch.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); } }, 100); // eslint-disable-line no-undef
  }
  function openThread(c) { try { openDMThread(c.id); } catch (e) { goKey("msg"); } } // eslint-disable-line no-undef
  function openStatus(c) {
    openThread(c);
    setTimeout(() => { const s = document.getElementById("bmStSel"); if (s) { s.scrollIntoView({ block: "center" }); s.focus(); s.classList.add("k-flash"); setTimeout(() => s.classList.remove("k-flash"), 2200); } }, 250);
  }
  function tasksFor(c) {
    let T = [];
    try { T = ((typeof D !== "undefined" && D && D.tasks) || []).slice(); } catch (e) { T = []; } // eslint-disable-line no-undef
    let A = [];
    try { A = (typeof todayItems === "function" ? todayItems() : []) || []; } catch (e) { A = []; } // eslint-disable-line no-undef
    const hasW = (s, w) => w && String(s || "").indexOf(w) >= 0;
    const mine = [], cty = [];
    T.forEach((t) => { if (!t || !t.n) return; const s = t.n + " " + (t.ref || ""); if (hasW(s, c.id) || (c.named && hasW(s, c.name))) mine.push(t); else if (c.cty && hasW(t.n, c.cty)) cty.push(t); });
    const ai = A.filter((x) => x && (hasW(x.t, c.id) || (c.named && hasW(x.t, c.name))));
    return { mine, cty, ai };
  }
  function docsFor(c) {
    let R = null;
    try { R = (typeof D !== "undefined" && D && D.regs && D.regs[c.cty]) || null; } catch (e) { R = null; } // eslint-disable-line no-undef
    if (R && Array.isArray(R.docs)) return { from: "reg", docs: R.docs, warn: R.warn || "", duty: R.duty || "" };
    const S = (c.t && c.t.ctySel) || {};
    const r = (Array.isArray(S.rec) ? S.rec : []).find((x) => x && x.c === c.cty);
    if (r && r.facts && Array.isArray(r.facts.docs)) return { from: "cty", docs: r.facts.docs, warn: "", duty: r.facts.duty || "" };
    return { from: "", docs: [], warn: "", duty: "" };
  }
  function fbFor(c) {
    let F = [];
    try { F = ((typeof D !== "undefined" && D && D.fb) || []).slice(); } catch (e) { F = []; } // eslint-disable-line no-undef
    return F.filter((r) => r && c.named && String(r.b || "").trim() === c.name).sort((a, b) => String(b.d || "").localeCompare(String(a.d || "")));
  }
  const tShort = (m) => { const s = String((m && m.t) || ""); const y = String(new Date().getFullYear()); const x = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}:\d{2}))?/); if (!x) return s || md(msgAt(m)); return (x[1] === y ? "" : x[1] + "/") + (+x[2]) + "/" + (+x[3]) + (x[4] ? " " + x[4] : ""); };
  // 文の言語：かなが一定の割合（8%）より多ければ日本語。少なければ相手の言語（中国語の文に会社名の「みなと」が入るなど、かなが少しだけ混じる文は日本語にしない）
  const langAttr = (c, m) => {
    const s = String((m && (m.body || m.subj)) || "").slice(0, 400).replace(/\s+/g, "");
    const kana = (s.match(/[ぁ-んァ-ヶー]/g) || []).length;
    if (s && kana / s.length > 0.08) return "ja";
    const L = { English: "en", 日本語: "ja", 繁體中文: "zh-Hant", 简体中文: "zh-Hans", Español: "es", 한국어: "ko", Français: "fr", Deutsch: "de", ไทย: "th", "Tiếng Việt": "vi", "Bahasa Indonesia": "id" };
    const l = L[c.lang] || "en";
    return l === "ja" ? (/[一-鿿]/.test(s) && !kana ? "zh" : "en") : l; // 相手の言語が日本語なのに、かなの少ない文＝英語か中国語
  };
  function caseView(w) {
    const L = allCases();
    const c = L.find((x) => x.key === RD.caseKey) || L.find((x) => x.id === String(RD.caseKey || "").split("|")[1]);
    if (!c) { RD.dashMode = "home"; setTimeout(() => goKey("dash:home"), 0); return; }
    RD._case0 = c;
    holdOld(w);
    const h = $("[data-rdhero]", w);
    if (h) { const h1 = $("h1", h); if (h1) h1.textContent = c.name; const p = $(".rd-ht > p", h); if (p) p.textContent = `${c.cty}の${c.biz}・ID ${c.id}`; }
    const ord = (RD._caseOrder && RD._caseOrder.indexOf(c.key) >= 0) ? RD._caseOrder : filtered(L).map((x) => x.key);
    const ix = ord.indexOf(c.key), pv = ix > 0 ? ord[ix - 1] : "", nv = ix >= 0 && ix < ord.length - 1 ? ord[ix + 1] : "";
    const nx = c.next, fv = isFav(c);
    const tk = tasksFor(c), dc = docsFor(c), fb = fbFor(c);
    const msgs = c.msgs.slice().reverse();
    const MSGN = 5;
    const stLog = (Array.isArray(c.th.stLog) ? c.th.stLog : []).slice(-6);
    const v72 = nx.ai ? c.th.v72 : null;
    const B = c.b || {};
    const tRow = (t) => { const due = t.e || ""; const late = due && t.st !== "完了" && due < RD.today(); return `<li class="${t.st === "完了" ? "done" : ""}"><span class="k-tst">${t.st === "完了" ? I("check", 14, 3) : I("clock", 14, 2.2)}</span><span class="k-tn">${esc(t.n)}</span><span class="k-tdue ${late ? "late" : ""}">${esc(t.st || "")}${due ? "・" + esc(due.slice(5).replace("-", "/")) : ""}</span></li>`; };
    const box = document.createElement("div");
    box.className = "rd-x k-cd"; box.setAttribute("data-kcd", c.key);
    box.innerHTML = `
      <section class="k-card k-cdhd">
        <div class="k-cdtop">
          <span class="k-cdflag">${flag(c.cty, 34)}</span>
          <div class="k-cdname"><div class="k-cdrow1"><span class="k-tag ${RD.stCls(c.st)} k-cdst">${esc(c.ss)}</span><button type="button" class="k-link k-mini" ${act(() => openStatus(c))}>${I("edit", 14)}ステータスを変える</button></div>
            <small>${esc(c.cty)}・${esc(c.biz)}・ID ${esc(c.id)}${c.item ? `・商品 ${esc(clip(c.item, 22))}` : ""}</small></div>
          <div class="k-cdnav">
            <button type="button" class="k-star big ${fv ? "on" : ""}" aria-pressed="${fv}" aria-label="お気に入り" title="お気に入り" ${act((e, b) => { const on = toggleFav(c); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); })}>${I("star", 20, 2)}</button>
            <button type="button" class="k-btn white k-mini" ${pv ? act(() => openCase(pv)) : "disabled"} aria-label="前の案件">${I("chevR", 16, 2.6)}</button>
            <button type="button" class="k-btn white k-mini" ${nv ? act(() => openCase(nv)) : "disabled"} aria-label="次の案件">${I("chevR", 16, 2.6)}</button>
          </div>
        </div>
        <div class="k-cdacts">
          <button type="button" class="k-btn" ${act(() => openThread(c))}>${I("mail", 18)}${c.todo ? "返信する" : "やりとりを開く"}</button>
          <button type="button" class="k-btn white" data-kbc="ops:doc">${I("doc", 18)}書類をつくる</button>
          <button type="button" class="k-btn white" ${act(() => { try { opsRegC = c.cty; } catch (e) { /* 無い版 */ } goKey("ops:reg"); })}>${I("shield", 18)}${esc(c.cty)}の規制</button>
          <button type="button" class="k-btn white" data-kbc="deck">${I("slides", 18)}営業資料</button>
        </div>
      </section>
      <div class="k-cdgrid">
        <div class="k-cdmain">
          <section class="k-card k-cdnext k-nx-${nx.kind}">
            <div class="k-h">${I("flag", 22)}<h2>次の行動</h2>${nx.ai ? `<span class="k-tag or">AI</span>` : ""}</div>
            <p class="k-cdnx">${esc(nx.t)}${nx.sub ? `<small>${esc(nx.sub)}</small>` : ""}</p>
            ${nx.more && nx.more.length ? `<ul class="k-cdmore">${nx.more.map((x) => `<li>${I("chevR", 14, 2.6)}${esc(x)}</li>`).join("")}</ul>` : ""}
            ${v72 && v72.draft ? `<div class="k-cddraft">${I("spark", 18)}<span><b>AIの返信の下書きがあります</b>${v72.lang ? `<small>${esc(v72.lang)}</small>` : ""}</span><button type="button" class="k-btn k-mini" ${act(() => openThread(c))}>下書きを見る</button></div>` : ""}
            ${v72 && v72.unknown && v72.unknown.length ? `<div class="k-cdunk"><b>${I("alert", 15, 2.2)}確かめること</b>${v72.unknown.slice(0, 3).map((x) => `<span class="k-tag am">${esc(clip(x, 30))}</span>`).join("")}</div>` : ""}
          </section>
          <section class="k-card k-cdai">
            <div class="k-h"><img src="${RD.IMG}robot.png" alt="" class="k-cdbot"><h2>この案件をAIに聞く</h2></div>
            <form class="rd-ask k-cdask"><input placeholder="例）この相手への返信の文案を作って" autocomplete="off" aria-label="この案件についての質問"><button type="submit" aria-label="聞く">${I("send", 18, 2.2)}</button></form>
            <div class="k-cdchips">
              <button type="button" class="k-chip" ${act(() => askCase(c, "これまでのやりとりを踏まえて、この相手への返信の文案を作って"))}>${I("mail", 16)}返信の文案</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `この相手に出す見積（取引条件・数量帯・有効期限）の出し方と注意点を教えて`))}>${I("coins", 16)}見積の出し方</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `${c.cty}にこの商品を輸出するときの規制・必要な書類を教えて`))}>${I("shield", 16)}${esc(c.cty)}の規制</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `いまのステータス（${c.ss}）から商談を進める次の一手を、結論から教えて`))}>${I("target", 16)}次の一手</button>
            </div>
          </section>
          <section class="k-card k-cdmsgs">
            <div class="k-h">${I("msg", 22)}<h2>やりとり</h2><span class="k-cnt">${c.msgs.length}</span><div class="k-hr"><button type="button" class="k-link" ${act(() => openThread(c))}>すべて開く ${I("arr", 15)}</button></div></div>
            <ol class="k-tl">${msgs.slice(0, MSGN).map((m) => `<li class="${m.w === "by" ? "by" : "me"}"><div class="k-tlb"><div class="k-tlh"><span class="k-who ${m.w === "by" ? "by" : "me"}">${m.w === "by" ? "相手" : "貴社"}</span><b lang="${langAttr(c, m)}">${esc(clip(m.subj || "", 60))}</b><time>${esc(tShort(m))}</time></div><p lang="${langAttr(c, m)}">${esc(clip(m.body, 220))}</p></div></li>`).join("")}</ol>
            ${c.msgs.length > MSGN ? `<button type="button" class="k-link" ${act(() => openThread(c))}>前の ${c.msgs.length - MSGN}件も見る ${I("arr", 15)}</button>` : ""}
          </section>
        </div>
        <div class="k-cdside">
          <section class="k-card">
            <div class="k-h">${I("trend", 20)}<h2>ステータスの流れ</h2></div>
            <ol class="k-stl">${stLog.length ? stLog.map((s, i) => `<li class="${i === stLog.length - 1 ? "now" : ""}"><span class="k-tag ${RD.stCls(s.st)}">${esc(STS(s.st))}</span><time>${esc(md(s.at))}</time><small>${esc(String(s.by || "").replace(/（.*/, ""))}</small></li>`).join("") : `<li class="now"><span class="k-tag ${RD.stCls(c.st)}">${esc(c.ss)}</span></li>`}</ol>
            ${c.why ? `<p class="k-cdwhy">${I("spark", 14)}<span>${esc(clip(c.why, 90))}</span></p>` : ""}
          </section>
          <section class="k-card">
            <div class="k-h">${I("list", 20)}<h2>タスク</h2><span class="k-cnt">${tk.mine.length + tk.cty.length + tk.ai.length}</span><div class="k-hr"><button type="button" class="k-link" data-kbc="task">タスクを開く ${I("arr", 15)}</button></div></div>
            ${tk.ai.length ? `<div class="k-tg">今日やること（AI）</div><ul class="k-tasks">${tk.ai.map((x) => `<li><span class="k-tst">${I("spark", 14)}</span><span class="k-tn">${esc(x.t)}</span><span class="k-tdue">${esc(x.pr || "")}</span></li>`).join("")}</ul>` : ""}
            ${tk.mine.length ? `<div class="k-tg">この相手</div><ul class="k-tasks">${tk.mine.slice(0, 5).map(tRow).join("")}</ul>` : ""}
            ${tk.cty.length ? `<div class="k-tg">${esc(c.cty)}向け</div><ul class="k-tasks">${tk.cty.slice(0, 4).map(tRow).join("")}</ul>` : ""}
            ${!tk.ai.length && !tk.mine.length && !tk.cty.length ? `<div class="k-empty k-sm">この案件のタスクはありません</div>` : ""}
          </section>
          <section class="k-card">
            <div class="k-h">${I("folder", 20)}<h2>書類</h2><div class="k-hr"><button type="button" class="k-link" data-kbc="ops:doc">書類をつくる ${I("arr", 15)}</button></div></div>
            ${dc.docs.length ? `<div class="k-tg">${esc(c.cty)}への輸出に要る書類${dc.from === "cty" ? "（販売先国の調べ）" : ""}</div><div class="k-docs">${dc.docs.map((d) => `<span class="k-doc">${I("doc", 14)}${esc(d)}</span>`).join("")}</div>${dc.duty ? `<p class="k-cdsm">関税：${esc(dc.duty)}</p>` : ""}${dc.warn ? `<p class="k-cdwarn">${I("alert", 14, 2.2)}${esc(dc.warn)}</p>` : ""}`
              : `<div class="k-empty k-sm">${esc(c.cty)}の規制はまだ調べていません<button type="button" class="k-link" ${act(() => { try { opsRegC = c.cty; } catch (e) { /* 無い版 */ } goKey("ops:reg"); })}>規制を調べる ${I("arr", 14)}</button></div>`}
          </section>
          <section class="k-card">
            <div class="k-h">${I("brief", 20)}<h2>商談の記録</h2><span class="k-cnt">${fb.length}</span><div class="k-hr"><button type="button" class="k-link" data-kbc="deal">開く ${I("arr", 15)}</button></div></div>
            ${fb.length ? fb.slice(0, 2).map((r) => `<dl class="k-kv"><dt>日付</dt><dd>${esc(r.d || "")}・${esc(r.ch || "")}</dd>${r.price ? `<dt>価格</dt><dd>${esc(r.price)}</dd>` : ""}${r.lot ? `<dt>数量</dt><dd>${esc(r.lot)}</dd>` : ""}${r.term ? `<dt>条件</dt><dd>${esc(r.term)}</dd>` : ""}${r.react ? `<dt>反応</dt><dd>${esc(r.react)}</dd>` : ""}</dl>`).join("") : `<div class="k-empty k-sm">${c.named ? "まだ記録はありません" : "相手の会社名がわかると、商談の記録と結びつきます"}</div>`}
          </section>
          <section class="k-card">
            <div class="k-h">${I("bldg", 20)}<h2>相手の情報</h2></div>
            ${c.b ? `<dl class="k-kv">${B.contact ? `<dt>担当</dt><dd>${esc(B.contact)}</dd>` : ""}${B.size ? `<dt>規模</dt><dd>${esc(B.size)}</dd>` : ""}${B.ints ? `<dt>関心</dt><dd>${esc(B.ints)}</dd>` : ""}${B.url ? `<dt>Web</dt><dd>${esc(B.url)}</dd>` : ""}</dl>${B.ai && Array.isArray(B.ai.missing) && B.ai.missing.length ? `<div class="k-tg">足りない情報（AI）</div><div class="k-docs">${B.ai.missing.slice(0, 4).map((x) => `<span class="k-tag am">${esc(clip(x, 26))}</span>`).join("")}</div>` : ""}`
              : `<p class="k-cdsm">${I("lock", 14)}AIバイヤー開拓で見つけた相手です（連絡先は仲介のため非開示）</p>`}
          </section>
        </div>
      </div>`;
    (h || w.firstChild) ? (h ? h.after(box) : w.prepend(box)) : w.appendChild(box);
    const f = $(".k-cdask", box);
    f.addEventListener("submit", (e) => { e.preventDefault(); const q = $("input", f); if (!q.value.trim()) { q.focus(); f.classList.add("k-need"); setTimeout(() => f.classList.remove("k-need"), 1600); return; } askCase(c, q.value); });
    // 前の案件の矢印は左向き
    const pb = $$(".k-cdnav .k-btn", box)[0]; if (pb) pb.classList.add("k-flip");
  }

  /* ───────── 商品一覧（商品管理） ───────── */
  function prodView(w) {
    holdOld(w);
    const T = tensAll(), t0 = curTen();
    const list = T.length ? T.map((t, i) => ({ t, i })) : t0 ? [{ t: t0, i: -1 }] : [];
    const L = allCases();
    const h = $("[data-rdhero]", w);
    if (h && !$(".k-hcta", h)) h.insertAdjacentHTML("beforeend", `<button type="button" class="k-btn k-hcta" ${act(() => { const s = document.getElementById("psw"); if (s && Array.from(s.options).some((o) => o.value === "__new")) { s.value = "__new"; s.dispatchEvent(new Event("change")); } else goKey("up"); })}>${I("plus", 18, 2.4)}新しい商品を登録</button>`);
    const box = document.createElement("div");
    box.className = "rd-x k-pl"; box.setAttribute("data-kpl", "1");
    box.innerHTML = `<div class="k-plgrid">${list.map(({ t, i }) => {
      const on = t === t0;
      const S = t.ctySel || {};
      const ch = (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean);
      const ct = ch.length ? ch : (t.targets || []);
      const cs = L.filter((c) => c.pi === i || (i < 0 && c.pi < 0));
      const todo = cs.filter((c) => c.todo).length;
      const ph = t.assets && Array.isArray(t.assets.ph) && t.assets.ph[0];
      const src = ph && ph.b64 ? `data:${ph.mime || "image/jpeg"};base64,${ph.b64}` : "";
      const steps = [["商品", !!t.item], ["国", ch.length > 0], ["営業資料", !!(t.deckGen && t.deckGen.length) || !!(t.deck3 && Object.keys(t.deck3).length)], ["バイヤー", cs.length > 0 || (t.outreach || []).length > 0]];
      return `<section class="k-card k-pc ${on ? "on" : ""}">
        <div class="k-pctop">${src ? `<img src="${src}" alt="" class="k-pcimg">` : `<span class="k-pcimg">${I("box", 30, 1.6)}</span>`}
          <div class="k-pcnm"><b>${esc(t.item || t.file || "（名前のない商品）")}</b><small>${esc([t.co, t.cat, t.sku].filter(Boolean).join("・"))}</small></div>${on ? `<span class="k-tag orf">表示中</span>` : ""}</div>
        <div class="k-pcst">${steps.map((s) => `<span class="${s[1] ? "ok" : ""}">${s[1] ? I("check", 13, 3) : ""}${esc(s[0])}</span>`).join(`<i></i>`)}</div>
        <div class="k-pcrow"><span class="k-pcl">販売先国</span><span class="k-pcv">${ct.length ? ct.slice(0, 4).map((c) => `<span class="k-chip">${flag(c, 15)}${esc(c)}</span>`).join("") + (ch.length ? "" : `<small>（候補）</small>`) : "—"}</span></div>
        <div class="k-pcrow"><span class="k-pcl">案件</span><span class="k-pcv"><b class="k-pcn">${cs.length}</b>件${todo ? `<span class="k-tag rd">要対応 ${todo}</span>` : ""}</span></div>
        <div class="k-pcacts"><button type="button" class="k-btn k-mini" ${act(() => switchProd(i).then(() => goKey("dash:home")))}>${I("brief", 16)}案件を見る</button><button type="button" class="k-btn white k-mini" ${act(() => switchProd(i).then(() => goKey("item")))}>${I("box", 16)}商品情報</button></div>
      </section>`;
    }).join("")}</div>
    ${list.length ? "" : `<div class="k-empty">まだ商品はありません。「新しい商品を登録」から始めます。</div>`}`;
    (h ? h.after(box) : w.prepend(box));
  }
  RD.page["dash:case"] = (w) => caseView(w);
  RD.page["dash:prod"] = (w) => prodView(w);

  /* ───────── 仕上げ（rd.js の after のあと） ───────── */
  function finish() {
    if (RD.locked() || isAdmin()) return;
    const w = document.getElementById("well"); if (!w) return;
    const k = RD.curKey();
    // 案件一覧では、これまでのダッシュボードの「このページの内容」・操作の段も、いちばん下のたたんだ欄へ（アプリがあとから足し直すため毎回）
    if (k === "dash:home") { const inn = $("details.k-oldb > .rd-oldin", w); if (inn) $$(":scope > #uxsec, :scope > .ph", w).forEach((x) => inn.prepend(x)); }
    if (k === "dash:case" || k === "dash:prod") { const hold = $(":scope > .k-hold", w); if (hold) $$(":scope > #uxsec, :scope > .ph", w).forEach((x) => hold.prepend(x)); }
    slimHero(w);
    crumbNext(w, k);
    if (isJa()) { foldSubs(w); foldNotes(w); shortBtns(w); descSmall(w); }
    sideBadge();
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { finish(); } catch (e) { console.error("[rd case]", e); } return r; };
  setInterval(() => { try { if (!RD.locked() && !isAdmin()) { finish(); } } catch (e) { /* 無視 */ } }, 1500);
})();
