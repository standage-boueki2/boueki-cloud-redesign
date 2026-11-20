/* ═══ v21.99 fwd（2026-11-19 第12回相当 UAT）物流会社の画面の見せ方の層（logic_v2199fwd.js・rd_v99fwd.css のあとに読む）
   No.554 見積受信箱：行・依頼番号を押す（キーボードでも）と、その依頼の明細の窓が開く。依頼番号はボタン（「明細を開く」）。
          窓のいちばん上に「この依頼の明細」（荷主・品目・数量・重量/容積・仕向け・届いた見積・日数〔目安は目安と明記〕・期限・B/L の容積の食い違い）。
          一覧に「日数」の列（国ごと。COURIER の既定値は「目安」と分かる形）＝No.520 の受信箱の分。
   No.555 レート管理：1つだった「要確認」の札を、理由ごとの札（赤＝価格が突出／黄＝日数が既定値）に分け、理由で絞り込む・理由ごとに数える。
          相見積：価格の札を理由つきに・COURIER の日数が既定値の行に黄の札。ホーム：「要確認」の数に理由の内訳。
   No.556 メニュー：「すべての機能」を開いたら、画面を移っても開いたまま（この PC の記録が使えないブラウザでも、開いているあいだは覚える）。
          スマホの下の帯の「メニュー」を「すべて」にし、押すと「すべての機能」を開いた状態で出す（荷主・物流会社とも）。
   観察① AI の答えの末尾の「実AIは使っていません」「内蔵の計算」を、利用者に分かる1行で見せる（前の答えも、荷主側の同じ文言も）。
   観察② AI物流マンの答えを待つあいだ：何をしているか・経過秒数・目安。20秒を過ぎたら「待たずに止める」「ほかの画面で待つ（届いたら知らせる）」。
   土台・前の層の関数は控えてから包むだけ。インラインの onclick・style は書かない（イベントは document への委譲）。 */
(function () {
  "use strict";
  if (window.__v99fwdRd) return;
  window.__v99fwdRd = 1;
  const V = window.V99FWD || (window.V99FWD = { v: "21.99", err: null, errs: [], n: {} });
  const err = (k, e) => { try { const m = "rd." + k + ": " + String((e && e.message) || e).slice(0, 180); V.err = m; (V.errs = V.errs || []).push(m); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } };
  const cnt = (k) => { try { V.n[k] = (V.n[k] || 0) + 1; } catch (e) { /* 無視 */ } };
  const M = (ja, en, zh, es) => (typeof v99fM === "function" ? v99fM(ja, en, zh, es) : ja);
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const Y = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  const fwdOn = () => { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } };
  const page = () => { try { return (typeof fwdCur !== "undefined" && fwdCur) || ""; } catch (e) { return ""; } };
  const rdKey = () => { try { return window.RDX && RDX.curKey ? RDX.curKey() : page(); } catch (e) { return page(); } };
  const well = () => document.getElementById("well");
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; };

  /* ═══ No.554・No.520 見積受信箱 ═══════════════════════════════════════ */
  function inboxTable(w) {
    return [...w.querySelectorAll("table")].find((t) => { const th = t.querySelector("thead th"); return th && /受信日|Received|收到|Recibid/.test(th.textContent || ""); }) || null;
  }
  function daysCellHtml(r) {
    const D = typeof v99fReqDays === "function" ? v99fReqDays(r) : [];
    if (!D.length) return `<span class="v99fdnone">${E(M("—（見積なし）", "— (no quote)", "—（无报价）", "— (sin cotización)"))}</span>`;
    const multi = D.length > 1;
    return D.slice(0, 6).map((d) => {
      const cls = d.est ? " est" : d.def ? " def" : d.none ? " none" : "";
      const body = d.est || (d.src && d.src !== "region")
        ? `${E(typeof v97fRange === "function" ? v97fRange(d) : d.lo + "〜" + d.hi)}${E(M("日", " days", "天", " días"))}<span class="v99fdw">${E(M("（" + d.word + "）", " (" + d.word + ")"))}</span>`
        : E(d.txt);
      return `<span class="v99fdl${cls}" title="${E(d.why || "")}">${multi ? `<b>${E(d.cty)}</b>${E(M("：", ": "))}` : ""}${body}</span>`;
    }).join("") + (D.length > 6 ? `<span class="v99fdl">${E(M(`ほか ${D.length - 6}か国`, `+${D.length - 6} more`))}</span>` : "");
  }
  function paintInbox(w) {
    const t = inboxTable(w);
    if (!t) return;
    const R = (FWDB && FWDB.reqs) || [];
    /* 日数の列（見積合計の右） */
    const hr = t.querySelector("thead tr");
    if (!hr) return;
    /* 列はいちばん右に足す（前の層・スマホのカードは「◯番目の列」で見た目を決めているので、間に入れると並びが崩れる） */
    if (!hr.querySelector(":scope > th.v99fdth")) {
      const th = document.createElement("th");
      th.className = "v99fdth"; th.setAttribute("data-noi18n", "");
      th.textContent = M("日数", "Transit days", "天数", "Días");
      th.title = M("国ごとの所要日数です。小包（COURIER）で日数の登録が空欄の行は、国際宅配便の一般的な日数を「目安」と書いて出します（物流会社の確認前）。", "Transit days by country. COURIER rates with blank days show a general estimate marked “estimate”.");
      hr.appendChild(th);
    }
    [...t.querySelectorAll("tbody tr")].forEach((tr) => {
      const m = /RQ-[A-Za-z0-9]+/.exec(tr.textContent || "");
      if (!m) return;
      const r = R.find((x) => x && x.id === m[0]);
      if (!r) return;
      const id = r.id;
      /* 行と依頼番号のボタン */
      if (tr.dataset.v99rid !== id) {
        tr.dataset.v99rid = id;
        tr.classList.add("v99frow");
        tr.title = M("押すと、この依頼の明細が開きます", "Click to open the details of this request", "点击打开此请求的明细", "Pulse para abrir el detalle");
      }
      const idTd = [...tr.children].find((td) => /^\s*RQ-[A-Za-z0-9]+\s*$/.test(td.textContent || "") && !td.querySelector(".v99frid"));
      if (idTd) {
        const b = idTd.querySelector("b");
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "v99frid"; btn.setAttribute("data-v99rid", id); btn.setAttribute("data-noi18n", "");
        /* 21.99.3：番号と「Open details」の間に空白（英語・スペイン語で「RQ-…Open」とつながり、21.96・21.97 の層が依頼を見失って B/L の札が消えていた） */
        btn.innerHTML = `<b>${E(id)}</b> <span class="v99fridx">${E(M("明細を開く", "Open details", "打开明细", "Ver detalle"))}</span>`;
        if (b) b.replaceWith(btn); else { idTd.textContent = ""; idTd.appendChild(btn); }
      }
      /* 日数のセル */
      const html = daysCellHtml(r);
      const sig = hash(html);
      let td = tr.querySelector(":scope > td.v99fdtd");
      if (td && td.dataset.sig === sig) return;
      if (!td) {
        td = document.createElement("td");
        td.className = "v99fdtd"; td.setAttribute("data-lb", M("日数", "Transit days", "天数", "Días")); td.setAttribute("data-noi18n", "");
        tr.appendChild(td);
      }
      td.innerHTML = html; td.dataset.sig = sig;
    });
    cnt("inbox");
  }
  /* 行・依頼番号を押したら明細を開く */
  function openDetail(id, kb) {
    try {
      if (!id || typeof openFwdQuote !== "function") return;
      openFwdQuote(id);
      cnt("open");
      /* キーボードで開いたときは、明細の見出しへ移る（マウスのときは窓の上から） */
      [0, 160, 450].forEach((ms) => setTimeout(() => { try { paintDetail(id, !!kb && ms === 160); } catch (e) { err("det" + ms, e); } }, ms));
    } catch (e) { err("open", e); }
  }
  window.v99fOpenDetail = openDetail;
  const SKIP = "button:not(.v99frid),a,input,select,textarea,label,summary,details,[data-kterm],.k-term,[role=button],[contenteditable=true]";
  document.addEventListener("click", (ev) => {
    try {
      if (!fwdOn() || page() !== "finbox") return;
      const t = ev.target;
      if (!t || !t.closest) return;
      const b = t.closest(".v99frid");
      if (b && b.closest("#well")) { ev.preventDefault(); openDetail(b.getAttribute("data-v99rid"), ev.detail === 0); return; }
      const tr = t.closest("#well tr.v99frow[data-v99rid]");
      if (!tr) return;
      const sk = t.closest(SKIP);
      if (sk && sk !== tr && tr.contains(sk)) return;   /* 行の中のボタン・リンク・用語の説明は、それぞれの動き */
      const sel = window.getSelection && window.getSelection();
      if (sel && String(sel).trim()) return; /* 文字を選んでいるときは開かない */
      openDetail(tr.dataset.v99rid);
    } catch (e) { err("rowclick", e); }
  });

  /* 窓の「この依頼の明細」 */
  function detailHtml(D) {
    const row = (k, v) => v ? `<div class="v99fdr"><dt>${E(k)}</dt><dd>${v}</dd></div>` : "";
    const na = `<span class="v99fna">${E(M("未共有（荷主から届いていません）", "not shared yet", "未共享", "no compartido"))}</span>`;
    const qty = D.cartons ? E(M(`${D.cartons} カートン${D.pack ? "（荷姿：" + D.pack + "）" : ""}`, `${D.cartons} cartons${D.pack ? " (" + D.pack + ")" : ""}`)) : na;
    const wv = `${D.weight ? E(M(`総重量 ${D.weight.toLocaleString("ja-JP")} kg`, `gross ${D.weight} kg`)) : E(M("総重量 未共有", "weight not shared"))}${E(M("・", ", "))}${E(M(`容積 ${D.cbm} m³`, `${D.cbm} m³`))}${D.mode ? E(`（${D.mode}）`) : ""}`;
    const legs = D.legs || [];
    const legRows = legs.map((l) => {
      if (!l.ok) return `<tr><th scope="row">${E(l.cty)}</th><td colspan="4">${E(M("見積なし（この区間のレートが未登録）", "no quote (no rate for this lane)"))}</td></tr>`;
      const others = (l.offers || []).filter((o) => !o.sel);
      const oth = others.length ? `<tr class="v99fother"><td></td><td colspan="4"><small>${E(M(`ほかに届いた見積 ${others.length}社：`, `${others.length} more: `))}${others.slice(0, 6).map((o) => E(`${o.co} ${Y(o.total)}${o.days ? "・" + o.days.txt : ""}`)).join(E(M("／", " / ")))}${others.length > 6 ? E(M(` ほか ${others.length - 6}社`, ` +${others.length - 6}`)) : ""}</small></td></tr>` : "";
      const tag = l.held ? M("仮押さえ", "held") : l.co && l.co === l.rec ? M("推奨・選択中", "recommended") : l.co ? M("選択中", "selected") : "";
      const dd = l.days ? `<span class="v99fdl${l.days.est ? " est" : l.days.def ? " def" : l.days.none ? " none" : ""}">${E(l.days.txt)}</span>${l.days.delay ? `<small>${E(M(`＋情勢見込み ${l.days.delay}日`, `+${l.days.delay} days (situation)`))}</small>` : ""}${l.days.why ? `<small class="v99fwhyd">${E(l.days.why)}</small>` : ""}` : "—";
      return `<tr><th scope="row">${E(l.cty)}${l.lane ? `<br><small>${E(l.lane)}</small>` : ""}</th><td>${E(l.co || "—")}${tag ? `<br><small>${E(tag)}</small>` : ""}</td><td class="num">${E(Y(l.total))}</td><td>${dd}</td><td${l.valid && l.valid.exp ? ' class="v99fexp"' : ""}>${E(l.valid ? l.valid.txt : "—")}</td></tr>${oth}`;
    }).join("");
    let bl = "";
    const B = D.bl;
    if (B && B.A && B.A.length) {
      const so = B.A.reduce((a, x) => a + x.old, 0), sn = B.A.reduce((a, x) => a + x.neu, 0), d = Math.round(sn - so);
      bl = `<p class="v99fbl warn"><b>${E(M("容積の食い違いあり", "Volume mismatch"))}</b>${E(M(`：荷主の共有 ${B.A[0].from} m³ ／ B/L ${B.A[0].bl} m³。B/L の容積で計算すると ${Y(sn)}（今の見積 ${Y(so)} より ${d < 0 ? Y(-d) + " 安い" : d > 0 ? Y(d) + " 高い" : "同じ金額"}）。反映は「案件・出荷管理」で選べます（まだ反映していません）。`, `: shipper ${B.A[0].from} m³ / B/L ${B.A[0].bl} m³. With the B/L volume: ${Y(sn)} (now ${Y(so)}). Apply it in Cases.`))}</p><button type="button" class="btn g v99fgocase" data-v99go="fcase">${E(M("案件・出荷管理で見る", "Open in Cases"))}</button>`;
    } else if (B && B.P && B.P.length) {
      bl = `<p class="v99fbl ok"><b>${E(M("B/L の容積で反映済み", "B/L volume applied"))}</b>${E(M(`：B/L ${B.P[0].bl} m³ で計算した見積を使っています（元に戻すのは「案件・出荷管理」）。`, `: quotes use the B/L ${B.P[0].bl} m³.`))}</p>`;
    } else if (B && B.bl) {
      bl = `<p class="v99fbl">${E(M(`食い違いなし（荷主の共有 ${D.cbm} m³ ／ B/L ${B.bl} m³）`, `No mismatch (shipper ${D.cbm} m³ / B/L ${B.bl} m³)`))}</p>`;
    } else bl = `<p class="v99fbl">${E(M("B/L の情報はまだありません（案件に B/L が入ると、ここで容積を照らし合わせます）", "No B/L yet"))}</p>`;
    const due = D.task && D.task.due ? (() => { const x = D.task.due; const s = x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); return E(M(`${s}（${D.task.t}）`, `${s} (${D.task.t})`)); })() : "";
    const vs = legs.filter((l) => l.ok && l.valid && l.valid.n != null).map((l) => l.valid.n);
    const vmin = vs.length ? Math.min(...vs) : null;
    const vtxt = vmin == null ? "" : vmin < 0 ? E(M("期限切れの見積があります（下の表の「有効期限」）", "Some quotes have expired")) : E(M(`いちばん早い見積の有効期限まで あと${vmin}日`, `${vmin} days until the earliest quote expires`));
    return `<section class="v99fdet" data-v99rid="${E(D.id)}" data-noi18n aria-labelledby="v99fdeth">
      <h3 id="v99fdeth" tabindex="-1">${E(M(`この依頼の明細（${D.id}）`, `Request details (${D.id})`, `此请求的明细（${D.id}）`, `Detalle de la solicitud (${D.id})`))}</h3>
      <dl class="v99fdl2">
        ${row(M("受信日", "Received"), E(D.d))}
        ${row(M("荷主", "Shipper"), E(D.co))}
        ${row(M("品目", "Item"), D.item ? E(D.item + (D.cat ? "（" + D.cat + "）" : "")) : na)}
        ${row(M("数量", "Quantity"), qty)}
        ${row(M("重量・容積", "Weight / volume"), wv)}
        ${D.cargo ? row(M("荷主から共有された貨物", "Cargo shared by the shipper"), E(D.cargo)) : ""}
        ${row(M("仕出 → 仕向け", "From → to"), E(`${D.pol} → ${D.cty}${D.pod && D.pod !== D.cty ? "（" + D.pod + "）" : ""}`))}
        ${row(M("条件", "Terms"), E(D.term || "—"))}
        ${row(M("出荷予定日（ETD）", "ETD"), D.etd ? E(D.etd) : na)}
        ${row(M("期限", "Deadlines"), [vtxt, due ? E(M("対応の期限：", "Action due: ")) + due : ""].filter(Boolean).join("<br>") || E(M("—", "—")))}
        ${row(M("状況", "Status"), E(D.status + (D.done ? M("・完了", " · done") : D.who ? M("・担当 ", " · owner ") + D.who : M("・未担当", " · unassigned"))))}
        ${D.requote ? row(M("再見積", "Re-quote"), E(M(`元の依頼 ${D.parentId}${D.note ? "・要望：" + String(D.note).slice(0, 80) : ""}`, `from ${D.parentId}`))) : ""}
      </dl>
      <h4>${E(M("届いた見積（国ごと）", "Quotes received (by country)", "收到的报价（按国家）", "Cotizaciones recibidas (por país)"))}</h4>
      ${legs.length ? `<div class="tw"><table class="v99fdtbl"><thead><tr><th scope="col">${E(M("国", "Country"))}</th><th scope="col">${E(M("会社", "Company"))}</th><th scope="col" class="num">${E(M("金額", "Amount"))}</th><th scope="col">${E(M("日数", "Days"))}</th><th scope="col">${E(M("有効期限", "Valid until"))}</th></tr></thead><tbody>${legRows}</tbody></table></div>` : `<p class="v99fbl">${E(M("まだ見積がありません", "No quotes yet"))}</p>`}
      <p class="v99fnote">${E(M("日数の「目安」は、小包（COURIER）で日数の登録が空欄のレートに、国際宅配便の一般的な日数を出したものです（物流会社の確認前）。「既定値」は登録のとき日数が空欄で 10日 を入れた値です。", "“estimate” = general express days for COURIER rates with blank days (not confirmed). “default” = 10 days filled in when blank."))}</p>
      <h4>${E(M("B/L の容積", "B/L volume"))}</h4>${bl}
    </section>`;
  }
  function paintDetail(id, focus) {
    if (!fwdOn()) return;
    const body = document.querySelector("#dw .dwbody, .dwbody");
    if (!body) return;
    const D = typeof v99fReqDetail === "function" ? v99fReqDetail(id) : null;
    if (!D) return;
    const html = detailHtml(D);
    const sig = hash(html);
    let el = body.querySelector(":scope > .v99fdet");
    if (el && el.dataset.sig === sig) { if (focus) focusDet(el); return; }
    if (el) el.remove();
    body.insertAdjacentHTML("afterbegin", html);
    el = body.querySelector(":scope > .v99fdet");
    if (el) { el.dataset.sig = sig; if (focus) focusDet(el); }
    cnt("detail");
  }
  function focusDet(el) { try { const h = el.querySelector("h3"); const sc = el.closest(".dwbody") || el.parentElement; if (sc) sc.scrollTop = 0; if (h) h.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }
  if (typeof openFwdQuote === "function") {
    const __oq99r = openFwdQuote;
    openFwdQuote = function (id) {
      const o = __oq99r.apply(this, arguments);
      try { if (fwdOn() && id) { paintDetail(id, false); setTimeout(() => { try { paintDetail(id, false); } catch (e) { err("oq2", e); } }, 140); } } catch (e) { err("oq", e); }
      return o;
    };
  }
  document.addEventListener("click", (ev) => {
    try { const b = ev.target && ev.target.closest && ev.target.closest("[data-v99go]"); if (!b) return; ev.preventDefault(); try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } if (window.RDX && RDX.goKey) RDX.goKey(b.getAttribute("data-v99go")); } catch (e) { err("go", e); }
  });

  /* ═══ No.555 レート管理：理由ごとの札・絞り込み・数 ═══════════════════ */
  const WHYF = { f: "" };
  const pill = (x) => `<span class="v99fwhy ${x.k === "price" ? "price" : "days"}" data-noi18n title="${E(x.k === "price" ? M(`同じ輸送の形・単位の有効期限内のレートの中央値（${Y(x.med)}${x.unit}・${x.n}本）と比べています。単位や桁の入れ間違いがないか確かめてください。`, `Compared with the median ${Y(x.med)}${x.unit} of ${x.n} valid rates`) : (typeof v96fTtWhy === "function" ? v96fTtWhy(x.kind) : ""))}">${E(x.label)}</span>`;
  function paintRates(w) {
    const t = [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]"));
    if (!t) return;
    const A = typeof v99fRateWhyAll === "function" ? v99fRateWhyAll() : { by: {} };
    [...t.querySelectorAll("tbody tr")].forEach((tr) => {
      const del = tr.querySelector("[data-frdel]");
      if (!del) return;
      const i = +del.dataset.frdel, W = A.by[i] || [];
      const want = W.map((x) => x.k + ":" + x.label).join("|");
      /* 21.99.3：値が変わったときだけ書く（毎回書くと見張りどうしで書き換えが回り続けた・11/20 回帰の洗い出し K09） */
      const why = W.map((x) => x.k).join(" ");
      if (tr.dataset.v99why !== why) tr.dataset.v99why = why;
      const old = tr.querySelectorAll(".v90fchk");
      if ((tr.dataset.v99ws || "") === want && (!W.length || [...old].every((o) => o.hidden))) return;
      tr.dataset.v99ws = want;
      tr.querySelectorAll(".v99fwhyw").forEach((x) => x.remove());
      if (!W.length) return;
      old.forEach((o) => { o.hidden = true; const br = o.previousElementSibling; if (br && br.tagName === "BR") br.hidden = true; });
      const pc = (old[0] && old[0].parentElement) || tr.children[3] || tr.lastElementChild;
      pc.insertAdjacentHTML("beforeend", `<span class="v99fwhyw">${W.map(pill).join("")}</span>`);
    });
    /* 絞り込みと数 */
    const tw = t.closest(".tw") || t;
    const html = A.any ? `<div class="v99fwhybar" data-noi18n role="group" aria-label="${E(M("要確認の理由で絞り込む", "Filter by reason"))}">
        <span class="v99fwhyt">${E(M(`要確認 ${A.any}本の理由：`, `${A.any} rows to check: `, `需确认 ${A.any} 行的原因：`, `${A.any} filas por revisar: `))}<b class="v99fwhy price">${E(M(`価格が突出 ${A.price}本`, `price outlier ${A.price}`, `价格异常 ${A.price}`, `precio atípico ${A.price}`))}</b><b class="v99fwhy days">${E(M(`日数が既定値 ${A.days}本`, `default days ${A.days}`, `默认天数 ${A.days}`, `días por defecto ${A.days}`))}</b>${A.both ? `<small>${E(M(`（両方の行 ${A.both}本）`, `(${A.both} with both)`))}</small>` : ""}</span>
        <span class="v99fwhyb">${[["", M("すべての行", "All rows", "全部", "Todas")], ["price", M("価格が突出だけ", "Price outliers", "仅价格异常", "Solo precio")], ["days", M("日数が既定値だけ", "Default days", "仅默认天数", "Solo días")]].map(([k, l]) => `<button type="button" class="v99fwhyx${WHYF.f === k ? " on" : ""}" data-v99whyf="${k}" aria-pressed="${WHYF.f === k}">${E(l)}</button>`).join("")}</span>
        <small class="v99fwhyn">${E(M("赤の札＝運賃が同じ輸送の形・単位の中央値の5倍以上（または5分の1以下）。黄の札＝日数の登録が空欄で 10日 が入ったまま（価格は中央値の範囲）。", "Red = price 5× or more (or 1/5 or less) of the median. Yellow = transit days left at the default 10 days."))}</small></div>` : "";
    const ob = tw.parentElement && tw.parentElement.querySelector(":scope > .v99fwhybar");
    const sig = hash(html);
    if (!html) { if (ob) ob.remove(); }
    else if (!ob || ob.dataset.sig !== sig) { if (ob) ob.remove(); tw.insertAdjacentHTML("beforebegin", html); const nb = tw.parentElement && tw.parentElement.querySelector(":scope > .v99fwhybar"); if (nb) nb.dataset.sig = sig; }
    applyWhyF(t);
    cnt("rates");
  }
  function applyWhyF(t) {
    [...t.querySelectorAll("tbody tr")].forEach((tr) => {
      if (!tr.querySelector("[data-frdel]")) return;
      const off = !!WHYF.f && !(tr.dataset.v99why || "").split(" ").includes(WHYF.f);
      if (tr.classList.contains("v99fwhyoff") !== off) tr.classList.toggle("v99fwhyoff", off);
    });
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v99whyf]");
      if (!b) return;
      ev.preventDefault();
      const prevF = WHYF.f;
      WHYF.f = b.getAttribute("data-v99whyf") || "";
      /* 期限切れでたたんだ行も、理由で絞るときは開く（21.89 の札と同じ）
         21.99.3：絞り込む前の「期限切れの行をたたんでいたか」を覚え、「すべての行」に戻したら元どおりにたたむ（11/20 回帰の洗い出し K05） */
      if (WHYF.f && !prevF) { try { WHYF.exp0 = typeof v89fShowGet === "function" ? !!v89fShowGet() : null; } catch (e) { WHYF.exp0 = null; } }
      if (WHYF.f && typeof window.v89fShowExpired === "function") { try { window.v89fShowExpired(true); } catch (e) { /* 無視 */ } }
      else if (!WHYF.f && prevF) { if (WHYF.exp0 === false && typeof window.v89fShowExpired === "function") { try { window.v89fShowExpired(false); } catch (e) { /* 無視 */ } } WHYF.exp0 = null; }
      const w = well(); if (!w) return;
      w.querySelectorAll("[data-v99whyf]").forEach((x) => { const on = (x.getAttribute("data-v99whyf") || "") === WHYF.f; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); });
      const t = [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]"));
      if (t) applyWhyF(t);
      cnt("whyf");
    } catch (e) { err("whyf", e); }
  });
  /* 相見積：価格の札に理由・COURIER の日数が既定値の行に黄の札 */
  function paintAgg(w) {
    const h = [...w.querySelectorAll("h3")].find((x) => /^(レーン別の集計とAI物流マンの推奨|Lane summary & AI pick)/.test((x.textContent || "").trim()));
    if (!h) return;
    const card = h.closest(".c") || h.parentElement;
    if (!card) return;
    const R = (FWDB && FWDB.rates) || [];
    const F = typeof v95miscLaneFlags === "function" ? v95miscLaneFlags() : {};
    let np = 0, nd = 0;
    card.querySelectorAll("tbody tr").forEach((tr) => {
      const pm = tr.cells[0] && tr.cells[0].querySelector(".p");
      const mode = String((pm && pm.textContent) || "").trim().toUpperCase();
      const pod = tr.dataset.v95pod || ((tr.cells[0] && tr.cells[0].querySelector("b")) || {}).textContent || "";
      /* 価格 */
      const box = tr.querySelector(".k-v95lchk");
      const f = F[String(pod).trim() + "|" + mode];
      if (box && f) {
        const o = (f.flags || []).find((x) => x.t === "out");
        const b = box.querySelector(".k-v95lbad");
        const lab = o ? (+o.p >= +o.med ? M(`要確認：価格が突出（中央値の約${o.x}倍）`, `Check: price outlier (about ${o.x}× the median)`) : M(`要確認：価格が低すぎ（中央値の約${Math.round(+o.med / Math.max(1, +o.p))}分の1）`, `Check: price too low`)) : M("確認：同じ運賃が複数の国", "Note: same price in several countries");
        if (b && b.dataset.v99 !== lab) {
          const sv = b.querySelector("svg");
          b.textContent = ""; if (sv) b.appendChild(sv); b.appendChild(document.createTextNode(lab));
          b.dataset.v99 = lab; b.classList.toggle("v99fpricebad", !!o); b.classList.toggle("v99fsame", !o);
        }
        if (o) np++;
      }
      /* 日数（COURIER の既定値） */
      if (!/COURIER/.test(mode)) return;
      const Rs = R.filter((r) => r && r.pod === String(pod).trim() && /COURIER/i.test(String(r.mode || "")) && (typeof v97fValid !== "function" || v97fValid(r)));
      const W = Rs.map((r) => (typeof v99fRateWhy === "function" ? v99fRateWhy(r, R) : []).find((x) => x.k === "days")).filter(Boolean);
      const cell = tr.cells[3];
      if (!cell) return;
      let sp = cell.querySelector(".v99fwhyw");
      if (!W.length) { if (sp) sp.remove(); return; }
      nd++;
      const html = pill(W[0]);
      if (sp && sp.dataset.sig === hash(html)) return;
      if (!sp) { sp = document.createElement("span"); sp.className = "v99fwhyw"; cell.appendChild(sp); }
      sp.innerHTML = html; sp.dataset.sig = hash(html);
    });
    const tw = card.querySelector(".tw") || card.querySelector("table");
    if (!tw) return;
    const html = (np || nd) ? `<p class="v99faggwhy" data-noi18n>${E(M("要確認の理由：", "Reasons: "))}<b class="v99fwhy price">${E(M(`価格が突出 ${np}レーン`, `price outlier ${np}`))}</b><b class="v99fwhy days">${E(M(`日数が既定値 ${nd}レーン`, `default days ${nd}`))}</b><small>${E(M("（赤＝運賃が中央値から外れている／黄＝日数の登録が空欄で 10日 のまま。見積・AI の答えでは目安の日数を使います）", "(red = price off the median / yellow = days left at default)"))}</small></p>` : "";
    const ob = tw.parentElement && tw.parentElement.querySelector(":scope > .v99faggwhy");
    if (!html) { if (ob) ob.remove(); return; }
    if (ob && ob.dataset.sig === hash(html)) return;
    if (ob) ob.remove();
    tw.insertAdjacentHTML("beforebegin", html);
    const nb = tw.parentElement && tw.parentElement.querySelector(":scope > .v99faggwhy");
    if (nb) nb.dataset.sig = hash(html);
    cnt("agg");
  }
  /* ホーム・受信箱の上の数：「要確認」の理由の内訳 */
  function paintCounts(w) {
    const A = typeof v99fAutoWhy === "function" ? v99fAutoWhy() : null;
    const RV = typeof v99fRvWhy === "function" ? v99fRvWhy() : null;
    /* AI回答 N件のうち 要確認 M件 */
    w.querySelectorAll(".v95auto2").forEach((s2) => {
      if (!A || !A.warn) { const o = s2.parentElement && s2.parentElement.querySelector(":scope > .v99fwhyn"); if (o) o.remove(); return; }
      const parts = [A.exp ? M(`期限切れのレート ${A.exp}件`, `expired rate ${A.exp}`) : "", A.port ? M(`仕出港が違う見積 ${A.port}件`, `other origin port ${A.port}`) : ""].filter(Boolean);
      const t = M(`理由：${parts.join("・")}${A.exp && A.port ? "（重なりあり）" : ""}`, `Reasons: ${parts.join(", ")}`);
      let n = s2.parentElement && s2.parentElement.querySelector(":scope > .v99fwhyn");
      if (n && n.textContent === t) return;
      if (!n) { n = document.createElement("span"); n.className = "rd-ts v99fwhyn"; n.setAttribute("data-noi18n", ""); s2.after(n); }
      n.textContent = t;
    });
    /* 依頼の「要確認」（AIが見積を出せなかった依頼） */
    w.querySelectorAll('[data-v92ov="rv"], [data-v70fgo="rv"]').forEach((tile) => {
      if (!RV) return;
      const t = RV.rv ? M(`理由：レートが無い区間 ${RV.nolane}件`, `Reason: no rate for the lane (${RV.nolane})`) : "";
      let n = tile.querySelector(".v99fwhyn");
      if (!t) { if (n) n.remove(); return; }
      if (n && n.textContent === t) return;
      if (!n) {
        n = document.createElement(tile.hasAttribute("data-v70fgo") ? "small" : "span");
        n.className = tile.hasAttribute("data-v70fgo") ? "v99fwhyn v99fwhyv70" : "rd-ts v99fwhyn"; n.setAttribute("data-noi18n", "");
        if (tile.hasAttribute("data-v70fgo")) { const lb = tile.querySelector(":scope > span"); (lb || tile).appendChild(n); }
        else { const sp = tile.querySelector(".rd-ts:last-of-type") || tile.querySelector(".rd-tn"); (sp ? sp.parentElement : tile).appendChild(n); }
      }
      n.textContent = t;
    });
  }

  /* ═══ 観察① AI の答えの「実AIは使っていません」「内蔵の計算」 ═══════════ */
  const TRIG = /内蔵の計算|実\s*AI|no live AI|利用者が止めました|エンジン：内蔵|内蔵エンジン[）)]?で答え|接続AI|待たずに止めた|につながらなかった/;
  function basisSweep() {
    if (typeof v99fBasisTxt !== "function") return;
    document.querySelectorAll("#well, #pn, #dw, #aiside, .rd-aip, #rp, .rpanel, [role=dialog]").forEach((root) => {
      if (!root || !TRIG.test(root.textContent || "")) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const L = [];
      while (tw.nextNode()) { const n = tw.currentNode; if (TRIG.test(n.data)) L.push(n); }
      L.forEach((n) => { if (n.parentElement && n.parentElement.closest("textarea,input,script,style")) return; const y = v99fBasisTxt(n.data); if (y !== n.data) { n.data = y; cnt("basis"); } });
    });
  }

  /* ═══ 観察② AI物流マンの答えを待つあいだ ═══════════════════════════════ */
  let tick = 0;
  function waitHtml(A) {
    const sec = Math.max(0, Math.round((Date.now() - A.t0) / 1000));
    const nR = ((FWDB && FWDB.rates) || []).length, nQ = ((FWDB && FWDB.reqs) || []).length;
    const st = (on, done, t) => `<li class="${done ? "done" : on ? "now" : ""}">${E(t)}</li>`;
    const ai = A.calls > 0;
    const steps = `<ol class="v99fsteps">${st(false, true, M("質問を受け取りました", "Question received"))}${st(!ai, ai, M(`貴社の登録データ（レート ${nR}本・見積依頼 ${nQ}件）を読み込み`, `Reading your data (${nR} rates, ${nQ} requests)`))}${st(ai && !A.retry, false, M("AI に質問を送り、答えを待っています", "Waiting for the AI's answer"))}${A.retry ? st(true, false, M("答えが長く途中で切れたため、AI が書き直しています（2回目）", "The answer was cut off; the AI is rewriting it (2nd try)")) : ""}</ol>`;
    const slow = sec >= 90 ? M("時間がかかっています（AI の混雑や接続の影響のことがあります）。", "This is taking long (AI busy or connection).") : "";
    const act = sec >= 20 ? `<div class="v99fwaitact"><button type="button" class="btn g" data-v99ask="stop">${E(M("待たずに止める（登録データから答える）", "Stop waiting (answer from your data)", "停止等待（用登记数据回答）", "Dejar de esperar"))}</button><button type="button" class="btn g" data-v99ask="later"${A.later ? " disabled" : ""}>${E(A.later ? M("届いたら知らせます（ほかの画面へ移れます）", "We'll let you know") : M("ほかの画面で待つ（届いたら知らせる）", "Wait elsewhere (notify me)", "在其他画面等待（到达时通知）", "Esperar en otra pantalla"))}</button><small>${E(M("止めると、AI の答えを待たずに、貴社の登録データから計算した答えをすぐ出します（AI をもう一度呼ぶことはありません。送った質問は AI の回数に数えられることがあります）。", "Stopping shows an answer calculated from your data right away (no new AI call)."))}</small></div>` : "";
    return `<span class="av">AI</span><div class="bb" data-noi18n><b>${E(M("AI物流マンが答えを作っています", "The AI Logistics Agent is preparing an answer", "AI物流专员正在生成回答", "El agente logístico IA está preparando la respuesta"))}</b>${steps}<p class="v99ftime"><span class="v99fsec">${E(M(`経過 ${sec}秒`, `${sec}s elapsed`, `已过 ${sec} 秒`, `${sec} s`))}</span>${E(M("・目安は 20秒〜2分（AI が混んでいると長くなります）。", " · usually 20 s–2 min (longer when the AI is busy)."))}${E(slow)}</p>${act}</div>`;
  }
  function askPaint() {
    try {
      const A = V.ask;
      const box = document.getElementById("fwdchat");
      const old = box && box.querySelector(".v99fwait");
      if (!A || A.done || !box || page() !== "fai") { if (old) old.remove(); return; }
      if (Date.now() - A.t0 < 700) return;   /* すぐ答えが出る質問（登録データの答え）では出さない */
      const html = waitHtml(A);
      const sig = hash(html.replace(/\d+秒|\d+s|\d+ 秒|\d+ s/g, ""));
      if (old && old.dataset.sig === sig) { const s = old.querySelector(".v99fsec"); const sec = Math.max(0, Math.round((Date.now() - A.t0) / 1000)); const t = M(`経過 ${sec}秒`, `${sec}s elapsed`, `已过 ${sec} 秒`, `${sec} s`); if (s && s.textContent !== t) s.textContent = t; return; }
      if (old) old.remove();
      box.insertAdjacentHTML("beforeend", `<div class="m a v99fwait" role="status" aria-live="polite">${html}</div>`);
      const nw = box.querySelector(".v99fwait");
      if (nw) nw.dataset.sig = sig;
      box.scrollTop = box.scrollHeight;
    } catch (e) { err("askpaint", e); }
  }
  window.v99fAskPaint = function () { askPaint(); if (!tick) tick = setInterval(() => { if (!V.ask) { clearInterval(tick); tick = 0; askPaint(); return; } askPaint(); }, 1000); };
  window.v99fAskDone = function (A) {
    try {
      const old = document.querySelector("#fwdchat .v99fwait"); if (old) old.remove();
      if (tick) { clearInterval(tick); tick = 0; }
      if (A && (A.later || page() !== "fai") && fwdOn() && (Date.now() - A.t0) > 1500) notice(A);
    } catch (e) { err("askdone", e); }
  };
  function notice(A) {
    document.querySelectorAll(".v99fnotice").forEach((x) => x.remove());
    const d = document.createElement("div");
    d.className = "v99fnotice"; d.setAttribute("role", "status"); d.setAttribute("data-noi18n", "");
    d.innerHTML = `<span>${E(M(`AI物流マンの答えが届きました：「${String(A.q).slice(0, 40)}${String(A.q).length > 40 ? "…" : ""}」`, `The AI Logistics Agent answered: “${String(A.q).slice(0, 40)}”`))}</span><button type="button" class="btn" data-v99ask="open">${E(M("答えを見る", "View answer", "查看回答", "Ver respuesta"))}</button><button type="button" class="v99fnotice-x" aria-label="${E(M("閉じる", "Close"))}">×</button>`;
    document.body.appendChild(d);
    d.querySelector(".v99fnotice-x").addEventListener("click", () => d.remove());
    setTimeout(() => { try { d.remove(); } catch (e) { /* 無視 */ } }, 45000);
    cnt("notice");
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v99ask]");
      if (!b) return;
      ev.preventDefault();
      const a = b.getAttribute("data-v99ask");
      if (a === "stop") { if (typeof v99fAskStop === "function") v99fAskStop(); askPaint(); }
      else if (a === "later") { if (typeof v99fAskLater === "function") v99fAskLater(); askPaint(); try { if (typeof toast === "function") toast(M("答えが届いたら、画面の右下でお知らせします。ほかの画面へ移っても大丈夫です。", "We'll notify you when the answer arrives.")); } catch (e) { /* 無視 */ } }
      else if (a === "open") { document.querySelectorAll(".v99fnotice").forEach((x) => x.remove()); if (window.RDX && RDX.goKey) RDX.goKey("fai"); setTimeout(() => { const c = document.getElementById("fwdchat"); if (c) c.scrollTop = c.scrollHeight; }, 200); }
    } catch (e) { err("askclick", e); }
  });

  /* ═══ No.556 メニュー（「すべての機能」の開閉を覚える・スマホの「すべて」） ═══ */
  const NAV = { open: null };
  try { const v = sessionStorage.getItem("v99f_navall"); if (v === "1" || v === "0") NAV.open = v === "1"; } catch (e) { /* 使えないブラウザ */ }
  try { if (NAV.open == null) { const v = localStorage.getItem("rd_navall"); if (v === "1" || v === "0") NAV.open = v === "1"; } } catch (e) { /* 使えないブラウザ */ }
  const navSet = (v) => { NAV.open = !!v; try { sessionStorage.setItem("v99f_navall", v ? "1" : "0"); } catch (e) { /* 無視 */ } try { localStorage.setItem("rd_navall", v ? "1" : "0"); } catch (e) { /* 無視 */ } };
  function navFix() {
    try {
      const all = document.querySelector("#rdside .rd-all");
      if (!all || NAV.open !== true || all.classList.contains("open")) return;
      all.classList.add("open");
      const h = all.querySelector(".rd-allh"); if (h) h.setAttribute("aria-expanded", "true");
      const b = all.querySelector(".rd-allb"); if (b) b.hidden = false;
      all.querySelectorAll(".rd-here").forEach((x) => x.remove());
      const bd = h && h.querySelector(".rd-bdg"); if (bd) bd.remove();
      cnt("navFix");
    } catch (e) { err("navfix", e); }
  }
  /* 「すべての機能」の見出しを押した＝押す前の見た目の逆を覚える（記録が使えないブラウザでも）
     21.99.3（11/20 大森さん「押しても閉じない」）：元の rd.js の onSide も同じクリックで rd_navall を逆にするため、
     ここで覚えたあとに元の処理が走ると2回ひっくり返って閉じなかった。開け閉めはここで1回だけ行い、元の処理には渡さない */
  document.addEventListener("click", (ev) => {
    try {
      const f = ev.target && ev.target.closest && ev.target.closest("#rdside [data-rdall]");
      if (!f) return;
      ev.stopPropagation();
      ev.preventDefault();
      const all = document.querySelector("#rdside .rd-all");
      const was = !!(all && all.classList.contains("open"));
      navSet(f.classList.contains("rd-here") ? true : !was);
      if (window.RDX && typeof RDX.buildSide === "function") RDX.buildSide();
      navFix();
      const h = document.querySelector("#rdside .rd-allh");
      if (h) { try { h.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }
      cnt("navToggle");
    } catch (e) { err("navclick", e); }
  }, true);
  /* スマホの下の帯：「メニュー」→「すべて」（押すと「すべての機能」を開いたメニュー） */
  function tabFix() {
    try {
      const tb = document.querySelector('#tabbar [data-tb="menu"]');
      if (!tb) return;
      const l = tb.querySelector(".tbl");
      const want = M("すべて", "All", "全部", "Todo");
      if (l && l.textContent !== want) { l.textContent = want; l.setAttribute("data-noi18n", ""); }
      const ti = M("すべての機能（メニュー）を開く", "Open all features (menu)", "打开全部功能（菜单）", "Abrir todas las funciones (menú)");
      if (tb.title !== ti) tb.title = ti;
      if (!tb.dataset.v99) { tb.dataset.v99 = "1"; tb.setAttribute("aria-haspopup", "true"); }
    } catch (e) { err("tabfix", e); }
  }
  document.addEventListener("click", (ev) => {
    try {
      const tb = ev.target && ev.target.closest && ev.target.closest('#tabbar [data-tb="menu"]');
      if (!tb) return;
      navSet(true);
      setTimeout(() => {
        try {
          if (window.RDX && typeof RDX.buildSide === "function") RDX.buildSide();
          navFix();
          if (document.body.classList.contains("snav") || document.body.classList.contains("navopen")) {
            const h = document.querySelector("#rdside .rd-allh");
            if (h) { h.scrollIntoView({ block: "start" }); try { h.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }
          }
        } catch (e) { err("tabopen", e); }
      }, 0);
      cnt("tabAll");
    } catch (e) { err("tabclick", e); }
  }, true);
  try {
    const sideMo = new MutationObserver(() => { navFix(); });
    const hook = () => { const s = document.getElementById("rdside"); if (s && !s.dataset.v99mo) { s.dataset.v99mo = "1"; sideMo.observe(s, { childList: true }); navFix(); } const t = document.getElementById("tabbar"); if (t && !t.dataset.v99mo) { t.dataset.v99mo = "1"; new MutationObserver(tabFix).observe(t, { childList: true }); tabFix(); } };
    hook();
    new MutationObserver(hook).observe(document.body, { childList: true });
  } catch (e) { err("navmo", e); }

  /* ═══ 描き直しのたびに ═══════════════════════════════════════════════ */
  function paint() {
    try { basisSweep(); } catch (e) { err("basis", e); }
    try { navFix(); tabFix(); } catch (e) { err("nav", e); }
    try {
      if (!fwdOn()) return;
      const w = well();
      if (!w) return;
      const pg = page(), k = rdKey();
      if (k === "fhome" || pg === "finbox") paintCounts(w);
      if (k === "finbox") paintInbox(w);
      else if (pg === "frates") paintRates(w);
      else if (pg === "fagg") paintAgg(w);
      else if (pg === "fai") askPaint();
    } catch (e) { err("paint", e); }
  }
  window.v99fRepaint = paint;
  if (typeof fwdRender === "function") {
    const __fr99r = fwdRender;
    fwdRender = function () { const o = __fr99r.apply(this, arguments); paint(); return o; };
  }
  try {
    let t = 0;
    const mo = new MutationObserver(() => {
      if (t) return;
      t = setTimeout(() => { t = 0; paint(); try { mo.takeRecords(); } catch (e) { /* 無視 */ } }, 80);
    });
    const hookW = () => { const w0 = well(); if (w0 && !w0.dataset.v99mo) { w0.dataset.v99mo = "1"; mo.observe(w0, { childList: true, subtree: true }); } const pn = document.getElementById("dw"); if (pn && !pn.dataset.v99mo) { pn.dataset.v99mo = "1"; mo.observe(pn, { childList: true, subtree: true }); } };
    hookW();
    setInterval(hookW, 1500);
    /* 観察①の言い換えは、どこに答えが出ても（荷主の AI 相談・右のパネル・窓）すぐに（画面全体を見張り、文字だけ確かめる） */
    let tb = 0;
    const moB = new MutationObserver(() => {
      if (tb) return;
      tb = setTimeout(() => { tb = 0; try { basisSweep(); } catch (e) { err("basismo", e); } try { moB.takeRecords(); } catch (e) { /* 無視 */ } }, 60);
    });
    moB.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (e) { err("mo", e); }
  try { if (window.RDX && typeof RDX.after === "function") { const prev = RDX.after; RDX.after = function () { const r = prev.apply(this, arguments); try { paint(); } catch (e) { err("after", e); } return r; }; } } catch (e) { err("afterwrap", e); }
  setTimeout(paint, 0);
})();
