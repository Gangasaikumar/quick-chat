import { useEffect } from "react";
import { socket } from "./Socket";

const AppSocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("🔌 SOCKET CONNECTED:", socket.id);
    });

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default AppSocketProvider;
