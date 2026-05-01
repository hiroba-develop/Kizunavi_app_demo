import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { EmployeeRole } from "../types/survey";
import {
  DEFAULT_EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLES_IN_ORDER,
} from "../config/employeeRoleLabels";

const STORAGE_KEY = "kizunavi_employee_role_label_overrides";

function loadOverrides(): Partial<Record<EmployeeRole, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Partial<Record<EmployeeRole, string>> = {};
    for (const role of EMPLOYEE_ROLES_IN_ORDER) {
      const v = (parsed as Record<string, unknown>)[role];
      if (typeof v === "string" && v.trim() !== "") {
        out[role] = v.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Partial<Record<EmployeeRole, string>>) {
  try {
    const toStore: Partial<Record<EmployeeRole, string>> = {};
    for (const role of EMPLOYEE_ROLES_IN_ORDER) {
      const v = overrides[role];
      if (v !== undefined && v.trim() !== "") toStore[role] = v.trim();
    }
    if (Object.keys(toStore).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  } catch {
    /* ignore quota */
  }
}

function mergeLabels(
  overrides: Partial<Record<EmployeeRole, string>>
): Record<EmployeeRole, string> {
  return { ...DEFAULT_EMPLOYEE_ROLE_LABELS, ...overrides };
}

export interface EmployeeRoleLabelsContextValue {
  /** 解決済み表示名（既定＋上書き） */
  labels: Record<EmployeeRole, string>;
  getEmployeeRoleLabel: (role: EmployeeRole) => string;
  /** 画面上の表記を更新。空文字または既定と同じ値なら上書き解除 */
  setDisplayLabel: (role: EmployeeRole, value: string) => void;
  resetDisplayLabelsToDefaults: () => void;
  defaultLabels: typeof DEFAULT_EMPLOYEE_ROLE_LABELS;
  rolesInOrder: typeof EMPLOYEE_ROLES_IN_ORDER;
}

const EmployeeRoleLabelsContext = createContext<
  EmployeeRoleLabelsContextValue | undefined
>(undefined);

export const EmployeeRoleLabelsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [overrides, setOverrides] = useState<Partial<
    Record<EmployeeRole, string>
  >>(() => loadOverrides());

  const labels = useMemo(() => mergeLabels(overrides), [overrides]);

  const getEmployeeRoleLabel = useCallback(
    (role: EmployeeRole) => labels[role] ?? DEFAULT_EMPLOYEE_ROLE_LABELS[role],
    [labels]
  );

  const setDisplayLabel = useCallback(
    (role: EmployeeRole, raw: string) => {
      const v = raw.trim();
      const def = DEFAULT_EMPLOYEE_ROLE_LABELS[role];
      setOverrides((prev) => {
        const next = { ...prev };
        if (v === "" || v === def) {
          delete next[role];
        } else {
          next[role] = v;
        }
        saveOverrides(next);
        return next;
      });
    },
    []
  );

  const resetDisplayLabelsToDefaults = useCallback(() => {
    setOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      labels,
      getEmployeeRoleLabel,
      setDisplayLabel,
      resetDisplayLabelsToDefaults,
      defaultLabels: DEFAULT_EMPLOYEE_ROLE_LABELS,
      rolesInOrder: EMPLOYEE_ROLES_IN_ORDER,
    }),
    [
      labels,
      getEmployeeRoleLabel,
      setDisplayLabel,
      resetDisplayLabelsToDefaults,
    ]
  );

  return (
    <EmployeeRoleLabelsContext.Provider value={value}>
      {children}
    </EmployeeRoleLabelsContext.Provider>
  );
};

export function useEmployeeRoleLabels(): EmployeeRoleLabelsContextValue {
  const ctx = useContext(EmployeeRoleLabelsContext);
  if (!ctx) {
    throw new Error(
      "useEmployeeRoleLabels must be used within EmployeeRoleLabelsProvider"
    );
  }
  return ctx;
}
