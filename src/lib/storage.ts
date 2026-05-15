/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState } from '../types';

const SAVE_KEY = 'axiom_ghost_save_data';

export const saveGame = (state: GameState) => {
  try {
    const saveData = {
      levelIndex: state.levelIndex,
      player: {
        pos: state.player.pos,
        vel: state.player.vel
      },
      score: state.score,
      jumpsRemaining: state.jumpsRemaining,
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

export const loadGame = () => {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const hasSaveGame = () => {
    return localStorage.getItem(SAVE_KEY) !== null;
};
