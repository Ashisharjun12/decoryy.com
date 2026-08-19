import { format } from "date-fns"
import { PencilIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function CitiesTable({ items, loading, onEdit, onToggleActive }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((city) => (
          <TableRow key={city.id}>
            <TableCell className="font-medium">{city.name}</TableCell>
            <TableCell className="text-muted-foreground">{city.slug}</TableCell>
            <TableCell>{city.state}</TableCell>
            <TableCell>
              <Switch
                checked={city.isActive}
                onCheckedChange={(checked) => onToggleActive(city, checked)}
                aria-label={`Set ${city.name} ${city.isActive ? "inactive" : "active"}`}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {city.updatedAt ? format(new Date(city.updatedAt), "d MMM yyyy") : "—"}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(city)} aria-label={`Edit ${city.name}`}>
                <PencilIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
