import React, { useEffect, useRef, useState } from 'react';
import { Building2, MapPin, Users, Filter, X } from 'lucide-react';
import MapContainer from './components/MapContainer';
import FilterPanel from './components/FilterPanel';
import { MapFilters } from './types/MapTypes';

function App() {
  const [filters, setFilters] = useState<MapFilters>({
    enterprises: true,
    publicEstablishments: true,
    associations: true
  });

  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const handleFilterChange = (filterType: keyof MapFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Carte Interactive - Le Gosier
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="/analyse.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <span>Analyse</span>
              </a>
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilterPanel(false)}
        />
      )}

      {/* Map Container */}
      <div className="pt-16 h-full">
        <MapContainer filters={filters} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Légende</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Entreprises</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Établissements publics</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Associations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;