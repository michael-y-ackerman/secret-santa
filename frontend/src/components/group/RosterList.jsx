
const RosterList = ({ roster, totalParticipants }) => {
    return (
        <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-end border-b border-amber-100 pb-2 mb-4">
                <h3 className="text-2xl text-amber-900 font-display tracking-wide">
                    Participants
                </h3>
                <span className="text-sm font-bold text-red-800 bg-red-100 px-2 py-1 rounded-full">
                    {totalParticipants || 0} Joined
                </span>
            </div>

            {roster ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <ul className="space-y-3">
                        {roster.roster.map((p, idx) => {
                            // Handle backward compatibility right now if roster is just strings
                            const name = typeof p === 'string' ? p : p.name;
                            const email = typeof p === 'string' ? null : p.email; // If existing API doesn't return email, we need to check backend

                            return (
                                <li key={idx} className="flex items-center gap-3 p-3 bg-white/40 rounded-lg hover:bg-white/80 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center text-red-800 font-bold text-sm shadow-sm shrink-0">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-stone-800 font-bold truncate">{name}</p>
                                        <p className="text-stone-500 text-xs truncate">{p.email || "Verified Member"}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-stone-500 italic bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                    Sign in or verify email to see who else is in the group.
                </div>
            )}
        </div>
    );
};

export default RosterList;
