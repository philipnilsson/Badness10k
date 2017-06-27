mkdir -p public/posts
cp public/escaping-hell-with-monads/index.html \
   public/posts/2017-05-07-escaping-hell-with-monads.html

cp public/algebraic-patterns-semigroup/index.html \
   public/posts/2016-07-14-functional-patterns-semigroup.html

cp public/algebraic-patterns-category/index.html \
   public/posts/functional-patterns-category.html

cp public/algebraic-patterns-monoid-morphism/index.html \
   public/posts/2016-08-10-functional-patterns-monoid-morphism.html

cp public/algebraic-patterns-monoid/index.html \
   public/posts/2016-07-21-functional-patterns-monoid.html

cp public/algebraic-patterns-identity-element/index.html \
   public/posts/2016-06-29-functional-patterns-identity-element.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2017-05-07-escaping-hell-with-monads.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2016-07-14-functional-patterns-semigroup.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/functional-patterns-category.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2016-08-10-functional-patterns-monoid-morphism.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2016-07-21-functional-patterns-monoid.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2016-06-29-functional-patterns-identity-element.html
