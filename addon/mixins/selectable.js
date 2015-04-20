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
  computed,
  copy,
  run,
  A,
  isArray,
  assert,
  $
  } = Ember;

const {
  next
} = run;


export default Mixin.extend(MagicArrayMixin, {

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
  _selected: null,

  /**!
   * If true, updates to selected will not be propagated back.
   */

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
      return A();
    }

    // assert we have an array
    assert("Supplied `content` for 'x-select' must be an array.", isArray(content));

    // wrap the array with NativeArray extensions
    _controlled = A(content);

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
      var groups = A();

      _controlled.forEach(function (item) {
        var label = get(item, groupPath);
        if (!groupHash.hasOwnProperty(label)) {
          groupHash[label] = { label: label, contentToProxy: A() };
          groups.addObject(groupHash[label]);
        }
        groupHash[label].content.addObject(item);
      });

      return groups;
    }

    return _controlled;

  }),

  /**!
   * If true the last remaining value cannot be toggled off.
   */
  enforceOne: null,

  /**!
   * Property accessor to sort the array by before grouping
   * Multiple selectors can be used separated by spaces.
   */
  sortBy: null,

  /**!
   * A function with which to filter the array. The function
   * will receive an item from the array and should return a
   * boolean value indicating whether the item should be included.
   */
  filter: null,

  /**!
   * The path to the label for an item
   * (must start with content)
   */
  optionLabelPath: 'content',
  _labelPath: '',

  /**!
   * The path to the value for an item
   * (must start with content)
   */
  optionValuePath: 'content',
  _valuePath: '',

  /**!
   * The path to a secondary label for an item
   * (must start with content)
   */
  optionSecondaryLabelPath: false,

  /**!
   * The path to a property that serves as both a label
   * and a grouping mechanism to group the items in the array.
   *
   * The array will be filtered and sorted before it is grouped,
   * group labels will appear in the order that they occur in the
   * sorted content.
   */
  optionGroupPath: null,

  /**!
   * (optional) The name of a view class to use for the group.
   * This is optional even when using groups.  The default class
   * will tag match it's parent.
   *
   * If overridden, the view should expect to receive an object
   * containing `label` and `content`.  `content` is the outcome
   * of a MagicArray proxy.
   */
  groupViewClass: null,
  optionViewClass: null,

  actions: {

    toggleSelection: function (object) {

      // toggle presence in selected array
      if (this.get('multiple')) {

        var selected = this.get('_selected');
        if (selected.indexOf(object)) {
          selected.removeObject(object);
        } else {
          selected.addObject(object);
        }

        // toggle selection
      } else {
        if (this.get('_selected') !== object || this.get('enforceOne')) {
          this.set('_selected', object);
        }
      }
      return false;
    }

  },


  init: function() {

    this._super();

    var isMultiple = this.get('multiple');
    var selected = this.get('selected');
    var unidirectional = this.get('unidirectional');
    var valuePath = this.get('optionValuePath').replace(/^content\.?/, '');
    var labelPath = this.get('optionLabelPath').replace(/^content\.?/, '');

    // set _labelPath and _valuePath
    this.set('_labelPath', labelPath);
    this.set('_valuePath', valuePath);

    // ensure `selected` is a `NativeArray` if `multiple=true`
    if (isMultiple) {
      if (!isArray(selected)) {
        if (selected) {
          this.set('selected', A([selected]));
        } else {
          this.set('selected', A());
        }
      }

      // ensure `selected` is not an array if `multiple=false`
    } else {
      assert("`selected` should not be an array if `multiple=false`.", !isArray(selected));
    }

    // setup unidirection flow if desired
    if (!unidirectional) {
      this.set('_selected', computed.alias('selected'));
    } else {
      this.set('_selected', copy(selected, true));
    }

  }

});
