import React from 'react';
import { motion } from 'motion/react';
import { BackgroundOverlay, DhanakMandala, FloralVine } from '../components/Layout';

export const Story = () => {
    return (
        <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
            <BackgroundOverlay />
            
            <div className="container mx-auto px-6 py-24 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-7xl md:text-9xl font-palmor font-black text-brand-black leading-[0.85] mb-16 italic tracking-tighter">
                            The Soul <br /> of <span className="text-brand-magenta">Dhanak.</span>
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-center mb-32">
                        <div className="md:col-span-6">
                            <div className="relative aspect-square border-4 border-brand-black p-4 bg-white shadow-[20px_20px_0px_#FFE600] group">
                                <img 
                                    src="https://images.unsplash.com/photo-1620331700435-081e6fa39b81?q=80&w=1200&auto=format&fit=crop" 
                                    alt="Artisan at work" 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                                    referrerPolicy="no-referrer"
                                />
                                <DhanakMandala className="absolute -bottom-10 -left-10 w-40 h-40 text-brand-magenta animate-spin-slow opacity-20" />
                            </div>
                        </div>
                        <div className="md:col-span-6">
                            <h3 className="text-4xl font-display font-black italic mb-8 uppercase tracking-widest text-brand-coral border-b-4 border-brand-coral pb-4 inline-block">The Preservation</h3>
                            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                                In the heart of old cities, where the air hums with history and the rhythmic tap of a jeweler's hammer, Dhanak was born. We are not just a jewelry brand; we are a rebellion against the fading of craftsmanship.
                            </p>
                            <p className="text-lg opacity-80 leading-relaxed font-medium">
                                Founded in 2026, Dhanak (meaning 'Rainbow' in Punjabi) aims to bring the vivid, heavy-duty maximalism of heritage jewelry to the modern, global street. We believe that heritage is not a relic—it's a lifestyle.
                            </p>
                        </div>
                    </div>

                    <div className="bg-brand-black text-brand-ivory p-12 md:p-24 border-8 border-brand-magenta relative overflow-hidden mb-32">
                        <FloralVine className="absolute top-[-50px] right-[-50px] w-96 h-96 text-white/5 rotate-45" />
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-5xl md:text-7xl font-palmor font-black italic mb-10 text-brand-yellow">"Every gem is a memory, every loop is a lineage."</h2>
                            <p className="text-xl opacity-60 font-black uppercase tracking-[0.3em] italic">— The Artisan's Vow</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'The Craft', text: 'Handcrafted by 4th generation artisans in Lahore and Amritsar using century-old techniques.', color: 'text-brand-turquoise' },
                            { title: 'The Vision', text: 'Fusing heavy-duty metalwork with vivid gemstones for the bold, maximalist soul.', color: 'text-brand-magenta' },
                            { title: 'The Future', text: 'Creating a circular ecosystem where heritage thrives and artisans are celebrated.', color: 'text-brand-coral' }
                        ].map((item, idx) => (
                            <div key={idx} className="border-4 border-brand-black p-10 bg-white hover:-translate-y-4 hover:shadow-[12px_12px_0px_#FFE600] transition-all flex flex-col justify-between aspect-square">
                                <h4 className={`text-3xl font-display font-black uppercase italic ${item.color}`}>{item.title}</h4>
                                <p className="font-medium text-lg leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
