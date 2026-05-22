import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminStatsCharts from '../components/AdminStatsCharts';
import { getAllUsers, getAllPosts, getStats, deletePost, deleteUser } from './services/adminService';
import '../styles/Admin.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await getAllUsers();
        setUsers(data);
      } else if (activeTab === 'posts') {
        const data = await getAllPosts();
        setPosts(data);
      } else if (activeTab === 'stats') {
        const data = await getStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      setDeletingId(postId);
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      alert('Đã xóa bài viết');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này? Tất cả bài viết và đơn đăng ký sẽ bị xóa.')) {
      return;
    }

    try {
      setDeletingId(userId);
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      alert('Đã xóa tài khoản');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'stats' && stats && <AdminStatsCharts stats={stats} />}

          {activeTab === 'users' && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Tên</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        <th>Bài đăng</th>
                        <th>Đơn đăng ký</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.phone}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td>{user.posts_count}</td>
                          <td>{user.bookings_count}</td>
                          <td>
                            {user.role !== 'admin' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingId === user.id}
                              >
                                {deletingId === user.id ? 'Đang xóa...' : 'Xóa'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Sân</th>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Slot</th>
                        <th>Tác giả</th>
                        <th>Đơn đăng ký</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td>{post.title}</td>
                          <td>{post.courtName}</td>
                          <td>{post.date}</td>
                          <td>{post.startTime}</td>
                          <td>
                            {post.remainingSlots}/{post.totalSlots}
                          </td>
                          <td>{post.author}</td>
                          <td>{post.bookings_count}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? 'Đang xóa...' : 'Xóa'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default Admin;
