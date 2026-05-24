import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MoveRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import SafeImage from '../common/SafeImage';
import api from '../../api';



const TrendingSlider = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(4); // Render exactly 4 initially for clean centering
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const { data } = await api.get('/products/trending');
                setProducts(data);
            } catch (error) {
                console.error('Error fetching trending products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const checkScrollState = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Add a small buffer of 5px to avoid floating point precision issues
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScrollState, { passive: true });
            window.addEventListener('resize', checkScrollState);
            // Initial check after a slight delay to ensure layout is done
            setTimeout(checkScrollState, 100);
            return () => {
                el.removeEventListener('scroll', checkScrollState);
                window.removeEventListener('resize', checkScrollState);
            };
        }
    }, [products, visibleCount, loading]);

    const handleScroll = (direction) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollAmount = container.offsetWidth * 0.8; // Scroll by 80% of the visible container width
        
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleLoadMore = () => {
        const nextCount = Math.min(visibleCount + 4, products.length);
        setVisibleCount(nextCount);
        
        // Wait for render, then scroll to smoothly reveal new cards
        setTimeout(() => {
            if (scrollRef.current) {
                const cardWidth = scrollRef.current.querySelector('.group\\/item')?.offsetWidth || 300;
                scrollRef.current.scrollTo({
                    left: scrollRef.current.scrollLeft + (cardWidth * 2),
                    behavior: 'smooth'
                });
                checkScrollState();
            }
        }, 100);
    };

    const visibleProducts = products.slice(0, visibleCount);



    const cardVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: (idx) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                delay: idx * 0.05,
                ease: [0.25, 1, 0.5, 1]
            }
        })
    };

    return (
        <section className="relative overflow-hidden pt-24 pb-20 md:pt-28 md:pb-24 border-t border-b border-[#330020]/10 bg-[#330020] bg-[radial-gradient(circle_at_top,rgba(138,143,104,0.06)_0%,rgba(30,10,22,1)_100%)] transition-colors duration-500">
            {/* Ultra Subtle Editorial Grain Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0 bg-repeat" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Centered Section Header */}
                <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-14">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                        className="flex items-center gap-4 mb-3"
                    >
                        <div className="w-8 h-[1px] bg-[#8A8F68]/40" />
                        <span className="text-[#8A8F68] font-bold uppercase tracking-[0.3em] text-[10px]">LIVING SPACES</span>
                        <div className="w-8 h-[1px] bg-[#8A8F68]/40" />
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 1, 0.5, 1] }}
                        className="text-5xl md:text-7xl font-serif text-[#F6F1EB] font-semibold tracking-tight leading-[1.05] mb-4 italic"
                    >
                        Trending Interiors
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        whileInView={{ width: "8rem", opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                        className="h-[2px] bg-[#8A8F68]/80 rounded-full mb-4 mx-auto"
                    />
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                        className="text-base md:text-lg text-[rgba(246,241,235,0.72)] font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        Discover the active pieces defining modern Indian luxury this season. Handpicked for their architectural relevance, contemporary lines, and structural artisanship.
                    </motion.p>
                </div>

                {/* Grid & Slider Area */}
                {loading ? (
                    <div className="flex gap-6 overflow-hidden py-6 max-w-[1600px] mx-auto select-none pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                            <div 
                                key={i} 
                                className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)] flex-shrink-0 h-[395px] md:h-[465px] bg-white/5 border border-white/5 animate-pulse rounded-[18px]" 
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-32 text-center bg-white/5 backdrop-blur-sm rounded-[3rem] border border-white/5 shadow-soft">
                        <p className="text-[#F6F1EB]/40 font-serif text-3xl mb-4 italic tracking-tight">Our curators are currently selecting new pieces.</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F6F1EB]/30">Please explore the full collection in the meantime.</p>
                    </div>
                ) : (
                    <div className="relative group/slider">
                        {/* Left Scroll Indicator & Button */}
                        <button 
                            onClick={() => handleScroll('left')}
                            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#F6F1EB] text-[#330020] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#330020]/10 hover:scale-110 active:scale-95 transition-all duration-300 md:opacity-0 md:-translate-x-4 md:group-hover/slider:opacity-100 md:group-hover/slider:translate-x-0 ${!canScrollLeft && 'hidden'}`}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={24} className="ml-[-2px]" />
                        </button>

                        {/* Right Scroll Indicator & Button */}
                        <button 
                            onClick={() => handleScroll('right')}
                            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#F6F1EB] text-[#330020] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#330020]/10 hover:scale-110 active:scale-95 transition-all duration-300 md:opacity-0 md:translate-x-4 md:group-hover/slider:opacity-100 md:group-hover/slider:translate-x-0 ${!canScrollRight && 'hidden'}`}
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={24} className="mr-[-2px]" />
                        </button>

                        {/* Slider Container */}
                        <div 
                            ref={scrollRef}
                            className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scroll-smooth py-6 px-1 relative z-10 select-none scrollbar-none snap-x snap-mandatory" 
                            style={{ 
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none', 
                                WebkitOverflowScrolling: 'touch' 
                            }}
                        >
                            <AnimatePresence mode='popLayout'>
                                {visibleProducts.map((product, idx) => (
                                    <motion.div
                                        key={`trend-${product._id || idx}`}
                                        custom={idx}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={cardVariants}
                                        className="group/item flex-shrink-0 w-[85vw] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)] snap-center sm:snap-start"
                                    >
                                        <Link to={`/products/${product.slug || product._id}`} className="block h-full">
                                            <div 
                                                className="w-full h-[395px] md:h-[465px] overflow-hidden flex flex-col justify-between rounded-[24px] bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.10] shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:border-white/[0.22] hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)] hover:bg-white/[0.05] hover:-translate-y-[6px] transition-all duration-400 ease-out"
                                            >
                                                {/* Image Area */}
                                                <div className="pt-3 px-3 w-full h-[58%]">
                                                    <div className="relative w-full h-full overflow-hidden bg-black/[0.1] rounded-[1.5rem] border border-white/[0.05]">
                                                        {/* Enhanced trending badge with glow */}
                                                        <span className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 bg-[#330020] text-[#F6F1EB] text-[8px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/[0.08] shadow-[0_4px_12px_rgba(51,0,32,0.25)]">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8A8F68] opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8A8F68]"></span>
                                                            </span>
                                                            Trending
                                                        </span>

                                                        <SafeImage 
                                                            src={product.images?.[0]?.url || product.image} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover/item:scale-[1.03] transition-transform duration-500 ease-out"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-5 md:p-6 flex flex-col justify-between h-[42%] bg-black/[0.01]">
                                                    <div className="space-y-1.5 md:space-y-2 text-center">
                                                        <span className="font-sans text-[9px] md:text-[10px] font-semibold tracking-[2px] uppercase text-[#8A8F68] block">
                                                            {product.category?.name || 'Exclusive Selection'}
                                                        </span>
                                                        
                                                        <h3 className="font-sans text-[18px] md:text-[20px] font-semibold leading-[1.35] tracking-[-0.2px] text-[#F6F1EB] line-clamp-2 h-[2.5rem] md:h-[2.8rem] overflow-hidden group-hover/item:text-white transition-colors duration-300">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="space-y-2 md:space-y-2.5 text-center">
                                                        <div className="w-full h-[1px] bg-white/5" />
                                                        <div className="flex flex-col items-center justify-center gap-1 min-w-0">
                                                            <span className="font-sans text-[22px] md:text-[24px] font-bold text-[#F6F1EB]">
                                                                ₹{product.price?.toLocaleString('en-IN')}
                                                            </span>
                                                            
                                                            {product.originalPrice > product.price && (
                                                                <div className="flex items-center gap-2">
                                                                     <span className="font-sans text-[12px] opacity-45 line-through text-[#F6F1EB]">
                                                                        ₹{product.originalPrice?.toLocaleString('en-IN')}
                                                                    </span>
                                                                    <span className="font-sans text-[8px] md:text-[9px] font-semibold tracking-[2px] uppercase text-[#8A8F68] bg-[#8A8F68]/20 px-2 py-0.5 rounded-md">
                                                                        SAVE ₹{Math.round(product.originalPrice - product.price).toLocaleString('en-IN')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Bottom CTA Block */}
                <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 relative z-20">
                    {visibleCount < products.length && (
                        <button
                            onClick={handleLoadMore}
                            className="px-10 py-4.5 rounded-full bg-[#F6F1EB] text-[#330020] font-sans text-[11px] font-bold uppercase tracking-[4px] transition-all duration-500 hover:bg-[#4A012E] hover:text-[#F6F1EB] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(74,1,46,0.35)] shadow-sm active:scale-98 cursor-pointer border-none"
                        >
                            Load More Trending Pieces
                        </button>
                    )}
                    <Link 
                        to="/products" 
                        className="group inline-flex items-center gap-6 font-sans text-[11px] font-bold uppercase tracking-[4px] text-[#F6F1EB] hover:text-white transition-all duration-500 pb-2 relative overflow-hidden"
                    >
                        <span>View All Trending Pieces</span>
                        <MoveRight size={18} className="group-hover:translate-x-3 transition-transform duration-500 text-[#F6F1EB]" />
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-white transition-colors duration-500" />
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-500" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TrendingSlider;
