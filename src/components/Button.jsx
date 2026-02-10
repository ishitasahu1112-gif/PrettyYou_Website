import clsx from 'clsx';
import { motion } from 'framer-motion';

const Button = ({ children, variant = "primary", className, onClick, ...props }) => {
    const baseStyles = "px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all duration-300 rounded-sm inline-flex items-center justify-center cursor-pointer";

    const variants = {
        primary: "bg-stone-900 text-white hover:bg-stone-800 shadow-lg hover:shadow-xl",
        secondary: "bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 shadow-sm",
        outline: "bg-transparent text-stone-900 border border-stone-900 hover:bg-stone-900 hover:text-white",
        ghost: "bg-transparent text-stone-900 hover:text-stone-600 hover:bg-stone-100/50 shadow-none"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(baseStyles, variants[variant], className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
