---
title: Algebraic patterns — Category
date: 2016-11-04
path: "/algebraic-patterns-category"
---

Introduction
------------

In our previous post on
[Monoids](./2016-07-21-functional-patterns-monoid.html) we've seen how
to algebraically capture a notion of composition. In this post we'll
generalize Monoids into **Categories**.

Functions
---------

The most obvious example driving the motivation for this
generalization is *function composition*. Consider functions $parse$
and $tokenize$ that parses and tokenizes some language. Clearly it is
sensible to take the composition $parse \circ tokenize$, that first
tokenizes and then parses the language. Equally clearly it's no use
taking the composition $tokenize \circ parse$ that first parses and
*then* performs tokenization.

Monoids by necessity define composition of all available elements, so
in order to generalize we'll need to introduce some kind of
constraints on when composition of elements is defined. In the case of
functions, this notion corresponds to the idea of *types*.

Let's say that our functions have types

\begin{aligned}
tokenize & :: String  \rightarrow [Token] \\
parse    & :: [Token] \rightarrow AST
\end{aligned}

meaning $tokenize$ takes a string and produces a list of tokens, and
that $parse$ takes a list of tokens and produces and AST. The
composition $parse \circ tokenize$ is well defined since the output
type of $tokenize$ matches the input type of $parse$. The opposite,
$tokenze \circ parse$ does not have mathcing types, and so we need not
bother trying to define the meaning of this expression.

The type of the composition is of course $String \rightarrow
AST$.

We further note that function composition is associative. If we had an
additional function $assemble :: AST \rightarrow Assembly$, it is
the case that

$$
assemble \circ (parse \circ tokenize) =
(assemble \circ parse) \circ tokenize
$$

We also note that there is a special set of *identity functions* for
each type, $id :: a \rightarrow a$, with the property that for any
function $f$ of suitable type

$$ f \circ id = id \circ f = f $$

While monoids have a single identity element, a category will have an
identity function *per type*. That is, we consider the function $id
:: String \rightarrow String$ different from the function $id ::
Int \rightarrow Int$. If necessary one can write $id_{String}$ and
$id_{Int}$ to distinguish them, but usually it's obvious from context
which one is referred to.

Matrices
--------

A very similar example comes from matrices, where the "types"
correspond to matrix *dimensions*. Given matrices $M$ of dimensions $3
\times 2$, and $N$ of dimensions $2 \times 4$, the
multiplication $M \times N$ is defined and have dimensions $3 \times
4$, but the product $N \times M$ is not defined.

We note that matrix multiplication is associative, i.e. $M \times (N
\times O) = (M \times N) \times O$ for any matrices with appropriate
dimensions.

We also note that there is a special identity matrix $I$, for any
dimension $n \times n$, that satisfies

$$ I \times M = M \times I = M $$

for any matrix $M$ with suitable dimensions. Again, unlike monoids
there is no single identity matrix, but rather a different one of
each "size".

Monoid Morphisms
----------------

[Monoid morphisms](./2016-08-10-functional-patterns-monoid-morphism.html)
are also functions, and so form a category in that sense as long as
their types match, (the target and source monoid of the
morphism). However, in order to talk about the category of monoid
morphism we have one more constraint: the composition of two monoid
morphisms should itself be a monoid morphism. This turns out to be
true, and for those interested we'll verify it.

Given two monoid morphisms $h$ --- going from the monoid $(M,
\otimes_M, e_M)$ into $(N, \otimes_N, e_N)$ --- and $i$ going from
$(N, \otimes_N, e_N)$ into $(O, \otimes_O, e_O)$, we'd like to prove
first that the composition $i \circ h$ preserves identity. That is

$$ (i \circ h)(e_M) = i(h(e_M)) = i(e_N) = e_O $$

$h$ and $i$ are monoid morphisms so they each preserve identity, and
as a result so does their composition according to the calculation
above. Additionally it preserves monoid composition

\begin{aligned}
      & \quad (i \circ h)(a \otimes_M b) \\
    = & \quad i(h(a \otimes_M b)) \\
    = & \quad i(h(a) \otimes_N h(b))  \\
    = & \quad i(h(a)) \otimes_O i(h(b)) \\
    = & \quad (i \circ h)(a) \otimes_O (i \circ h)(b)
\end{aligned}

Kleisli Categories
------------------

### The Maybe category

Let's say we have a function $father :: Person \rightarrow
Person$, that gives as output the father of the person taken as input.
It'd make a lot of sense if we could use function composition
to define the following function

$$ grandfather = father \circ father $$

This does indeed work, but it doesn't really make sense that we could
implement the $father$ function as stated above. After all, we could
also define

$$  greatGrandfather = father \circ grandfather $$

...and so on. We couldn't reasonable expect to continue making such
definitions indefinitely, as at some point we'd have to run out of
information about a person's paternal lineage. It'd make more sense if
we had a function $father :: Person \rightarrow Maybe \: Person$.


By using the type $Maybe$ we mean the option type, so that such a
function may or may not return a value, in which case it returns the
value `Nothing`.

We now run into a problem however, as we can not make the definition
$grandfather$ with function composition as above, since the types
don't match up. We can however define a new composition function we'll
refer to as $\circ_?$.

We'll then define

\begin{aligned}
    father & :: Person \rightarrow Maybe \: Person \\
    grandFather & :: Person \rightarrow Maybe \: Person \\
    grandFather & = father \circ_? father
\end{aligned}

The way $\circ_?$ works is roughly to apply its first function, then
to apply its second function if a value was produced by the first,
otherwise it'll return `Nothing`. Here's a Haskell and Javascript
implementation

<pre>
f ∘<sub>?</sub> g = maybe Nothing f ∘ g
</pre>
```javascript
const none = {};
function composeMaybe(f, g) {
   return function(x) {
       const result_g = g(x);
       if (result_g !== none)
           return f(result_g.value);
       return none;
   };
}
```

### The List category

Let's say we have a simliar defintion to the above
that returns the parents of a person. We can model
this as returning a list.

$$ parents :: Person \rightarrow [Person] $$

It'd be sensible to have some notion of compostion, we'll call
it $\circ_{*}$, that lets us make the definition


$$ grandParents = parents \circ_{*} parents $$

We can easily provide such a composition function, here's one again
in Haskell and Javascript

<pre>
f ∘<sub>*</sub> g = concat ∘ map f ∘ g

function composeList(f, g) {
    return function(x) {
        return [].concat(...g(x).map(f));
    };
}
</pre>

### The Future category

Now let's say we have a genealogy API with a function $father$ that
we'd like to call in order to define the $grandFather$ function.

Again, standard function composition will not be enough, as we'll now
have to return some kind of representation of a value that'll be
available in the future.

$$ father :: Person \rightarrow Future \: Person $$

We'll need a composition operator $\circ_F$ that composes this
type of functions. We'll provide one in Javascript using Promises.

```javascript
function composeFutures(f, g) {
    return function(x) {
        return f(x).then(g);
    };
}
```

In Haskell we might use the ```Cont``` type or some other suitable
abstraction. We can now define the function that finds a Person's
grandfather by two successive API-calls with the definition


$$ grandFather = father \circ_F father $$

### Kleisli categories

Functions that compose in the way we've seen above are all examples of
Kleisli categories, and the different types, $Maybe$, $[]$ and
$Future$ are called $Monads$.

In order for these to really be examples of categories we must verify
that these new composition operators behave like regular function
composition in that they need to have identities and need to be
associative. The associativity condition is expressed as

$$
    (f \circ_? g) \circ_? h = f \circ?_ (g \circ_? h) \\
    (f \circ_* g) \circ_* h = f \circ_* (g \circ_* h) \\
    (f \circ_F g) \circ_F h = f \circ_F (g \circ_F h) \\
$$

for any functions $f$, $g$ and $h$ with the appropriate types.

We won't prove that these hold, but you can try to verify it
for each operation respectively if you're interested.

There also need to be identities $id_?$, $id_*$ and $id_F$ that
each satisfy.

\begin{aligned}
    id_? \circ_? f = f & \quad & f \circ_? id_? = f\\
    id_* \circ_* f = f & \quad & f \circ_* id_* = f\\
    id_F \circ_F f = f & \quad & f \circ_F id_F = f
\end{aligned}

for any function $f$. We'll provide examples in Haskell and Javascript.

<pre>
id<sub>?</sub> x = Just x
id<sub>*</sub> x = [x]
</pre>
```javascript
function idMaybe(x) {
    return { value: x };
}

function idList(x) {
    return [x];
}

function idPromise(x) {
    return Promise.resolve(x);
}
```

You can try verify that these functions satisfy the rules for identity
functions.

Monoids as categories
--------------------

We've had a look at the category of monoids and monoid morphisms, and
so far all our examples has involved some kind of functions, except
for matrices, but these are stand-ins for linear functions. We can
however look at regular values in a monoid as the "functions" of a
category. The trick is to assume there is only a single "type". We can
call it `()`. We can then take a monoid, let's say the monoid of
integers with addition, $(Integer, +, 0)$, and elements from that
monoid, say the integers $3$ and $12$ and say they have types

$$
    3 :: \texttt{()} \rightarrow \texttt{()} \\
    12 :: \texttt{()} \rightarrow \texttt{()}
$$

Having only a single type means composition of all elements is defined
just like in a monoid, and the composition $3 \circ 12$ is just
$3 + 12$. There will be an identity "function"

$$
    0 :: \texttt{()} \rightarrow \texttt{()}
$$

satisfying the identity laws, and clearly the composition is also
associative, so we are ok. All monoids then are categories by
"erasing" the type information by using only a single "type" `()`.

Terminology
-----------

What we have described above as functions we will call *morphisms* (or
sometimes *arrows*) and the types we'll refer to as
*objects*. (Unrelated to objects in the OOP sense). So a monoid is a
category with a single object and the elements of the monoid as
morphisms. Linear functions are categories with natural numbers as
objects and matrices as morphisms. There is a category `Hask` is the
category with Haskell functions as morphisms, and Haskell types as
objects, etc.

Composition of morphisms should be associative and *has* to be defined
whenever the types match. Also, for each object $A$ there should be an
identity morphism $id_A :: A \rightarrow A$ satsifying the
identity laws.

You can find a formal definition of categories
[here](https://en.wikiversity.org/wiki/Introduction_to_Category_Theory/Categories)
and many other places.

Partial orders
--------------

We'll finish off with another pair of examples of categories. We'll
introduce the *subtypes relation*. Let's say we have three classes
called `Person`, `Student` and `Teacher`. We'd like to express that
both `Student` and `Teacher` are subtypes of `Person`. We'll write
this as follows.

$$
    Student \leq: Person \\
    Teacher \leq: Person
$$

and we call $\leq:$ the subtype relation. We write this relation
similarly to the $\leq$ relation. This is a subteltly that indicates
that we wish to consider a class a subtype of itself. For instance

$$ Person \leq: Person $$

you can think of this as capturing the fact that both

```javascript
    (s :: Student) instanceof Person
    (p :: Person)  instanceof Person
```
will evaluate to true.

The fact that we call $\leq:$ a *partial* order means we will
allow `Studen` and `Teacher` to be *incomparable*, meaning neither is
smaller than the other.

$$
    Student \nleq: Teacher \\
    Teacher \nleq: Student
$$

We can consider this a category by letting the objects be types,
`Person`, `Student`, `Teacher` etc, and letting there be one single
morphism between types if they satisfy the subtype relation. Since
there is at most a single morphism between any two types (a type can
not be a subtype of another in more than one way), we can name the
single morphism between two types anything we like. We'll use the name
$subsume$.

$$
    subsume_{(Student, Person)} :: Student \rightarrow Person \\
    subsume_{(Teacher, Person)} :: Teacher \rightarrow Person
$$

The laws of categories say that if we have an additional type
`Professor` satisfying

$$
    Professor \leq: Teacher
$$

it must be the case that we have a morphism

$$
    subsume_{(Professor, Teacher)} :: Professor \rightarrow Teacher \\
$$

and it must compose with morphisms of appropriate type so


\begin{aligned}
subsume_{(Professor, Person)} = \\
subsume_{(Teacher, Person)} & \circ subsume_{(Professor, Teacher)} :: Professor \rightarrow Person
\end{aligned}

so this law says a `Professor` must also be a `Person`, which of
course is in alignment with what we mean by the subtype relationship.

There is also an identity morphism that says each type is a subtype of
itself.


$$ id_a = subsume_{(a, a)} :: a \rightarrow a $$

Seen as a category, composition of $subsume$ functions is obviously
associative since there is exactly one morphism between types, and so
they must be equal when defined.

In the next article we'll talk about Functors, and will use this this
category to let us talk about co- and contravariant type parameters in
classes.
