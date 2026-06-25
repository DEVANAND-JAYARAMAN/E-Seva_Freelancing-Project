const fs = require('fs');

let sCode = fs.readFileSync('backend/service/service_handlers.go', 'utf8');

// Replace the number parsing logic
sCode = sCode.replace(
    /number := app\.CustomerWhatsApp\s*\n\s*if len\(number\) == 10 \{\s*\n\s*number = "91" \+ number\s*\n\s*\}/,
    `number := strings.ReplaceAll(app.CustomerWhatsApp, "+", "")
			if len(number) == 10 {
				number = "91" + number
			}`
);

// Replace the go func HTTP post block
sCode = sCode.replace(
    /go func\(\) \{\s*\n\s*resp, err := http\.Post\(url, "application\/json", bytes\.NewBuffer\(jsonValue\)\)\s*\n\s*if err == nil \{\s*\n\s*resp\.Body\.Close\(\)\s*\n\s*\}\s*\n\s*\}\(\)/g,
    `go func() {
				resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
				if err != nil {
					log.Printf("WhatsApp Error: %v", err)
					return
				}
				defer resp.Body.Close()
				bodyBytes, _ := io.ReadAll(resp.Body)
				log.Printf("WhatsApp API Response for %s: %s", number, string(bodyBytes))
			}()`
);

fs.writeFileSync('backend/service/service_handlers.go', sCode);
console.log('Fixed service_handlers.go');
