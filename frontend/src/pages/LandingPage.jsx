
export default function Landing(){
return (
  <div className="bg-[#080808] text-white font-['Inter',sans-serif] min-h-screen">

    {/*  keyframes + dot grid */}
    <style>{`
      .dot-grid {
        background-image: radial-gradient(circle, #222222 1px, transparent 1px);
        background-size: 28px 28px;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-1 { animation: fadeUp 0.55s ease 0.05s forwards; opacity: 0; }
      .fade-2 { animation: fadeUp 0.55s ease 0.15s forwards; opacity: 0; }
      .fade-3 { animation: fadeUp 0.55s ease 0.25s forwards; opacity: 0; }
      .fade-4 { animation: fadeUp 0.55s ease 0.35s forwards; opacity: 0; }
    `}</style>

    {/* NAV */}
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between
                    px-10 py-5 border-b border-[#1c1c1c]
                    bg-[rgba(8,8,8,0.92)] backdrop-blur-[12px]">

      <a href="/"
         className="font-['Space_Mono',monospace] text-[13px] font-bold
                    tracking-[0.1em] text-white no-underline">
        INSURER RIGHTS
      </a>

      <a href="/login"
         className="font-['Space_Mono',monospace] text-[11px] font-bold tracking-[0.12em]
                    uppercase text-[#080808] bg-white px-5 py-[0.6rem]
                    inline-block no-underline transition-opacity duration-150 hover:opacity-80">
        GET STARTED →
      </a>

    </nav>

    {/* ── HERO */}
    <section className="dot-grid min-h-screen flex flex-col justify-center
                        pt-[9rem] pb-[6rem] px-10">
      <div className="max-w-[1140px] mx-auto w-full flex flex-col">

        <p className="fade-1 font-['Space_Mono',monospace] text-[11px] tracking-[0.15em]
                      text-[#888] mb-9 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
          AI INSURANCE PLATFORM — INDIA
        </p>

        <h1 className="fade-2 text-[clamp(3rem,6.5vw,6rem)] font-black leading-[1.03]
                       tracking-[-0.035em] text-white mb-9">
          <span className="block">YOUR POLICY</span>
          <span className="block">IS 60 PAGES.</span>
          <span className="block text-[#3a3a3a]">YOUR CLAIM WAS</span>
          <span className="block text-[#3a3a3a]">REJECTED IN ONE LINE.</span>
        </h1>

        <p className="fade-3 text-[1.0625rem] text-[#888] leading-[1.75]
                      max-w-[500px] mb-11">
          Upload your insurance policy. Ask anything in plain language.
          Know your rights before the insurer uses them against you.
        </p>

        <div className="fade-4 flex gap-[0.875rem] items-center flex-wrap">
          <a href="/login"
             className="font-['Space_Mono',monospace] text-[11px] font-bold tracking-[0.12em]
                        uppercase text-[#080808] bg-white px-5 py-[0.6rem]
                        inline-block no-underline transition-opacity duration-150 hover:opacity-80">
            UPLOAD YOUR POLICY →
          </a>
          <a href="#how"
             className="font-['Space_Mono',monospace] text-[11px] font-bold tracking-[0.12em]
                        uppercase text-[#888] bg-transparent border border-[#2a2a2a]
                        px-5 py-[0.6rem] inline-block no-underline
                        transition-[border-color,color] duration-150
                        hover:border-[#555] hover:text-white">
            HOW IT WORKS
          </a>
        </div>

      </div>
    </section>

    <hr className="border-none border-t border-[#1c1c1c] h-px bg-[#1c1c1c]" />

    {/* HOW IT WORKS  */}
    <div id="how" className="max-w-[1140px] mx-auto py-20 px-10">

      <p className="font-['Space_Mono',monospace] text-[11px] tracking-[0.15em]
                    text-[#888] mb-12">
        HOW IT WORKS
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-[#1c1c1c]">

        <div className="p-9 border-b border-[#1c1c1c] md:border-b-0 md:border-r md:border-[#1c1c1c]">
          <p className="font-['Space_Mono',monospace] text-[11px] text-[#3a3a3a] mb-6">01 ——</p>
          <p className="text-base font-bold tracking-[-0.02em] text-white mb-3">Upload your policy</p>
          <p className="text-[0.875rem] text-[#888] leading-[1.65]">
            Drop your PDF. Every clause, sub-limit, exclusion, and
            coverage table is extracted and indexed — ready for your questions.
          </p>
        </div>

        <div className="p-9 border-b border-[#1c1c1c] md:border-b-0 md:border-r md:border-[#1c1c1c]">
          <p className="font-['Space_Mono',monospace] text-[11px] text-[#3a3a3a] mb-6">02 ——</p>
          <p className="text-base font-bold tracking-[-0.02em] text-white mb-3">Ask in plain language</p>
          <p className="text-[0.875rem] text-[#888] leading-[1.65]">
            Type any question. "What is my ICU sub-limit?" "Is physiotherapy
            covered?" Get direct answers with references to the exact policy clause.
          </p>
        </div>

        <div className="p-9">
          <p className="font-['Space_Mono',monospace] text-[11px] text-[#3a3a3a] mb-6">03 ——</p>
          <p className="text-base font-bold tracking-[-0.02em] text-white mb-3">Know before you claim</p>
          <p className="text-[0.875rem] text-[#888] leading-[1.65]">
            Understand what you're entitled to before you file —
            before you get rejected, before it's too late to fight back.
          </p>
        </div>

      </div>
    </div>

    <hr className="border-none border-t border-[#1c1c1c] h-px bg-[#1c1c1c]" />

    {/* ── UPCOMING FEATURES ────────────────────────────────────────────────── */}
    <div className="max-w-[1140px] mx-auto py-20 px-10">

      <p className="font-['Space_Mono',monospace] text-[11px] tracking-[0.15em]
                    text-[#888] mb-12">
        UPCOMING FEATURES
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c1c1c] border border-[#1c1c1c]">

        <div className="bg-[#080808] p-8">
          <span className="font-['Space_Mono',monospace] text-[9px] tracking-[0.12em]
                           text-[#3a3a3a] border border-[#2a2a2a] px-[7px] py-[3px]
                           mb-5 inline-block">
            COMING NEXT
          </span>
          <p className="text-[0.9375rem] font-bold tracking-[-0.015em] text-white mb-[0.625rem]">
            Policy Comparator
          </p>
          <p className="text-[0.8125rem] text-[#888] leading-[1.6]">
            Compare two or three policies side by side. Sub-limits,
            exclusions, waiting periods — all surfaced.
          </p>
        </div>

        <div className="bg-[#080808] p-8">
          <span className="font-['Space_Mono',monospace] text-[9px] tracking-[0.12em]
                           text-[#3a3a3a] border border-[#2a2a2a] px-[7px] py-[3px]
                           mb-5 inline-block">
            COMING NEXT
          </span>
          <p className="text-[0.9375rem] font-bold tracking-[-0.015em] text-white mb-[0.625rem]">
            Claim Assistant
          </p>
          <p className="text-[0.8125rem] text-[#888] leading-[1.6]">
            Guided claim filing based on your specific policy terms
            and applicable IRDAI regulations.
          </p>
        </div>

        <div className="bg-[#080808] p-8">
          <span className="font-['Space_Mono',monospace] text-[9px] tracking-[0.12em]
                           text-[#3a3a3a] border border-[#2a2a2a] px-[7px] py-[3px]
                           mb-5 inline-block">
            COMING NEXT
          </span>
          <p className="text-[0.9375rem] font-bold tracking-[-0.015em] text-white mb-[0.625rem]">
            Rejection Analyzer
          </p>
          <p className="text-[0.8125rem] text-[#888] leading-[1.6]">
            Check if your rejection is legally valid. Generate a
            grounds-based appeal to the Insurance Ombudsman.
          </p>
        </div>

        <div className="bg-[#080808] p-8">
          <span className="font-['Space_Mono',monospace] text-[9px] tracking-[0.12em]
                           text-[#3a3a3a] border border-[#2a2a2a] px-[7px] py-[3px]
                           mb-5 inline-block">
            COMING NEXT
          </span>
          <p className="text-[0.9375rem] font-bold tracking-[-0.015em] text-white mb-[0.625rem]">
            Renewal Advisor
          </p>
          <p className="text-[0.8125rem] text-[#888] leading-[1.6]">
            Should you renew or switch? Get a recommendation based
            on your insurer's claim settlement ratio and your history.
          </p>
        </div>

      </div>
    </div>

    <hr className="border-none border-t border-[#1c1c1c] h-px bg-[#1c1c1c]" />

    {/* FOOTER */}
    <footer className="px-10 py-7 flex items-center justify-between flex-wrap gap-4">

      <span className="font-['Space_Mono',monospace] text-[11px] text-[#888] tracking-[0.06em]">
        INSURER RIGHTS — MADE BY SHIVAM PANDEY
      </span>

      <div className="flex gap-6">
        <a href="https://github.com/shivampandey111" target="_blank" rel="noreferrer"
           className="font-['Space_Mono',monospace] text-[11px] text-[#888] no-underline
                      tracking-[0.08em] transition-colors duration-150 hover:text-white">
          GITHUB
        </a>
        <a href="https://www.linkedin.com/in/shivampandey111/" target="_blank" rel="noreferrer"
           className="font-['Space_Mono',monospace] text-[11px] text-[#888] no-underline
                      tracking-[0.08em] transition-colors duration-150 hover:text-white">
          LINKEDIN
        </a>
        <a href="/login"
           className="font-['Space_Mono',monospace] text-[11px] text-[#888] no-underline
                      tracking-[0.08em] transition-colors duration-150 hover:text-white">
          GET STARTED
        </a>
      </div>

    </footer>

  </div>
);
}