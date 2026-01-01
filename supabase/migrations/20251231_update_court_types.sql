-- Actualizar enum court_type para incluir tipos de fútbol argentinos
-- Paso 1: Convertir todas las columnas que usan court_type a TEXT temporalmente
ALTER TABLE courts ALTER COLUMN court_type TYPE TEXT;
ALTER TABLE tournaments ALTER COLUMN sport_type TYPE TEXT;

-- Paso 2: Actualizar los valores existentes de inglés a español en courts
UPDATE courts SET court_type = 'Fútbol 11' WHERE court_type = 'football';
UPDATE courts SET court_type = 'Tenis' WHERE court_type = 'tennis';
UPDATE courts SET court_type = 'Pádel' WHERE court_type = 'paddle';
UPDATE courts SET court_type = 'Básquet' WHERE court_type = 'basketball';
UPDATE courts SET court_type = 'Vóley' WHERE court_type = 'volleyball';
UPDATE courts SET court_type = 'Multipropósito' WHERE court_type = 'multipurpose';

-- Paso 3: Actualizar los valores existentes en tournaments
UPDATE tournaments SET sport_type = 'Fútbol 11' WHERE sport_type = 'football';
UPDATE tournaments SET sport_type = 'Tenis' WHERE sport_type = 'tennis';
UPDATE tournaments SET sport_type = 'Pádel' WHERE sport_type = 'paddle';
UPDATE tournaments SET sport_type = 'Básquet' WHERE sport_type = 'basketball';
UPDATE tournaments SET sport_type = 'Vóley' WHERE sport_type = 'volleyball';
UPDATE tournaments SET sport_type = 'Multipropósito' WHERE sport_type = 'multipurpose';

-- Paso 4: Eliminar el enum viejo con CASCADE
DROP TYPE IF EXISTS court_type CASCADE;

-- Paso 5: Crear el nuevo enum con valores en español
CREATE TYPE court_type AS ENUM (
  'Fútbol 5',
  'Fútbol 7',
  'Fútbol 11',
  'Tenis',
  'Pádel',
  'Básquet',
  'Vóley',
  'Multipropósito'
);

-- Paso 6: Convertir las columnas de TEXT al nuevo enum
ALTER TABLE courts 
  ALTER COLUMN court_type TYPE court_type 
  USING court_type::court_type;

ALTER TABLE tournaments 
  ALTER COLUMN sport_type TYPE court_type 
  USING sport_type::court_type;
