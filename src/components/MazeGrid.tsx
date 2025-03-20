"use client";

import styles from "./MazeGrid.module.css";

const MazeGrid = ({ maze, startPos, endPos, path, visited, onCellClick }) => {
  const getCellClass = (row, col, value) => {
    if (row === startPos.row && col === startPos.col) {
      return styles.start;
    }
    if (row === endPos.row && col === endPos.col) {
      return styles.end;
    }

    // Check if cell is in the final path
    const isInPath = path.some((pos) => pos.row === row && pos.col === col);
    if (isInPath) {
      return styles.path;
    }

    // Check if cell was visited during search
    const isVisited = visited.some((pos) => pos.row === row && pos.col === col);
    if (isVisited) {
      return styles.visited;
    }

    return value === 1 ? styles.wall : styles.empty;
  };

  return (
    <div className={styles.grid}>
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${styles.cell} ${getCellClass(
                rowIndex,
                colIndex,
                cell
              )}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MazeGrid;
