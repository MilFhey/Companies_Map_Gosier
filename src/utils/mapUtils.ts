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

function createMarker(entity: EntityData): L.Marker {
  const marker = L.marker(entity.coordinates, { icon: createIcon(entity.type) });

  /* Construire dynamiquement le contenu du popup */
  const lines: string[] = [];
  lines.push(`<h3 style="font-weight:600;margin:0 0 4px 0">${entity.name}</h3>`);
  lines.push(`<p style="margin:0;font-size:12px">${entity.address}</p>`);

  // Commun : activité ou objet
  if (entity.details.activity) {
    lines.push(`<p style="margin:4px 0 0 0;font-size:12px">${entity.details.activity}</p>`);
  }
  if (entity.details.section) {
    lines.push(`<p style="margin:0;font-size:12px">Section : ${entity.details.section}</p>`);
  }
  if (entity.details.objet) {
    lines.push(`<p style="margin:4px 0 0 0;font-size:12px">${entity.details.objet}</p>`);
  }

  // Identifiants
  if (entity.details.siren) {
    lines.push(`<p style="margin:4px 0 0 0;font-size:12px">SIREN : ${entity.details.siren}</p>`);
  }
  if (entity.details.siret) {
    lines.push(`<p style="margin:0;font-size:12px">SIRET : ${entity.details.siret}</p>`);
  }

  // Dates
  if (entity.details.creationDate) {
    lines.push(`<p style="margin:4px 0 0 0;font-size:12px">Création : ${entity.details.creationDate}</p>`);
  }

  marker.bindPopup(`<div style="font-size:14px;max-width:260px">${lines.join('')}</div>`);
  return marker;
}

/** -------------------------------------------------------------
 *  Clusters by entity type
 *  ------------------------------------------------------------*/
interface ClusterGroupByType {
  enterprise: L.MarkerClusterGroup;
  publicEstablishment: L.MarkerClusterGroup;
  association: L.MarkerClusterGroup;
}

function createClusterGroup(kind: EntityKind): L.MarkerClusterGroup {
  return L.markerClusterGroup({
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div style="background:${CLUSTER_COLORS[kind]};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">${count}</div>`
      });
    },
  });
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
  }).addTo(map);

  clusters = {
    enterprise: createClusterGroup('enterprise'),
    publicEstablishment: createClusterGroup('publicEstablishment'),
    association: createClusterGroup('association'),
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
