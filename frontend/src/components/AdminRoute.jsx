import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          Tài khoản này không có quyền truy cập bảng quản trị.
        </div>
        <a href="/" className="btn btn-primary">Về trang chủ</a>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
