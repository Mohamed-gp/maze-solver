"use client";

import { useState, useEffect } from "react";
import MazeGrid from "../components/MazeGrid";
import AlgorithmSelector from "../components/AlgorithmSelector";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { generateMaze, solveMaze } from "../utils/mazeAlgorithms";

export default function Home() {
  const [maze, setMaze] = useState<number[][]>([]);
  const [algorithm, setAlgorithm] = useState<string>("bfs");
  const [startPos, setStartPos] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [endPos, setEndPos] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [path, setPath] = useState<number[][]>([]);
  const [visited, setVisited] = useState<number[][]>([]);
  const [speed, setSpeed] = useState<number>(50);
  const [mazeSize, setMazeSize] = useState<{ rows: number; cols: number }>({
    rows: 15,
    cols: 15,
  });

  useEffect(() => {
    initializeMaze();
  }, []);

  const initializeMaze = () => {
    const { rows, cols } = mazeSize;
    const newMaze = generateMaze(rows, cols, 0.3); // 30% of cells are walls
    setMaze(newMaze);
    setStartPos({ row: 0, col: 0 });
    setEndPos({ row: rows - 1, col: cols - 1 });
  };

  const solveMazeWithAnimation = async () => {
    setIsRunning(true);
    setPath([]);
    setVisited([]);

    const result = await solveMaze(
      maze,
      startPos,
      endPos,
      algorithm,
      setVisited,
      setPath,
      speed
    );

    setIsRunning(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isRunning) return;

    if (isSelecting === "start") {
      // Set new start position
      if (maze[row][col] !== 1 && !(row === endPos.row && col === endPos.col)) {
        setStartPos({ row, col });
        setIsSelecting(null);
      }
    } else if (isSelecting === "end") {
      // Set new end position
      if (
        maze[row][col] !== 1 &&
        !(row === startPos.row && col === startPos.col)
      ) {
        setEndPos({ row, col });
        setIsSelecting(null);
      }
    } else {
      // Toggle wall if not start or end position
      if (
        !(
          (row === startPos.row && col === startPos.col) ||
          (row === endPos.row && col === endPos.col)
        )
      ) {
        const newMaze = [...maze];
        newMaze[row][col] = newMaze[row][col] === 1 ? 0 : 1;
        setMaze(newMaze);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Header />
      <main>
        <h1 className="text-4xl font-bold text-center my-4">
          Maze Solver Visualizer
        </h1>
        <AlgorithmSelector
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          isRunning={isRunning}
        />
        <div className="flex justify-between items-center my-4">
          <button
            onClick={() => setIsSelecting("start")}
            disabled={isRunning}
            className={`btn ${isSelecting === "start" ? "btn-active" : ""}`}
          >
            Set Start Point
          </button>
          <button
            onClick={() => setIsSelecting("end")}
            disabled={isRunning}
            className={`btn ${isSelecting === "end" ? "btn-active" : ""}`}
          >
            Set End Point
          </button>
          <button onClick={initializeMaze} disabled={isRunning} className="btn">
            Reset Maze
          </button>
          <button
            onClick={solveMazeWithAnimation}
            disabled={isRunning}
            className="btn"
          >
            {isRunning ? "Solving..." : "Solve Maze"}
          </button>
        </div>
        <div className="my-4">
          <label className="block mb-2">Animation Speed:</label>
          <input
            type="range"
            min="10"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full"
          />
        </div>
        <div className="my-4 w-fit mx-auto">
          <MazeGrid
            maze={maze}
            startPos={startPos}
            endPos={endPos}
            path={path}
            visited={visited}
            onCellClick={handleCellClick}
          />
        </div>
        <div className="flex justify-center space-x-4 my-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500"></div> <span>Start</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500"></div> <span>End</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500"></div> <span>Wall</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500"></div> <span>Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500"></div> <span>Visited</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
