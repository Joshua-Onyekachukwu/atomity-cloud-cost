import { CloudCostSection } from '@/components/CloudCostSection';

export default function Home() {
  return (
    <main
      style={{
        minHeight:   '100dvh',
        paddingBlock: 'clamp(40px, 8vw, 80px)',
        paddingInline: 'clamp(16px, 4vw, 32px)',
      }}
    >
      <CloudCostSection />
    </main>
  );
}