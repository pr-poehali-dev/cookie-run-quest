import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Position {
  x: number;
  y: number;
}

interface NPC {
  id: string;
  x: number;
  y: number;
  emoji: string;
  name: string;
  dialogue: string[];
  currentDialogue: number;
  color: string;
}

interface GameState {
  playerPos: Position;
  velocity: Position;
  currentNPC: string | null;
  dialogueActive: boolean;
  gamePhase: number;
  zoom: number;
}

const Index = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<Position>({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 100, y: 300 },
    velocity: { x: 0, y: 0 },
    currentNPC: null,
    dialogueActive: false,
    gamePhase: 0,
    zoom: 1,
  });

  const npcs: NPC[] = [
    {
      id: 'taph',
      x: 400,
      y: 300,
      emoji: '🤖',
      name: 'Taph',
      dialogue: ['👋🫵🗿🤷', '...', '*Silent Salt не понял*'],
      currentDialogue: 0,
      color: '#8B5CF6',
    },
    {
      id: 'jason',
      x: 700,
      y: 280,
      emoji: '🔪',
      name: 'Jason Voorhees',
      dialogue: ['ki ki ki ma ma ma...', 'ki ki ma...', '*Silent Salt снова не понял*'],
      currentDialogue: 0,
      color: '#4A5568',
    },
    {
      id: 'gaster',
      x: 500,
      y: 500,
      emoji: '👤',
      name: 'W.D. Gaster',
      dialogue: [
        '✋︎ ⧫︎♒︎♓︎■︎🙵 ⍓︎□︎◆︎🕯︎❒︎♏︎ ♋︎ ●︎♓︎⧫︎⧫︎●︎♏︎ □︎◆︎⧫︎ □︎♐︎ ⧫︎□︎◆︎♍︎♒︎...',
        '⬥︎♓︎⧫︎♒︎ ❒︎♏︎♋︎●︎♓︎⧫︎⍓︎📪︎ ♌︎◆︎♎︎♎︎⍓︎📬︎',
        '*Темнота окружает...*',
      ],
      currentDialogue: 0,
      color: '#2D1B3D',
    },
    {
      id: 'knox',
      x: 200,
      y: 200,
      emoji: '🐴',
      name: 'Нокс',
      dialogue: [
        'Наконец-то! Silent Salt, я могу тебя научить!',
        'Повторяй за мной: "Привет!"',
        '*Silent Salt учится говорить!* 🎉',
      ],
      currentDialogue: 0,
      color: '#F97316',
    },
  ];

  const [npcStates, setNpcStates] = useState(npcs);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.add(e.key);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState.dialogueActive) return;

      let newVelX = 0;
      let newVelY = 0;

      if (keysPressed.current.has('ArrowLeft')) newVelX -= 3;
      if (keysPressed.current.has('ArrowRight')) newVelX += 3;
      if (keysPressed.current.has('ArrowUp')) newVelY -= 3;
      if (keysPressed.current.has('ArrowDown')) newVelY += 3;

      if (joystickActive) {
        newVelX += gameState.velocity.x;
        newVelY += gameState.velocity.y;
      }

      setGameState((prev) => ({
        ...prev,
        playerPos: {
          x: Math.max(20, Math.min(980, prev.playerPos.x + newVelX)),
          y: Math.max(20, Math.min(580, prev.playerPos.y + newVelY)),
        },
      }));

      if (keysPressed.current.has(' ')) {
        checkNPCInteraction();
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState.dialogueActive, joystickActive]);

  const checkNPCInteraction = () => {
    const nearbyNPC = npcStates.find((npc) => {
      const distance = Math.sqrt(
        Math.pow(npc.x - gameState.playerPos.x, 2) + Math.pow(npc.y - gameState.playerPos.y, 2)
      );
      return distance < 80;
    });

    if (nearbyNPC && !gameState.dialogueActive) {
      setGameState((prev) => ({
        ...prev,
        currentNPC: nearbyNPC.id,
        dialogueActive: true,
      }));
    }
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickActive) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    const normalizedMag = Math.min(magnitude, maxDistance) / maxDistance;

    setGameState((prev) => ({
      ...prev,
      velocity: {
        x: (deltaX / magnitude) * normalizedMag * 4,
        y: (deltaY / magnitude) * normalizedMag * 4,
      },
    }));
  };

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setJoystickActive(true);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setGameState((prev) => ({ ...prev, velocity: { x: 0, y: 0 } }));
  };

  const handlePinchZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const prevDistance = (e as any).prevDistance || distance;
      const zoomDelta = (distance - prevDistance) * 0.01;

      setGameState((prev) => ({
        ...prev,
        zoom: Math.max(0.5, Math.min(2, prev.zoom + zoomDelta)),
      }));

      (e as any).prevDistance = distance;
    }
  };

  const advanceDialogue = () => {
    const currentNPC = npcStates.find((npc) => npc.id === gameState.currentNPC);
    if (!currentNPC) return;

    if (currentNPC.currentDialogue < currentNPC.dialogue.length - 1) {
      setNpcStates((prev) =>
        prev.map((npc) =>
          npc.id === currentNPC.id ? { ...npc, currentDialogue: npc.currentDialogue + 1 } : npc
        )
      );
    } else {
      setGameState((prev) => ({
        ...prev,
        dialogueActive: false,
        currentNPC: null,
        gamePhase: prev.gamePhase + 1,
      }));
    }
  };

  const currentNPC = npcStates.find((npc) => npc.id === gameState.currentNPC);

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-purple-200 via-pink-100 to-blue-100 font-[Rubik]">
      <div className="absolute top-4 left-4 z-20">
        <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm border-4 border-purple-400">
          <h1 className="text-2xl font-[Montserrat] font-bold text-purple-900">
            Silent Salt's Adventure
          </h1>
        </Card>
      </div>

      <div
        ref={canvasRef}
        className="relative w-full h-full transition-transform duration-200"
        style={{ transform: `scale(${gameState.zoom})` }}
        onTouchMove={handlePinchZoom}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-300/30 via-transparent to-purple-300/30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/40 rounded-full blur-3xl"></div>
        </div>

        <div
          className="absolute w-16 h-16 transition-all duration-100 flex items-center justify-center"
          style={{
            left: `${gameState.playerPos.x}px`,
            top: `${gameState.playerPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full animate-pulse"></div>
            <img
              src="https://cdn.poehali.dev/files/64662605-b010-4a74-bee1-0d251cf9ca9d.png"
              alt="Silent Salt"
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {npcStates.map((npc) => {
          const distance = Math.sqrt(
            Math.pow(npc.x - gameState.playerPos.x, 2) + Math.pow(npc.y - gameState.playerPos.y, 2)
          );
          const isNear = distance < 80;

          return (
            <div
              key={npc.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${npc.x}px`,
                top: `${npc.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                {isNear && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <Icon name="MessageCircle" className="text-yellow-500" size={24} />
                  </div>
                )}
                <div
                  className="text-6xl drop-shadow-xl transition-transform hover:scale-110"
                  style={{ filter: `drop-shadow(0 0 20px ${npc.color})` }}
                >
                  {npc.emoji}
                </div>
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-1 rounded-full"
                  style={{ backgroundColor: npc.color, color: 'white' }}
                >
                  {npc.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {gameState.dialogueActive && currentNPC && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl p-6 border-4 mb-4 animate-in slide-in-from-bottom duration-500"
                style={{ borderColor: currentNPC.color }}>
            <div className="flex items-start gap-4">
              <div className="text-5xl" style={{ filter: `drop-shadow(0 0 10px ${currentNPC.color})` }}>
                {currentNPC.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-[Montserrat] font-bold mb-2" style={{ color: currentNPC.color }}>
                  {currentNPC.name}
                </h3>
                <p className="text-lg leading-relaxed mb-4">{currentNPC.dialogue[currentNPC.currentDialogue]}</p>
                <Button
                  onClick={advanceDialogue}
                  className="w-full font-[Montserrat] font-semibold text-lg"
                  style={{ backgroundColor: currentNPC.color }}
                >
                  {currentNPC.currentDialogue < currentNPC.dialogue.length - 1 ? 'Дальше' : 'Закрыть'}
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isMobile && (
        <>
          <div
            className="fixed bottom-24 left-8 z-40"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          >
            <div className="relative w-32 h-32 bg-gray-700/40 rounded-full border-4 border-gray-600/50 backdrop-blur-sm">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-500/60 rounded-full"></div>
            </div>
          </div>

          <Button
            className="fixed bottom-24 right-8 z-40 w-20 h-20 rounded-full text-2xl bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm border-4 border-purple-400"
            onClick={checkNPCInteraction}
          >
            <Icon name="Hand" size={32} />
          </Button>
        </>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <Card className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-purple-300">
          <p className="text-sm font-[Montserrat] text-purple-900">
            {isMobile ? '🕹️ Джойстик + 🤚 Кнопка взаимодействия' : '⌨️ Стрелки + Пробел'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
