/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GameCanvas from './components/GameCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-100 font-sans selection:bg-black selection:text-white">
      <GameCanvas />
    </div>
  );
}
