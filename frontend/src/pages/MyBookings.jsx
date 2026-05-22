import { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from './services/bookingService';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const canCancelBooking = (booking) => {
    if (booking.status === 'pending') {
      return true;
    }
    
    if (booking.status === 'approved' && booking.post?.startTime && booking.post?.date) {
      // Calculate time until match starts
      const matchDateTime = new Date(`${booking.post.date}T${booking.post.startTime}`);
      const now = new Date();
      const hoursUntilMatch = (matchDateTime - now) / (1000 * 60 * 60);
      
      // Can cancel if more than 12 hours before match
      return hoursUntilMatch > 12;
    }
    
    return false;
  };

  const getCancelButtonText = (booking) => {
    if (booking.status === 'pending') {
      return 'Hủy đăng ký';
    }
    
    if (booking.status === 'approved' && booking.post?.startTime && booking.post?.date) {
      const matchDateTime = new Date(`${booking.post.date}T${booking.post.startTime}`);
      const now = new Date();
      const hoursUntilMatch = (matchDateTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilMatch <= 12) {
        return `Không thể hủy (${Math.round(hoursUntilMatch)}h nữa)`;
      }
      return 'Hủy slot';
    }
    
    return null;
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký slot này?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (error) {
      alert('Lỗi khi hủy đăng ký: ' + (error.response?.data?.message || error.message));
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Chờ duyệt' },
      approved: { bg: 'success', text: 'Đã duyệt' },
      rejected: { bg: 'danger', text: 'Bị từ chối' },
      cancelled: { bg: 'secondary', text: 'Đã hủy' }
    };
    const s = statusMap[status] || { bg: 'secondary', text: status };
    return <span className={`badge bg-${s.bg}`}>{s.text}</span>;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Các slot tôi đã đăng ký</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <label className="form-label">Lọc theo trạng thái:</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Bị từ chối</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="alert alert-info">
              Bạn chưa có slot nào trong danh sách này
            </div>
          ) : (
            <div className="row">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{booking.post?.title}</h5>

                      <p className="card-text">
                        <strong>Sân:</strong> {booking.post?.courtName}
                      </p>

                      <p className="card-text">
                        <strong>Ngày:</strong> {booking.post?.date}
                      </p>

                      <p className="card-text">
                        <strong>Giờ:</strong> {booking.post?.startTime} - {booking.post?.endTime}
                      </p>

                      <p className="card-text">
                        <strong>Số slot:</strong> {booking.requestedSlots}
                      </p>

                      <p className="card-text">
                        <strong>Trạng thái:</strong> {getStatusBadge(booking.status)}
                      </p>

                      <p className="card-text text-muted small">
                        <strong>Ngày đăng ký:</strong>{' '}
                        {new Date(booking.createdAt).toLocaleString('vi-VN')}
                      </p>

                      {canCancelBooking(booking) && (
                        <button
                          className="btn btn-sm btn-danger mt-2"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? 'Đang hủy...' : getCancelButtonText(booking)}
                        </button>
                      )}
                      
                      {!canCancelBooking(booking) && (booking.status === 'pending' || booking.status === 'approved') && (
                        <button
                          className="btn btn-sm btn-danger mt-2"
                          disabled
                          title={booking.status === 'approved' ? 'Hạn hủy đã hết (cần hủy trước 12h)' : ''}
                        >
                          {getCancelButtonText(booking)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyBookings;
