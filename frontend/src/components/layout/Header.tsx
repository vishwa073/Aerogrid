import React from 'react'
import {
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { HealthResponse } from '../../types/api'

interface HeaderProps {
  health: HealthResponse | null
  healthError: string | null
}

export const Header: React.FC<HeaderProps> = ({ health, healthError }) => {
  return (
    <header className='flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6'>
      
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
        <div className='flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200'>
          <Calendar className='w-3.5 h-3.5 text-slate-500' />
          <span>Scope: UK National Wind (January 2026)</span>
        </div>

        <div className='flex items-center gap-1.5 text-xs text-slate-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80'>
          <Clock className='w-3.5 h-3.5 text-emerald-600' />
          <span className='font-medium text-emerald-900'>
            Cutoff Policy:{' '}
            <span className='font-semibold'>Day-Ahead 11:00 UTC</span>
          </span>
          <span className='text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded ml-1 font-mono'>
            Provisional Assumption
          </span>
        </div>
      </div>
      {/* Backend Health Badge */}
      <div className='flex items-center gap-3'>
        {health ? (
          <div className='flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
            <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
            <span className='font-medium'>
              Backend: {health.status} (v{health.version})
            </span>
          </div>
        ) : healthError ? (
          <div className='flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200'>
            <AlertCircle className='w-3.5 h-3.5 text-red-500' />
            <span className='font-medium'>Backend Offline</span>
          </div>
        ) : (
          <div className='flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600'>
            <Activity className='w-3.5 h-3.5 animate-spin text-slate-400' />
            <span>Connecting...</span>
          </div>
        )}
      </div>
    </header>
  )
}
