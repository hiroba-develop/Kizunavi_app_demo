import { useMemo, useState } from "react";
import {
  ALERT_CATEGORIES,
  ALERT_CATEGORY_DISPLAY_ORDER,
  ALERTS,
  DISPLAY_ALERT_LIMIT,
  OVERALL_SCORE,
  PREVIOUS_SCORE_DELTA,
  SCORE_CARDS,
  VALUE_MAP_EXPLORE_USE,
  VALUE_MAP_EXPRESS_RESTRAIN,
} from "../data/dashboardData";
import type { AlertItem, ScoreCardData, ValueMapPoint } from "../data/dashboardData";

const alertNumericId = (id: string) => parseInt(id, 10) || 0;

const categoryDisplayIndex = (category: string) => {
  const i = ALERT_CATEGORY_DISPLAY_ORDER.indexOf(category);
  return i === -1 ? 999 : i;
};

/** カテゴリタブ順 → 同一カテゴリ内は優先順位 → id */
const compareAlertByCategoryThenPriority = (a: AlertItem, b: AlertItem) => {
  const byCat = categoryDisplayIndex(a.category) - categoryDisplayIndex(b.category);
  if (byCat !== 0) return byCat;
  if (a.priority !== b.priority) return a.priority - b.priority;
  return alertNumericId(a.id) - alertNumericId(b.id);
};

const Dashboard = () => {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [period, setPeriod] = useState<"month" | "all">("month");

  /** 全件から優先順位で選んだ共通の上位 N 件（各タブでこの集合を元にする） */
  const priorityTopPool = useMemo(
    () =>
      [...ALERTS]
        .sort((a, b) =>
          a.priority !== b.priority
            ? a.priority - b.priority
            : alertNumericId(a.id) - alertNumericId(b.id),
        )
        .slice(0, DISPLAY_ALERT_LIMIT),
    [],
  );

  const filteredAlerts = useMemo(() => {
    if (activeCategory === "すべて") {
      return [...priorityTopPool].sort(compareAlertByCategoryThenPriority);
    }
    return [...priorityTopPool]
      .filter((a) => a.category === activeCategory)
      .sort((a, b) =>
        a.priority !== b.priority
          ? a.priority - b.priority
          : alertNumericId(a.id) - alertNumericId(b.id),
      );
  }, [activeCategory, priorityTopPool]);

  const unreadCount = filteredAlerts.length;

  return (
    <div className="space-y-6">
      {/* 総合スコア */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
          <span className="text-xs font-semibold tracking-widest text-gray-500">
            総合スコア
          </span>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <CircularScore value={OVERALL_SCORE} size={84} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-gray-900">
                    キズナ度
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {OVERALL_SCORE}点
                  </span>
                  <span className="text-sm text-gray-500">/ 100点</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400"
                    style={{ width: `${OVERALL_SCORE}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                😊
              </div>
              <div>
                <div className="text-[11px] text-gray-500">コンディション</div>
                <div className="text-sm font-semibold text-gray-900">良好</div>
              </div>
            </div>
          </div>

          {/* サブスコア */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            {SCORE_CARDS.map((card) => (
              <SubScoreCard key={card.key} card={card} />
            ))}
          </div>

          <div className="mt-2 text-[11px] text-gray-500 text-right">
            前回比 {PREVIOUS_SCORE_DELTA > 0 ? "+" : ""}
            {PREVIOUS_SCORE_DELTA}
          </div>
        </div>
      </section>

      {/* アラート一覧 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
            <span className="text-xs font-semibold tracking-widest text-gray-500">
              アラート一覧
            </span>
            <span className="text-[11px] text-gray-400">
              優先順位の高い順に最大{DISPLAY_ALERT_LIMIT}件表示（全
              {ALERTS.length}項目より）
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                period === "month"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              過去1ヶ月
            </button>
            <button
              type="button"
              onClick={() => setPeriod("all")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                period === "all"
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              未読送 {unreadCount}件
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
          {/* カテゴリフィルタ */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 border-b border-gray-100">
            {ALERT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* アラートリスト */}
          <ul className="divide-y divide-gray-100">
            {filteredAlerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {filteredAlerts.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-gray-400">
                該当するアラートはありません
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* 価値観分布 */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
          <span className="text-xs font-semibold tracking-widest text-gray-500">
            価値観分布
          </span>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-5">
          <div className="text-base font-semibold text-gray-900">
            VALUE MAP
            <span className="ml-2 text-xs font-normal text-gray-500">
              ドットをクリックすると詳細を表示
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValueMapPanel
              title="探索 / 活用軸"
              points={VALUE_MAP_EXPLORE_USE}
              yTopLabel="探索"
              yBottomLabel="活用"
              xLeftLabel="短期"
              xRightLabel="長期"
              dotColor="#3b82f6"
            />
            <ValueMapPanel
              title="表現 / 抑制軸"
              points={VALUE_MAP_EXPRESS_RESTRAIN}
              yTopLabel="表現"
              yBottomLabel="抑制"
              xLeftLabel="傾聴"
              xRightLabel="主張"
              dotColor="#a855f7"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

interface CircularScoreProps {
  value: number;
  size?: number;
}

const CircularScore = ({ value, size = 80 }: CircularScoreProps) => {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#fb923c"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none">
          {value}
        </span>
      </div>
    </div>
  );
};

interface SubScoreCardProps {
  card: ScoreCardData;
}

const SubScoreCard = ({ card }: SubScoreCardProps) => {
  const colorMap = {
    gray: { value: "text-gray-700", bar: "bg-gray-300", arc: "#9ca3af" },
    orange: { value: "text-orange-600", bar: "bg-orange-300", arc: "#fb923c" },
    blue: { value: "text-blue-600", bar: "bg-blue-300", arc: "#3b82f6" },
    green: { value: "text-emerald-600", bar: "bg-emerald-300", arc: "#10b981" },
    amber: { value: "text-amber-600", bar: "bg-amber-300", arc: "#f59e0b" },
    red: { value: "text-rose-600", bar: "bg-rose-300", arc: "#f43f5e" },
  };
  const palette = colorMap[card.color];

  // 数値抽出
  const num = parseFloat(card.value.replace(/[^0-9.\-]/g, "")) || 0;
  const percent = Math.min(100, Math.max(0, Math.abs(num)));

  return (
    <div className="border border-gray-100 rounded-lg px-3 py-3 bg-white">
      <div className="text-[10px] text-gray-500 leading-tight">{card.label}</div>
      <div className={`mt-1 text-xl font-bold ${palette.value} leading-none`}>
        {card.value}
      </div>
      <div className="mt-2 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full rounded-full ${palette.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {card.delta && (
        <div className="mt-1 text-[10px] text-gray-400">{card.delta}</div>
      )}
    </div>
  );
};

interface AlertRowProps {
  alert: AlertItem;
}

const AlertRow = ({ alert }: AlertRowProps) => {
  const severityClass = {
    high: "bg-rose-100 text-rose-700",
    middle: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
  };
  const severityLabel = {
    high: "High",
    middle: "Middle",
    low: "Low",
  };

  return (
    <li className="px-4 py-3 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <span className="text-xs font-medium text-gray-400 w-6 flex-shrink-0 pt-0.5">
          {alert.id}
        </span>
        <span className="flex-shrink-0 mt-0.5">
          {alert.status === "warning" ? (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-gray-500 mb-0.5">
            {alert.category}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {alert.title}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{alert.description}</div>
        </div>
        <span
          className={`flex-shrink-0 inline-flex px-2 py-0.5 text-[10px] font-semibold rounded ${severityClass[alert.severity]}`}
        >
          {severityLabel[alert.severity]}
        </span>
      </div>
    </li>
  );
};

interface ValueMapChartProps {
  title: string;
  points: ValueMapPoint[];
  yTopLabel: string;
  yBottomLabel: string;
  xLeftLabel: string;
  xRightLabel: string;
  dotColor: string;
}

const ValueMapPanel = ({
  title,
  points,
  yTopLabel,
  yBottomLabel,
  xLeftLabel,
  xRightLabel,
  dotColor,
}: ValueMapChartProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePoint = points.find((p) => p.id === activeId) ?? null;

  const padding = 40;
  const width = 480;
  const height = 280;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const toPx = (p: ValueMapPoint) => ({
    cx: padding + (p.x / 100) * innerW,
    cy: padding + (1 - p.y / 100) * innerH,
  });

  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="relative bg-gradient-to-br from-blue-50/30 to-amber-50/30 rounded-md border border-gray-100">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-72"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* グリッド背景 */}
          <rect
            x={padding}
            y={padding}
            width={innerW}
            height={innerH}
            fill="none"
            stroke="#e5e7eb"
            strokeDasharray="3 3"
          />
          {/* 中央十字 */}
          <line
            x1={padding + innerW / 2}
            y1={padding}
            x2={padding + innerW / 2}
            y2={padding + innerH}
            stroke="#9ca3af"
            strokeDasharray="3 3"
          />
          <line
            x1={padding}
            y1={padding + innerH / 2}
            x2={padding + innerW}
            y2={padding + innerH / 2}
            stroke="#9ca3af"
            strokeDasharray="3 3"
          />
          {/* 軸ラベル */}
          <text
            x={padding + innerW / 2}
            y={padding - 14}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
          >
            {yTopLabel}
          </text>
          <text
            x={padding + innerW / 2}
            y={padding + innerH + 24}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
          >
            {yBottomLabel}
          </text>
          <text
            x={padding - 6}
            y={padding + innerH / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fill="#6b7280"
          >
            {xLeftLabel}
          </text>
          <text
            x={padding + innerW + 6}
            y={padding + innerH / 2 + 4}
            textAnchor="start"
            fontSize={11}
            fill="#6b7280"
          >
            {xRightLabel}
          </text>
          {/* ドット */}
          {points.map((p) => {
            const { cx, cy } = toPx(p);
            const isActive = activeId === p.id;
            return (
              <g
                key={p.id}
                onClick={() =>
                  setActiveId((prev) => (prev === p.id ? null : p.id))
                }
                style={{ cursor: "pointer" }}
              >
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill={dotColor}
                    fillOpacity={0.18}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 8 : 6}
                  fill={dotColor}
                  fillOpacity={isActive ? 1 : 0.9}
                  stroke={isActive ? "#ffffff" : "none"}
                  strokeWidth={isActive ? 2 : 0}
                />
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#374151"
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <PointDetailCard point={activePoint} dotColor={dotColor} />
    </div>
  );
};

interface PointDetailCardProps {
  point: ValueMapPoint | null;
  dotColor: string;
}

const PointDetailCard = ({ point, dotColor }: PointDetailCardProps) => {
  if (!point) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-5 text-center text-xs text-gray-400">
        ドットをクリックするとメンバーの詳細が表示されます
      </div>
    );
  }

  const phaseClass =
    point.phaseTone === "danger"
      ? "text-rose-600"
      : point.phaseTone === "warning"
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div
        className="h-1"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-gray-100">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-base bg-white"
          style={{ borderColor: dotColor, borderWidth: 2, color: dotColor }}
        >
          {point.id}
        </div>
        <div>
          <div className="text-base font-bold text-gray-900 leading-tight">
            {point.name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{point.subtitle}</div>
        </div>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-2">
        <div className="rounded border border-gray-100 px-3 py-2 bg-gray-50">
          <div className="text-[10px] text-gray-500">キズナスコア</div>
          <div className="text-xl font-bold text-rose-600 leading-none mt-1">
            {point.kizunaScore}
          </div>
        </div>
        <div className="rounded border border-gray-100 px-3 py-2 bg-gray-50">
          <div className="text-[10px] text-gray-500">フェーズ</div>
          <div
            className={`text-base font-bold leading-none mt-1 ${phaseClass}`}
          >
            {point.phase}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-xs text-gray-700 leading-relaxed">
        {point.description}
      </div>
    </div>
  );
};

export default Dashboard;
