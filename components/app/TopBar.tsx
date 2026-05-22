import { Bell, Menu, Moon, Sparkles } from "lucide-react";
import { navItems } from "./data";

type TopBarProps = {
  activePage: string;
};

export function TopBar({ activePage }: TopBarProps) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Thuruvan home">
        <span className="brand-mark">
          <Sparkles size={21} />
        </span>
        <span>Thuruvan</span>
      </a>

      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === activePage;

          return (
            <a className={`nav-link ${isActive ? "active" : ""}`} href={item.href} key={item.label}>
              <Icon size={17} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="top-actions">
        <button className="icon-button mobile-menu" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <button className="icon-button" aria-label="Toggle theme">
          <Moon size={19} />
        </button>
        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={19} />
        </button>
        <div className="profile" aria-label="Signed in as Thuruvan">
          <span>T</span>
          <strong>Thuruvan</strong>
        </div>
      </div>
    </header>
  );
}
