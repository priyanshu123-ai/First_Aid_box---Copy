import { createContext, useState } from "react";

export const EmergencyContext = createContext();

function EmergencyProvider({ children }) {
  const [detail, setDetail] = useState([]);

  return (
    <EmergencyContext.Provider value={{ detail, setDetail }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export default EmergencyProvider;
