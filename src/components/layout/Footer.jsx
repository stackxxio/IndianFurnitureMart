import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const Footer = () => {
    const [settings, setSettings] = useState(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/settings')
            .then(({ data }) => setSettings(data))
            .catch(() => {});
    }, []);

    const currentYear = new Date().getFullYear();
    const s = settings || {};

    const brandLogo = s.footerLogo || 'Indian Furniture Mart';
    const description = s.footerDescription || 'Artisanal furniture of unparalleled lineage. Hand-curated in India for the world\'s most distinguished living spaces.';
    const copyright = s.footerCopyrightText || `© ${currentYear} Indian Furniture Mart. Crafted in Solidarity with Heritage.`;
    const showNewsletter = s.footerShowNewsletter !== false;
    
    const categories = s.footerCategories?.length > 0 
        ? s.footerCategories 
        : ['Living Room', 'Bedroom', 'Dining Room', 'Heritage Works'];

    return (
        <footer className="relative bg-gradient-to-b from-[#330020] to-[#1E0A16] text-[#F6F1EB] overflow-hidden pt-28 pb-12">
            
            {/* Visual Enhancements: Faint radial glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8A8F68]/[0.03] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#8A8F68]/[0.04] rounded-full blur-[100px] pointer-events-none" />
            
            {/* Visual Enhancements: Subtle luxury grain texture overlay */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none bg-repeat"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
                {/* 1. TOP FOOTER SECTION - 4 Column Editorial Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    {/* COLUMN 1: BRAND STORY */}
                    <div className="space-y-6">
                        <Link to="/home" className="flex flex-col group inline-block">
                            <span className="text-3xl font-serif font-semibold tracking-tight text-[#F6F1EB] italic group-hover:text-[#8A8F68] transition-colors duration-300">{brandLogo}</span>
                            <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8A8F68] mt-1.5 flex items-center gap-1.5">
                                <Sparkles size={8} /> Heritage Atelier
                            </span>
                        </Link>
                        
                        {/* Small muted olive separator line */}
                        <div className="w-12 h-[1px] bg-[#8A8F68]/30" />
                        
                        <p className="text-[#F6F1EB]/72 text-xs leading-relaxed max-w-xs font-light">
                            {description}
                        </p>

                        {/* Minimal luxury social icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {s.socialInstagram && (
                                <a 
                                    href={s.socialInstagram} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-[#4A012E] hover:text-[#F6F1EB] hover:border-transparent hover:scale-105 flex items-center justify-center transition-all duration-300 shadow-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </a>
                            )}
                            {s.socialFacebook && (
                                <a 
                                    href={s.socialFacebook} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-[#4A012E] hover:text-[#F6F1EB] hover:border-transparent hover:scale-105 flex items-center justify-center transition-all duration-300 shadow-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </a>
                            )}
                            {s.socialYoutube && (
                                <a 
                                    href={s.socialYoutube} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-[#4A012E] hover:text-[#F6F1EB] hover:border-transparent hover:scale-105 flex items-center justify-center transition-all duration-300 shadow-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* COLUMN 2: CURATED COLLECTIONS */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A8F68] mb-8">Mart Collections</h4>
                        <ul className="space-y-4">
                            {categories.map((cat, idx) => (
                                <li key={idx} className="overflow-hidden">
                                    <Link 
                                        to={`/products?category=${cat.toLowerCase()}`} 
                                        className="text-xs text-[#F6F1EB]/72 hover:text-[#F6F1EB] transition-colors duration-300 inline-flex items-center group relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8A8F68] after:transition-all after:duration-300 hover:after:w-full"
                                    >
                                        <span>{cat}</span>
                                        <ArrowUpRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COLUMN 3: CONTACT DETAILS */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A8F68] mb-8">Mart Contact</h4>
                        <ul className="space-y-5 text-xs text-[#F6F1EB]/72">
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full border border-[#8A8F68]/20 flex items-center justify-center text-[#8A8F68] shrink-0 mt-0.5">
                                    <MapPin size={12} />
                                </div>
                                <span>
                                    <strong className="block text-[#F6F1EB] text-[10px] uppercase tracking-wider mb-1 font-semibold">{s.martName || 'Indian Furniture Mart Pavilion'}</strong>
                                    <span className="font-light">{s.street || '14, Imperial Design Way'}, {s.city || 'Delhi'} - {s.pincode || '110001'}</span>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full border border-[#8A8F68]/20 flex items-center justify-center text-[#8A8F68] shrink-0">
                                    <Phone size={12} />
                                </div>
                                <span className="hover:text-[#F6F1EB] transition-colors duration-300 font-light">{s.phoneMart || '+91 11 4050 6070'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full border border-[#8A8F68]/20 flex items-center justify-center text-[#8A8F68] shrink-0">
                                    <Mail size={12} />
                                </div>
                                <span className="hover:text-[#F6F1EB] transition-colors duration-300 font-light">{s.emailMart || 'hello@indianfurnituremart.com'}</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full border border-[#8A8F68]/20 flex items-center justify-center text-[#8A8F68] shrink-0 mt-0.5">
                                    <Clock size={12} />
                                </div>
                                <span>
                                    <strong className="block text-[#F6F1EB] text-[10px] uppercase tracking-wider mb-1 font-semibold">Curation Hours</strong>
                                    <span className="font-light">Mon - Sat: 10:00 AM - 7:00 PM</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMN 4: PRIVATE NEWSLETTER */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A8F68] mb-8">Heritage Gazette</h4>
                        {showNewsletter ? (
                            <div className="space-y-6">
                                <p className="text-[#F6F1EB]/72 text-xs leading-relaxed font-light">
                                    Subscribe to receive private mart releases, bespoke designs, and seasonal catalogues.
                                </p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!email.trim()) {
                                        toast.error("Please enter your email address");
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        await api.post('/newsletter', { email });
                                        toast.success('Thank you for subscribing to the Gazette!');
                                        setEmail('');
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || 'Subscription failed. Please try again.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} className="flex bg-white/5 border border-white/10 rounded-full p-1.5 focus-within:border-white/30 transition-all duration-300 max-w-sm">
                                    <input 
                                        type="email" 
                                        placeholder="Your email address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="px-5 py-3 text-xs outline-none bg-transparent w-full font-light text-[#F6F1EB] placeholder:text-[#F6F1EB]/30 disabled:opacity-50 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#F6F1EB] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]" 
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-[#F6F1EB] text-[#330020] px-6 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#4A012E] hover:text-[#F6F1EB] transition-all duration-300 cursor-pointer shadow-md font-sans disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Join'
                                        )}
                                    </button>
                                </form>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#F6F1EB]/30 pl-2">
                                    “Receive curated interior releases.”
                                </p>
                            </div>
                        ) : (
                            <p className="text-[#F6F1EB]/48 text-xs italic font-medium font-serif">Gazette subscriptions are currently closed.</p>
                        )}
                    </div>

                </div>

                {/* 2. BOTTOM FOOTER BAR */}
                <div className="pt-10 border-t border-[#F6F1EB]/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-6 text-center lg:text-left">
                        <p className="text-[9px] font-bold text-[#F6F1EB]/48 uppercase tracking-[0.25em]">{copyright}</p>
                        <span className="hidden lg:inline text-[#F6F1EB]/20 text-[9px]">•</span>
                        <p className="text-[9px] font-bold text-[#F6F1EB]/40 uppercase tracking-[0.25em] flex items-center gap-1.5 justify-center">
                            Designed & Developed by <a href="https://stackxxio.com" target="_blank" rel="noopener noreferrer" className="text-[#8A8F68] hover:text-[#F6F1EB] transition-colors duration-300">Stackxxio</a>
                        </p>
                    </div>
                    <div className="flex gap-8 text-[9px] font-bold text-[#F6F1EB]/48 uppercase tracking-widest">
                        <Link to="#" className="hover:text-[#F6F1EB] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8A8F68] hover:after:w-full after:transition-all after:duration-300">Privacy Policy</Link>
                        <Link to="#" className="hover:text-[#F6F1EB] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8A8F68] hover:after:w-full after:transition-all after:duration-300">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
