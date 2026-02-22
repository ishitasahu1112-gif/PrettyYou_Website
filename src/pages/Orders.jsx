import { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Orders = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                // Query orders for the current user in RTDB
                const ordersRef = ref(db, 'orders');
                const q = query(ordersRef, orderByChild('userId'), equalTo(currentUser.uid));

                const snapshot = await get(q);
                let fetchedOrders = [];

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        fetchedOrders.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                }

                // Sort in memory by createdAt descending (newest first)
                fetchedOrders.sort((a, b) => {
                    // RTDB serverTimestamp is saved as milliseconds since epoch directly
                    const timeA = a.createdAt || 0;
                    const timeB = b.createdAt || 0;
                    return timeB - timeA; // Descending
                });

                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center bg-stone-50">
                <h2 className="text-2xl font-serif mb-4 text-[#4A3B32]">Please log in to view orders</h2>
                <Link to="/login"><Button>Log In</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-[#4A3B32] mb-8 border-b border-stone-200 pb-4">Your Order History</h1>

                {loading ? (
                    <div className="text-center py-12 text-stone-500">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-stone-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
                            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif text-[#4A3B32] mb-2">No orders yet</h3>
                        <p className="text-stone-500 mb-6">Looks like you haven't made any purchases.</p>
                        <Link to="/shop"><Button>Start Shopping</Button></Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                                <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Order Placed</p>
                                        <p className="text-sm font-medium text-stone-900">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Total</p>
                                        <p className="text-sm font-medium text-stone-900">${order.totalAmount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Order #</p>
                                        <p className="text-sm text-stone-600 truncate max-w-[120px]" title={order.id}>{order.id}</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    order.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-stone-200 text-stone-800'
                                            }`}>
                                            {order.status || 'Processing'}
                                        </span>
                                        {order.adminComment && (
                                            <div className="mt-2 text-xs text-stone-600 sm:max-w-[200px] bg-white p-2 border border-[#E8E1D9] rounded-sm sm:ml-auto text-left shadow-sm">
                                                <span className="font-semibold text-[#4A3B32] block mb-1">Store Note:</span>
                                                {order.adminComment}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-stone-900">{item.name}</h4>
                                                    <p className="text-xs text-stone-500">{item.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-stone-900">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-stone-900">${item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
