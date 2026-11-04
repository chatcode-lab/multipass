export const PROJECT_CREDIT = {
  name: "chatcode.dev",
  href: "https://chatcode.dev",
  description: "remote shell for AI agents",
} as const;

export const SITE_CREDIT_TEXT = `Built using ${PROJECT_CREDIT.name} – ${PROJECT_CREDIT.description}`;
export const SITE_CREDIT_MARKDOWN = `Built using [${PROJECT_CREDIT.name}](${PROJECT_CREDIT.href}) – ${PROJECT_CREDIT.description}`;
