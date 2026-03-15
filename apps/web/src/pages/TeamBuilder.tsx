import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { TEAM_CONFIG } from 'core';

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
  prices: Array<{ amountEUR: number }>;
  totalPoints: number;
}

export default function TeamBuilder() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/drivers`)
      .then((r) => r.json())
      .then((data: Driver[]) =>
        setDrivers(
          [...data].sort(
            (a, b) => (b.prices[0]?.amountEUR ?? 0) - (a.prices[0]?.amountEUR ?? 0)
          )
        )
      )
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, []);

  const getPrice = (d: Driver) => d.prices[0]?.amountEUR ?? 0;

  const formatPrice = (eur: number) =>
    eur >= 1_000_000 ? `€${(eur / 1_000_000).toFixed(1)}M` : `€${(eur / 1_000).toFixed(0)}K`;

  const selectedDrivers = drivers.filter((d) => selectedDriverIds.includes(d.id));
  const totalSpent = selectedDrivers.reduce((s, d) => s + getPrice(d), 0);
  const remainingBudget = TEAM_CONFIG.budget - totalSpent;
  const totalPoints = selectedDrivers.reduce((s, d) => s + d.totalPoints, 0);
  const budgetPct = (totalSpent / TEAM_CONFIG.budget) * 100;

  const teamCounts = selectedDrivers.reduce<Record<string, number>>((acc, d) => {
    const t = d.team?.name ?? '__no_team__';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  const canAdd = (d: Driver): { ok: boolean; reason?: string } => {
    if (selectedDriverIds.includes(d.id)) return { ok: false, reason: 'Already selected' };
    if (selectedDriverIds.length >= TEAM_CONFIG.maxDrivers)
      return { ok: false, reason: `Max ${TEAM_CONFIG.maxDrivers} drivers` };
    if (getPrice(d) > remainingBudget)
      return { ok: false, reason: 'Over budget' };
    const teamCount = teamCounts[d.team?.name ?? '__no_team__'] ?? 0;
    if (teamCount >= TEAM_CONFIG.maxDriversPerTeam)
      return { ok: false, reason: `Max ${TEAM_CONFIG.maxDriversPerTeam} per team` };
    return { ok: true };
  };

  const toggleDriver = (d: Driver) => {
    if (selectedDriverIds.includes(d.id)) {
      setSelectedDriverIds((ids) => ids.filter((id) => id !== d.id));
    } else {
      const { ok } = canAdd(d);
      if (ok) {
        setSelectedDriverIds((ids) => [...ids, d.id]);
      }
    }
  };

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.team?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white mb-2">
        Team <span className="text-f1-red">Builder</span>
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        Select up to {TEAM_CONFIG.maxDrivers} drivers within a budget of{' '}
        <strong className="text-white">€{(TEAM_CONFIG.budget / 1_000_000).toFixed(0)}M</strong>.
        Max {TEAM_CONFIG.maxDriversPerTeam} drivers from the same constructor.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: driver picker */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Search drivers or teams…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-red"
          />

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((d) => {
                const selected = selectedDriverIds.includes(d.id);
                const { ok, reason } = canAdd(d);
                const price = getPrice(d);
                const tc = d.team?.color ?? '#888';

                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDriver(d)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition border ${
                      selected
                        ? 'bg-f1-red/10 border-f1-red'
                        : ok
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
                        : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                    title={!ok && !selected ? reason : undefined}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        selected ? 'border-f1-red bg-f1-red' : 'border-gray-600'
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {d.headshot && (
                      <img
                        src={d.headshot}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover bg-gray-600 shrink-0"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{d.name}</div>
                      <div className="text-xs" style={{ color: tc }}>
                        {d.team?.shortName ?? d.team?.name ?? '—'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {price > 0 ? (
                        <div className="text-sm font-bold text-green-400">{formatPrice(price)}</div>
                      ) : (
                        <div className="text-xs text-gray-500">No price</div>
                      )}
                      {d.totalPoints > 0 && (
                        <div className="text-xs text-yellow-500">{d.totalPoints} pts</div>
                      )}
                    </div>

                    {!ok && !selected && reason && (
                      <div className="text-xs text-red-400 shrink-0 max-w-[80px] text-right">
                        {reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: team summary */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-5 sticky top-4">
            <h2 className="text-lg font-bold text-white mb-4">
              My Team
              <span className="ml-2 text-sm font-normal text-gray-400">
                {selectedDriverIds.length}/{TEAM_CONFIG.maxDrivers}
              </span>
            </h2>

            {/* Budget bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Budget used</span>
                <span
                  className={
                    remainingBudget < 0 ? 'text-red-400 font-bold' : 'text-white'
                  }
                >
                  {formatPrice(totalSpent)} / {formatPrice(TEAM_CONFIG.budget)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    budgetPct > 100 ? 'bg-red-500' : budgetPct > 85 ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-right">
                Remaining:{' '}
                <span
                  className={
                    remainingBudget < 0 ? 'text-red-400 font-bold' : 'text-green-400 font-semibold'
                  }
                >
                  {formatPrice(Math.max(remainingBudget, 0))}
                </span>
              </div>
            </div>

            {/* Selected drivers */}
            {selectedDrivers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Click drivers to add them to your team.
              </p>
            ) : (
              <ul className="space-y-2 mb-5">
                {selectedDrivers.map((d) => {
                  const tc = d.team?.color ?? '#888';
                  return (
                    <li
                      key={d.id}
                      className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2"
                    >
                      <div
                        className="w-1.5 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: tc }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{d.name}</div>
                        <div className="text-xs" style={{ color: tc }}>
                          {d.team?.shortName ?? '—'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-green-400">
                          {formatPrice(getPrice(d))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDriverIds((ids) => ids.filter((id) => id !== d.id));
                        }}
                        className="text-gray-500 hover:text-red-400 transition text-lg leading-none ml-1"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Totals */}
            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total cost</span>
                <span className="font-bold text-white">{formatPrice(totalSpent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Season points</span>
                <span className="font-bold text-yellow-400">{totalPoints}</span>
              </div>
            </div>

            {selectedDriverIds.length > 0 && (
              <button
                onClick={() => setSelectedDriverIds([])}
                className="mt-4 w-full text-sm text-gray-400 hover:text-red-400 transition"
              >
                Clear selection
              </button>
            )}

            {drivers.length === 0 && !loading && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                No drivers with prices yet.{' '}
                <Link to="/drivers" className="text-f1-red hover:underline">
                  Sync drivers first
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
