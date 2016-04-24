# check-password-security.js

Checks a users password security to avoid weak passwords.

This is basically a small and light version of zxcvbn, but without the dictionaries.

This will reject any password:
* containing personal data already entered in a form
* matching a supplied blacklist
* shorter than 8 characters
* scoring too low

You should only accept passwords that have a safety rating of "medium" or "good" and should never accept one that has "fail" set to TRUE.

The user interface is left to you, check the demo to see how it works.
