import { useEffect, useMemo, useRef, useState } from 'react';
import { approveBooking, rejectBooking } from '../pages/services/bookingService';
import { getNotifications, markNotificationRead } from '../pages/services/notificationService';

function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function getInitials(nameOrPhone) {
  const s = String(nameOrPhone || '').trim();
  if (!s) return 'U';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserMenuDropdown({ onLogout }) {
  const currentUser = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? safeParseJson(raw) : null;
  }, []);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [requests, setRequests] = useState([]);

  const rootRef = useRef(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(true);
      const pending = (data || []).filter((n) => n.type === 'booking_request' && !n.isRead);
      setRequests(pending);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!currentUser) return null;

  const displayName = currentUser.name || currentUser.phone || 'User';
  const initials = getInitials(displayName);

  const handleApprove = async (n) => {
    const bookingId = n?.data?.bookingId;
    if (!bookingId) return;
    try {
      setBusyId(n._id);
      await approveBooking(bookingId);
      await markNotificationRead(n._id);
      await loadRequests();
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
      await loadRequests();
      alert('Đã từ chối.');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể từ chối');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="position-relative" ref={rootRef}>
      <button
        type="button"
        className="btn btn-outline-light d-flex align-items-center justify-content-center"
        style={{ width: 40, height: 40, borderRadius: 10, padding: 0 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        <span className="fw-bold" style={{ fontSize: 14 }}>
          {initials}
        </span>
      </button>

      {open && (
        <div
          className="dropdown-menu dropdown-menu-end show p-2"
          style={{ minWidth: 320, right: 0, left: 'auto' }}
        >
          <div className="px-2 py-1">
            <div className="fw-semibold">{displayName}</div>
            <div className="small text-muted">{currentUser.phone || ''}</div>
          </div>

          <div className="dropdown-divider" />

          <div className="px-2 pb-1 fw-semibold">Yêu cầu slot</div>
          {loading ? (
            <div className="px-2 small text-muted">Đang tải...</div>
          ) : requests.length === 0 ? (
            <div className="px-2 small text-muted">Chưa có yêu cầu mới</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {requests.map((n) => {
                const disabled = busyId === n._id;
                const reqName = n?.data?.requesterName || 'Người dùng';
                const reqPhone = n?.data?.requesterPhone || '(không có SĐT)';
                const slots = n?.data?.requestedSlots;
                const postTitle = n?.data?.postTitle;
                const courtName = n?.data?.courtName;
                const date = n?.data?.date;
                const startTime = n?.data?.startTime;
                const endTime = n?.data?.endTime;

                return (
                  <div key={n._id} className="border rounded p-2 mb-2">
                    <div className="fw-semibold">{reqName}</div>
                    <div className="small text-muted">{reqPhone}</div>
                    <div className="small">
                      {postTitle ? (
                        <>
                          Bài: <span className="fw-semibold">{postTitle}</span>
                        </>
                      ) : null}
                      {typeof slots !== 'undefined' ? (
                        <>
                          {postTitle ? ' • ' : ''}
                          Slot: <span className="fw-semibold">{slots}</span>
                        </>
                      ) : null}
                    </div>
                    {(date || startTime || courtName) && (
                      <div className="small text-muted">
                        {date ? <span>{date}</span> : null}
                        {startTime ? <span>{date ? ' • ' : ''}{startTime}{endTime ? ` - ${endTime}` : ''}</span> : null}
                        {courtName ? <span>{(date || startTime) ? ' • ' : ''}Sân: {courtName}</span> : null}
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-success" disabled={disabled} onClick={() => handleApprove(n)}>
                        Đồng ý
                      </button>
                      <button className="btn btn-sm btn-outline-danger" disabled={disabled} onClick={() => handleReject(n)}>
                        Từ chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="dropdown-divider" />

          <button type="button" className="dropdown-item text-danger" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenuDropdown;

