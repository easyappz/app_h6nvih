const mongoose = require('mongoose');
const Post = require('@src/models/Post');
const User = require('@src/models/User');

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

exports.createPost = async (req, res) => {
  try {
    const { text = '', images = [] } = req.body || {};
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'UNAUTHORIZED: Missing user.' });
    }
    if (images && !Array.isArray(images)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: images must be an array of strings.' });
    }

    const post = await Post.create({
      author: req.userId,
      text: String(text || ''),
      images: (images || []).map(String)
    });

    return res.json({ ok: true, data: { post } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `CREATE_POST_FAILED: ${err.message}` });
  }
};

exports.getFeed = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'UNAUTHORIZED: Missing user.' });
    }

    const { page, limit, skip } = parsePagination(req.query);

    const me = await User.findById(req.userId).select('friends');
    if (!me) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND: Current user not found.' });
    }

    const authors = [req.userId, ...me.friends.map(String)];

    const [items, total] = await Promise.all([
      Post.find({ author: { $in: authors } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ author: { $in: authors } })
    ]);

    return res.json({ ok: true, data: { page, limit, total, posts: items } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_FEED_FAILED: ${err.message}` });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }

    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      Post.find({ author: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments({ author: userId })
    ]);

    return res.json({ ok: true, data: { page, limit, total, posts: items } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_USER_POSTS_FAILED: ${err.message}` });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: post id is invalid.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'POST_NOT_FOUND: Post does not exist.' });
    }

    const hasLiked = post.likes.some(u => String(u) === String(req.userId));
    if (hasLiked) {
      post.likes.pull(req.userId);
    } else {
      post.likes.addToSet(req.userId);
    }
    await post.save();

    return res.json({ ok: true, data: { post } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `LIKE_POST_FAILED: ${err.message}` });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text = '' } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: post id is invalid.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'POST_NOT_FOUND: Post does not exist.' });
    }

    post.comments.push({ user: req.userId, text: String(text || ''), createdAt: new Date() });
    await post.save();

    return res.json({ ok: true, data: { post } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `ADD_COMMENT_FAILED: ${err.message}` });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: post id is invalid.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'POST_NOT_FOUND: Post does not exist.' });
    }

    if (String(post.author) !== String(req.userId)) {
      return res.status(403).json({ ok: false, error: 'NOT_OWNER: You can delete only your own post.' });
    }

    await Post.deleteOne({ _id: id });

    return res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `DELETE_POST_FAILED: ${err.message}` });
  }
};
