create table if not exists doclink (
  fromSiteId int(11) unsigned not null,
  fromSlug text not null,
  toSiteId int(11) unsigned not null,
  toSlug text not null
) engine=MyISAM default charset=utf8;
