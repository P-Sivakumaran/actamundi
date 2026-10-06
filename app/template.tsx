// Re-mounts on every navigation → page-turn enter animation from the spine (left edge).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="am-page-enter">{children}</div>
}
