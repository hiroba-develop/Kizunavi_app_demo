import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  Employee,
  EmployeeAppRole,
  EmployeeRole,
} from "../types/survey";
import { SAMPLE_EMPLOYEES } from "../data/surveyQuestions";
import { useEmployeeRoleLabels } from "../contexts/EmployeeRoleLabelsContext";

const APP_ROLE_OPTIONS: EmployeeAppRole[] = ["一般ユーザー", "管理者"];

type DivisionWithSections = {
  name: string;
  sections: string[];
};

const DEFAULT_DEPARTMENT_HIERARCHY: DivisionWithSections[] = [
  { name: "営業部", sections: ["営業1課", "営業2課"] },
  { name: "企画部", sections: ["企画課"] },
  { name: "開発部", sections: ["開発1課", "開発2課"] },
  { name: "人事部", sections: ["人事課"] },
  { name: "経理部", sections: ["経理課"] },
  { name: "マーケ部", sections: ["デジマ課"] },
  { name: "管理部", sections: [] },
  { name: "法務部", sections: [] },
];

const buildInitialHierarchy = (
  base: DivisionWithSections[],
  employees: Employee[]
): DivisionWithSections[] => {
  const result = base.map((d) => ({ name: d.name, sections: [...d.sections] }));
  for (const emp of employees) {
    if (!emp.departmentDivision) continue;
    let div = result.find((d) => d.name === emp.departmentDivision);
    if (!div) {
      div = { name: emp.departmentDivision, sections: [] };
      result.push(div);
    }
    if (emp.departmentSection && !div.sections.includes(emp.departmentSection)) {
      div.sections.push(emp.departmentSection);
    }
  }
  return result;
};

const AVATAR_PALETTES = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

const appRoleBadgeClass: Record<EmployeeAppRole, string> = {
  管理者: "bg-violet-100 text-violet-800",
  一般ユーザー: "bg-gray-100 text-gray-600",
};

type EmployeeFormState = {
  displayName: string;
  email: string;
  appRole: EmployeeAppRole;
  departmentDivision: string;
  departmentSection: string;
  role: EmployeeRole;
  joinedAt: string;
};

const buildInitialForm = (
  hierarchy: DivisionWithSections[]
): EmployeeFormState => ({
  displayName: "",
  email: "",
  appRole: "一般ユーザー",
  departmentDivision: hierarchy[0]?.name ?? "",
  departmentSection: hierarchy[0]?.sections[0] ?? "",
  role: "staff",
  joinedAt: "",
});

const getAvatarInitials = (displayName: string) => {
  const trimmed = displayName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
  }
  return trimmed.slice(0, 2);
};

const getAvatarPalette = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const tenureYears = (joinedAt: string) => {
  if (!joinedAt) return 0;
  const start = new Date(joinedAt).getTime();
  const now = Date.now();
  return Math.max(0, (now - start) / (1000 * 60 * 60 * 24 * 365.25));
};

const isCurrentFiscalYear = (joinedAt: string) => {
  if (!joinedAt) return false;
  const date = new Date(joinedAt);
  const now = new Date();
  const fyStartYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const fyStart = new Date(fyStartYear, 3, 1);
  const fyEnd = new Date(fyStartYear + 1, 3, 1);
  return date >= fyStart && date < fyEnd;
};

function HierarchyMasterEditor({
  hierarchy,
  onAddDivision,
  onRenameDivision,
  onDeleteDivision,
  onAddSection,
  onRenameSection,
  onDeleteSection,
}: {
  hierarchy: DivisionWithSections[];
  onAddDivision: (name: string) => void | string;
  onRenameDivision: (from: string, to: string) => void | string;
  onDeleteDivision: (name: string) => void | string;
  onAddSection: (divisionName: string, sectionName: string) => void | string;
  onRenameSection: (divisionName: string, from: string, to: string) => void | string;
  onDeleteSection: (divisionName: string, sectionName: string) => void | string;
}) {
  const [newDivDraft, setNewDivDraft] = useState("");
  const [divError, setDivError] = useState("");
  const [expandedDivs, setExpandedDivs] = useState<Set<string>>(
    () => new Set(hierarchy.map((d) => d.name))
  );
  const [editingDiv, setEditingDiv] = useState<string | null>(null);
  const [divRenameDraft, setDivRenameDraft] = useState("");
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  const [editingSec, setEditingSec] = useState<{ div: string; sec: string } | null>(null);
  const [secRenameDraft, setSecRenameDraft] = useState("");

  const toggleDiv = (name: string) =>
    setExpandedDivs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const submitAddDiv = () => {
    setDivError("");
    const msg = onAddDivision(newDivDraft.trim());
    if (typeof msg === "string") { setDivError(msg); return; }
    setExpandedDivs((prev) => new Set([...prev, newDivDraft.trim()]));
    setNewDivDraft("");
  };

  const submitRenameDiv = (from: string) => {
    setDivError("");
    const msg = onRenameDivision(from, divRenameDraft.trim());
    if (typeof msg === "string") { setDivError(msg); return; }
    setEditingDiv(null);
    setDivRenameDraft("");
  };

  const submitAddSection = (divName: string) => {
    setSectionErrors((prev) => ({ ...prev, [divName]: "" }));
    const draft = (sectionDrafts[divName] ?? "").trim();
    const msg = onAddSection(divName, draft);
    if (typeof msg === "string") {
      setSectionErrors((prev) => ({ ...prev, [divName]: msg }));
      return;
    }
    setSectionDrafts((prev) => ({ ...prev, [divName]: "" }));
  };

  const submitRenameSection = (divName: string, from: string) => {
    setSectionErrors((prev) => ({ ...prev, [divName]: "" }));
    const msg = onRenameSection(divName, from, secRenameDraft.trim());
    if (typeof msg === "string") {
      setSectionErrors((prev) => ({ ...prev, [divName]: msg }));
      return;
    }
    setEditingSec(null);
    setSecRenameDraft("");
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 sm:p-4 space-y-3">
      <h4 className="text-xs font-semibold text-gray-700">
        部署マスタ編集
      </h4>

      <ul className="space-y-2">
        {hierarchy.map((div) => {
          const isExpanded = expandedDivs.has(div.name);
          const isEditingThisDiv = editingDiv === div.name;
          return (
            <li
              key={div.name}
              className="rounded-md border border-gray-200 bg-white overflow-hidden"
            >
              {/* 部ヘッダー行 */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleDiv(div.name)}
                  className="text-gray-400 hover:text-gray-700 w-4 flex-shrink-0 text-xs"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
                {isEditingThisDiv ? (
                  <>
                    <input
                      type="text"
                      value={divRenameDraft}
                      onChange={(e) => setDivRenameDraft(e.target.value)}
                      className="flex-1 min-w-[120px] border border-gray-300 rounded px-2 py-0.5 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); submitRenameDiv(div.name); }
                        if (e.key === "Escape") { setEditingDiv(null); setDivRenameDraft(""); }
                      }}
                      autoFocus
                    />
                    <button type="button" onClick={() => submitRenameDiv(div.name)} className="text-xs px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50">保存</button>
                    <button type="button" onClick={() => { setEditingDiv(null); setDivRenameDraft(""); }} className="text-xs px-2 py-0.5 text-gray-500 hover:text-gray-800">キャンセル</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-semibold text-gray-800">{div.name}</span>
                    <span className="text-[11px] text-gray-400 mr-1">{div.sections.length}課</span>
                    <button
                      type="button"
                      onClick={() => { setEditingDiv(div.name); setDivRenameDraft(div.name); setDivError(""); }}
                      className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white hover:bg-gray-50"
                    >変更</button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = onDeleteDivision(div.name);
                        if (typeof msg === "string") window.alert(msg);
                      }}
                      className="text-xs px-2 py-0.5 border border-red-100 rounded text-red-600 hover:bg-red-50"
                    >削除</button>
                  </>
                )}
              </div>

              {/* 課リスト */}
              {isExpanded && (
                <div className="px-3 py-2 space-y-1.5">
                  {div.sections.length === 0 && (
                    <p className="text-xs text-gray-400 pl-4">課がまだ登録されていません</p>
                  )}
                  {div.sections.map((sec) => {
                    const isEditingThisSec =
                      editingSec?.div === div.name && editingSec?.sec === sec;
                    return (
                      <div key={sec} className="flex items-center gap-2 pl-4">
                        <span className="text-gray-300 text-xs flex-shrink-0">└</span>
                        {isEditingThisSec ? (
                          <>
                            <input
                              type="text"
                              value={secRenameDraft}
                              onChange={(e) => setSecRenameDraft(e.target.value)}
                              className="flex-1 min-w-[100px] border border-gray-300 rounded px-2 py-0.5 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); submitRenameSection(div.name, sec); }
                                if (e.key === "Escape") { setEditingSec(null); setSecRenameDraft(""); }
                              }}
                              autoFocus
                            />
                            <button type="button" onClick={() => submitRenameSection(div.name, sec)} className="text-xs px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50">保存</button>
                            <button type="button" onClick={() => { setEditingSec(null); setSecRenameDraft(""); }} className="text-xs px-2 py-0.5 text-gray-500 hover:text-gray-800">キャンセル</button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-700">{sec}</span>
                            <button
                              type="button"
                              onClick={() => { setEditingSec({ div: div.name, sec }); setSecRenameDraft(sec); setSectionErrors((p) => ({ ...p, [div.name]: "" })); }}
                              className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white hover:bg-gray-50"
                            >変更</button>
                            <button
                              type="button"
                              onClick={() => {
                                const msg = onDeleteSection(div.name, sec);
                                if (typeof msg === "string") window.alert(msg);
                              }}
                              className="text-xs px-2 py-0.5 border border-red-100 rounded text-red-600 hover:bg-red-50"
                            >削除</button>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* 課を追加 */}
                  <div className="flex items-center gap-2 pl-4 mt-2">
                    <span className="text-gray-200 text-xs flex-shrink-0">└</span>
                    <input
                      type="text"
                      value={sectionDrafts[div.name] ?? ""}
                      onChange={(e) =>
                        setSectionDrafts((prev) => ({ ...prev, [div.name]: e.target.value }))
                      }
                      placeholder="新しい課の名称"
                      className="flex-1 min-w-[120px] border border-dashed border-gray-300 rounded px-2 py-1 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); submitAddSection(div.name); }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => submitAddSection(div.name)}
                      className="text-xs px-2.5 py-1 rounded bg-gray-700 text-white hover:bg-gray-800 whitespace-nowrap"
                    >
                      ＋課を追加
                    </button>
                  </div>
                  {sectionErrors[div.name] && (
                    <p className="text-xs text-red-600 pl-10" role="alert">
                      {sectionErrors[div.name]}
                    </p>
                  )}                </div>
              )}
            </li>
          );
        })}
      </ul>

      {divError && (
        <p className="text-xs text-red-600" role="alert">{divError}</p>
      )}

      {/* 部を追加 */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
        <input
          type="text"
          value={newDivDraft}
          onChange={(e) => setNewDivDraft(e.target.value)}
          placeholder="新しい部の名称（例: 品質保証部）"
          className="flex-1 min-w-[160px] border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); submitAddDiv(); }
          }}
        />
        <button
          type="button"
          onClick={submitAddDiv}
          className="text-xs px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 whitespace-nowrap"
        >
          ＋部を追加
        </button>
      </div>
      <p className="text-[11px] text-gray-400">
        使用中の部・課は削除できません。先に該当ユーザーの部署を変更してください。
      </p>
    </div>
  );
}

const EmployeeRegistration = () => {
  const {
    getEmployeeRoleLabel,
    labels,
    setDisplayLabel,
    defaultLabels,
    rolesInOrder,
  } = useEmployeeRoleLabels();
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);

  const [departmentHierarchy, setDepartmentHierarchy] = useState<DivisionWithSections[]>(() =>
    buildInitialHierarchy(DEFAULT_DEPARTMENT_HIERARCHY, SAMPLE_EMPLOYEES)
  );

  const divisionMasters = departmentHierarchy.map((d) => d.name);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDivision, setActiveDivision] = useState<string>("すべて");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(() =>
    buildInitialForm(buildInitialHierarchy(DEFAULT_DEPARTMENT_HIERARCHY, SAMPLE_EMPLOYEES))
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [editModalEmployee, setEditModalEmployee] =
    useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EmployeeFormState>(() =>
    buildInitialForm([])
  );
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [showMasterEditor, setShowMasterEditor] = useState(false);
  const [showRoleLabelEditor, setShowRoleLabelEditor] = useState(false);
  const roleLabelEditorWasOpenRef = useRef(false);
  const [roleLabelDraft, setRoleLabelDraft] = useState<
    Record<EmployeeRole, string>
  >(() =>
    Object.fromEntries(rolesInOrder.map((r) => [r, defaultLabels[r]])) as Record<
      EmployeeRole,
      string
    >
  );

  useEffect(() => {
    if (showRoleLabelEditor) {
      if (!roleLabelEditorWasOpenRef.current) {
        setRoleLabelDraft(
          Object.fromEntries(rolesInOrder.map((r) => [r, labels[r]])) as Record<
            EmployeeRole,
            string
          >
        );
        roleLabelEditorWasOpenRef.current = true;
      }
    } else {
      roleLabelEditorWasOpenRef.current = false;
    }
  }, [showRoleLabelEditor, labels, rolesInOrder]);

  const saveRoleLabels = () => {
    for (const role of rolesInOrder) {
      setDisplayLabel(role, roleLabelDraft[role] ?? "");
    }
    setShowRoleLabelEditor(false);
  };

  const hasUnsavedRoleLabelChanges = useMemo(
    () =>
      showRoleLabelEditor &&
      rolesInOrder.some(
        (r) => (roleLabelDraft[r] ?? "") !== (labels[r] ?? "")
      ),
    [showRoleLabelEditor, roleLabelDraft, labels, rolesInOrder]
  );

  /** 下書きに既定語から外れた項目があるときだけ「すべて既定に戻す」を出す */
  const showRoleLabelResetToDefaultsButton = useMemo(
    () =>
      showRoleLabelEditor &&
      rolesInOrder.some(
        (r) => (roleLabelDraft[r] ?? "") !== defaultLabels[r]
      ),
    [showRoleLabelEditor, roleLabelDraft, defaultLabels, rolesInOrder]
  );

  const filteredEmployees = employees.filter((emp) => {
    if (
      activeDivision !== "すべて" &&
      emp.departmentDivision !== activeDivision
    ) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      emp.displayName.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.departmentDivision.toLowerCase().includes(term) ||
      emp.departmentSection.toLowerCase().includes(term) ||
      emp.appRole.includes(term) ||
      getEmployeeRoleLabel(emp.role).toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term)
    );
  });

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const divisionCount = new Set(
      employees.map((e) => e.departmentDivision)
    ).size;
    const avgTenure =
      employees.length === 0
        ? 0
        : employees.reduce((sum, e) => sum + tenureYears(e.joinedAt), 0) /
          employees.length;
    const newHires = employees.filter((e) => isCurrentFiscalYear(e.joinedAt))
      .length;
    return {
      totalEmployees,
      divisionCount,
      avgTenure: Math.round(avgTenure * 10) / 10,
      newHires,
    };
  }, [employees]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "departmentDivision") {
      const sections =
        departmentHierarchy.find((d) => d.name === value)?.sections ?? [];
      setForm((prev) => ({
        ...prev,
        departmentDivision: value,
        departmentSection: sections[0] ?? "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !form.displayName ||
      !form.email ||
      !form.departmentDivision ||
      !form.joinedAt
    ) {
      setErrorMessage("必須項目をすべて入力してください");
      return;
    }

    const divEntry = departmentHierarchy.find(
      (d) => d.name === form.departmentDivision
    );
    if (!divEntry) {
      setErrorMessage("部署はマスタに登録された値から選んでください");
      return;
    }
    if (divEntry.sections.length > 0 && !divEntry.sections.includes(form.departmentSection)) {
      setErrorMessage("課はマスタに登録された値から選んでください");
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      appRole: form.appRole,
      departmentDivision: form.departmentDivision,
      departmentSection: form.departmentSection,
      role: form.role,
      joinedAt: form.joinedAt,
    };

    setEmployees((prev) => [...prev, newEmployee]);
    setForm(buildInitialForm(departmentHierarchy));
    setShowForm(false);
  };

  const openEditModal = (emp: Employee) => {
    setEditModalEmployee(emp);
    setEditForm({
      displayName: emp.displayName,
      email: emp.email,
      appRole: emp.appRole,
      departmentDivision: emp.departmentDivision,
      departmentSection: emp.departmentSection,
      role: emp.role,
      joinedAt: emp.joinedAt,
    });
    setEditErrorMessage("");
  };

  const closeEditModal = () => {
    setEditModalEmployee(null);
    setEditForm(buildInitialForm([]));
    setEditErrorMessage("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "departmentDivision") {
      const sections =
        departmentHierarchy.find((d) => d.name === value)?.sections ?? [];
      setEditForm((prev) => ({
        ...prev,
        departmentDivision: value,
        departmentSection: sections[0] ?? "",
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editModalEmployee) return;
    setEditErrorMessage("");

    if (
      !editForm.displayName ||
      !editForm.email ||
      !editForm.departmentDivision ||
      !editForm.joinedAt
    ) {
      setEditErrorMessage("必須項目をすべて入力してください");
      return;
    }

    const divEntry = departmentHierarchy.find(
      (d) => d.name === editForm.departmentDivision
    );
    if (!divEntry) {
      setEditErrorMessage("部署はマスタに登録された値から選んでください");
      return;
    }
    if (divEntry.sections.length > 0 && !divEntry.sections.includes(editForm.departmentSection)) {
      setEditErrorMessage("課はマスタに登録された値から選んでください");
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editModalEmployee.id
          ? {
              ...emp,
              displayName: editForm.displayName.trim(),
              email: editForm.email.trim(),
              appRole: editForm.appRole,
              departmentDivision: editForm.departmentDivision,
              departmentSection: editForm.departmentSection,
              role: editForm.role,
              joinedAt: editForm.joinedAt,
            }
          : emp
      )
    );
    closeEditModal();
  };

  const confirmDeleteEmployee = () => {
    if (!deleteTarget) return;
    setEmployees((prev) => prev.filter((emp) => emp.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  useEffect(() => {
    const divNames = departmentHierarchy.map((d) => d.name);
    const fixForm = (f: EmployeeFormState): EmployeeFormState => {
      const validDiv = divNames.includes(f.departmentDivision)
        ? f.departmentDivision
        : (divNames[0] ?? "");
      const sections =
        departmentHierarchy.find((d) => d.name === validDiv)?.sections ?? [];
      const validSec = sections.includes(f.departmentSection)
        ? f.departmentSection
        : (sections[0] ?? "");
      return { ...f, departmentDivision: validDiv, departmentSection: validSec };
    };
    setForm(fixForm);
    setEditForm(fixForm);
  }, [departmentHierarchy]);

  useEffect(() => {
    if (!editModalEmployee && !deleteTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editModalEmployee) {
        setEditModalEmployee(null);
        setEditForm(buildInitialForm([]));
        setEditErrorMessage("");
      }
      if (deleteTarget) setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editModalEmployee, deleteTarget]);

  const addDivision = (label: string) => {
    if (!label) return "名称を入力してください";
    if (departmentHierarchy.some((d) => d.name === label))
      return "同じ名前が既にあります";
    setDepartmentHierarchy((prev) => [...prev, { name: label, sections: [] }]);
  };

  const renameDivision = (from: string, to: string) => {
    if (!to) return "名称を入力してください";
    if (from === to) return undefined;
    if (departmentHierarchy.some((d) => d.name === to))
      return "同じ名前が既にあります";
    setDepartmentHierarchy((prev) =>
      prev.map((d) => (d.name === from ? { ...d, name: to } : d))
    );
    setEmployees((prev) =>
      prev.map((e) =>
        e.departmentDivision === from ? { ...e, departmentDivision: to } : e
      )
    );
    setForm((f) =>
      f.departmentDivision === from ? { ...f, departmentDivision: to } : f
    );
    setEditForm((f) =>
      f.departmentDivision === from ? { ...f, departmentDivision: to } : f
    );
    if (activeDivision === from) setActiveDivision(to);
  };

  const deleteDivision = (label: string) => {
    const inUse = employees.some((e) => e.departmentDivision === label);
    if (inUse) {
      return "この部を使用しているユーザーがいるため削除できません";
    }
    setDepartmentHierarchy((prev) => prev.filter((d) => d.name !== label));
  };

  const addSection = (divisionName: string, sectionName: string) => {
    if (!sectionName) return "名称を入力してください";
    const div = departmentHierarchy.find((d) => d.name === divisionName);
    if (!div) return "部署が見つかりません";
    if (div.sections.includes(sectionName)) return "同じ名前が既にあります";
    setDepartmentHierarchy((prev) =>
      prev.map((d) =>
        d.name === divisionName
          ? { ...d, sections: [...d.sections, sectionName] }
          : d
      )
    );
  };

  const renameSection = (
    divisionName: string,
    from: string,
    to: string
  ) => {
    if (!to) return "名称を入力してください";
    if (from === to) return undefined;
    const div = departmentHierarchy.find((d) => d.name === divisionName);
    if (!div) return "部署が見つかりません";
    if (div.sections.includes(to)) return "同じ名前が既にあります";
    setDepartmentHierarchy((prev) =>
      prev.map((d) =>
        d.name === divisionName
          ? { ...d, sections: d.sections.map((s) => (s === from ? to : s)) }
          : d
      )
    );
    setEmployees((prev) =>
      prev.map((e) =>
        e.departmentDivision === divisionName && e.departmentSection === from
          ? { ...e, departmentSection: to }
          : e
      )
    );
    setForm((f) =>
      f.departmentDivision === divisionName && f.departmentSection === from
        ? { ...f, departmentSection: to }
        : f
    );
    setEditForm((f) =>
      f.departmentDivision === divisionName && f.departmentSection === from
        ? { ...f, departmentSection: to }
        : f
    );
  };

  const deleteSection = (divisionName: string, sectionName: string) => {
    const inUse = employees.some(
      (e) =>
        e.departmentDivision === divisionName &&
        e.departmentSection === sectionName
    );
    if (inUse) {
      return "この課を使用しているユーザーがいるため削除できません";
    }
    setDepartmentHierarchy((prev) =>
      prev.map((d) =>
        d.name === divisionName
          ? { ...d, sections: d.sections.filter((s) => s !== sectionName) }
          : d
      )
    );
  };

  const divisionTabs = divisionMasters;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
            <span className="text-xs font-semibold tracking-widest text-gray-500">
              SETTINGS
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">従業員登録・管理</h2>
          <p className="mt-1 text-sm text-gray-500">
            {employees.length}名登録済み
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setForm(buildInitialForm(departmentHierarchy));
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            従業員を追加
          </button>
          <button
            type="button"
            onClick={() => setShowRoleLabelEditor((p) => !p)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            役職の表示名を編集
          </button>
          <button
            type="button"
            onClick={() => setShowMasterEditor((p) => !p)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            部署マスタ編集（部・課）
          </button>
        </div>
      </div>

      {showRoleLabelEditor && (
        <div className="bg-white shadow rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                役職の表示名
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-xl">
                5階層の役職区分は固定です。一覧やプルダウンに表示する文言だけ変更できます。入力後「保存」で反映され、このブラウザに保存されます。
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-x-4 gap-y-2 justify-end sm:justify-start sm:ml-auto">
              {showRoleLabelResetToDefaultsButton && (
                <button
                  type="button"
                  onClick={() =>
                    setRoleLabelDraft(
                      Object.fromEntries(
                        rolesInOrder.map((r) => [r, defaultLabels[r]])
                      ) as Record<EmployeeRole, string>
                    )
                  }
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  すべて既定に戻す
                </button>
              )}
              {hasUnsavedRoleLabelChanges && (
                <button
                  type="button"
                  onClick={saveRoleLabels}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                >
                  保存
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesInOrder.map((role) => (
              <div key={role}>
                <label
                  className="block text-xs font-medium text-gray-500 mb-1"
                  htmlFor={`role-label-${role}`}
                >
                  <span className="ml-2 text-gray-400">
                    既定: {defaultLabels[role]}
                  </span>
                </label>
                <input
                  id={`role-label-${role}`}
                  type="text"
                  value={roleLabelDraft[role] ?? ""}
                  onChange={(e) =>
                    setRoleLabelDraft((prev) => ({
                      ...prev,
                      [role]: e.target.value,
                    }))
                  }
                  className="mt-0.5 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-900"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showMasterEditor && (
        <HierarchyMasterEditor
          hierarchy={departmentHierarchy}
          onAddDivision={addDivision}
          onRenameDivision={renameDivision}
          onDeleteDivision={deleteDivision}
          onAddSection={addSection}
          onRenameSection={renameSection}
          onDeleteSection={deleteSection}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 lg:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="表示名・メール・部署・ロールで検索…"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {["すべて", ...divisionTabs].map((dept) => {
            const isActive = activeDivision === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setActiveDivision(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {dept}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">
            {filteredEmployees.length}/{employees.length} 件
          </span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg border border-gray-100 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@company.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  表示名 <span className="text-red-500">*</span>
                </label>
                <input
                  name="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="山田 太郎"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ロール <span className="text-red-500">*</span>
                </label>
                <select
                  name="appRole"
                  value={form.appRole}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  {APP_ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  入社年月日 <span className="text-red-500">*</span>
                </label>
                <input
                  name="joinedAt"
                  type="date"
                  value={form.joinedAt}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  部署（部） <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentDivision"
                  value={form.departmentDivision}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  {divisionMasters.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  部署（課） <span className="text-red-500">*</span>
                </label>
                {(() => {
                  const secs =
                    departmentHierarchy.find(
                      (d) => d.name === form.departmentDivision
                    )?.sections ?? [];
                  return (
                    <select
                      name="departmentSection"
                      value={
                        secs.includes(form.departmentSection)
                          ? form.departmentSection
                          : (secs[0] ?? "")
                      }
                      onChange={handleChange}
                      disabled={secs.length === 0}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      {secs.length === 0 ? (
                        <option value="">（この部に課が登録されていません）</option>
                      ) : (
                        secs.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                    </select>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  役職 <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  {rolesInOrder.map((r) => (
                    <option key={r} value={r}>
                      {getEmployeeRoleLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errorMessage && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(buildInitialForm(departmentHierarchy));
                  setShowForm(false);
                  setErrorMessage("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                登録する
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500">
                <th className="px-6 py-3">表示名</th>
                <th className="px-6 py-3 hidden lg:table-cell">メールアドレス</th>
                <th className="px-6 py-3">ロール</th>
                <th className="px-6 py-3">部署(部)</th>
                <th className="px-6 py-3">部署(課)</th>
                <th className="px-6 py-3">役職</th>
                <th className="px-6 py-3">入社年月日</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {searchTerm || activeDivision !== "すべて"
                      ? "条件に一致する従業員が見つかりません"
                      : "従業員が登録されていません"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const palette = getAvatarPalette(emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full ${palette.bg} ${palette.text} flex items-center justify-center text-xs font-semibold border border-white shadow-sm`}
                          >
                            {getAvatarInitials(emp.displayName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {emp.displayName}
                            </div>
                            <div className="text-xs text-gray-500 truncate lg:hidden">
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[220px] truncate hidden lg:table-cell">
                        {emp.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${appRoleBadgeClass[emp.appRole]}`}
                        >
                          {emp.appRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {emp.departmentDivision}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {emp.departmentSection}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getEmployeeRoleLabel(emp.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {emp.joinedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(emp)}
                            className="px-2 py-1 text-xs border border-red-200 rounded text-red-600 hover:bg-red-50"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="総従業員数"
          value={`${stats.totalEmployees}名`}
          accent="blue"
        />
        <StatCard
          label="部署(部)の種類数"
          value={`${stats.divisionCount}種`}
          accent="purple"
        />
        <StatCard
          label="平均在籍年数"
          value={`${stats.avgTenure}年`}
          accent="green"
        />
        <StatCard
          label="今期入社"
          value={`${stats.newHires}名`}
          accent="orange"
        />
      </div>

      {editModalEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-employee-title"
            className="bg-white rounded-lg shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
              <h3
                id="edit-employee-title"
                className="text-lg font-semibold text-gray-900"
              >
                従業員を編集
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="閉じる"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    value={editForm.displayName}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ロール <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="appRole"
                    value={editForm.appRole}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  >
                    {APP_ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    入社年月日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="joinedAt"
                    type="date"
                    value={editForm.joinedAt}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    部署（部） <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentDivision"
                    value={editForm.departmentDivision}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  >
                    {divisionMasters.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    部署（課） <span className="text-red-500">*</span>
                  </label>
                  {(() => {
                    const secs =
                      departmentHierarchy.find(
                        (d) => d.name === editForm.departmentDivision
                      )?.sections ?? [];
                    return (
                      <select
                        name="departmentSection"
                        value={
                          secs.includes(editForm.departmentSection)
                            ? editForm.departmentSection
                            : (secs[0] ?? "")
                        }
                        onChange={handleEditChange}
                        disabled={secs.length === 0}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {secs.length === 0 ? (
                          <option value="">（この部に課が登録されていません）</option>
                        ) : (
                          secs.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))
                        )}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    役職 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  >
                    {rolesInOrder.map((r) => (
                      <option key={r} value={r}>
                        {getEmployeeRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {editErrorMessage && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editErrorMessage}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
            className="bg-white rounded-lg shadow-xl border border-gray-100 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-confirm-title"
              className="text-lg font-semibold text-gray-900"
            >
              従業員を削除しますか？
            </h3>
            <p id="delete-confirm-desc" className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {deleteTarget.displayName}
              </span>
              （{deleteTarget.email}）を削除します。この操作は取り消せません。
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteEmployee}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  accent: "blue" | "purple" | "green" | "orange";
}

const StatCard = ({ label, value, accent }: StatCardProps) => {
  const accentMap = {
    blue: { bg: "bg-blue-50", label: "text-blue-700", value: "text-blue-700" },
    purple: {
      bg: "bg-purple-50",
      label: "text-purple-700",
      value: "text-purple-700",
    },
    green: {
      bg: "bg-green-50",
      label: "text-green-700",
      value: "text-green-700",
    },
    orange: {
      bg: "bg-orange-50",
      label: "text-orange-700",
      value: "text-orange-700",
    },
  };
  const c = accentMap[accent];
  return (
    <div className={`${c.bg} rounded-lg px-4 py-3`}>
      <div className={`text-[11px] font-medium ${c.label}`}>{label}</div>
      <div className={`mt-1 text-xl font-bold ${c.value}`}>{value}</div>
    </div>
  );
};

export default EmployeeRegistration;
