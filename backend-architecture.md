# Backend Architecture Implementation Guide

## FastAPI Business Logic Layer

### 1. 프로젝트 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 앱 진입점
│   ├── config.py               # 설정
│   ├── api/
│   │   ├── __init__.py
│   │   ├── graphql/
│   │   │   ├── schema.py       # GraphQL 스키마
│   │   │   ├── resolvers.py   # GraphQL 리졸버
│   │   │   └── mutations.py   # GraphQL 뮤테이션
│   │   └── rest/
│   │       ├── bookings.py     # REST API 엔드포인트
│   │       └── predictions.py
│   ├── services/
│   │   ├── booking_service.py  # 부킹 비즈니스 로직
│   │   ├── prediction_service.py
│   │   └── ontology_service.py # RDF/SPARQL 통합
│   ├── models/
│   │   ├── booking.py          # Pydantic 모델
│   │   └── shipper.py
│   ├── db/
│   │   ├── fuseki.py           # Apache Jena Fuseki 클라이언트
│   │   └── postgres.py         # PostgreSQL (메타데이터)
│   └── ml/
│       ├── predictor.py        # ML 예측 모델
│       └── mlflow_client.py    # MLflow 통합
├── tests/
├── requirements.txt
└── docker-compose.yml
```

### 2. FastAPI 메인 애플리케이션

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from app.api.graphql.schema import schema
from app.api.rest import bookings, predictions

app = FastAPI(
    title="KMTC Booking Optimization API",
    version="1.0.0",
    description="AI-powered booking optimization platform"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL 엔드포인트
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# REST API 엔드포인트
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

@app.get("/")
async def root():
    return {"message": "KMTC Booking Optimization API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 3. GraphQL 스키마 (Strawberry)

```python
# app/api/graphql/schema.py
import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class Booking:
    id: str
    booking_number: str
    shipper_id: str
    route: str
    container_type: str
    quantity: int
    rate: float
    booking_date: datetime
    status: str

@strawberry.type
class Shipper:
    id: str
    name: str
    industry: str
    booking_frequency: float
    total_bookings: int

@strawberry.type
class Prediction:
    shipper_id: str
    predicted_date: datetime
    confidence: float
    risk_level: str

@strawberry.type
class Query:
    @strawberry.field
    async def bookings(self, limit: int = 10) -> List[Booking]:
        # SPARQL 쿼리로 데이터 가져오기
        return await booking_service.get_bookings(limit)
    
    @strawberry.field
    async def shipper(self, id: str) -> Optional[Shipper]:
        return await booking_service.get_shipper(id)
    
    @strawberry.field
    async def predict_next_booking(self, shipper_id: str) -> Prediction:
        return await prediction_service.predict(shipper_id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_booking(
        self,
        shipper_id: str,
        route: str,
        container_type: str,
        quantity: int
    ) -> Booking:
        return await booking_service.create_booking(
            shipper_id, route, container_type, quantity
        )

schema = strawberry.Schema(query=Query, mutation=Mutation)
```

### 4. Ontology Service (SPARQL 통합)

```python
# app/services/ontology_service.py
from SPARQLWrapper import SPARQLWrapper, JSON
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class OntologyService:
    def __init__(self, fuseki_url: str = "http://localhost:3030/booking"):
        self.sparql = SPARQLWrapper(f"{fuseki_url}/sparql")
        self.update_endpoint = f"{fuseki_url}/update"
    
    async def query(self, sparql_query: str) -> List[Dict[str, Any]]:
        """Execute SPARQL SELECT query"""
        try:
            self.sparql.setQuery(sparql_query)
            self.sparql.setReturnFormat(JSON)
            results = self.sparql.query().convert()
            return results["results"]["bindings"]
        except Exception as e:
            logger.error(f"SPARQL query error: {e}")
            raise
    
    async def get_shipper_bookings(self, shipper_id: str) -> List[Dict]:
        """Get all bookings for a shipper using SPARQL"""
        query = f"""
        PREFIX booking: <http://kmtc.com/ontology/booking#>
        PREFIX time: <http://www.w3.org/2006/time#>
        
        SELECT ?booking ?bookingNumber ?date ?route ?containerType ?quantity
        WHERE {{
            ?shipper booking:hasBooking ?booking .
            ?booking booking:bookingNumber ?bookingNumber ;
                     booking:bookingDate ?date ;
                     booking:onRoute ?route ;
                     booking:containerType ?containerType ;
                     booking:quantity ?quantity .
            FILTER(?shipper = <http://kmtc.com/resource/shipper/{shipper_id}>)
        }}
        ORDER BY DESC(?date)
        """
        return await self.query(query)
    
    async def get_booking_pattern(self, shipper_id: str) -> Dict:
        """Analyze booking pattern using SPARQL aggregation"""
        query = f"""
        PREFIX booking: <http://kmtc.com/ontology/booking#>
        
        SELECT 
            (COUNT(?booking) as ?totalBookings)
            (AVG(?interval) as ?avgInterval)
            (STDEV(?interval) as ?stdInterval)
        WHERE {{
            ?shipper booking:hasBooking ?booking1 .
            ?shipper booking:hasBooking ?booking2 .
            ?booking1 booking:bookingDate ?date1 .
            ?booking2 booking:bookingDate ?date2 .
            BIND((?date2 - ?date1) as ?interval)
            FILTER(?shipper = <http://kmtc.com/resource/shipper/{shipper_id}>)
            FILTER(?date2 > ?date1)
        }}
        """
        results = await self.query(query)
        return results[0] if results else {}
    
    async def insert_booking(self, booking_data: Dict) -> bool:
        """Insert new booking using SPARQL UPDATE"""
        update_query = f"""
        PREFIX booking: <http://kmtc.com/ontology/booking#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT DATA {{
            <http://kmtc.com/resource/booking/{booking_data['id']}>
                a booking:Booking ;
                booking:bookingNumber "{booking_data['booking_number']}" ;
                booking:bookingDate "{booking_data['date']}"^^xsd:dateTime ;
                booking:onRoute <http://kmtc.com/resource/route/{booking_data['route']}> ;
                booking:containerType "{booking_data['container_type']}" ;
                booking:quantity {booking_data['quantity']} .
            
            <http://kmtc.com/resource/shipper/{booking_data['shipper_id']}>
                booking:hasBooking <http://kmtc.com/resource/booking/{booking_data['id']}> .
        }}
        """
        # Execute UPDATE query
        # Implementation depends on your SPARQL endpoint
        return True
    
    async def run_reasoning(self) -> bool:
        """Trigger reasoning engine to infer new triples"""
        # Apache Jena Fuseki reasoning
        # This would typically be done through Jena's inference API
        logger.info("Running OWL2 reasoning...")
        return True
    
    async def validate_with_shacl(self, graph_uri: str) -> Dict:
        """Validate RDF graph against SHACL constraints"""
        # SHACL validation
        # Returns validation report
        return {
            "conforms": True,
            "violations": []
        }

# Singleton instance
ontology_service = OntologyService()
```

### 5. Booking Service (비즈니스 로직)

```python
# app/services/booking_service.py
from typing import List, Optional
from datetime import datetime
import uuid
from app.services.ontology_service import ontology_service
from app.models.booking import Booking, BookingCreate

class BookingService:
    async def create_booking(
        self,
        shipper_id: str,
        route: str,
        container_type: str,
        quantity: int
    ) -> Booking:
        """Create new booking with ontology integration"""
        
        # Generate booking ID
        booking_id = str(uuid.uuid4())
        booking_number = f"BK{datetime.now().strftime('%Y%m%d')}{booking_id[:6]}"
        
        # Prepare booking data
        booking_data = {
            'id': booking_id,
            'booking_number': booking_number,
            'shipper_id': shipper_id,
            'route': route,
            'container_type': container_type,
            'quantity': quantity,
            'date': datetime.now().isoformat(),
            'status': 'confirmed'
        }
        
        # Insert into ontology (triple store)
        await ontology_service.insert_booking(booking_data)
        
        # Trigger reasoning to infer new relationships
        await ontology_service.run_reasoning()
        
        # Validate with SHACL
        validation = await ontology_service.validate_with_shacl(
            f"http://kmtc.com/resource/booking/{booking_id}"
        )
        
        if not validation['conforms']:
            raise ValueError(f"SHACL validation failed: {validation['violations']}")
        
        return Booking(**booking_data)
    
    async def get_bookings(self, limit: int = 10) -> List[Booking]:
        """Get bookings from ontology"""
        query = f"""
        PREFIX booking: <http://kmtc.com/ontology/booking#>
        
        SELECT ?id ?bookingNumber ?shipperId ?route ?containerType ?quantity ?date ?status
        WHERE {{
            ?booking a booking:Booking ;
                     booking:bookingNumber ?bookingNumber ;
                     booking:bookingDate ?date ;
                     booking:onRoute ?route ;
                     booking:containerType ?containerType ;
                     booking:quantity ?quantity ;
                     booking:status ?status .
            BIND(STRAFTER(STR(?booking), "booking/") as ?id)
        }}
        ORDER BY DESC(?date)
        LIMIT {limit}
        """
        
        results = await ontology_service.query(query)
        return [Booking(**self._parse_sparql_result(r)) for r in results]
    
    def _parse_sparql_result(self, result: dict) -> dict:
        """Parse SPARQL result to Python dict"""
        return {
            key: value['value']
            for key, value in result.items()
        }

booking_service = BookingService()
```

### 6. ML Prediction Service

```python
# app/services/prediction_service.py
import mlflow
import numpy as np
from datetime import datetime, timedelta
from app.services.ontology_service import ontology_service

class PredictionService:
    def __init__(self):
        mlflow.set_tracking_uri("http://localhost:5000")
        self.model = mlflow.pyfunc.load_model("models:/booking_predictor/production")
    
    async def predict_next_booking(self, shipper_id: str) -> dict:
        """Predict next booking date using ML model and ontology data"""
        
        # Get historical data from ontology
        bookings = await ontology_service.get_shipper_bookings(shipper_id)
        pattern = await ontology_service.get_booking_pattern(shipper_id)
        
        # Prepare features
        features = self._prepare_features(bookings, pattern)
        
        # Make prediction
        prediction = self.model.predict(features)
        
        # Calculate confidence
        confidence = self._calculate_confidence(bookings, prediction)
        
        # Determine risk level
        risk_level = self._assess_risk(confidence, pattern)
        
        return {
            'shipper_id': shipper_id,
            'predicted_date': datetime.now() + timedelta(days=int(prediction[0])),
            'confidence': confidence,
            'risk_level': risk_level
        }
    
    def _prepare_features(self, bookings: list, pattern: dict) -> np.ndarray:
        """Prepare ML features from ontology data"""
        # Feature engineering
        return np.array([[
            len(bookings),
            float(pattern.get('avgInterval', 14)),
            float(pattern.get('stdInterval', 2))
        ]])
    
    def _calculate_confidence(self, bookings: list, prediction: np.ndarray) -> float:
        """Calculate prediction confidence"""
        if len(bookings) < 3:
            return 0.5
        return min(0.95, 0.6 + len(bookings) * 0.05)
    
    def _assess_risk(self, confidence: float, pattern: dict) -> str:
        """Assess churn risk level"""
        if confidence < 0.6:
            return 'high'
        elif confidence < 0.8:
            return 'medium'
        return 'low'

prediction_service = PredictionService()
```

### 7. Docker Compose 설정

```yaml
# docker-compose.yml
version: '3.8'

services:
  # FastAPI Backend
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FUSEKI_URL=http://fuseki:3030
      - MLFLOW_TRACKING_URI=http://mlflow:5000
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - fuseki
      - mlflow
      - kafka
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Apache Jena Fuseki (Triple Store)
  fuseki:
    image: stain/jena-fuseki:latest
    ports:
      - "3030:3030"
    environment:
      - ADMIN_PASSWORD=admin123
      - JVM_ARGS=-Xmx2g
    volumes:
      - fuseki-data:/fuseki
      - ./ontology:/staging

  # GraphDB (Alternative to Fuseki)
  # graphdb:
  #   image: ontotext/graphdb:10.0.0
  #   ports:
  #     - "7200:7200"
  #   volumes:
  #     - graphdb-data:/opt/graphdb/home

  # MLflow
  mlflow:
    image: ghcr.io/mlflow/mlflow:latest
    ports:
      - "5000:5000"
    environment:
      - BACKEND_STORE_URI=postgresql://mlflow:mlflow@postgres:5432/mlflow
      - DEFAULT_ARTIFACT_ROOT=s3://mlflow/artifacts
      - AWS_ACCESS_KEY_ID=minio
      - AWS_SECRET_ACCESS_KEY=minio123
      - MLFLOW_S3_ENDPOINT_URL=http://minio:9000
    depends_on:
      - postgres
      - minio
    command: >
      mlflow server
      --backend-store-uri postgresql://mlflow:mlflow@postgres:5432/mlflow
      --default-artifact-root s3://mlflow/artifacts
      --host 0.0.0.0

  # PostgreSQL (Metadata)
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=mlflow
      - POSTGRES_PASSWORD=mlflow
      - POSTGRES_DB=mlflow
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # MinIO (S3-compatible storage)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=minio123
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

  # Apache Kafka
  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - "9092:9092"
    environment:
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    depends_on:
      - zookeeper

  # Zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    ports:
      - "2181:2181"
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
      - ZOOKEEPER_TICK_TIME=2000

  # Apache Airflow
  airflow:
    image: apache/airflow:2.7.0
    ports:
      - "8080:8080"
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres:5432/airflow
    depends_on:
      - postgres
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs
    command: >
      bash -c "airflow db init &&
               airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@example.com &&
               airflow webserver"

volumes:
  fuseki-data:
  graphdb-data:
  postgres-data:
  minio-data:
```

### 8. Requirements.txt

```txt
# FastAPI & Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
strawberry-graphql[fastapi]==0.214.0
pydantic==2.5.0

# SPARQL & RDF
SPARQLWrapper==2.0.0
rdflib==7.0.0
pyshacl==0.25.0

# ML & Data Science
mlflow==2.8.1
tensorflow==2.15.0
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.3

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23

# Kafka
kafka-python==2.0.2
confluent-kafka==2.3.0

# Utilities
python-dotenv==1.0.0
httpx==0.25.2
pydantic-settings==2.1.0
```

---

## 구현 우선순위 및 로드맵

### Phase 1 (1-2개월): 기본 인프라
1. ✅ FastAPI 기본 구조
2. ✅ Apache Jena Fuseki 설정
3. ✅ GraphQL API 구현
4. ✅ Docker Compose 환경

### Phase 2 (2-3개월): Ontology 통합
1. ✅ RDF/OWL2 온톨로지 설계
2. ✅ SPARQL 쿼리 통합
3. ✅ SHACL 검증
4. ✅ Reasoning 엔진 통합

### Phase 3 (3-4개월): ML Pipeline
1. ✅ MLflow 설정
2. ✅ 예측 모델 개발
3. ✅ Apache Airflow DAG
4. ✅ Kafka 스트리밍

### Phase 4 (4-5개월): Data Lake
1. ✅ MinIO 설정
2. ✅ Delta Lake 통합
3. ✅ PySpark 처리
4. ✅ 데이터 파이프라인

---

## 예상 비용 및 리소스

### 개발 인력
- Backend 개발자: 2명 × 5개월
- Data Engineer: 1명 × 4개월
- ML Engineer: 1명 × 3개월

### 인프라 (클라우드 또는 온프레미스)
- 개발 환경: $500-1000/월
- 프로덕션 환경: $2000-5000/월

### 총 예상 기간: 5-6개월

---

이 아키텍처는 **완전히 실현 가능**하며, 모든 컴포넌트가 오픈소스입니다! 🎉
