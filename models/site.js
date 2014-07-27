var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var ldb = require('../lib/db/ldb');
var crypt = require('../lib/crypt');

function mapJsonParse(s) {
  return JSON.parse(s);
}

function fPrependString(str) {
  return function (s) {
    return str + s;
  }
}

exports.qAddSite = function (site) {
  var c = _.extend({}, site);
  if (!c.domain) throw new Error('domain is required');
  return Q(knex('site').insert(site))
  .then(function (ids) {
    return _.extend({id: ids[0]}, site);
  })
  var domains = c.customDomain ? [c.domain, c.customDomain] : [c.domain];
  var dprops = domains.map(function (d) {
    return 'domain2id:' + d;
  });
  return qdb.mget(dprops)
  .then(function (idsByDomain) {
    for (var i in idsByDomain) {
      if (idsByDomain[i]) throw new Error('domain '+domains[i]+' exists');
    }
    return qdb.incr('global:siteCount')
  })
  .then(function (id) {
    var domains2id = dprops.reduce(function (r, v) {
      return r.concat([v, id]);
    }, []);
    c.id = id;
    return qdb.mset(domains2id.concat(['site:' + id, JSON.stringify(c)]))
    .then(ldb.sadd('global:sites', id))
    .then(ldb.sadd('user:'+c.ownerId+':sites', id))
    .then(function () {
      return id;
    });
  });
};

exports.qSiteById = qSiteById;
function qSiteById(pId) {
  return Q(pId)
  .then(function (siteId) {
    return Q(knex('site').where({id: siteId}).select()).get(0);
  })
}

exports.qSiteByDomain = qSiteByDomain;
function qSiteByDomain(pDomain) {
  return Q(pDomain)
  .then(function (domain) {
    return Q(knex('site').where({domain: domain}).orWhere({customDomain: domain}).select()).get(0);
    return qdb.get(fPrependString('domain2id:')(domain));
  })
  //.then(qSiteById)
}

exports.qSitesByIds = qSitesByIds;
function qSitesByIds (pIds) {
  return Q(pIds)
  .then(function (siteIds) {
    return Q.all(siteIds.map(qSiteById));
  })
}

exports.qSitesByUserId = function (pId) {
  return Q(pId)
  .then(function (id) {
    return Q(knex('site').where({ownerId: id}).select());
    return qdb.smembers('user:'+id+':sites')
  })
  //.then(qSitesByIds)
};

exports.qAllSites = function () {
  return Q(knex('site').select());
  return qdb.smembers('global:sites')
  .then(qSitesByIds)
};
