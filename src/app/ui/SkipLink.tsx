type SkipLinkProps = {
  targetId: string;
  label?: string;
};

export function SkipLink({ targetId, label = 'Skip to content' }: SkipLinkProps) {
  return (
    <a className="ui-skip-link" href={`#${targetId}`}>
      {label}
    </a>
  );
}
