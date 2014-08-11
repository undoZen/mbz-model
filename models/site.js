var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var crypt = require('../lib/crypt');
var debug = require('debug')('mm:model:site');

function mapJsonParse(s) {
  return JSON.parse(s);
}

function fPrependString(str) {
  return function (s) {
    return str + s;
  }
}
function fixedReturn(value) {
  return function () {
    return value;
  };
}

exports.qAddSite = function (site) {
  var c = _.extend({}, site);
  if (!c.domain) throw new Error('domain is required');
  var customDomain;
  if (c.customDomain) {
    customDomain = c.customDomain;
    delete c.customDomain;
  }
  debug('add site: %j', c)
  return Q(knex('site').insert(c))
  .then(function (ids) {
    return ids[0];
  })
  .then(function (id) {
    if (!customDomain) return id;
    return Q(knex('cname').insert({
      domain: customDomain,
      siteId: id
    }))
    .then(fixedReturn(id));
  })
  .then(function (id) {
    return qSiteById(id);
  })
  var domains = c.customDomain ? [c.domain, c.customDomain] : [c.domain];
  var dprops = domains.map(function (d) {
    return 'domain2id:' + d;
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
    debug('domain: %s', domain)
    if (domain.match(/\.mian\.bz$/i)) {
      return Q(knex('site').where({domain: domain}).limit(1).select()).get(0);
    } else {
      return Q(knex('cname').where({domain: domain}).limit(1).select()).get(0)
      .then(function (cname) {
        debug('cname: %j', cname)
        if (!cname) return null;
        return Q(knex('site').where({id: cname.siteId}).limit(1).select()).get(0);
      })
    }
  })
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
  })
};

exports.qAllSites = function () {
  return Q(knex('site').select());
};
