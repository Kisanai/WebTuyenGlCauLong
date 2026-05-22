import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from './services/authService';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
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
      await registerUser(formData);
      alert('Đăng ký thành công');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            Đăng ký
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
export default Register;