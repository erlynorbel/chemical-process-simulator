import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FeedDrumResultsProps {
  results: {
    input: {
      [key: string]: number
    }
    output: {
      [key: string]: number
    }
    losses: {
      [key: string]: number
    }
  }
}

export function FeedDrumResults({ results }: FeedDrumResultsProps) {
  const MW = {
    "Isopropyl Alcohol": 60.1,
    Water: 18.02,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed Drum Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead>Component</TableHead>
              <TableHead className="text-right">Input (kmol/hr)</TableHead>
              <TableHead className="text-right">Input (kg/hr)</TableHead>
              <TableHead className="text-right">Output (kmol/hr)</TableHead>
              <TableHead className="text-right">Output (kg/hr)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(results.input).map(([component, value]) => {
              const baseComponent = component.split(" (")[0]
              return (
                <TableRow key={component}>
                  <TableCell>Total</TableCell>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {(value * MW[baseComponent as keyof typeof MW]).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.output).map(([component, value]) => (
              <TableRow key={component}>
                <TableCell>Output</TableCell>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>Output</TableCell>
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">
                {Object.values(results.output)
                  .reduce((sum, val) => sum + val, 0)
                  .toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {Object.entries(results.output)
                  .reduce((sum, [comp, val]) => {
                    return sum + val * MW[comp as keyof typeof MW]
                  }, 0)
                  .toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.losses).map(([component, value]) => (
              <TableRow key={component}>
                <TableCell>Losses</TableCell>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>Losses</TableCell>
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">
                {Object.values(results.losses)
                  .reduce((sum, val) => sum + val, 0)
                  .toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {Object.entries(results.losses)
                  .reduce((sum, [comp, val]) => {
                    return sum + val * MW[comp as keyof typeof MW]
                  }, 0)
                  .toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
