export function ActivityChart() {
  const points = "0,66 22,50 44,56 66,32 88,40 110,18 132,34 154,24 176,42 198,30 220,14";

  return (
    <svg className="activity-chart" viewBox="0 0 220 80" aria-hidden="true">
      <polyline points={points} />
      {[66, 50, 56, 32, 40, 18, 34, 24, 42, 30, 14].map((y, index) => (
        <circle key={index} cx={index * 22} cy={y} r="3.5" />
      ))}
    </svg>
  );
}
