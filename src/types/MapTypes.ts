import type { Polygon } from 'geojson';

export interface MapFilters {
  enterprises: boolean;
  publicEstablishments: boolean;
  associations: boolean;
}

export interface EntityData {
  id: string;
  name: string;
  address: string;
  type: 'enterprise' | 'publicEstablishment' | 'association';
  coordinates: [number, number];
  details: {
    siren?: string;
    nic?: string;
    siret?: string;
    activity?: string;
    status?: string;
    creationDate?: string;
    updateDate?: string;
    juridicalNature?: string;
  };
}

export interface CadastralSection {
  geometry: GeoJSON.Polygon;
  name: string;
  bounds: [[number, number], [number, number]];
}

declare global {
  interface Window {
    L: any;
  }
}