import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, Language, EntityType } from '../types';
import { Network, RefreshCw, Layers, Filter, CircleDot, Share2 } from 'lucide-react';
import KnowledgeGraphPanel from '../components/KnowledgeGraphPanel';
import OntologyVisualizationController from '../components/OntologyVisualizationController';

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
  SHIP_OWNER: 'http://kmtc.com/ontology#ShipOwner',
  PORT: 'http://kmtc.com/ontology#Port',
  CARGO: 'http://kmtc.com/ontology#Cargo',
  TERMINAL: 'http://kmtc.com/ontology#Terminal',
  FREIGHT_FORWARDER: 'http://kmtc.com/ontology#FreightForwarder',
  INSURANCE: 'http://kmtc.com/ontology#Insurance',
  CUSTOMS: 'http://kmtc.com/ontology#Customs'
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ lang }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<EntityType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'FORCE' | 'RADIAL'>('FORCE'); // Toggle View Mode
  const [currentLayout, setCurrentLayout] = useState<'force' | 'radial' | 'hierarchical' | 'circular' | 'grid'>('force');
  const [zoom, setZoom] = useState(100);
  const [filters, setFilters] = useState({
    nodeTypes: ['shipper', 'shipOwner', 'route', 'booking', 'vessel', 'contract', 'port', 'cargo', 'freightForwarder', 'insurance', 'marketIndex', 'competitor'],
    relationTypes: ['hasContract', 'makesBooking', 'ownsVessel', 'operatesOn', 'servesRoute', 'shipsCargo', 'usesForwarder', 'hasInsurance', 'competesOn', 'affectedBy'],
    minConnections: 0,
    maxConnections: 100,
    showLabels: true,
    nodeSize: 'medium' as 'small' | 'medium' | 'large'
  });

  const t = {
    title: { ko: '화주 온톨로지 지식 그래프', en: 'Shipper Ontology Knowledge Graph' },
    details: { ko: '엔티티 상세 (RDF 속성)', en: 'Entity Details (RDF Props)' },
    shipper: { ko: '화주', en: 'Shipper' },
    booking: { ko: '부킹', en: 'Booking' },
    route: { ko: '항로', en: 'Route' },
    vessel: { ko: '선박', en: 'Vessel' },
    contract: { ko: '계약', en: 'Contract' },
    marketIndex: { ko: '시장 지표', en: 'Market Index' },
    competitor: { ko: '경쟁사', en: 'Competitor' },
    activity: { ko: '영업 활동', en: 'Sales Activity' },
    shipOwner: { ko: '선주', en: 'Ship Owner' },
    port: { ko: '항만', en: 'Port' },
    cargo: { ko: '화물', en: 'Cargo' },
    terminal: { ko: '터미널', en: 'Terminal' },
    freightForwarder: { ko: '포워더', en: 'Freight Forwarder' },
    insurance: { ko: '보험', en: 'Insurance' },
    customs: { ko: '관세청', en: 'Customs' },
    
    entityId: { ko: 'URI / ID', en: 'URI / ID' },
    type: { ko: '클래스 (Class)', en: 'Class' },
    properties: { ko: '데이터 속성 (Data Properties)', en: 'Data Properties' },
    relations: { ko: '객체 관계 (Object Properties)', en: 'Object Properties' },
    
    noSelection: { ko: '노드를 선택하여 상세 정보를 확인하세요', en: 'Select a node to view details' },
    reset: { ko: '초기화', en: 'Reset' },
    
    viewOverall: { ko: '전체 구조 (Force)', en: 'Overall (Force)' },
    viewRadial: { ko: '화주 중심 (Radial)', en: 'Shipper Centric (Radial)' }
  };

  // --- 완전한 화주 온톨로지 데이터 모델 ---
  const { nodes, links } = useMemo(() => {
    const generatedNodes: GraphNode[] = [];
    const generatedLinks: GraphLink[] = [];

    // 1. 화주 (Shippers) - 핵심 엔티티
    const shippers = [
      { 
        id: 'SHP-001', 
        name: 'Samsung Electronics', 
        industry: 'Electronics', 
        tier: 'VIP',
        country: 'Korea',
        annualVolume: '50000 TEU',
        creditRating: 'AAA',
        establishedYear: 1969,
        headquarters: 'Suwon, Korea'
      },
      { 
        id: 'SHP-002', 
        name: 'LG Chem', 
        industry: 'Chemicals', 
        tier: 'Tier 1',
        country: 'Korea',
        annualVolume: '35000 TEU',
        creditRating: 'AA+',
        establishedYear: 1947,
        headquarters: 'Seoul, Korea'
      },
      { 
        id: 'SHP-003', 
        name: 'Hyundai Mobis', 
        industry: 'Auto Parts', 
        tier: 'VIP',
        country: 'Korea',
        annualVolume: '42000 TEU',
        creditRating: 'AA',
        establishedYear: 1977,
        headquarters: 'Seoul, Korea'
      },
      { 
        id: 'SHP-004', 
        name: 'POSCO', 
        industry: 'Steel', 
        tier: 'VIP',
        country: 'Korea',
        annualVolume: '75000 TEU',
        creditRating: 'AA+',
        establishedYear: 1968,
        headquarters: 'Pohang, Korea'
      },
      { 
        id: 'SHP-005', 
        name: 'SK Hynix', 
        industry: 'Semiconductors', 
        tier: 'VIP',
        country: 'Korea',
        annualVolume: '28000 TEU',
        creditRating: 'AA',
        establishedYear: 1983,
        headquarters: 'Icheon, Korea'
      }
    ];

    // 2. 선주 (Ship Owners) - 새로 추가
    const shipOwners = [
      {
        id: 'SO-001',
        name: 'KMTC Ship Management',
        country: 'Korea',
        fleetSize: 45,
        totalCapacity: '180000 TEU',
        establishedYear: 1954,
        headquarters: 'Seoul, Korea'
      },
      {
        id: 'SO-002',
        name: 'HMM Fleet Co.',
        country: 'Korea',
        fleetSize: 120,
        totalCapacity: '850000 TEU',
        establishedYear: 1976,
        headquarters: 'Seoul, Korea'
      },
      {
        id: 'SO-003',
        name: 'Pan Ocean Shipping',
        country: 'Korea',
        fleetSize: 85,
        totalCapacity: '320000 TEU',
        establishedYear: 1966,
        headquarters: 'Seoul, Korea'
      }
    ];

    // 3. 항로 (Routes) - 확장
    const routes = [
      { 
        id: 'RT-USWC', 
        code: 'KR-US-WC', 
        name: 'Korea-US West Coast', 
        transit: 14,
        distance: '5800 NM',
        frequency: 'Weekly',
        avgRate: '$2850/TEU'
      },
      { 
        id: 'RT-USEC', 
        code: 'KR-US-EC', 
        name: 'Korea-US East Coast', 
        transit: 24,
        distance: '11200 NM',
        frequency: 'Weekly',
        avgRate: '$3200/TEU'
      },
      { 
        id: 'RT-EU', 
        code: 'KR-EU-01', 
        name: 'Korea-Europe', 
        transit: 28,
        distance: '12500 NM',
        frequency: 'Bi-weekly',
        avgRate: '$3500/TEU'
      },
      { 
        id: 'RT-CN', 
        code: 'KR-CN-SH', 
        name: 'Korea-Shanghai', 
        transit: 3,
        distance: '450 NM',
        frequency: 'Daily',
        avgRate: '$180/TEU'
      },
      { 
        id: 'RT-SEA', 
        code: 'KR-SEA-01', 
        name: 'Korea-Southeast Asia', 
        transit: 7,
        distance: '1800 NM',
        frequency: 'Tri-weekly',
        avgRate: '$450/TEU'
      }
    ];

    // 4. 선박 (Vessels) - 확장
    const vessels = [
      { 
        id: 'VSL-001', 
        name: 'KMTC SEOUL', 
        capacity: 4500,
        owner: 'SO-001',
        builtYear: 2018,
        flag: 'Korea',
        length: '260m',
        beam: '40m'
      },
      { 
        id: 'VSL-002', 
        name: 'KMTC BUSAN', 
        capacity: 2800,
        owner: 'SO-001',
        builtYear: 2016,
        flag: 'Korea',
        length: '220m',
        beam: '32m'
      },
      { 
        id: 'VSL-003', 
        name: 'HMM ALGECIRAS', 
        capacity: 24000,
        owner: 'SO-002',
        builtYear: 2020,
        flag: 'Korea',
        length: '400m',
        beam: '61m'
      },
      { 
        id: 'VSL-004', 
        name: 'PAN OCEAN GLORY', 
        capacity: 8500,
        owner: 'SO-003',
        builtYear: 2019,
        flag: 'Korea',
        length: '320m',
        beam: '48m'
      }
    ];

    // 5. 계약 (Contracts) - 확장
    const contracts = [
      { 
        id: 'CT-2024-A', 
        type: 'Service Contract', 
        valid: '2024-2025',
        shipper: 'SHP-001',
        volume: '15000 TEU',
        rate: '$2750/TEU',
        routes: ['RT-USWC', 'RT-USEC']
      },
      { 
        id: 'CT-2024-B', 
        type: 'RFA (Rate Filing Agreement)', 
        valid: '2024-Q4',
        shipper: 'SHP-002',
        volume: '8000 TEU',
        rate: '$3100/TEU',
        routes: ['RT-EU']
      },
      { 
        id: 'CT-2024-C', 
        type: 'Master Service Agreement', 
        valid: '2024-2026',
        shipper: 'SHP-003',
        volume: '25000 TEU',
        rate: '$2650/TEU',
        routes: ['RT-USWC', 'RT-SEA']
      },
      { 
        id: 'CT-SPOT', 
        type: 'Spot Rate', 
        valid: 'Weekly',
        volume: 'Variable',
        rate: 'Market Rate',
        routes: ['ALL']
      }
    ];

    // 6. 항만 (Ports) - 새로 추가
    const ports = [
      {
        id: 'PORT-001',
        name: 'Busan Port',
        country: 'Korea',
        code: 'KRPUS',
        type: 'Hub Port',
        annualThroughput: '22M TEU',
        terminals: 4
      },
      {
        id: 'PORT-002',
        name: 'Los Angeles Port',
        country: 'USA',
        code: 'USLAX',
        type: 'Gateway Port',
        annualThroughput: '9.3M TEU',
        terminals: 8
      },
      {
        id: 'PORT-003',
        name: 'Hamburg Port',
        country: 'Germany',
        code: 'DEHAM',
        type: 'Gateway Port',
        annualThroughput: '8.5M TEU',
        terminals: 6
      },
      {
        id: 'PORT-004',
        name: 'Shanghai Port',
        country: 'China',
        code: 'CNSHA',
        type: 'Hub Port',
        annualThroughput: '47M TEU',
        terminals: 12
      }
    ];

    // 7. 화물 (Cargo) - 새로 추가
    const cargos = [
      {
        id: 'CG-001',
        type: 'Electronics',
        description: 'Consumer Electronics',
        hazardous: false,
        temperature: 'Ambient',
        packaging: 'Cartons'
      },
      {
        id: 'CG-002',
        type: 'Chemicals',
        description: 'Industrial Chemicals',
        hazardous: true,
        temperature: 'Controlled',
        packaging: 'Drums'
      },
      {
        id: 'CG-003',
        type: 'Auto Parts',
        description: 'Automotive Components',
        hazardous: false,
        temperature: 'Ambient',
        packaging: 'Crates'
      }
    ];

    // 8. 시장 지표 (Market Indices) - 확장
    const indices = [
      { 
        id: 'IDX-SCFI', 
        name: 'Shanghai Containerized Freight Index', 
        value: 1080,
        unit: 'Points',
        change: '+2.5%',
        lastUpdate: '2024-12-13'
      },
      { 
        id: 'IDX-BAF', 
        name: 'Bunker Adjustment Factor', 
        value: 620,
        unit: 'USD/MT',
        change: '+1.8%',
        lastUpdate: '2024-12-13'
      },
      { 
        id: 'IDX-USDKRW', 
        name: 'USD/KRW Exchange Rate', 
        value: 1350,
        unit: 'KRW',
        change: '-0.3%',
        lastUpdate: '2024-12-13'
      },
      { 
        id: 'IDX-WCI', 
        name: 'World Container Index', 
        value: 1456,
        unit: 'USD/40ft',
        change: '+3.2%',
        lastUpdate: '2024-12-13'
      }
    ];

    // 9. 경쟁사 (Competitors) - 확장
    const competitors = [
      { 
        id: 'COMP-MSK', 
        name: 'A.P. Moller-Maersk',
        country: 'Denmark',
        marketShare: '17.0%',
        fleetCapacity: '4.3M TEU'
      },
      { 
        id: 'COMP-MSC', 
        name: 'Mediterranean Shipping Company',
        country: 'Switzerland',
        marketShare: '17.9%',
        fleetCapacity: '4.6M TEU'
      },
      { 
        id: 'COMP-COS', 
        name: 'COSCO SHIPPING',
        country: 'China',
        marketShare: '12.4%',
        fleetCapacity: '3.2M TEU'
      },
      { 
        id: 'COMP-ONE', 
        name: 'Ocean Network Express',
        country: 'Japan',
        marketShare: '7.8%',
        fleetCapacity: '1.9M TEU'
      }
    ];

    // 10. 포워더 (Freight Forwarders) - 새로 추가
    const freightForwarders = [
      {
        id: 'FF-001',
        name: 'DHL Global Forwarding',
        country: 'Germany',
        services: ['FCL', 'LCL', 'Air Freight'],
        offices: 190
      },
      {
        id: 'FF-002',
        name: 'Kuehne + Nagel',
        country: 'Switzerland',
        services: ['FCL', 'LCL', 'Project Cargo'],
        offices: 108
      },
      {
        id: 'FF-003',
        name: 'Pantos Logistics',
        country: 'Korea',
        services: ['FCL', 'LCL', 'Customs'],
        offices: 45
      }
    ];

    // 11. 보험사 (Insurance) - 새로 추가
    const insuranceCompanies = [
      {
        id: 'INS-001',
        name: 'Lloyd\'s of London',
        country: 'UK',
        type: 'Marine Insurance',
        coverage: 'Cargo & Hull'
      },
      {
        id: 'INS-002',
        name: 'Samsung Fire & Marine',
        country: 'Korea',
        type: 'Marine Insurance',
        coverage: 'Cargo & Liability'
      }
    ];

    // Helper to add node
    const addNode = (id: string, group: number, label: string, type: EntityType, val: number, props: any) => {
      generatedNodes.push({ id, group, label, type, val, properties: props });
    };

    // Helper to add link
    const addLink = (source: string, target: string, rel: string) => {
      generatedLinks.push({ source, target, relationship: rel });
    };

    // === 노드 생성 ===
    
    // 1. 화주 노드 생성
    shippers.forEach((s) => addNode(s.id, 1, s.name, 'SHIPPER', 50, { 
      ...s, 
      uri: `${ONTOLOGY_CLASSES.SHIPPER}/${s.id}` 
    }));

    // 2. 선주 노드 생성
    shipOwners.forEach((so) => addNode(so.id, 9, so.name, 'SHIP_OWNER', 35, { 
      ...so, 
      uri: `${ONTOLOGY_CLASSES.SHIP_OWNER}/${so.id}` 
    }));

    // 3. 항로 노드 생성
    routes.forEach((r) => addNode(r.id, 3, r.code, 'ROUTE', 30, { 
      ...r, 
      uri: `${ONTOLOGY_CLASSES.ROUTE}/${r.id}` 
    }));

    // 4. 선박 노드 생성
    vessels.forEach((v) => addNode(v.id, 4, v.name, 'VESSEL', 25, { 
      ...v, 
      uri: `${ONTOLOGY_CLASSES.VESSEL}/${v.id}` 
    }));

    // 5. 계약 노드 생성
    contracts.forEach((c) => addNode(c.id, 5, c.type, 'CONTRACT', 22, { 
      ...c, 
      uri: `${ONTOLOGY_CLASSES.CONTRACT}/${c.id}` 
    }));

    // 6. 항만 노드 생성
    ports.forEach((p) => addNode(p.id, 10, p.name, 'PORT', 28, { 
      ...p, 
      uri: `${ONTOLOGY_CLASSES.PORT}/${p.id}` 
    }));

    // 7. 화물 노드 생성
    cargos.forEach((cg) => addNode(cg.id, 11, cg.type, 'CARGO', 18, { 
      ...cg, 
      uri: `${ONTOLOGY_CLASSES.CARGO}/${cg.id}` 
    }));

    // 8. 시장 지표 노드 생성
    indices.forEach((idx) => addNode(idx.id, 6, idx.name, 'MARKET_INDEX', 20, { 
      ...idx, 
      uri: `${ONTOLOGY_CLASSES.MARKET_INDEX}/${idx.id}` 
    }));

    // 9. 경쟁사 노드 생성
    competitors.forEach((c) => addNode(c.id, 8, c.name, 'COMPETITOR', 20, { 
      ...c, 
      uri: `${ONTOLOGY_CLASSES.COMPETITOR}/${c.id}` 
    }));

    // 10. 포워더 노드 생성
    freightForwarders.forEach((ff) => addNode(ff.id, 12, ff.name, 'FREIGHT_FORWARDER', 18, { 
      ...ff, 
      uri: `${ONTOLOGY_CLASSES.FREIGHT_FORWARDER}/${ff.id}` 
    }));

    // 11. 보험사 노드 생성
    insuranceCompanies.forEach((ins) => addNode(ins.id, 13, ins.name, 'INSURANCE', 16, { 
      ...ins, 
      uri: `${ONTOLOGY_CLASSES.INSURANCE}/${ins.id}` 
    }));

    // === 관계 설정 (Object Properties) ===
    
    // 1. 화주-계약 관계
    shippers.forEach(shipper => {
      // 각 화주는 1-2개의 계약을 가짐
      const shipperContracts = contracts.filter(c => c.shipper === shipper.id);
      shipperContracts.forEach(contract => {
        addLink(shipper.id, contract.id, 'HAS_CONTRACT');
        addLink(contract.id, shipper.id, 'CONTRACTED_BY');
      });
      
      // 화주-화물 관계
      const shipperCargo = cargos.find(cg => 
        (shipper.industry === 'Electronics' && cg.type === 'Electronics') ||
        (shipper.industry === 'Chemicals' && cg.type === 'Chemicals') ||
        (shipper.industry === 'Auto Parts' && cg.type === 'Auto Parts')
      );
      if (shipperCargo) {
        addLink(shipper.id, shipperCargo.id, 'SHIPS_CARGO');
        addLink(shipperCargo.id, shipper.id, 'SHIPPED_BY');
      }

      // 화주-포워더 관계
      const forwarder = freightForwarders[Math.floor(Math.random() * freightForwarders.length)];
      addLink(shipper.id, forwarder.id, 'USES_FORWARDER');
      addLink(forwarder.id, shipper.id, 'SERVES_SHIPPER');

      // 화주-보험 관계
      const insurance = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
      addLink(shipper.id, insurance.id, 'HAS_INSURANCE');
      addLink(insurance.id, shipper.id, 'INSURES');
    });

    // 2. 선주-선박 관계
    vessels.forEach(vessel => {
      const owner = shipOwners.find(so => so.id === vessel.owner);
      if (owner) {
        addLink(owner.id, vessel.id, 'OWNS_VESSEL');
        addLink(vessel.id, owner.id, 'OWNED_BY');
      }
    });

    // 3. 선박-항로 관계
    vessels.forEach(vessel => {
      // 각 선박은 1-2개 항로에서 운항
      const numRoutes = 1 + Math.floor(Math.random() * 2);
      const assignedRoutes = routes.slice(0, numRoutes);
      assignedRoutes.forEach(route => {
        addLink(vessel.id, route.id, 'OPERATES_ON');
        addLink(route.id, vessel.id, 'SERVED_BY');
      });
    });

    // 4. 항로-항만 관계
    routes.forEach(route => {
      // 각 항로는 출발지와 도착지 항만을 가짐
      if (route.code.includes('US')) {
        addLink(route.id, 'PORT-001', 'ORIGIN_PORT'); // Busan
        addLink(route.id, 'PORT-002', 'DESTINATION_PORT'); // LA
        addLink('PORT-001', route.id, 'SERVES_ROUTE');
        addLink('PORT-002', route.id, 'SERVES_ROUTE');
      } else if (route.code.includes('EU')) {
        addLink(route.id, 'PORT-001', 'ORIGIN_PORT'); // Busan
        addLink(route.id, 'PORT-003', 'DESTINATION_PORT'); // Hamburg
        addLink('PORT-001', route.id, 'SERVES_ROUTE');
        addLink('PORT-003', route.id, 'SERVES_ROUTE');
      } else if (route.code.includes('CN')) {
        addLink(route.id, 'PORT-001', 'ORIGIN_PORT'); // Busan
        addLink(route.id, 'PORT-004', 'DESTINATION_PORT'); // Shanghai
        addLink('PORT-001', route.id, 'SERVES_ROUTE');
        addLink('PORT-004', route.id, 'SERVES_ROUTE');
      }
    });

    // 5. 부킹 생성 및 관계 설정
    let bookingCounter = 1000;
    shippers.forEach(shipper => {
      const numBookings = 2 + Math.floor(Math.random() * 4);
      let previousBookingId = null;

      for (let k = 0; k < numBookings; k++) {
        const bkId = `BK-${bookingCounter++}`;
        const status = Math.random() > 0.8 ? 'Cancelled' : (Math.random() > 0.5 ? 'Shipped' : 'Confirmed');
        const qty = 10 + Math.floor(Math.random() * 50);
        
        addNode(bkId, 2, bkId, 'BOOKING', 12, { 
          status, 
          quantity: `${qty} TEU`, 
          date: `2024-12-${10 + k}`,
          shipper: shipper.name,
          uri: `${ONTOLOGY_CLASSES.BOOKING}/${bkId}` 
        });

        // 부킹 관계 설정
        addLink(shipper.id, bkId, 'MAKES_BOOKING');
        addLink(bkId, shipper.id, 'BOOKED_BY');
        
        const route = routes[Math.floor(Math.random() * routes.length)];
        addLink(bkId, route.id, 'ON_ROUTE');
        addLink(route.id, bkId, 'HAS_BOOKING');
        
        const vessel = vessels[Math.floor(Math.random() * vessels.length)];
        addLink(bkId, vessel.id, 'USES_VESSEL');
        addLink(vessel.id, bkId, 'CARRIES_BOOKING');
        
        // 계약 적용
        const shipperContract = contracts.find(c => c.shipper === shipper.id);
        if (shipperContract) {
          addLink(bkId, shipperContract.id, 'APPLIES_CONTRACT');
          addLink(shipperContract.id, bkId, 'GOVERNS_BOOKING');
        }

        // 화물 관계
        const cargo = cargos.find(cg => 
          (shipper.industry === 'Electronics' && cg.type === 'Electronics') ||
          (shipper.industry === 'Chemicals' && cg.type === 'Chemicals') ||
          (shipper.industry === 'Auto Parts' && cg.type === 'Auto Parts')
        );
        if (cargo) {
          addLink(bkId, cargo.id, 'CONTAINS_CARGO');
          addLink(cargo.id, bkId, 'LOADED_IN');
        }

        if (previousBookingId) {
          addLink(previousBookingId, bkId, 'FOLLOWED_BY');
        }
        previousBookingId = bkId;
      }

      // 영업 활동 생성
      const actId = `ACT-${shipper.id.split('-')[1]}`;
      addNode(actId, 7, `${shipper.name} Meeting`, 'SALES_ACTIVITY', 10, { 
        type: 'Customer Visit', 
        date: '2024-12-05',
        shipper: shipper.name,
        uri: `${ONTOLOGY_CLASSES.SALES_ACTIVITY}/${actId}` 
      });
      addLink(shipper.id, actId, 'HAS_ACTIVITY');
      addLink(actId, shipper.id, 'TARGETS');
    });

    // 6. 시장 지표 관계
    routes.forEach(route => {
      addLink(route.id, 'IDX-SCFI', 'INFLUENCED_BY');
      addLink('IDX-SCFI', route.id, 'AFFECTS');
      
      addLink(route.id, 'IDX-WCI', 'INFLUENCED_BY');
      addLink('IDX-WCI', route.id, 'AFFECTS');
    });

    vessels.forEach(vessel => {
      addLink(vessel.id, 'IDX-BAF', 'AFFECTED_BY');
      addLink('IDX-BAF', vessel.id, 'IMPACTS');
    });

    // 7. 경쟁 관계
    competitors.forEach(comp => {
      routes.forEach(route => {
        if (Math.random() > 0.6) { // 60% 확률로 경쟁
          addLink(comp.id, route.id, 'COMPETES_ON');
          addLink(route.id, comp.id, 'HAS_COMPETITOR');
        }
      });
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
        case 'SHIPPER': return '#2563eb'; // Blue 600 - 화주
        case 'BOOKING': return '#10b981'; // Emerald 500 - 부킹
        case 'ROUTE': return '#f59e0b';   // Amber 500 - 항로
        case 'VESSEL': return '#6366f1';  // Indigo 500 - 선박
        case 'CONTRACT': return '#8b5cf6'; // Violet 500 - 계약
        case 'MARKET_INDEX': return '#ef4444'; // Red 500 - 시장지표
        case 'COMPETITOR': return '#64748b'; // Slate 500 - 경쟁사
        case 'SALES_ACTIVITY': return '#ec4899'; // Pink 500 - 영업활동
        case 'SHIP_OWNER': return '#059669'; // Emerald 600 - 선주
        case 'PORT': return '#0891b2'; // Cyan 600 - 항만
        case 'CARGO': return '#dc2626'; // Red 600 - 화물
        case 'TERMINAL': return '#7c3aed'; // Violet 600 - 터미널
        case 'FREIGHT_FORWARDER': return '#ea580c'; // Orange 600 - 포워더
        case 'INSURANCE': return '#16a34a'; // Green 600 - 보험
        case 'CUSTOMS': return '#9333ea'; // Purple 600 - 관세청
        default: return '#94a3b8';
      }
    };

    if (viewMode === 'FORCE') {
        // --- FORCE DIRECTED LAYOUT ---
        let simulation;
        
        if (currentLayout === 'hierarchical') {
          // 계층형 레이아웃
          simulation = d3.forceSimulation(filteredNodes as any)
            .force("link", d3.forceLink(filteredLinks).id((d: any) => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY().y((d: any) => {
              // 타입별로 Y 위치 계층화
              const typeOrder = ['SHIPPER', 'BOOKING', 'ROUTE', 'VESSEL', 'CONTRACT', 'MARKET_INDEX', 'COMPETITOR', 'SALES_ACTIVITY'];
              const index = typeOrder.indexOf(d.type);
              return (height / (typeOrder.length + 1)) * (index + 1);
            }).strength(0.5));
        } else if (currentLayout === 'grid') {
          // 격자형 레이아웃
          const cols = Math.ceil(Math.sqrt(filteredNodes.length));
          const cellWidth = width / cols;
          const cellHeight = height / Math.ceil(filteredNodes.length / cols);
          
          simulation = d3.forceSimulation(filteredNodes as any)
            .force("link", d3.forceLink(filteredLinks).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("x", d3.forceX().x((d: any, i: number) => {
              const col = i % cols;
              return col * cellWidth + cellWidth / 2;
            }).strength(0.8))
            .force("y", d3.forceY().y((d: any, i: number) => {
              const row = Math.floor(i / cols);
              return row * cellHeight + cellHeight / 2;
            }).strength(0.8));
        } else {
          // 기본 Force 레이아웃
          simulation = d3.forceSimulation(filteredNodes as any)
            .force("link", d3.forceLink(filteredLinks).id((d: any) => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(40));
        }

        // Links
        const link = g.append("g")
          .attr("stroke", "#94a3b8")
          .attr("stroke-opacity", 0.7)
          .selectAll("line")
          .data(filteredLinks)
          .join("line")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");

        // Link Labels (관계 표시) - 선택적 표시로 겹침 방지
        const linkLabel = g.append("g")
          .selectAll("text")
          .data(filteredLinks.filter((d, i) => i % 3 === 0)) // 3개 중 1개만 표시
          .join("text")
          .text(d => d.relationship)
          .attr("font-size", "10px")
          .attr("font-weight", "600")
          .attr("fill", "#475569")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", "2px")
          .attr("paint-order", "stroke fill")
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

        // Labels - 가독성 개선 및 위치 최적화
        const label = g.append("g")
          .selectAll("text")
          .data(filteredNodes)
          .join("text")
          .text(d => d.label)
          .attr("font-size", (d) => d.type === 'BOOKING' ? "9px" : "12px")
          .attr("font-weight", (d) => d.type === 'BOOKING' ? "500" : "600")
          .attr("font-family", "'Inter', 'Segoe UI', 'Apple SD Gothic Neo', sans-serif")
          .attr("text-anchor", "middle")
          .attr("fill", "#1e293b")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", "2px")
          .attr("paint-order", "stroke fill")
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
            .attr("y", (d: any) => d.y + (d.type === 'BOOKING' ? 15 : Math.max(18, Math.sqrt(d.val) * 4) + 8));
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
        // --- RADIAL/CIRCULAR LAYOUT ---
        if (currentLayout === 'circular') {
          // 원형 레이아웃 - 모든 노드를 원형으로 배치
          const cx = width / 2;
          const cy = height / 2;
          const radius = Math.min(width, height) / 3;
          const angleStep = (2 * Math.PI) / filteredNodes.length;
          
          filteredNodes.forEach((node, i) => {
            const angle = i * angleStep;
            (node as any).x = cx + radius * Math.cos(angle);
            (node as any).y = cy + radius * Math.sin(angle);
          });
          
          // 원형 레이아웃용 링크와 노드 그리기
          const linkGroup = g.append("g");
          
          const link = linkGroup
            .selectAll("line")
            .data(filteredLinks)
            .join("line")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2)
            .attr("x1", (d: any) => {
              const sourceNode = filteredNodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
              return (sourceNode as any)?.x || 0;
            })
            .attr("y1", (d: any) => {
              const sourceNode = filteredNodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
              return (sourceNode as any)?.y || 0;
            })
            .attr("x2", (d: any) => {
              const targetNode = filteredNodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
              return (targetNode as any)?.x || 0;
            })
            .attr("y2", (d: any) => {
              const targetNode = filteredNodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
              return (targetNode as any)?.y || 0;
            });

          const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .selectAll("circle")
            .data(filteredNodes)
            .join("circle")
            .attr("cx", (d: any) => d.x)
            .attr("cy", (d: any) => d.y)
            .attr("r", 15)
            .attr("fill", (d) => colorScale(d.type))
            .attr("cursor", "pointer")
            .on("click", (event, d) => {
              setSelectedNode(d);
              event.stopPropagation();
            });

          const label = g.append("g")
            .selectAll("text")
            .data(filteredNodes)
            .join("text")
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y + 25)
            .text(d => d.label)
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("font-family", "'Inter', 'Segoe UI', 'Apple SD Gothic Neo', sans-serif")
            .attr("text-anchor", "middle")
            .attr("fill", "#1e293b")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "2px")
            .attr("paint-order", "stroke fill")
            .style("pointer-events", "none");
            
          g.append("text")
            .attr("x", cx)
            .attr("y", cy - 60)
            .text("CIRCULAR LAYOUT")
            .attr("font-size", "14px")
            .attr("font-weight", "700")
            .attr("font-family", "'Inter', 'Segoe UI', sans-serif")
            .attr("fill", "#1e40af")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "2px")
            .attr("paint-order", "stroke fill")
            .attr("text-anchor", "middle")
            .style("opacity", 0.7);
            
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
          .attr("marker-end", "url(#arrowhead-radial)")
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

        // Link Labels for Radial (관계 표시) - 선택적 표시
        const linkLabelRadial = linkGroup
          .selectAll("text")
          .data(radialLinks.filter((d, i) => i % 2 === 0)) // 2개 중 1개만 표시
          .join("text")
          .text(d => d.relationship)
          .attr("font-size", "10px")
          .attr("font-weight", "600")
          .attr("font-family", "'Inter', 'Segoe UI', sans-serif")
          .attr("fill", "#475569")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", "2px")
          .attr("paint-order", "stroke fill")
          .attr("text-anchor", "middle")
          .attr("dy", -3)
          .style("pointer-events", "none")
          .style("opacity", 0.8)
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
            
            // radialNodes 배열에서도 위치 업데이트
            const nodeInArray = radialNodes.find(n => n.id === d.id);
            if (nodeInArray) {
              nodeInArray.x = event.x;
              nodeInArray.y = event.y;
            }
            
            // 노드 원 위치 업데이트
            d3.select(event.sourceEvent.target)
              .attr("cx", d.x)
              .attr("cy", d.y);
            
            // 라벨 위치 업데이트
            label.filter((n: any) => n.id === d.id)
              .attr("x", d.x)
              .attr("y", d.y + (d.id === centerId ? 50 : 25));
            
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

        // Labels - 가독성 개선 및 위치 최적화
        const label = g.append("g")
          .selectAll("text")
          .data(radialNodes)
          .join("text")
          .attr("x", (d:any) => d.x)
          .attr("y", (d:any) => d.y + (d.id === centerId ? 50 : 25))
          .text(d => d.label)
          .attr("font-size", (d:any) => d.id === centerId ? "14px" : "11px")
          .attr("font-weight", (d:any) => d.id === centerId ? "700" : "600")
          .attr("font-family", "'Inter', 'Segoe UI', 'Apple SD Gothic Neo', sans-serif")
          .attr("text-anchor", "middle")
          .attr("fill", "#1e293b")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", (d:any) => d.id === centerId ? "3px" : "2px")
          .attr("paint-order", "stroke fill")
          .style("pointer-events", "none");
          
          // Title for Radial - 가독성 개선
          g.append("text")
              .attr("x", cx)
              .attr("y", cy - 70)
              .text("SHIPPER CENTRIC VIEW")
              .attr("font-size", "14px")
              .attr("font-weight", "700")
              .attr("font-family", "'Inter', 'Segoe UI', sans-serif")
              .attr("fill", "#1e40af")
              .attr("stroke", "#ffffff")
              .attr("stroke-width", "2px")
              .attr("paint-order", "stroke fill")
              .attr("text-anchor", "middle")
              .style("opacity", 0.7);
        }
    }

  }, [filteredNodes, filteredLinks, viewMode, currentLayout, zoom]);

  // Handle Layout Change
  const handleLayoutChange = (layout: 'force' | 'radial' | 'hierarchical' | 'circular' | 'grid') => {
    setCurrentLayout(layout);
    
    // 레이아웃에 따라 viewMode 설정
    switch (layout) {
      case 'force':
        setViewMode('FORCE');
        break;
      case 'radial':
        setViewMode('RADIAL');
        break;
      case 'hierarchical':
        setViewMode('FORCE'); // 계층형도 Force 기반으로 구현
        break;
      case 'circular':
        setViewMode('RADIAL'); // 원형도 Radial 기반으로 구현
        break;
      case 'grid':
        setViewMode('FORCE'); // 격자도 Force 기반으로 구현
        break;
    }
    
    console.log('Layout changed to:', layout);
  };

  // Handle Filter Change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // 노드 타입 필터 적용
    if (newFilters.nodeTypes.length > 0) {
      const typeMap: { [key: string]: EntityType } = {
        'shipper': 'SHIPPER',
        'shipOwner': 'SHIP_OWNER',
        'route': 'ROUTE',
        'booking': 'BOOKING',
        'vessel': 'VESSEL',
        'contract': 'CONTRACT',
        'port': 'PORT',
        'cargo': 'CARGO',
        'freightForwarder': 'FREIGHT_FORWARDER',
        'insurance': 'INSURANCE',
        'marketIndex': 'MARKET_INDEX',
        'competitor': 'COMPETITOR'
      };
      
      // 첫 번째 활성화된 타입으로 필터 설정
      const firstActiveType = newFilters.nodeTypes[0];
      if (typeMap[firstActiveType]) {
        setFilterType(typeMap[firstActiveType]);
      }
    } else {
      setFilterType('ALL');
    }
    
    console.log('Filters changed:', newFilters);
  };

  // Handle Zoom Change
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const scale = newZoom / 100;
    
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity.scale(scale)
    );
    
    console.log('Zoom changed to:', newZoom);
  };

  // Handle Export
  const handleExport = (format: 'png' | 'svg' | 'json') => {
    if (!svgRef.current) return;
    
    switch (format) {
      case 'png':
        // PNG 내보내기 구현
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'ontology-graph.png';
          downloadLink.click();
          
          URL.revokeObjectURL(url);
        };
        img.src = url;
        break;
        
      case 'svg':
        // SVG 내보내기 구현
        const svgDataStr = new XMLSerializer().serializeToString(svgRef.current);
        const svgBlobSvg = new Blob([svgDataStr], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlobSvg);
        const downloadLinkSvg = document.createElement('a');
        downloadLinkSvg.href = svgUrl;
        downloadLinkSvg.download = 'ontology-graph.svg';
        downloadLinkSvg.click();
        URL.revokeObjectURL(svgUrl);
        break;
        
      case 'json':
        // JSON 내보내기 구현
        const graphData = { nodes: filteredNodes, links: filteredLinks };
        const jsonStr = JSON.stringify(graphData, null, 2);
        const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const downloadLinkJson = document.createElement('a');
        downloadLinkJson.href = jsonUrl;
        downloadLinkJson.download = 'ontology-graph.json';
        downloadLinkJson.click();
        URL.revokeObjectURL(jsonUrl);
        break;
    }
    
    console.log('Exported as:', format);
  };

  // Handle Fit to Screen (Reset Zoom)
  const handleResetZoom = () => {
     if (!svgRef.current || !containerRef.current) return;
     const svg = d3.select(svgRef.current);
     svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(0, 0).scale(1)
     );
     setZoom(100);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 text-slate-900 dark:text-slate-100">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col" ref={containerRef}>
        
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50 z-10">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-blue-600"/> {t.title[lang]} 
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full ml-2">
              {viewMode === 'FORCE' ? `${filteredNodes.length} Nodes` : 'Radial View'}
            </span>
          </h2>
          <div className="flex items-center gap-2">
             {/* View Mode Toggle */}
             <div className="flex bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-0.5">
                <button 
                    onClick={() => setViewMode('FORCE')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 transition ${viewMode === 'FORCE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <Share2 className="w-3 h-3"/> {t.viewOverall[lang]}
                </button>
                <button 
                    onClick={() => setViewMode('RADIAL')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 transition ${viewMode === 'RADIAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'}`}
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
                      className="bg-transparent text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="ALL">All Entities</option>
                      <option value="SHIPPER">Shipper (화주)</option>
                      <option value="SHIP_OWNER">Ship Owner (선주)</option>
                      <option value="BOOKING">Booking (부킹)</option>
                      <option value="ROUTE">Route (항로)</option>
                      <option value="VESSEL">Vessel (선박)</option>
                      <option value="CONTRACT">Contract (계약)</option>
                      <option value="PORT">Port (항만)</option>
                      <option value="CARGO">Cargo (화물)</option>
                      <option value="FREIGHT_FORWARDER">Forwarder (포워더)</option>
                      <option value="INSURANCE">Insurance (보험)</option>
                    </select>
                 </div>
             )}
             
             <button onClick={handleResetZoom} className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200" title={t.reset[lang]}><RefreshCw className="w-3 h-3"/></button>
          </div>
        </div>

        <svg ref={svgRef} className="flex-1 w-full bg-slate-50 dark:bg-slate-900 cursor-move"></svg>
        
        {/* Legend - 확장된 화주 온톨로지 (가독성 개선) */}
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs font-semibold grid grid-cols-3 gap-x-5 gap-y-3 pointer-events-none max-w-lg">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.shipper[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.shipOwner[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.booking[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.route[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.vessel[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.contract[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.port[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.cargo[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.freightForwarder[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.insurance[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.marketIndex[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.competitor[lang]}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm"></span> <span className="text-slate-700 dark:text-slate-200">{t.activity[lang]}</span></div>
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
                 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.entityId[lang]}</label>
                 <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 break-all font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    {selectedNode.properties?.uri || selectedNode.id}
                 </p>
               </div>

               {/* Type */}
               <div>
                 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.type[lang]}</label>
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
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.properties[lang]}</label>
                   <div className="mt-2 space-y-2">
                     {Object.entries(selectedNode.properties).filter(([k]) => k !== 'uri').map(([key, value]) => (
                       <div key={key} className="flex justify-between items-start text-sm border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
                         <span className="text-slate-600 dark:text-slate-400 capitalize text-sm font-medium">{key.replace('_', ' ')}</span>
                         <span className="font-semibold text-slate-900 dark:text-slate-200 text-sm text-right max-w-[60%]">{value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Object Properties (Relations) */}
               <div>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.relations[lang]}</label>
                   <div className="mt-2 space-y-2">
                        {links.filter(l => l.source === selectedNode.id).map((link, idx) => (
                             <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                 <span className="text-blue-600 dark:text-blue-400 font-bold">{link.relationship}</span>
                                 <span className="text-slate-500 dark:text-slate-400">→</span>
                                 <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{nodes.find(n => n.id === link.target)?.label || link.target}</span>
                             </div>
                        ))}
                   </div>
               </div>

             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Layers className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
               <p className="text-sm text-center font-semibold text-slate-600 dark:text-slate-400">{t.noSelection[lang]}</p>
             </div>
           )}
         </div>
      </div>

      {/* Knowledge Graph Panel - 하단 슬라이드업 */}
      <KnowledgeGraphPanel 
        lang={lang} 
        selectedNode={selectedNode}
        onSearch={(query) => {
          // 검색 로직: 노드 필터링
          console.log('Search query:', query);
          // 실제로는 그래프 필터링 구현
        }}
      />

      {/* Ontology Visualization Controller - 우측 레이아웃 컨트롤 */}
      <OntologyVisualizationController
        lang={lang}
        onLayoutChange={handleLayoutChange}
        onFilterChange={handleFilterChange}
        onZoomChange={handleZoomChange}
        onExport={handleExport}
      />
    </div>
  );
};

export default KnowledgeGraph;