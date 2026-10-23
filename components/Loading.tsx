export default function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-indigo-100 rounded-full" />
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  )
}
