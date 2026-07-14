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
        <label className="admin-field-label">{label}</label>
        <button type="button" onClick={() => onChange([...values, createValue()])} className="admin-button !min-h-0 !px-3 !py-1.5">+ {addLabel}</button>
      </div>
      {values.length === 0 && <div className="rounded-lg border border-dashed px-3 py-4 text-center text-xs" style={{ borderColor: '#c8c5bb', color: '#77766f' }}>No items yet.</div>}
      {values.map((value, index) => (
        <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto]" style={{ borderColor: '#dcdad2', background: '#f7f6f2' }}>
          {fields.map((field) => (
            <label key={field.key} className="flex min-w-0 flex-col gap-1">
              <span className="admin-field-label !text-[10px]">{field.label}</span>
              <input
                value={String(value[field.key] ?? '')}
                placeholder={field.placeholder}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = { ...value, [field.key]: event.target.value };
                  onChange(next);
                }}
                className="admin-control min-w-0"
              />
            </label>
          ))}
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="admin-button admin-button-danger self-end !min-h-0 !py-2">Remove</button>
        </div>
      ))}
    </div>
  );
}
