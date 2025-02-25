import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Leva } from "leva";
import { isHost, isStreamScreen } from "playroomkit";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { GameEngineProvider } from "./hooks/useGameEngine";

const DEBUG = false;

function Game() {
  return (
    <>
      <Leva hidden={!DEBUG || !isHost()} />
      <Canvas
        shadows
        camera={{
          position: isStreamScreen() ? [14, 10, -14] : [0, 4, 12],
          fov: 30,
        }}
      >
        <GameEngineProvider>
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
        </GameEngineProvider>
      </Canvas>
      <GameEngineProvider>
        <UI />
      </GameEngineProvider>
    </>
  );
}

export default Game;
