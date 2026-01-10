import { Ion } from 'cesium';

// Dataset definitions from requirements
export const CESIUM_ASSETS = [
  {
    id: 4337066,
    name: 'SRTM DEM',
    type: 'terrain',
    description: 'Shuttle Radar Topography Mission Digital Elevation Model',
  },
  {
    id: 4337054,
    name: 'India Pincode Boundary',
    type: 'geojson',
    description: 'All India Pincode Boundary GeoJSON',
  },
  {
    id: 4337053,
    name: 'Swissimage Orthophoto',
    type: 'imagery',
    description: 'High-resolution Swiss orthophoto imagery',
  },
  {
    id: 3830186,
    name: 'Google Maps 2D Contour',
    type: 'imagery',
    description: 'Google Maps 2D Contour basemap',
  },
  {
    id: 2275207,
    name: 'Google Photorealistic 3D',
    type: '3dtiles',
    description: 'Google Photorealistic 3D Tiles',
  },
];

// Initialize Cesium Ion with token
export const initializeCesiumIon = (token) => {
  Ion.defaultAccessToken = token;
};

// Get resource from Cesium Ion
export const getCesiumResource = (assetId) => {
  return Ion.createResource(assetId);
};