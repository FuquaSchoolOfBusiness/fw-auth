/**
    MIT License

    Copyright (c) 2020 Fuqua School of Business, Duke University

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */
import { html, css, LitElement } from 'lit-element';
import FwProfile from './fw-profile.js'
/*
 * FuquaWorld Authentication 
 *
 * Uses JWT based authentication.
 * 
 * HTML Element used for configuring authentication on a page.
 * 
 * auto - indicates if the user should automatically be pushed to authenticate
 *          if not already authenticated or current authentication has expired.
 * url - the url to use for authentication
 * validateUrl - the url to validate authentication and retrieve data
 * notifyExpiry - the time remaining in minutes to start notification events
 *          for the user session's impending expiration. (defaults to 10 minutes)
 * notifyFrequency - the frequency to check for expiry in seconds. (defaults to 30 seconds)
 * 
 */
export class FwAuth extends LitElement {
  
  // properties to set on FwProfile
  static get properties() {
    return {
      auto: { type: Boolean },
      url: { type: String },
      referer: { type: String },
      lti: { type: String },
      validateUrl: { type: String },
      notifyExpiry: { type: Number },
      notifyFrequency: { type: Number }
    };
  }
  set referer(value) {
      let oldValue = this.referer;
      FwProfile.setReferer(value);
      this.requestUpdate('referer', oldValue);
  }
  get referer() { return FwProfile._referer; }
  set auto(value) {
      let oldValue = this.auto;
      FwProfile.setAuto(value);
      this.requestUpdate('auto', oldValue);
  }
  set lti(value) {
      let oldValue = FwProfile._lti;
      FwProfile.setLti(value);
      this.requestUpdate('lti', oldValue);
  }
  get lti() { return FwProfile._lti; } 
  set url(value) {
      let oldValue = FwProfile._url;
      FwProfile.setUrl(value);
      this.requestUpdate('url', oldValue);
  }
  get url() { return FwProfile._url; }  
  set validateUrl(value) {
      let oldValue = FwProfile._validateUrl;
      FwProfile.setValidateUrl(value);
      this.requestUpdate('validateUrl', oldValue);
  }
  get validateUrl() { return FwProfile._validateUrl; }   
  set notifyExpiry(value) {
      let oldValue = FwProfile._notifyExpiry;
      FwProfile.setNotifyExpiry(value);
      this.requestUpdate('notifyExpiry', oldValue);
  }
  get notifyExpiry() { return FwProfile._notifyExpiry; } 
  set notifyFrequency(value) {
      let oldValue = FwProfile._notifyFrequency;
      FwProfile.setNotifyFrequency(value);
      this.requestUpdate('notifyFrequency', oldValue);
  }
  get notifyExpiry() { return FwProfile._notifyExpiry; } 
  
  constructor() {
    super();
  }

  firstUpdated(changedProperties) { 
    FwProfile.init(); 
  }
  
  getData() {
    return FwProfile;
  }
  
  connectedCallback() {
    super.connectedCallback();
    FwProfile.addEventListeners(); 
  }
  
  disconnectedCallback() {
    FwProfile.removeEventListeners();
    super.disconnectedCallback();
  }
  
  render() {
    	return html``;
  }

}
if (!customElements.get('fw-auth')) customElements.define('fw-auth', FwAuth);
