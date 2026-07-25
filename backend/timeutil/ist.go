package timeutil

import "time"

const DisplayLayout = "2006-01-02 15:04:05"

var fixedIST = time.FixedZone("IST", 5*3600+30*60)

// Location returns Asia/Kolkata, with a fixed +05:30 fallback.
func Location() *time.Location {
	if loc, err := time.LoadLocation("Asia/Kolkata"); err == nil {
		return loc
	}
	return fixedIST
}

// FormatIST formats t as live India date-time: YYYY-MM-DD HH:mm:ss.
func FormatIST(t time.Time) string {
	return t.In(Location()).Format(DisplayLayout)
}

// FormatRFC3339AsIST converts a stored UTC RFC3339 timestamp to IST display.
// If parsing fails, returns the original string.
func FormatRFC3339AsIST(s string) string {
	if s == "" {
		return ""
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		t, err = time.Parse(time.RFC3339Nano, s)
	}
	if err != nil {
		return s
	}
	return FormatIST(t)
}
