import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BackgroundOverlay, DhanakMandala, ZardoziStar, MirrorWork, PhulkariGrid } from '../components/Layout';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import CircularGallery from '../components/CircularGallery';
import { RevealText } from '../components/Typography';

const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

    return (
        <section className="relative min-h-[90vh] md:min-h-[100vh] flex items-center overflow-hidden bg-brand-ivory border-b-4 border-brand-black pt-20 md:pt-0">
            <BackgroundOverlay />

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center relative z-10">
                <div className="lg:col-span-6 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-3 bg-brand-black text-white px-3 md:px-4 py-1.5 md:py-2 border-2 border-brand-yellow mb-4 md:mb-8 shadow-[4px_4px_0px_#FF0080]">
                            <span className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Heritage Series '26</span>
                        </div>

                        <RevealText
                            text="Woven in Vivid Light."
                            className="text-4xl sm:text-5xl md:text-9xl font-palmor font-black leading-[0.85] text-brand-black mb-6 md:mb-8 text-shadow-rituals justify-center md:justify-start"
                        />

                        <p className="text-base md:text-2xl max-w-lg mb-8 md:mb-12 text-brand-black font-semibold leading-tight mx-auto md:mx-0">
                            Where heritage meets the heavy-duty maximalism of the modern soul. High-end craft, low-key cool.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start">
                            <Link to="/shop" className="bg-brand-coral text-white px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 group border-2 border-brand-black shadow-[4px_4px_0px_#1A0A00] md:shadow-[6px_6px_0px_#1A0A00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                The Collection
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link to="/story" className="bg-white text-brand-black px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border-2 border-brand-black hover:bg-brand-yellow transition-all flex items-center justify-center">
                                Our Heritage
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-6 relative mt-8 md:mt-0">
                    <motion.div style={{ y: y1 }} className="relative z-10 flex justify-center">
                        <div className="relative w-full max-w-[300px] md:max-w-[500px] aspect-[4/5]">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                src="/Hero_Model.png"
                                alt="Dhanak Jewel Model"
                                className="w-full h-full object-contain relative z-10 drop-shadow-[20px_20px_0px_#FF0080] md:drop-shadow-[40px_40px_0px_#FF0080]"
                            />
                            <motion.div style={{ rotate }} className="absolute -top-10 md:-top-20 -right-10 md:-right-20 w-32 md:w-64 h-32 md:h-64 text-brand-yellow z-20 pointer-events-none opacity-40">
                                <DhanakMandala className="w-full h-full" />
                            </motion.div>
                            <MirrorWork className="absolute -top-5 md:-top-10 -left-5 md:-left-10 w-12 md:w-24 h-12 md:h-24 text-brand-black opacity-20 rotate-12" />
                            <MirrorWork className="absolute bottom-10 md:bottom-20 -right-6 md:-right-12 w-8 md:w-16 h-8 md:h-16 text-brand-magenta opacity-30 -rotate-45" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const FeaturedProducts = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { products } = useProducts();

    const galleryItems = React.useMemo(() => products.map(p => ({
        image: p.img,
        text: `${p.name} • PKR ${p.price}`,
        id: p.id
    })), [products]);

    const handleItemClick = React.useCallback((id: string) => {
        navigate(`/product/${id}`);
    }, [navigate]);

    return (
        <section className="py-16 md:py-32 bg-brand-ivory relative overflow-hidden h-[800px] md:h-[1200px]">
            <div className="absolute top-0 right-0 w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-brand-magenta/5 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[70vw] md:w-[40vw] h-[70vw] md:h-[40vw] bg-brand-turquoise/5 rounded-full blur-[60px] md:blur-[100px] translate-y-1/4 -translate-x-1/4" />

            <div className="absolute top-10 right-10 w-32 md:w-64 h-32 md:h-64 text-brand-yellow opacity-10 pointer-events-none">
                <ZardoziStar className="w-full h-full animate-spin-slow" />
            </div>

            <div className="container mx-auto px-6 relative z-10 h-full flex flex-col">
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-5xl md:text-[10rem] font-display font-black text-brand-black leading-[0.8] italic tracking-tighter text-shadow-rituals">The <br className="hidden md:block" /> Hits.</h3>
                        <div className="w-32 md:w-64 h-2 md:h-4 bg-brand-magenta mt-4 md:mt-6 shadow-[4px_4px_0px_#FFE600] md:shadow-[8px_8px_0px_#FFE600] mx-auto md:mx-0" />
                    </div>

                    <div className="hidden lg:block absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-0 mt-[-20px] text-center">
                        <p className="text-xs font-black uppercase tracking-[0.5em] text-brand-turquoise mb-2">Heritage in Motion</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Drag to Spin. Click to Claim.</p>
                    </div>

                    <div className="hidden md:block w-96 h-[500px] pointer-events-none mt-[-100px]">
                        <motion.img
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            src="/Catalogue_Model.png"
                            alt="Catalogue Model"
                            className="w-full h-full object-contain transition-all duration-1000"
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-grow relative mt-10"
                >
                    <CircularGallery
                        items={galleryItems}
                        bend={2}
                        textColor="#1A0A00"
                        font="900 48px sans-serif"
                        onItemClick={handleItemClick}
                    />
                </motion.div>
            </div>
        </section>
    );
};

const MarqueeStrip = () => (
    <div className="bg-brand-black text-white py-4 md:py-6 overflow-hidden border-y-4 border-brand-yellow relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 md:gap-12 px-3 md:px-6">
                    <span className="text-xl md:text-4xl font-display font-black uppercase italic tracking-tighter">Handcrafted Soul</span>
                    <ZardoziStar className="w-4 h-4 md:w-8 md:h-8 text-brand-magenta" />
                    <span className="text-xl md:text-4xl font-display font-black uppercase italic tracking-tighter">Punjabi Heritage</span>
                    <ZardoziStar className="w-4 h-4 md:w-8 md:h-8 text-brand-turquoise" />
                    <span className="text-xl md:text-4xl font-display font-black uppercase italic tracking-tighter">Rainbow Rituals</span>
                    <ZardoziStar className="w-4 h-4 md:w-8 md:h-8 text-brand-coral" />
                </div>
            ))}
        </div>
    </div>
);

const CategoryGrid = () => {
    return (
        <section className="py-40 bg-brand-ivory relative border-t-8 border-brand-black">
            <div className="container mx-auto px-6">
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12">
                    <div className="max-w-2xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-magenta mb-6">Discovery</h3>
                        <RevealText
                            text="The Fragments of Dhanak"
                            className="text-5xl md:text-8xl font-palmor font-black leading-none italic uppercase tracking-tighter"
                        />
                    </div>
                    <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] opacity-40 max-w-xs md:text-right">
                        Explore the spectrum of craft, curated for the modern heritage seeker.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-8 h-auto md:h-[900px]">
                    {/* Earrings */}
                    <Link to="/shop" className="md:col-span-8 md:row-span-1 group relative overflow-hidden border-4 border-brand-black shadow-[12px_12px_0px_#FF0080] bg-white">
                        <img
                            src="/JHUMKA1.png"
                            alt="Earrings"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1632766346170-9e5c2782c54f?w=1200"; }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-magenta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-8 left-8">
                            <h4 className="text-6xl font-display font-black text-brand-black italic tracking-tighter">Earrings</h4>
                            <p className="text-xs font-black uppercase tracking-widest text-brand-magenta">Whispering Heritage</p>
                        </div>
                        <div className="absolute top-8 right-8 bg-white border-2 border-brand-black p-4 rotate-12 group-hover:rotate-0 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </Link>

                    {/* Necklaces */}
                    <Link to="/shop" className="md:col-span-4 md:row-span-2 group relative overflow-hidden border-4 border-brand-black shadow-[12px_12px_0px_#FFE600] bg-white">
                        <img
                            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"
                            alt="Necklaces"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1200/FFE600/1A0A00?text=NECKLACES"; }}
                        />
                        <div className="absolute inset-0 bg-brand-yellow/5 group-hover:bg-brand-yellow/0 transition-colors" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                            <h4 className="text-5xl font-display font-black text-white italic tracking-tighter leading-tight drop-shadow-lg">Necklace <br /> Rituals</h4>
                            <div className="w-12 h-1 bg-brand-magenta mx-auto mt-4" />
                        </div>
                    </Link>

                    {/* Bangles */}
                    <Link to="/shop" className="md:col-span-4 md:row-span-1 group relative overflow-hidden border-4 border-brand-black shadow-[12px_12px_0px_#00C2C7] bg-white">
                        <img
                            src="/BANGLE1.png"
                            alt="Bangles"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611591439978-21fb9f8e404b?w=800"; }}
                        />
                        <div className="absolute inset-0 bg-brand-turquoise/5 group-hover:bg-brand-turquoise/0 transition-colors" />
                        <div className="absolute bottom-8 left-8">
                            <h4 className="text-4xl font-display font-black text-brand-black italic tracking-tighter">Bangles</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Rhythm & Bloom</p>
                        </div>
                    </Link>

                    {/* Accessories */}
                    <Link to="/shop" className="md:col-span-4 md:row-span-1 group relative overflow-hidden border-4 border-brand-black shadow-[12px_12px_0px_#FF4D1C] bg-white">
                        <img
                            src="https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800"
                            alt="Accessories"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/FF4D1C/FFFFFF?text=ACCESSORIES"; }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-black/20 to-transparent group-hover:from-transparent transition-all" />
                        <div className="absolute bottom-8 left-8">
                            <h4 className="text-4xl font-display font-black text-brand-ivory italic tracking-tighter drop-shadow-md">Artifacts</h4>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

const FloatingAura = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[5%]"
            >
                <ZardoziStar className="w-24 h-24 text-brand-magenta" />
            </motion.div>
            <motion.div
                animate={{
                    y: [0, 30, 0],
                    rotate: [0, -10, 0],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] right-[10%]"
            >
                <MirrorWork className="w-32 h-32 text-brand-turquoise" />
            </motion.div>
            <motion.div
                animate={{
                    x: [0, 15, 0],
                    y: [0, 15, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[60%] left-[8%]"
            >
                <DhanakMandala className="w-40 h-40 text-brand-yellow opacity-40" />
            </motion.div>
        </div>
    );
};

export const Home = () => {
    return (
        <div className="relative">
            <FloatingAura />
            <Hero />
            <MarqueeStrip />

            <FeaturedProducts />
            <CategoryGrid />

            {/* Editorial Quote Section */}
            <section className="py-24 md:py-60 bg-brand-black text-brand-ivory relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <PhulkariGrid className="w-full h-full text-white" />
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-yellow mb-8 md:mb-12 italic">Our Soul</p>
                        <h3 className="text-3xl md:text-8xl font-palmor font-black italic max-w-5xl mx-auto leading-tight tracking-tighter mb-12 md:mb-16">
                            "Jewelry isn't just <span className="text-brand-magenta underline decoration-2 md:decoration-4 underline-offset-4 md:underline-offset-8 decoration-brand-magenta">ornament</span>; it's the physical fragment of a <span className="text-brand-turquoise">dream</span> passed down through blood and thread."
                        </h3>
                        <div className="w-px h-24 md:h-32 bg-brand-magenta mx-auto" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
};