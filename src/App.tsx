import { HashRouter, Route, Routes, useOutletContext } from 'react-router-dom';
import { EntitlementProvider } from './context/EntitlementContext';
import { Layout } from './components/Layout';
import { PremiumGate } from './components/PremiumGate';
import { TOOLS } from './tools/registry';
import { HomePage, SettingsPage } from './pages/SystemPages';

function HomeRoute() {
  const { query } = useOutletContext<{ query: string }>();
  return <HomePage query={query} />;
}

export default function App() {
  return (
    <EntitlementProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomeRoute />} />
            {TOOLS.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path.slice(1)}
                element={
                  tool.premium ? (
                    <PremiumGate feature={tool.name}>
                      <tool.component />
                    </PremiumGate>
                  ) : (
                    <tool.component />
                  )
                }
              />
            ))}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<HomeRoute />} />
          </Route>
        </Routes>
      </HashRouter>
    </EntitlementProvider>
  );
}
