/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level } from './types';

export const levels: Level[] = [
  {
    id: 'origin_0',
    name: '(0,0) - The Origin',
    spawn: { x: 50, y: 300 },
    goal: { x: 700, y: 310 },
    narrative: [
      "Wait... I am a stickman?",
      "Why am I running through an unfinished notebook?",
      "Guess I need to find my destiny...",
      "...which is apparently that green scratchy thing over there."
    ],
    entities: [
      { id: 'abscissa', pos: { x: 0, y: 350 }, vel: { x: 0, y: 0 }, width: 800, height: 250, color: '#000', type: 'platform' },
    ]
  },
  {
    id: 'limit_1',
    name: 'Approaching the Limit',
    spawn: { x: 50, y: 300 },
    goal: { x: 720, y: 160 },
    narrative: [
      "Wait, who put giant sketchy saws here?",
      "Did the geometry teacher design this?",
      "At least they spin slowly... kinda."
    ],
    entities: [
      { id: 'start', pos: { x: 0, y: 350 }, vel: { x: 0, y: 0 }, width: 200, height: 250, color: '#000', type: 'platform' },
      { id: 'sine_saw_1', pos: { x: 300, y: 250 }, vel: { x: 0, y: 0 }, width: 50, height: 50, color: '#000', type: 'saw', dynamic: { startPos: { x: 250, y: 150 }, endPos: { x: 250, y: 400 }, speed: 0.8 } },
      { id: 'sine_saw_2', pos: { x: 500, y: 250 }, vel: { x: 0, y: 0 }, width: 50, height: 50, color: '#000', type: 'saw', dynamic: { startPos: { x: 500, y: 400 }, endPos: { x: 500, y: 150 }, speed: 0.8 } },
      { id: 'asymptote', pos: { x: 300, y: 250 }, vel: { x: 0, y: 0 }, width: 250, height: 20, color: '#000', type: 'platform' },
      { id: 'end', pos: { x: 650, y: 200 }, vel: { x: 0, y: 0 }, width: 150, height: 400, color: '#000', type: 'platform' },
    ]
  },
  {
    id: 'topology_2',
    name: 'Topological Rupture',
    spawn: { x: 50, y: 500 },
    goal: { x: 740, y: 150 },
    narrative: [
      "Okay, platforms that fall when I stand on them.",
      "Classic trap. Totally didn't see that coming.",
      "Red means danger. Spiky red means very danger."
    ],
    entities: [
      { id: 'manifold_start', pos: { x: 0, y: 550 }, vel: { x: 0, y: 0 }, width: 200, height: 50, color: '#000', type: 'platform' },
      { id: 'variable_1', pos: { x: 220, y: 460 }, vel: { x: 0, y: 0 }, width: 220, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'rest_constant_1', pos: { x: 450, y: 400 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'variable_2', pos: { x: 280, y: 320 }, vel: { x: 0, y: 0 }, width: 200, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'rest_constant_2', pos: { x: 80, y: 240 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'variable_3', pos: { x: 200, y: 160 }, vel: { x: 0, y: 0 }, width: 220, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'variable_4', pos: { x: 450, y: 100 }, vel: { x: 0, y: 0 }, width: 200, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'void_spikes', pos: { x: 0, y: 590 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'axiom_3',
    name: 'The First Derivative',
    spawn: { x: 50, y: 300 },
    goal: { x: 740, y: 360 },
    narrative: [
      "A giant spinning blade of doom.",
      "Just another Tuesday in Math Class.",
      "Triple jump might be handy here..."
    ],
    entities: [
      { id: 'solution_base', pos: { x: 0, y: 400 }, vel: { x: 0, y: 0 }, width: 300, height: 200, color: '#000', type: 'platform' },
      { id: 'orbital_phi', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 40, height: 40, color: '#000', type: 'saw', dynamic: { origin: { x: 400, y: 300 }, radius: 150, speed: 0.05 } },
      { id: 'jump_pad', pos: { x: 600, y: 400 }, vel: { x: 0, y: 0 }, width: 200, height: 200, color: '#000', type: 'platform' },
    ]
  },
  {
    id: 'descent_4',
    name: 'Gradient Descent',
    spawn: { x: 50, y: 50 },
    goal: { x: 740, y: 520 },
    narrative: [
      "Don't look down. Don't look down.",
      "Whoops, looked down.",
      "Time to test that 'jump in mid-air' physics."
    ],
    entities: [
      { id: 'top_plat', pos: { x: 0, y: 100 }, vel: { x: 0, y: 0 }, width: 150, height: 20, color: '#000', type: 'platform' },
      { id: 'stair_1', pos: { x: 220, y: 200 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'stair_2', pos: { x: 80, y: 350 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'stair_3', pos: { x: 250, y: 450 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'side_saw', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 60, height: 60, color: '#000', type: 'saw', dynamic: { startPos: { x: 400, y: 100 }, endPos: { x: 400, y: 500 }, speed: 0.6 } },
      { id: 'floor', pos: { x: 500, y: 550 }, vel: { x: 0, y: 0 }, width: 300, height: 50, color: '#000', type: 'platform' },
      { id: 'pit_spikes', pos: { x: 0, y: 590 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'vector_5',
    name: 'Vector Field Interference',
    spawn: { x: 50, y: 500 },
    goal: { x: 740, y: 500 },
    narrative: [
      "This is starting to look ridiculous.",
      "How does friction even work here?!",
      "I should probably use my dash... (Hold Shift)"
    ],
    entities: [
      { id: 'h_start', pos: { x: 0, y: 550 }, vel: { x: 0, y: 0 }, width: 150, height: 50, color: '#000', type: 'platform' },
      { id: 'obstacle_saw_1', pos: { x: 250, y: 500 }, vel: { x: 0, y: 0 }, width: 40, height: 40, color: '#000', type: 'saw', dynamic: { startPos: { x: 200, y: 500 }, endPos: { x: 600, y: 500 }, speed: 0.7 } },
      { id: 'obstacle_saw_2', pos: { x: 250, y: 400 }, vel: { x: 0, y: 0 }, width: 40, height: 40, color: '#000', type: 'saw', dynamic: { startPos: { x: 600, y: 400 }, endPos: { x: 200, y: 400 }, speed: 0.8 } },
      { id: 'mid_island', pos: { x: 350, y: 250 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'h_end', pos: { x: 650, y: 550 }, vel: { x: 0, y: 0 }, width: 150, height: 50, color: '#000', type: 'platform' },
      { id: 'void_spikes_long', pos: { x: 150, y: 590 }, vel: { x: 0, y: 0 }, width: 500, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'complex_6',
    name: 'Complex Transformation',
    spawn: { x: 50, y: 500 },
    goal: { x: 700, y: 100 },
    narrative: [
      "I'm feeling a bit dizzy from all this climbing.",
      "Are we there yet?"
    ],
    entities: [
      { id: 'base', pos: { x: 0, y: 550 }, vel: { x: 0, y: 0 }, width: 150, height: 50, color: '#000', type: 'platform' },
      { id: 'v_falling_1', pos: { x: 200, y: 450 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'v_falling_2', pos: { x: 50, y: 350 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'v_falling_3', pos: { x: 200, y: 250 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'v_falling_4', pos: { x: 50, y: 150 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'top_goal_plat', pos: { x: 600, y: 150 }, vel: { x: 0, y: 0 }, width: 200, height: 20, color: '#000', type: 'platform' },
      { id: 'moving_barrier', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 30, height: 200, color: '#000', type: 'saw', dynamic: { startPos: { x: 400, y: 50 }, endPos: { x: 400, y: 550 }, speed: 1.0 } },
    ]
  },
  {
    id: 'proof_7',
    name: 'Convergent Series',
    spawn: { x: 50, y: 300 },
    goal: { x: 740, y: 300 },
    narrative: [
      "Stairs? Really? ",
      "I thought we were doing advanced calculus.",
      "I demand a refund."
    ],
    entities: [
      { id: 'cs_1', pos: { x: 0, y: 350 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'platform' },
      { id: 'cs_2', pos: { x: 150, y: 250 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'cs_3', pos: { x: 300, y: 150 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'cs_4', pos: { x: 450, y: 250 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'cs_5', pos: { x: 600, y: 350 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'cs_goal', pos: { x: 700, y: 350 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'cs_spikes', pos: { x: 0, y: 590 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'gauntlet_8',
    name: 'The Entropy Gauntlet',
    spawn: { x: 50, y: 500 },
    goal: { x: 740, y: 100 },
    narrative: [
      "The Entropy Gauntlet.",
      "Sounds scary. Probably just more saws.",
      "Stay calm and triple jump."
    ],
    entities: [
      { id: 'g_1', pos: { x: 0, y: 550 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'g_saw_1', pos: { x: 200, y: 400 }, vel: { x: 0, y: 0 }, width: 50, height: 50, color: '#000', type: 'saw', dynamic: { startPos: { x: 100, y: 400 }, endPos: { x: 300, y: 400 }, speed: 1.5 } },
      { id: 'g_saw_2', pos: { x: 500, y: 300 }, vel: { x: 0, y: 0 }, width: 50, height: 50, color: '#000', type: 'saw', dynamic: { startPos: { x: 400, y: 300 }, endPos: { x: 600, y: 300 }, speed: 1.5 } },
      { id: 'g_mid', pos: { x: 350, y: 450 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'g_up_1', pos: { x: 650, y: 350 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'g_up_2', pos: { x: 450, y: 200 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'g_goal', pos: { x: 680, y: 150 }, vel: { x: 0, y: 0 }, width: 120, height: 20, color: '#000', type: 'platform' },
      { id: 'g_spikes', pos: { x: 0, y: 590 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'singularity_9',
    name: 'Event Horizon',
    spawn: { x: 50, y: 300 },
    goal: { x: 740, y: 300 },
    narrative: [
      "Oh, come on!",
      "Who designed this safety hazard?",
      "I just want my diploma!"
    ],
    entities: [
      { id: 'eh_start', pos: { x: 0, y: 350 }, vel: { x: 0, y: 0 }, width: 80, height: 20, color: '#000', type: 'platform' },
      { id: 'eh_saw_v', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 100, height: 100, color: '#000', type: 'saw', dynamic: { startPos: { x: 400, y: 50 }, endPos: { x: 400, y: 550 }, speed: 1.8 } },
      { id: 'eh_saw_h1', pos: { x: 200, y: 200 }, vel: { x: 0, y: 0 }, width: 60, height: 60, color: '#000', type: 'saw', dynamic: { startPos: { x: 100, y: 200 }, endPos: { x: 700, y: 200 }, speed: 2.2 } },
      { id: 'eh_saw_h2', pos: { x: 600, y: 400 }, vel: { x: 0, y: 0 }, width: 60, height: 60, color: '#000', type: 'saw', dynamic: { startPos: { x: 700, y: 400 }, endPos: { x: 100, y: 400 }, speed: 2.2 } },
      { id: 'eh_mid_jump', pos: { x: 380, y: 320 }, vel: { x: 0, y: 0 }, width: 40, height: 10, color: '#000', type: 'falling_platform', dynamic: {} },
      { id: 'eh_goal', pos: { x: 700, y: 350 }, vel: { x: 0, y: 0 }, width: 100, height: 20, color: '#000', type: 'platform' },
      { id: 'eh_spikes_t', pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
      { id: 'eh_spikes_b', pos: { x: 0, y: 590 }, vel: { x: 0, y: 0 }, width: 800, height: 10, color: '#ef4444', type: 'spike' },
    ]
  },
  {
    id: 'final_10',
    name: 'Q.E.D. - The Universal Truth',
    spawn: { x: 50, y: 500 },
    goal: { x: 400, y: 100 },
    narrative: [
      "I did it!",
      "I solved for X!",
      "Now... where's the cake?",
      "Wait, the cake is an illusion too?!"
    ],
    entities: [
      { id: 'final_base', pos: { x: 0, y: 550 }, vel: { x: 0, y: 0 }, width: 800, height: 50, color: '#000', type: 'platform' },
      { id: 'final_orbit_1', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'platform', dynamic: { origin: { x: 400, y: 300 }, radius: 100, speed: 0.05 } },
      { id: 'final_orbit_2', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'platform', dynamic: { origin: { x: 400, y: 300 }, radius: 180, speed: -0.04 } },
      { id: 'final_orbit_3', pos: { x: 400, y: 300 }, vel: { x: 0, y: 0 }, width: 60, height: 20, color: '#000', type: 'platform', dynamic: { origin: { x: 400, y: 300 }, radius: 250, speed: 0.03 } },
      { id: 'final_statue', pos: { x: 380, y: 280 }, vel: { x: 0, y: 0 }, width: 40, height: 40, color: '#000', type: 'platform' },
    ]
  }
];
