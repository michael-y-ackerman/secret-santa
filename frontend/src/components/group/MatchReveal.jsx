import { Gift } from 'lucide-react';

const MatchReveal = ({ match }) => {
    if (!match) return null;

    return (
        <div className="glass-panel p-8 mb-8 rounded-2xl relative overflow-hidden text-center animate-fade-in-up">
            {/* Decorative Background Icon */}
            <div className="absolute top-[-20px] right-[-20px] opacity-5 text-red-600 transform rotate-12">
                <Gift size={200} />
            </div>

            <h2 className="font-bold text-4xl text-red-800 mb-6 flex items-center justify-center gap-3 font-display drop-shadow-sm">
                <Gift className="text-amber-500" /> Your Secret Santa Match
            </h2>

            <p className="text-xl px-4 font-serif italic text-amber-900/80 mb-8">
                The snow has settled, the names are drawn. You have been chosen to bring joy to...
            </p>

            <div className="inline-block relative group perspective-1000">
                <div className="relative z-10 px-12 py-8 bg-gradient-to-br from-red-50 to-white border-2 border-red-100 rounded-xl shadow-inner transform group-hover:scale-105 transition-transform duration-500">
                    <div className="text-5xl font-bold text-red-700 font-display tracking-wide drop-shadow-md">
                        {match.recipientName}
                    </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-red-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"></div>
            </div>

            <div className="mt-8 flex justify-center gap-4 text-stone-600 text-sm items-center">
                <span className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100 shadow-sm">
                    <strong>Spending Limit:</strong> {match.giftLimit ? `$${match.giftLimit}` : "No official limit"}
                </span>
            </div>
        </div>
    );
};

export default MatchReveal;
