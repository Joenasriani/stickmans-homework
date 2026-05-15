/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector;
  vel: Vector;
  width: number;
  height: number;
  color: string;
  type: 'player' | 'platform' | 'trigger' | 'decoration' | 'spike' | 'saw' | 'gate' | 'falling_platform' | 'math_number';
  value?: number;
  dynamic?: {
    startPos?: Vector;
    endPos?: Vector;
    speed?: number;
    timer?: number;
    phase?: number;
    origin?: Vector;
    radius?: number;
  };
}

export interface Level {
  id: string;
  name: string;
  entities: Entity[];
  spawn: Vector;
  goal: Vector;
  narrative?: string[];
}

export interface GameState {
  player: Entity;
  entities: Entity[];
  levelIndex: number;
  isGrounded: boolean;
  jumpsRemaining: number;
  coyoteTimeCounter: number;
  jumpBufferCounter: number;
  score: number;
  isGameOver: boolean;
  isVictory: boolean;
  isLevelComplete: boolean;
  activeNarrative: string | null;
  trail: { x: number, y: number, alpha: number }[];
  screenShake: number;
  particles: { x: number, y: number, vx: number, vy: number, life: number, char: string }[];
  dashCooldown: number;
  dashTimer: number;
  deathPos: Vector | null;
  idleFrames: number;
  mathGoal: number;
  collectedSum: number;
  collectedCount: number;
}
