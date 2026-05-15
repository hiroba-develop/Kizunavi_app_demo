import { useState } from "react";
import type { FormEvent } from "react";
import type {
  SurveyDistribution as SurveyDistributionType,
  SurveyRecipientProgress,
} from "../types/survey";
import { SAMPLE_EMPLOYEES } from "../data/surveyQuestions";
import { EMPLOYEE_ROLES_IN_ORDER } from "../config/employeeRoleLabels";
import { useEmployeeRoleLabels } from "../contexts/EmployeeRoleLabelsContext";

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const employeeById = new Map(SAMPLE_EMPLOYEES.map((e) => [e.id, e]));

const makeRecipients = (
  responded: { id: string; at: string }[]
): SurveyRecipientProgress[] => {
  const map = new Map(responded.map((r) => [r.id, r.at]));
  return SAMPLE_EMPLOYEES.map((e) => {
    const at = map.get(e.id);
    return {
      employeeId: e.id,
      hasResponded: at !== undefined,
      respondedAt: at,
    };
  });
};

const initialSurveys: SurveyDistributionType[] = [
  {
    id: "srv-001",
    title: "2026年度 第1回 組織サーベイ",
    description: "組織の現状把握のためのサーベイです",
    targetRoles: ["division_head", "section_head", "staff"],
    startDate: "2026-04-01",
    expirationDate: "2026-05-15",
    status: "active",
    createdAt: "2026-03-20",
    recipients: makeRecipients([
      { id: "emp-001", at: "2026-04-02" },
      { id: "emp-002", at: "2026-04-03" },
    ]),
  },
  {
    id: "srv-002",
    title: "経営層向けキズナ調査",
    description: "経営層を対象とした関係性調査",
    targetRoles: ["president", "executive"],
    startDate: "2026-04-15",
    expirationDate: "2026-04-29",
    status: "expired",
    createdAt: "2026-04-10",
    recipients: makeRecipients([
      { id: "emp-003", at: "2026-04-16" },
      { id: "emp-007", at: "2026-04-17" },
    ]),
  },
];

const initialForm = {
  title: "",
  description: "",
  expirationDate: addDays(today(), 14),
};

const buildSurveyAnswerUrl = (surveyId: string) =>
  new URL(
    `${import.meta.env.BASE_URL}survey/${surveyId}`,
    window.location.origin
  ).href;

const Surveys = () => {
  const { getEmployeeRoleLabel } = useEmployeeRoleLabels();
  const [surveys, setSurveys] = useState<SurveyDistributionType[]>(initialSurveys);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [distributedSurveyUrl, setDistributedSurveyUrl] = useState<
    string | null
  >(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage("サーベイタイトルを入力してください");
      return;
    }
    if (!form.expirationDate) {
      setErrorMessage("回答有効期限を入力してください");
      return;
    }
    if (new Date(form.expirationDate) <= new Date()) {
      setErrorMessage("有効期限は今日より後の日付を指定してください");
      return;
    }

    const newSurvey: SurveyDistributionType = {
      id: `srv-${Date.now()}`,
      title: form.title,
      description: form.description,
      targetRoles: [...EMPLOYEE_ROLES_IN_ORDER],
      startDate: today(),
      expirationDate: form.expirationDate,
      status: "active",
      createdAt: today(),
      recipients: SAMPLE_EMPLOYEES.map((e) => ({
        employeeId: e.id,
        hasResponded: false,
      })),
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    setForm(initialForm);
    setShowForm(false);
    setDistributedSurveyUrl(buildSurveyAnswerUrl(newSurvey.id));
    setCopyFeedback(false);
  };

  const copyDistributedUrl = async () => {
    if (!distributedSurveyUrl) return;
    try {
      await navigator.clipboard.writeText(distributedSurveyUrl);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setCopyFeedback(false);
    }
  };

  const getStatusInfo = (survey: SurveyDistributionType) => {
    const isExpired = new Date(survey.expirationDate) < new Date();
    if (isExpired || survey.status === "expired") {
      return { label: "終了", className: "bg-gray-100 text-gray-700" };
    }
    if (survey.status === "active") {
      return { label: "配信中", className: "bg-green-100 text-green-700" };
    }
    return { label: "下書き", className: "bg-yellow-100 text-yellow-700" };
  };

  const computeRemainingDays = (expirationDate: string) => {
    return Math.ceil(
      (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
        <span className="text-xs font-semibold tracking-widest text-gray-500">
          SURVEY
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">サーベイ実施</h1>

      <div className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                サーベイ配信
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                有効期限を設定して全員にサーベイを即時配信します
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setErrorMessage("");
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {showForm ? "配信フォームを閉じる" : "+ 新規サーベイを配信"}
            </button>
          </div>

          {distributedSurveyUrl && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-green-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900">
                    配信が完了しました。以下のURLからサーベイに回答できます（メール文面に含めてください）。
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={distributedSurveyUrl}
                      className="block w-full min-w-0 rounded-md border border-green-200 bg-white py-2 px-3 text-sm text-gray-900 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={copyDistributedUrl}
                      className="flex-shrink-0 px-4 py-2 rounded-md border border-green-700 text-sm font-medium text-green-800 bg-white hover:bg-green-100"
                    >
                      {copyFeedback ? "コピーしました" : "URLをコピー"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDistributedSurveyUrl(null)}
                  className="text-sm text-green-800 hover:text-green-950 underline sm:no-underline sm:hover:underline"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    サーベイタイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="例: 2026年度 上期 組織サーベイ"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    説明文（任意）
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="サーベイの目的や注意事項を記載してください"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="expirationDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    回答有効期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={form.expirationDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
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
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    サーベイを配信する
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              配信履歴
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              これまでに配信したサーベイの一覧
            </p>
          </div>
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            {surveys.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                まだサーベイが配信されていません
              </div>
            ) : (
              surveys.map((survey) => {
                const statusInfo = getStatusInfo(survey);
                const remaining = computeRemainingDays(survey.expirationDate);
                const recipientCount = survey.recipients.length;
                const responseCount = survey.recipients.filter(
                  (r) => r.hasResponded
                ).length;
                const responseRate =
                  recipientCount === 0
                    ? 0
                    : Math.round((responseCount / recipientCount) * 100);
                const answered = survey.recipients.filter((r) => r.hasResponded);
                const pending = survey.recipients.filter((r) => !r.hasResponded);
                return (
                  <div key={survey.id} className="px-4 py-4 sm:px-6">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">
                          {survey.title}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      {survey.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {survey.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>有効期限: {survey.expirationDate}</span>
                        {statusInfo.label === "配信中" && (
                          <span className="text-green-700">
                            残り{Math.max(remaining, 0)}日
                          </span>
                        )}
                        <span>
                          回答状況: {responseCount}/{recipientCount}（{responseRate}%）
                        </span>
                      </div>
                    </div>
                    <details className="mt-4 group rounded-lg border border-gray-200 bg-gray-50/80">
                      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 [&::-webkit-details-marker]:hidden">
                        <span className="inline-block w-4 text-center text-gray-400 group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                        配信先の回答状況（回答済 {answered.length} 名 / 未回答{" "}
                        {pending.length} 名）
                      </summary>
                      <div className="px-3 pb-3 pt-1 grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-2">
                            回答済み
                          </h4>
                          {answered.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              まだ回答したユーザーはいません
                            </p>
                          ) : (
                            <ul className="space-y-1.5 text-sm">
                              {answered.map((r) => {
                                const emp = employeeById.get(r.employeeId);
                                return (
                                  <li
                                    key={r.employeeId}
                                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0"
                                  >
                                    <span className="font-medium text-gray-900">
                                      {emp?.displayName ?? r.employeeId}
                                    </span>
                                    {emp && (
                                      <span className="text-xs text-gray-500">
                                        {emp.departmentSection} ·{" "}
                                        {getEmployeeRoleLabel(emp.role)}
                                      </span>
                                    )}
                                    {r.respondedAt && (
                                      <span className="text-xs text-gray-500">
                                        回答日 {r.respondedAt}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
                            未回答
                          </h4>
                          {pending.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              全員が回答済みです
                            </p>
                          ) : (
                            <ul className="space-y-1.5 text-sm">
                              {pending.map((r) => {
                                const emp = employeeById.get(r.employeeId);
                                return (
                                  <li
                                    key={r.employeeId}
                                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0"
                                  >
                                    <span className="font-medium text-gray-900">
                                      {emp?.displayName ?? r.employeeId}
                                    </span>
                                    {emp && (
                                      <span className="text-xs text-gray-500">
                                        {emp.email}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Surveys;
