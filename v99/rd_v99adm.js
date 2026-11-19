/* ═══ 21.99 分野 adm の見せ方（刷新版）：AI の回数の「何時の数か・コード全体の数か」（荷主・管理者）・同期の記録の1行・
   商社デスク／CS 横断の「開いた時刻に取り直しました」 ═══
   中身（取り直しの決め方・時刻）は logic_v2199adm.js（V99ADM）。前の層の描き方（v97 rd_v97ai.js の v90goalQHtml、v96/v97 の v63aCardHtml、
   v96 の v96admDeskHead・v96admIbHead、rd_adm.js の RD.page.adm）を控えてから包む。onclick= と style= は書かない（押す所は委譲の addEventListener）。 */
(function () {
  if (typeof V99ADM === "undefined") return;
  const E = (s) => v99admE(s);
  const M = (ja, en, zh, es) => v99admM(ja, en, zh, es);
  const F = (n) => (+n || 0).toLocaleString("en-US");
  const HMS = (t) => v99admHms(t);
  const HM = (t) => v99admHm(t);
  const err = (k, e) => v99admErr("rd " + k, e);
  /* 数え方（両方の画面で同じ文） */
  const howCount = () => M("数え方：STANDAGE の AI に頼むたびに1回（質問・Web 検索・資料づくり・写真の確認・画面の訳など、AI を使う操作はどれも1回。答えが返らなかった依頼も入り、内蔵エンジンの答えは入りません）。毎日 0時（日本時間）に 0 にもどります。",
    "How it is counted: one per request to STANDAGE AI (questions, web search, documents, photo checks, screen translations — every AI operation counts once; requests without an answer are included, built-in engine answers are not). Resets to 0 at midnight JST.",
    "计数方法：每次请求 STANDAGE 的 AI 计 1 次（提问・网络搜索・制作资料・照片检查・画面翻译等，凡使用 AI 的操作各计 1 次；未返回答案的请求也计入，内置引擎的回答不计入）。每天 0 点（日本时间）归零。",
    "Cómo se cuenta: una por cada solicitud a la IA de STANDAGE (preguntas, búsqueda web, documentos, revisión de fotos, traducciones — cada operación de IA cuenta una; se incluyen las solicitudes sin respuesta, no las del motor integrado). Vuelve a 0 a medianoche (JST).");

  /* ══════════ No.557 荷主側：AI 相談の画面のカウンタ ══════════ */
  function asofHtml() {
    const l = (typeof V63A !== "undefined" && V63A) ? V63A.last : null;
    if (!(l && l.ok && l.on)) return "";
    const Me = V99ADM.me;
    const at = Me.at || ((typeof V95AI !== "undefined" && V95AI && V95AI.meAt) || 0);
    const add = Math.max(0, +(l.v95add || 0));
    const busy = Me.busy > 0;
    const head = busy
      ? M(`☁ 同期サーバーの数を取り直しています…（いま出ている数：${HMS(at)} 時点）`, `☁ Refreshing the sync server's numbers… (shown now: as of ${HMS(at)})`, `☁ 正在重新读取同步服务器的数字…（当前显示：${HMS(at)} 时点）`, `☁ Actualizando las cifras del servidor… (mostradas: a las ${HMS(at)})`)
      : M(`🕒 ${HMS(at)} 時点の同期サーバーの数です`, `🕒 Sync server numbers as of ${HMS(at)}`, `🕒 这是 ${HMS(at)} 时点同步服务器的数字`, `🕒 Cifras del servidor a las ${HMS(at)}`);
    const body = M("（この画面を開いたとき・AI を使ったあとに取り直します）。このアクセスコード全体の今日の回数で、同じコードでログインしているほかの方・ほかの端末の分も含みます。管理コンソールの「AI 接続」の「今日／上限」と同じ記録なので、同じ時刻に見れば同じ数です。",
      " (refreshed when you open this screen and after you use the AI). It is today's count for this whole access code, including other people and other devices signed in with the same code. It is the same record as “Today / limit” in the admin console's AI connection list, so at the same time both show the same number.",
      "（打开本画面时・使用 AI 后会重新读取）。这是此访问代码整体的今天次数，包括使用同一代码登录的其他人・其他设备的部分。与管理控制台“AI 连接”的“今天／上限”是同一记录，同一时刻查看数字相同。",
      " (se actualiza al abrir esta pantalla y después de usar la IA). Es el recuento de hoy de todo este código de acceso, incluidas otras personas y otros dispositivos con el mismo código. Es el mismo registro que «Hoy / límite» de la conexión de IA en la consola de administración: a la misma hora, el mismo número.");
    const plus = add ? M(`そのあと、この画面で AI を ${F(add)}回使ったので、その分を足しています（同期サーバーの数を取り直します）。`, ` Since then you used the AI ${F(add)} time(s) on this screen; those are added (the sync server's number is being refreshed).`, `之后在本画面使用了 ${F(add)} 次 AI，已加上这部分（将重新读取同步服务器的数字）。`, ` Desde entonces usó la IA ${F(add)} vez/veces en esta pantalla; se suman (se actualizará la cifra del servidor).`) : "";
    return `<span class="v99adm-asof" data-v99asof="${E(at)}" data-v99busy="${busy ? 1 : 0}" data-v99add="${E(add)}"><b>${E(head)}</b>${E(body)}${plus ? `<span class="v99adm-plus">${E(plus)}</span>` : ""}<small class="v99adm-how">${E(howCount())}</small></span>`;
  }
  if (typeof v90goalQHtml === "function") {
    const __gh99 = v90goalQHtml;
    v90goalQHtml = function () {   // eslint-disable-line no-global-assign
      let h = __gh99.apply(this, arguments);
      try {
        const a = asofHtml();
        if (!a || typeof h !== "string") return h;
        V99ADM.n.paint++;
        const k = '<span class="v96ai-ms"';
        const i = h.indexOf(k);
        if (i > 0) h = h.slice(0, i) + a + h.slice(i);
        else h = h.replace(/(<\/span><\/div>)\s*$/, a + "$1");
      } catch (e) { err("qh", e); }
      return h;
    };
  }

  /* ══════════ No.557 管理者側：AI 接続（サーバー経由）の表 ══════════ */
  function airAt() { return V99ADM.air.at || ((typeof V63A !== "undefined" && V63A && +V63A.admAt) || 0); }
  function airNote() {
    const at = airAt(), busy = !!V99ADM.air.busy;
    const head = busy ? M(`☁ 同期サーバーの数を取り直しています…（いま出ている数：${HMS(at)} 時点）`, `☁ Refreshing… (shown now: as of ${HMS(at)})`, `☁ 正在重新读取…（当前显示：${HMS(at)} 时点）`, `☁ Actualizando… (mostradas: a las ${HMS(at)})`)
      : M(`🕒 下の表の「今日／上限」は ${HMS(at)} 時点の同期サーバーの数です`, `🕒 “Today / limit” in the table below is the sync server's number as of ${HMS(at)}`, `🕒 下表的“今天／上限”是 ${HMS(at)} 时点同步服务器的数字`, `🕒 «Hoy / límite» de la tabla es la cifra del servidor a las ${HMS(at)}`);
    const body = M("（この欄を開いたときに取り直します）。アクセスコードごとの全体の数で、そのコードでログインしたすべての方・端末の分を含みます（共通のコードは、ほかの方の利用も入ります）。お客様の画面の「今日の回数」と同じ記録なので、同じ時刻に見れば同じ数です。ちがって見えるときは、両方の画面の「○時○分○秒 時点」と、表の「最後の利用」の時刻を比べてください。",
      " (refreshed when you open this section). Each row is the total for that access code, including everyone and every device signed in with it (shared codes include other people's use). It is the same record as “Uses today” on the customer's screen, so at the same time both show the same number. If they look different, compare the “as of” time on both screens and the “last use” time in the table.",
      "（打开本栏时重新读取）。每行是该访问代码的总数，包括用该代码登录的所有人・所有设备（共用代码也包括其他人的使用）。与客户画面的“今天的次数”是同一记录，同一时刻查看数字相同。看起来不同时，请比较两个画面的“时点”和表中“最后使用”的时刻。",
      " (se actualiza al abrir esta sección). Cada fila es el total de ese código de acceso, incluidas todas las personas y dispositivos que lo usan (los códigos compartidos incluyen el uso de otros). Es el mismo registro que «Usos de hoy» en la pantalla del cliente: a la misma hora, el mismo número. Si parecen distintos, compare la hora «a las» de ambas pantallas y la hora de «último uso» de la tabla.");
    return `<div class="v99adm-airnote" id="v99admAir" role="note" data-noi18n data-v99at="${E(at)}" data-v99busy="${busy ? 1 : 0}"><p><b>${E(head)}</b>${E(body)}</p><p class="v99adm-how">${E(howCount())}</p><button type="button" class="btn g v99adm-b" data-v99adm="airre"${busy ? " disabled" : ""}>${E(M("今すぐ取り直す", "Refresh now", "立即重新读取", "Actualizar ahora"))}</button></div>`;
  }
  window.v99admAirPaint = function () {
    try {
      const n = document.getElementById("v99admAir");
      if (!n) return;
      const tmp = document.createElement("div"); tmp.innerHTML = airNote();
      n.replaceWith(tmp.firstElementChild);
    } catch (e) { err("airPaint", e); }
  };
  if (typeof v63aCardHtml === "function") {
    const __ah99 = v63aCardHtml;
    v63aCardHtml = function () {   // eslint-disable-line no-global-assign
      let h = __ah99.apply(this, arguments);
      try {
        const R = (typeof V63A !== "undefined" && V63A && V63A.adm) || null;
        if (typeof h !== "string" || !R) return h;
        const at = airAt();
        /* 列の見出し：何時の数か */
        h = h.replace(/<th>今日／上限<\/th>/, `<th>今日／上限<small class="v99adm-th" data-noi18n>${E(M(`（${HMS(at)} 時点・コード全体）`, ` (as of ${HMS(at)}, whole code)`, `（${HMS(at)} 时点・代码整体）`, ` (a las ${HMS(at)}, todo el código)`))}</small></th>`);
        /* 行：最後の利用の時刻（同期サーバーの accts[].last） */
        const today = new Date().toDateString();
        (R.accts || []).forEach((a) => {
          if (!a || !a.kid) return;
          const last = +a.last || 0;
          const t = last && new Date(last).toDateString() === today ? M(`最後の利用 ${HMS(last)}`, `last use ${HMS(last)}`, `最后使用 ${HMS(last)}`, `último uso ${HMS(last)}`) : M("今日の利用なし", "no use today", "今天未使用", "sin uso hoy");
          const s = `<br><small class="v99adm-last" data-noi18n data-v99last="${E(last)}">${E(t)}</small>`;
          const kid = String(a.kid).replace(/[^0-9a-zA-Z]/g, "");
          h = h.replace(new RegExp(`(<tr data-v63a="${kid}">[\\s\\S]*?<td style="white-space:nowrap">[\\s\\S]*?)(</td>)`), (m0, x, y) => x + s + y);
        });
        /* 表の上：何時の数か・コード全体の数か・同じ記録か */
        const k = '<div class="tw" style="max-height:none;margin-top:8px">';
        const i = h.lastIndexOf(k);
        h = i > 0 ? h.slice(0, i) + airNote() + h.slice(i) : h.replace(/<\/div>\s*$/, airNote() + "</div>");
        V99ADM.n.paint++;
      } catch (e) { err("air", e); }
      return h;
    };
  }

  /* ══════════ No.524 同期の記録の1行（ダッシュボードの上） ══════════ */
  function syncTxt() {
    const S = V99ADM.sync, s = v99admSes(), inAt = (s && +s.at) || 0;
    if (!inAt) return null;
    const reopen = S.open && S.open - inAt > 5000;
    const from = reopen ? S.open : inAt;
    const lead = M(`入室 ${v99admMdHms(inAt)}`, `Signed in ${v99admMdHms(inAt)}`, `进入 ${v99admMdHms(inAt)}`, `Entrada ${v99admMdHms(inAt)}`) + (reopen ? M(`・この画面を開いた ${HMS(S.open)}`, ` · this screen opened ${HMS(S.open)}`, `・打开本画面 ${HMS(S.open)}`, ` · pantalla abierta ${HMS(S.open)}`) : "");
    const sec = (t) => Math.max(0, Math.round((t - from) / 1000));
    if (S.done) {
      let t = M(`☁ 同期の記録：${lead} → 同期が終わった ${HMS(S.done)}（${sec(S.done)}秒）。同期が終わるまで、件数と利用の数は出していません（「同期中…」と出していました）。`,
        `☁ Sync record: ${lead} → sync finished ${HMS(S.done)} (${sec(S.done)} s). Counts and usage were not shown until the sync finished (“Syncing…” was shown).`,
        `☁ 同步记录：${lead} → 同步完成 ${HMS(S.done)}（${sec(S.done)} 秒）。同步完成前未显示件数和使用次数（显示“同步中…”）。`,
        `☁ Registro de sincronización: ${lead} → sincronización terminada ${HMS(S.done)} (${sec(S.done)} s). Hasta terminar no se mostraron recuentos ni uso (se mostraba «Sincronizando…»).`);
      if (S.fail) t += M(`いったん ${HMS(S.fail)} に読み込めず、その間は控えの数に印を付けて出していました。`, ` It could not load at ${HMS(S.fail)}; saved numbers were shown marked as not latest meanwhile.`, `曾在 ${HMS(S.fail)} 未能读取，期间显示了标明非最新的保存数字。`, ` No se pudo cargar a las ${HMS(S.fail)}; mientras tanto se mostraron cifras guardadas marcadas como no actuales.`);
      if (S.again) t += M(`そのあと ${HMS(S.again)} にも読み直しました。`, ` Reloaded again at ${HMS(S.again)}.`, `之后于 ${HMS(S.again)} 再次读取。`, ` Se volvió a cargar a las ${HMS(S.again)}.`);
      return { t, k: "done" };
    }
    if (S.fail) {
      const off = S.raw === "off";
      return { k: "fail", t: M(`⚠ 同期の記録：${lead} → ${HMS(S.fail)} までに最新の台帳を読み込めませんでした（${sec(S.fail)}秒・${off ? "同期サーバーにつながっていません" : "読み込みを打ち切り"}）。下の数は、この端末に控えた数です（印を付けています）。`,
        `⚠ Sync record: ${lead} → the latest ledger could not be loaded by ${HMS(S.fail)} (${sec(S.fail)} s; ${off ? "not connected to the sync server" : "loading gave up"}). The numbers below are those saved on this device (marked).`,
        `⚠ 同步记录：${lead} → 截至 ${HMS(S.fail)} 未能读取最新台账（${sec(S.fail)} 秒・${off ? "未连接同步服务器" : "已停止读取"}）。下面的数字是本设备保存的数字（已标明）。`,
        `⚠ Registro de sincronización: ${lead} → no se pudo cargar el registro actual hasta las ${HMS(S.fail)} (${sec(S.fail)} s; ${off ? "sin conexión al servidor" : "carga abandonada"}). Las cifras de abajo son las guardadas en este equipo (marcadas).`) };
    }
    const n = sec(Date.now());
    return { k: "wait", t: M(`☁ 同期の記録：${lead} → 同期中（${n}秒）。終わるまで、件数と利用の数は出しません。終わった時刻をここに残します。`, `☁ Sync record: ${lead} → syncing (${n} s). Counts and usage are not shown until it finishes; the finish time will be kept here.`, `☁ 同步记录：${lead} → 同步中（${n} 秒）。完成前不显示件数和使用次数；完成时刻会保留在这里。`, `☁ Registro de sincronización: ${lead} → sincronizando (${n} s). No se muestran recuentos ni uso hasta terminar; la hora de fin quedará aquí.`) };
  }
  function syncBox() {
    try {
      const w = document.getElementById("well");
      if (!w) return null;
      if (typeof v96admRdBox === "function") { const R = v96admRdBox(w); if (R && R.box) return R.box; }
      return w.querySelector("#admkpi") ? w.querySelector("#admkpi").parentNode : null;
    } catch (e) { return null; }
  }
  function syncPaint() {
    try {
      let p = document.getElementById("v99admSyncLog");
      if (!v99admAdm()) { if (p) p.remove(); return; }
      const T = syncTxt(), box = syncBox();
      if (!T || !box) { if (p && !box) p.remove(); return; }
      if (!p || p.parentNode !== box) {
        if (p) p.remove();
        p = document.createElement("p"); p.id = "v99admSyncLog"; p.className = "v99adm-synclog"; p.setAttribute("role", "note"); p.setAttribute("data-noi18n", "");
        const v96 = box.querySelector(":scope > .v96adm-sync");
        if (v96) v96.after(p); else box.prepend(p);
      }
      if (p.getAttribute("data-k") !== T.k) p.setAttribute("data-k", T.k);
      if (p.textContent !== T.t) p.textContent = T.t;
    } catch (e) { err("syncPaint", e); }
  }
  window.v99admSyncPaint = syncPaint;
  const RD = window.RDX;
  if (RD && RD.page && typeof RD.page.adm === "function") {
    const p0 = RD.page.adm;
    RD.page.adm = function (w) { const r = p0.apply(this, arguments); try { syncPaint(); } catch (e) { err("page.adm", e); } return r; };
  }

  /* ══════════ No.528 商社デスク・CS 横断：きっかけと時刻 ══════════ */
  function deskTxt() {
    const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || null, K = V99ADM.desk;
    if (!D) return "";
    if (D.busy && K.cur) {
      return K.cur.why === "open" ? M(`開いたので取り直しています…（開いた時刻 ${HM(K.cur.openAt || K.cur.t0)}）`, `Refreshing because you opened it… (opened ${HM(K.cur.openAt || K.cur.t0)})`, `已打开，正在重新读取…（打开时刻 ${HM(K.cur.openAt || K.cur.t0)}）`, `Actualizando al abrir… (abierto ${HM(K.cur.openAt || K.cur.t0)})`)
        : K.cur.why === "auto" ? M("ログインのあと自動で取得しています…", "Fetching automatically after sign-in…", "登录后正在自动读取…", "Obteniendo automáticamente tras iniciar sesión…")
          : M("取得中…", "Fetching…", "读取中…", "Obteniendo…");
    }
    const L = K.last;
    if (!L || !L.ok || D.err || !D.at) return "";
    const list = D.list || [], op = list.filter((x) => x && x.st === "open").length;
    const cnt = M(`担当待ち ${op}件・全部で ${list.length}件`, `awaiting an owner ${op} · ${list.length} in total`, `待分配 ${op} 件・共 ${list.length} 件`, `sin responsable ${op} · ${list.length} en total`);
    if (L.why === "open") return M(`開いた時刻 ${HM(L.openAt || L.t0)} に取り直しました：${cnt}（${HMS(D.at)} 取得）`, `Refreshed when opened at ${HM(L.openAt || L.t0)}: ${cnt} (fetched ${HMS(D.at)})`, `已在打开时刻 ${HM(L.openAt || L.t0)} 重新读取：${cnt}（${HMS(D.at)} 读取）`, `Actualizado al abrir a las ${HM(L.openAt || L.t0)}: ${cnt} (obtenido ${HMS(D.at)})`);
    if (L.why === "auto") return M(`ログインのあと自動で取得：${cnt}（${HMS(D.at)} 取得）。この欄を開く（目次・タブで移る・画面に入る）と取り直します。`, `Fetched automatically after sign-in: ${cnt} (${HMS(D.at)}). Opening this section refreshes it.`, `登录后自动读取：${cnt}（${HMS(D.at)}）。打开本栏会重新读取。`, `Obtenido automáticamente tras iniciar sesión: ${cnt} (${HMS(D.at)}). Al abrir esta sección se actualiza.`);
    return M(`「一覧を取得」で取得：${cnt}（${HMS(D.at)} 取得）`, `Fetched with “Get list”: ${cnt} (${HMS(D.at)})`, `通过“获取列表”读取：${cnt}（${HMS(D.at)}）`, `Obtenido con «Obtener lista»: ${cnt} (${HMS(D.at)})`);
  }
  window.v99admDeskPaint = function () {
    try {
      const p = document.getElementById("v96admDeskSum");
      const t = deskTxt();
      if (!p) { if (t && typeof v96admDeskHead === "function") v96admDeskHead(); return; }
      if (!t) return;
      const L = V99ADM.desk.last, C = V99ADM.desk.cur;
      const why = C ? C.why : (L ? L.why : "");
      if (p.getAttribute("data-v99why") !== why) p.setAttribute("data-v99why", why);
      if (p.textContent !== t) p.textContent = t;
    } catch (e) { err("deskPaint", e); }
  };
  if (typeof v96admDeskHead === "function") {
    const __dh99 = v96admDeskHead;
    v96admDeskHead = function () {   // eslint-disable-line no-global-assign
      const r = __dh99.apply(this, arguments);
      try { window.v99admDeskPaint(); } catch (e) { err("dh", e); }
      return r;
    };
  }
  function ibTxt() {
    const I = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.ib) || null, K = V99ADM.ib;
    if (!I || I.busy || !I.sum || !K.last || !K.last.ok) return "";
    const s = I.sum, L = K.last;
    const cnt = M(`未返信 ${s.unans}社・承認待ち ${s.pend}件・期限切れのタスク ${s.od}件（荷主 ${s.n}社）`, `unanswered ${s.unans} · awaiting approval ${s.pend} · overdue tasks ${s.od} (${s.n} shippers)`, `未回复 ${s.unans} 家・待审批 ${s.pend} 件・过期任务 ${s.od} 件（货主 ${s.n} 家）`, `sin responder ${s.unans} · por aprobar ${s.pend} · tareas vencidas ${s.od} (${s.n} cargadores)`);
    if (L.why === "open") return M(`開いた時刻 ${HM(L.t0)} に取り直しました：${cnt}（${HMS(I.at)} 取得）`, `Refreshed when opened at ${HM(L.t0)}: ${cnt} (fetched ${HMS(I.at)})`, `已在打开时刻 ${HM(L.t0)} 重新读取：${cnt}（${HMS(I.at)} 读取）`, `Actualizado al abrir a las ${HM(L.t0)}: ${cnt} (obtenido ${HMS(I.at)})`);
    if (L.why === "auto") return M(`ログインのあと自動で取得：${cnt}（${HMS(I.at)} 取得）。前の取得から3分を過ぎてから開くと取り直します（荷主ごとに読むため時間がかかります）。`, `Fetched automatically after sign-in: ${cnt} (${HMS(I.at)}). Opening it more than 3 minutes later refreshes it (it reads each shipper, so it takes time).`, `登录后自动读取：${cnt}（${HMS(I.at)}）。距上次读取超过3分钟后打开会重新读取（逐个货主读取，需要时间）。`, `Obtenido automáticamente tras iniciar sesión: ${cnt} (${HMS(I.at)}). Si lo abre pasados 3 minutos se actualiza (lee cada cargador, tarda).`);
    return M(`「最新の状態を取得」で取得：${cnt}（${HMS(I.at)} 取得）`, `Fetched with “Get the latest status”: ${cnt} (${HMS(I.at)})`, `通过“获取最新状态”读取：${cnt}（${HMS(I.at)}）`, `Obtenido con «Obtener el estado actual»: ${cnt} (${HMS(I.at)})`);
  }
  window.v99admIbPaint = function () {
    try {
      const p = document.getElementById("v96admIbSum"), t = ibTxt();
      if (!p || !t) return;
      const why = V99ADM.ib.last ? V99ADM.ib.last.why : "";
      if (p.getAttribute("data-v99why") !== why) p.setAttribute("data-v99why", why);
      if (p.textContent !== t) p.textContent = t;
    } catch (e) { err("ibPaint", e); }
  };
  if (typeof v96admIbHead === "function") {
    const __ih99 = v96admIbHead;
    v96admIbHead = function () {   // eslint-disable-line no-global-assign
      const r = __ih99.apply(this, arguments);
      try { window.v99admIbPaint(); } catch (e) { err("ih", e); }
      return r;
    };
  }

  /* ══════════ No.501（11/19 決め）：やりとりの投稿者の「自己申告」の札の説明を、今の決めの文に ══════════ */
  function selfTitle() {
    try {
      const t = M("確かめていないお名前です（体験用の共通のコードでは、お名前は確かめません。お名前を確かめるには、個別のアカウント〔メールアドレスとパスワード〕を使います）",
        "Unverified name (names are not verified with a shared trial code; use an individual account with email and password to verify a name)",
        "未核实的姓名（共用体验代码不核对姓名；如需核对，请使用个人账户〔邮箱和密码〕）",
        "Nombre no verificado (con un código de prueba compartido no se verifica el nombre; para verificarlo, use una cuenta individual con correo y contraseña)");
      document.querySelectorAll("#mlist .v97ai-self").forEach((s) => { if (s.title !== t) s.title = t; });
    } catch (e) { err("selfTitle", e); }
  }
  if (typeof mRows === "function") {
    const __mr99 = mRows;
    mRows = function () {   // eslint-disable-line no-global-assign
      const r = __mr99.apply(this, arguments);
      try { setTimeout(selfTitle, 50); setTimeout(selfTitle, 500); } catch (e) { err("mrows", e); }
      return r;
    };
  }

  /* ══════════ ボタン（委譲） ══════════ */
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v99adm]");
      if (!b) return;
      const k = b.getAttribute("data-v99adm");
      if (k === "airre") {
        ev.preventDefault();
        if (typeof V63A !== "undefined" && V63A) V63A.admAt = 0;
        if (typeof v99admAirPull === "function") v99admAirPull("btn");
      }
    } catch (e) { err("click", e); }
  }, true);

  /* ══════════ 見張り（0.5秒ごと）：同期の記録の1行・商社デスク／CS 横断の見出し ══════════ */
  setInterval(() => {
    try {
      if (!v99admAdm()) return;
      syncPaint();
      const d = document.getElementById("v96admDeskSum");
      if (d && V99ADM.desk.last && !d.hasAttribute("data-v99why")) window.v99admDeskPaint();
      else if (d && V99ADM.desk.last) { const t = deskTxt(); if (t && d.textContent !== t) window.v99admDeskPaint(); }
      const i = document.getElementById("v96admIbSum");
      if (i && V99ADM.ib.last) { const t = ibTxt(); if (t && i.textContent !== t) window.v99admIbPaint(); }
    } catch (e) { err("tick", e); }
  }, 500);
})();
