import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Copy, Download, LogOut, Hash, Wifi, WifiOff } from 'lucide-react';
import { UserList } from './UserList';
import { CursorOverlay } from './CursorOverlay';
import { RoomState } from '../types';

interface CodeEditorProps {
  roomState: RoomState;
  onCodeChange: (code: string, cursorPosition?: number) => void;
  onCursorMove: (position: number) => void;
  onLeaveRoom: () => void;
  isConnected: boolean;
  currentUserId?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  roomState,
  onCodeChange,
  onCursorMove,
  onLeaveRoom,
  isConnected,
  currentUserId
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localCode, setLocalCode] = useState(roomState.code);
  const [isTyping, setIsTyping] = useState(false);
  const [lastCursorPosition, setLastCursorPosition] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  
  useEffect(() => {
    if (!isTyping) {
      setLocalCode(roomState.code);
    }
  }, [roomState.code, isTyping]);

  const debouncedCursorMove = useCallback((position: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (position !== lastCursorPosition) {
        onCursorMove(position);
        setLastCursorPosition(position);
      }
    }, 100);
  }, [onCursorMove, lastCursorPosition]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setLocalCode(newCode);
    setIsTyping(true);
    
    onCodeChange(newCode, cursorPosition);
    
    setTimeout(() => setIsTyping(false), 500);
  };

  const handleCursorMove = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart;
      debouncedCursorMove(position);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomState.roomId);
  };

  const downloadCode = () => {
    const blob = new Blob([localCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roomState.roomId}-code.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCurrentUser = () => {
    return roomState.users.find(user => user.id === currentUserId);
  };

  const otherCursors = roomState.cursors.filter(cursor => cursor.userId !== currentUserId);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-slate-400" />
              <span className="font-mono text-lg text-white">{roomState.roomId}</span>
              <button
                onClick={copyRoomId}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy room ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-slate-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadCode}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={onLeaveRoom}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
       
        <div className="flex-1 relative">
          <div className="absolute inset-0 p-4">
            <div className="relative h-full">
              <textarea
                ref={textareaRef}
                value={localCode}
                onChange={handleCodeChange}
                onKeyUp={handleCursorMove}
                onMouseUp={handleCursorMove}
                className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed p-4 border border-slate-700/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                placeholder="Start typing your code here..."
                spellCheck={false}
                style={{
                  tabSize: 2,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              />
              
              <CursorOverlay
                cursors={otherCursors}
                textareaRef={textareaRef}
                code={localCode}
              />
            </div>
          </div>
        </div>

       
        <UserList users={roomState.users} currentUserId={currentUserId} />
      </div>

      
      <div className="bg-slate-800/30 border-t border-slate-700/50 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Lines: {localCode.split('\n').length}</span>
            <span>Characters: {localCode.length}</span>
            {getCurrentUser() && (
              <span>You: {getCurrentUser()?.username}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{roomState.users.length} user{roomState.users.length !== 1 ? 's' : ''} online</span>
            <span>Room: {roomState.roomId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};