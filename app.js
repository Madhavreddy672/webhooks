import express from "express";
const app = express();
app.use(express.json());

// verification handshake
app.get("/webhook", (req, res) => {
  const verify_token = "test123"; // must match what you entered in dashboard
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === verify_token) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// receive messages / statuses
app.post("/webhook", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => console.log("Webhook listening on port 3000"));
