const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_KEY;

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

function sendEmailNotification(firstName, lastName, email) {

    sendSmtpEmail = {
        to: [{
            email,
            name: `${firstName} ${lastName}`
        }],
        templateId: 1,
        params: {
            firstName,
            email
        },
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
        }
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        console.log('API called successfully. Returned data: ' + data);
      }, function(error) {
        console.error(error);
      });
}

module.exports = sendEmailNotification