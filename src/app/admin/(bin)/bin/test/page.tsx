import { getBinManagersWithBins } from "./action"
import { BinTestGrid } from "./bin-test-grid"

// No headers()/cookies() call here for Next to key off, so without this it
// gets statically prerendered at build time — a frozen snapshot that never
// reflects bins/managers deleted afterward. This page controls live hardware
// and must always read current DB state.
export const dynamic = "force-dynamic"

export default async function TestBinPage() {
  const managers = await getBinManagersWithBins()

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bin Test Panel</h1>
        <p className="text-sm text-muted-foreground">
          Click a bin to send it a command over the same MQTT topics the Pi bridge listens
          on. Bins are grouped by row under their bin manager.
        </p>
      </div>

      <BinTestGrid managers={managers} />
    </div>
  )
}
