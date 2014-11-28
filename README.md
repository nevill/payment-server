## How to setup
Please check the wiki page [here](https://github.com/nevill/payment-server/wiki/How-to-setup).

## Payment as a service
> An independent server using Paypal adaptive payment API

### How can it help
* It manages all kinds of transcations for you.
  - Such as Pay, ExecutePayment, Preapproval as described in [Adaptive Payment API](https://developer.paypal.com/webapps/developer/docs/classic/api/#ap).
  - It answers the [IPN messages](https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/), if you enable it.
* It will call your own application server when you subscribe to specific event.

### Build Status
[![wercker status](https://app.wercker.com/status/2c602c25adea45922221e51230e69571/s/ "wercker status")](https://app.wercker.com/project/bykey/2c602c25adea45922221e51230e69571)
