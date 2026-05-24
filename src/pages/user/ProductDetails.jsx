import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { EnquiryContext } from '../../context/EnquiryContext';
import Layout from '../../components/layout/Layout';
import api from '../../api';
import toast from 'react-hot-toast';
import {
    ShoppingCart,
    ArrowLeft,
    Plus,
    Minus,
    Star,
    ShieldCheck,
    Truck,
    Package,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Loader2,
    Globe,
    Award,
    Heart,
    MoveRight,
    Info,
    Sofa
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '../../components/common/SafeImage';
import SEO from '../../components/common/SEO';
import Button from '../../components/common/Button';

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [reviewSort, setReviewSort] = useState('newest');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '', hoverRating: 0 });

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            try {
                const { data } = await api.get(`/products/${slug}`);
                setProduct(data);
                
                try {
                    const reviewsRes = await api.get(`/products/${data._id}/reviews?sort=${reviewSort}`);
                    setReviews(reviewsRes.data);
                } catch (reviewError) {
                    console.error('Failed to fetch reviews', reviewError);
                }
                
                setLoading(false);
            } catch (error) {
                toast.error('Product not found');
                navigate('/products');
            }
        };
        fetchProductAndReviews();
        window.scrollTo(0, 0);
    }, [slug, navigate]);

    useEffect(() => {
        if (product?._id) {
            const fetchReviews = async () => {
                try {
                    const { data } = await api.get(`/products/${product._id}/reviews?sort=${reviewSort}`);
                    setReviews(data);
                } catch (error) {
                    console.error('Failed to fetch reviews', error);
                }
            };
            fetchReviews();
        }
    }, [reviewSort, product?._id]);

    const handleQuantity = (type) => {
        if (type === 'inc') setQuantity(prev => prev + 1);
        if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
    };

    const { user } = useContext(AuthContext);
    const { addToEnquiry: addProductToEnquiry } = useContext(EnquiryContext);

    // Recently Viewed & Wishlist Integration
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (user && product?._id) {
            // Log Recently Viewed in background
            api.post('/users/profile/recently-viewed', { productId: product._id }).catch(() => {});
            
            // Check if product is in wishlist
            const checkWishlist = async () => {
                try {
                    const { data } = await api.get('/users/profile');
                    const savedIds = data.savedItems.map(item => item._id || item);
                    setIsSaved(savedIds.includes(product._id));
                } catch (err) {
                    console.error('Failed to load wishlist status', err);
                }
            };
            checkWishlist();
        }
    }, [product?._id, user]);

    const handleToggleFavorite = async () => {
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
            const { data } = await api.post('/users/profile/saved-items', { productId: product._id });
            setIsSaved(data.isSaved);
            if (data.isSaved) {
                toast.success('Piece saved to your curation');
            } else {
                toast.success('Piece removed from your curation');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update Saved Pieces');
        }
    };

    const handleAddToEnquiry = () => {
        addProductToEnquiry(product, quantity);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.comment.trim()) {
            toast.error('Please write a review comment.');
            return;
        }
        setIsSubmittingReview(true);
        try {
            const { data } = await api.post(`/products/${product._id}/reviews`, reviewForm);
            toast.success('Thank you for your review!');
            
            // Re-fetch sorted reviews and updated product to get new average
            const updatedProduct = await api.get(`/products/${slug}`);
            setProduct(updatedProduct.data);
            
            const reviewsRes = await api.get(`/products/${product._id}/reviews?sort=${reviewSort}`);
            setReviews(reviewsRes.data);
            
            setReviewForm({ rating: 5, comment: '', name: '', hoverRating: 0 });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/products/${product._id}/reviews/${reviewId}`);
            toast.success('Review deleted');
            setReviews(reviews.filter(r => r._id !== reviewId));
            
            const updatedProduct = await api.get(`/products/${slug}`);
            setProduct(updatedProduct.data);
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1EB]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-2 border-[#330020]/5 rounded-full" />
                        <div className="absolute inset-0 border-t-2 border-[#8A8F68] rounded-full animate-spin" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Curating Exhibition...</p>
                </div>
            </div>
        </Layout>
    );

    if (!product) return null;

    let allImages = [];
    if (product.images && product.images.length > 0) {
        allImages = product.images.map(img => typeof img === 'string' ? img : img.url);
    } else if (product.image) {
        allImages = [product.image];
    }

    return (
        <Layout>
            <SEO 
                title={`${product.name} | Indian Furniture Mart`} 
                description={product.description || `Experience the ${product.name}. A masterpiece of modern luxury.`} 
            />
            
            <div className="bg-[#F6F1EB] pt-32 pb-24 lg:pb-32 text-[#330020]">
                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                    {/* Breadcrumbs / Back Link */}
                    <div className="mb-12 lg:mb-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-4 text-[#330020]/48 hover:text-[#330020] transition-all font-bold uppercase tracking-[0.4em] text-[9px] group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full border border-[#330020]/10 flex items-center justify-center group-hover:bg-[#4A012E] group-hover:text-[#F6F1EB] transition-all duration-500 bg-white/55 shadow-soft">
                                <ArrowLeft size={14} />
                            </div>
                            Back to Collection
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[46%_1fr] gap-16 lg:gap-20 items-start">
                        {/* LEFT: Image System */}
                        <div className="flex flex-col md:flex-row gap-5 lg:gap-6 lg:sticky lg:top-32 md:items-stretch lg:items-start">
                            {/* Thumbnails Sidebar */}
                            {allImages.length > 1 && (
                                <div className="hidden md:flex flex-col gap-4 order-2 md:order-1 w-20 lg:h-[564px]">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative flex-1 w-full rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                                                activeImage === idx 
                                                    ? 'border border-[#8A8F68] shadow-sm ring-1 ring-[#8A8F68] opacity-100 scale-100 bg-white/80' 
                                                    : 'border border-[#330020]/10 opacity-60 hover:opacity-100 scale-95 hover:scale-100 bg-white/40'
                                            }`}
                                        >
                                            <SafeImage src={img} alt={`${product.name} View ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                className="flex-1 w-full aspect-[4/5] lg:aspect-auto lg:h-[564px] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-white/55 border border-[#330020]/10 relative shadow-soft order-1 md:order-2 group"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="w-full h-full overflow-hidden"
                                    >
                                        <SafeImage src={allImages[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-[1.04]" />
                                    </motion.div>
                                </AnimatePresence>
                                
                                <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
                                    <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full text-[8px] font-bold uppercase tracking-[0.4em] text-[#330020] border border-[#330020]/10 shadow-soft">
                                        Crafted Detail View
                                    </div>
                                    {product.isIconic && (
                                        <div className="bg-[#8A8F68] text-[#F6F1EB] px-5 py-2.5 rounded-full text-[8px] font-bold uppercase tracking-[0.4em] shadow-lg flex items-center gap-2">
                                            <Sparkles size={10} className="text-[#F6F1EB]" /> Iconic Edition
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Mobile Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 order-3">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-16 aspect-[4/5] rounded-[1rem] overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                                                activeImage === idx ? 'border border-[#8A8F68] shadow-sm ring-1 ring-[#8A8F68] opacity-100 bg-white/80' : 'border border-[#330020]/10 opacity-50 bg-white/40'
                                            }`}
                                        >
                                            <SafeImage src={img} alt={`${product.name} View ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Product Narrative */}
                        <div className="flex flex-col justify-center min-h-full py-4 lg:py-8 text-[#330020]">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="flex text-[#8A8F68] gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                                    </div>
                                    <div className="h-4 w-px bg-[#330020]/15" />
                                    <span className="text-[9px] font-bold text-[#330020]/48 uppercase tracking-[0.4em]">Signature Piece {product._id?.slice(-4).toUpperCase()}</span>
                                </div>

                                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-serif mb-6 leading-[0.95] tracking-tight text-[#330020]">
                                    {product.name}
                                </h1>

                                {/* Rating Summary */}
                                {product.totalReviews > 0 && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex gap-1 text-[#8A8F68]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    size={16} 
                                                    className={star <= Math.round(product.averageRating) ? "text-[#8A8F68]" : "text-[#330020]/10"} 
                                                    fill="currentColor" 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[12px] font-bold text-[#330020] tracking-wider">{product.averageRating?.toFixed(1)}</span>
                                        <div className="h-3 w-px bg-[#330020]/15" />
                                        <span className="text-[10px] text-[#330020]/48 tracking-[0.1em] uppercase font-bold">({product.totalReviews} Curated {product.totalReviews === 1 ? 'Review' : 'Reviews'})</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 mb-8">
                                    <div className="flex items-baseline gap-5">
                                        <span className="text-4xl md:text-5xl font-bold text-[#330020] tracking-tight">₹{product.price?.toLocaleString('en-IN')}</span>
                                        {product.originalPrice > product.price && (
                                            <span className="text-2xl text-[#330020]/30 line-through font-light tracking-tight">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <p className="text-xl md:text-2xl text-[#330020]/72 leading-[1.6] font-light">
                                        {product.description || "An editorial statement in solid teak. This piece harmonizes traditional Indian joinery with the minimalist aesthetics of international luxury interiors."}
                                    </p>
                                </div>

                                {/* Premium Info Blocks */}
                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-6 bg-white/55 rounded-2xl border border-[#330020]/10 flex flex-col gap-4 shadow-soft hover:shadow-premium transition-all">
                                        <Award size={18} className="text-[#8A8F68]" />
                                        <div>
                                            <h4 className="text-[10px] font-bold text-[#330020] uppercase tracking-[0.2em] mb-1.5">Handcrafted Finish</h4>
                                            <p className="text-[11px] text-[#330020]/72 leading-snug">Artisan detailing & premium finish</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/55 rounded-2xl border border-[#330020]/10 flex flex-col gap-4 shadow-soft hover:shadow-premium transition-all">
                                        <Heart size={18} className="text-[#8A8F68]" />
                                        <div>
                                            <h4 className="text-[10px] font-bold text-[#330020] uppercase tracking-[0.2em] mb-1.5">Premium Comfort</h4>
                                            <p className="text-[11px] text-[#330020]/72 leading-snug">Designed for modern living spaces</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/55 rounded-2xl border border-[#330020]/10 flex flex-col gap-4 shadow-soft hover:shadow-premium transition-all">
                                        <Sparkles size={18} className="text-[#8A8F68]" />
                                        <div>
                                            <h4 className="text-[10px] font-bold text-[#330020] uppercase tracking-[0.2em] mb-1.5">Curated Interior</h4>
                                            <p className="text-[11px] text-[#330020]/72 leading-snug">Designed for luxury environments</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/55 rounded-2xl border border-[#330020]/10 flex flex-col gap-4 shadow-soft hover:shadow-premium transition-all">
                                        <Info size={18} className="text-[#8A8F68]" />
                                        <div>
                                            <h4 className="text-[10px] font-bold text-[#330020] uppercase tracking-[0.2em] mb-1.5">Custom Styling</h4>
                                            <p className="text-[11px] text-[#330020]/72 leading-snug">Personalized interior aesthetics</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Spec Grid */}
                                <div className="grid grid-cols-2 gap-y-10 gap-x-8 py-8 border-y border-[#330020]/10 mb-10">
                                    <div className="space-y-2">
                                        <h5 className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Material</h5>
                                        <p className="text-[13px] font-bold text-[#330020] tracking-wide">A-Grade Solid Teak</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Logistics</h5>
                                        <p className="text-[13px] font-bold text-[#330020] tracking-wide">White Glove Delivery</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Availability</h5>
                                        <p className="text-[13px] font-bold text-[#330020] tracking-wide">{product.stock > 0 ? 'In Mart' : 'Custom Order'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Design Era</h5>
                                        <p className="text-[13px] font-bold text-[#330020] tracking-wide">Contemporary Classic</p>
                                    </div>
                                </div>

                                {/* CTA Area */}
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                        <div className="flex items-center justify-between bg-white/80 rounded-full px-6 h-16 w-full sm:w-44 border border-[#330020]/10 shadow-sm transition-all hover:border-[#330020]/30">
                                            <button onClick={() => handleQuantity('dec')} className="text-[#330020]/48 hover:text-[#330020] transition-colors p-2 cursor-pointer"><Minus size={18} strokeWidth={2} /></button>
                                            <span className="text-xl font-bold text-[#330020] w-10 text-center">{quantity}</span>
                                            <button onClick={() => handleQuantity('inc')} className="text-[#330020]/48 hover:text-[#330020] transition-colors p-2 cursor-pointer"><Plus size={18} strokeWidth={2} /></button>
                                        </div>
                                        <button
                                            onClick={handleAddToEnquiry}
                                            className="flex-1 min-h-[64px] py-4 px-6 rounded-full bg-[#330020] text-[#F6F1EB] text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-500 shadow-lg shadow-[#330020]/10 hover:bg-[#4A012E] hover:shadow-lg hover:shadow-[#4A012E]/20 border border-transparent relative overflow-hidden group cursor-pointer flex-shrink-0"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                Add To Enquiry <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                            </span>
                                        </button>
                                        
                                        {/* Luxury Wishlist Button */}
                                        <button
                                            onClick={handleToggleFavorite}
                                            className="w-16 h-16 rounded-full bg-white/80 border border-[#330020]/10 hover:border-[#330020]/20 flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 shadow-sm shrink-0 cursor-pointer"
                                            title="Save to Wishlist"
                                        >
                                            <Heart size={20} fill={isSaved ? "#EF4444" : "none"} className={isSaved ? "text-red-500" : "text-[#330020]/60"} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={handleAddToEnquiry}
                                            className="w-full h-14 rounded-full border border-[#330020]/15 text-[9px] font-bold uppercase tracking-[0.3em] text-[#330020]/60 hover:bg-[#330020] hover:text-[#F6F1EB] hover:border-transparent transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer"
                                        >
                                            Contact Us
                                        </button>
                                        <div className="h-14 bg-white/55 rounded-full border border-[#330020]/10 flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#8A8F68]/10 flex items-center justify-center text-[#8A8F68]">
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#330020]/48">Consultation Ready</span>
                                        </div>
                                    </div>
                                    
                                    {/* Trust Elements */}
                                    <div className="pt-6 pb-2 text-center sm:text-left">
                                        <p className="text-[9px] font-bold text-[#330020]/48 uppercase tracking-[0.3em] flex items-center justify-center sm:justify-start gap-3">
                                            <ShieldCheck size={14} className="text-[#8A8F68]" /> Trusted by Luxury Homes • Curated Mart Masterpiece
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Client Experiences */}
            <section className="bg-[#F6F1EB] py-20 lg:py-28 border-t border-[#330020]/10 text-[#330020]">
                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        
                        {/* LEFT: Reviews List */}
                        <div className="flex-1">
                            <div className="flex items-end justify-between mb-12 border-b border-[#330020]/10 pb-6">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-serif text-[#330020] mb-4">Client Experiences</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1 text-[#8A8F68]">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className={i <= Math.round(product.averageRating || 0) ? "text-[#8A8F68]" : "text-[#330020]/10"} fill="currentColor" />)}
                                        </div>
                                        <span className="text-sm font-bold text-[#330020]">{product.averageRating?.toFixed(1) || '0.0'} Average</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8A8F68]/30" />
                                        <span className="text-sm text-[#330020]/48 font-bold">{product.totalReviews || 0} Reviews</span>
                                    </div>
                                </div>
                                
                                {reviews.length > 0 && (
                                    <div className="hidden sm:flex gap-6">
                                        <button onClick={() => setReviewSort('newest')} className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all cursor-pointer ${reviewSort === 'newest' ? 'border-[#8A8F68] text-[#330020]' : 'border-transparent text-[#330020]/40 hover:text-[#330020]'}`}>Newest</button>
                                        <button onClick={() => setReviewSort('highest')} className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all cursor-pointer ${reviewSort === 'highest' ? 'border-[#8A8F68] text-[#330020]' : 'border-transparent text-[#330020]/40 hover:text-[#330020]'}`}>Highest Rated</button>
                                    </div>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-20 bg-white/55 rounded-[2.5rem] border border-[#330020]/10 shadow-soft">
                                    <Heart size={32} strokeWidth={1} className="mx-auto text-[#330020]/20 mb-6" />
                                    <p className="text-[#330020]/48 font-bold uppercase tracking-widest text-xs">Be the first to share your experience with this piece.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatePresence mode="popLayout">
                                        {reviews.map((review, idx) => (
                                            <motion.div 
                                                key={`review-${review._id || idx}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-white/55 p-8 md:p-10 rounded-[2.5rem] border border-[#330020]/10 shadow-soft group"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-[#330020] font-serif text-xl border border-[#330020]/10 shadow-soft">
                                                            {review.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h5 className="font-bold text-[#330020] text-sm">{review.name}</h5>
                                                                {review.isVerified && (
                                                                    <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] text-[#8A8F68] bg-[#8A8F68]/10 px-2 py-0.5 rounded-full">
                                                                        <ShieldCheck size={10} /> Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-[#330020]/48 uppercase tracking-[0.1em] mt-1 font-bold">
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="flex gap-1 text-[#8A8F68]">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star 
                                                                    key={star} 
                                                                    size={14} 
                                                                    className={star <= review.rating ? "text-[#8A8F68]" : "text-[#330020]/10"} 
                                                                    fill="currentColor" 
                                                                />
                                                            ))}
                                                        </div>
                                                        
                                                        {user?.role === 'admin' && (
                                                            <button 
                                                                onClick={() => deleteReview(review._id)}
                                                                className="text-[9px] uppercase tracking-widest text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors font-bold cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-[#330020]/72 font-light leading-relaxed text-[15px]">
                                                    "{review.comment}"
                                                </p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Review Form */}
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-white/55 p-8 md:p-10 rounded-[2.5rem] border border-[#330020]/10 shadow-soft lg:sticky lg:top-32">
                                <h4 className="text-2xl font-serif text-[#330020] mb-2">Share Your Thoughts</h4>
                                <p className="text-[13px] text-[#330020]/72 mb-8 leading-relaxed">Your experience helps shape our narrative.</p>
                                
                                <form onSubmit={submitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#330020]/60 mb-3">Rate this piece</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    onMouseEnter={() => setReviewForm({ ...reviewForm, hoverRating: star })}
                                                    onMouseLeave={() => setReviewForm({ ...reviewForm, hoverRating: 0 })}
                                                    className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                                                >
                                                    <Star 
                                                        size={28} 
                                                        className={`transition-colors duration-300 ${
                                                            star <= (reviewForm.hoverRating || reviewForm.rating) 
                                                                ? "text-[#8A8F68]" 
                                                                : "text-[#330020]/10"
                                                        }`} 
                                                        fill="currentColor" 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#330020]/60 mb-2">Your Name (Optional)</label>
                                        <input 
                                            type="text" 
                                            value={reviewForm.name}
                                            onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                            placeholder="How should we address you?"
                                            className="w-full bg-white/80 border border-[#330020]/10 focus:border-[#330020]/20 rounded-xl px-5 py-4 text-sm outline-none transition-all placeholder:text-[#330020]/30 text-[#330020]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#330020]/60 mb-2">Your Experience</label>
                                        <textarea 
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            placeholder="Describe the craftsmanship, comfort, and how it fits your space..."
                                            rows="4"
                                            required
                                            className="w-full bg-white/80 border border-[#330020]/10 focus:border-[#330020]/20 rounded-xl px-5 py-4 text-sm outline-none transition-all placeholder:text-[#330020]/30 text-[#330020] resize-none"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmittingReview}
                                        className="w-full h-14 rounded-full bg-[#330020] text-[#F6F1EB] text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 hover:bg-[#4A012E] hover:shadow-lg hover:shadow-[#4A012E]/20 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                        {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Publish Review'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: The Design Philosophy */}
            <section className="bg-[#F6F1EB] py-24 lg:py-32 border-t border-[#330020]/10 text-[#330020]">
                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="flex items-center justify-center gap-6 mb-10">
                                <div className="w-16 h-[1px] bg-[#8A8F68]/40" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#8A8F68]">The Design Philosophy</span>
                                <div className="w-16 h-[1px] bg-[#8A8F68]/40" />
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif text-[#330020] mb-12 leading-[1.1] tracking-tight">
                                Narrative of Craftsmanship.
                            </h2>
                            <p className="text-xl md:text-2xl text-[#330020]/72 leading-[1.7] font-light mb-20 max-w-3xl mx-auto">
                                Every piece is conceived as an architectural object. We source only ethically harvested timber, allowing the natural grain to dictate the final form. Finished by hand in our New Delhi workshop using ancestral techniques, it stands as a testament to the dialogue between heritage and high-modernism.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6">
                                <div className="flex flex-col items-center gap-5">
                                    <Sofa className="text-[#8A8F68] opacity-80" size={28} strokeWidth={1.5} />
                                    <h4 className="text-[11px] font-bold text-[#330020] uppercase tracking-[0.2em]">Form & Function</h4>
                                    <p className="text-[13px] text-[#330020]/72 leading-relaxed max-w-[200px]">Engineered for absolute comfort and spatial harmony.</p>
                                </div>
                                <div className="flex flex-col items-center gap-5">
                                    <Award className="text-[#8A8F68] opacity-80" size={28} strokeWidth={1.5} />
                                    <h4 className="text-[11px] font-bold text-[#330020] uppercase tracking-[0.2em]">Master Joinery</h4>
                                    <p className="text-[13px] text-[#330020]/72 leading-relaxed max-w-[200px]">Traditional techniques ensuring generational longevity.</p>
                                </div>
                                <div className="flex flex-col items-center gap-5">
                                    <Globe className="text-[#8A8F68] opacity-80" size={28} strokeWidth={1.5} />
                                    <h4 className="text-[11px] font-bold text-[#330020] uppercase tracking-[0.2em]">Sustainable Source</h4>
                                    <p className="text-[13px] text-[#330020]/72 leading-relaxed max-w-[200px]">Ethically procured and meticulously treated.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Related/Footer Section */}
            <section className="bg-[#F6F1EB] py-24 lg:py-32 border-t border-[#330020]/10 text-[#330020]">
                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-px h-24 bg-gradient-to-b from-[#330020]/15 to-transparent mb-12" />
                        <h2 className="text-5xl md:text-[5rem] font-serif mb-12 text-[#330020] leading-[1.1] tracking-tight">Curate Your <br />Artisan Space.</h2>
                        <Link to="/products">
                            <button className="group flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.5em] text-[#330020] hover:text-[#8A8F68] transition-all duration-500 cursor-pointer">
                                Discover More Works <MoveRight size={20} className="group-hover:translate-x-4 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky Enquiry Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#F6F1EB]/95 backdrop-blur-xl border-t border-[#330020]/10 p-4 z-50 transform transition-transform shadow-soft">
                <div className="flex gap-4">
                    <div className="flex items-center justify-between bg-white/80 rounded-full px-5 h-14 flex-shrink-0 w-32 border border-[#330020]/10">
                        <button onClick={() => handleQuantity('dec')} className="text-[#330020]/50 p-1 cursor-pointer"><Minus size={16} strokeWidth={2} /></button>
                        <span className="text-base font-bold text-[#330020]">{quantity}</span>
                        <button onClick={() => handleQuantity('inc')} className="text-[#330020]/50 p-1 cursor-pointer"><Plus size={16} strokeWidth={2} /></button>
                    </div>
                    <button
                        onClick={handleAddToEnquiry}
                        className="flex-1 h-14 rounded-full bg-[#330020] text-[#F6F1EB] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center shadow-lg shadow-[#330020]/10"
                    >
                        Add To Enquiry
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetails;
