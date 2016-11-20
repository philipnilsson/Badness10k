** Git is a purely functional data structure **

While decentralized version control like Git has a lot of momentum
right now, they still seems to have a reputation of being more complex
than their centralized siblings, like SVN. I’m guessing one reason for
this is that we tend to explain Git by comparision: When you’d do X
in SVN, you’d do Y in Git.

I think we should instead talk about Git in terms of what it really
is: A purely functional data structure. Learning to expertly use Git
means learning how to manipulate that data structure.

If you’re not familiar with purely functional data structures, this
might not seem too helpful. Turns out, we need only go briefly into
this subject in order to gain the needed insight, so lets quickly
explore this topic before bringing the discussion back to Git.

Preliminiaries
A functional data structure is essentially an immutable data
structure: its values never change. However, unlike for instance C#’s
ReadOnlyCollection, which has no operations to e.g. insert into it,
functional data structures do support operations like insertion or
deletion, they are just not in-place. Instead these operations are
handled by creating an entirely new updated structure.

For example, a typical list might look something like the value
[3,2,1]. If this list is mutable and we perform the operation of
inserting the value 4 at the front (head) of this list it now looks
like [4,3,2,1]. It has been modified in place and has become the new
value. The old value [3,2,1] is lost to us. Someone else who was
looking at this list now sees the value [4,3,2,1] instead. If that
someone was in the process of iterating through that list, they now
get a nice exception.

In the functional model this does not happen. Instead, when we insert
4 into the list, it creates a new value [4,3,2,1], without modifying
the original list. Both the values [4,3,2,1] and [3,2,1] now exist,
and anyone else who was looking at the list [3,2,1] still sees that
value.

You might be thinking this seem very inefficient. If we have access to
both the lists [4,3,2,1] and [3,2,1] we’d always have to store all
those seven elements in memory right? Even though we might no longer
be interested in the value [3,2,1]? In fact, the efficiency of
functional data structures depend heavily on what operations are
performed on them, and what internal representation is used (just like
normal data structures do, of course, but with some different
advantages, costs and trade-offs).

For (singly linked) lists, if all we’d like to do is do insertions at
the front, we can handle this case efficiently, by storing the
elements as below.

  +---+    +---+    +---+    +---+
  | 4 +--->+ 3 +--->+ 2 +--->+ 1 |
  +---+    +---+    +---+    +---+
    |        |
new list  original
We put the new value 4 in a new node, with a reference back to the
rest of the list. The original value is represented with the existing
reference, starting at the node for 3. If someone else had a
reference to that node, they would never notice an update had taken
place (if the list has been doubly linked this wouldn’t be true). We
can honestly say we have access to both the lists [4,3,2,1] and
[3,2,1] independently even though they share elements in memory, as
without operations for in-place modification, there is no perceivable difference.

In fact we could go further: If someone else would like to insert the
element 9 at the head of [3,2,1], they could do this independent of
us, reusing the same elements.

              +---+      +---+    +---+    +---+
new list 1 -> | 4 +---+->+ 3 +--->+ 2 +--->+ 1 |
              +---+  /   +---+    +---+    +---+
                    /      |
              +---+/    original
new list 2 -> | 9 +
              +---+
We could of course store elements like this for a non-immutable list
as well, but this is frought with danger: For instance, if we’d upate
the element 3 in the list [4,3,2,1], we’d also update it for someone
seeing the list [9,3,2,1], who might not like that one bit.

But… what if I really do need to update the element 3, setting it
to, say, 5. What then? We’ll, since we’re not allowed to perform any
in-place updates, we’ll have to copy some nodes into the updated
list. The result of all three operations might look like this:

                +---+    +---+
updated list -> | 4 +--->+ 5 +----+
                +---+    +---+

                +---+    +---+    +-+-+    +---+
  new list 1 -> | 4 +--->+ 3 +--->+ 2 +--->+ 1 |
                +---+  / +---+    +---+    +---+
                      /    |
                +---+/  original
  new list 2 -> | 9 +
                +---+
If we start at each pointer, going backwards, we see that this
simultaneously represents all the four values [4,5,2,1], [4,3,2,1],
[9,3,2,1] and [3,2,1]. If we’re indeed interested in storing all these
values simultaneously, this representation is in fact much more
compact than using mutable lists.

Purely functional data structures can be quite useful in
multi-threaded programming, as changes from different threads will not
interfere with each other.

Getting Git
Now how is any of this relevant to Git and version control? Well,
in a version control system what we want to accomplish is this:

To update our code base with new versions, keeping old versions
available.
Collaborating on a single code base without updates interfering
with each other in an unpredicable way.
Purely functional data structure lets you

Update data structure while keeping the old value of that data
available.
Updating a structure in one place without interfering with someone
elses updates of that structure.
If your’re now thinking functional data structures might seem like a
good representation for a version control system, you’d be right. In
fact, I’d even go so far to say I Git basically is a purely
functional data structure, with a command line client that allows you
to perform operations on it.

To complete the analogy, we need to replace what above was numbers
with commits. Git commits are independent copies of your entire
working state at point in history; a full snapshot of your working
directory. What we called list in the example we could call a history
in Git.

Let’s say we have a repository containing commits A, B and C in
that order, in the master branch. We’ve told Git to store the entire
state of our working directory three times during development.

We can represent this state of development as the history
[C,B,A]. In reality each commit will have metadata like a commit
message, but we’ll disregard that for simplicity as it doesn’t
matter. In graph form:

+---+    +---+    +---+
+ C +--->+ B +--->+ A |
+---+    +---+    +---+
  |
master
Commiting
If we perform another commit, this is the same as adding to the head
of this history. Git’s even uses the name HEAD for the currently
active commit.

+---+    +---+    +---+    +---+
+ D +--->+ C +--->+ B +--->+ A |
+---+    +---+    +---+    +---+
  |        |
master   master^
When git performs a commit it moves the current branch pointer for us,
and makes master point to the history [D,C,B,A]. We can still
refer to the history [C,B,A] by the name master^, the parent of
master. Anyone else who was working in that state will not notice
our changes.

Amending
If you’ve used Git, you’re probably aware that you can update your
latest commit by using commit --amend. But can you really update a
commit? In fact, you cannot. Git simply creates a new commit and moves
your branch pointer to it. The old value can still be found using git reflog, and can be referred to by its hash value (in this case I
arbitrarily used ef4d34). The situation would look like the following.

          +---+    +---+    +---+    +---+
ef4d34 -> | D +--+>+ C +--->+ B +--->+ A |
          +---+ /  +---+    +---+    +---+
               /     |
          +---+    master^
master -> | E |
          +---+
Branching
As you can see above, every time you do a commit --amend you
essentially create a new branch (there is a fork in the repository
graph). The only thing branching does is really to introduce a new
name we can refer to commits with. We can even take the discarded
commit ef4d34 and create a branch pointing to it, using the command
git checkout -b branch ef3d34

          +---+    +---+    +---+    +---+
branch -> | D +--+>+ C +--->+ B +--->+ A |
          +---+ /  +---+    +---+    +---+
               /     |
          +---+  master^
master -> | E |
          +---+
Typically we branch in Git by creating a new name for our current
HEAD, but if you understand Git as a functional data structure, you
realize there is nothing stopping you from creating a branch at
whatever commit in the tree you’d like.

Rebasing
When we in our list example updated a node further back in the list,
we had to add back each node in the list preceding the updated element
(in our example this was the single node 4, but could have been any
number of nodes). In Git, this is called replaying commits, and the
command for performing this operation is called rebase. To update and
old commit we add the -i flag to perform what in Git is called an
interactive rebase.

Say we want to update the commit C with a new commit message. We do
this by checking out the commit D, and using git rebase -i C.

> git checkout D
> git rebase -i C
This opens the same editor Git uses for commit messages with something
like the following list of commands:

pick cd3ff32 <C's commit message>
pick a65a671 <D's commit message>

# some helpful comments from git
If we change the command for commit C to edit, Git will allow us to
edit that commit before replaying the subsequent commits.

edit cd3ff32 <C's commit message>
pick a65a671 <D's commit message>
When we save the file and close it, git will begin a rebase. It will
stop immediately at our commit C to allow us to edit it.

Stopped at cd3ff32... <C's commit message>
You can amend the commit now, with

        git commit --amend

Once you are satisfied with your changes, run

        git rebase --continue
Basically, the message says it all. We’re free to edit the commit as
we’d like. We then call commit --amend to create the updated commit,
and continue with the rebase instructions using git rebase --continue. The rest of the commits will just be replayed one after
the other as we chose the command pick (unless you end up with a
merge conflict, in which case Git will stop and let you fix it before
proceeding). Our complete repository now looks like the following.

          +---+    +---+
rebased ->| D'+--->+ C'+
          +---+    +---+

          +---+    +---+   +---+    +---+
branch -> | D +--+>+ C +--->+ B +--->+ A |
          +---+ /  +---+    +---+    +---+
               /     |
          +---+  master^
master -> | E |
          +---+
The above graph should look familiar to you I hope. Hopefully you also
understand why Git’s rebase command creates all new commits. Git is a
functional data structure, and is not allowed to change any of the
existing commits.

Since rebase introduces a new chain of commits, we’d expect to be able
to have essentialy arbitrary control over how this new chain
looks. And of course, we do: rebase -i allows us to re-order, squash
or delete commits, as well as introduce new ones at any point, for
instance to split up a commit into parts, even starting at some other
point in the repository (using the --onto flag). The standard rebase
workflow of forward-porting local changes on top of updates from a
remote branch is just a special case of the more general power of
rebase.

Merging
So far we havn’t mentioned merging. Git allows us to merge two
branches into one

        +---+
      --+ X |
+---+/  +---+
| M |
+---+  +---+
      --+ Y |
        +---+
Merging introduces a bit more complexity to our model. Instead of our
history being a tree, it is now an acyclic graph. This doesn’t really
change much, but its worth noting, that while rebasing has a
reputation of being complex, only the merge command introduces
additional conceptual complexity.

Rebase can be understood in terms of just applying new commits in a
new direction. Merge is a fundamentally different operation. A data
structure where you can combine two parts into one like this even has
a special name: They are said be to confluently persistent. (Another
name for functional data structures are persistent. I’ve avoided
this term not to confuse it with the notion of storage on persistent
media like a physical disc.)

Conclusions
Git can be accurately understood as a fairly simple functional data
structure. Instead of explaining Git in terms version control, we can
see the ability to do version control as an emergent property of using
that data structure. I think talking about Git in this manner will
more accurately convey the simplicity and power of Git better than any
comparisons with centralized version control systems can accomplish.

In fact, looking at things this way, I think Git is in fact
conceptually much simpler than for instance SVN. The only reason
that Git might be perceived as more complex is that this simplicity
allows us to actually implement more interesting workflows.

If you’ve ever felt like Git is intimidating remember its simple
structure, as well the fact that in a functional data structure,
anything that has been inserted into it is never really lost, and can
be recovered. (Check your reflog)
