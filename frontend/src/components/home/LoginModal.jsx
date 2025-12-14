import { useState } from 'react';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axiosInstance.post('/participants/resend-verification', { email });
            toast.success("Magic link sent! Check your inbox.");
            setEmail('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send magic link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-fade-in-up">
                <h3 className="text-2xl font-display text-red-800 mb-2">Restoration Station</h3>
                <p className="text-stone-500 mb-6 text-sm">Enter your email to receive a fresh magic link and recover your groups.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-control mb-6">
                        <label className="label"><span className="label-text font-bold text-amber-900">Email Address</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="input input-bordered input-premium w-full"
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-error btn-premium flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
