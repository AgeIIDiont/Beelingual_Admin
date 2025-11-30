const theme = `
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  :root {
    --primary: #FDB913;
    --primary-dark: #e5a50a;
    --secondary: #2D3142;
    --bg-light: #FFF8E7;
    --text-main: #2D3142;
    --text-muted: #9094a6;
    --white: #ffffff;
    --success: #10B981;
    --danger: #EF4444;
  }

  * {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
  }
  
  body {
    background-color: var(--bg-light);
    color: var(--text-main);
  }

  /* --- Cards Styling --- */
  .stats-card {
    background: var(--white);
    border-radius: 20px;
    border: 1px solid rgba(253, 185, 19, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(253, 185, 19, 0.15);
    border-color: rgba(253, 185, 19, 0.4);
  }

  /* Icon trang trí mờ phía sau */
  .stats-decor-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 8rem;
    opacity: 0.05;
    transform: rotate(-15deg);
    transition: all 0.3s ease;
    z-index: -1;
    color: var(--secondary);
  }

  .stats-card:hover .stats-decor-icon {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.1;
  }

  /* Icon box nhỏ */
  .stats-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }

  /* --- Color Variants --- */
  .bg-gradient-warning { background: linear-gradient(135deg, #FDB913 0%, #FFAB00 100%); }
  .bg-gradient-orange { background: linear-gradient(135deg, #FF9F1C 0%, #F37335 100%); }
  .bg-gradient-brown { background: linear-gradient(135deg, #8B5A00 0%, #6d4600 100%); }
  .bg-gradient-dark { background: linear-gradient(135deg, #2D3142 0%, #1a1c29 100%); }

  /* --- Typography --- */
  .stats-number {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--secondary);
    letter-spacing: -1px;
  }

  .stats-label {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }
  
  .stats-sub {
    font-size: 0.9rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* --- Quick Actions --- */
  .quick-action-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    transition: all 0.2s ease;
    gap: 10px;
    font-size: 0.95rem;
  }

  .btn-honey-fill {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
  }
  
  .btn-honey-fill:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(253, 185, 19, 0.4);
    color: white;
  }

  .btn-honey-soft {
    background: #FFF8E7;
    color: #b38000;
  }

  .btn-honey-soft:hover {
    background: #ffeebf;
    color: #8B5A00;
  }

  /* Header Styles */
  .dashboard-header {
    margin-bottom: 2rem;
  }
  .welcome-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--secondary);
  }
  .welcome-name {
    color: var(--primary);
  }
`;

export default theme;