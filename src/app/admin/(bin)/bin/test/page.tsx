import { getBinManagersWithBins } from "./action"
import { BinTestGrid } from "./bin-test-grid"

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
