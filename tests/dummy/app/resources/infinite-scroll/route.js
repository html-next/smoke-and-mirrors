import Ember from 'ember';
import getImages from '../../lib/get-images';


export default Ember.Route.extend({

  model: function() {
    return getImages(10);
  }

});
