"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  InfoIcon as InfoCircle,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  Zap,
} from "lucide-react"

// Define cell types
type CellType = "empty" | "wall" | "start" | "end" | "path" | "visited" | "visiting"

// Define position type
interface Position {
  row: number
  col: number
}

// Define algorithm types
type Algorithm = "astar" | "bfs" | "dfs"

// Define comparison result
interface ComparisonResult {
  algorithm: Algorithm
  pathLength: number | null
  nodesVisited: number
  executionTime: number
}

// Define speed presets
type SpeedPreset = "slow" | "normal" | "fast" | "veryfast"

export default function MazeSolver() {
  // Grid dimensions
  const [rows, setRows] = useState(15)
  const [cols, setCols] = useState(25)

  // Grid state
  const [grid, setGrid] = useState<CellType[][]>([])

  // Start and end positions
  const [startPos, setStartPos] = useState<Position>({ row: 2, col: 2 })
  const [endPos, setEndPos] = useState<Position>({ row: rows - 3, col: cols - 3 })

  // Algorithm and visualization settings
  const [algorithm, setAlgorithm] = useState<Algorithm>("astar")
  const [speed, setSpeed] = useState(50)
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>("normal")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showVisited, setShowVisited] = useState(true)

  // Edit mode
  const [editMode, setEditMode] = useState<"wall" | "start" | "end" | null>(null)

  // Results
  const [pathFound, setPathFound] = useState<boolean | null>(null)
  const [pathLength, setPathLength] = useState<number | null>(null)
  const [visitedCount, setVisitedCount] = useState(0)
  const [executionTime, setExecutionTime] = useState(0)

  // Comparison results
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([])
  const [showComparison, setShowComparison] = useState(false)

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [rows, cols])

  // Update speed based on preset
  useEffect(() => {
    switch (speedPreset) {
      case "slow":
        setSpeed(25)
        break
      case "normal":
        setSpeed(50)
        break
      case "fast":
        setSpeed(75)
        break
      case "veryfast":
        setSpeed(95)
        break
    }
  }, [speedPreset])

  const initializeGrid = () => {
    const newGrid: CellType[][] = []

    // Adjust start and end positions if they're outside the new grid dimensions
    const newStartPos = {
      row: Math.min(startPos.row, rows - 1),
      col: Math.min(startPos.col, cols - 1),
    }

    const newEndPos = {
      row: Math.min(endPos.row, rows - 1),
      col: Math.min(endPos.col, cols - 1),
    }

    setStartPos(newStartPos)
    setEndPos(newEndPos)

    for (let i = 0; i < rows; i++) {
      const row: CellType[] = []
      for (let j = 0; j < cols; j++) {
        if (i === newStartPos.row && j === newStartPos.col) {
          row.push("start")
        } else if (i === newEndPos.row && j === newEndPos.col) {
          row.push("end")
        } else {
          row.push("empty")
        }
      }
      newGrid.push(row)
    }

    setGrid(newGrid)
    setPathFound(null)
    setPathLength(null)
    setVisitedCount(0)
    setExecutionTime(0)
  }

  // Add a function to handle grid size changes
  const handleGridSizeChange = (type: "rows" | "cols", value: number) => {
    if (isRunning) return

    if (type === "rows") {
      // Limit rows to a reasonable range (5-30)
      const newRows = Math.max(5, Math.min(30, value))
      setRows(newRows)
    } else {
      // Limit columns to a reasonable range (5-40)
      const newCols = Math.max(5, Math.min(40, value))
      setCols(newCols)
    }
  }

  // Reset grid but keep walls
  const resetGrid = () => {
    const newGrid = [...grid].map((row, i) =>
      row.map((cell, j) => {
        if (cell === "path" || cell === "visited" || cell === "visiting") {
          return "empty"
        } else if (i === startPos.row && j === startPos.col) {
          return "start"
        } else if (i === endPos.row && j === endPos.col) {
          return "end"
        }
        return cell
      }),
    )

    setGrid(newGrid)
    setPathFound(null)
    setPathLength(null)
    setVisitedCount(0)
    setExecutionTime(0)
    setIsRunning(false)
    setIsPaused(false)
  }

  // Clear all walls
  const clearWalls = () => {
    const newGrid = [...grid].map((row, i) =>
      row.map((cell, j) => {
        if (cell === "wall") {
          return "empty"
        } else if (i === startPos.row && j === startPos.col) {
          return "start"
        } else if (i === endPos.row && j === endPos.col) {
          return "end"
        }
        return cell
      }),
    )

    setGrid(newGrid)
    setPathFound(null)
    setPathLength(null)
    setVisitedCount(0)
    setExecutionTime(0)
  }

  // Generate random maze
  const generateRandomMaze = () => {
    const newGrid: CellType[][] = []

    for (let i = 0; i < rows; i++) {
      const row: CellType[] = []
      for (let j = 0; j < cols; j++) {
        if (i === startPos.row && j === startPos.col) {
          row.push("start")
        } else if (i === endPos.row && j === endPos.col) {
          row.push("end")
        } else {
          // 30% chance of being a wall
          row.push(Math.random() < 0.3 ? "wall" : "empty")
        }
      }
      newGrid.push(row)
    }

    setGrid(newGrid)
    setPathFound(null)
    setPathLength(null)
    setVisitedCount(0)
    setExecutionTime(0)
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isRunning) return

    const newGrid = [...grid]

    if (editMode === "wall") {
      if (newGrid[row][col] !== "start" && newGrid[row][col] !== "end") {
        newGrid[row][col] = newGrid[row][col] === "wall" ? "empty" : "wall"
      }
    } else if (editMode === "start") {
      // Remove previous start
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newGrid[i][j] === "start") {
            newGrid[i][j] = "empty"
          }
        }
      }

      if (newGrid[row][col] !== "end" && newGrid[row][col] !== "wall") {
        newGrid[row][col] = "start"
        setStartPos({ row, col })
      }
    } else if (editMode === "end") {
      // Remove previous end
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newGrid[i][j] === "end") {
            newGrid[i][j] = "empty"
          }
        }
      }

      if (newGrid[row][col] !== "start" && newGrid[row][col] !== "wall") {
        newGrid[row][col] = "end"
        setEndPos({ row, col })
      }
    }

    setGrid(newGrid)
    setPathFound(null)
    setPathLength(null)
    setVisitedCount(0)
    setExecutionTime(0)
  }

  // Handle mouse drag for drawing walls
  const [isMouseDown, setIsMouseDown] = useState(false)

  const handleMouseDown = (row: number, col: number) => {
    setIsMouseDown(true)
    handleCellClick(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown) {
      handleCellClick(row, col)
    }
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  // A* algorithm
  const astar = async () => {
    const startTime = performance.now()

    // Priority queue for A*
    const openSet: Position[] = [{ ...startPos }]
    const closedSet: boolean[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(false))

    // g score is the distance from start to current node
    const gScore: number[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(Number.POSITIVE_INFINITY))
    gScore[startPos.row][startPos.col] = 0

    // f score is g score + heuristic
    const fScore: number[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(Number.POSITIVE_INFINITY))
    fScore[startPos.row][startPos.col] = heuristic(startPos, endPos)

    // For reconstructing the path
    const cameFrom: Record<string, Position> = {}

    let visitedNodes = 0
    const batchSize = speedPreset === "veryfast" ? 10 : 1
    let batchCount = 0
    let nodesToUpdate: Position[] = []

    while (openSet.length > 0) {
      if (isPaused) {
        // Wait until unpaused using a more reliable approach
        await new Promise<void>((resolve) => {
          const checkPause = () => {
            if (!isPaused) {
              resolve()
            } else {
              setTimeout(checkPause, 50)
            }
          }
          checkPause()
        })
      }

      // Find node with lowest f score
      let lowestIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (fScore[openSet[i].row][openSet[i].col] < fScore[openSet[lowestIndex].row][openSet[lowestIndex].col]) {
          lowestIndex = i
        }
      }

      const current = openSet[lowestIndex]

      // Check if we reached the end
      if (current.row === endPos.row && current.col === endPos.col) {
        // Reconstruct path
        const path: Position[] = []
        let currentPos = `${current.row},${current.col}`

        while (cameFrom[currentPos]) {
          const pos = cameFrom[currentPos]
          path.push(pos)
          currentPos = `${pos.row},${pos.col}`
        }

        // Visualize path
        const newGrid = [...grid]

        // For very fast mode, update all at once
        if (speedPreset === "veryfast") {
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
            }
          }
          setGrid([...newGrid])
        } else {
          // For other speeds, animate the path
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
              setGrid([...newGrid])
              await sleep(speed / 2)
            }
          }
        }

        setPathFound(true)
        setPathLength(path.length)
        setVisitedCount(visitedNodes)
        setExecutionTime(performance.now() - startTime)
        return true
      }

      // Remove current from open set
      openSet.splice(lowestIndex, 1)

      // Add current to closed set
      closedSet[current.row][current.col] = true

      // Mark as visited for visualization
      if (grid[current.row][current.col] !== "start" && grid[current.row][current.col] !== "end") {
        nodesToUpdate.push(current)
        batchCount++

        // Update in batches for very fast mode
        if (batchCount >= batchSize || openSet.length === 0) {
          const newGrid = [...grid]

          for (const node of nodesToUpdate) {
            if (newGrid[node.row][node.col] !== "start" && newGrid[node.row][node.col] !== "end") {
              newGrid[node.row][node.col] = "visiting"

              if (showVisited) {
                // For very fast mode, directly mark as visited
                if (speedPreset === "veryfast") {
                  newGrid[node.row][node.col] = "visited"
                }
              }
            }
          }

          setGrid([...newGrid])

          // For non-very-fast modes, transition from visiting to visited
          if (showVisited && speedPreset !== "veryfast") {
            await sleep(speed)

            const updatedGrid = [...newGrid]
            for (const node of nodesToUpdate) {
              if (updatedGrid[node.row][node.col] === "visiting") {
                updatedGrid[node.row][node.col] = "visited"
              }
            }
            setGrid([...updatedGrid])
          }

          // Reset for next batch
          nodesToUpdate = []
          batchCount = 0

          // Only sleep between batches if not in very fast mode
          if (speedPreset !== "veryfast") {
            await sleep(speed)
          }
        }
      }

      visitedNodes++

      // Check neighbors
      const neighbors = getNeighbors(current)

      for (const neighbor of neighbors) {
        if (closedSet[neighbor.row][neighbor.col]) continue

        // Skip walls
        if (grid[neighbor.row][neighbor.col] === "wall") continue

        const tentativeGScore = gScore[current.row][current.col] + 1

        if (tentativeGScore < gScore[neighbor.row][neighbor.col]) {
          // This path is better
          cameFrom[`${neighbor.row},${neighbor.col}`] = current
          gScore[neighbor.row][neighbor.col] = tentativeGScore
          fScore[neighbor.row][neighbor.col] = gScore[neighbor.row][neighbor.col] + heuristic(neighbor, endPos)

          // Add to open set if not already there
          if (!openSet.some((pos) => pos.row === neighbor.row && pos.col === neighbor.col)) {
            openSet.push(neighbor)
          }
        }
      }
    }

    // No path found
    setPathFound(false)
    setPathLength(null)
    setVisitedCount(visitedNodes)
    setExecutionTime(performance.now() - startTime)
    return false
  }

  // BFS algorithm
  const bfs = async () => {
    const startTime = performance.now()

    const queue: Position[] = [{ ...startPos }]
    const visited: boolean[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(false))
    visited[startPos.row][startPos.col] = true

    // For reconstructing the path
    const cameFrom: Record<string, Position> = {}

    let visitedNodes = 0
    const batchSize = speedPreset === "veryfast" ? 10 : 1
    let batchCount = 0
    let nodesToUpdate: Position[] = []

    while (queue.length > 0) {
      if (isPaused) {
        // Wait until unpaused using a more reliable approach
        await new Promise<void>((resolve) => {
          const checkPause = () => {
            if (!isPaused) {
              resolve()
            } else {
              setTimeout(checkPause, 50)
            }
          }
          checkPause()
        })
      }

      const current = queue.shift()!

      // Check if we reached the end
      if (current.row === endPos.row && current.col === endPos.col) {
        // Reconstruct path
        const path: Position[] = []
        let currentPos = `${current.row},${current.col}`

        while (cameFrom[currentPos]) {
          const pos = cameFrom[currentPos]
          path.push(pos)
          currentPos = `${pos.row},${pos.col}`
        }

        // Visualize path
        const newGrid = [...grid]

        // For very fast mode, update all at once
        if (speedPreset === "veryfast") {
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
            }
          }
          setGrid([...newGrid])
        } else {
          // For other speeds, animate the path
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
              setGrid([...newGrid])
              await sleep(speed / 2)
            }
          }
        }

        setPathFound(true)
        setPathLength(path.length)
        setVisitedCount(visitedNodes)
        setExecutionTime(performance.now() - startTime)
        return true
      }

      // Mark as visited for visualization
      if (grid[current.row][current.col] !== "start" && grid[current.row][current.col] !== "end") {
        nodesToUpdate.push(current)
        batchCount++

        // Update in batches for very fast mode
        if (batchCount >= batchSize || queue.length === 0) {
          const newGrid = [...grid]

          for (const node of nodesToUpdate) {
            if (newGrid[node.row][node.col] !== "start" && newGrid[node.row][node.col] !== "end") {
              newGrid[node.row][node.col] = "visiting"

              if (showVisited) {
                // For very fast mode, directly mark as visited
                if (speedPreset === "veryfast") {
                  newGrid[node.row][node.col] = "visited"
                }
              }
            }
          }

          setGrid([...newGrid])

          // For non-very-fast modes, transition from visiting to visited
          if (showVisited && speedPreset !== "veryfast") {
            await sleep(speed)

            const updatedGrid = [...newGrid]
            for (const node of nodesToUpdate) {
              if (updatedGrid[node.row][node.col] === "visiting") {
                updatedGrid[node.row][node.col] = "visited"
              }
            }
            setGrid([...updatedGrid])
          }

          // Reset for next batch
          nodesToUpdate = []
          batchCount = 0

          // Only sleep between batches if not in very fast mode
          if (speedPreset !== "veryfast") {
            await sleep(speed)
          }
        }
      }

      visitedNodes++

      // Check neighbors
      const neighbors = getNeighbors(current)

      for (const neighbor of neighbors) {
        if (visited[neighbor.row][neighbor.col]) continue

        // Skip walls
        if (grid[neighbor.row][neighbor.col] === "wall") continue

        visited[neighbor.row][neighbor.col] = true
        cameFrom[`${neighbor.row},${neighbor.col}`] = current
        queue.push(neighbor)
      }
    }

    // No path found
    setPathFound(false)
    setPathLength(null)
    setVisitedCount(visitedNodes)
    setExecutionTime(performance.now() - startTime)
    return false
  }

  // DFS algorithm
  const dfs = async () => {
    const startTime = performance.now()

    const stack: Position[] = [{ ...startPos }]
    const visited: boolean[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(false))

    // For reconstructing the path
    const cameFrom: Record<string, Position> = {}

    let visitedNodes = 0
    const batchSize = speedPreset === "veryfast" ? 10 : 1
    let batchCount = 0
    let nodesToUpdate: Position[] = []

    while (stack.length > 0) {
      if (isPaused) {
        // Wait until unpaused using a more reliable approach
        await new Promise<void>((resolve) => {
          const checkPause = () => {
            if (!isPaused) {
              resolve()
            } else {
              setTimeout(checkPause, 50)
            }
          }
          checkPause()
        })
      }

      const current = stack.pop()!

      // Skip if already visited
      if (visited[current.row][current.col]) continue

      visited[current.row][current.col] = true

      // Check if we reached the end
      if (current.row === endPos.row && current.col === endPos.col) {
        // Reconstruct path
        const path: Position[] = []
        let currentPos = `${current.row},${current.col}`

        while (cameFrom[currentPos]) {
          const pos = cameFrom[currentPos]
          path.push(pos)
          currentPos = `${pos.row},${pos.col}`
        }

        // Visualize path
        const newGrid = [...grid]

        // For very fast mode, update all at once
        if (speedPreset === "veryfast") {
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
            }
          }
          setGrid([...newGrid])
        } else {
          // For other speeds, animate the path
          for (const pos of path) {
            if (newGrid[pos.row][pos.col] !== "start" && newGrid[pos.row][pos.col] !== "end") {
              newGrid[pos.row][pos.col] = "path"
              setGrid([...newGrid])
              await sleep(speed / 2)
            }
          }
        }

        setPathFound(true)
        setPathLength(path.length)
        setVisitedCount(visitedNodes)
        setExecutionTime(performance.now() - startTime)
        return true
      }

      // Mark as visited for visualization
      if (grid[current.row][current.col] !== "start" && grid[current.row][current.col] !== "end") {
        nodesToUpdate.push(current)
        batchCount++

        // Update in batches for very fast mode
        if (batchCount >= batchSize || stack.length === 0) {
          const newGrid = [...grid]

          for (const node of nodesToUpdate) {
            if (newGrid[node.row][node.col] !== "start" && newGrid[node.row][node.col] !== "end") {
              newGrid[node.row][node.col] = "visiting"

              if (showVisited) {
                // For very fast mode, directly mark as visited
                if (speedPreset === "veryfast") {
                  newGrid[node.row][node.col] = "visited"
                }
              }
            }
          }

          setGrid([...newGrid])

          // For non-very-fast modes, transition from visiting to visited
          if (showVisited && speedPreset !== "veryfast") {
            await sleep(speed)

            const updatedGrid = [...newGrid]
            for (const node of nodesToUpdate) {
              if (updatedGrid[node.row][node.col] === "visiting") {
                updatedGrid[node.row][node.col] = "visited"
              }
            }
            setGrid([...updatedGrid])
          }

          // Reset for next batch
          nodesToUpdate = []
          batchCount = 0

          // Only sleep between batches if not in very fast mode
          if (speedPreset !== "veryfast") {
            await sleep(speed)
          }
        }
      }

      visitedNodes++

      // Check neighbors (in reverse order for DFS visualization)
      const neighbors = getNeighbors(current).reverse()

      for (const neighbor of neighbors) {
        if (visited[neighbor.row][neighbor.col]) continue

        // Skip walls
        if (grid[neighbor.row][neighbor.col] === "wall") continue

        cameFrom[`${neighbor.row},${neighbor.col}`] = current
        stack.push(neighbor)
      }
    }

    // No path found
    setPathFound(false)
    setPathLength(null)
    setVisitedCount(visitedNodes)
    setExecutionTime(performance.now() - startTime)
    return false
  }

  // Helper functions
  const getNeighbors = (pos: Position): Position[] => {
    const { row, col } = pos
    const neighbors: Position[] = []

    // Up, Right, Down, Left
    if (row > 0) neighbors.push({ row: row - 1, col })
    if (col < cols - 1) neighbors.push({ row, col: col + 1 })
    if (row < rows - 1) neighbors.push({ row: row + 1, col })
    if (col > 0) neighbors.push({ row, col: col - 1 })

    return neighbors
  }

  const heuristic = (a: Position, b: Position): number => {
    // Manhattan distance
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  const sleep = (ms: number) => {
    // For very fast mode, use minimal delay
    if (speedPreset === "veryfast") {
      return new Promise((resolve) => setTimeout(resolve, 5))
    }
    return new Promise((resolve) => setTimeout(resolve, Math.max(5, 100 - ms)))
  }

  // Run algorithm
  const runAlgorithm = async () => {
    // If we're paused, just resume
    if (isRunning && isPaused) {
      setIsPaused(false)
      return
    }

    // Otherwise, start fresh
    resetGrid()

    // Small delay to ensure the UI updates before starting
    await new Promise((resolve) => setTimeout(resolve, 50))

    setIsRunning(true)
    setIsPaused(false)

    let result = false

    if (algorithm === "astar") {
      result = await astar()
    } else if (algorithm === "bfs") {
      result = await bfs()
    } else if (algorithm === "dfs") {
      result = await dfs()
    }

    setIsRunning(false)
    return result
  }

  // Compare algorithms
  const compareAlgorithms = async () => {
    // Ensure grid is completely reset
    resetGrid()

    // Small delay to ensure the UI updates before starting
    await new Promise((resolve) => setTimeout(resolve, 50))

    setIsRunning(true)
    setIsPaused(false)
    setShowComparison(true)

    const results: ComparisonResult[] = []

    // Run A*
    const astarStartTime = performance.now()
    const astarResult = await astar()
    const astarTime = performance.now() - astarStartTime
    const astarPathLength = pathLength
    const astarVisitedCount = visitedCount

    results.push({
      algorithm: "astar",
      pathLength: astarResult ? astarPathLength : null,
      nodesVisited: astarVisitedCount,
      executionTime: astarTime,
    })

    // Ensure complete reset before next algorithm
    resetGrid()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Run BFS
    const bfsStartTime = performance.now()
    const bfsResult = await bfs()
    const bfsTime = performance.now() - bfsStartTime
    const bfsPathLength = pathLength
    const bfsVisitedCount = visitedCount

    results.push({
      algorithm: "bfs",
      pathLength: bfsResult ? bfsPathLength : null,
      nodesVisited: bfsVisitedCount,
      executionTime: bfsTime,
    })

    // Ensure complete reset before next algorithm
    resetGrid()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Run DFS
    const dfsStartTime = performance.now()
    const dfsResult = await dfs()
    const dfsTime = performance.now() - dfsStartTime
    const dfsPathLength = pathLength
    const dfsVisitedCount = visitedCount

    results.push({
      algorithm: "dfs",
      pathLength: dfsResult ? dfsPathLength : null,
      nodesVisited: dfsVisitedCount,
      executionTime: dfsTime,
    })

    setComparisonResults(results)
    setIsRunning(false)
  }

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Get cell color based on type
  const getCellColor = (type: CellType): string => {
    switch (type) {
      case "empty":
        return "bg-white dark:bg-gray-800"
      case "wall":
        return "bg-gray-800 dark:bg-gray-900"
      case "start":
        return "bg-emerald-500 dark:bg-emerald-600"
      case "end":
        return "bg-rose-500 dark:bg-rose-600"
      case "path":
        return "bg-amber-400 dark:bg-amber-500"
      case "visited":
        return "bg-sky-200 dark:bg-sky-900"
      case "visiting":
        return "bg-sky-400 dark:bg-sky-600"
      default:
        return "bg-white dark:bg-gray-800"
    }
  }

  // Get algorithm name
  const getAlgorithmName = (algo: Algorithm): string => {
    switch (algo) {
      case "astar":
        return "A* Search"
      case "bfs":
        return "Breadth-First Search"
      case "dfs":
        return "Depth-First Search"
      default:
        return ""
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="maze" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="maze">Maze Solver</TabsTrigger>
          <TabsTrigger value="comparison">Algorithm Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="maze" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Controls</CardTitle>
                <CardDescription>Configure the maze and algorithm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select
                    value={algorithm}
                    onValueChange={(value) => setAlgorithm(value as Algorithm)}
                    disabled={isRunning}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="astar">A* Search</SelectItem>
                      <SelectItem value="bfs">Breadth-First Search</SelectItem>
                      <SelectItem value="dfs">Depth-First Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={speedPreset === "slow" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeedPreset("slow")}
                      disabled={isRunning && !isPaused}
                    >
                      Slow
                    </Button>
                    <Button
                      variant={speedPreset === "normal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeedPreset("normal")}
                      disabled={isRunning && !isPaused}
                    >
                      Normal
                    </Button>
                    <Button
                      variant={speedPreset === "fast" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeedPreset("fast")}
                      disabled={isRunning && !isPaused}
                    >
                      Fast
                    </Button>
                    <Button
                      variant={speedPreset === "veryfast" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeedPreset("veryfast")}
                      disabled={isRunning && !isPaused}
                      className="flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" /> Fast
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-visited"
                    checked={showVisited}
                    onCheckedChange={setShowVisited}
                    disabled={isRunning}
                  />
                  <Label htmlFor="show-visited">Show Visited Cells</Label>
                </div>

                <div className="space-y-2">
                  <Label>Edit Mode</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={editMode === "wall" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditMode(editMode === "wall" ? null : "wall")}
                      disabled={isRunning}
                    >
                      Walls
                    </Button>
                    <Button
                      variant={editMode === "start" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditMode(editMode === "start" ? null : "start")}
                      disabled={isRunning}
                    >
                      Start
                    </Button>
                    <Button
                      variant={editMode === "end" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditMode(editMode === "end" ? null : "end")}
                      disabled={isRunning}
                    >
                      End
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Grid Size</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rows">Rows: {rows}</Label>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleGridSizeChange("rows", rows - 1)}
                            disabled={isRunning || rows <= 5}
                          >
                            <MinusCircle className="h-3 w-3" />
                            <span className="sr-only">Decrease rows</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleGridSizeChange("rows", rows + 1)}
                            disabled={isRunning || rows >= 30}
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span className="sr-only">Increase rows</span>
                          </Button>
                        </div>
                      </div>
                      <Slider
                        value={[rows]}
                        min={5}
                        max={30}
                        step={1}
                        onValueChange={(value) => handleGridSizeChange("rows", value[0])}
                        disabled={isRunning}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cols">Columns: {cols}</Label>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleGridSizeChange("cols", cols - 1)}
                            disabled={isRunning || cols <= 5}
                          >
                            <MinusCircle className="h-3 w-3" />
                            <span className="sr-only">Decrease columns</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleGridSizeChange("cols", cols + 1)}
                            disabled={isRunning || cols >= 40}
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span className="sr-only">Increase columns</span>
                          </Button>
                        </div>
                      </div>
                      <Slider
                        value={[cols]}
                        min={5}
                        max={40}
                        step={1}
                        onValueChange={(value) => handleGridSizeChange("cols", value[0])}
                        disabled={isRunning}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button onClick={runAlgorithm} disabled={isRunning && !isPaused} className="w-full">
                    {isRunning && isPaused ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {isRunning ? "Running..." : "Start"}
                      </>
                    )}
                  </Button>

                  {isRunning ? (
                    <Button variant="outline" onClick={togglePause} className="w-full">
                      {isPaused ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={resetGrid} className="w-full" disabled={isRunning}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button variant="outline" onClick={clearWalls} className="w-full" disabled={isRunning}>
                    Clear Walls
                  </Button>
                  <Button variant="outline" onClick={generateRandomMaze} className="w-full" disabled={isRunning}>
                    Random Maze
                  </Button>
                </div>

                <Button variant="outline" onClick={compareAlgorithms} className="w-full" disabled={isRunning}>
                  Compare All Algorithms
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Maze Grid</CardTitle>
                <CardDescription>
                  Click or drag to edit the maze. {editMode && `Currently in ${editMode} edit mode.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="grid gap-0.5 border border-gray-300 dark:border-gray-700 p-1"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(${cols > 30 ? "10px" : cols > 20 ? "14px" : "18px"}, 1fr))`,
                    height: "calc(100% - 2rem)",
                    maxHeight: "60vh",
                  }}
                  onMouseLeave={handleMouseUp}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square ${getCellColor(cell)} border border-gray-200 dark:border-gray-700 transition-colors duration-100 cursor-pointer hover:opacity-80`}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleMouseUp}
                      />
                    )),
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-emerald-500 text-white dark:bg-emerald-600">
                    Start
                  </Badge>
                  <Badge variant="outline" className="bg-rose-500 text-white dark:bg-rose-600">
                    End
                  </Badge>
                  <Badge variant="outline" className="bg-gray-800 text-white dark:bg-gray-900">
                    Wall
                  </Badge>
                  <Badge variant="outline" className="bg-amber-400 text-gray-900 dark:bg-amber-500 dark:text-white">
                    Path
                  </Badge>
                  <Badge variant="outline" className="bg-sky-200 text-gray-900 dark:bg-sky-900 dark:text-white">
                    Visited
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </div>

          {pathFound !== null && (
            <Alert variant={pathFound ? "default" : "destructive"}>
              {pathFound ? (
                <>
                  <InfoCircle className="h-4 w-4" />
                  <AlertTitle>Path Found!</AlertTitle>
                  <AlertDescription>
                    Path length: {pathLength} | Nodes visited: {visitedCount} | Execution time:
                    {executionTime.toFixed(2)}ms
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Path Found</AlertTitle>
                  <AlertDescription>
                    The algorithm explored {visitedCount} nodes but couldn't find a path to the destination.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Comparison</CardTitle>
              <CardDescription>
                Compare the performance of different pathfinding algorithms on the same maze
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                    <div>Algorithm</div>
                    <div>Path Found</div>
                    <div>Nodes Visited</div>
                    <div>Execution Time</div>
                  </div>

                  {comparisonResults.map((result) => (
                    <div key={result.algorithm} className="grid grid-cols-4 gap-4 text-sm border-t pt-2">
                      <div>{getAlgorithmName(result.algorithm)}</div>
                      <div>
                        {result.pathLength !== null ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            Yes ({result.pathLength} steps)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          >
                            No
                          </Badge>
                        )}
                      </div>
                      <div>{result.nodesVisited}</div>
                      <div>{result.executionTime.toFixed(2)}ms</div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-2">Analysis</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>A* Search:</strong> Combines BFS with a heuristic to prioritize paths that seem most
                        promising. Usually finds the shortest path while exploring fewer nodes than BFS.
                      </li>
                      <li>
                        <strong>Breadth-First Search:</strong> Explores all nodes at the present depth before moving to
                        nodes at the next depth. Guarantees the shortest path but may explore more nodes than necessary.
                      </li>
                      <li>
                        <strong>Depth-First Search:</strong> Explores as far as possible along each branch before
                        backtracking. May not find the shortest path but can be faster in some maze configurations.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Run the comparison to see results</p>
                  <Button onClick={compareAlgorithms} className="mt-4" disabled={isRunning}>
                    Run Comparison
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

