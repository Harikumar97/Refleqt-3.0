'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string | number;
  badgeType?: 'new' | 'count' | 'beta';
  status?: 'running' | 'completed';
  locked?: boolean;
  children?: { id: string; label: string; icon: string; href: string }[];
}

const navigation: { group: string; items: NavItem[] }[] = [
  {
    group: 'Intelligence Platform',
    items: [
      {
        id: 'intelligence-feed',
        label: 'Intelligence Feed',
        icon: '📊',
        href: '/portal',
        badge: 3,
        badgeType: 'new',
        children: [
          { id: 'feed', label: 'Live Feed', icon: '📊', href: '/portal' },
          { id: 'alerts', label: 'Smart Alerts', icon: '🚨', href: '/portal/alerts' },
          { id: 'trends', label: 'Market Trends', icon: '📈', href: '/portal/trends' },
          { id: 'obsession', label: 'Obsession Tracker', icon: '🎯', href: '/portal/obsession' },
          { id: 'settings', label: 'Feed Settings', icon: '⚙️', href: '/portal/settings' },
        ],
      },
      {
        id: 'strategy-cohorts',
        label: 'Strategy Cohorts',
        icon: '🎯',
        href: '/portal/strategy',
        status: 'running',
      },
      {
        id: 'research-swarms',
        label: 'Research Swarms',
        icon: '🔬',
        href: '/portal/research',
        badge: 12,
        badgeType: 'count',
      },
      {
        id: 'funnel-lytics',
        label: 'Funnel-lytics',
        icon: '🧠',
        href: '/portal/funnel',
        badge: 4,
        badgeType: 'count',
      },
    ],
  },
  {
    group: 'Content & Growth',
    items: [
      {
        id: 'brewery',
        label: 'The Brewery',
        icon: '🍺',
        href: '/portal/brewery',
        badge: 2,
        badgeType: 'new',
      },
      {
        id: 'expert-writers',
        label: 'Expert Writers',
        icon: '✍️',
        locked: true,
      },
    ],
  },
];

function NavButton({
  item,
  isActive,
  isExpanded,
  onToggle,
}: {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const content = (
    <>
      <span className="text-lg w-5 text-center">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
            item.badgeType === 'new'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {item.badge}
        </span>
      )}
      {item.status === 'running' && (
        <span className="text-green-400 animate-pulse">●</span>
      )}
      {item.locked && <span className="text-gray-500 text-xs">🔒</span>}
      {item.children && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={`text-gray-400 hover:text-white transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ⌄
        </button>
      )}
    </>
  );

  const baseClasses = `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
    isActive
      ? 'bg-cyan-500/15 text-cyan-400 border-r-2 border-cyan-400'
      : 'text-white hover:bg-white/5 hover:translate-x-1'
  } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;

  if (item.locked) {
    return <div className={baseClasses}>{content}</div>;
  }

  if (item.href) {
    return (
      <Link href={item.href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onToggle} className={baseClasses}>
      {content}
    </button>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(['intelligence-feed'])
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isItemActive = (item: NavItem) => {
    if (item.href === '/portal' && pathname === '/portal') return true;
    if (item.href && item.href !== '/portal' && pathname.startsWith(item.href)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Company Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center font-bold">
              R
            </div>
            <div>
              <h2 className="text-lg font-bold">Refleqt</h2>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <span>🧠</span>
                <span>Intelligence Platform</span>
              </div>
            </div>
          </div>

          {/* Obsession Score Widget */}
          <div className="bg-white/5 rounded-xl p-3 text-center backdrop-blur">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
              Obsession Score
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              8.4
            </div>
            <div className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">
              Highly Focused
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navigation.map((group) => (
            <div key={group.group} className="mb-6 px-5">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 pl-3">
                {group.group}
              </div>
              {group.items.map((item) => (
                <div key={item.id}>
                  <NavButton
                    item={item}
                    isActive={isItemActive(item)}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                  />
                  {/* Sub-navigation */}
                  {item.children && expandedItems.has(item.id) && (
                    <div className="ml-4 mt-1 mb-2 bg-cyan-500/10 rounded-lg py-2 px-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all ${
                            pathname === child.href
                              ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                              : 'text-cyan-300 hover:bg-cyan-500/10 hover:translate-x-0.5'
                          }`}
                        >
                          <span>{child.icon}</span>
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="h-px bg-white/10 mx-5 my-4" />

          {/* Settings */}
          <div className="px-5">
            <Link
              href="/portal/integrations"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-white hover:bg-white/5 transition-all"
            >
              <span className="text-lg">🔗</span>
              <span>Integrations</span>
            </Link>
            <Link
              href="/portal/settings"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-white hover:bg-white/5 transition-all"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">Alex Chen</div>
              <div className="text-[10px] text-gray-400 truncate">Founder • TaskFlow</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-md p-2.5">
            <div className="text-[10px] font-semibold text-white/80 mb-2">Platform Status</div>
            <div className="space-y-1">
              {[
                { name: 'Research Swarm', active: true },
                { name: 'Strategy Cohort', active: true },
                { name: 'Data Pipeline', syncing: true },
              ].map((status) => (
                <div key={status.name} className="flex justify-between items-center text-[10px] text-white/70">
                  <span>{status.name}</span>
                  <span
                    className={`text-[6px] ${
                      status.syncing ? 'text-orange-400 animate-pulse' : 'text-green-400'
                    }`}
                  >
                    ●
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 w-11 h-11 bg-cyan-500 text-white rounded-xl shadow-lg flex items-center justify-center"
        >
          ☰
        </button>

        {/* Welcome Header */}
        <header className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-xl font-bold">Welcome back, Alex 👋</h1>
          </div>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white rounded-t-2xl -mt-3 relative z-10">
          {children}
        </div>

        {/* Status Bar */}
        <footer className="bg-white border-t border-gray-200 px-8 py-2.5 flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Live Intelligence Active</span>
          </div>
          <div>Intelligence Feed - Live Feed</div>
          <div className="ml-auto">Last Updated: Just now</div>
        </footer>
      </main>
    </div>
  );
}
