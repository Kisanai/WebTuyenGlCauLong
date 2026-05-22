import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];

function AdminStatsCharts({ stats }) {
  const overviewData = [
    { name: 'Người dùng', value: stats.total_users },
    { name: 'Bài đăng', value: stats.total_posts },
    { name: 'Đơn đăng ký', value: stats.total_bookings },
  ];

  const bookingStatusData = [
    { name: 'Đã duyệt', value: stats.approved_bookings },
    { name: 'Chưa duyệt / khác', value: Math.max(0, stats.total_bookings - stats.approved_bookings) },
  ].filter((item) => item.value > 0);

  const userRoleData = [
    { name: 'Người dùng thường', value: stats.regular_users },
    { name: 'Admin', value: Math.max(0, stats.total_users - stats.regular_users) },
  ].filter((item) => item.value > 0);

  const popularTimesData = stats.popular_times.map((t) => ({
    name: t.time,
    count: t.count,
  }));

  const popularCourtsData = stats.popular_courts.map((c) => ({
    name: c.court.length > 18 ? `${c.court.slice(0, 18)}…` : c.court,
    fullName: c.court,
    count: c.count,
  }));

  return (
    <div className="admin-charts">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Tổng người dùng</span>
            <span className="admin-stat-value">{stats.total_users}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Tổng bài đăng</span>
            <span className="admin-stat-value">{stats.total_posts}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Tổng đơn đăng ký</span>
            <span className="admin-stat-value">{stats.total_bookings}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="admin-chart-card">
            <h5>Tổng quan hệ thống</h5>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overviewData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng" fill="#0d6efd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="admin-chart-card">
            <h5>Phân bố vai trò người dùng</h5>
            {userRoleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userRoleData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted mb-0">Chưa có dữ liệu người dùng.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="admin-chart-card">
            <h5>Trạng thái đơn đăng ký</h5>
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {bookingStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted mb-0">Chưa có đơn đăng ký.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="admin-chart-card">
            <h5>Khung giờ được ưa chuộng</h5>
            {popularTimesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={popularTimesData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Số bài" fill="#198754" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted mb-0">Chưa có dữ liệu khung giờ.</p>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="admin-chart-card">
            <h5>Sân được đăng nhiều nhất</h5>
            {popularCourtsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularCourtsData} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, 'Số bài']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                  />
                  <Bar dataKey="count" name="Số bài" fill="#6f42c1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted mb-0">Chưa có dữ liệu sân.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStatsCharts;
