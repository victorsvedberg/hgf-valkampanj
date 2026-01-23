export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card skeleton */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <div className="h-8 bg-gray-200/50 rounded-xl w-1/2 mx-auto mb-6 animate-pulse" />
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100/50 rounded-xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
          <div className="h-12 bg-gray-200/50 rounded-full w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
