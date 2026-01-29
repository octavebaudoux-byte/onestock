-- Supabase Schema for OneStock
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ztqvddmvdvqgbpclqklo/sql

-- Table: sneakers
CREATE TABLE IF NOT EXISTS sneakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  sku TEXT,
  size TEXT,
  category TEXT DEFAULT 'sneakers',
  buy_price DECIMAL(10, 2) DEFAULT 0,
  sell_price DECIMAL(10, 2),
  fees DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'stock',
  image_url TEXT,
  buy_date DATE,
  sell_date DATE,
  source TEXT,
  buyer_name TEXT,
  notes TEXT,
  item_received BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  delivery_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE,
  category TEXT DEFAULT 'Autre',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer les requêtes par user_id
CREATE INDEX IF NOT EXISTS idx_sneakers_user_id ON sneakers(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- RLS (Row Level Security) - Optionnel mais recommandé
-- Permet à chaque utilisateur de ne voir que ses propres données

-- Activer RLS sur les tables
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Politique pour sneakers: tout le monde peut tout faire (simplifié car on filtre par user_id côté client)
CREATE POLICY "Allow all for sneakers" ON sneakers FOR ALL USING (true);
CREATE POLICY "Allow all for expenses" ON expenses FOR ALL USING (true);
