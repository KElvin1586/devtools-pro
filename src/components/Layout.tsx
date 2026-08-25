import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../tools/registry';
import { useEntitlement } from '../context/EntitlementContext';
import { UpgradeModal } from './UpgradeModal';
import { getFavorites } from '../lib/favorites';

export function Layout() {
  const { premium, plan, requestUpgrade } = useEntitlement();
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
    setFavorites(getFavorites());
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('');
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  const favoriteTools = premium ? TOOLS.filter((t) => favorites.includes(t.id)) : [];

  const sidebar = (
    <nav aria-label="Tools" className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-4 py-4 text-lg font-bold text-white">
        <span aria-hidden="true" className="text-2xl">🛠️</span>
        DevTools <span className="text-accent-500">Pro</span>
      </Link>

      <div className="px-4 pb-3">
        <label htmlFor="tool-search" className="sr-only">Search tools</label>
        <input
          id="tool-search"
          ref={searchRef}
          className="field"
          placeholder="Search tools…  ( / )"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredTools.length > 0) {
              navigate(filteredTools[0].path);
            }
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {favoriteTools.length > 0 && (
          <section className="mb-3">
            <h2 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">⭐ Favorites</h2>
            <ToolList tools={favoriteTools} premiumActive={premium} onLocked={requestUpgrade} />
          </section>
        )}
        {CATEGORIES.map((category) => {
          const tools = filteredTools.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <section key={category} className="mb-3">
              <h2 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{category}</h2>
              <ToolList tools={tools} premiumActive={premium} onLocked={requestUpgrade} />
            </section>
          );
        })}
        {filteredTools.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No tools match.</p>}
      </div>

      <footer className="border-t border-surface-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className={`rounded px-2 py-0.5 text-xs font-bold ${premium ? 'bg-amber-500/20 text-amber-400' : 'bg-surface-600 text-gray-300'}`}>
            {plan === 'premium' ? '✨ PREMIUM' : 'FREE'}
          </span>
          <NavLink to="/settings" className={({ isActive }) => `btn-ghost btn text-xs ${isActive ? 'text-accent-500' : ''}`}>
            ⚙ Settings
          </NavLink>
        </div>
        {!premium && (
          <button className="btn btn-primary mt-2 w-full justify-center text-xs" onClick={() => requestUpgrade()}>
            Upgrade to Premium
          </button>
        )}
      </footer>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-surface-600 bg-surface-800 px-4 py-2 lg:hidden">
        <Link to="/" className="font-bold text-white">🛠️ DevTools <span className="text-accent-500">Pro</span></Link>
        <button className="btn" onClick={() => setSidebarOpen((v) => !v)} aria-expanded={sidebarOpen} aria-label="Toggle navigation">
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-surface-600 bg-surface-800 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Main content */}
      <main className="min-w-0 flex-1 px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-8">
        <Outlet context={{ query }} />
      </main>

      <UpgradeModal />
    </div>
  );
}

function ToolList({
  tools,
  premiumActive,
  onLocked,
}: {
  tools: typeof TOOLS;
  premiumActive: boolean;
  onLocked: (feature: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {tools.map((tool) => {
        const locked = tool.premium && !premiumActive;
        return (
          <li key={tool.id}>
            {locked ? (
              <button
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-400 hover:bg-surface-700 hover:text-gray-200"
                onClick={() => onLocked(tool.name)}
                aria-label={`${tool.name} — Premium feature. Click to upgrade.`}
              >
                <span className="truncate">{tool.name}</span>
                <span className="shrink-0 text-[10px] font-bold text-amber-400">🔒 PREMIUM</span>
              </button>
            ) : (
              <NavLink
                to={tool.path}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${
                    isActive ? 'bg-accent-600/20 text-accent-500' : 'text-gray-300 hover:bg-surface-700'
                  }`
                }
              >
                <span className="truncate">{tool.name}</span>
                {tool.premium && <span className="shrink-0 text-[10px] font-bold text-amber-400">✨</span>}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}
