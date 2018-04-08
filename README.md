smoke-and-mirrors
=================

[![npm version](https://badge.fury.io/js/smoke-and-mirrors.svg)](http://badge.fury.io/js/smoke-and-mirrors)
[![Build Status](https://travis-ci.org/runspired/smoke-and-mirrors.svg)](https://travis-ci.org/runspired/smoke-and-mirrors)
[![Ember Observer Score](http://emberobserver.com/badges/smoke-and-mirrors.svg)](http://emberobserver.com/addons/smoke-and-mirrors)

`Smoke-and-mirrors` is an `ember-addon` that focuses on improving initial and re-render performance in high-stress
situations by providing components and primitives for performant lists and `svelte renders` to match a core belief:
**Don't render the universe, render the scene.**

#### TL;DR svelte render: the fewer things you need to render, the faster your renders will be.

Your web page is a universe, your viewport is the scene. Much like you wouldn't expect a video game to render
out-of-scene content, your application should smartly cull the content it doesn't need to care about.  Trimming
excess content lets the browser perform both initial renders and re-renders at far higher frame-rates, as the only
content it needs to focus on for layout is the content the user can see.

`Smoke-and-mirrors` augments your existing app, it doesn't ask you to rewrite layouts or logic in order to use it.
It will try its best to allow you to keep the conventions, structures, and layouts you want.

## vertical-collection

Smoke-and-mirrors uses [`@html-next/vertical-collection`](https://github.com/html-next/vertical-collection)
under the hood. If you are only using the `vertical-collection`, you should use that component directly instead.


## Install

```bash
ember install smoke-and-mirrors
```


## Usage

```htmlbars
{{#vertical-collection
    items
    tagName='ul'
    estimateHeight=50
    staticHeight=false
    bufferSize=1
    renderAll=false
    renderFromLast=false
    idForFirstItem=idForFirstItem
    firstReached=firstReached
    lastReached=lastReached
    firstVisibleChanged=firstVisibleChanged
    lastVisibleChanged=lastVisibleChanged
     as |item i|}}
    <li>
      {{item.number}} {{i}}
    </li>
{{/vertical-collection}}
```

### Actions

`firstReached` - Triggered when scroll reaches the first element in the collection

`lastReached`- Triggered when scroll reaches the last element in the collection

`firstVisibleChanged` - Triggered when the first element in the viewport changes
 
`lastVisibleChanged` - Triggered when the last element in the viewport changes

## Support, Questions, Collaboration

Join the [smoke-and-mirrors](https://embercommunity.slack.com/messages/smoke-and-mirrors/) channel on Slack.

[![Slack Status](https://ember-community-slackin.herokuapp.com/badge.svg)](https://ember-community-slackin.herokuapp.com/)

## Status

[Changelog](./CHANGELOG.md)

[![Build Status](https://travis-ci.org/runspired/smoke-and-mirrors.svg)](https://travis-ci.org/runspired/smoke-and-mirrors)
[![dependencies](https://david-dm.org/runspired/smoke-and-mirrors.svg)](https://david-dm.org/runspired/smoke-and-mirrors)
[![devDependency Status](https://david-dm.org/runspired/smoke-and-mirrors/dev-status.svg)](https://david-dm.org/runspired/smoke-and-mirrors#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/runspired/smoke-and-mirrors/badge.svg?branch=master&service=github)](https://coveralls.io/github/runspired/smoke-and-mirrors?branch=master)

## Documentation

We're rebuilding the docs for smoke-and-mirrors; however, in the meantime docs for the
`vertical-collection` are [available here](http://html-next.github.io/vertical-collection/).

## Contributing

 PRs are always welcome and loved! It's usually a good idea to open an issue
 and chat with one of the maintainers beforehand. We hang out in the [`#dev-html-next`](https://embercommunity.slack.com/messages/dev-html-next/)
 channel on the Ember Community Slack.
