/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.0.0-beta3): util/scrollBar.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import SelectorEngine from '../dom/selector-engine'
import Manipulator from '../dom/manipulator'
import { isElement } from './index'

const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
const SELECTOR_STICKY_CONTENT = '.sticky-top'

class ScrollBarHelper {
  constructor(element = document.documentElement) {
    this._isBody = [document.body, document.documentElement].includes(element)

    this._element = this._isBody ? document.documentElement : element
  }

  getWidth() {
    if (this._isBody) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = this._element.clientWidth
      return Math.abs(window.innerWidth - documentWidth)
    }

    return Math.abs(this._element.offsetWidth - this._element.clientWidth)
  }

  hide() {
    const width = this.getWidth()
    this._disableOverFlow()
    // give padding to element to balances the hidden scrollbar width
    this._setElementAttributes(this._element, 'paddingRight', calculatedValue => calculatedValue + width)
    // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements, to keep shown fullwidth
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight', calculatedValue => calculatedValue + width)
    this._setElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight', calculatedValue => calculatedValue - width)
  }

  _disableOverFlow() {
    const actualValue = this._element.style.overflowY
    if (actualValue.length) {
      Manipulator.setDataAttribute(this._element, 'overflowY', actualValue)
    }

    this._element.style.overflowY = 'hidden'
  }

  _setElementAttributes(selector, styleProp, callback) {
    const scrollbarWidth = this.getWidth()
    const manipulationCallBack = element => {
      if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return
      }

      const actualValue = element.style[styleProp]
      if (actualValue.length) {
        Manipulator.setDataAttribute(element, styleProp, actualValue)
      }

      const calculatedValue = window.getComputedStyle(element)[styleProp]
      element.style[styleProp] = `${callback(Number.parseFloat(calculatedValue))}px`
    }

    this._applyManipulationCallback(selector, manipulationCallBack)
  }

  reset() {
    this._resetElementAttributes(this._element, 'overflowY')
    this._resetElementAttributes(this._element, 'paddingRight')
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight')
    this._resetElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight')
  }

  _resetElementAttributes(selector, styleProp) {
    const manipulationCallBack = element => {
      const value = Manipulator.getDataAttribute(element, styleProp)
      if (typeof value === 'undefined') {
        element.style.removeProperty(styleProp)
      } else {
        Manipulator.removeDataAttribute(element, styleProp)
        element.style[styleProp] = value
      }
    }

    this._applyManipulationCallback(selector, manipulationCallBack)
  }

  _applyManipulationCallback(selector, callBack) {
    if (isElement(selector)) {
      callBack(selector)
    } else {
      SelectorEngine.find(selector, this._element).forEach(callBack)
    }
  }

  isOverflowing() {
    return this.getWidth() > 0
  }
}

export default ScrollBarHelper
