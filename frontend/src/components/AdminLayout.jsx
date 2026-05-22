import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'stats', label: 'Thống kê', icon: '📊' },
  { id: 'users', label: 'Người dùng', icon: '👥' },
  { id: 'posts', label: 'Bài viết', icon: '📝' },
];

function AdminLayout({ activeTab, onTabChange, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-icon">🔧</span>
          <div>
            <h1>Quản trị</h1>
            <p className="admin-user-name">{user.name || 'Admin'}</p>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="btn btn-outline-light w-100" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2>Bảng điều khiển</h2>
          <span className="badge bg-danger">Admin</span>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
