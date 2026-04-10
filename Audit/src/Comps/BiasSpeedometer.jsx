import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// Color interpolation: green → amber → red
function getScoreColor(score) {
  if (score <= 30) return '#22c55e'; // green
  if (score <= 60) return '#f59e0b'; // amber
  if (score <= 80) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreLabel(score) {
  if (score <= 15) return 'Excellent';
  if (score <= 30) return 'Low Bias';
  if (score <= 50) return 'Moderate';
  if (score <= 70) return 'Concerning';
  if (score <= 85) return 'High Bias';
  return 'Critical';
}

const BiasSpeedometer = ({ score = 0, biasType = 'Unknown' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1500; // ms
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.min(100, score));

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const color = getScoreColor(animatedScore);
  const label = getScoreLabel(animatedScore);

  // Build semi-circle gauge data
  const filled = animatedScore;
  const empty = 100 - animatedScore;

  const data = [
    { name: 'bias', value: filled },
    { name: 'remaining', value: empty },
  ];

  // Gradient stops for the arc
  const COLORS = [color, '#f1f5f9'];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-36">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
          <span
            className="text-4xl font-black tabular-nums"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-lg font-bold text-slate-400">%</span>
        </div>
      </div>

      {/* Labels below */}
      <div className="text-center mt-2 space-y-1">
        <p
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </p>
        <p className="text-xs text-slate-500">
          Primary: <span className="font-medium text-slate-700">{biasType}</span>
        </p>
      </div>
    </div>
  );
};

export default BiasSpeedometer;
