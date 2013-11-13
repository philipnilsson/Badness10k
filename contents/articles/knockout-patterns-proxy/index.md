---
title: Patterns for Knockout.js — Proxy Object
author: Philip Nilsson
date: 2013-13-11
template: article.jade
---
<script src="/Badness10k/jquery.js"></script>
<script src="/Badness10k/knockout.js"></script>
<script src="/Badness10k/knockout-mapping.js"></script>

Lately, I've been looking into patterns in Knockout that will allow
separation between view- and backend-related code. I've been trying to
find methods of transparently communicating to a server API when
relevant view model properties change, without explicitly concerning
the view code.

I'm looking for "plain" knockout solutions, that doesn't have to
involve the logic of some additional routing library, so we'll focus
on using knockout's main abstraction, observables.

This post describes one of the solutions I've used for my current project,
which I will name proxy objects, lacking a better name. We'll look
into how to set up observable objects that are automatically persisted
by posting to an API, and thus decoupling it from the view model.

We're going to build something like the example below, where the
server is notified as the user changes data in the fields. In the
right hand column we'll log "server" (a.k.a console.log) calls to our
API. Edit the fields to see what calls are made.

<div id="ex" style="overflow: hidden; padding: 0.5em 0 1em 0">
 <div style="width: 34%; float: left; border: 1px solid lightgray; padding: 2%; font-size: 70%;">
  <div> <span style="width: 32%; display: inline-block;">First name: </span> <input data-bind="value: firstName, valueUpdate: 'afterkeydown'" /> </div>
  <div> <span style="width: 32%; display: inline-block;">Last name: </span> <input data-bind="value: lastName, valueUpdate: 'afterkeydown'" /> </div>
  <div> <span style="width: 32%; display: inline-block;">Full name: </span> <input data-bind="value: fullName, valueUpdate: 'afterkeydown'" /> </div>
  <div> <span style="width: 32%; display: inline-block;">SSN: </span> <input data-bind="value: ssn, valueUpdate: 'afterkeydown'" /> </div>
 </div>
 <div id="ex_log" style="width: 56%; height: 100%; float: right; border: 1px solid lightgray; padding: 2%; font-size: 70%;">
    &gt; Change the fields to see how the "API" is called.
 </div>
</div>

Note that we are ignoring the SSN field, as far as notifying the
backend goes. In this example we'll assume the social security number
is a property that is not editable by the user, but I've included an
editable view for it as an example of a property changing on the view
model, without triggering a server call.

We're going to write a method `proxy` that'll allow us to set up the
code for this as follows.

<pre>
var person = {
  firstName: 'Steve',
  lastName: 'Sanderson',
  ssn: '1234',
  ignore: ['ssn']
};

ko.applyBindings(
  new ViewModel(
    ko.proxy('api/person', person)));
</pre>

## Implementing `proxy`

Lets say we'll start by retreiving the initial state from the server.

<pre>
$.get('api/person', function(init) {
  ...
})
</pre>

From here we can set up an observable that we could bind to the view,
using `ko.observable(init)`. However, we'd like to react to changes in
any individual field (i.e. `firstName` or `lastName`). We can make all
fields of a javascript object observable by using the 
[knockout mapping plugin](http://knockoutjs.com/documentation/plugins-mapping.html).

<pre>
$.get('api/person', function(init) {
  var proxy = ko.mapping.fromJS(init);
})
</pre>

So how can we react to changes in any of the fields of this new
object? The result from ko.mapping is a javascript object with
observable fields, but it is not itself observable in its
entirety. Fortunately this can easily be solved by creating a computed
observable that uses the mapping-plugin's reverse mapping
functionality that takes a mapped object to a plain javascript object.

<pre>
$.get('api/person', function(init) {
  var proxy = ko.mapping.fromJS(init);
  ko.computed(function() {
    console.log(ko.mapping.toJS(proxy));
  });
})
</pre>

Since the computed calls the reverse-mapping operation, it will
evalutate each observable in the proxy object, and thus each field
will be registered as a dependency, so we will now see logging to the
console whenever any individual field of the proxy is changed.

Now all we need to do is to replace the `console.log` logging with an
API call that calls the api. The only new source of complexity is that
we'd probably like to avoid to call our API directly after
initializing the first value, as we'd just send the same value back
anyway, so we keep track of that in variable `first`.

<pre>
$.get('api/person', function(init) {
  var proxy = ko.mapping.fromJS(init);
  var first = true;
  ko.computed(function() {
    var data = ko.mapping.toJS(proxy);
    if (!first) {
      $.ajax({
        type: 'post',
        url: '/api/person',
        data: { '': JSON.stringify(data) };
    }
    first = false;
  });
});
</pre>

If we clean this up a bit, putting code into some library function,
say `ko.proxy`, we can set up our view model as

<pre>
$.get('api/person', function(init) {
  var proxy = ko.proxy('api/person', init);
  ko.applyBindings(new ViewModel(proxy));
})
</pre>

Note that we have a pretty good separation of concerns. The view model
does not have to know about server endpoints, or anything about the
API in order for changes to propagate to the server. It is however
necessary for the view model code to excercise some restraint in
updating the proxy object. For instance, if there is any validation to
be performed by the client, it'd be necessary to bind to another value
and perform validations on it before pushing changes to the proxy.

In a future post I might give more examples on how we can easily
include this type of validation when using the proxy pattern.

## Throttling

We'd probably like to perform some sort of throttling before sending
data to the server, so that we don't perform an ajax call on
e.g. every single keystroke for a text input. We can do this easily
by applying knockout's `throttle` extensions (which really is a
debounce) on our computed observable.

<pre>
ko.computed(function() {
  var data = ko.mapping.toJS ( ... )
  ...
}).extend({ throttle: 1000 })
</pre>

That's all we need to limit the rate of calls to when the user has
been inactive for one second.

## Ignoring fields

It's pretty common that the data available in a specific resource in
the API will contain data that we are not interested in sending back
to the server. Say our data contains another field for a social
security number `ssn`. The ko.mapping plugin allows us to provide an
array containing fields we'd like to ignore when doing the reverse
mapping with `ko.mapping.toJS`. 

Our convention has been for the API itself to provide the list of
fields it's not interested in updating, so a response might look
something like.

<pre>
{ 
  firstName: 'Ali',
  lastName: 'Pang',
  ssn: '1234',
  ignore: ['ssn']
}
</pre>

We now modify the `ko.proxy` code to take this into account.

<pre>
ko.proxy = function (init, endpoint) {

    var ignoreAlways = ['ignore'];

    var obs = ko.mapping.fromJS(init, { ignore: ignoreAlways });

    var first = true;
    ko.computed(function () {
        var data = ko.mapping.toJS(obs, {
            ignore: init.ignore
        });
        if (!first)
            $.post({url: endpoint, data: { '': JSON.stringify(data) } });
        first = false;
    }).extend({
        throttle: 1400
    });
    return obs;
};
</pre>

We set things up so that the initial mapping via `fromJS` ignore's the
`ignore` array, as this is not relevant for the view
model. Additionally, we tell `toJS` to ignore the fields from
`init.ignore`, which in this case would be `['ssn']`.

This will have two benefits.

  * We don't send irrelevant data back to the server. In this example
    we're not using the `ssn` to identify the user, it's just an
    unchangeable piece of extra data. With this setup, the `POST` data
    will not include the `ssn` field on its way back to the server,
    saving traffic.
  
  * Since the computed observable does not look at the ignored fields
    when reverse mapping, any changes made by the view model to the
    `ssn` field will not trigger a server call, as it will not be
    registered as a dependency.

In other words, if the view model calls `proxy.ssn('4567')`, no call
will be made to the server. If it calls `proxy.name('Philip')`, the
resulting post will not include data for the social security number.


## Setting up the view model

To complete this example, we can apply standard patterns, such as this
example, adding a full name property, from the knockout tutorial. It will
continue to work as expected.

<pre>
function ViewModel(proxy) {
    this.firstName = proxy.firstName;
    this.lastName = proxy.lastName;
 
    this.fullName = ko.computed({
        read: function () {
            return this.firstName() + " " + this.lastName();
        },
        write: function (value) {
            var lastSpacePos = value.lastIndexOf(" ");
            if (lastSpacePos > 0) { 
                this.firstName(
                  value.substring(0, lastSpacePos));
                this.lastName(
                  value.substring(lastSpacePos + 1));
            }
        },
        owner: this
    });
}
 
ko.applyBindings(
  new ViewModel(
    ko.proxy('api/person', {
      firstName: 'Steve',
      lastName: 'Sanderson',
      ssn: '1234',
      ignore: ['ssn']
    })));
</pre>

<script>

ko.proxy = function (init, endpoint) {

    var ignoreAlways = ['ignore'];

    var obs = ko.mapping.fromJS(init, { ignore: ignoreAlways });

    var first = true;
    ko.computed(function () {
        var data = ko.mapping.toJS(obs, {
            ignore: init.ignore
        });
        data = JSON.stringify(data);
        if (!first) {
            $('#ex_log').prepend('<div>' + '&gt; Sending: ' + data + '</div>');
            $('#ex_log div:gt(5)').remove()
        }
        first = false;
    }).extend({
        throttle: 1000
    });
    return obs;
};

function ViewModel(proxy) {
    this.firstName = proxy.firstName;
    this.lastName = proxy.lastName;
    this.ssn = proxy.ssn;
    
    this.fullName = ko.computed({
        read: function () {
            return this.firstName() + " " + this.lastName();
        },
        write: function (value) {
            var lastSpacePos = value.lastIndexOf(" ");
            if (lastSpacePos > 0) { 
                this.firstName(
                  value.substring(0, lastSpacePos));
                this.lastName(
                  value.substring(lastSpacePos + 1));
            }
        },
        owner: this
    });
}

ko.applyBindings(
  new ViewModel(
    ko.proxy({
      firstName: 'Steve',
      lastName: 'Sanderson',
      ssn: '1234',
      ignore: ['ssn']
    })), document.getElementById('ex'));

</script>