import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Determine limits; if stock is undefined, assume unlimited legacy product, otherwise cap it.
                const nextQuantity = existingItem.quantity + 1;
                if (product.stock !== undefined && nextQuantity > product.stock) {
                    toast.error(`Only ${product.stock} available in stock.`);
                    return prevItems;
                }
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: nextQuantity } : item
                );
            }

            // Check initial limit
            if (product.stock !== undefined && product.stock <= 0) {
                toast.error(`Item is out of stock.`);
                return prevItems;
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity, maxStock) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        if (maxStock !== undefined && quantity > maxStock) {
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item => item.id === productId ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};
