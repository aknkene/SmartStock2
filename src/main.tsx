import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Students } from './pages/Students';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Semesters } from './pages/Semesters';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/students" element={<Students />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/semesters" element={<Semesters />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
