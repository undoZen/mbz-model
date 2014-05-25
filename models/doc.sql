create table if not exists doc (
  id int(11) unsigned not null unique auto_increment,
  user_id int(11) unsigned not null,
  domain varchar(255) not null,
  slug text not null,
  title text,
  content mediumtext,
  html mediumtext,
  auto_saved boolean,
  published boolean,
  history boolean,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
