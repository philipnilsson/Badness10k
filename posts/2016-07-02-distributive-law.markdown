---
title: Algebraic patterns - <br> Distributive Law
---

Introduction
------------

The pattern of **Distributive Law** describes conditions for
coherently decomposing a problem into subproblems, and recomposing
their partial solutions into a full one, for instance in a divide and
conquer style.

A distributive law familiar to most is the identity on numbers

```javascript
a * (b + c) = (a * b) + (a * c)
```
<figcaption>Equation 1</figcaption>

To recognize that this equation is of a "divide and conquer" form,
it's important to have some intuition as to why this law is true. This
is most easily done through a geometric argument.

``` ::: IMG: areas of rectangle :::```

Intuitively the area of the larger rectangle above can be found in two
ways --- by taking its side and multiplying by its height,
`(a + b) * c`, or by splitting the problem in two parts, summing the
areas of the two smaller rectangles, `a * b + a * c`.

<hr>

We can extend the approach above to approximate the area under a given
curve by splitting this area into small rectangle segments, and taking
the [riemann sum](https://en.wikipedia.org/wiki/Riemann_sum) of their
areas.

``` ::: IMG: curve areas :::```

The mathematical method of *integration* takes the limit of this sum
resulting in an expression involving the anti-derivate. Integration
thus belongs in the divide and conquer school of problem solving, in
fact involving infinitely many "divisions".

<hr>

Computer science's most well known divide and conquer algorithm is
likely merge-sort, which is based on the following equivalence.

```javascript
sort(concat(ls, rs)) = merge(sort(ls), sort(rs))
```
<figcaption>Equation 2</figcaption>

Again, we start by splitting the problem in two, writing a list as the
concatenation of its first and second halves `ls` and `rs`. These
lists are then individually sorted, and recomposed by the `merge`
operation.

This reveals the full generality of a distributive law. We say that
`sort` distributes over `concat` into `merge`, where we are allowed to
change the method of recomposition as we distribute into subproblems.

In fact you can argue that even in our example of applying the
distributive law on numbers, factoring out the multiplication changes
the addition --- from addition on lengths, into addition on areas.

**Exercise:** If you have a hard time seeing that the equations *1*
and *2* above are of the same form, rewrite them changing operators to
functions or functions to operators.

Additional Examples
-------------------

Boolean operators `&&` and `||` distribute over their dual.

```javascript
a && (b || c) = (a && b) || (a && c)
```

```javascript
a || (b && c) = (a || b) && (a || c)
```

<hr>

The `max` operator distributes over `min`, and vice versa

```javascript
max(a, min b c) = min (max a b, max a c)
```
```javascript
min(a, max b c) = max (min a b, min a c)
```

<hr>

The functional programming combinator `map` distributes over function
composition `∘`.

```javascript
map (f ∘ g) = map f ∘ map g
```

That is, mapping a list first with function `f`, and the with function `g`, is the same
as mapping in a single pass with the composed function `f ∘ g`.

This distributive law is one of the two Functor laws, the other
one being
`map id = id`.

<hr>

We can define the composition of comparators `<>`, such that `c <> d`
compares by comparator `c`, then by `d` if `c` compares to
equals. That is, the comparator `compareLastName <> compareFirstName`
compares by last name, then by first name.

**Exercise** Prove that comparators form a monoid.

A *stable* sorting algorithm will satisify the distributive
law

```javascript
sortBy (f <> g) = sortBy f ∘ sortBy g
```


Definition
----------

Applications
------------

Making practical use of a distributive law in software engineering can
be used to guide the design of an API, making it easier for its users
to split problems into smaller composable subproblems.

As a case study, we take the reactive programming libraries `Bacon.js`
and `Rx.js` providing event-stream abstractions to javascript.

Both libraries provide a combinator `sample` differing slightly in
behaviour. This difference is illustrated in the below *marge
diagrams*.

``` ALKJDLKSAJDLKSADJ ```

Is it possible to make a formal argument for one implementation over
the other?  One way to do so that comes out in favor of `Bacon.js` is
to argue that sampling should satisfy the following distributive law.

```javascript
sample(a, merge(b, c)) = merge(sample(a, b), sample(a, c))
```

It is natural to assume that sampling a stream by the `merge` of two
streams should be equal to sampling that stream individually by both
streams and merging their results. Satisfying this rule is likely to
result in an easier time for users to reliably decompose problems
involving streams into smaller constituent parts.

Is is possible other formal arguments can be made in favour of the
`Rx.js`'s default behaviour. (The author of this article is a
contributor to `Bacon.js`).
