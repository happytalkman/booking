# 고급 기능 설계 방안

## 🚀 자동 부킹 시스템 설계

### 1. 시스템 아키텍처

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (REST/GraphQL)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Backend Services               │
│  ┌──────────────────────────────┐  │
│  │  Booking Automation Engine   │  │
│  │  - Rule Engine               │  │
│  │  - Condition Matcher         │  │
│  │  - Approval Workflow         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Market Monitoring Service   │  │
│  │  - Rate Tracker              │  │
│  │  - Alert Generator           │  │
│  │  - Event Processor           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Booking Execution Service   │  │
│  │  - API Integration           │  │
│  │  - Transaction Manager       │  │
│  │  - Rollback Handler          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│  - PostgreSQL   │
│  - Redis Cache  │
└─────────────────┘
```

### 2. 데이터베이스 스키마

```sql
-- 자동 부킹 규칙 테이블
CREATE TABLE auto_booking_rules (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    route VARCHAR(100) NOT NULL,
    
    -- 조건 설정
    trigger_type VARCHAR(50) NOT NULL, -- 'rate_drop', 'time_based', 'capacity_available'
    rate_threshold DECIMAL(10,2),
    time_window JSONB, -- {"start": "2024-01-01", "end": "2024-12-31"}
    
    -- 부킹 설정
    container_type VARCHAR(50),
    quantity INTEGER,
    max_rate DECIMAL(10,2),
    
    -- 승인 워크플로우
    requires_approval BOOLEAN DEFAULT true,
    approval_level INTEGER DEFAULT 1, -- 1: Manager, 2: Director, 3: VP
    
    -- 상태
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 자동 부킹 실행 이력
CREATE TABLE auto_booking_executions (
    id UUID PRIMARY KEY,
    rule_id UUID REFERENCES auto_booking_rules(id),
    
    -- 실행 정보
    triggered_at TIMESTAMP NOT NULL,
    trigger_reason TEXT,
    market_rate DECIMAL(10,2),
    
    -- 승인 프로세스
    status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected', 'executed', 'failed'
    approved_by UUID,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- 부킹 결과
    booking_id VARCHAR(100),
    final_rate DECIMAL(10,2),
    execution_result JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 승인 워크플로우 테이블
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY,
    execution_id UUID REFERENCES auto_booking_executions(id),
    
    approver_id UUID NOT NULL,
    approval_level INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected'
    
    comments TEXT,
    decided_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 시장 모니터링 이벤트
CREATE TABLE market_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    route VARCHAR(100) NOT NULL,
    
    rate_before DECIMAL(10,2),
    rate_after DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. 백엔드 API 설계

#### 3.1 규칙 관리 API

```typescript
// POST /api/auto-booking/rules
interface CreateRuleRequest {
  ruleName: string;
  route: string;
  triggerType: 'rate_drop' | 'time_based' | 'capacity_available';
  conditions: {
    rateThreshold?: number;
    timeWindow?: { start: Date; end: Date };
    capacityMin?: number;
  };
  bookingConfig: {
    containerType: string;
    quantity: number;
    maxRate: number;
  };
  approvalSettings: {
    requiresApproval: boolean;
    approvalLevel: number;
  };
}

// GET /api/auto-booking/rules
// PUT /api/auto-booking/rules/:id
// DELETE /api/auto-booking/rules/:id
```

#### 3.2 실행 및 승인 API

```typescript
// GET /api/auto-booking/executions
// GET /api/auto-booking/executions/:id

// POST /api/auto-booking/executions/:id/approve
interface ApproveRequest {
  comments?: string;
}

// POST /api/auto-booking/executions/:id/reject
interface RejectRequest {
  reason: string;
}
```

### 4. 규칙 엔진 구현 (Node.js/TypeScript)

```typescript
class BookingRuleEngine {
  async evaluateRules(): Promise<void> {
    const activeRules = await this.getActiveRules();
    
    for (const rule of activeRules) {
      const shouldTrigger = await this.checkTriggerConditions(rule);
      
      if (shouldTrigger) {
        await this.createExecution(rule);
      }
    }
  }

  private async checkTriggerConditions(rule: AutoBookingRule): Promise<boolean> {
    switch (rule.triggerType) {
      case 'rate_drop':
        const currentRate = await this.getCurrentRate(rule.route);
        return currentRate <= rule.rateThreshold;
        
      case 'time_based':
        const now = new Date();
        return now >= rule.timeWindow.start && now <= rule.timeWindow.end;
        
      case 'capacity_available':
        const capacity = await this.getAvailableCapacity(rule.route);
        return capacity >= rule.capacityMin;
        
      default:
        return false;
    }
  }

  private async createExecution(rule: AutoBookingRule): Promise<void> {
    const execution = await db.autoBookingExecutions.create({
      ruleId: rule.id,
      triggeredAt: new Date(),
      status: rule.requiresApproval ? 'pending' : 'approved',
      marketRate: await this.getCurrentRate(rule.route)
    });

    if (rule.requiresApproval) {
      await this.createApprovalWorkflow(execution, rule.approvalLevel);
      await this.sendApprovalNotification(execution);
    } else {
      await this.executeBooking(execution);
    }
  }

  private async executeBooking(execution: AutoBookingExecution): Promise<void> {
    try {
      // Call external booking API
      const result = await bookingAPI.createBooking({
        route: execution.rule.route,
        containerType: execution.rule.containerType,
        quantity: execution.rule.quantity,
        rate: execution.marketRate
      });

      await db.autoBookingExecutions.update(execution.id, {
        status: 'executed',
        bookingId: result.bookingId,
        finalRate: result.finalRate,
        executionResult: result
      });

      await this.sendSuccessNotification(execution);
    } catch (error) {
      await db.autoBookingExecutions.update(execution.id, {
        status: 'failed',
        executionResult: { error: error.message }
      });

      await this.sendFailureNotification(execution, error);
    }
  }
}
```

### 5. 승인 워크플로우 구현

```typescript
class ApprovalWorkflowService {
  async createWorkflow(execution: AutoBookingExecution, level: number): Promise<void> {
    const approvers = await this.getApprovers(level);
    
    for (const approver of approvers) {
      await db.approvalWorkflows.create({
        executionId: execution.id,
        approverId: approver.id,
        approvalLevel: level,
        status: 'pending'
      });
    }
  }

  async approve(workflowId: string, approverId: string, comments?: string): Promise<void> {
    const workflow = await db.approvalWorkflows.findById(workflowId);
    
    await db.approvalWorkflows.update(workflowId, {
      status: 'approved',
      comments,
      decidedAt: new Date()
    });

    // Check if all required approvals are complete
    const allApproved = await this.checkAllApproved(workflow.executionId);
    
    if (allApproved) {
      const execution = await db.autoBookingExecutions.findById(workflow.executionId);
      await this.ruleEngine.executeBooking(execution);
    }
  }

  async reject(workflowId: string, approverId: string, reason: string): Promise<void> {
    await db.approvalWorkflows.update(workflowId, {
      status: 'rejected',
      comments: reason,
      decidedAt: new Date()
    });

    const workflow = await db.approvalWorkflows.findById(workflowId);
    await db.autoBookingExecutions.update(workflow.executionId, {
      status: 'rejected',
      rejectionReason: reason
    });
  }
}
```

### 6. 프론트엔드 구현 예시

```typescript
// components/AutoBookingRuleCreator.tsx
const AutoBookingRuleCreator: React.FC = () => {
  const [rule, setRule] = useState({
    ruleName: '',
    route: 'kr-la',
    triggerType: 'rate_drop',
    rateThreshold: 2500,
    containerType: '40HC',
    quantity: 10,
    maxRate: 2800,
    requiresApproval: true,
    approvalLevel: 1
  });

  const handleSubmit = async () => {
    await api.post('/auto-booking/rules', rule);
    // Show success message
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

## 🛰️ IoT 선박 추적 시스템 설계

### 1. 시스템 아키텍처

```
┌──────────────────────────────────────┐
│         IoT Devices (선박)            │
│  - GPS Tracker                       │
│  - AIS Transponder                   │
│  - Sensor Network                    │
└────────────┬─────────────────────────┘
             │ MQTT/HTTP
             ▼
┌──────────────────────────────────────┐
│      IoT Gateway / Edge Computing    │
│  - Data Aggregation                  │
│  - Protocol Translation              │
│  - Edge Analytics                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Message Queue (Kafka/RabbitMQ)  │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Stream Processing               │
│  - Apache Kafka Streams              │
│  - Real-time Analytics               │
│  - Anomaly Detection                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Data Storage                    │
│  - Time Series DB (InfluxDB)         │
│  - PostgreSQL (Metadata)             │
│  - Redis (Real-time Cache)           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Backend API                     │
│  - REST API                          │
│  - WebSocket (Real-time)             │
│  - GraphQL                           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Frontend (React)                │
│  - Real-time Map                     │
│  - Vessel Dashboard                  │
│  - Alert System                      │
└──────────────────────────────────────┘
```

### 2. 데이터 모델

```sql
-- 선박 정보
CREATE TABLE vessels (
    id UUID PRIMARY KEY,
    vessel_name VARCHAR(255) NOT NULL,
    imo_number VARCHAR(20) UNIQUE NOT NULL,
    mmsi VARCHAR(20) UNIQUE,
    
    vessel_type VARCHAR(50),
    capacity_teu INTEGER,
    
    operator_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 선박 위치 (Time Series)
CREATE TABLE vessel_positions (
    time TIMESTAMPTZ NOT NULL,
    vessel_id UUID NOT NULL,
    
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION, -- knots
    heading DOUBLE PRECISION, -- degrees
    
    status VARCHAR(50), -- 'underway', 'at_anchor', 'moored', 'not_under_command'
    
    PRIMARY KEY (time, vessel_id)
);

-- 항해 정보
CREATE TABLE voyages (
    id UUID PRIMARY KEY,
    vessel_id UUID REFERENCES vessels(id),
    
    voyage_number VARCHAR(50) NOT NULL,
    route VARCHAR(100) NOT NULL,
    
    origin_port VARCHAR(100),
    destination_port VARCHAR(100),
    
    scheduled_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    
    status VARCHAR(50), -- 'scheduled', 'in_progress', 'delayed', 'completed'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 센서 데이터
CREATE TABLE sensor_readings (
    time TIMESTAMPTZ NOT NULL,
    vessel_id UUID NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    
    metadata JSONB,
    
    PRIMARY KEY (time, vessel_id, sensor_type)
);

-- 알림 및 이벤트
CREATE TABLE vessel_events (
    id UUID PRIMARY KEY,
    vessel_id UUID REFERENCES vessels(id),
    voyage_id UUID REFERENCES voyages(id),
    
    event_type VARCHAR(50) NOT NULL, -- 'delay', 'arrival', 'departure', 'alert'
    severity VARCHAR(20), -- 'info', 'warning', 'critical'
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    location JSONB, -- {"lat": 37.5, "lon": 126.9}
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. IoT 데이터 수집 (MQTT)

```typescript
// IoT Gateway Service
import mqtt from 'mqtt';
import { Kafka } from 'kafkajs';

class IoTGatewayService {
  private mqttClient: mqtt.MqttClient;
  private kafkaProducer: any;

  constructor() {
    // Connect to MQTT broker
    this.mqttClient = mqtt.connect('mqtt://iot-broker.example.com', {
      clientId: 'vessel-tracking-gateway',
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    });

    // Connect to Kafka
    const kafka = new Kafka({
      clientId: 'iot-gateway',
      brokers: ['kafka:9092']
    });
    this.kafkaProducer = kafka.producer();
  }

  async start(): Promise<void> {
    await this.kafkaProducer.connect();

    // Subscribe to vessel topics
    this.mqttClient.subscribe('vessels/+/position');
    this.mqttClient.subscribe('vessels/+/sensors/#');

    this.mqttClient.on('message', async (topic, message) => {
      await this.handleMessage(topic, message);
    });
  }

  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const data = JSON.parse(message.toString());
      
      // Parse topic: vessels/{vessel_id}/position
      const parts = topic.split('/');
      const vesselId = parts[1];
      const dataType = parts[2];

      // Enrich data
      const enrichedData = {
        ...data,
        vesselId,
        dataType,
        receivedAt: new Date().toISOString()
      };

      // Send to Kafka for processing
      await this.kafkaProducer.send({
        topic: 'vessel-telemetry',
        messages: [{
          key: vesselId,
          value: JSON.stringify(enrichedData)
        }]
      });

      // Cache in Redis for real-time access
      await redis.set(
        `vessel:${vesselId}:latest`,
        JSON.stringify(enrichedData),
        'EX',
        300 // 5 minutes TTL
      );

    } catch (error) {
      console.error('Error handling IoT message:', error);
    }
  }
}
```

### 4. 실시간 스트림 처리

```typescript
// Stream Processing Service
import { Kafka } from 'kafkajs';

class VesselStreamProcessor {
  private kafka: Kafka;
  private consumer: any;

  async start(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'vessel-processor' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'vessel-telemetry' });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        
        await this.processVesselData(data);
      }
    });
  }

  private async processVesselData(data: any): Promise<void> {
    // Store in time-series database
    await influxDB.writePoint({
      measurement: 'vessel_position',
      tags: {
        vessel_id: data.vesselId
      },
      fields: {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading
      },
      timestamp: new Date(data.timestamp)
    });

    // Calculate ETA
    const eta = await this.calculateETA(data);
    
    // Detect delays
    const isDelayed = await this.detectDelay(data, eta);
    
    if (isDelayed) {
      await this.createDelayAlert(data, eta);
    }

    // Update voyage status
    await this.updateVoyageStatus(data);

    // Broadcast to WebSocket clients
    await this.broadcastUpdate(data);
  }

  private async calculateETA(data: any): Promise<Date> {
    const voyage = await db.voyages.findByVesselId(data.vesselId);
    const destination = await this.getPortCoordinates(voyage.destinationPort);
    
    const distance = this.calculateDistance(
      data.latitude,
      data.longitude,
      destination.lat,
      destination.lon
    );

    const averageSpeed = data.speed || 15; // knots
    const hoursRemaining = distance / averageSpeed;
    
    return new Date(Date.now() + hoursRemaining * 3600 * 1000);
  }

  private async detectDelay(data: any, eta: Date): Promise<boolean> {
    const voyage = await db.voyages.findByVesselId(data.vesselId);
    
    if (!voyage.scheduledArrival) return false;
    
    const delayMinutes = (eta.getTime() - voyage.scheduledArrival.getTime()) / 60000;
    
    return delayMinutes > 60; // More than 1 hour delay
  }
}
```

### 5. 프론트엔드 실시간 맵 구현

```typescript
// components/VesselTrackingMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import io from 'socket.io-client';

const VesselTrackingMap: React.FC = () => {
  const [vessels, setVessels] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = io('wss://api.example.com', {
      path: '/vessel-tracking'
    });

    ws.on('vessel-update', (data) => {
      setVessels(prev => {
        const index = prev.findIndex(v => v.id === data.vesselId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
          return updated;
        }
        return [...prev, data];
      });
    });

    setSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, []);

  return (
    <MapContainer center={[37.5, 126.9]} zoom={6} style={{ height: '600px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {vessels.map(vessel => (
        <Marker 
          key={vessel.id}
          position={[vessel.latitude, vessel.longitude]}
          icon={createVesselIcon(vessel)}
        >
          <Popup>
            <div>
              <h3>{vessel.name}</h3>
              <p>Speed: {vessel.speed} knots</p>
              <p>Heading: {vessel.heading}°</p>
              <p>ETA: {vessel.eta}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

### 6. 데이터 소스 통합

#### 6.1 AIS 데이터 제공업체
- **MarineTraffic API**: https://www.marinetraffic.com/en/ais-api-services
- **VesselFinder API**: https://www.vesselfinder.com/api
- **AISHub**: https://www.aishub.net/

#### 6.2 GPS 트래커
- **Iridium Satellite**: 위성 기반 GPS
- **Inmarsat**: 해상 통신 및 위치 추적
- **Custom IoT Devices**: ESP32 + GPS Module

#### 6.3 포트 데이터
- **Port Authority APIs**: 각 항만청 API
- **Shipping Line APIs**: 선사별 스케줄 API

### 7. 비용 및 구현 일정

**예상 비용:**
- IoT 하드웨어: $500-2000/선박
- 클라우드 인프라: $2000-5000/월
- API 구독: $500-2000/월
- 개발 인력: 3-6개월

**구현 단계:**
1. Phase 1 (1개월): 기본 아키텍처 및 데이터 수집
2. Phase 2 (1개월): 스트림 처리 및 분석
3. Phase 3 (1개월): 프론트엔드 및 알림 시스템
4. Phase 4 (1개월): 테스트 및 최적화
5. Phase 5 (1개월): 프로덕션 배포

---

## 📝 결론

두 고급 기능 모두 구현 가능하지만, 상당한 시간과 리소스가 필요합니다:

- **자동 부킹 시스템**: 백엔드 중심, 3-4개월 소요
- **IoT 선박 추적**: 하드웨어 + 백엔드, 5-6개월 소요

단계적 접근을 권장하며, MVP부터 시작하여 점진적으로 기능을 확장하는 것이 좋습니다.
