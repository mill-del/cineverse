const { WebSocketServer } = require("ws");
const Vote = require("../models/Vote.model");
const { getCurrentWeek, getCurrentYear } = require("../utils/getCurrentWeek");

const clients = new Set();

const initVoteSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.send(
      JSON.stringify({
        type: "online",
        count: clients.size,
      }),
    );
    ws.on("close", () => {
      clients.delete(ws);
    });
  });
};

const broadcastResults = async () => {
  const week = getCurrentWeek();
  const year = getCurrentYear();
  const votes = await Vote.find({ week, year });

  const data = JSON.stringify({ type: "results", votes, online: clients.size });

  clients.forEach((client) => {
    client.send(data); 
  });
};

module.exports = {initVoteSocket,broadcastResults}
