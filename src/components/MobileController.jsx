import { Center, ContactShadows, Environment, Gltf, PerspectiveCamera,OrbitControls } from "@react-three/drei";
import { useThree} from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { myPlayer, usePlayersList } from "playroomkit";
import { degToRad } from "three/src/math/MathUtils";
import { useGameEngine } from "../hooks/useGameEngine";
import { Card } from "./Card";
import { Character } from "./Character";
import { PlayerName } from "./PlayerName";
import { useEffect } from "react";
import * as THREE from "three";

export const MobileController = () => {
  const me = myPlayer();
  const { players, phase, playerTurn } = useGameEngine();
  const myIndex = players?.findIndex((player) => player.id === me.id);
  const cards = me.getState("cards") || [];
  usePlayersList(true); // force rerender when player change
  let playerIdx = 0;
  const viewport = useThree((state) => state.viewport);
  const scalingRatio = Math.min(1, viewport.width / 3);
  const {camera} = useThree();
  
  useEffect(() => {
    // Store the current camera position
    const startPosition = camera.position.clone();
    // Define the target position
    const targetPosition = new THREE.Vector3(0, 4, 12);
    
    // Create a transition duration in milliseconds
    const duration = 1000;
    const startTime = Date.now();
    
    // Animation function
    const animateCamera = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Use an easing function for smoother transition (e.g., cubic easing)
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      // Interpolate between start and target positions
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;
      
      // Continue the animation if not finished
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    // Start the animation
    animateCamera();
  }, [camera]);
  

  return (    
    <group position-y={-1}>
      <OrbitControls
      // Limit vertical rotation (in radians)
  minPolarAngle={Math.PI/3}    // About 60 degrees from top
  maxPolarAngle={Math.PI/2.2}  // About 82 degrees from top
  
  // Limit horizontal rotation (in radians)
  minAzimuthAngle={-Math.PI/8} // About -22.5 degrees
  maxAzimuthAngle={Math.PI/8}  // About 22.5 degrees
      maxDistance={20} minDistance={10}/>
       <Environment preset="dawn" background blur={2} />
      <ContactShadows opacity={0.12} />
      <group scale={scalingRatio}>
        <group position-z={3.5} position-x={-0.6}>
          <PlayerName
            name={me?.state?.profile?.name}
            position-y={0.8}
            fontSize={0.1}
          />
          <Character
            character={myIndex}
            rotation-y={degToRad(45)}
            scale={0.4}
          />
          {[...Array(me.getState("gems") || 0)].map((_, index) => (
            <Gltf
              key={index}
              src="/models/UI_Gem_Blue.gltf"
              position-x={0.7 + index * 0.25}
              position-y={0.25}
              scale={0.5}
            />
          ))}
        </group>
        {/* CARDS */}
        <group position-y={1}>
          {cards.map((card, index) => {
            let cardAnimState = "";
            const selected = index === me.getState("selectedCard");
            if (phase === "cards") {
              cardAnimState = "cardSelection";
              if (selected) {
                cardAnimState = "cardSelectionSelected";
              }
            } else {
              if (selected) {
                cardAnimState = "selected";
              }
            }
            return (
              <motion.group
                key={index}
                position-x={index * 0.1}
                position-y={2 - index * 0.1}
                position-z={-index * 0.1}
                animate={cardAnimState}
                variants={{
                  selected: {
                    x: -0.1,
                    y: 2.1,
                    z: 0.1,
                  },
                  cardSelection: {
                    x: index % 2 ? 0.6 : -0.6,
                    y: Math.floor(index / 2) * 1.6,
                    z: -0.5,
                  },
                  cardSelectionSelected: {
                    x: 0,
                    y: 0,
                    z: 2,
                    rotateX: degToRad(-45),
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1.1,
                  },
                }}
                onClick={() => {
                  if (phase === "cards") {
                    me.setState("selectedCard", index, true);
                  }
                }}
              >
                <Card type={card} />
              </motion.group>
            );
          })}
        </group>
        {phase === "playerChoice" && players[playerTurn].id === me.id && (
          <Center disableY disableZ>
            {players.map(
              (player, index) =>
                player.id !== me.id && (
                  <motion.group
                    key={player.id}
                    position-x={playerIdx++ * 0.8}
                    position-z={-2}
                    animate={
                      index === me.getState("playerTarget") ? "selected" : ""
                    }
                    scale={0.4}
                    variants={{
                      selected: {
                        z: 0,
                        scale: 0.8,
                      },
                    }}
                  >
                    <mesh
                      onClick={() => me.setState("playerTarget", index, true)}
                      position-y={1}
                      visible={false}
                    >
                      <boxGeometry args={[1.2, 2, 0.5]} />
                      <meshStandardMaterial color="hotpink" />
                    </mesh>
                    <PlayerName
                      name={player?.state?.profile?.name}
                      fontSize={0.3}
                      position-y={1.6}
                    />
                    <Character
                      character={index}
                      animation={
                        index === me.getState("playerTarget") ? "No" : "Idle"
                      }
                      name={player?.state?.profile?.name}
                    />
                  </motion.group>
                )
            )}
          </Center>
        )}
      </group>
    </group>
  );
};
