// Hero posture animation — the spine slouches amber, a "Sit Straight" reminder
// sweeps in from the left and glows, and the spine straightens to green in
// response. Pure CSS (keyframes in globals.css); decorative only.
//   variant="showcase" — free-standing hero star: full intensity, with the pill.
//   variant="subtle"   — faint ambient backdrop behind sub-page hero text (spine only).
// First block is the base (column-reverse stacks it at the bottom); the last is
// the head, which straightens last.
const BLOCKS = [
  { w: 'clamp(170px,26vw,278px)', h: 'clamp(30px,4.8vh,46px)', slx: '-12px', sly: '0px',  slr: '-2deg',   o: 0.6,  r: 12 },
  { w: 'clamp(150px,23vw,246px)', h: 'clamp(28px,4.5vh,42px)', slx: '18px',  sly: '0px',  slr: '3.5deg',  o: 0.66, r: 11 },
  { w: 'clamp(140px,22vw,236px)', h: 'clamp(28px,4.5vh,42px)', slx: '-24px', sly: '0px',  slr: '-5deg',   o: 0.72, r: 11 },
  { w: 'clamp(130px,21vw,224px)', h: 'clamp(27px,4.3vh,40px)', slx: '22px',  sly: '0px',  slr: '4.5deg',  o: 0.78, r: 10 },
  { w: 'clamp(120px,20vw,210px)', h: 'clamp(26px,4.2vh,38px)', slx: '-30px', sly: '0px',  slr: '-6.5deg', o: 0.84, r: 10 },
  { w: 'clamp(96px,16vw,174px)',  h: 'clamp(26px,4.2vh,38px)', slx: '28px',  sly: '-4px', slr: '6.5deg',  o: 0.92, r: 10 },
];

const HeroBackdrop = ({ variant = 'showcase' }) => (
  <div aria-hidden="true" data-pp="" className={`hero-anim hero-anim--${variant}`}>
    <div className="pp-layer">
      <div className="pp-stack">
        <div className="pp-ground" />
        {variant === 'showcase' && (
          <div className="pp-nudge">
            <div className="pp-beam" />
            <div className="pp-halo" />
            <div className="pp-pill"><span className="pp-pill-dot" />Sit Straight</div>
          </div>
        )}
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            className="pp-block"
            style={{
              width: b.w,
              height: b.h,
              borderRadius: b.r,
              opacity: b.o,
              animationDelay: `${i * 0.1}s, ${i * 0.1}s`,
              '--slx': b.slx,
              '--sly': b.sly,
              '--slr': b.slr,
            }}
          />
        ))}
      </div>
    </div>
    {variant === 'subtle' && <div className="hero-backdrop-veil" />}
  </div>
);

export default HeroBackdrop;
