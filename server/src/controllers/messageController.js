const mongoose = require('mongoose');
const Conversation = require('@src/models/Conversation');
const Message = require('@src/models/Message');

async function getOrCreateConversation(a, b) {
  const members = [String(a), String(b)];
  const existing = await Conversation.findOne({ members: { $all: members } });
  if (existing) return existing;
  const created = await Conversation.create({ members, lastMessage: '' });
  return created;
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

exports.sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text = '' } = req.body || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }
    if (!text || String(text).trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: text is required.' });
    }

    const conversation = await getOrCreateConversation(req.userId, userId);

    const message = await Message.create({
      conversation: conversation._id,
      from: req.userId,
      to: userId,
      text: String(text)
    });

    conversation.lastMessage = String(text);
    await conversation.save(); // updates updatedAt

    return res.json({ ok: true, data: { message, conversation } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `SEND_MESSAGE_FAILED: ${err.message}` });
  }
};

exports.getThread = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }

    const conv = await Conversation.findOne({ members: { $all: [String(req.userId), String(userId)] } });
    if (!conv) {
      return res.json({ ok: true, data: { page: 1, limit: 10, total: 0, messages: [] } });
    }

    const { page, limit, skip } = (function (q) {
      const p = parseInt(q.page, 10) || 1;
      const l = Math.max(1, Math.min(50, parseInt(q.limit, 10) || 10));
      return { page: p, limit: l, skip: (p - 1) * l };
    })(req.query || {});

    const [items, total] = await Promise.all([
      Message.find({ conversation: conv._id }).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Message.countDocuments({ conversation: conv._id })
    ]);

    return res.json({ ok: true, data: { page, limit, total, messages: items } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_THREAD_FAILED: ${err.message}` });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ members: { $in: [String(req.userId)] } })
      .sort({ updatedAt: -1 })
      .populate('members', 'username name avatarUrl');

    return res.json({ ok: true, data: { conversations: convs } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_CONVERSATIONS_FAILED: ${err.message}` });
  }
};
