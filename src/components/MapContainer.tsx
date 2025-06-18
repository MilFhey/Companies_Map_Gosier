import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  initializeMap,
  setLayerVisibility,
  EntityKind,
} from '../utils/mapUtils';
import { MapFilters } from '../types/MapTypes';

interface Props {
  filters: MapFilters;
}

// MapContainer.tsx


/**
 * Conteneur 100 % (prend la place dispo dans App.tsx)
 * Initialise la carte et met à jour la visibilité des couches.
 */
const MapContainer: React.FC<Props> = ({ filters }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  /* 1. Création unique de la carte ----------------------------- */
  useEffect(() => {
    if (mapRef.current) {
      initializeMap(mapRef.current);
    }
  }, []);

  /* 2. Réagit aux changements de filtres ----------------------- */
  useEffect(() => {
    const entries: [EntityKind, boolean][] = [
      ['enterprise', filters.enterprises],
      ['publicEstablishment', filters.publicEstablishments],
      ['association', filters.associations],
    ];
    entries.forEach(([kind, visible]) => setLayerVisibility(kind, visible));
  }, [filters]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export default MapContainer;
