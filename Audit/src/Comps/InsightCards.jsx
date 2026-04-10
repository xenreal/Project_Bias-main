import React, { useState } from 'react';

const severityColor = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const severityIcon = {
  low: '✓',
  medium: '⚠',
  high: '⚡',
  critical: '🔴',
};

const CollapsibleSection = ({ 
  title, 
  icon, 
  defaultOpen = false, 
  containerClass = "bg-white border border-slate-200 rounded-xl shadow-sm", 
  headerClass = "text-slate-700",
  bodyClass = "p-5 border-t border-black/5",
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`${containerClass} overflow-hidden`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 focus:outline-none transition-colors hover:bg-black/5 ${headerClass}`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2 flex items-center justify-center">{icon}</span>}
          <h4 className="text-sm font-bold uppercase tracking-wide m-0 p-0 text-inherit">{title}</h4>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className={bodyClass}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- DATA VIEW ----
const DataInsightCard = ({ metrics, findings }) => {
  return (
    <div className="space-y-4">
      {/* Selection Rates */}
      {metrics?.selection_rates && Object.keys(metrics.selection_rates).length > 0 && (
          <CollapsibleSection
            title="Selection Rates"
            icon={<span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-2 text-slate-500 font-medium">Group</th>
                    <th className="pb-2 text-slate-500 font-medium text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.selection_rates).map(([group, rate]) => (
                    <tr key={group} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 text-slate-700">{group}</td>
                      <td className="py-2 text-right font-mono font-semibold text-slate-800">
                        {typeof rate === 'number' ? `${(rate * 100).toFixed(1)}%` : rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

      {/* Proxy Variables */}
      {metrics?.proxy_variables && metrics.proxy_variables.length > 0 && (
        <CollapsibleSection
          title="Proxy Variables Detected"
          icon={<span className="">⚠</span>}
          containerClass="bg-amber-50 border border-amber-200 rounded-xl"
          headerClass="text-amber-800"
          bodyClass="p-5 border-t border-amber-200"
        >
          <div className="flex flex-wrap gap-2">
            {metrics.proxy_variables.map((v) => (
              <span key={v} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {v}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Skewed Columns */}
      {metrics?.skewed_columns && metrics.skewed_columns.length > 0 && (
        <CollapsibleSection
          title="Skewed Columns"
          icon={<span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
        >
          <div className="flex flex-wrap gap-2">
            {metrics.skewed_columns.map((col) => (
              <span key={col} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                {col}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

// ---- IMAGE VIEW ----
const ImageInsightCard = ({ metrics, findings }) => {
  return (
    <div className="space-y-4">
      {/* Demographic Breakdown */}
      {metrics?.demographic_breakdown && Object.keys(metrics.demographic_breakdown).length > 0 && (
        <CollapsibleSection
          title="Demographic Breakdown"
          icon={<span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
        >
            <div className="space-y-2">
              {Object.entries(metrics.demographic_breakdown).map(([category, value]) => (
                <div key={category} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600 capitalize">{category}</span>
                  <span className="text-sm font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
        </CollapsibleSection>
        )}

      {/* Diversity Score */}
      {metrics?.diversity_score !== undefined && (
        <CollapsibleSection
          title="Diversity Score"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${metrics.diversity_score}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-slate-800">{metrics.diversity_score}%</span>
          </div>
        </CollapsibleSection>
      )}

      {/* Representation Gaps */}
      {metrics?.representation_gaps && metrics.representation_gaps.length > 0 && (
        <CollapsibleSection
          title="Representation Gaps"
          icon={<span className="">🔴</span>}
          containerClass="bg-red-50 border border-red-200 rounded-xl"
          headerClass="text-red-800"
          bodyClass="p-5 border-t border-red-200"
        >
            <ul className="space-y-1.5">
              {metrics.representation_gaps.map((gap, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  {gap}
                </li>
              ))}
            </ul>
        </CollapsibleSection>
      )}
    </div>
  );
};

// ---- MAIN COMPONENT ----
const InsightCards = ({ analysis }) => {
  if (!analysis) return null;

  const { file_type, detailed_findings, metrics, summary, recommendations } = analysis;

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <CollapsibleSection
          title="Analysis Summary"
          defaultOpen={true}
          containerClass="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl"
          headerClass="text-slate-700"
          bodyClass="p-5 border-t border-slate-200"
        >
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
        </CollapsibleSection>
      )}

      {/* Type-specific view */}
      {file_type === 'image' ? (
        <ImageInsightCard metrics={metrics} findings={detailed_findings} />
      ) : (
        <DataInsightCard metrics={metrics} findings={detailed_findings} />
      )}

      {/* Detailed Findings */}
      {detailed_findings && detailed_findings.length > 0 && (
        <CollapsibleSection
          title="Detailed Findings"
        >
          <div className="space-y-3">
            {detailed_findings.map((finding, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  severityColor[finding.severity] || 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {severityIcon[finding.severity] || '•'} {finding.category}
                  </span>
                  <span className="text-xs uppercase font-bold opacity-70">
                    {finding.severity}
                  </span>
                </div>
                <p className="text-sm opacity-90">{finding.description}</p>
                {finding.affected_groups && finding.affected_groups.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {finding.affected_groups.map((g) => (
                        <span key={g} className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <CollapsibleSection
          title="Recommendations"
          icon={<span className="">💡</span>}
          containerClass="bg-blue-50 border border-blue-200 rounded-xl"
          headerClass="text-blue-800"
          bodyClass="p-5 border-t border-blue-200"
        >
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-700 flex items-start">
                <span className="mr-2 mt-0.5 font-bold">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default InsightCards;
