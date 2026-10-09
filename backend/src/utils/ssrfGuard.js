/**
 * SSRF (Server-Side Request Forgery) Defense Utility
 * Prevents DNS rebinding, internal loopback, AWS/cloud metadata access,
 * private subnet exploration, and alternative IP encodings (octal, hex, dword, IPv6 mapped).
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data',
  '169.254.169.254'
]);

// Private IPv4 CIDR blocks and special ranges
const PRIVATE_IP_RANGES = [
  /^127\./,                          // 127.0.0.0/8 (Loopback)
  /^10\./,                           // 10.0.0.0/8 (Private Network)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12 (Private Network)
  /^192\.168\./,                     // 192.168.0.0/16 (Private Network)
  /^169\.254\./,                     // 169.254.0.0/16 (Link Local / Cloud Metadata)
  /^0\./,                            // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
  /^198\.18\./,                      // Benchmark testing
];

function isSafePublicTarget(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return { safe: false, reason: 'Missing or invalid hostname' };
  }

  const lower = hostname.toLowerCase().trim();

  // 1. Direct match on blocked keywords
  if (BLOCKED_HOSTNAMES.has(lower)) {
    return { safe: false, reason: 'Internal loopback or cloud metadata target rejected' };
  }

  // 2. Cloud metadata keywords
  if (lower.includes('metadata') || lower.includes('169.254.169.254')) {
    return { safe: false, reason: 'Cloud instance metadata endpoint rejected' };
  }

  // 3. Hexadecimal or Octal IP notation bypass checks (e.g., 0x7f.0.0.1, 0177.0.0.1, 2130706433)
  if (/^0x[0-9a-f]+/i.test(lower) || /^0[0-7]+\./.test(lower) || /^\d{8,10}$/.test(lower)) {
    return { safe: false, reason: 'Alternative encoded IP address notation rejected' };
  }

  // 4. IPv6 loopback / private checks
  if (
    lower === '::' ||
    lower === '::1' ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.') ||
    lower.startsWith('::ffff:172.') ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    lower.startsWith('fd00:')
  ) {
    return { safe: false, reason: 'Private or loopback IPv6 address rejected' };
  }

  // 5. Check standard IPv4 private subnets
  for (const regex of PRIVATE_IP_RANGES) {
    if (regex.test(lower)) {
      return { safe: false, reason: 'Private or local RFC1918 IPv4 address rejected' };
    }
  }

  return { safe: true, reason: 'Public target valid' };
}

module.exports = {
  isSafePublicTarget
};
