import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between border-b border-[#D4D0C5] pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#111110]">
            Barista &amp; Operator Throughput
          </h2>
          <p className="text-xs text-[#4A4843]">
            Point allocations and reward confirmations processed per operator
          </p>
        </div>
        <span className="font-mono text-xs text-[#4A4843] tabular-nums">
          {data.length} OPERATORS
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-[#111110] hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase text-[#4A4843]">
              Operator
            </TableHead>
            <TableHead className="font-mono text-xs uppercase text-[#4A4843]">
              Role
            </TableHead>
            <TableHead className="font-mono text-xs uppercase text-[#4A4843]">
              Operations
            </TableHead>
            <TableHead className="font-mono text-xs uppercase text-[#4A4843] text-right">
              Volume Processed
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((staff) => (
            <TableRow
              key={staff.name}
              className="border-b border-[#D4D0C5] hover:bg-[#F8F6F0]"
            >
              <TableCell className="font-semibold text-[#111110]">
                {staff.name}
              </TableCell>
              <TableCell>
                <span className="border border-[#111110] bg-[#EFECE3] px-2 py-0.5 font-mono text-[11px] uppercase text-[#111110]">
                  {staff.role}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums text-[#111110]">
                {staff.activityCount} scans
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums text-right font-semibold text-[#15803D]">
                {staff.lastActive}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
