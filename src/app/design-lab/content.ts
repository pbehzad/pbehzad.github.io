// Pure content data and shared font constants, kept separate from
// ColumnLab.tsx and SilhouetteBio.tsx so neither has to import the other
// for it — that circular import broke module evaluation order (SilhouetteBio
// needs COLUMN_ITEMS before ColumnLab's own module body had finished
// initializing it).

// ­ is a soft hyphen: pretext treats it as an optional break point,
// invisible unless a line actually breaks there (in which case it
// materializes as a trailing "-"). Pretext does not hyphenate automatically
// (see its README) — these positions are hand-placed at syllable boundaries.
const SHY = '­';

export type ContentItem = { title: string; meta?: string };

// The point of the oversized type: at rest a column is a tease, not a page —
// a title this big barely fits before it starts breaking apart, so the only
// way to actually read the list is to drag the column open.
export const COLUMN_ITEMS: Record<string, ContentItem[]> = {
  works: [
    { title: 'Si', meta: `Saxo${SHY}phone, 2x MIDI key${SHY}boards — 2026` },
    { title: 'SHIFT I', meta: `Bass Clar${SHY}i${SHY}net — 2026` },
    { title: 'Hit', meta: `En${SHY}sem${SHY}ble — 2026` },
    { title: 'Enough?', meta: `en${SHY}sem${SHY}ble — 2026` },
    { title: 'Team CEO', meta: `Flute, 2x MIDI key${SHY}boards — 2025` },
    { title: 'overwoven', meta: `en${SHY}sem${SHY}ble — 2025` },
    { title: 'one is coming…', meta: `Voice, Smart${SHY}phones — 2025` },
    { title: `over${SHY}com${SHY}pli${SHY}ca${SHY}tion`, meta: `Pi${SHY}an${SHY}o, MIDI key${SHY}board — 2025` },
    { title: '7 SHIFTS', meta: `Dou${SHY}ble Bass, 8ch Elec${SHY}tron${SHY}ics — 2025` },
    { title: 'SIMIYYA', meta: `en${SHY}sem${SHY}ble — 2023` },
    { title: `Brahms at the Sew${SHY}ing Ma${SHY}chine`, meta: `Vi${SHY}o${SHY}la, Cel${SHY}lo, pre${SHY}pared Pi${SHY}an${SHY}o — 2023` },
    { title: 'Vestige', meta: `so${SHY}lo cel${SHY}lo and live-elec${SHY}tron${SHY}ic — 2023` },
    { title: 'Tremor Tears', meta: `en${SHY}sem${SHY}ble — 2023` },
    { title: `Where two and two makes up five`, meta: `en${SHY}sem${SHY}ble — 2022` },
    { title: `The last drop of morn${SHY}ing dew`, meta: `en${SHY}sem${SHY}ble — 2022` },
    { title: 'Topsy-Turvy Town', meta: `en${SHY}sem${SHY}ble — 2020` },
  ],
  events: [
    { title: `Place${SHY}holder Ven${SHY}ue`, meta: `City — 2026` },
    { title: `Place${SHY}holder Fes${SHY}ti${SHY}val`, meta: `2026` },
    { title: `Cham${SHY}ber Se${SHY}ries`, meta: `Place${SHY}holder Hall — 2025` },
    { title: `Place${SHY}holder Bi${SHY}en${SHY}ni${SHY}al`, meta: `City — 2025` },
    { title: `Res${SHY}i${SHY}den${SHY}cy Show${SHY}case`, meta: `Place${SHY}holder In${SHY}sti${SHY}tute — 2025` },
    { title: `Place${SHY}holder Muse${SHY}um`, meta: `Sound Se${SHY}ries — 2024` },
  ],
  texts: [
    { title: `On Emer${SHY}gent Sys${SHY}tems`, meta: 'essay' },
    { title: `Notes on Eco${SHY}log${SHY}i${SHY}cal Sound`, meta: 'essay' },
    { title: `To${SHY}wards Par${SHY}tic${SHY}i${SHY}pa${SHY}to${SHY}ry Form`, meta: 'essay' },
    { title: `In${SHY}ter${SHY}view: Com${SHY}po${SHY}si${SHY}tion as Pro${SHY}cess`, meta: 'conversation' },
    { title: `Lin${SHY}er Notes for a Cham${SHY}ber Cy${SHY}cle`, meta: 'program note' },
  ],
  about: [
    {
      title: `Place${SHY}holder bi${SHY}og${SHY}ra${SHY}phy copy — com${SHY}pos${SHY}er ex${SHY}plor${SHY}ing e${SHY}mer${SHY}gent mu${SHY}si${SHY}cal sys${SHY}tems, e${SHY}co${SHY}log${SHY}i${SHY}cal sound prac${SHY}tic${SHY}es, and par${SHY}tic${SHY}i${SHY}pa${SHY}to${SHY}ry per${SHY}for${SHY}mance.`,
    },
    {
      title: `Place${SHY}holder par${SHY}a${SHY}graph two — work has been com${SHY}mis${SHY}sioned by place${SHY}holder en${SHY}sem${SHY}bles and pre${SHY}sent${SHY}ed at place${SHY}holder fes${SHY}ti${SHY}vals a${SHY}cross place${SHY}holder re${SHY}gions.`,
    },
    {
      title: `Place${SHY}holder par${SHY}a${SHY}graph three — cur${SHY}rent${SHY}ly de${SHY}vel${SHY}op${SHY}ing a place${SHY}holder pro${SHY}ject in${SHY}ves${SHY}ti${SHY}gat${SHY}ing place${SHY}holder ma${SHY}te${SHY}ri${SHY}als and place${SHY}holder tech${SHY}niques.`,
    },
  ],
  contact: [
    { title: 'hello@parhambehzad.com' },
    { title: '@parhambehzad' },
    { title: `Based in place${SHY}holder ci${SHY}ty` },
    { title: `Man${SHY}age${SHY}ment: place${SHY}holder name` },
  ],
};

export const CONTENT_FONT_FAMILY = '"JetBrains Mono", monospace';
export const HEADER_FONT_FAMILY = "'Major Mono Display', monospace";
