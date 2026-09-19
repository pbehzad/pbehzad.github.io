import Link from 'next/link';

type BrandLinkProps = {
  name: string;
  isCurrent?: boolean;
};

export function BrandLink({ name, isCurrent = false }: BrandLinkProps) {
  return (
    <Link className="ui-brand" href="/" aria-current={isCurrent ? 'page' : undefined}>
      {name}
    </Link>
  );
}
