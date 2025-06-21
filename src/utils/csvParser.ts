import Papa from 'papaparse';
import { EntityData, EntityKind } from './mapUtils';

/*****************************************************************
 * Coordonnées : extrait [lat, lon] depuis diverses colonnes
 *****************************************************************/
const toFloat = (s: string | undefined): number => {
  if (!s) return NaN;
  return parseFloat(s.replace(',', '.'));
};


const getCoords = (row: Record<string, string>): [number, number] | null => {
  /* 1) champ unique \"lat,long\" --------------------------------- */
  const single = row['Géolocalisation de l\'établissement']
              || row['Géolocalisation de l’établissement']
              || row.latlong;
  if (single) {
    const [laStr, loStr] = single.replace(/\"|\\(|\\)/g, '').split(/[,;]/);
    const la = toFloat(laStr), lo = toFloat(loStr);
    if (!isNaN(la) && !isNaN(lo)) return [la, lo];
  }

  /* 2) deux colonnes distinctes ---------------------------------- */
  const latStr = row.lat || row.latitude || '';
  const lonStr = row.lon || row.longitude || '';
  const lat = toFloat(latStr), lon = toFloat(lonStr);
  return !isNaN(lat) && !isNaN(lon) ? [lat, lon] : null;
};

/*****************************************************************
 * 1) Entreprises & Établissements publics
 *****************************************************************/
function parseBusinessCSV(
  url: string,
  kind: 'enterprise' | 'publicEstablishment'
): Promise<EntityData[]> {
  return new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const seen = new Set<string>();

        const out = (data as any[]).flatMap((row, idx) => {
          // ignore les fermées
          const etat = (row['Etat administratif de l\'établissement'] || '').trim().toUpperCase();
          if (etat === 'F') return [];

          const id = row.SIRET || `${kind}_${idx}`;
          if (seen.has(id)) return [];
          seen.add(id);

          const coords = getCoords(row);
          if (!coords) return [];

          return [{
            id,
            name: row["Dénomination de l'unité légale"] || row["Dénomination usuelle de l'établissement"] || 'Sans enseigne',
            address: `${row["Adresse de l'établissement"] || row["Libellé de la voie de l'établissement"] || "Le Gosier"}${row["Complément d'adresse de l'établissement"] ? ", " + row["Complément d'adresse de l'établissement"] : ""}`,
            type: kind,
            coordinates: coords,
            details: {
              siren: row.SIREN,
              siret: row.SIRET,
              activity: row['Activité principale de l\'établissement'],
              section: [
                        row["Section de l'établissement"],
                        row["Sous-section de l'établissement"],
                        row["Division de l'établissement"],
                        row["Groupe de l'établissement"]
                      ].filter(Boolean).join(" - "),
              creationDate: row['Date de création de l\'établissement'],
            },
          }];
        });

        console.log(`✅ ${kind}: ${out.length} lignes valides`);
        resolve(out);
      }
    });
  });
}

/*****************************************************************
 * 2) Associations
 *****************************************************************/
function parseAssociationCSV(url: string): Promise<EntityData[]> {
  return new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const seen = new Set<string>();

        const out = (data as any[]).flatMap((row, idx) => {
          if (row.date_dissolution) return [];

          const id = row.id_association || `association_${idx}`;
          if (seen.has(id)) return [];
          seen.add(id);

          const coords = getCoords(row);
          if (!coords) return [];

          const voie = [row.num_voie, row.type_voie, row.libelle_voie]
            .filter(Boolean)
            .join(' ');

          return [{
            id,
            name: row.titre_court || 'Association',
            address: voie || 'Le Gosier',
            type: 'association' as EntityKind,
            coordinates: coords,
            details: {
              objet: row.objet,
              creationDate: row.date_creation,
            }
          }];
        });

        console.log(`✅ association: ${out.length} lignes valides`);
        resolve(out);
      }
    });
  });
}

/*****************************************************************
 *  Exports
 *****************************************************************/
export const parseEnterprisesData          = () =>
  parseBusinessCSV('/data/entreprise_private.csv',      'enterprise');

export const parsePublicEstablishmentsData = () =>
  parseBusinessCSV('/data/etablissement_public.csv',    'publicEstablishment');

export const parseAssociationsData         = () =>
  parseAssociationCSV('/data/association.csv');
