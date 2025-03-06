/* eslint-disable no-console */

import os from 'node:os';

export function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const localIPs: string[] = [];

  Object.keys(interfaces).forEach((iface) => {
    const networkInterface = interfaces[iface];
    if (networkInterface) {
      networkInterface.forEach((details) => {
        if (details.family === 'IPv4' && !details.internal) {
          localIPs.push(details.address);
        }
      });
    }
  });

  return localIPs;
}

export function printLocalConnections(port: number = 3000): void {
  const localIPs = getLocalIPs();
  console.log('\x1B[36m🖥️  Available Local Connections:\x1B[0m');
  console.log(`\x1B[32m➡️  http://localhost:${port}\x1B[0m`);
  console.log(`\x1B[32m➡️  http://127.0.0.1:${port}\x1B[0m`);

  localIPs.forEach((ip) => {
    console.log(`\x1B[32m➡️  http://${ip}:${port}\x1B[0m`);
  });
}
