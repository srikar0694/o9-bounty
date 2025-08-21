import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './components/AuthProvider';
import { ToastContainer } from './components/ToastContainer';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <ToastContainer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;