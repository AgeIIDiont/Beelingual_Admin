import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PageContext = createContext();

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within PageProvider');
  }
  return context;
};

export const PageProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [actionButtons, setActionButtons] = useState(null);

  // Memoize setPageInfo to prevent unnecessary re-renders
  const setPageInfo = useCallback(({ title, description, actions }) => {
    setPageTitle(title || '');
    setPageDescription(description || '');
    setActionButtons(actions || null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      pageTitle,
      pageDescription,
      actionButtons,
      setPageInfo,
    }),
    [pageTitle, pageDescription, actionButtons, setPageInfo]
  );

  return (
    <PageContext.Provider value={contextValue}>
      {children}
    </PageContext.Provider>
  );
};

