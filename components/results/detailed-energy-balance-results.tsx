import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EnergyBalanceEquipmentData {
  components: string[]
  inputMass: Record<string, number>
  cpIn: Record<string, number>
  cvIn: Record<string, number>
  inputTemp: number
  enthalpyIn: Record<string, number>
  internalEnergyIn: Record<string, number>
  outputMass: Record<string, number>
  cpOut: Record<string, number>
  cvOut: Record<string, number>
  outputTemp: number
  enthalpyOut: Record<string, number>
  internalEnergyOut: Record<string, number>
  totalMassIn: number
  totalMassOut: number
  totalEnthalpyIn: number
  totalEnthalpyOut: number
  totalInternalEnergyIn: number
  totalInternalEnergyOut: number
  deltaH: number
  deltaU: number
  powerRequirement: number
}

interface DetailedEnergyBalanceResultsProps {
  results: {
    equipmentData: Record<string, EnergyBalanceEquipmentData>
  }
}

export function DetailedEnergyBalanceResults({ results }: DetailedEnergyBalanceResultsProps) {
  const equipmentNames = Object.keys(results.equipmentData)

  const renderEquipmentEnergyBalance = (equipmentName: string) => {
    const data = results.equipmentData[equipmentName]

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{equipmentName} Energy Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Input Temperature: {data.inputTemp.toFixed(2)} K</p>
            <p>Output Temperature: {data.outputTemp.toFixed(2)} K</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stream</TableHead>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Mass (kg/h)</TableHead>
                <TableHead className="text-right">Cp</TableHead>
                <TableHead className="text-right">Cv</TableHead>
                <TableHead className="text-right">T (K)</TableHead>
                <TableHead className="text-right">Enthalpy (kJ/h)</TableHead>
                <TableHead className="text-right">Internal E (kJ/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Input streams */}
              {data.components.map((component) => (
                <TableRow key={`input-${component}`}>
                  <TableCell>Feed</TableCell>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right">{data.inputMass[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.cpIn[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.cvIn[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.inputTemp.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{data.enthalpyIn[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.internalEnergyIn[component]?.toFixed(2) || "0.00"}</TableCell>
                </TableRow>
              ))}

              {/* Output streams */}
              {data.components.map((component) => (
                <TableRow key={`output-${component}`}>
                  <TableCell>Product</TableCell>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right">{data.outputMass[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">{data.cpOut[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.cvOut[component]?.toFixed(4) || "0.0000"}</TableCell>
                  <TableCell className="text-right">{data.outputTemp.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{data.enthalpyOut[component]?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">
                    {data.internalEnergyOut[component]?.toFixed(2) || "0.00"}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={8} className="border-t border-gray-200"></TableCell>
              </TableRow>

              {/* Totals */}
              <TableRow className="font-medium">
                <TableCell>Total In:</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{data.totalMassIn.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{data.totalEnthalpyIn.toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.totalInternalEnergyIn.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total Out:</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{data.totalMassOut.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{data.totalEnthalpyOut.toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.totalInternalEnergyOut.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">CHANGE IN ENTHALPY (ΔH = H_out - H_in):</span>
              <span>{data.deltaH.toFixed(2)} kJ/h</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">CHANGE IN INTERNAL ENERGY (ΔU = U_out - U_in):</span>
              <span>{data.deltaU.toFixed(2)} kJ/h</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">POWER REQUIREMENT (constant):</span>
              <span>{data.powerRequirement.toFixed(2)} kJ/h</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Q'+W'in+Hin:</span>
              <span>{(data.totalEnthalpyIn + data.powerRequirement).toFixed(2)} kJ/h</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Hout+W'out:</span>
              <span>{data.totalEnthalpyOut.toFixed(2)} kJ/h</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>SUMMARY: Q'+W'in+Hin = Hout+W'out:</span>
              <span>
                {(data.totalEnthalpyIn + data.powerRequirement).toFixed(2)} = {data.totalEnthalpyOut.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Detailed Energy Balance</h2>

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
            {renderEquipmentEnergyBalance(name)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
