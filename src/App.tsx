import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateMeme from './pages/CreateMeme';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModal from './components/modals/AuthModal';
import CommentsModal from './components/modals/CommentsModal';
import { useModalStore } from './lib/store';
import Notifications from './components/Notifications';

function App() {
  const { isAuthModalOpen, isCommentsModalOpen, activeMemeId } = useModalStore();
  
  return (
    <Router>
      <Notifications />
      
      {isAuthModalOpen && <AuthModal />}
      {isCommentsModalOpen && activeMemeId && (
        <CommentsModal memeId={activeMemeId} />
      )}
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateMeme />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;