import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FlashResultsProps {
  results: {
    input: {
      [key: string]: number
    }
    vapor: {
      [key: string]: number
    }
    liquid: {
      [key: string]: number
    }
    losses: {
      [key: string]: number
    }
  }
}

export function FlashResults({ results }: FlashResultsProps) {
  const MW = {
    "Isopropyl Alcohol": 60.1,
    Water: 18.02,
    Acetone: 58.08,
    Hydrogen: 1.01,
  }

  const inputTotal = Object.values(results.input).reduce((sum, val) => sum + val, 0)
  const inputTotalMass = Object.entries(results.input).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  const vaporTotal = Object.values(results.vapor).reduce((sum, val) => sum + val, 0)
  const vaporTotalMass = Object.entries(results.vapor).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  const liquidTotal = Object.values(results.liquid).reduce((sum, val) => sum + val, 0)
  const liquidTotalMass = Object.entries(results.liquid).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  const lossesTotal = Object.values(results.losses).reduce((sum, val) => sum + val, 0)
  const lossesTotalMass = Object.entries(results.losses).reduce((sum, [comp, val]) => {
    return sum + val * MW[comp as keyof typeof MW]
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flash Unit Balance</CardTitle>
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
            {Object.entries(results.input).map(([component, value]) => (
              <TableRow key={`input-${component}`}>
                <TableCell>Total</TableCell>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.vapor).map(([component, value]) => (
              <TableRow key={`vapor-${component}`}>
                <TableCell>Vapor</TableCell>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>Vapor</TableCell>
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">{vaporTotal.toFixed(2)}</TableCell>
              <TableCell className="text-right">{vaporTotalMass.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.liquid).map(([component, value]) => (
              <TableRow key={`liquid-${component}`}>
                <TableCell>Liquid</TableCell>
                <TableCell>{component}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>Liquid</TableCell>
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">{liquidTotal.toFixed(2)}</TableCell>
              <TableCell className="text-right">{liquidTotalMass.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            {Object.entries(results.losses).map(([component, value]) => (
              <TableRow key={`losses-${component}`}>
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
              <TableCell className="text-right">{lossesTotal.toFixed(2)}</TableCell>
              <TableCell className="text-right">{lossesTotalMass.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell colSpan={2}>Total Output Flow</TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">{(vaporTotal + liquidTotal + lossesTotal).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                {(vaporTotalMass + liquidTotalMass + lossesTotalMass).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
