function paymentFailHandler(reason) {
  alert(reason);
  return;
}

export const execute_gpay = (inputAmount) => {// check if payment in browser supported 
      if (!window.PaymentRequest) {
        console.log("Web payments are not supported in this browser.");
        return;
      }

      // create payment request 
      const supportedPaymentMethod = [
        {
          supportedMethods: ['https://tez.google.com/pay'],
          data: {
            pa: '',
            pn: '',
            tr: '',                                         //your custom transaction reference ID
            url: 'http://127.0.0.1:8000/#funds-page',
            mc: '',                                         // your merchant category code
            tn: 'Purchase in Merchant',
            gstBrkUp: '',                                   //gst value breakup
            invoiceNo: '',                                  //your invoice number
            invoiceDate: '',                                // your invoice date and time
            gstIn: '',                                      // GSTIN
          }
        }
      ]

      // set order details
      const details = {
        total: {
          label: 'Total',
          amount: {
            currency: 'INR',
            value: String(inputAmount) + '.00'
          }
        },
        displayItems:[{
          label: 'Matka Token',
          amount: {
            currency: 'INR',
            value: '1.00'
          }
        }],
        shippingOptions: [{
          id: 'free',
          label: 'Worldwide free shipping!',
          amount: {currency: 'INR', value: '0.00'},
          selected: true
        }]
      }


      // initiating payment request object
      let request = null;
      try {
        request = new PaymentRequest(supportedPaymentMethod, details)
      } catch (e) {
        return paymentFailHandler('Payment Request Error!'+ e.message);
      }

      if (!request) {
        return paymentFailHandler('Web payments are not supported in this browser.');
      }


      // check for user readiness for payments
      const canMakePaymentCache = 'canMakePaymentCache';

      function checkCanMakePayment(request) {
        if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
          return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
        }

        var canMakePaymentPromise = Promise.resolve(true)

        if (request.canMakePayment) {
          canMakePaymentPromise = request.canMakePayment();
        }

        return canMakePaymentPromise.then((result) => {
          sessionStorage[canMakePaymentCache] = result;
          return result;
        }).catch((err) => {
          console.log('Error calling canMakePayment:' + err);
        });
      }

      

      function resToJson(res) {
        return {
          methodName: res.methodName,
          details: res.details,
          payerName: res.payerName,
          payerPhone: res.payerPhone,                 // shippingAddress: addressToJsonString(res.shippingAddress), // shippingOption: res.shippingOption,
          payerEmail: res.payerEmail,          
        }        // return JSON.stringify(responseDict, undefined, 2)
      }


      function completePayment(transResponse, serverResponse) {
        transResponse.complete(serverResponse.status)
          .then(() => {
            console.log('Payment success', transResponse.message);
            alert('Payment processed sucessfully. \nWait for admin to confirm the transaction.')
            window.location.hash = '#funds-page'
          })
          .catch((err) => console.log(err))
      }

      function processResponse(completeTransactionResponse) {
        var json_TXN = resToJson(completeTransactionResponse);
        const tezRes = JSON.Jsonify(json_TXN.details.tezResponse)
        
        let fail_status = ''
        if (tezRes.responseCode === 'ZM'){
          fail_status = "Payment failure due to invalid MPIN.";
        } else if (tezRes.responseCode === 'Z9') {
          fail_status = "Payment failure due to insufficient funds."
        } else if (tezRes.responseCode === 'Z9') {
          fail_status = "Payment failure due to transaction timeout or connection issue."
        }

        if (fail_status != '0' || fail_status != '00') {
          return paymentFailHandler(fail_status)
        }


        const csrftoken = getCookie('csrftoken');

        fetch('/add-token', {
          method: 'POST',
          headers: new Headers({
            "Content-type": "application/x-www-form-urlencoded",
            "X-CSRFToken": csrftoken
          }),
          body: JSON.sringify(json_TXN)
        }).then((res) => res.json())
          .then((response) => completePayment(completeTransactionResponse, response))
          .catch(err => console.log('Unable to process payment.' + err))
      }


      //final payment function - show functions 
      function showPaymentUI(request, canMakePayment) {
        if (!canMakePayment) {
          return paymentFailHandler('Google pay is not ready to pay.');
        }

        let paymentTimeout = window.setTimeout(() => {
          window.clearTimeout(paymentTimeout);
          request.abort().then(() => console.log('Payment timed out after 20 minute.')).catch(() => console.log('Unable to abort, user is in process of paying.'))
        }, 20 * 60 * 1000); // 20 minutes

        request.show().then((processedTransaction) => {
          window.clearTimeout(paymentTimeout);
          processResponse(processedTransaction)
        }).catch((err) => console.log(err))
      }


      // transaction controller function
      var canMakePaymentPromise = checkCanMakePayment(request);
      canMakePaymentPromise
        .then((result) => showPaymentUI(request, result))
        .catch((err) => console.log('Error calling checkCanMakePayment: '+ err));
}