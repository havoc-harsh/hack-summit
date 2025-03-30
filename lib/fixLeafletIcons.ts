// lib/fixLeafletIcons.ts
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons for Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'leaflet/marker-icon-2x.png',  // Use the correct path
    iconUrl: '../public/leaflet/marker-icon.png',          // Use the correct path
    shadowUrl: '../public/leaflet/marker-shadow.png',      // Use the correct path
  });
  if (typeof window !== 'undefined') {
    window.L = L;
  }
};

// Execute fix on import
fixLeafletIcons();

export default fixLeafletIcons;
  

