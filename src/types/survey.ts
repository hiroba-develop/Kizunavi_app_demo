export type EmployeeRole =
  | "社長"
  | "役員"
  | "部長"
  | "課長"
  | "係長"
  | "主任"
  | "社員";

export type EmployeeLayer = "マネージャー" | "リーダー" | "一般社員";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: EmployeeRole;
  layer: EmployeeLayer;
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
