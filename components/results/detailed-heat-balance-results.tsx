import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HeatBalanceEquipmentData {
  components: string[]
  inputMass: Record<string, number>
  cpIn: Record<string, number>
  inputTemp: number
  prevInputTemp: number
  heatIn: Record<string, number>
  outputGasMass: Record<string, number>
  cpOutGas: Record<string, number>
  outputGasTemp: number
  heatOutGas: Record<string, number>
  outputLiquidMass: Record<string, number>
  cpOutLiquid: Record<string, number>
  outputLiquidTemp: number
  heatOutLiquid: Record<string, number>
  totalHeatIn: number
  totalHeatOut: number
  heatReleased: number
}

interface DetailedHeatBalanceResultsProps {
  results: {
    equipmentData: Record<string, HeatBalanceEquipmentData>
  }
}

export function DetailedHeatBalanceResults({ results }: DetailedHeatBalanceResultsProps) {
  const equipmentNames = Object.keys(results.equipmentData)

  const renderEquipmentHeatBalance = (equipmentName: string) => {
    const data = results.equipmentData[equipmentName]

    const totalInputMass = Object.values(data.inputMass).reduce((sum, val) => sum + val, 0)
    const totalOutputGasMass = Object.values(data.outputGasMass).reduce((sum, val) => sum + val, 0)
    const totalOutputLiquidMass = Object.values(data.outputLiquidMass).reduce((sum, val) => sum + val, 0)

    const totalHeatInComponents = Object.values(data.heatIn).reduce((sum, val) => sum + val, 0)
    const totalHeatOutGas = Object.values(data.heatOutGas).reduce((sum, val) => sum + val, 0)
    const totalHeatOutLiquid = Object.values(data.heatOutLiquid).reduce((sum, val) => sum + val, 0)

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{equipmentName} Heat Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Input Temperature: {data.inputTemp.toFixed(2)} K</p>
            <p>Previous Input Temperature: {data.prevInputTemp.toFixed(2)} K</p>
            <p>Output Gas Temperature: {data.outputGasTemp.toFixed(2)} K</p>
            <p>Output Liquid Temperature: {data.outputLiquidTemp.toFixed(2)} K</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Min (kg/h)</TableHead>
                <TableHead className="text-right">Cp_in</TableHead>
                <TableHead className="text-right">Hin (kJ/h)</TableHead>
                <TableHead className="text-right">Mout_gas (kg/h)</TableHead>
                <TableHead className="text-right">Cp_out_gas</TableHead>
                <TableHead className="text-right">Hout_gas (kJ/h)</TableHead>
                <TableHead className="text-right">Mout_liq (kg/h)</TableHead>
                <TableHead className="text-right">Cp_out_liq</TableHead>
                <TableHead className="text-right">Hout_liq (kJ/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.components.map((component) => (
                <TableRow key={component}>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right">{data.inputMass[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.cpIn[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.heatIn[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.outputGasMass[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.cpOutGas[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.heatOutGas[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.outputLiquidMass[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.cpOutLiquid[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.heatOutLiquid[component]?.toFixed(2) || "0.00"}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">{totalInputMass.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{totalHeatInComponents.toFixed(2)}</TableCell>
                <TableCell className="text-right">{totalOutputGasMass.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{totalHeatOutGas.toFixed(2)}</TableCell>
                <TableCell className="text-right">{totalOutputLiquidMass.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{totalHeatOutLiquid.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Σ ΔH° in (kJ/h):</span>
              <span>{data.totalHeatIn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Σ Hout (kJ/h):</span>
              <span>{data.totalHeatOut.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Q released/absorbed (Hout - Hin) (kJ/h):</span>
              <span>{data.heatReleased.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Detailed Heat Balance</h2>

      <Tabs defaultValue={equipmentNames[0]}>
        <TabsList className="mb-4 flex flex-wrap">
          {equipmentNames.map((name) => (
            <TabsTrigger key={name} value={name} className="flex-grow">
              {name}
            </TabsTrigger>
          ))}
        </TabsList>

        {equipmentNames.map((name) => (
          <TabsContent key={name} value={name}>
            {renderEquipmentHeatBalance(name)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
