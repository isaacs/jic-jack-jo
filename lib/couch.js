"use strict";

/**
 * Use this to make an object that rests on the couch.

var CouchDB = require("couch").CouchDB;

var couch = CouchDB("http://localhost:5984/example/");

 * Then, just read and write.

// writes to database using HTTP PUT
couch.PUT("some-document", { foo : "bar" })

// reads from database using HTTP GET
print(couch.GET("some-document").foo)

// remove from the database
couch.DELETE("some-document")

 * This can be pretty slow.  Reads are cached, which mitigates it somewhat.
 * Writes are optimistic, and may need to update if the cache is out of date.
 * To perform a GET that bypasses the cache, pass a truish value as the second
 * param.
 **/

var HTTPClient = require("http-client").HTTPClient,
    JSON = require("json"),
    URL = require("uri"),
    cushions = {};

exports.CouchDB = CouchDB;
function CouchDB (url) {
    return new CouchConnection(url);
};

function CouchConnection (url) {
    validMember(this, "url", validateUrl); 
    if (url) this.url = url;
    if (!(this.url in cushions)) cushions[this.url] = {};
};
CouchConnection.prototype = {
    PUT : function (key, data, gentle) {
        // check to see if this thing is in the cushions.
        var cushion = cushions[this.url];
        if (key in cushion) {
            data._rev = cushion[key]._rev;
            data._id = cushion[key]._id;
        } else if (!("_id" in data)) {
            data._id = key;
        }
        var json = JSON.stringify(data, jsonCleaner);
        
        var result = HTTPClient({
            url : this.url+"/"+(key),
            method : "PUT",
            headers : {
                "Content-Type":"application/json",
                "Content-Length":json.length
            },
            body : [json]
        }).connect(true);
        
        // if we got a 409, and we're not being
        // gentle, then refresh and try again.
        // otherwise, just return the error.
        if (result.status === 409 && !gentle) {
            this.GET(key, true);
            result = this.PUT(key, data);
        }
        
        // if it works, may as well update the cushion.
        var resData = extractData(result);
        if (resData) {
            data._rev = resData.rev;
            data._id = resData.id;
            cushion[key] = data;
        }
        
        return result;
    },
    GET : function (key, fresh) {
        var cushion = cushions[this.url];
        if (fresh) delete cushion[key];
        if (key in cushion) return cushion[key];
        
        var data = extractData(HTTPClient({
            url : this.url + "/" + (key),
            method : "GET"
        }).connect(true));
        
        if (data) cushion[key] = data;
        
        return data;
    },
    DELETE : function (key) {
        var rev = this.GET(key, true);
        if (!rev) return;
        delete cushions[this.url][key];
        rev = rev._rev;
        return HTTPClient({
            url : this.url + "/" + (key) + "?rev=" + rev,
            method : "DELETE"
        }).connect(true);
    }
};

function jsonCleaner (key, obj) {
    if (typeof obj === "function") return obj.toString();
    return obj;
};

function validateUrl (u) {
    if (typeof u === "string") u = URL.parse(u);
    ["protocol", "domain", "path", "url"].forEach(function (part) {
        if (!u || !(part in u)) throw new Error(
            "Supplied URL does not appear to have a "+part+". "+
            "Please supply a valid string or a URL object."
        );
    });
    return u.url.replace(/\/+$/g, '');
};

// this function probably belongs in some generic library type place.
function validMember (obj, key, validator, def) {
    Object.defineProperty(obj, key, (function () {
        var val = def;
        return {
            set : function (v) { val = validator(v); },
            get : function () { return val }
        };
    })());
};

function extractData (result) {
    if (result.status < 200 || result.status >= 300) return undefined;
    var data = [];
    result.body.forEach(function (p) { data.push(p) });
    try {
        return JSON.parse(data.join(""));
    } catch (ex) {
        return undefined;
    }
}

