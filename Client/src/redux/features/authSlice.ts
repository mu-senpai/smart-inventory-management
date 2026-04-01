import { AuthUser } from '@/type/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
