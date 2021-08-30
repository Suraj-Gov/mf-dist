Returns the Mutual Fund Distributors for given pincode.
API reverse engineered from amfi's website.

To use in Google Sheets, enter this formula and replace :pincode with the pincode you desire
```
=IMPORTHTML("https://mf-dist.herokuapp.com/:pincode", "table")
```