export function WalletHealth() {
  return (
    <article className="panel health-panel">
      <p className="eyebrow">Wallet health</p>
      <h2>Ready for today</h2>
      <strong>2895.00</strong>
      <p>Main wallet has enough balance for current service flow. API wallet needs a refill.</p>
      <button className="primary-button">Recharge API wallet</button>
    </article>
  );
}
