alter table doc
  add revision boolean not null default 0
  after content;

alter table doch
  add revision boolean not null default 0
  after content;
