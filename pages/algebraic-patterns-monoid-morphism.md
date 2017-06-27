---
title: Algebraic patterns — Monoid morphisms
date: 2016-08-10
path: "/algebraic-patterns-monoid-morphism"
---

<div style="display: none">
\[
\newcommand\emptyList{\texttt{[]}}
\newcommand\doubleplus{\kern0.8ex\texttt{++}\kern0.8ex}
\newcommand\composition{\kern0.8ex\texttt{<>}\kern0.8ex}
\newcommand\doubleplusop{\kern0.8ex\texttt{++}_{op}\kern0.8ex}
\]
</div>

Introduction
------------

In this instalment we'll take a further look at **Monoid morphisms** to
try to cement our understanding of this concept. We've used monoids to
understand parallelism in the Map-Reduce style programming
model. We'll continue by looking at applications in the related notion
of *Divide & Conquer* style problem solving.

To reiterate, monoid morphisms are structure-preserving maps between
[monoids](./2016-07-21-functional-patterns-monoid.html). That is for
two monoids $(M, \oplus, e)$ and $(N, \otimes, f)$ a monoid morphism $h$
is a function satisfying

$$
\begin{aligned}
h(e) & = f\\
h(a \oplus b) & = h(a) \otimes h(b)
\end{aligned}
$$

so a monoid morphism preserves identity and composition.

Divide & Conquer
----------------

Below we will solve at a set of
[Divide & Conquer](https://en.wikipedia.org/wiki/Divide_and_conquer)
type problems and show that monoid morphisms often capture the
divide and conquer steps.

Wishing to calculate the result of applying a function $h$, we start
by "dividing" it's argument by writing it as a composition in terms of
$\oplus$.

$$ h(a \oplus b) $$

and by using the monoid morphism law, we rewrite in terms of $\otimes$

$$ h(a) \otimes h(b) $$

which captures the "conquering" --- a re-composition step that
recombines solved subproblems $h(a)$ and $h(b)$ into a full solution.

Sorting
----

There is the ordinary monoid of lists, but there is a also different
monoid of *sorted* lists. The monoid of sorted lists does not have the
usual concatenation $\doubleplus$ as it's composition, as it does not
"maintain sortedness", i.e. $xs \doubleplus ys$ need not be sorted just because
$xs$ and $ys$ are.

Instead we'll use as composition the operation $\texttt{merge}$ which
we'll denote with $\odot$. It is clearly associative, and has the
empty list as its identity.

The function $sort$ is a monoid morphism from ordinary lists to
the monoid of sorted lists


\begin{aligned}
sort(\emptyList) & = \emptyList\\
sort(xs \doubleplus ys) & = sort(xs) \odot sort(ys)
\end{aligned}

If $sort$ is an $n^2$ time sort, such as insertion-sort or bubble-sort,
this monoid morphism encodes an optimization step. Since merging can
be done in linear time, and the decomposition $xs \doubleplus ys$ can be chosen
to halve the length of the composite list, we can go from $n^2$ to
$(2(\frac{n}{2})^2 + n)$ time, which is a significant performance improvement.

By repeatedly applying this monoid morphism we derive the merge-sort
algorithm.

Exponentiation
---------

The function $exp$ is a monoid morphism from the monoid of numbers
with addition to the monoid of numbers with multiplication. The
meaning of this statement is that $exp$ should satisfy

$$
exp(0) = 1\\
exp(b + c) = exp(b) * exp(c)
$$

which we know to be true, since

$$
exp(a + b) = e^{a + b} = e^a e^b = exp(a) * exp(b)
$$

This argument would work for any exponentiation function, not just
with $e$ as a base, so there is a monoid morphism of this form for
any number $a$, namely the function $x \mapsto a^x$.

$$
a^0 = 1\\
a^{b + c} = a^b * a^c
$$

We can take advantage of this identity if we'd like to calculate an
exponential where the exponent is an even whole number.

$$ a^{2n} = a^{n} * a^{n} $$

Assuming we're calculating this exponent in the naive way of
performing $2n$ multiplications, this rule describes an optimization
step, resulting instead in $n + 1$ multiplications, as we need only
calculate $a^n$ a single time.

A similar optimization can be performed for an odd whole number,
leading to an [algorithm using $log_2(n)$ multiplications](https://en.wikipedia.org/wiki/Exponentiation_by_squaring).

Counting zeroes
---------------

In interview question I came across ask one to find the number of
trailing zeroes in a large factorial, let's say $100!$, without
calculating this actual value, as it is very large.

Again, this problem can be solved through a divide & conquer style
of problem solving using monoid morphisms.

There is a monoid morphism from numbers with multiplication, to the
[pointwise lifted](./2016-07-21-functional-patterns-monoid.html)
monoid of numbers with addition.

The fact that such a morphism exists is known as the Fundamental
Theorem of Arithmetic, that is, we can map a number to its prime
factorization.

$$
primes(1) = \emptyset\\
primes(a * b) = primes(a) \cup_+ primes(b)
$$

Here $\cup_+$ denotes pointwise addition in the set of prime
frequencies.

By applying this monoid morphism, we can find the prime factorization of
$100!$.


\begin{aligned}
& primes(100!) \\
= \enspace & primes(100 * 99!) \\
= \enspace & primes(100) \cup_+ primes(99!) \\
= \enspace & primes(100) \cup_+ primes(99) \cup_+ \ldots \cup_+ primes(2)
\end{aligned}


From this result it is easy to find the number of zeroes in $100!$. We
simply take the min prime frequency for numbers 2 and 5. Since finding
the prime factorizations up to $100$ is quickly done, this again
describes an optimization.

One might note that we can in fact solve this problem even faster, by
simply counting the prime frequencies for 2 and 5 *only*. In order to
formulate this simplification in the language of monoid morphisms we
would need to introduce equivalence classes, and their interactions
with monoid structure, which we will not do or explain here.

Instead we note that any partitioning of a set over an equvalence
relation induces a monoid morphism to the set of partitions as long as
the composition respects the equivalence and challenge the interested
reader to find out more.

De Morgan's Laws
-------------

$$
\newcommand\andand{\kern0.8ex\texttt{&&}\kern0.8ex}
\newcommand\oror{\kern0.8ex\texttt{||}\kern0.8ex}
$$

The negation function $\texttt{!}$ which negates a boolean proposition is a monoid
morphism from $(Bool, \texttt{&&}, \texttt{true})$ to $(Bool,
\texttt{||}, \texttt{false})$.

\begin{aligned}
\texttt{!}\texttt{true} =& \enspace \texttt{false}\\
\texttt{!}(a \andand b) =& \enspace !a \oror !b
\end{aligned}

It is also a monoid morphism going the other way, from $(Bool,
\texttt{||}, \texttt{false})$ to $(Bool, \texttt{&&}, \texttt{true})$

\begin{aligned}
\texttt{!}\texttt{false} =& \enspace \texttt{true}\\
\texttt{!}(a \oror b) =& \enspace !a \andand !b
\end{aligned}

The fact that $\texttt{!}$ is a monoid morphism in these ways is known
as De Morgan's laws.

Stable sorts
------------

Stable sorting functions are monoid morphisms from the monoid of
comparators to the monoid of functions with function-composition. Let $sort_c$
be the sorting function that sorts by comparator $c$.

Let $\varepsilon$ be the identity-comparator, that compares all elements
as equal, and $\diamond$ be
[comparator-composition](./2016-07-21-functional-patterns-monoid.html). Then
a stable sort satisfies

$$
sort_\varepsilon = id \\
sort_{c \thinspace \diamond \thinspace d} = sort_c \circ sort_d
$$

this encodes the observation that for a stable sort we can fuse two
sorts by different comparators $c$ and $d$ into a single sorting pass
that compares first by $c$ and then by $d$.

The opposite monoid
-------------------

A weird but interesting construction on monoids is the opposite
monoid. It is constructed from a given monoid by taking

$$
x \otimes_{op} y = y \otimes x
$$

so this monoid is the same except the order of arguments is the
reverse of the target monoid. The identity element stays the same.

<hr>

The function $reverse$ is an example of a monoid morphism. It goes
from the monoid of lists to the opposite monoid of lists --- this
means it will satisfy the monoid morphism laws

\begin{equation}
reverse(\emptyList) = \emptyList\\
\begin{aligned}
& reverse(xs \doubleplus ys)\\
= \enspace & reverse(ys) \doubleplus reverse(xs)\\
= \enspace & reverse(xs) \doubleplusop reverse(ys)
\end{aligned}
\end{equation}

It it helps, here's an example with concrete values

\begin{aligned}
reverse(\texttt{[1, 2, 3, 4, 5]}) & =\\
reverse(\texttt{[1, 2, 3] ++ [4, 5]}) & = \\
reverse(\texttt{[4, 5]}) \doubleplus reverse(\texttt{[1, 2, 3]}) & =\\
reverse(\texttt{[1, 2, 3]}) \doubleplusop reverse(\texttt{[4, 5]}) &= \\
\texttt{[5, 4] ++ [3, 2, 1]}
\end{aligned}

Word reversals
-------------------

A common interview-question consists of reversing the order of words
in a string without using any extra memory, a so-called in place
algorithm.

$$
reverseWords(\texttt{"one two three"}) = \texttt{"three two one"}
$$

Since the function $reverse$ is easily written as an in-place
algorithm, it is possible to solve this problem by expressing a
solution as some number of substring reversals on the input string.

We can construct such an expression by starting with the solution and
working backwards until the character appears in their original
order. We'll make use of the monoid morphism laws.

\begin{aligned}
& reverseWords(\texttt{"one two three"})\\
= \enspace & \texttt{"three two one"}\\
= \enspace & reverse(reverse(\texttt{"three two one"}))\\
= \enspace & reverse(reverse(\texttt{"three" ++ " two " ++ " one"}))\\
= \enspace & reverse(reverse(\texttt{"three"}) \doubleplusop reverse(\texttt{" two "}) \doubleplusop reverse(\texttt{"one"}))\\
= \enspace & reverse(reverse(\texttt{"one"}) \doubleplus reverse(\texttt{" two "}) \doubleplus reverse(\texttt{"three"}))\\
\end{aligned}

So an in-place algorithm for word-reversal can be found by reversing
each individual word in a string, then reversing the entire string.

String cycling
---------------

A related problem to the above is the problem of cycling strings.


$$ cycle_2(\texttt{"abcdef"}) = \texttt{"cdefab"} $$

that is, $cycle_n$ will "rotate" $n$ characters from the front of the
string to the end.

This problem too can be made into a tricky interview question by
asking to perform it in-place, but we can conquer such difficulties
in a similar way to the above.

\begin{aligned}
& cycle_3(\texttt{"abcdefgh"})\\
= \enspace & \texttt{"defghabc"}\\
= \enspace & reverse(reverse(\texttt{"defghabc"}))\\
= \enspace & reverse(reverse(\texttt{"defgh" ++ "abc"}))\\
= \enspace & reverse(reverse(\texttt{"defgh"}) \doubleplusop reverse(\texttt{"abc"}))\\
= \enspace & reverse(reverse(\texttt{"abc"}) \doubleplus reverse(\texttt{"defgh"}))\\
\end{aligned}

and so cycling a list in place by $n$ places can be achieved by
reversing the first $n$ elements, then the rest of the list, and finally
reversing the entire list again.
