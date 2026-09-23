export default function InsightItem({ tag, text }) {
  return (
    <div className="insight-item">
      <span className={`insight-tag tag-${tag}`}>{tag}</span>
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}