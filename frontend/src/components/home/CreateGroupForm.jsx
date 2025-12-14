import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const CreateGroupForm = ({ onCancel }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            await axiosInstance.post('/groups/', data);
            toast.success("Group created! Check your email to verify.");
        } catch (error) {
            console.error(error);
            toast.error("Error creating group");
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-fade-in-up">
            {/* Added shadow-2xl and increased bg opacity for better visibility */}
            <div className="glass-panel p-10 rounded-2xl relative shadow-2xl bg-white/90 border-2 border-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-t-2xl opacity-50"></div>

                <div className="absolute top-6 left-6">
                    <button
                        onClick={onCancel}
                        className="btn btn-sm btn-ghost text-stone-500 hover:text-red-700 hover:bg-red-50 gap-2 normal-case font-serif"
                    >
                        &larr; Back
                    </button>
                </div>

                <h2 className="text-4xl mb-8 mt-6 text-center font-display text-red-800 drop-shadow-sm">Start a New Group</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-amber-900 text-lg">Group Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. North Pole HQ"
                            className="input input-bordered w-full bg-white border-amber-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-stone-800 placeholder:text-stone-400 shadow-inner"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-amber-900 text-lg">Your Name</span>
                        </label>
                        <input
                            type="text"
                            name="creatorName"
                            placeholder="e.g. Santa Claus"
                            className="input input-bordered w-full bg-white border-amber-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-stone-800 placeholder:text-stone-400 shadow-inner"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-amber-900 text-lg">Your Email</span>
                        </label>
                        <input
                            type="email"
                            name="creatorEmail"
                            placeholder="santa@northpole.com"
                            className="input input-bordered w-full bg-white border-amber-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-stone-800 placeholder:text-stone-400 shadow-inner"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="btn btn-error btn-premium w-full text-lg h-14 border-2 border-red-800 shadow-[4px_4px_0px_0px_rgba(185,28,28,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(185,28,28,0.3)] transition-all !cursor-pointer">
                            Create & Verify Group
                        </button>
                        <p className="text-center text-xs text-stone-500 mt-4">
                            We'll send you a magic link to manage your group.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupForm;
