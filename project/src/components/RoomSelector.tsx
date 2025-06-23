import React, { useState } from 'react';
import { Users, Code, ArrowRight, Hash } from 'lucide-react';

interface RoomSelectorProps {
  onJoinRoom: (roomId: string, username: string) => void;
  isConnected: boolean;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({ onJoinRoom, isConnected }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomId = () => {
    const adjectives = ['swift', 'bright', 'cosmic', 'quantum', 'digital', 'cyber', 'turbo', 'ultra'];
    const nouns = ['coder', 'hacker', 'ninja', 'wizard', 'master', 'guru', 'elite', 'pro'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}-${noun}-${number}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !username.trim() || !isConnected) return;
    
    setIsJoining(true);
    onJoinRoom(roomId.trim(), username.trim());
    
    // Reset joining state after a delay (in case of connection issues)
    setTimeout(() => setIsJoining(false), 3000);
  };

  const handleGenerateRoom = () => {
    setRoomId(generateRoomId());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CodeSync</h1>
            <p className="text-slate-300">Real-time collaborative code editor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                Your Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-slate-200 mb-2">
                Room ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="w-full pl-12 pr-24 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleGenerateRoom}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 py-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-slate-300">
                {isConnected ? 'Connected to server' : 'Connecting...'}
              </span>
            </div>

            <button
              type="submit"
              disabled={!roomId.trim() || !username.trim() || !isConnected || isJoining}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-xl disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join Room</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center">
              Share the room ID with others to collaborate in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};