import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { SurveyDistribution as SurveyDistributionType } from "../types/survey";
import { SAMPLE_EMPLOYEES, SURVEY_QUESTIONS } from "../data/surveyQuestions";

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const initialSurveys: SurveyDistributionType[] = [
  {
    id: "srv-001",
    title: "2026年度 第1回 組織サーベイ",
    description: "組織の現状把握のためのサーベイです",
    targetRoles: ["部長", "課長", "社員"],
    startDate: "2026-04-01",
    expirationDate: "2026-05-15",
    status: "active",
    createdAt: "2026-03-20",
    recipientCount: SAMPLE_EMPLOYEES.length,
    responseCount: 2,
  },
  {
    id: "srv-002",
    title: "経営層向けキズナ調査",
    description: "経営層を対象とした関係性調査",
    targetRoles: ["社長", "役員"],
    startDate: "2026-04-15",
    expirationDate: "2026-04-29",
    status: "expired",
    createdAt: "2026-04-10",
    recipientCount: SAMPLE_EMPLOYEES.length,
    responseCount: 2,
  },
];

const initialForm = {
  title: "",
  description: "",
  expirationDate: addDays(today(), 14),
};

const SurveyDistribution = () => {
  const [surveys, setSurveys] = useState<SurveyDistributionType[]>(initialSurveys);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");

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
      targetRoles: ["社長", "役員", "部長", "課長", "社員"],
      startDate: today(),
      expirationDate: form.expirationDate,
      status: "active",
      createdAt: today(),
      recipientCount: SAMPLE_EMPLOYEES.length,
      responseCount: 0,
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    setForm(initialForm);
    setShowForm(false);
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
              const responseRate =
                survey.recipientCount === 0
                  ? 0
                  : Math.round(
                      (survey.responseCount / survey.recipientCount) * 100
                    );
              return (
                <div key={survey.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
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
                          回答状況: {survey.responseCount}/{survey.recipientCount}（{responseRate}%）
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to={`/survey/${survey.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                      >
                        サーベイを開く
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyDistribution;
