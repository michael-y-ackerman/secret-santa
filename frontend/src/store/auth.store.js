import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { axiosInstance } from '../lib/axios';

export const useAuthStore = create(
    persist(
        (set) => ({
            groupId: null,
            myGroups: [], // List of all groups the user belongs to
            setGroupId: (id) => set({ groupId: id }),
            clearGroupId: () => set({ groupId: null, myGroups: [] }),

            checkSession: async () => {
                try {
                    const res = await axiosInstance.get('/participants/me');
                    set({
                        groupId: res.data.groupId,
                        myGroups: res.data.myGroups || []
                    });
                } catch (error) {
                    // If 401/403 or other error, clear the group ID as we aren't validly logged in
                    console.log("Session check failed, clearing group ID", error);
                    set({ groupId: null, myGroups: [] });
                }
            }
        }),
        {
            name: 'auth-storage', // unique name
        }
    )
);
