// File: utils/mazeAlgorithms.js

// Generate a random maze with walls
export const generateMaze = (rows, cols, wallProbability) => {
  const maze = [];

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Randomly decide if a cell is a wall or a path
      // 0 = path, 1 = wall
      row.push(Math.random() < wallProbability ? 1 : 0);
    }
    maze.push(row);
  }

  return maze;
};

// Delay function for visualization
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if position is valid and not a wall
const isValid = (maze, row, col) => {
  return (
    row >= 0 &&
    col >= 0 &&
    row < maze.length &&
    col < maze[0].length &&
    maze[row][col] !== 1
  );
};

// Get neighbors for a position
const getNeighbors = (maze, row, col) => {
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  const neighbors = [];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValid(maze, newRow, newCol)) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
};

// Manhattan distance heuristic for A*
const manhattanDistance = (pos1, pos2) => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

// Solve the maze using the selected algorithm
export const solveMaze = async (
  maze,
  start,
  end,
  algorithm,
  setVisited,
  setPath,
  speed
) => {
  const rows = maze.length;
  const cols = maze[0].length;

  // Create a visited array
  const visited = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));

  // Track the path
  const parent = {};

  // Update the key for parent map
  const getKey = (row, col) => `${row},${col}`;

  // Initialize visualized cells
  const visualizedCells = [];

  let found = false;

  if (algorithm === "bfs") {
    // Breadth-First Search
    const queue = [{ ...start }];
    visited[start.row][start.col] = true;

    while (queue.length > 0 && !found) {
      const current = queue.shift();
      const { row, col } = current;

      // Add to visualized cells
      if (
        !(row === start.row && col === start.col) &&
        !(row === end.row && col === end.col)
      ) {
        visualizedCells.push({ row, col });
        setVisited([...visualizedCells]);
        await delay(speed);
      }

      // Check if we reached the end
      if (row === end.row && col === end.col) {
        found = true;
        break;
      }

      // Check all four directions
      const neighbors = getNeighbors(maze, row, col);

      for (const { row: newRow, col: newCol } of neighbors) {
        if (!visited[newRow][newCol]) {
          visited[newRow][newCol] = true;
          queue.push({ row: newRow, col: newCol });
          parent[getKey(newRow, newCol)] = { row, col };
        }
      }
    }
  } else if (algorithm === "dfs") {
    // Depth-First Search
    const stack = [{ ...start }];

    while (stack.length > 0 && !found) {
      const current = stack.pop();
      const { row, col } = current;

      // Skip if already visited
      if (visited[row][col]) continue;

      // Mark as visited
      visited[row][col] = true;

      // Add to visualized cells
      if (
        !(row === start.row && col === start.col) &&
        !(row === end.row && col === end.col)
      ) {
        visualizedCells.push({ row, col });
        setVisited([...visualizedCells]);
        await delay(speed);
      }

      // Check if we reached the end
      if (row === end.row && col === end.col) {
        found = true;
        break;
      }

      // Check all four directions
      const neighbors = getNeighbors(maze, row, col);

      for (const { row: newRow, col: newCol } of neighbors) {
        if (!visited[newRow][newCol]) {
          stack.push({ row: newRow, col: newCol });
          parent[getKey(newRow, newCol)] = { row, col };
        }
      }
    }
  } else if (algorithm === "astar") {
    // A* Search
    const openSet = [
      {
        ...start,
        gScore: 0,
        fScore: manhattanDistance(start, end),
      },
    ];

    const gScore = {};
    gScore[getKey(start.row, start.col)] = 0;

    const fScore = {};
    fScore[getKey(start.row, start.col)] = manhattanDistance(start, end);

    const openSetMap = { [getKey(start.row, start.col)]: true };

    while (openSet.length > 0 && !found) {
      // Sort by fScore (lowest first)
      openSet.sort((a, b) => a.fScore - b.fScore);

      const current = openSet.shift();
      const { row, col } = current;

      // Remove from open set map
      delete openSetMap[getKey(row, col)];

      // Add to visualized cells
      if (
        !(row === start.row && col === start.col) &&
        !(row === end.row && col === end.col)
      ) {
        visualizedCells.push({ row, col });
        setVisited([...visualizedCells]);
        await delay(speed);
      }

      // Check if we reached the end
      if (row === end.row && col === end.col) {
        found = true;
        break;
      }

      // Mark as visited
      visited[row][col] = true;

      // Check all four directions
      const neighbors = getNeighbors(maze, row, col);

      for (const { row: newRow, col: newCol } of neighbors) {
        const newKey = getKey(newRow, newCol);
        const tentativeGScore = gScore[getKey(row, col)] + 1;

        if (!gScore[newKey] || tentativeGScore < gScore[newKey]) {
          // This path is better than any previous one
          parent[newKey] = { row, col };
          gScore[newKey] = tentativeGScore;
          fScore[newKey] =
            tentativeGScore +
            manhattanDistance({ row: newRow, col: newCol }, end);

          if (!openSetMap[newKey]) {
            openSet.push({
              row: newRow,
              col: newCol,
              gScore: gScore[newKey],
              fScore: fScore[newKey],
            });
            openSetMap[newKey] = true;
          }
        }
      }
    }
  }

  // Reconstruct path if found
  if (found) {
    const path = [];
    let current = { ...end };

    while (current.row !== start.row || current.col !== start.col) {
      const key = getKey(current.row, current.col);
      current = parent[key];

      if (!(current.row === start.row && current.col === start.col)) {
        path.unshift(current);
      }
    }

    // Visualize the path
    const visualPath = [];
    for (const pos of path) {
      visualPath.push(pos);
      setPath([...visualPath]);
      await delay(speed);
    }

    return { found: true, path };
  }

  return { found: false, path: [] };
};
