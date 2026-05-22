import { useEffect, useState } from 'react';
import { getAllPosts } from './services/postService';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Bài tuyển giao lưu cầu lông</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : posts.length === 0 ? (
        <p>Chưa có bài đăng nào</p>
      ) : (
        <div className="row">
          {posts.map((post) => (
            <div className="col-md-6 col-lg-4 mb-4" key={post._id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;