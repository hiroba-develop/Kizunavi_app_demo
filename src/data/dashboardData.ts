export interface ScoreCardData {
  key: string;
  label: string;
  value: string;
  delta?: string;
  color: "gray" | "orange" | "blue" | "green" | "amber" | "red";
}

export const OVERALL_SCORE = 62.5;
export const PREVIOUS_SCORE_DELTA = 0.5;

export const SCORE_CARDS: ScoreCardData[] = [
  { key: "interpersonal", label: "対人と対のキズナスコア", value: "64点", color: "gray" },
  {
    key: "trend",
    label: "直近のキズナ度の動き",
    value: "+43点",
    delta: "前回比 +0.5",
    color: "orange",
  },
  { key: "department", label: "部署別", value: "66点", color: "blue" },
  { key: "engagement", label: "役職別エンゲージメント", value: "74点", color: "green" },
  { key: "role", label: "役職別", value: "80点", color: "amber" },
  { key: "roleTrend", label: "役職別の動き", value: "73点", color: "red" },
];

export type AlertSeverity = "high" | "middle" | "low";
export type AlertStatus = "warning" | "ok";

export interface AlertItem {
  id: string;
  number: string;
  status: AlertStatus;
  category: string;
  title: string;
  description: string;
  severity: AlertSeverity;
}

export const ALERT_CATEGORIES = [
  "すべて",
  "従業員エンゲージメント",
  "組織温度",
  "対人間でのキズナスコア",
  "直近のキズナの認識変化",
  "回答の正確性",
  "到達期待値",
];

export const ALERTS: AlertItem[] = [
  {
    id: "01",
    number: "01",
    status: "warning",
    category: "直近のキズナの認識変化",
    title: "極端に低い箇所（一貫性）がない",
    description:
      "関係値が毀損した箇所があり、早急な対応が必要です。既に毀損している箇所は最優先対応が必要であるため、速やかに原因の特定と改善策の実施を行ってください。",
    severity: "high",
  },
  {
    id: "02",
    number: "02",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "毀損期がない",
    description:
      "関係値が毀損した従業員がいます。毀損状態の存在は離職・組織崩壊リスクに直結するため、早期のフォローが必要です。",
    severity: "middle",
  },
  {
    id: "03",
    number: "03",
    status: "ok",
    category: "対人間でのキズナスコア",
    title: "極端に低い部署がない",
    description:
      "○○部署のキズナスコアが低いです。（基準を満たしていない）○○の関係崩壊は業務停止リスクがあるため、注意が必要です。",
    severity: "high",
  },
  {
    id: "04",
    number: "04",
    status: "warning",
    category: "組織温度",
    title: "部署ごとに感じる組織温度に差分がない",
    description:
      "○○部署が会社の熱量が低いと感じています。他部署との差が大きく、部署間温度差は連携不足の根幹原因となるため対応が必要です。",
    severity: "middle",
  },
  {
    id: "05",
    number: "05",
    status: "ok",
    category: "直近のキズナの認識変化",
    title: "マイナスではない",
    description:
      "直近の関係値の変化がマイナス傾向にあります。組織内の変化に注意が必要です。直近での変化は現在進行形の崩壊リスクのため、継続的なモニタリングを行ってください。",
    severity: "middle",
  },
  {
    id: "06",
    number: "06",
    status: "warning",
    category: "到達期待値",
    title: "期待値を大きく下回っている（極端に低い）状態がない",
    description:
      "期待値を大きく下回っている状態が存在します。期待値の極端な乖離は役割不全・組織機能停止につながるため、早急な対応が必要です。",
    severity: "high",
  },
  {
    id: "07",
    number: "07",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "極端に低い役職セグメントがない",
    description:
      "○○層のエンゲージメントが低いです。（基準を満たしていない）特定役職の崩壊は意思決定・現場統制の崩れに直結するため、注視が必要です。",
    severity: "high",
  },
  {
    id: "08",
    number: "08",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "極端に低い部署がない",
    description:
      "○○部署のエンゲージメントが低いです。（基準を満たせていない）部署単位の低下は業務パフォーマンスに直接影響するため、フォローが必要です。",
    severity: "high",
  },
  {
    id: "09",
    number: "09",
    status: "ok",
    category: "組織温度",
    title: "極端に低い役職セグメントがない",
    description:
      "○○層の組織温度が低いです。（基準を満たしていない）組織温度の低下はマネジメント機能低下につながるため、対策を検討してください。",
    severity: "middle",
  },
  {
    id: "10",
    number: "10",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "フェーズ3の満足度が一番高い",
    description:
      "関係値が成熟したメンバーの満足度が低いです。成熟層の満足度低下は優秀者の離脱リスクに直結するため、早急な改善が必要です。",
    severity: "high",
  },
  {
    id: "11",
    number: "11",
    status: "ok",
    category: "対人間でのキズナスコア",
    title: "極端に低い項目がない",
    description:
      "△△項目のキズナスコアが低いです。△△の見直しを行う必要があります。キズナの基盤要素の低下は関係性の根幹崩壊につながるため、注視が必要です。",
    severity: "high",
  },
  {
    id: "12",
    number: "12",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "極端に低い対組織要素項目がない",
    description:
      "○○項目のスコアが低いです。○○の見直しを行う必要があります。対組織要素の低下は制度・構造の問題で再発性が高いため、計画的な改善が求められます。",
    severity: "high",
  },
  {
    id: "13",
    number: "13",
    status: "warning",
    category: "対人間でのキズナスコア",
    title: "フェーズ3の割合が一番多い",
    description:
      "フェーズ3の割合が低いです。関係値が安定している状態の比率が低く、組織全体のキズナが十分に構築されていない可能性があります。",
    severity: "high",
  },
  {
    id: "14",
    number: "14",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "フェーズ3の割合が一番多い",
    description:
      "フェーズ3の割合が低いです。絆が構築できていない可能性があります。フェーズ3不足は組織として絆が成立していない状態のため、関係構築への投資が必要です。",
    severity: "high",
  },
  {
    id: "15",
    number: "15",
    status: "warning",
    category: "従業員エンゲージメント",
    title: "特定の組織セグメントに対して特定のフェーズが特に多いなどの偏りがない",
    description:
      "○○組織において△△フェーズが多いです。フェーズの偏りは特定構造の歪みを示すため、組織課題の特定と対策が必要です。",
    severity: "middle",
  },
  {
    id: "16",
    number: "16",
    status: "warning",
    category: "対人間でのキズナスコア",
    title: "フェーズ3の満足度が一番高い",
    description:
      "関係値が成熟している層の満足度が低いです。特に△△項目のスコアが低いです。成熟層の満足度低下は制度不整合の兆候となるため、要因の精査を行ってください。",
    severity: "middle",
  },
  {
    id: "17",
    number: "17",
    status: "ok",
    category: "対人間でのキズナスコア",
    title: "項目間に大きな差分がない",
    description:
      "××項目が高い一方、○○項目のキズナスコアが相対的に低いです。要素間の差分は偏った関係構造を示すため、フォローを検討してください。",
    severity: "middle",
  },
  {
    id: "18",
    number: "18",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "役職セグメント間に大きな差分がない",
    description:
      "××職が高い一方、○○職のエンゲージメントが相対的に低いです。役職間格差は不満・分断の温床となるため、フォローが必要です。",
    severity: "middle",
  },
  {
    id: "19",
    number: "19",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "部署セグメント間に大きな差分がない",
    description:
      "××部署が高い一方、○○部署のエンゲージメントが相対的に低いです。部署間格差はサイロ化や連携不全を引き起こすため、フォローが必要です。",
    severity: "middle",
  },
  {
    id: "20",
    number: "20",
    status: "ok",
    category: "従業員エンゲージメント",
    title: "対組織要素項目間に大きな差分がない",
    description:
      "××項目が高い一方、○○項目のスコアが相対的に低いです。要素間の歪みはバランス崩壊の前兆となるため、フォローを行ってください。",
    severity: "middle",
  },
  {
    id: "21",
    number: "21",
    status: "ok",
    category: "対人間でのキズナスコア",
    title: "レイヤー間に大きな差分がない",
    description:
      "××層が高い一方、○○層のキズナスコアが相対的に低いです。レイヤー間差分は階層分断の兆候となるため、フォローを検討してください。",
    severity: "middle",
  },
  {
    id: "22",
    number: "22",
    status: "warning",
    category: "対人間でのキズナスコア",
    title: "特定の役職セグメントにおいて特定のフェーズが特に多いなどの偏りがない",
    description:
      "○○職において△△フェーズが多いです。役職ごとのフェーズ偏りは構造課題を示唆するため、対象役職へのフォローが必要です。",
    severity: "middle",
  },
  {
    id: "23",
    number: "23",
    status: "ok",
    category: "対人間でのキズナスコア",
    title: "特定のレイヤーにおいて特定のフェーズが特に多いなどの偏りがない",
    description:
      "○○層において△△フェーズが多いです。レイヤー偏りは局所的リスクの蓄積を示すため、対象レイヤーへの介入が必要です。",
    severity: "middle",
  },
  {
    id: "24",
    number: "24",
    status: "warning",
    category: "対人間でのキズナスコア",
    title: "ギャップの差分が大きい人同士がいない",
    description:
      "○○と○○の間で認識ギャップが大きいです。認識ギャップはコンフリクトや事故の直接要因となるため、相互認識のすり合わせを行ってください。",
    severity: "high",
  },
  {
    id: "25",
    number: "25",
    status: "ok",
    category: "組織温度",
    title: "レイヤーごとに感じる組織温度に差分がない",
    description:
      "○○職が会社の熱量が低いと感じています。他セグメントとの認識差が大きく、温度感の乖離が発生している可能性があるため、フォローが必要です。",
    severity: "middle",
  },
  {
    id: "26",
    number: "26",
    status: "ok",
    category: "組織温度",
    title: "極端に低い部署セグメントがない",
    description:
      "○○部署の組織温度が低いです。（基準を満たしていない）部署温度低下は士気・生産性低下につながるため、フォローを検討してください。",
    severity: "middle",
  },
  {
    id: "27",
    number: "27",
    status: "ok",
    category: "直近のキズナの認識変化",
    title: "直近の認識変化の感じ方に関係値同士で大きな差がない",
    description:
      "○○職と○○職の関係値の変化に対する認識に大きな差があります。認識差は将来的な衝突の予備軍となるため、すり合わせの場を持つことを推奨します。",
    severity: "middle",
  },
  {
    id: "28",
    number: "28",
    status: "warning",
    category: "回答の正確性",
    title: "50点以下の回答者がいない",
    description:
      "回答の正確性が低い回答者が○○人います。一部回答の信頼性問題で影響は限定的ですが、分析結果の信頼性に影響する可能性があります。",
    severity: "low",
  },
  {
    id: "29",
    number: "29",
    status: "ok",
    category: "回答の正確性",
    title: "回答の正確性が平均60点以上である",
    description:
      "回答の正確性が低いです。分析精度の問題であり直接の組織問題ではないため緊急性は低いものの、全体の分析精度に影響が出ている可能性があります。",
    severity: "low",
  },
  {
    id: "30",
    number: "30",
    status: "ok",
    category: "到達期待値",
    title: "期待値を満たせていない対象セグメントがいない",
    description:
      "○○の期待値が満たされていないセグメントがあります。役割認識や期待値のすり合わせを行う必要があります。期待値未達は徐々にパフォーマンス低下につながるため、注意が必要です。",
    severity: "middle",
  },
  {
    id: "31",
    number: "31",
    status: "warning",
    category: "対人間でのキズナスコア",
    title: "極端に低いレイヤーがいない",
    description:
      "○○層のキズナスコアが低いです。レイヤー単位の関係崩壊は縦の統制が崩れるため、早期の関係性回復が必要です。",
    severity: "high",
  },
  {
    id: "32",
    number: "32",
    status: "ok",
    category: "組織温度",
    title: "極端に低い役職セグメントがない",
    description:
      "○○職の組織温度が低いです。（基準を満たせていない）役職単位の温度低下はマネジメント機能低下につながるため、フォローを検討してください。",
    severity: "middle",
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
