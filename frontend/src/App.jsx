import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ThreadDetailPage from './pages/ThreadDetailPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import FollowersPage from './pages/FollowersPage'
import FollowingPage from './pages/FollowingPage'
import FollowRequestsPage from './pages/FollowRequestsPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import AccountSettingsPage from './pages/settings/AccountSettingsPage'
import PrivacySettingsPage from './pages/settings/PrivacySettingsPage'
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage'
import DisplaySettingsPage from './pages/settings/DisplaySettingsPage'
import ArchivedThreadsPage from './pages/settings/ArchivedThreadsPage'
import SavedThreadsPage from './pages/SavedThreadsPage'
import RepostedThreadsPage from './pages/RepostedThreadsPage'
import TermsOfServicePage from './pages/legal/TermsOfServicePage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import CookiePolicyPage from './pages/legal/CookiePolicyPage'
import AccessibilityPage from './pages/legal/AccessibilityPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            },
          }}
        />
        <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<FeedPage />} />
            <Route path="/thread/:threadId" element={<ThreadDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/saved" element={<SavedThreadsPage />} />
            <Route path="/reposts" element={<RepostedThreadsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/user/:userId" element={<ProfilePage />} />
            <Route path="/user/:userId/followers" element={<FollowersPage />} />
            <Route path="/user/:userId/following" element={<FollowingPage />} />
            <Route path="/follow-requests" element={<FollowRequestsPage />} />
            <Route path="/settings" element={<SettingsLayout />}>
              <Route path="account" element={<AccountSettingsPage />} />
              <Route path="privacy" element={<PrivacySettingsPage />} />
              <Route path="notifications" element={<NotificationSettingsPage />} />
              <Route path="display" element={<DisplaySettingsPage />} />
              <Route path="archived" element={<ArchivedThreadsPage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}