// Vercel Edge Function: /api/notion.js
// Query Notion databases with CORS bypass

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
    const { database_id, filter, sorts, page_size = 100 } = await request.json();

    if (!database_id) {
      return new Response(JSON.stringify({ error: 'database_id is required' }), {
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

    // Build request body
    const body = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (page_size) body.page_size = page_size;

    // Query Notion API
    const notionResponse = await fetch(`${NOTION_API_BASE}/databases/${database_id}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

    // Transform results for simpler client-side usage
    const simplified = data.results.map(page => ({
      id: page.id,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      properties: simplifyProperties(page.properties),
    }));

    return new Response(JSON.stringify({
      results: simplified,
      has_more: data.has_more,
      next_cursor: data.next_cursor,
      total: data.results.length,
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Notion API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Helper function to simplify Notion properties
function simplifyProperties(properties) {
  const simplified = {};
  
  for (const [key, prop] of Object.entries(properties)) {
    switch (prop.type) {
      case 'title':
        simplified[key] = prop.title?.map(t => t.plain_text).join('') || '';
        break;
      case 'rich_text':
        simplified[key] = prop.rich_text?.map(t => t.plain_text).join('') || '';
        break;
      case 'select':
        simplified[key] = prop.select?.name || '';
        break;
      case 'multi_select':
        simplified[key] = prop.multi_select?.map(s => s.name) || [];
        break;
      case 'status':
        simplified[key] = prop.status?.name || '';
        break;
      case 'date':
        simplified[key] = prop.date?.start || '';
        simplified[key + '_end'] = prop.date?.end || '';
        break;
      case 'checkbox':
        simplified[key] = prop.checkbox || false;
        break;
      case 'number':
        simplified[key] = prop.number;
        break;
      case 'url':
        simplified[key] = prop.url || '';
        break;
      case 'email':
        simplified[key] = prop.email || '';
        break;
      case 'phone_number':
        simplified[key] = prop.phone_number || '';
        break;
      case 'formula':
        simplified[key] = prop.formula?.[prop.formula.type] || '';
        break;
      case 'relation':
        simplified[key] = prop.relation?.map(r => r.id) || [];
        break;
      case 'rollup':
        simplified[key] = prop.rollup?.array || prop.rollup?.number || prop.rollup?.date || '';
        break;
      case 'people':
        simplified[key] = prop.people?.map(p => p.name || p.id) || [];
        break;
      case 'files':
        simplified[key] = prop.files?.map(f => f.external?.url || f.file?.url) || [];
        break;
      default:
        simplified[key] = prop[prop.type];
    }
  }
  
  return simplified;
}
