"use strict";

/**
 * Use this to make an object that rests on the couch.

var CouchDB = require("couch").CouchDB;

var couch = CouchDB.rest("http://localhost:5984/example/");

 * Then, just read and write.

// writes to database using HTTP PUT behind the scenes.
couch.someDocument = { foo : "bar" }

// reads from database using HTTP GET behind the scenes
print(couch.someDocument.foo)

// you can write just part of a record, but it'll still PUT
// the whole thing back on the couch.
couch.someDocument.foo = "baz";

// remove from the database
delete couch.someDocument

// clear the caches, retrieve loose change.
CouchDB.vaccuum(couch)

 * This can be pretty slow.  Reads are cached, which mitigates it somewhat.
 * Writes are optimistic, and may need to update if the cache is out of date.
 **/

var cushions = {},
    CouchDB = exports.CouchDB = {
        rest : function CouchDB_rest (url) {
            return new CouchConnection(url);
        },
        vaccuum : function CouchDB_vaccuum (obj) {
            cushions[obj._url] = {};
        }
    };

// some people like other kinds of cleaning.
["fabreeze", "reupholster", "plump", "dust"].forEach(function (clean) {
    Object.defineProperty(CouchDB, clean, {
        value : function () {
            CouchDB.vaccuum.apply(this, arguments);
        },
        enumerable : false
    });
});

var {HTTPClient} = require("http-client"),
    JSON = require("json"),
    URL = require("url");

function jsonCleaner (obj) {
    if (typeof obj === "function") return obj.toString();
    return obj;
};

function CouchConnection (url) {
    if (typeof url === "string") url = URL.parse(url);
    ["protocol", "domain", "path", "url"].forEach(function (part) {
        if (!(part in url)) throw new Error(
            "CouchConnection: URL does not appear to have a "+i+". "+
            "Please supply a string or a URL object."
        );
    });
    Object.defineProperty(this, "_url", {
        value : url.url,
        enumerable : false,
        configurable : true,
        set : function (newURL) {
            CouchConnection.call(this, newURL)
        }
    });
    if (!(this._url in cushions)) cushions[this._url] = {};
};





