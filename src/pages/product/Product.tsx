import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { ipAddress } from "../../constants/ip";
import "../../assets/css/Product.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  info: string;
  image: string;
  status: string;
  sold: number;
  category: string;
}

interface Category {
  _id: string;
  name: string;
}

const Product: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    info: "",
    status: "available",
    sold: 0,
    category: "",
    image: null as File | null,
  });

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${ipAddress}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      alert("Không thể tải danh sách sản phẩm");
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
    fetchProducts();
    fetchCategories();
  }, []);

  // Lọc sản phẩm theo danh mục
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Xử lý mở modal để thêm hoặc sửa sản phẩm
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        info: product.info,
        status: product.status,
        sold: product.sold,
        category: product.category,
        image: null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: 0,
        info: "",
        status: "available",
        sold: 0,
        category: categories[0]?._id || "",
        image: null,
      });
    }
    setIsModalOpen(true);
  };

  // Xử lý đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      price: 0,
      info: "",
      status: "available",
      sold: 0,
      category: "",
      image: null,
    });
  };

  // Xử lý thay đổi dữ liệu form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "sold" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  // Xử lý thêm hoặc cập nhật sản phẩm
  const handleSubmit = async () => {
    setIsLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("info", formData.info);
    data.append("status", formData.status);
    data.append("sold", formData.sold.toString());
    data.append("category", formData.category);
    if (formData.image) {
      data.append("image", formData.image);
    } else if (editingProduct && !formData.image) {
      // Giữ nguyên ảnh cũ khi không chọn ảnh mới khi sửa
      data.append("image", editingProduct.image);
    }

    try {
      const url = editingProduct
        ? `${ipAddress}/api/products/${editingProduct._id}`
        : `${ipAddress}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        fetchProducts();
        closeModal();
        alert(
          editingProduct
            ? "Cập nhật sản phẩm thành công"
            : "Thêm sản phẩm thành công"
        );
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      alert("Đã xảy ra lỗi khi lưu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const response = await fetch(`${ipAddress}/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        fetchProducts();
        alert("Xóa sản phẩm thành công");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Đã xảy ra lỗi khi xóa sản phẩm");
    }
  };

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý sản phẩm</h2>
        <div>
          <select
            className="filter-select"
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
          <button className="add-button" onClick={() => openModal()}>
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Thông tin</th>
            <th>Trạng thái</th>
            <th>Đã bán</th>
            <th>Danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              <td>
                {product.image ? (
                  <img
                    src={`${ipAddress}/${product.image}`} // Sử dụng đường dẫn đầy đủ từ database
                    alt={product.name}
                  />
                ) : (
                  "Không có ảnh"
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.price.toLocaleString()} VNĐ</td>
              <td>{product.info || "Không có thông tin"}</td>
              <td>
                {product.status === "available" ? "Còn hàng" : "Hết hàng"}
              </td>
              <td>{product.sold}</td>
              <td>
                {categories.find((cat) => cat._id === product.category)?.name ||
                  "Không xác định"}
              </td>
              <td className="action-buttons">
                <button
                  className="edit-button"
                  onClick={() => openModal(product)}
                >
                  Sửa
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(product._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Giá</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Thông tin</label>
              <textarea
                name="info"
                value={formData.info}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="available">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Đã bán</label>
              <input
                type="number"
                name="sold"
                value={formData.sold}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Hình ảnh</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {editingProduct && editingProduct.image && !formData.image && (
                <p>
                  Hình ảnh hiện tại:{" "}
                  <img
                    src={`${ipAddress}/${editingProduct.image}`} // Sử dụng đường dẫn đầy đủ từ database
                    alt="Current"
                    style={{ width: "50px", height: "50px" }}
                  />
                </p>
              )}
            </div>
            <div className="form-buttons">
              <button
                className="cancel-button"
                onClick={closeModal}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                className="save-button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="spinner" /> : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;