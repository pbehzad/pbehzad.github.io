import type { MouseEventHandler, Ref } from 'react';

type MenuButtonProps = {
  controls: string;
  expanded: boolean;
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Flat menu control. The owning client component supplies state and focus
 * handling; this primitive only renders the accessible button.
 */
export function MenuButton({ controls, expanded, label = 'Menu', onClick, ref }: MenuButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="ui-menu-button"
      aria-controls={controls}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <MenuButtonFace label={label} />
    </button>
  );
}

/** Shared inner layers for the menu control, whether it renders as a button or a link. */
export function MenuButtonFace({ label }: { label: string }) {
  return (
    <>
      <span className="ui-menu-button__light" aria-hidden="true" />
      <span className="ui-menu-button__icon" aria-hidden="true">
        ≡
      </span>
      <span className="ui-visually-hidden">{label}</span>
    </>
  );
}
