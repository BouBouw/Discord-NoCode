import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
