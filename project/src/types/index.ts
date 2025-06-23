export interface User {
  id: string;
  username: string;
  color: string;
}

export interface Cursor {
  userId: string;
  position: number;
  user: User;
}

export interface RoomState {
  roomId: string;
  code: string;
  users: User[];
  cursors: Cursor[];
}

export interface SocketEvents {
  'join-room': (data: { roomId: string; username: string }) => void;
  'room-joined': (data: RoomState) => void;
  'user-joined': (data: { user: User; users: User[] }) => void;
  'user-left': (data: { userId: string; users: User[] }) => void;
  'code-change': (data: { roomId: string; code: string; cursorPosition?: number }) => void;
  'code-updated': (data: { code: string; userId: string; cursorPosition?: number }) => void;
  'cursor-move': (data: { roomId: string; position: number }) => void;
  'cursor-updated': (data: { userId: string; position: number; user: User }) => void;
}