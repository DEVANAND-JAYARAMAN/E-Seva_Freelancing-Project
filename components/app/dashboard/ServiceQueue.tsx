import { services } from "../data";

export function ServiceQueue() {
  return (
    <article className="panel service-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Recent work</p>
          <h2>Live service queue</h2>
        </div>
        <button className="plain-button">View all</button>
      </div>

      <div className="service-table">
        {services.map((service) => (
          <div className="service-row" key={service.name}>
            <div>
              <strong>{service.name}</strong>
              <span>{service.time}</span>
            </div>
            <b>{service.status}</b>
            <small>{service.amount}</small>
          </div>
        ))}
      </div>
    </article>
  );
}
