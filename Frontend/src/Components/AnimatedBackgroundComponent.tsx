import React, { useEffect, useRef, useState } from "react";

const AnimatedBackgroundComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectWidth = 50;
  const rectHeight = 27;
  const gap = 5;
  const lingerDuration = 1000; // Lingering effect duration in ms
  const [hoveredCells, setHoveredCells] = useState<{ row: number; col: number; time: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const render = () => {
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        const columns = Math.ceil(width / (rectWidth + gap));
        const rows = Math.ceil(height / (rectHeight + gap));

        ctx.clearRect(0, 0, width, height);

        // Draw rectangles
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            const x = col * (rectWidth + gap);
            const y = row * (rectHeight + gap);

            // Check lingering hover effect
            const cell = hoveredCells.find(
              (cell) => cell.row === row && cell.col === col
            );
            if (cell) {
              const elapsed = Date.now() - cell.time;
              if (elapsed < lingerDuration) {
                const fadeFactor = 1 - elapsed / lingerDuration; // Fade out over time
                ctx.fillStyle = `rgba(0, 191, 255, ${fadeFactor})`;
              } else {
                ctx.fillStyle = "#292929";
              }
            } else {
              ctx.fillStyle = "#292929";
            }
            ctx.fillRect(x, y, rectWidth, rectHeight);
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvas?.getBoundingClientRect();
      if (!canvasRect) return

      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      const col = Math.floor(mouseX / (rectWidth + gap));
      const row = Math.floor(mouseY / (rectHeight + gap));

      // Add hovered cell with timestamp and remove duplicates
      setHoveredCells((prev) => [
        ...prev.filter((cell) => !(cell.row === row && cell.col === col)),
        { row, col, time: Date.now() },
      ]);

      // Trigger render immediately
      render();
    };

    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(render, 16); // For lingering effects

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [hoveredCells]);

  return (
    <div className="animated-background__wrapper">
      <canvas ref={canvasRef} className="animated-background__canvas"></canvas>
      <div className="animated-background__blur-layer"></div>
      <style>{`
        .animated-background__wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: -1;
          overflow: hidden;
          background: #1d1d1d;
        }

        .animated-background__canvas {
          width: 100%;
          height: 100%;
        }

        .animated-background__blur-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 40px;
          background: #00bfff;
          filter: blur(60px);
          z-index: -3;
          animation: animated-background__blur-move 6s linear infinite;
        }

        @keyframes animated-background__blur-move {
          0% {
            top: -60px;
          }
          100% {
            top: 120%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackgroundComponent;
