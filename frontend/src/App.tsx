
import React, { useState } from 'react';

import { DashboardError, DashboardLoading } from './components/dashboard/DashboardStates';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AccuracyPage } from './components/dashboard/AccuracyPage';
import { ProcurementPage } from './components/dashboard/ProcurementPage';
import { IntervalsPage } from './components/dashboard/IntervalsPage';
import { TimelinePage } from './components/dashboard/TimelinePage';

import { AppLayout } from './components/layout/AppLayout';
import { Footer } from './components/layout/Footer';

import { useEvaluation } from './hooks/useEvaluation';
import { useHealth } from './hooks/useHealth';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const { evaluation, loading, error, retry } = useEvaluation(11);
  const { health, healthError } = useHealth();

  const renderEvaluationState = (emptyMessage: string) => {
    if (loading) {
      return <DashboardLoading />;
    }

    if (error) {
      return <DashboardError message={error} onRetry={retry} />;
    }

    if (!evaluation) {
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          {emptyMessage}
        </section>
      );
    }

    return null;
  };

  const renderSelectedView = () => {
    const emptyMessages: Record<string, string> = {
      dashboard: 'No evaluation data is available for this period.',
      accuracy: 'No evaluation data is available for Error Analytics.',
      procurement: 'No evaluation data is available for Wind Shortfall.',
      intervals: 'No evaluation data is available for the interval table.',
      timeline: 'No evaluation data is available for the cutoff audit trail.',
    };

    const evaluationState = renderEvaluationState(
      emptyMessages[currentView] ?? emptyMessages.dashboard,
    );

    if (evaluationState) {
      return evaluationState;
    }

    if (!evaluation) {
      return null;
    }

    switch (currentView) {
      case 'accuracy':
        return <AccuracyPage evaluation={evaluation} />;

      case 'procurement':
        return <ProcurementPage evaluation={evaluation} />;

      case 'intervals':
        return <IntervalsPage evaluation={evaluation} />;

      case 'timeline':
        return <TimelinePage evaluation={evaluation} />;

      case 'dashboard':
      default:
        return <DashboardPage evaluation={evaluation} />;
    }
  };

  return (
    <AppLayout
      health={health}
      healthError={healthError}
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderSelectedView()}
      <Footer />
    </AppLayout>
  );
};

export default App;
