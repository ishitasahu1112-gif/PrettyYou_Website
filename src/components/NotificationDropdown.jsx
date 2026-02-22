import { useState, useEffect, useRef } from 'react';
import { ref, onValue, query, orderByChild, update } from 'firebase/database';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!currentUser) return;

        const notifRef = query(ref(db, `notifications/${currentUser.uid}`), orderByChild('createdAt'));

        const unsubscribe = onValue(notifRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = [];
                snapshot.forEach((child) => {
                    data.push({ id: child.key, ...child.val() });
                });
                // Sort descending so newest is first
                setNotifications(data.sort((a, b) => b.createdAt - a.createdAt));
            } else {
                setNotifications([]);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId) => {
        if (!currentUser) return;
        try {
            await update(ref(db, `notifications/${currentUser.uid}/${notificationId}`), {
                read: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser || unreadCount === 0) return;

        const updates = {};
        notifications.forEach(n => {
            if (!n.read) {
                updates[`${n.id}/read`] = true;
            }
        });

        try {
            await update(ref(db, `notifications/${currentUser.uid}`), updates);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-stone-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-serif text-[#4A3B32] text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:text-stone-900 transition-colors font-medium border-b border-transparent hover:border-stone-900"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    <p className="text-sm">You have no notifications yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-50">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer group flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {notif.type === 'order_approved' ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                ) : notif.type === 'order_rejected' ? (
                                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm tracking-wide ${!notif.read ? 'font-bold text-stone-900' : 'font-medium text-stone-800'} truncate`}>
                                                        {notif.title}
                                                    </h4>
                                                </div>
                                                <p className={`text-xs leading-relaxed break-words ${!notif.read ? 'text-stone-700' : 'text-stone-500'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    {notif.orderId ? (
                                                        <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
                                                            Order #{notif.orderId.slice(-6)}
                                                        </p>
                                                    ) : <span></span>}
                                                    <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
