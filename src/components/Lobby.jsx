import {
    AccumulativeShadows,
    CameraControls,
    Environment,
    Gltf,
    OrbitControls,
    PerspectiveCamera,
    RandomizedLight,
    useGLTF,
  } from "@react-three/drei";
  import { useThree } from "@react-three/fiber";
  import { useMemo } from "react";
  import { degToRad } from "three/src/math/MathUtils";
import { PlayerName } from "./PlayerName";
import { Character } from "./Character";
import { usePlayersList } from "playroomkit";
  
  export const Lobby = () => {
    const viewport = useThree((state) => state.viewport);
    const scalingRatio = Math.min(1, viewport.width / 12);
  
    const players = usePlayersList(true);
  
    const shadows = useMemo(
      () => (
        <AccumulativeShadows
          temporal
          frames={35}
          alphaTest={0.75}
          scale={100}
          position={[0, 0.01, 0]}
          color="#EFBD4E"
        >
          <RandomizedLight
            amount={4}
            radius={9}
            intensity={0.55}
            ambient={0.25}
            position={[30, 5, -10]}
          />
          <RandomizedLight
            amount={4}
            radius={5}
            intensity={0.25}
            ambient={0.55}
            position={[-30, 5, -9]}
          />
        </AccumulativeShadows>
      ),
      []
    );
  
    return (
      <group scale={scalingRatio}>
        <Environment preset="dawn" background blur={2} />
        <OrbitControls
          minAzimuthAngle={Math.PI / 4}
          maxAzimuthAngle={-Math.PI / 4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI/2.1}
          maxDistance={26}
          minDistance={8}
        />
        
        <Gltf
          castShadow
          src="/models/Gameboard.glb"
          scale={0.8}
          position-x={-1}
          position-z={5}
        />
        {shadows}

        {players.map((player, index) => (
        <group key={player.id}  position-x={1 + index}
          position-z={2}  >
             <PlayerName name={player.state.profile?.name} position-y={0.8} />
               <Character
                 scale={0.5}
                 character={index}
                 rotation-y={degToRad(180)}
               />
        </group>
      ))}
      </group>
    );
  };
  
  useGLTF.preload("/models/Gameboard.glb");
  