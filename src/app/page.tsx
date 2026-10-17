import { CustomerOrderingApp } from '@/components/ordering/CustomerOrderingApp';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_LOYALTY,
} from '@/lib/storage/seedData';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <CustomerOrderingApp
      initialCategories={INITIAL_CATEGORIES}
      initialMenuItems={INITIAL_MENU_ITEMS}
      initialLoyalty={INITIAL_LOYALTY}
    />
  );
}
