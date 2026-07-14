'use client';

interface AdminCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export default function AdminCheckbox({ label, checked, onChange, description }: AdminCheckboxProps) {
  return (
    <label
      className="flex items-start gap-3 rounded-md px-3 py-3 cursor-pointer"
      style={{ border: '1px solid #292929', background: '#111' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-white"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm" style={{ color: '#ddd' }}>{label}</span>
        {description && <span className="text-xs" style={{ color: '#666' }}>{description}</span>}
      </span>
    </label>
  );
}
