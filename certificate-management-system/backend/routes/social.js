import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import FriendRequest from '../models/FriendRequest.js';
import Message from '../models/Message.js';

const router = express.Router();

const getFriendUserIds = async (userId) => {
  const accepted = await FriendRequest.find({
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }]
  }).lean();

  return accepted.map((r) =>
    r.requester.toString() === userId.toString() ? r.recipient.toString() : r.requester.toString()
  );
};

const areFriends = async (a, b) => {
  const relationship = await FriendRequest.findOne({
    status: 'accepted',
    $or: [
      { requester: a, recipient: b },
      { requester: b, recipient: a }
    ]
  }).lean();
  return Boolean(relationship);
};

router.get('/users', protect, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const regex = new RegExp(String(search).trim(), 'i');

    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [{ name: regex }, { email: regex }]
    })
      .select('name email role avatar')
      .limit(30)
      .lean();

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/requests/:toUserId', protect, async (req, res) => {
  try {
    const { toUserId } = req.params;

    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const recipient = await User.findById(toUserId).lean();
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const existingPending = await FriendRequest.findOne({
      status: 'pending',
      $or: [
        { requester: req.user._id, recipient: toUserId },
        { requester: toUserId, recipient: req.user._id }
      ]
    });

    if (existingPending) {
      return res.status(400).json({ success: false, message: 'Friend request already pending' });
    }

    const alreadyFriends = await areFriends(req.user._id, toUserId);
    if (alreadyFriends) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    const request = await FriendRequest.create({
      requester: req.user._id,
      recipient: toUserId,
      status: 'pending'
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/requests', protect, async (req, res) => {
  try {
    const incoming = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
      .populate('requester', 'name email role avatar')
      .sort({ createdAt: -1 });

    const outgoing = await FriendRequest.find({ requester: req.user._id, status: 'pending' })
      .populate('recipient', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, incoming, outgoing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/requests/:requestId/accept', protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    request.status = 'accepted';
    await request.save();

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/requests/:requestId/reject', protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/friends', protect, async (req, res) => {
  try {
    const friendIds = await getFriendUserIds(req.user._id);
    const friends = await User.find({ _id: { $in: friendIds }, isActive: true })
      .select('name email role avatar')
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/docs/my', protect, async (req, res) => {
  try {
    const docs = await Certificate.find({ userId: req.user._id })
      .select('certificateId courseName recipientName pdfUrl createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/messages/:friendId', protect, async (req, res) => {
  try {
    const { friendId } = req.params;

    const allowed = await areFriends(req.user._id, friendId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Chat allowed only with accepted friends' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: friendId },
        { sender: friendId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('sharedCertificate', 'certificateId courseName recipientName pdfUrl')
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/messages/:friendId', protect, async (req, res) => {
  try {
    const { friendId } = req.params;
    const { text = '', certificateId } = req.body;

    const allowed = await areFriends(req.user._id, friendId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Chat allowed only with accepted friends' });
    }

    let sharedCertificate = null;

    if (certificateId) {
      const cert = await Certificate.findById(certificateId).lean();
      if (!cert) {
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }
      if (cert.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only share your own uploaded documents' });
      }
      sharedCertificate = cert._id;
    }

    if (!String(text).trim() && !sharedCertificate) {
      return res.status(400).json({ success: false, message: 'Message text or shared document is required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: friendId,
      text: String(text).trim(),
      sharedCertificate
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('sharedCertificate', 'certificateId courseName recipientName pdfUrl');

    const io = req.app.get('io');
    if (io) {
      io.emit('chat_message', {
        sender: req.user._id.toString(),
        receiver: friendId,
        message: populated
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
