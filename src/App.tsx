import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, Check, ShieldCheck, Smartphone, Mail, Settings, LayoutDashboard, 
  Plus, Trash2, Search, Info, Clock, Shield, Globe, Calendar, FileText, 
  StickyNote, CheckCircle2, ChevronRight, ChevronDown, AlertCircle, X,
  UserCheck, Cpu, ShieldAlert, LogOut, Menu, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// --- Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

const Switch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (val: boolean) => void, disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      checked ? 'bg-primary' : 'bg-black-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// --- Notification Bell & Dropdown ---

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  icon: any;
  link?: string;
  sentAt: Date;
  readAt: Date | null;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: '官方訊息', title: '系統升級通知', content: 'Apollo 系統將於本週六凌晨進行例行性維護，屆時部分服務可能暫停。', icon: Info, sentAt: new Date(), readAt: null },
  { id: '2', type: '任務排程', title: '新任務指派', content: '您有一個新的專案審核任務待處理，請於今日下班前完成。', icon: LayoutDashboard, sentAt: new Date(Date.now() - 3600000), readAt: null, link: '/tasks/1' },
  { id: '3', type: '公司公告', title: '年度員工旅遊調查', content: '請各位同仁於本週五前填寫年度旅遊意向調查表，謝謝配合。', icon: Bell, sentAt: new Date(Date.now() - 86400000), readAt: new Date() },
  { id: '4', type: '表單', title: '加班申請已核准', content: '您的 2024/04/12 加班申請已由主管核准。', icon: FileText, sentAt: new Date(Date.now() - 172800000), readAt: null },
  { id: '5', type: '任務排程', title: '任務即將到期', content: '您的「Q2 預算編列」任務將於 24 小時內到期。', icon: AlertCircle, sentAt: new Date(Date.now() - 10000), readAt: null },
];

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('全部');
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [bellRect, setBellRect] = useState<DOMRect | null>(null);

  const defaultTabs = ['全部', '官方訊息', '任務排程', '公司公告', '表單', '排程', '便利貼'];
  const allTabs = [...defaultTabs, ...customTabs];

  const unreadCount = notifications.filter(n => !n.readAt).length;

  useEffect(() => {
    if (isOpen && bellRef.current) {
      setBellRect(bellRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const filteredNotifications = activeTab === '全部' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const getTabUnreadCount = (tab: string) => {
    if (tab === '全部') return unreadCount;
    return notifications.filter(n => n.type === tab && !n.readAt).length;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => {
      if (activeTab === '全部' || n.type === activeTab) {
        return { ...n, readAt: n.readAt || new Date() };
      }
      return n;
    }));
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.link) {
      if (n.link.startsWith('http')) {
        window.open(n.link, '_blank');
      } else {
        console.log(`Navigating to internal link: ${n.link}`);
      }
    }
  };

  const addNewTab = () => {
    if (newTabName && !allTabs.includes(newTabName)) {
      setCustomTabs(prev => [...prev, newTabName]);
      setNewTabName('');
      setIsAddTabModalOpen(false);
      setActiveTab(newTabName);
    }
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full border border-black-200 hover:bg-black-50 transition-colors relative group"
      >
        <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary' : 'text-black-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[9998] bg-black/5" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'fixed',
                  top: bellRect ? bellRect.bottom + 12 : 80,
                  right: bellRect ? window.innerWidth - bellRect.right : 16,
                  zIndex: 9999,
                }}
                className="w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-black-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-black-50 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-black-800 tracking-tight">通知中心</h3>
                    {unreadCount > 0 && <Badge className="bg-red-50 text-red-500 border-red-100">{unreadCount} 未讀</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        setIsOpen(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-black-100 text-black-400 transition-colors"
                      title="通知設定"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={markAllRead}
                      className="text-xs font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-tighter"
                    >
                      全部標為已讀
                    </button>
                    <button 
                      onClick={() => setIsAddTabModalOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-black-100 text-black-400 transition-colors"
                      title="新增分類"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-2 border-b border-black-50 bg-black-50/30">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 px-2">
                    {allTabs.map(tab => {
                      const count = getTabUnreadCount(tab);
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
                            activeTab === tab 
                              ? 'bg-white text-primary shadow-sm border border-black-100' 
                              : 'text-black-500 hover:bg-black-100'
                          }`}
                        >
                          {tab}
                          {count > 0 && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Webhook Banner for Custom Tabs */}
                {customTabs.includes(activeTab) && (
                  <div className="p-4 bg-primary-30 border-b border-primary-70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary-dark">Webhook 已啟用</span>
                    </div>
                    <button 
                      onClick={() => setIsWebhookModalOpen(true)}
                      className="text-[10px] font-black text-primary bg-white px-2 py-1 rounded-md shadow-sm border border-primary-70 hover:bg-primary-30 transition-colors"
                    >
                      獲取 URL
                    </button>
                  </div>
                )}

                {/* List */}
                <div className="max-h-[min(450px,60vh)] overflow-y-auto no-scrollbar">
                  {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-black-50">
                      {filteredNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-5 flex gap-4 cursor-pointer transition-all hover:bg-black-50 relative group ${!n.readAt ? 'bg-primary-30/20' : ''}`}
                        >
                          {!n.readAt && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                          )}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                            !n.readAt ? 'bg-primary-30 text-primary' : 'bg-black-50 text-black-400'
                          }`}>
                            <n.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold truncate pr-4 ${!n.readAt ? 'text-black-800' : 'text-black-500'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] font-bold text-black-400 whitespace-nowrap">
                                {n.sentAt.getHours()}:{String(n.sentAt.getMinutes()).padStart(2, '0')}
                              </span>
                            </div>
                            <p className={`text-xs line-clamp-1 break-all ${!n.readAt ? 'text-black-600' : 'text-black-400'}`}>
                              {n.content}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-tighter text-black-300">
                                {n.type}
                              </span>
                              {!n.readAt && (
                                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-black-400">
                      <div className="w-16 h-16 bg-black-50 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-bold">暫無新通知</p>
                      <p className="text-xs mt-1">切換分類或稍後再試</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black-50/50 border-t border-black-50 text-center">
                  <button className="text-xs font-bold text-black-400 hover:text-black-600 transition-colors">
                    查看所有歷史通知
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Tab Modal */}
      {createPortal(
        <AnimatePresence>
          {isAddTabModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setIsAddTabModalOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
                <h3 className="text-xl font-black text-black-800 mb-2 tracking-tight">新增客製分類</h3>
                <p className="text-sm text-black-500 mb-6 font-medium">建立專屬的通知頁籤，並可啟用 Webhook 接收外部消息。</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">分類名稱</label>
                    <input
                      type="text"
                      autoFocus
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      placeholder="例如：伺服器監控"
                      className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsAddTabModalOpen(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-black-500 hover:bg-black-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={addNewTab}
                      disabled={!newTabName}
                      className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      建立分類
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Webhook Modal */}
      {createPortal(
        <AnimatePresence>
          {isWebhookModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setIsWebhookModalOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-30 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-black-800 tracking-tight">Webhook 配置</h3>
                  </div>
                  <button onClick={() => setIsWebhookModalOpen(false)} className="p-2 hover:bg-black-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-black-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Target Selection */}
                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-3">推送對象範圍</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: '全體推播', icon: Globe },
                        { id: 'users', label: '指定人員', icon: Smartphone },
                        { id: 'depts', label: '指定部門', icon: LayoutDashboard },
                      ].map((target) => (
                        <button
                          key={target.id}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-black-100 hover:border-primary-70 hover:bg-primary-30/30 transition-all group"
                        >
                          <target.icon className="w-5 h-5 text-black-400 group-hover:text-primary" />
                          <span className="text-xs font-bold text-black-600">{target.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL Section */}
                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">Webhook URL</label>
                    <div className="bg-black-50 p-4 rounded-xl border border-black-100 break-all font-mono text-xs text-black-600 relative group">
                      https://api.apollo.io/v1/webhooks/notify/{activeTab.toLowerCase().replace(/\s+/g, '-')}/x92k-Lp21
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://api.apollo.io/v1/webhooks/notify/${activeTab.toLowerCase().replace(/\s+/g, '-')}/x92k-Lp21`);
                          // alert('已複製到剪貼簿'); // Replaced with console log or just visual feedback if possible, but keeping it simple for now
                        }}
                        className="absolute right-2 top-2 p-1.5 bg-white rounded-lg shadow-sm border border-black-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Check className="w-3 h-3 text-green-500" />
                      </button>
                    </div>
                  </div>

                  {/* Payload Example */}
                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">JSON Payload 範例</label>
                    <div className="bg-black-900 p-4 rounded-xl font-mono text-[10px] text-primary-70 leading-relaxed">
                      <pre>{`{
  "title": "系統通知",
  "content": "您有新的消息...",
  "target_type": "all", // all, users, departments
  "targets": [] // ["user_id_1"] or ["dept_id_1"]
}`}</pre>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                    <Info className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-[10px] text-yellow-700 leading-relaxed">
                      配置完成後，外部系統可透過此 URL 發送 POST 請求。請確保 Payload 符合上述格式。
                    </p>
                  </div>

                  <button
                    onClick={() => setIsWebhookModalOpen(false)}
                    className="w-full py-3 bg-black-800 text-white rounded-xl text-sm font-bold hover:bg-black-900 transition-colors"
                  >
                    完成配置
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

// --- Frontend Settings Page ---

type TimingMode = 'all-open' | 'all-closed' | 'period' | 'batch';

const NotificationSettings = () => {
  const [timingMode, setTimingMode] = useState<TimingMode>('period');
  
  // Timing settings
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('09:00');
  const [batchTimes, setBatchTimes] = useState(['10:00', '16:00']);

  // Channel settings
  const [channelPrefs, setChannelPrefs] = useState<Record<string, { system: boolean, email: boolean }>>({
    '官方訊息': { system: true, email: true },
    '公司公告': { system: true, email: false },
    '招募訊息': { system: false, email: true },
    '表單': { system: true, email: true },
    '排程': { system: true, email: false },
    '便利貼': { system: true, email: false },
    '任務排程': { system: true, email: true },
    '客製分類': { system: false, email: false },
  });

  const categories = [
    { name: '官方訊息', icon: Info },
    { name: '公司公告', icon: Bell },
    { name: '招募訊息', icon: Globe },
    { name: '表單', icon: FileText },
    { name: '排程', icon: Calendar },
    { name: '便利貼', icon: StickyNote },
    { name: '任務排程', icon: CheckCircle2 },
    { name: '客製分類', icon: Plus },
  ];

  const updatePref = (cat: string, type: 'system' | 'email', val: boolean) => {
    setChannelPrefs(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [type]: val }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <section>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black-800 tracking-tight">通知偏好</h1>
          <p className="text-black-500 mt-1 font-medium">管理您的 Apollo 通知接收時段與渠道配置</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-black-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary-30 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black-800">推送時段設定</h3>
                <p className="text-sm text-black-500">選擇最適合您的通知接收節奏</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {(['all-open', 'all-closed', 'period', 'batch'] as TimingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimingMode(mode)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                    timingMode === mode 
                      ? 'border-primary bg-primary-30' 
                      : 'border-black-100 hover:border-primary-70 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    timingMode === mode ? 'bg-primary text-white' : 'bg-black-50 text-black-400 group-hover:bg-primary-30 group-hover:text-primary'
                  }`}>
                    {mode === 'all-open' && <Globe className="w-5 h-5" />}
                    {mode === 'all-closed' && <Shield className="w-5 h-5" />}
                    {mode === 'period' && <Clock className="w-5 h-5" />}
                    {mode === 'batch' && <LayoutDashboard className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-black-800">
                    {mode === 'all-open' && '全開'}
                    {mode === 'all-closed' && '全關'}
                    {mode === 'period' && '接收時段'}
                    {mode === 'batch' && '批次固定時間'}
                  </h4>
                  <p className="text-xs text-black-500 mt-1">
                    {mode === 'all-open' && '即時接收所有通知'}
                    {mode === 'all-closed' && '僅接收緊急通知'}
                    {mode === 'period' && '自定義接收區間'}
                    {mode === 'batch' && '定時彙總發送'}
                  </p>
                  {timingMode === mode && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Mode Specific Settings */}
            <div className="bg-black-50/50 rounded-2xl p-6 border border-black-100">
              {timingMode === 'all-open' && (
                <div className="flex items-center gap-4 text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="font-bold italic">目前模式：全天候即時接收所有通知，不設任何限制。</p>
                </div>
              )}
              {timingMode === 'all-closed' && (
                <div className="flex items-center gap-4 text-red-500">
                  <AlertCircle className="w-6 h-6" />
                  <p className="font-bold italic">目前模式：除高優先級系統通知外，其餘通知將被靜音。</p>
                </div>
              )}
              {timingMode === 'period' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">靜音開始時間</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-white border border-black-200 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">靜音結束時間</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-white border border-black-200 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-black-400 italic">
                    * 在此時段內，中、低優先級通知將延遲至結束時間後發送。高優先級通知始終即時。
                  </p>
                </div>
              )}
              {timingMode === 'batch' && (
                <div className="space-y-6">
                  <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">批次發送時間點</label>
                  <div className="flex flex-wrap gap-3">
                    {batchTimes.map((time, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-black-200 rounded-xl px-4 py-2 shadow-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-bold text-black-700">{time}</span>
                        <button 
                          onClick={() => setBatchTimes(batchTimes.filter((_, i) => i !== idx))}
                          className="ml-2 text-black-300 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 bg-primary-30 text-primary border border-primary-70 rounded-xl px-4 py-2 hover:bg-primary-70 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-bold">新增時間</span>
                    </button>
                  </div>
                  <p className="text-xs text-black-400 italic">
                    * 通知將在上述指定時間點彙總一次性發送。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-30 flex items-center justify-center text-primary">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black-800">推播渠道設定</h3>
            <p className="text-sm text-black-500">自定義每個分類的接收渠道</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-black-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-black-50">
            {categories.map((cat) => (
              <div key={cat.name} className="p-6 hover:bg-black-50/50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-black-100 shadow-sm flex items-center justify-center text-black-400 group-hover:text-primary group-hover:border-primary-70 transition-all">
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-black-800">{cat.name}</h4>
                      <p className="text-xs text-black-500 mt-0.5">自定義接收此分類消息的管道</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-black-400 uppercase tracking-tighter">System</span>
                        <span className="text-xs font-bold text-black-700">系統推播</span>
                      </div>
                      <Switch 
                        checked={channelPrefs[cat.name].system} 
                        onChange={(val) => updatePref(cat.name, 'system', val)} 
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-black-400 uppercase tracking-tighter">Email</span>
                        <span className="text-xs font-bold text-black-700">郵件通知</span>
                      </div>
                      <Switch 
                        checked={channelPrefs[cat.name].email} 
                        onChange={(val) => updatePref(cat.name, 'email', val)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-primary rounded-2xl p-6 text-white flex items-center justify-between shadow-xl shadow-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">安全提醒</h4>
              <p className="text-sm text-primary-30">高優先級通知（如帳戶異常）將自動無視上述設定，同時透過所有渠道發送。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Admin Console Page ---

const AdminConsole = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'categories' | 'customers' | 'official'>('categories');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [historyView, setHistoryView] = useState<'sends' | 'errors' | null>(null);

  // Mock data for charts
  const sendHistoryData = Array.from({ length: 30 }, (_, i) => ({
    date: `4/${i + 1}`,
    value: Math.floor(Math.random() * 100) + 50
  }));

  const errorHistoryData = Array.from({ length: 90 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
  }));

  const adminTabs = [
    { id: 'categories', label: '分類消息設定管理', icon: LayoutDashboard },
    { id: 'customers', label: '客戶消息管理', icon: Globe },
    { id: 'official', label: '官方消息管理', icon: Bell },
  ];

  const categories = [
    { name: '官方訊息', id: 'cat_001', webhook: '.../notify/official', whitelist: 'Auth, Billing', usage: 8540, errors: 12 },
    { name: '任務排程', id: 'cat_002', webhook: '.../notify/tasks', whitelist: 'Project-M', usage: 3200, errors: 25 },
    { name: '表單審核', id: 'cat_003', webhook: '.../notify/forms', whitelist: 'HR-Portal', usage: 1100, errors: 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-black-800 tracking-tight">系統商後台</h1>
          <p className="text-black-500 mt-1 font-medium">管理全局消息分發、客戶配置與官方公告發送</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-black-100 shadow-sm">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeAdminTab === tab.id 
                  ? 'bg-black-800 text-white shadow-lg shadow-black-800/20' 
                  : 'text-black-500 hover:bg-black-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeAdminTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Table */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-black-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black-50 flex justify-between items-center">
                  <h3 className="font-bold text-black-800">消息分類維護</h3>
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsConfigModalOpen(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新增分類
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black-50/50 text-[10px] font-black text-black-400 uppercase tracking-widest">
                        <th className="px-6 py-4">分類名稱 / ID</th>
                        <th className="px-6 py-4">Webhook URL</th>
                        <th className="px-6 py-4">白名單服務</th>
                        <th className="px-6 py-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black-50">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-black-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-black-800">{cat.name}</div>
                            <div className="text-[10px] font-mono text-black-400">{cat.id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] bg-black-50 px-2 py-1 rounded text-black-500 truncate max-w-[150px]">{cat.webhook}</code>
                              <button className="text-black-300 hover:text-primary"><Check className="w-3 h-3" /></button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {cat.whitelist.split(', ').map(s => (
                                <Badge key={s} className="bg-black-50 text-black-500 border-black-100 text-[10px]">{s}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedCategory(cat);
                                setIsConfigModalOpen(true);
                              }}
                              className="p-2 text-black-300 hover:text-primary transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-black-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monitoring & Tracking */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-black-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-black-800">用量與錯誤監控</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <select className="text-[10px] font-bold bg-black-50 border border-black-100 rounded-lg px-2 py-2 outline-none">
                        <option>所有客群</option>
                        <option>VIP 客戶</option>
                        <option>企業用戶</option>
                      </select>
                      <select className="text-[10px] font-bold bg-black-50 border border-black-100 rounded-lg px-2 py-2 outline-none">
                        <option>所有來源服務</option>
                        <option>Auth Service</option>
                        <option>Billing Service</option>
                      </select>
                    </div>

                    <div className="p-4 bg-primary-30 rounded-2xl border border-primary-70">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-primary">總發送量</span>
                        <span className="text-xs font-black text-primary-dark">12,840</span>
                      </div>
                      <div className="w-full bg-primary-70 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-red-500">錯誤次數</span>
                        <span className="text-xs font-black text-red-700">42</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-black text-black-400 uppercase tracking-widest">錯誤紀錄篩選</h4>
                        <button className="text-[10px] font-bold text-primary">匯出 CSV</button>
                      </div>
                      <div className="space-y-2">
                        {[
                          { time: '14:20', msg: 'Invalid Payload Format', service: 'HR-Portal', customer: 'TSMC' },
                          { time: '13:05', msg: 'Rate Limit Exceeded', service: 'Billing', customer: 'Foxconn' },
                        ].map((log, i) => (
                          <div key={i} className="p-2 hover:bg-black-50 rounded-lg transition-colors border border-transparent hover:border-black-100">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-mono text-black-400">{log.time}</span>
                              <span className="font-bold text-red-500">{log.msg}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-black-400">
                              <span>服務: {log.service}</span>
                              <span>客戶: {log.customer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeAdminTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-black-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-black-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-black-800">客戶消息管理</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black-400" />
                    <input
                      type="text"
                      placeholder="搜尋客戶或客群..."
                      className="pl-9 pr-4 py-2 bg-black-50 border border-black-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                    />
                  </div>
                  <select className="bg-black-50 border border-black-100 rounded-xl px-3 py-2 text-sm font-bold text-black-600 outline-none">
                    <option>所有客群</option>
                    <option>VIP 客戶</option>
                    <option>企業用戶</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black-50/50 text-[10px] font-black text-black-400 uppercase tracking-widest">
                      <th className="px-6 py-4">客戶名稱</th>
                      <th className="px-6 py-4">所屬客群</th>
                      <th className="px-6 py-4">消息分類數</th>
                      <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black-50">
                    {[
                      { name: '台積電 (TSMC)', group: 'VIP 客戶', cats: 12 },
                      { name: '鴻海精密 (Foxconn)', group: 'VIP 客戶', cats: 8 },
                      { name: '聯發科 (MediaTek)', group: '企業用戶', cats: 5 },
                    ].map((cust, i) => (
                      <tr key={i} className="hover:bg-black-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-30 flex items-center justify-center text-primary font-black text-xs">
                              {cust.name[0]}
                            </div>
                            <span className="font-bold text-black-800">{cust.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-primary-30 text-primary border-primary-70">{cust.group}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-black-500">{cust.cats} 個分類</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedCustomer(cust)}
                            className="text-xs font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-tighter"
                          >
                            查看詳情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeAdminTab === 'official' && (
          <motion.div
            key="official"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-3xl border border-black-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-black-50 bg-black-50/30">
                <h3 className="text-xl font-black text-black-800 tracking-tight">發送官方消息</h3>
                <p className="text-sm text-black-500 mt-1 font-medium">發送訊息至 Email 或前台「官方公告」分頁</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">發送渠道</label>
                    <div className="flex gap-2">
                      {['Email', '官方公告'].map(c => (
                        <button key={c} className="flex-1 py-3 rounded-xl border border-black-100 font-bold text-sm hover:border-primary hover:bg-primary-30 transition-all">
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">目標對象</label>
                    <select className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20">
                      <option>所有客群</option>
                      <option>VIP 客戶</option>
                      <option>指定客戶...</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">消息標題</label>
                    <input
                      type="text"
                      placeholder="輸入公告標題"
                      className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">消息內容</label>
                    <textarea
                      rows={4}
                      placeholder="輸入公告內容..."
                      className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">優先級</label>
                    <select className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                      <option>中 (Medium)</option>
                      <option>高 (High)</option>
                      <option>低 (Low)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-black-400 mb-2 uppercase tracking-widest">跳轉連結 (選填)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    立即發送消息
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Config Modal */}
      {createPortal(
        <AnimatePresence>
          {isConfigModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setIsConfigModalOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-black-50 flex justify-between items-center bg-black-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black-800 tracking-tight">
                        {selectedCategory ? '編輯消息分類' : '新增消息分類'}
                      </h3>
                      <p className="text-[10px] text-black-400 font-bold uppercase tracking-widest">Category Configuration</p>
                    </div>
                  </div>
                  <button onClick={() => setIsConfigModalOpen(false)} className="p-2 hover:bg-black-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-black-400" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">分類標題</label>
                      <input
                        type="text"
                        defaultValue={selectedCategory?.name}
                        placeholder="例如：任務排程"
                        className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">分類 ID (自動產生)</label>
                      <div className="w-full bg-black-100 border border-black-200 rounded-xl px-4 py-3 font-mono text-sm text-black-400">
                        {selectedCategory?.id || 'cat_' + Math.random().toString(36).substr(2, 6)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">Webhook URL (自動產生)</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black-100 border border-black-200 rounded-xl px-4 py-3 font-mono text-xs text-black-400 truncate">
                        https://api.apollo.io/v1/notify/{selectedCategory?.id || 'auto-gen-id'}
                      </div>
                      <button className="px-4 bg-white border border-black-200 rounded-xl text-black-400 hover:text-primary transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-black-400 uppercase tracking-widest mb-2">白名單服務設定</label>
                    <input
                      type="text"
                      defaultValue={selectedCategory?.whitelist}
                      placeholder="輸入服務名稱，以逗號分隔 (例如: Auth, Billing)"
                      className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 font-bold text-black-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <p className="text-[10px] text-black-400 mt-2">僅允許白名單內的服務調用此 Webhook。</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setIsConfigModalOpen(false)}
                      className="flex-1 py-3 bg-black-100 text-black-600 rounded-xl font-bold hover:bg-black-200 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => setIsConfigModalOpen(false)}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                    >
                      儲存配置
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Customer Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedCustomer && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setSelectedCustomer(null)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-black-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                      {selectedCustomer.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-black-800 tracking-tight">{selectedCustomer.name}</h3>
                      <Badge className="bg-primary-30 text-primary border-primary-70 mt-1">{selectedCustomer.group}</Badge>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-black-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-black-400" />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-black-400 uppercase tracking-widest">消息發送統計</h4>
                      <div className="flex gap-2">
                        <select className="text-[10px] font-bold bg-black-50 border border-black-100 rounded-lg px-2 py-1 outline-none">
                          <option>所有來源服務</option>
                          <option>Auth Service</option>
                          <option>Billing Service</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setHistoryView('sends')}
                        className="p-4 bg-primary-30 rounded-2xl border border-primary-70 text-left hover:bg-primary-70 transition-colors group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">累計發送</div>
                          <ChevronRight className="w-3 h-3 text-primary-dark group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-2xl font-black text-primary-dark">2,480</div>
                        <div className="text-[9px] text-primary font-bold mt-1">點擊查看 30 天歷史</div>
                      </button>
                      <button 
                        onClick={() => setHistoryView('errors')}
                        className="p-4 bg-red-50 rounded-2xl border border-red-100 text-left hover:bg-red-100 transition-colors group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">異常次數</div>
                          <ChevronRight className="w-3 h-3 text-red-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-2xl font-black text-red-700">8</div>
                        <div className="text-[9px] text-red-400 font-bold mt-1">點擊查看 90 天歷史</div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {historyView && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-white border border-black-100 rounded-2xl p-4 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-[10px] font-black text-black-400 uppercase tracking-widest">
                                {historyView === 'sends' ? '近 30 天發送趨勢' : '近 90 天異常紀錄'}
                              </h5>
                              <button onClick={() => setHistoryView(null)} className="text-[10px] font-bold text-primary">關閉圖表</button>
                            </div>
                            <div className="h-40 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                {historyView === 'sends' ? (
                                  <AreaChart data={sendHistoryData}>
                                    <defs>
                                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#26aae3" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#26aae3" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f2" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#26aae3" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                  </AreaChart>
                                ) : (
                                  <BarChart data={errorHistoryData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f2" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" fill="#be3a3a" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  <section>
                    <h4 className="text-xs font-black text-black-400 uppercase tracking-widest mb-4">系統消息分類資訊</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: '官方訊息', count: 1240 },
                        { name: '任務排程', count: 850 },
                        { name: '公司公告', count: 320 },
                        { name: '表單審核', count: 70 }
                      ].map(cat => (
                        <div key={cat.name} className="p-4 bg-black-50 rounded-2xl border border-black-100 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-black-700">{cat.name}</div>
                            <div className="text-[10px] text-black-400 font-bold mt-0.5">累計: {cat.count}</div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-primary-30 text-primary border-primary-70 text-[10px]">System</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-black text-black-400 uppercase tracking-widest mb-4">客製消息分類資訊</h4>
                    <div className="space-y-3">
                      {[
                        { name: '伺服器監控', webhook: '.../notify/server-mon', status: 'Active', count: 450 },
                        { name: '客服工單', webhook: '.../notify/cs-tickets', status: 'Active', count: 120 },
                      ].map(cat => (
                        <div key={cat.name} className="p-4 bg-primary-30/30 rounded-2xl border border-primary-70">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-bold text-primary-dark">{cat.name}</span>
                              <span className="text-[10px] text-primary font-bold ml-3">累計發送: {cat.count}</span>
                            </div>
                            <Badge className="bg-primary text-white border-none text-[10px]">{cat.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] text-primary font-mono truncate">{cat.webhook}</code>
                            <button className="text-primary-light hover:text-primary"><Check className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="p-6 bg-black-50 border-t border-black-100 text-right">
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="px-6 py-2.5 bg-black-800 text-white rounded-xl font-bold hover:bg-black-900 transition-colors"
                  >
                    關閉詳情
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

// --- Main App ---

// --- Sidebar & Settings Center ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'text-black-500 hover:bg-black-50 hover:text-primary'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const SettingsCenter = ({ 
  onSelect 
}: { 
  onSelect: (view: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'settings', label: '通知偏好', icon: Bell, desc: '管理接收時段與渠道' },
    { id: 'partner', label: '合作方授權', icon: Globe, desc: '第三方 API 權限管理' },
    { id: 'ai-rules', label: 'AI 評分規則', icon: Cpu, desc: '配置智能過濾邏輯' },
    { id: 'sys-config', label: '系統配置', icon: ShieldAlert, desc: '全域參數與安全設定' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group border border-transparent ${
          isOpen ? 'bg-white border-black-100 shadow-sm' : 'hover:bg-black-50'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
          <span className="font-black text-xs">AU</span>
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-sm font-black text-black-800 truncate">Admin User</p>
          <p className="text-[10px] font-bold text-black-400 truncate">whplue07@gmail.com</p>
        </div>
        <div className={`p-1 rounded-lg bg-black-50 text-black-300 transition-all ${isOpen ? 'rotate-90 bg-primary-30 text-primary' : ''}`}>
          <ChevronRight className="w-3 h-3" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full left-0 w-72 mb-4 bg-white rounded-3xl shadow-2xl border border-black-100 overflow-hidden z-50"
          >
            <div className="p-5 border-b border-black-50 bg-black-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-black-800">系統管理員</h4>
                  <p className="text-xs font-bold text-black-400">Super Administrator</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
              </div>
            </div>
            
            <div className="p-2">
              <div className="px-4 py-2">
                <span className="text-[10px] font-black text-black-300 uppercase tracking-widest">設定中心</span>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-black-500 hover:bg-primary-30 hover:text-primary transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-black-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[10px] text-black-400 font-medium">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-black-50/50 border-t border-black-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-black-400">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span>Security Verified</span>
              </div>
              <span className="text-[10px] font-bold text-black-300">v2.4.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Partner Authorization View (Placeholder) ---
const PartnerAuthorization = () => (
  <div className="max-w-4xl mx-auto py-8 px-4">
    <div className="mb-8">
      <h1 className="text-3xl font-black text-black-800 tracking-tight">合作方授權</h1>
      <p className="text-black-500 mt-1 font-medium">管理第三方服務與合作夥伴的 API 存取權限</p>
    </div>
    <div className="bg-white rounded-3xl p-12 border border-black-100 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-black-50 flex items-center justify-center text-black-300 mb-6">
        <Globe className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-black-800 mb-2">尚無授權項目</h3>
      <p className="text-black-500 max-w-xs">目前沒有任何已授權的合作方。您可以點擊下方按鈕新增授權。</p>
      <button className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
        新增合作方授權
      </button>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'settings' | 'admin' | 'partner' | 'ai-rules' | 'sys-config'>('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-black-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-black-100 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72' : 'w-0 -translate-x-full'
        } lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 flex flex-col`}
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-black text-black-800 tracking-tighter">Apollo Admin</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 py-2">
            <span className="text-[10px] font-black text-black-300 uppercase tracking-widest">主要功能</span>
          </div>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="系統商後台" 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')} 
          />
          <SidebarItem 
            icon={UserCheck} 
            label="客戶管理" 
            active={false} 
            onClick={() => {}} 
          />
        </nav>

        <div className="p-4 border-t border-black-50 space-y-4">
          <SettingsCenter onSelect={(view) => setActiveTab(view as any)} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black-100 sticky top-0 z-40 px-4 sm:px-8">
          <div className="h-full flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-black-50 text-black-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:flex items-center gap-3 bg-black-50 px-4 py-2 rounded-full border border-black-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black-400">System Online</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <NotificationBell />
              <div className="flex items-center gap-3 pl-6 border-l border-black-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-black-800">Admin User</p>
                  <p className="text-[10px] font-bold text-black-400 uppercase tracking-tighter">Super Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-light border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-white text-xs font-black">
                  AU
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-black-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 sm:p-8"
            >
              {activeTab === 'settings' && <NotificationSettings />}
              {activeTab === 'admin' && <AdminConsole />}
              {activeTab === 'partner' && <PartnerAuthorization />}
              {['ai-rules', 'sys-config'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-black-100 flex items-center justify-center text-black-400 mb-6">
                    <Settings className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-black-800">功能開發中</h2>
                  <p className="text-black-500 mt-2">此模組正在進行最後的優化，敬請期待。</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Overlay */}
      {!isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}
    </div>
  );
}

