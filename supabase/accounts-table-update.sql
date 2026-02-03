-- Ajouter la colonne group_name si elle n'existe pas
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Index pour recherche par groupe
CREATE INDEX IF NOT EXISTS idx_accounts_group_name ON accounts(group_name);
