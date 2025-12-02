import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';
import logo from '../../assets/logoLogin.jpg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result && result.success) {
        const user = result.user || result.data?.user || result;
        const role = user.role || user.roles;

        let isAdmin = false;
        if (Array.isArray(role)) {
          isAdmin = role.includes('admin') || role.includes('ADMIN');
        } else {
          isAdmin = role === 'admin' || role === 'ADMIN';
        }

        if (!isAdmin) {
          setError('Bạn không có quyền truy cập hệ thống quản trị. Chỉ dành cho Admin.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);

      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      const message = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="container-fluid d-flex align-items-center justify-content-center position-relative" 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eadf49e7 0%, #fedf11ee 50%, #ffd013ff 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        top: '-100px',
        left: '-100px',
        filter: 'blur(60px)'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        bottom: '-80px',
        right: '-80px',
        filter: 'blur(60px)'
      }}></div>

      <div 
        className="bg-white rounded-4 shadow-lg p-5 position-relative" 
        style={{ 
          maxWidth: '460px', 
          width: '100%',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <img 
            src={logo} 
            alt="Beelingual Logo" 
            style={{ 
              maxWidth: '180px', 
              width: '100%',
            }}
          />
        </div>

        {/* Title */}
        <h3 
          className="text-center mb-4 fw-bold" 
          style={{ 
            fontSize: '44px',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #fef244e7 0%, #fedf11ee 40%, #1f0f4fff 50%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          }}
        >
          Beelingual
        </h3>

        {/* Error Alert */}
        {error && (
          <div 
            className="alert alert-danger d-flex align-items-start mb-4" 
            role="alert"
            style={{
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#fee2e2',
              borderLeft: '4px solid #dc2626',
              animation: 'shake 0.5s'
            }}
          >
            <i className="fas fa-exclamation-circle me-2 mt-1" style={{ color: '#dc2626' }}></i>
            <div style={{ color: '#7f1d1d', fontSize: '14px', fontWeight: '500' }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="form-label fw-semibold" 
              style={{ 
                color: '#334155',
                fontSize: '14px',
                marginBottom: '8px'
              }}
            >
              Tên đăng nhập
            </label>
            <div className="input-group" style={{ height: '48px' }}>
              <span 
                className="input-group-text" 
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px'
                }}
              >
                <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
              </span>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={loading}
                style={{ 
                  border: '2px solid #e2e8f0',
                  borderLeft: 'none',
                  borderRadius: '0 12px 12px 0',
                  fontSize: '15px',
                  padding: '12px 16px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fbbf24';
                  e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                  e.target.previousSibling.style.borderColor = '#fbbf24';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.previousSibling.style.borderColor = '#e2e8f0';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="form-label fw-semibold" 
              style={{ 
                color: '#334155',
                fontSize: '14px',
                marginBottom: '8px'
              }}
            >
              Mật khẩu
            </label>
            <div className="input-group position-relative" style={{ height: '48px' }}>
              <span 
                className="input-group-text" 
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px'
                }}
              >
                <i className="fas fa-lock" style={{ color: '#94a3b8' }}></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
                style={{ 
                  border: '2px solid #e2e8f0',
                  borderLeft: 'none',
                  borderRight: 'none',
                  fontSize: '15px',
                  padding: '12px 16px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fbbf24';
                  e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                  e.target.previousSibling.style.borderColor = '#fbbf24';
                  e.target.parentElement.querySelector('.password-toggle').style.borderColor = '#fbbf24';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.previousSibling.style.borderColor = '#e2e8f0';
                  e.target.parentElement.querySelector('.password-toggle').style.borderColor = '#e2e8f0';
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  height: '100%',
                  border: '2px solid #e2e8f0',
                  borderLeft: 'none',
                  borderRadius: '0 12px 12px 0',
                  backgroundColor: '#f8fafc',
                  padding: '0 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: '#94a3b8' }}></i>
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="rememberMe" 
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  borderColor: '#d1d5db'
                }}
              />
              <label 
                className="form-check-label" 
                htmlFor="rememberMe"
                style={{ 
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a 
              href="#" 
              className="text-decoration-none"
              style={{ 
                color: '#1e40af',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#f59e0b'}
              onMouseLeave={(e) => e.target.style.color = '#1e40af'}
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 fw-bold"
            disabled={loading}
            style={{ 
              fontSize: '16px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: 'none',
              color: '#1e293b',
              boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(251, 191, 36, 0.4)';
            }}
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
          <p className="mb-0" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
            © 2025 Beelingual. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .form-control:disabled {
          background-color: #f1f5f9 !important;
          cursor: not-allowed;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .form-check-input:checked {
          background-color: #f59e0b;
          border-color: #f59e0b;
        }

        .form-check-input:focus {
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
        }

        /* Smooth transitions */
        * {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Login;