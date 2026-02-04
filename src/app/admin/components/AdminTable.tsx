'use client';

import React from 'react';
import Link from 'next/link';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  editHref: (item: Record<string, unknown>) => string;
  onDelete?: (item: Record<string, unknown>) => void;
}

export default function AdminTable({ columns, data, editHref, onDelete }: AdminTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm font-normal opacity-30 py-8">
        No items yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 py-2 border-b border-white/10">
        {columns.map((col) => (
          <div key={col.key} className="text-xs font-normal uppercase tracking-wider opacity-30 flex-1">
            {col.label}
          </div>
        ))}
        <div className="w-20" />
      </div>

      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
          {columns.map((col) => (
            <div key={col.key} className="text-sm font-normal flex-1 truncate">
              {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
            </div>
          ))}
          <div className="w-20 flex items-center gap-3">
            <Link
              href={editHref(item)}
              className="text-xs font-normal opacity-40 hover:opacity-100 transition-opacity"
            >
              edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="text-xs font-normal opacity-30 hover:opacity-100 hover:text-red-400 transition-all"
              >
                del
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
