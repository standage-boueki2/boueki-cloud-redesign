/* 貿易クラウドAI商社マン：STANDAGE のサービスを、貿易の段階に合わせて AI商社マンから提案する（xs の層・2026-11-22 大森さん）
   依頼：「STANDAGE の各クロスセルメニュー（全てを漏れなく）／商社機能／物流機能／ブロックチェーン決済 等を、能動的に、適切なタイミングで、
          わかりやすく・シンプルに・簡潔に、AI商社マンより提案する機能」
   メニューの正本：クロスセルメニュー表（Google スプレッドシート 129rnr1W…「メニュー表」・2026-11-22 読み取り）。
     改訂中のシート「（セン工事中）メニュー表」にだけある項目（立体商標・意匠・特許・商標の更新・拒絶理由の対応・侵害の監視・税関への登録、
     LP の追加・修正・サーバー、会社紹介動画）も足した（src:"改訂中"）。デジタルチームは「白セルのみ受注OK」＝灰色の行は出さない。
     YAICHI・Coupang は「運用停止中」＝一覧には載せるが提案しない。
   決まり：金額は画面に出さない（貿易クラウドの資料に当社の金額を書かない＝担当からお見積り）。架空の数字は出さない（理由はお客様のデータから）。
   いつ出すか：
     ・貿易ジャーニーの7つのステップ（rd_v94jny と同じ）のいまの段階と、商材（AI商社マンの業種）・販売先国・商談の進み・目標（目的・販路）で、
       メニューごとの「出す条件」を見る。出すのは 1度に1つ（ホーム・今日やること・AIに相談の上）。
     ・新しい段階に進んだときはすぐ。そうでなければ「目標と道筋」の提案の頻度の設定（控えめ14日・ふつう7日・こまめ3日・止める）の間をあける。
     ・「今は要らない」はそのメニューを 90日、同じチームを 30日出さない。「あとで」は 3日。2回続けて「今は要らない」なら、頻度を1段控えめに。
   相談：「STANDAGE に相談する」は同期サーバーの svc_put（新しい受け口）で STANDAGE の担当に届ける。受け口の無い同期サーバー・つながらないときは、
     送れていないことをそのまま出し、担当に伝える文をコピーできるようにする（送ったことにしない）。体験用のアカウントは届けない（サーバーが判定）。 */
(function () {
  "use strict";
  if (window.XS && window.XS.v) return;
  const XS = (window.XS = { v: "xs1", mem: { v: 1, cos: {} }, busy: {} });
  const LS = "bc20_xs_v1";
  const DAY = 864e5;
  const now = () => Date.now();
  const S = (v, n) => String(v == null ? "" : v).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n || 200);
  const G = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const ten = () => { try { return typeof TEN !== "undefined" && TEN ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dat = () => { try { return typeof D !== "undefined" && D ? D : ten(); } catch (e) { return ten(); } }; // eslint-disable-line no-undef

  /* ───── メニュー（全部）。st＝主に合う段階（1 商品／2 国／3 規制／4 資料／5 商談／6 見積・契約／7 書類・出荷・入金）
     on：on＝受けている／stop＝運用停止中（提案しない）／soon＝準備中（話を聞くだけ）
     plans：メニュー表の行（プラン・内容）。self：お客様が自分で進める画面（あれば） ───── */
  const M = [
    // 規制チーム（化粧品 PIF は追加予定）・CS の FDA／TTB
    { id: "rg_survey", team: "規制チーム", grp: "規制", nm: "規制調査", one: "売る国の決まり（輸入の可否・成分・表示・登録）を、専門のチームが商品ごとに調べます", st: [3], plans: ["規制調査（3SKU・1か国）"], self: ["ops:reg", "規制を調べる（AI）"] },
    { id: "rg_fda", team: "規制チーム・CS", grp: "規制", nm: "FDA の登録（米国）", one: "米国へ食品・化粧品を出すときに要る FDA の施設登録・番号の取得・化粧品の登録を代行します", st: [3], plans: ["DUNS 番号の取得", "FEI 番号の取得", "施設登録（食品・化粧品）", "化粧品の商品リスティング（Product Listing）", "登録の更新"] },
    { id: "cs_ttb", team: "CS", grp: "規制", nm: "酒類のラベル登録（米国 TTB）", one: "米国で日本酒・酒類を売るためのラベルの登録（COLA）を、銘柄ごとに代行します", st: [3], plans: ["TTB 登録（1銘柄）", "銘柄の追加"] },
    { id: "rg_nutri", team: "規制チーム", grp: "規制", nm: "食品の栄養成分分析", one: "香港・米国の表示に要る栄養成分を分析し、ラベルの数字をそろえます", st: [3, 4], plans: ["食品の栄養成分分析（香港・1SKU）", "食品の栄養成分分析（アメリカ・1SKU）"] },
    { id: "rg_sds", team: "規制チーム", grp: "規制", nm: "SDS・GHS ラベル", one: "化学品・液体などの安全データシート（SDS）と GHS ラベルを、英語・輸出先の決まりで作ります", st: [3, 7], plans: ["日英 SDS・GHS ラベルの翻訳（1SKU）", "英語 SDS・GHS ラベルの作成（輸出先の規制・1SKU）"] },
    { id: "rg_ce", team: "規制チーム", grp: "規制", nm: "EU の CE マーキング", one: "EU で電気製品・機械・医療機器などを売るのに要る CE マーキングの取得を支援します", st: [3], plans: ["EU CE マーキング認証支援（内容次第）"] },
    { id: "rg_pif", team: "規制チーム", grp: "規制", nm: "化粧品の PIF（製品情報ファイル）", one: "EU・ASEAN で化粧品を売るときに要る PIF の作成・申請を支援します", st: [3], plans: ["化粧品の PIF 認証申請（内容次第）"] },
    { id: "rg_frag", team: "規制チーム", grp: "規制", nm: "香料処方のリニューアル", one: "輸出先で使えない香料・アレルゲンがあるとき、処方への影響まで見て代わりの香料を提案します", st: [3], plans: ["香料処方リニューアル・コンサルティング（基本 9SKU／30SKU）"] },
    // 商標チーム
    { id: "tm_search", team: "商標チーム", grp: "商標", nm: "商標調査（国ごと）", one: "売る国で、同じ・似た商標が先に登録されていないかを確かめます（名前を変える羽目にならないように）", st: [2, 3], plans: ["商標調査（国ごと・約50か国・地域）"] },
    { id: "tm_apply", team: "商標チーム", grp: "商標", nm: "商標の出願（国ごと・マドプロ）", one: "売る国で商品名・ロゴを商標として出願します。3か国以上はマドプロ（国際出願）もご相談ください", st: [3, 4], plans: ["商標申請（国ごと・約50か国・地域）", "マドプロ（国際出願）"] },
    { id: "tm_guard", team: "商標チーム", grp: "商標", nm: "模倣品の対策（侵害の監視・税関への登録）", one: "取引が始まったら、似た商品・商標の見張りと、税関への商標の登録で模倣品を止めます", st: [7], src: "改訂中", plans: ["商標の侵害監視", "税関への商標登録（模倣品対策）"] },
    { id: "tm_ip", team: "商標チーム", grp: "商標", nm: "形・デザイン・技術の権利（立体商標・意匠・特許）", one: "形やデザイン・技術に特徴がある商品は、立体商標・意匠・特許で守れます", st: [1, 3], src: "改訂中", plans: ["立体商標（形状商標）の申請", "意匠（デザイン）登録の申請", "特許の申請"] },
    { id: "tm_keep", team: "商標チーム", grp: "商標", nm: "商標の更新・拒絶理由への対応", one: "登録した商標の更新と、審査で拒絶理由が届いたときの対応・再審を代行します", st: [7], src: "改訂中", plans: ["商標の更新（存続期間の更新）", "拒絶理由への対応・再審"] },
    // クリエイティブチーム
    { id: "c_photo", team: "クリエイティブチーム", grp: "資料・発信", nm: "写真・動画の撮影と編集", one: "海外のバイヤーに伝わる商品・製造現場の写真と、会社紹介の動画を撮ります", st: [1, 4], plans: ["SHOWCASE パッケージ（おまかせ SHOT）", "商品・製造現場の写真（1日）", "YouTube 用の会社紹介動画（横型）", "編集"] },
    { id: "c_lp", team: "クリエイティブチーム", grp: "資料・発信", nm: "英語の LP・Web サイト", one: "バイヤーが「あとで調べる」ときに見る英語のページを作ります（修正・ページの追加・サーバーの管理も）", st: [4, 5], plans: ["英語 LP（1ページ）", "LP の修正（月2回まで）", "ページの追加・商品別 LP・言語の追加", "サーバー・ドメインの管理"] },
    { id: "c_ads", team: "クリエイティブチーム", grp: "資料・発信", nm: "Google 広告（バイヤー開拓プラン）", one: "英語の LP と Google 広告で、海外のバイヤーから問い合わせが来る入口を作ります", st: [5], plans: ["バイヤー開拓プラン（英語 LP＋Google 広告3か月）", "GROWTH パッケージ（Google Ads）", "Google 広告の運用代行（単品3か月）"] },
    { id: "c_ig", team: "クリエイティブチーム", grp: "資料・発信", nm: "Instagram の運用・広告", one: "海外の消費者・小売に向けて、Instagram の投稿と広告でブランドを知ってもらいます", st: [5, 7], plans: ["Instagram 運用代行（新規／既存・更新）", "Instagram 広告の運用代行", "ブランド認知プラン（英語 LP＋Instagram 運用＋広告）"] },
    { id: "c_catalog", team: "クリエイティブチーム", grp: "資料・発信", nm: "カタログ・ポスター", one: "展示会や商談で手渡す外国語のカタログ・ポスターを作ります", st: [4, 5], plans: ["カタログ・ポスター（内容次第）"] },
    { id: "c_pkg", team: "クリエイティブチーム", grp: "資料・発信", nm: "パッケージ制作", one: "輸出先の表示の決まりと好みに合わせて、パッケージ・ラベルを作り直します", st: [3, 4], plans: ["パッケージ制作（内容次第）"] },
    { id: "c_logo", team: "クリエイティブチーム", grp: "資料・発信", nm: "ロゴ作成", one: "海外で覚えてもらえるロゴを作ります（商標の出願の前に）", st: [1, 2], plans: ["ロゴ作成（内容次第）"] },
    { id: "cs_pr", team: "CS", grp: "資料・発信", nm: "プレスリリースの配信", one: "海外のメディアに新商品・進出のニュースを配信し、バイヤーに見つけてもらいます", st: [5], plans: ["1リリース・1か国", "3リリース・3か国", "配信国の追加"] },
    // 販路（クラファン・ライブコマース・EC・展示会）
    { id: "ex", team: "展示会チーム", grp: "販路", nm: "展示会（アテンド・共同出展・単独出展）", one: "対面で商談できる展示会に、通訳つきのアテンドや共同出展で出られます", st: [5], plans: ["国内のアテンド（1日）", "海外のアテンド（1日）", "共同出展プラン", "単独出展プラン（内容次第）"] },
    { id: "cf", team: "クラファンチーム", grp: "販路", nm: "クラウドファンディング（Kickstarter など）", one: "海外の消費者に先に買ってもらい、売れるかどうかとファンを同時に確かめます", st: [5], plans: ["Bronze", "Silver", "Gold（広告費は別）"] },
    { id: "lc_red", team: "ライブコマースチーム", grp: "販路", nm: "小紅書（RED）の発信・ライブコマース", one: "中国語圏の消費者に、KOC の投稿・自社アカウント・ライブで知ってもらいます", st: [5], plans: ["KOC 投稿（15／20／30件・ライブつき）", "自社アカウントの運用（3か月・広告つきも）", "アカウント開設・年間更新・広告の運営代行"] },
    { id: "lc_shopee", team: "ライブコマースチーム", grp: "販路", nm: "Shopee のライブ配信（台湾・シンガポール）", one: "Shopee 台湾・シンガポールで、2か月・4回のライブ配信で売ります", st: [5], plans: ["Shopee 台湾（2か月・ライブ4回）", "Shopee シンガポール（2か月・ライブ4回）"] },
    { id: "dg_shopee", team: "デジタルチーム", grp: "販路", nm: "Shopee の出店・運営代行", one: "東南アジア・台湾の Shopee に出店し、商品の掲載・お店の運営・月次のレポートまで代行します", st: [5], plans: ["アカウント開設（1か国）", "出品代行：商品掲載", "EC サイトの運営", "月次レポート"] },
    { id: "dg_amazon", team: "デジタルチーム", grp: "販路", nm: "Amazon の出品・運営代行", one: "Amazon への商品の掲載と運営・レポートを代行します", st: [5], plans: ["出品代行：商品掲載", "EC サイトの運営", "レポート作成"] },
    { id: "dg_yaichi", team: "デジタルチーム", grp: "販路", nm: "YAICHI", one: "現在は運用を止めています", st: [5], on: "stop", plans: ["（運用停止中）"] },
    { id: "dg_coupang", team: "デジタルチーム", grp: "販路", nm: "Coupang（韓国）", one: "現在は運用を止めています", st: [5], on: "stop", plans: ["（運用停止中）"] },
    // 物流チーム・STANDAGE の機能
    { id: "lg_coo", team: "物流チーム", grp: "物流・決済", nm: "原産地の登録と原産地証明書（EPA）", one: "原産地の登録（1品目・1協定ごと）と、特定原産地証明書の申請を代行します", st: [6, 7], plans: ["原産地登録サポート（1SKU・1協定）", "特定原産地証明書の発給の申請代行（1申請）"], self: ["ops:doc", "書類をつくる"] },
    { id: "fn_trade", team: "STANDAGE（商社）", grp: "物流・決済", nm: "STANDAGE が商社として間に入る", one: "初めての取引・代金の回収が心配な相手は、STANDAGE が輸出者になり、書類・通関・代金の回収を引き受けます", st: [6], fn: 1, plans: ["間接貿易（STANDAGE が輸出者）", "手数料込みのオファーを AI が計算", "商社デスクで担当とやりとり"], self: ["case", "商流を決める（案件の画面）"] },
    { id: "fn_logi", team: "STANDAGE（物流）", grp: "物流・決済", nm: "物流の見積・出荷の手配", one: "見積に入れる送料を物流会社に一度に頼み、仮押さえ・出荷の手配まで進めます", st: [6, 7], fn: 1, plans: ["物流会社への見積の依頼（相見積）", "仮押さえ・出荷の手配"], self: ["ops:ship", "出荷を進める"] },
    { id: "fn_pay", team: "STANDAGE（決済）", grp: "物流・決済", nm: "ブロックチェーン決済", one: "代金と船荷証券をデジタルの金庫で同時に交換し、「送ったのに払われない」を防ぐ仕組みです（準備中）", st: [6], fn: 1, on: "soon", plans: ["代金と船荷証券の同時交換（デジタル金庫）"] },
  ];
  XS.menu = M;
  XS.step = ["", "商品を整える", "売る国を決める", "規制を確かめる", "資料をつくる", "相手を探して商談", "見積・契約", "書類・出荷・入金"];

  /* ───── 国（ISO）と商材 ───── */
  const CC = (x) => { try { const f = G("v85docCC"); return f ? f(x) : ""; } catch (e) { return ""; } };
  const EU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
  const ASEAN = ["SG", "TH", "VN", "MY", "ID", "PH", "BN", "KH", "LA", "MM"];
  const CN3 = ["CN", "HK", "TW", "MO"]; // 小紅書（RED）が届く中国語圏
  const SHOPEE = ["TW", "SG", "MY", "TH", "PH", "VN", "ID", "BR"];
  const SHOPEE_LIVE = ["TW", "SG"];
  const TM_CC = ["TW", "HK", "CN", "MO", "JP", "KR", "SG", "MY", "TH", "PH", "VN", "ID", "KH", "LA", "BN", "IN", "TR", "PK", "US", "CA", "GB", "FR", "DE", "CH", "IT", "BE", "NL", "LU", "ES", "NO", "DK", "SE", "AU", "NZ", "BR", "AR", "MX", "PE", "CL", "CO", "PY", "UY", "AE", "SA", "QA", "KW", "OM", "BH", "IL", "ZA", "EG", "NG", "MN"].concat(EU);
  const has = (L, A) => L.some((c) => A.indexOf(c) >= 0);
  function prof() { try { const f = G("v88Prof"); return f ? f() : "other"; } catch (e) { return "other"; } }
  function goal() { try { const g = G("v88Goal"), r = G("v88Get"); return g && r ? g(r()) : null; } catch (e) { return null; } }
  function textOf(T, Dd) {
    const out = [];
    const take = (o) => { if (!o || typeof o !== "object") return; Object.keys(o).forEach((k) => { if (!/item|name|nm|desc|tagline|feat|spec|ingr|mat|cat|comp|cert|strength|use|cont/i.test(k)) return; const v = o[k]; if (typeof v === "string") out.push(v); else if (Array.isArray(v)) v.slice(0, 40).forEach((x) => { if (typeof x === "string") out.push(x); else if (Array.isArray(x)) out.push(x.filter((y) => typeof y === "string").join(" ")); else if (x && typeof x === "object") out.push(Object.values(x).filter((y) => typeof y === "string").join(" ")); }); }); };
    take(T); if (Dd !== T) take(Dd);
    return out.join(" ").slice(0, 8000);
  }

  /* ───── いまの状況（お客様のデータだけから） ───── */
  const ORD = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5, 失注: -1 };
  function stShort(s) { s = String(s || ""); const k = Object.keys(ORD).find((x) => s.indexOf(x) >= 0); return k || s; }
  XS.ctx = function (jny) {
    const T = ten() || {}, Dd = dat() || T;
    const c = { T, Dd, prof: prof(), goal: goal() };
    let chosen = [];
    try { const f = G("ctyChosen"); chosen = f ? f() : []; } catch (e) { chosen = []; }
    if (!chosen.length) { try { const f = G("v88Targets"); chosen = f ? f() : []; } catch (e) { chosen = []; } }
    c.ctyNm = chosen.slice(0, 6);
    c.cc = Array.from(new Set(c.ctyNm.map(CC).filter(Boolean)));
    const TH = Object.values(T.dmThreads || {}).filter((th) => th && Array.isArray(th.msgs));
    c.dealCc = Array.from(new Set(TH.map((th) => CC(th.cty)).filter(Boolean)));
    c.allCc = Array.from(new Set(c.cc.concat(c.dealCc)));
    c.best = TH.reduce((m, th) => Math.max(m, ORD[stShort(th.status)] == null ? 0 : ORD[stShort(th.status)]), -1);
    (Array.isArray(T.fbx) ? T.fbx : []).forEach((f) => { const s = String((f && f.st) || ""); if (/取引中|受注|成約/.test(s)) c.best = Math.max(c.best, 5); else if (/契約/.test(s)) c.best = Math.max(c.best, 4); else if (/見積/.test(s)) c.best = Math.max(c.best, 3); else if (/サンプル/.test(s)) c.best = Math.max(c.best, 2); });
    c.won = c.best >= 5;
    c.sent = (Array.isArray(T.outreach) ? T.outreach.length : 0) + TH.filter((th) => th.msgs.some((m) => m && m.w === "me")).length;
    c.replied = TH.filter((th) => th.msgs.some((m) => m && m.w === "by")).length;
    c.threads = TH.length;
    c.deck = Array.isArray(T.deckGen) && T.deckGen.length > 0;
    const tcs = (T.v75tc && T.v75tc.cases) || {};
    c.route = Object.keys(tcs).some((k) => tcs[k] && tcs[k].route);
    c.routeStg = Object.keys(tcs).some((k) => tcs[k] && (tcs[k].route === "indirect" || tcs[k].stg));
    c.regs = Dd && Dd.regs ? Dd.regs : {};
    c.regMissing = c.ctyNm.filter((n) => !c.regs[n]);
    c.txt = textOf(T, Dd);
    c.item = S(T.item || Dd.item, 80);
    c.purp = (c.goal && Array.isArray(c.goal.purp)) ? c.goal.purp : [];
    c.ch = (c.goal && Array.isArray(c.goal.ch)) ? c.goal.ch : [];
    c.exp = (c.goal && Array.isArray(c.goal.exp)) ? c.goal.exp : [];
    // 段階：貿易ジャーニーの現在地（rd_v94jny の RD.jnyNow）。無い版は v88 の段階から読み替える
    c.jny = jny || null;
    if (jny && jny.S) { c.step = (jny.S[jny.now] || {}).no || 1; c.pct = jny.S.map((s) => s.pct); }
    else {
      let st = 0; try { const f = G("v88StageNow"); st = f ? f().stage : 0; } catch (e) { st = 0; }
      c.step = st <= 1 ? 1 : st === 2 ? 2 : st === 3 ? 3 : st === 4 ? 4 : st <= 6 ? 5 : st <= 8 ? 6 : 7;
      c.pct = null;
    }
    c.hasProduct = !!(T && T.item);
    return c;
  };

  /* ───── メニューごとの「いま出す理由」。null＝いまは出さない。w＝強さ（大きいほど先） ───── */
  const re = (r, s) => r.test(s || "");
  const nm = (c, L) => { const out = []; c.ctyNm.forEach((n) => { if (L.indexOf(CC(n)) >= 0) out.push(n); }); return out; };
  const nmAll = (c, L) => { const out = c.ctyNm.filter((n) => L.indexOf(CC(n)) >= 0); return out.length ? out : []; };
  const consumer = (c) => ["food", "alcohol", "supp", "cosme", "fresh", "goods"].indexOf(c.prof) >= 0 || c.ch.some((x) => x === "retail" || x === "ec");
  const brand = (c) => c.purp.indexOf("brand") >= 0;
  const W = {
    rg_survey: (c) => (c.step >= 3 && c.regMissing.length ? { w: 70, why: `${c.regMissing.slice(0, 3).join("・")}の規制の表がまだありません。売れない・止まる国を先に外すのが近道です` } : (c.step === 3 && c.jny && c.pct && c.pct[2] < 100 && c.cc.length ? { w: 55, why: `規制を確かめる段階です（いま ${c.pct[2]}%）。自分で調べきれない国・成分は専門のチームに頼めます` } : null)),
    rg_fda: (c) => (has(c.allCc, ["US"]) && ["food", "supp", "cosme", "fresh", "alcohol"].indexOf(c.prof) >= 0 && c.step >= 3 ? { w: 80, why: `米国${c.cc.indexOf("US") >= 0 ? "を販売先に選んでいます" : "の相手と商談しています"}。${c.prof === "cosme" ? "化粧品は MoCRA で施設登録と商品の登録が要ります" : "食品・飲料を出すには FDA の施設登録と事前通報が要ります"}` } : null),
    cs_ttb: (c) => (has(c.allCc, ["US"]) && c.prof === "alcohol" && c.step >= 3 ? { w: 85, why: `米国${c.cc.indexOf("US") >= 0 ? "を販売先に選んでいます" : "の相手と商談しています"}。お酒は銘柄ごとにラベルの登録（TTB）が済まないと米国で売れません` } : null),
    rg_nutri: (c) => (has(c.allCc, ["US", "HK"]) && ["food", "supp"].indexOf(c.prof) >= 0 && c.step >= 3 ? { w: 60, why: `${nmAll(c, ["US", "HK"]).join("・") || "米国・香港の相手"}向けの表示には、栄養成分の数字（分析の結果）が要ります` } : null),
    rg_sds: (c) => ((["ind", "elec"].indexOf(c.prof) >= 0 || re(/化学|塗料|洗剤|除菌|溶剤|樹脂|接着|潤滑|オイル|アルコール製剤|電池|バッテリー|リチウム|スプレー|エアゾール|液体|chemical|solvent|aerosol|battery/i, c.txt)) && c.step >= 3 ? { w: 50, why: "化学品・液体・電池などは、輸送と輸入で SDS（英語）と GHS ラベルを求められます" } : null),
    rg_ce: (c) => (has(c.allCc, EU) && (["elec", "med", "ind"].indexOf(c.prof) >= 0 || re(/おもちゃ|玩具|toy|機械|電気|電源|充電/i, c.txt)) && c.step >= 3 ? { w: 65, why: `${nmAll(c, EU).join("・") || "EU"}で売るには、この商材は CE マーキングが要ることが多いです` } : null),
    rg_pif: (c) => (c.prof === "cosme" && has(c.allCc, EU.concat(ASEAN).concat(["GB"])) && c.step >= 3 ? { w: 70, why: `${nmAll(c, EU.concat(ASEAN).concat(["GB"])).join("・") || "EU・ASEAN"}で化粧品を売るには、製品情報ファイル（PIF）を用意します` } : null),
    rg_frag: (c) => (c.prof === "cosme" && re(/香料|フレグランス|香り|fragrance|parfum|perfume|精油|エッセンシャルオイル/i, c.txt) && has(c.allCc, EU.concat(["GB", "US", "CN"])) && c.step >= 3 ? { w: 45, why: "香料は国ごとに使えない成分・表示が要るアレルゲンが違います。売る国に合わない香料があれば代わりを提案します" } : null),
    tm_search: (c) => (c.step >= 2 && c.step <= 5 && has(c.cc, TM_CC) ? { w: 62, why: `${nmAll(c, TM_CC).slice(0, 3).join("・")}を販売先に選びました。営業を始める前に、商品名が先に登録されていないかを確かめるのが安全です` } : null),
    tm_apply: (c) => (c.step >= 4 && c.step <= 6 && (c.sent > 0 || c.deck) && has(c.cc, TM_CC) ? { w: 40, why: `${nmAll(c, TM_CC).slice(0, 3).join("・")}で営業を始めています。売れ始める前に商品名・ロゴを出願しておくと、模倣と名前の取り合いを防げます${c.cc.length >= 3 ? "（3か国以上ならマドプロも）" : ""}` } : null),
    tm_guard: (c) => (c.won && consumer(c) ? { w: 55, why: "取引が始まりました。売れ始めると似た商品・偽物が出やすくなります。見張りと税関への登録で止められます" } : null),
    tm_ip: (c) => ((["ind", "elec", "goods", "med"].indexOf(c.prof) >= 0) && re(/特許|意匠|独自|独特|オリジナル|形状|デザイン|patent|design/i, c.txt) && c.step >= 1 && c.step <= 4 ? { w: 25, why: "形・デザイン・技術に特徴がある商品です。輸出先で真似される前に、権利で守る方法があります" } : null),
    tm_keep: () => null, // 更新・拒絶理由はお客様の登録の状況が分からないので、一覧だけ（自分からは出さない）
    c_photo: (c) => (c.step >= 1 && c.step <= 5 && !c.deck && c.hasProduct && c.step >= 4 ? { w: 45, why: "営業資料を作る段階です。写真がそろうと、資料・LP・EC の掲載まで同じ素材で使えます" } : (c.step === 4 && c.deck && c.jny && c.pct && c.pct[3] < 100 ? { w: 35, why: `営業資料の完成度は ${c.pct[3]}% です。写真・動画を足すと、バイヤーの返事が増えやすくなります` } : null)),
    c_lp: (c) => (c.step >= 4 && c.step <= 6 && c.deck && c.sent >= 5 && !re(/https?:\/\//, String((c.Dd && (c.Dd.web || c.Dd.url || c.Dd.hp)) || "")) ? { w: 40, why: "連絡を受けたバイヤーは、まず英語のサイトで会社と商品を確かめます。英語のページがあると返事が来やすくなります" } : null),
    c_ads: (c) => (c.step >= 5 && c.sent >= 20 && c.replied * 10 < c.sent ? { w: 50, why: `連絡 ${c.sent}件に対して返事 ${c.replied}件です。広告で「向こうから問い合わせが来る」入口を足せます` } : null),
    c_ig: (c) => (c.step >= 5 && consumer(c) && (brand(c) || c.ch.some((x) => x === "retail" || x === "ec") || c.won) ? { w: 38, why: brand(c) ? "目標は「自社ブランドを海外に広げる」です。消費者に知られると、小売・代理店の商談が進みやすくなります" : "消費者向けの商品です。現地で知られていると、取扱いを決めてもらいやすくなります" } : null),
    c_catalog: (c) => (c.step >= 4 && c.step <= 5 && (c.exp.indexOf("fair") >= 0) ? { w: 30, why: "展示会に出る予定です。手渡しのカタログ・ポスターがあると、ブースでの話が名刺交換で終わりません" } : null),
    c_pkg: (c) => (c.step >= 3 && c.step <= 5 && consumer(c) && c.cc.length && c.ctyNm.some((n) => { const r = c.regs[n]; return r && re(/ラベル|表示|label/i, JSON.stringify(r).slice(0, 20000)); }) ? { w: 35, why: "売る国で、表示（ラベル）の決まりがあります。現地の言葉と決まりに合わせたパッケージ・ラベルが要ります" } : null),
    c_logo: (c) => (c.step <= 2 && brand(c) ? { w: 20, why: "自社ブランドで海外に出る目標です。商標の出願の前にロゴを決めておくと、出願が一度で済みます" } : null),
    cs_pr: (c) => (c.step >= 5 && c.step <= 7 && (brand(c) || c.won) && c.cc.length ? { w: 28, why: `${c.ctyNm.slice(0, 2).join("・")}のメディアにニュースを出すと、バイヤーが見つけてくれる入口が増えます` } : null),
    ex: (c) => (c.step >= 5 && c.step <= 6 && (c.exp.indexOf("fair") >= 0 || (c.sent >= 15 && c.best < 1)) ? { w: 48, why: c.exp.indexOf("fair") >= 0 ? "目標で「展示会への出展」を選んでいます。対面の商談は取引までが速い手段です" : `連絡 ${c.sent}件でまだ商談になっていません。対面の展示会は、STANDAGE の記録では取引が始まった商談で最も多い手段です` } : null),
    cf: (c) => (c.step >= 4 && c.step <= 5 && ["goods", "elec", "food"].indexOf(c.prof) >= 0 && (c.purp.indexOf("test") >= 0 || brand(c)) && has(c.cc.length ? c.cc : ["US"], ["US", "CA", "GB"].concat(EU)) ? { w: 42, why: "テスト販売・ブランドを目指す商品です。クラウドファンディングなら、作る前に海外の消費者の反応とお金が集まります" } : null),
    lc_red: (c) => (c.step >= 4 && has(c.allCc, CN3) && consumer(c) ? { w: 52, why: `${nmAll(c, CN3).join("・") || "中国語圏の相手"}向けです。中国語圏の消費者は小紅書（RED）で商品を調べてから買います` } : null),
    lc_shopee: (c) => (c.step >= 4 && has(c.allCc, SHOPEE_LIVE) && consumer(c) ? { w: 46, why: `${nmAll(c, SHOPEE_LIVE).join("・") || "台湾・シンガポール"}向けです。Shopee のライブ配信で、短い期間に消費者の反応を見られます` } : null),
    dg_shopee: (c) => (c.step >= 5 && has(c.allCc, SHOPEE) && consumer(c) && (c.ch.indexOf("ec") >= 0 || c.purp.indexOf("test") >= 0 || c.sent >= 10) ? { w: 44, why: `${nmAll(c, SHOPEE).join("・") || "東南アジア・台湾"}は Shopee が大きな売り場です。代理店が決まる前から、消費者に直接売れます` } : null),
    dg_amazon: (c) => (c.step >= 5 && has(c.allCc, ["US", "GB", "DE", "FR", "IT", "ES", "JP", "CA", "AU", "SG", "AE"]) && consumer(c) && c.ch.indexOf("ec") >= 0 ? { w: 40, why: "販路に EC を選んでいます。Amazon は掲載と運営を代行できます" } : null),
    dg_yaichi: () => null,
    dg_coupang: () => null,
    // 22.01.2 の検証 x1-1：関税が 0% の国（シンガポール・香港など）に「関税が下がる」と言わない。EPA があり、アプリの関税率（v56priceDuty＝市場のページ・価格の画面と同じ数）が 0% より大きい国だけ。分からない国は出さない
    lg_coo: (c) => {
      if (c.step < 6 && c.best < 3) return null;
      const ep = G("v85docEpaOf"), cn = G("v85docCName"), du = G("v56priceDuty");
      if (!ep || !du) return null;
      const L = [];
      c.allCc.forEach((x) => {
        if (x === "US") return;
        let e = null; try { e = ep(x); } catch (er) { e = null; }
        if (!e || !(e.ag || []).length) return;
        const name = (cn && cn(x)) || x;
        let d = null; try { d = du(name); } catch (er) { d = null; }
        const n = d && d.n != null && isFinite(+d.n) ? +d.n : null;
        if (n != null && n > 0) L.push({ name, n, ref: d.src !== "item" });
      });
      return L.length ? { w: 58, why: `${L.slice(0, 3).map((y) => `${y.name}（${y.ref ? "関税の目安" : "いまの関税"} ${Math.round(y.n * 10) / 10}%）`).join("・")}は日本と EPA があります。原産地を証明できれば、この関税が下がることがあります` } : null;
    },
    fn_trade: (c) => (c.best >= 2 && !c.route ? { w: 90, why: `${c.best >= 4 ? "契約・取引" : "サンプル・見積"}の段階の相手がいるのに、商流（直接／STANDAGE が間に入る）がまだ決まっていません。初めての相手・代金の回収が心配な相手は、STANDAGE に任せると安全です` } : null),
    fn_logi: (c) => (c.best >= 3 ? { w: c.best >= 5 ? 75 : 60, why: c.best >= 5 ? "取引が始まりました。出荷の手配（物流会社の見積・仮押さえ）をここから進められます" : "見積を出す段階です。送料を物流会社にまとめて見積もってもらうと、CIF・DDP の価格を正しく出せます" } : null),
    fn_pay: (c) => (c.best >= 3 && c.best <= 5 ? { w: 30, why: "支払条件を決める段階です。前払い・L/C の代わりに、代金と船荷証券を同時に交換する決済を STANDAGE が準備しています" } : null),
  };

  /* ───── 並べる：いま出す理由があるもの（理由・強さ・段階の近さ） ───── */
  XS.rank = function (jny) {
    const c = XS.ctx(jny);
    const R = XS.rec();
    const out = [];
    // 22.01.2 の検証 x1-1：いまの段階より前に「抜け」（100% でない段階）があれば、その段階のサービスを先に（貿易ジャーニーの「抜けを埋める」と同じ考え）
    const gaps = (c.jny && Array.isArray(c.jny.gaps)) ? c.jny.gaps.map((s) => s && s.no).filter(Boolean) : [];
    M.forEach((m) => {
      if (m.on === "stop") return;
      let r = null; try { r = W[m.id] ? W[m.id](c) : null; } catch (e) { r = null; }
      if (!r) return;
      let w = r.w, at = c.step, gap = 0;
      const g = m.st.find((s) => gaps.indexOf(s) >= 0);
      if (g) { w += 28; at = g; gap = 1; }
      else if (m.st.indexOf(c.step) >= 0) w += 20;
      else if (Math.min.apply(null, m.st) > c.step) { w -= 25; at = m.st[0]; }
      else at = m.st[m.st.length - 1];
      const a = R.asks.find((x) => x && x.m === m.id);
      out.push({ m, why: S(r.why, 220), w, at, gap, asked: !!a, ask: a || null });
    });
    out.sort((a, b) => b.w - a.w);
    return { c, list: out };
  };
  /* 出してよいもの（相談済み・今は要らない・同じチームを控えている を除く）。カードと「いまのおすすめ」は同じ並び */
  XS.avail = function (list, R, t) {
    R = R || XS.rec(); t = t || now();
    const grpNo = {}; Object.keys(R.no).forEach((id) => { const x = R.no[id]; if (x && x.until > t) { const m = M.find((y) => y.id === id); if (m && x.grp) grpNo[m.team] = Math.max(grpNo[m.team] || 0, x.grp); } });
    return list.filter((x) => !x.asked && !(R.no[x.m.id] && R.no[x.m.id].until > t) && !((grpNo[x.m.team] || 0) > t));
  };

  /* ───── 記録（会社ごと・この端末の保存＋同期のキー） ───── */
  function persist() { try { const f = G("v88Persist"); return f ? !!f() : false; } catch (e) { return false; } }
  function coKey() { try { const f = G("v88CoRaw"); return (f && f()) || "_"; } catch (e) { return "_"; } }
  function all() {
    if (!persist()) return XS.mem;
    let raw = null; try { raw = localStorage.getItem(LS); } catch (e) { raw = null; }
    if (XS.A && raw === XS.raw) return XS.A;
    let A = {}; try { A = JSON.parse(raw || "{}") || {}; } catch (e) { A = {}; }
    if (!A || typeof A !== "object") A = {};
    A.v = 1; A.cos = A.cos && typeof A.cos === "object" ? A.cos : {};
    XS.A = A; XS.raw = raw; return A;
  }
  XS.rec = function () {
    const A = all(); const k = coKey();
    const R = A.cos[k] || (A.cos[k] = {});
    if (!Array.isArray(R.props)) R.props = [];
    if (!Array.isArray(R.asks)) R.asks = [];
    if (!R.no || typeof R.no !== "object") R.no = {};
    if (!R.pr || typeof R.pr !== "object") R.pr = { lastAt: 0, lastStep: 0, noRow: 0 };
    return R;
  };
  XS.save = function () {
    if (!persist()) return;
    try {
      const A = all(); A.at = now();
      Object.values(A.cos || {}).forEach((R) => { if (R && Array.isArray(R.props) && R.props.length > 40) R.props = R.props.slice(-40); if (R && Array.isArray(R.asks) && R.asks.length > 60) R.asks = R.asks.slice(-60); });
      const s = JSON.stringify(A); localStorage.setItem(LS, s); XS.raw = s; XS.A = A;
      try { if (typeof syncSchedule === "function") syncSchedule(); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
    } catch (e) { /* 容量 */ }
  };
  try { if (typeof SYNC_KEYS !== "undefined" && Array.isArray(SYNC_KEYS) && SYNC_KEYS.indexOf(LS) < 0) SYNC_KEYS.push(LS); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef

  /* ───── 頻度（「目標と道筋」の提案の頻度の設定をそのまま使う） ───── */
  function freqDays() { try { const R = window.v88Get ? window.v88Get() : null; const k = (R && R.prefs && R.prefs.freq) || "normal"; return { low: 14, normal: 7, high: 3, off: 0 }[k] != null ? { low: 14, normal: 7, high: 3, off: 0 }[k] : 7; } catch (e) { return 7; } }
  XS.freqDays = freqDays;

  /* いま出す提案（無ければ null）。見せている提案（新・既読・あとでの期限切れ）があればそれ */
  XS.now = function (jny, opt) {
    opt = opt || {};
    try { if (typeof PID === "undefined" || !PID) return null; } catch (e) { return null; } // eslint-disable-line no-undef
    const R = XS.rec(); const t = now();
    const { c, list } = XS.rank(jny);
    const av = XS.avail(list, R, t);
    let open = R.props.find((p) => p && (p.st === "new" || p.st === "seen" || (p.st === "later" && (p.until || 0) <= t)));
    let swap = false;
    if (open) {
      // 22.01.2 の検証 x1-1：見せている提案が、ほかの商品のもの・いまのおすすめ（上位3つ）から外れたものなら、古い提案として下げて選び直す（頻度の間は待たない）
      const top3 = av.slice(0, 3).map((x) => x.m.id);
      const stale = (open.pk != null && open.pk !== c.item) || top3.indexOf(open.m) < 0;
      if (!stale) {
        const x = av.find((y) => y.m.id === open.m); if (x) { open.why = x.why; open.step = x.at; }
        if (open.st === "later") open.st = "new";
        XS.save(); return open;
      }
      open.st = "stale"; open.stAt = t; swap = true; open = null;
    }
    const fd = freqDays();
    if (!fd) { if (swap) XS.save(); return null; }
    const stepUp = c.step > (R.pr.lastStep || 0);
    if (!swap && !stepUp && t - (R.pr.lastAt || 0) < fd * DAY && !opt.force) return null;
    const pick = av.find((x) => !R.props.some((p) => p && p.m === x.m.id && p.st !== "stale" && p.at > t - 30 * DAY));
    if (!pick) { if (stepUp) R.pr.lastStep = c.step; XS.save(); return null; }
    const p = { id: "x" + t.toString(36) + Math.random().toString(36).slice(2, 5), m: pick.m.id, at: t, step: pick.at || c.step, gap: pick.gap || 0, pk: c.item, why: pick.why, st: "new" };
    R.props.push(p); R.pr.lastAt = t; R.pr.lastStep = c.step; XS.save();
    try { if (typeof notifBadge === "function") notifBadge(); } catch (e) { /* 無い */ } // eslint-disable-line no-undef
    return p;
  };

  /* 答え：later（3日後）／no（90日・同じチーム30日）／self（自分で進める）／asked（相談した） */
  XS.answer = function (pid, st) {
    const R = XS.rec(); const p = R.props.find((x) => x && x.id === pid); if (!p) return;
    const t = now(); p.st = st; p.stAt = t;
    if (st === "later") p.until = t + 3 * DAY;
    if (st === "no") {
      R.no[p.m] = { until: t + 90 * DAY, grp: t + 30 * DAY };
      R.pr.noRow = (R.pr.noRow || 0) + 1;
      if (R.pr.noRow >= 2) { // 2回続けて「今は要らない」→ 頻度を1段控えめに（目標と道筋の設定と同じ）
        try { const V = window.v88Get(); const o = ["high", "normal", "low"]; const i = o.indexOf(V.prefs.freq || "normal"); if (i >= 0 && i < o.length - 1) { V.prefs.freq = o[i + 1]; V.prefs.autoLow = t; window.v88Save(); } } catch (e) { /* 無い版 */ }
        R.pr.noRow = 0;
      }
    } else if (st === "asked" || st === "self") R.pr.noRow = 0;
    XS.save();
  };

  /* ───── 相談（STANDAGE に届ける） ───── */
  XS.item = (id) => M.find((m) => m.id === id) || null;
  XS.text = function (m, c, note) {
    const L = [`【貿易クラウドAI商社マンからのご相談】${m.nm}`, `会社：${S((c.Dd && c.Dd.co) || (c.T && c.T.co), 80)}`, `商品：${c.item || "—"}`, `販売先国：${c.ctyNm.join("・") || "未定"}`, `いまの段階：STEP ${c.step} ${XS.step[c.step] || ""}`];
    if (note) L.push(`ひとこと：${S(note, 400)}`);
    return L.join("\n");
  };
  async function call(op, body) {
    try { if (typeof v75tcSyncOn !== "function" || !v75tcSyncOn()) return { ok: false, reason: "nosync" }; } catch (e) { return { ok: false, reason: "nosync" }; } // eslint-disable-line no-undef
    try {
      const b = typeof v75tcBody === "function" ? v75tcBody(body) : body; // eslint-disable-line no-undef
      const r = await syncCall(op, b, { timeout: 30000 }); // eslint-disable-line no-undef
      return r || { ok: false, reason: "net" };
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/unknown op/.test(msg)) return { ok: false, reason: "old", msg };
      return { ok: false, reason: "net", msg: msg.slice(0, 120) };
    }
  }
  XS.consult = async function (id, note, pid) {
    const m = XS.item(id); if (!m) return { ok: false, reason: "bad" };
    const c = XS.ctx(window.RDX && window.RDX.jnyNow ? (() => { try { return window.RDX.jnyNow(); } catch (e) { return null; } })() : null);
    const R = XS.rec(); const t = now();
    let a = R.asks.find((x) => x && x.m === id && x.st !== "done");
    if (!a) { a = { id: "a" + t.toString(36), m: id, at: t, st: "draft" }; R.asks.push(a); }
    a.note = S(note, 400); a.item = c.item; a.cty = c.ctyNm.slice(0, 6); a.step = c.step; a.upd = t;
    const req = { id: a.sid || "", menu: id, nm: m.nm, team: m.team, note: a.note, item: c.item, cty: a.cty, step: c.step, stepNm: XS.step[c.step] || "", co: S((c.Dd && c.Dd.co) || (c.T && c.T.co), 80) };
    const r = await call("svc_put", { req });
    if (r && r.ok) { a.st = r.why ? "trial" : "sent"; a.sid = r.id || a.sid || ""; a.why = r.why || ""; a.sentAt = t; }
    else { a.st = "unsent"; a.err = r && r.reason || "net"; }
    if (pid) { const p = R.props.find((x) => x && x.id === pid); if (p) { p.st = "asked"; p.stAt = t; } }
    R.pr.noRow = 0;
    XS.save();
    return { ok: !!(r && r.ok), st: a.st, why: a.why || "", reason: r && r.reason, text: XS.text(m, c, a.note), ask: a };
  };
  XS.asks = () => XS.rec().asks.slice().sort((a, b) => (b.upd || b.at || 0) - (a.upd || a.at || 0));

  /* ───── AI商社マンに相談（チャット）：答えに関係するときだけ、STANDAGE のサービスを1行添える ─────
     チャットの入口（askFree）の間だけ印を立て、AI への指示文（llmSysPrompt）の最後に「いま合うサービス」を足す。
     ほかの AI の呼び出し（資料・規制の分析・提案の深掘り など）には足さない（答えの形を変えない）。金額は書かせない */
  XS.chatCtx = function () {
    let rk = null; try { rk = XS.rank(window.RDX && window.RDX.jnyNow ? window.RDX.jnyNow() : null); } catch (e) { rk = null; }
    if (!rk) return "";
    const R = XS.rec(), t = now();
    const top = rk.list.filter((x) => !(R.no[x.m.id] && R.no[x.m.id].until > t)).slice(0, 4);
    const others = M.filter((m) => m.on !== "stop" && !top.some((x) => x.m.id === m.id)).map((m) => m.nm);
    const L = ["=== STANDAGE のサービス（このお客様にいま合うもの・AI商社マンが選んだ順） ==="];
    top.forEach((x, i) => L.push(`${i + 1}. ${x.m.nm}（${x.m.team}）：${x.why}`));
    if (!top.length) L.push("（いまの段階で特におすすめするものはありません）");
    L.push("ほかに頼めるもの：" + others.join("・"));
    L.push("答え方：お客様の質問がこれらのサービスに関係するときだけ、答えの最後に1行「STANDAGE に頼めます：〇〇（画面『STANDAGE のサービス』から担当に相談できます）」と添えてください。関係ないときは触れないでください。金額・料金は書かないでください（担当がお見積りします）。準備中のもの（ブロックチェーン決済）は「準備中」と書いてください。");
    return L.join("\n").slice(0, 2400);
  };
  (function () {
    try {
      const a0 = window.askFree;
      if (typeof a0 === "function" && !a0._xs) {
        const a1 = async function () { XS.chatOn = (XS.chatOn || 0) + 1; try { return await a0.apply(this, arguments); } finally { XS.chatOn = Math.max(0, (XS.chatOn || 1) - 1); } };
        a1._xs = 1; window.askFree = a1;
        try { askFree = a1; } catch (e) { /* 宣言の無い版 */ } // eslint-disable-line no-undef
      }
    } catch (e) { /* 無い版 */ }
    try {
      const s0 = window.llmSysPrompt;
      if (typeof s0 === "function" && !s0._xs) {
        const s1 = function () { const s = s0.apply(this, arguments); try { if (XS.chatOn > 0 && typeof s === "string") { const t = XS.chatCtx(); if (t) return s + "\n\n" + t; } } catch (e) { /* 足さない */ } return s; };
        s1._xs = 1; window.llmSysPrompt = s1;
        try { llmSysPrompt = s1; } catch (e) { /* 宣言の無い版 */ } // eslint-disable-line no-undef
      }
    } catch (e) { /* 無い版 */ }
  })();
})();
