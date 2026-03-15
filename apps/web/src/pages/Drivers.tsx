import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { TEAM_CONFIG } from 'core';

interface Price {
  id: string;
  amountEUR: number;
  source: string;
}

interface Constructor {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
}

interface Driver {
  id: string;
  name: string;
  abbreviation?: string;
  number?: number;
  nationality?: string;
  headshot?: string;
  team?: Constructor;
  prices: Price[];
  totalPoints: number;
}

type SortKey = 'name' | 'price' | 'points' | 'number';

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterTeam, setFilterTeam] = useState<string>('');

  useEffect(() => {
    fetch(`${API_URL}/api/drivers`)
      .then((r) => r.json())
      .then((data: Driver[]) => setDrivers(data))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (eur: number) =>
    eur >= 1_000_000 ? `€${(eur / 1_000_000).toFixed(1)}M` : `€${(eur / 1_000).toFixed(0)}K`;

  const getPrice = (d: Driver) => d.prices[0]?.amountEUR ?? null;

  const teams = Array.from(new Set(drivers.map((d) => d.team?.name).filter(Boolean) as string[])).sort();

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const filtered = drivers
    .filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterTeam === '' || d.team?.name === filterTeam)
    )
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'name') diff = a.name.localeCompare(b.name);
      else if (sortBy === 'price') diff = (getPrice(a) ?? 0) - (getPrice(b) ?? 0);
      else if (sortBy === 'points') diff = a.totalPoints - b.totalPoints;
      else if (sortBy === 'number') diff = (a.number ?? 99) - (b.number ?? 99);
      return sortDir === 'asc' ? diff : -diff;
    });

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      className={`px-3 py-1 rounded text-sm font-semibold transition ${
        sortBy === k ? 'bg-f1-red text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label} {sortBy === k && (sortDir === 'asc' ? '↑' : '↓')}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-white">
          Drivers <span className="text-f1-red">2026</span>
        </h1>
        <div className="text-sm text-gray-400">
          Budget: <span className="text-white font-semibold">€{(TEAM_CONFIG.budget / 1_000_000).toFixed(0)}M</span>
          {' · '}Max <span className="text-white font-semibold">{TEAM_CONFIG.maxDrivers}</span> drivers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search drivers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-red"
        />
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-red"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <SortBtn label="Name" k="name" />
          <SortBtn label="Price" k="price" />
          <SortBtn label="Points" k="points" />
          <SortBtn label="No." k="number" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading drivers…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No drivers found.{' '}
          {drivers.length === 0 && 'Use "↻ Sync Drivers" to load data from OpenF1.'}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow">
          <table className="w-full text-sm">
            <thead className="bg-f1-dark text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-8">#</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((d) => {
                const price = getPrice(d);
                const teamColor = d.team?.color ?? '#888';
                return (
                  <tr key={d.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-gray-400 font-mono">{d.number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {d.headshot && (
                          <img
                            src={d.headshot}
                            alt={d.name}
                            className="w-8 h-8 rounded-full object-cover bg-gray-600"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                        )}
                        <div>
                          <div className="font-semibold text-white">{d.name}</div>
                          {d.abbreviation && (
                            <div className="text-xs text-gray-400">{d.abbreviation}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm"
                        style={{ color: teamColor }}
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />
                        {d.team?.shortName ?? d.team?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {price != null ? (
                        <span className="bg-green-900/40 text-green-400 px-2 py-0.5 rounded text-xs font-bold">
                          {formatPrice(price)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${
                          d.totalPoints > 0 ? 'text-yellow-400' : 'text-gray-500'
                        }`}
                      >
                        {d.totalPoints}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/drivers/${d.id}`}
                        className="text-f1-red hover:text-red-400 font-semibold text-sm"
                      >
                        View →
                      </Link>
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
