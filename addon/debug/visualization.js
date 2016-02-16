/* global document */
import Geography from '../models/geography';

export default class Visualization {

  constructor(component) {
    this.component = component;
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

    document.body.appendChild(this.wrapper);
  }

  applySatelliteStyles(element, geography) {
    const left = (this.radar.planet.width - this.radar.planet.left - geography.left);

    element.style.width = `${geography.width}px`;
    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top}px`;
    element.style.left = `${left}px`;
  }

  applySatelliteMirrorStyles(element, componentElement, compare) {
    const geography = new Geography(componentElement);
    const left = ((this.radar.planet.width * 2) - this.radar.planet.left - geography.left);
    let errorLevel = false;

    element.style.width = `${geography.width}px`;
    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top}px`;
    element.style.left = `${left}px`;

    if (Math.abs(geography.top - compare.top) > 35) {
      errorLevel = true;
    }

    element.setAttribute('hasErrors', errorLevel ? 'true' : 'false');
  }

  static applyStyles(element, geography) {
    element.style.width = `${geography.width}px`;
    element.style.height = `${geography.height}px`;
    element.style.top = `${geography.top}px`;
    element.style.left = `${geography.left}px`;
  }

  styleViewport() {
    const edges = this.component.get('_edges');
    const {
      planet,
      skyline
      } = this.radar;
    const wrapperWidth = (((2 * planet.left) + planet.width) * 0.3);

    this.wrapper.style.width = `${wrapperWidth}px`;
    this.container.style.width = `${planet.width}px`;
    this.container.style.height = `${planet.height}px`;

    Visualization.applyStyles(this.telescope, planet);
    Visualization.applyStyles(this.sky, skyline);

    Visualization.applyStyles(this.visAbove, {
      width: planet.width,
      top: edges.visibleTop,
      left: planet.left,
      height: edges.viewportTop - edges.visibleTop
    });

    Visualization.applyStyles(this.visBelow, {
      width: planet.width,
      top: edges.viewportBottom,
      left: planet.left,
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

      this.applySatelliteStyles(element, sat.geography);
      element.setAttribute('viewState', sat.component._contentInserted ? 'visible' : 'culled');
      element.innerText = sat.component.get('index');
      this.applySatelliteMirrorStyles(element.mirrorSatellite, sat.component.element, sat.geography);
      element.mirrorSatellite.innerText = sat.component.get('index');
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
