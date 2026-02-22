import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Receipt Upload State
    const [receiptFile, setReceiptFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const [formData, setFormData] = useState({
        email: currentUser?.email || '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReceiptChange = (e) => {
        if (e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
            setUploadError(null);
        }
    };

    const compressImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_DIMENSION = 800; // Limit size

                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality to keep size small for RTDB
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                    <div className="text-green-500 mb-6">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-3xl font-serif text-stone-900 mb-4">Order Received!</h2>
                    <p className="text-stone-600 mb-8">Your order and payment receipt have been submitted successfully. We will review your payment shortly.</p>
                    <Link to="/orders">
                        <Button className="w-full">Track Order Status</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
                <h2 className="text-2xl font-serif mb-4">Your bag is empty</h2>
                <Link to="/shop">
                    <Button>Return to Shop</Button>
                </Link>
            </div>
        );
    }

    const handleCheckout = async () => {
        if (!currentUser) return;
        if (!receiptFile) {
            setUploadError("Payment receipt is required to complete purchase.");
            return;
        }

        setLoading(true);
        setUploadError(null);

        try {
            // Compress the receipt before upload
            const compressedReceipt = await compressImageToBase64(receiptFile);

            const orderData = {
                userId: currentUser.uid,
                customerEmail: formData.email,
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode
                },
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || null,
                    category: item.category || ''
                })),
                totalAmount: cartTotal,
                status: 'Pending Approval', // Explicitly pending admin review
                receiptImage: compressedReceipt,
                createdAt: serverTimestamp()
            };

            const newOrderRef = push(ref(db, 'orders'));
            await set(newOrderRef, orderData);

            setSuccess(true);
            clearCart();
        } catch (error) {
            console.error("Error saving order:", error);
            setUploadError("Failed to process order. Please try again or check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4 md:px-12">
            {/* Back Button */}
            <div className="max-w-6xl mx-auto mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium uppercase tracking-wider">Back</span>
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Form */}
                <div>
                    <div className="bg-white p-8 shadow-sm rounded-sm mb-6">
                        <h2 className="text-xl font-serif font-medium mb-6 border-b border-stone-100 pb-4">
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" className="w-full p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                            <div className="flex gap-4">
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                            </div>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                            <div className="flex gap-4">
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="w-32 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" required />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 shadow-sm rounded-sm">
                        <h2 className="text-xl font-serif font-medium mb-6 border-b border-stone-100 pb-4">
                            Payment
                        </h2>
                        <div className="space-y-6 text-stone-600">
                            <p className="text-sm">Please scan the QR code below to make your payment securely. After completing the transaction, upload a screenshot of your receipt.</p>

                            <div className="flex justify-center my-6">
                                <img
                                    src="/payment-qr.png"
                                    alt="Payment QR Code"
                                    className="max-h-96 max-w-full object-contain border border-stone-200 rounded-md p-2 shadow-sm bg-[#1A1A1A]"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' alignment-baseline='middle' font-family='sans-serif' font-size='14' fill='%23999'%3E[Add payment-qr.png]%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            </div>

                            <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm">
                                <label className="block text-sm font-medium text-stone-900 mb-2">Upload Payment Receipt <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleReceiptChange}
                                    className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 focus:outline-none cursor-pointer"
                                />
                                {receiptFile && (
                                    <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Receipt uploaded: {receiptFile.name}
                                    </div>
                                )}
                                {uploadError && (
                                    <p className="mt-2 text-sm text-red-500">{uploadError}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div>
                    <div className="bg-stone-100 p-8 rounded-sm sticky top-32">
                        <h2 className="text-xl font-serif font-medium mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-sm shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-stone-200 rounded-sm overflow-hidden relative">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-stone-400">IMG</div>
                                            )}
                                            <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-stone-900">{item.name}</h4>
                                            <p className="text-xs text-stone-500">{item.category}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-stone-900">${item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>

                        <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-center text-lg font-bold text-stone-900">
                            <span>Total</span>
                            <span>${cartTotal}</span>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={loading || !receiptFile}
                            className={`w-full mt-8 py-4 shadow-xl text-sm tracking-widest ${loading || !receiptFile ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : 'Complete Purchase'}
                        </Button>
                        {!receiptFile && (
                            <p className="text-xs text-center text-stone-500 mt-3">* Payment receipt upload required</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
