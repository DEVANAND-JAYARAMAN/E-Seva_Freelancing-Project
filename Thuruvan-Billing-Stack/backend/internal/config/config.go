package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	FrontendURL string
	JWTSecret   string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPass      string
	DBName      string
	DBSSL       string
}

func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		FrontendURL: getenv("FRONTEND_URL", "http://localhost:3000"),
		JWTSecret:   getenv("JWT_SECRET", "change-me-in-production"),
		DBHost:      getenv("DB_HOST", "localhost"),
		DBPort:      getenv("DB_PORT", "3306"),
		DBUser:      getenv("DB_USER", "root"),
		DBPass:      getenv("DB_PASS", ""),
		DBName:      getenv("DB_NAME", "thuruvan_billing"),
		DBSSL:       getenv("DB_SSL", "false"),
	}
}

func (c Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&tls=%s",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName, c.DBSSL)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
