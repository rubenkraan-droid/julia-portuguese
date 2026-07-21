// Reads a Notion database (flat "Key" / "Value" table) and writes content.json.
// Runs in GitHub Actions on a schedule and on manual trigger. No dependencies —
// uses the fetch + fs that ship with Node 20.
//
// Env vars (set as GitHub secrets / in the workflow):
//   NOTION_TOKEN  – Internal integration secret from notion.so/my-integrations
//   NOTION_DB_ID  – the database id (already filled into the workflow file)

const fs = require('fs');

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DB_ID;

if (!token) {
  // Setup not finished yet (NOTION_TOKEN secret not added). Skip quietly so the
  // scheduled run doesn't fail — see README "Eenmalige setup".
  console.log('NOTION_TOKEN not set yet — skipping sync. Add the secret to enable it.');
  process.exit(0);
}
if (!dbId) {
  console.error('Missing NOTION_DB_ID');
  process.exit(1);
}

// Pull the plain text out of a Notion title or rich_text property.
function plain(prop) {
  if (!prop) return '';
  const arr = prop.title || prop.rich_text || [];
  return arr.map(function (t) { return t.plain_text; }).join('');
}

async function main() {
  let rows = [];
  let cursor;
  do {
    const res = await fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor } : {})
    });
    if (!res.ok) {
      throw new Error('Notion API ' + res.status + ': ' + (await res.text()));
    }
    const data = await res.json();
    rows = rows.concat(data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  const out = {};
  for (const row of rows) {
    const props = row.properties || {};
    const key = plain(props.Key || props.Name).trim();
    if (!key) continue;
    out[key] = plain(props.Value);
  }

  // Keep keys sorted so diffs stay small and readable.
  const sorted = {};
  Object.keys(out).sort().forEach(function (k) { sorted[k] = out[k]; });

  fs.writeFileSync('content.json', JSON.stringify(sorted, null, 2) + '\n');
  console.log('Wrote content.json with ' + Object.keys(sorted).length + ' keys.');
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
