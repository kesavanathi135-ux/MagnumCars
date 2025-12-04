import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, DollarSign, Settings as SettingsIcon, LogOut, FileText } from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('magnum_auth_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('magnum_auth_token');
    // Dispatch event to update Layout immediately
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Car, label: 'Cars', path: '/admin/cars' },
    { icon: FileText, label: 'Bookings', path: '/admin/bookings' },
    { icon: DollarSign, label: 'Revenue', path: '/admin/revenue' },
    { icon: Calendar, label: 'Calendar', path: '/admin/calendar' },
    { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-yellow-400">ADMIN PANEL</h2>
          <p className="text-xs text-gray-400">Magnum Self Drive</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname === item.path ? 'bg-yellow-400 text-black font-bold shadow-md' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 px-4 py-2 w-full transition hover:bg-slate-800 rounded-lg">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};
