const GITHUB_API_URL =
   "https://api.github.com/repos/emmabostian/developer-portfolios/contents/README.md";

let cachedLinks = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchReadmeFromGitHub() {
   const response = await fetch(GITHUB_API_URL);
   const data = await response.json();
   return atob(data.content);
}

function parseLinksFromMarkdown(markdownContent) {
   const links = [];
   const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
   let match;

   while ((match = linkRegex.exec(markdownContent)) !== null) {
      const name = match[1].trim();
      const url = match[2].trim();

      if (
         url.startsWith("http") &&
         !url.includes("#") &&
         !url.includes("mailto:")
      ) {
         links.push({ name, url });
      }
   }

   return links;
}

export async function getUpdatedLinks() {
   const now = Date.now();
   if (cachedLinks && now - lastFetchTime < CACHE_DURATION) {
      return cachedLinks;
   }

   const markdownContent = await fetchReadmeFromGitHub();
   const newLinks = parseLinksFromMarkdown(markdownContent);

   cachedLinks = newLinks;
   lastFetchTime = now;
   console.log(`Загружено ${newLinks.length} сайтов`);
   return newLinks;
}
