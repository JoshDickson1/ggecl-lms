import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, ShoppingCart, Trash2, Star,
  Users, Search, ArrowRight,
  Play, Loader2, AlertCircle, ArrowLeft, Home
} from "lucide-react";
import { useWishlist, type WishlistCourse } from "@/services/wishlist.service";

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Course card ──────────────────────────────────────────────────────────────
function WishlistCard({
  item,
  index,
  onRemove,
  onMoveToCart,
  removing,
  moving,
}: {
  item: WishlistCourse;
  index: number;
  onRemove: () => void;
  onMoveToCart: () => void;
  removing: boolean;
  moving: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { course } = item;
  const rating = course.totalRating > 0 ? (course.totalStar / course.totalRating).toFixed(1) : "—";
  const addedAt = new Date(item.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: removing || moving ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col sm:flex-row rounded-[20px] overflow-hidden
        bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        transition-all duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.1)"
          : "0 2px 16px rgba(0,0,0,0.05)",
      }}
    >
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} className="flex-shrink-0">
        <div className="relative w-full sm:w-44 h-36 sm:h-full overflow-hidden">
          {course.img ? (
            <img
              src={course.img}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
              <motion.div animate={hovered ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.3 }}>
                <Play className="w-10 h-10 text-white/80" fill="white" />
              </motion.div>
            </div>
          )}
          {course.badge && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold
              bg-amber-400 text-amber-900">
              {course.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link to={`/courses/${course.id}`}>
              <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-snug
                hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {course.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-400 mt-1">{course.instructor.user.name}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            disabled={removing}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              bg-red-50 dark:bg-red-950/20 text-red-500
              hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
          >
            {removing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Heart className="w-4 h-4 fill-current" />
            }
          </motion.button>
        </div>

        {/* Rating + meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3 h-3 fill-amber-400" />{rating}
            <span className="text-gray-400 font-normal">({fmt(course.totalRating)})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />{course.level}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-white/[0.04]
            border border-gray-100 dark:border-white/[0.06] text-gray-500">
            {course.certification}
          </span>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3
          border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900 dark:text-white">
              ${course.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 hidden sm:block">Added {addedAt}</span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onMoveToCart}
              disabled={moving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                bg-blue-600 hover:bg-blue-500 text-white
                shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all disabled:opacity-50"
            >
              {moving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ShoppingCart className="w-3.5 h-3.5" />
              }
              Add to Cart
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-5
        border border-red-100 dark:border-red-900/30">
        <Heart className="w-9 h-9 text-red-400" />
      </div>
      <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Your wishlist is empty</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Save courses you're interested in and come back to them whenever you're ready.
      </p>
      <Link
        to="/student/courses"
        className="flex items-center gap-2 px-5 py-3 rounded-full
          bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
          shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all"
      >
        Browse Courses <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentWishlist() {
  const [search, setSearch] = useState("");
  
  const { 
    data: wishlistData, 
    isLoading, 
    error,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    isRemoving,
    isMoving,
    isClearing
  } = useWishlist();

  const items = wishlistData?.items ?? [];

  const filtered = items.filter(
    (item) =>
      !search ||
      item.course.title.toLowerCase().includes(search.toLowerCase()) ||
      item.course.instructor.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = items.reduce((a, i) => a + i.course.price, 0);

  const handleRemove = async (courseId: string) => {
    try {
      await removeFromWishlist(courseId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleMoveToCart = async (courseId: string) => {
    try {
      await moveToCart(courseId);
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWishlist();
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      await Promise.all(items.map(item => moveToCart(item.course.id)));
    } catch (error) {
      console.error('Failed to add all to cart:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load wishlist</h2>
          <p className="text-sm text-gray-400 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/student/courses"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-xs text-gray-400">
                {items.length} {items.length === 1 ? 'course' : 'courses'}
              </p>
            </div>
          </div>

          <Link 
            to="/student/courses"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Action buttons */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {items.length} Saved Course{items.length !== 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Total value: ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleAddAllToCart}
                disabled={isMoving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full
                  bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
                  shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors disabled:opacity-50"
              >
                {isMoving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleClearAll}
                disabled={isClearing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full
                  border border-gray-200 dark:border-white/[0.1] text-gray-500 dark:text-gray-400
                  hover:border-red-300 hover:text-red-500 text-sm font-bold transition-colors
                  disabled:opacity-50"
              >
                {isClearing
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Clearing...</>
                  : <><Trash2 className="w-4 h-4" />Clear All</>
                }
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="relative max-w-sm"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wishlist…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                bg-white dark:bg-[#111827]
                border border-gray-200 dark:border-white/[0.08]
                text-gray-800 dark:text-white placeholder:text-gray-400
                outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all
                shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            />
          </motion.div>
        )}

        {/* List */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  index={i}
                  removing={isRemoving}
                  moving={isMoving}
                  onRemove={() => handleRemove(item.course.id)}
                  onMoveToCart={() => handleMoveToCart(item.course.id)}
                />
              ))
            ) : items.length === 0 ? (
              <EmptyWishlist key="empty" />
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]"
              >
                <p className="text-sm text-gray-400">No courses match your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Browse more */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center pt-4"
          >
            <Link
              to="/student/courses"
              className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse more courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
