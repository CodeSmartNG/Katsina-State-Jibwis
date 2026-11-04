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
import Profile from './pages/Profile.jsx'; 
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Donate from './pages/Donate.jsx';
import DonationSuccess from './pages/DonationSuccess.jsx';
import IDCardMaker from './pages/IDCardMaker.jsx';





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
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />
         <Route path="/donate" element={<Donate />} />
         <Route path="/donation-success" element={<DonationSuccess />} />
          
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

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>

        
<Route
  path="/id-card-maker"
  element={
    <ProtectedRoute roles={['stateAdmin']}>
      <IDCardMaker />
    </ProtectedRoute>
  }
/>
      </main>
    </>
  );
}
