---
title: Algebraic patterns - Semigroup
---

Introduction
------------

A common task in programming is *summarizing* a large dataset into a
an aggregate result. The **Semigroup** pattern is useful for
modelling such situations.

Let's say we have collected some data about the names and ages of our
users. We'll store these datasets in lists.

```
const names = [ "andrew", "bob", "claire", "david", "eve"]
const ages = [ 18, 21, 48, 29, 62 ];
```

Consider a few ways to summarize such data

 * The sum of the age of all users
 * The age of the oldest user.
 * A comma-separated string containing the names of all users.

Such summaries can be computed using the `reduce` function.

```javascript
const reduce = f => arr => arr.reduce(f);
```

Our examples:

```javascript
const sumAges =
  reduce((ageSum, age) => ageSum + age);

sumAges([ 18, 21, 48, 29, 62 ]);
> 178

const oldestAge =
  reduce((oldestAge, age) => Math.max(oldestAge, age));

oldestAge([ 18, 21, 48, 29, 62 ]);
> 62
```

<hr>

We now ask ourselves how to formally define the concept of a
"summary." A reasonable and practically useful condition is to require
that such a summary can be computed in a *distributed* way.

We can split the dataset by writing it as the concatenation of two
parts. This can be done in different ways, some depicted below.

```javascript
[ 18, 21, 48, 29, 62 ]
= [ 18, 21, 48 ] ++ [ 29, 62 ]
= [ 18, 21 ] ++ [ 48, 29, 62 ]
= [ 18 ] ++ [ 21, 48, 29, 62 ]
```

*(We write* `++` *for list concatenation as to not confuse it with
addition of numbers.)*

Now, let's say our data set is actually split over two computers, `A`
and `B`, where we give `A` the first half of such a split, and `B` the
second.

```
TODO: Illustration
      A                  B
[ 18, 21, 48 ]       [ 29, 62 ]
```

We can ask `A` to compute the oldest user for its data set, resulting
in `48`. `B` will answer with `62`. The final and correct answer can
then be found by taking `max(48, 62) = 62`.

Of course, it would be nice if this approach worked regardless of how
we split the data between `A` and `B`. Let's say the data was split
between computers as below.

```
TODO: Illustration
    A                  B
[ 18, 21 ]       [ 48, 29, 62 ]
```

Now if We ask `A` it will respond with `21`, and again `B` with `62`.
Now `max(21, 62) = 62`, so we get the same answer in this scenario.

If our calculation is such that the patricular split is not important
for the final result we say that it is *well-defined*. Intuitively we
believe this approach works for any way to split the
data. Algebraically we say the following is true

```
max(oldestAge([ 18, 21 ]), oldestAge([ 48, 29, 62 ]))
= max(oldestAge([ 18, 21, 48 ]), oldestAge([ 29, 62 ]))
```

or more elegantly and generally

```
oldestAge(ls ++ rs) = max(oldestAge(ls), oldestAge(rs))
```

Can we prove this is true? In general, under what conditions is such a
statement true?

<hr>

To answer this question, let's see what this means if our dataset is
an arbitrary list of length 3. We'll name its elements `x`, `y` and
`z`, so it will look like `[x, y, z]`. We can split this list between
`A` and `B` in two different ways *(without giving the full set of
data to a single computer)*.

```
[x, y, z]
    = [x] ++ [y, z] // Split 1
    = [x, y] ++ [z] // Split 2
```

**Case 1** The answer from computer `A` will `x`, and `B` will answer
with whatever age in its dataset is the largest, which is `max(y,
z)`. The age of the oldest user in both sets will be the largest of
the answers, so `max(x, max(y, z))`.

**Case 2** --- From `A` we will get `max(x, y)`, and from `B` it will
be `z`, and the answer will be `max(max(x, y), z)`.

We can see that for our computation to be well-defined, it must be the
case that these two results coincide. That is

```
max(x, max(y, z)) = max(max(x, y), z)
```

This property is known as *associativity*.

The `max` function does indeed have this property, and so it will
always compute the right answer for any list of length 3. Now the
interesting thing is that this **necessary** condition is also
**sufficient** for a list of *any* length.

If a function is associative we can split a list of any length between
two computers, summarize each part individually and combine the
answers, and we will always get the same answer. Formally we state that

```
reduce(max)(xs ++ ys) = max(reduce(max)(xs), reduce(max)(ys))
```

Suitably, such a property is called a distributive property.

Now, we can return to our example. We can write our dataset in two ways.

```
[ 18, 21, 48, 29, 62 ]
  = [ 18, 21 ] ++ [ 48, 29, 62 ] // A
  = [ 18, 21, 48] ++ [ 29, 62 ]  // B
```

**Exercise** Formally or informally, prove or argue for the truth of
this identity. A proof can be carried out using induction.

It turns out, it is possible to say even more. For an associative
operation we can distribute our computation not only over two
computers but *any* split over *any* number of computers, and we will
always compute the same result.

**Exercise** Formally state this property, and use the result of the
previous exercise and prove or argue that it is true.

<hr>

What about the computation of the *sum* of all ages? Addition is
associative, so this computation can also be distributed.

```
x + (y + z) = (x + y) + z
```

<hr>

**Exercise** Prove or convince yourself that the third operation
mentioned, i.e.  <br>`((list, name) => list + ',' + name)` is
associative.

Definition
==========

A datatype is a semigroup if has an operator `⊕` that is
*associative*, meaning it satisfies

```javascript
 (x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)
```
