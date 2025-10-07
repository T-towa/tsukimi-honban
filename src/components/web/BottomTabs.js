import React from 'react';
import { Home, Star, Edit3 } from 'lucide-react';

const BottomTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'home',
      label: 'ポイント',
      icon: Home,
      comingSoon: false
    },
    {
      id: 'experience',
      label: '体験',
      icon: Star,
      comingSoon: true
    },
    {
      id: 'tsukiuta',
      label: '月歌生成',
      icon: Edit3,
      comingSoon: false
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-950 via-purple-900 to-purple-800 border-t border-white/10 backdrop-blur-lg z-50">
      <div className="flex justify-around items-center py-1 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-yellow-300'
                  : 'text-white/60 hover:text-white/80'
              } ${
                tab.comingSoon ? 'relative' : ''
              }`}
            >
              <div className={`relative ${isActive ? 'transform scale-110' : ''}`}>
                <IconComponent
                  className={`w-5 h-5 mb-0.5 transition-all duration-300 ${
                    isActive
                      ? 'drop-shadow-lg'
                      : ''
                  }`}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.5))' : 'none'
                  }}
                />
                {isActive && (
                  <div className="absolute inset-0 w-5 h-5 bg-yellow-300 opacity-20 rounded-full animate-ping" />
                )}
              </div>

              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive
                  ? 'text-yellow-300'
                  : 'text-white/60'
              }`}>
                {tab.label}
              </span>

              {tab.comingSoon && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    準備中
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 月見光路のブランディング */}
      <div className="text-center pb-1">
        <p className="text-xs text-white/40">金澤月見光路 - 月歌体験アプリ</p>
      </div>
    </div>
  );
};

export default BottomTabs;