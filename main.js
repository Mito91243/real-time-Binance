//import WebSocket from "ws";
//import zlib from "zlib";

let average_trade_size = 0;
let total_trade_size = 0;
let total_trade_num = 0;
let total_trade_above_1BTC = 0;
let current_btc_val = 0;
let filter_quantity = 1
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

  ws.onopen = function () {
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
  };

  // Set interval to send the message every 5 seconds with incremented ID
  setInterval(() => {
    messageId++; // Increment ID by 1 each time
    messageId++;
    ws.send(
      JSON.stringify({
        method: "GET_PROPERTY",
        params: ["combined"],
        id: messageId,
      })
    );
    //console.log("Sent message with ID:", messageId);
  }, 5000); // 5000 milliseconds = 5 seconds

  ws.onmessage = function (event) {
    if (event.data instanceof Blob) {
      // Handling binary data (Blob) which is expected if the data is compressed
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const decompressed = pako.inflate(new Uint8Array(this.result), {
            to: "string",
          });
          const message = JSON.parse(decompressed);

          // Process your message here
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
            current_btc_val = parseFloat(price);
            total_trade_num++;
            total_trade_size += parseFloat(quantity);
            if (parseFloat(quantity) > 1) {
              total_trade_above_1BTC++;
            }
            average_trade_size = total_trade_size / total_trade_num;
            //! PUT NEW FUNC
            if (quantity > 1) {
              Push_To_Table(price, quantity, tradeTime);
            }
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
          }
          // Update HTML with new data
          updateTradeStats();
        } catch (err) {
          console.log("Failed to decompress or parse the message:", err);
        }
      };
      reader.readAsArrayBuffer(event.data);
    } else {
      console.log("Received non-expected data type:", event.data);
    }
  };

  ws.onerror = function (error) {
    console.log("WebSocket Error:", error);
  };

  ws.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
  };
}

function updateTradeStats() {
  document.getElementById("average-trade-size").innerText =
    average_trade_size.toFixed(2);
  document.getElementById("total-trade-num").innerText = total_trade_num;
  document.getElementById("total-trade-above-1btc").innerText =
    total_trade_above_1BTC;
  document.getElementById("current_btc_val").innerText = current_btc_val;
}

function Push_To_Table(price, quantity, time) {
  // Find the table body in your HTML by its ID
  const tbody = document.getElementById("tradeTableBody");

  // Create a new row element
  const row = document.createElement("tr");
  row.className = "border-b border-neutral-200 white:border-white/10"; // Apply the same styling

  // Apply conditional styling based on the quantity
  if (quantity > 10) {
    row.style.backgroundColor = "green"; 
  } else if (quantity > 5) {
    row.style.backgroundColor = "lime"; 
  } else if (quantity > 50) {
    row.style.backgroundColor = "red"
  }

  // Create and append the cell for the trade index (assuming you want it)
  const indexCell = document.createElement("td");
  indexCell.className = "whitespace-nowrap px-6 py-4 font-medium";
  indexCell.textContent = tbody.children.length + 1; // Automatically number the row
  row.appendChild(indexCell);

  // Create and append the cell for the quantity
  const quantityCell = document.createElement("td");
  quantityCell.className = "whitespace-nowrap px-6 py-4";
  quantityCell.textContent = quantity + " BTC"; // Assuming quantity needs to be formatted
  row.appendChild(quantityCell);

  // Create and append the cell for the price
  const priceCell = document.createElement("td");
  priceCell.className = "whitespace-nowrap px-6 py-4";
  priceCell.textContent = price + " USD"; // Assuming price needs to be formatted
  row.appendChild(priceCell);

  // Create and append the cell for the time
  const timeCell = document.createElement("td");
  timeCell.className = "whitespace-nowrap px-6 py-4";
  timeCell.textContent = new Date(time).toLocaleString(); // Convert timestamp to readable format
  row.appendChild(timeCell);

  // Append the new row to the table body
  tbody.insertBefore(row, tbody.firstChild)
}

run_binance_aggr();
//! For console use
// Schedule run_binance_aggr to run every 2 hours
setInterval(run_binance_aggr, 7200000); // 7200000 milliseconds = 2 hours
