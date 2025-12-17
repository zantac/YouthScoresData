// File: /api/config.js

// This line tells Vercel to run this on its servers, not in the browser.
export const config = {
  runtime: 'edge',
};

// --- THIS IS THE ONLY 'export default' IN THE ENTIRE FILE ---
export default async function handler(req) {
  try {
    // 1. Ask the GitHub API for the latest commit on your *data* repository.
    const githubResponse = await fetch(
      // THE HYPHEN IS REMOVED HERE TO MATCH YOUR REPOSITORY NAME
      'https://api.github.com/repos/zantac/FootballData/branches/main',
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    
    if (!githubResponse.ok) {
      // If GitHub is down or the repo is private, throw an error.
      throw new Error(`Failed to fetch from GitHub API. Status: ${githubResponse.status}`);
    }

    const branchInfo = await githubResponse.json();
    const latestCommitHash = branchInfo.commit.sha;

    // 2. Build the permanent jsDelivr URL for your specific data file.
    // THE HYPHEN IS ALSO REMOVED HERE
    const dataUrl = `https://cdn.jsdelivr.net/gh/zantac/FootballData@${latestCommitHash}/Youth_Scores_data.json`;

    // 3. Create the JSON response that your app will receive.
    const responsePayload = {
      latestDataUrl: dataUrl,
    };
    
    // 4. Return the response.
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    // If anything goes wrong, return an error message with CORS headers too.
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
