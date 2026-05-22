import { useEffect, useMemo, useState } from 'react';
import { approveBooking, rejectBooking } from './services/bookingService';
import { getNotifications, markNotificationRead } from './services/notificationService';

function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function Notifications() {
  const currentUser = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? safeParseJson(raw) : null;
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(false);
      setItems(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (n) => {
    const bookingId = n?.data?.bookingId;
    if (!bookingId) return;
    try {
      setBusyId(n._id);
      await approveBooking(bookingId);
      await markNotificationRead(n._id);
      await load();
      alert('Đã đồng ý. Slot đã được trừ.');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể đồng ý');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (n) => {
    const bookingId = n?.data?.bookingId;
    if (!bookingId) return;
    try {
      setBusyId(n._id);
      await rejectBooking(bookingId);
      await markNotificationRead(n._id);
      await load();
      alert('Đã từ chối.');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể từ chối');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkRead = async (n) => {
    try {
      setBusyId(n._id);
      await markNotificationRead(n._id);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể đánh dấu đã đọc');
    } finally {
      setBusyId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Bạn cần đăng nhập để xem thông báo.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Thông báo</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : items.length === 0 ? (
        <p>Chưa có thông báo</p>
      ) : (
        <div className="list-group">
          {items.map((n) => {
            const isBookingRequest = n.type === 'booking_request';
            const disabled = busyId === n._id;

            return (
              <div
                key={n._id}
                className={`list-group-item d-flex justify-content-between align-items-start ${n.isRead ? '' : 'list-group-item-warning'}`}
              >
                <div className="me-3">
                  <div className="fw-semibold">{n.message}</div>
                  <div className="small text-muted">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    {n.type ? ` • ${n.type}` : ''}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  {isBookingRequest && !n.isRead ? (
                    <>
                      <button className="btn btn-sm btn-success" disabled={disabled} onClick={() => handleApprove(n)}>
                        Đồng ý
                      </button>
                      <button className="btn btn-sm btn-outline-danger" disabled={disabled} onClick={() => handleReject(n)}>
                        Từ chối
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary" disabled={disabled} onClick={() => handleMarkRead(n)}>
                      Đã đọc
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;

