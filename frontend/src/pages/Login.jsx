import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from './services/authService';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';

  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user?.role === 'admin') {
        window.location.href = '/admin';
        return;
      }

      alert('Đăng nhập thành công');
      navigate('/', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">{isAdminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>
        </form>

        {!isAdminLogin && (
          <p className="text-center mt-3 mb-0">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;