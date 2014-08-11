var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var crypt = require('../lib/crypt');
var debug = require('debug')('mm:model:site');

var Sequelize = require('sequelize');
var sequelize = require('../lib/db/sequelize');
var User = require('./user');
var Site = exports = module.exports = sequelize.define('Site', {
  name: {type: Sequelize.STRING, allowNull: false, unique: true},
  domain: {type: Sequelize.STRING, allowNull: false},
  ownerId: {type: Sequelize.INTEGER, allowNull: false, references: User, referenceKey: 'id'}
});
//User.hasMany(Site);
//Site.belongsTo(User, {as: 'owner', allowNull: false});
var CName = require('./cname');

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
  return Q(Site.create(c))
  .then(function (site) {
    return site.values;
  })
  .then(function (site) {
    if (!customDomain) return site;
    return Q(CName.create({
      domain: customDomain,
      siteId: site.id
    }))
    .then(fixedReturn(site));
  })
  /* 當時用 redis 實現時候的代碼
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
  */
};

exports.qSiteById = qSiteById;
function qSiteById(pId) {
  return Q(pId)
  .then(function (siteId) {
    return Q(Site.find(siteId));
  })
}

exports.qSiteByDomain = qSiteByDomain;
function qSiteByDomain(pDomain) {
  return Q(pDomain)
  .then(function (domain) {
    debug('domain: %s', domain)
    if (domain.match(/\.mian\.bz$/i)) {
      return Q(Site.find({where: {domain: domain}}))
    } else {
      return Q(CName.find({where: {domain: domain}}))
      .then(function (cname) {
        debug('cname: %j', cname)
        if (!cname) return null;
        return Q(Site.find(cname.siteId));
      })
    }
    //return qdb.get(fPrependString('domain2id:')(domain));
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
    return Q(Site.findAll({where: {ownerId: id}}));
    return qdb.smembers('user:'+id+':sites')
  })
  //.then(qSitesByIds)
};

exports.qAllSites = function () {
  return Q(Site.findAll());
};
