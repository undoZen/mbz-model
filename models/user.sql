create table user (
  id int(11) unsigned not null unique auto_increment,
  username varchar(32) not null unique,
  salt varchar(32) not null,
  password varchar(128) not null,
  email varchar(255) not null unique,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp
) engine=MyISAM default charset=utf8;
