---
title: Escaping from hell with Monads
---

        <style>
         body > div {
             width: 30em;
         }

         input[type=radio] {
             display: none;
         }

         input:checked + label {
             background: red;
         }

         label {
             cursor: pointer;
             user-select: none;
             max-width: 40%;
             min-width: 40%;
             display: inline-block;
             background: lightgray;
             margin: .3em;
             margin-left: 0;
             padding: .6em;
         }
         .circle {
             display: none;
         }
         .radio-circle:checked:nth-of-type(1) ~ .circle:nth-of-type(1),
         .radio-circle:checked:nth-of-type(2) ~ .circle:nth-of-type(2),
         .radio-circle:checked:nth-of-type(3) ~ .circle:nth-of-type(3),
         .radio-circle:checked:nth-of-type(4) ~ .circle:nth-of-type(4) {
             display: block;
         }
        </style>

<div>
            <h1>Escaping hell with Monads</h1>

            <p>
                As programmers we occasionally find ourselves in
                Programmer's Hell, where our regular abstractions fail
                to satisfactory solve recurrently faced problems.
            </p>

            <p>
                Ad hoc solutions to these problems are often presented
                at the language level. This post documents how Monads
                can solve some of these problems in a principled way.
                Call you language implementor and ask for do-notation today!
            </p>

            <p>
                Select your Circle of Programmer Inferno below and
                learn how to code your way out with Monads.
            </p>

            <input class="radio-circle" type="radio" name="a" id="a0">
            <label for="a0">Null-checking Hell</label>
            <input class="radio-circle" type="radio" name="a" id="a1">
            <label for="a1">For-loop Hell</label>
            <input class="radio-circle" type="radio" name="a" id="a2">
            <label for="a2">Callback Hell</label>
            <input class="radio-circle" type="radio" name="a" id="a3">
            <label for="a3">State-passing Hell</label>

            <div class="circle">
                <div class="examples">

                    <div class="example">
                        <h2>Null-checking Hell</h2>
                        <p>
                            Partial functions lead to deeply
                            nested and hard to read code with
                            excessive syntactic clutter.
                        </p>
                        <pre><code>var a = getData();
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
}</code></pre>
                    </div>
                    <div class="example">
                        <h3>Ad hoc solution: Elvis operators</h3>
                        <pre class="ad-hoc"><code>var a = getData();
var b = a?.getMoreData();
var c = b?.getMoreData();
var d = c?.getEvenMoreData(a)
print(d)</code></pre>
                        <p>Elvis operators introduce specialized
                            syntax for partial navigation, needlessly
                            complecting the solution with OO-style
                            record/method access.
                        </p>
                    </div>
                    <div class="example">
                        <h3>Maybe Monad</h3>
                        <pre class="principled"><code>do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d</code></pre>
                        <p>The Maybe Monad solves the same problem
                            requiring no specialized notation beyond
                            <code>do</code>-notation and is not limited to record
                            access.
                        </p>
                    </div>
                </div>
            </div>

            <div class="circle">
                <div class="examples">
                    <div class="example">
                        <h2>For-loop Hell</h2>
                        <p>
                            Iteration through
                            dependent data sets lead to deeply nested
                            and hard to read code with excessive
                            syntactic clutter.
                        </p>
                        <pre><code>var a = getData();
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
}</code></pre>
                    </div>
                    <div class="example">
                        <h3>Ad hoc solution: List comprehensions</h3>

                        <pre class="ad-hoc"><code>[
  print(d)
  for a in getData()
  for b in getMoreData(a)
  for c in getMoreData(b)
  for d in getEvenMoreData(a, c)
]</code></pre>
                        <p>
                            Specialized syntax for list-comprehensions
                            is needlessly introduced.
                        </p>
                    </div>
                    <div class="example">
                        <h3>List Monad</h3>
                        <pre class="principled"><code>do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d</code></pre>
                        <p>
                            Regular lists with their Monad instance provides
                            the same functionality using <code>do</code>-notation.
                        </p>
                        <p>
                            Filtering (using <code>if</code>) is easily added by using
                            the <code>guard</code> function.
                        </p>
                    </div>
                </div>
            </div>

            <div class="circle">
                <div class="examples">
                    <div class="example">
                        <h2>Callback Hell</h2>
                        <p>Inversion of control needed to implement
                            asynchronous control leads to deeply
                            nested code and excessive syntactic cluttter.
                        </p>
                        <pre><code>getData(a =>
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
)</code></pre>
                    </div>
                    <div class="example">
                        <h3>Ad hoc solution: Async/await </h2>

                        <pre class="ad-hoc"><code>async function() {
  var a = await getData
  var b = await getMoreData(a)
  var c = await getMoreData(b)
  var d = await getEvenMoreData(a, c)
  print(d)
}</code></pre>
                        <p>
                            Needlessly indroduces specialized
                            syntax. Error handling is delegated to
                            verbose <code>try/catch</code> blocks.
                        </p>
                    </div>

                    <div class="example">
                        <h3>Ad hoc solution: Promises</h3>
                        <p>
                            Promises are examples of Monads, but
                            tend to have a needlessly complex
                            implementation due to caching, odd choices
                            in API (mixing <code>bind</code> and <code>map</code>
                            into <code>then</code>)

                    </div>
                    <div class="example">
                        <h3>Continuation Monad</h3>
                        <pre class="principled"><code>do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print d
                        </code></pre>
                        <p>
                            Continuations are simplified promises (no
                            internal cacheing) and with their
                            corresponding Monad instance solve the
                            same problem using <code>do</code>-notation.
                        </p>
                        <p>
                            Cacheing can be added if needed, and the <code>MaybeT</code> transformer
                            adds error handling as needed.
                        </p>
                    </div>
                </div>
            </div>

            <div class="circle">
                <div class="examples">
                    <div class="example">
                        <h2>State-passing Hell</h2>
                        <p>
                            A purely functional style leads to
                            excessive parameter passing of parameters
                            are clearly just chained through each
                            call.
                        </p>
                        <pre><code>let
  (a, st1) = getData initalState
  (b, st2) = getMoreData (a, st1)
  (c, st3) = getMoreData (b, st2)
  (d, st4) = getEvenMoreData (a, c, st3)
in print(d)
                        </code></pre>
                    </div>
                    <div class="example">
                        <h3>Ad hoc solution: Imperative language </h3>
                        <pre class="ad-hoc"><code>a = getData();
b = getMoreData(a);
c = getMoreData(b);
d = getEvenMoreData(a, c);
print(d)</code></pre>
                        <p>
                            Use an imperative language making state
                            implicit everywhere. The size and lifetime
                            of the state is unconstrained.
                        </p>
                    </div>
                    <div class="example">
                        <h3>State Monad</h3>
                        <pre class="principled"><code>do
  a <- getData
  b <- getMoreData a
  c <- getMoreData b
  d <- getEvenMoreData a c
  print(d)
                        </code></pre>
                        <p>
                            The State Monad provides purely functional
                            state without references, allowing for many useful
                            higher-order operations on state.
                        </p>

                        <p> The <code>ST</code> Monad provides more
                            performant state with references, at the
                            cost of higher order behaviour that
                            abstracts over the state such as
                            <code>excursion</code>. <a href="https://gist.github.com/philipnilsson/f06f052fbea28a4f7e6b3cd3f8a07377">(Gist)</a>.
                        </p>

                        <p>
                            Both the State and ST monads bound the
                            lifetime of a stateful computation,
                            ensuring that programs remain easily
                            reasoned about in the general case.
                        </p>
                    </div>
                </div>
            </div>
        </div>