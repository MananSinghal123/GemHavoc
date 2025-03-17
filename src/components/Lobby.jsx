import {
  AccumulativeShadows,
  CameraControls,
  Environment,
  Gltf,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useContext, useMemo, useRef, useState } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { PlayerName } from "./PlayerName";
import { Character } from "./Character";
import { usePlayersList } from "playroomkit";
import { AppContext } from "../App";
import MarketplaceView from "./MarketplaceView";

// Create a tooltip component similar to PlayerName
const ObjectTooltip = ({ text, ...props }) => {
  return (
    <Html
      {...props}
      center
      className="pointer-events-none"
    >
      <div className="bg-gradient-to-b from-[#2d1610] to-[#1a0f0b] border border-[#8b4513] rounded-md text-[#e6c78b] shadow-md px-2 py-1 text-sm text-center">
        {/* Small gold accent in corner */}
        <div className="absolute top-0 left-0 w-1 h-1 border-l border-t border-[#ffd700] translate-x-0.5 translate-y-0.5"></div>
        
        {/* Tooltip content */}
        {text}
      </div>
    </Html>
  );
};


const objectDisplayName={
  "Prop_Chest_Gold":"Treasury",
}

export const Lobby = () => {
  const viewport = useThree((state) => state.viewport);
  const scalingRatio = Math.min(1, viewport.width / 12);
  const { market, setMarket } = useContext(AppContext);
  const players = usePlayersList(true);
  const [hoveredPart, setHoveredPart] = useState(null);

  const gameboardRef = useRef();

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

  // Handle click on model parts
  const handleModelClick = (event) => {
    console.log(event.object.name);
    if (event.object.name === "Prop_Chest_Gold") {
      setMarket(true);
    }
  };

  // Handle hover effects
  const handlePointerOver = (event) => {
    if (event.object.name === "Prop_Chest_Gold") {
      document.body.style.cursor = "pointer";
      event.object.scale.set(0.2, 0.2, 0.2);
      setHoveredPart(event.object);
      console.log(event.object);
    }
  };

  const handlePointerOut = (event) => {
    document.body.style.cursor = "auto";
    if (event.object.name === "Prop_Chest_Gold") {
      event.object.scale.set(0.183, 0.183, 0.183);
    }
    setHoveredPart(null);
  };

  return (
    <group scale={scalingRatio}>
      <Environment preset="dawn" background blur={2} />
      <OrbitControls
        minAzimuthAngle={Math.PI / 4}
        maxAzimuthAngle={-Math.PI / 4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        maxDistance={26}
        minDistance={8}
      />

      {/* Attach tooltip as a child to the object itself so it follows transformations */}
      <Gltf
        ref={gameboardRef}
        castShadow
        src="/models/Gameboard.glb"
        scale={0.8}
        position-x={-1}
        position-z={5}
        onClick={handleModelClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* If object is hovered, create a tooltip at its position */}
      {hoveredPart && (
        <group position={[hoveredPart.position.x, hoveredPart.position.y +2, hoveredPart.position.z+3]}>
          <ObjectTooltip text={objectDisplayName[hoveredPart.name]} />
        </group>
      )}
      
      {shadows}

      {players.map((player, index) => (
        <group
          key={player.id}
          position-x={1 + index}
          position-z={2}
        >
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