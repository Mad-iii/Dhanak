import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, Star, Heart, Share2, Check } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { BackgroundOverlay, DhanakMandala } from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CircularGallery from '../components/CircularGallery';
import { MagneticWrapper } from '../components/Effects';
import ProductReviews from '../components/ProductReviews';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const product = products.find(p => p.id === id);
    const [activeImage, setActiveImage] = useState(product?.img || '');
    const [selectedSize, setSelectedSize] = useState('Standard');

    const { addToCart } = useCart();
    const { user } = useAuth();

    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    useEffect(() => {
        if (product) {
            setActiveImage(product.img);
            setSelectedSize('Standard');
            window.scrollTo(0, 0);
        }
    }, [product]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-4xl animate-pulse">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-display text-4xl">Rainbow Lost...</div>;

    const relatedHistory = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 6);
    const galleryItems = relatedHistory.map(p => ({
        image: p.img,
        text: `${p.name} • PKR ${p.price}`,
        id: p.id
    }));

    const handleRelatedClick = (relatedId: string) => {
        navigate(`/product/${relatedId}`);
    };

    return (
        <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
            <BackgroundOverlay />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <Link to="/shop" className="inline-flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-12 hover:text-brand-magenta transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
                    {/* Image Gallery */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2 flex md:flex-col gap-4 order-2 md:order-1">
                            {product.gallery?.map((img, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={{
                                        scale: activeImage === img ? 1.1 : 1,
                                        zIndex: activeImage === img ? 10 : 1
                                    }}
                                    className={`relative aspect-square border-2 border-brand-black overflow-hidden transition-all duration-300 ${activeImage === img ? 'shadow-[4px_4px_0px_#FF0080] border-brand-magenta' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} ${idx}`}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400/FF0080/FFFFFF?text=JEWELRY"; }}
                                    />
                                    {activeImage === img && (
                                        <motion.div
                                            layoutId="active-thumb"
                                            className="absolute inset-0 border-2 border-brand-magenta"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="md:col-span-10 order-1 md:order-2">
                            <div className="aspect-[4/5] border-4 border-brand-black bg-white shadow-[12px_12px_0px_#FF0080] overflow-hidden relative">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.img
                                        key={activeImage}
                                        src={activeImage}
                                        alt={product.name}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1000/FF0080/FFFFFF?text=JEWELRY+PIECE"; }}
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -300, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="aspect-square border-4 border-brand-black bg-white shadow-[8px_8px_0px_#FFE600] overflow-hidden">
                                    <img
                                        src={product.gallery?.[1] || product.img}
                                        alt={product.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x800/FFE600/1A0A00?text=DETAIL"; }}
                                    />
                                </div>
                                <div className="aspect-square border-4 border-brand-black bg-brand-black p-8 text-brand-ivory flex flex-col justify-center items-center text-center">
                                    <DhanakMandala className="w-16 h-16 mb-4 text-brand-yellow animate-spin-slow" />
                                    <p className="text-sm font-display font-black italic uppercase tracking-tighter">Lahore <br /> Heritage</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-4 mb-6">
                            <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white ${product.color} border border-brand-black shadow-[4px_4px_0px_#000]`}>
                                {product.tag || 'Heritage'}
                            </span>
                            <div className="flex items-center gap-1 text-brand-yellow">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-brand-black stroke-2" />)}
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-8xl font-palmor font-black text-brand-black mb-4 leading-tight uppercase italic text-shadow-rituals">{product.name}</h2>
                        <p className="font-mono text-2xl md:text-3xl font-black text-brand-magenta mb-8 italic bg-brand-yellow inline-block px-4 border-2 border-brand-black">PKR {product.price}</p>

                        <p className="text-lg md:xl leading-relaxed text-brand-black font-medium mb-12">
                            {product.description}
                        </p>

                        <div className="mb-12">
                            <h5 className="text-xs font-black uppercase tracking-widest mb-4">Fit & Polish</h5>
                            <div className="flex gap-4">
                                {['Standard', 'Bridal Size'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-brand-black transition-all ${selectedSize === size ? 'bg-brand-black text-white' : 'bg-transparent text-brand-black hover:bg-brand-yellow'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <MagneticWrapper strength={0.1}>
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full py-6 px-12 text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 border-2 border-brand-black shadow-[10px_10px_0px_#FF0080] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${isAdded ? 'bg-brand-turquoise text-brand-black' : 'bg-brand-black text-white'}`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isAdded ? (
                                            <motion.div
                                                key="added"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="flex items-center gap-4"
                                            >
                                                <Check className="w-5 h-5" /> Added to Ritual
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="normal"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-4"
                                            >
                                                <ShoppingBag className="w-5 h-5" /> Add this Rainbow to Bag
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </MagneticWrapper>
                            <div className="flex gap-4">
                                <button className="flex-1 border-2 border-brand-black py-4 flex items-center justify-center gap-2 hover:bg-white transition-all font-black text-[10px] uppercase tracking-widest">
                                    <Heart className="w-4 h-4" /> Wishlist
                                </button>
                                <button className="flex-1 border-2 border-brand-black py-4 flex items-center justify-center gap-2 hover:bg-white transition-all font-black text-[10px] uppercase tracking-widest">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </div>

                        <div className="mt-16 pt-16 border-t-2 border-brand-black/10">
                            <h5 className="text-xs font-black uppercase tracking-widest mb-6 border-l-4 border-brand-turquoise pl-4">The Making</h5>
                            <p className="text-sm font-medium leading-relaxed opacity-70">
                                {product.materials}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sticky Mobile Add to Cart */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t-4 border-brand-black p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-500">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Price</span>
                        <span className="text-lg font-mono font-black italic text-brand-magenta">PKR {product.price}</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-2 border-brand-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${isAdded ? 'bg-brand-turquoise' : 'bg-brand-magenta text-white'}`}
                    >
                        {isAdded ? (
                            <><Check className="w-4 h-4" /> Added</>
                        ) : (
                            <><ShoppingBag className="w-4 h-4" /> Add to Ritual</>
                        )}
                    </button>
                </div>

                {/* Heritage Story Section */}
                <section className="py-32 border-y-4 border-brand-black bg-brand-black text-brand-ivory -mx-6 px-6 overflow-hidden relative mb-32">
                    <div className="absolute top-10 right-10 w-64 h-64 text-brand-yellow opacity-10 animate-spin-slow">
                        <DhanakMandala className="w-full h-full" />
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-turquoise mb-8">The Ancestral Thread</h3>
                            <h2 className="text-4xl md:text-7xl font-palmor font-black italic uppercase tracking-tighter leading-none mb-12">
                                Crafted in the <span className="text-brand-magenta">Walled City</span>
                            </h2>
                            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-80 mb-8">
                                Every curve of this piece was born in the heart of Lahore, where artisans have been speaking the language of gold and glass for five centuries.
                            </p>
                            <div className="flex items-center gap-4 text-brand-yellow">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="text-xs font-black uppercase tracking-widest">Certified Heritage Craft</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="border-4 border-brand-ivory aspect-square overflow-hidden shadow-[16px_16px_0px_#FF0080]">
                                <img
                                    src="https://images.unsplash.com/photo-1590548784585-643d2b9f2922?w=800"
                                    alt="Artisan Hands"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x800/FF0080/FFFFFF?text=ARTISAN"; }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reviews Section */}
                <div className="mt-32 pb-32 max-w-4xl mx-auto">
                    <ProductReviews
                        productId={product.id}
                        productName={product.name}
                        storeId={import.meta.env.VITE_STORE_ID ?? ''}
                        currentUser={user ? {
                            email: user.email ?? '',
                            name: user.displayName ?? user.email?.split('@')[0] ?? '',
                        } : null}
                    />
                </div>

                {/* Related Products */}
                <div className="mt-32 md:mt-48">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-5xl md:text-9xl font-palmor font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
                                You Might <br className="hidden md:block" /> <span className="text-brand-magenta">Also Adore</span>
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Continue the Rainbow Ritual</p>
                        </div>
                        <Link to="/shop" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 border-brand-black pb-1 hover:text-brand-magenta hover:border-brand-magenta transition-all mx-auto md:mx-0">View Full Spectrum</Link>
                    </div>

                    <div className="h-[400px] md:h-[600px] -mx-6">
                        {galleryItems.length > 0 ? (
                            <CircularGallery
                                items={galleryItems}
                                bend={1.5}
                                textColor="#1A0A00"
                                font="900 24px sans-serif"
                                onItemClick={handleRelatedClick}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border-4 border-dashed border-brand-black/20">
                                <p className="font-display text-2xl italic tracking-tighter opacity-40 text-center">The ritual is unique.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};