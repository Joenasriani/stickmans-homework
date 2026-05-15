/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector } from '../types';

export interface SketchyPath {
  points: Vector[];
}

export function generateSketchyLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  wobble: number = 1.5
): SketchyPath[] {
  const generate = () => {
    const points: Vector[] = [];
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = Math.max(2, Math.floor(dist / 10));

    points.push({ x: x1, y: y1 });
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      points.push({
        x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * wobble,
        y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * wobble,
      });
    }
    points.push({ x: x2, y: y2 });
    return { points };
  };

  // Return two slightly different paths to create the "messy" ink look
  return [generate(), generate()];
}

export function getStickmanPose(width: number, height: number, velX: number, isGameOver: boolean = false, idleFrames: number = 0) {
  const headRadius = width / 2;
  const neckY = headRadius * 2;
  const torsoBottomY = height * 0.6;
  const centerX = width / 2;

  if (isGameOver) {
    return {
      head: { x: centerX + 5, y: height - 5, radius: headRadius },
      spine: [ {x: centerX, y: height - neckY}, {x: centerX + 10, y: height} ],
      arms: [
        [{x: centerX + 5, y: height - 10}, {x: centerX - 10, y: height - 20}],
        [{x: centerX + 5, y: height - 10}, {x: centerX + 20, y: height - 5}]
      ],
      legs: [
        [{x: centerX + 10, y: height}, {x: centerX - 20, y: height}],
        [{x: centerX + 10, y: height}, {x: centerX + 40, y: height}]
      ]
    };
  }

  if (idleFrames > 240) { // 4 seconds idle -> sleeping
    const snore = Math.sin(Date.now() / 400) * 2;
    return {
      head: { x: centerX + 15, y: height - headRadius + snore, radius: headRadius },
      spine: [ {x: centerX + 15 - neckY, y: height - 2}, {x: centerX - 10, y: height - 2} ],
      arms: [
        [{x: centerX + 5, y: height - 5}, {x: centerX + 5, y: height - 15}], // Arm in air
        [{x: centerX + 5, y: height - 5}, {x: centerX + 10, y: height - 2}] 
      ],
      legs: [
        [{x: centerX - 10, y: height - 2}, {x: centerX - 25, y: height - 2}], // leg straight
        [{x: centerX - 10, y: height - 2}, {x: centerX - 20, y: height - 8}] // leg bent
      ]
    };
  } else if (idleFrames > 90) { // 1.5 seconds idle -> confused / scratching head
    const tap = Math.sin(Date.now() / 100) > 0 ? 0 : 5;
    const scratch = Math.sin(Date.now() / 150) * 4;
    return {
      head: { x: centerX - 2, y: headRadius, radius: headRadius },
      spine: [ {x: centerX, y: neckY}, {x: centerX - 2, y: torsoBottomY} ],
      arms: [
        [{x: centerX, y: neckY + 5}, {x: centerX - 10, y: headRadius - scratch}], // Scratching head
        [{x: centerX, y: neckY + 5}, {x: centerX + 12, y: torsoBottomY}] // Resting on hip
      ],
      legs: [
        [{x: centerX - 2, y: torsoBottomY}, {x: centerX - 6, y: height}], // Standing
        [{x: centerX - 2, y: torsoBottomY}, {x: centerX + 15, y: height - tap}] // Tapping foot
      ]
    };
  }

  const armSwing = Math.sin(Date.now() / 100) * (Math.abs(velX) > 0 ? 10 : 2);
  const legSwing = Math.sin(Date.now() / 100) * (Math.abs(velX) > 0 ? 15 : 2);

  return {
    head: { x: centerX, y: headRadius, radius: headRadius },
    spine: [ {x: centerX, y: neckY}, {x: centerX, y: torsoBottomY} ],
    arms: [
      [{x: centerX, y: neckY + 5}, {x: centerX - 15 - armSwing, y: neckY + 20}],
      [{x: centerX, y: neckY + 5}, {x: centerX + 15 + armSwing, y: neckY + 20}]
    ],
    legs: [
      [{x: centerX, y: torsoBottomY}, {x: centerX - 10 - legSwing, y: height}],
      [{x: centerX, y: torsoBottomY}, {x: centerX + 10 + legSwing, y: height}]
    ]
  };
}

