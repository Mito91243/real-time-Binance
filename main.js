import WebSocket from "ws";
import zlib from "zlib";

function run_okx_aggr() {
  // Replace 'wss://your-websocket-url' with your actual WebSocket server URL
  const ws = new WebSocket("wss://wspri.okx.com:8443/ws/v5/ipublic");

  ws.on("open", function open() {
    console.log("Connected to the WebSocket server.");

    ws.send(
      JSON.stringify({
        op: "subscribe",
        args: [
          { channel: "instruments", instType: "SPOT" },
          { channel: "instruments", instType: "FUTURES" },
          { channel: "instruments", instType: "SWAP" },
          { channel: "instruments", instType: "OPTION" },
          { channel: "tickers", instId: "BTC-USDT-SWAP" },
          { channel: "mark-price", instId: "BTC-USDT-SWAP" },
          { channel: "index-tickers", instId: "BTC-USDT" },
          { channel: "funding-rate", instId: "BTC-USDT-SWAP" },
          {
            channel: "estimated-price",
            instType: "SWAP",
            instFamily: "BTC-USDT",
          },
          { channel: "open-interest", instId: "BTC-USDT-SWAP" },
          { channel: "price-limit", instId: "BTC-USDT-SWAP", instType: "SWAP" },
          { channel: "books-grouped", instId: "BTC-USDT-SWAP", grouping: "10" },
          { channel: "books-grouped", instId: "BTC-USDT-SWAP", grouping: "10" },
          { channel: "aggregated-trades", instId: "BTC-USDT-SWAP" },
          { channel: "notable-market-changes", entityId: "1" },
          { channel: "candle15m", instId: "BTC-USDT-SWAP" },
        ],
      })
    );

    ws.send(
      JSON.stringify({
        op: "subscribe",
        args: [{ channel: "cup-tickers-1s", ccy: "BTC" }],
      })
    );
  });

  ws.on("message", function incoming(data) {
    try {
      let message = JSON.parse(data);

      // Check if the message has the 'arg' property and if it's for 'aggregated-trades'
      if (message.arg && message.arg.channel === "aggregated-trades") {
        console.log("Aggregated Trades Data Received:");

        // Check if 'data' property exists and is an array
        if (Array.isArray(message.data)) {
          message.data.forEach((trade) => {
            console.log(`Instrument ID: ${trade.instId}`);
            console.log(`First ID: ${trade.fId}`);
            console.log(`Last ID: ${trade.lId}`);
            console.log(`Price: ${trade.px}`);
            console.log(`Size: ${trade.sz}`);
            console.log(`Side: ${trade.side}`);
            console.log(`Timestamp: ${new Date(parseInt(trade.ts))}`);
            console.log("---");
          });
        } else {
          console.log(
            "Data property is missing or not in expected format:",
            message.data
          );
        }
      }
    } catch (e) {
      console.log("Error parsing message or handling data:", e);
    }
  });

  ws.on("close", () => {
    console.log("Disconnected from the WebSocket server");
  });

  ws.on("error", (error) => {
    console.log("WebSocket Error:", error);
  });
  /*

// Create a WebSocket connection to the server
const ws = new WebSocket('wss://wspri.okx.com:8443/ws/v5/ipublic');

// Event handler when the connection is opened
ws.onopen = function() {
    console.log('Connected to the WebSocket server.');

    // Send the first subscription message
    ws.send(JSON.stringify({
        "op": "subscribe",
        "args": [
            {"channel": "instruments", "instType": "SPOT"},
            {"channel": "instruments", "instType": "FUTURES"},
            {"channel": "instruments", "instType": "SWAP"},
            {"channel": "instruments", "instType": "OPTION"},
            {"channel": "tickers", "instId": "BTC-USDT-SWAP"},
            {"channel": "mark-price", "instId": "BTC-USDT-SWAP"},
            {"channel": "index-tickers", "instId": "BTC-USDT"},
            {"channel": "funding-rate", "instId": "BTC-USDT-SWAP"},
            {"channel": "estimated-price", "instType": "SWAP", "instFamily": "BTC-USDT"},
            {"channel": "open-interest", "instId": "BTC-USDT-SWAP"},
            {"channel": "price-limit", "instId": "BTC-USDT-SWAP", "instType": "SWAP"},
            {"channel": "books-grouped", "instId": "BTC-USDT-SWAP", "grouping": "10"},
            {"channel": "books-grouped", "instId": "BTC-USDT-SWAP", "grouping": "0.1"},
            {"channel": "aggregated-trades", "instId": "BTC-USDT-SWAP"},
            {"channel": "notable-market-changes", "entityId": "1"},
            {"channel": "candle15m", "instId": "BTC-USDT-SWAP"}
        ]
    }));

    // Send the second subscription message
    ws.send(JSON.stringify({
        "op": "subscribe",
        "args": [{"channel": "cup-tickers-3s", "ccy": "BTC"}]
    }));
};

// Event handler for incoming messages
ws.onmessage = function(event) {
    console.log('Message from server ', event.data);
};

// Handle any errors that occur
ws.onerror = function(error) {
    console.log('WebSocket Error: ', error);
};

// Handle the WebSocket connection closing
ws.onclose = function(event) {
    console.log('WebSocket connection closed: ', event);
};

*/
}

function run_binance_aggr() {
  let messageId = 1; // Initialize message ID
  const ws = new WebSocket("wss://sfstream.binance.com/stream");

  ws.on("open", function () {
    console.log("Connected to the WebSocket server.");

    // Send the subscription message
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: [
          "!contractInfo",
          "!miniTicker@arr",
          "btcusdt@aggSnap",
          "btcusdt@depth@500ms",
          "btcusdt@markPrice",
          "btcusdt_perpetual@continuousKline_15m",
          "btcusdt@aggTrade",
        ],
        id: 3,
      })
    );
  });

  // Set interval to send the message every 5 seconds with incremented ID
  setInterval(() => {
    messageId++; // Increment ID by 1 each time
    ws.send(
      JSON.stringify({
        method: "GET_PROPERTY",
        params: ["combined"],
        id: messageId,
      })
    );
    console.log("Sent message with ID:", messageId);
  }, 5000); // 5000 milliseconds = 5 seconds

  ws.onmessage = function (event) {
    if (event.data instanceof Buffer) {
      // Convert Buffer to base64
      const base64Data = event.data.toString("base64");

      // Decode base64 using zlib
      const buffer = Buffer.from(base64Data, "base64");
      zlib.unzip(buffer, (err, buffer) => {
        if (err) {
          console.log("Error decoding message:", err);
        } else {
          // Assuming the data received is a JSON string
          const message = JSON.parse(buffer.toString());

          // Check the type of the message and destructure accordingly
          if (message.e === "aggTrade") {
            const {
              e: eventType,
              E: eventTime,
              a: aggTradeId,
              s: symbol,
              p: price,
              q: quantity,
              f: firstTradeId,
              l: lastTradeId,
              T: tradeTime,
              m: isBuyerMaker,
            } = message;

            console.log(
              `AggTrade : Symbol: ${symbol}, Price: ${price}, Quantity: ${quantity}`
            );
          } else if (message.e === "markPriceUpdate") {
            const {
              e: eventType,
              E: eventTime,
              s: symbol,
              p: price,
              P: indexPrice,
              i: interestRate,
              r: fundingRate,
              T: nextFundingTime,
            } = message;

            console.log(
              `MarkPriceUpdate : Symbol: ${symbol}, Price: ${price} , Timestamp: ${eventTime}`
            );
          }
        }
      });
    } else {
      console.log("Received non-buffer data:", event.data);
    }
  };

  ws.onerror = function (error) {
    console.log("WebSocket Error:", error);
  };

  ws.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
  };
}

run_binance_aggr();
//! For console use
