// File: /api/config.js

// This line tells Vercel to run this on its servers, not in the browser.
export const config = {
  runtime: 'edge',
};

// This is the main function that runs when someone visits your API URL.
export default async function handler(req) {
  try {
    // 1. Ask the GitHub API for the latest commit on your *data* repository.
    const githubResponse = await fetch('https://api.github.com/repos/zantac/FootballData/branches/main');
    
    if (!githubResponse.ok) {
      // If GitHub is down or the repo is private, throw an error.
      throw new Error(`Failed to fetch from GitHub API. Status: ${githubResponse.status}`);
    }

    const branchInfo = await githubResponse.json();
    const latestCommitHash = branchInfo.commit.sha;

    // 2. Build the permanent jsDelivr URL pointing to the data file for that specific commit.
    // THIS IS THE LINE THAT WAS CHANGED
    const dataUrl = `https://cdn.jsdelivr.net/gh/zantac/FootballData@${latestCommitHash}/Youth_Scores_data.json`;

    // 3. Create the JSON response that your app will receive.
    const responsePayload = {
      latestDataUrl: dataUrl,
    };
    
    // 4. Return the response.
    // The 'Cache-Control' header is the magic part:
    // It tells Vercel's CDN to cache this response for 5 minutes (300 seconds).
    // This is fast enough for updates, and protects you from hitting API limits.
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    // If anything goes wrong, return an error message.
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
