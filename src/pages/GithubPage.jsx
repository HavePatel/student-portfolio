import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Link2, Building2, Users, BookOpen, Calendar } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import Container from "../components/ui/Container";
import SearchBar from "../components/github/SearchBar";
import Filters from "../components/github/Filters";
import RepositoryGrid from "../components/github/RepositoryGrid";
import Pagination from "../components/github/Pagination";
import ErrorState from "../components/github/ErrorState";
import { ProfileSkeleton } from "../components/github/LoadingSkeleton";

import { useGithubUser } from "../hooks/useGithubUser";
import { useGithubRepos } from "../hooks/useGithubRepos";
import { filterRepositories } from "../utils/filterRepositories";
import { sortRepositories } from "../utils/sortRepositories";

import "../styles/github-explorer.css";

const PAGE_SIZE    = 9;
const DEFAULT_USER = "HavePatel";

/* ── ProfileCard ─────────────────────────────── */
function ProfileCard({ user }) {
  if (!user) return <ProfileSkeleton />;
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <aside className="gh-profile-card" aria-label="GitHub profile">
      <img src={user.avatar_url} alt={`${user.login} avatar`}
        className="gh-profile-card__avatar" loading="lazy" />
      <h2 className="gh-profile-card__name">{user.name || user.login}</h2>
      <a href={user.html_url} target="_blank" rel="noreferrer"
        className="gh-profile-card__login">
        <FaGithub size={14} /> @{user.login}
      </a>
      {user.bio && <p className="gh-profile-card__bio">{user.bio}</p>}
      <ul className="gh-profile-card__meta" aria-label="User details">
        {user.company  && <li><Building2 size={14} />{user.company.replace(/^@/, "")}</li>}
        {user.location && <li><MapPin    size={14} />{user.location}</li>}
        {user.blog && (
          <li>
            <Link2 size={14} />
            <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
               target="_blank" rel="noreferrer">
              {user.blog.replace(/^https?:\/\//, "")}
            </a>
          </li>
        )}
        <li><Calendar size={14} />Joined {fmtDate(user.created_at)}</li>
      </ul>
      <div className="gh-profile-card__stats">
        <div><strong>{user.public_repos}</strong><span><BookOpen size={12} />Repos</span></div>
        <div><strong>{user.followers}</strong><span><Users size={12} />Followers</span></div>
        <div><strong>{user.following}</strong><span>Following</span></div>
      </div>
    </aside>
  );
}

/* ── GithubPage ──────────────────────────────── */
function GithubPage() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const username = routeUsername ?? DEFAULT_USER;

  const [language,  setLanguage]  = useState("all");
  const [type,      setType]      = useState("all");
  const [sortBy,    setSortBy]    = useState("updated");
  const [repoQuery, setRepoQuery] = useState("");
  const [page,      setPage]      = useState(1);

  useEffect(() => { setPage(1); }, [language, type, sortBy, repoQuery, username]);

  const { user, loading: uL, error: uE, refetch: rU } = useGithubUser(username);
  const { repos, loading: rL, error: rE, refetch: rR } = useGithubRepos(username);

  const filteredRepos = useMemo(() => {
    if (!repos) return [];
    return sortRepositories(filterRepositories(repos, language, type, repoQuery), sortBy);
  }, [repos, language, type, sortBy, repoQuery]);

  const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE);
  const pagedRepos = filteredRepos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setLanguage("all"); setType("all"); setSortBy("updated"); setRepoQuery(""); setPage(1);
  }, []);

  const handleSearch = (val) => {
    if (val.trim()) navigate(`/github/${val.trim()}`);
  };

  const error   = uE || rE;
  const loading = uL || rL;

  return (
    <div className="gh-explorer">
      {/* Hero */}
      <div className="gh-explorer__hero">
        <Container>
          <p className="gh-explorer__eyebrow">GitHub Explorer</p>
          <h1 className="gh-explorer__headline">Explore Any Developer&apos;s Universe</h1>
          <p className="gh-explorer__sub">
            Search any GitHub username to browse repositories, tech stack, and activity.
          </p>
          <SearchBar
            defaultValue={routeUsername ?? ""}
            onSubmit={handleSearch}
          />
          <div className="gh-explorer__suggestions">
            {["HavePatel","facebook","google","vercel","openai","torvalds"].map((u) => (
              <button key={u} type="button" className="gh-suggestion"
                onClick={() => navigate(`/github/${u}`)}>
                {u}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        {error ? (
          <ErrorState message={error} context={username}
            onRetry={() => { rU(); rR(); }} />
        ) : (
          <div className="gh-explorer__body">
            <div className="gh-explorer__sidebar">
              <ProfileCard user={user} />
            </div>

            <main className="gh-explorer__main">
              <div className="gh-explorer__viewing">
                <span>Viewing</span>
                <strong>{username}</strong>
                {repos && (
                  <span className="gh-explorer__repo-count">
                    {repos.length} public repos
                  </span>
                )}
              </div>

              <Filters
                language={language}   onLanguageChange={setLanguage}
                type={type}           onTypeChange={setType}
                sortBy={sortBy}       onSortChange={setSortBy}
                repoQuery={repoQuery} onRepoQueryChange={setRepoQuery}
                totalCount={repos?.length ?? 0}
                filteredCount={filteredRepos.length}
              />

              <RepositoryGrid
                repos={repos}
                paginatedRepos={pagedRepos}
                loading={loading && !repos}
                username={username}
                onResetFilters={resetFilters}
                repoQuery={repoQuery}
              />

              {!loading && filteredRepos.length > PAGE_SIZE && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={filteredRepos.length}
                  pageSize={PAGE_SIZE}
                />
              )}
            </main>
          </div>
        )}
      </Container>
    </div>
  );
}

export default GithubPage;
