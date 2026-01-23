import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data stays fresh (won't refetch)
      staleTime: 1000 * 60 * 5, // 5 minutes
      // How long unused data stays in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Retry failed requests
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* React Query Provider - for server state management */}
    <QueryClientProvider client={queryClient}>
      {/* React Router Provider - for routing */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* DevTools - only shows in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);