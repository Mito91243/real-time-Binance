//import WebSocket from "ws";
//import zlib from "zlib";

let average_trade_size = 0;
let total_trade_size = 0;
let total_trade_num = 0;
let total_trade_above_1BTC = 0;
let current_btc_val = 0;
let filter_quantity = 1;

let buy_num = 0;
let sell_num = 0;
let buy_average = 0;
let sell_average = 0;
let buy_total = 0;
let sell_total = 0;
let buyer_to_seller_ratio = 0;
let buyer_to_seller_average_ratio = 0;

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

          // Call handle function to process the message
          handle(message);

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

function Push_To_Table(price, quantity, time, flag) {
  // Find the table body in your HTML by its ID
  const tbody = document.getElementById("tradeTableBody");

  if (!tbody) {
    console.error("Table body element with ID 'tradeTableBody' not found.");
    return;
  }

  // Create a new row element
  const row = document.createElement("tr");
  row.className = "border-b border-neutral-200 white:border-white/10"; // Apply the same styling

  row.style.backgroundColor = flag ? "red" : "green";

  // Create and append the cell for the trade index (assuming you want it)
  const indexCell = document.createElement("td");
  indexCell.className =
    "whitespace-nowrap px-6 py-4 font-medium text-white font-bold"; // Added text-white and font-bold
  indexCell.textContent = tbody.children.length + 1; // Automatically number the row
  row.appendChild(indexCell);

  // Create and append the cell for the quantity
  const quantityCell = document.createElement("td");
  quantityCell.className = "whitespace-nowrap px-6 py-4 text-white font-bold"; // Added text-white and font-bold
  quantityCell.textContent = quantity + " BTC"; // Assuming quantity needs to be formatted
  row.appendChild(quantityCell);

  // Create and append the cell for the price
  const priceCell = document.createElement("td");
  priceCell.className = "whitespace-nowrap px-6 py-4 text-white font-bold"; // Added text-white and font-bold
  priceCell.textContent =
    (parseInt(price) * parseFloat(quantity)).toFixed(0) + " $"; // Assuming price needs to be formatted
  row.appendChild(priceCell);

  // Create and append the cell for the time
  //const timeCell = document.createElement("td");
  //timeCell.className = "whitespace-nowrap px-6 py-4 text-white font-bold"; // Added text-white and font-bold
  //timeCell.textContent = new Date(time).toLocaleString(); // Convert timestamp to readable format
  //row.appendChild(timeCell);

  // Append the new row to the table body
  tbody.insertBefore(row, tbody.firstChild);
}

function updateDataRow() {
  //const candleTimeCell = document.querySelector("td:nth-child(1)");
  const buyNumCell = document.querySelector("td:nth-child(2)");
  const sellNumCell = document.querySelector("td:nth-child(3)");
  const buyAverageCell = document.querySelector("td:nth-child(4)");
  const sellAverageCell = document.querySelector("td:nth-child(5)");
  const buyerToSellerRatioCell = document.querySelector("td:nth-child(6)");
  const buyerToSellerAverageRatioCell =
    document.querySelector("td:nth-child(7)");

  // Update the cell contents
  //candleTimeCell.textContent = candleTime;
  buyNumCell.textContent = buy_num;
  sellNumCell.textContent = sell_num;
  buyAverageCell.textContent = buy_average.toFixed(2);
  sellAverageCell.textContent = sell_average.toFixed(2);
  buyerToSellerRatioCell.textContent = buyer_to_seller_ratio.toFixed(2);
  buyerToSellerAverageRatioCell.textContent =
    buyer_to_seller_average_ratio.toFixed(2);
}

run_binance_aggr();
//! For console use
// Schedule run_binance_aggr to run every 2 hours
//setInterval(run_binance_aggr, 7200000); // 7200000 milliseconds = 2 hours

// Destructure Objects
function handle(message) {
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
    stats_calc(price, quantity, isBuyerMaker);
    if (parseFloat(quantity) > 1) {
      Push_To_Table(
        parseFloat(price),
        parseFloat(quantity),
        tradeTime,
        isBuyerMaker
      );
    }
  }
}

function stats_calc(price, quantity, isBuyerMaker) {
  quantity = parseFloat(quantity);
  price = parseFloat(price);
  current_btc_val = price;
  total_trade_num++;
  total_trade_size += quantity;
  if (quantity > 1) {
    total_trade_above_1BTC++;
  }
  average_trade_size = total_trade_size / total_trade_num;

  if (isBuyerMaker) {
    sell_num += 1;
    sell_total += quantity;
    sell_average = sell_total / sell_num;
    // If true then it's a sell order
  } else {
    buy_num += 1;
    buy_total += quantity;
    buy_average = buy_total / buy_num;
    // It's a buy order
  }
  buyer_to_seller_ratio = buy_num / sell_num;
  buyer_to_seller_average_ratio = buy_total / sell_total;
  console.log(sell_average);
  console.log(buy_average);
  console.log(buyer_to_seller_ratio);
  updateDataRow();
}


setInterval(() => {
  const tbody = document.getElementById("ratioTableBody");
  const emptyRow = createEmptyRow();
  tbody.insertBefore(emptyRow, tbody.firstChild); // Insert before the first child

  function createEmptyRow() {
    const tr = document.createElement("tr");
    tr.classList.add("border-b", "border-blue-gray-200");

    // Create 7 empty <td> elements
    for (let i = 0; i < 7; i++) {
      const td = document.createElement("td");
      td.classList.add("py-3", "px-4");
      tr.appendChild(td);
    }

    return tr;
  }
}, 60000); // 60000 milliseconds = 1 minute

