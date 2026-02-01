-- ====================================
-- SÉCURITÉ SUPABASE : Row Level Security
-- ====================================
-- IMPORTANT : Exécute ce script dans Supabase SQL Editor pour sécuriser les données utilisateurs

-- 1. Activer RLS sur la table sneakers
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- 2. Politique : Les utilisateurs ne peuvent voir que leurs propres sneakers
CREATE POLICY "Users can only view their own sneakers"
ON sneakers
FOR SELECT
USING (auth.uid()::text = user_id);

-- 3. Politique : Les utilisateurs ne peuvent insérer que pour eux-mêmes
CREATE POLICY "Users can only insert their own sneakers"
ON sneakers
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- 4. Politique : Les utilisateurs ne peuvent modifier que leurs propres sneakers
CREATE POLICY "Users can only update their own sneakers"
ON sneakers
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 5. Politique : Les utilisateurs ne peuvent supprimer que leurs propres sneakers
CREATE POLICY "Users can only delete their own sneakers"
ON sneakers
FOR DELETE
USING (auth.uid()::text = user_id);

-- ====================================
-- Faire la même chose pour la table expenses
-- ====================================

-- 1. Activer RLS sur la table expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 2-5. Politiques pour expenses
CREATE POLICY "Users can only view their own expenses"
ON expenses FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own expenses"
ON expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only update their own expenses"
ON expenses FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only delete their own expenses"
ON expenses FOR DELETE USING (auth.uid()::text = user_id);

-- ====================================
-- Vérification
-- ====================================

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('sneakers', 'expenses');

-- Si rowsecurity = true pour les deux tables, c'est bon ! ✅
