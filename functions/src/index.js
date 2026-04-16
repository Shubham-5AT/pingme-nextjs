const crypto = require("crypto");
const cors = require("cors");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");

const RAZORPAY_KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const SMTP_FROM = defineSecret("SMTP_FROM");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const corsHandler = cors({ origin: true });

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

const normalizeUsername = (value = "") => value.trim().toLowerCase();

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
};

const toSafePublicProfile = (docData, id) => {
  const nfc = docData?.nfcProfile || {};
  const profile = {
    orderId: id,
    username: String(nfc.username || ""),
    name: String(nfc.name || ""),
    companyName: nfc.companyName ? String(nfc.companyName) : "",
    jobTitle: nfc.jobTitle ? String(nfc.jobTitle) : "",
    email: nfc.email ? String(nfc.email) : "",
    phone: nfc.phone ? String(nfc.phone) : "",
    bio: nfc.bio ? String(nfc.bio) : "",
    businessTags: nfc.businessTags ? String(nfc.businessTags) : "",
    website: nfc.website ? String(nfc.website) : "",
    address: nfc.address ? String(nfc.address) : "",
    linkedin: nfc.linkedin ? String(nfc.linkedin) : "",
    twitter: nfc.twitter ? String(nfc.twitter) : "",
    instagram: nfc.instagram ? String(nfc.instagram) : "",
    youtube: nfc.youtube ? String(nfc.youtube) : "",
    facebook: nfc.facebook ? String(nfc.facebook) : "",
    profilePhoto: nfc.profilePhoto ? String(nfc.profilePhoto) : "",
    projects: Array.isArray(nfc.projects)
      ? nfc.projects
          .filter((project) => project && project.name)
          .map((project) => ({
            name: String(project.name || ""),
            description: project.description ? String(project.description) : "",
            link: project.link ? String(project.link) : "",
            photo: project.photo ? String(project.photo) : "",
          }))
      : [],
  };

  return profile;
};

const getMailTransporter = () => {
  const host = (SMTP_HOST.value() || process.env.SMTP_HOST || "").trim();
  const port = Number((SMTP_PORT.value() || process.env.SMTP_PORT || "587").trim());
  const user = (SMTP_USER.value() || process.env.SMTP_USER || "").trim();
  const pass = (SMTP_PASS.value() || process.env.SMTP_PASS || "").trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendBookingConfirmationEmail = async ({ email, fullName, bookingId, items, totalAmount }) => {
  if (!email) {
    return;
  }

  const transporter = getMailTransporter();
  const fromEmail = (
    SMTP_FROM.value() ||
    SMTP_USER.value() ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    ""
  ).trim();

  if (!transporter || !fromEmail) {
    console.warn("Booking confirmation email skipped due to missing SMTP configuration.");
    return;
  }

  const itemsLabel = Array.isArray(items) && items.length
    ? items.map((item) => `${item?.title || "Item"} x${item?.quantity || 1}`).join(", ")
    : "-";

  const totalLabel = Number(totalAmount || 0).toFixed(2);

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: `Booking Confirmed - ${bookingId}`,
    text: [
      `Hi ${fullName || "Customer"},`,
      "",
      "Your booking is confirmed.",
      `Booking ID: ${bookingId}`,
      `Items: ${itemsLabel}`,
      `Total Paid: INR ${totalLabel}`,
      "",
      "Thank you for choosing PingME.",
    ].join("\n"),
    html: `
      <p>Hi ${fullName || "Customer"},</p>
      <p>Your booking is confirmed.</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Items:</strong> ${itemsLabel}</p>
      <p><strong>Total Paid:</strong> INR ${totalLabel}</p>
      <p>Thank you for choosing PingME.</p>
    `,
  });
};

const getRazorpayClient = () => {
  const keyId = (RAZORPAY_KEY_ID.value() || process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (RAZORPAY_KEY_SECRET.value() || process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured in Cloud Functions env.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

exports.createOrder = onRequest({
  region: "asia-south1",
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
}, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { amount, currency = "INR", receipt, notes = {} } = req.body || {};

      if (!amount || Number.isNaN(Number(amount))) {
        res.status(400).send("Valid amount is required.");
        return;
      }

      const razorpay = getRazorpayClient();
      const order = await razorpay.orders.create({
        amount: Number(amount),
        currency,
        receipt: receipt || `pingme_${Date.now()}`,
        notes,
      });

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      });
    } catch (error) {
      console.error("createOrder error", error);
      res.status(500).send("Failed to create order.");
    }
  });
});

exports.verifyPayment = onRequest({
  region: "asia-south1",
  secrets: [RAZORPAY_KEY_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM],
}, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { orderId, paymentId, signature, prebooking } = req.body || {};

      if (!orderId || !paymentId || !signature || !prebooking) {
        res.status(400).send("Missing required payment verification fields.");
        return;
      }

      const keySecret = (RAZORPAY_KEY_SECRET.value() || process.env.RAZORPAY_KEY_SECRET || "").trim();
      if (!keySecret) {
        res.status(500).send("Razorpay secret is not configured.");
        return;
      }

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (expectedSignature !== signature) {
        res.status(400).send("Invalid payment signature.");
        return;
      }

      const paymentData = {
        orderId,
        paymentId,
        signature,
        gateway: "razorpay",
        amount: prebooking?.payment?.amount || null,
        currency: prebooking?.payment?.currency || "INR",
        userId: prebooking?.userId || null,
        email: prebooking?.email || null,
        status: "captured",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("payments").add(paymentData);

      const prebookingData = {
        ...prebooking,
        status: "confirmed",
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const prebookingRef = await db.collection("prebookings").add(prebookingData);

      try {
        await sendBookingConfirmationEmail({
          email: prebooking?.email,
          fullName: prebooking?.fullName,
          bookingId: prebookingRef.id,
          items: prebooking?.items,
          totalAmount: prebooking?.totalAmount,
        });
      } catch (mailErr) {
        console.error("booking confirmation email error", mailErr);
      }

      res.status(200).json({
        success: true,
        prebookingId: prebookingRef.id,
      });
    } catch (error) {
      console.error("verifyPayment error", error);
      res.status(500).send("Failed to verify payment.");
    }
  });
});

exports.getPublicNfcProfile = onRequest({
  region: "asia-south1",
}, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const username = normalizeUsername(String(req.query.username || ""));

      if (!USERNAME_PATTERN.test(username)) {
        res.status(400).json({ error: "Invalid username." });
        return;
      }

      const snapshot = await db
        .collection("prebookings")
        .where("nfcProfile.username", "==", username)
        .get();

      if (snapshot.empty) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }

      const confirmedDocs = snapshot.docs.filter(
        (docSnap) => String(docSnap.data()?.status || "") === "confirmed"
      );

      if (!confirmedDocs.length) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }

      const latest = confirmedDocs.sort((a, b) => {
        const aData = a.data();
        const bData = b.data();

        const aTime = Math.max(
          toMillis(aData.updatedAt),
          toMillis(aData.confirmedAt),
          toMillis(aData.createdAt)
        );
        const bTime = Math.max(
          toMillis(bData.updatedAt),
          toMillis(bData.confirmedAt),
          toMillis(bData.createdAt)
        );

        return bTime - aTime;
      })[0];

      res.set("Cache-Control", "public, max-age=120");
      res.status(200).json({
        profile: toSafePublicProfile(latest.data(), latest.id),
      });
    } catch (error) {
      console.error("getPublicNfcProfile error", error);
      res.status(500).json({ error: "Failed to fetch profile." });
    }
  });
});
