import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectOverviewPage } from './pages/ProjectOverviewPage';
import { ScanProgressPage } from './pages/ScanProgressPage';
import { DependencyHealthReportPage } from './pages/DependencyHealthReportPage';
import { RemediationPage } from './pages/RemediationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectOverviewPage />} />
            <Route path="projects/:projectId/scans/:scanId" element={<ScanProgressPage />} />
            <Route path="projects/:projectId/scans/:scanId/report" element={<DependencyHealthReportPage />} />
            <Route
              path="projects/:projectId/scans/:scanId/dependencies/:dependencyId"
              element={<DependencyHealthReportPage />}
            />
            <Route path="projects/:projectId/scans/:scanId/remediation" element={<RemediationPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
