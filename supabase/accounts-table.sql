-- Créer la table accounts pour gérer les comptes sur différents sites
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  site TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances sur les requêtes par user_id
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Index pour recherche par site
CREATE INDEX IF NOT EXISTS idx_accounts_site ON accounts(site);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres comptes
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres comptes
CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent modifier leurs propres comptes
CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres comptes
CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid()::text = user_id);

-- Note: Exécutez ce script dans l'éditeur SQL de Supabase
