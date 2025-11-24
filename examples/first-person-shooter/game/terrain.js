import { noise, noiseDetail } from '../utils/utils.js';

export const sceneSize = 400;

// Configure noise
noiseDetail(4, 0.5);

export function getTerrainHeight(x, z) {
  // Base terrain (rolling hills)
  // Scale 0.01 gives large features (approx 100 units wide)
  const scale1 = 0.015;
  const h1 = noise(x * scale1 + 1000, z * scale1 + 1000) * 15;
  
  // Detail layer (smaller bumps)
  const scale2 = 0.05;
  const h2 = noise(x * scale2 + 2000, z * scale2 + 2000) * 2;
  
  // Micro detail
  const scale3 = 0.15;
  const h3 = noise(x * scale3 + 3000, z * scale3 + 3000) * 0.5;
  
  // Combine and shift down slightly so valleys are near 0
  // We want the ground to be mostly positive y
  return Math.max(0, h1 + h2 + h3 - 5);
}

