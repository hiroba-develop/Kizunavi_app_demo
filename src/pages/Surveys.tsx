import SurveyDistribution from "../components/SurveyDistribution";

const Surveys = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
        <span className="text-xs font-semibold tracking-widest text-gray-500">
          SURVEY
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">サーベイ実施</h1>
      <SurveyDistribution />
    </div>
  );
};

export default Surveys;
