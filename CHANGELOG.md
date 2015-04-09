# Changelog

## 0.1.0

This is the first release, so this is a feature overview for what's included already.
This project will stick to SemVer absolutely, there will be no breaking changes
between major releases, and hopefully none-to-minor breakage between minor releases in
the pre 1.0.0 cycle.

I chose not to publish any 0.0.x versions because I've noticed a propensity for others to
quickly assimilate code that should not be used in production.  On that same note, I do
not recommend using this package pre-1.0 if you are not prepared to handle the bugs that
come with pre-1.0 code.  I'm using this in production, so you can expect that I'll keep
the update pain minimal, the hot-fixes coming fast, and the bug fixes / improvements regular.

### Features

Features are exposed to your app by default via wrapper inclusion in the `/app` directory.
Each of these has extensive code documentation comments that is more updated than whats
in the `/docs` directory at the time of release.  I hope to rectify this shortly.

- `components/proxied-each`
- `components/occlusion-collection`
- `components/async-image`
- `views/cache-container`

None of these exposes `{{yield}}`, so for now you must pass an item view name directly.
A PR to add support for normal `{{#each}}` semantics would be appreciated, it's scheduled
for 0.2.0 currently as it is.

### Experiments

This code is broken, and development may not continue.  Feel free to poke around.
All that's in there currently is the remains of my work on finishing @ebryn and @mmun's
`Ember.MagicCollectionView`.  I'm more likely to rework `magic-array` to do the smart
reshuffle and `occlusion-collection` to also handle shuffling views.

### Addon

This code is available in your app via `import Foo from 'smoke-and-mirrors/<path-to-foo>'`

- `mixins/cacheable` Makes your view or component cacheable.  The cacheing will still
need to be handled by a parent view or component.  `occlusion-collection` and `cache-container`
both utilize this.
- `mixins/magic-array` Proxies `contentToProxy` to `__proxyContentTo` including wrapping
items in an `smart-object-proxy`.
- `utils/smart-object-proxy` an `object-proxy` that includes an index key.

