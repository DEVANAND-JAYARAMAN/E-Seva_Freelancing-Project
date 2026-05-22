export function ActivityChart() {
  const points =
    "0,66 22,50 44,56 66,32 88,40 110,18 132,34 154,24 176,42 198,30 220,14";
  const areaPath =
    "M 0,66 L 22,50 L 44,56 L 66,32 L 88,40 L 110,18 L 132,34 L 154,24 L 176,42 L 198,30 L 220,14 L 220,80 L 0,80 Z";

  return (
    <svg
      className="w-full h-full overflow-visible"
      viewBox="0 0 220 80"
      aria-hidden="true"
    >
      <defs>
        {/* Glowing Gradient for Chart Area */}
        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
        {/* Soft Drop Shadow Filter for Line */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2.5"
            floodColor="#005c3a"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* Area Shading Under Graph */}
      <path
        d={areaPath}
        fill="url(#chartGlow)"
        className="transition-all duration-500"
      />

      {/* Glowing Polyline Graph */}
      <polyline
        points={points}
        className="fill-none stroke-[#005c3a] dark:stroke-emerald-500 stroke-[3] stroke-round stroke-join-round transition-all duration-300"
        filter="url(#glow)"
        style={{
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />

      {/* Halo Node Points */}
      {[66, 50, 56, 32, 40, 18, 34, 24, 42, 30, 14].map((y, index) => (
        <g key={index} className="group/node cursor-pointer">
          {/* External Hover Halo ring */}
          <circle
            cx={index * 22}
            cy={y}
            r="6"
            className="fill-emerald-500/20 dark:fill-emerald-400/20 opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
          />
          {/* Primary Node Ring */}
          <circle
            cx={index * 22}
            cy={y}
            r="3.5"
            className="fill-white stroke-[#005c3a] dark:stroke-emerald-400 stroke-[2] shadow-sm transition-transform duration-200 group-hover/node:scale-125"
          />
        </g>
      ))}
    </svg>
  );
}
