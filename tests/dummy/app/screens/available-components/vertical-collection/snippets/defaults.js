export default
  /* !- BEGIN-SNIPPET vertical-collection-defaults-example */
  {
  // basics (item will tagMatch)
    tagName: 'vertical-collection',
    itemTagName: 'vertical-item',

  // required
    content: null,
    defaultHeight: 75, // Integer: attempts to work with em, rem, px

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
/* !- END-SNIPPET vertical-collection-defaults-example */
;
