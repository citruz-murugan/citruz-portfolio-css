/**
 * =============================================================================
 * CITRUZ PORTFOLIO — CUSTOM JAVASCRIPT
 * =============================================================================
 *
 * PURPOSE
 * -------
 * This is the single JS file for all custom behaviour added to the Semplice
 * portfolio at citruz.murugan@gmail.com. Every feature lives here so there is
 * one place to look when something needs changing or debugging.
 *
 * HOW TO USE
 * ----------
 * 1. Edit this file locally and commit/push to GitHub.
 * 2. Paste the FULL contents into:
 *      WordPress Admin → Semplice → Settings → Custom Code → JS (Footer)
 *    (Semplice runs footer JS after the page DOM is ready, so
 *     DOMContentLoaded fires reliably.)
 *
 * CONVENTIONS
 * -----------
 * - All CSS classes added by JS are prefixed with "cz-" to match the CSS file.
 * - Each feature is wrapped in its own self-contained function so features
 *   don't interfere with each other.
 * - Features are registered at the bottom of this file in the INIT section.
 *
 * FILE STRUCTURE
 * --------------
 *   1. COPY EMAIL BUTTON  — copies email to clipboard, shows "COPIED!" feedback
 *   [add future features below, one section per feature]
 *
 * =============================================================================
 */


/* =============================================================================
   1. COPY EMAIL BUTTON
   =============================================================================
   WHAT IT DOES:
     Finds the "COPY EMAIL" button on the contact section of the portfolio.
     When clicked:
       - Copies "citruz.murugan@gmail.com" to the user's clipboard.
       - Fades the button text out, swaps it to "COPIED!", fades back in.
       - After 2 seconds, fades out again, reverts to "COPY EMAIL", fades in.

   HOW IT FINDS THE BUTTON:
     Scans every <a> and <button> element on the page and matches the one
     whose visible text is exactly "COPY EMAIL" (case-insensitive).
     This avoids needing to add a custom class in Semplice's editor — the
     text itself is the selector.

   CSS DEPENDENCY:
     Relies on two rules in custom-css.css:
       .cz-copy-btn           { transition: opacity 0.15s ease; }
       .cz-copy-btn.cz-fading { opacity: 0; }
     The JS adds "cz-copy-btn" to the button once at page load.
     During a text swap, "cz-fading" is added (fade out), then removed
     (fade in) after 150ms — matching the CSS transition duration exactly.

   INNER HTML STRATEGY:
     Semplice wraps button label text in inner <span> elements with inline
     colour styles. Setting textContent destroys those spans; when the button
     reverts, the spans are gone and hover styles break (text goes invisible).
     Fix: store originalHTML at load time; revert always restores innerHTML
     so the original Semplice structure is fully reconstructed.

   CLIPBOARD STRATEGY:
     1. Tries the modern navigator.clipboard.writeText() API (all current
        browsers — Chrome, Firefox, Safari, Edge).
     2. Falls back to the legacy document.execCommand('copy') approach for
        older browsers that don't support the Clipboard API.
   ============================================================================= */

function initCopyEmailButton() {

  /* --- Find the button by its text label --- */
  var allClickables = document.querySelectorAll('a, button');
  var copyBtn = null;

  allClickables.forEach(function (el) {
    if (el.textContent.trim().toUpperCase() === 'COPY EMAIL') {
      copyBtn = el;
    }
  });

  /* If no matching button exists on this page, stop here — no errors thrown */
  if (!copyBtn) return;

  /* Add the CSS transition class once, at page load */
  copyBtn.classList.add('cz-copy-btn');

  /*
   * Store the original inner HTML once at page load, before any click.
   *
   * WHY innerHTML and not textContent:
   * Semplice wraps button text in inner <span> elements that carry their
   * own inline colour styles (e.g. <span style="color:#fff">COPY EMAIL</span>).
   * Using textContent = '...' to swap labels destroys those child nodes.
   * After the swap the span is gone, so Semplice's hover rules lose their
   * target and the text colour falls through to invisible.
   * Restoring innerHTML brings the original span (and its inline styles)
   * back exactly, so hover works correctly every time.
   */
  var originalHTML = copyBtn.innerHTML;
  var originalText = copyBtn.textContent.trim();

  /* --- Click handler --- */
  copyBtn.addEventListener('click', function (e) {
    e.preventDefault(); /* prevent any default link navigation */

    var email = 'citruz.murugan@gmail.com';

    /*
     * swapText(newText)
     * -----------------
     * Fades the button out, changes its label, then fades it back in.
     * The 150ms delay matches the CSS transition duration in custom-css.css.
     *
     * For "COPIED!" we set textContent (fast, simple — only shown briefly).
     * For the revert we restore the original innerHTML so Semplice's inner
     * <span> elements and their inline styles come back intact.
     */
    function swapText(newText) {
      copyBtn.classList.add('cz-fading');          /* trigger fade-out via CSS */
      setTimeout(function () {
        if (newText === originalText) {
          copyBtn.innerHTML = originalHTML;        /* full restore — brings back Semplice's spans */
        } else {
          copyBtn.textContent = newText;           /* simple swap for the brief "COPIED!" state */
        }
        copyBtn.classList.remove('cz-fading');     /* trigger fade-in via CSS */
      }, 150);
    }

    /*
     * showFeedback()
     * --------------
     * Shows "COPIED!" then reverts after 2 seconds.
     * Called once the clipboard write has succeeded.
     */
    function showFeedback() {
      swapText('COPIED!');
      setTimeout(function () {
        swapText(originalText);  /* triggers innerHTML restore */
      }, 2000);
    }

    /*
     * fallback()
     * ----------
     * Legacy clipboard copy using a hidden <textarea> and execCommand.
     * Used when navigator.clipboard is not available (older browsers).
     */
    function fallback() {
      var ta         = document.createElement('textarea');
      ta.value       = email;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    /* Try modern API first; fall back to legacy if unavailable or denied */
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email)
        .then(showFeedback)
        .catch(function () {
          fallback();
          showFeedback();
        });
    } else {
      fallback();
      showFeedback();
    }
  });

} /* end initCopyEmailButton */


/* =============================================================================
   [ADD FUTURE FEATURES ABOVE THIS LINE — one function per feature]

   TEMPLATE FOR A NEW FEATURE:
   -----------------------------------------------------------------------------

   function initFeatureName() {
     // describe what it does
     // find the element(s)
     // attach event listeners or run logic
   }

   Then register it in the INIT section below.
   =============================================================================
*/


/* =============================================================================
   INIT — Run all features after the DOM is fully loaded
   =============================================================================
   Add a call here for each new feature function you create above.
   DOMContentLoaded fires when the HTML is parsed and ready — safe to
   query elements here even if images/fonts haven't loaded yet.
   ============================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  initCopyEmailButton();

  /* initNextFeature(); */   /* ← uncomment and add calls here as we grow */

});
