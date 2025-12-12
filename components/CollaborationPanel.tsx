import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Share2, ThumbsUp, Clock, Send, Plus, Filter, Bell, CheckCircle, X } from 'lucide-react';
import { Language } from '../types';

interface Comment {
  id: string;
  author: string;
  authorRole: 'shipper' | 'forwarder' | 'carrier' | 'manager';
  content: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

interface SharedBooking {
  id: string;
  bookingNumber: string;
  route: string;
  containerType: string;
  quantity: number;
  rate: number;
  sharedBy: string;
  sharedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  comments: Comment[];
  collaborators: string[];
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface ActivityItem {
  id: string;
  type: 'booking_shared' | 'comment_added' | 'status_changed' | 'approval_requested';
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  read: boolean;
}

interface CollaborationPanelProps {
  lang: Language;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'shared' | 'activity' | 'team'>('shared');
  const [sharedBookings, setSharedBookings] = useState<SharedBooking[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<SharedBooking | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    collaborator: 'all'
  });

  const t = {
    title: { ko: '협업 센터', en: 'Collaboration Center' },
    
    // Tabs
    sharedBookings: { ko: '공유 부킹', en: 'Shared Bookings' },
    activityFeed: { ko: '활동 피드', en: 'Activity Feed' },
    teamDashboard: { ko: '팀 대시보드', en: 'Team Dashboard' },
    
    // Shared Bookings
    shareBooking: { ko: '부킹 공유', en: 'Share Booking' },
    bookingDetails: { ko: '부킹 상세', en: 'Booking Details' },
    comments: { ko: '댓글', en: 'Comments' },
    addComment: { ko: '댓글 추가', en: 'Add Comment' },
    writeComment: { ko: '댓글을 작성하세요...', en: 'Write a comment...' },
    
    // Status
    pending: { ko: '대기중', en: 'Pending' },
    approved: { ko: '승인됨', en: 'Approved' },
    rejected: { ko: '거부됨', en: 'Rejected' },
    completed: { ko: '완료됨', en: 'Completed' },
    
    // Priority
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Roles
    shipper: { ko: '화주', en: 'Shipper' },
    forwarder: { ko: '포워더', en: 'Forwarder' },
    carrier: { ko: '선사', en: 'Carrier' },
    manager: { ko: '매니저', en: 'Manager' },
    
    // Actions
    approve: { ko: '승인', en: 'Approve' },
    reject: { ko: '거부', en: 'Reject' },
    share: { ko: '공유', en: 'Share' },
    reply: { ko: '답글', en: 'Reply' },
    like: { ko: '좋아요', en: 'Like' },
    
    // Filters
    filters: { ko: '필터', en: 'Filters' },
    status: { ko: '상태', en: 'Status' },
    priority: { ko: '우선순위', en: 'Priority' },
    collaborator: { ko: '협업자', en: 'Collaborator' },
    all: { ko: '전체', en: 'All' },
    
    // Activity Types
    booking_shared: { ko: '부킹이 공유되었습니다', en: 'booking was shared' },
    comment_added: { ko: '댓글이 추가되었습니다', en: 'comment was added' },
    status_changed: { ko: '상태가 변경되었습니다', en: 'status was changed' },
    approval_requested: { ko: '승인이 요청되었습니다', en: 'approval was requested' },
    
    // Time
    now: { ko: '방금', en: 'Just now' },
    minutesAgo: { ko: '분 전', en: 'min ago' },
    hoursAgo: { ko: '시간 전', en: 'h ago' },
    daysAgo: { ko: '일 전', en: 'd ago' },
    
    // Team Dashboard
    teamMembers: { ko: '팀 멤버', en: 'Team Members' },
    activeCollaborations: { ko: '진행중인 협업', en: 'Active Collaborations' },
    pendingApprovals: { ko: '승인 대기', en: 'Pending Approvals' },
    completedToday: { ko: '오늘 완료', en: 'Completed Today' }
  };

  useEffect(() => {
    // Generate mock data
    const mockSharedBookings: SharedBooking[] = [
      {
        id: '1',
        bookingNumber: 'KMTC20241201001',
        route: 'kr-la',
        containerType: '40HC',
        quantity: 25,
        rate: 2750,
        sharedBy: 'John Kim',
        sharedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high',
        tags: ['urgent', 'vip-customer'],
        collaborators: ['Sarah Lee', 'Mike Park', 'Anna Chen'],
        comments: [
          {
            id: 'c1',
            author: 'Sarah Lee',
            authorRole: 'forwarder',
            content: lang === 'ko' ? '이 운임이 시장 대비 경쟁력이 있어 보입니다. 고객사에 제안해도 될까요?' : 'This rate looks competitive compared to market. Can we propose this to the customer?',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: 2,
            liked: false
          },
          {
            id: 'c2',
            author: 'Mike Park',
            authorRole: 'manager',
            content: lang === 'ko' ? '선복 확보가 확실한지 확인 후 진행하시기 바랍니다.' : 'Please confirm space availability before proceeding.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            likes: 1,
            liked: true
          }
        ]
      },
      {
        id: '2',
        bookingNumber: 'KMTC20241201002',
        route: 'kr-eu',
        containerType: '20GP',
        quantity: 15,
        rate: 3200,
        sharedBy: 'Lisa Wang',
        sharedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'approved',
        priority: 'medium',
        tags: ['regular-customer'],
        collaborators: ['Tom Brown', 'Jenny Kim'],
        comments: [
          {
            id: 'c3',
            author: 'Tom Brown',
            authorRole: 'shipper',
            content: lang === 'ko' ? '승인합니다. 좋은 조건이네요.' : 'Approved. Good terms.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 3,
            liked: false
          }
        ]
      }
    ];

    const mockActivities: ActivityItem[] = [
      {
        id: 'a1',
        type: 'booking_shared',
        user: 'John Kim',
        action: 'shared booking',
        target: 'KMTC20241201001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      },
      {
        id: 'a2',
        type: 'comment_added',
        user: 'Sarah Lee',
        action: 'added comment to',
        target: 'KMTC20241201001',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: false
      },
      {
        id: 'a3',
        type: 'status_changed',
        user: 'Tom Brown',
        action: 'approved',
        target: 'KMTC20241201002',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ];

    setSharedBookings(mockSharedBookings);
    setActivities(mockActivities);
  }, [lang]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return t.now[lang];
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t.minutesAgo[lang]}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t.hoursAgo[lang]}`;
    const days = Math.floor(hours / 24);
    return `${days}${t.daysAgo[lang]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'shipper': return 'text-blue-600 dark:text-blue-400';
      case 'forwarder': return 'text-green-600 dark:text-green-400';
      case 'carrier': return 'text-purple-600 dark:text-purple-400';
      case 'manager': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleAddComment = (bookingId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      authorRole: 'manager',
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      liked: false
    };

    setSharedBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, comments: [...booking.comments, comment] }
        : booking
    ));

    setNewComment('');
  };

  const handleLikeComment = (bookingId: string, commentId: string) => {
    setSharedBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? {
            ...booking,
            comments: booking.comments.map(comment =>
              comment.id === commentId
                ? { 
                    ...comment, 
                    liked: !comment.liked,
                    likes: comment.liked ? comment.likes - 1 : comment.likes + 1
                  }
                : comment
            )
          }
        : booking
    ));
  };

  const handleStatusChange = (bookingId: string, newStatus: 'approved' | 'rejected') => {
    setSharedBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus }
        : booking
    ));
  };

  const filteredBookings = sharedBookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.priority !== 'all' && booking.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">{t.title[lang]}</h1>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.shareBooking[lang]}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-8">
          {(['shared', 'activity', 'team'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'shared' && t.sharedBookings[lang]}
              {tab === 'activity' && t.activityFeed[lang]}
              {tab === 'team' && t.teamDashboard[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'shared' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="font-semibold">{t.filters[lang]}:</span>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="all">{t.all[lang]}</option>
              <option value="pending">{t.pending[lang]}</option>
              <option value="approved">{t.approved[lang]}</option>
              <option value="rejected">{t.rejected[lang]}</option>
              <option value="completed">{t.completed[lang]}</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="all">{t.all[lang]}</option>
              <option value="high">{t.high[lang]}</option>
              <option value="medium">{t.medium[lang]}</option>
              <option value="low">{t.low[lang]}</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'shared' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div 
                key={booking.id} 
                className={`bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 ${getPriorityColor(booking.priority)} border-r border-t border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{booking.bookingNumber}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {booking.route} • {booking.containerType} • {booking.quantity} TEU
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {t[booking.status as keyof typeof t][lang]}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-green-600">
                    ${booking.rate.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{booking.comments.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{lang === 'ko' ? `${booking.sharedBy}가 공유` : `Shared by ${booking.sharedBy}`}</span>
                  <span>{getTimeAgo(booking.sharedAt)}</span>
                </div>

                {booking.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {booking.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Booking Details */}
          {selectedBooking && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedBooking.bookingNumber}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{t.bookingDetails[lang]}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedBooking.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          {t.approve[lang]}
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedBooking.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          {t.reject[lang]}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Route:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.route}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Container:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.containerType}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Quantity:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.quantity} TEU</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Rate:</span>
                    <span className="ml-2 font-semibold text-green-600">${selectedBooking.rate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-slate-600 dark:text-slate-400">Collaborators:</span>
                  <div className="flex gap-2 mt-2">
                    {selectedBooking.collaborators.map(collaborator => (
                      <span key={collaborator} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                        {collaborator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="p-6">
                <h3 className="font-bold mb-4">{t.comments[lang]} ({selectedBooking.comments.length})</h3>
                
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {selectedBooking.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className={`text-xs ${getRoleColor(comment.authorRole)}`}>
                            {t[comment.authorRole as keyof typeof t][lang]}
                          </span>
                          <span className="text-xs text-slate-500">{getTimeAgo(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLikeComment(selectedBooking.id, comment.id)}
                            className={`flex items-center gap-1 text-xs ${
                              comment.liked ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                            } transition`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {comment.likes}
                          </button>
                          <button className="text-xs text-slate-500 hover:text-blue-600 transition">
                            {t.reply[lang]}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">U</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t.writeComment[lang]}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => handleAddComment(selectedBooking.id)}
                      disabled={!newComment.trim()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      {t.addComment[lang]}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold">{t.activityFeed[lang]}</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {activities.map(activity => (
              <div key={activity.id} className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${!activity.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'booking_shared' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    activity.type === 'comment_added' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.type === 'status_changed' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    'bg-orange-100 dark:bg-orange-900/20'
                  }`}>
                    {activity.type === 'booking_shared' && <Share2 className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'comment_added' && <MessageCircle className="w-5 h-5 text-green-600" />}
                    {activity.type === 'status_changed' && <CheckCircle className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'approval_requested' && <Bell className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>
                      <span className="text-slate-600 dark:text-slate-400 ml-1">{activity.action}</span>
                      <span className="font-semibold ml-1">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                  {!activity.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Team Stats */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.teamMembers[lang]}</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.activeCollaborations[lang]}</p>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.pendingApprovals[lang]}</p>
                <p className="text-3xl font-bold text-yellow-600">3</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.completedToday[lang]}</p>
                <p className="text-3xl font-bold text-purple-600">5</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;