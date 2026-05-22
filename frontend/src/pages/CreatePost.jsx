
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from './services/postService';

function CreatePost() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalSlots: '',
    date: '',
    startTime: '',
    endTime: '',
    courtName: '',
    courtAddress: '',
    skillLevel: '',
    price: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      await createPost(payload);
      alert('Tạo bài đăng thành công');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Tạo bài đăng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 mb-5" style={{ maxWidth: '800px' }}>
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Tạo bài đăng tuyển giao lưu</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Tiêu đề</label>
                <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Tuyển thêm 2 người đánh đôi tối nay"
                required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Mô tả chi tiết</label>
                <textarea
                className="form-control"
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả trình độ, độ tuổi, giới tính hoặc yêu cầu khác"
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

            <button
                type="submit"
                className="btn btn-success w-100 py-2"
                disabled={loading}
            >
                {loading ? 'Đang tạo bài đăng...' : 'Đăng bài'}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;

