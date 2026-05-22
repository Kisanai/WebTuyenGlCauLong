import { useEffect, useMemo, useState } from 'react';
import { updatePost } from '../pages/services/postService';

function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function EditPostModal({ open, post, onClose, onUpdated }) {
  const currentUser = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? safeParseJson(raw) : null;
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalSlots: 1,
    date: '',
    startTime: '',
    endTime: '',
    courtName: '',
    courtAddress: '',
    skillLevel: '',
    price: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    setFormData({
      title: post.title || '',
      description: post.description || '',
      totalSlots: Number(post.totalSlots ?? 1),
      date: post.date || '',
      startTime: post.startTime || '',
      endTime: post.endTime || '',
      courtName: post.courtName || '',
      courtAddress: post.courtAddress || '',
      skillLevel: post.skillLevel || '',
      price: Number(post.price ?? 0)
    });
  }, [open, post?._id]);

  if (!open || !post) return null;

  const canEdit = !!currentUser?.id && String(currentUser.id) === String(post.userId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    if (Number(formData.totalSlots) <= 0) {
      alert('Số slot phải lớn hơn 0');
      return;
    }
    if (Number(formData.price) < 0) {
      alert('Giá không hợp lệ');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      alert('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        totalSlots: Number(formData.totalSlots),
        price: Number(formData.price)
      };

      await updatePost(post._id, payload);
      alert('Cập nhật bài đăng thành công');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Cập nhật bài đăng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chỉnh sửa bài đăng</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {!canEdit ? (
                <div className="alert alert-warning mb-0">
                  Bạn không có quyền chỉnh sửa bài đăng này.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tiêu đề</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số slot cần tuyển</label>
                      <input
                        type="number"
                        className="form-control"
                        name="totalSlots"
                        value={formData.totalSlots}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày chơi</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giờ bắt đầu</label>
                      <input
                        type="time"
                        className="form-control"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giờ kết thúc</label>
                      <input
                        type="time"
                        className="form-control"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tên sân</label>
                    <input
                      type="text"
                      className="form-control"
                      name="courtName"
                      value={formData.courtName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Địa chỉ sân</label>
                    <input
                      type="text"
                      className="form-control"
                      name="courtAddress"
                      value={formData.courtAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Trình độ</label>
                      <select
                        className="form-select"
                        name="skillLevel"
                        value={formData.skillLevel}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn trình độ</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Chi phí mỗi người</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

export default EditPostModal;

