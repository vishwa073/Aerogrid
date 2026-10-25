import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
    />
  );
}

export function DashboardLoading() {
  return (
    <section
      role="status"
      aria-label="Loading wind generation analysis"
      className="space-y-6"
    >
      <span className="sr-only">
        Preparing your wind forecast analysis...
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-8 w-28" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-3/4" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />

        <div className="mt-6 flex h-64 items-end gap-2 sm:h-80">
          {Array.from({ length: 24 }, (_, index) => (
            <Skeleton
              key={index}
              className="flex-1"
              style={{
                height: `${25 + ((index * 37) % 70)}%`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

export function DashboardError({
  message,
  onRetry,
}: DashboardErrorProps) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-red-200 bg-white p-6"
    >
      <h2 className="font-semibold text-slate-900">
        We couldn't load the forecast analysis
      </h2>

      <p className="mt-2 text-sm text-slate-600">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </section>
  );
}