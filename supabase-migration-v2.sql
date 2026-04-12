-- ===================================
-- BeautyConnect — Migration v2
-- Nouvelles tables : reviews, reservations, commissions, subscriptions
-- ===================================

-- 1. Colonnes supplémentaires sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_service BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_service_radius INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- 2. Table reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 3. Table subscriptions (freemium)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'featured', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id)
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read subscription" ON subscriptions FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Owner manage subscription" ON subscriptions FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Trigger : mettre à jour is_featured selon l'abonnement
CREATE OR REPLACE FUNCTION sync_featured_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.plan IN ('featured', 'premium') THEN
    UPDATE profiles SET is_featured = true WHERE id = NEW.profile_id;
  ELSE
    UPDATE profiles SET is_featured = false WHERE id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_change ON subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_featured_from_subscription();

-- 4. Table reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  service_date DATE NOT NULL,
  service_time TEXT NOT NULL DEFAULT '10:00',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner read reservations" ON reservations FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Owner update reservations" ON reservations FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- 5. Table commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  rate DECIMAL(4,2) DEFAULT 10.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read commissions" ON commissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Trigger : créer commission automatique à la réservation
CREATE OR REPLACE FUNCTION create_commission_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deposit_paid = true AND OLD.deposit_paid = false THEN
    INSERT INTO commissions (reservation_id, profile_id, amount, rate)
    VALUES (NEW.id, NEW.profile_id, ROUND(NEW.deposit_amount * 0.10), 10.00);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deposit_paid ON reservations;
CREATE TRIGGER on_deposit_paid
  AFTER UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION create_commission_on_reservation();
