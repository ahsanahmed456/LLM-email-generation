const express = require('express');
const app = express();
const mongoose = require("mongoose")
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require("crypto")
const datasets = require('./models/dataset')
const adaptiveSequenceEmailTemplatesCTAPerLead = require('./models/adaptiveSequenceEmailTemplatesCTAPerLead')
const adaptiveSequenceEmailsSentHistory = require('./models/adaptiveSequenceEmailsSentHistory')

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then((mongodbres)=>{
    console.log("mongodb connected")
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
});

app.use(express.json());

app.get('/', async(req,res)=>{
  
  console.log("hi from Email generator's server")
  res.send({"res":"Alive"})
})


app.post('/runTest', async(req,res)=>{
    console.log("hit with , : ",  req.body)
const RandomId = crypto.randomUUID()

const LeadEmails = await adaptiveSequenceEmailTemplatesCTAPerLead.find({id:"00QQU000001XILn2AO",sf_organization_id:"00D4T000000DicaUAC"}).limit(1).lean();
const emailData =  LeadEmails[0] 
const replyTo = `ahsan+${RandomId}@loglens.io`
const from = 'testmail@ahsan-mailer.loglens.io'
const LeadId = emailData['id']
console.log("LeadEmails : ", emailData)
// userId=${loglens_userId}&messageId=${loglens_messageId}

    function injectCTAValues(emailHtml, userId, messageId) {
        return emailHtml
          .replace(/\$\{loglens_userId\}/g, userId)
          .replace(/\$\{loglens_messageId\}/g, messageId);
    }

    // const to = 'gokul@loglens.io'
    const to = 'dhivya@loglens.io'
    const sendgridReadyEmailData = {
      trackingSettings: {
        clickTracking: { enable: true, enableText: true },
        openTracking: { enable: true },
      },
      customArgs: {
        LeadId: LeadId,
        EmailID:RandomId,
        type: 'AdaptiveSequenceEvent',
      },      
      to:to,
      from:from,
      html:injectCTAValues(emailData['personalizedEmail']['email'],LeadId,RandomId),
      subject:emailData['personalizedEmail']['subject'],
      replyTo: replyTo
    }

  await adaptiveSequenceEmailsSentHistory.create({sf_organization_id:"00D4T000000DicaUAC",criteria:emailData['criteria'],alreadyCounted:false,html:injectCTAValues(emailData['personalizedEmail']['email'],LeadId,RandomId),replyTo: replyTo,to:to,from:from,'cta':emailData['cta'],'painpoint':emailData['painpoint'],EmailID:RandomId,LeadId: LeadId,email:emailData['personalizedEmail']['email'],})

  sgMail
  .send(sendgridReadyEmailData)
  .then((anyRes) => {
    console.log('Email sent successfully');
    res.json({...sendgridReadyEmailData,sendgrid:anyRes});

  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });



});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
