import { format } from "date-fns"
import { MoreHorizontalIcon, PencilIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function AddonsTable({ items, loading, onToggleVisible }) {
  const navigate = useNavigate()

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
          <TableHead>Visibility</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((addon) => (
          <TableRow
            key={addon.id}
            className="cursor-pointer"
            onClick={() => navigate(`/catalog/addons/${addon.id}`)}
          >
            <TableCell className="font-medium">{addon.name}</TableCell>
            <TableCell className="text-muted-foreground">{addon.slug}</TableCell>
            <TableCell>
              <Switch
                checked={addon.isActive}
                onCheckedChange={(checked) => onToggleVisible(addon, checked)}
                onClick={(event) => event.stopPropagation()}
                aria-label={addon.isActive ? `Hide ${addon.name}` : `Show ${addon.name}`}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {addon.updatedAt ? format(new Date(addon.updatedAt), "d MMM yyyy") : "—"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${addon.name}`}
                      onClick={(event) => event.stopPropagation()}
                    />
                  }
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(`/catalog/addons/${addon.id}`)
                    }}
                  >
                    <PencilIcon />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
