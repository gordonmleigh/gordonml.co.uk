{{{
  "title": "Promised-mongo: Node.js, MongoDB and promises",
  "url": "promised-mongo-node-js-mongodb-and-promises",
  "date": "2013-11-30",
  "category": "programming",
  "tags": ["mongodb", "nodejs", "javascript", "promises"]
}}}

I've been doing a lot of work with [node.js](http://nodejs.org/) lately.  I've come to love
the simplicity and power of JavaScript.  Even in v0.10, node.js is a great framework, with more
great things to come.  Also in the JavaScript world, MongoDB is a powerful
[Document-oriented database](http://en.wikipedia.org/wiki/Document-oriented_database) (NoSQL database),
which is guaranteed to change the way you think about your data.  I set about building a library
to let me get to mongodb from node, with promises built right in.

<!-- more -->

If you are new to node.js, I recommend you read
[What you need to know about Node.js](http://readwrite.com/2013/11/07/what-you-need-to-know-about-nodejs#awesm=~ooH5jXJ0GEPsBo),
the [Node Beginner Book](http://www.nodebeginner.org/), or any of the resources mentioned on
[this StackOverflow post](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js).


## Mongoose

A library that has been getting a lot of attention recently is [Mongoose](http://mongoosejs.com/).
Described as “elegant mongodb object modeling for node.js”, this project aims to bring a full-blown
ODM to the node.js/MongoDB party.  From the homepage:

```js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
});
```

I feel this rather defeats the point of using a database like MongoDB, which is designed to be
schema-less and light-weight.  I didn't even use over-bloated ORMs when I was writing with C# and SQL
Server, so I don't think I should start now in these enlightened times.


## MongoJS

[MongoJS](https://github.com/mafintosh/mongojs) is closer to what I want.  It is a lightweight
wrapper on top of the [MongoDB native driver](https://github.com/mongodb/node-mongodb-native),
aiming to emulate the official API as closely as possible.

The only thing I don't like about it – and node in general for that matter – is the
[callback hell](http://callbackhell.com/) that seems to be the default situation.  This gives rise
to this lovely snippet from the the MongoJS tests:

```js
var assert = require('assert');
var mongojs = require('../index');
var db = mongojs('test', ['b.c']);

db.b.c.remove(function() {
  db.b.c.save({hello: "world"}, function(err, rs) {
    db.b.c.find(function(err, docs) {
      assert.equal(docs[0].hello, "world");
      db.b.c.remove(function() {
        db.close();
      });
    });
  });
});
```

In production code, there would also be `if (err) ...` statements everywhere.  I think that looks
a bit messy.


## promised-mongo

So I set about porting mongojs to use [promises](http://howtonode.org/promises).  The results are
[on my GitHub](https://github.com/gordonmleigh/promised-mongo).  Best of all, it still supports
using callbacks, so can be used as a drop-in replacement for mongojs, making porting an existing
application extremely easy.  Using promises, the above test can be written as follows:


```js
var assert = require('assert');
var mongojs = require('../index');
var db = mongojs('test', ['b.c']);

db.b.c.remove()
  .then(function() {
    return db.b.c.save({hello: "world"});
  })
  .then(function(rs) {
    return db.b.c.find().toArray();
  })
  .then(function(docs) {
    assert.equal(docs[0].hello, "world");
    return db.b.c.remove();
  })
  .fin(function () {
    db.close();
  })
  .done();
```


## Continuation Spaghetti or Callback Hell?
Granted, whether or not you think the new example looks any better is a matter of taste.  On one
hand, we have super-nested callbacks, on the other we have a bunch of continuations, the function
of which is not entirely obvious unless you are comfortable with promises.  Using promises does give
you the opportunity of waiting on several things to complete, or chaining asynchronous methods
together in a straightforward way.  Having said that, the same can be achieved using the
[async](https://github.com/caolan/async) library: I guess it is a matter of personal taste.  One
thing counting against promises is that errors will be lost if you forget to call `done()` at the
end of a promise chain; however, the [Q readme](https://github.com/kriskowal/q#the-end) claims that
improvements are being explored.

What I am looking forward to however, is the use of
[ES6 Generators](http://jlongster.com/2012/10/05/javascript-yield.html) in conjunction
[with promises](https://github.com/kriskowal/q/tree/master/examples/async-generators).  Then we can
rewrite the above test like so:

```js
var assert = require('assert');
var mongojs = require('../index');
var db = mongojs('test', ['b.c']);
var q = require('q');

q.async(function *() {
  yield db.b.c.remove();
  yield db.b.c.save({hello: "world"});
  var docs = yield db.b.c.find().toArray();
  assert.equal(docs[0].hello, "world");
  yield db.b.c.remove();
  db.close();
});

```

How neat is that?


## A word about alternatives

I am aware of [q-mongodb](https://github.com/canned/QMongoDB), however at the time of writing it
hasn't been updated in a year.  Also, judging by the usage example in the readme, it requires
promises for everything, even getting the db and the collection.  That's sure to inflate the
continuation spaghetti.