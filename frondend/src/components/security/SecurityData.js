// Kothari Distributors - Security & CEO Authorization Profile Data
// Designed specifically for shared-laptop privacy protection and multi-device cloud access

export const ceoProfile = {
  name: 'R.L. Kothari',
  role: 'Owner & Chief Executive Officer',
  company: 'Kothari Distributors Pvt. Ltd.',
  username: 'ceo_kothari',
  email: 'rl.kothari@kotharidistributors.com',
  mobile: '+91 98250 11999',
  masterPin: '1234',
  inactivityTimeoutMinutes: 15,
  autoLockOnTabSwitch: true,
  publicRegistrationAllowed: false,
  twoFactorEnabled: true,
  cloudSyncEncryption: 'AES-256-GCM Enterprise Grade'
};

export const activeDeviceSessions = [
  {
    id: 'SESS-001',
    device: 'Lenovo ThinkPad X1 Carbon (Current Laptop)',
    deviceType: 'desktop',
    os: 'Windows 11 Pro',
    browser: 'Chrome 122.0.6261.94',
    ipAddress: '103.212.145.88 (Surat Broadband)',
    lastActive: 'Active Right Now',
    location: 'Surat Head Office',
    isCurrent: true
  },
  {
    id: 'SESS-002',
    device: 'Apple iPhone 15 Pro (CEO Mobile)',
    deviceType: 'mobile',
    os: 'iOS 17.4.1',
    browser: 'Safari Mobile',
    ipAddress: '49.36.182.204 (Jio 5G)',
    lastActive: '12 minutes ago',
    location: 'Surat City, Gujarat',
    isCurrent: false
  },
  {
    id: 'SESS-003',
    device: 'Apple iPad Pro 11" (Executive Tablet)',
    deviceType: 'tablet',
    os: 'iPadOS 17.3',
    browser: 'Safari Mobile',
    ipAddress: '103.212.145.88 (Surat Office Wi-Fi)',
    lastActive: 'Yesterday at 19:42',
    location: 'Ring Road Depot',
    isCurrent: false
  }
];

export const securityAuditLogs = [
  {
    id: 'AUD-991',
    timestamp: '2026-10-29 10:05 IST',
    event: 'Master PIN Verified',
    device: 'Lenovo ThinkPad X1',
    ip: '103.212.145.88',
    status: 'Authorized',
    type: 'success'
  },
  {
    id: 'AUD-990',
    timestamp: '2026-10-29 08:30 IST',
    event: 'CEO Cloud Database Sync (AES-256)',
    device: 'Automated Snapshot',
    ip: 'Cloud-Encrypted-Node',
    status: 'Synchronized',
    type: 'info'
  },
  {
    id: 'AUD-989',
    timestamp: '2026-10-28 22:15 IST',
    event: 'Auto-Lock Inactivity Triggered (15m)',
    device: 'Lenovo ThinkPad X1',
    ip: '103.212.145.88',
    status: 'Secured Screen',
    type: 'warning'
  },
  {
    id: 'AUD-988',
    timestamp: '2026-10-28 14:10 IST',
    event: 'Mobile Session Authenticated via Passkey',
    device: 'Apple iPhone 15 Pro',
    ip: '49.36.182.204',
    status: 'Authorized',
    type: 'success'
  },
  {
    id: 'AUD-987',
    timestamp: '2026-10-27 18:22 IST',
    event: 'Unauthorized URL Direct Access Attempt Blocked',
    device: 'Guest Browser (Unrecognized)',
    ip: '103.212.145.92',
    status: 'ACCESS DENIED - Routed to Lock',
    type: 'danger'
  }
];

