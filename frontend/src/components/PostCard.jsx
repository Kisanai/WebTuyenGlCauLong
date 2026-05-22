import { useState } from 'react';
import SlotRegisterModal from './SlotRegisterModal';
import EditPostModal from './EditPostModal';

function PostCard({ post }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const remainingSlots = post?.remainingSlots ?? post?.totalSlots;
  const isSoldOut = Number(remainingSlots || 0) <= 0;

  const currentUserRaw = localStorage.getItem('user');
  const currentUser = currentUserRaw ? (() => { try { return JSON.parse(currentUserRaw); } catch { return null; } })() : null;
  const isOwner =
    (!!currentUser?.id && String(currentUser.id) === String(post?.userId)) ||
    (!!currentUser?.phone && !!post?.userPhone && String(currentUser.phone) === String(post.userPhone));

  return (
    <>
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title">{post.title}</h5>
          <p className="card-text">{post.description}</p>

          <p className="mb-1"><strong>Sân:</strong> {post.courtName}</p>
          <p className="mb-1"><strong>Địa chỉ:</strong> {post.courtAddress}</p>
          <p className="mb-1"><strong>Ngày:</strong> {post.date}</p>
          <p className="mb-1"><strong>Giờ:</strong> {post.startTime} - {post.endTime}</p>
          <p className="mb-1"><strong>Slot còn lại:</strong> {remainingSlots}</p>
          <p className="mb-3"><strong>Trình độ:</strong> {post.skillLevel}</p>

          {isOwner ? (
            <button type="button" className="btn btn-primary w-100" onClick={() => setEditOpen(true)}>
              Chỉnh sửa bài đăng
            </button>
          ) : (
            <button
              type="button"
              className={`btn w-100 ${isSoldOut ? 'btn-secondary' : 'btn-success'}`}
              onClick={() => setOpen(true)}
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Hết slot' : 'Đăng ký slot'}
            </button>
          )}
        </div>
      </div>

      {!isOwner && <SlotRegisterModal open={open} post={post} onClose={() => setOpen(false)} />}
      {isOwner && (
        <EditPostModal
          open={editOpen}
          post={post}
          onClose={() => setEditOpen(false)}
          onUpdated={() => window.location.reload()}
        />
      )}
    </>
  );
}

export default PostCard;