---
title: Algebraic patterns — Monoid
date: 2016-07-21
path: "/algebraic-patterns-monoid"
---

Definition
------------

The **Monoid** pattern is simply the combination of the two patterns
[Identity Element](/2016-06-29-functional-patterns-identity-element.html)
and [Semigroup](/2016-07-14-functional-patterns-semigroup.html). A
monoid therefore is a datatype with composition `⊗` and element `e`,
satisfying

```
x ⊗ e = x
e ⊗ x = x
x ⊗ (y ⊗ z) = (x ⊗ y) ⊗ z
```

Some understanding of these patterns is assumed in this article. If
you feel like you need intuition on what these equations mean, read
the entries on these individual patterns before continuing.

Intuition
---------

The monoid pattern models the many structures that are semigroups and
also have identity elements. In such situations, it is often
convenient to consider these patterns in concert in order to derive
elegant models and laws.

For instance the semigroup of lists have the empty list `[]` as
identity. Treating lists as a semigroup *only* often result in less
elegant laws where the empty list has to be treated as a separate
case.

In this article we'll give some examples of monoids and develop some
models suitable for problem solving in *Map-Reduce* style
programming models.

<h3> Notation </h3>

To refer to a particular monoid we take the triple of its type,
composition and identity. For instance `(Number, +, 0)` is the monoid
of numbers with addition.

<h3>Folds</h3>

For any monoid we can define a function called `fold`. It takes a list
of elements of that monoid to their "product". For the monoid
`(Number, +, 0)`, we define `fold` (by example) as

```
fold([]) = 0
fold([1]) = 1
fold([5, 6, 3, 1])
  = 5 + 6 + 3 + 1
  = 15
```

The `fold` function simply inserts the monoid composition (in our case
`+`) between each element. For the empty list it returns the identity
element (`0`). The `fold` for the monoid `(Number, +, 0)` then is
just the `sum` function.

<hr>

Let's repeat the construction above with a different monoid,
`(Number, max, -∞)`. In this case we get

```
fold([]) = -Infinity
fold([10]) = 10
fold([9, 6, 5, 12])
  = 9 max 6 max 5 max 12
  = 12
```

so the `fold` for this monoid is the `maximum` function which finds
the largest element in a list, and returns its identity `-∞` for the
empty list.

<hr>

For the boolean monoid `(Bool, &&)` `fold` is the `every` function

```
fold([true, false, true])
  = true && false && true
  = false
fold([]) = true
```

which checks if all elements in a list are true.

and for `(Bool, ||)` we get the `some` function

```
fold([true, false, true])
  = true || false || true
  = true
fold([]) = false
```

which checks if some element is true.

<hr>

Another two interesting examples of folds are the `head` and `last`
functions that find the first and last element of a list
respectively. These arise out of the semigroup operations `⨮` and `⨭`
defined as.

```
x ⨭ y = x
x ⨮ y = y
```

which simply discard one of their arguments.

`head` then is the function

```
fold([x, y, z])
  = x ⨭ y ⨭ z
  = x
```

and `last` is the function

```
fold([x, y, z])
  = x ⨮ y ⨮ z
  = z
```

Unfortunately we can not give meaning to the expression
`fold([])`. This is because `⨮` and `⨭` define semigroups that are not
monoids, so these functions err on the empty list. This illustrates
the problem of working with semigroups only, when our domain of study
are lists.

<h3> Algebra for parallelism </h3>

The relation of `folds` to the map-reduce programming model and
parallel computation in general can be captured in the fact that they
satisfy the following *distributive law*.

```
fold(xs ++ ys) = fold(xs) ⊗ fold(ys)
```

For a list that is the concatenation of lists `xs` and `ys`,
`fold(xs)` and `fold(ys)` could be computed on different machines, or
CPU cores, so such a law is a suitable condition for when a problem
can be solved in a distributed or parallel way. At the end the two
partial solutions are re-combined using the monoid composition `⊗`,
and this law then states that this behaves *"as if the problem was
solved sequentially"*, by folding the entire list in sequence.

Since `sum` and `maximum` are both folds, they can be computed in
parallel. The distributive law is these cases become

```
sum([1, 2, 3, 4, 5, 6])
  = sum([1, 2, 3] ++ [4, 5, 6])
  = sum([1, 2, 3]) + sum([4, 5, 6])

maximum([9, 6, 5, 12])
  = maximum([9, 6] ++ [5, 12])
  = maximum([9, 6]) `max` maximum([5, 12])
```

Of course, such a law can be repeatedly applied

```
sum([1, 2, 3, 4, 5, 6]) =
sum([1, 2]) + sum([3, 4, 5, 6]) =
sum([1, 2]) + sum([3, 4]) + sum([5, 6])
```

to distribute such a problem to any number of machines or cores.

Note that the requirement for an identity element arises
naturally out of such a law:

```
fold(xs) = fold(xs ++ []) = fold(xs) ++ fold([])
fold(xs) = fold([] ++ xs) = fold([]) = fold(xs)
```

the value `fold([])` must be such that it is an identity element for
the range of `fold`, providing further evidence that the concept of a
monoid is a natural extension of that of a semigroup when dealing with
possibly empty lists.

The distributive law above is the fundamental property exploited in
the map-reduce model, but `fold`s do *not* cover all functions that can
be solved in this way. To provide a better classification we generalize.

Monoid morphisms
----------------

To define the concept of a monoid morphism, we pair the distributive
law mentioned above with `fold`s behaviour on the empty list, which by
defintion returns the empty element of the target monoid.

```
fold([]) = e
fold(xs ++ ys) = fold(xs) ⊗ fold(ys)
```

We say that `fold`s *respects monoid structure*, because they map the
identity element of lists (`[]`) to identity elements in their
domains(`e`), and they map monoid compositions (`++`) to
compositions in the target monoid (`⊗`).

A function that respects monoid structure is called a **monoid
morphism**. Folds then, are monoid morphisms *from* the list monoid to
another.

In general, monoid morphisms need not be from the list monoid. In general
`h` is a monoid morphism if it satisfies

```
h(e) = f
h(a ⊕ b) = h(a) ⊗ h(b)
```

for some source monoid `(M, e, ⊕)` to a target monoid `(N, f, ⊗)`.

<hr>

As we have seen `sum` is a fold and thus a monoid morphism, in this
case targetting the monoid of numbers with addition. Another morphism
with the same target monoid is `length`. It is a monoid morphism as it
also respects monoid structure.

```
length([]) = 0
length(xs ++ ys) = length(xs) + length(ys)
```

Length is of course also another example of a function that is
computable in parallel (albeit not a very interesting one). It is not
a `fold` however, and doesn't even "type-check" as such.

<hr>

For some list, e.g. `[4, 6, 1]`, we can apply the
distributive laws for `sum` and `length` over and over until we
get to single-element lists.

```
sum([4, 6, 1]) = sum([4]) + sum([6]) + sum([1])
length([4, 6, 1]) = length([4]) + length([6]) + length([1])
```

We can always make an argument of this type. It must then be the case
that the difference between `sum` and `length` is only really in how
they behave on single-element lists.

```
sum([x]) = x
length([x]) = 1
```

As there is nothing special about `sum` or `length` we can
generalize:

**Theorem** A monoid morphism from lists is determined uniquely by
its target monoid and its behaviour on single-element lists.

<hr>

A monoid morphism that both starts and ends in the list monoid, is
`map(f)`, the higher-order function that maps a function `f` over
each element of a list.

```
map(f)([]) = []
map(f)(xs ++ ys) = map(f)(xs) ++ map(f)(ys)
```

`map(f)` is thus another parallelizable function, that also happen to
be a monoid morphism. By our previous discussion, it also possible to
define `map(f)` as the unique monoid morphism from lists to lists
satisfying

```
map(f)([x]) = [f(x)]
```

Since any possible behaviour on single element lists can be
expressed by some function `f`, we see that.

**Theorem** Any monoid morphism from lists can be written on the
form

```
fold ∘ map(f)
```

for some function `f`, clearly providing some validity to *Map-Reduce*
as a computational model --- it covers completely the set of functions
"naturally" parallelizable through the distributive law defining
monoid morphisms.

<hr>

There is a way to extend *any* semigroup `(S, ⊗)` into a monoid. We
simply add to its underlying type another value, that we'll call
`None`. It's composition will be the same as `⊗`, except for if either
side is `None`, in which case we'll make `None` an identity by defintion.

```
None ⊗₊ x = x
x ⊗₊ None = x
x ⊗₊ y = x ⊗ y  // otherwise
```

This construction is simply the `Option` or `Maybe` type, along with a
suitably defined monoid structure.

Now we can define `safeHead` and `safeLast` as the folds of `⨭₊` and
`⨮₊`. For instance `safeHead` is the fold

```
fold([]) = None
fold([1, 2, 3])
  = 1 ⨭₊ 2 ⨭₊ 3
  = 1
```

Creating "safe" functions on lists can be seen as correcting a
mismatch in structure between lists (that are monoids), and semigroups
(that are not).

The fact that we chose `maximum([]) = -Infinity` is a
similar correction, in fact it is of exactly the same form, except we
named `None` as `-Infinity`.

<hr>

Functions and maps are monoids if their domain is a monoid, where
composition is performed pointwise.

```
function composeFunctions(f,g) {
    return x => f(x) ⊗ g(x);
}
```

we call this the pointwise lifting of the monoid over the range.

Frequency maps are an example of this construction, they are the pointwise
lifted additive monoid on numbers `(Number, + 0)`.

**Exercise** Consider the semigroup of the set `{ LESS, GREATER }` with
composition `⨮`. Define the monoid of comparators starting with this
semigroup, and using the `Option` and pointwise lifting constructions.

**Exercise** Counting the votes in an election is a good real-word
example of a parallelizable problem. Define a monoid morphism from a
list of votes to some monoid giving the election results. Define the target
monoid as the pointwise lift of another monoid.

**Exercise** Show that the fundamental theorem of arithmetic induces a
monoid morphism from `(Number, *, 1)` to the monoid `(Number, +, 0)`
lifted pointwise over the prime numbers.
