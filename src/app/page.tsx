import HomeClient from './_components/HomeClient';
import { getTotalContractsAnalyzed } from '@/lib/stats';

export default async function Home() {
  const totalAnalyzed = await getTotalContractsAnalyzed();
  return <HomeClient totalAnalyzed={totalAnalyzed} />;
}
