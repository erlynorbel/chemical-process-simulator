import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HeatBalanceResultsProps {
  results: {
    stages: {
      equipment: string
      deltaHIn: number
      hOut: number
      qRel: number
    }[]
    totalQ: number
  }
}

export function HeatBalanceResults({ results }: HeatBalanceResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Heat Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Σ ΔH° in (kJ/h)</TableHead>
              <TableHead className="text-right">Σ Hout (kJ/h)</TableHead>
              <TableHead className="text-right">Q (Hout-Hin) (kJ/h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.stages.map((stage, index) => (
              <TableRow key={index}>
                <TableCell>{stage.equipment}</TableCell>
                <TableCell className="text-right">{stage.deltaHIn.toFixed(2)}</TableCell>
                <TableCell className="text-right">{stage.hOut.toFixed(2)}</TableCell>
                <TableCell className="text-right">{stage.qRel.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="border-t border-gray-200"></TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell colSpan={3}>TOTAL Q released/absorbed (kJ/h)</TableCell>
              <TableCell className="text-right">{results.totalQ.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
