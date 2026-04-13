export function stripFences(raw: string): string {
  // Remove ```json...``` or ```...``` blocks
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export function extractJson(raw: string): string {
  // Find first { or [ and its matching close
  const startObj = raw.indexOf('{');
  const startArr = raw.indexOf('[');
  
  let start = -1;
  let openChar: string;
  let closeChar: string;
  
  if (startObj === -1 && startArr === -1) return raw;
  
  if (startObj === -1) { start = startArr; openChar = '['; closeChar = ']'; }
  else if (startArr === -1) { start = startObj; openChar = '{'; closeChar = '}'; }
  else if (startArr < startObj) { start = startArr; openChar = '['; closeChar = ']'; }
  else { start = startObj; openChar = '{'; closeChar = '}'; }
  
  let depth = 0;
  let inString = false;
  let escape = false;
  
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  
  return raw.slice(start);
}

export function repairJson(raw: string): string {
  // Remove trailing commas before } or ]
  let result = raw.replace(/,\s*([\]}])/g, '$1');
  
  // Count unclosed braces and brackets
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;
  
  for (const ch of result) {
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }
  
  // Close unclosed structures
  while (brackets > 0) { result += ']'; brackets--; }
  while (braces > 0) { result += '}'; braces--; }
  
  return result;
}

export function parseJson<T>(raw: string): T {
  const stripped = stripFences(raw);
  const extracted = extractJson(stripped);
  const repaired = repairJson(extracted);
  return JSON.parse(repaired) as T;
}
