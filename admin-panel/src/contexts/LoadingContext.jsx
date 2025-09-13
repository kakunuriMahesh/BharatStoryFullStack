import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);

  const setLoading = useCallback((key, isLoading, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { loading: isLoading, message }
    }));
  }, []);

  const setGlobalLoadingState = useCallback((isLoading, message = '') => {
    setGlobalLoading(isLoading);
    if (isLoading) {
      setLoadingStates(prev => ({
        ...prev,
        global: { loading: isLoading, message }
      }));
    } else {
      setLoadingStates(prev => {
        const { global, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key]?.loading || false;
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  const clearLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
    setGlobalLoading(false);
  }, []);

  const value = {
    loadingStates,
    globalLoading,
    setLoading,
    setGlobalLoadingState,
    isLoading,
    getLoadingMessage,
    clearLoading,
    clearAllLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Higher-order component for loading states
export const withLoading = (WrappedComponent, loadingKey) => {
  return function WithLoadingComponent(props) {
    const { isLoading, getLoadingMessage } = useLoading();
    const loading = isLoading(loadingKey);
    const message = getLoadingMessage(loadingKey);

    return (
      <WrappedComponent
        {...props}
        loading={loading}
        loadingMessage={message}
      />
    );
  };
};

// Hook for API calls with loading
export const useApiWithLoading = () => {
  const { setLoading, isLoading, getLoadingMessage } = useLoading();

  const executeWithLoading = useCallback(async (key, apiCall, message = '') => {
    try {
      setLoading(key, true, message);
      const result = await apiCall();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  return {
    executeWithLoading,
    isLoading,
    getLoadingMessage
  };
};
