
const ActionCard = ({ title, description, icon: Icon, onClick, isComingSoon, isSelected }) => {
    return (
        <div
            onClick={!isComingSoon ? onClick : undefined}
            className={`
        glass-panel p-8 rounded-2xl cursor-pointer relative overflow-hidden group
        ${!isComingSoon ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-80 grayscale-[0.5] cursor-not-allowed'}
        transition-all duration-500
        ${isSelected ? 'ring-4 ring-offset-2 ring-red-200 border-red-300' : 'border-white/50'}
      `}
        >
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-red-50 to-amber-50 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <Icon className={`w-12 h-12 ${isComingSoon ? 'text-stone-400' : 'text-red-700'}`} />
                </div>

                <h3 className="text-3xl mb-3 font-display text-red-800">
                    {title}
                </h3>

                <p className="text-stone-600 font-serif leading-relaxed">
                    {description}
                </p>

                {isComingSoon && (
                    <span className="absolute top-4 right-4 badge badge-neutral opacity-70">Soon</span>
                )}

                {!isComingSoon && (
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-amber-700 font-bold text-sm uppercase tracking-widest">
                        Select &rarr;
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionCard;
