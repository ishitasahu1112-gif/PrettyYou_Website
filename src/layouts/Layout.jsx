import { Outlet, Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from '../components/CartDrawer';
import ProfileDropdown from '../components/ProfileDropdown';
import NotificationDropdown from '../components/NotificationDropdown';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import logo from '../assets/logo.png';

const Layout = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const { currentUser, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [window.location.pathname]);

    return (
        <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50 selection:bg-stone-200 overflow-x-hidden">
            {/* Header */}
            <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4 md:py-6'} px-4 sm:px-6 lg:px-12 flex justify-between items-center`}>
                <div className="flex items-center gap-4">
                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden text-stone-800 p-1 cursor-pointer z-50 relative"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Navigation"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    <Link to="/" className="flex items-center gap-2 z-50 relative">
                        <img src={logo} alt="Pretty You" className={`transition-all duration-300 ${scrolled ? 'h-10' : 'h-10 md:h-12'} w-auto`} />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-stone-600 uppercase">
                    <NavLink to="/" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>Home</NavLink>
                    <NavLink to="/shop" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>Shop</NavLink>
                    <NavLink to="/stylist" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>AI Stylist</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>About</NavLink>
                </nav>

                {/* Action Buttons (Login, Notifs, Cart) */}
                <div className="flex items-center gap-2 sm:gap-6 text-sm font-medium z-50 relative">
                    {currentUser ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <NotificationDropdown />
                            <div className="hidden sm:block">
                                <ProfileDropdown />
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="hover:text-stone-900 transition-colors cursor-pointer hidden sm:block">Login</Link>
                    )}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="hover:text-stone-900 transition-colors relative cursor-pointer"
                        aria-label="Toggle Cart"
                    >
                        {/* Unified Shopping Bag Icon */}
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>

                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-stone-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <motion.div
                className="fixed inset-0 bg-white z-30 flex flex-col pt-24 px-6 md:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
            >
                <nav className="flex flex-col gap-6 text-xl font-serif text-stone-800 mt-8">
                    <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>Home</NavLink>
                    <NavLink to="/shop" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>Shop</NavLink>
                    <NavLink to="/stylist" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>AI Stylist</NavLink>
                    <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>About</NavLink>

                    <div className="h-px bg-stone-200 my-4 w-full"></div>

                    {currentUser ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-900">{currentUser.displayName || 'My Account'}</p>
                                    <p className="text-xs text-stone-500">{currentUser.email}</p>
                                </div>
                            </div>

                            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-stone-600 hover:text-stone-900">Personal Info</Link>
                            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-stone-600 hover:text-stone-900">Order History</Link>

                            {currentUser.isAdmin && (
                                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-primary">Admin Dashboard</Link>
                            )}
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); toast.success('Logged out successfully'); }} className="text-left text-stone-500 mt-4 border-t border-stone-100 pt-4 cursor-pointer">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-stone-500">Login to your account</Link>
                    )}
                </nav>
            </motion.div>

            <CartDrawer />

            {/* Main Content */}
            <main className="flex-grow pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Outlet />
                </motion.div>
            </main>

            {/* Footer Placeholder */}
            <footer className="bg-stone-900 text-stone-400 py-16 px-6 lg:px-12 border-t border-stone-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-white font-serif text-lg mb-4">Pretty You.</h3>
                        <p className="text-xs leading-relaxed max-w-xs">Handcrafted earrings for the modern muse. Sustainable, ethical, and uniquely yours.</p>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-medium uppercase tracking-widest mb-4">Shop</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Best Sellers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Gift Sets</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-medium uppercase tracking-widest mb-4">Support</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-medium uppercase tracking-widest mb-4">Newsletter</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email Address" className="bg-stone-800 text-white text-xs px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-stone-600" />
                            <button className="bg-white text-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-wider hover:bg-stone-200 transition-colors cursor-pointer">Join</button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-800 text-xs text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} Pretty You. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
