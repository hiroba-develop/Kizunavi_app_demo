/** アプリ権限ロール（一般ユーザー / 管理者） */
export type EmployeeAppRole = "一般ユーザー" | "管理者";

/**
 * 役職5階層の内部キー（固定）。画面上の文言は useEmployeeRoleLabels().getEmployeeRoleLabel を使用
 * - president: 既定表記「社長」
 * - executive: 既定表記「役員」
 * - division_head: 既定表記「部長」
 * - section_head: 既定表記「課長」
 * - staff: 既定表記「社員」
 */
export type EmployeeRole =
  | "president"
  | "executive"
  | "division_head"
  | "section_head"
  | "staff";

export interface Employee {
  id: string;
  /** 表示名 */
  displayName: string;
  email: string;
  appRole: EmployeeAppRole;
  /** 部署(部) — 値はユーザー管理のマスタから選択 */
  departmentDivision: string;
  /** 部署(課) — 値はユーザー管理のマスタから選択 */
  departmentSection: string;
  /** 役職 */
  role: EmployeeRole;
  /** 入社年月日（YYYY-MM-DD） */
  joinedAt: string;
}

export interface SurveyQuestion {
  id: number;
  category: string;
  text: string;
}

/** 配信先1人あたりの回答進捗（メール配信後、kizunaviで回答したか） */
export interface SurveyRecipientProgress {
  employeeId: string;
  hasResponded: boolean;
  /** 回答日（YYYY-MM-DD、未回答時は未定義） */
  respondedAt?: string;
}

export interface SurveyDistribution {
  id: string;
  title: string;
  description: string;
  targetRoles: EmployeeRole[];
  startDate: string;
  expirationDate: string;
  status: "draft" | "active" | "expired";
  createdAt: string;
  /** 配信先ごとの回答状況（recipientCount / responseCount はこれから算出） */
  recipients: SurveyRecipientProgress[];
}

export interface SurveyAnswer {
  questionId: number;
  value: number;
}

export const SCALE_LABELS = [
  "全くそう思わない",
  "そう思わない",
  "ややそう思わない",
  "どちらでもない",
  "ややそう思う",
  "そう思う",
  "強くそう思う",
] as const;
