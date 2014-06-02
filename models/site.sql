create table site (
  id int(11) unsigned not null unique auto_increment,
  ownerId int(11) unsigned not null,
  name varchar(32) not null unique,
  domain varchar(255) not null,
  customDomain varchar(255),
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
