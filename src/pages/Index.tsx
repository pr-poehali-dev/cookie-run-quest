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
  emoji?: string;
  image?: string;
  name: string;
  dialogue: string[];
  currentDialogue: number;
  color: string;
  size?: number;
}

interface Chapter {
  id: number;
  title: string;
  background: string;
  backgroundImage?: string;
  npc: NPC;
  playerStartPos: Position;
}

interface GameState {
  playerPos: Position;
  velocity: Position;
  currentNPC: string | null;
  dialogueActive: boolean;
  currentChapter: number;
  zoom: number;
  showTransition: boolean;
  cameraOffset: Position;
}

const Index = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<Position>({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    currentNPC: null,
    dialogueActive: false,
    currentChapter: 0,
    zoom: 1,
    showTransition: false,
    cameraOffset: { x: 0, y: 0 },
  });

  const chapters: Chapter[] = [
    {
      id: 0,
      title: 'Глава 1: Жуткий Отель',
      background: 'linear-gradient(to bottom, #1a0a3e, #2d1b5e, #4a2d7a)',
      backgroundImage: 'https://cdn.poehali.dev/files/cfa15ddf-afb6-4415-b6a8-a2b2d0ffaee4.png',
      playerStartPos: { x: 400, y: 300 },
      npc: {
        id: 'taph',
        x: 900,
        y: 300,
        image: 'https://cdn.poehali.dev/files/0215a9d0-dad0-40a7-b5fd-8e8ff751f922.png',
        name: 'Taph',
        dialogue: [
          '👋🫵🗿🤷',
          '...',
          '*Silent Salt не понимает эмодзи...*',
          '*Taph разочарованно машет рукой*',
        ],
        currentDialogue: 0,
        color: '#FFD700',
        size: 120,
      },
    },
    {
      id: 1,
      title: 'Глава 2: Тёмный Лес',
      background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
      backgroundImage: 'https://cdn.poehali.dev/files/e1fcdd0e-47a4-4e1e-bd60-5a7fc2ec41fc.jpg',
      playerStartPos: { x: 400, y: 300 },
      npc: {
        id: 'jason',
        x: 900,
        y: 300,
        image: 'https://cdn.poehali.dev/files/cb55b7a4-dfa6-4e12-a170-bdb7275bd96a.png',
        name: 'Jason Voorhees',
        dialogue: [
          'ki ki ki ma ma ma...',
          'ki ki ma...',
          '*Silent Salt качает головой*',
          '*Jason разочарованно уходит в лес*',
        ],
        currentDialogue: 0,
        color: '#8B4513',
        size: 140,
      },
    },
    {
      id: 2,
      title: 'Глава 3: Пустота',
      background: 'linear-gradient(to bottom, #000000, #0a0a0a, #1a1a1a)',
      backgroundImage: 'https://cdn.poehali.dev/files/04478063-75ed-4739-870d-2bf98b5be506.jpg',
      playerStartPos: { x: 400, y: 300 },
      npc: {
        id: 'gaster',
        x: 900,
        y: 300,
        image: 'https://cdn.poehali.dev/files/ff435001-b9a8-4dee-89c8-4f2f1a8562e4.png',
        name: 'W.D. Gaster',
        dialogue: [
          '✋︎ ⧫︎♒︎♓︎■︎🙵 ⍓︎□︎◆︎🕯︎❒︎♏︎ ♋︎ ●︎♓︎⧫︎⧫︎●︎♏︎ □︎◆︎⧫︎ □︎♐︎ ⧫︎□︎◆︎♍︎♒︎...',
          '⬥︎♓︎⧫︎♒︎ ❒︎♏︎♋︎●︎♓︎⧫︎⍓︎📪︎ ♌︎◆︎♎︎♎︎⍓︎📬︎',
          '✋︎⬧︎ ♋︎■︎⍓︎□︎■︎♏︎ ♋︎♍︎⧫︎◆︎♋︎●︎●︎⍓︎ ♑︎□︎♓︎■︎♑︎ ⧫︎□︎ ⧫︎❒︎♋︎■︎⬧︎●︎♋︎⧫︎♏︎ ⧫︎♒︎♓︎⬧︎✍︎',
          '*Темнота окружает... Гастер отправляет вас обратно*',
        ],
        currentDialogue: 0,
        color: '#FFFFFF',
        size: 120,
      },
    },
    {
      id: 3,
      title: 'Глава 4: Королевство Печенья',
      background: 'linear-gradient(to bottom, #ffd89b, #19547b)',
      playerStartPos: { x: 400, y: 300 },
      npc: {
        id: 'knox',
        x: 900,
        y: 300,
        image: 'https://cdn.poehali.dev/files/1f5e858f-a7f3-40ac-bdc4-ebc6e1dc752a.jpg',
        name: 'Нокс',
        dialogue: [
          'Наконец-то! Silent Salt, я могу тебя научить!',
          'Я твой верный конь, и я знаю как тебе помочь!',
          'Повторяй за мной: "При-вет!"',
          'П-р-и-в-е-т!',
          '*Silent Salt медленно учится говорить!* 🎉',
          '"Пр... При... Привет!" - Silent Salt наконец заговорил!',
        ],
        currentDialogue: 0,
        color: '#F97316',
        size: 140,
      },
    },
  ];

  const currentChapter = chapters[gameState.currentChapter];
  const [npcState, setNpcState] = useState(currentChapter.npc);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    setNpcState(currentChapter.npc);
    setGameState((prev) => ({
      ...prev,
      playerPos: currentChapter.playerStartPos,
    }));
  }, [gameState.currentChapter]);

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

      if (keysPressed.current.has('ArrowLeft')) newVelX -= 4;
      if (keysPressed.current.has('ArrowRight')) newVelX += 4;
      if (keysPressed.current.has('ArrowUp')) newVelY -= 4;
      if (keysPressed.current.has('ArrowDown')) newVelY += 4;

      if (joystickActive) {
        newVelX += gameState.velocity.x;
        newVelY += gameState.velocity.y;
      }

      const newPlayerPos = {
        x: Math.max(100, Math.min(1400, gameState.playerPos.x + newVelX)),
        y: Math.max(100, Math.min(700, gameState.playerPos.y + newVelY)),
      };

      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      const newCameraOffset = {
        x: screenCenterX - newPlayerPos.x,
        y: screenCenterY - newPlayerPos.y,
      };

      setGameState((prev) => ({
        ...prev,
        playerPos: newPlayerPos,
        cameraOffset: newCameraOffset,
      }));

      if (keysPressed.current.has(' ')) {
        checkNPCInteraction();
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState.dialogueActive, joystickActive, gameState.playerPos]);

  const checkNPCInteraction = () => {
    const distance = Math.sqrt(
      Math.pow(npcState.x - gameState.playerPos.x, 2) +
        Math.pow(npcState.y - gameState.playerPos.y, 2)
    );

    if (distance < 150 && !gameState.dialogueActive) {
      setGameState((prev) => ({
        ...prev,
        currentNPC: npcState.id,
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
        x: (deltaX / magnitude) * normalizedMag * 5,
        y: (deltaY / magnitude) * normalizedMag * 5,
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
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const prevDistance = (e as any).prevDistance || distance;
      const zoomDelta = (distance - prevDistance) * 0.005;

      setGameState((prev) => ({
        ...prev,
        zoom: Math.max(0.7, Math.min(1.5, prev.zoom + zoomDelta)),
      }));

      (e as any).prevDistance = distance;
    }
  };

  const advanceDialogue = () => {
    if (npcState.currentDialogue < npcState.dialogue.length - 1) {
      setNpcState((prev) => ({
        ...prev,
        currentDialogue: prev.currentDialogue + 1,
      }));
    } else {
      if (gameState.currentChapter < chapters.length - 1) {
        setGameState((prev) => ({
          ...prev,
          showTransition: true,
        }));

        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            dialogueActive: false,
            currentNPC: null,
            currentChapter: prev.currentChapter + 1,
            showTransition: false,
          }));
        }, 2000);
      } else {
        setGameState((prev) => ({
          ...prev,
          dialogueActive: false,
          currentNPC: null,
        }));
      }
    }
  };

  const distance = Math.sqrt(
    Math.pow(npcState.x - gameState.playerPos.x, 2) +
      Math.pow(npcState.y - gameState.playerPos.y, 2)
  );
  const isNear = distance < 150;

  return (
    <div className="w-full h-screen overflow-hidden font-[Rubik] relative">
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: currentChapter.background }}
      >
        {currentChapter.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage: `url(${currentChapter.backgroundImage})`,
              transform: `translate(${gameState.cameraOffset.x * 0.3}px, ${gameState.cameraOffset.y * 0.3}px)`,
            }}
          />
        )}
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm border-4 border-purple-400">
          <h1 className="text-xl font-[Montserrat] font-bold text-purple-900">
            {currentChapter.title}
          </h1>
        </Card>
      </div>

      <div
        ref={canvasRef}
        className="relative w-full h-full transition-transform duration-100"
        style={{ transform: `scale(${gameState.zoom})` }}
        onTouchMove={handlePinchZoom}
      >
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{
            transform: `translate(${gameState.cameraOffset.x}px, ${gameState.cameraOffset.y}px)`,
          }}
        >
          <div
            className="absolute w-32 h-32 transition-all duration-100 flex items-center justify-center z-10"
            style={{
              left: `${gameState.playerPos.x}px`,
              top: `${gameState.playerPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="absolute -inset-6 bg-purple-500/30 rounded-full animate-pulse"></div>
              <img
                src="https://cdn.poehali.dev/files/64662605-b010-4a74-bee1-0d251cf9ca9d.png"
                alt="Silent Salt"
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div
            className="absolute transition-all duration-200 z-10"
            style={{
              left: `${npcState.x}px`,
              top: `${npcState.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              {isNear && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce">
                  <Icon name="MessageCircle" className="text-yellow-400" size={32} />
                </div>
              )}
              {npcState.image ? (
                <img
                  src={npcState.image}
                  alt={npcState.name}
                  className="object-contain drop-shadow-2xl transition-transform hover:scale-105"
                  style={{
                    width: `${npcState.size || 120}px`,
                    height: `${npcState.size || 120}px`,
                    filter: `drop-shadow(0 0 30px ${npcState.color})`,
                  }}
                />
              ) : (
                <div
                  className="text-8xl drop-shadow-2xl transition-transform hover:scale-105"
                  style={{ filter: `drop-shadow(0 0 30px ${npcState.color})` }}
                >
                  {npcState.emoji}
                </div>
              )}
              <div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-bold whitespace-nowrap px-3 py-1.5 rounded-full"
                style={{ backgroundColor: npcState.color, color: 'white' }}
              >
                {npcState.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameState.showTransition && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center text-white">
            <h2 className="text-4xl font-[Montserrat] font-bold mb-4">
              {chapters[gameState.currentChapter + 1]?.title}
            </h2>
            <div className="animate-pulse">Загрузка...</div>
          </div>
        </div>
      )}

      {gameState.dialogueActive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end justify-center p-4 animate-in fade-in duration-300">
          <Card
            className="w-full max-w-2xl p-6 border-4 mb-4 animate-in slide-in-from-bottom duration-500"
            style={{ borderColor: npcState.color }}
          >
            <div className="flex items-start gap-4">
              {npcState.image ? (
                <img
                  src={npcState.image}
                  alt={npcState.name}
                  className="w-20 h-20 object-contain flex-shrink-0"
                  style={{ filter: `drop-shadow(0 0 10px ${npcState.color})` }}
                />
              ) : (
                <div
                  className="text-6xl flex-shrink-0"
                  style={{ filter: `drop-shadow(0 0 10px ${npcState.color})` }}
                >
                  {npcState.emoji}
                </div>
              )}
              <div className="flex-1">
                <h3
                  className="text-xl font-[Montserrat] font-bold mb-2"
                  style={{ color: npcState.color }}
                >
                  {npcState.name}
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  {npcState.dialogue[npcState.currentDialogue]}
                </p>
                <Button
                  onClick={advanceDialogue}
                  className="w-full font-[Montserrat] font-semibold text-lg"
                  style={{ backgroundColor: npcState.color }}
                >
                  {npcState.currentDialogue < npcState.dialogue.length - 1
                    ? 'Дальше'
                    : gameState.currentChapter < chapters.length - 1
                    ? 'Следующая глава'
                    : 'Конец'}
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
            {isMobile ? '🕹️ Джойстик + 🤚 Взаимодействие' : '⌨️ Стрелки + Пробел'}
          </p>
        </Card>
      </div>

      <div className="fixed bottom-4 right-4 z-20">
        <Card className="px-3 py-2 bg-white/80 backdrop-blur-sm border-2 border-purple-300">
          <p className="text-xs font-[Montserrat] font-bold text-purple-900">
            Глава {gameState.currentChapter + 1}/{chapters.length}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
