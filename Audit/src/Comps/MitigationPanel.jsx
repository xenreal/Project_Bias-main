import React, { useState } from 'react';
import { generateMitigation } from '../services/geminiService';

const MitigationPanel = ({ analysis, fileData }) => {
  const [mitigation, setMitigation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulateFix = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMitigation(analysis, fileData);
      setMitigation(result);
    } catch (err) {
      setError(err.message || 'Failed to generate mitigation');
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Simulate Fix Button */}
      {!mitigation && (
        <button
          onClick={handleSimulateFix}
          disabled={loading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Mitigation…</span>
            </>
          ) : (
            <>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Simulate Fix</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Mitigation Results */}
      {mitigation && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">✨</span>
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                Mitigation Strategy
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{mitigation.description}</p>
          </div>

          {/* Expected Improvement */}
          {mitigation.new_estimated_bias_score !== undefined && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                Expected Improvement
              </h4>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-red-500">
                    {analysis.bias_score}%
                  </p>
                  <p className="text-xs text-slate-400">Before</p>
                </div>
                <svg
                  className="w-6 h-6 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-500">
                    {mitigation.new_estimated_bias_score}%
                  </p>
                  <p className="text-xs text-slate-400">After</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    ↓{' '}
                    {analysis.bias_score - mitigation.new_estimated_bias_score}%
                    reduction
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Synthetic Data (for data files) */}
          {mitigation.mitigation_type === 'synthetic_data' &&
            mitigation.synthetic_data && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3">
                  Synthetic Data ({mitigation.synthetic_data.length} rows)
                </h4>
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-100 dark:border-slate-700">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                      <tr>
                        {mitigation.synthetic_data.length > 0 &&
                          Object.keys(mitigation.synthetic_data[0]).map(
                            (key) => (
                              <th
                                key={key}
                                className="text-left p-2 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700"
                              >
                                {key}
                              </th>
                            )
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      {mitigation.synthetic_data.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                        >
                          {Object.values(row).map((val, j) => (
                            <td
                              key={j}
                              className="p-2 text-slate-700 dark:text-slate-300"
                            >
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Image Prompts (for image files) */}
          {mitigation.mitigation_type === 'image_prompts' &&
            mitigation.image_prompts && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3">
                  Balancing Image Prompts
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mitigation.image_prompts.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700"
                    >
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                        {i + 1}. {item.prompt}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                          Addresses: {item.addresses_bias}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                          Target: {item.target_demographic}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Expected Improvement Description */}
          {mitigation.expected_improvement && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-semibold">Impact: </span>
                {mitigation.expected_improvement}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MitigationPanel;
