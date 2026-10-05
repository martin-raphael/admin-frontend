"use client";

import { cn } from "@/lib/utils";

export type Spec = { key: string; value: string };

export function SpecsEditor({
  specs,
  onChange,
}: {
  specs: Spec[];
  onChange: (next: Spec[]) => void;
}) {
  function update(i: number, patch: Partial<Spec>) {
    onChange(specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function add() {
    onChange([...specs, { key: "", value: "" }]);
  }

  function remove(i: number) {
    onChange(specs.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="space-y-2">
        {specs.length === 0 && (
          <p className="muted">
            No specifications yet. Add dimensions, materials, finish, etc.
          </p>
        )}
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Key (e.g. Dimensions)"
              value={s.key}
              onChange={(e) => update(i, { key: e.target.value })}
            />
            <input
              className="input flex-[2]"
              placeholder="Value (e.g. 220 × 90 × 85 cm)"
              value={s.value}
              onChange={(e) => update(i, { value: e.target.value })}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className={cn(
                "btn-ghost shrink-0 px-3 text-red-600 hover:bg-red-50",
              )}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        + Add specification
      </button>
    </div>
  );
}