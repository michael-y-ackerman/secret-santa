import { Link } from 'react-router-dom';
import { Gift, Users } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const Navbar = () => {
    const groupId = useAuthStore((state) => state.groupId);
    const myGroups = useAuthStore((state) => state.myGroups);

    return (
        <div className="navbar bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm mb-8 border-b border-amber-100">
            <div className="flex-1">
                <Link to="/" className="text-2xl text-red-700 hover:text-red-800 font-bold flex items-center gap-2 font-display no-underline"><Gift className="text-red-600" /> Secret Santa</Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1 gap-2">
                    <li>
                        <Link
                            to="/"
                            className="text-amber-900 hover:text-red-700 font-medium font-serif flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                        >
                            <span className="text-lg">🏠</span> Home
                        </Link>
                    </li>

                </ul>
            </div>
        </div>
    );
};

export default Navbar;
