using extension auth;

module default {
  global current_user := (
    assert_single((
      select User { id }
      filter .identity = global ext::auth::ClientTokenIdentity
    ))
  );

  type User {
    required identity: ext::auth::Identity {
      constraint exclusive;
    };
  }

  type Podcast {
    required name: str;
    required url: str;
    required key: str;
    required bytes: int64;
    required transcription: str;
    required messages: str {
      default := '[]';
    }

    required created_by: User {
      default := global current_user;
    }

    last_updated: datetime {
      rewrite insert using (datetime_of_statement());
      rewrite update using (datetime_of_statement());
    }
  }
}