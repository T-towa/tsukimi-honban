import React from 'react';
import { Moon, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Moon className="w-10 h-10 text-yellow-300" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 to-purple-300 bg-clip-text text-transparent">
          月歌 -つきうた-
        </h1>
        <Sparkles className="w-10 h-10 text-purple-300" />
      </div>
      <p className="text-xl text-purple-200">金澤月見光路 - 月へ想いを届ける</p>
    </header>
  );
};

export default Header;