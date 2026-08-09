import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100 shadow-sm">
      <Link href="/" className="block">
        <p className="font-semibold text-lg text-gray-900 leading-tight">Jobinfo MP</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">MPESB · MPPSC · MP Police · Railway</p>
      </Link>
    </header>
  );
}
