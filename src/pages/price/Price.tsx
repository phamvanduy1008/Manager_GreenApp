import React, { useState, useEffect } from "react";
import { FaSpinner, FaEdit } from "react-icons/fa";
import { ipAddress } from "../../constants/ip";
import "../../assets/css/Price.css";

interface Plant {
  _id: string;
  name: string;
  avgPriceYesterday: number;
  avgPriceNow: number;
  category: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

const Price: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Lấy danh sách cây trồng
  const fetchPlants = async () => {
    try {
      const response = await fetch(`${ipAddress}/api/plants`);
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cây trồng:", error);
      alert("Không thể tải danh sách cây trồng");
    }
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ipAddress}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      alert("Không thể tải danh sách danh mục");
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchCategories();
  }, []);

  // Lọc cây trồng theo danh mục
  const filteredPlants =
    selectedCategory === "all"
      ? plants
      : plants.filter((plant) => plant.category._id === selectedCategory);

  // Mở modal để chỉnh sửa giá
  const openModal = (plant: Plant) => {
    setEditingPlant(plant);
    setNewPrice(plant.avgPriceNow);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlant(null);
    setNewPrice(0);
  };

  // Lưu giá mới
  const handleSavePrice = async () => {
    if (!editingPlant || newPrice < 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${ipAddress}/api/plants/${editingPlant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avgPriceYesterday: editingPlant.avgPriceNow,
          avgPriceNow: newPrice,
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchPlants();
        closeModal();
        alert("Cập nhật giá thành công");
      } else {
        alert(result.message || "Cập nhật giá thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giá:", error);
      alert("Đã xảy ra lỗi khi cập nhật giá");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-container">
      <div className="product-header">
        <h2 className="text-2xl font-semibold text-gray-800">Quản lý giá cây trồng</h2>
        <div className="flex items-center gap-4">
          <select
            className="filter-select p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="product-table w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-3 text-left">Tên cây trồng</th>
            <th className="p-3 text-left">Giá hôm qua (VNĐ)</th>
            <th className="p-3 text-left">Giá hiện tại (VNĐ)</th>
            <th className="p-3 text-left">Danh mục</th>
            <th className="p-3 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlants.map((plant) => (
            <tr key={plant._id} className="border-b hover:bg-gray-50">
              <td className="p-3">{plant.name}</td>
              <td className="p-3">{plant.avgPriceYesterday.toLocaleString()}</td>
              <td className="p-3">{plant.avgPriceNow.toLocaleString()}</td>
              <td className="p-3">{plant.category.name || "Không xác định"}</td>
              <td className="p-3">
                <button
                  className="edit-button p-2 rounded-md text-white hover:bg-green-600 transition-colors"
                  onClick={() => openModal(plant)}
                >
                  <FaEdit className="inline mr-1" /> Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && editingPlant && (
        <div className="modal">
          <div className="modal-content p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Cập nhật giá cho {editingPlant.name}
            </h3>
            <div className="form-group">
              <label className="block text-gray-700 mb-2">Giá hiện tại (VNĐ)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div className="form-buttons mt-6 flex justify-end gap-4">
              <button
                className="cancel-button p-2 px-4 rounded-md text-white hover:bg-gray-600 transition-colors"
                onClick={closeModal}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                className="save-button p-2 px-4 rounded-md text-white hover:bg-green-600 transition-colors"
                onClick={handleSavePrice}
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="spinner inline mr-1" /> : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Price;