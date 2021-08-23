-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS CUBE;


DO $$
BEGIN
	-- LOG TYPE
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_type') THEN
        CREATE TYPE LOG_TYPE AS ENUM ('DELETE', 'UPDATE', 'INSERT', 'DEFAULT');
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION select_closest_color(rgbColor CUBE)
RETURNS TABLE ( code INT, name VARCHAR(20), distance FLOAT, brothers INT )
LANGUAGE plpgsql
AS $$
  BEGIN
  	RETURN QUERY
    SELECT
    c.code as code, c.name, cube_distance(c.rgb, rgbColor) as distance,
     (
      SELECT count(*) FROM COLORS as t
      WHERE t.name ~ CONCAT('^(', c.name, ' )([1-9]{1,4})$') AND t.static = false
    )::INT as similars
    FROM COLORS as c
    WHERE c.static = true
    GROUP BY c.code
    ORDER BY 3 ASC LIMIT 1;
  END;
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
  	static BOOL NOT NULL DEFAULT FALSE,
  	name VARCHAR(100) UNIQUE,
  	rgb CUBE UNIQUE,
  	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS PALETTES (
	code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 	name VARCHAR(50) UNIQUE,
  	amount INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
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

-- INDEXS

CREATE INDEX IF NOT EXISTS COLORS_RGB_INDEX ON COLORS USING GIST(rgb);

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
            NEW.updatedAt = NOW();
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

-- INSERT INTO USERS(fullName, email, password) VALUES
-- ('Vinícius Roque Maciel Oliveira', 'sydoafk@gmail.com', 'asokoaskoa');

-- UPDATE USERS SET email = 'x2viniroque@gmail.com' WHERE email = 'sydoafk@gmail.com';

-- DELETE FROM USERS WHERE email = 'x2viniroque@gmail.com';
    
-- ------------------------------------------------------------------------


CREATE OR REPLACE FUNCTION colors_palettes_changed_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
	BEGIN
    	IF TG_OP = 'DELETE' THEN
        
        	UPDATE PALETTES SET amount = amount - 1, updatedAt = NOW() WHERE code = OLD.codePalette;
            
        	RETURN OLD;
        END IF;
        
        UPDATE PALETTES SET amount = amount + 1, updatedAt = NOW() WHERE code = NEW.codePalette;
    	RETURN NEW;
	END;
$$;


DROP TRIGGER IF EXISTS colors_palettes_changed_amount_trigger ON COLORS_PALETTES;
CREATE TRIGGER colors_palettes_changed_amount_trigger
	AFTER INSERT OR DELETE ON COLORS_PALETTES
	FOR EACH ROW
	EXECUTE PROCEDURE colors_palettes_changed_amount();


CREATE OR REPLACE FUNCTION add_name_color()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
	BEGIN
    	IF TG_OP = 'UPDATE' THEN
        	RETURN OLD; -- NÃO PODE ALTERADO DEPOIS DE ADICIONADO
        END IF;
    
    	IF NEW.static = FALSE THEN
        	NEW.name := CONCAT((SELECT CONCAT(name, ' ', (brothers+1)::varchar) as name FROM select_closest_color(NEW.rgb)).name);
        END IF;
                              
        NEW.name := UPPER(NEW.name);
        
    	RETURN NEW;
	END;
$$;

DROP TRIGGER IF EXISTS add_name_color_trigger ON COLORS;
CREATE TRIGGER add_name_color_trigger
	BEFORE INSERT OR UPDATE ON COLORS
	FOR EACH ROW
	EXECUTE PROCEDURE add_name_color();


-- INSERINDO CORES ESTÁTICAS

INSERT INTO COLORS(static, name, rgb) VALUES
  (true, 'RED', '(255, 0, 0)'::CUBE),
  (true, 'BLUE', '(0, 0, 255)'::CUBE),
  (true, 'GREEN', '(0,128,0)'::CUBE),
  (true, 'BLACK', '(0, 0, 0)'::CUBE),
  (true, 'WHITE', '(255, 255, 255)'::CUBE),
  (true, 'YELLOW', '(255, 255, 0)'::CUBE),
  (true, 'LIGHTSALMON', '(255,160,122)'::CUBE),
  (true, 'SALMON', '(250,128,114)'::CUBE),
  (true, 'DARKSALMON', '(233,150,122)'::CUBE),
  (true, 'LIGHTCORAL', '(240,128,128)'::CUBE),
  (true, 'INDIANRED', '(205,92,92)'::CUBE),
  (true, 'CRIMSON', '(220,20,60)'::CUBE),
  (true, 'FIREBRICK', '(178,34,34)'::CUBE),
  (true, 'DARKRED', '(139,0,0)'::CUBE),
  (true, 'CORAL', '(255,127,80)'::CUBE),
  (true, 'TOMATO', '(255,99,71)'::CUBE),
  (true, 'ORANGERED', '(255,69,0)'::CUBE),
  (true, 'GOLD', '(255,215,0)'::CUBE),
  (true, 'ORANGE', '(255,165,0)'::CUBE),
  (true, 'DARKORANGE', '(255,140,0)'::CUBE),
  (true, 'CORNSILK', '(255,248,220)'::CUBE),
  (true, 'BLANCHEDALMOND', '(255,235,205)'::CUBE),
  (true, 'BISQUE', '(255,228,196)'::CUBE),
  (true, 'NAVAJOWHITE', '(255,222,173)'::CUBE),
  (true, 'WHEAT', '(245,222,179)'::CUBE),
  (true, 'BURLYWOOD', '(222,184,135)'::CUBE),
  (true, 'TAN', '(210,180,140)'::CUBE),
  (true, 'ROSYBROWN', '(188,143,143)'::CUBE),
  (true, 'SANDYBROWN', '(244,164,96)'::CUBE),
  (true, 'GOLDENROD', '(218,165,32)'::CUBE),
  (true, 'PERU', '(205,133,63)'::CUBE),
  (true, 'CHOCOLATE', '(210,105,30)'::CUBE),
  (true, 'SADDLEBROWN', '(139,69,19)'::CUBE),
  (true, 'SIENNA', '(160,82,45)'::CUBE),
  (true, 'BROWN', '(165,42,42)'::CUBE),
  (true, 'MAROON', '(128,0,0)'::CUBE),
  (true, 'LIGHTYELLOW', '(255,255,224)'::CUBE),
  (true, 'LEMONCHIFFON', '(255,250,205)'::CUBE),
  (true, 'LIGHTGOLDENROWYELLOW', '(250,250,210)'::CUBE),
  (true, 'PAPAYAWHIP', '(255,239,213)'::CUBE),
  (true, 'MOCCASIN', '(255,228,181)'::CUBE),
  (true, 'PEACHPUFF', '(255,218,185)'::CUBE),
  (true, 'PALEGOLDNROD', '(238,232,170)'::CUBE),
  (true, 'KHAKI', '(240,230,140)'::CUBE),
  (true, 'DARKKHAKI', '(189,183,107)'::CUBE),
  (true, 'LAWNGREEN', '(124,252,0)'::CUBE),
  (true, 'CHARTEUSE', '(127,255,0)'::CUBE),
  (true, 'LIMEGREEN', '(50,205,50)'::CUBE),
  (true, 'LIME', '(0,255,0)'::CUBE),
  (true, 'FORESTGREEN', '(34,139,34)'::CUBE),
  (true, 'DARKGREEN', '(0,100,0)'::CUBE),
  (true, 'GREENYELLOW', '(173,255,47)'::CUBE),
  (true, 'YELLOWGREEN', '(154,205,50)'::CUBE),
  (true, 'SPRINGGREEN', '(0,255,127)'::CUBE),
  (true, 'MEDIUMSPRINGGREEN', '(0,250,154)'::CUBE),
  (true, 'LIGHTGREEN', '(144,238,144)'::CUBE),
  (true, 'PALEGREEN', '(152,251,152)'::CUBE),
  (true, 'DARKSEAGREEN', '(143,188,143)'::CUBE),
  (true, 'MEDIUMSEAGREEN', '(60,179,113)'::CUBE),
  (true, 'SEAGREEN', '(46,139,87)'::CUBE),
  (true, 'OLIVE', '(128,128,0)'::CUBE),
  (true, 'DARKOLIVEGREEN', '(85,107,47)'::CUBE),
  (true, 'OLIVEDRAB', '(107,142,35)'::CUBE),
  (true, 'LIGHTCYAN', '(224,255,255)'::CUBE),
  (true, 'CYAN', '(0,255,255)'::CUBE),
  (true, 'AQUAMARINE', '(127,255,212)'::CUBE),
  (true, 'MEDIUMAQUAMARINE', '(102,205,170)'::CUBE),
  (true, 'PALETURQUOISE', '(175,238,238)'::CUBE),
  (true, 'TURQUOISE', '(64,224,208)'::CUBE),
  (true, 'MEDIUMTURQUOISE', '(72,209,204)'::CUBE),
  (true, 'DARKTURQUOISE', '(0,206,209)'::CUBE),
  (true, 'LIGHTSEAGREEN', '(32,178,170)'::CUBE),
  (true, 'CADETBLUE', '(95,158,160)'::CUBE),
  (true, 'DARKCYAN', '(0,139,139)'::CUBE),
  (true, 'TEAL', '(0,128,128)'::CUBE),
  (true, 'POWDERBLUE', '(176,224,230)'::CUBE),
  (true, 'LIGHTBLUE', '(173,216,230)'::CUBE),
  (true, 'LIGHTSKYBLUE', '(135,206,250)'::CUBE),
  (true, 'SKYBLUE', '(135,206,235)'::CUBE),
  (true, 'DEEPSKYBLUE', '(0,191,255)'::CUBE),
  (true, 'LIGHTSTEELBLUE', '(176,196,222)'::CUBE),
  (true, 'DODGERBLUE', '(30,144,255)'::CUBE),
  (true, 'CORNFLOWERBLUE', '(100,149,237)'::CUBE),
  (true, 'STEELBLUE', '(70,130,180)'::CUBE),
  (true, 'ROYALBLUE', '(65,105,225)'::CUBE),
  (true, 'MEDIUMBLUE', '(0,0,205)'::CUBE),
  (true, 'DARKBLUE', '(0,0,139)'::CUBE),
  (true, 'NAVY', '(0,0,128)'::CUBE),
  (true, 'MIDNIGHTBLUE', '(25,25,112)'::CUBE),
  (true, 'MEDIUMSLATEBLUE', '(123,104,238)'::CUBE),
  (true, 'SLATEBLUE', '(106,90,205)'::CUBE),
  (true, 'DARKSLATEBLUE', '(72,61,139)'::CUBE),
  (true, 'LAVENDER', '(230,230,250)'::CUBE),
  (true, 'THISTLE', '(216,191,216)'::CUBE),
  (true, 'PLUM', '(221,160,221)'::CUBE),
  (true, 'VIOLET', '(238,130,238)'::CUBE),
  (true, 'ORCHID', '(218,112,214)'::CUBE),
  (true, 'MAGENTA', '(255,0,255)'::CUBE),
  (true, 'MEDIUMORCHID', '(186,85,211)'::CUBE),
  (true, 'MEDIUMPURPLE', '(147,112,219)'::CUBE),
  (true, 'BLUEVIOLET', '(138,43,226)'::CUBE),
  (true, 'DARKVIOLET', '(148,0,211)'::CUBE),
  (true, 'DARKORCHID', '(153,50,204)'::CUBE),
  (true, 'DARKMAGENTA', '(139,0,139)'::CUBE),
  (true, 'PURPLE', '(128,0,128)'::CUBE),
  (true, 'INDIGO', '(75,0,130)'::CUBE),
  (true, 'PINK', '(255,192,203)'::CUBE),
  (true, 'LIGHTPINK', '(255,182,193)'::CUBE),
  (true, 'HOTPINK', '(255,105,180)'::CUBE),
  (true, 'DEEPPINK', '(255,20,147)'::CUBE),
  (true, 'PALEVIOLETRED', '(219,112,147)'::CUBE),
  (true, 'MEDIUMVIOLETRED', '(199,21,133)'::CUBE),
  (true, 'SNOW', '(255,250,250)'::CUBE),
  (true, 'HONEYDEW', '(240,255,240)'::CUBE),
  (true, 'MINTCREAM', '(245,255,250)'::CUBE),
  (true, 'AZURE', '(240,255,255)'::CUBE),
  (true, 'ALICEBLUE', '(240,248,255)'::CUBE),
  (true, 'GHOSTWHITE', '(248,248,255)'::CUBE),
  (true, 'WHITESMOKE', '(245,245,245)'::CUBE),
  (true, 'SEASHELL', '(255,245,238)'::CUBE),
  (true, 'BEIGE', '(245,245,220)'::CUBE),
  (true, 'OLDLACE', '(253,245,230)'::CUBE),
  (true, 'FLORALWHITE', '(255,250,240)'::CUBE),
  (true, 'IVORY', '(255,255,240)'::CUBE),
  (true, 'ANTIQUEWHITE', '(250,235,215)'::CUBE),
  (true, 'LINEN', '(250,240,230)'::CUBE),
  (true, 'LAVENDERBLUSH', '(255,240,245)'::CUBE),
  (true, 'MISTYROSE', '(255,228,225)'::CUBE),
  (true, 'GAINSBORO', '(220,220,220)'::CUBE),
  (true, 'LIGHTGRAY', '(211,211,211)'::CUBE),
  (true, 'SILVER', '(192,192,192)'::CUBE),
  (true, 'DARKGRAY', '(169,169,169)'::CUBE),
  (true, 'GRAY', '(128,128,128)'::CUBE),
  (true, 'DIMGRAY', '(105,105,105)'::CUBE),
  (true, 'LIGHTSLATEGRAY', '(119,136,153)'::CUBE),
  (true, 'SLATEGRAY', '(112,128,144)'::CUBE),
  (true, 'DARKSLATEGRAY', '(47,79,79)'::CUBE) ON CONFLICT DO NOTHING;
