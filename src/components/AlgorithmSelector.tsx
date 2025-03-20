"use client";

const AlgorithmSelector = ({ algorithm, setAlgorithm, isRunning }) => {
  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-2">Select Algorithm:</h3>
      <div className="flex flex-col space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            value="bfs"
            checked={algorithm === "bfs"}
            onChange={() => setAlgorithm("bfs")}
            disabled={isRunning}
            className="mr-2"
          />
          Breadth-First Search (BFS)
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="dfs"
            checked={algorithm === "dfs"}
            onChange={() => setAlgorithm("dfs")}
            disabled={isRunning}
            className="mr-2"
          />
          Depth-First Search (DFS)
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="astar"
            checked={algorithm === "astar"}
            onChange={() => setAlgorithm("astar")}
            disabled={isRunning}
            className="mr-2"
          />
          A* Search
        </label>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        {algorithm === "bfs" && (
          <p>
            BFS explores all nodes at the present depth level before moving on
            to nodes at the next depth level.
          </p>
        )}
        {algorithm === "dfs" && (
          <p>
            DFS explores as far as possible along a branch before backtracking.
            It may not find the shortest path but uses less memory than BFS.
          </p>
        )}
        {algorithm === "astar" && (
          <p>
            A* uses a heuristic to find the shortest path more efficiently than
            BFS by prioritizing paths that seem most promising.
          </p>
        )}
      </div>
    </div>
  );
};

export default AlgorithmSelector;
