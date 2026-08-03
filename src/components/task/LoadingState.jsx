/**
 * LoadingState
 * Skeleton shimmer cards displayed while the API request is in-flight.
 */

function SkeletonCard() {
  return (
    <div className="task-card task-card--skel" aria-hidden="true">
      <div className="task-skel task-skel--w60 task-skel--h18" />
      <div className="task-skel task-skel--w100 task-skel--h12 task-skel--mt10" />
      <div className="task-skel task-skel--w80  task-skel--h12 task-skel--mt6" />
      <div className="task-card__footer">
        <div className="task-skel task-skel--w30 task-skel--h24 task-skel--pill" />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="task-skel task-skel--w60px task-skel--h30 task-skel--pill" />
          <div className="task-skel task-skel--w60px task-skel--h30 task-skel--pill" />
        </div>
      </div>
    </div>
  );
}

function LoadingState({ count = 3 }) {
  return (
    <div
      className="task-list"
      aria-label="Loading tasks…"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default LoadingState;
