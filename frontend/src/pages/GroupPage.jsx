import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';
import MatchReveal from '../components/group/MatchReveal';
import RosterList from '../components/group/RosterList';
import GroupStats from '../components/group/GroupStats';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [roster, setRoster] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);
  const setGlobalGroupId = useAuthStore((state) => state.setGroupId);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch basic group details (public)
        const groupRes = await axiosInstance.get(`/groups/${groupId}`);
        setGroup(groupRes.data);

        // If completed, try to fetch specific match (will only work if authenticated)
        if (groupRes.data.status === 'completed') {
          try {
            const matchRes = await axiosInstance.get(`/groups/${groupId}/match`);
            setMatch(matchRes.data);
          } catch (err) {
            // If 403/401, just means they aren't logged in, which is fine.
            console.log("Could not fetch match (likely not authenticated)", err);
          }
        }

        // Fetch roster (authenticated) - might fail if not logged in
        try {
          const rosterRes = await axiosInstance.get(`/groups/${groupId}/roster`);
          setRoster(rosterRes.data);
          // If we can fetch the roster, we are an authenticated participant of this group
          setGlobalGroupId(groupId);
        } catch (err) {
          console.log("Could not fetch roster (likely not authenticated or authorized)", err);
        }
      } catch (err) {
        console.error("Error fetching group details:", err);
        setError("Failed to load group details.");
      }
    };

    fetchGroupData();
  }, [groupId, setGlobalGroupId]);

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/groups/join/${groupId}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const handleDraw = async () => {
    if (!confirm("Are you sure you want to start the draw? This cannot be undone.")) return;
    try {
      await axiosInstance.post(`/groups/${groupId}/draw`);
      toast.success("Draw started successfully! Check emails.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Draw failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (error) return <div className="p-10 text-red-500 font-bold text-center mt-10">{error}</div>;
  if (!group) return <div className="p-10 text-center mt-10 text-amber-900 animate-pulse">Loading festivities...</div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-[90vh]">
      {/* Header Section */}
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-red-800 drop-shadow-sm font-display flex items-center justify-center gap-4">
          {group.name}
          <span className={`badge border-none text-white text-xl p-4 shadow-md ${group.status === 'open' ? 'bg-green-600' : 'bg-stone-500'}`}>
            {group.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </h1>
        <p className="text-amber-900/60 font-serif italic text-lg">Manage your gift exchange event</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Setup */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in-up delay-100">

          {/* Simplified Stats display */}
          <div className="glass-panel p-6 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-stone-500 font-bold uppercase text-xs tracking-wider">Spending Limit</p>
              <p className="text-2xl font-bold text-amber-700">{group.giftLimit ? `$${group.giftLimit}` : "None"}</p>
            </div>
            {group.status === 'open' && (
              <button
                onClick={handleCopyInvite}
                className="btn btn-outline btn-error btn-sm shadow-sm bg-white hover:bg-red-50"
              >
                Copy Invite Link
              </button>
            )}
          </div>

          <MatchReveal match={match} />

          {group.status === 'completed' && !match && (
            <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-400 bg-blue-50/50">
              <p className="text-blue-900 font-medium">
                The draw has been completed! Please check your email for your match, or verify your email to view it here.
              </p>
            </div>
          )}

          {group.status === 'open' && (
            <div className="mt-8 glass-panel p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-display text-red-800 mb-2">Ready to Start?</h3>
              <p className="text-stone-600 mb-6 max-w-md mx-auto">Once everyone has joined, start the draw. Emails will be sent out instantly.</p>
              <button
                onClick={handleDraw}
                className="btn btn-error text-white btn-lg shadow-xl hover:scale-105 transition-transform font-bold w-full md:w-auto px-12"
              >
                Start Secret Santa Draw
              </button>
              <p className="text-xs text-stone-400 mt-4 italic">Only the creator can perform this action.</p>
            </div>
          )}
        </div>

        {/* Right Column: Roster */}
        <div className="col-span-1 h-full animate-fade-in-up delay-200">
          {/* Passing count implicitly via roster length for now, or we can update RosterList to accept count if needed */}
          <RosterList roster={roster} totalParticipants={group.participantsCount} />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
