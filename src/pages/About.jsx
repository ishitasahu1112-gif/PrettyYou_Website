import { motion } from 'framer-motion';
import aboutBackground from '../assets/about_background.png';

const About = () => {
    return (
        <div className="relative bg-white min-h-screen pt-32 pb-20 px-6 md:px-12">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: `url(${aboutBackground})` }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-serif text-stone-900 mb-8 tracking-tight"
                >
                    Our Story
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-stone mx-auto text-lg leading-relaxed font-light"
                >
                    <p>
                        Pretty You was born from a desire to bring timeless elegance to the modern world. We believe that jewelry is more than an accessory; it is a form of self-expression, a memory keeper, and a piece of art.
                    </p>
                    <p>
                        Every piece in our collection is handcrafted by skilled artisans who pour their passion into every detail. We use only the finest materials, ensuring that your Pretty You earrings are not only beautiful but also durable and sustainable.
                    </p>
                    <p>
                        Thank you for being part of our journey. We hope our creations bring a touch of magic to your everyday life.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default About;

