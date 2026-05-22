import { Link, useNavigate } from 'react-router-dom';
import UserMenuDropdown from './UserMenuDropdown';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Badminton Finder
        </Link>

        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Trang chủ
              </Link>
            </li>

            {token && isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    Bảng quản trị
                  </Link>
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link btn btn-link" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-post">
                    Tạo bài đăng
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/my-posts">
                    Bài đăng của tôi
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">
                    Slot của tôi
                  </Link>
                </li>

                <li className="nav-item">
                  <UserMenuDropdown onLogout={handleLogout} />
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Đăng nhập
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;