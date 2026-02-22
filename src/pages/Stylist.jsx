import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import aboutBackground from '../assets/about_background.png';

const Stylist = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: "Hello, darling. I'm your personal stylist. Tell me about the occasion, your outfit, or the vibe you're going for, and I'll find the perfect match for you." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
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
            }
        };
        fetchProducts();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Analysis Delay
        setTimeout(() => {
            const keyword = userMessage.text.toLowerCase();
            let recommendedProducts = [];
            let responseText = "";

            // Simple keyword matching for demo purposes
            if (keyword.includes('party') || keyword.includes('night') || keyword.includes('bold')) {
                recommendedProducts = products.filter(p => p.price > 100);
                responseText = "For a glamourous night out, you need something that catches the light. These statement pieces are absolutely divine.";
            } else if (keyword.includes('work') || keyword.includes('office') || keyword.includes('simple')) {
                recommendedProducts = products.filter(p => p.price < 100 && p.category !== "Gemstone");
                responseText = "Sophistication is key for the workplace. These subtle yet elegant options will polish your look without being distracting.";
            } else if (keyword.includes('wedding') || keyword.includes('gift')) {
                recommendedProducts = products.filter(p => p.category === "Gold Plated" || p.category === "Rose Gold");
                responseText = "A special occasion calls for timeless romance. I've selected these exquisite pieces that exude grace and luxury.";
            } else {
                recommendedProducts = products.slice(0, 2);
                responseText = "That sounds lovely. Based on your unique style, I believe these pieces would be a stunning addition to your collection.";
            }

            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                text: responseText,
                recommendations: recommendedProducts
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="relative min-h-screen bg-stone-50 pt-[30px] pb-12 px-4 md:px-0">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: `url(${aboutBackground})` }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col h-[80vh] bg-white shadow-xl rounded-sm overflow-hidden">
                {/* Header */}
                <div className="bg-stone-900 text-white p-6 md:p-10 flex items-center gap-4">
                    <div className="flex-grow">
                        <h1 className="font-serif text-2xl md:text-3xl italic tracking-wide"><span className="font-bold not-italic">Pretty You.</span> AI STYLIST</h1>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-stone-50/50">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'bg-stone-200 text-stone-900' : 'bg-white text-stone-800 border border-stone-100 shadow-sm'} p-5 rounded-sm`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>

                                    {msg.recommendations && (
                                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {msg.recommendations.map(product => (
                                                <div key={product.id} className="bg-stone-50 p-2 rounded-sm border border-stone-100">
                                                    <div className="aspect-square bg-stone-200 mb-2 overflow-hidden">
                                                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <h4 className="font-serif text-sm truncate">{product.name}</h4>
                                                    <p className="text-xs text-stone-500">${product.price}</p>
                                                    <Button variant="primary" className="w-full mt-2 py-2 text-[10px]">View</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white p-4 rounded-sm shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-stone-100">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your occasion or outfit..."
                            className="flex-grow bg-stone-50 border-none focus:ring-1 focus:ring-stone-300 p-4 text-sm rounded-sm"
                        />
                        <Button onClick={handleSend} className="px-8">Send</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stylist;
