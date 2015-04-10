import Ember from "ember";
import CacheableView from "../views/cache-container";

export default CacheableView.extend({

  view : Ember.View.extend({
    templateName : 'dbmon-proxied-each'
  })

});
