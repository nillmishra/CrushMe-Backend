const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const USER_FIELDS = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        // Find all pending connection requests where the logged-in user is the recipient
        const requests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested',
        }).populate('fromUserId', USER_FIELDS); // Populate sender details

        // Return the list of connection requests
        res.json({
            message: `${requests.length} connection requests found`,
            data: requests
        });
    } catch (error) {
        res.status(500).send("Error fetching connection requests: " + error.message);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        // Find all accepted connection requests involving the logged-in user
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate("fromUserId", USER_FIELDS)
            .populate("toUserId", USER_FIELDS);

        const connectionList = connections.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            } else if (row.toUserId._id.toString() === loggedInUser._id.toString()) {
                return row.fromUserId;
            }
            return null; // safety fallback
        }).filter(Boolean); // remove null/undefined

        res.json({
            message: `${connectionList.length} connections found`,
            data: connectionList
        });


    } catch (error) {
        res.status(500).send("Error fetching connections: " + error.message);
    }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const userId = loggedInUser._id;
    const interestedIn = (loggedInUser.interestedIn || "").trim();

    // Gender filter: if "All" or empty -> no filter
    const interestFilter =
      interestedIn && interestedIn.toLowerCase() !== "all"
        ? { gender: { $regex: `^${interestedIn}$`, $options: "i" } }
        : {};

    // Hide any users you have any relationship with of these statuses
    const HIDE_STATUSES = ["accepted", "rejected", "interested", "ignored"];
    const statusRegex = HIDE_STATUSES.map((s) => new RegExp(`^${s}$`, "i"));

    // Find all requests (either direction) with those statuses
    const requestsToHide = await ConnectionRequest.find({
      status: { $in: statusRegex },
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .select("fromUserId toUserId")
      .lean();

    const hiddenUserIds = new Set([String(userId)]);
    for (const r of requestsToHide) {
      hiddenUserIds.add(String(r.fromUserId));
      hiddenUserIds.add(String(r.toUserId));
    }

    const query = {
      $and: [
        { _id: { $nin: Array.from(hiddenUserIds) } },
        ...(Object.keys(interestFilter).length ? [interestFilter] : []),
      ],
    };

    const feedUsers = await User.find(query)
      .select(USER_FIELDS) // ensure USER_FIELDS includes 'gender'
      .sort({ _id: -1 })   // stable order fixes offset paging
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      message: `${feedUsers.length} users found for feed`,
      hasMore: feedUsers.length === limit,
      data: feedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching feed: " + error.message);
  }
});

module.exports = userRouter;

