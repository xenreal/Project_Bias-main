import React, { useState, useEffect, useRef } from 'react';
import FileUploader from './FileUploader';
import ScanningLoader from './ScanningLoader';
import ResultDashboard from './ResultDashboard';
import { analyzeBias } from '../services/geminiService';
import { generateReport } from '../utils/reportGenerator';
import Logo1 from '../assets/heurika-logo (3).svg';
import Logo2 from '../assets/heurika-logo (2).svg';

// -------------------------------------------------------------------
// PageContent: shared layout for normal + magnified layers (landing)
// -------------------------------------------------------------------
const PageContent = ({
  isMagnified,
  onTextHover,
  userContext,
  onContextChange,
  onFileProcessed,
  onAnalyze,
  fileData,
  analysisDisabled,
  isDarkMode,
  toggleTheme,
}) => (
  <div
    className={`w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${
      isMagnified ? 'pointer-events-none' : ''
    }`}
  >
    <nav className="flex w-full items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center space-x-6">
        <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          Product
        </button>
        <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          Contact Us
        </button>
        <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          About Us
        </button>
      </div>
      <div onClick={toggleTheme} className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <img src={isDarkMode ? Logo2 : Logo1} alt="Heurika Logo" className="h-14 w-auto object-contain" />
      </div>
    </nav>

    <main className="flex-1 flex flex-col items-center justify-center min-h-[85vh] pt-12 pb-24 px-4">
      {/* Hero text */}
      <div
        className="flex flex-col items-center"
        onMouseEnter={() => onTextHover?.(true)}
        onMouseLeave={() => onTextHover?.(false)}
      >
        <div className="mb-6 w-full text-center cursor-default">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-tight mb-2">
            Don't guess if <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              your AI is fair.
            </span>
          </h1>
          <p className="w-full text-lg md:text-xl text-slate-500 dark:text-slate-400 cursor-default mb-6 whitespace-nowrap hidden md:block">
            Prove it with automated bias auditing and one-click regulatory
            compliance.
          </p>
          <p className="w-full text-lg text-slate-500 dark:text-slate-400 cursor-default mb-6 block md:hidden">
            Prove it with automated bias auditing and one-click regulatory
            compliance.
          </p>
        </div>
      </div>

      {/* Context input */}
      <div className="w-full max-w-xl mx-auto z-10 mb-6">
          <input
            type="text"
            value={userContext}
            onChange={(e) => onContextChange?.(e.target.value)}
            placeholder="Give detailed description on what type of AI do you want to train."
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg text-slate-700 dark:text-slate-200 shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
          />
      </div>

      {/* File uploader */}
      <FileUploader
        onFileProcessed={onFileProcessed}
        disabled={analysisDisabled}
      />

      {/* Analyze button */}
      {fileData && (
        <div className="w-full max-w-xl mx-auto z-10 mt-5">
          <button
            onClick={onAnalyze}
            disabled={analysisDisabled}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            🔍 Analyze for Bias
          </button>
        </div>
      )}
    </main>
  </div>
);

// -------------------------------------------------------------------
// Home: main component with magnifier effect + analysis flow
// -------------------------------------------------------------------
const Home = () => {
  // Magnifier state
  const [renderState, setRenderState] = useState({ x: -1000, y: -1000, radius: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const radiusRef = useRef(0);
  const targetRadiusRef = useRef(0);
  const requestRef = useRef();

  // Analysis flow state
  const [userContext, setUserContext] = useState('');
  const [fileData, setFileData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [appState, setAppState] = useState('idle'); // idle | scanning | results
  const [error, setError] = useState(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Magnifier: track mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.pageX, y: e.pageY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnifier: animation loop
  useEffect(() => {
    const update = () => {
      radiusRef.current +=
        (targetRadiusRef.current - radiusRef.current) * 0.05;
      if (radiusRef.current < 0.1 && targetRadiusRef.current === 0) {
        radiusRef.current = 0;
      }
      setRenderState({
        x: mouseRef.current.x,
        y: mouseRef.current.y,
        radius: radiusRef.current,
      });
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleTextHover = (isHovering) => {
    targetRadiusRef.current = isHovering ? 90 : 0;
  };

  // Analysis handlers
  const handleFileProcessed = (processed) => {
    setFileData(processed);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!fileData) return;
    setAppState('scanning');
    setError(null);
    try {
      const result = await analyzeBias(fileData, userContext);
      setAnalysisResult(result);
      setAppState('results');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check your API key.');
      setAppState('idle');
    }
  };

  const handleDownloadReport = () => {
    if (analysisResult && fileData) {
      generateReport(analysisResult, fileData);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setAnalysisResult(null);
    setAppState('idle');
    setError(null);
  };

  // Magnifier values
  const scaleFactor = 1.4;
  const { x, y, radius } = renderState;
  const clipRadius = radius / scaleFactor;
  const opacity = Math.min(1, radius / 20);

  // ---- SCANNING STATE ----
  if (appState === 'scanning') {
    return <ScanningLoader />;
  }

  // ---- RESULTS STATE ----
  if (appState === 'results' && analysisResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Simple nav for results page */}
        <nav className="flex w-full items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>
          <div onClick={toggleTheme} className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <img src={isDarkMode ? Logo2 : Logo1} alt="Heurika Logo" className="h-14 w-auto object-contain" />
          </div>
        </nav>

        <ResultDashboard
          analysis={analysisResult}
          fileData={fileData}
          onDownloadReport={handleDownloadReport}
          onReset={handleReset}
        />
      </div>
    );
  }

  // ---- LANDING / IDLE STATE ----
  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden cursor-default transition-colors">
      {/* Base Normal Layer */}
      <div className="relative w-full z-10">
        <PageContent
          isMagnified={false}
          onTextHover={handleTextHover}
          userContext={userContext}
          onContextChange={setUserContext}
          onFileProcessed={handleFileProcessed}
          onAnalyze={handleAnalyze}
          fileData={fileData}
          analysisDisabled={appState === 'scanning'}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg flex items-start space-x-3">
            <span className="text-red-500 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Analysis Error
              </p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* The Black Ring Outline overlay */}
      <div
        className="pointer-events-none absolute z-40 rounded-full border border-slate-900 bg-transparent shadow-xl"
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          left: `${x - radius}px`,
          top: `${y - radius}px`,
          opacity: opacity,
        }}
      />

      {/* Magnified Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-50 bg-white"
        style={{
          clipPath: `circle(${clipRadius}px at ${x}px ${y}px)`,
          transform: `scale(${scaleFactor})`,
          transformOrigin: `${x}px ${y}px`,
          opacity: opacity,
        }}
      >
        <PageContent
          isMagnified={true}
          userContext={userContext}
          fileData={fileData}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </div>
    </div>
  );
};

export default Home;
