import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/auth.store';

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('Verifying...');

    const navigate = useNavigate();
    const [groupId, setLocalGroupId] = useState(null);
    const setGlobalGroupId = useAuthStore((state) => state.setGroupId);

    useEffect(() => {
        if (!token) {
            setStatus("No token provided");
            return;
        }

        axiosInstance.get(`/participants/verify?token=${token}`)
            .then(res => {
                setStatus("Success! You are verified.");
                if (res.data.groupId) {
                    setLocalGroupId(res.data.groupId);
                    setGlobalGroupId(res.data.groupId);
                }
            })
            .catch(err => {
                console.error(err);
                setStatus("Verification Failed: " + (err.response?.data?.error || err.message));
            });
    }, [token]);

    return (
        <div className="p-10 max-w-lg mx-auto text-center min-h-[60vh] flex flex-col justify-center animate-fade-in-up">
            <h1 className="text-5xl font-bold mb-8 text-red-800 font-display drop-shadow-sm">Verification Status</h1>

            <div className="glass-panel p-10 rounded-2xl min-h-[200px] flex flex-col justify-center items-center">
                <p className="text-xl font-serif text-stone-700 mb-8">{status}</p>
                {groupId && (
                    <button
                        onClick={() => navigate(`/groups/${groupId}`)}
                        className="btn-premium px-8 py-3 text-lg font-bold w-full border-2 border-red-800 shadow-[4px_4px_0px_0px_rgba(185,28,28,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(185,28,28,0.3)] transition-all !cursor-pointer"
                    >
                        Go to Group Page
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
