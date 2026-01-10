export interface LoadedLayer {
  id: string;
  assetId: number;
  name: string;
  type: 'terrain' | 'geojson' | 'imagery' | '3dtiles';
  description: string;
  visible: boolean;
  resource?: any;
}