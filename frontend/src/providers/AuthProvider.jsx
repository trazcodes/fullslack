import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { axiosInstance } from "../lib/axios";

const AuthContext = createContext({});

export default function AuthProvider({children}){
    const {getToken}= useAuth;

    useEffect(()=>{
        const interseptor = axiosInstance.interceptors.request.use(
            async (config) =>{
                try {
                    const token = await getToken();
                    if(token) config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    if(error.message?.includes("auth") || error.message?.includes("token")){
                        toast.error("Authentication issue. Please refresh the page.");
                    }
                    console.log("Error getting token", error);
                }
                return config;
            },
            (error)=>{
                console.error("Acios request error", error);
                return Promise.reject(error); 
            }
        );
        // cleanup for performance and avoiding memory leaks
        return ()=> axiosInstance.interceptors.request.eject(interseptor);
    },[getToken])

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
}