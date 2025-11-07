const express = require('express');
const app = express();
const mongoose = require("mongoose")
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require("crypto")
const datasets = require('./models/datasets.js')
const adaptiveSequenceEmailTemplatesCTAPerLead = require('./models/adaptiveSequenceEmailTemplatesCTAPerLead')
const adaptiveSequenceEmailsSentHistory = require('./models/adaptiveSequenceEmailsSentHistory')
const adaptiveSequencePainPointsUsedPerLead = require('./models/adaptiveSequencePainPointsUsedPerLead.js')
const adaptiveSequenceSubdomains = require('./models/adaptiveSequenceSubdomains')
const sendGridSubusersApiKeys = require('./models/sendGridSubusersApiKeys')
const adaptiveSequenceSegmentsData = require('./models/adaptiveSequenceSegmentsData')

const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY_NEW);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


function mailClientFor(subuserApiKey) {
  const m = require('@sendgrid/mail');
  m.setApiKey(subuserApiKey);
  return m;
}

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

    const DomainsRaw = await adaptiveSequenceSubdomains.findOne({sf_organization_id: "00D4T000000DicaUAC",active:true}).lean()
    const Domains = DomainsRaw
    
       const replyTo = Domains['reply_to']
       const cc = Domains['cc']
       const bcc = Domains['bcc']    

    if (!Domains || !Domains.FQDN) {
      console.log('Domains not found');
      return
    }

    
    // const leadName = LeadRawData['name']
    // const leadEmail = LeadRawData['email']
    
       const subuserData = await sendGridSubusersApiKeys.findOne({ sf_organization_id: "00D4T000000DicaUAC" }).lean();
       
       if(!subuserData) return

    const apikey = subuserData['api_key']

    if (!apikey ) {
      return
    }

    const Client = mailClientFor(apikey)


    const from = `${Domains['SendEmailUserName']}@${Domains['ROOT_DOMAIN']}`
    // const from = `governance@${Domains['ROOT_DOMAIN']}`
    // const from = "governance@em3456.ai.loglens.io"

    const sendername = Domains['name'] || ""


function injectCTAValues(emailHtml, userId, messageId,receiverName,sendername) {
  return emailHtml
    .replace(/\$\{loglens_userId\}/g, userId)
    .replace(/\$\{loglens_messageId\}/g, messageId)
    .replace(
      /(\{\{\s*(first[_\s]?name|name)\s*\}\}|\{\s*(first[_\s]?name|name)\s*\}|\[\s*(first[_\s]?name|name)\s*\])/gi,
      receiverName
    )
    .replace(
      /(\{\{\s*(your[_\s]?name|sender[_\s]?name)\s*\}\}|\{\s*(your[_\s]?name|sender[_\s]?name)\s*\}|\[\s*(your[_\s]?name|sender[_\s]?name)\s*\])/gi,
      sendername
    );    
}

const LeadEmails = await adaptiveSequenceEmailTemplatesCTAPerLead.find({id:"00QQU000001wPtJ2AU",sf_organization_id:"00D4T000000DicaUAC"}).limit(1).lean();
// const LeadEmails = await adaptiveSequenceEmailTemplatesCTAPerLead.find({sf_organization_id:"00D4T000000DicaUAC"}).limit(500).lean();

for(let emailData of LeadEmails){
// const emailData =  LeadEmails[0] 
// const replyTo = `ahsan+${RandomId}@loglens.io`
// const from = 'testmail@ahsan-mailer.loglens.io'
const LeadId = emailData['id']
// console.log("LeadEmails : ", emailData)

const EmailData = await adaptiveSequenceSegmentsData.findOne({ids:"00QQU000001wPtJ2AU"}).lean()
const LLMEmail = EmailData['LLMModifiedEmail'] || false
// console.log("LLMEmail : ", LLMEmail)

// const LeadRawData = await LeadLatestWithDaysInStage.findOne({id: LeadId}).lean()

// userId=${loglens_userId}&messageId=${loglens_messageId}

    // const to = 'operations@loglens.io'
    // const to = 'info@loglens.io'
    // const to = 'jasmeet.saini@privacera.com'
    const to = 'ibby.rahmani@privacera.com'
    // const to = 'dhivya@loglens.io'
    // const to = 'zaid@loglens.io'

    const receiverName = 'Ibby'   
    // const receiverName = 'Jasmeet'   
    // const receiverName = 'Zaid'   
    // const receiverName = 'Gokul'   
    // const receiverName = LeadRawData['name']


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
      
      personalizations: [
        {
          to: [{ email: to }],
          // cc: cc ? [{ email: cc }] : [],
          // bcc: bcc ? [{ email: bcc }] : [],
          ...(cc ? { cc: [{ email: cc }] } : {}),
          ...(bcc ? { bcc: [{ email: bcc }] } : {}),
        },
      ],      

      from: { email: from, name: sendername },
      html:injectCTAValues(LLMEmail?LLMEmail:emailData['personalizedEmail']['email'],LeadId,RandomId,receiverName,sendername),
      subject:emailData['personalizedEmail']['subject'],
      replyTo: replyTo
    }

  await adaptiveSequenceEmailsSentHistory.create({sf_organization_id:"00D4T000000DicaUAC",criteria:emailData['criteria'],alreadyCounted:false,html:injectCTAValues(emailData['personalizedEmail']['email'],LeadId,RandomId,receiverName,sendername),replyTo: replyTo,to:to,from:from,'cta':emailData['cta'],'painpoint':emailData['painpoint'],EmailID:RandomId,LeadId: LeadId,email:emailData['personalizedEmail']['email'],emailTemplate:emailData['emailTemplate'],emailDesign:emailData['emailDesign']})
  await adaptiveSequencePainPointsUsedPerLead.findOneAndUpdate({ sf_organization_id: "00D4T000000DicaUAC" ,LeadId: LeadId},{ $addToSet: { Usedpainpoints: emailData['painpoint'] } },{ upsert: true, new: true });

  Client
  .send(sendgridReadyEmailData)
  .then((anyRes) => {
    console.log('Email sent successfully');
    res.json({...sendgridReadyEmailData,sendgrid:anyRes});

  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });
}

});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
