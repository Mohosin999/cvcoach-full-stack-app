import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { store, AppDispatch } from './store';
import { fetchUser, tokenRefresh } from './store/slices/authSlice';
import './index.css';
import Navbar from './components/Navbar';

function InitializeApp() {
  const dispatch: AppDispatch = store.dispatch as AppDispatch;

  useEffect(() => {
    dispatch(fetchUser());

    const interval = setInterval(() => {
      dispatch(tokenRefresh());
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <InitializeApp />
        <Navbar />
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
