import React from 'react';

const ScanningLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated scanner rings */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-30"></div>
          <div
            className="absolute inset-3 rounded-full border-4 border-purple-300 animate-ping opacity-40"
            style={{ animationDelay: '0.3s' }}
          ></div>
          <div
            className="absolute inset-6 rounded-full border-4 border-pink-300 animate-ping opacity-50"
            style={{ animationDelay: '0.6s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-pulse flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">
            Scanning for Bias…
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Our AI is analyzing your dataset for potential biases, proxy
            variables, and representation gaps.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-scanning-bar"
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes scanning-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-scanning-bar {
          animation: scanning-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanningLoader;
