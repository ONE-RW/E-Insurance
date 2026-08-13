/**
 * Generic labeled form control. Renders an <input> by default; pass
 * as="select" or as="textarea" to change the element. Extra props are
 * forwarded to the underlying control (value, onChange, required, etc).
 *
 * Pass `icon` (a lucide-react component reference) to render a leading
 * icon inside the control — only supported for the default input element.
 */
export default function FormField({
  label,
  id,
  error,
  as = "input",
  icon: Icon,
  children,
  wrapperClassName = "",
  inputClassName = "",
  ...props
}) {
  const baseInput = `w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-navy-600 focus:ring-navy-600"
  } ${Icon ? "pl-9" : ""} ${inputClassName}`;

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {as === "select" ? (
        <select id={id} {...props} className={baseInput}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea id={id} {...props} className={baseInput} />
      ) : (
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          )}
          <input id={id} {...props} className={baseInput} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
