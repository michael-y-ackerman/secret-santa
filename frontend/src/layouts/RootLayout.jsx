import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

const RootLayout = () => {
    const checkSession = useAuthStore((state) => state.checkSession);

    useEffect(() => {
        checkSession();
    }, []);

    return (
        <div className="min-h-screen bg-amber-50 text-amber-900">
            <Navbar />
            <div className="container mx-auto px-4">
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayout;
