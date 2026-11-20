/* ═══ 22.00 分野 adm の見せ方（刷新版の管理コンソール）：
   No.524 同期中は台帳の行も出さない（同期前の控えは押したときだけ・時点つき）／No.607 台帳の重なりをまとめて見せる（データは消さない）／
   No.606 累計「AI 質問」と今日のサーバーの回数の数え方・食い違いの印／No.557 アカウントごとの今日のトークン（上限・残り）／
   No.528 CS 横断の前の結果・かかった時間・端末の控えの行／No.501 体験用の共通コードは名前を確かめない（自己申告）の説明。
   中身は logic_v2200adm.js（V100ADM）。前の層（v96 の v63aCardHtml の行の「利用量」・v99 の表の注記・v90 の重なりの印）を控えてから包む／
   描いたあとに足す。onclick= と style= は書かない（押す所は委譲の addEventListener）。何度描いても同じ結果になるよう、印（data-v100*）で確かめる。 */
(function () {
  if (typeof V100ADM === "undefined") return;
  const E = (s) => v100admE(s);
  const M = (ja, en, zh, es) => v100admM(ja, en, zh, es);
  const F = (n) => v100admF(n);
  const HMS = (t) => v100admHms(t);
  const err = (k, e) => v100admErr("rd " + k, e);
  const LID = (c) => v100admIsLid(c);

  /* ══════════ No.557 AI 接続の表：行ごとの今日のトークン（上限・残り） ══════════ */
  function tokTxt(a) {
    const u = +a.tokUsed || 0, c = +a.tokCap || 0;
    if (!(c > 0)) return M(`今日のトークン ${F(u)}（上限なし）`, `Tokens today ${F(u)} (no limit)`, `今天的 token ${F(u)}（无上限）`, `Tokens hoy ${F(u)} (sin límite)`);
    const pct = (Math.round(u / c * 1000) / 10).toFixed(1);
    if (u >= c) return M(`今日のトークン ${F(u)}／上限 ${F(c)}（上限に届きました・${pct}%。0時まで、このアカウントは内蔵エンジンで答えます）`, `Tokens today ${F(u)} / limit ${F(c)} (limit reached, ${pct}%; built-in engine answers until midnight)`, `今天的 token ${F(u)}／上限 ${F(c)}（已达上限・${pct}%；0 点前由内置引擎回答）`, `Tokens hoy ${F(u)} / límite ${F(c)} (límite alcanzado, ${pct}%; responde el motor integrado hasta medianoche)`);
    return M(`今日のトークン ${F(u)}／上限 ${F(c)}（残り ${F(c - u)}・${pct}%）`, `Tokens today ${F(u)} / limit ${F(c)} (${F(c - u)} left, ${pct}%)`, `今天的 token ${F(u)}／上限 ${F(c)}（剩余 ${F(c - u)}・${pct}%）`, `Tokens hoy ${F(u)} / límite ${F(c)} (quedan ${F(c - u)}, ${pct}%)`);
  }
  function tokNote(R) {
    const n = (R.accts || []).filter((a) => a && +a.tokCap > 0).length;
    return `<p class="v100adm-toknote" id="v100admTok" data-noi18n>${E(M(`🔢 各行の「今日のトークン」は、同期サーバーの今日の記録（そのアカウントの入力＋出力のトークン）です。上限は共通・デモ用のコードは「デモ用」、ほかは「1アカウント」の値で、お客様の画面の「利用量 %」と同じ数です（同じ時刻に見れば同じ）。回数（今日／上限）とトークンの、先に届いた方で止まります。${n ? "" : "（いま、トークンの記録があるアカウントはありません）"}`,
      `🔢 “Tokens today” on each row is the sync server's record for today (input + output tokens of that account). The limit is the “demo” value for shared/demo codes and the “per account” value otherwise — the same number as “usage %” on the customer's screen (same time, same number). AI stops at whichever comes first: request count or tokens.`,
      `🔢 各行的“今天的 token”是同步服务器今天的记录（该账户输入＋输出的 token）。共用・演示代码的上限为“演示用”值，其他为“每个账户”值，与客户画面的“使用量 %”相同（同一时刻相同）。次数与 token 先到者为准。`,
      `🔢 «Tokens hoy» en cada fila es el registro de hoy del servidor (tokens de entrada + salida de esa cuenta). El límite es el valor «demo» para códigos compartidos/demo y «por cuenta» para el resto; es el mismo número que «uso %» en la pantalla del cliente. La IA se detiene con lo que llegue primero: solicitudes o tokens.`))}</p>`;
  }
  if (typeof v63aCardHtml === "function") {
    const __ah100 = v63aCardHtml;
    v63aCardHtml = function () {   // eslint-disable-line no-global-assign
      let h = __ah100.apply(this, arguments);
      try {
        const R = (typeof V63A !== "undefined" && V63A && V63A.adm) || null;   // eslint-disable-line no-undef
        if (typeof h !== "string" || !R || h.indexOf("data-v100tok") >= 0) return h;
        (R.accts || []).forEach((a) => {
          if (!a || !a.kid || !(+a.tokCap > 0 || a.tokUsed != null)) return;
          const kid = String(a.kid).replace(/[^0-9a-zA-Z]/g, "");
          const s = `<small class="v100adm-tokrow" data-noi18n data-v100tok="${E(+a.tokUsed || 0)}">${E(tokTxt(a))}</small>`;
          const re = new RegExp(`(<tr data-v63a="${kid}">[\\s\\S]*?)<small class="v96adm-tokrow"[^>]*>[\\s\\S]*?</small>`);
          if (re.test(h)) h = h.replace(re, (m0, x) => x + s);
          else h = h.replace(new RegExp(`(<tr data-v63a="${kid}">[\\s\\S]*?<td style="white-space:nowrap">[\\s\\S]*?)(</td>)`), (m0, x, y) => x + "<br>" + s + y);
        });
        const k = '<div class="tw" style="max-height:none;margin-top:8px">';
        const i = h.lastIndexOf(k);
        if (i > 0) h = h.slice(0, i) + tokNote(R) + h.slice(i);
      } catch (e) { err("tok", e); }
      return h;
    };
  }

  /* ══════════ No.524 同期中の台帳 ══════════ */
  function secs() { try { const s = v100admSes(); const S = window.V99ADM && V99ADM.sync; const t0 = (S && (S.w0 || S.open)) || (s && +s.at) || Date.now(); return Math.max(0, Math.round((Date.now() - t0) / 1000)); } catch (e) { return 0; } }
  /* 台帳の表の上と下に、決まった順の入れ物（描き直しで動き回らないように） */
  function slot(box, id, tag, cls) {
    let x = document.getElementById(id);
    if (!x || x.parentNode !== box) { if (x) x.remove(); x = document.createElement(tag); x.id = id; x.className = cls; x.setAttribute("data-noi18n", ""); x.hidden = true; box.appendChild(x); }
    return x;
  }
  function boxes(acc) {
    const tw = acc.querySelector(".tw");
    if (!tw) return null;
    let top = document.getElementById("v100admLedTop"), foot = document.getElementById("v100admLedFoot");
    if (!top) { top = document.createElement("div"); top.id = "v100admLedTop"; top.className = "v100adm-ledtop"; }
    if (!foot) { foot = document.createElement("div"); foot.id = "v100admLedFoot"; foot.className = "v100adm-ledfoot"; }
    if (tw.previousElementSibling !== top) tw.before(top);
    if (tw.nextElementSibling !== foot) tw.after(foot);
    const B = { tw, top, foot };
    B.sync = slot(top, "v100admLedSync", "div", "v100adm-ledsync");
    B.dup = slot(top, "v100admDup", "div", "v100adm-dup");
    B.cap = slot(top, "v100admCopyCap", "p", "v100adm-copycap");
    B.cum = slot(foot, "v100admCumNote", "p", "v100adm-cumnote");
    B.pub = slot(foot, "v100admPubNote", "p", "v100adm-pubnote");
    return B;
  }
  const show = (el, on) => { if (el && el.hidden === !!on) el.hidden = !on; };
  const setT = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  function ledSync(acc, B) {
    const S = v100admLedgerSt();
    const rows = acc.querySelectorAll("tbody tr[data-st]").length;
    let mode = "";
    if (S.st === "wait") mode = S.show ? "copy" : "wait";
    else if (S.st) mode = "copy";   /* 読めなかった・遅れている：控えを出す（印つき） */
    if ((acc.getAttribute("data-v100sync") || "") !== mode) { if (mode) acc.setAttribute("data-v100sync", mode); else acc.removeAttribute("data-v100sync"); }
    /* 管理コンソールの描き直しで #accounts が作り直されても、すぐ隠れるように #well にも付ける（#well は作り直されない） */
    const wl = document.getElementById("well");
    if (wl && (wl.getAttribute("data-v100sync") || "") !== mode) { if (mode) wl.setAttribute("data-v100sync", mode); else wl.removeAttribute("data-v100sync"); }
    const p = B.sync, cap = B.cap;
    if (!mode) { show(p, false); show(cap, false); return; }
    const at = S.at ? v100admMdHm(S.at) : "";
    const copyLbl = at ? M(`同期前の控え（${at} 時点・${rows}件）`, `pre-sync copy (as of ${at}, ${rows} rows)`, `同步前的副本（${at} 时点・${rows} 行）`, `copia previa a la sincronización (a las ${at}, ${rows} filas)`)
      : M(`同期前の控え（${rows}件・時点の記録なし）`, `pre-sync copy (${rows} rows, time unknown)`, `同步前的副本（${rows} 行・无时点记录）`, `copia previa (${rows} filas, hora desconocida)`);
    let t, btn = "";
    if (mode === "wait") {
      t = M(`☁ 同期中…（${secs()}秒）台帳の行は、同期サーバーから最新の台帳を読み終えてから出します。この端末には${copyLbl}があります（最新ではありません）。`,
        `☁ Syncing… (${secs()} s) Ledger rows are shown after the latest ledger is loaded from the sync server. This device has a ${copyLbl} (not the latest).`,
        `☁ 同步中…（${secs()} 秒）读取完同步服务器的最新台账后再显示台账行。本设备有${copyLbl}（非最新）。`,
        `☁ Sincronizando… (${secs()} s) Las filas se muestran al cargar el registro actual del servidor. Este equipo tiene una ${copyLbl} (no actual).`);
      btn = rows ? M("同期前の控えを見る", "Show the pre-sync copy", "查看同步前的副本", "Ver la copia previa") : "";
    } else if (S.st === "wait") {
      t = M(`☁ 同期中…（${secs()}秒）下は${copyLbl}です。最新ではありません。同期が終わったら、最新の台帳に入れ替えます。`, `☁ Syncing… (${secs()} s) Below is the ${copyLbl}. Not the latest; it is replaced when the sync finishes.`, `☁ 同步中…（${secs()} 秒）下面是${copyLbl}，非最新；同步完成后替换为最新台账。`, `☁ Sincronizando… (${secs()} s) Abajo está la ${copyLbl}; no es la actual y se reemplaza al terminar.`);
      btn = M("控えをたたむ", "Hide the copy", "收起副本", "Ocultar la copia");
    } else {
      t = M(`⚠ 同期サーバーから最新の台帳を読み込めていません。下は${copyLbl}です（最新ではありません）。`, `⚠ The latest ledger has not been loaded from the sync server. Below is the ${copyLbl} (not the latest).`, `⚠ 尚未从同步服务器读取最新台账。下面是${copyLbl}（非最新）。`, `⚠ No se ha cargado el registro actual del servidor. Abajo está la ${copyLbl} (no actual).`);
    }
    if (!p.firstChild) { p.setAttribute("role", "status"); p.innerHTML = '<p></p><button type="button" class="btn g v100adm-b" data-v100adm="ledcopy"></button>'; }
    if (p.getAttribute("data-k") !== mode) p.setAttribute("data-k", mode);
    setT(p.querySelector("p"), t);
    const b = p.querySelector("button"); if (b.hidden === !!btn) b.hidden = !btn; setT(b, btn);
    show(p, true);
    if (mode === "copy" && rows) { setT(cap, "▼ " + copyLbl + M("　— 最新ではありません", " — not the latest", "　— 非最新", " — no actual")); show(cap, true); }
    else show(cap, false);
  }

  /* ══════════ No.607 台帳の重なりをまとめて見せる ══════════ */
  const OPEN = { all: false, g: {}, ib: false };
  function dupBlock(B, G) {
    const d = B.dup;
    if (!G.folded) { show(d, false); return; }
    const parts = G.groups.filter((g) => g.extra > 0).map((g) => M(`${g.code} に ${g.extra}行`, `${g.extra} into ${g.code}`, `${g.extra} 行并入 ${g.code}`, `${g.extra} en ${g.code}`));
    const srvTxt = G.srvHasLid === true ? M("同期サーバーの台帳にも「k＋16桁」の行が入っています（前に管理コンソールから送られた写し）。この版からは送りません。", "The sync server's ledger also has “k + 16 characters” rows (copies sent earlier from an admin console). This version no longer sends them.", "同步服务器的台账中也有“k＋16位”的行（以前从管理控制台发送的副本）。本版起不再发送。", "El registro del servidor también tiene filas «k + 16 caracteres» (copias enviadas antes). Esta versión ya no las envía.")
      : G.srvHasLid === false ? M("同期サーバーの台帳には入っていません（この端末だけの写し）。同期サーバーへ台帳を送るときも外しています。", "They are not in the sync server's ledger (copies on this device only), and are left out when the ledger is sent to the sync server.", "同步服务器的台账中没有这些行（仅本设备的副本），向同步服务器发送台账时也会排除。", "No están en el registro del servidor (solo copias en este equipo) y se excluyen al enviarlo al servidor.") : "";
    const head = M(`🔁 台帳の重なり：${F(G.rows)}行のうち ${F(G.folded)}行は、同じアカウントの重なりです（${parts.join("・")}をまとめて表示）。本物のアカウント（アクセスコード）は ${F(G.real)}種類です。消していません。`,
      `🔁 Overlapping ledger rows: ${F(G.folded)} of ${F(G.rows)} rows overlap with the same account (${parts.join(", ")} shown together). There are ${F(G.real)} real accounts (access codes). Nothing was deleted.`,
      `🔁 台账重叠：${F(G.rows)} 行中有 ${F(G.folded)} 行是同一账户的重叠（${parts.join("・")} 合并显示）。真实账户（访问代码）共 ${F(G.real)} 种。未删除任何行。`,
      `🔁 Filas superpuestas: ${F(G.folded)} de ${F(G.rows)} filas se superponen con la misma cuenta (${parts.join(", ")} agrupadas). Hay ${F(G.real)} cuentas reales (códigos). No se borró nada.`);
    const why = M(`重なりの理由：このブラウザで体験用のコード（TRIAL-2026・FWD-2026 など）でログインすると、この端末の保存では、アクセスコードを「k＋16桁」の名前に伏せます（端末にコードを残さない守り）。そのあと同じブラウザで管理者としてログインすると、同期サーバーの台帳から本物のコードの行が足されるので、「体験用のコードでログイン → 管理者でログイン」をくり返すたびに、この端末の台帳の写しが1行ずつ増えます（別のアカウントではありません）。${srvTxt}`,
      `Why: when this browser signs in with a shared trial code (TRIAL-2026, FWD-2026, …), this device's storage hides the access code behind a “k + 16 characters” name (so the code is not left on the device). Signing in as admin in the same browser then adds the real row from the sync server's ledger, so each round of “trial sign-in → admin sign-in” adds one more copy row on this device (not another account). ${srvTxt}`,
      `原因：在此浏览器用体验用代码（TRIAL-2026・FWD-2026 等）登录时，本设备的保存会把访问代码隐藏为“k＋16位”的名称（不在设备上留下代码）。之后在同一浏览器以管理员登录，会从同步服务器台账补上真实代码的行，因此每重复一次“体验代码登录 → 管理员登录”，本设备的台账副本就多一行（不是另一个账户）。${srvTxt}`,
      `Motivo: al iniciar sesión en este navegador con un código de prueba compartido (TRIAL-2026, FWD-2026…), el almacenamiento del equipo oculta el código con un nombre «k + 16 caracteres». Al entrar luego como administrador en el mismo navegador se añade la fila real del registro del servidor, así que cada ronda «prueba → administrador» añade una copia más en este equipo (no es otra cuenta). ${srvTxt}`);
    const btn = OPEN.all ? M("重なりをまとめる", "Group the overlaps", "合并重叠", "Agrupar") : M(`重なりの行も表に出す（${F(G.folded)}行）`, `Show the overlapping rows too (${F(G.folded)})`, `也显示重叠的行（${F(G.folded)} 行）`, `Mostrar también las filas superpuestas (${F(G.folded)})`);
    if (!d.firstChild) { d.setAttribute("role", "note"); d.innerHTML = '<p class="h"></p><p class="w"></p><button type="button" class="btn g v100adm-b" data-v100adm="dupall"></button>'; }
    setT(d.querySelector("p.h"), head); setT(d.querySelector("p.w"), why); setT(d.querySelector("button"), btn);
    const bt = d.querySelector("button"); if (bt.getAttribute("aria-expanded") !== String(OPEN.all)) bt.setAttribute("aria-expanded", String(OPEN.all));
    show(d, true);
  }
  function dupRows(acc, G) {
    const byCode = {};
    G.groups.forEach((g) => { g.rows.forEach((r) => { byCode[String(r.a.code || "")] = g; }); });
    const L = {};
    acc.querySelectorAll("tbody tr").forEach((tr) => {
      const det = tr.querySelector("[data-det]");
      const code = det ? det.getAttribute("data-det") || "" : "";
      const g = code ? byCode[code] : null;
      if (!g || !(g.extra > 0)) { tr.classList.remove("v100fold", "v100fold-open"); const x = tr.querySelector(".v100adm-grp"); if (x) x.remove(); const y = tr.querySelector(".v100adm-of"); if (y) y.remove(); return; }
      (L[g.code] = L[g.code] || []).push({ tr, code, g });
    });
    Object.keys(L).forEach((gc) => {
      const list = L[gc], g = list[0].g;
      const main = list.find((x) => x.code === gc) || list[0];
      const open = OPEN.all || !!OPEN.g[gc];
      list.forEach((x) => {
        const fold = x !== main;
        x.tr.classList.toggle("v100fold", fold && !open);
        x.tr.classList.toggle("v100fold-open", fold && open);
        const td = x.tr.querySelector("td"); if (!td) return;
        let s = td.querySelector(".v100adm-of");
        if (!fold) { if (s) s.remove(); return; }
        const t = LID(x.code) ? M(`↳ ${gc} の端末の控え（重なり）`, `↳ copy of ${gc} on this device (overlap)`, `↳ ${gc} 的本设备副本（重叠）`, `↳ copia de ${gc} en este equipo`) : M(`↳ ${gc} の重なり`, `↳ overlap of ${gc}`, `↳ ${gc} 的重叠`, `↳ superposición de ${gc}`);
        if (!s) { s = document.createElement("span"); s.className = "v100adm-of"; s.setAttribute("data-noi18n", ""); td.prepend(s); }
        setT(s, t);
        const old = td.querySelector(".v100adm-grp"); if (old) old.remove();
      });
      const td = main.tr.querySelector("td"); if (!td) return;
      let b = td.querySelector(".v100adm-grp");
      const kinds = [g.lid ? M(`端末の控え ${g.lid}行`, `${g.lid} device copies`, `本设备副本 ${g.lid} 行`, `${g.lid} copias del equipo`) : "", g.same ? M(`同じコードの行 ${g.same}行`, `${g.same} same-code rows`, `相同代码的行 ${g.same} 行`, `${g.same} filas con el mismo código`) : ""].filter(Boolean).join("・");
      const t = M(`＋重なり ${g.extra}行（${kinds}）をこの行にまとめています`, `+${g.extra} overlapping rows (${kinds}) grouped into this row`, `＋重叠 ${g.extra} 行（${kinds}）已合并到此行`, `+${g.extra} filas superpuestas (${kinds}) agrupadas aquí`);
      const bl = open ? M("たたむ", "Collapse", "收起", "Contraer") : M("開く", "Expand", "展开", "Abrir");
      if (!b) { b = document.createElement("span"); b.className = "v100adm-grp"; b.setAttribute("data-noi18n", ""); b.innerHTML = '<span class="t"></span> <button type="button" class="btn g v100adm-b" data-v100adm="grp"></button>'; td.appendChild(b); }
      setT(b.querySelector(".t"), t);
      const bt = b.querySelector("button");
      if (bt.getAttribute("data-v100code") !== gc) bt.setAttribute("data-v100code", gc);
      if (bt.getAttribute("aria-expanded") !== String(open)) bt.setAttribute("aria-expanded", String(open));
      setT(bt, bl);
      /* v90 の「同じ会社・担当の行 ×N」が、まとめた端末の控え（k…）だけで数えたものなら隠す（別のアカウントがあるように見えるため） */
      try {
        const I = typeof v90admDupInfo === "function" ? v90admDupInfo() : null;   // eslint-disable-line no-undef
        const a = g.main || {};
        const key = (typeof v90admNorm === "function") ? v90admNorm(a.co) + "|" + v90admNorm(a.who && a.who !== "—" ? a.who : "") : "";   // eslint-disable-line no-undef
        const set = I && I.byCo && I.byCo.get(key);
        const mine = new Set(g.rows.map((r) => String(r.a.code || "")));
        const onlyMine = !!set && [...set].every((c) => mine.has(c));
        td.querySelectorAll(".v90dup.co").forEach((x) => { if (x.hidden !== onlyMine) x.hidden = onlyMine; const br = x.previousElementSibling; if (br && br.tagName === "BR" && br.hidden !== onlyMine) br.hidden = onlyMine; });
      } catch (e) { err("v90co", e); }
    });
  }

  /* ══════════ No.606 累計「AI 質問」と今日のサーバーの回数 ══════════ */
  function cumNoteTxt() {
    return M("📊「AI質問」の列（累計）は、お客様の端末が数えた「AI を使う操作」の回数です（発行から）。端末から同期サーバーへは、ログインのときと数分おきに届きます（届くまでは増えません。同じコードのほかの端末の分は、アカウントの保存データを通して足し合わせます）。小さい字の「今日（サーバー）」は、同期サーバーが AI に頼んだ回数で、1つの操作で何回も頼むことがあり、0時に 0 にもどります。数え方が違うので、累計が今日より小さいことがあります（⚠ の印）。物流会社の AI物流マンへの質問は、21.99 までは累計に入っていませんでした（22.00 から入れます）。",
      "📊 The “AI questions” column (cumulative) is the number of AI operations counted on the customer's devices (since issue). Devices send it to the sync server at sign-in and every few minutes (it does not grow until it arrives; other devices with the same code are added up through the account's saved data). The small “today (server)” figure is the number of AI requests counted by the sync server — one operation can make several requests — and resets at midnight. Because they are counted differently, the cumulative figure can be smaller than today's (marked ⚠). Questions to the AI logistics agent were not counted in the cumulative figure up to 21.99 (counted from 22.00).",
      "📊“AI 提问”列（累计）是客户设备统计的“使用 AI 的操作”次数（自发放起）。设备在登录时及每隔几分钟发送给同步服务器（送达前不增加；同一代码的其他设备的部分通过账户的保存数据相加）。小字“今天（服务器）”是同步服务器向 AI 请求的次数，一个操作可能请求多次，0 点归零。计数方法不同，累计可能小于今天（⚠ 标记）。物流公司向 AI 物流员的提问在 21.99 之前未计入累计（22.00 起计入）。",
      "📊 La columna «Preguntas IA» (acumulada) es el número de operaciones con IA contadas en los equipos del cliente (desde la emisión). Los equipos la envían al servidor al iniciar sesión y cada pocos minutos (no aumenta hasta que llega; los demás equipos con el mismo código se suman mediante los datos guardados de la cuenta). La cifra pequeña «hoy (servidor)» son las solicitudes a la IA contadas por el servidor —una operación puede hacer varias— y vuelve a 0 a medianoche. Por contarse distinto, la acumulada puede ser menor que la de hoy (⚠). Las preguntas al agente logístico no se contaban hasta 21.99 (se cuentan desde 22.00).");
  }
  function cumCells(acc, B) {
    const ths = [...acc.querySelectorAll("thead th")];
    const ix = ths.findIndex((th) => /^\s*(AI質問|AI questions|AI 提问|Preguntas)/.test(th.textContent || ""));
    if (ix < 0) { show(B.cum, false); return; }
    setT(B.cum, cumNoteTxt()); show(B.cum, true);
    acc.querySelectorAll("tbody tr").forEach((tr) => {
      const det = tr.querySelector("[data-det]"); if (!det) return;
      const code = det.getAttribute("data-det") || "";
      const td = tr.children[ix]; if (!td) return;
      const C = window.v100admCum(code);
      let s = td.querySelector(".v100adm-ait");
      if (C.today == null || LID(code)) { if (s) s.remove(); return; }
      const tt = M(`今日（サーバー）${F(C.today)}回`, `today (server) ${F(C.today)}`, `今天（服务器）${F(C.today)} 次`, `hoy (servidor) ${F(C.today)}`) + (C.lt ? M(`・⚠ 累計 ${F(C.aiQ)} より多い（数え方が違います）`, ` · ⚠ more than the cumulative ${F(C.aiQ)} (counted differently)`, `・⚠ 多于累计 ${F(C.aiQ)}（计数方法不同）`, ` · ⚠ más que la acumulada ${F(C.aiQ)} (se cuenta distinto)`) : "");
      if (!s) { s = document.createElement("small"); s.className = "v100adm-ait"; s.setAttribute("data-noi18n", ""); td.appendChild(s); }
      if (s.classList.contains("lt") !== !!C.lt) s.classList.toggle("lt", !!C.lt);
      setT(s, tt);
    });
  }
  /* アカウントの詳細（右の窓）の「サーバー経由の AI：今日 N回」の下 */
  function detCum() {
    try {
      const box = document.getElementById("v73admDet");
      const code = window.__v100admDet || "";
      if (!box || !code) return;
      const C = window.v100admCum(code);
      const t = M(`この画面の「AI質問 ${F(C.aiQ)}」は、お客様の端末が数えた AI を使う操作の累計（発行から・端末から届いた分）です。「サーバー経由の AI：今日」は同期サーバーが AI に頼んだ回数（${HMS(C.at)} 時点）で、数え方が違います。`, `“AI questions ${F(C.aiQ)}” here is the cumulative number of AI operations counted on the customer's devices (since issue; as received from devices). “AI via the server: today” is the number of AI requests counted by the sync server (as of ${HMS(C.at)}); they are counted differently.`, `此处的“AI 提问 ${F(C.aiQ)}”是客户设备统计的使用 AI 的操作累计（自发放起・设备已送达的部分）。“经服务器的 AI：今天”是同步服务器向 AI 请求的次数（${HMS(C.at)} 时点），计数方法不同。`, `«Preguntas IA ${F(C.aiQ)}» es el acumulado de operaciones con IA contadas en los equipos del cliente (lo recibido de los equipos). «IA vía servidor: hoy» son las solicitudes contadas por el servidor (a las ${HMS(C.at)}); se cuentan distinto.`)
        + (C.lt ? M(`⚠ 今日のサーバーの回数（${F(C.today)}回）が累計（${F(C.aiQ)}回）より多くなっています。${C.fwd ? "物流会社の AI物流マンへの質問は、21.99 までは累計に数えていなかったためです（22.00 から数えます）。AI の見積交渉など、質問のほかに AI に頼んだ分も今日の回数には入ります。" : "端末からの累計がまだ届いていない・同じコードを複数の端末で使っている・1つの操作で何回も AI に頼んだ、のどれかです。"}`,
          ` ⚠ Today's server count (${F(C.today)}) is larger than the cumulative count (${F(C.aiQ)}). ${C.fwd ? "Questions to the AI logistics agent were not counted in the cumulative figure up to 21.99 (counted from 22.00); AI requests other than questions (e.g. AI quote negotiation) are also in today's count." : "Either the device total has not arrived yet, several devices share the code, or one operation made several AI requests."}`,
          `⚠ 今天服务器的次数（${F(C.today)}）多于累计（${F(C.aiQ)}）。${C.fwd ? "因为 21.99 之前物流公司向 AI 物流员的提问未计入累计（22.00 起计入）；AI 报价交涉等提问以外的 AI 请求也计入今天的次数。" : "可能是设备的累计尚未送达、多台设备共用代码，或一个操作多次请求 AI。"}`,
          ` ⚠ Hoy el servidor cuenta ${F(C.today)}, más que la acumulada (${F(C.aiQ)}). ${C.fwd ? "Las preguntas al agente logístico no se contaban hasta 21.99 (se cuentan desde 22.00); las solicitudes de IA que no son preguntas (p. ej., negociación de cotizaciones) también cuentan hoy." : "El total del equipo aún no llegó, varios equipos comparten el código o una operación hizo varias solicitudes."}`) : "");
      let p = document.getElementById("v100admDetCum");
      if (p && p.parentNode !== box) { p.remove(); p = null; }
      if (!p) { p = document.createElement("p"); p.id = "v100admDetCum"; p.className = "nn v100adm-detcum"; p.setAttribute("data-noi18n", ""); box.appendChild(p); }
      if (p.classList.contains("lt") !== !!C.lt) p.classList.toggle("lt", !!C.lt);
      setT(p, t);
    } catch (e) { err("detCum", e); }
  }
  if (typeof admDetail === "function") {
    const __ad100 = admDetail;
    admDetail = function (code) {   // eslint-disable-line no-global-assign
      window.__v100admDet = String(code || "");
      const r = __ad100.apply(this, arguments);
      try { detCum(); setTimeout(detCum, 300); } catch (e) { err("det", e); }
      return r;
    };
  }

  /* ══════════ No.501 体験用の共通コード（名前は確かめない＝自己申告） ══════════ */
  function pubMarks(acc, B) {
    const codes = [];
    acc.querySelectorAll("tbody tr").forEach((tr) => {
      const det = tr.querySelector("[data-det]"); if (!det) return;
      const code = det.getAttribute("data-det") || "";
      const pub = !LID(code) && v100admPub(code);
      const td = tr.children[1]; if (!td) return;
      let s = td.querySelector(".v100adm-pub");
      if (!pub) { if (s) s.remove(); return; }
      if (codes.indexOf(code) < 0) codes.push(code);
      const t = M("体験用の共通コード：名前は確かめず（自己申告）", "Shared trial code: names not verified (self-declared)", "体验用共用代码：不核对姓名（自报）", "Código de prueba compartido: nombres sin verificar (autodeclarados)");
      if (!s) { s = document.createElement("small"); s.className = "v100adm-pub"; s.setAttribute("data-noi18n", ""); td.appendChild(s); }
      setT(s, t);
    });
    if (!codes.length) { show(B.pub, false); return; }
    setT(B.pub, M(`🪪 体験用の共通コード（${codes.join("・")}）は、ログインのときお名前を確かめず、入れたお名前に「（自己申告）」と付けて記録します（11/19 の決め）。お名前を確かめたいお客様には、個別のアカウント（メールアドレスとパスワード）を発行してください（「新しいアカウントを発行」）。`,
      `🪪 Shared trial codes (${codes.join(", ")}) do not verify names at sign-in; the entered name is recorded with “(self-declared)” (decision of 11/19). For customers whose names must be verified, issue an individual account (email address and password) with “Issue a new account”.`,
      `🪪 体验用共用代码（${codes.join("・")}）登录时不核对姓名，在输入的姓名后加“（自报）”记录（11/19 的决定）。需要核对姓名的客户，请发放个人账户（邮箱和密码）（“发放新账户”）。`,
      `🪪 Los códigos de prueba compartidos (${codes.join(", ")}) no verifican el nombre al entrar; se registra con «(autodeclarado)» (decisión del 11/19). Para clientes cuyo nombre deba verificarse, emita una cuenta individual (correo y contraseña) con «Emitir una cuenta nueva».`));
    show(B.pub, true);
  }

  /* ══════════ No.528 CS 横断：前の結果・かかった時間・端末の控えの行 ══════════ */
  function ibPrev() {
    try {
      const I = V100ADM.ib, out = document.getElementById("adminboxOut");
      if (!out) return;
      let d = document.getElementById("v100admIbPrev");
      if (!I.busy || !I.prevHtml || out.querySelector("table:not(.v100prevt)")) { if (d && !I.busy) d.remove(); return; }
      if (d && out.contains(d)) return;
      d = document.createElement("div"); d.id = "v100admIbPrev"; d.className = "v100adm-ibprev"; d.setAttribute("data-noi18n", "");
      const tmp = document.createElement("div"); tmp.innerHTML = I.prevHtml;
      tmp.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
      tmp.querySelectorAll("button,input,select,textarea").forEach((x) => { x.disabled = true; [...x.attributes].forEach((a) => { if (/^data-/.test(a.name)) x.removeAttribute(a.name); }); });
      tmp.querySelectorAll("table").forEach((x) => x.classList.add("v100prevt"));
      tmp.querySelectorAll(".v100adm-ibstat").forEach((x) => x.remove());
      const cap = document.createElement("p"); cap.className = "v100adm-ibcap";
      cap.textContent = M(`前の結果（${HMS(I.prevAt)} 取得）：取り直しが終わるまで、前の結果を出しています（この表では操作できません）。`, `Previous result (fetched ${HMS(I.prevAt)}): shown until the refresh finishes (read-only).`, `上次的结果（${HMS(I.prevAt)} 读取）：重新读取完成前显示上次的结果（不可操作）。`, `Resultado anterior (obtenido ${HMS(I.prevAt)}): se muestra hasta terminar la actualización (solo lectura).`);
      d.appendChild(cap); while (tmp.firstChild) d.appendChild(tmp.firstChild);
      out.appendChild(d);
    } catch (e) { err("ibPrev", e); }
  }
  window.v100admIbPaint = function () {
    try {
      const I = V100ADM.ib, out = document.getElementById("adminboxOut");
      if (!out || I.busy || !I.t1) return;
      const tbl = out.querySelector("table:not(.v100prevt)");
      if (!tbl) return;
      const pv = document.getElementById("v100admIbPrev"); if (pv) pv.remove();
      const G = window.v100admGroups();
      const twinOf = {}; G.groups.forEach((g) => g.rows.forEach((r) => { if (r.lid) twinOf[String(r.a.code)] = g.code; }));
      tbl.querySelectorAll("tbody tr").forEach((tr) => {
        const c = tr.querySelector(".acode"); const code = c ? (c.textContent || "").trim() : "";
        if (!LID(code) || tr.getAttribute("data-v100lid")) return;
        tr.setAttribute("data-v100lid", "1"); tr.classList.add("v100adm-iblid");
        tr.querySelectorAll("input,button").forEach((x) => { x.disabled = true; x.title = M("端末の控えの行には承認者を付けません（本物のコードの行で付けます）", "No approver on device-copy rows (set it on the real code's row)", "本设备副本的行不设审批人（请在真实代码的行设置）", "Sin aprobador en filas de copia (use la fila del código real)"); });
        const td = tr.children[1];
        if (td) td.textContent = M(`端末の控えの名前（${twinOf[code] && twinOf[code] !== code ? twinOf[code] + " と同じアカウント" : "本物のコードではありません"}）・読み込んでいません`, `Device copy name (${twinOf[code] && twinOf[code] !== code ? "same account as " + twinOf[code] : "not a real code"}) · not loaded`, `本设备副本名称（${twinOf[code] && twinOf[code] !== code ? "与 " + twinOf[code] + " 为同一账户" : "不是真实代码"}）・未读取`, `Nombre de copia del equipo (${twinOf[code] && twinOf[code] !== code ? "misma cuenta que " + twinOf[code] : "no es un código real"}) · no se cargó`);
      });
      let p = document.getElementById("v100admIbStat");
      const t = M(`⏱ ${HMS(I.t1)} に取得（かかった時間 ${(I.ms / 1000).toFixed(1)}秒・荷主の行 ${I.n}行のうち ${I.fetch}社を${I.conc}社ずつ同時に読み込み${I.skip ? "・端末の控えの行 " + I.skip + "行" : ""}${I.dup ? "・同じコードの重なり " + I.dup + "行" : ""}${I.skip || I.dup ? "は読み込んでいません" : ""}）。`,
        `⏱ Fetched at ${HMS(I.t1)} (took ${(I.ms / 1000).toFixed(1)} s; ${I.fetch} of ${I.n} shipper rows loaded ${I.conc} at a time${I.skip ? "; " + I.skip + " device-copy rows" : ""}${I.dup ? "; " + I.dup + " same-code rows" : ""}${I.skip || I.dup ? " not loaded" : ""}).`,
        `⏱ ${HMS(I.t1)} 读取（耗时 ${(I.ms / 1000).toFixed(1)} 秒・货主 ${I.n} 行中 ${I.fetch} 家每 ${I.conc} 家同时读取${I.skip ? "・本设备副本 " + I.skip + " 行" : ""}${I.dup ? "・相同代码重叠 " + I.dup + " 行" : ""}${I.skip || I.dup ? "未读取" : ""}）。`,
        `⏱ Obtenido a las ${HMS(I.t1)} (${(I.ms / 1000).toFixed(1)} s; ${I.fetch} de ${I.n} filas de cargadores, ${I.conc} a la vez${I.skip ? "; " + I.skip + " copias del equipo" : ""}${I.dup ? "; " + I.dup + " filas repetidas" : ""}${I.skip || I.dup ? " sin cargar" : ""}).`);
      if (!p) { p = document.createElement("div"); p.id = "v100admIbStat"; p.className = "v100adm-ibstat"; p.setAttribute("data-noi18n", ""); p.setAttribute("role", "note"); p.innerHTML = '<p class="nn"></p><button type="button" class="btn g v100adm-b" data-v100adm="iblid"></button>'; }
      if (!out.contains(p)) out.prepend(p);
      setT(p.querySelector("p"), t);
      const nl = tbl.querySelectorAll("tbody tr[data-v100lid]").length;
      out.classList.toggle("v100ib-lidopen", !!OPEN.ib);
      const bt = p.querySelector("button");
      const bl = !nl ? "" : OPEN.ib ? M(`端末の控えの行（${nl}行）をたたむ`, `Hide the ${nl} device-copy rows`, `收起本设备副本的行（${nl} 行）`, `Ocultar las ${nl} filas de copia`) : M(`端末の控えの行（${nl}行・同じアカウントの写し）を表に出す`, `Show the ${nl} device-copy rows (copies of the same account)`, `显示本设备副本的行（${nl} 行・同一账户的副本）`, `Mostrar las ${nl} filas de copia (copias de la misma cuenta)`);
      if (bt.hidden === !!bl) bt.hidden = !bl;
      if (bt.getAttribute("aria-expanded") !== String(!!OPEN.ib)) bt.setAttribute("aria-expanded", String(!!OPEN.ib));
      setT(bt, bl);
    } catch (e) { err("ibPaint", e); }
  };

  /* ══════════ 自分で見つけた所：ダッシュボードの合計（発行済み・ログイン・AIへの質問）に台帳の重なりの分も入っている ══════════ */
  function kpiNote(G, wait) {
    try {
      const k = document.getElementById("admkpi");
      let n = document.getElementById("v100admKpiDup");
      const extra = [];
      G.groups.forEach((g) => g.rows.forEach((r) => { if (r.a !== g.main) extra.push(r.a); }));
      if (!k || wait || !extra.length) { if (n) n.hidden = true; return; }
      const keep = v100admAccts().filter((a) => a && extra.indexOf(a) < 0);
      const sum = (L, f) => L.reduce((s, a) => s + (+((a.usage || {})[f]) || 0), 0);
      const now = Date.now();
      const act = keep.filter((a) => a.st === "active" && +a.expires > now).length;
      const t = M(`🔁 上の数には、台帳の重なり ${F(extra.length)}行（同じアカウントの写し）の分も入っています。重なりを除くと：発行済みアカウント ${F(keep.length)}件（うち有効 ${F(act)}件）・累計ログイン ${F(sum(keep, "logins"))}回・商品データの解析 ${F(sum(keep, "uploads"))}件・AIへの質問 ${F(sum(keep, "aiQ"))}回（うち Web 検索 ${F(sum(keep, "webQ"))}回）。重なりの中身は「アカウント一覧と利用状況」に出しています。`,
        `🔁 The figures above also include ${F(extra.length)} overlapping ledger rows (copies of the same accounts). Without them: ${F(keep.length)} accounts issued (${F(act)} active) · ${F(sum(keep, "logins"))} sign-ins · ${F(sum(keep, "uploads"))} analyses · ${F(sum(keep, "aiQ"))} AI questions (${F(sum(keep, "webQ"))} with web search). See “Accounts and usage” for the overlaps.`,
        `🔁 上面的数字也包含台账重叠的 ${F(extra.length)} 行（同一账户的副本）。去掉重叠后：已发放账户 ${F(keep.length)} 个（有效 ${F(act)} 个）・累计登录 ${F(sum(keep, "logins"))} 次・商品数据解析 ${F(sum(keep, "uploads"))} 件・AI 提问 ${F(sum(keep, "aiQ"))} 次（其中网页搜索 ${F(sum(keep, "webQ"))} 次）。`,
        `🔁 Las cifras de arriba incluyen también ${F(extra.length)} filas superpuestas (copias de las mismas cuentas). Sin ellas: ${F(keep.length)} cuentas emitidas (${F(act)} activas) · ${F(sum(keep, "logins"))} inicios de sesión · ${F(sum(keep, "uploads"))} análisis · ${F(sum(keep, "aiQ"))} preguntas a la IA (${F(sum(keep, "webQ"))} con búsqueda web).`);
      if (!n) { n = document.createElement("p"); n.id = "v100admKpiDup"; n.className = "v100adm-kpidup"; n.setAttribute("role", "note"); n.setAttribute("data-noi18n", ""); }
      if (k.nextElementSibling !== n) k.after(n);
      if (n.hidden) n.hidden = false;
      setT(n, t);
    } catch (e) { err("kpi", e); }
  }

  /* ══════════ 描いたあとに足す（何度でも同じ結果） ══════════ */
  function paint() {
    try {
      if (!v100admIs()) return;
      const acc = document.getElementById("accounts");
      const B = acc ? boxes(acc) : null;
      const G0 = window.v100admGroups();
      kpiNote(G0, v100admLedgerSt().st === "wait");
      if (acc && B) {
        ledSync(acc, B);
        const G = G0;
        if (acc.getAttribute("data-v100sync") !== "wait") { dupRows(acc, G); dupBlock(B, G); cumCells(acc, B); pubMarks(acc, B); }
        else { show(B.dup, false); show(B.cum, false); show(B.pub, false); }
      }
      ibPrev();
      if (!V100ADM.ib.busy) window.v100admIbPaint();
      detCum();
    } catch (e) { err("paint", e); }
  }
  window.v100admPaint = paint;
  let T = 0;
  const soon = () => { if (T) return; T = setTimeout(() => { T = 0; paint(); }, 90); };   /* ほかの層が続けて書き換えても、90ms ごとには必ず描く（待たされ続けない） */
  try { new MutationObserver(() => { if (v100admIs()) soon(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { err("obs", e); }
  setInterval(() => { try { if (v100admIs() && (v100admLedgerSt().st || V100ADM.ib.busy)) paint(); } catch (e) { /* 無視 */ } }, 1000);
  const RD = window.RDX;
  if (RD && RD.page && typeof RD.page.adm === "function") {
    const p0 = RD.page.adm;
    RD.page.adm = function () { const r = p0.apply(this, arguments); soon(); return r; };
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v100adm]");
      if (!b) return;
      const k = b.getAttribute("data-v100adm");
      if (k === "ledcopy") { V100ADM.sync.show = !V100ADM.sync.show; paint(); }
      else if (k === "dupall") { OPEN.all = !OPEN.all; if (!OPEN.all) OPEN.g = {}; paint(); }
      else if (k === "iblid") { OPEN.ib = !OPEN.ib; window.v100admIbPaint(); }
      else if (k === "grp") { const c = b.getAttribute("data-v100code") || ""; OPEN.g[c] = !OPEN.g[c]; paint(); }
    } catch (e) { err("click", e); }
  });
})();
