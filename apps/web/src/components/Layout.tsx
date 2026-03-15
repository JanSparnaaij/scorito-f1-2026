import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Layout() {
  const navigate = useNavigate();

  const handleSyncDrivers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/drivers/sync`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Sync complete!');
      navigate(0);
    } catch {
      alert('Sync failed. Check that the API server is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top nav */}
      <header className="bg-f1-dark border-b border-f1-red/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-f1-red font-extrabold text-2xl tracking-tight">F1</span>
            <span className="font-bold text-white">2026</span>
            <span className="text-gray-400 text-sm ml-1">Scorito Helper</span>
          </Link>
          <nav className="flex gap-6 flex-1">
            <NavLink
              to="/drivers"
              className={({ isActive }) =>
                `font-semibold transition-colors ${isActive ? 'text-f1-red' : 'text-gray-300 hover:text-white'}`
              }
            >
              Drivers
            </NavLink>
            <NavLink
              to="/races"
              className={({ isActive }) =>
                `font-semibold transition-colors ${isActive ? 'text-f1-red' : 'text-gray-300 hover:text-white'}`
              }
            >
              Races
            </NavLink>
            <NavLink
              to="/team-builder"
              className={({ isActive }) =>
                `font-semibold transition-colors ${isActive ? 'text-f1-red' : 'text-gray-300 hover:text-white'}`
              }
            >
              Team Builder
            </NavLink>
          </nav>
          <button
            onClick={handleSyncDrivers}
            className="text-sm bg-f1-red hover:bg-red-700 text-white px-3 py-1.5 rounded font-semibold transition"
          >
            ↻ Sync Drivers
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
