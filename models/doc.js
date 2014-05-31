var fs = require('fs');

var Q = require('q');
var marked = require('marked');

var knex = require('./knex');
var qdb = require('./qdb');
var siteModel = require('./site');

var env = process.env.NODE_ENV || 'development';

/* reflink [链接文字][/link_target] 形式的站内链接 */
var reflink = /\[((?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*)\]\[([^\]]*)\]/g;

exports.qSaveDoc = function(doc) {
  if (!doc.siteId) throw new Error('doc.siteId is required');
  return siteModel.qSiteById(doc.siteId)
  .then(function (site) {
    if (site.ownerId != doc.userId) throw new Error('this user can not save to this site');
    return knex('doc').where({siteId: doc.siteId, slug: doc.slug}).update({history: true})
    .then(function (docsUpdated) {
      return docsUpdated
        ? qGetOneDoc({siteId: doc.siteId, slug: doc.slug}).get('docId')
        : qdb.incr('global:docCount');
    })
  })
  .then(function (docId) {
    doc.docId = docId;
    return knex('doc').insert(doc)
  })
  .then(function () {
    return doc;
  })
};

exports.qGetOneDoc = qGetOneDoc;
function qGetOneDoc(where) {
  return Q(knex('doc').where(where)).get(0);
};

exports.qGetDocs = function(where) {
  return Q(knex('doc').where(where));
};
