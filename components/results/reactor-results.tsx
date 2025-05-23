import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReactorResultsProps {
  results: {
    input: {
      [key: string]: number
    }
    output: {
      [key: string]: number
    }
  }
}

export function ReactorResults({ results }: ReactorResultsProps) {
  const MW = {
    "Isopropyl Alcohol": 60.1,
    Water: 18.02,
    "Water(l)": 18.02,
    Acetone: 58.08,
    Hydrogen: 1.01,
  }

  const inputTotal = Object.values(results.input).reduce((sum, val) => sum + val, 0)
  const inputTotalMass = Object.entries(results.input).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  const outputTotal = Object.values(results.output).reduce((sum, val) => sum + val, 0)
  const outputTotalMass = Object.entries(results.output).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactor Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead className="text-right">Input (kmol/hr)</TableHead>
              <TableHead className="text-right">Input (kg/hr)</TableHead>
              <TableHead className="text-right">Output (kmol/hr)</TableHead>
              <TableHead className="text-right">Output (kg/hr)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(results.input).map(([component, value]) => (
              <TableRow key={component}>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>TOTAL INPUT</TableCell>
              <TableCell className="text-right">{inputTotal.toFixed(2)}</TableCell>
              <TableCell className="text-right">{inputTotalMass.toFixed(2)}</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.output).map(([component, value]) => (
              <TableRow key={component}>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>TOTAL OUTPUT</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">{outputTotal.toFixed(2)}</TableCell>
              <TableCell className="text-right">{outputTotalMass.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
