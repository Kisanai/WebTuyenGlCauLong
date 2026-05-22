import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPosts';
import MyBookings from './pages/MyBookings';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
