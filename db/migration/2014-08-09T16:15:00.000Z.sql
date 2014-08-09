alter table site
  drop customDomain;

create table cname (
  id int(11) unsigned not null unique auto_increment,
  domain varchar(255) not null,
  siteId int(11) unsigned not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
