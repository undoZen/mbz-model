var Q = require('q');
var _ = require('lodash');

var qdb = require('./qdb');
var ldb = require('./ldb');
var crypt = require('../utils').crypt;

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
  if (!c.domains) throw new Error('domains is required');
  var dprops = c.domains.map(function (d) {
    return 'domain2id:' + d;
  });
  return qdb.mget(dprops)
  .then(function (idsByDomain) {
    for (var i in idsByDomain) {
      if (idsByDomain[i]) throw new Error('domain '+c.domains[i]+' exists');
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
    return qdb.get(fPrependString('site:')(siteId));
  })
  .then(function (siteJson) {
    return JSON.parse(siteJson);
  })
}

exports.qSiteByDomain = qSiteByDomain;
function qSiteByDomain(pDomain) {
  return Q(pDomain)
  .then(function (domain) {
    return qdb.get(fPrependString('domain2id:')(domain));
  })
  .then(qSiteById)
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
    return qdb.smembers('user:'+id+':sites')
  })
  .then(qSitesByIds)
};

exports.qAllSites = function () {
  return qdb.smembers('global:sites')
  .then(qSitesByIds)
};
