// fields.jsx — shared enterprise form controls for auth.
// Dark surface, hairline border, 44px height, blue focus accent.
// Errors are calm: small danger-coloured text under the field.

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../ui/Icons";

const BASE_INPUT =
  "h-11 w-full rounded-control border bg-surface-elevated px-3.5 text-body text-text-primary outline-none transition-colors placeholder:text-text-muted";

function errorClass(hasError) {
  return hasError ? "border-danger/50 focus:border-danger" : "border-border focus:border-accent";
}

/** Labeled text input with inline validation message. */
export function TextField({ label, error, hint, ...props }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${BASE_INPUT} ${errorClass(error)}`}
        {...props}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

/** Password input with an accessible show/hide toggle. */
export function PasswordField({ label, error, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${BASE_INPUT} ${errorClass(error)} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1.5 text-text-muted transition-colors hover:text-text-secondary"
        >
          {show ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Select input for roles. */
export function SelectField({ label, error, options, ...props }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-text-secondary">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${BASE_INPUT} ${errorClass(error)} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%23737b87%22 stroke-width=%221.8%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m4 6 4 4 4-4%22/%3E%3C/svg%3E')] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
        {...props}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface-elevated text-text-primary">
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-err`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
