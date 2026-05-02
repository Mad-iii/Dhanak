import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { BackgroundOverlay } from '../components/Layout';
import { useCart } from '../context/CartContext';

export const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

    const formattedTotal = new Intl.NumberFormat('en-PK').format(totalPrice);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
                <BackgroundOverlay />
                <div className="container mx-auto px-6 py-24 relative z-10 text-center">
                    <h2 className="text-6xl md:text-8xl font-palmor font-black text-brand-black mb-12 italic tracking-tighter">Your Bag <br /> is Empty.</h2>
                    <p className="text-xl font-bold mb-16 opacity-60">The rainbow is waiting for you in the studio.</p>
                    <Link to="/shop" className="inline-flex items-center gap-4 bg-brand-black text-white px-12 py-6 text-sm font-black uppercase tracking-[0.3em] shadow-[12px_12px_0px_#FF0080] hover:-translate-y-1 hover:shadow-none transition-all">
                        Explore Collection <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
            <BackgroundOverlay />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <h2 className="text-6xl md:text-8xl font-palmor font-black text-brand-black mb-16 italic tracking-tighter">Your Bag.</h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8">
                        <div className="space-y-8">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white border-4 border-brand-black p-6 flex flex-col sm:flex-row gap-8 shadow-[12px_12px_0px_#FFE600] group">
                                    <div className="w-full sm:w-40 aspect-square border-2 border-brand-black overflow-hidden">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-3xl font-display font-black uppercase italic mb-2">{item.name}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-turquoise">The Heirloom Collection</p>
                                            </div>
                                            <p className="text-2xl font-display font-black italic text-brand-magenta">PKR {item.price}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-8">
                                            <div className="flex items-center gap-4 border-2 border-brand-black p-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:text-brand-magenta"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-mono font-bold text-lg px-4">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:text-brand-magenta"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-brand-black hover:text-brand-coral transition-colors"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <div className="bg-brand-black text-white p-10 border-4 border-brand-yellow shadow-[16px_16px_0px_#FF0080]">
                            <h4 className="text-3xl font-display font-black italic mb-8 border-b-2 border-white/20 pb-4">Grand Ritual</h4>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-brand-ivory/60 font-bold uppercase text-xs tracking-widest">
                                    <span>Subtotal</span>
                                    <span>PKR {formattedTotal}</span>
                                </div>
                                <div className="flex justify-between text-brand-ivory/60 font-bold uppercase text-xs tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-brand-turquoise">Free</span>
                                </div>
                                <div className="flex justify-between text-2xl font-display font-black italic pt-4">
                                    <span>Total</span>
                                    <span className="text-brand-yellow">PKR {formattedTotal}</span>
                                </div>
                            </div>
                            <Link to="/checkout" className="w-full block text-center bg-brand-magenta text-white py-6 text-sm font-black uppercase tracking-[0.3em] shadow-[8px_8px_0px_rgba(255,255,255,0.1)] hover:bg-white hover:text-brand-black transition-all">
                                Checkout <ArrowRight className="inline-block ml-2 w-4 h-4" />
                            </Link>
                            <p className="text-[8px] text-white/40 uppercase tracking-widest mt-6 text-center">Handcrafted products take 3-5 business days to ship.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
