import React, { useEffect, useState } from 'react';
import { Building2, Users, Landmark, X } from 'lucide-react';
import type { MapFilters } from '../types/MapTypes';
import { getEntityCounts } from '../utils/mapUtils';

interface FilterPanelProps {
  filters: MapFilters;
  onFilterChange: (key: keyof MapFilters) => void;
  onClose: () => void;
}

/** -------------------------------------------------------------
 *  Palette utilitaire pour Tailwind dynamiques
 *  ------------------------------------------------------------*/
const COLOR_MAP = {
  blue: {
    base: 'blue-600',
    bg50: 'bg-blue-50',
    border200: 'border-blue-200',
    ring: 'focus:ring-blue-500',
  },
  green: {
    base: 'green-600',
    bg50: 'bg-green-50',
    border200: 'border-green-200',
    ring: 'focus:ring-green-500',
  },
  orange: {
    base: 'orange-600',
    bg50: 'bg-orange-50',
    border200: 'border-orange-200',
    ring: 'focus:ring-orange-500',
  },
} as const;

type ColorKey = keyof typeof COLOR_MAP;

interface FilterItem {
  key: keyof MapFilters;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: ColorKey;
  count: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClose }) => {
  const [counts, setCounts] = useState({ enterprises: 0, publics: 0, associations: 0 });

  /* Charge les compteurs réels une seule fois */
  useEffect(() => {
    getEntityCounts().then((c) => setCounts(c));
  }, []);

  const items: FilterItem[] = [
    {
      key: 'enterprises',
      label: 'Entreprises',
      icon: Building2,
      color: 'blue',
      count: counts.enterprises,
    },
    {
      key: 'publicEstablishments',
      label: 'Établissements publics',
      icon: Landmark,
      color: 'green',
      count: counts.publics,
    },
    {
      key: 'associations',
      label: 'Associations',
      icon: Users,
      color: 'orange',
      count: counts.associations,
    },
  ];

  /* Calcule le total visible */
  const totalVisible = Object.entries(filters).reduce((acc, [k, enabled]) => {
    if (!enabled) return acc;
    const item = items.find((i) => i.key === k)!;
    return acc + item.count;
  }, 0);

  return (
    <div className="absolute top-16 left-4 z-[1000] w-80 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      {/* En‑tête */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-gray-100">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Lignes de filtre */}
      <div className="space-y-3">
        {items.map(({ key, label, icon: Icon, color, count }) => {
          const active = filters[key];
          const palette = COLOR_MAP[color];
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition-all ${
                active ? `${palette.border200} ${palette.bg50}` : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onFilterChange(key)}
                  className={`h-4 w-4 rounded border-gray-300 bg-gray-100 text-${palette.base} ${palette.ring} focus:ring-2`}
                />
                <Icon className={`h-5 w-5 ${active ? `text-${palette.base}` : 'text-gray-400'}`} />
                <div>
                  <div className={`font-medium ${active ? 'text-gray-900' : 'text-gray-600'}`}>{label}</div>
                  <div className="text-sm text-gray-500">{count} entités</div>
                </div>
              </div>
              <div className={`h-3 w-3 rounded-full bg-${palette.base}`}></div>
            </label>
          );
        })}
      </div>

      {/* Résumé & info zoom */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600">
        <strong>Total affiché&nbsp;:</strong> {totalVisible} entités
        <div className="mt-2 text-xs text-gray-500">
          <div className="mb-1 font-semibold">Niveaux de zoom&nbsp;:</div>
          <div>• Vue large (&lt; 13)&nbsp;: Clusters par section</div>
          <div>• Zoom intermédiaire (13‑15)&nbsp;: Décomposition progressive</div>
          <div>• Zoom maximal ( &gt; 15)&nbsp;: Pop‑ups détaillés</div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
