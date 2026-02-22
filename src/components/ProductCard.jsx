import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <motion.div
            className="group block h-full"
            whileHover={{ y: -8 }}
        >
            <div className="bg-stone-100 aspect-[3/4] mb-4 overflow-hidden relative rounded-sm shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <div className={`absolute inset-0 bg-stone-200 ${!product.image && 'animate-pulse'}`}>
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        ) : (
                            <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                                <span className="text-stone-400 font-serif italic text-lg opacity-50">Pretty You.</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Out of Stock Overlay */}
                {product.stock !== undefined && product.stock <= 0 && (
                    <div className="absolute inset-0 bg-stone-100/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                        <span className="bg-white/90 text-stone-900 border border-stone-200 px-4 py-2 font-serif text-sm tracking-widest uppercase shadow-sm">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Quick Add Button Overhead */}
                {product.stock === undefined || product.stock > 0 ? (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button
                            onClick={handleQuickAdd}
                            className="w-full bg-white/90 backdrop-blur-sm text-stone-900 py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shadow-lg cursor-pointer"
                        >
                            Quick Add
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <Link to={`/product/${product.id}`} className="text-stone-900 font-medium text-lg font-serif group-hover:text-stone-600 transition-colors">
                        {product.name}
                    </Link>
                    <span className="text-stone-900 font-medium text-sm">${product.price}</span>
                </div>
                <p className="text-stone-500 font-light text-xs tracking-wide uppercase">{product.category || "Jewelry"}</p>
            </div>
        </motion.div >
    );
};

export default ProductCard;
