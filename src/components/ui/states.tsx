export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <p className="font-medium text-gray-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </div>
  );
}