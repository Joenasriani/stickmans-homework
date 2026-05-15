/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { GameState, Level, Entity } from "../types";
import { levels } from "../levels";
import { updatePhysics } from "../game/Physics";
import { generateSketchyLine, getStickmanPose } from "../game/Renderer";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Application, useTick, extend } from "@pixi/react";
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { saveGame, loadGame, hasSaveGame } from "../lib/storage";

// Register PixiJS components for use as intrinsic React elements
extend({ Container, Graphics, Text });

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const initialState = (level: Level, index: number): GameState => {
  const mathGoal = (index + 1) * 7 + Math.floor(Math.random() * 5);
  const val1 = Math.floor(mathGoal / 2) + Math.floor(Math.random() * 3);
  const val2 = mathGoal - val1;
  let val3 = mathGoal - Math.floor(Math.random() * 5) - 1;
  if (val3 === val1 || val3 === val2) val3 += 2;
  const values = [val1, val2, val3].sort(() => Math.random() - 0.5);

  const platforms = level.entities.filter(
    (e) => e.type === "platform" || e.type === "falling_platform",
  );

  const getPlatformNear = (xTarget: number) => {
    let closest = platforms[0] || {
      pos: { x: xTarget, y: level.spawn.y },
      width: 0,
    };
    let minDiff = Infinity;
    for (const p of platforms) {
      const pCenterX = p.pos.x + p.width / 2;
      const diff = Math.abs(pCenterX - xTarget);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    return closest;
  };

  const p1 = getPlatformNear(250);
  const p2 = getPlatformNear(450);
  const p3 = getPlatformNear(650);

  const targetPositions = [
    {
      x: Math.max(50, Math.min(750, p1.pos.x + p1.width / 2)),
      y: p1.pos.y - 60,
    },
    {
      x: Math.max(50, Math.min(750, p2.pos.x + p2.width / 2)),
      y: p2.pos.y - 60,
    },
    {
      x: Math.max(50, Math.min(750, p3.pos.x + p3.width / 2)),
      y: p3.pos.y - 60,
    },
  ];

  const mathEntities: Entity[] = values.map((v, i) => ({
    id: `math_${i}`,
    pos: targetPositions[i],
    vel: { x: 0, y: 0 },
    width: 30,
    height: 30,
    color: "#22c55e",
    type: "math_number",
    value: v,
  }));

  return {
    player: {
      id: "player",
      pos: { ...level.spawn },
      vel: { x: 0, y: 0 },
      width: 20,
      height: 50,
      color: "#000",
      type: "player",
    },
    entities: [...level.entities, ...mathEntities],
    levelIndex: index,
    isGrounded: false,
    jumpsRemaining: 3,
    coyoteTimeCounter: 0,
    jumpBufferCounter: 0,
    score: 0,
    isGameOver: false,
    isVictory: false,
    isLevelComplete: false,
    activeNarrative: level.narrative ? level.narrative[0] : null,
    trail: [],
    screenShake: 0,
    particles: [],
    dashCooldown: 0,
    dashTimer: 0,
    deathPos: null,
    idleFrames: 0,
    mathGoal,
    collectedSum: 0,
    collectedCount: 0,
  };
};

// --- Pixi Components ---

function SketchyLine({
  x1,
  y1,
  x2,
  y2,
  color = 0x000000,
  thickness = 2,
  wobble = 1.5,
}: any) {
  const draw = useCallback(
    (g: any) => {
      g.clear();
      g.setStrokeStyle({
        width: thickness,
        color,
        alpha: 1,
        cap: "round",
        join: "round",
      });
      const paths = generateSketchyLine(x1, y1, x2, y2, wobble);
      paths.forEach((path) => {
        g.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          g.lineTo(path.points[i].x, path.points[i].y);
        }
      });
      g.stroke();
    },
    [x1, y1, x2, y2, color, thickness, wobble],
  );

  return <pixiGraphics draw={draw} />;
}

function Stickman({
  player,
  isGrounded,
  isGameOver,
  idleFrames,
}: {
  player: Entity;
  isGrounded: boolean;
  isGameOver: boolean;
  idleFrames: number;
}) {
  const draw = useCallback(
    (g: any) => {
      g.clear();
      const pose = getStickmanPose(
        player.width,
        player.height,
        player.vel.x,
        isGameOver,
        idleFrames,
      );

      g.setStrokeStyle({
        width: 2,
        color: isGameOver ? 0x666666 : 0x000000,
        alpha: 1,
      });

      // Head
      const headX = pose.head.x;
      const headY = pose.head.y;
      g.drawCircle(headX, headY, pose.head.radius);
      g.drawCircle(
        headX + (Math.random() - 0.5),
        headY + (Math.random() - 0.5),
        pose.head.radius + 0.5,
      );
      g.stroke();

      // Skeleton
      const drawBone = (p1: any, p2: any) => {
        const p = generateSketchyLine(p1.x, p1.y, p2.x, p2.y, 1.5);
        p.forEach((path) => {
          g.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            g.lineTo(path.points[i].x, path.points[i].y);
          }
        });
        g.stroke();
      };

      drawBone(pose.spine[0], pose.spine[1]);
      pose.arms.forEach((arm) => drawBone(arm[0], arm[1]));
      pose.legs.forEach((leg) => drawBone(leg[0], leg[1]));

      if (idleFrames > 240) {
        const zPhase = Date.now() / 400;
        g.setStrokeStyle({ width: 2, color: 0x999999, alpha: 0.8 });
        for (let i = 0; i < 3; i++) {
          const yOffset = (zPhase + i * 0.8) % 3;
          const xOffset = Math.sin(yOffset * Math.PI) * 5;
          const size = 3 + yOffset * 2;
          const baseZ_X = pose.head.x + 8 + xOffset;
          const baseZ_Y = pose.head.y - 10 - yOffset * 15;

          g.moveTo(baseZ_X, baseZ_Y);
          g.lineTo(baseZ_X + size, baseZ_Y);
          g.lineTo(baseZ_X, baseZ_Y + size);
          g.lineTo(baseZ_X + size, baseZ_Y + size);
        }
        g.stroke();
      }
    },
    [player, isGameOver, idleFrames],
  );

  // SQUASH AND STRETCH
  let scaleX = 1;
  let scaleY = 1;
  const vY = player.vel.y;

  if (!isGrounded) {
    // Stretching while in air
    const stretch = Math.min(0.2, Math.abs(vY) * 0.02);
    scaleY = 1 + stretch;
    scaleX = 1 - stretch;
  } else if (Math.abs(player.vel.x) > 0.1) {
    // Slight lean/squash while running
    scaleX = 1.05;
    scaleY = 0.95;
  }

  // SHINE PULSE
  const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;

  // Proximity to goal increases shine
  // We don't have level goal here easily without passing it, but let's just use a general pulse for now
  // or pass the distance.
  const isReady = true;

  return (
    <pixiContainer
      x={player.pos.x + player.width / 2}
      y={player.pos.y + player.height}
      scale={{ x: scaleX, y: scaleY }}
      pivot={{ x: player.width / 2, y: player.height }}
    >
      {/* Glow Aura - more intense when moving fast or jumping */}
      <pixiGraphics
        draw={(g) => {
          const velMag = Math.sqrt(player.vel.x ** 2 + player.vel.y ** 2);
          const glowScale = 1 + velMag * 0.05;
          g.clear();
          g.beginFill(0x000000, 0.03 + pulse * 0.03);
          g.drawCircle(
            player.width / 2,
            player.height / 2,
            (30 + pulse * 10) * glowScale,
          );
          g.endFill();
        }}
      />
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}

function GameWorld({
  state,
  keys,
  onComplete,
  onGameOver,
  gameState,
  recordingRef,
}: {
  state: GameState;
  keys: React.MutableRefObject<Set<string>>;
  onComplete: () => void;
  onGameOver: () => void;
  gameState: string;
  recordingRef: React.MutableRefObject<
    {
      x: number;
      y: number;
      vel: { x: number; y: number };
      isGrounded: boolean;
    }[]
  >;
}) {
  const [internalState, setInternalState] = useState(state);
  const replayIndex = useRef(0);

  useEffect(() => {
    setInternalState(state);
    if (gameState === "replay" || gameState === "playing") {
      replayIndex.current = 0;
    }
  }, [state, gameState]);

  useTick(() => {
    if (gameState === "replay") {
      const records = recordingRef.current;
      if (records && replayIndex.current < records.length) {
        const frame = records[replayIndex.current];

        // Trail logic for replay
        const newTrail = [
          ...internalState.trail,
          {
            x: frame.x + internalState.player.width / 2,
            y: frame.y + internalState.player.height / 2,
            alpha: 0.6,
          },
        ]
          .map((p) => ({ ...p, alpha: p.alpha - 0.04 }))
          .filter((p) => p.alpha > 0);

        setInternalState((prev) => ({
          ...prev,
          trail: newTrail.slice(-20),
          player: {
            ...prev.player,
            pos: { x: frame.x, y: frame.y },
            vel: { ...frame.vel },
          },
          isGrounded: frame.isGrounded,
          idleFrames: 0,
        }));
        replayIndex.current++;
      } else if (replayIndex.current >= records.length) {
        // Loop replays until user clicks Next Chapter
        replayIndex.current = 0;
      }
      return;
    }

    if (
      internalState.isGameOver ||
      internalState.isLevelComplete ||
      gameState !== "playing"
    )
      return;

    const next = updatePhysics(internalState, keys.current);

    // Record frame
    recordingRef.current.push({
      x: next.player.pos.x,
      y: next.player.pos.y,
      vel: { x: next.player.vel.x, y: next.player.vel.y },
      isGrounded: next.isGrounded,
    });

    // Trail logic
    const newTrail = [
      ...internalState.trail,
      {
        x: next.player.pos.x + next.player.width / 2,
        y: next.player.pos.y + next.player.height / 2,
        alpha: 0.6,
      },
    ]
      .map((p) => ({ ...p, alpha: p.alpha - 0.04 }))
      .filter((p) => p.alpha > 0);
    next.trail = newTrail.slice(-20); // Limit trail length for performance

    // Land effect (screen shake)
    if (!internalState.isGrounded && next.isGrounded) {
      next.screenShake = 5;
    } else {
      next.screenShake = Math.max(0, internalState.screenShake * 0.8);
    }

    // Goal check
    const levelGoal = levels[internalState.levelIndex].goal;
    const distToGoalX = Math.abs(
      next.player.pos.x + next.player.width / 2 - levelGoal.x,
    );
    const distToGoalY = Math.abs(
      next.player.pos.y + next.player.height / 2 - levelGoal.y,
    );

    if (
      distToGoalX < 30 &&
      distToGoalY < 40 &&
      next.collectedSum === next.mathGoal &&
      next.collectedCount === 2
    ) {
      if (!internalState.isLevelComplete) {
        // Switch to replay mode handled by parent
        onComplete();
      }
    }

    if (next.isGameOver && !internalState.isGameOver) {
      onGameOver();
    }

    setInternalState(next);
  });

  const goal = levels[internalState.levelIndex].goal;
  const pulse = Math.sin(Date.now() / 200) * 5;

  const drawGrid = useCallback((g: any) => {
    g.clear();
    g.setStrokeStyle({ width: 0.5, color: 0x000000, alpha: 0.1 });
    const step = 50;
    for (let x = 0; x < 800; x += step) {
      g.moveTo(x, 0);
      g.lineTo(x, 600);
    }
    for (let y = 0; y < 600; y += step) {
      g.moveTo(0, y);
      g.lineTo(800, y);
    }
    g.stroke();

    // X-Y Axes
    g.setStrokeStyle({ width: 2, color: 0x000000, alpha: 0.2 });
    g.moveTo(400, 0);
    g.lineTo(400, 600); // Y
    g.moveTo(0, 300);
    g.lineTo(800, 300); // X
    g.stroke();
  }, []);

  const drawMathematicalArtifacts = useCallback((g: any) => {
    g.clear();
    g.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.15 });

    // Infinity símbolo
    const drawInf = (x: number, y: number) => {
      g.moveTo(x, y);
      g.bezierCurveTo(x + 20, y - 20, x + 40, y + 20, x + 20, y);
      g.bezierCurveTo(x, y - 20, x - 20, y + 20, x, y);
    };
    drawInf(100, 100);
    drawInf(700, 500);

    // Delta
    g.moveTo(650, 100);
    g.lineTo(670, 100);
    g.lineTo(660, 80);
    g.closePath();

    // Sigma
    g.moveTo(100, 450);
    g.lineTo(120, 450);
    g.lineTo(105, 460);
    g.lineTo(120, 470);
    g.lineTo(100, 470);

    // Integral
    g.moveTo(700, 200);
    g.bezierCurveTo(710, 180, 690, 180, 700, 200);
    g.lineTo(700, 240);
    g.bezierCurveTo(690, 260, 710, 260, 700, 240);

    g.stroke();
  }, []);

  const drawSpike = useCallback((g: any, entity: Entity) => {
    g.clear();
    g.setStrokeStyle({ width: 2, color: 0xef4444, alpha: 1 });
    const spikeWidth = 20;
    const count = Math.floor(entity.width / spikeWidth);
    for (let i = 0; i < count; i++) {
      const x = i * spikeWidth;
      g.moveTo(x, entity.height);
      g.lineTo(x + spikeWidth / 2, 0);
      g.lineTo(x + spikeWidth, entity.height);
    }
    g.stroke();
  }, []);

  const drawSaw = useCallback((g: any, entity: Entity) => {
    g.clear();
    g.setStrokeStyle({ width: 2, color: 0x000000, alpha: 1 });
    const radius = entity.width / 2;
    const segments = 8;
    const rotation = Date.now() / 100;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      const outerX = radius + Math.cos(angle) * radius;
      const outerY = radius + Math.sin(angle) * radius;
      const innerX = radius + Math.cos(angle + 0.2) * (radius * 0.6);
      const innerY = radius + Math.sin(angle + 0.2) * (radius * 0.6);
      if (i === 0) g.moveTo(outerX, outerY);
      else g.lineTo(outerX, outerY);
      g.lineTo(innerX, innerY);
    }
    g.closePath();
    g.stroke();
  }, []);

  return (
    <pixiContainer>
      {/* Grid */}
      <pixiGraphics draw={drawGrid} />

      {/* Background Math symbols */}
      <pixiGraphics draw={drawMathematicalArtifacts} />

      {/* Static & Falling Platforms */}
      {internalState.entities.map(
        (e, i) =>
          (e.type === "platform" || e.type === "falling_platform") && (
            <pixiContainer key={e.id + i} x={e.pos.x} y={e.pos.y}>
              <pixiGraphics
                draw={(g: any) => {
                  g.clear();
                  g.setStrokeStyle({ width: 4, color: 0x000000, alpha: 1 });
                  // Draw architectural sketchy block
                  const paths = generateSketchyLine(0, 0, e.width, 0, 2);
                  paths.forEach((p) => {
                    g.moveTo(p.points[0].x, p.points[0].y);
                    p.points.forEach((pt) => g.lineTo(pt.x, pt.y));
                  });
                  g.stroke();
                  // Add some sketchy texture
                  if (e.height > 20) {
                    g.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.1 });
                    for (let h = 10; h < e.height; h += 10) {
                      g.moveTo(5, h);
                      g.lineTo(e.width - 5, h);
                    }
                    g.stroke();
                  }
                }}
              />
            </pixiContainer>
          ),
      )}

      {/* Traps */}
      {internalState.entities.map((e, i) => {
        if (e.type === "spike")
          return (
            <pixiContainer key={e.id + i} x={e.pos.x} y={e.pos.y}>
              <pixiGraphics draw={(g: any) => drawSpike(g, e)} />
            </pixiContainer>
          );
        if (e.type === "saw")
          return (
            <pixiContainer key={e.id + i} x={e.pos.x} y={e.pos.y}>
              <pixiGraphics draw={(g: any) => drawSaw(g, e)} />
            </pixiContainer>
          );
        return null;
      })}

      {/* Goal */}
      <pixiContainer
        x={goal.x}
        y={goal.y}
        rotation={pulse * 0.05}
        scale={{ x: 1 + pulse * 0.02, y: 1 + pulse * 0.02 }}
      >
        <SketchyLine
          x1={-80}
          y1={-80}
          x2={80}
          y2={80}
          color={0x22c55e}
          thickness={4}
          wobble={12}
        />
        <SketchyLine
          x1={-70}
          y1={-85}
          x2={85}
          y2={70}
          color={0x22c55e}
          thickness={3}
          wobble={15}
        />
        <SketchyLine
          x1={-85}
          y1={-70}
          x2={70}
          y2={85}
          color={0x22c55e}
          thickness={3}
          wobble={10}
        />
        <SketchyLine
          x1={80}
          y1={-80}
          x2={-80}
          y2={80}
          color={0x22c55e}
          thickness={4}
          wobble={12}
        />
        <SketchyLine
          x1={70}
          y1={-85}
          x2={-85}
          y2={70}
          color={0x22c55e}
          thickness={3}
          wobble={15}
        />
        <SketchyLine
          x1={85}
          y1={-70}
          x2={-70}
          y2={85}
          color={0x22c55e}
          thickness={3}
          wobble={10}
        />

        <pixiContainer y={-140}>
          {[0, 1, 2, 3].map((i) => {
            const isBase = i === 0;
            const rx = isBase ? 0 : (Math.random() - 0.5) * 8;
            const ry = isBase ? 0 : (Math.random() - 0.5) * 8;
            return (
              <pixiText
                key={i}
                text={internalState.mathGoal?.toString() || ""}
                x={rx}
                y={ry}
                anchor={0.5}
                alpha={isBase ? 1 : 0.25}
                style={
                  new TextStyle({
                    fontFamily: "monospace",
                    fontSize: 80,
                    fill: "#22c55e",
                    fontWeight: "bold",
                  })
                }
              />
            );
          })}
        </pixiContainer>
      </pixiContainer>

      {/* Math Numbers */}
      {internalState.entities.map((e, i) => {
        if (e.type === "math_number") {
          const tPulse = Math.sin(Date.now() / 150 + i * 10);
          const tPulse2 = Math.cos(Date.now() / 120 + i * 10);
          return (
            <pixiContainer
              key={e.id + i}
              x={e.pos.x + e.width / 2}
              y={e.pos.y + e.height / 2}
              scale={{ x: 1 + tPulse * 0.05, y: 1 + tPulse2 * 0.05 }}
            >
              {[0, 1, 2].map((layerIndex) => {
                const ObjectScale =
                  layerIndex === 0 ? 1 : 1 + (Math.random() - 0.5) * 0.1;
                const rx = layerIndex === 0 ? 0 : (Math.random() - 0.5) * 6;
                const ry = layerIndex === 0 ? 0 : (Math.random() - 0.5) * 6;
                const rRot = layerIndex === 0 ? 0 : (Math.random() - 0.5) * 0.1;
                return (
                  <pixiText
                    key={layerIndex}
                    text={e.value?.toString() || ""}
                    x={rx}
                    y={ry}
                    anchor={0.5}
                    rotation={rRot}
                    scale={{ x: ObjectScale, y: ObjectScale }}
                    alpha={layerIndex === 0 ? 1 : 0.4}
                    style={
                      new TextStyle({
                        fontFamily: "monospace",
                        fontSize: 48, // slightly larger
                        fill: "#22c55e",
                        fontWeight: "bold",
                      })
                    }
                  />
                );
              })}
            </pixiContainer>
          );
        }
        return null;
      })}

      {/* Particles */}
      {internalState.particles.map((p, i) => (
        <pixiContainer key={`particle-${i}`} x={p.x} y={p.y} alpha={p.life}>
          <pixiGraphics
            draw={(g: any) => {
              g.clear();
              // Sketchy small symbol
              g.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.5 });
              g.moveTo(-2, -2);
              g.lineTo(2, 2);
              g.stroke();
            }}
          />
        </pixiContainer>
      ))}

      {/* Trail */}
      {internalState.trail.map((point, i) => (
        <pixiGraphics
          key={`trail-${i}`}
          draw={(g) => {
            g.clear();
            g.setStrokeStyle({
              width: 1,
              color: 0x000000,
              alpha: point.alpha * 0.3,
            });
            // Draw a small sketchy X or line segment
            g.moveTo(-3, -3);
            g.lineTo(3, 3);
            g.moveTo(3, -3);
            g.lineTo(-3, 3);
            g.stroke();
          }}
          x={point.x}
          y={point.y}
        />
      ))}

      {/* Player */}
      <Stickman
        player={internalState.player}
        isGrounded={internalState.isGrounded}
        isGameOver={internalState.isGameOver}
        idleFrames={internalState.idleFrames}
      />

      {/* Jump Indicators (Floating pips above head) */}
      {!internalState.isGameOver && (
        <pixiContainer
          x={internalState.player.pos.x + internalState.player.width / 2 - 15}
          y={internalState.player.pos.y - 15}
        >
          {[0, 1, 2].map((i) => (
            <pixiGraphics
              key={`jump-pip-${i}`}
              x={i * 12}
              draw={(g: any) => {
                g.clear();
                const active = i < internalState.jumpsRemaining;
                g.beginFill(0x000000, active ? 0.6 : 0.1);
                g.drawRect(0, 0, 8, 2);
                g.endFill();
              }}
            />
          ))}
        </pixiContainer>
      )}

      {/* Death Marker */}
      {internalState.isGameOver && internalState.deathPos && (
        <pixiContainer
          x={internalState.deathPos.x}
          y={internalState.deathPos.y - 40}
        >
          <pixiGraphics
            draw={(g: any) => {
              g.clear();
              g.setStrokeStyle({ width: 1, color: 0xef4444, alpha: 0.8 });
              // Draw OOF in sketchy style
              const drawChar = (char: string, x: number) => {
                if (char === "O") {
                  g.drawCircle(x + 5, 5, 5);
                } else if (char === "F") {
                  g.moveTo(x, 0);
                  g.lineTo(x + 10, 0);
                  g.moveTo(x, 5);
                  g.lineTo(x + 8, 5);
                  g.moveTo(x, 0);
                  g.lineTo(x, 10);
                }
              };
              drawChar("O", 0);
              drawChar("O", 15);
              drawChar("F", 30);
              g.stroke();
            }}
          />
        </pixiContainer>
      )}
    </pixiContainer>
  );
}

// --- Main Component ---

export default function GameCanvas() {
  const [gameState, setGameState] = useState<
    "intro" | "title" | "playing" | "replay" | "complete"
  >("title");
  const [levelIndex, setLevelIndex] = useState(0);
  const [state, setState] = useState<GameState>(initialState(levels[0], 0));
  const [saveExists, setSaveExists] = useState(hasSaveGame());
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const keys = useRef<Set<string>>(new Set());
  const narrativeIndex = useRef(0);
  const recordingRef = useRef<
    {
      x: number;
      y: number;
      vel: { x: number; y: number };
      isGrounded: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handleKeyDown = (e: KeyboardEvent) => keys.current.add(e.key);
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === " ") e.preventDefault(); // Prevent scroll on space
      if (e.key.toLowerCase() === "r") {
        restartLevel();
        return;
      }
      keys.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener("keydown", handleKeyDownGlobal);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDownGlobal);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const onComplete = useCallback(() => {
    setState((prev) => ({ ...prev, isLevelComplete: true }));
    setGameState("replay");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  const onGameOver = useCallback(() => {
    setState((prev) => ({ ...prev, isGameOver: true }));
  }, []);

  const nextLevel = () => {
    if (levelIndex + 1 < levels.length) {
      const nextIdx = levelIndex + 1;
      setLevelIndex(nextIdx);
      const nextState = {
        ...initialState(levels[nextIdx], nextIdx),
        levelIndex: nextIdx,
      };
      setState(nextState);
      recordingRef.current = [];
      setGameState("playing");
      saveGame(nextState); // AUTO-SAVE
      setSaveExists(true);
      narrativeIndex.current = 0;
    } else {
      setState((prev) => ({ ...prev, isVictory: true }));

      // FESTIVAL OF CONSTANTS
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 200,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  };

  const restartLevel = () => {
    setState(initialState(levels[levelIndex], levelIndex));
    narrativeIndex.current = 0;
    recordingRef.current = [];
    if (gameState === "replay" || gameState === "complete") {
      setGameState("playing");
    }
  };

  const handleSave = () => {
    if (saveGame(state)) {
      setSaveExists(true);
      setShowSaveMsg(true);
      setTimeout(() => setShowSaveMsg(false), 2000);
    }
  };

  const handleLoad = () => {
    const data = loadGame();
    if (data) {
      const level = levels[data.levelIndex];
      setLevelIndex(data.levelIndex);
      const baseState = initialState(level, data.levelIndex);
      setState({
        ...baseState,
        levelIndex: data.levelIndex,
        player: {
          ...baseState.player,
          pos: data.player.pos,
          vel: data.player.vel,
        },
        score: data.score,
        jumpsRemaining: data.jumpsRemaining,
        isGameOver: false,
        isLevelComplete: false,
        isVictory: false,
      });
      narrativeIndex.current = 0;
      recordingRef.current = [];
      setGameState("playing");
    }
  };

  const nextNarrative = () => {
    const currentLevel = levels[levelIndex];
    if (
      currentLevel.narrative &&
      narrativeIndex.current + 1 < currentLevel.narrative.length
    ) {
      narrativeIndex.current++;
      const nextText = currentLevel.narrative[narrativeIndex.current];
      setState((prev) => ({ ...prev, activeNarrative: nextText }));
    } else {
      setState((prev) => ({ ...prev, activeNarrative: null }));
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-stone-50 p-2 sm:p-4 overflow-hidden select-none touch-none">
      <motion.div
        animate={{
          x: state.screenShake
            ? (Math.random() - 0.5) * state.screenShake * 2
            : 0,
          y: state.screenShake
            ? (Math.random() - 0.5) * state.screenShake * 2
            : 0,
        }}
        style={{
          width: "100%",
          maxWidth: "min(800px, 100%, calc((100dvh - 160px) * 4 / 3))",
          aspectRatio: "4 / 3",
        }}
        className="relative group overflow-hidden rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-2 border-black bg-white flex-shrink-0"
      >
        <Application
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          background="#fafaf9"
          antialias={true}
        >
          <GameWorld
            state={state}
            keys={keys}
            onComplete={onComplete}
            onGameOver={onGameOver}
            gameState={gameState}
            recordingRef={recordingRef}
          />
        </Application>

        {/* Title Screen Overlay */}
        {gameState === "title" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-4 text-center">
            <h1 className="text-4xl sm:text-6xl font-black mb-2 font-mono tracking-tighter">
              STICKMAN'S HOMEWORK
            </h1>
            <p className="text-xs sm:text-sm font-mono mb-8 opacity-50 uppercase">
              Just trying to get through the notebook.
            </p>
            <button
              onClick={() => {
                recordingRef.current = [];
                setGameState("playing");
              }}
              style={{
                borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
              }}
              className="px-8 py-4 sm:px-12 sm:py-6 bg-[#fef08a] text-black font-mono font-bold text-lg sm:text-xl border-[4px] border-black hover:bg-white active:translate-x-2 active:translate-y-2 active:shadow-none transition-all shadow-[8px_8px_0_0_#000] -rotate-2"
            >
              DO HOMEWORK
            </button>

            <div className="mt-8 sm:mt-12 text-center font-mono text-[8px] sm:text-[10px] space-y-1 opacity-60 uppercase tracking-tight">
              <div className="font-bold mb-2 text-xs opacity-100 tracking-widest text-zinc-400">
                — System Protocols —
              </div>
              <div>[Arrows/WASD] to Translate</div>
              <div>[W / UP / Space] for Triple jump</div>
              <div>[S / DOWN] to Initiate fast-fall</div>
              <div>[SHIFT] to Execute directional dash</div>
              <div>[R] to Reset current state</div>
              <div>[Goal] Reach the green limit</div>
            </div>
          </div>
        )}

        {/* Replay Screen Overlay Info */}
        {gameState === "replay" && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div
              style={{
                borderRadius: "15px 225px 15px 255px/255px 15px 225px 15px",
              }}
              className="px-4 py-2 bg-white border-[2px] border-black text-black font-mono text-sm font-bold animate-pulse shadow-[3px_3px_0_0_#000] rotate-2"
            >
              ● REC REPLAYING
            </div>
          </div>
        )}

        {/* Victory Screen Overlay */}
        <AnimatePresence>
          {state.isVictory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-[100] overflow-hidden"
            >
              {/* Decorative background math elements */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.1 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute inset-0 font-mono text-[40rem] flex items-center justify-center pointer-events-none select-none"
              >
                Σ
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 text-center px-6"
              >
                <h1 className="text-6xl sm:text-9xl font-black mb-6 font-mono tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                  A+
                </h1>

                <p className="text-xl sm:text-2xl font-mono mb-8 uppercase tracking-[0.4em] text-zinc-400">
                  You survived Math Class
                </p>

                <div className="flex justify-center gap-4 mb-12">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                      className="w-3 h-3 rounded-full bg-white"
                    />
                  ))}
                </div>

                <div className="font-mono text-sm opacity-60 mb-12 max-w-lg mx-auto leading-relaxed italic">
                  "Wow. You finished all your homework. The sketchy saws and
                  floating math symbols were no match for your triple jumps. Now
                  go outside and play."
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  onClick={() => {
                    setLevelIndex(0);
                    setState(initialState(levels[0], 0));
                    setGameState("title");
                    recordingRef.current = [];
                  }}
                  style={{
                    borderRadius: "15px 255px 15px 225px/225px 15px 255px 15px",
                  }}
                  className="px-8 py-4 sm:px-16 sm:py-8 bg-white text-black font-mono font-bold text-lg sm:text-xl border-[4px] border-black transition-all shadow-[8px_8px_0_0_#000] hover:bg-slate-100 active:shadow-none active:translate-x-2 active:translate-y-2 rotate-1"
                >
                  PLAY AGAIN (WHY NOT)
                </motion.button>
              </motion.div>

              {/* Floating particles or symbols */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-zinc-800 font-mono text-4xl pointer-events-none"
                  initial={{
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, Math.random() * -100 - 100],
                    opacity: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                >
                  {
                    ["∞", "π", "Δ", "∫", "Ω", "√"][
                      Math.floor(Math.random() * 6)
                    ]
                  }
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Narrative Overlay */}
        <AnimatePresence>
          {state.activeNarrative && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-12 left-0 right-0 p-8 flex justify-center pointer-events-none"
            >
              <div
                className="bg-white/90 border-2 border-black p-4 max-w-lg text-center font-mono pointer-events-auto cursor-pointer hover:bg-black hover:text-white transition-colors"
                onClick={nextNarrative}
              >
                {state.activeNarrative}
                <div className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">
                  [ Click to continue ]
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Complete Overlay */}
        <AnimatePresence>
          {state.isLevelComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white/90 border-4 border-black p-8 text-center shadow-2xl pointer-events-auto flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 font-mono">
                  DESTINY CHALLENGED
                </h2>
                <button
                  onClick={nextLevel}
                  style={{
                    borderRadius: "15px 225px 15px 255px/255px 15px 225px 15px",
                  }}
                  className="px-6 py-3 bg-white text-black font-mono font-bold hover:bg-slate-100 border-[3px] border-black transition-all shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none rotate-2"
                >
                  NEXT CHAPTER
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {state.isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80"
            >
              <div className="text-white text-center">
                <h2 className="text-6xl font-black mb-8 font-mono">ERASED</h2>
                <button
                  onClick={restartLevel}
                  style={{
                    borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                  }}
                  className="px-8 py-4 bg-white text-black font-bold font-mono hover:bg-slate-100 border-[3px] border-black transition-all shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none -rotate-2"
                >
                  RE-DRAW
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        {gameState !== "replay" && (
          <div
            style={{
              borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
            }}
            className="absolute top-4 left-4 font-mono text-xs font-bold uppercase tracking-widest text-black bg-white border-[2px] border-black px-4 py-2 shadow-[3px_3px_0_0_#000] -rotate-1 z-10"
          >
            Phase: {levels[levelIndex].name}
          </div>
        )}
      </motion.div>

      {/* Invisible Mobile Touch Zones */}
      {gameState === "playing" && (
        <div className="absolute inset-0 z-40 lg:hidden flex">
          <div
            className="flex-1 opacity-0"
            onTouchStart={() => keys.current.add("ArrowLeft")}
            onTouchEnd={() => keys.current.delete("ArrowLeft")}
            onPointerDown={() => keys.current.add("ArrowLeft")}
            onPointerUp={() => keys.current.delete("ArrowLeft")}
            onPointerCancel={() => keys.current.delete("ArrowLeft")}
          />
          <div
            className="flex-1 opacity-0 border-l border-r border-transparent"
            onTouchStart={() => keys.current.add("ArrowUp")}
            onTouchEnd={() => keys.current.delete("ArrowUp")}
            onPointerDown={() => keys.current.add("ArrowUp")}
            onPointerUp={() => keys.current.delete("ArrowUp")}
            onPointerCancel={() => keys.current.delete("ArrowUp")}
          />
          <div
            className="flex-1 opacity-0"
            onTouchStart={() => keys.current.add("ArrowRight")}
            onTouchEnd={() => keys.current.delete("ArrowRight")}
            onPointerDown={() => keys.current.add("ArrowRight")}
            onPointerUp={() => keys.current.delete("ArrowRight")}
            onPointerCancel={() => keys.current.delete("ArrowRight")}
          />
        </div>
      )}

      {/* Mobile Controls Overlay (Visual only now, but still functional) */}
      {gameState === "playing" && (
        <div
          className="w-full mt-4 flex justify-between items-end lg:hidden select-none touch-none z-50 pointer-events-none"
          style={{
            maxWidth: "min(800px, 100%, calc((100dvh - 40px) * 4 / 3))",
          }}
        >
          <div className="flex gap-4 pointer-events-auto">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                keys.current.add("ArrowLeft");
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                keys.current.delete("ArrowLeft");
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                keys.current.add("ArrowLeft");
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                keys.current.delete("ArrowLeft");
              }}
              onPointerCancel={(e) => keys.current.delete("ArrowLeft")}
              style={{
                borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
              }}
              className="w-20 h-20 bg-white active:bg-slate-100 flex items-center justify-center text-black font-bold text-4xl select-none touch-none border-[3px] border-black shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all -rotate-3"
            >
              ←
            </button>
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                keys.current.add("ArrowRight");
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                keys.current.delete("ArrowRight");
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                keys.current.add("ArrowRight");
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                keys.current.delete("ArrowRight");
              }}
              onPointerCancel={(e) => keys.current.delete("ArrowRight")}
              style={{
                borderRadius: "15px 225px 15px 255px/255px 15px 225px 15px",
              }}
              className="w-20 h-20 bg-white active:bg-slate-100 flex items-center justify-center text-black font-bold text-4xl select-none touch-none border-[3px] border-black shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all rotate-2"
            >
              →
            </button>
          </div>
          <div className="pointer-events-auto">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                keys.current.add("ArrowUp");
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                keys.current.delete("ArrowUp");
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                keys.current.add("ArrowUp");
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                keys.current.delete("ArrowUp");
              }}
              onPointerCancel={(e) => keys.current.delete("ArrowUp")}
              style={{
                borderRadius: "255px 25px 225px 25px/25px 225px 25px 255px",
              }}
              className="w-24 h-24 bg-white active:bg-slate-100 outline-dashed outline-offset-4 outline-[2px] outline-zinc-400 flex items-center justify-center text-black font-black text-xl select-none touch-none border-[4px] border-black shadow-[6px_6px_0_0_#000] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all -rotate-1"
            >
              JUMP
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 sm:mt-8 text-center max-w-2xl w-full">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleSave}
            style={{
              borderRadius: "15px 225px 15px 255px/255px 15px 225px 15px",
            }}
            className="px-6 py-2 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-mono text-xs hover:bg-black hover:text-white transition-all uppercase tracking-widest relative rotate-1"
          >
            Record State (Save)
            {showSaveMsg && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -30 }}
                className="absolute left-0 right-0 text-[10px] text-green-600 font-bold"
              >
                DATA STORED
              </motion.span>
            )}
          </button>
          <button
            onClick={handleLoad}
            disabled={!saveExists}
            style={{
              borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
            }}
            className="px-6 py-2 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-mono text-xs hover:bg-black hover:text-white transition-all uppercase tracking-widest disabled:opacity-30 disabled:shadow-none disabled:translate-x-[3px] disabled:translate-y-[3px] disabled:cursor-not-allowed -rotate-1"
          >
            Iterate Back (Load)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 text-xs font-mono uppercase opacity-40">
          <div>Move: WASD / Arrows</div>
          <div>Jump: Space / W / Up</div>
        </div>
      </div>
    </div>
  );
}
