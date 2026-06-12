/**
 * nfc.routes.js
 * 
 * Server-side Firestore operations for the "nfcProfiles" collection.
 * Mirrors the Firebase Cloud Functions: getPublicNfcProfile,
 * syncNfcProfileDraft, deleteNfcProfileDraft.
 * 
 * Routes:
 *   GET    /api/nfc/profile?username=   → public profile lookup (no auth)
 *   POST   /api/nfc/sync-draft          → save/update draft profile (authenticated)
 *   DELETE /api/nfc/draft/:profileId    → delete a draft profile (authenticated)
 */

'use strict';

const { Router }    = require('express');
const { db, admin } = require('../firebase-admin');
const authenticate  = require('../middleware/authenticate');

const router = Router();

const NFC_PROFILES_COLLECTION = 'nfcProfiles';

// ── Helpers ──────────────────────────────────────────────────────────────────

const sanitizeText = (v) =>
  typeof v === 'string' ? v.trim().replace(/<[^>]+>/g, '') : '';

const normalizeUsername = (raw) =>
  String(raw || '').trim().toLowerCase();

const isConfirmedProfile = (data) => {
  if (!data) return false;
  if (data.status === 'confirmed') return true;
  return data.updatedSource && data.updatedSource !== 'prePaymentDraft';
};

const buildProfilePayload = (profileId, profile) => {
  const username = normalizeUsername(profile.username) ||
    normalizeUsername(`profile-${String(profileId).slice(0, 8)}`);

  return {
    orderId:  sanitizeText(String(profileId)),
    username,
    name:     sanitizeText(profile.name || ''),
    ...(profile.companyName           ? { companyName:           sanitizeText(profile.companyName)           } : {}),
    ...(profile.jobTitle              ? { jobTitle:              sanitizeText(profile.jobTitle)              } : {}),
    ...(profile.email                 ? { email:                 sanitizeText(profile.email)                 } : {}),
    ...(profile.phone                 ? { phone:                 sanitizeText(profile.phone)                 } : {}),
    ...(profile.bio                   ? { bio:                   sanitizeText(profile.bio)                   } : {}),
    ...(profile.businessOverview      ? { businessOverview:      sanitizeText(profile.businessOverview)      } : {}),
    ...(profile.businessTags          ? { businessTags:          sanitizeText(profile.businessTags)          } : {}),
    ...(profile.website               ? { website:               sanitizeText(profile.website)               } : {}),
    ...(profile.address               ? { address:               sanitizeText(profile.address)               } : {}),
    ...(profile.companyAddress        ? { companyAddress:        sanitizeText(profile.companyAddress)        } : {}),
    ...(profile.googleMapsLink        ? { googleMapsLink:        sanitizeText(profile.googleMapsLink)        } : {}),
    ...(profile.linkedin              ? { linkedin:              sanitizeText(profile.linkedin)              } : {}),
    ...(profile.twitter               ? { twitter:               sanitizeText(profile.twitter)               } : {}),
    ...(profile.instagram             ? { instagram:             sanitizeText(profile.instagram)             } : {}),
    ...(profile.youtube               ? { youtube:               sanitizeText(profile.youtube)               } : {}),
    ...(profile.facebook              ? { facebook:              sanitizeText(profile.facebook)              } : {}),
    ...(profile.profilePhoto          ? { profilePhoto:          sanitizeText(profile.profilePhoto)          } : {}),
    ...(profile.upiId                 ? { upiId:                 sanitizeText(profile.upiId)                 } : {}),
    ...(profile.razorpayLink          ? { razorpayLink:          sanitizeText(profile.razorpayLink)          } : {}),
    ...(profile.appointmentBookingLink ? { appointmentBookingLink: sanitizeText(profile.appointmentBookingLink) } : {}),
    ...(Array.isArray(profile.projects) && profile.projects.length > 0
      ? {
          projects: profile.projects
            .filter(p => p && sanitizeText(p.name))
            .map(p => ({
              name:        sanitizeText(p.name),
              ...(p.description ? { description: sanitizeText(p.description) } : {}),
              ...(p.link        ? { link:        sanitizeText(p.link)        } : {}),
              ...(p.photo       ? { photo:       sanitizeText(p.photo)       } : {}),
              ...(p.type        ? { type:        sanitizeText(p.type)        } : {}),
            })),
        }
      : {}),
    ...(Array.isArray(profile.documents) && profile.documents.length > 0
      ? {
          documents: profile.documents
            .filter(d => d && sanitizeText(d.title) && sanitizeText(d.url))
            .map(d => ({
              title: sanitizeText(d.title),
              url:   sanitizeText(d.url),
              ...(d.type ? { type: sanitizeText(d.type) } : {}),
            })),
        }
      : {}),
  };
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/nfc/profile?username=<username>     (Public — no auth required)
// Fetch a confirmed public NFC profile by username.
// Mirrors the Cloud Function: getPublicNfcProfile
// ────────────────────────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  const username = normalizeUsername(String(req.query.username || ''));

  if (!username) {
    return res.status(400).json({ error: 'username query param is required' });
  }

  try {
    const snapshot = await db
      .collection(NFC_PROFILES_COLLECTION)
      .where('username', '==', username)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const confirmedDoc = snapshot.docs.find(d => isConfirmedProfile(d.data()));

    if (!confirmedDoc) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profile: {
        ...confirmedDoc.data(),
        orderId: confirmedDoc.id,
      },
    });
  } catch (err) {
    console.error('[NFC] getPublicProfile error:', err);
    res.status(500).json({ error: 'Failed to load NFC profile' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/nfc/sync-draft     (Authenticated)
// Body: { profileId: string, nfcProfile: NFCProfile }
// Save or update an NFC profile as a draft.
// Mirrors the Cloud Function: syncNfcProfileDraft
// ────────────────────────────────────────────────────────────────────────────
router.post('/sync-draft', authenticate, async (req, res) => {
  const { profileId, nfcProfile } = req.body || {};

  if (!profileId || typeof profileId !== 'string') {
    return res.status(400).json({ error: 'profileId is required' });
  }

  if (!nfcProfile || typeof nfcProfile !== 'object') {
    return res.status(400).json({ error: 'nfcProfile is required' });
  }

  try {
    const payload = buildProfilePayload(profileId, nfcProfile);

    if (!payload.name) {
      return res.status(400).json({ error: 'Profile name is required' });
    }

    const docRef = db.collection(NFC_PROFILES_COLLECTION).doc(String(profileId));

    await docRef.set(
      {
        ...payload,
        status:        'draft',
        updatedSource: 'prePaymentDraft',
        updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
        createdAt:     admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ success: true, username: payload.username });
  } catch (err) {
    console.error('[NFC] syncDraft error:', err);
    res.status(500).json({ error: 'Failed to sync NFC profile draft' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/nfc/draft/:profileId     (Authenticated)
// Delete a draft NFC profile. Confirmed profiles are preserved.
// Mirrors the Cloud Function: deleteNfcProfileDraft
// ────────────────────────────────────────────────────────────────────────────
router.delete('/draft/:profileId', authenticate, async (req, res) => {
  const { profileId } = req.params;

  if (!profileId) {
    return res.status(400).json({ error: 'profileId is required' });
  }

  try {
    const docRef = db.collection(NFC_PROFILES_COLLECTION).doc(String(profileId));
    const snap   = await docRef.get();

    if (!snap.exists) {
      return res.json({ success: true, deleted: false });
    }

    const data       = snap.data() || {};
    const isConfirmed =
      data.status === 'confirmed' && data.updatedSource !== 'prePaymentDraft';

    if (isConfirmed) {
      return res.json({ success: true, deleted: false, reason: 'confirmed profile preserved' });
    }

    await docRef.delete();
    res.json({ success: true, deleted: true });
  } catch (err) {
    console.error('[NFC] deleteDraft error:', err);
    res.status(500).json({ error: 'Failed to delete NFC draft' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/nfc/confirm/:profileId     (Admin only)
// Promote a draft profile to confirmed status.
// ────────────────────────────────────────────────────────────────────────────
router.post('/confirm/:profileId', authenticate, async (req, res) => {
  if (!req.user?.admin) return res.status(403).json({ error: 'Admin access required' });

  const { profileId } = req.params;

  try {
    const docRef = db.collection(NFC_PROFILES_COLLECTION).doc(String(profileId));
    await docRef.update({
      status:        'confirmed',
      updatedSource: 'adminConfirm',
      updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[NFC] confirmProfile error:', err);
    res.status(500).json({ error: 'Failed to confirm NFC profile' });
  }
});

module.exports = router;
