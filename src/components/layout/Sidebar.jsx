import React, { useContext } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
    BarChart3, 
    Package, 
    MessageCircle, 
    LayoutGrid, 
    GalleryHorizontal,
    Users, 
    Settings,
    Info,
    ChevronRight,
    X,
    LogOut,
    Mail
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const links = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: LayoutGrid },
        { name: 'Enquiries', path: '/admin/enquiries', icon: MessageCircle },
        { name: 'Gallery', path: '/admin/gallery', icon: GalleryHorizontal },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
        { name: 'About Page', path: '/admin/about', icon: Info },
        { name: 'Site Settings', path: '/admin/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`
            fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-[#330020] border-r border-[#FAF6F0]/10 flex flex-col z-[80] transition-all duration-700 transform
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            {/* Logo Section */}
            <div className="p-10 flex items-center justify-between">
                <Link to="/home" className="flex flex-col group">
                    <span className="text-xl font-bold tracking-tight text-[#FAF6F0] leading-none">Indian Furniture Mart</span>
                    <span className="text-[10px] font-bold text-[#8A8F68] mt-1">Admin Panel</span>
                </Link>
                <button 
                    className="lg:hidden p-3 hover:bg-[#FAF6F0]/10 rounded-2xl text-[#FAF6F0]"
                    onClick={() => setIsOpen(false)}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-bold text-[#FAF6F0]/40 uppercase tracking-widest px-4 mb-4 mt-4">Main Menu</p>
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => 
                            `flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative
                            ${isActive 
                                ? 'bg-[#FAF6F0] text-[#330020] shadow-[0_15px_30px_rgba(51,0,32,0.15)]' 
                                : 'text-[#FAF6F0]/75 hover:bg-[#FAF6F0]/10 hover:text-[#FAF6F0]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-5">
                                    <link.icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[11px] tracking-wide uppercase">{link.name}</span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className={`opacity-20 group-hover:opacity-60 transition-all ${isActive ? 'text-[#330020]' : 'text-[#FAF6F0]'}`} />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-8 mt-auto relative">
                {/* Subtle top gradient glow for premium feel */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#8A8F68]/30 to-transparent" />
                
                <div className="group bg-gradient-to-br from-[#FAF6F0]/10 to-[#FAF6F0]/5 p-5 rounded-[1.5rem] border border-[#FAF6F0]/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#8A8F68]/30 transition-all duration-500 mb-2">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative w-12 h-12 rounded-2xl bg-[#1A0010] flex items-center justify-center text-[#FAF6F0] overflow-hidden border border-[#FAF6F0]/20 shadow-inner shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold uppercase">{user?.name?.charAt(0) || 'A'}</span>
                            )}
                            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1A0010]" title="Online" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-[#8A8F68] uppercase tracking-[0.2em] block mb-1">System Admin</span>
                            <span className="text-sm font-bold text-[#FAF6F0] truncate block">{user?.name}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-[#1A0010]/50 hover:bg-red-500/10 text-[#FAF6F0]/70 hover:text-red-400 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-red-500/20 cursor-pointer"
                    >
                        Secure Logout <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

