type HomeViewProps = {
  name: string;
};

/**
 * Home: nothing but the liquid-metal field behind the shell. The name is the
 * page heading for assistive technology only; visually the brand link
 * already carries it.
 */
export function HomeView({ name }: HomeViewProps) {
  return (
    <section className="ui-home" aria-labelledby="home-title">
      <h1 id="home-title" className="ui-visually-hidden">
        {name}
      </h1>
    </section>
  );
}
