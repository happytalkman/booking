import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Node3D {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  z?: number;
  color?: string;
}

interface Link3D {
  source: string | Node3D;
  target: string | Node3D;
  type: string;
}

interface Graph3DProps {
  nodes: Node3D[];
  links: Link3D[];
  onNodeClick?: (node: Node3D) => void;
  onNodeHover?: (node: Node3D | null) => void;
}

export const Graph3D: React.FC<Graph3DProps> = ({
  nodes,
  links,
  onNodeClick,
  onNodeHover
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const nodeObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const linkObjectsRef = useRef<THREE.LineSegments[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'fly'>('orbit');
  const animationIdRef = useRef<number>();

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = 800;
    const height = 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls (basic mouse interaction)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
            toRadians(deltaMove.y * 1),
            toRadians(deltaMove.x * 1),
            0,
            'XYZ'
          ));

        camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion);
        previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        // Handle hover detection
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(Array.from(nodeObjectsRef.current.values()));
        
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object as THREE.Mesh;
          const nodeId = intersectedObject.userData.nodeId;
          const node = nodes.find(n => n.id === nodeId);
          if (node && hoveredNode?.id !== node.id) {
            setHoveredNode(node);
            onNodeHover?.(node);
          }
        } else if (hoveredNode) {
          setHoveredNode(null);
          onNodeHover?.(null);
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseClick = (event: MouseEvent) => {
      if (!isDragging) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(Array.from(nodeObjectsRef.current.values()));
        
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object as THREE.Mesh;
          const nodeId = intersectedObject.userData.nodeId;
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            onNodeClick?.(node);
          }
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      const zoomSpeed = 0.1;
      const direction = event.deltaY > 0 ? 1 : -1;
      camera.position.multiplyScalar(1 + direction * zoomSpeed);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('wheel', onWheel);

    const toRadians = (angle: number) => angle * (Math.PI / 180);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update graph when data changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Clear existing objects
    nodeObjectsRef.current.forEach(mesh => scene.remove(mesh));
    linkObjectsRef.current.forEach(line => scene.remove(line));
    nodeObjectsRef.current.clear();
    linkObjectsRef.current.length = 0;

    // Create node positions using force-directed layout (simplified 3D)
    const nodePositions = new Map<string, THREE.Vector3>();
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = 30;
      const height = (Math.random() - 0.5) * 20;
      
      nodePositions.set(node.id, new THREE.Vector3(
        Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
        height,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 10
      ));
    });

    // Create nodes
    const nodeGeometry = new THREE.SphereGeometry(2, 16, 16);
    const nodeColors = {
      'entity': 0x4CAF50,
      'property': 0x2196F3,
      'class': 0xFF9800,
      'individual': 0x9C27B0,
      'default': 0x607D8B
    };

    nodes.forEach(node => {
      const color = nodeColors[node.type as keyof typeof nodeColors] || nodeColors.default;
      const material = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      
      const position = nodePositions.get(node.id)!;
      mesh.position.copy(position);
      mesh.userData.nodeId = node.id;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      nodeObjectsRef.current.set(node.id, mesh);

      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#000000';
      context.font = '20px Arial';
      context.textAlign = 'center';
      context.fillText(node.label, canvas.width / 2, canvas.height / 2 + 7);

      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture });
      const label = new THREE.Sprite(labelMaterial);
      label.position.copy(position);
      label.position.y += 5;
      label.scale.set(8, 2, 1);
      scene.add(label);
    });

    // Create links
    const linkGeometry = new THREE.BufferGeometry();
    const linkPositions: number[] = [];

    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      const sourcePos = nodePositions.get(sourceId);
      const targetPos = nodePositions.get(targetId);
      
      if (sourcePos && targetPos) {
        linkPositions.push(sourcePos.x, sourcePos.y, sourcePos.z);
        linkPositions.push(targetPos.x, targetPos.y, targetPos.z);
      }
    });

    linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
    const linkMaterial = new THREE.LineBasicMaterial({ color: 0x999999, opacity: 0.6, transparent: true });
    const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial);
    scene.add(linkLines);
    linkObjectsRef.current.push(linkLines);

  }, [nodes, links]);

  // Handle hover effects
  useEffect(() => {
    nodeObjectsRef.current.forEach((mesh, nodeId) => {
      const isHovered = hoveredNode?.id === nodeId;
      const material = mesh.material as THREE.MeshLambertMaterial;
      material.emissive.setHex(isHovered ? 0x444444 : 0x000000);
      mesh.scale.setScalar(isHovered ? 1.2 : 1);
    });
  }, [hoveredNode]);

  return (
    <div className="graph-3d-panel">
      <div className="graph-3d-controls">
        <h3>3D Graph Visualization</h3>
        
        <div className="control-group">
          <label>Camera Mode:</label>
          <select 
            value={cameraMode} 
            onChange={(e) => setCameraMode(e.target.value as 'orbit' | 'fly')}
          >
            <option value="orbit">Orbit</option>
            <option value="fly">Fly</option>
          </select>
        </div>

        <div className="instructions">
          <p><strong>Controls:</strong></p>
          <ul>
            <li>Drag to rotate view</li>
            <li>Scroll to zoom</li>
            <li>Click nodes to select</li>
            <li>Hover for details</li>
          </ul>
        </div>

        {hoveredNode && (
          <div className="node-info">
            <h4>Node Details</h4>
            <p><strong>ID:</strong> {hoveredNode.id}</p>
            <p><strong>Label:</strong> {hoveredNode.label}</p>
            <p><strong>Type:</strong> {hoveredNode.type}</p>
          </div>
        )}

        <div className="stats">
          <p>Nodes: {nodes.length}</p>
          <p>Links: {links.length}</p>
        </div>
      </div>

      <div 
        ref={mountRef} 
        className="graph-3d-container"
        style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}
      />

      <style jsx>{`
        .graph-3d-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .graph-3d-controls {
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
          min-width: 100px;
        }

        .control-group select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
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

        .node-info {
          padding: 12px;
          background: #e3f2fd;
          border-radius: 4px;
          border-left: 4px solid #2196f3;
        }

        .node-info h4 {
          margin: 0 0 8px 0;
          color: #1976d2;
        }

        .node-info p {
          margin: 4px 0;
          font-size: 14px;
        }

        .stats {
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 14px;
        }

        .stats p {
          margin: 4px 0;
        }

        .graph-3d-container {
          border-radius: 4px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};