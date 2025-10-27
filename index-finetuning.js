const express = require('express');
const app = express();
const mongoose = require("mongoose")
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require("crypto")
const datasets = require('./models/dataset')
const adaptiveSequenceEmailTemplatesCTAPerLead = require('./models/adaptiveSequenceEmailTemplatesCTAPerLead')
const adaptiveSequenceEmailsSentHistory = require('./models/adaptiveSequenceEmailsSentHistory')
const adaptiveSequenceDataForFineTuning = require('./models/adaptiveSequenceDataForFineTuning')
const fs = require('fs'); // <- add this

mongoose.connect(process.env.MONGO_URI).then((mongodbres)=>{
    console.log("mongodb connected")
})


const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



/**
 * Simple demo route: fine-tune GPT-4.1-mini on a dummy dataset
 */
app.get('/fine-tune-demo', async (req, res) => {
  try {
    // 1. Create a dummy JSONL file
    const dummyFile = 'dummy.jsonl';
    const count = await adaptiveSequenceDataForFineTuning.countDocuments({})
    console.log("data : ", count)
    
    const data = await adaptiveSequenceDataForFineTuning.find({}).select("-_id messages")
    console.log("data : ", data)
    const dummyData = data


// const dummyData = [
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Say hello politely.' },
//       { role: 'assistant', content: 'Hello! How are you doing today?' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Make this formal: Thanks a lot.' },
//       { role: 'assistant', content: 'Thank you very much.' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Respond kindly: I will be late.' },
//       { role: 'assistant', content: 'No worries, take your time. I’ll be here when you arrive.' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Rephrase politely: Send me the file.' },
//       { role: 'assistant', content: 'Could you please send me the file when you get a chance?' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Make this softer: Stop talking.' },
//       { role: 'assistant', content: 'Could you please pause for a moment?' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Say goodbye politely.' },
//       { role: 'assistant', content: 'Goodbye! I hope you have a wonderful day.' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Make this more respectful: What do you want?' },
//       { role: 'assistant', content: 'May I ask what you would like?' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Say good morning politely.' },
//       { role: 'assistant', content: 'Good morning! I hope your day starts off well.' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Make this formal: I need help.' },
//       { role: 'assistant', content: 'I would appreciate your assistance.' }
//     ]
//   },
//   {
//     messages: [
//       { role: 'system', content: 'You are a polite assistant.' },
//       { role: 'user', content: 'Say thank you in a kind way.' },
//       { role: 'assistant', content: 'I sincerely appreciate it, thank you so much.' }
//     ]
//   }
// ];


    fs.writeFileSync(
      dummyFile,
      dummyData.map(line => JSON.stringify(line)).join('\n')
    );

    // 2. Upload file to OpenAI
    const file = await client.files.create({
      file: fs.createReadStream(dummyFile),
      purpose: 'fine-tune',
    });

    // 3. Start fine-tuning job on gpt-4.1-mini
    const job = await client.fineTuning.jobs.create({
      model: 'gpt-4.1-mini-2025-04-14',
      // model: 'gpt-4.1-nano-2025-04-14',
      training_file: file.id,
      suffix: 'demo-run-email-moving-pieces'
    });

    res.json({
      ok: true,
      fileId: file.id,
      jobId: job.id,
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

