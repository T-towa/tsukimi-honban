import React from 'react';
import { Database, ChevronDown } from 'lucide-react';

const ConfigSection = ({
  isConfigured,
  showConfig,
  setShowConfig,
  supabaseUrl,
  setSupabaseUrl,
  supabaseAnonKey,
  setSupabaseAnonKey,
  onSaveConfig
}) => {
  return (
    <div className="mb-8">
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
      >
        <Database className="w-4 h-4" />
        {isConfigured ? 'データベース接続済み' : 'データベース設定'}
        <ChevronDown className={`w-4 h-4 transform transition-transform ${showConfig ? 'rotate-180' : ''}`} />
      </button>

      {showConfig && (
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Supabase URL (https://xxx.supabase.co)"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 rounded placeholder-white/50 text-sm"
          />
          <input
            type="password"
            placeholder="Supabase Anon Key"
            value={supabaseAnonKey}
            onChange={(e) => setSupabaseAnonKey(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 rounded placeholder-white/50 text-sm"
          />
          <button
            onClick={onSaveConfig}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm"
          >
            接続
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfigSection;