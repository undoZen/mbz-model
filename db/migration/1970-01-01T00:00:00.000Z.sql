drop table if exists user;
drop table if exists site;
drop table if exists doc;
drop table if exists doch;
drop table if exists doclink;
drop table if exists cname;

create table user (
  id int(11) unsigned not null unique auto_increment,
  username varchar(32) not null unique,
  salt varchar(32) not null,
  password varchar(128) not null,
  email varchar(255) not null unique,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;

create table site (
  id int(11) unsigned not null unique auto_increment,
  ownerId int(11) unsigned not null,
  name varchar(32) not null unique,
  domain varchar(255) not null,
  customDomain varchar(255),
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;

create table if not exists doc (
  docId int(11) unsigned not null unique auto_increment,
  userId int(11) unsigned not null,
  siteId int(11) unsigned not null,
  slug text not null,
  title text,
  content mediumtext,
  autoSaved boolean not null default 0,
  published boolean not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;

create table if not exists doch (
  id int(11) unsigned not null unique auto_increment,
  docId int(11) unsigned not null,
  userId int(11) unsigned not null,
  siteId int(11) unsigned not null,
  slug text not null,
  title text,
  content mediumtext,
  autoSaved boolean not null default 0,
  published boolean not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;

create table if not exists doclink (
  fromDocId int(11) unsigned not null,
  toDocId int(11) unsigned not null
) engine=MyISAM default charset=utf8;
