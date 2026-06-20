package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port, FrontendURL, JWTSecret string
	DBHost, DBPort, DBUser, DBPass, DBName, DBSSL string
}

func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		FrontendURL: getenv("FRONTEND_URL", "http://localhost:3000"),
		JWTSecret:   getenv("JWT_SECRET", "billsevai-dev-secret-change-me"),
		DBHost:      getenv("DB_HOST", "127.0.0.1"),
		DBPort:      getenv("DB_PORT", "3306"),
		DBUser:      getenv("DB_USER", "root"),
		DBPass:      getenv("DB_PASS", ""),
		DBName:      getenv("DB_NAME", "billsevai"),
		DBSSL:       getenv("DB_SSL", "false"),
	}
}

func (c Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&tls=%s",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName, c.DBSSL)
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
