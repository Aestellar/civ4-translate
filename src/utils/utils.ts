export function getLocalTime(){
          let now = new Date()
          let timeString = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return timeString
}

export function detectXMLEncoding (bytes: Uint8Array): string {
    // Convert first 200 bytes (or less) to ASCII string for regex (safe for ASCII chars)
    const sampleLength = Math.min(bytes.length, 200);
    let sample = '';
    for (let i = 0; i < sampleLength; i++) {
      // Stop if we hit a null byte or non-ASCII (unlikely in prolog)
      if (bytes[i] === 0) break;
      if (bytes[i] > 127) {
        // Non-ASCII: might be UTF-16, but XML prolog is ASCII-compatible
        // We'll break and assume no declaration
        break;
      }
      sample += String.fromCharCode(bytes[i]);
    }

    // Match <?xml ... encoding="..." ?> (case-insensitive, supports ' or ")
    const match = sample.match(/<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i);
    if (match) {
      const encoding = match[1].trim();
      // Normalize common encodings
      if (/^utf-8$/i.test(encoding)) return 'utf-8';
      if (/^iso-8859-1$/i.test(encoding)) return 'iso-8859-1';
      if (/^windows-1252$/i.test(encoding)) return 'windows-1252';
      // Add more as needed
      console.warn(`Unsupported XML encoding: ${encoding}, falling back to UTF-8`);
    }

    // Default: per XML spec, if omitted → UTF-8 (or UTF-16 with BOM, but we ignore BOM here)
    return 'utf-8';
  };


function hasCivTags(str: string): boolean {
  const first500 = str.slice(0, 500);
  const last500 = str.slice(-500);  // Negative slice gets last 500 chars
  return first500.includes('<Civ4GameText xmlns="') && last500.includes('</Civ4GameText>');
}

export function wrapAsGameText(xmlString: string): string {
    if (hasCivTags(xmlString)) return xmlString
    return `<?xml version="1.0" encoding="UTF-8"?>
      <!-- edited with XMLSPY v2004 rel. 2 U (http://www.xmlspy.com) by lcollins (Firaxis Games) -->
      <Civ4GameText xmlns="http://www.firaxis.com"> ${xmlString} </Civ4GameText>`
}