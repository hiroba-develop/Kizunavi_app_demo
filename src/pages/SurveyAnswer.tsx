import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SCALE_LABELS } from "../types/survey";
import { SURVEY_QUESTIONS } from "../data/surveyQuestions";

const QUESTIONS_PER_PAGE = 10;

const SurveyAnswer = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const totalPages = Math.ceil(SURVEY_QUESTIONS.length / QUESTIONS_PER_PAGE);

  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return SURVEY_QUESTIONS.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPage]);

  const answeredCount = Object.keys(answers).length;
  const completionPercent = Math.round(
    (answeredCount / SURVEY_QUESTIONS.length) * 100
  );

  const currentPageAnswered = currentQuestions.every(
    (q) => answers[q.id] !== undefined
  );

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (answeredCount < SURVEY_QUESTIONS.length) {
      const firstUnansweredPage = Math.ceil(
        (SURVEY_QUESTIONS.findIndex((q) => answers[q.id] === undefined) + 1) /
          QUESTIONS_PER_PAGE
      );
      setCurrentPage(firstUnansweredPage);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            ご回答ありがとうございました
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            サーベイへのご協力に感謝いたします。
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  組織サーベイ
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  サーベイID: {surveyId}
                </p>
              </div>
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                中断する
              </Link>
            </div>

            {/* 進捗バー */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>
                  回答進捗: {answeredCount} / {SURVEY_QUESTIONS.length} 問
                </span>
                <span>{completionPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ページ情報 */}
          <div className="px-4 py-3 sm:px-6 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              ページ {currentPage} / {totalPages}（{(currentPage - 1) * QUESTIONS_PER_PAGE + 1}～
              {Math.min(currentPage * QUESTIONS_PER_PAGE, SURVEY_QUESTIONS.length)}問目）
            </p>
          </div>

          {/* 設問リスト */}
          <div className="divide-y divide-gray-200">
            {currentQuestions.map((question, idx) => {
              const questionNumber = (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1;
              const selectedValue = answers[question.id];
              return (
                <div key={question.id} className="px-4 py-5 sm:px-6">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold">
                      {questionNumber}
                    </span>
                    <div className="flex-1">
                      <span className="inline-block mb-2 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        {question.category}
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {question.text}
                      </p>
                    </div>
                  </div>

                  {/* 7段階評価 */}
                  <div className="mt-4 ml-10">
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {SCALE_LABELS.map((label, i) => {
                        const value = i + 1;
                        const isSelected = selectedValue === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAnswer(question.id, value)}
                            className={`flex flex-col items-center justify-start gap-1 px-1 py-2 rounded-md border text-xs transition-colors ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow"
                                : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            <span className="font-bold text-base">{value}</span>
                            <span className="text-[10px] leading-tight text-center hidden sm:block">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500 sm:hidden">
                      <span>{SCALE_LABELS[0]}</span>
                      <span>{SCALE_LABELS[6]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ページネーション */}
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← 前のページ
              </button>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isActive = page === currentPage;
                    const pageQuestions = SURVEY_QUESTIONS.slice(
                      (page - 1) * QUESTIONS_PER_PAGE,
                      page * QUESTIONS_PER_PAGE
                    );
                    const allAnswered = pageQuestions.every(
                      (q) => answers[q.id] !== undefined
                    );
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`relative h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : allAnswered
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!currentPageAnswered}
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次のページ →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  回答を送信
                </button>
              )}
            </div>
            {!currentPageAnswered && currentPage < totalPages && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                次のページに進むには、このページのすべての設問に回答してください
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnswer;
