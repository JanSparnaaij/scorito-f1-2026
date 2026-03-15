import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

interface RaceResult {
  id: string;
  position?: number;
  dnf: boolean;
  gridPosition?: number;
  points: number;
  fastestLap: boolean;
  driverOfDay: boolean;
  driver: {
    id: string;
    name: string;
    abbreviation?: string;
    number?: number;
    team?: { name: string; shortName?: string; color?: string };
  };
}

interface Race {
  id: string;
  slug: string;
  name: string;
  circuit?: string;
  country?: string;
  scheduledAt: string;
  status: 'upcoming' | 'completed';
  raceResults: RaceResult[];
}

export default function RaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/races/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setRace(null);
        else setRace(data);
      })
      .catch(() => setRace(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSyncResults = async () => {
    if (!slug) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/results/sync/${slug}`, {
        method: 'POST',
      });
      const data = await res.json();
      alert(data.message || data.error || 'Done');
      navigate(0);
    } catch {
      alert('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>;
  }

  if (!race) {
    return (
      <div className="text-center py-16 text-gray-500">
        Race not found.{' '}
        <Link to="/races" className="text-f1-red hover:underline">
          ← Back to Races
        </Link>
      </div>
    );
  }

  const sorted = [...race.raceResults].sort(
    (a, b) =>
      (a.dnf ? 99 : a.position ?? 98) - (b.dnf ? 99 : b.position ?? 98)
  );

  return (
    <div>
      <Link to="/races" className="text-f1-red hover:text-red-400 text-sm mb-4 inline-block">
        ← Back to Races
      </Link>

      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{race.name}</h1>
            <div className="text-gray-400 text-sm mt-1">
              {race.circuit && <span>{race.circuit}</span>}
              {race.circuit && race.country && <span className="mx-1">·</span>}
              {race.country && <span>{race.country}</span>}
              <span className="mx-2">·</span>
              {new Date(race.scheduledAt).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                race.status === 'completed'
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-yellow-900/40 text-yellow-400'
              }`}
            >
              {race.status}
            </span>
            <button
              onClick={handleSyncResults}
              disabled={syncing}
              className="text-sm bg-f1-red hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded font-semibold transition"
            >
              {syncing ? 'Syncing…' : '↻ Sync Results'}
            </button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg">
          No results yet. Click "↻ Sync Results" to load from OpenF1.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-f1-dark text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">Pos</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-center">Grid</th>
                <th className="px-4 py-3 text-center">Extras</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sorted.map((r) => {
                const tc = r.driver.team?.color ?? '#888';
                return (
                  <tr key={r.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-center font-bold">
                      {r.dnf ? (
                        <span className="text-red-400">DNF</span>
                      ) : r.position != null ? (
                        <span
                          className={
                            r.position <= 3
                              ? 'text-yellow-400'
                              : r.position <= 10
                              ? 'text-white'
                              : 'text-gray-400'
                          }
                        >
                          {r.position}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/drivers/${r.driver.id}`}
                        className="font-semibold text-white hover:text-f1-red"
                      >
                        {r.driver.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: tc }}>
                        {r.driver.team?.shortName ?? r.driver.team?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">
                      {r.gridPosition != null ? `P${r.gridPosition}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {r.fastestLap && (
                          <span className="bg-purple-900/50 text-purple-400 text-xs px-1.5 py-0.5 rounded">
                            FL
                          </span>
                        )}
                        {r.driverOfDay && (
                          <span className="bg-blue-900/50 text-blue-400 text-xs px-1.5 py-0.5 rounded">
                            DOTD
                          </span>
                        )}
                        {r.gridPosition === 1 && (
                          <span className="bg-yellow-900/50 text-yellow-400 text-xs px-1.5 py-0.5 rounded">
                            POLE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${
                          r.points > 0
                            ? 'text-yellow-400'
                            : r.points < 0
                            ? 'text-red-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {r.points > 0 ? `+${r.points}` : r.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
