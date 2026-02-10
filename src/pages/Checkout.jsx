import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                    <div className="text-green-500 mb-6">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-3xl font-serif text-stone-900 mb-4">Thank You!</h2>
                    <p className="text-stone-600 mb-8">Your order has been placed successfully. A confirmation email is on its way.</p>
                    <Link to="/">
                        <Button className="w-full">Continue Shopping</Button>
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

    const handleCheckout = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            clearCart();
        }, 2000);
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
                            <input type="email" placeholder="Email address" className="w-full p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                            <div className="flex gap-4">
                                <input type="text" placeholder="First name" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                                <input type="text" placeholder="Last name" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                            </div>
                            <input type="text" placeholder="Address" className="w-full p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                            <div className="flex gap-4">
                                <input type="text" placeholder="City" className="flex-1 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                                <input type="text" placeholder="Postal Code" className="w-32 p-3 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-400 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 shadow-sm rounded-sm">
                        <h2 className="text-xl font-serif font-medium mb-6 border-b border-stone-100 pb-4">
                            Payment
                        </h2>
                        <div className="space-y-4 text-stone-500 text-sm">
                            <p className="bg-stone-50 p-4 border border-stone-200 rounded-sm text-center">
                                This is a demo store. No payment is required.
                            </p>
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
                            disabled={loading}
                            className={`w-full mt-8 py-4 shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : `Pay $${cartTotal}`}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
