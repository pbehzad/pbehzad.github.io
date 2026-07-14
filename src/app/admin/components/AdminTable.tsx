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
  if (data.length === 0) return <div className="admin-empty">No content here yet.</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={String(item.id ?? index)}>
              {columns.map((column, columnIndex) => (
                <td key={column.key}>
                  {columnIndex === 0 ? (
                    <Link href={editHref(item)} className="font-medium" style={{ color: '#24231f' }}>
                      {column.render ? column.render(item[column.key], item) : String(item[column.key] ?? '')}
                    </Link>
                  ) : column.render ? column.render(item[column.key], item) : String(item[column.key] ?? '')}
                </td>
              ))}
              <td>
                <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                  <Link href={editHref(item)} className="admin-button !min-h-0 !px-3 !py-1.5">Edit</Link>
                  {onDelete && (
                    <button type="button" onClick={() => onDelete(item)} className="admin-button admin-button-danger !min-h-0 !px-3 !py-1.5">Delete</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
