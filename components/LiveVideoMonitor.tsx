import React, { useState, useRef, useEffect } from 'react';
import { Video, Maximize2, Minimize2, Camera, Play, Pause, Volume2, VolumeX, Download, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface VideoFeed {
  id: string;
  name: { ko: string; en: string };
  location: { ko: string; en: string };
  url: string;
  type: 'live' | 'demo';
  status: 'online' | 'offline';
}

interface LiveVideoMonitorProps {
  lang: Language;
}

const LiveVideoMonitor: React.FC<LiveVideoMonitorProps> = ({ lang }) => {
  const [selectedFeed, setSelectedFeed] = useState<string>('busan-terminal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = {
    title: { ko: '실시간 모니터링', en: 'Live Monitoring' },
    selectCamera: { ko: '카메라 선택', en: 'Select Camera' },
    fullscreen: { ko: '전체화면', en: 'Fullscreen' },
    exitFullscreen: { ko: '전체화면 종료', en: 'Exit Fullscreen' },
    play: { ko: '재생', en: 'Play' },
    pause: { ko: '일시정지', en: 'Pause' },
    mute: { ko: '음소거', en: 'Mute' },
    unmute: { ko: '음소거 해제', en: 'Unmute' },
    snapshot: { ko: '스냅샷', en: 'Snapshot' },
    refresh: { ko: '새로고침', en: 'Refresh' },
    status: { ko: '상태', en: 'Status' },
    online: { ko: '온라인', en: 'Online' },
    offline: { ko: '오프라인', en: 'Offline' },
    demoMode: { ko: '데모 모드', en: 'Demo Mode' }
  };

  // 실시간 영상 피드 목록 (실제로는 CCTV/IP 카메라 URL)
  const videoFeeds: VideoFeed[] = [
    {
      id: 'busan-terminal',
      name: { ko: '부산항 터미널', en: 'Busan Terminal' },
      location: { ko: '부산항 제1터미널', en: 'Busan Port Terminal 1' },
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'demo',
      status: 'online'
    },
    {
      id: 'container-yard',
      name: { ko: '컨테이너 야드', en: 'Container Yard' },
      location: { ko: '부산항 야드 A구역', en: 'Busan Port Yard A' },
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'demo',
      status: 'online'
    },
    {
      id: 'loading-dock',
      name: { ko: '적재 부두', en: 'Loading Dock' },
      location: { ko: '부산항 제3부두', en: 'Busan Port Dock 3' },
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'demo',
      status: 'online'
    },
    {
      id: 'gate-entrance',
      name: { ko: '게이트 입구', en: 'Gate Entrance' },
      location: { ko: '부산항 메인 게이트', en: 'Busan Port Main Gate' },
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'demo',
      status: 'online'
    }
  ];

  const currentFeed = videoFeeds.find(f => f.id === selectedFeed) || videoFeeds[0];

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 재생/일시정지
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 음소거 토글
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 스냅샷 캡처
  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snapshot-${currentFeed.id}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  // 영상 새로고침
  const refreshVideo = () => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // 전체화면 이벤트 리스너
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 영상 자동 재생
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // 자동 재생 실패 시 (브라우저 정책)
        setIsPlaying(false);
      });
    }
  }, [selectedFeed]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.title[lang]}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentFeed.location[lang]}
              </p>
            </div>
          </div>

          {/* 상태 표시 */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              currentFeed.status === 'online'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                currentFeed.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium">
                {currentFeed.status === 'online' ? t.online[lang] : t.offline[lang]}
              </span>
            </div>
            {currentFeed.type === 'demo' && (
              <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                {t.demoMode[lang]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 영상 플레이어 */}
      <div ref={containerRef} className="relative bg-black">
        <video
          ref={videoRef}
          src={currentFeed.url}
          className="w-full aspect-video object-cover"
          muted={isMuted}
          loop
          playsInline
        />

        {/* 컨트롤 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* 왼쪽 컨트롤 */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title={isPlaying ? t.pause[lang] : t.play[lang]}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title={isMuted ? t.unmute[lang] : t.mute[lang]}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              <div className="ml-2 text-white text-sm font-medium">
                {currentFeed.name[lang]}
              </div>
            </div>

            {/* 오른쪽 컨트롤 */}
            <div className="flex items-center gap-2">
              <button
                onClick={takeSnapshot}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title={t.snapshot[lang]}
              >
                <Camera className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={refreshVideo}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title={t.refresh[lang]}
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title={isFullscreen ? t.exitFullscreen[lang] : t.fullscreen[lang]}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 카메라 선택 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t.selectCamera[lang]}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {videoFeeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => setSelectedFeed(feed.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedFeed === feed.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Video className={`w-4 h-4 ${
                  selectedFeed === feed.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedFeed === feed.id
                    ? 'text-blue-900 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {feed.name[lang]}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {feed.location[lang]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveVideoMonitor;
