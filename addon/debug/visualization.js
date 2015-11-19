/* global document*/
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
    this.wrapper.className = "sm_visualization-wrapper";

    this.container = document.createElement('div');
    this.container.className = "sm_visualization-container";
    this.wrapper.appendChild(this.container);

    this.skyline = document.createElement('div');
    this.skyline.className = "sm_visualization-skyline";
    this.container.appendChild(this.skyline);

    this.telescope = document.createElement('div');
    this.telescope.className = "sm_visualization-telescope";
    this.container.appendChild(this.telescope);

    this.visAbove = document.createElement('div');
    this.visAbove.className = "sm_visualization-visible";
    this.container.appendChild(this.visAbove);

    this.visBelow = document.createElement('div');
    this.visBelow.className = "sm_visualization-visible";
    this.container.appendChild(this.visBelow);

    this.hiddenAbove = document.createElement('div');
    this.hiddenAbove.className = "sm_visualization-hidden";
    this.container.appendChild(this.hiddenAbove);

    this.hiddenBelow = document.createElement('div');
    this.hiddenBelow.className = "sm_visualization-hidden";
    this.container.appendChild(this.hiddenBelow);

    document.body.appendChild(this.wrapper);
  }

  applySatelliteStyles(element, geography) {
    element.style.width = geography.width + "px";
    element.style.height = geography.height + "px";
    element.style.top = geography.top + "px";
    element.style.left = (this.radar.planet.width - this.radar.planet.left - geography.left) + "px";
  }

  applySatelliteMirrorStyles(element, componentElement, compare) {
    let geography = new Geography(componentElement);
    element.style.width = geography.width + "px";
    element.style.height = geography.height + "px";
    element.style.top = geography.top + "px";
    element.style.left = ((this.radar.planet.width * 2) - this.radar.planet.left - geography.left) + "px";

    let errorLevel = false;
    if (Math.abs(geography.top - compare.top) > 35) {
      errorLevel = true;
    }

    element.setAttribute('hasErrors', errorLevel ? "true" : "false");
  }


  static applyStyles(element, geography) {
    element.style.width = geography.width + "px";
    element.style.height = geography.height + "px";
    element.style.top = geography.top + "px";
    element.style.left = geography.left + "px";
  }

  styleViewport() {
    let edges = this.component.get('_edges');
    let planet = this.radar.planet;
    let sky = this.radar.sky;

    this.wrapper.style.width = (((2 * planet.left) + planet.width) * 0.3) + 'px';
    this.container.style.width = planet.width + "px";
    this.container.style.height = planet.height + "px";
    Visualization.applyStyles(this.telescope, planet);
    Visualization.applyStyles(this.skyline, sky);

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

    Visualization.applyStyles(this.hiddenAbove, {
      width: planet.width,
      top: edges.invisibleTop,
      left: planet.left,
      height: edges.visibleTop - edges.invisibleTop
    });

    Visualization.applyStyles(this.hiddenBelow, {
      width: planet.width,
      top: edges.visibleBottom,
      left: planet.left,
      height: edges.invisibleBottom - edges.visibleBottom
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
    let length = this.radar.satellites.length;
    let isShrinking = this.satellites.length > length;
    while (this.satellites.length !== length) {
      if (isShrinking) {
        let satellite = this.satellites.pop();
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
    let sats = this.satellites;
    this.radar.satellites.forEach((sat, index) => {
      let element = sats[index];
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
