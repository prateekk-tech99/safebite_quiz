import React from 'react';
import type { Badge as BadgeType } from '../types';

interface BadgeProps {
  badge: BadgeType;
}

export default function Badge({ badge }: BadgeProps) {
  const Icon = badge.icon;
  return (
    <div className="relative group flex justify-center">
      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
        <Icon className="h-8 w-8 text-yellow-400" />
      </div>
      <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {badge.name}: {badge.description}
        <svg className="absolute text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
}