import { memo } from "react";
import strings from "../../strings.json";

type PasswordToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
};

function PasswordToggle({
  isVisible,
  onToggle,
  className,
}: PasswordToggleProps) {
  const ariaLabel = isVisible
    ? strings.components.loginForm.hidePassword
    : strings.components.loginForm.showPassword;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        className ??
        "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
      }
      aria-label={ariaLabel}
    >
      {isVisible ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1-2.59 2.84-4.78 5.06-6.06" />
          <path d="M1 1l22 22" />
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M21.2 12.8A10.08 10.08 0 0 0 12 4c-1.7 0-3.34.4-4.8 1.1" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

export default memo(PasswordToggle);
