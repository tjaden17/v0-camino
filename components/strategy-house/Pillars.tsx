export const PILLARS = [
  {
    id: 'trust',
    label: 'Radical Trust',
    description:
      'Every number in Camino is verifiable. Executives must be able to trace any metric back to source. Trust is not a feature — it is the pre-condition for everything else.',
    defensible: 'Yes — verified data builds an irreversible habit loop',
    competition: 'No BI tool or dashboard earns exec-level trust at the insight layer',
    commercial: 'Trust = retention. Retention = expansion revenue.',
  },
  {
    id: 'synthesis',
    label: 'Superior Synthesis',
    description:
      'Camino surfaces what matters and explains why — across multiple data sources — in language an executive can act on immediately. The "so what" no tool currently provides.',
    defensible: 'Yes — synthesis quality compounds with customer context over time',
    competition: 'No product connects operational data to strategic decisions at exec level',
    commercial: 'Synthesis = willingness to pay. The brief is the product.',
  },
  {
    id: 'intelligence',
    label: 'Agentic Intelligence',
    description:
      'Camino proactively surfaces signals the exec did not ask for. It understands goals, learns from behaviour, and delivers the insight before the question is asked.',
    defensible: 'Yes — persistent goal context creates deep personalisation moat',
    competition: 'No clear AI-native intelligence layer in the exec tools market',
    commercial: 'Intelligence = pricing power. AI insight = premium tier.',
  },
]

export function Pillars() {
  return (
    <div className="grid grid-cols-3 gap-px bg-[#dce3e8] border-t border-[#dce3e8]">
      {PILLARS.map((pillar) => (
        <div key={pillar.id} className="bg-[#3ab8b0] px-5 py-3 text-center">
          <span className="text-white font-semibold text-sm md:text-base tracking-wide">
            {pillar.label}
          </span>
        </div>
      ))}
    </div>
  )
}
