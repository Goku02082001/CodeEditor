import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();
const userColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

function getNextUserColor(roomUsers) {
  const usedColors = Array.from(roomUsers.values()).map(user => user.color);
  return userColors.find(color => !usedColors.includes(color)) || userColors[0];
}

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: '// Welcome to the collaborative code editor!\n// Start typing to see real-time collaboration in action\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
      users: new Map(),
      cursors: new Map()
    });
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    const room = ensureRoom(roomId);
    
    Array.from(socket.rooms).forEach(roomName => {
      if (roomName !== socket.id) {
        socket.leave(roomName);
        const prevRoom = rooms.get(roomName);
        if (prevRoom) {
          prevRoom.users.delete(socket.id);
          prevRoom.cursors.delete(socket.id);
          socket.to(roomName).emit('user-left', {
            userId: socket.id,
            users: Array.from(prevRoom.users.values())
          });
        }
      }
    });

    socket.join(roomId);
    
    const userColor = getNextUserColor(room.users);
    const user = {
      id: socket.id,
      username: username || `User ${socket.id.slice(-4)}`,
      color: userColor
    };
    
    room.users.set(socket.id, user);
    
    
    socket.emit('room-joined', {
      roomId,
      code: room.code,
      users: Array.from(room.users.values()),
      cursors: Array.from(room.cursors.entries()).map(([userId, cursor]) => ({
        userId,
        ...cursor,
        user: room.users.get(userId)
      }))
    });
    
   
    socket.to(roomId).emit('user-joined', {
      user,
      users: Array.from(room.users.values())
    });
    
    console.log(`User ${user.username} joined room ${roomId}`);
  });

  socket.on('code-change', (data) => {
    const { roomId, code, cursorPosition } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      room.code = code;
      
     
      if (cursorPosition !== undefined) {
        room.cursors.set(socket.id, {
          position: cursorPosition,
          timestamp: Date.now()
        });
      }
      
      
      socket.to(roomId).emit('code-updated', {
        code,
        userId: socket.id,
        cursorPosition
      });
    }
  });

  socket.on('cursor-move', (data) => {
    const { roomId, position } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      room.cursors.set(socket.id, {
        position,
        timestamp: Date.now()
      });
      
      const user = room.users.get(socket.id);
      socket.to(roomId).emit('cursor-updated', {
        userId: socket.id,
        position,
        user
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    Array.from(socket.rooms).forEach(roomId => {
      if (roomId !== socket.id) {
        const room = rooms.get(roomId);
        if (room) {
          room.users.delete(socket.id);
          room.cursors.delete(socket.id);
          
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            users: Array.from(room.users.values())
          });
          
          
          if (room.users.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} cleaned up`);
          }
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});