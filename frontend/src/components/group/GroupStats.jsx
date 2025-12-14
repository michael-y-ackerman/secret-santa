import { Users, DollarSign, Activity } from 'lucide-react';

const GroupStats = ({ group, onCopyInvite }) => {
    const StatItem = ({ icon: Icon, label, value, colorClass }) => (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 min-w-[140px]">
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
                <Icon size={20} className={colorClass.replace("bg-", "text-")} />
            </div>
            <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">{label}</p>
                <p className="text-lg font-bold text-stone-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="mb-8">
            <div className="flex flex-wrap gap-4 mb-6">
                <StatItem
                    icon={Activity}
                    label="Status"
                    value={group.status.toUpperCase()}
                    colorClass={group.status === 'open' ? 'bg-green-600 text-green-600' : 'bg-stone-600 text-stone-600'}
                />
                <StatItem
                    icon={DollarSign}
                    label="Limit"
                    value={group.giftLimit ? `$${group.giftLimit}` : "None"}
                    colorClass="bg-amber-600 text-amber-600"
                />
                <StatItem
                    icon={Users}
                    label="Verified"
                    value={group.participantsCount}
                    colorClass="bg-blue-600 text-blue-600"
                />
            </div>

            {group.status === 'open' && (
                <div className="p-6 glass-panel rounded-xl bg-gradient-to-r from-red-50 to-white border-l-4 border-l-red-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="text-lg font-bold text-red-800">Invite Friends</h4>
                        <p className="text-sm text-stone-600">Share this link so others can join the fun.</p>
                    </div>
                    <button
                        onClick={onCopyInvite}
                        className="btn btn-outline btn-error btn-sm shadow-sm bg-white hover:bg-red-50"
                    >
                        Copy Invite Link
                    </button>
                </div>
            )}
        </div>
    );
};

export default GroupStats;
