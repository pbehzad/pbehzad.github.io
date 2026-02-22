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
      <div className="text-sm py-12 text-center rounded" style={{ color: '#555', background: '#151515' }}>
        No items yet.
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden" style={{ border: '1px solid #222' }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-3"
        style={{ background: '#151515', borderBottom: '1px solid #222' }}
      >
        {columns.map((col) => (
          <div key={col.key} className="text-xs font-normal uppercase tracking-wider flex-1" style={{ color: '#555' }}>
            {col.label}
          </div>
        ))}
        <div className="w-24" />
      </div>

      {/* Rows */}
      {data.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 transition-colors"
          style={{
            borderBottom: i < data.length - 1 ? '1px solid #1a1a1a' : 'none',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#151515'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        >
          {columns.map((col) => (
            <div key={col.key} className="text-sm font-normal flex-1 truncate" style={{ color: '#ccc' }}>
              {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
            </div>
          ))}
          <div className="w-24 flex items-center gap-3 justify-end">
            <Link
              href={editHref(item)}
              className="text-xs font-normal px-3 py-1 rounded transition-colors"
              style={{ background: '#1e1e1e', color: '#ccc', border: '1px solid #333' }}
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="text-xs font-normal px-3 py-1 rounded transition-colors"
                style={{ background: 'transparent', color: '#888', border: '1px solid #333' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#5a1a1a';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#888';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#333';
                }}
              >
                Del
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
