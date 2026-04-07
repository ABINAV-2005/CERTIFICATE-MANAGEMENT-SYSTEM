import { io } from "socket.io-client";
import { BACKEND_BASE } from "./api";

const socket = io(import.meta.env.VITE_SOCKET_URL || BACKEND_BASE, {
  transports: ["websocket"]
});

socket.on('new_certificate', () => {
  console.log('New certificate uploaded - refresh dashboard');
  // Emit to components via context or event
  window.dispatchEvent(new CustomEvent('newCertificate'));
});

socket.on('certificate_updated', () => {
  console.log('Certificate status updated');
  window.dispatchEvent(new CustomEvent('certificateUpdated'));
});

export default socket;
