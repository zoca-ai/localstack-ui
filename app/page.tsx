import { MainLayout } from '@/components/layout/main-layout';
import OverviewPage from '@/app/services/overview/page';

export default function Home() {
  return (
    <MainLayout>
      <OverviewPage />
    </MainLayout>
  );
}
