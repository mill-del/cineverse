const { WebSocketServer } = require("ws");
const url = require("url");
const jwt = require("jsonwebtoken");
const Vote = require("../models/Vote.model");
const { getCurrentWeek, getCurrentYear } = require("../utils/getCurrentWeek");

// Vote clients
const voteClients = new Set();

// Club rooms: clubId -> Set<{ ws, userId, username }>
const clubRooms = new Map();

const initVoteSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname, query } = url.parse(req.url, true);

    if (pathname === '/ws/votes') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleVoteConnection(ws);
      });
    } else if (pathname?.startsWith('/ws/clubs/')) {
      const clubId = pathname.split('/').pop();
      // Auth via token query param
      let user = null;
      if (query.token) {
        try {
          user = jwt.verify(query.token, process.env.JWT_SECRET);
        } catch {}
      }
      if (!user) {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleClubConnection(ws, clubId, user);
      });
    } else {
      socket.destroy();
    }
  });
};

// VOTES
const handleVoteConnection = (ws) => {
  voteClients.add(ws);
  ws.send(JSON.stringify({ type: "online", count: voteClients.size }));

  // Broadcast online count to everyone
  broadcastOnlineCount();

  ws.on("close", () => {
    voteClients.delete(ws);
    broadcastOnlineCount();
  });
};

const broadcastOnlineCount = () => {
  const data = JSON.stringify({ type: "online", count: voteClients.size });
  voteClients.forEach(c => {
    try { c.send(data); } catch {}
  });
};

const broadcastResults = async () => {
  const week = getCurrentWeek();
  const year = getCurrentYear();
  const votes = await Vote.find({ week, year });
  const data = JSON.stringify({ type: "results", votes, online: voteClients.size });
  voteClients.forEach(client => {
    try { client.send(data); } catch {}
  });
};

// CLUBS
const handleClubConnection = (ws, clubId, user) => {
  if (!clubRooms.has(clubId)) {
    clubRooms.set(clubId, new Set());
  }

  const member = { ws, userId: user.id, username: user.username };
  clubRooms.get(clubId).add(member);

  // Send current online list to everyone in this club
  broadcastOnlineUsers(clubId);

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'chat') {
        // Live chat — broadcast to all in club
        const chatMsg = {
          type: 'chat',
          text: msg.text,
          userId: user.id,
          username: user.username,
          timestamp: Date.now()
        };
        broadcastToClub(clubId, chatMsg);
      }
    } catch {}
  });

  ws.on("close", () => {
    const room = clubRooms.get(clubId);
    if (room) {
      room.delete(member);
      if (room.size === 0) clubRooms.delete(clubId);
      else broadcastOnlineUsers(clubId);
    }
  });
};

const broadcastOnlineUsers = (clubId) => {
  const room = clubRooms.get(clubId);
  if (!room) return;

  // Unique users
  const usersMap = new Map();
  room.forEach(m => {
    if (!usersMap.has(m.userId)) {
      usersMap.set(m.userId, { _id: m.userId, username: m.username });
    }
  });
  const users = Array.from(usersMap.values());

  const data = JSON.stringify({ type: 'online_users', users });
  room.forEach(m => {
    try { m.ws.send(data); } catch {}
  });
};

const broadcastToClub = (clubId, payload) => {
  const room = clubRooms.get(String(clubId));
  if (!room) return;
  const data = JSON.stringify(payload);
  room.forEach(m => {
    try { m.ws.send(data); } catch {}
  });
};

module.exports = { initVoteSocket, broadcastResults, broadcastToClub };