import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

interface Race {
  id: string;
  slug: string;
  name: string;
  circuit?: string;
  country?: string;
  scheduledAt: string;
  status: 'upcoming' | 'completed';
}

export default function Races() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/races`)
      .then((r) => r.json())
      .then((data: Race[]) => setRaces(data))
      .catch(() => setRaces([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncRaces = async () => {
    try {
      const res = await fetch(`${API_URL}/api/races/sync`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Sync complete!');
      navigate(0);
    } catch {
      alert('Sync failed.');
    }
  };

  const upcoming = races.filter((r) => r.status === 'upcoming');
  const completed = races.filter((r) => r.status === 'completed');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          F1 <span className="text-f1-red">2026</span> Calendar
        </h1>
        <button
          onClick={handleSyncRaces}
          className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded font-semibold transition"
        >
          ↻ Sync from OpenF1
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading…</div>
      ) : races.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No races found. Click "↻ Sync from OpenF1" or check that the database is seeded.
        </div>
      ) : (
        <div className="space-y-10">
          {completed.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
                Completed
              </h2>
              <RaceList races={completed} />
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
                Upcoming
              </h2>
              <RaceList races={upcoming} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RaceList({ races }: { races: Race[] }) {
  return (
    <div className="grid gap-3">
      {races.map((race, i) => (
        <div
          key={race.id}
          className="bg-gray-800 rounded-lg px-5 py-4 flex items-center gap-4 hover:bg-gray-700 transition group"
        >
          <span className="text-2xl font-black text-gray-600 w-8 shrink-0 text-center">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white group-hover:text-f1-red transition">
              {race.name}
            </div>
            <div className="text-sm text-gray-400 truncate">
              {race.circuit && <span>{race.circuit}</span>}
              {race.circuit && race.country && <span className="mx-1">·</span>}
              {race.country && <span>{race.country}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-semibold text-gray-300">
              {new Date(race.scheduledAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(race.scheduledAt).getFullYear()}
            </div>
          </div>
          <Link
            to={`/races/${race.slug}`}
            className={`ml-2 text-sm font-semibold shrink-0 ${
              race.status === 'completed'
                ? 'text-f1-red hover:text-red-400'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            {race.status === 'completed' ? 'Results →' : 'Preview →'}
          </Link>
        </div>
      ))}
    </div>
  );
}
