import React from 'react';

const DebugOutput = ({ tsukiuta }) => {
  if (!tsukiuta) return null;

  return (
    <details className="mt-8 bg-black/20 rounded-lg p-4">
      <summary className="cursor-pointer text-sm text-purple-300">開発者用：CSV形式データ</summary>
      <pre className="mt-2 text-xs bg-black/30 p-3 rounded overflow-x-auto">
        {`impression,tsukiuta,line1,line2,line3,syllables_line1,syllables_line2,syllables_line3
"${tsukiuta.impression}","${tsukiuta.tsukiuta}","${tsukiuta.line1}","${tsukiuta.line2}","${tsukiuta.line3}",${tsukiuta.syllables_line1},${tsukiuta.syllables_line2},${tsukiuta.syllables_line3}`}
      </pre>
    </details>
  );
};

export default DebugOutput;