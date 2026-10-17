import { BaristaQueuePortal } from '@/components/queue/BaristaQueuePortal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kitchen Queue & Operations | BrewFlow',
  description: 'Live Barista Order Queue and Kitchen Display System',
};

export default function QueuePage() {
  return <BaristaQueuePortal />;
}
