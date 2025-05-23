"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedDrumResults } from "./results/feed-drum-results"
import { ReactorResults } from "./results/reactor-results"
import { FlashResults } from "./results/flash-results"
import { ScrubberResults } from "./results/scrubber-results"
import { ColumnResults } from "./results/column-results"
import { HeatBalanceResults } from "./results/heat-balance-results"
import { EnergyBalanceResults } from "./results/energy-balance-results"
import { SummaryResults } from "./results/summary-results"
import { calculateProcess } from "@/lib/process-calculator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ProcessSimulator() {
  const [reactorFeed, setReactorFeed] = useState<string>("100")
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    try {
      const feedValue = Number.parseFloat(reactorFeed)
      if (isNaN(feedValue) || feedValue <= 0) {
        setError("Please enter a valid positive number for the reactor feed.")
        return
      }

      setError(null)
      const calculationResults = calculateProcess(feedValue)
      setResults(calculationResults)
    } catch (err) {
      setError("An error occurred during calculation. Please check your input.")
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Process Input Parameters</CardTitle>
          <CardDescription>Enter the total feed to the reactor in kmol/hr</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label htmlFor="reactorFeed" className="text-sm font-medium">
                  Total Reactor Feed (kmol/hr)
                </label>
                <Input
                  id="reactorFeed"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={reactorFeed}
                  onChange={(e) => setReactorFeed(e.target.value)}
                  placeholder="Enter feed rate"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCalculate}>Calculate Process</Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {results && !error && (
              <div className="mt-2 text-sm">
                <p>
                  <span className="font-medium">Isopropyl Alcohol:</span> {results.feedComposition.ipa.toFixed(2)}{" "}
                  kmol/hr
                </p>
                <p>
                  <span className="font-medium">Water:</span> {results.feedComposition.water.toFixed(2)} kmol/hr
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="feed-drum">Feed Drum</TabsTrigger>
            <TabsTrigger value="reactor">Reactor</TabsTrigger>
            <TabsTrigger value="flash">Flash Unit</TabsTrigger>
            <TabsTrigger value="scrubber">Scrubber</TabsTrigger>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="heat">Heat Balance</TabsTrigger>
            <TabsTrigger value="energy">Energy Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <SummaryResults results={results} />
          </TabsContent>

          <TabsContent value="feed-drum" className="mt-4">
            <FeedDrumResults results={results.feedDrum} />
          </TabsContent>

          <TabsContent value="reactor" className="mt-4">
            <ReactorResults results={results.reactor} />
          </TabsContent>

          <TabsContent value="flash" className="mt-4">
            <FlashResults results={results.flash} />
          </TabsContent>

          <TabsContent value="scrubber" className="mt-4">
            <ScrubberResults results={results.scrubber} />
          </TabsContent>

          <TabsContent value="columns" className="mt-4">
            <ColumnResults acetoneColumn={results.acetoneColumn} ipaColumn={results.ipaColumn} />
          </TabsContent>

          <TabsContent value="heat" className="mt-4">
            <HeatBalanceResults results={results.heatBalance} />
          </TabsContent>

          <TabsContent value="energy" className="mt-4">
            <EnergyBalanceResults results={results.energyBalance} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
