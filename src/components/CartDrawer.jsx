import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { currentUser } = useAuth();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="font-serif text-2xl text-stone-900">Your Bag</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="text-center text-stone-500 py-20">
                                    <p className="mb-4">Your bag is empty.</p>
                                    <Button onClick={() => setIsCartOpen(false)}>Start Shopping</Button>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif italic">Pretty You.</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-serif text-stone-900 font-medium">{item.name}</h3>
                                                <span className="text-stone-900 font-medium">${item.price * item.quantity}</span>
                                            </div>
                                            <p className="text-stone-500 text-xs uppercase tracking-wide mb-3">{item.category}</p>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center border border-stone-200 rounded-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-2 py-1 text-stone-500 hover:bg-stone-50 cursor-pointer"
                                                    >-</button>
                                                    <span className="px-2 text-xs font-medium text-stone-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-2 py-1 text-stone-500 hover:bg-stone-50 cursor-pointer"
                                                    >+</button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-xs text-stone-400 hover:text-red-500 underline transition-colors cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-stone-100 bg-stone-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-stone-600 font-light">Subtotal</span>
                                    <span className="text-stone-900 font-bold text-lg">${cartTotal}</span>
                                </div>
                                <p className="text-stone-400 text-xs mb-6 text-center">Shipping & taxes calculated at checkout.</p>
                                {currentUser ? (
                                    <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                                        <Button className="w-full py-4 text-sm shadow-xl">Proceed to Checkout</Button>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        state={{ from: { pathname: '/checkout' } }}
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            toast('Please login to continue to checkout', { icon: '👋' });
                                        }}
                                    >
                                        <Button className="w-full py-4 text-sm shadow-xl bg-stone-800 hover:bg-stone-900">Login to Checkout</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
