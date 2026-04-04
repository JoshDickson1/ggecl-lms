// src/dashboards/student-dashboard/pages/StudentWishlist.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, ShoppingCart, Trash2, Star,
  Clock, BookOpen, Users, Search,
  Tag, ArrowRight, Play,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WishlistItem {
  id: string;
  title: string;
  instructor: string;
  instructorBg: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  lectures: number;
  level: string;
  badge?: string;
  addedAt: string;
  onSale?: boolean;
}

const BADGE_COLOR: Record<string, string> = {
  Bestseller:  "bg-amber-400 text-amber-900",
  "Hot & New": "bg-rose-500 text-white",
  New:         "bg-emerald-500 text-white",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: "biz-002",
    title: "Financial Modelling & Valuation Analyst (FMVA)",
    instructor: "Priya Sharma",
    instructorBg: "bg-rose-500",
    instructorAvatar: "PS",
    thumbnail: "from-blue-600 to-indigo-400",
    price: 17.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 5600,
    students: 21400,
    duration: "32h 20m",
    lectures: 242,
    level: "Advanced",
    badge: undefined,
    addedAt: "2 days ago",
    onSale: false,
  },
  {
    id: "sci-001",
    title: "Molecular Biology & Genetics Fundamentals",
    instructor: "David Chen",
    instructorBg: "bg-violet-500",
    instructorAvatar: "DC",
    thumbnail: "from-lime-500 to-green-400",
    price: 13.99,
    originalPrice: 84.99,
    rating: 4.8,
    reviews: 3700,
    students: 15800,
    duration: "21h 00m",
    lectures: 164,
    level: "Intermediate",
    badge: "Hot & New",
    addedAt: "1 week ago",
    onSale: true,
  },
  {
    id: "lan-001",
    title: "Spanish from Zero to Conversational in 60 Days",
    instructor: "Amara Nwosu",
    instructorBg: "bg-pink-500",
    instructorAvatar: "AN",
    thumbnail: "from-cyan-500 to-teal-400",
    price: 9.99,
    originalPrice: 54.99,
    rating: 4.8,
    reviews: 14600,
    students: 62300,
    duration: "26h 30m",
    lectures: 204,
    level: "Beginner",
    badge: "Bestseller",
    addedAt: "2 weeks ago",
    onSale: false,
  },
  {
    id: "phy-001",
    title: "Quantum Mechanics: From Zero to Uncertainty",
    instructor: "David Chen",
    instructorBg: "bg-violet-500",
    instructorAvatar: "DC",
    thumbnail: "from-rose-500 to-orange-400",
    price: 15.99,
    originalPrice: 99.99,
    rating: 4.9,
    reviews: 3800,
    students: 14200,
    duration: "22h 30m",
    lectures: 176,
    level: "Advanced",
    badge: "Bestseller",
    addedAt: "3 weeks ago",
    onSale: true,
  },
];

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Course card ──────────────────────────────────────────────────────────────
function WishlistCard({ item, index, onRemove, onAddToCart }: {
  item: WishlistItem;
  index: number;
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const discount = Math.round((1 - item.price / item.originalPrice) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
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
      <Link to={`/courses/${item.id}`} className="flex-shrink-0">
        <div className={`relative w-full sm:w-44 h-36 sm:h-full bg-gradient-to-br ${item.thumbnail}
          flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
          <motion.div animate={hovered ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <Play className="w-10 h-10 text-white/80" fill="white" />
          </motion.div>
          {item.badge && (
            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${BADGE_COLOR[item.badge]}`}>
              {item.badge}
            </span>
          )}
          {item.onSale && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500 text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link to={`/courses/${item.id}`}>
              <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-snug
                hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${item.instructorBg}`}>
                {item.instructorAvatar}
              </span>
              <span className="text-xs text-gray-400">{item.instructor}</span>
            </div>
          </div>
          {/* Remove */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(item.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              bg-red-50 dark:bg-red-950/20 text-red-500
              hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
            <Heart className="w-4 h-4 fill-current" />
          </motion.button>
        </div>

        {/* Rating + meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3 h-3 fill-amber-400" />{item.rating}
            <span className="text-gray-400 font-normal">({fmt(item.reviews)})</span>
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{item.lectures} lectures</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(item.students)}</span>
          <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] text-gray-500">
            {item.level}
          </span>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900 dark:text-white">${item.price}</span>
            <span className="text-xs text-gray-400 line-through">${item.originalPrice}</span>
            <span className="text-[10px] font-black text-emerald-500">{discount}% off</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 hidden sm:block">Added {item.addedAt}</span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onAddToCart(item.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                bg-blue-600 hover:bg-blue-500 text-white
                shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
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
      <Link to="/student/courses"
        className="flex items-center gap-2 px-5 py-3 rounded-full
          bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
          shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
        Browse Courses <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [search, setSearch] = useState("");
  const [_addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const filtered = items.filter(item =>
    !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const onSaleCount = items.filter(i => i.onSale).length;
  const totalValue  = items.reduce((a, i) => a + i.originalPrice, 0);
  const totalSave   = totalValue - items.reduce((a, i) => a + i.price, 0);

  const handleRemove = (id: string) => {
    setItems(p => p.filter(i => i.id !== id));
  };

  const handleAddToCart = (id: string) => {
    setAddedToCart(p => new Set([...p, id]));
    // In real app: call cart mutation here
    setTimeout(() => {
      setAddedToCart(p => { const next = new Set(p); next.delete(id); return next; });
    }, 2000);
  };

  const handleAddAllToCart = () => {
    const ids = new Set(items.map(i => i.id));
    setAddedToCart(ids);
    setTimeout(() => setAddedToCart(new Set()), 2000);
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-red-500">Wishlist</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {items.length} saved course{items.length !== 1 ? "s" : ""}
            {onSaleCount > 0 && (
              <span className="ml-2 text-xs font-bold text-red-500">
                · {onSaleCount} on sale now!
              </span>
            )}
          </p>
        </div>
        {items.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full self-start
              bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
              shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Add All to Cart
          </motion.button>
        )}
      </motion.div>

      {/* Value summary */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-4">
          {[
            { icon: Tag,          value: `$${items.reduce((a, i) => a + i.price, 0).toFixed(2)}`,    label: "Total Price",     color: "text-gray-900 dark:text-white"    },
            { icon: Trash2,       value: `$${totalValue.toFixed(2)}`,                                label: "Original Value",  color: "text-gray-400 line-through"      },
            { icon: ShoppingCart, value: `$${totalSave.toFixed(2)}`,                                 label: "You Save",        color: "text-emerald-600 dark:text-emerald-400" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center py-4 px-3 rounded-2xl
              bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]
              shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
              <Icon className="w-4 h-4 text-gray-400 mb-2" />
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search wishlist…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-white dark:bg-[#0f1623]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all
              shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
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
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : items.length === 0 ? (
            <EmptyWishlist key="empty" />
          ) : (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
              <p className="text-sm text-gray-400">No courses match your search.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Browse more */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex items-center justify-center pt-4">
          <Link to="/courses"
            className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Browse more courses <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}