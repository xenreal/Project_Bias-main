import React, { useState, useEffect } from 'react';
import BiasSpeedometer from './BiasSpeedometer';
import InsightCards from './InsightCards';
import MitigationPanel from './MitigationPanel';

const ResultDashboard = ({
  analysis,
  fileData,
  onDownloadReport,
  onReset,
}) => {
  const [showFlash, setShowFlash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowFlash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!analysis) return null;

  const score = analysis.bias_score ?? 0;
  let flashColorClass = 'bg-red-500';
  if (score <= 30) flashColorClass = 'bg-emerald-500';
  else if (score <= 60) flashColorClass = 'bg-amber-500';

  return (
    <>
      {showFlash && (
        <div 
          className={`fixed inset-0 z-[100] pointer-events-none animate-flashEffect ${flashColorClass}`}
        />
      )}
      <div className="w-full max-w-3xl mx-auto py-8 px-4 space-y-8 animate-dashIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Audit{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Results
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Analysis of{' '}
            <span className="font-medium text-slate-700">
              {fileData?.fileName}
            </span>
          </p>
        </div>

        {/* Speedometer */}
        <div
          className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
          id="bias-gauge-section"
        >
          <BiasSpeedometer
            score={analysis.bias_score}
            biasType={analysis.primary_bias_type}
          />
        </div>

        {/* Insight Cards */}
        <div id="insights-section">
          <InsightCards analysis={analysis} />
        </div>

        {/* Mitigation */}
        <div id="mitigation-section">
          <MitigationPanel analysis={analysis} fileData={fileData} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onDownloadReport}
            className="flex-1 py-3 px-6 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download Audit Report</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Analyze Another File
          </button>
        </div>

        <style>{`
          @keyframes dashIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-dashIn {
            animation: dashIn 0.6s ease-out;
          }
          @keyframes flashEffect {
            0% { opacity: 0.35; }
            15% { opacity: 0.35; }
            100% { opacity: 0; }
          }
          .animate-flashEffect {
            animation: flashEffect 1.5s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default ResultDashboard;
