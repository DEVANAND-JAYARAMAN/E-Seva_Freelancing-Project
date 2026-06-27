const fs = require('fs');

let code = fs.readFileSync('backend/main.go', 'utf8');
code = code.replace(`walletV1.POST("/recharge/webhook", service.RechargeWebhook)`, `walletV1.POST("/recharge/webhook", service.RechargeWebhook)\n\t\t\t\twalletV1.Any("/recharge/return", service.RechargeReturn)`);
fs.writeFileSync('backend/main.go', code);
console.log('Added RechargeReturn');

let serviceCode = fs.readFileSync('backend/service/service_handlers.go', 'utf8');
const returnFunc = `
// RechargeReturn handles the redirect from Mugavai payment gateway
func RechargeReturn(c *gin.Context) {
	// Redirect back to the wallet page
	redirectUrl := c.Query("redirect_url")
	if redirectUrl == "" {
		redirectUrl = "https://thuruvancommunications.com/dashboard/wallet?payment_status=success"
	}
	c.Redirect(http.StatusFound, redirectUrl)
}
`;
serviceCode = serviceCode + returnFunc;
fs.writeFileSync('backend/service/service_handlers.go', serviceCode);
console.log('Added RechargeReturn to service_handlers.go');
