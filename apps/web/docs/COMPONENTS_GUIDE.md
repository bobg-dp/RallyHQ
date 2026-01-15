# Components Guide (UI conventions)

This document defines which components/utilities should be used across the web app to keep UI consistent.

## Toasts (notifications)

**Use Redux-based toasts only.**

- Dispatch notifications with `addToast` from the UI slice.
- The renderer is `ToastNotification` mounted in the app shell.
- **Do not use** `useToast` or `Toaster` (removed).

**Example**

- In a component:
  - import `useAppDispatch` and `addToast`
  - dispatch `addToast({ type: "success" | "error" | "info" | "warning", message: "..." })`

## Password fields

**Use `PasswordToggle`** to keep the eye icon and behavior consistent.

- Component: `PasswordToggle` in `apps/web/src/components/custom-ui/password-toggle.tsx`.
- Use it inside `Input` wrappers for password fields.
- Ensure the `Input` has `pr-12` and error icon uses `right-10` to avoid overlap.

**Example pattern**

- `type={showPassword ? "text" : "password"}`
- `<PasswordToggle isVisible={showPassword} onToggle={...} />`

## Notes

- Prefer shared UI primitives from `apps/web/src/components/ui/*`.
- Avoid duplicating SVG icons in pages—extract to reusable components where possible.
