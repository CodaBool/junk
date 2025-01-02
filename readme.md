locations
missions


Settings
  - generate lights
  - generate map (what is this?)
  - iframe settings
  
  
RED = image (slease)
Star Wars = interactive (A works & B does not work)
Alien = create (A works, needs a css)
Warhammer = interactive (A works , needs a css)
Fallout = create
Lancer = create



post /setup



POST /setup HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: en-US,en
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Cookie: next-auth.session-token=ab; session=da8a21546635d7d340256b94
Host: localhost:30000
Origin: http://localhost:30000
Referer: http://localhost:30000/setup
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Sec-GPC: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36
sec-ch-ua: "Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Linux"


{
  "action": "getPackages",
  "type": "module"
}

const response = await fetch("http://localhost:30000/setup", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
		"action": "getPackages",
		"type": "module"
	}),
});

const result = await response.json()
console.log(result)





// first, remove the '#' from the hash part of the URL
var queryString = window.location.hash.slice(1);
var params = new URLSearchParams(queryString);
var accessToken = params.get("access_token");

// you can also get the state param if you're using it:
var state = params.get("state");


const token = "vVpWPNE1znZzkLAVZD0QZIB9RQqG1yGil5qAw1NU"


https://itch.io/api/1/KEY/game/terminal/download_keys


const response = await fetch("https://itch.io/api/1/KEY/game/terminal/download_keys", {
const response = await fetch("https://itch.io/api/1/vVpWPNE1znZzkLAVZD0QZIB9RQqG1yGil5qAw1NU/credentials/info", {
const response = await fetch("https://itch.io/api/1/vVpWPNE1znZzkLAVZD0QZIB9RQqG1yGil5qAw1NU/me", {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const result = await response.json()
console.log(result)


2331647


https://itch.io/api/1/vVpWPNE1znZzkLAVZD0QZIB9RQqG1yGil5qAw1NU/game/2331647/download_keys