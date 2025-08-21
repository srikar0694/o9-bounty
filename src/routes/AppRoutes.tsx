import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { AdminRoute } from './AdminRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { BugsPage } from '../pages/BugsPage';
import { GroupsPage } from '../pages/GroupsPage';
import { AdminPage } from '../pages/AdminPage';
import { Layout } from '../components/Layout';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <RequireAuth>
          <Layout>
            <DashboardPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/bugs" element={
        <RequireAuth>
          <Layout>
            <BugsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/groups" element={
        <RequireAuth>
          <Layout>
            <GroupsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/admin" element={
        <RequireAuth>
          <AdminRoute>
            <Layout>
              <AdminPage />
            </Layout>
          </AdminRoute>
        </RequireAuth>
      } />
    </Routes>
  );
}