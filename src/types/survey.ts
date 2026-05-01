/** アプリ権限ロール（一般ユーザー / 管理者） */
export type EmployeeAppRole = "一般ユーザー" | "管理者";

/** 役職（ジョブランク選択） */
export type EmployeeRole = "社長" | "役員" | "部長" | "課長" | "社員";

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

export interface SurveyDistribution {
  id: string;
  title: string;
  description: string;
  targetRoles: EmployeeRole[];
  startDate: string;
  expirationDate: string;
  status: "draft" | "active" | "expired";
  createdAt: string;
  recipientCount: number;
  responseCount: number;
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
