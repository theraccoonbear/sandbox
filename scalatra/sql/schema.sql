DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  access VARCHAR(255)  DEFAULT 'user',
  password VARCHAR(255)  DEFAULT '',
  salt VARCHAR(255)  DEFAULT '',
  username VARCHAR(255)  DEFAULT '',
  created TIMESTAMP WITH TIME ZONE ,
  archived VARCHAR(255)  DEFAULT '0',
  modified TIMESTAMP WITH TIME ZONE  DEFAULT '1970-01-01 00:00:01'
);



DROP TABLE IF EXISTS log CASCADE;
CREATE TABLE log (
  id SERIAL PRIMARY KEY,
  message VARCHAR(255)  DEFAULT '',
  status VARCHAR(255)  DEFAULT '',
  created TIMESTAMP WITH TIME ZONE ,
  archived VARCHAR(255)  DEFAULT '0',
  modified TIMESTAMP WITH TIME ZONE  DEFAULT '1970-01-01 00:00:01'
);

