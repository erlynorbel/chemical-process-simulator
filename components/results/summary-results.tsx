import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface SummaryResultsProps {
  results: {
    acetoneProduced: {
      acetoneColumnDistillate: number
      ipaColumnDistillate: number
      total: number
    }
  }
}

export function SummaryResults({ results }: SummaryResultsProps) {
  const { acetoneProduced } = results

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Acetone Production Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Acetone Column Distillate</TableCell>
              <TableCell className="text-right">{acetoneProduced.acetoneColumnDistillate.toFixed(2)} kmol/hr</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">IPA Column Distillate</TableCell>
              <TableCell className="text-right">{acetoneProduced.ipaColumnDistillate.toFixed(2)} kmol/hr</TableCell>
            </TableRow>
            <TableRow className="border-t">
              <TableCell className="font-bold">TOTAL ACETONE PRODUCED</TableCell>
              <TableCell className="text-right font-bold">{acetoneProduced.total.toFixed(2)} kmol/hr</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
