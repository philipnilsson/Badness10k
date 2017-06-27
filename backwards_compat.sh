mkdir -p public/posts
cp public/escaping-hell-with-monads/index.html \
   public/posts/2017-05-07-escaping-hell-with-monads.html

cp public/algebraic-patterns-semigroup/index.html \
   public/posts/2016-07-14-functional-patterns-semigroup.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2017-05-07-escaping-hell-with-monads.html

sed -i 's/<script src=\"\/Badness10k\/bundle.js?t=.*\"><\/script>//g' \
    public/posts/2016-07-14-functional-patterns-semigroup.html
