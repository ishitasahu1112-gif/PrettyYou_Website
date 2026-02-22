import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const Profile = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-[#4A3B32] mb-8 border-b border-stone-200 pb-4">My Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Account Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="md:col-span-2 space-y-6"
                    >
                        {/* Personal Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100">
                                <h2 className="text-lg font-serif text-[#4A3B32]">Personal Information</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500 uppercase tracking-wider font-medium mb-1">Display Name</p>
                                        <p className="text-lg text-stone-900 font-medium">{currentUser.displayName || 'Not Set'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-stone-500 uppercase tracking-wider font-medium mb-1">Email Address</p>
                                        <p className="text-base text-stone-900">{currentUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500 uppercase tracking-wider font-medium mb-1">Phone Number</p>
                                        <p className="text-base text-stone-500 italic">Not provided yet</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button variant="outline" className="text-sm px-6 py-2">Edit Details</Button>
                                    <p className="text-xs text-stone-400 mt-2 italic">*Editing details is a premium feature currently in development.</p>
                                </div>
                            </div>
                        </div>

                        {/* Saved Addresses Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                                <h2 className="text-lg font-serif text-[#4A3B32]">Saved Addresses</h2>
                                <button className="text-sm text-primary hover:text-stone-900 font-medium transition-colors cursor-pointer">+ Add New</button>
                            </div>
                            <div className="p-6">
                                <div className="border border-stone-200 rounded-lg p-4 relative">
                                    <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">Primary</span>
                                    <p className="font-medium text-stone-900 mb-1">{currentUser.displayName || 'Valued Customer'}</p>
                                    <p className="text-stone-600 text-sm mb-1">123 Fashion Street, Suite 400</p>
                                    <p className="text-stone-600 text-sm mb-3">New York, NY 10001</p>
                                    <div className="flex gap-4 text-sm font-medium">
                                        <button className="text-stone-500 hover:text-primary transition-colors cursor-pointer">Edit</button>
                                        <button className="text-stone-500 hover:text-red-500 transition-colors cursor-pointer">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Account Meta */}
                    <div className="space-y-6">
                        <div className="bg-stone-100 p-6 rounded-lg text-center">
                            <svg className="w-12 h-12 text-stone-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                            <h3 className="font-serif text-[#4A3B32] text-lg mb-2">Verified Account</h3>
                            <p className="text-sm text-stone-500">Your account is secured by Google Authentication.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
