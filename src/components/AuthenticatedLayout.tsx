import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMinimizeSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <div className="app-container">
      <aside className={`sidebar ${isSidebarMinimized ? "minimized" : ""}`}>
        <h2 className="sidebar-title" onClick={toggleMinimizeSidebar} style={{ cursor: "pointer" }}>
          GreenApp
        </h2>
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}>
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="sidebar-text">Trang chủ</span>
          </Link>
          <Link to="/product" className={`sidebar-link ${location.pathname === "/product" ? "active" : ""}`}>
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span className="sidebar-text">Sản phẩm</span>
          </Link>
          <Link to="/order" className={`sidebar-link ${location.pathname === "/order" ? "active" : ""}`}>
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="sidebar-text">Đơn hàng</span>
          </Link>
          <Link to="/price" className={`sidebar-link ${location.pathname === "/price" ? "active" : ""}`}>
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="sidebar-text">Giá cả</span>
          </Link>
          <Link to="/message" className={`sidebar-link ${location.pathname === "/message" ? "active" : ""}`}>
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="sidebar-text">Tin nhắn</span>
          </Link>

          <button onClick={handleLogout} className="sidebar-link logout-button">
            <svg
              className="sidebar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="sidebar-text">Đăng xuất</span>
          </button>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;