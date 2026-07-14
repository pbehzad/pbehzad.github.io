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
      className="flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3.5"
      style={{ borderColor: '#dcdad2', background: '#fff' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-neutral-800"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" style={{ color: '#292824' }}>{label}</span>
        {description && <span className="text-xs leading-relaxed" style={{ color: '#77766f' }}>{description}</span>}
      </span>
    </label>
  );
}
