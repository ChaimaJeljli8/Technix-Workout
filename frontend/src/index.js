import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WorkoutsContextProvider } from './context/WorkoutContext';
import { AuthContextProvider } from './context/AuthContext';
import { AdminContextProvider } from './context/AdminContext'; // Import AdminContextProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AdminContextProvider>  {/* Wrap with AdminContextProvider */}
        <WorkoutsContextProvider>
          <App />
        </WorkoutsContextProvider>
      </AdminContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
