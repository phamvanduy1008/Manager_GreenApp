import React, { useState, useEffect } from "react";
import { ipAddress } from "../../constants/ip";
import {
  FaUsers,
  FaBox,
  FaMoneyBillWave,
  FaTruck,
  FaBoxOpen,
} from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../assets/css/Home.css";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Interface cho dữ liệu dashboard
interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  orderStatus: {
    pending: number;
    resolved: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
  revenueByDay: Array<{ date: string; total: number }>;
  totalProducts: number;
  availableProducts: number;
  activeShippers: number;
  recentOrders: Array<{
    _id: string;
    orderCode: string;
    full_name: string;
    total_price: number;
    status: string;
    dateOrder: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    sold: number;
    price: number;
  }>;
}

// Định nghĩa ánh xạ trạng thái
const orderStatusMap = [
  { key: "pending", label: "Chưa xử lý" },
  { key: "resolved", label: "Đã xử lý" },
  { key: "processing", label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao hàng" },
  { key: "cancelled", label: "Đã hủy" },
];

const Home: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ API
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${ipAddress}/api/dashboard`);
      if (!response.ok) {
        throw new Error(`Lỗi API /api/dashboard: ${response.statusText}`);
      }
      const { success, data: apiData, message } = await response.json();

      if (!success) {
        throw new Error(message || "Không thể lấy dữ liệu dashboard");
      }

      console.log("Revenue by day:", apiData.revenueByDay); // Debug dữ liệu

      setData({
        totalUsers: apiData.totalUsers || 0,
        activeUsers: apiData.activeUsers || 0,
        totalOrders: apiData.totalOrders || 0,
        orderStatus: apiData.orderStatus || {
          pending: 0,
          resolved: 0,
          processing: 0,
          delivered: 0,
          cancelled: 0,
        },
        totalRevenue: apiData.totalRevenue || 0,
        revenueByDay: apiData.revenueByDay || [],
        totalProducts: apiData.totalProducts || 0,
        availableProducts: apiData.availableProducts || 0,
        activeShippers: apiData.activeShippers || 0,
        recentOrders:
          apiData.recentOrders?.map(
            (order: {
              _id: string;
              orderCode: string;
              full_name: string;
              total_price: number;
              status: string;
              dateOrder: string;
            }) => ({
              _id: order._id,
              orderCode: order.orderCode,
              full_name: order.full_name || "Không xác định",
              total_price: order.total_price || 0,
              status: order.status,
              dateOrder: order.dateOrder
                ? new Date(order.dateOrder).toLocaleDateString()
                : "N/A",
            })
          ) || [],
        topProducts:
          apiData.topProducts?.map(
            (product: {
              _id: string;
              name: string;
              sold: number;
              price: number;
            }) => ({
              _id: product._id,
              name: product.name || "Không xác định",
              sold: product.sold || 0,
              price: product.price || 0,
            })
          ) || [],
      });
      setError(null);
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      setError("Không thể tải dữ liệu dashboard");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dữ liệu cho biểu đồ trạng thái đơn hàng
  const statusChartData = {
    labels: orderStatusMap.map((status) => status.label),
    datasets: [
      {
        label: "Số đơn hàng",
        data: data
          ? [
              data.orderStatus.pending || 0,
              data.orderStatus.resolved || 0,
              data.orderStatus.processing || 0,
              data.orderStatus.delivered || 0,
              data.orderStatus.cancelled || 0,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: [
          "#f59e0b", // Yellow cho pending
          "#3b82f6", // Blue cho resolved
          "#8b5cf6", // Purple cho processing
          "#22c55e", // Green cho delivered
          "#ef4444", // Red cho cancelled
        ],
        borderColor: ["#d97706", "#2563eb", "#7c3aed", "#16a34a", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ doanh thu
  const revenueChartData = {
    labels:
      data?.revenueByDay.map((r) => new Date(r.date).toLocaleDateString()) ||
      [],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: data?.revenueByDay.map((r) => r.total) || [],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.2)", // Tô màu dưới đường
        fill: true, // Tô màu dưới đường
        tension: 0.4, // Làm mượt đường
        pointRadius: 4, // Kích thước điểm
        pointBackgroundColor: "#059669",
      },
    ],
  };

  // Tùy chọn chung cho biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        font: {
          size: 18,
          family: "'Inter', sans-serif",
        },
        color: "#1f2937",
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          font: { size: 14, family: "'Inter', sans-serif" },
          color: "#1f2937",
        },
        ticks: {
          color: "#6b7280",
        },
      },
      x: {
        title: {
          display: true,
          font: { size: 14, family: "'Inter', sans-serif" },
          color: "#1f2937",
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ trạng thái
  const statusChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: "Trạng thái đơn hàng",
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          ...chartOptions.scales.y.title,
          text: "Số đơn hàng",
        },
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 1,
        },
      },
      x: {
        ...chartOptions.scales.x,
        title: {
          ...chartOptions.scales.x.title,
          text: "Trạng thái",
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ doanh thu
  const revenueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: "Doanh thu 7 ngày gần nhất",
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          ...chartOptions.scales.y.title,
          text: "Doanh thu (VNĐ)",
        },
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function (tickValue: string | number) {
            return Number(tickValue).toLocaleString();
          },
        },
      },
      x: {
        ...chartOptions.scales.x,
        title: {
          ...chartOptions.scales.x.title,
          text: "Ngày",
        },
      },
    },
  };

  if (error) {
    return (
      <div className="home-container p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tổng quan</h1>
        <p className="text-red-600">Lỗi: {error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="home-container p-6">Đang tải...</div>;
  }

  return (
    <div className="home-container p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tổng quan</h1>

      {/* Card tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card bg-white p-6 rounded-lg shadow-lg">
          <FaUsers className="text-blue-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold">Người dùng</h3>
          <p className="text-2xl font-bold">{data.totalUsers}</p>
          <p className="text-sm text-gray-600">
            Đang hoạt động: {data.activeUsers}
          </p>
        </div>
        <div className="card bg-white p-6 rounded-lg shadow-lg">
          <FaBox className="text-green-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold">Đơn hàng</h3>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
          <p className="text-sm text-gray-600">
            Đã giao: {data.orderStatus.delivered} | Chưa xử lý:{" "}
            {data.orderStatus.pending}
          </p>
        </div>
        <div className="card bg-white p-6 rounded-lg shadow-lg">
          <FaMoneyBillWave className="text-yellow-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold">Doanh thu</h3>
          <p className="text-2xl font-bold">
            {data.totalRevenue.toLocaleString()} VNĐ
          </p>
          <p className="text-sm text-gray-600">Đã giao hàng</p>
        </div>
        <div className="card bg-white p-6 rounded-lg shadow-lg">
          <FaBoxOpen className="text-indigo-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold">Sản phẩm</h3>
          <p className="text-2xl font-bold">{data.totalProducts}</p>
          <p className="text-sm text-gray-600">
            Có sẵn: {data.availableProducts}
          </p>
        </div>
        <div className="card bg-white p-6 rounded-lg shadow-lg">
          <FaTruck className="text-purple-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold">Shipper</h3>
          <p className="text-2xl font-bold">{data.activeShippers}</p>
          <p className="text-sm text-gray-600">Đang hoạt động</p>
        </div>
      </div>

      {/* Biểu đồ trạng thái đơn hàng */}
      <div className="chart bg-white p-6 rounded-lg shadow-lg mb-8">
        <Bar data={statusChartData} options={statusChartOptions} />
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="chart bg-white p-6 rounded-lg shadow-lg mb-8">
        {data.revenueByDay.length === 0 ? (
          <p className="text-gray-600">
            Không có dữ liệu doanh thu trong 7 ngày qua.
          </p>
        ) : (
          <Line data={revenueChartData} options={revenueChartOptions} />
        )}
      </div>

      {/* Đơn hàng gần đây */}
      <div className="recent-orders bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>
        {data.recentOrders.length === 0 ? (
          <p className="text-gray-600">Chưa có đơn hàng nào.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-gray-700">Mã đơn</th>
                <th className="p-2 text-left text-gray-700">Khách hàng</th>
                <th className="p-2 text-left text-gray-700">Tổng tiền (VNĐ)</th>
                <th className="p-2 text-left text-gray-700">Trạng thái</th>
                <th className="p-2 text-left text-gray-700">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.orderCode}</td>
                  <td className="p-2">{order.full_name}</td>
                  <td className="p-2">{order.total_price.toLocaleString()}</td>
                  <td className="p-2">
                    {orderStatusMap.find(
                      (status) => status.key === order.status
                    )?.label || order.status}
                  </td>
                  <td className="p-2">{order.dateOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top sản phẩm bán chạy */}
      <div className="top-products bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Top 5 sản phẩm bán chạy</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-gray-600">Chưa có sản phẩm nào.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-gray-700">Tên sản phẩm</th>
                <th className="p-2 text-left text-gray-700">Đã bán</th>
                <th className="p-2 text-left text-gray-700">Giá (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.sold}</td>
                  <td className="p-2">{product.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
