export default function PageIntro({ eyebrow, title, description, note }) {
  return (
    <div className="nw-page-intro">
      {eyebrow && <span className="nw-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {note && <span className="nw-page-intro__note">{note}</span>}
    </div>
  );
}
