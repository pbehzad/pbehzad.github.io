'use client';

interface FieldDefinition<T> {
  key: keyof T & string;
  label: string;
  placeholder?: string;
}

interface AdminObjectListProps<T extends object> {
  label: string;
  values: T[];
  onChange: (values: T[]) => void;
  fields: FieldDefinition<T>[];
  createValue: () => T;
  addLabel?: string;
}

export default function AdminObjectList<T extends object>({
  label,
  values,
  onChange,
  fields,
  createValue,
  addLabel = 'Add item',
}: AdminObjectListProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider" style={{ color: '#888' }}>{label}</label>
        <button type="button" onClick={() => onChange([...values, createValue()])} className="text-xs" style={{ color: '#aaa' }}>+ {addLabel}</button>
      </div>
      {values.length === 0 && <div className="rounded px-3 py-3 text-xs" style={{ border: '1px dashed #333', color: '#666' }}>No items yet.</div>}
      {values.map((value, index) => (
        <div key={index} className="grid grid-cols-1 gap-3 rounded-md p-3 md:grid-cols-[1fr_1fr_1fr_auto]" style={{ border: '1px solid #292929', background: '#111' }}>
          {fields.map((field) => (
            <label key={field.key} className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: '#666' }}>{field.label}</span>
              <input
                value={String(value[field.key] ?? '')}
                placeholder={field.placeholder}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = { ...value, [field.key]: event.target.value };
                  onChange(next);
                }}
                className="min-w-0 rounded px-2.5 py-2 text-sm outline-none"
                style={{ background: '#171717', border: '1px solid #303030', color: '#eee' }}
              />
            </label>
          ))}
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="self-end px-2 py-2 text-xs" style={{ color: '#888' }}>Remove</button>
        </div>
      ))}
    </div>
  );
}
