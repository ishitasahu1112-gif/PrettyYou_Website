import { useState, useEffect } from 'react';
import { ref, get, remove, child, update } from 'firebase/database';
import { db } from '../services/firebase';
import ProductForm from '../components/admin/ProductForm';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    // Form modal state
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Selected image modal
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, 'products'));
            if (snapshot.exists()) {
                const productsData = [];
                snapshot.forEach((childSnapshot) => {
                    productsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                setProducts(productsData);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const snapshot = await get(ref(db, 'orders'));
            if (snapshot.exists()) {
                const ordersData = [];
                snapshot.forEach((childSnapshot) => {
                    ordersData.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                // Sort descending by date (newest first)
                ordersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setOrders(ordersData);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleFormSaved = () => {
        setShowForm(false);
        fetchProducts();
    };

    const [approvalModal, setApprovalModal] = useState({
        isOpen: false,
        order: null,
        newStatus: '',
        comment: '',
        submitting: false
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        productId: null,
        submitting: false
    });

    const handleDeleteClick = (productId) => {
        setDeleteModal({ isOpen: true, productId, submitting: false });
    };

    const confirmDelete = async () => {
        const { productId } = deleteModal;
        if (!productId) return;

        setDeleteModal(prev => ({ ...prev, submitting: true }));
        try {
            await remove(ref(db, `products/${productId}`));
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error('Failed to delete product');
        } finally {
            setDeleteModal({ isOpen: false, productId: null, submitting: false });
        }
    };

    const handleUpdateOrderStatus = (order, newStatus) => {
        setApprovalModal({
            isOpen: true,
            order: order,
            newStatus: newStatus,
            comment: '',
            submitting: false
        });
    };

    const submitOrderStatusUpdate = async () => {
        const { order, newStatus, comment } = approvalModal;
        if (!order) return;

        setApprovalModal(prev => ({ ...prev, submitting: true }));

        try {
            // 1. Update Order Status in RTDB
            await update(ref(db, `orders/${order.id}`), {
                status: newStatus,
                adminComment: comment || null
            });

            // 2. Create In-App Notification
            const notificationTitle = `Order ${newStatus}`;
            const notificationMessage = newStatus === 'Approved'
                ? `Your order has been approved and is being processed! ${comment ? `Store Note: ${comment}` : ''}`
                : `Your order has been rejected. ${comment ? `Reason: ${comment}` : 'Please contact support for more details.'}`;

            const notificationData = {
                title: notificationTitle,
                message: notificationMessage,
                type: newStatus === 'Approved' ? 'order_approved' : 'order_rejected',
                orderId: order.id,
                read: false,
                createdAt: Date.now()
            };

            // Push notification to the specific user's node
            const newNotifRef = child(ref(db), `notifications/${order.userId}`);
            await update(newNotifRef, {
                [Date.now()]: notificationData // Using timestamp as simplistic unique key for notification
            });


            // 3. Trigger Email via n8n webhook
            try {
                await fetch('https://ishita2000.app.n8n.cloud/webhook-test/order-notification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: order.id,
                        status: newStatus,
                        customerEmail: order.customerEmail,
                        customerName: order.customerName || 'Customer',
                        adminComment: comment,
                        totalAmount: order.totalAmount
                    })
                });
                console.log("Webhook triggered for email notification");
            } catch (webhookError) {
                console.error("Failed to trigger email webhook, but order was updated:", webhookError);
                // We don't fail the whole operation if email fails
            }

            toast.success(`Order ${newStatus.toLowerCase()} successfully`);
            setApprovalModal({ isOpen: false, order: null, newStatus: '', comment: '', submitting: false });
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Failed to update order status.");
            setApprovalModal(prev => ({ ...prev, submitting: false }));
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF7] py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-[#E8E1D9] pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif text-[#4A3B32]">Admin Dashboard</h1>
                        <p className="mt-2 text-[#8C7A6B]">Manage your inventory and store settings.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#E8E1D9]">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-4 px-2 tracking-wide font-medium text-sm transition-colors cursor-pointer ${activeTab === 'products' ? 'border-b-2 border-[#4A3B32] text-[#4A3B32]' : 'text-[#8C7A6B] hover:text-[#4A3B32]'}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-4 px-2 tracking-wide font-medium text-sm transition-colors cursor-pointer ${activeTab === 'orders' ? 'border-b-2 border-[#4A3B32] text-[#4A3B32]' : 'text-[#8C7A6B] hover:text-[#4A3B32]'}`}
                    >
                        Order History
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] overflow-hidden">
                    {activeTab === 'products' ? (
                        <>
                            <div className="px-6 py-5 border-b border-[#E8E1D9] bg-[#FAF8F5] flex justify-between items-center">
                                <h2 className="text-xl font-serif text-[#4A3B32]">All Products</h2>
                                <button onClick={handleAdd} className="bg-[#4A3B32] text-white px-4 py-2 text-sm rounded-md font-medium tracking-wide hover:bg-[#3A2B22] transition-colors cursor-pointer">
                                    + Add Product
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-[#8C7A6B]">Loading inventory...</div>
                            ) : products.length === 0 ? (
                                <div className="p-12 text-center text-[#8C7A6B]">
                                    <p>No products found in inventory.</p>
                                    <p className="text-sm mt-2">Click '+ Add Product' or run the migration script.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-[#E8E1D9]">
                                        <thead className="bg-[#FAF8F5]">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Product</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Category</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Price</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Stock</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E8E1D9]">
                                            {products.map((product) => (
                                                <tr key={product.id} className="hover:bg-[#FFFBF7] transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 bg-[#F5F1EB] rounded-md overflow-hidden">
                                                                {product.image ? (
                                                                    <img className="h-10 w-10 object-cover" src={product.image} alt={product.name} />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-[#8C7A6B] text-xs">No img</div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-[#4A3B32]">{product.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F5F1EB] text-[#8C7A6B]">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A3B32]">
                                                        ${product.price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A3B32]">
                                                        {product.stock !== undefined ? (
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                                {product.stock === 0 ? 'Out of Stock' : product.stock}
                                                            </span>
                                                        ) : (
                                                            <span className="text-stone-400 italic text-xs">Unlim.</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer">Edit</button>
                                                        <button onClick={() => handleDeleteClick(product.id)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-5 border-b border-[#E8E1D9] bg-[#FAF8F5]">
                                <h2 className="text-xl font-serif text-[#4A3B32]">Customer Orders</h2>
                                <p className="text-sm text-[#8C7A6B] mt-1">Review manual payments and approve or reject orders.</p>
                            </div>

                            {ordersLoading ? (
                                <div className="p-12 text-center text-[#8C7A6B]">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="p-12 text-center text-[#8C7A6B]">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F1EB] mb-4">
                                        <svg className="w-8 h-8 text-[#4A3B32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-serif text-[#4A3B32] mb-2">No Orders Yet</h3>
                                    <p>Customer orders will appear here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-[#E8E1D9]">
                                        <thead className="bg-[#FAF8F5]">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Date</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Customer</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Total</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Receipt</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E8E1D9]">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-[#FFFBF7] transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A3B32]">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-[#4A3B32]">{order.customerEmail}</div>
                                                        <div className="text-xs text-[#8C7A6B]">{order.userId.slice(0, 8)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#4A3B32]">
                                                        ${order.totalAmount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.status || 'Processing'}
                                                        </span>
                                                        {order.adminComment && (
                                                            <div className="mt-1 text-xs text-stone-500 max-w-[150px] truncate" title={order.adminComment}>
                                                                * {order.adminComment}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {order.receiptImage ? (
                                                            <button
                                                                onClick={() => setSelectedImage(order.receiptImage)}
                                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                View
                                                            </button>
                                                        ) : (
                                                            <span className="text-stone-400 text-xs italic">No receipt</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {order.status === 'Pending Approval' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => handleUpdateOrderStatus(order, 'Approved')} className="text-green-600 hover:text-green-900 cursor-pointer bg-green-50 px-2 py-1 rounded-sm border border-green-200">Approve</button>
                                                                <button onClick={() => handleUpdateOrderStatus(order, 'Rejected')} className="text-red-600 hover:text-red-900 cursor-pointer bg-red-50 px-2 py-1 rounded-sm border border-red-200">Reject</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => setShowForm(false)}
                    onSaved={handleFormSaved}
                />
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-stone-300 bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <p className="text-white mb-4 font-serif text-xl tracking-wide bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">Payment Receipt</p>
                        <img
                            src={selectedImage}
                            alt="Payment Receipt Screenshot"
                            className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Custom Approval/Rejection Modal */}
            {approvalModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className={`px-6 py-4 border-b ${approvalModal.newStatus === 'Approved' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                            <h3 className={`font-serif text-xl ${approvalModal.newStatus === 'Approved' ? 'text-green-800' : 'text-red-800'}`}>
                                {approvalModal.newStatus === 'Approved' ? 'Approve Order' : 'Reject Order'}
                            </h3>
                            <p className="text-sm mt-1 text-stone-600">
                                Order #{approvalModal.order?.id?.slice(-6)} · ${approvalModal.order?.totalAmount}
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-[#4A3B32] mb-2">
                                Add a Note (Optional)
                            </label>
                            <p className="text-xs text-stone-500 mb-3">
                                This note will be visible to the customer and sent in their email notification.
                            </p>
                            <textarea
                                className="w-full border border-[#E8E1D9] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]"
                                rows="3"
                                placeholder={approvalModal.newStatus === 'Approved' ? "e.g., Payment received, shipping your order soon!" : "e.g., Screenshot was blurry, please upload again."}
                                value={approvalModal.comment}
                                onChange={(e) => setApprovalModal(prev => ({ ...prev, comment: e.target.value }))}
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 bg-stone-50 flex justify-end gap-3 border-t border-[#E8E1D9]">
                            <button
                                onClick={() => setApprovalModal({ isOpen: false, order: null, newStatus: '', comment: '', submitting: false })}
                                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitOrderStatusUpdate}
                                disabled={approvalModal.submitting}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${approvalModal.submitting ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${approvalModal.newStatus === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {approvalModal.submitting ? 'Processing...' : `Confirm ${approvalModal.newStatus}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <h3 className="font-serif text-2xl text-stone-900 mb-2">Delete Product?</h3>
                        <p className="text-stone-600 mb-8 text-sm">Are you sure you want to permanently remove this product? This action cannot be undone.</p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, productId: null, submitting: false })}
                                className="px-6 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer w-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteModal.submitting}
                                className={`px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer w-full ${deleteModal.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {deleteModal.submitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
