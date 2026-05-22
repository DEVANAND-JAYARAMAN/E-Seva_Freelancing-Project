import { Plus, Search } from "lucide-react";

export function CommandBar() {
  return (
    <section className="command-bar">
      <label className="search-box">
        <Search size={20} />
        <input aria-label="Search" placeholder="Search services, users, payments" />
      </label>

      <div className="command-actions">
        <button className="soft-button">
          <Plus size={17} />
          Add Money
        </button>
        <button className="primary-button">
          <Plus size={17} />
          Add Payment
        </button>
      </div>
    </section>
  );
}
