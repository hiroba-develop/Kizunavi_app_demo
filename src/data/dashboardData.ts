export interface ScoreCardData {
  key: string;
  label: string;
  value: string;
  delta?: string;
  color: "gray" | "orange" | "blue" | "green" | "amber" | "red";
}

export interface SurveyOption {
  id: string;
  name: string;
  executedAt: string;
}

export interface SurveySnapshot {
  overallScore: number;
  previousDelta: number;
  scoreCards: ScoreCardData[];
}

export const SURVEY_OPTIONS: SurveyOption[] = [
  { id: "2026-q1", name: "2026年 第1回サーベイ", executedAt: "2026-04-15" },
  { id: "2025-q3", name: "2025年 第3回サーベイ", executedAt: "2025-10-20" },
  { id: "2025-q2", name: "2025年 第2回サーベイ", executedAt: "2025-07-10" },
  { id: "2025-q1", name: "2025年 第1回サーベイ", executedAt: "2025-04-08" },
];

export const SURVEY_SNAPSHOTS: Record<string, SurveySnapshot> = {
  "2026-q1": {
    overallScore: 62.5,
    previousDelta: 0.5,
    scoreCards: [
      { key: "engagement", label: "従業員エンゲージメント", value: "74点", color: "green" },
      { key: "role", label: "組織温度", value: "80点", color: "amber" },
      { key: "interpersonal", label: "対個人間でのキズナスコア", value: "64点", color: "gray" },
      { key: "trend", label: "直近のキズナ認識変化", value: "+43点", delta: "前回比 +0.5", color: "orange" },
      { key: "roleTrend", label: "回答の正確性", value: "73点", color: "red" },
      { key: "department", label: "役割期待値", value: "66点", color: "blue" },
    ],
  },
  "2025-q3": {
    overallScore: 62.0,
    previousDelta: -1.5,
    scoreCards: [
      { key: "engagement", label: "従業員エンゲージメント", value: "71点", color: "green" },
      { key: "role", label: "組織温度", value: "77点", color: "amber" },
      { key: "interpersonal", label: "対個人間でのキズナスコア", value: "60点", color: "gray" },
      { key: "trend", label: "直近のキズナ認識変化", value: "+38点", delta: "前回比 −1.5", color: "orange" },
      { key: "roleTrend", label: "回答の正確性", value: "70点", color: "red" },
      { key: "department", label: "役割期待値", value: "63点", color: "blue" },
    ],
  },
  "2025-q2": {
    overallScore: 63.5,
    previousDelta: 2.0,
    scoreCards: [
      { key: "engagement", label: "従業員エンゲージメント", value: "76点", color: "green" },
      { key: "role", label: "組織温度", value: "82点", color: "amber" },
      { key: "interpersonal", label: "対個人間でのキズナスコア", value: "67点", color: "gray" },
      { key: "trend", label: "直近のキズナ認識変化", value: "+45点", delta: "前回比 +2.0", color: "orange" },
      { key: "roleTrend", label: "回答の正確性", value: "75点", color: "red" },
      { key: "department", label: "役割期待値", value: "68点", color: "blue" },
    ],
  },
  "2025-q1": {
    overallScore: 61.5,
    previousDelta: -0.5,
    scoreCards: [
      { key: "engagement", label: "従業員エンゲージメント", value: "69点", color: "green" },
      { key: "role", label: "組織温度", value: "75点", color: "amber" },
      { key: "interpersonal", label: "対個人間でのキズナスコア", value: "58点", color: "gray" },
      { key: "trend", label: "直近のキズナ認識変化", value: "+35点", delta: "前回比 −0.5", color: "orange" },
      { key: "roleTrend", label: "回答の正確性", value: "68点", color: "red" },
      { key: "department", label: "役割期待値", value: "61点", color: "blue" },
    ],
  },
};

export const OVERALL_SCORE = 62.5;
export const PREVIOUS_SCORE_DELTA = 0.5;

export const SCORE_CARDS: ScoreCardData[] = [
  { key: "engagement", label: "従業員エンゲージメント", value: "74点", color: "green" },
  { key: "role", label: "組織温度", value: "80点", color: "amber" },
  { key: "interpersonal", label: "対個人間でのキズナスコア", value: "64点", color: "gray" },
  {
    key: "trend",
    label: "直近のキズナ認識変化",
    value: "+43点",
    delta: "前回比 +0.5",
    color: "orange",
  },
  { key: "roleTrend", label: "回答の正確性", value: "73点", color: "red" },
  { key: "department", label: "役割期待値", value: "66点", color: "blue" },
];

export type AlertSeverity = "high" | "middle" | "low";
export type AlertStatus = "warning" | "ok";

export interface AlertItem {
  /** 並び順表示用・React key に利用 */
  id: string;
  status: AlertStatus;
  category: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  /** 1 が最優先。表示はこの値の昇順で上位件数に限定する */
  priority: number;
}

/** アラート一覧に表示する最大件数（優先順位の小さい順） */
export const DISPLAY_ALERT_LIMIT = 10;

export const ALERT_CATEGORIES = [
  "すべて",
  "従業員エンゲージメント",
  "組織温度",
  "対個人間でのキズナスコア",
  "直近のキズナの認識変化",
  "回答の正確性",
  "役割期待値",
] as const;

/** 「すべて」の並び・アラートのカテゴリソート用（ALERT_CATEGORIES の 「すべて」を除いたタブ順） */
export const ALERT_CATEGORY_DISPLAY_ORDER: string[] =
  ALERT_CATEGORIES.slice(1);

const PHASE_SKEW_ROLE_COMMENT =
  "〇〇職種においてムムフェーズが多いです。(フェーズ3は控えめなところが多いですが、11職種は大きな偏りがあり、2番目に多いアンケートの結果を反映していない。4職種が停滞している。少し回答して期待値が低下している可能性。2-3カ月に1回程度が発生している。期待値が半年間のまま固定化してしまっている)";

export const ALERTS: AlertItem[] = [
  {
    id: "01",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "偏差値の高い部署セグメントがない",
    description:
      "〇〇様のエンゲージメントが高いです。(偏差値を使っていないセグメントを上位3つ表示)",
    severity: "high",
    priority: 1,
  },
  {
    id: "02",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "偏差値の低い部署セグメントがない",
    description:
      "〇〇様のスコアが低いです。〇〇の見直しを行う必要があります。(偏差値を使っていない部署を上位3つ表示)",
    severity: "high",
    priority: 12,
  },
  {
    id: "03",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "偏差値の高い職種がない",
    description:
      "〇〇職種のエンゲージメントが高いです。(偏差値を満たしていない職種を上位3つ表示)",
    severity: "high",
    priority: 8,
  },
  {
    id: "04",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "部署セグメント間に大きな偏差がない",
    description:
      "〇〇様が高い一方、〇〇様のエンゲージメントが非常に低いです。フォローを行う必要があります。(対象セグメントを1つ表示。ただし1つで表示されても複数とわかっている場合は掘り下げる)",
    severity: "middle",
    priority: 19,
  },
  {
    id: "05",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "職種間に大きな偏差がない",
    description:
      "〇〇職種が高い一方、〇〇職種のスコアが非常に低いです。フォローを行う必要があります。",
    severity: "middle",
    priority: 22,
  },
  {
    id: "06",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "部署セグメントごとに前期間から大きな下降傾向がない",
    description:
      "〇〇部署が高い一方、〇〇部署のエンゲージメントが非常に低いです。フォローを行う必要があります。(対象部署を1つ表示。ただし1つで表示されても複数とわかっている場合は掘り下げる)",
    severity: "middle",
    priority: 18,
  },
  {
    id: "07",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "職種ごとに前期間から大きな下降傾向がない",
    description:
      "〇〇職種のスコアが低下傾向にあります。ムムのフォローを行う必要があります。(偏差値を使っていないセグメントを上位3つ表示)",
    severity: "middle",
    priority: 21,
  },
  {
    id: "08",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "フェーズ3の割合が一番高い",
    description: "フェーズ3は高いです。",
    severity: "high",
    priority: 14,
  },
  {
    id: "09",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "フェーズ3の割合が一番低い",
    description:
      "期待値に達しているメンバーの満足度が低下しています。ムムへのフォローを行うとともに、ムムの見直しを行う必要があります。(上位3つ表示)",
    severity: "high",
    priority: 15,
  },
  {
    id: "10",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "特定の職種セグメントに対して特定のフェーズが明らかに大きな偏りがない",
    description: PHASE_SKEW_ROLE_COMMENT,
    severity: "middle",
    priority: 23,
  },
  {
    id: "11",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "低い職種がない",
    description: "〇〇職種の期待値が非常に低いです。",
    severity: "middle",
    priority: 16,
  },
  {
    id: "12",
    status: "warning",
    category: "組織温度",
    title: "レイヤーごとに感じる期待値に差がない",
    description:
      "〇〇様の期待値が高いと変化しています。特定のコメントへの反応が大きく、経営層のメッセージが伝わっていない可能性があります。フォローを行う必要があります。(対象セグメントを上位3つ表示)",
    severity: "middle",
    priority: 25,
  },
  {
    id: "13",
    status: "warning",
    category: "組織温度",
    title: "部署ごとに感じる期待値に差がない",
    description:
      "〇〇様の期待値が高いです。上位層のメッセージが伝わっていない、期待の不一致が生じている可能性があります。フォローを行う必要があります。(対象部署を上位3つ表示)",
    severity: "middle",
    priority: 26,
  },
  {
    id: "14",
    status: "warning",
    category: "組織温度",
    title: "偏差値の高い部署セグメントがない",
    description:
      "〇〇様の期待値が高いです。(偏差値を使っていないセグメントを上位3つ表示)",
    severity: "middle",
    priority: 27,
  },
  {
    id: "15",
    status: "warning",
    category: "組織温度",
    title: "偏差値の高い職種がない",
    description:
      "〇〇職種の期待値が高いです。(偏差値を満たしていない職種を上位3つ表示)",
    severity: "middle",
    priority: 28,
  },
  {
    id: "16",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "偏差値の高いレイヤーがない",
    description: "〇〇様のキズナスコアが高いです。(上位3つ表示)",
    severity: "high",
    priority: 9,
  },
  {
    id: "17",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "レイヤー間の大きな差がない",
    description:
      "〇〇様が高い一方、〇〇様のキズナスコアが低いです。フォローを行う必要があります。(上位3つ表示)",
    severity: "middle",
    priority: 24,
  },
  {
    id: "18",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "偏差値の高い部署がない",
    description: "〇〇様のキズナスコアが高いです。(上位3つ表示)",
    severity: "high",
    priority: 11,
  },
  {
    id: "19",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "部署間の大きな差がない",
    description:
      "〇〇様が高い一方、〇〇様のキズナスコアが低いです。フォローを行う必要があります。(上位3つ表示)",
    severity: "middle",
    priority: 20,
  },
  {
    id: "20",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "偏差値の高い職種がない",
    description: "〇〇職種のキズナスコアが高いです。(上位3つ表示)",
    severity: "high",
    priority: 10,
  },
  {
    id: "21",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "特定の職種セグメントに対して特定のフェーズが明らかに大きな偏りがない",
    description: PHASE_SKEW_ROLE_COMMENT,
    severity: "middle",
    priority: 29,
  },
  {
    id: "22",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "ギャップの差が明らかに大きい特定の職種がない",
    description:
      "〇〇職種においてギャップの差が大きいです。期待値とキズナスコアにギャップがあり、対人関係において不満を抱えている可能性があります。(対象セグメントを上位3つ表示)",
    severity: "high",
    priority: 13,
  },
  {
    id: "23",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "フェーズ3の割合が一番高い",
    description:
      "フェーズ3は高いです。期待が不足していると判断され、成果に結びつかず、組織全体の活力が十分引き出せていない可能性があります。",
    severity: "high",
    priority: 17,
  },
  {
    id: "24",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "フェーズ3の割合が一番低い",
    description:
      "期待値に達しているメンバーの満足度が低下しています。ムムへのフォローを行うとともに、ムムの見直しを行う必要があります。(上位3つ表示)",
    severity: "middle",
    priority: 31,
  },
  {
    id: "25",
    status: "warning",
    category: "対個人間でのキズナスコア",
    title: "特定のレイヤーにおいて特定のフェーズが明らかに大きな偏りがない",
    description:
      "〇〇様においてムムフェーズが多いです。(フェーズ3は控えめなところが多いですが、上位3つ表示)",
    severity: "middle",
    priority: 30,
  },
  {
    id: "26",
    status: "warning",
    category: "直近のキズナの認識変化",
    title: "マイナスではない",
    description:
      "直近の期待値の変化にマイナスの傾向があります。適切なフォロー体制が整っていない可能性があります。",
    severity: "high",
    priority: 5,
  },
  {
    id: "27",
    status: "warning",
    category: "直近のキズナの認識変化",
    title: "直近の期待値の変化に特定の職種間で大きな差がない",
    description:
      "〇〇様と〇〇様の期待値の変化に大きな差がある場合があります。特定の職種でのフォローが不足している可能性があります。",
    severity: "middle",
    priority: 6,
  },
  {
    id: "28",
    status: "warning",
    category: "直近のキズナの認識変化",
    title: "前期間と比較して下降傾向にない",
    description:
      "期待値が低下している傾向があります。早急な対応が必要です。(対象部署を上位3つ表示)",
    severity: "high",
    priority: 7,
  },
  {
    id: "29",
    status: "warning",
    category: "回答の正確性",
    title: "回答の正確性が〇〇点以上である",
    description:
      "回答の正確性が低いです。全体の分析結果に影響を及ぼしている可能性があります。",
    severity: "low",
    priority: 32,
  },
  {
    id: "30",
    status: "warning",
    category: "回答の正確性",
    title: "20%以下の回答者がいない",
    description:
      "回答の正確性が低い回答者が〇〇%以上います。分析結果の信頼性に影響を及ぼす可能性があります。",
    severity: "low",
    priority: 33,
  },
  {
    id: "31",
    status: "warning",
    category: "役割期待値",
    title: "期待値を満たしていない対象セグメントがない",
    description:
      "〇〇の期待値を満たしていないセグメントがあります。部門間の期待値の不一致が生じている可能性があります。(対象セグメントとその期待値の数字を上位3つ表示)",
    severity: "middle",
    priority: 2,
  },
  {
    id: "32",
    status: "warning",
    category: "役割期待値",
    title: "期待値を満たしていない職種がない",
    description:
      "期待値を大きく下回っている職種があります。特に〇〇において不一致が生じています。早急な対応が必要です。(対象を上位3つ表示)",
    severity: "middle",
    priority: 3,
  },
];

export interface ValueMapPoint {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  kizunaScore: number;
  phase: string;
  phaseTone: "danger" | "warning" | "ok";
  description: string;
}

export const VALUE_MAP_EXPLORE_USE: ValueMapPoint[] = [
  {
    id: "C",
    name: "Cさん",
    subtitle: "マネージャー・営業部",
    x: 30,
    y: 78,
    kizunaScore: 72,
    phase: "フェーズ3",
    phaseTone: "ok",
    description: "探索・短期志向。新しい挑戦への意欲が高く、短期サイクルで成果を出すスタイルです。",
  },
  {
    id: "G",
    name: "Gさん",
    subtitle: "リーダー・企画部",
    x: 60,
    y: 82,
    kizunaScore: 78,
    phase: "フェーズ3",
    phaseTone: "ok",
    description: "探索・長期志向。中長期視点で新しい価値を生み出すリーダーシップを発揮しています。",
  },
  {
    id: "K",
    name: "Kさん",
    subtitle: "メンバー・開発部",
    x: 70,
    y: 60,
    kizunaScore: 65,
    phase: "フェーズ2",
    phaseTone: "warning",
    description: "活用寄り・長期志向。既存資産を活かしつつ将来を見据えた業務遂行が特徴です。",
  },
  {
    id: "D",
    name: "Dさん",
    subtitle: "メンバー・人事部",
    x: 55,
    y: 42,
    kizunaScore: 58,
    phase: "フェーズ2",
    phaseTone: "warning",
    description: "活用・中期志向。安定した運用を支えながら、改善余地への気づきも持っています。",
  },
  {
    id: "E",
    name: "Eさん",
    subtitle: "メンバー・経理部",
    x: 48,
    y: 38,
    kizunaScore: 49,
    phase: "フェーズ1",
    phaseTone: "danger",
    description: "活用・短期志向。現状維持傾向が強く、新しい取り組みへの動機づけが必要。",
  },
];

export const VALUE_MAP_EXPRESS_RESTRAIN: ValueMapPoint[] = [
  {
    id: "B",
    name: "Bさん",
    subtitle: "リーダー・営業部",
    x: 35,
    y: 78,
    kizunaScore: 70,
    phase: "フェーズ3",
    phaseTone: "ok",
    description: "表現・傾聴志向。意見を率直に伝えながらも、相手の声を丁寧にすくい上げるバランス型。",
  },
  {
    id: "K",
    name: "Kさん",
    subtitle: "メンバー・開発部",
    x: 75,
    y: 72,
    kizunaScore: 65,
    phase: "フェーズ2",
    phaseTone: "warning",
    description: "表現・主張志向。自分の考えを明確に発信し、議論をリードする傾向があります。",
  },
  {
    id: "J",
    name: "Jさん",
    subtitle: "マネージャー・管理部",
    x: 60,
    y: 50,
    kizunaScore: 60,
    phase: "フェーズ2",
    phaseTone: "warning",
    description: "中庸・主張寄り。落ち着いた発信を心がけつつ、必要な場面では明確に意見を示します。",
  },
  {
    id: "E",
    name: "Eさん",
    subtitle: "メンバー・経理部",
    x: 75,
    y: 35,
    kizunaScore: 49,
    phase: "フェーズ1",
    phaseTone: "danger",
    description: "抑制・主張志向。発言量は控えめながら、必要な指摘は明確に行うタイプです。",
  },
];
