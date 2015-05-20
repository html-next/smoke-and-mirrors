import OcclusionCollection from "../components/occlusion-collection/occlusion-collection.component";

/*
@method each
@for Ember.Handlebars.helpers
  @param [name] {String} name for item (used with `in`)
  @param [path] {String} path
@param [options] {Object} Handlebars key/value pairs of options
@param [options.itemViewClass] {String} a path to a view class used for each item
@param [options.emptyViewClass] {String} a path to a view class used for each item
@param [options.itemController] {String} name of a controller to be created for each item
*/
function occlusionCollectionHelper(params, hash, options, env) {

  console.log('helper', arguments);

  var view = env.data.view;
  var helperName = 'occlusion-collection';
  var path = params[0] || view.getStream('');

  var blockParams = options.template && options.template.blockParams;

  if (blockParams) {
    hash.keyword = true;
    hash.blockParams = blockParams;
  }

  hash.dataSource = path;
  options.helperName = options.helperName || helperName;

  return env.helpers.collection.helperFunction.call(this, [OcclusionCollection], hash, options, env);
}

export default occlusionCollectionHelper;
