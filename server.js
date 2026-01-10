import express from 'express';
import cors from 'cors';
import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEMORY_FILE = path.join(__dirname, 'memory.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// GET /api/state - Consistent with your requirement
app.get('/api/state', (req, res) => {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const data = fs.readFileSync(MEMORY_FILE, 'utf8');
      return res.json({ state: JSON.parse(data) });
    }
    res.json({ state: null });
  } catch (err) {
    res.status(500).json({ error: 'Memory Retrieval Fault' });
  }
});

// POST /api/state - Consistent with your requirement
app.post('/api/state', (req, res) => {
  try {
    const { state } = req.body;
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(state, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Memory Storage Fault' });
  }
});

const mistralApiKey = process.env.MISTRAL_API_KEY || 'JCp4pLqmfVTSQXRTFZ61Bf5Q6aV7fXwb';
const client = new Mistral({ apiKey: mistralApiKey });

// FIXED: AI Proxy now accepts both formats
app.post('/api/mistral/chat', async (req, res) => {
  try {
    let { messages, model, temperature, max_tokens, systemInstruction, prompt } = req.body;
    
    // Handle standard Mistral messages array OR legacy instruction/prompt format
    if (!messages && systemInstruction && prompt) {
      messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ];
    }

    const chatResponse = await client.chat.complete({
      model: model || 'mistral-large-latest',
      messages: messages,
      temperature: temperature || 0.7,
      maxTokens: max_tokens || 2000
    });
    
    res.json(chatResponse); // Return the full Mistral response
  } catch (error) {
    console.error('Neural Fault:', error);
    res.status(500).json({ error: 'Neural link failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Backend Online at http://localhost:${PORT}`);
});
