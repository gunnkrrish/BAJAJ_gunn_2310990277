import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const OFFICIAL_EMAIL = "gunn0277.be23@chitkara.edu.in";

function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) throw "Invalid fibonacci input";
  const result = [];
  for (let i = 0; i < n; i++) {
    if (i === 0) result.push(0);
    else if (i === 1) result.push(1);
    else result.push(result[i - 1] + result[i - 2]);
  }
  return result;
}

function primeNum(arr) {
  if (!Array.isArray(arr)) throw "Prime expects array";
  return arr.filter(num => {
    if (!Number.isInteger(num) || num < 2) return false;
    for (let i = 2; i * i <= num; i++) {
      if (num % i === 0) return false;
    }
    return true;
  });
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

function hcf(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw "HCF expects array";
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw "LCM expects array";
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}
// console.log("API KEY LOADED:", process.env.GEMINI_API_KEY);
async function askAI(question) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Answer in exactly one word only."
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 5
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.log("GROQ ERROR:", err.response?.data || err.message);
    return "AI service error";
  }
}



app.get("/test-ai", async (req, res) => {
  const ans = await askAI("What is the capital of Maharashtra?");
  res.send(ans);
});

app.get("/health",(req, res)=>{
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post("/bfhl", async(req, res)=>{
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Exactly one key required"
      });
    }
    const key = keys[0];
    const value = req.body[key];
    let data;
    switch (key) {
      case "fibonacci":
        data = fibonacci(value);
        break;
      case "prime":
        data = primeNum(value);
        break;
      case "lcm":
        data = lcm(value);
        break;
      case "hcf":
        data = hcf(value);
        break;
      case "AI":
        data = await askAI(value);
        break;
      default:
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid key"
        });
    }
    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });
  } catch {
    res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: "Internal server error"
    });
  }
});

const PORT=process.env.PORT||3000;
export default app;
