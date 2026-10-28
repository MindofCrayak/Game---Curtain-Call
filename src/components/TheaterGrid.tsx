import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StageTile, HeatmapMode, FlubMarker, RoomType } from '../types/theater';
import { FIXTURES_CATALOG } from '../data/fixtures';
import { GRID_WIDTH, GRID_HEIGHT } from '../data/initialGrid';
import { sound } from '../utils/audio';

interface CharacterSprite {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  hairColor: string;
  state: 'idle' | 'walking' | 'working' | 'flubbing' | 'resting';
  bubbleText?: string;
  bubbleTimer?: number;
}

interface FloatingPoint {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 1.0 down to 0
}

interface TheaterGridProps {
  tiles: StageTile[];
  heatmapMode: HeatmapMode;
  phase: string;
  flubs: FlubMarker[];
  onClearFlub: (flubId: string) => void;
  selectedTile: StageTile | null;
  onSelectTile: (tile: StageTile) => void;
  buildFixtureId: string | null;
  onPlaceFixture: (tile: StageTile, fixtureId: string) => void;
  isGhostLightLit: boolean;
  onToggleGhostLight: () => void;
  audienceOccupancy: number; // 0 to 1
}

export const TheaterGrid: React.FC<TheaterGridProps> = ({
  tiles,
  heatmapMode,
  phase,
  flubs,
  onClearFlub,
  selectedTile,
  onSelectTile,
  buildFixtureId,
  onPlaceFixture,
  isGhostLightLit,
  onToggleGhostLight,
  audienceOccupancy
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Zoom and pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating score points & animated characters
  const charactersRef = useRef<CharacterSprite[]>([
    { id: 'c_director', name: 'Julian (Dir)', role: 'DIRECTOR', x: 2, y: 7, targetX: 2, targetY: 7, color: '#f59e0b', hairColor: '#451a03', state: 'working', bubbleText: 'Project!' },
    { id: 'c_carpenter', name: 'Gus (Shop)', role: 'SHOP_STEWARD', x: 2, y: 2, targetX: 2, targetY: 2, color: '#f97316', hairColor: '#1c1917', state: 'working', bubbleText: 'Measure twice!' },
    { id: 'c_costume', name: 'Evelyn (Costume)', role: 'COSTUME_MASTER', x: 13, y: 2, targetX: 13, targetY: 2, color: '#ec4899', hairColor: '#78350f', state: 'working', bubbleText: 'Hemming...' },
    { id: 'c_lights', name: 'Milo (Lights)', role: 'LIGHTING_DIRECTOR', x: 10, y: 1, targetX: 10, targetY: 1, color: '#eab308', hairColor: '#52525b', state: 'working' },
    { id: 'c_stage_mgr', name: 'Clara (SM)', role: 'STAGE_MANAGER', x: 5, y: 3, targetX: 5, targetY: 3, color: '#10b981', hairColor: '#262626', state: 'working', bubbleText: 'Cue 14 standing by' },
    // Lead actor & supporting
    { id: 'c_actor_1', name: 'Brendan', role: 'ACTOR', x: 7, y: 3, targetX: 7, targetY: 3, color: '#38bdf8', hairColor: '#78350f', state: 'working' },
    { id: 'c_actor_2', name: 'Hannah', role: 'ACTOR', x: 8, y: 3, targetX: 8, targetY: 3, color: '#a855f7', hairColor: '#171717', state: 'working' },
  ]);

  const floatingPointsRef = useRef<FloatingPoint[]>([]);

  // Isometric constants
  const tileWidth = 64;
  const tileHeight = 32;

  // Convert grid tile (x, y) to screen coordinate relative to canvas center
  const toScreen = useCallback((gx: number, gy: number, cx: number, cy: number) => {
    const sx = (gx - gy) * (tileWidth / 2) * zoom + cx + pan.x;
    const sy = (gx + gy) * (tileHeight / 2) * zoom + cy + pan.y;
    return { x: sx, y: sy };
  }, [zoom, pan, tileWidth, tileHeight]);

  // Convert screen coordinate to grid tile (x, y)
  const toGrid = useCallback((screenX: number, screenY: number, cx: number, cy: number) => {
    const adjX = (screenX - cx - pan.x) / zoom;
    const adjY = (screenY - cy - pan.y) / zoom;
    const gx = (adjX / (tileWidth / 2) + adjY / (tileHeight / 2)) / 2;
    const gy = (adjY / (tileHeight / 2) - adjX / (tileWidth / 2)) / 2;
    return { x: Math.floor(gx), y: Math.floor(gy) };
  }, [zoom, pan, tileWidth, tileHeight]);

  // Periodic random character speech or flub animations
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random staff or actor to say something theatrical
      const pool = charactersRef.current;
      const target = pool[Math.floor(Math.random() * pool.length)];
      if (!target) return;

      const quotes = {
        DIRECTOR: ['More energy!', 'Hold the pause!', 'From the top!', 'Feel the subtext!'],
        STAGE_MANAGER: ['Places for Act I!', 'Stand by on cue 22', 'Check stage right wing', 'Props reset!'],
        SHOP_STEWARD: ['Needs more 2x4s', 'Paint is still tacky!', 'Watch the sawdust!'],
        COSTUME_MASTER: ['Quick change ready!', 'Need safety pins!', 'Mind the zipper!'],
        LIGHTING_DIRECTOR: ['Checking dimmer 4', 'Gelling the wash', 'Focusing spotlight'],
        ACTOR: ['What’s my line again?', 'To be or not to be!', 'Line!', 'Is that my cue?']
      };

      const roleQuotes = quotes[target.role as keyof typeof quotes] || quotes.ACTOR;
      target.bubbleText = roleQuotes[Math.floor(Math.random() * roleQuotes.length)];
      target.bubbleTimer = 3.5;

      // Spawn occasional floating performance point
      if (phase === 'PRE_PRODUCTION') {
        sound.playCarpentryTap();
        floatingPointsRef.current.push({
          id: Math.random().toString(),
          x: 2 + Math.random(),
          y: 2 + Math.random(),
          text: '+🪵 Scenic',
          color: '#f59e0b',
          life: 1.0
        });
      } else if (phase === 'REHEARSALS') {
        floatingPointsRef.current.push({
          id: Math.random().toString(),
          x: 7 + Math.random() * 2,
          y: 3 + Math.random(),
          text: '+🎭 Nuance',
          color: '#38bdf8',
          life: 1.0
        });
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [phase]);

  // Main 60fps canvas render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Handle canvas resize
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Center offset
      const cx = width / 2;
      const cy = height / 5;

      // Map tiles into lookup
      const tileMap = new Map<string, StageTile>();
      tiles.forEach((t) => tileMap.set(`${t.x},${t.y}`, t));

      // 1. Draw floor tiles sorted by isometric depth (y + x)
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const tile = tileMap.get(`${x},${y}`);
          if (!tile) continue;

          const { x: sx, y: sy } = toScreen(x, y, cx, cy);
          const w2 = (tileWidth / 2) * zoom;
          const h2 = (tileHeight / 2) * zoom;

          // Determine base room color
          let baseFill = '#1c1917'; // default dark stone
          let strokeColor = 'rgba(255, 255, 255, 0.05)';

          if (tile.roomType === 'MAIN_STAGE') {
            baseFill = '#292524'; // rich dark stage wood
            strokeColor = 'rgba(217, 119, 6, 0.15)';
          } else if (tile.roomType === 'SCENE_SHOP') {
            baseFill = '#27272a'; // shop concrete
            strokeColor = 'rgba(249, 115, 22, 0.15)';
          } else if (tile.roomType === 'WARDROBE_LOFT') {
            baseFill = '#2e1065'; // purple velvet loft
            strokeColor = 'rgba(192, 132, 252, 0.15)';
          } else if (tile.roomType === 'REHEARSAL_STUDIO') {
            baseFill = '#0f172a'; // blue soundproof rehearsal
            strokeColor = 'rgba(56, 189, 248, 0.15)';
          } else if (tile.roomType === 'GREEN_ROOM') {
            baseFill = '#064e3b'; // relaxing green lounge
            strokeColor = 'rgba(52, 211, 153, 0.15)';
          } else if (tile.roomType === 'AUDITORIUM') {
            baseFill = '#3b0764'; // deep burgundy theater carpet
            strokeColor = 'rgba(236, 72, 153, 0.12)';
          } else if (tile.roomType === 'CONCESSIONS') {
            baseFill = '#451a03'; // warm amber concession tile
            strokeColor = 'rgba(245, 158, 11, 0.15)';
          } else if (tile.roomType === 'FOYER') {
            baseFill = '#1e1b4b'; // entrance lobby
            strokeColor = 'rgba(99, 102, 241, 0.15)';
          } else if (tile.roomType === 'QUICK_CHANGE') {
            baseFill = '#4c0519'; // crimson quick-change wing
            strokeColor = 'rgba(244, 63, 94, 0.2)';
          }

          // Heatmap Overrides
          if (heatmapMode === 'THERMAL') {
            // Cold (<65) -> Blue, Ideal (68-72) -> Green, Hot (>78) -> Red
            const t = tile.temp;
            if (t < 66) {
              baseFill = '#1e3a8a';
            } else if (t >= 67 && t <= 73) {
              baseFill = '#065f46';
            } else if (t > 73 && t < 78) {
              baseFill = '#854d0e';
            } else {
              baseFill = '#991b1b';
            }
          } else if (heatmapMode === 'ACOUSTIC') {
            // Noise bleed (<45 -> quiet slate, >50 -> warning orange, >60 -> loud red)
            const db = tile.noiseDb;
            if (db <= 44) {
              baseFill = '#0f172a';
            } else if (db <= 52) {
              baseFill = '#78350f';
            } else {
              baseFill = '#7f1d1d';
            }
          } else if (heatmapMode === 'SANITATION') {
            // Dirt level
            const d = tile.dirt;
            if (d > 0.15) {
              baseFill = '#451a03';
            } else if (d > 0.05) {
              baseFill = '#292524';
            } else {
              baseFill = '#042f2e';
            }
          } else if (heatmapMode === 'AESTHETIC') {
            // Golden glow
            const a = tile.aesthetic;
            if (a > 30) {
              baseFill = '#713f12';
            } else if (a > 15) {
              baseFill = '#3f2c1d';
            } else {
              baseFill = '#1c1917';
            }
          }

          // Selected tile highlight
          const isSelected = selectedTile?.x === x && selectedTile?.y === y;
          if (isSelected) {
            baseFill = '#0284c7';
            strokeColor = '#38bdf8';
          }

          // Draw Diamond Tile
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + w2, sy + h2);
          ctx.lineTo(sx, sy + h2 * 2);
          ctx.lineTo(sx - w2, sy + h2);
          ctx.closePath();

          ctx.fillStyle = baseFill;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = isSelected ? 2 * zoom : 1;
          ctx.stroke();

          // Partition wall drawing
          if (tile.hasPartitionWall) {
            ctx.fillStyle = '#44403c';
            ctx.beginPath();
            ctx.moveTo(sx - w2, sy + h2);
            ctx.lineTo(sx - w2, sy + h2 - 16 * zoom);
            ctx.lineTo(sx, sy - 16 * zoom);
            ctx.lineTo(sx, sy);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#292524';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, sy - 16 * zoom);
            ctx.lineTo(sx + w2, sy + h2 - 16 * zoom);
            ctx.lineTo(sx + w2, sy + h2);
            ctx.closePath();
            ctx.fill();
          }

          // Draw Fixtures
          if (tile.fixtureId) {
            const fixture = FIXTURES_CATALOG.find((f) => f.id === tile.fixtureId);
            if (fixture) {
              // Special: Ghost Light glow!
              if (tile.fixtureId === 'ghost_light') {
                if (isGhostLightLit) {
                  // Warm ambient glow circle
                  const grad = ctx.createRadialGradient(sx, sy + h2, 2 * zoom, sx, sy + h2, 45 * zoom);
                  grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
                  grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.arc(sx, sy + h2, 45 * zoom, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Brass stand & single glowing bulb
                ctx.fillStyle = '#78350f';
                ctx.fillRect(sx - 2 * zoom, sy + h2 - 18 * zoom, 4 * zoom, 18 * zoom);
                ctx.fillStyle = isGhostLightLit ? '#fef08a' : '#71717a';
                ctx.beginPath();
                ctx.arc(sx, sy + h2 - 20 * zoom, 4.5 * zoom, 0, Math.PI * 2);
                ctx.fill();
              } else if (tile.fixtureId === 'seat_folding' || tile.fixtureId === 'seat_velvet') {
                // Chair isometric backrest
                const isVelvet = tile.fixtureId === 'seat_velvet';
                ctx.fillStyle = isVelvet ? '#991b1b' : '#57534e';
                ctx.fillRect(sx - 6 * zoom, sy + h2 - 12 * zoom, 12 * zoom, 10 * zoom);
                ctx.fillStyle = isVelvet ? '#dc2626' : '#78716c';
                ctx.fillRect(sx - 5 * zoom, sy + h2 - 2 * zoom, 10 * zoom, 4 * zoom);

                // Audience patron occupying seat during THE_RUN!
                if (phase === 'THE_RUN' && Math.random() < audienceOccupancy) {
                  ctx.fillStyle = '#fde047';
                  ctx.beginPath();
                  ctx.arc(sx, sy + h2 - 14 * zoom, 3 * zoom, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (tile.fixtureId === 'scenic_cardboard_flat' || tile.fixtureId === 'scenic_timber_proscenium') {
                // Tall painted backdrop flat
                ctx.fillStyle = '#d97706';
                ctx.fillRect(sx - 12 * zoom, sy + h2 - 24 * zoom, 24 * zoom, 22 * zoom);
                ctx.strokeStyle = '#78350f';
                ctx.strokeRect(sx - 12 * zoom, sy + h2 - 24 * zoom, 24 * zoom, 22 * zoom);
              } else if (tile.fixtureId === 'water_cooler') {
                // Blue bottle water cooler
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(sx - 4 * zoom, sy + h2 - 10 * zoom, 8 * zoom, 10 * zoom);
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(sx, sy + h2 - 13 * zoom, 4 * zoom, 0, Math.PI * 2);
                ctx.fill();
              } else if (tile.fixtureId === 'light_clip_on' || tile.fixtureId === 'light_stage_wash') {
                // Spotlight fixture
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(sx, sy + h2 - 16 * zoom, 5 * zoom, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#451a03';
                ctx.fillRect(sx - 1 * zoom, sy + h2 - 11 * zoom, 2 * zoom, 11 * zoom);
              } else {
                // Generic fixture icon
                ctx.font = `${14 * zoom}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(fixture.spriteSymbol, sx, sy + h2 - 4 * zoom);
              }
            }
          }
        }
      }

      // 2. Draw Characters
      charactersRef.current.forEach((char) => {
        const { x: cxPos, y: cyPos } = toScreen(char.x, char.y, cx, cy);
        const yFoot = cyPos + (tileHeight / 2) * zoom;

        // Character shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cxPos, yFoot, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = char.color;
        ctx.fillRect(cxPos - 4 * zoom, yFoot - 16 * zoom, 8 * zoom, 12 * zoom);

        // Head
        ctx.fillStyle = '#fbcfe8'; // peach face
        ctx.beginPath();
        ctx.arc(cxPos, yFoot - 19 * zoom, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = char.hairColor;
        ctx.beginPath();
        ctx.arc(cxPos, yFoot - 21 * zoom, 4 * zoom, Math.PI, Math.PI * 2);
        ctx.fill();

        // Character Name Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = `${9 * zoom}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(char.name, cxPos, yFoot + 9 * zoom);

        // Speech Bubble
        if (char.bubbleText && char.bubbleTimer && char.bubbleTimer > 0) {
          char.bubbleTimer -= dt;
          const text = char.bubbleText;
          ctx.font = `${10 * zoom}px 'Plus Jakarta Sans', sans-serif`;
          const textWidth = ctx.measureText(text).width;
          const bubbleW = textWidth + 12 * zoom;
          const bubbleH = 18 * zoom;
          const bX = cxPos - bubbleW / 2;
          const bY = yFoot - 38 * zoom;

          // Bubble box
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(bX, bY, bubbleW, bubbleH, 4 * zoom);
          ctx.fill();

          // Bubble pointer
          ctx.beginPath();
          ctx.moveTo(cxPos - 3 * zoom, bY + bubbleH);
          ctx.lineTo(cxPos, bY + bubbleH + 4 * zoom);
          ctx.lineTo(cxPos + 3 * zoom, bY + bubbleH);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(text, cxPos, bY + 13 * zoom);
        }
      });

      // 3. Draw Interactive Tech Week Flub Markers (❌)
      if (phase === 'TECH_WEEK' || phase === 'REHEARSALS') {
        flubs.forEach((flub) => {
          const { x: fx, y: fy } = toScreen(flub.tileX, flub.tileY, cx, cy);
          const flubCenterY = fy + (tileHeight / 2) * zoom - 18 * zoom;

          // Bobbing animation
          const bounce = Math.sin(now * 0.006 + flub.tileX) * 4 * zoom;

          // Flub glowing circle
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.arc(fx, flubCenterY + bounce, 12 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();

          // Cross ❌
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${12 * zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('✕', fx, flubCenterY + bounce + 4 * zoom);

          // Subtitle label
          ctx.fillStyle = '#fecaca';
          ctx.font = `${9 * zoom}px sans-serif`;
          ctx.fillText(flub.label, fx, flubCenterY + bounce + 18 * zoom);
        });
      }

      // 4. Draw Floating Points (+🎭, +🪵, +💡)
      floatingPointsRef.current = floatingPointsRef.current.filter((fp) => {
        fp.life -= dt * 0.7;
        fp.y -= dt * 0.8;
        if (fp.life <= 0) return false;

        const { x: px, y: py } = toScreen(fp.x, fp.y, cx, cy);
        ctx.save();
        ctx.globalAlpha = Math.max(0, fp.life);
        ctx.fillStyle = fp.color;
        ctx.font = `bold ${13 * zoom}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(fp.text, px, py);
        ctx.restore();
        return true;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    tiles,
    heatmapMode,
    phase,
    flubs,
    selectedTile,
    zoom,
    pan,
    isGhostLightLit,
    audienceOccupancy,
    toScreen
  ]);

  // Handle Mouse Click on Stage or Flub
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 5;

    // Check if clicked directly on an interactive Flub marker
    if (phase === 'TECH_WEEK' || phase === 'REHEARSALS') {
      for (const flub of flubs) {
        const { x: fx, y: fy } = toScreen(flub.tileX, flub.tileY, cx, cy);
        const flubY = fy + (tileHeight / 2) * zoom - 18 * zoom;
        const dist = Math.hypot(clickX - fx, clickY - flubY);
        if (dist <= 18 * zoom) {
          // Cleared flub!
          sound.playFlubCleared();
          floatingPointsRef.current.push({
            id: Math.random().toString(),
            x: flub.tileX,
            y: flub.tileY,
            text: `+💡 ${flub.acumenReward} Acumen`,
            color: '#fbbf24',
            life: 1.2
          });
          onClearFlub(flub.id);
          return;
        }
      }
    }

    // Otherwise, tile interaction
    const gridPos = toGrid(clickX, clickY, cx, cy);
    if (gridPos.x >= 0 && gridPos.x < GRID_WIDTH && gridPos.y >= 0 && gridPos.y < GRID_HEIGHT) {
      const tile = tiles.find((t) => t.x === gridPos.x && t.y === gridPos.y);
      if (tile) {
        sound.playClick();
        if (buildFixtureId) {
          // Place fixture
          onPlaceFixture(tile, buildFixtureId);
        } else {
          onSelectTile(tile);
        }
      }
    }
  };

  // Dragging / Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-stone-950 overflow-hidden flex flex-col"
    >
      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-auto">
        <div className="bg-stone-900/90 backdrop-blur border border-stone-800 rounded-lg p-1.5 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-stone-800 text-sm font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
            className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-stone-800 text-sm font-bold"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
            className="px-2 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-medium"
            title="Reset View"
          >
            Reset
          </button>
        </div>

        {/* Ghost Light Toggle */}
        <button
          onClick={onToggleGhostLight}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg ${
            isGhostLightLit
              ? 'bg-amber-950/80 border-amber-600/60 text-amber-200'
              : 'bg-stone-900/80 border-stone-700 text-stone-400 hover:text-stone-200'
          }`}
          title="The Ghost Light protects the theater overnight from industrial mishaps and spirits"
        >
          <span>{isGhostLightLit ? '🕯️ Ghost Light: Lit' : '🕯️ Ghost Light: Off'}</span>
        </button>
      </div>

      {/* Tech Week Flub banner alert */}
      {phase === 'TECH_WEEK' && flubs.length > 0 && (
        <div className="absolute top-3 right-4 z-10 bg-red-950/90 border border-red-700/80 rounded-lg px-3 py-1.5 text-xs text-red-200 shadow-xl flex items-center gap-2 animate-pulse pointer-events-auto">
          <span className="font-bold">HELL WEEK:</span>
          <span>{flubs.length} Active Flubs on Stage! Click flub icons (❌) to clear and earn Acumen (💡).</span>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
