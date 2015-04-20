import Ember from "ember";
import TextInput from "../text-input/component";
import Tag from "./tag/component";
import {
  Selectable,
  SelectableOption,
  Group
  } from "../selectable-input/component";

var set = Ember.set,
    get = Ember.get,
    indexOf = Ember.EnumerableUtils.indexOf;

/**
 @class Autocomplete
 @namespace Ember
 @extends Ember.View
 */
export default Selectable.extend({

    //structure
    classNames      :   ['autocomplete'],
    classNameBindings : ['_isFocused:focused:'],
    placeholder     :   'Search...',
    autofocus       :   false,

    layoutName : 'components/autocomplete-input',

    Tag : Tag,

    /**
     * Allows us to edit the text field without automatically updating
     *  the value
     *
     * @property {String} _searchValue
     * @private
     * @default ''
     */
    _searchValue : '',


    allowRepeatedValues : false,


    /**
     * If true, it becomes impossible to null the field.  Leaving it blank will revert it to
     * the last valid value, else the first value available.
     *
     * @property {Boolean} enforceOne
     * @default false
     */
    enforceOne : false,

    /**
     *
     */
    /*
     contentChangeObserver : function () {


     var _searchValue = this.get('_searchValue'),
     selection = this.get('controlledSelection.[]'),
     options = this.get('filteredContent'),
     enforce = this.get('enforceOne'),
     label = this.get('optionLabelPath').replace(/^content\.?/, '');

     if (enforce && !selection.length && options.length) {
     selection.addObject(options.objectAt(0));
     }

     }.observes('content'),
     */

    /**

     */
    labelsChangeObserver : function () {
        var labels = get(this, 'labels.[]'),
            multiple = get(this, 'multiple');

        if (!multiple && labels.objectAt(0)) {
            set(this, '_searchValue', labels.objectAt(0));
        } else {
            set(this, '_searchValue', '');
        }
    }.observes('labels', 'controlledSelection.@each').on('didInsertElement'),


    /**
     *
     * True when the textInput has focus.
     * To focus the textInput on initialization set `autofocus` to `true`
     *
     * @property {Boolean} _isFocused
     * @private
     * @default false
     */
    _isFocused : false,

    //TODO DEPRECATE? Not sure this is used for anything anymore
    _isHovered : false,

    /**
     * The option to which a 'pre-selection' hovered state is given
     * when the user utilizes up or down arrow keys to pick an option.
     *
     * @property {Object} _hoveredOption
     * @private
     * @default null
     */
    _hoveredOption : null,

    /**
     * An internal cache of the input element to be used for focus/blur events
     * out of the scope of the input element itself.
     *
     * TODO The need to capture keydown is because a full click will cause a blur, with
     * undesired consequences.  We could add a boolean to track the type of blur
     * to do the same since mousedown won't work as nicely converted to tap.
     *
     * @property {HTMLElement} _textInputElement
     * @private
     */
    _textInputElement : null,

    /**
     The view class for textfield

     @property textInput
     @type Ember.TextField
     @default As defined below.
     */
    textInput : TextInput.extend(Ember.TargetActionSupport, {

        keyDown : function (e) {

            var options, last, index, newIndex,
                selected,
                currentString = get(this, 'value');

            if (e.keyCode === 8 && get(this, 'parentView.multiple') && currentString === '') {
                selected = get(this, 'parentView.controlledSelection');
                selected.removeObject(selected.objectAt(selected.length - 1));
            } else if (e.keyCode === 13) { //return

                this.triggerAction({
                    action : 'select',
                    actionContext : get(this, 'parentView._hoveredOption'),
                    target : this.get('parentView'),
                    bubbles : false
                });

                //focus forward
                if (!get(this, 'parentView.multiple')) {
                    Ember.$(":input:eq(" + Ember.$(":input").index(this.$()) + 1 + ")").focus();
                } else {
                    //TODO tag it
                }

                return false;

            } else if (get(this, 'parentView.multiple') && [188, 13].contains(e.keyCode)) {

                //32 space shouldn't work since many items will have spaces
                //return, space or comma: tab key should still be passed through to allow context switching
                set(this, 'parentView.value', get(this, 'parentView._hoveredOption'));
                return false;

            } else if (e.keyCode === 40) { //arrow down

                options = get(this, 'parentView.filteredContent');
                last = options.length - 1;
                index = indexOf(
                    options,
                    get(this, 'parentView._hoveredOption')
                );
                newIndex = (index === last) ? last : index + 1;

                set(
                    this,
                    'parentView._hoveredOption',
                    options.objectAt(newIndex)
                );
                return false;

            } else if (e.keyCode === 38) { //arrow up

                options = this.get('parentView.filteredContent');
                index = indexOf(
                    options,
                    this.get('parentView._hoveredOption')
                );
                newIndex = (index === 0) ? 0 : index - 1;

                set(
                    this,
                    'parentView._hoveredOption',
                    options.objectAt(newIndex)
                );
                return false;

            } else { //any other key
                this.set(
                    'parentView._hoveredOption',
                    this.get('parentView.filteredContent').objectAt(0)
                );
            }

        },

        focusOut : function () {

            set(this, 'parentView._isFocused', false);

            if (get(this, 'parentView.enforceOne')) {
                if (!get(this, 'parentView.controlledSelection.length')) {
                    set(this, 'parentView.value', get(this, 'parentView._hoveredOption'));
                }
            } else {
                /*this.triggerAction({
                 action: 'change',
                 context : {
                 value : get(this, 'value'),
                 view : get(this, 'parentView')
                 },
                 target : 'parentView'
                 });*/
            }

        },

        focusIn : function () {
            set(this, 'parentView._isFocused', true);
        },

        autofocus : false,

        setupWithElement : function () {

            if (this.get('autofocus')) {
                this.$().focus();
            }

            set(this, 'parentView._textInputElement', this.$());
        }.on('didInsertElement')
    }),

    matchNoneOnEmpty : false,

    filteredContent : function () {

        var _searchValue = get(this, '_searchValue'),
            content = get(this, 'controlledContent.[]'),
            selection = get(this, 'controlledSelection.[]'),
            multiple = get(this, 'multiple'),
            allowRepeatedValues = get(this, 'allowRepeatedValues'),
            label = get(this, 'optionLabelPath').replace(/^content\.?/, ''),
            regex = new RegExp(_searchValue, 'i'),
            matchNoneOnEmpty = this.get('matchNoneOnEmpty'),
            opts;

        if (!content) {
            return [];
        }

        if (!_searchValue) {
            if (selection['0']) {
                return selection;
            } else if (matchNoneOnEmpty) {
                return [];
            } else {
                return content;
            }
        }

        opts = content.filter(
            function (option) {
                if (multiple && !allowRepeatedValues && indexOf(selection, option) > -1) {
                    return false;
                }
                return get(option, label) ? get(option, label).match(regex) : false;
            }
        );

        set(this, '_hoveredOption', opts[0]);

        return opts;

    }.property('_searchValue', 'controlledContent', 'controlledSelection.@each', 'controlledContent.@each'),

    groupView : Group.extend({

        _hoveredOptionBinding : 'parentView._hoveredOption',

        _textInputElementBinding : 'parentView._textInputElement',

        classNames : ['autocompleteGroup']


    }),
    /**
     The view class for option.

     @property optionView
     @type Ember.View
     @default As defined below.
     */
    optionView : SelectableOption.extend({

        classNames : ['autocompleteOption'],
        classNameBindings : ['hovered'],

        hovered : function () {
            var content = get(this, 'content'),
                hovered = get(this, 'parentView._hoveredOption');

            return content === hovered;

        }.property('content', 'parentView._hoveredOption').readOnly()

    })

});
