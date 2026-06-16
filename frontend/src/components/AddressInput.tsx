import { useEffect, useRef, useState } from "react";
import { GeoPoint, searchAddresses } from "../geo";

interface AddressInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPointSelect?: (point: GeoPoint | null) => void;
  placeholder: string;
  point: "A" | "B";
  required?: boolean;
}

function splitLabel(label: string): { title: string; subtitle: string } {
  const parts = label.split(",").map((part) => part.trim());
  return {
    title: parts[0] ?? label,
    subtitle: parts.slice(1, 3).join(", ") || parts.slice(1).join(", "),
  };
}

function shortLabel(label: string): string {
  return splitLabel(label).title;
}

export default function AddressInput({
  id,
  value,
  onChange,
  onPointSelect,
  placeholder,
  point,
  required,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchAddresses(query)
        .then((items) => {
          setSuggestions(items);
          setOpen(items.length > 0);
        })
        .catch(() => {
          setSuggestions([]);
          setOpen(false);
        });
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [value]);

  function handleChange(next: string) {
    onChange(next);
    onPointSelect?.(null);
  }

  function pick(item: GeoPoint) {
    const label = shortLabel(item.label);
    onChange(label);
    onPointSelect?.(item);
    setOpen(false);
  }

  return (
    <div className="field address-field">
      <span
        className={`field__icon ${point === "B" ? "field__icon--b" : ""}`}
      >
        {point}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
      />
      {open && suggestions.length > 0 && (
        <ul className="address-suggest">
          {suggestions.map((item, index) => {
            const { title, subtitle } = splitLabel(item.label);
            return (
              <li key={`${item.lat}-${item.lon}-${index}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                >
                  <span className="address-suggest__pin">📍</span>
                  <span className="address-suggest__body">
                    <strong>{title}</strong>
                    {subtitle && <span>{subtitle}</span>}
                    {item.kind && (
                      <small className="address-suggest__kind">{item.kind}</small>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
