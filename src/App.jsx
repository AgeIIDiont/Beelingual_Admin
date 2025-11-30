import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    // BrowserRouter là thành phần bắt buộc để Router hoạt động
    <BrowserRouter>
      {/* AppRoutes sẽ quyết định hiển thị Login hay Dashboard tùy vào đường dẫn URL */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;