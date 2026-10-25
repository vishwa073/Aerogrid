
import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import type { EvaluationInterval } from '../../types/api';

interface IntervalTableProps {
  intervals: EvaluationInterval[];
}

type IntervalFilter = 'all' | 'shortfall' | 'surplus';

export const IntervalTable: React.FC<IntervalTableProps> = ({
  intervals,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<IntervalFilter>('all');

  const filteredIntervals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return intervals.filter((interval) => {
      const gap = interval.forecast_mw - interval.actual_mw;

      const matchesSearch =
        !query ||
        interval.start_time.toLowerCase().includes(query) ||
        new Date(interval.start_time)
          .toLocaleString('en-GB', { timeZone: 'UTC' })
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'shortfall' && gap > 0) ||
        (filter === 'surplus' && gap < 0);

      return matchesSearch && matchesFilter;
    });
  }, [intervals, search, filter]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 2,
    }).format(value);

  const formatTimestamp = (value: string) =>
    `${new Date(value).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })} UTC`;

  const exportCsv = () => {
    const headers = [
      'Delivery Time (UTC)',
      'Actual Generation (MW)',
      'Forecast Generation (MW)',
      'Forecast Error (MW)',
      'Shortfall Energy (MWh)',
    ];

    const rows = filteredIntervals.map((interval) => {
      const gap = interval.forecast_mw - interval.actual_mw;

      return [
        formatTimestamp(interval.start_time),
        interval.actual_mw,
        interval.forecast_mw,
        gap,
        Math.max(gap, 0),
      ];
    });

    const escapeCsvValue = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'aerogrid-evaluation-intervals.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-labelledby="interval-table-heading"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="interval-table-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Evaluation intervals
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and compare matched hourly forecast and actual readings.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredIntervals.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Search delivery time</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search delivery time..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-slate-600">
              Filter
            </span>
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as IntervalFilter)
              }
              className="min-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All intervals</option>
              <option value="shortfall">Forecast shortfall</option>
              <option value="surplus">Actual above forecast</option>
            </select>
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-500" aria-live="polite">
          Showing {filteredIntervals.length.toLocaleString('en-GB')} of{' '}
          {intervals.length.toLocaleString('en-GB')} intervals
        </p>
      </div>

      {filteredIntervals.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            No matching intervals
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try another search term or filter.
          </p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Delivery time (UTC)
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Actual (MW)
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Forecast (MW)
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Error (MW)
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Shortfall (MWh)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredIntervals.map((interval) => {
                const gap = interval.forecast_mw - interval.actual_mw;

                return (
                  <tr
                    key={interval.start_time}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                      {formatTimestamp(interval.start_time)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.actual_mw)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.forecast_mw)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-medium tabular-nums ${
                        gap > 0
                          ? 'text-amber-700'
                          : gap < 0
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                      }`}
                    >
                      {gap > 0 ? '+' : ''}
                      {formatNumber(gap)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(Math.max(gap, 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
