import { Link } from 'react-router-dom';
import { MoreVertical, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { axiosInstance } from '../../lib/axios';

const MyGroupsList = () => {
    const { myGroups, checkSession } = useAuthStore();

    // Simple copy to clipboard function
    const copyInviteLink = (e, groupId) => {
        e.preventDefault(); // Prevent navigation
        const link = `${window.location.origin}/groups/${groupId}/join`;
        navigator.clipboard.writeText(link);
        toast.success("Invite link copied to clipboard!");
    };

    // Delete handling
    const handleDelete = async (e, groupId) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to delete this group? This cannot be undone.")) return;

        try {
            // Check auth store or just try to delete if creator?
            // The button should probably only show if creator? 
            // For now, we try, and backend handles 403.
            await axiosInstance.delete(`/groups/${groupId}`);
            checkSession(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete group. Only the creator can delete it.");
        }
    };

    if (!myGroups || myGroups.length === 0) return null;

    return (
        <div className="w-full animate-fade-in-up">
            <h2 className="text-3xl font-display text-red-800 mb-6 drop-shadow-sm text-center">Your Groups</h2>
            <div className="grid grid-cols-1 gap-4">
                {myGroups.map((group) => (
                    <div key={group.groupId} className="relative group/card">
                        <Link
                            to={`/groups/${group.groupId}`}
                            className="glass-panel p-5 rounded-xl hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between border border-white/50 hover:border-red-200 w-full relative z-0 bg-white/40"
                        >
                            <div className="overflow-hidden pr-8">
                                <h3 className="text-xl font-bold text-stone-800 group-hover/card:text-red-800 transition-colors truncate">
                                    {group.groupName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`badge badge-sm font-serif ${group.status === 'open' ? 'badge-success text-white' : 'badge-ghost'}`}>
                                        {group.status || 'Active'}
                                    </span>
                                    {group.isCreator && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Owner</span>}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 pl-4 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-800 shadow-inner">
                                    {group.participantCount || 0}
                                </div>
                                <span className="text-xs text-stone-500 font-serif italic">Members</span>
                            </div>
                        </Link>

                        {/* Action Menu - Floating Top Right */}
                        <div className="absolute top-2 right-2 z-10 dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle bg-white/50 hover:bg-white text-stone-500 hover:text-red-800 shadow-sm border border-stone-100">
                                <MoreVertical size={14} />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-xl bg-white rounded-box w-48 border border-amber-100 mt-1">
                                <li>
                                    <button onClick={(e) => copyInviteLink(e, group.groupId)} className="text-stone-600 hover:text-amber-800 hover:bg-amber-50">
                                        <LinkIcon size={14} /> Copy Invite Link
                                    </button>
                                </li>
                                {group.isCreator && (
                                    <li>
                                        <button onClick={(e) => handleDelete(e, group.groupId)} className="text-red-600 hover:bg-red-50">
                                            <Trash2 size={14} /> Delete Group
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyGroupsList;
