/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigation } from './lib/useNavigation';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { PhysicalPainView } from './components/physical_pain/PhysicalPainView';
import { PhysicalPainResultView } from './components/physical_pain/PhysicalPainResultView';
import { ProblemPainView } from './components/problem_pain/ProblemPainView';
import { ProblemPainResultView } from './components/problem_pain/ProblemPainResultView';
import { PainHistoryView } from './components/history/PainHistoryView';
import { SupplierDashboardView } from './components/supplier/SupplierDashboardView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { ThemeStudioView } from './components/admin/ThemeStudioView';
import { TestThemeBanner } from './components/admin/TestThemeBanner';
import { LiveAdminQuickEditor } from './components/admin/LiveAdminQuickEditor';
import { FooterSupplierBanner } from './components/FooterSupplierBanner';
import { ThemeProvider, useTheme } from './modules/theme/ThemeContext';
import { getThemeContent } from './modules/theme/types';
import { initMascotPersistence } from './modules/mascot/mascotAssets';
import { physicalPainService } from './modules/physical_pain/physicalPainStore';
import { problemPainService } from './modules/problem_pain/problemPainStore';
import {
  PhysicalPainAssessment,
  PhysicalPainAnalysisResult,
  ProblemAssessment,
  ProblemPainAnalysisResult,
} from './types';

function AppContent() {
  const { currentRoute, navigate } = useNavigation();
  const { isAdmin, testTheme, effectiveTheme } = useTheme();

  // State for /dor-fisica/resultado
  const [resultAssessment, setResultAssessment] = useState<PhysicalPainAssessment | null>(() =>
    physicalPainService.getCurrentAssessment()
  );
  const [resultAnalysis, setResultAnalysis] = useState<PhysicalPainAnalysisResult | null>(() =>
    physicalPainService.getCurrentAnalysis()
  );

  // State for /dor-problema/resultado
  const [problemAssessment, setProblemAssessment] = useState<ProblemAssessment | null>(() =>
    problemPainService.getCurrentAssessment()
  );
  const [problemAnalysis, setProblemAnalysis] = useState<ProblemPainAnalysisResult | null>(() =>
    problemPainService.getCurrentAnalysis()
  );

  // Initialize mascot persistence from server
  useEffect(() => {
    initMascotPersistence();
  }, []);

  // Sync state whenever route changes
  useEffect(() => {
    if (currentRoute === '/dor-fisica/resultado') {
      const storedAssessment = physicalPainService.getCurrentAssessment();
      const storedAnalysis = physicalPainService.getCurrentAnalysis();
      setResultAssessment(storedAssessment);
      setResultAnalysis(storedAnalysis);

      if (!storedAssessment || !storedAnalysis) {
        navigate('/dor-fisica');
      }
    }

    if (currentRoute === '/dor-problema/resultado') {
      const storedAssessment = problemPainService.getCurrentAssessment();
      const storedAnalysis = problemPainService.getCurrentAnalysis();
      setProblemAssessment(storedAssessment);
      setProblemAnalysis(storedAnalysis);

      if (!storedAssessment || !storedAnalysis) {
        navigate('/dor-problema');
      }
    }
  }, [currentRoute, navigate]);

  const handleResetPhysicalPain = () => {
    physicalPainService.clearDraft();
    setResultAssessment(null);
    setResultAnalysis(null);
    navigate('/dor-fisica');
  };

  const handleResetProblemPain = () => {
    problemPainService.clearDraft();
    setProblemAssessment(null);
    setProblemAnalysis(null);
    navigate('/dor-problema');
  };

  const handleProblemComplete = (
    assessment: ProblemAssessment,
    analysis: ProblemPainAnalysisResult
  ) => {
    setProblemAssessment(assessment);
    setProblemAnalysis(analysis);
    navigate('/dor-problema/resultado');
  };

  const activeProblemAssessment = problemAssessment || problemPainService.getCurrentAssessment();
  const activeProblemAnalysis = problemAnalysis || problemPainService.getCurrentAnalysis();

  const activePhysicalAssessment = resultAssessment || physicalPainService.getCurrentAssessment();
  const activePhysicalAnalysis = resultAnalysis || physicalPainService.getCurrentAnalysis();

  // Dedicated separate Admin view on /admin
  if (currentRoute === '/admin') {
    if (isAdmin) {
      return <ThemeStudioView onNavigateHome={() => navigate('/')} />;
    }
    return <AdminLoginView onNavigateHome={() => navigate('/')} />;
  }

  const t = effectiveTheme;
  const content = getThemeContent(t);

  return (
    <div
      style={{
        backgroundColor: t.colors.background,
        color: t.colors.textPrimary,
        fontFamily: t.typography.bodyFont,
      }}
      className="min-h-screen flex flex-col transition-colors selection:bg-amber-100 selection:text-amber-950 relative"
    >
      {/* Live Admin On-Screen Quick Editor (Floating widget for live editing when logged in) */}
      <LiveAdminQuickEditor onOpenStudio={() => navigate('/admin')} />

      {/* Test Theme Notification Banner (visible only when admin enters test mode) */}
      <TestThemeBanner onReturnToAdmin={() => navigate('/admin')} />

      {/* Top minimal header */}
      <Header currentRoute={currentRoute} onNavigate={navigate} />

      {/* Main content view based on current path */}
      <div className="flex-1 flex flex-col">
        {currentRoute === '/' && <HomeView onNavigate={navigate} />}

        {currentRoute === '/dor-fisica' && <PhysicalPainView onNavigate={navigate} />}

        {currentRoute === '/dor-fisica/resultado' && activePhysicalAssessment && activePhysicalAnalysis && (
          <PhysicalPainResultView
            assessment={activePhysicalAssessment}
            analysisResult={activePhysicalAnalysis}
            onNavigate={navigate}
            onReset={handleResetPhysicalPain}
          />
        )}

        {currentRoute === '/dor-problema' && (
          <ProblemPainView onNavigate={navigate} onComplete={handleProblemComplete} />
        )}

        {currentRoute === '/dor-problema/resultado' && activeProblemAssessment && activeProblemAnalysis && (
          <ProblemPainResultView
            assessment={activeProblemAssessment}
            analysisResult={activeProblemAnalysis}
            onNavigate={navigate}
            onReset={handleResetProblemPain}
          />
        )}

        {currentRoute === '/fornecedor' && (
          <SupplierDashboardView onNavigate={navigate} />
        )}

        {currentRoute === '/historico' && (
          <PainHistoryView onNavigate={navigate} />
        )}
      </div>

      {/* Prominent Footer Supplier Banner (when configured & outside supplier page) */}
      {currentRoute !== '/fornecedor' && (
        <FooterSupplierBanner onNavigate={navigate} />
      )}

      {/* Minimalistic footer */}
      <footer
        id="main-footer"
        style={{
          borderColor: t.colors.border,
          color: t.colors.textSecondary,
        }}
        className="w-full border-t py-6 mt-auto transition-colors"
      >
        <div
          style={{ maxWidth: `${t.layout.maxWidth}px` }}
          className="mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: t.colors.accent }}
              className="w-1.5 h-1.5 rounded-full"
            />
            <span
              style={{
                fontFamily: t.typography.headingFont,
                color: t.colors.textPrimary,
              }}
              className="font-bold tracking-tight"
            >
              {content.headerBrandPrefix} {content.headerBrandHighlight}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p
              style={{ fontSize: `${t.typography.footerSize}px` }}
              className="font-medium tracking-tight"
            >
              {content.footerNotice}
            </p>
            <span className="text-neutral-300">|</span>
            <button
              id="btn-footer-admin"
              type="button"
              onClick={() => navigate('/admin')}
              className="text-neutral-500 hover:text-neutral-900 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

