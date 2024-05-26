CREATE MIGRATION m1cprpxwfnzj7onjfjsse6cpolqlxzzsybwvfw4o5ldq2ymrjlvesa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE TYPE default::User {
      CREATE REQUIRED LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE GLOBAL default::current_user := (std::assert_single((SELECT
      default::User {
          id
      }
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE TYPE default::Podcast {
      CREATE REQUIRED LINK created_by: default::User {
          SET default := (GLOBAL default::current_user);
      };
      CREATE REQUIRED PROPERTY bytes: std::int64;
      CREATE REQUIRED PROPERTY key: std::str;
      CREATE PROPERTY last_updated: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY messages: std::str {
          SET default := '[]';
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY transcription: std::str;
      CREATE REQUIRED PROPERTY url: std::str;
  };
};
