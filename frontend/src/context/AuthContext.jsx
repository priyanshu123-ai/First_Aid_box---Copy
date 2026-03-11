import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);


  const getStatus = async () => {
    try {
      const resp = await axios.get("http://localhost:4000/api/v1/current", {
        withCredentials: true,
      });
      setCurrentUser(resp.data);
    } catch (error) {
      console.log(error);
      setCurrentUser(null);
    }
  };

 
  const logout = async () => {
    try {
      await axios.post("http://localhost:4000/api/v1/logout", {}, { withCredentials: true });
      setCurrentUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ getStatus, currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
