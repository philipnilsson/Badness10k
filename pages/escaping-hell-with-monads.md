---
title: Escaping Hell with Monads
date: "2017-05-07T22:12:03.284Z"
path: "/escaping-hell-with-monads/"
---

As programmers we occasionally find ourselves in "Programmer's Hell",
where our regular abstractions fail to satisfactory solve certain
recurrent problems.

In this post we'll have a look at some instances of such sitations,
their "ad hoc" solutions provided at the language level, and finally
at how these problems can be solved in a uniform way using Monads. (Call
you language implementor and ask for `do`-notation today!)

Null-checking Hell
==================

Null-checking Hell typically occurs when several partial functions,
i.e. functions that may not return a real value, need to be run in
sequence.

Such functions tend lead to deeply nested and hard to read code with
excessive syntactic clutter, obscuring our actual intentions.

``` javascript
var a = getData();
if (a != null) {
  var b = getMoreData(a);
  if (b != null) {
     var c = getMoreData(b);
     if (c != null) {
        var d = getEvenMoreData(a, c)
        if (d != null) {
          print(d);
        }
     }
  }
}
```

Ad hoc solution: Elvis operators
--------------------------------

Elvis operators introduce a specialized syntax for partial navigation,
helping to deal with such issues.  Unfortunately this syntax is
needlessly complected with object-oriented-style record and method
access.

``` javascript
var a = getData();
var b = a?.getMoreData();
var c = b?.getMoreData();
var d = c?.getEvenMoreData(a);
print(d);
```

Maybe Monad
-----------

By letting our simple functions explicitly return values of the
`Maybe` (sometimes `Option`) type, we can chain together such
functions using
[`do`-notation](https://en.wikibooks.org/wiki/Haskell/do_notation),
making use of the fact that `Maybe`/`Option` are Monadic.


``` haskell
do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d
```

For-loop Hell
=============

For-loop Hell occurs when iteration through multiple dependent data
sets is needed. Just as for null-checking, our code becomes deeply
nested, with a lot of syntactic clutter and needless bookkeeping.

``` javascript
var a = getData();
for (var a_i in a) {
  var b = getMoreData(a_i);
  for (var b_j in b) {
    var c = getMoreData(b_j);
    for (var c_k in c) {
      var d = getMoreData(c_k);
      for (var d_l in d) {
        print(d_l);
      }
    }
  }
}
```

Ad hoc solution: List comprehensions
------------------------------------

A more elegant solution to the problem is found by introducing a
specialized syntactic construction called list-comprehensions, sharing
a lot of similarities with `SQL`.


``` python
[
  print(d)
  for a in getData()
  for b in getMoreData(a)
  for c in getMoreData(b)
  for d in getEvenMoreData(a, c)
]
```

List Monad
----------

We note that lists are Monads. By reusing `do`-notation we can write
an equally elegant solution to our problem without introducing
additional notation.

List comprehensions often include syntax for filtering, which can be
added also to our case by using simple functions such
as
[`guard`](https://hackage.haskell.org/package/base-4.9.1.0/docs/Control-Monad.html#v:guard).

```haskell
do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d
```

Callback Hell
=============

The most famous and perhaps most painful circle of coding inferno is
Callback Hell, where the inversion of control needed to implement
asynchronous control leads to deeply nested code and excessive
syntactic clutter, difficult to follow error handling and a host of
other ailments.

```javascript
getData(a =>
  getMoreData(a, b =>
    getMoreData(b, c =>
      getEvenMoreData(a, c, d =>
        print(d),
        err => onErrorD(err)
      )
      err => onErrorC(err)
    ),
    err => onErrorB(err)
  ),
  err => onErrorA(err)
)
```

Ad hoc solution: Async/await
----------------------------

In order to overcome such difficulties, another kind of specialized
syntax is introduced, called `async/await` can be introduced. Such
notation typically delegates error handling to existing `try/catch`
syntax, which can sometimes feel like a hell on it's own.

```javascript
async function() {
  var a = await getData
  var b = await getMoreData(a)
  var c = await getMoreData(b)
  var d = await getEvenMoreData(a, c)
  print(d)
}
```

Ad hoc solution: Promises
-------------------------

Another possible solution is to use Promises (also
Futures/Tasks). While problems with nesting are alleviated, using the
result of a Promise in multiple places forces us to manually introduce
a lexical scope where such a value can be passed around. This leads to
one level of nesting per variable that is used in multiple positions.

Using promises directly using `.then`-syntax is also often not quite
as clean or clear as using `async/await` notation.

```javascript
getData().then(a => getMoreData(a)
  .then(b => getMoreData(b))
  .then(c => getEvenMoreData(a, c))
  .then(d => print(d)
);
```

Continuation Monad
------------------

At this point it shouldn't be surprising that we can solve this
problem in exactly the same way as the two situations previously
encountered by noting that Promises form Monads. In this context, we
often use the word Continuation in place of the above mentioned
names. <a href="#fn1">[1]</a>

```haskell
do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d
```

State-passing Hell
==================

The purely functional world is not without it's problems, even
when side-effects are not a concern. When writing certain kinds
of purely functional code, excessive parameter passing between
functions can become an issue.

```haskell
let
  (a, st1) = getData initalState
  (b, st2) = getMoreData (a, st1)
  (c, st3) = getMoreData (b, st2)
  (d, st4) = getEvenMoreData (a, c, st3)
in print(d)
```

Ad hoc solution: Imperative language
------------------------------------

We can solve such problems by introducing implicit state that let
functions communicate information between without having to pass all
dependent values as explicit parameters. Unfortunately by using an
imperative model by default severely complicates reasoning about
code. Lifetime and size of state typically has no static bounds.

```
a = getData();
b = getMoreData(a);
c = getMoreData(b);
d = getEvenMoreData(a, c);
print(d)
```

State Monad
-----------


```haskell
do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d
```

The State Monad provides purely functional state without references,
allowing for many useful higher-order operations on state, such as
easily serializing the state or implementing functions such as
`excursion`. <a href="https://gist.github.com/philipnilsson/f06f052fbea28a4f7e6b3cd3f8a07377"></a>,
similar to what be accomplished in principled state management
libraries such as Redux.

The `ST` Monad provides more performant state with references, at the
cost of some higher order behaviour.

Both the State and ST monads bound the lifetime of a stateful
computation, ensuring that programs remain easily reasoned about in
the general case.

Conclusion
==========

Monads can help solve certain classes of problems in a uniform
way. We've had a look at this from a syntactic perspective. Rather
than complicating language designs and grammars with additional
features, we embed these problems in a Monadic framework, resulting in
more economic notation, that, in addition to the problems mentioned
above, can be adapated to additional situations.



<div id="fn1"> [1] <em><small> Javascript promises are continuations
tracking a list of its subscribers and caching its internal async
value, which helps embed them more predictable within an imperative
host language. This can typically be omitted in a monadic
setting.</small></em> </div>
