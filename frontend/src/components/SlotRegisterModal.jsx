import { useEffect, useMemo, useState } from 'react';
import { requestBooking } from '../pages/services/bookingService';

function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function SlotRegisterModal({ open, post, onClose }) {
  const currentUser = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? safeParseJson(raw) : null;
  }, []);

  const requesterPhone = currentUser?.phone || '';
  const ownerPhone = post?.userPhone || post?.phone || '';

  const remainingSlots = post?.remainingSlots ?? post?.totalSlots ?? 0;
  const [slotsToRegister, setSlotsToRegister] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlotsToRegister(1);
  }, [open, post?._id]);

  if (!open || !post) return null;

  const canSubmit =
    !!requesterPhone &&
    Number.isFinite(Number(slotsToRegister)) &&
    Number(slotsToRegister) >= 1 &&
    Number(slotsToRegister) <= Number(remainingSlots || 0);

  const handleConfirm = () => {
    if (!canSubmit || loading) return;
    const doRequest = async () => {
      try {
        setLoading(true);
        await requestBooking({ postId: post._id, requestedSlots: Number(slotsToRegister) });
        alert('Đã gửi yêu cầu đăng ký. Chờ người đăng bài xác nhận.');
        onClose?.();
      } catch (error) {
        alert(error.response?.data?.message || 'Gửi yêu cầu đăng ký thất bại');
      } finally {
        setLoading(false);
      }
    };
    doRequest();
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận đăng ký slot</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: '45%' }}>Ngày</th>
                      <td>{post.date || '-'}</td>
                    </tr>
                    <tr>
                      <th>Giờ</th>
                      <td>
                        {post.startTime || '-'}
                        {post.endTime ? ` - ${post.endTime}` : ''}
                      </td>
                    </tr>
                    <tr>
                      <th>Sân</th>
                      <td>{post.courtName || '-'}</td>
                    </tr>
                    <tr>
                      <th>Trình độ</th>
                      <td>{post.skillLevel || '-'}</td>
                    </tr>
                    <tr>
                      <th>Slot còn lại</th>
                      <td>{remainingSlots}</td>
                    </tr>
                    <tr>
                      <th>Số slot đăng ký</th>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min={1}
                          max={remainingSlots}
                          value={slotsToRegister}
                          onChange={(e) => setSlotsToRegister(e.target.value)}
                        />
                        <div className="form-text mb-0">
                          Tối đa: {remainingSlots}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>SĐT người đăng ký</th>
                      <td>{requesterPhone || '(cần đăng nhập)'}</td>
                    </tr>
                    <tr>
                      <th>SĐT người đăng bài</th>
                      <td>{ownerPhone || '(chưa có dữ liệu)'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!canSubmit || loading}>
                {loading ? 'Đang gửi...' : 'Xác nhận đăng ký'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

export default SlotRegisterModal;

