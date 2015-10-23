export default
  /*!- BEGIN-SNIPPET vertical-collection-defaults-example */
{
  // basics (item will tagMatch)
  tagName: 'vertical-collection',
  itemTagName: 'vertical-item',

  // required
  content: null,
  defaultHeight: 0,

  // performance
  useContentProxy: false,
  key: '@identity',
  alwaysUseDefaultHeight: false,
  visibleBuffer: 1,
  invisibleBuffer: 1,
  scrollThrottle: 16,
  exposeAttributeState: false,

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
  minimumMovement: 25,
  shouldGPUAccelerate: true,
  containerSelector: null,
  containerHeight: null
}
/*!- END-SNIPPET vertical-collection-defaults-example */
;
