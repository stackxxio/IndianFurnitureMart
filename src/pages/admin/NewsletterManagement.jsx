import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api';
import { 
    Mail, 
    Search,
    Trash2, 
    Loader2,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const NewsletterManagement = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    useEffect(() => {
        const results = subscribers.filter(sub => 
            sub.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSubscribers(results);
    }, [searchTerm, subscribers]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/newsletter');
            setSubscribers(data);
            setFilteredSubscribers(data);
        } catch (error) {
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
        try {
            await api.delete(`/newsletter/${id}`);
            toast.success('Subscriber removed');
            fetchSubscribers();
        } catch (error) {
            toast.error('Delete operation failed');
        }
    };

    const exportCSV = () => {
        if (subscribers.length === 0) {
            toast.error('No subscribers to export');
            return;
        }
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Email,Subscribed Date\n"
            + subscribers.map(sub => `${sub.email},${new Date(sub.createdAt).toLocaleDateString()}`).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout title="Newsletter Subscribers">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold text-[#330020] mb-1.5">Gazette Subscribers</h1>
                        <p className="font-sans text-sm font-bold text-[#8A8F68] uppercase tracking-[2px]">Manage newsletter subscriptions</p>
                    </div>
                    <div className="flex bg-white/82 backdrop-blur-md px-6 md:px-8 py-4 rounded-[1.5rem] md:rounded-[24px] shadow-[0_10px_30px_rgba(51,0,32,0.05)] border border-[#330020]/08 items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-[#330020]/48 uppercase tracking-widest mb-0.5">Total Subscribers</p>
                            <p className="text-xl font-bold text-[#330020]">{subscribers.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-10">
                    <div className="flex-grow relative">
                        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-[#330020]/20" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 md:h-16 pl-12 md:pl-16 pr-6 md:pr-8 bg-white/75 border border-[#330020]/10 rounded-[1.25rem] md:rounded-[20px] outline-none focus:border-[#8A8F68] focus:ring-4 focus:ring-[#8A8F68]/08 transition-all font-sans font-semibold text-sm text-[#330020] placeholder:text-[#330020]/40"
                        />
                    </div>
                    <Button onClick={exportCSV} variant="secondary" className="!px-6 !py-3 md:!px-8 md:!py-4 !text-[10px] md:!text-[11px] !text-[#330020] font-bold !bg-white/80 border border-[#330020]/10 hover:!bg-[#F6F1EB] w-full md:w-auto">
                        <Download size={14} className="mr-2 text-[#8A8F68]" /> Export CSV
                    </Button>
                </div>

                {/* Subscribers Table */}
                <div className="bg-white/82 backdrop-blur-md rounded-[28px] border border-[#330020]/08 shadow-[0_10px_30px_rgba(51,0,32,0.05)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-[#FAF6F0]/60 font-sans text-[11px] font-bold uppercase tracking-[2px] text-[#330020]/60 border-b border-[#330020]/5">
                                    <th className="px-8 py-6">Email Address</th>
                                    <th className="px-6 py-6">Subscribed Date</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#330020]/5">
                                {loading ? (
                                    <tr><td colSpan="3" className="py-32 text-center"><Loader2 className="animate-spin inline text-[#330020]/20" size={32} /></td></tr>
                                ) : filteredSubscribers.length === 0 ? (
                                    <tr><td colSpan="3" className="py-32 text-center opacity-20"><Mail size={48} className="mx-auto mb-4 text-[#330020]" /><p className="text-[10px] font-bold uppercase tracking-widest text-[#330020]">No subscribers found</p></td></tr>
                                ) : filteredSubscribers.map((sub, idx) => (
                                    <tr key={`sub-${sub._id || idx}`} className="hover:bg-white/40 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#8A8F68]/10 text-[#8A8F68] flex items-center justify-center shrink-0">
                                                    <Mail size={16} />
                                                </div>
                                                <h5 className="font-sans font-semibold text-[15px] tracking-tight text-[#330020] truncate">
                                                    {sub.email}
                                                </h5>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-sans text-sm font-medium text-[#330020]/72">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleDelete(sub._id)}
                                                className="p-3 text-[#330020]/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Subscriber"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default NewsletterManagement;
