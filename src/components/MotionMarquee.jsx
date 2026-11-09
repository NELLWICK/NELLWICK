export default function MotionMarquee({
  label,
  items,
  variant = "marquee-default",
}) {
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className={`motion-marquee ${variant}`} aria-hidden="true">
      <div className="marquee-lane marquee-lane-ghost">
        <div className="marquee-track">
          {repeatedItems.map((item, index) => (
            <span
              className="marquee-word"
              data-echo={item}
              key={`ghost-${index}`}
            >
              {item}
              <span className="marquee-star">✳</span>
            </span>
          ))}
        </div>
      </div>

      <div className="marquee-lane marquee-lane-front">
        <div className="marquee-track">
          {repeatedItems.map((item, index) => (
            <span
              className="marquee-word"
              data-echo={item}
              key={`front-${index}`}
            >
              {item}
              <span className="marquee-star">✳</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}