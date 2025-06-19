import React, { useState } from 'react';
import { Building2, MapPin, Users, Filter, X, ChevronDown } from 'lucide-react';
import MapContainer from './components/MapContainer';
import FilterPanel from './components/FilterPanel';
import { MapFilters } from './types/MapTypes';
import { Menu } from '@headlessui/react';

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

            {/* Analyse Dropdown + Filtres */}
            <div className="flex items-center space-x-2">
              {/* Menu déroulant Analyse statistique */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    Analyse statistique
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Menu.Button>
                </div>
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-[1000]">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/analyse.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                        >
                          Entités du Gosier
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/analyse2.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                        >
                          Entreprises fermées
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/analyse_abymes_gosier.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full text-left px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                        >
                          Comparaison Abymes/Gosier
                        </a>
                      )}
                    </Menu.Item>

                  </div>
                </Menu.Items>
              </Menu>

              {/* Bouton Filtres */}
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
