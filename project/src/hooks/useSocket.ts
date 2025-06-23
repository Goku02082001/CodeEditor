import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Cursor, RoomState } from '../types';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setConnected(true);
      reconnectAttempts.current = 0;
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    newSocket.on('room-joined', (data: RoomState) => {
      setRoomState(data);
    });

    newSocket.on('user-joined', (data: { user: User; users: User[] }) => {
      setRoomState(prev => prev ? { ...prev, users: data.users } : null);
    });

    newSocket.on('user-left', (data: { userId: string; users: User[] }) => {
      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          users: data.users,
          cursors: prev.cursors.filter(cursor => cursor.userId !== data.userId)
        };
      });
    });

    newSocket.on('code-updated', (data: { code: string; userId: string; cursorPosition?: number }) => {
      setRoomState(prev => {
        if (!prev) return null;
        const updatedCursors = [...prev.cursors];
        if (data.cursorPosition !== undefined) {
          const cursorIndex = updatedCursors.findIndex(c => c.userId === data.userId);
          const user = prev.users.find(u => u.id === data.userId);
          if (user) {
            const cursor: Cursor = { userId: data.userId, position: data.cursorPosition, user };
            if (cursorIndex >= 0) {
              updatedCursors[cursorIndex] = cursor;
            } else {
              updatedCursors.push(cursor);
            }
          }
        }
        return { ...prev, code: data.code, cursors: updatedCursors };
      });
    });

    newSocket.on('cursor-updated', (data: { userId: string; position: number; user: User }) => {
      setRoomState(prev => {
        if (!prev) return null;
        const updatedCursors = [...prev.cursors];
        const cursorIndex = updatedCursors.findIndex(c => c.userId === data.userId);
        const cursor: Cursor = { userId: data.userId, position: data.position, user: data.user };
        
        if (cursorIndex >= 0) {
          updatedCursors[cursorIndex] = cursor;
        } else {
          updatedCursors.push(cursor);
        }
        
        return { ...prev, cursors: updatedCursors };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, username: string) => {
    if (socket) {
      socket.emit('join-room', { roomId, username });
    }
  };

  const sendCodeChange = (roomId: string, code: string, cursorPosition?: number) => {
    if (socket) {
      socket.emit('code-change', { roomId, code, cursorPosition });
    }
  };

  const sendCursorMove = (roomId: string, position: number) => {
    if (socket) {
      socket.emit('cursor-move', { roomId, position });
    }
  };

  const leaveRoom = () => {
    setRoomState(null);
  };

  return {
    socket,
    connected,
    roomState,
    joinRoom,
    sendCodeChange,
    sendCursorMove,
    leaveRoom
  };
};