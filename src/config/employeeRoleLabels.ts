import type { EmployeeRole } from "../types/survey";

/** 5階層の順序（役職プルダウン・論理順） */
export const EMPLOYEE_ROLES_IN_ORDER: readonly EmployeeRole[] = [
  "president",
  "executive",
  "division_head",
  "section_head",
  "staff",
] as const;

/** アプリ既定の役職表記。画面からの変更は localStorage に差分保存 */
export const DEFAULT_EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  president: "社長",
  executive: "役員",
  division_head: "部長",
  section_head: "課長",
  staff: "社員",
};
