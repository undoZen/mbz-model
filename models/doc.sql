create table if not exists doc (
  docId int(11) unsigned not null,
  userId int(11) unsigned not null,
  siteId int(11) unsigned not null,
  slug text not null,
  title text,
  content mediumtext,
  html mediumtext,
  autoSaved boolean,
  published boolean,
  history boolean,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
