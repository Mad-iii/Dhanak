import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, Instagram, Twitter, Pin, ArrowRight, X, Trash2, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { CustomCursor } from './CustomCursor';

// Shared Motifs
// ... (rest of motifs)
export const DhanakMandala = ({ className }: { className?: string; key?: React.Key }) => (
  <svg viewBox="0 0 200 200" className={className} fill="currentColor">
    <path d="M100 20 C80 20 60 40 60 60 C60 80 80 100 100 100 C120 100 140 80 140 60 C140 40 120 20 100 20 Z" opacity="0.8" />
    <path d="M100 180 C80 180 60 160 60 140 C60 120 80 100 100 100 C120 100 140 120 140 140 C140 160 120 180 100 180 Z" opacity="0.8" />
    <circle cx="100" cy="100" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="100" cy="100" r="5" />
    {[...Array(8)].map((_, i) => (
      <path
        key={i}
        d="M100 100 L110 70 L100 40 L90 70 Z"
        transform={`rotate(${i * 45} 100 100)`}
      />
    ))}
  </svg>
);

export const PaisleyMotif = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 90C30 90 10 70 10 50C10 30 30 10 50 10C70 10 90 30 90 50C90 70 70 90 50 90ZM50 80C66.6 80 80 66.6 80 50C80 33.4 66.6 20 50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80Z" opacity="0.3" />
    <path d="M50 70C40 70 30 60 30 50C30 40 40 30 50 30C60 30 70 40 70 50C70 60 60 70 50 70ZM50 60C55.5 60 60 55.5 60 50C60 44.5 55.5 40 50 40C44.5 40 40 44.5 40 50C40 55.5 44.5 60 50 60Z" />
  </svg>
);

export const LotusMotif = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 80 C30 80 10 60 50 20 C90 60 70 80 50 80 Z" />
    <path d="M50 80 C20 80 0 50 50 30 C100 50 80 80 50 80 Z" opacity="0.4" />
    <path d="M50 80 C40 80 30 70 50 50 C70 70 60 80 50 80 Z" opacity="0.6" />
  </svg>
);

export const ZardoziStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
    <circle cx="50" cy="50" r="10" />
    <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" opacity="0.5" />
  </svg>
);

export const PhulkariGrid = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="0.5">
    <path d="M0 0 L100 100 M100 0 L0 100 M50 0 L50 100 M0 50 L100 50" opacity="0.2" />
    <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
    <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" opacity="0.6" />
  </svg>
);

export const MirrorWork = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle cx="50" cy="50" r="20" fill="white" fillOpacity="0.8" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M50 10 L50 25 M90 50 L75 50 M50 90 L50 75 M10 50 L25 50" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const FloralVine = ({ className }: { className?: string; key?: React.Key }) => (
  <svg viewBox="0 0 100 150" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M50 150 C50 100 80 80 80 40 C80 20 60 10 50 10 C40 10 20 20 20 40 C20 80 50 100 50 150" />
    <circle cx="85" cy="90" r="3" fill="currentColor" stroke="none" />
    <circle cx="15" cy="60" r="3" fill="currentColor" stroke="none" />
  </svg>
);

export const BackgroundOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    {/* Large Mandalas */}
    <DhanakMandala className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] text-brand-magenta opacity-[0.06] rotate-12 scale-110" />
    <DhanakMandala className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] text-brand-yellow opacity-[0.1] -rotate-12" />
    <DhanakMandala className="absolute top-[40%] right-[-20%] w-[40vw] h-[40vw] text-brand-turquoise opacity-[0.04] rotate-45" />

    {/* Embroidery Motifs */}
    <PaisleyMotif className="absolute top-[15%] right-[15%] w-[12vw] h-[12vw] text-brand-coral opacity-[0.08] rotate-[45deg]" />
    <PaisleyMotif className="absolute bottom-[20%] left-[10%] w-[15vw] h-[15vw] text-brand-magenta opacity-[0.05] -rotate-[15deg]" />
    
    <LotusMotif className="absolute top-[35%] left-[5%] w-[10vw] h-[10vw] text-brand-turquoise opacity-[0.07] rotate-12" />
    <LotusMotif className="absolute bottom-[40%] right-[10%] w-[8vw] h-[8vw] text-brand-yellow opacity-[0.06] -rotate-45" />

    <ZardoziStar className="absolute top-[5%] right-[40%] w-[6vw] h-[6vw] text-brand-yellow opacity-[0.1] animate-pulse" />
    <ZardoziStar className="absolute bottom-[5%] left-[40%] w-[8vw] h-[8vw] text-brand-coral opacity-[0.08]" />
    
    <MirrorWork className="absolute top-[60%] left-[25%] w-[5vw] h-[5vw] text-brand-ivory opacity-[0.1]" />
    <MirrorWork className="absolute bottom-[25%] right-[35%] w-[7vw] h-[7vw] text-brand-turquoise opacity-[0.05]" />

    <PhulkariGrid className="absolute inset-0 w-full h-full text-brand-black opacity-[0.02]" />

    <FloralVine className="absolute top-[20%] left-[18%] w-[15vw] h-[15vw] text-brand-turquoise opacity-[0.03] rotate-[30deg]" />
    <FloralVine className="absolute bottom-[10%] right-[20%] w-[20vw] h-[20vw] text-brand-coral opacity-[0.03] -rotate-[10deg]" />
    
    {/* Central Focus (very faint) */}
    <DhanakMandala className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] text-brand-black opacity-[0.015]" />
  </div>
);

const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[100] cursor-pointer"
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-ivory z-[101] shadow-2xl flex flex-col border-l-4 border-brand-black"
                    >
                        <div className="p-6 border-b-4 border-brand-black flex items-center justify-between bg-brand-magenta text-white">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6" />
                                <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter">Your Ritual Bag</h2>
                            </div>
                            <X className="w-8 h-8 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsCartOpen(false)} />
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-24 h-24 text-brand-magenta/20 mb-8">
                                        <DhanakMandala className="w-full h-full" />
                                    </div>
                                    <h3 className="text-2xl font-display font-black uppercase italic mb-4">Your Bag is Lightweight</h3>
                                    <p className="text-sm font-medium opacity-60 mb-8 max-w-[200px]">It seems you haven't captured any rainbow fragments yet.</p>
                                    <button 
                                        onClick={() => setIsCartOpen(false)}
                                        className="bg-brand-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-brand-black shadow-[4px_4px_0px_#FF0080] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                    >
                                        Start Your Journey
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-24 h-24 border-2 border-brand-black relative overflow-hidden shrink-0 bg-white">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-widest">{item.name}</h4>
                                                    <p className="text-[10px] font-bold text-brand-magenta italic">PKR {item.price}</p>
                                                </div>
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-brand-black/20 hover:text-brand-coral transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex border-2 border-brand-black">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-2 py-1 hover:bg-brand-black hover:text-white transition-colors border-r-2 border-brand-black"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-4 py-1 text-xs font-black">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-2 py-1 hover:bg-brand-black hover:text-white transition-colors border-l-2 border-brand-black"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t-4 border-brand-black bg-white">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Ritual Total</span>
                                        <span className="text-3xl font-mono font-black italic text-brand-black">PKR {totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40 text-right">
                                        Tax & Shipping <br /> Calculated at Checkout
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="w-full bg-brand-black text-white py-6 text-sm font-black uppercase tracking-[0.3em] border-2 border-brand-black shadow-[8px_8px_0px_#FFE600] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4"
                                >
                                    Finalise fragments <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-[10px] font-black uppercase tracking-widest text-center mt-4 opacity-40">Free Express Delivery in Pakistan</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-brand-ivory border-b-2 border-brand-black/20 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Menu className="w-6 h-6 lg:hidden cursor-pointer" onClick={() => setMobileMenuOpen(true)} />
            <div className="hidden lg:flex gap-10 uppercase text-[10px] font-black tracking-[0.2em]">
              <NavLink to="/" className={({ isActive }) => `group relative ${isActive ? 'text-brand-magenta' : ''}`}>
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-magenta transition-all group-hover:w-full" />
              </NavLink>
              <NavLink to="/shop" className={({ isActive }) => `group relative ${isActive ? 'text-brand-magenta' : ''}`}>
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-magenta transition-all group-hover:w-full" />
              </NavLink>
              <NavLink to="/story" className={({ isActive }) => `group relative ${isActive ? 'text-brand-magenta' : ''}`}> 
                Our Story 
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-magenta transition-all group-hover:w-full" />
              </NavLink>
            </div>
          </div>

          <Link to="/" className="text-3xl md:text-5xl font-display font-black tracking-tight text-brand-black flex items-center gap-0.5">
             <span className="text-brand-magenta italic">D</span>
             <span className="text-brand-turquoise">h</span>
             <span className="text-brand-yellow">a</span>
             <span className="text-brand-coral">n</span>
             <span className="text-brand-magenta italic">a</span>
             <span className="text-brand-turquoise">k</span>
          </Link>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative group cursor-pointer bg-transparent border-none p-0"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-coral text-white text-[9px] font-black px-1.5 py-0.5 rounded-none border border-brand-black shadow-[2px_2px_0px_#1A0A00]">
                  {totalItems < 10 ? `0${totalItems}` : totalItems}
                </span>
              )}
            </button>
            <button 
              onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block bg-brand-black text-brand-ivory px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-black border-2 border-brand-black transition-all"
            >
              Join the Circle
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-brand-magenta flex flex-col"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <DhanakMandala className="absolute top-20 right-[-20%] w-80 h-80 text-white rotate-45" />
                <ZardoziStar className="absolute bottom-20 left-[-10%] w-64 h-64 text-white -rotate-12" />
            </div>

            <div className="flex justify-between items-center p-8 relative z-10">
              <h2 className="text-3xl font-display font-black text-white italic">Dhanak</h2>
              <X className="w-10 h-10 text-white cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="flex flex-col gap-6 p-8 relative z-10 overflow-y-auto">
              {['Home', 'Shop', 'Story'].map((item, idx) => (
                <Link 
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative"
                >
                  <motion.span 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="text-6xl font-display font-black text-white italic group-hover:text-brand-yellow transition-colors flex items-center gap-4"
                  >
                    {item}
                    <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-brand-yellow" />
                  </motion.span>
                </Link>
              ))}
              <button 
                onClick={() => {
                   setMobileMenuOpen(false);
                   setIsCartOpen(true);
                }}
                className="group relative text-left bg-transparent border-none p-0"
              >
                <motion.span 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl font-display font-black text-white italic group-hover:text-brand-yellow transition-colors flex items-center gap-4"
                >
                  Cart
                  <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-brand-yellow" />
                </motion.span>
              </button>
            </div>

            <div className="mt-auto p-8 border-t border-white/20 bg-brand-black/10 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-6">Explore the Spectrum</p>
               <div className="flex gap-8">
                  <Instagram className="text-white w-6 h-6" />
                  <Twitter className="text-white w-6 h-6" />
                  <Pin className="text-white w-6 h-6" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="bg-brand-black text-brand-ivory pt-32 pb-16 overflow-hidden relative border-t-4 border-brand-yellow">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-8 rotate-12">
           {[...Array(18)].map((_, i) => <DhanakMandala key={i} className="w-32 h-32 text-brand-magenta" />)}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
          <div className="lg:col-span-12 xl:col-span-5">
            <Link to="/" className="text-6xl md:text-8xl font-display font-black text-brand-magenta italic mb-10 tracking-tighter block hover:opacity-80 transition-opacity">Dhanak</Link>
            <p className="text-xl text-brand-ivory/70 mb-12 max-w-xl leading-relaxed font-medium">
              We are the curators of the rainbow. Dedicated to preserving the intricate beauty of Punjabi heritage jewelry for the bold generation.
            </p>
            <div className="flex gap-6">
              {[Instagram, Twitter, Pin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-14 h-14 border-2 border-brand-ivory/20 flex items-center justify-center hover:bg-brand-magenta hover:border-brand-magenta hover:-rotate-12 hover:-translate-y-2 transition-all">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-2">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow mb-10 border-b border-brand-ivory/20 pb-4">Collections</h5>
            <ul className="space-y-6 text-sm font-bold tracking-widest uppercase">
              <li><Link to="/shop" className="hover:text-brand-magenta transition-all flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Bridal Heritage</Link></li>
              <li><Link to="/shop" className="hover:text-brand-magenta transition-all flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Everyday Rainbow</Link></li>
              <li><Link to="/shop" className="hover:text-brand-magenta transition-all flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Festive Edits</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 xl:col-span-2">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow mb-10 border-b border-brand-ivory/20 pb-4">Our Home</h5>
            <ul className="space-y-6 text-sm font-bold tracking-widest uppercase">
              <li><a href="#" className="hover:text-brand-magenta transition-all">Our Artisans</a></li>
              <li><a href="#" className="hover:text-brand-magenta transition-all">The Craft Study</a></li>
              <li><a href="#" className="hover:text-brand-magenta transition-all">Wholesale</a></li>
            </ul>
          </div>

          <div id="newsletter" className="lg:col-span-4 xl:col-span-3">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow mb-10 border-b border-brand-ivory/20 pb-4">Rainbow Mail</h5>
            <p className="text-xs mb-8 text-white font-bold leading-relaxed tracking-widest">Get early access to drops and heritage stories before anyone else.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="READY FOR THE DROP?" 
                className="w-full bg-transparent border-b-2 border-brand-ivory py-4 text-xs font-black focus:outline-none focus:border-brand-magenta transition-colors placeholder:text-white/40 tracking-[0.2em]"
              />
              <button className="absolute right-0 bottom-4 text-brand-magenta hover:text-white transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-brand-ivory/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-white">
          <p>© 2026 Dhanak World. Handcrafted with Heritage.</p>
          <p className="flex items-center gap-2 italic">Crafted with Soul in Old Lahore <span className="animate-pulse">✨</span></p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-magenta transition-colors">Cookies</a>
            <a href="#" className="hover:text-brand-magenta transition-colors">Safety</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="bg-brand-ivory selection:bg-brand-yellow selection:text-brand-black min-h-screen flex flex-col relative">
      <AnimatePresence mode="wait">
        <motion.div
           key={location.pathname + "-reveal"}
           initial={{ scaleY: 1 }}
           animate={{ scaleY: 0 }}
           exit={{ scaleY: 0 }}
           transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
           className="fixed inset-0 z-[100] bg-brand-black origin-top pointer-events-none flex items-center justify-center"
        >
            <h2 className="text-brand-ivory font-display text-8xl italic font-black animate-pulse">Dhanak</h2>
        </motion.div>
      </AnimatePresence>

      <CustomCursor />
      <div className="grain" />
      <CartDrawer />
      <Navbar />
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
