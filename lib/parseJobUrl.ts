function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseJobUrl(url: string): { company?: string; role?: string } {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");

    if (host.includes("linkedin.com")) {
      // e.g. /jobs/view/frontend-engineer-at-google-3945678901/
      const match = u.pathname.match(/\/jobs\/view\/(.+?)\/?$/);
      if (match) {
        const slug = match[1];
        const atIdx = slug.lastIndexOf("-at-");
        if (atIdx > 0) {
          const rolePart = slug.slice(0, atIdx);
          const afterAt = slug.slice(atIdx + 4).replace(/-\d+$/, "");
          return { role: toTitleCase(rolePart), company: toTitleCase(afterAt) };
        }
      }
    }

    if (host.includes("indeed.com")) {
      // /company/Company-Name/jobs/Role-Title-12345678
      const companyJobMatch = u.pathname.match(/\/company\/([^/]+)\/jobs\/([^/]+)/);
      if (companyJobMatch) {
        const company = toTitleCase(companyJobMatch[1]);
        const roleWithId = companyJobMatch[2].replace(/-[a-zA-Z0-9]{8,}$/, "");
        return { company, role: toTitleCase(roleWithId) };
      }
      // Search URL: ?q=role&company=company
      const q = u.searchParams.get("q");
      const co = u.searchParams.get("company");
      if (q || co) {
        return {
          ...(q ? { role: q } : {}),
          ...(co ? { company: co } : {}),
        };
      }
    }
  } catch {
    // not a valid URL
  }
  return {};
}
