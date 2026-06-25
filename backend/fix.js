const fs = require('fs');
let code = fs.readFileSync('service/service_handlers.go', 'utf8');

code = code.replace(/number := app\.CustomerWhatsApp\r?\n\s+if len\(number\) == 10/g, `number := strings.ReplaceAll(app.CustomerWhatsApp, "+", "")\n\t\t\tif len(number) == 10`);

const target2 = `\t\t\tgo func() {\r
\t\t\t\tresp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))\r
\t\t\t\tif err == nil {\r
\t\t\t\t\tresp.Body.Close()\r
\t\t\t\t}\r
\t\t\t}()`;

const rep2 = `\t\t\tgo func() {
\t\t\t\tresp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
\t\t\t\tif err != nil {
\t\t\t\t\tlog.Printf("WhatsApp API Error: %v", err)
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tdefer resp.Body.Close()
\t\t\t\tbodyBytes, _ := io.ReadAll(resp.Body)
\t\t\t\tlog.Printf("WhatsApp API Response for %s: %s", number, string(bodyBytes))
\t\t\t}()`;

code = code.replace(target2, rep2);

fs.writeFileSync('service/service_handlers.go', code);
console.log("Updated service_handlers");
