## Payment as a service
> An independent server using Paypal adaptive payment API

### How can it help
* It manages all kinds of transcations for you.
  - Such as Pay, ExecutePayment, Preapproval as described in [Adaptive Payment API](https://developer.paypal.com/webapps/developer/docs/classic/api/#ap).
  - It answers the [IPN messages](https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/), if you enable it.
* It will call your own application server when you subscribe to specific event.
