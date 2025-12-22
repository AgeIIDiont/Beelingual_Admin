import React from 'react';

const TABS = [
  { id: 'hero', label: 'Hero', icon: 'fa-home' },
  { id: 'features', label: 'Features', icon: 'fa-star' },
  { id: 'download', label: 'Download', icon: 'fa-mobile-alt' },
  { id: 'footer', label: 'Footer', icon: 'fa-file-alt' },
  { id: 'theme', label: 'Theme', icon: 'fa-palette' },
  { id: 'chatbot', label: 'Chatbot', icon: 'fa-robot' },
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <ul className="lp-tabs" role="tablist">
      {TABS.map((tab) => (
        <li key={tab.id} className="lp-tab-item">
          <button
            className={`lp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <i className={`fas ${tab.icon} lp-tab-icon`}></i>
            <span>{tab.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TabNavigation;
