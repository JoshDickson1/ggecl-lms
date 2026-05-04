// src/landing/pages/Cart.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, UserPlus, ArrowRight, Sparkles } from "lucide-react";

export default function Cart() {
  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      {/* Grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-36 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <ShoppingCart className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              Your Cart
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Your <span className="text-blue-600 dark:text-blue-400">Cart</span>
          </h1>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center shadow-[0_12px_40px_rgba(59,130,246,0.4)]">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-amber-400
              flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
            Want to add courses to your cart?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mb-10 leading-relaxed">
            Create a free account to start building your learning journey, save courses to your cart, and access everything GGECL has to offer.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: "0 12px 36px rgba(59,130,246,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl
                  bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
                  shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Sign up for free
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>

            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                  border border-gray-200 dark:border-white/[0.10]
                  text-gray-700 dark:text-gray-300 font-semibold text-sm
                  hover:border-blue-300 dark:hover:border-blue-700
                  hover:text-blue-600 dark:hover:text-blue-400
                  transition-all cursor-pointer"
              >
                Already have an account? Log in
              </motion.div>
            </Link>
          </div>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-6 mt-14">
            {[
              { emoji: "🎓", text: "Access all courses" },
              { emoji: "🛒", text: "Save to cart & wishlist" },
              { emoji: "📜", text: "Earn certificates" },
              { emoji: "🆓", text: "Free to sign up" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-lg">{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
