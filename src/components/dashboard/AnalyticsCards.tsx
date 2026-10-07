import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Coins, RefreshCcw } from 'lucide-react'

interface AnalyticsCardsProps {
  data: {
    totalPointsIssued: number;
    activeUsers: number;
    totalRedemptions: number;
  }
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const metrics = [
    {
      title: 'Total Points Issued',
      value: data.totalPointsIssued.toLocaleString(),
      icon: Coins,
      description: 'Total points distributed to customers',
    },
    {
      title: 'Active Users',
      value: data.activeUsers.toLocaleString(),
      icon: Users,
      description: 'Users active in the last 30 days',
    },
    {
      title: 'Total Redemptions',
      value: data.totalRedemptions.toLocaleString(),
      icon: RefreshCcw,
      description: 'Total rewards redeemed',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
