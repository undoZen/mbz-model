create table if not exists doc (
  id int(11) unsigned not null unique auto_increment,
  userId int(11) unsigned not null,
  siteId int(11) unsigned not null,
  slug text not null,
  title text,
  content mediumtext,
  html mediumtext,
  autoSaved boolean not null default 0,
  published boolean not null default 0,
  history boolean not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
