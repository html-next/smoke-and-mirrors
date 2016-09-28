/* global document */
import Geography from '../../-private/radar/models/geography';
import Container from '../../-private/radar/models/container';

const SYS_WIDTH = 250;

export default class Visualization {
  constructor(component) {
    this.component = component;
    this.minimumMovement = Math.floor(component.defaultHeight / 2);
    this.radar = component.radar;
    this.satellites = [];
    this.cache = [];
    this.setupViewport();
    this.render();
  }

  setupViewport() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'sm_visualization-wrapper';

    this.container = document.createElement('div');
    this.container.className = 'sm_visualization-container';
    this.wrapper.appendChild(this.container);

    this.sky = document.createElement('div');
    this.sky.className = 'sm_visualization-skyline';
    this.container.appendChild(this.sky);

    this.telescope = document.createElement('div');
    this.telescope.className = 'sm_visualization-telescope';
    this.container.appendChild(this.telescope);

    this.visAbove = document.createElement('div');
    this.visAbove.className = 'sm_visualization-visible';
    this.container.appendChild(this.visAbove);

    this.visBelow = document.createElement('div');
    this.visBelow.className = 'sm_visualization-visible';
    this.container.appendChild(this.visBelow);

    this.screen = document.createElement('div');
    this.screen.className = 'sm_visualization-screen';
    this.container.appendChild(this.screen);

    document.body.appendChild(this.wrapper);
  }

  currentOffsetAdjustment() {
    let currOffsets = this.radar.currentOffsets;

    if (currOffsets !== null) {
      const scrollY = currOffsets.top;
      const scrollX = currOffsets.left;
      const _scrollY = this.radar.scrollY;
      const _scrollX = this.radar.scrollX;
      const dY = scrollY - _scrollY;
      const dX = scrollX - _scrollX;

      return { dY, dX };
    }

    return { dY: 0, dX: 0 };
  }

  applySatelliteStyles(element, geography) {
    const adj = this.currentOffsetAdjustment();
    const left = SYS_WIDTH;

    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top - adj.dY}px`;
    element.style.left = `${left}px`;
  }

  applySatelliteMirrorStyles(element, componentElement, compare) {
    const adj = this.currentOffsetAdjustment();
    const geography = new Geography(componentElement);
    const left = 2 * SYS_WIDTH;
    let errorLevel = false;

    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top}px`;
    element.style.left = `${left}px`;

    let diff = Math.abs(geography.top - compare.top + adj.dY);

    if (diff > this.minimumMovement) {
      errorLevel = true;
    }

    element.setAttribute('hasErrors', errorLevel ? 'true' : 'false');
  }

  static applyVerticalStyles(element, geography) {
    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top}px`;
  }

  static applyStyles(element, geography) {
    Visualization.applyVerticalStyles(element, geography);
    element.style.width = `${geography.width}px`;
    element.style.left = `${geography.left}px`;
  }

  styleViewport() {
    const edges = this.component._edges;
    const {
      planet,
      skyline
      } = this.radar;
    this.container.style.height = `${planet.height}px`;

    Visualization.applyVerticalStyles(this.telescope, planet);
    Visualization.applyVerticalStyles(this.sky, skyline);

    Visualization.applyVerticalStyles(this.screen, new Geography(Container));

    Visualization.applyVerticalStyles(this.visAbove, {
      top: edges.visibleTop,
      height: edges.viewportTop - edges.visibleTop
    });

    Visualization.applyVerticalStyles(this.visBelow, {
      top: edges.viewportBottom,
      height: edges.visibleBottom - edges.viewportBottom
    });
  }

  makeSatellite() {
    let satellite;
    let mirror;

    if (this.cache.length) {
      satellite = this.cache.pop();
    } else {
      satellite = document.createElement('div');
      satellite.className = 'sm_visualization-satellite';
    }
    if (satellite.mirrorSatellite) {
      mirror = satellite.mirrorSatellite;
    } else {
      mirror = document.createElement('div');
      mirror.className = 'sm_visualization-mirror';
      mirror.siblingSatellite = satellite;
      satellite.mirrorSatellite = mirror;
    }
    this.satellites.push(satellite);
    this.container.insertBefore(satellite, this.container.firstElementChild);
    this.container.insertBefore(mirror, this.container.firstElementChild);
  }

  makeSatellites() {
    const {
      length
      } = this.radar.satellites;
    const isShrinking = this.satellites.length > length;

    while (this.satellites.length !== length) {
      if (isShrinking) {
        const satellite = this.satellites.pop();

        satellite.parentNode.removeChild(satellite);
        satellite.mirrorSatellite.parentNode.removeChild(satellite.mirrorSatellite);
        this.cache.push(satellite);
      } else {
        this.makeSatellite();
      }
    }
    this.styleSatellites();
  }

  styleSatellites() {
    const sats = this.satellites;

    this.radar.satellites.forEach((sat, index) => {
      const element = sats[index];
      const satIndex = sat.component.get('index');

      this.applySatelliteStyles(element, sat.geography);
      element.setAttribute('viewState', sat.component._contentInserted ? 'visible' : 'culled');
      element.mirrorSatellite.setAttribute('viewState', sat.component._contentInserted ? 'visible' : 'culled');
      element.setAttribute('index', satIndex);
      element.mirrorSatellite.setAttribute('index', satIndex);
      element.innerText = satIndex;
      this.applySatelliteMirrorStyles(element.mirrorSatellite, sat.component.element, sat.geography);
      element.mirrorSatellite.innerText = satIndex;
    });
  }

  render() {
    this.styleViewport();
    this.makeSatellites();
  }

  destroy() {
    this.wrapper.parentNode.removeChild(this.wrapper);
    this.wrapper = null;
    this.radar = null;
    this.component = null;
    this.satellites.forEach((satellite) => {
      satellite.mirrorSatellite = null;
      satellite.siblingSatellite = null;
      if (satellite.parentNode) {
        satellite.parentNode.removeChild(satellite);
      }
    });
    this.satellites = null;
    this.cache.forEach((satellite) => {
      satellite.mirrorSatellite = null;
      satellite.siblingSatellite = null;
      if (satellite.parentNode) {
        satellite.parentNode.removeChild(satellite);
      }
    });
    this.cache = null;
  }

}
