-- Migration pour ajouter les colonnes manquantes à la table sneakers

-- Ajouter la colonne pour la condition (état) de la paire
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new';

-- Ajouter la colonne pour la plateforme d'achat
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS buy_platform TEXT;

-- Ajouter la colonne pour la plateforme de vente
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS sell_platform TEXT;

-- Ajouter la colonne pour le prix de vente cible
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS target_sell_price NUMERIC;

-- Ajouter la colonne pour les plateformes de mise en vente (tableau JSON)
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS listed_on_platforms JSONB DEFAULT '[]';

-- Ajouter la colonne pour l'URL de la facture
ALTER TABLE sneakers
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN sneakers.condition IS 'État de la paire: new, like_new, very_good, good, worn';
COMMENT ON COLUMN sneakers.buy_platform IS 'Plateforme où la paire a été achetée (SNKRS, StockX, etc.)';
COMMENT ON COLUMN sneakers.sell_platform IS 'Plateforme où la paire a été vendue';
COMMENT ON COLUMN sneakers.target_sell_price IS 'Prix de vente cible souhaité';
COMMENT ON COLUMN sneakers.listed_on_platforms IS 'Tableau JSON des plateformes où la paire est actuellement en vente';
COMMENT ON COLUMN sneakers.invoice_url IS 'URL vers la facture ou preuve de vente';
