/**
 * products.routes.js
 * 
 * Server-side Firestore + Storage operations for the "products" and
 * "productCategories" collections.
 * Mirrors client-side lib/productService.ts
 * 
 * Routes:
 *   GET    /api/products                        → list all products (public)
 *   GET    /api/products/:id                    → get single product (public)
 *   POST   /api/products                        → create product (admin)
 *   PUT    /api/products/:id                    → update product (admin)
 *   DELETE /api/products/:id                    → delete product (admin)
 * 
 *   GET    /api/products/categories             → list all categories (public)
 *   POST   /api/products/categories/:slug       → create/update category (admin)
 *   DELETE /api/products/categories/:slug       → delete category (admin)
 *   PATCH  /api/products/categories/:slug/rename → rename category (admin)
 */

'use strict';

const { Router }    = require('express');
const { db, admin, storage } = require('../firebase-admin');
const authenticate  = require('../middleware/authenticate');
const multer        = require('multer');

const router   = Router();
const upload   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

const PRODUCTS_COLLECTION   = 'products';
const CATEGORIES_COLLECTION = 'productCategories';

// ── Helpers ──────────────────────────────────────────────────────────────────

const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.user.admin === true) return next();
  return res.status(403).json({ error: 'Admin access required' });
};

const normalizeCategorySlug = (raw) =>
  String(raw || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const normalizeFeatures = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(f => typeof f === 'string').map(f => f.trim()).filter(Boolean);
};

const mapProduct = (snap) => ({ id: snap.id, ...snap.data() });

// ────────────────────────────────────────────────────────────────────────────
// GET /api/products              (Public)
// List all products from Firestore.
// ────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
    const products = snapshot.docs.map(mapProduct);
    res.json({ products, total: products.length });
  } catch (err) {
    console.error('[Products] list error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/products/categories   (Public)
// ────────────────────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const snapshot = await db.collection(CATEGORIES_COLLECTION).get();
    const categories = {};
    snapshot.docs.forEach(d => { categories[d.id] = d.data(); });
    res.json({ categories });
  } catch (err) {
    console.error('[Products] listCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/products/:id          (Public)
// ────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection(PRODUCTS_COLLECTION).doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(snap));
  } catch (err) {
    console.error('[Products] getOne error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/products             (Admin)
// Body: { id?, categorySlug, title, price, originalPrice?, image?, emoji?,
//         popular?, features? }
// ────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const body = req.body || {};

  if (!body.title || !body.price) {
    return res.status(400).json({ error: 'title and price are required' });
  }

  const id           = body.id || db.collection(PRODUCTS_COLLECTION).doc().id;
  const categorySlug = normalizeCategorySlug(body.categorySlug) || 'uncategorized';

  const docData = {
    id,
    categorySlug,
    title:        String(body.title).trim(),
    price:        String(body.price).trim(),
    popular:      Boolean(body.popular),
    features:     normalizeFeatures(body.features),
    updatedAt:    admin.firestore.FieldValue.serverTimestamp(),
    ...(body.originalPrice ? { originalPrice: String(body.originalPrice).trim() } : {}),
    ...(body.image         ? { image:         String(body.image).trim()          } : {}),
    ...(body.emoji         ? { emoji:         String(body.emoji).trim()          } : {}),
  };

  try {
    await db.collection(PRODUCTS_COLLECTION).doc(id).set(
      { ...docData, createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('[Products] create error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/products/:id          (Admin)
// ────────────────────────────────────────────────────────────────────────────
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const body = req.body || {};
  const { id } = req.params;

  const update = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (body.title)         update.title        = String(body.title).trim();
  if (body.price)         update.price        = String(body.price).trim();
  if (body.categorySlug)  update.categorySlug = normalizeCategorySlug(body.categorySlug) || 'uncategorized';
  if (body.originalPrice) update.originalPrice = String(body.originalPrice).trim();
  if (body.image)         update.image        = String(body.image).trim();
  if (body.emoji)         update.emoji        = String(body.emoji).trim();
  if (typeof body.popular   !== 'undefined') update.popular   = Boolean(body.popular);
  if (typeof body.features  !== 'undefined') update.features  = normalizeFeatures(body.features);

  try {
    await db.collection(PRODUCTS_COLLECTION).doc(id).update(update);
    res.json({ success: true, id });
  } catch (err) {
    console.error('[Products] update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/products/:id       (Admin)
// ────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection(PRODUCTS_COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('[Products] delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/products/categories/:slug    (Admin)
// Create or update a product category metadata document.
// ────────────────────────────────────────────────────────────────────────────
router.post('/categories/:slug', authenticate, requireAdmin, async (req, res) => {
  const slug = normalizeCategorySlug(req.params.slug) || 'uncategorized';
  const body = req.body || {};

  const docData = {
    ...(body.name        ? { name:        String(body.name)        } : {}),
    ...(body.description ? { description: String(body.description) } : {}),
    ...(body.icon        ? { icon:        String(body.icon)        } : {}),
    ...(body.coverImage  ? { coverImage:  String(body.coverImage)  } : {}),
    ...(body.gradient    ? { gradient:    String(body.gradient)    } : {}),
    ...(body.howToUse    ? { howToUse:    String(body.howToUse)    } : {}),
    ...(body.proTip      ? { proTip:      String(body.proTip)      } : {}),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection(CATEGORIES_COLLECTION).doc(slug).set(docData, { merge: true });
    res.json({ success: true, slug });
  } catch (err) {
    console.error('[Products] saveCategory error:', err);
    res.status(500).json({ error: 'Failed to save category' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/products/categories/:slug/rename    (Admin)
// Body: { newName: string }
// Renames a category slug and moves all its products.
// ────────────────────────────────────────────────────────────────────────────
router.patch('/categories/:slug/rename', authenticate, requireAdmin, async (req, res) => {
  const oldSlug = normalizeCategorySlug(req.params.slug);
  const newSlug = normalizeCategorySlug(req.body?.newName || '');

  if (!newSlug) return res.status(400).json({ error: 'newName is required' });

  try {
    // Create / update new category doc
    await db.collection(CATEGORIES_COLLECTION).doc(newSlug).set(
      { name: req.body.newName, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    if (oldSlug !== newSlug) {
      // Move products
      const snap = await db.collection(PRODUCTS_COLLECTION)
        .where('categorySlug', '==', oldSlug)
        .get();

      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach(d =>
          batch.update(d.ref, { categorySlug: newSlug, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
        );
        batch.delete(db.collection(CATEGORIES_COLLECTION).doc(oldSlug));
        await batch.commit();
      } else {
        await db.collection(CATEGORIES_COLLECTION).doc(oldSlug).delete().catch(() => {});
      }
    }

    res.json({ success: true, oldSlug, newSlug });
  } catch (err) {
    console.error('[Products] renameCategory error:', err);
    res.status(500).json({ error: 'Failed to rename category' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/products/categories/:slug    (Admin)
// Deletes the category and moves its products to "uncategorized".
// ────────────────────────────────────────────────────────────────────────────
router.delete('/categories/:slug', authenticate, requireAdmin, async (req, res) => {
  const slug = normalizeCategorySlug(req.params.slug);

  if (!slug || slug === 'uncategorized') {
    return res.status(400).json({ error: 'Cannot delete the uncategorized category' });
  }

  try {
    const snap = await db.collection(PRODUCTS_COLLECTION)
      .where('categorySlug', '==', slug)
      .get();

    const batch = db.batch();
    snap.docs.forEach(d =>
      batch.update(d.ref, { categorySlug: 'uncategorized', updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    );
    batch.delete(db.collection(CATEGORIES_COLLECTION).doc(slug));
    await batch.commit();

    res.json({ success: true, slug, movedProducts: snap.size });
  } catch (err) {
    console.error('[Products] deleteCategory error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/products/upload-image    (Admin)
// multipart/form-data field: "image" (file), "categorySlug" (optional)
// Uploads to Firebase Storage and returns the download URL.
// ────────────────────────────────────────────────────────────────────────────
router.post('/upload-image', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const categorySlug = normalizeCategorySlug(req.body?.categorySlug || '') || 'uncategorized';
    const safeFileName = req.file.originalname.replace(/\s+/g, '_');
    const filePath     = `products/${categorySlug}/${Date.now()}_${safeFileName}`;
    const bucket       = storage.bucket();
    const file         = bucket.file(filePath);

    await file.save(req.file.buffer, {
      metadata: {
        contentType:  req.file.mimetype,
        cacheControl: 'public,max-age=31536000,immutable',
      },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('[Products] uploadImage error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;
