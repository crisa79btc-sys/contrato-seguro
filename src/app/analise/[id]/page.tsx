import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function AnalisePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-gray-600">Analisando seu contrato...</p>
          <p className="mt-1 text-xs text-gray-400">ID: {params.id}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
