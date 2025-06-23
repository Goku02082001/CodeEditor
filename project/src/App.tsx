import React from 'react';
import { RoomSelector } from './components/RoomSelector';
import { CodeEditor } from './components/CodeEditor';
import { useSocket } from './hooks/useSocket';

function App() {
  const {
    connected,
    roomState,
    joinRoom,
    sendCodeChange,
    sendCursorMove,
    leaveRoom,
    socket
  } = useSocket();

  const handleJoinRoom = (roomId: string, username: string) => {
    joinRoom(roomId, username);
  };

  const handleCodeChange = (code: string, cursorPosition?: number) => {
    if (roomState) {
      sendCodeChange(roomState.roomId, code, cursorPosition);
    }
  };

  const handleCursorMove = (position: number) => {
    if (roomState) {
      sendCursorMove(roomState.roomId, position);
    }
  };

  if (!roomState) {
    return (
      <RoomSelector
        onJoinRoom={handleJoinRoom}
        isConnected={connected}
      />
    );
  }

  return (
    <CodeEditor
      roomState={roomState}
      onCodeChange={handleCodeChange}
      onCursorMove={handleCursorMove}
      onLeaveRoom={leaveRoom}
      isConnected={connected}
      currentUserId={socket?.id}
    />
  );
}

export default App;