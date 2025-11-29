const theme = `
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  body {
    background: #FFF8E7;
  }
  
  /* Color Classes */
  .bg-warning-honey {
    background-color: #FDB913;
  }
  
  .bg-orange-honey {
    background-color: #FF9F1C;
  }
  
  .bg-brown-honey {
    background-color: #8B5A00;
  }
  
  .bg-dark-honey {
    background-color: #2D3142;
  }
  
  .text-honey {
    color: #FDB913;
  }
  
  /* Card Styles */
  .header-card {
    background: white;
    border: none;
    transition: all 0.3s ease;
  }
  
  .header-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .stats-card {
    transition: all 0.3s ease;
    border: 1px solid rgba(253, 185, 19, 0.1);
  }
  
  .stats-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(253, 185, 19, 0.2);
    border-color: rgba(253, 185, 19, 0.3);
  }
  
  .topic-card {
    transition: all 0.3s ease;
    border: 1px solid rgba(253, 185, 19, 0.1);
  }
  
  .topic-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(253, 185, 19, 0.2);
    border-color: rgba(253, 185, 19, 0.3);
  }
  
  .stats-mini-card {
    background: white;
    border: 1px solid rgba(253, 185, 19, 0.1);
    transition: all 0.3s ease;
  }
  
  .stats-mini-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(253, 185, 19, 0.15);
  }
  
  /* Avatar */
  .admin-avatar {
    border: 3px solid #FDB913;
    box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
    transition: all 0.3s ease;
  }
  
  .admin-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(253, 185, 19, 0.4);
  }
  
  /* Typography */
  .brand-logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: #2D3142;
    letter-spacing: 0.5px;
  }
  
  .welcome-text {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2D3142;
  }
  
  .welcome-accent {
    color: #FDB913;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 800;
    color: #2D3142;
  }
  
  /* Buttons */
  .btn-honey-primary {
    background: linear-gradient(135deg, #FDB913 0%, #FF9F1C 100%);
    color: white;
    border: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .btn-honey-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(253, 185, 19, 0.4);
    color: white;
  }
  
  .btn-honey-secondary {
    background: white;
    color: #2D3142;
    border: 2px solid #FDB913;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .btn-honey-secondary:hover {
    background: #FDB913;
    color: white;
  }
  
  .btn-honey-outline {
    background: white;
    color: #2D3142;
    border: 2px solid #FDB913;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .btn-honey-outline:hover {
    background: #FDB913;
    color: white;
    border-color: #FDB913;
  }
  
  .quick-action-btn {
    transition: all 0.3s ease;
    border: none;
    font-weight: 600;
  }
  
  .quick-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  /* Forms */
  .search-input {
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    background: white;
  }
  
  .search-input:focus {
    border-color: #FDB913;
    box-shadow: 0 0 0 0.2rem rgba(253, 185, 19, 0.25);
    outline: none;
  }
  
  .filter-select {
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    background: white;
  }
  
  .filter-select:focus {
    border-color: #FDB913;
    box-shadow: 0 0 0 0.2rem rgba(253, 185, 19, 0.25);
    outline: none;
  }
  
  /* Badges */
  .badge-active {
    background: #4caf50;
    color: white;
  }
  
  .badge-inactive {
    background: #9e9e9e;
    color: white;
  }
  
  /* Icons */
  .topic-icon {
    transition: all 0.3s ease;
  }
  
  .topic-card:hover .topic-icon {
    transform: scale(1.1) rotate(5deg);
  }
  
  /* Loading */
  .spinner-border {
    width: 3rem;
    height: 3rem;
    border-width: 0.3rem;
    color: #FDB913;
  }
  
  /* Alerts */
  .alert-honey {
    background: white;
    border: none;
    border-left: 4px solid #FDB913;
    color: #2D3142;
  }
  
  /* Dropdowns */
  .dropdown-menu {
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dropdown-item {
    padding: 0.6rem 1.2rem;
    transition: all 0.2s ease;
    border-radius: 4px;
  }
  
  .dropdown-item:hover {
    background: #FFF8E7;
    color: #2D3142;
  }
  
  /* Level Badge */
  .level-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .level-A {
    background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
    color: white;
  }
  
  .level-B {
    background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
    color: white;
  }
  
  .level-C {
    background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
    color: white;
  }
  
  /* Image Styles */
  .topic-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .topic-card:hover .topic-image {
    transform: scale(1.05);
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
    border-radius: 0.75rem;
  }
`;

export default theme;