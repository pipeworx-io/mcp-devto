interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * DEV.to MCP — wraps the DEV Community API (free, no auth for public reads)
 *
 * Tools:
 * - get_articles: fetch trending or recent articles, optionally filtered by tag
 * - search_articles: browse articles by tag with pagination support
 * - get_article: fetch a single article by numeric ID
 */


const BASE = 'https://dev.to/api';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_articles',
    description:
      'Fetch trending or recent articles from DEV.to, optionally filtered by tag. Use the "top" parameter to scope to articles trending over the last N days.',
    inputSchema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'Filter articles by tag (e.g., "javascript", "python", "webdev")',
        },
        top: {
          type: 'number',
          description: 'Return top articles from the last N days (e.g., 7 for last week)',
        },
        limit: {
          type: 'number',
          description: 'Number of articles to return (default 10, max 30)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_articles',
    description:
      'Browse DEV.to articles filtered by tag with pagination. Returns title, author, tags, reactions, comments count, reading time, and URL.',
    inputSchema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'Tag to filter by (e.g., "typescript", "rust", "ai")',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination (default 1)',
        },
        limit: {
          type: 'number',
          description: 'Number of articles per page (default 10, max 30)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_article',
    description:
      'Fetch a single DEV.to article by its numeric ID. Returns title, author, body markdown, tags, reactions, comments count, and published date.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Numeric article ID',
        },
      },
      required: ['id'],
    },
  },
];

async function devtoGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${BASE}${path}${qs}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Article not found: ${path}`);
    throw new Error(`DEV.to API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

type ArticleSummary = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  url: string;
  published_at: string | null;
  tag_list: string[];
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  user: { name: string; username: string } | null;
};

function formatArticleSummary(a: ArticleSummary) {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? null,
    url: a.url,
    published_at: a.published_at ?? null,
    tags: a.tag_list,
    reading_time_minutes: a.reading_time_minutes,
    reactions: a.public_reactions_count,
    comments: a.comments_count,
    author: a.user ? { name: a.user.name, username: a.user.username } : null,
  };
}

async function getArticles(tag?: string, top?: number, limit?: number) {
  const perPage = Math.min(30, Math.max(1, limit ?? 10));
  const params: Record<string, string> = { per_page: String(perPage) };
  if (tag) params.tag = tag;
  if (top !== undefined) params.top = String(top);

  const data = (await devtoGet('/articles', params)) as ArticleSummary[];
  return {
    articles: data.map(formatArticleSummary),
  };
}

async function searchArticles(tag?: string, page?: number, limit?: number) {
  const perPage = Math.min(30, Math.max(1, limit ?? 10));
  const params: Record<string, string> = {
    per_page: String(perPage),
    page: String(page ?? 1),
  };
  if (tag) params.tag = tag;

  const data = (await devtoGet('/articles', params)) as ArticleSummary[];
  return {
    page: page ?? 1,
    articles: data.map(formatArticleSummary),
  };
}

async function getArticle(id: number) {
  const data = (await devtoGet(`/articles/${id}`)) as {
    id: number;
    title: string;
    description: string | null;
    url: string;
    published_at: string | null;
    tag_list: string[];
    reading_time_minutes: number;
    public_reactions_count: number;
    comments_count: number;
    body_markdown: string | null;
    user: { name: string; username: string } | null;
    organization: { name: string; username: string } | null;
  };

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? null,
    url: data.url,
    published_at: data.published_at ?? null,
    tags: data.tag_list,
    reading_time_minutes: data.reading_time_minutes,
    reactions: data.public_reactions_count,
    comments: data.comments_count,
    author: data.user ? { name: data.user.name, username: data.user.username } : null,
    organization: data.organization
      ? { name: data.organization.name, username: data.organization.username }
      : null,
    body_markdown: data.body_markdown ?? null,
  };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_articles':
      return getArticles(
        args.tag as string | undefined,
        args.top as number | undefined,
        args.limit as number | undefined,
      );
    case 'search_articles':
      return searchArticles(
        args.tag as string | undefined,
        args.page as number | undefined,
        args.limit as number | undefined,
      );
    case 'get_article':
      return getArticle(args.id as number);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
