export default function Loading() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background matching the start page */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/header_bg.webp')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    </div>
  );
}
