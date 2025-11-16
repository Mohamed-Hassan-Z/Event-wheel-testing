import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------
    MAIN SLOT MACHINE COMPONENT
------------------------------------------------------------- */
// Page-only Google Font import
const quicksandFont = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
`;

const SlotMachine = () => {
  const fileNames = [
    "reward-1-Clash_King.png",
    "reward-2-Crash.png",
    "reward-3-Kurapika.png",
    "reward-4-Minecraft.png",
    "reward-5-Superman.png",
    "reward-6-The_Witcher.png",
    "reward-7-Kratos.png",
    "reward-8-Squid_Game.png",
    "reward-9-Hisoka.png",
    "reward-10-Luffy.png",
    "reward-11-Among_Us.png",
    "reward-12-Batman.png",
    "reward-13-Luigi.png",
    "reward-14-Killua.png",
    "reward-15-Naruto.png",
  ];
  
  const [options] = useState(() =>
    fileNames.map((file) => {
      const idMatch = file.match(/reward-(\d+)-/);
      const nameMatch = file.match(/reward-\d+-(.+)\.png$/);
  
      const id = idMatch ? parseInt(idMatch[1], 10) : 0;
  
      const name = nameMatch
        ? nameMatch[1].replace(/_/g, " ")
        : "Unknown Prize";
  
      return {
        id,
        image: `/wheel-icons/${file}`,
        name,
      };
    })
  );

  const [optionCounts, setOptionCounts] = useState(
    Object.fromEntries(options.map((opt) => [opt.id, 0]))
  );

  const [currentCycle, setCurrentCycle] = useState<number[]>([]);
  const [usedInCycle, setUsedInCycle] = useState<number[]>([]);

  const [reels, setReels] = useState([
    { value: 1, spinning: false },
    { value: 1, spinning: false },
    { value: 1, spinning: false },
  ]);

  const [leverPulled, setLeverPulled] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winningPrize, setWinningPrize] = useState<number | null>(null);

  const [showTracker, setShowTracker] = useState(false);

  /* ------------------------------------------------------------
      UTILITIES
  ------------------------------------------------------------- */
  const shuffleArray = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const getOptionImage = (id: number) => {
    const opt = options.find((o) => o.id === id);
    return opt ? opt.image : "missing.png";
  };

  /* ------------------------------------------------------------
      CYCLE LOGIC
  ------------------------------------------------------------- */
  const getNextOption = () => {
    if (usedInCycle.length === currentCycle.length) {
      const available = options
        .filter((o) => optionCounts[o.id] < 50)
        .map((o) => o.id);

      if (available.length === 0) return null;

      const newCycle = shuffleArray([...available]);
      setCurrentCycle(newCycle);
      setUsedInCycle([newCycle[0]]);
      return newCycle[0];
    }

    const nextOption = currentCycle[usedInCycle.length];
    setUsedInCycle([...usedInCycle, nextOption]);
    return nextOption;
  };

  useEffect(() => {
    if (currentCycle.length === 0) {
      const available = options
        .filter((o) => optionCounts[o.id] < 50)
        .map((o) => o.id);

      setCurrentCycle(shuffleArray([...available]));
    }
  },[currentCycle,optionCounts,options]);

  /* ------------------------------------------------------------
      HANDLE LEVER → SPIN
  ------------------------------------------------------------- */
  const pullLever = () => {
    if (isSpinning) return;

    const nextOption = getNextOption();
    if (nextOption === null) {
      alert("Out of prizes! Try again soon.");
      return;
    }

    setLeverPulled(true);
    setIsSpinning(true);
    setCelebration(false);

    setTimeout(() => setLeverPulled(false), 500);

    setReels(reels.map((r) => ({ ...r, spinning: true })));

    const delays = [800, 1400, 2000];

    delays.forEach((delay, idx) => {
      setTimeout(() => {
        setReels((prev) => {
          const newReels = [...prev];
          newReels[idx] = { value: nextOption, spinning: false };
          return newReels;
        });

        if (idx === 2) {
          setTimeout(() => {
            setIsSpinning(false);
            setCelebration(true);
            setWinningPrize(nextOption);
            setShowWinPopup(true);

            setOptionCounts((prev) => ({
              ...prev,
              [nextOption]: prev[nextOption] + 1,
            }));

            setTimeout(() => {
              setShowWinPopup(false);
              setCelebration(false);
            }, 5000);
          }, 200);
        }
      }, delay);
    });
  };

  /* ------------------------------------------------------------
      SPINNING REEL COMPONENT
  ------------------------------------------------------------- */
  const SpinningReel = ({ reel }: { reel: any }) => {
    // Use responsive sizes: width = 16vw capped to min 96px max 160px, height proportional
    return (
      <div
        className="relative bg-[#F2E4D6] rounded-2xl overflow-hidden
            border-4 border-white shadow-2xl
            w-[16vw] min-w-[46px] max-w-[160px]
            aspect-[3/4] /* 3:4 ratio */
            sm:w-[12vw] sm:min-w-[112px] sm:max-w-[180px]
            md:w-[10vw] md:min-w-[128px] md:max-w-[192px]
            lg:w-[8vw] lg:min-w-[160px] lg:max-w-[224px]
          "
      >
        <div
          className={`absolute w-full ${
            reel.spinning ? "animate-spinReel" : ""
          }`}
        >
          {reel.spinning ? (
            [...options, ...options].map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center aspect-[3/4]"
              >
                <img
                  src={getOptionImage(opt.id)}
                  className="w-full h-full object-contain"
                  alt=""
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center aspect-[3/4]">
              <img
                src={getOptionImage(reel.value)}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------
      MAIN RENDER
  ------------------------------------------------------------- */
  return (
<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F2E4D6]"
style={{ fontFamily: "'Quicksand', sans-serif" }}>

      <style>{`
       ${quicksandFont}
        @keyframes spinReel {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2000px); }
        }
        .animate-spinReel {
          animation: spinReel 0.12s linear infinite;
        }
      `}</style>

      {/* Background Shapes */}
      <BackgroundShapes />

      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <div
          onClick={() => setShowTracker(!showTracker)}
          className="
            cursor-pointer bg-white/40 backdrop-blur-xl border-2 border-white rounded-xl shadow-xl 
            w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
            flex items-center justify-center hover:scale-105 transition-transform
          "
        >
          <img src="/Horizontal-Logo.png" className="w-full h-full object-contain" alt="" />
        </div>
      </div>

      {/* Main Content */}
      <div
  className="
      relative z-10 flex flex-col gap-8 w-full max-w-6xl px-4 
      mt-[-20px] sm:mt-[-30px] md:mt-[-50px] 
  "
>


        {/* Slot Machine Frame */}
        <div
          className="
            bg-[#F2E4D6] shadow-2xl rounded-3xl 
            p-6 sm:p-8 md:p-10 
            border-2 md:border-4 border-[#5A8A70]
            mt-[-20px] sm:mt-[-30px] md:mt-[-50px]
            flex-col
          "
        >
          {/* Header */}
          <div className="bg-[#5A8A70] p-4 sm:p-6 rounded-2xl border-4 border-white shadow-lg">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-white mb-2">
              🎉 PRIZE WHEEL 🎉
            </h1>
            <div className="text-center text-white font-bold text-lg md:text-xl">Pull the Lever to Win!</div>
          </div>

          {/* Reels */}
          <div
  className="
    flex justify-center gap-3 sm:gap-4 md:gap-6 
    p-4 sm:p-6 md:p-8 
    bg-[#5A8A70] 
    rounded-2xl border-4 border-white shadow-inner
    mt-6 sm:mt-8 md:mt-10
  "
>

            {reels.map((reel, idx) => (
              <SpinningReel key={idx} reel={reel} />
            ))}
          </div>

          {/* Celebration */}
          {celebration}
        </div>

        {/* Tracker */}
        {showTracker && <PrizeTracker options={options} counts={optionCounts} />}
      </div>

      {/* Lever + PULL */}
      {!showTracker && (
      <div
  className="
    absolute 
    flex flex-col items-center z-20

    /* Default: centered bottom for mobile/tablet */
    bottom-10 left-1/2 -translate-x-1/2

    /* Still center bottom, but row layout under 1515px */
    max-[1515px]:flex-row

    /* At 1515px and up: move lever to the right side */
    min-[1515px]:top-1/2 
    min-[1515px]:left-auto 
    min-[1515px]:right-10
    min-[1515px]:-translate-y-1/2 
    min-[1515px]:translate-x-0
  "
>



{/* FIXED HEIGHT WRAPPER (prevents overlap) */}
<div>
  <DraggableLever
    onPull={pullLever}
    isSpinning={isSpinning}
    leverPulled={leverPulled}
  />
</div>

{/* Now visible again */}
<div>
  <PullIndicator />
</div>

</div>)}



      {/* Win Popup */}
      {showWinPopup && winningPrize !== null && (
        <WinPopup 
        image={getOptionImage(winningPrize)} 
        name={options.find(o => o.id === winningPrize)?.name ?? ""}
      />
      
      )}
    </section>
  );
};

/* ------------------------------------------------------------
    PULL INDICATOR
------------------------------------------------------------- */
const PullIndicator = () => (
  <div className="flex flex-col items-center gap-2 mt-6 select-none pointer-events-none">
    <div className="text-[#fb4242] font-bold text-3xl tracking-wide animate-pulse drop-shadow-xl">
      PULL
    </div>

    {["#FFD700", "#FF6FFF", "#00C8FF"].map((color, i) => (
      <svg
        key={i}
        width="40"
        height="40"
        viewBox="0 0 24 24"
        className="animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 4v14" />
        <path d="M5 13l7 7 7-7" />
      </svg>
    ))}
  </div>
);

/* ------------------------------------------------------------
      DRAGGABLE LEVER (fixed dragging)
------------------------------------------------------------- */
function DraggableLever({
  onPull,
  isSpinning,
  leverPulled,
}: {
  onPull: () => void;
  isSpinning: boolean;
  leverPulled: boolean;
}) {
  const leverRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const dragStartY = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const maxPull = 100;

  const getY = (e: PointerEvent) => e.clientY;

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging.current || isSpinning) return;

      const y = getY(e);
      if (dragStartY.current === null) dragStartY.current = y;

      const delta = y - dragStartY.current;
      const pullAmount = Math.max(0, Math.min(maxPull, delta));
      setOffset(pullAmount);
      if (pullAmount >= maxPull && !isSpinning) {
        dragging.current = false;
        dragStartY.current = null;
        onPull();
    }}

    function onPointerUp() {

      dragging.current = false;
      dragStartY.current = null;
      setOffset(0);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [offset, isSpinning, onPull]);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSpinning) return;
    dragging.current = true;
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div
  className="relative noselect pointer-events-auto"
  style={{
    height: 240,
    width: 96,
  }}
>

      {/* Top Cap */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-20 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-t-3xl border-4 border-yellow-300 shadow-xl" />

      {/* Shaft */}
      <div
        ref={leverRef}
        className="absolute left-1/2 -translate-x-1/2 top-16 w-10 h-40 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full border-4 border-gray-500 shadow-inner"
      />

     {/* Red Handle (improved for touch) */}
<div
  onPointerDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }}
  className={`
    pointer-events-auto touch-none
    absolute left-1/2 -translate-x-1/2
    w-12 h-24 sm:w-14 sm:h-32
    rounded-full
    bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-900 shadow-2xl
    ${isSpinning ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
    transition-transform
  `}
  style={{
    top: `${80 + (leverPulled ? 40 : offset)}px`,
    transition: dragging.current ? "none" : "top 0.3s ease-out",
  }}
/>


      {/* Yellow Ball */}
      <div
        className="
          absolute w-16 h-16 rounded-full
          bg-gradient-to-br from-yellow-300 to-orange-400
          border-4 border-yellow-500 shadow-2xl left-1/2 -translate-x-1/2 pointer-events-none
        "
        style={{
          top: `${60 + (leverPulled ? 40 : offset)}px`,
          transition: leverPulled ? "top 0.4s ease-out" : dragging.current ? "none" : "top 0.4s ease-out",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------
      TRACKER
------------------------------------------------------------- */
const PrizeTracker = ({
  options,
  counts,
}: {
  options: any[];
  counts: any;
}) => (
  <div
    className="

      rounded-2xl p-4 sm:p-6
      border-4 border-white shadow-lg text-black text-xs sm:text-sm
    "
  >
    <h3 className="text-center text-xl text-black font-bold mb-3">🌟 Prize Tracker 🌟</h3>

    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
      {options.map((opt) => (
        <div
          key={opt.id}
          className={`
            text-center p-2 sm:p-3 rounded-xl border-2 border-white shadow-md 
            ${counts[opt.id] >= 50 ? "bg-gray-600 opacity-60" : "bg-white/20 backdrop-blur-md"}
          `}
        >
          <img
            src={opt.image}
            className="w-full h-12 sm:h-16 md:h-20 object-contain"
          alt=""/>
          <div className="mt-1 font-bold">{counts[opt.id]}/50</div>
        </div>
      ))}
    </div>
  </div>
);


/* ------------------------------------------------------------
      WIN POPUP
------------------------------------------------------------- */
const WinPopup = ({ image, name }: { image: string; name: string }) => (

  <>
    <div className="fixed inset-0 pointer-events-none  bg-black/50 backdrop-blur-sm  z-40">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-100px",
            backgroundColor: ["#ff6b9d", "#ffd93d", "#6bcf7f", "#ff8c42"][i % 4],
            animation: `confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() *
              0.5}s infinite`,
          }}
        />
      ))}
    </div>

    <div className="fixed inset-0 flex items-center justify-center   z-50 p-4">
      <div className="bg-gradient-to-br from-white via-yellow-50 to-pink-50 p-8 rounded-3xl border-8 border-yellow-400 shadow-2xl max-w-md w-full">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-center mb-4">
          🎉You Win!🎉
        </h2>


        <div className="w-40 h-40 mx-auto my-6 border-4 border-white rounded-2xl overflow-hidden shadow-xl">
          <img src={image} className="w-full h-full object-contain" alt=""/>
          
        </div>
        <div className="text-center text-3xl font-bold mt-4 text-yellow-400 animate-pulse">
  {name+"!"}
</div>
      </div>
      

    </div>

    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(-50px) rotate(0); opacity: 1; }
        100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
      }
    `}</style>
  </>
);

/* ------------------------------------------------------------
      BACKGROUND SHAPES
------------------------------------------------------------- */
const BackgroundShapes = () => (
  <div className="absolute inset-0 pointer-events-auto opacity-60">

    <Circle size="100px" color="#ffd93d" top="15%" left="2%" />
    <Circle size="140px" color="#6bcf7f" top="35%" left="4%" />
    <Circle size="70px" color="#ff8c42" top="65%" left="3%" />


    <Circle size="110px" color="#ffd93d" top="28%" right="1%" />
    <Circle size="90px" color="#6bcf7f" top="45%" right="4%" />
    <Circle size="130px" color="#ff8c42" top="70%" right="2%" />
  </div>
);

/* ------------------------------------------------------------
      SHAPES
------------------------------------------------------------- */
function Circle({
  size,
  color,
  top,
  left,
  right,
}: {
  size: string;
  color: string;
  top?: string;
  left?: string;
  right?: string;
}) {
  return (
    <div
      className="absolute rounded-full animate-float"
      style={{ width: size, height: size, backgroundColor: color, top, left, right }}
    />
  );
}



export default SlotMachine;
