const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor WhatsApp AI rodando!");
});

app.post("/", async (req, res) => {
  const { message, sender } = req.body;
  console.log(`📥 Mensagem recebida de ${sender}: ${message}`);
  try {
    const resposta = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const respostaTexto = resposta.data.choices[0].message.content;
    console.log(`🤖 Resposta do ChatGPT: ${respostaTexto}`);

    await axios.post(
      `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-messages`,
      {
        phone: sender,
        message: respostaTexto,
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao gerar ou enviar resposta:", error.message);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
