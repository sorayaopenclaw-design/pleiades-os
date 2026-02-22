// Vercel Edge Function: /api/notion-add.js
// Add entries to Notion databases with CORS bypass

export const config = {
  runtime: 'edge',
};

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { database_id, properties } = await request.json();

    if (!database_id || !properties) {
      return new Response(JSON.stringify({ error: 'database_id and properties are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get Notion token from environment variable
    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken) {
      return new Response(JSON.stringify({ error: 'NOTION_TOKEN not configured' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Transform client-friendly properties to Notion format
    const notionProperties = transformToNotionProperties(properties);

    // Create page in Notion
    const notionResponse = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id },
        properties: notionProperties,
      }),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.json();
      return new Response(JSON.stringify({ 
        error: 'Notion API error',
        details: errorData,
        status: notionResponse.status 
      }), {
        status: notionResponse.status,
        headers: corsHeaders,
      });
    }

    const data = await notionResponse.json();

    return new Response(JSON.stringify({
      success: true,
      id: data.id,
      url: data.url,
      created_time: data.created_time,
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Notion Add Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Helper function to transform client properties to Notion format
function transformToNotionProperties(properties) {
  const notionProps = {};
  
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    
    // Detect type based on value
    if (typeof value === 'boolean') {
      notionProps[key] = { checkbox: value };
    } else if (typeof value === 'number') {
      notionProps[key] = { number: value };
    } else if (Array.isArray(value)) {
      notionProps[key] = { multi_select: value.map(v => ({ name: v })) };
    } else if (value.startsWith && value.startsWith('http')) {
      notionProps[key] = { url: value };
    } else if (key.toLowerCase().includes('date')) {
      notionProps[key] = { date: { start: value } };
    } else if (key.toLowerCase() === 'name' || key.toLowerCase() === 'title') {
      notionProps[key] = { title: [{ text: { content: value } }] };
    } else if (['status', 'state', 'stage'].includes(key.toLowerCase())) {
      notionProps[key] = { status: { name: value } };
    } else if (key.toLowerCase().includes('select')) {
      notionProps[key] = { select: { name: value } };
    } else {
      // Default to rich text
      notionProps[key] = { rich_text: [{ text: { content: value } }] };
    }
  }
  
  return notionProps;
}
