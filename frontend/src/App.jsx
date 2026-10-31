import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Announcements from './pages/Announcements.jsx';
import Activities from './pages/Activities.jsx';
import Members from './pages/Members.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/activities" element={<Activities />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute roles={['wardOfficer', 'lgaOfficer', 'stateAdmin']}>
                <Members />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
