#!/usr/bin/env python3
# analyse_completeness.py
# ------------------------------------------------------------
# Mesure la complétude d'un fichier CSV :
#   • par colonne   → taux_completion_colonnes.csv
#   • par ligne     → ajoute deux colonnes (% et nb champs)

import pandas as pd
import csv
from pathlib import Path

# ---------- CONFIGURATION ----------
INPUT_CSV   = "t_entreprise_private_selectednew.csv"   # fichier à analyser
OUTPUT_COL  = "taux_completion_colonnes.csv"           # résultats par colonne
OUTPUT_ROWS = "lignes_les_plus_vierges.csv"            # top 50 lignes les moins remplies
TOKENS_ND   = {"nd", "n/d", "non disponible", "na", "n.a.", "n.a"}
# -----------------------------------

def detect_delimiter(csv_path: str, nb_lines: int = 5) -> str:
    """Renvoie , ; ou tab en sniffant les premières lignes."""
    with open(csv_path, "r", encoding="utf-8") as f:
        sample = "".join(next(f) for _ in range(nb_lines))
    return csv.Sniffer().sniff(sample).delimiter

def is_not_available(cell: object) -> bool:
    """True si la cellule contient un token ND."""
    if pd.isna(cell):
        return False
    return str(cell).strip().lower() in TOKENS_ND

def main() -> None:
    # 1. Chargement avec détection du séparateur
    if not Path(INPUT_CSV).exists():
        raise FileNotFoundError(f"{INPUT_CSV} introuvable")
    delimiter = detect_delimiter(INPUT_CSV)
    print(f"Lecture de {INPUT_CSV} (délimiteur '{delimiter}') …")
    data = pd.read_csv(INPUT_CSV, sep=delimiter, low_memory=False)
    total_rows = len(data)

    # --------------------------------------------------
    # A) TAUX DE COMPLÉTION PAR COLONNE
    # --------------------------------------------------
    stats_columns = []
    for column in data.columns:
        nb_empty   = data[column].isna().sum()
        nb_nd      = data[column].apply(is_not_available).sum()
        nb_filled  = total_rows - nb_empty - nb_nd
        stats_columns.append({
            "colonne":       column,
            "% vides":       round(nb_empty  / total_rows * 100, 1),
            "% ND":          round(nb_nd     / total_rows * 100, 1),
            "% renseignées": round(nb_filled / total_rows * 100, 1),
        })
    df_stats_col = (
        pd.DataFrame(stats_columns)
          .sort_values(["% vides", "% ND"], ascending=[False, False])
    )
    df_stats_col.to_csv(OUTPUT_COL, index=False, encoding="utf-8")
    print(f"→ Export par colonne : {OUTPUT_COL}")

    # --------------------------------------------------
    # B) TAUX DE COMPLÉTION PAR LIGNE
    # --------------------------------------------------
    # Matrices booléennes
    mask_nd        = data.applymap(is_not_available)
    mask_filled    = data.notna() & ~mask_nd
    nb_filled_line = mask_filled.sum(axis=1)
    pct_filled_line = (nb_filled_line / len(data.columns) * 100).round(1)

    # Ajout dans le DataFrame
    data["nb_champs_renseignes"] = nb_filled_line
    data["pct_complet_ligne"]    = pct_filled_line

    # Distribution générale
    print("\nDistribution du % de complétion par ligne :")
    print(pct_filled_line.describe(percentiles=[.25, .5, .75]).round(1))

    # Sauvegarde des 50 lignes les moins complètes
    (data
      .sort_values("pct_complet_ligne")
      .head(50)
      .to_csv(OUTPUT_ROWS, index=False, encoding="utf-8"))
    print(f"→ 50 lignes les moins remplies : {OUTPUT_ROWS}")

if __name__ == "__main__":
    main()
