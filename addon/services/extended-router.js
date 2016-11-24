import Ember from 'ember';

const {
  computed,
  observer,
  Service,
  inject
  } = Ember;

export default Service.extend({
  history: null
});


/*
 export default Service.extend({
 router: computed(function() {
 return this.container.lookupFactory('router:main');
 }),
 service: inject.service('router'),
 '-service': inject.service('-router'),

 history: null,

 path: null,
 name: null,
 route: null,
 url: null,
 title: null,
 meta: {
 shortcut: null,

 },

 transitionTo: function() {
 let route = this.get('application');
 route.transitionTo.apply(route, arguments);
 },
 /*
 url: computed('router.urlHistory.[]', function() {
 let urls = this.get('router.urlHistory');
 let last = urls ? urls.objectAt(urls.get('length') - 1) : '';
 return last ? last.url : '';
 }).readOnly(),


 setTitle: observer('title', function() {
 window.document.title = this.get('title');
 })

 });

 var Router = Ember.Router.extend({

 location: config.locationType,

 urlHistory : [],

 /*
 Provide the ability to retrieve urls from history
 by adding new urls to urlHistory when the route
 changes

 updateUrlHistory: observer('_location', 'url', 'location', function() {
 schedule('afterRender', this, function() {
 var location = this.get('_location') || this.get('location');
 var url = location.lastSetURL || this.get('url');
 this.get('urlHistory').pushObject({ url : url});
 });
 })

 });

 /*
 export default {
 name: "router",
 after: "store",

 initialize: function (registry, application) {
 application.inject('controller:application', 'router', 'router:main');
 application.inject('service:router-extended', 'router', 'router:main');
 application.inject('service:router-extended', 'application', 'route:application');
 }

 };

 export default Route.extend({

 routerExt: inject.service('router-extended'),

 afterModel() {
 this._super.apply(this, arguments);
 window.scrollTo(0, 0);
 this.set('routerExt.currentRoute', this);
 },

 actions: {

 willTransition() {
 blurAll();
 },

 didTransition() {
 this.set('routerExt.currentRouteName', this.get('routeName'));
 }

 }

 });
 */
