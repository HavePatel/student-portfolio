/**
 * LoadingSkeleton
 * Shimmer skeleton for repository cards and profile sections.
 * count = how many repo card skeletons to render.
 */
function SkeletonBox({ className = "" }) {
  return <div className={`skel ${className}`} aria-hidden="true" />;
}

export function RepoCardSkeleton() {
  return (
    <div className="repo-card repo-card--skel" aria-hidden="true">
      <div className="repo-card__body">
        <SkeletonBox className="skel--w50 skel--h16" />
        <SkeletonBox className="skel--w100 skel--h12 skel--mt8" />
        <SkeletonBox className="skel--w80 skel--h12 skel--mt4" />
      </div>
      <div className="repo-card__topics">
        <SkeletonBox className="skel--pill" />
        <SkeletonBox className="skel--pill" />
      </div>
      <div className="repo-card__footer">
        <SkeletonBox className="skel--w30 skel--h12" />
        <SkeletonBox className="skel--w20 skel--h12" />
        <SkeletonBox className="skel--w20 skel--h12" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="gh-profile-skel" aria-hidden="true">
      <SkeletonBox className="skel--avatar" />
      <SkeletonBox className="skel--w40 skel--h20 skel--mt12" />
      <SkeletonBox className="skel--w60 skel--h14 skel--mt8" />
      <SkeletonBox className="skel--w80 skel--h12 skel--mt8" />
    </div>
  );
}

export function RepoDetailSkeleton() {
  return (
    <div className="repo-detail-skel" aria-label="Loading repository…">
      <SkeletonBox className="skel--w40 skel--h28 skel--mt0" />
      <SkeletonBox className="skel--w70 skel--h16 skel--mt12" />
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="skel--stat" />
        ))}
      </div>
      <SkeletonBox className="skel--w100 skel--h200 skel--mt20" />
    </div>
  );
}

function LoadingSkeleton({ count = 9 }) {
  return (
    <div className="repo-grid" aria-label="Loading repositories…" aria-busy="true">
      {[...Array(count)].map((_, i) => (
        <RepoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
