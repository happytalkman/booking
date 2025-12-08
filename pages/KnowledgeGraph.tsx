import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, Language, EntityType } from '../types';
import { Network, RefreshCw, Layers, Filter, CircleDot, Share2 } from 'lucide-react';

interface KnowledgeGraphProps {
  lang: Language;
}

// RDF/OWL Class definitions simulated as types
const ONTOLOGY_CLASSES = {
  SHIPPER: 'http://kmtc.com/ontology#Shipper',
  BOOKING: 'http://kmtc.com/ontology#Booking',
  ROUTE: 'http://kmtc.com/ontology#Route',
  VESSEL: 'http://kmtc.com/ontology#Vessel',
  CONTRACT: 'http://kmtc.com/ontology#Contract',
  MARKET_INDEX: 'http://kmtc.com/ontology#MarketIndex',
  COMPETITOR: 'http://kmtc.com/ontology#Competitor',
  SALES_ACTIVITY: 'http://kmtc.com/ontology#SalesActivity',
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ lang }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<EntityType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'FORCE' | 'RADIAL'>('FORCE'); // Toggle View Mode

  const t = {
    title: { ko: '온톨로지 지식 그래프', en: 'Ontology Knowledge Graph' },
    details: { ko: '엔티티 상세 (RDF 속성)', en: 'Entity Details (RDF Props)' },
    shipper: { ko: '화주', en: 'Shipper' },
    booking: { ko: '부킹', en: 'Booking' },
    route: { ko: '항로', en: 'Route' },
    vessel: { ko: '선박', en: 'Vessel' },
    contract: { ko: '계약', en: 'Contract' },
    marketIndex: { ko: '시장 지표', en: 'Market Index' },
    competitor: { ko: '경쟁사', en: 'Competitor' },
    activity: { ko: '영업 활동', en: 'Sales Activity' },
    
    entityId: { ko: 'URI / ID', en: 'URI / ID' },
    type: { ko: '클래스 (Class)', en: 'Class' },
    properties: { ko: '데이터 속성 (Data Properties)', en: 'Data Properties' },
    relations: { ko: '객체 관계 (Object Properties)', en: 'Object Properties' },
    
    noSelection: { ko: '노드를 선택하여 상세 정보를 확인하세요', en: 'Select a node to view details' },
    reset: { ko: '초기화', en: 'Reset' },
    
    viewOverall: { ko: '전체 구조 (Force)', en: 'Overall (Force)' },
    viewRadial: { ko: '화주 중심 (Radial)', en: 'Shipper Centric (Radial)' }
  };

  // --- Data Generator Logic ---
  const { nodes, links } = useMemo(() => {
    const generatedNodes: GraphNode[] = [];
    const generatedLinks: GraphLink[] = [];

    // 1. Define Master Data (Individuals)
    const shippers = [
      { id: 'SHP-001', name: 'Samsung Elec', industry: 'Electronics', tier: 'VIP' },
      { id: 'SHP-002', name: 'LG Chem', industry: 'Chemicals', tier: 'Tier 1' },
      { id: 'SHP-003', name: 'Hyundai Mobis', industry: 'Auto Parts', tier: 'VIP' },
      { id: 'SHP-004', name: 'CJ CheilJedang', industry: 'Food', tier: 'Tier 2' },
      { id: 'SHP-005', name: 'SK Hynix', industry: 'Electronics', tier: 'VIP' },
    ];

    const routes = [
      { id: 'RT-USWC', code: 'KR-US-WC', name: 'Korea-US West', transit: 14 },
      { id: 'RT-USEC', code: 'KR-US-EC', name: 'Korea-US East', transit: 24 },
      { id: 'RT-EU', code: 'KR-EU-01', name: 'Korea-Europe', transit: 28 },
      { id: 'RT-CN', code: 'KR-CN-SH', name: 'Korea-Shanghai', transit: 3 },
      { id: 'RT-VN', code: 'KR-VN-HCM', name: 'Korea-Vietnam', transit: 7 },
    ];

    const vessels = [
      { id: 'VSL-001', name: 'KMTC SEOUL', capacity: 4500 },
      { id: 'VSL-002', name: 'KMTC BUSAN', capacity: 2800 },
      { id: 'VSL-003', name: 'KMTC INCHEON', capacity: 1800 },
      { id: 'VSL-004', name: 'KMTC ULSAN', capacity: 1000 },
    ];

    const contracts = [
      { id: 'CT-2024-A', type: 'Service Contract', valid: '2024-2025' },
      { id: 'CT-2024-B', type: 'RFA', valid: '2024-Q4' },
      { id: 'CT-SPOT', type: 'Spot Rate', valid: 'Weekly' },
    ];

    const indices = [
      { id: 'IDX-SCFI', name: 'SCFI', value: 1080 },
      { id: 'IDX-BAF', name: 'Bunker Price', value: 620 },
      { id: 'IDX-USDKRW', name: 'USD/KRW', value: 1350 },
    ];

    const competitors = [
      { id: 'COMP-MSK', name: 'Maersk' },
      { id: 'COMP-MSC', name: 'MSC' },
      { id: 'COMP-COS', name: 'COSCO' },
    ];

    // Helper to add node
    const addNode = (id: string, group: number, label: string, type: EntityType, val: number, props: any) => {
      generatedNodes.push({ id, group, label, type, val, properties: props });
    };

    // Helper to add link
    const addLink = (source: string, target: string, rel: string) => {
      generatedLinks.push({ source, target, relationship: rel });
    };

    // 2. Generate Master Nodes
    shippers.forEach((s, i) => addNode(s.id, 1, s.name, 'SHIPPER', 40, { industry: s.industry, tier: s.tier, uri: `${ONTOLOGY_CLASSES.SHIPPER}/${s.id}` }));
    routes.forEach((r, i) => addNode(r.id, 3, r.code, 'ROUTE', 30, { name: r.name, transit_time: r.transit, uri: `${ONTOLOGY_CLASSES.ROUTE}/${r.id}` }));
    vessels.forEach((v, i) => addNode(v.id, 4, v.name, 'VESSEL', 25, { capacity: v.capacity, uri: `${ONTOLOGY_CLASSES.VESSEL}/${v.id}` }));
    contracts.forEach((c, i) => addNode(c.id, 5, c.type, 'CONTRACT', 20, { valid_period: c.valid, uri: `${ONTOLOGY_CLASSES.CONTRACT}/${c.id}` }));
    indices.forEach((idx, i) => addNode(idx.id, 6, idx.name, 'MARKET_INDEX', 20, { current_value: idx.value, uri: `${ONTOLOGY_CLASSES.MARKET_INDEX}/${idx.id}` }));
    competitors.forEach((c, i) => addNode(c.id, 8, c.name, 'COMPETITOR', 20, { uri: `${ONTOLOGY_CLASSES.COMPETITOR}/${c.id}` }));

    // 3. Generate Transactions (Bookings & Activities)
    let bookingCounter = 1000;
    
    shippers.forEach(shipper => {
      const numBookings = 3 + Math.floor(Math.random() * 3);
      let previousBookingId = null;

      const contract = contracts[Math.floor(Math.random() * contracts.length)];
      addLink(shipper.id, contract.id, 'HAS_CONTRACT');

      for (let k = 0; k < numBookings; k++) {
        const bkId = `BK-${bookingCounter++}`;
        const status = Math.random() > 0.8 ? 'Cancelled' : (Math.random() > 0.5 ? 'Shipped' : 'Confirmed');
        const qty = 10 + Math.floor(Math.random() * 50);
        
        addNode(bkId, 2, bkId, 'BOOKING', 12, { 
          status, 
          quantity: `${qty} TEU`, 
          date: `2024-12-${10 + k}`,
          uri: `${ONTOLOGY_CLASSES.BOOKING}/${bkId}` 
        });

        addLink(shipper.id, bkId, 'MAKES_BOOKING');
        const route = routes[Math.floor(Math.random() * routes.length)];
        addLink(bkId, route.id, 'ON_ROUTE');
        const vessel = vessels[Math.floor(Math.random() * vessels.length)];
        addLink(bkId, vessel.id, 'USES_VESSEL');
        addLink(bkId, contract.id, 'APPLIES_CONTRACT');

        if (previousBookingId) {
          addLink(previousBookingId, bkId, 'TIME_NEXT');
        }
        previousBookingId = bkId;
      }

      const actId = `ACT-${shipper.id.split('-')[1]}`;
      addNode(actId, 7, 'Meeting', 'SALES_ACTIVITY', 10, { type: 'Visit', date: '2024-12-05', uri: `${ONTOLOGY_CLASSES.SALES_ACTIVITY}/${actId}` });
      addLink(shipper.id, actId, 'HAS_ACTIVITY');
    });

    routes.forEach(route => {
      addLink(route.id, 'IDX-SCFI', 'HAS_INDEX');
      const comp = competitors[Math.floor(Math.random() * competitors.length)];
      addLink(route.id, comp.id, 'COMPETES_WITH');
    });

    vessels.forEach(vessel => {
      addLink(vessel.id, 'IDX-BAF', 'AFFECTED_BY');
    });

    return { nodes: generatedNodes, links: generatedLinks };
  }, []);

  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return nodes;
    return nodes.filter(n => n.type === filterType);
  }, [nodes, filterType]);

  const filteredLinks = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  }, [links, filteredNodes]);


  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const colorScale = (type: string) => {
      switch(type) {
        case 'SHIPPER': return '#2563eb'; // Blue 600
        case 'BOOKING': return '#10b981'; // Emerald 500
        case 'ROUTE': return '#f59e0b';   // Amber 500
        case 'VESSEL': return '#6366f1';  // Indigo 500
        case 'CONTRACT': return '#8b5cf6'; // Violet 500
        case 'MARKET_INDEX': return '#ef4444'; // Red 500
        case 'COMPETITOR': return '#64748b'; // Slate 500
        case 'SALES_ACTIVITY': return '#ec4899'; // Pink 500
        default: return '#94a3b8';
      }
    };

    if (viewMode === 'FORCE') {
        // --- FORCE DIRECTED LAYOUT ---
        const simulation = d3.forceSimulation(filteredNodes as any)
          .force("link", d3.forceLink(filteredLinks).id((d: any) => d.id).distance(120))
          .force("charge", d3.forceManyBody().strength(-300))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collide", d3.forceCollide().radius(40));

        // Links
        const link = g.append("g")
          .attr("stroke", "#94a3b8")
          .attr("stroke-opacity", 0.7)
          .selectAll("line")
          .data(filteredLinks)
          .join("line")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");

        // Link Labels (관계 표시)
        const linkLabel = g.append("g")
          .selectAll("text")
          .data(filteredLinks)
          .join("text")
          .text(d => d.relationship)
          .attr("font-size", "9px")
          .attr("fill", "#64748b")
          .attr("text-anchor", "middle")
          .attr("dy", -3)
          .style("pointer-events", "none")
          .style("opacity", 0.7);

        // Marker (개선된 화살표)
        svg.append('defs').append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 10 10')
          .attr('refX', 22)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 8)
          .attr('markerHeight', 8)
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#94a3b8')
          .style('stroke', 'none');

        // Nodes
        const node = g.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .selectAll("circle")
          .data(filteredNodes)
          .join("circle")
          .attr("r", (d) => d.type === 'BOOKING' ? 8 : Math.max(14, Math.sqrt(d.val) * 4))
          .attr("fill", (d) => colorScale(d.type))
          .attr("cursor", "pointer")
          .call(drag(simulation) as any)
          .on("click", (event, d) => {
            setSelectedNode(d);
            event.stopPropagation();
          });

        // Labels
        const label = g.append("g")
          .selectAll("text")
          .data(filteredNodes)
          .join("text")
          .text(d => d.label)
          .attr("font-size", (d) => d.type === 'BOOKING' ? "8px" : "11px")
          .attr("font-weight", (d) => d.type === 'BOOKING' ? "400" : "600")
          .attr("text-anchor", "middle")
          .attr("fill", "#334155")
          .style("pointer-events", "none");

        simulation.on("tick", () => {
          link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

          linkLabel
            .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
            .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

          node
            .attr("cx", (d: any) => d.x)
            .attr("cy", (d: any) => d.y);

          label
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y + (d.type === 'BOOKING' ? 14 : Math.max(12, Math.sqrt(d.val) * 4) + 12));
        });

        function drag(simulation: any) {
          function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }
          function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }
          function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }
          return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

    } else {
        // --- RADIAL LAYOUT (Shipper Centric) ---
        // Focus on SHP-001 (Samsung) as center
        const centerId = 'SHP-001';
        const centerNode = nodes.find(n => n.id === centerId);
        
        if (!centerNode) return;

        // Find neighbors (depth 1) - 문자열로 변환
        const neighbors = links
            .filter(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                return sourceId === centerId || targetId === centerId;
            })
            .map(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                return sourceId === centerId ? targetId : sourceId;
            });
        
        const radialNodes = nodes.filter(n => n.id === centerId || neighbors.includes(n.id));
        const radialLinks = links.filter(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
            return (sourceId === centerId && neighbors.includes(targetId)) || 
                   (targetId === centerId && neighbors.includes(sourceId));
        });

        // Position nodes
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 3;
        
        // Center node
        (centerNode as any).x = cx;
        (centerNode as any).y = cy;

        // Spread neighbors
        const angleStep = (2 * Math.PI) / (radialNodes.length - 1);
        let currentAngle = 0;

        radialNodes.forEach(n => {
            if (n.id !== centerId) {
                (n as any).x = cx + radius * Math.cos(currentAngle);
                (n as any).y = cy + radius * Math.sin(currentAngle);
                currentAngle += angleStep;
            }
        });

        // Marker for arrows (Radial view)
        svg.append('defs').append('marker')
          .attr('id', 'arrowhead-radial')
          .attr('viewBox', '-0 -5 10 10')
          .attr('refX', 20)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 8)
          .attr('markerHeight', 8)
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#cbd5e1')
          .style('stroke', 'none');

        // Draw Links (저장해서 업데이트 가능하게)
        const linkGroup = g.append("g");
        
        const link = linkGroup
          .selectAll("line")
          .data(radialLinks)
          .join("line")
          .attr("stroke", "#cbd5e1")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead-radial)");

        // Update link positions
        const updateLinks = () => {
          link
            .attr("x1", (d:any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const sourceNode = radialNodes.find(n => n.id === sourceId);
                return (sourceNode as any)?.x || 0;
            })
            .attr("y1", (d:any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const sourceNode = radialNodes.find(n => n.id === sourceId);
                return (sourceNode as any)?.y || 0;
            })
            .attr("x2", (d:any) => {
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const targetNode = radialNodes.find(n => n.id === targetId);
                return (targetNode as any)?.x || 0;
            })
            .attr("y2", (d:any) => {
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const targetNode = radialNodes.find(n => n.id === targetId);
                return (targetNode as any)?.y || 0;
            });
        };

        // 초기 링크 위치 설정
        updateLinks();

        // Link Labels for Radial (관계 표시)
        const linkLabelRadial = linkGroup
          .selectAll("text")
          .data(radialLinks)
          .join("text")
          .text(d => d.relationship)
          .attr("font-size", "9px")
          .attr("fill", "#64748b")
          .attr("text-anchor", "middle")
          .attr("dy", -3)
          .style("pointer-events", "none")
          .style("opacity", 0.8);

        // Update link labels
        const updateLinkLabels = () => {
          linkLabelRadial
            .attr("x", (d:any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const sourceNode = radialNodes.find(n => n.id === sourceId);
                const targetNode = radialNodes.find(n => n.id === targetId);
                return ((sourceNode as any)?.x + (targetNode as any)?.x) / 2 || 0;
            })
            .attr("y", (d:any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const sourceNode = radialNodes.find(n => n.id === sourceId);
                const targetNode = radialNodes.find(n => n.id === targetId);
                return ((sourceNode as any)?.y + (targetNode as any)?.y) / 2 || 0;
            });
        };

        // 초기 레이블 위치 설정
        updateLinkLabels();

        // Radial 드래그 함수 (개선)
        const radialDrag = () => {
          function dragstarted(event: any, d: any) {
            d3.select(event.sourceEvent.target)
              .raise()
              .attr("stroke", "#fbbf24")
              .attr("stroke-width", 3)
              .style("cursor", "grabbing");
          }
          
          function dragged(event: any, d: any) {
            // 노드 위치 업데이트
            d.x = event.x;
            d.y = event.y;
            
            // 노드 원 위치 업데이트
            d3.select(event.sourceEvent.target)
              .attr("cx", d.x)
              .attr("cy", d.y);
            
            // 라벨 위치 업데이트
            label.filter((n: any) => n.id === d.id)
              .attr("x", d.x)
              .attr("y", d.y + (d.id === centerId ? 55 : 25));
            
            // 링크 실시간 업데이트
            updateLinks();
            
            // 링크 레이블 실시간 업데이트
            updateLinkLabels();
          }
          
          function dragended(event: any, d: any) {
            d3.select(event.sourceEvent.target)
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .style("cursor", "grab");
          }
          
          return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
        };

        // Draw Nodes
        const node = g.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .selectAll("circle")
          .data(radialNodes)
          .join("circle")
          .attr("cx", (d:any) => d.x)
          .attr("cy", (d:any) => d.y)
          .attr("r", (d) => d.id === centerId ? 40 : 15)
          .attr("fill", (d) => colorScale(d.type))
          .attr("cursor", "grab")
          .call(radialDrag() as any)
          .on("click", (event, d) => {
            setSelectedNode(d);
            event.stopPropagation();
          });

        // Labels
        const label = g.append("g")
          .selectAll("text")
          .data(radialNodes)
          .join("text")
          .attr("x", (d:any) => d.x)
          .attr("y", (d:any) => d.y + (d.id === centerId ? 55 : 25))
          .text(d => d.label)
          .attr("font-size", "10px")
          .attr("font-weight", "600")
          .attr("text-anchor", "middle")
          .attr("fill", "#334155")
          .style("pointer-events", "none");
          
        // Title for Radial
        g.append("text")
            .attr("x", cx)
            .attr("y", cy - 60)
            .text("SHIPPER CENTRIC VIEW")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "#2563eb")
            .attr("text-anchor", "middle")
            .style("opacity", 0.5);
    }

  }, [filteredNodes, filteredLinks, viewMode]);

  // Handle Fit to Screen (Reset Zoom)
  const handleResetZoom = () => {
     if (!svgRef.current || !containerRef.current) return;
     const svg = d3.select(svgRef.current);
     svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(0, 0).scale(1)
     );
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 text-slate-900 dark:text-slate-100">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col" ref={containerRef}>
        
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50 z-10">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-blue-600"/> {t.title[lang]} 
            <span className="text-xs font-normal text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full ml-2">
              {viewMode === 'FORCE' ? `${filteredNodes.length} Nodes` : 'Radial View'}
            </span>
          </h2>
          <div className="flex items-center gap-2">
             {/* View Mode Toggle */}
             <div className="flex bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-0.5">
                <button 
                    onClick={() => setViewMode('FORCE')}
                    className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition ${viewMode === 'FORCE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-500'}`}
                >
                    <Share2 className="w-3 h-3"/> {t.viewOverall[lang]}
                </button>
                <button 
                    onClick={() => setViewMode('RADIAL')}
                    className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition ${viewMode === 'RADIAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-500'}`}
                >
                    <CircleDot className="w-3 h-3"/> {t.viewRadial[lang]}
                </button>
             </div>

             <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

             {/* Filter - only show in Force mode */}
             {viewMode === 'FORCE' && (
                 <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1">
                    <Filter className="w-3 h-3 text-slate-400 mr-2" />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value as EntityType | 'ALL')}
                      className="bg-transparent text-xs font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="ALL">All Entities</option>
                      <option value="SHIPPER">Shipper</option>
                      <option value="BOOKING">Booking</option>
                      <option value="ROUTE">Route</option>
                      <option value="VESSEL">Vessel</option>
                    </select>
                 </div>
             )}
             
             <button onClick={handleResetZoom} className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200" title={t.reset[lang]}><RefreshCw className="w-3 h-3"/></button>
          </div>
        </div>

        <svg ref={svgRef} className="flex-1 w-full bg-slate-50 dark:bg-slate-900 cursor-move"></svg>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-[10px] grid grid-cols-2 gap-x-3 gap-y-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> {t.shipper[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t.booking[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {t.route[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> {t.vessel[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> {t.contract[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> {t.marketIndex[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> {t.competitor[lang]}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> {t.activity[lang]}</div>
        </div>
      </div>
      
      {/* Properties Panel (RDF/OWL Style) */}
      <div className="w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
         <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Network className="w-4 h-4 text-blue-600" /> {t.details[lang]}
            </h3>
         </div>
         
         <div className="p-4 flex-1 overflow-y-auto">
           {selectedNode ? (
             <div className="space-y-5 animate-fade-in">
               {/* Identity */}
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.entityId[lang]}</label>
                 <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 break-all font-mono bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                    {selectedNode.properties?.uri || selectedNode.id}
                 </p>
               </div>

               {/* Type */}
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.type[lang]}</label>
                 <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full text-white uppercase tracking-wide`} 
                        style={{ backgroundColor: 
                            selectedNode.type === 'SHIPPER' ? '#2563eb' : 
                            selectedNode.type === 'BOOKING' ? '#10b981' : 
                            selectedNode.type === 'ROUTE' ? '#f59e0b' :
                            '#64748b' }}>
                    {selectedNode.type}
                    </span>
                 </div>
               </div>
               
               {/* Data Properties */}
               {selectedNode.properties && (
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.properties[lang]}</label>
                   <div className="mt-2 space-y-2">
                     {Object.entries(selectedNode.properties).filter(([k]) => k !== 'uri').map(([key, value]) => (
                       <div key={key} className="flex justify-between items-start text-sm border-b border-slate-50 dark:border-slate-700 pb-1.5 last:border-0">
                         <span className="text-slate-500 dark:text-slate-400 capitalize text-xs">{key.replace('_', ' ')}</span>
                         <span className="font-medium text-slate-900 dark:text-slate-200 text-xs text-right max-w-[60%]">{value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Object Properties (Relations) */}
               <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.relations[lang]}</label>
                   <div className="mt-2 space-y-2">
                        {links.filter(l => l.source === selectedNode.id).map((link, idx) => (
                             <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-700/30 p-2 rounded">
                                 <span className="text-blue-500 font-semibold">{link.relationship}</span>
                                 <span className="text-slate-400">→</span>
                                 <span className="text-slate-700 dark:text-slate-300 truncate">{nodes.find(n => n.id === link.target)?.label || link.target}</span>
                             </div>
                        ))}
                   </div>
               </div>

             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Layers className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
               <p className="text-xs text-center font-medium">{t.noSelection[lang]}</p>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;