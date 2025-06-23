import React from 'react';
import { Users, Crown, Dot } from 'lucide-react';
import { User } from '../types';

interface UserListProps {
  users: User[];
  currentUserId?: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border-l border-slate-700/50 p-4 min-w-[250px]">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">
          Active Users ({users.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white/20"
                style={{ backgroundColor: user.color }}
              />
              <Dot className="w-4 h-4 text-green-400 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-white truncate">
                  {user.username}
                </span>
                {user.id === currentUserId && (
                  <span className="text-xs text-blue-400">(you)</span>
                )}
                {index === 0 && (
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user.id.slice(-8)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No users online</p>
        </div>
      )}
    </div>
  );
};