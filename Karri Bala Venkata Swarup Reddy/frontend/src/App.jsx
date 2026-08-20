import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import RaiseTicket from './pages/RaiseTicket';
import TicketHistory from './pages/TicketHistory';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

import './styles/auth.css';
import './styles/dashboard.css';
import './styles/ticket.css';
import './styles/raiseTicket.css';
import './styles/admin.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* User Portal Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/raise-ticket" element={<ProtectedRoute allowedRoles={['user', 'admin']}><RaiseTicket /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={['user', 'admin']}><RaiseTicket /></ProtectedRoute>} />
      <Route path="/direct-ticket" element={<ProtectedRoute allowedRoles={['user', 'admin']}><RaiseTicket /></ProtectedRoute>} />
      <Route path="/my-tickets" element={<ProtectedRoute allowedRoles={['user', 'admin']}><TicketHistory /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allowedRoles={['user', 'admin']}><TicketHistory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserProfile /></ProtectedRoute>} />
      
      {/* Admin Portal Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><AdminTickets /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
