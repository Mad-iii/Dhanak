import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundOverlay, PaisleyMotif, MirrorWork, DhanakMandala } from '../components/Layout';
import { fetchProducts } from '../services/portal';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, X, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TiltCard, MagneticWrapper } from '../components/Effects';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

export const Shop = () => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

    const handleAddToCart = (product: Product) => {
        addToCart(product, () => {
            setPendingProduct(product);
            setShowAuth(true);
        });
    };

    useEffect(() => {
        fetchProducts()
            .then(setProducts)
            .catch((err) => console.error('fetchProducts failed:', err))
            .finally(() => setLoading(false));
    }, []);

    const categories = Array.from(new Set(products.map(p => p.category)));
    const colorMap: Record<string, string> = {
        'bg-brand-magenta': 'Magenta',
        'bg-brand-turquoise': 'Turquoise',
        'bg-brand-coral': 'Coral',
        'bg-brand-yellow': 'Gold'
    };
    const colors = Array.from(new Set(products.map(p => p.color)));

    const filteredProducts = products.filter(p => {
        const categoryMatch = !selectedCategory || p.category === selectedCategory;
        const colorMatch = !selectedColor || p.color === selectedColor;
        return categoryMatch && colorMatch;
    });

    if (loading) return (
        <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
            <p className="font-display text-4xl italic animate-pulse">Loading the Palette...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
            <BackgroundOverlay />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 rotate-45 scale-150">
                    <PaisleyMotif className="w-64 h-64 text-brand-magenta" />
                </div>
                <div className="absolute top-1/2 left-0 -ml-32 opacity-5 -rotate-12 translate-y-40">
                    <MirrorWork className="w-80 h-80 text-brand-black" />
                </div>

                <div className="mb-12 md:mb-20">
                    <h2 className="text-5xl md:text-[10rem] font-palmor font-black text-brand-black leading-[0.8] mb-8 md:mb-12 italic tracking-tighter uppercase">The <br /> Palette.</h2>
                    <div className="w-full h-2 md:h-4 bg-brand-magenta relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-r from-brand-magenta via-brand-yellow to-brand-turquoise animate-shimmer scale-150" />
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-12 md:mb-16 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end justify-between border-b-4 border-brand-black pb-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
                        <div className="space-y-4 w-full">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/40 block">Category</label>
                            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar md:flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${!selectedCategory ? 'bg-brand-black text-white border-brand-black' : 'border-brand-black/10 hover:border-brand-black'}`}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-brand-magenta text-white border-brand-magenta' : 'border-brand-black/10 hover:border-brand-black'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 w-full">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/40 block">Aesthetic Tone</label>
                            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar md:flex-wrap">
                                <button
                                    onClick={() => setSelectedColor(null)}
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${!selectedColor ? 'bg-brand-black text-white border-brand-black' : 'border-brand-black/10 hover:border-brand-black'}`}
                                >
                                    Any
                                </button>
                                {colors.map(colorClass => (
                                    <button
                                        key={colorClass}
                                        onClick={() => setSelectedColor(colorClass)}
                                        className={`group flex items-center gap-3 px-4 py-2 border-2 transition-all whitespace-nowrap ${selectedColor === colorClass ? 'border-brand-black bg-brand-black text-white' : 'border-brand-black/10 hover:border-brand-black'}`}
                                    >
                                        <span className={`w-3 h-3 rounded-full border border-white/20 ${colorClass}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{colorMap[colorClass] || 'Tone'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {(selectedCategory || selectedColor) && (
                        <button
                            onClick={() => { setSelectedCategory(null); setSelectedColor(null); }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-magenta hover:underline decoration-2 underline-offset-4"
                        >
                            <X className="w-3 h-3" /> Clear Soul Filters
                        </button>
                    )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 md:gap-y-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="relative h-[480px] md:h-[550px] flex flex-col justify-center">
                                    <div className="absolute inset-x-0 top-0 h-[350px] md:h-[400px] transition-all duration-700 transform translate-y-[60px] md:translate-y-[80px] group-hover:translate-y-0 z-20">
                                        <TiltCard className="h-full border-4 border-brand-black relative overflow-hidden bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_#FF0080] md:group-hover:shadow-[12px_12px_0px_#FF0080] transition-all">
                                            <Link to={`/product/${p.id}`} className="block h-full">
                                                <img
                                                    src={p.img}
                                                    alt={p.name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1200/FF0080/FFFFFF?text=JEWELRY+PRODUCT"; }}
                                                />
                                                {p.gallery && p.gallery.length > 1 && (
                                                    <img
                                                        src={p.gallery[1]}
                                                        alt={`${p.name} alternate view`}
                                                        referrerPolicy="no-referrer"
                                                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110 group-hover:scale-100"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1200/FFE600/1A0A00?text=ALTERNATE+VIEW"; }}
                                                    />
                                                )}
                                            </Link>
                                            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2">
                                                <div className={`${p.color} text-white px-3 md:px-4 py-0.5 md:py-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-brand-black`}>
                                                    {p.tag || "Heritage"}
                                                </div>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setQuickViewProduct(p); }}
                                                    className="bg-white text-brand-black border border-brand-black px-3 py-1 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-black hover:text-white flex items-center gap-2 translate-x-[-10px] group-hover:translate-x-0"
                                                >
                                                    Quick View <Info className="w-2 h-2" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform">
                                                <MagneticWrapper strength={0.3}>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(p); }}
                                                        className="bg-white border-2 border-brand-black p-2 md:p-3 hover:bg-brand-magenta hover:text-white transition-colors"
                                                        title="Quick Add"
                                                    >
                                                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </MagneticWrapper>
                                            </div>
                                        </TiltCard>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 h-[80px] md:h-[100px] transition-all duration-700 transform -translate-y-[100px] md:-translate-y-[120px] group-hover:translate-y-0 z-10 flex flex-col justify-end">
                                        <Link to={`/product/${p.id}`}>
                                            <div className="flex justify-between items-end p-3 md:p-4 bg-brand-ivory border-x-4 border-b-4 border-brand-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] group-hover:shadow-[6px_6px_0px_#FFE600] md:group-hover:shadow-[8px_8px_0px_#FFE600] transition-all">
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-display font-black uppercase italic group-hover:text-brand-magenta transition-colors">{p.name}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-turquoise">Handcrafted Soul</p>
                                                </div>
                                                <p className="text-base md:text-lg font-mono font-black italic bg-brand-yellow px-2 border border-brand-black shrink-0">PKR {p.price}</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center border-4 border-dashed border-brand-black">
                            <p className="font-display text-4xl mb-4 italic opacity-40">The rainbow hasn't faded, it's just shifted.</p>
                            <button
                                onClick={() => { setSelectedCategory(null); setSelectedColor(null); }}
                                className="text-[10px] font-black uppercase tracking-widest text-brand-magenta hover:underline decoration-2"
                            >
                                Reset Filters to see the spectrum
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick View Modal */}
                <AnimatePresence>
                    {quickViewProduct && (
                        <QuickViewModal
                            product={quickViewProduct}
                            onClose={() => setQuickViewProduct(null)}
                            onAdd={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}
                        />
                    )}
                </AnimatePresence>

                {/* Auth Modal */}
                <AnimatePresence>
                    {showAuth && (
                        <AuthModal
                            onClose={() => { setShowAuth(false); setPendingProduct(null); }}
                            onSuccess={() => { if (pendingProduct) addToCart(pendingProduct); setPendingProduct(null); }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const QuickViewModal = ({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-brand-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-brand-ivory w-full max-w-5xl max-h-[90vh] border-4 border-brand-black shadow-[20px_20px_0px_rgba(0,0,0,1)] overflow-hidden relative flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-brand-black text-white p-2 border-2 border-brand-black shadow-[4px_4px_0px_#FF0080] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="w-full md:w-1/2 aspect-square md:aspect-auto border-b-4 md:border-b-0 md:border-r-4 border-brand-black relative bg-white">
                    <img
                        src={product.img}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1000/FF0080/FFFFFF?text=JEWELRY+PIECE"; }}
                    />
                    <div className="absolute bottom-6 left-6">
                        <DhanakMandala className="w-20 h-20 text-brand-magenta/20 animate-spin-slow" />
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto no-scrollbar bg-brand-ivory flex flex-col">
                    <div className="mb-8">
                        <span className={`inline-block px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white border border-brand-black mb-4 ${product.color}`}>
                            {product.category} • {product.tag || 'Heritage'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter text-brand-black leading-tight mb-4">
                            {product.name}
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-mono font-black italic bg-brand-yellow px-4 border-2 border-brand-black">
                                PKR {product.price}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8 flex-grow">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/40 mb-4 flex items-center gap-2">
                                <div className="w-8 h-[2px] bg-brand-turquoise" /> The Tale
                            </h4>
                            <p className="text-sm font-medium leading-relaxed opacity-70 italic">
                                "{product.description}"
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/40 mb-4 flex items-center gap-2">
                                <div className="w-8 h-[2px] bg-brand-coral" /> Essence
                            </h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {product.materials}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-4">
                        <button
                            onClick={onAdd}
                            className="group relative w-full bg-brand-black text-brand-ivory py-6 border-2 border-brand-black shadow-[8px_8px_0px_#00C2C7] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                                Claim this fragment <ShoppingBag className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            </span>
                            <div className="absolute inset-0 bg-brand-turquoise translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full scale-150 blur-2xl opacity-20" />
                        </button>

                        <Link
                            to={`/product/${product.id}`}
                            onClick={onClose}
                            className="text-center text-[10px] font-black uppercase tracking-widest hover:text-brand-magenta transition-colors flex items-center justify-center gap-2"
                        >
                            Explore Full Ritual <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};