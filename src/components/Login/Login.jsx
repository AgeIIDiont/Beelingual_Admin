import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { login, logout, forgotPassword, resetPassword } from '../../services/authService';
import logo from '../../assets/logoLogin.jpg';
import './Login.scss';

const Login = () => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameReadOnly, setIsUsernameReadOnly] = useState(true);
  const [isPasswordReadOnly, setIsPasswordReadOnly] = useState(true);

  // Forgot Password State
  const [view, setView] = useState('login'); // 'login', 'forgot', 'otp', 'reset'
  const [resetData, setResetData] = useState({ username: '', otp: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Gọi API Login (Cookie sẽ tự động được set vào browser nếu thành công)
      const result = await login(formData.username, formData.password);

      if (result && result.success) {
        const user = result.user || result.data?.user || result;
        const role = user.role || user.roles;

        // 2. Kiểm tra quyền Admin
        let isAdmin = false;
        if (Array.isArray(role)) {
          isAdmin = role.includes('admin') || role.includes('ADMIN');
        } else {
          isAdmin = role === 'admin' || role === 'ADMIN' || role === 'super_admin' || role === 'SUPER_ADMIN';
        }

        if (!isAdmin) {
          setError('Bạn không có quyền truy cập hệ thống quản trị. Chỉ dành cho Admin.');

          // QUAN TRỌNG: Gọi API logout ngay lập tức để xóa cookie vừa nhận
          await logout();
          return;
        }

        // 3. Chuyển hướng và reload trang để đảm bảo state được reset hoàn toàn
        // Add small delay to ensure localStorage is persisted before reload
        setTimeout(() => {
          window.location.href = from;
        }, 100);

      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      console.error("Login Error:", err);
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      await forgotPassword(resetData.username);
      setMessage({ type: 'success', text: 'OTP đã được gửi đến email của bạn.' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
        setView('otp');
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể gửi OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!resetData.otp || resetData.otp.length < 6) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã OTP hợp lệ.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setView('reset');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (resetData.newPassword !== resetData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    if (resetData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetData.username, resetData.otp, resetData.newPassword);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập.' });
      setTimeout(() => {
        setView('login');
        setFormData(prev => ({ ...prev, username: resetData.username }));
        setResetData({ username: '', otp: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  // Render Login Form
  const renderLoginForm = () => (

    <form onSubmit={handleSubmit} autoComplete="off">
      {/* Hack: Dummy inputs to trick browser autofill */}
      <input type="text" style={{ display: 'none' }} name="fake_username_to_prevent_autofill" />
      <input type="password" style={{ display: 'none' }} name="fake_password_to_prevent_autofill" />
      {/* Username */}
      <div className="mb-4">
        <label htmlFor="username" className="form-label fw-semibold" style={{ color: '#334155', fontSize: '14px', marginBottom: '8px' }}>Tên đăng nhập</label>
        <div className="input-group" style={{ height: '48px' }}>
          <span className="input-group-text" style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRight: 'none', borderRadius: '12px 0 0 12px' }}>
            <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
          </span>
          <input
            type="text" className="form-control" id="login-username" name="username"
            value={formData.username} onChange={handleChange}
            placeholder="Nhập tên đăng nhập" required disabled={loading}
            readOnly={isUsernameReadOnly}
            autoComplete="off"
            style={{ border: '2px solid #e2e8f0', borderLeft: 'none', borderRadius: '0 12px 12px 0', fontSize: '15px', padding: '12px 16px', transition: 'all 0.2s' }}
            onFocus={(e) => { setIsUsernameReadOnly(false); e.target.style.borderColor = '#fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)'; e.target.previousSibling.style.borderColor = '#fbbf24'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.borderColor = '#e2e8f0'; }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#334155', fontSize: '14px', marginBottom: '8px' }}>Mật khẩu</label>
        <div className="input-group position-relative" style={{ height: '48px' }}>
          <span className="input-group-text" style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRight: 'none', borderRadius: '12px 0 0 12px' }}>
            <i className="fas fa-lock" style={{ color: '#94a3b8' }}></i>
          </span>
          <input
            type={showPassword ? "text" : (isPasswordReadOnly ? "text" : "password")} // FIX: Init as text to fool browser
            className="form-control" id="login-password" name="user_pwd_field_random" // FIX: Obfuscated name
            value={formData.password}
            onChange={(e) => {
              // Must handle the fact name changed
              handleChange({ target: { name: 'password', value: e.target.value } });
            }}
            placeholder="Nhập mật khẩu" required disabled={loading}
            readOnly={isPasswordReadOnly}
            autoComplete="new-password"
            style={{ border: '2px solid #e2e8f0', borderLeft: 'none', borderRight: 'none', fontSize: '15px', padding: '12px 16px', transition: 'all 0.2s' }}
            onFocus={(e) => {
              setIsPasswordReadOnly(false);
              e.target.type = showPassword ? "text" : "password"; // Switch to password on focus
              e.target.style.borderColor = '#fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)'; e.target.previousSibling.style.borderColor = '#fbbf24'; e.target.parentElement.querySelector('.password-toggle').style.borderColor = '#fbbf24';
            }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.borderColor = '#e2e8f0'; e.target.parentElement.querySelector('.password-toggle').style.borderColor = '#e2e8f0'; }}
          />
          <button
            type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '0', top: '0', height: '100%', border: '2px solid #e2e8f0', borderLeft: 'none', borderRadius: '0 12px 12px 0', backgroundColor: '#f8fafc', padding: '0 16px', cursor: 'pointer', transition: 'all 0.2s', zIndex: 10 }}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: '#94a3b8' }}></i>
          </button>
        </div>
        <div className="text-end mt-2">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0"
            style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}
            onClick={() => setView('forgot')}
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit" className="btn w-100 fw-bold" disabled={loading}
        style={{ fontSize: '16px', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', color: '#1e293b', boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px' }}
        onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.5)'; } }}
        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(251, 191, 36, 0.4)'; }}
      >
        {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Đang đăng nhập...</> : <><i className="fas fa-sign-in-alt me-2"></i>Đăng nhập</>}
      </button>
    </form>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgotSubmit}>
      <h4 className="text-center mb-3" style={{ color: '#334155' }}>Khôi phục mật khẩu</h4>
      <p className="text-center mb-4 text-muted small">Nhập tên đăng nhập để nhận mã OTP qua email</p>

      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: '#334155', fontSize: '14px' }}>Tên đăng nhập</label>
        <input
          type="text" className="form-control"
          value={resetData.username}
          onChange={(e) => setResetData({ ...resetData, username: e.target.value })}
          required disabled={loading}
          autoComplete="off"
          placeholder="Nhập username của bạn"
          style={{ padding: '12px', borderRadius: '8px' }}
        />
      </div>

      <button
        type="submit" className="btn w-100 fw-bold mb-3" disabled={loading}
        style={{ padding: '12px', borderRadius: '8px', background: '#fbbf24', border: 'none', color: '#1e293b' }}
      >
        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
      </button>

      <button
        type="button"
        className="btn w-100 text-muted"
        onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
        style={{ background: 'transparent', border: 'none' }}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại đăng nhập
      </button>
    </form>
  );

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = resetData.otp.split('');
    // Ensure array has size 6
    while (newOtp.length < 6) newOtp.push('');

    newOtp[index] = value.substring(value.length - 1); // Take last char
    const newOtpString = newOtp.join('').substring(0, 6);

    setResetData({ ...resetData, otp: newOtpString });

    // Focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!resetData.otp[index] && index > 0) {
        // If empty and backspaced, move to previous
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!data || isNaN(data)) return;

    const pastedOtp = data.substring(0, 6);
    setResetData({ ...resetData, otp: pastedOtp });

    // Focus last filled
    const lastIndex = Math.min(pastedOtp.length, 6) - 1;
    if (lastIndex >= 0) {
      const input = document.getElementById(`otp-${lastIndex}`);
      if (input) input.focus();
    }
  };

  const renderOtpForm = () => (
    <form onSubmit={handleOtpSubmit}>
      <h4 className="text-center mb-3" style={{ color: '#334155' }}>Nhập mã OTP</h4>
      <p className="text-center mb-4 text-muted small">Mã OTP (6 số) đã được gửi đến email của bạn</p>

      <div className="mb-4 d-flex justify-content-between gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            className="form-control text-center fw-bold"
            value={resetData.otp[index] || ''}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            required={index === 0} // Only first required for HTML5 validation roughly, but we check manually too
            maxLength={1}
            style={{
              width: '48px',
              height: '56px',
              fontSize: '24px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#334155'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      <button
        type="submit" className="btn w-100 fw-bold mb-3" disabled={loading}
        style={{ padding: '12px', borderRadius: '8px', background: '#fbbf24', border: 'none', color: '#1e293b' }}
      >
        Tiếp tục
      </button>

      <button
        type="button"
        className="btn w-100 text-muted"
        onClick={() => { setView('forgot'); setMessage({ type: '', text: '' }); }}
        style={{ background: 'transparent', border: 'none' }}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại nhập email
      </button>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleResetSubmit}>
      <h4 className="text-center mb-3" style={{ color: '#334155' }}>Đặt lại mật khẩu</h4>
      <p className="text-center mb-4 text-muted small">Nhập mật khẩu mới cho tài khoản</p>

      <div className="mb-3">
        <label className="form-label fw-semibold">Mật khẩu mới</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"} className="form-control"
            value={resetData.newPassword}
            onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
            required disabled={loading}
            autoComplete="new-password"
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            style={{ padding: '12px', borderRadius: '8px' }}
          />
          <button
            type="button" className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
        <input
          type="password" className="form-control"
          value={resetData.confirmPassword}
          onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
          required disabled={loading}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          style={{ padding: '12px', borderRadius: '8px' }}
        />
      </div>

      <button
        type="submit" className="btn w-100 fw-bold mb-3" disabled={loading}
        style={{ padding: '12px', borderRadius: '8px', background: '#fbbf24', border: 'none', color: '#1e293b' }}
      >
        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
      </button>
      <button
        type="button"
        className="btn w-100 text-muted"
        onClick={() => { setView('otp'); setMessage({ type: '', text: '' }); }}
        style={{ background: 'transparent', border: 'none' }}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại nhập OTP
      </button>
    </form>
  );

  return (
    <div
      className="login-page container-fluid d-flex align-items-center justify-content-center position-relative"
      style={{
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles - GIỮ NGUYÊN CODE UI CỦA BẠN */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', top: '-100px', left: '-100px', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '50%', bottom: '-80px', right: '-80px', filter: 'blur(60px)' }}></div>

      <div
        className="bg-white rounded-4 shadow-lg p-5 position-relative"
        style={{ maxWidth: '460px', width: '100%', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <img src={logo} alt="Beelingual Logo" style={{ maxWidth: '180px', width: '100%' }} />
        </div>

        {/* Title */}
        <h3 className="text-center mb-4 fw-bold" style={{ fontSize: '44px', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #fef244e7 0%, #fedf11ee 40%, #1f0f4fff 50%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
          Beelingual
        </h3>

        {/* Status Message */}
        {(error || message.text) && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} d-flex align-items-start mb-4`} role="alert" style={{ borderRadius: '12px', border: 'none' }}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2 mt-1`}></i>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{error || message.text}</div>
          </div>
        )}

        {view === 'login' && renderLoginForm()}
        {view === 'forgot' && renderForgotForm()}
        {view === 'otp' && renderOtpForm()}
        {view === 'reset' && renderResetForm()}

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="mb-0" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>© 2025 Beelingual. All rights reserved.</p>
        </div>
      </div>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .form-control:disabled { background-color: #f1f5f9 !important; cursor: not-allowed; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        * { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
      `}</style>
    </div>
  );
};

export default Login;