const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();
const fs = require('fs');

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

// const MailerSend = require('mailersend').MailerSend;
// const Recipient = require('mailersend').Recipient;
// const EmailParams = require('mailersend').EmailParams;
// const Attachment = require('mailersend').Attachment;
// const Sender = require('mailersend').Sender;


// const mailerSend = new MailerSend({
//   apiKey: process.env.MAILERSEND_KEY,
// });

// async function sendEmailNotification(firstName, lastName, email, qrCode, tagLink) {
//     const recipients = [new Recipient(email, `${firstName} ${lastName}`)];
//     const sentFrom = new Sender('no-reply-jci@techshawe.com', 'JCI Nigeria Collegiate')
//     const personalization = [
//         {
//           email,
//           data: {
//             'email': email,
//             'firstName': firstName,
//             'lastName': lastName,
//             'tagLink': tagLink
//           },
//         }
//       ];
//     const attachments = [
//         new Attachment(
//           qrCode.content,
//           qrCode.name,
//           'attachment'
//         )
//       ]
//     const emailParams = new EmailParams()
//         .setFrom(sentFrom)
//         .setSubject("Welcome to Harmony 2024: The JCI Nigeria Collegiate Conference!")
//         .setTo(recipients)
//         .setAttachments(attachments)
//         .setTemplateId('k68zxl2zjxklj905')
//         .setPersonalization(personalization);

//         try {
//           await mailerSend.email.send(emailParams)
//         } catch (error) {
//           console.log(error)
//         }
//     // mailersend.send(emailParams);
// }



module.exports = sendEmailNotification