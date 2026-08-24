import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "C:/Users/s9348/new folder/github/newslin-design.github.io/nihonngo/AI教材ツール_共有用_日本語.pptx";
const BUILD = "C:/Users/s9348/new folder/github/newslin-design.github.io/.codex-presentation-build";
const ASSET = `${BUILD}/assets/kanji-sheet.png`;

const W = 1280;
const H = 720;
const FONT = "Yu Gothic";
const C = {
  ink: "#111111",
  sub: "#5D6470",
  panel: "#F1F3F5",
  rule: "#C6CBD2",
  accent: "#6DCBF4",
  blue: "#3D8DFF",
  pale: "#EAF6FC",
  warm: "#FFF2D6",
  red: "#D45D5D",
  white: "#FFFFFF",
};

function addBox(slide, x, y, w, h, fill = C.panel, line = "none", radius = 0) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function addRule(slide, x, y, w, color = C.rule, width = 1) {
  return slide.shapes.add({
    geometry: "straightConnector1",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addText(slide, text, x, y, w, h, {
  size = 24,
  color = C.ink,
  bold = false,
  align = "left",
  valign = "top",
  fill = "none",
  line = "none",
  radius = 0,
  name,
  margin = 0,
} = {}) {
  const shape = slide.shapes.add({
    geometry: radius ? "roundRect" : "textbox",
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: size,
    color,
    bold,
    alignment: align,
    verticalAlignment: valign,
    autoFit: "shrinkText",
    wrap: "square",
    insets: { top: margin, right: margin, bottom: margin, left: margin },
  };
  return shape;
}

function addSlideBase(pres, title, page, section = "") {
  const slide = pres.slides.add();
  slide.background.fill = C.white;
  if (section) addText(slide, section, 56, 30, 360, 28, { size: 16, color: C.blue, bold: true });
  addText(slide, title, 56, 66, 1168, 64, { size: 46, bold: true });
  addRule(slide, 56, 144, 1168, C.rule, 1);
  addText(slide, String(page).padStart(2, "0"), 1170, 674, 54, 20, { size: 14, color: C.sub, align: "right" });
  return slide;
}

function notes(slide, talk, sources = ["User-authored workshop draft"]) {
  const src = sources.map((s) => `- ${s}`).join("\n");
  slide.speakerNotes.textFrame.setText(`${talk}\n\n[Sources]\n${src}\n[/Sources]`);
  slide.speakerNotes.setVisible(true);
}

async function readImage(path) {
  const b = await fs.readFile(path);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

async function main() {
  await fs.mkdir(`${BUILD}/renders`, { recursive: true });
  const pres = Presentation.create({ slideSize: { width: W, height: H } });
  const screenshot = await readImage(ASSET);

  // 1 Cover
  {
    const s = pres.slides.add();
    s.background.fill = C.white;
    addText(s, "AI × 日本語教育", 64, 52, 280, 28, { size: 18, color: C.blue, bold: true });
    addText(s, "AIで自分専用の\n教材ツールを作る", 64, 150, 760, 180, { size: 66, bold: true });
    addText(s, "アイデアを形にするまでに考えたこと", 68, 360, 700, 46, { size: 28, color: C.sub });
    addBox(s, 846, 94, 360, 480, C.pale, "none", 12);
    addText(s, "AIは\n能力を拡張する。", 884, 150, 290, 120, { size: 40, bold: true });
    addRule(s, 884, 302, 220, C.blue, 4);
    addText(s, "中心にあるのは、\n教師の専門知識。", 884, 342, 280, 120, { size: 30, color: C.ink, bold: true });
    addText(s, "すでにClaudeを使っている先生へ", 68, 646, 500, 28, { size: 18, color: C.sub });
    notes(s, "先生はすでにClaudeを使って教材や小さなツールを作っています。今日はAIの使い方を一から説明するのではなく、何を作るか、どこまで作るか、どの媒体を選ぶかを一緒に整理します。", ["User-authored workshop draft"]);
  }

  // 2 Vibe coding
  {
    const s = addSlideBase(pres, "Vibe Coding＝AIと会話しながら作る", 2, "1｜考え方");
    addText(s, "「漢字を練習できて、\n筆順も見られ、A4で印刷できる\nWebページを作ってください」", 64, 196, 580, 220, { size: 34, bold: true });
    addText(s, "見る", 760, 196, 300, 52, { size: 30, bold: true });
    addText(s, "結果を実際に使う", 760, 250, 380, 38, { size: 23, color: C.sub });
    addRule(s, 760, 310, 360, C.rule, 2);
    addText(s, "伝える", 760, 332, 300, 52, { size: 30, bold: true });
    addText(s, "違いを普通の言葉で説明する", 760, 386, 420, 38, { size: 23, color: C.sub });
    addRule(s, 760, 446, 360, C.rule, 2);
    addText(s, "直す", 760, 468, 300, 52, { size: 30, bold: true });
    addText(s, "AIがコードを修正する", 760, 522, 380, 38, { size: 23, color: C.sub });
    addText(s, "コードを書くより、問題を説明し、結果を判断する。", 64, 584, 1050, 54, { size: 28, color: C.blue, bold: true });
    notes(s, "Vibe Codingでは、利用者がすべてのコードを書くのではなく、AIと会話し、結果を見て修正を頼みます。先生に必要なのは、解決したい問題を説明し、結果が本当に求めるものか判断することです。AIは能力の高いインターンのような存在です。", ["User-authored workshop draft"]);
  }

  // 3 A vs B
  {
    const s = addSlideBase(pres, "最初にAとBを分ける", 3, "1｜考え方");
    addText(s, "A", 70, 196, 120, 110, { size: 84, color: C.blue, bold: true });
    addText(s, "AIを使って\nツールを作る", 184, 196, 380, 100, { size: 34, bold: true });
    addText(s, "完成後はAI不要\n静的サイトでも公開できる\n例：漢字練習、単語カード", 184, 326, 410, 150, { size: 24, color: C.sub });
    addRule(s, 640, 190, 0, C.rule, 1);
    addText(s, "B", 686, 196, 120, 110, { size: 84, color: C.red, bold: true });
    addText(s, "ツール自体に\nAI機能がある", 800, 196, 390, 100, { size: 34, bold: true });
    addText(s, "利用のたびにAIを呼ぶ\n後端・運営・品質管理が必要\n例：AI会話、作文添削", 800, 326, 410, 150, { size: 24, color: C.sub });
    addBox(s, 64, 530, 1152, 92, C.panel, "none", 8);
    addText(s, "同じ「AIで作る」でも、開発難易度と運営コストは大きく違う。", 92, 554, 1096, 44, { size: 28, bold: true, align: "center" });
    notes(s, "一番重要な分類です。Aは開発時にAIを使いますが、完成後は学生が使うたびにAIを呼びません。Bは、会話や添削のたびにAIを呼びます。この違いが、開発難易度と運営コストを大きく変えます。", ["User-authored workshop draft"]);
  }

  // 4 Cost
  {
    const s = addSlideBase(pres, "AI機能は、使われるほど費用も増える", 4, "1｜考え方");
    addBox(s, 64, 194, 520, 350, C.pale, "none", 10);
    addText(s, "一般的な静的ツール", 96, 226, 450, 48, { size: 30, bold: true });
    addText(s, "開発後", 96, 312, 180, 56, { size: 42, color: C.blue, bold: true });
    addText(s, "利用者が増えても\n追加コストは比較的小さい", 96, 386, 420, 100, { size: 26 });
    addBox(s, 648, 194, 568, 350, C.warm, "none", 10);
    addText(s, "AIを内蔵したサービス", 680, 226, 480, 48, { size: 30, bold: true });
    addText(s, "利用ごと", 680, 312, 210, 56, { size: 42, color: C.red, bold: true });
    addText(s, "Token・音声・APIの\nコストが積み上がる", 680, 386, 430, 100, { size: 26 });
    addText(s, "人気が出るほど赤字になる設計もある。", 64, 580, 1100, 52, { size: 30, bold: true });
    notes(s, "一般的な静的ソフトウェアは、完成後に利用者が増えても追加コストは比較的小さいことが多いです。しかしAIサービスは、利用のたびにTokenや音声料金が発生します。使われるほど赤字になる設計もあるので、最初に区別しておく必要があります。", ["User-authored workshop draft"]);
  }

  // 5 Gemini Canvas
  {
    const s = addSlideBase(pres, "まずはCanvasで「使えるか」を試す", 5, "1｜考え方");
    const xs = [72, 444, 816];
    const labels = ["1  アイデアを伝える", "2  その場で試す", "3  会話で直す"];
    const bodies = ["問題形式・対象レベル・\n使う場面を説明", "WebページやTTSを\nすぐプレビュー", "学生の反応を想像し、\n必要な部分だけ修正"];
    for (let i=0;i<3;i++) {
      addText(s, labels[i], xs[i], 218, 320, 56, { size: 28, bold: true });
      addRule(s, xs[i], 292, 300, i === 1 ? C.blue : C.rule, i === 1 ? 4 : 2);
      addText(s, bodies[i], xs[i], 324, 320, 110, { size: 24, color: C.sub });
    }
    addText(s, "N1聴解テスト　／　日本語会話練習", 72, 500, 1100, 54, { size: 32, bold: true });
    addText(s, "Prototypeは正式サービスではない。利用枠・データ・権限は別に確認する。", 72, 566, 1100, 52, { size: 24, color: C.red });
    notes(s, "Gemini Canvasは、会話の中でWebページやTTS、Gemini機能を試せるため、アイデアの価値を早く確認するのに便利です。ただし共有できるPrototypeと、多数の学生が長期利用できる正式サービスは別です。利用枠、共有データ、権限を確認します。", ["https://support.google.com/gemini/answer/16047321?hl=en", "https://support.google.com/gemini/answer/16419134?hl=en-GB", "User-provided Gemini examples"]);
  }

  // 6 Restaurant analogy
  {
    const s = addSlideBase(pres, "サーバーの話は、レストランで考える", 6, "2｜技術を理解する");
    const items = [
      ["フロントエンド", "内装とメニュー", "学生が見て操作する画面"],
      ["バックエンド", "厨房", "認証・計算・ルールの処理"],
      ["データベース", "冷蔵庫と帳簿", "会員・教材・学習履歴"],
      ["サーバー／クラウド", "場所と設備", "サービスを継続して動かす"],
    ];
    let y = 190;
    for (let i=0;i<items.length;i++) {
      addText(s, items[i][0], 72, y, 310, 52, { size: 28, color: i===3?C.blue:C.ink, bold: true });
      addText(s, items[i][1], 404, y, 260, 52, { size: 26, bold: true });
      addText(s, items[i][2], 692, y, 480, 52, { size: 23, color: C.sub });
      addRule(s, 72, y+68, 1100, C.rule, 1);
      y += 104;
    }
    addText(s, "ログイン・保存・決済・AI API Key → バックエンドが必要", 72, 606, 1100, 44, { size: 26, color: C.blue, bold: true });
    notes(s, "フロントエンドは学生が見る画面、バックエンドはルールを処理する厨房、データベースは情報を保存する冷蔵庫と帳簿、サーバーは店を動かす場所と設備です。ログイン、学習履歴、決済、API Keyの安全な保存にはバックエンドが必要です。", ["User-authored workshop draft"]);
  }

  // 7 Levels
  {
    const s = addSlideBase(pres, "作りたいものは、どのレベルか", 7, "2｜技術を理解する");
    const lv = [
      ["1", "授業用・自分用", "静的サイト／保存なし", "漢字練習・教材生成"],
      ["2", "小規模な学生向け", "学生データを保存", "Google Sheet＋GAS"],
      ["3", "学生向け＋AI", "生成・添削・個別化", "Tokenと品質管理"],
      ["4", "外部向け商用", "会員・決済・資安", "製品と運営全体"],
    ];
    let y=178;
    for (let i=0;i<lv.length;i++) {
      addText(s, lv[i][0], 72, y, 72, 72, { size: 44, color: i<2?C.blue:C.red, bold: true, align: "center", valign: "middle", fill: i<2?C.pale:C.warm, radius: 8 });
      addText(s, lv[i][1], 176, y+4, 300, 38, { size: 28, bold: true });
      addText(s, lv[i][2], 500, y+4, 310, 38, { size: 23, color: C.sub });
      addText(s, lv[i][3], 846, y+4, 330, 38, { size: 23, color: C.sub });
      y += 112;
    }
    addText(s, "Levelは品質ではなく、技術と運営責任の大きさ。", 72, 626, 1080, 36, { size: 25, bold: true });
    notes(s, "Levelは品質順位ではなく、技術と運営責任の大きさです。初心者はLevel 1から始め、学生データが必要ならLevel 2、生成AIを入れるならLevel 3、商用公開ならLevel 4として考えます。個人単語カードはLevel 2の例です。", ["User-authored workshop draft", "https://newslin-design.github.io/wordCard.html"]);
  }

  // 8 PDF to Web
  {
    const s = addSlideBase(pres, "PDFではなく「作り続けられる道具」にする", 8, "3｜漢字サイトの実例");
    addText(s, "PDFは\n最終的な出力。", 64, 214, 390, 120, { size: 40, bold: true });
    addText(s, "Webは\n教材を生産する道具。", 64, 352, 450, 130, { size: 40, color: C.blue, bold: true });
    addText(s, "データを足せる\nテンプレートを一度に直せる\n操作も印刷もできる", 64, 522, 440, 110, { size: 24, color: C.sub });
    addBox(s, 548, 176, 664, 438, C.panel, C.rule, 8);
    s.images.add({
      blob: screenshot,
      contentType: "image/png",
      alt: "漢字練習シートのWeb画面",
      fit: "cover",
      crop: { left: 0.02, top: 0.03, right: 0.02, bottom: 0.04 },
      geometry: "roundRect",
      borderRadius: 8,
      position: { left: 560, top: 188, width: 640, height: 414 },
    });
    notes(s, "最初はClaudeでPDFを作りました。最初の成果を見るには便利ですが、次の課やレイアウト変更のたびに作り直す問題が出ます。本当に必要だったのは一枚のPDFではなく、教材を繰り返し作れる道具でした。Webも印刷やPDF保存ができます。", ["User-authored workshop draft", "Screenshot: https://newslin-design.github.io/nihonngo/sheet.html?id=n3-02"]);
  }

  // 9 Scope
  {
    const s = addSlideBase(pres, "最初に決めるのは「何を作らないか」", 9, "3｜漢字サイトの実例");
    addText(s, "今回はやめた", 72, 200, 470, 52, { size: 32, color: C.red, bold: true });
    addText(s, "学生ログイン\nオンライン保存\n先生への提出\nオンライン添削", 72, 274, 470, 230, { size: 30, color: C.sub });
    addRule(s, 630, 188, 0, C.rule, 1);
    addText(s, "最初に残した", 690, 200, 470, 52, { size: 32, color: C.blue, bold: true });
    addText(s, "繰り返し生成できる\n筆順と練習を見られる\nA4で正しく印刷できる", 690, 274, 470, 210, { size: 30, bold: true });
    addBox(s, 72, 548, 1088, 80, C.panel, "none", 8);
    addText(s, "機能を削る＝失敗ではない。重要な機能を先に完成させる。", 96, 568, 1040, 42, { size: 27, bold: true, align: "center" });
    notes(s, "学生の保存や提出は不可能ではありません。ただし、アカウント、データベース、権限、個人情報が必要になります。最初のバージョンでは、繰り返し生成でき、操作と印刷ができる漢字練習シートだけに集中しました。", ["User-authored workshop draft"]);
  }

  // 10 Data/UI
  {
    const s = addSlideBase(pres, "「中身」と「包み」を分けて考える", 10, "3｜漢字サイトの実例");
    addText(s, "中身｜データ", 72, 200, 480, 54, { size: 32, color: C.blue, bold: true });
    addText(s, "漢字リスト\n読み方・例語\n筆画数・筆順パス\n問題・答え", 72, 282, 480, 230, { size: 29 });
    addText(s, "包み｜UIと機能", 690, 200, 480, 54, { size: 32, bold: true });
    addText(s, "なぞり書き\n筆順アニメーション\n練習／解答モード\nA4印刷", 690, 282, 480, 230, { size: 29 });
    addRule(s, 620, 190, 0, C.rule, 1);
    addText(s, "一番難しかったのは画面ではなく、筆順データ。→ KanjiVG", 72, 580, 1100, 48, { size: 26, color: C.red, bold: true });
    notes(s, "データとUIを分けます。今回一番難しかったのは、画面ではなく筆順データでした。KanjiVGが見つかったことで、筆順パスを利用できました。データとUIを分ければ、新しい漢字を追加するときはデータだけを増やし、テンプレート修正は全教材へ反映できます。", ["https://kanjivg.tagaini.net/", "User-authored workshop draft"]);
  }

  // 11 Chat vs Agent
  {
    const s = addSlideBase(pres, "ChatとAgentは、見えている範囲が違う", 11, "3｜漢字サイトの実例");
    addText(s, "一般的なChat", 72, 200, 500, 56, { size: 34, bold: true });
    addText(s, "渡した内容をもとに回答\n一段のコードを生成\n利用者がコピーして戻す\n発想・整理・単発質問に向く", 72, 286, 500, 220, { size: 27, color: C.sub });
    addText(s, "Claude Code／Agent", 682, 200, 500, 56, { size: 34, color: C.blue, bold: true });
    addText(s, "プロジェクト全体を探索\n複数ファイルを直接修正\nチェックやテストを実行\n継続開発・修正に向く", 682, 286, 500, 220, { size: 27 });
    addRule(s, 628, 190, 0, C.rule, 1);
    addText(s, "必要なのはコマンドではなく、目的・判断・フィードバック。", 72, 578, 1100, 46, { size: 28, bold: true });
    notes(s, "一般的なChatは、こちらが渡した内容をもとに回答します。Claude CodeのようなAgentは、プロジェクト全体を探索し、複数ファイルを修正し、チェックやテストを実行できます。先生が覚えるべきなのはコマンドではなく、目的を説明し、提案と結果を判断することです。", ["https://docs.anthropic.com/ja/docs/claude-code", "User-authored workshop draft"]);
  }

  // 12 Claude Code workflow
  {
    const s = addSlideBase(pres, "Claude Codeは、4回すり合わせる", 12, "3｜実演");
    const steps = [
      ["1", "理解", "まだ変更しない\n構造を説明してもらう"],
      ["2", "提案", "最小の修正案を\n先に出してもらう"],
      ["3", "実行", "確認後に修正し\n影響をチェックする"],
      ["4", "再調整", "実物を見て\n普通の言葉で直す"],
    ];
    const xs=[62,360,658,956];
    for (let i=0;i<4;i++) {
      addText(s, steps[i][0], xs[i], 205, 72, 72, { size: 38, color: C.white, bold: true, align: "center", valign: "middle", fill: i===3?C.blue:C.ink, radius: 36 });
      addText(s, steps[i][1], xs[i], 310, 240, 54, { size: 30, bold: true });
      addText(s, steps[i][2], xs[i], 382, 250, 110, { size: 23, color: C.sub });
      if (i<3) addRule(s, xs[i]+90, 240, 186, C.rule, 3);
    }
    addBox(s, 62, 548, 1128, 80, C.pale, "none", 8);
    addText(s, "分からない権限要求は、許可せず、分かりやすい言葉で説明してもらう。", 90, 568, 1070, 42, { size: 25, bold: true, align: "center" });
    notes(s, "デモでは四回すり合わせます。まず変更せずに構造を説明してもらい、次に最小の案を出してもらいます。方向を確認してから実行し、画面と印刷結果を見て自然な言葉で再調整します。権限要求が分からない場合は許可せず、何をするのか簡単に説明してもらいます。\n\nデモ用プロンプト1：この漢字練習サイトの構造を読んでください。まだ変更しないでください。教材データ、テンプレート、機能がどこにあるか説明してください。\n\nプロンプト2：解答モードで答えを見分けやすくしたいです。最小限の案を先に出してください。\n\nプロンプト3：この方向で修正し、練習モードとA4印刷への影響を確認してください。\n\nプロンプト4：画面は見やすいですが、印刷では色が薄すぎます。印刷用スタイルだけ調整してください。", ["https://docs.anthropic.com/ja/docs/claude-code", "User-authored workshop draft"]);
  }

  // 13 Resources
  {
    const s = addSlideBase(pres, "小さく始めるための道具", 13, "3｜無料・低コストの選択肢");
    addText(s, "GitHub Pages", 64, 205, 340, 52, { size: 31, color: C.blue, bold: true });
    addText(s, "静的Webサイトを無料公開\nAタイプ・Level 1向け\n完成後のAI費用なし", 64, 292, 340, 160, { size: 24, color: C.sub });
    addText(s, "Google Apps Script", 470, 205, 340, 52, { size: 31, bold: true });
    addText(s, "Google Sheetと連携\n小規模なデータ保存\n自分でServer管理不要", 470, 292, 340, 160, { size: 24, color: C.sub });
    addText(s, "Chat／Canvas／Agent", 876, 205, 340, 52, { size: 31, bold: true });
    addText(s, "考える → Chat\n試す → Canvas\n育てる → Agent", 876, 292, 340, 160, { size: 24, color: C.sub });
    addText(s, "一つを選び続ける必要はない。段階ごとに使い分ける。", 64, 560, 1120, 58, { size: 28, bold: true });
    notes(s, "純粋な静的サイトはGitHub Pagesで公開できます。Google Sheetをデータとして使う小規模ツールにはGoogle Apps Scriptが便利です。AIツールはランキングで一つを選ぶのではなく、考える段階はChat、試す段階はCanvas、実際のプロジェクトを育てる段階はAgentとして使い分けます。", ["https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages", "User-authored workshop draft"]);
  }

  // 14 Teacher know-how
  {
    const s = addSlideBase(pres, "教師の強みは、教育のKnow-how", 14, "4｜まとめ");
    const xs=[64,450,836];
    const hs=["学生を知る", "教材を判断する", "すぐ試して直す"];
    const bs=["国・目的・レベルで\n必要な語彙が違う", "自然さ・難易度・\n教育的価値を見抜く", "実際の授業で使い\n反応をAIへ返す"];
    for(let i=0;i<3;i++) {
      addText(s, hs[i], xs[i], 216, 330, 56, { size: 30, color: i===0?C.blue:C.ink, bold: true });
      addRule(s, xs[i], 292, 310, i===0?C.blue:C.rule, i===0?4:2);
      addText(s, bs[i], xs[i], 326, 330, 130, { size: 25, color: C.sub });
    }
    addBox(s, 64, 524, 1102, 110, C.panel, "none", 8);
    addText(s, "台湾の学習者：漢字の意味には強い。\nしかし、日本語の読み方や実用場面は別の課題。", 92, 546, 1046, 70, { size: 27, bold: true, align: "center" });
    notes(s, "教師の本当の強みは、学生を知っていることです。台湾の学習者は漢字の意味に慣れていても、日本語の読み方が弱い場合があります。旅行、交流、日本文化への興味など、目的も違います。教師はAIが生成した教材の自然さ、難易度、教育的価値を判断し、実際の授業で試して改善できます。", ["User-authored workshop draft"]);
  }

  // 15 Closing
  {
    const s = pres.slides.add();
    s.background.fill = C.white;
    addText(s, "AIは能力を拡張する。", 72, 104, 1000, 76, { size: 52, bold: true });
    addText(s, "だからこそ、\n何を拡張するかが大切。", 72, 210, 900, 140, { size: 52, color: C.blue, bold: true });
    addRule(s, 72, 402, 260, C.ink, 4);
    addText(s, "AIは、学生がなぜ日本語を学ぶのか知らない。\nでも先生は知っている。", 72, 448, 1080, 110, { size: 34, bold: true });
    addText(s, "教育の洞察で、AIという優秀なインターンを導く。", 72, 612, 1080, 42, { size: 24, color: C.sub });
    addText(s, "15", 1170, 674, 54, 20, { size: 14, color: C.sub, align: "right" });
    notes(s, "AIは能力を拡張する道具です。得意な部分も、間違いも拡張します。大切なのは、教師が持つ教育の洞察を中心に置き、AIという能力の高いインターンを導くことです。AIは学生がなぜ日本語を学ぶのか知りません。でも先生は知っています。", ["User-authored workshop draft"]);
  }

  // 16 Appendix MCP
  {
    const s = addSlideBase(pres, "次回：MCPとAIワークフロー", 16, "付録｜今回は詳しく扱わない");
    addText(s, "Notion", 72, 218, 330, 56, { size: 34, color: C.blue, bold: true });
    addText(s, "プロジェクト整理\nタスクボード作成", 72, 300, 330, 100, { size: 25, color: C.sub });
    addText(s, "Figma／3D", 456, 218, 300, 56, { size: 32, bold: true });
    addText(s, "デザインを読む\nシーンを作る・直す", 456, 300, 300, 100, { size: 25, color: C.sub });
    addText(s, "Browser", 860, 218, 300, 56, { size: 32, bold: true });
    addText(s, "Webサイトを開く\n操作してテストする", 860, 300, 300, 100, { size: 25, color: C.sub });
    addBox(s, 72, 514, 1098, 100, C.pale, "none", 8);
    addText(s, "MCPは、AIを外部のデータやツールにつなぐ共通の仕組み。", 98, 542, 1046, 50, { size: 27, bold: true, align: "center" });
    notes(s, "これは次回のテーマです。MCPはAIを外部のデータやツールにつなぐ仕組みです。Notionでタスクを整理したり、Figmaや3Dソフトを操作したり、ブラウザでWebサイトをテストしたりできます。今回はプログラムサービスの設計に絞るため、詳しく扱いません。", ["https://modelcontextprotocol.io/docs/getting-started/intro", "User-authored workshop draft"]);
  }

  for (let i=0;i<pres.slides.items.length;i++) {
    const slide = pres.slides.items[i];
    const png = await pres.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.png`, new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.layout.json`, await layout.text());
  }
  const montage = await pres.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(`${BUILD}/deck-montage.webp`, new Uint8Array(await montage.arrayBuffer()));
  const pptx = await PresentationFile.exportPptx(pres);
  await pptx.save(OUT);
  console.log(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
