import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  Employee,
  EmployeeLayer,
  EmployeeRole,
} from "../types/survey";
import { SAMPLE_EMPLOYEES } from "../data/surveyQuestions";

const ROLE_OPTIONS: EmployeeRole[] = [
  "社長",
  "役員",
  "部長",
  "課長",
  "係長",
  "主任",
  "社員",
];
const LAYER_OPTIONS: EmployeeLayer[] = ["マネージャー", "リーダー", "一般社員"];

const DEFAULT_DEPARTMENTS = [
  "営業部",
  "企画部",
  "開発部",
  "人事部",
  "経理部",
  "マーケ部",
  "管理部",
  "法務部",
];

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

const layerBadgeClass: Record<EmployeeLayer, string> = {
  マネージャー: "bg-purple-100 text-purple-700",
  リーダー: "bg-blue-100 text-blue-700",
  一般社員: "bg-gray-100 text-gray-600",
};

const initialForm = {
  name: "",
  email: "",
  department: DEFAULT_DEPARTMENTS[0],
  role: "社員" as EmployeeRole,
  layer: "一般社員" as EmployeeLayer,
  joinedAt: "",
};

const getAvatarInitials = (name: string) => {
  const trimmed = name.trim();
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
  const fyStartYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const fyStart = new Date(fyStartYear, 3, 1);
  const fyEnd = new Date(fyStartYear + 1, 3, 1);
  return date >= fyStart && date < fyEnd;
};

const EmployeeRegistration = () => {
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("すべて");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [editModalEmployee, setEditModalEmployee] = useState<Employee | null>(
    null
  );
  const [editForm, setEditForm] = useState(initialForm);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const departments = useMemo(() => {
    const dynamicDepartments = Array.from(
      new Set(employees.map((emp) => emp.department))
    );
    const merged = [...DEFAULT_DEPARTMENTS];
    for (const dept of dynamicDepartments) {
      if (!merged.includes(dept)) merged.push(dept);
    }
    return merged;
  }, [employees]);

  const filteredEmployees = employees.filter((emp) => {
    if (activeDepartment !== "すべて" && emp.department !== activeDepartment) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term)
    );
  });

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const departmentCount = new Set(employees.map((e) => e.department)).size;
    const avgTenure =
      employees.length === 0
        ? 0
        : employees.reduce((sum, e) => sum + tenureYears(e.joinedAt), 0) /
          employees.length;
    const newHires = employees.filter((e) => isCurrentFiscalYear(e.joinedAt))
      .length;
    return {
      totalEmployees,
      departmentCount,
      avgTenure: Math.round(avgTenure * 10) / 10,
      newHires,
    };
  }, [employees]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.name || !form.email || !form.department || !form.joinedAt) {
      setErrorMessage("すべての項目を入力してください");
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      ...form,
    };

    setEmployees((prev) => [...prev, newEmployee]);
    setForm(initialForm);
    setShowForm(false);
  };

  const openEditModal = (emp: Employee) => {
    setEditModalEmployee(emp);
    setEditForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      layer: emp.layer,
      joinedAt: emp.joinedAt,
    });
    setEditErrorMessage("");
  };

  const closeEditModal = () => {
    setEditModalEmployee(null);
    setEditForm(initialForm);
    setEditErrorMessage("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editModalEmployee) return;
    setEditErrorMessage("");

    if (
      !editForm.name ||
      !editForm.email ||
      !editForm.department ||
      !editForm.joinedAt
    ) {
      setEditErrorMessage("すべての項目を入力してください");
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editModalEmployee.id ? { ...emp, ...editForm } : emp
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
    if (!editModalEmployee && !deleteTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editModalEmployee) {
        setEditModalEmployee(null);
        setEditForm(initialForm);
        setEditErrorMessage("");
      }
      if (deleteTarget) setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editModalEmployee, deleteTarget]);

  const handleCsvExport = () => {
    const header = [
      "氏名",
      "メールアドレス",
      "部署",
      "役職",
      "レイヤー",
      "入社日",
    ];
    const rows = employees.map((e) => [
      e.name,
      e.email,
      e.department,
      e.role,
      e.layer,
      e.joinedAt,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
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
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <svg
              className="h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            テンプレート
          </button>
          <button
            type="button"
            onClick={handleCsvExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <svg
              className="h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            CSVエクスポート
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-primary rounded-md text-sm font-medium text-primary bg-white hover:bg-primary/5"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            CSVインポート
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            従業員を追加
          </button>
        </div>
      </div>

      {/* 検索 + 部署フィルタ */}
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
            placeholder="氏名・メール・部署で検索…"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {["すべて", ...departments].map((dept) => {
            const isActive = activeDepartment === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setActiveDepartment(dept)}
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

      {/* フォーム */}
      {showForm && (
        <div className="bg-white shadow rounded-lg border border-gray-100 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="山田 太郎"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                />
              </div>
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
                  部署 <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
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
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  レイヤー <span className="text-red-500">*</span>
                </label>
                <select
                  name="layer"
                  value={form.layer}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  {LAYER_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  入社日 <span className="text-red-500">*</span>
                </label>
                <input
                  name="joinedAt"
                  type="date"
                  value={form.joinedAt}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                />
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
                  setForm(initialForm);
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

      {/* テーブル */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500">
                <th className="px-6 py-3">氏名</th>
                <th className="px-6 py-3">部署</th>
                <th className="px-6 py-3">役職</th>
                <th className="px-6 py-3">レイヤー</th>
                <th className="px-6 py-3">メール</th>
                <th className="px-6 py-3">入社日</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {searchTerm || activeDepartment !== "すべて"
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
                            {getAvatarInitials(emp.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {emp.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {emp.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {emp.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${layerBadgeClass[emp.layer]}`}
                        >
                          {emp.layer}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate">
                        {emp.email}
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

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="総従業員数"
          value={`${stats.totalEmployees}名`}
          accent="blue"
        />
        <StatCard
          label="部署数"
          value={`${stats.departmentCount}部署`}
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

      {/* 編集モーダル */}
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
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
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
                    部署 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
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
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    レイヤー <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="layer"
                    value={editForm.layer}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  >
                    {LAYER_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    入社日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="joinedAt"
                    type="date"
                    value={editForm.joinedAt}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
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

      {/* 削除確認 */}
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
            <p
              id="delete-confirm-desc"
              className="mt-2 text-sm text-gray-600"
            >
              <span className="font-medium text-gray-900">
                {deleteTarget.name}
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
