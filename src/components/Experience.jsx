import { useMultiplayerState } from "playroomkit";
import { Lobby } from "./Lobby";
import { MobileController } from "./MobileController";


export const Experience = () => {
  const [gameScene]=useMultiplayerState("gameScene","lobby")
  
  return (
    <>
    {gameScene=="lobby" &&  <Lobby/>}
    {gameScene=="game" &&  <MobileController/>}
    </>
  );
};
