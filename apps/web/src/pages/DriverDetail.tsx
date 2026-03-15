import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { SCORING_CONFIG } from 'core';

interface RaceResult {
  id: string;
  position?: number;
  dnf: boolean;
  dnfReason?: string;
  gridPosition?: number;
  points: number;
  fastestLap: boolean;
  driverOfDay: boolean;
  race: {
    id: string;
    name: string;
    slug: string;
    scheduledAt: string;
    country?: string;
  };
}

interface Driver {
  id: string;
  name: string;
  abbreviation?: string;
  number?: number;
  nationality?: string;
  headshot?: string;
  team?: {
    id: string;
    name: string;
    shortName?: string;
    color?: string;
  };
  prices: Array<{ id: string; amountEUR: number; source: string }>;
  raceResults: RaceResult[];
  totalPoints: number;
}

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/drivers/${id}`)
      .then((r) => r.json())
      .then(setDriver)
      .catch(() => setDriver(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (eur: number) =>
    eur >= 1_000_000 ? `€${(eur / 1_000_000).toFixed(1)}M` : `€${(eur / 1_000).toFixed(0)}K`;

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>;
  }

  if (!driver) {
    return (
      <div className="text-center py-16 text-gray-500">
        Driver not found.{' '}
        <Link to="/drivers" className="text-f1-red hover:underline">
          ← Back to Drivers
        </Link>
      </div>
    );
  }

  const teamColor = driver.team?.color ?? '#888';
  const price = driver.prices[0]?.amountEUR;

  return (
    <div>
      <Link to="/drivers" className="text-f1-red hover:text-red-400 text-sm mb-6 inline-block">
        ← Back to Drivers
      </Link>

      {/* Header card */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        {driver.headshot && (
          <img
            src={driver.headshot}
            alt={driver.name}
            className="w-24 h-24 rounded-full object-cover bg-gray-600 border-4"
            style={{ borderColor: teamColor }}
          />
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
            {driver.number && (
              <span className="text-3xl font-black font-mono" style={{ color: teamColor }}>
                #{driver.number}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-white">{driver.name}</h1>
          </div>
          {driver.team && (
            <div className="text-lg font-semibold" style={{ color: teamColor }}>
              {driver.team.name}
            </div>
          )}
          {driver.nationality && (
            <div className="text-sm text-gray-400 mt-1">{driver.nationality}</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          {price != null && (
            <div className="bg-green-900/40 text-green-400 px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-green-600 uppercase tracking-wide">Scorito Price</div>
              <div className="text-2xl font-black">{formatPrice(price)}</div>
            </div>
          )}
          <div className="bg-yellow-900/40 text-yellow-400 px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-yellow-600 uppercase tracking-wide">Total Points</div>
            <div className="text-2xl font-black">{driver.totalPoints}</div>
          </div>
        </div>
      </div>

      {/* Scoring reference */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Scoring Reference
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SCORING_CONFIG.racePoints).map(([pos, pts]) => (
            <span key={pos} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
              P{pos}: <strong className="text-white">{pts}</strong>
            </span>
          ))}
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
            Pole: <strong className="text-white">+{SCORING_CONFIG.poleBonus}</strong>
          </span>
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
            FL: <strong className="text-white">+{SCORING_CONFIG.fastestLapBonus}</strong>
          </span>
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
            DOTD: <strong className="text-white">+{SCORING_CONFIG.driverOfDayBonus}</strong>
          </span>
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
            DNF: <strong className="text-red-400">{SCORING_CONFIG.dnfPenalty}</strong>
          </span>
        </div>
      </div>

      {/* Race results */}
      <h2 className="text-xl font-bold text-white mb-4">Race Results</h2>
      {driver.raceResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-800 rounded-lg">
          No race results yet.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-f1-dark text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Race</th>
                <th className="px-4 py-3 text-center">Grid</th>
                <th className="px-4 py-3 text-center">Finish</th>
                <th className="px-4 py-3 text-center">Extras</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {driver.raceResults.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700 transition">
                  <td className="px-4 py-3">
                    <Link
                      to={`/races/${r.race.slug}`}
                      className="text-white hover:text-f1-red font-semibold"
                    >
                      {r.race.name}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {new Date(r.race.scheduledAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {r.gridPosition != null ? `P${r.gridPosition}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.dnf ? (
                      <span className="text-red-400 font-bold">DNF</span>
                    ) : r.position != null ? (
                      <span
                        className={`font-bold ${
                          r.position <= 3 ? 'text-yellow-400' : 'text-white'
                        }`}
                      >
                        P{r.position}
                      </span>
                    ) : (
                      '—'
                    )}
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
                      className={`font-bold text-base ${
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
