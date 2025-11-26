import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy redirect path từ state (nếu có)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // Redirect về trang trước đó hoặc dashboard
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="container-fluid d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="bg-white rounded-4 shadow-lg p-5" style={{ maxWidth: '450px', width: '100%' }}>
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark mb-2">BEELINGUAL</h2>
          <p className="text-muted">Hệ thống quản trị</p>
        </div>

        <h3 className="text-center mb-4 fw-bold text-dark">Đăng nhập</h3>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-medium text-dark">
              Tên đăng nhập
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-user text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={loading}
                style={{ borderLeft: 'none' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-medium text-dark">
              Mật khẩu
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-lock text-muted"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
                style={{ borderLeft: 'none' }}
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />
              <label className="form-check-label text-muted" htmlFor="rememberMe">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="#" className="text-decoration-none text-muted small">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold py-2"
            disabled={loading}
            style={{ fontSize: '16px' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Đăng nhập
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-muted small mb-0">
            © 2024 Beelingual. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

