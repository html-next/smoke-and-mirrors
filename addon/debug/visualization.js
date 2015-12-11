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
    this.wrapper.className = this.component.vertical ? 'sm_visualization-wrapper vertical' : 'sm_visualization-wrapper horizontal';

    this.container = document.createElement('div');
    this.container.className = 'sm_visualization-container';
    this.wrapper.appendChild(this.container);

    this.sky = document.createElement('div');
    this.sky.className = 'sm_visualization-skyline';
    this.container.appendChild(this.sky);

    this.telescope = document.createElement('div');
    this.telescope.className = 'sm_visualization-telescope';
    this.container.appendChild(this.telescope);

    this.visBefore = document.createElement('div');
    this.visBefore.className = 'sm_visualization-visible';
    this.container.appendChild(this.visBefore);

    this.visAfter = document.createElement('div');
    this.visAfter.className = 'sm_visualization-visible';
    this.container.appendChild(this.visAfter);

    this.hiddenBefore = document.createElement('div');
    this.hiddenBefore.className = 'sm_visualization-hidden';
    this.container.appendChild(this.hiddenBefore);

    this.hiddenAfter = document.createElement('div');
    this.hiddenAfter.className = 'sm_visualization-hidden';
    this.container.appendChild(this.hiddenAfter);

    document.body.appendChild(this.wrapper);
  }

  applySatelliteStyles(element, geography) {
    const left = (this.radar.planet.width - this.radar.planet.left - geography.left);
    const top = (this.radar.planet.height - this.radar.planet.top);

    element.style.width = `${geography.width}px`;
    element.style.height = this.component.vertical ? `${geography.height}px` : `${this.radar.planet.height}px`;
    element.style.top = this.component.vertical ? `${geography.top}px` : `${top}px`;
    element.style.left = this.component.vertical ? `${left}px` : `${geography.left}px`;
  }

  applySatelliteMirrorStyles(element, componentElement, compare) {
    const geography = new Geography(componentElement);
    const left = ((this.radar.planet.width * 2) - this.radar.planet.left - geography.left);
    const top = ((this.radar.planet.height * 2) - this.radar.planet.top);
    let errorLevel = false;

    element.style.width = `${geography.width}px`;
    element.style.height = this.component.vertical ? `${geography.height}px` : `${this.radar.planet.height}px`;
    element.style.top = this.component.vertical ? `${geography.top}px` : `${top}px`;
    element.style.left = this.component.vertical ? `${left}px` : `${geography.left}px`;

    if (this.component.vertical && Math.abs(geography.top - compare.top) > 35) {
      errorLevel = true;
    } else if (!(this.component.vertical) && Math.abs(geography.left - compare.left) > 35) {
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

    if (this.component.vertical) {
      const wrapperWidth = (((2 * planet.left) + planet.width) * 0.3);
      this.wrapper.style.width = `${wrapperWidth}px`;
    } else {
      const wrapperHeight = (((2 * planet.top) + planet.height) * 0.3);
      this.wrapper.style.height = `${wrapperHeight}px`;
    }

    this.container.style.width = `${planet.width}px`;
    this.container.style.height = `${planet.height}px`;

    Visualization.applyStyles(this.telescope, planet);
    Visualization.applyStyles(this.sky, skyline);

    if (this.component.vertical) {
      Visualization.applyStyles(this.visBefore, {
        width: planet.width,
        top: edges.visibleStart,
        left: planet.left,
        height: edges.viewportStart - edges.visibleStart
      });

      Visualization.applyStyles(this.visAfter, {
        width: planet.width,
        top: edges.viewportEnd,
        left: planet.left,
        height: edges.visibleEnd - edges.viewportEnd
      });

      Visualization.applyStyles(this.hiddenBefore, {
        width: planet.width,
        top: edges.invisibleStart,
        left: planet.left,
        height: edges.visibleStart - edges.invisibleStart
      });

      Visualization.applyStyles(this.hiddenAfter, {
        width: planet.width,
        top: edges.visibleEnd,
        left: planet.left,
        height: edges.invisibleEnd - edges.visibleEnd
      });
    } else {
      // Override placement of sky
      this.sky.style.height = `${planet.height}px`;
      this.sky.style.top = `${planet.top}px`;

      Visualization.applyStyles(this.visBefore, {
        width: edges.viewportStart - edges.visibleStart,
        top: planet.top,
        left: edges.visibleStart,
        height: planet.height
      });

      Visualization.applyStyles(this.visAfter, {
        width: edges.visibleEnd - edges.viewportEnd,
        top: planet.top,
        left: edges.viewportEnd,
        height: planet.height
      });

      Visualization.applyStyles(this.hiddenBefore, {
        width: edges.visibleStart - edges.invisibleStart,
        top: planet.top,
        left: edges.invisibleStart,
        height: planet.height
      });

      Visualization.applyStyles(this.hiddenAfter, {
        width: edges.invisibleEnd - edges.visibleEnd,
        top: planet.top,
        left: edges.visibleEnd,
        height: planet.height
      });
    }
  }

  makeSatellite() {
    let satellite;
    let mirror;

    if (this.cache.length) {
      satellite = this.cache.pop();
    } else {
      satellite = document.createElement('div');
      satellite.className = this.component.vertical ? 'sm_visualization-satellite' : 'sm_visualization-satellite horizontal';
    }
    if (satellite.mirrorSatellite) {
      mirror = satellite.mirrorSatellite;
    } else {
      mirror = document.createElement('div');
      mirror.className = this.component.vertical ? 'sm_visualization-mirror' : 'sm_visualization-mirror horizontal';
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
      element.setAttribute('viewState', sat.component.get('viewState'));
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
      satellite.destroy();
    });
    this.satellites = null;
    this.cache.forEach((satellite) => {
      satellite.destroy();
    });
    this.cache = null;
  }

}
