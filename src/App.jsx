import { Leva } from "leva";
import { UILobby } from "./components/UILobby";
import { UI } from "./components/UI";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Experience } from "./components/Experience";
import { isStreamScreen, useMultiplayerState } from "playroomkit";
import MarketplaceView from "./components/MarketplaceView";


const DEBUG = false;

function App() {
  const [gameScene]=useMultiplayerState("gameScene","lobby");

  return (
    <>
    {gameScene=="lobby" &&  <UILobby/>}
    {gameScene=="game" &&  <UI/>}
    {gameScene=="market" && <MarketplaceView/>}

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
      {/* <UI /> */}
    </>
  );
}

export default App;
