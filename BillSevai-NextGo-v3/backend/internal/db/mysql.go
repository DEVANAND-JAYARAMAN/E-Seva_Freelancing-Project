package db

import (
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func Connect(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	for i := 0; i < 5; i++ {
		if err = db.Ping(); err == nil {
			return db, nil
		}
		time.Sleep(time.Second * 2)
	}
	return nil, err
}
