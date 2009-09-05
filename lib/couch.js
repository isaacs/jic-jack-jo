/**
 * Use this to make an object that rests on the couch.

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





var {HTTPClient} = require("http-client"),
    JSON = require("json");

function jsonCleaner (obj) {
    if (typeof obj === "function") return obj.toString();
    return obj;
};

