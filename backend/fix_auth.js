const fs = require('fs');

let code = fs.readFileSync('auth/auth_handlers.go', 'utf8');

// Add missing imports
if (!code.includes('"bytes"')) {
    code = code.replace('"context"', '"bytes"\n\t"encoding/json"\n\t"fmt"\n\t"io"\n\t"os"\n\t"strings"\n\t"context"');
}

// Add the notification logic at the end of Signup function
const hook = `"userId":  userId,
	})
}`;

const replacement = `"userId":  userId,
	})

	// Send WhatsApp notification
	go func() {
		apiKey := os.Getenv("WHATSAPP_API_KEY")
		senderDevice := os.Getenv("WHATSAPP_SENDER_DEVICE")

		if apiKey != "" && senderDevice != "" {
			url := "https://mugavaiwapp.in.net/api/send"
			number := strings.ReplaceAll(req.Mobile, "+", "")
			if len(number) == 10 {
				number = "91" + number
			}
			message := fmt.Sprintf("Dear %s,\\nYou have successfully registered as a %s in E-Seva. Welcome aboard!", req.FullName, req.Role)
			
			payload := map[string]string{
				"access_token": apiKey,
				"instance_id":  senderDevice,
				"number":       number,
				"type":         "text",
				"message":      message,
			}
			jsonValue, _ := json.Marshal(payload)
			
			resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
			if err != nil {
				log.Printf("WhatsApp Auth Notification Error: %v", err)
				return
			}
			defer resp.Body.Close()
			bodyBytes, _ := io.ReadAll(resp.Body)
			log.Printf("WhatsApp API Response for Auth %s: %s", number, string(bodyBytes))
		}
	}()
}`;

if (!code.includes('WhatsApp Auth Notification')) {
    code = code.replace(hook, replacement);
    fs.writeFileSync('auth/auth_handlers.go', code);
    console.log("Updated auth_handlers.go");
} else {
    console.log("Already updated");
}
