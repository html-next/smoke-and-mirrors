import Ember from "ember";
import MagicArrayMixin from "./magic-array";
import ProxiedGroup from "../utils/group-proxy";

const isFunction = function isFunction(fn) {
  return typeof fn === 'function';
};

const isString = function isString(str) {
  return typeof str === 'string';
};

const {
  get: get,
  Component,
  computed,
  on,
  run,
  isArray,
  assert,
  $
  } = Ember;

const {
  indexOf,
  filter,
  forEach
  } = Ember.EnumerableUtils;

const {
  scheduleOnce,
  debounce,
  bind,
  next
  } = run;


export default Mixin.extend(MagicArrayMixin, {

  tagName: 'x-select',
  attributeBindings: ['disabled'],

  /**!
   * Indicates whether multiple options can be selected.
   *
   * @property {Boolean} multiple
   * @default false
   */
  multiple: false,

  /**!
   * The `disabled` attribute of the input element. Indicates whether
   * the element is disabled from interactions.
   *
   * @property {Boolean} disabled
   * @default false
   */
  disabled: false,

  /**!
   * The list of options.
   *
   * If `optionLabelPath` and `optionValuePath` are not overridden, this should
   * be a list of strings, which will serve simultaneously as labels and values.
   *
   * Otherwise, this should be a list of objects.
   *
   * @property {Array} content
   * @default null
   */
  content: null,

  /**!
   * When `multiple` is `false`, an item in `content` that is currently
   * selected, if any.
   *
   * When `multiple` is `true`, an array of such items.
   *
   * @property selected
   * @type Object or Array
   * @default null
   */
  selected: null,

  /**!
   * Action to trigger when the selection's value changes.
   */
  onchange: '',

  /**!
   * Filters and groups content as necessary.  The array output
   * by this computed property is consumed by the ArrayProxy.
   */
  _controlledContent: computed('content', 'content.@each', function filterAndGroupContent() {

    var content = this.get('content');
    var filterMethod = this.get('filter');
    var sortByProperties = this.get('sortBy');
    var groupPath = this.get('optionGroupPath');
    var _controlled;

    // bail if empty
    if (!content) {
      return Ember.A();
    }

    // assert we have an array
    assert("Supplied `content` for 'x-select' must be an array.", isArray(content));

    // wrap the array with NativeArray extensions
    _controlled = Ember.A(content);

    // filter the array if desired
    if (filterMethod) {
      // assert filter is a function
      assert("Supplied `filter` for 'x-select' must be a function that returns a boolean.", isFunction(filterMethod));
      _controlled = _controlled.filter(filterMethod);
    }

    // sort the array if desired
    if (sortByProperties) {
      // assert sortBy is a string
      assert("Supplied `sortBy` for 'x-select' must be a string of property accesssor(s).", isString(sortByProperties));
      _controlled = _controlled.sortBy(sortByProperties);
    }

    // group items in the array if desired
    if (groupPath) {

      // hash of values grouped by label
      var groupHash = {};
      var groups = Ember.A();

      _controlled.forEach(function (item) {
        var label = get(item, groupPath);
        if (!groupHash.hasOwnProperty(label)) {
          groupHash[label] = ProxiedGroup.create({ label: label, content: Ember.A() });
          groups.addObject(groupHash[label]);
        }
        groupHash[label].content.addObject(item);
      });

      return groups;
    }

    return _controlled;

  }),

  enforceOne: null,
  optionLabelPath: 'content',
  optionValuePath: 'content',
  optionSecondaryLabelPath: false,
  sortBy: null,
  optionGroupPath: null,
  filter: null,
  groupViewClass: null,
  optionViewClass: null,

  actions: {

    toggleSelection: function (object) {

      // toggle presence in selected array
      if (this.get('multiple')) {

        var selected = this.get('selected');
        if (selected.indexOf(object)) {
          selected.removeObject(object);
        } else {
          selected.addObject(object);
        }

        // toggle selection
      } else {
        if (this.get('selected') !== object || this.get('enforceOne')) {
          this.set('selected', object);
        }
      }
      return false;
    }

  },


  init: function() {
    // ensure `selected` is a `NativeArray` if `multiple=true`
    // ensure `selected` is not an array if `multiple=false`
    // set _labelPath and _valuePath
    // _super
  }

});
