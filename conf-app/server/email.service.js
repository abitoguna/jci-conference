const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_KEY;

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

function sendEmailNotification(firstName, lastName, email, qrCode, tagLink) {
    sendSmtpEmail = {
        to: [{
            email,
            name: `${firstName} ${lastName}`
        }],
        templateId: 1,
        params: {
            firstName,
            email,
            tagLink
        },
        attachment: [
            qrCode
        ]
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        console.log('API called successfully. Returned data: ' + data);
      }, function(error) {
        console.error(error);
      });
}

module.exports = sendEmailNotification