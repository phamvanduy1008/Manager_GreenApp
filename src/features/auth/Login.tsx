import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { ipAddress } from '../../constants/ip';
import '../../assets/css/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${ipAddress}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi đăng nhập');
      }

      if (data.success) {
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        navigate('/'); // Điều hướng đến trang Home sau khi đăng nhập
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập admin:', error);
      alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-placeholder">GA</div>
        <h2 className="login-title">Đăng nhập Admin</h2>
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            disabled={isLoading}
          />
        </div>
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleLogin} className="login-button" disabled={isLoading}>
          {isLoading ? <FaSpinner className="spinner" /> : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
};

export default Login;