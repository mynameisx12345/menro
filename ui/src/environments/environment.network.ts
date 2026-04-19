// Change HOST_IP to your machine's IP address for network access
const HOST_IP = '192.168.100.112';

export const environment = {
  production: false,
  apiUrl: `http://${HOST_IP}:3000/api`,
  wsUrl: `ws://${HOST_IP}:3000/ws/trucks`
};
