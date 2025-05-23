import { ProcessSimulator } from "@/components/process-simulator"
import { ProcessFlowDiagram } from "@/components/process-flow-diagram"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Acetone Process Simulator</h1>
          <p className="mt-2 text-gray-600">Chemical Engineering Process Simulation Tool</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Process Overview</h2>
              <p className="mb-4">
                This simulator calculates material, heat, and energy balances for an acetone production process from
                isopropyl alcohol. The process includes a feed drum, reactor, flash unit, scrubber, acetone column, and
                IPA column.
              </p>
              <ProcessFlowDiagram />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ProcessSimulator />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">Chemical Process Simulator © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
