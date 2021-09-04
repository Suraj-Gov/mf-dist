# Mutual Fund Distributors

Returns the Mutual Fund Distributors for given pincode.
API reverse engineered from amfi's website.

To use in Google Sheets, enter this formula and replace :pincode with the pincode you desire

```
=IMPORTHTML("https://<base_url>/mf-dist/:pincode", "table")
```

# SEBI Investment Advisors

Returns ~1.3k advisors scraped from sebi's website's API

To use in Google Sheets, enter this formula

```
=IMPORTHTML("https://<base_url>/sebi-advisors", "table")
```

This data is cached, so you might need to reset the cache if you want to see the latest data

To reset cache, go to

```
https://<base_url>/sebi-advisors/reset
```

I'm lazy to implement the auto reset thing, if you want to implement it, just add another kv pair to the INIT_SEBI_OBJ like `timestamp: new Date.now()` and check if the cached date is >1 day older if you want to rerun the requests
