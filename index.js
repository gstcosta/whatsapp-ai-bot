const express = require("express");
const axios = require("axios");
const app = express();
const bodyParser = require("body-parser");

// Habilitar CORS para o bot funcionar com a Z-API
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());

// Carregar variáveis de ambiente
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

const port = process.env.PORT || 3000;

// Função para enviar a resposta para o WhatsApp via Z-API
const sendMessage = async (to, message) => {
  try {
    await axios.post(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/sendMessage`,
      {
        phone: to,
        message: message,
      }
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem para o WhatsApp:", error);
  }
};

// Função para interagir com a OpenAI (ChatGPT)
const getOpenAIResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: message,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Erro ao interagir com a OpenAI:", error);
    return "Desculpe, houve um erro ao processar sua mensagem.";
  }
};

// Endpoint que recebe as mensagens do WhatsApp via Z-API
app.post("/", async (req, res) => {
  console.log(">> BODY RECEBIDO:", req.body); // Para depurar se o webhook está funcionando
  const { sender, message } = req.body;

  // Resposta automática da OpenAI
  const aiResponse = await getOpenAIResponse(message);

  // Enviar a resposta da IA para o WhatsApp
  await sendMessage(sender, aiResponse);

  // Responder com sucesso para o Z-API
  res.status(200).send("Mensagem processada");
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

