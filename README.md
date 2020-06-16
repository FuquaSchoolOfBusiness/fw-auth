# \<fw-auth>

Include this webcomponent to authenticate with Fuqua School of Business
authentication systems.  This system leverages Duke's Shibboleth (SAML2)
system with an Identify Provider (IdP) that uses Duke's NetID or OneLink
implementation for identity.

This module can be configured to automatically authenticate a user if the
user is not currently authenticated (either no credential or an expired 
credential) or can rely on an event trigger to force an authentication
process.

Furthermore, the component can be used to provide authorization based on
the authenticated user's profile and group memberships.  For example, the 
module provides functions called isMemberOf() and hasObjectClass().

Module attributes:
 auto - indicates if module should force authentication when ever there 
        is an invalid token.
 url - the authentication login URL.
 validateUrl - the token validation URL.

Module functions:
 isMemberOf(criteria) 
 hasObjectClass(objectclass) 
 getProfile() 
 getGroups()
 isAuthenticated()

To access the data via javascript, use the following:
    document.querySelector('fw-auth').getData();
    document.querySelector('fw-auth').getData().getProfile(); <- to get the user's profile

## Installation
```bash
npm i @fsb/fw-auth
```

## Usage
```html
<script type="module">
  import '@fsb/fw-auth/dist/fw-auth.js';
</script>

<fw-auth></fw-auth>
```
