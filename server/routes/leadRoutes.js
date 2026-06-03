
const router = require('express').Router();
const Lead = require('../models/Lead');

router.post('/', async (req, res) => {
  const lead = await Lead.create(req.body);
  res.status(201).json(lead);
});

router.get('/', async (req, res) => {
  const { page = 1, limit = 10, status, sort = '-createdDate' } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const query = status ? { status } : {};

  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ leads, total, page: pageNum, limit: limitNum });
});

router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp(q, 'i');
  const leads = await Lead.find({
    $or: [
      { name: regex },
      { email: regex },
      { company: regex }
    ]
  });
  res.json({ leads, total: leads.length });
});

router.put('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lead);
});

router.delete('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  res.json(lead);
});

router.get('/stats/summary', async (req, res) => {
  const total = await Lead.countDocuments();
  const converted = await Lead.countDocuments({ status: 'Converted' });
  const lost = await Lead.countDocuments({ status: 'Lost' });
  const qualified = await Lead.countDocuments({ status: 'Qualified' });
  const contacted = await Lead.countDocuments({ status: 'Contacted' });

  res.json({ total, converted, lost, qualified, contacted });
});

module.exports = router;
