import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const JoinGroupPage = () => {
    const { groupId } = useParams();
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            await axiosInstance.post(`/groups/${groupId}/join`, data);
            setStatus("Success! Check your email to verify.");
        } catch (error) {
            console.error(error);
            setStatus("Error: " + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="p-10 max-w-md mx-auto min-h-[60vh] flex flex-col justify-center animate-fade-in-up">
            <h1 className="text-5xl font-bold mb-8 text-red-800 font-display text-center drop-shadow-sm">Join Group</h1>
            {status ? (
                <div className="glass-panel p-6 text-center">
                    <p className="text-xl text-amber-900 font-serif">{status}</p>
                </div>
            ) : (
                <div className="glass-panel p-8 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-t-2xl opacity-50"></div>
                    <p className="text-center text-stone-500 mb-6">Enter your details to join the festivities.</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-amber-900">Your Name</span></label>
                            <input type="text" name="name" placeholder="e.g. Pam Beesly" className="input input-bordered input-premium w-full" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-amber-900">Your Email</span></label>
                            <input type="email" name="email" placeholder="pam@dundermifflin.com" className="input input-bordered input-premium w-full" required />
                        </div>
                        <button type="submit" className="btn btn-error btn-premium w-full mt-4 text-lg">Join Group</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JoinGroupPage;
