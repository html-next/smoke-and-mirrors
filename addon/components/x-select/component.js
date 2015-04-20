import Ember from "ember";

import SelectableView from "./option/component";
import SelectableMixin from "../../mixins/selectable";

export default Ember.Component.extend(SelectableMixin, {
  tagName: 'x-select',
  optionView: OptionView
});
