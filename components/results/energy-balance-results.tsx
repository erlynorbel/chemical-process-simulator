import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface EnergyBalanceResultsProps {
  results: {
    totalHIn: number
    totalHOut: number
    totalUIn: number
    totalUOut: number
    netDeltaH: number
    netDeltaU: number
  }
}

export function EnergyBalanceResults({ results }: EnergyBalanceResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Energy Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Total Enthalpy In (Σ Hin)</TableCell>
              <TableCell className="text-right">{results.totalHIn.toFixed(2)} kJ/h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Enthalpy Out (Σ Hout)</TableCell>
              <TableCell className="text-right">{results.totalHOut.toFixed(2)} kJ/h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Internal Energy In (Σ Uin)</TableCell>
              <TableCell className="text-right">{results.totalUIn.toFixed(2)} kJ/h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Internal Energy Out (Σ Uout)</TableCell>
              <TableCell className="text-right">{results.totalUOut.toFixed(2)} kJ/h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Net ΔH (Σ Hout - Σ Hin)</TableCell>
              <TableCell className="text-right">{results.netDeltaH.toFixed(2)} kJ/h</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Net ΔU (Σ Uout - Σ Uin)</TableCell>
              <TableCell className="text-right">{results.netDeltaU.toFixed(2)} kJ/h</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
