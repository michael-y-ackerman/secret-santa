import { useState } from 'react';
import { Zap, Mail } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import HomeHero from '../components/home/HomeHero';
import ActionCard from '../components/home/ActionCard';
import CreateGroupForm from '../components/home/CreateGroupForm';
import MyGroupsList from '../components/home/MyGroupsList';


const HomePage = () => {
  const [mode, setMode] = useState(null); // null = selection, 'full' = form

  const { myGroups } = useAuthStore(); // Added useAuthStore hook
  const hasGroups = myGroups && myGroups.length > 0; // Added hasGroups logic

  return (
    <div className="p-6 md:p-10 w-full min-h-[80vh] flex flex-col justify-center">
      <HomeHero />

      {hasGroups ? (
        <div className="grid md:grid-cols-2 gap-24 items-start w-full px-4">
          {/* Left Column: Create New (Always showing form or simplified action) */}
          <div className="flex flex-col items-center md:items-start w-full transition-all duration-300">
            {/* Depth Container for Start New */}
            <div className="relative w-full max-w-md">
              {/* Background Shadow Effect */}
              <div className="absolute inset-0 bg-red-800/10 transform translate-y-4 translate-x-4 rounded-3xl blur-sm -z-10"></div>

              <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl">
                {mode === 'full' ? (
                  <CreateGroupForm onCancel={() => setMode(null)} />
                ) : (
                  <div className="space-y-6 w-full">
                    <h2 className="text-3xl font-display text-red-800 mb-6 drop-shadow-sm text-center">Start New</h2>
                    <ActionCard
                      title="Create Group"
                      description="Invite friends via magic links, set gift limits, and manage the exchange."
                      icon={Mail}
                      onClick={() => setMode('full')}
                      isSelected={false}
                    />
                    <ActionCard
                      title="Quick Draw"
                      description="No emails required. Instant local reveal."
                      icon={Zap}
                      isComingSoon={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up delay-200 flex flex-col items-center md:items-end w-full">
            {/* Depth Container for Your Groups */}
            <div className="relative w-full max-w-md">
              {/* Background Shadow Effect */}
              <div className="absolute inset-0 bg-amber-800/10 transform translate-y-4 translate-x-4 rounded-3xl blur-sm -z-10"></div>

              <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl w-full">
                <MyGroupsList />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Original Centered Layout for No Groups */
        <>
          {!mode && (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full animate-fade-in-up delay-100">
              <ActionCard
                title="Quick Draw"
                description="No emails required. Just add names on a single device and reveal matches instantly. Perfect for in-person gatherings."
                icon={Zap}
                isComingSoon={true}
              />

              <ActionCard
                title="Full Group"
                description="The complete experience. Invite friends via magic links, set gift limits, and manage the exchange securely online."
                icon={Mail}
                onClick={() => setMode('full')}
                isSelected={false}
              />
            </div>
          )}

          {mode === 'full' && (
            <CreateGroupForm onCancel={() => setMode(null)} />
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;