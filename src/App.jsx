import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { EnquiryProvider } from './context/EnquiryContext';
import { HelmetProvider } from 'react-helmet-async';
import EnquiryDrawer from './components/enquiry/EnquiryDrawer';
import { useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Lazy import pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Home = lazy(() => import('./pages/user/Home'));
const About = lazy(() => import('./pages/user/About'));
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const ProductList = lazy(() => import('./pages/user/ProductList'));
const Categories = lazy(() => import('./pages/user/Categories'));
const ProductDetails = lazy(() => import('./pages/user/ProductDetails'));
const EnquiryHistory = lazy(() => import('./pages/user/EnquiryHistory'));
const Contact = lazy(() => import('./pages/user/Contact'));
const NotFound = lazy(() => import('./pages/user/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));
const EnquiryManagement = lazy(() => import('./pages/admin/EnquiryManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const UserDetails = lazy(() => import('./pages/admin/UserDetails'));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'));
const AboutManagement = lazy(() => import('./pages/admin/AboutManagement'));
const SettingsManagement = lazy(() => import('./pages/admin/SettingsManagement'));
const NewsletterManagement = lazy(() => import('./pages/admin/NewsletterManagement'));

const LuxuryLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1EB]">
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border border-[#330020]/5 rounded-full" />
                <div className="absolute inset-0 border-t border-[#8A8F68] rounded-full animate-spin" />
            </div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-[#330020]/48">Curating Exhibition...</p>
        </div>
    </div>
);

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <LuxuryLoader />;

    if (!user) {
        // Redirect to login but save the current location to come back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Allow Admin to access User pages, but keep Admin pages restricted to Admin only
    if (role === 'admin' && user.role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return children;
};

// Component to handle routes that should only be accessible when logged out (e.g., Login/Register)
const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <LuxuryLoader />;
    
    if (user) {
        // If already logged in, redirect away from auth pages
        const destination = user.role === 'admin' ? '/admin/dashboard' : '/home';
        return <Navigate to={destination} replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes - PublicOnly */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Public Global Routes */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/collections" element={<ProductList />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetails />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/enquiries" element={<ProtectedRoute><Navigate to="/my-enquiries" replace /></ProtectedRoute>} />
            <Route path="/my-enquiries" element={<ProtectedRoute><EnquiryHistory /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute role="admin"><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute role="admin"><ProductManagement /></ProtectedRoute>} />
            <Route path="/admin/enquiries" element={<ProtectedRoute role="admin"><EnquiryManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute role="admin"><UserDetails /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute role="admin"><GalleryManagement /></ProtectedRoute>} />
            <Route path="/admin/about" element={<ProtectedRoute role="admin"><AboutManagement /></ProtectedRoute>} />
            <Route path="/admin/newsletter" element={<ProtectedRoute role="admin"><NewsletterManagement /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SettingsManagement /></ProtectedRoute>} />
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <HelmetProvider>
                <AuthProvider>
                    <Router>
                        <EnquiryProvider>
                            <Suspense fallback={<LuxuryLoader />}>
                                <AppRoutes />
                            </Suspense>
                            <Toaster position="top-right" />
                            <EnquiryDrawer />
                        </EnquiryProvider>
                    </Router>
                </AuthProvider>
            </HelmetProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
