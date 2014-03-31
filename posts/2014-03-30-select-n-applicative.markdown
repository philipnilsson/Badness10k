---
title:  On applicative functors and the n+1 selects problem
---

I recently read a post by [ocharles](http://ocharles.org.uk/blog/posts/2014-03-24-queries-in-loops-without-a-care-in-the-world.html) where he creates a Haskell DSL that
allows writing queries on the form

```haskell
do entities <- getAllEntities
   expandedEntities <- for entities $ \entity -> do
     entityType  <- getEntityTypeById (entityTypeId entity)
     entityOwner <- getEntityOwnerById (entityOwnerId entity)
     return $ ExpandedEntity entity entityType entityOwner

   doSomething expandedEntities
```

in such a way that lets us create a single query for running e\.g\. on a
database. Even though the functions `getEntityTypeById` and
`getEntityOwnerById` are queries themselves, we\'d like to reuse the
data from the `getAllEntities` query.


If the semantics of this monad was just something like IO, we\'d end up
querying multiple times, meaning we\'d end up with an instance of the
n+1 selects problem.

To solve this problem ocharles presents a somewhat complicated
solution using the `MVar` concurrency primitvies and end with a
challenge to find a more \"haskelly\" solution. I\'m going to take a
stab at this here. You might want to read ocharles\' post to better
understand the problem definition and his solution before continuing.


We\'ll start off with what I call the `Annotated` applicative functor,
which I\'ve [blogged about
previously](http://www.jayway.com/2014/02/25/cqrs-in-haskell-command-validation-with-applicative-functors/)
for it\'s use in validation.

It\'s simple definition is as follows

``` haskell
data Annotated f w a = Annotated (f a) w 
  deriving Functor

instance 
   (Applicative f, Monoid w) => Applicative (Annotated f w) 
  where
    pure a = Annotated (pure a) mempty
    Annotated f w <*> Annotated a w' = 
      Annotated (f <*> a) (w <> w')
```

As you can see, it basically allows us to write our code such that it
executes in two \"parallel universes\". One which is an effectful
applicative in `f`, and one that is a pure computation as a catenation
in the monoid `w`.

The nice thing about this abstraction is that it lets us examine the
result of the pure computation before executing the effects of
`f`. \(Or, as in my post on validation, not execute them at all if
validation fails\).

In order to model queries such as `getEntityOwnerById`, we also need
some notion of an environment containing the result of any executed
queries, though we need to be able to defer actually providing that
environment until later, but still let these queries \"pretend\" to
return a result. This is exactly what we achieve by wrapping our
applicative in a `ReaderT` with e\.g\. a map `Map k v` as the
environment.

As the monoid for `Annotated` we will just choose `[k]` to collect the
keys we will inspect. We\'ll also assume we want to use some
effects. Like ocharles we\'ll assume failure of queries is a
possibility, so we can choose `MaybeT IO` as the base Monad. Putting
these requirements together we get the type

``` haskell
type Query k v a = Annotated (ReaderT (M.Map k v) (MaybeT IO)) [k] a
```

Let\'s write some functions for basic operations.

``` haskell
withQuery :: ([k] -> IO (M.Map k v)) -> Query k v a -> IO (Maybe a)
withQuery query (Annotated f keys) = do
  map <- query keys
  runMaybeT $ runReaderT f map
```

This just calls function `query` with the pure part of the
computation, to get us the keys. We then run the reader with the
resuling map, and unpack the maybe transformer.

Now defining 

``` haskell
infixr 0 #
w # f = Annotated f w
```

we can write a generic \"getter\" for a value at a single key as follows

``` haskell
getQ :: Ord k => k -> Query k Age Age
getQ id = 
  [id] # ReaderT $ \map -> MaybeT $ return (M.lookup id map)
```

since `liftIO` is only defined for monads we provide

``` haskell
annotatedLiftIO io = Annotated (liftIO io) mempty
```

Now we can write a \"domain-specific\" query as follows

``` haskell
usersAgeById :: Id -> Query Id Age Age
usersAgeById id 
   = annotatedLiftIO (putStrLn ("processing user " ++ show id))
  *> getQ id
```

We\'ll reuse ocharles definition of `getUserAgesById`

```haskell
getUserAgesById :: [Id] -> IO (M.Map Id Age)
getUserAgesById keys = do
  putStrLn $ "Looking up " ++ show keys
  return $ Map.fromList $ [(1, 1), (2, 2)]
```

\.\.\.and example (where I\'ve added some output for the \"processing\").

```haskell
example = withQuery getUserAgesById $ 
  (+) <$> usersAgeById 1 <*> usersAgeById 2
```

```
>>> example
Looking up [1,2]
processing user 1
processing user 2
Just 30

```

This seems to do the trick nicely. Though perhaps I\'m missing
something? For further improvements we might choose a better monoid, such as

``` haskell
data QueryData k = Keys [k] | AllKeys
```

so that we may run queries over the entire set of keys in a
table. It would probably also be nice to write queries over multiple
datasets, which I believe could be done with existential types. I
think this is one of the things that have been solved by the [Haxl](http://skillsmatter.com/skillscasts/4429-simon-marlow)
project at Facebook.
