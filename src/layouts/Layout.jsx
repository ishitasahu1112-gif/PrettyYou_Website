import { Outlet, Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import { useState, useEffect } from 'react';

import logo from '../assets/logo.png';

const Layout = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50 selection:bg-stone-200">
            {/* Header Placeholder */}
            <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'} px-6 lg:px-12 flex justify-between items-center`}>
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Pretty You" className="h-12 w-auto" />
                </Link>
                <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-stone-600 uppercase">
                    <NavLink to="/" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>Home</NavLink>
                    <NavLink to="/shop" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>Shop</NavLink>
                    <NavLink to="/stylist" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>AI Stylist</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `hover:text-stone-900 transition-colors tracking-widest ${isActive ? 'text-primary font-bold border-b border-primary pb-1' : ''}`}>About</NavLink>
                </nav>
                <div className="flex items-center gap-6 text-sm font-medium">
                    <button className="hover:text-stone-900 transition-colors cursor-pointer">Search</button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="hover:text-stone-900 transition-colors relative cursor-pointer"
                    >
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-3 bg-stone-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

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
