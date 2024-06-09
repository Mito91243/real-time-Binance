import dotenv from "dotenv";
dotenv.config();
const MY_COOKIES = process.env.COOKIE;
const trace_ID = process.env.trade_ID;
const rf_token = process.env.csrftoken;
const bnc = process.env.bnc_uuid;
const di = process.env.device_info;
const fvidid = process.env.fvideo_id;
const fvidto = process.env.fvideo_token;

const uid = `E921F42DCD4D9F6ECC0DFCE3BAB1D11A`

function Get_Position() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("bnc-uuid", bnc);
  myHeaders.append("clienttype", "web");
  myHeaders.append("content-length", "75");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("csrftoken", rf_token);
  myHeaders.append("device-info", di);
  myHeaders.append("fvideo-id", fvidid);
  myHeaders.append("fvideo-token", fvidto);
  myHeaders.append("lang", "en");
  myHeaders.append("origin", "https://www.binance.com");
  myHeaders.append("priority", "u=1, i");
  myHeaders.append(
    "referer",
    `https://www.binance.com/en/futures-activity/leaderboard/user/um?encryptedUid=${uid}`
  );
  myHeaders.append(
    "sec-ch-ua",
    '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"'
  );
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", '"macOS"');
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-origin");
  myHeaders.append(
    "user-agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
  );
  myHeaders.append("x-passthrough-token", "");
  myHeaders.append("x-trace-id", trace_ID);
  myHeaders.append("x-ui-request-trace", trace_ID);
  myHeaders.append("Cookie", MY_COOKIES);

  const raw = JSON.stringify({
    encryptedUid: `${uid}`,
    tradeType: "PERPETUAL",
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(
    "https://www.binance.com/bapi/futures/v2/private/future/leaderboard/getOtherPosition",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
}

Get_Position()