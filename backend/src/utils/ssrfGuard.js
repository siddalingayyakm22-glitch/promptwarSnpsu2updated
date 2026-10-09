/**
 * SSRF (Server-Side Request Forgery) Defense Utility
 * Prevents DNS rebinding, internal loopback, AWS/cloud metadata access, and private subnet exploration.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data'
]);

// Private IPv4 CIDR blocks and special ranges
const PRIVATE_IP_RANGES = [
  /^127\./,                          // 127.0.0.0/8 (Loopback)
  /^10\./,                           // 10.0.0.0/8 (Private Network)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12 (Private Network)
  /^192\.168\./,                     // 192.168.0.0/16 (Private Network)
  /^169\.254\./,                     // 169.254.0.0/16 (Link Local / Cloud Metadata)
  /^0\./,                            // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // CGNAT
  /^198\.18\./,                      // Benchmark testing
];

function isSafePublicTarget(hostname) {
  if (!hostname) return { safe: false, reason: 'Missing hostname' };

  const lower = hostname.toLowerCase().trim();

  // Blocked explicit hostnames
  if (BLOCKED_HOSTNAMES.has(lower)) {
    return { safe: false, reason: 'Localhost or internal loopback target rejected' };
  }

  // Cloud metadata endpoint check (AWS, GCP, Azure, DigitalOcean)
  if (lower === '169.254.169.254' || lower.includes('metadata')) {
    return { safe: false, reason: 'Cloud instance metadata endpoint rejected' };
  }

  // Check IPv4 private subnets
  for (const regex of PRIVATE_IP_RANGES) {
    if (regex.test(lower)) {
      return { safe: false, reason: 'Private or local RFC1918 IPv4 address rejected' };
    }
  }

  // Check IPv6 addresses (e.g. ::1, fe80::, fc00::)
  if (lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:') || lower === '::') {
    return { safe: false, reason: 'Private or link-local IPv6 address rejected' };
  }

  return { safe: true, reason: 'Public target valid' };
}

module.exports = {
  isSafePublicTarget
};
