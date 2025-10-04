// app.js
const express = require("express");
const app = express();

app.use(express.json());

// ✅ Verification endpoint (GET)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // Set in Render dashboard

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully!");
      res.status(200).send(challenge); // Must return the challenge number
    } else {
      console.log("❌ Verification failed. Token mismatch.");
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// ✅ Handle incoming webhook notifications (POST)
app.post("/webhook", (req, res) => {
  const body = req.body;

  // Check if this is a WhatsApp Business webhook
  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        const field = change.field;
        const value = change.value;

        switch (field) {
          case "messages":
            handleIncomingMessage(value);
            break;
          case "message_template_status_update":
            console.log("📋 Template status update:", value);
            break;
          case "account_update":
            handleAccountUpdate(value);
            break;
          default:
            console.log("ℹ️ Unknown field:", field);
        }
      });
    });

    res.sendStatus(200); // Always respond 200 OK
  } else {
    res.sendStatus(404);
  }
});

// ✅ Handle incoming messages
function handleIncomingMessage(value) {
  const messages = value.messages || [];
  const statuses = value.statuses || [];

  messages.forEach((msg) => {
    console.log("📩 Incoming message:", JSON.stringify(msg, null, 2));
  });

  statuses.forEach((status) => {
    if (status.pricing) {
      const { pricing_model, type, category, billable } = status.pricing;
      console.log("💸 Pricing info:", { pricing_model, type, category, billable });
    } else {
      console.log("📦 Message status:", JSON.stringify(status, null, 2));
    }
  });
}

// ✅ Handle account updates (volume-based pricing tiers)
function handleAccountUpdate(value) {
  if (value.event === "VOLUME_BASED_PRICING_TIER_UPDATE") {
    console.log("💰 Tier update:", value.volume_tier_info);
  } else {
    console.log("ℹ️ Account update:", value);
  }
}

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook server running on port ${PORT}`));
