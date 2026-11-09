import StoreFrame from "@/components/StoreFrame";
import PageIntro from "@/components/PageIntro";

export default function InfoPage({ eyebrow, title, description, note, sections = [], draft = false }) {
  return (
    <StoreFrame>
      <main className="nw-page nw-info-page">
        <PageIntro eyebrow={eyebrow} title={title} description={description} note={note} />
        {draft && (
          <div className="nw-notice" role="note">
            <strong>Pre-launch draft</strong>
            <span>This information must be reviewed and completed before the store accepts customer orders.</span>
          </div>
        )}
        <div className="nw-info-sections">
          {sections.map((section, index) => (
            <section className="nw-info-section" key={`${section.title}-${index}`}>
              <span className="nw-info-section__number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {Array.isArray(section.paragraphs) && section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
                {Array.isArray(section.items) && (
                  <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </StoreFrame>
  );
}
