import { useMultiplayerState } from "playroomkit";
import { Lobby } from "./Lobby";
import { MobileController } from "./MobileController";
import { GameEngineProvider } from "../hooks/useGameEngine";
import  MarketplaceView  from "./MarketplaceView";

export const Experience = () => {
  const [gameScene]=useMultiplayerState("gameScene","lobby")
  return (
    <>
      {/* {isStreamScreen() && <OrbitControls maxPolarAngle={degToRad(80)} />}
      {isStreamScreen() ? <Gameboard /> : <MobileController />}
      <Environment preset="dawn" background blur={2} /> */}
    {gameScene=="lobby" && <Lobby/>}
    {gameScene=="game" && <MobileController/>}
    </>
  );
};
