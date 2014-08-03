create table if not exists doclink (
  fromDocId int(11) unsigned not null,
  toDocId int(11) unsigned not null
) engine=MyISAM default charset=utf8;
