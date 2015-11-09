"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('dummy/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'dummy/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('dummy/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'dummy/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('dummy/components/async-image', ['exports', 'ember-async-image/components/async-image'], function (exports, async_image) {

	'use strict';



	exports['default'] = async_image['default'];

});
define('dummy/components/code-snippet', ['exports', 'ember', 'dummy/snippets'], function (exports, Ember, Snippets) {

  'use strict';

  var Highlight = require('highlight.js');

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'pre',
    classNameBindings: ['language'],
    unindent: true,

    _unindent: function _unindent(src) {
      if (!this.get('unindent')) {
        return src;
      }
      var match,
          min,
          lines = src.split("\n");
      for (var i = 0; i < lines.length; i++) {
        match = /^\s*/.exec(lines[i]);
        if (match && (typeof min === 'undefined' || min > match[0].length)) {
          min = match[0].length;
        }
      }
      if (typeof min !== 'undefined' && min > 0) {
        src = src.replace(new RegExp("(\\n|^)\\s{" + min + "}", 'g'), "$1");
      }
      return src;
    },

    source: Ember['default'].computed('name', function () {
      return this._unindent((Snippets['default'][this.get('name')] || "").replace(/^(\s*\n)*/, '').replace(/\s*$/, ''));
    }),

    didInsertElement: function didInsertElement() {
      Highlight.highlightBlock(this.get('element'));
    },

    language: Ember['default'].computed('name', function () {
      var m = /\.(\w+)$/i.exec(this.get('name'));
      if (m) {
        switch (m[1].toLowerCase()) {
          case 'js':
            return 'javascript';
          case 'hbs':
            return 'handlebars';
          case 'css':
            return 'css';
          case 'scss':
            return 'scss';
        }
      }
    })
  });

});
define('dummy/components/horizontal-collection', ['exports', 'smoke-and-mirrors/components/horizontal-collection'], function (exports, horizontal_collection) {

	'use strict';



	exports['default'] = horizontal_collection['default'];

});
define('dummy/components/in-viewport', ['exports', 'smoke-and-mirrors/components/in-viewport'], function (exports, in_viewport) {

	'use strict';



	exports['default'] = in_viewport['default'];

});
define('dummy/components/pre-render', ['exports', 'smoke-and-mirrors/components/pre-render'], function (exports, pre_render) {

	'use strict';



	exports['default'] = pre_render['default'];

});
define('dummy/components/vertical-collection', ['exports', 'smoke-and-mirrors/components/vertical-collection'], function (exports, vertical_collection) {

	'use strict';



	exports['default'] = vertical_collection['default'];

});
define('dummy/components/vertical-item', ['exports', 'smoke-and-mirrors/components/vertical-item'], function (exports, vertical_item) {

	'use strict';



	exports['default'] = vertical_item['default'];

});
define('dummy/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('dummy/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('dummy/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'dummy/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
define('dummy/initializers/export-application-global', ['exports', 'ember', 'dummy/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('dummy/initializers/raf-polyfill', ['exports', 'ember-run-raf/initializers/raf-polyfill'], function (exports, raf_polyfill) {

	'use strict';



	exports['default'] = raf_polyfill['default'];
	exports.initialize = raf_polyfill.initialize;

});
define('dummy/lib/get-data', ['exports'], function (exports) {

  'use strict';



  exports['default'] = getData;
  var DEFAULT_ROWS = 20;
  function getData(ROWS) {

    ROWS = ROWS || DEFAULT_ROWS;

    // generate some dummy data
    var data = {
      start_at: new Date().getTime() / 1000,
      databases: []
    };

    for (var i = 1; i <= ROWS; i++) {

      data.databases.push({
        id: "cluster" + i,
        queries: []
      });

      data.databases.push({
        id: "cluster" + i + "slave",
        queries: []
      });
    }

    data.databases.forEach(function (info) {

      var r = Math.floor(Math.random() * 10 + 1);
      for (var i = 0; i < r; i++) {
        var q = {
          canvas_action: null,
          canvas_context_id: null,
          canvas_controller: null,
          canvas_hostname: null,
          canvas_job_tag: null,
          canvas_pid: null,
          elapsed: Math.random() * 15,
          query: "SELECT blah FROM something",
          waiting: Math.random() < 0.5
        };

        if (Math.random() < 0.2) {
          q.query = "<IDLE> in transaction";
        }

        if (Math.random() < 0.1) {
          q.query = "vacuum";
        }

        info.queries.push(q);
      }

      info.queries = info.queries.sort(function (a, b) {
        return b.elapsed - a.elapsed;
      });
    });

    return data;
  }

});
define('dummy/lib/get-images', ['exports'], function (exports) {

  'use strict';

  exports.getImages = getImages;
  exports.getDynamicImages = getDynamicImages;

  var DEFAULT_COUNT = 10;
  var URL_BASE = 'http://lorempixel.com';
  var CATEGORIES = ['abstract', 'city', 'people', 'transport', 'food', 'nature', 'business', 'nightlife', 'sports', 'cats', 'fashion', 'technics'];

  function booleanToss() {
    return Math.round(Math.random());
  }

  function isGray() {
    return booleanToss();
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

  function getWidth() {
    return getRandomNumber(1500, 1920);
  }

  function getDynamicHeight() {
    return getRandomNumber(300, 600);
  }

  function getDynamicWidth(height, isPortrait) {
    return Math.round(isPortrait ? height / 16 * 9 : height / 9 * 16);
  }

  function generateImageId(index) {
    return new Date().getTime() + '-' + index;
  }
  function getId() {
    return getRandomNumber(0, 10);
  }

  function getCategoryIndex() {
    return getRandomNumber(0, CATEGORIES.length - 1);
  }

  function generateImageSrc(index) {
    var parts = [];
    var preview = [];
    parts.push(URL_BASE);
    preview.push(URL_BASE);
    if (isGray()) {
      parts.push('g');
      preview.push('g');
    }
    var width = getWidth();
    parts.push(width);
    parts.push(width);
    var small = 250;
    preview.push(small);
    preview.push(small);
    var cat = CATEGORIES[getCategoryIndex()];
    parts.push(cat);
    preview.push(cat);
    var id = getId();
    parts.push(id);
    preview.push(id);
    return {
      large: parts.join('/'),
      small: preview.join('/'),
      id: generateImageId(index)
    };
  }

  function generateDynamicImageSrc(index) {
    var parts = [];
    var preview = [];
    parts.push(URL_BASE);
    preview.push(URL_BASE);
    if (isGray()) {
      parts.push('g');
      preview.push('g');
    }
    var height = getDynamicHeight();
    var isPortrait = booleanToss();
    parts.push(height);
    parts.push(getDynamicWidth(height, isPortrait));
    var small = 100;
    preview.push(small);
    preview.push(getDynamicWidth(small, isPortrait));
    var cat = CATEGORIES[getCategoryIndex()];
    parts.push(cat);
    preview.push(cat);
    var id = getId();
    parts.push(id);
    preview.push(id);
    return {
      large: parts.join('/'),
      small: preview.join('/'),
      id: generateImageId(index)
    };
  }

  function getImages(count) {
    count = count || DEFAULT_COUNT;
    var imageUrls = [];

    for (var i = 1; i <= count; i++) {
      imageUrls.push(generateImageSrc(i));
    }

    return imageUrls;
  }

  function getDynamicImages(count) {
    count = count || DEFAULT_COUNT;
    var imageUrls = [];

    for (var i = 1; i <= count; i++) {
      imageUrls.push(generateDynamicImageSrc(i));
    }

    return imageUrls;
  }

  exports['default'] = getImages;

});
define('dummy/lib/get-numbers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = function (start, total) {
    var i = undefined;
    var ret = [];
    for (i = start; i < start + total; i++) {
      ret.push({
        number: i
      });
    }
    return ret;
  }

});
define('dummy/mixins/in-viewport', ['exports', 'smoke-and-mirrors/mixins/in-viewport'], function (exports, Mixin) {

	'use strict';

	exports['default'] = Mixin['default'];

});
define('dummy/router', ['exports', 'ember', 'dummy/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  exports['default'] = Router.map(function () {

    this.route('examples', function () {
      this.route('dbmon');
      this.route('infinite-scroll');
      this.route('flexible-layout');
      this.route('scrollable-body');
      this.route('html-gl');
    });

    this.route('mixins', function () {
      this.route('queues');
      this.route('photo-loader');
      this.route('scroller');
      this.route('in-viewport');
      this.route('occlusion');
      this.route('local-storage');
      this.route('session');
      this.route('extended-router');
      this.route('stack');
      this.route('html-gl');
    });

    this.route('services', function () {
      this.route('in-viewport');
      this.route('photo-loader');
    });

    this.route('available-components', function () {
      this.route('vertical-collection');
      this.route('async-image');
      this.route('pre-render');
      this.route('html-gl');
    });
  });

});
define('dummy/screens/application/route', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var Route = Ember['default'].Route;

	exports['default'] = Route.extend({});

});
define('dummy/screens/application/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 8
            },
            "end": {
              "line": 6,
              "column": 8
            }
          },
          "moduleName": "dummy/screens/application/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"src","./logo.svg");
          dom.setAttribute(el1,"style","width: 2em; height: 2em;");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            Smoke And Mirrors\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 10
            },
            "end": {
              "line": 8,
              "column": 57
            }
          },
          "moduleName": "dummy/screens/application/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Demos");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 10
            },
            "end": {
              "line": 9,
              "column": 60
            }
          },
          "moduleName": "dummy/screens/application/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Services");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 10
            },
            "end": {
              "line": 11,
              "column": 74
            }
          },
          "moduleName": "dummy/screens/application/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Components");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 23,
            "column": 0
          }
        },
        "moduleName": "dummy/screens/application/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("nav");
        dom.setAttribute(el3,"class","col-sm-6 text-small");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-12");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [3]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(element0,1,1);
        morphs[1] = dom.createMorphAt(element1,1,1);
        morphs[2] = dom.createMorphAt(element1,3,3);
        morphs[3] = dom.createMorphAt(element1,6,6);
        morphs[4] = dom.createMorphAt(dom.childAt(fragment, [2, 1, 1]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["index"],["tagName","h1","class","col-sm-6"],0,null,["loc",[null,[3,8],[6,20]]]],
        ["block","link-to",["examples"],["class","text-white"],1,null,["loc",[null,[8,10],[8,69]]]],
        ["block","link-to",["services"],["class","text-white"],2,null,["loc",[null,[9,10],[9,72]]]],
        ["block","link-to",["available-components"],["class","text-white"],3,null,["loc",[null,[11,10],[11,86]]]],
        ["content","outlet",["loc",[null,[18,10],[18,20]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  }()));

});
define('dummy/screens/available-components/async-image/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Route = Ember['default'].Route;
  var RSVP = Ember['default'].RSVP;

  exports['default'] = Route.extend({

    model: function model() {

      var images = getImages['default'](1);

      return RSVP.hash({
        imageTitle: 'Is this Art?',
        imageSrc: images[0].small,
        imageAlt: 'Artistic License Example',
        imagePlaceholder: ''
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('attrs', model);
    }

  });

});
define('dummy/screens/available-components/async-image/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 34,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/available-components/async-image/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-12");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Async Image");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The async-image component renders an `img` tag with no additional markup.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The image waits until it's source has been pre-loaded to render so that you\n                don't show partially loaded images to your users.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                If the source changes or the component is torn down, the image src changes\n                to a transparent 1px placeholder while the new image is fetched and during\n                teardown to preserve memeory and prevent 404 errors from ghost network\n                requests resulting from the blank source.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-4");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-8");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),2,2);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        return morphs;
      },
      statements: [
        ["inline","async-image",[],["src",["subexpr","if",[["get","attrs.imageSrc",["loc",[null,[24,20],[24,34]]]],["get","attrs.imageSrc",["loc",[null,[24,35],[24,49]]]],["get","attrs.imagePlaceholder",["loc",[null,[24,50],[24,72]]]]],[],["loc",[null,[24,16],[24,73]]]],"alt",["subexpr","@mut",[["get","attrs.imageAlt",["loc",[null,[25,16],[25,30]]]]],[],[]],"title",["subexpr","@mut",[["get","attrs.imageTitle",["loc",[null,[26,18],[26,34]]]]],[],[]]],["loc",[null,[23,10],[27,12]]]],
        ["inline","code-snippet",[],["name","async-image-usage-example.hbs"],["loc",[null,[31,8],[31,61]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/screens/available-components/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 6
            },
            "end": {
              "line": 4,
              "column": 80
            }
          },
          "moduleName": "dummy/screens/available-components/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Vertical Collection");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 62
            }
          },
          "moduleName": "dummy/screens/available-components/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Pre-Render");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 6
            },
            "end": {
              "line": 18,
              "column": 64
            }
          },
          "moduleName": "dummy/screens/available-components/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Async Image");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 5
          }
        },
        "moduleName": "dummy/screens/available-components/index/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Components");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [4]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [6]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["available-components.vertical-collection"],[],0,null,["loc",[null,[4,6],[4,92]]]],
        ["block","link-to",["available-components.pre-render"],[],1,null,["loc",[null,[15,6],[15,74]]]],
        ["block","link-to",["available-components.async-image"],[],2,null,["loc",[null,[18,6],[18,76]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('dummy/screens/available-components/pre-render/controller', ['exports', 'ember', 'jquery'], function (exports, Ember, jQuery) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({

    renderIntoElement: null,
    shouldRenderIntoElement: false,

    lastKnownDimensions: null,

    actions: {
      render: function render() {
        this.setProperties({
          renderIntoElement: null
        });
      },

      renderInto1: function renderInto1() {
        var element = jQuery['default']('#renderIntoMe1').get(0);
        this.setProperties({
          renderIntoElement: element
        });
      },

      renderInto2: function renderInto2() {
        var element = jQuery['default']('#renderIntoMe2').get(0);
        this.setProperties({
          renderIntoElement: element
        });
      },

      renderFragment: function renderFragment() {
        this.toggleProperty('shouldRenderIntoElement');
      },

      displayDimensions: function displayDimensions(dimensions) {
        this.set('lastKnownDimensions', JSON.stringify(dimensions.calc, null, 2));
      }

    }

  });

});
define('dummy/screens/available-components/pre-render/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Route = Ember['default'].Route;
  var RSVP = Ember['default'].RSVP;

  exports['default'] = Route.extend({

    model: function model() {

      var images = getImages['default'](1);

      return RSVP.hash({
        imageTitle: 'Is this Art?',
        imageSrc: images[0].large,
        imageAlt: 'Artistic License Example',
        imagePlaceholder: ''
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('attrs', model);
    }

  });

});
define('dummy/screens/available-components/pre-render/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 14
            },
            "end": {
              "line": 19,
              "column": 14
            }
          },
          "moduleName": "dummy/screens/available-components/pre-render/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","async-image",[],["class","auto-size","src",["subexpr","if",[["get","attrs.imageSrc",["loc",[null,[15,26],[15,40]]]],["get","attrs.imageSrc",["loc",[null,[15,41],[15,55]]]],["get","attrs.imagePlaceholder",["loc",[null,[15,56],[15,78]]]]],[],["loc",[null,[15,22],[15,79]]]],"alt",["subexpr","@mut",[["get","attrs.imageAlt",["loc",[null,[16,22],[16,36]]]]],[],[]],"title",["subexpr","@mut",[["get","attrs.imageTitle",["loc",[null,[17,24],[17,40]]]]],[],[]]],["loc",[null,[13,16],[18,18]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 32,
              "column": 14
            },
            "end": {
              "line": 37,
              "column": 14
            }
          },
          "moduleName": "dummy/screens/available-components/pre-render/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Render into Self");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Render Into 1");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Render Into 2");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Remove");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [1]);
          var element5 = dom.childAt(fragment, [3]);
          var element6 = dom.childAt(fragment, [5]);
          var element7 = dom.childAt(fragment, [7]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element4);
          morphs[1] = dom.createElementMorph(element5);
          morphs[2] = dom.createElementMorph(element6);
          morphs[3] = dom.createElementMorph(element7);
          return morphs;
        },
        statements: [
          ["element","action",["render"],[],["loc",[null,[33,26],[33,45]]]],
          ["element","action",["renderInto1"],[],["loc",[null,[34,26],[34,50]]]],
          ["element","action",["renderInto2"],[],["loc",[null,[35,26],[35,50]]]],
          ["element","action",["renderFragment"],[],["loc",[null,[36,26],[36,53]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 14
            },
            "end": {
              "line": 42,
              "column": 14
            }
          },
          "moduleName": "dummy/screens/available-components/pre-render/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Prepare for Self");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Prepare for 1");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Prepare for 2");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("Render");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(fragment, [3]);
          var element2 = dom.childAt(fragment, [5]);
          var element3 = dom.childAt(fragment, [7]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createElementMorph(element1);
          morphs[2] = dom.createElementMorph(element2);
          morphs[3] = dom.createElementMorph(element3);
          return morphs;
        },
        statements: [
          ["element","action",["render"],[],["loc",[null,[38,26],[38,45]]]],
          ["element","action",["renderInto1"],[],["loc",[null,[39,26],[39,50]]]],
          ["element","action",["renderInto2"],[],["loc",[null,[40,26],[40,50]]]],
          ["element","action",["renderFragment"],[],["loc",[null,[41,26],[41,53]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 87,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/available-components/pre-render/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","demo-wrapper bg-dark");
        var el5 = dom.createTextNode("\n              ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","clearfix");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("              ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"id","renderIntoMe1");
        dom.setAttribute(el6,"style","width: 100px; height: 100px;");
        dom.setAttribute(el6,"class","display-inline");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n              ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"id","renderIntoMe2");
        dom.setAttribute(el6,"style","width: 75px; height: 75px;");
        dom.setAttribute(el6,"class","display-inline");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("              ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n              ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h5");
        dom.setAttribute(el6,"class","text-white");
        var el7 = dom.createTextNode("Dimensions from last Prerender");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("pre");
        var el7 = dom.createElement("code");
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n              ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Pre Render");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The pre-render component allows you to render it's contents invisibly off screen,\n                receive calculations about them, and render them onto the screen when ready.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The pre-render component is just a generic component combined with the pre-render\n                mixin.  You can extend it, or use the mixin, to add this functionality to more\n                specialized components as desired.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Options");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createTextNode("parent");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(": the parent element within which to render (default's to itself).\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createTextNode("renderInParent");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(": whether render the component into it's parent.\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Hooks");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The mixin exposes several new hooks for use by consuming components.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createTextNode("didPreRender");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(":\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createTextNode("didMoveElement");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(":\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Special Thanks");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                This component was inspired by the mechanics of ember-wormhole and wishes to give\n                a special thanks to everyone who worked on that project.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element8 = dom.childAt(fragment, [0, 1, 1]);
        var element9 = dom.childAt(element8, [1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element9, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element9, [3, 3, 0]),0,0);
        morphs[2] = dom.createMorphAt(element9,5,5);
        morphs[3] = dom.createMorphAt(element8,3,3);
        return morphs;
      },
      statements: [
        ["block","pre-render",[],["parent",["subexpr","@mut",[["get","renderIntoElement",["loc",[null,[8,23],[8,40]]]]],[],[]],"renderInParent",["subexpr","@mut",[["get","shouldRenderIntoElement",["loc",[null,[9,31],[9,54]]]]],[],[]],"didPreRender",["subexpr","action",["displayDimensions"],[],["loc",[null,[10,29],[10,57]]]],"class","display-inline col-xs-4"],0,null,["loc",[null,[7,14],[19,29]]]],
        ["content","lastKnownDimensions",["loc",[null,[30,29],[30,52]]]],
        ["block","if",[["get","shouldRenderIntoElement",["loc",[null,[32,20],[32,43]]]]],[],1,2,["loc",[null,[32,14],[42,21]]]],
        ["inline","code-snippet",[],["name","pre-render-usage-example.hbs"],["loc",[null,[45,10],[45,62]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('dummy/screens/available-components/vertical-collection/snippets/defaults', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    // basics (item will tagMatch)
    tagName: 'vertical-collection',
    itemTagName: 'vertical-item',

    // required
    content: null,
    defaultHeight: 75, //Integer: attempts to work with em, rem, px

    // performance
    useContentProxy: false,
    key: '@identity',
    alwaysUseDefaultHeight: false,
    bufferSize: 1,
    resizeDebounce: 64,
    // exposeAttributeState: false, currently disabled entirely,
    //     pending outcome of recycling implementation in 0.5

    // actions
    firstReached: null,
    lastReached: null,
    firstVisibleChanged: null,
    lastVisibleChanged: null,
    didMountCollection: null,

    // initial state
    scrollPosition: 0,
    idForFirstItem: null,
    renderFromLast: false,
    renderAllInitially: false,
    shouldRender: true,

    // scroll setup
    minimumMovement: 15,
    containerSelector: null,
    containerHeight: null
  }
  /*!- END-SNIPPET vertical-collection-defaults-example */
  ;

});
define('dummy/screens/available-components/vertical-collection/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/available-components/vertical-collection/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Available Settings (with defaults)");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Vertical Collection");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1]),3,3);
        return morphs;
      },
      statements: [
        ["inline","code-snippet",[],["name","vertical-collection-defaults-example.js"],["loc",[null,[5,10],[5,73]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/screens/examples/dbmon/components/dbmon-row/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var computed = Ember['default'].computed;

  exports['default'] = Ember['default'].Component.extend({

    tagName: 'tr',

    queries: computed.alias('db.queries'),

    topFiveQueries: computed('queries', function () {
      var queries = this.get('queries');
      var topFiveQueries = queries.slice(0, 5);

      while (topFiveQueries.length < 5) {
        topFiveQueries.push({ query: "" });
      }

      return topFiveQueries.map(function (query, index) {
        return {
          key: index + '',
          query: query.query,
          elapsed: query.elapsed ? formatElapsed(query.elapsed) : '',
          className: elapsedClass(query.elapsed)
        };
      });
    }),

    countClassName: computed('queries', function () {
      var queries = this.get('queries');
      var countClassName = "label";

      if (queries.length >= 20) {
        countClassName += " label-important";
      } else if (queries.length >= 10) {
        countClassName += " label-warning";
      } else {
        countClassName += " label-success";
      }

      return countClassName;
    })

  });

  function elapsedClass(elapsed) {
    if (elapsed >= 10.0) {
      return "elapsed warn_long";
    } else if (elapsed >= 1.0) {
      return "elapsed warn";
    } else {
      return "elapsed short";
    }
  }

  var _base = String.prototype;

  _base.lpad = _base.lpad || function (padding, toLength) {
    return padding.repeat((toLength - this.length) / padding.length).concat(this);
  };

  function formatElapsed(value) {
    var str = parseFloat(value).toFixed(2);
    if (value > 60) {
      var minutes = Math.floor(value / 60);
      var comps = (value % 60).toFixed(2).split('.');
      var seconds = comps[0].lpad('0', 2);
      var ms = comps[1];
      str = minutes + ":" + seconds + "." + ms;
    }
    return str;
  }

});
define('dummy/screens/examples/dbmon/components/dbmon-row/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 0
            },
            "end": {
              "line": 15,
              "column": 0
            }
          },
          "moduleName": "dummy/screens/examples/dbmon/components/dbmon-row/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("td");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","popover bottom");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","popover-content");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","arrow");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3, 1]),0,0);
          return morphs;
        },
        statements: [
          ["content","query.elapsed",["loc",[null,[10,6],[10,23]]]],
          ["content","query.query",["loc",[null,[12,35],[12,50]]]]
        ],
        locals: ["query"],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 9
          }
        },
        "moduleName": "dummy/screens/examples/dbmon/components/dbmon-row/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("td");
        dom.setAttribute(el1,"class","dbname");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        dom.setAttribute(el1,"class","query-count");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        morphs[1] = dom.createAttrMorph(element0, 'class');
        morphs[2] = dom.createMorphAt(element0,1,1);
        morphs[3] = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["content","attrs.db.id",["loc",[null,[2,2],[2,17]]]],
        ["attribute","class",["concat",[["get","countClassName",["loc",[null,[5,17],[5,31]]]]]]],
        ["content","queries.length",["loc",[null,[6,4],[6,22]]]],
        ["block","each",[["get","topFiveQueries",["loc",[null,[9,8],[9,22]]]]],["key","@index"],0,null,["loc",[null,[9,0],[15,9]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('dummy/screens/examples/dbmon/controller', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var Controller = Ember['default'].Controller;

	exports['default'] = Controller.extend({});

});
define('dummy/screens/examples/dbmon/route', ['exports', 'ember', 'dummy/lib/get-data'], function (exports, Ember, getData) {

  'use strict';

  var Route = Ember['default'].Route;
  var run = Ember['default'].run;

  exports['default'] = Route.extend({

    numRows: 100,

    model: function model() {
      return getData['default'](this.numRows);
    },

    afterModel: function afterModel() {
      run.later(this, this.loadSamples, 100);
    },

    loadSamples: function loadSamples() {
      this.controller.set('model', getData['default'](this.numRows));
      run.next(this, this.loadSamples);
    },

    actions: {

      addRow: function addRow() {
        this.numRows++;
      },

      removeRow: function removeRow() {
        this.numRows--;
      }

    }

  });

});
define('dummy/screens/examples/dbmon/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 22
            },
            "end": {
              "line": 19,
              "column": 22
            }
          },
          "moduleName": "dummy/screens/examples/dbmon/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","examples/dbmon/components/dbmon-row",[],["tagName","","db",["subexpr","@mut",[["get","db",["loc",[null,[18,76],[18,78]]]]],[],[]]],["loc",[null,[18,24],[18,80]]]]
        ],
        locals: ["db"],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 44,
            "column": 0
          }
        },
        "moduleName": "dummy/screens/examples/dbmon/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","demo-wrapper bg-dark");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","table-wrapper");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("table");
        dom.setAttribute(el6,"class","table table-striped latest-data");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Vertical Collection");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The Vertical Collection smartly hides and removes off screen content.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                This makes building high frame-rate or render expensive components easier by\n                focusing only on what's on screen now.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n              If you are on an older version of Ember (pre-glimmer), setting `useContentProxy`\n              to true will give you an equally fast and impressive render time by proxying\n              the contents of the underlying array to avoid unnecessarily destroying views.\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Code for Demo");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1, 2, 1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),11,11);
        return morphs;
      },
      statements: [
        ["block","vertical-collection",[],["tagName","tbody","content",["subexpr","@mut",[["get","model.databases",["loc",[null,[10,32],[10,47]]]]],[],[]],"defaultHeight",37,"bufferSize",0.5,"alwaysUseDefaultHeight",true,"containerSelector",".table-wrapper","key","id"],0,null,["loc",[null,[8,22],[19,46]]]],
        ["inline","code-snippet",[],["name","dbmon-example.hbs"],["loc",[null,[40,10],[40,51]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('dummy/screens/examples/flexible-layout/controller', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, get_images) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({

    numImages: 10,

    actions: {

      loadAbove: function loadAbove() {
        var images = get_images.getDynamicImages(10);
        var model = this.get('model.images');
        var newModel = images.concat(model);
        this.set('model.images', newModel);
      },

      loadBelow: function loadBelow() {
        var images = get_images.getDynamicImages(10);
        var model = this.get('model.images');
        var newModel = model.concat(images);
        this.set('model.images', newModel);
      }

    }

  });

});
define('dummy/screens/examples/flexible-layout/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, get_images) {

  'use strict';

  var Route = Ember['default'].Route;

  exports['default'] = Route.extend({

    model: function model() {
      return { images: get_images.getDynamicImages(10) };
    }

  });

});
define('dummy/screens/examples/flexible-layout/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 14
            },
            "end": {
              "line": 18,
              "column": 14
            }
          },
          "moduleName": "dummy/screens/examples/flexible-layout/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","image-slide flexible");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","async-image",[],["src",["subexpr","@mut",[["get","image.small",["loc",[null,[16,38],[16,49]]]]],[],[]]],["loc",[null,[16,20],[16,51]]]]
        ],
        locals: ["image"],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 36,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/examples/flexible-layout/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","table-wrapper");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Flexible Layouts");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The Vertical Collection doesn't care if your items are of a uniform\n                size or type.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                This layout agnostic behavior will improve even more in upcoming releases\n                with integration with the pre-render component.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Code for Demo");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 2]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),9,9);
        return morphs;
      },
      statements: [
        ["block","vertical-collection",[],["content",["subexpr","@mut",[["get","model.images",["loc",[null,[7,24],[7,36]]]]],[],[]],"defaultHeight",300,"alwaysUseDefaultHeight",false,"visibleBuffer",2,"useContentProxy",false,"lastReached","loadBelow"],0,null,["loc",[null,[6,14],[18,38]]]],
        ["inline","code-snippet",[],["name","flexible-layout-example.hbs"],["loc",[null,[33,10],[33,61]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('dummy/screens/examples/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 18
            },
            "end": {
              "line": 7,
              "column": 52
            }
          },
          "moduleName": "dummy/screens/examples/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("dbMon");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 18
            },
            "end": {
              "line": 10,
              "column": 72
            }
          },
          "moduleName": "dummy/screens/examples/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Infinite Scroll");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 18
            },
            "end": {
              "line": 13,
              "column": 72
            }
          },
          "moduleName": "dummy/screens/examples/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Flexible Layout");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 18
            },
            "end": {
              "line": 17,
              "column": 72
            }
          },
          "moduleName": "dummy/screens/examples/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Scrollable Body");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 31,
            "column": 0
          }
        },
        "moduleName": "dummy/screens/examples/index/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Demos");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-4");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n                  ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-8 bg-success");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Don't see what you're looking for?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                If you think you need to support a behavior and are unsure if\n                smoke-and-mirrors can handle the situation, open an issue or\n                ask on the #smoke-and-mirrors channel on the ember-community slack.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2, 1, 1, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [7]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["examples.dbmon"],[],0,null,["loc",[null,[7,18],[7,64]]]],
        ["block","link-to",["examples.infinite-scroll"],[],1,null,["loc",[null,[10,18],[10,84]]]],
        ["block","link-to",["examples.flexible-layout"],[],2,null,["loc",[null,[13,18],[13,84]]]],
        ["block","link-to",["examples.scrollable-body"],[],3,null,["loc",[null,[17,18],[17,84]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  }()));

});
define('dummy/screens/examples/infinite-scroll/components/number-slide/component', ['exports', 'ember', 'dummy/screens/examples/infinite-scroll/components/number-slide/template'], function (exports, Ember, layout) {

  'use strict';

  var SafeString = Ember['default'].Handlebars.SafeString;

  var Component = Ember['default'].Component;
  var computed = Ember['default'].computed;

  var base = 255 * 255 * 255;

  function setOrder(number, rgb) {
    var point = base / 6;
    if (number <= point) {
      return rgb;
    }
    if (number <= point * 2) {
      return {
        r: rgb.r,
        g: rgb.b,
        b: rgb.g
      };
    }
    if (number <= point * 3) {
      return {
        r: rgb.b,
        g: rgb.r,
        b: rgb.g
      };
    }
    if (number <= point * 4) {
      return {
        r: rgb.g,
        g: rgb.r,
        b: rgb.b
      };
    }
    if (number <= point * 5) {
      return {
        r: rgb.b,
        g: rgb.g,
        b: rgb.r
      };
    }
    return {
      r: rgb.g,
      g: rgb.b,
      b: rgb.r
    };
  }

  function numberToRGB(number) {
    var num = number;
    number += 385;
    var r = number > 255 ? 255 : number;
    number = r === 255 ? number - 255 : 0;
    var g = number > 255 ? 255 : number;
    var b = g === 255 ? number - 255 : 0;

    return setOrder(num * 16000, {
      r: r, g: g, b: b
    });
  }

  exports['default'] = Component.extend({
    tagName: 'number-slide',
    attributeBindings: ['style'],
    style: computed('number', function () {
      var num = parseInt(this.get('number'), 10);
      if (num < 0) {
        num = 380 + num;
      }
      var c = numberToRGB(num);
      var b = {
        r: 255 - c.r,
        g: 255 - c.g,
        b: 255 - c.b
      };
      return new SafeString('background: rgb(' + c.r + ',' + c.g + ',' + c.b + '); color: rgb(' + b.r + ',' + b.g + ',' + b.b + ');');
    }),
    layout: layout['default'],
    index: 0,
    number: 0
  });

});
define('dummy/screens/examples/infinite-scroll/components/number-slide/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 36
          }
        },
        "moduleName": "dummy/screens/examples/infinite-scroll/components/number-slide/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","number");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","index");
        var el2 = dom.createTextNode("(");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(")");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        return morphs;
      },
      statements: [
        ["content","number",["loc",[null,[1,20],[1,30]]]],
        ["content","index",["loc",[null,[2,20],[2,29]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/screens/examples/infinite-scroll/controller', ['exports', 'ember', 'dummy/lib/get-numbers'], function (exports, Ember, getNumbers) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({

    numImages: 5,

    actions: {

      loadAbove: function loadAbove() {
        // console.info('LOAD ABOVE: ' + (new Date()).getTime());
        var first = this.get('model.first');
        var numbers = getNumbers['default'](first - 20, 20);
        var model = this.get('model.numbers');
        var newModel = numbers.concat(model);
        this.set('model.numbers', newModel);
        this.set('model.first', first - 20);
      },

      loadBelow: function loadBelow() {
        // console.info('LOAD BELOW: ' + (new Date()).getTime());
        var last = this.get('model.last');
        var numbers = getNumbers['default'](last, 20);
        var model = this.get('model.numbers');
        var newModel = model.concat(numbers);
        this.set('model.numbers', newModel);
        this.set('model.last', last + 20);
      }

    }

  });

});
define('dummy/screens/examples/infinite-scroll/route', ['exports', 'ember', 'dummy/lib/get-numbers'], function (exports, Ember, getNumbers) {

  'use strict';

  var Route = Ember['default'].Route;

  exports['default'] = Route.extend({

    model: function model() {
      return {
        numbers: getNumbers['default'](0, 20),
        first: 0,
        last: 20
      };
    },

    actions: {
      willTransition: function willTransition() {
        this.controller.set('model', null);
      }
    }

  });

});
define('dummy/screens/examples/infinite-scroll/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 14
            },
            "end": {
              "line": 19,
              "column": 14
            }
          },
          "moduleName": "dummy/screens/examples/infinite-scroll/template.hbs"
        },
        isEmpty: false,
        arity: 2,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","image-slide");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","examples/infinite-scroll/components/number-slide",[],["number",["subexpr","@mut",[["get","item.number",["loc",[null,[17,78],[17,89]]]]],[],[]],"index",["subexpr","@mut",[["get","index",["loc",[null,[17,96],[17,101]]]]],[],[]]],["loc",[null,[17,20],[17,103]]]]
        ],
        locals: ["item","index"],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 41,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/examples/infinite-scroll/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Demo");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","table-wrapper dark");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Infinite Scroll");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The Vertical Collection can be used to quickly build a robust infinite scroll.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n              Your infinite scroll can be bi-directional, loading new content above or\n              below.\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n              Combined with `idForFirstItem`, this makes it very easy to load a user\n              in-media-res: ideal for caching their position in a long feed for when\n              they return.\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Code for Demo");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 4]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),11,11);
        return morphs;
      },
      statements: [
        ["block","vertical-collection",[],["content",["subexpr","@mut",[["get","model.numbers",["loc",[null,[8,24],[8,37]]]]],[],[]],"defaultHeight",270,"alwaysUseDefaultHeight",true,"useContentProxy",false,"firstReached","loadAbove","lastReached","loadBelow"],0,null,["loc",[null,[7,14],[19,38]]]],
        ["inline","code-snippet",[],["name","infinite-scroll-example.hbs"],["loc",[null,[38,10],[38,61]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('dummy/screens/examples/scrollable-body/controller', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({

    numImages: 10,

    actions: {

      loadAbove: function loadAbove() {
        var images = getImages['default'](10);
        var model = this.get('model.images');
        var newModel = images.concat(model);
        this.set('model.images', newModel);
      },

      loadBelow: function loadBelow() {
        var images = getImages['default'](10);
        var model = this.get('model.images');
        var newModel = model.concat(images);
        this.set('model.images', newModel);
      }

    }

  });

});
define('dummy/screens/examples/scrollable-body/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Route = Ember['default'].Route;

  exports['default'] = Route.extend({

    model: function model() {
      return { images: getImages['default'](10) };
    }

  });

});
define('dummy/screens/examples/scrollable-body/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 10
            },
            "end": {
              "line": 16,
              "column": 12
            }
          },
          "moduleName": "dummy/screens/examples/scrollable-body/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","image-slide");
          var el2 = dom.createTextNode("\n                  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","async-image",[],["src",["subexpr","@mut",[["get","image.small",["loc",[null,[14,36],[14,47]]]]],[],[]]],["loc",[null,[14,18],[14,49]]]]
        ],
        locals: ["image"],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 25,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/examples/scrollable-body/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-7");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-5");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Scrolling based on the whole page.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Code for Demo");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),5,5);
        return morphs;
      },
      statements: [
        ["block","vertical-collection",[],["content",["subexpr","@mut",[["get","model.images",["loc",[null,[6,20],[6,32]]]]],[],[]],"defaultHeight",270,"alwaysUseDefaultHeight",true,"containerSelector","body","lastReached","loadBelow"],0,null,["loc",[null,[5,10],[16,36]]]],
        ["inline","code-snippet",[],["name","scrollable-body-example.hbs"],["loc",[null,[22,10],[22,61]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('dummy/screens/index/controller', ['exports', 'ember', 'dummy/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({
    version: config['default'].VERSION,
    emberVersion: Ember['default'].VERSION
  });

});
define('dummy/screens/index/route', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var Route = Ember['default'].Route;

	exports['default'] = Route.extend({});

});
define('dummy/screens/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 51,
            "column": 0
          }
        },
        "moduleName": "dummy/screens/index/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Overview");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        var el2 = dom.createTextNode("\n    Sometimes being \"ambitious\" gets you in trouble. When it does, Smoke-and-mirrors is here to put out your Ember fire.\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-4");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Updates");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n              ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"class","bg-primary");
        var el6 = dom.createTextNode("\n                  This repo is currently running smoke-and-mirrors ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" against Ember ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n              ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"class","bg-success");
        var el6 = dom.createTextNode("\n                0.4.0 and 0.4.1 were release on Wednesday, October 28. Blog posts coming shortly on ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","https://blog.runspired.com");
        var el7 = dom.createTextNode("Runspired.com");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(".\n            ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n              ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"class","bg-warning");
        var el6 = dom.createTextNode("\n                 Because of the complicated (but ultimately highly successful) nature of the internal scroll\n                  handling rewrite, 0.4.x is primarily a compendium of bugfixes with few new features. Because\n                  of this, there will now be a 0.5 series prior to 1.0 in which the remaining features slated\n                  for 0.4 will land.  0.5 is scheduled for Wednesday, November 11th. You can ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","https://github.com/runspired/smoke-and-mirrors/milestones/0.5.0");
        var el7 = dom.createTextNode("follow it here");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(".\n              ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n              ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"class","bg-info");
        var el6 = dom.createTextNode("\n                  1.0 is now scheduled for release on Wednesday, November 25th.\n                  A blog post will accompany the release on ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","https://blog.runspired.com");
        var el7 = dom.createTextNode("Runspired.com");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n              ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-6 col-sm-offset-1");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Philosophy");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n              Every component, service, mixin, and primitive offered in this library has been designed with\n                two goals in mind.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ol");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("Large, high performance Javascript applications should be easy to build.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("Performance should not sacrifice flexibility.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n               Smoke and Mirrors will try it's best to allow you to keep the conventions, structures,\n                and layouts you want.  If you can't figure out how to do something you want to do,\n                open an issue, and either we will point you to an existing demo, or create a new one.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                If you're a member of the ember-community slack, you can also ask questions in the\n                #smoke-and-mirrors channel.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4, 1, 1, 3, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element0,1,1);
        morphs[1] = dom.createMorphAt(element0,3,3);
        return morphs;
      },
      statements: [
        ["content","version",["loc",[null,[11,67],[11,78]]]],
        ["content","emberVersion",["loc",[null,[11,93],[11,109]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/screens/services/in-viewport/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Route = Ember['default'].Route;
  var RSVP = Ember['default'].RSVP;

  exports['default'] = Route.extend({

    model: function model() {
      return RSVP.hash({
        images: getImages['default'](200)
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('attrs', model);
    }

  });

});
define('dummy/screens/services/in-viewport/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/services/in-viewport/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-12");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("In Viewport");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                Inject the in-viewport service to a component.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-4");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-8");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 3, 3]),1,1);
        return morphs;
      },
      statements: [
        ["inline","code-snippet",[],["name","in-viewport-mixin-usage.js"],["loc",[null,[14,8],[14,58]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/screens/services/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 6
            },
            "end": {
              "line": 4,
              "column": 52
            }
          },
          "moduleName": "dummy/screens/services/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("In Viewport");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 54
            }
          },
          "moduleName": "dummy/screens/services/index/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Photo Loader");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 5
          }
        },
        "moduleName": "dummy/screens/services/index/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Services");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["services.in-viewport"],[],0,null,["loc",[null,[4,6],[4,64]]]],
        ["block","link-to",["services.photo-loader"],[],1,null,["loc",[null,[7,6],[7,66]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('dummy/screens/services/photo-loader/route', ['exports', 'ember', 'dummy/lib/get-images'], function (exports, Ember, getImages) {

  'use strict';

  var Route = Ember['default'].Route;
  var RSVP = Ember['default'].RSVP;

  exports['default'] = Route.extend({

    model: function model() {

      var images = getImages['default'](1);

      return RSVP.hash({
        imageTitle: 'Is this Art?',
        imageSrc: images[0].small,
        imageAlt: 'Artistic License Example',
        imagePlaceholder: ''
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('attrs', model);
    }

  });

});
define('dummy/screens/services/photo-loader/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 34,
            "column": 6
          }
        },
        "moduleName": "dummy/screens/services/photo-loader/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-12");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Async Image");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The async-image component renders an `img` tag with no additional markup.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                The image waits until it's source has been pre-loaded to render so that you\n                don't show partially loaded images to your users.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                If the source changes or the component is torn down, the image src changes\n                to a transparent 1px placeholder while the new image is fetched and during\n                teardown to preserve memeory and prevent 404 errors from ghost network\n                requests resulting from the blank source.\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-4");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-8");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),2,2);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        return morphs;
      },
      statements: [
        ["inline","async-image",[],["src",["subexpr","if",[["get","attrs.imageSrc",["loc",[null,[24,20],[24,34]]]],["get","attrs.imageSrc",["loc",[null,[24,35],[24,49]]]],["get","attrs.imagePlaceholder",["loc",[null,[24,50],[24,72]]]]],[],["loc",[null,[24,16],[24,73]]]],"alt",["subexpr","@mut",[["get","attrs.imageAlt",["loc",[null,[25,16],[25,30]]]]],[],[]],"title",["subexpr","@mut",[["get","attrs.imageTitle",["loc",[null,[26,18],[26,34]]]]],[],[]]],["loc",[null,[23,10],[27,12]]]],
        ["inline","code-snippet",[],["name","async-image-usage-example.hbs"],["loc",[null,[31,8],[31,61]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/services/in-viewport', ['exports', 'smoke-and-mirrors/services/in-viewport'], function (exports, Service) {

	'use strict';

	exports['default'] = Service['default'];

});
define('dummy/services/local-sync', ['exports', 'smoke-and-mirrors/services/local-sync'], function (exports, local_sync) {

	'use strict';



	exports['default'] = local_sync['default'];

});
define('dummy/services/storage', ['exports', 'smoke-and-mirrors/services/storage'], function (exports, storage) {

	'use strict';



	exports['default'] = storage['default'];

});
define('dummy/snippets', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    "async-image-usage-example.hbs": "          {{async-image\n            src=(if attrs.imageSrc attrs.imageSrc attrs.imagePlaceholder)\n            alt=attrs.imageAlt\n            title=attrs.imageTitle\n          }}",
    "dbmon-example.hbs": "                <div class=\"table-wrapper\">\n                    <table class=\"table table-striped latest-data\">\n                      {{#vertical-collection\n                        tagName=\"tbody\"\n                        content=model.databases\n                        defaultHeight=37\n                        bufferSize=0.5\n                        alwaysUseDefaultHeight=true\n                        containerSelector=\".table-wrapper\"\n                        key=\"id\"\n                        as |db|\n                      }}\n                        {{examples/dbmon/components/dbmon-row tagName=\"\" db=db}}\n                      {{/vertical-collection}}\n                    </table>\n                </div>",
    "flexible-layout-example.hbs": "            <div class=\"table-wrapper\">\n              {{#vertical-collection\n                content=model.images\n                defaultHeight=300\n                alwaysUseDefaultHeight=false\n                visibleBuffer=2\n                useContentProxy=false\n                lastReached=\"loadBelow\"\n                as |image|\n              }}\n                  <div class=\"image-slide flexible\">\n                    {{async-image src=image.small}}\n                  </div>\n              {{/vertical-collection}}\n            </div>",
    "infinite-scroll-example.hbs": "            <div class=\"table-wrapper dark\">\n              {{#vertical-collection\n                content=model.numbers\n                defaultHeight=270\n                alwaysUseDefaultHeight=true\n                useContentProxy=false\n                firstReached=\"loadAbove\"\n                lastReached=\"loadBelow\"\n                as |item index|\n              }}\n                  <div class=\"image-slide\">\n                    {{examples/infinite-scroll/components/number-slide number=item.number index=index}}\n                  </div>\n              {{/vertical-collection}}\n            </div>",
    "pre-render-usage-example.hbs": "              {{#pre-render\n                parent=renderIntoElement\n                renderInParent=shouldRenderIntoElement\n                didPreRender=(action \"displayDimensions\")\n                class=\"display-inline col-xs-4\"\n              }}\n                {{async-image\n                  class=\"auto-size\"\n                  src=(if attrs.imageSrc attrs.imageSrc attrs.imagePlaceholder)\n                  alt=attrs.imageAlt\n                  title=attrs.imageTitle\n                }}\n              {{/pre-render}}\n              <div id=\"renderIntoMe1\"\n                   style=\"width: 100px; height: 100px;\"\n                   class=\"display-inline\"></div>\n              <div id=\"renderIntoMe2\"\n                   style=\"width: 75px; height: 75px;\"\n                   class=\"display-inline\"></div>",
    "scrollable-body-example.hbs": "          {{#vertical-collection\n            content=model.images\n            defaultHeight=270\n            alwaysUseDefaultHeight=true\n            containerSelector=\"body\"\n            lastReached=\"loadBelow\"\n            as |image|\n            }}\n                <div class=\"image-slide\">\n                  {{async-image src=image.small}}\n                </div>\n            {{/vertical-collection}}",
    "vertical-collection-defaults-example.js": "{\n  // basics (item will tagMatch)\n  tagName: 'vertical-collection',\n  itemTagName: 'vertical-item',\n\n  // required\n  content: null,\n  defaultHeight: 75, //Integer: attempts to work with em, rem, px\n\n  // performance\n  useContentProxy: false,\n  key: '@identity',\n  alwaysUseDefaultHeight: false,\n  bufferSize: 1,\n  resizeDebounce: 64,\n  // exposeAttributeState: false, currently disabled entirely,\n  //     pending outcome of recycling implementation in 0.5\n\n  // actions\n  firstReached: null,\n  lastReached: null,\n  firstVisibleChanged: null,\n  lastVisibleChanged: null,\n  didMountCollection: null,\n\n  // initial state\n  scrollPosition: 0,\n  idForFirstItem: null,\n  renderFromLast: false,\n  renderAllInitially: false,\n  shouldRender: true,\n\n  // scroll setup\n  minimumMovement: 15,\n  containerSelector: null,\n  containerHeight: null\n}"
  };

});
define('dummy/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 10
          }
        },
        "moduleName": "dummy/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1,"id","title");
        var el2 = dom.createTextNode("Welcome to Ember.js");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[3,0],[3,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('dummy/templates/components/code-snippet', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "dummy/templates/components/code-snippet.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","source",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('dummy/config/environment', ['ember'], function(Ember) {
  var prefix = 'dummy';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("dummy/tests/test-helper");
} else {
  require("dummy/app")["default"].create({"LOG_LFANIMATION_RESOLUTION":false,"debugMode":false,"LOG_ACTIVE_GENERATION":false,"LOG_BINDINGS":false,"LOG_RESOLVER":false,"LOG_STACKTRACE_ON_DEPRECATION":false,"LOG_TRANSITIONS":false,"LOG_TRANSITIONS_INTERNAL":false,"LOG_VERSION":false,"LOG_VIEW_LOOKUPS":false,"name":"smoke-and-mirrors","version":"0.4.4+10d3cfd8"});
}

/* jshint ignore:end */
