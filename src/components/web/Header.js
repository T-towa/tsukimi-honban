import React from 'react';

const Header = () => {
  return (
    <header className="text-center mb-12 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-200 to-purple-300 bg-clip-text text-transparent">
          月に詠む
        </h1>
      </div>
      <p className="text-lg md:text-xl text-purple-200 px-4">
        月に思いを届けよう
      </p>
    </header>
  );
};

export default Header;