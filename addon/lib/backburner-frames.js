/**!
 * Modifies `window.setTimeout` to use  `requestAnimationFrame`
 */
const addToFrame = self.requestAnimationFrame;
const nativeSetTimeout = self.setTimeout;

function frameTimeout(method, wait) {
  if (!wait) {
    return addToFrame(method);
  }
  return nativeSetTimeout(method, wait);
}

export default frameTimeout;
