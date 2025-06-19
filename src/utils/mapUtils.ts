import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import {
  parsePublicEstablishmentsData,
  parseEnterprisesData,
  parseAssociationsData,
} from './csvParser';

/** -------------------------------------------------------------
 *  Types & Constants
 *  ------------------------------------------------------------*/
export type EntityKind = 'enterprise' | 'publicEstablishment' | 'association';

export interface EntityData {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: EntityKind;
  details: Record<string, unknown>;
}

const GOSIER_CENTER: L.LatLngExpression = [16.205, -61.485];
const DEFAULT_ZOOM = 13;
const MAX_ZOOM = 19;
const DISABLE_CLUSTERING_ZOOM = 17;   // au‑delà de ce zoom, chaque entité est affichée individuellement

const CLUSTER_COLORS: Record<EntityKind, string> = {
  enterprise: '#2563eb', // blue-600
  publicEstablishment: '#16a34a', // green-600
  association: '#eab308', // yellow-500
};

/** -------------------------------------------------------------
 *  Helpers – icon & marker
 *  ------------------------------------------------------------*/
function createIcon(kind: EntityKind): L.DivIcon {
  return L.divIcon({
    className: 'entity-marker',
    html: `<div style="background:${CLUSTER_COLORS[kind]};width:12px;height:12px;border-radius:50%;"></div>`
  });
}

function createPopup(entity: EntityData): string {
  const l: string[] = [];
  l.push(`<h3 style="font-weight:600;margin:0 0 4px 0">${entity.name}</h3>`);
  l.push(`<p style="margin:0;font-size:12px">${entity.address}</p>`);
  if (entity.details.activity) l.push(`<p style="margin:4px 0 0 0;font-size:12px">${entity.details.activity}</p>`);
  if (entity.details.section) l.push(`<p style="margin:0;font-size:12px">Section : ${entity.details.section}</p>`);
  if (entity.details.objet) l.push(`<p style="margin:4px 0 0 0;font-size:12px">${entity.details.objet}</p>`);
  if (entity.details.siren) l.push(`<p style="margin:4px 0 0 0;font-size:12px">SIREN : ${entity.details.siren}</p>`);
  if (entity.details.siret) l.push(`<p style="margin:0;font-size:12px">SIRET : ${entity.details.siret}</p>`);
  if (entity.details.creationDate) l.push(`<p style="margin:4px 0 0 0;font-size:12px">Création : ${entity.details.creationDate}</p>`);
  return `<div style="font-size:14px;max-width:260px">${l.join('')}</div>`;
}

function createMarker(entity: EntityData): L.Marker {
  return L.marker(entity.coordinates, { icon: createIcon(entity.type) })
    .bindPopup(createPopup(entity));
}

/** -------------------------------------------------------------
 *  Clusters by entity type
 *  ------------------------------------------------------------*/
interface ClusterGroupByType {
  enterprise: L.MarkerClusterGroup;
  publicEstablishment: L.MarkerClusterGroup;
  association: L.MarkerClusterGroup;
}

function createClusterGroup(kind: EntityKind, map: L.Map): L.MarkerClusterGroup {
  const group = L.markerClusterGroup({
    maxClusterRadius: 45,
    disableClusteringAtZoom: DISABLE_CLUSTERING_ZOOM,
    spiderfyOnMaxZoom: false,           // ← empêche la "fleur" géante
    zoomToBoundsOnClick: true,          // zoom vers le cluster
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div style="background:${CLUSTER_COLORS[kind]};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">${count}</div>`
      });
    },
  });

  // Amélioration UX : si on clique sur un cluster et qu'on n'est pas encore
  // au zoom maxi, on force un zoom +2 (plutôt que spiderfy).
  group.on('clusterclick', (e: any) => {
    const currentZoom = map.getZoom();
    if (currentZoom < MAX_ZOOM) {
      map.setView(e.latlng, Math.min(currentZoom + 2, MAX_ZOOM));
    }
  });

  return group;
}

/** -------------------------------------------------------------
 *  Map initialisation
 *  ------------------------------------------------------------*/
let map: L.Map | null = null;
let clusters: ClusterGroupByType;

export async function initializeMap(container: HTMLElement): Promise<void> {
  if (map) map.remove();

  map = L.map(container).setView(GOSIER_CENTER, DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    minZoom: 11,
    maxZoom: MAX_ZOOM,
  }).addTo(map);

  clusters = {
    enterprise: createClusterGroup('enterprise', map),
    publicEstablishment: createClusterGroup('publicEstablishment', map),
    association: createClusterGroup('association', map),
  };

  const [enterprises, publics, associations] = await Promise.all([
    parseEnterprisesData(),
    parsePublicEstablishmentsData(),
    parseAssociationsData(),
  ]);

  enterprises.forEach((e) => clusters.enterprise.addLayer(createMarker(e)));
  publics.forEach((p) => clusters.publicEstablishment.addLayer(createMarker(p)));
  associations.forEach((a) => clusters.association.addLayer(createMarker(a)));

  map.addLayer(clusters.enterprise);
  map.addLayer(clusters.publicEstablishment);
  map.addLayer(clusters.association);
}

/** -------------------------------------------------------------
 *  Filtre d'affichage par type (checkboxes)
 *  ------------------------------------------------------------*/
export function setLayerVisibility(kind: EntityKind, visible: boolean): void {
  if (!map || !clusters) return;
  visible ? map.addLayer(clusters[kind]) : map.removeLayer(clusters[kind]);
}

/** -------------------------------------------------------------
 *  Compteurs globaux (panneau de filtres)
 *  ------------------------------------------------------------*/
export async function getEntityCounts() {
  const [enterprises, publics, associations] = await Promise.all([
    parseEnterprisesData(),
    parsePublicEstablishmentsData(),
    parseAssociationsData(),
  ]);
  return {
    enterprises: enterprises.length,
    publics: publics.length,
    associations: associations.length,
  };
}
