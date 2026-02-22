import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ref, get, child } from 'firebase/database';
import { db } from '../services/firebase';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import VirtualTryOn from '../components/VirtualTryOn';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [isTryOnOpen, setIsTryOnOpen] = useState(false);

    // Firestore state
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, `products/${id}`));

                if (snapshot.exists()) {
                    setProduct({ id: snapshot.key, ...snapshot.val() });
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center py-32 text-stone-400">Loading Product Details...</div>;
    if (!product) return <div className="text-center py-32 text-stone-400">Product not found.</div>;

    return (
        <div className="bg-white min-h-screen pt-32 pb-20 px-6 md:px-12">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto mb-6">
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

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-20">
                {/* Images Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-1/2 flex flex-col gap-4"
                >
                    <div className="aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden relative shadow-md">
                        {/* Placeholder for Main Image */}
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                                <span className="font-serif italic text-4xl opacity-50">Pretty You.</span>
                                <span className="text-xs uppercase mt-2 tracking-widest">{product.name}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Details Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full md:w-1/2 flex flex-col justify-center"
                >
                    <span className="text-stone-500 uppercase tracking-widest text-xs mb-4">{product.category}</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 font-medium tracking-tight">{product.name}</h1>
                    <p className="text-2xl text-stone-900 mb-8 font-light">${product.price}</p>

                    <div className="prose prose-stone mb-10 text-stone-600 font-light leading-relaxed max-w-lg">
                        <p>{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs tracking-wide text-stone-500 mb-10 border-t border-b border-stone-100 py-6">
                        <div><strong className="text-stone-900 uppercase">Material:</strong><br />{product.material}</div>
                        <div><strong className="text-stone-900 uppercase">Dimensions:</strong><br />{product.dimensions || "N/A"}</div>
                        <div><strong className="text-stone-900 uppercase">Weight:</strong><br />{product.weight}</div>
                        <div><strong className="text-stone-900 uppercase">Care:</strong><br />Avoid water & perfume</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => addToCart(product)} className="flex-1 py-4 text-sm font-bold shadow-xl">Add to Cart</Button>
                        <Button variant="outline" className="px-6 py-4 sm:flex-none justify-center" onClick={() => setIsTryOnOpen(true)}>
                            Try-On
                        </Button>
                    </div>

                    {isTryOnOpen && (
                        <VirtualTryOn product={product} onClose={() => setIsTryOnOpen(false)} />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetails;
