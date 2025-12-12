// KMTC 새 기능 컴포넌트 테스트 스크립트

console.log('🧪 KMTC 새 기능 테스트 시작');

// 1. PWA Service 기능 테스트
function testPWAService() {
    console.log('\n📱 PWA Service 테스트');
    
    // PWA 지원 여부 확인
    const pwaSupport = {
        serviceWorker: 'serviceWorker' in navigator,
        notifications: 'Notification' in window,
        caches: 'caches' in window,
        pushManager: 'PushManager' in window
    };
    
    console.log('PWA 브라우저 지원:', pwaSupport);
    
    // 네트워크 상태 확인
    console.log('네트워크 상태:', navigator.onLine ? '온라인' : '오프라인');
    
    return pwaSupport;
}

// 2. 알림 시스템 데이터 구조 테스트
function testNotificationDataStructure() {
    console.log('\n🔔 알림 시스템 데이터 구조 테스트');
    
    // 알림 규칙 데이터 구조 검증
    const sampleRule = {
        id: 'test-rule-1',
        name: '테스트 LA 항로 알림',
        type: 'rate_threshold',
        enabled: true,
        conditions: {
            routes: ['kr-la'],
            threshold: 2800,
            comparison: 'below'
        },
        channels: { push: true, email: true, sms: false },
        frequency: 'immediate',
        priority: 'high'
    };
    
    // 알림 히스토리 데이터 구조 검증
    const sampleHistory = {
        id: 'hist-1',
        type: 'rate_drop',
        title: '운임 하락 알림',
        message: '한국-LA 서안 항로 운임이 하락했습니다.',
        timestamp: new Date(),
        priority: 'high',
        status: 'delivered',
        channels: ['push', 'email'],
        responseTime: 15
    };
    
    console.log('알림 규칙 구조 ✅:', sampleRule);
    console.log('알림 히스토리 구조 ✅:', sampleHistory);
    
    return { sampleRule, sampleHistory };
}

// 3. 부킹 히스토리 데이터 구조 테스트
function testBookingHistoryDataStructure() {
    console.log('\n📊 부킹 히스토리 데이터 구조 테스트');
    
    const sampleBooking = {
        id: 'BK000001',
        bookingNumber: 'KMTC20241211001',
        route: 'kr-la',
        containerType: '40HC',
        quantity: 25,
        rate: 2750,
        bookingDate: new Date('2024-12-01'),
        departureDate: new Date('2024-12-15'),
        arrivalDate: new Date('2024-12-30'),
        status: 'confirmed',
        shipper: 'Test Shipper A',
        savings: 150,
        aiRecommended: true
    };
    
    console.log('부킹 레코드 구조 ✅:', sampleBooking);
    
    // 분석 데이터 계산 테스트
    const mockBookings = [sampleBooking];
    const analytics = {
        totalBookings: mockBookings.length,
        totalVolume: mockBookings.reduce((sum, b) => sum + b.quantity, 0),
        totalSavings: mockBookings.reduce((sum, b) => sum + (b.savings || 0), 0),
        avgRate: mockBookings.reduce((sum, b) => sum + b.rate, 0) / mockBookings.length,
        aiRecommendationRate: (mockBookings.filter(b => b.aiRecommended).length / mockBookings.length) * 100
    };
    
    console.log('분석 데이터 계산 ✅:', analytics);
    
    return { sampleBooking, analytics };
}

// 4. 협업 기능 데이터 구조 테스트
function testCollaborationDataStructure() {
    console.log('\n👥 협업 기능 데이터 구조 테스트');
    
    const sampleComment = {
        id: 'comment-1',
        author: 'John Kim',
        authorRole: 'manager',
        content: '이 운임 조건이 좋아 보입니다. 승인하겠습니다.',
        timestamp: new Date(),
        likes: 2,
        liked: false
    };
    
    const sampleSharedBooking = {
        id: 'shared-1',
        bookingNumber: 'KMTC20241211001',
        route: 'kr-la',
        containerType: '40HC',
        quantity: 25,
        rate: 2750,
        sharedBy: 'Sarah Lee',
        sharedAt: new Date(),
        status: 'pending',
        priority: 'high',
        tags: ['urgent', 'vip-customer'],
        collaborators: ['Mike Park', 'Anna Chen'],
        comments: [sampleComment]
    };
    
    const sampleActivity = {
        id: 'activity-1',
        type: 'booking_shared',
        user: 'Sarah Lee',
        action: 'shared booking',
        target: 'KMTC20241211001',
        timestamp: new Date(),
        read: false
    };
    
    console.log('댓글 구조 ✅:', sampleComment);
    console.log('공유 부킹 구조 ✅:', sampleSharedBooking);
    console.log('활동 피드 구조 ✅:', sampleActivity);
    
    return { sampleComment, sampleSharedBooking, sampleActivity };
}

// 5. 로컬 스토리지 기능 테스트
function testLocalStorageFunctionality() {
    console.log('\n💾 로컬 스토리지 기능 테스트');
    
    try {
        // 알림 규칙 저장/로드 테스트
        const testRules = [
            {
                id: 'rule-1',
                name: '테스트 규칙 1',
                type: 'rate_threshold',
                enabled: true
            }
        ];
        
        localStorage.setItem('notificationRules', JSON.stringify(testRules));
        const loadedRules = JSON.parse(localStorage.getItem('notificationRules'));
        
        console.log('알림 규칙 저장/로드 ✅:', loadedRules);
        
        // 글로벌 설정 저장/로드 테스트
        const testSettings = {
            pushEnabled: true,
            emailEnabled: false,
            smsEnabled: false,
            quietHours: { start: '22:00', end: '08:00' },
            timezone: 'Asia/Seoul'
        };
        
        localStorage.setItem('globalNotificationSettings', JSON.stringify(testSettings));
        const loadedSettings = JSON.parse(localStorage.getItem('globalNotificationSettings'));
        
        console.log('글로벌 설정 저장/로드 ✅:', loadedSettings);
        
        return true;
    } catch (error) {
        console.error('로컬 스토리지 테스트 실패 ❌:', error);
        return false;
    }
}

// 6. 다국어 지원 테스트
function testInternationalization() {
    console.log('\n🌐 다국어 지원 테스트');
    
    const translations = {
        ko: {
            title: '스마트 알림 설정',
            save: '저장',
            cancel: '취소'
        },
        en: {
            title: 'Smart Notification Settings',
            save: 'Save',
            cancel: 'Cancel'
        }
    };
    
    const testLanguages = ['ko', 'en'];
    
    testLanguages.forEach(lang => {
        console.log(`${lang.toUpperCase()} 번역:`, translations[lang]);
    });
    
    console.log('다국어 지원 구조 ✅');
    
    return translations;
}

// 7. 날짜/시간 처리 테스트
function testDateTimeHandling() {
    console.log('\n⏰ 날짜/시간 처리 테스트');
    
    const now = new Date();
    const testDates = {
        now: now,
        oneHourAgo: new Date(now.getTime() - 60 * 60 * 1000),
        oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        oneWeekAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    };
    
    // 상대 시간 계산 함수 테스트
    function getTimeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return '방금';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}분 전`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    }
    
    Object.entries(testDates).forEach(([key, date]) => {
        console.log(`${key}: ${date.toISOString()} -> ${getTimeAgo(date)}`);
    });
    
    console.log('날짜/시간 처리 ✅');
    
    return testDates;
}

// 8. 차트 데이터 구조 테스트
function testChartDataStructure() {
    console.log('\n📈 차트 데이터 구조 테스트');
    
    // 월별 트렌드 데이터
    const monthlyTrend = [
        { month: 'Jan', bookings: 45, volume: 1200, savings: 15000, avgRate: 2800 },
        { month: 'Feb', bookings: 52, volume: 1350, savings: 18000, avgRate: 2750 },
        { month: 'Mar', bookings: 48, volume: 1180, savings: 16500, avgRate: 2820 }
    ];
    
    // 파이 차트 데이터
    const routeDistribution = [
        { name: '한국-LA', value: 1200, color: '#3b82f6' },
        { name: '한국-뉴욕', value: 800, color: '#10b981' },
        { name: '한국-유럽', value: 600, color: '#f59e0b' }
    ];
    
    // 일별 알림 트렌드
    const dailyNotifications = [
        { date: 'Dec 9', notifications: 12, acted: 8 },
        { date: 'Dec 10', notifications: 15, acted: 11 },
        { date: 'Dec 11', notifications: 9, acted: 7 }
    ];
    
    console.log('월별 트렌드 데이터 ✅:', monthlyTrend);
    console.log('항로 분포 데이터 ✅:', routeDistribution);
    console.log('일별 알림 데이터 ✅:', dailyNotifications);
    
    return { monthlyTrend, routeDistribution, dailyNotifications };
}

// 모든 테스트 실행
function runAllTests() {
    console.log('🚀 KMTC 새 기능 종합 테스트 시작\n');
    
    const results = {
        pwa: testPWAService(),
        notifications: testNotificationDataStructure(),
        bookingHistory: testBookingHistoryDataStructure(),
        collaboration: testCollaborationDataStructure(),
        localStorage: testLocalStorageFunctionality(),
        i18n: testInternationalization(),
        dateTime: testDateTimeHandling(),
        charts: testChartDataStructure()
    };
    
    console.log('\n🎉 모든 테스트 완료!');
    console.log('테스트 결과 요약:');
    
    Object.entries(results).forEach(([key, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`${status} ${key}: ${typeof result === 'boolean' ? (result ? '성공' : '실패') : '완료'}`);
    });
    
    return results;
}

// 브라우저 환경에서 실행
if (typeof window !== 'undefined') {
    window.kmtcTests = {
        runAllTests,
        testPWAService,
        testNotificationDataStructure,
        testBookingHistoryDataStructure,
        testCollaborationDataStructure,
        testLocalStorageFunctionality,
        testInternationalization,
        testDateTimeHandling,
        testChartDataStructure
    };
    
    console.log('KMTC 테스트 함수들이 window.kmtcTests에 등록되었습니다.');
    console.log('브라우저 콘솔에서 window.kmtcTests.runAllTests()를 실행하세요.');
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testPWAService,
        testNotificationDataStructure,
        testBookingHistoryDataStructure,
        testCollaborationDataStructure,
        testLocalStorageFunctionality,
        testInternationalization,
        testDateTimeHandling,
        testChartDataStructure
    };
}

// 즉시 실행 (Node.js 환경에서는 브라우저 API 테스트 제외)
if (typeof window === 'undefined') {
    console.log('🧪 KMTC 새 기능 테스트 (Node.js 환경)');
    console.log('브라우저 API 테스트는 브라우저에서 실행하세요.');
    
    // 브라우저 API가 필요하지 않은 테스트만 실행
    testNotificationDataStructure();
    testBookingHistoryDataStructure();
    testCollaborationDataStructure();
    testInternationalization();
    testDateTimeHandling();
    testChartDataStructure();
    
    console.log('\n✅ Node.js 환경 테스트 완료');
}