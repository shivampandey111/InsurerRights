export default function ConnectingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16">
      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-[#2A2A2A]"></div>

        <div className="absolute inset-0 rounded-full border border-transparent border-t-[#E5E5E5] animate-spin"></div>
      </div>

      <h2 className="mt-8 text-[#EAEAEA] text-lg font-light tracking-wide">
        Connecting to backend server...
      </h2>

      <p className="mt-3 max-w-md text-center text-[#666666] text-sm leading-7">
        The backend is hosted on Render's free tier and may take
        <span className="text-[#D8D8D8]"> 20–40 seconds </span>
        to wake up after inactivity.
      </p>

      <div className="mt-8 flex items-center gap-3 border border-[#242424] bg-[#111111] px-5 py-3 rounded-md">
        <span className="h-2 w-2 rounded-full bg-[#E5E5E5] animate-pulse"></span>

        <span className="text-[11px] uppercase tracking-[0.18em] text-[#777777]">
          Establishing Connection...
        </span>
      </div>
    </div>
  );
}