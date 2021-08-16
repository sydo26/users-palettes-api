-- SETUP

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_type') THEN
        CREATE TYPE LOG_TYPE AS ENUM ('DELETE', 'UPDATE', 'INSERT', 'DEFAULT');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS USERS (
	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  	fullName VARCHAR(50) NOT NULL,
  	email VARCHAR(50) UNIQUE,
  	password VARCHAR(200) NOT NULL,
  	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS COLORS (
	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  	name VARCHAR(20) NOT NULL,
  	hex VARCHAR(20) NOT NULL,
  	rgb VARCHAR(20) NOT NULL,
  	hsl VARCHAR(20) NOT NULL,
  	alpha NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS PALETTES (
	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 	name VARCHAR(50) NOT NULL,
  	amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS USERS_PALETTES (
  	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	codePalette INT NOT NULL REFERENCES PALETTES(code) ON DELETE CASCADE,
  	codeUser INT NOT NULL REFERENCES USERS(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS COLORS_PALETTES (
  	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	codePalette INT NOT NULL REFERENCES PALETTES(code) ON DELETE CASCADE,
  	codeColor INT NOT NULL REFERENCES COLORS(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LOG (
	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  	description VARCHAR(255),
  	type LOG_TYPE DEFAULT 'DEFAULT' NOT NULL,
  	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- TRIGGERS

CREATE OR REPLACE FUNCTION user_changed_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
	BEGIN
    	
        IF TG_OP = 'DELETE' THEN
        	
            INSERT INTO LOG(description, type) VALUES
            ('O usuário de ID ' || OLD.code || ' foi deletado.', 'DELETE');
            
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN 
        	INSERT INTO LOG(description, type) VALUES
            ('O usuário de ID ' || NEW.code || ' foi atualizado.', 'UPDATE');
            
            RETURN NEW;
            
        END IF;
        
      	INSERT INTO LOG(description, type) VALUES
        ('O usuário de ID ' || NEW.code || ' foi adicionado.', 'INSERT');
        
		RETURN NEW;
	END;
$$;

DROP TRIGGER IF EXISTS user_changed_log_trigger ON USERS;
CREATE TRIGGER user_changed_log_trigger
	AFTER UPDATE OR INSERT OR DELETE ON USERS
	FOR EACH ROW
	EXECUTE PROCEDURE user_changed_log();

CREATE OR REPLACE FUNCTION colors_palettes_changed_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
	BEGIN
    	IF TG_OP = 'DELETE' THEN
        
        	UPDATE PALETTES SET amount = amount - 1 WHERE code = OLD.codePalette;
            
        	RETURN OLD;
        END IF;
        
        UPDATE PALETTES SET amount = amount + 1 WHERE code = NEW.codePalette;
    	RETURN NEW;
	END;
$$;

DROP TRIGGER IF EXISTS colors_palettes_changed_amount_trigger ON COLORS_PALETTES;
CREATE TRIGGER colors_palettes_changed_amount_trigger
	AFTER INSERT OR DELETE ON COLORS_PALETTES
	FOR EACH ROW
	EXECUTE PROCEDURE colors_palettes_changed_amount();

