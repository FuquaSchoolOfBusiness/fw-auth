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
const FwProfile = (() => {
  'use strict';

  const FW_AUTHENTICATED = "_FW_AUTHENTICATED";                                 // Authenticated event -- user has successfully authenticated
  const FW_LOGGED_OUT = "_FW_LOGGED_OUT";                                       // Logged out event -- called after a user logout
  const FW_EXPIRES_SOON = "_FW_EXPIRES_SOON";                                   // Session expiring notification event
  const FW_EXPIRED = "_FW_EXPIRED";                                             // Session expired event
  const FW_LOGIN = "_FW_LOGIN";                                                 // Log in event -- to request a login
  const FW_LOGOUT = "_FW_LOGOUT";                                               // Log out event -- to request a logout

  let _auto = false;                                                            // Automatically push user to login if invalid
  let _authenticated = false;                                                   // Is authenticated
  let _profile = {};                                                            // User profile
  let _groups = [];                                                             // List of LDAP groups
  let _url = 'https://go.fuqua.duke.edu/auth/onelink?service=';                 // URL to log user into system
  let _lti = "";                                                                // Use LTI Authentication
  let _validateUrl = 'https://go.fuqua.duke.edu/auth/validate';                 // URL to validate JWT and get info
  let _notifyExpiry = 10;                                                       // Start notifications when session has less than n minutes left
  let _notifyFrequency = 30;  
  let _referer = null;
  
  const addEventListeners = () => {
    document.addEventListener(FW_LOGIN, loginEvent);
    document.addEventListener(FW_LOGOUT, logoutEvent);
    document.addEventListener(FW_EXPIRED, expiryEvent);
    document.addEventListener(FW_EXPIRES_SOON, expiryEvent);
    document.addEventListener(FW_AUTHENTICATED, authenticatedEvent);        
  };
  
  const removeEventListeners = () => {
    document.removeEventListener(FW_LOGIN, loginEvent);
    document.removeEventListener(FW_LOGOUT, logoutEvent);
    document.removeEventListener(FW_EXPIRED, expiryEvent);
    document.removeEventListener(FW_EXPIRES_SOON, expiryEvent);
    document.removeEventListener(FW_AUTHENTICATED, authenticatedEvent);      
  };
  
  const emitEvent = (eventName, eventDetails) => {
	let event = new CustomEvent( 
                eventName, { 'bubbles': true, 'composed': true, 'detail': eventDetails } );
        document.dispatchEvent(event);
  };
  
  const authUrl = () => { 
      return _url + encodeURI(_referer === null ? window.location.href: _referer); 
  };
  
  const isMemberOf = (criteria) => {                                            // Test to see if a provided CN or DN matches a group in user's list of groups
      if (_groups) {
          _groups.some((x) => { 
              if (criteria.indexOf("=") > 0) {
                  if (x.dn && x.dn.toLowerCase() === criteria.toLowerCase()) return true;
              }
              if (x.cn && x.cn.toLowerCase() === criteria.toLowerCase()) return true;
          });
      }
      return false;
  };
  
  const hasObjectClass = (objectclass) => {                                     // Test to see if the user's profile has the specified objectclass
      if (_profile && _profile.objectclasses) {
            _profile.objectclasses.some((x) => { 
              if (x.toLowerCase() === objectclass.toLowerCase()) return true;
            });              
      }
      return false;
  };
  
  const getProfile = () => { return _profile; };
  
  const getGroups = () => { return _groups; };
  
  const setAuto = (value) => { _auto = value; };
  
  const setUrl = (value) => { _url = value; };
  
  const setLti = (value) => { 
      _lti = value; 
      fetchJWT(false);
  };
    
  const getLti = () => { return _lti; };
  
  const setReferer = (value) => { _referer = value; };
  
  const getReferer = () => { return _referer; };
  
  const setValidateUrl = (value) => { _validateUrl = value; };
  
  const setNotifyExpiry = (value) => { _notifyExpiry = value; };
  
  const setNotifyFrequency = (value) => { _notifyFrequency = value; };
 
  const isAuthenticated = () => { return _authenticated; };
  
  const loginEvent = (e) => {
        if (_authenticated) _authenticated = false;
        initiateLogin();
  };

  const initiateLogin = () => { window.location.href = authUrl(); };
  
  const logoutEvent = (e) => { if (_authenticated) _authenticated = false; };
  
  const authenticatedEvent = (e) => { fetchJWT(false); };
  
  const expiryEvent = (e) => { console.log(JSON.stringify(e.detail)); };
  
  const fetchJWT = async (check) => {                                           // Perform the validation check and populate data
	if (!_authenticated) {
            if ((check && _auto) || !check) {
    		const response = _lti.length > 0 ? 
                                    await fetch(_validateUrl, {
                                        method: 'get',
                                        mode: 'cors',
                                        cache: 'no-cache',
                                        headers: {
                                            'Authorization': 'Bearer ' + _lti
                                        }
                                    }):
                                    await fetch(_validateUrl, {
                                        method: 'get',
                                        mode: 'cors',
                                        cache: 'no-cache',
                                        credentials: 'include'
                                    });
		if (response.status === 200) {
    			const json = await response.json();
                        //_jwt = json.jwt;
			_profile = json.profile ? json.profile: {};
                        _profile.exp = json.exp;
                        if (json.proxied) _profile.proxied = json.proxied;
        		_groups = json.groups ? json.groups: [];
			_authenticated = true;
			emitEvent(FW_AUTHENTICATED, {} );
		} else {
        		if (_auto && !_authenticated && !_lti.length > 0) {
                            initiateLogin();
        		}			
		}
            }
  	} 
  };
  
  const init = config => {
    fetchJWT(true);
    interval = window.setInterval(() => {
        console.log("interval...");
      if (_authenticated) {
        let now = new Date().getTime();
        if (!_profile || (_profile.exp && _profile.exp * 1000 < now)) {
            _authenticated = false;
            emitEvent(FW_EXPIRED, { 'expired_at': now });
            if (_auto) { initiateLogin(); }
        } else {
            if (_profile.exp * 1000 - now < 60000 * _notifyExpiry) {
                emitEvent(
                        FW_EXPIRES_SOON, 
                        { 'expires_at': _profile.exp * 1000, 'time_left': _profile.exp * 1000 - now } 
                );
            }
        }
      } 
  }, _notifyFrequency * 1000);

  };

  let interval = null; 
  
  return { 
      init, 
      addEventListeners, 
      removeEventListeners, 
      fetchJWT, 
      isAuthenticated, 
      getProfile, 
      getGroups, 
      setAuto, 
      setReferer,
      setUrl, 
      setLti,
      getLti,
      setValidateUrl, 
      setNotifyFrequency, 
      setNotifyExpiry 
  };
})();
export default FwProfile

