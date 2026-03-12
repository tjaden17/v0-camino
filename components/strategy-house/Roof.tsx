export function Roof() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Triangle roof using SVG */}
      <svg
        viewBox="0 0 960 120"
        className="w-full block"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="0,120 480,0 960,120" fill="#1a3a4a" />
      </svg>

      {/* Mission statement sits over the lower portion of the roof + bleeds into pillar area */}
      <div className="bg-[#1a3a4a] text-center py-5 px-8">
        <p className="text-white text-sm md:text-base font-semibold tracking-wide text-balance">
          Be the{' '}
          <span className="text-[#4ecdc4]">#1 executive intelligence platform</span>{' '}
          for ambitious operators — turning their data into decisions, faster than any analyst can.
        </p>
      </div>
    </div>
  )
}
