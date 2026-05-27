//
async function checkLiveCode() {
  const res = await fetch('https://igonursery.com/');
  const html = await res.text();
  const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
  if (scriptMatch) {
     const jsUrl = 'https://igonursery.com' + scriptMatch[1];
     console.log("Fetching JS:", jsUrl);
     const jsRes = await fetch(jsUrl);
     const jsText = await jsRes.text();
     if (jsText.includes('PHP fallback')) {
       console.log("LIVE CODE HAS FALLBACK!");
     } else {
       console.log("LIVE CODE IS OUTDATED!");
     }
  } else {
     console.log("Could not find main JS script in HTML.");
  }
}
checkLiveCode();
