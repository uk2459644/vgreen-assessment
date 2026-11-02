import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Tribe <span>Green</span>
        </Link>
        <nav aria-label="Main">
          <Link href="/">Catalogue</Link>
          <Link href="/enquiry" className="btn btn-small">
            Send enquiry
          </Link>
        </nav>
      </div>
    </header>
  );
}
