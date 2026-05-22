import { stats } from "../data";

export function StatsGrid() {
  return (
    <section className="stats-grid" aria-label="Dashboard metrics">
      {stats.map((stat) => (
        <article className={`stat-card ${stat.tone}`} key={stat.label}>
          <p>{stat.label}</p>
          <div>
            <strong>{stat.value}</strong>
            <span>{stat.change}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
