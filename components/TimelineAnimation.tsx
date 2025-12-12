import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface TimelineNode {
  id: string;
  label: string;
  type: string;
  timestamp: Date;
  action: 'added' | 'removed' | 'modified';
  x?: number;
  y?: number;
}

interface TimelineLink {
  source: string | TimelineNode;
  target: string | TimelineNode;
  type: string;
  timestamp: Date;
  action: 'added' | 'removed' | 'modified';
}

interface TimelineFrame {
  timestamp: Date;
  nodes: TimelineNode[];
  links: TimelineLink[];
}

interface TimelineAnimationProps {
  frames: TimelineFrame[];
  onFrameChange?: (frame: TimelineFrame, index: number) => void;
  autoPlay?: boolean;
  speed?: number;
}

export const TimelineAnimation: React.FC<TimelineAnimationProps> = ({
  frames,
  onFrameChange,
  autoPlay = false,
  speed = 1000
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(speed);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Animation controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const nextFrame = useCallback(() => {
    setCurrentFrame(prev => Math.min(prev + 1, frames.length - 1));
  }, [frames.length]);

  const prevFrame = useCallback(() => {
    setCurrentFrame(prev => Math.max(prev - 1, 0));
  }, []);

  const goToFrame = useCallback((frameIndex: number) => {
    setCurrentFrame(Math.max(0, Math.min(frameIndex, frames.length - 1)));
  }, [frames.length]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentFrame < frames.length - 1) {
      intervalRef.current = setTimeout(() => {
        nextFrame();
      }, playbackSpeed);
    } else if (currentFrame >= frames.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentFrame, frames.length, nextFrame, playbackSpeed]);

  // Notify parent of frame changes
  useEffect(() => {
    if (frames[currentFrame]) {
      onFrameChange?.(frames[currentFrame], currentFrame);
    }
  }, [currentFrame, frames, onFrameChange]);

  // Render current frame
  useEffect(() => {
    if (!svgRef.current || !frames[currentFrame]) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const frame = frames[currentFrame];

    // Clear previous frame
    svg.selectAll("*").remove();

    // Create simulation for current frame
    const simulation = d3.forceSimulation(frame.nodes)
      .force("link", d3.forceLink(frame.links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20));

    // Color scales for actions
    const nodeColorScale = d3.scaleOrdinal<string>()
      .domain(['added', 'removed', 'modified'])
      .range(['#28a745', '#dc3545', '#ffc107']);

    const linkColorScale = d3.scaleOrdinal<string>()
      .domain(['added', 'removed', 'modified'])
      .range(['#28a745', '#dc3545', '#ffc107']);

    // Draw links with animation
    const links = svg.append("g")
      .selectAll("line")
      .data(frame.links)
      .enter()
      .append("line")
      .attr("stroke", (d: TimelineLink) => linkColorScale(d.action))
      .attr("stroke-opacity", 0)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d: TimelineLink) => d.action === 'removed' ? "5,5" : "none");

    // Animate links in
    links.transition()
      .duration(500)
      .attr("stroke-opacity", 0.6);

    // Draw nodes with animation
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(frame.nodes)
      .enter()
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d: TimelineNode) => nodeColorScale(d.action))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", (d: TimelineNode) => d.action === 'removed' ? 0.5 : 1);

    // Animate nodes in
    nodes.transition()
      .duration(500)
      .attr("r", (d: TimelineNode) => d.action === 'removed' ? 6 : 10);

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(frame.nodes)
      .enter()
      .append("text")
      .text((d: TimelineNode) => d.label)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("opacity", 0);

    // Animate labels in
    labels.transition()
      .duration(500)
      .delay(250)
      .attr("opacity", 1);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Add timestamp display
    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`${frame.timestamp.toLocaleDateString()} ${frame.timestamp.toLocaleTimeString()}`);

    // Add frame counter
    svg.append("text")
      .attr("x", 20)
      .attr("y", 50)
      .attr("font-size", "12px")
      .text(`Frame ${currentFrame + 1} of ${frames.length}`);

  }, [currentFrame, frames]);

  const formatDate = (date: Date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="timeline-animation-panel">
      <div className="animation-controls">
        <h3>Ontology Evolution Timeline</h3>
        
        <div className="playback-controls">
          <button onClick={reset} disabled={currentFrame === 0}>
            ⏮️ Reset
          </button>
          <button onClick={prevFrame} disabled={currentFrame === 0}>
            ⏪ Prev
          </button>
          <button onClick={isPlaying ? pause : play}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button onClick={nextFrame} disabled={currentFrame >= frames.length - 1}>
            ⏩ Next
          </button>
        </div>

        <div className="timeline-scrubber">
          <input
            type="range"
            min="0"
            max={frames.length - 1}
            value={currentFrame}
            onChange={(e) => goToFrame(parseInt(e.target.value))}
            className="timeline-slider"
          />
          <div className="timeline-labels">
            <span>{frames[0] ? formatDate(frames[0].timestamp) : ''}</span>
            <span>{frames[frames.length - 1] ? formatDate(frames[frames.length - 1].timestamp) : ''}</span>
          </div>
        </div>

        <div className="speed-control">
          <label>Speed:</label>
          <input
            type="range"
            min="100"
            max="3000"
            step="100"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
          />
          <span>{(3000 - playbackSpeed + 100) / 100}x</span>
        </div>

        <div className="frame-info">
          {frames[currentFrame] && (
            <>
              <p><strong>Timestamp:</strong> {formatDate(frames[currentFrame].timestamp)}</p>
              <p><strong>Nodes:</strong> {frames[currentFrame].nodes.length}</p>
              <p><strong>Links:</strong> {frames[currentFrame].links.length}</p>
              <div className="action-summary">
                <span className="added">Added: {frames[currentFrame].nodes.filter(n => n.action === 'added').length}</span>
                <span className="modified">Modified: {frames[currentFrame].nodes.filter(n => n.action === 'modified').length}</span>
                <span className="removed">Removed: {frames[currentFrame].nodes.filter(n => n.action === 'removed').length}</span>
              </div>
            </>
          )}
        </div>

        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color added"></div>
              <span>Added</span>
            </div>
            <div className="legend-item">
              <div className="legend-color modified"></div>
              <span>Modified</span>
            </div>
            <div className="legend-item">
              <div className="legend-color removed"></div>
              <span>Removed</span>
            </div>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="800"
        height="600"
        style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
      />

      <style jsx>{`
        .timeline-animation-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .animation-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .playback-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .playback-controls button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .playback-controls button:hover:not(:disabled) {
          background: #f8f9fa;
        }

        .playback-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .timeline-scrubber {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .timeline-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #ddd;
          outline: none;
          cursor: pointer;
        }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .speed-control input {
          width: 100px;
        }

        .frame-info {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
        }

        .action-summary {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 12px;
        }

        .action-summary .added { color: #28a745; }
        .action-summary .modified { color: #ffc107; }
        .action-summary .removed { color: #dc3545; }

        .legend {
          border-top: 1px solid #eee;
          padding-top: 12px;
        }

        .legend h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .legend-items {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-color.added { background: #28a745; }
        .legend-color.modified { background: #ffc107; }
        .legend-color.removed { background: #dc3545; }
      `}</style>
    </div>
  );
};