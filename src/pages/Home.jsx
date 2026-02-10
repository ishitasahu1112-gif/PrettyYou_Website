import { motion } from 'framer-motion';
import heroImage from '../assets/hero.png';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

const dummyProducts = [
    { id: 1, name: "Celestial Drop", price: 120, category: "Gold Plated", image: null },
    { id: 2, name: "Moonlight Hoop", price: 85, category: "Silver", image: null },
    { id: 3, name: "Starlight Stud", price: 45, category: "Gemstone", image: null },
    { id: 4, name: "Eclipse Dangle", price: 150, category: "Gold Plated", image: null },
];

const Home = () => {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt="Handmade Gold Earrings"
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Subtle overlay for text readability */}
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium mb-6 tracking-tight drop-shadow-lg leading-tight"
                    >
                        Timeless. <br /><span className="italic font-light text-stone-100">Elegance.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-2xl font-light mb-12 max-w-2xl mx-auto drop-shadow-md text-stone-100"
                    >
                        Define your style with our handcrafted collection of luxury earrings.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Button variant="secondary" className="px-12 py-5 text-sm font-bold shadow-2xl">
                            Explore Collection
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-32 px-6 md:px-12 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-6 tracking-tight">Curated Favorites</h2>
                    <p className="text-stone-500 font-light text-lg">Pieces loved by our glowing community.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {dummyProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Button variant="outline" className="px-10 py-4">View All Products</Button>
                </div>
            </section>
        </div>
    );
};


export default Home;
