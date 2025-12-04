import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';

export const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Robust check for Admin Token
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('magnum_auth_token');
      setIsAdmin(!!token);
    };

    checkAdmin();

    // Listen for storage events (in case of logout in another tab)
    window.addEventListener('storage', checkAdmin);
    
    // Custom event listener for immediate UI update within same tab
    window.addEventListener('auth-change', checkAdmin);

    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('auth-change', checkAdmin);
    };
  }, [location]); // Also re-check on route change

  const handleLogoDoubleClick = () => {
    if (isAdmin) {
        navigate('/admin/dashboard');
    } else {
        navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="select-none cursor-pointer group"
            onDoubleClick={handleLogoDoubleClick}
            title="Double click for Admin Access"
          >
            <h1 className="text-2xl font-bold tracking-tighter text-yellow-400 group-hover:text-yellow-300 transition">MAGNUM</h1>
            <p className="text-xs text-gray-400 tracking-widest">SELF DRIVE CARS</p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
            <Link to="/cars" className="hover:text-yellow-400 transition">Our Cars</Link>
            
            {/* Admin Link ONLY visible if logged in */}
            {isAdmin && (
               <Link to="/admin/dashboard" className="text-yellow-400 font-bold border border-yellow-400 px-3 py-1 rounded hover:bg-yellow-400 hover:text-black transition animate-fade-in">
                 Admin Panel
               </Link>
            )}
            
            <a href="tel:+917845012402" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full transition font-medium">
              <Phone size={18} />
              <span>+91 7845012402</span>
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 p-4 space-y-4">
            <Link to="/" className="block hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/cars" className="block hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Our Cars</Link>
            {isAdmin && (
               <Link to="/admin/dashboard" className="block text-yellow-400 font-bold" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
            )}
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-200px)]">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">MAGNUM SELF DRIVE CARS</h3>
            <p className="text-sm">
              Premium self-drive car rental service in Tirunelveli and surrounding districts. 
              Reliable, affordable, and safe.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <p className="text-sm mb-2">L133, Josy Cottage, Anbu Nagar Water Tank 2nd Street,</p>
            <p className="text-sm mb-2">Perumalpuram, Palayamkottai, Tirunelveli - 627007</p>
            <p className="text-sm text-white">Phone: +91 7845012402</p>
            <p className="text-sm text-white">Email: carsmagnum583@gmail.com</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/cars" className="hover:text-white">All Cars</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-gray-800 text-xs">
          © {new Date().getFullYear()} Magnum Self Drive Cars. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
