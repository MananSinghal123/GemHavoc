import { Leva } from "leva";
import { UILobby } from "./components/lobby-ui/UILobby";
import { UI } from "./components/UI";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Experience } from "./components/Experience";
import { isHost, useMultiplayerState } from "playroomkit";
import { createContext, useContext, useState } from "react";
import { ChatWindow } from "./components/ChatWindow";

const DEBUG = false;

// This was already being exported, so keep this as the single source of truth
export const AppContext = createContext(null);

function App() {
  const [gameScene] = useMultiplayerState("gameScene", "lobby");
  const [market, setMarket] = useState(false);
  
  return (
    <AppContext.Provider value={{ market, setMarket }}>
      {gameScene === "lobby"  && <UILobby />}
      {gameScene === "game" && <UI />}
      <ChatWindow
         endpoint="http://localhost:3000/api/chat"
         emoji="🤖"
         titleText="Aptos agent"
         placeholder="I'm your friendly Aptos agent! Ask me anything..."           
       />

      <Leva hidden={!DEBUG || !isHost()} />
      <Canvas
        shadows
        camera={{
          position: [11, 14, -15],
          fov: 25,
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <MotionConfig
          transition={{
            type: "spring",
            mass: 5,
            stiffness: 500,
            damping: 100,
            restDelta: 0.0001,
          }}
        >
          <Experience />
        </MotionConfig>
      </Canvas>
    </AppContext.Provider>
  );
}

export default App;