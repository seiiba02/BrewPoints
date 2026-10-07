import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StaffActivityProps {
  data: {
    name: string;
    role: string;
    activityCount: number;
    lastActive: string;
  }[];
}

export function StaffActivityTable({ data }: StaffActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Staff Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Activity Count</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((staff) => (
              <TableRow key={staff.name}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell>{staff.activityCount}</TableCell>
                <TableCell>{staff.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
