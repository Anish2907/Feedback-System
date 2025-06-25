import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export default function RequireAuth() {
    const { currentUser } = useApp();
    return currentUser ? <Outlet /> : <Navigate to="/login" />;
}