import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  type: string;
  cluster?: number;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: string;
}

interface NodeClusteringProps {
  nodes: Node[];
  links: Link[];
  onClusterChange?: (clusterId: number, nodes: Node[]) => void;
}

export const NodeClustering: React.FC<NodeClusteringProps> = ({
  nodes,
  links,
  onClusterChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [clusters, setClusters] = useState<Map<number, Node[]>>(new Map());
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [clusteringMethod, setClusteringMethod] = useState<'louvain' | 'modularity'>('louvain');

  // Community detection using Louvain algorithm (simplified)
  const detectCommunities = (nodes: Node[], links: Link[]) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const adjacencyList = new Map<string, Set<string>>();
    
    // Build adjacency list
    nodes.forEach(node => {
      adjacencyList.set(node.id, new Set());
    });
    
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      adjacencyList.get(sourceId)?.add(targetId);
      adjacencyList.get(targetId)?.add(sourceId);
    });

    // Simple community detection based on node types and connections
    const communities = new Map<number, Set<string>>();
    let communityId = 0;
    const visited = new Set<string>();

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const community = new Set<string>();
        const queue = [node.id];
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (visited.has(currentId)) continue;
          
          visited.add(currentId);
          community.add(currentId);
          
          const currentNode = nodeMap.get(currentId);
          const neighbors = adjacencyList.get(currentId) || new Set();
          
          neighbors.forEach(neighborId => {
            const neighbor = nodeMap.get(neighborId);
            if (!visited.has(neighborId) && 
                neighbor && currentNode && 
                neighbor.type === currentNode.type) {
              queue.push(neighborId);
            }
          });
        }
        
        communities.set(communityId++, community);
      }
    });

    return communities;
  };

  // Apply clustering to nodes
  const applyClustering = () => {
    const communities = detectCommunities(nodes, links);
    const clusteredNodes = nodes.map(node => ({ ...node }));
    const clusterMap = new Map<number, Node[]>();

    communities.forEach((nodeIds, clusterId) => {
      const clusterNodes: Node[] = [];
      nodeIds.forEach(nodeId => {
        const node = clusteredNodes.find(n => n.id === nodeId);
        if (node) {
          node.cluster = clusterId;
          clusterNodes.push(node);
        }
      });
      clusterMap.set(clusterId, clusterNodes);
    });

    setClusters(clusterMap);
    return clusteredNodes;
  };

  // Render clustered graph
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const clusteredNodes = applyClustering();

    // Color scale for clusters
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create force simulation
    const simulation = d3.forceSimulation(clusteredNodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("cluster", d3.forceRadial(100, width / 2, height / 2).strength(0.1));

    // Draw cluster backgrounds
    const clusterGroups = svg.selectAll(".cluster-group")
      .data(Array.from(clusters.entries()))
      .enter()
      .append("g")
      .attr("class", "cluster-group");

    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    // Draw nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(clusteredNodes)
      .enter()
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d: Node) => colorScale(d.cluster?.toString() || "0"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (d.cluster !== undefined) {
          setSelectedCluster(d.cluster);
          onClusterChange?.(d.cluster, clusters.get(d.cluster) || []);
        }
      });

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(clusteredNodes)
      .enter()
      .append("text")
      .text((d: Node) => d.label)
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

      // Update cluster hulls
      clusterGroups.each(function([clusterId, clusterNodes]) {
        const group = d3.select(this);
        group.selectAll("path").remove();

        if (clusterNodes.length > 2) {
          const points = clusterNodes.map(n => [n.x || 0, n.y || 0]);
          const hull = d3.polygonHull(points);
          
          if (hull) {
            group.append("path")
              .datum(hull)
              .attr("d", d3.line().curve(d3.curveCardinalClosed.tension(0.85)))
              .attr("fill", colorScale(clusterId.toString()))
              .attr("fill-opacity", 0.1)
              .attr("stroke", colorScale(clusterId.toString()))
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5");
          }
        }
      });
    });

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

  }, [nodes, links, clusteringMethod]);

  return (
    <div className="node-clustering-panel">
      <div className="clustering-controls">
        <h3>Node Clustering</h3>
        <div className="control-group">
          <label>Algorithm:</label>
          <select 
            value={clusteringMethod} 
            onChange={(e) => setClusteringMethod(e.target.value as 'louvain' | 'modularity')}
          >
            <option value="louvain">Louvain</option>
            <option value="modularity">Modularity</option>
          </select>
        </div>
        
        <div className="cluster-info">
          <p>Clusters detected: {clusters.size}</p>
          {selectedCluster !== null && (
            <p>Selected cluster: {selectedCluster} ({clusters.get(selectedCluster)?.length || 0} nodes)</p>
          )}
        </div>

        <div className="cluster-legend">
          {Array.from(clusters.entries()).map(([clusterId, clusterNodes]) => (
            <div 
              key={clusterId}
              className={`cluster-item ${selectedCluster === clusterId ? 'selected' : ''}`}
              onClick={() => {
                setSelectedCluster(clusterId);
                onClusterChange?.(clusterId, clusterNodes);
              }}
            >
              <div 
                className="cluster-color"
                style={{ backgroundColor: d3.scaleOrdinal(d3.schemeCategory10)(clusterId.toString()) }}
              />
              <span>Cluster {clusterId} ({clusterNodes.length} nodes)</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        width="800"
        height="600"
        style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
      />

      <style jsx>{`
        .node-clustering-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .clustering-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-group label {
          font-weight: 500;
          min-width: 80px;
        }

        .control-group select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .cluster-info {
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 14px;
        }

        .cluster-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cluster-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .cluster-item:hover {
          background: #e9ecef;
        }

        .cluster-item.selected {
          background: #007bff;
          color: white;
          border-color: #0056b3;
        }

        .cluster-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};