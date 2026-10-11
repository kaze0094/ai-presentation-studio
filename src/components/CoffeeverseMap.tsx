import { useState } from 'react';

export const COFFEEVERSE_WORLDS = [
  { id: 'village', name: 'Coffee Village', firstSlide: 0, lastSlide: 2, icon: '☕', x: 15, y: 40 },
  { id: 'academy', name: 'Theory Academy', firstSlide: 3, lastSlide: 6, icon: '📖', x: 35, y: 67 },
  { id: 'farm', name: 'Highlands Farm', firstSlide: 7, lastSlide: 9, icon: '🌿', x: 55, y: 32 },
  { id: 'harbor', name: 'Export Harbor', firstSlide: 10, lastSlide: 13, icon: '⚓', x: 73, y: 63 },
  { id: 'final', name: 'Final Brew Hall', firstSlide: 14, lastSlide: 16, icon: '🏆', x: 89, y: 37 },
] as const;

export type CoffeeverseWorldId = typeof COFFEEVERSE_WORLDS[number]['id'];

export function CoffeeverseMap({ onEnter }: { onEnter: (slideIndex: number) => void }) {
  const [focused, setFocused] = useState<CoffeeverseWorldId | null>(null);
  return (
    <nav aria-label="Coffeeverse world map" style={{
      position: 'relative', minHeight: 620, overflow: 'hidden', color: '#49332e',
      background: 'radial-gradient(ellipse at 70% 20%, #91a47a, transparent 55%), linear-gradient(135deg, #c8aa7e, #688060)',
      border: '12px solid #49332e', borderRadius: 16,
    }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 38 }}>
        COFFEEVERSE · WORLD MAP
      </h2>
      <p style={{ textAlign: 'center' }}>Choose a destination to explore the economics of coffee.</p>
      {COFFEEVERSE_WORLDS.map(world => (
        <button key={world.id} type="button"
          onMouseEnter={() => setFocused(world.id)}
          onFocus={() => setFocused(world.id)}
          onClick={() => onEnter(world.firstSlide)}
          style={{
            position: 'absolute', left: world.x + '%', top: world.y + '%',
            transform: 'translate(-50%, -50%)', width: 155, minHeight: 110,
            padding: 12, border: focused === world.id ? '5px solid #465332' : '4px solid #49332e',
            background: '#f2e8d5', color: '#49332e', borderRadius: 10,
            boxShadow: '8px 9px 0 #302a2055', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
          }}>
          <span aria-hidden="true" style={{ display: 'block', fontSize: 30 }}>{world.icon}</span>
          {world.name}
          <small style={{ display: 'block', marginTop: 5 }}>Slides {world.firstSlide + 1}–{world.lastSlide + 1}</small>
        </button>
      ))}
    </nav>
  );
}
