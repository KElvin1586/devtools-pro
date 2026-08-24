import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../tools/registry';
import type { ToolDefinition } from '../tools/registry';
import { useEntitlement } from '../context/EntitlementContext';
import { getHistory, clearHistory, type HistoryEntry } from '../lib/history';
import { getFavorites, toggleFavorite } from '../lib/favorites';
import { loadPricing, savePremiumPricing } from '../config/pricing';

// ---------------- Home / Dashboard ----------------
export function HomePage({ query }: { query: string }) {
  const { premium } = useEntitlement();
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }, [query]);
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">DevTools Pro</h1>
        <p className="mt-1 text-gray-400">
          {TOOLS.length} offline-first developer tools. Everything runs in your browser — nothing leaves your machine.
        </p>
      </header>
      {CATEGORIES.map((category) => {
        const tools = filtered.filter((t) => t.category === category);
        if (tools.length === 0) return null;
        return (
          <section key={category} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} premiumActive={premium} />
              ))}
            </div>
          </section>
        );
      })}
      {filtered.length === 0 && (
        <p className="panel p-6 text-center text-gray-400">No tools match “{query}”. Try “json”, “hash”, or “color”.</p>
      )}
    </div>
  );
}

function ToolCard({ tool, premiumActive }: { tool: ToolDefinition; premiumActive: boolean }) {
  return (
    <Link
      to={tool.path}
      className="panel group relative block p-4 transition-colors hover:border-accent-500"
      aria-label={tool.premium && !premiumActive ? `${tool.name} — Premium tool` : tool.name}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white group-hover:text-accent-500">{tool.name}</h3>
        {tool.premium && !premiumActive && (
          <span className="shrink-0 rounded border border-amber-500/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            🔒 PREMIUM
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-400">{tool.description}</p>
    </Link>
  );
}

// ---------------- History (PREMIUM) ----------------
export function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());
  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-sm text-gray-400">Your last {entries.length} tool runs (stored locally only).</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            clearHistory();
            setEntries([]);
          }}
        >
          Clear history
        </button>
      </header>
      {entries.length === 0 ? (
        <p className="panel p-6 text-center text-gray-400">No history yet. Run any tool and it will show up here.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="panel flex items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-200">
                  {e.toolName} <span className="text-gray-500">· {e.action}</span>
                </p>
                <p className="truncate font-mono text-xs text-gray-400">{e.preview}</p>
              </div>
              <time className="shrink-0 text-xs text-gray-500">{new Date(e.timestamp).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------- Settings (FREE) ----------------
export function SettingsPage() {
  const { plan, premium, activatePremium, downgrade } = useEntitlement();
  const pricing = loadPricing();
  const [price, setPrice] = useState(String(pricing.premium.priceUsd ?? 9.99));
  const [upgradeUrl, setUpgradeUrl] = useState(pricing.premium.upgradeUrl);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [saved, setSaved] = useState(false);

  const save = () => {
    const p = parseFloat(price);
    savePremiumPricing({ priceUsd: isNaN(p) ? 9.99 : p, upgradeUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <section className="panel mt-4 p-4">
        <h2 className="font-semibold text-white">Plan</h2>
        <p className="mt-1 text-sm text-gray-400">
          Current plan: <span className="font-semibold text-accent-500">{plan === 'premium' ? 'Premium' : 'Free'}</span>
        </p>
        <div className="mt-3 flex gap-2">
          {!premium ? (
            <button className="btn btn-primary" onClick={activatePremium}>Activate Premium</button>
          ) : (
            <button className="btn" onClick={downgrade}>Switch to Free</button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Premium is activated locally after purchase. There is no online activation-server;
          this manual activation is the entire “license system”.
        </p>
      </section>

      <section className="panel mt-4 p-4">
        <h2 className="font-semibold text-white">Pricing (configurable)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="label">Premium one-time price (USD)</span>
            <input className="field" value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" />
          </label>
          <label>
            <span className="label">Upgrade URL</span>
            <input className="field" value={upgradeUrl} onChange={(e) => setUpgradeUrl(e.target.value)} type="url" />
          </label>
        </div>
        <button className="btn btn-primary mt-3" onClick={save}>Save pricing</button>
        {saved && <span className="ml-2 text-sm text-green-400">✓ Saved</span>}
        <p className="mt-2 text-xs text-gray-500">Free tier is always $0. Only the Premium price and checkout URL are configurable.</p>
      </section>

      {premium && (
        <section className="panel mt-4 p-4">
          <h2 className="font-semibold text-white">Favorite tools</h2>
          <p className="mt-1 text-sm text-gray-400">Pin the tools you use most:</p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={favorites.includes(t.id)}
                  onChange={() => setFavorites(toggleFavorite(t.id))}
                  className="accent-accent-500"
                />
                {t.name}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="panel mt-4 p-4">
        <h2 className="font-semibold text-white">Privacy</h2>
        <p className="mt-1 text-sm text-gray-400">
          All processing happens in your browser. Data, history, favorites and settings live in
          <code className="mx-1 rounded bg-surface-900 px-1">localStorage</code> on this device and are never transmitted.
        </p>
      </section>
    </div>
  );
}
