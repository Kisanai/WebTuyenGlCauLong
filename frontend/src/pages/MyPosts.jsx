import { useEffect, useState } from 'react';
import { deletePost, getMyPosts } from './services/postService';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyPosts();
      setPosts(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Không tải được bài đăng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isExpired = (p) => p?.status === 'expired';
  const isDeleted = (p) => p?.status === 'deleted';
  const isSoldOut = (p) => Number(p?.remainingSlots ?? p?.totalSlots ?? 0) <= 0;

  const handleDelete = async (post) => {
    if (!post?._id) return;
    if (!isExpired(post) && !isDeleted(post)) {
      const ok = window.confirm('Bạn chắc chắn muốn xóa bài đăng này không?');
      if (!ok) return;
    }

    try {
      setBusyId(post._id);
      await deletePost(post._id);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Xóa bài đăng thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const renderBadge = (post) => {
    if (isDeleted(post)) return <span className="badge text-bg-secondary">Đã xóa</span>;
    if (isExpired(post)) return <span className="badge text-bg-warning">Hết hạn</span>;
    if (isSoldOut(post)) return <span className="badge text-bg-info">Hết slot</span>;
    return <span className="badge text-bg-success">Đang hoạt động</span>;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Bài đăng của tôi</h2>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : posts.length === 0 ? (
        <p>Chưa có bài đăng nào</p>
      ) : (
        <div className="row">
          {posts.map((post) => {
            const remaining = post?.remainingSlots ?? post?.totalSlots ?? 0;
            const disabled = busyId === post._id;

            return (
              <div className="col-md-6 col-lg-4 mb-4" key={post._id}>
                <div className={`card shadow-sm h-100 ${isDeleted(post) ? 'opacity-75' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h5 className="card-title mb-1">{post.title}</h5>
                        {renderBadge(post)}
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Xóa bài đăng"
                        disabled={disabled}
                        onClick={() => handleDelete(post)}
                      >
                        ×
                      </button>
                    </div>

                    <p className="card-text mt-2">{post.description}</p>

                    <p className="mb-1"><strong>Sân:</strong> {post.courtName}</p>
                    <p className="mb-1"><strong>Ngày:</strong> {post.date}</p>
                    <p className="mb-1"><strong>Giờ:</strong> {post.startTime} - {post.endTime}</p>
                    <p className="mb-1"><strong>Slot còn lại:</strong> {remaining}</p>
                    <p className="mb-0"><strong>Trình độ:</strong> {post.skillLevel}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyPosts;