import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Newspaper, Globe, Brain, Target, Zap, Eye, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface MarketEvent {
  id: string;
  type: 'news' | 'rate_change' | 'capacity_change' | 'risk_alert' | 'opportunity';
  title: string;
  description: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: Date;
  source: string;
  affectedRoutes: string[];
  predictedEffect: {
    rateChange: number;
    timeframe: string;
  };
}

interface CompetitorInsight {
  competitor: string;
  marketShare: number;
  rateChange: number;
  capacityChange: number;
  recentActions: string[];
  threat: 'high' | 'medium' | 'low';
}

interface RiskAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'economic' | 'operational';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedRoutes: string[];
  probability: number;
  impact: number;
  timeline: string;
  mitigation: string[];
}

interface MarketIntelligenceDashboardProps {
  lang: Language;
}

const MarketIntelligenceDashboard: React.FC<MarketIntelligenceDashboardProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'competitors' | 'risks' | 'predictions'>('overview');
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorInsight[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<any[]>([]);
  const [marketPredictions, setMarketPredictions] = useState<any[]>([]);

  const t = {
    title: { ko: 'AI 기반 시장 인텔리전스', en: 'AI-Powered Market Intelligence' },
    
    // Tabs
    overview: { ko: '개요', en: 'Overview' },
    events: { ko: '시장 이벤트', en: 'Market Events' },
    competitors: { ko: '경쟁사 분석', en: 'Competitor Analysis' },
    risks: { ko: '리스크 알림', en: 'Risk Alerts' },
    predictions: { ko: 'AI 예측', en: 'AI Predictions' },
    
    // Metrics
    marketSentiment: { ko: '시장 감정', en: 'Market Sentiment' },
    newsAnalysis: { ko: '뉴스 분석', en: 'News Analysis' },
    competitorThreat: { ko: '경쟁사 위협도', en: 'Competitor Threat' },
    riskLevel: { ko: '리스크 레벨', en: 'Risk Level' },
    
    // Sentiment
    positive: { ko: '긍정적', en: 'Positive' },
    negative: { ko: '부정적', en: 'Negative' },
    neutral: { ko: '중립적', en: 'Neutral' },
    
    // Impact
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Event Types
    news: { ko: '뉴스', en: 'News' },
    rate_change: { ko: '운임 변동', en: 'Rate Change' },
    capacity_change: { ko: '선복 변동', en: 'Capacity Change' },
    risk_alert: { ko: '리스크 알림', en: 'Risk Alert' },
    opportunity: { ko: '기회', en: 'Opportunity' },
    
    // Risk Types
    geopolitical: { ko: '지정학적', en: 'Geopolitical' },
    weather: { ko: '기상', en: 'Weather' },
    economic: { ko: '경제적', en: 'Economic' },
    operational: { ko: '운영상', en: 'Operational' },
    
    // Severity
    critical: { ko: '심각', en: 'Critical' },
    
    // Time
    now: { ko: '방금', en: 'Just now' },
    minutesAgo: { ko: '분 전', en: 'min ago' },
    hoursAgo: { ko: '시간 전', en: 'h ago' },
    daysAgo: { ko: '일 전', en: 'd ago' },
    
    // Actions
    viewDetails: { ko: '상세 보기', en: 'View Details' },
    takeAction: { ko: '조치하기', en: 'Take Action' },
    
    // Insights
    keyInsights: { ko: '주요 인사이트', en: 'Key Insights' },
    marketTrends: { ko: '시장 트렌드', en: 'Market Trends' },
    sentimentAnalysis: { ko: '감정 분석', en: 'Sentiment Analysis' },
    competitorMovement: { ko: '경쟁사 동향', en: 'Competitor Movement' },
    
    // Predictions
    rateForecast: { ko: '운임 예측', en: 'Rate Forecast' },
    demandForecast: { ko: '수요 예측', en: 'Demand Forecast' },
    confidenceLevel: { ko: '신뢰도', en: 'Confidence Level' },
    
    // Sources
    sources: { ko: '출처', en: 'Sources' },
    aiGenerated: { ko: 'AI 생성', en: 'AI Generated' },
    
    // Mitigation
    mitigation: { ko: '완화 방안', en: 'Mitigation' },
    recommendations: { ko: '권장사항', en: 'Recommendations' }
  };

  useEffect(() => {
    // Generate mock market events
    const mockEvents: MarketEvent[] = [
      {
        id: '1',
        type: 'news',
        title: lang === 'ko' ? '수에즈 운하 통행료 인상 발표' : 'Suez Canal Announces Toll Increase',
        description: lang === 'ko' ? '수에즈 운하 당국이 2024년 통행료를 15% 인상한다고 발표했습니다.' : 'Suez Canal Authority announces 15% toll increase for 2024.',
        sentiment: 'negative',
        impact: 'high',
        confidence: 0.92,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'Reuters',
        affectedRoutes: ['kr-eu', 'kr-me'],
        predictedEffect: {
          rateChange: 8.5,
          timeframe: '2-3 weeks'
        }
      },
      {
        id: '2',
        type: 'rate_change',
        title: lang === 'ko' ? 'Maersk 북미 서안 운임 인하' : 'Maersk Reduces North America West Coast Rates',
        description: lang === 'ko' ? 'Maersk가 경쟁력 확보를 위해 북미 서안 운임을 12% 인하했습니다.' : 'Maersk cuts North America West Coast rates by 12% to gain market share.',
        sentiment: 'negative',
        impact: 'medium',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: 'Market Intelligence',
        affectedRoutes: ['kr-la', 'kr-seattle'],
        predictedEffect: {
          rateChange: -5.2,
          timeframe: '1 week'
        }
      },
      {
        id: '3',
        type: 'opportunity',
        title: lang === 'ko' ? '중국 제조업 PMI 상승' : 'China Manufacturing PMI Rises',
        description: lang === 'ko' ? '중국 제조업 PMI가 52.1로 상승하며 수출 증가 전망' : 'China Manufacturing PMI rises to 52.1, indicating increased export activity.',
        sentiment: 'positive',
        impact: 'medium',
        confidence: 0.85,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'Economic Data',
        affectedRoutes: ['kr-cn', 'cn-us'],
        predictedEffect: {
          rateChange: 3.8,
          timeframe: '2-4 weeks'
        }
      }
    ];

    const mockCompetitors: CompetitorInsight[] = [
      {
        competitor: 'Maersk',
        marketShare: 18.5,
        rateChange: -12.0,
        capacityChange: 5.2,
        recentActions: [
          lang === 'ko' ? '북미 서안 운임 인하' : 'West Coast rate reduction',
          lang === 'ko' ? '신규 선박 투입' : 'New vessel deployment'
        ],
        threat: 'high'
      },
      {
        competitor: 'MSC',
        marketShare: 16.8,
        rateChange: 2.3,
        capacityChange: -1.5,
        recentActions: [
          lang === 'ko' ? '유럽 항로 증편' : 'Europe service frequency increase',
          lang === 'ko' ? '디지털 플랫폼 강화' : 'Digital platform enhancement'
        ],
        threat: 'medium'
      },
      {
        competitor: 'CMA CGM',
        marketShare: 12.4,
        rateChange: 0.8,
        capacityChange: 3.1,
        recentActions: [
          lang === 'ko' ? '친환경 연료 전환' : 'Green fuel transition',
          lang === 'ko' ? '아시아 허브 확장' : 'Asia hub expansion'
        ],
        threat: 'medium'
      }
    ];

    const mockRisks: RiskAlert[] = [
      {
        id: 'r1',
        type: 'geopolitical',
        severity: 'high',
        title: lang === 'ko' ? '홍해 지역 선박 공격 위험' : 'Red Sea Shipping Attack Risk',
        description: lang === 'ko' ? '홍해 지역에서 상선 공격 사건이 증가하고 있어 우회 항로 필요' : 'Increased merchant vessel attacks in Red Sea region requiring route diversions.',
        affectedRoutes: ['kr-eu', 'kr-me'],
        probability: 0.75,
        impact: 0.85,
        timeline: '1-2 weeks',
        mitigation: [
          lang === 'ko' ? '희망봉 우회 항로 준비' : 'Prepare Cape of Good Hope alternative route',
          lang === 'ko' ? '보험료 인상 대비' : 'Prepare for insurance premium increases'
        ]
      },
      {
        id: 'r2',
        type: 'weather',
        severity: 'medium',
        title: lang === 'ko' ? '태평양 태풍 시즌 접근' : 'Pacific Typhoon Season Approaching',
        description: lang === 'ko' ? '6-11월 태풍 시즌으로 인한 운항 지연 가능성' : 'Potential shipping delays during June-November typhoon season.',
        affectedRoutes: ['kr-jp', 'kr-tw'],
        probability: 0.65,
        impact: 0.45,
        timeline: '2-3 months',
        mitigation: [
          lang === 'ko' ? '예비 선복 확보' : 'Secure backup capacity',
          lang === 'ko' ? '일정 여유분 확보' : 'Build schedule buffers'
        ]
      }
    ];

    // Generate sentiment trend data
    const mockSentimentTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockSentimentTrend.push({
        date: date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }),
        positive: Math.random() * 40 + 30,
        negative: Math.random() * 30 + 10,
        neutral: Math.random() * 30 + 40,
        overall: (Math.random() - 0.5) * 20
      });
    }

    // Generate market predictions
    const mockPredictions = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      mockPredictions.push({
        date: date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }),
        predictedRate: 2800 + Math.sin(i * 0.2) * 200 + Math.random() * 100,
        confidence: Math.max(0.6, 0.95 - i * 0.01),
        upperBound: 2800 + Math.sin(i * 0.2) * 200 + Math.random() * 100 + 150,
        lowerBound: 2800 + Math.sin(i * 0.2) * 200 + Math.random() * 100 - 150
      });
    }

    setMarketEvents(mockEvents);
    setCompetitorInsights(mockCompetitors);
    setRiskAlerts(mockRisks);
    setSentimentTrend(mockSentimentTrend);
    setMarketPredictions(mockPredictions);
  }, [lang]);

  const getTimeAgo = (date: Date) => {
   d;ceDashboartIntelligenkeMarault 
export def
  );
};
/div>}
    <
      )      </div>>
     </div     </div>
       
       l>       </uli>
       </entstical evpoli <li>• Geo            i>
   tions</lpetitor ac Comi>•    <l         
   mand</li>l deSeasona  <li>•               
ends</li>e tr• Fuel pric        <li>>
         space-y-1"t-smName="texl class  <u        /h4>
    ctors<ey Fad mb-2">Kont-bolassName="fh4 cl  <           >
 00"rder-slate-7-200 dark:bor-slateborderder  boounded-xl00 p-6 rlate-8te dark:bg-sbg-whiame=" classN  <div  

        /div> <              </div>
   
        </span>-600">78%owyellld text-bo font-semiext-xsme="tssNaan cla      <sp    pan>
      idence: </se-500">Conft-slats tex"text-x=ssNamespan cla          <   t-2">
   assName="m   <div cl      p>
     </urrent from c3.8%">+ate-500sltext-ext-sm ame="t<p classN             20</p>
 e-600">$2,9rpltext-pubold font-xl t-2ssName="tex     <p cla         tion</h4>
edic Pr>Next Monthbold mb-2"nt-ame="fo classN  <h4          e-700">
  order-slate-200 dark:ber-slatrder bordnded-xl booup-6 r-slate-800 bgark:g-white d"bssName=v cla     <di>

       </div       /div>
           <        pan>
4%</s0">9en-60t-greibold tex font-sem"text-xse=lassNam     <span c          : </span>
 onfidencee-500">Cext-slat"text-xs tassName=pan cl <s              
 t-2">e="massNam   <div cl        p>
   rent</% from cur500">-2.3text-slate-e="text-sm lassNam        <p c    </p>
  $2,750lue-600">-bd textxl font-bol-2="text<p className         4>
     n</hredictio Week P>Next-bold mb-2""fontame=classN4   <h         ">
   -slate-700dark:borderte-200 order-slaborder bl d-xrounde-6 e-800 p:bg-slatte dark"bg-whissName=cla<div        >
     s-3 gap-6"grid-cold:s-1 mol grid-cridlassName="g<div c   */}
       y on Summar* Predicti       {/
   /div>
      <ainer>
    Contesponsive </R      hart>
        </LineC           " />
"5 5=Dasharray} stroke={2okeWidth81" strke="#10b9roce" st="confiden" dataKey"monotoneine type=          <L} />
      dth={3trokeWi#3b82f6" s stroke="dictedRate"Key="prene" datatope="monone ty         <Li      
 f" />fffff="#"none" fille=" strokwerBoundtaKey="loone" dape="monot tyea   <Ar            {0.1} />
 acity=2f6" fillOp"#3b8ll=fi"none" troke=" srBoundKey="uppetatone" dae="mono<Area typ        />
        ooltip      <T     >
       /  <YAxis           
   " />aKey="dates dat  <XAxi            3 3" />
  "array=ashd strokeDnGriia<Cartes              s}>
  ionrketPredict data={ma  <LineChart            400}>
ht={eigh="100%" hidttainer wCononsive     <Resp       3>
te</hrea-LA Roug]} - Koast[lanreceFo>{t.ratb-4"ont-bold mtext-lg flassName="       <h3 c     00">
-slate-7k:border200 dar-slate-er borderl bord-6 rounded-x pg-slate-800dark:b"bg-white ame=classN      <div  */}
    Chartst Foreca {/* Rate   ">
       y-6ame="space-iv classN  <d&& (
      s' onedicti= 'prb ==veTatiac {       )}

 /div>
        < ))}
      div>
            </      iv>
  </d   
            </div>      >
              </div
             </ul>              }
          ))           i>
     m}</l {itete-300">•rk:text-sla dat-slate-700t-sm texame="texndex} classNli key={i      <           > (
       index) =m, n.map((iteigatio  {risk.mit                    ">
e-y-1="spac className   <ul            </h4>
     tion[lang]}:tiga{t.mi">2sm mb-xt-ld temibo-se"font className=   <h4          
              <div>                 
         div>
           </         >
 </div            
        )}      )             an>
          </sp         
            {route}                      ">
llrounded-fuxt-xs 300 teext-red-0 dark:t text-red-7000/20red-9 dark:bg-bg-red-100y-1 ="px-2 pclassNameoute} an key={r<sp                        => (
map(route edRoutes.isk.affect    {r           
       mt-1">lex gap-2 assName="f    <div cl       
         n>pautes:</scted RoAffeext-sm">slate-500 txt-e="tessNamclan pa      <s           -4">
   "mbassName= <div cl         
                      
       </div>         
        </div>                 an>
 sptimeline}</{risk.d">nt-semibol"ml-2 foName=span class     <              >
   an:</spne">Timeli-slate-500extlassName="t<span c                    
       <div>        
         </div>          n>
        /spaxed(0)}%<oFi 100).tmpact *isk.imibold">{(r-sel-2 font="mclassNamespan        <               ct:</span>
-500">Impate"text-slassName=n cla     <spa             iv>
    <d                   iv>
 /d          <
          pan>(0)}%</s0).toFixedability * 10sk.probri">{(semibold"ml-2 font-className=   <span                   /span>
 ability:<">Probt-slate-500me="tex classNa<span                   
         <div>              
-sm">4 text mb-ls-3 gap-4-co:gridols-1 mdid-crid gre="gassNam cl<div                    
             >
   /p}<iption>{risk.descrmb-4"-300 :text-slatearkslate-700 dt-"texclassName=  <p                
             v>
       </di               >
  </div                 iv>
           </d       
       (0)}toFixedt * 100).mpacisk.ility * rabi {(risk.prob                       00">
t-red-6 texnt-boldtext-xl fo"className=  <div           
          core</div>Risk S-500">text-slate"text-sm me=Na <div class                   >
  text-right"className="<div              
            </div>             >
         </div            
   pan>][lang]}</speof tkeyof tyype as ">{t[risk.titalizee-500 capext-slatsm t"text-Name=lasspan c   <s                   
  span>   </                     g]}
of t][lanof type keyy asseverit  {t[risk.                        ity)}`}>
.severlor(riskSeverityCo ${get-semiboldnt fot-xsded-full tex1 roun py-e={`px-2lassNampan c          <s           -1">
   p-3 mtr ganteex items-cessName="fldiv cla          <    3>
        k.title}</hisnt-bold">{rfo-lg e="textsNam3 clas       <h              >
     <div                -3">
y-between mbstift ju-starems itame="flex<div classN               1">
   lex-e="fassNamv cl<di                mt-1" />
-600 8 text-redame="w-8 h-classNtTriangle Aler <            -4">
   t gapitems-starame="flex assN<div cl            ">
  r-slate-700deore-200 dark:batborder-slr  bordeded-xl6 rounlate-800 p--s dark:bg-whitebgme="classNa{risk.id} ey=      <div k    => (
  (risk Alerts.map {risk    
     e-y-4">space="sNamlas     <div cs' && (
   = 'riskctiveTab ==
      {a    )}
div>
    </}
         ))       
/div> <           
      </div>
        v>      </di         ul>
         </         
     ))}                </li>
ction}{a300">• ext-slate-0 dark:t-70ext-slatetext-sm tssName="index} cla<li key={                     > (
 on, index) =((actitions.maprecentAcor.it {compet            ">
       y-1e="space-ul classNam  <           >
     tions</pt Acmb-2">Recen500 ate-sm text-slame="text- classN      <p     v>
       <di            div>
           </     /p>
               <
       ge}%acityChantor.capmpeti'}{co0 ? '+' : 'hange > .capacityCor{competit               }`}>
     ed-600'' : 'text-reen-600grxt- 'tenge >= 0 ?acityCha.captitorped ${comont-bol`text-2xl f={assNamecl        <p 
          </p> Change0">Capacitye-50at-sltext"text-sm =<p className                >
  ter"t-cename="tex<div classN           iv>
        </d         >
          </p          
  eChange}%itor.rat'}{compet0 ? '+' : 'eChange > ratr.tito     {compe           }>
    0'}`n-60greetext-ed-600' : ''text-r0 ? >= .rateChange itorpet ${com-bold2xl fontame={`text-sNlas   <p c       
        nge</p>ha00">Rate Ce-5sm text-slatme="text- classNa     <p     
        t-center">Name="texclass     <div                </div>
           are}%</p>
 arketShetitor.m>{compt-blue-600"bold texxl font-me="text-2<p classNa               are</p>
   ">Market Sh00-5m text-slatet-sName="tex <p class           
      er">xt-centame="te <div classN            ">
   ols-4 gap-6-crid md:gid-cols-1grd ssName="griladiv c   <         
                
     </div>
         >   </div          pan>
   t} Threat</sthreator.">{competiizecapitalsemibold t-sm font-ame="texassNn cl <spa            /div>
     at)}`}><r.thrempetitolor(coreatCo${getThull -3 rounded-fame={`w-3 hsNv clas        <di          r gap-2">
ems-cente="flex itme classNaiv          <d    >
  or}</h3tor.competit">{competi-boldl font="text-xssName     <h3 cla         
  en mb-4">stify-betweenter juex items-ce="flassNamiv cl          <d">
    slate-700k:border--200 darlaterder-srder bod-xl bonderoup-6 te-800 -sla dark:bg"bg-white className=tor}.competiompetitor <div key={c          => (
  torap(competinsights.m{competitorI         e-y-6">
 Name="spac class     <div   & (
mpetitors' &'co== activeTab =
      {
)}   div>
    </}
        })       );
           v>
        </di       </div>
          
        /div>           <  
     </div>              
      </div>                          ))}
                    </span>
                          }
     {route                   ull">
    ounded-f text-xs re-300text-bluue-700 dark:20 text-blg-blue-900/e-100 dark:b bg-blu="px-2 py-1sName} clasute={ropan key     <s                    ute => (
 tes.map(ro.affectedRou     {event                ">
   mt-1ex gap-2 "flsName=v clas     <di               an>
  outes:</sp RAffectedt-sm">500 texext-slate-="tassNamean cl         <sp         >
    ="mt-4" className        <div      
                    >
         </div             div>
              </          pan>
  tamp)}</svent.timesgo(egetTimeAibold">{nt-sem"ml-2 fon className=pa          <s             e:</span>
 -500">Tim-slateextassName="t cl     <span                   v>
      <di           
        </div>                   n>
spa}%</0)oFixed(0).t* 10ce denevent.confiibold">{(t-sem-2 fonName="ml <span class                       an>
idence:</sponf-500">C"text-slateassName=n cl  <spa                  div>
        <            iv>
        </d             an>
       ce}</spurevent.sobold">{ font-semi"ml-2e=assNam<span cl                  
      </span>ce:e-500">Sourslatt-ssName="tex<span cla                  div>
           <              ">
   t-smap-4 tex3 gid-cols-1 md:grd-cols-id gri="grlassName   <div c                    
            }</p>
     scription">{event.de0 mb-4-slate-30:textarkslate-700 d"text-ssName=  <p cla                       
          v>
         </di              v>
         </di       
        v>eframe}</dit.timdEffeccte.predi">{eventxt-slate-500"text-sm tee=classNam <div                   >
      </div                    e}%
   ct.rateChangictedEffeent.pred : ''}{ev 0 ? '+'ange >Chct.ratetedEffet.predic {even                     )}`}>
    ent.impactlor(evtImpactCo ${gefont-boldt-xl ame={`tex <div classN               
        ">"text-rightlassName= cdiv  <           >
                </div         iv>
          </d             n>
           </spa                     ]} Impact
 eof t][lang typt as keyof[event.impac        {t             }>
       .impact)}`r(eventtColo ${getImpacemibold font-s{`text-smName=ass  <span cl                       /span>
  <                 
        f t][lang]}yof typeoment as kevent.senti{t[e                    
        ent)}`}>nt.sentimColor(evegetSentimentbold ${-semi fontl text-xsrounded-fulpx-2 py-1 e={`pan classNam      <s                 ">
   t-1 mcenter gap-3s-"flex itemassName=div cl <                   }</h3>
    tlevent.tibold">{et-lg font-"texclassName= <h3                
        div>  <                  mb-3">
  between rt justify-items-stae="flex lassNamv c <di           
        ">-1e="flexv classNam     <di           v>
  /di          <
         h-6" />-6ssName="w   <Icon cla                
 ent)}`}>.sentim(eventoloretSentimentC ${gd-lgounde r`p-3e={ssNamla     <div c           
  >t gap-4"ms-starex iteame="flsN clas        <div
        late-700">:border-sate-200 darkr-sler bordeded-xl bord0 p-6 rounbg-slate-80 dark:whiteName="bg-id} class={event.<div key              (
n   retur          
ype);vent.tEventIcon(e Icon = get const         t => {
  p(even.maEvents {market
         ace-y-4">spName="<div class      (
  ts' && b === 'even  {activeTa}

    
      )v>di       </   </div>
 
           </div>}
         })             );
          v>
      /di      <           </div>
            
         v>    </di                 v>
      </di              v>
     frame}</difect.timetedEfredic">{event.pe-500t-slatxt-xs texssName="tev cla<di                          >
/div     <              e}%
       eChangratctedEffect.{event.predi '+' : ''}> 0 ?ange teChect.radictedEff.prent      {eve                    )}`}>
  t.impactevenor(pactColetImemibold ${g-sm font-same={`textdiv classN   <                     
  right">ext-e="tamdiv classN  <                    >
       </div              
        </div>                      
 an>/sp(0)}%<100).toFixedidence * ent.conf: {(evConfidence  <span>                         an>
 )}</sptamp.timesntgo(evemeAspan>{getTi          <                n>
  }</sparce{event.sou <span>                         
  ate-500">-xs text-sl-2 textmtter gap-4 ens-cex itemame="fl <div classN                       on}</p>
  criptides-1">{event.ate-400 mt:text-slate-600 darkm text-sle="text-sam  <p classN                 >
       .title}</h4old">{eventmib="font-seName class      <h4           
            <div>                n">
     fy-betweetart justiflex items-se=" classNam        <div              >
"flex-1"sName=iv clas         <d     >
        </div            " />
      ="w-5 h-5classNameon        <Ic            )}`}>
   ententiment.s(evlorimentCog ${getSent rounded-lme={`p-2lassNa     <div c        
       g">ed-lrounde-700 dark:bg-slatg-slate-50  gap-4 p-4 bs-start itemsName="flex clasent.id}y={ev <div ke                 return (
               );
 n(event.typeco getEventIn =const Ico          > {
      p(event = 3).mae(0,ts.slic {marketEven          >
   ace-y-4"assName="sp    <div cl     
   >ts</h3rket EvenRecent Mabold mb-4">-lg font-extsName="tlas       <h3 c  00">
   rder-slate-7ark:bo-slate-200 dborderxl border ed- p-6 roundlate-800e dark:bg-se="bg-whitsNam  <div clas}
        ents */* Recent Ev   {/
       /div>
 <       </div>
           ner>
   aiponsiveCont   </Res        hart>
   eC     </Pi     
      ip />oolt  <T           Pie>
            </      ))}
                         %)`} />
}, 70%, 50 * 60`hsl(${indexx}`} fill={indeey={`cell-${Cell k           <         => (
  index) ntry, ap((ensights.mitorIompet   {c       
                >         %`}
    ${value}`${name}:) =>  }ueme, val={({ na    label         
       lue"va"dataKey=                   
 8884d8"  fill="#                 0}
 s={10terRadiu      ou        
      "="50%          cy         "
   cx="50%           
       Share }))}e: c.markettitor, valu.compe({ name: cc => ights.map(Inspetitor data={com                   e
   <Pi           t>
    PieChar    <   >
         eight={300}"100%" hner width=eContaiivons  <Resp           
 ang]}</h3>ement[lovetitorM">{t.comp mb-4ont-boldt-lg fme="texNa3 class     <h        -700">
 border-slate-200 dark:der-slatebor border 6 rounded-xlp--slate-800 hite dark:bgsName="bg-wclas       <div e */}
     et Shartor Markti/* Compe     {

       >  </div         iner>
 onsiveContaspRe    </    rt>
      AreaCha   </        >
      /.6}acity={044" fillOpll="#ef44f4444" fie="#etrok" sckId="1ive" staataKey="negne" datpe="monotorea ty   <A           
    ={0.6} />lOpacityfil0" 728l="#6b6b7280" filtroke="#ckId="1" sal" staaKey="neutr" datmonotoneype="   <Area t         />
       .6}pacity={0b981" fillO10" fill="#10b981roke="#kId="1" stve" stac"positidataKey=" "monotoneea type=      <Ar          >
  Tooltip /        <       />
    xisYA     <           
  ate" />ey="dtaKxis da  <XA            
    ="3 3" />harraytrokeDasGrid s <Cartesian                >
 nd}sentimentTreta={AreaChart da       <
         ght={300}>"100%" heith=ner widonsiveContai     <Resp         g]}</h3>
s[lanysinalimentAentt.s4">{-bold mb-xt-lg font="teame classN     <h3        
 700">order-slate-:b darke-200 border-slaternded-xl bord00 p-6 rouk:bg-slate-8 dare="bg-whitessNam claiv         <d/}
    *rendntiment T{/* Se         ">
   ls-2 gap-6:grid-colgls-1 grid grid-co="ame classNdiv <         ts */}
 {/* Char        iv>

    </d       
v></di         
   > </div            >
 ed-600" /text-r h-8 e="w-8ssNamlagle c<AlertTrian              div>
     </           >
  s</p alertal2 critice-500">t-slatxt-xs texte"className=     <p           p>
   gh</-600">Hitext-redt-bold  fon="text-3xlassName     <p cl       
      ang]}</p>vel[lskLe.ri400">{tslate-ext-e-600 dark:t-slat textext-smName="t<p class                div>
         <     en">
    twebeer justify-centitems-lex ="fName class        <div      700">
slate-:border-e-200 darkborder-slater ordl bounded-x-6 rlate-800 park:bg-ste d"bg-whisName=clas     <div 

       v>/di           < </div>
         >
     ange-600" /or h-8 text-me="w-8sNalas   <Eye c       
      </div>              
  reats</p>high th3 te-500">slaxt-xs text-"te className= <p                >
 edium</pe-600">Mrangd text-obolxl font--3xt="teNamep class    <            /p>
  ]}<langt[eaompetitorThrt.c">{slate-400rk:text-slate-600 daext-sm text-ssName="t  <p cla     
           v>di <           
    ">-between justify-center"flex itemsv className=di <        ">
     er-slate-700bord0 dark:late-20der-s borernded-xl bord00 p-6 route-8slate dark:bg-me="bg-whisNa <div clas       >

         </divv>
              </di      
  />lue-600"-bext8 h-8 tssName="w- claper  <Newspa            div>
          </
        ed</p>lyzs ana">articlee-500 text-slat="text-xsassName<p cl                
  7</p>0">2460ue--blbold text3xl font-text-sName="as<p cl                  >
lang]}</pewsAnalysis[">{t.n-400-slate0 dark:textte-60sm text-sla"text-ssName= cla         <p>
               <div        een">
  justify-betwter -cenms itelex"fName=iv class    <d    
      e-700">atsler-ark:bord0 d20order-slate-border bd-xl  rounde-6ate-800 pdark:bg-sl"bg-white me=assNa     <div cl   
    
 </div>      
         </div>        
  " />00t-green-68 tex8 h-"w-ssName=ndingUp claTre          <
          </div>         </p>
   t week lasate-500">vsslext-ext-xs tame="tsN clas  <p              p>
  </">+12.5%t-green-600tex-bold l fontme="text-3x  <p classNa           
     ng]}</p>ent[lantimmarketSee-400">{t.ext-slatdark:tte-600 t-slatext-sm texclassName="         <p       iv>
      <d             een">
-betwustifyter jens-citemName="flex class  <div           0">
  -70order-slate0 dark:bte-20laer border-snded-xl bord route-800 p-6dark:bg-slaite "bg-whName=  <div class          4 gap-6">
id-cols-lg:grd-cols-2 s-1 md:grigrid-colName="grid <div class      cs */}
    Key Metri*         {/  -y-6">
"spaceme=Na <div class      (
  iew' &&= 'overvTab ==active/}
      {nt *nteTab Co
      {/* /div>
    <  >
      </div ))}
        button>
          </    [lang]}
 t[tab]          {    >
    `}
                   }  
 late-300'er:border-s-700 hovte:text-sla-500 hoverext-slatearent tnsp'border-tra        :       
    urple-600'ext-pple-500 t-purorder 'b  ?              ab
  == ttiveTab =       ac{
         n $sitio-sm tran textediumfont-morder-b-2 -2 px-1 bame={`py  classN           Tab(tab)}
 Active() => setk={    onClic
          b}y={ta     ke     n
    to <but          (
   =>st).map(tabs'] as con 'predictionrisks',itors', '', 'competevents', '(['overview   {>
       8" space-x-"flexe= classNam<div    >
    ate-700"border-sl0 dark:-slate-20erer-b borde="bordamv classN<di    
  /* Tabs */}   {   v>

di>
      </div    </div>
      </      pan>
  lysis</se Anaiv400">L:text-green-en-700 dark text-greoldsemib-sm font-extassName="tn cl     <spa  >
     /div"><e-pulsenimatl aed-ful00 round2 bg-green-5 h-"w-2assName=div cl          <>
  ded-lg"00/20 rounen-9 dark:bg-greeen-100g-grpx-3 py-2 b2 ter gap-ex items-cen"flme=ssNa<div cla        
  gap-2">ms-center flex iteme="classNa      <div >
  </div      1>
  ng]}</h{t.title[la">bold-3xl font-"textame= <h1 classN>
         ple-600" /8 text-purw-8 h-="Name<Brain class        gap-3">
  tems-center e="flex iNam<div class       enter">
 items-cn eestify-betw"flex juassName=  <div cl
     Header */} {/*6">
     space-y-lassName="div c(
    < return 
 ;
  }
  }e;
  obn Glturre  default: 
    get;Tar: return ity'e 'opportun      casgle;
Trianurn Alert_alert': ret'risk
      case BarChart3;ge': return acity_chan case 'cap   Down;
  rendingn T returte_change':  case 'raper;
    spaew return Nws': 'ne    casepe) {
  switch (ty
    => {: string) (typen = etEventIconst g

  co  };
    }
';hitet-w0 texg-gray-50 return 'b  default:;
    -white'text500  'bg-green-ow': return   case 'l  ';
 whitew-500 text-yelloeturn 'bg-dium': rse 'me     cat-white';
 d-500 texn 'bg-re: reture 'high'as;
      cte'0 text-whied-60urn 'bg-r rettical': case 'cri   y) {
  ch (severit {
    switg) =>y: strinveritlor = (seetSeverityCo  const g;


    }
  }';ray-500g-gn 'burdefault: ret  00';
    -green-5n 'bgur: retow'case 'l0';
      low-50'bg-yel: return ase 'medium'
      c0';bg-red-50n 'igh': retur   case 'ht) {
   witch (threa=> {
    s) t: stringrealor = (thThreatCo  const get
  };


    }gray-600';n 'text- returault:
      def';en-600n 'text-greeturse 'low': r  ca-600';
    llowtext-yeeturn 'edium': rase 'm;
      cd-600'xt-re'teurn : ret'high'  case   t) {
  mpacch (iswit   ) => {
 string = (impact: ctColormpat getI
  cons  };
;
    }
y-400't-gra dark:tex-900/20ray0 dark:bg-g0 bg-gray-10-60ext-gray 'tturn: re  default00';
    gray-40 dark:text-0/2:bg-gray-900 dark100 bg-gray-ray-60rn 'text-gral': retuase 'neut      c;
ed-400'rk:text-r/20 da900-red-k:bg dard-100600 bg-red-xt-rern 'te retuegative':e 'n      cas400';
green-ext-k:t0 dar0/2-green-90rk:bg00 da-1bg-greenen-600  'text-grereturnpositive': ase '      c
sentiment) {ch (  swit> {
  : string) =ment= (sentitimentColor  getSen  const  };

lang]}`;
daysAgo[}${t.`${days return   
 urs / 24);or(ho Math.flo =days    const `;
]}Ago[langhours{hours}${t.rn `$4) retuurs < 2   if (ho 60);
 tes /or(minuMath.flo=  hours onst    c[lang]}`;
t.minutesAgo${minutes}${eturn `es < 60) rf (minut  i60);
  onds / oor(secath.flminutes = Mconst g];
    an[lnowturn t.< 60) rends seco
    if (1000);me()) / - date.getTinow() (Date.ath.floor(econds = M const s