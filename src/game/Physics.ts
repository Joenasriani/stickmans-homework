/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity, GameState } from "../types";

const GRAVITY = 0.3;
const JUMP_FORCE = -10.5;
const ACCEL = 0.6;
const AIR_ACCEL = 0.5;
const FRICTION = 0.85;
const AIR_FRICTION = 0.96;
const MAX_SPEED = 6.5;

export function updatePhysics(state: GameState, keys: Set<string>): GameState {
  if (state.isGameOver || state.isLevelComplete) {
    const nextParticles = state.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1,
        life: p.life - 0.02,
      }))
      .filter((p) => p.life > 0);
    return {
      ...state,
      particles: nextParticles,
      screenShake: Math.max(0, state.screenShake * 0.8),
    };
  }

  const newState = {
    ...state,
    player: { ...state.player },
    entities: state.entities.map((e) => ({ ...e })),
  };
  const { player, entities } = newState;

  const spawnParticles = (x: number, y: number, count: number) => {
    const chars = ["x", "y", "z", "Δ", "Σ", "∫"];
    for (let i = 0; i < count; i++) {
      newState.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 1) * 4,
        life: 1.0,
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }
  };

  // --- Input Counters ---
  if (newState.isGrounded) {
    newState.coyoteTimeCounter = 15;
    newState.jumpsRemaining = 3;
  } else if (newState.coyoteTimeCounter > 0) {
    newState.coyoteTimeCounter--;
  }

  if (keys.has("ArrowUp") || keys.has("w") || keys.has(" ")) {
    newState.jumpBufferCounter = 15;
  } else if (newState.jumpBufferCounter > 0) {
    newState.jumpBufferCounter--;
  }

  // --- Dash Logic ---
  if (newState.dashCooldown > 0) newState.dashCooldown--;
  if (newState.dashTimer > 0) {
    newState.dashTimer--;
    player.vel.y = 0; // Freeze gravity during dash
    // Leave a ghost trail
    if (newState.dashTimer % 2 === 0) {
      newState.trail.push({
        x: player.pos.x + player.width / 2,
        y: player.pos.y + player.height / 2,
        alpha: 0.8,
      });
    }
  }

  if (
    keys.has("Shift") &&
    newState.dashCooldown === 0 &&
    (keys.has("ArrowLeft") ||
      keys.has("a") ||
      keys.has("ArrowRight") ||
      keys.has("d"))
  ) {
    const dir = keys.has("ArrowLeft") || keys.has("a") ? -1 : 1;
    player.vel.x = dir * 15; // Massive burst
    newState.dashTimer = 10; // Dash duration in frames
    newState.dashCooldown = 60; // 1 second cooldown
    newState.screenShake = 5;
    spawnParticles(
      player.pos.x + player.width / 2,
      player.pos.y + player.height / 2,
      10,
    );
  }

  // --- Player Horizontal Movement ---
  const currentAccel = newState.isGrounded ? ACCEL : AIR_ACCEL;

  if (keys.has("ArrowLeft") || keys.has("a")) {
    player.vel.x -= currentAccel;
  } else if (keys.has("ArrowRight") || keys.has("d")) {
    player.vel.x += currentAccel;
  } else {
    player.vel.x *= newState.isGrounded ? FRICTION : AIR_FRICTION;
  }

  // Speed cap
  if (player.vel.x > MAX_SPEED) player.vel.x = MAX_SPEED;
  if (player.vel.x < -MAX_SPEED) player.vel.x = -MAX_SPEED;
  if (Math.abs(player.vel.x) < 0.1) player.vel.x = 0;

  // Apply gravity
  let currentGravity = GRAVITY;
  if (!newState.isGrounded) {
    if (keys.has("ArrowDown") || keys.has("s")) {
      currentGravity *= 2.2;
    }
    // Variable jump height
    if (
      !(keys.has("ArrowUp") || keys.has("w") || keys.has(" ")) &&
      player.vel.y < 0
    ) {
      player.vel.y += GRAVITY * 1.5;
    }
    player.vel.y += currentGravity;
  } else {
    player.vel.y = 0;
  }

  // Update position
  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;

  // --- Idle Logic ---
  if (
    keys.size === 0 &&
    newState.isGrounded &&
    Math.abs(player.vel.x) < 0.1 &&
    Math.abs(player.vel.y) < 0.1
  ) {
    newState.idleFrames++;
  } else {
    newState.idleFrames = 0;
  }

  // --- Update Particles ---
  newState.particles = newState.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.1,
      life: p.life - 0.02,
    }))
    .filter((p) => p.life > 0);

  // Jump (Triple jump support)
  if (newState.jumpBufferCounter > 0) {
    if (newState.coyoteTimeCounter > 0 || newState.jumpsRemaining > 0) {
      // Scale jump force slightly for weight
      const forceMult = newState.jumpsRemaining === 3 ? 1 : 0.9;
      player.vel.y = JUMP_FORCE * forceMult;

      // Particle pop
      spawnParticles(
        player.pos.x + player.width / 2,
        player.pos.y + player.height,
        5,
      );

      newState.isGrounded = false;
      newState.coyoteTimeCounter = 0;
      newState.jumpBufferCounter = 0;
      newState.jumpsRemaining--;
    }
  }
  for (const entity of entities) {
    if (entity.type === "saw" && entity.dynamic) {
      // Circular or linear motion
      const time = Date.now() / 1000;
      if (entity.dynamic.origin && entity.dynamic.radius) {
        entity.pos.x =
          entity.dynamic.origin.x +
          Math.cos(time * (entity.dynamic.speed || 1)) * entity.dynamic.radius;
        entity.pos.y =
          entity.dynamic.origin.y +
          Math.sin(time * (entity.dynamic.speed || 1)) * entity.dynamic.radius;
      } else if (entity.dynamic.startPos && entity.dynamic.endPos) {
        const t = (Math.sin(time * (entity.dynamic.speed || 1)) + 1) / 2;
        entity.pos.x =
          entity.dynamic.startPos.x +
          (entity.dynamic.endPos.x - entity.dynamic.startPos.x) * t;
        entity.pos.y =
          entity.dynamic.startPos.y +
          (entity.dynamic.endPos.y - entity.dynamic.startPos.y) * t;
      }
    } else if (entity.type === "falling_platform" && entity.dynamic) {
      if (entity.dynamic.timer !== undefined) {
        entity.dynamic.timer--;
        if (entity.dynamic.timer <= 0) {
          entity.vel.y += 0.5;
          entity.pos.y += entity.vel.y;
        }
      }
    }
  }

  // --- Collision Detection ---
  newState.isGrounded = false;
  for (const entity of entities) {
    const isColliding =
      player.pos.x < entity.pos.x + entity.width &&
      player.pos.x + player.width > entity.pos.x &&
      player.pos.y < entity.pos.y + entity.height &&
      player.pos.y + player.height > entity.pos.y;

    if (isColliding) {
      if (
        entity.type === "platform" ||
        entity.type === "falling_platform" ||
        entity.type === "gate"
      ) {
        // Simple top collision
        if (
          player.vel.y > 0 &&
          player.pos.y + player.height - player.vel.y <= entity.pos.y
        ) {
          player.pos.y = entity.pos.y - player.height;
          player.vel.y = 0;
          newState.isGrounded = true;

          // Landing particles
          if (!state.isGrounded) {
            spawnParticles(player.pos.x + player.width / 2, entity.pos.y, 3);
          }

          if (entity.type === "falling_platform") {
            if (entity.dynamic && entity.dynamic.timer === undefined) {
              entity.dynamic.timer = 300; // 300 frames (approx 5s) before it falls - very generous
            }
          }
        }
        // Bottom collision
        else if (
          player.vel.y < 0 &&
          player.pos.y - player.vel.y >= entity.pos.y + entity.height
        ) {
          player.pos.y = entity.pos.y + entity.height;
          player.vel.y = 0;
        }
        // Sides
        else if (player.vel.x > 0) {
          player.pos.x = entity.pos.x - player.width;
          player.vel.x = 0;
        } else if (player.vel.x < 0) {
          player.pos.x = entity.pos.x + entity.width;
          player.vel.x = 0;
        }
      } else if (entity.type === "spike" || entity.type === "saw") {
        // Sharp collision - instant death (with 4px forgiveness padding)
        const padding = 4;
        if (
          player.pos.x + padding < entity.pos.x + entity.width - padding &&
          player.pos.x + player.width - padding > entity.pos.x + padding &&
          player.pos.y + padding < entity.pos.y + entity.height - padding &&
          player.pos.y + player.height - padding > entity.pos.y + padding
        ) {
          newState.isGameOver = true;
        }
      } else if (entity.type === "math_number") {
        // Collect number
        newState.entities = newState.entities.filter((e) => e.id !== entity.id);
        newState.collectedSum += entity.value || 0;
        newState.collectedCount += 1;

        spawnParticles(
          entity.pos.x + entity.width / 2,
          entity.pos.y + entity.height / 2,
          8,
        );

        if (
          newState.collectedCount >= 2 &&
          newState.collectedSum !== newState.mathGoal
        ) {
          newState.isGameOver = true;
        }
      }
    }
  }

  // Screen boundaries
  if (player.pos.x < 0) player.pos.x = 0;
  if (player.pos.x > 800 - player.width) player.pos.x = 800 - player.width;

  // Pit death
  if (player.pos.y > 600) {
    newState.isGameOver = true;
  }

  if (newState.isGameOver && !state.isGameOver) {
    newState.deathPos = { ...player.pos };
    if (newState.deathPos.y >= 600) {
      player.pos.y = 570; // Position on screen
      player.vel.y = 0;
      newState.deathPos.y = 570;
    }
    newState.screenShake = 15;
    spawnParticles(
      player.pos.x + player.width / 2,
      player.pos.y + player.height / 2,
      30,
    );
  }

  return newState;
}
