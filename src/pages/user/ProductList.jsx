import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api';
import toast from 'react-hot-toast';
import { 
    ShoppingBag, 
    Search, 
    Loader2, 
    Package, 
    Plus, 
    Minus, 
    Trash2, 
    ArrowRight,
    SlidersHorizontal,
    X,
    Sparkles,
    Heart
} from 'lucide-react';
import SafeImage from '../../components/common/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Button from '../../components/common/Button';
import { ProductSkeleton } from '../../components/common/Skeleton';
import { AuthContext } from '../../context/AuthContext';
import { EnquiryContext } from '../../context/EnquiryContext';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [productQuantities, setProductQuantities] = useState({});
    const [activeCategory, setActiveCategory] = useState(slug || searchParams.get('category') || 'all');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all');
    
    // New States
    const { addToEnquiry } = useContext(EnquiryContext);
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'price-low', 'price-high'
    const [visibleCount, setVisibleCount] = useState(8);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Wishlist / Saved Items Integration
    const { user } = useContext(AuthContext);
    const [savedItems, setSavedItems] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchSavedItems = async () => {
                try {
                    const { data } = await api.get('/users/profile');
                    setSavedItems(data.savedItems.map(item => item._id || item));
                } catch (err) {
                    console.error('Failed to load saved items', err);
                }
            };
            fetchSavedItems();
        }
    }, [user]);

    const handleToggleFavorite = async (productId) => {
        if (!user) {
            toast('Please sign in to access your personalized consultation list.', {
                icon: '🔒',
                style: {
                    background: '#F6F1EB',
                    color: '#330020',
                    border: '1px solid rgba(51, 0, 32, 0.1)',
                    borderRadius: '100px',
                    padding: '12px 24px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            });
            navigate('/login', { state: { from: location } });
            return;
        }
        try {
            const { data } = await api.post('/users/profile/saved-items', { productId });
            if (data.isSaved) {
                setSavedItems(prev => [...prev, productId]);
                toast.success('Piece saved to your curation');
            } else {
                setSavedItems(prev => prev.filter(id => id !== productId));
                toast.success('Piece removed from your curation');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update Saved Pieces');
        }
    };

    const isFavorite = (productId) => savedItems.includes(productId);

    useEffect(() => {
        fetchInitialData();
        setInitialCount();
    }, []);

    useEffect(() => {
        if (slug) {
            setActiveCategory(slug);
        } else {
            const cat = searchParams.get('category');
            if (cat) setActiveCategory(cat);
            else setActiveCategory('all');
        }

        const fil = searchParams.get('filter');
        if (fil) setActiveFilter(fil);
        else setActiveFilter('all');
    }, [searchParams, slug]);

    const setInitialCount = () => {
        if (window.innerWidth >= 1024) setVisibleCount(8);
        else if (window.innerWidth >= 768) setVisibleCount(6);
        else setVisibleCount(4);
    };

    // Reset visible count when filters change
    useEffect(() => {
        setInitialCount();
    }, [activeCategory, activeFilter, searchTerm, sortOrder]);

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + (window.innerWidth >= 1024 ? 8 : window.innerWidth >= 768 ? 6 : 4));
            setIsLoadingMore(false);
        }, 800); // Soft delay for premium loading feel
    };

    const fetchInitialData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error('Failed to load catalog');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (!user) {
            toast('Please sign in to access your personalized consultation list.', {
                icon: '🔒',
                style: {
                    background: '#F6F1EB',
                    color: '#330020',
                    border: '1px solid rgba(51, 0, 32, 0.1)',
                    borderRadius: '100px',
                    padding: '12px 24px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            });
            navigate('/login', { state: { from: location } });
            return;
        }
        const qty = productQuantities[product._id] || 1;
        addToEnquiry(product, qty);
    };

    let filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || 
            (p.category && (
                p.category === activeCategory || 
                p.category?._id === activeCategory || 
                p.category?.slug === activeCategory ||
                p.category?.name === activeCategory
            ));
        
        let matchesFilter = true;
        if (activeFilter === 'trending') {
            matchesFilter = p.isTrending === true || p.trending === true;
        } else if (activeFilter === 'iconic') {
            matchesFilter = p.isIconic === true || p.isIconic === true;
        }
        
        return matchesSearch && matchesCategory && matchesFilter;
    });

    if (sortOrder === 'price-low') {
        filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high') {
        filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    } else {
        // newest (default fallback from backend order, or we can sort by date if available)
        // Assuming backend returns newest first anyway
    }

    const handleCategoryClick = (catIdOrSlug) => {
        setActiveCategory(catIdOrSlug);
        if (catIdOrSlug === 'all') {
            navigate('/collections');
        } else {
            navigate(`/collections?category=${catIdOrSlug}`);
        }
    };

    const handleFilterClick = (filterVal) => {
        setActiveFilter(filterVal);
        if (filterVal === 'all') {
            searchParams.delete('filter');
        } else {
            searchParams.set('filter', filterVal);
        }
        setSearchParams(searchParams);
    };

    return (
        <Layout>
            <SEO 
                title="Curated Collections | Indian Furniture Mart Luxury" 
                description="Explore our full collection of bespoke furniture. Handcrafted pieces for modern architectural interiors."
            />
            
            {/* 1. Hero Strip */}
            <div className="pt-24 pb-16 bg-surface border-b border-black/[0.04]">
                <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-8 h-[1px] bg-accent" />
                            <span className="text-accent font-bold uppercase tracking-[0.4em] text-[9px]">Gallery</span>
                            <div className="w-8 h-[1px] bg-accent" />
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mb-6 tracking-tight leading-[1.1]">
                            Curated Furniture <span className="italic font-light text-accent">Collections.</span>
                        </h1>
                        <p className="text-text-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                            Handcrafted pieces for modern architectural interiors. Explore our complete archive of artisanal woodwork.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 lg:px-12 py-12 mb-20">
                
                {/* 2. Filter Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    
                    {/* Category Pills */}
                    <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide select-none [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={`px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                                activeCategory === 'all' 
                                ? 'bg-primary text-white border-transparent shadow-sm' 
                                : 'bg-card text-primary/70 border-black/10 hover:border-[#330020]/30 hover:text-[#330020] shadow-sm'
                            }`}
                        >
                            All Pieces
                        </button>
                        {categories.map((cat, idx) => (
                            <button
                                key={`cat-${cat._id || idx}`}
                                onClick={() => handleCategoryClick(cat.slug || cat._id)}
                                className={`px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    (activeCategory === cat._id || activeCategory === cat.slug) 
                                    ? 'bg-primary text-white border-transparent shadow-sm' 
                                    : 'bg-card text-primary/70 border-black/10 hover:border-[#330020]/30 hover:text-[#330020] shadow-sm'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search gallery..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-card rounded-full outline-none focus:ring-1 focus:ring-accent/20 transition-all font-bold text-[10px] uppercase tracking-widest border border-black/10 shadow-sm text-primary placeholder:text-primary/40"
                            />
                        </div>
                        <div className="relative hidden md:block">
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="appearance-none bg-card border border-black/10 text-primary/70 text-[9px] font-bold uppercase tracking-widest rounded-full py-2.5 pl-6 pr-10 outline-none focus:ring-1 focus:ring-accent/20 cursor-pointer shadow-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                            </select>
                            <SlidersHorizontal size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Active Filter Badges Block */}
                {(activeCategory !== 'all' || activeFilter !== 'all') && (
                    <div className="flex flex-wrap items-center gap-3 mb-10 bg-card/50 border border-black/[0.06] p-4 rounded-2xl max-w-max animate-fade-in">
                        <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Active Curation:</span>
                        
                        {activeCategory !== 'all' && (
                            <div className="flex items-center gap-2 bg-card text-primary border border-black/[0.08] px-4 py-1.5 rounded-full shadow-sm">
                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                    {categories.find(c => c._id === activeCategory || c.slug === activeCategory)?.name || 'Curated Space'}
                                </span>
                                <button 
                                    onClick={() => handleCategoryClick('all')} 
                                    className="text-primary/50 hover:text-[#330020] transition-colors ml-2 focus:outline-none cursor-pointer"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            </div>
                        )}

                        {activeFilter !== 'all' && (
                            <div className="flex items-center gap-2 bg-card text-primary border border-black/[0.08] px-4 py-1.5 rounded-full shadow-sm">
                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                    {activeFilter === 'trending' ? '✨ Trending Interiors' : '👑 Iconic Showcase'}
                                </span>
                                <button 
                                    onClick={() => handleFilterClick('all')} 
                                    className="text-primary/50 hover:text-[#330020] transition-colors ml-2 focus:outline-none cursor-pointer"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="w-full h-[300px] bg-black/[0.03] animate-pulse rounded-[2rem]" />
                                <div className="h-4 bg-black/[0.03] animate-pulse rounded w-1/3" />
                                <div className="h-6 bg-black/[0.03] animate-pulse rounded w-2/3" />
                                <div className="h-4 bg-black/[0.03] animate-pulse rounded w-1/4 mt-2" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
                            <AnimatePresence>
                                {filteredProducts.slice(0, visibleCount).map((product, i) => (
                                    <motion.div 
                                    key={`prod-${product._id || i}`}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.8, delay: (i % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                    className="group flex flex-col h-full bg-card rounded-[2rem] p-3 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[0.22,1,0.36,1] hover:-translate-y-1"
                                >
                                    {/* Card Image Area */}
                                    <div className="relative w-full h-[260px] rounded-[1.5rem] overflow-hidden mb-5 bg-surface border border-black/[0.02]">
                                        <Link to={`/products/${product.slug}`} className="block h-full w-full">
                                            <SafeImage 
                                                src={product.images?.[0]?.url || product.image} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[0.22,1,0.36,1] group-hover:scale-105" 
                                            />
                                            {/* Subtle gradient overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-700" />
                                        </Link>
                                        {/* Heart/Favorite Icon */}
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(product._id); }}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-black/[0.06] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-md z-20 cursor-pointer"
                                        >
                                            <Heart size={14} fill={isFavorite(product._id) ? "#EF4444" : "none"} className={isFavorite(product._id) ? "text-red-500" : "text-primary/70"} />
                                        </button>

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {product.isIconic && (
                                                <span className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest text-accent shadow-sm flex items-center gap-1.5 border border-black/[0.04]">
                                                    <Sparkles size={10} /> Iconic
                                                </span>
                                            )}
                                            {product.isTrending && (
                                                <span className="bg-primary text-white px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm border border-transparent">
                                                    Trending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content Area */}
                                    <div className="px-2 flex flex-col flex-1 pb-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-sans text-[9px] md:text-[10px] font-semibold tracking-[2px] uppercase text-[#8A8F68]">
                                                {product.category?.name || 'Artisan'}
                                            </span>
                                        </div>
                                        <Link to={`/products/${product.slug}`}>
                                            <h3 className="font-sans text-[18px] md:text-[20px] font-semibold leading-[1.35] tracking-[-0.2px] text-[#330020] mb-1 group-hover:text-[#4A012E] transition-colors duration-500">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="font-sans text-[9px] md:text-[10px] font-semibold tracking-[2px] uppercase text-[#8A8F68] mb-4 flex-1">
                                            Bespoke Build
                                        </p>
                                        
                                        {/* Price & Quantity Layout */}
                                        <div className="flex items-end justify-between pt-3 md:pt-4 border-t border-black/[0.04] mb-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-sans text-[22px] md:text-[24px] font-bold text-[#330020] leading-none">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </span>
                                                {product.originalPrice > product.price && (
                                                    <span className="font-sans text-[12px] opacity-45 line-through leading-none text-[#330020]/45">
                                                        ₹{product.originalPrice.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Refined Quantity Controls */}
                                            <div className="flex items-center bg-surface rounded-xl border border-black/[0.06] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setProductQuantities(p => ({...p, [product._id]: Math.max(1, (p[product._id] || 1) - 1)})) }}
                                                    className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-black/5 transition-colors"
                                                >
                                                    <Minus size={13} strokeWidth={2.5} />
                                                </button>
                                                <span className="text-[12px] font-bold text-primary w-6 text-center">{productQuantities[product._id] || 1}</span>
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setProductQuantities(p => ({...p, [product._id]: (p[product._id] || 1) + 1})) }}
                                                    className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-black/5 transition-colors"
                                                >
                                                    <Plus size={13} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Two Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <Link 
                                                to={`/products/${product.slug}`}
                                                className="w-full min-h-[46px] py-3.5 px-2 rounded-xl border border-black/10 bg-card text-primary text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:bg-surface hover:border-black/20 transition-all text-center leading-tight"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                                className="w-full min-h-[46px] py-3.5 px-2 rounded-xl bg-primary text-white text-[9px] font-bold uppercase tracking-[0.2em] border border-transparent hover:bg-[#4A012E] transition-all shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 flex items-center justify-center text-center cursor-pointer leading-tight"
                                            >
                                                Add Enquiry
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                                ))}
                                {isLoadingMore && (
                                    <>
                                        {[1, 2, 3, 4].map(i => (
                                            <motion.div 
                                                key={`skeleton-${i}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col gap-4"
                                            >
                                                <div className="w-full h-[320px] bg-black/[0.02] animate-pulse rounded-[2rem]" />
                                                <div className="h-4 bg-black/[0.02] animate-pulse rounded w-1/3" />
                                                <div className="h-6 bg-black/[0.02] animate-pulse rounded w-2/3" />
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Load More Button */}
                        {visibleCount < filteredProducts.length && (
                            <div className="mt-20 text-center flex flex-col items-center">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-6">
                                    Showing {visibleCount} of {filteredProducts.length} curated pieces
                                </span>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-10 py-4 rounded-full border border-black/10 text-primary bg-card font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-surface transition-all duration-500 disabled:opacity-50 flex items-center gap-3 shadow-sm"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" /> Loading Archive
                                        </>
                                    ) : (
                                        "Load More Collections"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-32 text-center bg-white/55 backdrop-blur-md rounded-[3rem] border border-[#330020]/10 shadow-soft max-w-2xl mx-auto">
                        <Package size={40} className="mx-auto text-[#330020]/20 mb-6" strokeWidth={1.5} />
                        <h3 className="text-3xl mb-3 font-serif text-[#330020]">
                            {activeCategory !== 'all' ? "Category Empty" : "No Pieces Found."}
                        </h3>
                        <p className="text-[#330020]/48 text-[11px] font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                            {activeCategory !== 'all' 
                                ? "No curated pieces available in this category yet." 
                                : "Try adjusting your filters or search terms to explore our archive."}
                        </p>
                    </div>
                )}
                 
            </div>
        </Layout>
    );
};

export default ProductList;
