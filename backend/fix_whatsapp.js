const fs = require('fs');
let code = fs.readFileSync('service/service_handlers.go', 'utf8');

// The original Waziper API format is typically api/send
code = code.replace(/url := "https:\/\/mugavaiwapp\.in\.net\/send-message"/g, 'url := "https://mugavaiwapp.in.net/api/send"');

// Replace the struct literal map with the proper new payload
code = code.replace(/payload := map\[string\]string\{\s*"api_key":\s*apiKey,\s*"sender":\s*senderDevice,\s*"number":\s*app\.CustomerWhatsApp,\s*"message":\s*message,\s*\}/g, 
`			number := app.CustomerWhatsApp
			if len(number) == 10 {
				number = "91" + number
			}
			payload := map[string]string{
				"access_token": apiKey,
				"instance_id":  senderDevice,
				"number":       number,
				"type":         "text",
				"message":      message,
			}`);

// Same for the generic sendWhatsAppMessage function
code = code.replace(/payload := map\[string\]string\{\s*"api_key":\s*apiKey,\s*"sender":\s*senderDevice,\s*"number":\s*customerNumber,\s*"message":\s*message,\s*\}/g,
`	number := customerNumber
	if len(number) == 10 {
		number = "91" + number
	}
	payload := map[string]string{
		"access_token": apiKey,
		"instance_id":  senderDevice,
		"number":       number,
		"type":         "text",
		"message":      message,
	}`);

fs.writeFileSync('service/service_handlers.go', code);
console.log('Fixed Whatsapp API payload');
