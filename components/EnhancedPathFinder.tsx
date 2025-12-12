import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PathNode {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
}

interface PathLink {
  source: string | PathNode;
  target: string | PathNode;
  type: string;
  weight?: number;
}

interface Path {
  nodes: PathNode[];
  links: PathLink[];
  totalWeight: number;
  hops: number;
}

interface EnhancedPathFinderProps {
  nodes: PathNode[];
  links: PathLink[];
  onPathFound?: (path: Path) => void;
  onPathHighlight?: (path: Path | null) => void;
}

export const EnhancedPathFinder: React.FC<EnhancedPathFinderProps> = ({
  nodes,
  links,
  onPathFound,
  onPathHighlight
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [sourceNode, setSourceNode] = useState<string>('');
  const [targetNode, setTargetNode] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'bfs' | 'dfs'>('dijkstra');
  const [maxHops, setMaxHops] = useState<number>(10);
  const [foundPaths, setFoundPaths] = useState<Path[]>([]);
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Build adjacency list for pathfinding
  const buildGraph = () => {
    const graph = new Map<string, Array<{nodeId: string, weight: number, linkType: string}>>();
    
    nodes.forEach(node => {
      graph.set(node.id, []);
    });

    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const weight = link.weight || 1;

      graph.get(sourceId)?.push({ nodeId: targetId, weight, linkType: link.type });
      graph.get(targetId)?.push({ nodeId: sourceId, weight, linkType: link.type });
    });

    return graph;
  };

  // Dijkstra's algorithm implementation
  const dijkstra = (start: string, end: string, graph: Map<string, Array<{nodeId: string, weight: number, linkType: string}>>) => {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Initialize distances
    nodes.forEach(node => {
      distances.set(node.id, node.id === start ? 0 : Infinity);
      previous.set(node.id, null);
      unvisited.add(node.id);
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = '';
      let minDistance = Infinity;
      unvisited.forEach(nodeId => {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          current = nodeId;
        }
      });

      if (current === '' || minDistance === Infinity) break;
      if (current === end) break;

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = graph.get(current) || [];
      neighbors.forEach(neighbor => {
        if (unvisited.has(neighbor.nodeId)) {
          const newDistance = (distances.get(current) || 0) + neighbor.weight;
          if (newDistance < (distances.get(neighbor.nodeId) || Infinity)) {
            distances.set(neighbor.nodeId, newDistance);
            previous.set(neighbor.nodeId, current);
          }
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    return path.length > 1 && path[0] === start ? path : [];
  };

  // BFS implementation
  const bfs = (start: string, end: string, graph: Map<string, Array<{nodeId: string, weight: number, linkType: string}>>) => {
    const queue = [start];
    const visited = new Set([start]);
    const previous = new Map<string, string | null>();
    previous.set(start, null);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === end) {
        // Reconstruct path
        const path: string[] = [];
        let node = end;
        while (node !== null) {
          path.unshift(node);
          node = previous.get(node) || null;
        }
        return path;
      }

      const neighbors = graph.get(current) || [];
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor.nodeId)) {
          visited.add(neighbor.nodeId);
          previous.set(neighbor.nodeId, current);
          queue.push(neighbor.nodeId);
        }
      });
    }

    return [];
  };

  // DFS implementation
  const dfs = (start: string, end: string, graph: Map<string, Array<{nodeId: string, weight: number, linkType: string}>>, maxDepth: number = 10) => {
    const visited = new Set<string>();
    const path: string[] = [];

    const dfsRecursive = (current: string, target: string, currentPath: string[], depth: number): boolean => {
      if (depth > maxDepth) return false;
      if (current === target) {
        path.push(...currentPath, current);
        return true;
      }

      visited.add(current);
      const neighbors = graph.get(current) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.nodeId)) {
          if (dfsRecursive(neighbor.nodeId, target, [...currentPath, current], depth + 1)) {
            return true;
          }
        }
      }

      visited.delete(current);
      return false;
    };

    dfsRecursive(start, end, [], 0);
    return path;
  };

  // Find all paths between two nodes
  const findPaths = async () => {
    if (!sourceNode || !targetNode || sourceNode === targetNode) return;

    setIsSearching(true);
    const graph = buildGraph();
    const paths: Path[] = [];

    try {
      let pathNodeIds: string[] = [];

      switch (algorithm) {
        case 'dijkstra':
          pathNodeIds = dijkstra(sourceNode, targetNode, graph);
          break;
        case 'bfs':
          pathNodeIds = bfs(sourceNode, targetNode, graph);
          break;
        case 'dfs':
          pathNodeIds = dfs(sourceNode, targetNode, graph, maxHops);
          break;
      }

      if (pathNodeIds.length > 0) {
        const pathNodes = pathNodeIds.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
        const pathLinks: PathLink[] = [];
        let totalWeight = 0;

        for (let i = 0; i < pathNodeIds.length - 1; i++) {
          const link = links.find(l => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return (sourceId === pathNodeIds[i] && targetId === pathNodeIds[i + 1]) ||
                   (sourceId === pathNodeIds[i + 1] && targetId === pathNodeIds[i]);
          });
          
          if (link) {
            pathLinks.push(link);
            totalWeight += link.weight || 1;
          }
        }

        const path: Path = {
          nodes: pathNodes,
          links: pathLinks,
          totalWeight,
          hops: pathNodes.length - 1
        };

        paths.push(path);
      }

      setFoundPaths(paths);
      if (paths.length > 0) {
        setSelectedPath(paths[0]);
        onPathFound?.(paths[0]);
      }
    } catch (error) {
      console.error('Error finding path:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Render graph with path highlighting
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d: PathLink) => {
        if (selectedPath) {
          const isInPath = selectedPath.links.some(pathLink => {
            const sourceId1 = typeof d.source === 'string' ? d.source : d.source.id;
            const targetId1 = typeof d.target === 'string' ? d.target : d.target.id;
            const sourceId2 = typeof pathLink.source === 'string' ? pathLink.source : pathLink.source.id;
            const targetId2 = typeof pathLink.target === 'string' ? pathLink.target : pathLink.target.id;
            
            return (sourceId1 === sourceId2 && targetId1 === targetId2) ||
                   (sourceId1 === targetId2 && targetId1 === sourceId2);
          });
          return isInPath ? "#ff4444" : "#999";
        }
        return "#999";
      })
      .attr("stroke-width", (d: PathLink) => {
        if (selectedPath) {
          const isInPath = selectedPath.links.some(pathLink => {
            const sourceId1 = typeof d.source === 'string' ? d.source : d.source.id;
            const targetId1 = typeof d.target === 'string' ? d.target : d.target.id;
            const sourceId2 = typeof pathLink.source === 'string' ? pathLink.source : pathLink.source.id;
            const targetId2 = typeof pathLink.target === 'string' ? pathLink.target : pathLink.target.id;
            
            return (sourceId1 === sourceId2 && targetId1 === targetId2) ||
                   (sourceId1 === targetId2 && targetId1 === sourceId2);
          });
          return isInPath ? 4 : 1;
        }
        return 1;
      })
      .attr("stroke-opacity", 0.6);

    // Draw nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: PathNode) => {
        if (selectedPath) {
          const isInPath = selectedPath.nodes.some(pathNode => pathNode.id === d.id);
          return isInPath ? 12 : 8;
        }
        return 8;
      })
      .attr("fill", (d: PathNode) => {
        if (d.id === sourceNode) return "#4CAF50";
        if (d.id === targetNode) return "#F44336";
        if (selectedPath) {
          const isInPath = selectedPath.nodes.some(pathNode => pathNode.id === d.id);
          return isInPath ? "#FF9800" : "#2196F3";
        }
        return "#2196F3";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!sourceNode) {
          setSourceNode(d.id);
        } else if (!targetNode && d.id !== sourceNode) {
          setTargetNode(d.id);
        } else {
          setSourceNode(d.id);
          setTargetNode('');
          setSelectedPath(null);
          setFoundPaths([]);
        }
      });

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d: PathNode) => d.label)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

  }, [nodes, links, sourceNode, targetNode, selectedPath]);

  // Handle path selection
  const handlePathSelect = (path: Path) => {
    setSelectedPath(path);
    onPathHighlight?.(path);
  };

  return (
    <div className="enhanced-pathfinder-panel">
      <div className="pathfinder-controls">
        <h3>Enhanced Path Finder</h3>
        
        <div className="node-selection">
          <div className="control-group">
            <label>Source Node:</label>
            <select 
              value={sourceNode} 
              onChange={(e) => setSourceNode(e.target.value)}
            >
              <option value="">Select source...</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>{node.label}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Target Node:</label>
            <select 
              value={targetNode} 
              onChange={(e) => setTargetNode(e.target.value)}
            >
              <option value="">Select target...</option>
              {nodes.filter(node => node.id !== sourceNode).map(node => (
                <option key={node.id} value={node.id}>{node.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="algorithm-selection">
          <div className="control-group">
            <label>Algorithm:</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value as 'dijkstra' | 'bfs' | 'dfs')}
            >
              <option value="dijkstra">Dijkstra (Shortest Path)</option>
              <option value="bfs">BFS (Fewest Hops)</option>
              <option value="dfs">DFS (Depth First)</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Max Hops:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxHops}
              onChange={(e) => setMaxHops(parseInt(e.target.value))}
            />
          </div>
        </div>

        <button 
          onClick={findPaths}
          disabled={!sourceNode || !targetNode || isSearching}
          className="find-path-btn"
        >
          {isSearching ? 'Searching...' : 'Find Path'}
        </button>

        {foundPaths.length > 0 && (
          <div className="path-results">
            <h4>Found Paths ({foundPaths.length})</h4>
            {foundPaths.map((path, index) => (
              <div 
                key={index}
                className={`path-item ${selectedPath === path ? 'selected' : ''}`}
                onClick={() => handlePathSelect(path)}
              >
                <div className="path-summary">
                  <span>Path {index + 1}</span>
                  <span>{path.hops} hops</span>
                  <span>Weight: {path.totalWeight.toFixed(2)}</span>
                </div>
                <div className="path-nodes">
                  {path.nodes.map((node, nodeIndex) => (
                    <span key={node.id}>
                      {node.label}
                      {nodeIndex < path.nodes.length - 1 && ' → '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="instructions">
          <p><strong>Instructions:</strong></p>
          <ul>
            <li>Click nodes to select source/target</li>
            <li>Green = Source, Red = Target</li>
            <li>Orange = Path nodes</li>
            <li>Red lines = Path edges</li>
          </ul>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="800"
        height="400"
        style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
      />

      <style jsx>{`
        .enhanced-pathfinder-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .pathfinder-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .node-selection, .algorithm-selection {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 150px;
        }

        .control-group label {
          font-weight: 500;
          font-size: 14px;
        }

        .control-group select, .control-group input {
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .find-path-btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .find-path-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .find-path-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .path-results {
          border-top: 1px solid #eee;
          padding-top: 16px;
        }

        .path-results h4 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .path-item {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .path-item:hover {
          background: #f8f9fa;
        }

        .path-item.selected {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .path-summary {
          display: flex;
          justify-content: space-between;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .path-nodes {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .instructions {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
        }

        .instructions ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .instructions li {
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
};