const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.json());

// ✅ Verify webhook (GET)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Handle incoming webhooks (POST)
app.post("/webhook", (req, res) => {
  const body = req.body;

  // Basic validation
  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        const field = change.field;
        const value = change.value;

        switch (field) {
          case "messages":
            handleMessageEvent(value);
            break;
          case "message_template_status_update":
            console.log("📋 Template update:", value);
            break;
          case "account_update":
            if (value.event === "VOLUME_BASED_PRICING_TIER_UPDATE") {
              console.log("💰 Volume Tier Update:", value.volume_tier_info);
            }
            break;
          default:
            console.log("ℹ️ Unknown webhook field:", field);
        }
      });
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ✅ Handle message events
function handleMessageEvent(value) {
  const messages = value.messages || [];
  const statuses = value.statuses || [];

  messages.forEach((msg) => {
    console.log("📩 Message received:", msg);
  });

  statuses.forEach((status) => {
    if (status.pricing) {
      const { pricing_model, type, category, billable } = status.pricing;
      console.log("💸 Pricing Info:", { pricing_model, type, category, billable });
    }
  });
}

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook listening on port ${PORT}`));
