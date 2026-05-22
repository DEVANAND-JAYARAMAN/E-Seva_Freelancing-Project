import { walletCards } from "../data";

export function WalletSummary() {
  return (
    <section className="wallet-grid" aria-label="Wallet summary">
      {walletCards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="wallet-card" key={card.label}>
            <span className="wallet-icon">
              <Icon size={22} />
            </span>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
