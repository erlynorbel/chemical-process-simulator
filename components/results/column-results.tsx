import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ColumnData {
  input: {
    [key: string]: number
  }
  distillate: {
    [key: string]: number
  }
  bottoms: {
    [key: string]: number
  }
  losses: {
    [key: string]: number
  }
  totalDistillate: number
}

interface ColumnResultsProps {
  acetoneColumn: ColumnData
  ipaColumn: ColumnData
}

export function ColumnResults({ acetoneColumn, ipaColumn }: ColumnResultsProps) {
  const MW = {
    "Isopropyl Alcohol": 60.1,
    Water: 18.02,
    Acetone: 58.08,
  }

  const renderColumnTable = (data: ColumnData, title: string) => {
    const inputTotal = Object.values(data.input).reduce((sum, val) => sum + val, 0)
    const inputTotalMass = Object.entries(data.input).reduce((sum, [comp, val]) => {
      return sum + val * MW[comp as keyof typeof MW]
    }, 0)

    const distillateTotal = Object.values(data.distillate).reduce((sum, val) => sum + val, 0)
    const distillateTotalMass = Object.entries(data.distillate).reduce((sum, [comp, val]) => {
      return sum + val * MW[comp as keyof typeof MW]
    }, 0)

    const bottomsTotal = Object.values(data.bottoms).reduce((sum, val) => sum + val, 0)
    const bottomsTotalMass = Object.entries(data.bottoms).reduce((sum, [comp, val]) => {
      return sum + val * MW[comp as keyof typeof MW]
    }, 0)

    const lossesTotal = Object.values(data.losses).reduce((sum, val) => sum + val, 0)
    const lossesTotalMass = Object.entries(data.losses).reduce((sum, [comp, val]) => {
      return sum + val * MW[comp as keyof typeof MW]
    }, 0)

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
              {Object.entries(data.input).map(([component, value]) => (
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
              {Object.entries(data.distillate).map(([component, value]) => (
                <TableRow key={`distillate-${component}`}>
                  <TableCell>Distillate</TableCell>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>Distillate</TableCell>
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{distillateTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">{distillateTotalMass.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Distillate</TableCell>
                <TableCell>Total Distillate</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{data.totalDistillate.toFixed(2)}</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
              </TableRow>
              {Object.entries(data.bottoms).map(([component, value]) => (
                <TableRow key={`bottoms-${component}`}>
                  <TableCell>Bottoms</TableCell>
                  <TableCell>{component}</TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{(value * MW[component as keyof typeof MW]).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>Bottoms</TableCell>
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">{bottomsTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">{bottomsTotalMass.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="border-t border-gray-200"></TableCell>
              </TableRow>
              {Object.entries(data.losses).map(([component, value]) => (
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
                <TableCell className="text-right">
                  {(distillateTotal + bottomsTotal + lossesTotal).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {(distillateTotalMass + bottomsTotalMass + lossesTotalMass).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="acetone">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="acetone">Acetone Column</TabsTrigger>
        <TabsTrigger value="ipa">IPA Column</TabsTrigger>
      </TabsList>
      <TabsContent value="acetone" className="mt-4">
        {renderColumnTable(acetoneColumn, "Acetone Column Balance")}
      </TabsContent>
      <TabsContent value="ipa" className="mt-4">
        {renderColumnTable(ipaColumn, "IPA Column Balance")}
      </TabsContent>
    </Tabs>
  )
}
