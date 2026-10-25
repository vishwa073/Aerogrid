
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  description: string;
  icon: LucideIcon;
}

export function KpiCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
}: KpiCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-500">
            {title}
          </h3>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            <span className="text-sm text-slate-500">{unit}</span>
          </div>
        </div>

        <div className="shrink-0 rounded-lg bg-emerald-50 p-2.5">
          <Icon
            aria-hidden="true"
            className="h-5 w-5 text-emerald-700"
          />
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </article>
  );
}
