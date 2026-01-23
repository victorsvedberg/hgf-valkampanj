export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#F0EBE1] to-[#E8DFD3] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-gray-200/50 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 bg-gray-200/50 rounded-2xl w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200/30 rounded-xl w-1/2 mx-auto animate-pulse" />
        </div>

        {/* Progress card skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-100">
          <div className="h-4 bg-gray-200/50 rounded w-1/3 mx-auto mb-6 animate-pulse" />
          <div className="h-2 bg-gray-100 rounded-full mb-10" />

          {/* Steps skeleton */}
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                <div className="flex-1 pt-2">
                  <div className="h-6 bg-gray-200/30 rounded w-2/3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
