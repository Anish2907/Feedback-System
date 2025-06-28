import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { authAPI } from "../services/api";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, loginUser } = useApp();

    useEffect(() => {
        const verifyRefeshToken = async () => {
            try {
                const respose = await authAPI.refreshToken();
                loginUser(respose.user);
                localStorage.setItem("authToken", respose.token);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        !currentUser ? verifyRefeshToken() : setIsLoading(false);
    }, [currentUser]);

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet />
            }
        </>
    );
}

export default PersistLogin;