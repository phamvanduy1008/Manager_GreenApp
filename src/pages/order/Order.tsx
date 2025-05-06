import React, { useState, useEffect } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { ipAddress } from "../../constants/ip";
import "../../assets/css/Order.css";

interface User {
  _id: string;
  email: string;
  password: string;
  profile: {
    full_name: string;
    username: string;
    gender: "male" | "female" | "other" | "";
    birthday: string | null;
    phone: string;
    avatar: string;
    address: string;
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    info: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: User | null;
  products: ProductItem[];
  status: "pending" | "resolved" | "processing" | "delivered" | "cancelled";
  orderCode: string;
  full_name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  fee: number;
  total_price: number;
  dateOrder: string;
  createdAt: string;
  updatedAt: string;
}

const Order: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách tất cả trạng thái
  const statusCategories = [
    { key: "pending", label: "Chưa xử lý" },
    { key: "resolved", label: "Đã xử lý" },
    { key: "processing", label: "Đang vận chuyển" },
    { key: "delivered", label: "Đã giao hàng" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  // Hàm chuyển đổi status sang tiếng Việt
  const getStatusInVietnamese = (status: string) => {
    switch (status) {
      case "pending":
        return "Chưa xử lý";
      case "resolved":
        return "Đã xử lý";
      case "processing":
        return "Đang vận chuyển";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Hàm chuyển đổi paymentMethod sang tiếng Việt
  const getPaymentMethodInVietnamese = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "qr":
        return "Chuyển khoản";
      default:
        return method || "Không xác định";
    }
  };

  // Chuẩn hóa status
  const normalizeStatus = (status: string | undefined | null): Order["status"] => {
    if (!status) return "pending";
    const cleanedStatus = status.trim().toLowerCase();
    return ["pending", "resolved", "processing", "delivered", "cancelled"].includes(cleanedStatus)
      ? (cleanedStatus as Order["status"])
      : "pending";
  };

  // Lấy tất cả đơn hàng
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${ipAddress}/api/seller`);
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dữ liệu thô từ API:", data);
      if (!data.success) {
        throw new Error(data.message || "Không thể lấy dữ liệu đơn hàng");
      }

      // Kiểm tra và ánh xạ dữ liệu
      const formattedOrders = data.sellers.map((order: any) => {
        if (!order._id) {
          console.warn("Đơn hàng thiếu _id:", order);
          return null;
        }
        return {
          _id: order._id,
          status: normalizeStatus(order.status),
          user: order.user
            ? {
                ...order.user,
                email: order.user.email || "Không xác định",
                profile: {
                  full_name: order.user.profile?.full_name || "Không xác định",
                  username: order.user.profile?.username || "",
                  gender: order.user.profile?.gender || "",
                  birthday: order.user.profile?.birthday || null,
                  phone: order.user.profile?.phone || "",
                  avatar: order.user.profile?.avatar || "",
                  address: order.user.profile?.address || "",
                },
                isActive: order.user.isActive ?? false,
                isVerified: order.user.isVerified ?? false,
                createdAt: order.user.createdAt || new Date().toISOString(),
                updatedAt: order.user.updatedAt || new Date().toISOString(),
              }
            : null,
          products: order.products?.map((item: any) => ({
            product: {
              _id: item.product?._id || "",
              name: item.product?.name || "Không xác định",
              price: item.product?.price || 0,
              image: item.product?.image || "",
              info: item.product?.info || "",
            },
            quantity: item.quantity || 1,
            price: item.price || 0,
          })) || [],
          orderCode: order.orderCode || "N/A",
          full_name: order.full_name || "Không xác định",
          phone: order.phone || "Không xác định",
          address: order.address || "Không xác định",
          paymentMethod: order.paymentMethod || "Không xác định",
          fee: order.fee || 0,
          total_price: order.total_price || 0,
          dateOrder: order.dateOrder
            ? new Date(order.dateOrder).toLocaleDateString()
            : "N/A",
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "N/A",
          updatedAt: order.updatedAt
            ? new Date(order.updatedAt).toLocaleDateString()
            : "N/A",
        };
      }).filter((order: any) => order !== null);

      console.log("Dữ liệu đơn hàng sau xử lý:", formattedOrders);
      setOrders(formattedOrders);
      setError(null);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setError(error.message || "Không thể tải danh sách đơn hàng");
    }
  };

  // Cập nhật trạng thái đơn hàng sang resolved
  const updateOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`${ipAddress}/api/seller/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật trạng thái đơn hàng");
      }
      const data = await response.json();
      if (data.success) {
        const order = orders.find((o) => o._id === orderId);
        if (order && order.user) {
          await fetch(`${ipAddress}/api/notices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: order.user._id,
              order: orderId,
              title: "Đơn hàng đã được chuẩn bị",
              message: `Đơn hàng ${order.orderCode} đã được chuẩn bị và sẽ sớm giao cho đơn vị vận chuyển.`,
              type: "resolved",
            }),
          });
        }
        fetchOrders();
        alert("Đơn hàng đã được chuẩn bị!");
        closeModal();
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // Xóa đơn hàng
  const deleteOrder = async (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        const response = await fetch(`${ipAddress}/api/seller/${orderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Lỗi khi xóa đơn hàng");
        }
        const data = await response.json();
        if (data.success) {
          fetchOrders();
          alert("Đơn hàng đã được xóa thành công!");
          closeModal();
        }
      } catch (error: any) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        alert("Không thể xóa đơn hàng");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Mở modal
  const openModal = (order: Order) => {
    console.log("Mở modal cho đơn hàng:", order);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Phân loại đơn hàng theo status
  const categorizeOrders = () => {
    const categories: {
      pending: (Order & { index: number })[];
      resolved: (Order & { index: number })[];
      processing: (Order & { index: number })[];
      delivered: (Order & { index: number })[];
      cancelled: (Order & { index: number })[];
    } = {
      pending: [],
      resolved: [],
      processing: [],
      delivered: [],
      cancelled: [],
    };

    orders.forEach((order, index) => {
      const status = normalizeStatus(order.status);
      categories[status].push({
        ...order,
        index: index + 1,
      });
    });

    console.log("Danh mục đơn hàng:", categories);
    return categories;
  };

  const categorizedOrders = categorizeOrders();

  // Tính tổng tiền của các sản phẩm
  const calculateTotalProductPrice = (products: ProductItem[]) => {
    return products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  if (error) {
    return (
      <div className="order-container p-6">
        <h1 className="order-header text-3xl font-bold text-gray-900 mb-6">
          Quản lý Đơn Hàng
        </h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="order-container p-6">
      <h1 className="order-header text-3xl font-bold text-gray-900 mb-6">
        Quản lý Đơn Hàng
      </h1>

      {statusCategories.map(({ key, label }) => (
        <div key={key} className="order-category mb-8">
          <h2 className="category-title text-xl font-semibold text-gray-800 mb-4">
            {label} ({categorizedOrders[key as keyof typeof categorizedOrders].length} đơn hàng)
          </h2>
          {categorizedOrders[key as keyof typeof categorizedOrders].length > 0 ? (
            <table className="order-table w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-4 text-left">Mã đơn hàng</th>
                  <th className="p-4 text-left">Ngày đặt</th>
                  <th className="p-4 text-left">Tổng giá (VNĐ)</th>
                  <th className="p-4 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categorizedOrders[key as keyof typeof categorizedOrders].map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-700">{order.orderCode}</td>
                    <td className="p-4 text-gray-700">{order.dateOrder}</td>
                    <td className="p-4 text-gray-700">
                      {order.total_price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        className="view-button px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={() => openModal(order)}
                      >
                        <FaEye className="inline mr-2" /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 p-4 bg-white rounded-lg shadow-lg">
              Chưa có đơn hàng nào trong trạng thái này.
            </p>
          )}
        </div>
      ))}

      {isModalOpen && selectedOrder && (
        <div className="modal">
          <div className="modal-content p-6 bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Chi tiết đơn hàng #{selectedOrder.orderCode}
            </h3>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {getStatusInVietnamese(selectedOrder.status)}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Email khách hàng
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {selectedOrder.user?.email || "Không xác định"}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Tên khách hàng (đơn hàng)
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {selectedOrder.full_name || "Không xác định"}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Số điện thoại (đơn hàng)
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {selectedOrder.phone || "Không xác định"}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Địa chỉ (đơn hàng)
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {selectedOrder.address || "Không xác định"}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {getPaymentMethodInVietnamese(selectedOrder.paymentMethod)}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">Sản phẩm</label>
              {selectedOrder.products.length > 0 ? (
                <table className="w-full bg-white border border-gray-200 rounded-md">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left text-gray-700">
                        Tên sản phẩm
                      </th>
                      <th className="p-2 text-left text-gray-700">Số lượng</th>
                      <th className="p-2 text-left text-gray-700">
                        Đơn giá (VNĐ)
                      </th>
                      <th className="p-2 text-left text-gray-700">
                        Tổng tiền (VNĐ)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((item, index) => {
                      const total = item.quantity * item.price;
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 text-gray-800">
                            {item.product.name || "Không xác định"}
                          </td>
                          <td className="p-2 text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="p-2 text-gray-800">
                            {item.price.toLocaleString()}
                          </td>
                          <td className="p-2 text-gray-800">
                            {total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                  Không có sản phẩm
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">Phí ship (VNĐ)</label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {selectedOrder.fee?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">
                Thành tiền (VNĐ)
              </label>
              <p className="p-3 bg-gray-100 rounded-md text-gray-800">
                {(
                  calculateTotalProductPrice(selectedOrder.products) +
                  (selectedOrder.fee || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div className="form-buttons mt-6 flex justify-end gap-4">
              {selectedOrder.status === "pending" && (
                <button
                  className="prepare-button px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  onClick={() => updateOrderStatus(selectedOrder._id)}
                >
                  Đã chuẩn bị hàng
                </button>
              )}
              {(selectedOrder.status === "delivered" ||
                selectedOrder.status === "cancelled") && (
                <button
                  className="delete-button px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  onClick={() => deleteOrder(selectedOrder._id)}
                >
                  <FaTrash className="inline mr-2" /> Xóa
                </button>
              )}
              <button
                className="cancel-button px-6 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                onClick={closeModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;