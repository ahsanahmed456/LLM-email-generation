const express = require('express');
const app = express();
const mongoose = require("mongoose")
require('dotenv').config();
const { OpenAI } = require('openai');
const datasets = require('./models/dataset')

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
})


app.post('/runTest', async(req,res)=>{
    console.log("hit with , : ",  req.body)

const oldEmails = await datasets.find({id: '00TQU00000TlPjw2AF',whoidobject: 'Lead'}).select('description').sort({createddate:1});

const emailCategories = [
  "Scheduling",       // Meeting requests, confirmations, reminders
  "Follow-Up",        // Checking in after meetings, proposals, or silence
  "Request",          // Asking for input, documents, availability, etc.
  "Thank You",        // Appreciation after events, help, or support
  "Transactional",    // Contracts, proposals, credentials, status
  "Outreach",         // Cold/warm intros, referrals, networking
  "Issue",            // Apologies, complaints, clarifications
  "Announcement",     // Product launches, events, team changes
  "Internal"          // Team updates, memos, status reports
];

const painPoints = ['Fragmented Access Control',"Overexposure of Sensitive Data","Manual Data Discovery and Classification", "Complex Policy Management","Ineffective Audit and Compliance Reporting","Vendor Lock-in and Closed Standards","Risky Data Sharing","Delayed Cloud Adoption"] 

const message = `You are an assistant helping with professional email communication. I will give you the most recent email in an ongoing conversation.

Your tasks are:

1. Extract key context points with dates that summarize the interaction so far. Use all emails to build a coherent narrative of the ongoing relationship or situation between us and the potential customer.

2. Based on that context, determine the most appropriate type of next email. You must provide:
   - "gptEmailType": A specific and descriptive email type (e.g., "Meeting Reminder", "Follow-Up After Demo", "Request for Feedback").
   - "emailCategory": A general group chosen **strictly** from the list below.

✅ Allowed values for "emailCategory" (select one only):
${emailCategories.map(c => `- "${c}"`).join('\n')}

3. Decide the type of email and whether human interaction is needed **based on the latest email in the thread**. The earlier emails should still be used to understand overall context and tone.

4. Briefly explain **why this type** of email is appropriate next.

5. Indicate whether human interaction is required forward (e.g., a reply, meeting, or decision).

Return your response in the following strict JSON format:

{
  "contextPoints": [ "point 1", "point 2", "..." ],
  "gptEmailType": "Specific descriptive type",
  "emailCategory": "One of the allowed categories above",
  "reason": "Why this type of email is appropriate",
  "humanInteractionNeeded": true | false
}

Here is the latest email:

${oldEmails.map(item => item.description).join("\\n")}
`

    // console.log("message : ", message)

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }]
    });
    // const resParsed = JSON.parse(response.choices[0].message.content)
    // console.log(resParsed)

  const message2 = `here is a Product description: 
 
Privacera is a data security and governance platform designed to help enterprises manage and enforce data access policies across cloud and on-premises environments. It enables organizations to maintain compliance, ensure data privacy, and enforce fine-grained access controls at scale, particularly in complex, multi-cloud data architectures.
Key Capabilities of Privacera:
Unified Data Access Governance

Centralizes access controls across disparate data systems like AWS, Azure, Databricks, Snowflake, Google Cloud, and on-prem systems.
Fine-Grained Access Control

Implements detailed policies at the column, row, and attribute level, enabling secure and compliant data sharing without exposing sensitive data unnecessarily.
Automated Data Discovery and Classification

Scans and classifies sensitive data (e.g., PII, PHI) automatically using built-in discovery tools, making it easier to meet compliance standards like GDPR, CCPA, and HIPAA.
Policy-as-Code

Allows data teams to define and manage policies programmatically, enabling better integration with DevOps workflows.
Audit and Compliance Reporting

Provides a centralized audit trail for all data access activity, helping enterprises demonstrate compliance with regulatory requirements.
Support for Open Standards

Built on Apache Ranger, Privacera extends open-source technologies to support enterprise-scale deployments with additional features like role-based access control (RBAC), attribute-based access control (ABAC), and dynamic masking.
Data Sharing with Privacy Controls

Enables secure data sharing internally and externally while masking or restricting access to sensitive information.
Common Use Cases:
Regulatory compliance (GDPR, HIPAA, SOX)
Secure data democratization
Cloud migration security
Multi-cloud data governance
Privacy-preserving analytics and collaboration
Privacera is commonly adopted by large enterprises in industries like finance, healthcare, and telecommunications that need robust data security frameworks integrated with modern data lakes and cloud warehouses.


Instructions:
1) return object in this form {email:{subject:xxx,to:xxx,from: 'noreply@Loglens.io',content:xxx},type of email:xxx, meeting date set:xxx,human interaction needed forward:true/false,pain point:xxx}
2) When ever giving someone a date always give atleast a week buffer.


Conctext of old conversation:
${response.choices[0].message.content}`   

    const response2 = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message2 }]
    });

    let resParsed = JSON.parse(response2.choices[0].message.content)
    console.log(resParsed)

    resParsed.email.to = 'ahsan@loglens.io'

    const sendgridReadyEmailData = {
      trackingSettings: {
        clickTracking: { enable: true, enableText: true },
        openTracking: { enable: true },
      },
      customArgs: {
        userId: 'abc123',
        type: 'Test',
      },      
      to:resParsed.email.to,
      from:resParsed.email.from,
      html:`<p>${resParsed.email.content.replace(/\n/g, "<br>")}</p>`,
      subject:resParsed.email.subject
      // to:resParsed.to
    }

  sgMail
  .send(sendgridReadyEmailData)
  .then((anyRes) => {
    console.log('Email sent successfully');
    res.json({...sendgridReadyEmailData,sendgrid:anyRes});

  })
  .catch((error) => {
    console.error('Error sending email:', error.response.body);
  });



});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
