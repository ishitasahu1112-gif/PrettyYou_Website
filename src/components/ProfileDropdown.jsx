import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileDropdown = () => {
    const { currentUser, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button - Profile Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="User menu"
            >
                <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-100 py-2 z-50 text-sm"
                    >
                        <div className="px-4 py-2 border-b border-stone-100 mb-2">
                            <p className="font-medium text-stone-800 truncate">{currentUser.displayName || 'User'}</p>
                            <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                        </div>

                        <Link
                            to="/profile"
                            className="block px-4 py-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            My Profile
                        </Link>

                        <Link
                            to="/orders"
                            className="block px-4 py-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            My Orders
                        </Link>

                        {currentUser.isAdmin && (
                            <Link
                                to="/admin"
                                className="block px-4 py-2 text-primary font-medium hover:bg-stone-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        <div className="border-t border-stone-100 mt-2 pt-2">
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                    toast.success('Logged out successfully');
                                }}
                                className="w-full text-left px-4 py-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
