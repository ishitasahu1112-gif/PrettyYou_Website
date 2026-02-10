import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import aboutBackground from '../assets/about_background.png';

const categories = ["All", "Gold Plated", "Silver", "Gemstone", "Rose Gold"];

const Shop = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="relative min-h-screen bg-white pt-[30px] px-6 md:px-12 pb-20">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: `url(${aboutBackground})` }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-7 text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-4 tracking-tight">The Collection</h1>
                    <p className="text-stone-500 font-light text-lg">Adornments for the modern muse.</p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar / Filters */}
                    <aside className="w-full md:w-32 flex-shrink-0">
                        <div className="sticky top-32">
                            <h3 className="text-stone-900 font-medium text-sm w-full border-b border-stone-200 pb-2 mb-6 uppercase tracking-widest">Category</h3>
                            <ul className="space-y-3">
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`text-sm transition-colors duration-200 cursor-pointer ${selectedCategory === cat ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                        >
                            <AnimatePresence mode='popLayout'>
                                {filteredProducts.map(product => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        key={product.id}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20 text-stone-400">
                                <p>No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
