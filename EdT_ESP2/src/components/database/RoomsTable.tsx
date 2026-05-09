import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Building } from 'lucide-react'
import { fuzzySearch } from '@/lib/fuzzySearch'

interface Room {
  id: string
  code: string
  name: string
  capacity: number
  equipment: string[]
  building: string
}

interface RoomsTableProps {
  rooms: Room[]
  searchQuery: string
  selectedRoom: Room | null
  onSelectRoom: (room: Room | null) => void
}

export function RoomsTable({
  rooms,
  searchQuery,
  selectedRoom,
  onSelectRoom,
}: RoomsTableProps) {
  // Use fuzzy search for intelligent matching
  const filteredRooms = useMemo(() => {
    return fuzzySearch(rooms, searchQuery, (room) => [
      room.code,
      room.name,
      room.building,
      ...room.equipment,
    ])
  }, [rooms, searchQuery])

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="w-[100px]">Capacité</TableHead>
            <TableHead>Équipements</TableHead>
            <TableHead>Bâtiment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Aucune salle trouvée
              </TableCell>
            </TableRow>
          ) : (
            filteredRooms.map((room) => (
              <TableRow
                key={room.id}
                className={cn(
                  'cursor-pointer',
                  selectedRoom?.id === room.id && 'bg-muted'
                )}
                onClick={() =>
                  onSelectRoom(selectedRoom?.id === room.id ? null : room)
                }
              >
                <TableCell className="font-mono font-medium">{room.code}</TableCell>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{room.capacity > 0 ? room.capacity : '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.slice(0, 3).map((eq) => (
                      <Badge key={eq} variant="secondary" className="text-[10px]">
                        {eq}
                      </Badge>
                    ))}
                    {room.equipment.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{room.equipment.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building className="h-3 w-3" />
                    {room.building}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
